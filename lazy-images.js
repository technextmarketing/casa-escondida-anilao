/* ═════════════════════════════════════════════════════════
   LAZY IMAGE LOADING — Casa Escondida Anilao
   Smooth fade-in for all lazy-loaded images + fallback support
   ═════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Helper: mark an image as visible */
  function reveal(img) {
    if (img.dataset.ceLazyDone === '1') return;
    img.dataset.ceLazyDone = '1';
    img.style.opacity = '1';
    img.style.filter = 'blur(0)';
  }

  /* Process a single <img> element */
  function process(img) {
    /* Skip eager-loaded and already-processed images */
    if (img.loading === 'eager') return;
    if (img.dataset.ceLazyInit === '1') return;
    img.dataset.ceLazyInit = '1';

    /* Initial pre-load styles (fade + slight blur for premium feel) */
    img.style.transition = 'opacity 0.5s ease, filter 0.6s ease';
    if (!img.complete || img.naturalHeight === 0) {
      img.style.opacity = '0';
      img.style.filter = 'blur(4px)';
    }

    /* Reveal once loaded */
    if (img.complete && img.naturalHeight > 0) {
      /* Already cached — reveal immediately, no flash */
      reveal(img);
    } else {
      img.addEventListener('load', function () { reveal(img); }, { once: true });
      img.addEventListener('error', function () { reveal(img); }, { once: true });
    }
  }

  /* Apply to all current lazy images */
  function init() {
    var imgs = document.querySelectorAll('img[loading="lazy"]');
    for (var i = 0; i < imgs.length; i++) process(imgs[i]);
  }

  /* Watch for late-injected images (dynamic galleries, modals, etc.) */
  function watchForNewImages() {
    if (!window.MutationObserver) return;
    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return; /* element nodes only */
          if (node.tagName === 'IMG' && node.loading === 'lazy') {
            process(node);
          } else if (node.querySelectorAll) {
            var lazyInside = node.querySelectorAll('img[loading="lazy"]');
            for (var i = 0; i < lazyInside.length; i++) process(lazyInside[i]);
          }
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init();
      watchForNewImages();
    });
  } else {
    init();
    watchForNewImages();
  }
})();
