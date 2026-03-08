# GitHub Setup Guide

This repository uses GitHub Actions for CI, build report publishing (GitHub Pages), Cloudflare deployment, and deployed SHA validation.

## 1. Enable GitHub Actions

1. In your repository, open **Settings** -> **Actions** -> **General**.
2. Allow actions for your organization policy.
3. Keep default workflow permissions at least read access to repository contents.

## 2. Configure GitHub Pages for build report

1. Open **Settings** -> **Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as source.
3. No branch selection is needed because `deploy-build-report.yml` uses `actions/deploy-pages`.

## 3. Add repository secrets

Go to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Create all secrets listed in each provider doc:

- Cloudflare secrets: see [`docs/cloudflare.md`](./cloudflare.md)
- Clerk secrets: see [`docs/clerk.md`](./clerk.md)
- Stripe secrets: see [`docs/stripe.md`](./stripe.md)

## 4. Secret inventory and purpose

| Secret | Used by workflow(s) | Purpose |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | `deploy-cloudflare.yml` | Authenticate Cloudflare deployment and secret sync |
| `CLOUDFLARE_ACCOUNT_ID` | `deploy-cloudflare.yml` | Identify Cloudflare account |
| `CLOUDFLARE_PROJECT_NAME` | `deploy-cloudflare.yml` | Target Pages project |
| `CLOUDFLARE_PAGES_URL` | `validate-deployed-sha.yml` | Validate deployed SHA on pages.dev endpoint |
| `CUSTOM_DOMAIN_URL` | `validate-deployed-sha.yml` | Validate deployed SHA on custom domain endpoint |
| `CLERK_PUBLISHABLE_KEY` | `ci.yml`, `deploy-cloudflare.yml` | Clerk frontend integration key |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | `ci.yml`, Cloudflare runtime secret sync | Public Clerk key used by Clerk env resolution |
| `CLERK_SECRET_KEY` | `ci.yml`, `deploy-cloudflare.yml` | Clerk server API access |
| `STRIPE_SECRET_KEY` | `ci.yml`, `deploy-cloudflare.yml` | Stripe server API access |
| `STRIPE_WEBHOOK_SECRET` | `ci.yml`, `deploy-cloudflare.yml` | Stripe webhook signature verification |
| `STRIPE_PRICE_ID_YEARLY_1` | `ci.yml`, `deploy-cloudflare.yml` | Stripe price mapping for `$1/year` plan |
| `STRIPE_PRICE_ID_YEARLY_10` | `ci.yml`, `deploy-cloudflare.yml` | Stripe price mapping for `$10/year` plan |

## 5. Workflow trigger behavior

- `ci.yml`: runs on pull requests and `push` to `main`
- `deploy-build-report.yml`: runs on `push` to `main` and manual dispatch
- `deploy-cloudflare.yml`: runs on `push` to `main` and manual dispatch
- `validate-deployed-sha.yml`: runs after successful Cloudflare deploy workflow and manual dispatch

## 6. First-run checklist

1. Add all required secrets.
2. Push to `main`.
3. Confirm these workflows succeed in order:
   - CI
   - Deploy Build Report
   - Deploy Cloudflare
   - Validate Deployed SHA
4. Open GitHub Pages build report and verify build date/SHA/test summary.
