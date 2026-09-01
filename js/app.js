(() => {
  'use strict';

  const modules = new Map();
  let booted = false;

  const app = {
    register(name, initializer) {
      if (typeof name !== 'string' || typeof initializer !== 'function') {
        throw new TypeError('A module requires a name and an initializer function.');
      }
      modules.set(name, initializer);
      return app;
    },

    async start() {
      if (booted) return;
      booted = true;

      for (const [name, initializer] of modules) {
        try {
          await initializer(app);
        } catch (error) {
          console.error(`Unable to initialize module: ${name}`, error);
        }
      }
    },

    get modules() {
      return [...modules.keys()];
    }
  };

  window.UGCallCentre = app;

  const hideDecorativeIcons = () => {
    document.querySelectorAll('svg:not([role]):not([aria-hidden])').forEach((icon) => {
      icon.setAttribute('aria-hidden', 'true');
      icon.setAttribute('focusable', 'false');
    });
  };

  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {
        // The site remains fully functional if a host blocks service workers.
      });
    }, { once: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    hideDecorativeIcons();
    app.start();
  }, { once: true });
})();
