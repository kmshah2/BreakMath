// Loads GoatCounter (cookie-free visitor counts) when a site code is set in config.js.
(function () {
  var code = (window.BREAKMATH || {}).goatcounterCode;
  if (!code) return;
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = 'https://' + code + '.goatcounter.com/count';
  document.head.appendChild(script);
})();
