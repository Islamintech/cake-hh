# Cake Kitchen — AI rasm promptlari

Har bir rasm uchun alohida prompt. Promptni to'liq nusxalab AI'ga (Midjourney, DALL·E, Ideogram, Leonardo, Gemini va h.k.) bering.
Promptlar ingliz tilida, chunki rasm AI'lari inglizchani eng yaxshi tushunadi.

## Qanday ishlatish

1. **Avval "Style anchor" rasmini yarating** (pastda). Undan keyin hamma rasmlarni shu rasmni
   **reference / style reference** qilib yarating (Midjourney: `--sref <url>`, boshqalarda "style reference" yoki "image prompt").
   Bu hamma rasmlarning bir xil chiqishining eng ishonchli yo'li.
2. Har bir promptning oxirida bir xil **STYLE** qismi bor. Uni o'chirmang va o'zgartirmang.
3. Fon **shaffof** bo'lishi kerak. AI shaffof fon bermasa, oq fonda yarating, keyin fonni olib tashlang
   (remove.bg, Canva "Remove background", Photoshop).
4. Sayt **dark mode**'da ham ishlaydi, shuning uchun rasm oq fonda ham, qora fonda ham yaxshi ko'rinishi kerak.
   Qora kontur va sof oq qismlardan qoching.
5. Tayyor faylni `frontend/public/art/<papka>/<nom>.png` ga, jadvaldagi nom bilan saqlang.

## O'lchamlar

| Guruh | Canvas | Joylashuv |
|---|---|---|
| Stansiya, shakl, o'lcham, status, misc | 256×256 (yoki 1024×1024 yaratib kichraytiring) | markazda, har tomonda ~10% bo'sh joy |
| Toppinglar | 256×256 | **pastki markazda**: narsa canvasning pastki chetiga tegib tursin |
| Batter / krem | 256×256 | markazda |
| Bakery logolari | 512×512 | markazda |
| Bo'sh holatlar, buvi | 512×512 | markazda |

## STYLE (har promptning oxiriga qo'shilgan)

```
STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

---

## 0. Style anchor (birinchi shuni yarating)

**Fayl:** reference uchun (saytga qo'yilmaydi)

```
A small round two-layer cake with white whipped cream and three strawberries on top, sitting on nothing. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

---

## 1. Kitchen stansiyalari — `public/art/stations/` (8 ta)

### pan.png — Pan
```
A round metal cake baking pan, empty, slightly tilted to show the inside. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### size.png — Size
```
Three cake slices of different sizes standing side by side, small, medium and large, like a size chart. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### batter.png — Batter
```
A ceramic mixing bowl full of smooth golden cake batter with a wooden whisk resting in it. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### oven.png — Oven
```
A small cute retro kitchen oven with a glowing warm window showing a cake rising inside. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### cream.png — Cream
```
A piping bag with a star nozzle squeezing out a swirl of white whipped cream. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### toppings.png — Toppings
```
A small bowl filled with mixed cake toppings: strawberries, blueberries, a mint leaf and a sugar star. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### letters.png — Letters
```
A chocolate icing pen writing a curly swirl on a round piece of white fondant. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### box.png — Box
```
A closed square cake box in cream color tied with a terracotta red satin ribbon and a bow on top. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

---

## 2. Shakllar — `public/art/shapes/` (3 ta)

Uchala shaklni **bir xil rangdagi** (oq krem) oddiy tort qilib yarating, faqat shakli farq qilsin.

### round.png
```
A plain round single-layer cake covered in smooth white cream, no decorations. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### square.png
```
A plain square single-layer cake covered in smooth white cream, no decorations. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### heart.png
```
A plain heart-shaped single-layer cake covered in smooth white cream, no decorations. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

---

## 3. O'lchamlar — `public/art/sizes/` (3 ta)

Uchalasida bir xil tort, faqat odamlar (yoki tarelkalar) soni farq qiladi.

### s.png — Small, 4–6 kishi
```
A small round cake with four small dessert plates and forks around it. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### m.png — Medium, 8–10 kishi
```
A medium round cake with eight small dessert plates and forks arranged around it. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### l.png — Large, 12+ kishi
```
A large round cake with twelve small dessert plates around it and a few party confetti pieces. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

---

## 4. Toppinglar — `public/art/toppings/` (13 ta)

Muhim: narsa **canvasning pastki markazida**, pastki cheti canvasning pastiga tegib tursin (tortning kremi ustida turadi).
Soya faqat narsaning ostida, juda kichik.

### straw.png — Strawberry
```
One fresh whole strawberry with green leaves on top, standing upright, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### blue.png — Blueberries
```
A small cluster of three blueberries with a dusty bloom, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### cherry.png — Cherry
```
One glossy dark red cherry with a thin stem pointing up, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### kiwi.png — Kiwi
```
One round kiwi slice standing upright on its edge, showing green flesh with black seeds and a pale center, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### peach.png — Peach
```
One peach slice wedge, orange and pink, lying on its side, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### yuja.png — Yuja peel
```
A small twisted curl of candied yellow yuja citrus peel, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### choc.png — Chocolate
```
One thin triangular shard of dark chocolate standing upright, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### cookie.png — Cookie
```
One small round chocolate chip cookie standing on its edge, tilted slightly, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### peanut.png — Peanuts
```
A small pile of four roasted peanut halves, golden brown, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### mint.png — Mint leaf
```
A small sprig of two fresh green mint leaves, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### star.png — Sugar star
```
One small five-pointed sugar star decoration in pale butter yellow with a light sugary sparkle, standing upright, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### gummy.png — Gummy candy
```
One small translucent gummy bear candy in soft pink, standing upright, sitting at the bottom center of the frame. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### candle.png — Candle
```
One thin birthday candle with pastel stripes and a small lit flame, standing straight up, sitting at the bottom center of the frame, tall and narrow. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

---

## 5. Batter (sponge) — `public/art/batters/` (7 ta, ixtiyoriy)

Hammasi **bir xil kompozitsiya**: bitta uchburchak tort bo'lagi, faqat sponge rangi farq qiladi. Krem hammasida oq.

### vanilla.png
```
One triangular slice of plain vanilla sponge cake, pale golden yellow crumb (#F2D69B), no frosting. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### chocolate.png
```
One triangular slice of plain chocolate sponge cake, dark cocoa brown crumb (#6A3A28), no frosting. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### matcha.png
```
One triangular slice of plain matcha green tea sponge cake, soft green crumb (#93B55E), no frosting. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### redvelvet.png
```
One triangular slice of plain red velvet sponge cake, deep red crumb (#B0303B), no frosting. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### goguma.png
```
One triangular slice of plain Korean sweet potato sponge cake, warm orange-amber crumb (#E3A456), no frosting. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### rice.png
```
One triangular slice of plain rice flour sponge cake, very pale off-white crumb (#F3ECDC), no frosting. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### oat.png
```
One triangular slice of plain vegan oat sponge cake, light tan crumb with visible oat flakes (#D6C095), no frosting. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

---

## 6. Krem — `public/art/creams/` (7 ta, ixtiyoriy)

Hammasi **bir xil kompozitsiya**: kichik idishda krem, ustida spiral. Faqat krem rangi va teksturasi farq qiladi.

### whip.png
```
A small round dish filled with fluffy white whipped cream (#FFFBF4) with a soft swirl peak on top. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### cheese.png
```
A small round dish filled with thick smooth ivory cream cheese frosting (#FAEFD6) with a soft swirl peak on top. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### ganache.png
```
A small round dish filled with glossy dark chocolate ganache (#4A2A1E) with a soft swirl on top. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### berry.png
```
A small round dish filled with soft pink strawberry cream (#F6B3C6) with a swirl peak on top and a tiny strawberry piece. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### yogurt.png
```
A small round dish filled with thick white Greek yogurt cream (#F7F4EC) with a gentle swirl on top. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### coconut.png
```
A small round dish filled with light coconut cream (#EFEBDD) with a swirl on top and a few coconut flakes. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### rum.png
```
A small round dish filled with golden caramel-colored buttercream (#EFD6A0) with a swirl peak on top. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

---

## 7. Buyurtma statuslari — `public/art/status/` (8 ta)

### received.png — Order received
```
A paper order receipt with a small checkmark stamp, slightly curled. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### accepted.png — Accepted
```
A friendly thumbs-up hand wearing a small baker's oven mitt. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### baking.png — Baking
```
A white chef's hat next to a whisk, with a little puff of warm steam. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### ready.png — Ready
```
A finished decorated cake on a cake stand with a small sparkle next to it. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### delivering.png — On the way
```
A small cute delivery scooter carrying a cream cake box on the back, facing right. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### delivered.png — Delivered
```
A small cozy house front door with a cream cake box on the doorstep. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### pickedup.png — Picked up
```
A kraft paper shopping bag with handles, with a cake box peeking out of the top. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### declined.png — Declined
```
A closed cake box with a small terracotta red round stop sign leaning against it, calm and friendly, not scary. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

---

## 8. Bakery logolari — `public/art/bakeries/` (3 ta, 512×512)

Uchalasi bir xil kompozitsiya: yumaloq rangli fon ichida bitta pishiriq.

### s1.png — Seoul Sugar Studio
```
A round badge with a soft pink background (#FFE1EC) and a frosted cupcake with a swirl of pink cream in the middle. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), centered, front view, no text, no letters, no outline, isolated on a plain transparent background, app logo asset, consistent set
```

### s2.png — Itaewon Crumb House
```
A round badge with a soft butter yellow background (#FFF1C9) and a golden flaky croissant in the middle. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), centered, front view, no text, no letters, no outline, isolated on a plain transparent background, app logo asset, consistent set
```

### s3.png — Bora Bakehouse
```
A round badge with a soft mint background (#E2F5EC) and a slice of layered strawberry shortcake in the middle. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), centered, front view, no text, no letters, no outline, isolated on a plain transparent background, app logo asset, consistent set
```

---

## 9. Boshqalar — `public/art/misc/`

### grandma.png — Buvi (mood + kitchen maslahatlari, 512×512)
```
A warm friendly Korean grandmother baker character, head and shoulders, grey hair in a bun, round glasses, cream apron, gentle happy smile, looking at the viewer. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single character only, centered, front view, no text, no letters, no outline, isolated on a plain transparent background, app mascot asset, consistent set
```

Qo'shimcha kayfiyatlar (ixtiyoriy). Birinchi buvi rasmini **character reference** qilib bering, shunda yuzi bir xil chiqadi:

#### grandma-thinking.png
```
The same Korean grandmother baker character, head and shoulders, one finger on her chin, looking up thoughtfully. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single character only, centered, front view, no text, no letters, no outline, isolated on a plain transparent background, app mascot asset, consistent set
```

#### grandma-surprised.png
```
The same Korean grandmother baker character, head and shoulders, eyebrows raised, mouth in a small happy "oh", hands near her cheeks. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single character only, centered, front view, no text, no letters, no outline, isolated on a plain transparent background, app mascot asset, consistent set
```

#### grandma-proud.png
```
The same Korean grandmother baker character, head and shoulders, eyes closed in a proud smile, giving a thumbs up. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single character only, centered, front view, no text, no letters, no outline, isolated on a plain transparent background, app mascot asset, consistent set
```

### star-badge.png — Result sahifasidagi yulduz (256×256)
```
A chunky rounded five-pointed golden star badge (#F3CF74) with a soft glossy highlight. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front view, no text, no letters, no outline, isolated on a plain transparent background, app icon asset, consistent set
```

### ribbon-bow.png — Quti ustidagi bant (256×256)
```
A single satin ribbon bow in terracotta red (#A3321F), seen from the front, with two short tails. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front view, no text, no letters, no outline, no shadow, isolated on a plain transparent background, app icon asset, consistent set
```

### empty-cart.png — Savat bo'sh (512×512)
```
An empty wicker shopping basket with a single cake crumb inside and a tiny sad face on the basket, cute and gentle. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), single object only, centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, empty state illustration, consistent set
```

### empty-orders.png — Buyurtmalar yo'q (512×512)
```
An empty cake stand with only a few crumbs on it and a small fork lying next to it, cute and a little lonely. STYLE: soft 3D clay illustration, rounded chunky shapes, matte pastel surfaces with subtle soft texture, gentle soft lighting from the upper left, very soft small contact shadow directly underneath, warm bakery palette (cream #FFFBF6, sponge #EFC98E, butter #F3CF74, terracotta #A3321F, mint #2F8F3E, chocolate brown #4A2A1E), centered, front three-quarter view from slightly above, no text, no letters, no outline, isolated on a plain transparent background, empty state illustration, consistent set
```

---

## Tekshiruv ro'yxati

- [ ] Style anchor yaratildi va hamma rasmlar unga reference qilib yaratildi
- [ ] Hamma fonlar shaffof
- [ ] Rasmlarda yozuv/harf yo'q
- [ ] Toppinglar canvasning pastki markazida
- [ ] Oq va qora fonda tekshirildi (dark mode)
- [ ] Fayl nomlari jadvaldagidek, kichik harflar bilan, `.png`
- [ ] Har bir fayl ~150 KB dan kichik (kerak bo'lsa tinypng.com orqali siqing)

**Majburiy:** 43 ta · **Ixtiyoriy:** batter 7, krem 7, buvi kayfiyatlari 3
