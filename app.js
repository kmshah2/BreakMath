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
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      return true;
    } catch (err) {
      toast("Couldn't save. This browser is blocking storage or it is full.");
      return false;
    }
  }

  let store = loadStore();
  const isPro = () => store.pro || !SELLING;

  /* ---------- The pricing math ---------- */

  // Work out what the spots must bring in after fees to hit the profit goal,
  // split it across spots by tier weight, then round each price.
  function calc(b) {
    const cost = num(b.box) + num(b.ship);
    const fee = Math.min(Math.max(num(b.fee), 0), 90) / 100;
    const target = num(b.target) / 100;
    const step = Number(b.rounding) === 5 ? 5 : 1;
    const weights = b.weights || { top: 3, mid: 2, low: 1 };
    const weightOf = (spot) => Math.max(num(weights[spot.tier]), 0);
    const needed = (cost * (1 + target)) / (1 - fee);
    const totalWeight = b.spots.reduce((sum, s) => sum + weightOf(s), 0);
    const prices = b.spots.map((s) => (totalWeight > 0 ? Math.round((needed * weightOf(s)) / totalWeight / step) * step : 0));
    const list = prices.reduce((sum, p) => sum + p, 0);
    const profit = list * (1 - fee) - cost;
    const breakEven = cost / (1 - fee);
    return {
      cost,
      fee,
      needed,
      prices,
      list,
      profit,
      breakEven,
      returnPct: cost > 0 ? (profit / cost) * 100 : 0,
      safeDiscount: list > 0 ? Math.max(0, (1 - breakEven / list) * 100) : 0,
      profitAt: (discountPct) => list * (1 - discountPct / 100) * (1 - fee) - cost,
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

  function show(view) {
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
            <label class="field"><span>Platform and payment fees</span>
              <span class="input"><input data-field="fee" type="text" inputmode="decimal" value="${esc(d.fee)}" placeholder="12"><i>%</i></span></label>
            <label class="field"><span>Profit goal</span>
              <span class="input"><input data-field="target" type="text" inputmode="decimal" value="${esc(d.target)}" placeholder="20"><i>%</i></span></label>
            <label class="field"><span>Break date</span>
              <span class="input"><input data-field="date" type="date" value="${esc(d.date)}"></span></label>
            <label class="field"><span>Round prices to</span>
              <span class="input"><select data-field="rounding">
                <option value="1"${Number(d.rounding) === 1 ? ' selected' : ''}>Nearest $1</option>
                <option value="5"${Number(d.rounding) === 5 ? ' selected' : ''}>Nearest $5</option>
              </select></span></label>
          </div>
          <details class="weights">
            <summary>Tier weights</summary>
            <p>How much more a Top or Mid spot costs than a Low spot. 3 / 2 / 1 means a Top spot costs three times a Low spot.</p>
            <div class="fields three">
              ${TIERS.map((t) => `<label class="field"><span>${TIER_LABEL[t]}</span>
                <span class="input"><input data-weight="${t}" type="text" inputmode="decimal" value="${esc(d.weights[t])}"></span></label>`).join('')}
            </div>
          </details>
          <p class="note">Use the fee rate your platform and payment processor actually charge. BreakMath never guesses card prices or fees.</p>
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
          <div><dt>Return on cost</dt><dd id="s-return">0.0%</dd></div>
          <div><dt>Break-even sales</dt><dd id="s-even">$0</dd></div>
        </dl>
        <p class="muted small" id="s-gap"></p>
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
    $('#s-return').textContent = pct(r.returnPct);
    $('#s-even').textContent = money(r.breakEven);
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

  function breakDetail(b, plan, real) {
    const res = b.results || {};
    const mode = res.mode || 'total';
    const soldTotal = res.soldTotal ?? plan.list;
    const fees = res.fees ?? Math.round(num(soldTotal) * plan.fee);
    return `
      <div class="break-detail">
        <dl class="stats compact">
          <div><dt>Cost</dt><dd>${money(plan.cost)}</dd></div>
          <div><dt>List total</dt><dd>${money(plan.list)}</dd></div>
          <div><dt>Planned profit</dt><dd class="${signClass(plan.profit)}">${money(plan.profit)}</dd></div>
          ${real ? `<div><dt>Actual profit</dt><dd class="${signClass(real.profit)}">${money(real.profit)}</dd></div>` : ''}
        </dl>
        <form class="results" data-form="results" data-id="${esc(b.id)}">
          <h3>${b.status === 'done' ? 'Results' : 'Record results'}</h3>
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
          <label class="field"><span>Fees taken from your payout</span>
            <span class="input"><i>$</i><input name="fees" type="text" inputmode="decimal" value="${esc(fees)}"></span></label>
          <div class="actions">
            <button class="btn" type="submit">${b.status === 'done' ? 'Update results' : 'Mark as done'}</button>
            <button class="btn-ghost" type="button" data-action="edit-break" data-id="${esc(b.id)}">Edit plan</button>
            <button class="btn-ghost danger" type="button" data-action="delete-break" data-id="${esc(b.id)}">Delete</button>
          </div>
        </form>
      </div>`;
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
    const months = groupBy(rows, (r) => String(r.b.date).slice(0, 7)).sort((a, b) => b.key.localeCompare(a.key));
    const products = groupBy(rows, (r) => r.b.product.trim()).sort((a, b) => b.profit - a.profit);
    const sorted = [...rows].sort((a, b) => b.a.profit - a.a.profit);
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
    const header = ['Date', 'Product', 'Status', 'Spots', 'Box cost', 'Shipping and supplies', 'Total cost', 'List total', 'Planned profit', 'Sales', 'Fees', 'Actual profit'];
    const lines = store.breaks.map((b) => {
      const p = calc(b);
      const a = actual(b);
      return [b.date, b.product, b.status, b.spots.length, num(b.box), num(b.ship), p.cost, p.list, Math.round(p.profit * 100) / 100, a ? a.sales : '', a ? a.fees : '', a ? Math.round(a.profit * 100) / 100 : ''].map(cell).join(',');
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
      : store.pro
        ? `<p class="plan-state up">Pro</p>
           <p>Pro is unlocked in this browser. To use it on another device, open the link on your payment confirmation page there.</p>
           ${CFG.stripePortalLink ? `<a class="btn-ghost" href="${esc(CFG.stripePortalLink)}" target="_blank" rel="noopener">Manage or cancel subscription</a>` : ''}`
        : `<p class="plan-state">Free</p>
           ${upgradeReason ? `<p class="callout">${esc(upgradeReason)}</p>` : ''}
           <p>Free covers the planner, the what-if slider and ${FREE_BREAKS_PER_MONTH} saved breaks a month. Pro adds unlimited saved breaks, your own team templates, profit history and the tax export.</p>
           <div class="actions">
             ${CFG.stripeMonthlyLink ? `<a class="btn" href="${esc(CFG.stripeMonthlyLink)}">Get Pro, $15 a month</a>` : ''}
             ${CFG.stripeYearlyLink ? `<a class="btn-ghost" href="${esc(CFG.stripeYearlyLink)}">Get Pro, $119 a year</a>` : ''}
           </div>
           <p class="muted small">Payment is handled by Stripe. Cancel any time. By subscribing you agree to the <a href="terms.html">Terms</a>.</p>`;
    upgradeReason = '';
    $('#view-account').innerHTML = `
      <div class="page-head"><div><h1>Plan and data</h1></div></div>
      <section class="panel"><h2>Your plan</h2>${plan}</section>
      <section class="panel">
        <h2>Your data</h2>
        <p>Your breaks are stored in this browser on this device, not on a server. Clearing your browser data deletes them, so keep a backup.</p>
        <div class="actions">
          <button class="btn-ghost" type="button" data-action="backup">Download backup</button>
          <label class="btn-ghost file-btn">Restore from backup<input type="file" accept="application/json,.json" data-action="restore" hidden></label>
          <button class="btn-ghost danger" type="button" data-action="wipe">Delete all data</button>
        </div>
      </section>`;
  }

  function restoreBackup(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.breaks)) throw new Error('not a backup');
        store = { ...blankStore(), ...data, pro: store.pro || Boolean(data.pro) };
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
    'export-csv': exportCsv,
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
    else if (t.id === 'disc') discount = Number(t.value);
    else return;
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
  });

  document.addEventListener('submit', (e) => {
    if (e.target.dataset.form === 'results') {
      e.preventDefault();
      saveResults(e.target);
    }
  });

  window.addEventListener('hashchange', () => show(location.hash.slice(1)));

  /* ---------- Start ---------- */

  // Stripe sends people back to app.html?pro=welcome after they pay.
  const params = new URLSearchParams(location.search);
  if (SELLING && params.get('pro') === 'welcome') {
    store.pro = true;
    saveStore();
    history.replaceState(null, '', location.pathname + '#account');
    setTimeout(() => toast('Pro is unlocked. Thank you.'), 300);
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: 'pro-unlocked', title: 'Pro unlocked', event: true });
    }
  }

  $('#plan-pill').textContent = !SELLING ? 'Early access' : store.pro ? 'Pro' : 'Free';
  show(location.hash.slice(1) || 'planner');
})();
