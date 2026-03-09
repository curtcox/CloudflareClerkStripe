# Cloudflare Setup Guide

This project deploys Astro to Cloudflare Pages and validates deployed build SHA from both `pages.dev` and a custom domain.

## 1. Prerequisites

- Cloudflare account with access to Pages
- `wrangler` CLI (already in this repo via `npm` scripts)
- Optional but recommended for CLI parsing: `jq`

Authenticate Wrangler (pick one):

```bash
npx wrangler login
```

or (CI-style auth):

```bash
export CLOUDFLARE_API_TOKEN="<token>"
export CLOUDFLARE_ACCOUNT_ID="<account-id>"
```

## 2. Create a Pages project

### Dashboard

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com).
2. Open **Workers & Pages**.
3. Create/select your Pages project.
4. Save the project name for `CLOUDFLARE_PROJECT_NAME`.

### CLI (available)

Create a project:

```bash
npx wrangler pages project create <project-name> --production-branch main
```

List projects:

```bash
npx wrangler pages project list --json
```

## 3. Cloudflare secrets required by this repo

| Secret | What it is used for | Dashboard procedure | CLI/API procedure |
|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Auth for deploy + Cloudflare runtime secret sync in `.github/workflows/deploy-cloudflare.yml` | My Profile -> API Tokens -> Create Token -> Custom token -> Account permission `Cloudflare Pages:Edit` | Token creation is dashboard-only for this workflow path. You can verify a token from CLI: `curl -s https://api.cloudflare.com/client/v4/user/tokens/verify -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq` |
| `CLOUDFLARE_ACCOUNT_ID` | Targets the correct Cloudflare account in deploy/API calls | Account overview/API section in Cloudflare dashboard | `npx wrangler whoami --json` (read the `accounts[].id` value) |
| `CLOUDFLARE_PROJECT_NAME` | Identifies which Pages project to deploy and configure | Workers & Pages project name | `npx wrangler pages project list --json` (read the `name` field) |
| `CLOUDFLARE_PAGES_URL` | SHA validation target URL #1 in `.github/workflows/validate-deployed-sha.yml` | Pages project -> custom domains/default domain (`*.pages.dev`) | `curl -s "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$CLOUDFLARE_PROJECT_NAME" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq -r '.result.subdomain'` then prepend `https://` |
| `CUSTOM_DOMAIN_URL` | SHA validation target URL #2 in `.github/workflows/validate-deployed-sha.yml` | Pages project -> Custom domains | `curl -s "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$CLOUDFLARE_PROJECT_NAME/domains" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq -r '.result[].name'` then choose prod domain and prepend `https://` |

## 4. API token permission scope (important)

For this repo’s deployment flow, minimum account-level permission is:

- **Cloudflare Pages: Edit**

If you use API reads/CLI lookups shown above, include read capability as needed (Pages read endpoints accept `Pages Read` or `Pages Write`).

## 5. Runtime secrets synchronized to Cloudflare Pages

`deploy-cloudflare.yml` syncs these GitHub secret values into Cloudflare Pages runtime secrets each deploy:

- `PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_YEARLY_1`
- `STRIPE_PRICE_ID_YEARLY_10`

Manual CLI equivalent:

```bash
printf '%s' "$CLERK_SECRET_KEY" | npx wrangler pages secret put CLERK_SECRET_KEY --project-name "$CLOUDFLARE_PROJECT_NAME"
```

List existing Pages secrets:

```bash
npx wrangler pages secret list --project-name "$CLOUDFLARE_PROJECT_NAME"
```

## 6. Optional: set the Cloudflare values in GitHub via CLI

If you use GitHub CLI:

```bash
gh secret set CLOUDFLARE_API_TOKEN --body "$CLOUDFLARE_API_TOKEN"
gh secret set CLOUDFLARE_ACCOUNT_ID --body "$CLOUDFLARE_ACCOUNT_ID"
gh secret set CLOUDFLARE_PROJECT_NAME --body "$CLOUDFLARE_PROJECT_NAME"
gh secret set CLOUDFLARE_PAGES_URL --body "$CLOUDFLARE_PAGES_URL"
gh secret set CUSTOM_DOMAIN_URL --body "$CUSTOM_DOMAIN_URL"
```

## 7. Verify Cloudflare setup

1. Trigger **Deploy Cloudflare** workflow.
2. Confirm deployment succeeds.
3. Open `https://<pages-url>/build-info.json` and verify `gitSha` exists.
4. Confirm **Validate Deployed SHA** succeeds for both URLs.

## 8. Note about action choice in this repo

This repo currently uses `cloudflare/pages-action@v1` in `deploy-cloudflare.yml`.
That action is deprecated upstream; it still works, but a future migration to Wrangler Action is recommended.
