# Cloudflare Clerk Stripe Starter

Minimal Astro + TypeScript starter with:

- Cloudflare Pages deployment
- Clerk authentication (email + social)
- Stripe subscriptions (`$1/year`, `$10/year`)
- Build metadata embedding (`buildDate`, `gitSha`)
- GitHub Pages build report (includes unit test results)
- Post-deploy SHA validation workflow

## Routes

- `/` home
- `/pricing` Stripe checkout buttons
- `/sign-in` Clerk sign in
- `/sign-up` Clerk sign up
- `/account` protected account page with subscription metadata
- `/build-info.json` build date + git SHA JSON payload

## Environment Variables

Copy `.env.example` to `.env` for local development.

Required keys:

- `CLERK_PUBLISHABLE_KEY`
- `PUBLIC_CLERK_PUBLISHABLE_KEY` (same value as `CLERK_PUBLISHABLE_KEY`)
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_YEARLY_1`
- `STRIPE_PRICE_ID_YEARLY_10`

## Local Development

```bash
npm install
npm run dev
```

Run unit tests:

```bash
npm run test:unit
```

Build:

```bash
npm run build
```

## GitHub Secrets

Add these repository secrets:

### Cloudflare

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PROJECT_NAME`
- `CLOUDFLARE_PAGES_URL`
- `CUSTOM_DOMAIN_URL`

### Clerk

- `CLERK_PUBLISHABLE_KEY`
- `PUBLIC_CLERK_PUBLISHABLE_KEY` (use same value as `CLERK_PUBLISHABLE_KEY`)
- `CLERK_SECRET_KEY`

### Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_YEARLY_1`
- `STRIPE_PRICE_ID_YEARLY_10`

## Workflows

- `.github/workflows/ci.yml`
  - Runs tests and build
  - Uploads machine-readable `artifacts/test-results.json`

- `.github/workflows/deploy-build-report.yml`
  - Runs tests
  - Generates and deploys HTML build report to GitHub Pages
  - Includes build date and full commit SHA

- `.github/workflows/deploy-cloudflare.yml`
  - Builds Astro app with embedded build metadata
  - Syncs Clerk/Stripe secrets to Cloudflare Pages runtime secrets
  - Deploys to Cloudflare Pages

- `.github/workflows/validate-deployed-sha.yml`
  - Validates `/build-info.json` from both `CLOUDFLARE_PAGES_URL` and `CUSTOM_DOMAIN_URL`
  - Fails if deployed SHA does not match expected commit SHA

## Stripe Webhook Setup

Point Stripe webhook endpoint to:

- `https://<your-domain>/api/webhooks/stripe`

Enable events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Notes

- Subscription status is stored in Clerk `privateMetadata.subscription`.
- No D1/KV database is used.
