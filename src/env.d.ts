/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  readonly CLERK_PUBLISHABLE_KEY: string;
  readonly CLERK_SECRET_KEY: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_WEBHOOK_SECRET: string;
  readonly STRIPE_PRICE_ID_YEARLY_1: string;
  readonly STRIPE_PRICE_ID_YEARLY_10: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
