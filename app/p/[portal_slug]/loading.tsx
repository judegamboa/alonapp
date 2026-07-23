import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Neutral on purpose: the workspace's brand color isn't known until the portal
// row loads, and flashing Alon's teal first would undercut the freelancer.
export default function PortalLoading() {
  return (
    <div className="flex min-h-screen flex-col" aria-busy="true">
      <span className="sr-only">Loading your portal…</span>
      <Skeleton className="h-1.5 w-full rounded-none" />
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
