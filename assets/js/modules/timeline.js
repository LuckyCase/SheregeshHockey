/**
 * timeline.js — load timeline data, switch decades, render event cards, keyboard nav
 */
(function () {
  'use strict';

  function getDataPath() {
    var script = document.querySelector('script[src*="timeline"]');
    var src = (script && script.getAttribute('src')) || '';
    var dir = src.replace(/\/[^/]*$/, '/');
    return (dir ? dir + '../' : 'assets/js/') + 'data/timeline-data.json';
  }
  const DATA_URL = getDataPath();
  const DECADES = ['1970s', '1980s', '1990s'];

  let timelineData = null;
  let currentDecade = '1970s';
  let currentIndex = 0;

  function getLang() {
    const path = window.location.pathname || '';
    if (path.indexOf('/en/') !== -1) return 'en';
    if (typeof window.__SheregeshLang !== 'undefined') return window.__SheregeshLang;
    try {
      const stored = localStorage.getItem('sheregesh-lang');
      if (stored === 'en') return 'en';
    } catch (e) {}
    return 'ru';
  }

  function getContainer() {
    return document.querySelector('[data-timeline]');
  }

  function getCardsContainer() {
    return document.querySelector('[data-timeline-cards]');
  }

  function getButtons() {
    const container = getContainer();
    return container ? container.querySelectorAll('.timeline__decade-btn') : [];
  }

  function renderEvent(event, lang) {
    const title = lang === 'en' ? (event.titleEn || event.titleRu) : (event.titleRu || event.titleEn);
    const text = lang === 'en' ? event.en : event.ru;
    const imgSrc = event.image || '';
    const imgAlt = title;
    return (
      '<article class="timeline__event" data-animate>'
        + '<span class="timeline__event-year">' + escapeHtml(event.year) + '</span>'
        + '<div class="timeline__event-card">'
          + '<h3 class="timeline__event-title">' + escapeHtml(title) + '</h3>'
          + '<p class="timeline__event-text">' + escapeHtml(text) + '</p>'
          + (imgSrc ? '<img class="timeline__event-image" src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(imgAlt) + '" loading="lazy">' : '')
        + '</div>'
      + '</article>'
    );
  }

  function escapeHtml(s) {
    if (!s) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderDecadePanel(decade, lang) {
    const events = timelineData && timelineData[decade] ? timelineData[decade] : [];
    const html = events.map(function (ev) { return renderEvent(ev, lang); }).join('');
    return (
      '<div class="timeline__events' + (decade === currentDecade ? ' timeline__events--active' : '') + '" data-decade="' + escapeHtml(decade) + '" role="tabpanel" aria-labelledby="timeline-tab-' + decade + '">'
        + '<div class="timeline__event-list">' + html + '</div>'
      + '</div>'
    );
  }

  function renderAllPanels() {
    const container = getCardsContainer();
    if (!container || !timelineData) return;
    const lang = getLang();
    const panelsHtml = DECADES.map(function (d) { return renderDecadePanel(d, lang); }).join('');
    container.innerHTML = panelsHtml;
    // Add id to tabs for aria-labelledby
    getButtons().forEach(function (btn, i) {
      btn.id = 'timeline-tab-' + DECADES[i];
    });
    if (typeof window.AnimationsReveal === 'function') {
      window.AnimationsReveal();
    }
  }

  function setActiveDecade(decade) {
    currentDecade = decade;
    const container = getCardsContainer();
    if (!container) return;
    const panels = container.querySelectorAll('.timeline__events');
    const buttons = getButtons();
    panels.forEach(function (panel) {
      const isActive = panel.getAttribute('data-decade') === decade;
      panel.classList.toggle('timeline__events--active', isActive);
      panel.setAttribute('aria-hidden', !isActive);
    });
    buttons.forEach(function (btn, i) {
      const isActive = DECADES[i] === decade;
      btn.classList.toggle('timeline__decade-btn--active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    currentIndex = DECADES.indexOf(decade);
    if (typeof window.AnimationsReveal === 'function') {
      window.AnimationsReveal();
    }
  }

  function handleDecadeClick(e) {
    const btn = e.target.closest('.timeline__decade-btn');
    if (!btn) return;
    const decade = btn.getAttribute('data-decade');
    if (decade) setActiveDecade(decade);
  }

  function handleKeydown(e) {
    const container = getContainer();
    if (!container || !container.contains(document.activeElement)) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      currentIndex = Math.max(0, currentIndex - 1);
      setActiveDecade(DECADES[currentIndex]);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      currentIndex = Math.min(DECADES.length - 1, currentIndex + 1);
      setActiveDecade(DECADES[currentIndex]);
    }
  }

  function fetchData() {
    return fetch(DATA_URL)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('Timeline load failed')); })
      .then(function (data) {
        timelineData = data;
        renderAllPanels();
      })
      .catch(function () {
        getCardsContainer().innerHTML = '<p class="section__subtitle">Не удалось загрузить хронологию.</p>';
      });
  }

  function init() {
    const container = getContainer();
    if (!container) return;
    const nav = container.querySelector('.timeline__nav');
    if (nav) {
      nav.addEventListener('click', handleDecadeClick);
      nav.addEventListener('keydown', handleKeydown);
    }
    fetchData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TimelineSetLang = function () {
    if (timelineData) renderAllPanels();
  };
})();
