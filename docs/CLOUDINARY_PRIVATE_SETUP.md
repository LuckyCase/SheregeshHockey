# Приватная загрузка фото через Cloudinary (безопасный вариант)

## Почему Cloudinary безопаснее ImgBB?

✅ **Приватные фото** — можно сделать фото доступными только с токеном  
✅ **Подпись загрузки** — токен генерируется на сервере, а не хранится в коде  
✅ **Контроль доступа** — можно управлять, кто видит фото  
✅ **Автоудаление** — можно настроить удаление через N дней  
✅ **Модерация** — можно проверять фото перед публикацией  

## Как это работает

1. Пользователь выбирает фото
2. Запрос на **ваш сервер/функцию** для получения временного токена
3. Фото загружается на Cloudinary с токеном
4. Фото **приватное** — доступно только вам
5. Вы получаете уведомление и можете:
   - Одобрить → сделать публичным
   - Отклонить → удалить

## Настройка Cloudinary с приватными фото

### Шаг 1: Регистрация

1. Зарегистрируйтесь на https://cloudinary.com/users/register/free
2. Бесплатно: **25 GB хранилища**, 25 GB трафика/месяц
3. После регистрации получите:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (НЕ публикуйте!)

### Шаг 2: Создание Upload Preset

1. Зайдите в Settings → Upload
2. Создайте новый Upload Preset:
   - **Name**: `sheregesh_hockey_private`
   - **Signing Mode**: **Signed** (требует подписи)
   - **Delivery Type**: **Private** (приватное хранилище)
   - **Access Mode**: **Authenticated** (требует токен для просмотра)
   - **Folder**: `contact-form-photos`
   - **Notification URL**: ваш email или webhook

### Шаг 3: Создание функции для генерации подписи

Вам понадобится простая серверная функция (можно использовать **Cloudflare Workers**, **Netlify Functions** или **GitHub Actions**).

#### Пример: Cloudflare Worker (бесплатно, 100k запросов/день)

```javascript
// cloudflare-worker.js
export default {
  async fetch(request, env) {
    // Проверяем CORS
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

    // Cloudinary credentials (установите как environment variables в Workers)
    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    // Генерируем timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Параметры загрузки
    const params = {
      timestamp: timestamp,
      upload_preset: 'sheregesh_hockey_private',
      folder: 'contact-form-photos',
    };

    // Генерируем подпись
    const crypto = await import('crypto');
    const signature = crypto
      .createHash('sha256')
      .update(
        Object.keys(params)
          .sort()
          .map(key => `${key}=${params[key]}`)
          .join('&') + apiSecret
      )
      .digest('hex');

    // Возвращаем подпись клиенту
    return new Response(JSON.stringify({
      signature,
      timestamp,
      api_key: apiKey,
      cloud_name: cloudName,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://luckycase.github.io',
      },
    });
  },
};
```

### Шаг 4: Обновление JS-кода формы

```javascript
// В contact-form.js
function uploadToCloudinary(file) {
  return new Promise(async function (resolve, reject) {
    // Получаем подпись с сервера
    const signatureResponse = await fetch('https://ваш-worker.workers.dev/sign-upload', {
      method: 'POST',
    });
    const signatureData = await signatureResponse.json();

    // Загружаем файл с подписью
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signatureData.signature);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('api_key', signatureData.api_key);
    formData.append('upload_preset', 'sheregesh_hockey_private');

    fetch(`https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.secure_url) {
          resolve(data.secure_url);
        } else {
          reject(new Error('Upload failed'));
        }
      })
      .catch(reject);
  });
}
```

## Преимущества этого решения

✅ **API Secret не в коде** — хранится на сервере  
✅ **Приватные фото** — доступны только вам  
✅ **Контроль загрузок** — подпись генерируется вами  
✅ **Уведомления** — получаете email при новом фото  
✅ **Модерация** — можете проверить фото перед публикацией  

## Недостатки

⚠️ Требует настройки серверной функции (15-20 минут)  
⚠️ Немного сложнее, чем ImgBB  

---

## Рекомендация

- **ImgBB**: для НЕ приватных материалов (публичные исторические фото)
- **Cloudinary Signed**: для приватных материалов или если нужна модерация

Хотите помощь с настройкой Cloudinary? Могу показать пошагово.
