// BreakMath site settings. Everything you need to fill in is in this file.
// Empty values are fine: each feature simply stays off until it has a value.
// Everything here is safe to be public. Secret keys never go in this file.
window.BREAKMATH = {
  // ----- Accounts (Supabase) -----
  // Your Supabase project URL and "anon public" key. Steps are in SETUP.md.
  // While both are empty, there is no sign-in and breaks are saved in the
  // visitor's own browser. Once set, anyone can price a break without an
  // account, but saving asks them to sign up; breaks are saved to their
  // account, and the free limit is per account.
  supabaseUrl: 'https://datmtxesbhmrafcofmra.supabase.co',
  supabaseAnonKey: 'sb_publishable_vSEuQhEjaOksWib51q3GpQ_mRUrfIN6',

  // ----- Payments (Stripe) -----
  // Stripe Payment Links for the Pro plan. Steps are in SETUP.md.
  // While both are empty, nothing is for sale and every feature is free.
  stripeMonthlyLink: '',
  stripeYearlyLink: '',

  // Stripe's customer portal link, where subscribers cancel or change plans.
  stripePortalLink: '',

  // ----- Optional extras -----
  // Where "get updates" emails are sent: a Google Apps Script web app URL
  // (ends in /exec). Steps are in backend/README.md.
  // While empty, the email form is hidden.
  waitlistEndpoint: '',

  // Your GoatCounter site code, if you want a second visitor counter besides
  // Vercel Analytics. While empty, it is not loaded.
  goatcounterCode: '',
};
