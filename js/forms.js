document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#consultation-form');
  if (!form) return;

  const name = form.querySelector('#lead-name');
  const phone = form.querySelector('#lead-phone');
  const submit = form.querySelector('[type="submit"]');
  const successState = document.querySelector('[data-form-success]');
  const errorState = document.querySelector('[data-form-error]');
  let isSubmitting = false;

  const setError = (field, message) => {
    const target = form.querySelector(`#${field.dataset.errorTarget}-error`);
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (target) target.textContent = message;
  };

  const phoneDigits = (value) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('380')) digits = digits.slice(3);
    else if (digits.startsWith('38')) digits = digits.slice(2);
    else if (digits.startsWith('0')) digits = digits.slice(1);
    return digits.slice(0, 9);
  };

  const formatPhone = (value) => {
    const digits = phoneDigits(value);
    let result = '+380';
    if (digits.length) result += ` ${digits.slice(0, 2)}`;
    if (digits.length > 2) result += ` ${digits.slice(2, 5)}`;
    if (digits.length > 5) result += ` ${digits.slice(5, 7)}`;
    if (digits.length > 7) result += ` ${digits.slice(7, 9)}`;
    return result;
  };

  const validateName = () => {
    const valid = name.value.trim().length >= 2 && !/^\d+$/.test(name.value.trim());
    setError(name, valid ? '' : 'Введіть ім’я — щонайменше 2 символи.');
    return valid;
  };

  const validatePhone = () => {
    const digits = phoneDigits(phone.value);
    const valid = digits.length === 9;
    setError(phone, valid ? '' : phone.value.trim() ? 'Перевірте правильність номера.' : 'Введіть номер телефону.');
    return valid;
  };

  phone.addEventListener('focus', () => {
    if (!phone.value) phone.value = '+380 ';
  });

  phone.addEventListener('input', () => {
    phone.value = formatPhone(phone.value);
    if (phone.getAttribute('aria-invalid') === 'true') validatePhone();
  });

  name.addEventListener('input', () => {
    if (name.getAttribute('aria-invalid') === 'true') validateName();
  });

  name.addEventListener('blur', validateName);
  phone.addEventListener('blur', validatePhone);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    errorState?.setAttribute('hidden', '');
    const validName = validateName();
    const validPhone = validatePhone();
    if (!validName || !validPhone) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    phone.value = formatPhone(phone.value);
    isSubmitting = true;
    submit.disabled = true;
    submit.innerHTML = 'Надсилаємо… <span class="form-spinner" aria-hidden="true"></span>';

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    try {
      const endpoint = form.action;
      const payload = new FormData(form);
      payload.set('Дата і час', new Intl.DateTimeFormat('uk-UA', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date()));
      payload.set('Джерело', 'UG Call Centre website');
      payload.set('URL сторінки', window.location.href);
      const response = await fetch(endpoint, {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      const result = await response.json().catch(() => null);
      const serviceConfirmed = result?.success === true || result?.success === 'true';
      if (!response.ok || !serviceConfirmed) {
        throw new Error(result?.message || `Form submission failed with HTTP ${response.status}`);
      }

      form.reset();
      form.hidden = true;
      errorState?.setAttribute('hidden', '');
      successState?.removeAttribute('hidden');
      successState?.focus?.();
    } catch (error) {
      console.error('UG Call Centre form submission failed:', error);
      errorState?.removeAttribute('hidden');
      successState?.setAttribute('hidden', '');
      errorState?.focus();
    } finally {
      window.clearTimeout(timeout);
      isSubmitting = false;
      submit.disabled = false;
      submit.innerHTML = 'Отримати консультацію <i data-lucide="arrow-right" aria-hidden="true"></i>';
      if (window.lucide) window.lucide.createIcons();
    }
  });

  document.querySelector('[data-form-retry]')?.addEventListener('click', () => {
    errorState?.setAttribute('hidden', '');
    submit.focus();
  });
});
