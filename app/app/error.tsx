"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tideline } from "@/components/tideline";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app]", error);
  }, [error]);

  return (
    <main className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="font-heading text-2xl font-bold">
        That didn&rsquo;t load
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Something broke on our side. Try again — your work is saved.
      </p>
      <div className="flex items-center gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" render={<Link href="/app" />}>
          Back to dashboard
        </Button>
      </div>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}
      <Tideline className="w-24 text-primary/30" />
    </main>
  );
}
