"use strict";
/* =========================================================================
   SES — tek mix fonksiyonu hem canlı önizlemede hem çevrimdışı render'da kullanılır
   ========================================================================= */
let AC = null, bus = null, rev = null, noiseBuf = null, AR = Math.random, MIX = { t0: 0, when: 0 };
const TT = t => MIX.when + (t - MIX.t0);
function env(pr, at, a, peak, d) { pr.setValueAtTime(.0001, at); pr.linearRampToValueAtTime(Math.max(.0002, peak), at + a); pr.exponentialRampToValueAtTime(.0001, at + a + d); }
function nz(at, dur, { type = "lowpass", f = 1000, f2 = null, q = .7, peak = .5, a = .005, send = 0 } = {}) {
  const s = AC.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
  const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, at); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, at + a + dur); fl.Q.value = q;
  const g = AC.createGain(); env(g.gain, at, a, peak, dur); s.connect(fl).connect(g).connect(bus); if (send) { const sg = AC.createGain(); sg.gain.value = send; g.connect(sg).connect(rev); }
  s.start(at, AR() * 1.5); s.stop(at + a + dur + .1);
}
function tone(at, dur, { type = "sine", f = 60, f2 = null, peak = .5, a = .005, send = 0 } = {}) {
  const o = AC.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, at); if (f2) o.frequency.exponentialRampToValueAtTime(f2, at + a + dur);
  const g = AC.createGain(); env(g.gain, at, a, peak, dur); o.connect(g).connect(bus); if (send) { const sg = AC.createGain(); sg.gain.value = send; g.connect(sg).connect(rev); }
  o.start(at); o.stop(at + a + dur + .1);
}
const SFX = {
  shot: at => { nz(at, .22, { type: "bandpass", f: 1800, q: .6, peak: .7 }); tone(at, .22, { f: 130, f2: 40, peak: .8 }); },
  shotgun: at => { nz(at, .4, { type: "bandpass", f: 1400, f2: 500, q: .5, peak: .9, send: .2 }); nz(at, .9, { f: 700, f2: 150, peak: .6 }); tone(at, .35, { f: 110, f2: 35, peak: 1 }); },
  smg: (at, n = 3) => { for (let i = 0; i < n; i++) { nz(at + i * .08, .1, { type: "bandpass", f: 2200, q: .7, peak: .45 }); tone(at + i * .08, .08, { f: 160, f2: 60, peak: .35 }); } },
  slash: at => { nz(at - .08, .16, { type: "bandpass", f: 700, f2: 6000, q: 1.4, peak: .55, a: .06 }); tone(at + .03, .18, { f: 95, f2: 45, peak: .6 }); nz(at + .03, .12, { f: 900, peak: .45 }); },
  boom: at => { tone(at, 1.4, { f: 70, f2: 22, peak: 1 }); nz(at, 1.8, { f: 1100, f2: 110, peak: .9, send: .3 }); },
  thud: at => { tone(at, .6, { f: 58, f2: 26, peak: 1 }); nz(at, .35, { f: 260, peak: .5 }); },
  softThud: at => tone(at, .9, { f: 48, f2: 24, peak: .5, send: .3 }),
  cut: at => { tone(at, .28, { f: 90, f2: 38, peak: .55 }); nz(at, .14, { type: "highpass", f: 3000, peak: .15 }); },
  whoosh: at => nz(at - .35, .15, { type: "bandpass", f: 250, f2: 3200, q: 1.6, peak: .3, a: .35 }),
  ping: at => { tone(at, .35, { type: "triangle", f: 2400, f2: 1800, peak: .12 }); nz(at, .05, { type: "highpass", f: 4000, peak: .3 }); },
  hit: at => { SFX.boom(at); SFX.thud(at); nz(at, .6, { type: "highpass", f: 1500, peak: .5, send: .5 }); [98, 155.6, 233.1, 311].forEach(f => tone(at, 3.6, { f, peak: .08, a: .01, send: .6 })); tone(at, 4, { f: 36, f2: 30, peak: .6 }); },
  shimmer: (at, dur = 1.5) => { [1318.5, 1975.5, 2637, 3951].forEach((f, i) => tone(at, dur * .5, { f, peak: .06 / (i + 1), a: dur * .5, send: .5 })); nz(at, dur * .4, { type: "highpass", f: 6500, peak: .06, a: dur * .6 }); },
  riser: (at, dur = 3) => { nz(at, .12, { type: "bandpass", f: 150, f2: 2500, q: 2, peak: .25, a: dur }); },
  thunder: at => { nz(at, .12, { type: "highpass", f: 2500, peak: .5 }); nz(at + .05, 3.4, { f: 520, f2: 70, peak: 1, a: .08, send: .4 }); tone(at, 2.4, { f: 44, f2: 24, peak: .6 }); },
  growl: (at, low = false) => {
    const o = AC.createOscillator(), l = AC.createOscillator(), lg = AC.createGain(), fl = AC.createBiquadFilter(), g = AC.createGain(), sg = AC.createGain();
    o.type = "sawtooth"; o.frequency.value = low ? 42 : 70 + AR() * 20; l.frequency.value = low ? 5 : 9; lg.gain.value = low ? 8 : 14; fl.type = "lowpass"; fl.frequency.value = low ? 300 : 520;
    l.connect(lg).connect(o.frequency); env(g.gain, at, .15, low ? .45 : .18, low ? 1.6 : .8); sg.gain.value = .3;
    o.connect(fl).connect(g).connect(bus); g.connect(sg).connect(rev); o.start(at); l.start(at); o.stop(at + 2); l.stop(at + 2);
  },
  ritual: (at, dur = .6) => { [110, 116.5, 164.8, 55].forEach(f => tone(at, dur, { f, peak: .07, a: .05, send: .5 })); nz(at, dur, { type: "bandpass", f: 900, q: 8, peak: .1, send: .5 }); },
  horde: (at, dur = .6) => { nz(at, dur, { f: 180, peak: .5, a: .05 }); SFX.growl(at + .05); SFX.growl(at + .2); },
  pump: at => { nz(at, .05, { type: "bandpass", f: 2800, q: 4, peak: .5 }); nz(at + .14, .06, { type: "bandpass", f: 2000, q: 4, peak: .55 }); tone(at + .14, .06, { f: 700, peak: .12 }); },
  tink: at => tone(at, .3, { type: "triangle", f: 3600 + AR() * 1800, peak: .07, send: .3 }),
  splash: at => { nz(at, .3, { type: "bandpass", f: 1400, f2: 500, q: .8, peak: .35 }); for (let i = 0; i < 4; i++) tone(at + .08 + i * .05, .06, { f: 1800 + AR() * 1500, peak: .03 }); },
  drag: at => nz(at, .55, { f: 420, peak: .16, a: .12 }),
  wood: at => { nz(at, .2, { type: "bandpass", f: 650, q: 2, peak: .9 }); tone(at, .16, { f: 170, f2: 80, peak: .5 }); nz(at + .02, .1, { type: "highpass", f: 3000, peak: .3 }); },
  rocket: at => { tone(at, .35, { f: 95, f2: 38, peak: .9 }); nz(at, .5, { f: 600, peak: .6, send: .3 }); nz(at + .02, .7, { type: "bandpass", f: 900, f2: 3200, q: .8, peak: .45 }); },
  ignite: at => { nz(at, .1, { type: "bandpass", f: 400, f2: 3000, q: 1.2, peak: .3, a: .35 }); SFX.shimmer(at + .1, .8); },
  hitLite: at => { tone(at, 1.2, { f: 45, f2: 25, peak: .7 }); nz(at, .5, { type: "highpass", f: 1500, peak: .35, send: .4 }); },
  heart: (at, s = 1) => { tone(at, .14, { f: 62, f2: 40, peak: .9 * s }); nz(at, .08, { f: 120, peak: .3 * s }); tone(at + .2, .12, { f: 52, f2: 36, peak: .6 * s }); },
  rack: at => { nz(at, .07, { type: "bandpass", f: 2600, q: 3, peak: .55 }); nz(at + .06, .16, { type: "bandpass", f: 1300, f2: 2600, q: 2, peak: .35 }); nz(at + .25, .04, { type: "highpass", f: 3000, peak: .6 }); tone(at + .25, .06, { f: 900, peak: .12 }); },
  kick: at => { tone(at, .25, { f: 95, f2: 42, peak: .6 }); nz(at, .03, { type: "highpass", f: 2000, peak: .06 }); },
  taiko: at => { tone(at, .5, { f: 78, f2: 45, peak: .75, send: .3 }); nz(at, .3, { f: 300, f2: 120, peak: .4 }); },
  hat: at => nz(at, .04, { type: "highpass", f: 7000, peak: .08 }),
  braam: at => {
    const fl = AC.createBiquadFilter(), g = AC.createGain(), sg = AC.createGain(); fl.type = "lowpass"; fl.frequency.setValueAtTime(250, at); fl.frequency.linearRampToValueAtTime(1300, at + .25); fl.frequency.exponentialRampToValueAtTime(220, at + 1.8);
    env(g.gain, at, .03, .32, 1.9); sg.gain.value = .5; fl.connect(g).connect(bus); g.connect(sg).connect(rev);
    [55, 55.4, 82.4, 110].forEach(f => { const o = AC.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.connect(fl); o.start(at); o.stop(at + 2.1); });
    SFX.taiko(at);
  },
  growlFar: at => {
    const o = AC.createOscillator(), l = AC.createOscillator(), lg = AC.createGain(), fl = AC.createBiquadFilter(), g = AC.createGain(), sg = AC.createGain();
    o.type = "sawtooth"; o.frequency.value = 48; l.frequency.value = 6; lg.gain.value = 9; fl.type = "lowpass"; fl.frequency.value = 260;
    l.connect(lg).connect(o.frequency); env(g.gain, at, .4, .09, 1.6); sg.gain.value = 1.4; o.connect(fl).connect(g).connect(bus); g.connect(sg).connect(rev); o.start(at); l.start(at); o.stop(at + 2.3); l.stop(at + 2.3);
  },
  creak: at => { tone(at, .6, { type: "sawtooth", f: 95, f2: 72, peak: .035, a: .15 }); nz(at, .6, { type: "bandpass", f: 900, f2: 700, q: 9, peak: .05, a: .15 }); },
  thunderFar: at => { nz(at, 3.5, { f: 220, f2: 60, peak: .45, a: .6, send: .5 }); tone(at, 3, { f: 38, f2: 28, peak: .3, a: .5 }); },
  gun: at => { nz(at, .06, { type: "highpass", f: 2500, peak: .8 }); nz(at, .5, { type: "bandpass", f: 1200, f2: 300, q: .5, peak: 1, send: .45 }); tone(at, .4, { f: 120, f2: 32, peak: 1 }); nz(at + .02, 1.6, { f: 500, f2: 90, peak: .35, send: .6 }); },
  slashSlow: at => { nz(at - .5, .3, { type: "bandpass", f: 180, f2: 1400, q: 1.6, peak: .5, a: .5, send: .4 }); },
  glass: at => { nz(at, .5, { type: "highpass", f: 3500, peak: .55, send: .3 }); for (let i = 0; i < 14; i++) tone(at + AR() * .5, .25 + AR() * .3, { type: "triangle", f: 2500 + AR() * 5000, peak: .035, send: .3 }); },
  tankRoar: at => { SFX.growl(at, true); SFX.growl(at + .05, true); nz(at, 1.4, { type: "bandpass", f: 320, f2: 140, q: 1.2, peak: .7, a: .08, send: .5 }); tone(at, 1.6, { type: "sawtooth", f: 55, f2: 38, peak: .25, a: .06 }); tone(at, 1.8, { f: 34, f2: 26, peak: .6 }); },
  breathF: (at, dur = 1.3) => { nz(at, dur * .45, { type: "bandpass", f: 1300, f2: 1000, q: 1, peak: .12, a: dur * .45 }); nz(at + dur * .5, dur * .4, { type: "bandpass", f: 900, f2: 700, q: 1, peak: .08, a: .1 }); },
  crackleSoft: at => nz(at, .02 + AR() * .03, { type: "bandpass", f: 2500 + AR() * 3000, q: 1.5, peak: .03 + AR() * .05 }),
  tvOn: at => { nz(at, .05, { type: "highpass", f: 1500, peak: .5 }); tone(at, .4, { f: 15600, peak: .02 }); },
  tvOff: at => { tone(at, .35, { f: 900, f2: 60, peak: .3 }); nz(at, .08, { type: "highpass", f: 2000, peak: .4 }); },
  glitch: at => { for (let i = 0; i < 6; i++) nz(at + i * .09, .05, { type: "bandpass", f: 400 + AR() * 3000, q: 3, peak: .35 }); },
  radioClick: at => { nz(at, .03, { type: "highpass", f: 2500, peak: .4 }); },
  crackle: at => nz(at, .02 + AR() * .03, { type: "bandpass", f: 2500 + AR() * 3000, q: 1.5, peak: .08 + AR() * .12 }),
  breath: (at, dur = 1.6) => { nz(at, dur * .45, { type: "bandpass", f: 900, f2: 700, q: .9, peak: .16, a: dur * .45 }); nz(at + dur * .5, dur * .4, { type: "bandpass", f: 600, f2: 450, q: .9, peak: .1, a: .1 }); },
  inhale: at => nz(at, .05, { type: "bandpass", f: 700, f2: 1400, q: 1, peak: .22, a: .5 }),
  // Konuşmaya benzeyen boğuk mırıltı: TV / kayıt sesleri için (TTS yerine, altyazının altında doku)
  murmur: (at, dur, style = "tv") => {
    const src = AC.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const buzz = AC.createOscillator(); buzz.type = "sawtooth"; buzz.frequency.setValueAtTime(style === "tv" ? 125 : 105, at);
    const bg = AC.createGain(); bg.gain.value = .25; const mix = AC.createGain();
    src.connect(mix); buzz.connect(bg).connect(mix);
    const f1 = AC.createBiquadFilter(); f1.type = "bandpass"; f1.Q.value = 5;
    const radio = AC.createBiquadFilter(); radio.type = "bandpass"; radio.frequency.value = 1500; radio.Q.value = 1.1;
    const g = AC.createGain(); g.gain.setValueAtTime(0, at);
    for (let s = 0; s < dur - .15; s += .13 + AR() * .1) {
      const f = 450 + AR() * 1800, amp = (AR() < .12 ? 0 : .5 + AR() * .5) * (style === "tv" ? .22 : .18);
      f1.frequency.setValueAtTime(f, at + s); buzz.frequency.setValueAtTime((style === "tv" ? 115 : 98) + AR() * 30, at + s);
      g.gain.setValueAtTime(0, at + s); g.gain.linearRampToValueAtTime(amp, at + s + .03); g.gain.linearRampToValueAtTime(amp * .3, at + s + .11);
    }
    g.gain.setValueAtTime(0, at + dur);
    mix.connect(f1).connect(radio).connect(g).connect(bus);
    src.start(at, AR()); buzz.start(at); src.stop(at + dur + .1); buzz.stop(at + dur + .1);
  },
};
function interp(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], (t - keys[i - 1][0]) / Math.max(1e-6, keys[i][0] - keys[i - 1][0]));
  return keys[keys.length - 1][1];
}
function keyframes(pr, keys) { pr.setValueAtTime(interp(keys, MIX.t0), MIX.when); for (const [t, v] of keys) if (t > MIX.t0) pr.linearRampToValueAtTime(v, TT(t)); }
const DRONE_KEYS = [[0, 0], [1, .22], [6, .38], [8, .16], [20, .12], [56.5, .12], [72.9, .3], [78.4, .35], [78.5, .2], [103.45, .3], [103.5, 0], [118.5, 0], [118.55, .26], [129.7, .15], [131, .12], [133.5, 0]];
const RAIN_KEYS = [[0, 0], [20, 0], [21, .13], [41.5, .13], [41.6, .07], [56.5, .1], [69.5, .1], [69.6, .02], [72.9, .03], [78.5, .08], [103.45, .08], [103.5, 0], [105.5, 0], [107, .035], [118.4, .035], [118.5, 0]];
const WIND_KEYS = [[0, 0], [20, 0], [21.5, .09], [41.5, .09], [41.6, .03], [56.5, .05], [69.5, 0], [78.5, .04], [103.45, .04], [103.5, 0]];
const TV_KEYS = [[0, 0], [8, 0], [8.05, .16], [14.7, .16], [14.75, .32], [15.35, .32], [15.45, 0], [30.9, 0], [31, .13], [34.05, .13], [34.1, 0]];
const PAD_KEYS = [[0, 0], [20, 0], [22, .025], [41, .025], [42, .06], [56, .06], [56.5, .04], [69.4, .1], [69.6, .05], [78.4, .08], [78.5, .05], [103.45, .05], [103.5, 0], [118.5, 0], [118.6, .05], [129.7, .03], [132, .025], [133.5, 0]];
function musicKeys() {
  const M = CONFIG.music, v = M.volume, keys = [[0, 0], [M.startAt, 0], [M.startAt + 3, v]];
  const wins = [];
  for (const d of DIALOG) { if (d.a > M.cutAt && d.a < M.resumeAt) continue; const w = [d.a - .35, d.b + .45]; const lw = wins[wins.length - 1]; if (lw && w[0] - lw[1] < .5) lw[1] = w[1]; else wins.push(w); }
  for (const [a, b] of wins) keys.push([a, v], [a + .3, v * M.duck], [b - .4, v * M.duck], [b, v]);
  keys.push([M.cutAt - .02, v], [M.cutAt, 0], [M.resumeAt, 0], [M.resumeAt + .7, v], [117.5, v], [CONFIG.duration, 0]);
  return keys.sort((x, y) => x[0] - y[0]);
}
let CUES = [];
function buildCues() {
  // giriş (0:00–0:20) — değiştirilmedi
  const c = [[.8, "riser", 2.8], [3.9, "shimmer", 1.6], [8, "tvOn"], [11.9, "cut"], [14.75, "glitch"], [15.35, "tvOff"], [16.2, "softThud"]];
  for (const d of DIALOG) if (d.kind) c.push([d.a, "murmur", [d.b - d.a, d.kind]]);
  const M = F.marks, R = mulberry(555);
  // 1) sessiz dünya: rüzgâr, uzak gök gürültüsü, kablo gıcırtısı, radyo
  c.push([23.5, "thunderFar"], [27.3, "creak"], [28.4, "creak"], [29.5, "creak"], [27.6, "radioClick"], [28.45, "radioClick"], [29.25, "radioClick"], [29.8, "radioClick"], [30.9, "radioClick"], [34.1, "radioClick"], [36.5, "thunderFar"]);
  // 2) ateş başı: yoğun çıtırtı
  for (let i = 0; i < 150; i++) c.push([41.6 + R() * 14.8, "crackle"]); for (let i = 0; i < 40; i++) c.push([49 + R() * 3, "crackle"]);
  // 3) yükseliş: hızlanan kalp, uzak hırıltılar, kartlar, sürgü, tek atış
  for (let x = 56.5; x < 72.8;) { const q = (x - 56.5) / 16.3; c.push([x, "heart", .5 + .5 * q]); x += lerp(1.2, .4, q); }
  for (let i = 0; i < 9; i++) c.push([59 + i * 1.2 + R() * .5, "growl", i % 3 === 0]);
  c.push([69.7, "hitLite"], [71.4, "hitLite"], [75.6, "rack"], [M.FLASH3, "gun"], [M.FLASH3, "hitLite"]);
  // 4) patlama: ritim (müzik dosyası yoksa sentez), aksiyon sesleri
  if (!MUSIC_AB) {
    for (let n = 0; n < 50; n++) { const x = F.beat(n); c.push([x, "kick"]); if (n >= 18) c.push([x + .25, "hat"]); }
    for (const b of [0, 8, 18, 26, 32, 38]) c.push([F.beat(b), "braam"]);
    c.push([F.beat(38), "riser", 1.9]);
  }
  for (const x of M.FLASHES) c.push([x, "gun"], [x + .05, "growl"]);
  c.push([M.LIGHT4[0], "thunder"], [M.LIGHT4[1], "thunder"], [84.85, "slashSlow"], [85.16, "thud"], [85.2, "growl", true]);
  c.push([87.6, "growl"], [88.3, "wood"], [89.0, "growl"], [M.BREAK, "wood"], [M.BREAK, "glass"], [M.BREAK + .3, "horde", 1]);
  c.push([91.5, "horde", 1.5], [92.6, "smg", 4], [94.5, "horde", 2], [95.3, "growl", true]);
  c.push([98.3, "whoosh"], [M.LAND, "hit"], [M.LAND, "boom"], [M.LAND + .5, "tankRoar"], [M.ROAR_FL, "hitLite"], [M.ROAR_FL, "tankRoar"]);
  // 5) ani sessizlik: iki kişinin nefesi
  for (let x = 104; x < 117.5; x += 2.4) { c.push([x, "breath", 1.5]); c.push([x + 1.2, "breathF", 1.3]); }
  for (let i = 0; i < 40; i++) c.push([106.5 + R() * 11, "crackleSoft"]);
  // 6) kapanış
  c.push([118.5, "hit"], [123.5, "softThud"], [129.7, "softThud"], [131.4, "growlFar"]);
  CUES = c.sort((x, y) => x[0] - y[0]);
}
function makeNoise(ac) { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0), R = mulberry(77); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; return b; }
function makeIR(ac) { const len = ac.sampleRate * 3, b = ac.createBuffer(2, len, ac.sampleRate), R = mulberry(5); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (R() * 2 - 1) * Math.pow(1 - i / len, 3); } return b; }
function bed(make, keys, send = 0) { const g = AC.createGain(); keyframes(g.gain, keys); g.connect(bus); if (send) { const sg = AC.createGain(); sg.gain.value = send; g.connect(sg).connect(rev); } make(g); }
function buildMix(ac, out, t0, when, musicBuf) {
  AC = ac; MIX = { t0, when }; AR = mulberry(1234); noiseBuf = makeNoise(ac);
  const master = ac.createGain(), comp = ac.createDynamicsCompressor(); comp.threshold.value = -10; comp.ratio.value = 3.5; comp.attack.value = .004; comp.release.value = .25;
  const post = ac.createGain(); post.gain.value = .6; // WebAudio kompresörü otomatik makeup gain ekler; kırpılmayı önle
  const clip = ac.createWaveShaper(), curve = new Float32Array(2048);
  for (let i = 0; i < 2048; i++) { const x = i / 1023.5 - 1; curve[i] = Math.tanh(x * 1.6) / Math.tanh(1.6) * .94; }
  clip.curve = curve; // yumuşak sınırlayıcı: çıkış 0 dBFS'e ulaşmaz
  master.connect(comp).connect(post).connect(clip).connect(out);
  bus = ac.createGain(); bus.gain.value = .85; bus.connect(master);
  const conv = ac.createConvolver(); conv.buffer = makeIR(ac); rev = ac.createGain(); rev.gain.value = .5; rev.connect(conv).connect(master);
  const loop = (node, g) => { node.connect(g); node.start(when); node.stop(TT(CONFIG.duration) + .1); };
  const noiseSrc = () => { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s; };
  const filt = (type, f, q = .7) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  bed(g => { const lp = filt("lowpass", 150); lp.connect(g); [36.7, 55.1, 36.9].forEach(f => { const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; loop(o, lp); }); }, DRONE_KEYS);
  bed(g => { const hp = filt("highpass", 900), lp = filt("lowpass", 7000); hp.connect(lp).connect(g); loop(noiseSrc(), hp); }, RAIN_KEYS);
  bed(g => { const lp = filt("lowpass", 400, 2), l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = .15; lg.gain.value = 180; l.connect(lg).connect(lp.frequency); l.start(when); l.stop(TT(CONFIG.duration)); lp.connect(g); loop(noiseSrc(), lp); }, WIND_KEYS);
  bed(g => { const bp = filt("bandpass", 3200, .5); bp.connect(g); loop(noiseSrc(), bp); }, TV_KEYS);
  bed(g => { const lp = filt("lowpass", 1400); lp.connect(g); [110, 130.81, 164.81, 220, 110.4].forEach(f => { const o = ac.createOscillator(); o.frequency.value = f; loop(o, lp); }); }, PAD_KEYS, .6);
  for (const [t, name, arg] of CUES) if (t >= t0 - .01) Array.isArray(arg) ? SFX[name](Math.max(when, TT(t)), ...arg) : SFX[name](Math.max(when, TT(t)), arg);
  if (musicBuf) {
    const M = CONFIG.music, mg = ac.createGain(); mg.connect(master); keyframes(mg.gain, musicKeys());
    const seg = (a, b, trackAt) => { if (t0 >= b) return; const st = Math.max(a, t0), off = trackAt + (st - a); if (off < 0 || off >= musicBuf.duration) return; const s = ac.createBufferSource(); s.buffer = musicBuf; s.connect(mg); s.start(TT(st), off); s.stop(TT(b)); };
    seg(M.startAt, M.cutAt, 0); seg(M.resumeAt, CONFIG.duration, M.resumeFrom);
  }
}

