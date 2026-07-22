import { createClient } from "@/lib/supabase/server";

export type FileVersion = {
  id: string;
  filename: string;
  version: number;
  size_bytes: number | null;
  created_at: string;
  uploaded_by: "freelancer" | "client";
  storage_path: string;
  url: string | null;
};

export type FileGroup = {
  filename: string;
  latest: FileVersion;
  history: FileVersion[]; // older versions, newest first
};

export function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Files for one client grouped by filename with signed download URLs.
 * Runs under the caller's session — RLS decides what's visible, so the same
 * helper serves the freelancer app and the client portal.
 */
export async function getFileGroups(clientId: string): Promise<FileGroup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("files")
    .select(
      "id, filename, version, size_bytes, created_at, uploaded_by, storage_path"
    )
    .eq("client_id", clientId)
    .order("filename", { ascending: true })
    .order("version", { ascending: false });
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: signed } = await supabase.storage
    .from("client-files")
    .createSignedUrls(
      rows.map((r) => r.storage_path),
      60 * 60
    );
  const urlByPath = new Map(
    (signed ?? []).map((s) => [s.path, s.error ? null : s.signedUrl])
  );

  const groups = new Map<string, FileVersion[]>();
  for (const row of rows) {
    const version: FileVersion = {
      ...row,
      uploaded_by: row.uploaded_by as FileVersion["uploaded_by"],
      url: urlByPath.get(row.storage_path) ?? null,
    };
    const list = groups.get(row.filename) ?? [];
    list.push(version);
    groups.set(row.filename, list);
  }

  return [...groups.values()].map((versions) => ({
    filename: versions[0].filename,
    latest: versions[0],
    history: versions.slice(1),
  }));
}
