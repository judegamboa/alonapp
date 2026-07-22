import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getWorkspace, PLAN_LIMITS } from "@/lib/workspace";

export default async function DashboardPage() {
  const workspace = await getWorkspace();
  if (!workspace) redirect("/app/onboarding");

  const supabase = await createClient();
  const { count } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .is("archived_at", null);
  const used = count ?? 0;
  const limit = PLAN_LIMITS[workspace.plan];

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        {workspace.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={workspace.logo_url}
            alt=""
            className="h-10 w-10 rounded-md object-contain"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge
              variant="outline"
              style={
                workspace.brand_color
                  ? { borderColor: workspace.brand_color, color: workspace.brand_color }
                  : undefined
              }
            >
              {workspace.plan} plan
            </Badge>
            <span>
              {used} of {limit ?? "unlimited"} client portal
              {limit === 1 ? "" : "s"} used
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>
            Invite your first client to give them a branded portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Client management arrives in the next milestone — the portal
          foundation (auth, workspace, branding) is ready.
        </CardContent>
      </Card>
    </main>
  );
}
