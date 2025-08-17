/**
 * Notification System
 * Handles email notifications for match results, payments, and other events
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface NotificationData {
  type: 'match_result' | 'payment_success' | 'payment_failed' | 'season_invite' | 'magic_invite';
  recipient: {
    email: string;
    name: string;
  };
  data: MatchResultNotificationData | PaymentNotificationData | SeasonInviteNotificationData | MagicInviteNotificationData;
}

export interface MatchResultNotificationData {
  match: {
    id: string;
    playerA: { name: string; email: string; };
    playerB: { name: string; email: string; };
    winner: string;
    scoreA: number;
    scoreB: number;
    eloChangeA: number;
    eloChangeB: number;
    newRatingA: number;
    newRatingB: number;
  };
  season: {
    name: string;
    sport: string;
  };
  club: {
    name: string;
  };
}

export interface PaymentNotificationData {
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
  season: {
    name: string;
    sport: string;
  };
  club: {
    name: string;
  };
  player: {
    name: string;
    email: string;
  };
}

export interface SeasonInviteNotificationData {
  season: {
    name: string;
    sport: string;
    startDate: string;
    endDate: string;
    entryFeeCents: number;
  };
  club: {
    name: string;
  };
  inviteLink: string;
}

export interface MagicInviteNotificationData {
  club: {
    name: string;
  };
  inviteLink: string;
  sport?: string;
}

/**
 * Send match result notification to both players
 */
export async function sendMatchResultNotification(data: MatchResultNotificationData) {
  const { match, season, club } = data;
  
  // Determine winner and loser
  const isPlayerAWinner = match.winner === match.playerA.name;
  const winner = isPlayerAWinner ? match.playerA : match.playerB;
  const loser = isPlayerAWinner ? match.playerB : match.playerA;
  const winnerEloChange = isPlayerAWinner ? match.eloChangeA : match.eloChangeB;
  const loserEloChange = isPlayerAWinner ? match.eloChangeB : match.eloChangeA;
  const winnerNewRating = isPlayerAWinner ? match.newRatingA : match.newRatingB;
  const loserNewRating = isPlayerAWinner ? match.newRatingB : match.newRatingA;

  // Email to winner
  await resend.emails.send({
    from: 'Racket Ladders <noreply@racketladders.com>',
    to: winner.email,
    subject: `🎾 Match Victory - ${season.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">🏆 Congratulations! You won your match!</h1>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${season.name} - ${club.name}</h2>
          <p><strong>Match Result:</strong></p>
          <p>${winner.name} defeated ${loser.name}</p>
          <p><strong>Score:</strong> ${isPlayerAWinner ? match.scoreA : match.scoreB} - ${isPlayerAWinner ? match.scoreB : match.scoreA}</p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📊 Rating Update</h3>
          <p><strong>Rating Change:</strong> ${winnerEloChange > 0 ? '+' : ''}${winnerEloChange} points</p>
          <p><strong>New Rating:</strong> ${winnerNewRating}</p>
        </div>

        <p>Keep up the great work! 🎾</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated notification from Racket Ladders.
        </p>
      </div>
    `
  });

  // Email to loser
  await resend.emails.send({
    from: 'Racket Ladders <noreply@racketladders.com>',
    to: loser.email,
    subject: `🎾 Match Result - ${season.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">🎾 Match Result</h1>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${season.name} - ${club.name}</h2>
          <p><strong>Match Result:</strong></p>
          <p>${winner.name} defeated ${loser.name}</p>
          <p><strong>Score:</strong> ${isPlayerAWinner ? match.scoreA : match.scoreB} - ${isPlayerAWinner ? match.scoreB : match.scoreA}</p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📊 Rating Update</h3>
          <p><strong>Rating Change:</strong> ${loserEloChange > 0 ? '+' : ''}${loserEloChange} points</p>
          <p><strong>New Rating:</strong> ${loserNewRating}</p>
        </div>

        <p>Good match! Every game is a learning opportunity. 💪</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated notification from Racket Ladders.
        </p>
      </div>
    `
  });
}

/**
 * Send payment success notification
 */
export async function sendPaymentSuccessNotification(data: PaymentNotificationData) {
  const { payment, season, club, player } = data;
  const amount = (payment.amount / 100).toFixed(2);

  await resend.emails.send({
    from: 'Racket Ladders <noreply@racketladders.com>',
    to: player.email,
    subject: `✅ Payment Confirmed - ${season.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">✅ Payment Confirmed</h1>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h2 style="margin-top: 0; color: #16a34a;">Welcome to ${season.name}!</h2>
          <p>Your entry fee payment has been successfully processed.</p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">💳 Payment Details</h3>
          <p><strong>Amount:</strong> £${amount}</p>
          <p><strong>Season:</strong> ${season.name} (${season.sport})</p>
          <p><strong>Club:</strong> ${club.name}</p>
          <p><strong>Payment ID:</strong> ${payment.id}</p>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">🎾 What's Next?</h3>
          <p>You're now registered for the season! You can:</p>
          <ul>
            <li>Challenge other players to matches</li>
            <li>View the current ladder standings</li>
            <li>Track your rating progress</li>
          </ul>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated notification from Racket Ladders.<br>
          If you have any questions, please contact your club administrator.
        </p>
      </div>
    `
  });
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedNotification(data: PaymentNotificationData) {
  const { payment, season, club, player } = data;
  const amount = (payment.amount / 100).toFixed(2);

  await resend.emails.send({
    from: 'Racket Ladders <noreply@racketladders.com>',
    to: player.email,
    subject: `❌ Payment Failed - ${season.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">❌ Payment Failed</h1>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h2 style="margin-top: 0; color: #dc2626;">Unable to Process Payment</h2>
          <p>We were unable to process your payment for ${season.name}.</p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">💳 Payment Details</h3>
          <p><strong>Amount:</strong> £${amount}</p>
          <p><strong>Season:</strong> ${season.name} (${season.sport})</p>
          <p><strong>Club:</strong> ${club.name}</p>
          <p><strong>Status:</strong> ${payment.status}</p>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">🔄 Next Steps</h3>
          <p>Please try the following:</p>
          <ul>
            <li>Check your card details and try again</li>
            <li>Contact your bank if the issue persists</li>
            <li>Reach out to your club administrator for help</li>
          </ul>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated notification from Racket Ladders.<br>
          If you continue to experience issues, please contact support.
        </p>
      </div>
    `
  });
}

/**
 * Send magic invite notification
 */
export async function sendMagicInviteNotification(
  recipient: { email: string; name: string },
  data: MagicInviteNotificationData
) {
  const { club, inviteLink, sport } = data;

  await resend.emails.send({
    from: 'Racket Ladders <noreply@racketladders.com>',
    to: recipient.email,
    subject: `🎾 You're invited to join ${club.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">🎾 You're Invited!</h1>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${club.name}</h2>
          <p>You've been invited to join our ${sport ? sport.toLowerCase() : 'racket sport'} community!</p>
        </div>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0;">🚀 Join Now</h3>
          <p>Click the button below to accept your invitation:</p>
          <a href="${inviteLink}" 
             style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
            Accept Invitation
          </a>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">🎾 What You'll Get</h3>
          <ul>
            <li>Access to club ladder competitions</li>
            <li>Match scheduling and results tracking</li>
            <li>Elo rating system to track your progress</li>
            <li>Connect with other players in your club</li>
          </ul>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This invitation was sent by ${club.name} via Racket Ladders.<br>
          If you don't want to receive these invitations, you can ignore this email.
        </p>
      </div>
    `
  });
}

/**
 * Generic notification sender with queue support
 */
export async function sendNotification(notification: NotificationData): Promise<void> {
  try {
    switch (notification.type) {
      case 'match_result':
        await sendMatchResultNotification(notification.data as MatchResultNotificationData);
        break;
      case 'payment_success':
        await sendPaymentSuccessNotification(notification.data as PaymentNotificationData);
        break;
      case 'payment_failed':
        await sendPaymentFailedNotification(notification.data as PaymentNotificationData);
        break;
      case 'magic_invite':
        await sendMagicInviteNotification(notification.recipient, notification.data as MagicInviteNotificationData);
        break;
      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}
