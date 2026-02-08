# ToDo — Хоккей Шерегеша

---

## Мониторинг (актуально на 08.02.2025)

### ✅ Выполнено

| Фаза | Что сделано | Статус |
|------|-------------|--------|
| **1** | main.css, pages (_decade.css, _story.css), index.html, header/footer, навигация, RU\|EN | ✅ |
| **2** | Hero, images (icons, placeholders, hero, photos, teams, people, venues, logo), navigation.js | ✅ |
| **3** | timeline-data.json, timeline.js, animations.js (подключены в index.html) | ✅ |
| **4** | Контент секций; три карточки историй в #stories; **ru/decade-1970s/80s/90s.html**, **ru/story.html** | ✅ |
| **5** | **gallery-data.json**, **gallery.js**, **lightbox.js** (подключены в index.html) | ✅ |
| **6** | **language.js**, **en/index.html**, en/decade-*.html, en/story.html, **hreflang** в head | ✅ |
| **7** | **lazy-load.js**; **404.html**, **favicon.svg**, **manifest.json**, **robots.txt**, **sitemap.xml**, **.nojekyll**; JSON-LD (WebSite) в index; **.gitignore** | ✅ |
| **8** | .gitignore в корне | ✅ (репо и деплой — по необходимости) |
| — | **Шрифты self-hosted WOFF2** в `assets/fonts/`, подключение в `_typography.css` | ✅ |
| — | **favicon.ico** (скрипт `scripts/make-favicon.ico.ps1`) | ✅ |
| — | **contact-form** (модуль, стили), форма «Поделиться» | ✅ |

### ⏳ Осталось (опционально)

| Задача | Где | Статус |
|--------|-----|--------|
| Заменить example.com на реальный URL (GitHub Pages) | hreflang, JSON-LD, sitemap.xml, robots.txt | Для продакшена |
| Git push, GitHub Pages / Netlify | Деплой | На усмотрение |

---

## Итог

Реализованы фазы 1–8, локальные шрифты WOFF2, favicon.ico, форма обратной связи через **Formspree**. Сайт можно открывать локально (index.html, ru/*, en/*); галерея и таймлайн работают от JSON. Для продакшена: заменить example.com на актуальный URL в hreflang, sitemap и JSON-LD.

---

*Файл обновляется при мониторинге работы.*
