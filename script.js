(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  // Motion (motion.dev) drives spring-based 3D entrances and tilts; without it the CSS fallbacks apply.
  const M = window.Motion;
  const useMotion = Boolean(M && M.animate && M.inView) && !reduceMotion;
  if (useMotion) document.documentElement.classList.add('motion');
  const spring = { type: 'spring', stiffness: 110, damping: 18, mass: 1 };
  const tiltSpring = { type: 'spring', stiffness: 260, damping: 24 };

  // ---------- Seamless marquees: duplicate each track's items ----------
  $$('.marquee-track').forEach((track) => {
    [...track.children].forEach((child) => {
      const clone = child.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });

  // ---------- Scroll reveal: elements swing in from depth on a spring ----------
  const revealFrom = {
    default: { opacity: [0, 1], y: [60, 0], z: [-120, 0], rotateX: [-28, 0] },
    flip: { opacity: [0, 1], rotateX: [-90, 0], y: [20, 0] },
    left: { opacity: [0, 1], x: [-80, 0], z: [-160, 0], rotateY: [35, 0] },
    right: { opacity: [0, 1], x: [80, 0], z: [-160, 0], rotateY: [-35, 0] },
  };
  if (useMotion) {
    $$('.reveal').forEach((el) => {
      M.inView(el, () => {
        const delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
        const from = revealFrom[el.dataset.reveal] || revealFrom.default;
        el.classList.add('in');
        M.animate(el, { ...from, transformPerspective: [1000, 1000] }, { ...spring, delay, opacity: { duration: 0.6, delay } });
      }, { margin: '0px 0px -60px 0px' });
    });
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        revealObserver.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el) => revealObserver.observe(el));
  }

  // ---------- Number tickers ----------
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countObserver.unobserve(e.target);
      const el = e.target, target = +el.dataset.count;
      if (reduceMotion) { el.textContent = target; return; }
      const start = performance.now(), dur = 2000;
      const tick = (t) => {
        const p = Math.min((t - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countObserver.observe(el));

  // ---------- Hero: rotating word, letter by letter ----------
  const flip = $('.flip');
  const words = ['unforgettable.', 'iconic.', 'timeless.', 'bold.'];
  // The whole word animates: splitting it into per-letter layers breaks its gradient text fill
  const setWord = (w) => {
    flip.textContent = w;
    flip.classList.remove('in');
    void flip.offsetWidth; // restart animation
    flip.classList.add('in');
  };
  if (!reduceMotion) {
    let wi = 0;
    setInterval(() => {
      flip.classList.add('out');
      setTimeout(() => {
        flip.classList.remove('out');
        wi = (wi + 1) % words.length;
        setWord(words[wi]);
      }, 350);
    }, 3200);
  }

  // ---------- Hero: card stack ----------
  const stack = $('[data-stack]');
  const cards = $$('.stack-card', stack);
  let order = cards.map((_, i) => i);
  const layout = () => order.forEach((ci, p) => { cards[ci].style.setProperty('--p', p); cards[ci].dataset.p = p; });
  layout();
  if (!reduceMotion) {
    setInterval(() => {
      // The WebGL medallion replaces this stack when 3D is available
      if (document.hidden || document.documentElement.classList.contains('has-3d')) return;
      const front = cards[order[0]];
      front.classList.add('fling');
      setTimeout(() => {
        front.classList.add('no-tr');
        front.classList.remove('fling');
        order = [...order.slice(1), order[0]];
        layout();
        void front.offsetWidth;
        front.classList.remove('no-tr');
      }, 650);
      order.slice(1).forEach((ci, p) => { cards[ci].style.setProperty('--p', p); cards[ci].dataset.p = p; });
    }, 2800);
    if (finePointer) {
      const visual = $('.hero-visual');
      visual.addEventListener('pointermove', (e) => {
        const r = visual.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        stack.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
      });
      visual.addEventListener('pointerleave', () => { stack.style.transform = ''; });
    }
  }

  // ---------- Nav: hover pill + active section ----------
  const navLinks = $('.nav-links'), pill = $('.hover-pill');
  const links = $$('.nav-links a');
  links.forEach((a) => a.addEventListener('pointerenter', () => {
    pill.style.width = `${a.offsetWidth}px`;
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
    pill.style.opacity = '1';
  }));
  navLinks.addEventListener('pointerleave', () => { pill.style.opacity = '0'; });

  // ---------- Services: highlight the panel in view ----------
  const svcLinks = $$('.svc-list a'), panels = $$('.panel');
  const panelObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      panels.forEach((p) => p.classList.toggle('active', p === e.target));
      svcLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  panels.forEach((p) => panelObserver.observe(p));
  panels[0].classList.add('active');

  // ---------- Work: a 3D ring of cards that spins as you scroll ----------
  const work = $('.work'), track = $('.work-track'), workCards = $$('.work-card', track);
  const ringMode = !reduceMotion && finePointer && window.matchMedia('(min-width: 900px)').matches;
  const step = 360 / workCards.length;
  const sizeWork = () => {
    if (!ringMode) { work.classList.add('native'); work.style.height = ''; return; }
    work.classList.add('ring-mode');
    const cardW = clamp(window.innerWidth * 0.24, 280, 360);
    const radius = cardW / 2 / Math.tan(Math.PI / workCards.length) + 50;
    track.style.setProperty('--card-w', `${cardW}px`);
    track.style.setProperty('--radius', `${radius}px`);
    workCards.forEach((c, i) => c.style.setProperty('--a', `${i * step}deg`));
    work.style.height = `${window.innerHeight * 3.2}px`;
  };

  // ---------- Scroll-linked effects ----------
  const progress = $('.progress'), toTop = $('.to-top');
  const tlLine = $('.timeline-line span'), timeline = $('.timeline'), steps = $$('.tl-step');
  const sections = links.map((a) => $(a.getAttribute('href')));
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    toTop.classList.toggle('show', y > innerHeight * 1.2);

    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === current));

    if (ringMode) {
      const r = work.getBoundingClientRect();
      const p = clamp(-r.top / (work.offsetHeight - innerHeight || 1), 0, 1);
      const spin = -p * step * (workCards.length - 1);
      track.style.setProperty('--spin', `${spin}deg`);
      workCards.forEach((c, i) => {
        const facing = Math.cos(((i * step + spin) * Math.PI) / 180);
        c.style.opacity = String(clamp(0.25 + facing * 0.75, 0, 1));
      });
    }

    const tr = timeline.getBoundingClientRect();
    const tp = clamp((innerHeight * 0.6 - tr.top) / tr.height, 0, 1);
    tlLine.style.setProperty('--p', tp);
    steps.forEach((s) => {
      const sr = s.getBoundingClientRect();
      s.classList.toggle('lit', sr.top + sr.height / 2 < innerHeight * 0.6);
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', () => { sizeWork(); onScroll(); });
  window.addEventListener('load', () => { sizeWork(); onScroll(); });
  sizeWork();
  onScroll();

  // ---------- Pricing toggle ----------
  const segBtns = $$('.seg button'), segPill = $('.seg-pill');
  const movePill = () => {
    const sel = segBtns.find((b) => b.getAttribute('aria-selected') === 'true');
    segPill.style.width = `${sel.offsetWidth}px`;
    segPill.style.transform = `translateX(${sel.offsetLeft - 5}px)`;
  };
  segBtns.forEach((btn) => btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-selected') === 'true') return;
    segBtns.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
    movePill();
    const annual = btn.dataset.billing === 'annual';
    $$('.price span').forEach((el) => {
      el.textContent = annual ? el.dataset.annual : el.dataset.monthly;
      el.classList.remove('flip-num');
      void el.offsetWidth; // restart animation
      el.classList.add('flip-num');
    });
  }));
  movePill();
  window.addEventListener('resize', movePill);
  if (document.fonts) document.fonts.ready.then(() => { movePill(); sizeWork(); onScroll(); });

  // ---------- 3D tilt on a spring, with a moving glare ----------
  if (finePointer && useMotion) {
    $$('.tilt3d').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--gx', `${x * 100}%`);
        el.style.setProperty('--gy', `${y * 100}%`);
        M.animate(el, { rotateX: (0.5 - y) * 12, rotateY: (x - 0.5) * 14, transformPerspective: 1100 }, tiltSpring);
      });
      el.addEventListener('pointerleave', () => M.animate(el, { rotateX: 0, rotateY: 0 }, { ...tiltSpring, stiffness: 120 }));
    });
    const wm = $('.wordmark');
    $('.site-footer').addEventListener('pointermove', (e) => {
      const r = wm.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      M.animate(wm, { rotateY: x * 18, rotateX: -y * 22, transformPerspective: 800 }, tiltSpring);
    });
    $('.site-footer').addEventListener('pointerleave', () => M.animate(wm, { rotateX: 0, rotateY: 0 }, tiltSpring));
  }

  // ---------- Cursor spotlights ----------
  if (finePointer) {
    $$('.spot').forEach((el) => el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }));
    const wordmark = $('.wordmark');
    $('.site-footer').addEventListener('pointermove', (e) => {
      const r = wordmark.getBoundingClientRect();
      wordmark.style.setProperty('--mx', `${e.clientX - r.left}px`);
      wordmark.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    if (!reduceMotion) {
      $$('.magnetic').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
        });
        el.addEventListener('pointerleave', () => { el.style.transform = ''; });
      });
    }
  }

  // ---------- Testimonials carousel ----------
  const stage = $('.quote-stage'), quotes = $$('.quote', stage), dotsWrap = $('.quote-dots');
  const DUR = 6000;
  let qi = 0, timer = null;
  stage.style.setProperty('--dur', `${DUR}ms`);
  const dots = quotes.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Testimonial ${i + 1}`);
    b.innerHTML = '<span></span>';
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
    return b;
  });
  const go = (i) => {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach((q, k) => {
      // -1 / 0 / 1: left, centre and right positions of the 3D coverflow
      q.dataset.pos = String(((k - qi + quotes.length + 1) % quotes.length) - 1);
      q.classList.toggle('is-active', k === qi);
      q.setAttribute('aria-hidden', String(k !== qi));
    });
    dots.forEach((d, k) => {
      d.setAttribute('aria-selected', 'false');
      if (k === qi) { void d.offsetWidth; d.setAttribute('aria-selected', 'true'); }
    });
    clearTimeout(timer);
    if (!reduceMotion) timer = setTimeout(() => go(qi + 1), DUR);
  };
  $('[data-quote="prev"]').addEventListener('click', () => go(qi - 1));
  $('[data-quote="next"]').addEventListener('click', () => go(qi + 1));
  stage.addEventListener('pointerenter', () => { stage.classList.add('paused'); clearTimeout(timer); });
  stage.addEventListener('pointerleave', () => { stage.classList.remove('paused'); go(qi); });
  go(0);

  // ---------- FAQ accordion ----------
  $$('.faq-item button').forEach((btn) => btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item'), open = !item.classList.contains('open');
    item.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  }));

  // ---------- Terminal typer ----------
  const typer = $('.typer');
  const lines = typer.dataset.lines.split('|');
  const render = (done, partial) => {
    typer.innerHTML = done.map((l) => (l.startsWith('✓') ? `<span class="ok">${l}</span>` : l)).join('\n')
      + (done.length ? '\n' : '') + partial + '<span class="caret"></span>';
  };
  if (reduceMotion) render(lines, '');
  else {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      for (;;) {
        const done = [];
        for (const line of lines) {
          if (line.startsWith('✓')) { await sleep(350); done.push(line); render(done, ''); continue; }
          for (let c = 1; c <= line.length; c++) { render(done, line.slice(0, c)); await sleep(45); }
          await sleep(250); done.push(line); render(done, '');
        }
        await sleep(3000);
      }
    };
    new IntersectionObserver(([e], obs) => { if (e.isIntersecting) { obs.disconnect(); run(); } }).observe(typer);
  }

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
      btn.textContent = 'Message sent ✓';
      status.textContent = "Thanks! We'll be in touch within 24 hours.";
    } catch {
      btn.disabled = false;
      status.textContent = 'Something went wrong — please email support@techiboyllc.com.';
    }
  });

  // ---------- Command palette (⌘K / Ctrl+K) ----------
  const palette = $('.palette'), pInput = $('input', palette), pList = $('.palette-list', palette);
  const items = [
    ['Services', 'Section', '#services'], ['Work', 'Section', '#work'], ['Process', 'Section', '#process'],
    ['Pricing', 'Section', '#pricing'], ['Testimonials', 'Section', '#clients'], ['FAQ', 'Section', '#faq'], ['Contact us', 'Section', '#contact'],
    ['Custom Logo Design', 'Service', '#svc-1'], ['Brand Identity Systems', 'Service', '#svc-2'], ['Logo Redesign', 'Service', '#svc-3'],
    ['Business Branding', 'Service', '#svc-4'], ['3D & Animated Logos', 'Service', '#svc-5'], ['Brand Strategy', 'Service', '#svc-6'],
    ['Starter plan — $50', 'Plan', '#pricing'], ['Pro plan — $100', 'Plan', '#pricing'], ['Enterprise plan — $150', 'Plan', '#pricing'],
    ['Privacy Policy', 'Legal', 'privacy.html'], ['Terms & Conditions', 'Legal', 'terms.html'], ['Refund Policy', 'Legal', 'refund.html'],
    ['Switch light / dark theme', 'Action', 'theme'],
    ['Email support@techiboyllc.com', 'Contact', 'mailto:support@techiboyllc.com'],
  ];
  let matches = [], active = 0, lastFocus = null;
  const renderList = () => {
    const q = pInput.value.trim().toLowerCase();
    matches = items.filter(([label, kind]) => `${label} ${kind}`.toLowerCase().includes(q));
    active = Math.min(active, Math.max(matches.length - 1, 0));
    pList.innerHTML = matches.length
      ? matches.map(([label, kind], i) => `<li role="option" data-i="${i}" aria-selected="${i === active}">${label.replace(/&/g, '&amp;')}<small>${kind}</small></li>`).join('')
      : '<li class="empty">No results</li>';
  };
  const openPalette = () => { lastFocus = document.activeElement; palette.hidden = false; pInput.value = ''; active = 0; renderList(); pInput.focus(); };
  const closePalette = () => { palette.hidden = true; if (lastFocus) lastFocus.focus(); };
  const choose = (i) => {
    const m = matches[i]; if (!m) return;
    closePalette();
    if (m[2] === 'theme') $('.theme-toggle').click();
    else if (m[2].startsWith('#')) $(m[2]).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    else location.href = m[2];
  };
  $$('[data-open-palette]').forEach((b) => b.addEventListener('click', openPalette));
  $$('[data-close-palette]').forEach((b) => b.addEventListener('click', closePalette));
  pInput.addEventListener('input', () => { active = 0; renderList(); });
  pList.addEventListener('click', (e) => { const li = e.target.closest('li[data-i]'); if (li) choose(+li.dataset.i); });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.hidden ? openPalette() : closePalette(); return; }
    if (palette.hidden) return;
    if (e.key === 'Escape') closePalette();
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!matches.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
      renderList();
      $('[aria-selected="true"]', pList).scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') choose(active);
  });
})();
