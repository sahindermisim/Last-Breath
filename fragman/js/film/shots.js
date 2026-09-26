"use strict";
/* =========================================================================
   SAHNELER — 0:20 sonrası. Giriş (0:00–0:20) scenes.js'te, değiştirilmedi.
   ========================================================================= */
(() => {
  const C = F.cam, S = F.scr, E = F.BUILD.ethan, SA = F.BUILD.sarah, TK = F.BUILD.tank, FIRE = "255,122,42";
  const blk = a => { if (a > 0) { S(); ctx.fillStyle = `rgba(0,0,0,${clamp(a)})`; ctx.fillRect(0, 0, W, H); } };
  const wht = (a, c = "255,250,245") => { if (a > 0) { S(); ctx.fillStyle = `rgba(${c},${clamp(a)})`; ctx.fillRect(0, 0, W, H); } };
  const K = (t, a, b) => eIO(p(t, a, b));
  // Tam şehir: 5 bina katmanı + sis + uzak yangın + gökyüzü
  function city(t, o = {}) {
    const fx = o.fireX ?? 2600, [fsx] = F.pr(fx, 0, 45);
    F.sky(t, { glow: o.noFire ? null : [[fsx, 1100, .7 * (o.fireA ?? 1)]], flash: o.flash || 0, cloudY: o.cloudY || 0, top: o.top || "#030407", mid: o.mid || "#10151d", hor: o.hor || "#262c36", cloudA: 1 });
    F.ground("#12161d", "#05060a");
    F.layer(F.T.far); F.haze(.32, "58,68,84", 70, 240);
    if (!o.noFire) { F.L(45); ctx.globalAlpha = .9; F.smoke(ctx, fx + 2500, -9000, 12000, t, 3, 14, 1, .8); ctx.globalAlpha = 1; F.fire(ctx, fx, -200, 9000 * (o.fireA ?? 1), t, 1, 1); }
    F.layer(F.T.far2); F.haze(.28, "52,62,78", 38, 260);
    F.layer(F.T.mid); F.haze(.2, "46,56,72", 20, 240);
    if (o.near !== false) { F.layer(F.T.near); F.haze(.1, "40,48,62", 9, 200); }
    if (o.close) { F.layer(F.T.close); F.haze(.12, "44,54,70", 4, 380); }
    if (!o.noFire) { const [x, y] = F.pr(fx, -2500, 45); F.glowS(x, y, 700, FIRE, .45 * (o.fireA ?? 1)); F.glowS(x, y + 40, 180, "255,200,140", .35 * (o.fireA ?? 1)); F.rays(x, y, 700, .08 * (o.fireA ?? 1), t * .01); }
    return fsx;
  }
  const subtitleY = H - BAR - 46;

  /* ======================= 1) SESSİZ DÜNYA 20–41.5 ======================= */
  function sAerial(t) { // 20–27: şehrin üstünden ilerleme, ufukta tek büyük yangın
    const k = K(t, 20, 27);
    F.setCam({ x: lerp(-1800, 1200, k), y: -6200 + k * 900, z: lerp(0, 2.4, k), hy: lerp(380, 420, k) }); F.hand(t, .8);
    const fsx = city(t, { fireX: 3200, near: true });
    F.fogLayer(t, 520, .45, 14, 1.3, .01); F.fogLayer(t, 760, .35, 22, 1.8, .03);
    F.ash(t, 70, .5); F.rain(t, .8, .1, [[fsx, 420, 500, .5]]);
    blk(1 - p(t, 20, 21.6));
  }
  const tlOn = t => (t > 27.6 && t < 27.95) || (t > 28.45 && t < 28.75) || (t > 29.25 && t < 29.38) ? 1 : (t > 29.72 && t < 29.76) ? .5 : (t > 29.8 && t < 29.82) ? .3 : 0;
  function sTraffic(t) { // 27–30.5: kablodan sarkan trafik lambası rüzgârda sallanıyor, son kez yanıp söner
    const k = K(t, 27, 30.5);
    F.setCam({ x: lerp(-60, 40, k), y: -600, z: 0, f: 1.9, hy: 640 }); F.hand(t, 1.2);
    city(t, { fireX: -900, fireA: .6, close: false });
    F.L(1.6); const a = [-1400, -1000], b = [1500, -1120], mx = lerp(a[0], b[0], .5), my = lerp(a[1], b[1], .5) + 120;
    F.cable(ctx, a, b, 120, 3); F.cable(ctx, [-1400, -960], [1500, -1060], 150, 2); F.pole(ctx, -1420, 1100, .06, 18);
    const sw = .2 * Math.sin(t * 1.6) + .06 * Math.sin(t * 3.3 + 1), on = tlOn(t);
    ctx.save(); ctx.translate(mx, my); ctx.rotate(sw); ctx.fillStyle = "#020203"; ctx.fillRect(-2, 0, 4, 60); ctx.fillRect(-26, 60, 52, 150); ctx.fillRect(-32, 58, 64, 8);
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-30, 70 + i * 48); ctx.lineTo(30, 70 + i * 48); ctx.lineTo(24, 88 + i * 48); ctx.lineTo(-24, 88 + i * 48); ctx.fill(); }
    const lp = ctx.getTransform().transformPoint(new DOMPoint(0, 60 + 48 * 1 + 25)); ctx.restore();
    if (on > 0) { F.glowS(lp.x, lp.y, 420 * on, "255,170,40", .55 * on); F.glowS(lp.x, lp.y, 40, "255,230,170", on); S(); ctx.save(); ctx.globalCompositeOperation = "lighter"; const gr = ctx.createLinearGradient(lp.x, lp.y, lp.x, H); gr.addColorStop(0, `rgba(255,170,60,${.22 * on})`); gr.addColorStop(1, "rgba(255,170,60,0)"); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(lp.x - 10, lp.y); ctx.lineTo(lp.x - 260, H); ctx.lineTo(lp.x + 260, H); ctx.lineTo(lp.x + 10, lp.y); ctx.fill(); ctx.restore(); }
    F.fogLayer(t, 820, .3, 30, 1.5, .02); F.ash(t, 50, .5); F.rain(t, 1.1, .16, on ? [[lp.x, lp.y + 200, 520, on, "255,190,110"]] : []);
  }
  const ledOn = t => t < 34.3 && (Math.sin((t - 30.5) * 8.5) > -.3 || t < 31);
  function sRadio(t) { // 30.5–34.8: karanlıkta kırmızı nokta, bozuk radyo
    F.setCam({ x: 0, y: -40, f: 1, hy: 560 }); F.hand(t, .5);
    S(); ctx.fillStyle = "#010102"; ctx.fillRect(0, 0, W, H);
    // uzak ateşlerin bulanık bokehi
    for (const [x, y, r, a] of [[260, 420, 110, .16], [420, 470, 60, .12], [1640, 440, 90, .12], [1500, 400, 45, .1]]) F.glowS(x, y, r, FIRE, a * (.8 + .2 * Math.sin(t * 5 + x)));
    const on = ledOn(t), cx = 980, cy = 640, gl = on ? 1 : 0;
    // radyo silueti (ışığın kenarlarını yakaladığı)
    S(); ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.06); ctx.fillStyle = "#030304"; ctx.beginPath(); ctx.moveTo(-230, -70); ctx.lineTo(210, -84); ctx.lineTo(236, 62); ctx.lineTo(-222, 76); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = "#030304"; ctx.beginPath(); ctx.moveTo(150, -80); ctx.lineTo(560, -320); ctx.stroke(); circ(ctx, 560, -320, 6);
    ctx.fillStyle = "#030304"; circ(ctx, 120, -92, 24); ctx.fillRect(-190, -92, 50, 14);
    ctx.strokeStyle = `rgba(255,60,50,${.35 * gl})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-230, -70); ctx.lineTo(210, -84); ctx.stroke(); ctx.strokeStyle = "rgba(120,140,170,.18)"; ctx.beginPath(); ctx.moveTo(150, -80); ctx.lineTo(560, -320); ctx.stroke(); ctx.restore();
    if (on) { F.glowS(cx + 60, cy - 40, 360, "255,30,30", .45); F.glowS(cx + 60, cy - 40, 14, "255,200,200", 1); F.glowS(cx + 60, cy + 150, 200, "255,40,40", .18); }
    S(); ctx.fillStyle = "rgba(20,26,36,.5)"; ctx.fillRect(0, cy + 70, W, H);
    F.splashes(t, cy + 60, H, 1.2); F.rain(t, .9, .08, on ? [[cx + 60, cy - 40, 420, .9, "255,90,80"]] : []);
  }
  function sEthanBack(t) { // 34.8–41.5: arkası dönük Ethan, şehre bakıyor
    const k = K(t, 34.8, 41.5);
    F.setCam({ x: lerp(-40, 30, k), y: -3160, z: 0, f: lerp(3.2, 3.5, k), hy: 470 }); F.hand(t, .9);
    const fsx = city(t, { fireX: 900, near: true });
    F.fogLayer(t, 640, .35, 18, 1.4, .02);
    const [ex, ey, es] = F.pr(0, -3000, 1.4);
    F.L(1.4); const gust = Math.sin(t * .9) * .5 + .5;
    F.figure(ctx, 0, -3000, 1, 1, E, F.front({ bob: Math.sin(t * 1.3) * .8, arms: [{ out: .1, fwd: 0, bend: .25 }, { out: .08, fwd: 0, bend: .3 }] }), { t: t * (1 + gust * .6), front: true, back: true, weapon: "machete", rims: [{ c: "rgba(255,140,60,.8)", dx: 3 }, { c: "rgba(120,150,200,.5)", dx: -2.5 }], halo: { c: "#ff7a2a", a: .35, blur: 18 } });
    S(); const gr = ctx.createLinearGradient(0, ey - 30, 0, H); gr.addColorStop(0, "#040507"); gr.addColorStop(1, "#010102"); ctx.fillStyle = gr; ctx.fillRect(0, ey - 8, W, H); ctx.fillStyle = "rgba(255,120,50,.12)"; ctx.fillRect(0, ey - 8, W, 3);
    F.ash(t, 60, .55); F.rain(t, 1, .13, [[fsx, 480, 600, .5]]);
  }

  /* ======================= 2) ATEŞ BAŞI 41.5–56.5 ======================= */
  const FIREX = 0, FIRED = 2.2;
  function roof(t, o) {
    city(t, { fireX: -3500, fireA: .5, near: false, top: "#05070a", mid: "#141a24", hor: "#222a36" });
    // uzak küçük yangınlar
    for (const [x, D, s2] of [[-9000, 20, 380], [4000, 30, 700], [14000, 20, 260], [24000, 38, 900], [-18000, 38, 500]]) { F.L(D); F.fire(ctx, x, 0, s2, t, x, .8); const [gx, gy] = F.pr(x, -s2 * .5, D); F.glowS(gx, gy, s2 * F.sc(D) * 4, FIRE, .35); }
    F.haze(.18, "60,70,86"); F.fogLayer(t, 520, .25, 12, 1.2, .01);
    // çatı zemini
    F.L(FIRED); const s = F.sc(FIRED), [, gy] = F.pr(0, 0, FIRED); S(); const gr = ctx.createLinearGradient(0, gy - 40, 0, H); gr.addColorStop(0, "#07080b"); gr.addColorStop(1, "#010102"); ctx.fillStyle = gr; ctx.fillRect(0, gy - 36 * s * .6, W, H);
    F.L(FIRED); ctx.fillStyle = "#030304"; ctx.fillRect(-1600, -36, 3200, 10); for (let x = -1600; x < 1600; x += 260) ctx.fillRect(x, -60, 14, 60);
    ctx.fillRect(-900, -150, 150, 150); ctx.fillRect(-880, -170, 110, 22); ctx.fillRect(700, -260, 36, 260); ctx.fillRect(686, -280, 64, 26); ctx.fillRect(420, -90, 190, 90);
    const [fx0, fy0] = F.pr(FIREX, 0, FIRED); F.glowS(fx0, fy0 + 20, 520, FIRE, .18);
  }
  const campfire = (t, inten = 1) => { F.L(FIRED); for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(FIREX + (i - 2) * 14, -4); ctx.rotate((i - 2) * .5); ctx.fillStyle = "#050404"; ctx.fillRect(-40, -6, 80, 12); ctx.fillStyle = `rgba(255,${90 + 40 * Math.sin(t * 7 + i)},20,.7)`; ctx.fillRect(-18, -7, 36, 3); ctx.restore(); } F.fire(ctx, FIREX, -6, 48 * inten, t, 7, inten); const [x, y] = F.pr(FIREX, -30, FIRED); return [x, y]; };
  function sCampWide(t) { // 41.5–46
    const k = K(t, 41.5, 46); F.setCam({ x: 0, y: -170, z: 0, f: lerp(2.3, 2.6, k), hy: 470 }); F.hand(t, .5);
    roof(t); const fl = .85 + .15 * Math.sin(t * 17) * Math.sin(t * 6.3);
    F.L(FIRED); const rimE = { c: `rgba(255,${130 + 20 * fl | 0},60,${.9 * fl})`, dx: 3 }, rimS = { c: `rgba(255,${130 + 20 * fl | 0},60,${.9 * fl})`, dx: -3 };
    F.figure(ctx, -150, 0, 1, 1, E, F.P.sit(t), { t, rims: [rimE], halo: { c: "#ff7a2a", a: .25 * fl, blur: 10 } });
    F.figure(ctx, 150, 0, 1, -1, SA, F.P.sit(t + 2), { t, rims: [rimS], halo: { c: "#ff7a2a", a: .25 * fl, blur: 10 } });
    const [fx, fy] = campfire(t); F.glowS(fx, fy, 520 * fl, FIRE, .45); F.glowS(fx, fy + 30, 150, "255,200,120", .5 * fl);
    F.embers(t, 70, 1, fx - 60, fx + 60, fy + 10); F.rain(t, .45, .1, [[fx, fy, 450, 1]]);
  }
  function sCampSarah(t) { // 46–49
    F.setCam({ x: 150, y: -72, z: 0, f: 6.4, hy: 520 }); F.hand(t, 1.1);
    roof(t); const fl = .85 + .15 * Math.sin(t * 17) * Math.sin(t * 6.3);
    F.L(FIRED); F.figure(ctx, 150, 0, 1, -1, SA, F.P.sit(t + 2), { t, rims: [{ c: `rgba(255,140,60,${.95 * fl})`, dx: -1.2 }], halo: { c: "#ff7a2a", a: .35 * fl, blur: 16 } });
    const [fx, fy] = F.pr(FIREX, -30, FIRED); F.glowS(fx, fy, 900 * fl, FIRE, .4); F.embers(t, 40, .8, 0, 700, H); F.rain(t, .4, .1, [[fx, fy, 700, .8]]);
  }
  function sCampFire(t) { // 49–52
    F.setCam({ x: 0, y: -45, z: 0, f: 13, hy: 640 }); F.hand(t, .6);
    S(); ctx.fillStyle = "#020203"; ctx.fillRect(0, 0, W, H); for (const [x, y, r] of [[300, 300, 140], [1600, 360, 120], [1200, 250, 70]]) F.glowS(x, y, r, FIRE, .12);
    const [fx, fy] = campfire(t, 1.05); F.glowS(fx, fy, 900, FIRE, .5); F.glowS(fx, fy, 260, "255,210,140", .5);
    F.embers(t, 110, 1, fx - 260, fx + 260, fy + 200); F.L(FIRED); F.smoke(ctx, FIREX, -80, 70, t, 5, 8, 2, .5);
  }
  function sCampEthan(t) { // 52–56.5
    const k = K(t, 52, 56.5); F.setCam({ x: -150, y: -72, z: 0, f: lerp(6.2, 6.8, k), hy: 520 }); F.hand(t, 1.1);
    roof(t); const fl = .85 + .15 * Math.sin(t * 17) * Math.sin(t * 6.3);
    F.L(FIRED); F.figure(ctx, -150, 0, 1, 1, E, F.P.sit(t), { t, rims: [{ c: `rgba(255,140,60,${.95 * fl})`, dx: 1.2 }], halo: { c: "#ff7a2a", a: .35 * fl, blur: 16 } });
    const [fx, fy] = F.pr(FIREX, -30, FIRED); F.glowS(fx, fy, 900 * fl, FIRE, .4); F.embers(t, 40, .8, W - 700, W, H); F.rain(t, .4, .1, [[fx, fy, 700, .8]]);
  }

  /* ======================= 3) YÜKSELİŞ 56.5–78.5 ======================= */
  const HORDE = []; { const R = mulberry(4242); for (let i = 0; i < 300; i++) { const t0 = i === 0 ? 57.6 : i < 5 ? 60 + i * .55 : 62.4 + R() * 6, d0 = i === 0 ? 8.5 : i < 5 ? 10.5 + R() * 2.5 : 6.5 + R() * 24; HORDE.push({ t0, x: i === 0 ? 20 : (R() - .5) * (i < 5 ? 420 : 1350), d0, v: i === 0 ? .95 : .45 + R() * .5, v2: i % 8, ph: R() * 10, sp: 2.2 + R() * 1.2 }); } }
  function sStreet(t) { // 56.5–69.5: boş sokak, sisten sürü çıkıyor, arkada yanan araba
    const k = K(t, 56.5, 69.5); F.setCam({ x: lerp(-30, 20, k), y: -95, z: lerp(0, -.5, k), f: 3.1, hy: 610 }); F.hand(t, .7);
    city(t, { fireX: -2000, fireA: .4, near: false });
    // sokak koridoru: iki yanda binalar
    for (const [D, xs, w, h] of [[26, [-900, 880], 1200, 4800], [17, [-850, 830], 900, 4200], [10, [-800, 780], 700, 3800], [5, [-760, 740], 600, 3400]]) { F.L(D); ctx.fillStyle = "#030406"; for (const x of xs) { const x0 = x - (x < 0 ? w : 0); ctx.fillRect(x0, -h, w, h + 5); ctx.fillStyle = "rgba(255,120,50,.10)"; ctx.fillRect(x < 0 ? x0 + w - 20 : x0, -h, 20, h); ctx.fillStyle = "#030406"; } F.haze(.14, "70,62,64", D, 220); }
    // yanan araba (arka ışık)
    F.L(22); F.car(ctx, 60, 1, .04, 1.5); const [cx, cy] = F.pr(60, -160, 22); F.fire(ctx, 60, -230, 340, t, 11, 1); F.fire(ctx, -150, -150, 180, t, 12, .8); F.smoke(ctx, 150, -700, 520, t, 4, 10, 1, .75);
    F.glowS(cx, cy, 900, FIRE, .5); F.glowS(cx, cy, 260, "255,200,130", .45); F.rays(cx, cy, 1200, .07, t * .01);
    F.ground("#07080b", "#010102"); F.reflect(C.hy + C.shy - C.y * F.sc(1e4), 420, .22);
    F.fogLayer(t, 560, .3, 16, 1.6, .02);
    // sürü: uzaktan sise karışarak kameraya yürür
    const list = HORDE.filter(z => t > z.t0).map(z => ({ z, D: z.d0 - (t - z.t0) * z.v })).filter(o => o.D > 1.2).sort((a, b) => b.D - a.D);
    for (const { z, D } of list) { const [x, y, s] = F.pr(z.x, 0, D), fogA = clamp(1.3 - (D - 3) / 16), emerge = p(t, z.t0, z.t0 + 1.5), back = clamp(1 - Math.abs(x - cx) / 900) * clamp((D - 3) / 10);
      F.scr(); F.crowdSprite(ctx, F.CROWD_FRONT, z.v2, (t + z.ph) * z.sp, x, y, s, z.v2 % 2 ? 1 : -1, fogA * emerge, back * .9 * emerge, .42 * clamp(1.4 - D / 12)); }
    // ön plan: yıkık araba, eğik direk, ıslak zeminde yangın yansıması
    S(); ctx.globalCompositeOperation = "lighter"; const rg = ctx.createLinearGradient(0, C.hy, 0, H); rg.addColorStop(0, "rgba(255,120,50,.22)"); rg.addColorStop(.5, "rgba(255,120,50,.06)"); rg.addColorStop(1, "rgba(255,120,50,0)"); ctx.fillStyle = rg; ctx.filter = "blur(18px)"; ctx.fillRect(cx - 70, C.hy, 140, H - C.hy); ctx.filter = "none"; ctx.globalCompositeOperation = "source-over";
    F.L(1.9); F.pole(ctx, 560, 900, -.12, 16); F.cable(ctx, [456, -880], [1400, -700], 80, 3);
    F.fogLayer(t, 720, .2, 26, 2.2, .04);
    F.ash(t, 50, .5); F.rain(t, .9, .12, [[cx, cy, 900, .8]]);
  }
  function sCards(t) { S(); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    for (const [s, a, b] of [["THE WORLD WENT SILENT.", 69.7, 71.2], ["THE DEAD DID NOT.", 71.4, 72.9]]) { const k = p(t, a, a + .9), o = Math.min(eOut(k), 1 - p(t, b - .25, b)); if (o <= 0) continue; const sc = lerp(1.05, 1, eOut(k));
      S(); ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.font = `400 150px ${FD}`; ctx.textAlign = "center"; if ("letterSpacing" in ctx) ctx.letterSpacing = "22px"; const fitK = Math.min(1, (W - 260) / ctx.measureText(s).width); ctx.scale(fitK, fitK); ctx.fillStyle = `rgba(233,226,210,${o})`; ctx.fillText(s, 11, 52); ctx.restore(); } }
  const FLASH3 = 76.3;
  function sDark(t) { // 72.9–78.5: fısıltı, sürgü, tek namlu alevi
    F.setCam({ x: 0, y: -150, f: 2.6, hy: 560 }); F.hand(t, .4);
    S(); ctx.fillStyle = "#010102"; ctx.fillRect(0, 0, W, H);
    const f = t < FLASH3 ? 0 : Math.max(0, 1 - (t - FLASH3) / .08) + .25 * Math.max(0, 1 - (t - FLASH3) / .9);
    const far = .06 + .03 * Math.sin(t * 2);
    F.glowS(W * .8, H * .45, 700, FIRE, far);
    if (f > 0) { F.glowS(1250, 480, 700 * f, "255,190,120", .35 * f); }
    F.L(1); const fe = F.figure(ctx, -40, 0, 1, 1, E, F.P.aim(t > FLASH3 ? Math.max(0, 1 - (t - FLASH3) / .25) : 0), { t, weapon: "pistol", amb: [8 + 150 * f, 9 + 120 * f, 12 + 90 * f], top: .1 * f, rims: [{ c: `rgba(255,${170 + 60 * f | 0},100,${Math.min(1, .15 + f)})`, dx: 1.5 }], halo: { c: "#ffb070", a: .6 * f, blur: 10 } });
    if (fe.tip && f > .05) { const [mx, my] = F.pr(fe.tip[0], fe.tip[1], 1); F.glowS(mx, my, 260 * f, "255,235,200", f); flare(mx, my, .8 * f, "255,200,150"); }
    F.rain(t, .3, .1, f > 0 ? [[1300, 470, 1200, f]] : []);
  }

  /* ======================= 4) PATLAMA 78.5–103.5 ======================= */
  const B0 = 78.5, BEAT = .5, beat = n => B0 + n * BEAT;
  const FLASHES = [0, 2, 4, 6].map(beat);
  function sMuzzle(t) { // 78.5–82.5: flaşlarda sürü, her seferinde daha yakın
    const i = FLASHES.filter(x => t >= x).length - 1, ft = t - FLASHES[Math.max(0, i)], f = i < 0 ? 0 : Math.max(0, 1 - ft / .12) * .9 + .3 * Math.max(0, 1 - ft / .6);
    F.setCam({ x: 0, y: -95, f: 3, hy: 600 }); F.hand(t, 1.2, FLASHES, 16, .25);
    S(); ctx.fillStyle = "#010102"; ctx.fillRect(0, 0, W, H);
    if (f > 0) { F.glowS(W * .5, 560, 1300, "255,190,130", .75 * f); F.glowS(W * .5, 600, 500, "255,230,200", .5 * f); F.fogLayer(t, 600, .6 * f, 30, 2, .02); }
    const D0 = [9, 6, 3.8, 2.2][Math.max(0, i)], R = mulberry(77 + i);
    const zs = []; for (let k = 0; k < 70; k++) zs.push({ x: (R() - .5) * 1600, D: D0 + R() * 9, v: k % 8, ph: R() * 6 });
    zs.sort((a, b) => b.D - a.D).forEach(z => { const [x, y, s] = F.pr(z.x, 0, z.D); F.scr(); F.crowdSprite(ctx, F.CROWD_FRONT, z.v, t * 2.4 + z.ph, x, y, s, z.v % 2 ? 1 : -1, clamp(1.4 - (z.D - D0) / 9), f * .8, clamp(f * 1.2) * clamp(1.2 - (z.D - D0) / 10)); });
    blk(clamp(1 - f * 1.4));
    if (f > .5) { F.glowS(160, 900, 500 * f, "255,230,190", f); }
    F.rain(t, .7, .12, [[W / 2, 500, 1600, f]]);
  }
  const LIGHT4 = [83.0, 84.25];
  function sSwing(t) { // 82.5–87.5: ağır çekim pala, arkada şimşek, su ve kıvılcım
    const tt = 82.5 + (t - 82.5) * .32, fl = pulseAt(t, LIGHT4, .35);
    F.setCam({ x: 40, y: -140, z: 0, f: 2.3, hy: 620 }); F.hand(t, .5, [84.25], 10, .5);
    city(t, { fireX: 1600, fireA: .4, flash: fl, near: true, top: fl ? "#2a3446" : undefined });
    F.bolt(83, 1150, 0, 540, pulseAt(t, [83.0], .15)); F.bolt(84, 700, 0, 560, pulseAt(t, [84.25], .2));
    F.ground("#0a0c10", "#020203"); F.reflect(C.hy + C.shy - C.y * F.sc(1e4), 300, .35);
    F.L(1); const sk = p(tt, 82.6, 83.55), hit = 83.35, hk = p(tt, hit, hit + .9);
    const zf = F.figure(ctx, 120 + 60 * eOut(hk), 0, 1, -1, F.zombieBuild(3), tt < hit ? F.P.lunge(.8) : F.mix(F.P.lunge(.8), F.P.hit(1), eOut(hk)), { t: tt, rot: eIn(hk) * .9, rims: [{ c: `rgba(200,215,255,${.3 + .7 * fl})`, dx: -2.5 }] });
    const ef = F.figure(ctx, -60, 0, 1, 1, E, F.P.swing(sk), { t: tt, weapon: "machete", bladeRim: "rgba(230,240,255,.8)", rims: [{ c: `rgba(210,225,255,${.35 + .65 * fl})`, dx: 3 }, { c: "rgba(255,130,60,.6)", dx: -2 }], halo: { c: "#9fb6e0", a: .4 * fl, blur: 14 } });
    // su damlaları ve kıvılcımlar (ağır çekim)
    if (tt > hit) { S(); const [hx, hy] = F.pr(zf.neck[0], zf.neck[1], 1).map((v, i) => i < 2 ? v : v), q = tt - hit; ctx.globalCompositeOperation = "lighter";
      const [sx, sy] = F.pr(...zf.neck, 1);
      for (let i = 0; i < 70; i++) { const an = -1.9 + (rnd(i) - .5) * 1.8, v = 250 + 500 * rnd(i * 3), px = sx + Math.cos(an) * v * q, py = sy + Math.sin(an) * v * q + 900 * q * q, spark = i % 4 === 0;
        ctx.fillStyle = spark ? `rgba(255,200,120,${clamp(1 - q)})` : `rgba(200,215,240,${.6 * clamp(1 - q * .8)})`; ctx.fillRect(px, py, spark ? 3 : 2.2, spark ? 3 : 5); }
      ctx.globalCompositeOperation = "source-over"; }
    F.rain(t, 1, .12, [], .22); F.ash(tt, 40, .5);
  }
  const BREAK = beat(22);
  function sWindow(t) { // 87.5–91.5: tahtalı pencereden uzanan eller, tahtalar kırılır
    F.setCam({ x: 0, y: -600, f: 1.3, hy: 560 }); F.hand(t, 1.5, [BREAK, beat(24)], 18, .45);
    S(); const fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 4.3); ctx.fillStyle = "#020203"; ctx.fillRect(0, 0, W, H);
    const wx = 520, wy = 170, ww = 880, wh = 700;
    const gr = ctx.createRadialGradient(W / 2, 560, 50, W / 2, 560, 700); gr.addColorStop(0, `rgba(255,150,70,${.95 * fl})`); gr.addColorStop(.6, `rgba(160,80,50,${.7 * fl})`); gr.addColorStop(1, "rgba(60,40,40,.8)"); ctx.fillStyle = gr; ctx.fillRect(wx, wy, ww, wh);
    // eller ve kollar (arkadan aydınlatılmış)
    ctx.save(); ctx.beginPath(); ctx.rect(wx - 40, wy - 40, ww + 80, wh + 80); ctx.clip(); ctx.fillStyle = "#020203";
    const R = mulberry(9); for (let i = 0; i < 26; i++) { const bx = wx + R() * ww, by = wy + 60 + R() * (wh - 100), reach = (.3 + .7 * R()) * (1 + .25 * Math.sin(t * (5 + R() * 4) + i)) * (t > BREAK ? 1.35 : 1), ang = (R() - .5) * 1.4 + Math.sin(t * 3 + i) * .15, len = 120 + 200 * reach;
      const ex = bx + Math.sin(ang) * len * .3, ey = by - 40 + len * .2 * Math.cos(ang), s = .8 + R() * .5; F.limb(ctx, [bx, by + 200], [ex, ey], 30 * s, 18 * s); circ(ctx, ex, ey, 14 * s);
      ctx.lineWidth = 5 * s; ctx.strokeStyle = "#020203"; ctx.lineCap = "round"; for (let f = -2; f <= 2; f++) { const fa = ang - Math.PI / 2 + f * .28 + Math.sin(t * 8 + i + f) * .15; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.quadraticCurveTo(ex + Math.cos(fa) * 22 * s, ey + Math.sin(fa) * 22 * s, ex + Math.cos(fa + .3) * 40 * s, ey + Math.sin(fa + .3) * 40 * s); ctx.stroke(); } }
    ctx.restore();
    // tahtalar
    [[wy + 120, -.08], [wy + 300, .1], [wy + 470, -.05], [wy + 620, .07]].forEach(([y, r], i) => { const brk = t > BREAK && i % 2 === 1, q = brk ? t - BREAK : 0; ctx.save(); ctx.translate(W / 2 + (brk ? (i === 1 ? -1 : 1) * 700 * q : 0), y + (brk ? -200 * q + 900 * q * q : 0)); ctx.rotate(r + (brk ? (i === 1 ? -2 : 2.4) * q : 0)); ctx.fillStyle = "#050404"; ctx.fillRect(-560, -34, 1120, 68); ctx.fillStyle = "rgba(255,150,70,.25)"; ctx.fillRect(-560, -34, 1120, 3); ctx.restore(); });
    // çerçeve ve iç duvar
    ctx.fillStyle = "#010102"; ctx.fillRect(0, 0, wx, H); ctx.fillRect(wx + ww, 0, W - wx - ww, H); ctx.fillRect(0, 0, W, wy); ctx.fillRect(0, wy + wh, W, H);
    if (t > BREAK) { const q = t - BREAK; ctx.globalCompositeOperation = "lighter"; for (let i = 0; i < 80; i++) { const an = rnd(i) * TAU, v = 300 + 900 * rnd(i * 3), x = W / 2 + Math.cos(an) * v * q, y = 480 + Math.sin(an) * v * q + 800 * q * q; ctx.fillStyle = i % 3 ? `rgba(220,230,255,${clamp(1 - q)})` : `rgba(255,180,100,${clamp(1 - q)})`; ctx.save(); ctx.translate(x, y); ctx.rotate(q * 10 + i); ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, 5); ctx.lineTo(-4, 4); ctx.fill(); ctx.restore(); } ctx.globalCompositeOperation = "source-over"; }
    F.glowS(W / 2, 560, 900, FIRE, .25 * fl); F.rain(t, .5, .1, [[W / 2, 560, 700, .8]]);
  }
  function sRun(t) { // 91.5–97.5: yanan sokakta koşuş, arkadan sürü akın ediyor
    const second = t >= beat(32), lt = t - beat(26);
    if (!second) {
      F.setCam({ x: lt * 380 - 60, y: -105, f: 2.7, hy: 560 }); F.hand(t, 1.6);
      city(t, { fireX: 6000, near: true, top: "#0c0808", hor: "#3a2418" });
      for (const [D, n] of [[6, 7], [3.2, 5]]) { F.L(D); for (let i = 0; i < n; i++) { const x = -1000 + i * 1300 + (D < 4 ? 400 : 0); ctx.fillStyle = "#050506"; ctx.fillRect(x, -2800, 900, 2800); ctx.fillStyle = `rgba(255,${110 + i * 12},40,.8)`; for (let w = 0; w < 4; w++) ctx.fillRect(x + 120 + w * 190, -2200 + (i % 2) * 400, 90, 150); F.fire(ctx, x + 450, -2100 + (i % 2) * 400, 260, t, i * 3 + D, .9); } F.haze(.08, "80,50,40"); }
      F.ground("#120b08", "#020202"); F.reflect(C.hy + C.shy - C.y * F.sc(1e4), 380, .4);
      F.L(1.4); for (let i = -2; i < 12; i++) F.fire(ctx, i * 520 + 120, 0, 90, t, i + 40, .9);
      F.L(1.2); const rx = lt * 380 + 80;
      for (let i = 0; i < 16; i++) { const zx = rx - 700 - i * 60 - (i % 3) * 40, [x, y, s] = F.pr(zx, 0, 1.2 + (i % 4) * .6); F.scr(); F.crowdSprite(ctx, F.CROWD_RUN, i, t * 13 + i, x, y, s, 1, 1, .6, .7); }
      F.L(1.2); F.figure(ctx, rx, 0, 1, 1, E, F.P.run(t * 12.5), { t, weapon: "machete", rims: [{ c: "rgba(255,140,60,.95)", dx: -3 }], halo: { c: "#ff7a2a", a: .35 } });
      F.figure(ctx, rx + 110, 0, 1, 1, SA, F.P.run(t * 13 + 2), { t, weapon: "smg", rims: [{ c: "rgba(255,140,60,.95)", dx: -3 }], halo: { c: "#ff7a2a", a: .35 }, hairLag: -6 });
      F.embers(t, 120, 1); F.rain(t, .8, .25, [[W * .3, 500, 800, .7]]);
    } else { // köşeden taşan sürü
      const k = p(t, beat(32), beat(38)); F.setCam({ x: 0, y: -90, f: 2.6, hy: 600 }); F.hand(t, 1.8);
      city(t, { fireX: 800, near: true, top: "#0c0808", hor: "#3d2418" });
      F.L(4); ctx.fillStyle = "#040405"; ctx.fillRect(900, -5000, 3000, 5000); ctx.fillRect(-4000, -4200, 2400, 4200);
      const [cx, cy] = F.pr(600, -600, 12); F.glowS(cx, cy, 1100, FIRE, .6); F.rays(cx, cy, 1300, .1, t * .02);
      F.ground("#120b08", "#020202"); F.reflect(C.hy + C.shy - C.y * F.sc(1e4), 320, .35);
      const zs = []; for (let i = 0; i < 90; i++) { const st = beat(32) + (i / 90) * 2.6, q = t - st; if (q < 0) continue; zs.push({ i, D: 5.5 - q * 1.9 - (i % 5) * .35, x: 650 - q * 560 + ((i * 37) % 600) - 300 }); }
      zs.filter(z => z.D > .9).sort((a, b) => b.D - a.D).forEach(z => { const [x, y, s] = F.pr(z.x, 0, z.D); F.scr(); F.crowdSprite(ctx, F.CROWD_RUN, z.i, t * 13 + z.i, x, y, s, -1, clamp((14 - z.D) / 6), .8, .45 * clamp(1.3 - z.D / 6)); });
      F.fogLayer(t, 600, .3, 40, 1.6, .02); F.embers(t, 140, 1); F.rain(t, .8, .2, [[cx, cy, 900, .8]]);
    }
  }
  const LAND = beat(42), ROAR_FL = beat(46);
  function sTank(t) { // 97.5–103.5: tank yanan arabanın üstüne atlar, kükrer
    const air = t < LAND, k = p(t, beat(38), LAND), fl = pulseAt(t, [LAND, ROAR_FL], .35);
    F.setCam({ x: air ? -300 : 0, y: air ? -420 : -210, f: air ? 2.1 : lerp(3.3, 3.8, p(t, LAND, 103.5)), hy: air ? 600 : 690 }); F.hand(t, 1.3, [LAND, ROAR_FL], 42, .8);
    city(t, { fireX: -1200, near: true, top: "#0a0707", hor: "#33201a" });
    F.ground("#0e0a08", "#020202"); F.reflect(C.hy + C.shy - C.y * F.sc(1e4), 300, .3);
    F.L(3); const crush = air ? 0 : eOut(p(t, LAND, LAND + .3));
    F.car(ctx, 0, 1, crush * -.05, 1.3); ctx.save(); ctx.translate(0, crush * 30); ctx.restore();
    const [cx, cy] = F.pr(0, -200, 3); F.fire(ctx, -120, -140, 150, t, 21, 1.1); F.fire(ctx, 180, -150, 120, t, 22, 1); F.smoke(ctx, 60, -500, 260, t, 8, 10, 1, .7);
    F.glowS(cx, cy, 1000, FIRE, .55 + .2 * fl); F.rays(cx, cy + 60, 1300, .12, t * .02);
    F.L(3); const tx = air ? lerp(-900, 0, k) : 0, ty = air ? -210 - Math.sin(k * Math.PI) * 700 : -210 + crush * 25;
    const P = air ? F.P.leap(k) : t < LAND + .5 ? F.P.land(p(t, LAND, LAND + .5)) : F.P.roar(eOut(p(t, LAND + .4, LAND + 1.1)) * (.9 + .1 * Math.sin(t * 20)));
    F.figure(ctx, tx, ty, 1, 1, TK, P, { t, jaw: air ? .2 : p(t, LAND + .5, LAND + 1), rims: [{ c: "rgba(255,150,70,.95)", dy: 4, dx: 0 }, { c: "rgba(255,120,50,.7)", dx: -3 }], halo: { c: "#ff7a2a", a: .55, blur: 20 } });
    if (!air) { S(); ctx.globalCompositeOperation = "lighter"; const q = t - LAND; for (let i = 0; i < 80; i++) { const an = -Math.PI * rnd(i), v = 300 + 800 * rnd(i * 3), x = cx + Math.cos(an) * v * q, y = cy + Math.sin(an) * v * q + 900 * q * q; ctx.fillStyle = `rgba(255,${150 + 80 * rnd(i)},70,${clamp(1 - q * 1.2)})`; ctx.fillRect(x, y, 3, 3); } ctx.globalCompositeOperation = "source-over"; }
    F.embers(t, 130, 1); F.rain(t, .7, .15, [[cx, cy, 1000, .8]]);
    wht(fl * .9);
  }

  /* ======================= 5) ANİ SESSİZLİK 103.5–118.5 ======================= */
  function sFaces(t) {
    S(); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H); if (t < 106) return;
    const vis = eIO(p(t, 106, 108.6)), die = 1 - eIO(p(t, 117.1, 118.3)), fl = (.8 + .2 * Math.sin(t * 13) * Math.sin(t * 5.1)) * die * vis;
    F.setCam({ x: 0, y: -168, f: 7.4 + .35 * p(t, 106, 118), hy: 560 }); F.hand(t, .35);
    F.glowS(W / 2, H * .82, 700, FIRE, .5 * fl); F.glowS(W / 2, H * .9, 260, "255,190,120", .45 * fl);
    const br = Math.sin(t * 1.7);
    F.L(1); F.figure(ctx, -44, 8, 1, 1, E, F.P.face(t, br), { t: t * .4, amb: [26, 28, 36], rims: [{ c: `rgba(255,135,60,${fl})`, dx: 1.1, dy: -.3 }], halo: { c: "#ff7a2a", a: .25 * fl, blur: 18 } });
    F.figure(ctx, 44, 2, 1, -1, SA, F.P.face(t + 1, Math.sin(t * 2.3)), { t: t * .4, amb: [26, 28, 36], rims: [{ c: `rgba(255,135,60,${fl})`, dx: -1.1, dy: -.3 }], halo: { c: "#ff7a2a", a: .25 * fl, blur: 18 } });
    F.embers(t, 26 * die, .8 * die, W / 2 - 200, W / 2 + 200, H + 40); F.rain(t, .3 * vis, .08, [[W / 2, H * .82, 500, fl]]);
    blk(1 - vis);
  }

  /* ======================= 6) KAPANIŞ 118.5–133.5 (tam ekran) ======================= */
  function sClose(t) {
    S(); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    if (t < 123.5) {
      F.setCam({ x: 0, y: -150, f: 1, hy: 560 }); F.hand(t, .3, [118.5], 20, .6);
      const k = p(t, 118.5, 123.5); F.fogLayer(t, 760, .25, 20, 1.4, 0); F.embers(t, 70, .7);
      const s = t < 119 ? lerp(1.35, .98, eOut(p(t, 118.5, 119))) : lerp(.98, 1, eOut(p(t, 119, 119.5)));
      const sc = Math.min(1500 / GAME_TITLE.width, 360 / GAME_TITLE.height) * s * lerp(1, 1.04, k), tw = GAME_TITLE.width * sc, th = GAME_TITLE.height * sc, cy = H / 2 - 40;
      S(); ctx.drawImage(GAME_TITLE, W / 2 - tw / 2 + C.shx, cy - th / 2 + C.shy, tw, th);
      const lk = eOut(p(t, 119.6, 120.4)); ctx.fillStyle = "#e0342b"; ctx.fillRect(W / 2 - 420 * lk, cy + 160, 840 * lk, 2);
      text("UNTIL YOUR LAST BREATH.", W / 2 + 6, cy + 222, { size: 30, sp: 12, weight: 300, alpha: p(t, 120.2, 120.9), color: "#e9e2d2", shadow: false });
      wht(1 - eOut(p(t, 118.5, 119.1)));
    } else if (t < 126.5) {
      const L2 = IMG.logoFinal; if (L2) { const w = 980, h = w * L2.height / L2.width; S(); ctx.drawImage(L2, (W - w) / 2, (H - h) / 2, w, h); }
    } else if (t < 129.7) {
      const a = 1 - p(t, 129.3, 129.7);
      text("COMING SOON", W / 2 + 12, H / 2 + 30, { font: FD, size: 150, sp: 24, alpha: a, color: "#e9e2d2", shadow: false });
      text("Cinematic trailer. Not actual gameplay footage.", W / 2, H / 2 + 110, { size: 22, sp: 3, weight: 300, alpha: a * .7, color: "#e9e2d2", shadow: false });
    } else { // yaş sınırı kartı (verilen görsel, olduğu gibi)
      const a = Math.min(eOut(p(t, 129.7, 130.1)), 1 - p(t, 132.6, 133.5)), R = IMG.rating;
      if (R) { const h = 620, w = h * R.width / R.height; S(); ctx.globalAlpha = a; ctx.filter = "contrast(1.25)"; ctx.drawImage(R, (W - w) / 2, (H - h) / 2, w, h); ctx.filter = "none"; ctx.globalAlpha = 1; } // JPEG siyahı saf siyaha çekilir
    }
  }

  // Kesmelerde 2–3 karelik siyah/beyaz flaş (patlama bölümü)
  const CUTS4 = [beat(8), beat(18), beat(26), beat(32), beat(38)];
  F.SCENES = [
    [20, 27, sAerial, "Sessiz dünya · şehir"], [27, 30.5, sTraffic, "Trafik lambası"], [30.5, 34.8, sRadio, "Radyo"], [34.8, 41.5, sEthanBack, "Ethan"],
    [41.5, 46, sCampWide, "Ateş başı"], [46, 49, sCampSarah, "Sarah"], [49, 52, sCampFire, "Ateş"], [52, 56.5, sCampEthan, "Ethan"],
    [56.5, 69.5, sStreet, "Yükseliş · sürü"], [69.5, 72.9, sCards, "Yazılar"], [72.9, 78.5, sDark, "Karanlık"],
    [78.5, 82.5, sMuzzle, "Patlama · flaşlar"], [82.5, 87.5, sSwing, "Pala"], [87.5, 91.5, sWindow, "Pencere"], [91.5, 97.5, sRun, "Koşuş"], [97.5, 103.5, sTank, "Tank"],
    [103.5, 118.5, sFaces, "Ani sessizlik"], [118.5, 133.51, sClose, "Kapanış"],
  ];
  F.render = t => {
    const sc = F.SCENES.find(s => t >= s[0] && t < s[1]) || F.SCENES[F.SCENES.length - 1];
    ctx.save(); sc[2](t); ctx.restore(); S();
    const cut = CUTS4.find(c => t >= c && t < c + 3 / 30); if (cut) { const i = CUTS4.indexOf(cut); (i % 2 ? wht : blk)(1); }
    const full = t >= 118.5;
    F.post(t, { ca: full ? .4 : 1, bloom: full ? .3 : .55 });
    return sc[3];
  };
  F.cuts = CUTS4; F.beat = beat; F.marks = { FLASH3, LAND, ROAR_FL, BREAK, LIGHT4, FLASHES };
})();
