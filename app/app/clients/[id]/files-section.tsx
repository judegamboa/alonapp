import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBytes, getFileGroups } from "@/lib/files";
import { deleteFile } from "../../files/actions";
import { UploadForm } from "./upload-form";

export async function FilesSection({ clientId }: { clientId: string }) {
  const groups = await getFileGroups(clientId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files</CardTitle>
        <CardDescription>
          Shared with your client on their portal. Downloads use expiring
          links.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {groups.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No files yet — upload a deliverable below.
          </p>
        )}
        {groups.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {groups.map((group) => (
              <li key={group.filename} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {group.latest.url ? (
                    <a
                      href={group.latest.url}
                      className="min-w-0 break-all text-sm font-medium text-primary underline"
                      download
                    >
                      {group.filename}
                    </a>
                  ) : (
                    <span className="min-w-0 break-all text-sm font-medium">
                      {group.filename}
                    </span>
                  )}
                  <Badge variant="outline">v{group.latest.version}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatBytes(group.latest.size_bytes)}
                  </span>
                  <form
                    action={deleteFile.bind(null, group.latest.id, clientId)}
                    className="ml-auto"
                  >
                    <button
                      type="submit"
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </button>
                  </form>
                </div>
                {group.history.length > 0 && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                      {group.history.length} earlier version
                      {group.history.length === 1 ? "" : "s"}
                    </summary>
                    <ul className="mt-1 flex flex-col gap-1 pl-4">
                      {group.history.map((v) => (
                        <li
                          key={v.id}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          {v.url ? (
                            <a href={v.url} className="underline" download>
                              v{v.version}
                            </a>
                          ) : (
                            <span>v{v.version}</span>
                          )}
                          <span className="font-mono">
                            {formatBytes(v.size_bytes)}
                          </span>
                          <span>
                            {new Date(v.created_at).toLocaleDateString()}
                          </span>
                          <form
                            action={deleteFile.bind(null, v.id, clientId)}
                            className="ml-auto"
                          >
                            <button
                              type="submit"
                              className="hover:text-destructive"
                            >
                              Delete
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
        <UploadForm clientId={clientId} />
      </CardContent>
    </Card>
  );
}
