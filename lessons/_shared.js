/* Lời Sparky dùng chung mọi bài (phản hồi, nhắc lệnh, tên chữ). tools/gen_voice.py _shared → media/voice/<id>.mp3 */
window.SHARED_LINES = {
  "fb-listen":   { en: "Listen and tap!", vi: "Nghe rồi chạm nha!" },
  "fb-great":    { en: "Great!", vi: "Giỏi quá!" },
  "fb-next":     { en: "Great! Next!", vi: "Giỏi! Tiếp nha!" },
  "fb-yay":      { en: "Yay! Excellent!", vi: "Yay! Xuất sắc!" },
  "fb-wow":      { en: "Wow! Well done!", vi: "Oa! Làm tốt lắm!" },
  "fb-super":    { en: "Super job!", vi: "Siêu ghê!" },
  "fb-tryagain": { en: "Hmm, not quite. Try again!", vi: "Hmm, chưa đúng. Thử lại nha!" },
  "fb-goodtry":  { en: "Good try! Listen.", vi: "Cố gắng tốt! Nghe lại nè." },
  "fb-look":     { en: "Look! It's this one.", vi: "Nhìn nè! Là cái này." },
  "fb-yourturn": { en: "Your turn! Tap and say it.", vi: "Tới lượt bạn! Chạm micro rồi nói nha." },
  "fb-again":    { en: "Again!", vi: "Lần nữa!" },
  "fb-thanks":   { en: "Thank you!", vi: "Cảm ơn nha!" },
  "fb-sticker":  { en: "You can pick a present for me!", vi: "Chọn một món quà cho Sparky nha!" },
  "fb-wear":     { en: "Wow! I love it! Thank you!", vi: "Oa! Mình thích lắm! Cảm ơn nha!" },
  "fb-closet":   { en: "Look at my closet!", vi: "Nhìn tủ đồ của mình nè!" },
  "fb-sayall":   { en: "Let's say them all!", vi: "Mình cùng đọc hết nha!" },
  "fb-missing":  { en: "What's missing?", vi: "Cái gì biến mất?" },
  "fb-letsgo":   { en: "Let's go!", vi: "Đi thôi!" },
  "fb-im-happy":  { en: "I'm happy!", vi: "Mình vui!" },
  "fb-im-sad":    { en: "I'm sad.", vi: "Mình buồn." },
  "fb-im-sleepy": { en: "I'm sleepy.", vi: "Mình buồn ngủ." },
  "fb-im-hungry": { en: "I'm hungry!", vi: "Mình đói bụng!" },
  /* dạy chữ (tên + âm phát bằng bản thu đã duyệt media/letters/, Sparky chỉ nói câu dẫn) */
  "ph-this":     { en: "Look! This is a magic letter.", vi: "Nhìn nè! Đây là một chữ cái thần kỳ." },
  "ph-next":     { en: "Next magic letter!", vi: "Chữ thần kỳ tiếp theo!" },
  "ph-name":     { en: "Its name is…", vi: "Tên của nó là…" },
  "ph-sound":    { en: "Its sound is…", vi: "Âm của nó là…" },
  "ph-saywithme":{ en: "Say it with me!", vi: "Nói theo mình nha!" },
  "ph-again":    { en: "One more time!", vi: "Thêm lần nữa!" },
  "ph-tapeye":   { en: "Tap the eye. What's its name?", vi: "Chạm con mắt. Tên của nó là gì?" },
  "ph-tapear":   { en: "Tap the ear. What's its sound?", vi: "Chạm cái tai. Âm của nó là gì?" },
  "ph-allnames": { en: "Let's say all the names!", vi: "Mình cùng đọc hết TÊN chữ nha!" },
  "ph-allsounds":{ en: "Now, all the sounds!", vi: "Giờ đọc hết ÂM nha!" },
};

/* S4 (18/11) TỦ ĐỒ SPARKY — đồ bé chọn cuối mỗi bài, Sparky mặc ở mọi bài sau.
   HEAD = điểm đặt đồ đội đầu theo từng tư thế (% ảnh media/sparky/<pose>.png, chưa lật gương):
   x = tâm đỉnh đầu, y = vành đồ (đáy món đồ), w = bề ngang món đồ (% bề ngang ảnh). Đo trên lưới 18/11.
   ITEMS: s = cỡ so với w, dx/dy = lệch thêm (%), slots = tổng số ô tủ đồ (ô chưa có hiện "?"). */
window.WARDROBE = {
  slots: 12,
  HEAD: {
    idle:   { x: 40, y: 15, w: 62 }, wave:  { x: 51, y: 19, w: 51 }, talk:   { x: 43, y: 19, w: 58 },
    listen: { x: 42, y: 18, w: 60 }, cheer: { x: 48, y: 17, w: 53 }, oops:   { x: 42, y: 18, w: 60 },
    think:  { x: 43, y: 17, w: 62 }, thumbs:{ x: 44, y: 18, w: 61 }, clap:   { x: 44, y: 17, w: 64 }
  },
  ITEMS: {
    "wear-cap":   { lesson: "A1", name: "school hat",   img: "media/wear/wear-cap.png",   s: 1.05, dx: 0,  dy: 3 },
    "wear-bow":   { lesson: "A1", name: "bow",          img: "media/wear/wear-bow.png",   s: 0.62, dx: -8, dy: 1 },
    "wear-crown": { lesson: "A1", name: "flower crown", img: "media/wear/wear-crown.png", s: 1.0,  dx: 0,  dy: 4 },
    "wear-beret":      { lesson: "A2", name: "beret",          img: "media/wear/wear-beret.png",      s: 1.0, dx: 6, dy: 2 },
    "wear-propeller":  { lesson: "A2", name: "propeller cap",  img: "media/wear/wear-propeller.png",  s: 0.9,  dx: 0, dy: 4 },
    "wear-partyhat":   { lesson: "A2", name: "party hat",      img: "media/wear/wear-partyhat.png",   s: 0.62, dx: 2, dy: 4 }
  }
};
