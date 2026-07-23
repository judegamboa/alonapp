import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyPaddleSignature } from "../lib/paddle";

/**
 * Webhook signature verification is the only thing standing between a public
 * endpoint and `workspaces.plan`, so it gets tested without needing a Paddle
 * account: we sign payloads ourselves the way Paddle does.
 */

const SECRET = "pdl_ntfset_test_secret";
const BODY = JSON.stringify({
  event_type: "subscription.created",
  data: { id: "sub_123" },
});

function sign(body: string, secret: string, at: Date) {
  const ts = Math.floor(at.getTime() / 1000).toString();
  const h1 = createHmac("sha256", secret).update(`${ts}:${body}`).digest("hex");
  return `ts=${ts};h1=${h1}`;
}

describe("verifyPaddleSignature", () => {
  const now = new Date("2026-07-23T12:00:00Z");

  it("accepts a correctly signed payload", () => {
    const header = sign(BODY, SECRET, now);
    expect(verifyPaddleSignature(BODY, header, SECRET, now)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const header = sign(BODY, SECRET, now);
    const tampered = BODY.replace("sub_123", "sub_evil");
    expect(verifyPaddleSignature(tampered, header, SECRET, now)).toBe(false);
  });

  it("rejects a signature made with a different secret", () => {
    const header = sign(BODY, "wrong-secret", now);
    expect(verifyPaddleSignature(BODY, header, SECRET, now)).toBe(false);
  });

  it("rejects a stale timestamp (replay)", () => {
    const old = new Date(now.getTime() - 10 * 60_000);
    const header = sign(BODY, SECRET, old);
    expect(verifyPaddleSignature(BODY, header, SECRET, now)).toBe(false);
  });

  it("rejects timestamps too far in the future", () => {
    const ahead = new Date(now.getTime() + 10 * 60_000);
    const header = sign(BODY, SECRET, ahead);
    expect(verifyPaddleSignature(BODY, header, SECRET, now)).toBe(false);
  });

  it("rejects malformed, missing, or empty headers", () => {
    const cases = [
      null,
      "",
      "garbage",
      "ts=;h1=",
      "h1=abc",
      `ts=${Math.floor(now.getTime() / 1000)}`,
      `ts=notanumber;h1=abc`,
    ];
    for (const header of cases) {
      expect(verifyPaddleSignature(BODY, header, SECRET, now), String(header)).toBe(
        false
      );
    }
  });

  it("rejects a short hex digest without throwing", () => {
    // timingSafeEqual throws on length mismatch — the length guard must catch it.
    const ts = Math.floor(now.getTime() / 1000);
    expect(verifyPaddleSignature(BODY, `ts=${ts};h1=ab`, SECRET, now)).toBe(false);
  });

  it("rejects when no secret is configured", () => {
    const header = sign(BODY, SECRET, now);
    expect(verifyPaddleSignature(BODY, header, "", now)).toBe(false);
  });
});
