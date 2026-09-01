(() => {
  const section = document.querySelector('.partner-reviews');
  const track = document.querySelector('[data-reviews-track]');
  const previous = document.querySelector('[data-reviews-prev]');
  const next = document.querySelector('[data-reviews-next]');
  if (!section || !track || !previous || !next) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let autoplayTimer = null;
  let resumeTimer = null;
  let userStoppedAutoplay = false;
  section.classList.add('reviews-enhanced');

  const reveal = () => section.classList.add('is-visible');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) reveal();
  else {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      reveal();
      startAutoplay();
      observer.disconnect();
    }, { threshold: 0.16 });
    observer.observe(section);
  }

  const step = () => {
    const card = track.querySelector('.partner-review-card');
    if (!card) return track.clientWidth;
    return card.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
  };
  const atEnd = () => track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  const updateControls = () => {
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = atEnd();
  };
  const move = (direction) => track.scrollBy({ left: direction * step(), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  const clearAutoplay = () => {
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  };
  const startAutoplay = () => {
    clearAutoplay();
    if (reducedMotion.matches || userStoppedAutoplay) return;
    autoplayTimer = window.setInterval(() => {
      if (atEnd()) track.scrollTo({ left: 0, behavior: 'smooth' });
      else move(1);
    }, 8000);
  };
  const stopAfterInteraction = () => {
    userStoppedAutoplay = true;
    window.clearTimeout(resumeTimer);
    clearAutoplay();
  };
  const pauseAutoplay = () => {
    window.clearTimeout(resumeTimer);
    clearAutoplay();
  };
  const resumeAutoplayLater = () => {
    if (userStoppedAutoplay || reducedMotion.matches) return;
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(startAutoplay, 12000);
  };

  previous.addEventListener('click', () => { stopAfterInteraction(); move(-1); });
  next.addEventListener('click', () => { stopAfterInteraction(); move(1); });
  track.addEventListener('scroll', updateControls, { passive: true });
  track.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stopAfterInteraction();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  track.addEventListener('pointerdown', stopAfterInteraction, { passive: true });
  track.addEventListener('touchstart', stopAfterInteraction, { passive: true });
  track.addEventListener('wheel', stopAfterInteraction, { passive: true });
  section.addEventListener('mouseenter', pauseAutoplay);
  section.addEventListener('mouseleave', resumeAutoplayLater);
  section.addEventListener('focusin', pauseAutoplay);
  section.addEventListener('focusout', resumeAutoplayLater);
  reducedMotion.addEventListener('change', () => reducedMotion.matches ? clearAutoplay() : startAutoplay());
  window.addEventListener('resize', updateControls, { passive: true });
  updateControls();
  if (!('IntersectionObserver' in window)) startAutoplay();
})();
