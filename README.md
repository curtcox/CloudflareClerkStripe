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

## Targeted Setup Docs

Use these guides for detailed setup and secret management:

- GitHub Actions and repository setup: [`docs/github.md`](./docs/github.md)
- Cloudflare Pages setup and deploy secrets: [`docs/cloudflare.md`](./docs/cloudflare.md)
- Clerk auth setup and keys: [`docs/clerk.md`](./docs/clerk.md)
- Stripe products/prices/webhooks and keys: [`docs/stripe.md`](./docs/stripe.md)

Each guide includes:

- How to find or generate each required secret
- What each secret is used for
- Where each secret is consumed in workflows/runtime

## Local Development

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:

```bash
npm install
```

3. Run dev server:

```bash
npm run dev
```

## Test and Build

Run unit tests:

```bash
npm run test:unit
```

Build production output:

```bash
npm run build
```

## Notes

- Subscription status is stored in Clerk `privateMetadata.subscription`.
- No D1/KV database is used.
