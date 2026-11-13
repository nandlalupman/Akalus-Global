// AKALUs Global public navigation. Core content remains visible without JavaScript.
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  const backToTop = document.getElementById('backToTop');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const closeMenu = (restoreFocus = false) => {
    if (!menu || !hamburger) return;
    const wasOpen = menu.classList.contains('active');
    menu.classList.remove('active');
    menu.inert = true;
    document.querySelector('main').inert = false;
    document.querySelector('footer').inert = false;
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('menu-open');
    if (restoreFocus && wasOpen) hamburger.focus();
  };
  closeMenu();
  hamburger?.addEventListener('click', () => {
    if (menu.classList.contains('active')) return closeMenu(true);
    menu.inert = false;
    document.querySelector('main').inert = true;
    document.querySelector('footer').inert = true;
    menu.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation');
    document.body.classList.add('menu-open');
    menu.querySelector('a')?.focus();
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (!menu?.classList.contains('active')) return;
    if (event.key === 'Escape') closeMenu(true);
    if (event.key === 'Tab') {
      const items = [hamburger, ...menu.querySelectorAll('a')];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  matchMedia('(min-width: 1025px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  let scrollScheduled = false;
  const updateScroll = () => {
    navbar?.classList.toggle('scrolled', scrollY > 50);
    backToTop?.classList.toggle('visible', scrollY > 500);
    scrollScheduled = false;
  };
  addEventListener('scroll', () => { if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  updateScroll();
  backToTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' }));
  const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) links.forEach(link => {
        const active = link.getAttribute('href') === '#' + entry.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-110px 0px -55% 0px', threshold: 0 });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
  }
  const track = document.querySelector('.who-help-track');
  const dots = [...document.querySelectorAll('.carousel-dots .dot')];
  const updateDots = () => {
    if (!track || !dots.length) return;
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    const distances = [...track.children].map(card => Math.abs(card.getBoundingClientRect().left + card.clientWidth / 2 - center));
    const current = distances.indexOf(Math.min(...distances));
    dots.forEach((dot, index) => { dot.classList.toggle('active', index === current); dot.setAttribute('aria-pressed', String(index === current)); });
  };
  track?.addEventListener('scroll', updateDots, { passive: true });
  dots.forEach((dot, index) => dot.addEventListener('click', () => track?.children[index]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion ? 'instant' : 'smooth' })));
});
