import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { planForPriceId, verifyPaddleSignature, type Plan } from "@/lib/paddle";

/**
 * Paddle subscription lifecycle → workspaces.plan.
 *
 * Service-role only by design: since 20260723000600 the `authenticated` role
 * has no write grant on `plan`, so this handler is the only path that can move
 * a workspace between tiers.
 */

type PaddleEvent = {
  event_id?: string;
  event_type?: string;
  data?: {
    id?: string;
    customer_id?: string;
    status?: string;
    custom_data?: { workspace_id?: string } | null;
    items?: { price?: { id?: string } }[];
  };
};

/** The plan a subscription's line items add up to (highest tier wins). */
function planFromItems(event: PaddleEvent): Plan | null {
  const plans = (event.data?.items ?? [])
    .map((item) => planForPriceId(item.price?.id))
    .filter((p): p is Plan => p !== null);
  if (plans.includes("pro")) return "pro";
  if (plans.includes("starter")) return "starter";
  return null;
}

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  // Mirrors lib/email.ts: unconfigured is a loud no-op, never a silent success.
  if (!secret) {
    console.warn("[paddle] webhook received but PADDLE_WEBHOOK_SECRET is unset");
    return NextResponse.json({ error: "Billing is not configured" }, { status: 503 });
  }

  // Must read the raw body before parsing — the signature covers these bytes.
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");
  if (!verifyPaddleSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed body" }, { status: 400 });
  }

  const type = event.event_type;
  if (
    type !== "subscription.created" &&
    type !== "subscription.updated" &&
    type !== "subscription.canceled"
  ) {
    // Recognised delivery, nothing to do — 200 so Paddle stops retrying.
    return NextResponse.json({ ok: true, ignored: type ?? null });
  }

  const subscriptionId = event.data?.id ?? null;
  const workspaceId = event.data?.custom_data?.workspace_id ?? null;
  const admin = createAdminClient();

  // Checkout stamps custom_data.workspace_id; later events for the same
  // subscription resolve by the ID we stored the first time.
  let targetId = workspaceId;
  if (!targetId && subscriptionId) {
    const { data } = await admin
      .from("workspaces")
      .select("id")
      .eq("paddle_subscription_id", subscriptionId)
      .maybeSingle();
    targetId = data?.id ?? null;
  }
  if (!targetId) {
    console.error("[paddle] no workspace for event", event.event_id, subscriptionId);
    return NextResponse.json({ ok: true, matched: false });
  }

  const canceled =
    type === "subscription.canceled" || event.data?.status === "canceled";
  const plan: Plan = canceled ? "free" : (planFromItems(event) ?? "free");

  const { error } = await admin
    .from("workspaces")
    .update({
      plan,
      paddle_customer_id: event.data?.customer_id ?? null,
      // Keep the link on cancel so a resubscribe still resolves by ID.
      paddle_subscription_id: subscriptionId,
    })
    .eq("id", targetId);

  if (error) {
    console.error("[paddle] could not update workspace", error.message);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, plan });
}
