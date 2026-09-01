(() => {
  'use strict';

  const initialiseAnimations = () => {
    if (window.lucide) window.lucide.createIcons();

    const hero = document.querySelector('.hero-saas');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hero) {
      const revealItems = hero.querySelectorAll('[data-hero-reveal]');
      const parallaxItems = hero.querySelectorAll('[data-hero-parallax]');

      if (!reducedMotion) hero.classList.add('is-motion-ready');
      requestAnimationFrame(() => hero.classList.add('is-ready'));

      if (!('IntersectionObserver' in window)) {
        revealItems.forEach((item) => item.classList.add('is-visible'));
      } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        }, { threshold: 0.12 });

        revealItems.forEach((item) => revealObserver.observe(item));
      }

      if (!reducedMotion && window.matchMedia('(min-width: 54rem)').matches) {
      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;

      const updateParallax = () => {
        parallaxItems.forEach((item) => {
          const depth = Number(item.dataset.heroParallax);
          item.style.translate = `${pointerX * depth * 160}px ${pointerY * depth * 110}px`;
        });
        frame = 0;
      };

      hero.addEventListener('pointermove', (event) => {
        const bounds = hero.getBoundingClientRect();
        pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
        pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
        if (!frame) frame = requestAnimationFrame(updateParallax);
      }, { passive: true });

      hero.addEventListener('pointerleave', () => {
        pointerX = 0;
        pointerY = 0;
        if (!frame) frame = requestAnimationFrame(updateParallax);
      }, { passive: true });
      }

      hero.querySelectorAll('[data-ripple]').forEach((button) => {
        const createRipple = (clientX, clientY) => {
          if (reducedMotion) return;
          const bounds = button.getBoundingClientRect();
          const ripple = document.createElement('span');
          ripple.className = 'hero-ripple';
          ripple.style.left = `${clientX - bounds.left}px`;
          ripple.style.top = `${clientY - bounds.top}px`;
          button.append(ripple);
          ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        };

        button.addEventListener('pointerdown', (event) => {
          createRipple(event.clientX, event.clientY);
        });

        button.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          const bounds = button.getBoundingClientRect();
          createRipple(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
        });
      });
    }

    const services = document.querySelector('.ug-services');
    if (!services) return;

    const serviceContent = services.querySelector('[data-services-reveal]');
    const serviceCards = [...services.querySelectorAll('[data-services-card]')];
    if (!reducedMotion) services.classList.add('is-motion-ready');
    const animateServiceNumber = (element) => {
      const target = Number(element.dataset.serviceCounter);
      const duration = reducedMotion ? 0 : 560;
      const startedAt = performance.now();

      const tick = (time) => {
        const progress = duration ? Math.min((time - startedAt) / duration, 1) : 1;
        element.textContent = String(Math.max(0, Math.ceil(target * progress))).padStart(2, '0');
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const revealServices = () => {
      serviceContent?.classList.add('is-visible');
      serviceCards.forEach((card, index) => {
        window.setTimeout(() => {
          card.classList.add('is-visible');
          const counter = card.querySelector('[data-service-counter]');
          if (counter) animateServiceNumber(counter);
        }, reducedMotion ? 0 : index * 90);
      });
    };

    if (!('IntersectionObserver' in window)) {
      revealServices();
    } else {
      const servicesObserver = new IntersectionObserver((entries, observer) => {
        if (!entries[0].isIntersecting) return;
        revealServices();
        observer.disconnect();
      }, { threshold: 0.16 });

      servicesObserver.observe(services);
    }

    const serviceGrid = services.querySelector('[data-services-parallax]');
    if (serviceGrid && !reducedMotion && window.matchMedia('(min-width: 64rem)').matches) {
      let frame = 0;
      let offsetX = 0;
      let offsetY = 0;

      const updateGrid = () => {
        serviceGrid.style.translate = `${offsetX * 16}px ${offsetY * 12}px`;
        frame = 0;
      };

      services.addEventListener('pointermove', (event) => {
        const bounds = services.getBoundingClientRect();
        offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
        offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
        if (!frame) frame = requestAnimationFrame(updateGrid);
      }, { passive: true });

      services.addEventListener('pointerleave', () => {
        offsetX = 0;
        offsetY = 0;
        if (!frame) frame = requestAnimationFrame(updateGrid);
      }, { passive: true });
    }

    const whyUg = document.querySelector('.why-ug');
    if (!whyUg) return;

    const whyHeader = whyUg.querySelector('[data-why-reveal]');
    const whyCards = [...whyUg.querySelectorAll('[data-why-card]')];

    if (!reducedMotion) whyUg.classList.add('is-motion-ready');

    const revealWhyUg = () => {
      whyHeader?.classList.add('is-visible');
      whyCards.forEach((card, index) => {
        window.setTimeout(() => card.classList.add('is-visible'), reducedMotion ? 0 : 110 + index * 85);
      });
    };

    if (!('IntersectionObserver' in window)) {
      revealWhyUg();
    } else {
      const whyUgObserver = new IntersectionObserver((entries, observer) => {
        if (!entries[0].isIntersecting) return;
        revealWhyUg();
        observer.disconnect();
      }, { threshold: 0.14 });

      whyUgObserver.observe(whyUg);
    }

    const processDashboard = document.querySelector('.process-dashboard');
    if (processDashboard) {
      const processCopy = processDashboard.querySelector('[data-process-reveal]');
      if (!reducedMotion) processDashboard.classList.add('is-motion-ready');

      const revealProcessDashboard = () => processCopy?.classList.add('is-visible');

      if (!('IntersectionObserver' in window)) {
        revealProcessDashboard();
      } else {
        const processObserver = new IntersectionObserver((entries, observer) => {
          if (!entries[0].isIntersecting) return;
          revealProcessDashboard();
          observer.disconnect();
        }, { threshold: 0.14 });

        processObserver.observe(processDashboard);
      }
    }

    const results = document.querySelector('.measurable-results');
    if (!results) return;

    const resultsRevealItems = [...results.querySelectorAll('[data-results-reveal]')];
    const resultsCards = [...results.querySelectorAll('[data-results-card]')];

    if (!reducedMotion) results.classList.add('is-motion-ready');

    const revealResults = () => {
      resultsRevealItems.forEach((item, index) => {
        window.setTimeout(() => item.classList.add('is-visible'), reducedMotion ? 0 : index * 120);
      });

      resultsCards.forEach((card, index) => {
        window.setTimeout(() => card.classList.add('is-visible'), reducedMotion ? 0 : 120 + index * 90);
      });
    };

    if (!('IntersectionObserver' in window)) {
      revealResults();
    } else {
      const resultsObserver = new IntersectionObserver((entries, observer) => {
        if (!entries[0].isIntersecting) return;
        revealResults();
        observer.disconnect();
      }, { threshold: 0.14 });

      resultsObserver.observe(results);
    }

    const clientCases = document.querySelector('.client-cases');
    if (!clientCases) return;

    const casesHeader = clientCases.querySelector('[data-cases-reveal]');
    if (!reducedMotion) clientCases.classList.add('is-motion-ready');

    const revealCases = () => casesHeader?.classList.add('is-visible');

    if (!('IntersectionObserver' in window)) {
      revealCases();
    } else {
      const casesObserver = new IntersectionObserver((entries, observer) => {
        if (!entries[0].isIntersecting) return;
        revealCases();
        observer.disconnect();
      }, { threshold: 0.14 });

      casesObserver.observe(clientCases);
    }

    const pricing = document.querySelector('.pricing-benefits');
    if (!pricing) return;

    const pricingReveal = pricing.querySelector('[data-pricing-reveal]');
    const pricingCards = [...pricing.querySelectorAll('[data-pricing-card]')];
    if (!reducedMotion) pricing.classList.add('is-motion-ready');

    const revealPricing = () => {
      pricingReveal?.classList.add('is-visible');
      pricingCards.forEach((card, index) => {
        window.setTimeout(() => card.classList.add('is-visible'), reducedMotion ? 0 : 120 + index * 90);
      });
    };

    if (!('IntersectionObserver' in window)) {
      revealPricing();
    } else {
      const pricingObserver = new IntersectionObserver((entries, observer) => {
        if (!entries[0].isIntersecting) return;
        revealPricing();
        observer.disconnect();
      }, { threshold: 0.14 });

      pricingObserver.observe(pricing);
    }

    const faq = document.querySelector('.faq-premium');
    if (!faq) return;

    const faqIntro = faq.querySelector('[data-faq-reveal]');
    const faqItems = [...faq.querySelectorAll('[data-faq-item]')];
    if (!reducedMotion) faq.classList.add('is-motion-ready');

    const revealFaq = () => {
      faqIntro?.classList.add('is-visible');
      faqItems.forEach((item, index) => {
        window.setTimeout(() => item.classList.add('is-visible'), reducedMotion ? 0 : 90 + index * 65);
      });
    };

    if (!('IntersectionObserver' in window)) {
      revealFaq();
    } else {
      const faqObserver = new IntersectionObserver((entries, observer) => {
        if (!entries[0].isIntersecting) return;
        revealFaq();
        observer.disconnect();
      }, { threshold: 0.12 });

      faqObserver.observe(faq);
    }

    const contact = document.querySelector('.contact');
    if (!contact) return;
    const contactItems = [...contact.querySelectorAll('[data-contact-reveal]')];
    if (!reducedMotion) contact.classList.add('is-motion-ready');
    const revealContact = () => contactItems.forEach((item, index) => {
      window.setTimeout(() => item.classList.add('is-visible'), reducedMotion ? 0 : index * 120);
    });
    if (!('IntersectionObserver' in window)) revealContact();
    else {
      const contactObserver = new IntersectionObserver((entries, observer) => {
        if (!entries[0].isIntersecting) return;
        revealContact(); observer.disconnect();
      }, { threshold: 0.12 });
      contactObserver.observe(contact);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseAnimations, { once: true });
  } else {
    initialiseAnimations();
  }
})();
