/* A6 · Hello School Showcase (24/11/2026) — bài tổng kết Unit A. Nội dung: research/unit-A-lessons.vi.md mục A6.
   Dạy: tên + âm a e i o u p n · ĐÁNH VẦN bằng tên chữ (pen, pin, pan, nap, pop) · âm ĐẦU / âm CUỐI /p/ /n/ ·
        điền chữ thiếu (_en, pi_ …) · 11 từ (gọi tên + đọc, chọn 1 trong 3 tên) · sửa nhãn sai "It's not a rubber. It's a clock." ·
        xếp câu "It's / a / pencil." và "It's / not / a / desk.".
   Ranh giới: chỉ chữ a e i o u p n; CVC chỉ pen pin pan nap nip pip pop nun; chỉ 11 từ; chỉ What is it? / It's a / It's not a.
   Chưa làm: ghép âm trượt ngón tay (cần âm rời — user 23/11 chọn chỉ đọc cả từ) → dùng "nghe từ → điền chữ thiếu". */
(function () {
  const A = window.UNIT_A;
  window.LESSON = {
    id: "A6", unit: "Unit A · Hello School!", title: "Hello School Showcase",
    words: A.words, vocab: [...A.set1, ...A.set2], notAudio: A.notAudio, breakPhonics: false,
    letters: { a: A.letter("a"), e: A.letter("e"), i: A.letter("i"), o: A.letter("o"), u: A.letter("u"), p: A.letter("p"), n: A.letter("n") },
    whatIsIt: "media/speech_v2_11.wav",
    intro:  { frame: "media/scenes/a6-intro.jpg", lines: ["a6-intro-1", "a6-intro-2", "a6-intro-3"], poses: ["cheer", "wave", "talk"] },
    finish: { frame: "media/scenes/a6-finish.jpg", lines: ["a6-bye-1", "a6-bye-2", "a6-bye-3"], reply: "a2-reply" },
    map: { bg: "media/scenes/a1-map.jpg", chip: "Showcase", start: [30, 88], goal: [50, 13],
           nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },
    stages: [
      { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/a2-s-hello.jpg", lead: "a2-hello-lead",
        tasks: [{ kind: "feel", ask: "a1-how",
          options: [{ id: "happy", img: "media/feel/happy.png", reply: "a1-re-happy", pose: "cheer" }, { id: "sad", img: "media/feel/sad.png", reply: "a1-re-sad", pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", reply: "a2-re-hungry", pose: "talk" }, { id: "sleepy", img: "media/feel/sleepy.png", reply: "a1-re-sleepy", pose: "cheer" }] }] },

      { key: "letters", label: "Letters", vi: "Chữ & âm", bg: "media/scenes/a6-s-letters.jpg",
        bridge: "a6-to-letters", lead: "a6-letters-lead", end: "a6-letters-end",
        tasks: [
          { kind: "pop", skill: "Tên + âm 7 chữ (a e i o u p n)", ask: "a2-findme",
            items: [{ name: "n", by: "sound", options: ["p", "n", "e"] }, { name: "i", options: ["i", "a", "n"] },
                    { name: "p", by: "sound", options: ["o", "p", "u"] }, { name: "a", by: "sound", options: ["a", "e", "n"] }, { name: "u", options: ["n", "o", "u"] }] },
          { kind: "spell", skill: "Đánh vần bằng tên chữ", ask: "a6-spell",
            items: [{ w: "pen", extra: ["a"] }, { w: "pin", extra: ["e"] }, { w: "pan", extra: ["o"] }, { w: "nap", extra: ["i"] }, { w: "pop", extra: ["n"] }] },
          { kind: "position", skill: "Âm đầu hay âm cuối (/p/ /n/)", ask: "a6-where",
            items: [{ w: "pen", sound: "p", at: "start" }, { w: "laptop", sound: "p", at: "end" }, { w: "notebook", sound: "n", at: "start" },
                    { w: "pen", sound: "n", at: "end" }, { w: "nap", sound: "n", at: "start" }, { w: "top", sound: "p", at: "end" }] },
          { kind: "complete", skill: "Nghe từ → điền chữ thiếu", ask: "a6-complete",
            items: [{ w: "pen", at: 0, options: ["p", "n"] }, { w: "pin", at: 2, options: ["p", "n"] }, { w: "nap", at: 2, options: ["n", "p"] },
                    { w: "pop", at: 0, options: ["n", "p"] }, { w: "pan", at: 1, options: ["a", "i"] }, { w: "nip", at: 1, options: ["e", "i"] }] }
        ] },

      { key: "words", label: "Words", vi: "11 từ", bg: "media/scenes/a6-s-words.jpg",
        bridge: "a6-to-words", lead: "a2-words-lead", end: "a2-words-end",
        tasks: [
          { kind: "label", skill: "Chọn đúng tên (1 trong 3)", ask: "a2-label",
            items: [{ show: "clock", options: ["clock", "board", "chair"] }, { show: "notebook", options: ["book", "notebook", "pencil"] },
                    { show: "rubber", options: ["bag", "laptop", "rubber"] }, { show: "chair", options: ["desk", "chair", "clock"] }] },
          { kind: "listenPick", skill: "Nghe từ → chạm hình (11 từ)", ask: "a3-slap",
            items: [{ w: "pen", options: ["pencil", "pen", "desk", "bag", "board"] }, { w: "laptop", options: ["book", "clock", "laptop", "chair", "rubber"] }] },
          { kind: "readMatch", skill: "Đọc từ → chọn hình (11 từ)", ask: "a2-read-match",
            items: [{ word: "bag", options: ["bag", "book", "board"] }, { word: "desk", options: ["chair", "desk", "laptop"] }, { word: "pencil", options: ["pen", "rubber", "pencil"] }] }
        ] },

      { key: "talk", label: "Talk", vi: "Show time", bg: "media/scenes/a6-s-talk.jpg",
        bridge: "a6-to-talk", lead: "a6-talk-lead", end: "a6-talk-end",
        tasks: [
          /* sửa nhãn sai bằng mẫu đầy đủ "It's not a rubber. It's a clock." */
          { kind: "help", skill: "Sửa lời Sparky: It's not a… It's a…", ask: "a4-help",
            items: [{ show: "clock", say: "board", fix: A.fix["board>clock"], full: true }, { show: "desk", say: "chair", fix: A.fix["chair>desk"], full: true },
                    { show: "pen", say: "pen" }, { show: "bag", say: "rubber", fix: A.fix["rubber>bag"], full: true }] },
          { kind: "build", skill: "Xếp câu It's a / It's not a", ask: "a4-build",
            items: [{ show: "pencil", chunks: ["It's", "a", "pencil."], audio: "media/speech_v2_14.wav" },
                    { show: "chair", chunks: ["It's", "not", "a", "desk."], audio: "media/speech_v2_30.wav" }] },
          { kind: "showSay", ask: "a2-show", rounds: 2, pool: ["desk", "rubber", "clock", "notebook", "laptop", "bag"] }
        ] }
    ],
    wear: ["wear-grad", "wear-goldcrown", "wear-rainbow"],
    report: [
      ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
      ["Chữ & âm", "Tên + âm 7 chữ a e i o u p n · MỚI: đánh vần bằng tên chữ (P–E–N, pen) · âm đầu / âm cuối /p/ /n/ · điền chữ thiếu"],
      ["Từ vựng", "11 từ: gọi tên, nghe, đọc, chọn đúng tên"],
      ["Câu", "\"It's not a rubber. It's a clock.\" · xếp câu It's / a / pencil. và It's / not / a / desk."]
    ],
    parentTip: "Cùng con làm \"buổi biểu diễn\": con đánh vần P–E–N rồi đọc \"pen\", chỉ đồ vật và sửa lời ba mẹ khi ba mẹ gọi sai: \"It's not a rubber. It's a clock.\"",
    lines: {
      "a6-intro-1": { en: "Welcome to our show!" },
      "a6-intro-2": { en: "Today you can show me everything you learned!" },
      "a6-intro-3": { en: "Are you ready? Let's go!" },
      "a2-hello-lead": { en: "Hello, everyone!" }, "a1-how": { en: "How are you today?" },
      "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" }, "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
      "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" }, "a2-re-hungry": { en: "Me too! Let's have a yummy snack!" },
      "a6-to-letters": { en: "Show time! Our magic letters first!" },
      "a6-letters-lead": { en: "A, E, I, O, U, P, N! Let's go!" },
      "a2-findme": { en: "Find me! Listen and pop!" },
      "a6-spell": { en: "Let's spell! Listen, then tap the letters!" },
      "a6-where": { en: "Where is the sound? At the start or at the end?" },
      "a6-complete": { en: "Listen! Which letter is missing?" },
      "a6-letters-end": { en: "Wow! You are a letter star!" },
      "a6-to-words": { en: "Now show me all our words!" },
      "a2-words-lead": { en: "Look at the words!" }, "a2-label": { en: "What is it? Tap the right word!" },
      "a3-slap": { en: "Listen! Tap the picture, quick!" }, "a2-read-match": { en: "Read the word. Tap the picture!" },
      "a2-read-it": { en: "Read it! Which one?" }, "a2-words-end": { en: "Wow! You can read!" },
      "a6-to-talk": { en: "Last show! Can you fix my silly names?" },
      "a6-talk-lead": { en: "Let's talk!" },
      "a4-help": { en: "I say a name. Is it right? Thumbs up or thumbs down!" },
      "a2-yes": { en: "Yes! It is!" }, "fb-thanks": { en: "Thank you!" },
      "a4-build": { en: "Read and build the sentence!" },
      "a2-show": { en: "Music! When it stops, tap a card!" },
      "a6-talk-end": { en: "What a great show!" },
      "a6-bye-1": { en: "You did it! Unit A is all done!" },
      "a6-bye-2": { en: "You are a Hello School superstar!" },
      "a6-bye-3": { en: "Thank you! Goodbye!" },
      "a2-reply": { en: "Goodbye!" }
    }
  };
})();
