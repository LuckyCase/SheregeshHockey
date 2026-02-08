/**
 * animations.js — IntersectionObserver scroll-reveal (fade-up, fade-in, slide-left/right), prefers-reduced-motion
 */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function reveal(entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }

  function initReveal() {
    if (REDUCED) {
      document.querySelectorAll('[data-animate]').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    const observer = new IntersectionObserver(reveal, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });
    document.querySelectorAll('[data-animate]').forEach(function (el) {
      observer.observe(el);
    });
  }

  function AnimationsReveal() {
    if (REDUCED) return;
    var els = document.querySelectorAll('.timeline__event[data-animate]');
    var observer = new IntersectionObserver(reveal, { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.1 });
    els.forEach(function (el) { observer.observe(el); });
  }

  window.AnimationsReveal = AnimationsReveal;

  function init() {
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
