/* ═════════════════════════════════════════════════════════
   COOKIE CONSENT BANNER — Casa Escondida Anilao
   GDPR/CCPA-friendly. Decline = visitor cookie is NOT set.
   ═════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CONSENT_COOKIE = 'ce_consent';
  var CONSENT_DAYS = 365;

  /* ── Cookie helpers ── */
  function getCookie(name) {
    var match = document.cookie.split('; ').find(function (c) {
      return c.indexOf(name + '=') === 0;
    });
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
  }
  function setCookie(name, value, days) {
    var expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + expires.toUTCString() + '; path=/; SameSite=Lax';
  }
  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }

  /* ── Expose consent state for visitor-tracking.js to check ── */
  window.CE_CONSENT = getCookie(CONSENT_COOKIE);

  /* ── If decision already made, do nothing ── */
  if (window.CE_CONSENT === 'accepted' || window.CE_CONSENT === 'declined') {
    if (window.CE_CONSENT === 'declined') {
      /* Clean up any existing tracking cookies */
      deleteCookie('ce_visitor');
    }
    return;
  }

  /* ── Build & inject the banner ── */
  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = 'ce-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="ce-consent-inner">' +
        '<div class="ce-consent-text">' +
          '<strong>We use cookies.</strong> ' +
          'We store a small cookie (<code>ce_visitor</code>) to understand how guests use our site — ' +
          'pages visited, device type, referrer. No personal data is shared with third parties beyond Google Analytics. ' +
          '<a href="/privacy-policy.html">Learn more</a>' +
        '</div>' +
        '<div class="ce-consent-actions">' +
          '<button class="ce-consent-btn ce-consent-decline" type="button">Decline</button>' +
          '<button class="ce-consent-btn ce-consent-accept" type="button">Accept</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    /* ── Styles (inline so no extra request) ── */
    var style = document.createElement('style');
    style.textContent =
      '#ce-consent-banner{position:fixed;bottom:1rem;left:1rem;right:1rem;max-width:880px;margin:0 auto;z-index:99999;' +
        'background:rgba(7,14,26,.96);color:#f0f4f8;border:1px solid rgba(77,194,232,.3);border-radius:8px;' +
        'box-shadow:0 12px 40px rgba(0,0,0,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);' +
        'opacity:0;transform:translateY(20px);transition:opacity .4s,transform .4s;font-family:"DM Sans",sans-serif;}' +
      '#ce-consent-banner.show{opacity:1;transform:translateY(0);}' +
      '.ce-consent-inner{display:flex;align-items:center;gap:1.5rem;padding:1rem 1.4rem;flex-wrap:wrap;}' +
      '.ce-consent-text{flex:1;min-width:240px;font-size:.82rem;line-height:1.55;color:#cdd6df;}' +
      '.ce-consent-text strong{color:#fff;font-weight:600;}' +
      '.ce-consent-text code{background:rgba(77,194,232,.12);color:#4dc2e8;padding:.05rem .35rem;border-radius:3px;font-size:.78rem;}' +
      '.ce-consent-text a{color:#4dc2e8;text-decoration:underline;}' +
      '.ce-consent-actions{display:flex;gap:.5rem;flex-shrink:0;}' +
      '.ce-consent-btn{font-family:inherit;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;' +
        'padding:.55rem 1.2rem;border-radius:3px;cursor:pointer;transition:all .25s;border:1px solid transparent;}' +
      '.ce-consent-decline{background:transparent;border-color:rgba(255,255,255,.2);color:#cdd6df;}' +
      '.ce-consent-decline:hover{border-color:rgba(255,255,255,.45);color:#fff;}' +
      '.ce-consent-accept{background:#4dc2e8;color:#04080f;}' +
      '.ce-consent-accept:hover{background:#6cd0ee;transform:translateY(-1px);}' +
      '@media(max-width:560px){.ce-consent-inner{flex-direction:column;align-items:stretch;}' +
        '.ce-consent-actions{justify-content:flex-end;}}';
    document.head.appendChild(style);

    /* ── Show with delay so it doesn't fight LCP ── */
    setTimeout(function () { banner.classList.add('show'); }, 800);

    /* ── Handlers ── */
    banner.querySelector('.ce-consent-accept').addEventListener('click', function () {
      setCookie(CONSENT_COOKIE, 'accepted', CONSENT_DAYS);
      window.CE_CONSENT = 'accepted';
      banner.classList.remove('show');
      setTimeout(function () { banner.remove(); }, 400);
      /* Run tracker now if it was waiting */
      if (typeof window.CE_RUN_TRACKING === 'function') window.CE_RUN_TRACKING();
    });
    banner.querySelector('.ce-consent-decline').addEventListener('click', function () {
      setCookie(CONSENT_COOKIE, 'declined', CONSENT_DAYS);
      window.CE_CONSENT = 'declined';
      deleteCookie('ce_visitor');
      banner.classList.remove('show');
      setTimeout(function () { banner.remove(); }, 400);
    });
  }

  if (document.body) buildBanner();
  else document.addEventListener('DOMContentLoaded', buildBanner);
})();
