import Link from "next/link";
import { Button } from "@/components/ui/button";

// ClientPage calls notFound() when the id doesn't resolve — which, thanks to
// RLS, also covers a client in someone else's workspace.
export default function ClientNotFound() {
  return (
    <main className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="font-heading text-2xl font-bold">Client not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This client was removed, or the link points somewhere you don&rsquo;t
        have access to.
      </p>
      <Button render={<Link href="/app" />}>Back to all clients</Button>
    </main>
  );
}
