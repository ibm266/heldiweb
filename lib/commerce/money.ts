import type { Money } from "./types";

// All arithmetic happens in integer pence; Money.amount is only a
// serialization format ("12.34") matching Shopify's decimal strings.

export function penceToMoney(pence: number): Money {
  return { amount: (pence / 100).toFixed(2), currencyCode: "GBP" };
}

export function moneyToPence(money: Money): number {
  return Math.round(parseFloat(money.amount) * 100);
}

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP"
});

const gbpWhole = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0
});

export function formatMoney(money: Money): string {
  const value = parseFloat(money.amount);
  return Number.isInteger(value) ? gbpWhole.format(value) : gbp.format(value);
}

export function formatPence(pence: number): string {
  return formatMoney(penceToMoney(pence));
}
