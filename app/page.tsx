import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tideline } from "@/components/tideline";
import { DevNotice } from "@/components/dev-notice";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";

const steps = [
  {
    title: "Brand your workspace",
    body: "Add your logo and color once. Every portal and every email your client receives carries them, not ours.",
  },
  {
    title: "Invite your client",
    body: "They get a link. No password to make, no account to create, nothing to install — the link is the whole login.",
  },
  {
    title: "They check the link, not you",
    body: "Status, milestones, files, messages and payment requests, always current. You update the work; the portal updates itself.",
  },
];

const features = [
  {
    title: "Show status without being asked",
    body: "Each project has a clear status and milestone list your client can check any time, on any device.",
  },
  {
    title: "Files and messages in one place",
    body: "Share deliverables with version history and keep every conversation threaded next to the work.",
  },
  {
    title: "Get paid without awkward follow-ups",
    body: "Send a payment request card with your PayPal, Wise, or GCash link. Mark it paid, move on.",
  },
];

const tiers = [
  {
    name: "Free",
    price: "₱0",
    period: "",
    features: ["1 client portal", "Projects, files, messages", "Payment request cards"],
    cta: "Get started",
  },
  {
    name: "Starter",
    price: "₱499",
    period: "/mo",
    features: ["5 client portals", "Your logo and colors", "No Alon watermark"],
    highlighted: true,
    cta: "Start free, upgrade later",
  },
  {
    name: "Pro",
    price: "₱1,499",
    period: "/mo",
    features: [
      "Unlimited client portals",
      "Your logo and colors",
      "Priority support",
      "Custom portal subdomain (coming soon)",
    ],
    cta: "Start free, upgrade later",
  },
];

const faqs = [
  {
    q: "Does my client need to create an account?",
    a: "No. You invite them by email and they get a link that signs them straight in. No password to remember, no app to install, nothing for you to walk them through on a call.",
  },
  {
    q: "Can one client see another client's portal?",
    a: "No. A portal only ever shows the work, files and messages belonging to that one client, and the rule is enforced by the database itself — not just by the screen they happen to be looking at.",
  },
  {
    q: "Will the portal look like my business or like Alon?",
    a: "Yours. On Starter and up, your logo and brand color carry through the portal and every email your client receives, with no Alon watermark. On Free, a small Alon mark stays in the corner.",
  },
  {
    q: "How do clients actually pay me?",
    a: "You send a payment request card with the amount and your own PayPal, Wise or GCash link. Your client pays you directly and you mark it paid. Alon never touches the money and takes no cut of it.",
  },
  {
    q: "What happens if I cancel or move down a plan?",
    a: "Nothing breaks. Portals you already have keep working and your clients keep their access — you just can't add new ones until you're back under the limit.",
  },
];

function PortalMock() {
  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl border bg-card shadow-lg shadow-primary/5">
      <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
        </span>
        <span className="ml-2 truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
          alonapp.com/p/ayla-goods
        </span>
      </div>
      <div className="grid gap-4 p-5 text-left sm:grid-cols-5 sm:p-6">
        <div className="sm:col-span-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-heading text-xs font-bold text-primary-foreground">
              C
            </span>
            <span className="text-sm font-medium">Cruz Design Studio</span>
          </div>
          <div className="mt-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Brand refresh</p>
              <Badge className="bg-accent text-accent-foreground">
                In progress
              </Badge>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  ✓
                </span>
                <s>Moodboard and direction</s>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-primary" />
                Logo concepts (this week)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border" />
                Brand guidelines
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:col-span-2">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Payment request</p>
            <p className="mt-1 font-mono text-lg font-semibold">$450.00</p>
            <p className="text-xs text-muted-foreground">Logo concepts — 50%</p>
            <span className="mt-2 inline-block rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
              Pay via Wise
            </span>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Latest message</p>
            <p className="mt-1 text-sm">
              &ldquo;Concepts land Thursday — preview attached.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <DevNotice />
      <MarketingHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 text-center sm:pt-24">
          <p className="text-sm font-medium text-primary">
            For freelancers with overseas clients
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-6xl">
            Every client gets a portal.
            <br />
            You get your evenings back.
          </h1>
          <Tideline
            animated
            className="mx-auto mt-6 w-48 text-primary sm:w-64"
          />
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Alon gives each client a branded page with project status, files,
            messages, and payment requests — so you look like an agency, not an
            inbox.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" render={<Link href="/signup" />}>
              Get started free
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/login" />}>
              Log in
            </Button>
          </div>
          <div className="mt-14">
            <PortalMock />
          </div>
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Before
              </p>
              <p className="mt-2 font-heading text-2xl font-semibold">
                Email threads, Messenger pings, Drive links, &ldquo;quick
                call?&rdquo;
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-primary">With Alon</p>
              <p className="mt-2 font-heading text-2xl font-semibold">
                One link. Your client checks it instead of checking on you.
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-5xl scroll-mt-8 px-6 py-20">
          <h2 className="max-w-2xl font-heading text-3xl font-bold tracking-tight">
            From signup to a live client portal in ten minutes
          </h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-mono text-sm font-medium text-accent-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t bg-card">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="max-w-2xl font-heading text-3xl font-bold tracking-tight">
              Everything the &ldquo;quick call&rdquo; used to be for
            </h2>
            <div className="mt-10 grid gap-10 sm:grid-cols-3">
              {features.map((f) => (
                <div key={f.title}>
                  <h3 className="font-heading text-lg font-semibold">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-8 border-t">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-center font-heading text-3xl font-bold tracking-tight">
              Simple pricing in pesos
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-xl border p-6 ${
                    tier.highlighted
                      ? "border-primary shadow-lg shadow-primary/10"
                      : ""
                  }`}
                >
                  <h3 className="text-sm font-medium">{tier.name}</h3>
                  {/* Mono gives the comma a full character advance, which
                      reads as a gap at this size — pull it back in. */}
                  <p className="mt-2 font-mono text-3xl font-semibold tracking-tight">
                    {tier.price}
                    <span className="text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {tier.features.map((feat) => (
                      <li key={feat}>{feat}</li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                    render={<Link href="/signup" />}
                  >
                    {tier.cta}
                    <span className="sr-only"> on {tier.name}</span>
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Everyone starts on Free. Paid plans open up as Alon leaves beta —
              you keep the workspace you built.
            </p>
          </div>
        </section>

        <section id="faq" className="scroll-mt-8 border-t bg-card">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              Questions freelancers ask first
            </h2>
            <div className="mt-8 divide-y border-y">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                    {faq.q}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-primary transition-transform group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t">
          {/* No tideline here — the footer's sits a screen-height below and
              two of them in view at once dilutes the signature. */}
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center">
            <h2 className="max-w-xl font-heading text-3xl font-bold tracking-tight">
              Your next client shouldn&rsquo;t have to ask.
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Set up your first portal free. It takes about ten minutes and your
              client never has to sign up for anything.
            </p>
            <Button size="lg" className="mt-8" render={<Link href="/signup" />}>
              Get started free
            </Button>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
