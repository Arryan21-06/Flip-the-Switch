/* =============================================
   DAYBREAK — INTERACTION LAYER
   Accessible, reduced-motion-aware UI behavior.
   ============================================= */
'use strict';

const root = document.documentElement;
const body = document.body;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Theme toggle: light is the deliberate first-load default in index.html. */
const themeBtn = document.getElementById('theme');
const themeGlyph = themeBtn?.querySelector('.theme-glyph');

function applyTheme(theme) {
  const isDark = theme === 'dark';
  root.dataset.theme = isDark ? 'dark' : 'light';
  if (themeBtn) {
    themeBtn.setAttribute('aria-checked', String(!isDark));
    themeBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.title = isDark ? 'Switch to the light theme (D)' : 'Switch to the dark theme (D)';
  }
  if (themeGlyph) themeGlyph.textContent = isDark ? '☾' : '☀';
}

if (themeBtn) {
  // Normalize the visible control from the document's default theme.
  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  themeBtn.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!reduceMotion && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => applyTheme(nextTheme));
    } else {
      applyTheme(nextTheme);
    }
  });

  window.addEventListener('keydown', event => {
    const target = event.target;
    const isTyping = target instanceof HTMLElement && (
      target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
    );
    if (event.key.toLowerCase() === 'd' && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping) {
      event.preventDefault();
      themeBtn.click();
    }
  });
}

/* Draft-note visibility */
const notesBtn = document.getElementById('notes-btn');
if (notesBtn) {
  const syncNotesButton = hidden => {
    notesBtn.textContent = `Draft notes: ${hidden ? 'off' : 'on'}`;
    notesBtn.setAttribute('aria-pressed', String(!hidden));
  };
  syncNotesButton(body.classList.contains('no-notes'));
  notesBtn.addEventListener('click', () => {
    const hidden = body.classList.toggle('no-notes');
    syncNotesButton(hidden);
  });
}

/* Copy the demo commands, with a fallback for non-secure local origins. */
const copyBtn = document.getElementById('copy');
const copyStatus = document.getElementById('copy-status');
if (copyBtn) {
  let resetTimer;
  const originalLabel = 'Copy command';

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    helper.style.pointerEvents = 'none';
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand('copy');
    helper.remove();
    if (!copied) throw new Error('Clipboard copy was blocked by the browser.');
  }

  copyBtn.addEventListener('click', async () => {
    const command = document.getElementById('cmd');
    if (!command) return;
    window.clearTimeout(resetTimer);
    try {
      await copyText(command.innerText);
      copyBtn.textContent = 'Copied ✓';
      copyBtn.classList.add('copy-success');
      if (copyStatus) copyStatus.textContent = 'Demo command copied to clipboard.';
    } catch (error) {
      copyBtn.textContent = 'Copy unavailable';
      copyBtn.classList.remove('copy-success');
      if (copyStatus) copyStatus.textContent = 'Clipboard access was blocked. Select the command and copy it manually.';
    }
    resetTimer = window.setTimeout(() => {
      copyBtn.textContent = originalLabel;
      copyBtn.classList.remove('copy-success');
    }, 1900);
  });
}

/* Scroll reveal: reveal individual article blocks, not whole long sections. */
const sections = Array.from(document.querySelectorAll('article section[id]'));
const revealTargets = Array.from(document.querySelectorAll('article section[id] > *'));
if (!reduceMotion && 'IntersectionObserver' in window) {
  body.classList.add('js-motion');
  revealTargets.forEach((element, index) => {
    element.classList.add('reveal-item');
    element.style.setProperty('--reveal-delay', `${Math.min((index % 5) * 45, 180)}ms`);
  });
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -45px 0px' });
  revealTargets.forEach(element => revealObserver.observe(element));
} else {
  sections.forEach(section => section.classList.add('is-visible'));
}

/* Side navigation follows the section currently in the reading window. */
const navLinks = Array.from(document.querySelectorAll('.rail a[href^="#"]'));
if ('IntersectionObserver' in window && sections.length && navLinks.length) {
  const navObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach(link => {
      const active = link.hash === `#${visible.target.id}`;
      link.classList.toggle('on', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-18% 0px -67% 0px', threshold: [0, .1, .25, .5] });
  sections.forEach(section => navObserver.observe(section));
}

/* Reading progress + a back-to-top affordance. */
const progressBar = document.getElementById('progress');
const topBtn = document.getElementById('top-btn');
let scrollFrame = 0;
function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
  if (topBtn) topBtn.classList.toggle('show', window.scrollY > 650);
  scrollFrame = 0;
}
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateScrollUI);
}, { passive: true });
window.addEventListener('resize', updateScrollUI, { passive: true });
updateScrollUI();
if (topBtn) {
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

/* A guided highlight pass through the five workflow steps. */
const steps = Array.from(document.querySelectorAll('.flow li'));
const playBtn = document.getElementById('play-flow');
let flowTimers = [];
let flowHasAutoPlayed = false;
function playFlow() {
  flowTimers.forEach(timer => window.clearTimeout(timer));
  flowTimers = [];
  steps.forEach(step => step.classList.remove('lit'));
  if (reduceMotion) {
    steps.forEach(step => step.classList.add('lit'));
    return;
  }
  steps.forEach((step, index) => {
    const timer = window.setTimeout(() => step.classList.add('lit'), index * 560 + 100);
    flowTimers.push(timer);
  });
}
if (playBtn && steps.length) playBtn.addEventListener('click', playFlow);
const flowElement = document.getElementById('workflow');
if (flowElement && 'IntersectionObserver' in window && !reduceMotion) {
  const flowObserver = new IntersectionObserver(entries => {
    if (!flowHasAutoPlayed && entries.some(entry => entry.isIntersecting)) {
      flowHasAutoPlayed = true;
      playFlow();
      flowObserver.disconnect();
    }
  }, { threshold: .35 });
  flowObserver.observe(flowElement);
}

/* Subtle pointer-responsive light in the hero; disabled on touch/reduced-motion. */
const hero = document.querySelector('.hero');
if (hero && !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  hero.addEventListener('pointermove', event => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    hero.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }, { passive: true });
}

console.info('Daybreak interactions initialized.');
