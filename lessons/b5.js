/* B5 · The /b/ Toy Hunt (24/11/2026). Nội dung: research/unit-B-lessons.vi.md mục B5.
   Dạy: ôn TÊN B · ÂM /b/ MỚI (b-b-bed, bus, box) · tên hay âm? (B, T) · nghe âm ĐẦU /b/ (bin/pin, bear/pear…) ·
        trộn cả 10 đồ chơi: nghe – chạm, nhớ món biến mất, đọc chữ · "It's a…/It's not a…": Right or Silly? + ĐỌC câu lần đầu (Read, Tick or Cross).
   Ranh giới: không âm cuối, không ghép âm/đánh vần, không xếp câu, không tự viết. */
(function () {
  const B = window.UNIT_B || {};
  const LT = (l, s = true) => ({ name: `media/letters/name-${l}.mp3`, ...(s ? { sound: `media/letters/sound-${l}.mp3` } : {}) });
  window.LESSON = {
    id: "B5", unit: "Unit B · My Toys", title: "The /b/ Toy Hunt",
    words: B.words, vocab: [...(B.set1 || []), ...(B.set2 || [])], notAudio: B.notAudio, breakPhonics: false,
    letters: { a: LT("a"), e: LT("e"), i: LT("i"), o: LT("o"), u: LT("u"), t: LT("t"), b: LT("b") },
    intro:  { frame: "media/scenes/b5-intro.jpg", lines: ["b5-intro-1", "b5-intro-2", "b5-intro-3"], poses: ["wave", "think", "cheer"] },
    finish: { frame: "media/scenes/b5-finish.jpg", lines: ["b5-bye-1", "b5-bye-2"], reply: "a2-reply" },
    map: { bg: "media/scenes/b-map.jpg", chip: "The /b/ Toy Hunt", start: [30, 88], goal: [50, 13],
           nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },
    stages: [
      { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/b-s-hello.jpg", lead: "a2-hello-lead",
        tasks: [{ kind: "feel", ask: "a1-how",
          options: [{ id: "happy", img: "media/feel/happy.png", reply: "a1-re-happy", pose: "cheer" }, { id: "sad", img: "media/feel/sad.png", reply: "a1-re-sad", pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", reply: "a2-re-hungry", pose: "talk" }, { id: "sleepy", img: "media/feel/sleepy.png", reply: "a1-re-sleepy", pose: "cheer" }] }] },

      { key: "letters", label: "Letters", vi: "Âm /b/", bg: "media/scenes/b5-s-letters.jpg",
        bridge: "b5-to-letters", lead: "a3-letters-lead", end: "b5-letters-end",
        tasks: [
          { kind: "pop", skill: "Ôn tên B (lẫn d, p) + âm /t/", ask: "a2-findme",
            items: [{ name: "b", options: ["d", "b", "p"] }, { name: "t", by: "sound", options: ["t", "b", "a"] }, { name: "b", options: ["p", "t", "b"] }] },
          { kind: "teachLetters", letters: ["b"], ask: "b5-secret" },
          { kind: "soundExamples", letter: "b", words: ["bed", "bus", "box"], ask: "b5-b-words" },
          { kind: "nameOrSound", skill: "Tên chữ hay âm? (B, T)", ask: "a3-name-or-sound",
            items: [{ l: "b", by: "sound" }, { l: "b", by: "name" }, { l: "t", by: "sound" }, { l: "b", by: "sound" }, { l: "t", by: "name" }] },
          /* Paddle 1 or 2: /b/ (không gió) ↔ /p/ (có gió) — chỉ âm ĐẦU */
          { kind: "listenFor", skill: "Nghe âm đầu /b/ (b ↔ p)", letter: "b", ask: "b5-listen-b",
            items: [{ w: ["bin", "pin"], ans: 0 }, { w: ["sun", "bun"], ans: 1 }, { w: ["bear", "pear"], ans: 0 }, { w: ["well", "bell"], ans: 1 }, { w: ["bug", "mug"], ans: 0 }] }
        ] },

      { key: "words", label: "Words", vi: "10 đồ chơi", bg: "media/scenes/b5-s-words.jpg",
        bridge: "b5-to-words", lead: "b5-words-lead", end: "a2-words-end",
        tasks: [
          { kind: "listenPick", skill: "Nghe từ → chạm hình (10 từ)", ask: "a3-slap",
            items: [{ w: "ball", options: ["balloon", "bat", "ball", "doll", "kite"] }, { w: "balloon", options: ["ball", "robot", "puzzle", "balloon", "top"] },
                    { w: "toy car", options: ["top", "toy car", "teddy bear", "bat", "doll"] }] },
          { kind: "missing", reads: 2, countdown: 3, skill: "Nhớ từ: cái gì biến mất? (10 từ)", ask: "a1-missing",
            rounds: [{ show: ["teddy bear", "kite", "top", "puzzle"], hide: "kite" }, { show: ["ball", "balloon", "robot", "bat"], hide: "balloon" }] },
          /* ball ngắn ↔ balloon dài · bat kết thúc bằng t · top 1 chữ ↔ toy car 2 chữ */
          { kind: "readMatch", skill: "Đọc từ → chọn hình (10 từ)", ask: "a2-read-match",
            items: [{ word: "ball", options: ["balloon", "ball", "bat"] }, { word: "top", options: ["toy car", "top"] },
                    { word: "doll", options: ["doll", "ball", "robot"] }, { word: "bat", options: ["ball", "bat"] }] }
        ] },

      { key: "talk", label: "Talk", vi: "Right or silly?", bg: "media/scenes/b5-s-talk.jpg",
        bridge: "b5-to-talk", lead: "a2-talk-lead", end: "a2-talk-end",
        tasks: [
          /* Right or Silly? — Sparky gọi tên (đúng/“silly”) → 👍 / 👎 → sai thì "It's not a robot." */
          { kind: "help", skill: "Right or Silly? (It's a… / It's not a…)", ask: "b5-right-silly",
            items: [{ show: "ball", say: "ball" }, { show: "doll", say: "robot", fix: "media/b/s-not-robot.wav" },
                    { show: "kite", say: "kite" }, { show: "top", say: "teddy bear", fix: "media/b/s-not-teddy-bear.wav" }] },
          /* Read, Tick or Cross: BÉ ĐỌC câu (lần đầu) — câu luôn nêu đúng đồ chơi trong hình; It's a… ✓ / It's not a… ✗ */
          { kind: "tick", thumbs: true, read: true, skill: "Đọc câu → 👍 / 👎", ask: "b5-read-tick",
            items: [{ show: "ball", say: "ball" }, { show: "robot", not: "robot" }, { show: "balloon", say: "balloon" }, { show: "bat", not: "bat" }, { show: "teddy bear", say: "teddy bear" }] },
          { kind: "showSay", ask: "a2-show", rounds: 2, pool: ["teddy bear", "ball", "doll", "robot", "top", "kite", "balloon", "puzzle", "toy car", "bat"] }
        ] }
    ],
    wear: ["wear-pumpkin", "wear-bandana", "wear-starband"],
    report: [
      ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
      ["Chữ & âm", "Tên chữ B và ÂM MỚI /b/ (b-b-bed, bus, box) · phân biệt tên chữ với âm · nghe từ bắt đầu bằng /b/ (bin – pin, bear – pear)"],
      ["Từ vựng", "Cả 10 đồ chơi: nghe, nhớ, đọc chữ (ball – balloon – bat)"],
      ["Câu", "\"It's a ball.\" / \"It's not a robot.\" — nghe Sparky gọi đúng hay sai · LẦN ĐẦU tự đọc câu và chọn 👍/👎"]
    ],
    parentTip: "Viết vài tấm nhãn \"It's a ball.\" / \"It's not a doll.\" đặt cạnh đồ chơi — con đọc và nói đúng hay sai. Đọc bed, bus, box và nhấn âm đầu /b/ (môi mím, không bật gió).",
    lines: {
      "b5-intro-1": { en: "Hello! Look at my letter B!" },
      "b5-intro-2": { en: "B has a secret sound." },
      "b5-intro-3": { en: "Let's hunt for it! Then let's find all my toys!" },
      "a2-hello-lead": { en: "Hello, everyone!" }, "a1-how": { en: "How are you today?" },
      "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" }, "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
      "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" }, "a2-re-hungry": { en: "Me too! Let's have a yummy snack!" },
      "b5-to-letters": { en: "Let's hunt for B's secret sound!" },
      "a3-letters-lead": { en: "Listen carefully!" },
      "a2-findme": { en: "Find me! Listen and pop!" },
      "b5-secret": { en: "B has a name, and B has a secret sound!" },
      "b5-b-words": { en: "Listen to B's secret sound! Say it with me!" },
      "a3-name-or-sound": { en: "Is it the name or the sound? Tap the eye or the ear!" },
      "b5-listen-b": { en: "Listen! Which word starts with B's sound? One or two?" },
      "b5-letters-end": { en: "Hooray! We found B's secret sound!" },
      "b5-to-words": { en: "So many toys! Let's find them all!" },
      "b5-words-lead": { en: "All my toys are here!" },
      "a3-slap": { en: "Listen! Tap the picture, quick!" },
      "a1-missing": { en: "Look carefully! What's missing?" },
      "a2-read-match": { en: "Read the word. Tap the picture!" }, "a2-read-it": { en: "Read it! Which one?" },
      "a2-words-end": { en: "Wow! You can read!" },
      "b5-to-talk": { en: "I made labels for my toys. Let's read!" },
      "a2-talk-lead": { en: "Let's talk!" },
      "b5-right-silly": { en: "Am I right, or am I silly? Thumbs up or thumbs down!" },
      "sp-say-ball": { en: "It's a ball!" }, "sp-say-robot": { en: "It's a robot!" }, "sp-say-kite": { en: "It's a kite!" }, "sp-say-teddy-bear": { en: "It's a teddy bear!" },
      "a2-yes": { en: "Yes! It is!" }, "a2-no": { en: "No! Look again." }, "fb-thanks": { en: "Thank you!" },
      "b5-read-tick": { en: "Read my label. Is it right? Thumbs up or thumbs down!" },
      "a5-read-it": { en: "Read it! Is it right?" },
      "a2-show": { en: "Music! When it stops, tap a card!" },
      "a2-talk-end": { en: "Great talking!" },
      "b5-bye-1": { en: "We found B's secret sound! And all my toys!" },
      "b5-bye-2": { en: "Thank you! Goodbye!" },
      "a2-reply": { en: "Goodbye!" }
    }
  };
})();
