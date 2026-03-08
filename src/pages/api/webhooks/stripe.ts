import type { APIRoute } from 'astro';
import { createClerkClient } from '@clerk/backend';
import Stripe from 'stripe';
import { mapStripeStatusToPlanStatus, withSubscriptionDefaults } from '../../../lib/subscription';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

const clerkClient = createClerkClient({ secretKey: import.meta.env.CLERK_SECRET_KEY });

function toIsoDate(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds) {
    return null;
  }

  return new Date(unixSeconds * 1000).toISOString();
}

async function syncFromSubscription(subscription: Stripe.Subscription) {
  const clerkUserId = subscription.metadata?.clerkUserId;
  if (!clerkUserId) {
    return;
  }

  const user = await clerkClient.users.getUser(clerkUserId);
  const current = withSubscriptionDefaults(user.privateMetadata?.subscription);

  await clerkClient.users.updateUserMetadata(clerkUserId, {
    privateMetadata: {
      subscription: {
        ...current,
        planKey: subscription.metadata?.planKey ?? current.planKey,
        planStatus: mapStripeStatusToPlanStatus(subscription.status),
        stripeCustomerId:
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id ?? current.stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: toIsoDate(subscription.current_period_end)
      }
    }
  });
}

async function syncFromCheckoutSession(session: Stripe.Checkout.Session) {
  const clerkUserId =
    session.metadata?.clerkUserId ||
    (typeof session.client_reference_id === 'string' ? session.client_reference_id : null);

  if (!clerkUserId) {
    return;
  }

  const user = await clerkClient.users.getUser(clerkUserId);
  const current = withSubscriptionDefaults(user.privateMetadata?.subscription);

  await clerkClient.users.updateUserMetadata(clerkUserId, {
    privateMetadata: {
      subscription: {
        ...current,
        planKey: session.metadata?.planKey ?? current.planKey,
        planStatus: 'active',
        stripeCustomerId:
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id ?? current.stripeCustomerId,
        stripeSubscriptionId:
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? current.stripeSubscriptionId
      }
    }
  });
}

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      import.meta.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signature verification failed';
    return new Response(message, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await syncFromCheckoutSession(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncFromSubscription(event.data.object as Stripe.Subscription);
      break;
    default:
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
};
