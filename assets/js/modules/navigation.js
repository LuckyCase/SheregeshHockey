/**
 * navigation.js — sticky header, mobile menu, smooth scroll, back-to-top, scroll progress
 */
(function () {
  'use strict';

  var HEADER_STICKY_CLASS = 'header--sticky';
  var BURGER_OPEN_CLASS = 'burger--open';
  var MENU_OPEN_CLASS = 'mobile-menu--open';
  var BACKDROP_VISIBLE_CLASS = 'mobile-menu__backdrop--visible';

  var U = window.SheregeshUtils || {};
  var getLang = U.getLang;

  var LABELS = {
    ru: { open: 'Открыть меню', close: 'Закрыть меню' },
    en: { open: 'Open menu', close: 'Close menu' }
  };

  var header = document.getElementById('header');
  var burger = document.querySelector('.burger');
  var mobileMenu = document.getElementById('mobile-menu');
  var backdrop = document.getElementById('mobile-menu-backdrop');
  var mobileLinks = document.querySelectorAll('.mobile-menu__link');

  var stickyThreshold = 80;
  var backToTopThreshold = 400;

  function updateStickyHeader(y) {
    if (!header) return;
    if (y > stickyThreshold) {
      header.classList.add(HEADER_STICKY_CLASS);
    } else {
      header.classList.remove(HEADER_STICKY_CLASS);
    }
  }

  function openMenu() {
    if (!burger || !mobileMenu || !backdrop) return;
    var lang = getLang();
    var l = LABELS[lang] || LABELS.ru;
    burger.classList.add(BURGER_OPEN_CLASS);
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', l.close);
    mobileMenu.classList.add(MENU_OPEN_CLASS);
    mobileMenu.setAttribute('aria-hidden', 'false');
    backdrop.classList.add(BACKDROP_VISIBLE_CLASS);
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!burger || !mobileMenu || !backdrop) return;
    var lang = getLang();
    var l = LABELS[lang] || LABELS.ru;
    burger.classList.remove(BURGER_OPEN_CLASS);
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', l.open);
    mobileMenu.classList.remove(MENU_OPEN_CLASS);
    mobileMenu.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove(BACKDROP_VISIBLE_CLASS);
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initMobileMenu() {
    if (!burger || !mobileMenu) return;

    burger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains(MENU_OPEN_CLASS);
      if (isOpen) closeMenu();
      else openMenu();
    });

    backdrop.addEventListener('click', closeMenu);

    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains(MENU_OPEN_CLASS)) {
        closeMenu();
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      var href = anchor.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;

      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  var backToTopBtn = null;

  function updateBackToTop(y) {
    if (!backToTopBtn) return;
    backToTopBtn.classList.toggle('back-to-top--visible', y > backToTopThreshold);
  }

  function initBackToTop() {
    backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var progressBar = null;

  function updateScrollProgress(y) {
    if (!progressBar) return;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  function initScrollProgress() {
    progressBar = document.getElementById('scroll-progress');
  }

  function initUnifiedScrollListener() {
    var ticking = false;

    function handleScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        updateStickyHeader(y);
        updateBackToTop(y);
        updateScrollProgress(y);
        ticking = false;
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  function init() {
    initMobileMenu();
    initSmoothScroll();
    initBackToTop();
    initScrollProgress();
    initUnifiedScrollListener();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
