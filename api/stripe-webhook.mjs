// Stripe webhook: turns Pro on or off for an account when Stripe says a
// subscription started, changed or ended. Runs on Vercel at /api/stripe-webhook.
//
// Needs three environment variables set in Vercel (never in the repo):
//   STRIPE_WEBHOOK_SECRET       the signing secret Stripe shows for this endpoint (whsec_...)
//   SUPABASE_URL                your Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY   Supabase's secret service role key
//
// It has no dependencies: the Stripe signature is checked by hand, following
// https://docs.stripe.com/webhooks#verify-manually, and the account is updated
// through Supabase's REST API.

import { createHmac, timingSafeEqual } from 'node:crypto';

const FIVE_MINUTES = 300;

function signatureIsValid(body, header, secret) {
  const parts = Object.fromEntries(
    String(header || '').split(',').map((piece) => {
      const i = piece.indexOf('=');
      return [piece.slice(0, i), piece.slice(i + 1)];
    }),
  );
  const timestamp = Number(parts.t);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > FIVE_MINUTES) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
  // A header can carry several v1 signatures while a secret is being rolled.
  return String(header)
    .split(',')
    .filter((piece) => piece.startsWith('v1='))
    .some((piece) => {
      const given = Buffer.from(piece.slice(3), 'hex');
      const want = Buffer.from(expected, 'hex');
      return given.length === want.length && timingSafeEqual(given, want);
    });
}

// Update profile rows that match `filter`, e.g. "id=eq.<uuid>".
async function updateProfiles(filter, fields) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/profiles?${filter}`, {
    method: 'PATCH',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ...fields, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error(`Supabase update failed: ${response.status} ${await response.text()}`);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CUSTOMER = /^cus_[A-Za-z0-9]+$/;

export async function POST(request) {
  const { STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response('Webhook is not configured', { status: 500 });
  }

  const body = await request.text();
  if (!signatureIsValid(body, request.headers.get('stripe-signature'), STRIPE_WEBHOOK_SECRET)) {
    return new Response('Bad signature', { status: 400 });
  }

  const event = JSON.parse(body);
  const object = event.data.object;

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      // client_reference_id is the account id the app put on the payment link.
      const paid = object.payment_status === 'paid' || object.payment_status === 'no_payment_required';
      if (paid && UUID.test(object.client_reference_id || '')) {
        const fields = { pro: true };
        if (CUSTOMER.test(object.customer || '')) fields.stripe_customer_id = object.customer;
        await updateProfiles(`id=eq.${object.client_reference_id}`, fields);
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      if (CUSTOMER.test(object.customer || '')) {
        const active = event.type !== 'customer.subscription.deleted' && ['active', 'trialing', 'past_due'].includes(object.status);
        await updateProfiles(`stripe_customer_id=eq.${object.customer}`, { pro: active });
      }
    }
  } catch (err) {
    console.error(err);
    // A 500 makes Stripe retry later.
    return new Response('Could not update the account', { status: 500 });
  }

  return new Response('ok', { status: 200 });
}
