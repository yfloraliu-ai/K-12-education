# Switching on accounts, subscriptions and metering

The app runs without any of this: with no environment variables it works anonymously,
stores everything in the browser, and counts free pieces client-side. Each service
below switches on one more piece, and nothing breaks while you set them up.

Set every variable in **Vercel → your project → Settings → Environment Variables**,
then **Deployments → ⋯ → Redeploy** (variables only reach a new deployment).

## 1. Database — server-side free-piece metering

Any Postgres works. The quickest on Vercel:

1. Vercel dashboard → **Storage** → **Create Database** → **Postgres** (Neon).
2. Connect it to the `k-12-education` project — Vercel sets the connection string
   for you. If your variable is named `POSTGRES_URL`, add `DATABASE_URL` with the
   same value (this app reads `DATABASE_URL`).
3. Redeploy. Tables are created automatically on the first request.

Free pieces are now counted per device on the server, so clearing site data no
longer resets them.

## 2. Resend — sign-in emails

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month).
2. **API Keys** → create one → set `RESEND_API_KEY`.
3. For testing you can skip domain setup; leave `EMAIL_FROM` unset and mail is
   sent from `onboarding@resend.dev`. Before charging real customers, verify your
   own domain under **Domains** and set
   `EMAIL_FROM="Maple Writing Coach <hello@yourdomain.ca>"`.

Parents can now sign in by email, and a subscription follows them to any device.

## 3. Stripe — subscriptions

1. Sign up at [stripe.com](https://stripe.com) and pick Canada.
2. **Product catalogue** → add a product "Maple Writing Coach Pro" with two
   recurring prices: **$4.99 CAD monthly** and **$49.99 CAD yearly**.
3. Copy each price's ID (`price_...`) into `STRIPE_PRICE_MONTHLY` and
   `STRIPE_PRICE_YEARLY`.
4. **Developers → API keys** → copy the secret key into `STRIPE_SECRET_KEY`.
   Use `sk_test_...` and test prices first; switch to live keys when ready.
5. **Developers → Webhooks** → **Add endpoint**:
   - URL: `https://k-12-education.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
6. **Settings → Billing → Customer portal** → enable it, so subscribers can
   cancel and update cards themselves.
7. Redeploy.

Checkout now runs end to end: pay → webhook marks the account Pro → the app
unlocks on the next load.

### Testing before going live

With `sk_test_...` keys, pay with card `4242 4242 4242 4242`, any future expiry,
any CVC. Watch the webhook deliveries in the Stripe dashboard; a red delivery
means the URL or signing secret is wrong.

## 4. Unlock codes — your own access, and comps

`PRO_UNLOCK_CODES` is a comma-separated list of codes that unlock the full app
without paying: your own access, teachers, beta families, or making good on a
problem.

```
PRO_UNLOCK_CODES="MAPLE-ADMIN-XXXXX-XXXXX-XXXXX,MAPLE-TEACH-XXXXX-XXXXX-XXXXX"
```

**This is the one paid-tier switch that needs nothing else.** No database, no
email, no Stripe — set the variable, redeploy, done. Steps 1-3 above are only
needed to charge other people.

To redeem: open the app, click the **"N free pieces left"** button in the
top-right (it's there from the first visit — you don't have to use up your free
pieces first), type the code, press **Unlock**. The header turns to **Pro** and
the limit is gone.

How it works, and what it does not do:

- Codes are checked on the server and never reach the browser, so they can't be
  found by reading the page.
- Redeeming sets a signed, HttpOnly cookie that lasts a year. It unlocks **that
  browser**, not an account — unlock each device you use. (If a database and
  email are configured and you're signed in, the account is marked comp as
  well, so it follows you.)
- Editing or removing a code revokes every pass issued under it. Set
  `UNLOCK_SECRET` to a new value to revoke passes while keeping the codes.
- `POST /api/billing/release` hands the pass back, for testing the free tier.

Treat these codes like passwords: anyone who has one gets unlimited AI usage
billed to your Anthropic key. Keep them out of the repository.

## What is stored where

| Data | Where |
|---|---|
| Parent email, subscription status, children's names and grades | Postgres |
| Which pieces a device has finished (ids only, no writing) | Postgres |
| Every essay, plan, chat and report card | The child's own browser |

Children's writing never leaves the device. Before charging real customers you
still need a privacy policy and terms — Alberta's PIPA and Canada's PIPEDA apply
to the parent's email and payment data.
