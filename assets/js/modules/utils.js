/**
 * utils.js — shared utility functions for Sheregesh Hockey modules
 */
(function () {
  'use strict';

  /**
   * Returns '../' when the page is inside /en/ or /ru/ subdirectory,
   * so asset paths resolve correctly from sub-pages.
   */
  function getAssetPrefix() {
    var path = window.location.pathname || '';
    return (path.indexOf('/en/') !== -1 || path.indexOf('/ru/') !== -1) ? '../' : '';
  }

  /**
   * Determines the current language: URL path > global variable > localStorage > 'ru' default.
   */
  function getLang() {
    var path = window.location.pathname || '';
    if (path.indexOf('/en/') !== -1) return 'en';
    if (typeof window.__SheregeshLang !== 'undefined') return window.__SheregeshLang;
    try {
      var stored = localStorage.getItem('sheregesh-lang');
      if (stored === 'en') return 'en';
    } catch (e) {}
    return 'ru';
  }

  /**
   * Escapes HTML special characters in a string to prevent XSS.
   */
  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  window.SheregeshUtils = {
    getAssetPrefix: getAssetPrefix,
    getLang: getLang,
    escapeHtml: escapeHtml
  };
})();
