# Интеграция формы с Telegram Bot — Готовый код

## Вариант 1: Через Cloudflare Worker (без засыпания)

### Шаг 1: Получите данные Telegram бота

1. Откройте Telegram → найдите **@BotFather**
2. Отправьте команду: `/newbot` (или используйте существующего)
3. Скопируйте **Bot Token** (вида `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

4. Получите ваш **Chat ID**:
   - Напишите боту любое сообщение
   - Откройте: `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
   - Найдите `"chat":{"id": 123456789}` — это ваш Chat ID

### Шаг 2: Создайте Cloudflare Worker

1. Зарегистрируйтесь на https://dash.cloudflare.com/ (бесплатно)
2. Перейдите в **Workers & Pages**
3. Нажмите **Create application** → **Create Worker**
4. Назовите: `sheregesh-contact-form`
5. Вставьте код ниже
6. Нажмите **Deploy**

### Код Worker:

```javascript
export default {
  async fetch(request, env) {
    // Обработка CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const formData = await request.formData();
      const email = formData.get('email') || 'Не указан';
      const message = formData.get('message') || 'Нет сообщения';

      // Токен и Chat ID — добавьте в переменные окружения Worker!
      const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
      const CHAT_ID = env.TELEGRAM_CHAT_ID;

      // Формируем сообщение
      const text = `📬 <b>Новое сообщение с сайта Хоккей Шерегеша</b>\n\n` +
                   `✉️ <b>Email:</b> ${email}\n\n` +
                   `💬 <b>Сообщение:</b>\n${message}`;

      // Отправляем текст
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
          parse_mode: 'HTML',
        }),
      });

      // Отправляем фото (если есть)
      const photos = [];
      for (const [key, value] of formData.entries()) {
        if (key === 'photo' && value.size > 0) {
          photos.push(value);
        }
      }

      for (let i = 0; i < photos.length; i++) {
        const photoData = new FormData();
        photoData.append('chat_id', CHAT_ID);
        photoData.append('photo', photos[i]);
        photoData.append('caption', `📸 Фото ${i + 1} от ${email}`);

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: photoData,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
```

### Шаг 3: Добавьте переменные окружения

В настройках Worker:
1. **Settings** → **Variables and Secrets**
2. Добавьте:
   - `TELEGRAM_BOT_TOKEN` = ваш токен бота
   - `TELEGRAM_CHAT_ID` = ваш chat ID
3. **Encrypt** (для безопасности)
4. **Deploy**

### Шаг 4: Обновите форму

Замените весь `assets/js/modules/contact-form.js`:

```javascript
(function () {
  'use strict';

  // URL вашего Cloudflare Worker
  var WORKER_URL = 'https://sheregesh-contact-form.ваш-аккаунт.workers.dev';

  var openButtons = document.querySelectorAll('.contact-form-open');
  var modal = document.getElementById('contact-modal');
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('contact-form-status');
  var fileInput = document.getElementById('contact-photo');
  var previewContainer = document.getElementById('contact-photo-preview');
  var submitButton = form.querySelector('.contact-form__submit');

  if (!openButtons.length || !modal || !form || !statusEl) return;

  var lastOpener = null;
  var selectedFiles = [];

  function handleEscape(e) {
    if (e.key === 'Escape') closeModal();
  }

  function openModal(opener) {
    lastOpener = opener || openButtons[0];
    modal.hidden = false;
    modal.classList.add('modal--open');
    openButtons.forEach(function (btn) { btn.setAttribute('aria-expanded', 'true'); });
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.addEventListener('keydown', handleEscape);
    var firstInput = form.querySelector('input, textarea');
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    modal.classList.remove('modal--open');
    modal.hidden = true;
    openButtons.forEach(function (btn) { btn.setAttribute('aria-expanded', 'false'); });
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modal.removeEventListener('keydown', handleEscape);
    if (lastOpener) lastOpener.focus();
  }

  openButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn);
    });
  });

  modal.querySelectorAll('[data-contact-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  // Превью фото
  if (fileInput && previewContainer) {
    fileInput.addEventListener('change', function (e) {
      selectedFiles = Array.from(e.target.files);
      renderPreview();
    });
  }

  function renderPreview() {
    if (selectedFiles.length === 0) {
      previewContainer.hidden = true;
      previewContainer.innerHTML = '';
      return;
    }

    previewContainer.hidden = false;
    previewContainer.innerHTML = '';

    selectedFiles.forEach(function (file, index) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var item = document.createElement('div');
        item.className = 'contact-form__preview-item';
        item.innerHTML = '<img src="' + e.target.result + '" alt="Preview" class="contact-form__preview-image" />' +
          '<button type="button" class="contact-form__preview-remove" data-index="' + index + '" aria-label="Remove">×</button>';
        previewContainer.appendChild(item);

        item.querySelector('.contact-form__preview-remove').addEventListener('click', function () {
          removeFile(parseInt(this.getAttribute('data-index')));
        });
      };
      reader.readAsDataURL(file);
    });
  }

  function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderPreview();
    
    var dt = new DataTransfer();
    selectedFiles.forEach(function (file) {
      dt.items.add(file);
    });
    fileInput.files = dt.files;
  }

  // Отправка формы в Telegram
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    
    var msgSuccess = form.getAttribute('data-msg-success') || 'Спасибо за ваше сообщение!';
    var msgError = form.getAttribute('data-msg-error-default') || 'Не удалось отправить форму. Попробуйте позже.';

    statusEl.textContent = 'Отправка...';
    statusEl.removeAttribute('class');
    statusEl.classList.add('contact-form__status');
    submitButton.disabled = true;

    var formData = new FormData(form);

    fetch(WORKER_URL, {
      method: 'POST',
      body: formData,
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        submitButton.disabled = false;
        if (data.success) {
          statusEl.textContent = msgSuccess;
          statusEl.classList.add('contact-form__status--success');
          form.reset();
          selectedFiles = [];
          renderPreview();
        } else {
          statusEl.textContent = msgError;
          statusEl.classList.add('contact-form__status--error');
        }
      })
      .catch(function (error) {
        console.error('Error:', error);
        submitButton.disabled = false;
        statusEl.textContent = msgError;
        statusEl.classList.add('contact-form__status--error');
      });
  });
})();
```

### Шаг 5: Удалите строку action из формы

В `src/template.html` измените:

```html
<!-- Было: -->
<form id="contact-form" class="contact-form" action="https://formspree.io/f/xvzbgpao" method="POST" ...>

<!-- Стало: -->
<form id="contact-form" class="contact-form" method="POST" ...>
```

Запустите `npm run build` для регенерации.

---

## Готово! 🎉

Теперь при отправке формы:
1. ✅ Сообщение и фото приходят **в ваш Telegram**
2. ✅ **Мгновенно** (без задержек Render)
3. ✅ **Полная приватность** — только вы видите
4. ✅ Можете отвечать прямо из Telegram

---

## Преимущества этого решения:

✅ **Нет засыпания** — Cloudflare Workers всегда активен  
✅ **Мгновенные уведомления** на телефон  
✅ **Полная приватность** — фото только у вас в Telegram  
✅ **До 20 MB на фото** (лимит Telegram API)  
✅ **Бесплатно** — 100,000 запросов/день  
✅ **Никаких внешних хранилищ** — всё в Telegram  
✅ **Можно отвечать** прямо из Telegram  

---

## Тестирование:

1. Откройте сайт
2. Нажмите "Написать нам"
3. Заполните форму, прикрепите фото
4. Отправьте
5. **Проверьте Telegram** — сообщение должно прийти мгновенно!

---

**URL Worker:** После deploy скопируйте URL вида `https://sheregesh-contact-form.ваш-аккаунт.workers.dev` и замените в `contact-form.js`.
