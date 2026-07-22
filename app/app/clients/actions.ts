"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS, type Workspace } from "@/lib/workspace";
import { portalSlug } from "@/lib/slug";

const newClientSchema = z.object({
  name: z.string().trim().min(2, "Client name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
});

export type InviteResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

async function requireWorkspace() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, plan")
    .maybeSingle();
  if (!workspace) redirect("/app/onboarding");
  return { supabase, user, workspace: workspace as Pick<Workspace, "id" | "name" | "plan"> };
}

export async function addClient(formData: FormData) {
  const parsed = newClientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    redirect(`/app?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const { supabase, workspace } = await requireWorkspace();

  // Tier limit, enforced server-side before portal creation.
  const limit = PLAN_LIMITS[workspace.plan];
  if (limit !== null) {
    const { count } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .is("archived_at", null);
    if ((count ?? 0) >= limit) {
      redirect(`/app?error=limit`);
    }
  }

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      workspace_id: workspace.id,
      name: parsed.data.name,
      email: parsed.data.email,
      portal_slug: portalSlug(parsed.data.name),
    })
    .select()
    .single();
  if (error) {
    redirect(
      `/app?error=${encodeURIComponent("Could not add the client, please try again")}`
    );
  }

  // Create (or find) the client's auth user and map it to this client row.
  // user_roles is service-role-only, and a user maps to exactly one client.
  const admin = createAdminClient();
  let userId: string | null = null;
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: parsed.data.email,
      email_confirm: true,
    });
  if (createError) {
    const { data: existing } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });
    userId =
      existing?.users.find((u) => u.email === parsed.data.email)?.id ?? null;
  } else {
    userId = created.user.id;
  }

  if (userId) {
    const { data: existingRole } = await admin
      .from("user_roles")
      .select("client_id, role")
      .eq("user_id", userId)
      .maybeSingle();
    if (existingRole && existingRole.client_id !== client.id) {
      // Email already tied to another portal (or a freelancer account).
      await supabase.from("clients").delete().eq("id", client.id);
      redirect(
        `/app?error=${encodeURIComponent("That email is already used by another account")}`
      );
    }
    if (!existingRole) {
      await admin
        .from("user_roles")
        .insert({ user_id: userId, role: "client", client_id: client.id });
    }
  }

  revalidatePath("/app");
  redirect(`/app/clients/${client.id}`);
}

export async function generateInviteLink(
  clientId: string
): Promise<InviteResult> {
  const { supabase } = await requireWorkspace();

  // RLS scopes this read to the freelancer's own workspace.
  const { data: client } = await supabase
    .from("clients")
    .select("id, email, portal_slug")
    .eq("id", clientId)
    .maybeSingle();
  if (!client) return { ok: false, error: "Client not found" };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: client.email,
  });
  if (error || !data.properties?.hashed_token) {
    return { ok: false, error: "Could not create an invite link, try again" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${appUrl}/auth/confirm?token_hash=${data.properties.hashed_token}&type=magiclink&next=${encodeURIComponent(`/p/${client.portal_slug}`)}`;
  return { ok: true, url };
}

export async function setClientArchived(clientId: string, archived: boolean) {
  const { supabase } = await requireWorkspace();
  await supabase
    .from("clients")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", clientId);
  revalidatePath("/app");
  revalidatePath(`/app/clients/${clientId}`);
}
