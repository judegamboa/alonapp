import { Heading, Text } from "@react-email/components";
import {
  BrandedEmail,
  CtaButton,
  type EmailWorkspace,
} from "./components/branded-email";

export default function ClientInvite({
  workspace = { name: "Cruz Design Studio", logo_url: null, brand_color: "#0E6B5C" },
  clientName = "Ayla",
  inviteUrl = "https://www.alonapp.com/p/example",
}: {
  workspace?: EmailWorkspace;
  clientName?: string;
  inviteUrl?: string;
}) {
  const brand = workspace.brand_color ?? "#0E6B5C";
  return (
    <BrandedEmail
      workspace={workspace}
      preview={`${workspace.name} invited you to your client portal`}
    >
      <Heading style={{ margin: "0 0 12px", fontSize: "20px", color: "#10231f" }}>
        Hi {clientName}, your portal is ready
      </Heading>
      <Text style={{ color: "#3f4f4b", lineHeight: "22px" }}>
        {workspace.name} set up a private portal where you can follow project
        status, download files, message them, and see payment requests — all in
        one place.
      </Text>
      <Text style={{ margin: "16px 0" }}>
        <CtaButton href={inviteUrl} color={brand}>
          Open your portal
        </CtaButton>
      </Text>
      <Text style={{ fontSize: "13px", color: "#5c6f6b" }}>
        This link signs you in — no password needed. It works once and expires
        in 24 hours.
      </Text>
    </BrandedEmail>
  );
}
