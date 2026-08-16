import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn(
        "Stripe publishable key is missing from environment variables.",
      );
    }
    stripePromise = loadStripe(key || "");
  }
  return stripePromise;
};
