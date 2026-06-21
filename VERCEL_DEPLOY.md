# Deploying 5X Finder to Vercel

This guide walks you through deploying the 5X Finder app to Vercel with Vercel Postgres (Neon).

---

## Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (you can sign up with your GitHub account)
- The project code pushed to a GitHub repository

---

## Step 1: Push Your Code to GitHub

1. Download the project files from the sandbox (use the download button or copy the code)
2. Create a new GitHub repository (e.g., `5x-finder`)
3. Push the code:

```bash
cd 5x-finder
git init
git add .
git commit -m "5X Finder - AI-Powered Fintech Stock Picking Model"
git remote add origin https://github.com/YOUR_USERNAME/5x-finder.git
git branch -M main
git push -u origin main
```

> **Important:** Before pushing, you need to make one change for Vercel compatibility:

### Change Prisma from SQLite to PostgreSQL

Open `prisma/schema.prisma` and change line 6:

```diff
datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Also remove `output: "standalone"` from `next.config.ts` if present.

---

## Step 2: Create a Vercel Account

1. Go to [vercel.com](https://vercel.com) and click **Sign Up**
2. Choose **Continue with GitHub** to link your GitHub account

---

## Step 3: Import Your Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Find your `5x-finder` repository and click **Import**
3. Keep the default Framework Preset: **Next.js**

---

## Step 4: Create a Vercel Postgres Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) → **Storage** tab
2. Click **Create Database** → Select **Postgres (Neon)**
3. Name it `5x-finder-db` → Select your region → Click **Create**
4. After creation, click **Connect to Project** and select your `5x-finder` project
5. This automatically sets the `DATABASE_URL` environment variable

---

## Step 5: Deploy

1. Back on your project's **Deploy** page, the `DATABASE_URL` should already be set
2. Click **Deploy**
3. Wait for the build to complete (usually 1-2 minutes)

---

## Step 6: Seed the Database

After the first deployment, you need to populate the stock data. Run this in your terminal:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull the DATABASE_URL
vercel env pull .env.local

# Run the seed script
npx prisma db seed
```

Or manually set the DATABASE_URL and run:
```bash
DATABASE_URL="your-postgres-url-here" npx prisma db seed
```

---

## Step 7: Share with Friends! 🎉

Your app is now live at a URL like:
- `5x-finder.vercel.app`
- Or any custom domain you configure

This URL:
- ✅ Works with proper HTTPS (trusted certificate)
- ✅ Opens in WeChat and WhatsApp browsers
- ✅ Works on mobile devices
- ✅ Free on Vercel's hobby plan

---

## Quick Summary

| Step | Action |
|------|--------|
| 1 | Push code to GitHub (change `sqlite` → `postgresql` in schema first!) |
| 2 | Sign up at vercel.com |
| 3 | Import your GitHub repo |
| 4 | Create Postgres database and connect to project |
| 5 | Deploy |
| 6 | Seed the database |
| 7 | Share the URL! |

---

## Troubleshooting

**Build fails with "prisma generate" error:**
- Make sure `postinstall` script in package.json includes `prisma generate`

**Database connection error:**
- Check that `DATABASE_URL` is set in Vercel → Settings → Environment Variables
- The URL must include `?sslmode=require`

**Page loads but shows "0 stocks":**
- You need to run `prisma db seed` to populate the stock data

**AI Analysis or News doesn't work:**
- These features use the z-ai-web-dev-sdk which is sandbox-specific
- On Vercel, you'd need to set up your own AI API keys
