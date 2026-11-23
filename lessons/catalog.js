/* Danh mục cho TRANG CHÍNH (index.html) — kệ 12 unit A–L, không chia Level (user 19/11).
   ready: true = đã có lessons/<id>.js (bài chơi được). Thêm bài mới: đặt ready + pic, thêm lời "home-<id>" rồi chạy
   python tools/gen_voice.py catalog   → media/voice/<id>.mp3
   Bìa unit: media/covers/cover-<k>.png (tools/gen_scenes.py home), Unit A dùng media/bag.png. */
window.CATALOG = {
  units: [
    { k: "A", name: "Hello School!", color: ["#e2794a", "#c25e30"], cover: "media/bag.png", lessons: [
      { id: "A1", title: "Sparky's First Day", ready: true, pic: "media/scenes/a1-map.jpg" },
      { id: "A2", title: "Letter P Day", ready: true, pic: "media/scenes/a2-intro.jpg" }, { id: "A3", title: "P's Secret Sound" }, { id: "A4", title: "Letter N Day" },
      { id: "A5", title: "N's Secret Sound" }, { id: "A6", title: "Hello School Showcase" }] },
    { k: "B", name: "My Toys", color: ["#4fa396", "#357d72"], cover: "media/covers/cover-b.png", lessons: [
      { id: "B1", title: "Sparky's Toy Box" }, { id: "B2", title: "Letter T Day" }, { id: "B3", title: "More Toys with Sparky" },
      { id: "B4", title: "Letter B Day" }, { id: "B5", title: "The /b/ Toy Hunt" }, { id: "B6", title: "Toy Box Showcase" }] },
    { k: "C", name: "Colours & Numbers", color: ["#7a5fd6", "#5a43ad"], cover: "media/covers/cover-c.png", lessons: [
      { id: "C1", title: "Counting Numbers" }, { id: "C2", title: "Letter R Day" }, { id: "C3", title: "The /r/ Rainbow Rescue" },
      { id: "C4", title: "Letter D Day" }, { id: "C5", title: "The /d/ Dot Hunt" }, { id: "C6", title: "Rainbow & Numbers Showcase" }] },
    { k: "D", name: "My Body", color: ["#e9a92a", "#b97f10"], cover: "media/covers/cover-d.png", lessons: [
      { id: "D1", title: "Sparky's Silly Dragon Dance" }, { id: "D2" }, { id: "D3" }, { id: "D4" }, { id: "D5" }, { id: "D6" }] },
    { k: "E", color: ["#d9607e", "#b04461"] }, { k: "F", color: ["#4b8fd1", "#2f6fae"] }, { k: "G", color: ["#6bb04f", "#4d8a35"] },
    { k: "H", color: ["#e0884f", "#b8662f"] }, { k: "I", color: ["#3fa7b5", "#2a8390"] }, { k: "J", color: ["#a06ad1", "#7e4cad"] },
    { k: "K", color: ["#d3a03b", "#a87a1d"] }, { k: "L", color: ["#df6b5a", "#b44d3e"] }
  ],
  /* lời Sparky trên trang chính (chỉ tiếng Anh cho bé) */
  lines: {
    "home-hi":       { en: "Hi! Let's learn!" },
    "home-continue": { en: "Let's keep going!" },
    "home-soon":     { en: "Not yet! Coming soon!" },
    "home-unit-a":   { en: "Unit A. Hello School!" },
    "home-unit-b":   { en: "Unit B. My Toys!" },
    "home-unit-c":   { en: "Unit C. Colours and Numbers!" },
    "home-unit-d":   { en: "Unit D. My Body!" },
    "home-a1":       { en: "Sparky's First Day! Let's go!" },
    "home-a2":       { en: "Letter P Day! Let's go!" }
  }
};
