/* A5 · N's Secret Sound (24/11/2026). Nội dung: research/unit-A-lessons.vi.md mục A5.
   Dạy: ôn TÊN N · ÂM /n/ MỚI (n-n-nose, net, nine) · nghe âm đầu /n/ (nose/rose…) · Find Me! /p/ hay /n/ ·
        ôn 11 từ (nghe + đọc) · ĐỌC "It's a …" / "It's not a …" (hiểu chữ not) · Help Sparky ("It's not a bag.").
   Ranh giới: không âm cuối, không đánh vần, không ghép âm, không mẫu sửa đầy đủ "It's not a … It's a …" (A6). */
(function () {
  const A = window.UNIT_A;
  window.LESSON = {
    id: "A5", unit: "Unit A · Hello School!", title: "N's Secret Sound",
    words: A.words, vocab: [...A.set1, ...A.set2], notAudio: A.notAudio, breakPhonics: false,
    letters: { a: A.letter("a"), e: A.letter("e"), i: A.letter("i"), o: A.letter("o"), u: A.letter("u"), p: A.letter("p"), n: A.letter("n") },
    whatIsIt: "media/speech_v2_11.wav",
    intro:  { frame: "media/scenes/a5-intro.jpg", lines: ["a5-intro-1", "a5-intro-2", "a5-intro-3"], poses: ["wave", "think", "cheer"] },
    finish: { frame: "media/scenes/a5-finish.jpg", lines: ["a5-bye-1", "a5-bye-2"], reply: "a2-reply" },
    map: { bg: "media/scenes/a1-map.jpg", chip: "N's Secret Sound", start: [30, 88], goal: [50, 13],
           nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },
    stages: [
      { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/a2-s-hello.jpg", lead: "a2-hello-lead",
        tasks: [{ kind: "feel", ask: "a1-how",
          options: [{ id: "happy", img: "media/feel/happy.png", reply: "a1-re-happy", pose: "cheer" }, { id: "sad", img: "media/feel/sad.png", reply: "a1-re-sad", pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", reply: "a2-re-hungry", pose: "talk" }, { id: "sleepy", img: "media/feel/sleepy.png", reply: "a1-re-sleepy", pose: "cheer" }] }] },

      { key: "letters", label: "Letters", vi: "Âm /n/", bg: "media/scenes/a5-s-letters.jpg",
        bridge: "a5-to-letters", lead: "a3-letters-lead", end: "a5-letters-end",
        tasks: [
          { kind: "pop", skill: "Ôn tên chữ N, P", ask: "a2-findme",
            items: [{ name: "n", options: ["m", "n", "h"] }, { name: "p", options: ["p", "n", "b"] }, { name: "n", options: ["n", "u", "a"] }] },
          { kind: "teachLetters", letters: ["n"], ask: "a5-secret" },
          { kind: "soundExamples", letter: "n", words: ["nose", "net", "nine"], ask: "a5-n-words" },
          { kind: "listenFor", skill: "Nghe âm đầu /n/", letter: "n", ask: "a5-listen-n",
            items: [{ w: ["nose", "rose"], ans: 0 }, { w: ["pet", "net"], ans: 1 }, { w: ["nine", "fine"], ans: 0 }, { w: ["top", "nod"], ans: 1 }, { w: ["nap", "map"], ans: 0 }] },
          /* Find Me! nghe /p/ hay /n/ → chạm P hay N */
          { kind: "pop", skill: "Nghe âm /p/ hay /n/ → chạm chữ", ask: "a5-p-or-n",
            items: [{ name: "n", by: "sound", options: ["p", "n"] }, { name: "p", by: "sound", options: ["p", "n"] },
                    { name: "p", by: "sound", options: ["n", "p"] }, { name: "n", by: "sound", options: ["n", "p"] }] }
        ] },

      { key: "words", label: "Words", vi: "11 từ", bg: "media/scenes/a5-s-words.jpg",
        bridge: "a5-to-words", lead: "a2-words-lead", end: "a2-words-end",
        tasks: [
          { kind: "listenPick", skill: "Nghe từ → chạm hình (11 từ)", ask: "a3-slap",
            items: [{ w: "notebook", options: ["book", "desk", "notebook", "clock", "pen"] }, { w: "chair", options: ["bag", "chair", "laptop", "rubber", "board"] }] },
          { kind: "readMatch", skill: "Đọc từ → chọn hình (11 từ)", ask: "a2-read-match",
            items: [{ word: "pencil", options: ["pen", "pencil", "clock"] }, { word: "board", options: ["book", "board", "bag"] },
                    { word: "rubber", options: ["rubber", "laptop", "chair"] }, { word: "notebook", options: ["desk", "book", "notebook"] }] },
          { kind: "missing", skill: "Nhớ từ: cái gì biến mất?", ask: "a1-missing",
            rounds: [{ show: ["pen", "clock", "book"], hide: "clock" }, { show: ["chair", "bag", "laptop", "pencil"], hide: "bag" }] }
        ] },

      { key: "talk", label: "Talk", vi: "Đọc câu", bg: "media/scenes/a5-s-talk.jpg",
        bridge: "a5-to-talk", lead: "a5-talk-lead", end: "a2-talk-end",
        tasks: [
          /* ĐỌC câu (không phát trước): "It's a …" / "It's not a …" → ✓ / ✗ */
          { kind: "tick", read: true, skill: "Đọc câu It's a / It's not a → đúng/sai", ask: "a5-read-tick",
            items: [{ show: "clock", not: "board" }, { show: "desk", not: "desk" }, { show: "pen", say: "pen" },
                    { show: "chair", not: "chair" }, { show: "book", not: "notebook" }, { show: "rubber", say: "rubber" }] },
          /* Sparky gọi sai → "It's not a rubber." (mẫu sửa đầy đủ để A6) */
          { kind: "help", skill: "Help Sparky: It's not a…", ask: "a4-help",
            items: [{ show: "bag", say: "rubber", fix: A.notAudio.rubber }, { show: "desk", say: "desk" }, { show: "pen", say: "pencil", fix: A.notAudio.pencil }] },
          { kind: "ask", skill: "\"What is it?\" → \"It's a…\"", ask: "a1-ask",
            items: [{ show: "book", wrong: "notebook" }, { show: "board", wrong: "clock" }] }
        ] }
    ],
    wear: ["wear-beanie", "wear-sailor", "wear-sunhat"],
    report: [
      ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
      ["Chữ & âm", "Tên chữ N và ÂM MỚI /n/ (n-n-nose, net, nine) · nghe từ bắt đầu bằng /n/ · nghe /p/ hay /n/"],
      ["Từ vựng", "Ôn đủ 11 từ: pen, pencil, book, notebook, bag, rubber, desk, chair, board, clock, laptop (nghe + đọc)"],
      ["Đọc câu", "MỚI: đọc \"It's a pen.\" và \"It's not a bag.\" — hiểu chữ not · sửa lời Sparky \"It's not a rubber.\""]
    ],
    parentTip: "Viết 2 thẻ câu \"It's a …\" và \"It's not a …\", chỉ đồ vật rồi cho con chọn thẻ đúng và đọc. Đọc to nose, net, nine và nhấn âm đầu /n/.",
    lines: {
      "a5-intro-1": { en: "Hello! Listen! My letter N is whispering!" },
      "a5-intro-2": { en: "N has a secret sound too!" },
      "a5-intro-3": { en: "Let's find it!" },
      "a2-hello-lead": { en: "Hello, everyone!" }, "a1-how": { en: "How are you today?" },
      "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" }, "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
      "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" }, "a2-re-hungry": { en: "Me too! Let's have a yummy snack!" },
      "a5-to-letters": { en: "Let's hear N's secret sound!" },
      "a3-letters-lead": { en: "Listen carefully!" },
      "a2-findme": { en: "Find me! Listen and pop!" },
      "a5-secret": { en: "N has a name, and N has a secret sound!" },
      "a5-n-words": { en: "Listen to N's secret sound! Say it with me!" },
      "a5-listen-n": { en: "Listen! Which word starts with N's sound? One or two?" },
      "a5-p-or-n": { en: "Listen to the sound! Is it P or N?" },
      "a5-letters-end": { en: "Hooray! Now we know N's secret sound!" },
      "a5-to-words": { en: "Let's play with all our words!" },
      "a2-words-lead": { en: "Look at the words!" }, "a3-slap": { en: "Listen! Tap the picture, quick!" },
      "a2-read-match": { en: "Read the word. Tap the picture!" }, "a2-read-it": { en: "Read it! Which one?" },
      "a1-missing": { en: "Look carefully! What's missing?" }, "a2-words-end": { en: "Wow! You can read!" },
      "a5-to-talk": { en: "Now, can you read a sentence?" },
      "a5-talk-lead": { en: "Let's read and talk!" },
      "a5-read-tick": { en: "Read the sentence. Is it right? Tick or cross!" },
      "a5-read-it": { en: "Read it! Is it right?" },
      "a2-yes": { en: "Yes! It is!" }, "a2-no": { en: "No! Look again." },
      "a4-help": { en: "I say a name. Is it right? Thumbs up or thumbs down!" }, "fb-thanks": { en: "Thank you!" },
      "a1-ask": { en: "Can you answer my question?" }, "a2-talk-end": { en: "Great talking!" },
      "a5-bye-1": { en: "Hooray! You found N's secret sound!" },
      "a5-bye-2": { en: "Thank you! Goodbye!" },
      "a2-reply": { en: "Goodbye!" }
    }
  };
})();
