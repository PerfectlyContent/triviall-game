import { supabase } from './supabase';

export async function createCheckoutSession(): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('create-checkout-session');

  if (error) throw new Error(error.message || 'Failed to create checkout session');
  if (data?.error) throw new Error(data.error);
  if (!data?.url) throw new Error('No checkout URL returned');

  return data.url;
}

export async function createPortalSession(): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('create-portal-session');

  if (error) throw new Error(error.message || 'Failed to create portal session');
  if (data?.error) throw new Error(data.error);
  if (!data?.url) throw new Error('No portal URL returned');

  return data.url;
}
