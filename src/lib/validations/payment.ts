import { z } from 'zod';

/**
 * Payment intent creation schema
 */
export const CreatePaymentIntentSchema = z.object({
  seasonId: z.string().cuid(),
  playerId: z.string().cuid(),
  amount: z.number().int().min(500).max(100000), // $5 to $1000 in cents
  currency: z.string().default('usd'),
  description: z.string().optional()
});

/**
 * Payment confirmation schema
 */
export const ConfirmPaymentSchema = z.object({
  paymentIntentId: z.string(),
  paymentMethodId: z.string().optional()
});

/**
 * Payment status update schema
 */
export const UpdatePaymentStatusSchema = z.object({
  paymentId: z.string().cuid(),
  status: z.enum(['REQUIRES_PAYMENT', 'SUCCEEDED', 'FAILED']),
  stripePaymentIntentId: z.string().optional()
});

/**
 * Webhook event validation
 */
export const StripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.string(), z.any())
  })
});

export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof ConfirmPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof UpdatePaymentStatusSchema>;
export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>;
