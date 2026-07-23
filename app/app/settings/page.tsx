import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWorkspace } from "@/lib/workspace";
import { BrandingForm } from "./branding-form";
import { BillingSection } from "./billing-section";

export default async function SettingsPage() {
  const workspace = await getWorkspace();
  if (!workspace) redirect("/app/onboarding");

  return (
    <main className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Shown on every client portal and email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingForm
            name={workspace.name}
            brandColor={workspace.brand_color ?? "#0F766E"}
            logoUrl={workspace.logo_url}
          />
        </CardContent>
      </Card>
      <BillingSection workspace={workspace} />
    </main>
  );
}
