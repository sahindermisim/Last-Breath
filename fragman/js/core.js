"use strict";
const W = 1920, H = 1080, TAU = Math.PI * 2, BAR = 138; // 2.39:1
const FD = '"Bebas Neue", Impact, "Arial Narrow", sans-serif';
const FB = 'Oswald, "Arial Narrow", Arial, sans-serif';
const C = { bone: "#e9e2d2", red: "#e0342b", bronze: "#c08f53", copper: "#e8c98f", ground: "#0b0a0c" };
const RENDER_MODE = new URLSearchParams(location.search).has("render");
if (RENDER_MODE) document.body.classList.add("render");
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

/* ---------- yardımcılar ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const p = (t, a, b) => clamp((t - a) / (b - a));
const eOut = k => 1 - Math.pow(1 - k, 3);
const eIn = k => k * k * k;
const eIO = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const win = (t, a, b, f = .3) => Math.min(p(t, a, a + f), 1 - p(t, b - f, b));
function rnd(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mk(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, TAU); g.fill(); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, TAU); g.fill(); }
function speck(g, w, h, R, n, cols) { for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; const s = 1 + R() * 3; g.fillRect(R() * w, R() * h, s, s); } }
function impulse(t, times, amp, dur) {
  let x = 0, y = 0;
  for (const s of times) { const d = t - s; if (d >= 0 && d < dur) { const k = Math.pow(1 - d / dur, 2) * amp; x += Math.sin(d * 90 + s) * k; y += Math.cos(d * 77 + s * 3) * k; } }
  return [x, y];
}
const pulseAt = (t, times, dur) => Math.max(0, ...times.map(s => (t >= s ? 1 - p(t, s, s + dur) : 0)));

/* ---------- varlıklar ---------- */
const IMG = {}, STATE = {};
let MUSIC_AB = null, LOGO_KEYED = null, GAME_TITLE = null;
function loadImg(src) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
async function loadFirst(list, fn) { for (const s of list) { const r = await fn(s); if (r) return r; } return null; }
async function loadAssets() {
  for (const [k, list] of Object.entries(CONFIG.assets)) {
    if (k === "music") {
      MUSIC_AB = await loadFirst(list, async s => { try { const r = await fetch(s); return r.ok ? await r.arrayBuffer() : null; } catch (e) { return null; } });
      STATE.music = !!MUSIC_AB;
    } else {
      const im = await loadFirst(list, loadImg);
      if (im) IMG[k] = im; STATE[k] = !!im;
    }
  }
  if (IMG.logo) LOGO_KEYED = keyLogo(IMG.logo);
}
// Siyah zeminli logoda siyahı saydamlığa çevirir; beyaz renk ve oranlar aynen kalır.
// Zaten saydam bir PNG ise olduğu gibi kullanılır.
function keyLogo(img) {
  const c = mk(img.naturalWidth, img.naturalHeight), g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 3; i < a.length; i += 4 * 61) if (a[i] < 250) return c;
  for (let i = 0; i < a.length; i += 4) {
    const m = Math.max(a[i], a[i + 1], a[i + 2]), al = clamp((m - 12) / (230 - 12));
    if (al <= 0) { a[i + 3] = 0; continue; }
    a[i] = Math.min(255, a[i] / al); a[i + 1] = Math.min(255, a[i + 1] / al); a[i + 2] = Math.min(255, a[i + 2] / al); a[i + 3] = al * 255;
  }
  g.putImageData(d, 0, 0);
  return c;
}
const ASSET_LABEL = { logo: "Ashbound logosu (giriş)", logoFinal: "Ashbound logosu (kapanış)", gameLogo: "LAST BREATH logosu", music: "Müzik" };

/* Yer tutucu etiketi: eksik bir dosyanın yerine yedek çizim kullanıldığında karede görünür. */
const STAND = new Set();
function standTag() {
  if (!STAND.size) return;
  text("YER TUTUCU · " + [...STAND].join(", ") + " bekleniyor", W - 40, BAR + 34, { size: 18, sp: 3, weight: 400, align: "right", alpha: .55, color: C.copper, blur: 0 });
}

/* ---------- prosedürel zemin dokuları ---------- */
let CITY, BASE, GRAIN = [], VIGNETTE, LIGHT, LX, TMP, TX, SCAN;
function makeCity() {
  const S = 3000, c = mk(S, S), g = c.getContext("2d"), R = mulberry(7);
  g.fillStyle = "#151619"; g.fillRect(0, 0, S, S);
  speck(g, S, S, R, 30000, ["#1b1d21", "#101113", "#1f2126", "#17181b"]);
  g.translate(S / 2, S / 2);
  const roads = [-1000, 0, 1000], RW = 190, SW = 45;
  for (const r of roads) { g.fillStyle = "#24262a"; g.fillRect(r - RW - SW, -1500, (RW + SW) * 2, 3000); g.fillRect(-1500, r - RW - SW, 3000, (RW + SW) * 2); }
  for (const r of roads) { g.fillStyle = "#18191c"; g.fillRect(r - RW, -1500, RW * 2, 3000); g.fillRect(-1500, r - RW, 3000, RW * 2); }
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
  for (const r of roads) for (let s = -1500; s < 1500; s += 48) for (const side of [-1, 1]) {
    const o = r + side * (RW + SW / 2);
    g.beginPath(); g.moveTo(o - SW / 2, s); g.lineTo(o + SW / 2, s); g.stroke();
    g.beginPath(); g.moveTo(s, o - SW / 2); g.lineTo(s, o + SW / 2); g.stroke();
  }
  for (let i = 0; i < 16000; i++) {
    const r = roads[i % 3], a = (R() - .5) * 2 * RW, b = R() * 3000 - 1500; g.fillStyle = R() < .5 ? "#1e2024" : "#121315"; const s = 1 + R() * 2.5;
    i % 2 ? g.fillRect(b, r + a, s, s) : g.fillRect(r + a, b, s, s);
  }
  g.fillStyle = "rgba(170,145,70,.3)";
  for (const r of roads) for (let s = -1500; s < 1500; s += 90) { if (roads.some(q => Math.abs(s + 22 - q) < RW + 20)) continue; g.fillRect(r - 3, s, 6, 46); g.fillRect(s, r - 3, 46, 6); }
  const E = [-1500, -1000, 0, 1000, 1500];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const x0 = E[i] + (i === 0 ? 0 : RW + SW), x1 = E[i + 1] - (i === 3 ? 0 : RW + SW), y0 = E[j] + (j === 0 ? 0 : RW + SW), y1 = E[j + 1] - (j === 3 ? 0 : RW + SW);
    let cx = x0 + 25;
    while (cx < x1 - 120) {
      const bw = Math.min(x1 - 25 - cx, 200 + R() * 320); let cy = y0 + 25;
      while (cy < y1 - 120) {
        const bh = Math.min(y1 - 25 - cy, 180 + R() * 360), tone = 24 + Math.floor(R() * 10);
        g.fillStyle = `rgb(${tone},${tone + 1},${tone + 4})`; g.fillRect(cx, cy, bw, bh);
        g.strokeStyle = "#09090a"; g.lineWidth = 8; g.strokeRect(cx, cy, bw, bh);
        g.strokeStyle = "rgba(255,255,255,.045)"; g.lineWidth = 3; g.strokeRect(cx + 12, cy + 12, bw - 24, bh - 24);
        for (let n = 0; n < 3 + R() * 5; n++) { g.fillStyle = "#33363b"; const w = 26 + R() * 30; g.fillRect(cx + 20 + R() * (bw - 70), cy + 20 + R() * (bh - 70), w, w * .7); }
        for (let n = 0; n < 400; n++) { g.fillStyle = R() < .5 ? "rgba(0,0,0,.25)" : "rgba(255,255,255,.03)"; g.fillRect(cx + R() * bw, cy + R() * bh, 3, 3); }
        cy += bh + 30;
      }
      cx += bw + 30;
    }
  }
  const onRoad = () => { const r = roads[Math.floor(R() * 3)], a = (R() - .5) * 2 * RW * .9, b = R() * 3000 - 1500; return R() < .5 ? [r + a, b] : [b, r + a]; };
  g.lineCap = "round";
  for (let i = 0; i < 420; i++) { let [x, y] = onRoad(); g.strokeStyle = "#08090a"; g.lineWidth = 1 + R() * 2.5; g.beginPath(); g.moveTo(x, y); let a = R() * TAU; for (let s = 0; s < 4 + R() * 7; s++) { a += (R() - .5) * 1.4; x += Math.cos(a) * (10 + R() * 26); y += Math.sin(a) * (10 + R() * 26); g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 110; i++) { const [x, y] = onRoad(), rx = 30 + R() * 90, ry = 14 + R() * 40, rot = R() * TAU; g.fillStyle = "rgba(55,80,115,.22)"; ell(g, x, y, rx, ry, rot); g.strokeStyle = "rgba(140,170,210,.1)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.stroke(); }
  for (let i = 0; i < 70; i++) { const [x, y] = onRoad(); g.fillStyle = i % 3 ? "rgba(8,8,8,.45)" : "rgba(60,8,10,.45)"; for (let k = 0; k < 5; k++) circ(g, x + (R() - .5) * 40, y + (R() - .5) * 40, 6 + R() * 18); }
  for (let i = 0; i < 30; i++) {
    const [x, y] = onRoad(); g.save(); g.translate(x, y); g.rotate(R() * TAU);
    g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(-46, -20, 100, 50); g.fillStyle = ["#2b3035", "#3a2b27", "#2c3329", "#3d3a33", "#23262b"][i % 5]; g.fillRect(-50, -24, 100, 48);
    g.fillStyle = "#0c1013"; g.fillRect(-18, -19, 18, 38); g.fillRect(18, -18, 12, 36); g.strokeStyle = "#0a0a0a"; g.lineWidth = 3; g.strokeRect(-50, -24, 100, 48); g.restore();
  }
  for (let i = 0; i < 600; i++) { const [x, y] = onRoad(); g.fillStyle = R() < .3 ? "rgba(180,170,150,.16)" : "rgba(40,40,42,.8)"; g.save(); g.translate(x, y); g.rotate(R() * TAU); g.fillRect(-4, -3, 6 + R() * 8, 4 + R() * 5); g.restore(); }
  return c;
}
function makeFx() {
  for (let n = 0; n < 6; n++) {
    const c = mk(480, 270), g = c.getContext("2d"), d = g.createImageData(480, 270), R = mulberry(100 + n);
    for (let i = 0; i < d.data.length; i += 4) { const v = R() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); GRAIN.push(c);
  }
  VIGNETTE = mk(W, H); const v = VIGNETTE.getContext("2d");
  const gr = v.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.85)"); v.fillStyle = gr; v.fillRect(0, 0, W, H);
  SCAN = mk(4, 4); const s = SCAN.getContext("2d"); s.fillStyle = "rgba(0,0,0,.45)"; s.fillRect(0, 2, 4, 2);
  LIGHT = mk(W, H); LX = LIGHT.getContext("2d"); TMP = mk(W, H); TX = TMP.getContext("2d");
}

/* ---------- kamera ve ışık ---------- */
const CAM = { x: 0, y: 0, z: 1, r: 0, sx: 0, sy: 0 };
function applyCam(g) { g.setTransform(1, 0, 0, 1, 0, 0); g.translate(W / 2 + CAM.sx, H / 2 + CAM.sy); g.rotate(CAM.r); g.scale(CAM.z, CAM.z); g.translate(-CAM.x, -CAM.y); }
function setCam(x, y, z, r = 0, sh = [0, 0]) { Object.assign(CAM, { x, y, z, r, sx: sh[0], sy: sh[1] }); applyCam(ctx); }
function drawMap(m, ox = 0, oy = 0) { ctx.drawImage(m, ox - m.width / 2, oy - m.height / 2); }
function screenFill(col) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
let FILL = null;
function lightPass(ambient, lights) {
  if (FILL) lights = [...lights, { x: CAM.x, y: CAM.y, r: FILL.r / CAM.z, i: FILL.i }];
  LX.setTransform(1, 0, 0, 1, 0, 0); LX.globalCompositeOperation = "source-over"; LX.clearRect(0, 0, W, H); LX.fillStyle = ambient; LX.fillRect(0, 0, W, H);
  applyCam(LX); LX.globalCompositeOperation = "destination-out";
  for (const l of lights) {
    if (l.i <= 0) continue;
    const gr = LX.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
    gr.addColorStop(0, `rgba(0,0,0,${clamp(l.i)})`); gr.addColorStop(l.core ?? .35, `rgba(0,0,0,${clamp(l.i) * .7})`); gr.addColorStop(1, "rgba(0,0,0,0)");
    LX.fillStyle = gr; LX.beginPath();
    if (l.cone) { LX.moveTo(l.x, l.y); LX.arc(l.x, l.y, l.r, l.a - l.cone, l.a + l.cone); LX.closePath(); } else LX.arc(l.x, l.y, l.r, 0, TAU);
    LX.fill();
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(LIGHT, 0, 0); ctx.restore();
  ctx.save(); applyCam(ctx); ctx.globalCompositeOperation = "lighter";
  for (const l of lights) {
    if (!l.c || l.i <= 0) continue;
    const rr = l.r * (l.cr ?? .8), gr = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, rr);
    gr.addColorStop(0, `rgba(${l.c},${(l.ca ?? .35) * clamp(l.i)})`); gr.addColorStop(1, `rgba(${l.c},0)`); ctx.fillStyle = gr; ctx.beginPath();
    if (l.cone) { ctx.moveTo(l.x, l.y); ctx.arc(l.x, l.y, rr, l.a - l.cone, l.a + l.cone); ctx.closePath(); } else ctx.arc(l.x, l.y, rr, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
const flick = (t, i) => .88 + .12 * Math.sin(t * 23 + i * 3) * Math.sin(t * 7.3 + i);

/* ---------- atmosfer ---------- */
function rain(t, amt = 1, wind = .22) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineCap = "round";
  for (let i = 0, n = Math.floor(260 * amt); i < n; i++) {
    const sp = 1900 + 900 * rnd(i + .7), len = 26 + 40 * rnd(i + .3), y = ((rnd(i + .5) * H * 1.3 + t * sp) % (H * 1.3)) - H * .15, x = rnd(i) * (W + 500) - 100 - y * wind;
    ctx.strokeStyle = `rgba(175,195,225,${.1 + .22 * rnd(i + .9)})`; ctx.lineWidth = 1 + rnd(i + .2) * 1.3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * wind, y + len); ctx.stroke();
  }
  for (let i = 0, m = Math.floor(70 * amt); i < m; i++) {
    const per = .45 + .2 * rnd(i * 3.3), ph = t / per + rnd(i * 1.7), f = ph % 1, cyc = Math.floor(ph), x = rnd(i * 13 + cyc * .37) * W, y = BAR + rnd(i * 7 + cyc * .91) * (H - 2 * BAR);
    ctx.strokeStyle = `rgba(170,195,230,${(1 - f) * .28})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(x, y, 2 + 12 * f, 1 + 5 * f, 0, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}
function fog(t, amt = 1, col = "150,165,185") {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 7; i++) {
    const x = ((rnd(i * 2.1) * (W + 1200) + t * (18 + 30 * rnd(i))) % (W + 1200)) - 600, y = rnd(i * 5.3) * H, r = 380 + 300 * rnd(i * 1.9), gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${col},${.07 * amt})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}
function embers(t, n = 90, amt = 1) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) {
    const per = 3 + 3 * rnd(i), f = (t / per + rnd(i * 2)) % 1, x = rnd(i * 5) * W + Math.sin(t + i) * 30 - f * 160, y = H + 20 - f * (H + 80);
    ctx.fillStyle = `rgba(255,${120 + 90 * rnd(i)},50,${Math.sin(f * Math.PI) * .8 * amt})`; const s = 2 + 2 * rnd(i * 3); ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}
function moonWash(a = .14) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "lighter";
  const gr = ctx.createRadialGradient(W * .15, -H * .2, 0, W * .15, -H * .2, W * 1.1); gr.addColorStop(0, `rgba(90,120,170,${a})`); gr.addColorStop(1, "rgba(40,60,100,0)"); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/* ---------- yazı ---------- */
function text(s, x, y, o = {}) {
  const g = o.g || ctx; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = clamp(o.alpha ?? 1); g.globalCompositeOperation = "source-over";
  if (g.globalAlpha <= 0) { g.restore(); return; }
  g.font = `${o.weight || 400} ${o.size || 40}px ${o.font || FB}`; g.textAlign = o.align || "center"; g.textBaseline = o.base || "alphabetic";
  if ("letterSpacing" in g) g.letterSpacing = (o.sp || 0) + "px";
  if (o.shadow !== false) { g.shadowColor = o.shadow || "rgba(0,0,0,.85)"; g.shadowBlur = o.blur ?? 24; g.shadowOffsetY = o.dy ?? 0; }
  g.fillStyle = o.color || C.bone; o.maxW ? g.fillText(s, x, y, o.maxW) : g.fillText(s, x, y); g.restore();
}
// Sinematik altyazı: konuşanın adı küçük ve bakır, replik beyaz, ince gölgeli.
function subtitles(t) {
  const L = DIALOG.find(d => t >= d.a && t < d.b); if (!L) return;
  const k = win(t, L.a, L.b, .15);
  text(L.who, W / 2, H - BAR - 88, { size: 22, sp: 6, weight: 500, color: C.copper, alpha: k, blur: 6, dy: 2 });
  text(L.text, W / 2, H - BAR - 38, { size: 46, weight: 400, color: "#ffffff", alpha: k, blur: 6, dy: 2, maxW: W - 360 });
}
function card(word, t, a, b) {
  screenFill(C.ground);
  const s = lerp(1.04, 1, eOut(p(t, a, a + .25)));
  ctx.save(); ctx.setTransform(s, 0, 0, s, W / 2 * (1 - s), H / 2 * (1 - s));
  ctx.font = `400 210px ${FD}`; ctx.textAlign = "center"; if ("letterSpacing" in ctx) ctx.letterSpacing = "16px";
  ctx.fillStyle = C.bone; ctx.fillText(word, W / 2 + 8, H / 2 + 72, W - 300);
  ctx.fillStyle = C.red; ctx.fillRect(W / 2 - 90, H / 2 + 110, 180, 5);
  ctx.restore();
}

/* ---------- logolar ---------- */
function drawLogo(g, cx, cy, w, alpha = 1, blur = 0) {
  if (!LOGO_KEYED) { STAND.add("Ashbound logosu"); return; }
  const h = w * LOGO_KEYED.height / LOGO_KEYED.width;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; if (blur > .2) g.filter = `blur(${blur}px)`;
  g.drawImage(LOGO_KEYED, cx - w / 2, cy - h / 2, w, h); g.restore();
  return h;
}
function logoSweep(k, cx, cy, w, alpha) {
  TX.setTransform(1, 0, 0, 1, 0, 0); TX.globalCompositeOperation = "source-over"; TX.clearRect(0, 0, W, H);
  drawLogo(TX, cx, cy, w, 1, 0);
  TX.globalCompositeOperation = "source-atop";
  const x = lerp(cx - w * .55, cx + w * .55, k), gr = TX.createLinearGradient(x - 170, cy - 260, x + 170, cy + 260);
  gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.4, "rgba(160,168,180,.75)"); gr.addColorStop(.5, "rgba(255,255,255,1)"); gr.addColorStop(.6, "rgba(150,140,125,.7)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  TX.fillStyle = gr; TX.fillRect(0, 0, W, H); TX.globalCompositeOperation = "source-over";
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.drawImage(TMP, 0, 0);
  ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = alpha * .35 * Math.sin(k * Math.PI); ctx.filter = "blur(14px)"; ctx.drawImage(TMP, 0, 0); ctx.restore();
}
// LAST BREATH: ayrı logo > kapaktaki yazının kırpılması > yer tutucu yazı
function makeGameTitle() {
  if (IMG.gameLogo) return IMG.gameLogo;
  const cr = CONFIG.keyArt?.titleCrop;
  if (IMG.keyArt && cr) {
    const iw = IMG.keyArt.naturalWidth, ih = IMG.keyArt.naturalHeight, c = mk(Math.round(cr[2] * iw), Math.round(cr[3] * ih));
    c.getContext("2d").drawImage(IMG.keyArt, cr[0] * iw, cr[1] * ih, c.width, c.height, 0, 0, c.width, c.height); return c;
  }
  const c = mk(1800, 420), g = c.getContext("2d"); g.textBaseline = "alphabetic"; if ("letterSpacing" in g) g.letterSpacing = "18px";
  g.font = `400 330px ${FD}`; const wL = g.measureText("LAST ").width, wB = g.measureText("BREATH").width, x0 = (1800 - wL - wB) / 2;
  g.fillStyle = C.bone; g.fillText("LAST", x0, 340); g.fillStyle = C.red; g.fillText("BREATH", x0 + wL, 340);
  c.placeholder = true; return c;
}

