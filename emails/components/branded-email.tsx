import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export type EmailWorkspace = {
  name: string;
  logo_url: string | null;
  brand_color: string | null;
};

const font =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function BrandedEmail({
  workspace,
  preview,
  children,
  footerNote = "Sent via Alon — alonapp.com",
}: {
  workspace: EmailWorkspace;
  preview: string;
  children: ReactNode;
  footerNote?: string;
}) {
  const brand = workspace.brand_color ?? "#0E6B5C";
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f5f6f4", margin: 0, fontFamily: font }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "24px" }}>
          <Section style={{ paddingBottom: "16px" }}>
            {workspace.logo_url ? (
              <Img
                src={workspace.logo_url}
                alt={workspace.name}
                height="36"
                style={{ borderRadius: "6px", objectFit: "contain" }}
              />
            ) : (
              <span
                style={{
                  display: "inline-block",
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  backgroundColor: brand,
                  color: "#ffffff",
                  textAlign: "center",
                  lineHeight: "36px",
                  fontWeight: 700,
                }}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </span>
            )}
            <Text style={{ margin: "8px 0 0", fontWeight: 600, color: "#10231f" }}>
              {workspace.name}
            </Text>
          </Section>
          <Section
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              borderTop: `4px solid ${brand}`,
              padding: "24px",
            }}
          >
            {children}
          </Section>
          <Hr style={{ borderColor: "#e2e8e4", margin: "24px 0 12px" }} />
          <Text style={{ margin: 0, fontSize: "12px", color: "#5c6f6b" }}>
            {footerNote}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function CtaButton({
  href,
  color,
  children,
}: {
  href: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <Button
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: color,
        color: "#ffffff",
        borderRadius: "8px",
        padding: "10px 18px",
        fontSize: "14px",
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      {children}
    </Button>
  );
}
