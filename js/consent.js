(() => {
  const key = 'ug-cookie-consent';
  let saved;
  try {
    saved = localStorage.getItem(key);
  } catch {
    saved = null;
  }
  if (saved) return;

  const banner = document.createElement('aside');
  banner.className = 'cookie-consent';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-modal', 'false');
  banner.setAttribute('aria-labelledby', 'cookie-consent-title');
  banner.setAttribute('aria-describedby', 'cookie-consent-description');
  banner.innerHTML = '<h2 id="cookie-consent-title">🍪 Налаштування файлів cookie</h2><p id="cookie-consent-description">Ми використовуємо необхідні файли cookie для коректної роботи сайту. Аналітичні cookie використовуються лише після вашої згоди. Ви можете змінити свій вибір у будь-який момент.</p><div class="cookie-consent__actions"><button type="button" data-consent="accept" aria-label="Прийняти всі файли cookie">Прийняти</button><button type="button" data-consent="settings" aria-label="Налаштувати файли cookie">Налаштувати</button><button type="button" data-consent="reject" aria-label="Відхилити необов’язкові файли cookie">Відхилити необов’язкові</button></div><a class="cookie-consent__policy" href="cookie-policy.html" aria-label="Переглянути політику Cookie">Політика Cookie</a>';
  document.body.append(banner);
  window.requestAnimationFrame(() => banner.classList.add('is-visible'));

  const close = (value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // The banner remains functional when persistent storage is unavailable.
    }
    banner.classList.remove('is-visible');
    window.setTimeout(() => {
      banner.remove();
      window.dispatchEvent(new CustomEvent('ug-consent', { detail: { analytics: value === 'accepted' } }));
    }, 300);
  };
  banner.addEventListener('click', (event) => {
    const action = event.target.closest('[data-consent]')?.dataset.consent;
    if (action === 'accept') close('accepted');
    if (action === 'reject') close('rejected');
    if (action === 'settings') window.location.href = 'cookie-policy.html';
  });
  banner.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close('rejected');
  });
})();
