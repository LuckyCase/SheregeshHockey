# ToDo — Хоккей Шерегеша

Сверка с планом: `план_сайта_хоккей_шерегеша_2003de11.plan.md`

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

### ⏳ Осталось (по плану, опционально)

| Задача | Где | Статус |
|--------|-----|--------|
| Шрифты self-hosted WOFF2 | План Фаза 7: assets/fonts/, _typography.css | Не сделано — сейчас Google Fonts |
| favicon.ico (fallback) | План Фаза 7 | Только favicon.svg |
| Git init, push, GitHub Pages / Netlify | Фаза 8 | На усмотрение |

---

## Итог

По плану реализовано **фазы 1–7** и подготовка к **фазе 8**. Сайт можно открывать локально (index.html, ru/*, en/*), галерея и таймлайн работают от данных JSON. Для продакшена: при необходимости заменить example.com в hreflang и JSON-LD на реальный URL; при желании добавить WOFF2 и favicon.ico.

---

*Файл обновляется при мониторинге работы.*
