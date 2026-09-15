import { Resend } from "resend";
import { SITE } from "@/lib/site";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM = process.env.EMAIL_FROM ?? `Windy City Linen <website@windycitylinen.com>`;
const INBOX = process.env.QUOTE_INBOX ?? SITE.email;
// Document-quote uploads go straight to the order-entry inbox, not general sales.
export const ORDERS_INBOX = process.env.ORDERS_INBOX ?? "orders@windycitylinen.com";

type SendArgs = {
  subject: string;
  text: string;
  replyTo?: string;
  /** Defaults to the general sales inbox. */
  to?: string;
};

/**
 * Sends a notification to the sales inbox. When RESEND_API_KEY is not set
 * (local dev), the message is logged to the server console instead so the flow
 * is still testable end to end.
 */
export async function sendInquiryEmail({ subject, text, replyTo, to }: SendArgs): Promise<boolean> {
  const inbox = to ?? INBOX;
  if (!resend) {
    console.info(
      `\n──────── inquiry email (dev, not sent) ────────\nto: ${inbox}\nsubject: ${subject}\nreply-to: ${replyTo ?? "-"}\n\n${text}\n──────────────────────────────────────────────\n`,
    );
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: inbox,
      subject,
      text,
      replyTo,
    });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to send inquiry email:", err);
    return false;
  }
}
