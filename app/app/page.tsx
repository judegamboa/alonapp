import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getWorkspace, PLAN_LIMITS } from "@/lib/workspace";
import { addClient } from "./clients/actions";

type ClientRow = {
  id: string;
  name: string;
  email: string;
  portal_slug: string;
  archived_at: string | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const workspace = await getWorkspace();
  if (!workspace) redirect("/app/onboarding");
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email, portal_slug, archived_at")
    .order("created_at", { ascending: true });
  const list = (clients ?? []) as ClientRow[];
  const active = list.filter((c) => !c.archived_at);
  const limit = PLAN_LIMITS[workspace.plan];
  const atLimit = limit !== null && active.length >= limit;

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
          <h1 className="font-heading text-2xl font-bold">{workspace.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{workspace.plan} plan</Badge>
            <span className="font-mono">
              {active.length} of {limit ?? "∞"} client portal
              {limit === 1 ? "" : "s"} used
            </span>
          </div>
        </div>
      </div>

      {error === "limit" ? (
        <div className="flex items-center justify-between rounded-lg border border-primary bg-accent px-4 py-3 text-sm">
          <span>
            Your {workspace.plan} plan includes {limit} client portal
            {limit === 1 ? "" : "s"}. Upgrade to add more.
          </span>
          <Button size="sm" render={<Link href="/app/settings" />}>
            View plans
          </Button>
        </div>
      ) : error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>
            Each client gets their own branded portal, opened with a magic
            link.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No clients yet — add your first one below.
            </p>
          )}
          {list.length > 0 && (
            <ul className="divide-y rounded-lg border">
              {list.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/app/clients/${c.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted"
                  >
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.email}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      {c.archived_at && (
                        <Badge variant="outline">Archived</Badge>
                      )}
                      <span className="font-mono text-xs text-muted-foreground">
                        /p/{c.portal_slug}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!atLimit && (
            <form
              action={addClient}
              className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-end"
            >
              <div className="grid flex-1 gap-1.5">
                <Label htmlFor="name">Client name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Ayla Goods"
                  required
                  minLength={2}
                />
              </div>
              <div className="grid flex-1 gap-1.5">
                <Label htmlFor="email">Client email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="client@example.com"
                  required
                />
              </div>
              <Button type="submit">Add client</Button>
            </form>
          )}
          {atLimit && !error && (
            <p className="text-sm text-muted-foreground">
              You&rsquo;ve used all {limit} portal{limit === 1 ? "" : "s"} on
              the {workspace.plan} plan.{" "}
              <Link href="/app/settings" className="text-primary underline">
                Upgrade to add more.
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
