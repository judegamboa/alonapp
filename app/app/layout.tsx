import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(auth)/actions";
import { NavLinks } from "./nav-links";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/app" className="font-heading text-lg font-bold">
              alon
            </Link>
            <NavLinks />
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
    </div>
  );
}
