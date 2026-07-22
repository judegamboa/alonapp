import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Alon</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Look like an agency to your overseas clients. Never answer &ldquo;where
        are we on this?&rdquo; again.
      </p>
      <div className="flex gap-3">
        <Button render={<Link href="/signup" />}>Get started free</Button>
        <Button variant="outline" render={<Link href="/login" />}>
          Log in
        </Button>
      </div>
    </main>
  );
}
