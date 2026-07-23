import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientLoading() {
  return (
    <main className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading this client…</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-44" />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-64 max-w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
