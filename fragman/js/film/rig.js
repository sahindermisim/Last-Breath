"use strict";
/* =========================================================================
   SİLUET İSKELETİ
   Her karakter, anatomik parçaların (kalça, karın, göğüs kafesi, trapez, deltoid,
   uyluk, baldır, bot, kafa, saç, ceket) birleşiminden oluşan bir maske olarak çizilir.
   Parçalar hafif bulanıklaştırılıp eşiklenerek organik biçimde kaynaştırılır;
   kıyafet konturlarına düzensizlik eklenir. Yüz, göz, ağız çizilmez.
   Yerel birim: ayak y=0, yukarı negatif, profilde yüz +x. Boy ≈ 185.
   ========================================================================= */
const F = {};
(() => {
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const up = a => [Math.sin(a), -Math.cos(a)], dn = a => [Math.sin(a), Math.cos(a)], fw = a => [Math.cos(a), Math.sin(a)];
  const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const lp = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

  /* ---------- çizim ilkelleri (maske bağlamında, beyaz dolgu) ---------- */
  let G = null; // etkin maske bağlamı
  const E = (c, rx, ry, a = 0) => ell(G, c[0], c[1], rx, ry, a);
  function smooth(pts) { const n = pts.length; G.beginPath(); let s = lp(pts[n - 1], pts[0], .5); G.moveTo(s[0], s[1]); for (let i = 0; i < n; i++) { const m = lp(pts[i], pts[(i + 1) % n], .5); G.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } G.closePath(); G.fill(); }
  // Kas profilli uzuv; bn/bm iki yandaki şişkinlik, nz kumaş düzensizliği
  function LIMB(a, b, w0, w1, bn = 0, bm = 0, at = .4, nz = 0, seed = 0) {
    const dx = b[0] - a[0], dy = b[1] - a[1], Ln = Math.hypot(dx, dy) || 1, n = [-dy / Ln, dx / Ln], N = 7, A = [], Bs = [];
    for (let i = 0; i <= N; i++) {
      const q = i / N, c = lp(a, b, q), hw = lerp(w0, w1, q) / 2, bump = Math.pow(Math.sin(Math.PI * clamp(q < at ? q / at * .5 : .5 + (q - at) / (1 - at) * .5)), 1.3);
      const j1 = nz * (rnd(seed + i * 1.7) - .5), j2 = nz * (rnd(seed + i * 2.3 + 9) - .5);
      A.push(add(c, mul(n, hw + bn * bump + j1))); Bs.push(add(c, mul(n, -(hw + bm * bump + j2))));
    }
    G.beginPath(); G.moveTo(A[0][0], A[0][1]); for (let i = 1; i <= N; i++) G.lineTo(A[i][0], A[i][1]); for (let i = N; i >= 0; i--) G.lineTo(Bs[i][0], Bs[i][1]); G.closePath(); G.fill();
    circ(G, a[0], a[1], w0 / 2); circ(G, b[0], b[1], w1 / 2);
  }
  function POLY(pts, nz = 0, seed = 0) {
    if (!nz) return smooth(pts);
    const out = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / l, d[0] / l];
      out.push(a); for (let k = 1; k < 3; k++) out.push(add(lp(a, b, k / 3), mul(n, nz * (rnd(seed + i * 5 + k) - .5)))); }
    smooth(out);
  }
  function RIB(pts, w0, w1) { // incelen şerit
    const n = pts.length, Ls = [], Rs = [];
    for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / (n - 1)) / 2; Ls.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); Rs.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]); }
    G.beginPath(); G.moveTo(Ls[0][0], Ls[0][1]); for (let i = 1; i < n; i++) G.lineTo(Ls[i][0], Ls[i][1]); for (let i = n - 1; i >= 0; i--) G.lineTo(Rs[i][0], Rs[i][1]); G.closePath(); G.fill();
  }
  const chain = (p0, len, a0, curl, n = 5) => { const pts = [p0]; for (let i = 1; i <= n; i++) pts.push(add(pts[i - 1], mul(fw(a0 + curl * i / n), len / n))); return pts; };

  /* ---------- yapılar ---------- */
  const BUILD = {
    ethan: { len: 1.05, gi: 1.1, sh: 1.2, arm: 1, head: 1, neck: 1, jacket: 1, bandana: 1, hair: "messy", seed: 3 },
    sarah: { len: .93, gi: .8, sh: .84, arm: .95, head: .96, neck: 1.08, jacket: .5, hair: "long", seed: 5, slim: 1 },
    tank: { len: 1.5, gi: 1, sh: 1, arm: 1, head: .7, neck: .4, zombie: 1, tank: 1, seed: 9, rags: .4 },
  };
  F.zombieBuild = i => { const R = mulberry(1000 + i * 17), gaunt = R() < .4;
    return { len: .86 + R() * .24, gi: gaunt ? .72 + R() * .15 : .95 + R() * .35, sh: .85 + R() * .3, arm: 1.02 + R() * .12, head: .92 + R() * .14, neck: .8 + R() * .3,
      zombie: 1, rags: .5 + R() * .5, hair: R() < .35 ? "stringy" : R() < .6 ? "messy" : "bald", jaw: R(), seed: 200 + i * 7, lean: .22 + R() * .3, hunch: .15 + R() * .35, jacket: R() < .4 ? .6 : 0, roll: (R() - .5) * .35, tilt: (R() - .5) * .9, reach: R() < .5 ? 0 : 1, oneArm: R() < .1 }; };
  F.BUILD = BUILD;
  F.limb = (g, a2, b2, w0, w1, bn = 0, bm = 0) => { const old = G; G = g; LIMB(a2, b2, w0, w1, bn, bm); G = old; };

  /* ---------- profil pozları ---------- */
  const pose = (o = {}) => Object.assign({ lean: .04, hunch: .08, neck: .08, hipY: 0, bx: 0,
    nL: { h: -.05, k: .1, f: 0 }, fL: { h: .08, k: .12, f: 0 }, nA: { s: .1, e: .3, w: .1 }, fA: { s: -.05, e: .28, w: .1 } }, o);
  F.pose = pose;
  const leg = (ph, A = .42, K = 1.05) => ({ h: A * Math.sin(ph) + .02, k: .1 + K * .8 * Math.pow(Math.max(0, Math.cos(ph - .15)), 2.2), f: .22 * Math.sin(ph) - .3 * Math.max(0, -Math.sin(ph + .5)) });
  F.P = {
    stand: (t = 0) => pose({ lean: .04 + .008 * Math.sin(t * 1.4), hunch: .1, neck: .12, hipY: 1.5, nL: { h: -.02, k: .06, f: 0 }, fL: { h: .16, k: .26, f: .06 }, nA: { s: .12 + .012 * Math.sin(t * 1.4), e: .32, w: .15 }, fA: { s: -.02, e: .38, w: .1 } }),
    walk: (ph, a = 1) => pose({ lean: .08, hunch: .1, neck: .1, hipY: -2.5 * Math.cos(2 * ph), nL: leg(ph, .42 * a, 1.05 * a), fL: leg(ph + Math.PI, .42 * a, 1.05 * a), nA: { s: -.34 * Math.sin(ph) * a + .08, e: .3 + .25 * Math.max(0, -Math.sin(ph)), w: .12 }, fA: { s: .34 * Math.sin(ph) * a, e: .3 + .25 * Math.max(0, Math.sin(ph)), w: .12 } }),
    run: ph => pose({ lean: .32, hunch: .08, neck: -.1, hipY: -6 * Math.cos(2 * ph) - 4, nL: leg(ph, .8, 1.9), fL: leg(ph + Math.PI, .8, 1.9), nA: { s: -.95 * Math.sin(ph) + .1, e: 1.5, w: .2 }, fA: { s: .95 * Math.sin(ph) + .1, e: 1.5, w: .2 } }),
    shamble: (ph, B, v = 0) => { const s = Math.sin(ph), wob = Math.sin(ph * .5 + v * 3), reach = B.reach;
      return pose({ lean: (B.lean ?? .3) + .07 * wob, hunch: (B.hunch ?? .3) + .06 * Math.sin(ph + v), neck: .5 + .18 * Math.sin(ph * .7 + v), hipY: -3 * Math.abs(Math.cos(ph)) + 3,
        nL: { h: .3 * s + .04, k: .14 + .6 * Math.pow(Math.max(0, Math.cos(ph + .3)), 2), f: .1 * s }, fL: { h: -.12 * s + .08, k: .22 + .12 * Math.max(0, -s), f: -.35 },
        nA: reach ? { s: 1.1 + .12 * Math.sin(ph + v), e: .25, w: .35 } : { s: .22 + .2 * Math.sin(ph + 1 + v), e: .2, w: .45 },
        fA: reach ? { s: .15 + .12 * Math.sin(ph + 2), e: .15, w: .4 } : { s: .95 + .15 * Math.sin(ph + v * 2), e: .35, w: .3 } }); },
    sit: (t = 0) => pose({ lean: .32 + .012 * Math.sin(t * 1.2), hunch: .26, neck: .3, hipY: 72, nL: { h: 2.0, k: 1.92, f: .1 }, fL: { h: 1.78, k: 1.72, f: .05 }, nA: { s: .62, e: .95, w: .3 }, fA: { s: .5, e: 1.1, w: .2 } }),
    swing: k => { const e = eIO(clamp(k)); return pose({ lean: lerp(-.12, .4, e), hunch: .1, neck: lerp(-.1, .1, e), hipY: 5, nL: { h: .6, k: .45, f: .1 }, fL: { h: -.42, k: .32, f: -.1 },
      nA: { s: lerp(-2.6, 1.3, e), e: lerp(-.9, .1, e), w: lerp(-.4, .3, e) }, fA: { s: lerp(.9, -.8, e), e: .9, w: 0 } }); },
    aim: (rec = 0) => pose({ lean: -.02 - rec * .08, hunch: .04, neck: -.02, nL: { h: .26, k: .16, f: 0 }, fL: { h: -.24, k: .14, f: 0 }, nA: { s: 1.45 - rec * .18, e: .06, w: 0 }, fA: { s: 1.22 - rec * .15, e: .42, w: 0 } }),
    rack: k => pose({ lean: .06, hunch: .14, neck: .2, nL: { h: .22, k: .14, f: 0 }, fL: { h: -.2, k: .12, f: 0 }, nA: { s: .95, e: .9, w: 0 }, fA: { s: .7 + .35 * Math.sin(clamp(k) * Math.PI), e: 1.15, w: 0 } }),
    roar: k => pose({ lean: lerp(.55, -.1, k), hunch: lerp(.55, .2, k), neck: lerp(.35, -.75, k), hipY: 8, nL: { h: .5, k: .55, f: 0 }, fL: { h: -.35, k: .55, f: 0 }, nA: { s: lerp(.5, 2.15, k), e: lerp(.3, .65, k), w: 0 }, fA: { s: lerp(.3, 1.85, k), e: .55, w: 0 } }),
    leap: k => pose({ lean: .6, hunch: .45, neck: .15, hipY: -10, nL: { h: 1.45, k: 2.1, f: .2 }, fL: { h: .5, k: 1.5, f: 0 }, nA: { s: lerp(2.6, 1.3, k), e: .3, w: 0 }, fA: { s: lerp(2.2, 1.1, k), e: .4, w: 0 } }),
    land: k => pose({ lean: .75, hunch: .5, neck: .2, hipY: lerp(40, 14, k), nL: { h: 1.2, k: 1.9, f: 0 }, fL: { h: -.2, k: 1.4, f: -.2 }, nA: { s: .6, e: .2, w: 0 }, fA: { s: .3, e: .3, w: 0 } }),
    lunge: k => pose({ lean: .55 * k + .2, hunch: .3, neck: .12, nL: { h: .7 * k, k: .35, f: 0 }, fL: { h: -.5 * k, k: .6 * k, f: -.2 }, nA: { s: 1.55, e: .05, w: -.2 }, fA: { s: 1.35, e: .12, w: -.1 } }),
    hit: k => pose({ lean: lerp(.3, -.55, k), hunch: .2, neck: lerp(.2, -1, k), hipY: 4, nL: { h: .3, k: .25, f: 0 }, fL: { h: -.3, k: .3, f: 0 }, nA: { s: lerp(1, 2.6, k), e: .3, w: 0 }, fA: { s: lerp(.8, 2.2, k), e: .4, w: 0 } }),
    face: (t = 0, breath = 0) => pose({ lean: .06, hunch: .14 + breath * .02, neck: .14 - breath * .03, nA: { s: .15, e: .5, w: .1 }, fA: { s: .1, e: .5, w: .1 } }),
  };
  F.mix = (a, b, k) => { const o = {}; for (const key in a) o[key] = typeof a[key] === "object" ? F.mix(a[key], b[key], k) : lerp(a[key], b[key], k); return o; };

  /* ---------- profil eklemleri ---------- */
  function jP(B, P) {
    const L = B.len * (B.tank ? 1.45 : 1), TK = B.tank ? 1 : 0, TH = (44 - TK * 8) * L, SH = (44 - TK * 9) * L, AH = 8 * L, LU = (30 + TK * 6) * L, TO = (29 + TK * 6) * L, NK = 10 * L * B.neck, HR = 12 * L * B.head, UA = (30 + TK * 7) * L * B.arm, FA = (27.5 + TK * 9) * L * B.arm;
    const pel = [P.bx, -(TH + SH + AH) * .975 + P.hipY], a1 = P.lean, a2 = a1 + P.hunch, a3 = a2 + P.neck;
    const chest = add(pel, mul(up(a1), LU)), neck = add(chest, mul(up(a2), TO)), hb = add(neck, mul(up(a3), NK)), head = add(add(hb, mul(up(a3), HR * .78)), mul(fw(a3), 1.8 * L));
    const shoulder = add(neck, add(mul(dn(a2), (9 + TK * 6) * L), mul(fw(a2), (-2.5 + TK * 4) * L)));
    const lg = l => { const knee = add(pel, mul(dn(l.h), TH)), ank = add(knee, mul(dn(l.h - l.k), SH)); return { knee, ank, f: l.f }; };
    const ar = a => { const el = add(shoulder, mul(dn(a.s), UA)), wr = add(el, mul(dn(a.s + a.e), FA)); return { el, wr, dir: a.s + a.e + a.w }; };
    return { L, pel, chest, neck, hb, head, HR, shoulder, a1, a2, a3, LU, TO, nL: lg(P.nL), fL: lg(P.fL), nA: ar(P.nA), fA: ar(P.fA) };
  }
  function bootP(J, l, big = 1) { const a = l.ank, L = J.L * big, R = v => add(a, rot(mul(v, L), -l.f)); POLY([R([-6, -12]), R([-9.5, 1]), R([-9, 8]), R([6, 8.5]), R([21, 8]), R([23, 3.5]), R([17, -2]), R([7, -5]), R([6, -12])]); }
  function handP(J, arm, B, grip) {
    const L = J.L * (B.tank ? 2.2 : 1), d = dn(arm.dir), n = [-d[1], d[0]], w = arm.wr;
    if (grip) { E(add(w, mul(d, 5 * L)), 5.8 * L, 5 * L); return; }
    if (B.zombie && !B.tank) { E(add(w, mul(d, 4 * L)), 5 * L, 3.8 * L, Math.atan2(d[1], d[0])); G.lineCap = "round";
      for (let i = -1.5; i <= 1.5; i++) { const b0 = add(w, mul(d, 7 * L)), tip = add(b0, add(mul(d, 9 * L), mul(n, i * 2.6 * L))); G.lineWidth = 2.3 * L; G.strokeStyle = "#fff"; G.beginPath(); G.moveTo(b0[0], b0[1]); G.quadraticCurveTo(tip[0] + n[0] * i * 1.5, tip[1] + n[1] * i * 1.5, tip[0] + d[0] * 2.5 * L, tip[1] + d[1] * 2.5 * L); G.stroke(); } return; }
    E(add(w, mul(d, 6 * L)), 8 * L, 4.2 * L, Math.atan2(d[1], d[0])); E(add(add(w, mul(d, 3 * L)), mul(n, 3.5 * L)), 3.4 * L, 2.2 * L, Math.atan2(d[1], d[0]) + .6);
  }
  function weaponP(J, arm, kind) {
    if (!kind) return null;
    const L = J.L, d = dn(arm.dir + (kind === "machete" ? -.3 : kind === "pistol" ? -1.5 : 0)), n = [-d[1], d[0]];
    const w = add(arm.wr, mul(dn(arm.dir), 5 * L)), Q = (x, y) => add(w, add(mul(d, x * L), mul(n, y * L)));
    if (kind === "machete") { POLY([Q(-10, -2.4), Q(6, -2.8), Q(6, 2.8), Q(-10, 2.4)]); G.beginPath(); [Q(6, -3.8), Q(40, -5.8), Q(58, -9), Q(67, -6.5), Q(64, 1), Q(40, 4.2), Q(6, 3.8)].forEach((q, i) => i ? G.lineTo(q[0], q[1]) : G.moveTo(q[0], q[1])); G.closePath(); G.fill();
      return { tip: Q(65, -4), edge: [Q(8, -3.8), Q(40, -5.8), Q(58, -9), Q(67, -6.5)] }; }
    if (kind === "pistol") { POLY([Q(-4, -3.2), Q(23, -3.2), Q(23, 1.6), Q(7, 2), Q(4, 11), Q(-3, 11), Q(-2, 2)]); return { tip: Q(24, -1) }; }
    if (kind === "smg") { POLY([Q(-26, -1), Q(-8, -4.5), Q(31, -4.5), Q(31, 1), Q(11, 2), Q(9, 13), Q(3, 13), Q(1, 2), Q(-8, 2.5), Q(-24, 5.5)]); return { tip: Q(34, -1.8) }; }
    if (kind === "shotgun") { POLY([Q(-40, 3), Q(-14, -3.5), Q(62, -4.8), Q(62, 0), Q(36, 1.2), Q(36, 4.5), Q(12, 4.5), Q(8, 1), Q(-6, 3.5), Q(-38, 8.5)]); return { tip: Q(64, -2.5) }; }
    return null;
  }
  function drawTank(B, P, J, o) {
    const L = J.L, t = o.t || 0, sd = B.seed, nz = 3 * L;
    const leg = (l, i) => { LIMB(J.pel, l.knee, 34 * L, 23 * L, -3 * L, 4 * L, .35, nz, sd + i); LIMB(l.knee, l.ank, 23 * L, 15 * L, 5 * L, 1 * L, .3, nz, sd + i + 5);
      const a = l.ank, Rr = v => add(a, rot(mul(v, L), -l.f)); POLY([Rr([-8, -10]), Rr([-12, 2]), Rr([-10, 9]), Rr([12, 9]), Rr([24, 7]), Rr([22, 1]), Rr([10, -6])], nz, sd + i + 9); };
    leg(J.fL, 0); leg(J.nL, 1);
    const sp = u => u <= 1 ? add(J.pel, mul(up(J.a1), J.LU * u)) : add(J.chest, mul(up(J.a2), J.TO * (u - 1)));
    const o1 = (b, a0, f0, u0 = 0) => add(add(b, mul(fw(a0), f0 * L)), mul(up(a0), u0 * L));
    POLY([o1(J.pel, J.a1, -22, -6), o1(sp(.5), J.a1, -27), o1(J.chest, J.a2, -33, 4), o1(J.neck, J.a2, -30, 10), o1(J.neck, J.a2, -14, 20), o1(J.neck, J.a2, 4, 12), o1(J.neck, J.a2, 16, -2),
      o1(J.chest, J.a2, 32, 2), o1(sp(.5), J.a1, 30, -2), o1(J.pel, J.a1, 22, -4), o1(J.pel, J.a1, 0, -18)], 3 * L, sd + 40);
    const R = mulberry(sd + 2); 
    // kafa: omuzların arasına gömülü, öne çıkık çene
    const hc = add(add(J.neck, mul(fw(J.a3), 16 * L)), mul(up(J.a3), 4 * L)), jaw = clamp(o.jaw || 0);
    E(hc, 10 * L, 9.5 * L, J.a3); POLY([add(hc, rot([4 * L, -9 * L], J.a3)), add(hc, rot([15 * L, -3 * L], J.a3)), add(hc, rot([16 * L, 3 * L], J.a3)), add(hc, rot([14 * L, (6 + jaw * 10) * L], J.a3)), add(hc, rot([8 * L, (12 + jaw * 9) * L], J.a3)), add(hc, rot([-4 * L, 10 * L], J.a3))], 1.5 * L, sd + 3);
    const arm = (a, i) => { LIMB(J.shoulder, a.el, 34 * L, 24 * L, 4 * L, 3 * L, .35, nz, sd + i * 7 + 20);
      LIMB(a.el, a.wr, 25 * L, 17 * L, 7 * L, 4 * L, .4, nz, sd + i * 7 + 30); const d = dn(a.dir); E(add(a.wr, mul(d, 8 * L)), 12 * L, 10 * L, Math.atan2(d[1], d[0])); };
    arm(J.fA, 0); arm(J.nA, 1);
    J.head = hc;
    return null;
  }
  function drawP(B, P, J, o) {
    if (B.tank) return drawTank(B, P, J, o);
    const L = J.L, gi = B.gi, t = o.t || 0, z = !!B.zombie, TK = B.tank ? 1 : 0, sd = B.seed, jk = B.jacket || 0, nz = (z ? 3.5 : jk ? 1.4 : .6) * L;
    const leg = (l, i) => {
      LIMB(J.pel, l.knee, (19 + TK * 16) * L * gi, (12.5 + TK * 10) * L * Math.sqrt(gi), (-1.5) * L, 2.5 * L, .35, nz, sd + i * 40);
      LIMB(l.knee, l.ank, (12.5 + TK * 10) * L * Math.sqrt(gi), (8 + TK * 6) * L, 2.8 * L, .5 * L, .3, nz * .8, sd + i * 40 + 20);
      E(add(l.ank, [0, -8 * L]), 6 * L, 5 * L); bootP(J, l, TK ? 1.7 : 1);
    };
    const arm = (a, i) => {
      const sl = jk ? 1.15 : 1, tk = TK ? 2.5 : 1;
      E(add(J.shoulder, mul(dn(a.s - .05), 7 * L)), 9 * L * sl * tk * B.sh, 12 * L * tk, a.s + Math.PI / 2);
      LIMB(J.shoulder, a.el, 14.5 * L * gi * sl * tk, 11 * L * gi * sl * tk, 1.2 * L * tk, 1.4 * L * tk, .4, nz, sd + i * 60);
      LIMB(a.el, a.wr, 11.5 * L * gi * sl * tk, (jk ? 10 : 7) * L * Math.sqrt(gi) * tk, 1.6 * L * tk, .6 * L, .3, nz * .8, sd + i * 60 + 30);
    };
    // bacaklar, kalça, karın, göğüs
    leg(J.fL, 0); leg(J.nL, 1);
    const sp = u => u <= 1 ? add(J.pel, mul(up(J.a1), J.LU * u)) : add(J.chest, mul(up(J.a2), J.TO * (u - 1)));
    E(add(J.pel, add(mul(fw(J.a1), -3 * L), mul(up(J.a1), 1 * L))), 15.5 * L * gi, 13.5 * L, J.a1);
    E(add(sp(.5), mul(fw(J.a1), 1 * L)), 13 * L * gi, 17 * L, J.a1);
    E(add(sp(1.35), mul(fw(J.a2), .5 * L)), (15.5 + TK * 18) * L * gi * (B.slim ? .92 : 1), (19 + TK * 14) * L, J.a2);
    E(add(add(J.neck, mul(dn(J.a2), 9 * L)), mul(fw(J.a2), -5 * L)), (10 + TK * 22) * L * B.sh, (12 + TK * 16) * L, J.a2 - .3);
    if (TK) { E(add(add(J.neck, mul(dn(J.a2), -2 * L)), mul(fw(J.a2), -14 * L)), 26 * L, 22 * L, J.a2 - .6); E(add(sp(.5), mul(fw(J.a1), 6 * L)), 26 * L, 24 * L); }
    // ceket kabuğu
    if (jk) {
      const b = v => add(sp(v[0]), mul(fw(v[0] <= 1 ? J.a1 : J.a2), v[1] * L * gi)), wv = Math.sin(t * 5 + (o.hemPh || 0)) * 2 * L - (o.vx || 0) * 3 * L;
      POLY([b([1.95, 8.5]), b([1.55, 17]), b([1.05, 16]), b([.45, 14.5]), add(b([-.45, 16.5 * jk + 2]), [wv * .5, 0]), add(b([-.55, 4]), [wv, 0]), add(b([-.5, -19 * jk - 2]), [wv * 1.3, 0]), b([.3, -14.5]), b([1.1, -16]), b([1.7, -16.5]), b([1.98, -8])], nz, sd + 90);
    }
    if (z && B.rags) { const R = mulberry(sd + 7); for (let i = 0; i < 5; i++) { const side = R() < .5 ? 1 : -1, base = add(sp(-.2 + R() * .5), mul(fw(J.a1), side * (12 + R() * 3) * L * gi)), ln = (8 + R() * 16) * L * B.rags; RIB([base, add(base, [(R() - .5) * 5 + Math.sin(t * 3 + i) * 2, ln * .5]), add(base, [(R() - .5) * 7 + Math.sin(t * 3 + i) * 3, ln])], 6 * L, 1.2 * L); } }
    // boyun + kafa
    LIMB(J.neck, J.hb, (12.5 + TK * 20) * L, (10.5 + TK * 12) * L);
    const H = J.HR, HP = (x, y) => add(J.head, rot([x * H / 12, y * H / 12], J.a3)), jaw = z ? 2 + (B.jaw || 0) * 5 : 0;
    E(J.head, H * .98, H * 1.06, J.a3);
    POLY([HP(7.5, -9.5), HP(11.3, -4), HP(13, 1.3), HP(11, 3.8), HP(11.3, 6.3 + jaw * .3), HP(10, 8.8 + jaw), HP(5, 12.2 + jaw * .7), HP(-3, 10.5), HP(-6, 0), HP(0, -11)]);
    // saç / bandana
    const R = mulberry(sd + 11);
    if (B.hair === "messy") for (let i = 0; i < 11; i++) { const a0 = -2.95 + i * .2, rr = 12 + 3.5 + R() * 3.5, base = HP(Math.cos(a0) * 11, Math.sin(a0) * 12), tip = HP(Math.cos(a0 - .35) * rr, Math.sin(a0 - .35) * (rr + 1) + Math.sin(t * 3 + i) * .6), b2 = HP(Math.cos(a0 + .2) * 11, Math.sin(a0 + .2) * 12); G.beginPath(); G.moveTo(base[0], base[1]); G.quadraticCurveTo(lp(base, tip, .5)[0] - 1, lp(base, tip, .5)[1] - 1, tip[0], tip[1]); G.lineTo(b2[0], b2[1]); G.fill(); }
    if (B.hair === "stringy") { G.strokeStyle = "#fff"; G.lineCap = "round"; G.lineWidth = 1.6 * L; for (let i = 0; i < 7; i++) { const a0 = -2.9 + i * .28, b0 = HP(Math.cos(a0) * 11.5, Math.sin(a0) * 12.5); G.beginPath(); G.moveTo(b0[0], b0[1]); G.quadraticCurveTo(b0[0] - 6 * L, b0[1] + 9 * L, b0[0] - 4 * L + Math.sin(t * 2 + i) * 2, b0[1] + (14 + R() * 10) * L); G.stroke(); } }
    if (B.hair === "long") { const sw = Math.sin(t * 2.1) * 2.5 + (o.hairLag || 0), top = HP(-1, -13.2);
      POLY([HP(9, -9.5), HP(4, -13.8), HP(-5, -13.5), HP(-12, -8), HP(-14.5, 0), add(J.neck, [(-15 + sw * .3) * L, 4 * L]), add(J.neck, [(-19 + sw * .7) * L, 22 * L]), add(J.neck, [(-15 + sw) * L, 40 * L]), add(J.neck, [(-9 + sw * .8) * L, 30 * L]), add(J.neck, [(-6 + sw * .4) * L, 12 * L]), HP(-5, 8), HP(-3, 0), HP(3, -7)]);
      G.strokeStyle = "#fff"; G.lineWidth = 1.6 * L; G.lineCap = "round"; for (let i = 0; i < 3; i++) { const b0 = add(J.neck, [(-12 - i * 3 + sw) * L, (34 + i * 2) * L]); G.beginPath(); G.moveTo(b0[0], b0[1]); G.quadraticCurveTo(b0[0] - 2, b0[1] + 6 * L, b0[0] + sw * .5 - i, b0[1] + (9 + i * 3) * L); G.stroke(); } }
    if (B.bandana) { G.strokeStyle = "#fff"; G.lineWidth = 4.8 * L; G.lineCap = "butt"; G.beginPath(); G.ellipse(J.head[0], J.head[1], H * 1.02, H * 1.1, J.a3, -2.9, -.5); G.stroke();
      const knot = HP(-12, -4.8); E(knot, 3.8 * L, 3.2 * L); const vx = o.vx || 0, gust = Math.sin(t * 5.3) * .5 + Math.sin(t * 8.9 + 1) * .25;
      for (let k = 0; k < 2; k++) RIB(chain(knot, (k ? 19 : 25) * L, 1.72 + k * .38 + clamp(vx, 0, 1.4) * .9 + gust * .2 + J.a3 * .5, .35 * Math.sin(t * 6.5 + k * 2) + .25 - vx * .15, 6), 4 * L, 1.3 * L); }
    // kollar, silah, eller
    arm(J.fA, 0); handP(J, J.fA, B, !!o.farGrip);
    const wp = weaponP(J, J.nA, o.weapon);
    arm(J.nA, 1); handP(J, J.nA, B, !!o.weapon);
    if (TK) { E(J.nA.wr, 17 * L, 14 * L); E(J.fA.wr, 16 * L, 13 * L); }
    return wp;
  }

  /* ---------- önden / arkadan ---------- */
  F.front = (o = {}) => Object.assign({ bob: 0, sway: 0, roll: 0, hunch: 0, tilt: 0, drop: 0, legs: [{ lift: 0, out: .08 }, { lift: 0, out: .08 }], arms: [{ out: .1, fwd: 0, bend: .15 }, { out: .1, fwd: 0, bend: .15 }] }, o);
  F.frontWalk = (ph, B, v = 0) => { const zb = !!B.zombie, s = Math.sin(ph), reach = B.reach;
    return F.front({ bob: -3 * Math.abs(Math.cos(ph)), sway: 5 * s, roll: (zb ? B.roll : 0) + .07 * s, hunch: zb ? B.hunch + .25 : .06, tilt: zb ? B.tilt + .14 * Math.sin(ph * .5 + v) : .02 * s, drop: zb ? .35 + .1 * Math.sin(ph * .7) : 0,
      legs: [{ lift: Math.max(0, s) * (zb ? .55 : .8), out: .1 }, { lift: Math.max(0, -s) * (zb ? .28 : .8), out: .12 }],
      arms: zb ? [{ out: .08 + .05 * Math.sin(ph + v), fwd: reach ? .7 + .1 * s : .02, bend: .15 }, { out: .14, fwd: reach ? .05 : .55 + .1 * Math.sin(ph + 1), bend: .2 }] : [{ out: .1, fwd: .18 * s, bend: .25 }, { out: .1, fwd: -.18 * s, bend: .25 }] }); };
  function drawF(B, P, o) {
    const L = B.len * (B.tank ? 1.45 : 1), gi = B.gi, t = o.t || 0, back = !!o.back, z = !!B.zombie, TK = B.tank ? 1 : 0, jk = B.jacket || 0, nz = (z ? 4 : jk ? 1.5 : .6) * L, sd = B.seed;
    const TH = 44 * L, SH = 44 * L, AH = 8 * L, HW = 9.5 * L * gi * (TK ? 1.8 : 1), SW = 20 * L * B.sh * (TK ? 2.1 : 1), TOR = 60 * L * (1 - .12 * P.hunch);
    const pel = [P.sway, -(TH + SH + AH) * .975 + P.bob], C = add(pel, [P.sway * .25, -TOR]), shp = s => add(C, [s * SW, (2 + s * P.roll * 16) * L]);
    [-1, 1].forEach((s, i) => { const lg = P.legs[i], hip = add(pel, [s * HW, 0]), knee = add(hip, [s * lg.out * 10 * L, TH * (1 - .28 * lg.lift)]), ank = add(knee, [s * 1.5 * L, SH * (1 - .12 * lg.lift) - lg.lift * 20 * L]);
      LIMB(hip, knee, (18 + TK * 16) * L * gi, (12.5 + TK * 8) * L * Math.sqrt(gi), s * -1 * L, s * 1.5 * L, .35, nz, sd + i * 30); LIMB(knee, ank, (12.5 + TK * 8) * L * Math.sqrt(gi), (8 + TK * 5) * L, s * -2.4 * L, s * .6 * L, .3, nz * .8, sd + i * 30 + 9);
      POLY([add(ank, [-7 * L, -8 * L]), add(ank, [7 * L, -8 * L]), add(ank, [8.5 * L, 7 * L]), add(ank, [-8.5 * L, 7 * L])]); });
    E(pel, 17 * L * gi * (TK ? 1.6 : 1), 12 * L); E(add(pel, [0, -TOR * .42]), 15 * L * gi * (TK ? 2 : 1), 17 * L * (TK ? 1.4 : 1));
    E(add(C, [0, 16 * L]), (18 * gi * (B.slim ? .85 : 1)) * L * B.sh * (TK ? 2 : 1), 21 * L * (TK ? 1.5 : 1));
    // trapez eğimi + omuzlar
    POLY([add(C, [-6 * L, -14 * L]), add(C, [6 * L, -14 * L]), add(shp(1), [2 * L, -4 * L]), add(shp(1), [0, 10 * L]), add(shp(-1), [0, 10 * L]), add(shp(-1), [-2 * L, -4 * L])], nz * .5, sd + 5);
    [-1, 1].forEach(s => E(add(shp(s), [s * -1 * L, 4 * L]), 8.5 * L * (TK ? 2.2 : 1) * (jk ? 1.15 : 1), 11 * L * (TK ? 2 : 1), s * .25));
    if (TK) E(add(C, [0, -10 * L]), SW * .7, 22 * L);
    if (jk) { const wv = Math.sin(t * 5) * 1.5 * L; POLY([add(shp(-1), [-3 * L, 2 * L]), add(shp(1), [3 * L, 2 * L]), add(C, [17 * L * gi, TOR * .45]), add(pel, [(HW + 6 * L) + wv, (2 + 7 * jk) * L]), add(pel, [0, (4 + 7 * jk) * L]), add(pel, [-(HW + 6 * L) + wv, (2 + 7 * jk) * L]), add(C, [-17 * L * gi, TOR * .45])], nz, sd + 17); }
    if (z && B.rags) { const R = mulberry(sd + 21); for (let i = 0; i < 5; i++) { const x0 = (R() - .5) * 2 * HW * 1.4, base = add(pel, [x0, 4 * L]), ln = (8 + R() * 16) * L * B.rags; RIB([base, add(base, [Math.sin(t * 3 + i) * 2, ln * .5]), add(base, [Math.sin(t * 3 + i) * 3 + (R() - .5) * 5, ln])], 6 * L, 1.2 * L); } }
    [-1, 1].forEach((s, i) => { if (B.oneArm && s > 0) return; const a = P.arms[i], S = add(shp(s), [0, 3 * L]), fs = Math.cos(a.fwd * 1.25), tk = TK ? 2.3 : 1, sl = jk ? 1.15 : 1;
      const el = add(S, [s * Math.sin(a.out) * 30 * L * B.arm * fs * (TK ? 1.3 : 1), Math.cos(a.out) * 30 * L * B.arm * fs * (TK ? 1.3 : 1) - a.fwd * 10 * L]), wr = add(el, [s * Math.sin(a.out + a.bend * .4) * 27 * L * B.arm * fs, 27 * L * B.arm * fs * Math.cos(a.out) * (TK ? 1.3 : 1) - a.fwd * 18 * L]);
      LIMB(S, el, 14 * L * gi * tk * sl, 10.5 * L * gi * tk * sl, s * 1 * L, s * -1 * L, .4, nz, sd + i * 50); LIMB(el, wr, 11 * L * gi * tk * sl, (jk ? 9.5 : 7) * L * tk, s * 1.4 * L, 0, .3, nz * .8, sd + i * 50 + 7);
      E(add(wr, [0, 5 * L * fs]), (5 + a.fwd * 2.5) * L * (TK ? 2.2 : 1), (7.5 - a.fwd * 2) * L * (TK ? 2 : 1));
      if (z && !TK) { G.strokeStyle = "#fff"; G.lineCap = "round"; G.lineWidth = 2.1 * L; for (let f = -1.5; f <= 1.5; f++) { G.beginPath(); G.moveTo(wr[0] + f * 1.6 * L, wr[1] + 8 * L); G.lineTo(wr[0] + f * 3.2 * L, wr[1] + (15 - a.fwd * 6) * L); G.stroke(); } }
      if (o.weapon === "machete" && s === (back ? 1 : -1)) { const b0 = add(wr, [0, 8 * L]); G.beginPath(); [add(b0, [-2.5 * L, 0]), add(b0, [3 * L, 0]), add(b0, [5 * L, 50 * L]), add(b0, [2 * L, 62 * L]), add(b0, [-2.5 * L, 58 * L])].forEach((q, j) => j ? G.lineTo(q[0], q[1]) : G.moveTo(q[0], q[1])); G.closePath(); G.fill(); }
    });
    const hc = add(C, [Math.sin(P.tilt) * 7 * L, -(10 * B.neck + 13) * L * (1 - .7 * P.drop) + TK * 10 * L]), HX = 10.3 * L * B.head, HY = 12.6 * L * B.head;
    LIMB(add(C, [0, -8 * L]), hc, (12 + TK * 26) * L, (10.5 + TK * 10) * L);
    G.save(); G.translate(hc[0], hc[1]); G.rotate(P.tilt);
    ell(G, 0, 0, HX, HY); ell(G, 0, HY * .45, HX * .78, HY * .62); ell(G, -HX, HY * .05, 2 * L, 3.2 * L); ell(G, HX, HY * .05, 2 * L, 3.2 * L);
    const R = mulberry(sd + 3);
    if (B.hair === "messy") for (let i = 0; i < 13; i++) { const a0 = -Math.PI - .2 + i * (Math.PI + .4) / 12, bx = Math.cos(a0) * HX, by = Math.sin(a0) * HY; G.beginPath(); G.moveTo(bx * .85, by * .85); G.lineTo(bx * (1.2 + R() * .12) + Math.sin(t * 3 + i) * .5, by * (1.15 + R() * .1)); G.lineTo(Math.cos(a0 + .22) * HX * .9, Math.sin(a0 + .22) * HY * .9); G.fill(); }
    if (B.hair === "long") { const sw = Math.sin(t * 2.1) * 2; POLY([[-HX * 1.12, -HY * .5], [0, -HY * 1.12], [HX * 1.12, -HY * .5], [HX * 1.3 + sw, HY * 1.2], [HX * 1.5 + sw, HY * 3.2], [HX * .6 + sw, HY * 2.6], [0, HY * 1.3], [-HX * .6 + sw, HY * 2.6], [-HX * 1.5 + sw, HY * 3.2], [-HX * 1.3 + sw, HY * 1.2]]); }
    if (B.hair === "stringy") { G.strokeStyle = "#fff"; G.lineWidth = 1.5 * L; G.lineCap = "round"; for (let i = 0; i < 8; i++) { const x0 = (i / 7 - .5) * HX * 1.8; G.beginPath(); G.moveTo(x0, -HY * .8); G.quadraticCurveTo(x0 * 1.3, 0, x0 * 1.25 + Math.sin(t * 2 + i) * 2, HY * (1.2 + R() * .6)); G.stroke(); } }
    if (B.bandana) { G.strokeStyle = "#fff"; G.lineWidth = 4.8 * L; G.beginPath(); G.ellipse(0, -HY * .1, HX * 1.04, HY * .98, 0, back ? .05 : Math.PI + .05, back ? Math.PI - .05 : -.05); G.stroke();
      if (back) { E([0, -HY * .3], 4.2 * L, 3.6 * L); const gust = Math.sin(t * 5.3) * 3 + Math.sin(t * 8.9) * 1.5;
        for (const k of [-1, 1]) RIB([[k * 2 * L, -HY * .3], [k * 7 * L + gust * .4, HY * .1], [k * 11 * L + gust * .9, HY * .6], [k * 12 * L + gust * 1.3, HY * 1.2], [k * 10 * L + gust * 1.6, HY * 1.7]], 4.4 * L, 1.4 * L); } }
    G.restore();
  }

  /* ---------- maske üretimi ve bileştirme ---------- */
  const A = mk(16, 16), AX = A.getContext("2d"), M = mk(16, 16), MX = M.getContext("2d", { willReadFrequently: true }), T = mk(16, 16), TX2 = T.getContext("2d");
  const fit = (c, w, h) => { if (c.width < w || c.height < h) { c.width = Math.max(c.width, w); c.height = Math.max(c.height, h); } };
  // res: maske pikseli / birim. Dönen maske M üzerinde, ayak noktası (ox, oy).
  function buildMask(B, P, o, res) {
    const Ls = B.len * (B.tank ? 1.45 : 1), wU = (B.tank ? 170 : 190) * Ls, hU = (B.tank ? 230 : 250) * Ls, w = Math.ceil(wU * res * 2), h = Math.ceil(hU * res), ox = w / 2, oy = h - Math.ceil(26 * Ls * res);
    fit(A, w, h); fit(M, w, h);
    AX.setTransform(1, 0, 0, 1, 0, 0); AX.clearRect(0, 0, w, h); AX.setTransform(res, 0, 0, res, ox, oy); AX.fillStyle = "#fff"; AX.strokeStyle = "#fff";
    G = AX; let wp = null, J = null;
    if (o.front) drawF(B, P, o); else { J = jP(B, P); wp = drawP(B, P, J, o); }
    // kaynaştır: hafif bulanıklık + eşik
    const br = Math.max(.6, 1.1 * res);
    MX.setTransform(1, 0, 0, 1, 0, 0); MX.clearRect(0, 0, w, h); MX.filter = `blur(${br}px)`; MX.drawImage(A, 0, 0, w, h, 0, 0, w, h); MX.filter = "none";
    const d = MX.getImageData(0, 0, w, h), a = d.data;
    for (let i = 3; i < a.length; i += 4) { const v = a[i]; a[i] = v < 90 ? 0 : v > 150 ? 255 : (v - 90) * 4.25; a[i - 1] = a[i - 2] = a[i - 3] = 255; }
    MX.putImageData(d, 0, 0);
    return { c: M, w, h, ox, oy, J, wp };
  }
  function tint(mask, col) { fit(T, mask.w, mask.h); TX2.setTransform(1, 0, 0, 1, 0, 0); TX2.globalCompositeOperation = "source-over"; TX2.clearRect(0, 0, mask.w, mask.h); TX2.drawImage(mask.c, 0, 0, mask.w, mask.h, 0, 0, mask.w, mask.h); TX2.globalCompositeOperation = "source-in"; TX2.fillStyle = col; TX2.fillRect(0, 0, mask.w, mask.h); TX2.globalCompositeOperation = "source-over"; return T; }

  // o: {front, back, weapon, t, rims:[{c,dx,dy}], halo:{c,a,blur}, col, alpha, rot, bladeRim, vx}
  F.figure = (g, x, y, s, dir, B, P, o = {}) => {
    const m = g.getTransform(), ss = Math.hypot(m.a, m.b) * s, res = clamp(ss, .3, 6), mk2 = buildMask(B, P, o, res);
    const put = (canvas, dx, dy, alpha, comp, filt) => { g.save(); g.translate(x + dx, y + dy); if (o.rot) g.rotate(o.rot); g.scale(dir * s / res, s / res); g.globalAlpha = alpha * (o.alpha ?? 1); if (comp) g.globalCompositeOperation = comp; if (filt) g.filter = filt; g.drawImage(canvas, 0, 0, mk2.w, mk2.h, -mk2.ox, -mk2.oy, mk2.w, mk2.h); g.restore(); };
    if (o.halo && o.halo.a > 0) put(tint(mk2, o.halo.c), 0, 0, o.halo.a, "lighter", `blur(${(o.halo.blur ?? 12)}px)`);
    for (const r of o.rims || []) put(tint(mk2, r.c), (r.dx || 0) * .45, (r.dy || 0) * .45, r.a ?? 1);
    put(tint(mk2, o.col || "#020203"), 0, 0, 1);
    const W2 = pt => { let v = [pt[0] * s * dir, pt[1] * s]; if (o.rot) v = rot(v, o.rot); return [x + v[0], y + v[1]]; };
    if (mk2.wp && mk2.wp.edge && o.bladeRim) { g.save(); g.strokeStyle = o.bladeRim; g.lineWidth = Math.max(.8, 1.2 * s) / Math.hypot(m.a, m.b) * 1.2; g.beginPath(); mk2.wp.edge.map(W2).forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke(); g.restore(); }
    if (!mk2.J) return { head: W2([0, -178 * B.len]) };
    const J = mk2.J;
    return { head: W2(J.head), neck: W2(J.neck), chest: W2(J.chest), hand: W2(J.nA.wr), tip: mk2.wp ? W2(mk2.wp.tip) : null, pel: W2(J.pel), face: W2(add(J.head, rot([13 * J.HR / 12, 2 * J.HR / 12], J.a3))) };
  };

  /* ---------- önceden çizilmiş sürü kareleri ---------- */
  const SPR = { res: 1.1 };
  F.SPR = SPR;
  F.bakeCrowd = () => {
    const make = (B, poseFn, front, frames) => {
      const out = [];
      for (let f = 0; f < frames; f++) {
        const ph = f / frames * TAU, mk3 = buildMask(B, poseFn(ph), { front, t: ph * .5 }, SPR.res);
        // sıkı kırp
        const c = mk(mk3.w, mk3.h), g = c.getContext("2d"); g.drawImage(mk3.c, 0, 0, mk3.w, mk3.h, 0, 0, mk3.w, mk3.h); g.globalCompositeOperation = "source-in"; g.fillStyle = "#000"; g.fillRect(0, 0, mk3.w, mk3.h);
        const h = mk(mk3.w, mk3.h), hg = h.getContext("2d"); hg.filter = "blur(4px)"; hg.drawImage(mk3.c, 0, 0, mk3.w, mk3.h, 0, 0, mk3.w, mk3.h); hg.filter = "none"; hg.globalCompositeOperation = "source-in"; hg.fillStyle = "#ff7a2a"; hg.fillRect(0, 0, mk3.w, mk3.h);
        out.push({ c, h, ox: mk3.ox, oy: mk3.oy, w: mk3.w, hh: mk3.h });
      }
      return out;
    };
    F.CROWD_FRONT = []; F.CROWD_SIDE = []; F.CROWD_RUN = [];
    for (let i = 0; i < 8; i++) { const B = F.zombieBuild(i); F.CROWD_FRONT.push(make(B, ph => F.frontWalk(ph, B, i), true, 10)); }
    for (let i = 0; i < 6; i++) { const B = F.zombieBuild(20 + i); F.CROWD_SIDE.push(make(B, ph => F.P.shamble(ph, B, i), false, 10)); }
    for (let i = 0; i < 5; i++) { const B = Object.assign(F.zombieBuild(40 + i), { lean: .35 }); F.CROWD_RUN.push(make(B, ph => F.mix(F.P.run(ph), F.P.shamble(ph, B, i), .35), false, 10)); }
  };
  F.crowdSprite = (g, set, v, ph, x, y, s, dir, a = 1, ha = 0) => {
    const frames = set[v % set.length], n = frames.length, fr = frames[((Math.floor(ph / TAU * n) % n) + n) % n], k = s / SPR.res;
    g.save(); g.translate(x, y); g.scale(dir * k, k);
    if (ha > 0) { g.globalCompositeOperation = "lighter"; g.globalAlpha = Math.min(1, ha); g.drawImage(fr.h, -fr.ox, -fr.oy); g.globalCompositeOperation = "source-over"; }
    g.globalAlpha = a; g.drawImage(fr.c, -fr.ox, -fr.oy); g.restore();
  };
})();
