"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifyNewMessage } from "@/lib/notify";

const titleSchema = z.string().trim().min(2, "Title is too short").max(120);
const bodySchema = z.string().trim().min(1, "Write a message").max(5000);
const uuidSchema = z.string().uuid();

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return supabase;
}

export async function createThread(clientId: string, formData: FormData) {
  const supabase = await requireUser();
  const projectId = uuidSchema.safeParse(formData.get("project_id"));
  const title = titleSchema.safeParse(formData.get("title"));
  if (!projectId.success || !title.success) {
    redirect(`/app/clients/${clientId}?error=thread`);
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, workspace_id, client_id")
    .eq("id", projectId.data)
    .maybeSingle();
  if (!project || project.client_id !== clientId) return;

  const { data: thread } = await supabase
    .from("message_threads")
    .insert({
      workspace_id: project.workspace_id,
      project_id: project.id,
      title: title.data,
    })
    .select("id, workspace_id")
    .single();
  if (!thread) return;

  const firstBody = bodySchema.safeParse(formData.get("body"));
  if (firstBody.success) {
    await supabase.from("messages").insert({
      workspace_id: thread.workspace_id,
      thread_id: thread.id,
      author_role: "freelancer",
      body: firstBody.data,
    });
    await notifyNewMessage(thread.id, "freelancer", firstBody.data);
  }
  revalidatePath(`/app/clients/${clientId}`);
}

export async function postFreelancerMessage(
  threadId: string,
  clientId: string,
  formData: FormData
) {
  const supabase = await requireUser();
  const body = bodySchema.safeParse(formData.get("body"));
  if (!body.success) return;

  const { data: thread } = await supabase
    .from("message_threads")
    .select("id, workspace_id")
    .eq("id", threadId)
    .maybeSingle();
  if (!thread) return;

  await supabase.from("messages").insert({
    workspace_id: thread.workspace_id,
    thread_id: thread.id,
    author_role: "freelancer",
    body: body.data,
  });
  await notifyNewMessage(thread.id, "freelancer", body.data);
  revalidatePath(`/app/clients/${clientId}`);
}
