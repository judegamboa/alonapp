import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import type { EmailWorkspace } from "@/emails/components/branded-email";
import NewMessage from "@/emails/new-message";
import FilesShared from "@/emails/files-shared";
import StatusUpdate from "@/emails/status-update";
import PaymentRequest from "@/emails/payment-request";
import ClientInvite from "@/emails/client-invite";
import ClientLoginLink from "@/emails/client-login-link";
import { formatAmount } from "@/lib/currency";
import { siteUrl as appUrl } from "@/lib/urls";

const DEBOUNCE_MINUTES = 15;

async function ownerEmail(admin: ReturnType<typeof createAdminClient>, ownerId: string) {
  const { data } = await admin.auth.admin.getUserById(ownerId);
  return data.user?.email ?? null;
}

type ThreadContext = {
  workspace: EmailWorkspace & { owner_id: string };
  client: { id: string; name: string; email: string; portal_slug: string };
  thread: { id: string; title: string; last_emailed_at: string | null };
};

async function loadThreadContext(
  admin: ReturnType<typeof createAdminClient>,
  threadId: string
): Promise<ThreadContext | null> {
  const { data } = await admin
    .from("message_threads")
    .select(
      "id, title, last_emailed_at, project:projects ( client:clients ( id, name, email, portal_slug, workspace:workspaces ( name, logo_url, brand_color, owner_id ) ) )"
    )
    .eq("id", threadId)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  const client = row?.project?.client;
  const workspace = client?.workspace;
  if (!client || !workspace) return null;
  return {
    workspace,
    client,
    thread: {
      id: row.id,
      title: row.title,
      last_emailed_at: row.last_emailed_at,
    },
  };
}

/**
 * Notify the other party of a new message, debounced per thread: skip if this
 * thread already triggered an email within the last 15 minutes.
 */
export async function notifyNewMessage(
  threadId: string,
  authorRole: "freelancer" | "client",
  body: string
): Promise<void> {
  try {
    const admin = createAdminClient();
    const ctx = await loadThreadContext(admin, threadId);
    if (!ctx) return;

    if (ctx.thread.last_emailed_at) {
      const elapsedMs = Date.now() - new Date(ctx.thread.last_emailed_at).getTime();
      if (elapsedMs < DEBOUNCE_MINUTES * 60_000) return;
    }

    const { workspace, client, thread } = ctx;
    const preview = body.length > 140 ? `${body.slice(0, 140)}…` : body;

    let to: string | null;
    let authorName: string;
    let url: string;
    if (authorRole === "freelancer") {
      to = client.email;
      authorName = workspace.name;
      url = `${appUrl()}/p/${client.portal_slug}`;
    } else {
      to = await ownerEmail(admin, workspace.owner_id);
      authorName = client.name;
      url = `${appUrl()}/app/clients/${client.id}`;
    }
    if (!to) return;

    await sendEmail({
      to,
      fromName: workspace.name,
      subject: `New message in “${thread.title}”`,
      react: NewMessage({ workspace, authorName, threadTitle: thread.title, preview, url }),
    });

    await admin
      .from("message_threads")
      .update({ last_emailed_at: new Date().toISOString() })
      .eq("id", thread.id);
  } catch (e) {
    console.error("[notifyNewMessage]", e);
  }
}

async function loadClientContext(
  admin: ReturnType<typeof createAdminClient>,
  clientId: string
) {
  const { data } = await admin
    .from("clients")
    .select(
      "id, name, email, portal_slug, workspace:workspaces ( name, logo_url, brand_color, owner_id )"
    )
    .eq("id", clientId)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  if (!row?.workspace) return null;
  return {
    client: row as {
      id: string;
      name: string;
      email: string;
      portal_slug: string;
    },
    workspace: row.workspace as EmailWorkspace,
  };
}

/** Notify the client that files were shared (fires per upload). */
export async function notifyFilesShared(
  clientId: string,
  filenames: string[]
): Promise<void> {
  try {
    const admin = createAdminClient();
    const ctx = await loadClientContext(admin, clientId);
    if (!ctx) return;
    await sendEmail({
      to: ctx.client.email,
      fromName: ctx.workspace.name,
      subject: `${ctx.workspace.name} shared ${filenames.length} file${filenames.length === 1 ? "" : "s"}`,
      react: FilesShared({
        workspace: ctx.workspace,
        clientName: ctx.client.name,
        filenames,
        url: `${appUrl()}/p/${ctx.client.portal_slug}`,
      }),
    });
  } catch (e) {
    console.error("[notifyFilesShared]", e);
  }
}

/** Notify the client of a project status change. */
export async function notifyStatusUpdate(
  clientId: string,
  projectName: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  try {
    const admin = createAdminClient();
    const ctx = await loadClientContext(admin, clientId);
    if (!ctx) return;
    await sendEmail({
      to: ctx.client.email,
      fromName: ctx.workspace.name,
      subject: `${projectName} is now ${newStatus}`,
      react: StatusUpdate({
        workspace: ctx.workspace,
        clientName: ctx.client.name,
        projectName,
        oldStatus,
        newStatus,
        url: `${appUrl()}/p/${ctx.client.portal_slug}`,
      }),
    });
  } catch (e) {
    console.error("[notifyStatusUpdate]", e);
  }
}

/**
 * Notify the client that a payment request was created. The CTA points at the
 * portal, not the payment link — the client should see the request in context
 * before paying, and the portal is the branded surface.
 */
export async function notifyPaymentRequest(
  clientId: string,
  request: { amount: number; currency: string; description: string }
): Promise<void> {
  try {
    const admin = createAdminClient();
    const ctx = await loadClientContext(admin, clientId);
    if (!ctx) return;
    await sendEmail({
      to: ctx.client.email,
      fromName: ctx.workspace.name,
      subject: `Payment request from ${ctx.workspace.name} — ${formatAmount(request.amount, request.currency)}`,
      react: PaymentRequest({
        workspace: ctx.workspace,
        clientName: ctx.client.name,
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        url: `${appUrl()}/p/${ctx.client.portal_slug}`,
      }),
    });
  } catch (e) {
    console.error("[notifyPaymentRequest]", e);
  }
}

/** Send a magic-link invite (or returning-client login link). */
export async function sendClientMagicLink(
  clientId: string,
  variant: "invite" | "login"
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const ctx = await loadClientContext(admin, clientId);
    if (!ctx) return { ok: false, error: "Client not found" };

    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: ctx.client.email,
    });
    if (error || !data.properties?.hashed_token) {
      return { ok: false, error: "Could not create the link" };
    }
    const url = `${appUrl()}/auth/confirm?token_hash=${data.properties.hashed_token}&type=magiclink&next=${encodeURIComponent(`/p/${ctx.client.portal_slug}`)}`;

    await sendEmail({
      to: ctx.client.email,
      fromName: ctx.workspace.name,
      subject:
        variant === "invite"
          ? `${ctx.workspace.name} invited you to your portal`
          : `Your sign-in link for ${ctx.workspace.name}`,
      react:
        variant === "invite"
          ? ClientInvite({
              workspace: ctx.workspace,
              clientName: ctx.client.name,
              inviteUrl: url,
            })
          : ClientLoginLink({
              workspace: ctx.workspace,
              clientName: ctx.client.name,
              loginUrl: url,
            }),
    });
    return { ok: true };
  } catch (e) {
    console.error("[sendClientMagicLink]", e);
    return { ok: false, error: "Could not send the email" };
  }
}
