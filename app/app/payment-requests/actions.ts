"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { COMMON_CURRENCIES, CURRENCY_CODE } from "@/lib/currency";
import { notifyPaymentRequest } from "@/lib/notify";

const uuidSchema = z.string().uuid();
const amountSchema = z.coerce.number().positive().max(99_999_999);
const descriptionSchema = z.string().trim().min(2, "Too short").max(200);
const urlSchema = z.string().trim().url();

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return supabase;
}

// All mutations run as the freelancer's session — RLS scopes every row to
// workspaces they own, so a forged clientId simply matches nothing.

/** The dropdown wins unless a valid 3-letter code was typed into "Other". */
function resolveCurrency(formData: FormData): string {
  const other = formData.get("currency_other");
  if (typeof other === "string" && CURRENCY_CODE.test(other.trim())) {
    return other.trim().toUpperCase();
  }
  const picked = z.enum(COMMON_CURRENCIES).safeParse(formData.get("currency"));
  return picked.success ? picked.data : "USD";
}

export async function addPaymentRequest(clientId: string, formData: FormData) {
  const supabase = await requireUser();
  if (!uuidSchema.safeParse(clientId).success) return;

  const amount = amountSchema.safeParse(formData.get("amount"));
  const description = descriptionSchema.safeParse(formData.get("description"));
  if (!amount.success || !description.success) return;

  // A payment link is optional — some freelancers just state the amount and
  // send GCash details separately.
  const rawUrl = formData.get("payment_url");
  const url = typeof rawUrl === "string" && rawUrl.trim() ? urlSchema.safeParse(rawUrl) : null;
  if (url && !url.success) return;

  const currency = resolveCurrency(formData);

  const { data: client } = await supabase
    .from("clients")
    .select("id, workspace_id")
    .eq("id", clientId)
    .maybeSingle();
  if (!client) return;

  const { error } = await supabase.from("payment_requests").insert({
    workspace_id: client.workspace_id,
    client_id: clientId,
    amount: amount.data,
    currency,
    description: description.data,
    payment_url: url ? url.data : null,
  });
  revalidatePath(`/app/clients/${clientId}`);
  if (error) return;

  await notifyPaymentRequest(clientId, {
    amount: amount.data,
    currency,
    description: description.data,
  });
}

export async function setPaymentRequestPaid(
  paymentRequestId: string,
  clientId: string,
  paid: boolean
) {
  const supabase = await requireUser();
  await supabase
    .from("payment_requests")
    .update({
      status: paid ? "paid" : "unpaid",
      paid_at: paid ? new Date().toISOString() : null,
    })
    .eq("id", paymentRequestId);
  revalidatePath(`/app/clients/${clientId}`);
}

export async function deletePaymentRequest(
  paymentRequestId: string,
  clientId: string
) {
  const supabase = await requireUser();
  await supabase.from("payment_requests").delete().eq("id", paymentRequestId);
  revalidatePath(`/app/clients/${clientId}`);
}
