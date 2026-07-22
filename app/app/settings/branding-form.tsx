"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBranding, type ActionResult } from "../actions";

type Props = {
  name: string;
  brandColor: string;
  logoUrl: string | null;
};

export function BrandingForm({ name, brandColor, logoUrl }: Props) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(async (_prev, formData) => updateBranding(formData), null);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state && !state.ok && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm">Saved.</p>
      )}
      <div className="grid gap-2">
        <Label htmlFor="name">Workspace name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={name}
          required
          minLength={2}
          maxLength={60}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="brandColor">Brand color</Label>
        <Input
          id="brandColor"
          name="brandColor"
          type="color"
          defaultValue={brandColor}
          className="h-10 w-20 p-1"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="logo">Logo</Label>
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Current logo"
            className="h-16 w-16 rounded-md border object-contain"
          />
        )}
        <Input id="logo" name="logo" type="file" accept="image/*" />
        <p className="text-xs text-muted-foreground">
          PNG, JPG, WebP, or SVG, up to 2 MB.
        </p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save branding"}
      </Button>
    </form>
  );
}
