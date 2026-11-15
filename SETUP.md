# BreakMath setup

How to switch on sign-in, payments and analytics. Everything is off until its values are filled in, so the site keeps working at every step.

Site: https://breakmath.vercel.app

## 1. Analytics (2 minutes)

1. In Vercel, open the BreakMath project, then the **Analytics** tab.
2. Click **Enable**.

That's all: the tracking tag is already on every page. Visitors, top pages, referrers (TikTok, Instagram) and countries show up in that tab. To tell ads apart, put `?utm_source=tiktok` or `?utm_source=instagram` on the links you post.

## 2. Sign-in and accounts (15 minutes)

Accounts run on Supabase (free plan).

1. Create an account at supabase.com and click **New project**. Name it `breakmath`, choose a region near you, and save the database password somewhere safe.
2. **SQL Editor → New query.** Paste in everything from `supabase/schema.sql` and click **Run**. It should say "Success".
3. **Authentication → Sign In / Providers → Email.** Turn **Confirm email** off, and save. (Supabase's built-in email sender only allows a few emails an hour, so confirmation emails would block sign-ups. See "Later" below.)
4. **Authentication → URL Configuration.** Set **Site URL** to `https://breakmath.vercel.app/app.html`.
5. **Project Settings → API.** Copy the **Project URL** and the **anon public** key. Put them in `config.js` as `supabaseUrl` and `supabaseAnonKey`, then commit and push. Both are meant to be public.

Do **not** put the `service_role` key in `config.js` or anywhere in the repo. It only goes into Vercel in step 3.

Once those two values are live: the app asks people to sign in, saves breaks to their account, and the free plan's 3 breaks a month is enforced by the database for each account.

## 3. Payments (25 minutes)

Stripe needs an account holder who is 18 or older.

**In Stripe**

1. **Product catalog → Add product.** Name `BreakMath Pro`. Price `$15.00`, recurring, monthly. Add another price: `$119.00`, recurring, yearly.
2. **Payment Links → New**, for the monthly price. On the **After payment** tab choose **Don't show confirmation page** and redirect to:
   `https://breakmath.vercel.app/app.html?paid=1`
   Create the link and copy it. Do the same for the yearly price.
3. **Settings → Billing → Customer portal.** Turn on the portal link and copy it.
4. **Developers → Webhooks → Add endpoint.**
   - URL: `https://breakmath.vercel.app/api/stripe-webhook`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
   - After creating it, reveal and copy the **Signing secret** (starts with `whsec_`).

**In Vercel** (Project → Settings → Environment Variables), add three variables, then redeploy:

| Name | Value |
|---|---|
| `STRIPE_WEBHOOK_SECRET` | the signing secret from Stripe |
| `SUPABASE_URL` | your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key |

These three are secrets. Type them into Vercel yourself. Never paste them into a chat, an email or the repo.

**In the repo**

Put the two payment links and the portal link in `config.js` (`stripeMonthlyLink`, `stripeYearlyLink`, `stripePortalLink`), commit and push.

Once the links are live: the free plan's limits switch on, "Get Pro" buttons appear, and a completed payment marks that account as Pro within a few seconds. Cancelling in Stripe turns Pro off at the end of the paid period.

**Test before real money.** Do all of the above in Stripe's test mode (or a sandbox) first, and pay with card `4242 4242 4242 4242`, any future date, any CVC. Check that the account flips to Pro, then cancel the subscription in Stripe and check it flips back.

## Later

- **Email confirmation and password resets at scale.** Add your own email sender in Supabase (**Authentication → Emails → SMTP settings**; Resend has a free plan), then turn **Confirm email** back on.
- **Vercel plan.** Vercel's free Hobby plan is for personal, non-commercial projects. Once BreakMath takes payments, check Vercel's terms; you will likely need the Pro plan.
- **Google sign-in.** Can be added in Supabase under Sign In / Providers.
