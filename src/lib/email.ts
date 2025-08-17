import { Resend } from "resend";

interface MatchNotificationParams {
  to: string;
  playerName: string;
  opponentName: string;
  scheduledAt?: Date;
}

interface ResultNotificationParams {
  to: string;
  playerName: string;
  opponentName: string;
  winner: string;
  sets: string;
}

export interface MessagingAdapter {
  sendMatchNotification(params: MatchNotificationParams): Promise<boolean>;
  sendResultNotification(params: ResultNotificationParams): Promise<boolean>;
}

export class EmailAdapter implements MessagingAdapter {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendMatchNotification(
    params: MatchNotificationParams,
  ): Promise<boolean> {
    try {
      await this.resend.emails.send({
        from: "noreply@racketladders.com",
        to: params.to,
        subject: `Match scheduled with ${params.opponentName}`,
        html: `
          <h2>Match Scheduled</h2>
          <p>Hi ${params.playerName},</p>
          <p>You have a match scheduled with ${params.opponentName}.</p>
          ${params.scheduledAt ? `<p>Scheduled for: ${params.scheduledAt.toLocaleString()}</p>` : ""}
          <p>Good luck!</p>
        `,
      });
      return true;
    } catch (error) {
      console.error("Failed to send match notification:", error);
      return false;
    }
  }

  async sendResultNotification(
    params: ResultNotificationParams,
  ): Promise<boolean> {
    try {
      await this.resend.emails.send({
        from: "noreply@racketladders.com",
        to: params.to,
        subject: `Match result: ${params.playerName} vs ${params.opponentName}`,
        html: `
          <h2>Match Result</h2>
          <p>Hi ${params.playerName},</p>
          <p>Match result between you and ${params.opponentName}:</p>
          <p><strong>Winner:</strong> ${params.winner}</p>
          <p><strong>Score:</strong> ${params.sets}</p>
        `,
      });
      return true;
    } catch (error) {
      console.error("Failed to send result notification:", error);
      return false;
    }
  }
}

export class WhatsAppAdapter implements MessagingAdapter {
  async sendMatchNotification(
    params: MatchNotificationParams,
  ): Promise<boolean> {
    // TODO: Implement WhatsApp API integration
    console.log("WhatsApp match notification:", params);
    return true;
  }

  async sendResultNotification(
    params: ResultNotificationParams,
  ): Promise<boolean> {
    // TODO: Implement WhatsApp API integration
    console.log("WhatsApp result notification:", params);
    return true;
  }
}

export function createMessagingAdapter(): MessagingAdapter {
  const whatsappEnabled = process.env.WHATSAPP_ENABLED === "true";
  return whatsappEnabled ? new WhatsAppAdapter() : new EmailAdapter();
}
