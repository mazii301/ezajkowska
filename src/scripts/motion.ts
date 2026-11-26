// Wszystkie animacje strony. Zasada: treść jest widoczna bez JavaScriptu,
// a przy „ogranicz ruch” animacje są wyłączone.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s as any) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s as any)] as T[];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------- wspólna pętla przewijania (jedna klatka na wszystko) ---------- */
type Tick = () => void;
const ticks: Tick[] = [];
let queued = false;
const run = () => { queued = false; for (const t of ticks) t(); };
const request = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
addEventListener('scroll', request, { passive: true });
addEventListener('resize', request);
addEventListener('lenis:ready', () => (globalThis as any).__lenis?.on('scroll', request));
(globalThis as any).__lenis?.on?.('scroll', request);

/* ---------- intro: kurtyna z liściem ---------- */
const intro = $('[data-intro]');
const startPage = () => { root.classList.add('is-loaded'); };
if (intro) {
  let seen = false;
  try { seen = sessionStorage.getItem('ez-intro') === '1'; sessionStorage.setItem('ez-intro', '1'); } catch {}
  if (reduced || seen) { intro.remove(); startPage(); }
  else {
    root.classList.add('intro-on');
    const done = () => { intro.classList.add('is-out'); startPage(); setTimeout(() => { intro.remove(); root.classList.remove('intro-on'); }, 1100); };
    const min = new Promise(r => setTimeout(r, 1500));
    const fonts = (document as any).fonts?.ready ?? Promise.resolve();
    Promise.race([Promise.all([min, fonts]), new Promise(r => setTimeout(r, 2600))]).then(done);
  }
} else startPage();

/* ---------- nagłówek: chowa się przy przewijaniu w dół ---------- */
const header = $('[data-header]');
const bar = $('[data-progress]');
let lastY = scrollY;
ticks.push(() => {
  const y = scrollY;
  if (header) {
    header.classList.toggle('is-solid', y > 40);
    if (!header.contains(document.activeElement)) header.classList.toggle('is-hidden', y > lastY && y > 500);
    if (y < lastY) header.classList.remove('is-hidden');
  }
  if (bar) {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }
  lastY = y;
});

/* ---------- menu mobilne ---------- */
const toggle = $<HTMLButtonElement>('[data-menu-toggle]');
const menu = $('[data-menu]');
if (toggle && menu) {
  const set = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    root.classList.toggle('menu-open', open);
    const l = (globalThis as any).__lenis; open ? l?.stop() : l?.start();
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
}

/* ---------- pojawianie się elementów ---------- */
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); e.target.classList.remove('pending'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal], [data-lines], [data-clip], [data-draw]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92 && !el.closest('[data-hero]')) { el.classList.add('in'); return; }
    el.classList.add('pending');
    io.observe(el);
  });
  // Elementy hero startują po intrze
  const kick = () => $$('[data-hero] [data-reveal], [data-hero] [data-lines], [data-hero] [data-clip], [data-hero] [data-draw]').forEach(el => { el.classList.add('in'); el.classList.remove('pending'); });
  if (root.classList.contains('is-loaded')) kick();
  else new MutationObserver((_, o) => { if (root.classList.contains('is-loaded')) { kick(); o.disconnect(); } }).observe(root, { attributes: true, attributeFilter: ['class'] });
  $$('[data-hero] [data-reveal], [data-hero] [data-lines], [data-hero] [data-clip], [data-hero] [data-draw]').forEach(el => el.classList.add('pending'));
  document.addEventListener('focusin', e => { const p = (e.target as Element).closest?.('.pending'); if (p) { p.classList.add('in'); p.classList.remove('pending'); } });
}

/* ---------- nagłówki: rozbicie na linie (maska) ---------- */
$$('[data-lines]').forEach(el => {
  if (reduced) return;
  // Każde słowo w osobnym spanie (słowa z <em> dostają własny <em>), potem grupujemy w linie.
  const out: HTMLElement[] = [];
  const take = (node: Node, wrap?: string) => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) (n.textContent || '').split(/\s+/).forEach(part => {
      if (!part) return;
      const w = document.createElement('span'); w.className = 'w';
      if (wrap) { const e = document.createElement(wrap); e.textContent = part; w.appendChild(e); } else w.textContent = part;
      out.push(w);
    });
    else if (n.nodeType === 1) {
      if ((n as Element).tagName === 'BR') { const w = document.createElement('span'); w.className = 'w br'; out.push(w); }
      else take(n, (n as Element).tagName.toLowerCase());
    }
  });
  take(el);
  el.innerHTML = '';
  out.forEach((w, i) => { el.appendChild(w); if (i < out.length - 1) el.appendChild(document.createTextNode(' ')); });
  const group = () => {
    const ws = $$('.w', el);
    const lines: HTMLElement[][] = [];
    let top = -1;
    ws.forEach(w => { if (w.classList.contains('br')) { top = -1; return; } const t = w.offsetTop; if (Math.abs(t - top) > 4 || !lines.length) { lines.push([]); top = t; } lines[lines.length - 1].push(w); });
    el.innerHTML = '';
    lines.forEach((line, i) => {
      const mask = document.createElement('span'); mask.className = 'line';
      const inner = document.createElement('span'); inner.className = 'line-in'; inner.style.setProperty('--i', String(i));
      line.forEach((w, j) => { inner.appendChild(w); if (j < line.length - 1) inner.appendChild(document.createTextNode(' ')); });
      mask.appendChild(inner); el.appendChild(mask); el.appendChild(document.createTextNode(' '));
    });
  };
  const f = (document as any).fonts?.ready ?? Promise.resolve();
  f.then(group);
});

/* ---------- akapit podświetlany słowo po słowie przy przewijaniu ---------- */
$$('[data-scrub]').forEach(el => {
  const words: HTMLElement[] = [];
  const split = (node: Node) => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      (n.textContent || '').split(/(\s+)/).forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
        else { const s = document.createElement('span'); s.className = 'sw'; s.textContent = p; words.push(s); frag.appendChild(s); }
      });
      n.parentNode!.replaceChild(frag, n);
    } else split(n);
  });
  split(el);
  if (reduced) { words.forEach(w => w.style.opacity = '1'); return; }
  ticks.push(() => {
    const r = el.getBoundingClientRect();
    const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35));
    const n = words.length;
    words.forEach((w, i) => { w.style.opacity = String(0.16 + 0.84 * clamp(p * n * 1.15 - i)); });
  });
});

/* ---------- parallax ---------- */
if (!reduced) {
  const items = $$('[data-parallax]');
  ticks.push(() => {
    for (const el of items) {
      const r = el.parentElement!.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) continue;
      const k = parseFloat(el.dataset.parallax || '0.12');
      const c = (r.top + r.height / 2 - innerHeight / 2);
      el.style.transform = `translate3d(0, ${(-c * k).toFixed(1)}px, 0)`;
    }
  });
}

/* ---------- hero: zdjęcie się przybliża, tekst odpływa ---------- */
const hero = $('[data-hero]');
if (hero && !reduced) {
  const copy = $('.hero-copy', hero), photo = $('.hero-photo', hero), dim = $('.hero-dim', hero);
  const wide = matchMedia('(min-width: 901px)');
  ticks.push(() => {
    if (!wide.matches) { if (copy) { copy.style.transform = ''; copy.style.opacity = ''; } if (photo) photo.style.transform = ''; if (dim) dim.style.opacity = '0'; return; }
    const p = clamp(scrollY / innerHeight);
    if (p >= 1 && hero.dataset.off) return;
    hero.dataset.off = p >= 1 ? '1' : '';
    if (copy) { copy.style.transform = `translate3d(0, ${-p * 80}px, 0)`; copy.style.opacity = String(1 - p * 1.2); }
    if (photo) photo.style.transform = `translate3d(0, ${p * 60}px, 0) scale(${1 + p * 0.06})`;
    if (dim) dim.style.opacity = String(p * 0.55);
  });
}

/* ---------- lista „W czym pomagam”: zdjęcie zmienia się z wierszem ---------- */
const care = $('[data-care]');
if (care) {
  const items = $$('li', care);
  const frames = $$('.care-frame figure');
  const show = (i: number) => {
    items.forEach((el, j) => el.classList.toggle('on', i === j));
    frames.forEach((el, j) => el.classList.toggle('on', i === j));
  };
  items.forEach((el, i) => {
    el.addEventListener('pointerenter', () => show(i));
    el.addEventListener('focusin', () => show(i));
  });
  // Na dotyku: aktywny wiersz to ten najbliżej środka ekranu
  if (!fine) ticks.push(() => {
    let best = 0, bd = Infinity;
    items.forEach((el, i) => { const r = el.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - innerHeight / 2); if (d < bd) { bd = d; best = i; } });
    items.forEach((el, j) => el.classList.toggle('on', best === j));
  });
}

/* ---------- pasek tematów: prędkość zależna od przewijania ---------- */
const marquees = $$('[data-marquee]');
if (marquees.length && !reduced) {
  let x = 0, vel = 0, prevY = scrollY, last = performance.now();
  const loop = (t: number) => {
    const dt = Math.min(64, t - last); last = t;
    const dy = scrollY - prevY; prevY = scrollY;
    vel += (dy * 0.6 - vel) * 0.08;
    x += (0.035 * dt) + vel * 0.5;
    marquees.forEach((m, i) => {
      const w = (m.firstElementChild as HTMLElement).offsetWidth || 1;
      const dir = i % 2 ? 1 : -1;
      const pos = ((x % w) + w) % w;
      m.style.transform = `translate3d(${dir < 0 ? -pos : pos - w}px,0,0)`;
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- licznik oceny ---------- */
$$('[data-count]').forEach(el => {
  const target = parseFloat((el.dataset.count || '0').replace(',', '.'));
  const dec = (el.dataset.count || '').includes(',') ? 1 : 0;
  if (reduced) return;
  el.textContent = (0).toFixed(dec).replace('.', ',');
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return; io.disconnect();
    const t0 = performance.now(), dur = 1600;
    const step = (t: number) => {
      const k = clamp((t - t0) / dur); const v = target * (1 - Math.pow(1 - k, 4));
      el.textContent = v.toFixed(dec).replace('.', ',');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, { threshold: 0.6 });
  io.observe(el);
});

/* ---------- magnetyczne przyciski ---------- */
if (fine && !reduced) $$('[data-magnet]').forEach(el => {
  const s = parseFloat(el.dataset.magnet || '0.3');
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * s}px, ${(e.clientY - r.top - r.height / 2) * s}px)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});

/* ---------- kursor-światło w sekcji kontakt ---------- */
if (fine && !reduced) $$('[data-glow]').forEach(el => {
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--gx', `${e.clientX - r.left}px`);
    el.style.setProperty('--gy', `${e.clientY - r.top}px`);
  });
});

/* ---------- FAQ: płynne otwieranie ---------- */
$$<HTMLDetailsElement>('.faq details').forEach(d => {
  const sum = $('summary', d)!; const body = $('.faq-a', d)!;
  sum.addEventListener('click', e => {
    if (reduced) return;
    e.preventDefault();
    if (d.open) {
      body.style.height = body.scrollHeight + 'px';
      requestAnimationFrame(() => { body.style.height = '0px'; });
      body.addEventListener('transitionend', () => { d.open = false; body.style.height = ''; }, { once: true });
      d.classList.remove('is-open');
    } else {
      d.open = true; d.classList.add('is-open');
      body.style.height = '0px';
      requestAnimationFrame(() => { body.style.height = body.scrollHeight + 'px'; });
      body.addEventListener('transitionend', () => { body.style.height = ''; }, { once: true });
    }
  });
});

request();
