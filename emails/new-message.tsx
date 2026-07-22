import { Heading, Text } from "@react-email/components";
import {
  BrandedEmail,
  CtaButton,
  type EmailWorkspace,
} from "./components/branded-email";

export default function NewMessage({
  workspace = { name: "Cruz Design Studio", logo_url: null, brand_color: "#0E6B5C" },
  authorName = "Cruz Design Studio",
  threadTitle = "Kickoff",
  preview = "Concepts land Thursday — preview attached.",
  url = "https://www.alonapp.com/p/example",
}: {
  workspace?: EmailWorkspace;
  authorName?: string;
  threadTitle?: string;
  preview?: string;
  url?: string;
}) {
  const brand = workspace.brand_color ?? "#0E6B5C";
  return (
    <BrandedEmail
      workspace={workspace}
      preview={`${authorName}: ${preview}`}
    >
      <Heading style={{ margin: "0 0 4px", fontSize: "18px", color: "#10231f" }}>
        New message in &ldquo;{threadTitle}&rdquo;
      </Heading>
      <Text style={{ margin: "0 0 12px", fontSize: "13px", color: "#5c6f6b" }}>
        from {authorName}
      </Text>
      <Text
        style={{
          color: "#3f4f4b",
          lineHeight: "22px",
          borderLeft: `3px solid ${brand}`,
          paddingLeft: "12px",
        }}
      >
        {preview}
      </Text>
      <Text style={{ margin: "16px 0" }}>
        <CtaButton href={url} color={brand}>
          Read and reply
        </CtaButton>
      </Text>
    </BrandedEmail>
  );
}
