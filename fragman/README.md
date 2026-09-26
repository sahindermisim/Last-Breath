# LAST BREATH — Sinematik Duyuru Fragmanı

2:13'lük sinematik duyuru fragmanı, İngilizce. Fotoğraf ya da hazır görsel kullanılmıyor: 0:20'den sonraki her şey (şehir, karakterler, zombiler, ışık, yağmur, sis) kodla çiziliyor.
Oynanış görüntüsü, arayüz ya da özellik yazısı yok. Çıktı 1920×1080, 30 fps, MP4 (H.264 + AAC).
Tek hazır görseller: Ashbound logoları ve kapanıştaki 16+ yaş sınırı kartı (`assets/rating_16.jpg`), olduğu gibi.
Fragman boyunca 2.39:1 sinema bantları var; yalnızca kapanıştaki logo, "COMING SOON" ve yaş sınırı kartları tam ekran.

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Önizleme oynatıcısı; modülleri yükler. |
| `js/config.js` | Dosya yolları, müzik ayarları, replikler ve zamanlamaları. |
| `js/scenes.js`, `js/side.js` | Giriş (0:00–0:20): Ashbound logosu, oda, TV, "İKİ HAFTA SONRA". Değiştirilmedi. |
| `js/film/rig.js` | Karakter iskeleti: Ethan, Sarah, zombi türleri, Tank. Her karakter önce maske, sonra malzeme renkleriyle çizilir ve sahnenin ışığıyla aydınlatılır. |
| `js/film/world.js` | Perspektif kamera, 5 katmanlı yıkık şehir, gökyüzü, ateş, duman, sis, yağmur, kül, yansıma, post (bloom, renk kayması, grenk, vinyet). |
| `js/film/shots.js` | 0:20 sonrası tüm çekimler ve kurgu. |
| `js/film/timeline.js` | Giriş ile yeni bölümü birleştirir, altyazıları ve sinema bantlarını çizer. |
| `js/audio.js` | Ses tasarımı, sentez müzik ve mix. |
| `render.mjs` | Kareleri tek tek alır, ffmpeg ile MP4'e çevirir, sesi mix'ler, `.srt` yazar. |
| `trailer.srt` | Tüm replikler ve zamanlamaları. |
| `dev/` | Karakterleri tek başına incelemek için test sayfaları (`rig.html`, `one.html`, `head.html`, `front.html`). |

## Akış

| Zaman | Bölüm | Görüntü |
|---|---|---|
| 0:00–0:20 | Giriş | Aynı kurgu; yazılar İngilizce ("presents", "BREAKING NEWS", "TWO WEEKS LATER") |
| 0:20–0:41.5 | Sessiz dünya | Yıkık şehrin üstünden geçiş, ufukta büyük yangın → kablodan sallanan trafik lambası son kez yanıp söner → bozuk radyo, cızırtı kesilince kırmızı ışık söner → Ethan sırtı dönük, yağmurda şehre bakıyor |
| 0:41.5–0:56.5 | Ateş başı | Çatıda kamp ateşi, iki siluet, kıvılcımlar, uzakta yangınlar |
| 0:56.5–1:18.5 | Yükseliş | Kalp atışı hızlanır. Sisten önce bir, sonra beş, sonra yüzlerce zombi; arkada yanan araba. "THE WORLD WENT SILENT." · "THE DEAD DID NOT." → karanlık, sürgü sesi, tek namlu alevi Ethan'ı aydınlatır |
| 1:18.5–1:43.5 | Patlama | Namlu alevleriyle her seferinde daha yakın sürü → şimşekte ağır çekim pala → tahtalı pencereden uzanan eller → yanan sokakta kaçış → Tank yanan arabanın üstüne atlar, kükrer. Kesmeler vuruşlarda, aralarda 2–3 karelik siyah/beyaz flaş |
| 1:43.5–1:58.5 | Ani sessizlik | Siyah, yalnızca nefes → yüz yüze iki profil, aralarında küçük ateş → ateş söner |
| 1:58.5–2:13.5 | Kapanış | Darbe → LAST BREATH / "UNTIL YOUR LAST BREATH." → Ashbound logosu → "COMING SOON" / "Cinematic trailer. Not actual gameplay footage." → 16+ yaş sınırı kartı → uzakta tek zombi hırıltısı, kararma |

## Karakterler

Karakterler oyun brifindeki tariflere göre çiziliyor, rastgele değil:

- **Ethan:** uzun boylu, geniş omuzlu. Alnında gri bandana, uçları arkaya sarkıyor. Yıpranmış kahverengi deri mont (yaka, dikiş, parlama çizgileri), haki tişört, parmaksız siyah eldiven, koyu kot, kahverengi bot, kanlı pala. Dağınık koyu saç, sakal gölgesi.
- **Sarah:** ince yapılı, Ethan'dan kısa. Kahverengi at kuyruğu, sarı atkı, bordo ceket, makineli tüfek.
- **Zombiler:** oyundaki türler. Normal (yırtık kıyafet, gri-yeşil ten, kan lekeleri), koşucu (zayıf, yırtık), zırhlı (kask, vizör, yelek), şişkin (şiş karın). Tank: gri kas yığını, yırtık pantolon, açılan çene.

Her karakter iki geçişte çizilir: önce beyaz bir maske (dış çizgi), sonra aynı geometri malzeme renkleriyle.
Renkli katman sahnenin ışığıyla aydınlatılır: ışık tarafı ateş turuncusu, gölge tarafı soğuk mavi-gri, ışık tarafında iç kenar parlaması, üstten soğuk dolgu.
Sürü, önceden çizilmiş yürüme karelerinden oluşur (21 varyant); her zombinin hem siluet hem renkli sürümü vardır, sahne ışığa göre karıştırır (ör. namlu alevinde renkler görünür).

## Görsel dil

- Sahnenin tek sıcak rengi ateş turuncusu (`#ff7a2a`); gerisi soğuk mavi-gri ve siyah.
- Her karede katmanlı yağmur, sis, kül ve kıvılcım, film grengi, vinyet, hafif renk kayması. Kamera hiç durmaz; aksiyonda sert sarsıntı.

## Üretme

```bash
pip install imageio-ffmpeg          # H.264/AAC destekli ffmpeg (sistemde varsa gerekmez)
cd fragman
node render.mjs                     # → cikti/trailer.mp4 + cikti/trailer.srt
node render.mjs --from=78 --to=104  # yalnızca bir aralık
node render.mjs --audio-only        # yalnızca sesi yeniden mix'leyip mevcut videoya koyar
```

Playwright'ın Chromium'u gerekli. Önizleme için: `python3 -m http.server` → `http://localhost:8000/index.html`
(boşluk tuşu oynatır; `?t=78` o saniyeden açar).

## Ses

- Seslendirme yok, yalnızca İngilizce altyazı (robotik ses kullanılmadı).
- Katmanlı efektler kodla sentezleniyor: yağmur, rüzgâr, radyo cızırtısı, ateş çıtırtısı, kalp atışı, sürgü, silah, pala, cam/tahta kırılması, Tank kükremesi, derin darbeler.
- Müzik dosyası verilmediği için ritim ve altyapı da sentezleniyor. `assets/music.mp3` eklenirse o çalar:
  sessiz kısımlarda kısık, patlamada tam, ani sessizlikte tamamen kesilir, kapanışta geri gelir (`js/config.js` → `music`).
  Parçanın vuruşları otomatik bulunur ve patlamadaki kesmeler o vuruşlara oturtulur.

## Eksik

- Ayrı bir LAST BREATH logo dosyası verilmedi; kapanıştaki başlık Bebas Neue ile yazılıyor.
  `assets/last_breath_logo.png` eklenirse otomatik olarak o kullanılır.
