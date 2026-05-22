/* ═════════════════════════════════════════════════════════
   VISITOR TRACKING — Casa Escondida Anilao
   Stores visitor data in cookie + sends to Google Analytics
   Respects ce_consent cookie (set by cookie-consent.js)
   ═════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var COOKIE_NAME = 'ce_visitor';
  var COOKIE_DAYS = 365;
  var MAX_PAGES_STORED = 20;

  /* ── Check consent before tracking ── */
  function hasConsent() {
    var match = document.cookie.split('; ').find(function (c) {
      return c.indexOf('ce_consent=') === 0;
    });
    return match && match.split('=')[1] === 'accepted';
  }

  /* If declined, abort. If undecided, wait for consent. */
  if (!hasConsent()) {
    /* Expose a function so consent banner can trigger tracking after accept */
    window.CE_RUN_TRACKING = function () { runTracking(); };
    return;
  }

  runTracking();

  function runTracking() {

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

  /* ── Send to Google Analytics (GA4) — full integration ── */
  if (typeof window.gtag === 'function') {
    try {
      var GA_ID = 'G-BHGE4494ZY';
      var isFirstVisit = data.total_pageviews === 1;
      var firstVisitDate = (data.first_visit || '').substring(0, 10);

      /* 1) Set User-ID via gtag('set') — no extra page_view triggered */
      window.gtag('set', { 'user_id': data.visitor_id });

      /* 2) Set User Properties (persistent — attach to ALL subsequent events) */
      window.gtag('set', 'user_properties', {
        ce_visitor_id: data.visitor_id,
        device_type: data.device_type,
        language_pref: data.language || 'unknown',
        timezone: data.timezone || 'unknown',
        first_visit_date: firstVisitDate,
        first_referrer: data.referrer || 'direct',
        first_landing: data.landing_page || '/',
        first_utm_source: (data.utm && data.utm.utm_source) || 'direct',
        first_utm_medium: (data.utm && data.utm.utm_medium) || 'none',
        first_utm_campaign: (data.utm && data.utm.utm_campaign) || 'none',
        is_returning: isFirstVisit ? 'false' : 'true',
        visitor_tier: bucketTier(data.total_pageviews)
      });

      /* 3) Fire dedicated visitor_view event (custom data alongside GA's auto page_view) */
      window.gtag('event', 'visitor_view', {
        visitor_id: data.visitor_id,
        session_count: data.session_count,
        total_pageviews: data.total_pageviews,
        is_first_visit: isFirstVisit,
        device_type: data.device_type,
        referrer: data.referrer,
        landing_page: data.landing_page,
        utm_source: (data.utm && data.utm.utm_source) || '',
        utm_medium: (data.utm && data.utm.utm_medium) || '',
        utm_campaign: (data.utm && data.utm.utm_campaign) || ''
      });

      /* 4) Special event on first-ever visit */
      if (isFirstVisit) {
        window.gtag('event', 'first_visit_enriched', {
          visitor_id: data.visitor_id,
          referrer: data.referrer,
          landing_page: data.landing_page,
          device_type: data.device_type,
          utm_source: (data.utm && data.utm.utm_source) || 'direct'
        });
      }
    } catch (e) { /* GA failed, no problem */ }
  }

  /* ── Helpers for GA values ── */
  function bucketTier(pv) {
    if (pv <= 1) return '1_new';
    if (pv <= 5) return '2_browsing';
    if (pv <= 20) return '3_engaged';
    if (pv <= 50) return '4_loyal';
    return '5_super_loyal';
  }
  function daysSince(iso) {
    if (!iso) return 0;
    var ms = Date.now() - new Date(iso).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  /* ── Expose for debugging / dashboards ── */
  window.CE_VISITOR = data;
  } /* end runTracking */
})();
