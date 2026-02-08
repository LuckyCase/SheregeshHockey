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
  window.scrollTo(0, 0);

  // On bfcache restore, scroll to top
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) window.scrollTo(0, 0);
  });
})();
