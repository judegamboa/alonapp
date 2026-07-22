import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tideline } from "@/components/tideline";
import { createClient } from "@/lib/supabase/server";

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
          {[
            {
              title: "Project status",
              body: "Projects and milestones will appear here.",
            },
            { title: "Files", body: "Shared files will appear here." },
            { title: "Messages", body: "Conversations will appear here." },
            {
              title: "Payment requests",
              body: "Payment requests will appear here.",
            },
          ].map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
                <CardDescription>{section.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
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
