(() => {
  'use strict';

  const initialiseCasesSlider = () => {
    const slider = document.querySelector('[data-cases-slider]');
    if (!slider) return;

    const slides = [...slider.querySelectorAll('[data-case-slide]')];
    const controls = [...slider.querySelectorAll('[data-case-control]')];
    const dots = [...slider.querySelectorAll('.cases-slider__dots span')];
    const previous = slider.querySelector('[data-case-previous]');
    const next = slider.querySelector('[data-case-next]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeIndex = 0;
    let autoplayTimer = 0;
    let isVisible = false;
    let isPaused = false;
    let touchStartX = 0;

    const formatValue = (value, format) => {
      if (format === 'percent') return `${Math.round(value)}%`;
      if (format === 'currency') return `${Math.round(value).toLocaleString('uk-UA').replace(/\u00a0/g, ' ')} грн`;
      if (format === 'minutes') return `${Math.round(value)} хв`;
      if (format === 'minutes-seconds') {
        const seconds = Math.round(value * 60);
        return `${Math.floor(seconds / 60)} хв ${seconds % 60} с`;
      }
      return String(value);
    };

    const animateCounters = (slide) => {
      slide.querySelectorAll('[data-case-counter]').forEach((counter) => {
        const target = Number(counter.dataset.caseCounter);
        if (!Number.isFinite(target)) return;
        const format = counter.dataset.caseFormat;
        if (reducedMotion) {
          counter.textContent = formatValue(target, format);
          return;
        }

        const startedAt = performance.now();
        const duration = 850;
        const update = (now) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = formatValue(target * eased, format);
          if (progress < 1) window.requestAnimationFrame(update);
          else counter.textContent = formatValue(target, format);
        };

        counter.textContent = formatValue(0, format);
        window.requestAnimationFrame(update);
      });
    };

    const clearAutoplay = () => {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = 0;
    };

    const scheduleAutoplay = () => {
      clearAutoplay();
      if (reducedMotion || !isVisible || isPaused || slides.length < 2) return;
      autoplayTimer = window.setTimeout(() => {
        setActive((activeIndex + 1) % slides.length);
      }, 8000);
    };

    const setActive = (index, restartAutoplay = true) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });
      controls.forEach((control, controlIndex) => {
        const isActive = controlIndex === activeIndex;
        control.classList.toggle('is-active', isActive);
        if (isActive) control.setAttribute('aria-current', 'true');
        else control.removeAttribute('aria-current');
      });
      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === activeIndex));
      animateCounters(slides[activeIndex]);
      if (restartAutoplay) scheduleAutoplay();
    };

    controls.forEach((control, index) => {
      control.addEventListener('click', () => setActive(index));
    });
    previous?.addEventListener('click', () => setActive(activeIndex - 1));
    next?.addEventListener('click', () => setActive(activeIndex + 1));

    slider.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActive(activeIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActive(activeIndex + 1);
      }
    });

    slider.addEventListener('pointerenter', () => {
      isPaused = true;
      clearAutoplay();
    });
    slider.addEventListener('pointerleave', () => {
      isPaused = false;
      scheduleAutoplay();
    });
    slider.addEventListener('focusin', () => {
      isPaused = true;
      clearAutoplay();
    });
    slider.addEventListener('focusout', (event) => {
      if (slider.contains(event.relatedTarget)) return;
      isPaused = false;
      scheduleAutoplay();
    });
    slider.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', (event) => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) < 42) return;
      setActive(distance > 0 ? activeIndex - 1 : activeIndex + 1);
    }, { passive: true });

    const start = () => {
      if (isVisible) return;
      isVisible = true;
      setActive(activeIndex, false);
      scheduleAutoplay();
    };
    const stop = () => {
      isVisible = false;
      clearAutoplay();
    };

    if (!('IntersectionObserver' in window)) {
      start();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) start();
        else stop();
      });
    }, { threshold: 0.18 });

    observer.observe(slider);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseCasesSlider, { once: true });
  } else {
    initialiseCasesSlider();
  }
})();
