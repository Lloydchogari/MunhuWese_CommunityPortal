# Community Portal — User Manual

This user manual describes how to use the Community Portal app (Next.js frontend + Express + Prisma backend).

If you're running locally, follow the README first to start the backend at http://localhost:4000 and the frontend at http://localhost:3000.

---

## Quick overview

The Community Portal supports:
- User registration, login, profile editing
- Posts: create / edit / delete, optional image uploads, likes
- Events: create / edit / delete (admins), register for events (users)
- Password reset and event registration emails

This manual focuses on the end-user flows (UI) and API examples for testers and reviewers.

---

## 1. Using the UI — core flows

### Register
1. Navigate to /register or click the 'Sign up' link.
2. Enter Name, Email, Password (>= 8 chars), Confirm Password and Mobile number.
3. Submit. On success you will be logged in and redirected to the Dashboard.

### Login
1. Navigate to /login.
2. Enter your Email and Password and submit.
3. On success you will be taken to your Dashboard.

### Dashboard
The Dashboard shows a feed of posts created by all users and the upcoming events.
From here you can navigate to create or edit posts and view event details.

### Create a Post
1. Click 'New Post' or 'Create Post'.
2. Enter Title and Description (both must meet minimum lengths), optional image.
3. Submit — the post will appear in the feed.

### Edit / Delete a Post
You can only edit or delete posts you created (or if your role is admin).

### Create an Event (Admin)
1. Log in as an admin (role must be 'admin').
2. Click `Create Event` in dashboard.
3. Fill title, description, location, start and end times, optional image.

### Register for an Event
1. Open the event details page.
2. Click `Register` — you will receive a confirmation email (or console log if SMTP not configured).

---

## 2. API / Power-user quick reference

Base API path: `http://localhost:4000/api`

Authentication: endpoints that require login expect the header: `Authorization: Bearer <token>`.

### Auth
- POST /api/auth/register — register (JSON body: name, email, password, confirmPassword, mobile)
- POST /api/auth/login — login (JSON body: email, password)
- POST /api/auth/reset-request — send a reset email
- POST /api/auth/reset — reset password (token + new password)

### Posts
- GET /api/posts — list all posts
- GET /api/posts/:id — get a post
- POST /api/posts — create (auth required; multipart form data for image)
- PUT /api/posts/:id — update (auth & owner/admin only)
- DELETE /api/posts/:id — delete (auth & owner/admin only)
- POST /api/posts/:id/like — toggle like (auth required)

### Events
- GET /api/events — list events
- POST /api/events — create event (admin only)
- PUT /api/events/:id — update event (admin only)
- DELETE /api/events/:id — delete (admin only)
- POST /api/events/:id/register — register for event (auth required)
- GET /api/events/:id/registrations — admin-only list of registrations

---

## 3. Admin operations

To create an admin in development:
1. Create a user via the register flow.
2. Update the user record in the database: set `role='admin'` (via Prisma Studio or SQL).

Once admin, you can create events and view registrations.

---

## 4. Troubleshooting & tips

- If you get `Prisma generate` EPERM on Windows, close dev servers or apps locking files, delete `node_modules/.prisma/client/*.tmp` and run `npx prisma generate`.
- If you see emails not arriving: configure SMTP variables in `backend/.env` (Mailtrap recommended) or check the console logs — the app will log emails if SMTP not configured.

---

## 5. Running tests (developer)

Backend tests (Jest) run with an ESM-friendly configuration. To run tests:

```powershell
cd backend
npm test
```

Frontend tests (if added) run from the `frontend` folder.

---

