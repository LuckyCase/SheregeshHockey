/**
 * timeline.js — load timeline data, switch decades, render event cards, keyboard nav
 */
(function () {
  'use strict';

  var U = window.SheregeshUtils || {};

  function getDataPath() {
    var script = document.querySelector('script[src*="timeline"]');
    var src = (script && script.getAttribute('src')) || '';
    var dir = src.replace(/\/[^/]*$/, '/');
    return (dir ? dir + '../' : 'assets/js/') + 'data/timeline-data.json';
  }
  var DATA_URL = getDataPath();
  var DECADES = ['1970s', '1980s', '1990s'];

  var timelineData = null;
  var currentDecade = '1970s';
  var currentIndex = 0;

  function getAssetPrefix() {
    return U.getAssetPrefix ? U.getAssetPrefix() : '';
  }

  function getLang() {
    return U.getLang ? U.getLang() : 'ru';
  }

  function escapeHtml(s) {
    return U.escapeHtml ? U.escapeHtml(s) : (s || '');
  }

  function getContainer() {
    return document.querySelector('[data-timeline]');
  }

  function getCardsContainer() {
    return document.querySelector('[data-timeline-cards]');
  }

  function getButtons() {
    var container = getContainer();
    return container ? container.querySelectorAll('.timeline__decade-btn') : [];
  }

  function renderEvent(event, lang) {
    var title = lang === 'en' ? (event.titleEn || event.titleRu) : (event.titleRu || event.titleEn);
    var text = lang === 'en' ? event.en : event.ru;
    var imgSrc = event.image ? getAssetPrefix() + event.image : '';
    var imgAlt = title;
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

  function renderDecadePanel(decade, lang) {
    var events = timelineData && timelineData[decade] ? timelineData[decade] : [];
    var html = events.map(function (ev) { return renderEvent(ev, lang); }).join('');
    return (
      '<div class="timeline__events' + (decade === currentDecade ? ' timeline__events--active' : '') + '" data-decade="' + escapeHtml(decade) + '" role="tabpanel" aria-labelledby="timeline-tab-' + decade + '">'
        + '<div class="timeline__event-list">' + html + '</div>'
      + '</div>'
    );
  }

  function renderAllPanels() {
    var container = getCardsContainer();
    if (!container || !timelineData) return;
    var lang = getLang();
    var panelsHtml = DECADES.map(function (d) { return renderDecadePanel(d, lang); }).join('');
    container.innerHTML = panelsHtml;
    getButtons().forEach(function (btn, i) {
      btn.id = 'timeline-tab-' + DECADES[i];
    });
    if (typeof window.AnimationsReveal === 'function') {
      window.AnimationsReveal();
    }
  }

  function setActiveDecade(decade) {
    currentDecade = decade;
    var container = getCardsContainer();
    if (!container) return;
    var panels = container.querySelectorAll('.timeline__events');
    var buttons = getButtons();
    panels.forEach(function (panel) {
      var isActive = panel.getAttribute('data-decade') === decade;
      panel.classList.toggle('timeline__events--active', isActive);
      panel.setAttribute('aria-hidden', !isActive);
    });
    buttons.forEach(function (btn, i) {
      var isActive = DECADES[i] === decade;
      btn.classList.toggle('timeline__decade-btn--active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    currentIndex = DECADES.indexOf(decade);
    if (typeof window.AnimationsReveal === 'function') {
      window.AnimationsReveal();
    }
  }

  function handleDecadeClick(e) {
    var btn = e.target.closest('.timeline__decade-btn');
    if (!btn) return;
    var decade = btn.getAttribute('data-decade');
    if (decade) setActiveDecade(decade);
  }

  function handleKeydown(e) {
    var container = getContainer();
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
        var container = getCardsContainer();
        if (container) {
          var lang = getLang();
          container.innerHTML = '<p class="section__subtitle">' + (lang === 'en' ? 'Failed to load timeline.' : 'Не удалось загрузить хронологию.') + '</p>';
        }
      });
  }

  function init() {
    var container = getContainer();
    if (!container) return;
    var nav = container.querySelector('.timeline__nav');
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
