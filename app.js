// BreakMath app: break planner, saved breaks, results and profit history.
// Everything is stored in this browser (localStorage); there is no server.

(() => {
  'use strict';

  const CFG = window.BREAKMATH || {};
  const STORE_KEY = 'breakmath:v1';
  const FREE_BREAKS_PER_MONTH = 3;
  const TIERS = ['top', 'mid', 'low'];
  const TIER_LABEL = { top: 'Top', mid: 'Mid', low: 'Low' };
  const NEXT_TIER = { top: 'mid', mid: 'low', low: 'top' };

  // Pro is only sold once a Stripe payment link is set in config.js. Until
  // then nobody could pay, so nothing is locked.
  const SELLING = Boolean(CFG.stripeMonthlyLink || CFG.stripeYearlyLink);

  // Accounts are on once a Supabase project is set in config.js. Then people
  // sign in before using the app, breaks are saved to their account instead of
  // this browser, and the free limit is enforced per account on the server.
  const AUTH = Boolean(CFG.supabaseUrl && CFG.supabaseAnonKey);

  const PRESETS = {
    'Football · 32 teams': ['Arizona', 'Atlanta', 'Baltimore', 'Buffalo', 'Carolina', 'Chicago', 'Cincinnati', 'Cleveland', 'Dallas', 'Denver', 'Detroit', 'Green Bay', 'Houston', 'Indianapolis', 'Jacksonville', 'Kansas City', 'Las Vegas', 'LA Chargers', 'LA Rams', 'Miami', 'Minnesota', 'New England', 'New Orleans', 'NY Giants', 'NY Jets', 'Philadelphia', 'Pittsburgh', 'San Francisco', 'Seattle', 'Tampa Bay', 'Tennessee', 'Washington'],
    'Basketball · 30 teams': ['Atlanta', 'Boston', 'Brooklyn', 'Charlotte', 'Chicago', 'Cleveland', 'Dallas', 'Denver', 'Detroit', 'Golden State', 'Houston', 'Indiana', 'LA Clippers', 'LA Lakers', 'Memphis', 'Miami', 'Milwaukee', 'Minnesota', 'New Orleans', 'New York', 'Oklahoma City', 'Orlando', 'Philadelphia', 'Phoenix', 'Portland', 'Sacramento', 'San Antonio', 'Toronto', 'Utah', 'Washington'],
    'Baseball · 30 teams': ['Arizona', 'Athletics', 'Atlanta', 'Baltimore', 'Boston', 'Chi Cubs', 'Chi White Sox', 'Cincinnati', 'Cleveland', 'Colorado', 'Detroit', 'Houston', 'Kansas City', 'LA Angels', 'LA Dodgers', 'Miami', 'Milwaukee', 'Minnesota', 'NY Mets', 'NY Yankees', 'Philadelphia', 'Pittsburgh', 'San Diego', 'San Francisco', 'Seattle', 'St. Louis', 'Tampa Bay', 'Texas', 'Toronto', 'Washington'],
    'Hockey · 32 teams': ['Anaheim', 'Boston', 'Buffalo', 'Calgary', 'Carolina', 'Chicago', 'Colorado', 'Columbus', 'Dallas', 'Detroit', 'Edmonton', 'Florida', 'Los Angeles', 'Minnesota', 'Montreal', 'Nashville', 'New Jersey', 'NY Islanders', 'NY Rangers', 'Ottawa', 'Philadelphia', 'Pittsburgh', 'San Jose', 'Seattle', 'St. Louis', 'Tampa Bay', 'Toronto', 'Utah', 'Vancouver', 'Vegas', 'Washington', 'Winnipeg'],
    'Blank · 10 spots': Array.from({ length: 10 }, (_, i) => `Spot ${i + 1}`),
  };

  /* ---------- Helpers ---------- */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v) => {
    const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  const money = (n) => {
    const r = Math.round(n);
    return (r < 0 ? '-$' : '$') + Math.abs(r).toLocaleString('en-US');
  };
  const pct = (n) => `${(Math.round(n * 10) / 10).toFixed(1)}%`;
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const niceDate = (iso) => {
    const [y, m, d] = String(iso).split('-').map(Number);
    if (!y || !m || !d) return iso || '';
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const niceMonth = (ym) => {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  const signClass = (n) => (n < 0 ? 'down' : 'up');

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-on');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('is-on'), 3200);
  }

  /* ---------- Storage ---------- */

  function spotsFrom(names) {
    return names.map((name) => ({ name, tier: 'mid' }));
  }

  function newDraft() {
    return {
      id: null,
      product: '',
      date: today(),
      box: '',
      ship: '',
      fee: '',
      feeFixed: '',
      fill: '100',
      priceForFill: false,
      target: '20',
      rounding: 1,
      weights: { top: 3, mid: 2, low: 1 },
      spots: spotsFrom(PRESETS['Football · 32 teams']),
    };
  }

  function blankStore() {
    return { v: 1, breaks: [], templates: [], pro: false, draft: newDraft() };
  }

  function loadStore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (saved && typeof saved === 'object') return { ...blankStore(), ...saved };
    } catch (err) {
      // Unreadable or blocked storage: start fresh rather than fail to open.
    }
    return blankStore();
  }

  function saveStore() {
    try {
      // With accounts on, only the unsaved draft stays in the browser; breaks
      // and templates live in the account so a shared computer never mixes them.
      localStorage.setItem(STORE_KEY, JSON.stringify(AUTH ? { v: 1, draft: store.draft } : store));
      if (AUTH) scheduleSync();
      return true;
    } catch (err) {
      toast("Couldn't save. This browser is blocking storage or it is full.");
      return false;
    }
  }

  let store = loadStore();
  let account = null; // { id, email, pro } once signed in
  const isPro = () => (AUTH ? Boolean(account && account.pro) : store.pro) || !SELLING;

  /* ---------- Accounts and cloud saves ---------- */

  let db = null;
  const synced = { breaks: new Map(), templates: new Map() };
  let syncTimer = null;

  async function connect() {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
    db = createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  }

  async function loadAccount(user) {
    const [profile, breaks, templates] = await Promise.all([
      db.from('profiles').select('pro').eq('id', user.id).maybeSingle(),
      db.from('breaks').select('id, data').order('created_at', { ascending: false }),
      db.from('templates').select('id, data').order('created_at', { ascending: false }),
    ]);
    if (breaks.error || templates.error) throw breaks.error || templates.error;
    account = { id: user.id, email: user.email, pro: Boolean(profile.data && profile.data.pro) };
    store.breaks = breaks.data.map((row) => ({ ...row.data, id: row.id }));
    store.templates = templates.data.map((row) => ({ ...row.data, id: row.id }));
    synced.breaks = new Map(store.breaks.map((b) => [b.id, JSON.stringify(b)]));
    synced.templates = new Map(store.templates.map((t) => [t.id, JSON.stringify(t)]));
  }

  function scheduleSync() {
    if (!account) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncNow, 500);
  }

  // Send whatever changed since the last sync: new and edited rows are
  // upserted, rows that are gone locally are deleted.
  async function syncNow() {
    if (!account || !db) return;
    for (const table of ['breaks', 'templates']) {
      const local = new Map(store[table].map((item) => [item.id, item]));
      for (const [id, item] of local) {
        const json = JSON.stringify(item);
        if (synced[table].get(id) === json) continue;
        const isNew = !synced[table].has(id);
        const { error } = await db.from(table).upsert({ id, user_id: account.id, data: item });
        if (!error) {
          synced[table].set(id, json);
        } else if (isNew && error.code === '42501') {
          // The server refused the row: this account is over its free limit.
          store[table] = store[table].filter((x) => x.id !== id);
          if (table === 'breaks') {
            upgradePrompt(`The free plan saves ${FREE_BREAKS_PER_MONTH} breaks a month. Pro saves as many as you run.`);
          } else {
            upgradePrompt('Saving your own team templates is part of Pro.');
          }
        } else {
          toast("Couldn't save to your account. Check your connection; your changes are still on screen.");
        }
      }
      for (const id of [...synced[table].keys()]) {
        if (local.has(id)) continue;
        const { error } = await db.from(table).delete().eq('id', id);
        if (!error) synced[table].delete(id);
      }
    }
  }

  async function refreshPlan() {
    if (!account) return;
    const { data } = await db.from('profiles').select('pro').eq('id', account.id).maybeSingle();
    account.pro = Boolean(data && data.pro);
    setPill();
  }

  function setPill() {
    $('#plan-pill').textContent = !SELLING ? 'Early access' : isPro() ? 'Pro' : 'Free';
  }

  function signedOutView(mode = 'signup', message = '') {
    document.body.classList.add('signed-out');
    VIEWS.forEach((v) => {
      $(`#view-${v}`).hidden = true;
    });
    const titles = { signup: 'Create your free account', signin: 'Sign in to BreakMath', reset: 'Reset your password', newpass: 'Choose a new password' };
    const buttons = { signup: 'Create free account', signin: 'Sign in', reset: 'Email me a reset link', newpass: 'Save new password' };
    $('#view-auth').hidden = false;
    $('#view-auth').innerHTML = `
      <form class="auth panel" data-form="auth" data-mode="${mode}" novalidate>
        <h1>${titles[mode]}</h1>
        ${mode === 'signup' ? `<p class="muted">Price every spot in your break and track what each one really made. Free plan saves ${FREE_BREAKS_PER_MONTH} breaks a month. No card needed.</p>` : ''}
        ${mode === 'reset' ? '<p class="muted">Enter the email you signed up with and we will send a link to set a new password.</p>' : ''}
        ${mode !== 'newpass' ? `<label class="field"><span>Email</span>
          <span class="input"><input name="email" type="email" inputmode="email" autocomplete="email" required></span></label>` : ''}
        ${mode !== 'reset' ? `<label class="field"><span>${mode === 'newpass' ? 'New password' : 'Password'}</span>
          <span class="input"><input name="password" type="password" minlength="8" autocomplete="${mode === 'signin' ? 'current-password' : 'new-password'}" required></span></label>` : ''}
        ${mode === 'signup' || mode === 'newpass' ? '<p class="muted small">At least 8 characters.</p>' : ''}
        <p class="auth-msg" role="status">${esc(message)}</p>
        <button class="btn" type="submit">${buttons[mode]}</button>
        <div class="auth-links">
          ${mode === 'signup' ? '<button type="button" data-action="auth-mode" data-mode="signin">I already have an account</button>' : ''}
          ${mode === 'signin' ? '<button type="button" data-action="auth-mode" data-mode="signup">Create a free account</button><button type="button" data-action="auth-mode" data-mode="reset">Forgot password?</button>' : ''}
          ${mode === 'reset' ? '<button type="button" data-action="auth-mode" data-mode="signin">Back to sign in</button>' : ''}
        </div>
        ${mode === 'signup' ? '<p class="muted small">By creating an account you agree to the <a href="terms.html">Terms</a> and <a href="privacy.html">Privacy Policy</a>.</p>' : ''}
      </form>`;
  }

  async function submitAuth(form) {
    const mode = form.dataset.mode;
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    const say = (text) => {
      $('.auth-msg', form).textContent = text;
    };
    if (mode !== 'newpass' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return say('Enter a valid email address.');
    if (mode !== 'reset' && password.length < 8) return say('Use a password with at least 8 characters.');
    const button = $('button[type="submit"]', form);
    button.disabled = true;
    say('');
    let result;
    if (mode === 'signup') result = await db.auth.signUp({ email, password });
    else if (mode === 'signin') result = await db.auth.signInWithPassword({ email, password });
    else if (mode === 'reset') result = await db.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    else result = await db.auth.updateUser({ password });
    button.disabled = false;
    if (result.error) return say(result.error.message);
    if (mode === 'reset') return say('Check your email for the reset link.');
    if (mode === 'signup' && !result.data.session) return say('Check your email to confirm your account, then sign in.');
    if (mode === 'newpass') toast('Password changed.');
    // Signing in fires onAuthStateChange, which opens the app.
  }

  async function openApp(user) {
    try {
      await loadAccount(user);
    } catch (err) {
      signedOutView('signin', "Couldn't load your account. Check your connection and try again.");
      return;
    }
    document.body.classList.remove('signed-out');
    $('#view-auth').hidden = true;
    setPill();
    show(location.hash.slice(1) || 'planner');
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: 'signed-in', title: 'Signed in', event: true });
    }
  }


  /* ---------- The pricing math ---------- */

  // Work out what the spots must bring in after fees to hit the profit goal,
  // split it across spots by tier weight, then round each price.
  //
  // Fees have two parts: a percent of every sale, and a fixed amount charged
  // on each spot sold (payment processors add one per order). "Fill" is the
  // share of the break you expect to sell; unsold spots are assumed to be
  // spread evenly by value.
  function calc(b) {
    const cost = num(b.box) + num(b.ship);
    const fee = Math.min(Math.max(num(b.fee), 0), 90) / 100;
    const fixed = Math.max(num(b.feeFixed), 0);
    const target = num(b.target) / 100;
    const fill = Math.min(Math.max(b.fill === '' || b.fill == null ? 100 : num(b.fill), 1), 100) / 100;
    const step = Number(b.rounding) === 5 ? 5 : 1;
    const weights = b.weights || { top: 3, mid: 2, low: 1 };
    const weightOf = (spot) => Math.max(num(weights[spot.tier]), 0);
    const n = b.spots.length;
    const pricedFill = b.priceForFill ? fill : 1;
    const needed = (cost * (1 + target) + n * pricedFill * fixed) / ((1 - fee) * pricedFill);
    const totalWeight = b.spots.reduce((sum, s) => sum + weightOf(s), 0);
    const prices = b.spots.map((s) => (totalWeight > 0 ? Math.round((needed * weightOf(s)) / totalWeight / step) * step : 0));
    const list = prices.reduce((sum, p) => sum + p, 0);
    const profitAtFill = (share) => list * share * (1 - fee) - n * share * fixed - cost;
    const profit = profitAtFill(1);
    const breakEven = (cost + n * fixed) / (1 - fee);
    const perFullBreak = list * (1 - fee) - n * fixed;
    return {
      cost,
      fee,
      fixed,
      target,
      fill,
      needed,
      prices,
      list,
      profit,
      breakEven,
      profitAtFill,
      fillProfit: profitAtFill(fill),
      // Share of the break that has to sell before it stops losing money.
      breakEvenFill: perFullBreak > 0 ? cost / perFullBreak : Infinity,
      returnPct: cost > 0 ? (profit / cost) * 100 : 0,
      safeDiscount: list > 0 ? Math.max(0, (1 - breakEven / list) * 100) : 0,
      profitAt: (discountPct) => list * (1 - discountPct / 100) * (1 - fee) - n * fixed - cost,
    };
  }

  // What a finished break actually made.
  function actual(b) {
    if (b.status !== 'done' || !b.results) return null;
    const sales = num(b.results.soldTotal);
    const fees = num(b.results.fees);
    const cost = num(b.box) + num(b.ship);
    const profit = sales - fees - cost;
    return { sales, fees, cost, profit, returnPct: cost > 0 ? (profit / cost) * 100 : 0 };
  }

  /* ---------- Views ---------- */

  const VIEWS = ['planner', 'breaks', 'history', 'account'];
  let discount = 15;
  let openBreakId = null;
  let liveBreakId = null;

  function show(view) {
    if (AUTH && !account) return; // nothing to show until someone is signed in
    if (!VIEWS.includes(view)) view = 'planner';
    VIEWS.forEach((v) => {
      $(`#view-${v}`).hidden = v !== view;
    });
    $$('[data-view]').forEach((tab) => {
      if (tab.dataset.view === view) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    if (location.hash !== `#${view}`) history.replaceState(null, '', `#${view}`);
    ({ planner: renderPlanner, breaks: renderBreaks, history: renderHistory, account: renderAccount })[view]();
    window.scrollTo(0, 0);
  }

  /* ----- Planner ----- */

  function templateOptions() {
    const own = store.templates.map((t) => `<option value="own:${esc(t.id)}">${esc(t.name)}</option>`).join('');
    const built = Object.keys(PRESETS).map((name) => `<option value="preset:${esc(name)}">${esc(name)}</option>`).join('');
    return `<option value="">Load a team list…</option>${own ? `<optgroup label="Your templates">${own}</optgroup>` : ''}<optgroup label="Built in">${built}</optgroup>`;
  }

  function renderPlanner() {
    const d = store.draft;
    $('#view-planner').innerHTML = `
      <div class="page-head">
        <div>
          <h1>${d.id ? 'Edit break' : 'Price a break'}</h1>
          <p>Enter what the break costs you, rate each team, and get a price for every spot.</p>
        </div>
        <button class="btn-ghost" type="button" data-action="new-break">Start over</button>
      </div>

      <div class="planner-grid">
        <section class="panel" aria-labelledby="numbers-h">
          <h2 id="numbers-h">Your numbers</h2>
          <label class="field"><span>Product</span>
            <span class="input"><input data-field="product" type="text" value="${esc(d.product)}" placeholder="2026 Football Hobby Case" autocomplete="off"></span></label>
          <div class="fields">
            <label class="field"><span>Box or case cost</span>
              <span class="input"><i>$</i><input data-field="box" type="text" inputmode="decimal" value="${esc(d.box)}" placeholder="1200"></span></label>
            <label class="field"><span>Shipping and supplies</span>
              <span class="input"><i>$</i><input data-field="ship" type="text" inputmode="decimal" value="${esc(d.ship)}" placeholder="60"></span></label>
            <label class="field"><span>Fees, percent of each sale</span>
              <span class="input"><input data-field="fee" type="text" inputmode="decimal" value="${esc(d.fee)}" placeholder="10.9"><i>%</i></span></label>
            <label class="field"><span>Fee per spot sold</span>
              <span class="input"><i>$</i><input data-field="feeFixed" type="text" inputmode="decimal" value="${esc(d.feeFixed)}" placeholder="0.30"></span></label>
            <label class="field"><span>Profit goal</span>
              <span class="input"><input data-field="target" type="text" inputmode="decimal" value="${esc(d.target)}" placeholder="20"><i>%</i></span></label>
            <label class="field"><span>Spots you expect to sell</span>
              <span class="input"><input data-field="fill" type="text" inputmode="decimal" value="${esc(d.fill)}" placeholder="100"><i>%</i></span></label>
            <label class="field"><span>Break date</span>
              <span class="input"><input data-field="date" type="date" value="${esc(d.date)}"></span></label>
            <label class="field"><span>Round prices to</span>
              <span class="input"><select data-field="rounding">
                <option value="1"${Number(d.rounding) === 1 ? ' selected' : ''}>Nearest $1</option>
                <option value="5"${Number(d.rounding) === 5 ? ' selected' : ''}>Nearest $5</option>
              </select></span></label>
          </div>
          <label class="check"><input type="checkbox" data-check="priceForFill"${d.priceForFill ? ' checked' : ''}>
            <span>Set prices so I hit my goal even if only that share sells</span></label>
          <button class="btn-ghost" type="button" data-action="whatnot-fees">Fill in commonly reported Whatnot fees</button>
          <details class="weights">
            <summary>Tier weights</summary>
            <p>How much more a Top or Mid spot costs than a Low spot. 3 / 2 / 1 means a Top spot costs three times a Low spot.</p>
            <div class="fields three">
              ${TIERS.map((t) => `<label class="field"><span>${TIER_LABEL[t]}</span>
                <span class="input"><input data-weight="${t}" type="text" inputmode="decimal" value="${esc(d.weights[t])}"></span></label>`).join('')}
            </div>
          </details>
          <p class="note">Add your platform's commission and payment processing percent together (for example 8 + 2.9 = 10.9). The per-spot fee is the fixed amount charged on each order. Processing is usually also charged on the shipping and tax your buyer pays, so real fees run slightly higher. Check your own payout statement.</p>
        </section>

        <section class="panel" aria-labelledby="spots-h">
          <div class="panel-head">
            <h2 id="spots-h">Spot prices</h2>
            <span class="muted" id="tier-counts"></span>
          </div>
          <div class="spot-tools">
            <span class="input"><select data-action="load-template" aria-label="Load a team list">${templateOptions()}</select></span>
            <button class="btn-ghost" type="button" data-action="save-template">Save as template</button>
          </div>
          <p class="muted small">Tap a tier to change it. Rename or remove any spot.</p>
          <ul class="spot-list" id="spot-list">
            ${d.spots.map((s, i) => `
              <li class="spot-row">
                <input class="spot-name" data-spot-name="${i}" type="text" value="${esc(s.name)}" aria-label="Spot name">
                <button class="tier" type="button" data-action="cycle-tier" data-index="${i}" data-tier="${s.tier}">${TIER_LABEL[s.tier]}</button>
                <span class="spot-price" data-price="${i}">$0</span>
                <button class="icon-btn" type="button" data-action="remove-spot" data-index="${i}" aria-label="Remove ${esc(s.name)}">×</button>
              </li>`).join('')}
          </ul>
          <button class="btn-ghost" type="button" data-action="add-spot">Add a spot</button>
        </section>
      </div>

      <section class="summary foil" aria-label="Break totals">
        <dl class="stats">
          <div><dt>List all spots for</dt><dd id="s-list">$0</dd></div>
          <div><dt>Profit if every spot sells</dt><dd id="s-profit">$0</dd></div>
          <div><dt id="s-fill-label">Profit at your fill rate</dt><dd id="s-fill">$0</dd></div>
          <div><dt>Break-even sales</dt><dd id="s-even">$0</dd></div>
        </dl>
        <p class="muted small" id="s-gap"></p>
        <div class="fill-table">
          <h3>Profit by how full the break gets</h3>
          <div class="fill-cells" id="fill-cells"></div>
          <p class="muted small" id="s-fill-note"></p>
        </div>
        <div class="whatif">
          <label for="disc">If spots sell <strong id="s-disc">15%</strong> below list, you make <strong id="s-disc-profit">$0</strong></label>
          <input id="disc" type="range" min="0" max="50" step="1" value="${discount}">
          <p id="s-safe"></p>
        </div>
        <div class="actions">
          <button class="btn" type="button" data-action="save-break">${d.id ? 'Save changes' : 'Save break plan'}</button>
          <button class="btn-ghost" type="button" data-action="copy-spots">Copy spot list</button>
        </div>
        <p class="muted small">Estimates from your own numbers, not advice or a guarantee of profit. <a href="disclaimer.html">Disclaimer</a></p>
      </section>`;
    updatePlanner();
  }

  // Refresh the numbers without rebuilding the form, so typing keeps focus.
  function updatePlanner() {
    const d = store.draft;
    const r = calc(d);
    r.prices.forEach((p, i) => {
      const el = $(`[data-price="${i}"]`);
      if (el) el.textContent = money(p);
    });
    const count = (t) => d.spots.filter((s) => s.tier === t).length;
    $('#tier-counts').textContent = `${count('top')} Top, ${count('mid')} Mid, ${count('low')} Low`;
    $('#s-list').textContent = money(r.list);
    $('#s-profit').textContent = money(r.profit);
    $('#s-profit').className = signClass(r.profit);
    $('#s-fill-label').textContent = `Profit at ${Math.round(r.fill * 100)}% sold`;
    $('#s-fill').textContent = money(r.fillProfit);
    $('#s-fill').className = signClass(r.fillProfit);
    $('#s-even').textContent = money(r.breakEven);
    $('#fill-cells').innerHTML = [50, 60, 70, 80, 90, 100].map((f) => {
      const p = r.profitAtFill(f / 100);
      return `<div><span>${f}%</span><strong class="${signClass(p)}">${money(p)}</strong></div>`;
    }).join('');
    $('#s-fill-note').textContent = r.cost <= 0
      ? ''
      : Number.isFinite(r.breakEvenFill) && r.breakEvenFill <= 1
        ? `You need about ${Math.ceil(r.breakEvenFill * d.spots.length)} of ${d.spots.length} spots sold at list to break even (${pct(r.returnPct)} return on cost if they all sell). Assumes unsold spots are spread evenly by value.`
        : 'At these prices the break loses money even if every spot sells.';
    const gap = r.list - r.needed;
    $('#s-gap').textContent = r.cost > 0 && Math.abs(gap) >= 0.5
      ? `Rounding puts the list ${money(Math.abs(gap))} ${gap < 0 ? 'below' : 'above'} the exact ${money(r.needed)} your goal needs.`
      : '';
    const discProfit = r.profitAt(discount);
    $('#s-disc').textContent = `${discount}%`;
    $('#s-disc-profit').textContent = money(discProfit);
    $('#s-disc-profit').className = signClass(discProfit);
    $('#s-safe').textContent = r.cost <= 0
      ? 'Enter your costs to see how much room you have.'
      : r.profit <= 0
        ? 'At these numbers the break loses money even at list price.'
        : `This break stays profitable up to ${Math.floor(r.safeDiscount)}% below list.`;
  }

  function breaksThisMonth() {
    const month = today().slice(0, 7);
    return store.breaks.filter((b) => String(b.createdAt || '').slice(0, 7) === month).length;
  }

  function saveBreak() {
    const d = store.draft;
    if (!d.product.trim()) {
      toast('Give the break a product name first.');
      $('[data-field="product"]').focus();
      return;
    }
    if (num(d.box) <= 0) {
      toast('Enter what the box or case cost you.');
      $('[data-field="box"]').focus();
      return;
    }
    if (!d.spots.length) {
      toast('Add at least one spot.');
      return;
    }
    if (d.id) {
      const i = store.breaks.findIndex((b) => b.id === d.id);
      if (i >= 0) store.breaks[i] = { ...store.breaks[i], ...structuredClone(d) };
    } else {
      if (!isPro() && breaksThisMonth() >= FREE_BREAKS_PER_MONTH) {
        upgradePrompt(`The free plan saves ${FREE_BREAKS_PER_MONTH} breaks a month. Pro saves as many as you run.`);
        return;
      }
      store.breaks.unshift({ ...structuredClone(d), id: uid(), status: 'planned', createdAt: today() });
    }
    store.draft = newDraft();
    if (saveStore()) {
      toast('Break saved.');
      show('breaks');
    }
  }

  async function copySpots() {
    const d = store.draft;
    const r = calc(d);
    const text = d.spots.map((s, i) => `${s.name}: ${money(r.prices[i])}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast('Spot list copied.');
    } catch (err) {
      toast("Couldn't copy. Your browser blocked the clipboard.");
    }
  }

  /* ----- Saved breaks ----- */

  function renderBreaks() {
    const el = $('#view-breaks');
    if (!store.breaks.length) {
      el.innerHTML = `
        <div class="page-head"><div><h1>Your breaks</h1></div></div>
        <div class="empty">
          <h2>No saved breaks yet</h2>
          <p>Price a break in the planner and save it. After the stream, come back here to record what it made.</p>
          <button class="btn" type="button" data-view="planner">Price a break</button>
        </div>`;
      return;
    }
    const left = FREE_BREAKS_PER_MONTH - breaksThisMonth();
    el.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Your breaks</h1>
          ${isPro() ? '' : `<p>${left > 0 ? `${left} of ${FREE_BREAKS_PER_MONTH} free saves left this month.` : 'You have used this month\'s free saves.'} <a href="#account" data-view="account">See Pro</a></p>`}
        </div>
        <button class="btn" type="button" data-action="new-break">New break</button>
      </div>
      <ul class="break-list">${store.breaks.map(breakCard).join('')}</ul>`;
  }

  function breakCard(b) {
    const plan = calc(b);
    const real = actual(b);
    const open = openBreakId === b.id;
    return `
      <li class="break ${open ? 'is-open' : ''}">
        <button class="break-top" type="button" data-action="toggle-break" data-id="${esc(b.id)}" aria-expanded="${open}">
          <span class="break-title">
            <strong>${esc(b.product)}</strong>
            <span class="muted small">${esc(niceDate(b.date))}, ${b.spots.length} spots</span>
          </span>
          <span class="break-figure">
            <span class="badge ${b.status}">${b.status === 'done' ? 'Done' : 'Planned'}</span>
            <strong class="${signClass(real ? real.profit : plan.profit)}">${money(real ? real.profit : plan.profit)}</strong>
            <span class="muted small">${real ? 'actual profit' : 'planned profit'}</span>
          </span>
        </button>
        ${open ? breakDetail(b, plan, real) : ''}
      </li>`;
  }

  function soldSum(b, plan) {
    return b.spots.reduce((sum, sp, i) => sum + num(sp.sold ?? plan.prices[i]), 0);
  }

  // Fees a platform would take on these sales, from the break's own fee settings.
  function estimateFees(sales, soldCount, plan) {
    return Math.round((sales * plan.fee + soldCount * plan.fixed) * 100) / 100;
  }

  function breakDetail(b, plan, real) {
    if (liveBreakId === b.id) return liveDetail(b, plan);
    const res = b.results || {};
    const mode = res.mode || 'total';
    const soldTotal = mode === 'spots' ? soldSum(b, plan) : (res.soldTotal ?? plan.list);
    const soldCount = mode === 'spots'
      ? b.spots.filter((sp, i) => num(sp.sold ?? plan.prices[i]) > 0).length
      : Math.round(b.spots.length * Math.min(1, plan.list > 0 ? num(soldTotal) / plan.list : 1));
    const fees = res.fees ?? estimateFees(num(soldTotal), soldCount, plan);
    return `
      <div class="break-detail">
        <dl class="stats compact">
          <div><dt>Cost</dt><dd>${money(plan.cost)}</dd></div>
          <div><dt>List total</dt><dd>${money(plan.list)}</dd></div>
          <div><dt>Planned profit</dt><dd class="${signClass(plan.profit)}">${money(plan.profit)}</dd></div>
          ${real ? `<div><dt>Actual profit</dt><dd class="${signClass(real.profit)}">${money(real.profit)}</dd></div>` : ''}
        </dl>
        ${b.status === 'done' ? '' : `
        <div class="go-live">
          <div>
            <h3>Running this break now?</h3>
            <p class="muted small">Tap each spot as it sells and watch your profit build. Results save themselves when you end the show.</p>
          </div>
          <button class="btn" type="button" data-action="go-live" data-id="${esc(b.id)}">Start live tracker</button>
        </div>`}
        <form class="results" data-form="results" data-id="${esc(b.id)}">
          <h3>${b.status === 'done' ? 'Results' : 'Or enter results afterward'}</h3>
          <div class="segmented" role="group" aria-label="How to enter sales">
            <button type="button" data-action="results-mode" data-id="${esc(b.id)}" data-mode="total" aria-pressed="${mode === 'total'}">One total</button>
            <button type="button" data-action="results-mode" data-id="${esc(b.id)}" data-mode="spots" aria-pressed="${mode === 'spots'}">Each spot</button>
          </div>
          ${mode === 'total'
            ? `<label class="field"><span>What all the spots sold for</span>
                <span class="input"><i>$</i><input name="soldTotal" type="text" inputmode="decimal" value="${esc(soldTotal)}"></span></label>`
            : `<ul class="sold-list">${b.spots.map((s, i) => `
                <li><span>${esc(s.name)}</span>
                  <span class="input"><i>$</i><input name="sold-${i}" type="text" inputmode="decimal" value="${esc(s.sold ?? plan.prices[i])}" aria-label="${esc(s.name)} sold for"></span></li>`).join('')}</ul>`}
          <details class="import">
            <summary>Import sales from a list or CSV</summary>
            <p class="muted small">Paste your sales, one per line (for example "Kansas City 340"), or paste or upload a CSV export. Each line is matched to a spot by its name. Spots with no match are set to $0, so check the result before saving.</p>
            <textarea name="import" rows="5" placeholder="Kansas City, 340&#10;Dallas, 215&#10;Seattle, 90" aria-label="Sales to import"></textarea>
            <div class="actions">
              <button class="btn-ghost" type="button" data-action="apply-import" data-id="${esc(b.id)}">Match to spots</button>
              <label class="btn-ghost file-btn">Upload CSV<input type="file" accept=".csv,text/csv,text/plain" data-action="import-file" data-id="${esc(b.id)}" hidden></label>
            </div>
          </details>
          <label class="field"><span>Fees taken from your payout</span>
            <span class="input"><i>$</i><input name="fees" type="text" inputmode="decimal" value="${esc(fees)}"></span></label>
          <div class="actions">
            <button class="btn" type="submit">${b.status === 'done' ? 'Update results' : 'Mark as done'}</button>
            <button class="btn-ghost" type="button" data-action="rerun-break" data-id="${esc(b.id)}">Run it again</button>
            <button class="btn-ghost" type="button" data-action="edit-break" data-id="${esc(b.id)}">Edit plan</button>
            <button class="btn-ghost danger" type="button" data-action="delete-break" data-id="${esc(b.id)}">Delete</button>
          </div>
        </form>
      </div>`;
  }

  /* ----- Live tracker ----- */

  function liveTotals(b, plan) {
    const sold = b.spots.filter((sp) => sp.isSold);
    const revenue = sold.reduce((sum, sp) => sum + num(sp.sold), 0);
    const fees = estimateFees(revenue, sold.length, plan);
    return { count: sold.length, revenue, fees, profit: revenue - fees - plan.cost, goal: plan.cost * plan.target };
  }

  function liveStatsHtml(b, plan) {
    const t = liveTotals(b, plan);
    const keep = 1 - plan.fee;
    const message = t.profit < 0
      ? `${money(Math.ceil(-t.profit / (keep || 1)))} more in sales to break even.`
      : t.profit < t.goal
        ? `Past break-even. ${money(Math.ceil((t.goal - t.profit) / (keep || 1)))} more in sales to hit your goal.`
        : 'Goal hit. Everything from here is extra.';
    return `
      <dl class="stats compact">
        <div><dt>Spots sold</dt><dd>${t.count} of ${b.spots.length}</dd></div>
        <div><dt>Sales so far</dt><dd>${money(t.revenue)}</dd></div>
        <div><dt>Fees so far</dt><dd>${money(t.fees)}</dd></div>
        <div><dt>Profit so far</dt><dd class="${signClass(t.profit)}">${money(t.profit)}</dd></div>
      </dl>
      <p class="live-message ${t.profit < 0 ? '' : 'up'}">${message}</p>`;
  }

  function liveDetail(b, plan) {
    return `
      <div class="break-detail">
        <div id="live-stats">${liveStatsHtml(b, plan)}</div>
        <ul class="live-list">${b.spots.map((sp, i) => `
          <li class="live-row ${sp.isSold ? 'is-sold' : ''}">
            <span class="live-name">${esc(sp.name)}</span>
            <span class="input"><i>$</i><input data-live-price="${i}" type="text" inputmode="decimal" value="${esc(sp.isSold ? sp.sold : plan.prices[i])}" aria-label="${esc(sp.name)} price"></span>
            <button class="sold-btn" type="button" data-action="toggle-sold" data-index="${i}" aria-pressed="${Boolean(sp.isSold)}">${sp.isSold ? 'Sold' : 'Mark sold'}</button>
          </li>`).join('')}</ul>
        <div class="actions">
          <button class="btn" type="button" data-action="end-show" data-id="${esc(b.id)}">End show and save results</button>
          <button class="btn-ghost" type="button" data-action="leave-live">Back</button>
        </div>
        <p class="muted small">Change a price before marking it sold if the spot went for more or less than list.</p>
      </div>`;
  }

  /* ----- Importing sales ----- */

  function csvCells(line) {
    const out = [];
    let cur = '';
    let quoted = false;
    for (const ch of line) {
      if (ch === '"') quoted = !quoted;
      else if ((ch === ',' || ch === '\t') && !quoted) {
        out.push(cur.trim());
        cur = '';
      } else cur += ch;
    }
    out.push(cur.trim());
    return out;
  }

  // Match pasted sales to spots by name. Understands plain lines
  // ("Kansas City 340") and CSV exports with a price-like column.
  function parseSales(text, spots) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return null;
    const head = csvCells(lines[0]).map((c) => c.toLowerCase());
    const wanted = ['sold price', 'sale price', 'price', 'subtotal', 'amount', 'total'];
    let priceCol = -1;
    if (head.length > 1 && !/\d/.test(head.join(''))) {
      for (const w of wanted) {
        priceCol = head.findIndex((h) => h.includes(w));
        if (priceCol >= 0) break;
      }
    }
    const rows = priceCol >= 0 ? lines.slice(1) : lines;
    const order = spots.map((sp, i) => ({ i, name: sp.name.trim().toLowerCase() }))
      .filter((x) => x.name)
      .sort((a, b) => b.name.length - a.name.length);
    const matched = new Map();
    let missed = 0;
    rows.forEach((line) => {
      const lower = line.toLowerCase();
      const hit = order.find((x) => !matched.has(x.i) && lower.includes(x.name));
      let amount;
      if (priceCol >= 0) amount = num(csvCells(line)[priceCol]);
      else {
        const rest = hit ? lower.replace(hit.name, ' ') : lower;
        const nums = rest.match(/\d[\d,]*(\.\d+)?/g);
        amount = nums ? num(nums[nums.length - 1]) : NaN;
      }
      if (hit && Number.isFinite(amount)) matched.set(hit.i, amount);
      else missed += 1;
    });
    return { matched, missed };
  }

  function applyImport(id, text) {
    const b = store.breaks.find((x) => x.id === id);
    if (!b) return;
    const result = parseSales(text, b.spots);
    if (!result || !result.matched.size) {
      toast("Couldn't match any line to a spot. Each line needs a spot name and a price.");
      return;
    }
    b.spots.forEach((sp, i) => {
      sp.sold = result.matched.has(i) ? result.matched.get(i) : 0;
      sp.isSold = result.matched.has(i);
    });
    b.results = { ...(b.results || {}), mode: 'spots' };
    delete b.results.fees;
    saveStore();
    renderBreaks();
    toast(`Matched ${result.matched.size} of ${b.spots.length} spots${result.missed ? `, ${result.missed} lines skipped` : ''}. Check, then save.`);
  }

  function saveResults(form) {
    const b = store.breaks.find((x) => x.id === form.dataset.id);
    if (!b) return;
    const data = new FormData(form);
    const mode = (b.results && b.results.mode) || 'total';
    let soldTotal;
    if (mode === 'spots') {
      b.spots.forEach((s, i) => {
        s.sold = num(data.get(`sold-${i}`));
        s.isSold = s.sold > 0;
      });
      soldTotal = b.spots.reduce((sum, s) => sum + s.sold, 0);
    } else {
      soldTotal = num(data.get('soldTotal'));
    }
    b.results = { mode, soldTotal, fees: num(data.get('fees')) };
    b.status = 'done';
    if (saveStore()) {
      toast('Results saved.');
      renderBreaks();
    }
  }

  /* ----- Profit history ----- */

  function doneBreaks() {
    return store.breaks.filter((b) => b.status === 'done' && b.results).map((b) => ({ b, a: actual(b) }));
  }

  function groupBy(rows, keyOf) {
    const map = new Map();
    rows.forEach((row) => {
      const key = keyOf(row);
      const g = map.get(key) || { key, breaks: 0, sales: 0, cost: 0, profit: 0 };
      g.breaks += 1;
      g.sales += row.a.sales;
      g.cost += row.a.cost;
      g.profit += row.a.profit;
      map.set(key, g);
    });
    return [...map.values()];
  }

  function renderHistory() {
    const el = $('#view-history');
    const rows = doneBreaks();
    if (!isPro()) {
      el.innerHTML = `
        <div class="page-head"><div><h1>Profit history</h1></div></div>
        <div class="empty">
          <h2>Profit history is part of Pro</h2>
          <p>See real profit by break, by product and by month, find the products that lose money, and export everything for tax time.</p>
          <button class="btn" type="button" data-view="account">See Pro</button>
        </div>`;
      return;
    }
    if (!rows.length) {
      el.innerHTML = `
        <div class="page-head"><div><h1>Profit history</h1></div></div>
        <div class="empty">
          <h2>Nothing to show yet</h2>
          <p>Once you mark a saved break as done and record what it sold for, its real profit shows up here.</p>
          <button class="btn" type="button" data-view="breaks">Go to your breaks</button>
        </div>`;
      return;
    }
    const total = rows.reduce((sum, r) => sum + r.a.profit, 0);
    const cost = rows.reduce((sum, r) => sum + r.a.cost, 0);
    const feesPaid = rows.reduce((sum, r) => sum + r.a.fees, 0);
    const sales = rows.reduce((sum, r) => sum + r.a.sales, 0);
    const listed = rows.reduce((sum, r) => sum + calc(r.b).list, 0);
    const goalHits = rows.filter((r) => r.a.profit >= r.a.cost * (num(r.b.target) / 100)).length;
    const months = groupBy(rows, (r) => String(r.b.date).slice(0, 7)).sort((a, b) => b.key.localeCompare(a.key));
    const products = groupBy(rows, (r) => r.b.product.trim()).sort((a, b) => b.profit - a.profit);
    const sorted = [...rows].sort((a, b) => b.a.profit - a.a.profit);
    const losers = products.filter((g) => g.profit < 0);
    const table = (head, groups, label) => `
      <div class="table-wrap"><table>
        <thead><tr><th scope="col">${head}</th><th scope="col">Breaks</th><th scope="col">Sales</th><th scope="col">Profit</th></tr></thead>
        <tbody>${groups.map((g) => `<tr><th scope="row">${esc(label(g.key))}</th><td>${g.breaks}</td><td>${money(g.sales)}</td><td class="${signClass(g.profit)}">${money(g.profit)}</td></tr>`).join('')}</tbody>
      </table></div>`;
    el.innerHTML = `
      <div class="page-head">
        <div><h1>Profit history</h1><p>Real results from the breaks you marked as done.</p></div>
        <button class="btn-ghost" type="button" data-action="export-csv">Export for taxes (CSV)</button>
      </div>
      <dl class="stats panel">
        <div><dt>Total profit</dt><dd class="${signClass(total)}">${money(total)}</dd></div>
        <div><dt>Breaks run</dt><dd>${rows.length}</dd></div>
        <div><dt>Average return on cost</dt><dd>${pct(cost > 0 ? (total / cost) * 100 : 0)}</dd></div>
        <div><dt>Best product</dt><dd class="text">${esc(products[0].key)}</dd></div>
      </dl>
      <dl class="stats panel">
        <div><dt>Hit your profit goal</dt><dd>${goalHits} of ${rows.length}</dd></div>
        <div><dt>Sales vs list price</dt><dd>${pct(listed > 0 ? (sales / listed) * 100 : 0)}</dd></div>
        <div><dt>Fees paid</dt><dd>${money(feesPaid)}</dd></div>
        <div><dt>Fees as share of sales</dt><dd>${pct(sales > 0 ? (feesPaid / sales) * 100 : 0)}</dd></div>
      </dl>
      ${losers.length ? `<section class="panel warn"><h2>Products losing money</h2>
        <p>${losers.map((g) => `<strong>${esc(g.key)}</strong> is down ${money(-g.profit)} over ${g.breaks} ${g.breaks === 1 ? 'break' : 'breaks'}.`).join(' ')} Raise the price, lower what you pay, or stop running ${losers.length === 1 ? 'it' : 'them'}.</p></section>` : ''}
      <section class="panel"><h2>By month</h2>${table('Month', months, niceMonth)}</section>
      <section class="panel"><h2>By product</h2>${table('Product', products, (k) => k)}</section>
      <section class="panel"><h2>Every break, best to worst</h2>
        <div class="table-wrap"><table>
          <thead><tr><th scope="col">Break</th><th scope="col">Planned</th><th scope="col">Actual</th></tr></thead>
          <tbody>${sorted.map(({ b, a }) => `<tr><th scope="row">${esc(b.product)}<span class="muted small block">${esc(niceDate(b.date))}</span></th><td>${money(calc(b).profit)}</td><td class="${signClass(a.profit)}">${money(a.profit)}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>`;
  }

  function download(filename, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportCsv() {
    // Quote every cell, and defuse cells a spreadsheet would run as a formula.
    const cell = (v) => {
      let s = String(v ?? '');
      if (/^[=+\-@]/.test(s) && typeof v === 'string') s = `'${s}`;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const header = ['Date', 'Product', 'Status', 'Spots', 'Box cost', 'Shipping and supplies', 'Total cost', 'Fee percent', 'Fee per spot', 'List total', 'Planned profit', 'Sales', 'Fees', 'Actual profit'];
    const lines = store.breaks.map((b) => {
      const p = calc(b);
      const a = actual(b);
      return [b.date, b.product, b.status, b.spots.length, num(b.box), num(b.ship), p.cost, num(b.fee), num(b.feeFixed), p.list, Math.round(p.profit * 100) / 100, a ? a.sales : '', a ? a.fees : '', a ? Math.round(a.profit * 100) / 100 : ''].map(cell).join(',');
    });
    download(`breakmath-breaks-${today()}.csv`, [header.map(cell).join(','), ...lines].join('\n'), 'text/csv');
    toast('CSV downloaded.');
  }

  /* ----- Account ----- */

  let upgradeReason = '';

  function upgradePrompt(reason) {
    upgradeReason = reason;
    show('account');
  }

  function renderAccount() {
    const plan = !SELLING
      ? `<p class="plan-state">Early access</p>
         <p>Everything is unlocked and free while BreakMath is in early access. Paid plans are not on sale yet.</p>`
      : isPro()
        ? `<p class="plan-state up">Pro</p>
           <p>${AUTH ? 'Pro is active on your account, on every device you sign in on.' : 'Pro is unlocked in this browser. To use it on another device, open the link on your payment confirmation page there.'}</p>
           ${CFG.stripePortalLink ? `<a class="btn-ghost" href="${esc(CFG.stripePortalLink)}" target="_blank" rel="noopener">Manage or cancel subscription</a>` : ''}`
        : `<p class="plan-state">Free</p>
           ${upgradeReason ? `<p class="callout">${esc(upgradeReason)}</p>` : ''}
           <p>Free covers the planner, the what-if slider and ${FREE_BREAKS_PER_MONTH} saved breaks a month. Pro adds unlimited saved breaks, your own team templates, profit history and the tax export.</p>
           <div class="actions">
             ${CFG.stripeMonthlyLink ? `<a class="btn" href="${esc(payLink(CFG.stripeMonthlyLink))}">Get Pro, $15 a month</a>` : ''}
             ${CFG.stripeYearlyLink ? `<a class="btn-ghost" href="${esc(payLink(CFG.stripeYearlyLink))}">Get Pro, $119 a year</a>` : ''}
           </div>
           <p class="muted small">Payment is handled by Stripe. Cancel any time. By subscribing you agree to the <a href="terms.html">Terms</a>.</p>`;
    upgradeReason = '';
    $('#view-account').innerHTML = `
      <div class="page-head"><div><h1>Plan and data</h1></div></div>
      ${account ? `<section class="panel"><h2>Your account</h2>
        <p>Signed in as <strong>${esc(account.email)}</strong></p>
        <div class="actions"><button class="btn-ghost" type="button" data-action="sign-out">Sign out</button></div></section>` : ''}
      <section class="panel"><h2>Your plan</h2>${plan}</section>
      <section class="panel">
        <h2>Your data</h2>
        <p>${AUTH ? 'Your breaks are saved to your account, so they follow you to any device you sign in on. You can still download a copy.' : 'Your breaks are stored in this browser on this device, not on a server. Clearing your browser data deletes them, so keep a backup.'}</p>
        <div class="actions">
          <button class="btn-ghost" type="button" data-action="backup">Download backup</button>
          <label class="btn-ghost file-btn">Restore from backup<input type="file" accept="application/json,.json" data-action="restore" hidden></label>
          <button class="btn-ghost danger" type="button" data-action="wipe">Delete all data</button>
        </div>
      </section>`;
  }

  // Tie the Stripe payment to this account so the webhook knows who paid.
  function payLink(link) {
    if (!account) return link;
    const url = new URL(link);
    url.searchParams.set('client_reference_id', account.id);
    url.searchParams.set('prefilled_email', account.email);
    return url.toString();
  }

  function restoreBackup(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.breaks)) throw new Error('not a backup');
        // Fresh ids, so a restored backup adds to an account rather than
        // overwriting rows that belong to it.
        const fresh = (items) => (items || []).map((item) => ({ ...item, id: uid() }));
        store = AUTH
          ? { ...store, breaks: [...fresh(data.breaks), ...store.breaks], templates: [...fresh(data.templates), ...store.templates] }
          : { ...blankStore(), ...data, pro: store.pro || Boolean(data.pro) };
        if (saveStore()) {
          toast('Backup restored.');
          renderAccount();
        }
      } catch (err) {
        toast("That file isn't a BreakMath backup.");
      }
    };
    reader.readAsText(file);
  }

  /* ---------- Events ---------- */

  const actions = {
    'new-break'() {
      store.draft = newDraft();
      saveStore();
      show('planner');
    },
    'cycle-tier'(el) {
      const spot = store.draft.spots[Number(el.dataset.index)];
      spot.tier = NEXT_TIER[spot.tier];
      el.dataset.tier = spot.tier;
      el.textContent = TIER_LABEL[spot.tier];
      saveStore();
      updatePlanner();
    },
    'remove-spot'(el) {
      store.draft.spots.splice(Number(el.dataset.index), 1);
      saveStore();
      renderPlanner();
    },
    'add-spot'() {
      store.draft.spots.push({ name: `Spot ${store.draft.spots.length + 1}`, tier: 'mid' });
      saveStore();
      renderPlanner();
      const names = $$('.spot-name');
      names[names.length - 1].select();
    },
    'save-template'() {
      if (!isPro()) return upgradePrompt('Saving your own team templates is part of Pro.');
      const name = prompt('Name this team list', store.draft.product || 'My template');
      if (!name || !name.trim()) return;
      store.templates.unshift({ id: uid(), name: name.trim().slice(0, 60), spots: structuredClone(store.draft.spots) });
      saveStore();
      renderPlanner();
      toast('Template saved.');
    },
    'save-break': saveBreak,
    'copy-spots': copySpots,
    'toggle-break'(el) {
      openBreakId = openBreakId === el.dataset.id ? null : el.dataset.id;
      renderBreaks();
    },
    'results-mode'(el) {
      const b = store.breaks.find((x) => x.id === el.dataset.id);
      if (!b) return;
      b.results = { ...(b.results || {}), mode: el.dataset.mode };
      saveStore();
      renderBreaks();
    },
    'edit-break'(el) {
      const b = store.breaks.find((x) => x.id === el.dataset.id);
      if (!b) return;
      const { status, results, createdAt, ...plan } = structuredClone(b);
      store.draft = { ...newDraft(), ...plan };
      saveStore();
      show('planner');
    },
    'delete-break'(el) {
      const b = store.breaks.find((x) => x.id === el.dataset.id);
      if (!b || !confirm(`Delete "${b.product}"? This can't be undone.`)) return;
      store.breaks = store.breaks.filter((x) => x.id !== b.id);
      saveStore();
      renderBreaks();
    },
    'whatnot-fees'() {
      store.draft.fee = '10.9';
      store.draft.feeFixed = '0.30';
      saveStore();
      renderPlanner();
      toast('Set to 8% commission + 2.9% + $0.30 processing. Check your own rates.');
    },
    'rerun-break'(el) {
      const b = store.breaks.find((x) => x.id === el.dataset.id);
      if (!b) return;
      const { status, results, createdAt, id, ...plan } = structuredClone(b);
      plan.spots = plan.spots.map((sp) => ({ name: sp.name, tier: sp.tier }));
      store.draft = { ...newDraft(), ...plan, id: null, date: today() };
      saveStore();
      show('planner');
      toast('Copied into the planner with the same teams and tiers.');
    },
    'go-live'(el) {
      liveBreakId = el.dataset.id;
      openBreakId = el.dataset.id;
      renderBreaks();
    },
    'leave-live'() {
      liveBreakId = null;
      renderBreaks();
    },
    'toggle-sold'(el) {
      const b = store.breaks.find((x) => x.id === liveBreakId);
      if (!b) return;
      const i = Number(el.dataset.index);
      const sp = b.spots[i];
      sp.isSold = !sp.isSold;
      sp.sold = sp.isSold ? num($(`[data-live-price="${i}"]`).value) : 0;
      saveStore();
      const row = el.closest('.live-row');
      row.classList.toggle('is-sold', sp.isSold);
      el.setAttribute('aria-pressed', String(sp.isSold));
      el.textContent = sp.isSold ? 'Sold' : 'Mark sold';
      $('#live-stats').innerHTML = liveStatsHtml(b, calc(b));
    },
    'end-show'(el) {
      const b = store.breaks.find((x) => x.id === el.dataset.id);
      if (!b) return;
      const plan = calc(b);
      const t = liveTotals(b, plan);
      if (!t.count && !confirm('No spots are marked sold. Save this break with $0 in sales?')) return;
      b.spots.forEach((sp) => {
        if (!sp.isSold) sp.sold = 0;
      });
      b.results = { mode: 'spots', soldTotal: t.revenue, fees: t.fees };
      b.status = 'done';
      liveBreakId = null;
      if (saveStore()) {
        renderBreaks();
        toast(`Show saved. Profit: ${money(t.profit)}.`);
      }
    },
    'apply-import'(el) {
      applyImport(el.dataset.id, el.closest('form').querySelector('[name="import"]').value);
    },
    'export-csv': exportCsv,
    'auth-mode'(el) {
      signedOutView(el.dataset.mode);
    },
    async 'sign-out'() {
      await syncNow();
      await db.auth.signOut();
    },
    backup() {
      download(`breakmath-backup-${today()}.json`, JSON.stringify(store, null, 2), 'application/json');
      toast('Backup downloaded.');
    },
    wipe() {
      if (!confirm("Delete every saved break and template in this browser? This can't be undone.")) return;
      store = { ...blankStore(), pro: store.pro };
      saveStore();
      renderAccount();
      toast('All data deleted.');
    },
  };

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-view]');
    if (nav) {
      e.preventDefault();
      show(nav.dataset.view);
      return;
    }
    const el = e.target.closest('[data-action]');
    if (el && actions[el.dataset.action] && el.tagName !== 'SELECT' && el.type !== 'file') actions[el.dataset.action](el);
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    const d = store.draft;
    if (t.dataset.field) d[t.dataset.field] = t.value;
    else if (t.dataset.weight) d.weights[t.dataset.weight] = t.value;
    else if (t.dataset.spotName !== undefined) d.spots[Number(t.dataset.spotName)].name = t.value;
    else if (t.dataset.check) d[t.dataset.check] = t.checked;
    else if (t.id === 'disc') discount = Number(t.value);
    else if (t.dataset.livePrice !== undefined) {
      const b = store.breaks.find((x) => x.id === liveBreakId);
      const sp = b && b.spots[Number(t.dataset.livePrice)];
      if (sp && sp.isSold) {
        sp.sold = num(t.value);
        saveStore();
        $('#live-stats').innerHTML = liveStatsHtml(b, calc(b));
      }
      return;
    } else return;
    saveStore();
    updatePlanner();
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.action === 'load-template' && t.value) {
      const [kind, key] = [t.value.slice(0, t.value.indexOf(':')), t.value.slice(t.value.indexOf(':') + 1)];
      const spots = kind === 'own'
        ? (store.templates.find((x) => x.id === key) || {}).spots
        : PRESETS[key] && spotsFrom(PRESETS[key]);
      if (spots) {
        store.draft.spots = structuredClone(spots).map((s) => ({ name: s.name, tier: s.tier }));
        saveStore();
        renderPlanner();
      }
    }
    if (t.dataset.action === 'restore' && t.files[0]) restoreBackup(t.files[0]);
    if (t.dataset.action === 'import-file' && t.files[0]) {
      const reader = new FileReader();
      reader.onload = () => applyImport(t.dataset.id, String(reader.result));
      reader.readAsText(t.files[0]);
    }
  });

  document.addEventListener('submit', (e) => {
    if (e.target.dataset.form === 'results') {
      e.preventDefault();
      saveResults(e.target);
    }
    if (e.target.dataset.form === 'auth') {
      e.preventDefault();
      submitAuth(e.target);
    }
  });

  window.addEventListener('hashchange', () => show(location.hash.slice(1)));

  /* ---------- Start ---------- */

  const params = new URLSearchParams(location.search);

  async function start() {
    if (!AUTH) {
      // No accounts: Stripe sends people back to app.html?pro=welcome after they pay.
      if (SELLING && params.get('pro') === 'welcome') {
        store.pro = true;
        saveStore();
        history.replaceState(null, '', location.pathname + '#account');
        setTimeout(() => toast('Pro is unlocked. Thank you.'), 300);
      }
      setPill();
      show(location.hash.slice(1) || 'planner');
      return;
    }

    $('#view-auth').hidden = false;
    $('#view-auth').innerHTML = '<p class="muted">Loading…</p>';
    try {
      await connect();
    } catch (err) {
      $('#view-auth').innerHTML = "<p>Couldn't reach BreakMath. Check your connection and reload the page.</p>";
      return;
    }

    let openFor = null;
    db.auth.onAuthStateChange((event, session) => {
      // Supabase calls this inside its own lock, so hand off before doing more work.
      setTimeout(async () => {
        if (event === 'PASSWORD_RECOVERY') {
          signedOutView('newpass');
        } else if (session && session.user) {
          if (openFor === session.user.id) return;
          openFor = session.user.id;
          await openApp(session.user);
          // Back from Stripe: the webhook may take a few seconds to mark the account Pro.
          if (params.get('paid') && !account.pro) {
            for (let i = 0; i < 10 && !account.pro; i += 1) {
              await new Promise((r) => setTimeout(r, 2000));
              await refreshPlan();
            }
            if (account.pro) {
              toast('Pro is active. Thank you.');
              renderAccount();
            }
            history.replaceState(null, '', location.pathname + '#account');
          }
        } else {
          openFor = null;
          account = null;
          store.breaks = [];
          store.templates = [];
          signedOutView('signup');
        }
      }, 0);
    });
  }

  window.addEventListener('beforeunload', () => {
    if (AUTH && syncTimer) syncNow();
  });

  start();
})();
