/**
 * today.js — loads today-data.json and renders News, Announcements,
 * Gallery, Schedule and Roster sections for the "Today / Mustag" pages.
 */
(function () {
  'use strict';

  var U = window.SheregeshUtils || {};
  var getAssetPrefix = U.getAssetPrefix || function () { return (/\/ru\/|\/en\//.test(window.location.pathname || '') ? '../' : ''); };
  var prefix = getAssetPrefix();
  var lang = (U.getLang && U.getLang()) || 'ru';

  function getDataUrl() {
    var script = document.querySelector('script[src*="today"]');
    var src = (script && script.getAttribute('src')) || '';
    var dir = src.replace(/\/[^/]*$/, '/');
    return (dir ? dir + '../' : 'assets/js/') + 'data/today-data.json';
  }
  var esc = U.escapeHtml || function (s) { return s || ''; };

  /* ---- i18n helpers ---- */
  var i18n = {
    ru: {
      pinnedLabel: 'Закреплено',
      readMore: 'Читать полностью →',
      countdown: 'Осталось',
      days: 'д',
      hours: 'ч',
      min: 'м',
      past: 'Событие прошло',
      filterAll: 'Все',
      filterGame: 'Матчи',
      filterTeam: 'Команда',
      filterTraining: 'Тренировки',
      filterFans: 'Болельщики',
      home: 'Дома',
      away: 'Гости',
      upcoming: 'Предстоит',
      win: 'П',
      loss: 'Пр',
      goalie: 'Вратарь',
      defense: 'Защитник',
      forward: 'Нападающий',
      noNews: 'Новостей пока нет.',
      noAnnouncements: 'Анонсов пока нет.',
      noPhotos: 'Фотографий пока нет.',
      noSchedule: 'Расписание пока не заполнено.',
      noRoster: 'Состав пока не заполнен.'
    },
    en: {
      pinnedLabel: 'Pinned',
      readMore: 'Read full story →',
      countdown: 'Starts in',
      days: 'd',
      hours: 'h',
      min: 'm',
      past: 'Event has passed',
      filterAll: 'All',
      filterGame: 'Games',
      filterTeam: 'Team',
      filterTraining: 'Training',
      filterFans: 'Fans',
      home: 'Home',
      away: 'Away',
      upcoming: 'Upcoming',
      win: 'W',
      loss: 'L',
      goalie: 'Goalie',
      defense: 'Defense',
      forward: 'Forward',
      noNews: 'No news yet.',
      noAnnouncements: 'No announcements yet.',
      noPhotos: 'No photos yet.',
      noSchedule: 'Schedule not available yet.',
      noRoster: 'Roster not available yet.'
    }
  };

  var t = i18n[lang] || i18n.ru;

  /* ---- Date formatting ---- */
  function fmtDate(dateStr) {
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (e) { return dateStr; }
  }

  function fmtDateTime(dateStr) {
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return dateStr; }
  }

  function fmtShortDate(dateStr) {
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric', month: 'short'
      });
    } catch (e) { return dateStr; }
  }

  /* ---- Countdown ---- */
  function getCountdown(dateStr) {
    var now = Date.now();
    var target = new Date(dateStr).getTime();
    var diff = target - now;
    if (diff <= 0) return null;
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    return days + t.days + ' ' + hours + t.hours + ' ' + minutes + t.min;
  }

  /* ---- Localized text getter ---- */
  function loc(obj, field) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (field) {
      // obj.titleRu / obj.titleEn
      return obj[field + (lang === 'en' ? 'En' : 'Ru')] || obj[field + 'Ru'] || '';
    }
    // obj = { ru: ..., en: ... }
    return obj[lang] || obj.ru || '';
  }

  /* ==== NEWS MODAL ==== */
  var newsData = null;

  function openNewsModal(item) {
    var modal = document.getElementById('news-modal');
    var body = document.getElementById('news-modal-body');
    if (!modal || !body || !item) return;

    var banner = (item.images && item.images.length)
      ? '<div class="news-modal__banner"><img class="news-modal__image" src="' + prefix + esc(item.images[0]) + '" alt="' + esc(loc(item, 'title')) + '" loading="lazy"></div>'
      : '';
    var pinBadge = item.pinned
      ? '<span class="news-modal__pin">' + t.pinnedLabel + '</span>'
      : '';
    var content = loc(item, 'content');
    var contentHtml = content
      ? '<p class="news-modal__content-text">' + esc(content) + '</p>'
      : '';

    var additionalImages = '';
    if (item.images && item.images.length > 1) {
      additionalImages = '<div class="news-modal__images">';
      for (var i = 1; i < item.images.length; i++) {
        additionalImages += '<img class="news-modal__image-item" src="' + prefix + esc(item.images[i]) + '" alt="" loading="lazy">';
      }
      additionalImages += '</div>';
    }

    body.innerHTML = banner +
      '<div class="news-modal__body">' +
      pinBadge +
      '<time class="news-modal__date" datetime="' + esc(item.date) + '">' + fmtDate(item.date) + '</time>' +
      '<h2 id="news-modal-title" class="news-modal__title">' + esc(loc(item, 'title')) + '</h2>' +
      contentHtml +
      additionalImages +
      '</div>';

    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeNewsModal() {
    var modal = document.getElementById('news-modal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function initNewsModal() {
    var modal = document.getElementById('news-modal');
    if (!modal) return;

    var closeButtons = modal.querySelectorAll('[data-news-close]');
    closeButtons.forEach(function (btn) {
      btn.addEventListener('click', closeNewsModal);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeNewsModal();
      }
    });
  }

  /* ==== RENDER FUNCTIONS ==== */

  function renderNews(data) {
    var el = document.querySelector('[data-today-news]');
    if (!el) return;
    var items = (data.news || []).slice().sort(function (a, b) {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date) - new Date(a.date);
    });
    if (!items.length) { el.innerHTML = '<p class="today-empty">' + t.noNews + '</p>'; return; }
    newsData = items;
    var html = '<div class="today-news__grid">';
    items.forEach(function (item, idx) {
      var img = (item.images && item.images.length)
        ? '<img class="today-news-card__image" src="' + prefix + esc(item.images[0]) + '" alt="" loading="lazy">'
        : '';
      var pinBadge = item.pinned
        ? '<span class="today-news-card__pin">' + t.pinnedLabel + '</span>'
        : '';
      var contentText = loc(item, 'content');
      var textHtml = contentText
        ? '<p class="today-news-card__text">' + esc(contentText) + '</p>'
        : '';
      html += '<article class="today-news-card' + (item.pinned ? ' today-news-card--pinned' : '') + '" data-animate data-news-id="' + idx + '" role="button" tabindex="0" aria-label="' + esc(loc(item, 'title')) + '">';
      html += img;
      html += '<div class="today-news-card__body">';
      html += pinBadge;
      html += '<time class="today-news-card__date" datetime="' + esc(item.date) + '">' + fmtDate(item.date) + '</time>';
      html += '<h3 class="today-news-card__title">' + esc(loc(item, 'title')) + '</h3>';
      html += textHtml;
      html += '<span class="today-news-card__read-more">' + t.readMore + '</span>';
      html += '</div></article>';
    });
    html += '</div>';
    el.innerHTML = html;

    el.querySelectorAll('.today-news-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var idx = parseInt(card.getAttribute('data-news-id'), 10);
        if (!isNaN(idx) && newsData && newsData[idx]) {
          openNewsModal(newsData[idx]);
        }
      });
      card.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        var idx = parseInt(card.getAttribute('data-news-id'), 10);
        if (!isNaN(idx) && newsData && newsData[idx]) {
          openNewsModal(newsData[idx]);
        }
      });
    });
  }

  function renderAnnouncements(data) {
    var el = document.querySelector('[data-today-announcements]');
    if (!el) return;
    var items = (data.announcements || []).slice().sort(function (a, b) {
      return new Date(a.eventDate) - new Date(b.eventDate);
    });
    if (!items.length) { el.innerHTML = '<p class="today-empty">' + t.noAnnouncements + '</p>'; return; }
    var html = '<div class="today-announcements__grid">';
    items.forEach(function (item) {
      var cd = getCountdown(item.eventDate);
      var countdownHtml = cd
        ? '<div class="today-ann-card__countdown"><span class="today-ann-card__countdown-label">' + t.countdown + '</span><span class="today-ann-card__countdown-value">' + cd + '</span></div>'
        : '<div class="today-ann-card__countdown today-ann-card__countdown--past">' + t.past + '</div>';
      html += '<article class="today-ann-card" data-animate>';
      html += '<div class="today-ann-card__header">';
      html += '<time class="today-ann-card__date" datetime="' + esc(item.eventDate) + '">' + fmtDateTime(item.eventDate) + '</time>';
      html += '</div>';
      html += '<h3 class="today-ann-card__title">' + esc(loc(item, 'title')) + '</h3>';
      html += '<p class="today-ann-card__text">' + esc(loc(item, 'content')) + '</p>';
      if (item.location) {
        html += '<p class="today-ann-card__location"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg> ' + esc(loc(item.location)) + '</p>';
      }
      html += countdownHtml;
      html += '</article>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function renderGallery(data) {
    var filtersEl = document.querySelector('[data-today-gallery-filters]');
    var gridEl = document.querySelector('[data-today-gallery-grid]');
    if (!filtersEl || !gridEl) return;
    var items = data.gallery || [];
    if (!items.length) { gridEl.innerHTML = '<p class="today-empty">' + t.noPhotos + '</p>'; return; }

    // Collect categories
    var categories = ['all'];
    items.forEach(function (item) {
      if (item.category && categories.indexOf(item.category) === -1) categories.push(item.category);
    });

    var catLabels = {
      all: t.filterAll, game: t.filterGame, team: t.filterTeam,
      training: t.filterTraining, fans: t.filterFans
    };

    // Render filters
    var fHtml = '';
    categories.forEach(function (cat, idx) {
      fHtml += '<button type="button" class="today-gallery__filter-btn' + (idx === 0 ? ' today-gallery__filter-btn--active' : '') + '" data-filter="' + cat + '">' + (catLabels[cat] || cat) + '</button>';
    });
    filtersEl.innerHTML = fHtml;

    // Render grid
    function renderGrid(filter) {
      var filtered = filter === 'all' ? items : items.filter(function (i) { return i.category === filter; });
      var gHtml = '';
      filtered.forEach(function (item, idx) {
        gHtml += '<figure class="today-gallery__item" data-animate data-index="' + idx + '" tabindex="0" role="button">';
        gHtml += '<img class="today-gallery__image" src="' + prefix + esc(item.src) + '" alt="' + esc(loc(item.alt)) + '" loading="lazy">';
        gHtml += '<figcaption class="today-gallery__caption">' + esc(loc(item.caption)) + '</figcaption>';
        gHtml += '</figure>';
      });
      gridEl.innerHTML = gHtml;

      // Bind lightbox using window.LightboxOpen
      if (typeof window.LightboxOpen === 'function') {
        gridEl.querySelectorAll('.today-gallery__item').forEach(function (item) {
          item.addEventListener('click', function () {
            var idx = parseInt(item.getAttribute('data-index'), 10);
            if (!isNaN(idx)) window.LightboxOpen(idx, filtered, 'all');
          });
          item.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            var idx = parseInt(item.getAttribute('data-index'), 10);
            if (!isNaN(idx)) window.LightboxOpen(idx, filtered, 'all');
          });
        });
      }
    }

    renderGrid('all');

    // Filter clicks
    filtersEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      filtersEl.querySelectorAll('.today-gallery__filter-btn').forEach(function (b) {
        b.classList.remove('today-gallery__filter-btn--active');
      });
      btn.classList.add('today-gallery__filter-btn--active');
      renderGrid(btn.getAttribute('data-filter'));
    });
  }

  function renderSchedule(data) {
    var el = document.querySelector('[data-today-schedule]');
    if (!el) return;
    var items = (data.schedule || []).slice().sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    if (!items.length) { el.innerHTML = '<p class="today-empty">' + t.noSchedule + '</p>'; return; }

    var html = '<div class="today-schedule__table-wrap"><table class="today-schedule__table">';
    html += '<thead><tr>';
    html += '<th>' + (lang === 'ru' ? 'Дата' : 'Date') + '</th>';
    html += '<th>' + (lang === 'ru' ? 'Соперник' : 'Opponent') + '</th>';
    html += '<th>' + (lang === 'ru' ? 'Место' : 'Venue') + '</th>';
    html += '<th>' + (lang === 'ru' ? 'Счёт' : 'Score') + '</th>';
    html += '</tr></thead><tbody>';

    items.forEach(function (item) {
      var isPast = item.result !== null;
      var isFuture = !isPast;
      var rowClass = isFuture ? ' class="today-schedule__row--upcoming"' : '';
      if (isPast && item.result.win) rowClass = ' class="today-schedule__row--win"';
      if (isPast && !item.result.win) rowClass = ' class="today-schedule__row--loss"';

      html += '<tr' + rowClass + '>';
      html += '<td><time datetime="' + esc(item.date) + '">' + fmtShortDate(item.date) + '</time> ' + (item.time || '') + '</td>';
      html += '<td>' + esc(loc(item.opponent)) + '</td>';
      html += '<td>' + esc(loc(item.location)) + '</td>';
      if (isFuture) {
        html += '<td><span class="today-schedule__badge today-schedule__badge--upcoming">' + t.upcoming + '</span></td>';
      } else {
        var badge = item.result.win ? t.win : t.loss;
        var badgeClass = item.result.win ? 'today-schedule__badge--win' : 'today-schedule__badge--loss';
        html += '<td>' + esc(item.result.score) + ' <span class="today-schedule__badge ' + badgeClass + '">' + badge + '</span></td>';
      }
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    el.innerHTML = html;
  }

  function renderRoster(data) {
    var el = document.querySelector('[data-today-roster]');
    if (!el) return;
    var items = (data.roster || []).slice().sort(function (a, b) {
      return a.number - b.number;
    });
    if (!items.length) { el.innerHTML = '<p class="today-empty">' + t.noRoster + '</p>'; return; }

    var posLabels = { goalie: t.goalie, defense: t.defense, forward: t.forward };

    var html = '<div class="today-roster__grid">';
    items.forEach(function (player) {
      html += '<article class="today-roster-card" data-animate>';
      html += '<div class="today-roster-card__photo-wrap">';
      html += '<img class="today-roster-card__photo" src="' + prefix + esc(player.photo) + '" alt="' + esc(loc(player, 'name')) + '" loading="lazy">';
      html += '<span class="today-roster-card__number">#' + player.number + '</span>';
      html += '</div>';
      html += '<div class="today-roster-card__info">';
      html += '<h3 class="today-roster-card__name">' + esc(loc(player, 'name')) + '</h3>';
      html += '<span class="today-roster-card__position">' + (posLabels[player.position] || player.position) + '</span>';
      html += '</div>';
      html += '</article>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function showLoadError(msg) {
    var el = document.querySelector('[data-today-news]') || document.querySelector('[data-today-announcements]');
    if (el) {
      el.innerHTML = '<p class="today-empty" style="color:var(--color-error,#c53030);padding:1rem">' + esc(msg) + '</p>';
    }
    console.error('today.js:', msg);
  }

  function applyData(data) {
    if (!data || typeof data !== 'object') return;
    renderNews(data);
    renderAnnouncements(data);
    renderGallery(data);
    renderSchedule(data);
    renderRoster(data);
    if (typeof window.SheregeshAnimations !== 'undefined' && window.SheregeshAnimations.observe) {
      document.querySelectorAll('[data-animate]:not(.is-visible)').forEach(function (el) {
        window.SheregeshAnimations.observe(el);
      });
    } else {
      document.querySelectorAll('[data-animate]').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  }

  /* ==== INIT ==== */
  function init() {
    initNewsModal();
    if (window.location.protocol === 'file:') {
      showLoadError(lang === 'ru'
        ? 'Откройте страницу через локальный сервер (http://...), а не как файл (file://).'
        : 'Open the page via a local server (http://...), not as a file (file://).');
      return;
    }
    var dataUrl = getDataUrl();
    var sep = dataUrl.indexOf('?') !== -1 ? '&' : '?';
    dataUrl = dataUrl + sep + '_=' + Date.now();
    fetch(dataUrl, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var ct = (r.headers.get('Content-Type') || '').toLowerCase();
        if (ct.indexOf('text/html') !== -1) throw new Error('Сервер вернул HTML вместо JSON (404?)');
        return r.json();
      })
      .then(function (data) {
        if (!data || typeof data !== 'object') throw new Error('Неверный формат данных');
        applyData(data);
      })
      .catch(function (err) {
        showLoadError((lang === 'ru' ? 'Не удалось загрузить данные: ' : 'Failed to load data: ') + (err && err.message ? err.message : ''));
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
