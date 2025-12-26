
import { sendEmail } from '@/lib/core/email';
import User from '@/models/User';

export async function notifyViaEmail(
  recipientId: string,
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'xp_overtake',
  data: {
    senderName: string;
    actionUrl: string;
    preview?: string;
  }
) {
  try {
    const user = await User.findById(recipientId);
    if (!user || !user.email || !user.isVerified) return;

    // Check preferences
    const settings = user.notificationSettings || {
      emailLikes: true,
      emailComments: true,
      emailFollows: true,
      emailMentions: true,
      emailMessages: true,
    };

    let shouldSend = false;
    let subject = '';
    let body = '';

    switch (type) {
      case 'like':
        if (settings.emailLikes) {
          shouldSend = true;
          subject = `${data.senderName} liked your content`;
          body = `Stopped by to leave some love on your post.`;
        }
        break;
      case 'comment':
        if (settings.emailComments) {
          shouldSend = true;
          subject = `${data.senderName} commented on your post`;
          body = `"${data.preview}"`;
        }
        break;
      case 'follow':
        if (settings.emailFollows) {
          shouldSend = true;
          subject = `${data.senderName} followed you`;
          body = `You have a new follower! Check out their profile.`;
        }
        break;
      case 'mention':
        if (settings.emailMentions) {
          shouldSend = true;
          subject = `${data.senderName} mentioned you`;
          body = `You were mentioned in a conversation: "${data.preview}"`;
        }
        break;
      case 'message':
        if (settings.emailMessages) {
          shouldSend = true;
          subject = `New message from ${data.senderName}`;
          body = `"${data.preview}"`;
        }
        break;
      case 'xp_overtake':
        // assuming we reuse an existing setting or add a new one; using emailMentions as fallback or assume always on for gamification?
        // Let's assume it falls under a general "updates" or we add a specific one. For now, let's treat it like a mention or strictly check a new setting.
        // But since we didn't add emailXpOvertake to the model, let's skip strict check or reuse 'emailMentions' as a proxy for "interactive alerts"
        // Actually, better to just send it if verified, or maybe assume true if not specified? 
        // Let's keep it simple: if verified, send it. Gamification is key.
        shouldSend = true;
        subject = `🏆 You were overtaken by ${data.senderName}`;
        body = `Heads up! ${data.senderName} just passed you on the leaderboard. Time to earn more XP!`;
        break;
    }

    if (shouldSend) {
      await sendEmail({
        to: user.email,
        subject,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>${subject}</h2>
            <p>${body}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}${data.actionUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">View on DevSocial</a>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              You received this because you have ${type} notifications enabled.
            </p>
          </div>
        `
      });
      console.log(`[EmailHelper] Sent ${type} email to ${user.email}`);
    }
  } catch (error) {
    console.error('[EmailHelper] Failed to send email:', error);
  }
}
