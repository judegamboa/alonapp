import { createClient } from "@/lib/supabase/server";

export type Message = {
  id: string;
  author_role: "freelancer" | "client";
  body: string;
  created_at: string;
};

export type Thread = {
  id: string;
  title: string;
  project_id: string;
  projectName: string;
  messages: Message[];
};

/**
 * Threads (with messages) for one client, grouped by thread. Runs under the
 * caller's session, so RLS serves both the freelancer app and the portal.
 */
export async function getThreads(clientId: string): Promise<Thread[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("message_threads")
    .select(
      "id, title, project_id, project:projects ( name, client_id ), messages ( id, author_role, body, created_at )"
    )
    .order("created_at", { ascending: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];

  return rows
    .filter((r) => r.project?.client_id === clientId)
    .map((r) => ({
      id: r.id,
      title: r.title,
      project_id: r.project_id,
      projectName: r.project?.name ?? "",
      messages: [...(r.messages ?? [])].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    }));
}
