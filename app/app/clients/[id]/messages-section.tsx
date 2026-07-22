import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageList } from "@/components/message-thread";
import { createClient } from "@/lib/supabase/server";
import { getThreads } from "@/lib/messages";
import { createThread, postFreelancerMessage } from "../../messages/actions";

export async function MessagesSection({ clientId }: { clientId: string }) {
  const threads = await getThreads(clientId);
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  const projectList = projects ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>
          Threaded conversations per project. Your client can reply from their
          portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {threads.map((thread) => (
          <div key={thread.id} className="rounded-lg border p-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <p className="font-medium">{thread.title}</p>
              <span className="text-xs text-muted-foreground">
                {thread.projectName}
              </span>
            </div>
            <MessageList
              messages={thread.messages}
              accent="#0E6B5C"
              labels={{ freelancer: "You", client: "Client" }}
            />
            <form
              action={postFreelancerMessage.bind(null, thread.id, clientId)}
              className="mt-3 flex items-center gap-2"
            >
              <Input
                name="body"
                placeholder="Write a reply…"
                required
                maxLength={5000}
                className="text-sm"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          </div>
        ))}

        {projectList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a project first — threads are organized under projects.
          </p>
        ) : (
          <form
            action={createThread.bind(null, clientId)}
            className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3"
          >
            <p className="text-sm font-medium">Start a thread</p>
            <div className="flex flex-wrap gap-2">
              <select
                name="project_id"
                required
                defaultValue={projectList[0].id}
                className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {projectList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Input
                name="title"
                placeholder="Thread title"
                required
                minLength={2}
                className="max-w-48 text-sm"
              />
            </div>
            <Input
              name="body"
              placeholder="First message (optional)"
              maxLength={5000}
              className="text-sm"
            />
            <div>
              <Button type="submit" size="sm">
                Start thread
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
