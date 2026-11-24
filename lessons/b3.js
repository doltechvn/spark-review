/* B3 · More Toys with Sparky (24/11/2026). Nội dung: research/unit-B-lessons.vi.md mục B3.
   Dạy: ôn TÊN T · ÂM /t/ MỚI (t-t-ten, tap, top) · tên hay âm? · nghe âm ĐẦU /t/ (ten/pen…) ·
        Set 2 MỚI nghe–nói (kite, balloon, puzzle, toy car, bat; ball ↔ balloon) · "What is it?" → "It's a …" (nghe–nói) .
   Ranh giới: chưa đọc Set 2 (không bài đọc chữ), không "It's not a…", không B, không âm cuối/ghép âm, bé không đọc câu. */
(function () {
  const B = window.UNIT_B || {};
  const LT = (l, s = true) => ({ name: `media/letters/name-${l}.mp3`, ...(s ? { sound: `media/letters/sound-${l}.mp3` } : {}) });
  window.LESSON = {
    id: "B3", unit: "Unit B · My Toys", title: "More Toys with Sparky",
    words: B.words, vocab: [...(B.set1 || []), ...(B.set2 || [])], isAudio: B.isAudio, yesNo: B.yesNo, breakPhonics: false,
    letters: { a: LT("a"), e: LT("e"), i: LT("i"), o: LT("o"), u: LT("u"), t: LT("t") },
    whatIsIt: "media/speech_v2_11.wav",
    intro:  { frame: "media/scenes/b3-intro.jpg", lines: ["b3-intro-1", "b3-intro-2", "b3-intro-3"], poses: ["wave", "think", "cheer"] },
    finish: { frame: "media/scenes/b3-finish.jpg", lines: ["b3-bye-1", "b3-bye-2"], reply: "a2-reply" },
    map: { bg: "media/scenes/b-map.jpg", chip: "More Toys", start: [30, 88], goal: [50, 13],
           nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },
    stages: [
      { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/b-s-hello.jpg", lead: "a2-hello-lead",
        tasks: [{ kind: "feel", ask: "a1-how",
          options: [{ id: "happy", img: "media/feel/happy.png", reply: "a1-re-happy", pose: "cheer" }, { id: "sad", img: "media/feel/sad.png", reply: "a1-re-sad", pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", reply: "a2-re-hungry", pose: "talk" }, { id: "sleepy", img: "media/feel/sleepy.png", reply: "a1-re-sleepy", pose: "cheer" }] }] },

      { key: "letters", label: "Letters", vi: "Âm /t/", bg: "media/scenes/b3-s-letters.jpg",
        bridge: "b3-to-letters", lead: "a3-letters-lead", end: "b3-letters-end",
        tasks: [
          { kind: "pop", skill: "Ôn tên chữ (T + nguyên âm)", ask: "a2-findme",
            items: [{ name: "t", options: ["l", "t", "i"] }, { name: "o", by: "sound", options: ["o", "t", "a"] }, { name: "e", options: ["e", "t", "u"] }] },
          { kind: "teachLetters", letters: ["t"], ask: "b3-secret" },
          { kind: "soundExamples", letter: "t", words: ["ten", "tap", "top"], ask: "b3-t-words" },
          { kind: "nameOrSound", skill: "Tên chữ hay âm? (T)", ask: "a3-name-or-sound",
            items: [{ l: "t", by: "sound" }, { l: "t", by: "name" }, { l: "a", by: "sound" }, { l: "t", by: "sound" }, { l: "i", by: "name" }] },
          /* Jump for /t/ / Listen & Colour: 2 từ, chạm số của từ bắt đầu bằng /t/ (chỉ âm ĐẦU) */
          { kind: "listenFor", skill: "Nghe âm đầu /t/", letter: "t", ask: "b3-listen-t",
            items: [{ w: ["ten", "pen"], ans: 0 }, { w: ["map", "tap"], ans: 1 }, { w: ["top", "pop"], ans: 0 }, { w: ["pin", "tin"], ans: 1 }, { w: ["tug", "mug"], ans: 0 }] }
        ] },

      { key: "words", label: "Words", vi: "Đồ chơi mới", bg: "media/scenes/b3-s-words.jpg",
        bridge: "b3-to-words", lead: "b3-words-lead", end: "b3-words-end",
        tasks: [
          { kind: "readWords", ask: "b3-meet-toys", words: ["kite", "balloon", "puzzle", "toy car", "bat"] },
          /* Toy Corners / Slap: nghe từ → chạm hình; ball ↔ balloon */
          { kind: "listenPick", skill: "Nghe từ → chạm hình (Set 2)", ask: "a3-slap",
            items: [{ w: "balloon", options: ["ball", "balloon"] }, { w: "kite", options: ["kite", "bat"] },
                    { w: "toy car", options: ["kite", "balloon", "puzzle", "toy car", "bat"] }, { w: "puzzle", options: ["bat", "puzzle", "toy car", "balloon", "kite"] }] },
          { kind: "missing", reads: 2, countdown: 3, skill: "Nhớ từ: cái gì biến mất?", ask: "a1-missing",
            rounds: [{ show: ["kite", "puzzle", "bat"], hide: "puzzle" }, { show: ["balloon", "toy car", "kite", "bat"], hide: "toy car" }] }
        ] },

      { key: "talk", label: "Talk", vi: "What is it?", bg: "media/scenes/b3-s-talk.jpg",
        bridge: "b3-to-talk", lead: "a2-talk-lead", end: "a2-talk-end",
        tasks: [
          /* dẫn vào như trên lớp: "Is it a ball?" → "No, it isn't." → "It's a balloon!" */
          { kind: "isIt", skill: "Ôn \"Is it a…?\" (ball ↔ balloon)", ask: "b1-is-it",
            items: [{ show: "balloon", q: "ball" }, { show: "kite", q: "kite" }] },
          { kind: "ask", skill: "\"What is it?\" → \"It's a…\" (Set 2)", ask: "a1-ask",
            items: [{ show: "kite", wrong: "balloon" }, { show: "puzzle", wrong: "toy car" }, { show: "bat", wrong: "ball" }] },
          /* Pass the Toy Box: nhạc dừng → rút thẻ → nói "It's a …" */
          { kind: "showSay", ask: "b3-pass-box", rounds: 2, pool: ["kite", "balloon", "puzzle", "toy car", "bat", "ball"] }
        ] }
    ],
    wear: ["wear-firefighter", "wear-viking", "wear-strawhat"],
    report: [
      ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
      ["Chữ & âm", "Tên chữ T và ÂM MỚI /t/ (t-t-ten, tap, top) · phân biệt tên chữ với âm · nghe từ nào bắt đầu bằng /t/"],
      ["Từ vựng mới", "kite, balloon, puzzle, toy car, bat (nghe – nói) · phân biệt ball và balloon"],
      ["Hỏi – đáp", "\"What is it?\" → \"It's a kite.\" (bé mới có thể nói \"A kite.\")"]
    ],
    parentTip: "Chơi \"chuyền hộp đồ chơi\": bật nhạc, nhạc dừng thì rút một món và hỏi \"What is it?\" — con trả lời \"It's a kite.\" Đọc to ten, tap, top và nhấn âm đầu /t/ cho con nghe.",
    lines: {
      "b3-intro-1": { en: "Hello, friends! Look at my letter T!" },
      "b3-intro-2": { en: "Shh! T has a secret sound." },
      "b3-intro-3": { en: "And look! More toys in my toy box! Let's go!" },
      "a2-hello-lead": { en: "Hello, everyone!" }, "a1-how": { en: "How are you today?" },
      "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" }, "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
      "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" }, "a2-re-hungry": { en: "Me too! Let's have a yummy snack!" },
      "b3-to-letters": { en: "Let's find T's secret sound!" },
      "a3-letters-lead": { en: "Listen carefully!" },
      "a2-findme": { en: "Find me! Listen and pop!" },
      "b3-secret": { en: "T has a name, and T has a secret sound!" },
      "b3-t-words": { en: "Listen to T's secret sound! Say it with me!" },
      "a3-name-or-sound": { en: "Is it the name or the sound? Tap the eye or the ear!" },
      "b3-listen-t": { en: "Listen! Which word starts with T's sound? One or two?" },
      "b3-letters-end": { en: "Hooray! Now we know T's secret sound!" },
      "b3-to-words": { en: "Look! My toy box is back. More toys!" },
      "b3-words-lead": { en: "Wow! New toys!" },
      "b3-meet-toys": { en: "My new toys! Listen and say it with me!" },
      "a3-slap": { en: "Listen! Tap the picture, quick!" },
      "a1-missing": { en: "Look carefully! What's missing?" },
      "b3-words-end": { en: "Great! You know my new toys!" },
      "b3-to-talk": { en: "Let's play with my toy box!" },
      "a2-talk-lead": { en: "Let's talk!" },
      "b1-is-it": { en: "Look and listen. Is it right? Thumbs up or thumbs down!" },
      "sp-is-ball": { en: "Is it a ball?" }, "sp-is-kite": { en: "Is it a kite?" },
      "a1-ask": { en: "Can you answer my question?" },
      "b3-pass-box": { en: "Music! When it stops, pick a toy and tell me!" },
      "a2-talk-end": { en: "Great talking!" },
      "b3-bye-1": { en: "T has a secret sound! And I have more toys!" },
      "b3-bye-2": { en: "Thank you! Goodbye!" },
      "a2-reply": { en: "Goodbye!" }
    }
  };
})();
