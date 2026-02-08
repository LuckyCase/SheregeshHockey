/**
 * navigation.js — sticky header, mobile menu, smooth scroll
 */
(function () {
  'use strict';

  const HEADER_STICKY_CLASS = 'header--sticky';
  const BURGER_OPEN_CLASS = 'burger--open';
  const MENU_OPEN_CLASS = 'mobile-menu--open';
  const BACKDROP_VISIBLE_CLASS = 'mobile-menu__backdrop--visible';

  const header = document.getElementById('header');
  const burger = document.querySelector('.burger');
  const mobileMenu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  function initStickyHeader() {
    if (!header) return;
    const threshold = 80;
    let lastScroll = 0;

    function onScroll() {
      const y = window.scrollY || window.pageYOffset;
      if (y > threshold) {
        header.classList.add(HEADER_STICKY_CLASS);
      } else {
        header.classList.remove(HEADER_STICKY_CLASS);
      }
      lastScroll = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function openMenu() {
    if (!burger || !mobileMenu || !backdrop) return;
    burger.classList.add(BURGER_OPEN_CLASS);
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
    mobileMenu.classList.add(MENU_OPEN_CLASS);
    mobileMenu.setAttribute('aria-hidden', 'false');
    backdrop.classList.add(BACKDROP_VISIBLE_CLASS);
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!burger || !mobileMenu || !backdrop) return;
    burger.classList.remove(BURGER_OPEN_CLASS);
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    mobileMenu.classList.remove(MENU_OPEN_CLASS);
    mobileMenu.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove(BACKDROP_VISIBLE_CLASS);
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initMobileMenu() {
    if (!burger || !mobileMenu) return;

    burger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains(MENU_OPEN_CLASS);
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
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
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
