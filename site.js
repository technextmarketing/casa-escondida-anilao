/* ═════════════════════════════════════════════════════════
   SITE.JS — Shared interactions for Casa Escondida Anilao
   • Theme toggle (day / night)
   • Mobile nav dropdown
   • Nav hide-on-scroll-down
   • Page progress bar
   ═════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── THEME TOGGLE ─────────────────────────────────────── */
  (function () {
    var html = document.documentElement;
    var btn  = document.getElementById('themeBtn');
    if (!btn) return;

    var moon  = document.getElementById('icon-moon');
    var sun   = document.getElementById('icon-sun');
    var label = document.getElementById('themeLabel');

    function sync() {
      var n = html.getAttribute('data-theme') === 'night';
      if (moon)  moon.style.display  = n ? 'block' : 'none';
      if (sun)   sun.style.display   = n ? 'none'  : 'block';
      if (label) label.textContent   = n ? 'Night' : 'Day';
    }
    sync();
    btn.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'night' ? 'day' : 'night';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('ce-theme', next); } catch (e) {}
      sync();
    });
  })();

  /* ── MOBILE NAV (dropdown) ────────────────────────────── */
  (function () {
    var hamburger = document.getElementById('navHamburger');
    var mobileNav = document.getElementById('mobileNav');
    if (!hamburger || !mobileNav) return;

    function close() {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      var open = mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });

    /* Close when a nav link is clicked */
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });

    /* Close on outside tap */
    document.addEventListener('click', function (e) {
      if (!mobileNav.contains(e.target) && e.target !== hamburger) close();
    });

    /* Close on Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
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

  /* ── Button click ripple (all CTA buttons across all pages) ── */
  (function () {
    var sel = [
      '.btn-hero-primary','.btn-hero-ghost',
      '.rm-btn-primary','.rm-btn-ghost',
      '.dv-btn-primary','.dv-btn-ghost',
      '.loc-btn-primary','.loc-btn-ghost',
      '.cta-btn-main','.cta-btn-outline',
      '.ig-cta-btn','.btn-book-sm'
    ].join(',');
    document.querySelectorAll(sel).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var rect = this.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var r = document.createElement('span');
        r.className = 'btn-ripple';
        r.style.cssText = 'width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px';
        this.appendChild(r);
        setTimeout(function(){ if(r.parentNode) r.parentNode.removeChild(r); }, 750);
      });
    });
  })();

})();
