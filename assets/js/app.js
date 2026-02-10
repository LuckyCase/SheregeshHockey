/**
 * Sheregesh Hockey — main app entry
 * Scroll restoration handling.
 */
(function () {
  'use strict';

  // Disable scroll restoration on reload (prevents mobile scroll offset issues)
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  // Прокрутить в начало только если нет хэша (при переключении языка хэш сохраняется)
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

  // On bfcache restore, scroll to top (only without hash)
  window.addEventListener('pageshow', function (event) {
    if (event.persisted && !window.location.hash) window.scrollTo(0, 0);
  });
})();
