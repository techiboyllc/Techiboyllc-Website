(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  // ---------- Blur-in words ----------
  // Text nodes are split into word spans; inline elements (e.g. .grad-text) animate as one word.
  $$('.blur-words').forEach((el) => {
    const base = parseFloat(el.dataset.delay || 0);
    let i = 0;
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        node.classList.add('w');
        node.style.transitionDelay = `${base + i++ * 0.07}s`;
        return;
      }
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'w';
        w.textContent = part;
        w.style.transitionDelay = `${base + i++ * 0.07}s`;
        frag.appendChild(w);
      });
      node.replaceWith(frag);
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
  $$('.reveal, .blur-words, .bstep').forEach((el) => revealObserver.observe(el));

  // ---------- Number ticker ----------
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

  // ---------- Scroll: progress bar, nav state, active link ----------
  const nav = $('.nav'), progress = $('.progress');
  const links = $$('.nav-links a');
  const sections = links.map((a) => $(a.getAttribute('href')));
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('scrolled', y > 10);
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === current));
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // ---------- Glowing borders that follow the cursor ----------
  // Every card in a group tracks the pointer, so nearby cards' borders light up too.
  if (finePointer) {
    $$('.glow-group').forEach((group) => {
      const cards = $$('.glow-card', group);
      group.addEventListener('pointermove', (e) => {
        cards.forEach((c) => {
          const r = c.getBoundingClientRect();
          c.style.setProperty('--mx', `${e.clientX - r.left}px`);
          c.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
      });
      group.addEventListener('pointerleave', () => {
        cards.forEach((c) => { c.style.removeProperty('--mx'); c.style.removeProperty('--my'); });
      });
    });
  }

  // ---------- Pricing tabs ----------
  const tabs = $$('.tabs button'), pill = $('.tab-pill');
  const movePill = () => {
    const sel = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    pill.style.width = `${sel.offsetWidth}px`;
    pill.style.transform = `translateX(${sel.offsetLeft}px)`;
  };
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    if (tab.getAttribute('aria-selected') === 'true') return;
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    movePill();
    const annual = tab.dataset.billing === 'annual';
    $$('.price span').forEach((el) => {
      el.textContent = annual ? el.dataset.annual : el.dataset.monthly;
      el.classList.remove('flip');
      void el.offsetWidth; // restart animation
      el.classList.add('flip');
    });
  }));
  movePill();
  window.addEventListener('resize', movePill);
  document.fonts && document.fonts.ready.then(movePill);

  // ---------- Testimonials marquee ----------
  const quotes = [
    { initials: 'MR', name: 'Marcus Reid', role: 'CEO, NexaFlow Inc.', text: 'Techiboy transformed our vision into a stunning logo. The process was seamless, and the final result exceeded every expectation. Highly recommend their creative and professional service!' },
    { initials: 'JK', name: 'Jade Kim', role: 'Founder, Obsidian Label', text: 'Our new logo is everything we dreamed of — bold, modern, and instantly recognizable. Techiboy nailed our brand personality from the very first concept round.' },
    { initials: 'DW', name: 'David Wei', role: 'Director, Meridian Media', text: 'Within days we had a full brand identity that felt premium, professional, and completely us. Clients constantly compliment our logo. Worth every penny.' },
  ];
  const quoteHTML = (q) => `<blockquote class="quote"><div class="stars">★★★★★</div><p>${q.text}</p>
    <footer><span class="avatar">${q.initials}</span><span><b>${q.name}</b><small>${q.role}</small></span></footer></blockquote>`;
  $$('[data-quotes]').forEach((track) => {
    const set = quotes.map(quoteHTML).join('');
    // Two identical halves so translateX(-50%) loops seamlessly; the second half is hidden from screen readers.
    track.innerHTML = set + set + `<div aria-hidden="true" style="display:contents">${set + set}</div>`;
  });

  // ---------- Terminal typer ----------
  const typer = $('.typer');
  if (typer) {
    const lines = typer.dataset.lines.split('|');
    const render = (done, partial) => {
      typer.innerHTML = done.map((l) => (l.startsWith('✓') ? `<span class="ok">${l}</span>` : l)).join('\n')
        + (done.length ? '\n' : '') + partial + '<span class="caret"></span>';
    };
    if (reduceMotion) render(lines, '');
    else {
      const run = async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
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
    ['Services', 'Section', '#services'], ['Process', 'Section', '#process'], ['Work', 'Section', '#work'],
    ['Pricing', 'Section', '#pricing'], ['Clients', 'Section', '#clients'], ['Contact us', 'Section', '#contact'],
    ['Custom Logo Design', 'Service', '#services'], ['Brand Identity Systems', 'Service', '#services'],
    ['Logo Redesign', 'Service', '#services'], ['Business Branding', 'Service', '#services'],
    ['3D & Animated Logos', 'Service', '#services'], ['Brand Strategy', 'Service', '#services'],
    ['Starter plan — $50', 'Plan', '#pricing'], ['Pro plan — $100', 'Plan', '#pricing'], ['Enterprise plan — $150', 'Plan', '#pricing'],
    ['Email support@techiboyllc.com', 'Contact', 'mailto:support@techiboyllc.com'],
    ['Privacy Policy', 'Legal', 'privacy.html'], ['Terms & Conditions', 'Legal', 'terms.html'], ['Refund Policy', 'Legal', 'refund.html'],
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
  const openPalette = () => {
    lastFocus = document.activeElement;
    palette.hidden = false; pInput.value = ''; active = 0; renderList(); pInput.focus();
  };
  const closePalette = () => { palette.hidden = true; lastFocus && lastFocus.focus(); };
  const choose = (i) => {
    const m = matches[i]; if (!m) return;
    closePalette();
    if (m[2].startsWith('#')) $(m[2]).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
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

  if (reduceMotion) return;

  // ---------- Hero sparkles ----------
  const canvas = $('#sparkles'), ctx = canvas.getContext('2d'), hero = $('.hero');
  const colors = ['255,255,255', '34,211,238', '168,85,247', '236,72,153'];
  let stars = [], w = 0, h = 0, running = true;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.min(Math.floor((w * h) / 9000), 160) }, () => ({
      x: Math.random() * w, y: Math.random() * h * 0.75,
      r: Math.random() * 1.3 + 0.3, vy: -(Math.random() * 0.15 + 0.03),
      t: Math.random() * Math.PI * 2, s: Math.random() * 0.03 + 0.01,
      c: colors[(Math.random() * colors.length) | 0],
    }));
  };
  const draw = () => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.t += s.s; s.y += s.vy;
      if (s.y < -5) { s.y = h * 0.75; s.x = Math.random() * w; }
      const a = (Math.sin(s.t) + 1) / 2;
      ctx.fillStyle = `rgba(${s.c},${0.15 + a * 0.75})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.6 + a * 0.6), 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(draw);
  };
  window.addEventListener('resize', resize);
  // Pause when the hero is off-screen to save battery
  new IntersectionObserver(([e]) => {
    const was = running;
    running = e.isIntersecting;
    if (running && !was) requestAnimationFrame(draw);
  }).observe(hero);
  resize();
  requestAnimationFrame(draw);
})();
