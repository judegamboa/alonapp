"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tideline } from "@/components/tideline";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/settings", label: "Settings" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const active =
          link.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative rounded-md px-3 py-1.5 text-sm hover:bg-muted",
              active ? "font-medium" : "text-muted-foreground"
            )}
          >
            {link.label}
            {active && (
              <Tideline className="absolute -bottom-1 left-3 right-3 h-2 w-auto text-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
