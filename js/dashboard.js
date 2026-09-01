(() => {
  'use strict';

  const formatNumber = (value) => new Intl.NumberFormat('uk-UA').format(value);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCounter = (element, target, duration = 1150) => {
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const from = Number(element.dataset.currentValue || 0);
    const startedAt = performance.now();
    const animationDuration = reducedMotion ? 0 : duration;

    const render = (time) => {
      const progress = animationDuration ? Math.min((time - startedAt) / animationDuration, 1) : 1;
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (target - from) * eased);
      element.textContent = `${prefix}${formatNumber(value)}${suffix}`;
      if (progress < 1) requestAnimationFrame(render);
      else element.dataset.currentValue = String(target);
    };

    requestAnimationFrame(render);
  };

  const initialiseProcessDashboard = () => {
    const dashboard = document.querySelector('[data-process-dashboard]');
    if (!dashboard) return;

    const status = dashboard.querySelector('[data-process-status]');
    const mobileStatus = dashboard.querySelector('[data-process-mobile-status]');
    const operator = dashboard.querySelector('[data-process-operator]');
    const amount = dashboard.querySelector('[data-process-amount]');
    const mobileAmount = dashboard.querySelector('[data-process-mobile-amount]');
    const upsell = dashboard.querySelector('[data-process-upsell]');
    const row = dashboard.querySelector('.is-live-order');
    const clock = dashboard.querySelector('[data-process-clock]');
    const orderTime = dashboard.querySelector('[data-process-time]');
    const mobileTime = dashboard.querySelector('[data-process-mobile-time]');
    const toast = dashboard.querySelector('[data-process-toast]');
    const steps = [...dashboard.querySelectorAll('[data-process-step]')];
    let cycleTimer = 0;
    let toastTimer = 0;
    let rowTimer = 0;
    let isRunning = false;

    const stages = [
      { id: 1, time: '09:31', status: 'Нова заявка', statusClass: 'new', operator: 'Очікує призначення', amount: '2399 грн', upsell: '', toast: 'Нова заявка отримана з LP-CRM' },
      { id: 2, time: '09:32', status: 'У роботі', statusClass: 'work', operator: 'Анна', amount: '2399 грн', upsell: '', toast: 'Оператора призначено' },
      { id: 3, time: '09:34', status: 'Підтверджено', statusClass: 'confirmed', operator: 'Анна', amount: '2399 грн', upsell: '', toast: 'Замовлення підтверджено' },
      { id: 4, time: '09:35', status: 'Підтверджено', statusClass: 'confirmed', operator: 'Анна', amount: '3039 грн', upsell: '+640 грн допродаж', toast: 'Допродаж додано: +640 грн' },
      { id: 5, time: '09:36', status: 'Передано в доставку', statusClass: 'delivery', operator: 'Анна', amount: '3039 грн', upsell: '+640 грн допродаж', toast: 'Дані передано до Нової пошти' }
    ];

    const updateTime = (element, value) => {
      if (!element) return;
      element.dateTime = value;
      element.textContent = value;
    };

    const showToast = (message) => {
      if (!toast) return;
      window.clearTimeout(toastTimer);
      toast.textContent = message;
      toastTimer = window.setTimeout(() => {
        toast.textContent = '';
      }, 2400);
    };

    const renderStage = (stage) => {
      [status, mobileStatus].filter(Boolean).forEach((element) => {
        element.className = `process-status process-status--${stage.statusClass}`;
        element.textContent = stage.status;
      });
      if (operator) operator.textContent = stage.operator;
      [amount, mobileAmount].filter(Boolean).forEach((element) => {
        element.textContent = stage.amount;
      });
      if (upsell) upsell.textContent = stage.upsell;
      [clock, orderTime, mobileTime].forEach((element) => updateTime(element, stage.time));
      steps.forEach((step) => step.classList.toggle('is-active', Number(step.dataset.processStep) === stage.id));
      row?.classList.add('is-updating');
      window.clearTimeout(rowTimer);
      if (reducedMotion) row?.classList.remove('is-updating');
      else rowTimer = window.setTimeout(() => row?.classList.remove('is-updating'), 650);
      showToast(stage.toast);
    };

    const clearTimers = () => {
      window.clearTimeout(cycleTimer);
      window.clearTimeout(toastTimer);
      window.clearTimeout(rowTimer);
      cycleTimer = 0;
      toastTimer = 0;
      rowTimer = 0;
    };

    const runStage = (index) => {
      if (!isRunning) return;
      renderStage(stages[index]);
      if (reducedMotion) return;

      const delay = index === stages.length - 1 ? 3000 : 2800;
      cycleTimer = window.setTimeout(() => {
        runStage((index + 1) % stages.length);
      }, delay);
    };

    const start = () => {
      if (isRunning) return;
      isRunning = true;
      runStage(0);
    };

    const stop = () => {
      if (!isRunning) return;
      isRunning = false;
      clearTimers();
      if (toast) toast.textContent = '';
      row?.classList.remove('is-updating');
    };

    if (!('IntersectionObserver' in window)) {
      start();
      return;
    }

    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) start();
        else stop();
      });
    }, { threshold: 0.18 });

    visibilityObserver.observe(dashboard);
  };

  const initialiseDashboard = () => {
    const salesBoard = document.querySelector('[data-hero-sales]');
    if (salesBoard) {
      const tabs = [...salesBoard.querySelectorAll('[data-sales-tab]')];
      const lanes = [...salesBoard.querySelectorAll('[data-sales-lane]')];
      const activateLane = (name) => {
        tabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.salesTab === name)));
        lanes.forEach((lane) => lane.classList.toggle('is-active', lane.dataset.salesLane === name));
      };
      tabs.forEach((tab) => tab.addEventListener('click', () => activateLane(tab.dataset.salesTab)));
    }
    initialiseProcessDashboard();
    const hero = document.querySelector('.hero-saas');
    const revenue = document.querySelector('[data-live-revenue]');
    const trend = document.querySelector('[data-live-revenue-trend]');
    const operatorLabels = document.querySelectorAll('[data-live-operators]');
    const lead = document.querySelector('[data-live-lead]');
    let liveStarted = false;
    let revenueValue = Number(revenue?.dataset.dashboardCounter || 0);
    let operators = 18;

    const updateOperators = () => {
      operatorLabels.forEach((label) => {
        label.textContent = label.closest('.crm-activity') ? `${operators} онлайн` : `${operators} операторів онлайн`;
      });
    };

    const updateLiveKpis = () => {
      if (document.hidden || !revenue) return;
      revenueValue += 840 + Math.floor(Math.random() * 1680);
      operators = Math.max(10, Math.min(15, operators + (Math.random() > 0.56 ? 1 : -1)));
      animateCounter(revenue, revenueValue, 780);
      revenue.closest('.crm-metric')?.classList.add('is-updating');
      window.setTimeout(() => revenue.closest('.crm-metric')?.classList.remove('is-updating'), 800);
      if (trend) trend.textContent = `${(18 + Math.random() * 1.8).toFixed(1)}%`;
      if (lead) lead.textContent = Math.random() > 0.5 ? 'Нова заявка' : 'Лід у роботі';
      updateOperators();
    };

    const startLiveKpis = () => {
      if (liveStarted) return;
      liveStarted = true;
      updateOperators();
      if (reducedMotion) return;

      const scheduleUpdate = () => {
        window.setTimeout(() => {
          updateLiveKpis();
          scheduleUpdate();
        }, 9000);
      };
      scheduleUpdate();
    };

    const revealDashboard = () => {
      hero?.classList.add('is-dashboard-ready');
      startLiveKpis();
    };

    if (!('IntersectionObserver' in window)) {
      revealDashboard();
      return;
    }

    if (hero) {
      const heroObserver = new IntersectionObserver((entries, activeObserver) => {
        if (!entries[0].isIntersecting) return;
        revealDashboard();
        activeObserver.disconnect();
      }, { threshold: 0.18 });
      heroObserver.observe(hero);
    } else {
      startLiveKpis();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseDashboard, { once: true });
  } else {
    initialiseDashboard();
  }
})();
