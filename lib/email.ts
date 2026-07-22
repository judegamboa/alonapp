import "server-only";
import type { ReactElement } from "react";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Shared sending domain (verify alonapp.com in Resend before production sends).
const FROM_ADDRESS = process.env.RESEND_FROM ?? "notifications@alonapp.com";

/**
 * Send a transactional email. If RESEND_API_KEY is unset (local dev), logs and
 * skips instead of throwing — email must never break the DB flow it follows.
 * `fromName` lets client-facing mail read as coming from the workspace while
 * still sending from our shared domain.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  react: ReactElement;
  fromName?: string;
}): Promise<void> {
  const from = opts.fromName
    ? `${opts.fromName} <${FROM_ADDRESS}>`
    : `Alon <${FROM_ADDRESS}>`;

  if (!resend) {
    console.log(
      `[email skipped: no RESEND_API_KEY] from="${from}" to=${opts.to} subject="${opts.subject}"`
    );
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    react: opts.react,
  });
  if (error) {
    console.error("[email error]", opts.subject, error);
  }
}
