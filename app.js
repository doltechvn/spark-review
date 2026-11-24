/* Spark Review Web v2 — engine bài ôn kiểu HÀNH TRÌNH (tham khảo kid-listening.dol.vn, 17/11/2026).
   Một bài = clip mở → bản đồ → các chặng (mỗi chặng 1 cảnh, câu dẫn, các task, câu khen) → Sparky nhảy sang chặng sau với câu nối → kết.
   Biết CÁCH chơi; NỘI DUNG nằm trong lessons/<bài>.js (window.LESSON) + lessons/_shared.js (lời chung).
   Lời Sparky: media/voice/<id>.mp3 (tools/gen_voice.py), thiếu file thì đọc máy. Tư thế: media/sparky/<pose>.png (tools/gen_scenes.py _shared).
   ?qa = chạy nhanh không tiếng (soát luồng): window.qaRun(n). ?stage=N = vào thẳng bản đồ ở chặng N. Bản cũ: ../_v1/app.js */
(() => {
  const L = window.LESSON, SH = window.SHARED_LINES || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $("#app"), field = $("#field"), ctrl = $("#ctrl"), cap = $("#cap"), spk = $("#sparky"), hud = $("#hud");
  const spkImg = $(".body", spk), wearEl = $(".wear", spk), WR = window.WARDROBE || { HEAD: {}, ITEMS: {}, slots: 0 };
  const QS = new URLSearchParams(location.search), QA = QS.has("qa");
  const LID = (QS.get("l") || L.id).toLowerCase(), HOME = "index.html";
  /* tiến độ cho trang chính (localStorage spark-progress): bài vừa mở = "Continue"; xong bài → sao (giữ số sao cao nhất) */
  function loadProg() { try { return JSON.parse(localStorage.getItem("spark-progress") || "{}"); } catch (e) { return {}; } }
  function saveProg(p) { if (QA) return; try { localStorage.setItem("spark-progress", JSON.stringify(p)); } catch (e) {} }
  { const p = loadProg(); p.last = L.id; saveProg(p); }
  const wait = (ms) => new Promise(r => setTimeout(r, QA ? Math.min(ms, 40) : ms));
  const settings = loadSettings();
  const log = [];
  const seen = new Set();
  const done = loadDone();
  let stageNo = -1, taskJumped = false;

  /* ================= AUDIO ================= */
  const voice = new Audio();
  let ac = null, bgmGain = null, sfxGain = null, bgmOn = settings.music, bgmTimer = null, vAn = null;
  let voices = [];
  const refreshVoices = () => { voices = "speechSynthesis" in window ? speechSynthesis.getVoices() : []; };
  if ("speechSynthesis" in window) { refreshVoices(); speechSynthesis.onvoiceschanged = refreshVoices; }

  function initAudio() {
    if (ac || QA) return;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      bgmGain = ac.createGain(); bgmGain.gain.value = 0; bgmGain.connect(ac.destination);
      sfxGain = ac.createGain(); sfxGain.gain.value = .35; sfxGain.connect(ac.destination);
      vAn = ac.createAnalyser(); vAn.fftSize = 512; vAn.connect(ac.destination);
      try { ac.createMediaElementSource(voice).connect(vAn); } catch (e) {}
      startBgm(); preload();
    } catch (e) { ac = null; }
  }
  function stopVoice() { voice.pause(); try { speechSynthesis.cancel(); } catch (e) {} try { stopClip(); } catch (e) {} }
  function duck(on) { if (bgmGain) bgmGain.gain.setTargetAtTime(bgmOn ? (on ? .025 : .11) : 0, ac.currentTime, .15); }

  function tts(text, lang = "en-GB", rate) {
    if (QA || !text || !("speechSynthesis" in window)) return wait(30);
    return new Promise(res => {
      const u = new SpeechSynthesisUtterance(text), l = lang.toLowerCase();
      u.voice = l.startsWith("vi") ? voices.find(v => v.lang.toLowerCase().startsWith("vi"))
        : voices.find(v => v.name === "Google UK English Male") || voices.find(v => /en.gb/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
      u.lang = lang; u.rate = rate || (l.startsWith("vi") ? 1.05 : .95);
      let fin = false; const end = () => { if (!fin) { fin = true; res(); } };
      u.onend = u.onerror = end; setTimeout(end, 9000); speechSynthesis.speak(u);
    });
  }
  function play(src, { rate = 1, fallback = null } = {}) {
    if (QA) return wait(30);
    return new Promise(res => {
      stopVoice();
      voice.src = src; voice.playbackRate = rate; voice.preservesPitch = true;
      let fin = false; const end = () => { if (!fin) { fin = true; duck(false); res(); } };
      voice.onended = end;
      voice.onerror = () => { if (fallback) tts(fallback, "en-GB", rate < 1 ? .7 : undefined).then(end); else end(); };
      duck(true);
      voice.play().catch(() => voice.onerror());
    });
  }
  const lineOf = (id) => (L.lines && L.lines[id]) || SH[id] || { en: id };
  /* clip ngắn (tên/âm chữ, từ) phát qua WebAudio đã giải mã sẵn → không mất đầu âm như thẻ <audio> */
  const bufCache = {};
  async function clip(src, rate = 1) {
    if (QA) return wait(30);
    if (!ac) return play(src, { rate });
    try {
      bufCache[src] ||= fetch(src).then(r => r.arrayBuffer()).then(b => ac.decodeAudioData(b));
      const buf = await bufCache[src];
      if (ac.state === "suspended") await ac.resume();
      stopVoice(); duck(true);
      return await new Promise(res => {
        const n = ac.createBufferSource(); n.buffer = buf; n.playbackRate.value = rate; n.connect(vAn || ac.destination);
        n.onended = () => { duck(false); res(); }; n.start(); stopClip = () => { try { n.stop(); } catch (e) {} };
      });
    } catch (e) { return play(src, { rate }); }
  }
  let stopClip = () => {};
  const word = (w, rate) => clip(L.words[w].audio, rate);
  const sentence = (w, rate) => play(L.words[w].sentence, { rate });
  function preload() { if (!ac) return; Object.values(L.letters).forEach(x => [x.name, x.sound].filter(Boolean).forEach(u => { bufCache[u] ||= fetch(u).then(r => r.arrayBuffer()).then(b => ac.decodeAudioData(b)); })); }
  /* tên + âm chữ: LUÔN là bản thu đã duyệt trong lesson (media/letters/), không đọc máy */
  const letterName = (l, rate) => clip(L.letters[l].name, rate);
  const letterSound = (l, rate) => clip(L.letters[l].sound, rate);

  /* Sparky nói một câu (có phụ đề nếu bật Aa) */
  async function say(id, { pose = "talk", after = null, rate = 1 } = {}) {
    const ln = lineOf(id);
    caption(ln);
    if (pose && !spk.classList.contains("hide")) setPose(pose);
    mouthOn();   // S5 (18/11): nói = CHỈ MIỆNG động (đổi hình miệng mở/khép theo độ to giọng), người đứng yên
    await play(`media/voice/${id}.mp3`, { rate, fallback: ln.en });
    mouthOff();
    if (after && !spk.classList.contains("hide")) setPose(after);
  }
  async function viHint() {}   /* 17/11 user: "khỏi vietsub, dẹp hết tiếng việt" — bé chỉ nghe/thấy tiếng Anh */

  /* ---- âm hiệu ứng tổng hợp + nhạc nền (ukulele gảy nhẹ, tự hạ khi Sparky nói) ---- */
  function tone(f, t0, dur, type = "sine", vol = .5, dest = sfxGain) {
    if (!ac) return; const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .01);
    g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + .05);
  }
  const sfx = {
    ding() { if (!ac) return; const t = ac.currentTime; tone(988, t, .35, "sine", .5); tone(1480, t + .09, .45, "sine", .4); },
    boop() { if (!ac) return; const t = ac.currentTime; tone(330, t, .18, "triangle", .35); tone(247, t + .1, .25, "triangle", .3); },
    pop()  { if (!ac) return; const t = ac.currentTime; const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(1500, t + .08); g.gain.setValueAtTime(.4, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + .15); },
    tap()  { if (!ac) return; tone(660, ac.currentTime, .08, "triangle", .25); },
    whoosh() { if (!ac) return; const t = ac.currentTime; const o = ac.createOscillator(), g = ac.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(200, t + .35); const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1200; g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .4); o.connect(f); f.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + .45); },
    tick(hi) { if (!ac) return; const t = ac.currentTime; tone(hi ? 1500 : 1100, t, .06, "square", .18); tone(hi ? 750 : 550, t, .09, "triangle", .25); },
    tada() { if (!ac) return; const t = ac.currentTime; [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * .09, .5, "triangle", .3)); }
  };
  function startBgm() {
    if (!ac || bgmTimer) return;
    const chords = [[262, 330, 392], [196, 247, 294], [220, 262, 330], [175, 220, 262]]; // C G Am F
    const beat = 60 / 92 / 2; let next = ac.currentTime + .3, step = 0;
    bgmTimer = setInterval(() => {
      while (next < ac.currentTime + .6) {
        const ch = chords[Math.floor(step / 8) % 4], n = ch[[0, 1, 2, 1, 0, 2, 1, 2][step % 8]];
        tone(n * (step % 8 === 0 ? 1 : 2), next, .55, "triangle", step % 8 === 0 ? .5 : .32, bgmGain);
        if (step % 8 === 0) tone(ch[0] / 2, next, 1.2, "sine", .35, bgmGain);
        next += beat; step++;
      }
    }, 150);
    duck(false);
  }

  /* ================= UI ================= */
  const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const img = (w) => L.words[w].img;
  const lock = (on) => app.classList.toggle("locked", on);
  /* toạ độ % trên TRANH (9:16, background-size:cover) → toạ độ % trên khung — cho điểm gắn với vật trong tranh (cặp, nút bản đồ) */
  function img2f([x, y]) {
    const fa = app.clientWidth / app.clientHeight, ia = 9 / 16;
    return fa < ia ? [50 + (x - 50) * ia / fa, y] : [x, 50 + (y - 50) * fa / ia];
  }
  function at(el, x, y) { el.classList.add("at"); el.style.left = x + "%"; el.style.top = y + "%"; field.appendChild(el); return el; }
  let bgFlip = false;
  function setBg(src) {
    const a = $(bgFlip ? "#bgA" : "#bgB"), b = $(bgFlip ? "#bgB" : "#bgA"); bgFlip = !bgFlip;
    a.style.backgroundImage = `url(${src})`; a.classList.add("on"); b.classList.remove("on");
    document.documentElement.style.setProperty("--bdimg", `url(${src})`);
  }
  function caption(ln) {
    if (!settings.aa || !ln) { cap.classList.remove("on"); return; }
    cap.innerHTML = ln.en;
    cap.classList.remove("on"); void cap.offsetWidth; cap.classList.add("on");
  }
  const POSE_ALT = { cheer: "clap", clap: "thumbs", thumbs: "cheer", think: "oops", oops: "think", talk: "wave", wave: "talk", idle: "listen", listen: "idle" };
  let pose = "";
  function setPose(p) {
    if (p === pose) p = POSE_ALT[p] || p;   // không lặp cùng một mặt 2 lần liền
    pose = p;
    spkImg.onerror = () => { spkImg.onerror = null; spkImg.src = "media/sparky_wave.png"; };
    spkImg.src = `media/sparky/${p}.png`; mouthOpen = null;
    placeWear();
  }
  /* S5 miệng: media/sparky/<pose>-m.png = y hệt tư thế, chỉ khác miệng (tools/gen_mouth.py). Tư thế gốc miệng MỞ → bản -m là KHÉP và ngược lại. */
  const BASE_OPEN = new Set(["wave", "talk", "cheer", "oops", "thumbs", "clap"]);
  Object.keys(window.WARDROBE?.HEAD || {}).forEach(p => { new Image().src = `media/sparky/${p}-m.png?v=29`; });
  let mouthOpen = null, mouthRaf = 0, mouthT = 0;
  function setMouth(open) {
    if (open === mouthOpen || !pose) return; mouthOpen = open;
    const base = BASE_OPEN.has(pose) === open;
    spkImg.src = `media/sparky/${pose}${base ? ".png" : "-m.png?v=29"}`;
  }
  function mouthOn() {
    clearInterval(mouthRaf); if (QA || spk.classList.contains("hide")) return;
    // mở/khép theo TỪNG ÂM TIẾT: mở khi giọng vọt lên so với đỉnh gần đây; mở tối đa ~0,2 s rồi khép ≥ 0,09 s (không há liền cả câu)
    const data = vAn ? new Uint8Array(vAn.fftSize) : null; let last = 0, peak = 0, t0 = performance.now();
    const tick = () => {
      const now = performance.now(); let open;
      if (data) {
        vAn.getByteTimeDomainData(data); let sum = 0; for (const v of data) sum += (v - 128) * (v - 128);
        const lv = Math.sqrt(sum / data.length); peak = Math.max(lv, peak * .96);
        open = lv > Math.max(5, peak * .62);
        if (open && mouthOpen && now - last > 200) open = false;
        if (open && mouthOpen === false && now - last < 90) open = false;
      } else open = Math.floor((now - t0) / 140) % 2 === 0;
      if (open !== mouthOpen && now - last > 70) { setMouth(open); last = now; }
    };
    mouthRaf = setInterval(tick, 50);   // bộ đếm giờ (rAF có thể bị trình duyệt hoãn)
  }
  window.__audioState = () => { const d = vAn ? new Uint8Array(vAn.fftSize) : null; if (d) vAn.getByteTimeDomainData(d); let m = 0; if (d) for (const v of d) m = Math.max(m, Math.abs(v - 128)); return { ac: ac && ac.state, an: !!vAn, peak: m, voicePaused: voice.paused, t: voice.currentTime, src: voice.src.split("/").pop() }; };
  function mouthOff() { clearInterval(mouthRaf); if (pose) { spkImg.src = `media/sparky/${pose}.png`; mouthOpen = null; } }
  function sparky(show, where) {
    spk.classList.toggle("hide", !show); spk.classList.toggle("onmap", where === "map"); spk.classList.toggle("hero", where === "hero");
    if (where !== "map") { spk.style.left = ""; spk.style.bottom = ""; }
  }

  /* ===== S4 tủ đồ Sparky: món đang mặc đặt lên đỉnh đầu theo điểm neo từng tư thế (WARDROBE.HEAD) ===== */
  const wardrobe = loadWardrobe();
  function placeWear(id = wardrobe.wearing) {
    const it = WR.ITEMS[id], a = WR.HEAD[pose] || WR.HEAD.idle;
    if (!it || !a) { wearEl.classList.remove("on"); return; }
    wearEl.src = it.img; wearEl.classList.add("on");
    wearEl.style.left = (a.x + (it.dx || 0)) + "%"; wearEl.style.top = (a.y + (it.dy || 0)) + "%"; wearEl.style.width = (a.w * (it.s || 1)) + "%";
  }
  function setBar(f) { $("#barFill").style.width = Math.round(Math.max(0, Math.min(1, f)) * 100) + "%"; }
  function clear() { field.innerHTML = ""; ctrl.innerHTML = ""; $$(".listen,.cloth,.hand,.chip,.title-card").forEach(e => e.remove()); field.dataset.answer = ""; }

  function go(label = "➜", cls = "") {
    return new Promise(res => {
      const b = h(`<button class="go ${cls}" aria-label="Tiếp">${label}</button>`); ctrl.appendChild(b);
      b.onclick = () => { sfx.tap(); b.remove(); res(); };
    });
  }
  const SPK_SVG = `<svg viewBox="0 0 48 48"><path d="M8 18h8l11-9v30l-11-9H8z" fill="#4f7fd6"/><path d="M33 16c3 2.4 4.5 5 4.5 8s-1.5 5.6-4.5 8M37.5 11c4.6 3.6 7 8 7 13s-2.4 9.4-7 13" stroke="#4f7fd6" stroke-width="3.6" fill="none" stroke-linecap="round"/></svg>`;
  function listen(fn, y) {
    $$(".listen").forEach(e => e.remove());
    const box = h(`<div class="listen"><button class="spk always" aria-label="Nghe lại">${SPK_SVG}</button><button class="turtle always" aria-label="Nghe chậm">🐢</button></div>`);
    if (y) box.style.top = y + "%";
    app.appendChild(box);
    const run = async (rate, btn) => { if (app.classList.contains("busy")) return; app.classList.add("busy"); btn.classList.add("playing"); setPose("listen"); await fn(rate); btn.classList.remove("playing"); app.classList.remove("busy"); };
    $(".spk", box).onclick = () => run(1, $(".spk", box));
    $(".turtle", box).onclick = () => run(.75, $(".spk", box));
    return { play: (rate = 1) => run(rate, $(".spk", box)), remove: () => box.remove() };
  }
  function burst(el, n = 12) {
    const r = el.getBoundingClientRect(), a = app.getBoundingClientRect(), cx = r.left - a.left + r.width / 2, cy = r.top - a.top + r.height / 2;
    const cols = ["#3fb86b", "#8fd9a8", "#f6c453"];   // G1: xanh lá (+ vàng nhẹ) — không rối màu
    for (let i = 0; i < n; i++) {
      const d = h(`<i class="burst"></i>`); d.style.left = cx + "px"; d.style.top = cy + "px"; d.style.background = cols[i % cols.length]; app.appendChild(d);
      const ang = (Math.PI * 2 * i) / n, dist = 40 + Math.random() * 50;
      d.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) scale(.3)`, opacity: 0 }], { duration: 650, easing: "ease-out" }).onfinish = () => d.remove();
    }
  }
  function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
  function hand(target, from = null) {
    const hd = h(`<div class="hand">👆</div>`); app.appendChild(hd);
    const a = app.getBoundingClientRect(), pt = el => { const r = el.getBoundingClientRect(); return [r.left - a.left + r.width / 2 - 18, r.top - a.top + r.height * .55]; };
    const [x, y] = pt(target);
    hd.style.left = x + "px"; hd.style.top = y + "px";
    target.classList.add("hint");
    /* B-7 (24/11): bài kéo chữ — bàn tay vẽ đường kéo từ chữ (from) sang ô đúng, lặp lại */
    if (from) { const [fx, fy] = pt(from); hd.classList.add("drag");
      hd.animate([{ left: fx + "px", top: fy + "px", opacity: 0 }, { left: fx + "px", top: fy + "px", opacity: 1, offset: .15 },
                  { left: x + "px", top: y + "px", opacity: 1, offset: .7 }, { left: x + "px", top: y + "px", opacity: 0 }], { duration: 1700, iterations: Infinity, easing: "ease-in-out" }); }
    return () => { hd.remove(); target.classList.remove("hint"); };
  }
  const PRAISE = ["fb-great", "fb-yay", "fb-super", "fb-wow"], RIGHT_POSE = ["thumbs", "cheer", "clap"];
  let praiseN = 0;
  async function praise() { const p = RIGHT_POSE[praiseN % 3]; const id = PRAISE[praiseN % PRAISE.length]; praiseN++; sfx.ding(); await say(id, { pose: p }); }

  /* ======== bé chờ lâu không chọn (user 17/11): 7 s → đọc lại + nhấp nháy các ô; 14 s → bàn tay chỉ ô đúng; sau đó cứ 10 s đọc lại ======== */
  function nudge({ replay, target = null, blink = [], from = null }) {
    if (QA) return () => {};
    let t1, t2, t3, unhand = null, alive = true;
    const flash = () => blink.forEach(b => { b.classList.remove("blink"); void b.offsetWidth; b.classList.add("blink"); });
    const busyNow = () => app.classList.contains("locked") || app.classList.contains("busy");
    const again = async () => { if (!alive || busyNow()) return; app.classList.add("busy"); flash(); if (replay) await replay(); app.classList.remove("busy"); if (alive) setPose("listen"); };
    t1 = setTimeout(again, 7000);
    t2 = setTimeout(() => { if (!alive) return; if (target) unhand = hand(target, from); else flash(); again(); }, 14000);
    t3 = setTimeout(function rep() { again(); t3 = setTimeout(rep, 10000); }, 24000);
    return () => { alive = false; clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); if (unhand) unhand(); blink.forEach(b => b.classList.remove("blink")); };
  }

  /* ======== một câu hỏi chọn đáp án: gợi ý 3 bậc (nghe lại → mờ 1 đáp án sai → bàn tay chỉ) ======== */
  async function choose({ answer, buttons, prompt, skill, label, first, onRight, gate = null, dragFrom = null }) {
    const rec = { skill, item: label || answer, tries: 0 };
    if (QA) field.dataset.answer = answer;
    buttons.forEach(b => b.classList.add("opt"));   // W10: từng thẻ đáp án viền tím; G1: đúng = xanh lá, sai = đỏ
    let unhand = null;
    if (first) unhand = hand(buttons.find(b => b.dataset.v === answer), dragFrom);
    lock(false);
    let stopNudge = nudge({ replay: prompt, target: buttons.find(b => b.dataset.v === answer), blink: buttons, from: dragFrom });
    await new Promise(resolve => {
      buttons.forEach(b => b.onclick = async (ev) => {
        if (app.classList.contains("locked") || b.classList.contains("faded")) return;
        if (gate && !(await gate(b, ev))) return;
        stopNudge();
        rec.tries++;
        if (b.dataset.v === answer) {
          if (unhand) unhand();
          buttons.forEach(x => x.onclick = null); lock(true);
          b.classList.add("right"); burst(b);
          await (onRight ? onRight(b) : null);
          lock(false); resolve();
        } else {
          sfx.boop(); shake(b); b.classList.add("wrong"); lock(true);
          const wrongs = buttons.filter(x => x.dataset.v !== answer && !x.classList.contains("faded"));
          if (rec.tries === 1) { await say("fb-tryagain", { pose: "oops" }); await prompt(); }
          else if (rec.tries === 2) { if (wrongs[0]) wrongs[0].classList.add("faded"); await say("fb-goodtry", { pose: "think" }); await prompt(); }
          else { await say("fb-look", { pose: "talk" }); unhand = hand(buttons.find(x => x.dataset.v === answer), dragFrom); }
          b.classList.remove("wrong"); setPose("listen"); lock(false);
          stopNudge = nudge({ replay: prompt, target: buttons.find(x => x.dataset.v === answer), blink: buttons.filter(x => !x.classList.contains("faded")), from: dragFrom });
        }
      });
    });
    stopNudge();
    log.push(rec);
    return rec.tries;
  }
  /* chạy một danh sách câu, câu sai được hỏi lại 1 lần ở cuối */
  async function runQueue(items, fn, { requeue = true, total } = {}) {
    const q = items.map(x => ({ ...x })); let n = 0, first = true; const N = total || items.length;
    while (q.length) {
      const it = q.shift();
      const tries = await fn(it, first); first = false; n++;
      progress(Math.min(n, N) / N);
      if (requeue && tries > 1 && !it._again) q.push({ ...it, _again: true });
      await wait(300);
    }
  }
  let taskFrac = [0, 1];
  const progress = (f) => setBar((taskFrac[0] + f) / taskFrac[1]);

  /* ================= TASKS ================= */
  const T = {};

  /* F1 (18/11): 4 hình đầu Sparky đúng bộ Circle time trên lớp + chữ dưới; 2×2 cách đều (W9) */
  T.feel = async (task) => {
    const pos = [[28, 36], [72, 36], [28, 60], [72, 60]];
    const btns = task.options.map((o, i) => at(h(`<button class="card pic lab feel" data-v="${o.id}"><img src="${o.img}" alt=""><b>${o.id}</b></button>`), ...pos[i]));
    lock(true); await say(task.ask); await viHint(task); setPose("listen"); lock(false);
    if (QA) field.dataset.answer = "happy";
    const stopN = nudge({ replay: () => say(task.ask), blink: btns });
    const id = await new Promise(res => btns.forEach(b => b.onclick = () => res(b.dataset.v))); stopN();
    const b = btns.find(x => x.dataset.v === id); b.classList.add("right"); burst(b); sfx.ding(); lock(true);
    const o = task.options.find(x => x.id === id);
    // V1 (23/11): KHÔNG đọc câu của bé ("I'm sad.") — giọng Sparky đọc nghe như Sparky tự nói; chỉ ding + sáng rồi Sparky đáp
    await wait(500);
    await say(o.reply, { pose: o.pose || "talk" });  // Sparky đáp riêng theo cảm xúc
    progress(1); lock(false);
  };

  T.letterIntro = async (task) => {
    const pos = task.letters.map((_, i) => [50 + (i - (task.letters.length - 1) / 2) * 19.5, 64]);
    const cards = task.letters.map((l, i) => at(h(`<div class="lcard sm" data-l="${l}"><div class="big"><span>${l.toUpperCase()}</span><span>${l}</span></div>
      <div class="lb"><button class="eye" aria-label="Tên chữ">👁️</button><button class="ear" aria-label="Âm">👂</button></div></div>`), ...pos[i]));
    lock(true); await say(task.ask); await viHint(task); setPose("listen"); lock(false);
    const heard = new Set();
    await new Promise(res => {
      const tm = setTimeout(res, QA ? 3000 : 60000);
      cards.forEach(c => {
        const l = c.dataset.l;
        const mark = (k) => { heard.add(l + k); c.classList.toggle("done", heard.has(l + "n") && heard.has(l + "s")); progress(heard.size / (task.letters.length * 2)); if (heard.size >= task.letters.length * 2) { clearTimeout(tm); res(); } };
        $(".eye", c).onclick = async () => { if (app.classList.contains("busy")) return; app.classList.add("busy"); c.classList.add("glow"); await letterName(l); c.classList.remove("glow"); app.classList.remove("busy"); mark("n"); };
        $(".ear", c).onclick = async () => { if (app.classList.contains("busy")) return; app.classList.add("busy"); c.classList.add("glow"); await letterSound(l); c.classList.remove("glow"); app.classList.remove("busy"); mark("s"); };
      });
    });
    lock(true); await praise(); lock(false);
  };

  /* Dạy lại từng chữ như trên lớp: 👁️ "Its name is… A" → nói theo → 👂 "Its sound is… /æ/" → nói theo
     → bé tự chạm 👁️ rồi 👂 để kiểm tra → chữ bay vào ổ khoá. Xong hết: đọc thuộc tất cả TÊN rồi tất cả ÂM. */
  async function echo(card) {           // khoảng lặng cho bé nói theo (biểu tượng miệng nhấp nháy)
    const m = h(`<div class="echo">🗣️</div>`); card.appendChild(m); await wait(1900); m.remove();
  }
  T.teachLetters = async (task) => {
    lock(true); await say(task.ask, { pose: "wave" }); await viHint(task);
    const LOCK_AT = task.lockAt || [50, 30];
    let k = 0;
    for (const l of task.letters) {
      field.innerHTML = "";
      await say(k === 0 ? "ph-this" : "ph-next", { pose: "talk" });
      const card = at(h(`<div class="tcard reveal"><div class="big"><span>${l.toUpperCase()}</span><span>${l}</span></div>
        <div class="lb"><button class="eye" aria-label="Tên chữ">👁️</button><button class="ear" aria-label="Âm">👂</button></div></div>`), 50, 52);
      sfx.pop(); burst(card, 8);
      const eye = $(".eye", card), ear = $(".ear", card);
      // TÊN
      eye.classList.add("glow"); await say("ph-name", { pose: "talk" }); setPose("wave");
      caption({ en: l.toUpperCase() }); await letterName(l); await wait(300);
      await say("ph-saywithme", { pose: "talk" }); caption({ en: l.toUpperCase() }); await letterName(l); setPose("listen"); await echo(card);
      eye.classList.remove("glow");
      // ÂM
      ear.classList.add("glow"); await say("ph-sound", { pose: "talk" }); setPose("wave");
      caption({ en: "/" + l + "/" }); await letterSound(l); await wait(350); await letterSound(l); await wait(300);
      await say("ph-saywithme", { pose: "talk" }); await letterSound(l); setPose("listen"); await echo(card);
      ear.classList.remove("glow");
      // bé tự chạm kiểm tra
      for (const [btn, ask, playIt] of [[eye, "ph-tapeye", () => letterName(l)], [ear, "ph-tapear", () => letterSound(l)]]) {
        await say(ask, { pose: "talk" }); setPose("listen");
        const unhand = k === 0 ? hand(btn) : null;
        if (QA) field.dataset.answer = btn.className;
        lock(false);
        const stopN = nudge({ replay: () => say(ask, { pose: "talk" }), target: btn, blink: [btn] });
        await new Promise(res => btn.onclick = res);
        stopN(); btn.onclick = null; if (unhand) unhand(); lock(true);
        btn.classList.add("glow"); await playIt(); btn.classList.remove("glow"); sfx.ding();
      }
      await praise();
      // chữ bay vào ổ khoá
      const [lx, ly] = img2f(LOCK_AT); sfx.whoosh();
      card.classList.add("fly"); card.style.left = lx + "%"; card.style.top = ly + "%"; card.style.scale = ".2"; card.style.opacity = "0";
      await wait(650);
      k++; progress(k / (task.letters.length + 1));
    }
    // đọc thuộc: hết TÊN rồi hết ÂM (chỉ khi dạy ≥ 2 chữ)
    field.innerHTML = "";
    if (task.letters.length < 2) { progress(1); lock(false); return; }
    const n = task.letters.length;
    const row = task.letters.map((l, i) => at(h(`<div class="lcard sm chant reveal"><div class="big"><span>${l.toUpperCase()}</span><span>${l}</span></div></div>`), 50 + (i - (n - 1) / 2) * 18.5, 54));
    await say("ph-allnames", { pose: "cheer" });
    for (let i = 0; i < n; i++) { row[i].classList.add("glow"); await letterName(task.letters[i]); row[i].classList.remove("glow"); await wait(250); }
    await say("ph-allsounds", { pose: "cheer" });
    for (let i = 0; i < n; i++) { row[i].classList.add("glow"); await letterSound(task.letters[i]); row[i].classList.remove("glow"); await wait(350); }
    progress(1); await praise(); lock(false);
  };

  T.pop = async (task) => {
    lock(true); await say(task.ask); await viHint(task);
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const xs = { 2: [32, 68], 3: [22, 50, 78], 4: [16, 39, 61, 84] }[it.options.length] || [22, 50, 78];
      const btns = it.options.map((l, i) => at(h(`<button class="bubbleL" style="--d:${i * .45}s" data-v="${l}">${l}</button>`), xs[i], 57));
      const snd = it.by === "sound", hear = (rate) => snd ? letterSound(it.name, rate) : letterName(it.name, rate);
      const prompt = (rate) => hear(rate);
      const L1 = listen(prompt); lock(true); await L1.play(); lock(true);
      const tries = await choose({ answer: it.name, buttons: btns, prompt, skill: task.skill, label: snd ? "/" + it.name + "/" : it.name.toUpperCase(), first,
        onRight: async (b) => { sfx.pop(); b.classList.add("popped"); await hear(); await wait(250); await praise(); } });
      L1.remove(); return tries;
    });
  };

  T.password = async (task) => {
    const n = task.sequence.length, xs = task.sequence.map((_, i) => 50 + (i - (n - 1) / 2) * 17);
    const slots = task.sequence.map((_, i) => at(h(`<div class="slot" data-i="${i}">🔒</div>`), xs[i], 54));
    const keys = ["a", "e", "i", "o", "u"].map((l, i) => at(h(`<button class="card key" data-v="${l}">${l}</button>`), 50 + (i - 2) * 18, 68));
    lock(true); await say(task.ask); await viHint(task);
    let si = 0;
    await runQueue(task.sequence.map(l => ({ l })), async (it, first) => {
      slots.forEach((s, i) => s.classList.toggle("now", i === si));
      keys.forEach(k => k.classList.remove("right", "faded"));
      const prompt = (rate) => letterSound(it.l, rate);
      const L1 = listen(prompt); lock(true); await L1.play();
      const tries = await choose({ answer: it.l, buttons: keys, prompt, skill: task.skill, label: "/" + it.l + "/", first,
        onRight: async () => { sfx.ding(); const s = slots[si]; s.textContent = it.l.toUpperCase(); s.classList.remove("now"); s.classList.add("open"); burst(s, 8); si++; await letterSound(it.l); } });
      L1.remove(); return tries;
    }, { requeue: false });
    lock(true);
    for (const s of slots) { s.classList.add("glow"); await letterName(s.textContent.toLowerCase()); s.classList.remove("glow"); await wait(120); }
    await say(task.chant, { pose: "cheer" }); sfx.tada(); slots.forEach(s => burst(s, 6));
    await wait(500); lock(false);
  };

  /* thẻ đồ vật CÓ CHỮ dưới hình (user 17/11 W1: "hiện luôn cả chữ ở dưới hình") */
  const wcard = (w, cls = "sm", tag = "button") => h(`<${tag} class="card pic lab ${cls}" data-v="${w}" data-w="${w}"><img src="${img(w)}" alt=""><b>${w}</b></${tag}>`);

  /* W1/W4 + W6 (17/11): món đang dạy hiện TO (chữ dưới hình) → đọc 2 lần → thành ĐỒ VẬT NHỎ trên bàn → nghỉ ~3 s → món sau.
     Xong 5 món: 5 thẻ VUÔNG CHỮ TO bung ra ôn lại (sáng + đọc + chờ bé nói theo) rồi rơi về bàn.
     W8 (18/11): đồ nằm trên bàn như thật — điểm chạm mặt bàn theo TOẠ ĐỘ TRANH (img2f), hàng sau nhỏ hơn hàng trước,
     mỗi món nghiêng khác nhau, bóng đổ mềm, tông ấm theo nắng; rơi xuống → nảy nhẹ → nằm yên. */
  // x = % KHUNG (bàn trải hết bề ngang), y = % TRANH điểm chạm mặt bàn (mặt bàn ≈ 43–54 %, cặp chiếm phải) — hàng sau 3 món, hàng trước 2 món so le, bên trái cặp, không món nào chạm nhau
  const DESKOBJ = [[12, 47], [21, 53.8], [30, 47], [39, 53.8], [48, 47]];
  const DESKLOOK = [{ w: 12, r: -8 }, { w: 12.5, r: 6 }, { w: 12, r: -4 }, { w: 12.5, r: 7 }, { w: 12, r: -5 }];
  /* đáy THẬT của hình (bỏ phần trong suốt) → đồ chạm đúng mặt bàn, bóng nằm sát đáy */
  const vbCache = {};
  function visBottom(im) {
    return vbCache[im.src] ||= new Promise(res => {
      const go = () => { try {
        const n = 64, cv = document.createElement("canvas"); cv.width = cv.height = n; const g = cv.getContext("2d");
        const r = Math.min(n / im.naturalWidth, n / im.naturalHeight), w = im.naturalWidth * r, hh = im.naturalHeight * r;
        g.drawImage(im, (n - w) / 2, (n - hh) / 2, w, hh); const d = g.getImageData(0, 0, n, n).data;
        for (let y = n - 1; y >= 0; y--) for (let x = 0; x < n; x++) if (d[(y * n + x) * 4 + 3] > 40) return res((y + 1) / n);
        res(1); } catch (e) { res(1); } };
      im.complete && im.naturalWidth ? go() : (im.onload = go);
    });
  }
  async function toDesk(c, i, drop = true) {
    const x = DESKOBJ[i][0], y = img2f(DESKOBJ[i])[1], o = DESKLOOK[i];
    const vb = await visBottom($("img", c)); c.style.setProperty("--vb", ((1 - vb) * 100).toFixed(1) + "%");
    c.classList.remove("xl", "sq", "glow"); c.classList.add("obj", "moving");
    c.style.setProperty("--ow", `min(${o.w}cqw, ${(o.w * .46).toFixed(1)}cqh)`);   // khổ rộng: không to quá mặt bàn c.style.setProperty("--or", o.r + "deg");
    c.style.left = x + "%"; c.style.top = (y - (drop ? 8 : 0)) + "%";
    if (!drop) { c.classList.remove("moving"); return; }
    await wait(620);
    c.classList.add("fall"); c.style.top = y + "%"; await wait(330); c.classList.remove("fall");
    c.classList.remove("land"); void c.offsetWidth; c.classList.add("land"); c.classList.remove("moving"); sfx.tap();
  }
  T.story = async (task) => {
    let k = 0;
    const objs = [];
    for (const beat of task.beats) {
      lock(true);
      await say(beat.line);
      caption(null);   // chữ đã nằm dưới hình — không để phụ đề đè lên thẻ
      const c = at(wcard(beat.word, "xl"), 50, 24);
      c.classList.add("reveal"); sfx.pop(); burst(c, 10);
      setPose("cheer");
      await word(beat.word); await wait(700); await word(beat.word);
      k++; progress(k / (task.beats.length + 1));
      await wait(800);
      setPose("listen");
      await toDesk(c, k - 1);
      c.onclick = () => word(beat.word); objs.push(c);
      await wait(k < task.beats.length ? 2000 : 700);
    }
    // ôn lại cả 5 từ — thẻ vuông chữ to, cách đều (W9)
    const pos = [[21, 33], [50, 33], [79, 33], [35.5, 55], [64.5, 55]];
    objs.forEach((c, i) => { c.classList.replace("obj", "sq"); c.style.left = pos[i][0] + "%"; c.style.top = pos[i][1] + "%"; });
    await wait(650);
    await say("fb-sayall", { pose: "cheer" });
    for (const c of objs) {
      c.classList.add("glow"); setPose("talk"); await word(c.dataset.v); setPose("listen");
      const m = h(`<div class="echo">🗣️</div>`); c.appendChild(m); await wait(1700); m.remove();
      c.classList.remove("glow"); await wait(200);
    }
    await praise();
    await Promise.all(objs.map((c, i) => wait(i * 120).then(() => toDesk(c, i))));
    progress(1); await wait(500);
    lock(false);
    await go("➜");
  };

  /* W11 (18/11): thẻ nằm trong lưới (không đặt tuyệt đối) — khe ngang = khe dọc; mỗi lần một món vào cặp, các thẻ còn lại
     tự dàn lại cho cân: 5 → 3 + 2, 4 → 2 + 2, 3 → 3, 2 → 2, 1 → 1 */
  const COLS = { 5: 3, 4: 2, 3: 3, 2: 2, 1: 1 };
  T.pack = async (task) => {
    const st = L.stages[stageNo];
    const grid = at(h(`<div class="packgrid"></div>`), 50, 58);
    const cards = {};
    Object.keys(L.words).filter(w => w !== "bag").forEach(w => { cards[w] = wcard(w); grid.appendChild(cards[w]); });
    const reflow = () => grid.style.setProperty("--cols", COLS[grid.children.length] || 3);
    reflow();
    lock(true); await say(task.ask); await viHint(task);
    await runQueue(task.order.map(w => ({ w })), async (it, first) => {
      const live = [...grid.children];
      live.forEach(c => c.classList.remove("faded", "right"));
      const prompt = (rate) => word(it.w, rate);
      const L1 = listen(prompt); lock(true); await L1.play();
      const tries = await choose({ answer: it.w, buttons: live, prompt, skill: task.skill, first,
        onRight: async (b) => {
          await word(it.w); sfx.whoosh();
          // tách thẻ ra khỏi lưới rồi bay vào cặp; lưới dàn lại ngay
          const r = b.getBoundingClientRect(), A = app.getBoundingClientRect();
          at(b, (r.left + r.width / 2 - A.left) / A.width * 100, (r.top + r.height / 2 - A.top) / A.height * 100); reflow();
          void b.offsetWidth; b.classList.add("fly", "moving");
          const [bx, by] = img2f(st.bagAt); b.style.left = bx + "%"; b.style.top = by + "%"; b.style.scale = ".25"; b.style.opacity = "0";
          await wait(650); b.remove(); await praise();
        } });
      L1.remove(); return tries;
    });
    lock(true); await say("fb-thanks", { pose: "clap" }); lock(false);
  };

  /* LUẬT câu hỏi (W7, 17/11): KHUNG CÂU HỎI (viền vàng) ở TRÊN — KHUNG ĐÁP ÁN (viền tím) ở DƯỚI; thẻ nằm trong khung bằng flex
     (không đặt tuyệt đối) nên không chồng nhau / không đè viền. Kiểm bằng window.qaLayout(). */
  const qbox = (y, html = "") => at(h(`<div class="qbox">${html}</div>`), 50, y);
  const abox = (y, html = "") => at(h(`<div class="abox">${html}</div>`), 50, y);

  T.missing = async (task) => {
    lock(true); await say(task.ask); await viHint(task);
    let r = 0;
    for (const round of task.rounds) {
      field.innerHTML = "";
      const q = qbox(33);
      const tray = round.show.map(w => { const c = wcard(w, "sm", "div"); q.appendChild(c); return c; });
      lock(true);
      /* B-4 (user 24/11): reads = đọc cả dãy mấy lần (mặc định 2); countdown = để thẻ nằm yên, CHỈ hiện số đếm ngược + tiếng tích tắc rồi mới che (mặc định 3) */
      const reads = task.reads || 2;   /* user 24/11: MỌI bài What's Missing đọc 2 lần + đếm 3-2-1 (mặc định) */
      for (let rr = 0; rr < reads; rr++) {
        for (const c of tray) { c.classList.add("glow"); await word(c.dataset.w); c.classList.remove("glow"); await wait(150); }
        await wait(rr < reads - 1 ? 700 : 500);
      }
      for (let n = task.countdown ?? 3; n >= 1; n--) {
        const cd = at(h(`<div class="count3">${n}</div>`), 50, 62); sfx.tick(n % 2); await wait(950); cd.remove();
      }
      const cloth = h(`<div class="cloth">🙈</div>`); q.appendChild(cloth); sfx.whoosh();
      await wait(1500);
      tray.find(c => c.dataset.w === round.hide).classList.add("gone");
      cloth.remove(); sfx.pop();
      const others = (L.vocab || Object.keys(L.words)).filter(w => !round.show.includes(w)).sort(() => Math.random() - .5).slice(0, 2);
      const a = abox(64);
      const btns = [round.hide, ...others].sort().map(w => { const b = wcard(w); a.appendChild(b); return b; });
      const prompt = () => say("fb-missing", { pose: "think" });
      await prompt();
      await choose({ answer: round.hide, buttons: btns, prompt, skill: task.skill, first: r === 0,
        onRight: async () => { tray.find(c => c.dataset.w === round.hide).classList.remove("gone"); sfx.ding(); await word(round.hide); await praise(); } });
      r++; progress(r / task.rounds.length);
      await wait(300);
    }
  };

  /* T5 (17/11, theo ảnh mẫu user): tấm trắng — video to ở trên; bóng thoại có đuôi HIỆN NGAY khi video chiếu, câu nào đang nói thì bóng đó sáng;
     chạm bóng = nghe câu đó; "🔊 Hear the conversation" phát cả hội thoại; "Let's answer! ➜". */
  T.video = async (task) => {
    const d = task.dialog || [];
    const panel = at(h(`<div class="vpanel"><div class="vwrap"><video src="${task.src}#t=0.1" preload="auto" playsinline></video><button class="vagain always" aria-label="Xem lại">🔁</button></div>
      <div class="bgrid">${d.map((x, i) => `<button class="bub ${x.side}" data-i="${i}"><span>${x.text}</span><i>🔊</i></button>`).join("")}</div>
      <button class="hearall always">🔊 Hear the conversation</button></div>`), 50, 45);
    const v = $("video", panel), bubs = $$(".bub", panel);
    const lightAt = (t) => bubs.forEach((b, i) => b.classList.toggle("now", t >= d[i].t[0] && t <= d[i].t[1]));
    v.ontimeupdate = () => lightAt(v.currentTime);
    lock(true); await say(task.ask); await viHint(task);
    const playV = () => QA ? wait(40) : new Promise(res => { v.currentTime = 0; duck(true); v.onended = () => { duck(false); lightAt(-1); res(); }; v.play().catch(res); });
    await playV(); lightAt(-1); progress(1);
    const playLine = async (i) => { if (app.classList.contains("busy")) return; app.classList.add("busy"); bubs[i].classList.add("now"); await play(d[i].audio); bubs[i].classList.remove("now"); app.classList.remove("busy"); };
    bubs.forEach((b, i) => b.onclick = () => playLine(i));
    $(".hearall", panel).onclick = async () => { if (app.classList.contains("busy")) return; for (let i = 0; i < d.length; i++) { await playLine(i); await wait(250); } };
    $(".vagain", panel).onclick = async () => { lock(true); await playV(); lock(false); };
    lock(false); await go("Let's answer! ➜", "wide"); 
  };

  T.pick = async (task) => {
    lock(true); await say(task.ask); await viHint(task);
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const a = abox(58);
      const btns = it.options.map(w => { const b = wcard(w, "big"); a.appendChild(b); return b; });
      const prompt = (rate) => sentence(it.sentence, rate);
      const L1 = listen(prompt); lock(true); await L1.play();
      const tries = await choose({ answer: it.sentence, buttons: btns, prompt, skill: task.skill, label: "It's a " + it.sentence, first,
        onRight: async () => { sfx.ding(); await sentence(it.sentence); await praise(); } });
      L1.remove(); return tries;
    });
  };

  /* T2/T6/T9 (17/11): câu hỏi trong khung vàng (giữ 🔊 trong khung) — đáp án A/B trong khung tím; thẻ A/B chạm = CHỌN;
     nút 🔊 riêng NGOÀI thẻ (ngay dưới) để nghe; chữ đáp án theo nút Aa trên thanh trên (một nút duy nhất). */
  T.ask = async (task) => {
    lock(true); await say(task.ask); await viHint(task);
    let k = 0;
    for (const it of task.items) {
      field.innerHTML = "";
      const q = qbox(26, `<img class="qimg" src="${img(it.show)}" alt=""><div class="qrow"><b>What is it?</b><button class="qspk always" aria-label="Nghe câu hỏi">🔊</button></div>`);
      const pair = [it.show, it.wrong].sort(() => Math.random() - .5);
      const a = abox(58);
      const btns = [], spks = [];
      pair.forEach((w, i) => {
        const col = h(`<div class="abcol"><button class="abopt ${i ? "b" : "a"}" data-v="${w}"><span class="abl">${i ? "B" : "A"}</span><span class="abtx">It's a ${w}.</span></button>
          <button class="abspk always" aria-label="Nghe đáp án ${i ? "B" : "A"}">🔊</button></div>`);
        a.appendChild(col); btns.push($(".abopt", col)); spks.push($(".abspk", col));
      });
      const prompt = () => play(L.whatIsIt);
      const busyPlay = async (el, fn) => { if (app.classList.contains("busy")) return; app.classList.add("busy"); el.classList.add("glow"); await fn(); el.classList.remove("glow"); app.classList.remove("busy"); };
      $(".qspk", q).onclick = () => busyPlay(q, prompt);
      spks.forEach((s, i) => s.onclick = () => busyPlay(btns[i], () => sentence(pair[i])));
      lock(true);
      setPose("talk"); q.classList.add("glow"); await prompt(); q.classList.remove("glow");
      for (const b of btns) { b.classList.add("glow"); await sentence(b.dataset.v); b.classList.remove("glow"); await wait(250); }
      setPose("listen");
      await choose({ answer: it.show, buttons: btns, prompt, skill: task.skill, label: "It's a " + it.show, first: k === 0,
        onRight: async () => { sfx.ding(); await sentence(it.show); await praise(); } });
      await speakTurn(it.show);
      k++; progress(k / task.items.length);
    }
  };


  /* ================= A2 (23/11) ================= */

  /* chữ MỚI: chỉ TÊN + HÌNH (P to, p nhỏ) — chưa có âm nên không có nút 👂 */
  T.meetLetter = async (task) => {
    const l = task.letter;
    lock(true); await say(task.ask, { pose: "cheer" });
    const card = at(h(`<div class="tcard reveal newl"><div class="big"><span class="up">${l.toUpperCase()}</span><span class="lo">${l}</span></div>
      <div class="lb"><button class="eye" aria-label="Tên chữ">👁️</button></div></div>`), 50, 50);
    sfx.pop(); burst(card, 10);
    const eye = $(".eye", card);
    eye.classList.add("glow"); await say("ph-name", { pose: "talk" }); setPose("wave");
    caption({ en: l.toUpperCase() }); await letterName(l); await wait(300);
    await say("ph-saywithme", { pose: "talk" }); caption({ en: l.toUpperCase() }); await letterName(l); setPose("listen"); await echo(card);
    eye.classList.remove("glow"); progress(.4);
    // hình chữ: P to → p nhỏ
    const up = $(".up", card), lo = $(".lo", card);
    await say(task.bigSmall || "a2-big-small", { pose: "talk" });
    up.classList.add("glowl"); await wait(QA ? 20 : 500); up.classList.remove("glowl");
    lo.classList.add("glowl"); await wait(QA ? 20 : 500); lo.classList.remove("glowl");
    await say(task.hands || "a2-hands", { pose: "clap" }); progress(.7);
    // bé tự chạm 👁️ kiểm tra
    await say("ph-tapeye", { pose: "talk" }); setPose("listen");
    const unhand = hand(eye);
    if (QA) field.dataset.answer = eye.className;
    lock(false);
    const stopN = nudge({ replay: () => say("ph-tapeye", { pose: "talk" }), target: eye, blink: [eye] });
    await new Promise(res => eye.onclick = res);
    stopN(); eye.onclick = null; unhand(); lock(true);
    eye.classList.add("glow"); await letterName(l); eye.classList.remove("glow"); sfx.ding();
    await praise(); progress(1); lock(false);
  };

  /* TÔ CHỮ: 4 dòng kẻ (đầu – giữa – chân – đuôi); nét đánh số + chấm bắt đầu. Sparky tô mẫu từng nét đúng thứ tự,
     rồi bé dùng ngón tay tô — nét nào phủ ≥ 75 % điểm thì nét đó xanh, sang nét sau. Chờ lâu → Sparky tô mẫu lại nét đang làm. */
  const STROKES = {   // toạ độ khung 100 × 140: dòng đầu 15, giữa 57, chân 100, đuôi 135
    P: ["M32 15 L32 100", "M32 15 C 84 15, 84 57, 32 57"],
    p: ["M34 57 L34 135", "M34 62 C 80 44, 82 104, 34 97"],
    N: ["M24 100 L24 15", "M24 15 L76 100", "M76 100 L76 15"],
    n: ["M30 57 L30 100", "M30 70 C 34 52, 72 50, 72 72 L72 100"],
    /* Unit B (24/11): T = nét thẳng dài rồi nét ngang · t = nét thẳng rồi gạch ngang dòng giữa ·
       B = thẳng xuống, bụng trên, bụng dưới · b = nét thẳng cao rồi bụng ở dưới */
    T: ["M50 15 L50 100", "M20 15 L80 15"],
    t: ["M46 30 L46 100", "M30 57 L64 57"],
    B: ["M30 15 L30 100", "M30 15 C 76 15, 76 57, 30 57", "M30 57 C 84 57, 84 100, 30 100"],
    b: ["M32 15 L32 100", "M32 64 C 78 46, 80 106, 32 96"]
  };
  T.trace = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    let k = 0;
    for (const L0 of task.letters) {
      field.innerHTML = "";
      const paths = STROKES[L0];
      const pane = at(h(`<div class="tracepane"><svg viewBox="0 0 100 140" class="tsvg">
          <line x1="4" x2="96" y1="15" y2="15" class="tl"/><line x1="4" x2="96" y1="57" y2="57" class="tl mid"/><line x1="4" x2="96" y1="100" y2="100" class="tl base"/><line x1="4" x2="96" y1="135" y2="135" class="tl"/>
          ${paths.map((d, i) => `<path d="${d}" class="guide" data-i="${i}"/>`).join("")}
          ${paths.map((d, i) => `<path d="${d}" class="done" data-i="${i}"/>`).join("")}
          <g class="ink"></g>${paths.map((_, i) => `<g class="start" data-i="${i}"><circle r="5.2"/><text dy="2.1">${i + 1}</text></g>`).join("")}
          <circle class="pen" r="4.2"/></svg></div>`), 50, 45);
      const svg = $("svg", pane), guides = $$(".guide", svg), dones = $$(".done", svg), starts = $$(".start", svg), pen = $(".pen", svg), ink = $(".ink", svg);
      // số thứ tự nét đặt CẠNH điểm bắt đầu (nét 1 bên trái, nét 2 bên phải-trên) — 2 nét chung điểm đầu không che nhau
      const OFF = [[-9, 1], [8, -7], [9, 1]];
      guides.forEach((g, i) => { const p0 = g.getPointAtLength(0), o = OFF[i] || [0, 0]; starts[i].setAttribute("transform", `translate(${p0.x + o[0]},${p0.y + o[1]})`); });
      dones.forEach(d => { const len = d.getTotalLength(); d.style.strokeDasharray = len; d.style.strokeDashoffset = len; });
      const demo = async (i) => {   // bút mẫu chạy dọc nét i, vẽ dần màu
        if (QA) return wait(20);   // khung ẩn: requestAnimationFrame không chạy
        const g = guides[i], len = g.getTotalLength(), d = dones[i]; pen.style.opacity = 1; d.classList.add("demo");
        const T0 = performance.now(), dur = QA ? 30 : 1300;
        // setTimeout (không dùng requestAnimationFrame): vẫn chạy khi tab/khung bị ẩn, không kẹt bài
        await new Promise(res => { const step = () => { const f = Math.min(1, (performance.now() - T0) / dur), pt = g.getPointAtLength(f * len);
          pen.setAttribute("cx", pt.x); pen.setAttribute("cy", pt.y); d.style.strokeDashoffset = len * (1 - f); f < 1 ? setTimeout(step, 16) : res(); }; step(); });
        await wait(250); pen.style.opacity = 0; d.style.strokeDashoffset = len; d.classList.remove("demo");
      };
      await say((task.lines || { P: "a2-trace-big", p: "a2-trace-small" })[L0], { pose: "talk" });
      for (let i = 0; i < paths.length; i++) { starts[i].classList.add("now"); await demo(i); starts[i].classList.remove("now"); await wait(200); }
      await say("a2-your-turn", { pose: "talk" }); setPose("listen");
      // bé tô
      const rec = { skill: task.skill, item: L0 + (L0 === L0.toUpperCase() ? " to" : " nhỏ"), tries: 1 };
      for (let i = 0; i < paths.length; i++) {
        const g = guides[i], len = g.getTotalLength(), N = 36, pts = Array.from({ length: N }, (_, j) => g.getPointAtLength(len * j / (N - 1)));
        const hit = new Array(N).fill(false);
        starts.forEach((s, j) => s.classList.toggle("now", j === i)); guides.forEach((x, j) => x.classList.toggle("cur", j === i));
        lock(false);
        const stopN = nudge({ replay: () => demo(i), target: starts[i], blink: [] });
        await new Promise(res => {
          if (QA) return setTimeout(res, 40);
          let line = null, down = false;
          const P = (ev) => { const m = svg.getScreenCTM().inverse(), q = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m); return q; };
          const mark = (q) => { pts.forEach((pt, j) => { if (!hit[j] && Math.hypot(pt.x - q.x, pt.y - q.y) < 9) hit[j] = true; });
            const f = hit.filter(Boolean).length / N; dones[i].style.strokeDashoffset = len * (1 - Math.max(...hit.map((x, j) => x ? (j + 1) / N : 0))); return f; };
          svg.onpointerdown = (ev) => { if (app.classList.contains("locked")) return; down = true; try { svg.setPointerCapture(ev.pointerId); } catch (e) {}
            line = document.createElementNS("http://www.w3.org/2000/svg", "polyline"); ink.appendChild(line); const q = P(ev); line.setAttribute("points", `${q.x},${q.y}`); mark(q); };
          svg.onpointermove = (ev) => { if (!down) return; const q = P(ev); line.setAttribute("points", line.getAttribute("points") + ` ${q.x},${q.y}`); mark(q); };
          svg.onpointerup = svg.onpointercancel = () => { if (!down) return; down = false;
            const f = hit.filter(Boolean).length / N;
            if (f >= .75 && hit[N - 1]) { res(); }
            else { rec.tries++; ink.innerHTML = ""; hit.fill(false); dones[i].style.strokeDashoffset = len; sfx.boop(); } };
        });
        stopN(); svg.onpointerdown = svg.onpointermove = svg.onpointerup = svg.onpointercancel = null;
        ink.innerHTML = ""; dones[i].style.strokeDashoffset = 0; dones[i].classList.add("ok"); starts[i].classList.remove("now"); sfx.ding(); burst(starts[i], 6);
        lock(true);
      }
      log.push(rec);
      guides.forEach(x => x.classList.remove("cur"));
      await letterName(L0.toLowerCase()); await praise();
      k++; progress(k / task.letters.length);
    }
    lock(false);
  };

  /* Find 'p'! lưới chữ dễ nhầm (b, d, q…): chạm hết chữ đích; chạm nhầm → đỏ + rung */
  T.findGrid = async (task) => {
    const t = task.target, need = task.grid.filter(x => x === t).length;
    const grid = at(h(`<div class="lgrid">${task.grid.map((x, i) => `<button class="lcell" data-v="${x}" data-i="${i}">${x}</button>`).join("")}</div>`), 50, 54);
    const cells = $$(".lcell", grid);
    lock(true); await say(task.ask, { pose: "talk" }); setPose("listen");
    const rec = { skill: task.skill, item: t, tries: 1 }; let found = 0;
    if (QA) field.dataset.answer = t;
    lock(false);
    let stopN = nudge({ replay: () => say(task.ask, { pose: "talk" }), target: cells.find(c => c.dataset.v === t), blink: cells });
    await new Promise(res => cells.forEach(c => c.onclick = async () => {
      if (app.classList.contains("locked") || c.classList.contains("right")) return;
      stopN();
      if (c.dataset.v === t) {
        c.classList.add("right"); c.dataset.v = ""; burst(c, 6); sfx.ding(); found++; progress(found / need);
        letterName(t.toLowerCase());
        if (QA) setTimeout(() => field.dataset.answer = t, 0);   // qaAct xoá answer SAU khi bấm → đặt lại ở lượt sau
        if (found >= need) return res();
      } else {
        rec.tries++; sfx.boop(); shake(c); c.classList.add("wrong"); lock(true); await say(task.wrongLine || "a2-not-p", { pose: "oops" }); c.classList.remove("wrong"); setPose("listen"); lock(false);
      }
      const left = cells.find(x => x.dataset.v === t);
      stopN = nudge({ replay: () => say(task.ask, { pose: "talk" }), target: left, blink: cells.filter(x => !x.classList.contains("right")) });
    }));
    stopN(); log.push(rec);
    lock(true); await say(task.doneLine || "a2-found-all", { pose: "cheer" }); sfx.tada(); lock(false);
  };

  /* thẻ CHỮ — tách âm (break phonics). A2-1 (23/11): mỗi phần = [chữ, âm rời] → phần sáng nào phát âm đó (media/phonemes/) */
  const parts = (w) => (L.splits?.[w] || [[w, null]]).map(p => Array.isArray(p) ? p : [p, null]);
  const phon = (id) => id ? clip(`media/phonemes/${id}.mp3`) : wait(QA ? 10 : 380);
  const wtext = (w, cls = "") => `<span class="wtext ${cls}">${parts(w).map(([t, ph]) => `<i data-ph="${ph || ""}">${t}</i>`).join("")}</span>`;
  async function readOut(card, w) {   // từng phần sáng + phát âm rời, rồi cả từ sáng + đọc cả từ
    if (L.breakPhonics !== false) {   // breakPhonics: false trong lessons/<bài>.js → chỉ đọc cả từ
      for (const p of $$(".wtext i", card)) { p.classList.add("lit"); await phon(p.dataset.ph); await wait(QA ? 5 : 160); p.classList.remove("lit"); }
      await wait(QA ? 5 : 200);
    }
    card.classList.add("whole"); await word(w); await wait(200); card.classList.remove("whole");
  }
  /* chạm từng phần → nghe âm đó; chạm hình → nghe tách âm + cả từ (bé tự đọc lại) */
  function tapParts(card, w) {
    const busyPlay = async (fn) => { if (app.classList.contains("busy") || app.classList.contains("locked")) return; app.classList.add("busy"); await fn(); app.classList.remove("busy"); };
    if (L.breakPhonics === false) { const wt = $(".wtext", card); if (wt) { wt.classList.add("tap"); wt.onclick = () => busyPlay(() => readOut(card, w)); } }   // không tách âm: chạm chữ = nghe cả từ
    else $$(".wtext i", card).forEach(p => { p.classList.add("tap"); p.onclick = (ev) => { ev.stopPropagation(); busyPlay(async () => { p.classList.add("lit"); await phon(p.dataset.ph); p.classList.remove("lit"); }); }; });
    const im = $("img", card); if (im) im.onclick = () => busyPlay(() => readOut(card, w));
  }
  /* Đọc cùng Sparky — A2-1: mỗi lượt CHỈ 1 hình + 1 chữ: b · a · g (âm rời) → "bag" (2 lần) → bé đọc theo → bé tự chạm nghe lại → ➜ */
  T.readWords = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    let k = 0;
    for (const w of task.words) {
      field.innerHTML = "";
      const c = at(h(`<div class="card rword one" data-w="${w}"><img src="${img(w)}" alt="">${wtext(w)}</div>`), 50, 46);
      sfx.pop(); await wait(300);
      c.classList.add("glow"); await readOut(c, w); await wait(400); await readOut(c, w); c.classList.remove("glow");
      setPose("listen"); await echo(c);
      tapParts(c, w);
      k++; progress(k / task.words.length);
      lock(false); await go("➜"); lock(true);
    }
    lock(false);
  };
  /* Đọc chữ → chạm hình: chữ to trong khung vàng (KHÔNG đọc to trước), đáp án = hình không chữ */
  T.readMatch = async (task) => {
    lock(true); await say(task.ask);
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const q = qbox(33, `<div class="card rword solo" data-w="${it.word}">${wtext(it.word, "big")}</div>`);
      const a = abox(58);
      const btns = it.options.map(w => { const b = h(`<button class="card pic picb" data-v="${w}"><img src="${img(w)}" alt=""></button>`); a.appendChild(b); return b; });
      const prompt = () => say("a2-read-it", { pose: "think" });
      setPose("listen"); lock(false);
      const tries = await choose({ answer: it.word, buttons: btns, prompt, skill: task.skill, label: it.word, first,
        onRight: async () => { sfx.ding(); await readOut($(".rword", q), it.word); await praise(); } });
      return tries;
    });
  };
  /* Read & Match: hình to → chọn nhãn chữ đúng → nhãn bay vào dưới hình */
  T.label = async (task) => {
    lock(true); await say(task.ask);
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const q = qbox(36, `<div class="card pic lbpic"><img src="${img(it.show)}" alt=""><span class="lslot"></span></div>`);
      const a = abox(65);
      const btns = it.options.map(w => { const b = h(`<button class="card wbtn" data-v="${w}">${wtext(w)}</button>`); a.appendChild(b); return b; });
      const prompt = () => say("a2-label", { pose: "think" });
      setPose("listen"); lock(false);
      const tries = await choose({ answer: it.show, buttons: btns, prompt, skill: task.skill, label: it.show, first,
        onRight: async (b) => { sfx.ding(); const slot = $(".lslot", q); slot.innerHTML = wtext(it.show); slot.classList.add("on"); b.classList.add("faded"); await readOut(slot, it.show); await praise(); } });
      return tries;
    });
  };
  /* Tick or Cross: hình + câu "It's a …" (chữ + tiếng) → ✓ đúng / ✗ sai; sai thì Sparky nói lại câu đúng */
  T.tick = async (task) => {
    lock(true); await say(task.ask);
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const neg = !!it.not, w = neg ? it.not : it.say, ok = neg ? it.show !== it.not : it.show === it.say;
      const q = qbox(30, `<img class="qimg" src="${img(it.show)}" alt=""><div class="qrow"><b class="${task.hideText ? "abtx" : ""}">It's ${neg ? "not " : ""}a ${w}.</b>${task.read ? "" : `<button class="qspk always" aria-label="Nghe câu">🔊</button>`}</div>`);
      const a = at(h(`<div class="tickrow"><button class="tickb yes" data-v="yes" aria-label="Đúng">${task.thumbs ? "👍" : "✓"}</button><button class="tickb no" data-v="no" aria-label="Sai">${task.thumbs ? "👎" : "✗"}</button></div>`), 50, 60);
      const btns = $$(".tickb", a);
      const audio = neg ? (L.notAudio || {})[it.not] : L.words[it.say]?.sentence;
      const prompt = task.read ? () => say("a5-read-it", { pose: "think" }) : () => play(audio);
      if (!task.read) $(".qspk", q).onclick = async () => { if (app.classList.contains("busy")) return; app.classList.add("busy"); q.classList.add("glow"); await prompt(); q.classList.remove("glow"); app.classList.remove("busy"); };
      setPose("listen"); if (!task.read) { q.classList.add("glow"); await prompt(); q.classList.remove("glow"); }
      const tries = await choose({ answer: ok ? "yes" : "no", buttons: btns, prompt, skill: task.skill, label: `${it.show}: "It's ${neg ? "not " : ""}a ${w}"`, first,
        onRight: async () => { if (task.read) { q.classList.add("glow"); await play(audio); q.classList.remove("glow"); }
          $("b", q).classList.remove("abtx");
          if (ok) { await say("a2-yes", { pose: "thumbs" }); } else { await say("a2-no", { pose: "talk" }); $("b", q).textContent = `It's a ${it.show}.`; q.classList.add("glow"); await sentence(it.show); q.classList.remove("glow"); } await praise(); } });
      return tries;
    });
  };
  /* Show & Say: nhạc vui chạy, 3 thẻ úp nhún theo nhạc → nhạc dừng → bé chạm 1 thẻ → lật ra hình → bé nói "It's a …" */
  T.showSay = async (task) => {
    lock(true); await say(task.ask, { pose: "cheer" });
    const pool = [...task.pool].sort(() => Math.random() - .5);
    for (let r = 0; r < task.rounds; r++) {
      field.innerHTML = "";
      const ws = pool.slice(r * 3, r * 3 + 3);
      const row = at(h(`<div class="fliprow">${ws.map(w => `<button class="card flipc" data-v="${w}"><span class="back">?</span><img src="${img(w)}" alt=""></button>`).join("")}</div>`), 50, 50);
      const cs = $$(".flipc", row);
      row.classList.add("dance"); await jingle(); row.classList.remove("dance");
      setPose("listen"); if (QA) field.dataset.answer = ws[0];
      lock(false);
      const stopN = nudge({ replay: () => say(task.ask, { pose: "talk" }), blink: cs });
      const c = await new Promise(res => cs.forEach(x => x.onclick = () => res(x))); stopN(); lock(true);
      cs.forEach(x => x.onclick = null); c.classList.add("open"); sfx.pop(); burst(c, 8); await wait(500);
      await word(c.dataset.v);
      await speakTurn(c.dataset.v);
      progress((r + 1) / task.rounds);
    }
    lock(false);
  };
  /* đoạn nhạc ngắn (~2,6 s) cho Show & Say — tổng hợp, không cần file */
  async function jingle() {
    if (QA || !ac) return wait(QA ? 20 : 2600);
    const N = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1047], t0 = ac.currentTime + .05;
    N.forEach((f, i) => tone(f, t0 + i * .21, .2, "triangle", .35));
    await wait(N.length * 210 + 150); sfx.pop();
  }


  /* ================= A3–A6 (24/11) ================= */
  /* A36-1/2 (24/11, LUẬT mọi unit): chữ phụ âm đang học — CHỈ chữ ở vị trí đang dạy (đầu / cuối) tô màu riêng,
     nhấp nháy theo từng lần phát âm rời, rồi mới sáng + đọc cả từ. Chữ khác giữ màu thường. */
  const tword = (w, idx, cls = "") => `<span class="tword ${cls}">${w.split("").map((c, i) => `<i class="${i === idx ? "tgt" : ""}">${c}</i>`).join("")}</span>`;
  async function soundBlink(el, letter, times = 2) {
    const t = $$(".tgt", el);
    for (let r = 0; r < times; r++) { t.forEach(x => x.classList.add("blink")); await letterSound(letter); t.forEach(x => x.classList.remove("blink")); await wait(QA ? 5 : 220); }
  }
  async function wholeWord(el, w) { const c = L.wordColor === "violet" ? "whole" : "whole-ink"; /* 24/11 user: mặc định chữ ĐEN (chữ đích vẫn đỏ cam); "violet" = tím */ el.classList.add(c); await word(w); await wait(150); el.classList.remove(c); }
  /* âm + từ ví dụ: /p/ /p/ pot — hình to, chữ dưới; bé nói theo */
  T.soundExamples = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    let k = 0;
    for (const w of task.words) {
      field.innerHTML = "";
      const c = at(h(`<div class="card rword one" data-w="${w}"><img src="${img(w)}" alt="">${tword(w, 0)}</div>`), 50, 46);
      sfx.pop(); await wait(250); c.classList.add("glow");
      for (let r = 0; r < 2; r++) { await soundBlink(c, task.letter); await wait(150); await wholeWord(c, w); await wait(450); }
      c.classList.remove("glow"); setPose("listen"); await echo(c);
      k++; progress(k / task.words.length);
    }
    await praise(); lock(false);
  };
  /* TÊN hay ÂM? nghe → chạm 👁️ (tên) hoặc 👂 (âm) */
  T.nameOrSound = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const card = at(h(`<div class="tcard"><div class="big"><span>${it.l.toUpperCase()}</span><span>${it.l}</span></div>
        <div class="lb"><button class="eye" data-v="name" aria-label="Tên chữ">👁️</button><button class="ear" data-v="sound" aria-label="Âm">👂</button></div></div>`), 50, 50);
      const btns = $$(".lb button", card);
      const prompt = (rate) => it.by === "sound" ? letterSound(it.l, rate) : letterName(it.l, rate);
      const L1 = listen(prompt); lock(true); await L1.play();
      const tries = await choose({ answer: it.by === "sound" ? "sound" : "name", buttons: btns, prompt, skill: task.skill, label: (it.by === "sound" ? "âm /" : "tên ") + it.l + (it.by === "sound" ? "/" : ""), first,
        onRight: async () => { sfx.ding(); await say(it.by === "sound" ? "ph-sound" : "ph-name", { pose: "talk" }); await prompt(); await praise(); } });
      L1.remove(); return tries;
    });
  };
  /* Listen for /p/: 2 mái chèo 1 · 2 — nghe 2 từ, chạm từ bắt đầu bằng âm đó */
  T.listenFor = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const row = at(h(`<div class="paddles">${it.w.map((w, i) => `<button class="paddle" data-v="${i}"><b>${i + 1}</b><i>🔊</i></button>`).join("")}</div>`), 50, 52);
      const btns = $$(".paddle", row);
      const prompt = async () => { for (let i = 0; i < 2; i++) { btns[i].classList.add("glow"); await word(it.w[i]); btns[i].classList.remove("glow"); await wait(350); } };
      const L1 = listen(prompt); lock(true); await L1.play();
      const tries = await choose({ answer: String(it.ans), buttons: btns, prompt, skill: task.skill, label: it.w.join(" / "), first,
        onRight: async (b) => { sfx.ding(); const W = it.w[it.ans]; b.querySelector("b").innerHTML = tword(W, 0); await soundBlink(b, task.letter); await wholeWord(b, W); await praise(); } });
      L1.remove(); return tries;
    });
  };
  /* nghe từ → chạm hình (Slap the board) */
  T.listenPick = async (task) => {
    lock(true); await say(task.ask);
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const a = abox(56);
      const btns = it.options.map(w => { const b = wcard(w, it.options.length > 3 ? "sm" : "big"); a.appendChild(b); return b; });
      if (it.options.length > 3) a.classList.add("wrap5");
      const prompt = (rate) => word(it.w, rate);
      const L1 = listen(prompt); lock(true); await L1.play();
      const tries = await choose({ answer: it.w, buttons: btns, prompt, skill: task.skill, label: it.w, first,
        onRight: async () => { sfx.ding(); await word(it.w); await praise(); } });
      L1.remove(); return tries;
    });
  };
  /* XẾP CÂU từ mảnh: hình trên, ô trống giữa, mảnh xáo dưới — chạm đúng thứ tự; xong → nghe cả câu */
  T.build = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    let k = 0;
    for (const it of task.items) {
      field.innerHTML = "";
      at(h(`<div class="card pic big bimg"><img src="${img(it.show)}" alt=""></div>`), 50, 27);
      const slots = at(h(`<div class="bslots">${it.chunks.map(() => `<span class="bslot"></span>`).join("")}</div>`), 50, 47);
      const order = it.chunks.map((c, i) => i).sort(() => Math.random() - .5);
      if (order.every((v, i) => v === i)) order.reverse();
      const pool = at(h(`<div class="bpool">${order.map(i => `<button class="chunk" data-i="${i}" data-v="${i}">${it.chunks[i]}</button>`).join("")}</div>`), 50, 63);
      const rec = { skill: task.skill, item: it.chunks.join(" "), tries: 1 };
      let next = 0; setPose("listen");
      if (QA) field.dataset.answer = "0";
      lock(false);
      let stopN = nudge({ replay: () => say(task.ask, { pose: "talk" }), target: $(`.chunk[data-i="0"]`, pool), blink: $$(".chunk", pool) });
      await new Promise(res => $$(".chunk", pool).forEach(b => b.onclick = async () => {
        if (app.classList.contains("locked") || b.classList.contains("used")) return;
        stopN();
        if (+b.dataset.i === next) {
          b.classList.add("used"); b.dataset.v = "x"; const sl = $$(".bslot", slots)[next]; sl.textContent = it.chunks[next]; sl.classList.add("on"); sfx.tap(); next++;
          if (QA) setTimeout(() => field.dataset.answer = String(next), 0);
          if (next >= it.chunks.length) return res();
        } else { rec.tries++; sfx.boop(); shake(b); b.classList.add("wrong"); await wait(400); b.classList.remove("wrong"); }
        stopN = nudge({ replay: () => say(task.ask, { pose: "talk" }), target: $(`.chunk[data-i="${next}"]`, pool), blink: $$(".chunk:not(.used)", pool) });
      }));
      stopN(); log.push(rec); lock(true);
      slots.classList.add("done"); burst(slots, 10); sfx.ding(); await play(it.audio); await praise();
      k++; progress(k / task.items.length);
    }
    lock(false);
  };
  /* HELP SPARKY: Sparky gọi tên đồ vật (đúng hoặc sai) → bé 👍 / 👎; sai thì nghe câu sửa "It's not a desk. It's a chair." */
  T.help = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const ok = it.show === it.say;
      const q = qbox(30, `<img class="qimg" src="${img(it.show)}" alt=""><div class="qrow spkq"><b class="${task.hideText ? "abtx" : ""}">It's a ${it.say}!</b><button class="qspk always" aria-label="Nghe">🔊</button></div>`);
      const a = at(h(`<div class="tickrow"><button class="tickb yes" data-v="yes" aria-label="Đúng">👍</button><button class="tickb no" data-v="no" aria-label="Sai">👎</button></div>`), 50, 60);
      const btns = $$(".tickb", a);
      const prompt = () => say("sp-say-" + it.say.replace(/ /g, "-"), { pose: "talk", after: "listen" });   // Sparky tự nói (giọng Sparky)
      $(".qspk", q).onclick = async () => { if (app.classList.contains("busy")) return; app.classList.add("busy"); q.classList.add("glow"); await prompt(); q.classList.remove("glow"); app.classList.remove("busy"); };
      q.classList.add("glow"); await prompt(); q.classList.remove("glow");
      const tries = await choose({ answer: ok ? "yes" : "no", buttons: btns, prompt, skill: task.skill, label: `${it.show}: Sparky "${it.say}"`, first,
        onRight: async () => {
          if (ok) { $("b", q).classList.remove("abtx"); await say("a2-yes", { pose: "thumbs" }); }
          else { $("b", q).textContent = it.full ? `It's not a ${it.say}. It's a ${it.show}.` : `It's not a ${it.say}.`; $("b", q).classList.remove("abtx"); q.classList.add("glow"); await play(it.fix); q.classList.remove("glow"); await say("fb-thanks", { pose: "clap" }); }
          await praise(); } });
      return tries;
    });
  };
  /* ĐÁNH VẦN bằng TÊN chữ: nghe từ → chạm ô chữ đúng thứ tự (mỗi chạm đọc tên chữ) → đọc cả từ */
  T.spell = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    let k = 0;
    for (const it of task.items) {
      field.innerHTML = "";
      const letters = it.w.split(""), extra = (it.extra || []);
      const slots = at(h(`<div class="bslots sp">${letters.map(() => `<span class="bslot"></span>`).join("")}</div>`), 50, 40);
      const tiles = [...letters.map((l, i) => ({ l, i })), ...extra.map(l => ({ l, i: -1 }))].sort(() => Math.random() - .5);
      const pool = at(h(`<div class="bpool tiles">${tiles.map((t, j) => `<button class="tile" data-l="${t.l}" data-v="${t.l}">${t.l}</button>`).join("")}</div>`), 50, 60);
      const prompt = (rate) => word(it.w, rate);
      const L1 = listen(prompt); lock(true); await L1.play();
      const rec = { skill: task.skill, item: it.w, tries: 1 }; let next = 0;
      if (QA) field.dataset.answer = letters[0];
      lock(false);
      let stopN = nudge({ replay: prompt, target: $(`.tile[data-l="${letters[0]}"]`, pool), blink: $$(".tile", pool) });
      await new Promise(res => $$(".tile", pool).forEach(b => b.onclick = async () => {
        if (app.classList.contains("locked") || b.classList.contains("used")) return;
        stopN();
        if (b.dataset.l === letters[next]) {
          b.classList.add("used"); b.dataset.v = "x"; const sl = $$(".bslot", slots)[next]; sl.textContent = letters[next]; sl.classList.add("on"); next++;
          lock(true); await letterName(b.dataset.l); lock(false);
          if (QA) setTimeout(() => field.dataset.answer = letters[next] || "", 0);
          if (next >= letters.length) return res();
        } else { rec.tries++; sfx.boop(); shake(b); b.classList.add("wrong"); await wait(400); b.classList.remove("wrong"); }
        stopN = nudge({ replay: prompt, target: $(`.tile:not(.used)[data-l="${letters[next]}"]`, pool), blink: $$(".tile:not(.used)", pool) });
      }));
      stopN(); log.push(rec); L1.remove(); lock(true);
      slots.classList.add("done"); burst(slots, 10); sfx.ding();
      for (const l of letters) await letterName(l);   // P – E – N
      await wait(200); await word(it.w); await praise();
      k++; progress(k / task.items.length);
    }
    lock(false);
  };
  /* B-7: thẻ `el` kéo được (chuột + ngón tay); thả gần ô nào trong `boxes` = bấm ô đó (đi qua choose: đúng/sai/gợi ý như cũ).
     Thả ra ngoài → trượt về chỗ cũ, không tính sai. */
  function dragInto(el, boxes) {
    let d = null;
    el.classList.add("dragme");
    const over = () => { const m = el.getBoundingClientRect(), cx = m.left + m.width / 2, cy = m.top + m.height / 2; let best = null, bd = Infinity;
      for (const b of boxes) { if (b.classList.contains("faded") || b.classList.contains("right")) continue;
        const r = b.getBoundingClientRect(), dist = Math.hypot(cx - (r.left + r.width / 2), cy - (r.top + r.height / 2));
        if (dist < r.width * .85 && dist < bd) { bd = dist; best = b; } }
      return best; };
    const back = () => { el.style.transition = "translate .25s ease-out"; el.style.translate = "0 0"; setTimeout(() => { el.style.transition = ""; }, 270); };
    el.onpointerdown = (ev) => { if (app.classList.contains("locked") || el.classList.contains("placed")) return; ev.preventDefault();
      d = { x: ev.clientX, y: ev.clientY }; try { el.setPointerCapture(ev.pointerId); } catch (e) {} el.style.transition = ""; el.classList.add("held"); };
    el.onpointermove = (ev) => { if (!d) return; el.style.translate = `${ev.clientX - d.x}px ${ev.clientY - d.y}px`; const t = over(); boxes.forEach(b => b.classList.toggle("near", b === t)); };
    el.onpointerup = el.onpointercancel = (ev) => { if (!d) return; const t = ev.type === "pointerup" ? over() : null; d = null;
      el.classList.remove("held"); boxes.forEach(b => b.classList.remove("near")); back(); if (t) t.click(); };
  }
  /* ÂM ĐẦU hay ÂM CUỐI: nghe từ → kéo chữ giữa vào (hoặc chạm) ô đầu (▶ start) hay ô cuối (end ◀) */
  T.position = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      if (L.words[it.w]?.img) at(h(`<div class="card pic big bimg"><img src="${img(it.w)}" alt=""></div>`), 50, 30.5);
      const row = at(h(`<div class="posrow"><div class="posbox"><button class="pos" data-v="start">${it.sound}</button><span class="posmid">${it.sound}</span><button class="pos" data-v="end">${it.sound}</button></div></div>`), 50, L.words[it.w]?.img ? 59.5 : 50);
      const btns = $$(".pos", row), mid = $(".posmid", row);
      dragInto(mid, btns);   // B-7 (user 24/11): kéo chữ giữa thả vào ô đầu / ô cuối (vẫn chạm ô được)
      const prompt = async (rate) => { await letterSound(it.sound, rate); await wait(250); await word(it.w, rate); };
      const L1 = listen(prompt); lock(true); await L1.play();
      const tries = await choose({ answer: it.at, buttons: btns, prompt, skill: task.skill, label: `${it.w}: /${it.sound}/ ${it.at === "start" ? "đầu" : "cuối"}`, first, dragFrom: mid,
        onRight: async () => { sfx.ding(); mid.classList.add("placed");
          const idx = it.at === "start" ? it.w.indexOf(it.sound) : it.w.lastIndexOf(it.sound);
          // A36-3: không thêm khung riêng — chữ hiện ngay trong tấm trắng đang chứa 2 ô, cỡ chữ như thẻ đọc từ
          const tw = h(`<div class="posword">${tword(it.w, idx)}</div>`); row.prepend(tw);
          await soundBlink(tw, it.sound); await wholeWord(tw, it.w); await praise(); } });
      L1.remove(); return tries;
    });
  };
  /* ĐIỀN CHỮ THIẾU: nghe từ → _en → chọn p hay n */
  T.complete = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const show = it.w.split("").map((c, i) => i === it.at ? `<i class="gap">_</i>` : `<i>${c}</i>`).join("");
      const q = qbox(32, `<div class="card rword solo"><span class="wtext big">${show}</span></div>`);
      const a = abox(58);
      const btns = it.options.map(l => { const b = h(`<button class="card key" data-v="${l}">${l}</button>`); a.appendChild(b); return b; });
      const prompt = (rate) => word(it.w, rate);
      const L1 = listen(prompt); lock(true); await L1.play();
      const tries = await choose({ answer: it.w[it.at], buttons: btns, prompt, skill: task.skill, label: it.w, first,
        onRight: async () => { sfx.ding(); const g = $(".gap", q); g.textContent = it.w[it.at]; g.classList.add("lit"); await word(it.w); await praise(); } });
      L1.remove(); return tries;
    });
  };

  /* ================= Unit B (24/11) ================= */
  const lid = (w) => w.replace(/ /g, "-");
  const peekCss = (it) => it.peek ? ` peek" style="--px:${(it.peek[0] ?? 50)}%;--py:${(it.peek[1] ?? 45)}%` : "";
  /* IS IT A …? Sparky hỏi (giọng Sparky, lời sp-is-<từ>) → bé chọn 👍 "Yes, it is." / 👎 "No, it isn't." (chữ đáp án theo nút Aa).
     Chọn xong: câu trả lời mẫu phát bằng giọng app homework (KHÔNG giọng Sparky — lời của bé) → 🗣️ bé nói theo.
     read: true (B2/B6) = câu hỏi hiện chữ, KHÔNG đọc trước — bé tự đọc; trả lời xong mới nghe. Câu hỏi không read: chữ ẩn (chỉ hiện khi bật Aa).
     peek: [x, y] = hình chỉ ló một vòng nhỏ (đồ chơi trong hộp), trả lời xong mới hiện hết. */
  T.isIt = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    let k = 0;
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const ok = it.show === it.q;
      const q = qbox(26, `<img class="qimg${peekCss(it)}" src="${img(it.show)}" alt=""><div class="qrow spkq"><b class="${task.read ? "" : "abtx"}">Is it a ${it.q}?</b>${task.read ? "" : `<button class="qspk always" aria-label="Nghe câu hỏi">🔊</button>`}</div>`);
      const a = abox(60);
      const btns = [["yes", "👍", "Yes, it is."], ["no", "👎", "No, it isn't."]].map(([v, ic, tx], i) => {
        const col = h(`<div class="abcol"><button class="abopt yn ${i ? "b" : "a"}" data-v="${v}"><span class="abl">${ic}</span><span class="abtx">${tx}</span></button></div>`);
        a.appendChild(col); return $(".abopt", col);
      });
      const ask = () => say("sp-is-" + lid(it.q), { pose: "think", after: "listen" });
      const answer = (v) => play(L.yesNo[v]);
      const prompt = task.read ? () => say(task.readLine || "b-read-q", { pose: "think", after: "listen" }) : ask;
      if (!task.read) $(".qspk", q).onclick = async () => { if (app.classList.contains("busy")) return; app.classList.add("busy"); q.classList.add("glow"); await ask(); q.classList.remove("glow"); app.classList.remove("busy"); };
      lock(true);
      if (!task.read) { q.classList.add("glow"); await ask(); q.classList.remove("glow"); }
      if (k < 2 && !task.read) for (const b of btns) { b.classList.add("glow"); await answer(b.dataset.v); b.classList.remove("glow"); await wait(250); }
      k++; setPose("listen");
      const tries = await choose({ answer: ok ? "yes" : "no", buttons: btns, prompt, skill: task.skill, label: `${it.show}: "Is it a ${it.q}?"`, first,
        onRight: async (b) => {
          sfx.ding();
          if (task.read) { q.classList.add("glow"); await ask(); q.classList.remove("glow"); }
          $(".qimg", q).classList.remove("peek"); $(".qrow b", q).classList.remove("abtx"); await wait(it.peek ? 500 : 100);
          b.classList.add("glow"); await answer(ok ? "yes" : "no"); setPose("listen"); await echo(b); b.classList.remove("glow");
          await praise(); } });
      return tries;
    });
  };
  /* ĐOÁN ĐỒ CHƠI TRONG HỘP (What's in Sparky's Box? / Mystery Toy): hình chỉ ló một góc; bé chạm 1 trong 3 thẻ = HỎI
     "Is it a kite?" (câu mẫu giọng app homework) → 🗣️ bé nói theo → Sparky đáp "No, it isn't." (thẻ đỏ rồi mờ) hoặc "Yes, it is!" (hiện hết hình). */
  T.guess = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    let r = 0;
    for (const it of task.items) {
      field.innerHTML = "";
      const q = qbox(28, `<img class="qimg gq${peekCss({ peek: it.peek || [50, 45] })}" src="${img(it.show)}" alt=""><div class="qrow"><b>?</b></div>`);
      const a = abox(61);
      const btns = it.options.map(w => { const b = wcard(w, "big"); a.appendChild(b); return b; });
      btns.forEach(b => b.classList.add("opt"));
      const rec = { skill: task.skill, item: it.show, tries: 0 };
      const prompt = () => say(task.again || "b-guess-again", { pose: "think", after: "listen" });
      setPose("listen"); lock(false);
      for (;;) {
        if (QA) field.dataset.answer = it.show;
        const stopN = nudge({ replay: prompt, target: btns.find(b => b.dataset.v === it.show), blink: btns.filter(b => !b.classList.contains("faded")) });
        const b = await new Promise(res => btns.forEach(x => x.onclick = () => { if (!app.classList.contains("locked") && !x.classList.contains("faded")) res(x); }));
        stopN(); lock(true); rec.tries++;
        b.classList.add("glow"); await play(L.isAudio[b.dataset.v]); setPose("listen"); await echo(b); b.classList.remove("glow");
        if (b.dataset.v === it.show) {
          b.classList.add("right"); sfx.ding(); $(".qimg", q).classList.remove("peek"); $(".qrow b", q).textContent = it.show; burst(q, 10);
          await say("sp-yes", { pose: "cheer" }); await word(it.show); await praise(); break;
        }
        b.classList.add("wrong"); sfx.boop(); shake(b); await say("sp-no", { pose: "talk" }); b.classList.remove("wrong"); b.classList.add("faded");
        setPose("listen"); lock(false);
      }
      log.push(rec); r++; progress(r / task.items.length);
      await wait(300);
    }
  };

  /* T4/T8 (17/11): lượt nói — bố cục cân giữa: hình (trên) → dòng gợi ý (chừa sẵn chỗ) → hàng 💡 · 🎤 · ⏭ đối xứng */
  async function speakTurn(w) {
    field.innerHTML = "";
    at(h(`<div class="card pic big"><img src="${img(w)}" alt=""></div>`), 50, 30);
    const tip = at(h(`<div class="tipline">It's a ${w}.</div>`), 50, 50); tip.classList.add("ghost");
    const row = at(h(`<div class="sayrow"><button class="side bulb always" aria-label="Gợi ý">💡</button><button class="mic" aria-label="Ghi âm">🎤</button><button class="side skipb" aria-label="Bỏ qua">⏭</button></div>`), 50, 65);
    const bulb = $(".bulb", row), mic = $(".mic", row), skip = $(".skipb", row);
    bulb.onclick = async () => { if (app.classList.contains("busy")) return; app.classList.add("busy"); tip.classList.remove("ghost"); tip.classList.add("reveal"); bulb.classList.add("glow"); await sentence(w); bulb.classList.remove("glow"); app.classList.remove("busy"); };
    lock(true); await say("fb-yourturn", { pose: "talk" }); setPose("listen"); lock(false);
    const stopN = nudge({ replay: () => say("fb-yourturn", { pose: "talk" }), target: mic, blink: [bulb] });
    await new Promise(res => {
      skip.onclick = () => { stopN(); sfx.tap(); res(); };
      mic.onclick = async () => { stopN();
        if (!navigator.mediaDevices?.getUserMedia || QA) return res();
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const rec = new MediaRecorder(stream), chunks = [];
          rec.ondataavailable = e => chunks.push(e.data);
          rec.onstop = async () => {
            stream.getTracks().forEach(t => t.stop()); mic.classList.remove("rec"); lock(true);
            const url = URL.createObjectURL(new Blob(chunks));
            await play(url); await wait(250); burst(mic); sfx.ding();
            await sentence(w); await praise(); lock(false); res();
          };
          mic.classList.add("rec"); duck(true); rec.start(); setTimeout(() => rec.state === "recording" && rec.stop(), 3000);
        } catch (e) { res(); }
      };
    });
  }

  /* ================= UNIT C (24/11) — số đếm, màu, hỏi–đáp "How many?" / "What colour is it?" =================
     Dữ liệu: window.UNIT_C (_shared.js) → L.words có số "1".."10" (hình khối, tiếng one…ten), chữ số one…ten, 10 màu (vệt màu + tiếng),
     L.howMany / L.whatColour (câu hỏi giọng mẫu), L.words[màu].its ("It's red." giọng mẫu). Không đổi loại bài cũ. */
  Object.assign(STROKES, {   // R: thẳng xuống → bụng trên → chân chéo ra · r: nét ngắn → vai · D: thẳng → một bụng to · d: bụng tròn → nét cao bên phải
    R: ["M30 15 L30 100", "M30 15 C 84 15, 84 57, 30 57", "M46 57 L78 100"],
    r: ["M34 57 L34 100", "M34 74 C 40 56, 60 52, 72 60"],
    D: ["M28 15 L28 100", "M28 15 C 94 15, 94 100, 28 100"],
    d: ["M68 66 C 60 52, 30 54, 30 79 C 30 104, 60 104, 68 92", "M68 15 L68 100"]
  });
  /* C-4 (24/11, user chọn "vẽ đội sẵn"): món có it.eye = lớp mũ tách từ ảnh máy vẽ Sparky ĐANG ĐỘI (tools/wear_fit/worn.py) —
     đặt theo khung MẮT của từng tư thế (WR.EYES: tâm mắt, khoảng cách mắt, góc nghiêng) + xoay theo độ nghiêng đầu quanh đáy mũ.
     Món cũ (không có it.eye) giữ nguyên cách đặt theo HEAD. Thẻ quà + tủ đồ vẫn dùng hình phẳng it.img. */
  const _placeWearHead = placeWear;
  placeWear = function (id = wardrobe.wearing) {
    const it = WR.ITEMS[id], E = WR.EYES || {}, e = E[pose] || E.idle;
    if (!it || !it.eye || !it.worn || !e) { wearEl.style.rotate = ""; wearEl.style.transformOrigin = ""; return _placeWearHead(id); }
    const q = it.eye, t = e.r * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), vx = q.ox * c - q.oy * s, vy = q.ox * s + q.oy * c;
    if (!wearEl.src.endsWith(it.worn)) wearEl.src = it.worn;
    wearEl.classList.add("on");
    wearEl.style.left = (e.mx + vx * e.d) + "%"; wearEl.style.top = (e.my + vy * e.d * e.a) + "%"; wearEl.style.width = (q.w * e.d) + "%";
    wearEl.style.transformOrigin = "50% 100%"; wearEl.style.rotate = (e.r - (q.rb || 0)) + "deg";
  };
  placeWear();
  const CW = (k) => L.words[k] || {};
  const bplay = async (el, fn) => { if (app.classList.contains("busy")) return; app.classList.add("busy"); el.classList.add("glow"); await fn(); el.classList.remove("glow"); app.classList.remove("busy"); };
  const playSeq = async (list, rate) => { for (const s of [].concat(list)) { await play(s, { rate }); await wait(200); } };
  const NUMW = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  const ansText = (k) => /^\d+$/.test(k) ? `${NUMW[+k][0].toUpperCase() + NUMW[+k].slice(1)}!` : `It's ${k}.`;
  const ansAudio = (k) => /^\d+$/.test(k) ? () => word(k) : () => play(CW(k).its);
  /* thẻ đáp án Unit C: chữ số to · vệt màu · hình · chữ */
  function optCard(k, as, cls = "") {
    if (as === "num") return h(`<button class="card ncard ${cls}" data-v="${k}"><span>${k}</span></button>`);
    if (as === "colour") return h(`<button class="card swc ${cls}" data-v="${k}"><img src="${CW(k).img}" alt=""></button>`);
    if (as === "word") return h(`<button class="card wbtn sqw ${cls}" data-v="${k}">${wtext(k)}</button>`);   // C-1 (24/11): khung vuông to
    return h(`<button class="card pic picb ${cls}" data-v="${k}"><img src="${CW(k).img || k}" alt=""></button>`);   // "pic"
  }

  /* HOW OLD ARE YOU? (C1/C3/C5 thay câu hỏi cảm xúc) — 4 thẻ số tuổi; V1: KHÔNG đọc lời của bé, chỉ ding + sáng rồi Sparky đáp */
  T.age = async (task) => {
    const a = abox(50);
    const btns = task.options.map(o => { const b = optCard(o.n, "num", "age"); a.appendChild(b); return b; });
    lock(true); await say(task.ask); setPose("listen"); lock(false);
    if (QA) field.dataset.answer = task.options[0].n;
    const stopN = nudge({ replay: () => say(task.ask), blink: btns });
    const id = await new Promise(res => btns.forEach(b => b.onclick = () => res(b.dataset.v))); stopN();
    const b = btns.find(x => x.dataset.v === id); b.classList.add("right"); burst(b); sfx.ding(); lock(true);
    await wait(500);
    const o = task.options.find(x => x.n === id); await say(o.reply, { pose: o.pose || "cheer" });
    progress(1); lock(false);
  };

  /* HOW MANY? — nhóm khối (cùng màu) trong khung vàng, chạm chữ số đúng; đúng → nghe số */
  T.count = async (task) => {
    lock(true); await say(task.ask);
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const q = qbox(30, `<img class="qgrp" src="${CW(it.show || it.n).img}" alt=""><div class="qrow"><b>How many?</b><button class="qspk always" aria-label="Nghe câu hỏi">🔊</button></div>`);
      const a = abox(62);
      const btns = it.options.map(d => { const b = optCard(d, "num"); a.appendChild(b); return b; });
      const prompt = () => play(L.howMany);
      $(".qspk", q).onclick = () => bplay(q, prompt);
      lock(true); setPose("talk"); q.classList.add("glow"); await prompt(); q.classList.remove("glow"); setPose("listen");
      const tries = await choose({ answer: it.n, buttons: btns, prompt, skill: task.skill, label: it.n, first,
        onRight: async () => { sfx.ding(); await word(it.n); await praise(); } });
      return tries;
    });
  };

  /* NGHE → CHẠM: số (chữ số) · màu (vệt màu) · hình (nhóm khối/vật) · chữ (từ CVC). it.audio = câu ghép (vd "How many?" + "Three!") */
  T.hearPick = async (task) => {
    lock(true); await say(task.ask);
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const a = abox(task.as === "pic" ? 50 : 56); if (it.options.length > 3) a.classList.add("wrap5");
      const btns = it.options.map(k => { const b = optCard(k, task.as, it.options.length > 3 ? "sm" : ""); a.appendChild(b); return b; });
      const prompt = (rate) => it.audio ? playSeq(it.audio, rate) : word(it.w, rate);
      const L1 = listen(prompt); lock(true); await L1.play();
      const tries = await choose({ answer: it.w, buttons: btns, prompt, skill: task.skill, label: it.label || it.w, first,
        onRight: async () => { sfx.ding(); if (!it.audio) await word(it.w); await praise(); } });
      L1.remove(); return tries;
    });
  };

  /* LISTEN & COLOUR (luật 29/10): mỗi câu MỘT vật (hình nét) + lệnh "Colour the banana yellow." → chạm hũ sơn đúng → vật được tô từ dưới lên */
  T.paint = async (task) => {
    lock(true); await say(task.ask);
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const q = qbox(32, `<div class="pframe"><img class="pline" src="media/c/${it.thing}-line.png" alt=""><img class="pfill" src="media/c/${it.thing}.png" alt=""></div>`);
      const a = abox(66);
      const btns = it.options.map(c => { const b = h(`<button class="card pot" data-v="${c}"><img src="media/c/pot-${c}.png" alt=""></button>`); a.appendChild(b); return b; });
      const prompt = (rate) => play(it.audio, { rate });
      const L1 = listen(prompt); lock(true); await L1.play();
      const tries = await choose({ answer: it.colour, buttons: btns, prompt, skill: task.skill, label: `${it.thing} → ${it.colour}`, first,
        onRight: async () => { sfx.whoosh(); $(".pframe", q).classList.add("filled"); await wait(900); await word(it.colour); await praise(); } });
      L1.remove(); return tries;
    });
  };

  /* DẠY MÀU (luật 29/10): mỗi màu một trang 4 đồ vật quen có màu đó → vệt màu + tên màu hiện dưới, đọc 2 lần, bé nói theo → ➜.
     grey: đồ vật xám trước, Sparky gọi tên màu thì màu quay lại (C2 Rainbow Land mất màu) */
  T.colourIntro = async (task) => {
    lock(true); await say(task.ask, { pose: "talk" });
    let k = 0;
    for (const p of task.pages) {
      field.innerHTML = "";
      const grid = at(h(`<div class="cthings ${task.grey ? "grey" : ""}" data-n="${p.things.length}">${p.things.map(t => `<div class="card cthing"><img src="media/c/${t}.png" alt=""></div>`).join("")}</div>`), 50, 28);
      sfx.pop(); await wait(900);
      const sw = at(h(`<div class="card cswatch reveal"><img src="${CW(p.c).img}" alt=""><b>${p.c}</b></div>`), 50, 57);
      if (task.grey) { grid.classList.remove("grey"); sfx.whoosh(); }
      burst(sw, 10);
      sw.classList.add("glow"); await word(p.c); await wait(500); await word(p.c); sw.classList.remove("glow");
      setPose("listen"); await echo(sw);
      sw.onclick = () => bplay(sw, () => word(p.c));
      k++; progress(k / task.pages.length);
      lock(false); await go("➜"); lock(true);
    }
    lock(false);
  };

  /* C2: "You brought the colours back!" — cuối chặng màu (luật 29/10: mở khoá màu TRƯỚC phonics): bé chạm từng vệt màu → nghe tên màu → cảnh có màu lại */
  T.colourBack = async (task) => {
    const row = at(h(`<div class="cback">${task.colours.map(c => `<button class="card swc" data-v="${c}"><img src="${CW(c).img}" alt=""></button>`).join("")}</div>`), 50, 46);
    const btns = $$(".swc", row);
    lock(true); await say(task.ask, { pose: "cheer" }); setPose("listen"); lock(false);
    let n = 0;
    if (QA) field.dataset.answer = task.colours[0];
    let stopN = nudge({ replay: () => say(task.ask), target: btns[0], blink: btns });
    await new Promise(res => btns.forEach(b => b.onclick = async () => {
      if (b.classList.contains("right") || app.classList.contains("busy")) return;
      stopN(); app.classList.add("busy"); b.classList.add("right"); burst(b, 8); sfx.pop(); await word(b.dataset.v); app.classList.remove("busy");
      n++; progress(n / btns.length);
      if (n >= btns.length) return res();
      const left = btns.filter(x => !x.classList.contains("right"));
      if (QA) field.dataset.answer = left[0].dataset.v;
      stopN = nudge({ replay: () => say(task.ask), target: left[0], blink: left });
    }));
    stopN(); lock(true);
    if (task.bg) { setBg(task.bg); const st = L.stages[stageNo]; if (st) st.bg = task.bg; }
    sfx.tada(); btns.forEach(b => burst(b, 6)); await wait(400);
    if (task.done) await say(task.done, { pose: "clap" });
    lock(false);
  };

  /* HỎI – ĐÁP màu/số (luật 29/10: hỏi màu → 2 vệt màu, hỏi số → 2 chữ số; trộn = 1 màu + 1 số, bé chọn câu hợp câu hỏi).
     mode "answer": nghe câu hỏi → nghe A, B → chạm A/B → nghe câu đúng → lượt bé nói (💡 câu mẫu).
     mode "ask" (bé tự hỏi): hình → chạm câu hỏi hợp hình (A/B có 🔊) → Sparky trả lời. */
  T.qa = async (task) => {
    lock(true); await say(task.ask);
    let k = 0;
    for (const it of task.items) {
      field.innerHTML = "";
      const asking = task.mode === "ask", qa = it.q === "many" ? L.howMany : L.whatColour, qText = it.q === "many" ? "How many?" : "What colour is it?";
      const grp = it.q === "many" || /^(g|eggs|dots|fps|n)\b|-\d+$/.test(it.show);
      const q = qbox(26, `<img class="${grp ? "qgrp" : "qimg"}" src="${CW(it.show).img}" alt="">` +
        (asking ? "" : `<div class="qrow"><b class="${qText.length > 12 ? "qlong" : ""}">${qText}</b><button class="qspk always" aria-label="Nghe câu hỏi">🔊</button></div>`));
      const opts = asking ? [["colour", "What colour is it?", () => play(L.whatColour)], ["many", "How many?", () => play(L.howMany)]]
        : [it.ans, it.wrong].map(x => [x, ansText(x), ansAudio(x)]);
      const order = opts.map((_, i) => i).sort(() => Math.random() - .5);
      const a = abox(60), btns = [], spks = [];
      order.forEach((oi, i) => {
        const [v, text] = opts[oi];
        const face = `<span class="abl">${i ? "B" : "A"}</span>`;   // C-2 (24/11 user): thẻ nghe CHỈ A/B + loa — không đưa màu/số vào đáp án
        const col = h(`<div class="abcol"><button class="abopt ${i ? "b" : "a"} cq" data-v="${v}">${face}<span class="abtx">${text}</span></button>
          <button class="abspk always" aria-label="Nghe">🔊</button></div>`);
        a.appendChild(col); btns.push($(".abopt", col)); spks.push($(".abspk", col));
      });
      const prompt = asking ? () => say(task.askLine || "c-which-q", { pose: "think" }) : () => play(qa);
      if (!asking) $(".qspk", q).onclick = () => bplay(q, prompt);
      spks.forEach((s, i) => s.onclick = () => bplay(btns[i], opts[order[i]][2]));
      lock(true); setPose("talk");
      if (!asking) { q.classList.add("glow"); await prompt(); q.classList.remove("glow"); } else await prompt();
      for (let i = 0; i < btns.length; i++) { btns[i].classList.add("glow"); await opts[order[i]][2](); btns[i].classList.remove("glow"); await wait(250); }
      setPose("listen");
      const answer = asking ? it.q : it.ans;
      await choose({ answer, buttons: btns, prompt, skill: task.skill, label: asking ? `${it.show}: ${qText}` : `${qText} → ${ansText(it.ans)}`, first: k === 0,
        onRight: async (b) => {
          sfx.ding(); b.classList.add("said");   // câu đáp hiện ra SAU khi bé chọn đúng
          if (asking) { await play(qa); await wait(250); await say(it.reply, { pose: "talk" }); }   // Sparky trả lời câu bé hỏi
          else { await ansAudio(it.ans)(); }
          await praise(); } });
      if (task.speak !== false) await sayTurnC(CW(it.show).img, asking ? qText : ansText(it.ans), asking ? () => play(qa) : ansAudio(it.ans), grp);
      k++; progress(k / task.items.length);
    }
  };
  /* lượt bé nói (giống speakTurn nhưng câu tuỳ ý: "It's red." · "Three!" · "How many?") */
  async function sayTurnC(src, text, audio, wide) {
    field.innerHTML = "";
    at(h(`<div class="card pic big ${wide ? "wideimg" : ""}"><img src="${src}" alt=""></div>`), 50, 30);
    const tip = at(h(`<div class="tipline">${text}</div>`), 50, 50); tip.classList.add("ghost");
    const row = at(h(`<div class="sayrow"><button class="side bulb always" aria-label="Gợi ý">💡</button><button class="mic" aria-label="Ghi âm">🎤</button><button class="side skipb" aria-label="Bỏ qua">⏭</button></div>`), 50, 65);
    const bulb = $(".bulb", row), mic = $(".mic", row), skip = $(".skipb", row);
    bulb.onclick = async () => { if (app.classList.contains("busy")) return; app.classList.add("busy"); tip.classList.remove("ghost"); tip.classList.add("reveal"); bulb.classList.add("glow"); await audio(); bulb.classList.remove("glow"); app.classList.remove("busy"); };
    lock(true); await say("fb-yourturn", { pose: "talk" }); setPose("listen"); lock(false);
    const stopN = nudge({ replay: () => say("fb-yourturn", { pose: "talk" }), target: mic, blink: [bulb] });
    await new Promise(res => {
      skip.onclick = () => { stopN(); sfx.tap(); res(); };
      mic.onclick = async () => { stopN();
        if (!navigator.mediaDevices?.getUserMedia || QA) return res();
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const rec = new MediaRecorder(stream), chunks = [];
          rec.ondataavailable = e => chunks.push(e.data);
          rec.onstop = async () => {
            stream.getTracks().forEach(t => t.stop()); mic.classList.remove("rec"); lock(true);
            const url = URL.createObjectURL(new Blob(chunks));
            await play(url); await wait(250); burst(mic); sfx.ding();
            tip.classList.remove("ghost"); await audio(); await praise(); lock(false); res();
          };
          mic.classList.add("rec"); duck(true); rec.start(); setTimeout(() => rec.state === "recording" && rec.stop(), 3000);
        } catch (e) { res(); }
      };
    });
  }

  /* ĐỌC CÂU → ĐÚNG/SAI (C5 lần đầu đọc câu): hình + câu hỏi + câu đáp (bé TỰ ĐỌC, không phát trước) → ✓ / ✗;
     chọn xong nghe cả hỏi–đáp; câu sai → câu đúng hiện ra + nghe câu đúng */
  T.readTick = async (task) => {
    lock(true); await say(task.ask);
    await runQueue(task.items, async (it, first) => {
      field.innerHTML = "";
      const ok = it.say === it.truth, qText = it.q === "many" ? "How many?" : "What colour is it?";
      const sayT = (k) => /^\d+$/.test(k) ? `${ansText(k).slice(0, -1)} (${k})!` : ansText(k);
      const q = qbox(30, `<img class="${it.q === "many" ? "qgrp" : "qimg"}" src="${CW(it.show).img}" alt=""><div class="rtq"><b class="rq">${qText}</b><b class="ra">${sayT(it.say)}</b></div>`);
      const a = at(h(`<div class="tickrow"><button class="tickb yes" data-v="yes" aria-label="Đúng">✓</button><button class="tickb no" data-v="no" aria-label="Sai">✗</button></div>`), 50, 64);
      const btns = $$(".tickb", a);
      const prompt = () => say(task.readLine || "c-read-it", { pose: "think" });
      setPose("listen"); lock(false);
      const tries = await choose({ answer: ok ? "yes" : "no", buttons: btns, prompt, skill: task.skill, label: `${it.show}: "${qText} — ${sayT(it.say)}"`, first,
        onRight: async () => {
          q.classList.add("glow"); await play(it.q === "many" ? L.howMany : L.whatColour); await wait(200);
          if (ok) { await ansAudio(it.say)(); q.classList.remove("glow"); await say("c-right", { pose: "thumbs" }); }
          else { q.classList.remove("glow"); await say("c-wrong", { pose: "talk" }); $(".ra", q).textContent = sayT(it.truth); $(".ra", q).classList.add("fixed"); q.classList.add("glow"); await ansAudio(it.truth)(); q.classList.remove("glow"); }
          await praise(); } });
      return tries;
    });
  };

  /* QA bố cục: thẻ/khung không chồng nhau, không đè viền khung, không ra ngoài màn, không đè Sparky */
  window.qaLayout = () => {
    const R = el => el.getBoundingClientRect(), A = R(app), bad = [];
    const hit = (a, b, pad = 0) => a.left < b.right - pad && b.left < a.right - pad && a.top < b.bottom - pad && b.top < a.bottom - pad;
    const name = el => el.className.split(" ").slice(0, 3).join(".") + (el.dataset.v ? "[" + el.dataset.v + "]" : "");
    const tops = [...field.children].filter(e => e.offsetParent && !e.classList.contains("moving") && !e.classList.contains("mapsvg") && getComputedStyle(e).visibility !== "hidden");
    for (let i = 0; i < tops.length; i++) for (let j = i + 1; j < tops.length; j++) if (hit(R(tops[i]), R(tops[j]), 2)) bad.push("chồng: " + name(tops[i]) + " × " + name(tops[j]));
    tops.forEach(e => { const r = R(e); if (r.left < A.left || r.right > A.right || r.top < A.top || r.bottom > A.bottom) bad.push("ra ngoài màn: " + name(e)); });
    $$(".qbox,.qframe,.vpanel", field).forEach(f => { const fr = R(f), bw = parseFloat(getComputedStyle(f).borderLeftWidth) || 0;
      [...f.querySelectorAll(":scope > *")].forEach(c => { if (!c.offsetParent || c.classList.contains("cloth")) return; const r = R(c);
        if (r.left < fr.left + bw + 1 || r.right > fr.right - bw - 1 || r.top < fr.top + bw + 1 || r.bottom > fr.bottom - bw - 1) bad.push("đè viền: " + name(c) + " trong " + name(f)); }); });
    // 24/11: phần tử con (bóng thoại, mảnh câu, ô chữ…) không được tràn ra ngoài khung chứa
    field.querySelectorAll(".bub,.chunk,.tile,.bslot,.lcell,.paddle,.pos,.tickb").forEach(e => { if (!e.offsetParent || getComputedStyle(e).visibility === "hidden") return;
      const box = e.closest(".vpanel,.qbox,.abox,.bslots,.bpool,.lgrid,.paddles,.posrow,.tickrow") || app, r = R(e), b = R(box);
      if (r.left < b.left - 1 || r.right > b.right + 1 || r.top < b.top - 1 || r.bottom > b.bottom + 1) bad.push("tràn khung: " + name(e) + " trong " + name(box)); });
    field.querySelectorAll(".card.lab b").forEach(t => { const c = t.closest(".card"), r = R(t), cr = R(c);
      if (c.offsetParent && getComputedStyle(t).display !== "none" && (r.left < cr.left - 1 || r.right > cr.right + 1)) bad.push("chữ tràn thẻ: " + name(c)); });
    if (!spk.classList.contains("hide") && !spk.classList.contains("onmap")) tops.forEach(e => { if (hit(R(spk), R(e), 6)) bad.push("đè Sparky: " + name(e)); });
    // W9 (18/11): thẻ/ô cạnh nhau phải cách ≥ 3 % bề ngang (chừa chỗ viền sáng, nhấp nháy) — đo cả thẻ trong khung
    const gapMin = A.width * .03, items = $$(".card,.abopt,.bub,.lcard,.slot,.bubbleL,.node", field).filter(e => e.offsetParent && !e.classList.contains("gone") && !e.classList.contains("obj") && getComputedStyle(e).visibility !== "hidden");
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = R(items[i]), b = R(items[j]), dx = Math.max(b.left - a.right, a.left - b.right), dy = Math.max(b.top - a.bottom, a.top - b.bottom);
      if (Math.max(dx, dy) < gapMin) bad.push("sát nhau: " + name(items[i]) + " × " + name(items[j]));
    }
    return bad;
  };

  /* ================= LUỒNG ================= */
  async function start() {
    document.title = `Sparky Review · ${L.id}`;
    hud.classList.add("map"); setBg(L.intro.frame); sparky(false); clear();
    const tc = h(`<div class="title-card"><div class="u">${L.unit}</div><h1>${L.id} · ${L.title}</h1></div>`); app.appendChild(tc);
    const p = at(h(`<button class="play" aria-label="Bắt đầu">▶</button>`), 50, 50);
    await new Promise(res => p.onclick = res);
    initAudio(); refreshVoices(); tc.remove(); field.innerHTML = "";
    // S1 (18/11): Sparky là hình rời trên cảnh (không vẽ sẵn) → bật dậy từ giường, nhún khi nói, đổi tư thế theo từng câu
    await heroEnter(L.intro.from || [22, 52]);
    const IPOSE = L.intro.poses || ["cheer", "wave", "talk"];
    for (let i = 0; i < L.intro.lines.length; i++) { await say(L.intro.lines[i], { pose: IPOSE[i % IPOSE.length] }); await wait(250); }
    setPose("idle");
    await go("➜", "wide");
    await map(0, true);
  }

  /* Sparky nhảy ra đứng giữa cảnh (màn mở đầu / kết bài) */
  async function heroEnter(from) {
    sparky(true, "hero"); setPose("idle");
    spk.style.transition = "none"; spk.style.left = from[0] + "%"; spk.style.bottom = (100 - from[1]) + "%"; spk.style.opacity = "0";
    void spk.offsetWidth; spk.style.transition = "";
    await wait(60); spk.style.opacity = "1";
    spk.classList.remove("hop"); void spk.offsetWidth; spk.classList.add("hop"); sfx.whoosh();
    spk.style.left = ""; spk.style.bottom = "";
    await wait(900);
  }

  function pathD(pts) { // Catmull-Rom → Bezier, toạ độ 0..100
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return d;
  }
  function placeSparkyOnMap(pt) { spk.style.left = pt[0] + "%"; spk.style.bottom = (100 - pt[1] + 3) + "%"; }

  async function map(i, fromStart = false) {
    stageNo = -1; exitIcon(); clear(); hud.classList.add("map"); setBg(L.map.bg); caption(null);
    app.appendChild(h(`<div class="chip">${(L.map.chip || L.unit.split("·").pop()).trim().toUpperCase()}</div>`));
    const M = L.map, keys = L.stages.map(s => s.key), P = (k) => img2f(M.nodes[k]), pts = [img2f(M.start), ...keys.map(P), img2f(M.goal)];
    field.insertAdjacentHTML("beforeend", `<svg class="mapsvg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="${pathD(pts)}" fill="none" stroke="#fff6e3" stroke-width="26" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity=".92"/>
      <path d="${pathD(pts)}" fill="none" stroke="#e9b97a" stroke-width="4" stroke-dasharray="2 14" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`);
    L.stages.forEach((s, k) => {
      const [x, y] = P(s.key);
      const st = done[k] ? "done" : k === i ? "now" : "lock";
      const n = at(h(`<button class="node ${st}" data-k="${k}">${st === "done" ? "✓" : st === "now" ? "▶" : "🔒"}</button>`), x, y);
      const lb = h(`<div class="nlabel">${s.label}</div>`); lb.style.left = x + "%"; lb.style.top = `calc(${y}% + 9.5cqw)`; field.appendChild(lb);
      if (st === "now") n.onclick = () => n.dispatchEvent(new CustomEvent("enter"));
    });
    at(h(`<div class="goal">🏁</div>`), ...img2f(M.goal));
    // Sparky nhảy từ điểm trước tới điểm hiện tại + câu nối
    sparky(true, "map"); setPose("wave");
    const prev = i === 0 ? img2f(M.start) : P(keys[i - 1]);
    const cur = i < keys.length ? P(keys[i]) : img2f(M.goal);
    placeSparkyOnMap(prev); await wait(fromStart ? 500 : 250);
    lock(true);
    const bridge = i < keys.length ? L.stages[i].bridge : null;
    const talk = bridge ? say(bridge, { pose: "talk" }) : (i > 0 && i < keys.length ? say("fb-next", { pose: "cheer" }) : Promise.resolve());
    spk.classList.remove("hop"); void spk.offsetWidth; spk.classList.add("hop"); sfx.whoosh(); placeSparkyOnMap(cur);
    await talk; await wait(400); lock(false);
    if (i >= keys.length) { sfx.tada(); await say("fb-letsgo", { pose: "cheer" }); return finish(); }
    setPose("wave");
    const node = $(`.node[data-k="${i}"]`);
    await new Promise(res => { node.addEventListener("enter", res, { once: true }); go("▶").then(res); });
    return stage(i);
  }

  async function stage(i) {
    const s = L.stages[i]; stageNo = i; exitIcon();
    clear(); hud.classList.remove("map"); setBg(s.bg); sparky(true); setPose("wave"); setBar(0);
    lock(true); await wait(500); await say(s.lead, { pose: "talk", after: "idle" });
    // ?task=N (duyệt): vào thẳng bài tập thứ N của chặng đầu tiên được mở (bỏ qua phần dạy)
    const t0 = QS.has("task") && !taskJumped ? Math.min(+QS.get("task") || 0, s.tasks.length - 1) : 0; taskJumped = true;
    for (let t = t0; t < s.tasks.length; t++) {
      clear(); taskFrac = [t, s.tasks.length]; progress(0);
      await T[s.tasks[t].kind](s.tasks[t]);
      progress(1);
      await wait(300);
    }
    clear(); lock(true); if (s.end) { sfx.tada(); await say(s.end, { pose: "cheer" }); } await wait(300); lock(false);
    done[i] = true; saveDone();
    return map(i + 1);
  }

  async function finish() {
    clear(); hud.classList.add("map"); setBg(L.finish.frame);
    await heroEnter([50, 60]);
    lock(true);
    const FPOSE = ["cheer", "wave"];
    for (let i = 0; i < L.finish.lines.length; i++) { await say(L.finish.lines[i], { pose: FPOSE[i % 2] }); await wait(200); }
    setPose("idle"); lock(false);
    const rep = lineOf(L.finish.reply);
    await go(`${rep.en} 💛`, "teal wide");
    lock(true); sfx.tada(); setPose("cheer"); burst(spk, 12); await wait(700); lock(false);   // V1: không đọc "You're welcome!" (lời của bé)
    await pickWear();
    try { sessionStorage.removeItem("spark-done-" + L.id); } catch (e) {}
    saveStars();
    report();
  }

  /* S4 (18/11): quà cuối bài = 1 trong 3 món đồ cho tủ đồ Sparky → bay lên đầu Sparky, Sparky cảm ơn; lưu để các bài sau Sparky vẫn mặc */
  async function pickWear() {
    const ids = (L.wear || []).filter(id => WR.ITEMS[id]);
    if (!ids.length) return;
    lock(true); await say("fb-sticker", { pose: "talk" }); setPose("listen"); lock(false);
    const xs = ids.map((_, i) => 50 + (i - (ids.length - 1) / 2) * 30);
    const btns = ids.map((id, i) => at(h(`<button class="card pic gift" data-v="${id}"><img src="${WR.ITEMS[id].img}" alt=""></button>`), xs[i], 30));
    if (QA) field.dataset.answer = ids[0];
    const stopN = nudge({ replay: () => say("fb-sticker", { pose: "talk" }), blink: btns });
    const id = await new Promise(res => btns.forEach(b => b.onclick = () => res(b.dataset.v))); stopN();
    lock(true);
    const b = btns.find(x => x.dataset.v === id); btns.filter(x => x !== b).forEach(x => x.classList.add("faded"));
    b.classList.add("glow"); burst(b, 16); sfx.ding(); await wait(500);
    wardrobe.have = [...new Set([...(wardrobe.have || []), id])];
    // món đồ bay lên đầu Sparky
    const sr = spk.getBoundingClientRect(), A = app.getBoundingClientRect();
    b.classList.add("fly");
    b.style.left = ((sr.left + sr.width / 2 - A.left) / A.width * 100) + "%"; b.style.top = ((sr.top - A.top) / A.height * 100 + 4) + "%"; b.style.scale = ".4"; b.style.opacity = "0";
    await wait(650); btns.forEach(x => x.remove());
    wardrobe.wearing = id; saveWardrobe();
    sfx.pop(); setPose("cheer"); burst(spk, 14);
    await say("fb-wear", { pose: "cheer" });
    lock(false);
    await go("➜", "wide");
  }

  /* trang tủ đồ (nút 👕 trên thanh): món đã có — chạm để Sparky mặc / cởi; ô chưa có = "?" */
  function openCloset() {
    if ($(".closet")) return;
    const have = wardrobe.have || [];
    const owned = Object.keys(WR.ITEMS).filter(id => have.includes(id));
    const cells = [...owned.map(id => `<button class="cell ${wardrobe.wearing === id ? "on" : ""}" data-v="${id}"><img src="${WR.ITEMS[id].img}" alt=""></button>`),
      ...Array.from({ length: Math.max(0, WR.slots - owned.length) }, () => `<div class="cell q">?</div>`)].join("");
    const was = { hide: spk.classList.contains("hide"), map: spk.classList.contains("onmap"), hero: spk.classList.contains("hero"), l: spk.style.left, b: spk.style.bottom };
    const ov = h(`<div class="closet"><div class="ctop"><b>Sparky's closet</b><button class="cx" aria-label="Đóng">✕</button></div><div class="cgrid">${cells}</div></div>`);
    app.appendChild(ov); sparky(true, "hero"); spk.classList.add("incloset"); say("fb-closet", { pose: "wave" });
    $$(".cell[data-v]", ov).forEach(c => c.onclick = () => {
      const id = c.dataset.v; wardrobe.wearing = wardrobe.wearing === id ? null : id; saveWardrobe();
      $$(".cell", ov).forEach(x => x.classList.toggle("on", x.dataset.v === wardrobe.wearing)); sfx.pop(); setPose("cheer");
    });
    $(".cx", ov).onclick = () => {
      ov.remove(); spk.classList.remove("incloset"); stopVoice();
      if (was.hide) sparky(false); else if (was.map) { sparky(true, "map"); spk.style.left = was.l; spk.style.bottom = was.b; } else sparky(true, was.hero ? "hero" : undefined);
      setPose("wave");
    };
  }
  $("#closet").onclick = () => { initAudio(); openCloset(); };

  /* sao bài (cho trang chính): tỉ lệ câu làm đúng NGAY lần đầu — ≥ 85 % = 3 ★, ≥ 60 % = 2 ★, xong bài = 1 ★ (giữ số cao nhất) */
  let lastStars = 1;
  function saveStars() {
    const n = log.length, ok = log.filter(r => r.tries <= 1).length, f = n ? ok / n : 1;
    lastStars = f >= .85 ? 3 : f >= .6 ? 2 : 1;
    const p = loadProg(); p.lessons ||= {}; const o = p.lessons[L.id] || {};
    p.lessons[L.id] = { stars: Math.max(o.stars || 0, lastStars), plays: (o.plays || 0) + 1, at: Date.now() };
    saveProg(p);
  }
  function report() {
    const bySkill = {};
    log.forEach(r => (bySkill[r.skill] ||= []).push(r));
    const rows = Object.entries(bySkill).map(([skill, rs]) => {
      const hard = [...new Set(rs.filter(r => r.tries > 1).map(r => r.item))];
      return `<tr><td>${skill}</td><td>${rs.length}</td><td>${hard.length ? "Thử nhiều lần: <b>" + hard.join(", ") + "</b>" : "Làm ngay lần đầu 👍"}</td></tr>`;
    }).join("");
    app.appendChild(h(`<div class="report">
      <h2>🎉 Con đã ôn xong ${L.id} · ${L.title}</h2><p class="sub">${L.unit} · <span class="rstars">${"★".repeat(lastStars)}${"☆".repeat(3 - lastStars)}</span></p>
      <h3>Hôm nay con đã ôn</h3><ul>${L.report.map(([a, b]) => `<li><b>${a}:</b> ${b}</li>`).join("")}</ul>
      <h3>Chi tiết</h3><table><tr><th>Phần</th><th>Số lượt</th><th>Ghi chú</th></tr>${rows}</table>
      <p class="note">Đây là số lần con thử, không phải điểm. Con có thể chạm nhầm hoặc được người lớn giúp.</p>
      <div class="tip">💡 <b>Gợi ý cho ba mẹ:</b> ${L.parentTip}</div>
      <div class="rbtns"><button class="go wide again">🔁 Chơi lại</button><button class="go wide teal home">🏠 Trang chính</button></div></div>`));
    $(".again").onclick = () => { location.href = location.pathname + "?l=" + LID + (QA ? "&qa" : ""); };
    $(".report .home").onclick = () => { location.href = HOME; };
  }

  /* ================= LƯU / CÀI ĐẶT ================= */
  function loadSettings() { const d = { aa: false, music: true }; try { return { ...d, ...JSON.parse(localStorage.getItem("spark-settings") || "{}") }; } catch (e) { return d; } }
  function saveSettings() { try { localStorage.setItem("spark-settings", JSON.stringify(settings)); } catch (e) {} }
  function loadDone() { try { return JSON.parse(sessionStorage.getItem("spark-done-" + L.id) || "{}"); } catch (e) { return {}; } }
  function saveDone() { try { sessionStorage.setItem("spark-done-" + L.id, JSON.stringify(done)); } catch (e) {} }
  function loadWardrobe() { try { return JSON.parse(localStorage.getItem("spark-wardrobe") || "{}"); } catch (e) { return {}; } }
  function saveWardrobe() { try { localStorage.setItem("spark-wardrobe", JSON.stringify(wardrobe)); } catch (e) {} placeWear(); }

  $("#aa").classList.toggle("on", settings.aa);
  app.classList.toggle("txt", settings.aa);
  $("#aa").onclick = () => { settings.aa = !settings.aa; saveSettings(); $("#aa").classList.toggle("on", settings.aa); app.classList.toggle("txt", settings.aa); if (!settings.aa) caption(null); };
  $("#music").classList.toggle("on", settings.music);
  $("#music").onclick = () => { settings.music = bgmOn = !bgmOn; saveSettings(); $("#music").classList.toggle("on", bgmOn); initAudio(); duck(false); };
  const reloadAt = (k) => { stopVoice(); for (let j = 0; j < k; j++) done[j] = true; for (let j = k; j < L.stages.length; j++) delete done[j]; saveDone();
    const q = new URLSearchParams(); q.set("l", LID); if (QA) q.set("qa", ""); q.set("stage", k); location.href = location.pathname + "?" + q.toString().replace("qa=", "qa"); };
  $("#exit").onclick = () => { if (stageNo >= 0) reloadAt(stageNo); else { stopVoice(); location.href = HOME; } };
  const exitIcon = () => { $("#exit").textContent = stageNo >= 0 ? "✕" : "🏠"; };
  const gear = $("#parent"); let holdT;
  gear.onpointerdown = () => { holdT = setTimeout(openParent, 900); };
  gear.onpointerup = gear.onpointerleave = () => clearTimeout(holdT);
  function openParent() {
    $("#jump").innerHTML = L.stages.map((s, k) => `<option value="${k}">Chặng ${k + 1} · ${s.vi}</option>`).join("") + `<option value="${L.stages.length}">Kết bài</option>`;
    $("#parentDlg").showModal();
  }
  $("#jumpGo").onclick = () => { $("#parentDlg").close(); reloadAt(+$("#jump").value); };

  // khởi động: ?stage=N → vào thẳng bản đồ (sau một chạm để mở âm thanh)
  if (QS.has("stage")) {
    const k = +QS.get("stage"); for (let j = 0; j < k; j++) done[j] = true; setBg(L.map.bg); hud.classList.add("map"); sparky(false);
    const p = at(h(`<button class="play" aria-label="Tiếp tục">▶</button>`), 50, 50);
    p.onclick = () => { initAudio(); refreshVoices(); field.innerHTML = ""; map(k); };
  } else start();

  /* QA: tự bấm đúng để soát luồng (chỉ khi ?qa) */
  if (QA) {
    window.qaAct = async () => {
      if (app.classList.contains("locked")) return "locked";
      const q = s => document.querySelector(s);
      for (const [sel, name] of [[".play", "play"], [".go:not(.again)", "go"], [".skipb", "skip-mic"], [".node.now", "node"]]) if (q(sel)) { q(sel).click(); return name; }
      const tc = q(".tcard"); if (tc && field.dataset.answer) { const an = field.dataset.answer, btn = tc.querySelector(an.includes("eye") || an === "name" ? ".eye" : ".ear"); field.dataset.answer = ""; btn.click(); return "teach"; }
      const c = q(".lcard:not(.done):not(.sm)") || (q(".lcard.sm .lb") && q(".lcard:not(.done)"));
      if (c) { if (app.classList.contains("busy")) return "busy"; c.querySelector(".eye").click(); await wait(60); c.querySelector(".ear").click(); return "letter " + c.dataset.l; }
      const a = field.dataset.answer;
      const b = $$("#field [data-v]").find(x => x.dataset.v === a && !x.classList.contains("gone") && !x.classList.contains("faded"));
      if (b) { b.click(); field.dataset.answer = ""; return "answer " + a; }
      return "idle";
    };
    window.qaRun = async (n, stopAt) => {
      const out = [];
      for (let k = 0; k < n; k++) { out.push(await qaAct()); await new Promise(r => setTimeout(r, 120)); if (stopAt && document.querySelector(stopAt)) { out.push("STOP@" + stopAt); break; } }
      return out.join(", ");
    };
  }
})();
