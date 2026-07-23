import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tideline } from "@/components/tideline";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="font-heading text-2xl font-bold">
        There&rsquo;s nothing here
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you followed doesn&rsquo;t exist. If you were opening a client
        portal, use the link from your email.
      </p>
      <Button render={<Link href="/" />}>Go to the homepage</Button>
      <Tideline className="w-24 text-primary/30" />
    </main>
  );
}
