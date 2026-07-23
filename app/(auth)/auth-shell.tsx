import Link from "next/link";
import { Check } from "lucide-react";
import { Tideline } from "@/components/tideline";
import { DevNotice } from "@/components/dev-notice";
import { Card, CardContent } from "@/components/ui/card";
import { signInWithGoogle } from "./actions";
import { GoogleButton } from "./google-button";

type Props = {
  mode: "login" | "signup";
  error?: string;
  message?: string;
};

const COPY = {
  login: {
    headline: "Welcome back.",
    sub: "Sign in to your workspace.",
    button: "Continue with Google",
    crossPrompt: "No account yet?",
    crossLabel: "Sign up",
    crossHref: "/signup",
  },
  signup: {
    headline: "Give every client a portal.",
    sub: "Sign up with Google — no password to make, nothing to install.",
    button: "Sign up with Google",
    crossPrompt: "Already have an account?",
    crossLabel: "Sign in",
    crossHref: "/login",
  },
} as const;

// Only the sign-up side sells; someone hitting /login already decided.
const VALUE_POINTS = [
  "A branded portal for every client",
  "Files, messages and payment requests in one place",
  "Your client never signs up — they just get a link",
];

export function AuthShell({ mode, error, message }: Props) {
  const copy = COPY[mode];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <DevNotice />

      {/* Ambient ground: a tide wash behind the column and one big, quiet
          tideline across the bottom. Decorative only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_15%,var(--accent),transparent_70%)] opacity-70 dark:opacity-25"
      />
      <Tideline
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 w-full text-primary/10"
      />

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <Link
            href="/"
            className="rounded-sm font-heading text-2xl font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            alon
          </Link>

          <h1 className="mt-8 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {copy.headline}
          </h1>
          <Tideline animated className="mx-auto mt-5 w-40 text-primary" />
          <p className="mx-auto mt-5 max-w-sm text-muted-foreground">
            {copy.sub}
          </p>

          <Card className="mt-8 py-6 text-left shadow-lg shadow-primary/5">
            <CardContent className="flex flex-col gap-4">
              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              {message && (
                <p className="rounded-md bg-muted px-3 py-2 text-sm">
                  {message}
                </p>
              )}
              <form action={signInWithGoogle}>
                <GoogleButton label={copy.button} />
              </form>
              <p className="text-center text-xs text-muted-foreground">
                By continuing you agree to our{" "}
                <Link
                  href="/terms"
                  className="rounded-sm underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="rounded-sm underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </CardContent>
          </Card>

          {mode === "signup" && (
            <ul className="mx-auto mt-8 flex max-w-sm flex-col gap-3 text-left">
              {VALUE_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 text-sm text-muted-foreground">
            {copy.crossPrompt}{" "}
            <Link
              href={copy.crossHref}
              className="rounded-sm font-medium text-primary underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {copy.crossLabel}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
