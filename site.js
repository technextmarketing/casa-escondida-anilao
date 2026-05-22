/* ═════════════════════════════════════════════════════════
   SITE.JS — Shared interactions for Casa Escondida Anilao
   • Theme toggle (day / night)
   • Mobile nav drawer
   • Nav hide-on-scroll-down
   • Page progress bar
   ═════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── THEME TOGGLE ─────────────────────────────────────── */
  (function () {
    var html = document.documentElement;
    var btn = document.getElementById('themeBtn');
    if (!btn) return;
    var moon = document.getElementById('icon-moon');
    var sun = document.getElementById('icon-sun');
    var label = document.getElementById('themeLabel');
    function sync() {
      var n = html.getAttribute('data-theme') === 'night';
      if (moon) moon.style.display = n ? 'block' : 'none';
      if (sun) sun.style.display = n ? 'none' : 'block';
      if (label) label.textContent = n ? 'Night' : 'Day';
    }
    sync();
    btn.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'night' ? 'day' : 'night';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('ce-theme', next); } catch (e) {}
      sync();
    });
    /* OS theme change listener removed — night is default unless user toggles. */
  })();

  /* ── MOBILE NAV ───────────────────────────────────────── */
  (function () {
    var hamburger = document.getElementById('navHamburger');
    var mobileNav = document.getElementById('mobileNav');
    if (!hamburger || !mobileNav) return;
    function close() {
      mobileNav.classList.remove('open');
      mobileNav.style.display = 'none';
      hamburger.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      var open = mobileNav.classList.toggle('open');
      mobileNav.style.display = open ? 'flex' : 'none';
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    hamburger.addEventListener('click', toggle);
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
  })();

  /* ── NAV HIDE-ON-SCROLL-DOWN ──────────────────────────── */
  (function () {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var lastY = 0, ticking = false;
    function update() {
      var y = window.scrollY;
      if (y < 120) nav.classList.remove('nav-hidden');
      else if (y > lastY + 6) nav.classList.add('nav-hidden');
      else if (y < lastY - 6) nav.classList.remove('nav-hidden');
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  })();

  /* ── PAGE PROGRESS BAR ────────────────────────────────── */
  (function () {
    var bar = document.getElementById('pg-bar');
    if (!bar) return;
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href') || '';
      if (!h.startsWith('#') && !h.startsWith('http') && !h.startsWith('mailto:')
          && !a.target && !a.classList.contains('nav-logo')) {
        a.addEventListener('click', function () {
          bar.style.width = '70%';
          bar.style.opacity = '1';
        });
      }
    });
    window.addEventListener('pageshow', function () { bar.classList.add('done'); });
  })();

})();
