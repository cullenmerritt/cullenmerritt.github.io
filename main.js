// Motion and small behaviors for the portfolio. No libraries.
// With JavaScript off or reduced motion on, every page still reads top to
// bottom with all content visible and the drawings shown at rest.

(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const rad = (d) => (d * Math.PI) / 180;

  // ---------------------------------------------------------------
  // 0. Statement words, so they can light up one at a time
  document.querySelectorAll('[data-words]').forEach((p) => {
    const parts = p.textContent.trim().split(/\s+/);
    p.innerHTML = parts.map((w) => `<span class="w">${w}</span>`).join(' ');
  });

  // ---------------------------------------------------------------
  // 1. Retractable grouser wheel
  //    Cam timing from cam_profile.m, in cam angle t (increases with rotation):
  //      rise 60 to 180, extended dwell 180 to 226, fall 226 to 300,
  //      retracted dwell 300 to 60. Cycloidal rise and fall.
  //    Screen angle s (unit circle, 0 at 3 o'clock, soil contact at 270) maps
  //    to cam angle by t = 495 - s, so a grouser is fully extended at 315,
  //    just before it meets the soil, and the wheel turns clockwise.
  //    Geometry in mm: cam surface 70 to 110, blade 80 long, rim 150.
  const cyc = (x) => x - Math.sin(2 * Math.PI * x) / (2 * Math.PI);
  function lift(t) {
    t = ((t % 360) + 360) % 360;
    if (t >= 60 && t < 180) return cyc((t - 60) / 120);
    if (t >= 180 && t < 226) return 1;
    if (t >= 226 && t < 300) return 1 - cyc((t - 226) / 74);
    return 0;
  }
  const camR = (s) => 70 + 40 * lift(495 - s);

  function grouserWheel(svg) {
    const N = +(svg.dataset.grousers || 12);
    // Stationary cam
    let d = '';
    for (let s = 0; s <= 360; s += 2) {
      const r = camR(s);
      d += (s ? 'L' : 'M') + (r * Math.cos(rad(s))).toFixed(1) + ' ' + (-r * Math.sin(rad(s))).toFixed(1);
    }
    el('path', { d: d + 'Z', class: 'art art-mid gold-stroke' }, svg);
    el('circle', { cx: 0, cy: 0, r: 24, class: 'art art-mid' }, svg);
    el('circle', { cx: 0, cy: 0, r: 8, class: 'art art-thin' }, svg);
    // Rim
    el('circle', { cx: 0, cy: 0, r: 150, class: 'art art-bold' }, svg);
    el('circle', { cx: 0, cy: 0, r: 138, class: 'art art-thin' }, svg);
    const blades = [];
    for (let i = 0; i < N; i++) {
      const g = el('g', {}, svg);
      const guide = el('line', { class: 'art art-thin', opacity: 0.6 }, g);
      const blade = el('line', { class: 'art', 'stroke-width': 3, opacity: 0.55 }, g);
      const out = el('line', { class: 'art', 'stroke-width': 9 }, g);
      const tip = el('circle', { r: 5, class: 'gold-fill' }, g);
      blades.push({ guide, blade, out, tip, base: (360 / N) * i });
    }
    function draw(phi) {
      blades.forEach((b) => {
        const s = b.base - phi; // clockwise rotation lowers the screen angle
        const r0 = camR(s), r1 = r0 + 80;
        const c = Math.cos(rad(s)), n = -Math.sin(rad(s));
        b.blade.setAttribute('x1', (r0 * c).toFixed(1)); b.blade.setAttribute('y1', (r0 * n).toFixed(1));
        b.blade.setAttribute('x2', (r1 * c).toFixed(1)); b.blade.setAttribute('y2', (r1 * n).toFixed(1));
        b.tip.setAttribute('cx', (r0 * c).toFixed(1)); b.tip.setAttribute('cy', (r0 * n).toFixed(1));
        // exposed part of the grouser, outside the rim
        const ro = Math.max(150, r1 - 0.01);
        b.out.setAttribute('x1', (150 * c).toFixed(1)); b.out.setAttribute('y1', (150 * n).toFixed(1));
        b.out.setAttribute('x2', (ro * c).toFixed(1)); b.out.setAttribute('y2', (ro * n).toFixed(1));
        b.out.setAttribute('opacity', r1 > 151 ? 1 : 0);
        b.guide.setAttribute('x1', (128 * c).toFixed(1)); b.guide.setAttribute('y1', (128 * n).toFixed(1));
        b.guide.setAttribute('x2', (158 * c).toFixed(1)); b.guide.setAttribute('y2', (158 * n).toFixed(1));
      });
    }
    draw(0);
    return { el: svg, update: (now) => draw(now / 1000 * 22 + window.scrollY * 0.12) };
  }

  // ---------------------------------------------------------------
  // 2. Robotic hand, front view, fingers curling toward the viewer.
  //    Each finger has three phalanges; a segment's drawn height is its
  //    length times the cosine of its total bend, so curled fingertips fold
  //    down over the palm.
  function robotHand(svg) {
    const g = el('g', {}, svg);
    el('path', { d: 'M152 206 L156 238 M242 206 L238 238', class: 'art art-mid' }, g);
    el('rect', { x: 132, y: 116, width: 130, height: 92, rx: 22, class: 'art art-mid' }, g);
    const fingers = [
      { x: 136, w: 28, y: 120, L: [40, 25, 21] },
      { x: 168, w: 29, y: 113, L: [46, 29, 23] },
      { x: 201, w: 28, y: 117, L: [42, 27, 21] },
      { x: 233, w: 24, y: 129, L: [32, 20, 18] },
    ];
    fingers.forEach((f) => {
      el('line', { x1: f.x + f.w / 2, y1: f.y + 6, x2: f.x + f.w / 2, y2: 232, class: 'art art-thin', 'stroke-dasharray': '3 5', opacity: 0.6 }, g);
      f.segs = f.L.map(() => el('rect', { class: 'art art-mid' }, g));
    });
    const thumb = el('g', {}, g);
    el('rect', { x: -13, y: -40, width: 26, height: 40, rx: 8, class: 'art art-mid' }, thumb);
    const t2g = el('g', { transform: 'translate(0,-43)' }, thumb);
    el('rect', { x: -12, y: -30, width: 24, height: 30, rx: 12, class: 'art art-mid' }, t2g);
    function draw(c) {
      fingers.forEach((f, i) => {
        const k = clamp(c - i * 0.04, 0, 1);
        const ang = [80 * k, 100 * k, 65 * k];
        let y = f.y, cum = 0;
        f.segs.forEach((seg, j) => {
          cum += ang[j];
          const h = f.L[j] * Math.cos(rad(cum));
          const w = f.w - j * 2;
          const hh = Math.max(Math.abs(h), 9), top = h >= 0 ? y - hh : y;
          seg.setAttribute('x', f.x + j); seg.setAttribute('width', w);
          seg.setAttribute('y', top.toFixed(1)); seg.setAttribute('height', hh.toFixed(1));
          seg.setAttribute('rx', Math.min(j === 2 ? w / 2 : 7, hh / 2).toFixed(1));
          y = h >= 0 ? y - hh - 3 : y + hh + 3;
        });
      });
      thumb.setAttribute('transform', `translate(140 192) rotate(${-42 + 66 * c})`);
      t2g.setAttribute('transform', `translate(0 -43) rotate(${25 * c})`);
    }
    draw(0);
    return {
      el: svg,
      update: (now) => {
        const p = (now / 3600) % 1;
        let c = 0;
        if (p < 0.2) c = 0; else if (p < 0.5) c = cyc((p - 0.2) / 0.3);
        else if (p < 0.65) c = 1; else if (p < 0.95) c = 1 - cyc((p - 0.65) / 0.3);
        draw(c);
      },
    };
  }

  const jsAnims = [];
  document.querySelectorAll('svg[data-grouser-wheel]').forEach((s) => jsAnims.push(grouserWheel(s)));
  document.querySelectorAll('svg[data-robot-hand]').forEach((s) => jsAnims.push(robotHand(s)));

  // ---------------------------------------------------------------
  // 3. Life page albums, filled from photos.js
  if (window.PHOTOS) {
    window.PHOTOS.forEach((p) => {
      const album = document.querySelector(`[data-album="${p.section}"]`);
      if (!album) return;
      const fig = document.createElement('figure');
      const img = document.createElement('img');
      img.src = p.src; img.alt = p.caption || ''; img.loading = 'lazy';
      img.onerror = () => fig.remove();
      fig.appendChild(img);
      if (p.caption) {
        const cap = document.createElement('figcaption');
        cap.textContent = p.caption;
        fig.appendChild(cap);
      }
      album.querySelector('.photos').appendChild(fig);
      album.hidden = false;
    });
  }

  // ---------------------------------------------------------------
  // 4. Reveal on scroll, start drawings, count numbers
  function format(node, v) {
    const dcm = +(node.dataset.decimals || 0);
    return (node.dataset.prefix || '') + v.toFixed(dcm) + (node.dataset.suffix || '');
  }
  function countUp(node) {
    node.dataset.done = '1';
    const target = +node.dataset.count, t0 = performance.now();
    const step = (t) => {
      const p = clamp((t - t0) / 1400, 0, 1);
      node.textContent = format(node, target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const revealables = document.querySelectorAll('[data-reveal], .anim, [data-count]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealables.forEach((n) => n.classList.add('is-in'));
    document.querySelectorAll('[data-count]').forEach((n) => (n.textContent = format(n, +n.dataset.count)));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const n = e.target;
        if (n.classList.contains('anim')) { n.classList.toggle('is-in', e.isIntersecting); return; }
        if (e.isIntersecting) {
          n.classList.add('is-in');
          if (n.dataset.count && !n.dataset.done) countUp(n);
          io.unobserve(n);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    revealables.forEach((n) => io.observe(n));
  }

  // ---------------------------------------------------------------
  // 5. Carousel buttons
  document.querySelectorAll('[data-rail]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rail = document.getElementById(btn.dataset.rail);
      const card = rail.querySelector('.card');
      const step = card ? card.getBoundingClientRect().width + 20 : 300;
      rail.scrollBy({ left: btn.dataset.dir === 'next' ? step : -step, behavior: 'smooth' });
    });
  });

  if (reduce) return;

  // ---------------------------------------------------------------
  // 6. Frame loop for the JavaScript drawings, only while on screen
  const visible = new Set();
  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    });
    jsAnims.forEach((a) => vio.observe(a.el));
  }
  function loop(now) {
    jsAnims.forEach((a) => { if (visible.has(a.el)) a.update(now); });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ---------------------------------------------------------------
  // 7. Scroll-linked motion: hero copy lifts away, wheel grows a little,
  //    statement lights up word by word while pinned
  const heroCopy = document.querySelector('.hero__copy');
  const heroWheel = document.querySelector('.hero__wheel');
  const statement = document.querySelector('.statement');
  const words = statement ? statement.querySelectorAll('.w') : [];
  let ticking = false;
  function frame() {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    if (heroWheel) heroWheel.style.transform = `scale(${1 + clamp(y / vh, 0, 1.2) * 0.12})`;
    if (heroCopy) {
      const p = clamp(y / (vh * 0.6), 0, 1);
      heroCopy.style.transform = `translateY(${p * -40}px)`;
      heroCopy.style.opacity = String(1 - p);
    }
    if (statement && words.length) {
      const r = statement.getBoundingClientRect();
      const p = clamp((-r.top + vh * 0.15) / (r.height - vh), 0, 1);
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    }
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
})();
