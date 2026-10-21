(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  // ---------- Seamless marquees: duplicate each track's items ----------
  $$('.marquee-track').forEach((track) => {
    [...track.children].forEach((child) => {
      const clone = child.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });

  // ---------- Scroll reveal ----------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => revealObserver.observe(el));

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
  const setWord = (w) => {
    flip.textContent = '';
    [...w].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch;
      s.style.animationDelay = `${i * 0.035}s`;
      flip.appendChild(s);
    });
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
      if (document.hidden) return;
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

  // ---------- Work: vertical scroll drives a horizontal track ----------
  const work = $('.work'), track = $('.work-track');
  const horizontal = !reduceMotion && finePointer && window.matchMedia('(min-width: 900px)').matches;
  let workDistance = 0;
  const sizeWork = () => {
    if (!horizontal) { work.classList.add('native'); work.style.height = ''; return; }
    workDistance = Math.max(track.scrollWidth - window.innerWidth, 0);
    work.style.height = `${window.innerHeight + workDistance}px`;
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

    if (horizontal) {
      const r = work.getBoundingClientRect();
      const p = clamp(-r.top / (work.offsetHeight - innerHeight || 1), 0, 1);
      track.style.transform = `translateX(${-p * workDistance}px)`;
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
    quotes.forEach((q, k) => { q.classList.toggle('is-active', k === qi); q.setAttribute('aria-hidden', String(k !== qi)); });
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
