/* ═══════════════════════════════════════════════════════════
   청해 — 화면 · 소리 · 흐름 (v6)
   ═══════════════════════════════════════════════════════════ */
(() => {
'use strict';
const C = CORE, JO = C.JO, $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString('ko-KR');
const css = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
const COL = { hanji: css('--hanji'), hanji2: css('--hanji-2'), hanji3: css('--hanji-3'), ink: css('--ink'), ink2: css('--ink-2'), ink3: css('--ink-3'), cheong: css('--cheong'), rok: css('--rok'), ju: css('--ju'), hwang: css('--hwang') };
const KEY = 'chunghae.v6.save', MKEY = 'chunghae.v2.meta';
const SEC_PER_DAY = .5, SPEEDS = [1, 2, 4];
const SEASON_BANNER = [
  ['冬', '겨울 · 북풍이 내려온다 — 당과 왜에서 신라로 돌아오기 좋다'],
  ['春', '봄 · 바람이 갈피를 못 잡는다 — 예상 일수가 자주 빗나간다'],
  ['夏', '여름 · 남풍이 올라온다 — 신라에서 당으로, 남쪽에서 북쪽으로. 늦여름엔 태풍'],
  ['秋', '가을 · 바람이 다시 돈다 — 북풍이 오면 남쪽 바다로 내려가기 좋다']
];
const VERDICT = { better: '적중!', right: '소문대로', worse: '값이 꺾였다', fake: '헛소문', unknown: '모르고 왔다' };
const CREW_CH = { helm: '곽', deck: '범', tongue: '아' };
const NARROW = () => innerWidth <= 860;
const S = () => C.S;

/* ─────────── 저장 ─────────── */
const META = (() => { const d = { runs: 0, best: 0, unlocked: {}, tut: false, sound: true }; try { return Object.assign(d, JSON.parse(localStorage.getItem(MKEY) || '{}')); } catch (e) { return d; } })();
const saveMeta = () => { try { localStorage.setItem(MKEY, JSON.stringify(META)); } catch (e) {} };
function saveGame() { const s = S(); if (!s || s.ended || s.mode !== 'port' || s.draft) return; try { const d = Object.assign({}, s); delete d.reveals; localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
function hasSave() { try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); return !!(d && d.v === 6 && !d.ended); } catch (e) { return false; } }
function loadGame() { try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!d || d.v !== 6) return false; d.battle = null; d.dive = null; d.reveals = []; d.ev = null; C.S = d; return true; } catch (e) { return false; } }
const dropSave = () => { try { localStorage.removeItem(KEY); } catch (e) {} };

/* ─────────── 소리 ─────────── */
const AU = {
  ctx: null, master: null, on: META.sound !== false, nb: null,
  init() { if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = this.on ? .8 : 0; this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 3; this.nb = this.ctx.createBuffer(1, len, this.ctx.sampleRate); const d = this.nb.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.ambient(); } catch (e) { this.ctx = null; } },
  set(on) { this.on = on; META.sound = on; saveMeta(); if (this.master) this.master.gain.setTargetAtTime(on ? .8 : 0, this.ctx.currentTime, .08); paintSoundIcon(); },
  tone(f, o = {}) { const c = this.ctx; if (!c) return; const { type = 'sine', dur = .4, gain = .15, attack = .006, when = 0, slide = 0 } = o; const t = c.currentTime + when;
    const osc = c.createOscillator(), g = c.createGain(); osc.type = type; osc.frequency.setValueAtTime(f, t); if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur); osc.connect(g); g.connect(this.master); osc.start(t); osc.stop(t + dur + .05); },
  noise(dur, o = {}) { const c = this.ctx; if (!c) return; const { freq = 900, q = 1, gain = .2, when = 0, type = 'bandpass' } = o; const t = c.currentTime + when;
    const src = c.createBufferSource(); src.buffer = this.nb; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = c.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); src.connect(f); f.connect(g); g.connect(this.master); src.start(t, Math.random() * 2); src.stop(t + dur + .05); },
  ambient() { const c = this.ctx; const src = c.createBufferSource(); src.buffer = this.nb; src.loop = true; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
    const g = c.createGain(); g.gain.value = .045; const lfo = c.createOscillator(); lfo.frequency.value = .09; const lg = c.createGain(); lg.gain.value = .03; lfo.connect(lg); lg.connect(g.gain);
    src.connect(f); f.connect(g); g.connect(this.master); src.start(); lfo.start(); },
  tok() { this.noise(.07, { freq: 1100, q: 7, gain: .5 }); this.tone(300, { dur: .09, gain: .08 }); },
  coin(m = 1) { const b = 740 * Math.min(1.9, Math.max(.85, .7 + m * .3)); this.tone(b, { type: 'triangle', dur: .3, gain: .1 }); this.tone(b * 1.5, { dur: .55, gain: .07, when: .06 }); this.tone(b * 2, { dur: .4, gain: .04, when: .11 }); },
  gong() { [98, 147.5, 196.4, 262, 329].forEach((f, i) => this.tone(f, { dur: 3.4 - i * .45, gain: .14 / (i + 1), attack: .01 })); this.noise(.3, { freq: 300, q: 1, gain: .08 }); },
  drum() { this.tone(110, { dur: .55, gain: .32, slide: .45 }); this.noise(.14, { freq: 180, q: 1, gain: .25 }); this.tone(110, { dur: .45, gain: .2, slide: .45, when: .32 }); },
  chime() { [659.3, 880].forEach((f, i) => this.tone(f, { dur: .7, gain: .07, when: i * .09 })); },
  flip() { this.noise(.09, { freq: 2600, q: .7, gain: .14, type: 'highpass' }); },
  good() { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, { dur: .55, gain: .07, when: i * .065 })); },
  bad() { this.tone(207, { type: 'triangle', dur: .6, gain: .13, slide: .66 }); },
  season() { [523.3, 587.3, 659.3, 784, 659.3, 587.3].forEach((f, i) => this.tone(f, { dur: .5, gain: .06, when: i * .16, attack: .04 })); },
  depart() { this.noise(.9, { freq: 600, q: .5, gain: .1, type: 'lowpass' }); this.tone(220, { dur: .8, gain: .05, slide: 1.3, attack: .2 }); },
  pay() { [392, 523.3, 659.3, 784, 1046.5].forEach((f, i) => this.tone(f, { type: 'triangle', dur: .6, gain: .07, when: i * .09 })); this.gong(); }
};
function paintSoundIcon() { $('sndWave').style.opacity = AU.on ? 1 : .15; $('bSound').setAttribute('aria-pressed', AU.on ? 'true' : 'false'); }

/* ─────────── 해도: 바탕 (한 번만) ─────────── */
const RS = innerWidth <= 860 ? 1.0 : 1.25, FS = .45;
const base = document.createElement('canvas'), fog = document.createElement('canvas');
base.width = Math.round(C.WORLD.w * RS); base.height = Math.round(C.WORLD.h * RS); fog.width = Math.round(C.WORLD.w * FS); fog.height = Math.round(C.WORLD.h * FS);
let baseReady = false;
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function paperTexture(g, w, h, r, n) { for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, a = r() * Math.PI, L = 3 + r() * 14; g.strokeStyle = `rgba(60,70,60,${.025 + r() * .04})`; g.lineWidth = .5 + r() * .6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  for (let i = 0; i < n / 2; i++) { g.fillStyle = `rgba(90,80,60,${r() * .06})`; g.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5); } }
function polyPath(g, poly, jitter, r) { g.beginPath(); for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 8)); for (let j = 0; j < n; j++) { const k = j / n; let x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k; if (jitter) { x += (r() - .5) * jitter; y += (r() - .5) * jitter; } i === 0 && j === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } } g.closePath(); }
function inPoly(x, y, poly) { let inside = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside; } return inside; }
function paintBase() {
  const g = base.getContext('2d'), r = rng(828); g.setTransform(RS, 0, 0, RS, 0, 0); const W = C.WORLD.w, H = C.WORLD.h;
  g.fillStyle = COL.hanji; g.fillRect(0, 0, W, H); paperTexture(g, W, H, r, 9000);
  const sea = g.createLinearGradient(600, 300, 1700, 2100); sea.addColorStop(0, 'rgba(118,163,150,.42)'); sea.addColorStop(1, 'rgba(62,120,128,.58)'); g.fillStyle = sea; g.fillRect(0, 0, W, H);
  for (const poly of Object.values(C.LAND)) { polyPath(g, poly, 0, r); g.lineJoin = 'round'; g.strokeStyle = 'rgba(232,227,211,.3)'; g.lineWidth = 40; g.stroke(); g.strokeStyle = 'rgba(232,227,211,.36)'; g.lineWidth = 16; g.stroke(); }
  g.lineCap = 'round';
  for (let row = 0, y = 8; y < H; y += 13, row++) for (let x = (row % 2) * 10; x < W; x += 20) {
    if (!C.seaAt(x, y)) continue;
    g.strokeStyle = `rgba(43,84,112,${.15 + r() * .08})`; g.lineWidth = .9; g.beginPath(); g.arc(x, y + 4, 7, Math.PI * 1.13, Math.PI * 1.87); g.stroke();
    g.strokeStyle = 'rgba(43,84,112,.08)'; g.lineWidth = .7; g.beginPath(); g.arc(x, y + 4, 4, Math.PI * 1.18, Math.PI * 1.82); g.stroke(); }
  for (const z of C.ZONES) { g.save(); g.beginPath(); g.arc(z.x, z.y, z.r, 0, 7); g.clip();
    g.strokeStyle = 'rgba(176,63,40,.22)'; g.lineWidth = 1.2; for (let d = -z.r * 2; d < z.r * 2; d += 9) { g.beginPath(); g.moveTo(z.x + d - z.r, z.y - z.r); g.lineTo(z.x + d + z.r, z.y + z.r); g.stroke(); } g.restore();
    g.setLineDash([6, 5]); g.strokeStyle = 'rgba(176,63,40,.6)'; g.lineWidth = 1.4; g.beginPath(); g.arc(z.x, z.y, z.r, 0, 7); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(176,63,40,.75)'; g.font = `22px ${css('--display')}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('海賊', z.x, z.y); }
  for (const [name, poly] of Object.entries(C.LAND)) { polyPath(g, poly, 1.6, r); g.fillStyle = '#dcd0a6'; g.fill(); g.save(); g.clip();
    const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(160,140,90,.10)'); sh.addColorStop(1, 'rgba(120,110,70,.16)'); g.fillStyle = sh; g.fillRect(0, 0, W, H); g.restore(); }
  g.save(); g.beginPath(); for (const poly of Object.values(C.LAND)) { poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); } g.clip(); paperTexture(g, W, H, r, 3000); g.restore();
  const peaks = { main: 260, kyushu: 22, honshu: 34, shikoku: 12, jeju: 5, taiwan: 6, okinawa: 3 };
  for (const [name, n] of Object.entries(peaks)) { const poly = C.LAND[name]; const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const m = n < 8 ? 7 : 18, gap = n < 8 ? 14 : 34, pts = [];
    for (let i = 0; i < n * 60 && pts.length < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); if (!inPoly(x, y, poly) || !inPoly(x - m, y, poly) || !inPoly(x + m, y, poly) || !inPoly(x, y - m, poly) || !inPoly(x, y + m, poly)) continue; if (pts.some(p => Math.hypot(p[0] - x, p[1] - y) < gap)) continue; pts.push([x, y]); }
    pts.sort((a, b) => a[1] - b[1]); for (const [x, y] of pts) mountain(g, x, y, n < 8 ? .8 : .9 + r() * .8, r); }
  for (const poly of Object.values(C.LAND)) { polyPath(g, poly, 1.3, r); g.strokeStyle = 'rgba(30,40,41,.82)'; g.lineWidth = 1.5; g.lineJoin = 'round'; g.stroke(); polyPath(g, poly, 2.6, r); g.strokeStyle = 'rgba(30,40,41,.2)'; g.lineWidth = .8; g.stroke(); }
  for (const [txt, lon, lat, size, kind] of C.LABELS) { const [x, y] = C.P(lon, lat); g.fillStyle = kind === 'land' ? 'rgba(30,40,41,.4)' : 'rgba(43,84,112,.42)'; g.font = `${size}px ${css('--display')}`; g.textAlign = 'center'; g.textBaseline = 'middle'; [...txt].forEach((ch, i) => g.fillText(ch, x, y + i * size * 1.05)); }
  g.strokeStyle = 'rgba(30,40,41,.6)'; g.lineWidth = 2.5; g.strokeRect(6, 6, W - 12, H - 12); g.lineWidth = .8; g.strokeRect(14, 14, W - 28, H - 28);
  const sx = 60, sy = H - 60; g.strokeStyle = COL.ink; g.lineWidth = 1.4; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 200, sy); for (let i = 0; i <= 4; i++) { g.moveTo(sx + i * 50, sy - (i % 2 ? 4 : 7)); g.lineTo(sx + i * 50, sy); } g.stroke();
  g.fillStyle = COL.ink; g.font = `16px ${css('--display')}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('五百里', sx, sy - 12);
  const nx = W - 70, ny = 70; g.fillStyle = COL.ju; g.fillRect(nx - 20, ny - 20, 40, 40); g.fillStyle = COL.hanji2; g.font = `28px ${css('--display')}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('北', nx, ny + 1);
  g.strokeStyle = COL.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(nx, ny + 28); g.lineTo(nx, ny + 70); g.stroke();
  baseReady = true;
}
function mountain(g, x, y, s, r) { g.save(); g.translate(x, y); g.scale(s, s);
  const peaks = [[-11, 3, 8], [-2, 0, 13], [8, 3, 9]];
  g.beginPath(); g.moveTo(-17, 6); for (const [px, , h] of peaks) { g.quadraticCurveTo(px - 4, 6 - h * .3, px, 6 - h); g.quadraticCurveTo(px + 4, 6 - h * .3, px + 6, 6); } g.closePath();
  g.fillStyle = `rgba(${86 + r() * 20},${128 + r() * 18},${96 + r() * 10},.88)`; g.fill(); g.strokeStyle = 'rgba(30,40,41,.55)'; g.lineWidth = .8; g.stroke(); g.restore(); }

/* ─────────── 해도: 안개(빈 종이) ─────────── */
function fogReset() { const g = fog.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#efebdf'; g.fillRect(0, 0, fog.width, fog.height); paperTexture(g, fog.width, fog.height, rng(7), 2600); }
function fogErase(x, y, r) { const g = fog.getContext('2d'); g.globalCompositeOperation = 'destination-out'; const X = x * FS, Y = y * FS, R = r * FS;
  const gr = g.createRadialGradient(X, Y, R * .45, X, Y, R); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(X, Y, R, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
function fogRebuild() { fogReset(); const s = S(); for (let cy = 0; cy < C.GH; cy++) for (let cx = 0; cx < C.GW; cx++) if (s.fog[cy * C.GW + cx]) fogErase(cx * C.CELL + C.CELL / 2, cy * C.CELL + C.CELL / 2, C.CELL * 1.6); s.reveals.length = 0; }
function fogPump() { const s = S(); if (!s || !s.reveals.length) return; for (const [x, y, r] of s.reveals) fogErase(x, y, r); s.reveals.length = 0; }

/* ─────────── 화면 크기 · 카메라 ─────────── */
const cv = $('map'), ctx = cv.getContext('2d'); let W = 0, H = 0, DPR = 1, AREA = { x: 0, y: 0, w: 1, h: 1 };
const cam = { x: 1000, y: 1000, z: 1, fit: 1, touched: 0, wide: false };
function relayout(recenter) {
  W = innerWidth; H = innerHeight; DPR = Math.min(2, devicePixelRatio || 1); cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const top = NARROW() ? 110 : 76, pan = $('panel'); let a = { x: 12, y: top, w: W - 24, h: H - top - 12 };
  if (!pan.hidden) { if (NARROW()) a.h = H - top - pan.getBoundingClientRect().height - 8; else a.w = W - 24 - 396; }
  AREA = a; cam.fit = Math.min(a.w / C.WORLD.w, a.h / C.WORLD.h);
  if (recenter) { cam.z = cam.wide ? cam.fit : defaultZoom(); const s = S(); if (s) { cam.x = s.x; cam.y = s.y; } }
  clampCam();
}
const defaultZoom = () => NARROW() ? Math.max(cam.fit, AREA.w / 560) : Math.max(cam.fit, Math.min(AREA.w / 1000, AREA.h / 760));
function clampCam() { cam.z = Math.max(cam.fit * .95, Math.min(cam.fit * 6, cam.z)); const hw = AREA.w / 2 / cam.z, hh = AREA.h / 2 / cam.z;
  cam.x = hw * 2 >= C.WORLD.w ? C.WORLD.w / 2 : Math.max(hw, Math.min(C.WORLD.w - hw, cam.x)); cam.y = hh * 2 >= C.WORLD.h ? C.WORLD.h / 2 : Math.max(hh, Math.min(C.WORLD.h - hh, cam.y)); }
const scx = () => AREA.x + AREA.w / 2, scy = () => AREA.y + AREA.h / 2;
const toS = (x, y) => [(x - cam.x) * cam.z + scx(), (y - cam.y) * cam.z + scy()];
const toW = (x, y) => [(x - scx()) / cam.z + cam.x, (y - scy()) / cam.z + cam.y];
let camGoal = null;
function lookAt(x, y, z) { camGoal = { x, y, z: z || cam.z }; }

/* ─────────── 해도 그리기 ─────────── */
const winds = Array.from({ length: 110 }, () => ({ x: 0, y: 0, life: 0, max: 1 }));
let mapAppear = {}, destPlan = null, routePick = 'main', trail = [], clock = 0, portAppear = {}, findAppear = {}, rumorPulse = {}, rivalMark = {};
function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#efebdf'; ctx.fillRect(0, 0, W, H);
  const s = S(); if (!baseReady) return;
  ctx.save(); ctx.translate(scx(), scy()); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
  ctx.drawImage(base, 0, 0, C.WORLD.w, C.WORLD.h);
  if (s) {
    ctx.lineCap = 'round'; const [vx0, vy0] = toW(AREA.x, AREA.y), [vx1, vy1] = toW(AREA.x + AREA.w, AREA.y + AREA.h);
    for (const p of winds) { if (p.life <= 0 || p.x < vx0 - 40 || p.x > vx1 + 40 || p.y < vy0 - 40 || p.y > vy1 + 40) { p.x = vx0 + Math.random() * (vx1 - vx0); p.y = vy0 + Math.random() * (vy1 - vy0); p.max = p.life = 1.4 + Math.random() * 1.8; continue; }
      const w = C.wind(s.t, p.x, p.y), k = Math.sin(Math.PI * (1 - p.life / p.max)); if (C.onLand(p.x, p.y)) continue; const L = (10 + w.str * 14) / Math.max(.6, cam.z) * .9;
      ctx.strokeStyle = `rgba(43,84,112,${.5 * k})`; ctx.lineWidth = 1.6 / cam.z; ctx.beginPath(); ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x - Math.cos(w.dir) * L * .5 + Math.sin(w.dir) * 2, p.y - Math.sin(w.dir) * L * .5 - Math.cos(w.dir) * 2, p.x - Math.cos(w.dir) * L, p.y - Math.sin(w.dir) * L); ctx.stroke(); }
    if (trail.length > 1) { ctx.strokeStyle = 'rgba(30,40,41,.55)'; ctx.lineWidth = 1.5 / cam.z; ctx.setLineDash([2 / cam.z, 5 / cam.z]); ctx.beginPath(); trail.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.lineTo(s.x, s.y); ctx.stroke(); ctx.setLineDash([]); }
    if (s.mode === 'sail' && s.path) { ctx.strokeStyle = 'rgba(30,40,41,.4)'; ctx.lineWidth = 1.4 / cam.z; ctx.setLineDash([6 / cam.z, 6 / cam.z]); ctx.beginPath(); ctx.moveTo(s.x, s.y); for (let i = s.seg + 1; i < s.path.length; i++) ctx.lineTo(...s.path[i]); ctx.stroke(); ctx.setLineDash([]); }
    if (destPlan) { const routes = [['main', destPlan.main], ['alt', destPlan.alt]].filter(r => r[1]);
      for (const [id, r] of routes) { const on = routePick === id; ctx.strokeStyle = id === 'main' ? COL.ju : COL.cheong; ctx.globalAlpha = on ? 1 : .35; ctx.lineWidth = (on ? 2.6 : 1.6) / cam.z; ctx.setLineDash([8 / cam.z, 6 / cam.z]); ctx.lineDashOffset = on ? -clock * 18 / cam.z : 0;
        ctx.beginPath(); r.path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.globalAlpha = 1; }
      const [ex, ey] = destPlan.main.path[destPlan.main.path.length - 1]; ctx.strokeStyle = COL.ju; ctx.lineWidth = 1.8 / cam.z; ctx.beginPath(); ctx.arc(ex, ey, (10 + Math.sin(clock * 4) * 2) / cam.z, 0, 7); ctx.stroke(); }
    for (const z of C.ZONES) { const r = C.zoneR(z); if (r <= z.r + 1) continue; ctx.save(); ctx.beginPath(); ctx.arc(z.x, z.y, r, 0, 7); ctx.arc(z.x, z.y, z.r, 0, 7, true); ctx.fillStyle = 'rgba(176,63,40,.13)'; ctx.fill();
      ctx.setLineDash([6 / cam.z, 5 / cam.z]); ctx.lineDashOffset = -clock * 10 / cam.z; ctx.strokeStyle = 'rgba(176,63,40,.75)'; ctx.lineWidth = 1.8 / cam.z; ctx.beginPath(); ctx.arc(z.x, z.y, r, 0, 7); ctx.stroke(); ctx.restore(); }
  }
  fogPump(); ctx.drawImage(fog, 0, 0, C.WORLD.w, C.WORLD.h);
  ctx.restore();
  if (!s) return;
  drawTargets(s); drawMissed(s); drawMarks(s); drawQuestMarks(s); drawRivals(s); drawShip(s);
}
function seal(x, y, ch, size, rot, alpha) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha; ctx.fillStyle = COL.ju; ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.strokeStyle = COL.hanji2; ctx.lineWidth = 1.2; ctx.strokeRect(-size / 2 + 2.5, -size / 2 + 2.5, size - 5, size - 5);
  ctx.fillStyle = COL.hanji2; ctx.font = `${Math.round(size * .62)}px ${css('--display')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, 1); ctx.restore(); }
function label(txt, x, y, size, col, font) { ctx.font = `${size}px ${font || css('--ui')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(242,238,226,.9)'; ctx.lineWidth = 3.5; ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y); }
function glyphDot(x, y, r, g, alpha) { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = g.col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = COL.hanji2; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = COL.hanji2; ctx.font = `${Math.round(r * 1.25)}px ${css('--display')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(g.ch, x, y + .5); ctx.restore(); }
let hoverPort = null;
const onScreen = (x, y, m = 60) => x > -m && y > -m && x < W + m && y < H + m;
const news = { fest: {}, key: '' };
function drawMarks(s) {
  const nk = s.news.map(n => n.id + n.e).join() + Math.floor(s.t); if (news.key !== nk) { news.key = nk; news.fest = {}; for (const n of C.liveNews()) if (n.festival) news.fest[n.festival] = 1; }
  const sz = NARROW() ? 20 : 24, small = cam.z < cam.fit * 1.6;
  for (const f of C.FINDS) { if (!s.found[f.id]) continue; const [x, y] = toS(f.x, f.y); if (!onScreen(x, y)) continue; const a = Math.min(1, (performance.now() - (findAppear[f.id] || 0)) / 600);
    ctx.globalAlpha = a; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; if (!small) label(f.name, x, y + 7, 12, COL.ink2, css('--display')); }
  for (const k of C.PORT_IDS) { if (s.known[k] || !C.revealed(C.PORTS[k].x, C.PORTS[k].y)) continue; const [x, y] = toS(C.PORTS[k].x, C.PORTS[k].y); if (!onScreen(x, y)) continue;
    ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = COL.ju; ctx.lineWidth = 1.2; ctx.strokeRect(x - sz / 2, y - sz / 2, sz, sz); ctx.restore(); ctx.fillStyle = COL.ju; ctx.font = `${sz * .6}px ${css('--display')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x, y + 1); }
  for (const k of C.PORT_IDS) { if (!s.known[k]) continue; const P = C.PORTS[k]; const [x, y] = toS(P.x, P.y); if (!onScreen(x, y, 120)) continue;
    const t = Math.min(1, (performance.now() - (portAppear[k] || 0)) / 700), e = t < 1 ? 1 + (1 - t) * 1.6 : 1;
    if (s.at === k && s.mode === 'port') { ctx.strokeStyle = COL.ju; ctx.globalAlpha = .45 + Math.sin(clock * 3) * .2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, sz * .95 + Math.sin(clock * 3) * 2, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    if (hoverPort === k) { ctx.fillStyle = 'rgba(30,40,41,.12)'; ctx.beginPath(); ctx.arc(x, y, sz, 0, 7); ctx.fill(); }
    seal(x, y, P.ch, sz * e, ((P.x * 7 + P.y) % 9 - 4) * .012, Math.min(1, t * 1.6));
    if (s.orders.some(o => o.to === k)) { ctx.strokeStyle = COL.cheong; ctx.lineWidth = 2; ctx.strokeRect(x - sz / 2 - 4, y - sz / 2 - 4, sz + 8, sz + 8); }
    label(P.name, x, y + sz / 2 + 4, NARROW() ? 12 : 13, COL.ink, css('--ui'));
    if (cam.z > cam.fit * 1.25) { const n = P.prod.length, gy = y + sz / 2 + (NARROW() ? 24 : 26); P.prod.forEach((id, i) => glyphDot(x + (i - (n - 1) / 2) * 15, gy, 6.5, C.G[id], .95)); }
    if (C.isClosed(k)) { ctx.save(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - sz * .7, y - sz * .7); ctx.lineTo(x + sz * .7, y + sz * .7); ctx.moveTo(x + sz * .7, y - sz * .7); ctx.lineTo(x - sz * .7, y + sz * .7); ctx.stroke(); ctx.restore();
      ctx.fillStyle = COL.ink; ctx.fillRect(x - sz / 2 - 22, y - 9, 18, 18); ctx.fillStyle = COL.hanji2; ctx.font = `12px ${css('--display')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('閉', x - sz / 2 - 13, y + 1); }
    else if (news.fest[k]) { const bx = x - sz / 2 - 13, by = y - sz / 2 + 2; ctx.fillStyle = COL.hwang; ctx.beginPath(); ctx.arc(bx, by, 9 + Math.sin(clock * 4), 0, 7); ctx.fill(); ctx.fillStyle = COL.hanji2; ctx.font = `11px ${css('--display')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('祭', bx, by + .5); }
    if (s.at !== k || s.mode !== 'port') { const cand = [];
      for (const g of C.GOODS) { const inf = C.infoFor(k, g.id); if (!inf) continue; const ratio = inf.price / (g.base * .93); if (ratio >= 1.25) cand.push({ g, ratio, age: Math.floor(s.t) - inf.day }); }
      cand.sort((a, b) => b.ratio - a.ratio).slice(0, 2).forEach((c, i) => { const al = c.age < 15 ? 1 : c.age < 40 ? .62 : .34; const bx = x + sz / 2 + 12 + i * 19, by = y - sz / 2 + 4;
        glyphDot(bx, by, 8.5, c.g, al); ctx.globalAlpha = al; ctx.fillStyle = COL.rok; ctx.font = `bold 9px ${css('--ui')}`; ctx.textAlign = 'center'; ctx.fillText('▲', bx + 7, by - 8); ctx.globalAlpha = 1; }); }
    const rm = rivalMark[k]; if (rm && s.t - rm.t < 12) { ctx.globalAlpha = Math.max(.2, .9 - (s.t - rm.t) / 14); ctx.fillStyle = rm.col; ctx.font = `bold 12px ${css('--display')}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(`${rm.ch}▼${C.G[rm.id].ch}`, x - sz / 2 - 5, y); ctx.globalAlpha = 1; }
    if (rumorPulse[k] && performance.now() - rumorPulse[k] < 2200) { const q = (performance.now() - rumorPulse[k]) / 2200; ctx.strokeStyle = COL.cheong; ctx.globalAlpha = 1 - q; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, sz + q * 34, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
  }
}
function boatOn(g, x, y, hd, sc, hull, sail, mast) { g.save(); g.translate(x, y); g.rotate(hd); g.scale(sc, sc);
  g.fillStyle = 'rgba(30,40,41,.16)'; g.beginPath(); g.ellipse(1, 3, 15, 6, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(16, 0); g.quadraticCurveTo(6, -7, -11, -6); g.lineTo(-13, 0); g.lineTo(-11, 6); g.quadraticCurveTo(6, 7, 16, 0); g.closePath(); g.fillStyle = hull; g.fill();
  g.save(); g.translate(1, 0); g.rotate(mast || 0); g.beginPath(); g.moveTo(-2, -13); g.quadraticCurveTo(4, -6, 3, 0); g.quadraticCurveTo(4, 6, -2, 13); g.lineTo(-4, 13); g.lineTo(-4, -13); g.closePath();
  g.fillStyle = sail; g.fill(); g.strokeStyle = 'rgba(30,40,41,.7)'; g.lineWidth = .8; g.stroke(); g.beginPath(); for (let i = -9; i <= 9; i += 4.5) { g.moveTo(-4, i); g.lineTo(3, i * .92); } g.stroke(); g.restore(); g.restore(); }
const boat = (...a) => boatOn(ctx, ...a);
function drawRivals(s) {
  for (const R of s.rivals) { if (!C.revealed(R.x, R.y)) continue; const def = C.RIVALS.find(r => r.id === R.id); let [x, y] = toS(R.x, R.y); if (!onScreen(x, y)) continue;
    if (R.at) { x += 18; y -= 14; }
    const pirate = def.kind === 'pirate'; boat(x, y, R.heading || 0, (NARROW() ? .8 : .95), pirate ? '#1e2829' : '#4a3a2c', pirate ? '#3a3f40' : def.col, 0);
    ctx.fillStyle = pirate ? COL.ju : def.col; ctx.beginPath(); ctx.arc(x, y - 20, 9, 0, 7); ctx.fill(); ctx.fillStyle = COL.hanji2; ctx.font = `bold 11px ${css('--display')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(def.ch, x, y - 19.5);
    if (cam.z > cam.fit * 1.4 && !R.at && R.dest) label(`→ ${C.PORTS[R.dest].name}${R.good ? ' · ' + C.G[R.good].name : ''}`, x, y + 12, 11, def.col);
    if (pirate && s.mode === 'sail') { const d = Math.hypot(R.x - s.x, R.y - s.y); if (R.chasing) { ctx.strokeStyle = COL.ju; ctx.lineWidth = 2; ctx.globalAlpha = .5 + Math.sin(clock * 10) * .4; ctx.beginPath(); ctx.arc(x, y, 24 + Math.sin(clock * 10) * 3, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; label('추격', x, y + 14, 11, COL.ju); } else if (d < 140) { ctx.strokeStyle = COL.ju; ctx.globalAlpha = .4 + Math.sin(clock * 6) * .3; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; } } } }
function drawShip(s) {
  let [x, y] = toS(s.x, s.y); let hd = s.heading || -Math.PI / 2; if (s.mode === 'port') { x -= 30; y += 4; hd = -Math.PI / 2 - .5; }
  const sc = (NARROW() ? .9 : 1.05) * (1 + s.tier * .12), bob = Math.sin(clock * 2.6) * .05;
  if (s.mode === 'sail') { ctx.fillStyle = 'rgba(242,238,226,.7)'; for (let i = 1; i <= 5; i++) { const d = i * 7 * sc; ctx.globalAlpha = .5 - i * .08; ctx.beginPath(); ctx.ellipse(x - Math.cos(hd) * d, y - Math.sin(hd) * d, 3 + i, 1.6 + i * .4, hd, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  const w = C.wind(s.t, s.x, s.y), sa = s.mode === 'port' ? 0 : Math.max(-.6, Math.min(.6, C.angDiff(w.dir, hd) * .35));
  if (s.rowing && s.mode === 'sail') { ctx.save(); ctx.translate(x, y); ctx.rotate(hd); ctx.scale(sc, sc); ctx.strokeStyle = '#3b2e22'; ctx.lineWidth = 1.6; const ph = Math.sin(clock * 9) * .45;
    for (const side of [-1, 1]) for (const ox of [-6, 2, 10]) { ctx.beginPath(); ctx.moveTo(ox, side * 5); ctx.lineTo(ox - 6 + ph * 6, side * 15); ctx.stroke(); } ctx.restore(); }
  boat(x, y, hd + bob * .3, sc, '#3b2e22', s.mode === 'port' ? '#a98c58' : '#d3ae62', sa);
  if (s.mode !== 'port') { ctx.strokeStyle = COL.ju; ctx.lineWidth = 1.2; ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(x, y, 22 * sc, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
}

/* ─────────── 지도 조작 ─────────── */
const ptrs = new Map(); let drag = null, pinch0 = null;
cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); camGoal = null;
  if (ptrs.size === 1) drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, moved: false };
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: cam.z }; drag = null; } });
cv.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) { const s = S(); if (s && e.pointerType === 'mouse') { const k = portAt(e.clientX, e.clientY); hoverPort = k; cv.style.cursor = k ? 'pointer' : 'crosshair'; } return; }
  ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (pinch0 && ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); cam.z = pinch0.z * d / pinch0.d; cam.touched = performance.now(); clampCam(); return; }
  if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (!drag.moved && Math.hypot(dx, dy) > 7) { drag.moved = true; cv.classList.add('dragging'); }
    if (drag.moved) { cam.x = drag.cx - dx / cam.z; cam.y = drag.cy - dy / cam.z; cam.touched = performance.now(); clampCam(); } } });
const endPtr = e => { const was = drag; ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch0 = null; cv.classList.remove('dragging');
  if (was && !was.moved && ptrs.size === 0 && e.type === 'pointerup') tapMap(e.clientX, e.clientY); if (ptrs.size === 0) drag = null; };
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', e => { e.preventDefault(); camGoal = null; const [wx, wy] = toW(e.clientX, e.clientY); cam.z *= Math.exp(-e.deltaY * .0015); clampCam(); const [nx, ny] = toW(e.clientX, e.clientY); cam.x += wx - nx; cam.y += wy - ny; cam.touched = performance.now(); clampCam(); }, { passive: false });
function portAt(x, y) { const s = S(); if (!s) return null; let best = null, bd = 26; for (const k of C.PORT_IDS) { if (!s.known[k]) continue; const [px, py] = toS(C.PORTS[k].x, C.PORTS[k].y); const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = k; } } return best; }
function tapMap(x, y) {
  const s = S(); if (!s || s.ended || anyModal() || !$('sTitle').hidden) return; AU.init(); hideMenu();
  if (s.mode === 'sail') { toast('항해 중이다. 도착하면 다음 행선지를 고를 수 있다.'); return; }
  const tg = targetAt(x, y); if (tg && !portAt(x, y)) { const p = C.plan(tg); if (p) { showDest(p); return; } }
  const k = portAt(x, y);
  if (k) { if (k === s.at && s.mode === 'port') { openPanel(); return; } const p = C.plan(k); if (!p) { toast('그곳으로 가는 물길을 찾지 못했다.', 'bad'); return; } if (p.closedPort) { toast(`<b>${C.PORTS[k].name}</b>은 포구를 닫았다 — ${p.news ? p.news.title + ', ' + Math.ceil(p.news.e - s.t) + '일 뒤 연다' : '지금은 못 들어간다'}.`, 'bad'); return; } showDest(p); return; }
  const [wx, wy] = toW(x, y);
  if (wx < 0 || wy < 0 || wx > C.WORLD.w || wy > C.WORLD.h) return;
  if (C.onLand(wx, wy)) { toast('육지다. 바다를 눌러야 한다.'); return; }
  if (!C.seaAt(wx, wy)) { toast('해안에 너무 가깝다. 조금 더 바다 쪽을 누르자.'); return; }
  const p = C.plan({ x: wx, y: wy }); if (!p) { toast('그곳으로 가는 물길을 찾지 못했다.', 'bad'); return; } showDest(p);
}

/* ─────────── 상단 계기 ─────────── */
const last = {};
const setText = (id, v) => { if (last[id] !== v) { last[id] = v; $(id).textContent = v; } };
function paintHud() {
  const s = S(); if (!s) return; paintTracker();
  setText('hDate', C.dateStr(s.t)); setText('hSeason', `${C.SEASONS[C.seasonOf(s.t)]} · ${C.monsoon(s.t).name}`); setText('hGold', fmt(s.gold));
  const q = C.quotaNow(), dd = Math.ceil(C.daysToDue()); setText('hQuota', fmt(q)); setText('hDue', `${dd}일 뒤`);
  const qk = (s.gold >= q) + ':' + (dd <= 15); if (last.qr !== qk) { last.qr = qk; $('hQuotaBox').classList.toggle('ok', s.gold >= q); $('hQuotaBox').classList.toggle('urgent', s.gold < q && dd <= 15); }
  const slotKey = C.capacity() + ':' + s.slots.map(x => x.id).join(',');
  if (last.slots !== slotKey) { last.slots = slotKey; $('hSlots').innerHTML = Array.from({ length: C.capacity() }, (_, i) => { const it = s.slots[i]; return it ? `<span class="slot full" style="background:${C.G[it.id].col}">${C.G[it.id].ch}</span>` : '<span class="slot"></span>'; }).join(''); }
  const th = Math.round(s.threat); if (last.th !== th) { last.th = th; $('hThreat').querySelector('b').textContent = th; $('hThreat').querySelector('s').style.width = th + '%'; $('hThreat').classList.toggle('hot', th >= 60); }
  const hu = Math.round(s.hull / s.hullMax * 100); if (last.hu !== hu) { last.hu = hu; $('hHull').querySelector('b').textContent = Math.round(s.hull); $('hHull').querySelector('s').style.width = hu + '%'; }
  const live = C.liveNews(); const ck = s.crew.map(c => `${c.k}${c.asked ? 1 : 0}${c.done ? 1 : 0}${c.alive ? 1 : 0}`).join('') + JSON.stringify(s.boons) + live.map(n => n.id).join() + Object.keys(s.relics || {}).join();
  if (last.crew !== ck) { last.crew = ck; const nb = Object.values(s.boons).reduce((a, b) => a + b, 0);
    $('crew').innerHTML = s.crew.map(c => { const d = C.CREW.find(x => x.k === c.k); const cls = !c.alive ? 'gone' : c.done ? 'done' : c.asked ? 'ask' : '';
      const tip = !c.alive ? '이제 없다.' : c.done ? `부탁을 들어줬다. ${d.perk}` : c.asked ? `부탁: "${d.ask}"<br>→ ${d.hint}` : '아직 말이 없다.';
      return `<button class="mate ${cls}" aria-label="${d.name}">${CREW_CH[c.k]}<span class="tip"><b>${d.name}</b> · ${d.role}<br>${tip}</span></button>`; }).join('')
      + (live.length ? `<button class="mate newsbtn" aria-label="세상 소식 ${live.length}개">報<span class="tip"><b>세상 소식</b><br>${live.map(n => `· ${n.title} <small>(${Math.max(1, Math.ceil(n.e - s.t))}일)</small>`).join('<br>')}</span></button>` : '')
      + (Object.keys(s.relics || {}).length ? `<button class="mate relicbtn" aria-label="유물">寶<span class="tip"><b>유물 ${Object.keys(s.relics).length}/${C.RELICS.length}</b><br>${C.RELICS.filter(r => s.relics[r.id]).map(r => `${r.ch} ${r.name} — ${r.text}`).join('<br>')}</span></button>` : '')
      + (nb ? `<button class="mate boonsbtn" aria-label="특권 ${nb}개">特<span class="tip"><b>특권</b><br>${Object.entries(s.boons).map(([id, n]) => { const b = C.BOONS.find(x => x.id === id); return `${b.ch} ${b.name}${n > 1 ? ' ×' + n : ''} — ${b.text}`; }).join('<br>')}</span></button>` : ''); }
  if (s.mode === 'sail' && s.path && s.path[s.seg + 1]) { let rem = Math.hypot(s.path[s.seg + 1][0] - s.x, s.path[s.seg + 1][1] - s.y); for (let i = s.seg + 1; i < s.path.length - 1; i++) rem += Math.hypot(s.path[i + 1][0] - s.path[i][0], s.path[i + 1][1] - s.path[i][1]);
    const st = Math.round(s.stamina), sk = st + ':' + s.rowing; if (last.st !== sk) { last.st = sk; const rb = $('sbRow'); if (rb) { rb.classList.toggle('on', !!s.rowing); rb.disabled = st <= 3 && !s.rowing; rb.querySelector('s').style.width = st + '%'; rb.querySelector('em').textContent = s.rowing ? '젓는 중' : st <= 3 ? '지쳤다' : '노 저어라'; } }
    const ch = s.rivals.some(R => R.chasing); if (last.ch !== ch) { last.ch = ch; $('sailbar').classList.toggle('chased', ch); }
    const days = s.spd > 1 ? rem / s.spd : 0; const el = $('sbRem'); if (el) el.textContent = `${days > .1 ? `남은 약 ${Math.max(1, Math.round(days))}일` : '곧 닿는다'} · ${C.windWord(s.windDeg || 0)}${C.inZone(s.x, s.y) ? ' · 해적 해역' : ''}`; }
}

/* ─────────── 알림 · 팝 · 띠 ─────────── */
function toast(msg, kind) { journal(msg, kind); const el = document.createElement('div'); el.className = 'toast ' + (kind || ''); el.innerHTML = msg; $('toasts').appendChild(el); setTimeout(() => el.remove(), 3600); while ($('toasts').children.length > 3) $('toasts').firstChild.remove(); }
function pop(txt, x, y, kind) { const el = document.createElement('div'); el.className = 'pop ' + (kind || ''); el.textContent = txt; el.style.left = x + 'px'; el.style.top = y + 'px'; document.body.appendChild(el); setTimeout(() => el.remove(), 1400); }
const popAt = (el, txt, kind) => { const r = el.getBoundingClientRect(); pop(txt, r.left + r.width / 2, r.top + r.height / 2, kind); };
function banner(big, small) { $('bnBig').textContent = big; $('bnSmall').textContent = small; const b = $('banner'); b.hidden = false; const d = b.firstElementChild; d.style.animation = 'none'; void d.offsetWidth; d.style.animation = ''; clearTimeout(banner.t); banner.t = setTimeout(() => b.hidden = true, 2800); }
const anyModal = () => ['mEvent', 'mReveal', 'mStory', 'mQuota', 'sEnd', 'mRetire2', 'mBattle', 'mDive', 'mBook'].some(id => !$(id).hidden);

/* ─────────── 첫 판 안내 ─────────── */
let coachStep = -1;
const COACH = [
  '여기는 청해진. 위의 <b>상납</b>이 목표다 — 계절이 끝나는 날까지 그만큼 모아야 한다. 먼저 싼 <b>인삼</b> 상자를 싣자.',
  '적산에서 인삼을 비싸게 산다는 소문이 있다. 지도에서 <b>적산(赤)</b> 도장을 눌러보자. 지도는 끌어서 옮기고 휠로 키운다.',
  '빨간 점선이 지름길이다. 붉은 빗금(<b>海賊</b>)을 지나면 해적을 만나기 쉽다. 파란 길은 돌아가는 길. 골라서 <b>출항</b>.',
  '배는 알아서 간다. 역풍이거나 해적이 쫓아오면 <b>노 저어라</b>(Space). 해도의 금빛 <b>寶</b> 원은 보물 자리 — 원 안으로 몰면 잠수한다.',
  '소문이 맞았을까? 상자가 하나씩 열린다. <b>팔고 내린다</b>.',
  '잘했다. 항구마다 <b>그곳에서만</b> 할 수 있는 일이 있고, <b>報</b>는 바다 너머 소식, 위의 <b>장부</b>(B)에는 항구별 시세·이야기·탐험 도감이 있다. 상납을 내면 <b>특권</b>을 고른다. <b>흰 종이</b>는 아직 아무도 그리지 않은 바다 — 숨은 항구는 값이 두 배다.'
];
/* 안내가 떠 있으면 알림은 안내 아래로 내려간다 — 안내 길이가 화면마다 달라 실제 높이로 잰다 */
function placeToasts() { const c = $('coach'); $('toasts').style.top = c.hidden ? '' : `${Math.round(c.getBoundingClientRect().bottom + 8)}px`; }
function showCoach(on) { $('coach').hidden = !on; document.body.classList.toggle('coaching', on); placeToasts(); }
function coach(step) { if (META.tut || coachStep >= step || coachStep === -2) return; coachStep = step; $('coachText').innerHTML = COACH[step]; showCoach(true);
  if (step === 5) { setTimeout(() => { if (coachStep === 5) { showCoach(false); META.tut = true; saveMeta(); } }, 10000); } }
$('coachSkip').onclick = () => { showCoach(false); coachStep = -2; META.tut = true; saveMeta(); };

/* ─────────── 항구 장부 ─────────── */
let lastQuote = null, panelMin = false;
function openPanel() { const p = $('panel'); p.hidden = false; panelMin = false; p.classList.remove('min'); $('pGrab').textContent = '접기'; paintPanel(); relayout(false); }
function closePanel() { $('panel').hidden = true; relayout(false); }
$('pHead').onclick = () => { if (!NARROW()) return; panelMin = !panelMin; $('panel').classList.toggle('min', panelMin); $('pGrab').textContent = panelMin ? '펼치기' : '접기'; relayout(false); };
function tagFor(pct) { return pct <= 80 ? ['cheap', '싸다'] : pct >= 130 ? ['dear', '비싸다'] : ['mid', '보통']; }
function gl(g, cls) { return `<span class="glyph ${cls || ''}" style="background:${g.col}">${g.ch}</span>`; }
function paintPanel() {
  const s = S(); if (!s || s.mode !== 'port') return; const k = s.at, P = C.PORTS[k]; C.tickMarket(k); const m = s.markets[k], d = Math.floor(s.t);
  $('pSeal').textContent = P.ch; $('pName').textContent = P.name; $('pSub').textContent = `${P.nation} · 정박 중`;
  const free = C.freeSlots();
  const tiles = m.stock.map(id => { const g = C.G[id], pr = C.cratePrice(k, id), pct = C.pctOf(k, id), [tc, tl] = tagFor(pct), b = C.activeBoom(k, id, d);
    return `<button class="good" data-buy="${id}" ${!free || s.gold < pr ? 'disabled' : ''}>${gl(g)}<span class="tagl ${tc}">${tl}</span><span class="nm">${g.name}</span><span class="pr">${fmt(pr)}<small> 냥</small></span>${b ? `<span class="boom">${b.slump ? '남아돈다' : '유행'}</span>` : ''}</button>`; }).join('');
  const wants = C.topDemand(k, 3).map(id => `<span class="want">${gl(C.G[id])}${C.G[id].name} <b>${fmt(C.sellPrice(k, id) * C.LOT)}</b></span>`).join('');
  const hold = s.slots.length ? s.slots.map((it, i) => { const g = C.G[it.id], now = C.sellPrice(k, it.id) * C.LOT, pl = now - it.cost;
      const be = bestElsewhere(it.id);
      return `<div class="crate">${gl(g)}<div class="gr">${g.name} · 산 값 <b>${fmt(it.cost)}</b><br>여기서 <b>${fmt(now)}</b> <span class="${pl >= 0 ? 'up' : 'dn'}">${pl >= 0 ? '+' : ''}${fmt(pl)}</span>${be ? `<br><small class="hint ${be.price * C.LOT > now ? 'up' : ''}">▲ ${C.PORTS[be.k].name} ${fmt(be.price * C.LOT)} <span>(${C.ago(be.day)})</span></small>` : ''}</div><button class="btn" data-sell="${i}">판다</button></div>`; }).join('')
    : '<p class="fine" style="text-align:left;margin:0">선창이 비었다.</p>';
  const off = s.offers[k], ords = s.orders;
  const offerHtml = off && !off.none ? `<div class="order">${gl(C.G[off.good])}<span class="gr"><b>${C.PORTS[off.to].name}</b>까지 ${C.G[off.good].name} <b>${off.n}상자</b> · ${off.days}일 안에<br><span class="up">보수 ${fmt(off.reward)}냥</span></span><button class="btn blue" data-act="accept" ${ords.length >= 2 ? 'disabled' : ''}>${ords.length >= 2 ? '두 건까지' : '맡는다'}</button></div>` : '<p class="fine" style="text-align:left;margin:0">지금 이 항구엔 맡길 일이 없다.</p>';
  const ordHtml = ords.map(o => { const have = s.slots.filter(x => x.id === o.good).length, left = Math.ceil(o.due - s.t);
    return `<div class="order mine">${gl(C.G[o.good])}<span class="gr"><b>${C.PORTS[o.to].name}</b>로 ${C.G[o.good].name} ${o.n}상자 <span class="${have >= o.n ? 'up' : 'dn'}">(${have}/${o.n})</span> · <span class="${left <= 10 ? 'dn' : ''}">${left}일 남음</span> · ${fmt(o.reward)}냥</span></div>`; }).join('');
  const pas = s.passenger ? `<div class="order mine"><span class="glyph" style="background:var(--ink-2)">客</span><span class="gr">승객 — ${s.passenger.who}를 <b>${C.PORTS[s.passenger.to].name}</b>까지 · <span class="${s.passenger.due - s.t <= 10 ? 'dn' : ''}">${Math.ceil(s.passenger.due - s.t)}일 남음</span></span></div>` : '';
  const n = C.nextShip(), rc = C.repairCost();
  const acts = [
    `<button class="act" data-act="repair" ${!rc || s.gold < rc ? 'disabled' : ''}><b>배 수리</b><small>${rc ? fmt(rc) + '냥' : '멀쩡하다'}</small></button>`,
    n ? `<button class="act" data-act="ship" ${s.gold < C.shipPrice() ? 'disabled' : ''}><b>${n.name}${JO(n.name,'으로','로')} 바꾼다</b><small>${C.shipPrice() < n.price ? `<s>${fmt(n.price)}</s> ` : ''}${fmt(C.shipPrice())}냥 · 상자 ${n.slots + (s.boons.hold || 0)}칸</small></button>` : `<button class="act" disabled><b>${C.ship().name}</b><small>가장 큰 배</small></button>`,
    C.canTribute() ? `<button class="act" data-act="tribute" ${s.gold < C.tributeCost() ? 'disabled' : ''}><b>조정에 바친다</b><small>${fmt(C.tributeCost())}냥 · 경계 -30</small></button>` : `<button class="act" disabled><b>조정</b><small>${s.cap === 'tomo' ? '왜 사람은 바칠 수 없다' : '청해진·울산에서만'}</small></button>`
  ].join('');
  const tabsDef = [['market', '시장', 0], ['port', '항구', C.liveNews().length ? '·' : 0], ['work', '일거리', (off && !off.none && ords.length < 2 ? 1 : 0) + (s.bOffers[k] && !s.bOffers[k].none && !s.bounty ? 1 : 0) + (C.mainGoals().some(g => g.pay && !g.done && g.pay.k === k) ? 1 : 0)], ['tavern', '선술집', C.tavern(k).offer.length]];
  const body = panelTab === 'market' ? `
    <div class="sec"><h3>시장 — 한 상자 ${C.LOT}묶음<span>빈 칸 ${free} · Shift/길게 눌러 가득</span></h3><div class="goods">${tiles}</div></div>
    <div class="sec"><h3>이 항구가 비싸게 사는 것</h3><div class="wants">${wants}</div></div>
    <div class="sec"><h3>내 짐<span>▲ 아는 곳 중 가장 비싼 곳</span></h3><div class="hold">${hold}</div></div>`
    : panelTab === 'port' ? `${specialHtml(k)}<div class="sec"><h3>배와 조정</h3><div class="acts">${acts}</div></div>${newsHtml()}`
    : panelTab === 'work' ? `<div class="sec"><h3>본 이야기</h3>${mainBox(k)}</div>${targetsHtml(k)}<div class="sec"><h3>의뢰<span>맡은 일 ${ords.length}/2</span></h3>${offerHtml}${ordHtml || pas ? `<div class="hold" style="margin-top:6px">${ordHtml}${pas}</div>` : ''}</div>`
    : tavernHtml(k);
  $('pBody').innerHTML = `<div class="ptabs">${tabsDef.map(([id, l, b]) => `<button class="${panelTab === id ? 'on' : ''}" data-ptab="${id}">${l}${b ? `<i>${b === '·' ? '' : b}</i>` : ''}</button>`).join('')}</div>${body}`;
  $('pLeft').textContent = `상납까지 ${Math.ceil(C.daysToDue())}일`;
}
let spNote = null;
function specialHtml(k) { const s = S(), sp = C.specialInfo(k); if (!sp) return ''; let btns = '';
  if (sp.kind === 'store') { btns = (sp.store.length ? sp.store.map((it, i) => `<button class="chipbtn" data-take="${i}" ${C.freeSlots() ? '' : 'disabled'}>${gl(C.G[it.id])}꺼낸다</button>`).join('') : '<small class="fine">창고가 비었다.</small>')
      + (s.slots.length && sp.store.length < sp.max ? s.slots.map((it, i) => `<button class="chipbtn" data-put="${i}">${gl(C.G[it.id])}맡긴다</button>`).join('') : ''); }
  else if (sp.kind === 'swap') btns = sp.can ? s.slots.map((it, i) => `<button class="chipbtn" data-swap="${i}">${gl(C.G[it.id])}→ 貝貝</button>`).join('') : `<button class="btn" disabled>${sp.why}</button>`;
  else if (sp.passive) btns = '<span class="chip fair">배 값 25% 할인</span><span class="chip fair">수리 반값</span>';
  else btns = `<button class="btn blue" data-sp="1" ${sp.can ? '' : 'disabled'}>${sp.can ? sp.label : sp.why}</button>`;
  const extra = sp.kind === 'store' ? `<span>${sp.store.length}/${sp.max}</span>` : '';
  return `<div class="sec"><h3>이 항구에서만${extra}</h3><div class="special"><span class="sch">${sp.ch}</span><b>${sp.name}</b><small>${sp.desc}</small><div class="sbtns">${btns}</div>${spNote && spNote.k === k ? `<div class="quote" style="grid-column:1/-1;margin-top:6px">${spNote.text}</div>` : ''}</div></div>`; }
function newsHtml() { const s = S(), live = C.liveNews(); if (!live.length) return '';
  return `<div class="sec"><h3>세상 소식</h3><ul class="newsl">${live.map(n => `<li><b>${n.title}</b><span class="num">${Math.max(1, Math.ceil(n.e - s.t))}일</span><small>${n.text}</small></li>`).join('')}</ul></div>`; }
$('pBody').addEventListener('click', e => {
  const s = S(); if (!s || s.mode !== 'port') return; AU.init(); const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.buy) { if (longFired) { longFired = false; return; } if (e.shiftKey) { buyMax(b.dataset.buy, b); return; } const r = C.buy(b.dataset.buy); if (!r.ok) { toast(r.msg); return; } AU.tok(); popAt(b, `-${fmt(r.cost)}`, 'bad'); after(); if (coachStep === 0) coach(1); return; }
  if (b.dataset.sell != null) { const r = C.sell(+b.dataset.sell); if (!r) return; saleFx([r], b); after(); runStories(); return; }
  if (b.dataset.ptab) { panelTab = b.dataset.ptab; paintPanel(); $('pBody').scrollTop = 0; return; }
  if (b.dataset.hire) { const r = C.hireMate(b.dataset.hire); if (!r.ok) { toast(r.text || '안 된다'); return; } AU.good(); toast(r.text, 'good'); after(); return; }
  if (b.dataset.fire) { const m = C.fireMate(b.dataset.fire); if (m) toast(`${m.name}이 배에서 내렸다.`); after(); return; }
  if (b.dataset.dice) { const [bet, guess] = b.dataset.dice.split(':'); const r = C.rollDice(+bet, guess); if (!r.ok) { toast(r.text); return; } diceFx(r); return; }
  if (b.dataset.act === 'mainpay') { const g = C.mainPay(s.at); if (g) { AU.pay(); toast(`${g.text} — 냈다.`, 'good'); } after(); runStories(); return; }
  if (b.dataset.look) { const t = b.dataset.look === 'b' ? s.bounty : s.maps[+b.dataset.look.slice(1)]; if (t) lookAt(t.x, t.y, Math.max(cam.z, cam.fit * 1.6)); return; }
  if (b.dataset.act === 'bounty') { const bo = C.acceptBounty(s.at); if (bo) { AU.drum(); toast(`현상 수배를 맡았다 — <b>${bo.name}</b>. 해도의 붉은 원으로 가면 맞닥뜨린다.`, 'bad'); lookAt(bo.x, bo.y, Math.max(cam.z, cam.fit * 1.4)); } after(); return; }
  if (b.dataset.sp || b.dataset.put != null || b.dataset.take != null || b.dataset.swap != null) {
    const arg = b.dataset.put != null ? { put: +b.dataset.put } : b.dataset.take != null ? { take: +b.dataset.take } : b.dataset.swap != null ? +b.dataset.swap : undefined;
    const r = C.useSpecial(s.at, arg); if (!r.ok) { toast(r.text || '지금은 안 된다'); return; }
    if (r.sale) saleFx([r.sale], b); else if (r.sales && r.sales.length) saleFx(r.sales, b); else if (r.good) AU.good(); else AU.tok();
    if (b.dataset.put == null && b.dataset.take == null) spNote = { k: s.at, text: r.text }; else toast(r.text);
    if (r.order) rumorPulse[r.order.to] = performance.now(); if (r.dive) { after(); openDive(); return; } after(); runStories(); return; }
  const a = b.dataset.act;
  if (a === 'accept') { const o = C.acceptOffer(s.at); if (o) { AU.chime(); toast(`의뢰를 맡았다 — ${C.PORTS[o.to].name}까지 ${C.G[o.good].name} ${o.n}상자, ${o.days}일 안에.`, 'good'); } after(); return; }
  if (a === 'rumor') { const r = C.buyRumor(); if (!r.ok) { toast(r.msg); return; } AU.chime(); lastQuote = `“${r.text.line}”`; if (r.map) { mapAppear[r.map.id] = performance.now(); toast(`寶 보물 지도 — <b>${r.map.name}</b>`, 'good'); } if (r.text.k) rumorPulse[r.text.k] = performance.now(); after(); return; }
  if (a === 'repair') { const c = C.repair(); if (c) { AU.tok(); toast(`배를 손봤다. ${fmt(c)}냥`); } after(); return; }
  if (a === 'ship') { const n = C.upgrade(); if (n) { AU.gong(); banner('船', `${n.name} — 상자 ${C.capacity()}칸`); } after(); return; }
  if (a === 'tribute') { const c = C.tribute(); if (c) { AU.chime(); toast(`조정에 ${fmt(c)}냥을 바쳤다. 경계가 가라앉는다.`, 'good'); } after(); return; }
});
let longT = null, longFired = false;
$('pBody').addEventListener('pointerdown', e => { const b = e.target.closest('[data-buy]'); if (!b || b.disabled) return; longFired = false; clearTimeout(longT); longT = setTimeout(() => { longFired = true; buyMax(b.dataset.buy, b); }, 480); });
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => $('pBody').addEventListener(ev, () => clearTimeout(longT)));
function buyMax(id, b) { let n = 0, sum = 0; while (C.freeSlots()) { const r = C.buy(id); if (!r.ok) break; n++; sum += r.cost; } if (!n) { toast('돈이나 자리가 모자란다'); return; } AU.tok(); setTimeout(() => AU.tok(), 90); popAt(b, `${n}상자 -${fmt(sum)}`, 'bad'); after(); if (coachStep === 0) coach(1); }
function diceFx(r) { const cup = $('dcup'); if (!cup) return; const F = '⚀⚁⚂⚃⚄⚅'; AU.noise(.5, { freq: 900, q: 3, gain: .2 }); cup.classList.add('shake'); let n = 0;
  const iv = setInterval(() => { cup.innerHTML = `<span>${F[Math.floor(Math.random() * 6)]}</span><span>${F[Math.floor(Math.random() * 6)]}</span>`; if (++n > 8) { clearInterval(iv); cup.classList.remove('shake'); cup.innerHTML = `<span>${F[r.a - 1]}</span><span>${F[r.b - 1]}</span>`;
    if (r.win) AU.coin(1.6); else AU.bad(); journal(`홀짝 — ${r.a}+${r.b}=${r.a + r.b} ${r.even ? '짝' : '홀'}. ${r.win ? `+${fmt(r.pay)}냥` : `${fmt(r.pay)}냥`}`);
    setTimeout(() => { paintHud(); paintPanel(); const d = $('dres'); if (d) { d.innerHTML = `${r.a} + ${r.b} = <b>${r.a + r.b}</b> · ${r.even ? '짝' : '홀'} — ${r.win ? `<b class="up">+${fmt(r.pay)}냥</b>` : `<b class="dn">${fmt(r.pay)}냥</b>`}`; } const c2 = $('dcup'); if (c2) c2.innerHTML = `<span>${F[r.a - 1]}</span><span>${F[r.b - 1]}</span>`; }, 350); } }, 70); }
function saleFx(results, anchor) { results.forEach((r, i) => { setTimeout(() => { AU.coin(r.mult);
    const el = anchor || $('hGold'); const rc = el.getBoundingClientRect(); pop(`${r.profit >= 0 ? '+' : ''}${fmt(r.profit)}${r.mult >= 1.5 ? `  ×${r.mult.toFixed(1)}` : ''}`, rc.left + rc.width / 2 + (i % 3 - 1) * 40, rc.top - 10 - i * 6, r.profit < 0 ? 'bad' : r.mult >= 2 ? 'big' : ''); }, i * 160); });
  const r0 = results[results.length - 1]; if (r0) toast(`${C.PORTS[S().at].name} ${C.G[r0.id].name} 시세 ${r0.pct0}% → <b>${r0.pct1}%</b> — 내가 풀어서 눌렸다${results.some(r => r.threat >= 1) ? ` · 경계 +${Math.round(results.reduce((a, r) => a + r.threat, 0))}` : ''}`);
  if (results.length && results[results.length - 1].combo >= 3) setTimeout(() => pop(`연속 흑자 ${results[results.length - 1].combo}`, innerWidth / 2, innerHeight * .4, 'big'), results.length * 160 + 100); }
function after() { paintHud(); paintPanel(); const s = S(); if (s.ended) { finish(); return; } handle(C.portTick()); saveGame(); }

/* ─────────── 행선지 카드 ─────────── */
function routeRow(id, r, lab) { const wcls = r.wind === '순풍' ? 'fair' : r.wind === '역풍' ? 'head' : 'side';
  return `<button class="route ${routePick === id ? 'on' : ''} ${id}" data-route="${id}"><b>${lab}</b><span class="chip ${wcls}">${r.wind}</span><span class="chip plain num">약 ${Math.max(1, Math.round(r.days))}일</span>${r.zones.length ? `<span class="chip head">${r.zones.map(z => z.name).join(' · ')}</span>` : '<span class="chip fair">안전</span>'}</button>`; }
function showDest(p, keepPick) {
  const s = S(); destPlan = p; if (!keepPick) routePick = p.alt && s.slots.length >= 3 ? 'alt' : 'main'; const P = p.port && C.PORTS[p.port]; let rows = '';
  if (P) { rows = `<li class="pw"><span>● 나는 것 ${P.prod.map(id => gl(C.G[id]) + C.G[id].name).join(' ')}</span><span>▲ 비싸게 산다 ${P.want.map(id => gl(C.G[id]) + C.G[id].name).join(' ')}</span></li>`;
    if (s.slots.length) { const byId = {}; s.slots.forEach(it => { (byId[it.id] = byId[it.id] || []).push(it); });
      rows += Object.entries(byId).map(([id, arr]) => { const g = C.G[id], inf = C.infoFor(p.port, id), cost = arr.reduce((a, x) => a + x.cost, 0) / arr.length;
        if (!inf) return `<li>${gl(g)}<span>${g.name} ×${arr.length} — 이 항구 값은 모른다</span></li>`;
        const v = inf.price * C.LOT, pl = v - cost; return `<li>${gl(g)}<span>${g.name} ×${arr.length} — ${inf.src} <b class="num">${fmt(v)}</b> <span style="color:var(--ink-3)">(${C.ago(inf.day)})</span> <span class="${pl >= 0 ? 'up' : 'dn'} num">${pl >= 0 ? '+' : ''}${fmt(pl)}</span></span></li>`; }).join(''); }
    else { const known = C.GOODS.map(g => ({ g, inf: C.infoFor(p.port, g.id) })).filter(x => x.inf).sort((a, b) => b.inf.price / b.g.base - a.inf.price / a.g.base).slice(0, 3);
      rows += known.length ? known.map(({ g, inf }) => `<li>${gl(g)}<span>${g.name} — ${inf.src} <b class="num">${fmt(inf.price * C.LOT)}</b> <span style="color:var(--ink-3)">(${C.ago(inf.day)})</span></span></li>`).join('') : '<li><span>이 항구에 대해 아는 게 없다.</span></li>'; }
    if (s.passenger && s.passenger.to === p.port) rows += `<li><span class="glyph" style="background:var(--ink-2)">客</span><span>승객 — ${s.passenger.who}를 내려주면 <b class="up">사례</b></span></li>`;
    rows += s.orders.filter(o => o.to === p.port).map(o => `<li>${gl(C.G[o.good])}<span>의뢰 — ${C.G[o.good].name} ${o.n}상자 넘기면 <b class="up">${fmt(o.reward)}냥</b></span></li>`).join(''); }
  else { const end = p.main.path[p.main.path.length - 1], tn = targetNear(end[0], end[1]);
    rows = tn ? (tn.kind === 'map' ? `<li><span class="glyph" style="background:var(--hwang)">寶</span><span><b>${tn.m.name}</b> — 금빛 원 안에 닿으면 잠수한다.</span></li>` : `<li><span class="glyph" style="background:var(--ju)">${tn.b.ch}</span><span><b>${tn.b.name}</b>의 출몰 해역 — 닿으면 해전이다. 현상금 <b class="up">${fmt(tn.b.reward)}냥</b></span></li>`)
      : `<li><span>${C.revealed(end[0], end[1]) ? '해도에 그려진 바다다.' : '아직 아무도 그리지 않은 바다다. 무엇이 있는지는 가봐야 안다.'}</span></li>`; }
  const routes = p.alt ? routeRow('main', p.main, '지름길') + routeRow('alt', p.alt, '돌아가는 길') : routeRow('main', p.main, p.main.zones.length ? '이 길뿐이다' : '뱃길');
  const r = p.alt && routePick === 'alt' ? p.alt : p.main;
  const rc = p.port ? C.racers(p.port) : [];
  const warn = [...rc.map(x => `<span class="chip head">${x.ch} ${x.name}도 이리 온다 · 약 ${Math.max(1, Math.round(x.days))}일${x.good ? ' · ' + C.G[x.good].name : ''}</span>`), s.escort ? '<span class="chip fair">수군 호위 — 해적이 안 붙는다</span>' : '', s.blessed ? '<span class="chip fair">법화원 축복 — 폭풍이 비켜 간다</span>' : '', r.days > C.daysToDue() && s.gold < C.quotaNow() ? '<span class="chip head">상납 날까지 못 닿는다 — 돈이 모자라면 짐을 7할에 넘긴다</span>' : '', s.hull < s.hullMax * .4 ? '<span class="chip head">선체가 약하다</span>' : ''].join('');
  const tn0 = !P && targetNear(...p.main.path[p.main.path.length - 1]);
  $('dest').innerHTML = `<h4>${P ? `<span class="seal">${P.ch}</span>${P.name}` : tn0 ? (tn0.kind === 'map' ? '<span class="seal" style="background:var(--hwang)">寶</span>보물 자리로' : `<span class="seal">${tn0.b.ch}</span>${tn0.b.name} 잡으러`) : (C.revealed(...p.main.path[p.main.path.length - 1]) ? '이 바다로' : '안개 속으로')}</h4>
    <div class="routes">${routes}</div>${warn ? `<div class="chips">${warn}</div>` : ''}<ul>${rows}</ul><div class="row"><button class="btn" id="dCancel">그만둔다</button><button class="btn main" id="dGo">출항</button></div>`;
  $('dest').hidden = false; $('dCancel').onclick = hideDest; $('dGo').onclick = () => go(p);
  $('dest').querySelectorAll('[data-route]').forEach(b => b.onclick = () => { routePick = b.dataset.route; showDest(p, true); });
  if (NARROW() && !$('panel').hidden) { panelMin = true; $('panel').classList.add('min'); $('pGrab').textContent = '펼치기'; relayout(false); }
  if (!keepPick) { const end = p.main.path[p.main.path.length - 1]; const mx = (s.x + end[0]) / 2, my = (s.y + end[1]) / 2, span = Math.max(Math.abs(end[0] - s.x) / (AREA.w * .75), Math.abs(end[1] - s.y) / (AREA.h * .65));
    lookAt(mx, my, Math.max(cam.fit, Math.min(cam.z, 1 / Math.max(span, 1e-3)))); }
  if (coachStep === 1 && p.port === 'jeoksan') coach(2);
}
function hideDest() { destPlan = null; $('dest').hidden = true; }
function go(p) { const s = S(); const useAlt = routePick === 'alt' && !!p.alt; hideDest(); lastQuote = null; trail = [[s.x, s.y]]; if (!C.depart(p, useAlt)) return; AU.depart(); closePanel(); showSailbar(); paintHud(); cam.touched = 0; cam.wide = false; lookAt(s.x, s.y, defaultZoom());
  if (coachStep === 2) coach(3); }
let speedIdx = 0;
function showSailbar() { const s = S(); const el = $('sailbar'); el.hidden = false;
  if (s.mode === 'sea') { el.innerHTML = `<span class="to">바다 위<small>지도를 눌러 다음 행선지</small></span>`; return; }
  last.st = null; last.ch = null; el.innerHTML = `<span class="to">${s.dest ? '→ ' + C.PORTS[s.dest].name : '탐험'}<small id="sbRem"></small></span><button class="row" id="sbRow" title="노 저어라 (Space) — 기력을 써서 바람과 상관없이 빨라진다"><em>노 저어라</em><s></s></button><div class="speed" role="group" aria-label="빠르기">${SPEEDS.map((v, i) => `<button data-sp="${i}" class="${i === speedIdx ? 'on' : ''}">${v}×</button>`).join('')}</div>`;
  $('sbRow').onclick = () => toggleRow(); el.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => { speedIdx = +b.dataset.sp; el.querySelectorAll('[data-sp]').forEach(x => x.classList.toggle('on', +x.dataset.sp === speedIdx)); }); }
const hideSailbar = () => { $('sailbar').hidden = true; $('sailbar').classList.remove('chased'); };
function toggleRow() { const s = S(); if (!s || s.mode !== 'sail') return; AU.init(); const on = C.setRow(!s.rowing); if (on) { AU.noise(.25, { freq: 500, q: 2, gain: .25 }); AU.tone(160, { dur: .2, gain: .1 }); } else if (s.stamina <= 3) toast('선원들이 지쳤다. 기력은 쉬면서 천천히 찬다.'); paintHud(); }

/* ─────────── 사건 ─────────── */
function openEvent(ev) { const s = S(); AU[['storm', 'pirate'].includes(ev.id) ? 'drum' : 'chime']();
  $('evCard').innerHTML = `<div class="eyebrow">바다에서 · ${C.dateStr(s.t)}</div><h2>${ev.title}</h2><p>${ev.text}</p><div class="choices">${ev.opts.map((o, i) => `<button class="choice" data-i="${i}"><b>${o.label}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</button>`).join('')}</div>`;
  $('mEvent').hidden = false; $('evCard').querySelector('.choice').focus({ preventScroll: true });
  $('evCard').querySelectorAll('.choice').forEach(b => b.onclick = () => { const r = C.choose(+b.dataset.i); if (r.battle) { $('mEvent').hidden = true; openBattle(); return; } if (r.map) mapAppear[r.map.id] = performance.now(); if (r.good) AU.good(); else if (r.bad) AU.bad();
    $('evCard').querySelector('.choices').outerHTML = `<div class="result ${r.good ? 'good' : r.bad ? 'bad' : ''}">${r.text}</div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn main" id="evOk">계속</button></div>`;
    $('evOk').focus({ preventScroll: true });
    $('evOk').onclick = () => { $('mEvent').hidden = true; paintHud(); if (r.wreck) { hideSailbar(); trail = []; toast(`배가 부서졌다. 상자 ${r.wreck.lost}개를 잃고 ${C.PORTS[r.wreck.port].name}${JO(C.PORTS[r.wreck.port].name,'으로','로')} 실려 왔다.`, 'bad'); openPanel(); lookAt(S().x, S().y); saveGame(); } }; }); }

/* ─────────── 입항 개봉 ─────────── */
function openReveal(info) { panelTab = 'market';
  const s = S(), P = C.PORTS[info.k]; hideSailbar(); trail.push([s.x, s.y]);
  const sell = info.items.map(it => it.profit >= 0);
  const fresh = info.fresh ? `<div class="fresh"><b>처음 보는 시세표</b> — 아무도 이 항구 값을 모른다.<br>${C.GOODS.slice().sort((a, b) => s.markets[info.k].idx[b.id] - s.markets[info.k].idx[a.id]).map(g => `${g.name} <b class="num">${fmt(C.sellPrice(info.k, g.id) * C.LOT)}</b>`).join(' · ')}</div>` : '';
  const sub = [`${s.voyage.from && C.PORTS[s.voyage.from] ? C.PORTS[s.voyage.from].name + '에서 ' : ''}${info.days.toFixed(1)}일`, info.storms ? `폭풍 ${info.storms}번` : '', info.first ? '첫 입항 · 명성 +60' : ''].filter(Boolean).join(' · ');
  const deliv = info.delivered.length ? `<div class="fresh" style="border-color:var(--rok)">${info.delivered.map(o => `<b style="color:var(--rok)">의뢰 완수</b> — ${C.G[o.good].name} ${o.n}상자 · 보수 <b class="num">${fmt(o.reward)}냥</b>`).join('<br>')}</div>` : '';
  const extra = [info.passenger ? `<b style="color:var(--rok)">${info.passenger.who}를 내려줬다</b> — 사례 ${fmt(info.passenger.gold)}냥 · 명성 +80<br>“${info.passenger.line}”` : '', ...(info.race || []).map(r => r.won ? `<b style="color:var(--rok)">${r.ch} ${r.name}보다 먼저 닿았다!</b> 명성 +25 — 값이 아직 성하다.` : `<b style="color:var(--ju)">${r.ch} ${r.name}${JO(r.name,'이','가')} 먼저 닿았다.</b>`)].filter(Boolean);
  const extraHtml = extra.length ? `<div class="fresh" style="border-color:var(--rok)">${extra.join('<br>')}</div>` : '';
  const rivals = info.rivalHere.length ? `<p class="letter" style="color:var(--ju)">${info.rivalHere.map(r => `${r.rival.name}${JO(r.rival.name,'이','가')} 며칠 전 ${C.G[r.id].name}${JO(C.G[r.id].name,'을','를')} 풀고 갔다`).join(' · ')} — 값이 눌려 있다.</p>` : '';
  const cards = info.items.map((it, n) => { const g = C.G[it.id];
    return `<div class="flip" data-n="${n}"><div class="in"><div class="f">${gl(g)}<small>${it.inf ? `${it.inf.src} ${fmt(it.inf.price)}<br>${it.inf.ago}` : '이 항구 값을 모른다'}</small></div>
      <div class="b"><span class="nm">${gl(g)}${g.name}</span><span class="was">산 값 ${fmt(it.cost)}</span><span class="was">${it.inf ? `${it.inf.src} ${fmt(it.inf.price)} →` : '여기 값'}</span><span class="now">${fmt(it.act)}</span><span class="plrow"><span class="pl ${it.profit >= 0 ? 'up' : 'dn'}">${it.profit >= 0 ? '+' : ''}${fmt(it.profit)}</span><span class="stamp ${it.verdict}">${VERDICT[it.verdict]}</span></span><button class="keep ${sell[n] ? 'sell' : ''}" data-k="${n}">${sell[n] ? '판다' : '남긴다'}</button></div></div></div>`; }).join('');
  $('rvCard').innerHTML = `<div class="eyebrow">입항 · ${C.dateStr(s.t)}</div><h2>${P.name}</h2><p class="sub" style="margin:0">${sub}</p>${fresh}${deliv}${extraHtml}${rivals}${info.letter ? `<p class="letter">${s.boons.letters ? '비둘기 편지' : '아사 동생의 편지'} — “${info.letter.line}”</p>` : ''}
    ${info.items.length ? `<div class="crates">${cards}</div><div class="total"><span>팔면</span><span class="big" id="rvTotal">…</span></div>` : '<p style="margin-top:14px">빈 배로 들어왔다.</p>'}
    <div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn main" id="rvOk">${info.items.length ? '팔고 내린다' : '내린다'}</button></div>`;
  $('mReveal').hidden = false; if (info.delivered.length || extra.length) AU.good(); spNote = null;
  const total = () => info.items.reduce((a, it, n) => a + (sell[n] ? it.profit : 0), 0);
  const paintTotal = () => { const el = $('rvTotal'); if (!el) return; const t = total(); el.textContent = (t >= 0 ? '+' : '') + fmt(t); el.className = 'big ' + (t >= 0 ? 'up' : 'dn'); };
  info.items.forEach((it, n) => setTimeout(() => { const c = $('rvCard').querySelector(`.flip[data-n="${n}"]`); if (!c) return; c.classList.add('open'); AU.flip();
    setTimeout(() => { if (it.verdict === 'better') { AU.good(); popAt(c, '적중!', 'big'); } else if (it.verdict === 'fake' || it.verdict === 'worse') AU.bad(); else AU.coin(1); }, 380); }, 450 + n * 480));
  setTimeout(() => { const el = $('rvTotal'); if (!el) return; const t = total(), t0 = performance.now(); (function tick(now) { const q = Math.min(1, (now - t0) / 700), e = 1 - Math.pow(1 - q, 3); el.textContent = (t >= 0 ? '+' : '') + fmt(t * e); el.className = 'big ' + (t >= 0 ? 'up' : 'dn'); if (q < 1) requestAnimationFrame(tick); else paintTotal(); })(t0); }, 450 + info.items.length * 480);
  $('rvCard').querySelectorAll('.keep').forEach(b => b.onclick = e => { e.stopPropagation(); const n = +b.dataset.k; sell[n] = !sell[n]; b.classList.toggle('sell', sell[n]); b.textContent = sell[n] ? '판다' : '남긴다'; paintTotal(); });
  $('rvOk').focus({ preventScroll: true });
  $('rvOk').onclick = () => { const keep = info.items.map((it, n) => sell[n] ? null : it.i).filter(x => x !== null); const res = C.sellAll(keep); $('mReveal').hidden = true;
    openPanel(); lookAt(S().x, S().y); if (res.length) saleFx(res, $('hGold')); after(); if (coachStep === 4) coach(5); runStories(); };
  if (coachStep === 3) coach(4);
}

/* ─────────── 상납 · 특권 ─────────── */
function openQuota(res) {
  const s = S(); hideDest();
  if (!res.ok) { AU.drum(); finish(); return; }
  AU.pay(); const season = ['봄', '여름', '가을', '겨울'][(s.quotaN - 1) % 4], yr = res.year;
  if (yr) { if (s.quotaN >= 4) META.unlocked.ara = true; if (s.quotaN >= 8) META.unlocked.tomo = true; saveMeta(); }
  const cards = s.draft.map(id => { const b = C.BOONS.find(x => x.id === id), have = s.boons[id] || 0;
    return `<button class="boon" data-b="${id}"><span class="bch">${b.ch}</span><b>${b.name}${have ? ` <small>${have + 1}번째</small>` : ''}</b><span>${b.text}</span></button>`; }).join('');
  $('qCard').innerHTML = `<div class="eyebrow">${season} 상납 · ${C.dateStr(s.t)}</div><h2>청해진 군자금 <span class="num">${fmt(res.amount)}</span>냥</h2>
    <p>${res.seized ? `돈이 모자라 짐을 7할 값(${fmt(res.seized)}냥)에 넘겨 겨우 맞췄다. ` : ''}${yr ? '<b>한 해를 버텼다.</b> 다음 해부터 상납이 크게 오른다. ' : ''}다음 상납은 <b class="num">${fmt(res.next)}냥</b>, ${Math.round(C.daysToDue())}일 뒤.${res.wages ? ` 선원 급료 ${fmt(res.wages)}냥을 치렀다.` : ''}${res.left && res.left.length ? ` <b class="dn">급료를 못 받은 ${res.left.join(', ')}이 배를 떠났다.</b>` : ''}</p>
    <div class="sub" style="margin-bottom:8px">특권 하나를 고른다</div><div class="boons">${cards}</div>`;
  $('mQuota').hidden = false;
  $('qCard').querySelectorAll('[data-b]').forEach(b => b.onclick = () => { const r = C.takeBoon(b.dataset.b); $('mQuota').hidden = true; AU.chime();
    const bn = C.BOONS.find(x => x.id === r.id); toast(`특권 — <b>${bn.name}</b>. ${bn.text}`, 'good');
    if (r.note) { const P = C.PORTS[r.note]; toast(`옛 해도에 <b>${P.name}</b> 근처 바다가 그려져 있다.`, 'good'); lookAt(P.x, P.y, Math.max(cam.fit * 1.2, cam.z * .8)); }
    if (yr) banner('年', `${s.stats.years}년을 버텼다 — 다음 해 상납이 오른다`);
    paintHud(); if (S().mode === 'port') { paintPanel(); saveGame(); runStories(); } });
}

/* ─────────── 이야기 ─────────── */
function runStories() { const s = S(); if (!s || anyModal()) return; if (s.ended) { finish(); return; } if (s.qNotes && s.qNotes.length) { drainQuests(); return; } const st = C.nextStory(); if (!st) return; openStory(st); }
function openStory(st) { if (st.who === 'main' && !st.title.includes('마지막')) { AU.gong(); } const ch = st.who === 'main' ? '幕' : st.who === 'port' ? '港' : st.qch && st.who === 'quest' ? st.qch : st.who === 'inspector' ? '監' : CREW_CH[st.who] || st.qch || '話'; AU[st.who === 'inspector' ? 'drum' : 'chime']();
  $('stCard').innerHTML = `<span class="who ${st.who === 'inspector' ? 'inspector' : ''}">${ch}</span><div class="eyebrow">이야기</div><h2 style="padding-right:64px">${st.title}</h2><p>${st.text}</p>${st.sub ? `<p class="sub">${st.sub}</p>` : ''}
    <div class="choices">${st.opts.map((o, i) => `<button class="choice" data-i="${i}"><b>${o.label}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</button>`).join('')}</div>`;
  $('stCard').classList.toggle('chapter', st.who === 'main'); $('mStory').hidden = false; $('stCard').querySelector('.choice').focus({ preventScroll: true });
  $('stCard').querySelectorAll('.choice').forEach(b => b.onclick = () => { const r = st.opts[+b.dataset.i].apply(); $('mStory').hidden = true; if (r) toast(r); if (S().mode === 'port') after(); else paintHud(); setTimeout(runStories, 250); }); }


/* ═══════════ 해전 화면 ═══════════ */
const BT = { w: 0, h: 0, me: { x: 0, tx: 0, lunge: 0, shake: 0 }, foe: { x: 0, tx: 0, lunge: 0, shake: 0 }, fx: [], sparks: [], open: false };
const FOE_LOOK = { black: ['#1e2829', '#3a3f40'], slaver: ['#4a3a2c', '#7a5a3a'], boss: ['#2a1e1a', '#8a2f22'], pirate: ['#2e2a26', '#5a554c'] };
function btLayout() { const c = $('btCv'); const w = c.clientWidth || 400, h = c.clientHeight || 150; c.width = Math.round(w * DPR); c.height = Math.round(h * DPR); BT.w = w; BT.h = h; btTargets(true); }
function btTargets(snap) { const B = S().battle; const near = B && B.dist === 'near'; BT.me.tx = BT.w * (near ? .36 : .19); BT.foe.tx = BT.w * (near ? .64 : .81); if (snap) { BT.me.x = BT.me.tx; BT.foe.x = BT.foe.tx; } }
function btVolley(from, to, n, col) { const now = performance.now(); for (let i = 0; i < n; i++) BT.fx.push({ from, to, t0: now + i * 70, dur: 420, dy: (Math.random() - .5) * 26, col }); }
function btHit(side, big) { const t = side === 'me' ? BT.me : BT.foe; t.shake = big ? 9 : 5; for (let i = 0; i < (big ? 14 : 7); i++) BT.sparks.push({ x: t.x + (Math.random() - .5) * 30, y: BT.h * .5 + (Math.random() - .5) * 20, vx: (Math.random() - .5) * 2.4, vy: -Math.random() * 2.2, life: 1, col: big ? COL.ju : '#efe6cf' }); }
function drawBattle() { const c = $('btCv'); if (!c || !BT.w) return; const g = c.getContext('2d'), w = BT.w, h = BT.h, now = performance.now(), B = S().battle; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const sea = g.createLinearGradient(0, 0, w, h); sea.addColorStop(0, '#b7cfc2'); sea.addColorStop(1, '#8fb3ad'); g.fillStyle = sea; g.fillRect(0, 0, w, h);
  g.lineCap = 'round'; for (let row = 0, y = 6; y < h + 10; y += 13, row++) for (let x = ((row % 2) * 10 + clock * 8) % 20 - 20; x < w + 20; x += 20) { g.strokeStyle = 'rgba(43,84,112,.2)'; g.lineWidth = .9; g.beginPath(); g.arc(x, y + 4, 7, Math.PI * 1.13, Math.PI * 1.87); g.stroke(); }
  if (!B) return; btTargets(false);
  for (const s of [BT.me, BT.foe]) { s.x += (s.tx - s.x) * .08; s.lunge *= .88; s.shake *= .86; }
  const y0 = h * .52, sc = Math.min(2.6, w / 170), bob = Math.sin(clock * 2.2) * 2;
  const mx = BT.me.x + BT.me.lunge + (Math.random() - .5) * BT.me.shake, fx = BT.foe.x - BT.foe.lunge + (Math.random() - .5) * BT.foe.shake;
  if (B.dist === 'near') { g.strokeStyle = 'rgba(30,40,41,.55)'; g.lineWidth = 1.2; g.setLineDash([3, 3]); for (const dy of [-10, 6]) { g.beginPath(); g.moveTo(mx + 26, y0 + dy + bob); g.quadraticCurveTo((mx + fx) / 2, y0 + dy + 12, fx - 26, y0 + dy - bob); g.stroke(); } g.setLineDash([]); }
  const look = FOE_LOOK[(B.spec && B.spec.kind) || 'pirate'] || FOE_LOOK.pirate;
  boatOn(g, mx, y0 + bob, 0, sc * (1 + S().tier * .08), '#3b2e22', '#d3ae62', -.25);
  if (B.e.hp <= 0) { g.globalAlpha = .4; } boatOn(g, fx, y0 - bob + (B.e.hp <= 0 ? 6 : 0), Math.PI + (B.e.hp <= 0 ? .25 : 0), sc * (B.e.boss ? 1.25 : B.spec && B.spec.kind === 'black' ? 1.12 : 1), look[0], look[1], .25);
  g.globalAlpha = 1; g.fillStyle = B.e.boss ? COL.ju : COL.ink; g.beginPath(); g.arc(fx, y0 - 40 * Math.min(1.2, sc / 2), 13, 0, 7); g.fill(); g.fillStyle = COL.hanji2; g.font = `15px ${css('--display')}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(B.e.ch, fx, y0 - 40 * Math.min(1.2, sc / 2) + 1);
  for (const f of BT.fx) { const q = (now - f.t0) / f.dur; if (q < 0 || q > 1) continue; const a = f.from === 'me' ? mx + 20 : fx - 20, b = f.from === 'me' ? fx - 14 : mx + 14; const x = a + (b - a) * q, y = y0 + f.dy * (1 - q) - Math.sin(q * Math.PI) * 18; const dir = Math.sign(b - a);
    g.strokeStyle = f.col || COL.ink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - dir * 9, y + Math.cos(q * Math.PI) * 3); g.lineTo(x, y); g.stroke(); if (f.col === COL.ju) { g.fillStyle = 'rgba(232,140,60,.85)'; g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill(); } }
  BT.fx = BT.fx.filter(f => now - f.t0 < f.dur + 50);
  for (const p of BT.sparks) { p.x += p.vx; p.y += p.vy; p.vy += .12; p.life -= .035; g.globalAlpha = Math.max(0, p.life); g.fillStyle = p.col; g.fillRect(p.x, p.y, 2.4, 2.4); } g.globalAlpha = 1; BT.sparks = BT.sparks.filter(p => p.life > 0);
  g.fillStyle = 'rgba(30,40,41,.55)'; g.font = `11px ${css('--ui')}`; g.textAlign = 'center'; g.fillText(B.dist === 'near' ? '— 맞붙었다 —' : '— 활 거리 —', w / 2, h - 10); }
function openBattle() { const s = S(), B = s.battle; if (!B) return; hideDest(); AU.drum(); BT.fx = []; BT.sparks = []; BT.me.lunge = BT.foe.lunge = 0;
  $('btCard').innerHTML = `<div class="eyebrow">해전 · ${C.dateStr(s.t)}</div><div class="bt-head"><span class="bseal ${B.e.boss ? 'boss' : ''}">${B.e.ch}</span><div><h2>${B.e.name}</h2><small>${B.e.boss ? '현상 수배 두목 · ' : ''}${B.e.line || '평범한 해적'}</small></div></div>
    <canvas id="btCv"></canvas><div class="bt-bars"><div class="hb me"><span>내 배</span><s><i id="btMe"></i></s><b id="btMeN"></b></div><div class="hb foe"><span>${B.e.name}</span><s><i id="btFoe"></i></s><b id="btFoeN"></b></div></div>
    <div class="bt-intent" id="btIntent"></div><div class="bt-log" id="btLog">${B.e.boss ? '두목의 배가 앞을 막아선다. 도망칠 생각은 없어 보인다.' : '적이 다가온다. 저쪽의 다음 수를 읽고 맞받아라.'}</div>
    <div class="bt-acts" id="btActs"></div><div class="bt-foot"><span class="stam">기력 <s><i id="btSt"></i></s></span><button class="linkbtn" id="btGive">${s.slots.length ? '상자 하나 내주고 빠진다' : '통행료 내고 빠진다'}</button></div>`;
  $('mBattle').hidden = false; BT.open = true; requestAnimationFrame(() => { btLayout(); paintBattle(); });
  $('btGive').onclick = () => battleDo('surrender'); }
function paintBattle() { const s = S(), B = s.battle; if (!B) return; const pct = (v, m) => Math.max(0, Math.min(100, v / m * 100)) + '%';
  $('btMe').style.width = pct(s.hull, s.hullMax); $('btMeN').textContent = `${Math.max(0, Math.round(s.hull))}/${s.hullMax}`; $('btFoe').style.width = pct(B.e.hp, B.e.max); $('btFoeN').textContent = `${B.e.hp}/${B.e.max}`; $('btSt').style.width = pct(s.stamina, 100);
  if (B.over) return;
  const I = B.intent, danger = I.dmg >= B.e.atk * 1.4; $('btIntent').className = 'bt-intent' + (danger ? ' danger' : I.dmg ? '' : ' calm');
  $('btIntent').innerHTML = `<span class="lbl">적의 다음 수</span><b>${I.text}</b>${I.dmg ? `<em>${I.dmg}</em>` : ''}`;
  $('btActs').innerHTML = C.battleOpts().map((o, i) => `<button class="bact" data-a="${o.id}" ${o.ok ? '' : 'disabled'}><span class="bch">${o.ch}</span><b>${o.label}</b><small>${o.sub}</small><kbd>${i + 1}</kbd></button>`).join('');
  $('btActs').querySelectorAll('[data-a]').forEach(b => b.onclick = () => battleDo(b.dataset.a)); }
function battleDo(a) { const s = S(), B = s.battle; if (!B || B.over) return; AU.init(); const I = B.intent, hull0 = s.hull, hp0 = B.e.hp, dist0 = B.dist; const r = C.battleAct(a); if (!r) return;
  const dealt = hp0 - B.e.hp, took = Math.round(hull0 - s.hull);
  if (a === 'shoot') { btVolley('me', 'foe', 5); AU.noise(.25, { freq: 2400, q: 1, gain: .12, type: 'highpass' }); }
  if (a === 'board') { BT.me.lunge = BT.w * .12; AU.drum(); }
  if (a === 'guard') AU.tok();
  if (a === 'move' || a === 'flee') AU.noise(.4, { freq: 500, q: 2, gain: .2 });
  setTimeout(() => { if (dealt > 0) { btHit('foe', a === 'board'); const c = $('btCv'); if (c) { const r0 = c.getBoundingClientRect(); pop(`-${dealt}`, r0.left + BT.foe.x, r0.top + BT.h * .3, 'big'); } AU.coin(1); } }, a === 'shoot' ? 420 : 180);
  if (!r.over || r.over === 'lose') setTimeout(() => { const ek = I.k;
    if ((ek === 'shoot' || ek === 'volley') && took > 0) btVolley('foe', 'me', ek === 'volley' ? 10 : 4, B.e.g === 'fire' ? COL.ju : null);
    if ((ek === 'ram' || ek === 'board') && took > 0) BT.foe.lunge = BT.w * .12;
    setTimeout(() => { if (took > 0) { btHit('me', took >= 15); AU.bad(); const c = $('btCv'); if (c) { const r0 = c.getBoundingClientRect(); pop(`-${took}`, r0.left + BT.me.x, r0.top + BT.h * .3, 'bad'); } } }, ek === 'shoot' || ek === 'volley' ? 420 : 160); }, 520);
  $('btLog').innerHTML = r.log.map(l => `<span>${l}</span>`).join(''); paintBattle(); paintHud();
  if (r.over) { $('btActs').innerHTML = ''; $('btGive').hidden = true; $('btIntent').hidden = true; setTimeout(() => battleEnd(), 900); } }
function battleEnd() { const s = S(), B = s.battle, R = B.result || {}; const T = { win: ['격파!', 'good'], lose: ['배가 부서졌다', 'bad'], fled: ['빠져나왔다', ''], surrender: ['내주고 빠졌다', ''] }[B.over];
  if (B.over === 'win') AU.good(); else if (B.over === 'lose') AU.bad();
  const lines = [R.gold ? `전리품 <b class="num">${fmt(R.gold - (R.bounty || 0))}냥</b>` : '', R.bounty ? `<b style="color:var(--rok)">현상금 ${fmt(R.bounty)}냥</b>` : '', R.fame ? `명성 +${R.fame}` : '', R.map ? `<b style="color:var(--hwang)">寶</b> 적의 선실에서 해도를 찾았다 — <b>${R.map.name}</b>` : '', ...(R.notes || []), R.wreck ? `상자 ${R.wreck.lost}개를 잃고 ${C.PORTS[R.wreck.port].name}으로 실려 왔다.` : ''].filter(Boolean);
  $('btLog').insertAdjacentHTML('afterend', `<div class="result ${T[1]}" id="btRes"><b style="font-size:22px">${T[0]}</b>${lines.length ? '<br>' + lines.join('<br>') : ''}</div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn main" id="btOk">계속</button></div>`);
  $('btOk').focus({ preventScroll: true }); $('btOk').onclick = () => { const res = C.battleClose(); $('mBattle').hidden = true; BT.open = false; paintHud();
    if (res && res.map) { mapAppear[res.map.id] = performance.now(); }
    if (res && res.wreck) { hideSailbar(); trail = []; openPanel(); lookAt(S().x, S().y); saveGame(); }
    if (S().mode === 'port') after(); setTimeout(runStories, 200); }; }

/* ═══════════ 잠수 화면 ═══════════ */
function openDive() { const s = S(), D = s.dive; if (!D) return; hideDest(); AU.chime();
  const stars = '★'.repeat(D.site.lv) + '☆'.repeat(3 - D.site.lv);
  $('dvCard').innerHTML = `<div class="eyebrow">잠수 · ${C.dateStr(s.t)}</div><h2>${D.site.name} <span class="stars">${stars}</span></h2><p class="sub" style="margin:0 0 10px">${D.site.pearl ? '해녀들이 앞서 내려간다. 얕지만 진주가 많다.' : D.site.lv >= 3 ? `두목이 숨긴 보물. <b>맨 밑(${D.max}길)</b>에는 반드시 유물이 있다.` : '깊이 갈수록 값진 것이 있다.'} 숨이 끊기면 이번에 건진 것을 <b>모두</b> 놓치고 며칠을 앓는다.</p>
    <div class="dv"><div class="dv-col" id="dvCol">${Array.from({ length: D.max }, (_, i) => `<div class="band" style="top:${(i + 1) / (D.max + 1) * 100}%"><span>${i + 1}길</span></div>`).join('')}<div class="diver" id="dvDiver">潛<i></i><i></i><i></i></div></div>
      <div class="dv-side"><div class="breath"><span>숨</span><s><i id="dvBr"></i></s><b id="dvBrN"></b></div><div class="dv-find" id="dvFind"><span class="fch">水</span><span>뱃전에서 숨을 크게 들이쉰다.</span></div><div class="haul" id="dvHaul"></div></div></div>
    <div class="dv-row" id="dvRow"></div>`;
  $('mDive').hidden = false; paintDive(); }
function paintDive() { const s = S(), D = s.dive; if (!D) return; const pct = Math.max(0, D.breath / D.full * 100);
  $('dvBr').style.width = pct + '%'; $('dvBr').classList.toggle('low', pct < 30); $('dvBrN').textContent = Math.max(0, Math.round(D.breath));
  $('dvDiver').style.top = `calc(${D.depth / (D.max + 1) * 100}% - 4px)`;
  $('dvHaul').innerHTML = D.haul.length ? D.haul.map(h => `<span class="hchip ${h.relic ? 'relic' : ''}" title="${h.text}">${h.ch}</span>`).join('') : '<small class="fine">아직 건진 것이 없다</small>';
  if (D.over) return; const cost = C.diveCost(D), deep = D.depth >= D.max, gasp = D.breath - cost - 5 < C.GASP;
  $('dvRow').innerHTML = `<button class="btn" data-d="up">${D.depth ? '올라온다' : '그만둔다'}</button><button class="btn main ${!deep && gasp ? 'risky' : ''}" data-d="down" ${deep ? 'disabled' : ''}>${deep ? '바닥이다' : D.breath < cost ? `숨이 모자라다 — 그래도 간다 (-${cost}~${cost + 5})` : `더 깊이 · 숨 약 -${cost}~${cost + 5}${gasp ? ' · 숨이 가빠 위험' : ''}`}</button>`;
  $('dvRow').querySelectorAll('[data-d]').forEach(b => b.onclick = () => diveDo(b.dataset.d)); }
function diveDo(a) { const D = C.diveAct(a); if (!D) return; AU.init();
  if (a === 'down') { AU.noise(.5, { freq: 300, q: .8, gain: .14, type: 'lowpass' }); const r = D.last; if (r) { const el = $('dvFind'); el.className = 'dv-find ' + (r.relic ? 'relic' : r.good ? 'fgood' : r.bad ? 'fbad' : ''); el.innerHTML = `<span class="fch">${r.ch}</span><span>${D.depth}길 — ${r.text}</span>`; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
      setTimeout(() => { if (r.relic) { AU.gong(); } else if (r.good) AU.coin(1.4); else if (r.bad) AU.bad(); }, 250); } }
  paintDive(); if (D.over) diveEnd(); }
function diveEnd() { const D = S().dive, R = D.result || { gold: 0, crates: [], relics: [] };
  const lines = [R.gold ? `<b class="num">+${fmt(R.gold)}냥</b>` : '', R.crates.length ? `상자 ${R.crates.map(id => C.G[id].name).join(', ')}` : '', R.sold ? `선창이 차서 ${R.sold}상자는 반값에 넘겼다` : '', ...R.relics.map(id => { const r = C.RELICS.find(x => x.id === id); return `<b style="color:var(--hwang)">유물 ${r.ch} ${r.name}</b> — ${r.text}`; })].filter(Boolean);
  const head = D.over === 'blackout' ? `<b>숨이 끊겼다</b> — 선원들이 줄을 당겨 끌어올렸다. ${D.lostHaul && D.lostHaul.length ? `건진 것 ${D.lostHaul.length}개를 모두 놓쳤다. ` : ''}잠수부가 ${D.faint}일을 앓아누웠고 선원들은 지쳤다.` : '<b>물 위로 올라왔다.</b>';
  $('dvRow').innerHTML = `<div class="result ${D.over === 'blackout' ? 'bad' : lines.length ? 'good' : ''}" style="flex:1">${head}${lines.length ? '<br>' + lines.join('<br>') : '<br>빈손이다.'}</div><button class="btn main" id="dvOk">계속</button>`;
  if (R.relics.length) setTimeout(() => banner('寶', `유물 — ${C.RELICS.find(x => x.id === R.relics[0]).name}`), 300); else if (D.over !== 'blackout' && R.gold) AU.pay();
  $('dvOk').focus({ preventScroll: true }); $('dvOk').onclick = () => { C.diveClose(); $('mDive').hidden = true; paintHud(); if (S().mode === 'port') after(); }; }

/* ═══════════ 표적 (현상 수배 · 보물 지도) ═══════════ */
function targetsHtml(k) { const s = S(), o = s.bOffers[k], b = s.bounty; let h = '';
  if (b) h += `<div class="tgt bounty"><span class="tch">${b.ch}</span><span class="gr"><b>${b.name}</b> 수배 중 · <span class="${b.due - s.t <= 10 ? 'dn' : ''}">${Math.ceil(b.due - s.t)}일 남음</span><br><span class="up">현상금 ${fmt(b.reward)}냥</span></span><button class="btn" data-look="b">해도</button></div>`;
  if (o && !o.none) h += `<div class="tgt offer"><span class="tch">${o.ch}</span><span class="gr"><b>懸 ${o.name}</b> — ${o.line}<br><span class="up">현상금 ${fmt(o.reward)}냥</span> · ${o.days}일 · <small>${C.GIMMICK[o.g] || ''}</small></span><button class="btn blue" data-act="bounty" ${b ? 'disabled' : ''}>${b ? '한 건씩' : '맡는다'}</button></div>`;
  h += s.maps.map((m, i) => `<div class="tgt map"><span class="tch">寶</span><span class="gr"><b>${m.name}</b> <span class="stars">${'★'.repeat(m.lv)}${'☆'.repeat(3 - m.lv)}</span><br><small>해도에 금빛 원으로 그려진 곳. 원 안으로 배를 몰면 잠수한다.</small></span><button class="btn" data-look="m${i}">해도</button></div>`).join('');
  if (!h) return ''; return `<div class="sec"><h3>현상 수배 · 보물 지도<span>寶 ${s.maps.length}/3</span></h3><div class="hold">${h}</div></div>`; }
function drawTargets(s) { const now = performance.now();
  for (const m of s.maps) { const [x, y] = toS(m.x, m.y), r = m.r * cam.z; if (!onScreen(x, y, r + 40)) continue; const a = Math.min(1, (now - (mapAppear[m.id] || 0)) / 800);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = COL.hwang; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -clock * 8; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(168,130,31,.12)'; ctx.fill(); const pz = 1 + Math.sin(clock * 3) * .06; ctx.fillStyle = COL.hwang; ctx.beginPath(); ctx.arc(x, y, 11 * pz, 0, 7); ctx.fill(); ctx.fillStyle = COL.hanji2; ctx.font = `13px ${css('--display')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('寶', x, y + .5); ctx.restore();
    if (cam.z > cam.fit * 1.3) label(m.name, x, y + 14, 11, '#7a5d12'); }
  const b = s.bounty; if (b) { const [x, y] = toS(b.x, b.y), r = b.r * cam.z; if (onScreen(x, y, r + 40)) { ctx.save(); ctx.strokeStyle = COL.ju; ctx.lineWidth = 2; ctx.globalAlpha = .55 + Math.sin(clock * 4) * .25; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(176,63,40,.1)'; ctx.fill(); ctx.fillStyle = COL.ju; ctx.fillRect(x - 11, y - 11, 22, 22); ctx.fillStyle = COL.hanji2; ctx.font = `14px ${css('--display')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.ch, x, y + 1); ctx.restore();
      label(`懸 ${b.name}`, x, y + 15, 11, COL.ju); } } }
function targetAt(x, y) { const s = S(); for (const m of s.maps) { const [px, py] = toS(m.x, m.y); if (Math.hypot(px - x, py - y) < 20) return { x: m.x, y: m.y }; } if (s.bounty) { const [px, py] = toS(s.bounty.x, s.bounty.y); if (Math.hypot(px - x, py - y) < 20) return { x: s.bounty.x, y: s.bounty.y }; } return null; }
function targetNear(x, y) { const s = S(); const m = s.maps.find(m => Math.hypot(m.x - x, m.y - y) < m.r); if (m) return { kind: 'map', m }; if (s.bounty && Math.hypot(s.bounty.x - x, s.bounty.y - y) < s.bounty.r) return { kind: 'bounty', b: s.bounty }; return null; }


/* ═══════════ 장부: 시세 · 이야기 · 도감 ═══════════ */
let bookTab = 'market', bookGood = null;
const hashOff = (id, r) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0; const a = (h % 628) / 100; return [Math.cos(a) * r, Math.sin(a) * r]; };
function questTargets(s) { const out = []; for (const id of Object.keys(s.quests || {})) { const st = C.qStep(id); if (!st) continue; const q = C.QBY[id], g = st.goal;
    if (g.type === 'port' || g.type === 'deliver') { const P = C.PORTS[g.k]; if (s.known[g.k]) out.push({ id, q, kind: 'port', k: g.k, x: P.x, y: P.y, good: g.good }); else { const [dx, dy] = hashOff(id + g.k, 55); out.push({ id, q, kind: 'area', x: P.x + dx, y: P.y + dy, r: 110 }); } }
    if (g.type === 'find') { const f = C.FINDS.find(f => f.id === g.id); const [dx, dy] = hashOff(id + g.id, 45); out.push({ id, q, kind: 'area', x: f.x + dx, y: f.y + dy, r: 95 }); }
    if (g.type === 'fight') { const sp = C.questSpots().find(x => x.id === id); if (sp) out.push({ id, q, kind: 'fight', x: sp.x, y: sp.y, r: sp.r, name: sp.name }); } }
  return out; }
function drawQuestMarks(s) { for (const t of questTargets(s)) { const [x, y] = toS(t.x, t.y); if (!onScreen(x, y, (t.r || 0) * cam.z + 40)) continue;
    if (t.kind === 'area') { const r = t.r * cam.z; ctx.save(); ctx.strokeStyle = '#3f5a7a'; ctx.lineWidth = 1.6; ctx.setLineDash([2, 5]); ctx.lineDashOffset = clock * 6; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(63,90,122,.07)'; ctx.fill(); ctx.restore();
      label(`書 ${t.q.name} — 이 근처`, x, y - 6, 11, '#3f5a7a'); }
    if (t.kind === 'fight') { const r = t.r * cam.z; ctx.save(); ctx.strokeStyle = COL.ju; ctx.lineWidth = 2; ctx.globalAlpha = .6 + Math.sin(clock * 4) * .25; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.restore(); label(`書 ${t.name}`, x, y - 6, 11, COL.ju); }
    if (t.kind === 'port') { const sz = NARROW() ? 20 : 24, bx = x + sz / 2 + 2, by = y + sz / 2 + 2, pz = 1 + Math.sin(clock * 4) * .08; ctx.save(); ctx.translate(bx, by); ctx.scale(pz, pz); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#3f5a7a'; ctx.fillRect(-7, -7, 14, 14); ctx.restore();
      ctx.fillStyle = COL.hanji2; ctx.font = `bold 11px ${css('--ui')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', bx, by + .5); } } }
function drawMissed(s) { for (const f of C.FINDS) { if (s.found[f.id] || !C.revealed(f.x, f.y)) continue; const [x, y] = toS(f.x, f.y); if (!onScreen(x, y)) continue;
    ctx.save(); ctx.globalAlpha = .55 + Math.sin(clock * 2 + f.x) * .2; ctx.strokeStyle = COL.ink2; ctx.setLineDash([2, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = COL.ink2; ctx.font = `bold 11px ${css('--ui')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x, y + .5); ctx.restore(); } }
function openBook(tab) { if (tab) bookTab = tab; AU.init(); paintBook(); $('mBook').hidden = false; }
function paintBook() { const s = S(); if (!s) return;
  const tabs = [['market', '시세'], ['quest', `이야기${Object.values(s.quests || {}).filter(q => !q.done).length ? ' ·' + Object.values(s.quests).filter(q => !q.done).length : ''}`], ['dex', `도감 ${Object.keys(s.found).length}/${C.FINDS.length}`], ['log', '일지']];
  $('bkTabs').innerHTML = tabs.map(([id, l]) => `<button class="${bookTab === id ? 'on' : ''}" data-tab="${id}">${l}</button>`).join('');
  $('bkBody').innerHTML = bookTab === 'market' ? bookMarket(s) : bookTab === 'quest' ? bookQuest(s) : bookTab === 'log' ? bookLog(s) : bookDex(s);
  $('bkTabs').querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { bookTab = b.dataset.tab; paintBook(); });
  $('bkBody').querySelectorAll('[data-good]').forEach(b => b.onclick = () => { bookGood = b.dataset.good || null; paintBook(); });
  $('bkBody').querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const k = b.dataset.go; $('mBook').hidden = true; if (s.mode === 'sail') { lookAt(C.PORTS[k].x, C.PORTS[k].y); return; } if (k === s.at && s.mode === 'port') { openPanel(); return; } const p = C.plan(k); if (!p) return; if (p.closedPort) { toast(`${C.PORTS[k].name}은 포구를 닫았다.`, 'bad'); return; } showDest(p); });
  $('bkBody').querySelectorAll('[data-lookxy]').forEach(b => b.onclick = () => { const [x, y] = b.dataset.lookxy.split(',').map(Number); $('mBook').hidden = true; cam.wide = false; lookAt(x, y, Math.max(cam.z, cam.fit * 1.5)); }); }
const ageCls = d => { const a = Math.floor(S().t) - d; return a < 15 ? 'ag-new' : a < 40 ? 'ag-mid' : 'ag-old'; };
function bookMarket(s) { const known = C.PORT_IDS.filter(k => s.known[k]);
  const chips = `<div class="bk-goods"><button class="${!bookGood ? 'on' : ''}" data-good="">전체</button>${C.GOODS.map(g => `<button class="${bookGood === g.id ? 'on' : ''}" data-good="${g.id}">${gl(g)}${g.name}</button>`).join('')}</div>`;
  if (!bookGood) { const NAT = ['신라', '탐라', '발해', '당', '왜', '남도'];
    return chips + `<p class="fine bk-note">● 그 항구에서 <b>나는 것</b>(싸게 산다) · ▲ <b>비싸게 사 주는 것</b>. 숫자는 내가 아는 한 상자 값과 언제 알았는지.</p>` + NAT.map(n => { const ks = known.filter(k => C.PORTS[k].nation === n); if (!ks.length) return '';
      return `<h4 class="bk-nat">${n}</h4>` + ks.map(k => { const P = C.PORTS[k], L = s.ledger[k];
        const sells = P.prod.map(id => { const b = L && L.b && L.b[id]; return `<span class="bk-g sell">${gl(C.G[id])}${C.G[id].name}${b ? `<b>${fmt(b * C.LOT)}</b>` : ''}</span>`; }).join('');
        const wants = P.want.map(id => { const inf = C.infoFor(k, id); return `<span class="bk-g want">▲${gl(C.G[id])}${C.G[id].name}${inf ? `<b class="${ageCls(inf.day)}">${fmt(inf.price * C.LOT)}</b>` : ''}</span>`; }).join('');
        const sp = C.SPECIALS[k]; return `<button class="bk-row" data-go="${k}"><span class="seal">${P.ch}</span><span class="nm">${P.name}${s.at === k && s.mode === 'port' ? ' <small>여기</small>' : ''}${C.isClosed(k) ? ' <small class="dn">閉</small>' : ''}${L ? `<small>${C.ago(L.day)} 들름</small>` : '<small>안 가 봄</small>'}${sp ? `<small class="sp">${sp.name}</small>` : ''}</span><span class="gs">${sells}</span><span class="gs">${wants}</span></button>`; }).join(''); }).join(''); }
  const g = C.G[bookGood]; const rows = known.map(k => { const inf = C.infoFor(k, bookGood), L = s.ledger[k], prod = C.PORTS[k].prod.includes(bookGood), want = C.PORTS[k].want.includes(bookGood); return { k, inf, buy: L && L.b && L.b[bookGood], prod, want }; })
    .filter(r => r.inf || r.prod || r.want).sort((a, b) => (b.inf ? b.inf.price : b.want ? 1 : 0) - (a.inf ? a.inf.price : a.want ? 1 : 0));
  return chips + `<p class="fine bk-note">${gl(g)} <b>${g.name}</b> — 어디서 싸게 사서 어디에 팔까. 값은 내가 아는 마지막 소식이다.</p>` + (rows.length ? rows.map((r, i) => { const P = C.PORTS[r.k];
    return `<button class="bk-row one ${i === 0 && r.inf ? 'best' : ''}" data-go="${r.k}"><span class="seal">${P.ch}</span><span class="nm">${P.name}<small>${P.nation}</small></span><span class="gs">${r.prod ? `<span class="bk-g sell">● 여기서 난다${r.buy ? ` · 사는 값 <b>${fmt(r.buy * C.LOT)}</b>` : ''}</span>` : ''}${r.want ? '<span class="bk-g want">▲ 비싸게 산다</span>' : ''}</span><span class="pr">${r.inf ? `<b class="${ageCls(r.inf.day)}">${fmt(r.inf.price * C.LOT)}</b><small>${r.inf.src} · ${C.ago(r.inf.day)}</small>` : '<small>값 모름</small>'}</span></button>`; }).join('') : '<p class="fine">아는 항구가 없다.</p>'); }
function bookQuest(s) { const act = [], done = [], avail = [];
  for (const q of C.QUESTS) { const st = s.quests[q.id]; if (st && st.done) done.push(q); else if (st) act.push(q); else if (s.known[q.giver]) avail.push(q); }
  const tgt = questTargets(s);
  const A = act.map(q => { const st = s.quests[q.id], step = q.steps[st.step], t = tgt.find(x => x.id === q.id);
    return `<div class="bk-q on"><span class="qch">${q.ch}</span><div class="gr"><b>${q.name}</b> <small>${st.step + 1}/${q.steps.length}단계</small><div class="qgoal">→ ${step.text}</div>${q.steps.slice(0, st.step).map(x => `<div class="qdone">✓ ${x.text}</div>`).join('')}</div>${t ? `<button class="btn" data-lookxy="${Math.round(t.x)},${Math.round(t.y)}">해도</button>` : ''}</div>`; }).join('');
  const V = avail.map(q => `<div class="bk-q"><span class="qch dim">${q.ch}</span><div class="gr"><b>${q.name}</b> <small>${q.steps.length}단계</small><div class="qgoal dim">${C.PORTS[q.giver].name}에 가면 이야기를 들을 수 있다</div></div><button class="btn" data-go="${q.giver}">${C.PORTS[q.giver].name}</button></div>`).join('');
  const D = done.map(q => `<div class="bk-q fin"><span class="qch">${q.ch}</span><div class="gr"><b>${q.name}</b> <small>끝냄</small></div></div>`).join('');
  const hidden = C.QUESTS.length - act.length - done.length - avail.length;
  const arc = C.arcOf(), M = s.main; const mainH = `<h4 class="bk-nat">본 이야기 — ${arc.name}</h4><div class="acts-line">${arc.acts.map((a, i) => `<span class="${i < M.act ? 'done' : i === M.act ? 'now' : ''}">${C.NUM[i]}<small>${i <= M.act ? a.title : '?'}</small></span>`).join('')}</div>${mainBox(s.at)}`;
  return mainH + `${A ? `<h4 class="bk-nat">진행 중</h4>${A}` : '<p class="fine bk-note">맡은 이야기가 없다. 항구에 들르면 누군가 말을 걸어온다.</p>'}${V ? `<h4 class="bk-nat">들을 수 있는 이야기</h4>${V}` : ''}${D ? `<h4 class="bk-nat">끝낸 이야기</h4>${D}` : ''}${hidden ? `<p class="fine bk-note">아직 모르는 항구에 이야기 ${hidden}개가 더 있다.</p>` : ''}`; }
function bookDex(s) { let sea = 0, seen = 0; for (let c = 0; c < s.fog.length; c++) { const x = (c % C.GW) * C.CELL + C.CELL / 2, y = ((c / C.GW) | 0) * C.CELL + C.CELL / 2; if (C.seaAt(x, y)) { sea++; if (s.fog[c]) seen++; } }
  const pct = Math.round(seen / Math.max(1, sea) * 100), ports = C.PORT_IDS.filter(k => s.known[k]).length;
  return `<div class="bk-stats"><div><b>${pct}%</b><small>그린 바다</small></div><div><b>${ports}/${C.PORT_IDS.length}</b><small>아는 항구</small></div><div><b>${Object.keys(s.found).length}/${C.FINDS.length}</b><small>발견</small></div><div><b>${Object.keys(s.relics || {}).length}/${C.RELICS.length}</b><small>유물</small></div></div>
    <p class="fine bk-note">해역의 발견을 모두 찾으면 보상과 숨은 보물 지도를 준다. 해도에 <b>?</b>가 보이면 근처를 스치고 지나간 것이다.</p>` +
    C.REGIONS.map(r => { const fs = C.FINDS.filter(f => f.region === r), n = fs.filter(f => s.found[f.id]).length;
      return `<h4 class="bk-nat">${r} <small>${n}/${fs.length}${s.regions && s.regions[r] ? ' · 다 찾았다 ✓' : ''}</small></h4><div class="dex">${fs.map(f => s.found[f.id] ? `<button class="dx on" data-lookxy="${f.x},${f.y}"><b>${f.name}</b><small>${f.text}</small></button>` : `<div class="dx"><b>???</b><small>${f.hint}</small></div>`).join('')}</div>`; }).join(''); }
function drainQuests() { const s = S(); if (!s || !s.qNotes || !s.qNotes.length || anyModal() || s.ended) return; const n = s.qNotes.shift(); AU[n.fin ? 'pay' : 'good']();
  if (n.fin) banner(n.ch, `「${n.name}」 끝`);
  if (n.main) { openStory({ who: 'main', act: n.ch, title: n.fin ? `${n.name} — 막이 내린다` : n.name, text: n.text, sub: n.got.join(' · '), opts: [{ label: '계속', apply: () => null }] }); return; }
  openStory({ who: 'quest', qch: n.ch, title: `${n.name} — ${n.fin ? '끝' : `${n.n}/${n.of}`}`, text: n.text, sub: `${n.got.join(' · ')}${n.next ? `<br>다음 → ${n.next}` : ''}`, opts: [{ label: n.fin ? '이야기를 닫는다' : '다음으로', apply: () => null }] }); }


/* ═══════════ v6: 항구 탭 · 본 이야기 · 선술집 · 일지 ═══════════ */
let panelTab = 'market';
function bestElsewhere(id) { const s = S(); let best = null; for (const k of C.PORT_IDS) { if (!s.known[k] || k === s.at) continue; const inf = C.infoFor(k, id); if (inf && (!best || inf.price > best.price)) best = { k, price: inf.price, day: inf.day }; } return best; }
function mainBox(k) { const s = S(), A = C.curAct(), arc = C.arcOf(); if (!A) return '';
  const n = C.NUM[s.main.act]; if (!s.main.started) return `<div class="mainbox wait"><span class="mch">${n}<small>幕</small></span><div class="gr"><b>第${n}幕 ${A.title}</b><small>${arc.name} — 때가 오면 막이 열린다 (상납을 더 바치면)</small></div></div>`;
  const gs = C.mainGoals(); const pay = gs.find(g => g.pay && !g.done && g.pay.k === k);
  return `<div class="mainbox"><span class="mch">${n}<small>幕</small></span><div class="gr"><b>第${n}幕 ${A.title}</b><small>${arc.name}</small><ul>${gs.map(g => `<li class="${g.done ? 'done' : ''}">${g.done ? '✓' : '○'} ${g.text}${g.prog && !g.done && g.prog() ? ` <em>${g.prog()}</em>` : ''}</li>`).join('')}</ul>${A.final && gs.every(g => g.done) ? '<p class="fine" style="text-align:left;margin:4px 0 0">마지막 선택이 기다린다.</p>' : ''}${pay ? `<button class="btn main" data-act="mainpay" ${s.gold < pay.pay.n ? 'disabled' : ''}>${fmt(pay.pay.n)}냥을 낸다</button>` : ''}</div></div>`; }
function tavernHtml(k) { const s = S(), t = C.tavern(k), cap = C.mateCap();
  const offer = t.offer.length ? t.offer.map(id => { const m = C.MBY[id]; return `<div class="mate-card"><span class="mc">${m.ch}</span><div class="gr"><b>${m.name}</b> <small>${m.role} · ${m.from}</small><br>${m.text}<br><small>영입 ${fmt(m.hire)}냥 · 계절마다 급료 ${fmt(m.wage)}냥</small></div><button class="btn blue" data-hire="${id}" ${s.gold < m.hire || s.mates.length >= cap ? 'disabled' : ''}>${s.mates.length >= cap ? '자리 없음' : '데려간다'}</button></div>`; }).join('') : '<p class="fine" style="text-align:left;margin:0">오늘은 일거리를 찾는 뱃사람이 없다.</p>';
  const mine = s.mates.length ? s.mates.map(id => { const m = C.MBY[id]; return `<div class="mate-card mine"><span class="mc">${m.ch}</span><div class="gr"><b>${m.name}</b> <small>${m.role}</small><br><small>${m.text} · 급료 ${fmt(m.wage)}</small></div><button class="btn" data-fire="${id}">내린다</button></div>`; }).join('') : '';
  const dl = 3 - t.dice;
  return `<div class="sec"><h3>소문</h3><div class="acts"><button class="act" data-act="rumor" ${s.gold < C.rumorCost() ? 'disabled' : ''}><b>소문 듣기</b><small>${fmt(C.rumorCost())}냥 · 다른 항구 값${s.boons.clerk || C.hasMate('seer') || s.cap === 'ara' ? ' · 정확' : ''}</small></button></div>${lastQuote ? `<div class="quote">${lastQuote}</div>` : ''}</div>
    <div class="sec"><h3>뱃사람 구함<span>내 선원 ${s.mates.length}/${cap}</span></h3><div class="hold">${offer}</div>${mine ? `<div class="hold" style="margin-top:8px">${mine}</div>` : ''}</div>
    <div class="sec"><h3>홀짝<span>오늘 ${dl}판 남음</span></h3><div class="dice" id="dice"><div class="dcup" id="dcup"><span>⚀</span><span>⚀</span></div><div class="dbtns">${[500, 2000].map(b => `<div class="drow"><small>${fmt(b)}냥</small><button class="btn" data-dice="${b}:odd" ${dl <= 0 || s.gold < b ? 'disabled' : ''}>홀</button><button class="btn" data-dice="${b}:even" ${dl <= 0 || s.gold < b ? 'disabled' : ''}>짝</button></div>`).join('')}</div><p class="fine dres" id="dres">두 주사위의 합이 홀일까 짝일까. 맞히면 건 돈의 0.9배를 번다.</p></div></div>`; }
function journal(text, kind) { const s = S(); if (!s || !s.log || s.ended) return; const t = String(text).replace(/<br\s*\/?>/g, ' — ').replace(/<[^>]+>/g, ''); s.log.push({ t: Math.floor(s.t), x: t, k: kind || '' }); if (s.log.length > 160) s.log.splice(0, s.log.length - 160); }
function bookLog(s) { if (!s.log || !s.log.length) return '<p class="fine bk-note">아직 적은 것이 없다.</p>'; let day = null, h = '';
  for (const e of s.log.slice().reverse()) { if (e.t !== day) { day = e.t; h += `<h4 class="bk-nat">${C.dateStr(e.t)}</h4>`; } h += `<div class="logl ${e.k}">${e.x}</div>`; } return h; }
function paintTracker() { const s = S(), el = $('tracker'); if (!el) return; if (!s || s.ended || !$('sTitle').hidden) { el.hidden = true; return; }
  const A = C.curAct(); if (!A) { el.hidden = true; return; } const n = C.NUM[s.main.act];
  const key = s.main.act + ':' + s.main.started + ':' + (s.main.started ? C.mainGoals().map(g => g.done + (g.prog ? g.prog() : '')).join('|') : s.quotaN) + Object.keys(s.quests).map(id => C.qStep(id) ? id + s.quests[id].step : '').join();
  if (last.trk === key) return; last.trk = key; el.hidden = false;
  const qa = Object.keys(s.quests).filter(id => C.qStep(id)).length;
  el.innerHTML = `<div class="tk-h"><span class="mch">${n}<small>幕</small></span><b>${A.title}</b>${qa ? `<span class="tk-q">書 ${qa}</span>` : ''}</div>` + (s.main.started ? `<ul>${C.mainGoals().map(g => `<li class="${g.done ? 'done' : ''}">${g.done ? '✓' : '○'} ${g.text}${g.prog && !g.done && g.prog() ? ` <em>${g.prog()}</em>` : ''}</li>`).join('')}</ul>` : `<ul><li>○ ${A.at() ? '항구에 닿으면 막이 열린다' : '상납을 더 바치면 다음 막이 열린다'}</li></ul>`); }

/* ─────────── 흐름 ─────────── */
function handle(out) {
  const s = S();
  for (const o of out) {
    if (o.type === 'find') { findAppear[o.find.id] = performance.now(); AU.gong(); toast(`<b>${o.find.name}</b> — ${o.find.text}${o.find.gold ? ` +${fmt(o.find.gold)}냥` : ''}`, 'good'); const [x, y] = toS(o.find.x, o.find.y); pop('발견', x, y - 20, 'big'); }
    if (o.type === 'port') { portAppear[o.port] = performance.now(); AU.gong(); toast(`새 항구 — <b>${C.PORTS[o.port].name}</b>. 해도에 도장을 찍었다. 아무도 이곳 값을 모른다.`, 'good'); }
    if (o.type === 'season') { AU.season(); banner(...SEASON_BANNER[o.season]); }
    if (o.type === 'rival') { rivalMark[o.k] = { t: s.t, ch: o.rival.ch, col: o.rival.col, id: o.id }; if (s.slots.some(x => x.id === o.id) || s.dest === o.k) toast(`<b>${o.rival.name}</b>이 ${C.PORTS[o.k].name}에 ${C.G[o.id].name}${JO(C.G[o.id].name,'을','를')} 풀었다. 값이 눌린다.`, 'bad'); }
    if (o.type === 'orderLost') toast(`의뢰 기한이 지났다 — ${C.PORTS[o.order.to].name}의 ${C.G[o.order.good].name}. 명성 -20`, 'bad');
    if (o.type === 'event') openEvent(o.ev);
    if (o.type === 'arrive') openReveal(o.info);
    if (o.type === 'explored') { showSailbar(); toast('바다 한가운데 닻을 내렸다. 지도를 눌러 다음 행선지를 고르자.'); saveGame(); }
    if (o.type === 'quota') openQuota(o.res);
    if (o.type === 'news') { const n = o.news; AU.chime(); banner('報', n.title); toast(`<b>${n.title}</b><br>${n.text}`, n.closed || n.zone || n.storm || n.tax ? 'bad' : 'good'); if (n.k) rumorPulse[n.k] = performance.now(); if (n.closed) rumorPulse[n.closed] = performance.now(); if (s.mode === 'port') paintPanel(); }
    if (o.type === 'region') { AU.pay(); banner('圖', `${o.region}를 다 그렸다`); toast(`<b>${o.region}</b>의 발견을 모두 찾았다 — +${fmt(o.gold)}냥 · 명성 +100${o.map ? ` · 寶 ${o.map.name}` : ''}`, 'good'); if (o.map) mapAppear[o.map.id] = performance.now(); }
    if (o.type === 'battle') openBattle();
    if (o.type === 'dive') openDive();
    if (o.type === 'map') { mapAppear[o.map.id] = performance.now(); toast(`<b>${o.from}</b>에서 낡은 해도를 주웠다 — 寶 <b>${o.map.name}</b>`, 'good'); }
    if (o.type === 'bountyLost') toast(`현상 수배 기한이 지났다 — ${o.bounty.name}. 명성 -10`, 'bad');
    if (o.type === 'chase') { AU.drum(); toast('<b>흑기 해적선</b>이 쫓아온다! 노를 저어 따돌려라 <small>(Space)</small>', 'bad'); }
    if (o.type === 'escaped') { AU.good(); toast('흑기를 따돌렸다. 명성 +10', 'good'); }
    if (o.type === 'tired') toast('선원들이 지쳤다. 노를 거둔다.');
    if (o.type === 'bounced') { AU.bad(); toast(`<b>${C.PORTS[o.k].name}</b> 포구가 닫혀 있다${o.news ? ` — ${o.news.title}` : ''}. 뱃머리를 돌려야 한다.`, 'bad'); showSailbar(); }
    if (o.type === 'passengerLost') toast(`${o.passenger.who}가 기다리다 지쳐 다른 배로 옮겨 탔다. 명성 -15`, 'bad');
  }
  setTimeout(drainQuests, 60);
  if (s.mode === 'sail' && Math.floor(s.t * 2) !== Math.floor((trail.t || 0) * 2)) { trail.t = s.t; trail.push([s.x, s.y]); if (trail.length > 500) trail.shift(); }
}
function finish(retire) {
  const s = S(); if (!s || !$('sEnd').hidden) return; ['mEvent', 'mReveal', 'mStory', 'mQuota', 'mRetire2', 'mBattle', 'mDive', 'mBook'].forEach(id => $(id).hidden = true); hideDest(); hideSailbar(); closePanel(); hideMenu(); showCoach(false);
  if (retire && !s.ended) s.ended = 'retire';
  const sc = C.score(), rank = C.rankOf(sc), why = s.ended;
  const wasAra = META.unlocked.ara, wasTomo = META.unlocked.tomo; META.runs++; META.best = Math.max(META.best, sc);
  if (s.quotaN >= 4) META.unlocked.ara = true; if (s.quotaN >= 8) META.unlocked.tomo = true; saveMeta(); dropSave();
  const unl = [!wasAra && META.unlocked.ara ? '새 선장 — <b>아라</b> (적산 신라방의 상인)' : '', !wasTomo && META.unlocked.tomo ? '새 선장 — <b>도모</b> (하카타의 밀무역상)' : ''].filter(Boolean);
  const E = why === 'ending' && C.ENDINGS[s.ending]; if (E) { META.endings = META.endings || {}; META.endings[s.ending] = 1; saveMeta(); }
  const T = E ? [E.title, E.text] : { quota: ['곳간이 비었다', `${C.dateStr(s.t)}, 청해진에 보낼 군자금 ${fmt(C.quotaNow())}냥을 채우지 못했다.`], assassin: ['칼이 온 밤', '너무 잘 나갔다. 어느 밤, 숙소 문이 소리 없이 열렸다.'], retire: ['돛을 내리다', `${C.dateStr(s.t)}, 스스로 항해를 접었다.`] }[why] || ['항해의 끝', ''];
  const endTag = E ? `<div class="endtag ${E.kind}"><span>${E.ch}</span>${{ true: '진 엔딩', fiction: '픽션 엔딩', history: '역사 엔딩', neutral: '엔딩' }[E.kind]} · 모은 엔딩 ${Object.keys(META.endings || {}).length}/${Object.keys(C.ENDINGS).length}</div>` : '';
  const fate = c => { const d = C.CREW.find(x => x.k === c.k); return !c.alive ? '당신 대신 칼을 받았다.' : c.done ? { helm: '우산도를 본 뒤로 폭풍을 먼저 읽었다.', deck: '원수를 갚고 당신 등 뒤를 지켰다.', tongue: '동생을 만나고 소식을 날랐다.' }[c.k] : c.asked ? `끝내 부탁을 이루지 못했다 — ${d.hint}` : '그저 묵묵히 일했다.'; };
  const hit = s.stats.hits + s.stats.misses ? Math.round(s.stats.hits / (s.stats.hits + s.stats.misses) * 100) : 0;
  $('endScroll').innerHTML = `<div class="rank">${rank.replace('(大商)', '<br>大商')}</div>
    ${endTag}<h2>${T[0]}</h2><p class="lead">${T[1]}</p>
    <dl class="ledger"><dt>버틴 상납</dt><dd>${s.quotaN}번 · ${Math.floor(s.quotaN / 4)}년 ${s.quotaN % 4}계절</dd><dt>바친 군자금</dt><dd>${fmt(s.paid)}냥</dd><dt>남긴 재산</dt><dd>${fmt(C.assets())}냥</dd><dt>점수</dt><dd>${fmt(sc)}</dd>
      <dt>항해</dt><dd>${s.stats.voyages}번</dd><dt>소문 적중</dt><dd>${hit}%</dd><dt>닻 내린 항구</dt><dd>${Object.keys(s.docked).length} / ${C.PORT_IDS.length}</dd><dt>발견</dt><dd>${Object.keys(s.found).length} / ${C.FINDS.length}</dd>
      <dt>완수한 의뢰</dt><dd>${s.stats.orders}건</dd><dt>해전 승리</dt><dd>${s.stats.wins || 0}번 · 잡은 두목 ${s.stats.bounties || 0}</dd><dt>유물</dt><dd>${Object.keys(s.relics || {}).length} / ${C.RELICS.length}</dd><dt>끝낸 이야기</dt><dd>${s.stats.quests || 0} / ${C.QUESTS.length}</dd><dt>가장 큰 거래</dt><dd>${s.stats.bestTrade || '없음'}</dd><dt>최고 기록</dt><dd>${fmt(META.best)}</dd></dl>
    <ul class="fates">${s.crew.map(c => `<li><b>${C.CREW.find(x => x.k === c.k).name}</b><span>${fate(c)}</span></li>`).join('')}</ul>
    ${unl.length ? `<div class="unlock">${unl.join('<br>')}</div>` : ''}
    <div class="start-row" style="margin-top:20px;justify-content:flex-start"><button class="btn main" id="eAgain">다시 바다로</button><button class="btn" id="eTitle">선장 고르기</button></div>`;
  $('sEnd').hidden = false; AU[why === 'retire' ? 'gong' : 'drum']();
  $('eAgain').onclick = () => { $('sEnd').hidden = true; startGame(s.cap); };
  $('eTitle').onclick = () => { $('sEnd').hidden = true; showTitle(); };
}

/* ─────────── 메뉴 ─────────── */
function hideMenu() { $('menu').hidden = true; }
$('tracker').onclick = () => { if (!anyModal()) openBook('quest'); };
$('bBook').onclick = e => { e.stopPropagation(); hideMenu(); if (anyModal() && $('mBook').hidden) return; if (!$('mBook').hidden) { $('mBook').hidden = true; return; } openBook(); };
$('bkClose').onclick = () => { $('mBook').hidden = true; };
$('bMenu').onclick = e => { e.stopPropagation(); AU.init(); $('mSound').textContent = AU.on ? '소리 끄기' : '소리 켜기'; $('menu').hidden = !$('menu').hidden; };
$('mWide').onclick = () => { const s = S(); cam.wide = !cam.wide; $('mWide').textContent = cam.wide ? '가까이 보기' : '해도 전체 보기'; lookAt(cam.wide ? C.WORLD.w / 2 : s.x, cam.wide ? C.WORLD.h / 2 : s.y, cam.wide ? cam.fit : defaultZoom()); hideMenu(); };
$('mShip').onclick = () => { const s = S(); cam.wide = false; $('mWide').textContent = '해도 전체 보기'; lookAt(s.x, s.y, defaultZoom()); hideMenu(); };
$('mSound').onclick = () => { AU.init(); AU.set(!AU.on); $('mSound').textContent = AU.on ? '소리 끄기' : '소리 켜기'; };
$('mRetire').onclick = () => { hideMenu(); if (!S() || S().ended) return; $('mRetire2').hidden = false; };
$('mRetireYes').onclick = () => { $('mRetire2').hidden = true; finish(true); };
$('mRetireNo').onclick = () => { $('mRetire2').hidden = true; };

/* ─────────── 첫 화면 ─────────── */
let capSel = 'gungbok';
function showTitle() { $('sTitle').hidden = false; $('bCont').hidden = !hasSave();
  $('caps').innerHTML = Object.entries(C.CAPTAINS).map(([id, c]) => { const open = !c.unlock || META.unlocked[id];
    return `<button class="cap ${capSel === id ? 'on' : ''}" data-cap="${id}" ${open ? '' : 'disabled'}><span class="nm">${c.name}</span><small>${c.title}</small><p>${open ? c.perk : ''}</p>${open ? '' : `<span class="lock">${c.unlock}</span>`}</button>`; }).join('');
  $('caps').querySelectorAll('.cap').forEach(b => b.onclick = () => { capSel = b.dataset.cap; showTitle(); });
  $('bestLine').textContent = META.best ? `최고 기록 ${fmt(META.best)} · ${META.runs}번 항해 · 엔딩 ${Object.keys(META.endings || {}).length}/${Object.keys(C.ENDINGS).length}` : ''; }
function resetView() { spNote = null; mapAppear = {}; BT.open = false; trail = []; portAppear = {}; findAppear = {}; rumorPulse = {}; rivalMark = {}; lastQuote = null; speedIdx = 0; for (const k of Object.keys(last)) delete last[k]; camGoal = null; }
function startGame(cap) {
  AU.init(); C.newGame(cap); fogReset(); resetView();
  $('sTitle').hidden = true; cam.touched = 0; cam.wide = false; openPanel(); relayout(true); paintHud(); saveGame();
  const c = C.CAPTAINS[cap]; toast(`${c.name} — ${c.title}. ${C.PORTS[c.start].name}에서 시작한다. 첫 상납은 ${fmt(C.quotaNow())}냥, ${Math.round(C.daysToDue())}일 뒤.`);
  setTimeout(() => banner('春', '봄 · 계절이 끝날 때마다 청해진 군자금을 바친다'), 300);
  coachStep = META.tut ? -2 : -1; if (!META.tut && cap === 'gungbok') setTimeout(() => coach(0), 1600);
  setTimeout(runStories, 1300);
}
$('bStart').onclick = () => startGame(capSel);
$('bCont').onclick = () => { AU.init(); if (!loadGame()) { toast('이어할 항해가 없다.'); return; } fogRebuild(); resetView(); $('sTitle').hidden = true; coachStep = -2; cam.touched = 0; openPanel(); relayout(true); paintHud(); toast('항해를 이어간다.'); runStories(); };
$('bSound').onclick = () => { AU.init(); AU.set(!AU.on); };
addEventListener('keydown', e => { const s = S(); if (s && !$('mBattle').hidden && s.battle && !s.battle.over && /^[1-5]$/.test(e.key)) { const o = C.battleOpts()[+e.key - 1]; if (o && o.ok) battleDo(o.id); return; }
  if (s && !$('mDive').hidden && s.dive && !s.dive.over) { if (e.key === 'ArrowDown') { e.preventDefault(); diveDo('down'); } if (e.key === 'ArrowUp') { e.preventDefault(); diveDo('up'); } return; }
  if (s && !$('mBook').hidden && e.key === 'Escape') { $('mBook').hidden = true; return; }
  if (s && $('sTitle').hidden && (e.key === 'b' || e.key === 'B') && (!anyModal() || !$('mBook').hidden)) { if ($('mBook').hidden) openBook(); else $('mBook').hidden = true; return; }
  if (!s || anyModal() || !$('sTitle').hidden) return; if (e.key === 'Escape') { hideDest(); hideMenu(); }
  if (s.mode === 'sail' && ['1', '2', '3'].includes(e.key)) { speedIdx = +e.key - 1; showSailbar(); }
  if (s.mode === 'sail' && (e.code === 'Space' || e.key === ' ')) { e.preventDefault(); toggleRow(); } });
addEventListener('resize', () => { relayout(false); if (BT.open) btLayout(); placeToasts(); });
document.addEventListener('click', e => { if (!$('menu').hidden && !e.target.closest('#menu') && !e.target.closest('#bMenu')) hideMenu(); });

/* ─────────── 루프 ─────────── */
let prev = performance.now();
function frame(now) { const dt = Math.min(.1, (now - prev) / 1000); prev = now; clock += dt; const s = S();
  for (const p of winds) { if (p.life > 0 && s) { const w = C.wind(s.t, p.x, p.y); p.x += Math.cos(w.dir) * w.str * 30 * dt; p.y += Math.sin(w.dir) * w.str * 30 * dt; p.life -= dt; } }
  if (s && !s.ended && s.mode === 'sail' && !anyModal() && $('sTitle').hidden) { handle(C.update(dt / SEC_PER_DAY * SPEEDS[speedIdx]));
    if (!cam.wide && performance.now() - cam.touched > 2500 && !camGoal) { cam.x += (s.x - cam.x) * .06; cam.y += (s.y - cam.y) * .06; clampCam(); } }
  if (camGoal) { cam.x += (camGoal.x - cam.x) * .12; cam.y += (camGoal.y - cam.y) * .12; cam.z += (camGoal.z - cam.z) * .12; clampCam(); if (Math.abs(camGoal.x - cam.x) < 1 && Math.abs(camGoal.y - cam.y) < 1 && Math.abs(camGoal.z - cam.z) < .002) camGoal = null; }
  draw(); if (s) paintHud(); if (BT.open) drawBattle(); requestAnimationFrame(frame); }

/* ─────────── 시작 ─────────── */
paintSoundIcon();
const fontsReady = (document.fonts && document.fonts.load) ? Promise.race([Promise.all([document.fonts.load(`40px "Song Myung"`), document.fonts.load(`15px "IBM Plex Sans KR"`)]), new Promise(r => setTimeout(r, 1800))]) : Promise.resolve();
fontsReady.then(() => { paintBase(); });
C.newGame('gungbok'); fogReset(); relayout(true); cam.z = cam.fit; cam.x = C.WORLD.w / 2; cam.y = C.WORLD.h / 2; showTitle(); requestAnimationFrame(frame);
window.__CHUNGHAE = { C, startGame, paintTracker, setTab: t => { panelTab = t; paintPanel(); }, openBook, drainQuests, runStories, openBattle, openDive, battleDo, diveDo, toggleRow, paintPanel, openPanel, finish, openReveal, openEvent, openQuota, showDest, cam, relayout, lookAt };
})();
