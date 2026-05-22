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
    /* OS theme change listener removed — site always defaults to night
       unless the user manually toggles to day (saved in localStorage). */
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

  /* ── CURSOR RIPPLE & TRAIL (canvas) ───────────────────── */
  (function () {
    /* Skip on touch / coarse-pointer devices */
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    /* Don't create a second canvas if a page already has one inline */
    if (document.querySelector('canvas[data-ce-cursor]')) return;

    var cvs = document.createElement('canvas');
    cvs.setAttribute('data-ce-cursor', '1');
    cvs.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99998;mix-blend-mode:screen;';
    if (document.body) document.body.appendChild(cvs);
    else {
      document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(cvs); });
    }
    var ctx = cvs.getContext('2d');
    var W, H;
    function resize() { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    var ripples = [], particles = [];
    var mx = -999, my = -999;

    window.addEventListener('click', function (e) {
      var x = e.clientX, y = e.clientY;
      ripples.push({ x: x, y: y, r: 0, maxR: 12, alpha: 1, speed: 7, type: 'flash', delay: 0 });
      [{ maxR: 60, speed: 3.2, alpha: .9, delay: 0 },
       { maxR: 105, speed: 5, alpha: .7, delay: 4 },
       { maxR: 155, speed: 7, alpha: .5, delay: 9 },
       { maxR: 220, speed: 9, alpha: .3, delay: 15 }].forEach(function (cfg) {
        ripples.push({ x: x, y: y, r: 0, type: 'ring', maxR: cfg.maxR, speed: cfg.speed, alpha: cfg.alpha, delay: cfg.delay });
      });
      for (var i = 0; i < 18; i++) {
        var ang = (i / 18) * Math.PI * 2, spd = 2 + Math.random() * 4;
        particles.push({ x: x, y: y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 2 + Math.random() * 2, life: 1, decay: .022 + Math.random() * .018, trail: false });
      }
      for (var j = 0; j < 8; j++) {
        particles.push({ x: x, y: y, vx: (Math.random() - .5) * 2, vy: (Math.random() - .5) * 2 - 1, r: 1.5, life: 1, decay: .05 + Math.random() * .04, trail: false });
      }
    });

    window.addEventListener('mousemove', function (e) {
      var dx = e.clientX - mx, dy = e.clientY - my;
      if (dx * dx + dy * dy > 50) {
        mx = e.clientX; my = e.clientY;
        for (var i = 0; i < 4; i++) {
          particles.push({
            x: mx + (Math.random() - .5) * 6,
            y: my + (Math.random() - .5) * 6,
            vx: (Math.random() - .5) * .5,
            vy: (Math.random() - .5) * .5 - .5,
            r: 1 + Math.random() * 2.5,
            life: 1,
            decay: .045 + Math.random() * .03,
            trail: true
          });
        }
      }
    });

    function loop() {
      ctx.clearRect(0, 0, W, H);
      for (var i = ripples.length - 1; i >= 0; i--) {
        var rp = ripples[i];
        if (rp.delay > 0) { rp.delay--; continue; }
        rp.r += rp.speed;
        var prog = rp.r / rp.maxR;
        if (prog >= 1) { ripples.splice(i, 1); continue; }
        if (rp.type === 'flash') {
          var a = rp.alpha * (1 - prog);
          var grd = ctx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, rp.r);
          grd.addColorStop(0, 'rgba(180,240,255,' + a + ')');
          grd.addColorStop(.5, 'rgba(77,194,232,' + (a * .6) + ')');
          grd.addColorStop(1, 'rgba(77,194,232,0)');
          ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
        } else {
          var ease = 1 - prog * prog, ringA = rp.alpha * ease;
          ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(77,194,232,' + ringA + ')';
          ctx.lineWidth = Math.max(2.5 * (1 - prog * .7), .5); ctx.stroke();
          if (rp.r > 20) {
            ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r * .65, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(140,220,248,' + (ringA * .35) + ')';
            ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      for (var k = particles.length - 1; k >= 0; k--) {
        var p = particles[k];
        p.x += p.vx; p.y += p.vy;
        if (!p.trail) p.vy += .06;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(k, 1); continue; }
        var pa = p.life * (p.trail ? .55 : .85), pr = Math.max(p.r * p.life, .3);
        var pgrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 2.5);
        pgrd.addColorStop(0, 'rgba(190,245,255,' + pa + ')');
        pgrd.addColorStop(.4, 'rgba(77,194,232,' + (pa * .7) + ')');
        pgrd.addColorStop(1, 'rgba(77,194,232,0)');
        ctx.beginPath(); ctx.arc(p.x, p.y, pr * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = pgrd; ctx.fill();
      }
      requestAnimationFrame(loop);
    }
    loop();
  })();

})();
