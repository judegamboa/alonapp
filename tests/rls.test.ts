import { beforeAll, afterAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { admin, createUser, deleteAllUsers, signIn } from "./helpers";

/**
 * RLS isolation suite (merge requirement, INSTRUCTIONS.md):
 *  1. client A cannot read client B's rows (same workspace)
 *  2. a client cannot read another workspace's rows
 *  3. a client cannot write anything except messages
 *  4. freelancer A cannot touch workspace B
 *
 * Fixture: two workspaces (A, B). Workspace A has clients a1 + a2, workspace B
 * has client b1, each with a project / milestone / thread / message / file /
 * payment request.
 */

type Fixture = {
  workspaceId: string;
  clientId: string;
  projectId: string;
  milestoneId: string;
  threadId: string;
  messageId: string;
  fileId: string;
  paymentRequestId: string;
};

let fA: SupabaseClient; // freelancer A
let fB: SupabaseClient;
let cA1: SupabaseClient; // client a1 (workspace A)
let cA2: SupabaseClient;
let cB1: SupabaseClient;

let a1: Fixture;
let a2: Fixture;
let b1: Fixture;

async function seedTenant(
  ownerEmail: string,
  workspaceName: string,
  clientDefs: { email: string; slug: string }[]
): Promise<Fixture[]> {
  const ownerId = await createUser(ownerEmail);
  await admin
    .from("user_roles")
    .insert({ user_id: ownerId, role: "freelancer" })
    .throwOnError();
  const { data: ws } = await admin
    .from("workspaces")
    .insert({ owner_id: ownerId, name: workspaceName })
    .select()
    .single()
    .throwOnError();

  const fixtures: Fixture[] = [];
  for (const def of clientDefs) {
    const { data: client } = await admin
      .from("clients")
      .insert({
        workspace_id: ws.id,
        name: def.slug,
        email: def.email,
        portal_slug: def.slug,
      })
      .select()
      .single()
      .throwOnError();

    const clientUserId = await createUser(def.email);
    await admin
      .from("user_roles")
      .insert({ user_id: clientUserId, role: "client", client_id: client.id })
      .throwOnError();

    const { data: project } = await admin
      .from("projects")
      .insert({ workspace_id: ws.id, client_id: client.id, name: "Project" })
      .select()
      .single()
      .throwOnError();
    const { data: milestone } = await admin
      .from("milestones")
      .insert({ workspace_id: ws.id, project_id: project.id, title: "M1" })
      .select()
      .single()
      .throwOnError();
    const { data: thread } = await admin
      .from("message_threads")
      .insert({ workspace_id: ws.id, project_id: project.id, title: "Kickoff" })
      .select()
      .single()
      .throwOnError();
    const { data: message } = await admin
      .from("messages")
      .insert({
        workspace_id: ws.id,
        thread_id: thread.id,
        author_role: "freelancer",
        body: "hello",
      })
      .select()
      .single()
      .throwOnError();
    const { data: file } = await admin
      .from("files")
      .insert({
        workspace_id: ws.id,
        client_id: client.id,
        project_id: project.id,
        storage_path: `${ws.id}/${client.id}/brief.pdf`,
        filename: "brief.pdf",
        uploaded_by: "freelancer",
      })
      .select()
      .single()
      .throwOnError();
    const { data: pr } = await admin
      .from("payment_requests")
      .insert({
        workspace_id: ws.id,
        client_id: client.id,
        amount: 100,
        description: "Deposit",
      })
      .select()
      .single()
      .throwOnError();

    fixtures.push({
      workspaceId: ws.id,
      clientId: client.id,
      projectId: project.id,
      milestoneId: milestone.id,
      threadId: thread.id,
      messageId: message.id,
      fileId: file.id,
      paymentRequestId: pr.id,
    });
  }
  return fixtures;
}

beforeAll(async () => {
  await deleteAllUsers();
  [a1, a2] = await seedTenant("freelancer-a@test.dev", "Studio A", [
    { email: "client-a1@test.dev", slug: "client-a1" },
    { email: "client-a2@test.dev", slug: "client-a2" },
  ]);
  [b1] = await seedTenant("freelancer-b@test.dev", "Studio B", [
    { email: "client-b1@test.dev", slug: "client-b1" },
  ]);

  [fA, fB, cA1, cA2, cB1] = await Promise.all([
    signIn("freelancer-a@test.dev"),
    signIn("freelancer-b@test.dev"),
    signIn("client-a1@test.dev"),
    signIn("client-a2@test.dev"),
    signIn("client-b1@test.dev"),
  ]);
});

afterAll(async () => {
  await deleteAllUsers();
});

const tenantTables = [
  "clients",
  "projects",
  "milestones",
  "files",
  "message_threads",
  "messages",
  "payment_requests",
] as const;

async function visibleRows(client: SupabaseClient, table: string) {
  const { data, error } = await client.from(table).select("id");
  expect(error).toBeNull();
  return (data ?? []).map((r) => r.id as string);
}

describe("client sees exactly their own data", () => {
  it("client a1 can read every row type tied to them", async () => {
    expect(await visibleRows(cA1, "clients")).toEqual([a1.clientId]);
    expect(await visibleRows(cA1, "projects")).toEqual([a1.projectId]);
    expect(await visibleRows(cA1, "milestones")).toEqual([a1.milestoneId]);
    expect(await visibleRows(cA1, "files")).toEqual([a1.fileId]);
    expect(await visibleRows(cA1, "message_threads")).toEqual([a1.threadId]);
    expect(await visibleRows(cA1, "messages")).toEqual([a1.messageId]);
    expect(await visibleRows(cA1, "payment_requests")).toEqual([
      a1.paymentRequestId,
    ]);
  });

  it("client a1 can read only their workspace's branding row", async () => {
    expect(await visibleRows(cA1, "workspaces")).toEqual([a1.workspaceId]);
  });

  it("client a1 cannot see client a2's rows (same workspace)", async () => {
    for (const table of tenantTables) {
      const ids = await visibleRows(cA1, table);
      const a2Ids = Object.values(a2);
      expect(ids.filter((id) => a2Ids.includes(id))).toEqual([]);
    }
    // and symmetrically, a2 sees only their own client row
    expect(await visibleRows(cA2, "clients")).toEqual([a2.clientId]);
  });

  it("client b1 cannot see anything in workspace A", async () => {
    for (const table of tenantTables) {
      const ids = await visibleRows(cB1, table);
      const aIds = [...Object.values(a1), ...Object.values(a2)];
      expect(ids.filter((id) => aIds.includes(id))).toEqual([]);
    }
    expect(await visibleRows(cB1, "workspaces")).toEqual([b1.workspaceId]);
  });
});

describe("client write surface is messages-only", () => {
  it("client a1 can post a message in their own thread", async () => {
    const { data, error } = await cA1
      .from("messages")
      .insert({
        workspace_id: a1.workspaceId,
        thread_id: a1.threadId,
        author_role: "client",
        author_client_id: a1.clientId,
        body: "from the client",
      })
      .select()
      .single();
    expect(error).toBeNull();
    expect(data!.thread_id).toBe(a1.threadId);
  });

  it("client a1 cannot post into a2's thread or forge authorship", async () => {
    const attempts = [
      { thread_id: a2.threadId, author_client_id: a1.clientId }, // wrong thread
      { thread_id: a1.threadId, author_client_id: a2.clientId }, // forged author
      {
        thread_id: a1.threadId,
        author_client_id: a1.clientId,
        author_role: "freelancer",
      }, // forged role
    ];
    for (const attempt of attempts) {
      const { error } = await cA1.from("messages").insert({
        workspace_id: a1.workspaceId,
        author_role: "client",
        body: "nope",
        ...attempt,
      });
      expect(error?.code).toBe("42501"); // RLS violation
    }
  });

  it("client a1 cannot insert into any other table", async () => {
    const inserts: Record<string, object> = {
      clients: {
        workspace_id: a1.workspaceId,
        name: "x",
        email: "x@x.dev",
        portal_slug: "sneaky",
      },
      projects: {
        workspace_id: a1.workspaceId,
        client_id: a1.clientId,
        name: "x",
      },
      milestones: {
        workspace_id: a1.workspaceId,
        project_id: a1.projectId,
        title: "x",
      },
      files: {
        workspace_id: a1.workspaceId,
        client_id: a1.clientId,
        storage_path: "x",
        filename: "x",
        uploaded_by: "client",
      },
      message_threads: {
        workspace_id: a1.workspaceId,
        project_id: a1.projectId,
        title: "x",
      },
      payment_requests: {
        workspace_id: a1.workspaceId,
        client_id: a1.clientId,
        amount: 1,
      },
    };
    for (const [table, row] of Object.entries(inserts)) {
      const { error } = await cA1.from(table).insert(row);
      expect(error?.code, table).toBe("42501");
    }
  });

  it("client a1 cannot update or delete anything, including messages", async () => {
    // RLS filters the target rows away: 0 rows affected, no error.
    const { data: updated } = await cA1
      .from("messages")
      .update({ body: "edited" })
      .eq("id", a1.messageId)
      .select();
    expect(updated).toEqual([]);

    const { data: deleted } = await cA1
      .from("messages")
      .delete()
      .eq("id", a1.messageId)
      .select();
    expect(deleted).toEqual([]);

    const { data: project } = await cA1
      .from("projects")
      .update({ status: "done" })
      .eq("id", a1.projectId)
      .select();
    expect(project).toEqual([]);
  });
});

describe("storage policies (client-files)", () => {
  const paths = () => ({
    ownFile: `${a1.workspaceId}/${a1.clientId}/v1/spec.txt`,
    intruderFile: `${b1.workspaceId}/${b1.clientId}/v1/evil.txt`,
    clientUpload: `${a1.workspaceId}/${a1.clientId}/v1/from-client.txt`,
  });

  afterAll(async () => {
    const p = paths();
    await admin.storage
      .from("client-files")
      .remove([p.ownFile, p.intruderFile, p.clientUpload]);
  });

  it("freelancer can upload only into their own workspace prefix", async () => {
    const p = paths();
    const ok = await fA.storage
      .from("client-files")
      .upload(p.ownFile, Buffer.from("hello"), { contentType: "text/plain" });
    expect(ok.error).toBeNull();

    const denied = await fA.storage
      .from("client-files")
      .upload(p.intruderFile, Buffer.from("x"), { contentType: "text/plain" });
    expect(denied.error).not.toBeNull();
  });

  it("client can sign their own file, not a sibling's; cannot upload", async () => {
    const p = paths();
    const own = await cA1.storage
      .from("client-files")
      .createSignedUrl(p.ownFile, 60);
    expect(own.data?.signedUrl).toBeTruthy();

    const sibling = await cA2.storage
      .from("client-files")
      .createSignedUrl(p.ownFile, 60);
    expect(sibling.error).not.toBeNull();

    const upload = await cA1.storage
      .from("client-files")
      .upload(p.clientUpload, Buffer.from("x"), { contentType: "text/plain" });
    expect(upload.error).not.toBeNull();
  });
});

describe("freelancer isolation", () => {
  it("freelancer A has full CRUD in their own workspace", async () => {
    const { data: created, error } = await fA
      .from("projects")
      .insert({
        workspace_id: a1.workspaceId,
        client_id: a1.clientId,
        name: "New project",
      })
      .select()
      .single();
    expect(error).toBeNull();

    const { data: updated } = await fA
      .from("projects")
      .update({ status: "in_progress" })
      .eq("id", created!.id)
      .select()
      .single();
    expect(updated!.status).toBe("in_progress");

    const { data: deleted } = await fA
      .from("projects")
      .delete()
      .eq("id", created!.id)
      .select();
    expect(deleted).toHaveLength(1);
  });

  it("freelancer A cannot read workspace B's rows", async () => {
    expect(await visibleRows(fA, "workspaces")).toEqual([a1.workspaceId]);
    for (const table of tenantTables) {
      const ids = await visibleRows(fA, table);
      expect(ids.filter((id) => Object.values(b1).includes(id))).toEqual([]);
    }
  });

  it("freelancer A cannot write into workspace B", async () => {
    const { error: insertError } = await fA.from("projects").insert({
      workspace_id: b1.workspaceId,
      client_id: b1.clientId,
      name: "intrusion",
    });
    expect(insertError?.code).toBe("42501");

    const { data: updated } = await fA
      .from("projects")
      .update({ name: "hijacked" })
      .eq("id", b1.projectId)
      .select();
    expect(updated).toEqual([]);

    const { data: stillThere } = await admin
      .from("projects")
      .select("name")
      .eq("id", b1.projectId)
      .single();
    expect(stillThere!.name).toBe("Project");
  });

  it("freelancer B sees only their own workspace", async () => {
    expect(await visibleRows(fB, "workspaces")).toEqual([b1.workspaceId]);
    expect(await visibleRows(fB, "clients")).toEqual([b1.clientId]);
  });
});
