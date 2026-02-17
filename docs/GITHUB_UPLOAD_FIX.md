# Исправление ошибки 409 при загрузке нескольких изображений

## Проблема
При загрузке нескольких изображений через GitHub API возникает ошибка **409 Conflict**.

## Причина
Изображения загружаются **параллельно**, но GitHub API требует актуальный SHA файла. При параллельной загрузке SHA не успевает обновляться.

## Решение

### Вариант 1: Последовательная загрузка (рекомендуется)

В вашем файле управления контентом найдите функцию загрузки изображений и измените её:

```javascript
// ❌ НЕПРАВИЛЬНО - параллельная загрузка
async function uploadAllImages(images) {
  const promises = images.map(image => uploadImage(image));
  return Promise.all(promises);
}

// ✅ ПРАВИЛЬНО - последовательная загрузка
async function uploadAllImages(images) {
  const results = [];
  for (const image of images) {
    const result = await uploadImage(image);
    results.push(result);
  }
  return results;
}
```

### Вариант 2: Добавление задержки между загрузками

Если нужна параллельная загрузка, добавьте небольшую задержку:

```javascript
async function uploadWithDelay(image, delayMs) {
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return uploadImage(image);
}

async function uploadAllImages(images) {
  const promises = images.map((image, index) =>
    uploadWithDelay(image, index * 500) // 500мс задержка между каждым файлом
  );
  return Promise.all(promises);
}
```

### Вариант 3: Проверка существования файла перед загрузкой

```javascript
async function uploadImage(imagePath, imageData) {
  try {
    // Пытаемся получить текущий SHA файла
    const existingFile = await ghApi('GET', `/repos/${owner}/${repo}/contents/${imagePath}`);
    const sha = existingFile.sha;

    // Обновляем файл с актуальным SHA
    return await ghApi('PUT', `/repos/${owner}/${repo}/contents/${imagePath}`, {
      message: 'Update image',
      content: imageData,
      sha: sha  // Используем актуальный SHA
    });
  } catch (error) {
    if (error.status === 404) {
      // Файл не существует, создаём новый
      return await ghApi('PUT', `/repos/${owner}/${repo}/contents/${imagePath}`, {
        message: 'Add new image',
        content: imageData
      });
    }
    throw error;
  }
}
```

## Где найти код для исправления

Судя по ошибкам в консоли, код находится в файле `manage-content-2026` около строк:
- **1026** - функция `ghApi`
- **1057** - функция `writeFileBinary`
- **1139** - обработка загрузки
- **1718** - вызов загрузки изображений

## Рекомендации

1. **Используйте последовательную загрузку** - это самый надёжный способ
2. Добавьте **индикатор прогресса** для каждого загружаемого файла
3. Обрабатывайте **ошибки отдельно** для каждого файла (один неудачный не должен блокировать остальные)
4. Добавьте **возможность повтора** для неудачно загруженных файлов

## Пример полного решения

```javascript
async function uploadNewsImages(newsItem, imageFiles) {
  const uploadedPaths = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const filename = Date.now() + '.' + file.name.split('.').pop();
    const path = `assets/images/today/news/${filename}`;

    try {
      console.log(`Загрузка ${i + 1}/${imageFiles.length}: ${filename}`);

      // Читаем файл как base64
      const base64 = await fileToBase64(file);

      // Загружаем на GitHub последовательно
      await writeFileBinary(path, base64);

      uploadedPaths.push(path);
      console.log(`✓ Загружено: ${filename}`);

    } catch (error) {
      console.error(`✗ Ошибка загрузки ${filename}:`, error);
      throw error; // Или продолжить с другими файлами
    }
  }

  return uploadedPaths;
}
```

После исправления сможете загружать сколько угодно изображений без ошибок 409!
