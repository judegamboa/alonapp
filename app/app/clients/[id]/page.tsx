import Link from "next/link";
import { notFound } from "next/navigation";
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
import { setClientArchived } from "../actions";
import { InviteButton } from "./invite-button";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, email, portal_slug, archived_at, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!client) notFound();

  const archived = Boolean(client.archived_at);

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/app"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← All clients
          </Link>
          <h1 className="mt-1 flex items-center gap-2 font-heading text-2xl font-bold">
            {client.name}
            {archived && <Badge variant="outline">Archived</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground">{client.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await setClientArchived(client.id, !archived);
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            {archived ? "Restore client" : "Archive client"}
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portal access</CardTitle>
          <CardDescription>
            Portal address:{" "}
            <Link
              href={`/p/${client.portal_slug}`}
              className="font-mono text-primary underline"
            >
              /p/{client.portal_slug}
            </Link>{" "}
            — clients sign in with a magic link, no password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteButton clientId={client.id} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {["Projects", "Files", "Messages", "Payment requests"].map(
          (section) => (
            <Card key={section}>
              <CardHeader>
                <CardTitle className="text-base">{section}</CardTitle>
                <CardDescription>Arrives in a later milestone.</CardDescription>
              </CardHeader>
            </Card>
          )
        )}
      </div>
    </main>
  );
}
