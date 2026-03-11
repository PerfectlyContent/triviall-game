/**
 * stripe-template/supabase/functions/create-checkout-session/index.ts
 *
 * Creates a Stripe Checkout session and returns the redirect URL.
 *
 * ENV VARS required in Supabase dashboard → Edge Functions → Secrets:
 *   STRIPE_SECRET_KEY      — your Stripe secret key (sk_live_... or sk_test_...)
 *   STRIPE_PRICE_ID        — the Price ID to subscribe to (price_xxx)
 *   SUPABASE_URL           — auto-set by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — auto-set by Supabase
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno&no-check';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID')!;

    // ── 1. Authenticate user ──────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 2. Get or create Stripe customer ──────────────────────────────────────
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20', httpClient: Stripe.createFetchHttpClient() });

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // ── 3. Create Checkout session ────────────────────────────────────────────
    const origin = req.headers.get('origin') || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: stripePriceId, quantity: 1 }],
      // ✏️ Customise success/cancel URLs as needed
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/paywall?checkout=cancelled`,
      metadata: { supabase_user_id: user.id },
      // Optional: allow promotion codes
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('create-checkout-session error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
