# Админ-панель SheregeshHockey

Система управления контентом для сайта истории хоккея в Шерегеше.

## Доступ

**URL:** `https://luckycase.github.io/SheregeshHockey/manage-content-2026/`

**Безопасность:**
- Обфусцированный URL (`/manage-content-2026/` вместо `/admin/`)
- Двухфакторная защита: пароль + GitHub Personal Access Token
- `robots.txt` запрещает индексацию админки

## Авторизация

### Шаг 1: Пароль
По умолчанию установлен пустой пароль (просто нажмите "Войти").
Для смены пароля см. [PASSWORD-SETUP.md](./PASSWORD-SETUP.md)

### Шаг 2: GitHub Token
Создайте Personal Access Token в [GitHub Settings](https://github.com/settings/tokens):
- Permissions: **Repository → Contents → Read and write**
- Expiration: рекомендуется 90 дней
- Сохраните токен в безопасном месте

## Функции

### 📰 Новости
- Управление файлом: `assets/js/data/today-data.json`
- Поля: заголовок (RU/EN), текст (RU/EN), дата, закрепить
- 🎥 **Поддержка видео из VK.com** (прямые ссылки)
- Загрузка фото (до 1200px, JPEG 85%)
- Предпросмотр перед публикацией
- Индикатор видео (🎥) в списке новостей

### 📢 Анонсы
- Управление файлом: `assets/js/data/today-data.json`
- Поля: заголовок (RU/EN), описание (RU/EN), дата/время, локация (RU/EN)
- Предпросмотр перед публикацией

### ⏱ Хронология
- Управление файлом: `assets/js/data/timeline-data.json`
- Добавление событий по декадам (1970s/1980s/1990s)
- Поля: год, заголовок (RU/EN), описание (RU/EN), фото (опционально)
- Автосортировка по годам внутри декады
- Фильтр по декадам в списке
- Удаление с подтверждением

### 🖼 Архив фото
- Управление файлом: `assets/js/data/gallery-data.json`
- Исторические фотографии по декадам (1970s/1980s/1990s/teams)
- Поля: фото, подпись (RU/EN), alt текст (RU/EN), декада
- Фильтр по декадам
- Предпросмотр и удаление

### 📸 Фото (текущие)
- Управление файлом: `assets/js/data/today-data.json`
- Текущие фото команды Мустаг
- Поля: фото (несколько), подпись (RU/EN), категория, дата
- Массовая загрузка фотографий

### 📅 Расписание
- Управление файлом: `assets/js/data/today-data.json`
- Матчи команды Мустаг
- Поля: дата, время, соперник (RU/EN), локация (RU/EN), результат (счёт, победа)

### 👥 Составы
- Управление файлом: `assets/js/data/today-data.json`
- Игроки команды Мустаг
- Поля: номер, имя (RU/EN), позиция, фото

## Технические детали

### GitHub API Integration
- Использует GitHub REST API v3
- Автоматическое получение SHA для обновлений
- Коммиты с описательными сообщениями
- Работает напрямую с файлами в репозитории

### Обработка изображений
- Автоматический resize до 1200px (max dimension)
- Конвертация в JPEG с качеством 85%
- Base64 encoding для GitHub API
- Путь сохранения: `assets/images/{section}/photo-{timestamp}-{random}.jpg`

### LocalStorage
- Сохранение GitHub токена (не рекомендуется на общих компьютерах)
- Сохранение настроек репозитория (owner/repo/branch)

### sessionStorage
- Хранение хеша пароля (очищается при закрытии вкладки)

## Безопасность

### ✅ Что защищено
- Обфусцированный URL
- SHA-256 хеширование пароля
- Токен сохраняется только в localStorage браузера
- Пароль не передается по сети
- Двухфакторная защита (пароль + токен)

### ⚠️ Рекомендации
1. **Не используйте на общих/публичных компьютерах**
2. **Меняйте пароль регулярно** (раз в 3-6 месяцев)
3. **Используйте сложный пароль** (12+ символов)
4. **Обновляйте GitHub токен** перед истечением срока
5. **Не коммитьте PASSWORD_HASH в открытом виде**
6. **Очищайте localStorage** после работы на чужом ПК

## Совместимость

- **Platform-agnostic:** работает с GitHub Pages и Netlify
- **Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile:** адаптивный дизайн для планшетов и телефонов

## Ограничения

- GitHub API rate limit: 5000 requests/hour (authenticated)
- Размер файла изображения: макс. ~10MB (GitHub API limit)
- Количество файлов в коммите: рекомендуется <100

## Troubleshooting

### "Invalid token"
- Проверьте срок действия токена
- Убедитесь, что токен имеет права `repo` → `contents` → `Read and write`
- Попробуйте создать новый токен

### "Failed to load data"
- Проверьте правильность owner/repo/branch
- Убедитесь, что файлы существуют в репозитории
- Проверьте консоль браузера (F12) для подробностей

### Фото не загружается
- Убедитесь, что файл < 10MB
- Проверьте формат (должен быть image/*)
- Дождитесь завершения resize/upload (может занять 5-10 сек)

### "Conflict" при сохранении
- Кто-то другой изменил файл одновременно
- Обновите страницу (F5) и повторите операцию

## История изменений

### v2.1 (Feb 2026)
- ✅ 🎥 **Video support from VK.com** (embed in news)
- ✅ Direct VK video links parsing
- ✅ Video indicator in news list
- ✅ Auto-stop video on modal close

### v2.0 (Feb 2026)
- ✅ Password protection layer
- ✅ Timeline management (1970s-1990s)
- ✅ Gallery Archive management
- ✅ Delete functionality for all sections
- ✅ Preview for News/Announcements/Timeline/Gallery Archive
- ✅ Platform-agnostic (GitHub Pages + Netlify)

### v1.0 (Jan 2026)
- ✅ Today.html content management (News/Announcements/Gallery/Schedule/Roster)
- ✅ GitHub API integration
- ✅ Photo upload with resize

## Планы развития

- [ ] Edit functionality (предзаполнение формы)
- [ ] Bulk operations (массовое удаление)
- [ ] Image gallery manager (замена/crop фотографий)
- [ ] Markdown editor для News/Announcements
- [ ] History/Rollback (просмотр истории изменений)
- [ ] Multi-user support (логи кто что изменил)
