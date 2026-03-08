# Stripe Setup Guide

This project uses Stripe Checkout subscriptions with two yearly plans.

## 1. Create products and prices

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com).
2. Open **Product catalog** -> **Add product**.
3. Create product for `$1/year`:
   - Name: `Starter $1/year`
   - Pricing model: **Recurring**
   - Amount: `1.00 USD`
   - Billing period: `Yearly`
4. Create product for `$10/year`:
   - Name: `Starter $10/year`
   - Pricing model: **Recurring**
   - Amount: `10.00 USD`
   - Billing period: `Yearly`
5. Open each created price and copy the **Price ID** (`price_...`).

## 2. Locate/generate API keys

1. In Stripe Dashboard, go to **Developers** -> **API keys**.
2. Copy **Secret key** (`sk_test_...` or `sk_live_...`).
3. Do not use restricted keys for this starter flow.

## 3. Create webhook endpoint and get signing secret

1. Go to **Developers** -> **Webhooks** -> **Add endpoint**.
2. Endpoint URL:
   - Local testing: your tunnel URL + `/api/webhooks/stripe`
   - Production: `https://<your-domain>/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Save endpoint.
5. Open endpoint details and click **Reveal** on **Signing secret** (`whsec_...`).

## 4. Secrets to configure

| Secret | Where to find it | What it is for |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard -> Developers -> API keys -> Secret key | Server-side Stripe SDK calls to create checkout sessions and parse webhook events |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard -> Developers -> Webhooks -> endpoint -> Signing secret | Verifies webhook signatures for `/api/webhooks/stripe` |
| `STRIPE_PRICE_ID_YEARLY_1` | Stripe Dashboard -> Product catalog -> `$1/year` price | Maps `yearly_1` plan to Stripe recurring price |
| `STRIPE_PRICE_ID_YEARLY_10` | Stripe Dashboard -> Product catalog -> `$10/year` price | Maps `yearly_10` plan to Stripe recurring price |

## 5. Add Stripe values locally

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_YEARLY_1=price_...
STRIPE_PRICE_ID_YEARLY_10=price_...
```

## 6. Add Stripe values to GitHub

1. In GitHub repo: **Settings** -> **Secrets and variables** -> **Actions**.
2. Add all four Stripe secrets.
3. These are consumed by:
   - `.github/workflows/ci.yml`
   - `.github/workflows/deploy-cloudflare.yml`

## 7. Verify Stripe setup

1. Sign in to the app.
2. Open `/pricing`.
3. Start checkout for both plans.
4. Complete test-mode checkout with Stripe test cards.
5. Confirm webhook updates are reflected in `/account`.
