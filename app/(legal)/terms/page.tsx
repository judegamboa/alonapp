import type { Metadata } from "next";
import { LegalPage, LegalSection } from "../prose";

export const metadata: Metadata = {
  title: "Terms — Alon",
  description:
    "The terms you agree to when you use Alon: your account, your content, plans and billing, and how either side can end it.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <LegalPage title="Terms of service" updated="23 July 2026">
      <LegalSection heading="Who this is between">
        <p>
          These terms cover your use of Alon at alonapp.com. By creating an
          account you agree to them. If you are using Alon for a registered
          business, you are agreeing on that business&rsquo;s behalf.
        </p>
      </LegalSection>

      <LegalSection heading="Alon is in development">
        <p>
          Alon is pre-launch. Features can change, move or be withdrawn, and
          things will occasionally break. Keep your own copies of files that
          matter to you — do not treat Alon as your only archive.
        </p>
      </LegalSection>

      <LegalSection heading="Your account">
        <p>
          Keep your sign-in details to yourself; you are responsible for what
          happens under your account. One account is for one person or business
          — do not resell portals as your own product. Tell us at{" "}
          <a href="mailto:support@alonapp.com">support@alonapp.com</a> if you
          think someone else has got in.
        </p>
      </LegalSection>

      <LegalSection heading="Your content stays yours">
        <p>
          Everything you and your clients put into Alon — files, messages,
          project details, your logo and brand — belongs to you. You give us
          only the permission needed to store it, show it to the right people
          and include it in the emails Alon sends on your behalf. We do not use
          it for anything else.
        </p>
        <p>
          You are responsible for having the right to upload what you upload,
          and for what you send your clients through Alon.
        </p>
      </LegalSection>

      <LegalSection heading="What you may not do">
        <ul>
          <li>
            Use Alon to send spam, or to share malware or anything unlawful.
          </li>
          <li>
            Try to reach another workspace&rsquo;s data, or probe the service
            for ways to do so. If you find a hole, tell us — we would much
            rather hear from you.
          </li>
          <li>
            Resell, sublicense or white-label Alon itself as your own software.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Plans and billing">
        <p>
          Free lets you run one client portal. Paid plans raise the limit and
          remove the Alon watermark, at the prices shown on our pricing section.
          Paid plans are billed monthly through Paddle, which acts as merchant
          of record and handles tax.
        </p>
        <p>
          Cancel any time and you keep your plan until the end of the period you
          have paid for. After that, portals you already have keep working and
          your clients keep their access — you simply cannot create new ones
          until you are back under the limit. Because plans are month to month
          we do not usually give partial refunds, but email us if something has
          gone wrong and we will sort it out.
        </p>
      </LegalSection>

      <LegalSection heading="Payments between you and your client">
        <p>
          Payment requests carry your own PayPal, Wise or GCash link. Your
          client pays you directly. Alon does not process, hold or guarantee
          that money, takes no cut of it, and is not a party to your agreement
          with your client. Invoicing, taxes and disputes with your client are
          between the two of you.
        </p>
      </LegalSection>

      <LegalSection heading="Availability and liability">
        <p>
          We work to keep Alon up but we do not promise uninterrupted service,
          and it is provided as is. To the extent the law allows, our liability
          to you is limited to what you have paid us in the twelve months before
          the claim, and we are not liable for lost profits or lost business.
        </p>
      </LegalSection>

      <LegalSection heading="Ending it">
        <p>
          You can close your account whenever you like — see the deletion
          section in our privacy page. We can suspend or close an account that
          breaks these terms, and will tell you why unless we are legally unable
          to.
        </p>
      </LegalSection>

      <LegalSection heading="Changes and governing law">
        <p>
          We will email account holders before any material change to these
          terms. They are governed by the laws of the Republic of the
          Philippines. Questions go to{" "}
          <a href="mailto:support@alonapp.com">support@alonapp.com</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
