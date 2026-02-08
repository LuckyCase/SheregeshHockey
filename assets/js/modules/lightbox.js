/**
 * lightbox.js — fullscreen photo view, prev/next, swipe, Escape, focus trap, counter
 */
(function () {
  'use strict';

  var lightboxEl = null;
  var captionEl = null;
  var imageEl = null;
  var closeBtn = null;
  var prevBtn = null;
  var nextBtn = null;
  var backdropEl = null;
  var counterEl = null;

  var items = [];
  var currentIndex = 0;
  var currentFilter = 'all';
  var startX = 0;

  function getAssetPrefix() {
    if (window.SheregeshUtils && window.SheregeshUtils.getAssetPrefix) {
      return window.SheregeshUtils.getAssetPrefix();
    }
    var path = window.location.pathname || '';
    return (path.indexOf('/en/') !== -1 || path.indexOf('/ru/') !== -1) ? '../' : '';
  }

  function getLang() {
    if (window.SheregeshUtils && window.SheregeshUtils.getLang) {
      return window.SheregeshUtils.getLang();
    }
    var path = window.location.pathname || '';
    if (path.indexOf('/en/') !== -1) return 'en';
    if (typeof window.__SheregeshLang !== 'undefined') return window.__SheregeshLang;
    try {
      if (localStorage.getItem('sheregesh-lang') === 'en') return 'en';
    } catch (e) {}
    return 'ru';
  }

  function getVisibleItems() {
    if (currentFilter === 'all') return items;
    return items.filter(function (item) { return item.decade === currentFilter; });
  }

  function getItemIndex(globalIndex) {
    var visible = getVisibleItems();
    var item = items[globalIndex];
    if (!item) return 0;
    for (var i = 0; i < visible.length; i++) {
      if (visible[i] === item) return i;
    }
    return 0;
  }

  function show() {
    lightboxEl.classList.add('lightbox--open');
    lightboxEl.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    trapFocus();
  }

  function hide() {
    lightboxEl.classList.remove('lightbox--open');
    lightboxEl.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function setContent(index) {
    var visible = getVisibleItems();
    var idx = index >= 0 && index < visible.length ? index : 0;
    currentIndex = idx;
    var item = visible[idx];
    if (!item) return;
    var lang = getLang();
    var caption = lang === 'en' ? (item.caption && item.caption.en) || item.caption.ru : (item.caption && item.caption.ru) || item.caption.en;
    var alt = lang === 'en' ? (item.alt && item.alt.en) || caption : (item.alt && item.alt.ru) || caption;
    imageEl.src = getAssetPrefix() + (item.src || '');
    imageEl.alt = alt || '';
    captionEl.textContent = caption || '';
    // Update counter
    if (counterEl) {
      counterEl.textContent = (idx + 1) + ' / ' + visible.length;
    }
    if (prevBtn) prevBtn.style.visibility = visible.length <= 1 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.style.visibility = visible.length <= 1 ? 'hidden' : 'visible';
  }

  function prev() {
    var visible = getVisibleItems();
    if (visible.length <= 1) return;
    var nextIdx = currentIndex - 1;
    if (nextIdx < 0) nextIdx = visible.length - 1;
    setContent(nextIdx);
  }

  function next() {
    var visible = getVisibleItems();
    if (visible.length <= 1) return;
    var nextIdx = currentIndex + 1;
    if (nextIdx >= visible.length) nextIdx = 0;
    setContent(nextIdx);
  }

  var focusables = [];
  function trapFocus() {
    focusables = lightboxEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusables = Array.prototype.slice.call(focusables);
    if (closeBtn && closeBtn.focus) closeBtn.focus();
    document.addEventListener('keydown', handleKeydown);
  }

  function releaseFocus() {
    document.removeEventListener('keydown', handleKeydown);
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      hide();
      releaseFocus();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
      return;
    }
    if (e.key !== 'Tab') return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function handleBackdropClick(e) {
    if (e.target === backdropEl || e.target === lightboxEl) {
      hide();
      releaseFocus();
    }
  }

  function handleTouchStart(e) {
    startX = e.touches && e.touches[0] ? e.touches[0].clientX : 0;
  }

  function handleTouchEnd(e) {
    var endX = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0;
    var diff = startX - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  }

  window.LightboxOpen = function (clickedIndex, data, filter) {
    items = data || [];
    currentFilter = filter || 'all';
    var visible = getVisibleItems();
    var globalIndex = clickedIndex;
    var item = items[globalIndex];
    var idx = 0;
    for (var i = 0; i < visible.length; i++) {
      if (visible[i] === item) { idx = i; break; }
    }
    setContent(idx);
    show();
  };

  function init() {
    lightboxEl = document.getElementById('lightbox');
    if (!lightboxEl) return;
    captionEl = lightboxEl.querySelector('.lightbox__caption');
    imageEl = lightboxEl.querySelector('.lightbox__image');
    closeBtn = lightboxEl.querySelector('.lightbox__close');
    prevBtn = lightboxEl.querySelector('.lightbox__nav--prev');
    nextBtn = lightboxEl.querySelector('.lightbox__nav--next');
    backdropEl = lightboxEl.querySelector('.lightbox__backdrop');
    counterEl = lightboxEl.querySelector('.lightbox__counter');

    if (closeBtn) closeBtn.addEventListener('click', function () { hide(); releaseFocus(); });
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (backdropEl) backdropEl.addEventListener('click', handleBackdropClick);
    lightboxEl.addEventListener('click', handleBackdropClick);

    lightboxEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    lightboxEl.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
