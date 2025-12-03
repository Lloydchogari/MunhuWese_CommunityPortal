import nodemailer from 'nodemailer';

// Log email configuration on startup
console.log('📧 Email service initializing...');
console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_APP_PASSWORD set:', !!process.env.GMAIL_APP_PASSWORD);

// Create transporter for Gmail with SSL certificate validation disabled
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

if(!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD must be set in environment variables');
}

// Verify connection at startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Email transporter connection error:', err);
  } else {
    console.log('✅ Email transporter connected successfully');
  }
});

// ==================== PASSWORD RESET EMAIL ====================

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:8000';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  try {
    const info = await transporter.sendMail({
      from: `"Munhu Wese" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - Munhu Wese',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Munhu Wese</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
              
              <p style="color: #4b5563; font-size: 16px;">
                ${userName ? `Hi ${userName},` : 'Hello,'}
              </p>
              
              <p style="color: #4b5563; font-size: 16px;">
                We received a request to reset your password for your Munhu Wese account. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetLink}" 
                   style="background: #1f2937; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
                ${resetLink}
              </p>
              
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                  <strong>Didn't request this?</strong> You can safely ignore this email.
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                  This link will expire in 1 hour for security reasons.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Munhu Wese Community Portal</p>
              <p style="margin: 5px 0;">This is an automated email, please do not reply.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Password reset email sent successfully to:', email);
    return { success: true, data: info };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return { success: false, error };
  }
}

// ==================== EVENT REGISTRATION EMAIL ====================

interface SendEventRegistrationEmailParams {
  to: string;
  userName: string;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventStartAt: string;
  eventEndAt: string;
}

export async function sendEventRegistrationEmail({
  to,
  userName,
  eventTitle,
  eventDescription,
  eventLocation,
  eventStartAt,
  eventEndAt,
}: SendEventRegistrationEmailParams) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:8000';
  const dashboardLink = `${clientUrl}/dashboard`;

  // Format dates nicely
  const startDate = new Date(eventStartAt);
  const endDate = new Date(eventEndAt);
  
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  try {
    const info = await transporter.sendMail({
      from: `"Munhu Wese" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `You're Registered! ${eventTitle} - Munhu Wese`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You're All Set!</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Event Registration Confirmed</h2>
              
              <p style="color: #4b5563; font-size: 16px;">
                Hi ${userName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px;">
                Great news! You've successfully registered for <strong>${eventTitle}</strong>. We're excited to see you there!
              </p>
              
              <div style="background: #f9fafb; border-left: 4px solid #1f2937; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="color: #1f2937; margin-top: 0; font-size: 20px;">${eventTitle}</h3>
                <p style="color: #4b5563; margin: 10px 0;">${eventDescription}</p>
                
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                  <div style="margin: 10px 0;">
                    <span style="color: #6b7280; font-size: 14px;">📍 Location:</span>
                    <span style="color: #1f2937; font-weight: 600; margin-left: 10px;">${eventLocation}</span>
                  </div>
                  
                  <div style="margin: 10px 0;">
                    <span style="color: #6b7280; font-size: 14px;">📅 Starts:</span>
                    <span style="color: #1f2937; font-weight: 600; margin-left: 10px;">${formatDate(startDate)}</span>
                  </div>
                  
                  <div style="margin: 10px 0;">
                    <span style="color: #6b7280; font-size: 14px;">⏰ Ends:</span>
                    <span style="color: #1f2937; font-weight: 600; margin-left: 10px;">${formatDate(endDate)}</span>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${dashboardLink}" 
                   style="background: #1f2937; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                  View Event Details
                </a>
              </div>
              
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                  <strong>Need to make changes?</strong> You can view and manage your registrations in your dashboard.
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                  We'll send you a reminder closer to the event date!
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Munhu Wese Community Portal</p>
              <p style="margin: 5px 0;">This is an automated email, please do not reply.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Event registration email sent successfully to:', to);
    return { success: true, data: info };
  } catch (error) {
    console.error('❌ Failed to send event registration email:', error);
    return { success: false, error };
  }
}