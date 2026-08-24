namespace NodeJS {
  interface ProcessEnv {
    /** Browser-exposed (NEXT_PUBLIC_ prefix is required by Next.js). */
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  }
}
