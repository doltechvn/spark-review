/* A2 · Letter P Day — bài ôn kiểu hành trình (khuôn A1, 23/11/2026). Nội dung: research/unit-A-lessons.vi.md mục A2.
   Dạy: ôn 5 nguyên âm (tên + âm) · P/p MỚI: chỉ TÊN + HÌNH + TÔ (CHƯA âm /p/) · Set 1 chuyển sang ĐỌC (đọc từ, nối chữ–hình)
        · "What is it?" → "It's a…" (củng cố nói) · Tick or Cross câu "It's a…".
   Ranh giới: không âm /p/, không pot/pan, không N, không Set 2, không "It's not a…", không đánh vần/ghép âm, không viết từ.
   Ảnh: lessons/a2.art.json → tools/gen_scenes.py a2 (bản đồ dùng lại a1-map). Lời: lines{} → tools/gen_voice.py a2.
   Tên chữ P: media/letters/name-p.mp3 (bản thu đã duyệt, B4 — xem media/letters/SOURCE.txt). */
window.LESSON = {
  id: "A2",
  unit: "Unit A · Hello School!",
  title: "Letter P Day",

  words: {
    pen:      { img: "media/pen.png",      audio: "media/words/pen.mp3",      sentence: "media/speech_v2_13.wav" },
    pencil:   { img: "media/pencil.png",   audio: "media/words/pencil.mp3",   sentence: "media/speech_v2_14.wav" },
    book:     { img: "media/book.png",     audio: "media/words/book.mp3",     sentence: "media/speech_v2_15.wav" },
    notebook: { img: "media/notebook.png", audio: "media/words/notebook.mp3", sentence: "media/speech_v2_16.wav" },
    bag:      { img: "media/bag.png",      audio: "media/words/bag.mp3",      sentence: "media/speech_v2_17.wav" },
    rubber:   { img: "media/rubber.png",   audio: "media/words/rubber.mp3",   sentence: "media/speech_v2_18.wav" }
  },
  /* A2-1 (23/11, user: "bag thì sẽ là b a g bag"): đọc tách âm CÓ TIẾNG — [phần chữ, âm rời] (media/phonemes/<âm>.mp3 = thư viện âm
     đã duyệt của Automation). Phần nào sáng thì phát âm đó, rồi đọc cả từ. */
  breakPhonics: false,  /* 23/11 user: "Chỉ đọc cả từ" — chỉ hiện từ + đọc cả từ (không tách âm). true = đọc tách âm có tiếng */
  splits: {
    pen:      [["p", "p"], ["e", "short-e"], ["n", "n"]],
    pencil:   [["p", "p"], ["e", "short-e"], ["n", "n"], ["c", "s"], ["i", "short-i"], ["l", "l"]],
    book:     [["b", "b"], ["oo", "oo-short"], ["k", "k"]],
    notebook: [["n", "n"], ["o", "long-o"], ["te", "t"], ["b", "b"], ["oo", "oo-short"], ["k", "k"]],
    bag:      [["b", "b"], ["a", "short-a"], ["g", "g"]],
    rubber:   [["r", "r"], ["u", "short-u"], ["bb", "b"], ["er", "schwa"]]
  },
  letters: {
    a: { name: "media/letters/name-a.mp3", sound: "media/letters/sound-a.mp3" },
    e: { name: "media/letters/name-e.mp3", sound: "media/letters/sound-e.mp3" },
    i: { name: "media/letters/name-i.mp3", sound: "media/letters/sound-i.mp3" },
    o: { name: "media/letters/name-o.mp3", sound: "media/letters/sound-o.mp3" },
    u: { name: "media/letters/name-u.mp3", sound: "media/letters/sound-u.mp3" },
    p: { name: "media/letters/name-p.mp3" }          /* A2: CHỈ tên — âm /p/ để A3 */
  },
  whatIsIt: "media/speech_v2_11.wav",

  intro:  { frame: "media/scenes/a2-intro.jpg", lines: ["a2-intro-1", "a2-intro-2", "a2-intro-3"], poses: ["wave", "cheer", "talk"] },
  finish: { frame: "media/scenes/a2-finish.jpg", lines: ["a2-bye-1", "a2-bye-2"], reply: "a2-reply" },

  /* cùng thị trấn A1: nhà Sparky (dưới) → trường (trên) */
  map: { bg: "media/scenes/a1-map.jpg", chip: "Letter P Day", start: [30, 88], goal: [50, 13],
         nodes: { hello: [64, 72], letters: [34, 56], words: [66, 40], talk: [38, 26] } },

  stages: [
    { key: "hello", label: "Hello", vi: "Chào hỏi", bg: "media/scenes/a2-s-hello.jpg",
      lead: "a2-hello-lead",
      tasks: [
        { kind: "feel", ask: "a1-how",
          options: [{ id: "happy",  img: "media/feel/happy.png",  reply: "a1-re-happy",  pose: "cheer" },
                    { id: "sad",    img: "media/feel/sad.png",    reply: "a1-re-sad",    pose: "oops" },
                    { id: "hungry", img: "media/feel/hungry.png", reply: "a2-re-hungry", pose: "talk" },
                    { id: "sleepy", img: "media/feel/sleepy.png", reply: "a1-re-sleepy", pose: "cheer" }] }
      ] },

    { key: "letters", label: "Letters", vi: "Chữ P", bg: "media/scenes/a2-s-letters.jpg",
      bridge: "a2-to-letters", lead: "a2-letters-lead", end: "a2-letters-end",
      tasks: [
        /* Find me! ôn nguyên âm: nghe TÊN hoặc ÂM → chạm bong bóng */
        { kind: "pop", skill: "Ôn nguyên âm (tên + âm)", ask: "a2-findme", vi: "Nghe tên hoặc âm của chữ, rồi chạm bong bóng.",
          items: [{ name: "a", options: ["a", "o", "e"] }, { name: "i", by: "sound", options: ["u", "i", "a"] },
                  { name: "u", options: ["e", "u", "o"] }, { name: "o", by: "sound", options: ["o", "a", "i"] }] },
        /* chữ mới: TÊN + HÌNH (big P / small p) — không có nút âm */
        { kind: "meetLetter", letter: "p", ask: "a2-new-letter", vi: "Chữ mới: P! Nghe tên chữ, nói theo, xem P to và p nhỏ." },
        /* tô theo nét: P to rồi p nhỏ — Sparky làm mẫu thứ tự nét trước */
        { kind: "trace", skill: "Tô chữ P, p", letters: ["P", "p"], ask: "a2-trace", vi: "Xem Sparky tô mẫu, rồi con dùng ngón tay tô theo nét." },
        /* Find 'p'! lưới b, p, d, q, e, a */
        { kind: "findGrid", skill: "Tìm chữ p (b, d, q dễ nhầm)", target: "p", ask: "a2-find-p", vi: "Tìm và chạm hết các chữ p.",
          grid: ["b", "p", "d", "q", "p", "e", "a", "d", "q", "b", "p", "e"] },
        /* nghe tên chữ → chạm (p + nguyên âm) */
        { kind: "pop", skill: "Nghe tên chữ → chạm (p + nguyên âm)", ask: "a2-touch", vi: "Nghe tên chữ, rồi chạm vào chữ đó.",
          items: [{ name: "p", options: ["a", "p", "e"] }, { name: "e", options: ["p", "i", "e"] }, { name: "p", options: ["p", "o", "u"] }] }
      ] },

    { key: "words", label: "Words", vi: "Đọc từ", bg: "media/scenes/a2-s-words.jpg",
      bridge: "a2-to-words", lead: "a2-words-lead", end: "a2-words-end",
      tasks: [
        /* A2-1: mỗi lượt 1 hình + 1 chữ; đọc tách âm có tiếng (b · a · g → bag); cặp dễ nhầm đi liền nhau */
        { kind: "readWords", ask: "a2-read-with-me", words: ["pen", "pencil", "book", "notebook", "bag", "rubber"] },
        /* đọc chữ → chạm hình (không đọc to trước — bé tự đọc) */
        { kind: "readMatch", skill: "Đọc từ → chọn hình", ask: "a2-read-match", vi: "Đọc chữ, rồi chạm vào đúng hình.",
          items: [{ word: "pencil", options: ["pen", "pencil"] }, { word: "notebook", options: ["notebook", "book"] },
                  { word: "rubber", options: ["bag", "rubber", "pen"] }, { word: "pen", options: ["pencil", "book", "pen"] }] },
        /* Read & Match: nhìn hình → chọn nhãn chữ đúng */
        { kind: "label", skill: "Nhìn hình → chọn chữ", ask: "a2-label", vi: "Nhìn hình, rồi chọn đúng tên gọi.",
          items: [{ show: "book", options: ["book", "notebook"] }, { show: "bag", options: ["bag", "book"] }, { show: "pencil", options: ["pen", "pencil"] }] }
      ] },

    { key: "talk", label: "Talk", vi: "Hỏi – đáp", bg: "media/scenes/a2-s-talk.jpg",
      bridge: "a2-to-talk", lead: "a2-talk-lead", end: "a2-talk-end",
      tasks: [
        { kind: "ask", skill: "\"What is it?\" → \"It's a…\"", ask: "a1-ask", vi: "Nghe câu hỏi, chọn câu trả lời đúng, rồi tới lượt con nói.",
          items: [{ show: "book", wrong: "notebook" }, { show: "pen", wrong: "pencil" }] },
        /* Tick or Cross (homework A2): câu "It's a…" có đúng với hình không? */
        { kind: "tick", skill: "Đọc/nghe câu → đúng hay sai", ask: "a2-tick", vi: "Nhìn hình, nghe câu. Đúng thì chạm ✓, sai thì chạm ✗.",
          items: [{ show: "rubber", say: "rubber" }, { show: "notebook", say: "book" }, { show: "bag", say: "bag" }, { show: "pencil", say: "pen" }] },
        /* Show & Say: nhạc chạy → dừng → chạm 1 thẻ úp → nói "It's a…" */
        { kind: "showSay", ask: "a2-show", rounds: 2, pool: ["pen", "pencil", "book", "notebook", "bag", "rubber"] }
      ] }
  ],

  wear: ["wear-beret", "wear-propeller", "wear-partyhat"],
  report: [
    ["Chào hỏi", "\"How are you today?\" → \"I'm happy!\""],
    ["Chữ cái", "Ôn tên + âm a, e, i, o, u · chữ mới P/p: tên chữ, hình chữ, tô P to và p nhỏ (chưa học âm /p/)"],
    ["Đọc từ", "pen, pencil, book, notebook, bag, rubber — đọc chữ, nối chữ với hình"],
    ["Hỏi – đáp", "\"What is it?\" → \"It's a pen.\" · nghe câu, chọn đúng/sai"]
  ],
  parentTip: "Chỉ một món đồ dùng học tập có ghi tên (ví dụ dán nhãn \"pen\" lên cây bút) và hỏi \"What is it?\" — con đọc nhãn rồi trả lời \"It's a pen.\" Tìm giúp con chữ p trong sách truyện, nhớ P to và p nhỏ.",

  lines: {
    "a2-intro-1": { en: "Hello again! It's me, Sparky!", vi: "Chào lại nè! Mình là Sparky đây!" },
    "a2-intro-2": { en: "Look! My bag is glowing!", vi: "Nhìn kìa! Cặp mình đang phát sáng!" },
    "a2-intro-3": { en: "Something new is inside. Let's find out!", vi: "Có gì mới bên trong. Mình cùng xem nha!" },
    "a2-hello-lead": { en: "Hello, everyone!" },
    "a1-how": { en: "How are you today?" },
    "a1-re-happy": { en: "Yay! I'm happy too! Let's have a great day!" },
    "a1-re-sad": { en: "Oh no! Here's a big hug for you. We can play together!" },
    "a1-re-sleepy": { en: "Wake up, wake up! Let's stretch. Up, up, up!" },
    "a2-re-hungry": { en: "Me too! Let's have a yummy snack!" },
    "a2-to-letters": { en: "Let's see our magic letters!", vi: "Mình cùng xem chữ cái thần kỳ nha!" },
    "a2-letters-lead": { en: "Here are our magic letters!", vi: "Chữ cái thần kỳ của mình đây!" },
    "a2-findme": { en: "Find me! Listen and pop!", vi: "Tìm mình nè! Nghe rồi chạm bong bóng!" },
    "a2-new-letter": { en: "Look! A new magic letter! It was in my bag!", vi: "Nhìn nè! Một chữ thần kỳ mới! Nó nằm trong cặp mình!" },
    "a2-big-small": { en: "Big P. Small p.", vi: "P to. p nhỏ." },
    "a2-hands": { en: "Make a P with your hands! One long line, and a round tummy!", vi: "Làm chữ P bằng tay nha! Một nét thẳng dài, và một cái bụng tròn!" },
    "a2-trace": { en: "Let's write P! Watch me first.", vi: "Mình cùng viết chữ P! Xem mình làm trước nha." },
    "a2-trace-big": { en: "Big P! Down, then around.", vi: "P to! Kéo xuống, rồi vòng tròn." },
    "a2-trace-small": { en: "Small p! Down, then around.", vi: "p nhỏ! Kéo xuống, rồi vòng tròn." },
    "a2-your-turn": { en: "Your turn! Trace it with your finger.", vi: "Tới lượt bạn! Dùng ngón tay tô theo nha." },
    "a2-find-p": { en: "Find all the small p! Tap them!", vi: "Tìm hết các chữ p nhỏ! Chạm vào nha!" },
    "a2-not-p": { en: "Oops! That's not p.", vi: "Ối! Đó không phải chữ p." },
    "a2-found-all": { en: "You found them all!", vi: "Bạn tìm được hết rồi!" },
    "a2-touch": { en: "Listen! Touch the letter!", vi: "Nghe nè! Chạm vào chữ đó!" },
    "a2-letters-end": { en: "Hooray! P is my new magic letter!", vi: "Hoan hô! P là chữ thần kỳ mới của mình!" },
    "a2-to-words": { en: "My school things have names. Let's read them!", vi: "Đồ dùng học tập của mình có tên đó. Mình cùng đọc nha!" },
    "a2-words-lead": { en: "Look at the words!", vi: "Nhìn chữ nè!" },
    "a2-read-with-me": { en: "Read with me!", vi: "Đọc cùng mình nha!" },
    "a2-read-match": { en: "Read the word. Tap the picture!", vi: "Đọc chữ. Chạm vào hình!" },
    "a2-read-it": { en: "Read it! Which one?", vi: "Đọc đi nè! Hình nào ta?" },
    "a2-label": { en: "What is it? Tap the right word!", vi: "Cái gì đây? Chạm đúng chữ nha!" },
    "a2-words-end": { en: "Wow! You can read!", vi: "Oa! Bạn đọc được rồi!" },
    "a2-to-talk": { en: "Music time! Let's play and talk!", vi: "Giờ âm nhạc! Mình chơi và nói nha!" },
    "a2-talk-lead": { en: "Let's talk!", vi: "Mình nói nha!" },
    "a1-ask": { en: "Can you answer my question?" },
    "a2-tick": { en: "Look and listen. Yes or no?", vi: "Nhìn và nghe. Đúng hay sai?" },
    "a2-yes": { en: "Yes! It is!", vi: "Đúng rồi!" },
    "a2-no": { en: "No! Look again.", vi: "Sai rồi! Nhìn lại nè." },
    "a2-show": { en: "Music! When it stops, tap a card!", vi: "Nhạc nè! Nhạc dừng thì chạm một thẻ nha!" },
    "a2-talk-end": { en: "Great talking!", vi: "Nói giỏi quá!" },
    "a2-bye-1": { en: "We found P today! Big P, small p!", vi: "Hôm nay mình tìm được chữ P! P to, p nhỏ!" },
    "a2-bye-2": { en: "Thank you! Goodbye!", vi: "Cảm ơn bạn! Tạm biệt!" },
    "a2-reply": { en: "Goodbye!", vi: "Chạm để chào Sparky: \"Goodbye!\"" }
  }
};
