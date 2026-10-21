// Theme switch shared by every page. The page follows the device setting ("system")
// until the visitor picks light or dark; the inline <head> snippet applies a saved
// choice before first paint so there is no flash.
(() => {
  const root = document.documentElement;
  const modes = ['system', 'light', 'dark'];
  const read = () => { try { return localStorage.getItem('theme') || 'system'; } catch { return 'system'; } };
  const write = (m) => { try { m === 'system' ? localStorage.removeItem('theme') : localStorage.setItem('theme', m); } catch { /* storage unavailable */ } };

  const apply = (mode) => {
    if (mode === 'system') delete root.dataset.theme;
    else root.dataset.theme = mode;
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      btn.dataset.mode = mode;
      btn.setAttribute('aria-label', `Theme: ${mode}. Click to change.`);
      btn.title = `Theme: ${mode}`;
    });
  };

  let mode = modes.includes(read()) ? read() : 'system';
  apply(mode);
  document.querySelectorAll('.theme-toggle').forEach((btn) => btn.addEventListener('click', () => {
    mode = modes[(modes.indexOf(mode) + 1) % modes.length];
    write(mode);
    apply(mode);
  }));

  document.querySelectorAll('.year').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Nav background once the page has scrolled
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
