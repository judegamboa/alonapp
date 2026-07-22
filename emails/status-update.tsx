import { Heading, Text } from "@react-email/components";
import {
  BrandedEmail,
  CtaButton,
  type EmailWorkspace,
} from "./components/branded-email";

export default function StatusUpdate({
  workspace = { name: "Cruz Design Studio", logo_url: null, brand_color: "#0E6B5C" },
  clientName = "Ayla",
  projectName = "Brand refresh",
  oldStatus = "Not started",
  newStatus = "In progress",
  url = "https://www.alonapp.com/p/example",
}: {
  workspace?: EmailWorkspace;
  clientName?: string;
  projectName?: string;
  oldStatus?: string;
  newStatus?: string;
  url?: string;
}) {
  const brand = workspace.brand_color ?? "#0E6B5C";
  return (
    <BrandedEmail
      workspace={workspace}
      preview={`${projectName} is now ${newStatus}`}
    >
      <Heading style={{ margin: "0 0 12px", fontSize: "20px", color: "#10231f" }}>
        {projectName} moved forward
      </Heading>
      <Text style={{ color: "#3f4f4b", lineHeight: "22px" }}>
        Hi {clientName}, {workspace.name} updated your project status:
      </Text>
      <Text
        style={{
          margin: "8px 0",
          fontSize: "16px",
          color: "#10231f",
          fontWeight: 600,
        }}
      >
        {oldStatus} &rarr; <span style={{ color: brand }}>{newStatus}</span>
      </Text>
      <Text style={{ margin: "16px 0" }}>
        <CtaButton href={url} color={brand}>
          See the details
        </CtaButton>
      </Text>
    </BrandedEmail>
  );
}
