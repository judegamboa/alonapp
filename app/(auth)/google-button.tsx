"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleMark } from "@/components/google-mark";

// The OAuth hop leaves the app, so the round trip is visibly slow on a phone.
// Without a pending state the button looks dead and people click it twice.
export function GoogleButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="h-11 w-full gap-3 text-base font-medium"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
          Redirecting to Google…
        </>
      ) : (
        <>
          <GoogleMark className="size-5" />
          {label}
        </>
      )}
    </Button>
  );
}
