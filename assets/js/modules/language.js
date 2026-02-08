/**
 * language.js — detect language (URL / localStorage / navigator), switcher redirect, store choice
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'sheregesh-lang';

  function getLangFromPath() {
    var path = (window.location.pathname || '').replace(/\/$/, '');
    if (path.indexOf('/en/') === 0 || path === '/en') return 'en';
    return 'ru';
  }

  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function getNavigatorLang() {
    var n = navigator.language || navigator.userLanguage || '';
    return (n.indexOf('en') === 0) ? 'en' : 'ru';
  }

  function getCurrentLang() {
    var fromPath = getLangFromPath();
    if (fromPath) return fromPath;
    var stored = getStoredLang();
    if (stored === 'en' || stored === 'ru') return stored;
    return getNavigatorLang();
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function setGlobalLang(lang) {
    window.__SheregeshLang = lang;
  }

  function getAlternateUrl(lang) {
    var path = (window.location.pathname || '/');
    var origin = window.location.origin || '';
    if (lang === 'en') {
      if (path === '/' || path === '' || path === '/index.html') return origin + '/en/index.html';
      if (path.indexOf('/en/') === 0) return window.location.href;
      if (path.indexOf('/ru/') === 0) return origin + '/en/' + path.slice(4);
      return origin + '/en/index.html';
    } else {
      if (path === '/en' || path === '/en/' || path === '/en/index.html') return origin + '/index.html';
      if (path.indexOf('/en/') === 0) return origin + '/ru/' + path.slice(5);
      return origin + '/index.html';
    }
  }

  function switchTo(lang) {
    setStoredLang(lang);
    setGlobalLang(lang);
    var url = getAlternateUrl(lang);
    if (url && url !== window.location.href) window.location.href = url;
  }

  function initSwitcher() {
    var lang = getCurrentLang();
    setGlobalLang(lang);

    document.querySelectorAll('.lang-switch').forEach(function (group) {
      var ruBtn = group.querySelector('a[href*="index.html"], a[href="/"], a[href="decade-"], a[href="story.html"]');
      var btns = group.querySelectorAll('.lang-switch__btn');
      btns.forEach(function (btn) {
        btn.classList.remove('lang-switch__btn--active');
        btn.removeAttribute('aria-current');
        var isRu = btn.getAttribute('lang') === 'ru' || (btn.getAttribute('hreflang') === 'ru');
        var isEn = btn.getAttribute('lang') === 'en' || (btn.getAttribute('hreflang') === 'en');
        if (lang === 'ru' && isRu) {
          btn.classList.add('lang-switch__btn--active');
          btn.setAttribute('aria-current', 'page');
        }
        if (lang === 'en' && isEn) {
          btn.classList.add('lang-switch__btn--active');
          btn.setAttribute('aria-current', 'page');
        }
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          switchTo(isEn ? 'en' : 'ru');
        });
      });
    });
  }

  function init() {
    initSwitcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
