/* B6 · Toy Box Showcase (24/11/2026) — bài tổng kết Unit B. Nội dung: research/unit-B-lessons.vi.md mục B6.
   Dạy: tên + âm a e i o u t b · ĐÁNH VẦN bằng tên chữ (bat, tab, tub, bit, but) · âm ĐẦU / âm CUỐI /t/ /b/ ·
        điền chữ thiếu (ba_, _ub, t_b…) · 10 đồ chơi (chọn đúng tên, đọc chữ) · Mystery Toy "Is it a…?" ·
        Read & Circle (đọc câu hỏi → Yes, it is./No, it isn't.) · xếp chunks "Is / it / a / kite?" và "It's / not / a / ball.".
   Ranh giới: chỉ chữ a e i o u t b; CVC chỉ bat tab tub bit but bib; chỉ 10 đồ chơi; không tự viết câu.
   Như A6: chưa làm ghép âm trượt ngón tay (cần âm rời — user 23/11 chọn chỉ đọc cả từ) → dùng "nghe từ → điền chữ thiếu". */
(function () {
  const B = window.UNIT_B || {};
  const LT = (l, s = true) => ({ name: `media/letters/name-${l}.mp3`, ...(s ? { sound: `media/letters/sound-${l}.mp3` } : {}) });
  window.LESSON = {
    id: "B6", unit: "Unit B · My Toys", title: "Toy Box Showcase",
    words: B.words, vocab: [...(B.set1 || []), ...(B.set2 || [])], notAudio: B.notAudio, isAudio: B.isAudio, yesNo: B.yesNo, breakPhonics: false,
    letters: { a: LT("a"), e: LT("e"), i: LT("i"), o: LT("o"), u: LT("u"), t: LT("t"), b: LT("b") },
    intro:  { frame: "media/scenes/b6-intro.jpg", lines: ["b6-intro-1", "b6-intro-2", "b6-intro-3"], poses: ["cheer", "wave", "talk"] },
    finish: { frame: "media/scenes/b6-finish.jpg", lines: ["b6-bye-1", "b6-bye-2", "b6-bye-3"], reply: "a2-reply" },
    map: { bg: "media/scenes/b-map.jpg", chip: "Showcase", start: [30, 88], goal: [50, 13],
           nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },
    stages: [
      { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/b-s-hello.jpg", lead: "a2-hello-lead",
        tasks: [{ kind: "feel", ask: "a1-how",
          options: [{ id: "happy", img: "media/feel/happy.png", reply: "a1-re-happy", pose: "cheer" }, { id: "sad", img: "media/feel/sad.png", reply: "a1-re-sad", pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", reply: "a2-re-hungry", pose: "talk" }, { id: "sleepy", img: "media/feel/sleepy.png", reply: "a1-re-sleepy", pose: "cheer" }] }] },

      { key: "letters", label: "Letters", vi: "Chữ & âm", bg: "media/scenes/b6-s-letters.jpg",
        bridge: "a6-to-letters", lead: "b6-letters-lead", end: "a6-letters-end",
        tasks: [
          { kind: "pop", skill: "Tên + âm 7 chữ (a e i o u t b)", ask: "a2-findme",
            items: [{ name: "t", by: "sound", options: ["b", "t", "e"] }, { name: "i", options: ["i", "a", "t"] },
                    { name: "b", by: "sound", options: ["d", "b", "p"] }, { name: "e", options: ["e", "i", "b"] }, { name: "u", by: "sound", options: ["a", "u", "o"] }] },
          /* Listen & Spell: nghe từ → chạm chữ đúng thứ tự (mỗi chạm đọc tên chữ: B – A – T) → đọc cả từ */
          { kind: "spell", skill: "Đánh vần bằng tên chữ", ask: "a6-spell",
            items: [{ w: "bat", extra: ["e"] }, { w: "tab", extra: ["u"] }, { w: "tub", extra: ["a"] }, { w: "bit", extra: ["e"] }, { w: "but", extra: ["i"] }] },
          /* Paddle 1 or 2 (đầu / cuối): /b/ đầu ball – cuối tub; /t/ đầu top – cuối bat */
          { kind: "position", skill: "Âm đầu hay âm cuối (/t/ /b/)", ask: "a6-where",
            items: [{ w: "ball", sound: "b", at: "start" }, { w: "tub", sound: "b", at: "end" }, { w: "top", sound: "t", at: "start" },
                    { w: "bat", sound: "t", at: "end" }, { w: "bus", sound: "b", at: "start" }, { w: "cat", sound: "t", at: "end" }] },
          /* Listen & Complete: ba_ (bat) · _ub (tub) · t_b (tab) · b_b (bib) · b_t (but) */
          { kind: "complete", skill: "Nghe từ → điền chữ thiếu", ask: "a6-complete",
            items: [{ w: "bat", at: 2, options: ["b", "t"] }, { w: "tub", at: 0, options: ["b", "t"] }, { w: "tab", at: 1, options: ["u", "a"] },
                    { w: "bib", at: 1, options: ["i", "e"] }, { w: "but", at: 1, options: ["a", "u"] }, { w: "tab", at: 2, options: ["t", "b"] }] }
        ] },

      { key: "words", label: "Words", vi: "10 đồ chơi", bg: "media/scenes/b6-s-words.jpg",
        bridge: "b6-to-words", lead: "a2-words-lead", end: "a2-words-end",
        tasks: [
          { kind: "label", skill: "Chọn đúng tên (1 trong 3)", ask: "a2-label",
            items: [{ show: "ball", options: ["ball", "balloon", "bat"] }, { show: "toy car", options: ["top", "toy car", "teddy bear"] },
                    { show: "puzzle", options: ["kite", "doll", "puzzle"] }, { show: "robot", options: ["robot", "ball", "bat"] }] },
          { kind: "readMatch", skill: "Đọc từ → chọn hình (10 từ)", ask: "a2-read-match",
            items: [{ word: "balloon", options: ["ball", "balloon", "bat"] }, { word: "top", options: ["toy car", "teddy bear", "top"] }, { word: "kite", options: ["kite", "puzzle", "doll"] }] }
        ] },

      { key: "talk", label: "Talk", vi: "Show time", bg: "media/scenes/b6-s-talk.jpg",
        bridge: "b6-to-talk", lead: "a2-talk-lead", end: "a6-talk-end",
        tasks: [
          /* Mystery Toy: hình ló một góc → bé hỏi "Is it a toy car?" */
          { kind: "guess", skill: "Mystery Toy: hỏi \"Is it a…?\"", ask: "b6-mystery", again: "b-guess-again",
            items: [{ show: "toy car", options: ["toy car", "top", "bat"], peek: [30, 62] }, { show: "kite", options: ["balloon", "puzzle", "kite"], peek: [62, 30] }] },
          /* Read & Circle (HW1): bé đọc câu hỏi → Yes, it is. / No, it isn't. (3 Yes, 2 No) */
          { kind: "isIt", read: true, skill: "Đọc câu hỏi → Yes, it is. / No, it isn't.", ask: "b6-read-answer", readLine: "b-read-q",
            items: [{ show: "ball", q: "ball" }, { show: "kite", q: "balloon" }, { show: "doll", q: "doll" }, { show: "toy car", q: "bat" }, { show: "puzzle", q: "puzzle" }] },
          /* Read & Stick / Build sentences: xếp chunks ("not" luôn sau "It's"; dấu chấm/hỏi đi với từ cuối) */
          { kind: "build", skill: "Xếp câu: Is it a…? / It's (not) a…", ask: "a4-build",
            items: [{ show: "kite", chunks: ["Is", "it", "a", "kite?"], audio: "media/b/s-is-kite.wav" },
                    { show: "balloon", chunks: ["It's", "not", "a", "ball."], audio: "media/b/s-not-ball.wav" },
                    { show: "robot", chunks: ["It's", "a", "robot."], audio: "media/b/s-its-robot.wav" }] }
        ] }
    ],
    wear: ["wear-tiara", "wear-jester", "wear-unicorn"],
    report: [
      ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
      ["Chữ & âm", "Tên + âm 7 chữ a e i o u t b · MỚI: đánh vần bằng tên chữ (B–A–T, bat) · âm đầu / âm cuối /t/ /b/ · điền chữ thiếu (ba_, _ub, t_b)"],
      ["Từ vựng", "10 đồ chơi: chọn đúng tên, đọc chữ"],
      ["Câu", "Hỏi \"Is it a toy car?\" để đoán · đọc câu hỏi và trả lời \"Yes, it is.\" / \"No, it isn't.\" · xếp câu Is / it / a / kite? và It's / not / a / ball."]
    ],
    parentTip: "Cùng con làm \"Toy Box Showcase\": con đánh vần B–A–T rồi đọc \"bat\", giấu một món đồ chơi cho con hỏi \"Is it a…?\", và đọc cùng con các câu \"It's not a ball.\"",
    lines: {
      "b6-intro-1": { en: "Today is our Toy Box Showcase!" },
      "b6-intro-2": { en: "Show me everything you know!" },
      "b6-intro-3": { en: "Are you ready? Let's go!" },
      "a2-hello-lead": { en: "Hello, everyone!" }, "a1-how": { en: "How are you today?" },
      "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" }, "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
      "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" }, "a2-re-hungry": { en: "Me too! Let's have a yummy snack!" },
      "a6-to-letters": { en: "Show time! Our magic letters first!" },
      "b6-letters-lead": { en: "Names and sounds! Let's go!" },
      "a2-findme": { en: "Find me! Listen and pop!" },
      "a6-spell": { en: "Let's spell! Listen, then tap the letters!" },
      "a6-where": { en: "Where is the sound? At the start or at the end?" },
      "a6-complete": { en: "Listen! Which letter is missing?" },
      "a6-letters-end": { en: "Wow! You are a letter star!" },
      "b6-to-words": { en: "Now show me all my toys!" },
      "a2-words-lead": { en: "Look at the words!" }, "a2-label": { en: "What is it? Tap the right word!" },
      "a2-read-match": { en: "Read the word. Tap the picture!" }, "a2-read-it": { en: "Read it! Which one?" },
      "a2-words-end": { en: "Wow! You can read!" },
      "b6-to-talk": { en: "Last show! Let's ask and answer!" },
      "a2-talk-lead": { en: "Let's talk!" },
      "b6-mystery": { en: "Mystery toy! Can you guess? Ask me! Tap a toy." },
      "b-guess-again": { en: "Which toy is it? Ask me!" },
      "sp-yes": { en: "Yes, it is!" },
      "sp-no": { en: "No, it isn't. Try again!" },
      "b6-read-answer": { en: "Read my question. Then answer me!" },
      "b-read-q": { en: "Read the question! Yes, or no?" },
      "sp-is-ball": { en: "Is it a ball?" }, "sp-is-balloon": { en: "Is it a balloon?" }, "sp-is-doll": { en: "Is it a doll?" },
      "sp-is-bat": { en: "Is it a bat?" }, "sp-is-puzzle": { en: "Is it a puzzle?" },
      "a4-build": { en: "Read and build the sentence!" },
      "a6-talk-end": { en: "What a great show!" },
      "b6-bye-1": { en: "You did it! Unit B is all done!" },
      "b6-bye-2": { en: "You are a toy box superstar!" },
      "b6-bye-3": { en: "Thank you! Goodbye!" },
      "a2-reply": { en: "Goodbye!" }
    }
  };
})();
