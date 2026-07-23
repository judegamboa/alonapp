import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Paddle Billing webhook verification, hand-rolled on node crypto.
 *
 * No SDK: we have no Paddle account yet, and this is the only piece of the
 * integration that must be right on day one. Plain crypto is unit-testable
 * without credentials and adds no dependency.
 */

export type Plan = "free" | "starter" | "pro";

/** Reject signatures older than this to blunt replay. */
const MAX_SIGNATURE_AGE_SECONDS = 5 * 60;

/** True once the webhook secret and both price IDs are configured. */
export function paddleConfigured(): boolean {
  return Boolean(
    process.env.PADDLE_WEBHOOK_SECRET &&
      process.env.PADDLE_PRICE_STARTER &&
      process.env.PADDLE_PRICE_PRO
  );
}

/**
 * Whether the local-only plan switcher may exist.
 *
 * Two independent guards, because this is the one code path that could hand
 * out a paid tier for free: it must be a development build AND billing must be
 * unconfigured. Checked again inside the server action — a hidden form can
 * still be posted.
 */
export function devPlanSwitchAllowed(): boolean {
  return process.env.NODE_ENV !== "production" && !paddleConfigured();
}

/** Map a Paddle price ID back to the plan it sells. */
export function planForPriceId(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  if (priceId === process.env.PADDLE_PRICE_STARTER) return "starter";
  if (priceId === process.env.PADDLE_PRICE_PRO) return "pro";
  return null;
}

/** Parse `ts=1671552777;h1=<hex>` into its parts. */
function parseSignatureHeader(header: string) {
  const parts = new Map<string, string>();
  for (const segment of header.split(";")) {
    const index = segment.indexOf("=");
    if (index === -1) continue;
    parts.set(segment.slice(0, index).trim(), segment.slice(index + 1).trim());
  }
  const ts = parts.get("ts");
  const h1 = parts.get("h1");
  if (!ts || !h1 || !/^\d+$/.test(ts) || !/^[0-9a-f]+$/i.test(h1)) return null;
  return { ts, h1 };
}

/**
 * Verify a Paddle webhook. The HMAC-SHA256 covers `${ts}:${rawBody}`, so the
 * caller must pass the exact bytes received — read the body with
 * `request.text()` before any JSON parsing, or the signature is unverifiable.
 */
export function verifyPaddleSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  now: Date = new Date()
): boolean {
  if (!header || !secret) return false;

  const parsed = parseSignatureHeader(header);
  if (!parsed) return false;

  const ageSeconds = Math.floor(now.getTime() / 1000) - Number(parsed.ts);
  if (!Number.isFinite(ageSeconds) || Math.abs(ageSeconds) > MAX_SIGNATURE_AGE_SECONDS) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${parsed.ts}:${rawBody}`)
    .digest();
  const received = Buffer.from(parsed.h1, "hex");

  // timingSafeEqual throws on length mismatch, so check that first.
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}
