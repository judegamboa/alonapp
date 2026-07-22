import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tideline } from "@/components/tideline";

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
  },
  {
    name: "Starter",
    price: "₱499",
    period: "/mo",
    features: ["5 client portals", "Your logo and colors", "No Alon watermark"],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "₱1,499",
    period: "/mo",
    features: ["Unlimited portals", "Custom portal subdomain", "Priority support"],
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
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-heading text-xl font-bold tracking-tight">
          alon
        </span>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Log in
          </Button>
          <Button size="sm" render={<Link href="/signup" />}>
            Get started
          </Button>
        </nav>
      </header>

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
                One link. No more &ldquo;saan na tayo?&rdquo; — your client
                already knows.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-10 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title}>
                <h2 className="font-heading text-lg font-semibold">
                  {f.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t bg-card">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-center font-heading text-3xl font-bold">
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
                  <p className="text-sm font-medium">{tier.name}</p>
                  <p className="mt-2 font-mono text-3xl font-semibold">
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
                    Get started
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center">
          <span className="font-heading text-lg font-bold">alon</span>
          <Tideline className="w-24 text-primary/40" />
          <p className="text-sm text-muted-foreground">
            Made for Filipino freelancers and their clients everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
