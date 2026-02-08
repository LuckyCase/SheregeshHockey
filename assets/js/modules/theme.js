/**
 * theme.js — light/dark theme toggle, persisted in localStorage
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'sheregesh-theme';

  var LABELS = {
    ru: { toDark: 'Переключить на тёмную тему', toLight: 'Переключить на светлую тему' },
    en: { toDark: 'Switch to dark theme', toLight: 'Switch to light theme' }
  };

  function getLang() {
    var path = window.location.pathname || '';
    if (path.indexOf('/en/') !== -1) return 'en';
    if (typeof window.__SheregeshLang !== 'undefined') return window.__SheregeshLang;
    return 'ru';
  }

  function getLabel(isCurrentlyLight) {
    var lang = getLang();
    var l = LABELS[lang] || LABELS.ru;
    return isCurrentlyLight ? l.toDark : l.toLight;
  }

  function getStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStored(value) {
    try {
      if (value) localStorage.setItem(STORAGE_KEY, value);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function isLight() {
    return document.documentElement.classList.contains('theme-light');
  }

  function applyTheme(light) {
    if (light) {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
    setStored(light ? 'light' : null);
  }

  function init() {
    var stored = getStored();
    if (stored === 'light') applyTheme(true);

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', isLight() ? 'true' : 'false');
      btn.setAttribute('aria-label', getLabel(isLight()));
      btn.setAttribute('title', getLabel(isLight()));
      btn.addEventListener('click', function () {
        var next = !isLight();
        applyTheme(next);
        btn.setAttribute('aria-pressed', next ? 'true' : 'false');
        btn.setAttribute('aria-label', getLabel(next));
        btn.setAttribute('title', getLabel(next));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
