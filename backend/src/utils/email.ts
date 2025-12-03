import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEventRegistrationEmail(
  to: string,
  eventTitle: string,
  eventDescription?: string,
  eventLocation?: string,
  eventStartAt?: string,
  eventEndAt?: string,
  userName?: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.log(
      `📧 [DEV MODE] Event registration email to ${to}\nEvent: ${eventTitle}`
    );
    return;
  }

  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const dashboardLink = `${clientUrl}/dashboard`;

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: to,
      subject: `🎉 Registration Confirmed: ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You're All Set!</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Event Registration Confirmed</h2>
              
              <p style="color: #555; font-size: 16px;">
                Hi ${userName || 'there'},
              </p>
              
              <p style="color: #555; font-size: 16px;">
                Thank you for registering for <strong>${eventTitle}</strong>. We're excited to see you there!
              </p>
              
              ${eventDescription ? `
              <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="color: #555; margin: 0; font-size: 15px;">${eventDescription}</p>
              </div>
              ` : ''}
              
              ${eventLocation || eventStartAt ? `
              <div style="background: #f9fafb; padding: 20px; margin: 25px 0; border-radius: 4px;">
                ${eventLocation ? `<p style="margin: 8px 0;"><strong>📍 Location:</strong> ${eventLocation}</p>` : ''}
                ${eventStartAt ? `<p style="margin: 8px 0;"><strong>📅 Starts:</strong> ${formatDate(eventStartAt)}</p>` : ''}
                ${eventEndAt ? `<p style="margin: 8px 0;"><strong>⏰ Ends:</strong> ${formatDate(eventEndAt)}</p>` : ''}
              </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardLink}" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  View in Dashboard
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #777; font-size: 14px; margin: 5px 0;">
                  You can manage all your event registrations in your dashboard.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Community Portal</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Event registration email sent to:', to);
  } catch (error) {
    console.error('❌ Failed to send event registration email:', error);
  }
}

export async function sendPasswordResetEmail(to: string, token: string, userName?: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(
      `📧 [DEV MODE] Password reset email to ${to}\nToken: ${token}`
    );
    return;
  }

  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetLink = `${clientUrl}/reset?token=${token}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: to,
      subject: '🔐 Reset Your Password - Community Portal',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
              
              <p style="color: #555; font-size: 16px;">
                ${userName ? `Hi ${userName},` : 'Hello,'}
              </p>
              
              <p style="color: #555; font-size: 16px;">
                We received a request to reset your password. Click the button below to set a new password:
              </p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetLink}" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #777; font-size: 14px; margin-top: 30px;">
                Or copy this link:
              </p>
              <p style="color: #667eea; font-size: 13px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
                ${resetLink}
              </p>
              
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #777; font-size: 14px; margin: 5px 0;">
                  <strong>Didn't request this?</strong> You can safely ignore this email. Your password won't change until you use the link above.
                </p>
                <p style="color: #777; font-size: 14px; margin: 5px 0;">
                  This link expires in 1 hour for security.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Community Portal</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Password reset email sent to:', to);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
  }
}