/**
 * Sheregesh Hockey — main app entry
 * Initializes navigation and other modules when DOM is ready.
 */
(function () {
  'use strict';

  function init() {
    // Navigation (sticky header, mobile menu, smooth scroll) — loaded as separate script
    if (typeof window.NavigationInit === 'function') {
      window.NavigationInit();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
