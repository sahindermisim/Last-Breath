"use strict";
/* =========================================================================
   AYARLAR
   ========================================================================= */
const CONFIG = {
  duration: 110,
  // Her varlık için sırayla denenecek dosya yolları.
  assets: {
    logo:      ["assets/ashbound_logo.jpg"],        // giriş (0:00–0:08) — değiştirilmedi
    logoFinal: ["assets/ashbound_logo_black.png"],  // kapanış kartı, tam ekran olduğu gibi
    gameLogo:  ["assets/last_breath_logo.png"],     // varsa LAST BREATH kartında kullanılır
    music:     ["assets/music.mp3"],                // varsa sentez müziğin yerine geçer
    kare01: ["assets/kareler/kare01.jpg"], ekstra01: ["assets/kareler/ekstra01.jpg"], kare02: ["assets/kareler/kare02.jpg"],
    kare03: ["assets/kareler/kare03.jpg"], kare04: ["assets/kareler/kare04.jpg"], kare05: ["assets/kareler/kare05.jpg"],
    kare06: ["assets/kareler/kare06.jpg"], kare07: ["assets/kareler/kare07.jpg"], kare08: ["assets/kareler/kare08.jpg"],
    kare09: ["assets/kareler/kare09.jpg"], kare10: ["assets/kareler/kare10.jpg"], kare11: ["assets/kareler/kare11.jpg"],
    kare12: ["assets/kareler/kare12.jpg"], kare13: ["assets/kareler/kare13.jpg"],
  },
  // Renk eşitleme: her kare aynı soğuk mavi-gri tona çekilir, yalnızca ateş turuncusu korunur.
  // exp: pozlama çarpanı, warm: turuncunun ne kadar korunacağı.
  grade: { kare05: { exp: .72 }, kare12: { exp: .62, warm: .55 }, kare11: { exp: .9 }, kare08: { exp: .95 } },
  music: {
    startAt: 5,        // parçanın 0. saniyesi fragmanın kaçıncı saniyesinde başlar (zirve 60–85 → 1:05–1:27)
    cutAt: 87,         // ani sessizlik
    resumeAt: 100.5,   // kapanış darbesiyle müzik döner
    resumeFrom: 87,
    volume: 0.9,
    duck: 0.4,         // konuşma anlarında müzik seviyesi
  },
};

/* Replikler — .srt dosyası da bundan üretilir. Seslendirme yok, yalnızca altyazı. */
const DIALOG = [
  { who: "SPİKER", text: "…yetkililer durumun kontrol altında olduğunu açıkladı.", a: 8.9, b: 11.9, kind: "tv" },
  { who: "SPİKER", text: "Vatandaşların evlerinde kalması…", a: 12.0, b: 14.7, kind: "tv" },
  { who: "RADYO", text: "…tahliye noktaları… düştü… tekrar ediyorum…", a: 28.4, b: 31.2, kind: "radio" },
  { who: "ETHAN", text: "Başta sayıyordum. Günleri… ölüleri.", a: 32.2, b: 35.2 },
  { who: "ETHAN", text: "Sonra bıraktım.", a: 36.0, b: 37.7 },
  { who: "SARAH", text: "Neden hâlâ yürüyoruz, Ethan?", a: 39.0, b: 41.6 },
  { who: "ETHAN", text: "Çünkü durursak… onlar kazanır.", a: 44.0, b: 47.2 },
  { who: "SARAH", text: "Kaç tane var?", a: 59.1, b: 61.1 },
  { who: "ETHAN", text: "Yeterince.", a: 62.4, b: 64.0 },
  { who: "SARAH", text: "Söz ver bana… onlardan biri olmayacağım.", a: 89.6, b: 93.6 },
  { who: "ETHAN", text: "…Söz veriyorum.", a: 97.3, b: 99.6 },
];
