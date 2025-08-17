import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth-temp';

/**
 * GET /api/payments - List payments with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const seasonId = searchParams.get('seasonId') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's club admin status to determine permissions
    const clubAdmin = await prisma.clubAdmin.findFirst({
      where: { userId: session.user.id },
      include: { club: true }
    });

    if (!clubAdmin) {
      return NextResponse.json(
        { error: 'Only club admins can view payments' },
        { status: 403 }
      );
    }

    // Build where clause
    const where: Prisma.PaymentWhereInput = {
      season: {
        clubId: clubAdmin.clubId
      }
    };
    
    if (seasonId) {
      where.seasonId = seasonId;
    }
    
    if (status) {
      where.status = status as Prisma.EnumPaymentStatusFilter;
    }

    // Fetch payments with related data
    const payments = await prisma.payment.findMany({
      where,
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        season: {
          select: {
            id: true,
            name: true,
            sport: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const total = await prisma.payment.count({ where });

    return NextResponse.json({
      payments,
      pagination: {
        total,
        offset,
        limit,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
