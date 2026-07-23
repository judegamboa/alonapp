import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tideline } from "@/components/tideline";
import { MessageList } from "@/components/message-thread";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS, type ProjectStatus } from "@/lib/status";
import { formatBytes, getFileGroups } from "@/lib/files";
import { formatAmount } from "@/lib/currency";
import { getThreads } from "@/lib/messages";
import { postClientMessage } from "./actions";

type PortalProject = {
  id: string;
  name: string;
  status: ProjectStatus;
  milestones: {
    id: string;
    title: string;
    done: boolean;
    due_date: string | null;
    sort_order: number;
  }[];
};

type PortalPaymentRequest = {
  id: string;
  amount: number;
  currency: string;
  description: string;
  payment_url: string | null;
  status: "unpaid" | "paid";
};

type PortalData = {
  id: string;
  name: string;
  workspaces: {
    name: string;
    logo_url: string | null;
    brand_color: string | null;
    plan: string;
  };
};

// Client portal shell. RLS decides visibility: the invited client sees their
// own portal; the workspace owner can preview it; everyone else sees the
// sign-in prompt.

// A portal is one client's private workspace. Keep it out of search results
// and out of link previews — robots.ts disallows /p/, this covers crawlers
// that reached the URL some other way.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PortalPage({
  params,
}: {
  params: Promise<{ portal_slug: string }>;
}) {
  const { portal_slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select(
      "id, name, workspaces ( name, logo_url, brand_color, plan )"
    )
    .eq("portal_slug", portal_slug)
    .maybeSingle();
  const portal = data as unknown as PortalData | null;

  if (!portal || !portal.workspaces) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-heading text-2xl font-bold">
          This portal is private
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Open the invite link from your email to sign in. If your link has
          expired, ask your freelancer to send a new one.
        </p>
        <Tideline className="w-24 text-primary/30" />
      </main>
    );
  }

  const ws = portal.workspaces;
  const brand = ws.brand_color ?? "#0E6B5C";

  const { data: projectRows } = await supabase
    .from("projects")
    .select(
      "id, name, status, milestones ( id, title, done, due_date, sort_order )"
    )
    .eq("client_id", portal.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const projects = (projectRows ?? []) as unknown as PortalProject[];
  const fileGroups = await getFileGroups(portal.id);
  const threads = await getThreads(portal.id);

  const { data: paymentRows } = await supabase
    .from("payment_requests")
    .select("id, amount, currency, description, payment_url, status")
    .eq("client_id", portal.id)
    .order("created_at", { ascending: false });
  const paymentRequests = (paymentRows ?? []) as PortalPaymentRequest[];

  return (
    <div className="flex min-h-screen flex-col">
      <div style={{ backgroundColor: brand }} className="h-1.5 w-full" />
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          {ws.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ws.logo_url}
              alt=""
              className="h-9 w-9 rounded-md object-contain"
            />
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-md font-heading text-sm font-bold text-white"
              style={{ backgroundColor: brand }}
            >
              {ws.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-heading text-lg font-semibold leading-tight">
              {ws.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Client portal for {portal.name}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project status</CardTitle>
              {projects.length === 0 && (
                <CardDescription>
                  Projects and milestones will appear here.
                </CardDescription>
              )}
            </CardHeader>
            {projects.length > 0 && (
              <CardContent className="flex flex-col gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="min-w-0 break-words font-medium">
                        {project.name}
                      </p>
                      <Badge
                        className={
                          project.status === "done"
                            ? "text-white"
                            : "bg-muted text-foreground"
                        }
                        style={
                          project.status === "done"
                            ? { backgroundColor: brand }
                            : undefined
                        }
                      >
                        {STATUS_LABELS[project.status]}
                      </Badge>
                    </div>
                    {project.milestones.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-2 text-sm">
                        {[...project.milestones]
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((m) => (
                            <li key={m.id} className="flex items-center gap-2">
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                                  m.done ? "text-white" : "border"
                                }`}
                                style={
                                  m.done
                                    ? { backgroundColor: brand }
                                    : undefined
                                }
                              >
                                {m.done ? "✓" : ""}
                              </span>
                              <span
                                className={
                                  m.done
                                    ? "text-muted-foreground line-through"
                                    : ""
                                }
                              >
                                {m.title}
                              </span>
                              {m.due_date && !m.done && (
                                <span className="font-mono text-xs text-muted-foreground">
                                  due {m.due_date}
                                </span>
                              )}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Files</CardTitle>
              {fileGroups.length === 0 && (
                <CardDescription>
                  Shared files will appear here.
                </CardDescription>
              )}
            </CardHeader>
            {fileGroups.length > 0 && (
              <CardContent>
                <ul className="divide-y rounded-lg border">
                  {fileGroups.map((group) => (
                    <li key={group.filename} className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {/* Filenames are unbroken strings and routinely long;
                            without break-all they push the card off a phone. */}
                        {group.latest.url ? (
                          <a
                            href={group.latest.url}
                            download
                            className="min-w-0 break-all font-medium underline"
                            style={{ color: brand }}
                          >
                            {group.filename}
                          </a>
                        ) : (
                          <span className="min-w-0 break-all font-medium">
                            {group.filename}
                          </span>
                        )}
                        <Badge variant="outline">v{group.latest.version}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatBytes(group.latest.size_bytes)}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {new Date(
                            group.latest.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {group.history.length > 0 && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs text-muted-foreground">
                            {group.history.length} earlier version
                            {group.history.length === 1 ? "" : "s"}
                          </summary>
                          <ul className="mt-1 flex flex-col gap-1 pl-4 text-xs text-muted-foreground">
                            {group.history.map((v) => (
                              <li key={v.id} className="flex items-center gap-2">
                                {v.url ? (
                                  <a href={v.url} download className="underline">
                                    v{v.version}
                                  </a>
                                ) : (
                                  <span>v{v.version}</span>
                                )}
                                <span className="font-mono">
                                  {formatBytes(v.size_bytes)}
                                </span>
                                <span>
                                  {new Date(v.created_at).toLocaleDateString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Messages</CardTitle>
              {threads.length === 0 && (
                <CardDescription>
                  Conversations will appear here.
                </CardDescription>
              )}
            </CardHeader>
            {threads.length > 0 && (
              <CardContent className="flex flex-col gap-4">
                {threads.map((thread) => (
                  <div key={thread.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-baseline justify-between gap-2">
                      <p className="font-medium">{thread.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {thread.projectName}
                      </span>
                    </div>
                    <MessageList
                      messages={thread.messages}
                      accent={brand}
                      labels={{ freelancer: ws.name, client: "You" }}
                    />
                    <form
                      action={postClientMessage.bind(
                        null,
                        thread.id,
                        portal_slug
                      )}
                      className="mt-3 flex items-center gap-2"
                    >
                      <Input
                        name="body"
                        placeholder="Write a reply…"
                        required
                        maxLength={5000}
                        className="text-sm"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        style={{ backgroundColor: brand }}
                      >
                        Send
                      </Button>
                    </form>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment requests</CardTitle>
              {paymentRequests.length === 0 && (
                <CardDescription>
                  Payment requests will appear here.
                </CardDescription>
              )}
            </CardHeader>
            {paymentRequests.length > 0 && (
              <CardContent className="flex flex-col gap-3">
                {paymentRequests.map((request) => {
                  const paid = request.status === "paid";
                  return (
                    <div
                      key={request.id}
                      className="flex flex-wrap items-start justify-between gap-2 rounded-lg border p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-lg font-semibold">
                          {formatAmount(request.amount, request.currency)}
                        </p>
                        <p className="break-words text-sm text-muted-foreground">
                          {request.description}
                        </p>
                        {request.payment_url && !paid && (
                          <a
                            href={request.payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-sm font-medium underline"
                            style={{ color: brand }}
                          >
                            Pay now
                          </a>
                        )}
                      </div>
                      <Badge
                        className={paid ? "text-white" : "bg-muted text-foreground"}
                        style={paid ? { backgroundColor: brand } : undefined}
                      >
                        {paid ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        </div>
      </main>

      {ws.plan === "free" && (
        <footer className="border-t">
          <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 px-4 py-4 text-xs text-muted-foreground">
            <span>
              Powered by <span className="font-heading font-bold">alon</span>
            </span>
            <Tideline className="w-12 text-primary/40" />
          </div>
        </footer>
      )}
    </div>
  );
}
