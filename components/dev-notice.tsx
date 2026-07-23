/**
 * Alon is pre-launch. This sits on Alon's own surfaces (marketing, freelancer
 * app) but never on a client portal — the portal is the freelancer's shopfront
 * in front of their paying client, and a beta warning there undercuts them.
 */
export function DevNotice() {
  return (
    <div className="border-b bg-accent text-accent-foreground">
      <p className="mx-auto max-w-5xl px-4 py-2 text-center text-xs sm:text-sm">
        Alon is still in development — expect rough edges and the occasional
        surprise.{" "}
        <a
          href="mailto:support@alonapp.com?subject=Alon%20issue%20report"
          className="rounded-sm font-medium underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Report an issue
        </a>{" "}
        and we&rsquo;ll take a look.
      </p>
    </div>
  );
}
