import { DevNotice } from "@/components/dev-notice";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DevNotice />
      <MarketingHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-20 pt-10">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
