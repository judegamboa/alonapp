import type { Metadata } from "next";
import { LegalPage, LegalSection } from "../prose";

export const metadata: Metadata = {
  title: "Privacy — Alon",
  description:
    "What Alon collects, where it is stored, who we share it with, and how to get it deleted.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy" updated="23 July 2026">
      <LegalSection heading="The short version">
        <p>
          Alon holds the work you put into it — your clients&rsquo; names and
          email addresses, your projects, files, messages and payment requests
          — so it can show them back to the right person. We do not sell it, we
          do not use it to train anything, and we do not send you marketing you
          did not ask for.
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <ul>
          <li>
            <strong>Your account:</strong> email address, and a password if you
            did not sign in with Google.
          </li>
          <li>
            <strong>Your workspace:</strong> business name, logo and brand
            color.
          </li>
          <li>
            <strong>Your clients:</strong> the name and email address you enter
            for each client, so we can send them their portal link.
          </li>
          <li>
            <strong>Your work:</strong> projects, milestones, files you upload,
            messages in both directions, and payment requests.
          </li>
          <li>
            <strong>Basic usage data:</strong> anonymous page analytics through
            Vercel Analytics. No cookies for tracking, no advertising networks.
          </li>
        </ul>
        <p>
          We do not collect card numbers or bank details. Payment requests carry
          a link to your own PayPal, Wise or GCash — the money moves between you
          and your client, never through Alon.
        </p>
      </LegalSection>

      <LegalSection heading="Where it lives">
        <p>
          Data is stored in Supabase (Postgres and file storage) and the site
          runs on Vercel. Uploaded files sit in a private bucket and are only
          ever served through short-lived links that expire after about an hour.
          Every record is tagged to a workspace and the separation between
          workspaces is enforced in the database, not just in the app.
        </p>
      </LegalSection>

      <LegalSection heading="Who else sees it">
        <p>Only the services Alon needs to work:</p>
        <ul>
          <li>
            <strong>Supabase</strong> — database, authentication and file
            storage.
          </li>
          <li>
            <strong>Vercel</strong> — hosting and anonymous analytics.
          </li>
          <li>
            <strong>Resend</strong> — sending the notification and sign-in
            emails, which means the recipient&rsquo;s address and the contents
            of that email.
          </li>
          <li>
            <strong>Paddle</strong> — our merchant of record for paid plans.
            Paddle handles the payment and holds the billing details; we only
            receive which plan you are on.
          </li>
          <li>
            <strong>Google</strong> — only if you choose to sign in with it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Your clients">
        <p>
          Your clients never create an account. We hold their name and email
          address because you entered them, and we use the address only to send
          their sign-in link and the notifications about your work together. A
          client can ask you or us to remove them at any time.
        </p>
      </LegalSection>

      <LegalSection heading="Deleting your data">
        <p>
          Delete a client or a project in the app and it goes. To delete your
          whole account and everything in it, email{" "}
          <a href="mailto:support@alonapp.com?subject=Delete%20my%20Alon%20account">
            support@alonapp.com
          </a>{" "}
          and we will remove it within 30 days. Backups roll off within 30 days
          after that.
        </p>
      </LegalSection>

      <LegalSection heading="Changes and contact">
        <p>
          If this policy changes in a way that matters, we will email account
          holders before it takes effect. Questions about any of it go to{" "}
          <a href="mailto:support@alonapp.com">support@alonapp.com</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
