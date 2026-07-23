import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";
import { NavLinks } from "./nav-links";
import { DevNotice } from "@/components/dev-notice";

// Client-role sessions belong in their portal, not the freelancer app.
async function redirectClientsToPortal() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;
  try {
    const claims = JSON.parse(
      Buffer.from(session.access_token.split(".")[1], "base64").toString()
    );
    if (claims.user_role === "client" && claims.client_id) {
      const { data: client } = await supabase
        .from("clients")
        .select("portal_slug")
        .eq("id", claims.client_id)
        .maybeSingle();
      redirect(client ? `/p/${client.portal_slug}` : "/");
    }
  } catch (e) {
    // Malformed token: let the normal auth flow handle it.
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectClientsToPortal();
  return (
    <div className="min-h-screen">
      <DevNotice />
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/app" className="font-heading text-lg font-bold">
              alon
            </Link>
            <NavLinks />
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
    </div>
  );
}
