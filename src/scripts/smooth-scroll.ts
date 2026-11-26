import Lenis from 'lenis';
import 'lenis/dist/lenis.css';


// Native document scroll keeps the header, progress and dental scenes in sync.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const pointer = matchMedia('(hover: hover) and (pointer: fine)');
let lenis: Lenis | undefined;

function configure() {
  const enabled = pointer.matches && !reduced.matches && !document.hidden;
  if (!enabled) {
    lenis?.destroy();
    lenis = undefined;
    (globalThis as any).__lenis = undefined;
    return;
  }
  if (lenis) return;
  lenis = new Lenis({
    autoRaf: true,
    smoothWheel: true,
    syncTouch: false,
    lerp: 0.085,
    wheelMultiplier: 0.9,
    anchors: true,
    stopInertiaOnNavigate: true,
    respectReducedMotion: true,
    // Leave controls and the independently scrollable mobile menu native.
    prevent: node => node.matches('textarea, select, input, [contenteditable], [data-native-scroll]'),
  });
  // Lenis przy każdym starcie i końcu przewijania zdejmuje i nakłada klasy na <html>, co wymusza przeliczenie stylów
  // i daje mikroprzycięcie na końcu przewijania. Klasy zmieniamy tylko wtedy, gdy faktycznie zmienia się ich stan.
  const l = lenis as any;
  l.updateClassName = function (this: any) {
    const c = this.rootElement?.classList;
    if (!c) return;
    if (!c.contains('lenis')) c.add('lenis');
    if (c.contains('lenis-stopped') !== !!this.isStopped) c.toggle('lenis-stopped', !!this.isStopped);
    if (c.contains('lenis-locked') !== !!this.isLocked) c.toggle('lenis-locked', !!this.isLocked);
  };
  l.updateClassName();
  // Animacje zależne od przewijania słuchają Lenisa, żeby rysować się w tej samej klatce co przewinięcie.
  (globalThis as any).__lenis = lenis;
  if (typeof dispatchEvent === 'function' && typeof Event === 'function') dispatchEvent(new Event('lenis:ready'));
}

// Keyboard, focus and history navigation must interrupt any pending wheel glide.
function interrupt() { lenis?.scrollTo(window.scrollY, { immediate: true }); }
addEventListener('keydown', event => {
  if (['Tab', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(event.key)) interrupt();
});
document.addEventListener('focusin', event => {
  if (event.target instanceof Element && event.target.matches('input, textarea, select, [contenteditable]')) interrupt();
});
addEventListener('popstate', interrupt);
addEventListener('pagehide', () => { lenis?.destroy(); lenis = undefined; });
addEventListener('pageshow', configure);
document.addEventListener('visibilitychange', configure);
reduced.addEventListener('change', configure);
pointer.addEventListener('change', configure);
configure();
