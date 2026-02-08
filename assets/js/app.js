/**
 * Sheregesh Hockey — main app entry
 * Initializes navigation and other modules when DOM is ready.
 */
(function () {
  'use strict';

  // Отключаем восстановление прокрутки при обновлении (на мобильном страница не смещается)
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  function scrollToTop() {
    window.scrollTo(0, 0);
  }

  function init() {
    scrollToTop();
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

  // При возврате из bfcache (в т.ч. после обновления) снова прокручиваем вверх
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) scrollToTop();
  });
})();
