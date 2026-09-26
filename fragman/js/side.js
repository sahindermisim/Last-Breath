"use strict";
/* =========================================================================
   YAN GÖRÜNÜM — paralaks katmanlar, sinematik ışık ve eklemli siluet animasyonu
   Dünya birimi: özne düzleminde piksel. Zemin y = 0, yukarısı negatif.
   ========================================================================= */

/* ---------- kamera ---------- */
const SV = { x: 0, y: 0, z: 1, sx: 0, sy: 0 };
function sv(x, y, z, sh = [0, 0]) { Object.assign(SV, { x, y, z, sx: sh[0], sy: sh[1] }); }
// d: derinlik. 0 = sabit arka plan, 1 = özne düzlemi, >1 = ön plan (daha hızlı kayar, daha büyük)
function L(d, g = ctx) {
  const s = Math.pow(SV.z, d) * (d > 1 ? 1 + (d - 1) * .6 : 1), tx = W / 2 - SV.x * d * s + SV.sx * d, ty = H / 2 - SV.y * d * s + SV.sy * d;
  g.setTransform(s, 0, 0, s, tx, ty); return { s, tx, ty };
}
function P(d, x, y) { const { s, tx, ty } = L(d, TX); return [tx + x * s, ty + y * s, s]; }
function visX(d) { const { s, tx } = L(d, TX); return [(-tx) / s - 50, (W - tx) / s + 50]; }
function scr() { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; ctx.filter = "none"; }

/* ---------- dokular ---------- */
let SKY_FAR, SKY_MID, SKY_MID_B, CLOUDS, MESH;
function makeSkyline(seed, w, h, col, o = {}) {
  const c = mk(w, h), g = c.getContext("2d"), R = mulberry(seed);
  let x = 0;
  while (x < w) {
    const bw = (o.minW || 60) + R() * (o.varW || 180), bh = h * (o.minH ?? .25) + R() * h * (o.varH ?? .7), top = h - bh;
    g.fillStyle = col; g.fillRect(x, top, bw, bh);
    if (o.broken && R() < .45) { g.beginPath(); g.moveTo(x, top); for (let k = 1; k <= 6; k++) g.lineTo(x + bw * k / 6, top + (R() - .3) * 40); g.lineTo(x + bw, h); g.lineTo(x, h); g.closePath(); g.fillStyle = col; g.fill(); g.globalCompositeOperation = "destination-out"; g.beginPath(); g.moveTo(x + bw * .2, top - 1); for (let k = 0; k < 5; k++) g.lineTo(x + bw * (.2 + k * .15), top + R() * 30); g.lineTo(x + bw * .9, top - 1); g.fill(); g.globalCompositeOperation = "source-over"; }
    if (R() < .3) g.fillRect(x + bw * (.3 + R() * .4), top - 40 - R() * 60, 3, 100);
    if (R() < .15) { g.fillRect(x + bw * .3, top - 34, 30, 22); g.fillRect(x + bw * .3 + 4, top - 12, 3, 12); g.fillRect(x + bw * .3 + 23, top - 12, 3, 12); }
    for (let yy = top + 14; yy < h - 10; yy += 18) for (let xx = x + 8; xx < x + bw - 10; xx += 14) {
      if (R() < (o.win || 0)) { g.fillStyle = R() < .7 ? `rgba(255,${160 + R() * 50},${90 + R() * 40},${.25 + R() * .45})` : `rgba(140,170,210,${.15 + R() * .2})`; g.fillRect(xx, yy, 6, 8); g.fillStyle = col; }
    }
    x += bw + R() * (o.gap || 14);
  }
  return c;
}
function makeClouds() {
  const c = mk(3000, 520), g = c.getContext("2d"), R = mulberry(31);
  g.filter = "blur(18px)";
  for (let i = 0; i < 70; i++) { const x = R() * 3000, y = 120 + R() * 300, rx = 120 + R() * 320, ry = 30 + R() * 60; g.fillStyle = `rgba(${40 + R() * 20},${50 + R() * 20},${70 + R() * 25},${.25 + R() * .3})`; ell(g, x, y, rx, ry); }
  g.filter = "blur(4px)";
  for (let i = 0; i < 40; i++) { const x = R() * 3000, y = 160 + R() * 280; g.fillStyle = `rgba(120,140,170,${.05 + R() * .08})`; ell(g, x, y - 20, 80 + R() * 200, 8 + R() * 14); }
  return c;
}
function makeMesh() { const c = mk(28, 28), g = c.getContext("2d"); g.strokeStyle = "rgba(60,64,70,.9)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(28, 28); g.moveTo(28, 0); g.lineTo(0, 28); g.stroke(); return c; }
function makeSide() {
  SKY_FAR = makeSkyline(11, 4096, 420, "#111823", { win: .02, minW: 50, varW: 140 });
  SKY_MID = makeSkyline(12, 4096, 560, "#0a0d12", { win: .035, broken: true, minW: 80, varW: 220, minH: .2 });
  SKY_MID_B = mk(4096, 560); const b = SKY_MID_B.getContext("2d"); b.filter = "blur(10px)"; b.drawImage(SKY_MID, 0, 0);
  CLOUDS = makeClouds(); MESH = makeMesh();
}

/* ---------- arka plan ---------- */
function sky(t, o = {}) {
  scr();
  const top = o.top || "#04060b", hor = o.hor || "#1a2231", gr = ctx.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, top); gr.addColorStop(o.horY ?? .62, hor); gr.addColorStop(1, "#05060a"); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  if (o.moon !== false) {
    const [mx, my] = o.moon || [1420, 250];
    ctx.globalCompositeOperation = "lighter";
    let g2 = ctx.createRadialGradient(mx, my, 0, mx, my, 420); g2.addColorStop(0, "rgba(120,150,200,.35)"); g2.addColorStop(1, "rgba(40,60,100,0)"); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "#cfd6e2"; circ(ctx, mx, my, 40);
    ctx.fillStyle = "rgba(150,160,175,.35)"; circ(ctx, mx - 10, my - 6, 9); circ(ctx, mx + 12, my + 10, 6);
  }
  if (o.clouds !== false) { ctx.globalAlpha = .9; const off = (t * (o.cloudSpeed ?? 8)) % 3000; for (let k = -1; k < 2; k++) ctx.drawImage(CLOUDS, k * 3000 - off, o.cloudY ?? 40); ctx.globalAlpha = 1; }
}
function tile(tex, d, y0, blurred = false) {
  const [x0, x1] = visX(d); L(d);
  const w = tex.width, st = Math.floor(x0 / w) * w;
  for (let x = st; x < x1; x += w) ctx.drawImage(tex, x, y0 - tex.height);
}
function ground(d = 1, o = {}) {
  const [x0, x1] = visX(d); L(d);
  const gr = ctx.createLinearGradient(0, 0, 0, 700); gr.addColorStop(0, o.c1 || "#0d1016"); gr.addColorStop(1, o.c2 || "#030304");
  ctx.fillStyle = gr; ctx.fillRect(x0, -2, x1 - x0, 3000);
  ctx.fillStyle = "rgba(120,140,170,.05)"; for (let i = 0; i < 14; i++) { const y = 6 + i * i * 3.2; ctx.fillRect(x0, y, x1 - x0, 1 + i * .15); }
}
function haze(yScreen, h, a = .25, col = "60,75,100") {
  scr(); const gr = ctx.createLinearGradient(0, yScreen - h, 0, yScreen + h);
  gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(.5, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gr; ctx.fillRect(0, yScreen - h, W, h * 2);
}
function glow(x, y, r, col, a) {
  if (a <= 0 || r <= 0) return; scr(); ctx.globalCompositeOperation = "lighter";
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalCompositeOperation = "source-over";
}
// Işıkları dünya koordinatında verir; ekranda parıltı + ıslak zeminde dikey yansıma çizer.
function lights(list) {
  for (const l of list) {
    const [x, y, s] = P(l.d ?? 1, l.x, l.y), [, gy] = P(l.d ?? 1, l.x, 0);
    glow(x, y, l.r * s, l.c, l.a);
    if (l.refl !== false) {
      scr(); ctx.globalCompositeOperation = "lighter"; const len = (l.rl ?? 260) * s, w = (l.rw ?? 26) * s;
      const gr = ctx.createLinearGradient(0, gy, 0, gy + len); gr.addColorStop(0, `rgba(${l.c},${l.a * .7})`); gr.addColorStop(1, `rgba(${l.c},0)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(x, gy + len / 2, w, len / 2, 0, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = "source-over";
    }
  }
}
function flare(x, y, k, col = "180,210,255") {
  if (k <= 0) return; scr(); ctx.globalCompositeOperation = "lighter";
  let gr = ctx.createRadialGradient(x, y, 0, x, y, 90 * k); gr.addColorStop(0, `rgba(255,250,240,${k})`); gr.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = gr; ctx.fillRect(x - 90 * k, y - 90 * k, 180 * k, 180 * k);
  gr = ctx.createLinearGradient(x - 900 * k, 0, x + 900 * k, 0); gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(.5, `rgba(${col},${.55 * k})`); gr.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = gr; ctx.fillRect(x - 900 * k, y - 2.5 * k, 1800 * k, 5 * k);
  for (let i = 1; i <= 3; i++) { const gx = x + (W / 2 - x) * i * .5, gy = y + (H / 2 - y) * i * .5; ctx.fillStyle = `rgba(${col},${.06 * k})`; circ(ctx, gx, gy, 30 * i * k); }
  ctx.globalCompositeOperation = "source-over";
}
function beam(x, y, a, len, spread, alpha, col = "215,228,255") {
  if (alpha <= 0) return; scr(); ctx.globalCompositeOperation = "lighter";
  for (const [sp, al] of [[spread * 2.2, alpha * .25], [spread, alpha]]) {
    const gr = ctx.createRadialGradient(x, y, 0, x, y, len); gr.addColorStop(0, `rgba(${col},${al})`); gr.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, len, a - sp, a + sp); ctx.closePath(); ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}
function rain3(t, amt = 1, wind = .16) {
  scr(); ctx.lineCap = "round";
  const layers = [[220, 12, 24, .8, .1, 1300], [140, 30, 50, 1.3, .17, 2000], [34, 80, 130, 2.6, .2, 2900]];
  layers.forEach(([n, l0, l1, w, a, sp], li) => {
    ctx.strokeStyle = `rgba(180,200,230,${a})`; ctx.lineWidth = w; ctx.beginPath();
    for (let i = 0, m = Math.floor(n * amt); i < m; i++) {
      const k = i + li * 1000, len = l0 + (l1 - l0) * rnd(k + .3), y = ((rnd(k + .5) * H * 1.4 + t * sp * (.85 + .3 * rnd(k + .7))) % (H * 1.4)) - H * .2, x = rnd(k) * (W + 600) - 200 - y * wind;
      ctx.moveTo(x, y); ctx.lineTo(x - len * wind, y + len);
    }
    ctx.stroke();
  });
}
function splashes(t, gy, amt = 1, spread = 260) {
  scr(); ctx.strokeStyle = "rgba(170,195,230,.35)"; ctx.lineWidth = 1.2;
  for (let i = 0, n = Math.floor(80 * amt); i < n; i++) {
    const per = .35 + .2 * rnd(i * 3.3), ph = t / per + rnd(i * 1.7), f = ph % 1, cyc = Math.floor(ph), x = rnd(i * 13 + cyc * .37) * W, y = gy + rnd(i * 7 + cyc * .91) * spread;
    const sc = .4 + (y - gy) / spread; ctx.globalAlpha = (1 - f) * .8; ctx.beginPath(); ctx.ellipse(x, y, (2 + 10 * f) * sc, (1 + 3 * f) * sc, 0, 0, TAU); ctx.stroke();
    if (f < .3) { ctx.beginPath(); ctx.moveTo(x - 3 * sc, y); ctx.lineTo(x - 5 * sc, y - 8 * f * 10 * sc); ctx.moveTo(x + 3 * sc, y); ctx.lineTo(x + 5 * sc, y - 8 * f * 10 * sc); ctx.stroke(); }
  }
  ctx.globalAlpha = 1;
}
function fogBands(t, y, h, a = .12, col = "140,155,180", sp = 20) {
  scr();
  for (let i = 0; i < 8; i++) {
    const r = 500 + 300 * rnd(i * 1.9), x = ((rnd(i * 2.1) * (W + 1400) + t * sp * (.5 + rnd(i))) % (W + 1400)) - 700, yy = y + (rnd(i * 5.3) - .5) * h;
    ctx.save(); ctx.translate(x, yy); ctx.scale(1, .28); const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gr; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore();
  }
}
function bokeh(t, list) { for (const [x, y, r, col, a] of list) glow(x, y, r, col, a * (.85 + .15 * Math.sin(t * 7 + x))); }
function vapor(x, y, k, dir = 1, size = 1) {
  if (k <= 0 || k >= 1) return; scr();
  for (let i = 0; i < 4; i++) { const r = (18 + 50 * k + i * 8) * size, gx = x + dir * (30 * k + i * 12) * size, gy = y - (10 * k + i * 4) * size; const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, r); gr.addColorStop(0, `rgba(200,210,225,${.13 * (1 - k)})`); gr.addColorStop(1, "rgba(200,210,225,0)"); ctx.fillStyle = gr; ctx.fillRect(gx - r, gy - r, r * 2, r * 2); }
}
function whiteFlash(a, col = "235,240,255") { if (a > 0) { scr(); ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); } }

/* ---------- sahne objeleri (dünya koordinatı, zemin y=0) ---------- */
const INK = "#050608";
function barrelS(g, x, sc = 1) { g.save(); g.translate(x, 0); g.scale(sc, sc); g.fillStyle = "#0b0908"; g.fillRect(-19, -54, 38, 54); g.fillStyle = "#1c130c"; g.fillRect(-19, -42, 38, 3); g.fillRect(-19, -19, 38, 3); g.fillStyle = "rgba(255,120,40,.25)"; g.fillRect(-19, -54, 38, 2); g.restore(); }
function fireS(g, x, t, i, sc = 1, top = -54) {
  g.save(); g.translate(x, top * sc); g.scale(sc, sc); g.globalCompositeOperation = "lighter";
  for (let k = 0; k < 9; k++) {
    const ph = t * (4 + k * .7) + i * 3 + k, fx = (k - 4) * 4 + Math.sin(ph) * 4, h = 42 + 26 * Math.sin(ph * 1.7 + k) + (k % 3) * 12, w = 10 + 4 * Math.sin(ph);
    const gr = g.createLinearGradient(0, 0, 0, -h); gr.addColorStop(0, "rgba(255,225,150,.6)"); gr.addColorStop(.5, "rgba(255,120,30,.4)"); gr.addColorStop(1, "rgba(180,30,5,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(fx - w, 0); g.quadraticCurveTo(fx - w * .6 + Math.sin(ph * 2) * 6, -h * .6, fx + Math.sin(ph * 1.3) * 8, -h); g.quadraticCurveTo(fx + w * .6, -h * .5, fx + w, 0); g.fill();
  }
  for (let k = 0; k < 16; k++) { const life = (t * .7 + rnd(i * 13 + k)) % 1; g.fillStyle = `rgba(255,${150 + 80 * rnd(k)},60,${1 - life})`; g.fillRect((rnd(k + i) - .5) * 30 + Math.sin(t * 3 + k) * 20 * life, -10 - life * 200, 2.5, 2.5); }
  g.restore();
}
function carS(g, x, flip = 1, tilt = 0) {
  g.save(); g.translate(x, 0); g.scale(flip, 1); g.rotate(tilt); g.fillStyle = INK;
  g.beginPath(); g.moveTo(-120, -20); g.lineTo(-122, -52); g.lineTo(-80, -58); g.lineTo(-48, -94); g.lineTo(38, -94); g.lineTo(72, -60); g.lineTo(118, -54); g.lineTo(122, -20); g.closePath(); g.fill();
  g.fillStyle = "#10141b"; g.beginPath(); g.moveTo(-40, -86); g.lineTo(-6, -86); g.lineTo(-6, -62); g.lineTo(-64, -62); g.closePath(); g.fill(); g.beginPath(); g.moveTo(4, -86); g.lineTo(34, -86); g.lineTo(60, -62); g.lineTo(4, -62); g.closePath(); g.fill();
  g.fillStyle = INK; circ(g, -74, -20, 21); ell(g, 76, -12, 22, 13);
  g.strokeStyle = "rgba(140,160,190,.18)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-120, -52); g.lineTo(-80, -58); g.lineTo(-48, -94); g.lineTo(38, -94); g.stroke();
  g.restore();
}
function lampS(g, x, h = 250) { g.fillStyle = INK; g.fillRect(x - 4, -h, 8, h); g.fillRect(x - 4, -h, 44, 6); g.beginPath(); g.moveTo(x + 26, -h + 6); g.lineTo(x + 52, -h + 6); g.lineTo(x + 46, -h + 16); g.lineTo(x + 32, -h + 16); g.fill(); }
const lampOn = (t, x) => { const n = Math.floor(t * 12 + x); return rnd(n * .37) < .82 ? 1 : .1; };
function posts(g, x0, x1, h = 190, step = 170) {
  g.fillStyle = INK; for (let x = Math.floor(x0 / step) * step; x < x1; x += step) g.fillRect(x - 4, -h - 20, 8, h + 20);
  g.save(); g.globalAlpha = .6; g.fillStyle = g.createPattern(MESH, "repeat"); g.fillRect(x0, -h, x1 - x0, h); g.restore();
  g.strokeStyle = "rgba(20,22,26,.95)"; g.lineWidth = 2; for (let x = Math.floor(x0 / 22) * 22; x < x1; x += 22) { g.beginPath(); g.ellipse(x, -h - 14, 13, 11, 0, 0, TAU); g.stroke(); }
}
function sandbags(g, x, n = 6, rows = 3) { g.fillStyle = "#08090a"; for (let r = 0; r < rows; r++) for (let i = 0; i < n - r; i++) ell(g, x + i * 34 + r * 17, -13 - r * 22, 20, 13); }
function hangarS(g, x, w = 600, h = 260) { g.fillStyle = "#07090c"; g.beginPath(); g.moveTo(x - w / 2, 0); g.lineTo(x - w / 2, -h * .55); g.quadraticCurveTo(x, -h * 1.25, x + w / 2, -h * .55); g.lineTo(x + w / 2, 0); g.fill(); g.fillStyle = "rgba(255,170,80,.35)"; g.fillRect(x - 40, -60, 80, 60); }
function towerS(g, x, h = 420) {
  g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(x - 50, 0); g.lineTo(x - 22, -h); g.moveTo(x + 50, 0); g.lineTo(x + 22, -h); g.stroke();
  g.lineWidth = 3; for (let k = 0; k < 6; k++) { const y0 = -k * h / 6, y1 = -(k + 1) * h / 6, w0 = 50 - 28 * k / 6, w1 = 50 - 28 * (k + 1) / 6; g.beginPath(); g.moveTo(x - w0, y0); g.lineTo(x + w1, y1); g.moveTo(x + w0, y0); g.lineTo(x - w1, y1); g.stroke(); }
  g.fillStyle = INK; g.fillRect(x - 40, -h - 50, 80, 50); g.fillRect(x - 48, -h - 56, 96, 8);
  return [x, -h - 30];
}

/* =========================================================================
   İSKELET — yan görünüm siluet karakterler
   Açılar "aşağı" yönünden ölçülür, + = ileri (bakılan yön). Diz + = geriye büküm.
   ========================================================================= */
const KIND = {
  ethan: { l: 1, w: 1 }, sarah: { l: .95, w: .9 }, zombie: { l: 1, w: 1 }, runner: { l: 1.02, w: .78 },
  armored: { l: 1, w: 1.15 }, tank: { l: 1.05, w: 1.9 }, shaman: { l: 1, w: 1 }, denek: { l: 1.25, w: 1.4, arm: 1.6 },
};
function pose(o = {}) { return Object.assign({ lean: 0, hipY: 0, head: 0, sL: .1, eL: .15, sR: -.1, eR: .15, hL: .05, kL: .05, hR: -.05, kR: .05 }, o); }
const PS = {
  idle: t => pose({ lean: .03 + .01 * Math.sin(t * 1.6), sL: .08 + .02 * Math.sin(t * 1.6), sR: -.06, eR: .2 }),
  walk: (ph, a = 1) => { const s = Math.sin(ph); return pose({ lean: .07 * a, hipY: -Math.abs(Math.cos(ph)) * 3 * a, hL: .42 * s * a, kL: (.06 + .7 * Math.max(0, Math.cos(ph))) * a, hR: -.42 * s * a, kR: (.06 + .7 * Math.max(0, -Math.cos(ph))) * a, sL: -.32 * s * a, eL: .25, sR: .32 * s * a, eR: .25 }); },
  run: ph => { const s = Math.sin(ph); return pose({ lean: .32, hipY: -Math.abs(Math.cos(ph)) * 6, head: -.2, hL: .75 * s + .15, kL: .2 + 1.3 * Math.max(0, Math.cos(ph)), hR: -.75 * s + .15, kR: .2 + 1.3 * Math.max(0, -Math.cos(ph)), sL: -.9 * s, eL: 1.5, sR: .9 * s, eR: 1.5 }); },
  shamble: (ph, v = 0) => { const s = Math.sin(ph); return pose({ lean: .3 + .05 * Math.sin(ph * .5 + v), head: .35 + .1 * Math.sin(ph * .7 + v), hipY: -Math.abs(Math.cos(ph)) * 2, hL: .3 * s, kL: .1 + .45 * Math.max(0, Math.cos(ph)), hR: -.18 * s, kR: .12 + .2 * Math.max(0, -Math.cos(ph)), sL: 1.25 + .12 * Math.sin(ph + v), eL: .12, sR: .25 + .2 * Math.sin(ph + 1 + v), eR: .1 }); },
  lunge: k => pose({ lean: .5 * k, head: -.1, hL: .7 * k, kL: .3, hR: -.5 * k, kR: .6 * k, sL: 1.5, eL: .05, sR: 1.35, eR: .1 }),
  aim: (rec = 0) => pose({ lean: -.03 - rec * .09, head: -.04, sL: 1.42 - rec * .12, eL: .08, sR: 1.2 - rec * .12, eR: .42, hL: .22, kL: .1, hR: -.2, kR: .08 }),
  aimLow: k => pose({ lean: .02, head: .15 * k, sL: lerp(1.42, .5, k), eL: .1, sR: lerp(1.2, .45, k), eR: lerp(.42, .3, k), hL: .18, kL: .08, hR: -.15, kR: .06 }),
  swing: k => { const e = eIO(clamp(k)); return pose({ lean: lerp(-.05, .32, e), sR: lerp(-2.7, 1.3, e), eR: lerp(-.6, .1, e), sL: lerp(.9, -.6, e), eL: .6, hL: .35, kL: .15, hR: -.3, kR: .25 }); },
  shield: t => pose({ lean: -.08, head: -.12, sR: 2.5, eR: 1.9, sL: .5, eL: .5, hL: .12, kL: .05, hR: -.18, kR: .1 }),
  crouch: (k, aim = 0) => pose({ lean: .45 * k, hipY: 38 * k, head: -.25 * k, hL: 1.3 * k, kL: 2.3 * k, hR: .5 * k, kR: 2.1 * k, sL: aim ? 1.4 : .6 * k, eL: aim ? .1 : 1.2 * k, sR: aim ? 1.2 : .3, eR: aim ? .4 : 1 }),
  sit: () => pose({ lean: -.15, hipY: 40, head: .05, hL: 1.55, kL: 1.55, hR: 1.45, kR: 1.5, sL: .5, eL: .9, sR: .4, eR: 1 }),
  roar: k => pose({ lean: -.25 * k, head: -.6 * k, sL: lerp(.2, 2.3, k), eL: .4, sR: lerp(.1, 2.6, k), eR: .3, hL: .3, kL: .1, hR: -.3, kR: .1 }),
  staff: k => pose({ lean: -.1 * k, head: -.35 * k, sR: lerp(.9, 2.9, k), eR: .1, sL: lerp(.3, 2.2, k), eL: .3, hL: .15, kL: .05, hR: -.15, kR: .05 }),
  rocket: rec => pose({ lean: .12 - rec * .1, hipY: 30, head: .05, hL: 1.2, kL: 2.1, hR: .15, kR: 1.6, sL: 1.3, eL: .5, sR: .9, eR: 1.3 }),
};
function limb(o, a1, l1, a2, l2) { const m = [o[0] + Math.sin(a1) * l1, o[1] + Math.cos(a1) * l1]; return [o, m, [m[0] + Math.sin(a2) * l2, m[1] + Math.cos(a2) * l2]]; }
function seg2(g, j, w1, w2) { g.lineWidth = w1; g.beginPath(); g.moveTo(j[0][0], j[0][1]); g.lineTo(j[1][0], j[1][1]); g.stroke(); g.lineWidth = w2; g.beginPath(); g.moveTo(j[1][0], j[1][1]); g.lineTo(j[2][0], j[2][1]); g.stroke(); }
// fig: x,y dünya koordinatında ayak hizası. dir: 1 sağa, -1 sola bakar.
// o.rims: [{c, dx, dy}] kenar ışıkları; o.weapon; o.eyes; o.rot (ayaklar etrafında dönme); o.t (saç, atkı hareketi)
function fig(g, x, y, s, dir, kind, P0, o = {}) {
  const K = KIND[kind] || KIND.zombie, th = 44 * K.l, sh = 44 * K.l, T = 60 * K.l, ua = 33 * K.l * (K.arm || 1), fa = 31 * K.l * (K.arm || 1), hr = kind === "tank" ? 11 : 13.5;
  const Wt = 34 * K.w, wT = 18 * K.w, wS = 14 * K.w, wU = 12.5 * K.w, wF = 10.5 * K.w, Pz = P0, t = o.t || 0;
  const hip = [0, -(th + sh) * .97 + Pz.hipY], lean = Pz.lean;
  const neck = [hip[0] + Math.sin(lean) * T, hip[1] - Math.cos(lean) * T], shd = [neck[0] - Math.sin(lean) * 5, neck[1] + Math.cos(lean) * 7];
  const ha = lean + Pz.head, head = [neck[0] + Math.sin(ha) * (hr + 5), neck[1] - Math.cos(ha) * (hr + 5)];
  const la = lean * .5, legN = limb(hip, Pz.hR, th, Pz.hR - Pz.kR, sh), legF = limb(hip, Pz.hL, th, Pz.hL - Pz.kL, sh);
  const armN = limb(shd, Pz.sR + la, ua, Pz.sR + la + Pz.eR, fa), armF = limb(shd, Pz.sL + la, ua, Pz.sL + la + Pz.eL, fa);
  const fwd = Pz.sR + la + Pz.eR, hand = armN[2], handF = armF[2];
  const draw = (col, far, rim) => {
    g.strokeStyle = far; g.fillStyle = far; g.lineCap = "round"; g.lineJoin = "round";
    seg2(g, legF, wT, wS); seg2(g, armF, wU, wF);
    if (kind === "shaman") { g.fillStyle = col; g.beginPath(); g.moveTo(shd[0] - 14, shd[1]); g.lineTo(hip[0] - 34, hip[1] + 70); g.lineTo(hip[0] + 30, hip[1] + 62); g.lineTo(shd[0] + 12, shd[1]); g.fill(); }
    g.strokeStyle = col; g.fillStyle = col;
    g.lineWidth = Wt; g.beginPath(); g.moveTo(hip[0], hip[1] - 6); g.lineTo(neck[0], neck[1] + 8); g.stroke();
    if (kind === "tank") { circ(g, neck[0] - Math.sin(lean) * 10 - 14, neck[1] + 10, 26); }
    if (kind === "ethan") { g.beginPath(); g.moveTo(hip[0] - Wt * .6, hip[1] + 2); g.lineTo(hip[0] + Wt * .55, hip[1] + 2); g.lineTo(hip[0] + Wt * .45, hip[1] + 16); g.lineTo(hip[0] - Wt * .7, hip[1] + 18 + Math.sin(t * 5) * 2); g.fill(); }
    if (kind === "denek") for (let k = 0; k < 5; k++) { const q = k / 5, bx = lerp(hip[0], neck[0], q) - Math.cos(lean) * Wt * .45, by = lerp(hip[1], neck[1], q) - Math.sin(lean) * Wt * .45; g.beginPath(); g.moveTo(bx, by - 8); g.lineTo(bx - 26 - k * 3, by - 14); g.lineTo(bx, by + 8); g.fill(); }
    seg2(g, legN, wT, wS);
    circ(g, head[0], head[1], hr);
    if (kind === "ethan" && !o.noBandana) { g.lineWidth = 3.2; g.beginPath(); const bx = head[0] - Math.cos(ha) * hr * .9, by = head[1] - Math.sin(ha) * hr * .9 - 2; g.moveTo(bx, by); g.quadraticCurveTo(bx - 10, by + 2 + Math.sin(t * 9) * 3, bx - 20, by + 6 + Math.sin(t * 7) * 5); g.moveTo(bx, by + 2); g.quadraticCurveTo(bx - 8, by + 8, bx - 15, by + 14 + Math.sin(t * 8 + 1) * 4); g.stroke(); }
    if (kind === "sarah") { const bx = head[0] - Math.cos(ha) * hr * .7, by = head[1] - hr * .5, sw = Math.sin(t * 6) * 6 + (o.whip || 0); g.lineWidth = 7; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx - 14, by - 2 + sw * .3, bx - 22 - Math.abs(sw) * .4, by + 16 + sw); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(bx - 18, by + 10 + sw * .8); g.lineTo(bx - 25, by + 24 + sw); g.stroke(); }
    if (kind === "shaman") { g.lineWidth = 3; g.beginPath(); for (const sg of [-1, 1]) { g.moveTo(head[0] - 2, head[1] - hr + 2); g.lineTo(head[0] - 8 + sg * 6, head[1] - hr - 22); g.lineTo(head[0] - 16 + sg * 10, head[1] - hr - 30); g.moveTo(head[0] - 6 + sg * 4, head[1] - hr - 14); g.lineTo(head[0] + 4 + sg * 8, head[1] - hr - 22); } g.stroke(); }
    if (kind === "zombie" || kind === "runner") { g.beginPath(); g.moveTo(hip[0] - 10, hip[1] - 4); g.lineTo(hip[0] - 16, hip[1] + 18 + Math.sin(t * 4) * 3); g.lineTo(hip[0] - 4, hip[1] + 4); g.fill(); }
    // silah
    const wpn = o.weapon, dx = Math.sin(fwd), dy = Math.cos(fwd);
    if (wpn === "machete" || wpn === "katana") {
      const len = wpn === "katana" ? 78 : 54; g.lineCap = "butt";
      g.lineWidth = 4; g.strokeStyle = col; g.beginPath(); g.moveTo(hand[0] - dx * 8, hand[1] - dy * 8); g.lineTo(hand[0] + dx * 6, hand[1] + dy * 6); g.stroke();
      g.strokeStyle = rim ? col : (o.bladeCol || "#3a3e44"); g.lineWidth = 4.5; g.beginPath(); g.moveTo(hand[0] + dx * 6, hand[1] + dy * 6); g.lineTo(hand[0] + dx * len, hand[1] + dy * len); g.stroke();
      if (!rim && wpn === "machete") { g.strokeStyle = "#3a0a0c"; g.beginPath(); g.moveTo(hand[0] + dx * len * .7, hand[1] + dy * len * .7); g.lineTo(hand[0] + dx * len, hand[1] + dy * len); g.stroke(); }
      g.lineCap = "round"; g.strokeStyle = col;
    } else if (wpn) {
      const len = { pistol: 22, shotgun: 62, smg: 44, rocket: 90 }[wpn], back = { pistol: 4, shotgun: 22, smg: 14, rocket: 40 }[wpn], wd = { pistol: 5, shotgun: 6, smg: 7, rocket: 13 }[wpn];
      g.lineCap = "butt"; g.lineWidth = wd; g.beginPath(); g.moveTo(hand[0] - dx * back, hand[1] - dy * back); g.lineTo(hand[0] + dx * len, hand[1] + dy * len); g.stroke();
      if (wpn === "smg") { g.lineWidth = 5; g.beginPath(); g.moveTo(hand[0] + dx * 8, hand[1] + dy * 8); g.lineTo(hand[0] + dx * 8 + dy * 12, hand[1] + dy * 8 - dx * 12 * -1); g.stroke(); }
      g.lineCap = "round";
    }
    if (kind === "shaman") { g.lineWidth = 3.5; g.beginPath(); g.moveTo(hand[0] - dx * 40, hand[1] - dy * 40); g.lineTo(hand[0] + dx * 60, hand[1] + dy * 60); g.stroke(); }
    seg2(g, armN, wU, wF);
    if (kind === "armored" && !rim) { g.fillStyle = "#15181c"; g.save(); g.translate((hip[0] + neck[0]) / 2, (hip[1] + neck[1]) / 2); g.rotate(lean); g.fillRect(-Wt * .2, -T * .4, Wt * .7, T * .7); g.strokeStyle = "#3a4048"; g.lineWidth = 1.5; g.strokeRect(-Wt * .2, -T * .4, Wt * .7, T * .7); g.restore(); g.fillStyle = "#15181c"; circ(g, shd[0], shd[1], 12); g.stroke(); }
    if (kind === "sarah" && !rim) { g.fillStyle = "#8a6414"; g.beginPath(); g.ellipse(neck[0], neck[1] + 3, 10, 7, lean, 0, TAU); g.fill(); g.beginPath(); g.moveTo(neck[0] - 6, neck[1] + 4); g.lineTo(neck[0] - 20, neck[1] + 20 + Math.sin(t * 7) * 5); g.lineTo(neck[0] - 12, neck[1] + 22); g.closePath(); g.fill(); }
  };
  const rot = o.rot || 0;
  for (const r of o.rims || []) { g.save(); g.translate(x + r.dx, y + (r.dy || 0)); g.scale(s * dir, s); g.rotate(rot); g.globalAlpha = (o.alpha ?? 1) * (r.a ?? 1); draw(r.c, r.c, true); g.restore(); }
  g.save(); g.translate(x, y); g.scale(s * dir, s); g.rotate(rot); g.globalAlpha = o.alpha ?? 1; draw(o.col || INK, o.far || "#0c0d10", false); g.restore();
  if (o.eyes) { const [ex, ey] = [x + (head[0] + Math.cos(ha) * 0 + hr * .55) * s * dir, y + (head[1] - 2) * s]; g.save(); g.globalCompositeOperation = "lighter"; const e = o.eyes; const gr = g.createRadialGradient(ex, ey, 0, ex, ey, 16 * s * e); gr.addColorStop(0, `rgba(255,80,50,${e})`); gr.addColorStop(1, "rgba(255,0,0,0)"); g.fillStyle = gr; circ(g, ex, ey, 16 * s * e); g.fillStyle = `rgba(255,210,190,${e})`; circ(g, ex, ey, 1.8 * s); g.restore(); }
  // dünya koordinatında önemli noktalar (namlu ucu, kafa)
  const W2 = (pt) => [x + pt[0] * s * dir, y + pt[1] * s];
  const lenM = { pistol: 22, shotgun: 62, smg: 44, rocket: 90, machete: 54, katana: 78 }[o.weapon] || 0;
  return { head: W2(head), hand: W2(hand), muzzle: W2([hand[0] + Math.sin(fwd) * lenM, hand[1] + Math.cos(fwd) * lenM]), neck: W2(neck), hip: W2(hip), aim: fwd };
}
// Kenar ışığı kısayolları
const RIM = { fire: (dx = 3) => ({ c: "rgba(255,140,60,.95)", dx }), moon: (dx = -2.5) => ({ c: "rgba(140,170,220,.8)", dx }), white: (dx = 3) => ({ c: "rgba(235,240,255,.95)", dx }), purple: (dx = 3) => ({ c: "rgba(190,110,255,.95)", dx }), red: (dx = 3) => ({ c: "rgba(255,60,40,.9)", dx }) };

/* ---------- efektler (dünya koordinatı) ---------- */
function fireball(g, x, y, k, seed, size = 1) {
  if (k < 0 || k > 2.2) return;
  g.save(); g.globalCompositeOperation = "lighter";
  if (k < 1) {
    const a = 1 - k;
    for (let i = 0; i < 9; i++) { const an = rnd(seed + i) * TAU, d = eOut(k) * 70 * size * rnd(seed * 3 + i), cx = x + Math.cos(an) * d, cy = y + Math.sin(an) * d * .6 - eOut(k) * 90 * size, r = (60 + 120 * eOut(k)) * size * (.6 + .5 * rnd(i)); const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(255,245,210,${a})`); gr.addColorStop(.35, `rgba(255,170,60,${a * .8})`); gr.addColorStop(1, "rgba(160,30,5,0)"); g.fillStyle = gr; circ(g, cx, cy, r); }
    for (let i = 0; i < 30; i++) { const an = -Math.PI * rnd(seed * 2 + i), d = eOut(k) * (200 + 300 * rnd(i + seed)) * size; g.fillStyle = `rgba(255,${140 + 100 * rnd(i)},60,${a})`; g.fillRect(x + Math.cos(an) * d, y + Math.sin(an) * d + k * k * 160 * size, 3, 3); }
  }
  g.globalCompositeOperation = "source-over";
  const sm = clamp((k - .2) / 2);
  if (sm > 0 && sm < 1) for (let i = 0; i < 6; i++) { const cx = x + (rnd(seed + i * 4) - .5) * 160 * size, cy = y - 60 * size - sm * 260 * size - i * 20, r = (80 + 120 * sm) * size, gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(14,12,12,${.55 * (1 - sm)})`); gr.addColorStop(1, "rgba(14,12,12,0)"); g.fillStyle = gr; circ(g, cx, cy, r); }
  g.restore();
}
function sparks(g, x, y, k, seed, n = 14, spread = 1, col = "255,210,120") {
  if (k < 0 || k > 1) return; g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
  for (let i = 0; i < n; i++) { const an = (rnd(seed + i) - .5) * 2.6 * spread + Math.PI * (rnd(seed * 2 + i) < .5 ? 1 : 0), v = 120 + 260 * rnd(seed * 3 + i), px = x + Math.cos(an) * v * k, py = y + Math.sin(an) * v * k + 300 * k * k; g.strokeStyle = `rgba(${col},${1 - k})`; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.lineTo(px - Math.cos(an) * 14, py - Math.sin(an) * 14); g.stroke(); }
  g.restore();
}
function bloodSpray(g, x, y, k, seed, dir = 1, n = 26, size = 1) {
  if (k < 0 || k > 1.4) return; g.save();
  for (let i = 0; i < n; i++) { const an = -.6 + (rnd(seed + i) - .5) * 1.4, v = (150 + 300 * rnd(seed * 3 + i)) * size, px = x + dir * Math.cos(an) * v * k, py = y + Math.sin(an) * v * k + 420 * k * k * size; g.fillStyle = `rgba(${90 + 40 * rnd(i)},6,8,${clamp(1.2 - k)})`; circ(g, px, py, (2 + 4 * rnd(i * 7)) * size); }
  g.restore();
}
function tracerS(x1, y1, x2, y2, k, w = 2.5) { scr(); if (k <= 0) return; ctx.globalCompositeOperation = "lighter"; const gr = ctx.createLinearGradient(x1, y1, x2, y2); gr.addColorStop(0, "rgba(255,220,150,0)"); gr.addColorStop(1, `rgba(255,236,190,${k})`); ctx.strokeStyle = gr; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.globalCompositeOperation = "source-over"; }
function muzzleS(x, y, a, k, size = 1) { if (k <= 0) return; flare(x, y, k * .7 * size, "255,200,140"); scr(); ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalCompositeOperation = "lighter"; const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 80 * k * size); gr.addColorStop(0, `rgba(255,240,200,${k})`); gr.addColorStop(1, "rgba(255,130,40,0)"); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(80 * k * size, -16 * k * size); ctx.lineTo(110 * k * size, 0); ctx.lineTo(80 * k * size, 16 * k * size); ctx.closePath(); ctx.fill(); ctx.restore(); }
function bolt(seed, x, y0, y1, a) {
  if (a <= 0) return; scr(); ctx.globalCompositeOperation = "lighter"; const R = mulberry(seed);
  const path = [[x, y0]]; let cx = x; for (let y = y0; y < y1; y += 30 + R() * 30) { cx += (R() - .5) * 70; path.push([cx, y]); }
  for (const [w, al] of [[14, .15], [5, .5], [2, 1]]) { ctx.strokeStyle = `rgba(220,230,255,${al * a})`; ctx.lineWidth = w; ctx.beginPath(); path.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke(); }
  ctx.globalCompositeOperation = "source-over";
}
// Sinematik renk: gölgeler soğuk, parlaklar sıcak
function gradeS(cool = .3, warm = 0) { scr(); ctx.globalCompositeOperation = "soft-light"; ctx.fillStyle = `rgba(20,45,80,${cool})`; ctx.fillRect(0, 0, W, H); if (warm) { ctx.globalCompositeOperation = "lighter"; const gr = ctx.createRadialGradient(W / 2, H * 1.1, 0, W / 2, H * 1.1, H); gr.addColorStop(0, `rgba(200,80,20,${warm})`); gr.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); } ctx.globalCompositeOperation = "source-over"; }
// Hazır sokak dekoru. Işık listesini döndürür (lights() ile çizilir).
function street(t, o = {}) {
  sky(t, o.sky || {});
  tile(SKY_FAR, .22, o.farY ?? 150); tile(o.blur ? SKY_MID_B : SKY_MID, .5, o.midY ?? 70);
  const [, hy] = P(.6, 0, 20); haze(hy, 160, .3);
  ground(1, o.ground || {});
  L(1); const ls = [];
  for (const [x, f, tl] of o.cars || []) carS(ctx, x, f, tl || 0);
  for (const x of o.lamps || []) { lampS(ctx, x); const on = lampOn(t, x); ls.push({ x: x + 40, y: -236, r: 300, c: "170,195,230", a: .35 * on, rl: 330 }); }
  (o.barrels || []).forEach((x, i) => { barrelS(ctx, x); ls.push({ x, y: -80, r: 460, c: "255,130,40", a: .55 * flick(t, i), rl: 380, rw: 34 }); });
  return ls;
}
function streetTop(t, o, ls) { L(1); (o.barrels || []).forEach((x, i) => fireS(ctx, x, t, i)); lights(ls); }
