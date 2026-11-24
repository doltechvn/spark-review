/* A3 · P's Secret Sound (24/11/2026, khuôn A1/A2). Nội dung: research/unit-A-lessons.vi.md mục A3.
   Dạy: ôn TÊN P · ÂM /p/ MỚI (p-p-pot, pen, pan) · tên hay âm? · nghe âm đầu /p/ (pen/ten…) · Set 2 MỚI nghe–nhận diện–nói
        (desk, chair, board, clock, laptop) · "What is it?" → "It's a …" với Set 2.
   Ranh giới: chưa đọc/viết từ Set 2, không "It's not a…", không N, không âm cuối/ghép âm. */
(function () {
  const A = window.UNIT_A;
  window.LESSON = {
    id: "A3", unit: "Unit A · Hello School!", title: "P's Secret Sound",
    words: A.words, vocab: [...A.set1, ...A.set2], breakPhonics: false,
    letters: { a: A.letter("a"), e: A.letter("e"), i: A.letter("i"), o: A.letter("o"), u: A.letter("u"), p: A.letter("p") },
    whatIsIt: "media/speech_v2_11.wav",
    intro:  { frame: "media/scenes/a3-intro.jpg", lines: ["a3-intro-1", "a3-intro-2", "a3-intro-3"], poses: ["wave", "think", "cheer"] },
    finish: { frame: "media/scenes/a3-finish.jpg", lines: ["a3-bye-1", "a3-bye-2"], reply: "a2-reply" },
    map: { bg: "media/scenes/a1-map.jpg", chip: "P's Secret Sound", start: [30, 88], goal: [50, 13],
           nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },
    stages: [
      { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/a2-s-hello.jpg", lead: "a2-hello-lead",
        tasks: [{ kind: "feel", ask: "a1-how",
          options: [{ id: "happy", img: "media/feel/happy.png", reply: "a1-re-happy", pose: "cheer" }, { id: "sad", img: "media/feel/sad.png", reply: "a1-re-sad", pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", reply: "a2-re-hungry", pose: "talk" }, { id: "sleepy", img: "media/feel/sleepy.png", reply: "a1-re-sleepy", pose: "cheer" }] }] },

      { key: "letters", label: "Letters", vi: "Âm /p/", bg: "media/scenes/a3-s-letters.jpg",
        bridge: "a3-to-letters", lead: "a3-letters-lead", end: "a3-letters-end",
        tasks: [
          { kind: "pop", skill: "Ôn tên chữ (P + nguyên âm)", ask: "a2-findme",
            items: [{ name: "p", options: ["a", "p", "o"] }, { name: "e", options: ["e", "p", "i"] }, { name: "u", options: ["p", "o", "u"] }] },
          /* ÂM /p/ mới: tên (👁️) → âm (👂) → bé chạm kiểm tra (dùng lại bài dạy chữ A1) */
          { kind: "teachLetters", letters: ["p"], ask: "a3-secret" },
          { kind: "soundExamples", letter: "p", words: ["pot", "pen", "pan"], ask: "a3-p-words" },
          { kind: "nameOrSound", skill: "Tên chữ hay âm? (P)", ask: "a3-name-or-sound",
            items: [{ l: "p", by: "sound" }, { l: "p", by: "name" }, { l: "a", by: "sound" }, { l: "p", by: "sound" }, { l: "e", by: "name" }] },
          /* Listen for /p/ — chỉ âm ĐẦU; từ còn lại chỉ để gây nhiễu */
          { kind: "listenFor", skill: "Nghe âm đầu /p/", letter: "p", ask: "a3-listen-p",
            items: [{ w: ["pen", "ten"], ans: 0 }, { w: ["can", "pan"], ans: 1 }, { w: ["pot", "hot"], ans: 0 }, { w: ["tin", "pin"], ans: 1 }, { w: ["sink", "pink"], ans: 1 }] }
        ] },

      { key: "words", label: "Words", vi: "Đồ trong lớp", bg: "media/scenes/a3-s-words.jpg",
        bridge: "a3-to-words", lead: "a3-words-lead", end: "a3-words-end",
        tasks: [
          { kind: "readWords", ask: "a3-meet-words", words: ["desk", "chair", "board", "clock", "laptop"] },
          { kind: "listenPick", skill: "Nghe từ → chạm hình (Set 2)", ask: "a3-slap",
            items: [{ w: "desk", options: ["chair", "desk"] }, { w: "clock", options: ["clock", "board"] },
                    { w: "laptop", options: ["desk", "chair", "board", "clock", "laptop"] }, { w: "board", options: ["laptop", "board", "clock", "chair", "desk"] }] },
          { kind: "missing", skill: "Nhớ từ: cái gì biến mất?", ask: "a1-missing",
            rounds: [{ show: ["desk", "chair", "clock"], hide: "chair" }, { show: ["board", "laptop", "desk", "clock"], hide: "laptop" }] }
        ] },

      { key: "talk", label: "Talk", vi: "Hỏi – đáp", bg: "media/scenes/a3-s-talk.jpg",
        bridge: "a3-to-talk", lead: "a2-talk-lead", end: "a2-talk-end",
        tasks: [
          { kind: "ask", skill: "\"What is it?\" → \"It's a…\" (Set 2)", ask: "a1-ask",
            items: [{ show: "desk", wrong: "chair" }, { show: "clock", wrong: "board" }, { show: "laptop", wrong: "desk" }] },
          { kind: "showSay", ask: "a2-show", rounds: 2, pool: ["desk", "chair", "board", "clock", "laptop", "pen"] }
        ] }
    ],
    wear: ["wear-wizard", "wear-chef", "wear-cowboy"],
    report: [
      ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
      ["Chữ & âm", "Tên chữ P và ÂM MỚI /p/ (p-p-pot, pen, pan) · phân biệt tên chữ với âm · nghe từ nào bắt đầu bằng /p/"],
      ["Từ vựng mới", "desk, chair, board, clock, laptop (nghe – nói)"],
      ["Hỏi – đáp", "\"What is it?\" → \"It's a clock.\""]
    ],
    parentTip: "Chơi \"I spy\" trong nhà: chỉ cái bàn, cái ghế, đồng hồ… hỏi \"What is it?\" — con trả lời \"It's a desk.\" Đọc to các từ pot, pen, pan và nhấn âm đầu /p/ cho con nghe.",
    lines: {
      "a3-intro-1": { en: "Hello! Look! My letter P is whispering!" },
      "a3-intro-2": { en: "Shh! P has a secret sound." },
      "a3-intro-3": { en: "Let's find it together!" },
      "a2-hello-lead": { en: "Hello, everyone!" }, "a1-how": { en: "How are you today?" },
      "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" }, "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
      "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" }, "a2-re-hungry": { en: "Me too! Let's have a yummy snack!" },
      "a3-to-letters": { en: "Let's hear P's secret sound!" },
      "a3-letters-lead": { en: "Listen carefully!" },
      "a2-findme": { en: "Find me! Listen and pop!" },
      "a3-secret": { en: "P has a name, and P has a secret sound!" },
      "a3-p-words": { en: "Listen to P's secret sound! Say it with me!" },
      "a3-name-or-sound": { en: "Is it the name or the sound? Tap the eye or the ear!" },
      "a3-listen-p": { en: "Listen! Which word starts with P's sound? One or two?" },
      "a3-letters-end": { en: "Hooray! Now we know P's secret sound!" },
      "a3-to-words": { en: "Let's look around our classroom!" },
      "a3-words-lead": { en: "What's in our classroom?" },
      "a3-meet-words": { en: "Look! Things in our classroom!" },
      "a3-slap": { en: "Listen! Tap the picture, quick!" },
      "a1-missing": { en: "Look carefully! What's missing?" },
      "a3-words-end": { en: "Great! You know our classroom!" },
      "a3-to-talk": { en: "Play time! Let's talk!" },
      "a2-talk-lead": { en: "Let's talk!" }, "a1-ask": { en: "Can you answer my question?" },
      "a2-show": { en: "Music! When it stops, tap a card!" }, "a2-talk-end": { en: "Great talking!" },
      "a3-bye-1": { en: "Hooray! You found P's secret sound!" },
      "a3-bye-2": { en: "Thank you! Goodbye!" },
      "a2-reply": { en: "Goodbye!" }
    }
  };
})();
