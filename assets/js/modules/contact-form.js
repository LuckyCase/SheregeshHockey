(function () {
  'use strict';

  // URL Cloudflare Worker (все ключи на сервере - безопасно!)
  var WORKER_URL = 'https://sheregesh-contact-form.ivan-titarchuk.workers.dev';

  var openButtons = document.querySelectorAll('.contact-form-open');
  var modal = document.getElementById('contact-modal');
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('contact-form-status');
  var fileInput = document.getElementById('contact-photo');
  var previewContainer = document.getElementById('contact-photo-preview');
  var photoUrlsInput = document.getElementById('contact-photo-urls');
  var submitButton = form.querySelector('.contact-form__submit');

  if (!openButtons.length || !modal || !form || !statusEl) return;

  var lastOpener = null;
  var selectedFiles = [];
  var uploadedUrls = [];

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

  // Обработка выбора файлов
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
    
    // Обновляем input
    var dt = new DataTransfer();
    selectedFiles.forEach(function (file) {
      dt.items.add(file);
    });
    fileInput.files = dt.files;
  }

  // Отправка формы через Cloudflare Worker
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    
    var msgSuccess = form.getAttribute('data-msg-success') || 'Thanks for your submission!';
    var msgError = form.getAttribute('data-msg-error-default') || 'Oops! There was a problem submitting your form.';
    var msgUploading = form.getAttribute('data-msg-uploading') || 'Uploading photos...';

    statusEl.textContent = selectedFiles.length > 0 ? msgUploading : 'Sending...';
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
          uploadedUrls = [];
          renderPreview();
        } else {
          statusEl.textContent = msgError;
          statusEl.classList.add('contact-form__status--error');
        }
      })
      .catch(function () {
        submitButton.disabled = false;
        statusEl.textContent = msgError;
        statusEl.classList.add('contact-form__status--error');
      });
  });
})();
