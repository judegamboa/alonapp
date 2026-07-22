"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_STATUSES, STATUS_LABELS } from "@/lib/status";
import { notifyStatusUpdate } from "@/lib/notify";

const nameSchema = z.string().trim().min(2, "Name is too short").max(80);
const uuidSchema = z.string().uuid();

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return supabase;
}

// All mutations run as the freelancer's session — RLS scopes every row to
// workspaces they own, so a forged clientId/projectId simply matches nothing.

export async function addProject(clientId: string, formData: FormData) {
  const supabase = await requireUser();
  const name = nameSchema.safeParse(formData.get("name"));
  if (!name.success || !uuidSchema.safeParse(clientId).success) return;

  const { data: client } = await supabase
    .from("clients")
    .select("id, workspace_id")
    .eq("id", clientId)
    .maybeSingle();
  if (!client) return;

  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId);

  await supabase.from("projects").insert({
    workspace_id: client.workspace_id,
    client_id: clientId,
    name: name.data,
    sort_order: count ?? 0,
  });
  revalidatePath(`/app/clients/${clientId}`);
}

export async function setProjectStatus(
  projectId: string,
  clientId: string,
  formData: FormData
) {
  const supabase = await requireUser();
  const status = z.enum(PROJECT_STATUSES).safeParse(formData.get("status"));
  if (!status.success) return;

  const { data: before } = await supabase
    .from("projects")
    .select("name, status")
    .eq("id", projectId)
    .maybeSingle();

  await supabase
    .from("projects")
    .update({ status: status.data })
    .eq("id", projectId);
  revalidatePath(`/app/clients/${clientId}`);

  if (before && before.status !== status.data) {
    await notifyStatusUpdate(
      clientId,
      before.name,
      STATUS_LABELS[before.status as keyof typeof STATUS_LABELS],
      STATUS_LABELS[status.data]
    );
  }
}

export async function deleteProject(projectId: string, clientId: string) {
  const supabase = await requireUser();
  await supabase.from("projects").delete().eq("id", projectId);
  revalidatePath(`/app/clients/${clientId}`);
}

export async function addMilestone(
  projectId: string,
  clientId: string,
  formData: FormData
) {
  const supabase = await requireUser();
  const title = nameSchema.safeParse(formData.get("title"));
  if (!title.success) return;
  const dueRaw = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .safeParse(formData.get("due_date"));

  const { data: project } = await supabase
    .from("projects")
    .select("id, workspace_id")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return;

  const { count } = await supabase
    .from("milestones")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  await supabase.from("milestones").insert({
    workspace_id: project.workspace_id,
    project_id: projectId,
    title: title.data,
    due_date: dueRaw.success ? dueRaw.data : null,
    sort_order: count ?? 0,
  });
  revalidatePath(`/app/clients/${clientId}`);
}

export async function setMilestoneDone(
  milestoneId: string,
  clientId: string,
  done: boolean
) {
  const supabase = await requireUser();
  await supabase.from("milestones").update({ done }).eq("id", milestoneId);
  revalidatePath(`/app/clients/${clientId}`);
}

export async function deleteMilestone(milestoneId: string, clientId: string) {
  const supabase = await requireUser();
  await supabase.from("milestones").delete().eq("id", milestoneId);
  revalidatePath(`/app/clients/${clientId}`);
}
