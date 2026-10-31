/* Exonol Pharmaceuticals — interactions & scroll animations */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const PREVIEW = /claude|anthropic/.test(location.hostname);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EX = window.EXONOL || {};

  /* ---------- Site-wide links set in layout.js (LinkedIn, WhatsApp, profile PDF …) ---------- */
  $$('[data-link]').forEach(a => {
    const u = EX[a.dataset.link];
    if (!u) return;
    a.href = u;
    if (/^https?:/.test(u)) { a.target = '_blank'; a.rel = 'noopener'; }
  });

  /* ---------- Header: shrink on scroll ---------- */
  const header = $('.site-header');
  function onHeader() { header.classList.toggle('scrolled', window.scrollY > 20); }

  /* ---------- Pill nav sliding indicator (Curenast) ---------- */
  const nav = $('.pillnav');
  if (nav) {
    const ind = $('.indicator', nav);
    const links = $$(':scope > a, :scope > .nav-dd > a', nav);
    const active = links.find(a => a.classList.contains('active'));
    const moveTo = (a) => {
      if (!a) { ind.style.opacity = 0; return; }
      ind.style.opacity = 1;
      ind.style.width = a.offsetWidth + 'px';
      ind.style.transform = `translateX(${a.offsetLeft}px)`;
    };
    links.forEach(a => {
      a.addEventListener('mouseenter', () => { links.forEach(l => l.classList.remove('hovering')); moveTo(a); a.classList.add('hovering'); if (active && active !== a) active.style.color = 'var(--muted)'; });
    });
    nav.addEventListener('mouseleave', () => { moveTo(active); if (active) active.style.color = ''; links.forEach(l => l.classList.remove('hovering')); });
    window.addEventListener('load', () => moveTo(active));
    window.addEventListener('resize', () => moveTo(active));
    requestAnimationFrame(() => moveTo(active));
    /* keyboard: keep the Company dropdown open while focus is inside it */
    $$('.nav-dd', nav).forEach(dd => {
      dd.addEventListener('focusin', () => dd.classList.add('open'));
      dd.addEventListener('focusout', (e) => { if (!dd.contains(e.relatedTarget)) dd.classList.remove('open'); });
    });
  }

  /* ---------- Mobile drawer ---------- */
  const burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      header.classList.remove('hide');
    });
    $$('.drawer a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));

  /* ---------- Scroll-fill statement (Redcare) ---------- */
  const fill = $('.fill-text');
  let words = [];
  if (fill) {
    const marks = { exon: 'g', story: 'b', dna: 'b' };
    const text = fill.textContent.trim();
    fill.innerHTML = text.split(/\s+/).map(w => {
      const k = w.toLowerCase().replace(/[^a-z]/g, '');
      return `<span class="w ${marks[k] || ''}">${w}</span>`;
    }).join(' ');
    words = $$('.w', fill);
  }
  function onFill() {
    if (!fill) return;
    const r = fill.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.45)));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
  }

  /* ---------- Parallax helpers ---------- */
  const par = $$('[data-speed]');
  function onParallax() {
    if (reduce) return;
    const vh = window.innerHeight;
    par.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * parseFloat(el.dataset.speed)).toFixed(1)}px, 0)`;
    });
  }

  /* ---------- FAQ accordion ---------- */
  $$('.qa button').forEach(b => {
    b.addEventListener('click', () => {
      const qa = b.closest('.qa');
      const open = qa.classList.contains('open');
      $$('.qa.open').forEach(x => { x.classList.remove('open'); $('button', x).setAttribute('aria-expanded', 'false'); });
      if (!open) { qa.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- Forms: compose an email to Exonol (no backend required) ---------- */
  $$('form[data-mail]').forEach(f => {
    f.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (!f.reportValidity()) return;
      const to = f.dataset.to === 'careers' ? (EX.careersEmail || EX.email) : (EX.email || 'contact@exonolpharma.com');
      const data = new FormData(f);
      const lines = [];
      for (const [k, v] of data.entries()) if (v && k !== 'consent') lines.push(`${k}: ${v}`);
      if (f.dataset.to === 'careers') lines.push('', '(Please attach your CV — PDF or Word — before sending.)');
      const subject = encodeURIComponent(f.dataset.subject || 'Website enquiry — Exonol Pharmaceuticals');
      const body = encodeURIComponent(lines.join('\n'));
      const ok = $('.form-ok', f.parentElement) || $('.form-ok', f);
      if (ok) ok.classList.add('show');
      if (PREVIEW) { if (ok) ok.lastChild.textContent = `Message ready. On the live site this opens an email to ${to} (preview does not send email).`; }
      else window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      f.reset();
    });
  });
  $$('form[data-news]').forEach(f => f.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const b = $('button', f); b.textContent = 'Subscribed ✓';
    setTimeout(() => { b.textContent = 'Subscribe'; f.reset(); }, 2600);
  }));

  /* ---------- Back to top & year ---------- */
  $$('.to-top').forEach(b => b.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })));
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Hero video: fall back to poster if it can't play ---------- */
  const vid = $('.hero-media video');
  if (vid) {
    vid.addEventListener('error', () => vid.remove(), true);
    const p = vid.play && vid.play(); if (p && p.catch) p.catch(() => {});
  }

  /* ---------- Splicing visual (scroll-driven) ---------- */
  const splice = $('[data-splice]');
  const stages = splice ? $$('.splice-stage span', splice) : [];
  function onSplice() {
    if (!splice) return;
    const r = splice.getBoundingClientRect(), vh = window.innerHeight;
    let p = reduce ? 1 : (vh * 0.85 - r.top) / (vh * 0.5);
    p = Math.max(0, Math.min(1, p));
    splice.style.setProperty('--p', p.toFixed(3));
    const idx = p < 0.2 ? 0 : p < 0.95 ? 1 : 2;
    stages.forEach((s, i) => s.classList.toggle('on', i === idx));
    splice.classList.toggle('done', p >= 0.97);
  }

  /* ---------- 3D product videos: play only while visible ---------- */
  const pvs = $$('video.pv, video.fv');
  if (pvs.length) {
    const vo = new IntersectionObserver((es) => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting && !reduce) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } else v.pause();
    }), { threshold: 0.2 });
    pvs.forEach(v => vo.observe(v));
  }

  /* ---------- Company page: highlight the section in the sub-nav ---------- */
  const sub = $$('.subnav a');
  if (sub.length) {
    const secs = sub.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const so = new IntersectionObserver((es) => es.forEach(e => {
      if (e.isIntersecting) sub.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach(s => so.observe(s));
  }

  /* ---------- Loop ---------- */
  let ticking = false;
  function frame() { onHeader(); onFill(); onParallax(); onSplice(); ticking = false; }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', frame);
  frame();
})();
