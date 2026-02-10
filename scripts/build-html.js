#!/usr/bin/env node
/**
 * build-html.js — генерация index.html и en/index.html
 * из единого шаблона src/template.html и переводов src/i18n/*.json.
 *
 * Без npm-зависимостей: только fs и path.
 *
 * Использование:  node scripts/build-html.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'src', 'template.html');
const I18N_DIR = path.join(ROOT, 'src', 'i18n');

// Маппинг lang → выходной файл (относительно ROOT)
const OUTPUT_MAP = {
  ru: 'index.html',
  en: path.join('en', 'index.html')
};

/**
 * Разрешить ключ с dot-notation относительно объекта данных.
 * Пример: resolve(data, "nav.about") → data.nav.about
 */
function resolve(data, key) {
  return key.split('.').reduce(function (obj, part) {
    if (obj == null) return undefined;
    return obj[part];
  }, data);
}

/**
 * Заменить все {{key}} и {{key.subkey}} в шаблоне значениями из JSON.
 * Возвращает строку с подставленными значениями.
 */
function render(template, data) {
  return template.replace(/\{\{([^}]+)\}\}/g, function (match, key) {
    var value = resolve(data, key.trim());
    if (value === undefined) return match; // оставить как есть → предупреждение
    return String(value);
  });
}

// ── Главный процесс ──────────────────────────────────────

var template = fs.readFileSync(TEMPLATE, 'utf8');
var jsonFiles = fs.readdirSync(I18N_DIR).filter(function (f) {
  return f.endsWith('.json');
});

var hasErrors = false;

console.log('build-html: generating pages…');

for (var i = 0; i < jsonFiles.length; i++) {
  var file = jsonFiles[i];
  var data = JSON.parse(fs.readFileSync(path.join(I18N_DIR, file), 'utf8'));
  var lang = data.lang;

  if (!lang) {
    console.error('  \u2717 ' + file + ': missing "lang" key');
    hasErrors = true;
    continue;
  }

  var outRel = OUTPUT_MAP[lang];
  if (!outRel) {
    console.error('  \u2717 ' + file + ': unknown lang "' + lang + '", no output mapping');
    hasErrors = true;
    continue;
  }

  var html = render(template, data);

  // Проверка на незаменённые плейсхолдеры
  var unreplaced = [];
  html.replace(/\{\{([^}]+)\}\}/g, function (_, key) {
    unreplaced.push(key.trim());
  });

  if (unreplaced.length) {
    var unique = unreplaced.filter(function (v, i, a) { return a.indexOf(v) === i; });
    console.warn('  \u26A0 ' + lang + ': unreplaced placeholders \u2192 ' + unique.join(', '));
  }

  var outPath = path.join(ROOT, outRel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('  \u2713 ' + outRel + ' (' + lang + ')');
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log('build-html: done.');
}
