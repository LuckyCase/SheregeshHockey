/**
 * Mode Switch — History / Today toggle
 * Manages active state, body class, and localStorage persistence.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'sheregesh-mode'; // 'history' | 'today'

  /**
   * Detect current mode from body class or page path.
   */
  function detectMode() {
    if (document.body.classList.contains('mode-today')) return 'today';
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf('today') !== -1) return 'today';
    return 'history';
  }

  /**
   * Update all mode-switch widgets on the page to reflect active state.
   */
  function syncSwitches(mode) {
    var widgets = document.querySelectorAll('.mode-switch');
    widgets.forEach(function (widget) {
      var btns = widget.querySelectorAll('.mode-switch__btn');
      var isToday = mode === 'today';

      widget.classList.toggle('mode-switch--today', isToday);

      btns.forEach(function (btn) {
        var href = (btn.getAttribute('href') || '').toLowerCase();
        var isTodayBtn = href.indexOf('today') !== -1;
        var isActive = (isToday && isTodayBtn) || (!isToday && !isTodayBtn);

        btn.classList.toggle('mode-switch__btn--active', isActive);
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    });
  }

  function init() {
    var mode = detectMode();

    // Persist
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) { /* noop */ }

    // Apply body class if needed
    if (mode === 'today' && !document.body.classList.contains('mode-today')) {
      document.body.classList.add('mode-today');
    }

    syncSwitches(mode);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
