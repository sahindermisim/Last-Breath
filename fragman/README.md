# LAST BREATH — Oyun Fragmanı (v2)

Brifing v2'ye göre hazırlanmış 2:00'lik hikâye fragmanı: 1920×1080, 30 fps (60 da olur), MP4 (H.264 + AAC), 2.39:1 letterbox.

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Önizleme oynatıcısı; aşağıdaki modülleri yükler. |
| `js/config.js` | Ayarlar, dosya yolları, replikler ve zamanlamaları. |
| `js/side.js` | Yan görünüm sahne kiti: paralaks katmanlar, ışık, yağmur/sis, eklemli siluet karakter animasyonu. |
| `js/scenes.js` | Zaman çizelgesi: tüm sahneler ve 26 planlık montaj. |
| `js/topdown.js` | Tepeden (oyun içi) planlar; sprite'lar burada kullanılır. |
| `js/audio.js` | Ses tasarımı ve mix. |
| `render.mjs` | Kareleri tek tek alıp ffmpeg ile MP4'e çevirir, sesi mix'ler, `.srt` yazar. |
| `trailer.srt` | Tüm replikler ve zamanlamaları. |

## Çekim listesi

| Zaman | Plan |
|---|---|
| 0:00 | Ashbound logosu bulanıktan netleşir, metalik ışık, "sunar" |
| 0:08 | Oda: koltukta oturan adam, TV'nin titreyen mavi ışığı, camda yağmur (yavaş dolly) |
| 0:11.9 | TV yakın plan: "SON DAKİKA", parazit, sinyal kopar, ekran kapanır → "İKİ HAFTA SONRA" |
| 0:20 | Vinç inişi: aydan yıkık şehir siluetine, yanan varillere ve yalnız yürüyen Ethan'a (kapak görseli varsa onun üzerinde Ken Burns) |
| 0:24.6 | Zemin seviyesi: botlar su birikintisine basar, halkalar ve damlalar |
| 0:26 | Orta plan: Ethan durur, başını kaldırır, nefesi buhar olur |
| 0:29.5 | Geniş plan: ay ışığında sisli sırtta ilerleyen zombi siluetleri, uzakta siren |
| 0:32.5 | Alçak açı: sürüklenen ayaklar |
| 0:35 | Tepeden (oyun içi): kalabalık |
| 0:38 | Ara sokak: koşucu saldırır, karanlıktan gelen tarama onu düşürür |
| 0:40.2 | Sarah fener ışığıyla karanlıktan çıkar; Ethan gözlerini siper eder |
| 0:42.6 | Omuz üstü: Sarah ön planda (bulanık), Ethan fenerin ışığında |
| 0:45.4 | Profil iki kişilik plan, arada varil ateşi: Sarah silahını indirir |
| 0:48.2 | Tepeden (oyun içi): sırt sırta, halka daralır |
| 0:52 | Kartal Üssü: tel örgü, hangarlar, kulelerden süpüren projektörler |
| 0:56.6 | Detay: dönen makaralar, kayıt ışığı, sese göre oynayan VU iğnesi |
| 0:59.6 | Çitin dibinde: projektör üstlerinden geçerken eğilirler |
| 1:03.9 | Projektör hangarın arkasından yükselen Denek 7'yi bulur, gözleri yanar |
| 1:05 | Montaj: pala (geniş + yakın), pompalı (oyun içi + mermi detayı), zincirleme variller, varil yakın plan, tank adımı, tank kükremesi, koşucular (yan + oyun içi), şaman (yan + oyun içi), Sarah profil, kovanlar, zırhlı + kıvılcımlar, Sarah (oyun içi), şimşekte sırt, atılma, KANLI KATANA, barikat, zombi gözleri, roketatar, roket isabeti, zincirleme patlama (oyun içi), sırt sırta, sonsuz sürü; araya 5 kart |
| 1:29.4 | Şimşek: sürünün önünde Ethan |
| 1:30 | Sessizlik: Ethan'a aşırı yakın plan, nefes, "Son nefesime kadar." |
| 1:41 | Beyaz flaş + darbe → LAST BREATH |
| 1:55 | Ashbound logosu + "Şimdi tarayıcında oyna" |

## Dosyaları koyma

```
fragman/assets/ashbound_logo.png   (ya da .jpg; şu an senin gönderdiğin .jpg duruyor)
fragman/assets/key_art.jpg
fragman/assets/last_breath_logo.png   (isteğe bağlı: ayrı oyun logosu)
fragman/assets/music.mp3
fragman/assets/sprites/ethan.png, sarah.png, zombie_normal.png, runner.png, tank.png, armored.png
```

Eksik bir dosyanın yerine yedek çizim kullanılır ve o karenin sağ üst köşesinde
**"YER TUTUCU · … bekleniyor"** yazar. Tüm dosyalar yerindeyse bu yazı kendiliğinden kaybolur.

`index.html` başındaki `CONFIG` bölümünde ayarlanabilenler:

- `keyArt.focus`: kapak görselindeki Ken Burns yakınlaşmasının merkezi (0–1 arası, x ve y).
- `keyArt.ethanFocus`: 1:30'daki yakın plan için Ethan'ın yüzünün kapak görselindeki yeri.
- `keyArt.titleCrop`: ayrı bir LAST BREATH logosu yoksa, kapaktaki yazının kırpılacağı dikdörtgen `[x, y, genişlik, yükseklik]` (0–1 arası).
- `spriteFacing`: sprite'lar görselde yukarı bakıyorsa `-Math.PI/2` (varsayılan), sağa bakıyorsa `0`.
- `music.startAt`: parçanın 0. saniyesinin fragmandaki yeri. Varsayılan 5, böylece parçanın 60–85. saniyelerindeki zirve 1:05–1:30 montajına denk gelir.

## Üretme

```bash
pip install imageio-ffmpeg          # H.264/AAC destekli ffmpeg (sistemde varsa gerekmez)
cd fragman
node render.mjs                     # → cikti/trailer.mp4 + cikti/trailer.srt
node render.mjs --fps=60            # 60 fps
node render.mjs --from=65 --to=90   # yalnızca montajı üret (hızlı kontrol)
```

Playwright'ın Chromium'u gerekli. 4 çekirdekli bir makinede 30 fps tam render yaklaşık 5–6 dakika sürüyor.
Önizleme için: `python3 -m http.server` → `http://localhost:8000/index.html`
(boşluk tuşu oynatır; `?t=65` o saniyeden açar).

## Nasıl üretildi

- **Görüntü:** Sinematik planlar yan görünümde, derinlik katmanlı paralaks sahneler olarak çiziliyor.
  Karakterler eklemli iskeletlerle canlandırılıyor (yürüme, koşma, sallanma, savurma, nişan, geri tepme, düşme, çömelme) ve kenar ışıklı siluetler olarak görünüyor.
  Işık tarafında ateş ve ay ışığı, ıslak zeminde yansımalar, hacimli projektör ve fener ışığı, anamorfik parlama, 3 katman yağmur, sis, film greni ve 2.39:1 letterbox var.
  Tepeden bakış planları oyun içi görüntü hissi için kullanılıyor; sprite'lar orada yer alıyor.
- **Ashbound logosu:** Senin dosyan. Yeniden çizilmedi. Siyah zemin saydamlığa çevrildi, beyaz renk ve oranlar aynen korundu.
  Açılışta bulanıktan netleşiyor, üzerinden metalik bir ışık bandı geçiyor. Kapanışta küçük olarak tekrar geliyor.
- **Ses:** Web Audio `OfflineAudioContext` ile tek geçişte mix'leniyor: uğultu, yağmur, rüzgâr, uzak siren, jeneratör uğultusu,
  TV paraziti, silah, patlama, hırıltı, darbe, nefes ve yankı. Müzik, konuşma anlarında %40'a iniyor.
  1:30'da müzik kesiliyor, 1:39–1:41 arası tam sessizlik var, ardından darbe geliyor.
- **Montaj senkronu:** `music.mp3` varsa `render.mjs` parçadaki vuruşları çıkarıyor (enerji artışı tespiti, `beats.json`).
  1:05–1:30 arasındaki kesmeler bu vuruşlara oturtuluyor; planlar 0.4–0.85 sn arası. Müzik yokken sabit 0.62 sn aralık kullanılıyor.
- **Seslendirme:** Bu ortamda Türkçe TTS sesi indirilemedi, bu yüzden brifteki yedek plan uygulandı: sinematik altyazı.
  Konuşanın adı üstte küçük ve bakır (#e8c98f), replik altta beyaz ve ince gölgeli. Spiker ve Warren satırlarının altında,
  bant geçiren filtreden geçmiş boğuk bir "konuşma dokusu" ile TV/telsiz paraziti duyuluyor.
- **Kodlama:** Kareler Playwright/Chromium'da JPEG olarak alınıyor, ffmpeg ile `libx264 -crf 18 yuv420p`, ses `aac 192k`, `+faststart`.

## Bilinen eksikler

- Sinematik (yan görünüm) planlardaki karakterler siluet animasyonu; sprite'lar tepeden bakış planlarında kullanılıyor.
- Oyun içi ekran kaydı verilmedi, hiç kullanılmadı.
