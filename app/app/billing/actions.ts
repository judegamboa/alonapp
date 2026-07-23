"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { devPlanSwitchAllowed } from "@/lib/paddle";
import { PLANS } from "@/lib/workspace";

/**
 * Local-only plan switch, so tier limits can be exercised before Paddle exists.
 *
 * Guarded twice: `devPlanSwitchAllowed()` is checked here as well as at the
 * render site, because hiding a form in the UI does not stop anyone from
 * posting to the action. In production this returns immediately.
 */
export async function setPlanForDev(formData: FormData) {
  if (!devPlanSwitchAllowed()) return;

  const plan = z.enum(PLANS).safeParse(formData.get("plan"));
  if (!plan.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS-scoped read: confirms this user actually owns the workspace before the
  // service-role write below bypasses RLS entirely.
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .maybeSingle();
  if (!workspace) return;

  // `authenticated` has no grant on `plan` since 20260723000600, so the plan
  // can only move through service-role — same door the Paddle webhook uses.
  const admin = createAdminClient();
  await admin
    .from("workspaces")
    .update({ plan: plan.data })
    .eq("id", workspace.id);

  revalidatePath("/app");
  revalidatePath("/app/settings");
}
