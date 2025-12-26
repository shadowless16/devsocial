
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // Defensive check: don't try to send if no API key
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY is missing. Email would have been sent to:', to);
    return { success: false, error: 'Missing RESEND_API_KEY' };
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    
    // In 'onboarding@resend.dev' mode, you can ONLY send to the email you used to sign up for Resend.
    // Ensure you verify your domain on Resend to send to anyone.
    
    const data = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback text generation logic
    });

    if (data.error) {
      console.error('[Email] Resend API error:', data.error);
      return { success: false, error: data.error };
    }

    console.log('[Email] Message sent via Resend:', data.data?.id);
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error('[Email] Error sending email via Resend:', error);
    return { success: false, error };
  }
}
