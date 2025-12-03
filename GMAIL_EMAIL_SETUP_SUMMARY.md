# Gmail Email Setup - Complete ✅

## What Was Changed

### 1. Environment Configuration
- **Updated** `backend/.env` to use Gmail SMTP instead of Resend
- **Created** `backend/.env.example` with Gmail configuration template
- **Key variables:**
  - `GMAIL_USER`: Your Gmail email address
  - `GMAIL_APP_PASSWORD`: 16-character app password from Google

### 2. Email Service Implementation
- ✅ Email service already exists at `backend/src/services/emailService.ts`
- Uses **nodemailer** with Gmail SMTP transport
- Implements professional HTML email templates for:
  - **Password Reset Emails** — User receives reset link (1-hour expiry)
  - **Event Registration Confirmation** — User receives event details

### 3. Authentication Routes Updated
- **File:** `backend/src/routes/auth.ts`
- **Change:** Updated password reset endpoint to call Gmail email service
- **Imports:** Changed from `../utils/email.js` to `../services/emailService.js`

### 4. Events Routes Updated
- **File:** `backend/src/routes/events.ts`
- **Change:** Updated event registration to send confirmation emails with full event details
- **Parameters:** Now passes complete event object to email service

### 5. Documentation
- **Created:** `GMAIL_SETUP.md` — Step-by-step Gmail configuration guide
- **Updated:** `README.md` — Added Gmail setup section to Environment variables

---

## How to Enable Emails (3 Easy Steps)

### Step 1: Enable 2-Factor Authentication
1. Go to [https://myaccount.google.com](https://myaccount.google.com)
2. Click **Security** → **2-Step Verification**
3. Follow prompts to enable 2FA (via phone)

### Step 2: Generate App Password
1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Windows Computer**
3. Google generates a **16-character password**
4. **Copy this password** (without spaces)

### Step 3: Update `.env`
In `backend/.env`, update:
```env
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"  # Paste the 16-char password here
```

---

## Testing It Works

1. **Start backend:** `cd backend && npm run dev`
2. **Request password reset:** Go to `/forgot-password` in the app
3. **Check Gmail inbox:** You should receive the reset email within seconds
4. **Check backend logs:** Should show `✅ Password reset email sent to: [email]`

---

## Email Features

### Password Reset Email
- User receives secure link to reset password
- Link expires in 1 hour for security
- Professional HTML template with Munhu Wese branding

### Event Registration Confirmation
- User receives confirmation with event details
- Includes: event title, description, location, start/end times
- Professional HTML template with event information

---

## TypeScript Compilation

✅ **All TypeScript checks pass** — No compilation errors

---

## Files Modified
1. `backend/.env` — Gmail configuration
2. `backend/.env.example` — Template for Gmail setup
3. `backend/src/routes/auth.ts` — Updated password reset email call
4. `backend/src/routes/events.ts` — Updated event registration email call
5. `README.md` — Added Gmail setup documentation

## Files Created
1. `GMAIL_SETUP.md` — Complete Gmail setup guide
2. `backend/.env.example` — Environment variable template

---

## Next Steps
1. Follow the 3 steps above to set up Gmail
2. Restart the backend server
3. Test password reset and event registration
4. Emails should now work end-to-end! 🎉

---

## Troubleshooting

**"Invalid credentials" error?**
- Verify you copied the 16-char password exactly (no extra spaces)
- Make sure 2FA is enabled on your Gmail account
- Try generating a new app password

**Email not arriving?**
- Check spam/junk folder
- Verify `CLIENT_URL` in `.env` matches your frontend URL
- Check backend logs for errors

**Can't find App Passwords page?**
- Enable 2FA first at https://myaccount.google.com/security
- Then try https://myaccount.google.com/apppasswords

---

**Ready to submit!** Your app now has fully functional email notifications. 🚀
