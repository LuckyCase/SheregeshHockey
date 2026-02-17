# Telegram Bot для формы обратной связи

## Решение проблемы засыпания Render

### Проблема:
Бесплатный план Render усыпляет сервис после 15 минут неактивности. При первом запросе требуется 30-60 секунд для пробуждения.

### 3 решения:

---

## ✅ Вариант 1: Cloudflare Workers (рекомендую)

**Не засыпает вообще!**

Cloudflare Workers работает на edge-сети и не засыпает. Идеально для webhook'ов.

### Преимущества:
- ✅ **Не засыпает** — всегда активен
- ✅ **Мгновенный ответ** — нет cold start
- ✅ **100,000 запросов/день** бесплатно
- ✅ **Очень быстро** — edge-сеть по всему миру
- ✅ **Простая настройка** — 10 минут

### Как работает:

```
Форма → Cloudflare Worker → Telegram Bot API → Ваш Telegram
```

Worker просто перенаправляет запрос в Telegram API, никакого сложного кода.

### Код Worker:

```javascript
// cloudflare-worker.js
export default {
  async fetch(request, env) {
    // CORS для OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://luckycase.github.io',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Получаем данные формы
      const formData = await request.formData();
      const email = formData.get('email');
      const message = formData.get('message');
      const photos = formData.getAll('photo'); // массив файлов

      const TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = env.TELEGRAM_CHAT_ID;

      // Отправляем текст сообщения
      const text = `📬 Новое сообщение с сайта!\n\n` +
                   `✉️ Email: ${email}\n\n` +
                   `💬 Сообщение:\n${message}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'HTML',
        }),
      });

      // Отправляем фото (если есть)
      for (const photo of photos) {
        if (!photo || photo.size === 0) continue;

        const photoFormData = new FormData();
        photoFormData.append('chat_id', TELEGRAM_CHAT_ID);
        photoFormData.append('photo', photo);
        photoFormData.append('caption', `От: ${email}`);

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: photoFormData,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://luckycase.github.io',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://luckycase.github.io',
        },
      });
    }
  },
};
```

### Настройка:

1. Создайте Worker на https://dash.cloudflare.com/
2. Добавьте переменные окружения:
   - `TELEGRAM_BOT_TOKEN` — токен вашего бота
   - `TELEGRAM_CHAT_ID` — ваш chat ID
3. Deploy
4. Получите URL: `https://ваш-worker.workers.dev`

---

## ⏰ Вариант 2: Keep-Alive пинг для Render

Если хотите остаться на Render — можно пинговать сервис каждые 10 минут, чтобы не засыпал.

### Способ А: GitHub Actions (бесплатно)

Создайте `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Render Alive

on:
  schedule:
    - cron: '*/10 * * * *'  # Каждые 10 минут
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Render service
        run: |
          curl -f https://ваш-сервис.onrender.com/health || true
```

### Способ Б: UptimeRobot (бесплатно)

1. Зарегистрируйтесь на https://uptimerobot.com/
2. Добавьте монитор:
   - URL: `https://ваш-сервис.onrender.com/health`
   - Interval: 5 минут
3. UptimeRobot будет пинговать ваш сервис

⚠️ **Важно:** Render бесплатный план даёт 750 часов/месяц. При постоянной работе = 720 часов. Но если у вас несколько проектов, лимит может закончиться.

---

## 🐌 Вариант 3: Принять задержку (самое простое)

Можно просто оставить как есть и предупредить пользователя о задержке.

### Обновление JS формы:

```javascript
// В contact-form.js
form.addEventListener('submit', async function (event) {
  event.preventDefault();
  
  statusEl.textContent = 'Отправка... (может занять до минуты при первой отправке)';
  statusEl.classList.add('contact-form__status');
  submitButton.disabled = true;

  const formData = new FormData(form);

  try {
    // Увеличиваем timeout для первого запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 секунд

    const response = await fetch('https://ваш-сервис.onrender.com/submit', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      statusEl.textContent = 'Спасибо! Сообщение отправлено.';
      statusEl.classList.add('contact-form__status--success');
      form.reset();
    } else {
      throw new Error('Submit failed');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      statusEl.textContent = 'Превышено время ожидания. Попробуйте еще раз.';
    } else {
      statusEl.textContent = 'Ошибка отправки. Попробуйте позже.';
    }
    statusEl.classList.add('contact-form__status--error');
  } finally {
    submitButton.disabled = false;
  }
});
```

### Предупреждение в форме:

```html
<p class="contact-form__note">
  ℹ️ Первая отправка может занять до минуты. Пожалуйста, подождите.
</p>
```

---

## Сравнение решений

| Параметр | Cloudflare Workers | Keep-Alive пинг | Принять задержку |
|----------|-------------------|-----------------|------------------|
| Скорость | ⚡ Мгновенно | ⚡ Мгновенно (если не заснул) | 🐌 30-60 сек (cold start) |
| Настройка | ⭐⭐ 10-15 минут | ⭐⭐ 10 минут | ⭐ 2 минуты |
| Надёжность | ✅ Всегда активен | ⚠️ Может пропустить пинг | ⚠️ Задержка |
| Стоимость | ✅ Бесплатно (100k/день) | ✅ Бесплатно | ✅ Бесплатно |
| Лимиты Render | ➖ Не использует Render | ⚠️ 750 часов/месяц | ⚠️ 750 часов/месяц |

---

## Моя рекомендация

### Если готовы потратить 15 минут:
👉 **Cloudflare Workers** — идеальное решение без недостатков

### Если хотите остаться на Render:
👉 **Keep-Alive пинг через GitHub Actions** — работает надёжно

### Если нужно "прямо сейчас":
👉 **Принять задержку** — добавить timeout 90 сек и предупреждение

---

Какой вариант вам больше подходит? Могу помочь с любым из них!
