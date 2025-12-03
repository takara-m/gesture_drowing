import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Stripeインスタンスを取得
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('[StripeService] Publishable key not found');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Stripe Checkoutへリダイレクト
 * @param priceId Stripe Price ID
 * @param packId テンプレートパックID（カスタムメタデータ）
 */
export const redirectToCheckout = async (priceId: string, packId: string): Promise<void> => {
  try {
    console.log('[StripeService] Creating checkout session...');

    // Call backend API to create Checkout Session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        packId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();

    if (!url) {
      throw new Error('Checkout session URL not found');
    }

    // Redirect to Stripe Checkout
    console.log('[StripeService] Redirecting to Stripe Checkout...');
    window.location.href = url;

  } catch (error) {
    console.error('[StripeService] Failed to redirect to checkout:', error);
    throw error;
  }
};
