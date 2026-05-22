/* ═════════════════════════════════════════════════════════
   VISITOR TRACKING — Casa Escondida Anilao
   Stores visitor data in cookie + sends to Google Analytics
   ═════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var COOKIE_NAME = 'ce_visitor';
  var COOKIE_DAYS = 365;
  var MAX_PAGES_STORED = 20;

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
    document.cookie =
      name + '=' + encodeURIComponent(value) +
      '; expires=' + expires.toUTCString() +
      '; path=/; SameSite=Lax';
  }

  /* ── Get or generate a session id (per browser) ── */
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  /* ── Build / update visitor data ── */
  var existing = getCookie(COOKIE_NAME);
  var data = null;
  if (existing) {
    try { data = JSON.parse(existing); } catch (e) { data = null; }
  }

  var now = new Date().toISOString();
  var currentPath = window.location.pathname + window.location.search;
  var screenInfo = (window.screen ? (window.screen.width + 'x' + window.screen.height) : '');
  var viewportInfo = window.innerWidth + 'x' + window.innerHeight;

  if (!data) {
    /* ── First visit ── */
    data = {
      visitor_id: uuid(),
      first_visit: now,
      last_visit: now,
      session_count: 1,
      total_pageviews: 1,
      pages_seen: [currentPath],
      referrer: document.referrer || 'direct',
      landing_page: currentPath,
      user_agent: (navigator.userAgent || '').substring(0, 200),
      language: navigator.language || '',
      timezone: (function () {
        try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
        catch (e) { return ''; }
      })(),
      screen: screenInfo,
      viewport_first: viewportInfo,
      device_type: detectDevice(),
      utm: extractUTM()
    };
  } else {
    /* ── Returning visitor ── */
    var lastVisitMs = data.last_visit ? new Date(data.last_visit).getTime() : 0;
    var now_ms = Date.now();
    var isNewSession = (now_ms - lastVisitMs) > (30 * 60 * 1000); /* 30 min gap = new session */

    data.last_visit = now;
    data.total_pageviews = (data.total_pageviews || 0) + 1;
    if (isNewSession) {
      data.session_count = (data.session_count || 0) + 1;
      /* refresh UTM if there's a new one */
      var newUtm = extractUTM();
      if (newUtm && Object.keys(newUtm).length) data.utm = newUtm;
    }
    if (!data.pages_seen) data.pages_seen = [];
    if (data.pages_seen.indexOf(currentPath) === -1) data.pages_seen.push(currentPath);
    if (data.pages_seen.length > MAX_PAGES_STORED) {
      data.pages_seen = data.pages_seen.slice(-MAX_PAGES_STORED);
    }
  }

  setCookie(COOKIE_NAME, JSON.stringify(data), COOKIE_DAYS);

  /* ── UTM extraction ── */
  function extractUTM() {
    var params = new URLSearchParams(window.location.search);
    var utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
      .forEach(function (key) {
        var v = params.get(key);
        if (v) utm[key] = v;
      });
    return utm;
  }

  /* ── Simple device-type detection ── */
  function detectDevice() {
    var ua = (navigator.userAgent || '').toLowerCase();
    if (/tablet|ipad|playbook|silk/.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) return 'mobile';
    return 'desktop';
  }

  /* ── Forward to Google Analytics if present ── */
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', 'visitor_view', {
        visitor_id: data.visitor_id,
        session_count: data.session_count,
        total_pageviews: data.total_pageviews,
        is_first_visit: data.total_pageviews === 1,
        device_type: data.device_type,
        page_path: currentPath
      });
    } catch (e) { /* GA failed, no problem */ }
  }

  /* ── Expose for debugging / dashboards ── */
  window.CE_VISITOR = data;
})();
