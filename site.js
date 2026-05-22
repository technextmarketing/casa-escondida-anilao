/* ═════════════════════════════════════════════════════════
   SITE.JS — Shared interactions for Casa Escondida Anilao
   • Theme toggle (day / night)
   • Mobile nav drawer
   • Nav hide-on-scroll-down
   • Page progress bar
   • Custom cursor (desktop only)
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
    if (window.matchMedia) {
      try {
        window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', function (e) {
          try {
            if (!localStorage.getItem('ce-theme')) {
              html.setAttribute('data-theme', e.matches ? 'night' : 'day');
              sync();
            }
          } catch (err) {}
        });
      } catch (e) {}
    }
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
    /* Close when a link inside is clicked */
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

  /* ── CUSTOM CURSOR ────────────────────────────────────── */
  (function () {
    /* Only on devices that actually have a precise pointer */
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      ['cur-dot', 'cur-ring'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.parentNode.removeChild(el);
      });
      return;
    }
    var dot = document.getElementById('cur-dot');
    var ring = document.getElementById('cur-ring');
    if (!dot || !ring) return;

    var rx = 0, ry = 0, tx = 0, ty = 0, rafScheduled = false;
    function loop() {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      rafScheduled = false;
      if (Math.abs(tx - rx) > 0.1 || Math.abs(ty - ry) > 0.1) {
        rafScheduled = true;
        requestAnimationFrame(loop);
      }
    }
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      dot.style.left = tx + 'px';
      dot.style.top = ty + 'px';
      if (!rafScheduled) { rafScheduled = true; requestAnimationFrame(loop); }
    });

    /* Hover state on interactive elements */
    var hoverSel = 'a,button,input,textarea,select,label,[role="button"],[role="link"],' +
                   '.svc-card,.rm-card,.rv-card,.di-stat,.bf-info,.gal-card,.blog-card,' +
                   '.pkg-card,.course-card,.site-tile,.marine-tile,.equip-item';
    document.querySelectorAll(hoverSel).forEach(function (el) {
      el.addEventListener('mouseenter', function () { document.body.classList.add('cur-hover'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('cur-hover'); });
    });
    document.addEventListener('mousedown', function () { document.body.classList.add('cur-click'); });
    document.addEventListener('mouseup', function () { document.body.classList.remove('cur-click'); });
  })();

})();
