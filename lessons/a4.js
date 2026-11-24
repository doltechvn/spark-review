/* A4 · Letter N Day (24/11/2026). Nội dung: research/unit-A-lessons.vi.md mục A4.
   Dạy: ôn P (tên + âm /p/) · N/n MỚI: chỉ TÊN + HÌNH + tô (CHƯA âm /n/) · Find N (giữa M/H/P) · Set 2 chuyển sang ĐỌC
        · "It's a …" đọc + xếp câu · "It's not a …" MỚI (nghe – nói, có video) · Help Sparky (Sparky gọi đúng/sai).
   Ranh giới: không âm /n/, không nose/net/nine, không đọc câu "It's not a…" bằng chữ (A5), không đánh vần/ghép âm. */
(function () {
  const A = window.UNIT_A;
  window.LESSON = {
    id: "A4", unit: "Unit A · Hello School!", title: "Letter N Day",
    words: A.words, vocab: [...A.set1, ...A.set2], notAudio: A.notAudio, breakPhonics: false,
    letters: { a: A.letter("a"), e: A.letter("e"), i: A.letter("i"), o: A.letter("o"), u: A.letter("u"), p: A.letter("p"), n: A.letter("n", false) },
    whatIsIt: "media/speech_v2_11.wav",
    intro:  { frame: "media/scenes/a4-intro.jpg", lines: ["a4-intro-1", "a4-intro-2", "a4-intro-3"], poses: ["wave", "cheer", "talk"] },
    finish: { frame: "media/scenes/a4-finish.jpg", lines: ["a4-bye-1", "a4-bye-2"], reply: "a2-reply" },
    map: { bg: "media/scenes/a1-map.jpg", chip: "Letter N Day", start: [30, 88], goal: [50, 13],
           nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },
    stages: [
      { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/a2-s-hello.jpg", lead: "a2-hello-lead",
        tasks: [{ kind: "feel", ask: "a1-how",
          options: [{ id: "happy", img: "media/feel/happy.png", reply: "a1-re-happy", pose: "cheer" }, { id: "sad", img: "media/feel/sad.png", reply: "a1-re-sad", pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", reply: "a2-re-hungry", pose: "talk" }, { id: "sleepy", img: "media/feel/sleepy.png", reply: "a1-re-sleepy", pose: "cheer" }] }] },

      { key: "letters", label: "Letters", vi: "Chữ N", bg: "media/scenes/a4-s-letters.jpg",
        bridge: "a4-to-letters", lead: "a4-letters-lead", end: "a4-letters-end",
        tasks: [
          /* Find Me! ôn P: tên hoặc âm /p/, lẫn b, d, q */
          { kind: "pop", skill: "Ôn P: tên + âm /p/ (lẫn b, d, q)", ask: "a2-findme",
            items: [{ name: "p", options: ["b", "p", "d"] }, { name: "p", by: "sound", options: ["q", "a", "p"] }, { name: "o", by: "sound", options: ["o", "p", "e"] }] },
          { kind: "meetLetter", letter: "n", ask: "a4-new-letter", bigSmall: "a4-big-small", hands: "a4-hands" },
          { kind: "trace", skill: "Tô chữ N, n", letters: ["N", "n"], ask: "a4-trace", lines: { N: "a4-trace-big", n: "a4-trace-small" } },
          { kind: "findGrid", skill: "Tìm chữ N (lẫn M, H, P)", target: "N", ask: "a4-find-big-n", wrongLine: "a4-not-n", doneLine: "a2-found-all",
            grid: ["M", "N", "H", "P", "N", "M", "P", "H", "H", "M", "N", "P"] },
          { kind: "findGrid", skill: "Tìm chữ n (lẫn m, h, p)", target: "n", ask: "a4-find-small-n", wrongLine: "a4-not-n", doneLine: "a2-found-all",
            grid: ["m", "h", "n", "p", "n", "m", "h", "p", "p", "n", "m", "h"] },
          { kind: "pop", skill: "Nghe tên chữ → chạm (N, P, nguyên âm)", ask: "a2-touch",
            items: [{ name: "n", options: ["n", "p", "a"] }, { name: "p", options: ["e", "n", "p"] }, { name: "u", options: ["n", "u", "i"] }, { name: "n", options: ["o", "i", "n"] }] }
        ] },

      { key: "words", label: "Words", vi: "Đọc từ", bg: "media/scenes/a4-s-words.jpg",
        bridge: "a4-to-words", lead: "a2-words-lead", end: "a2-words-end",
        tasks: [
          { kind: "readWords", ask: "a2-read-with-me", words: ["desk", "chair", "board", "clock", "laptop"] },
          { kind: "readMatch", skill: "Đọc từ → chọn hình (Set 2)", ask: "a2-read-match",
            items: [{ word: "chair", options: ["desk", "chair"] }, { word: "clock", options: ["clock", "board", "laptop"] },
                    { word: "laptop", options: ["board", "laptop"] }, { word: "desk", options: ["chair", "clock", "desk"] }] },
          { kind: "label", skill: "Nhìn hình → chọn chữ (Set 2)", ask: "a2-label",
            items: [{ show: "board", options: ["board", "clock"] }, { show: "desk", options: ["chair", "desk"] }, { show: "laptop", options: ["laptop", "board"] }] }
        ] },

      { key: "talk", label: "Talk", vi: "It's not a…", bg: "media/scenes/a4-s-talk.jpg",
        bridge: "a4-to-talk", lead: "a4-talk-lead", end: "a4-talk-end",
        tasks: [
          /* video app homework: Sparky "It's a desk!" → Mai "No, Sparky, it's not a desk. It's a chair." (mốc whisper 24/11) */
          { kind: "video", src: "media/talk_not.mp4", ask: "a2-watch",
            dialog: [
              { side: "ask", text: "It's a desk!", audio: "media/speech_v2_19.wav", t: [0.0, 2.0] },
              { side: "ans ansR", text: "It's not a desk.", audio: "media/speech_v2_30.wav", t: [2.0, 5.0] },
              { side: "ans ansR", text: "It's a chair.", audio: "media/speech_v2_20.wav", t: [5.0, 7.4] } ] },
          { kind: "help", skill: "Help Sparky: đúng hay sai? (It's not a…)", ask: "a4-help",
            items: [{ show: "chair", say: "desk", fix: A.fix["desk>chair"], full: true }, { show: "clock", say: "clock" },
                    { show: "book", say: "notebook", fix: A.fix["notebook>book"], full: true }, { show: "laptop", say: "laptop" }] },
          { kind: "build", skill: "Đọc + xếp câu \"It's a …\"", ask: "a4-build",
            items: [{ show: "chair", chunks: ["It's", "a", "chair."], audio: "media/speech_v2_20.wav" },
                    { show: "clock", chunks: ["It's", "a", "clock."], audio: "media/speech_v2_22.wav" }] }
        ] }
    ],
    wear: ["wear-tophat", "wear-bunny", "wear-cap2"],
    report: [
      ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
      ["Chữ cái", "Ôn P (tên + âm /p/) · chữ mới N/n: tên chữ, hình chữ, tô N to và n nhỏ, tìm N giữa M/H/P (chưa học âm /n/)"],
      ["Đọc từ", "desk, chair, board, clock, laptop — đọc chữ, nối chữ với hình"],
      ["Hỏi – đáp", "\"It's a chair.\" · MỚI: \"It's not a desk.\" (nghe – nói) · xếp câu It's / a / chair."]
    ],
    parentTip: "Chơi \"Help Sparky\": chỉ đồ vật và cố tình gọi sai (\"It's a desk!\") — con sửa \"It's not a desk. It's a chair.\" Nhớ N to và n nhỏ cùng một tên.",
    lines: {
      "a4-intro-1": { en: "Hello, friends! Look! A present for me!" },
      "a4-intro-2": { en: "There's a new magic letter inside!" },
      "a4-intro-3": { en: "And I have a silly game for you. Let's go!" },
      "a2-hello-lead": { en: "Hello, everyone!" }, "a1-how": { en: "How are you today?" },
      "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" }, "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
      "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" }, "a2-re-hungry": { en: "Me too! Let's have a yummy snack!" },
      "a4-to-letters": { en: "Let's open my present!" },
      "a4-letters-lead": { en: "First, let's find P!" },
      "a2-findme": { en: "Find me! Listen and pop!" },
      "a4-new-letter": { en: "Look! A new magic letter! It's N!" },
      "a4-big-small": { en: "Big N. Small n. Same name!" },
      "a4-hands": { en: "Make an N with your arms! Up, down, up!" },
      "a4-trace": { en: "Let's write N! Watch me first." },
      "a4-trace-big": { en: "Big N! Down, slide down, then up." },
      "a4-trace-small": { en: "Small n! Down, then a little hill." },
      "a2-your-turn": { en: "Your turn! Trace it with your finger." },
      "a4-find-big-n": { en: "Find all the big N! Tap them!" },
      "a4-find-small-n": { en: "Now find all the small n!" },
      "a4-not-n": { en: "Oops! That's not N." },
      "a2-found-all": { en: "You found them all!" },
      "a2-touch": { en: "Listen! Touch the letter!" },
      "a4-letters-end": { en: "Hooray! N is my new magic letter!" },
      "a4-to-words": { en: "Now let's read the names of our classroom things!" },
      "a2-words-lead": { en: "Look at the words!" }, "a2-read-with-me": { en: "Read with me!" },
      "a2-read-match": { en: "Read the word. Tap the picture!" }, "a2-read-it": { en: "Read it! Which one?" },
      "a2-label": { en: "What is it? Tap the right word!" }, "a2-words-end": { en: "Wow! You can read!" },
      "a4-to-talk": { en: "Oops! I'm a bit silly today. Can you help me?" },
      "a4-talk-lead": { en: "Is it right? Help me!" },
      "a2-watch": { en: "Watch!" },
      "a4-help": { en: "I say a name. Is it right? Thumbs up or thumbs down!" },
      "a2-yes": { en: "Yes! It is!" }, "fb-thanks": { en: "Thank you!" },
      "a4-build": { en: "Read and build the sentence!" },
      "a4-talk-end": { en: "Thank you for helping me!" },
      "a4-bye-1": { en: "Big N, small n! And no more silly names!" },
      "a4-bye-2": { en: "Thank you! Goodbye!" },
      "a2-reply": { en: "Goodbye!" }
    }
  };
})();
