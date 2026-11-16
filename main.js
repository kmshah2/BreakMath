// BreakMath marketing site: live planner demo + waitlist form.
// Settings (waitlist endpoint, analytics code) live in config.js.

const WAITLIST_ENDPOINT = (window.BREAKMATH || {}).waitlistEndpoint || '';

/* ---------- Planner demo ---------- */

const WEIGHTS = { top: 3, mid: 2, low: 1 };
const TIER_LABEL = { top: 'Top', mid: 'Mid', low: 'Low' };
const NEXT_TIER = { top: 'mid', mid: 'low', low: 'top' };

const state = {
  box: 1200,
  ship: 60,
  fee: 12,
  target: 20,
  disc: 15,
  teams: [
    { name: 'Kansas City', tier: 'top' },
    { name: 'Philadelphia', tier: 'top' },
    { name: 'Dallas', tier: 'mid' },
    { name: 'Buffalo', tier: 'mid' },
    { name: 'Detroit', tier: 'mid' },
    { name: 'Chicago', tier: 'low' },
    { name: 'Denver', tier: 'low' },
    { name: 'Seattle', tier: 'low' },
  ],
};

const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function money(n) {
  const rounded = Math.round(n);
  return (rounded < 0 ? '-$' : '$') + Math.abs(rounded).toLocaleString('en-US');
}

function toNumber(value) {
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// The pricing math from the product spec: work out what the spots must bring
// in after fees to hit the profit goal, then split it by tier weight.
function calculate(s) {
  const cost = s.box + s.ship;
  const fee = Math.min(s.fee, 90) / 100;
  const needed = (cost * (1 + s.target / 100)) / (1 - fee);
  const totalWeight = s.teams.reduce((sum, t) => sum + WEIGHTS[t.tier], 0) || 1;
  const prices = s.teams.map((t) => Math.round((needed * WEIGHTS[t.tier]) / totalWeight));
  const list = prices.reduce((sum, p) => sum + p, 0);
  const profit = list * (1 - fee) - cost;
  const breakEven = cost / (1 - fee);
  const safeDiscount = list > 0 ? Math.max(0, (1 - breakEven / list) * 100) : 0;
  const discProfit = list * (1 - s.disc / 100) * (1 - fee) - cost;
  return { prices, list, profit, safeDiscount, discProfit };
}

// Count a number up or down to its new value so a change is easy to follow.
function setMoney(el, value) {
  const from = el._value ?? value;
  el._value = value;
  cancelAnimationFrame(el._frame);
  if (reduceMotion || from === value) {
    el.textContent = money(value);
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / 320, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = money(from + (value - from) * eased);
    if (t < 1) el._frame = requestAnimationFrame(step);
  };
  el._frame = requestAnimationFrame(step);
}

function setSign(el, value) {
  el.classList.toggle('up', value >= 0);
  el.classList.toggle('down', value < 0);
}

function buildSpots() {
  const list = $('spots');
  state.teams.forEach((team, i) => {
    const row = document.createElement('li');
    row.className = 'spot';

    const name = document.createElement('span');
    name.className = 'spot-name';
    name.textContent = team.name;

    const tier = document.createElement('button');
    tier.type = 'button';
    tier.className = 'tier';
    tier.addEventListener('click', () => {
      team.tier = NEXT_TIER[team.tier];
      render();
    });

    const price = document.createElement('span');
    price.className = 'spot-price';

    row.append(name, tier, price);
    list.append(row);
    team.el = { tier, price };
  });
}

function render() {
  const r = calculate(state);

  state.teams.forEach((team, i) => {
    team.el.tier.dataset.tier = team.tier;
    team.el.tier.textContent = TIER_LABEL[team.tier];
    team.el.tier.setAttribute(
      'aria-label',
      `${team.name} is ${TIER_LABEL[team.tier]} tier. Change tier.`
    );
    setMoney(team.el.price, r.prices[i]);
  });

  setMoney($('out-list'), r.list);
  setMoney($('out-profit'), r.profit);
  setSign($('out-profit'), r.profit);

  $('out-disc').textContent = `${state.disc}%`;
  setMoney($('out-disc-profit'), r.discProfit);
  setSign($('out-disc-profit'), r.discProfit);

  $('out-safe').textContent =
    r.profit <= 0
      ? 'At these numbers the break loses money even at list price.'
      : `This break stays profitable up to ${Math.floor(r.safeDiscount)}% below list.`;
}

function bindInput(id, key) {
  $(id).addEventListener('input', (e) => {
    state[key] = toNumber(e.target.value);
    render();
  });
}

if ($('spots')) {
  buildSpots();
  bindInput('in-box', 'box');
  bindInput('in-ship', 'ship');
  bindInput('in-fee', 'fee');
  bindInput('in-target', 'target');
  bindInput('in-disc', 'disc');
  render();
}

/* ---------- Things that depend on config.js ---------- */

// The email form only appears once there is somewhere to send the emails.
document.querySelectorAll('[data-updates]').forEach((el) => {
  el.hidden = !WAITLIST_ENDPOINT;
});

// Pricing copy and the Get Pro button switch on once Stripe links are set.
const SELLING = Boolean((window.BREAKMATH || {}).stripeMonthlyLink || (window.BREAKMATH || {}).stripeYearlyLink);
document.querySelectorAll('[data-when]').forEach((el) => {
  el.hidden = (el.dataset.when === 'selling') !== SELLING;
});
// With accounts on, the 3-break limit applies before Pro is on sale too.
const ACCOUNTS = Boolean((window.BREAKMATH || {}).supabaseUrl && (window.BREAKMATH || {}).supabaseAnonKey);
if (ACCOUNTS && !SELLING) {
  document.querySelectorAll('[data-when="not-selling"]').forEach((el) => {
    el.textContent = "Pro isn't on sale yet. Until it is, profit history and the tax export are free.";
  });
}

/* ---------- Email updates ---------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function saveEmail(email) {
  if (!WAITLIST_ENDPOINT) {
    console.warn('BreakMath: waitlistEndpoint is not set in config.js, so this signup was not sent anywhere.');
    try {
      const saved = JSON.parse(localStorage.getItem('breakmath-waitlist') || '[]');
      localStorage.setItem('breakmath-waitlist', JSON.stringify([...saved, email]));
    } catch (err) {
      // Storage can be blocked in private windows; nothing else to do here.
    }
    return;
  }
  // Sent as plain text so the browser makes one simple request, which is what
  // a Google Apps Script web app accepts from another site.
  const response = await fetch(WAITLIST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ email, source: signupSource() }),
  });
  if (!response.ok) throw new Error(`Waitlist request failed: ${response.status}`);
  const result = await response.json();
  if (!result.ok) throw new Error(`Waitlist request rejected: ${result.error}`);
}

// Where this visitor came from: the ad's utm_source, else the referring site.
function signupSource() {
  const tagged = new URLSearchParams(location.search).get('utm_source');
  if (tagged) return tagged;
  try {
    return document.referrer ? new URL(document.referrer).hostname : 'direct';
  } catch (err) {
    return 'direct';
  }
}

function markJoined() {
  // Count the signup in analytics (no email or other personal data is sent).
  if (window.goatcounter && window.goatcounter.count) {
    window.goatcounter.count({ path: 'waitlist-joined', title: 'Joined the waitlist', event: true });
  }
  document.querySelectorAll('[data-waitlist]').forEach((form) => {
    form.classList.add('is-done');
    form.querySelector('.waitlist-msg').textContent =
      "You're on the list. We'll email you when new features ship.";
  });
}

document.querySelectorAll('[data-waitlist]').forEach((form) => {
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button');
  const message = form.querySelector('.waitlist-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!EMAIL_PATTERN.test(email)) {
      message.textContent = 'Enter a valid email address.';
      input.focus();
      return;
    }
    message.textContent = '';
    button.disabled = true;
    button.textContent = 'Signing up…';
    try {
      await saveEmail(email);
      markJoined();
    } catch (err) {
      message.textContent = "Couldn't sign you up. Check your connection and try again.";
      button.disabled = false;
      button.textContent = 'Get updates';
    }
  });
});
