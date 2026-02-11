# WarmPath setup guide

Follow these steps **one at a time**. Complete each step before moving to the next.

---

## Step 1: Create your `.env` file

1. In the project root, copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in your editor. You will fill in values in the steps below; for now you can leave placeholders.

---

## Step 2: Generate a secret for NextAuth

1. In a terminal, run:
   ```bash
   openssl rand -base64 32
   ```
2. Copy the output (a long random string).
3. In `.env`, set:
   ```bash
   NEXTAUTH_SECRET="<paste the string you copied>"
   ```
4. In `.env`, set (for local dev):
   ```bash
   NEXTAUTH_URL="http://localhost:3000"
   ```

---

## Step 3: Get a PostgreSQL database

Choose **one** option.

**Option A – Local PostgreSQL**

1. Install PostgreSQL on your machine (e.g. from postgresql.org, or `brew install postgresql` on macOS).
2. Start Postgres and create a database, e.g.:
   ```bash
   createdb warm_path
   ```
3. In `.env`, set (replace `USER` and `PASSWORD` with your Postgres user and password):
   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/warm_path?schema=public"
   ```

**Option B – Hosted (Neon, Supabase, Railway, etc.)**

1. Sign up for a free PostgreSQL service (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com)).
2. Create a new project and copy the connection string they give you.
3. In `.env`, set:
   ```bash
   DATABASE_URL="<paste the connection string>"
   ```
   If the URL has no `?schema=public`, add it: `...?schema=public`

---

## Step 4: Run database migrations

1. In the project root, run:
   ```bash
   npx prisma migrate dev --name init
   ```
2. If it asks to create a new migration or says "no migrations found", accept. It will create tables in your database.
3. If you see an error about `DATABASE_URL`, go back to Step 3 and fix the URL in `.env`.

---

## Step 5: Get email (SMTP) for magic-link sign-in

You need an SMTP server so WarmPath can send sign-in links. Choose **one** option.

**Option A – Mailtrap (good for testing)**

1. Sign up at [mailtrap.io](https://mailtrap.io).
2. Create an inbox and open it. Go to "SMTP Settings" and copy the credentials (host, port, user, password).
3. In `.env`, set (use the values from Mailtrap):
   ```bash
   EMAIL_SERVER="smtp://USER:PASSWORD@smtp.mailtrap.io:2525"
   EMAIL_FROM="WarmPath <no-reply@yourdomain.com>"
   ```
   Replace `USER` and `PASSWORD` with Mailtrap’s SMTP user and password.

**Option B – Resend, SendGrid, or your host’s SMTP**

1. Sign up for the provider and get SMTP host, port, user, and password.
2. In `.env`, set:
   ```bash
   EMAIL_SERVER="smtp://USER:PASSWORD@HOST:PORT"
   EMAIL_FROM="WarmPath <a-verified-sender@yourdomain.com>"
   ```
   Use a sender address your provider allows (often you must verify a domain).

---

## Step 6: Start the app and sign in

1. In the project root, run:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.
3. Click **Sign in with email**, enter your email address, and submit.
4. Check your email (or Mailtrap inbox) for the magic link and click it.
5. You should land on **/network**. Your WarmPath app is running.

---

## Optional: Seed sample contacts

If you want a test user and a few contacts already in the database:

1. Stop the dev server (Ctrl+C).
2. Run:
   ```bash
   npx prisma db seed
   ```
3. Restart `npm run dev`. You can sign in with the seeded email (e.g. `founder@example.com`) or your own; if you use the seeded user, you’ll see the sample contacts on `/network`.

---

## Optional: Google Contacts import

Only if you want "Import from Google" on the import page:

1. In [Google Cloud Console](https://console.cloud.google.com), create a project and enable the **People API**.
2. Create **OAuth 2.0 credentials** (Web application). Add this redirect URI:  
   `http://localhost:3000/api/import/google/callback`  
   (or `YOUR_NEXTAUTH_URL/api/import/google/callback`).
3. Copy the Client ID and Client Secret.
4. In `.env`, add:
   ```bash
   GOOGLE_IMPORT_CLIENT_ID="your-client-id"
   GOOGLE_IMPORT_CLIENT_SECRET="your-client-secret"
   GOOGLE_IMPORT_REDIRECT_URI="http://localhost:3000/api/import/google/callback"
   ```
5. Restart the dev server. The "Import from Google" option will appear on `/network/import`.

---

## Troubleshooting

- **"Can't reach database"** – Check `DATABASE_URL` in `.env` and that Postgres is running (or the hosted DB is reachable).
- **"Module not found" or Prisma errors** – Run `npx prisma generate`, then `npm run dev` again.
- **No magic-link email** – Check `EMAIL_SERVER` and `EMAIL_FROM` in `.env`; for Mailtrap, look in the Mailtrap inbox, not your real email.
- **Redirect or session issues** – Ensure `NEXTAUTH_URL` matches the URL you use (e.g. `http://localhost:3000` with no trailing slash).
