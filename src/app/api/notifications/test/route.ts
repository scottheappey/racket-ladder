import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-temp';
import { sendMagicInviteNotification } from '@/lib/notifications';

/**
 * POST /api/notifications/test - Test notification system (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { type, email, name } = body;

    if (!type || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: type, email, name' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'magic_invite':
        await sendMagicInviteNotification(
          { email, name },
          {
            club: { name: 'Test Club' },
            inviteLink: 'https://example.com/join/test-token',
            sport: 'Tennis'
          }
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Test ${type} notification sent to ${email}` 
    });

  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
