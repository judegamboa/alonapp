import { Heading, Text } from "@react-email/components";
import {
  BrandedEmail,
  CtaButton,
  type EmailWorkspace,
} from "./components/branded-email";
import { formatAmount } from "@/lib/currency";

export default function PaymentRequest({
  workspace = { name: "Cruz Design Studio", logo_url: null, brand_color: "#0E6B5C" },
  clientName = "Ayla",
  amount = 450,
  currency = "USD",
  description = "Deposit — brand refresh",
  url = "https://www.alonapp.com/p/example",
}: {
  workspace?: EmailWorkspace;
  clientName?: string;
  amount?: number;
  currency?: string;
  description?: string;
  url?: string;
}) {
  const brand = workspace.brand_color ?? "#0E6B5C";
  const formatted = formatAmount(amount, currency);
  return (
    <BrandedEmail
      workspace={workspace}
      preview={`${workspace.name} sent a payment request for ${formatted}`}
    >
      <Heading style={{ margin: "0 0 12px", fontSize: "20px", color: "#10231f" }}>
        New payment request
      </Heading>
      <Text style={{ color: "#3f4f4b", lineHeight: "22px" }}>
        Hi {clientName}, {workspace.name} sent you a payment request.
      </Text>
      <Text
        style={{
          margin: "8px 0 0",
          fontSize: "24px",
          color: brand,
          fontWeight: 700,
        }}
      >
        {formatted}
      </Text>
      <Text style={{ margin: "4px 0 0", color: "#3f4f4b", lineHeight: "22px" }}>
        {description}
      </Text>
      <Text style={{ margin: "16px 0" }}>
        <CtaButton href={url} color={brand}>
          View in your portal
        </CtaButton>
      </Text>
    </BrandedEmail>
  );
}
