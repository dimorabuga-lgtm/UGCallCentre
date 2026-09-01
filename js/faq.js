(() => {
  'use strict';

  const initialiseFaq = () => {
    const list = document.querySelector('[data-faq-list]');
    if (!list) return;

    const items = [...list.querySelectorAll('[data-faq-item]')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const closeTimers = new WeakMap();

    const setOpen = (item, shouldOpen) => {
      const button = item.querySelector('button');
      const panel = item.querySelector('[role="region"]');
      window.clearTimeout(closeTimers.get(item));

      if (shouldOpen) {
        items.forEach((other) => {
          if (other !== item) setOpen(other, false);
        });
        panel.hidden = false;
        requestAnimationFrame(() => item.classList.add('is-open'));
        button.setAttribute('aria-expanded', 'true');
        return;
      }

      item.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      if (reducedMotion) {
        panel.hidden = true;
        return;
      }
      closeTimers.set(item, window.setTimeout(() => {
        if (!item.classList.contains('is-open')) panel.hidden = true;
      }, 260));
    };

    items.forEach((item) => {
      const button = item.querySelector('button');
      button.addEventListener('click', () => setOpen(item, !item.classList.contains('is-open')));
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseFaq, { once: true });
  else initialiseFaq();
})();
