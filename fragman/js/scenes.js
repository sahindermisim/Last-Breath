"use strict";
// 0:00–0:08 · siyah, uğultu, logo bulanıktan netleşir, metalik ışık, "sunar"
function sLogo(t) {
  screenFill("#000");
  const a = win(t, .8, 7.9, .9), blur = lerp(22, 0, eOut(p(t, 1.0, 3.6))), cx = W / 2, cy = H / 2 - 20, w = 1100;
  if (a <= 0) return;
  drawLogo(ctx, cx, cy, w, a, blur);
  const k = p(t, 3.9, 5.4); if (k > 0 && k < 1) logoSweep(eIO(k), cx, cy, w, a);
  text("sunar", W / 2, cy + 225, { size: 30, sp: 16, weight: 300, alpha: win(t, 5.4, 7.7, .6), color: C.bone, shadow: false });
}

// 0:11.9–0:20 · TV yakın plan: parazit, kapanış → "İKİ HAFTA SONRA"
function sTV(t) {
  screenFill("#050506");
  if (t < 15.9) {
    const on = 1, off = p(t, 15.35, 15.8), glitch = t > 14.7 && t < 15.35;
    const z = lerp(1.18, 1.3, p(t, 11.9, 15.4)), sw = 1180 * z, sh = 700 * z, cx = W / 2, cy = H / 2 - 10;
    // odaya vuran ekran ışığı
    ctx.save(); ctx.globalCompositeOperation = "lighter"; const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, 1100);
    gl.addColorStop(0, `rgba(90,120,170,${.16 * on * (1 - off) * (.85 + .15 * Math.sin(t * 40))})`); gl.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H); ctx.restore();
    // kasa
    ctx.fillStyle = "#0e0e10"; roundRect(cx - sw / 2 - 40, cy - sh / 2 - 40, sw + 80, sh + 80, 34); ctx.fill();
    // ekran içeriği
    const collapseY = off > 0 ? lerp(1, .004, eIn(p(off, 0, .55))) : 1, collapseX = off > .55 ? lerp(1, .02, p(off, .55, 1)) : 1;
    ctx.save(); roundRect(cx - sw / 2, cy - sh / 2, sw, sh, 22); ctx.clip();
    ctx.fillStyle = "#000"; ctx.fillRect(cx - sw / 2, cy - sh / 2, sw, sh);
    ctx.translate(cx, cy); ctx.scale(collapseX, collapseY); ctx.translate(-cx, -cy);
    const jit = glitch ? (rnd(Math.floor(t * 30)) - .5) * 80 : (rnd(Math.floor(t * 30)) - .5) * 4;
    const bg = ctx.createLinearGradient(0, cy - sh / 2, 0, cy + sh / 2); bg.addColorStop(0, "#1c2a3e"); bg.addColorStop(1, "#0c1320");
    ctx.fillStyle = bg; ctx.fillRect(cx - sw / 2 + jit, cy - sh / 2, sw, sh);
    // haber bandı
    ctx.fillStyle = "#b3161c"; ctx.fillRect(cx - sw / 2 + 60 + jit, cy + sh / 2 - 150, 330, 62);
    ctx.fillStyle = "rgba(10,12,18,.85)"; ctx.fillRect(cx - sw / 2 + 390 + jit, cy + sh / 2 - 150, sw - 450, 62);
    ctx.font = `600 38px ${FB}`; ctx.fillStyle = "#f2f2f2"; ctx.textAlign = "left"; if ("letterSpacing" in ctx) ctx.letterSpacing = "4px";
    ctx.fillText("SON DAKİKA", cx - sw / 2 + 84 + jit, cy + sh / 2 - 105);
    // parazit
    ctx.globalAlpha = glitch ? .75 : .32; ctx.globalCompositeOperation = "screen";
    ctx.drawImage(GRAIN[Math.floor(t * 30) % GRAIN.length], cx - sw / 2, cy - sh / 2, sw, sh);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    const roll = ((t * .35) % 1) * (sh + 200) - 100; ctx.fillStyle = "rgba(255,255,255,.05)"; ctx.fillRect(cx - sw / 2, cy - sh / 2 + roll, sw, 90);
    if (glitch) for (let i = 0; i < 6; i++) { const y = cy - sh / 2 + rnd(i + Math.floor(t * 30) * 7) * sh; ctx.fillStyle = `rgba(255,255,255,${.1 + .2 * rnd(i * 3 + t)})`; ctx.fillRect(cx - sw / 2, y, sw, 3 + 12 * rnd(i + t)); }
    ctx.fillStyle = ctx.createPattern(SCAN, "repeat"); ctx.fillRect(cx - sw / 2, cy - sh / 2, sw, sh);
    if (off > .55) { ctx.fillStyle = `rgba(230,240,255,${1 - p(off, .55, 1)})`; ctx.fillRect(cx - sw / 2, cy - 6, sw, 12); }
    ctx.restore();
    // ekran camı yansıması ve açılış/kapanış
    const vg = ctx.createRadialGradient(cx, cy, sh * .2, cx, cy, sw * .62); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.6)");
    ctx.fillStyle = vg; roundRect(cx - sw / 2, cy - sh / 2, sw, sh, 22); ctx.fill();
    if (on < 1) screenFill(`rgba(0,0,0,${1 - on})`);
  }
  const k = win(t, 16.2, 19.5, .5);
  text("İKİ HAFTA SONRA", W / 2, H / 2 + 34, { font: FD, size: 96, sp: 18, alpha: k, color: C.bone, shadow: false });
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// Kapak görselini karenin içine yerleştirir (cover), odak noktasına doğru yakınlaşır.
function drawKeyArt(zoom, fx, fy, alpha = 1, dx = 0, dy = 0) {
  const im = IMG.keyArt, s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * zoom, iw = im.naturalWidth * s, ih = im.naturalHeight * s;
  let x = W / 2 - fx * iw + dx, y = H / 2 - fy * ih + dy;
  x = Math.min(0, Math.max(W - iw, x)); y = Math.min(0, Math.max(H - ih, y));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.drawImage(im, x, y, iw, ih); ctx.restore();
}
function grade(cool = .3, warm = .2) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "soft-light"; ctx.fillStyle = `rgba(30,50,80,${cool})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "lighter"; const gr = ctx.createRadialGradient(W * .5, H * 1.15, 0, W * .5, H * 1.15, H * .9);
  gr.addColorStop(0, `rgba(220,90,30,${warm})`); gr.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// 1:41–1:55 · LAST BREATH logosu
function sTitle(t) {
  screenFill(C.ground);
  if (IMG.keyArt) { ctx.save(); ctx.filter = "blur(6px)"; drawKeyArt(1.2 - .05 * p(t, 101, 115), .5, .5, .22); ctx.restore(); screenFill("rgba(11,10,12,.35)"); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "lighter";
  const gr = ctx.createRadialGradient(W / 2, H * 1.25, 0, W / 2, H * 1.25, H * .95); gr.addColorStop(0, "rgba(200,70,20,.3)"); gr.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
  embers(t, 110, win(t, 101, 115, 1)); fog(t, .8, "120,110,105");
  if (GAME_TITLE.placeholder) STAND.add("LAST BREATH logosu");
  // büyükten gelip oturur, hafif geri seker
  const s = t < 101.5 ? lerp(1.7, .965, eOut(p(t, 101, 101.5))) : lerp(.965, 1, eOut(p(t, 101.5, 101.95)));
  const maxW = 1500, sc = Math.min(maxW / GAME_TITLE.width, 380 / GAME_TITLE.height) * s, tw = GAME_TITLE.width * sc, th = GAME_TITLE.height * sc, [shx, shy] = impulse(t, [101.45], 16, .5);
  const cy = H / 2 - 40, a = win(t, 101, 115, .15);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.shadowColor = "rgba(0,0,0,.9)"; ctx.shadowBlur = 40;
  ctx.drawImage(GAME_TITLE, W / 2 - tw / 2 + shx, cy - th / 2 + shy, tw, th); ctx.restore();
  const lk = eOut(p(t, 102.3, 103.3)) * a; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.red; ctx.fillRect(W / 2 - 520 * lk, cy + 200, 1040 * lk, 3); ctx.restore();
  text("SON NEFES", W / 2 + 9, cy + 262, { size: 38, sp: 18, weight: 300, alpha: Math.min(a, p(t, 103.6, 104.4)), color: C.bone, blur: 10 });
  screenFill(`rgba(255,255,255,${1 - eOut(p(t, 101, 101.7))})`);
}

// 1:55–2:00 · kapanış
function sOutro(t) {
  screenFill("#000");
  const a = Math.min(p(t, 115.1, 115.7), 1 - p(t, 119.1, 119.9));
  drawLogo(ctx, W / 2, H / 2 - 60, 560, a);
  text("Şimdi tarayıcında oyna", W / 2, H / 2 + 150, { size: 36, sp: 8, weight: 400, alpha: a * p(t, 115.6, 116.2), color: C.bone, shadow: false });
}


/* =========================================================================
   SİNEMATİK SAHNELER — her plan farklı bir açı, lens ve hareket
   ========================================================================= */
function mixPose(a, b, k) { const o = {}; for (const key in a) o[key] = lerp(a[key], b[key], k); return o; }
const fadeIn = (t, a, d = .6) => whiteFlash(1 - p(t, a, a + d), "0,0,0");

/* 0:08–0:11.9 · oda: salgının ilk günü, TV'nin mavi ışığı, camda yağmur */
function sRoom(t) {
  const z = lerp(1, 1.12, eIO(p(t, 8, 11.9))), ox = (1 - z) * 1420, oy = (1 - z) * 600, fl = .7 + .3 * Math.sin(t * 37) * Math.sin(t * 11.3);
  const Z = (x, y) => [x * z + ox, y * z + oy];
  scr(); ctx.fillStyle = "#07080b"; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(z, 0, 0, z, ox, oy);
  ctx.save(); ctx.beginPath(); ctx.rect(240, 230, 400, 390); ctx.clip();
  const gr = ctx.createLinearGradient(0, 230, 0, 620); gr.addColorStop(0, "#0c1422"); gr.addColorStop(1, "#1d2941"); ctx.fillStyle = gr; ctx.fillRect(240, 230, 400, 390);
  ctx.drawImage(SKY_FAR, 600, 0, 1400, 420, 180, 400, 560, 168);
  ctx.strokeStyle = "rgba(170,190,220,.3)"; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let i = 0; i < 70; i++) { const x = 240 + rnd(i) * 400, y = 230 + ((rnd(i + .5) * 390 + t * (40 + 90 * rnd(i + .2))) % 390); ctx.moveTo(x, y); ctx.lineTo(x + .6, y + 10 + 14 * rnd(i + .9)); }
  ctx.stroke(); ctx.restore();
  ctx.strokeStyle = "#030304"; ctx.lineWidth = 18; ctx.strokeRect(240, 230, 400, 390); ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(440, 230); ctx.lineTo(440, 620); ctx.moveTo(240, 425); ctx.lineTo(640, 425); ctx.stroke();
  ctx.fillStyle = "#040405"; ctx.fillRect(-300, 820, W + 600, 500);
  ctx.fillStyle = "#050506"; ctx.fillRect(1180, 705, 480, 115); ctx.fillRect(1250, 470, 340, 240);
  roundRect(1276, 492, 288, 192, 18); ctx.save(); ctx.clip(); ctx.fillStyle = "#9fb4d6"; ctx.fillRect(1276, 492, 288, 192);
  ctx.globalAlpha = .55; ctx.globalCompositeOperation = "multiply"; ctx.drawImage(GRAIN[Math.floor(t * 30) % GRAIN.length], 1276, 492, 288, 192); ctx.restore();
  ctx.fillStyle = INK; ctx.fillRect(845, 590, 30, 232); ctx.fillRect(845, 752, 130, 26); ctx.fillRect(830, 700, 40, 20); ctx.fillRect(955, 740, 22, 82);
  fig(ctx, 900, 820, 1.35, 1, "ethan", pose(Object.assign(PS.sit(), { head: .08 + .03 * Math.sin(t) })), { noBandana: true, rims: [{ c: `rgba(150,185,240,${.75 * fl})`, dx: 3 }], t });
  const [tx, ty] = Z(1420, 588); glow(tx, ty, 1000 * z, "110,150,220", .3 * fl); glow(tx, ty, 260 * z, "190,215,255", .35 * fl);
  const [wx, wy] = Z(440, 425); glow(wx, wy, 500 * z, "70,100,150", .12);
  gradeS(.25); fadeIn(t, 8, .5);
}

/* 0:20–0:24.6 · vinç inişi: gökyüzünden sokağa, Ethan tek başına */
const CITY_BARRELS = [-520, 160, 640];
function sCityWide(t) {
  if (IMG.keyArt) {
    const k = p(t, 20, 24.6), [fx, fy] = CONFIG.keyArt.focus; drawKeyArt(lerp(1.04, 1.14, eIO(k)), fx, fy, 1, lerp(20, -20, k), 0);
    grade(.35, .16 * flick(t, 0)); fog(t, 1.1); embers(t, 70, .8); rain3(t, 1); fadeIn(t, 20, 1.2); return;
  }
  const k = eIO(p(t, 20, 24.6)); sv(lerp(-160, 120, p(t, 20, 24.6)), lerp(-780, -230, k), .82);
  const ls = street(t, { barrels: CITY_BARRELS, cars: [[-180, -1, .04], [420, 1, -.03]], lamps: [860] });
  L(1); const ex = -430 + (t - 20) * 55;
  fig(ctx, ex, 0, 1, 1, "ethan", PS.walk((t - 20) * 7.2), { t, weapon: "machete", rims: [RIM.fire(2.2), RIM.moon()] });
  streetTop(t, { barrels: CITY_BARRELS }, ls);
  const gy = P(1, 0, 0)[1]; fogBands(t, gy - 60, 140, .12); rain3(t, 1); splashes(t, gy, 1, 300); gradeS(.3, .05); fadeIn(t, 20, 1.2);
}

/* 0:24.6–0:26 · zemin seviyesi: botlar su birikintisine basıyor */
const STEPS = [24.75, 25.45];
function sBoots(t) {
  const ph = Math.PI / 2 + (t - 24.75) * Math.PI / .7, ex = (t - 24.6) * 100;
  sv(ex + 30, -40, 5);
  sky(t, { moon: false, clouds: false, top: "#05070b", hor: "#131a26" }); tile(SKY_MID_B, .5, 70);
  bokeh(t, [[320, 520, 110, "255,130,40", .45], [1560, 560, 80, "255,140,50", .35], [980, 470, 60, "170,195,230", .25], [180, 600, 50, "255,120,40", .3]]);
  ground(1);
  L(1); const px = 58;
  ctx.fillStyle = "rgba(35,55,85,.45)"; ell(ctx, px, 6, 150, 9);
  ctx.save(); ctx.globalCompositeOperation = "lighter"; const rg = ctx.createRadialGradient(px - 60, 6, 0, px - 60, 6, 120); rg.addColorStop(0, "rgba(255,130,40,.35)"); rg.addColorStop(1, "rgba(255,130,40,0)"); ctx.fillStyle = rg; ell(ctx, px - 60, 6, 120, 8); ctx.restore();
  STEPS.forEach((c, i) => {
    if (t < c) return; const k = p(t, c, c + 1.1), fx = (c - 24.6) * 100 + (i ? -36 : 36) + 36;
    ctx.strokeStyle = `rgba(170,195,230,${.5 * (1 - k)})`; ctx.lineWidth = 1.2; for (let r = 0; r < 3; r++) { const rr = (10 + 120 * eOut(k)) * (1 - r * .25); ctx.beginPath(); ctx.ellipse(fx, 5, rr, rr * .08, 0, 0, TAU); ctx.stroke(); }
    const kd = p(t, c, c + .5); if (kd < 1) for (let d = 0; d < 16; d++) { const an = -Math.PI * (.1 + .8 * rnd(d + i * 20)), v = 60 + 80 * rnd(d * 3 + i); ctx.fillStyle = `rgba(190,210,240,${.7 * (1 - kd)})`; circ(ctx, fx + Math.cos(an) * v * kd, 2 + Math.sin(an) * v * kd + 160 * kd * kd, 1.2); }
  });
  fig(ctx, ex, 0, 1, 1, "ethan", PS.walk(ph), { t, weapon: "machete", rims: [RIM.fire(-1.2)] });
  rain3(t, .9); splashes(t, P(1, 0, 0)[1], 1.2, 200); gradeS(.35);
}

/* 0:26–0:29.5 · orta plan: Ethan durur, başını kaldırır; nefesi buhar olur */
function sEthanMed(t) {
  const a = 1 - eIO(p(t, 26, 27.3)), ex = 140 + 50 * Math.min(t - 26, 1.3);
  const P1 = mixPose(PS.idle(t), PS.walk((t - 26) * 7.2, 1), a); P1.head = lerp(0, -.42, eIO(p(t, 27.4, 28.4))) + .02 * Math.sin(t * 1.3);
  sv(ex + 20, -150, lerp(2.6, 2.85, p(t, 26, 29.5)));
  sky(t, { moon: [1540, 190], hor: "#161e2c" }); tile(SKY_MID_B, .5, 70);
  bokeh(t, [[260, 640, 140, "255,130,40", .5], [620, 700, 90, "255,120,40", .35], [1700, 620, 70, "170,195,230", .2]]);
  ground(1); L(1);
  const f = fig(ctx, ex, 0, 1, 1, "ethan", P1, { t, weapon: "machete", rims: [{ c: "rgba(255,140,60,.9)", dx: -2.5 }, RIM.moon(2)] });
  const [hx, hy, s] = P(1, f.head[0] + 12, f.head[1] + 4); for (const b of [26.6, 28.1]) vapor(hx, hy, (t - b) / 1.2, 1, s * .35);
  rain3(t, 1.1); gradeS(.35, .05);
}

/* 0:29.5–0:32.5 · geniş plan: sisli sırtta ilerleyen siluetler, uzakta siren */
const ridgeY = x => -70 - 55 * Math.sin(x * .004) - 25 * Math.sin(x * .013 + 1);
function sHill(t) {
  sv(lerp(-120, 120, p(t, 29.5, 32.5)), -210, .9);
  sky(t, { moon: [720, 330], hor: "#1f283a", cloudY: 90 }); tile(SKY_FAR, .22, 230);
  const [x0, x1] = visX(.6); L(.6);
  const zs = [];
  for (let i = 0; i < 34; i++) { const span = x1 - x0, zx = x0 + ((rnd(i) * span + (t - 29) * 12 * (.6 + rnd(i * 2))) % span); zs.push([zx, i]); }
  zs.forEach(([zx, i]) => fig(ctx, zx, ridgeY(zx) + 4, .55, 1, i % 5 === 3 ? "runner" : i % 7 === 2 ? "tank" : "zombie", PS.shamble(t * 3 + i * 1.3, i), { t, scale: 1 }));
  ctx.fillStyle = "#06080b"; ctx.beginPath(); ctx.moveTo(x0, 600); for (let x = x0; x <= x1; x += 20) ctx.lineTo(x, ridgeY(x)); ctx.lineTo(x1, 600); ctx.fill();
  const [, ry] = P(.6, 0, -70); fogBands(t, ry + 40, 90, .2, "120,140,170", 30);
  const siren = (Math.sin(t * 5.5) > 0 ? 1 : .2) * win(t, 29.8, 32.5, .6); glow(W * .96, ry - 20, 700, "220,40,40", .25 * siren);
  ground(1); L(1); ctx.fillStyle = INK; for (let i = 0; i < 90; i++) { const x = visX(1)[0] + i * 26, h = 20 + 40 * rnd(i); ctx.beginPath(); ctx.moveTo(x - 4, 0); ctx.lineTo(x + Math.sin(t * 2 + i) * 4, -h); ctx.lineTo(x + 4, 0); ctx.fill(); }
  rain3(t, .7); gradeS(.35);
}

/* 0:32.5–0:35 · alçak açı: sürüklenen ayaklar kameranın önünden geçiyor */
function sFeet(t) {
  sv(0, -25, 5.5);
  sky(t, { moon: false, clouds: false, top: "#06070b", hor: "#171d29" }); tile(SKY_MID_B, .5, 70);
  const siren = Math.sin(t * 5.5) > 0 ? 1 : .2; glow(W * .85, 520, 500, "220,40,40", .22 * siren); bokeh(t, [[400, 560, 80, "255,130,40", .3]]);
  ground(1); L(1);
  for (let i = 0; i < 4; i++) { const x = -420 + (t - 32.5) * 55 + i * 190 - (i % 2) * 60; fig(ctx, x, 0, 1, 1, i === 2 ? "armored" : "zombie", PS.shamble(t * 3.2 + i * 2, i), { t, rims: [{ c: `rgba(220,50,40,${.6 * siren})`, dx: 2 }] }); }
  L(1.4); ctx.filter = "blur(7px)"; fig(ctx, -300 + (t - 32.5) * 160, 0, 1, 1, "zombie", PS.shamble(t * 3.6, 9), { t }); ctx.filter = "none";
  rain3(t, .8); splashes(t, P(1, 0, 0)[1], 1.1, 220); gradeS(.35);
}

/* 0:35–0:38 · tepeden (oyun içi): kalabalık */
function sTopCrowd(t) { sHorde(t - 5.5); }

/* 0:38–0:40.2 · ara sokak: saldırı, karanlıktan gelen tarama */
function alleyBG(t) {
  sky(t, { moon: false, clouds: false, top: "#07090d", hor: "#0f141c" });
  const [x0, x1] = visX(.85); L(.85);
  ctx.fillStyle = "#0b0d11"; ctx.fillRect(x0, -900, x1 - x0, 900);
  ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 1.5; for (let y = -900; y < 0; y += 24) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
  ctx.fillStyle = "#07080a"; ctx.fillRect(-620, -140, 180, 140); ctx.fillRect(-630, -150, 200, 14); ctx.fillRect(420, -520, 14, 520); ctx.fillRect(420, -520, 180, 12);
  ctx.fillStyle = "rgba(255,170,90,.55)"; ctx.fillRect(-140, -560, 70, 90);
  const [wx, wy] = P(.85, -105, -515); glow(wx, wy, 260, "255,150,70", .25);
  ground(1);
}
function sAlley(t) {
  const shots = [38.05, 38.12, 38.19];
  sv(-40, -150, 1.9, impulse(t, shots, 8, .25)); alleyBG(t); L(1);
  const hit = 38.12, fk = p(t, hit, hit + .6), zx = t < hit ? lerp(-300, -120, eOut(p(t, 37.9, hit))) : -120 - 50 * eOut(fk);
  const zp = t < hit ? PS.lunge(.9) : mixPose(PS.lunge(.9), pose({ lean: -.2, head: -.5, sL: 2.4, eL: .2, sR: 2, eR: .3, hL: .6, kL: .1, hR: -.2, kR: .5 }), eOut(fk));
  const zf = fig(ctx, zx, 0, 1, 1, "runner", zp, { t, rot: -eIn(fk) * 1.45, eyes: t < hit ? .8 : .8 * (1 - fk) });
  const turn = t > 39.05, ep = turn ? PS.idle(t) : PS.swing(.12);
  fig(ctx, 60, 0, 1, turn ? 1 : -1, "ethan", ep, { t, weapon: "machete", rims: [{ c: `rgba(255,190,110,${.3 + .7 * pulseAt(t, shots, .08)})`, dx: turn ? 3 : -3 }, RIM.moon(turn ? -2 : 2)] });
  const [cx, cy] = P(1, zf.neck[0], zf.neck[1] + 20);
  shots.forEach((s, i) => { const k = 1 - p(t, s, s + .06); if (t >= s && k > 0) { tracerS(W + 40, cy - 30 + i * 10, cx, cy + i * 8, k); glow(W - 20, cy - 30, 520, "255,190,110", .5 * k); } });
  L(1); bloodSpray(ctx, zf.neck[0], zf.neck[1] + 10, (t - hit) / .7, 7, -1, 30);
  rain3(t, .8); splashes(t, P(1, 0, 0)[1], .8, 200); gradeS(.35);
}

/* 0:40.2–0:42.6 · Sarah karanlıktan çıkar, fener ışığı Ethan'da */
function sSarahReveal(t) {
  sv(60, -150, 1.75); alleyBG(t); L(1);
  const k = p(t, 40.2, 41.3), sx = lerp(430, 200, eOut(k)), sp = mixPose(PS.walk((t - 40.2) * 7, 1), PS.aim(0), eIO(p(t, 40.9, 41.4)));
  const sh = eIO(p(t, 40.5, 40.9));
  fig(ctx, -220, 0, 1, 1, "ethan", mixPose(PS.idle(t), PS.shield(t), sh), { t, weapon: "machete", rims: [RIM.white(3.5)] });
  const f = fig(ctx, sx, 0, 1, -1, "sarah", sp, { t, weapon: "smg", rims: [RIM.fire(3)] });
  const [mx, my] = P(1, f.muzzle[0], f.muzzle[1]);
  beam(mx, my, Math.PI + (Math.PI / 2 - f.aim) * -1 * 0 + .02, 1500, .13, .5); flare(mx, my, .55 + .1 * Math.sin(t * 20));
  rain3(t, .9); gradeS(.3);
}

/* 0:42.6–0:45.4 · omuz üstü: Sarah ön planda, Ethan fenerin ışığında */
function sOTS(t) {
  sv(-40, -160, 1.6); alleyBG(t); L(1);
  const lower = eIO(p(t, 44.2, 45));
  fig(ctx, -140, 0, 1, 1, "ethan", mixPose(PS.shield(t), PS.idle(t), lower), { t, weapon: "machete", rims: [RIM.white(4)] });
  const [ex, ey] = P(1, -140, -110); glow(ex, ey, 380, "220,230,255", .22);
  L(1.55); ctx.filter = "blur(5px)"; const f = fig(ctx, 135, -60, 1.15, -1, "sarah", PS.aim(0), { t, weapon: "smg", rims: [RIM.fire(4)] }); ctx.filter = "none";
  const [mx, my] = P(1.55, f.muzzle[0], f.muzzle[1]); beam(mx, my, Math.PI - .06, 1600, .14, .45); flare(mx, my, .5);
  rain3(t, .9); gradeS(.3);
}

/* 0:45.4–0:48.2 · profil iki kişilik plan: Sarah silahını indirir */
function sTwoShot(t) {
  sv(0, -165, 1.55);
  sky(t, { moon: [1500, 200] }); tile(SKY_MID_B, .5, 70);
  const [bx, by] = P(.7, 0, -80); L(.7); barrelS(ctx, 0); fireS(ctx, 0, t, 5); glow(bx, by, 520, "255,130,40", .5 * flick(t, 5));
  ground(1); L(1);
  fig(ctx, -160, 0, 1, 1, "ethan", PS.idle(t), { t, weapon: "machete", rims: [RIM.fire(2.5), RIM.moon(-2)] });
  const f = fig(ctx, 160, 0, 1, -1, "sarah", PS.aimLow(eIO(p(t, 45.9, 47))), { t, weapon: "smg", rims: [{ c: "rgba(255,140,60,.95)", dx: -2.5 }, RIM.moon(2)] });
  const [ex, ey, s] = P(1, -160 + 18, -150); vapor(ex, ey, (t - 46.2) / 1.2, 1, s * .3);
  lights([{ d: .7, x: 0, y: -80, r: 400, c: "255,130,40", a: .3, rl: 500 }]);
  rain3(t, .9); splashes(t, P(1, 0, 0)[1], 1, 260); gradeS(.3, .05);
}

/* 0:48.2–0:52 · tepeden (oyun içi): sırt sırta, halka daralıyor */
const RING = Array.from({ length: 14 }, (_, i) => ({ th: i / 14 * TAU + rnd(i) * .3, s0: 47.4 + rnd(i * 2) * 1.6, kind: i % 4 === 1 ? "runner" : i % 5 === 2 ? "armored" : "zombie", seed: i + 60 }));
function sBackTop(t) {
  const k = eIO(p(t, 48.3, 49.3)), E = [0, -22], S = [0, 22], ea = lerp(.5, -Math.PI / 2, k), sa = lerp(Math.PI - .4, Math.PI / 2, k), shots = [50.2, 50.9, 51.5];
  setCam(0, 0, lerp(1.5, 1.1, eIO(p(t, 48.2, 52))), lerp(0, .45, eIO(p(t, 48.2, 52))), impulse(t, shots, 6, .2));
  screenFill("#000"); applyCam(ctx); drawMap(CITY, -700, 300);
  for (const z of RING) { if (t < z.s0) continue; const r = lerp(900, 300, eOut(p(t, z.s0, z.s0 + 3.4))); drawChar(ctx, Math.cos(z.th) * r, Math.sin(z.th) * r, z.th + Math.PI, z.kind, { walk: t * 6 + z.seed, seed: z.seed }); }
  const rec = pulseAt(t, shots, .18);
  drawChar(ctx, E[0], E[1], ea, "ethan", { weapon: "shotgun", recoil: rec }); drawChar(ctx, S[0], S[1], sa, "sarah", { weapon: "smg" });
  lightPass("rgba(2,5,11,0.88)", [{ x: E[0], y: E[1], r: 700, i: .8, cone: .36, a: ea, c: "210,220,240", ca: .08 }, { x: S[0], y: S[1], r: 700, i: .8, cone: .36, a: sa, c: "210,220,240", ca: .08 }, { x: 0, y: 0, r: 200, i: .35 }, { x: 0, y: -60, r: 650, i: pulseAt(t, shots, .1), c: "255,190,90" }]);
  applyCam(ctx); shots.forEach(s => { const kk = 1 - p(t, s, s + .08); if (t >= s && kk > 0) muzzle(ctx, E[0] + Math.cos(ea) * 62, E[1] + Math.sin(ea) * 62, ea, kk); });
  rain(t, .8); fog(t, 1.1);
}

/* 0:52–0:56.6 · Kartal Üssü geniş plan: tel örgü, kuleler, projektörler */
const BASE_TOWERS = [-260, 720];
function sBaseWide(t) {
  sv(lerp(-260, 160, p(t, 52, 56.6)), -240, .85);
  sky(t, { moon: [1660, 190], hor: "#172030" }); tile(SKY_FAR, .22, 170);
  L(.55); hangarS(ctx, -700, 640, 250); hangarS(ctx, 320, 520, 220);
  const heads = BASE_TOWERS.map(x => towerS(ctx, x));
  [[-60, -40], [560, -30]].forEach(([x, y], i) => { ctx.fillStyle = "#0a0b0c"; ctx.fillRect(x - 50, -60, 100, 60); const [gx, gy] = P(.55, x + 40, y - 30); if (Math.sin(t * 6 + i * 2) > 0) glow(gx, gy, 40, "255,50,40", .9); L(.55); });
  heads.forEach(([hx, hy], i) => { const [sx, sy] = P(.55, hx, hy); beam(sx, sy, Math.PI / 2 + .75 * Math.sin(t * .55 + i * 2.2), 1700, .08, .4); glow(sx, sy, 70, "240,245,255", .9); });
  const [, fy] = P(.55, 0, -60); fogBands(t, fy, 120, .22, "110,130,160", 25);
  ground(1); const [x0, x1] = visX(1); L(1); posts(ctx, x0, x1, 210, 180);
  rain3(t, .6); gradeS(.35);
}

/* 0:56.6–0:59.6 · detay: kayıt cihazı — Warren'ın sesi */
function sTape(t) {
  const z = lerp(1, 1.1, eIO(p(t, 56.6, 59.6))), talk = DIALOG.some(d => d.kind === "rec" && t >= d.a && t < d.b);
  scr(); ctx.fillStyle = "#060607"; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(z, 0, 0, z, (1 - z) * W / 2, (1 - z) * H / 2);
  ctx.fillStyle = "#0e0b08"; ctx.fillRect(-100, 640, W + 200, 500); ctx.strokeStyle = "rgba(0,0,0,.5)"; ctx.lineWidth = 2; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(-100, 660 + i * 22); ctx.bezierCurveTo(600, 650 + i * 22 + 10 * Math.sin(i), 1300, 670 + i * 22, W + 100, 660 + i * 22); ctx.stroke(); }
  roundRect(520, 400, 880, 330, 20); ctx.fillStyle = "#131417"; ctx.fill(); ctx.strokeStyle = "#26282d"; ctx.lineWidth = 3; ctx.stroke();
  [[740, 530, 1], [1180, 530, 1.18]].forEach(([x, y, sp], i) => {
    ctx.fillStyle = "#1c1612"; circ(ctx, x, y, i ? 70 : 108); ctx.fillStyle = "#2a2c30"; circ(ctx, x, y, 40); ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2.6 * sp);
    ctx.fillStyle = "#131417"; for (let k = 0; k < 3; k++) { ctx.rotate(TAU / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 34, -.35, .35); ctx.fill(); } ctx.fillStyle = "#3a3c42"; circ(ctx, 0, 0, 8); ctx.restore();
  });
  ctx.strokeStyle = "#1c1612"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(740, 638); ctx.lineTo(960, 680); ctx.lineTo(1180, 600); ctx.stroke();
  ctx.fillStyle = "#b9ab88"; ctx.fillRect(900, 640, 150, 62); ctx.strokeStyle = "#111"; ctx.lineWidth = 2; ctx.strokeRect(900, 640, 150, 62);
  const lvl = talk ? .35 + .55 * Math.abs(Math.sin(t * 13) * Math.sin(t * 7.7 + 1)) : .05, na = -1.1 + lvl * 2.1;
  ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(975, 700); ctx.lineTo(975 + Math.sin(na) * 52, 700 - Math.cos(na) * 52); ctx.stroke();
  const led = Math.sin(t * 5) > -.4, lx = 600 * z + (1 - z) * W / 2, ly = 690 * z + (1 - z) * H / 2;
  ctx.fillStyle = led ? "#ff3a2a" : "#3a0d0a"; circ(ctx, 600, 690, 8);
  if (led) glow(lx, ly, 60, "255,50,30", .7);
  beam(260, -60, 1.05, 1400, .3, .22, "255,215,160");
  scr(); ctx.globalCompositeOperation = "lighter"; for (let i = 0; i < 70; i++) { const x = 250 + ((rnd(i) * 900 + t * 12 * (rnd(i * 2) - .3)) % 900), y = 60 + ((rnd(i * 3) * 700 + t * 8) % 700); ctx.fillStyle = `rgba(255,230,190,${.25 * rnd(i * 5)})`; ctx.fillRect(x, y, 2, 2); } ctx.globalCompositeOperation = "source-over";
  gradeS(.2);
}

/* 0:59.6–1:03.9 · çitin dibinde: projektör üstlerinden geçer, eğilirler */
function sFencePair(t) {
  sv(-60, -120, 2);
  sky(t, { moon: [1500, 180], hor: "#141b27" }); tile(SKY_FAR, .22, 170);
  L(.5); hangarS(ctx, 200, 700, 260); const [hx, hy] = towerS(ctx, 820, 460);
  const [sx, sy] = P(.5, hx, hy), ba = lerp(2.0, 2.95, eIO(p(t, 60.6, 62.9))); beam(sx, sy, ba, 2200, .07, .5); glow(sx, sy, 60, "240,245,255", .9);
  const [x0, x1] = visX(.8); L(.8); posts(ctx, x0, x1, 230, 200);
  ground(1); L(1);
  const duck = win(t, 61.2, 62.6, .35), lit = win(t, 61.4, 62.3, .25);
  fig(ctx, -150, 0, 1, 1, "ethan", PS.crouch(.55 + .4 * duck), { t, weapon: "machete", rims: [{ c: `rgba(235,240,255,${.3 + .7 * lit})`, dx: 3 }] });
  fig(ctx, -40, 0, 1, 1, "sarah", PS.crouch(.5 + .4 * duck, 1), { t, weapon: "smg", rims: [{ c: `rgba(235,240,255,${.3 + .7 * lit})`, dx: 3 }] });
  L(1.12); sandbags(ctx, -300, 9, 2);
  const [, fy] = P(.8, 0, -40); fogBands(t, fy, 80, .18, "110,130,160");
  whiteFlash(.06 * lit, "220,230,255"); rain3(t, .7); gradeS(.35);
}

/* 1:03.9–1:05 · projektör dev bir gölgeyi buluyor: Denek 7 */
function sDenek(t) {
  sv(0, -300, .78, impulse(t, [64.2], 14, .7));
  sky(t, { moon: false, top: "#05070b", hor: "#141a26" }); tile(SKY_FAR, .22, 170);
  L(.6); const rise = eOut(p(t, 63.9, 64.7));
  const f = fig(ctx, 180, lerp(160, 0, rise), 3, -1, "denek", PS.roar(eIO(p(t, 64.2, 64.95))), { t, eyes: p(t, 64.1, 64.3) });
  hangarS(ctx, 60, 760, 280);
  const [tx, ty] = P(.6, -760, -470), [dx, dy] = P(.6, f.head[0], f.head[1]), target = Math.atan2(dy - ty, dx - tx);
  const a = lerp(target + .7, target, eIO(p(t, 63.9, 64.15)));
  L(.6); towerS(ctx, -760, 440); beam(tx, ty, a, 2400, .07, .55); glow(tx, ty, 70, "240,245,255", 1);
  if (t > 64.1) glow(dx, dy, 300, "255,40,30", .25 * p(t, 64.1, 64.4));
  const [, fy] = P(.6, 0, -30); fogBands(t, fy, 100, .22, "110,130,160");
  ground(1); rain3(t, .7); gradeS(.35); whiteFlash(.25 * (1 - p(t, 64.2, 64.35)), "255,255,255");
}

/* =========================================================================
   1:05–1:30 · AKSİYON MONTAJI — 26 farklı plan + 5 kart, müzik vuruşlarına oturur
   ========================================================================= */
const MONTAGE_ORDER = ["swingWide", "swingClose", "shotgunTop", "shellInsert", "barrelWide", "C:12 SİLAH", "barrelClose", "tankStomp", "tankRoar", "runnersSide", "runnersTop", "C:12 DÜŞMAN",
  "shamanSide", "shamanTop", "sarahProfile", "casings", "armoredSparks", "C:3 BÖLÜM", "smgTop", "lightningHill", "dash", "katana", "C:KUŞATMA", "barricade", "zombieEyes",
  "rocketSide", "rocketImpact", "chainTop", "backToBack", "C:SONSUZ MOD", "endless"];
let MONTAGE = [];
function buildMontage(onsets) {
  const a = 65, end = 89.4, n = MONTAGE_ORDER.length, step = (end - a) / n, cuts = [a];
  for (let i = 1; i < n; i++) {
    let x = a + i * step;
    if (onsets) { const near = onsets.filter(o => Math.abs(o - x) < .22).sort((p1, p2) => Math.abs(p1 - x) - Math.abs(p2 - x))[0]; if (near !== undefined) x = near; }
    x = Math.max(x, cuts[cuts.length - 1] + .4); cuts.push(x);
  }
  cuts.push(end);
  MONTAGE = MONTAGE_ORDER.map((nm, i) => Object.assign({ a: cuts[i], b: cuts[i + 1], seed: i * 7 + 3 }, nm.startsWith("C:") ? { card: nm.slice(2) } : { type: nm }));
  MONTAGE.push({ a: end, b: 90, type: "finalStrike", seed: 999 });
}
const TOPMAP = { shotgunTop: "shotgun", runnersTop: "horde", shamanTop: "shaman", chainTop: "barrels", smgTop: "smg" };
const MS = {
  swingWide(sg, u, t) {
    const hit = .14; sv(-10, -150, 1.3, impulse(u, [hit], 12, .3));
    const ls = street(t, { barrels: [-430], cars: [[330, -1, .03]] }); L(1);
    const fk = p(u, hit, hit + .55), zf = fig(ctx, 40 + 70 * eOut(fk), 0, 1, -1, "zombie", u < hit ? PS.lunge(.7) : PS.shamble(3, 1), { t, rot: -eIn(fk) * 1.3, rims: [RIM.fire(-2)] });
    fig(ctx, -80, 0, 1, 1, "ethan", PS.swing(p(u, 0, hit + .04)), { t, weapon: "machete", rims: [RIM.fire(-2.5), RIM.moon(2)] });
    bloodSpray(ctx, zf.neck[0], zf.neck[1], (u - hit) / .6, sg.seed, 1, 30);
    streetTop(t, { barrels: [-430] }, ls);
    const [sx, sy, s] = P(1, -60, -130), ak = p(u, hit - .08, hit + .15);
    if (ak > 0 && ak < 1) { scr(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"; for (let i = 0; i < 5; i++) { ctx.strokeStyle = `rgba(255,${235 - i * 25},${225 - i * 30},${(1 - ak) * (.8 - i * .14)})`; ctx.lineWidth = (14 - i * 2.4) * s; ctx.beginPath(); ctx.arc(sx, sy, (78 + i * 5) * s, -2.2, -2.2 + 2.9 * Math.min(1, ak * 2)); ctx.stroke(); } }
    rain3(t, 1); gradeS(.3, .05);
  },
  swingClose(sg, u, t) {
    const hit = .06; sv(10, -150, 4.2, impulse(u, [hit], 20, .3));
    sky(t, { moon: false, clouds: false, top: "#05070b", hor: "#141a26" }); tile(SKY_MID_B, .5, 70); bokeh(t, [[300, 600, 120, "255,130,40", .4], [1500, 500, 90, "170,195,230", .2]]);
    L(1); const fk = p(u, hit, hit + .5);
    const zf = fig(ctx, 50, 0, 1, -1, "zombie", mixPose(PS.shamble(2, 1), pose({ lean: -.4, head: -.9, sL: 2, eL: .3, sR: 1.2, eR: .2 }), eOut(fk)), { t, eyes: .8 * (1 - fk), rims: [RIM.fire(-2)] });
    const ak = p(u, 0, .2); scr(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
    if (ak < 1) for (let i = 0; i < 6; i++) { ctx.strokeStyle = `rgba(255,${240 - i * 25},${230 - i * 30},${(1 - ak) * (.85 - i * .13)})`; ctx.lineWidth = 40 - i * 6; ctx.beginPath(); ctx.arc(W * .35, H * .9, 700 + i * 12, -1.3 + ak * .5, -.2 + ak * .4); ctx.stroke(); }
    L(1); bloodSpray(ctx, zf.head[0], zf.head[1], (u - hit) / .6, sg.seed, 1, 40, 1.3);
    scr(); for (let i = 0; i < 8; i++) { const k = p(u, hit, hit + .5), x = W * .55 + (rnd(i + sg.seed) - .3) * 900 * k, y = H * .45 + (rnd(i * 3) - .6) * 600 * k + 400 * k * k, r = (4 + 26 * k) * (.5 + rnd(i * 5)); if (k > 0 && k < 1) { ctx.fillStyle = `rgba(110,8,10,${.9 * (1 - k)})`; circ(ctx, x, y, r); } }
    rain3(t, 1.1); gradeS(.35);
  },
  shellInsert(sg, u, t) {
    sv(0, -60, 1); scr(); ctx.fillStyle = "#050608"; ctx.fillRect(0, 0, W, H);
    bokeh(t, [[1500, 420, 200, "255,130,40", .35], [400, 700, 120, "255,150,60", .25]]);
    const pk = u < .12 ? eOut(u / .12) : 1 - eIO(p(u, .22, .34)), cx = W / 2 - 80, cy = H / 2 + 40;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.04);
    ctx.shadowColor = "rgba(255,150,70,.55)"; ctx.shadowBlur = 18; ctx.fillStyle = "#16181d"; ctx.fillRect(-620, -26, 900, 34); ctx.fillRect(-620, 12, 700, 26); ctx.fillStyle = "#2a1f15"; ctx.fillRect(-900, -20, 300, 70); ctx.shadowBlur = 0;
    ctx.fillStyle = "#23252b"; ctx.fillRect(-120 - pk * 130, 14, 260, 40); ctx.fillStyle = "rgba(255,170,90,.35)"; ctx.fillRect(-120 - pk * 130, 14, 260, 3); ctx.strokeStyle = "rgba(255,160,80,.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-620, -26); ctx.lineTo(280, -26); ctx.stroke();
    ctx.restore();
    const ek = p(u, .1, sg.b - sg.a);
    if (ek > 0) { const x = cx + 120 + ek * 520, y = cy - 40 - 480 * ek + 700 * ek * ek; ctx.save(); ctx.translate(x, y); ctx.rotate(ek * 9); ctx.fillStyle = "#8a1a16"; ctx.fillRect(-40, -13, 62, 26); ctx.fillStyle = "#c79a4a"; ctx.fillRect(22, -14, 22, 28); ctx.fillStyle = "rgba(255,220,180,.35)"; ctx.fillRect(-40, -13, 84, 5); ctx.restore(); glow(x, y, 90, "255,190,110", .25); }
    for (let i = 0; i < 6; i++) { const k = p(u, .1, .1 + .6), x = cx + 90 + i * 14 + k * 90, y = cy - 30 - k * 220 - i * 20; if (k > 0 && k < 1) glow(x, y, 50 + 60 * k, "150,150,160", .08 * (1 - k)); }
    gradeS(.25);
  },
  barrelWide(sg, u, t) {
    const ex = [.03, .15, .27], B = [-360, 0, 360]; sv(0, -210, .95, impulse(u, ex, 16, .5));
    const ls = street(t, { cars: [[-620, 1, .02]] }); L(1);
    B.forEach((x, i) => { if (u < ex[i]) { barrelS(ctx, x); fireS(ctx, x, t, i); } });
    for (let i = 0; i < 7; i++) { const bi = i % 3, x0 = B[bi] + (rnd(i + sg.seed) - .5) * 180, e = ex[bi], k = p(u, e, e + .7), side = x0 < B[bi] ? -1 : 1;
      fig(ctx, x0 + side * 260 * eOut(k), -Math.sin(k * Math.PI) * 180 * (k < 1 ? 1 : 0), 1, side > 0 ? -1 : 1, i % 3 ? "zombie" : "runner", u < e ? PS.shamble(t * 3 + i, i) : pose({ lean: .3, head: .4, sL: 2.5, eL: .3, sR: 2, eR: .4, hL: .8, kL: .8, hR: -.5, kR: .9 }), { t, rot: -side * 2.6 * eOut(k) * (side > 0 ? -1 : 1), rims: [RIM.fire(side * -3)] }); }
    B.forEach((x, i) => fireball(ctx, x, -40, (u - ex[i]) / .8, i * 40 + sg.seed, 1.1));
    lights(ls); ex.forEach((e, i) => { const [x, y] = P(1, B[i], -60), k = 1 - p(u, e, e + .8); if (u > e) { glow(x, y, 900 * k, "255,140,50", .6 * k); flare(x, y, k * .8, "255,190,120"); } });
    rain3(t, .6); gradeS(.25, .1);
  },
  barrelClose(sg, u, t) {
    const e = .04; sv(0, -110, 2.6, impulse(u, [e], 26, .7));
    street(t, { blur: true }); L(1);
    const k = p(u, e, e + .8);
    if (u < e) { barrelS(ctx, 60); fireS(ctx, 60, t, 3); }
    fig(ctx, -40 - 380 * eOut(k), -Math.sin(Math.min(1, k) * Math.PI) * 150, 1, 1, "zombie", u < e ? PS.shamble(t * 3, 2) : pose({ lean: -.3, head: -.4, sL: 2.6, eL: .3, sR: 2.2, eR: .4, hL: .9, kL: .9, hR: -.4, kR: .8 }), { t, rot: -2.4 * eOut(k), rims: [RIM.fire(3.5)] });
    fireball(ctx, 60, -40, (u - e) / .7, sg.seed, 2.2);
    const [x, y] = P(1, 60, -60); if (u > e) { glow(x, y, 1400 * (1 - k * .6), "255,150,60", .8 * (1 - k)); flare(x, y, 1.2 * (1 - k), "255,200,140"); }
    scr(); for (let i = 0; i < 14; i++) { const kk = p(u, e, e + .5); if (kk <= 0 || kk >= 1) continue; const an = rnd(i + sg.seed) * TAU, d = kk * (400 + 900 * rnd(i * 3)), sz = 4 + 30 * kk * rnd(i); ctx.save(); ctx.translate(x + Math.cos(an) * d, y + Math.sin(an) * d * .7); ctx.rotate(kk * 8 + i); ctx.fillStyle = "#050505"; ctx.fillRect(-sz, -sz * .3, sz * 2, sz * .6); ctx.restore(); }
    whiteFlash(.5 * (1 - p(u, e, e + .12)), "255,230,200"); gradeS(.2, .15);
  },
  tankStomp(sg, u, t) {
    const st = .1; sv(0, -70, 3.6, impulse(u, [st], 30, .6));
    sky(t, { moon: false, clouds: false, top: "#05070b", hor: "#131924" }); tile(SKY_MID_B, .5, 70); bokeh(t, [[1500, 560, 100, "255,130,40", .35]]);
    ground(1); L(1);
    ctx.fillStyle = "rgba(35,55,85,.45)"; ell(ctx, 30, 6, 170, 10);
    const lift = u < st ? Math.sin(u / st * Math.PI / 2) : 0, P1 = pose({ lean: .15, hR: .55 - lift * .1, kR: .2 + lift * .9, hL: -.25, kL: .1, sL: .6, sR: .2 });
    P1.hipY = -lift * 30;
    fig(ctx, -40, 0, 1.7, 1, "tank", P1, { t, rims: [RIM.moon(2)] });
    const k = p(u, st, st + .7);
    if (u > st) { ctx.strokeStyle = `rgba(160,180,210,${.6 * (1 - k)})`; ctx.lineWidth = 2; for (let r = 0; r < 3; r++) { ctx.beginPath(); ctx.ellipse(60, 6, (20 + 260 * eOut(k)) * (1 - r * .2), (2 + 14 * eOut(k)) * (1 - r * .2), 0, 0, TAU); ctx.stroke(); }
      for (let i = 0; i < 40; i++) { const an = -Math.PI * rnd(i + sg.seed), v = 100 + 200 * rnd(i * 3), kk = p(u, st, st + .6); if (kk < 1) { ctx.fillStyle = `rgba(180,200,230,${.8 * (1 - kk)})`; circ(ctx, 60 + Math.cos(an) * v * kk, Math.sin(an) * v * kk * .8 + 250 * kk * kk, 1.6); } }
      for (let i = 0; i < 8; i++) { const cx = 60 + (rnd(i * 2 + sg.seed) - .5) * 300 * k, cy = -20 - 40 * k * rnd(i), r = 40 + 120 * k; const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(90,85,80,${.35 * (1 - k)})`); gr.addColorStop(1, "rgba(90,85,80,0)"); ctx.fillStyle = gr; circ(ctx, cx, cy, r); } }
    rain3(t, 1.2); gradeS(.35);
  },
  tankRoar(sg, u, t) {
    const fl = pulseAt(u, [.04, .16], .12); sv(0, -250, 1.8);
    sky(t, { moon: false, top: fl > 0 ? "#1b2233" : "#05070b", hor: "#252f45" }); whiteFlash(fl * .5, "200,210,255");
    tile(SKY_FAR, .22, 170); ground(1); L(1);
    const f = fig(ctx, 0, 0, 1.75, -1, "tank", PS.roar(eOut(p(u, 0, .25))), { t, eyes: .9, rims: [{ c: `rgba(200,215,255,${.4 + .6 * fl})`, dx: 3 }, { c: `rgba(200,215,255,${.4 + .6 * fl})`, dx: -3 }] });
    const [hx, hy, s] = P(1, f.head[0] - 10, f.head[1] - 10); vapor(hx, hy, p(u, .05, .6), -1, s * .8);
    bolt(sg.seed, W * .75, 0, H * .55, fl); rain3(t, 1.4); gradeS(.35);
  },
  runnersSide(sg, u, t) {
    const cx = -u * 900; sv(cx, -150, 1.3);
    const ls = street(t, { lamps: [-300], cars: [[-900, 1]] }); L(1);
    for (let i = 0; i < 7; i++) { const x = 600 - u * (900 + 250 * rnd(i)) + i * 150 - 300, ph = t * 13 + i * 1.7, P1 = PS.run(ph);
      for (let gh = 3; gh > 0; gh--) fig(ctx, x + gh * 26, 0, 1, -1, "runner", PS.run(ph - gh * .25), { t, alpha: .12 * (4 - gh) / 3 });
      fig(ctx, x, 0, 1, -1, "runner", P1, { t, eyes: .7, rims: [RIM.moon(-2)] }); }
    lights(ls); rain3(t, 1, .35); gradeS(.3);
  },
  shamanSide(sg, u, t) {
    sv(0, -170, 1.6); const k = eOut(p(u, 0, .3)), pulse = .75 + .25 * Math.sin(t * 14);
    sky(t, { moon: false, top: "#07040d", hor: "#1b1230" }); tile(SKY_MID_B, .5, 70); ground(1, { c1: "#0d0a14" });
    const [gx, gy] = P(1, 0, 0); glow(gx, gy, 700, "150,80,255", .35 * pulse * k);
    L(1); ctx.strokeStyle = `rgba(190,120,255,${.8 * k * pulse})`; ctx.lineWidth = 3; for (let i = 0; i < 7; i++) { const a0 = (i / 7 - .5) * 2.2; ctx.beginPath(); ctx.moveTo(0, 2); let x = 0, y = 2; for (let s = 0; s < 6; s++) { x += Math.sin(a0) * 40 + (rnd(i * 9 + s) - .5) * 30; y += 3; ctx.lineTo(x, y); } ctx.stroke(); }
    ctx.save(); ctx.beginPath(); ctx.rect(-3000, -3000, 6000, 3000); ctx.clip();
    [[-260, .05], [240, .15], [-470, .25]].forEach(([x, d], i) => { const r = eOut(p(u, d, d + .5)); fig(ctx, x, lerp(190, 0, r), 1, x < 0 ? 1 : -1, "zombie", pose({ lean: .1, head: .3, sL: 2.6, eL: .2, sR: 2.2, eR: .4 }), { t, eyes: r, rims: [RIM.purple(x < 0 ? 3 : -3)] }); });
    ctx.restore();
    const f = fig(ctx, 0, 0, 1.1, 1, "shaman", PS.staff(k), { t, eyes: .9, rims: [RIM.purple(2.5), RIM.purple(-2.5)] });
    const [ox, oy] = P(1, f.muzzle[0], f.muzzle[1]); glow(ox, oy, 160, "200,130,255", .8 * pulse); flare(ox, oy, .6 * pulse, "200,150,255");
    scr(); ctx.globalCompositeOperation = "lighter"; for (let i = 0; i < 50; i++) { const f2 = (t * .6 + rnd(i)) % 1; ctx.fillStyle = `rgba(200,140,255,${(1 - f2) * .7})`; ctx.fillRect(gx + (rnd(i * 3) - .5) * 900, gy - f2 * 500, 2.5, 2.5); } ctx.globalCompositeOperation = "source-over";
    fogBands(t, gy - 30, 80, .18, "120,80,170"); gradeS(.2);
  },
  sarahProfile(sg, u, t) {
    const shots = [0, .07, .14, .21, .28, .35, .42, .49, .56], fk = pulseAt(u, shots, .045); sv(40, -150, 2.5);
    sky(t, { moon: false, clouds: false }); tile(SKY_MID_B, .5, 70); ground(1); L(1);
    const f = fig(ctx, 0, 0, 1, 1, "sarah", PS.aim(fk), { t, weapon: "smg", whip: Math.sin(t * 30) * 4, rims: [{ c: `rgba(255,200,120,${.2 + .8 * fk})`, dx: 3 }, RIM.moon(-2)] });
    const [mx, my] = P(1, f.muzzle[0], f.muzzle[1]); muzzleS(mx, my, 0, fk, 1.2); glow(mx, my, 600, "255,190,110", .35 * fk);
    shots.forEach((s, i) => { const k = p(u, s, s + .5); if (k > 0 && k < 1) { const [x, y] = P(1, f.hand[0] + 10 + k * 90, f.hand[1] - 20 - 160 * k + 330 * k * k); scr(); ctx.save(); ctx.translate(x, y); ctx.rotate(k * 12 + i); ctx.fillStyle = "#c79a4a"; ctx.fillRect(-7, -3, 14, 6); ctx.restore(); } });
    rain3(t, .9); gradeS(.3);
  },
  casings(sg, u, t) {
    scr(); ctx.fillStyle = "#040405"; ctx.fillRect(0, 0, W, H); const gy = H * .72;
    bokeh(t, [[W * .7, H * .35, 260 * (.5 + pulseAt(u, [0, .1, .2, .3, .4], .05)), "255,190,110", .5], [W * .3, H * .4, 140, "255,140,60", .2]]);
    const gr = ctx.createLinearGradient(0, gy, 0, H); gr.addColorStop(0, "#0c0f14"); gr.addColorStop(1, "#040405"); ctx.fillStyle = gr; ctx.fillRect(0, gy, W, H - gy);
    for (let i = 0; i < 7; i++) { const t0 = i * .06, k = clamp((u - t0) * 1.3), x = W * (.25 + .09 * i) + k * 60, yfall = BAR + 10 + k * (gy - BAR) * 1.4; if (u < t0) continue;
      let y = Math.min(yfall, gy - 12), rot = k * 7 + i; if (yfall > gy - 12) { const b = (yfall - gy + 12) / 200; y = gy - 12 - Math.abs(Math.sin(b * 6)) * 60 * Math.exp(-b * 3); }
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const cg = ctx.createLinearGradient(0, -9, 0, 9); cg.addColorStop(0, "#f2d38a"); cg.addColorStop(.5, "#b3822e"); cg.addColorStop(1, "#4d3510"); ctx.fillStyle = cg; ctx.fillRect(-26, -9, 52, 18); ctx.fillStyle = "#6a4a18"; ctx.fillRect(22, -10, 6, 20); ctx.restore();
      ctx.save(); ctx.globalAlpha = .25; ctx.translate(x, 2 * gy - y); ctx.rotate(-rot); ctx.fillStyle = "#b3822e"; ctx.fillRect(-26, -9, 52, 18); ctx.restore(); }
    rain3(t, .5); gradeS(.2);
  },
  armoredSparks(sg, u, t) {
    const hits = [.04, .12, .2, .28, .36]; sv(0, -150, 1.9, impulse(u, hits, 4, .1));
    street(t, { blur: true }); L(1);
    const f = fig(ctx, 90 - u * 60, 0, 1, -1, "armored", PS.shamble(t * 3, 4), { t, eyes: .9, rims: [RIM.moon(3)] });
    hits.forEach((h, i) => { const k = p(u, h, h + .35), [x, y] = [f.neck[0] + 6, f.neck[1] + 24 + (i % 3) * 18]; if (u >= h) { L(1); sparks(ctx, x, y, k, i * 9 + sg.seed, 16, .7); const [sx, sy] = P(1, x, y); if (k < .2) { tracerS(-40, sy - 40 + i * 12, sx, sy, 1 - k * 5); glow(sx, sy, 160, "255,210,140", .7 * (1 - k * 5)); } } });
    rain3(t, .8); gradeS(.3);
  },
  lightningHill(sg, u, t) {
    const fl = pulseAt(u, [.05, .2], .1); sv(0, -300, .8);
    sky(t, { moon: false, top: fl > 0 ? "#3a4560" : "#030406", hor: fl > 0 ? "#6a7aa0" : "#07090d", clouds: fl > 0 });
    bolt(sg.seed + 3, W * .62, BAR, H * .5, fl);
    const [x0, x1] = visX(.6); L(.6);
    for (let i = 0; i < 120; i++) { const x = x0 + (i / 120) * (x1 - x0) + rnd(i) * 20; fig(ctx, x, ridgeY(x) + 4 + rnd(i * 3) * 10, .45 + .15 * rnd(i * 2), rnd(i * 5) < .5 ? 1 : -1, i % 9 === 0 ? "tank" : "zombie", PS.shamble(t * 3 + i, i), { t }); }
    ctx.fillStyle = "#030305"; ctx.beginPath(); ctx.moveTo(x0, 600); for (let x = x0; x <= x1; x += 20) ctx.lineTo(x, ridgeY(x) + 8); ctx.lineTo(x1, 600); ctx.fill();
    whiteFlash(fl * .25, "210,220,255"); rain3(t, 1.6, .3);
  },
  dash(sg, u, t) {
    const k = eOut(p(u, .04, .2)), x = lerp(-420, 300, k); sv(lerp(-200, 120, k), -150, 1.5);
    const ls = street(t, { barrels: [520], cars: [[-600, 1]] }); L(1);
    for (let gh = 6; gh > 0; gh--) { const kk = eOut(p(u - gh * .018, .04, .2)); fig(ctx, lerp(-420, 300, kk), 0, 1, 1, "ethan", PS.run(3), { t, weapon: "machete", alpha: .08 * (7 - gh) }); }
    fig(ctx, x, 0, 1, 1, "ethan", u > .04 && u < .2 ? PS.run(3) : PS.idle(t), { t, weapon: "machete", rims: [RIM.fire(-2.5)] });
    scr(); ctx.globalCompositeOperation = "lighter"; const sk = 1 - p(u, .2, .4); if (u > .04 && sk > 0) for (let i = 0; i < 18; i++) { const [sx, sy] = P(1, x - 100, -30 - rnd(i) * 150); ctx.fillStyle = `rgba(200,215,240,${.25 * sk})`; ctx.fillRect(sx - 600 * rnd(i * 3), sy, 500 * rnd(i * 2), 1.5); } ctx.globalCompositeOperation = "source-over";
    streetTop(t, { barrels: [520] }, ls); rain3(t, .9, .4); gradeS(.3);
  },
  katana(sg, u, t) {
    scr(); ctx.fillStyle = "#040405"; ctx.fillRect(0, 0, W, H); bokeh(t, [[W * .8, H * .3, 220, "255,80,50", .25]]);
    const k = eIO(p(u, .02, .45)); ctx.save(); ctx.translate(W * .2, H * .78); ctx.rotate(-.42);
    ctx.fillStyle = "#0a0a0c"; ctx.fillRect(-260, -14, 240, 28); ctx.fillStyle = "#23201b"; ctx.fillRect(-24, -30, 16, 60);
    const len = 1400, bg = ctx.createLinearGradient(0, 0, len, 0); bg.addColorStop(0, "#2a2d33"); bg.addColorStop(1, "#15171b"); ctx.fillStyle = bg;
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(len - 60, -8); ctx.quadraticCurveTo(len, -4, len + 10, 6); ctx.lineTo(0, 10); ctx.fill();
    ctx.globalCompositeOperation = "lighter"; const rg = ctx.createLinearGradient(0, 0, len, 0); rg.addColorStop(0, "rgba(255,40,30,.95)"); rg.addColorStop(Math.max(.001, k), "rgba(255,70,40,.9)"); rg.addColorStop(Math.min(1, k + .06), "rgba(255,70,40,0)"); rg.addColorStop(1, "rgba(255,70,40,0)");
    ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(len - 60, -8); ctx.quadraticCurveTo(len, -4, len + 10, 6); ctx.lineTo(0, 10); ctx.fill();
    ctx.strokeStyle = "rgba(255,240,230,.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(len * k, -8); ctx.stroke();
    for (let i = 0; i < 40; i++) { const q = rnd(i + sg.seed) * k, life = (u * 1.5 + rnd(i * 3)) % 1; ctx.fillStyle = `rgba(255,${80 + 100 * rnd(i)},40,${(1 - life) * .9})`; ctx.fillRect(q * len + life * 60, -12 - life * 120 * rnd(i * 5), 3, 3); }
    ctx.restore(); const [hx, hy] = [W * .2 + Math.cos(-.42) * len * k, H * .78 + Math.sin(-.42) * len * k]; glow(hx, hy, 240, "255,60,40", .5 * k); gradeS(.15);
  },
  barricade(sg, u, t) {
    const cr = .12; sv(0, -170, 1.6, impulse(u, [cr, .35], 10, .3));
    scr(); ctx.fillStyle = "#050507"; ctx.fillRect(0, 0, W, H);
    const [dx, dy, s] = P(1, 0, -150); glow(dx, dy, 700 * s, "255,120,40", .45 * flick(t, 7));
    L(.8); for (let i = 0; i < 4; i++) fig(ctx, -200 + i * 130, 0, 1, i % 2 ? 1 : -1, "zombie", PS.shamble(t * 4 + i, i), { t, eyes: .8, rims: [RIM.fire(i % 2 ? -2 : 2)] });
    L(1); ctx.fillStyle = "#08070a"; ctx.fillRect(-900, -520, 460, 520); ctx.fillRect(440, -520, 460, 520); ctx.fillRect(-900, -620, 1800, 110);
    const boards = [[-460, -380, .12], [-460, -250, -.18], [-460, -120, .08], [-460, -440, -.05]];
    boards.forEach(([x, y, r], i) => { const brk = i === 1 && u > cr, bk = p(u, cr, cr + .5); ctx.save(); ctx.translate(brk ? x + 460 + 200 * bk : x + 460, brk ? y - 60 * bk + 300 * bk * bk : y); ctx.rotate(r + (brk ? bk * 1.2 : 0)); ctx.fillStyle = "#1a120b"; ctx.fillRect(-470, -24, 940, 48); ctx.strokeStyle = "rgba(255,150,70,.35)"; ctx.lineWidth = 2; ctx.strokeRect(-470, -24, 940, 48); ctx.restore(); });
    ctx.strokeStyle = INK; ctx.lineCap = "round"; for (let i = 0; i < 5; i++) { const x = -300 + i * 150, y = -320 + (i % 2) * 130, rch = 60 + 40 * Math.sin(t * 8 + i); ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x + Math.sin(t * 6 + i) * 20, y + rch); ctx.stroke(); ctx.lineWidth = 3; for (let f = -1; f <= 1; f++) { ctx.beginPath(); ctx.moveTo(x + Math.sin(t * 6 + i) * 20, y + rch); ctx.lineTo(x + Math.sin(t * 6 + i) * 20 + f * 8, y + rch + 16); ctx.stroke(); } }
    if (u > cr) { L(1); sparks(ctx, 0, -250, p(u, cr, cr + .6), sg.seed, 22, 1, "200,150,90"); }
    rain3(t, .4); gradeS(.2, .1);
  },
  zombieEyes(sg, u, t) {
    sv(28, -176, 6.5);
    sky(t, { moon: false, clouds: false, top: "#060408", hor: "#150c10" }); bokeh(t, [[300, 500, 180, "255,60,40", .2], [1600, 700, 120, "255,120,40", .2]]);
    L(1); const e = eOut(p(u, .08, .3));
    fig(ctx, 0, 0, 1, -1, "zombie", pose({ lean: .2, head: lerp(.7, -.05, eOut(p(u, 0, .3))), sL: .6, sR: .3 }), { t, eyes: e * 1.2, rims: [RIM.red(-2.5), RIM.moon(2)] });
    rain3(t, 1.2); gradeS(.3);
  },
  rocketSide(sg, u, t) {
    const fire = .06; sv(-100, -140, 1.55, impulse(u, [fire], 12, .4));
    const ls = street(t, { cars: [[500, -1, .03]] }); L(1);
    const f = fig(ctx, -280, 0, 1, 1, "ethan", PS.rocket(pulseAt(u, [fire], .2)), { t, weapon: "rocket", rims: [RIM.fire(-2.5)] });
    const [mx, my] = P(1, f.muzzle[0], f.muzzle[1]), [bx, by] = P(1, f.hand[0] - 70, f.hand[1]);
    if (u > fire) { const k = p(u, fire, sg.b - sg.a), rx = mx + k * 2400, ry = my - k * 60;
      scr(); const tg = ctx.createLinearGradient(mx, my, rx, ry); tg.addColorStop(0, "rgba(120,120,125,0)"); tg.addColorStop(1, "rgba(150,150,155,.45)"); ctx.strokeStyle = tg; ctx.lineWidth = 18; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(rx, ry); ctx.stroke();
      glow(rx, ry, 120, "255,190,110", .9); flare(rx, ry, .6, "255,200,140");
      const bk = p(u, fire, fire + .8); for (let i = 0; i < 6; i++) glow(bx - bk * (140 + 60 * i), by - bk * 20 * i, 90 + 160 * bk, "140,140,150", .18 * (1 - bk)); muzzleS(mx, my, 0, 1 - p(u, fire, fire + .1), 1.6); }
    lights(ls); rain3(t, .8); gradeS(.3);
  },
  rocketImpact(sg, u, t) {
    const e = .03; sv(0, -230, .9, impulse(u, [e], 22, .6));
    street(t, { cars: [[-500, 1, .05]], sky: { moon: [300, 200] } }); L(1);
    const k = p(u, e, e + .9);
    for (let i = 0; i < 12; i++) { const x0 = -350 + i * 65, side = x0 < 100 ? -1 : 1, d = Math.abs(x0 - 100), fk = eOut(clamp(k * (1.4 - d / 600))); fig(ctx, x0 + side * 380 * fk, -Math.sin(Math.min(1, fk) * Math.PI) * (260 - d * .3), .9, side > 0 ? -1 : 1, "zombie", u < e ? PS.shamble(t * 3 + i, i) : pose({ lean: .3, head: .5, sL: 2.6, eL: .3, sR: 2.2, eR: .4, hL: .8, kL: .8, hR: -.5, kR: .9 }), { t, rot: side * -2.5 * fk * (side > 0 ? -1 : 1), rims: [RIM.fire(-side * 3)] }); }
    fireball(ctx, 100, -40, (u - e) / .9, sg.seed, 2.4);
    const [x, y] = P(1, 100, -40); if (u > e) { scr(); ctx.strokeStyle = `rgba(255,220,180,${.5 * (1 - k)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(x, y + 40, 50 + 1400 * eOut(k), 20 + 160 * eOut(k), 0, 0, TAU); ctx.stroke(); glow(x, y, 1600 * (1 - k * .5), "255,150,60", .7 * (1 - k)); flare(x, y, 1.4 * (1 - k), "255,200,140"); }
    whiteFlash(.4 * (1 - p(u, e, e + .1)), "255,235,210"); rain3(t, .5); gradeS(.2, .15);
  },
  backToBack(sg, u, t) {
    const eS = [.05, .38], sS = [.14, .2, .26, .45, .51], ek = pulseAt(u, eS, .15), sk = pulseAt(u, sS, .05);
    sv(lerp(-60, 60, u / (sg.b - sg.a)), -150, 1.7, impulse(u, eS, 6, .2));
    street(t, { blur: true, barrels: [] }); L(1);
    for (let i = 0; i < 6; i++) { const side = i % 2 ? 1 : -1, d = (i % 2 ? sS[i >> 1] : eS[i >> 1]) ?? 99, x0 = side * (280 + 70 * i), fk = p(u, d, d + .5); fig(ctx, x0 + side * 60 * eOut(fk), 0, 1, -side, "zombie", PS.shamble(t * 3 + i, i), { t, rot: -eIn(fk) * 1.4, eyes: .7 * (1 - fk), rims: [RIM.fire(side * -3)] }); }
    const fe = fig(ctx, -30, 0, 1, -1, "ethan", PS.aim(ek), { t, weapon: "shotgun", rims: [{ c: `rgba(255,190,110,${.3 + .7 * Math.max(ek, sk)})`, dx: 3 }] });
    const fs = fig(ctx, 30, 0, 1, 1, "sarah", PS.aim(sk), { t, weapon: "smg", rims: [{ c: `rgba(255,190,110,${.3 + .7 * Math.max(ek, sk)})`, dx: -3 }] });
    const [ex, ey] = P(1, fe.muzzle[0], fe.muzzle[1]), [sx, sy] = P(1, fs.muzzle[0], fs.muzzle[1]); muzzleS(ex, ey, Math.PI, ek, 1.3); muzzleS(sx, sy, 0, sk);
    glow((ex + sx) / 2, ey, 700, "255,190,110", .35 * Math.max(ek, sk)); rain3(t, .9); gradeS(.3);
  },
  endless(sg, u, t) {
    const d = sg.b - sg.a, k = eIO(p(u, 0, d)); sv(0, lerp(-150, -330, k), lerp(2.4, .5, k));
    sky(t, { moon: [960, 260], top: "#0d0505", hor: "#3a1410" }); tile(SKY_FAR, .22, 170);
    [[.5, 60, .5], [.7, 44, .7], [.85, 30, .85]].forEach(([dd, n, sc], li) => { const [x0, x1] = visX(dd); L(dd); for (let i = 0; i < n; i++) { const x = x0 + (i + rnd(i + li * 50)) / n * (x1 - x0); if (Math.abs(x) < 140 && dd > .8) continue; fig(ctx, x, 0, sc, x < 0 ? 1 : -1, i % 11 === 0 ? "tank" : "zombie", PS.shamble(t * 3 + i + li * 7, i), { t, eyes: .5 }); } });
    ground(1, { c1: "#0d0808" }); L(1); fig(ctx, 0, 0, 1, 1, "ethan", PS.idle(t), { t, weapon: "machete", rims: [RIM.red(2.5), RIM.red(-2.5)] });
    fogBands(t, P(.7, 0, 0)[1], 80, .2, "120,50,40"); rain3(t, .6); gradeS(.2);
  },
  finalStrike(sg, u, t) {
    const fl = pulseAt(u, [0, .18], .14); sv(0, -200, 1.1);
    sky(t, { moon: false, top: fl > 0 ? "#5a6890" : "#020203", hor: fl > 0 ? "#a0b0d8" : "#05060a", clouds: false }); bolt(1234, W * .5, BAR, H * .6, fl);
    const [x0, x1] = visX(.7); L(.7); for (let i = 0; i < 70; i++) { const x = x0 + (i / 70) * (x1 - x0); fig(ctx, x, 0, .7, x < 0 ? 1 : -1, "zombie", PS.shamble(t * 3 + i, i), { t }); }
    ground(1, { c1: "#020203" }); L(1); fig(ctx, 0, 0, 1, 1, "ethan", PS.swing(0), { t, weapon: "machete" });
    whiteFlash(fl * .35, "220,230,255"); rain3(t, 1.8, .3);
  },
};
function sMontage(t) {
  const seg = MONTAGE.find(s => t >= s.a && t < s.b) || MONTAGE[MONTAGE.length - 1], u = t - seg.a;
  if (seg.card) card(seg.card, t, seg.a, seg.b);
  else if (TOPMAP[seg.type]) { FILL = { r: 1100, i: .4 }; SHOTS[TOPMAP[seg.type]](seg, u); FILL = null; }
  else { ctx.save(); MS[seg.type](seg, u, t); ctx.restore(); }
  if (seg.card || MONTAGE.indexOf(seg) % 3 === 0) { const f = 1 - p(t, seg.a, seg.a + .07); if (f > 0) whiteFlash(f * .45, "255,240,230"); }
}

/* 1:30–1:41 · sessizlik: Ethan'a aşırı yakın plan, nefes */
function sQuiet(t) {
  if (IMG.keyArt) {
    const [fx, fy] = CONFIG.keyArt.ethanFocus; drawKeyArt(lerp(1.9, 2.2, p(t, 90, 99.2)) + Math.sin(t * 1.3) * .01, fx, fy);
    grade(.45, .12); screenFill("rgba(0,0,0,.25)"); rain3(t, .7);
  } else {
    sv(10, -172, lerp(5.2, 5.9, p(t, 90, 99.2)));
    sky(t, { moon: false, clouds: false, top: "#04050a", hor: "#0e131c" }); bokeh(t, [[1500, 700, 220, "255,130,40", .35], [420, 380, 140, "140,170,220", .15]]);
    L(1); const P1 = PS.idle(t); P1.head = .06 + .02 * Math.sin(t * .8) - .06 * win(t, 95.2, 98.6, .6);
    const f = fig(ctx, 0, 0, 1, 1, "ethan", P1, { t, rims: [RIM.fire(-1.6), { c: "rgba(140,170,220,.5)", dx: 1.2 }] });
    const [hx, hy, s] = P(1, f.head[0] + 13, f.head[1] + 4);
    for (const b of [91.9, 94.2, 96.8]) vapor(hx, hy, (t - b) / 1.3, 1, s * .25);
    rain3(t, .8); gradeS(.35);
  }
  whiteFlash(Math.max(1 - p(t, 90, 90.5), p(t, 99.0, 99.25)), "0,0,0");
}

/* ---------- zaman çizelgesi ---------- */
const SCENES = [
  [0, 8, sLogo, "Logo"], [8, 11.9, sRoom, "Oda"], [11.9, 20, sTV, "TV"],
  [20, 24.6, sCityWide, "Şehir · vinç"], [24.6, 26, sBoots, "Botlar"], [26, 29.5, sEthanMed, "Ethan"],
  [29.5, 32.5, sHill, "Sırt"], [32.5, 35, sFeet, "Ayaklar"], [35, 38, sTopCrowd, "Kalabalık"],
  [38, 40.2, sAlley, "Ara sokak"], [40.2, 42.6, sSarahReveal, "Sarah"], [42.6, 45.4, sOTS, "Omuz üstü"], [45.4, 48.2, sTwoShot, "İki kişi"], [48.2, 52, sBackTop, "Sırt sırta"],
  [52, 56.6, sBaseWide, "Kartal Üssü"], [56.6, 59.6, sTape, "Kayıt"], [59.6, 63.9, sFencePair, "Çit"], [63.9, 65, sDenek, "Denek 7"],
  [65, 90, sMontage, "Montaj"], [90, 101, sQuiet, "Sessizlik"], [101, 115, sTitle, "Logo"], [115, 120.01, sOutro, "Kapanış"],
];
const CUT_FLASH = [29.5, 38];
function render(t) {
  STAND.clear();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.filter = "none";
  const sc = SCENES.find(s => t >= s[0] && t < s[1]) || SCENES[SCENES.length - 1];
  ctx.save(); sc[2](t); ctx.restore();
  scr();
  const fk = pulseAt(t, CUT_FLASH, .12); if (fk > 0) screenFill(`rgba(255,240,230,${fk * .4})`);
  ctx.drawImage(VIGNETTE, 0, 0);
  ctx.save(); ctx.globalAlpha = .08; ctx.globalCompositeOperation = "overlay"; ctx.drawImage(GRAIN[Math.floor(t * 30) % GRAIN.length], 0, 0, W, H); ctx.restore();
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, BAR); ctx.fillRect(0, H - BAR, W, BAR);
  subtitles(t);
  standTag();
  return sc[3];
}
