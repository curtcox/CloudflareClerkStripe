# Cloudflare Setup Guide

This project deploys Astro to Cloudflare Pages and validates deployed build SHA from both `pages.dev` and a custom domain.

## 1. Create a Cloudflare Pages project

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com).
2. Open **Workers & Pages** -> **Create** -> **Pages**.
3. Create/select project and set project name.
4. Record the project name exactly (used for secret `CLOUDFLARE_PROJECT_NAME`).

## 2. Locate Account ID

1. In Cloudflare Dashboard, open any zone or account overview.
2. Find **Account ID** in the right sidebar/API section.
3. Copy it for `CLOUDFLARE_ACCOUNT_ID`.

## 3. Create an API token for Pages deployment

1. Go to **My Profile** -> **API Tokens** -> **Create Token**.
2. Start with **Edit Cloudflare Workers** template (or custom token with equivalent minimum permissions).
3. Ensure token has access to:
   - Pages project deploys
   - Pages project secret updates
4. Restrict to your account/project where possible.
5. Create token and copy value for `CLOUDFLARE_API_TOKEN`.

## 4. Determine deployment URLs

### `CLOUDFLARE_PAGES_URL`

1. Open your Pages project.
2. Copy the default URL (for example, `https://<project>.pages.dev`).

### `CUSTOM_DOMAIN_URL`

1. Configure your production custom domain in Pages project settings.
2. Copy canonical production URL (for example, `https://app.example.com`).
3. This URL is used by SHA validation workflow.

## 5. Secrets to configure

| Secret | Where to find/generate it | What it is for |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard -> My Profile -> API Tokens | Authenticates deploy workflow and runtime secret sync |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account overview sidebar/API section | Targets the correct Cloudflare account for deploy API calls |
| `CLOUDFLARE_PROJECT_NAME` | Workers & Pages -> project name | Tells workflow which Pages project to deploy and configure |
| `CLOUDFLARE_PAGES_URL` | Pages project default domain (`*.pages.dev`) | SHA validation target URL #1 |
| `CUSTOM_DOMAIN_URL` | Your configured Pages custom domain | SHA validation target URL #2 |

## 6. Runtime secrets synchronized by workflow

`deploy-cloudflare.yml` pushes these GitHub secrets into Cloudflare Pages runtime secrets each deploy:

- `PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_YEARLY_1`
- `STRIPE_PRICE_ID_YEARLY_10`

## 7. Verify Cloudflare setup

1. Trigger **Deploy Cloudflare** workflow.
2. Confirm deploy succeeds.
3. Open `https://<pages-url>/build-info.json` and verify `gitSha` exists.
4. Confirm **Validate Deployed SHA** workflow succeeds for both URLs.
