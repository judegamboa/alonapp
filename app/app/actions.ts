"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

const brandColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Brand color must be a hex value like #1E90FF");

const workspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(60, "Workspace name must be at most 60 characters"),
  brandColor: brandColorSchema,
});

const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const LOGO_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export async function createWorkspace(formData: FormData) {
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    brandColor: formData.get("brandColor"),
  });
  if (!parsed.success) {
    redirect(
      `/app/onboarding?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Client-role users must never become workspace owners.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    const claims = JSON.parse(
      Buffer.from(session.access_token.split(".")[1], "base64").toString()
    );
    if (claims.user_role === "client") redirect("/");
  }

  const { error } = await supabase.from("workspaces").insert({
    owner_id: user.id,
    name: parsed.data.name,
    brand_color: parsed.data.brandColor,
  });
  if (error) {
    const message = error.message.includes("duplicate")
      ? "You already have a workspace"
      : "Could not create the workspace, please try again";
    redirect(`/app/onboarding?error=${encodeURIComponent(message)}`);
  }

  // Role mapping for JWT claims; user_roles is service-role-only by design.
  const admin = createAdminClient();
  await admin
    .from("user_roles")
    .upsert({ user_id: user.id, role: "freelancer" });

  redirect("/app");
}

export async function updateBranding(formData: FormData): Promise<ActionResult> {
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    brandColor: formData.get("brandColor"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, logo_url")
    .maybeSingle();
  if (!workspace) return { ok: false, error: "No workspace found" };

  let logoUrl = workspace.logo_url;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const ext = LOGO_TYPES[logo.type];
    if (!ext) {
      return { ok: false, error: "Logo must be a PNG, JPG, WebP, or SVG" };
    }
    if (logo.size > LOGO_MAX_BYTES) {
      return { ok: false, error: "Logo must be 2 MB or smaller" };
    }
    const path = `${workspace.id}/logo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(path, logo, { contentType: logo.type });
    if (uploadError) {
      return { ok: false, error: "Logo upload failed, please try again" };
    }
    logoUrl = supabase.storage.from("branding").getPublicUrl(path).data
      .publicUrl;
  }

  const { error } = await supabase
    .from("workspaces")
    .update({
      name: parsed.data.name,
      brand_color: parsed.data.brandColor,
      logo_url: logoUrl,
    })
    .eq("id", workspace.id);
  if (error) {
    return { ok: false, error: "Could not save changes, please try again" };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true };
}
