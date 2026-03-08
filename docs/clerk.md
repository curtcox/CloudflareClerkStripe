# Clerk Setup Guide

This project uses Clerk for authentication (email + social). Clerk values are used in local `.env` and in GitHub repository secrets.

## 1. Create a Clerk application

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com).
2. Click **Add application**.
3. Name the app (for example, `cloudflare-clerk-stripe-starter`).
4. Select the sign-in methods you want:
   - Email (recommended)
   - Social providers (Google, GitHub, etc.)
5. Create the app.

## 2. Enable email + social authentication

1. In Clerk Dashboard, open your app.
2. Go to **User & Authentication**.
3. Under **Email, Phone, Username**, enable your email strategy.
4. Under **Social Connections**, enable the providers you want.
5. For each social provider, copy Clerk callback URLs and configure them in the provider console.

## 3. Locate Clerk keys

In Clerk Dashboard for your app:

1. Go to **Developers** -> **API Keys**.
2. Copy:
   - **Publishable key** (`pk_...`)
   - **Secret key** (`sk_...`)

## 4. Secrets to configure

| Secret | Where to find it | What it is for |
|---|---|---|
| `CLERK_PUBLISHABLE_KEY` | Clerk Dashboard -> Developers -> API Keys -> Publishable key | Passed to Clerk frontend SDK/integration for browser auth flows |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Same value as `CLERK_PUBLISHABLE_KEY` | Runtime public key expected by Clerk environment resolution in server/client contexts |
| `CLERK_SECRET_KEY` | Clerk Dashboard -> Developers -> API Keys -> Secret key | Server-side Clerk API calls (read/update user metadata in account + Stripe webhook sync) |

## 5. Add Clerk values locally

Add to `.env`:

```bash
CLERK_PUBLISHABLE_KEY=pk_test_...
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 6. Add Clerk values to GitHub

1. In GitHub repo: **Settings** -> **Secrets and variables** -> **Actions**.
2. Create the three Clerk secrets listed above.
3. These are consumed by:
   - `.github/workflows/ci.yml`
   - `.github/workflows/deploy-cloudflare.yml`

## 7. Verify Clerk setup

1. Run the app locally: `npm run dev`.
2. Open `/sign-up` and create a user.
3. Sign in at `/sign-in`.
4. Visit `/account` and confirm you can access the protected page.
