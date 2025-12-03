import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, need raw body for signature verification
  },
};

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let event: Stripe.Event;

  try {
    // Get raw body
    const buf = await buffer(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      buf,
      signature,
      webhookSecret
    );
  } catch (error: any) {
    console.error('[Webhook] Signature verification failed:', error.message);
    return res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('[Webhook] Payment successful:', {
          sessionId: session.id,
          packId: session.metadata?.packId,
          amount: session.amount_total,
          customerEmail: session.customer_details?.email,
        });

        // TODO Phase 4: Save purchase to database
        // For now, we rely on frontend localStorage tracking

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[Webhook] Checkout session expired:', session.id);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Error processing event:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
