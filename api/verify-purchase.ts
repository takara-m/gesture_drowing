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
    const { sessionId, packId } = req.body;

    // Validate required fields
    if (!sessionId || !packId) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, packId' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify payment status
    if (session.payment_status !== 'paid') {
      console.log('[API] Payment not completed for session:', sessionId);
      return res.status(403).json({ error: 'Payment not completed' });
    }

    // Verify pack ID matches
    if (session.metadata?.packId !== packId) {
      console.log('[API] Pack ID mismatch for session:', sessionId);
      return res.status(403).json({ error: 'Pack ID mismatch' });
    }

    // Log successful verification
    console.log('[API] Purchase verified:', {
      sessionId: session.id,
      packId: session.metadata?.packId,
      amount: session.amount_total,
      customerEmail: session.customer_details?.email,
    });

    return res.status(200).json({
      verified: true,
      packId: session.metadata?.packId,
      purchaseDate: new Date(session.created * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Verify purchase error:', error);

    // Handle session not found
    if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.status(500).json({
      error: 'Verification failed',
      message: error.message,
    });
  }
}
