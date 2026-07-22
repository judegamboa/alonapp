"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const FILE_MAX_BYTES = 25 * 1024 * 1024;

export type FileActionResult = { ok: true } | { ok: false; error: string };

function sanitizeFilename(raw: string): string | null {
  const name = raw
    .replace(/[/\\]/g, "_")
    .replace(/\p{Cc}/gu, "")
    .trim();
  if (!name || name === "." || name === "..") return null;
  return name.slice(0, 140);
}

export async function uploadFile(
  clientId: string,
  formData: FormData
): Promise<FileActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!z.string().uuid().safeParse(clientId).success) {
    return { ok: false, error: "Client not found" };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload" };
  }
  if (file.size > FILE_MAX_BYTES) {
    return { ok: false, error: "Files can be up to 25 MB" };
  }
  const filename = sanitizeFilename(file.name);
  if (!filename) {
    return { ok: false, error: "That filename can't be used" };
  }

  // RLS scopes the client lookup to the freelancer's own workspace.
  const { data: client } = await supabase
    .from("clients")
    .select("id, workspace_id")
    .eq("id", clientId)
    .maybeSingle();
  if (!client) return { ok: false, error: "Client not found" };

  // Re-uploading the same filename creates the next version.
  const { data: latest } = await supabase
    .from("files")
    .select("version")
    .eq("client_id", clientId)
    .eq("filename", filename)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const version = (latest?.version ?? 0) + 1;

  const storagePath = `${client.workspace_id}/${client.id}/v${version}/${filename}`;
  const { error: uploadError } = await supabase.storage
    .from("client-files")
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
    });
  if (uploadError) {
    return { ok: false, error: "Upload failed, please try again" };
  }

  const { error: insertError } = await supabase.from("files").insert({
    workspace_id: client.workspace_id,
    client_id: client.id,
    storage_path: storagePath,
    filename,
    version,
    size_bytes: file.size,
    uploaded_by: "freelancer",
  });
  if (insertError) {
    await supabase.storage.from("client-files").remove([storagePath]);
    return { ok: false, error: "Upload failed, please try again" };
  }

  revalidatePath(`/app/clients/${clientId}`);
  return { ok: true };
}

export async function deleteFile(fileId: string, clientId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: file } = await supabase
    .from("files")
    .select("id, storage_path")
    .eq("id", fileId)
    .maybeSingle();
  if (!file) return;

  await supabase.storage.from("client-files").remove([file.storage_path]);
  await supabase.from("files").delete().eq("id", file.id);
  revalidatePath(`/app/clients/${clientId}`);
}
