import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWorkspace } from "@/lib/workspace";
import { createWorkspace } from "../actions";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getWorkspace()) redirect("/app");
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Set up your workspace</CardTitle>
          <CardDescription>
            Your clients will see this name and color on their portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <form action={createWorkspace} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Cruz Design Studio"
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
                defaultValue="#0F766E"
                className="h-10 w-20 p-1"
              />
            </div>
            <Button type="submit">Create workspace</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
