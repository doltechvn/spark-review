/* B1 · Sparky's Toy Box (24/11/2026, khuôn A1–A6). Nội dung: research/unit-B-lessons.vi.md mục B1.
   Dạy: ôn TÊN + ÂM 5 nguyên âm a e i o u (dạy lại 👁️/👂, nghe tên → chạm, nghe âm → chạm) · Set 1 MỚI nghe–nói
        (teddy bear, ball, doll, robot, top; "Find the …!") · "Is it a …?" → "Yes, it is." / "No, it isn't." (nghe–trả lời + bé HỎI để đoán).
   Ranh giới: không T/B, không Set 2, không "It's a…/It's not a…/What is it?", không "…, please", không bài đọc chữ/câu.
   Dữ liệu chung Unit B: window.UNIT_B (_shared.js). Ảnh: b1.art.json → tools/gen_scenes.py b1. Lời: lines → tools/gen_voice.py b1. */
(function () {
  const B = window.UNIT_B || {};
  const LT = (l, s = true) => ({ name: `media/letters/name-${l}.mp3`, ...(s ? { sound: `media/letters/sound-${l}.mp3` } : {}) });
  window.LESSON = {
    id: "B1", unit: "Unit B · My Toys", title: "Sparky's Toy Box",
    words: B.words, vocab: B.set1, isAudio: B.isAudio, yesNo: B.yesNo, breakPhonics: false,
    letters: { a: LT("a"), e: LT("e"), i: LT("i"), o: LT("o"), u: LT("u") },
    intro:  { frame: "media/scenes/b1-intro.jpg", lines: ["b1-intro-1", "b1-intro-2", "b1-intro-3"], poses: ["wave", "talk", "cheer"] },
    finish: { frame: "media/scenes/b1-finish.jpg", lines: ["b1-bye-1", "b1-bye-2"], reply: "a2-reply" },
    map: { bg: "media/scenes/b-map.jpg", chip: "Sparky's Toy Box", start: [30, 88], goal: [50, 13],
           nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },
    stages: [
      { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/b-s-hello.jpg", lead: "a2-hello-lead",
        tasks: [{ kind: "feel", ask: "a1-how",
          options: [{ id: "happy", img: "media/feel/happy.png", reply: "a1-re-happy", pose: "cheer" }, { id: "sad", img: "media/feel/sad.png", reply: "a1-re-sad", pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", reply: "a2-re-hungry", pose: "talk" }, { id: "sleepy", img: "media/feel/sleepy.png", reply: "a1-re-sleepy", pose: "cheer" }] }] },

      { key: "letters", label: "Letters", vi: "Nguyên âm", bg: "media/scenes/b1-s-letters.jpg",
        bridge: "b1-to-letters", lead: "b1-letters-lead", end: "b1-letters-end",
        tasks: [
          /* dạy lại như trên lớp: 👁️ tên → nói theo → 👂 âm → nói theo → bé chạm kiểm tra; cuối đọc hết TÊN rồi hết ÂM */
          { kind: "teachLetters", letters: ["a", "e", "i", "o", "u"], ask: "b1-vowels" },
          /* Help Sparky Find the Vowel: nghe TÊN → chạm */
          { kind: "pop", skill: "Nghe tên nguyên âm → chạm", ask: "b1-find-vowel",
            items: [{ name: "e", options: ["a", "e", "o"] }, { name: "i", options: ["i", "u", "e"] }, { name: "o", options: ["u", "a", "o"] }, { name: "u", options: ["o", "u", "i"] }] },
          /* Vowel Badges for Sparky: nghe ÂM → chạm (chữ thường) */
          { kind: "pop", skill: "Nghe âm nguyên âm → chạm", ask: "b1-badges",
            items: [{ name: "a", by: "sound", options: ["a", "e", "u"] }, { name: "o", by: "sound", options: ["i", "o", "a"] },
                    { name: "e", by: "sound", options: ["e", "i", "o"] }, { name: "u", by: "sound", options: ["a", "o", "u"] }] }
        ] },

      { key: "words", label: "Words", vi: "Đồ chơi", bg: "media/scenes/b1-s-words.jpg",
        bridge: "b1-to-words", lead: "b1-words-lead", end: "b1-words-end",
        tasks: [
          { kind: "readWords", ask: "b1-meet-toys", words: ["teddy bear", "ball", "doll", "robot", "top"] },
          /* Toy Hunt / Slap the Board: "Find the …!" — nghe từ → chạm hình */
          { kind: "listenPick", skill: "Nghe từ → chạm hình (Set 1)", ask: "b1-find",
            items: [{ w: "ball", options: ["top", "ball"] }, { w: "doll", options: ["doll", "teddy bear"] },
                    { w: "robot", options: ["teddy bear", "ball", "doll", "robot", "top"] }, { w: "top", options: ["robot", "top", "doll", "ball", "teddy bear"] }] }
        ] },

      { key: "talk", label: "Talk", vi: "Is it a…?", bg: "media/scenes/b1-s-talk.jpg",
        bridge: "b1-to-talk", lead: "b1-talk-lead", end: "b1-talk-end",
        tasks: [
          /* video app homework Unit B: "Is it a ball?" "Yes, it is." · (con quay) "Is it a ball?" "No, it isn't." (mốc whisper 24/11) */
          { kind: "video", src: "media/b/talk-is.mp4", ask: "a2-watch",
            dialog: [
              { side: "ask", text: "Is it a ball?", audio: "media/b/s-is-ball.wav", t: [0.0, 2.2] },
              { side: "ans ansR", text: "Yes, it is.", audio: "media/b/s-yes.wav", t: [2.2, 3.8] },
              { side: "ask", text: "Is it a ball?", audio: "media/b/s-is-ball.wav", t: [3.8, 6.0] },
              { side: "ans ansR", text: "No, it isn't.", audio: "media/b/s-no.wav", t: [6.0, 8.4] } ] },
          /* Listen & Tick or Cross (Ex7): nhìn hình, nghe "Is it a …?" → 👍 Yes, it is. / 👎 No, it isn't. */
          { kind: "isIt", skill: "\"Is it a…?\" → Yes, it is. / No, it isn't.", ask: "b1-is-it",
            items: [{ show: "doll", q: "doll" }, { show: "ball", q: "robot" }, { show: "teddy bear", q: "teddy bear" }, { show: "top", q: "ball" }] },
          /* What's in Sparky's Box? — hình ló một góc, bé chạm thẻ = HỎI "Is it a …?", Sparky đáp */
          { kind: "guess", skill: "Hỏi để đoán: \"Is it a…?\"", ask: "b1-guess", again: "b-guess-again",
            items: [{ show: "robot", options: ["ball", "robot", "doll"], peek: [52, 22] }, { show: "teddy bear", options: ["top", "doll", "teddy bear"], peek: [50, 70] }] }
        ] }
    ],
    wear: ["wear-pirate", "wear-paperboat", "wear-teddyears"],
    report: [
      ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
      ["Chữ & âm", "Ôn TÊN và ÂM 5 nguyên âm a, e, i, o, u · nghe tên → chọn chữ · nghe âm → chọn chữ thường"],
      ["Từ vựng mới", "teddy bear, ball, doll, robot, top (nghe – nói, chưa yêu cầu đọc)"],
      ["Hỏi – đáp", "\"Is it a doll?\" → \"Yes, it is.\" / \"No, it isn't.\" · con tập hỏi \"Is it a robot?\" để đoán đồ chơi"]
    ],
    parentTip: "Giấu một món đồ chơi sau lưng, cho con hỏi \"Is it a ball?\" — ba mẹ trả lời \"Yes, it is.\" hoặc \"No, it isn't.\" rồi đổi vai. Cùng con đọc tên và âm a, e, i, o, u.",
    lines: {
      "b1-intro-1": { en: "Hello, friends! It's me, Sparky!" },
      "b1-intro-2": { en: "Look! I have a big toy box!" },
      "b1-intro-3": { en: "What's inside? Let's find out!" },
      "a2-hello-lead": { en: "Hello, everyone!" }, "a1-how": { en: "How are you today?" },
      "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" }, "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
      "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" }, "a2-re-hungry": { en: "Me too! Let's have a yummy snack!" },
      "b1-to-letters": { en: "Look! There are magic letters at the bottom of my toy box!" },
      "b1-letters-lead": { en: "Here are our five magic letters!" },
      "b1-vowels": { en: "Let's say their names and their sounds!" },
      "b1-find-vowel": { en: "Help me find the letter! Listen and pop!" },
      "b1-badges": { en: "Now listen to the sound. Pop the letter!" },
      "b1-letters-end": { en: "Hooray! You know all five magic letters!" },
      "b1-to-words": { en: "Now let's open my toy box!" },
      "b1-words-lead": { en: "Wow! Look at my toys!" },
      "b1-meet-toys": { en: "These are my toys! Listen and say it with me!" },
      "b1-find": { en: "Find the toy! Listen and tap!" },
      "b1-words-end": { en: "Great! You know my toys!" },
      "b1-to-talk": { en: "Let's play a guessing game!" },
      "b1-talk-lead": { en: "Listen to my question!" },
      "a2-watch": { en: "Watch!" },
      "b1-is-it": { en: "Look and listen. Is it right? Thumbs up or thumbs down!" },
      "b1-guess": { en: "A toy is hiding in my box! Ask me! Tap a toy." },
      "b-guess-again": { en: "Which toy is it? Ask me!" },
      "sp-yes": { en: "Yes, it is!" },
      "sp-no": { en: "No, it isn't. Try again!" },
      "sp-is-teddy-bear": { en: "Is it a teddy bear?" }, "sp-is-ball": { en: "Is it a ball?" }, "sp-is-doll": { en: "Is it a doll?" },
      "sp-is-robot": { en: "Is it a robot?" }, "sp-is-top": { en: "Is it a top?" },
      "b1-talk-end": { en: "Great guessing!" },
      "b1-bye-1": { en: "Teddy bear, ball, doll, robot and top! I love my toys!" },
      "b1-bye-2": { en: "Thank you! Goodbye!" },
      "a2-reply": { en: "Goodbye!" }
    }
  };
})();
