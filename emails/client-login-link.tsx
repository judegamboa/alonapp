import { Heading, Text } from "@react-email/components";
import {
  BrandedEmail,
  CtaButton,
  type EmailWorkspace,
} from "./components/branded-email";

export default function ClientLoginLink({
  workspace = { name: "Cruz Design Studio", logo_url: null, brand_color: "#0E6B5C" },
  clientName = "Ayla",
  loginUrl = "https://www.alonapp.com/p/example",
}: {
  workspace?: EmailWorkspace;
  clientName?: string;
  loginUrl?: string;
}) {
  const brand = workspace.brand_color ?? "#0E6B5C";
  return (
    <BrandedEmail
      workspace={workspace}
      preview={`Your sign-in link for ${workspace.name}`}
    >
      <Heading style={{ margin: "0 0 12px", fontSize: "20px", color: "#10231f" }}>
        Sign back in to your portal
      </Heading>
      <Text style={{ color: "#3f4f4b", lineHeight: "22px" }}>
        Hi {clientName}, here&rsquo;s a fresh link to your {workspace.name}{" "}
        portal.
      </Text>
      <Text style={{ margin: "16px 0" }}>
        <CtaButton href={loginUrl} color={brand}>
          Open your portal
        </CtaButton>
      </Text>
      <Text style={{ fontSize: "13px", color: "#5c6f6b" }}>
        The link works once and expires in 24 hours. If you didn&rsquo;t ask for
        it, you can ignore this email.
      </Text>
    </BrandedEmail>
  );
}
