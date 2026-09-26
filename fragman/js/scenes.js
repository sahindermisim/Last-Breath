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

/* =========================================================================
   GİRİŞ (0:00–0:20) — logo, oda, TV. Bu bölüm değiştirilmez.
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

