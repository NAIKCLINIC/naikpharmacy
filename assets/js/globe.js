/* Exonol — rotating globe on the home page (d3-geo + world-atlas, loaded from a CDN).
   Countries come from the list in index.html: <li data-country="356" data-ll="78.9,22.5">
   data-country = ISO 3166 numeric code, data-ll = longitude,latitude for the marker. */
(function () {
  const box = document.querySelector('[data-globe]');
  if (!box) return;
  const items = [...document.querySelectorAll('[data-country]')];
  if (!window.d3 || !window.topojson) { box.classList.add('no-globe'); return; }

  const canvas = box.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pins = items.map((el, i) => ({ el, i, id: el.dataset.country, ll: el.dataset.ll.split(',').map(Number) }));
  const ids = new Set(pins.map(p => p.id));
  const proj = d3.geoOrthographic().clipAngle(90).precision(0.6);
  const path = d3.geoPath(proj, ctx);
  const grat = d3.geoGraticule10();
  let W = 0, R = 0, dpr = 1, rot = [-40, -18, 0], land = null, hi = [], active = null;
  let anim = null, last = 0, running = false, visible = false, pauseUntil = 0, drag = null;

  function size() {
    const w = box.clientWidth; if (!w) return;
    dpr = Math.min(2, window.devicePixelRatio || 1); W = w; R = w / 2 - 6;
    canvas.width = w * dpr; canvas.height = w * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = w + 'px';
    proj.translate([w / 2, w / 2]).scale(R);
  }

  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, W);
    proj.rotate(rot);
    const c = W / 2;
    const g = ctx.createRadialGradient(c - R * .35, c - R * .4, R * .05, c, c, R);
    g.addColorStop(0, '#1a6a63'); g.addColorStop(.6, '#0b3f3c'); g.addColorStop(1, '#062624');
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); path(grat); ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = .6; ctx.stroke();
    if (land) {
      ctx.beginPath(); path(land); ctx.fillStyle = 'rgba(255,255,255,.17)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = .4; ctx.stroke();
    }
    hi.forEach(f => { ctx.beginPath(); path(f); ctx.fillStyle = f.id === active ? '#b4e46f' : '#87C13F'; ctx.fill(); });
    const centre = [-rot[0], -rot[1]];
    pins.forEach(p => {
      const front = d3.geoDistance(p.ll, centre) < Math.PI / 2 - 0.05;
      p.el.classList.toggle('front', front);
      if (!front) return;
      const xy = proj(p.ll);
      const k = reduce ? 0.4 : ((now / 1700) + p.i * 0.17) % 1;
      ctx.beginPath(); ctx.arc(xy[0], xy[1], 4 + k * 16, 0, 7);
      ctx.strokeStyle = `rgba(180,228,111,${(1 - k) * .9})`; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(xy[0], xy[1], p.id === active ? 5.5 : 4, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    });
    const rim = ctx.createRadialGradient(c, c, R * .82, c, c, R * 1.02);
    rim.addColorStop(0, 'rgba(135,193,63,0)'); rim.addColorStop(1, 'rgba(135,193,63,.35)');
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = rim; ctx.fill();
  }

  function tick(now) {
    const dt = Math.min(64, now - (last || now)); last = now;
    if (anim) {
      const p = Math.min(1, (now - anim.t) / 1200), e = 1 - Math.pow(1 - p, 3);
      rot = anim.f(e);
      if (p >= 1) { anim = null; pauseUntil = now + 3500; }
    } else if (!drag && !reduce && now > pauseUntil) {
      rot = [rot[0] + dt * 0.008, rot[1], 0];
    }
    draw(now);
    if (visible) requestAnimationFrame(tick); else running = false;
  }
  function start() { if (!running) { running = true; last = 0; requestAnimationFrame(tick); } }

  function focus(p) {
    active = p.id;
    items.forEach(el => el.classList.toggle('on', el === p.el));
    const to = [-p.ll[0], -p.ll[1] * 0.75, 0];
    let from = rot.slice();
    from[0] = ((from[0] - to[0] + 540) % 360) - 180 + to[0];   /* take the short way round */
    anim = { t: performance.now(), f: d3.interpolate(from, to) };
    if (reduce) { rot = to; anim = null; }
    start();
  }
  pins.forEach(p => {
    p.el.tabIndex = 0;
    p.el.addEventListener('mouseenter', () => focus(p));
    p.el.addEventListener('click', () => focus(p));
    p.el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focus(p); } });
  });

  /* drag to spin */
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, r: rot.slice() }; anim = null; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const k = 180 / (R * Math.PI);
    rot = [drag.r[0] + (e.clientX - drag.x) * k, Math.max(-60, Math.min(60, drag.r[1] - (e.clientY - drag.y) * k)), 0];
    start();
  });
  const end = () => { if (drag) { drag = null; pauseUntil = performance.now() + 2500; } };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

  size();
  window.addEventListener('resize', () => { size(); draw(performance.now()); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0.05 }).observe(box);
  draw(performance.now());

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
    .then(r => r.json())
    .then(w => {
      land = topojson.feature(w, w.objects.land);
      hi = topojson.feature(w, w.objects.countries).features.filter(f => ids.has(String(f.id)));
      box.classList.add('ready');
      draw(performance.now());
    })
    .catch(() => box.classList.add('ready'));
})();
