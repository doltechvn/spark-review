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
  function preload() { if (!ac) return; Object.values(L.letters).forEach(x => { bufCache[x.name] ||= fetch(x.name).then(r => r.arrayBuffer()).then(b => ac.decodeAudioData(b)); bufCache[x.sound] ||= fetch(x.sound).then(r => r.arrayBuffer()).then(b => ac.decodeAudioData(b)); }); }
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
  function hand(target) {
    const hd = h(`<div class="hand">👆</div>`); app.appendChild(hd);
    const r = target.getBoundingClientRect(), a = app.getBoundingClientRect();
    hd.style.left = (r.left - a.left + r.width / 2 - 18) + "px"; hd.style.top = (r.top - a.top + r.height * .55) + "px";
    target.classList.add("hint");
    return () => { hd.remove(); target.classList.remove("hint"); };
  }
  const PRAISE = ["fb-great", "fb-yay", "fb-super", "fb-wow"], RIGHT_POSE = ["thumbs", "cheer", "clap"];
  let praiseN = 0;
  async function praise() { const p = RIGHT_POSE[praiseN % 3]; const id = PRAISE[praiseN % PRAISE.length]; praiseN++; sfx.ding(); await say(id, { pose: p }); }

  /* ======== bé chờ lâu không chọn (user 17/11): 7 s → đọc lại + nhấp nháy các ô; 14 s → bàn tay chỉ ô đúng; sau đó cứ 10 s đọc lại ======== */
  function nudge({ replay, target = null, blink = [] }) {
    if (QA) return () => {};
    let t1, t2, t3, unhand = null, alive = true;
    const flash = () => blink.forEach(b => { b.classList.remove("blink"); void b.offsetWidth; b.classList.add("blink"); });
    const busyNow = () => app.classList.contains("locked") || app.classList.contains("busy");
    const again = async () => { if (!alive || busyNow()) return; app.classList.add("busy"); flash(); if (replay) await replay(); app.classList.remove("busy"); if (alive) setPose("listen"); };
    t1 = setTimeout(again, 7000);
    t2 = setTimeout(() => { if (!alive) return; if (target) unhand = hand(target); else flash(); again(); }, 14000);
    t3 = setTimeout(function rep() { again(); t3 = setTimeout(rep, 10000); }, 24000);
    return () => { alive = false; clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); if (unhand) unhand(); blink.forEach(b => b.classList.remove("blink")); };
  }

  /* ======== một câu hỏi chọn đáp án: gợi ý 3 bậc (nghe lại → mờ 1 đáp án sai → bàn tay chỉ) ======== */
  async function choose({ answer, buttons, prompt, skill, label, first, onRight, gate = null }) {
    const rec = { skill, item: label || answer, tries: 0 };
    if (QA) field.dataset.answer = answer;
    buttons.forEach(b => b.classList.add("opt"));   // W10: từng thẻ đáp án viền tím; G1: đúng = xanh lá, sai = đỏ
    let unhand = null;
    if (first) unhand = hand(buttons.find(b => b.dataset.v === answer));
    lock(false);
    let stopNudge = nudge({ replay: prompt, target: buttons.find(b => b.dataset.v === answer), blink: buttons });
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
          else { await say("fb-look", { pose: "talk" }); unhand = hand(buttons.find(x => x.dataset.v === answer)); }
          b.classList.remove("wrong"); setPose("listen"); lock(false);
          stopNudge = nudge({ replay: prompt, target: buttons.find(x => x.dataset.v === answer), blink: buttons.filter(x => !x.classList.contains("faded")) });
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
    // đọc thuộc: hết TÊN rồi hết ÂM
    field.innerHTML = "";
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
      const xs = [22, 50, 78];
      const btns = it.options.map((l, i) => at(h(`<button class="bubbleL" style="--d:${i * .45}s" data-v="${l}">${l}</button>`), xs[i], 57));
      const prompt = (rate) => letterName(it.name, rate);
      const L1 = listen(prompt); lock(true); await L1.play(); lock(true);
      const tries = await choose({ answer: it.name, buttons: btns, prompt, skill: task.skill, label: it.name.toUpperCase(), first,
        onRight: async (b) => { sfx.pop(); b.classList.add("popped"); await letterName(it.name); await wait(250); await praise(); } });
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
      for (const c of tray) { c.classList.add("glow"); await word(c.dataset.w); c.classList.remove("glow"); await wait(150); }
      await wait(500);
      const cloth = h(`<div class="cloth">🙈</div>`); q.appendChild(cloth); sfx.whoosh();
      await wait(1500);
      tray.find(c => c.dataset.w === round.hide).classList.add("gone");
      cloth.remove(); sfx.pop();
      const others = Object.keys(L.words).filter(w => !round.show.includes(w)).sort(() => Math.random() - .5).slice(0, 2);
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
      const tc = q(".tcard"); if (tc && field.dataset.answer) { const btn = tc.querySelector(field.dataset.answer.includes("eye") ? ".eye" : ".ear"); field.dataset.answer = ""; btn.click(); return "teach"; }
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
