/* Exonol — animated backgrounds (no libraries, resolution-independent)
   [data-helix]  3D DNA double helix (hero)
   [data-network] molecular network (Let's Connect)
   [data-wave]   particle wave (footer) */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const GREEN = [135, 193, 63], BLUE = [0, 113, 180], LBLUE = [64, 168, 230];

  function setup(host, draw) {
    const c = document.createElement('canvas');
    host.appendChild(c);
    const ctx = c.getContext('2d');
    const st = { w: 0, h: 0, on: true, t0: performance.now(), mx: 0, my: 0 };
    function size() {
      const r = host.getBoundingClientRect();
      st.w = Math.max(1, r.width); st.h = Math.max(1, r.height);
      c.width = Math.round(st.w * DPR); c.height = Math.round(st.h * DPR);
      c.style.width = st.w + 'px'; c.style.height = st.h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (draw.resize) draw.resize(st);
    }
    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(host); else window.addEventListener('resize', size);
    new IntersectionObserver(([e]) => { st.on = e.isIntersecting; }).observe(host);
    window.addEventListener('pointermove', (e) => { st.mx = e.clientX / innerWidth - 0.5; st.my = e.clientY / innerHeight - 0.5; }, { passive: true });
    function loop(now) {
      requestAnimationFrame(loop);
      if (!st.on) return;
      draw.frame(ctx, st, (now - st.t0) / 1000);
    }
    if (reduce) draw.frame(ctx, st, 4); else requestAnimationFrame(loop);
    host.classList.add('ready');
  }

  /* pre-rendered shaded sphere sprite */
  function sphereSprite(rgb, light) {
    const s = 128, c = document.createElement('canvas'); c.width = c.height = s;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(s * 0.36, s * 0.32, s * 0.04, s * 0.5, s * 0.5, s * 0.5);
    g.addColorStop(0, `rgba(${light.join(',')},1)`);
    g.addColorStop(0.35, `rgba(${rgb.join(',')},1)`);
    g.addColorStop(0.85, `rgba(${rgb.map(v => Math.round(v * 0.45)).join(',')},1)`);
    g.addColorStop(1, `rgba(${rgb.map(v => Math.round(v * 0.3)).join(',')},0)`);
    x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); x.fill();
    return c;
  }
  function glowSprite(rgb) {
    const s = 64, c = document.createElement('canvas'); c.width = c.height = s;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, `rgba(${rgb.join(',')},.9)`); g.addColorStop(1, `rgba(${rgb.join(',')},0)`);
    x.fillStyle = g; x.fillRect(0, 0, s, s);
    return c;
  }

  /* ---------------- 1. DNA helix ---------------- */
  const helixHost = document.querySelector('[data-helix]');
  if (helixHost) {
    const sG = sphereSprite(GREEN, [230, 255, 200]);
    const sB = sphereSprite(BLUE, [190, 230, 255]);
    const glowG = glowSprite(GREEN), glowB = glowSprite(LBLUE);
    const dust = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random(), s: Math.random() * 0.6 + 0.4, v: Math.random() * 0.02 + 0.005, c: Math.random() > 0.5 }));
    const items = [];
    setup(helixHost, {
      frame(ctx, st, t) {
        const { w, h } = st;
        ctx.clearRect(0, 0, w, h);
        const mobile = w < 760;
        const cx = mobile ? w * 0.5 : w * 0.56, cy = mobile ? h * 0.2 : h * 0.3;
        const len = mobile ? w * 1.5 : w * 1.15;
        const R = mobile ? Math.min(46, w * 0.12) : Math.min(105, h * 0.12);
        const tilt = (mobile ? 1.38 : 1.25) + st.mx * 0.08;
        const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
        const N = mobile ? 30 : 54, turns = mobile ? 2.6 : 4.2, spin = t * 0.45, f = 900;
        // dust / bokeh
        for (const d of dust) {
          d.y -= d.v * 0.016; if (d.y < -0.05) d.y = 1.05;
          const px = d.x * w + Math.sin(t * 0.3 + d.z * 6) * 12, py = d.y * h;
          const r = (6 + d.z * 18) * d.s;
          ctx.globalAlpha = 0.12 + d.z * 0.25;
          ctx.drawImage(d.c ? glowG : glowB, px - r, py - r, r * 2, r * 2);
        }
        ctx.globalAlpha = 1;
        items.length = 0;
        for (let i = 0; i < N; i++) {
          const u = i / (N - 1);
          const a = u * turns * Math.PI * 2 + spin;
          const along = (u - 0.5) * len;
          for (let k = 0; k < 2; k++) {
            const ang = a + k * Math.PI;
            const x0 = Math.cos(ang) * R, z0 = Math.sin(ang) * R;
            // rotate helix axis (vertical) by tilt in screen plane
            const X = x0 * cosT - along * sinT, Y = x0 * sinT + along * cosT, Z = z0 + st.my * 40;
            const sc = f / (f + Z * 2.2);
            items.push({ x: cx + X * sc, y: cy + Y * sc, z: Z, sc, k, i });
          }
        }
        // rungs (base pairs)
        for (let i = 0; i < N; i++) {
          const p = items[i * 2], q = items[i * 2 + 1];
          const depth = (p.z + q.z) / 2;
          const al = 0.18 + 0.32 * (1 - (depth + R) / (2 * R));
          const g = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
          g.addColorStop(0, `rgba(135,193,63,${al})`); g.addColorStop(0.5, `rgba(220,240,235,${al * 0.9})`); g.addColorStop(1, `rgba(64,168,230,${al})`);
          ctx.strokeStyle = g; ctx.lineWidth = 3 * (p.sc + q.sc) / 2; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
        // backbones
        for (let k = 0; k < 2; k++) {
          ctx.beginPath();
          for (let i = 0; i < N; i++) { const p = items[i * 2 + k]; i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }
          ctx.strokeStyle = k ? 'rgba(64,168,230,.35)' : 'rgba(135,193,63,.35)'; ctx.lineWidth = 2; ctx.stroke();
        }
        // spheres, far to near
        items.sort((a, b) => b.z - a.z);
        const base = mobile ? 13 : 17;
        for (const p of items) {
          const near = 1 - (p.z + R) / (2 * R); // 0 far .. 1 near
          const r = base * p.sc * (0.75 + near * 0.45);
          ctx.globalAlpha = 0.45 + near * 0.55;
          if (near > 0.6) ctx.drawImage(p.k ? glowB : glowG, p.x - r * 2.2, p.y - r * 2.2, r * 4.4, r * 4.4);
          ctx.drawImage(p.k ? sB : sG, p.x - r, p.y - r, r * 2, r * 2);
        }
        ctx.globalAlpha = 1;
      }
    });
  }

  /* ---------------- 2. Molecular network ---------------- */
  const netHost = document.querySelector('[data-network]');
  if (netHost) {
    let nodes = [];
    const glowG = glowSprite(GREEN), glowB = glowSprite(LBLUE);
    setup(netHost, {
      resize(st) {
        const n = Math.round(Math.min(110, st.w * st.h / 14000));
        nodes = Array.from({ length: n }, (_, i) => ({ x: Math.random() * st.w, y: Math.random() * st.h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 2.2 + 1.6, g: i % 3 !== 0, ph: Math.random() * 6 }));
      },
      frame(ctx, st, t) {
        const { w, h } = st;
        ctx.clearRect(0, 0, w, h);
        const D = 150;
        for (const n of nodes) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20;
        }
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
            if (d < D * D) {
              const al = (1 - Math.sqrt(d) / D) * 0.35;
              ctx.strokeStyle = `rgba(160,220,200,${al})`;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
        }
        for (const n of nodes) {
          const pulse = 1 + Math.sin(t * 1.4 + n.ph) * 0.25;
          const r = n.r * pulse;
          ctx.globalAlpha = 0.5; ctx.drawImage(n.g ? glowG : glowB, n.x - r * 5, n.y - r * 5, r * 10, r * 10);
          ctx.globalAlpha = 1; ctx.fillStyle = n.g ? 'rgb(150,205,80)' : 'rgb(90,180,235)';
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
        }
      }
    });
  }

  /* ---------------- 3. Particle wave ---------------- */
  const waveHost = document.querySelector('[data-wave]');
  if (waveHost) {
    setup(waveHost, {
      frame(ctx, st, t) {
        const { w, h } = st;
        ctx.clearRect(0, 0, w, h);
        const cols = w < 700 ? 60 : 110, rows = 26;
        for (let r = rows - 1; r >= 0; r--) {
          const zr = r / (rows - 1);          // 0 near .. 1 far
          const z = 1 + zr * 3;
          const baseY = h * 0.06 + h * 0.9 * ((1 / z) - 0.25) / 0.75;
          for (let c = 0; c < cols; c++) {
            const xr = c / (cols - 1) - 0.5;
            const X = xr * 3.4;
            const Y = Math.sin(X * 2.2 + t * 0.9 + zr * 2) * 0.6 + Math.cos(zr * 6 - t * 0.6 + X * 1.1) * 0.45;
            const sx = w / 2 + (X / z) * w * 0.62;
            const sy = baseY - (Y / z) * h * 0.12;
            if (sx < -10 || sx > w + 10) continue;
            const mix = c / (cols - 1);
            const col = [0, 1, 2].map(i => Math.round(GREEN[i] * (1 - mix) + BLUE[i] * mix));
            const rad = Math.max(0.7, 3 / z);
            ctx.fillStyle = `rgba(${col.join(',')},${(0.25 + (1 - zr) * 0.75).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(sx, sy, rad, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
    });
  }
})();
