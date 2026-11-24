/* B4 · Letter B Day — "Silly Sparky" (24/11/2026). Nội dung: research/unit-B-lessons.vi.md mục B4.
   Dạy: ôn T (tên + âm /t/: Eye or Ear?) · B/b MỚI: chỉ TÊN + HÌNH + tô (CHƯA âm /b/) · Find B (lẫn D, P, R…) ·
        Set 2 chuyển sang ĐỌC (đọc từ, nối chữ–hình) · "It's not a …" MỚI (nghe – nói, video) · Red Flag/Blue Flag · Listen, Tick or Cross.
   Ranh giới: không âm /b/ (bed/bus/box), bé không tự đọc câu "It's a…/It's not a…" — chữ câu chỉ hiện SAU khi bé trả lời
              (help/tick hideText), không đánh vần/ghép âm/xếp câu. */
(function () {
  const B = window.UNIT_B || {};
  const LT = (l, s = true) => ({ name: `media/letters/name-${l}.mp3`, ...(s ? { sound: `media/letters/sound-${l}.mp3` } : {}) });
  window.LESSON = {
    id: "B4", unit: "Unit B · My Toys", title: "Letter B Day",
    words: B.words, vocab: B.set2, notAudio: B.notAudio, breakPhonics: false,
    letters: { a: LT("a"), e: LT("e"), i: LT("i"), o: LT("o"), u: LT("u"), t: LT("t"), b: LT("b", false) },
    intro:  { frame: "media/scenes/b4-intro.jpg", lines: ["b4-intro-1", "b4-intro-2", "b4-intro-3"], poses: ["wave", "talk", "cheer"] },
    finish: { frame: "media/scenes/b4-finish.jpg", lines: ["b4-bye-1", "b4-bye-2"], reply: "a2-reply" },
    map: { bg: "media/scenes/b-map.jpg", chip: "Letter B Day", start: [30, 88], goal: [50, 13],
           nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },
    stages: [
      { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/b-s-hello.jpg", lead: "a2-hello-lead",
        tasks: [{ kind: "feel", ask: "a1-how",
          options: [{ id: "happy", img: "media/feel/happy.png", reply: "a1-re-happy", pose: "cheer" }, { id: "sad", img: "media/feel/sad.png", reply: "a1-re-sad", pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", reply: "a2-re-hungry", pose: "talk" }, { id: "sleepy", img: "media/feel/sleepy.png", reply: "a1-re-sleepy", pose: "cheer" }] }] },

      { key: "letters", label: "Letters", vi: "Chữ B", bg: "media/scenes/b4-s-letters.jpg",
        bridge: "b4-to-letters", lead: "b4-letters-lead", end: "b4-letters-end",
        tasks: [
          /* Eye or Ear? — nghe T (tên) hay /t/ (âm) → 👁️ / 👂 */
          { kind: "nameOrSound", skill: "Ôn T: tên hay âm?", ask: "a3-name-or-sound",
            items: [{ l: "t", by: "name" }, { l: "t", by: "sound" }, { l: "t", by: "sound" }, { l: "t", by: "name" }] },
          { kind: "meetLetter", letter: "b", ask: "b4-new-letter", bigSmall: "b4-big-small", hands: "b4-hands" },
          { kind: "trace", skill: "Tô chữ B, b", letters: ["B", "b"], ask: "b4-trace", lines: { B: "b4-trace-big", b: "b4-trace-small" } },
          { kind: "findGrid", skill: "Tìm chữ B (lẫn D, P, R)", target: "B", ask: "b4-find-big-b", wrongLine: "b4-not-b", doneLine: "a2-found-all",
            grid: ["D", "B", "P", "R", "B", "E", "T", "D", "P", "B", "R", "E"] },
          { kind: "findGrid", skill: "Tìm chữ b (lẫn d, p, h)", target: "b", ask: "b4-find-small-b", wrongLine: "b4-not-b", doneLine: "a2-found-all",
            grid: ["d", "p", "b", "h", "b", "d", "t", "p", "h", "d", "b", "p"] },
          { kind: "pop", skill: "Nghe tên chữ → chạm (B, T, nguyên âm)", ask: "a2-touch",
            items: [{ name: "b", options: ["d", "b", "p"] }, { name: "t", options: ["b", "t", "a"] }, { name: "b", options: ["b", "i", "o"] }] }
        ] },

      { key: "words", label: "Words", vi: "Đọc từ", bg: "media/scenes/b4-s-words.jpg",
        bridge: "b4-to-words", lead: "a2-words-lead", end: "a2-words-end",
        tasks: [
          { kind: "readWords", ask: "a2-read-with-me", words: ["kite", "balloon", "puzzle", "toy car", "bat"] },
          /* bat ngắn ↔ balloon dài; toy car = 1 đồ chơi 2 chữ */
          { kind: "readMatch", skill: "Đọc từ → chọn hình (Set 2)", ask: "a2-read-match",
            items: [{ word: "balloon", options: ["bat", "balloon"] }, { word: "kite", options: ["kite", "puzzle", "bat"] },
                    { word: "toy car", options: ["toy car", "kite"] }, { word: "bat", options: ["balloon", "puzzle", "bat"] }] },
          /* Look & Choose: hình → chọn 1 trong 2 tên */
          { kind: "label", skill: "Nhìn hình → chọn chữ (Set 2)", ask: "a2-label",
            items: [{ show: "puzzle", options: ["puzzle", "kite"] }, { show: "balloon", options: ["bat", "balloon"] }, { show: "toy car", options: ["toy car", "puzzle"] }] }
        ] },

      { key: "talk", label: "Talk", vi: "It's not a…", bg: "media/scenes/b4-s-talk.jpg",
        bridge: "a4-to-talk", lead: "a4-talk-lead", end: "a4-talk-end",
        tasks: [
          /* video app homework Unit B: Sparky "It's a balloon!" → bạn: "No, Sparky, it's not a balloon. It's a kite!" (mốc whisper 24/11) */
          { kind: "video", src: "media/b/talk-not.mp4", ask: "a2-watch",
            dialog: [
              { side: "ask", text: "It's a balloon!", audio: "media/b/s-its-balloon.wav", t: [0.0, 2.6] },
              { side: "ans ansR", text: "It's not a balloon.", audio: "media/b/s-not-balloon.wav", t: [2.6, 5.7] },
              { side: "ans ansR", text: "It's a kite!", audio: "media/b/s-its-kite.wav", t: [5.7, 7.6] } ] },
          /* Red Flag, Blue Flag: Sparky gọi tên (có khi sai) → 👍 / 👎; sai thì nghe "It's not a balloon." — chữ câu hiện SAU khi bé chọn */
          { kind: "help", hideText: true, skill: "Help Sparky: đúng hay sai? (It's not a…)", ask: "a4-help",
            items: [{ show: "kite", say: "balloon", fix: "media/b/s-not-balloon.wav" }, { show: "bat", say: "bat" },
                    { show: "puzzle", say: "toy car", fix: "media/b/s-not-toy-car.wav" }, { show: "balloon", say: "balloon" }, { show: "toy car", say: "kite", fix: "media/b/s-not-kite.wav" }] },
          /* Listen, Tick or Cross: tên luôn là đồ chơi trong hình — "It's a…" ✓ / "It's not a…" ✗ (nghe, chưa đọc) */
          { kind: "tick", thumbs: true, hideText: true, skill: "Nghe câu → 👍 \"It's a…\" / 👎 \"It's not a…\"", ask: "a2-tick",
            items: [{ show: "kite", say: "kite" }, { show: "bat", not: "bat" }, { show: "puzzle", say: "puzzle" }, { show: "toy car", not: "toy car" }] }
        ] }
    ],
    wear: ["wear-bee", "wear-catears", "wear-buckethat"],
    report: [
      ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
      ["Chữ cái", "Ôn T (tên + âm /t/) · chữ mới B/b: tên chữ, hình chữ (B hai bụng, b bụng dưới), tô B to và b nhỏ, tìm B giữa D/P/R (chưa học âm /b/)"],
      ["Đọc từ", "kite, balloon, puzzle, toy car, bat — đọc chữ, nối chữ với hình"],
      ["Hỏi – đáp", "MỚI: \"It's not a balloon.\" (nghe – nói) · sửa lời Sparky gọi sai · nghe câu chọn 👍/👎"]
    ],
    parentTip: "Chơi \"Silly Sparky\": cầm một món đồ chơi và cố tình gọi sai (\"It's a balloon!\") — con lắc ngón tay sửa \"It's not a balloon.\" Viết b nhỏ bằng tay: ngón trỏ thẳng lên, bụng ở dưới.",
    lines: {
      "b4-intro-1": { en: "Hi, everyone! I have a new letter card!" },
      "b4-intro-2": { en: "But first, let's wake up our letter T!" },
      "b4-intro-3": { en: "And I'm a bit silly today. Let's go!" },
      "a2-hello-lead": { en: "Hello, everyone!" }, "a1-how": { en: "How are you today?" },
      "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" }, "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
      "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" }, "a2-re-hungry": { en: "Me too! Let's have a yummy snack!" },
      "b4-to-letters": { en: "Wake up, letter T!" },
      "b4-letters-lead": { en: "Is it T's name, or T's sound?" },
      "a3-name-or-sound": { en: "Is it the name or the sound? Tap the eye or the ear!" },
      "b4-new-letter": { en: "Now look! My new magic letter!" },
      "b4-big-small": { en: "Big B has two bumps. Small b has one bump at the bottom." },
      "b4-hands": { en: "Make a small b with your hand! Finger up, and a bump at the bottom!" },
      "b4-trace": { en: "Let's write B! Watch me first." },
      "b4-trace-big": { en: "Big B! Down, bump, bump." },
      "b4-trace-small": { en: "Small b! A tall line down, then a bump at the bottom." },
      "a2-your-turn": { en: "Your turn! Trace it with your finger." },
      "b4-find-big-b": { en: "Find all the big B! Tap them!" },
      "b4-find-small-b": { en: "Now find all the small b!" },
      "b4-not-b": { en: "Oops! That's not B." },
      "a2-found-all": { en: "You found them all!" },
      "a2-touch": { en: "Listen! Touch the letter!" },
      "b4-letters-end": { en: "Hooray! B is my new magic letter!" },
      "b4-to-words": { en: "I want to label my new toys. Let's read!" },
      "a2-words-lead": { en: "Look at the words!" }, "a2-read-with-me": { en: "Read with me!" },
      "a2-read-match": { en: "Read the word. Tap the picture!" }, "a2-read-it": { en: "Read it! Which one?" },
      "a2-label": { en: "What is it? Tap the right word!" }, "a2-words-end": { en: "Wow! You can read!" },
      "a4-to-talk": { en: "Oops! I'm a bit silly today. Can you help me?" },
      "a4-talk-lead": { en: "Is it right? Help me!" },
      "a2-watch": { en: "Watch!" },
      "a4-help": { en: "I say a name. Is it right? Thumbs up or thumbs down!" },
      "sp-say-kite": { en: "It's a kite!" }, "sp-say-balloon": { en: "It's a balloon!" }, "sp-say-puzzle": { en: "It's a puzzle!" },
      "sp-say-toy-car": { en: "It's a toy car!" }, "sp-say-bat": { en: "It's a bat!" },
      "a2-yes": { en: "Yes! It is!" }, "a2-no": { en: "No! Look again." }, "fb-thanks": { en: "Thank you!" },
      "a2-tick": { en: "Look and listen. Yes or no?" },
      "a4-talk-end": { en: "Thank you for helping me!" },
      "b4-bye-1": { en: "Big B, small b! And no more silly names!" },
      "b4-bye-2": { en: "Thank you! Goodbye!" },
      "a2-reply": { en: "Goodbye!" }
    }
  };
})();
