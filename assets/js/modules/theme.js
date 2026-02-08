/**
 * theme.js — light/dark theme toggle, persisted in localStorage
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'sheregesh-theme';

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
      btn.setAttribute('aria-label', isLight()
        ? 'Switch to dark theme'
        : 'Switch to light theme');
      btn.addEventListener('click', function () {
        var next = !isLight();
        applyTheme(next);
        btn.setAttribute('aria-pressed', next ? 'true' : 'false');
        btn.setAttribute('aria-label', next ? 'Switch to dark theme' : 'Switch to light theme');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
