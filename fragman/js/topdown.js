"use strict";
/* Tepeden bakış (oyun içi görünüm) — sprite'lar burada kullanılır. */
/* ---------- karakterler (tepeden, yerel +x = ön) ---------- */
const PAL = {
  ethan: { jacket: "#5b3b22", dark: "#352214", head: "#8b8d8f", knot: "#6c6e70", boots: "#3b2a1a", glove: "#121212" },
  sarah: { jacket: "#6a1b26", dark: "#3e0f17", head: "#5a3a1f", pony: "#4a2f18", boots: "#2a1f18", glove: "#1c1c1c", scarf: "#d6a31f" },
};
const SHIRTS = ["#3d4538", "#4a3d33", "#3a3f4a", "#4d4a3a", "#3b3533"];
function drawChar(g, x, y, a, kind, o = {}) {
  const s = (o.scale || 1) * (kind === "tank" ? 2.3 : kind === "shaman" ? 1.2 : 1) * 1.45;
  g.save(); g.translate(x, y); g.globalAlpha *= o.alpha ?? 1; if (o.dead) g.globalAlpha *= .6;
  g.fillStyle = "rgba(0,0,0,.45)"; ell(g, 5 * s, 7 * s, 16 * s, 21 * s, a);
  g.rotate(a);
  const img = kind === "shaman" ? null : IMG[kind];
  if (img) {
    g.rotate(-CONFIG.spriteFacing); g.imageSmoothingEnabled = !CONFIG.pixelArt;
    const sz = CONFIG.spriteSize * s, h = sz * img.height / img.width; g.drawImage(img, -sz / 2, -h / 2, sz, h); g.restore(); return;
  }
  if (kind !== "shaman") STAND.add("sprite");
  g.scale(s, s);
  const step = Math.sin(o.walk || 0) * 6;
  if (kind === "ethan" || kind === "sarah") {
    const P = PAL[kind]; g.fillStyle = P.boots; ell(g, step, -7, 5.5, 3.6); ell(g, -step, 7, 5.5, 3.6);
    const w = o.weapon || "machete", r = o.recoil || 0;
    g.lineCap = "round";
    if (w === "machete") {
      g.strokeStyle = P.jacket; g.lineWidth = 5; g.beginPath(); g.moveTo(0, -11); g.lineTo(9, -9); g.stroke(); g.fillStyle = P.glove; circ(g, 9, -9, 3);
      g.save(); g.translate(0, 10); g.rotate(o.swing ?? .45);
      g.strokeStyle = P.jacket; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(14, 0); g.stroke();
      g.fillStyle = "#2a1a10"; g.fillRect(12, -1.8, 7, 3.6);
      g.fillStyle = "#a3a8ab"; g.beginPath(); g.moveTo(18, -2.2); g.lineTo(40, -3.5); g.quadraticCurveTo(44, 0, 40, 2.5); g.lineTo(18, 2.2); g.closePath(); g.fill();
      g.fillStyle = "#7a0d0d"; g.beginPath(); g.moveTo(30, -3); g.lineTo(40, -3.5); g.quadraticCurveTo(44, 0, 40, 2.5); g.lineTo(31, 2.4); g.closePath(); g.fill();
      g.fillStyle = P.glove; circ(g, 14, 0, 3.2); g.restore();
    } else {
      const L = { pistol: 15, shotgun: 32, smg: 24 }[w] || 20, gx = 9 - r * 4;
      if (w === "shotgun") { g.fillStyle = "#4e331c"; g.fillRect(gx - 4, -2.4, 12, 4.8); }
      g.fillStyle = "#232323"; g.fillRect(gx + (w === "shotgun" ? 8 : 0), -1.9, L - (w === "shotgun" ? 8 : 0), 3.8);
      if (w === "smg") { g.fillStyle = "#151515"; g.fillRect(gx + 8, 1.5, 4, 7); }
      g.strokeStyle = P.jacket; g.lineWidth = 5; g.beginPath(); g.moveTo(0, -11); g.lineTo(gx + 3, -2.5); g.moveTo(0, 11); g.lineTo(gx + 9, 2.5); g.stroke();
      g.fillStyle = P.glove; circ(g, gx + 3, -2.5, 3); circ(g, gx + 9, 2.5, 3);
    }
    g.fillStyle = P.jacket; ell(g, 0, 0, 11, 18); g.strokeStyle = P.dark; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, 0, 11, 18, 0, 0, TAU); g.stroke();
    if (kind === "sarah") { g.fillStyle = P.scarf; ell(g, 1, 0, 6.5, 10.5); g.fillStyle = P.pony; ell(g, -11, 0, 6.5, 3.2); }
    g.fillStyle = P.head; circ(g, 1, 0, 7.5);
    if (kind === "ethan") { g.fillStyle = P.knot; g.beginPath(); g.moveTo(-6, -1.5); g.lineTo(-13, -4); g.lineTo(-12, 1); g.closePath(); g.fill(); }
  } else if (kind === "shaman") {
    g.fillStyle = "#1d1827"; ell(g, 0, 0, 15, 20);
    g.strokeStyle = "#4a3322"; g.lineWidth = 3; g.beginPath(); g.moveTo(4, 14); g.lineTo(34, 17); g.stroke();
    g.strokeStyle = "#6e7a52"; g.lineWidth = 4; g.lineCap = "round"; g.beginPath(); g.moveTo(0, -14); g.lineTo(16, -10 + Math.sin(o.walk || 0) * 3); g.stroke();
    g.fillStyle = "#d8cfbd"; circ(g, 2, 0, 7.5);
    g.strokeStyle = "#cfc4ad"; g.lineWidth = 2; g.beginPath(); g.moveTo(-2, -5); g.lineTo(-10, -14); g.lineTo(-8, -18); g.moveTo(-2, 5); g.lineTo(-10, 14); g.lineTo(-8, 18); g.stroke();
  } else {
    const seed = o.seed || 0, wob = Math.sin((o.walk || 0) * .7 + seed) * 3;
    const skin = kind === "runner" ? "#9aa090" : kind === "tank" ? "#6a6d5a" : "#7c8a6a";
    const bw = kind === "runner" ? 9 : kind === "tank" ? 14 : 11, bh = kind === "runner" ? 15 : kind === "tank" ? 20 : 17;
    g.fillStyle = "#1f1b17"; ell(g, step, -6, 5, 3.4); ell(g, -step, 6, 5, 3.4);
    g.strokeStyle = skin; g.lineWidth = kind === "tank" ? 7 : 4.5; g.lineCap = "round"; const reach = kind === "tank" ? 14 : 22;
    g.beginPath(); g.moveTo(0, -bh + 5); g.lineTo(reach + wob, -7); g.moveTo(0, bh - 5); g.lineTo(reach - wob, 7); g.stroke();
    g.fillStyle = skin; circ(g, reach + wob, -7, kind === "tank" ? 4.5 : 3); circ(g, reach - wob, 7, kind === "tank" ? 4.5 : 3);
    g.fillStyle = kind === "tank" ? "#3a3530" : SHIRTS[seed % SHIRTS.length]; ell(g, 0, 0, bw, bh);
    if (kind === "armored") { g.fillStyle = "#565b61"; g.fillRect(-8, -13, 14, 26); g.strokeStyle = "#8a9096"; g.lineWidth = 1.5; g.strokeRect(-8, -13, 14, 26); }
    g.fillStyle = kind === "armored" ? "#4b5056" : skin; circ(g, 2, 0, kind === "tank" ? 6.5 : 7);
    if (o.eyes) { g.fillStyle = "rgba(255,70,50,.9)"; circ(g, 7, -2.3, 1.1); circ(g, 7, 2.3, 1.1); }
  }
  g.restore();
}
function blood(g, x, y, seed, size = 1, alpha = 1, dir = null) {
  g.save(); g.globalAlpha *= alpha;
  for (let i = 0; i < 9; i++) {
    const a = dir === null ? rnd(seed + i) * TAU : dir + (rnd(seed + i) - .5) * 1.1, d = rnd(seed * 3 + i) * 34 * size * (dir === null ? 1 : 1.8);
    g.fillStyle = i % 3 ? "#4d0508" : "#6d0b0e"; circ(g, x + Math.cos(a) * d, y + Math.sin(a) * d, (3 + rnd(seed * 7 + i) * 9) * size);
  }
  g.restore();
}
function muzzle(g, x, y, a, k) {
  if (k <= 0) return;
  g.save(); g.translate(x, y); g.rotate(a); g.globalCompositeOperation = "lighter";
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, 70 * k); gr.addColorStop(0, `rgba(255,240,200,${k})`); gr.addColorStop(.4, `rgba(255,170,60,${.7 * k})`); gr.addColorStop(1, "rgba(255,120,30,0)");
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.lineTo(70 * k, -18 * k); g.lineTo(95 * k, 0); g.lineTo(70 * k, 18 * k); g.closePath(); g.fill(); circ(g, 0, 0, 22 * k); g.restore();
}
function tracer(g, x1, y1, x2, y2, k, w = 3) {
  if (k <= 0) return;
  g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
  const gr = g.createLinearGradient(x1, y1, x2, y2); gr.addColorStop(0, `rgba(255,220,140,${.05 * k})`); gr.addColorStop(1, `rgba(255,236,190,${.95 * k})`);
  g.strokeStyle = gr; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore();
}
function barrel(g, x, y, charred = false) {
  g.fillStyle = "rgba(0,0,0,.5)"; circ(g, x + 6, y + 7, 21); g.fillStyle = charred ? "#1a1411" : "#4a2a17"; circ(g, x, y, 20);
  g.strokeStyle = charred ? "#0b0908" : "#7a4a25"; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 20, 0, TAU); g.stroke(); g.beginPath(); g.arc(x, y, 13, 0, TAU); g.stroke();
}
function flames(g, x, y, t, i, s = 1) {
  g.save(); g.globalCompositeOperation = "lighter";
  for (let k = 0; k < 7; k++) {
    const ph = t * (5 + k) + i * 7 + k, rr = (10 + 8 * Math.sin(ph)) * s, ox = Math.sin(ph * 1.3) * 7 * s + k * .8, oy = Math.cos(ph * .9) * 7 * s - k * 1.5 * s;
    const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rr * 1.8); gr.addColorStop(0, "rgba(255,230,160,.55)"); gr.addColorStop(.5, "rgba(255,120,30,.35)"); gr.addColorStop(1, "rgba(200,40,10,0)");
    g.fillStyle = gr; circ(g, x + ox, y + oy, rr * 1.8);
  }
  for (let k = 0; k < 10; k++) { const life = (t * .8 + rnd(i * 31 + k)) % 1, a = rnd(i * 17 + k) * TAU; g.fillStyle = `rgba(255,${150 + 80 * rnd(k)},60,${(1 - life) * .9})`; g.fillRect(x + Math.cos(a) * life * 70 * s - 30 * life * s, y + Math.sin(a) * life * 70 * s - 60 * life * s, 2.4, 2.4); }
  g.restore();
}
function explosion(g, x, y, k, seed) {
  if (k < 0) return;
  g.save(); g.globalCompositeOperation = "lighter";
  if (k < 1) {
    const r = 40 + 230 * eOut(k), a = 1 - k, gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,250,220,${a})`); gr.addColorStop(.3, `rgba(255,190,80,${a * .9})`); gr.addColorStop(.7, `rgba(230,80,20,${a * .6})`); gr.addColorStop(1, "rgba(120,20,5,0)");
    g.fillStyle = gr; circ(g, x, y, r);
    g.strokeStyle = `rgba(255,220,170,${.5 * a})`; g.lineWidth = 10 * a + 1; g.beginPath(); g.arc(x, y, 60 + 520 * eOut(k), 0, TAU); g.stroke();
    for (let i = 0; i < 26; i++) { const an = rnd(seed + i) * TAU, d = eOut(k) * (160 + 260 * rnd(seed * 2 + i)); g.fillStyle = `rgba(255,${120 + 100 * rnd(i)},40,${a})`; circ(g, x + Math.cos(an) * d, y + Math.sin(an) * d, 3 + 4 * a); }
  }
  g.globalCompositeOperation = "source-over";
  const sm = clamp((k - .15) / 2.2);
  if (sm > 0 && sm < 1) for (let i = 0; i < 7; i++) {
    const an = rnd(seed * 5 + i) * TAU, d = 30 + 150 * eOut(sm) * rnd(seed + i * 3), sx = x + Math.cos(an) * d, sy = y + Math.sin(an) * d, sr = 60 + 110 * sm, sg = g.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sg.addColorStop(0, `rgba(20,17,15,${.4 * (1 - sm)})`); sg.addColorStop(1, "rgba(20,17,15,0)"); g.fillStyle = sg; circ(g, sx, sy, sr);
  }
  g.restore();
}

// 0:29.5–0:38 · karanlıkta ilerleyen zombi siluetleri, uzakta siren
const HORDE = Array.from({ length: 22 }, (_, i) => ({ x: (rnd(i * 3.3) - .5) * 1500, y: -300 - rnd(i * 5.1) * 900, v: 40 + 50 * rnd(i * 7.7), kind: ["zombie", "zombie", "runner", "armored", "zombie", "tank"][i % 6], seed: i }));
function sHorde(t) {
  const lt = t - 29.5;
  setCam(0, lerp(-120, -260, p(t, 29.5, 38)), lerp(1.05, 1.18, p(t, 29.5, 38)), .06);
  screenFill("#000"); applyCam(ctx); drawMap(CITY, 1000, 1000);
  barrel(ctx, 60, 330);
  for (const z of HORDE) { if (z.kind === "tank" && z.seed > 12) continue; drawChar(ctx, z.x, z.y + lt * z.v, Math.PI / 2 + Math.sin(lt + z.seed) * .15, z.kind, { walk: lt * (z.kind === "runner" ? 10 : 5) + z.seed, seed: z.seed }); }
  lightPass("rgba(1,2,6,0.92)", [{ x: 60, y: 330, r: 900, i: .95 * flick(t, 3), c: "255,120,40", ca: .28 }]);
  applyCam(ctx); flames(ctx, 60, 326, t, 3);
  // uzak siren ışığı
  const sir = (Math.sin(t * 5.5) > 0 ? 1 : .15) * win(t, 30.5, 37.5, 1);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "lighter";
  const gr = ctx.createRadialGradient(W * .92, BAR, 0, W * .92, BAR, 700); gr.addColorStop(0, `rgba(200,40,40,${.18 * sir})`); gr.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
  fog(t, 1.5); rain(t, .8);
}

function shotCam(seg, u, zoom, extra = [0, 0]) {
  const sd = seg.seed;
  setCam(extra[0] + u * 30 * (rnd(sd) - .5), extra[1] + u * 20, zoom * (1 + u * .05), (rnd(sd * 3) - .5) * .7, impulse(u, [0.02, ...(seg.hits || [])], 14, .3));
  screenFill("#000"); applyCam(ctx); drawMap(CITY, (rnd(sd * 5) - .5) * 1200, (rnd(sd * 7) - .5) * 1200);
}
const SHOTS = {
  slash(seg, u) {
    const hit = .08; shotCam(seg, u, 2.1);
    const zx = u < hit ? lerp(160, 70, u / hit) : lerp(70, 200, eOut(p(u, hit, hit + .4)));
    if (u > hit) blood(ctx, 140, 12, seg.seed, 1.2, p(u, hit, hit + .15), 0);
    drawChar(ctx, zx, 12, Math.PI + (u > hit ? eOut(p(u, hit, hit + .4)) * 1.3 : 0), "zombie", { seed: seg.seed, dead: u > hit + .25 });
    const sw = u < hit ? lerp(1.5, -1.1, eOut(u / hit)) : -1.1;
    drawChar(ctx, -60, 20, 0, "ethan", { swing: sw });
    lightPass("rgba(3,6,12,0.74)", [{ x: -260, y: -200, r: 520, i: .9 * flick(u, 2), c: "255,130,40" }, { x: -40, y: 20, r: 300, i: .45 }]);
    applyCam(ctx); const ak = p(u, 0, .25);
    if (ak < 1) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"; for (let i = 0; i < 6; i++) { ctx.strokeStyle = `rgba(255,${230 - i * 30},${220 - i * 35},${(1 - ak) * (.9 - i * .12)})`; ctx.lineWidth = 16 - i * 2.2; ctx.beginPath(); ctx.arc(-60, 34, 72 + i * 4, -1.35, 1.1); ctx.stroke(); } ctx.restore(); }
    for (let i = 0; i < 24; i++) { const k = p(u, hit, hit + .5), a = (rnd(i) - .5) * 1.4, d = eOut(k) * (70 + 160 * rnd(i + 9)); if (u > hit) { ctx.fillStyle = `rgba(130,8,10,${1 - k})`; circ(ctx, 70 + Math.cos(a) * d, 12 + Math.sin(a) * d, 2 + 4 * rnd(i + 3)); } }
    rain(seg.a + u, .9);
  },
  shotgun(seg, u) {
    shotCam(seg, u, 1.7, [60, 0]);
    [[190, -70, 11], [250, 70, 12], [340, -10, 13]].forEach(([x, y, s]) => { const k = eOut(p(u, .04, .4)); if (u > .04) blood(ctx, x + 60, y, s + seg.seed, 1.1, p(u, .04, .15), 0); drawChar(ctx, x + k * 110, y, Math.PI + k * 1.2 * (s % 2 ? 1 : -1), s === 13 ? "armored" : "zombie", { seed: s, dead: u > .2 }); });
    const rec = 1 - p(u, .03, .2), fk = 1 - p(u, .03, .14);
    drawChar(ctx, -200, 0, 0, "ethan", { weapon: "shotgun", recoil: u > .03 ? rec : 0 });
    lightPass("rgba(3,6,12,0.74)", [{ x: -120, y: 0, r: 760, i: u > .03 ? fk : 0, c: "255,190,90", ca: .45 }, { x: -200, y: 0, r: 700, i: .5, cone: .35, a: 0 }]);
    applyCam(ctx); if (u > .03) { muzzle(ctx, -135, 0, 0, fk); for (let i = 0; i < 9; i++) { const a = (rnd(i + seg.seed) - .5) * .32; tracer(ctx, -130, 0, -130 + Math.cos(a) * 720, Math.sin(a) * 720, fk, 2.5); } }
    rain(seg.a + u, .9);
  },
  smg(seg, u) {
    shotCam(seg, u, 1.8, [40, 0]);
    const shots = [0, .08, .16, .24, .32, .4];
    [[230, -60, 21], [300, 50, 22]].forEach(([x, y, s], j) => { const d = shots[j * 3 + 2]; const k = eOut(p(u, d, d + .3)); if (u > d) blood(ctx, x + 30, y, s, 1, p(u, d, d + .1), 0); drawChar(ctx, x + k * 60, y, Math.PI + k, "zombie", { seed: s, dead: u > d + .15, walk: u * 8 }); });
    const fk = pulseAt(u, shots, .05);
    drawChar(ctx, -180, 20, -.05, "sarah", { weapon: "smg", recoil: fk });
    lightPass("rgba(3,6,12,0.74)", [{ x: -130, y: 15, r: 600, i: fk * .9, c: "255,190,90", ca: .4 }, { x: -180, y: 20, r: 700, i: .5, cone: .35, a: -.05 }]);
    applyCam(ctx); shots.forEach((s, i) => { const k = 1 - p(u, s, s + .05); if (u >= s && k > 0) { muzzle(ctx, -130, 17, -.05, k * .7); tracer(ctx, -130, 17, 400, (i % 2 ? 60 : -50), k, 2); } });
    rain(seg.a + u, .9);
  },
  barrels(seg, u) {
    const ex = [.02, .16]; seg.hits = ex; shotCam(seg, u, 1.25);
    const B = [[-90, 0], [130, -40]];
    B.forEach(([x, y], i) => { if (u > ex[i]) { ctx.fillStyle = "rgba(8,6,5,.8)"; circ(ctx, x, y, 110); } barrel(ctx, x, y, u > ex[i]); });
    for (let i = 0; i < 7; i++) { const bi = i % 2, [bx, by] = B[bi], a = rnd(i * 4.4 + seg.seed) * TAU, k = eOut(p(u, ex[bi], ex[bi] + .4)); drawChar(ctx, bx + Math.cos(a) * (80 + 170 * k), by + Math.sin(a) * (80 + 170 * k), a + k * 3, i % 3 ? "zombie" : "runner", { seed: i + 30, dead: u > ex[bi] }); }
    lightPass("rgba(3,5,10,0.78)", B.map(([x, y], i) => ({ x, y, r: 950, i: u > ex[i] ? 1 - p(u, ex[i], ex[i] + 1.2) * .6 : .15, c: "255,140,50", ca: .5 })));
    applyCam(ctx); B.forEach(([x, y], i) => explosion(ctx, x, y, (u - ex[i]) / .9, i * 50 + seg.seed));
    fog(seg.a + u, 1.2, "90,80,75");
  },
  shaman(seg, u) {
    const t = seg.a + u; shotCam(seg, u, 1.85);
    const pulse = .75 + .25 * Math.sin(t * 9);
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = `rgba(170,90,255,${.6 * pulse})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 175, 0, TAU); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 150, 0, TAU); ctx.stroke(); ctx.save(); ctx.rotate(t * .8);
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, b = (i + 2) / 5 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 150, Math.sin(a) * 150); ctx.lineTo(Math.cos(b) * 150, Math.sin(b) * 150); ctx.stroke(); }
    ctx.font = `600 22px ${FB}`; ctx.fillStyle = `rgba(200,150,255,${.7 * pulse})`; ctx.textAlign = "center"; for (let i = 0; i < 14; i++) { ctx.save(); ctx.rotate(i / 14 * TAU); ctx.fillText("ᚱᛟᚦᛉᛞᚨᛊ"[i % 7], 0, -158); ctx.restore(); }
    ctx.restore(); ctx.restore();
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + .5, x = Math.cos(a) * 280, y = Math.sin(a) * 280, k = p(u, i * .1, .5 + i * .1); ctx.fillStyle = "rgba(40,30,22,.95)"; ell(ctx, x, y, 44 * Math.min(1, k * 3), 30 * Math.min(1, k * 3), a); if (k > 0) drawChar(ctx, x, y, a + Math.PI, "zombie", { scale: .3 + .7 * eOut(k), alpha: clamp(k * 2), seed: i + 50, eyes: true }); }
    drawChar(ctx, 0, 0, Math.PI / 2, "shaman", { walk: t * 6 });
    lightPass("rgba(3,3,8,0.9)", [{ x: 0, y: 0, r: 540, i: .8 * pulse, c: "150,80,255", ca: .38 }, { x: 22, y: 6, r: 90, i: 1, c: "200,150,255", ca: .8 }]);
    fog(t, 1.4, "110,90,140");
  },
  tank(seg, u) {
    const st = .06; seg.hits = [st]; shotCam(seg, u, 1.45, [0, 40]);
    const k = p(u, st, st + .6); ctx.strokeStyle = `rgba(130,120,100,${.55 * (1 - k)})`; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 30, 40 + 260 * eOut(k), 0, TAU); ctx.stroke();
    for (let i = 0; i < 30; i++) { const a = rnd(i + seg.seed) * TAU, d = 60 + 220 * eOut(k) * rnd(i * 3); ctx.fillStyle = `rgba(90,82,70,${.6 * (1 - k)})`; circ(ctx, Math.cos(a) * d, 30 + Math.sin(a) * d, 6 + 10 * rnd(i)); }
    drawChar(ctx, 0, lerp(-40, 0, eOut(p(u, 0, st))), Math.PI / 2, "tank", { walk: u > st ? Math.PI : 0, seed: 2 });
    lightPass("rgba(3,6,12,0.74)", [{ x: 0, y: 0, r: 600, i: .55, c: "190,205,240", ca: .1 }]);
    rain(seg.a + u, 1.5, .3);
  },
  armored(seg, u) {
    const hits = [.05, .18, .31]; shotCam(seg, u, 2.0);
    drawChar(ctx, lerp(120, 60, u / .7), 0, Math.PI, "armored", { seed: 5, walk: u * 6 });
    lightPass("rgba(3,6,12,0.74)", [{ x: 60, y: 0, r: 420, i: .6 }, { x: -600, y: 0, r: 900, i: pulseAt(u, hits, .05) * .8, c: "255,190,90" }]);
    applyCam(ctx); hits.forEach((h, j) => { const k = 1 - p(u, h, h + .12); if (u >= h && k > 0) { tracer(ctx, -900, (j - 1) * 20, 45, (j - 1) * 8, k, 2.5); ctx.save(); ctx.globalCompositeOperation = "lighter"; for (let i = 0; i < 12; i++) { const a = Math.PI + (rnd(i + j * 20) - .5) * 1.8, d = (1 - k) * 90 * rnd(i * 3 + j); ctx.fillStyle = `rgba(255,220,140,${k})`; circ(ctx, 45 + Math.cos(a) * d, (j - 1) * 8 + Math.sin(a) * d, 2.2); } ctx.restore(); } });
    rain(seg.a + u, .9);
  },
  horde(seg, u) {
    shotCam(seg, u, 1.15, [u * 120, 0]);
    for (let i = 0; i < 16; i++) { const y = (rnd(i * 2.2) - .5) * 700, x = 900 - u * (700 + 300 * rnd(i)) - rnd(i * 4) * 500; drawChar(ctx, x, y, Math.PI + (rnd(i) - .5) * .3, "runner", { walk: u * 18 + i, seed: i }); }
    lightPass("rgba(3,6,12,0.74)", [{ x: u * 120, y: 0, r: 800, i: .55, c: "200,215,255", ca: .08 }]);
    rain(seg.a + u, 1.2); fog(seg.a + u, 1.3);
  },
  lightning(seg, u) {
    const fl = Math.max(pulseAt(u, [0, .22], .14));
    shotCam(seg, u, 1.0);
    for (let i = 0; i < 20; i++) drawChar(ctx, (rnd(i * 3.1) - .5) * 1500, (rnd(i * 1.7) - .5) * 800, Math.PI / 2, i % 7 === 0 ? "tank" : "zombie", { seed: i, walk: u * 5 });
    lightPass(`rgba(2,3,8,${.96 - fl * .85})`, []);
    screenFill(`rgba(210,220,255,${fl * .35})`); rain(seg.a + u, 2, .3);
  },
};
