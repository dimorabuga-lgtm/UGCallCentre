(() => {
  'use strict';

  const initialiseNavigation = () => {
    const header = document.querySelector('.site-header, [data-navigation]');
    if (!header) return;

    const navigation = header.querySelector('.main-nav, [data-navigation-menu]');
    const toggle = header.querySelector('.menu-toggle, [data-navigation-toggle]');
    const links = [...header.querySelectorAll('a[href^="#"]')];
    const sections = links
      .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
      .filter(({ section }) => section);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const backToTop = document.querySelector('.back-to-top');
    const mobileCta = document.querySelector('.mobile-footer-cta');
    const contact = document.querySelector('#contact');
    let previousScrollY = window.scrollY;
    let ticking = false;

    header.style.transition = 'transform var(--duration-base) var(--ease-standard)';

    const closeMenu = () => {
      header.classList.remove('menu-open');
      document.body.classList.remove('menu-is-open');
      toggle?.setAttribute('aria-expanded', 'false');
      toggle?.setAttribute('aria-label', 'Відкрити меню');
    };

    const setActiveLink = (section) => {
      sections.forEach(({ link, section: target }) => {
        const active = target === section;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    };

    const updateHeader = () => {
      const currentScrollY = window.scrollY;
      const pastHeader = currentScrollY > header.offsetHeight;
      const scrollingDown = currentScrollY > previousScrollY;

      header.classList.toggle('scrolled', currentScrollY > 0);
      backToTop?.classList.toggle('is-visible', currentScrollY > window.innerHeight * 0.7);
      header.classList.toggle('nav-hidden', pastHeader && scrollingDown && !header.classList.contains('menu-open'));
      header.classList.toggle('nav-visible', !pastHeader || !scrollingDown);
      header.style.transform = pastHeader && scrollingDown && !header.classList.contains('menu-open')
        ? 'translateY(-100%)'
        : 'translateY(0)';
      previousScrollY = currentScrollY;
      ticking = false;
    };

    const requestHeaderUpdate = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    const scrollToSection = (event) => {
      const link = event.currentTarget;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      closeMenu();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      window.history.replaceState(null, '', link.getAttribute('href'));
    };

    toggle?.addEventListener('click', () => {
      const open = header.classList.toggle('menu-open');
      document.body.classList.toggle('menu-is-open', open);
      header.classList.remove('nav-hidden');
      header.style.transform = 'translateY(0)';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    });

    links.forEach((link) => link.addEventListener('click', scrollToSection));

    const sectionObserver = new IntersectionObserver((entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (visibleSection) setActiveLink(visibleSection.target);
    }, {
      rootMargin: `-${header.offsetHeight}px 0px -55%`,
      threshold: [0.1, 0.3, 0.6]
    });

    sections.forEach(({ section }) => sectionObserver.observe(section));
    window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
    window.addEventListener('resize', requestHeaderUpdate, { passive: true });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
    if (mobileCta && contact && 'IntersectionObserver' in window) {
      const contactObserver = new IntersectionObserver((entries) => {
        mobileCta.hidden = entries[0].isIntersecting;
      }, { threshold: 0.18 });
      contactObserver.observe(contact);
    }

    if (navigation) navigation.setAttribute('data-ready', 'true');
    updateHeader();
  };

  if (window.UGCallCentre) {
    window.UGCallCentre.register('navigation', initialiseNavigation);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseNavigation, { once: true });
  } else {
    initialiseNavigation();
  }
})();
