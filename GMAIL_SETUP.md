# Gmail Setup Guide for Email Notifications

This guide explains how to set up Gmail SMTP so that password reset and event registration emails work in the Community Portal.

## Why Gmail App Passwords?

Gmail has disabled "Less secure app access" for security reasons. We need to use **App Passwords** instead, which are specially generated 16-character passwords for third-party apps.

## Step-by-Step Setup

### 1. Enable 2-Factor Authentication (Required)

Gmail App Passwords only work if 2FA is enabled on your account.

1. Go to [https://myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left sidebar
3. Scroll down to **2-Step Verification** and click it
4. Follow the prompts to enable 2FA (usually via phone)

### 2. Generate an App Password

1. After 2FA is enabled, go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. You'll see a dropdown that says **Select app** — choose **Mail**
3. In the second dropdown, choose **Windows Computer** (or your OS)
4. Google will generate a **16-character password** (without spaces)
5. **Copy this password** — you'll need it next

### 3. Update .env File

In `backend/.env`, add or update:

```env
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"  # The 16-char password you just copied
```

### 4. Test the Setup

To verify emails work:

1. Start the backend: `cd backend && npm run dev`
2. Go to the app and request a password reset
3. Check your Gmail inbox — you should receive the reset email

## Troubleshooting

### "Invalid credentials" or "Login Failed"

- Verify you copied the 16-char password exactly (no extra spaces)
- Make sure 2FA is enabled on your Gmail account
- Try regenerating a new app password

### Email not arriving

- Check spam/junk folder
- Verify `CLIENT_URL` in `.env` matches your frontend URL
- Check backend logs for errors: `❌ Failed to send...`

### Can't find App Passwords page

- 2FA may not be enabled — enable it first at [https://myaccount.google.com/security](https://myaccount.google.com/security)
- Try accessing directly: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

## Email Templates

The app sends two types of emails:

1. **Password Reset** — User receives a link to reset their password (expires in 1 hour)
2. **Event Registration** — User receives confirmation with event details when they register

Both emails use professional HTML templates with your app branding.
