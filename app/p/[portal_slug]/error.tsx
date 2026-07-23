"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tideline } from "@/components/tideline";

// Clients see this one. It never mentions Alon, never shows a stack, and never
// tells them to contact us — their relationship is with the freelancer.
export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[portal]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl font-bold">
        This page didn&rsquo;t load
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Something went wrong on our end. Try again in a moment — if it keeps
        happening, let your freelancer know.
      </p>
      <Button onClick={reset}>Try again</Button>
      <Tideline className="w-24 text-primary/30" />
    </main>
  );
}
