/* Lời Sparky dùng chung mọi bài (phản hồi, nhắc lệnh, tên chữ). tools/gen_voice.py _shared → media/voice/<id>.mp3 */
window.SHARED_LINES = {
  "fb-listen":   { en: "Listen and tap!", vi: "Nghe rồi chạm nha!" },
  "fb-great":    { en: "Great!", vi: "Giỏi quá!" },
  "fb-next":     { en: "Great! Next!", vi: "Giỏi! Tiếp nha!" },
  "fb-yay":      { en: "Yay! Excellent!", vi: "Yay! Xuất sắc!" },
  "fb-wow":      { en: "Wow! Well done!", vi: "Oa! Làm tốt lắm!" },
  "fb-super":    { en: "Super job!", vi: "Siêu ghê!" },
  "fb-tryagain": { en: "Hmm, not quite. Try again!", vi: "Hmm, chưa đúng. Thử lại nha!" },
  "fb-goodtry":  { en: "Good try! Listen.", vi: "Cố gắng tốt! Nghe lại nè." },
  "fb-look":     { en: "Look! It's this one.", vi: "Nhìn nè! Là cái này." },
  "fb-yourturn": { en: "Your turn! Tap and say it.", vi: "Tới lượt bạn! Chạm micro rồi nói nha." },
  "fb-again":    { en: "Again!", vi: "Lần nữa!" },
  "fb-thanks":   { en: "Thank you!", vi: "Cảm ơn nha!" },
  "fb-sticker":  { en: "You can pick a present for me!", vi: "Chọn một món quà cho Sparky nha!" },
  "fb-wear":     { en: "Wow! I love it! Thank you!", vi: "Oa! Mình thích lắm! Cảm ơn nha!" },
  "fb-closet":   { en: "Look at my closet!", vi: "Nhìn tủ đồ của mình nè!" },
  "fb-sayall":   { en: "Let's say them all!", vi: "Mình cùng đọc hết nha!" },
  "fb-missing":  { en: "What's missing?", vi: "Cái gì biến mất?" },
  "fb-letsgo":   { en: "Let's go!", vi: "Đi thôi!" },
  "fb-im-happy":  { en: "I'm happy!", vi: "Mình vui!" },
  "fb-im-sad":    { en: "I'm sad.", vi: "Mình buồn." },
  "fb-im-sleepy": { en: "I'm sleepy.", vi: "Mình buồn ngủ." },
  "fb-im-hungry": { en: "I'm hungry!", vi: "Mình đói bụng!" },
  /* dạy chữ (tên + âm phát bằng bản thu đã duyệt media/letters/, Sparky chỉ nói câu dẫn) */
  "ph-this":     { en: "Look! This is a magic letter.", vi: "Nhìn nè! Đây là một chữ cái thần kỳ." },
  "ph-next":     { en: "Next magic letter!", vi: "Chữ thần kỳ tiếp theo!" },
  "ph-name":     { en: "Its name is…", vi: "Tên của nó là…" },
  "ph-sound":    { en: "Its sound is…", vi: "Âm của nó là…" },
  "ph-saywithme":{ en: "Say it with me!", vi: "Nói theo mình nha!" },
  "ph-again":    { en: "One more time!", vi: "Thêm lần nữa!" },
  "ph-tapeye":   { en: "Tap the eye. What's its name?", vi: "Chạm con mắt. Tên của nó là gì?" },
  "ph-tapear":   { en: "Tap the ear. What's its sound?", vi: "Chạm cái tai. Âm của nó là gì?" },
  "ph-allnames": { en: "Let's say all the names!", vi: "Mình cùng đọc hết TÊN chữ nha!" },
  "ph-allsounds":{ en: "Now, all the sounds!", vi: "Giờ đọc hết ÂM nha!" },
  /* 24/11 Help Sparky: Sparky gọi tên đồ vật (có khi sai) — giọng Sparky */
  "sp-say-pen": { en: "It's a pen!" },
  "sp-say-pencil": { en: "It's a pencil!" },
  "sp-say-book": { en: "It's a book!" },
  "sp-say-notebook": { en: "It's a notebook!" },
  "sp-say-bag": { en: "It's a bag!" },
  "sp-say-rubber": { en: "It's a rubber!" },
  "sp-say-desk": { en: "It's a desk!" },
  "sp-say-chair": { en: "It's a chair!" },
  "sp-say-board": { en: "It's a board!" },
  "sp-say-clock": { en: "It's a clock!" },
  "sp-say-laptop": { en: "It's a laptop!" },
};

/* S4 (18/11) TỦ ĐỒ SPARKY — đồ bé chọn cuối mỗi bài, Sparky mặc ở mọi bài sau.
   HEAD = điểm đặt đồ đội đầu theo từng tư thế (% ảnh media/sparky/<pose>.png, chưa lật gương):
   x = tâm đỉnh đầu, y = vành đồ (đáy món đồ), w = bề ngang món đồ (% bề ngang ảnh). Đo trên lưới 18/11.
   ITEMS: s = cỡ so với w, dx/dy = lệch thêm (%), slots = tổng số ô tủ đồ (ô chưa có hiện "?"). */
window.WARDROBE = {
  slots: 36,   /* 24/11: Unit A + Unit B đủ 12 bài × 3 món */
  HEAD: {
    idle:   { x: 40, y: 15, w: 62 }, wave:  { x: 51, y: 19, w: 51 }, talk:   { x: 43, y: 19, w: 58 },
    listen: { x: 42, y: 18, w: 60 }, cheer: { x: 48, y: 17, w: 53 }, oops:   { x: 42, y: 18, w: 60 },
    think:  { x: 43, y: 17, w: 62 }, thumbs:{ x: 44, y: 18, w: 61 }, clap:   { x: 44, y: 17, w: 64 }
  },
  ITEMS: {
    "wear-cap":   { lesson: "A1", name: "school hat",   img: "media/wear/wear-cap.png",   s: 1.05, dx: 0,  dy: 3 },
    "wear-bow":   { lesson: "A1", name: "bow",          img: "media/wear/wear-bow.png",   s: 0.62, dx: -8, dy: 1 },
    "wear-crown": { lesson: "A1", name: "flower crown", img: "media/wear/wear-crown.png", s: 1.0,  dx: 0,  dy: 4 },
    "wear-beret":      { lesson: "A2", name: "beret",          img: "media/wear/wear-beret.png",      s: 1.0, dx: 6, dy: 2 },
    "wear-propeller":  { lesson: "A2", name: "propeller cap",  img: "media/wear/wear-propeller.png",  s: 0.9,  dx: 0, dy: 4 },
    "wear-partyhat":   { lesson: "A2", name: "party hat",      img: "media/wear/wear-partyhat.png",   s: 0.62, dx: 2, dy: 4 },
    "wear-wizard": { lesson: "A3", name: "wizard hat", img: "media/wear/wear-wizard.png", s: 0.8, dx: 2, dy: 4 },
    "wear-chef": { lesson: "A3", name: "chef hat", img: "media/wear/wear-chef.png", s: 1.0, dx: 0, dy: 4 },
    "wear-cowboy": { lesson: "A3", name: "cowboy hat", img: "media/wear/wear-cowboy.png", s: 1.05, dx: 0, dy: 4 },
    "wear-tophat": { lesson: "A4", name: "top hat", img: "media/wear/wear-tophat.png", s: 0.85, dx: 2, dy: 4 },
    "wear-bunny": { lesson: "A4", name: "bunny ears", img: "media/wear/wear-bunny.png", s: 0.8, dx: 0, dy: 5 },
    "wear-cap2": { lesson: "A4", name: "baseball cap", img: "media/wear/wear-cap2.png", s: 1.0, dx: 0, dy: 4 },
    "wear-beanie": { lesson: "A5", name: "beanie", img: "media/wear/wear-beanie.png", s: 0.95, dx: 0, dy: 5 },
    "wear-sailor": { lesson: "A5", name: "sailor cap", img: "media/wear/wear-sailor.png", s: 0.9, dx: 0, dy: 4 },
    "wear-sunhat": { lesson: "A5", name: "sun hat", img: "media/wear/wear-sunhat.png", s: 1.3, dx: 0, dy: 4 },
    "wear-grad": { lesson: "A6", name: "graduation cap", img: "media/wear/wear-grad.png", s: 0.95, dx: 0, dy: 4 },
    "wear-goldcrown": { lesson: "A6", name: "gold crown", img: "media/wear/wear-goldcrown.png", s: 1.0, dx: 0, dy: 4 },
    "wear-rainbow": { lesson: "A6", name: "rainbow hat", img: "media/wear/wear-rainbow.png", s: 0.95, dx: 0, dy: 5 },
    /* 24/11 Unit B — s/dx/dy tạm, soát trên 9 tư thế rồi chỉnh */
    "wear-pirate": { lesson: "B1", name: "pirate hat", img: "media/wear/wear-pirate.png", s: 0.9, dx: 0, dy: 4 },
    "wear-paperboat": { lesson: "B1", name: "paper boat hat", img: "media/wear/wear-paperboat.png", s: 0.9, dx: 0, dy: 4 },
    "wear-teddyears": { lesson: "B1", name: "teddy ears", img: "media/wear/wear-teddyears.png", s: 1.45, dx: 0, dy: 14 },
    "wear-train": { lesson: "B2", name: "train cap", img: "media/wear/wear-train.png", s: 0.9, dx: 0, dy: 4 },
    "wear-strawberry": { lesson: "B2", name: "strawberry hat", img: "media/wear/wear-strawberry.png", s: 0.9, dx: 0, dy: 4 },
    "wear-pompom": { lesson: "B2", name: "pom-pom hat", img: "media/wear/wear-pompom.png", s: 0.9, dx: 0, dy: 4 },
    "wear-firefighter": { lesson: "B3", name: "fire helmet", img: "media/wear/wear-firefighter.png", s: 0.9, dx: 0, dy: 4 },
    "wear-viking": { lesson: "B3", name: "viking helmet", img: "media/wear/wear-viking.png", s: 0.9, dx: 0, dy: 4 },
    "wear-strawhat": { lesson: "B3", name: "straw hat", img: "media/wear/wear-strawhat.png", s: 1.2, dx: 0, dy: 4 },
    "wear-bee": { lesson: "B4", name: "bee antennae", img: "media/wear/wear-bee.png", s: 1.45, dx: 0, dy: 14 },
    "wear-catears": { lesson: "B4", name: "cat ears", img: "media/wear/wear-catears.png", s: 1.35, dx: 0, dy: 12 },
    "wear-buckethat": { lesson: "B4", name: "bucket hat", img: "media/wear/wear-buckethat.png", s: 0.9, dx: 0, dy: 4 },
    "wear-pumpkin": { lesson: "B5", name: "pumpkin hat", img: "media/wear/wear-pumpkin.png", s: 0.9, dx: 0, dy: 4 },
    "wear-bandana": { lesson: "B5", name: "bandana", img: "media/wear/wear-bandana.png", s: 0.95, dx: 0, dy: 6 },
    "wear-starband": { lesson: "B5", name: "star headband", img: "media/wear/wear-starband.png", s: 1.35, dx: 0, dy: 12 },
    "wear-tiara": { lesson: "B6", name: "tiara", img: "media/wear/wear-tiara.png", s: 0.9, dx: 0, dy: 5 },
    "wear-jester": { lesson: "B6", name: "jester hat", img: "media/wear/wear-jester.png", s: 0.9, dx: 0, dy: 4 },
    "wear-unicorn": { lesson: "B6", name: "unicorn horn", img: "media/wear/wear-unicorn.png", s: 1.35, dx: 0, dy: 12 }
  }
};

/* 24/11 — Unit A dùng chung: 11 từ vựng (Set 1 + Set 2) + từ ví dụ âm /p/ /n/ + câu "It's not a …" (app homework Unit A) */
(function () {
  const W = (w, img, sentence) => ({ img: img || `media/${w}.png`, audio: `media/words/${w}.mp3`, ...(sentence ? { sentence } : {}) });
  window.UNIT_A = {
    words: {
      pen: W("pen", 0, "media/speech_v2_13.wav"), pencil: W("pencil", 0, "media/speech_v2_14.wav"), book: W("book", 0, "media/speech_v2_15.wav"),
      notebook: W("notebook", 0, "media/speech_v2_16.wav"), bag: W("bag", 0, "media/speech_v2_17.wav"), rubber: W("rubber", 0, "media/speech_v2_18.wav"),
      desk: W("desk", 0, "media/speech_v2_19.wav"), chair: W("chair", 0, "media/speech_v2_20.wav"), board: W("board", 0, "media/speech_v2_21.wav"),
      clock: W("clock", 0, "media/speech_v2_22.wav"), laptop: W("laptop", 0, "media/speech_v2_23.wav"),
      /* từ ví dụ âm + từ nghe (chỉ để nghe, không phải từ vựng) */
      pot: W("pot", "media/covers/pot.png"), pan: W("pan", "media/covers/pan.png"), net: W("net", "media/covers/net.png"),
      nine: W("nine", "media/covers/nine.png"), nose: W("nose", "media/nose.png"),
      ...Object.fromEntries(["ten", "can", "hot", "tin", "pin", "sink", "pink", "rose", "pet", "fine", "top", "nod", "nap", "map", "pip", "pop", "nun", "nip", "toll", "mat", "bin"].map(w => [w, { audio: `media/words/${w}.mp3` }]))
    },
    set1: ["pen", "pencil", "book", "notebook", "bag", "rubber"],
    set2: ["desk", "chair", "board", "clock", "laptop"],
    notAudio: { desk: "media/speech_v2_30.wav", notebook: "media/speech_v2_31.wav", pencil: "media/speech_v2_32.wav",
                rubber: "media/speech_v2_33.wav", board: "media/speech_v2_34.wav", chair: "media/speech_v2_35.wav" },
    /* câu sửa đầy đủ "It's not a X. It's a Y." */
    fix: { "desk>chair": "media/speech_v2_24.wav", "notebook>book": "media/speech_v2_25.wav", "pencil>pen": "media/speech_v2_26.wav",
           "rubber>bag": "media/speech_v2_27.wav", "board>clock": "media/speech_v2_28.wav", "chair>desk": "media/speech_v2_29.wav" },
    letter: (l, sound = true) => ({ name: `media/letters/name-${l}.mp3`, ...(sound ? { sound: `media/letters/sound-${l}.mp3` } : {}) })
  };
})();

/* 24/11 — Unit B "My Toys" dùng chung: 10 đồ chơi (Set 1 + Set 2) + từ ví dụ âm /t/ /b/ + CVC B6.
   Hình đồ chơi + câu "It's a / It's not a / Is it a … ? / Yes, it is. / No, it isn't." = app homework Unit B (media/b/SOURCE.txt);
   từ = giọng mẫu Automation (media/words/SOURCE.txt). */
(function () {
  const W = (w, img) => { const f = w.replace(/ /g, "-"); return { audio: `media/words/${f}.mp3`, ...(img !== 0 ? { img: img || `media/b/${f}.png` } : {}), sentence: `media/b/s-its-${f}.wav` }; };
  const toys = ["teddy bear", "ball", "doll", "robot", "top", "kite", "balloon", "puzzle", "toy car", "bat"];
  const f = (w) => w.replace(/ /g, "-");
  window.UNIT_B = {
    words: {
      ...Object.fromEntries(toys.map(w => [w, W(w)])),
      /* từ ví dụ âm + từ nghe (có hình thì có img) */
      ...Object.fromEntries(["bed", "bus", "tub", "cat", "bin", "bug", "bell", "bun"].map(w => [w, { img: `media/b/${w}.png`, audio: `media/words/${w}.mp3` }])),
      ...Object.fromEntries(["ten", "tap", "box"].map(w => [w, { img: `media/covers/${w}.png`, audio: `media/words/${w}.mp3` }])),   /* hình vẽ mới (b3/b5.art.json) */
      ...Object.fromEntries(["pen", "map", "pop", "tin", "pin", "can", "mug", "tug", "bear", "pear", "sun", "well", "tab", "bit", "but", "bib", "bet", "tot", "bag"]
        .map(w => [w, { audio: `media/words/${w}.mp3` }]))
    },
    set1: toys.slice(0, 5), set2: toys.slice(5),
    /* B-3 (user 24/11 "puzzle intonation bị kì"): câu It's a puzzle. = giọng mẫu Automation B4 */
    notAudio: Object.fromEntries(toys.map(w => [w, `media/b/s-not-${f(w)}.wav`])),
    isAudio: Object.fromEntries(toys.map(w => [w, `media/b/s-is-${f(w)}.wav`])),
    yesNo: { yes: "media/b/s-yes.wav", no: "media/b/s-no.wav" },
    letter: (l, sound = true) => ({ name: `media/letters/name-${l}.mp3`, ...(sound ? { sound: `media/letters/sound-${l}.mp3` } : {}) })
  };
  window.UNIT_B.words.puzzle.sentence = "media/b/s-its-puzzle-m.mp3";
})();

/* 24/11 — Unit C dùng chung (Colours & Numbers). Hình + âm = bản đã duyệt (tools/unitc_assets.py → media/c/SOURCE.txt).
   words: "1".."10" = khối gỗ + tiếng one…ten (chữ số) · "one".."ten" = cùng hình (bài đọc chữ số) · 10 màu = vệt màu + tiếng, .its = "It's red."
          + hình minh hoạ (nhóm khối cùng màu g-<màu>-<n>, khối đơn blk-<màu>, trứng, baby dino…) + từ âm /r/ /d/ + CVC. */
(function () {
  const S1 = ["red", "blue", "yellow", "green", "purple"], S2 = ["orange", "pink", "black", "white", "brown"];
  const NUM = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  const words = {};
  NUM.forEach((n, i) => { const d = String(i + 1); words[d] = { img: `media/c/n${d}.png`, audio: `media/words/${n}.mp3` }; words[n] = { img: `media/c/n${d}.png`, audio: `media/words/${n}.mp3` }; });
  [...S1, ...S2].forEach(c => { words[c] = { img: `media/c/sw-${c}.png`, audio: `media/words/${c}.mp3`, its: `media/c/a/its-${c}.mp3` }; });
  const pic = (k, img) => { words[k] = { img: img || `media/c/${k}.png` }; };
  [...S1, ...S2].forEach(c => pic("blk-" + c));
  S1.forEach(c => [1, 2, 3, 4, 5].forEach(n => pic(`g-${c}-${n}`)));
  ["g-orange-6", "g-pink-7", "g-brown-8", "g-black-9", "g-white-10"].forEach(k => pic(k));
  ["eggs-black-7", "eggs-black-9", "eggs-brown-6", "eggs-brown-8", "eggs-brown-9", "eggs-orange-6", "eggs-orange-7", "eggs-orange-8", "eggs-orange-9",
   "eggs-pink-6", "eggs-pink-7", "eggs-pink-8", "eggs-pink-10", "eggs-white-9", "eggs-white-10", "eggs-blue-7", "eggs-green-6", "eggs-purple-10",
   "dots-black-7", "dots-brown-6", "dots-orange-6", "dots-orange-9", "dots-pink-10", "dots-pink-7", "dots-white-9",
   "fps-black-8", "fps-brown-9", "fps-orange-8", "fps-pink-9"].forEach(k => pic(k));
  [...S2].forEach(c => pic("baby-" + c));
  ["red", "green", "purple", "blue", "yellow", ...S2].forEach(c => pic("egg-" + c));
  [...S1, ...S2].forEach(c => pic("bal-" + c));
  /* từ có hình + tiếng (âm /r/ /d/, CVC) */
  const W = (w, img) => { words[w] = { img: img === 0 ? undefined : (img || `media/c/${w}.png`), audio: `media/words/${w}.mp3` }; };
  W("rabbit"); W("robot", "media/b/robot.png"); W("dog"); W("duck"); W("doll", "media/b/doll.png"); W("bed", "media/b/bed.png");
  ["rock", "rain", "rake", "rug", "road"].forEach(w => W(w));
  ["dad", "door", "dot", "deer", "dart", "desk"].forEach(w => W(w, w === "desk" ? "media/desk.png" : `media/c/d-${w}.png`));
  /* chỉ tiếng (nghe phân biệt, không phải từ dạy) */
  ["lock", "lake", "lane", "load", "lug", "ring", "lamp", "leg", "lemon", "lion", "ram", "rice", "tusk", "tore", "tart", "tuck", "toe", "tot", "ten",
   "dough", "rod", "rid", "did", "rent", "dab", "sat", "bet", "sad"].forEach(w => { words[w] = { ...(words[w] || {}), audio: `media/words/${w}.mp3` }; });
  words.ten = { img: "media/c/n10.png", audio: "media/words/ten.mp3" };
  window.UNIT_C = {
    words, S1, S2, NUM,
    howMany: "media/c/a/q-how-many.mp3", whatColour: "media/c/a/q-what-colour.mp3",
    letter: (l, sound = true) => ({ name: `media/letters/name-${l}.mp3`, ...(sound ? { sound: `media/letters/sound-${l}.mp3` } : {}) }),
    /* hội thoại video FL (đúng lời trong video, chạm bóng thoại nghe lại) */
    videoMany: { src: "media/c/talk-many.mp4", dialog: [
      { side: "ask", text: "How many blocks?", t: [0, 2.3], audio: "media/c/a/v-mai-how-many-blocks.mp3" },
      { side: "ans ansL", text: "Three!", t: [2.6, 4.2], audio: "media/c/a/v-sparky-three.mp3" }] },
    videoColour: { src: "media/c/talk-colour.mp4", dialog: [
      { side: "ask", text: "What colour is it?", t: [0.6, 2.3], audio: "media/c/a/v-mai-what-colour.mp3" },
      { side: "ans ansR", text: "It's red!", t: [3, 4.6], audio: "media/c/a/v-sparky-its-red.mp3" }] }
  };
})();

/* 24/11 — tủ đồ Unit C: 3 món/bài (gen_scenes.py c1…c6, kind "wear"), đội đỉnh đầu. Nới ô tủ đồ = tổng số món đã khai. */
(function () {
  const W = window.WARDROBE; if (!W) return;
  const it = (lesson, name, s = 0.95, dy = 4, dx = 0) => ({ lesson, name, s, dx, dy });
  const add = {
    "wear-leafcrown": it("C1", "leaf crown", 0.87, 4), "wear-acorn": it("C1", "acorn cap", 0.94, 4), "wear-blockhat": it("C1", "block hat", 0.72, 4),
    "wear-paintcap": it("C2", "paint cap", 1.1, 4), "wear-flowerband": it("C2", "flower cap", 1.09, 4), "wear-pinwheel": it("C2", "pinwheel cap", 0.96, 4),
    "wear-hardhat": it("C3", "hard hat", 1.11, 4), "wear-rainhat": it("C3", "rain hat", 1.01, 4), "wear-antenna": it("C3", "robot cap", 0.92, 4),
    "wear-eggshell": it("C4", "eggshell hat", 0.77, 4), "wear-spikes": it("C4", "dino spike cap", 0.95, 4), "wear-nest": it("C4", "nest hat", 1.21, 4),
    "wear-explorer": it("C5", "explorer hat", 1.02, 4), "wear-detective": it("C5", "detective hat", 1.05, 4), "wear-dotband": it("C5", "dotty cap", 0.99, 4),
    "wear-balloonband": it("C6", "balloon party cap", 0.94, 4), "wear-cupcake": it("C6", "cupcake hat", 0.8, 4), "wear-starcrown": it("C6", "star crown", 1.03, 4)
  };
  Object.entries(add).forEach(([id, v]) => { W.ITEMS[id] = { ...v, img: `media/wear/${id}.png` }; });
  W.slots = Math.max(W.slots || 0, Object.keys(W.ITEMS).length);
})();

/* C-4 (24/11): mũ "đội sẵn" — khung mắt 9 tư thế (tools/wear_fit/worn.py eye_frame) + lớp mũ tách từ ảnh Sparky đang đội. Sinh bởi tools/wear_fit/emit_js.py */
(function () {
  const W = window.WARDROBE; if (!W) return;
  W.EYES = {"idle":{"mx":36.21,"my":36.12,"d":37.1,"r":3.04,"a":0.7375},"wave":{"mx":50.15,"my":33.14,"d":32.32,"r":10.2,"a":0.8045},"talk":{"mx":36.72,"my":33.18,"d":34.71,"r":6.75,"a":0.7357},"listen":{"mx":34.95,"my":33.24,"d":34.65,"r":5.86,"a":0.7161},"cheer":{"mx":45.15,"my":32.71,"d":32.5,"r":4.02,"a":0.7875},"oops":{"mx":36.05,"my":33.79,"d":32.48,"r":0.2,"a":0.7286},"think":{"mx":36.3,"my":31.03,"d":31.59,"r":8.67,"a":0.6929},"thumbs":{"mx":38.46,"my":38.0,"d":36.37,"r":-2.54,"a":0.7473},"clap":{"mx":38.73,"my":32.71,"d":37.68,"r":8.33,"a":0.7018}};
  const worn = {"wear-acorn":{"ox":0.3751,"oy":0.1507,"w":2.5907,"rb":3.04},"wear-antenna":{"ox":0.3241,"oy":0.1085,"w":2.5026,"rb":3.04},"wear-balloonband":{"ox":0.3087,"oy":0.1313,"w":2.5646,"rb":3.04},"wear-blockhat":{"ox":0.3437,"oy":0.261,"w":2.4602,"rb":3.04},"wear-cupcake":{"ox":0.3883,"oy":0.1197,"w":2.6462,"rb":3.04},"wear-detective":{"ox":-0.0762,"oy":0.0261,"w":2.9823,"rb":3.04},"wear-dotband":{"ox":0.3947,"oy":0.4859,"w":2.6495,"rb":3.04},"wear-eggshell":{"ox":0.4007,"oy":-0.0156,"w":2.3493,"rb":3.04},"wear-explorer":{"ox":0.4092,"oy":0.3618,"w":2.6723,"rb":3.04},"wear-flowerband":{"ox":0.407,"oy":0.4716,"w":2.8093,"rb":3.04},"wear-hardhat":{"ox":0.3587,"oy":0.2668,"w":2.4178,"rb":3.04},"wear-leafcrown":{"ox":0.3807,"oy":0.1284,"w":2.0002,"rb":3.04},"wear-nest":{"ox":0.4263,"oy":-0.2097,"w":2.5907,"rb":3.04},"wear-paintcap":{"ox":0.3407,"oy":-0.0964,"w":2.6234,"rb":3.04},"wear-pinwheel":{"ox":0.2303,"oy":-0.084,"w":2.4994,"rb":3.04},"wear-rainhat":{"ox":0.4188,"oy":0.2924,"w":2.7735,"rb":3.04},"wear-spikes":{"ox":0.3626,"oy":-0.0804,"w":2.5744,"rb":3.04},"wear-starcrown":{"ox":0.4091,"oy":-0.2914,"w":2.2514,"rb":3.04}};
  Object.entries(worn).forEach(([id, eye]) => { if (W.ITEMS[id]) Object.assign(W.ITEMS[id], { eye, worn: `media/wear/${id}-worn.png` }); });
})();
