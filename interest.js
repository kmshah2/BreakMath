// Records interest in Pro (and update sign-ups) in the Supabase "interest"
// table while Pro isn't on sale. Used by both the site and the app.
(function () {
  var CFG = window.BREAKMATH || {};
  var SOURCE_KEY = 'breakmath:source';

  // Remember which ad or site first sent this visitor, so the app knows too.
  function firstSource() {
    var saved = null;
    try { saved = localStorage.getItem(SOURCE_KEY); } catch (err) { /* storage blocked */ }
    if (saved) return saved;
    var found = new URLSearchParams(location.search).get('utm_source');
    if (!found) {
      try {
        found = document.referrer && new URL(document.referrer).hostname !== location.hostname
          ? new URL(document.referrer).hostname : 'direct';
      } catch (err) { found = 'direct'; }
    }
    found = String(found).slice(0, 100);
    try { localStorage.setItem(SOURCE_KEY, found); } catch (err) { /* storage blocked */ }
    return found;
  }
  var source = firstSource();

  var enabled = Boolean(CFG.supabaseUrl && CFG.supabaseAnonKey);

  // row: { kind, plan?, email?, reason?, page }. client: a signed-in Supabase
  // client from the app, so the row is tied to the account; otherwise anonymous.
  function record(row, client) {
    if (!enabled) return Promise.resolve(false);
    var body = Object.assign({ source: source }, row);
    if (body.reason) body.reason = String(body.reason).slice(0, 200);
    if (client) {
      return client.from('interest').insert(body).then(function (res) {
        if (res.error) throw res.error;
        return true;
      });
    }
    return fetch(CFG.supabaseUrl.replace(/\/$/, '') + '/rest/v1/interest', {
      method: 'POST',
      headers: {
        apikey: CFG.supabaseAnonKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(body),
    }).then(function (res) {
      if (!res.ok) throw new Error('Interest request failed: ' + res.status);
      return true;
    });
  }

  window.BreakMathInterest = { enabled: enabled, source: source, record: record };
})();
