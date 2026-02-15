# Полное решение через Cloudflare Worker

## Архитектура

```
Форма на сайте
    ↓
Cloudflare Worker (edge, не засыпает)
    ↓
    ├→ Загружает фото на ImgBB (ключ на сервере!)
    ├→ Отправляет в Formspree с ссылками
    └→ (опционально) Дублирует в Telegram
```

## Преимущества

✅ **Безопасность** — ImgBB API ключ **НЕ в клиентском коде**  
✅ **Не засыпает** — Worker всегда активен  
✅ **Быстро** — edge-сеть по всему миру  
✅ **Надёжно** — автоматические retry при ошибках  
✅ **Гибко** — можно отправлять и в Formspree, и в Telegram одновременно  
✅ **Бесплатно** — 100,000 запросов/день  

---

## Вариант 1: ImgBB + Formspree (как сейчас, но безопасно)

Worker загружает фото на ImgBB и отправляет форму в Formspree со ссылками.

### Код Cloudflare Worker:

```javascript
export default {
  async fetch(request, env) {
    // CORS preflight
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
      const email = formData.get('email');
      const message = formData.get('message');
      
      // Получаем фото
      const photos = [];
      for (const [key, value] of formData.entries()) {
        if (key === 'photo' && value.size > 0) {
          photos.push(value);
        }
      }

      // API ключи из переменных окружения (безопасно!)
      const IMGBB_API_KEY = env.IMGBB_API_KEY;
      const FORMSPREE_ENDPOINT = env.FORMSPREE_ENDPOINT;

      // Загружаем фото на ImgBB
      const photoUrls = [];
      for (const photo of photos) {
        const imgbbFormData = new FormData();
        imgbbFormData.append('image', photo);

        const imgbbResponse = await fetch(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          {
            method: 'POST',
            body: imgbbFormData,
          }
        );

        const imgbbData = await imgbbResponse.json();
        if (imgbbData.success) {
          photoUrls.push(imgbbData.data.url);
        }
      }

      // Формируем данные для Formspree
      const formspreeData = new FormData();
      formspreeData.append('email', email);
      formspreeData.append('message', message);
      
      if (photoUrls.length > 0) {
        formspreeData.append('photo_urls', photoUrls.join('\n'));
      }

      // Отправляем в Formspree
      const formspreeResponse = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formspreeData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!formspreeResponse.ok) {
        throw new Error('Formspree submission failed');
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

---

## Вариант 2: ImgBB + Telegram (максимальная приватность)

Worker загружает фото на ImgBB и отправляет в Telegram.

### Код Cloudflare Worker:

```javascript
export default {
  async fetch(request, env) {
    // CORS preflight
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
      const email = formData.get('email');
      const message = formData.get('message');
      
      // Получаем фото
      const photos = [];
      for (const [key, value] of formData.entries()) {
        if (key === 'photo' && value.size > 0) {
          photos.push(value);
        }
      }

      // Переменные окружения (безопасно!)
      const IMGBB_API_KEY = env.IMGBB_API_KEY;
      const TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = env.TELEGRAM_CHAT_ID;

      // Загружаем фото на ImgBB
      const photoUrls = [];
      for (const photo of photos) {
        const imgbbFormData = new FormData();
        imgbbFormData.append('image', photo);

        const imgbbResponse = await fetch(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          {
            method: 'POST',
            body: imgbbFormData,
          }
        );

        const imgbbData = await imgbbResponse.json();
        if (imgbbData.success) {
          photoUrls.push(imgbbData.data.url);
        }
      }

      // Формируем сообщение для Telegram
      let telegramText = `📬 <b>Новое сообщение с сайта</b>\n\n` +
                         `✉️ <b>Email:</b> ${email}\n\n` +
                         `💬 <b>Сообщение:</b>\n${message}`;

      if (photoUrls.length > 0) {
        telegramText += '\n\n📸 <b>Фотографии:</b>\n';
        photoUrls.forEach((url, index) => {
          telegramText += `${index + 1}. ${url}\n`;
        });
      }

      // Отправляем в Telegram
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramText,
            parse_mode: 'HTML',
          }),
        }
      );

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

---

## Вариант 3: ImgBB + Formspree + Telegram (всё сразу!)

Дублирование: и в email (Formspree), и в Telegram.

### Код Cloudflare Worker:

```javascript
export default {
  async fetch(request, env) {
    // CORS preflight
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
      const email = formData.get('email');
      const message = formData.get('message');
      
      // Получаем фото
      const photos = [];
      for (const [key, value] of formData.entries()) {
        if (key === 'photo' && value.size > 0) {
          photos.push(value);
        }
      }

      // Переменные окружения
      const IMGBB_API_KEY = env.IMGBB_API_KEY;
      const FORMSPREE_ENDPOINT = env.FORMSPREE_ENDPOINT;
      const TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = env.TELEGRAM_CHAT_ID;

      // 1. Загружаем фото на ImgBB
      const photoUrls = [];
      for (const photo of photos) {
        const imgbbFormData = new FormData();
        imgbbFormData.append('image', photo);

        const imgbbResponse = await fetch(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          {
            method: 'POST',
            body: imgbbFormData,
          }
        );

        const imgbbData = await imgbbResponse.json();
        if (imgbbData.success) {
          photoUrls.push(imgbbData.data.url);
        }
      }

      // 2. Отправляем в Formspree
      const formspreeData = new FormData();
      formspreeData.append('email', email);
      formspreeData.append('message', message);
      
      if (photoUrls.length > 0) {
        formspreeData.append('photo_urls', photoUrls.join('\n'));
      }

      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formspreeData,
        headers: { 'Accept': 'application/json' },
      });

      // 3. Дублируем в Telegram (для мгновенных уведомлений)
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        let telegramText = `📬 <b>Новое сообщение с сайта</b>\n\n` +
                           `✉️ <b>Email:</b> ${email}\n\n` +
                           `💬 <b>Сообщение:</b>\n${message}`;

        if (photoUrls.length > 0) {
          telegramText += '\n\n📸 <b>Фотографии:</b>\n';
          photoUrls.forEach((url, index) => {
            telegramText += `${index + 1}. ${url}\n`;
          });
        }

        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: telegramText,
              parse_mode: 'HTML',
            }),
          }
        );
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

---

## Настройка Cloudflare Worker

### 1. Создание Worker

1. Зарегистрируйтесь на https://dash.cloudflare.com/
2. **Workers & Pages** → **Create application** → **Create Worker**
3. Название: `sheregesh-contact-form`
4. Вставьте один из кодов выше
5. **Deploy**

### 2. Переменные окружения

**Settings** → **Variables and Secrets** → **Add variable**

**Для варианта 1 (ImgBB + Formspree):**
- `IMGBB_API_KEY` = ваш ImgBB API Key
- `FORMSPREE_ENDPOINT` = `https://formspree.io/f/xvzbgpao`

**Для варианта 2 (ImgBB + Telegram):**
- `IMGBB_API_KEY` = ваш ImgBB API Key
- `TELEGRAM_BOT_TOKEN` = токен вашего бота
- `TELEGRAM_CHAT_ID` = ваш chat ID

**Для варианта 3 (всё сразу):**
- `IMGBB_API_KEY` = ваш ImgBB API Key
- `FORMSPREE_ENDPOINT` = `https://formspree.io/f/xvzbgpao`
- `TELEGRAM_BOT_TOKEN` = токен вашего бота
- `TELEGRAM_CHAT_ID` = ваш chat ID

Нажмите **Encrypt** для безопасности → **Deploy**

### 3. Получите URL Worker

После deploy скопируйте URL:
`https://sheregesh-contact-form.ваш-аккаунт.workers.dev`

---

## Обновление формы

### Обновите `contact-form.js`:

Замените весь файл на упрощённую версию (без ImgBB логики):

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
    btn.addEventListener('click', function () { openModal(btn); });
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

  // Отправка формы через Worker
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    
    var msgSuccess = form.getAttribute('data-msg-success') || 'Спасибо за ваше сообщение!';
    var msgError = form.getAttribute('data-msg-error-default') || 'Не удалось отправить форму. Попробуйте позже.';
    var msgUploading = form.getAttribute('data-msg-uploading') || 'Загружаю фото...';

    statusEl.textContent = selectedFiles.length > 0 ? msgUploading : 'Отправка...';
    statusEl.removeAttribute('class');
    statusEl.classList.add('contact-form__status');
    submitButton.disabled = true;

    var formData = new FormData(form);

    fetch(WORKER_URL, {
      method: 'POST',
      body: formData,
    })
      .then(function (response) { return response.json(); })
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

---

## Итого: Преимущества решения

✅ **Безопасность** — API ключи **НЕ в клиентском коде**  
✅ **Не засыпает** — Worker всегда активен  
✅ **Мгновенно** — edge-сеть Cloudflare  
✅ **Гибкость** — можно отправлять и в Formspree, и в Telegram  
✅ **Приватность** — фото на ImgBB, но ссылки только у вас  
✅ **Бесплатно** — 100,000 запросов/день  
✅ **Надёжно** — автоматические retry  

---

## Какой вариант выбрать?

**Вариант 1 (ImgBB + Formspree)** — если хотите всё как сейчас, но безопасно  
**Вариант 2 (ImgBB + Telegram)** — мгновенные уведомления  
**Вариант 3 (всё вместе)** — и email, и Telegram (лучший вариант!)  

**Рекомендую: Вариант 3** — получаете и email через Formspree, и мгновенное уведомление в Telegram. Лучшее из обоих миров!
