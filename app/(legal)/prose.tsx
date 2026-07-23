import { Tideline } from "@/components/tideline";

// Shared shell for the legal pages: no typography plugin here, so the prose
// rhythm is spelled out once instead of per page.
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article>
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <Tideline className="mt-5 w-24 text-primary/40" />
      <p className="mt-5 text-sm text-muted-foreground">
        Last updated {updated}
      </p>
      <div className="mt-10 space-y-8">{children}</div>
    </article>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-semibold">{heading}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}
