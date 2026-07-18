# Budlum — Marka ve Tasarım Sistemi

> Kaynak: Figma "Budlum" dosyası (RiA8nK980GGodTdKpD24hh), WEB sayfası, budlum.xyz frame'i (3502:766)
> + 17 sayfalık frontend spec PDF'i. Beyaz tema. Referans 3840×2160 → CSS tabanı 1920×1080 (÷2).

## Renkler

| Token | Hex | Rol |
|---|---|---|
| canvas | #FBFCFA | Ana zemin, panel yüzeyi |
| ink | #060705 | Metin, ikon, koyu grafik öğeleri |
| sage | #98AE89 | Bağlantı çizgisi, seçim, glow, ikincil metin |
| sage-dark | #6E8560 | Sage'in küçük metin kontrast varyantı |
| surface | #FFFFFF | Kart, ikon zemini, tablo satırı |
| border | #333333 | Aktif/güçlü sınır |
| border-soft | #E6E6E6 | Pasif node ve yüzey sınırı |
| muted | #BDBDBD | Pasif durum, skeleton |
| token-tan | #AE9A89 | Token varyantı ($BUDL vb.) |
| token-purple | #AE89AA | Token varyantı |
| token-rose | #AE898A | Token varyantı |

## Tipografi

- **Dosis 400** (`--font-ui`): navigasyon, etiketler, kullanıcı adı, CTA. Figma boyutları 32/40/48px (2x) → CSS 16/20/24px.
- **Mako 400** (`--font-data`): bakiye, token/NFT değerleri, tablo verisi. Figma 30/32/40px → CSS 15/16/20px.
- Logo: "budlum" düz metin, Dosis, lowercase.

## Doku ve grafik dili

- Arka plan: `public/assets/brand/pattern-bg.png` (3840×2160 orijinal Figma raster'ı),
  1920×1080 döşemeyle tekrar eder.
- Taş node'lar: `public/assets/stones/stone-01..14.png` (kumaş dokulu raster, Figma orijinali).
- Merkez yıldız node: `public/assets/stones/star-stone.png` (daş15).
- Parıltı butonu: `public/assets/icons/parilti-ac.png` / `parilti-kapat.png` (4x).
- Marka çiçeği: `public/assets/brand/flower.png` (sage 4 yaprak, ortada yıldız negatifi).
- Glow SADECE arama çubuğu, send ve seçili parıltı öğelerinde: `0 0 8px #98AE89`.
- Butonlar: 1px hairline çerçeve, dolgusuz, keskin köşe (wireframe estetiği kasıtlı).
- Seçim: sage renkli kare hitbox çerçevesi (hover'da görünür — tasarımcının açık isteği).

## Ses/ton

Türkçe UI, küçük harf ağırlıklı ("budlum", "transferleri aç"). Sakin, oyuncaklı-minimal;
mekânsal "harita" metaforu her yerde (koordinatlar, taşlar, parıltı).
