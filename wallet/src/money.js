// Monetary helpers. All amounts in the wallet are stored as integer cents.

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Formats integer cents as a USD string, e.g. 1599 -> "$15.99". */
export function formatCents(cents) {
  return usd.format(cents / 100);
}

/** Returns true when the value is a non-negative safe integer number of cents. */
export function isValidCents(value) {
  return Number.isSafeInteger(value) && value >= 0;
}
