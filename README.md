Community Portal (Full-Stack Application)



This repository contains a full-stack community portal application built with a Next.js frontend and a Node.js/Express backend. The app is called Munhu Wese.

## Technology Stack

*   **Frontend:** Next.js, React, Tailwind CSS
*   **Backend:** Node.js, Express.js
# Community Portal — Full-stack submission


Munhu Wese App
An example full-stack application 

This repo contains a Next.js frontend and an Express + Prisma backend with
Postgres and it is a typescript app. The application supports users, posts, and events along with image
uploads, email notifications (SMTP or console fallback), and full test coverage
for backend features.

---

Table of contents

- Features
- User manual (separate): `USER_MANUAL.md` —  detailed usage & API examples
- Quick start (Docker)
- Local dev (frontend + backend)
- Environment variables
- Database & Prisma
- Tests
- Project status & deliverables
- User manual (short)
- Troubleshooting & tips

---

## Features

- User registration & authentication (JWT)
   - Name, email, password, confirm password, mobile captured
- Dashboard with posts + upcoming events
- Posts: add / edit / delete with optional image uploads
- Events: full CRUD + user registrations
- **Email notifications:** Password reset and event registration confirmation (Gmail SMTP)
- Robust backend tests (Jest + ts-jest) — passing locally

---

## Quick start (Docker — recommended)

Requirements: Docker & docker-compose installed and running.

1) From the project root run:

```powershell
docker-compose up --build
```

2) Open the app

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

Docker uses a Postgres service, runs the Express backend, and serves the Next
frontend.

---

## Local development (manual)

I recommend running backend and frontend separately during development.

1) Backend

```powershell
cd backend
npm install

# copy .env.example -> .env and update the values (see Environment variables)
copy .env.example .env

# generate prisma client (after migrations)
npx prisma generate

# apply migrations (creates DB tables)
npm run prisma:migrate

# start backend (dev)
npm run dev
```

API server will run on: http://localhost:4000

2) Frontend

```powershell
cd frontend
npm install

# set NEXT_PUBLIC_API_URL in .env.local (e.g. NEXT_PUBLIC_API_URL=http://localhost:4000/api)
npm run dev
```

Frontend runs on: http://localhost:3000

---

## Environment variables

Create `.env` files for backend and `.env.local` for frontend. Example values are below:

Backend (`backend/.env`):

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/community_portal?schema=public"

# JWT & app
JWT_SECRET=super-secret-test-key
CLIENT_URL=http://localhost:3000
PORT=4000
NODE_ENV=development

# Email (Gmail SMTP)
# Get Gmail App Password from: https://myaccount.google.com/apppasswords
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"
```

**Gmail Setup Quick Guide:**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Set `GMAIL_USER` to your Gmail address and `GMAIL_APP_PASSWORD` to the 16-char password

See [`GMAIL_SETUP.md`](./GMAIL_SETUP.md) for detailed instructions.

Frontend (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Database & Prisma

- Prisma schema lives under `backend/prisma/schema.prisma`
- After modifying schema, update Prisma client and apply migrations:

```powershell
cd backend
npx prisma migrate dev --name my_change
npx prisma generate
```

---

## Tests

Backend tests use Jest + ts-jest. Tests run in ESM-friendly mode in this
repository — we include helper mocks for Prisma so tests don't require a
running DB.

Run backend tests (PowerShell):

```powershell
cd backend
npm test
```

Frontend tests (unit/e2e if present) — run in the `frontend` folder:

```powershell
cd frontend
npm test
```

Notes:
- Backend test suite covers authentication, posts and events endpoints and
   uses ESM-friendly jest.mock API for clear isolation.

---

## Project status & deliverables

Completed (what we have):

- User registration, login, password reset (with email util)
- Profile editing (including image uploads)
- Posts CRUD + image uploads + post likes
- Events CRUD + event registration + registration confirmation emails
- Prisma migrations and generated client (regenerated after cleanup)
- Backend tests (Jest) — passing

---

## Troubleshooting

- Prisma generate fails with EPERM on Windows: stop running processes that might
   lock files (dev server, editors), remove `node_modules/.prisma/client/*.tmp`
   and re-run `npx prisma generate`.
- Tests failing due to environment: ensure `backend/.env` has JWT_SECRET set for
   test invocations and that tests are run from the `backend` folder using
   `npm test`.



