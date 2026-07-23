import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { COMMON_CURRENCIES, formatAmount } from "@/lib/currency";
import {
  addPaymentRequest,
  deletePaymentRequest,
  setPaymentRequestPaid,
} from "../../payment-requests/actions";

type PaymentRequest = {
  id: string;
  amount: number;
  currency: string;
  description: string;
  payment_url: string | null;
  status: "unpaid" | "paid";
  paid_at: string | null;
};

export async function PaymentRequestsSection({
  clientId,
}: {
  clientId: string;
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payment_requests")
    .select("id, amount, currency, description, payment_url, status, paid_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  const requests = (data ?? []) as PaymentRequest[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment requests</CardTitle>
        <CardDescription>
          Paste your own payment link — PayPal.me, Wise, GCash. Alon never
          handles the money, so mark each one paid yourself once it lands.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {requests.map((request) => {
          const paid = request.status === "paid";
          return (
            <div key={request.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-lg font-semibold">
                    {formatAmount(request.amount, request.currency)}
                  </p>
                  <p className="break-words text-sm text-muted-foreground">
                    {request.description}
                  </p>
                  {request.payment_url && (
                    <a
                      href={request.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm text-primary underline"
                    >
                      Payment link
                    </a>
                  )}
                </div>
                <Badge
                  className={
                    paid
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-foreground"
                  }
                >
                  {paid ? "Paid" : "Unpaid"}
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <form
                  action={setPaymentRequestPaid.bind(
                    null,
                    request.id,
                    clientId,
                    !paid
                  )}
                >
                  <Button type="submit" size="sm" variant="outline">
                    {paid ? "Mark unpaid" : "Mark paid"}
                  </Button>
                </form>
                <form
                  action={deletePaymentRequest.bind(null, request.id, clientId)}
                  className="ml-auto"
                >
                  <button
                    type="submit"
                    aria-label={`Delete payment request "${request.description}"`}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        {requests.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No payment requests yet — send the first one so your client knows
            what to pay and where.
          </p>
        )}

        <form
          action={addPaymentRequest.bind(null, clientId)}
          className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3"
        >
          <div className="flex flex-wrap items-end gap-2">
            <div className="grid gap-1.5">
              <label htmlFor="pr-amount" className="text-sm font-medium">
                Amount
              </label>
              <Input
                id="pr-amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="450.00"
                required
                className="w-32 font-mono"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="pr-currency" className="text-sm font-medium">
                Currency
              </label>
              <select
                id="pr-currency"
                name="currency"
                defaultValue="USD"
                className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {COMMON_CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="pr-currency-other" className="text-sm font-medium">
                Or another code
              </label>
              <Input
                id="pr-currency-other"
                name="currency_other"
                placeholder="SGD"
                maxLength={3}
                className="w-24 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="pr-description" className="text-sm font-medium">
              What it&rsquo;s for
            </label>
            <Input
              id="pr-description"
              name="description"
              placeholder="e.g. Deposit — brand refresh"
              required
              minLength={2}
              maxLength={200}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="pr-url" className="text-sm font-medium">
              Payment link <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="pr-url"
              name="payment_url"
              type="url"
              placeholder="https://paypal.me/yourname/450"
            />
          </div>

          <div>
            <Button type="submit">Send payment request</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
