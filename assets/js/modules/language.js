/**
 * language.js — detect language (URL / localStorage / navigator), switcher redirect, store choice
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'sheregesh-lang';

  function getLangFromPath() {
    var path = (window.location.pathname || '').replace(/\/$/, '');
    if (path.indexOf('/en/') !== -1 || path === '/en' || path.endsWith('/en')) return 'en';
    if (path.indexOf('/ru/') !== -1 || path === '/ru' || path.endsWith('/ru')) return 'ru';
    return null;
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

  /** Base path when site is in subpath (e.g. /SheregeshHockey on GitHub Pages) */
  function getBasePath() {
    var path = (window.location.pathname || '/').replace(/\/$/, '');
    var segments = path.split('/').filter(Boolean);
    if (segments[0] && segments[0] !== 'en' && segments[0] !== 'ru' && segments[0] !== 'index.html') {
      return '/' + segments[0];
    }
    return '';
  }

  function getAlternateUrl(lang) {
    var path = (window.location.pathname || '/').replace(/\/$/, '') || '/';
    var origin = window.location.origin || '';
    var base = getBasePath();
    var pathRel = base ? path.slice(base.length) || '/' : path;
    var search = (window.location.search || '').trim();
    var isStory = pathRel.indexOf('story.html') !== -1;
    var appendSearch = isStory && search ? search : '';
    var url;
    if (lang === 'en') {
      if (pathRel === '/' || pathRel === '' || pathRel === '/index.html') url = origin + base + '/en/index.html';
      else if (pathRel.indexOf('/en/') === 0 || pathRel === '/en') url = window.location.href;
      else if (pathRel.indexOf('/ru/') === 0) url = origin + base + '/en/' + pathRel.slice(4);
      else url = origin + base + '/en/index.html';
    } else {
      if (pathRel === '/en' || pathRel === '/en/' || pathRel === '/en/index.html') url = origin + base + '/index.html';
      else if (pathRel.indexOf('/en/') === 0) url = origin + base + '/ru/' + pathRel.slice(5);
      else url = origin + base + '/index.html';
    }
    return url + appendSearch;
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
