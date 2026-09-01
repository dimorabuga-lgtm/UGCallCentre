(() => {
  'use strict';

  const initialiseCallDemo = () => {
    const demo = document.querySelector('[data-call-demo]');
    if (!demo) return;

    const status = demo.querySelector('[data-call-status]');
    const timer = demo.querySelector('[data-call-timer]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let started = false;
    const later = (callback, delay) => window.setTimeout(callback, delay);

    const showFinalState = () => {
      demo.classList.add('is-visible', 'is-connected', 'show-upsell', 'show-delivery');
      status.textContent = 'Оператор на лінії';
      timer.textContent = '00:06';
    };

    const play = () => {
      if (started) return;
      started = true;
      if (reducedMotion) { showFinalState(); return; }

      demo.classList.add('is-visible');
      later(() => demo.classList.add('is-ringing'), 800);
      later(() => demo.classList.add('is-accepting'), 1500);
      later(() => {
        demo.classList.add('is-connected');
        demo.classList.remove('is-ringing', 'is-accepting');
        status.textContent = 'Оператор на лінії';
        let seconds = 0;
        const tick = window.setInterval(() => {
          seconds += 1;
          timer.textContent = `00:0${Math.min(seconds, 6)}`;
          if (seconds >= 6) window.clearInterval(tick);
        }, 1000);
      }, 2200);
      later(() => demo.classList.add('show-confirmed'), 4000);
      later(() => demo.classList.add('show-upsell'), 5000);
      later(() => {
        demo.classList.remove('show-confirmed');
        demo.classList.add('show-delivery', 'is-complete');
      }, 6000);
    };

    if (!('IntersectionObserver' in window)) { play(); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { play(); observer.disconnect(); }
    }, { threshold: 0.25 });
    observer.observe(demo);
  };

  if (window.UGCallCentre) window.UGCallCentre.register('phone-call', initialiseCallDemo);
  else document.addEventListener('DOMContentLoaded', initialiseCallDemo, { once: true });
})();
