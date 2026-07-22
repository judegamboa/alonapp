import { Heading, Text } from "@react-email/components";
import { BrandedEmail, CtaButton } from "./components/branded-email";

// Alon's own branding — this one goes to the freelancer, from us.
const ALON = { name: "Alon", logo_url: null, brand_color: "#0E6B5C" };

export default function FreelancerAuth({
  kind = "confirm",
  actionUrl = "https://www.alonapp.com/auth/confirm",
}: {
  kind?: "confirm" | "reset";
  actionUrl?: string;
}) {
  const confirming = kind === "confirm";
  return (
    <BrandedEmail
      workspace={ALON}
      preview={confirming ? "Confirm your Alon account" : "Reset your Alon password"}
    >
      <Heading style={{ margin: "0 0 12px", fontSize: "20px", color: "#10231f" }}>
        {confirming ? "Confirm your email" : "Reset your password"}
      </Heading>
      <Text style={{ color: "#3f4f4b", lineHeight: "22px" }}>
        {confirming
          ? "Welcome to Alon. Confirm your email to finish setting up your workspace."
          : "We got a request to reset your Alon password. Choose a new one below."}
      </Text>
      <Text style={{ margin: "16px 0" }}>
        <CtaButton href={actionUrl} color="#0E6B5C">
          {confirming ? "Confirm email" : "Reset password"}
        </CtaButton>
      </Text>
      <Text style={{ fontSize: "13px", color: "#5c6f6b" }}>
        If you didn&rsquo;t {confirming ? "sign up" : "request this"}, you can
        safely ignore this email.
      </Text>
    </BrandedEmail>
  );
}
