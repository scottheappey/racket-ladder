import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendPaymentSuccessNotification, sendPaymentFailedNotification } from '@/lib/notifications';
import Stripe from 'stripe';

/**
 * POST /api/payments/webhook - Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCancellation(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: {
        season: {
          include: {
            club: true
          }
        },
        player: true
      }
    });

    if (!payment) {
      console.error(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update payment status to succeeded
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'SUCCEEDED' }
    });

    console.log(`Payment succeeded for payment ${payment.id}`);

    // Send success notification email
    try {
      await sendPaymentSuccessNotification({
        payment: {
          id: payment.id,
          amount: payment.amountCents,
          currency: 'GBP', // Default currency
          status: 'SUCCEEDED'
        },
        season: {
          name: payment.season.name,
          sport: payment.season.sport
        },
        club: {
          name: payment.season.club.name
        },
        player: {
          name: payment.player.name,
          email: payment.player.email
        }
      });
    } catch (emailError) {
      console.error('Failed to send payment success notification:', emailError);
    }

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: {
        season: {
          include: {
            club: true
          }
        },
        player: true
      }
    });

    if (!payment) {
      console.error(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update payment status to failed
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' }
    });

    console.log(`Payment failed for payment ${payment.id}`);

    // Send failure notification email
    try {
      await sendPaymentFailedNotification({
        payment: {
          id: payment.id,
          amount: payment.amountCents,
          currency: 'GBP',
          status: 'FAILED'
        },
        season: {
          name: payment.season.name,
          sport: payment.season.sport
        },
        club: {
          name: payment.season.club.name
        },
        player: {
          name: payment.player.name,
          email: payment.player.email
        }
      });
    } catch (emailError) {
      console.error('Failed to send payment failure notification:', emailError);
    }

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Handle payment cancellation
 */
async function handlePaymentCancellation(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (!payment) {
      console.error(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update payment status to failed (treating cancellation as failure)
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' }
    });

    console.log(`Payment canceled for payment ${payment.id}`);

  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}
