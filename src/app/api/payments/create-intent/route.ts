import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { CreatePaymentIntentSchema } from '@/lib/validations/payment';
import { auth } from '@/lib/auth-temp';

/**
 * POST /api/payments/create-intent - Create a Stripe payment intent
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreatePaymentIntentSchema.parse(body);

    // Get season and verify it exists and has entry fee
    const season = await prisma.season.findUnique({
      where: { id: validatedData.seasonId },
      include: {
        club: {
          include: {
            clubAdmins: true
          }
        }
      }
    });

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    if (!season.entryFeeCents) {
      return NextResponse.json(
        { error: 'This season does not require an entry fee' },
        { status: 400 }
      );
    }

    // Verify the amount matches the season entry fee
    if (validatedData.amount !== season.entryFeeCents) {
      return NextResponse.json(
        { error: 'Payment amount does not match season entry fee' },
        { status: 400 }
      );
    }

    // Get or verify player exists
    const player = await prisma.player.findUnique({
      where: { id: validatedData.playerId },
      include: {
        payments: {
          where: { seasonId: validatedData.seasonId }
        }
      }
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Check if player belongs to the same club as the season
    if (player.clubId !== season.clubId) {
      return NextResponse.json(
        { error: 'Player does not belong to this club' },
        { status: 403 }
      );
    }

    // Check if player already has a payment for this season
    const existingPayment = player.payments.find(p => p.seasonId === validatedData.seasonId);
    if (existingPayment && existingPayment.status === 'SUCCEEDED') {
      return NextResponse.json(
        { error: 'Player has already paid for this season' },
        { status: 400 }
      );
    }

    // Check permission - only the player themselves or club admins can create payment
    const isPlayer = player.userId === session.user.id;
    const isAdmin = season.club.clubAdmins.some(admin => admin.userId === session.user.id);
    
    if (!isPlayer && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the player or club admins can create payments' },
        { status: 403 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: validatedData.amount,
      currency: validatedData.currency,
      payment_method_types: STRIPE_CONFIG.paymentMethodTypes,
      metadata: {
        seasonId: validatedData.seasonId,
        playerId: validatedData.playerId,
        clubId: season.clubId,
        playerName: player.name,
        playerEmail: player.email,
        seasonName: season.name
      },
      description: validatedData.description || `Entry fee for ${season.name} - ${player.name}`
    });

    // Create or update payment record
    let payment;
    if (existingPayment) {
      payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          amountCents: validatedData.amount,
          status: 'REQUIRES_PAYMENT'
        }
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          seasonId: validatedData.seasonId,
          playerId: validatedData.playerId,
          amountCents: validatedData.amount,
          stripePaymentIntentId: paymentIntent.id,
          status: 'REQUIRES_PAYMENT'
        }
      });
    }

    return NextResponse.json({
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amountCents
      }
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
