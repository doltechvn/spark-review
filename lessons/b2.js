/* B2 · Letter T Day (24/11/2026). Nội dung: research/unit-B-lessons.vi.md mục B2.
   Dạy: ôn tên + âm 5 nguyên âm · T/t MỚI: chỉ TÊN + HÌNH + tô (CHƯA âm /t/) · Find T (lẫn L, I, nguyên âm) ·
        Set 1 chuyển sang ĐỌC (đọc từ, nối chữ–hình) · What's Missing? · "Is it a …?" ôn nghe + BÉ ĐỌC câu hỏi (Help Sparky Check).
   Ranh giới: không âm /t/ (ten/tap), không B, không Set 2, không "It's a…/It's not a…", không đánh vần/ghép âm, không xếp câu. */
(function () {
  const B = window.UNIT_B || {};
  const LT = (l, s = true) => ({ name: `media/letters/name-${l}.mp3`, ...(s ? { sound: `media/letters/sound-${l}.mp3` } : {}) });
  window.LESSON = {
    id: "B2", unit: "Unit B · My Toys", title: "Letter T Day",
    words: B.words, vocab: B.set1, isAudio: B.isAudio, yesNo: B.yesNo, breakPhonics: false,
    letters: { a: LT("a"), e: LT("e"), i: LT("i"), o: LT("o"), u: LT("u"), t: LT("t", false) },
    intro:  { frame: "media/scenes/b2-intro.jpg", lines: ["b2-intro-1", "b2-intro-2", "b2-intro-3"], poses: ["wave", "think", "cheer"] },
    finish: { frame: "media/scenes/b2-finish.jpg", lines: ["b2-bye-1", "b2-bye-2"], reply: "a2-reply" },
    map: { bg: "media/scenes/b-map.jpg", chip: "Letter T Day", start: [30, 88], goal: [50, 13],
           nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },
    stages: [
      { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/b-s-hello.jpg", lead: "a2-hello-lead",
        tasks: [{ kind: "feel", ask: "a1-how",
          options: [{ id: "happy", img: "media/feel/happy.png", reply: "a1-re-happy", pose: "cheer" }, { id: "sad", img: "media/feel/sad.png", reply: "a1-re-sad", pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", reply: "a2-re-hungry", pose: "talk" }, { id: "sleepy", img: "media/feel/sleepy.png", reply: "a1-re-sleepy", pose: "cheer" }] }] },

      { key: "letters", label: "Letters", vi: "Chữ T", bg: "media/scenes/b2-s-letters.jpg",
        bridge: "b2-to-letters", lead: "b2-letters-lead", end: "b2-letters-end",
        tasks: [
          /* Listen & Place: vòng 1 TÊN, vòng 2 ÂM */
          { kind: "pop", skill: "Ôn nguyên âm (tên + âm)", ask: "a2-findme",
            items: [{ name: "e", options: ["a", "e", "u"] }, { name: "u", options: ["u", "o", "i"] },
                    { name: "i", by: "sound", options: ["e", "i", "a"] }, { name: "o", by: "sound", options: ["o", "u", "a"] }] },
          { kind: "meetLetter", letter: "t", ask: "b2-new-letter", bigSmall: "b2-big-small", hands: "b2-hands" },
          { kind: "trace", skill: "Tô chữ T, t", letters: ["T", "t"], ask: "b2-trace", lines: { T: "b2-trace-big", t: "b2-trace-small" } },
          /* Find 'T'! lưới 1 chữ hoa (lẫn L, I, nguyên âm) · lưới 2 chữ thường (lẫn l, i, nguyên âm) */
          { kind: "findGrid", skill: "Tìm chữ T (lẫn L, I, nguyên âm)", target: "T", ask: "b2-find-big-t", wrongLine: "b2-not-t", doneLine: "a2-found-all",
            grid: ["L", "T", "A", "I", "T", "E", "L", "O", "I", "T", "U", "L"] },
          { kind: "findGrid", skill: "Tìm chữ t (lẫn l, i, nguyên âm)", target: "t", ask: "b2-find-small-t", wrongLine: "b2-not-t", doneLine: "a2-found-all",
            grid: ["l", "i", "t", "a", "t", "l", "e", "i", "o", "l", "t", "u"] },
          { kind: "pop", skill: "Nghe tên chữ → chạm (T + nguyên âm)", ask: "a2-touch",
            items: [{ name: "t", options: ["l", "t", "i"] }, { name: "a", options: ["t", "a", "e"] }, { name: "t", options: ["t", "o", "u"] }] }
        ] },

      { key: "words", label: "Words", vi: "Đọc từ", bg: "media/scenes/b2-s-words.jpg",
        bridge: "b2-to-words", lead: "a2-words-lead", end: "a2-words-end",
        tasks: [
          { kind: "readWords", ask: "a2-read-with-me", words: ["teddy bear", "ball", "doll", "robot", "top"] },
          /* ball ↔ doll (chữ đầu khác), teddy bear = 1 đồ chơi 2 chữ */
          { kind: "readMatch", skill: "Đọc từ → chọn hình (Set 1)", ask: "a2-read-match",
            items: [{ word: "ball", options: ["doll", "ball"] }, { word: "doll", options: ["ball", "top", "doll"] },
                    { word: "teddy bear", options: ["teddy bear", "robot"] }, { word: "top", options: ["robot", "top", "ball"] }] },
          { kind: "label", skill: "Nhìn hình → chọn chữ (Set 1)", ask: "a2-label",
            items: [{ show: "robot", options: ["robot", "top"] }, { show: "ball", options: ["doll", "ball"] }, { show: "teddy bear", options: ["teddy bear", "doll"] }] },
          { kind: "missing", reads: 2, countdown: 3, skill: "Nhớ từ: cái gì biến mất?", ask: "a1-missing",
            rounds: [{ show: ["teddy bear", "ball", "doll"], hide: "doll" }, { show: ["robot", "top", "ball", "teddy bear"], hide: "top" }] }
        ] },

      { key: "talk", label: "Talk", vi: "Is it a…?", bg: "media/scenes/b2-s-talk.jpg",
        bridge: "b2-to-talk", lead: "a2-talk-lead", end: "b2-talk-end",
        tasks: [
          { kind: "isIt", skill: "Nghe \"Is it a…?\" → Yes / No", ask: "b1-is-it",
            items: [{ show: "robot", q: "robot" }, { show: "doll", q: "teddy bear" }] },
          /* Help Sparky Check (Ex7): BÉ TỰ ĐỌC câu hỏi (không đọc to trước) → trả lời; xong mới nghe */
          { kind: "isIt", read: true, skill: "Đọc câu hỏi \"Is it a…?\" → trả lời", ask: "b2-check", readLine: "b-read-q",
            items: [{ show: "ball", q: "ball" }, { show: "top", q: "robot" }, { show: "teddy bear", q: "teddy bear" }, { show: "robot", q: "doll" }] },
          /* What's on My Head? — đoán đồ chơi giấu bằng câu hỏi */
          { kind: "guess", skill: "Hỏi để đoán: \"Is it a…?\"", ask: "b2-guess", again: "b-guess-again",
            items: [{ show: "doll", options: ["robot", "doll", "ball"], peek: [50, 25] }, { show: "ball", options: ["ball", "top", "teddy bear"], peek: [35, 45] }] }
        ] }
    ],
    wear: ["wear-train", "wear-strawberry", "wear-pompom"],
    report: [
      ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
      ["Chữ cái", "Ôn tên + âm a, e, i, o, u · chữ mới T/t: tên chữ, hình chữ, tô T to và t nhỏ, tìm T giữa L/I (chưa học âm /t/)"],
      ["Đọc từ", "teddy bear, ball, doll, robot, top — đọc chữ, nối chữ với hình, nhớ món biến mất"],
      ["Hỏi – đáp", "Nghe và tự đọc câu hỏi \"Is it a ball?\" → trả lời \"Yes, it is.\" / \"No, it isn't.\""]
    ],
    parentTip: "Dán nhãn chữ (ball, doll, robot…) lên đồ chơi của con, chỉ vào một món và hỏi \"Is it a doll?\" — con đọc nhãn rồi trả lời. Tìm chữ T, t trong sách truyện: T to và t nhỏ cùng một tên.",
    lines: {
      "b2-intro-1": { en: "Hi! It's me, Sparky!" },
      "b2-intro-2": { en: "Look! I have a new letter card! It's a secret!" },
      "b2-intro-3": { en: "But first, let's see our vowels!" },
      "a2-hello-lead": { en: "Hello, everyone!" }, "a1-how": { en: "How are you today?" },
      "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" }, "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
      "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" }, "a2-re-hungry": { en: "Me too! Let's have a yummy snack!" },
      "b2-to-letters": { en: "Let's see my secret letter card!" },
      "b2-letters-lead": { en: "First, our five vowels!" },
      "a2-findme": { en: "Find me! Listen and pop!" },
      "b2-new-letter": { en: "Look! I turn my card over. A new magic letter!" },
      "b2-big-small": { en: "Big T. Small t. Both are T!" },
      "b2-hands": { en: "Make a T with your arms! One long line down, and one line across the top!" },
      "b2-trace": { en: "Let's write T! Watch me first." },
      "b2-trace-big": { en: "Big T! Down, then across the top." },
      "b2-trace-small": { en: "Small t! Down, then a little line across." },
      "a2-your-turn": { en: "Your turn! Trace it with your finger." },
      "b2-find-big-t": { en: "Find all the big T! Tap them!" },
      "b2-find-small-t": { en: "Now find all the small t!" },
      "b2-not-t": { en: "Oops! That's not T." },
      "a2-found-all": { en: "You found them all!" },
      "a2-touch": { en: "Listen! Touch the letter!" },
      "b2-letters-end": { en: "Hooray! T is my new magic letter!" },
      "b2-to-words": { en: "Let's open my toy box again. My toys have names!" },
      "a2-words-lead": { en: "Look at the words!" }, "a2-read-with-me": { en: "Read with me!" },
      "a2-read-match": { en: "Read the word. Tap the picture!" }, "a2-read-it": { en: "Read it! Which one?" },
      "a2-label": { en: "What is it? Tap the right word!" },
      "a1-missing": { en: "Look carefully! What's missing?" },
      "a2-words-end": { en: "Wow! You can read!" },
      "b2-to-talk": { en: "Can you help me check my toys?" },
      "a2-talk-lead": { en: "Let's talk!" },
      "b1-is-it": { en: "Look and listen. Is it right? Thumbs up or thumbs down!" },
      "b2-check": { en: "Now read my question! Yes or no?" },
      "b-read-q": { en: "Read the question! Yes, or no?" },
      "b2-guess": { en: "I'm hiding a toy! Ask me! Tap a toy." },
      "b-guess-again": { en: "Which toy is it? Ask me!" },
      "sp-yes": { en: "Yes, it is!" },
      "sp-no": { en: "No, it isn't. Try again!" },
      "sp-is-teddy-bear": { en: "Is it a teddy bear?" }, "sp-is-ball": { en: "Is it a ball?" }, "sp-is-doll": { en: "Is it a doll?" },
      "sp-is-robot": { en: "Is it a robot?" }, "sp-is-top": { en: "Is it a top?" },
      "b2-talk-end": { en: "Thank you for checking my toys!" },
      "b2-bye-1": { en: "Big T, small t! And now I can read my toys!" },
      "b2-bye-2": { en: "Thank you! Goodbye!" },
      "a2-reply": { en: "Goodbye!" }
    }
  };
})();
