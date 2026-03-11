/**
 * stripe-template/supabase/functions/stripe-webhook/index.ts
 *
 * Receives Stripe events and keeps your DB in sync.
 *
 * Events handled:
 *   checkout.session.completed      → subscription activated
 *   invoice.paid                    → renewal confirmed
 *   customer.subscription.updated   → plan change / payment issue
 *   customer.subscription.deleted   → cancellation
 *
 * ENV VARS required:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET   — from Stripe dashboard → Webhooks → signing secret
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * SETUP:
 *   In Stripe dashboard → Developers → Webhooks, add an endpoint pointing to
 *   https://<project-ref>.supabase.co/functions/v1/stripe-webhook
 *   and subscribe to the 4 events listed above.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno&no-check';

serve(async (req) => {
  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20', httpClient: Stripe.createFetchHttpClient() });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── 1. Verify webhook signature ───────────────────────────────────────────
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(`Webhook error: ${(err as Error).message}`, { status: 400 });
    }

    console.log(`[Stripe Webhook] Received: ${event.type}`);

    // ── 2. Handle events ──────────────────────────────────────────────────────
    switch (event.type) {

      // New subscription created via Checkout
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        if (!userId) {
          console.warn('No supabase_user_id in checkout session metadata');
          break;
        }

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            stripe_customer_id: session.customer as string,
          })
          .eq('id', userId);

        // Persist full subscription record
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: sub.id,
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          }, { onConflict: 'stripe_subscription_id' });
        }
        break;
      }

      // Successful renewal payment
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const customerId = sub.customer as string;

        // Update subscription record
        await supabase
          .from('subscriptions')
          .update({
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subId);

        // Also update profile subscription_status (e.g. past_due → active after successful payment)
        await supabase
          .from('profiles')
          .update({ subscription_status: sub.status === 'active' ? 'active' : 'past_due' })
          .eq('stripe_customer_id', customerId);
        break;
      }

      // Plan changes, payment failures, reactivations
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        // Map Stripe status → your app's status
        const status: string = (() => {
          if (sub.status === 'active') return 'active';
          if (sub.status === 'past_due') return 'past_due';
          return 'cancelled';
        })();

        await supabase
          .from('profiles')
          .update({ subscription_status: status })
          .eq('stripe_customer_id', customerId);

        await supabase
          .from('subscriptions')
          .update({
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      // Subscription cancelled (immediately or at period end)
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase
          .from('profiles')
          .update({ subscription_status: 'cancelled' })
          .eq('stripe_customer_id', customerId);

        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[Stripe Webhook] Unexpected error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
