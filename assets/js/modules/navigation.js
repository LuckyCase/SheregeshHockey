/**
 * navigation.js — sticky header, mobile menu, smooth scroll
 */
(function () {
  'use strict';

  var HEADER_STICKY_CLASS = 'header--sticky';
  var BURGER_OPEN_CLASS = 'burger--open';
  var MENU_OPEN_CLASS = 'mobile-menu--open';
  var BACKDROP_VISIBLE_CLASS = 'mobile-menu__backdrop--visible';

  var LABELS = {
    ru: { open: 'Открыть меню', close: 'Закрыть меню' },
    en: { open: 'Open menu', close: 'Close menu' }
  };

  function getLang() {
    var path = window.location.pathname || '';
    if (path.indexOf('/en/') !== -1) return 'en';
    if (typeof window.__SheregeshLang !== 'undefined') return window.__SheregeshLang;
    return 'ru';
  }

  var header = document.getElementById('header');
  var burger = document.querySelector('.burger');
  var mobileMenu = document.getElementById('mobile-menu');
  var backdrop = document.getElementById('mobile-menu-backdrop');
  var mobileLinks = document.querySelectorAll('.mobile-menu__link');

  function initStickyHeader() {
    if (!header) return;
    var threshold = 80;

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (y > threshold) {
        header.classList.add(HEADER_STICKY_CLASS);
      } else {
        header.classList.remove(HEADER_STICKY_CLASS);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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

  function init() {
    initStickyHeader();
    initMobileMenu();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
