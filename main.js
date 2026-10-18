// Scroll motion for the portfolio. No libraries.
// Everything here is decoration: with JavaScript off or reduced motion on,
// the page still reads top to bottom with all content visible.

(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // 0. Wrap each word of the statement so it can light up on scroll
  document.querySelectorAll('[data-words]').forEach((p) => {
    const parts = p.textContent.trim().split(/\s+/);
    p.innerHTML = parts.map((w) => `<span class="w">${w}</span>`).join(' ');
  });

  // 1. Reveal elements and start drawings when they enter the screen
  const revealables = document.querySelectorAll('[data-reveal], .anim, [data-count]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'));
    document.querySelectorAll('[data-count]').forEach((el) => (el.textContent = format(el, +el.dataset.count)));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const el = e.target;
        if (el.classList.contains('anim')) {
          el.classList.toggle('is-in', e.isIntersecting); // drawings pause off screen
          return;
        }
        if (e.isIntersecting) {
          el.classList.add('is-in');
          if (el.dataset.count && !el.dataset.done) countUp(el);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    revealables.forEach((el) => io.observe(el));
  }

  // 2. Count-up numbers
  function format(el, v) {
    const d = +(el.dataset.decimals || 0);
    return (el.dataset.prefix || '') + v.toFixed(d) + (el.dataset.suffix || '');
  }
  function countUp(el) {
    el.dataset.done = '1';
    const target = +el.dataset.count;
    const dur = 1400;
    const t0 = performance.now();
    const step = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(el, target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // 4. Carousel buttons
  document.querySelectorAll('[data-rail]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rail = document.getElementById(btn.dataset.rail);
      const card = rail.querySelector('.card');
      const step = card ? card.getBoundingClientRect().width + 20 : 300;
      rail.scrollBy({ left: btn.dataset.dir === 'next' ? step : -step, behavior: 'smooth' });
    });
  });

  if (reduce) return;

  // 3. Scroll-linked motion: hero wheel turns, hero copy lifts away,
  //    and the statement lights up word by word while it is pinned
  const heroCopy = document.querySelector('.hero__copy');
  const wheel = document.querySelector('.hero__wheel');
  const statement = document.querySelector('.statement');
  const words = statement ? statement.querySelectorAll('.w') : [];

  let ticking = false;
  function frame() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;

    if (wheel) {
      const p = clamp(y / vh, 0, 1.2);
      wheel.style.transform = `rotate(${y * 0.18}deg) scale(${1 + p * 0.12})`;
    }
    if (heroCopy) {
      const p = clamp(y / (vh * 0.6), 0, 1);
      heroCopy.style.transform = `translateY(${p * -40}px)`;
      heroCopy.style.opacity = String(1 - p);
    }
    if (statement && words.length) {
      const r = statement.getBoundingClientRect();
      const span = r.height - vh;
      const p = clamp((-r.top + vh * 0.15) / span, 0, 1);
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

})();
