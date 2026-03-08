import type { APIRoute } from 'astro';
import { createClerkClient } from '@clerk/backend';
import Stripe from 'stripe';
import { z } from 'zod';
import { getPlanPriceId, isPlanKey } from '../../../lib/plans';
import { withSubscriptionDefaults } from '../../../lib/subscription';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

const checkoutSchema = z.object({
  plan: z.string()
});

export const POST: APIRoute = async ({ request, locals }) => {
  const { userId } = locals.auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const input = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!input.success || !isPlanKey(input.data.plan)) {
    return new Response(JSON.stringify({ error: 'Invalid plan value' }), { status: 400 });
  }

  const planKey = input.data.plan;
  const priceId = getPlanPriceId(planKey);

  const clerkClient = createClerkClient({ secretKey: import.meta.env.CLERK_SECRET_KEY });
  const user = await clerkClient.users.getUser(userId);
  const subscription = withSubscriptionDefaults(user.privateMetadata?.subscription);

  let customerId = subscription.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.primaryEmailAddress?.emailAddress ?? undefined,
      metadata: {
        clerkUserId: userId
      }
    });
    customerId = customer.id;
  }

  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      clerkUserId: userId,
      planKey
    },
    subscription_data: {
      metadata: {
        clerkUserId: userId,
        planKey
      }
    },
    client_reference_id: userId,
    success_url: `${origin}/account?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=canceled`
  });

  if (!session.url) {
    return new Response(JSON.stringify({ error: 'Stripe checkout URL is unavailable' }), {
      status: 500
    });
  }

  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      subscription: {
        ...subscription,
        planKey,
        stripeCustomerId: customerId
      }
    }
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
};
