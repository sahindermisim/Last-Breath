"use strict";
/* =========================================================================
   AYARLAR
   ========================================================================= */
const CONFIG = {
  duration: 120,
  // Her varlık için sırayla denenecek dosya yolları.
  assets: {
    logo:     ["assets/ashbound_logo.png", "assets/ashbound_logo.jpg"],
    keyArt:   ["assets/key_art.jpg", "assets/key_art.png"],
    gameLogo: ["assets/last_breath_logo.png"],
    ethan:    ["assets/sprites/ethan.png"],
    sarah:    ["assets/sprites/sarah.png"],
    zombie:   ["assets/sprites/zombie_normal.png"],
    runner:   ["assets/sprites/runner.png"],
    tank:     ["assets/sprites/tank.png"],
    armored:  ["assets/sprites/armored.png"],
    music:    ["assets/music.mp3"],
  },
  // Sprite'ın görseldeki "ön" yönü: -PI/2 = yukarı, 0 = sağa.
  spriteFacing: -Math.PI / 2,
  spriteSize: 46,
  pixelArt: false,
  keyArt: {
    focus: [0.5, 0.5],        // Ken Burns yakınlaşma merkezi (0–1)
    ethanFocus: [0.5, 0.42],  // 1:30'daki yakın plan için Ethan'ın yüzü (0–1)
    titleCrop: null,          // Kapaktaki LAST BREATH yazısı: [x, y, w, h] (0–1). Ayrı logo yoksa kullanılır.
  },
  music: {
    startAt: 5,        // parçanın 0. saniyesi fragmanın kaçıncı saniyesinde başlar (zirve 60–85 → 1:05–1:30)
    cutAt: 90,         // sessizlik için müziğin kesildiği an
    resumeAt: 101.1,   // darbeden sonra müziğin döndüğü an
    resumeFrom: 85,    // dönüşte parçanın kaçıncı saniyesinden devam edileceği
    volume: 0.9,
    duck: 0.4,         // konuşma anlarında müzik seviyesi
  },
};

/* Replikler — .srt dosyası da bundan üretilir. */
const DIALOG = [
  { who: "SPİKER", text: "…yetkililer durumun kontrol altında olduğunu açıkladı.", a: 8.9, b: 11.9, kind: "tv" },
  { who: "SPİKER", text: "Vatandaşların evlerinde kalması…", a: 12.0, b: 14.7, kind: "tv" },
  { who: "ETHAN", text: "Kimse gelmedi.", a: 22.4, b: 24.9 },
  { who: "ETHAN", text: "Kimse gelmeyecek.", a: 26.0, b: 28.6 },
  { who: "SARAH", text: "Kıpırdama.", a: 40.4, b: 42.6 },
  { who: "SARAH", text: "…Sen onlardan değilsin.", a: 43.0, b: 45.4 },
  { who: "ETHAN", text: "Henüz değil.", a: 45.9, b: 47.9 },
  { who: "SARAH", text: "Sırt sırta, o zaman.", a: 48.3, b: 50.8 },
  { who: "DR. E. WARREN · KAYIT", text: "Komisyon sahada test istiyor.", a: 53.2, b: 56.4, kind: "rec" },
  { who: "DR. E. WARREN · KAYIT", text: "Laboratuvarda değil… sahada.", a: 56.6, b: 59.4, kind: "rec" },
  { who: "SARAH", text: "Bu bir kaza değildi.", a: 60.2, b: 62.4 },
  { who: "ETHAN", text: "Hiçbir zaman değildi.", a: 62.8, b: 64.9 },
  { who: "ETHAN", text: "Son nefesime kadar.", a: 95.4, b: 98.4 },
];

