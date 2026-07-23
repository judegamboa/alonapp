import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { devPlanSwitchAllowed, paddleConfigured } from "@/lib/paddle";
import {
  PLANS,
  PLAN_BLURBS,
  PLAN_LABELS,
  PLAN_LIMITS,
  PLAN_PRICES,
  type Workspace,
} from "@/lib/workspace";
import { setPlanForDev } from "../billing/actions";

export async function BillingSection({ workspace }: { workspace: Workspace }) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .is("archived_at", null);
  const used = count ?? 0;

  const limit = PLAN_LIMITS[workspace.plan];
  const billingLive = paddleConfigured();
  const showDevSwitch = devPlanSwitchAllowed();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>
          You&rsquo;re on the {PLAN_LABELS[workspace.plan]} plan — {used} of{" "}
          {limit ?? "unlimited"} client portal{limit === 1 ? "" : "s"} used.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const current = plan === workspace.plan;
            return (
              <div
                key={plan}
                className={`rounded-lg border p-4 ${
                  current ? "border-primary bg-accent" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{PLAN_LABELS[plan]}</p>
                  {current && <Badge variant="outline">Current</Badge>}
                </div>
                <p className="mt-1 font-mono text-lg font-semibold">
                  {PLAN_PRICES[plan]}
                  {plan !== "free" && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {PLAN_BLURBS[plan]}
                </p>
              </div>
            );
          })}
        </div>

        {billingLive ? (
          <div>
            <Button type="submit">Manage subscription</Button>
          </div>
        ) : (
          <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Checkout isn&rsquo;t connected yet — plans can&rsquo;t be changed
            from here until billing goes live.
          </p>
        )}

        {showDevSwitch && (
          <form
            action={setPlanForDev}
            className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed p-3"
          >
            <div className="grid gap-1.5">
              <label htmlFor="dev-plan" className="text-sm font-medium">
                Set plan (local only)
              </label>
              <select
                id="dev-plan"
                name="plan"
                defaultValue={workspace.plan}
                className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {PLANS.map((plan) => (
                  <option key={plan} value={plan}>
                    {PLAN_LABELS[plan]}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm" variant="outline">
              Apply
            </Button>
            <p className="w-full text-xs text-muted-foreground">
              Development builds only, and only while billing is unconfigured.
              Never rendered or accepted in production.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
