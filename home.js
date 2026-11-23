/* TRANG CHÍNH — kệ 12 unit A–L (không chia Level) → chạm quyển → 6 bài của unit → chạm bài sẵn sàng → lesson.html?l=<id>.
   Dữ liệu: lessons/catalog.js (window.CATALOG). Tiến độ: localStorage spark-progress {last, lessons:{A1:{stars,plays,at}}} (app.js ghi).
   Tủ đồ dùng chung với bài: localStorage spark-wardrobe + window.WARDROBE (_shared.js). Sparky nói = chỉ miệng động (như bài, S5/S6). */
(() => {
  const C = window.CATALOG, WR = window.WARDROBE || { HEAD: {}, ITEMS: {}, slots: 12 };
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || "{}"); } catch (e) { return {}; } };
  const prog = load("spark-progress"), wardrobe = load("spark-wardrobe");
  const starsOf = (id) => (prog.lessons?.[id]?.stars) || 0;
  const unitStars = (u) => (u.lessons || []).reduce((s, l) => s + starsOf(l.id), 0);
  const starRow = (n) => [0, 1, 2].map(i => i < n ? "<i>★</i>" : "★").join("");
  const allLessons = C.units.flatMap(u => (u.lessons || []).map(l => ({ ...l, u })));
  const ready = allLessons.filter(l => l.ready);

  /* ---------- tiếng + miệng ---------- */
  const voice = new Audio(); let ac = null, an = null, mouthT = 0;
  const BASE_OPEN = new Set(["wave", "talk", "cheer", "oops", "thumbs", "clap"]);
  function initAudio() {
    if (ac) return;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); an = ac.createAnalyser(); an.fftSize = 512; an.connect(ac.destination);
      ac.createMediaElementSource(voice).connect(an); } catch (e) { ac = null; }
  }
  function mouth(spk, on) {
    const img = $(".body", spk), pose = spk.dataset.pose;
    clearInterval(mouthT); img.src = `media/sparky/${pose}.png`;
    if (!on) return;
    const d = an ? new Uint8Array(an.fftSize) : null; let open = false, peak = 0, last = 0;
    mouthT = setInterval(() => {
      let lv = 0; if (d) { an.getByteTimeDomainData(d); let s = 0; for (const v of d) s += (v - 128) ** 2; lv = Math.sqrt(s / d.length); }
      peak = Math.max(lv, peak * .96); const now = performance.now();
      const want = d ? (lv > Math.max(5, .62 * peak) && !(open && now - last > 200)) : !open;
      if (want !== open && now - last > (open ? 0 : 90)) { open = want; last = now;
        img.src = BASE_OPEN.has(pose) === open ? `media/sparky/${pose}.png` : `media/sparky/${pose}-m.png?v=29`; }
    }, 50);
  }
  let curSpk = null;
  function say(id, spk = $("#spk")) {
    initAudio(); ac?.resume?.();
    if (curSpk) mouth(curSpk, false);
    curSpk = spk;
    return new Promise(res => {
      let doneOnce = false; const done = () => { if (doneOnce) return; doneOnce = true; mouth(spk, false); res(); };
      voice.onended = done; voice.onerror = done;
      voice.src = `media/voice/${id}.mp3`; mouth(spk, true);
      voice.play().catch(done);
      setTimeout(done, 4000);
    });
  }

  /* ---------- Sparky + đồ đang mặc ---------- */
  function dress(spk) {
    const it = WR.ITEMS[wardrobe.wearing], a = WR.HEAD[spk.dataset.pose] || WR.HEAD.idle, w = $(".wear", spk);
    if (!it || !a) { w.classList.remove("on"); return; }
    w.src = it.img; w.classList.add("on");
    w.style.left = (a.x + (it.dx || 0)) + "%"; w.style.top = (a.y + (it.dy || 0)) + "%"; w.style.width = (a.w * (it.s || 1)) + "%";
  }
  $("#spk").dataset.pose = "wave"; $("#spk2").dataset.pose = "cheer"; dress($("#spk"));

  /* ---------- tầng 1: Continue + kệ ---------- */
  $("#totStars").textContent = allLessons.reduce((s, l) => s + starsOf(l.id), 0);
  const lastL = allLessons.find(l => l.id === prog.last && l.ready) || ready[0];
  if (lastL) {
    $("#cont").hidden = false; $(".th", $("#cont")).style.backgroundImage = `url(${lastL.pic})`;
    $("#contName").textContent = `${lastL.id} · ${lastL.title}`;
    $("#cont").onclick = () => openLesson(lastL, $("#cont"), "home-continue");
  }
  const isLive = (u) => !!(u.lessons && u.name);   // unit đã có tên + danh sách bài → mở xem được (bài chưa làm vẫn khoá); E–L khoá
  $("#books").innerHTML = C.units.map((u, i) => {
    const live = isLive(u), now = lastL && lastL.u === u;
    return `<button class="book ${live ? "" : "locked"} ${now ? "now" : ""}" style="--u:${u.color[0]};--ud:${u.color[1]}" data-k="${u.k}" aria-label="Unit ${u.k}">
      <span class="L">${u.k}</span><span class="ic">${live && u.cover ? `<img src="${u.cover}" alt="">` : ""}</span>
      <span class="nm">${live ? u.name : "Coming soon"}</span><span class="sc"><i>★</i> ${unitStars(u)}/18</span></button>`
      + (i % 3 === 2 ? '<div class="plank"></div>' : "");
  }).join("");
  $$(".book").forEach(b => b.onclick = () => {
    const u = C.units.find(x => x.k === b.dataset.k);
    if (!isLive(u)) return nope(b);
    location.hash = "unit-" + u.k;
  });

  /* ---------- tầng 2: trang unit ---------- */
  function showUnit(k, speak) {
    const u = C.units.find(x => x.k === k); if (!u || !isLive(u)) return showHome();
    const sh = $("#shelf"); sh.style.setProperty("--u", u.color[0]); sh.style.setProperty("--ud", u.color[1]);
    $("#uTitle").innerHTML = `Unit ${u.k}<small>${u.name}</small>`; $("#uStars").textContent = `${unitStars(u)}/18`;
    $("#grid").innerHTML = u.lessons.map(l => `<button class="les ${l.ready ? "ready" : "locked"}" data-id="${l.id}">
      <span class="pic" ${l.ready ? `style="background-image:url(${l.pic})"` : ""}>${l.ready ? "" : `<img src="${u.cover}" alt="">`}<span class="code">${l.id}</span>${l.ready ? '<span class="play">▶</span>' : ""}</span>
      <span class="nm">${l.title || "Coming soon"}</span><span class="st">${starRow(starsOf(l.id))}</span></button>`).join("");
    $$(".les", $("#grid")).forEach(b => b.onclick = () => {
      const l = u.lessons.find(x => x.id === b.dataset.id);
      l.ready ? openLesson({ ...l, u }, b) : nope(b);
    });
    $("#sHome").classList.add("out"); $("#sUnit").classList.remove("in");
    if (speak) say("home-unit-" + k.toLowerCase());
  }
  function showHome() { $("#sHome").classList.remove("out"); $("#sUnit").classList.add("in"); }
  $("#back").onclick = () => history.length > 1 && location.hash ? history.back() : (location.hash = "");
  const route = (speak) => { const m = location.hash.match(/^#unit-([A-L])$/); m ? showUnit(m[1], speak) : showHome(); };
  window.addEventListener("hashchange", () => route(true));
  route(false);

  /* ---------- chạm ---------- */
  let going = false;
  async function openLesson(l, el, line) {
    if (going) return; going = true;
    el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
    await say(line || "home-" + l.id.toLowerCase());
    location.href = `lesson.html?l=${l.id.toLowerCase()}`;
  }
  function nope(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); say("home-soon"); }

  /* ---------- tủ đồ ---------- */
  function closet() {
    const have = wardrobe.have || [], owned = Object.keys(WR.ITEMS).filter(id => have.includes(id));
    $("#cgrid").innerHTML = [...owned.map(id => `<button class="cell ${wardrobe.wearing === id ? "on" : ""}" data-v="${id}"><img src="${WR.ITEMS[id].img}" alt=""></button>`),
      ...Array.from({ length: Math.max(0, WR.slots - owned.length) }, () => `<div class="cell q">?</div>`)].join("");
    $$(".cell[data-v]").forEach(c => c.onclick = () => {
      wardrobe.wearing = wardrobe.wearing === c.dataset.v ? null : c.dataset.v;
      try { localStorage.setItem("spark-wardrobe", JSON.stringify(wardrobe)); } catch (e) {}
      $$(".cell").forEach(x => x.classList.toggle("on", x.dataset.v === wardrobe.wearing));
      dress($("#spk2")); dress($("#spk"));
    });
    dress($("#spk2")); $("#closet").hidden = false; say("fb-closet", $("#spk2"));
  }
  $("#closetBtn").onclick = closet;
  $("#closetX").onclick = () => { voice.pause(); mouth($("#spk2"), false); $("#closet").hidden = true; };

  // chào khi bé chạm lần đầu (trình duyệt chặn tự phát tiếng trước khi chạm)
  let greeted = false;
  document.addEventListener("pointerdown", (e) => { if (greeted) return; greeted = true; initAudio();
    if (!e.target.closest("button")) say("home-hi"); }, { capture: true });
})();
