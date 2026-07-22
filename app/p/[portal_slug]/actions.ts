"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifyNewMessage } from "@/lib/notify";

const bodySchema = z.string().trim().min(1).max(5000);

// Posting a message is the client's only write. Runs under the client's
// session; RLS enforces author_role='client' and their own client_id.
export async function postClientMessage(
  threadId: string,
  portalSlug: string,
  formData: FormData
) {
  const body = bodySchema.safeParse(formData.get("body"));
  if (!body.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Client can read only their own client row and their own threads (RLS).
  const { data: client } = await supabase
    .from("clients")
    .select("id, workspace_id")
    .eq("portal_slug", portalSlug)
    .maybeSingle();
  const { data: thread } = await supabase
    .from("message_threads")
    .select("id")
    .eq("id", threadId)
    .maybeSingle();
  if (!client || !thread) return;

  const { error } = await supabase.from("messages").insert({
    workspace_id: client.workspace_id,
    thread_id: thread.id,
    author_role: "client",
    author_client_id: client.id,
    body: body.data,
  });
  if (error) return;

  await notifyNewMessage(thread.id, "client", body.data);
  revalidatePath(`/p/${portalSlug}`);
}
