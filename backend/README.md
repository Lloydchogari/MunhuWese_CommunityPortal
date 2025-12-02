# Backend — local setup & migrations

Quick notes for running local database migrations and enabling real email sending for password resets / event registration confirmations.

Prerequisites
- Node.js (>=16)
- A Postgres database (local or remote)

Environment
Create a `.env` in the backend folder with at least the following values:

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000

# Optional — to enable real SMTP email sending configure these (for Mailtrap or your SMTP provider)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_pass

If EMAIL_* values are not set, emails (password reset / event registration) will be mocked and printed to server console.

Apply Prisma migrations locally
1. Install dependencies in the backend folder: `npm install`
2. Generate Prisma client (optional if you updated schema):
   npm run prisma:generate
3. Apply migrations and update your local database (this will create/alter tables):
   npm run prisma:migrate

Start dev server
npm run dev

Troubleshooting
- If migrations fail, check your DATABASE_URL and that Postgres accepts connections from your host.
- If you want to test real emails quickly, use Mailtrap credentials and set CLIENT_URL so the reset link points to the running frontend.
