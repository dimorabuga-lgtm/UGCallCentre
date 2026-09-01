(() => {
  'use strict';

  const initialiseResultsCounters = () => {
    const section = document.querySelector('.measurable-results');
    if (!section) return;

    const counters = [...section.querySelectorAll('[data-kpi-value]')];
    if (!counters.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const formatters = {
      percent: (value) => `${Math.round(value)}%`,
      currency: (value) => `+${Math.round(value)} грн`,
      minutes: (value) => `до ${Math.round(value)} хв`,
      millions: (value) => `${value.toFixed(1).replace('.', ',')} млн+`,
      'decimal-percent': (value) => `${value.toFixed(1).replace('.', ',')}%`
    };

    const render = (counter, value) => {
      const format = counter.dataset.kpiFormat;
      const formatter = formatters[format] || ((number) => String(number));
      counter.textContent = formatter(value);
    };

    const animateCounter = (counter) => {
      const target = Number(counter.dataset.kpiValue);
      if (!Number.isFinite(target)) return;

      if (reducedMotion) {
        render(counter, target);
        return;
      }

      const duration = 1300;
      const startedAt = performance.now();

      const update = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        render(counter, target * easedProgress);

        if (progress < 1) {
          window.requestAnimationFrame(update);
        } else {
          render(counter, target);
        }
      };

      window.requestAnimationFrame(update);
    };

    let hasStarted = false;
    const startCounters = () => {
      if (hasStarted) return;
      hasStarted = true;
      counters.forEach(animateCounter);
    };

    if (!('IntersectionObserver' in window)) {
      startCounters();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      startCounters();
      observer.disconnect();
    }, { threshold: 0.2 });

    observer.observe(section);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseResultsCounters, { once: true });
  } else {
    initialiseResultsCounters();
  }
})();
