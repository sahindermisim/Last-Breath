"use strict";
/* =========================================================================
   SİNEMATİK DUYURU — 0:20'den sonrası. Görüntü olarak yalnızca verilen kareler kullanılır;
   hareket kamera (yakınlaşma, kayma, sarsıntı) ve ışık/hava katmanlarından gelir.
   ========================================================================= */
const FRAME_KEYS = ["kare01", "ekstra01", "kare02", "kare03", "kare04", "kare05", "kare06", "kare07", "kare08", "kare09", "kare10", "kare11", "kare12", "kare13"];
const G = {};
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

// Renk eşitleme: her kare soğuk mavi-gri tona çekilir, yalnızca ateş turuncusu korunur.
// Aynı anda ateş bölgelerinden bir maske çıkarılır; titreme bu maske üzerinden verilir.
function gradeFrame(img, o = {}) {
  const w = img.naturalWidth, h = img.naturalHeight, c = mk(w, h), g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, w, h), a = d.data;
  let sum = 0, n = 0; for (let i = 0; i < a.length; i += 32) { sum += .2126 * a[i] + .7152 * a[i + 1] + .0722 * a[i + 2]; n++; }
  const gain = clamp(.17 / (sum / n / 255), .65, 1.45) * (o.exp ?? 1), keep = o.warm ?? 1;
  const wc = mk(w, h), wg = wc.getContext("2d"), wd = wg.createImageData(w, h), wa = wd.data;
  for (let i = 0; i < a.length; i += 4) {
    const r = a[i] / 255, gg = a[i + 1] / 255, b = a[i + 2] / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), sat = mx > 0 ? (mx - mn) / mx : 0;
    let hue = 0;
    if (mx > mn) { hue = mx === r ? ((gg - b) / (mx - mn)) % 6 : mx === gg ? (b - r) / (mx - mn) + 2 : (r - gg) / (mx - mn) + 4; hue *= 60; if (hue < 0) hue += 360; }
    const wv = smooth(0, 12, hue) * (1 - smooth(40, 56, hue)) * smooth(.3, .6, sat) * smooth(.2, .5, mx) * keep;
    const L = .2126 * r + .7152 * gg + .0722 * b;
    const hot = smooth(.5, .95, mx) * smooth(.4, .8, L), mixv = Math.max(wv, hot * .85 * keep);
    const cr = L * .82, cgc = L * .95, cb = L * 1.13 + .01;
    const fr = Math.max(r, L * 1.15), fg = gg * .82, fb = b * .45;
    const hr = [1, .9, .7], tr = hot > wv ? hr : [fr, fg, fb];
    const out = [lerp(cr, tr[0], mixv), lerp(cgc, tr[1], mixv), lerp(cb, tr[2], mixv)].map(x => Math.pow(Math.max(0, x * gain), 1.06));
    a[i] = Math.min(255, out[0] * 255); a[i + 1] = Math.min(255, out[1] * 255); a[i + 2] = Math.min(255, out[2] * 255);
    wa[i] = 255; wa[i + 1] = 135; wa[i + 2] = 45; wa[i + 3] = 255 * wv * smooth(.3, .8, mx);
  }
  g.putImageData(d, 0, 0); wg.putImageData(wd, 0, 0);
  const glow = mk(w >> 2, h >> 2), gl = glow.getContext("2d"); gl.filter = "blur(10px)"; gl.drawImage(wc, 0, 0, glow.width, glow.height);
  return { img: c, warm: wc, glow, w, h };
}
function prepFrames() { for (const k of FRAME_KEYS) if (IMG[k]) G[k] = gradeFrame(IMG[k], CONFIG.grade[k] || {}); }

// Kare çizer: z yakınlaşma, (fx, fy) odak (0–1), dx/dy kayma (px), sh sarsıntı.
// Görsel koordinatını ekrana çeviren fonksiyon döndürür.
function frame(k, t, o = {}) {
  const F = G[k]; if (!F) { STAND.add(k); return () => [W / 2, H / 2, 1]; }
  const s = Math.max(W / F.w, H / F.h) * (o.z || 1.05), iw = F.w * s, ih = F.h * s;
  let x = W / 2 - (o.fx ?? .5) * iw + (o.dx || 0), y = H / 2 - (o.fy ?? .5) * ih + (o.dy || 0);
  x = Math.min(0, Math.max(W - iw, x)); y = Math.min(0, Math.max(H - ih, y));
  const [sx, sy] = o.sh || [0, 0]; x += sx; y += sy;
  scr(); ctx.imageSmoothingQuality = "high"; ctx.globalAlpha = o.alpha ?? 1;
  if (o.blur) ctx.filter = `blur(${o.blur}px)`;
  ctx.drawImage(F.img, x, y, iw, ih); ctx.filter = "none";
  const fl = (o.fl ?? .45) * (.55 + .45 * Math.sin(t * 13.3 + (o.seed || 0)) * Math.sin(t * 7.1 + 1.7) + .15 * Math.sin(t * 31));
  if (fl > 0) { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = (o.alpha ?? 1) * fl; ctx.drawImage(F.glow, x, y, iw, ih); ctx.globalAlpha = (o.alpha ?? 1) * fl * .35; ctx.drawImage(F.warm, x, y, iw, ih); }
  scr();
  return (u, v) => [x + u * iw, y + v * ih, s];
}
function risingSparks(t, x, y, n = 40, spread = 160, alpha = 1) {
  scr(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) { const per = 2 + 2 * rnd(i), f = ((t / per) + rnd(i * 3)) % 1, px = x + (rnd(i * 5) - .5) * spread + Math.sin(t * 1.5 + i) * 30 * f, py = y - f * 420; ctx.fillStyle = `rgba(255,${130 + 90 * rnd(i)},50,${Math.sin(f * Math.PI) * alpha})`; const s = 1.5 + 2 * rnd(i * 7); ctx.fillRect(px, py, s, s); }
  scr();
}
function driftClouds(t, top, bottom, a = .3) {
  scr(); ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, bottom - top); ctx.clip();
  const off = (t * 22) % 3000;
  ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = a; for (let k = -1; k < 2; k++) ctx.drawImage(CLOUDS, k * 3000 - off, top - 120, 3000, 520);
  ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = a * .8; for (let k = -1; k < 2; k++) ctx.drawImage(CLOUDS, k * 3000 - (off * 1.6) % 3000 + 700, top - 60, 3000, 520);
  ctx.restore(); scr();
}
function heavyText(s, t, a, b) {
  const k = win(t, a, b, .18); if (k <= 0) return;
  text(s, W / 2 + 7, H / 2 + 40, { font: FD, size: 128, sp: 14, alpha: k, color: C.bone, shadow: false });
}
function cineSubs(t) {
  if (t < 20) return subtitles(t); // giriş olduğu gibi
  const L = DIALOG.find(d => t >= d.a && t < d.b); if (!L) return;
  text(L.text, W / 2, H - BAR - 44, { size: 34, weight: 300, sp: .5, color: "#ffffff", alpha: win(t, L.a, L.b, .18), blur: 4, dy: 1.5, shadow: "rgba(0,0,0,.95)", maxW: W - 400 });
}
const KB = (t, a, b, z0, z1, fx0, fy0, fx1 = fx0, fy1 = fy0) => { const k = eIO(p(t, a, b)); return { z: lerp(z0, z1, k), fx: lerp(fx0, fx1, k), fy: lerp(fy0, fy1, k) }; };

/* ---------- 1) SESSİZ DÜNYA  0:20–0:38 ---------- */
function sSilent(t) {
  scr(); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  if (t < 25.5) {
    frame("kare01", t, KB(t, 20, 25.5, 1.04, 1.32, .5, .5, .56, .48));
    fogBands(t, H * .62, 120, .1); rain3(t, .9);
    whiteFlash(1 - p(t, 20, 21.4), "0,0,0");
  } else if (t < 28) {
    frame("ekstra01", t, Object.assign(KB(t, 25.5, 28, 1.12, 1.2, .46, .52, .52, .5), { seed: 2 }));
    fogBands(t, H * .65, 100, .12); rain3(t, .8);
  } else if (t < 31.8) {
    const map = frame("kare02", t, Object.assign(KB(t, 28, 31.8, 1.1, 1.2, .5, .55, .52, .57), { fl: .3, seed: 3 }));
    const [lx, ly, s] = map(.504, .581), on = t < 31.4 && Math.sin((t - 28) * 7.5) > -.2;
    scr(); const r = 16 * s; const dg = ctx.createRadialGradient(lx, ly, 0, lx, ly, r); dg.addColorStop(0, "rgba(22,24,28,.95)"); dg.addColorStop(1, "rgba(22,24,28,0)"); ctx.fillStyle = dg; ctx.fillRect(lx - r, ly - r, r * 2, r * 2);
    if (on) { glow(lx, ly, 70 * s, "255,40,40", .55); glow(lx, ly, 9 * s, "255,190,190", 1); }
    rain3(t, 1);
  } else {
    frame("kare03", t, Object.assign(KB(t, 31.8, 38, 1.06, 1.22, .62, .42, .68, .4), { seed: 4 }));
    rain3(t, .9);
  }
  gradeS(.15);
}

/* ---------- 2) SARAH  0:38–0:49 ---------- */
function sSarah2(t) {
  const map = frame("kare04", t, Object.assign(KB(t, 38, 49, 1.05, 1.22, .5, .6, .5, .66), { fl: .75, seed: 5 }));
  const [top] = [BAR]; driftClouds(t, top, map(0, .36)[1], .35);
  const [fx, fy] = map(.51, .7); glow(fx, fy, 260, "255,130,40", .12 + .08 * Math.sin(t * 17) * Math.sin(t * 5.3)); risingSparks(t, fx, fy, 50, 70, .9);
  fogBands(t, H * .55, 100, .08); rain3(t, .6); gradeS(.15);
  whiteFlash(1 - p(t, 38, 38.25), "0,0,0");
}

/* ---------- 3) YÜKSELİŞ  0:49–1:05 ---------- */
function sRise(t) {
  scr(); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  if (t < 55) {
    const cam = KB(t, 49, 55, 1.06, 1.18, .55, .5, .56, .52), x = eIO(p(t, 50.4, 54.4));
    frame("kare01", t, cam); frame("kare05", t, Object.assign({}, cam, { alpha: x, seed: 6 }));
    fogBands(t, H * .65, 130, .12); rain3(t, .9);
  } else if (t < 58.7) {
    heavyText("DÜNYA SUSTU.", t, 55.2, 56.7); heavyText("ÖLÜLER SUSMADI.", t, 57.0, 58.5);
  } else {
    const punch = pulseAt(t, [61.8], .35);
    frame("kare06", t, Object.assign(KB(t, 58.7, 65, 1.06, 1.24, .45, .42, .42, .4), { sh: impulse(t, [61.8], 5, .3), seed: 7 }));
    if (punch > 0) whiteFlash(punch * .08, "255,255,255");
    rain3(t, .8);
  }
  gradeS(.15);
}

/* ---------- 4) PATLAMA  1:05–1:27 ---------- */
// Kesmeler 120 BPM ızgarasında (vuruş 0.5 sn). Müzik dosyası varsa vuruşlarına oturtulur.
const BURST_T0 = 65, BEAT = .5;
const BURST_PLAN = [ // [başlangıç vuruşu, kare, kamera (z0,z1,fx0,fy0,fx1,fy1), efekt]
  [0, "kare11", [1.08, 1.16, .6, .5, .64, .48], "muzzle"], [2, "kare11", [1.45, 1.55, .72, .46, .76, .45], ""], [4, "kare11", [1.2, 1.3, .42, .5, .46, .5], "muzzle"], [6, "kare11", [1.6, 1.7, .78, .45, .8, .45], ""],
  [9, "kare13", [1.1, 1.2, .6, .5, .62, .52], "shake"], [11, "kare13", [1.5, 1.6, .66, .6, .7, .62], "shake"], [13, "kare13", [1.25, 1.3, .45, .45, .5, .45], "shake"], [15, "kare13", [1.7, 1.85, .7, .55, .72, .56], "shake"],
  [18, "kare07", [1.08, 1.16, .55, .45, .58, .42], "slow"], [22, "kare07", [1.4, 1.48, .66, .35, .68, .34], "slow"],
  [26, "kare12", [1.3, 1.34, .25, .5, .72, .45], "pan"], [30, "kare12", [1.5, 1.55, .7, .45, .3, .5], "pan"],
  [34, "kare08", [1.1, 1.2, .5, .45, .5, .42], "hard"], [36, "kare08", [1.5, 1.6, .47, .3, .47, .28], "hard"], [38, "kare08", [1.25, 1.35, .35, .6, .38, .58], "hard"], [40, "kare08", [1.12, 1.3, .5, .42, .5, .4], "climax"],
];
const BURST_END = 87, CLIMAX = BURST_T0 + 41 * BEAT;
let BURST = [];
function buildCuts(onsets) {
  BURST = BURST_PLAN.map(([bt, k, cam, fx], i) => {
    let a = BURST_T0 + bt * BEAT;
    if (onsets && i > 0) { const near = onsets.filter(o => Math.abs(o - a) < .2).sort((x, y) => Math.abs(x - a) - Math.abs(y - a))[0]; if (near !== undefined) a = near; }
    return { a, k, cam, fx };
  });
  BURST.forEach((s, i) => s.b = i < BURST.length - 1 ? BURST[i + 1].a : BURST_END);
}
function sBurst(t) {
  scr(); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  const sg = BURST.find(s => t >= s.a && t < s.b) || BURST[BURST.length - 1], u = t - sg.a, d = sg.b - sg.a;
  const [z0, z1, fx0, fy0, fx1, fy1] = sg.cam, k = sg.fx === "pan" ? eIO(u / d) : u / d;
  let sh = [0, 0], tt = t;
  if (sg.fx === "shake") sh = [Math.sin(t * 47) * 9 + Math.sin(t * 23) * 6, Math.cos(t * 41) * 7];
  if (sg.fx === "hard" || sg.fx === "climax") { const a = sg.fx === "climax" ? 10 + 30 * pulseAt(t, [CLIMAX], .9) : 16; sh = [Math.sin(t * 53) * a, Math.cos(t * 47) * a * .8]; }
  if (sg.fx === "slow") tt = sg.a + u * .3;
  const map = frame(sg.k, tt, { z: lerp(z0, z1, k), fx: lerp(fx0, fx1, k), fy: lerp(fy0, fy1, k), sh, fl: .6, seed: BURST.indexOf(sg) });
  if (sg.fx === "muzzle") { const [mx, my] = map(.84, .47); const f = 1 - p(u, 0, .25); glow(mx, my, 900 * f, "255,210,150", .8 * f); flare(mx, my, 1.2 * f, "255,210,160"); whiteFlash(.75 * (1 - p(u, 0, .09)), "255,255,255"); }
  if (sg.fx === "climax") { const f = pulseAt(t, [CLIMAX], .5); whiteFlash(f, "255,250,245"); }
  rain3(sg.fx === "slow" ? sg.a + u * .3 : t, sg.fx === "slow" ? 1.2 : .9, sg.fx === "pan" ? .35 : .18);
  gradeS(.15);
  if (u < 2.5 / 30 && BURST.indexOf(sg) > 0) whiteFlash(1, "0,0,0"); // 2–3 karelik siyah flaş
}

/* ---------- 5) ANİ SESSİZLİK  1:27–1:40.5 ---------- */
function sHush(t) {
  scr(); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  if (t < 89) return;
  if (t < 96.6) { frame("kare09", t, Object.assign(KB(t, 89, 96.6, 1.06, 1.2, .55, .45, .58, .42), { fl: .35, seed: 9 })); rain3(t, .45); whiteFlash(1 - p(t, 89, 90), "0,0,0"); }
  else { frame("kare10", t, Object.assign(KB(t, 96.6, 100.5, 1.06, 1.18, .38, .45, .36, .42), { fl: .35, seed: 10 })); rain3(t, .45); }
  gradeS(.15);
}

/* ---------- 6) KAPANIŞ  1:40.5–1:50 (tam ekran) ---------- */
function sClose(t) {
  scr(); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  if (t < 104.3) {
    const s = t < 101 ? lerp(1.5, .97, eOut(p(t, 100.5, 101))) : lerp(.97, 1, eOut(p(t, 101, 101.4)));
    const sc = Math.min(1500 / GAME_TITLE.width, 380 / GAME_TITLE.height) * s, tw = GAME_TITLE.width * sc, th = GAME_TITLE.height * sc, [sx, sy] = impulse(t, [100.95], 14, .5), cy = H / 2 - 30;
    ctx.drawImage(GAME_TITLE, W / 2 - tw / 2 + sx, cy - th / 2 + sy, tw, th);
    const lk = eOut(p(t, 101.6, 102.4)); ctx.fillStyle = C.red; ctx.fillRect(W / 2 - 420 * lk, cy + 170, 840 * lk, 2);
    text("SON NEFESİNE KADAR.", W / 2 + 6, cy + 232, { size: 30, sp: 12, weight: 300, alpha: p(t, 102.2, 102.9), color: C.bone, shadow: false });
    whiteFlash(1 - eOut(p(t, 100.5, 101.1)), "255,255,255");
  } else if (t < 106.8) {
    const L = IMG.logoFinal; if (L) { const s = Math.min(W / L.width, H / L.height); ctx.drawImage(L, (W - L.width * s) / 2, (H - L.height * s) / 2, L.width * s, L.height * s); } else STAND.add("Ashbound logosu");
  } else {
    const a = 1 - p(t, 109.2, 110);
    text("YAKINDA", W / 2 + 12, H / 2 + 30, { font: FD, size: 150, sp: 24, alpha: a, color: C.bone, shadow: false });
    text("Sinematik fragman. Oyun içi görüntü değildir.", W / 2, H / 2 + 110, { size: 22, sp: 3, weight: 300, alpha: a * .7, color: C.bone, shadow: false });
  }
}

/* ---------- zaman çizelgesi ---------- */
const SCENES = [
  [0, 8, sLogo, "Giriş · logo"], [8, 11.9, sRoom, "Giriş · oda"], [11.9, 20, sTV, "Giriş · TV"],
  [20, 38, sSilent, "Sessiz dünya"], [38, 49, sSarah2, "Sarah"], [49, 65, sRise, "Yükseliş"], [65, 87, sBurst, "Patlama"],
  [87, 100.5, sHush, "Ani sessizlik"], [100.5, 110.01, sClose, "Kapanış"],
];
function render(t) {
  STAND.clear();
  scr();
  const sc = SCENES.find(s => t >= s[0] && t < s[1]) || SCENES[SCENES.length - 1];
  ctx.save(); sc[2](t); ctx.restore(); scr();
  ctx.drawImage(VIGNETTE, 0, 0);
  ctx.save(); ctx.globalAlpha = .08; ctx.globalCompositeOperation = "overlay"; ctx.drawImage(GRAIN[Math.floor(t * 30) % GRAIN.length], 0, 0, W, H); ctx.restore();
  if (t < 100.5) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, BAR); ctx.fillRect(0, H - BAR, W, BAR); }
  cineSubs(t);
  standTag();
  return sc[3];
}
