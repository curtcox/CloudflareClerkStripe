import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import clerk from '@clerk/astro';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    clerk({
      publishableKey:
        process.env.PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up'
    })
  ]
});
