import Stripe from "stripe";
import { query } from "./db.js";
import type { Account } from "./auth.js";

/** Stripe subscriptions. Absent keys simply disable checkout, not the app. */

let stripeClient: Stripe | null = null;

export function billingConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && (process.env.STRIPE_PRICE_MONTHLY || process.env.STRIPE_PRICE_YEARLY));
}

export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set.");
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export function priceFor(cycle: string): string | null {
  return (cycle === "yearly" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY) ?? null;
}

export async function createCheckoutSession(
  account: Account,
  cycle: string,
  appUrl: string
): Promise<string> {
  const price = priceFor(cycle);
  if (!price) throw new Error(`No Stripe price configured for "${cycle}".`);
  const base = appUrl.replace(/\/$/, "");
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    // Reuse the customer once they have one so Stripe doesn't duplicate them.
    ...(account.stripe_customer
      ? { customer: account.stripe_customer }
      : { customer_email: account.email }),
    client_reference_id: account.id,
    // The account id also rides on the subscription so webhooks can find it
    // even when the checkout session has aged out.
    subscription_data: { metadata: { account_id: account.id } },
    metadata: { account_id: account.id },
    allow_promotion_codes: true,
    success_url: `${base}/?upgraded=1`,
    cancel_url: `${base}/?upgrade_cancelled=1`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return session.url;
}

export async function createPortalSession(account: Account, appUrl: string): Promise<string> {
  if (!account.stripe_customer) throw new Error("This account has no subscription yet.");
  const session = await getStripe().billingPortal.sessions.create({
    customer: account.stripe_customer,
    return_url: appUrl.replace(/\/$/, "") + "/",
  });
  return session.url;
}

/** Write a subscription's current state onto its account. */
export async function syncSubscription(subscription: Stripe.Subscription): Promise<void> {
  const customer = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const accountId = subscription.metadata?.account_id;
  const periodEndSeconds = (subscription as unknown as { current_period_end?: number }).current_period_end;
  const periodEnd = periodEndSeconds ? new Date(periodEndSeconds * 1000) : null;
  // Anything but a live subscription drops the account back to free.
  const pro = ["active", "trialing"].includes(subscription.status);

  const where = accountId ? "id = $5" : "stripe_customer = $5";
  await query(
    `UPDATE accounts
        SET plan = $1, plan_status = $2, period_end = $3, stripe_sub = $4, stripe_customer = COALESCE(stripe_customer, $6)
      WHERE ${where}`,
    [pro ? "pro" : "free", subscription.status, periodEnd, subscription.id, accountId ?? customer, customer]
  );
}

/** Attach the Stripe customer to the account as soon as checkout completes. */
export async function linkCheckout(session: Stripe.Checkout.Session): Promise<void> {
  const accountId = session.client_reference_id ?? session.metadata?.account_id;
  const customer = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (!accountId || !customer) return;
  await query(`UPDATE accounts SET stripe_customer = $1 WHERE id = $2`, [customer, accountId]);
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  if (subscriptionId) {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    await syncSubscription(subscription);
  }
}
