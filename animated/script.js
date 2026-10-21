(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Loader ----------
  document.body.classList.add('loading');
  const finishLoading = () => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  };
  window.addEventListener('load', () => setTimeout(finishLoading, reduceMotion ? 0 : 900));
  setTimeout(finishLoading, 3500); // never block the page on a slow asset

  $('#year').textContent = new Date().getFullYear();

  // ---------- Split headings into animated characters ----------
  $$('.split').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    el.setAttribute('aria-label', words.join(' '));
    let i = 0;
    words.forEach((word, w) => {
      const wrap = document.createElement('span');
      wrap.style.display = 'inline-block';
      wrap.setAttribute('aria-hidden', 'true');
      [...word].forEach((ch) => {
        const c = document.createElement('span');
        c.className = 'char';
        c.textContent = ch;
        c.style.transitionDelay = `${i++ * 0.025}s`;
        wrap.appendChild(c);
      });
      el.appendChild(wrap);
      if (w < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  // ---------- Scroll reveal ----------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .split, .step').forEach((el) => revealObserver.observe(el));

  // ---------- Counters ----------
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countObserver.unobserve(e.target);
      const el = e.target, target = +el.dataset.count;
      if (reduceMotion) { el.textContent = target; return; }
      const start = performance.now(), dur = 1800;
      const tick = (t) => {
        const p = Math.min((t - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countObserver.observe(el));

  // ---------- Rotating hero word ----------
  const rotator = $('#rotator');
  const words = ['Iconic.', 'Bold.', 'Timeless.', 'Unforgettable.'];
  let wi = 0;
  if (!reduceMotion) {
    setInterval(() => {
      rotator.classList.remove('swap-in');
      rotator.classList.add('swap');
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        rotator.textContent = words[wi];
        rotator.classList.remove('swap');
        rotator.classList.add('swap-in');
      }, 450);
    }, 3000);
  }

  // ---------- Scroll: progress bar, nav state, active link, timeline ----------
  const nav = $('.nav'), progress = $('.progress'), line = $('.timeline-line span');
  const timeline = $('.timeline');
  const links = $$('.nav-links a');
  const sections = links.map((a) => $(a.getAttribute('href')));
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hide', y > lastY && y > 400);
    lastY = y;

    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === current));

    if (line && timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.3), 0), 1);
      line.style.setProperty('--p', p);
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // ---------- Pricing toggle ----------
  const toggle = $('.toggle');
  toggle.addEventListener('click', () => {
    const annual = toggle.getAttribute('aria-checked') !== 'true';
    toggle.setAttribute('aria-checked', String(annual));
    $('[data-billing="monthly"]').classList.toggle('active', !annual);
    $('[data-billing="annual"]').classList.toggle('active', annual);
    $$('.price span').forEach((el) => {
      el.textContent = annual ? el.dataset.annual : el.dataset.monthly;
      el.classList.remove('flip');
      void el.offsetWidth; // restart animation
      el.classList.add('flip');
    });
  });

  // ---------- Contact form (Formspree) ----------
  const form = $('.contact-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('.form-status', form), btn = $('button', form);
    btn.disabled = true;
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error();
      form.reset();
      btn.textContent = 'Message Sent ✓';
      status.textContent = "Thanks! We'll be in touch within 24 hours.";
    } catch {
      btn.disabled = false;
      status.textContent = 'Something went wrong — please email support@techiboyllc.com.';
    }
  });

  if (reduceMotion) return;

  // ---------- Pointer effects (desktop only) ----------
  if (finePointer) {
    const glow = $('.cursor-glow');
    window.addEventListener('pointermove', (e) => {
      glow.classList.add('on');
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });

    $$('.tilt').forEach((el) => {
      el.addEventListener('pointerenter', () => { el.style.transition = 'transform .15s ease-out, opacity .9s'; });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 10}deg) translateZ(0)`;
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1), opacity .9s';
        el.style.transform = '';
      });
    });

    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // ---------- Hero particle network ----------
  const canvas = $('#hero-canvas'), ctx = canvas.getContext('2d');
  const hero = $('.hero');
  const colors = ['100,210,255', '191,90,242', '10,132,255', '255,138,212'];
  const mouse = { x: -9999, y: -9999 };
  let particles = [], w = 0, h = 0, dpr = 1, running = true;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(Math.floor((w * h) / 14000), 110);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
      c: colors[(Math.random() * colors.length) | 0],
    }));
  };

  const draw = () => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 22500) { // push away from the cursor
        const f = (22500 - d2) / 22500 * 0.6;
        p.x += dx * f * 0.05; p.y += dy * f * 0.05;
      }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const ex = p.x - q.x, ey = p.y - q.y, e2 = ex * ex + ey * ey;
        if (e2 < 16900) {
          ctx.strokeStyle = `rgba(${p.c},${(1 - e2 / 16900) * 0.25})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${p.c},0.9)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(draw);
  };

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  window.addEventListener('resize', resize);

  // Pause the canvas when the hero is off-screen to save battery
  new IntersectionObserver(([e]) => {
    const wasRunning = running;
    running = e.isIntersecting;
    if (running && !wasRunning) requestAnimationFrame(draw);
  }).observe(hero);

  resize();
  requestAnimationFrame(draw);
})();
