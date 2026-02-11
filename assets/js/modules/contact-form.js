(function () {
  'use strict';

  var openButtons = document.querySelectorAll('.contact-form-open');
  var modal = document.getElementById('contact-modal');
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('contact-form-status');

  if (!openButtons.length || !modal || !form || !statusEl) return;

  var lastOpener = null;

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

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var msgSuccess = form.getAttribute('data-msg-success') || 'Thanks for your submission!';
    var msgError = form.getAttribute('data-msg-error-default') || 'Oops! There was a problem submitting your form.';

    statusEl.textContent = '';
    statusEl.removeAttribute('class');

    fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
      .then(function (response) {
        if (response.ok) {
          statusEl.textContent = msgSuccess;
          statusEl.classList.add('contact-form__status--success');
          form.reset();
        } else {
          return response.json().then(function (data) {
            if (data.errors && Array.isArray(data.errors)) {
              statusEl.textContent = data.errors.map(function (err) { return err.message; }).join(', ');
            } else {
              statusEl.textContent = msgError;
            }
            statusEl.classList.add('contact-form__status--error');
          });
        }
      })
      .catch(function () {
        statusEl.textContent = msgError;
        statusEl.classList.add('contact-form__status--error');
      });
  });
})();
