import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

const sectionLinkClass =
  "rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50";

// Shared by the landing page and the legal pages. Section links use root-
// relative hashes (/#pricing) so they resolve correctly from /privacy and
// /terms too, not just from the landing page itself.
export function MarketingHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link
        href="/"
        className="rounded-sm font-heading text-xl font-bold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        alon
      </Link>
      {/* Plain <a>, not next/link: Link only scrolls to a fragment on a real
          route change, and these mostly target a hash on the current page. */}
      <nav aria-label="Sections" className="hidden items-center gap-6 sm:flex">
        {sections.map((section) => (
          <a key={section.href} href={section.href} className={sectionLinkClass}>
            {section.label}
          </a>
        ))}
      </nav>
      <nav className="flex items-center gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/login" />}>
          Log in
        </Button>
        <Button size="sm" render={<Link href="/signup" />}>
          Get started
        </Button>
      </nav>
    </header>
  );
}
