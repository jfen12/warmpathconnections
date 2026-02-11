# WarmPath

A **personal network coordination tool** (private beta).

This is **not** a social network, CRM, or referral marketplace. It is a private,
user-owned personal network coordination tool.

## What WarmPath Is

- **Personal networks are private and user-owned.** Data stays with the user.
- **Nothing is shared by default.** Sharing is explicit and selective.
- **Atomic action:** Query your personal network, then selectively share results. No passive broadcasting.
- **Projects** are optional coordination containers—they help you organize, not expose.
- **Trust and clarity** matter more than polish.

## What WarmPath Is Not

- Not a social network
- Not a CRM
- Not a referral marketplace

## Engineering Principles

- Optimize for **correctness**, **simplicity**, and **learnability**.
- Avoid overengineering.

---

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** Email magic-link authentication via NextAuth (email provider)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

- `NEXTAUTH_URL` – typically `http://localhost:3000` in development
- `NEXTAUTH_SECRET` – a long random string (e.g. from `openssl rand -base64 32`)
- `DATABASE_URL` – PostgreSQL connection string
- `EMAIL_SERVER` – SMTP connection string for your email provider
- `EMAIL_FROM` – from-address for magic-link emails

### 3. Set up the database

1. Create a PostgreSQL database (local or hosted).
2. Update `DATABASE_URL` in `.env.local`.
3. Run Prisma migrations to create the auth tables:

```bash
npx prisma migrate dev --name init
```

You can also inspect the schema in `prisma/schema.prisma`.

### 4. Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

You should see the WarmPath landing screen with principles and a “Sign in with
email” button, which redirects to the built-in NextAuth magic-link flow.

---

## Project Structure

- `app/` – Next.js App Router routes and layout
  - `app/page.tsx` – simple landing page and entry to auth
  - `app/api/auth/[...nextauth]/route.ts` – NextAuth API route
- `lib/`
  - `lib/prisma.ts` – Prisma client singleton
  - `lib/auth.ts` – NextAuth configuration (email provider + Prisma adapter)
- `prisma/`
  - `prisma/schema.prisma` – database schema (User, Account, Session, VerificationToken)
- `.env.example` – documented environment variables

---

## Notes

- No payments, messaging, or analytics are included.
- Only the minimum libraries needed for the specified stack are installed.
- The Prisma schema is intentionally minimal and focused on auth.
