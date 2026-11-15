// BreakMath site settings. Everything you need to fill in is in this file.
// Empty values are fine: each feature simply stays off until it has a value.
window.BREAKMATH = {
  // ----- Payments (Stripe) -----
  // Stripe Payment Links for the Pro plan. Steps are in LAUNCH.md.
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

  // Your GoatCounter site code, for visitor counts. If your dashboard is
  // https://breakmath.goatcounter.com, the code is 'breakmath'.
  // While empty, no analytics are loaded.
  goatcounterCode: '',
};
