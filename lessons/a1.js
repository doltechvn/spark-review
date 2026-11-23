/* A1 · Sparky's First Day — bài ôn kiểu hành trình (tham khảo kid-listening.dol.vn, 17/11/2026).
   Chỉ dùng nội dung đã dạy ở A1 (tab A1, WHW SPARK).
   Ranh giới: không P/N, không Set 2, không "It's not a…", không đọc/viết từ, không đánh vần/ghép âm.
   Ảnh: lessons/a1.art.json → tools/gen_scenes.py a1 (tự vẽ + tự soát).
   Lời Sparky: lines{} dưới đây → tools/gen_voice.py a1 (giọng Sparky đã khoá) → media/voice/<id>.mp3.
   Bản cũ (bảng trắng, cảnh ngang): Spark Review Web/_v1/. */
window.LESSON = {
  id: "A1",
  unit: "Unit A · Hello School!",
  title: "Sparky's First Day",

  words: {
    pen:      { img: "media/pen.png",      audio: "media/words/pen.mp3", sentence: "media/speech_v2_13.wav" },
    pencil:   { img: "media/pencil.png",   audio: "media/words/pencil.mp3", sentence: "media/speech_v2_14.wav" },
    book:     { img: "media/book.png",     audio: "media/words/book.mp3", sentence: "media/speech_v2_15.wav" },
    notebook: { img: "media/notebook.png", audio: "media/words/notebook.mp3", sentence: "media/speech_v2_16.wav" },
    bag:      { img: "media/bag.png",      audio: "media/words/bag.mp3", sentence: "media/speech_v2_17.wav" },
    rubber:   { img: "media/rubber.png",   audio: "media/words/rubber.mp3", sentence: "media/speech_v2_18.wav" }
  },
  /* Tên + âm chữ: bản Automation đã duyệt (media/letters/SOURCE.txt) — không đọc máy */
  letters: {
    a: { name: "media/letters/name-a.mp3", sound: "media/letters/sound-a.mp3" },
    e: { name: "media/letters/name-e.mp3", sound: "media/letters/sound-e.mp3" },
    i: { name: "media/letters/name-i.mp3", sound: "media/letters/sound-i.mp3" },
    o: { name: "media/letters/name-o.mp3", sound: "media/letters/sound-o.mp3" },
    u: { name: "media/letters/name-u.mp3", sound: "media/letters/sound-u.mp3" }
  },
  whatIsIt: "media/speech_v2_11.wav",

  intro:  { frame: "media/scenes/a1-intro.jpg",  lines: ["a1-intro-1", "a1-intro-2", "a1-intro-3"] },
  finish: { frame: "media/scenes/a1-finish.jpg", lines: ["a1-bye-1", "a1-bye-2"], reply: "a1-reply" },

  /* Bản đồ: nhà Sparky (dưới) → trường (trên). Toạ độ % khung; app tự vẽ đường cong qua các điểm. */
  map: { bg: "media/scenes/a1-map.jpg", start: [30, 88], goal: [50, 13],
         nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },

  stages: [

    /* Circle time: bé chọn cảm xúc → bé nghe câu mẫu "I'm …" → Sparky ĐÁP RIÊNG theo cảm xúc (user 17/11: bấm sad mà Sparky "I'm happy too" là sai) */
    { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/a1-s-hello.jpg",
      lead: "a1-hello-lead",
      tasks: [
        { kind: "feel", ask: "a1-how",
          /* F1 (18/11): hình đầu Sparky + chữ dưới — ĐÚNG bộ hình Circle time trên lớp (C1–C6, D1; media/feel/SOURCE.txt) */
          options: [{ id: "happy",  img: "media/feel/happy.png",  line: "fb-im-happy",  reply: "a1-re-happy",  pose: "cheer" },
                    { id: "sad",    img: "media/feel/sad.png",    line: "fb-im-sad",    reply: "a1-re-sad",    pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", line: "fb-im-hungry", reply: "a1-re-hungry", pose: "talk" },
                    { id: "sleepy", img: "media/feel/sleepy.png", line: "fb-im-sleepy", reply: "a1-re-sleepy", pose: "cheer" }] }
      ] },

    { key: "letters", label: "Letters", vi: "Chữ & âm", bg: "media/scenes/a1-s-letters.jpg",
      bridge: "a1-to-letters", lead: "a1-letters-lead", end: "a1-letters-end",
      tasks: [
        /* Dạy lại từng chữ như trên lớp: TÊN (👁️ "Its name is…") → ÂM (👂 "Its sound is…") → bé nói theo → bé tự chạm kiểm tra;
           xong 5 chữ thì đọc thuộc hết TÊN rồi hết ÂM (chant). */
        { kind: "teachLetters", letters: ["a", "e", "i", "o", "u"], ask: "a1-meet-letters",
          vi: "Sparky dạy lại TÊN và ÂM của từng chữ. Con nghe rồi nói theo nha!" },
        { kind: "pop", skill: "Tên chữ (a e i o u)", ask: "a1-pop", vi: "Nghe tên chữ, rồi chạm vào bong bóng có chữ đó.",
          items: [{ name: "e", options: ["e", "a", "o"] }, { name: "o", options: ["u", "o", "i"] },
                  { name: "a", options: ["a", "i", "e"] }, { name: "u", options: ["o", "e", "u"] }] },
        { kind: "password", skill: "Âm chữ (a e i o u)", ask: "a1-password", vi: "Mật khẩu thần kỳ! Nghe ÂM, rồi chạm đúng chữ để mở từng ổ khóa.",
          sequence: ["e", "i", "a", "u", "o"], chant: "a1-open" }
      ] },

    { key: "words", label: "Words", vi: "Từ vựng", bg: "media/scenes/a1-s-words.jpg",
      bridge: "a1-to-words", lead: "a1-words-lead", end: "a1-words-end",
      bagAt: [75, 38],   /* cặp mở trong tranh (toạ độ % TRANH) — đồ bay vào đây */
      tasks: [
        { kind: "story", beats: [
          { word: "pencil", line: "a1-beat-pencil" }, { word: "rubber", line: "a1-beat-rubber" },
          { word: "pen", line: "a1-beat-pen" }, { word: "notebook", line: "a1-beat-notebook" },
          { word: "book", line: "a1-beat-book" } ] },
        { kind: "pack", skill: "Nghe từ → xếp vào cặp", ask: "a1-pack", vi: "Nghe tên đồ vật, rồi chạm vào nó để bỏ vào cặp.",
          order: ["pen", "book", "rubber", "pencil", "notebook"] },
        { kind: "missing", skill: "Nhớ từ: cái gì biến mất?", ask: "a1-missing", vi: "Nhìn kỹ nha! Một món sẽ biến mất. Chạm vào món bị mất.",
          rounds: [{ show: ["pen", "book", "bag"], hide: "book" }, { show: ["pencil", "rubber", "notebook", "pen"], hide: "rubber" }] }
      ] },

    { key: "talk", label: "Talk", vi: "Hỏi – đáp", bg: "media/scenes/a1-s-talk.jpg",
      bridge: "a1-to-talk", lead: "a1-talk-lead", end: "a1-talk-end",
      tasks: [
        { kind: "video", src: "media/talk_what.mp4", ask: "a1-watch", vi: "Xem Sparky và các bạn hỏi – đáp nha.",
          /* T1: hội thoại trong video, để lại chữ + loa (bản thu đã duyệt) */
          dialog: [
            { side: "ask",      text: "What is it?",    audio: "media/speech_v2_11.wav", t: [0.0, 1.6] },   /* Sparky */
            { side: "ans ansR", text: "It's a book.",   audio: "media/speech_v2_15.wav", t: [1.9, 3.4] },   /* bạn cầm sách (phải) */
            { side: "ask",      text: "What is it?",    audio: "media/speech_v2_11.wav", t: [3.5, 5.2] },   /* Sparky */
            { side: "ans ansL", text: "It's a pencil.", audio: "media/speech_v2_14.wav", t: [5.8, 7.6] } ] }, /* bạn cầm bút chì (trái) — mốc đo bằng whisper 17/11 */
        { kind: "pick", skill: "Nghe câu \"It's a…\" → chọn hình", ask: "fb-listen", vi: "Nghe câu, rồi chạm vào đúng hình.",
          items: [{ sentence: "book", options: ["pen", "book"] }, { sentence: "pen", options: ["pen", "pencil"] }, { sentence: "bag", options: ["notebook", "bag"] }] },
        { kind: "ask", skill: "\"What is it?\" → \"It's a…\"", ask: "a1-ask", vi: "Chạm từng bóng thoại để nghe, rồi chọn câu trả lời đúng. Sau đó tới lượt con nói!",
          items: [{ show: "pencil", wrong: "pen" }, { show: "notebook", wrong: "book" }, { show: "rubber", wrong: "bag" }] }
      ] }
  ],

  /* S4 (18/11): quà cuối bài = đồ cho TỦ ĐỒ Sparky (media/wear/, vẽ bằng tools/gen_scenes.py a1 — kind wear). Bé chọn 1 trong 3 → Sparky mặc luôn. */
  wear: ["wear-cap", "wear-bow", "wear-crown"],
  report: [
    ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
    ["Chữ & âm", "5 chữ a, e, i, o, u — tên chữ và âm"],
    ["Từ vựng", "pen, pencil, book, notebook, bag, rubber (nghe – nói)"],
    ["Hỏi – đáp", "\"What is it?\" → \"It's a pen!\""]
  ],
  parentTip: "Chỉ vào một đồ dùng học tập và hỏi con: \"What is it?\" — con trả lời \"A pen!\" hoặc \"It's a pen!\" đều giỏi.",

  /* Lời Sparky của bài (en = thu giọng; vi = phụ đề cho phụ huynh khi bật Aa + tiếng Việt) */
  lines: {
    "a1-intro-1": { en: "Good morning! I'm Sparky!", vi: "Chào buổi sáng! Mình là Sparky nè!" },
    "a1-intro-2": { en: "Today is my first day of school!", vi: "Hôm nay là ngày đầu tiên mình đi học đó!" },
    "a1-intro-3": { en: "Can you help me pack my bag?", vi: "Bạn giúp mình xếp cặp nha?" },
    "a1-hello-lead": { en: "Good morning, friend!" },
    "a1-how": { en: "How are you today?" },
    "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" },
    "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
    "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" },
    "a1-re-hungry": { en: "Me too! Yummy breakfast first, then school!" },
    "a1-to-letters": { en: "Oh no! My bag is locked! We need the magic letters!", vi: "Ôi không! Cặp mình bị khóa! Mình cần chữ cái thần kỳ!" },
    "a1-letters-lead": { en: "Look! A magic lock!", vi: "Nhìn nè! Ổ khóa thần kỳ!" },
    "a1-meet-letters": { en: "Meet the magic letters!", vi: "Làm quen với chữ cái thần kỳ nè!" },
    "a1-pop": { en: "Listen! Pop the letter!", vi: "Nghe nè! Chạm bong bóng có chữ đó!" },
    "a1-password": { en: "Magic password! Listen to the sound.", vi: "Mật khẩu thần kỳ! Nghe âm nha." },
    "a1-open": { en: "Open!", vi: "Mở ra!" },
    "a1-letters-end": { en: "Yay! My bag is open!", vi: "Yay! Cặp mở rồi!" },
    "a1-to-words": { en: "Now, let's pack my bag!", vi: "Giờ mình cùng xếp cặp nha!" },
    "a1-words-lead": { en: "What do I need for school?", vi: "Đi học mình cần mang gì nhỉ?" },
    "a1-beat-pencil": { en: "I want to draw my mum. What do I need?", vi: "Mình muốn vẽ mẹ. Mình cần gì nhỉ?" },
    "a1-beat-rubber": { en: "Oops! A mistake! Nom, nom, nom!", vi: "Ối, vẽ sai rồi! Cục gôm ăn nét chì — nom nom nom!" },
    "a1-beat-pen": { en: "Now I write my name. Click!", vi: "Giờ mình viết tên. Bấm nắp — click!" },
    "a1-beat-notebook": { en: "Where can I write?", vi: "Mình viết vào đâu ta?" },
    "a1-beat-book": { en: "I want to read a story!", vi: "Mình muốn đọc truyện!" },
    "a1-pack": { en: "Pack my bag! Listen and tap!", vi: "Xếp cặp nào! Nghe rồi chạm nha!" },
    "a1-missing": { en: "Look carefully! What's missing?", vi: "Nhìn kỹ nha! Cái gì biến mất?" },
    "a1-words-end": { en: "My bag is full! Let's go to school!", vi: "Cặp đầy rồi! Mình đi học thôi!" },
    "a1-to-talk": { en: "We're at school! Let's watch and listen.", vi: "Tới trường rồi! Mình xem và nghe nha." },
    "a1-talk-lead": { en: "My friends are here!", vi: "Các bạn của mình đây rồi!" },
    "a1-watch": { en: "Watch!", vi: "Xem nè!" },
    "a1-ask": { en: "Can you answer my question?", vi: "Bạn trả lời câu hỏi của mình nha?" },
    "a1-talk-end": { en: "Wow! You can say it!", vi: "Oa! Bạn nói được rồi!" },
    "a1-bye-1": { en: "My bag is full! Hello, school!", vi: "Cặp mình đầy ắp! Chào trường mới!" },
    "a1-bye-2": { en: "Thank you, friend!", vi: "Cảm ơn bạn nha!" },
    "a1-reply": { en: "You're welcome!", vi: "Chạm để đáp lại Sparky: \"You're welcome!\"" }
  }
};
