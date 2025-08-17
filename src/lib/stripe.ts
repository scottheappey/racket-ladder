import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
  typescript: true,
});

export const STRIPE_CONFIG = {
  currency: 'usd',
  // Minimum amount in cents (e.g., $5.00)
  minimumAmount: 500,
  // Maximum amount in cents (e.g., $1000.00)
  maximumAmount: 100000,
  // Payment methods to accept
  paymentMethodTypes: ['card']
};

export const formatAmountForDisplay = (
  amount: number,
  currency: string,
): string => {
  const numberFormat = new Intl.NumberFormat(["en-US"], {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  });
  return numberFormat.format(amount / 100);
};

export const formatAmountFromCents = (amount: number): number => {
  return amount / 100;
};

/**
 * Convert dollars to cents for Stripe
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars for display
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format currency for display
 */
export function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(centsToDollars(cents));
}
