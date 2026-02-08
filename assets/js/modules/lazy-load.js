/**
 * lazy-load.js — IntersectionObserver for images (data-src → src)
 */
(function () {
  'use strict';

  var observer = null;

  function loadImage(img) {
    var src = img.getAttribute('data-src');
    if (!src) return;
    img.src = src;
    img.removeAttribute('data-src');
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      img.removeAttribute('data-srcset');
    }
    img.classList.add('lazy-loaded');
  }

  function observeImages() {
    var images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          loadImage(entry.target);
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '100px 0px', threshold: 0.01 });
    }
    images.forEach(function (img) { observer.observe(img); });
  }

  function init() {
    observeImages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
