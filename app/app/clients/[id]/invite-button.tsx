"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { emailInvite, generateInviteLink, type InviteResult } from "../actions";

export function InviteButton({ clientId }: { clientId: string }) {
  const [result, setResult] = useState<InviteResult | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailState, setEmailState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  async function handleGenerate() {
    setPending(true);
    setCopied(false);
    setResult(await generateInviteLink(clientId));
    setPending(false);
  }

  async function handleEmail() {
    setEmailState("sending");
    const res = await emailInvite(clientId);
    setEmailState(res.ok ? "sent" : "error");
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleEmail} disabled={emailState === "sending"}>
          {emailState === "sending"
            ? "Sending…"
            : emailState === "sent"
              ? "Invite sent ✓"
              : "Email invite to client"}
        </Button>
        <Button variant="outline" onClick={handleGenerate} disabled={pending}>
          {pending
            ? "Creating link…"
            : result?.ok
              ? "Create a new link"
              : "Copy a link instead"}
        </Button>
      </div>
      {emailState === "error" && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Could not send the invite. Try copying a link instead.
        </p>
      )}
      {result && !result.ok && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {result.error}
        </p>
      )}
      {result?.ok && (
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3">
          <p className="break-all font-mono text-xs">{result.url}</p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(result.url)}
            >
              {copied ? "Copied" : "Copy link"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Send this to your client — it signs them straight into their
              portal. Links expire after first use or 24 hours.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
