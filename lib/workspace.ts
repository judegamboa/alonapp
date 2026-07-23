import { createClient } from "@/lib/supabase/server";

export type Workspace = {
  id: string;
  name: string;
  logo_url: string | null;
  brand_color: string | null;
  plan: "free" | "starter" | "pro";
};

export const PLANS = ["free", "starter", "pro"] as const;

export const PLAN_LIMITS: Record<Workspace["plan"], number | null> = {
  free: 1,
  starter: 5,
  pro: null, // unlimited
};

export const PLAN_LABELS: Record<Workspace["plan"], string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

// Pricing is locked in docs/SPEC.md and mirrored on the marketing page.
export const PLAN_PRICES: Record<Workspace["plan"], string> = {
  free: "₱0",
  starter: "₱499",
  pro: "₱1,499",
};

export const PLAN_BLURBS: Record<Workspace["plan"], string> = {
  free: "1 client portal, with an Alon watermark.",
  starter: "5 client portals, your logo and colors, no watermark.",
  pro: "Unlimited client portals, your logo and colors, priority support, custom subdomain (coming soon).",
};

/** The signed-in freelancer's workspace, or null if they haven't created one. */
export async function getWorkspace(): Promise<Workspace | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workspaces")
    .select("id, name, logo_url, brand_color, plan")
    .maybeSingle();
  return data;
}
