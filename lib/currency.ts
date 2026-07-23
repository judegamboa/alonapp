// The corridor most Alon freelancers bill in (PH sellers, US/AU clients).
// Anything else is typed as a 3-letter code, so this is a shortcut, not a limit.
export const COMMON_CURRENCIES = ["USD", "PHP", "AUD"] as const;

export const CURRENCY_CODE = /^[A-Za-z]{3}$/;

/** Format an amount for display. Unknown codes fall back to "CODE 1,234.00". */
export function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}
