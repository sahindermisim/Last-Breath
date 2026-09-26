"use strict";
/* =========================================================================
   DÜNYA MOTORU — perspektif kamera, katmanlı yıkık şehir, ışık, hava, post
   Perspektif: derinliği D olan nokta için ölçek s = f / (D - cz).
   Ekran: x = W/2 + (X - cx)·s,  y = hy + (Y - cy)·s. Zemin Y=0, yukarı negatif.
   ========================================================================= */
(() => {
  const C = F.cam = { x: 0, y: -170, z: 0, f: 1, hy: 560, shx: 0, shy: 0 };
  F.setCam = o => Object.assign(C, { x: 0, y: -170, z: 0, f: 1, hy: 560, shx: 0, shy: 0 }, o);
  F.sc = D => C.f / Math.max(.05, D - C.z);
  F.L = (D, g = ctx) => { const s = F.sc(D); g.setTransform(s, 0, 0, s, W / 2 - C.x * s + C.shx, C.hy - C.y * s + C.shy); return s; };
  F.pr = (X, Y, D) => { const s = F.sc(D); return [W / 2 + (X - C.x) * s + C.shx, C.hy + (Y - C.y) * s + C.shy, s]; };
  F.visX = D => { const s = F.sc(D), tx = W / 2 - C.x * s + C.shx; return [-tx / s, (W - tx) / s]; };
  F.scr = (g = ctx) => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; g.filter = "none"; };
  // El kamerası: yavaş, düzensiz sallantı + darbe sarsıntıları
  F.hand = (t, amp = 1, hits = [], hitAmp = 30, hitDur = .5) => {
    const x = (Math.sin(t * .73) * 3 + Math.sin(t * 1.9 + 1) * 1.6 + Math.sin(t * 4.3 + 2) * .6) * amp, y = (Math.sin(t * .61 + 3) * 2.4 + Math.sin(t * 2.3) * 1.2 + Math.sin(t * 5.1 + 1) * .5) * amp;
    const [ix, iy] = impulse(t, hits, hitAmp, hitDur); C.shx = x + ix; C.shy = y + iy;
  };

  /* ---------- dokular ---------- */
  // Yıkık bina silueti katmanı. Piksel = D dünya birimi. Taban piksel yüksekliğin altı.
  function cityTex(seed, D, o = {}) {
    const R = mulberry(seed), w = o.w || 3200, h = o.h || 900, c = mk(w, h), g = c.getContext("2d"), px = 1 / D;
    g.fillStyle = o.col; let x = -20;
    while (x < w) {
      const bw = (o.bw0 + R() * o.bw1) * px, bh = Math.min(h - 10, (o.bh0 + R() * o.bh1) * px), top = h - bh;
      g.fillStyle = o.col; g.beginPath(); g.moveTo(x, h);
      // üst kenar: sağlam, kırık ya da çökmüş
      const kind = R();
      if (kind < .35) { g.lineTo(x, top); g.lineTo(x + bw * .08, top); g.lineTo(x + bw * .08, top - 6 * R()); g.lineTo(x + bw * .92, top - 6 * R()); g.lineTo(x + bw, top); }
      else if (kind < .8) { g.lineTo(x, top + R() * bh * .1); let cx = x; while (cx < x + bw) { cx += (8 + R() * 30) * (bw / 200 + .3); g.lineTo(Math.min(cx, x + bw), top + R() * bh * .22); } }
      else { g.lineTo(x, top); g.lineTo(x + bw * .35, top + R() * 20); g.lineTo(x + bw * .55, top + bh * (.3 + R() * .3)); g.lineTo(x + bw, top + bh * (.45 + R() * .3)); }
      g.lineTo(x + bw, h); g.closePath(); g.fill();
      // kademeli üst blok, çatı üniteleri, reklam panosu iskeleti
      const u = Math.max(1, 40 * px * 30);
      if (R() < .45 && kind < .8) { const sw2 = bw * (.4 + R() * .35), sx = x + (bw - sw2) * R(), sh2 = bh * (.08 + R() * .22); g.fillRect(sx, top - sh2, sw2, sh2 + 2); if (R() < .5) { const sw3 = sw2 * .5; g.fillRect(sx + sw2 * .25, top - sh2 - sh2 * .5, sw3, sh2 * .5 + 2); } }
      for (let k = 0, n = Math.floor(R() * 4); k < n; k++) { const cw = (60 + R() * 160) * px * 3, ch = (40 + R() * 120) * px * 3, cxp = x + R() * (bw - cw); g.fillRect(cxp, top - ch, cw, ch + 2); }
      if (o.detail && R() < .14) { const bx0 = x + bw * .2, bwid = bw * .6, bh0 = bwid * .35, by0 = top - bh0 - 14 * px * 40; g.strokeStyle = o.col; g.lineWidth = Math.max(1, 1.5 * px * 40); g.strokeRect(bx0, by0, bwid, bh0); for (let q = 0; q <= 4; q++) { g.beginPath(); g.moveTo(bx0 + bwid * q / 4, by0); g.lineTo(bx0 + bwid * q / 4, top); g.stroke(); } g.beginPath(); g.moveTo(bx0, by0); g.lineTo(bx0 + bwid, by0 + bh0); g.stroke(); if (R() < .5) { g.fillRect(bx0, by0, bwid * .45, bh0); } }
      // antenler, su tankları, vinç
      if (R() < .3) { g.fillRect(x + bw * (.2 + R() * .6), top - (30 + R() * 90) * px * 40, Math.max(1, 2 * px * 40), (30 + R() * 90) * px * 40); }
      if (o.detail && R() < .25) { const tx = x + bw * .3, tw = 50 * px * 40 * .6; g.fillRect(tx, top - tw * 1.1, tw, tw * .8); g.fillRect(tx + 2, top - tw * .3, 2, tw * .3); g.fillRect(tx + tw - 4, top - tw * .3, 2, tw * .3); }
      if (o.detail && R() < .12) { const cx0 = x + bw * .5, ch = bh * .9; g.strokeStyle = o.col; g.lineWidth = Math.max(1, 3 * px * 40); g.beginPath(); g.moveTo(cx0, top); g.lineTo(cx0, top - ch * .6); g.lineTo(cx0 + bw * 1.4, top - ch * .6 + 10); g.moveTo(cx0 - bw * .3, top - ch * .6); g.lineTo(cx0, top - ch * .75); g.stroke(); g.beginPath(); g.moveTo(cx0 + bw * 1.2, top - ch * .6 + 8); g.lineTo(cx0 + bw * 1.2, top - ch * .25); g.stroke(); }
      // pencereler: delik (arka plan görünür) ya da karanlık
      const fl = Math.max(3, 340 * px), ww = Math.max(1.5, 90 * px), wh = Math.max(2, 150 * px);
      if (fl > 4) for (let yy = top + fl * .6; yy < h - fl; yy += fl) for (let xx = x + ww * 1.2; xx < x + bw - ww * 1.4; xx += ww * 2.2) {
        const r0 = R() * (R() < .3 ? 3 : 1);
        if (r0 < (o.holes || 0)) { g.globalCompositeOperation = "destination-out"; g.fillRect(xx, yy, ww, wh * (R() < .3 ? 1.6 : 1)); g.globalCompositeOperation = "source-over"; }
        else if (r0 < (o.holes || 0) + (o.lit || 0)) { g.fillStyle = `rgba(255,${110 + R() * 60},40,${.4 + R() * .5})`; g.fillRect(xx, yy, ww, wh); g.fillStyle = o.col; }
        else if (r0 < .45) { g.fillStyle = o.win || "rgba(0,0,0,.28)"; g.fillRect(xx, yy, ww, wh); g.fillStyle = o.col; }
      }
      // çökmüş katlarda dışarı taşan döşeme ve inşaat demirleri
      if (o.detail && kind >= .8) { g.strokeStyle = o.col; g.lineWidth = Math.max(1, 1.5 * px * 40); for (let k = 0; k < 6; k++) { const yy = top + bh * (.35 + k * .08); g.fillRect(x + bw * .5, yy, bw * .55, Math.max(2, 25 * px)); for (let r2 = 0; r2 < 4; r2++) { const rx = x + bw * (.95 + R() * .1); g.beginPath(); g.moveTo(rx, yy); g.lineTo(rx + (R() - .3) * 20, yy - 10 - R() * 20); g.stroke(); } } }
      x += bw + (R() < (o.gap || .3) ? (200 + R() * 1400) * px * (o.gap ? 3 : 1) : 0);
    }
    return { c, D, r: px, w, h };
  }
  // Bulut dokusu: fırtına bulutları (koyu), alt yüzeyleri ateşle aydınlanabilir
  function cloudTex(seed, col) {
    const c = mk(3000, 700), g = c.getContext("2d"), R = mulberry(seed);
    for (let pass = 0; pass < 3; pass++) { g.filter = `blur(${26 - pass * 8}px)`; for (let i = 0; i < 110; i++) { const x = R() * 3000, y = 140 + R() * 420 + pass * 30, rx = 80 + R() * 340 / (pass + 1), ry = 30 + R() * 90 / (pass + 1); g.fillStyle = `rgba(${col},${.25 + R() * .35})`; ell(g, x, y, rx, ry); } }
    g.filter = "none"; return c;
  }
  function smokeTex() { const c = mk(256, 256), g = c.getContext("2d"), R = mulberry(77); g.filter = "blur(10px)"; for (let i = 0; i < 26; i++) { const r = 20 + R() * 50; g.fillStyle = `rgba(20,20,22,${.15 + R() * .2})`; circ(g, 128 + (R() - .5) * 90, 128 + (R() - .5) * 90, r); } return c; }
  function fogTex() { const c = mk(2400, 600), g = c.getContext("2d"), R = mulberry(88); g.filter = "blur(40px)"; for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(150,165,185,${.08 + R() * .12})`; ell(g, R() * 2400, 150 + R() * 300, 100 + R() * 300, 40 + R() * 90); } return c; }
  function rayTex() { const c = mk(512, 512), g = c.getContext("2d"), R = mulberry(66); g.translate(256, 256); for (let i = 0; i < 70; i++) { const a = R() * TAU, w = .01 + R() * .05, gr = g.createRadialGradient(0, 0, 0, 0, 0, 256); gr.addColorStop(0, `rgba(255,255,255,${.15 + R() * .2})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 256, a, a + w); g.fill(); } return c; }
  F.T = {};
  F.bake = () => {
    const T = F.T;
    T.far = cityTex(11, 70, { col: "#303b4b", bw0: 2500, bw1: 7000, bh0: 1500, bh1: 7500, holes: 0, lit: .004, w: 3600, h: 300, gap: .35 });
    T.far2 = cityTex(12, 38, { col: "#1e2632", bw0: 2000, bw1: 6000, bh0: 2000, bh1: 8500, holes: .03, lit: .006, w: 3600, h: 400, detail: 1, gap: .3 });
    T.mid = cityTex(13, 20, { col: "#121821", bw0: 1500, bw1: 4200, bh0: 2200, bh1: 7200, holes: .07, lit: .006, w: 3600, h: 500, detail: 1, gap: .3 });
    T.near = cityTex(14, 9, { col: "#090c11", bw0: 900, bw1: 2400, bh0: 1600, bh1: 4600, holes: .1, lit: .003, w: 3600, h: 700, detail: 1, gap: .35 });
    T.close = cityTex(15, 4, { col: "#040507", bw0: 500, bw1: 1300, bh0: 1000, bh1: 2400, holes: .12, lit: 0, w: 3600, h: 800, detail: 1, gap: .45 });
    T.clouds = cloudTex(21, "38,46,60"); T.cloudsLit = cloudTex(21, "255,120,50"); T.smoke = smokeTex(); T.fog = fogTex(); T.rays = rayTex();
    T.tmp = mk(W, H); T.tmp2 = mk(W / 4, H / 4); T.bloom = mk(W / 8, H / 8);
  };
  // Katman çiz: yatayda döşenir, tabanı Y=0 (yb ile kaydırılabilir)
  F.layer = (T, yb = 0, alpha = 1) => {
    const s = F.L(T.D), ww = T.w / T.r, hh = T.h / T.r, [x0, x1] = F.visX(T.D); ctx.globalAlpha = alpha;
    for (let x = Math.floor(x0 / ww) * ww; x < x1; x += ww) ctx.drawImage(T.c, x, yb - hh, ww + 1 / s, hh);
    ctx.globalAlpha = 1;
  };
  // Atmosferik sis: ufuk çizgisinde yoğun, yukarı ve aşağı söner
  // Yer sisi: katmanın tabanında yoğun, yukarı doğru söner (D: katman derinliği)
  F.haze = (a, col = "96,110,130", D = 20, spread = 340) => {
    if (a <= 0) return; F.scr(); const by = Math.min(H + 400, F.pr(0, 0, D)[1]), y0 = by - spread;
    const gr = ctx.createLinearGradient(0, y0, 0, by); gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(1, `rgba(${col},${a})`);
    ctx.fillStyle = gr; ctx.fillRect(0, y0, W, by - y0); if (by < H) { const g2 = ctx.createLinearGradient(0, by, 0, by + 120); g2.addColorStop(0, `rgba(${col},${a})`); g2.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g2; ctx.fillRect(0, by, W, 120); }
  };
  // Sürüklenen sis katmanı (ekran uzayında, derinliğe göre paralaks)
  F.fogLayer = (t, y, a = .5, speed = 20, scale = 1, par = 0) => {
    F.scr(); ctx.globalAlpha = a; const w = 2400 * scale, off = ((t * speed + C.x * par) % w + w) % w;
    for (let k = -1; k < 2; k++) ctx.drawImage(F.T.fog, k * w - off, y - 300 * scale, w, 600 * scale);
    ctx.globalAlpha = 1;
  };
  F.sky = (t, o = {}) => {
    F.scr(); const hy = C.hy + C.shy;
    const gr = ctx.createLinearGradient(0, hy - 900, 0, hy + 100); gr.addColorStop(0, o.top || "#07090d"); gr.addColorStop(.75, o.mid || "#1b2230"); gr.addColorStop(1, o.hor || "#2c3544");
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    if (o.glow) for (const [x, gs, ga] of o.glow) F.glowS(x, hy - 20, gs, "255,110,40", ga);
    const off = (t * (o.cloudSpeed ?? 10) + C.x * .02) % 3000, cy = hy - 620 + (o.cloudY || 0);
    ctx.globalAlpha = o.cloudA ?? .85; for (let k = -1; k < 2; k++) ctx.drawImage(F.T.clouds, k * 3000 - off, cy, 3000, 700);
    if (o.glow) { const tc = F.T.tmp, tg = tc.getContext("2d"); tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, W, H); tg.globalCompositeOperation = "source-over";
      for (let k = -1; k < 2; k++) tg.drawImage(F.T.cloudsLit, k * 3000 - off, cy, 3000, 700);
      tg.globalCompositeOperation = "destination-in"; for (const [x, gs, ga] of o.glow) { const rg = tg.createRadialGradient(x, hy, 0, x, hy, gs * 1.4); rg.addColorStop(0, `rgba(0,0,0,${ga})`); rg.addColorStop(1, "rgba(0,0,0,0)"); tg.fillStyle = rg; tg.fillRect(0, 0, W, H); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "screen"; ctx.drawImage(tc, 0, 0); ctx.globalCompositeOperation = "source-over"; tg.globalCompositeOperation = "source-over"; }
    ctx.globalAlpha = 1;
    if (o.flash > 0) { ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = o.flash; for (let k = -1; k < 2; k++) ctx.drawImage(F.T.clouds, k * 3000 - off, cy, 3000, 700); ctx.fillStyle = `rgba(160,180,220,${o.flash * .5})`; ctx.fillRect(0, 0, W, hy + 50); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; }
  };
  F.glowS = (x, y, r, col, a, comp = "lighter") => { if (a <= 0 || r <= 0) return; F.scr(); ctx.globalCompositeOperation = comp; const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.35, `rgba(${col},${a * .45})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.globalCompositeOperation = "source-over"; };
  F.rays = (x, y, r, a, rotA = 0, col = "255,150,80") => { if (a <= 0) return; F.scr(); ctx.save(); ctx.translate(x, y); ctx.rotate(rotA); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a; ctx.drawImage(F.T.rays, -r, -r, r * 2, r * 2); ctx.globalCompositeOperation = "source-atop"; ctx.restore(); F.scr(); };
  F.bolt = (seed, x, y0, y1, a) => { if (a <= 0) return; F.scr(); const R = mulberry(seed); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"; ctx.lineJoin = "round";
    const branch = (px, py, len, dir, w, depth) => { const pts = [[px, py]]; let x = px, y = py; for (let i = 0; i < len; i++) { x += (R() - .5) * 60 + dir * 10; y += 25 + R() * 25; pts.push([x, y]); if (depth < 2 && R() < .18) branch(x, y, 4 + R() * 5, (R() - .5) * 3, w * .5, depth + 1); if (y > y1) break; }
      for (const [lw, al] of [[w * 6, .12], [w * 2.2, .45], [w, 1]]) { ctx.strokeStyle = `rgba(215,228,255,${al * a})`; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([qx, qy], i) => i ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy)); ctx.stroke(); } };
    branch(x, y0, 40, 0, 2.6, 0); ctx.globalCompositeOperation = "source-over"; };
  // Ateş (dünya koordinatı, etkin katmanda): alevler + çekirdek + kıvılcım
  F.fire = (g, x, y, sz, t, seed = 0, inten = 1) => {
    g.save(); g.globalCompositeOperation = "lighter";
    const n = 20;
    for (let k = 0; k < n; k++) {
      const r1 = rnd(seed * 13 + k), r2 = rnd(seed * 7 + k * 3), sp = 2.6 + r1 * 3, ph = t * sp + k * 1.9 + seed;
      const bx = x + (k / (n - 1) - .5) * sz * (.7 + .2 * r2), h = sz * (.7 + r1 * 1.1) * (.75 + .25 * Math.sin(ph * 1.3) + .15 * Math.sin(ph * 3.1)) * inten, w = sz * (.1 + .12 * r2);
      const sway = Math.sin(ph * .9) * sz * .18, curl = Math.sin(ph * 1.7 + 1) * sz * .12;
      const gr = g.createLinearGradient(0, y, 0, y - h);
      gr.addColorStop(0, `rgba(255,244,210,${.32 * inten})`); gr.addColorStop(.2, `rgba(255,190,90,${.3 * inten})`); gr.addColorStop(.55, `rgba(255,112,34,${.22 * inten})`); gr.addColorStop(1, "rgba(150,25,5,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(bx - w, y);
      g.bezierCurveTo(bx - w * 1.2, y - h * .35, bx + sway - w * .4, y - h * .65, bx + sway + curl, y - h);
      g.bezierCurveTo(bx + sway + w * .3, y - h * .6, bx + w * 1.2, y - h * .3, bx + w, y); g.fill();
      // kopan alev parçası
      const lf = (t * .9 + r1) % 1; if (r2 > .55) { const fy = y - h * (.9 + lf * .8), fs = w * (1 - lf) * .8; const g2 = g.createRadialGradient(bx + sway + curl, fy, 0, bx + sway + curl, fy, fs * 2); g2.addColorStop(0, `rgba(255,150,50,${.35 * (1 - lf) * inten})`); g2.addColorStop(1, "rgba(255,90,20,0)"); g.fillStyle = g2; g.fillRect(bx + sway + curl - fs * 2, fy - fs * 2, fs * 4, fs * 4); }
    }
    const cg = g.createRadialGradient(x, y - sz * .15, 0, x, y - sz * .15, sz * .6); cg.addColorStop(0, `rgba(255,248,225,${.5 * inten})`); cg.addColorStop(.5, `rgba(255,180,90,${.22 * inten})`); cg.addColorStop(1, "rgba(255,150,60,0)"); g.fillStyle = cg; g.fillRect(x - sz, y - sz, sz * 2, sz * 1.1);
    for (let k = 0; k < 30; k++) { const life = (t * (.3 + (k % 5) * .07) + rnd(seed * 31 + k)) % 1, a0 = rnd(seed * 17 + k); g.fillStyle = `rgba(255,${150 + 80 * rnd(k)},60,${(1 - life) * inten})`; const px = x + (a0 - .5) * sz * .8 + Math.sin(t * 2 + k) * sz * .5 * life, py = y - sz * .6 - life * sz * 5, r = sz * .022 * (1 - life * .5); g.fillRect(px, py, r * 2, r * 2); }
    g.restore();
  };
  F.smoke = (g, x, y, sz, t, seed = 0, n = 10, rise = 1, a = .8) => { for (let i = 0; i < n; i++) { const life = ((t * .07 * rise + i / n + rnd(seed + i) * .1) % 1), s = sz * (.6 + life * 2.5), px = x + Math.sin(t * .3 + i) * sz * .3 + life * sz * .8, py = y - life * sz * 6; g.globalAlpha = a * Math.sin(life * Math.PI); g.drawImage(F.T.smoke, px - s / 2, py - s / 2, s, s); } g.globalAlpha = 1; };
  // Katmanlı yağmur: ön plan kalın/hızlı, arka ince; ışıklara yakın damlalar aydınlanır
  F.rain = (t, amt = 1, wind = .12, lights = [], slow = 1) => {
    F.scr(); ctx.lineCap = "round"; const tt = t * slow;
    const L = [[260, 10, 22, .7, .09, 1100], [170, 26, 44, 1.1, .14, 1700], [60, 60, 110, 2, .16, 2500], [14, 130, 220, 3.6, .1, 3300]];
    L.forEach(([n, l0, l1, w, a, sp], li) => {
      const cnt = Math.floor(n * amt); ctx.lineWidth = w;
      for (let i = 0; i < cnt; i++) {
        const k = i + li * 1000, len = (l0 + (l1 - l0) * rnd(k + .3)) * (slow < 1 ? .4 + slow * .6 : 1), y = ((rnd(k + .5) * H * 1.4 + tt * sp * (.85 + .3 * rnd(k + .7))) % (H * 1.4)) - H * .2, x = rnd(k) * (W + 600) - 300 - y * wind;
        let br = 0, lc = "255,170,90"; for (const l of lights) { const d = Math.hypot(x - l[0], y - l[1]); if (d < l[2]) { const v = (1 - d / l[2]) * (l[3] ?? 1); if (v > br) { br = v; lc = l[4] || lc; } } }
        ctx.strokeStyle = br > .02 ? `rgba(${lc},${Math.min(.9, a + br * .7)})` : `rgba(175,190,215,${a})`;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * wind, y + len); ctx.stroke();
      }
    });
  };
  F.splashes = (t, y0, y1, amt = 1) => { F.scr(); ctx.strokeStyle = "rgba(170,190,220,.35)"; ctx.lineWidth = 1.2;
    for (let i = 0, n = Math.floor(90 * amt); i < n; i++) { const per = .35 + .2 * rnd(i * 3.3), ph = t / per + rnd(i * 1.7), f = ph % 1, cyc = Math.floor(ph), x = rnd(i * 13 + cyc * .37) * W, y = y0 + rnd(i * 7 + cyc * .91) * (y1 - y0), sc = .3 + (y - y0) / (y1 - y0 + 1);
      ctx.globalAlpha = (1 - f) * .8; ctx.beginPath(); ctx.ellipse(x, y, (2 + 11 * f) * sc, (1 + 3 * f) * sc, 0, 0, TAU); ctx.stroke(); } ctx.globalAlpha = 1; };
  // Kül (gri, yavaş, dönen) ve kıvılcım (turuncu, yükselen)
  F.ash = (t, n = 80, a = .6, dx = -20) => { F.scr(); for (let i = 0; i < n; i++) { const per = 6 + 6 * rnd(i), f = (t / per + rnd(i * 2)) % 1, x = ((rnd(i * 5) * W + dx * t * (0.5 + rnd(i)) + Math.sin(t * .8 + i) * 40) % W + W) % W, y = -20 + f * (H + 40), s = 1.5 + 2.5 * rnd(i * 3); ctx.save(); ctx.translate(x, y); ctx.rotate(t * (1 + rnd(i)) + i); ctx.fillStyle = `rgba(150,150,155,${a * Math.sin(f * Math.PI) * (.4 + .6 * rnd(i * 7))})`; ctx.fillRect(-s, -s * .4, s * 2, s * .8); ctx.restore(); } };
  F.embers = (t, n = 60, a = 1, x0 = 0, x1 = W, y0 = H) => { F.scr(); ctx.globalCompositeOperation = "lighter"; for (let i = 0; i < n; i++) { const per = 3 + 3 * rnd(i), f = (t / per + rnd(i * 2)) % 1, x = x0 + rnd(i * 5) * (x1 - x0) + Math.sin(t * 1.3 + i) * 40 - f * 90, y = y0 - f * (H * .9), s = 1.2 + 2.2 * rnd(i * 3); ctx.fillStyle = `rgba(255,${120 + 100 * rnd(i)},50,${Math.sin(f * Math.PI) * a})`; ctx.fillRect(x, y, s, s); } ctx.globalCompositeOperation = "source-over"; };
  // Islak zemin: ufkun üstünü aynalayıp dalgalı yansıma olarak zemine basar
  F.reflect = (y, depth = 380, a = .32) => {
    F.scr(); const tc = F.T.tmp, tg = tc.getContext("2d"), h = Math.min(depth, y), yy = Math.round(y);
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, W, h + 2); tg.drawImage(ctx.canvas, 0, yy - h, W, h, 0, 0, W, h);
    ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < h; i += 6) { const off = Math.sin(i * .35) * 3; ctx.drawImage(tc, 0, h - i - 6, W, 6, off, yy + i, W, 6); } ctx.restore();
    const gr = ctx.createLinearGradient(0, yy, 0, yy + h); gr.addColorStop(0, "rgba(4,5,7,0)"); gr.addColorStop(1, "rgba(4,5,7,.9)"); ctx.fillStyle = gr; ctx.fillRect(0, yy, W, h);
  };
  F.ground = (col1 = "#0b0d11", col2 = "#030304") => { F.scr(); const hy = C.hy + C.shy - C.y * F.sc(1e4); const gr = ctx.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, col1); gr.addColorStop(1, col2); ctx.fillStyle = gr; ctx.fillRect(0, hy, W, H - hy); };
  // Kablo (sarkık zincir eğrisi) ve direk
  F.cable = (g, a, b, sag, w = 2) => { g.strokeStyle = "#020203"; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag * 2, b[0], b[1]); g.stroke(); };
  F.pole = (g, x, h, tilt = 0, w = 14) => { g.save(); g.translate(x, 0); g.rotate(tilt); g.fillStyle = "#020203"; g.fillRect(-w / 2, -h, w, h); g.fillRect(-w * 2, -h + 20, w * 4, 6); g.restore(); return [x + Math.sin(tilt) * h, -Math.cos(tilt) * h + 20]; };
  // Yanan araba silueti
  F.car = (g, x, flip = 1, tilt = 0, sc = 1) => { g.save(); g.translate(x, 0); g.scale(flip * sc, sc); g.rotate(tilt); g.fillStyle = "#020203";
    g.beginPath(); g.moveTo(-230, -30); g.lineTo(-232, -92); g.lineTo(-150, -104); g.lineTo(-95, -168); g.lineTo(70, -170); g.lineTo(140, -108); g.lineTo(225, -98); g.lineTo(234, -30); g.closePath(); g.fill();
    circ(g, -140, -30, 42); circ(g, 140, -24, 40); g.restore(); };
  /* ---------- post ---------- */
  const CA = mk(W, H), CAX = CA.getContext("2d"), CB = mk(W, H), CBX = CB.getContext("2d");
  F.post = (t, o = {}) => {
    F.scr();
    // bloom: parlaklar yayılır
    const b = F.T.bloom, bg = b.getContext("2d"); bg.setTransform(1, 0, 0, 1, 0, 0); bg.globalCompositeOperation = "source-over"; bg.drawImage(ctx.canvas, 0, 0, b.width, b.height);
    bg.globalCompositeOperation = "multiply"; bg.drawImage(b, 0, 0); bg.drawImage(b, 0, 0); bg.globalCompositeOperation = "source-over";
    ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = o.bloom ?? .55; ctx.filter = "blur(18px)"; ctx.drawImage(b, 0, 0, W, H); ctx.restore();
    // kromatik sapma: kırmızı dışa, mavi içe
    const ca = o.ca ?? 1;
    if (ca > 0) {
      CAX.setTransform(1, 0, 0, 1, 0, 0); CAX.globalCompositeOperation = "source-over"; CAX.drawImage(ctx.canvas, 0, 0); CAX.globalCompositeOperation = "multiply"; CAX.fillStyle = "#f00"; CAX.fillRect(0, 0, W, H);
      CBX.setTransform(1, 0, 0, 1, 0, 0); CBX.globalCompositeOperation = "source-over"; CBX.drawImage(ctx.canvas, 0, 0); CBX.globalCompositeOperation = "multiply"; CBX.fillStyle = "#00f"; CBX.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = "#0f0"; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = "lighter";
      const k = .0022 * ca; ctx.drawImage(CA, -W * k, -H * k, W * (1 + 2 * k), H * (1 + 2 * k)); ctx.drawImage(CB, W * k * .6, H * k * .6, W * (1 - 1.2 * k), H * (1 - 1.2 * k)); ctx.globalCompositeOperation = "source-over";
    }
    ctx.drawImage(VIGNETTE, 0, 0); if (o.vig) { ctx.globalAlpha = o.vig; ctx.drawImage(VIGNETTE, 0, 0); ctx.globalAlpha = 1; }
    ctx.globalAlpha = o.grain ?? .1; ctx.globalCompositeOperation = "overlay"; ctx.drawImage(GRAIN[Math.floor(t * 30) % GRAIN.length], 0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  };
})();
