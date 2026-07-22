import { createClient } from "@/lib/supabase/server";

export type Workspace = {
  id: string;
  name: string;
  logo_url: string | null;
  brand_color: string | null;
  plan: "free" | "starter" | "pro";
};

export const PLAN_LIMITS: Record<Workspace["plan"], number | null> = {
  free: 1,
  starter: 5,
  pro: null, // unlimited
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
