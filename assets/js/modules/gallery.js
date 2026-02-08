/**
 * gallery.js — load gallery data, render masonry-style grid, filters by decade
 */
(function () {
  'use strict';

  function getDataPath() {
    var script = document.querySelector('script[src*="gallery"]');
    var src = (script && script.getAttribute('src')) || '';
    var dir = src.replace(/\/[^/]*$/, '/');
    return (dir ? dir + '../' : 'assets/js/') + 'data/gallery-data.json';
  }
  const DATA_URL = getDataPath();
  const FILTER_ALL = 'all';
  const DECADE_LABELS_RU = { 'all': 'Все', '1970s': '1970-е', '1980s': '1980-е', '1990s': '1990-е', 'teams': 'Команды' };
  const DECADE_LABELS_EN = { 'all': 'All', '1970s': '1970s', '1980s': '1980s', '1990s': '1990s', 'teams': 'Teams' };

  let galleryData = [];
  let currentFilter = FILTER_ALL;

  /** Префикс для путей к картинкам: на страницах en/ и ru/ нужен ../ */
  function getAssetPrefix() {
    var path = window.location.pathname || '';
    return (path.indexOf('/en/') !== -1 || path.indexOf('/ru/') !== -1) ? '../' : '';
  }

  function getLang() {
    var path = window.location.pathname || '';
    if (path.indexOf('/en/') !== -1) return 'en';
    if (typeof window.__SheregeshLang !== 'undefined') return window.__SheregeshLang;
    try {
      if (localStorage.getItem('sheregesh-lang') === 'en') return 'en';
    } catch (e) {}
    return 'ru';
  }

  function getContainer() {
    return document.querySelector('[data-gallery]');
  }

  function getFiltersEl() {
    return document.querySelector('[data-gallery-filters]');
  }

  function getGridEl() {
    return document.querySelector('[data-gallery-grid]');
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderFilters(lang) {
    var labels = lang === 'en' ? DECADE_LABELS_EN : DECADE_LABELS_RU;
    var filters = [
      { value: 'all', label: labels.all },
      { value: '1970s', label: labels['1970s'] },
      { value: '1980s', label: labels['1980s'] },
      { value: '1990s', label: labels['1990s'] },
      { value: 'teams', label: labels.teams }
    ];
    return filters.map(function (f) {
      var active = f.value === currentFilter ? ' gallery__filter-btn--active' : '';
      return '<button type="button" class="gallery__filter-btn' + active + '" data-filter="' + escapeHtml(f.value) + '">' + escapeHtml(f.label) + '</button>';
    }).join('');
  }

  function renderItem(item, index, lang) {
    var caption = lang === 'en' ? (item.caption.en || item.caption.ru) : (item.caption.ru || item.caption.en);
    var alt = lang === 'en' ? (item.alt && item.alt.en) || caption : (item.alt && item.alt.ru) || caption;
    var decade = item.decade || 'all';
    var imgSrc = getAssetPrefix() + (item.src || '');
    return (
      '<div class="gallery__item" data-decade="' + escapeHtml(decade) + '" data-index="' + index + '" tabindex="0" role="button">'
        + '<img src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(alt) + '" loading="lazy">'
        + '<div class="gallery__item-overlay">'
          + '<span class="gallery__item-caption">' + escapeHtml(caption) + '</span>'
          + '<span class="gallery__item-year">' + escapeHtml(decade) + '</span>'
        + '</div>'
      + '</div>'
    );
  }

  function applyFilter(filterValue) {
    currentFilter = filterValue;
    var grid = getGridEl();
    var items = grid ? grid.querySelectorAll('.gallery__item') : [];
    items.forEach(function (item) {
      var decade = item.getAttribute('data-decade');
      var show = filterValue === FILTER_ALL || decade === filterValue;
      item.classList.toggle('gallery__item--hidden', !show);
    });
    var btns = getFiltersEl() ? getFiltersEl().querySelectorAll('.gallery__filter-btn') : [];
    btns.forEach(function (btn) {
      btn.classList.toggle('gallery__filter-btn--active', btn.getAttribute('data-filter') === filterValue);
    });
  }

  function openLightbox(index) {
    if (typeof window.LightboxOpen === 'function') {
      window.LightboxOpen(index, galleryData, currentFilter);
    }
  }

  function bindEvents() {
    var filtersEl = getFiltersEl();
    var gridEl = getGridEl();
    if (filtersEl) {
      filtersEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.gallery__filter-btn');
        if (!btn) return;
        applyFilter(btn.getAttribute('data-filter'));
      });
    }
    if (gridEl) {
      gridEl.addEventListener('click', function (e) {
        var item = e.target.closest('.gallery__item');
        if (!item || item.classList.contains('gallery__item--hidden')) return;
        var index = parseInt(item.getAttribute('data-index'), 10);
        if (!isNaN(index)) openLightbox(index);
      });
      gridEl.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var item = e.target.closest('.gallery__item');
        if (!item || item.classList.contains('gallery__item--hidden')) return;
        e.preventDefault();
        var index = parseInt(item.getAttribute('data-index'), 10);
        if (!isNaN(index)) openLightbox(index);
      });
    }
  }

  function render() {
    var filtersEl = getFiltersEl();
    var gridEl = getGridEl();
    if (!filtersEl || !gridEl) return;
    var lang = getLang();
    filtersEl.innerHTML = renderFilters(lang);
    gridEl.innerHTML = galleryData.map(function (item, i) { return renderItem(item, i, lang); }).join('');
    applyFilter(currentFilter);
    bindEvents();
  }

  function fetchData() {
    fetch(DATA_URL)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('Gallery load failed')); })
      .then(function (data) {
        galleryData = data;
        render();
      })
      .catch(function () {
        var grid = getGridEl();
        if (grid) grid.innerHTML = '<p class="section__subtitle">Не удалось загрузить галерею.</p>';
      });
  }

  function init() {
    var container = getContainer();
    if (!container) return;
    fetchData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.GallerySetLang = function () {
    if (galleryData.length) render();
  };
})();
