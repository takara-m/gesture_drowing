import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, packId } = req.body;

    // Validate required fields
    if (!priceId || !packId) {
      return res.status(400).json({ error: 'Missing required fields: priceId, packId' });
    }

    // Get origin for success/cancel URLs
    const origin = req.headers.origin || 'http://localhost:5173';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/templates/success?session_id={CHECKOUT_SESSION_ID}&pack_id=${packId}`,
      cancel_url: `${origin}/templates`,
      metadata: {
        packId, // Store pack ID in metadata for webhook processing
      },
    });

    // Return session URL and ID
    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('[API] Create checkout session error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
}
