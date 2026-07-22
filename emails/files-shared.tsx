import { Heading, Text } from "@react-email/components";
import {
  BrandedEmail,
  CtaButton,
  type EmailWorkspace,
} from "./components/branded-email";

export default function FilesShared({
  workspace = { name: "Cruz Design Studio", logo_url: null, brand_color: "#0E6B5C" },
  clientName = "Ayla",
  filenames = ["brand-guidelines.pdf", "logo-final.svg"],
  url = "https://www.alonapp.com/p/example",
}: {
  workspace?: EmailWorkspace;
  clientName?: string;
  filenames?: string[];
  url?: string;
}) {
  const brand = workspace.brand_color ?? "#0E6B5C";
  const count = filenames.length;
  return (
    <BrandedEmail
      workspace={workspace}
      preview={`${workspace.name} shared ${count} file${count === 1 ? "" : "s"} with you`}
    >
      <Heading style={{ margin: "0 0 12px", fontSize: "20px", color: "#10231f" }}>
        {count} new file{count === 1 ? "" : "s"} for you
      </Heading>
      <Text style={{ color: "#3f4f4b", lineHeight: "22px" }}>
        Hi {clientName}, {workspace.name} shared{" "}
        {count === 1 ? "a file" : "files"} on your portal:
      </Text>
      <ul style={{ margin: "8px 0 0", paddingLeft: "18px", color: "#10231f" }}>
        {filenames.map((name) => (
          <li key={name} style={{ fontSize: "14px", lineHeight: "22px" }}>
            {name}
          </li>
        ))}
      </ul>
      <Text style={{ margin: "16px 0" }}>
        <CtaButton href={url} color={brand}>
          View files
        </CtaButton>
      </Text>
      <Text style={{ fontSize: "13px", color: "#5c6f6b" }}>
        Download them any time from your portal — we never send files as
        attachments.
      </Text>
    </BrandedEmail>
  );
}
