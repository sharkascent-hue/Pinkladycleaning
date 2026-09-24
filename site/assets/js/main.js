/* Pink Lady — interactions & motion. No dependencies. */
(() => {
  const html = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Intro timing ---------- */
  const introOn = html.classList.contains('intro-on');
  const INTRO_REVEAL = 2250; // when the curtain has lifted enough to start the hero
  const INTRO_END = 3300;
  const startDelay = introOn ? INTRO_REVEAL : 60;

  if (introOn) {
    try { sessionStorage.setItem('pl-intro', '1'); } catch (e) {}
    const finish = () => { html.classList.remove('intro-on'); html.classList.add('intro-done'); };
    setTimeout(finish, INTRO_END);
    // Let visitors skip it
    const intro = $('.intro');
    if (intro) intro.addEventListener('click', finish, { once: true });
  }

  /* ---------- Broken image fallback (placeholders until real photos arrive) ---------- */
  $$('.media img').forEach((img) => {
    const miss = () => img.closest('.media').classList.add('is-missing');
    if (img.complete && img.naturalWidth === 0) miss();
    else img.addEventListener('error', miss, { once: true });
  });

  /* ---------- Split headlines into masked words ---------- */
  $$('[data-split]').forEach((el) => {
    let wi = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const outer = document.createElement('span');
            outer.className = 'split-w';
            const inner = document.createElement('span');
            inner.textContent = p;
            inner.style.setProperty('--wi', wi++);
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    $$('.split-w', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
  });

  /* ---------- Stagger index ---------- */
  $$('[data-stagger]').forEach((el) => [...el.children].forEach((c, i) => c.style.setProperty('--i', i)));
  $$('.checklist').forEach((el) => [...el.children].forEach((c, i) => c.style.setProperty('--i', i)));

  // Years since founding (2006) stays correct every year
  $$('[data-years]').forEach((el) => {
    const n = new Date().getFullYear() - 2006;
    el.dataset.count = n;
    el.textContent = reduced ? n : '0';
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal], [data-split], [data-stagger], .checklist, [data-count]');
  const reveal = (el) => {
    el.classList.add('is-in');
    if (el.hasAttribute('data-count')) countUp(el);
  };
  let started = false;
  const startReveals = () => {
    if (started) return;
    started = true;
    html.classList.add('is-loaded');
    if (!('IntersectionObserver' in window) || reduced) { revealEls.forEach(reveal); return; }
    // A fully clipped element never "intersects", so clip reveals watch their parent instead
    const groups = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { groups.get(e.target).forEach(reveal); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach((el) => {
      const target = el.dataset.reveal === 'clip' ? el.parentElement : el;
      if (!groups.has(target)) groups.set(target, []);
      groups.get(target).push(el);
      io.observe(target);
    });
  };

  /* ---------- Count up ---------- */
  function countUp(el) {
    const to = parseInt(el.dataset.count, 10);
    const from = parseInt(el.dataset.from || '0', 10);
    if (reduced) { el.textContent = to; return; }
    const dur = 2000;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  /* ---------- Header: scrolled / hide on scroll down ---------- */
  const header = $('.site-header');
  const progress = $('.progress');
  const actionBar = $('.action-bar');
  const footer = $('.site-footer');
  let lastY = window.scrollY;
  let ticking = false;

  /* ---------- Parallax ---------- */
  const parallaxEls = reduced ? [] : $$('[data-parallax]').map((el) => ({ el, speed: parseFloat(el.dataset.parallax) || 0.12, cur: 0 }));

  /* ---------- Process line ---------- */
  const processes = $$('.process');

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight - vh;

    // Header stays solid white and always visible; it just gains a soft shadow once scrolled
    if (header) header.classList.toggle('is-scrolled', y > 10);
    if (progress) progress.style.transform = `scaleX(${docH > 0 ? Math.min(1, y / docH) : 0})`;

    if (actionBar) {
      const nearFooter = footer && footer.getBoundingClientRect().top < vh - 40;
      actionBar.classList.toggle('is-visible', y > vh * 0.5 && !nearFooter);
    }

    processes.forEach((p) => {
      const r = p.getBoundingClientRect();
      const prog = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.2)));
      p.style.setProperty('--progress', prog.toFixed(3));
      const steps = $$('.step', p);
      steps.forEach((s, i) => s.classList.toggle('is-active', prog >= (i + 0.35) / steps.length || prog >= 0.98));
    });

    lastY = y;
    ticking = false;
  };

  const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);

  // Parallax runs on its own loop with easing so it glides rather than jumps
  if (parallaxEls.length) {
    const loop = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((p) => {
        const r = p.el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const target = (r.top + r.height / 2 - vh / 2) * -p.speed;
        p.cur += (target - p.cur) * 0.1;
        if (Math.abs(target - p.cur) > 0.05) p.el.style.translate = `0 ${p.cur.toFixed(2)}px`;
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  const mobileMenu = $('.mobile-menu');
  const setMenu = (open) => {
    header.classList.toggle('menu-open', open);
    html.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-lock', open);
    html.classList.toggle('menu-lock', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.setAttribute('aria-hidden', String(!open));
  };
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && header.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
    $$('.mm-toggle', mobileMenu).forEach((t) => t.addEventListener('click', () => t.setAttribute('aria-expanded', String(t.getAttribute('aria-expanded') !== 'true'))));
  }

  /* ---------- Magnetic buttons (desktop only) ---------- */
  if (finePointer && !reduced) {
    $$('.btn').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Carousel ---------- */
  $$('.carousel').forEach((c) => {
    const slides = $$('.carousel__slide', c);
    if (slides.length < 2) return;
    c.classList.add('is-multi');
    let i = 0;
    let timer;
    const go = (n) => {
      slides[i].classList.remove('is-current');
      slides[i].setAttribute('aria-hidden', 'true');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-current');
      slides[i].removeAttribute('aria-hidden');
    };
    const auto = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go(i + 1), 7000); };
    $('[data-prev]', c).addEventListener('click', () => { go(i - 1); auto(); });
    $('[data-next]', c).addEventListener('click', () => { go(i + 1); auto(); });
    c.addEventListener('pointerenter', () => clearInterval(timer));
    c.addEventListener('pointerleave', auto);
    auto();
  });

  /* ---------- Quote / contact form ---------- */
  $$('form[data-ajax]').forEach((form) => {
    const card = form.closest('.form-card');
    const status = $('.form__status', form);
    const btn = $('button[type="submit"]', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const key = form.querySelector('[name="access_key"]');
      btn.classList.add('is-loading');
      status.textContent = 'Sending…';
      status.classList.remove('is-error');
      try {
        // Combine multi-select services into one readable field
        const data = new FormData(form);
        const services = data.getAll('service');
        if (services.length) { data.delete('service'); data.append('services', services.join(', ')); }
        const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) throw new Error(json.message || 'Request failed');
        card.classList.add('is-sent');
        card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      } catch (err) {
        if (key && /YOUR_/.test(key.value)) console.warn('Form endpoint not configured: add your Web3Forms access key (see TODO in the page source).');
        status.textContent = 'Sorry, your message could not be sent just now. Please call Margaret on 086 165 5300 or email info@pinklady.ie.';
        status.classList.add('is-error');
      } finally {
        btn.classList.remove('is-loading');
      }
    });
  });

  /* ---------- Smooth page leave for browsers without view transitions ---------- */
  const hasVT = 'onpagereveal' in window || (CSS.supports && CSS.supports('view-transition-name: none') && 'PageRevealEvent' in window);
  if (!hasVT && !reduced) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash) || /^(tel|mailto):/.test(a.href)) return;
      e.preventDefault();
      html.classList.add('is-leaving');
      setTimeout(() => { location.href = url.href; }, 320);
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) html.classList.remove('is-leaving'); });
  }

  /* ---------- Year in footer ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Go ---------- */
  onScroll();
  const go = () => setTimeout(startReveals, startDelay);
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
  // Don't hold the page hostage to slow images
  setTimeout(startReveals, startDelay + 1800);
})();
