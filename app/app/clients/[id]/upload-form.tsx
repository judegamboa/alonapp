"use client";

import { useRef } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadFile, type FileActionResult } from "../../files/actions";

export function UploadForm({ clientId }: { clientId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<
    FileActionResult | null,
    FormData
  >(async (_prev, formData) => {
    const result = await uploadFile(clientId, formData);
    if (result.ok) formRef.current?.reset();
    return result;
  }, null);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input name="file" type="file" required className="max-w-xs" />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Uploading…" : "Upload file"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Up to 25 MB. Re-uploading the same filename adds a new version.
      </p>
      {state && !state.ok && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
