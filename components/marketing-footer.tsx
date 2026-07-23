import Link from "next/link";
import { Tideline } from "@/components/tideline";

const linkClass =
  "rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50";

// Shared by the landing page and the legal pages so the wordmark, tideline and
// nav stay in one place.
export function MarketingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center">
        <span className="font-heading text-lg font-bold">alon</span>
        <Tideline className="w-24 text-primary/40" />
        <p className="text-sm text-muted-foreground">
          Made for Filipino freelancers and their clients everywhere.
        </p>
        <nav className="mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <Link href="/privacy" className={linkClass}>
            Privacy
          </Link>
          <Link href="/terms" className={linkClass}>
            Terms
          </Link>
          <a href="mailto:support@alonapp.com" className={linkClass}>
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
