/* ═══════════════════════════════════════════════════════════
   청해 — 화면 · 소리 · 흐름 (v6)
   ═══════════════════════════════════════════════════════════ */
(() => {
'use strict';
const C = CORE, JO = C.JO, $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString('ko-KR');
const won = n => fmt(n) + '냥';  // 돈은 늘 "1,150냥" — 숫자와 단위 사이를 띄우지 않는다
const COARSE = matchMedia('(pointer:coarse)').matches;  // 손가락 기기면 Shift 대신 '길게 누르기'를 안내한다
const css = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
const COL = { hanji: css('--hanji'), hanji2: css('--hanji-2'), hanji3: css('--hanji-3'), ink: css('--ink'), ink2: css('--ink-2'), ink3: css('--ink-3'), cheong: css('--cheong'), rok: css('--rok'), rok2: css('--rok-2'), ju: css('--ju'), hwang: css('--hwang'), gold: css('--gold'), jok: css('--jok') };
/* 움직임 줄이기 — 켜져 있으면 물결·흔들림·숫자 굴리기를 멈춘다 */
const RMQ = matchMedia('(prefers-reduced-motion: reduce)'); let RM = RMQ.matches; RMQ.addEventListener && RMQ.addEventListener('change', e => { if (META.rm == null) RM = e.matches; });
const KEY = 'chunghae.v7.save', MKEY = 'chunghae.v2.meta';
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
/* 움직임 줄이기: 메뉴에서 고른 값(META.rm)이 기기 설정보다 앞선다. body.rm / body.rm-off 로 CSS 움직임도 함께 멈추거나 되살린다 */
function setRM(v, keep) { if (!keep) { META.rm = v; saveMeta(); } RM = v; document.body.classList.toggle('rm', v); document.body.classList.toggle('rm-off', META.rm === false); const st = $('mMotionSt'); if (st) st.textContent = v ? '켬' : '끔'; }
if (META.rm != null) setRM(!!META.rm, true);
function saveGame() { const s = S(); if (!s || s.ended || s.mode !== 'port' || s.draft) return; try { localStorage.setItem(KEY, C.saveData()); } catch (e) {} }
function hasSave() { try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); return !!(d && d.v === 7 && !d.ended); } catch (e) { return false; } }
function loadGame() { try { return !!C.loadData(localStorage.getItem(KEY)); } catch (e) { return false; } } // 난이도가 없던 옛 저장은 바람으로 읽힌다
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
  const g = base.getContext('2d'), r = rng(828); g.setTransform(RS, 0, 0, RS, 0, 0); const W = C.WORLD.w, H = C.WORLD.h, D = css('--display'), BR = css('--brush');
  g.fillStyle = COL.hanji; g.fillRect(0, 0, W, H); paperTexture(g, W, H, r, 9000);
  // 바다: 남동쪽으로 갈수록 짙은 석청 물빛, 먹 번짐 얼룩
  const sea = g.createLinearGradient(600, 300, 1700, 2100); sea.addColorStop(0, 'rgba(118,163,150,.40)'); sea.addColorStop(1, 'rgba(52,108,122,.60)'); g.fillStyle = sea; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 46; i++) { const x = r() * W, y = r() * H, R = 60 + r() * 180, gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, `rgba(36,70,84,${.03 + r() * .05})`); gr.addColorStop(1, 'rgba(36,70,84,0)'); g.fillStyle = gr; g.fillRect(x - R, y - R, R * 2, R * 2); }
  // 해안 둘레: 얕은 물의 밝은 띠와 점선 물금
  for (const poly of Object.values(C.LAND)) { polyPath(g, poly, 0, r); g.lineJoin = 'round'; g.strokeStyle = 'rgba(232,227,211,.26)'; g.lineWidth = 46; g.stroke(); g.strokeStyle = 'rgba(232,227,211,.34)'; g.lineWidth = 20; g.stroke(); g.strokeStyle = 'rgba(35,80,110,.18)'; g.lineWidth = 30; g.setLineDash([1.2, 8]); g.stroke(); g.setLineDash([]); }
  g.lineCap = 'round';
  for (let row = 0, y = 8; y < H; y += 13, row++) for (let x = (row % 2) * 10; x < W; x += 20) {
    if (!C.seaAt(x, y)) continue;
    g.strokeStyle = `rgba(35,80,110,${.12 + r() * .08})`; g.lineWidth = .9; g.beginPath(); g.arc(x, y + 4, 7, Math.PI * 1.13, Math.PI * 1.87); g.stroke();
    g.strokeStyle = 'rgba(35,80,110,.07)'; g.lineWidth = .7; g.beginPath(); g.arc(x, y + 4, 4, Math.PI * 1.18, Math.PI * 1.82); g.stroke(); }
  for (const z of C.ZONES) { g.save(); g.beginPath(); g.arc(z.x, z.y, z.r, 0, 7); g.clip();
    g.strokeStyle = 'rgba(176,58,38,.2)'; g.lineWidth = 1.2; for (let d = -z.r * 2; d < z.r * 2; d += 9) { g.beginPath(); g.moveTo(z.x + d - z.r, z.y - z.r); g.lineTo(z.x + d + z.r, z.y + z.r); g.stroke(); }
    const zg = g.createRadialGradient(z.x, z.y, z.r * .4, z.x, z.y, z.r); zg.addColorStop(0, 'rgba(176,58,38,0)'); zg.addColorStop(1, 'rgba(176,58,38,.12)'); g.fillStyle = zg; g.fillRect(z.x - z.r, z.y - z.r, z.r * 2, z.r * 2); g.restore();
    g.setLineDash([7, 5]); g.strokeStyle = 'rgba(176,58,38,.62)'; g.lineWidth = 1.5; g.beginPath(); g.arc(z.x, z.y, z.r, 0, 7); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(176,58,38,.72)'; g.font = `26px ${BR}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('海賊', z.x, z.y); }
  // 땅: 종이 위 담채, 해안 안쪽으로 먹이 번진 띠
  for (const poly of Object.values(C.LAND)) { polyPath(g, poly, 1.6, r); g.fillStyle = '#dccea2'; g.fill(); g.save(); g.clip();
    const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(160,140,90,.10)'); sh.addColorStop(1, 'rgba(120,110,70,.16)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
    for (let i = 0; i < Math.min(60, poly.length); i++) { const xs = poly[Math.floor(r() * poly.length)]; const R = 30 + r() * 90, gr = g.createRadialGradient(xs[0], xs[1], 0, xs[0], xs[1], R); gr.addColorStop(0, `rgba(118,128,92,${.06 + r() * .08})`); gr.addColorStop(1, 'rgba(118,128,92,0)'); g.fillStyle = gr; g.fillRect(xs[0] - R, xs[1] - R, R * 2, R * 2); }
    polyPath(g, poly, 0, r); g.lineJoin = 'round'; g.strokeStyle = 'rgba(96,84,52,.16)'; g.lineWidth = 30; g.stroke(); g.strokeStyle = 'rgba(70,64,40,.16)'; g.lineWidth = 10; g.stroke(); g.restore(); }
  g.save(); g.beginPath(); for (const poly of Object.values(C.LAND)) { poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); } g.clip(); paperTexture(g, W, H, r, 3000); g.restore();
  // 산: 먹으로 그린 봉우리 — 위는 짙고 아래로 갈수록 엷다
  const peaks = { main: 260, kyushu: 22, honshu: 34, shikoku: 12, jeju: 5, taiwan: 6, okinawa: 3 };
  for (const [name, n] of Object.entries(peaks)) { const poly = C.LAND[name]; const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const m = n < 8 ? 7 : 18, gap = n < 8 ? 14 : 34, pts = [];
    for (let i = 0; i < n * 60 && pts.length < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); if (!inPoly(x, y, poly) || !inPoly(x - m, y, poly) || !inPoly(x + m, y, poly) || !inPoly(x, y - m, poly) || !inPoly(x, y + m, poly)) continue; if (pts.some(p => Math.hypot(p[0] - x, p[1] - y) < gap)) continue; pts.push([x, y]); }
    pts.sort((a, b) => a[1] - b[1]); for (const [x, y] of pts) mountain(g, x, y, n < 8 ? .8 : .9 + r() * .8, r); }
  // 해안선: 굵기가 흔들리는 먹선 세 겹
  for (const poly of Object.values(C.LAND)) { polyPath(g, poly, 1.3, r); g.strokeStyle = 'rgba(27,35,36,.85)'; g.lineWidth = 1.7; g.lineJoin = 'round'; g.stroke(); polyPath(g, poly, 2.8, r); g.strokeStyle = 'rgba(27,35,36,.22)'; g.lineWidth = .9; g.stroke(); polyPath(g, poly, 5, r); g.strokeStyle = 'rgba(27,35,36,.07)'; g.lineWidth = 3; g.stroke(); }
  for (const [txt, lon, lat, size, kind] of C.LABELS) { const [x, y] = C.P(lon, lat); g.fillStyle = kind === 'land' ? 'rgba(27,35,36,.36)' : 'rgba(35,80,110,.42)'; g.font = `${size}px ${kind === 'land' ? D : BR}`; g.textAlign = 'center'; g.textBaseline = 'middle'; [...txt].forEach((ch, i) => g.fillText(ch, x, y + i * size * 1.05)); }
  // 테두리: 먹선 두 겹 사이 주사선 + 모서리 꺾쇠
  g.strokeStyle = 'rgba(27,35,36,.62)'; g.lineWidth = 3; g.strokeRect(6, 6, W - 12, H - 12); g.lineWidth = .8; g.strokeRect(15, 15, W - 30, H - 30);
  g.strokeStyle = 'rgba(176,58,38,.5)'; g.lineWidth = 1.2; g.strokeRect(11, 11, W - 22, H - 22);
  for (const [cx, cy, sx, sy] of [[15, 15, 1, 1], [W - 15, 15, -1, 1], [15, H - 15, 1, -1], [W - 15, H - 15, -1, -1]]) { g.strokeStyle = COL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + sx * 34, cy); g.lineTo(cx, cy); g.lineTo(cx, cy + sy * 34); g.moveTo(cx + sx * 8, cy + sy * 20); g.lineTo(cx + sx * 8, cy + sy * 8); g.lineTo(cx + sx * 20, cy + sy * 8); g.stroke(); }
  const sx = 60, sy = H - 60; g.strokeStyle = COL.ink; g.lineWidth = 1.4; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 200, sy); for (let i = 0; i <= 4; i++) { g.moveTo(sx + i * 50, sy - (i % 2 ? 4 : 7)); g.lineTo(sx + i * 50, sy); } g.stroke();
  g.fillStyle = COL.ink; for (let i = 0; i < 4; i += 2) g.fillRect(sx + i * 50, sy - 3, 50, 3);
  g.font = `16px ${D}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('五百里', sx, sy - 12);
  compassRose(g); mapCartouche(g);
  baseReady = true;
}
/* 윤도(나침반) — 바다 빈 곳을 찾아 하나 그린다 */
function compassRose(g) { const R = 92; let at = null;
  for (const [lon, lat] of [[136.5, 29.6], [135.5, 28.6], [137.4, 31], [134, 27.5], [128.5, 25.6], [124, 27]]) { const [x, y] = C.P(lon, lat); let ok = x > R + 30 && x < C.WORLD.w - R - 30 && y < C.WORLD.h - R - 30; for (let a = 0; a < 6.3 && ok; a += .4) ok = C.seaAt(x + Math.cos(a) * R, y + Math.sin(a) * R) && C.seaAt(x + Math.cos(a) * R * .5, y + Math.sin(a) * R * .5); if (ok) { at = [x, y]; break; } }
  if (!at) return; const [x, y] = at, SEAL = css('--seal'); g.save(); g.translate(x, y);
  const bg = g.createRadialGradient(0, 0, 10, 0, 0, R); bg.addColorStop(0, 'rgba(245,240,227,.92)'); bg.addColorStop(1, 'rgba(236,229,211,.78)'); g.fillStyle = bg; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill();
  g.strokeStyle = 'rgba(27,35,36,.75)'; for (const [rr, lw] of [[R, 2], [R - 5, .8], [R - 30, 1], [R - 46, .8], [14, 1]]) { g.lineWidth = lw; g.beginPath(); g.arc(0, 0, rr, 0, 7); g.stroke(); }
  for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2, l = i % 3 === 0 ? 7 : 3.5; g.lineWidth = i % 3 === 0 ? 1.1 : .6; g.beginPath(); g.moveTo(Math.cos(a) * (R - 5), Math.sin(a) * (R - 5)); g.lineTo(Math.cos(a) * (R - 5 - l), Math.sin(a) * (R - 5 - l)); g.stroke(); }
  const ZODIAC = '子丑寅卯辰巳午未申酉戌亥'; g.font = `13px ${SEAL}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; g.fillStyle = i % 3 === 0 ? COL.ju : 'rgba(27,35,36,.8)'; g.fillText(ZODIAC[i], Math.cos(a) * (R - 20), Math.sin(a) * (R - 20) + .5); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 - Math.PI / 2, L = i % 2 ? R - 52 : R - 34, w = i % 2 ? 5 : 8; g.fillStyle = i === 0 ? COL.ju : i % 2 ? 'rgba(35,80,110,.55)' : 'rgba(27,35,36,.8)';
    g.beginPath(); g.moveTo(Math.cos(a) * L, Math.sin(a) * L); g.lineTo(Math.cos(a + Math.PI / 2) * w, Math.sin(a + Math.PI / 2) * w); g.lineTo(0, 0); g.lineTo(Math.cos(a - Math.PI / 2) * w, Math.sin(a - Math.PI / 2) * w); g.closePath(); g.fill(); }
  g.fillStyle = COL.hanji2; g.beginPath(); g.arc(0, 0, 5, 0, 7); g.fill(); g.strokeStyle = COL.ink; g.lineWidth = 1; g.stroke();
  g.fillStyle = COL.ju; g.fillRect(-15, -R - 32, 30, 30); g.fillStyle = COL.hanji2; g.font = `22px ${SEAL}`; g.fillText('北', 0, -R - 16); g.restore(); }
/* 해도 이름 패 — 북서쪽 뭍 위 */
function mapCartouche(g) { const x = 44, y = 44, w = 150, h = 250, BR = css('--brush'), D = css('--display');
  g.save(); g.fillStyle = 'rgba(245,240,227,.96)'; g.shadowColor = 'rgba(27,35,36,.25)'; g.shadowBlur = 12; g.shadowOffsetY = 4; g.fillRect(x, y, w, h); g.restore();
  g.strokeStyle = COL.ink; g.lineWidth = 2.2; g.strokeRect(x + 5, y + 12, w - 10, h - 17); g.lineWidth = .8; g.strokeRect(x + 10, y + 17, w - 20, h - 27);
  let yy = y; for (const [c, t] of [['#f3efe4', 1], ['#2f7a68', 3], ['#2a4f86', 2], ['#f3efe4', 1], ['#b8442e', 3]]) { g.fillStyle = c; g.fillRect(x, yy, w, t); yy += t; }
  g.fillStyle = COL.ink; g.font = `58px ${BR}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('淸', x + w / 2 + 14, y + 70); g.fillText('海', x + w / 2 + 14, y + 132);
  g.font = `16px ${D}`; [...'바다의길'].forEach((ch, i) => g.fillText(ch, x + 32, y + 52 + i * 21));
  g.fillStyle = COL.ju; g.fillRect(x + w / 2 - 6, y + 176, 40, 40); g.fillStyle = COL.hanji2; g.font = `15px ${css('--seal')}`; g.fillText('航路', x + w / 2 + 14, y + 189); g.fillText('之圖', x + w / 2 + 14, y + 205);
  g.fillStyle = 'rgba(27,35,36,.62)'; g.font = `13px ${D}`; g.fillText('太和 二年', x + w / 2, y + h - 22); }
function mountain(g, x, y, s, r) { g.save(); g.translate(x, y); g.scale(s, s);
  const n = 2 + Math.floor(r() * 2), pk = []; for (let i = 0; i < n; i++) pk.push([-13 + i * (26 / (n - 1)) + (r() - .5) * 4, 7 + r() * 8]);
  const top = -Math.max(...pk.map(p => p[1])), ridge = () => { g.beginPath(); g.moveTo(-19, 6); for (const [px, h] of pk) { g.quadraticCurveTo(px - 5, 6 - h * .45, px, 6 - h); g.quadraticCurveTo(px + 5, 6 - h * .45, px + 7, 6); } };
  ridge(); g.closePath(); const gr = g.createLinearGradient(0, top + 6, 0, 7), t = r(); gr.addColorStop(0, `rgba(${34 + t * 14},${58 + t * 10},52,.82)`); gr.addColorStop(.55, `rgba(${80 + t * 20},${116 + t * 14},92,.5)`); gr.addColorStop(1, 'rgba(120,140,100,.06)'); g.fillStyle = gr; g.fill();
  ridge(); g.strokeStyle = 'rgba(27,35,36,.62)'; g.lineWidth = .9; g.stroke();
  g.strokeStyle = 'rgba(27,35,36,.32)'; g.lineWidth = .6; for (const [px, h] of pk) for (let k = 0; k < 3; k++) { const ox = px + (r() - .5) * 6, oy = 6 - h * (.55 + r() * .3); g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + (r() - .3) * 3, oy + 3 + r() * 3); g.stroke(); }
  g.fillStyle = 'rgba(27,35,36,.4)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(-16 + r() * 32, 5 + r() * 2, .9 + r() * .8, 0, 7); g.fill(); }
  g.restore(); }

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
  W = innerWidth; H = innerHeight; const dpr = Math.min(2, devicePixelRatio || 1); if (dpr !== DPR) sealCache.clear(); DPR = dpr; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const top = NARROW() ? 110 : 76, pan = $('panel'); let a = { x: 12, y: top, w: W - 24, h: H - top - 12 };
  if (!pan.hidden) { if (NARROW()) a.h = H - top - pan.getBoundingClientRect().height - 8; else if (!pan.classList.contains('min')) a.w = W - 24 - 396; }
  AREA = a; cam.fit = Math.min(a.w / C.WORLD.w, a.h / C.WORLD.h);
  if (recenter) { cam.z = cam.wide ? cam.fit : defaultZoom(); const s = S(); if (s) { cam.x = s.x; cam.y = s.y; } }
  clampCam(); placeCrew(); placeToasts();
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
    if (!RM) for (const p of winds) { if (p.life <= 0 || p.x < vx0 - 40 || p.x > vx1 + 40 || p.y < vy0 - 40 || p.y > vy1 + 40) { p.x = vx0 + Math.random() * (vx1 - vx0); p.y = vy0 + Math.random() * (vy1 - vy0); p.max = p.life = 1.4 + Math.random() * 1.8; continue; }
      const w = C.wind(s.t, p.x, p.y), k = Math.sin(Math.PI * (1 - p.life / p.max)); if (C.onLand(p.x, p.y)) continue; const L = (10 + w.str * 14) / Math.max(.6, cam.z) * .9;
      ctx.strokeStyle = `rgba(35,80,110,${.5 * k})`; ctx.lineWidth = 1.6 / cam.z; ctx.beginPath(); ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x - Math.cos(w.dir) * L * .5 + Math.sin(w.dir) * 2, p.y - Math.sin(w.dir) * L * .5 - Math.cos(w.dir) * 2, p.x - Math.cos(w.dir) * L, p.y - Math.sin(w.dir) * L); ctx.stroke(); }
    if (trail.length > 1) { ctx.strokeStyle = 'rgba(27,35,36,.5)'; ctx.lineWidth = 1.6 / cam.z; ctx.setLineDash([1 / cam.z, 6 / cam.z]); ctx.beginPath(); trail.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.lineTo(s.x, s.y); ctx.stroke(); ctx.setLineDash([]); }
    if (s.mode === 'sail' && s.path) { const rest = [[s.x, s.y], ...s.path.slice(s.seg + 1)]; routeLine(rest, COL.ink, true, .55); }
    if (destPlan) { const routes = [['alt', destPlan.alt], ['main', destPlan.main]].filter(r => r[1]).sort((a, b) => (a[0] === routePick) - (b[0] === routePick));
      for (const [id, r] of routes) routeLine(r.path, id === 'main' ? COL.ju : COL.cheong, routePick === id, routePick === id ? 1 : .38);
      const [ex, ey] = destPlan.main.path[destPlan.main.path.length - 1], pr = RM ? 0 : Math.sin(clock * 4); ctx.strokeStyle = COL.ju; ctx.lineWidth = 2 / cam.z; ctx.beginPath(); ctx.arc(ex, ey, (12 + pr * 2) / cam.z, 0, 7); ctx.stroke();
      ctx.globalAlpha = .35; ctx.beginPath(); ctx.arc(ex, ey, (20 + pr * 3) / cam.z, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    for (const z of C.ZONES) { const r = C.zoneR(z); if (r <= z.r + 1) continue; ctx.save(); ctx.beginPath(); ctx.arc(z.x, z.y, r, 0, 7); ctx.arc(z.x, z.y, z.r, 0, 7, true); ctx.fillStyle = 'rgba(176,58,38,.13)'; ctx.fill();
      ctx.setLineDash([6 / cam.z, 5 / cam.z]); ctx.lineDashOffset = RM ? 0 : -clock * 10 / cam.z; ctx.strokeStyle = 'rgba(176,58,38,.75)'; ctx.lineWidth = 1.8 / cam.z; ctx.beginPath(); ctx.arc(z.x, z.y, r, 0, 7); ctx.stroke(); ctx.restore(); }
  }
  fogPump(); ctx.drawImage(fog, 0, 0, C.WORLD.w, C.WORLD.h);
  ctx.restore();
  vignette();
  if (!s) return;
  drawTargets(s); drawMissed(s); drawMarks(s); drawQuestMarks(s); drawRivals(s); drawShip(s);
}
/* 뱃길: 옅은 붓 자국 위에 점선, 고른 길에는 흘러가는 꺾쇠 */
function routeLine(path, col, on, alpha) { if (!path || path.length < 2) return; const z = cam.z;
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = col; ctx.globalAlpha = alpha * .16; ctx.lineWidth = (on ? 9 : 5) / z; ctx.beginPath(); path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  ctx.globalAlpha = alpha; ctx.lineWidth = (on ? 2.6 : 1.6) / z; ctx.setLineDash([9 / z, 6 / z]); ctx.lineDashOffset = on && !RM ? -clock * 18 / z : 0; ctx.stroke(); ctx.setLineDash([]);
  if (on) { const seg = []; let tot = 0; for (let i = 1; i < path.length; i++) { const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); seg.push(l); tot += l; }
    const gap = 70 / Math.max(.5, z), off = RM ? 0 : (clock * 26) % gap; ctx.fillStyle = col;
    for (let d = gap * .5 + off; d < tot - 20 / z; d += gap) { let k = 0, acc = 0; while (k < seg.length && acc + seg[k] < d) acc += seg[k++]; if (k >= seg.length) break; const q = (d - acc) / seg[k], a = path[k], b = path[k + 1];
      const x = a[0] + (b[0] - a[0]) * q, y = a[1] + (b[1] - a[1]) * q, ang = Math.atan2(b[1] - a[1], b[0] - a[0]), u = 5 / z;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * u * 1.4, y + Math.sin(ang) * u * 1.4); ctx.lineTo(x + Math.cos(ang + 2.4) * u, y + Math.sin(ang + 2.4) * u); ctx.lineTo(x + Math.cos(ang - 2.4) * u, y + Math.sin(ang - 2.4) * u); ctx.closePath(); ctx.fill(); }
    const [sx, sy] = path[0]; ctx.beginPath(); ctx.arc(sx, sy, 3.5 / z, 0, 7); ctx.fill(); }
  ctx.restore(); }
/* 화면 가장자리를 종이 그늘로 */
let vig = null;
function vignette() { if (!vig || vig.w !== W || vig.h !== H) { const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .42, W / 2, H / 2, Math.hypot(W, H) * .62); g.addColorStop(0, 'rgba(60,48,26,0)'); g.addColorStop(1, 'rgba(60,48,26,.2)'); vig = { w: W, h: H, g }; }
  ctx.fillStyle = vig.g; ctx.fillRect(0, 0, W, H); }
/* 도장: 글자마다 한 번 그려 두고 찍는다. 가장자리가 고르지 않고 인주가 군데군데 빠진 낙관 */
const sealCache = new Map();
function sealSprite(ch, size, col) { const key = ch + '|' + Math.round(size) + '|' + col; let c = sealCache.get(key); if (c) return c;
  const px = Math.ceil(size * DPR) + 4; c = document.createElement('canvas'); c.width = c.height = px; const g = c.getContext('2d'), r = rng(ch.charCodeAt(0) * 31 + Math.round(size)); const m = 2, S2 = px - m * 2;
  g.fillStyle = col; g.beginPath(); const j = () => (r() - .5) * S2 * .035; g.moveTo(m + j(), m + j()); g.lineTo(m + S2 + j(), m + j()); g.lineTo(m + S2 + j(), m + S2 + j()); g.lineTo(m + j(), m + S2 + j()); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(245,240,227,.8)'; g.lineWidth = Math.max(1, S2 * .045); const b = S2 * .1; g.strokeRect(m + b, m + b, S2 - b * 2, S2 - b * 2);
  g.fillStyle = COL.hanji2; g.font = `${Math.round(S2 * .64)}px ${css('--seal')}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, px / 2, px / 2 + S2 * .03);
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < S2 * 1.4; i++) { g.globalAlpha = .25 + r() * .5; g.beginPath(); g.arc(m + r() * S2, m + r() * S2, r() * S2 * .028 + .3, 0, 7); g.fill(); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; sealCache.set(key, c); return c; }
function seal(x, y, ch, size, rot, alpha, col) { const sp = sealSprite(ch, size, col || COL.ju); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(27,35,36,.16)'; ctx.fillRect(-size / 2 + 1.5, -size / 2 + 2.5, size, size); const d = size * (sp.width / ((sp.width - 4) || 1)); ctx.drawImage(sp, -d / 2, -d / 2, d, d); ctx.restore(); }
function label(txt, x, y, size, col, font) { ctx.font = `${size}px ${font || css('--ui')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(245,240,227,.92)'; ctx.lineWidth = 3.5; ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y); }
function glyphDot(x, y, r, g, alpha) { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = g.col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = COL.hanji2; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = COL.hanji2; ctx.font = `${Math.round(r * 1.25)}px ${css('--seal')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(g.ch, x, y + .5); ctx.restore(); }
let hoverPort = null;
const onScreen = (x, y, m = 60) => x > -m && y > -m && x < W + m && y < H + m;
const news = { fest: {}, key: '' };
function drawMarks(s) {
  const nk = s.news.map(n => n.id + n.e).join() + Math.floor(s.t); if (news.key !== nk) { news.key = nk; news.fest = {}; for (const n of C.liveNews()) if (n.festival) news.fest[n.festival] = 1; }
  const sz = NARROW() ? 22 : 26, small = cam.z < cam.fit * 1.6, SEALF = css('--seal'), now = performance.now(), pulse = RM ? 0 : Math.sin(clock * 3);
  for (const f of C.FINDS) { if (!s.found[f.id]) continue; const [x, y] = toS(f.x, f.y); if (!onScreen(x, y)) continue; const a = Math.min(1, (now - (findAppear[f.id] || 0)) / 600);
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(245,240,227,.85)'; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 7); ctx.fill(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.3; ctx.stroke(); ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); ctx.globalAlpha = 1; if (!small) label(f.name, x, y + 7, 12, COL.ink2, css('--display')); }
  for (const k of C.PORT_IDS) { if (s.known[k] || !C.revealed(C.PORTS[k].x, C.PORTS[k].y)) continue; const [x, y] = toS(C.PORTS[k].x, C.PORTS[k].y); if (!onScreen(x, y)) continue;
    ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = COL.ju; ctx.lineWidth = 1.3; ctx.fillStyle = 'rgba(245,240,227,.7)'; ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz); ctx.strokeRect(x - sz / 2, y - sz / 2, sz, sz); ctx.restore(); ctx.fillStyle = COL.ju; ctx.font = `600 ${sz * .6}px ${css('--ui')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x, y + 1); }
  for (const k of C.PORT_IDS) { if (!s.known[k]) continue; const P = C.PORTS[k]; const [x, y] = toS(P.x, P.y); if (!onScreen(x, y, 120)) continue;
    const t = Math.min(1, (now - (portAppear[k] || 0)) / 700), e = t < 1 ? 1 + (1 - t) * 1.6 : 1, here = s.at === k && s.mode === 'port';
    if (here) { ctx.strokeStyle = COL.ju; ctx.globalAlpha = .5 + pulse * .2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, sz * .98 + pulse * 2, 0, 7); ctx.stroke(); ctx.globalAlpha = .22; ctx.beginPath(); ctx.arc(x, y, sz * 1.3 + pulse * 3, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    if (hoverPort === k) { ctx.fillStyle = 'rgba(27,35,36,.12)'; ctx.beginPath(); ctx.arc(x, y, sz, 0, 7); ctx.fill(); }
    seal(x, y, P.ch, sz * e, ((P.x * 7 + P.y) % 9 - 4) * .012, Math.min(1, t * 1.6), C.isClosed(k) ? COL.ink2 : COL.ju);
    if (s.orders.some(o => o.to === k)) { ctx.strokeStyle = COL.cheong; ctx.lineWidth = 2; ctx.strokeRect(x - sz / 2 - 4, y - sz / 2 - 4, sz + 8, sz + 8); }
    const ny = y + sz / 2 + 4; label(P.name, x, ny, NARROW() ? 12 : 13, here ? COL.ju : COL.ink, css('--ui'));
    if (cam.z > cam.fit * 1.25) { const n = P.prod.length, gy = y + sz / 2 + (NARROW() ? 26 : 28); P.prod.forEach((id, i) => glyphDot(x + (i - (n - 1) / 2) * 15, gy, 6.5, C.G[id], .95)); }
    if (C.isClosed(k)) { ctx.save(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - sz * .7, y - sz * .7); ctx.lineTo(x + sz * .7, y + sz * .7); ctx.moveTo(x + sz * .7, y - sz * .7); ctx.lineTo(x - sz * .7, y + sz * .7); ctx.stroke(); ctx.restore();
      ctx.fillStyle = COL.ink; ctx.fillRect(x - sz / 2 - 22, y - 9, 18, 18); ctx.fillStyle = COL.hanji2; ctx.font = `12px ${SEALF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('閉', x - sz / 2 - 13, y + 1); }
    else if (news.fest[k]) { const bx = x - sz / 2 - 13, by = y - sz / 2 + 2; ctx.fillStyle = COL.hwang; ctx.beginPath(); ctx.arc(bx, by, 9 + (RM ? 0 : Math.sin(clock * 4)), 0, 7); ctx.fill(); ctx.fillStyle = COL.hanji2; ctx.font = `11px ${SEALF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('祭', bx, by + .5); }
    if (s.at !== k || s.mode !== 'port') { const cand = [];
      for (const g of C.GOODS) { const inf = C.infoFor(k, g.id); if (!inf) continue; const ratio = inf.price / (g.base * .93); if (ratio >= 1.25) cand.push({ g, ratio, age: Math.floor(s.t) - inf.day }); }
      cand.sort((a, b) => b.ratio - a.ratio).slice(0, 2).forEach((c, i) => { const al = c.age < 15 ? 1 : c.age < 40 ? .62 : .34; const bx = x + sz / 2 + 12 + i * 19, by = y - sz / 2 + 4;
        glyphDot(bx, by, 8.5, c.g, al); ctx.globalAlpha = al; ctx.fillStyle = COL.rok; ctx.font = `bold 9px ${css('--ui')}`; ctx.textAlign = 'center'; ctx.fillText('▲', bx + 7, by - 8); ctx.globalAlpha = 1; }); }
    const rm = rivalMark[k]; if (rm && s.t - rm.t < 12) { ctx.globalAlpha = Math.max(.2, .9 - (s.t - rm.t) / 14); ctx.fillStyle = rm.col; ctx.font = `bold 12px ${css('--display')}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(`${rm.ch}▼${C.G[rm.id].ch}`, x - sz / 2 - 5, y); ctx.globalAlpha = 1; }
    if (rumorPulse[k] && now - rumorPulse[k] < 2200) { const q = (now - rumorPulse[k]) / 2200; ctx.strokeStyle = COL.cheong; ctx.globalAlpha = 1 - q; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, sz + q * 34, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
  }
}
/* 위에서 본 배 — 판옥 없는 신라 상선: 이물이 들린 선체, 두 돛대에 대나무 살 돛, 고물에 깃발 */
function boatOn(g, x, y, hd, sc, hull, sail, mast, flag) { g.save(); g.translate(x, y); g.rotate(hd); g.scale(sc, sc);
  g.fillStyle = 'rgba(27,35,36,.18)'; g.beginPath(); g.ellipse(1.5, 3.5, 17, 7, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(18, 0); g.quadraticCurveTo(10, -7.5, -10, -7); g.quadraticCurveTo(-15, -6, -15, 0); g.quadraticCurveTo(-15, 6, -10, 7); g.quadraticCurveTo(10, 7.5, 18, 0); g.closePath(); g.fillStyle = hull; g.fill();
  g.strokeStyle = 'rgba(245,240,227,.28)'; g.lineWidth = .7; g.beginPath(); g.moveTo(14, 0); g.lineTo(-13, 0); g.moveTo(12, -2.6); g.quadraticCurveTo(0, -4.6, -12, -3.6); g.moveTo(12, 2.6); g.quadraticCurveTo(0, 4.6, -12, 3.6); g.stroke();
  g.fillStyle = 'rgba(245,240,227,.35)'; g.fillRect(-14, -3.5, 4, 7);
  for (const [mx, len, rot] of [[5, 10, (mast || 0) * .8], [-3, 13, mast || 0]]) { g.save(); g.translate(mx, 0); g.rotate(rot); g.beginPath(); g.moveTo(-1.5, -len); g.quadraticCurveTo(3.5, -len * .5, 2.5, 0); g.quadraticCurveTo(3.5, len * .5, -1.5, len); g.lineTo(-3, len); g.lineTo(-3, -len); g.closePath();
    g.fillStyle = sail; g.fill(); g.strokeStyle = 'rgba(27,35,36,.75)'; g.lineWidth = .8; g.stroke(); g.lineWidth = .6; g.beginPath(); for (let i = -len + 3.5; i < len; i += 3.5) { g.moveTo(-3, i); g.lineTo(2.6, i * .94); } g.stroke(); g.restore(); }
  if (flag) { const w = RM ? 0 : Math.sin(clock * 7) * 1.2; g.fillStyle = flag; g.beginPath(); g.moveTo(-14, 0); g.lineTo(-21, -1.5 + w); g.lineTo(-20, 1.5 + w); g.closePath(); g.fill(); }
  g.restore(); }
const boat = (...a) => boatOn(ctx, ...a);
function drawRivals(s) {
  for (const R of s.rivals) { if (!C.revealed(R.x, R.y)) continue; const def = C.RIVALS.find(r => r.id === R.id); let [x, y] = toS(R.x, R.y); if (!onScreen(x, y)) continue;
    if (R.at) { x += 18; y -= 14; }
    const pirate = def.kind === 'pirate'; boat(x, y, R.heading || 0, (NARROW() ? .8 : .95), pirate ? '#1e2829' : '#4a3a2c', pirate ? '#4a4d48' : def.col, 0, pirate ? COL.ink : def.col);
    ctx.fillStyle = pirate ? COL.ju : def.col; ctx.beginPath(); ctx.arc(x, y - 21, 9.5, 0, 7); ctx.fill(); ctx.strokeStyle = COL.hanji2; ctx.lineWidth = 1.3; ctx.stroke(); ctx.fillStyle = COL.hanji2; ctx.font = `11px ${css('--seal')}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(def.ch, x, y - 20.5);
    if (cam.z > cam.fit * 1.4 && !R.at && R.dest) label(`→ ${C.PORTS[R.dest].name}${R.good ? ' · ' + C.G[R.good].name : ''}`, x, y + 12, 11, def.col);
    if (pirate && s.mode === 'sail') { const d = Math.hypot(R.x - s.x, R.y - s.y), ph = RM ? 0 : Math.sin(clock * 10); if (R.chasing) { ctx.strokeStyle = COL.ju; ctx.lineWidth = 2; ctx.globalAlpha = .5 + ph * .4; ctx.beginPath(); ctx.arc(x, y, 24 + ph * 3, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; label('추격', x, y + 14, 11, COL.ju); } else if (d < 140) { ctx.strokeStyle = COL.ju; ctx.globalAlpha = .4 + ph * .3; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; } } } }
function drawShip(s) {
  let [x, y] = toS(s.x, s.y); let hd = s.heading || -Math.PI / 2; if (s.mode === 'port') { x -= 30; y += 4; hd = -Math.PI / 2 - .5; }
  const sc = (NARROW() ? .95 : 1.1) * (1 + s.tier * .12), bob = RM ? 0 : Math.sin(clock * 2.6) * .05;
  if (s.mode === 'sail') { ctx.fillStyle = 'rgba(245,240,227,.75)'; for (let i = 1; i <= 6; i++) { const d = i * 7 * sc, sw = RM ? 0 : Math.sin(clock * 3 + i) * 1.2; ctx.globalAlpha = .55 - i * .08; ctx.beginPath(); ctx.ellipse(x - Math.cos(hd) * d - Math.sin(hd) * sw, y - Math.sin(hd) * d + Math.cos(hd) * sw, 3 + i * 1.1, 1.6 + i * .45, hd, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  const w = C.wind(s.t, s.x, s.y), sa = s.mode === 'port' ? 0 : Math.max(-.6, Math.min(.6, C.angDiff(w.dir, hd) * .35));
  if (s.rowing && s.mode === 'sail') { ctx.save(); ctx.translate(x, y); ctx.rotate(hd); ctx.scale(sc, sc); ctx.strokeStyle = '#3b2e22'; ctx.lineWidth = 1.6; const ph = RM ? 0 : Math.sin(clock * 9) * .45;
    for (const side of [-1, 1]) for (const ox of [-6, 2, 10]) { ctx.beginPath(); ctx.moveTo(ox, side * 5.5); ctx.lineTo(ox - 6 + ph * 6, side * 16); ctx.stroke(); } ctx.restore(); }
  if (s.mode !== 'port') { ctx.strokeStyle = COL.ju; ctx.lineWidth = 1.2; ctx.globalAlpha = .45; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(x, y, 24 * sc, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
  boat(x, y, hd + bob * .3, sc, '#3b2a1c', s.mode === 'port' ? '#b49563' : '#dcbc78', sa, COL.ju);
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
  setText('hDate', C.dateStr(s.t)); setText('hSeason', `${C.SEASONS[C.seasonOf(s.t)]} · ${C.monsoon(s.t).name}`); setText('hDiff', C.dif().name); paintGold(s.gold);
  const md = Math.round(C.monsoon(s.t).dir * 180 / Math.PI + 90); if (last.vane !== md) { last.vane = md; $('hVane').style.transform = `rotate(${md}deg)`; }
  const q = C.quotaNow(), dd = Math.ceil(C.daysToDue()); setText('hQuota', fmt(q)); setText('hDue', `${dd}일 뒤`); setText('hFameN', fmt(s.fame));
  if (last.capTok !== s.cap) { last.capTok = s.cap; $('hQuotaBox').title = `계절이 끝나는 날 ${C.cap().quotaTo}에 낼 ${C.cap().quotaName}`; }
  for (const f of C.drainFame()) toast(`명성 ${f.n > 0 ? '+' : ''}${f.n}${f.why ? ` — ${f.why}` : ''}`, f.n > 0 ? 'good' : 'bad', true);
  const qk = (s.gold >= q) + ':' + (dd <= 15); if (last.qr !== qk) { last.qr = qk; $('hQuotaBox').classList.toggle('ok', s.gold >= q); $('hQuotaBox').classList.toggle('urgent', s.gold < q && dd <= 15); }
  { /* 지금 속도면 상납 날에 얼마나 — 최근 30일 재산 변화로 센다. 요소가 없으면 만든다(UI 쪽이 자리를 잡아 준다) */
    let h = $('hQuotaHint'); if (!h) { h = document.createElement('small'); h.id = 'hQuotaHint'; h.className = 'qhint'; $('hQuotaBox').appendChild(h); }
    const f = C.quotaForecast(), fk = `${f.value}:${f.span}:${q}:${s.debt || 0}:${dd}`; if (last.fc !== fk) { last.fc = fk;
      const txt = s.debt ? `빚 ${fmt(s.debt)} 포함` : f.span < 5 ? '' : `지금 속도면 ${fmt(f.value)}`; h.textContent = txt; h.classList.toggle('short', f.span >= 5 && f.value < q); h.hidden = !txt;
      const fl = C.dif().share ? (C.quotaFloor() > 0 ? ` · 하한 재산 ${Math.round(C.dif().share * 10)}할 (${fmt(C.quotaFloor())})` : ' · 첫 계절은 재산 하한 없음') : '';
      $('hQuotaBox').title = `계절이 끝나는 날 ${C.cap().quotaTo}에 낼 ${C.cap().quotaName} ${fmt(q)}냥${s.debt ? ` (지난 계절 빚 ${fmt(s.debt)} 포함)` : ''}${fl}. ${f.span >= 5 ? `최근 ${f.span}일 하루 ${f.perDay >= 0 ? '+' : ''}${fmt(f.perDay)}냥 — 이대로면 ${dd}일 뒤 ${fmt(f.value)}냥.` : '며칠 더 지나면 예측이 뜬다.'} 못 내면 짐을 7할에 넘기고, 그래도 모자라면 빚으로 넘어간다(${C.debtsAllowed()}번까지).`; } }
  const slotKey = C.capacity() + ':' + s.slots.map(x => x.id).join(',');
  if (last.slots !== slotKey) { last.slots = slotKey; $('hSlots').innerHTML = Array.from({ length: C.capacity() }, (_, i) => { const it = s.slots[i]; return it ? `<span class="slot full" style="background:${C.G[it.id].col}">${C.G[it.id].ch}</span>` : '<span class="slot"></span>'; }).join(''); $('hSlots').setAttribute('aria-label', `선창 ${s.slots.length}/${C.capacity()}`); $('hSlots').title = `선창 ${s.slots.length}/${C.capacity()}`; }
  if (last.mode !== s.mode) { last.mode = s.mode; document.body.classList.toggle('sailing', s.mode === 'sail'); placeToasts(); }
  const mood = s.threat >= 60 || s.hull < s.hullMax * .3 ? 'grim' : 'neutral'; if (last.cap !== s.cap + mood) { last.cap = s.cap + mood; $('hCap').innerHTML = PORTRAIT.svg(s.cap, { size: 48, expr: mood }); $('hCap').title = `${C.CAPTAINS[s.cap].name} — ${C.CAPTAINS[s.cap].title}`; }
  const th = Math.round(s.threat); if (last.th !== th) { last.th = th; $('hThreat').querySelector('b').textContent = th; $('hThreat').querySelector('s').style.width = th + '%'; $('hThreat').classList.toggle('hot', th >= 60); $('hThreatSt').textContent = th >= 85 ? '그림자' : th >= 60 ? '현상금' : th >= 30 ? '감찰' : '안전'; }
  const hu = Math.round(s.hull / s.hullMax * 100); if (last.hu !== hu) { last.hu = hu; $('hHull').querySelector('b').textContent = Math.round(s.hull); $('hHull').querySelector('s').style.width = hu + '%'; }
  const live = C.liveNews(); const ck = s.crew.map(c => `${c.k}${c.asked ? 1 : 0}${c.done ? 1 : 0}${c.alive ? 1 : 0}`).join('') + JSON.stringify(s.boons) + live.map(n => n.id).join() + Object.keys(s.relics || {}).join();
  if (last.crew !== ck) { last.crew = ck; const nb = Object.values(s.boons).reduce((a, b) => a + b, 0);
    $('crew').innerHTML = s.crew.map(c => { const d = C.CREW.find(x => x.k === c.k); const cls = !c.alive ? 'gone' : c.done ? 'done' : c.asked ? 'ask' : '';
      const tip = !c.alive ? '이제 없다.' : c.done ? `부탁을 들어줬다. ${d.perk}` : c.asked ? `부탁: "${C.crewText(d, 'ask')}"<br>→ ${C.crewText(d, 'hint')}` : '아직 말이 없다.';
      return `<button class="mate pt ${cls}" aria-label="${d.name}" aria-expanded="false">${PORTRAIT.svg(c.k, { size: 48, expr: PORTRAIT.exprs(c.k)[c.done ? 1 : 0] })}<span class="tip"><b>${d.name}</b> · ${d.role}<br>${tip}</span></button>`; }).join('')
      + (live.length ? `<button class="mate newsbtn" aria-label="세상 소식 ${live.length}개" aria-expanded="false">報<span class="tip"><b>세상 소식</b><br>${live.map(n => `· ${n.title} <small>(${Math.max(1, Math.ceil(n.e - s.t))}일)</small>`).join('<br>')}</span></button>` : '')
      + (Object.keys(s.relics || {}).length ? `<button class="mate relicbtn" aria-label="유물" aria-expanded="false">寶<span class="tip"><b>유물 ${Object.keys(s.relics).length}/${C.RELICS.length}</b><br>${C.RELICS.filter(r => s.relics[r.id]).map(r => `${r.ch} ${r.name} — ${r.text}`).join('<br>')}</span></button>` : '')
      + (nb ? `<button class="mate boonsbtn" aria-label="특권 ${nb}개" aria-expanded="false">特<span class="tip"><b>특권</b><br>${Object.entries(s.boons).map(([id, n]) => { const b = C.BOONS.find(x => x.id === id); return `${b.ch} ${b.name}${n > 1 ? ' ×' + n : ''} — ${b.text}`; }).join('<br>')}</span></button>` : ''); }
  if (s.mode === 'sail' && s.path && s.path[s.seg + 1]) { let rem = Math.hypot(s.path[s.seg + 1][0] - s.x, s.path[s.seg + 1][1] - s.y); for (let i = s.seg + 1; i < s.path.length - 1; i++) rem += Math.hypot(s.path[i + 1][0] - s.path[i][0], s.path[i + 1][1] - s.path[i][1]);
    const st = Math.round(s.stamina), sk = st + ':' + s.rowing; if (last.st !== sk) { last.st = sk; const rb = $('sbRow'); if (rb) { rb.classList.toggle('on', !!s.rowing); rb.disabled = st <= 3 && !s.rowing; rb.querySelector('s').style.width = st + '%'; rb.querySelector('em').textContent = s.rowing ? '젓는 중' : st <= 3 ? '지쳤다' : '노 저어라'; } }
    const ch = s.rivals.some(R => R.chasing); if (last.ch !== ch) { last.ch = ch; $('sailbar').classList.toggle('chased', ch); }
    const days = s.spd > 1 ? rem / s.spd : 0; const el = $('sbRem'); if (el) el.textContent = `${days > .1 ? `남은 약 ${Math.max(1, Math.round(days))}일` : '곧 닿는다'} · ${C.windWord(s.windDeg || 0)}${C.inZone(s.x, s.y) ? ' · 해적 해역' : ''}`; }
}

/* 선원·報·特·寶: 누르면 쪽지가 열리고(aria-expanded) 다른 곳을 누르면 닫힌다. 마우스 올림은 CSS가 맡는다 */
const closeMates = () => $('crew').querySelectorAll('.mate.open').forEach(x => { x.classList.remove('open'); x.setAttribute('aria-expanded', 'false'); const t = x.querySelector('.tip'); if (t) t.style.transform = ''; });
const fitTip = m => { const t = m.querySelector('.tip'); if (!t) return; t.style.transform = ''; const r = t.getBoundingClientRect(); const d = r.left < 8 ? 8 - r.left : r.right > innerWidth - 8 ? innerWidth - 8 - r.right : 0; if (d) t.style.transform = `translateX(${Math.round(d)}px)`; };  // 쪽지가 화면 밖으로 나가면 안으로 민다
$('crew').addEventListener('click', e => { e.stopPropagation(); const m = e.target.closest('.mate'); if (!m) return; const on = !m.classList.contains('open'); closeMates(); if (on) { m.classList.add('open'); m.setAttribute('aria-expanded', 'true'); fitTip(m); } });
document.addEventListener('click', e => { if (!e.target.closest('#crew')) closeMates(); });
/* 돈: 바뀌면 숫자가 굴러가고 밑에 차액이 잠깐 뜬다 */
const GT = { v: null, from: 0, to: 0, t0: 0 };
function paintGold(g) { const el = $('hGold');
  if (GT.v === null || RM) { if (GT.v !== null && g !== GT.to) goldDelta(g - GT.to); GT.v = GT.to = GT.from = g; el.textContent = fmt(g); return; }
  if (g !== GT.to) { goldDelta(g - GT.to); GT.from = GT.v; GT.to = g; GT.t0 = performance.now(); }
  if (GT.v !== GT.to) { const q = Math.min(1, (performance.now() - GT.t0) / 700), e = 1 - Math.pow(1 - q, 3); GT.v = q >= 1 ? GT.to : GT.from + (GT.to - GT.from) * e; el.textContent = fmt(GT.v); } }
function goldDelta(d) { d = Math.round(d); if (!d) return; const box = $('hGoldBox'); box.classList.remove('gain', 'loss'); void box.offsetWidth; box.classList.add(d > 0 ? 'gain' : 'loss'); clearTimeout(goldDelta.t); goldDelta.t = setTimeout(() => box.classList.remove('gain', 'loss'), 900);
  box.querySelectorAll('.delta').forEach(x => x.remove()); const sp = document.createElement('span'); sp.className = 'delta ' + (d > 0 ? 'up' : 'dn'); sp.textContent = (d > 0 ? '+' : '') + fmt(d); box.appendChild(sp); setTimeout(() => sp.remove(), 1700); }

/* ─────────── 알림 · 팝 · 띠 ─────────── */
/* 알림: 창이 열려 있는 동안 온 것은 모아 두었다가(넷까지) 창이 닫히면 차례로 보여 준다. 한 번에 셋까지 */
const TQ = [];
function toast(msg, kind, noLog, opt) { if (!noLog && kind !== 'cx') journal(msg, kind); if (!noLog && !kind && feedVisible()) return null;
  if (anyModal()) { TQ.push({ msg, kind, opt }); if (TQ.length > 4) TQ.shift(); return null; }
  const el = document.createElement('div'); el.className = 'toast ' + (kind || ''); el.innerHTML = msg; if (opt && opt.onclick) { el.onclick = opt.onclick; el.setAttribute('role', 'button'); el.tabIndex = 0; }
  $('toasts').appendChild(el); setTimeout(() => el.remove(), 3600); while ($('toasts').children.length > 3) $('toasts').firstChild.remove(); return el; }
function flushToasts() { const q = TQ.splice(0); q.forEach((t, i) => setTimeout(() => { if (!anyModal()) toast(t.msg, t.kind, true, t.opt); else { TQ.push(t); } }, i * 220)); }
function pop(txt, x, y, kind) { const el = document.createElement('div'); el.className = 'pop ' + (kind || ''); el.textContent = txt; el.style.left = x + 'px'; el.style.top = y + 'px'; document.body.appendChild(el); setTimeout(() => el.remove(), 1400); }
const popAt = (el, txt, kind) => { const r = el.getBoundingClientRect(); pop(txt, r.left + r.width / 2, r.top + r.height / 2, kind); };
function banner(big, small) { $('bnBig').textContent = big; $('bnSmall').textContent = small; const b = $('banner'); b.hidden = false; const d = b.firstElementChild; d.style.animation = 'none'; void d.offsetWidth; d.style.animation = ''; clearTimeout(banner.t); banner.t = setTimeout(() => b.hidden = true, 2800); }
/* ─────────── 창 쌓기 · 초점 가두기 ───────────
   창이 열리면 뒤(해도·머리띠·패널·선원·안내·소식창·첫 화면)와 아래 깔린 다른 창을 inert로 막고, 제목(h2)으로 이름을 붙이고,
   닫히면 열었던 단추로 초점을 돌려준다. hidden 속성을 지켜보므로 여는 쪽은 그대로 $('mX').hidden = false/true 를 쓰면 된다 */
const MODALS = ['mEvent', 'mReveal', 'mStory', 'mQuota', 'sEnd', 'mRetire2', 'mBattle', 'mDive', 'mBook', 'mCodex', 'mNew', 'mHelp'];
const anyModal = () => MODALS.some(id => !$(id).hidden);
const BG_SEL = '#map,.hud,#crew,#tracker,#coach,#feed,#panel,#dest,#sailbar,#menu,#sTitle';
const MST = { stack: [], opener: new Map() };
const topModal = () => MST.stack[MST.stack.length - 1] || null;
const focusables = el => [...el.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled && !x.closest('[hidden]') && !x.closest('[inert]') && x.getClientRects().length);
function applyModals() { const top = topModal();
  if (top) for (const el of [...$('toasts').children]) { if (TQ.length < 4) TQ.push({ msg: el.innerHTML, kind: [...el.classList].filter(c => c !== 'toast').join(' '), opt: el.onclick ? { onclick: el.onclick } : undefined }); el.remove(); }  // 떠 있던 알림은 창 뒤에 깔리지 않게 거두어 두었다가 창이 닫히면 다시 보여 준다
  for (const el of document.querySelectorAll(BG_SEL)) el.inert = !!top;
  for (const id of MODALS) { const m = $(id); m.inert = !!top && m !== top && !m.hidden; }
  if (!top) return; const card = top.querySelector('[role="dialog"]') || top;
  if (!card.getAttribute('aria-label')) { const h = card.querySelector('h2'); if (h) { if (!h.id) h.id = top.id + 'H'; card.setAttribute('aria-labelledby', h.id); } }
  if (!top.contains(document.activeElement)) { const f = focusables(top)[0]; if (f) f.focus({ preventScroll: true }); else { if (!card.hasAttribute('tabindex')) card.tabIndex = -1; card.focus({ preventScroll: true }); } } }
new MutationObserver(recs => { let changed = false;
  for (const r of recs) { const m = r.target; if (!MODALS.includes(m.id)) continue; const i = MST.stack.indexOf(m);
    if (!m.hidden && i < 0) { MST.stack.push(m); const a = document.activeElement; MST.opener.set(m, a && a !== document.body && !m.contains(a) ? a : null); changed = true; }
    else if (m.hidden && i >= 0) { MST.stack.splice(i, 1); const o = MST.opener.get(m); MST.opener.delete(m); changed = true;
      if (o && !topModal() && o.isConnected && !o.closest('[hidden]') && o.getClientRects().length) o.focus({ preventScroll: true }); } }
  if (changed) { applyModals(); if (!topModal() && TQ.length) flushToasts(); } }).observe(document.body, { attributes: true, attributeFilter: ['hidden'], subtree: true });
/* Esc: 닫을 수 있는 창은 닫고, '계속' 단추가 떠 있는 창은 그것을 누른다. 선택이 남은 창(이야기·특권)은 그대로 둔다 */
function closeTop(top) { const id = top.id;
  if (id === 'mCodex') { closeCodex(); return true; }
  if (id === 'mBook' || id === 'mRetire2' || id === 'mNew' || id === 'mHelp') { top.hidden = true; return true; }
  const b = top.querySelector('#evOk,#btOk,#dvOk,#rvOk'); if (b && !b.disabled) { b.click(); return true; } return false; }
addEventListener('keydown', e => { const top = topModal(); if (!top) return;
  if (e.key === 'Escape') { if (closeTop(top)) { e.preventDefault(); e.stopImmediatePropagation(); } return; }
  if (e.key === 'Tab') { const f = focusables(top); if (!f.length) { e.preventDefault(); return; } const i = f.indexOf(document.activeElement);
    if (e.shiftKey ? i <= 0 : (i < 0 || i === f.length - 1)) { e.preventDefault(); (e.shiftKey ? f[f.length - 1] : f[0]).focus({ preventScroll: true }); } } }, true);
/* 되돌릴 수 없는 단추는 한 번 더 눌러야 실행된다(3초 안에). 첫 누름에 글자가 바뀌고 붉게 찬다 */
function confirmTap(b, label) { if (b.dataset.sure) { delete b.dataset.sure; return true; }
  b.dataset.sure = '1'; b.dataset.was = b.innerHTML; b.innerHTML = label; b.classList.add('danger', 'sure');
  setTimeout(() => { if (b.isConnected && b.dataset.sure) { b.innerHTML = b.dataset.was; delete b.dataset.sure; b.classList.remove('sure'); } }, 3000); return false; }

/* ─────────── 첫 판 안내 ─────────── */
let coachStep = -1;
/* 좁은 화면(390px)에서 안내 띠가 석 줄을 넘지 않게 줄여 쓴다 — 상납이 무엇인지는 프롤로그가 이미 말했다 */
const COACH_CAP = {
  gungbok: { port: 'jeoksan', s0: '위의 <b>상납</b>이 목표다. 적산까지 두어 번 왕복이면 채운다. 먼저 싼 <b>인삼</b>을 싣자.', s1: '적산이 인삼을 비싸게 산다는 소문이다. 해도의 <b>적산(赤)</b> 도장을 눌러보자.', s5: '<b>곽·범이·아사</b>가 저마다 부탁을 들고 온다. 범이는 해적을 노린다 — 지금은 피하고 돈과 배가 모이면 함께 가자. 본 이야기는 <b>이야기·일거리</b> 탭에.' },
  ara: { port: 'cheonghae', s0: '위의 <b>상납</b>이 목표다. 청해진까지 두어 번 왕복이면 채운다. 먼저 싼 <b>비단</b>을 싣자.', s1: '청해진이 비단을 비싸게 산다는 소문이다 — 당신에겐 헛소문이 없다. 해도의 <b>청해진(淸)</b> 도장을 눌러보자.', s5: '<b>곽·범이·아사</b>가 저마다 부탁을 들고 온다. 범이는 해적을 노리지만 지금은 피하자. 왕씨 상단과 같은 뱃길이면 먼저 닿아야 값이 성하다. 본 이야기는 <b>이야기·일거리</b> 탭에.' },
  tomo: { port: 'mingzhou', s0: '위의 <b>상납</b>이 목표다. 명주까지 두어 번 왕복이면 채운다. 먼저 싼 <b>유황</b>을 싣자.', s1: '명주가 유황을 비싸게 산다는 소문이다. 해도의 <b>명주(明)</b> 도장을 눌러보자. 경계는 당신에게 절반만 오른다.', s5: '<b>곽·범이·아사</b>가 저마다 부탁을 들고 온다. 범이는 해적을 노리지만 지금은 피하자. 하카타 <b>홍려관</b>은 짐을 한꺼번에 사들인다 — 본 이야기의 첫 목표다. 본 이야기는 <b>이야기·일거리</b> 탭에.' }
};
const coachCap = () => COACH_CAP[(S() && S().cap) || 'gungbok'] || COACH_CAP.gungbok;
const COACH = [
  () => coachCap().s0,
  () => `${coachCap().s1} 해도는 끌어서 옮기고 ${COARSE ? '두 손가락으로' : '휠로'} 키운다.`,
  '빨간 점선이 지름길이다. 붉은 빗금(<b>海賊</b>)을 지나면 해적을 만나기 쉽다. 파란 길은 돌아가는 길. 골라서 <b>출항</b>.',
  `배는 알아서 간다. 역풍이거나 해적이 쫓아오면 <b>노 저어라</b>${COARSE ? '' : '(Space)'}. 해도의 금빛 <b>寶</b> 원은 보물 자리 — 원 안으로 몰면 잠수한다.`,
  '소문이 맞았을까? 상자가 하나씩 열린다. <b>팔고 내린다</b>.',
  () => `잘했다. 항구마다 <b>그곳에서만</b> 할 수 있는 일이 있고, <b>장부</b>${COARSE ? '' : '(B)'}에는 항구별 시세·이야기·탐험 도감이 있다. 상납을 내면 <b>특권</b>을 고른다. <b>흰 종이</b>는 아직 아무도 그리지 않은 바다 — 처음 닿은 숨은 항구는 그날만 값이 뛴다. ${coachCap().s5}`
];
let coachPending = false;
/* 안내가 떠 있으면 알림은 안내 아래로 내려간다 — 안내 길이가 화면마다 달라 실제 높이로 잰다.
   좁은 화면에서는 안내가 아래쪽 시트(패널·항해 띠·행선지·소식창) 바로 위에 붙는다: 그 높이를 --sheet-h 로 넘긴다 */
function placeToasts() { const c = $('coach'); $('toasts').style.top = c.hidden || NARROW() ? '' : `${Math.round(c.getBoundingClientRect().bottom + 8)}px`;
  let h = 0; if (NARROW()) for (const id of ['panel', 'sailbar', 'dest', 'feed']) { const el = $(id); if (el.hidden || getComputedStyle(el).display === 'none') continue; h = Math.max(h, innerHeight - el.getBoundingClientRect().top); }
  document.documentElement.style.setProperty('--sheet-h', Math.round(h) + 'px'); }
function showCoach(on) { $('coach').hidden = !on; document.body.classList.toggle('coaching', on); placeToasts(); }
/* 안내는 조건형이다: 사는 것·행선지 카드·출항·입항이면 다음 단계로 넘어가고, 「다음」을 누르면 언제든 넘어간다 */
function coach(step) { if (META.tut || coachStep >= step || coachStep === -2) return; coachGo(step); }
function coachGo(step) { if (step >= COACH.length) { coachEnd(); return; } coachStep = step; const tx = COACH[step]; $('coachText').innerHTML = typeof tx === 'function' ? tx() : tx; $('coachNext').textContent = step === COACH.length - 1 ? '알겠다' : '다음'; showCoach(true);
  if (step === 1 && NARROW() && !$('panel').hidden && !panelMin) setPanelMin(true);  // 좁은 화면: 도장을 누를 수 있게 지도를 보여 준다
  if (step === COACH.length - 1) setTimeout(() => { if (coachStep === step) coachEnd(); }, 10000); }
function coachEnd() { showCoach(false); coachStep = -2; META.tut = true; saveMeta(); }
$('coachNext').onclick = () => coachGo(coachStep + 1);
$('coachSkip').onclick = coachEnd;

/* ─────────── 항구 장부 ─────────── */
let lastQuote = null, panelMin = false;
function openPanel() { const p = $('panel'); p.hidden = false; panelMin = false; p.classList.remove('min'); $('pGrab').textContent = '접기'; paintPanel(); relayout(false); }
function closePanel() { $('panel').hidden = true; relayout(false); }
function setPanelMin(v) { panelMin = v; $('panel').classList.toggle('min', v); $('pGrab').textContent = v ? '펼치기' : '접기'; $('pHead').setAttribute('aria-expanded', v ? 'false' : 'true'); relayout(false); }
$('pHead').onclick = () => setPanelMin(!panelMin);
/* 좁은 화면에서 정박 중이면 선원 초상이 장부 머리 안으로 들어가 해도 위 자리를 비운다 */
function placeCrew() { const crew = $('crew'), host = NARROW() && !$('panel').hidden ? $('pHead') : document.body; if (crew.parentNode === host) return; if (host === document.body) document.body.insertBefore(crew, $('tracker')); else host.insertBefore(crew, $('pGrab')); }
function tagFor(pct) { return pct <= 80 ? ['cheap', '싸다'] : pct >= 130 ? ['dear', '비싸다'] : ['mid', '보통']; }
function gl(g, cls) { return `<span class="glyph ${cls || ''}" style="background:${g.col}">${g.ch}</span>`; }
/* 물건 그림 — 32칸, 1.7 굵기 둥근 선 하나로 통일. 모서리에 한자 도장 */
const GI = {
  ginseng: '<path d="M16 14V8M16 8c-3.6-.4-5.8-2.4-6-5.4 3.2.2 5.4 2.2 6 5.4zM16 8c3.6-.4 5.8-2.4 6-5.4-3.2.2-5.4 2.2-6 5.4z"/><circle class="f" cx="16" cy="6.2" r="1.3"/><path d="M16 14c-2.6 2.4-3.4 6.4-2.4 10.2L11 29M16 14c2.4 2.6 3 6.6 1.8 10.4L20.6 29M14 19.5l-4 1.6M17.8 21l4 .6M13.6 24.6l-3.4 2.6"/>',
  silk: '<path d="M6 9.5h16.5a3.5 3.5 0 0 1 0 7H6a3.5 3.5 0 0 1 0-7z"/><ellipse cx="6" cy="13" rx="1.4" ry="3.5"/><path d="M9 16.5v10l3.5-2.2 3.5 2.2v-10M9 20h7M9 23h7"/>',
  porcelain: '<path d="M13.6 4h4.8M14.2 4v2.4c-4.6 1.6-7 4.6-7 9.2 0 5.2 2.6 9.2 5 12.4h7.6c2.4-3.2 5-7.2 5-12.4 0-4.6-2.4-7.6-7-9.2V4"/><path d="M11 15.4c1.6-1.4 3.2.6 5 0s3.4-1.6 5 0M12.6 21c1.2-.8 2.4.4 3.4 0s2.2-1 3.4 0"/>',
  spice: '<path d="M10.5 12.5c-3.6 4.4-3.6 11 0 14.5h11c3.6-3.5 3.6-10.1 0-14.5z"/><path d="M10.5 12.5l2.4-3h6.2l2.4 3M12.4 9.5l-1.4-4M19.6 9.5l1.4-4"/><circle class="f" cx="14" cy="19" r="1.3"/><circle class="f" cx="18.4" cy="17.6" r="1.3"/><circle class="f" cx="16.8" cy="22.6" r="1.3"/>',
  gold: '<path d="M5.5 25l3-6.5h15l3 6.5zM10.5 18.5l2.4-5.5h6.2l2.4 5.5"/><path d="M8 22h16" opacity=".5"/><path d="M25 4.5v5M22.5 7h5M7 8v3M5.5 9.5h3"/>',
  shell: '<path d="M7 25.5c3.4-1.2 14.6-1.2 18 0"/><path d="M7 25.5C7 17.6 10.6 9.6 16 5.5c5.4 4.1 9 12.1 9 20"/><path d="M10.6 19.4h10.8M12.6 14h6.8M14.6 9.4h2.8"/><path d="M25 7l1.5-1.5M27 11h2" opacity=".7"/>',
  fur: '<path d="M16 5.5c-2.6 0-3.8 1.6-3.8 3.4-2.8.2-4.8 2-4.8 4.2l2.2 2.8-2.2 2.8c0 2.8 2 4.8 4.8 4.8l1.2 3.8h5.2l1.2-3.8c2.8 0 4.8-2 4.8-4.8l-2.2-2.8 2.2-2.8c0-2.2-2-4-4.8-4.2 0-1.8-1.2-3.4-3.8-3.4z"/><path d="M16 11v12" opacity=".55"/>',
  sulfur: '<path d="M6 26.5h20M8 26.5l3.4-11 4 4.2 3-10.2 5.4 17"/><path d="M11.4 15.5l1.6 4.4M18.4 9.5l-.6 7" opacity=".6"/>',
  tea: '<path d="M6.5 17.5h19c0 5.2-4.2 8.6-9.5 8.6s-9.5-3.4-9.5-8.6zM12 26l-.8 2.4h9.6L20 26"/><path d="M16 14.6c-4-1.8-5.2-5.6-3.2-9.4 4 1.4 5 5.4 3.2 9.4zM16 14.6c-.2-3-1-6-3.2-9.4"/>',
  books: '<path d="M8.5 5.5h15v21h-15z"/><path d="M11.5 5.5v21"/><circle class="f" cx="10" cy="8.6" r=".9"/><circle class="f" cx="10" cy="12.6" r=".9"/><circle class="f" cx="10" cy="16.6" r=".9"/><circle class="f" cx="10" cy="20.6" r=".9"/><circle class="f" cx="10" cy="24" r=".9"/><path d="M15 8.5h5.6v9H15z"/>',
  iron: '<path d="M4.5 10.5l5 3h13l5-3v7l-5-3h-13l-5 3z"/><path d="M4.5 18.5l5 3h13l5-3v4.5l-5-3h-13l-5 3z" opacity=".7"/>'
};
function gi(g) { return `<span class="gi" style="background:${g.col}"><svg viewBox="0 0 32 32" aria-hidden="true">${GI[g.id] || ''}</svg><i>${g.ch}</i></span>`; }
/* 주사위 — 눈을 점으로 그린다(1과 4는 붉은 점) */
const PIPS = { 1: [[16, 16]], 2: [[10, 10], [22, 22]], 3: [[9, 9], [16, 16], [23, 23]], 4: [[10, 10], [22, 10], [10, 22], [22, 22]], 5: [[9, 9], [23, 9], [16, 16], [9, 23], [23, 23]], 6: [[10, 8.5], [22, 8.5], [10, 16], [22, 16], [10, 23.5], [22, 23.5]] };
const die = n => `<svg viewBox="0 0 32 32" aria-label="${n}"><rect x="2" y="2" width="28" height="28" rx="5"/>${PIPS[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${n === 1 ? 4.2 : 2.7}" class="${n === 1 || n === 4 ? 'r' : ''}"/>`).join('')}</svg>`;
function paintPanel() {
  const s = S(); if (!s || s.mode !== 'port') return; const k = s.at, P = C.PORTS[k]; C.tickMarket(k); const m = s.markets[k], d = Math.floor(s.t);
  $('pSeal').textContent = P.ch; $('pName').textContent = P.name; $('pSub').textContent = `${P.nation} · 정박 중`; ART.portBanner($('pHead'), k, s.t);
  const free = C.freeSlots();
  /* 값 압력: 최근 풀린 상자 수(나/경쟁 상단)와 값이 돌아올 날 */
  const pressHtml = id => { const p = C.pressInfo(k, id); if (!p || (!p.me && !p.rival)) return ''; const who = p.who ? (C.RIVALS.find(r => r.id === p.who) || {}).name || '경쟁 상단' : ''; return `<small class="hint press">최근 풀린 상자 ${p.me + p.rival}(${[p.me ? `나 ${p.me}` : '', p.rival ? `${who} ${p.rival}` : ''].filter(Boolean).join('·')})${p.days ? ` · 회복 ~${p.days}일` : ''}</small>`; };
  const tiles = m.stock.map(id => { const g = C.G[id], pr = C.cratePrice(k, id), pct = C.pctOf(k, id), [tc, tl] = tagFor(pct), b = C.activeBoom(k, id, d);
    return `<button class="good" data-buy="${id}" ${!free || s.gold < pr ? 'disabled' : ''}>${gi(g)}<span class="tagl ${tc}">${tl}</span><span class="nm">${g.name}</span><span class="pr">${fmt(pr)}<small>냥</small></span>${b ? `<span class="boom">${b.slump ? '남아돈다' : '유행'}</span>` : ''}</button>`; }).join('');
  const wants = C.topDemand(k, 3).map(id => `<span class="want">${gl(C.G[id])}${C.G[id].name} <b>${fmt(C.sellPrice(k, id) * C.LOT)}</b>${pressHtml(id)}</span>`).join('');
  const hold = s.slots.length ? s.slots.map((it, i) => { const g = C.G[it.id], now = C.sellPrice(k, it.id) * C.LOT, pl = now - it.cost;
      const be = bestElsewhere(it.id);
      return `<div class="crate">${gl(g)}<div class="gr">${g.name} · 산 값 <b>${fmt(it.cost)}</b><br>여기서 <b>${fmt(now)}</b> <span class="${pl >= 0 ? 'up' : 'dn'}">${pl >= 0 ? '+' : ''}${fmt(pl)}</span>${be ? `<br><small class="hint ${be.price * C.LOT > now ? 'up' : ''}">▲ ${C.PORTS[be.k].name} ${fmt(be.price * C.LOT)} <span>(${C.ago(be.day)})</span></small>` : ''}${pressHtml(it.id) ? '<br>' + pressHtml(it.id) : ''}</div><button class="btn ${pl < 0 ? 'danger' : ''}" data-sell="${i}">${pl < 0 ? `손해 보고 판다 ${fmt(pl)}` : '판다'}</button></div>`; }).join('')
    : '<p class="fine" style="text-align:left;margin:0">선창이 비었다.</p>';
  const off = s.offers[k], ords = s.orders;
  const offerHtml = off && !off.none ? `<div class="order">${gl(C.G[off.good])}<span class="gr"><b>${C.PORTS[off.to].name}</b>까지 ${C.G[off.good].name} <b>${off.n}상자</b> · ${off.days}일 안에<br><span class="up">보수 ${fmt(off.reward)}냥</span></span><button class="btn blue" data-act="accept" ${ords.length >= 2 ? 'disabled' : ''}>${ords.length >= 2 ? '두 건까지' : '맡는다'}</button></div>` : '<p class="fine" style="text-align:left;margin:0">지금 이 항구엔 맡길 일이 없다.</p>';
  const ordHtml = ords.map(o => { const have = s.slots.filter(x => x.id === o.good).length, left = Math.ceil(o.due - s.t);
    return `<div class="order mine">${gl(C.G[o.good])}<span class="gr"><b>${C.PORTS[o.to].name}</b>로 ${C.G[o.good].name} ${o.n}상자 <span class="${have >= o.n ? 'up' : 'dn'}">(${have}/${o.n})</span> · <span class="${left <= 10 ? 'dn' : ''}">${left}일 남음</span> · ${fmt(o.reward)}냥</span></div>`; }).join('');
  const pas = s.passenger ? `<div class="order mine"><span class="glyph" style="background:var(--ink-2)">客</span><span class="gr">승객 — ${s.passenger.who}를 <b>${C.PORTS[s.passenger.to].name}</b>까지 · <span class="${s.passenger.due - s.t <= 10 ? 'dn' : ''}">${Math.ceil(s.passenger.due - s.t)}일 남음</span></span></div>` : '';
  const nw = C.nextShip('wide'), nf = C.nextShip('fast'), rc = C.repairCost(), sp0 = C.shipPrice();
  /* 배는 급마다 둘: 넓은 배(칸 그대로)·빠른 배(칸 하나 덜, 1할 빠름). 큰 배는 입항세를 내고 해적 눈에 더 띈다 */
  const shipBtn = (n, v) => `<button class="act" data-act="ship" data-var="${v}" ${s.gold < sp0 ? 'disabled' : ''}><b>${n.name}${JO(n.name,'으로','로')}</b><small>${sp0 < n.price ? `<s>${fmt(n.price)}</s> ` : ''}${fmt(sp0)}냥 · 상자 ${n.slots + (s.boons.hold || 0)}칸 · 선체 ${n.hull}${v === 'fast' ? ' · 1할 빠름' : ''}${n.tax ? ` · 입항세 ${n.tax}` : ''}</small></button>`;
  const acts = [
    `<button class="act" data-act="repair" ${!rc || s.gold < rc ? 'disabled' : ''}><b>배 수리</b><small>${rc ? fmt(rc) + '냥' : '멀쩡하다'}</small></button>`,
    nw ? shipBtn(nw, 'wide') + shipBtn(nf, 'fast') : `<button class="act" disabled><b>${C.ship().name}</b><small>가장 큰 배${C.ship().tax ? ` · 입항세 ${C.ship().tax}` : ''}</small></button>`,
    C.canTribute() ? `<button class="act" data-act="tribute" ${s.gold < C.tributeCost() ? 'disabled' : ''}><b>조정에 바친다</b><small>${fmt(C.tributeCost())}냥 · 경계 -30</small></button>`
      : C.canBribe() ? `<button class="act" data-act="bribe" ${C.bribeLeft() || s.gold < C.bribeCost() ? 'disabled' : ''}><b>다자이후에 뇌물</b><small>${C.bribeLeft() ? `${C.bribeLeft()}일 뒤 다시` : `${fmt(C.bribeCost())}냥 (가진 돈의 1할) · 경계 -25`}</small></button>`
      : `<button class="act" disabled><b>조정</b><small>${s.cap === 'tomo' ? '하카타·나니와에서 뇌물을 쓴다' : '청해진·울산에서만'}</small></button>`
  ].join('');
  const officeHtml = (() => { const list = C.officeInfo(); if (!list.length) return ''; return `<div class="sec"><h3>${k === 'cheonghae' ? '청해진 관아' : '항구 지분'}<span>돈 쓸 곳</span></h3><div class="hold">${list.map(o => `<div class="order ${o.have ? 'mine' : ''}"><span class="glyph" style="background:var(--ink-2)">${o.ch}</span><span class="gr"><b>${o.name}</b> · ${fmt(o.cost)}냥<br><small>${o.desc}</small></span><button class="btn blue" data-office="${o.id}" ${o.can ? '' : 'disabled'}>${o.have ? o.why : o.can ? '산다' : o.why}</button></div>`).join('')}</div></div>`; })();
  const tabsDef = [['market', '시장', 0], ['port', '항구', C.liveNews().length ? '·' : 0], ['work', '이야기·일거리', (off && !off.none && ords.length < 2 ? 1 : 0) + (s.bOffers[k] && !s.bOffers[k].none && !s.bounty ? 1 : 0) + (C.mainGoals().some(g => g.pay && !g.done && g.pay.k === k) ? 1 : 0)], ['tavern', '선술집', C.tavern(k).offer.length]];
  const body = panelTab === 'market' ? `
    <div class="sec"><h3>시장 — 한 상자 ${C.LOT}묶음<span>빈 칸 ${free} · ${COARSE ? '길게 누르면 가득' : 'Shift+누르면 가득'}</span></h3><div class="goods">${tiles}</div></div>
    <div class="sec"><h3>이 항구가 비싸게 사는 것</h3><div class="wants">${wants}</div></div>
    <div class="sec"><h3>내 짐<span>▲ 아는 곳 중 가장 비싼 곳</span></h3><div class="hold">${hold}</div></div>`
    : panelTab === 'port' ? `${specialHtml(k)}<div class="sec"><h3>배와 조정</h3><div class="acts">${acts}</div></div>${officeHtml}${newsHtml()}`
    : panelTab === 'work' ? `<div class="sec"><h3>본 이야기</h3>${mainBox(k)}</div>${targetsHtml(k)}<div class="sec"><h3>의뢰<span>맡은 일 ${ords.length}/2</span></h3>${offerHtml}${ordHtml || pas ? `<div class="hold" style="margin-top:6px">${ordHtml}${pas}</div>` : ''}</div>`
    : tavernHtml(k);
  $('pBody').innerHTML = `<div class="ptabs" role="tablist">${tabsDef.map(([id, l, b]) => `<button class="${panelTab === id ? 'on' : ''}" data-ptab="${id}" role="tab" aria-selected="${panelTab === id}">${l}${b ? `<i>${b === '·' ? '' : b}</i>` : ''}</button>`).join('')}</div>${body}`;
  $('pLeft').textContent = `상납까지 ${Math.ceil(C.daysToDue())}일`;
  cxLink($('pBody'), { sel: '.special small, .newsl small', max: 3 });
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
  if (b.dataset.act === 'reroll') { const r = C.tavernReroll(); if (!r.ok) { toast(r.text); return; } AU.tok(); toast(r.text); after(); return; }
  if (b.dataset.office) { const r = C.buyOffice(b.dataset.office); if (!r.ok) { toast(r.text || '지금은 안 된다'); return; } AU.pay(); toast(r.text, 'good'); after(); return; }
  if (b.dataset.act === 'bribe') { const c = C.bribe(); if (c) { AU.chime(); toast(`다자이후 관리 소매에 ${fmt(c)}냥을 넣었다. 경계가 가라앉는다.`, 'good'); } after(); return; }
  if (b.dataset.fire) { if (!confirmTap(b, '정말 내린다')) return; const m = C.fireMate(b.dataset.fire); if (m) toast(`${m.name}${JO(m.name, '이', '가')} 배에서 내렸다.`); after(); return; }
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
  if (a === 'rumor') { const r = C.buyRumor(); if (!r.ok) { toast(r.msg); return; } AU.chime(); lastQuote = `“${r.text.line}”`; { const ml = C.mateLine('rumor'); if (ml) lastQuote += `<br><i>${ml.line}</i>`; } if (r.text.k && r.text.id) { const inf = C.infoFor(r.text.k, r.text.id); feedMarket(r.text.k, r.text.id, inf && inf.price > C.G[r.text.id].base * 1.1 ? 'up' : 'down', null, `— ${r.text.line.replace(/^.*?(에선|에|에서) /, '')}`, '선술집 소문'); } else journal(r.text.line, ''); if (r.map) { mapAppear[r.map.id] = performance.now(); toast(`寶 보물 지도 — <b>${r.map.name}</b>`, 'good'); } if (r.text.k) rumorPulse[r.text.k] = performance.now(); after(); return; }
  if (a === 'repair') { const c = C.repair(); if (c) { AU.tok(); const ml = C.mateLine('repair'); toast(ml ? `${ml.line} — ${fmt(c)}냥` : `배를 손봤다. ${fmt(c)}냥`); } after(); return; }
  if (a === 'ship') { const n = C.upgrade(b.dataset.var || 'wide'); if (n) { AU.gong(); banner('船', `${n.name} — 상자 ${C.capacity()}칸${n.tax ? ` · 입항세 ${n.tax}냥` : ''}`); } after(); return; }
  if (a === 'tribute') { const c = C.tribute(); if (c) { AU.chime(); toast(`조정에 ${fmt(c)}냥을 바쳤다. 경계가 가라앉는다.`, 'good'); } after(); return; }
});
let longT = null, longFired = false;
$('pBody').addEventListener('pointerdown', e => { const b = e.target.closest('[data-buy]'); if (!b || b.disabled) return; longFired = false; clearTimeout(longT); longT = setTimeout(() => { longFired = true; buyMax(b.dataset.buy, b); }, 480); });
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => $('pBody').addEventListener(ev, () => clearTimeout(longT)));
function buyMax(id, b) { let n = 0, sum = 0; while (C.freeSlots()) { const r = C.buy(id); if (!r.ok) break; n++; sum += r.cost; } if (!n) { toast('돈이나 자리가 모자란다'); return; } AU.tok(); setTimeout(() => AU.tok(), 90); popAt(b, `${n}상자 -${fmt(sum)}`, 'bad'); after(); if (coachStep === 0) coach(1); }
function diceFx(r) { const cup = $('dcup'); if (!cup) return; const R6 = () => 1 + Math.floor(Math.random() * 6); AU.noise(.5, { freq: 900, q: 3, gain: .2 }); cup.classList.add('shake'); let n = 0; const done = RM ? 0 : 8;
  const iv = setInterval(() => { cup.innerHTML = die(R6()) + die(R6()); if (++n > done) { clearInterval(iv); cup.classList.remove('shake'); cup.innerHTML = die(r.a) + die(r.b);
    if (r.win) AU.coin(1.6); else AU.bad(); journal(`홀짝 — ${r.a}+${r.b}=${r.a + r.b} ${r.even ? '짝' : '홀'}. ${r.win ? `+${fmt(r.pay)}냥` : `${fmt(r.pay)}냥`}`);
    setTimeout(() => { paintHud(); paintPanel(); const d = $('dres'); if (d) { d.className = 'fine dres hit' + (r.win ? '' : ' lost'); d.innerHTML = `${r.a} + ${r.b} = <b>${r.a + r.b}</b> · ${r.even ? '짝' : '홀'} — ${r.win ? `<b class="up">+${fmt(r.pay)}냥</b>` : `<b class="dn">${fmt(r.pay)}냥</b>`}`; } const c2 = $('dcup'); if (c2) c2.innerHTML = die(r.a) + die(r.b);
      toast(`홀짝 ${r.a}+${r.b}=${r.a + r.b} ${r.even ? '짝' : '홀'} — <b>${r.win ? '+' : ''}${fmt(r.pay)}냥</b>`, r.win ? 'good' : 'bad', true); }, 350); } }, 70); }
function saleFx(results, anchor) { results.forEach((r, i) => { setTimeout(() => { AU.coin(r.mult);
    const el = anchor || $('hGold'); const rc = el.getBoundingClientRect(); pop(`${r.profit >= 0 ? '+' : ''}${fmt(r.profit)}${r.mult >= 1.5 ? `  ×${r.mult.toFixed(1)}` : ''}`, rc.left + rc.width / 2 + (i % 3 - 1) * 40, rc.top - 10 - i * 6, r.profit < 0 ? 'bad' : r.mult >= 2 ? 'big' : ''); }, i * 160); });
  /* 팔았다 +X냥 · 이 항구 시세 -N% (물건마다 첫 상자 전 값 → 마지막 상자 뒤 값) */
  if (results.length) { const rev = results.reduce((a, r) => a + r.rev, 0), pf = results.reduce((a, r) => a + r.profit, 0), by = {}; for (const r of results) { const b = by[r.id] = by[r.id] || { p0: r.pct0, p1: r.pct1 }; b.p1 = Math.min(b.p1, r.pct1); b.p0 = Math.max(b.p0, r.pct0); }
    const drop = Object.entries(by).map(([id, b]) => `${C.G[id].name} -${Math.max(0, Math.round((1 - b.p1 / b.p0) * 100))}%`).join(' · ');
    toast(`팔았다 <b>+${fmt(rev)}냥</b> (이익 ${pf >= 0 ? '+' : ''}${fmt(pf)}) · 이 항구 시세 ${drop}${results.some(r => r.threat >= 1) ? ` · 경계 +${Math.round(results.reduce((a, r) => a + r.threat, 0))}` : ''}`, pf < 0 ? 'bad' : ''); }
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
  const warn = [...rc.map(x => `<span class="chip head">경주 — ${x.ch} ${x.name}도 이리 온다 · 약 ${Math.max(1, Math.round(x.days))}일${x.good ? ' · ' + C.G[x.good].name : ''} · 먼저 닿으면 명성 +25, 값을 지킨다</span>`), (s.escort || s.navyUntil > s.t) ? '<span class="chip fair">수군 호위 — 해적이 안 붙는다</span>' : '', s.blessed ? '<span class="chip fair">법화원 축복 — 폭풍이 비켜 간다</span>' : '', r.days > C.daysToDue() && s.gold < C.quotaNow() ? '<span class="chip head">상납 날까지 못 닿는다 — 돈이 모자라면 짐을 7할에 넘긴다</span>' : '', s.hull < s.hullMax * .4 ? '<span class="chip head">선체가 약하다</span>' : '',
    r.wind === '역풍' && r.waitFor ? `<button class="chipbtn" id="dWait">${r.waitFor}일 기다리면 순풍 — 기다린다</button>` : ''].join('');
  const tn0 = !P && targetNear(...p.main.path[p.main.path.length - 1]);
  $('dest').innerHTML = `<h4>${P ? `<span class="seal">${P.ch}</span>${P.name}` : tn0 ? (tn0.kind === 'map' ? '<span class="seal" style="background:var(--hwang)">寶</span>보물 자리로' : `<span class="seal">${tn0.b.ch}</span>${tn0.b.name} 잡으러`) : (C.revealed(...p.main.path[p.main.path.length - 1]) ? '이 바다로' : '안개 속으로')}</h4>
    <div class="routes">${routes}</div>${warn ? `<div class="chips">${warn}</div>` : ''}<ul>${rows}</ul><div class="row"><button class="btn" id="dCancel">그만둔다</button><button class="btn main" id="dGo">출항</button></div>`;
  $('dest').hidden = false; $('dCancel').onclick = hideDest; $('dGo').onclick = () => go(p);
  { const w = $('dWait'); if (w) w.onclick = () => { const n = r.waitFor; if (!C.waitDays(n)) return; AU.tok(); toast(`${n}일을 기다렸다. 바람이 돌았다.`); after(); if (anyModal()) { hideDest(); return; } const p2 = p.port ? C.plan(p.port) : C.plan({ x: p.main.path[p.main.path.length - 1][0], y: p.main.path[p.main.path.length - 1][1] }); if (p2 && !p2.closedPort) showDest(p2, true); else hideDest(); }; }
  $('dest').querySelectorAll('[data-route]').forEach(b => b.onclick = () => { routePick = b.dataset.route; showDest(p, true); });
  if (!$('panel').hidden && !panelMin) setPanelMin(true); else placeToasts();
  if (!keepPick) { const end = p.main.path[p.main.path.length - 1]; const mx = (s.x + end[0]) / 2, my = (s.y + end[1]) / 2, span = Math.max(Math.abs(end[0] - s.x) / (AREA.w * .75), Math.abs(end[1] - s.y) / (AREA.h * .65));
    lookAt(mx, my, Math.max(cam.fit, Math.min(cam.z, 1 / Math.max(span, 1e-3)))); }
  if (coachStep === 1) coach(2);  // 어느 행선지 카드든 열리면 다음 안내
}
function hideDest() { destPlan = null; $('dest').hidden = true; placeToasts(); }
function go(p) { const s = S(); const useAlt = routePick === 'alt' && !!p.alt; hideDest(); lastQuote = null; trail = [[s.x, s.y]]; if (!C.depart(p, useAlt)) return; AU.depart(); closePanel(); showSailbar(); paintHud(); cam.touched = 0; cam.wide = false; lookAt(s.x, s.y, defaultZoom());
  if (coachStep >= 0 && coachStep < 3) coach(3); }  // 출항하면 어느 단계에 있었든 항해 안내로
let speedIdx = 0;
function showSailbar() { const s = S(); const el = $('sailbar'); el.hidden = false;
  if (s.mode === 'sea') { el.innerHTML = `<span class="to">바다 위<small>지도를 눌러 다음 행선지</small></span>`; return; }
  last.st = null; last.ch = null; el.innerHTML = `<span class="to">${s.dest ? '→ ' + C.PORTS[s.dest].name : '탐험'}<small id="sbRem"></small></span><button class="row" id="sbRow" title="노 저어라 (Space) — 기력을 써서 바람과 상관없이 빨라진다"><em>노 저어라</em><s></s></button><div class="speed" role="group" aria-label="빠르기">${SPEEDS.map((v, i) => `<button data-sp="${i}" class="${i === speedIdx ? 'on' : ''}">${v}×</button>`).join('')}</div>`;
  $('sbRow').onclick = () => toggleRow(); el.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => { speedIdx = +b.dataset.sp; el.querySelectorAll('[data-sp]').forEach(x => x.classList.toggle('on', +x.dataset.sp === speedIdx)); }); placeToasts(); }
const hideSailbar = () => { $('sailbar').hidden = true; $('sailbar').classList.remove('chased'); placeToasts(); };
function toggleRow() { const s = S(); if (!s || s.mode !== 'sail') return; AU.init(); const on = C.setRow(!s.rowing); if (on) { const ml = C.mateLine('row'); if (ml) toast(ml.line, '', true); AU.noise(.25, { freq: 500, q: 2, gain: .25 }); AU.tone(160, { dur: .2, gain: .1 }); } else if (s.stamina <= 3) toast('선원들이 지쳤다. 기력은 쉬면서 천천히 찬다.'); paintHud(); }

/* ─────────── 사건 ─────────── */
const EV_CH = { storm: '風', calm: '靜', wreck: '破', sail: '帆', castaway: '漂', reef: '礁', fairwind: '順', monk: '僧', captives: '奴', ghost: '鬼', spout: '龍', whale: '鯨', fog: '霧', fever: '病', grumble: '怨', smuggler: '密', stars: '星', envoy: '使', drift: '流', pirate: '賊', rival: '商' };
function openEvent(ev) { const s = S(); AU[['storm', 'pirate'].includes(ev.id) ? 'drum' : 'chime']();
  $('evCard').innerHTML = `<span class="ev-ink" aria-hidden="true">${EV_CH[ev.id] || '海'}</span><div class="eyebrow">바다에서 · ${C.dateStr(s.t)}</div><h2 style="padding-right:56px">${ev.title}</h2><p>${ev.text}</p><div class="choices">${ev.opts.map((o, i) => `<button class="choice" data-i="${i}"><b>${o.label}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</button>`).join('')}</div>`;
  cxLink($('evCard'), { sel: ':scope > p', max: 3 }); ART.cardArt($('evCard'), 'ev', ev.id); $('mEvent').hidden = false; $('evCard').querySelector('.choice').focus({ preventScroll: true });
  $('evCard').querySelectorAll('.choice').forEach(b => b.onclick = () => { const r = C.choose(+b.dataset.i); if (r.battle) { $('mEvent').hidden = true; openBattle(); return; } if (r.map) mapAppear[r.map.id] = performance.now(); if (r.good) AU.good(); else if (r.bad) AU.bad();
    $('evCard').querySelector('.choices').outerHTML = `<div class="result ${r.good ? 'good' : r.bad ? 'bad' : ''}">${r.text}</div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn main" id="evOk">계속</button></div>`;
    $('evOk').focus({ preventScroll: true });
    $('evOk').onclick = () => { $('mEvent').hidden = true; paintHud(); if (r.wreck) { hideSailbar(); trail = []; toast(`배가 부서졌다. 상자 ${r.wreck.lost}개를 잃고 ${C.PORTS[r.wreck.port].name}${JO(C.PORTS[r.wreck.port].name,'으로','로')} 실려 왔다.`, 'bad'); openPanel(); lookAt(S().x, S().y); saveGame(); } }; }); }

/* ─────────── 입항 개봉 ─────────── */
function openReveal(info) { panelTab = 'market'; for (const mv of (info.moves || []).slice().reverse()) feedMarket(info.k, mv.id, mv.pct > 0 ? 'up' : 'down', mv.pct, `— ${mv.days}일 전 본 값보다 (직접 봄)`, '본 값');
  const s = S(), P = C.PORTS[info.k]; hideSailbar(); trail.push([s.x, s.y]);
  const sell = info.items.map(it => it.profit >= 0);
  const fresh = info.fresh ? `<div class="fresh"><b>처음 보는 시세표</b> — 아무도 이 항구 값을 모른다.<br>${C.GOODS.slice().sort((a, b) => s.markets[info.k].idx[b.id] - s.markets[info.k].idx[a.id]).map(g => `${g.name} <b class="num">${fmt(C.sellPrice(info.k, g.id) * C.LOT)}</b>`).join(' · ')}</div>` : '';
  const sub = [`${s.voyage.from && C.PORTS[s.voyage.from] ? C.PORTS[s.voyage.from].name + '에서 ' : ''}${info.days.toFixed(1)}일`, info.storms ? `폭풍 ${info.storms}번` : '', info.first ? '첫 입항 · 명성 +60' : '', info.tax ? `입항세 ${fmt(info.tax)}냥` : ''].filter(Boolean).join(' · ');
  const deliv = info.delivered.length ? `<div class="fresh" style="border-color:var(--rok)">${info.delivered.map(o => `<b style="color:var(--rok)">의뢰 완수</b> — ${C.G[o.good].name} ${o.n}상자 · 보수 <b class="num">${fmt(o.reward)}냥</b>`).join('<br>')}</div>` : '';
  const extra = [info.passenger ? `<b style="color:var(--rok)">${info.passenger.who}를 내려줬다</b> — 사례 ${fmt(info.passenger.gold)}냥 · 명성 +80<br>“${info.passenger.line}”` : '', ...(info.race || []).map(r => { const vl = C.rivalLine(r.id, r.won ? 'beaten' : 'won'); return r.won ? `<b style="color:var(--rok)">${r.ch} ${r.name}보다 먼저 닿았다!</b> 명성 +25 — 값이 아직 성하다.${vl ? ` <i>${vl}</i>` : ''}` : `<b style="color:var(--ju)">${r.ch} ${r.name}${JO(r.name,'이','가')} 먼저 닿았다.</b>${vl ? ` <i>${vl}</i>` : ''}`; })].filter(Boolean);
  const extraHtml = extra.length ? `<div class="fresh" style="border-color:var(--rok)">${extra.join('<br>')}</div>` : '';
  const rivals = info.rivalHere.length ? `<p class="letter" style="color:var(--ju)">${info.rivalHere.map(r => `${r.rival.name}${JO(r.rival.name,'이','가')} 며칠 전 ${C.G[r.id].name}${JO(C.G[r.id].name,'을','를')} 풀고 갔다`).join(' · ')} — 값이 눌려 있다.</p>` : '';
  const cards = info.items.map((it, n) => { const g = C.G[it.id];
    return `<div class="flip" data-n="${n}"><div class="in"><div class="f">${gi(g)}<small>${it.inf ? `${it.inf.src} ${fmt(it.inf.price)}<br>${it.inf.ago}` : '이 항구 값을 모른다'}</small></div>
      <div class="b"><span class="nm">${gl(g)}${g.name}</span><span class="was">산 값 ${fmt(it.cost)}</span><span class="was">${it.inf ? `${it.inf.src} ${fmt(it.inf.price)} →` : '여기 값'}</span><span class="now" data-act-n="${n}">${fmt(it.act)}</span><span class="plrow"><span class="pl ${it.profit >= 0 ? 'up' : 'dn'}" data-pl-n="${n}">${it.profit >= 0 ? '+' : ''}${fmt(it.profit)}</span><span class="stamp ${it.verdict}">${VERDICT[it.verdict]}</span></span><button class="keep ${sell[n] ? 'sell' : ''} ${it.profit < 0 ? 'loss' : ''}" data-k="${n}">${sell[n] ? (it.profit < 0 ? '손해 보고 판다' : '판다') : '남긴다'}</button></div></div></div>`; }).join('');
  $('rvCard').innerHTML = `<div class="eyebrow">입항 · ${C.dateStr(s.t)}</div><h2>${P.name}</h2><p class="sub" style="margin:0">${sub}</p>${fresh}${deliv}${extraHtml}${rivals}${info.letter ? `<p class="letter">${s.boons.letters ? '비둘기 편지' : '아사 동생의 편지'} — “${info.letter.line}”</p>` : ''}
    ${info.items.length ? `<div class="crates" data-n="${info.items.length}">${cards}</div><div class="total"><span id="rvTotalL">팔면</span><span class="big" id="rvTotal">…</span></div>` : '<p style="margin-top:14px">빈 배로 들어왔다.</p>'}
    <div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn main" id="rvOk">${info.items.length ? '팔고 내린다' : '내린다'}</button></div>`;
  ART.cardArt($('rvCard'), 'port', info.k, s.t); $('mReveal').hidden = false; if (info.delivered.length || extra.length) AU.good(); spNote = null;
  /* 값은 상자마다 3%씩 내려간다 — 남길 상자를 바꿀 때마다 core.previewSale로 실제 팔릴 값을 다시 센다(판 뒤 들어오는 돈과 같다) */
  const keepIdx = () => info.items.map((it, n) => sell[n] ? null : it.i).filter(x => x !== null);
  const preview = () => { const pv = C.previewSale(info.k, keepIdx()); let t = 0, rev = 0, n = 0; info.items.forEach((it, i) => { const p = pv.items[it.i]; if (!p) return; n++; t += p.profit; rev += p.act; const a = $('rvCard').querySelector(`[data-act-n="${i}"]`), b = $('rvCard').querySelector(`[data-pl-n="${i}"]`); if (a) a.textContent = fmt(p.act); if (b) { b.textContent = (p.profit >= 0 ? '+' : '') + fmt(p.profit); b.className = 'pl ' + (p.profit >= 0 ? 'up' : 'dn'); } }); return { t, rev, n }; };
  const total = () => preview().t;
  const paintTotal = () => { const el = $('rvTotal'); if (!el) return; const { t, rev, n } = preview(); el.textContent = n ? `${fmt(rev)}냥 (${t >= 0 ? '+' : ''}${fmt(t)})` : '—'; el.className = 'big ' + (t >= 0 ? 'up' : 'dn'); const L = $('rvTotalL'); if (L) L.textContent = n ? `${n}상자 팔면` : '팔 상자 없음'; const ok = $('rvOk'); if (ok) ok.textContent = n ? '팔고 내린다' : '내린다'; };
  info.items.forEach((it, n) => setTimeout(() => { const c = $('rvCard').querySelector(`.flip[data-n="${n}"]`); if (!c) return; c.classList.add('open'); AU.flip();
    setTimeout(() => { if (it.verdict === 'better') { AU.good(); popAt(c, '적중!', 'big'); } else if (it.verdict === 'fake' || it.verdict === 'worse') AU.bad(); else AU.coin(1); }, 380); }, 450 + n * 480));
  setTimeout(() => { const el = $('rvTotal'); if (!el) return; const t = total(), t0 = performance.now(); (function tick(now) { const q = Math.min(1, (now - t0) / 700), e = 1 - Math.pow(1 - q, 3); el.textContent = (t >= 0 ? '+' : '') + fmt(t * e); el.className = 'big ' + (t >= 0 ? 'up' : 'dn'); if (q < 1) requestAnimationFrame(tick); else paintTotal(); })(t0); }, 450 + info.items.length * 480);
  $('rvCard').querySelectorAll('.keep').forEach(b => b.onclick = e => { e.stopPropagation(); const n = +b.dataset.k; sell[n] = !sell[n]; b.classList.toggle('sell', sell[n]); b.textContent = sell[n] ? (info.items[n].profit < 0 ? '손해 보고 판다' : '판다') : '남긴다'; paintTotal(); });
  $('rvOk').focus({ preventScroll: true });
  $('rvOk').onclick = () => { const keep = info.items.map((it, n) => sell[n] ? null : it.i).filter(x => x !== null); const res = C.sellAll(keep); $('mReveal').hidden = true;
    openPanel(); lookAt(S().x, S().y); if (res.length) saleFx(res, $('hGold')); after(); if (coachStep === 4) coach(5); runStories(); };
  if (coachStep === 3) coach(4);
}

/* ─────────── 상납 · 특권 ─────────── */
/* 계절 결산 표: 어디서 벌고 어디에 썼나(core.seasonReport). 0인 줄은 뺀다 */
function reportHtml(R, title) { if (!R) return ''; const row = (k, v, cls) => `<div class="${cls || ''}"><dt>${k}</dt><dd>${v > 0 && cls === 'in' ? '+' : ''}${fmt(v)}</dd></div>`;
  const inc = R.inc.filter(x => x[1]).map(([k, v]) => row(k, v, 'in')).join(''), out = R.out.filter(x => x[1]).map(([k, v]) => row(k, -v, 'out')).join('');
  return `<div class="report"><h3>${title || '계절 결산'} <small>${R.days}일</small></h3><dl class="ledger">${inc}${out}${R.other ? row('기타(사건·발견·이야기·압류)', R.other, R.other >= 0 ? 'in' : 'out') : ''}${row('재산 변화', R.net, 'sum')}</dl></div>`; }
const curveHtml = () => `<div class="curve"><h3>앞으로 네 번의 상납</h3><dl class="ledger">${C.quotaCurve().map((q, i) => `<div class="${i === 0 ? 'now' : ''}"><dt>${q.season}${i === 0 ? ' (다음)' : ''}</dt><dd>${fmt(q.amount)}</dd></div>`).join('')}</dl><small class="fine" style="text-align:left;display:block">${C.ship().name} 기준 상한 ${fmt(C.quotaCap())}냥 — 더 큰 배를 사면 상한도 오른다. 열두 번째 상납이 마지막이다.</small></div>`;
function openQuota(res) {
  const s = S(); hideDest();
  if (!res.ok) { AU.drum(); finish(); return; }
  if (res.finale) { AU.pay(); finish(); return; } // 세 해를 채웠다 — 결산으로
  const season = ['봄', '여름', '가을', '겨울'][(s.quotaN - 1) % 4], yr = res.year;
  if (s.quotaN >= 4) META.unlocked.ara = true; if (s.quotaN >= 6) META.unlocked.tomo = true; saveMeta();
  const common = `${res.wages ? ` 선원 급료 ${fmt(res.wages)}냥을 치렀다.` : ''}${res.left && res.left.length ? ` <b class="dn">급료를 못 받은 ${res.left.join(', ')}이 배를 떠났다.</b>` : ''}`;
  if (res.debt) { /* 못 냈다 — 빚으로 넘어간다 */
    AU.drum(); const lb = res.lostBoon && C.BOONS.find(x => x.id === res.lostBoon);
    $('qCard').innerHTML = `<span class="q-stamp" aria-hidden="true">債</span><div class="eyebrow">${season} 상납 · ${C.dateStr(s.t)}</div><h2>${C.cap().quotaName} <span class="num">${fmt(res.amount)}</span>냥을 못 냈다</h2>
      <p>${res.seized ? `짐을 7할 값(${fmt(res.seized)}냥)에 넘기고도 ` : ''}<b class="dn">${fmt(res.short)}냥이 모자랐다.</b> ${res.keep ? `뱃삯 ${fmt(res.keep)}냥만 남기고 가진 돈을 다 거두어 갔다.` : '가진 돈은 다 거두어 갔다.'} 모자란 돈의 1.3배, <b class="num">${fmt(res.debt)}냥</b>이 다음 상납에 얹힌다.${lb ? ` 특권 <b>${lb.name}</b>${JO(lb.name, '을', '를')} 빼앗겼다.` : ''} 경계 +15.${common}</p>
      <p class="dn"><b>${res.debtsLeft > 0 ? `한 번 더 못 내면 끝이다.` : `다음 상납을 못 내면 끝이다.`}</b> 다음 상납은 <b class="num">${fmt(res.next)}냥</b>, ${Math.round(C.daysToDue())}일 뒤.</p>
      ${reportHtml(res.report)}${curveHtml()}<div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn main" id="qOk">알겠다</button></div>`;
    $('mQuota').hidden = false; $('qOk').focus({ preventScroll: true });
    $('qOk').onclick = () => { $('mQuota').hidden = true; banner('債', `빚 ${fmt(res.debt)}냥 — 다음 상납에 얹힌다`); paintHud(); if (S().mode === 'port') { paintPanel(); saveGame(); runStories(); } }; return; }
  AU.pay();
  const cards = () => s.draft.map(id => { const b = C.BOONS.find(x => x.id === id), have = s.boons[id] || 0;
    return `<button class="boon" data-b="${id}"><span class="bch">${b.ch}</span><b>${b.name}${have ? ` <small>${have + 1}번째</small>` : ''}</b><span>${b.text}</span></button>`; }).join('');
  $('qCard').innerHTML = `<span class="q-stamp" aria-hidden="true">納</span><div class="eyebrow">${season} 상납 · ${C.dateStr(s.t)}</div><h2>${C.cap().quotaName} <span class="num">${fmt(res.amount)}</span>냥</h2>
    <p>${res.seized ? `돈이 모자라 짐을 7할 값(${fmt(res.seized)}냥)에 넘겨 겨우 맞췄다. ` : ''}${res.hadDebt ? `<b>빚 ${fmt(res.hadDebt)}냥까지 갚았다.</b> ` : ''}${yr && s.quotaN === 4 ? '<b>한 해를 버텼다.</b> 둘째 해부터 상납이 크게 오른다. ' : yr ? '<b>또 한 해를 버텼다.</b> ' : ''}다음 상납은 <b class="num">${fmt(res.next)}냥</b>, ${Math.round(C.daysToDue())}일 뒤.${C.dif().share ? ` ${C.dif().name} — 상납은 재산(돈·짐·배 값 절반)의 ${Math.round(C.dif().share * 10)}할보다 적지 않다.` : ''}${common}</p>
    <div class="sub" style="margin-bottom:8px">특권 하나를 고른다 <button class="chipbtn" id="qRedraw" ${s.gold < C.REDRAW_COST || s.redrew ? 'disabled' : ''}>${s.redrew ? '다시 뽑았다' : `다시 뽑는다 · ${fmt(C.REDRAW_COST)}냥`}</button></div><div class="boons" id="qBoons">${cards()}</div>${reportHtml(res.report)}${curveHtml()}`;
  $('mQuota').hidden = false;
  const wire = () => $('qCard').querySelectorAll('[data-b]').forEach(b => b.onclick = () => { const r = C.takeBoon(b.dataset.b); $('mQuota').hidden = true; AU.chime();
    const bn = C.BOONS.find(x => x.id === r.id); toast(`특권 — <b>${bn.name}</b>. ${bn.text}`, 'good');
    if (r.note) { const P = C.PORTS[r.note]; toast(`옛 해도에 <b>${P.name}</b> 근처 바다가 그려져 있다.`, 'good'); lookAt(P.x, P.y, Math.max(cam.fit * 1.2, cam.z * .8)); }
    if (yr) banner('年', `${s.stats.years}년을 버텼다${s.quotaN < 12 ? ' — 다음 해 상납이 오른다' : ''}`);
    paintHud(); if (S().mode === 'port') { paintPanel(); saveGame(); runStories(); } });
  wire(); $('qRedraw').onclick = () => { if (!C.redrawBoons()) return; AU.flip(); $('qBoons').innerHTML = cards(); $('qRedraw').disabled = true; $('qRedraw').textContent = '다시 뽑았다'; paintHud(); wire(); };
}

/* ─────────── 이야기 ─────────── */
function runStories() { const s = S(); if (!s || anyModal()) return; if (s.ended) { finish(); return; } if (s.qNotes && s.qNotes.length) { drainQuests(); return; } const st = C.nextStory(); if (!st) { if (coachPending && s.mode === 'port') { coachPending = false; coach(0); } return; } openStory(st); }
const EYEBROW = st => st.eyebrow || (st.who === 'main' || st.who === 'scene' ? `본 이야기 · 第${st.act || '一'}幕` : st.who === 'quest' ? (st.qch === '圖' ? '곽의 부탁' : '이야기') : st.who === 'port' ? '포구에서' : st.who === 'inspector' ? '조정의 눈' : CREW_CH[st.who] ? `${C.CREW.find(c => c.k === st.who).name}의 부탁` : '이야기');
function openStory(st) { if (st.who === 'main' && !st.title.includes('마지막')) { AU.gong(); } const ch = st.who === 'main' || st.who === 'scene' ? '幕' : st.who === 'port' ? '港' : st.qch && st.who === 'quest' ? st.qch : st.who === 'inspector' ? '監' : CREW_CH[st.who] || st.qch || '話'; AU[st.who === 'inspector' ? 'drum' : 'chime']();
  const sp = st.spk && PORTRAIT.has(st.spk) ? { id: st.spk, expr: PORTRAIT.exprs(st.spk)[0] } : st.who === 'scene' ? null : PORTRAIT.speaker(Object.assign({ fin: /막이 내린다$/.test(st.title) }, st), S().cap, C.NUM.indexOf(st.act)); // 말하는 사람 초상(막을 여는 사람이 있으면 그 사람), 없으면 글자 도장
  $('stCard').innerHTML = `${sp ? `<span class="who pt">${PORTRAIT.svg(sp.id, { size: 84, expr: sp.expr, frame: st.who === 'main' ? 'card' : 'round' })}</span>` : `<span class="who ${st.who === 'inspector' ? 'inspector' : ''}">${ch}</span>`}<div class="eyebrow">${EYEBROW(st)}</div><h2 style="padding-right:${sp ? 92 : 64}px">${st.title}</h2><p>${st.text}</p>${st.sub ? `<p class="sub">${st.sub}</p>` : ''}
    <div class="choices">${st.opts.map((o, i) => `<button class="choice" data-i="${i}" ${o.off ? 'disabled' : ''}><b>${o.label}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</button>`).join('')}</div>`;
  cxMark('story:' + st.who); cxLink($('stCard'), { sel: ':scope > p', max: 3 }); $('stCard').classList.toggle('chapter', st.who === 'main' || st.who === 'scene'); if (st.who === 'port' && ART.PE_BY_TITLE[st.title]) ART.cardArt($('stCard'), 'ev', ART.PE_BY_TITLE[st.title]); else ART.clearArt($('stCard')); $('mStory').hidden = false; $('stCard').querySelector('.choice').focus({ preventScroll: true });
  $('stCard').querySelectorAll('.choice').forEach(b => b.onclick = () => { const r = st.opts[+b.dataset.i].apply(); $('mStory').hidden = true; if (r) toast(r); if (S().mode === 'port') after(); else paintHud(); setTimeout(runStories, 250); }); }


/* ═══════════ 해전 화면 ═══════════ */
const BT = { w: 0, h: 0, me: { x: 0, tx: 0, lunge: 0, shake: 0, sink: 0 }, foe: { x: 0, tx: 0, lunge: 0, shake: 0, sink: 0 }, fx: [], sparks: [], open: false };
const FOE_LOOK = { black: ['#1e2829', '#4a4d48', '#1b2324'], slaver: ['#4a3a2c', '#8a6a44', '#6b4a32'], boss: ['#2a1e1a', '#9a3a28', '#b03a26'], pirate: ['#2e2a26', '#6a655a', '#1b2324'] };
/* 적의 다음 수 그림 — 32칸 선 그림 */
const INT_ICON = {
  shoot: '<path d="M4 16h21M20 11l5 5-5 5M4 16l-2.5-3M4 16l-2.5 3M8 16l-2.5-3M8 16l-2.5 3"/>',
  volley: '<path d="M4 8h19M19 4.5l4 3.5-4 3.5M4 16h22M22 12.5l4 3.5-4 3.5M4 24h19M19 20.5l4 3.5-4 3.5"/>',
  aim: '<path d="M10 3c8 5 8 21 0 26M10 3l7 13-7 13M17 16h12M26 13l3 3-3 3"/>',
  close: '<path d="M21 6l-9 10 9 10M29 6l-9 10 9 10M3 16h7"/>',
  retreat: '<path d="M11 6l9 10-9 10M3 6l9 10-9 10M22 16h7"/>',
  ram: '<path d="M3 21h15l7-7M18 21l8 4M3 21l3-5h8"/><path d="M26 6l2-3M29 11h3M27 16l3 1.5"/>',
  board: '<path d="M16 3v17M12 5h8M16 20c0 5-7 6.5-9.5 2M16 20c0 5 7 6.5 9.5 2M6.5 22l-1.5-4M25.5 22l1.5-4"/>',
  hesitate: '<circle cx="9" cy="16" r="1.8"/><circle cx="16" cy="16" r="1.8"/><circle cx="23" cy="16" r="1.8"/>'
};
/* 규칙(core.battleAct)을 그대로 읽어 '받아내는 수'를 알려 준다 — 규칙은 바꾸지 않는다 */
function counters(B) { const k = B.intent.k, near = B.dist === 'near';
  if (k === 'volley') return near ? [['guard', '방패로 받는다'], ['board', '붙어 있으면 반만 맞는다']] : [['guard', '방패로 받는다'], ['move', '파고들면 반만 맞는다']];
  if (k === 'board') return near ? [['guard', '방패'], ['move', '떨어지면 허공을 친다'], ['board', '맞받아친다']] : [];
  if (k === 'ram') return near ? [['guard', '방패'], ['move', '떨어지면 헛돈다']] : [];
  if (k === 'aim') return [['guard', '다음 수에 방패'], ['move', near ? '' : '미리 붙어 두기']].filter(x => x[1]);
  if (k === 'close') return [['shoot', '다가오는 놈 노리기 +30%']];
  return []; }
function btLayout() { const c = $('btCv'); const w = c.clientWidth || 400, h = c.clientHeight || 150; c.width = Math.round(w * DPR); c.height = Math.round(h * DPR); BT.w = w; BT.h = h; btTargets(true); }
function btTargets(snap) { const B = S().battle; const near = B && B.dist === 'near'; BT.me.tx = BT.w * (near ? .35 : .2); BT.foe.tx = BT.w * (near ? .65 : .8); if (snap) { BT.me.x = BT.me.tx; BT.foe.x = BT.foe.tx; } }
function btVolley(from, to, n, col) { const now = performance.now(); for (let i = 0; i < n; i++) BT.fx.push({ from, to, t0: now + i * 70, dur: 480, dy: (Math.random() - .5) * 14, col }); }
function btHit(side, big) { const t = side === 'me' ? BT.me : BT.foe, deck = BT.h * .72 - 14 * btScale(); t.shake = RM ? 0 : big ? 10 : 5;
  for (let i = 0; i < (big ? 18 : 9); i++) BT.sparks.push({ x: t.x + (Math.random() - .5) * 40, y: deck + (Math.random() - .5) * 14, vx: (Math.random() - .5) * 3, vy: -Math.random() * 2.6 - .5, life: 1, col: i % 3 ? '#5a3e24' : big ? COL.ju : '#efe6cf', sz: 1.6 + Math.random() * 2.4 });
  for (let i = 0; i < 6; i++) BT.sparks.push({ x: t.x + (Math.random() - .5) * 60, y: BT.h * .72 + 2, vx: (Math.random() - .5) * 1.4, vy: -Math.random() * 2.2 - 1, life: 1, col: 'rgba(245,240,227,.9)', sz: 2 }); }
const btScale = () => Math.max(.5, Math.min(1.15, BT.w / 560));
function drawBattle() { const c = $('btCv'); if (!c || !BT.w) return; const g = c.getContext('2d'), w = BT.w, h = BT.h, now = performance.now(), B = S().battle, t = RM ? 0 : clock; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const hz = h * .38, wl = h * .72, sc = btScale();
  const sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#ece4cf'); sky.addColorStop(1, '#dbd4bf'); g.fillStyle = sky; g.fillRect(0, 0, w, hz + 1);
  g.fillStyle = 'rgba(70,90,92,.28)'; g.beginPath(); g.moveTo(0, hz); for (let x = 0; x <= w; x += 8) g.lineTo(x, hz - Math.max(0, Math.sin(x / 70 + 1) * 10 + Math.sin(x / 23) * 4 + (x < w * .3 ? 12 : 0))); g.lineTo(w, hz); g.fill();
  const sea = g.createLinearGradient(0, hz, 0, h); sea.addColorStop(0, '#bccfc4'); sea.addColorStop(1, '#4a7b80'); g.fillStyle = sea; g.fillRect(0, hz, w, h - hz);
  const rows = 9; for (let j = 0; j < rows; j++) { const q = (j + 1) / rows, y = hz + (h - hz) * Math.pow(q, 1.4); if (y > wl + 6) break; waveRow(g, y, w, .6 + q * 3, 14 + q * 30, t * (.8 + q) + j, .08 + q * .2, .5 + q, false); }
  if (!B) return; btTargets(false);
  for (const s of [BT.me, BT.foe]) { s.x += (s.tx - s.x) * (RM ? 1 : .08); s.lunge *= .88; s.shake *= .86; }
  const bob = Math.sin(t * 2.2) * 2, look = FOE_LOOK[(B.spec && B.spec.kind) || 'pirate'] || FOE_LOOK.pirate, dead = B.e.hp <= 0;
  if (dead) BT.foe.sink = Math.min(1, BT.foe.sink + .012); else BT.foe.sink = 0; if (S().hull <= 0) BT.me.sink = Math.min(1, BT.me.sink + .012); else BT.me.sink = 0;
  const mx = BT.me.x + BT.me.lunge + (Math.random() - .5) * BT.me.shake, fx = BT.foe.x - BT.foe.lunge + (Math.random() - .5) * BT.foe.shake;
  if (B.dist === 'near' && !dead) { g.strokeStyle = 'rgba(27,35,36,.6)'; g.lineWidth = 1.2; for (const dy of [-22, -8]) { g.beginPath(); g.moveTo(mx + 50 * sc, wl + dy * sc + bob); g.quadraticCurveTo((mx + fx) / 2, wl + dy * sc + 14, fx - 50 * sc, wl + dy * sc - bob); g.stroke(); } }
  shipSide(g, mx, wl + bob + BT.me.sink * 30 * sc, sc * (1 + S().tier * .06), { dir: 1, roll: Math.sin(t * 1.6) * .03 + BT.me.sink * .3, flag: COL.ju, t, alpha: 1 - BT.me.sink * .6 });
  const big = B.e.boss ? 1.18 : B.spec && B.spec.kind === 'black' ? 1.1 : 1;
  ART.foe(g, fx, wl - bob + BT.foe.sink * 34 * sc, sc * big, { dir: -1, hull: look[0], sail: look[1], sail2: look[1], trim: look[2], roll: Math.sin(t * 1.4 + 1) * .03 + BT.foe.sink * .35, flag: B.e.boss ? COL.ju : COL.ink, t, tatter: !B.e.boss, ch: B.e.ch, chBg: B.e.boss ? COL.ju : COL.ink, alpha: 1 - BT.foe.sink * .7 }, B);
  g.fillStyle = 'rgba(74,123,128,.55)'; g.beginPath(); g.moveTo(0, wl + 4); for (let x = 0; x <= w; x += 6) g.lineTo(x, wl + 4 + Math.sin(x / 18 + t * 2) * 2.2); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  waveRow(g, wl + 6, w, 2.5, 26, t * 1.6, .32, 1.2, true);
  if (!B.over) { const I = B.intent, danger = I.dmg >= B.e.atk * 1.4, warn = I.k === 'aim'; if (danger || warn) { const ex = fx, ey = wl - 118 * sc * big + Math.sin(t * 4) * 2; g.fillStyle = danger ? COL.ju : COL.hwang; g.beginPath(); g.moveTo(ex, ey + 15); g.lineTo(ex - 7, ey + 6); g.lineTo(ex + 7, ey + 6); g.fill(); g.fillRect(ex - 13, ey - 20, 26, 26); g.fillStyle = COL.hanji2; g.font = `600 18px ${css('--ui')}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', ex, ey - 6.5); } }
  for (const f of BT.fx) { const q = (now - f.t0) / f.dur; if (q < 0 || q > 1) continue; const a = f.from === 'me' ? mx + 30 * sc : fx - 30 * sc, b = f.from === 'me' ? fx - 10 * sc : mx + 10 * sc, y0 = wl - 34 * sc, arc = 26 + Math.abs(b - a) * .12;
    const x = a + (b - a) * q, y = y0 + f.dy * q - Math.sin(q * Math.PI) * arc, dx = (b - a), dy = f.dy - Math.cos(q * Math.PI) * Math.PI * arc, ang = Math.atan2(dy, dx), L = 11;
    g.strokeStyle = f.col || COL.ink; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - Math.cos(ang) * L, y - Math.sin(ang) * L); g.lineTo(x, y); g.stroke();
    if (f.col === COL.ju) { g.fillStyle = 'rgba(232,140,60,.9)'; g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); g.fillStyle = 'rgba(90,90,90,.25)'; g.beginPath(); g.arc(x - Math.cos(ang) * 16, y - Math.sin(ang) * 16, 3.5, 0, 7); g.fill(); } }
  BT.fx = BT.fx.filter(f => now - f.t0 < f.dur + 50);
  for (const p of BT.sparks) { p.x += p.vx; p.y += p.vy; p.vy += .13; p.life -= .03; g.globalAlpha = Math.max(0, p.life); g.fillStyle = p.col; g.fillRect(p.x, p.y, p.sz || 2.4, p.sz || 2.4); } g.globalAlpha = 1; BT.sparks = BT.sparks.filter(p => p.life > 0);
  g.fillStyle = 'rgba(27,35,36,.6)'; g.font = `12px ${css('--display')}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(B.dist === 'near' ? '— 맞붙었다 —' : '— 활 거리 —', w / 2, h - 8); }
function openBattle() { const s = S(), B = s.battle; if (!B) return; hideDest(); AU.drum(); { const sp = B.spec || {}; CODEX.mark(CX.st, 'battle:' + (sp.kind || 'pirate')); if (sp.boss) CODEX.mark(CX.st, 'boss:' + sp.boss); } BT.fx = []; BT.sparks = []; BT.me.lunge = BT.foe.lunge = 0; BT.me.sink = BT.foe.sink = 0;
  $('btCard').innerHTML = `<div class="eyebrow">해전 · ${C.dateStr(s.t)}</div><div class="bt-head">${B.e.boss && PORTRAIT.has(B.e.boss) ? `<span class="bseal pt">${PORTRAIT.svg(B.e.boss, { size: 72, frame: 'seal' })}</span>` : `<span class="bseal ${B.e.boss ? 'boss' : ''}">${B.e.ch}</span>`}<div><h2>${B.e.name}</h2><small>${B.e.boss ? '현상 수배 두목 · ' : ''}${B.e.line || '평범한 해적'}</small></div></div>
    <canvas id="btCv" aria-hidden="true"></canvas><div class="bt-bars"><div class="hb me"><span>내 배</span><s><i class="ghost" id="btMeG"></i><i id="btMe"></i></s><b id="btMeN"></b></div><div class="hb foe"><span>${B.e.name}</span><s><i class="ghost" id="btFoeG"></i><i id="btFoe"></i></s><b id="btFoeN"></b></div></div>
    <div class="bt-intent" id="btIntent" aria-live="polite"></div><div class="bt-log" id="btLog">${B.e.taunt || (B.e.boss ? '두목의 배가 앞을 막아선다. 도망칠 생각은 없어 보인다.' : '적이 다가온다. 저쪽의 다음 수를 읽고 맞받아라.')}</div>
    <div class="bt-acts" id="btActs"></div><div class="bt-foot"><span class="stam">기력 <s><i id="btSt"></i></s></span><button class="btn danger" id="btGive">${s.slots.length ? `상자 하나 내주고 빠진다 <small>(${s.slots.length}상자 중 하나)</small>` : `통행료 ${won(Math.min(s.gold, 1200 + 400 * s.tier))} 내고 빠진다`}</button></div>`;
  $('mBattle').hidden = false; BT.open = true; requestAnimationFrame(() => { btLayout(); paintBattle(); });
  $('btGive').onclick = () => { if (!confirmTap($('btGive'), s.slots.length ? '정말 내준다' : '정말 낸다')) return; battleDo('surrender'); }; }
function paintBattle() { const s = S(), B = s.battle; if (!B) return; const pct = (v, m) => Math.max(0, Math.min(100, v / m * 100)) + '%';
  for (const [id, v] of [['btMe', pct(s.hull, s.hullMax)], ['btFoe', pct(B.e.hp, B.e.max)]]) { $(id).style.width = v; $(id + 'G').style.width = v; }
  $('btMeN').textContent = `${Math.max(0, Math.round(s.hull))}/${s.hullMax}`; $('btFoeN').textContent = `${B.e.hp}/${B.e.max}`; $('btSt').style.width = pct(s.stamina, 100);
  if (B.over) return;
  const I = B.intent, danger = I.dmg >= B.e.atk * 1.4, warn = I.k === 'aim'; $('btIntent').className = 'bt-intent' + (danger ? ' danger' : warn ? ' warn' : I.dmg ? '' : ' calm');
  const big = ['volley', 'board', 'ram'].includes(I.k), pun = big && C.dif().punish > 1 ? `<small class="pun"> · 받아내지 못하면 ×${C.dif().punish}</small>` : '';
  const cs = counters(B), csIds = big || C.dif().hints ? cs.map(c => c[0]) : [], opts = C.battleOpts(); // 바람: 받아내는 수를 늘 짚어 준다
  const cnt = cs.length ? `<div class="cnt">받아내는 수 ${cs.map(([id, txt]) => { const o = opts.find(x => x.id === id); return o ? `<span><i>${o.ch}</i>${txt}</span>` : ''; }).join('')}</div>` : '';
  $('btIntent').innerHTML = `<span class="ico"><svg viewBox="0 0 32 32" aria-hidden="true">${INT_ICON[I.k] || INT_ICON.shoot}</svg></span><span class="lbl">적의 다음 수</span>${I.dmg ? `<em>${I.dmg}<small>예상 피해</small></em>` : '<span></span>'}<b>${I.text}${pun}</b>${cnt}`;
  $('btActs').innerHTML = opts.map((o, i) => `<button class="bact ${csIds.includes(o.id) && o.ok ? 'counter' : ''}" data-a="${o.id}" ${o.ok ? '' : 'disabled'}><span class="bch">${o.ch}</span><b>${o.label}</b><small>${o.sub}</small><kbd>${i + 1}</kbd></button>`).join('');
  $('btActs').querySelectorAll('[data-a]').forEach(b => b.onclick = () => battleDo(b.dataset.a)); }
function battleDo(a) { const s = S(), B = s.battle; if (!B || B.over) return; AU.init(); const I = B.intent, hull0 = s.hull, hp0 = B.e.hp; const r = C.battleAct(a); if (!r) return;
  const dealt = hp0 - B.e.hp, took = Math.round(hull0 - s.hull), cv = () => { const c = $('btCv'); return c ? c.getBoundingClientRect() : null; };
  if (a === 'shoot') { btVolley('me', 'foe', 6); AU.noise(.25, { freq: 2400, q: 1, gain: .12, type: 'highpass' }); }
  if (a === 'board') { BT.me.lunge = BT.w * .1; AU.drum(); const ml = C.mateLine('board'); if (ml) r.log.push(`<i>${ml.line}</i>`); }
  if (a === 'shoot') { const ml = C.mateLine('shoot'); if (ml && Math.random() < .4) r.log.push(`<i>${ml.line}</i>`); }
  if (a === 'guard') AU.tok();
  if (a === 'move' || a === 'flee') AU.noise(.4, { freq: 500, q: 2, gain: .2 });
  setTimeout(() => { if (dealt > 0) { btHit('foe', a === 'board'); const r0 = cv(); if (r0) pop(`-${dealt}`, r0.left + BT.foe.x, r0.top + BT.h * .32, 'hit' + (dealt >= 25 ? ' crit' : '')); AU.coin(1); } }, a === 'shoot' ? 460 : 180);
  if (!r.over || r.over === 'lose') setTimeout(() => { const ek = I.k;
    if ((ek === 'shoot' || ek === 'volley') && took > 0) btVolley('foe', 'me', ek === 'volley' ? 12 : 4, B.e.g === 'fire' ? COL.ju : null);
    if ((ek === 'ram' || ek === 'board') && took > 0) BT.foe.lunge = BT.w * .1;
    setTimeout(() => { if (took > 0) { btHit('me', took >= 15); AU.bad(); const r0 = cv(); if (r0) pop(`-${took}`, r0.left + BT.me.x, r0.top + BT.h * .32, 'hit me' + (took >= 20 ? ' crit' : ''));
      if (took >= 15 && !RM) { const cd = $('btCard'); cd.classList.remove('shake'); void cd.offsetWidth; cd.classList.add('shake'); } } }, ek === 'shoot' || ek === 'volley' ? 460 : 160); }, 560);
  $('btLog').innerHTML = r.log.map(l => `<span>${l}</span>`).join(''); paintBattle(); paintHud();
  if (r.over) { $('btActs').innerHTML = ''; $('btGive').hidden = true; $('btIntent').hidden = true; setTimeout(() => battleEnd(), 900); } }
function battleEnd() { const s = S(), B = s.battle, R = B.result || {}; const T = { win: ['격파!', 'good'], lose: ['배가 부서졌다', 'bad'], fled: ['빠져나왔다', ''], surrender: ['내주고 빠졌다', ''] }[B.over];
  if (B.over === 'win') { AU.good(); banner('勝', `${B.e.name}${JO(B.e.name, '을', '를')} 꺾었다`); } else if (B.over === 'lose') AU.bad();
  const lines = [R.gold ? `전리품 <b class="num">${fmt(R.gold - (R.bounty || 0))}냥</b>` : '', R.bounty ? `<b style="color:var(--rok)">현상금 ${fmt(R.bounty)}냥</b>` : '', R.fame ? `명성 +${R.fame}` : '', R.map ? `<b style="color:var(--hwang)">寶</b> 적의 선실에서 해도를 찾았다 — <b>${R.map.name}</b>` : '', ...(R.notes || []), R.wreck ? `상자 ${R.wreck.lost}개를 잃고 ${C.PORTS[R.wreck.port].name}으로 실려 왔다.` : ''].filter(Boolean);
  $('btLog').insertAdjacentHTML('afterend', `<div class="result ${T[1]}" id="btRes"><b style="font-size:22px">${T[0]}</b>${lines.length ? '<br>' + lines.join('<br>') : ''}</div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn main" id="btOk">계속</button></div>`);
  $('btOk').focus({ preventScroll: true }); $('btOk').onclick = () => { const res = C.battleClose(); $('mBattle').hidden = true; BT.open = false; paintHud();
    if (res && res.map) { mapAppear[res.map.id] = performance.now(); }
    if (res && res.wreck) { hideSailbar(); trail = []; openPanel(); lookAt(S().x, S().y); saveGame(); }
    if (S().mode === 'port') after(); setTimeout(runStories, 200); }; }

/* ═══════════ 잠수 화면 — 빛살 드는 물기둥, 바닥의 난파선, 줄에 매달린 잠수부 ═══════════ */
const DV = { open: false, y: 0, bubbles: [], motes: [], flash: 0, flashCol: '' };
function openDive() { const s = S(), D = s.dive; if (!D) return; hideDest(); AU.chime(); { const ml = C.mateLine('dive'); if (ml) setTimeout(() => toast(ml.line, '', true), 400); }
  const stars = '★'.repeat(D.site.lv) + '☆'.repeat(3 - D.site.lv);
  $('dvCard').innerHTML = `<div class="eyebrow">잠수 · ${C.dateStr(s.t)}</div><h2>${D.site.name} <span class="stars">${stars}</span></h2><p class="sub" style="margin:0 0 10px">${D.site.pearl ? '해녀들이 앞서 내려간다. 얕지만 진주가 많다.' : D.site.lv >= 3 ? `두목이 숨긴 보물. <b>맨 밑(${D.max}길)</b>에는 반드시 유물이 있다. 3길 아래부터 유물이 나올 수 있다.` : D.site.lv === 2 ? '깊이 갈수록 값진 것이 있다. 4길 아래에서는 유물이 나올 수 있다(길마다 약 1할).' : '깊이 갈수록 값진 것이 있다. 4길 아래에서 드물게 유물이 나온다.'}${D.site.pearl ? '' : ' 3길 아래에서는 썩은 갑판이 무너져 방금 건진 것을 놓칠 수 있다.'} 숨이 끊기면 이번에 건진 것을 <b>모두</b> 놓치고 며칠을 앓는다.</p>
    <div class="dv"><div class="dv-col" id="dvCol"><canvas id="dvCv" aria-label="물속 깊이"></canvas></div>
      <div class="dv-side"><div class="breath"><span>숨</span><s><i id="dvBr"></i></s><b id="dvBrN"></b></div><div class="dv-find" id="dvFind"><span class="fch">水</span><span>뱃전에서 숨을 크게 들이쉰다.</span></div><div class="haul" id="dvHaul"></div></div></div>
    <div class="dv-row" id="dvRow"></div>`;
  $('mDive').hidden = false; DV.open = true; DV.y = 0; DV.bubbles = []; DV.flash = 0; DV.motes = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), s: .3 + Math.random() * 1.2, v: .004 + Math.random() * .01 })); paintDive(); }
function drawDive(now) { const c = $('dvCv'), s = S(), D = s && s.dive; if (!c || !D) return; const w = c.clientWidth, h = c.clientHeight; if (!w) return;
  if (c.width !== Math.round(w * DPR)) { c.width = Math.round(w * DPR); c.height = Math.round(h * DPR); } const g = c.getContext('2d'), t = RM ? 0 : clock; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const surf = 18, deep = h - 26, depthY = d => surf + (deep - surf) * d / D.max;
  const wg = g.createLinearGradient(0, 0, 0, h); wg.addColorStop(0, '#a8cdc2'); wg.addColorStop(.3, '#5c9496'); wg.addColorStop(.7, '#24555f'); wg.addColorStop(1, '#0c2229'); g.fillStyle = wg; g.fillRect(0, 0, w, h);
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const x0 = w * (.1 + i * .22) + Math.sin(t * .4 + i) * 10, a = .05 + .03 * Math.sin(t * .7 + i * 2); const lg = g.createLinearGradient(0, 0, 0, h * .8); lg.addColorStop(0, `rgba(230,240,220,${a})`); lg.addColorStop(1, 'rgba(230,240,220,0)'); g.fillStyle = lg; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + 14, 0); g.lineTo(x0 + 40, h * .8); g.lineTo(x0 + 10, h * .8); g.fill(); } g.restore();
  g.fillStyle = 'rgba(232,240,228,.6)'; g.beginPath(); g.moveTo(0, surf); for (let x = 0; x <= w; x += 4) g.lineTo(x, surf + Math.sin(x / 9 + t * 2) * 1.6); g.lineTo(w, 0); g.lineTo(0, 0); g.fill();
  g.fillStyle = '#2a1e14'; g.beginPath(); g.moveTo(w * .08, surf - 1); g.quadraticCurveTo(w * .1, surf + 8, w * .3, surf + 9); g.lineTo(w * .62, surf + 9); g.quadraticCurveTo(w * .78, surf + 6, w * .82, surf - 4); g.closePath(); g.fill();
  for (let i = 1; i <= D.max; i++) { const y = depthY(i); g.strokeStyle = 'rgba(239,235,223,.22)'; g.setLineDash([3, 4]); g.lineWidth = 1; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); g.setLineDash([]); g.fillStyle = 'rgba(239,235,223,.8)'; g.font = `11px ${css('--ui')}`; g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText(`${i}길`, 4, y - 2); }
  g.fillStyle = '#081a1f'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, deep + 8 + Math.sin(x * .13) * 4 + Math.sin(x * .41) * 2); g.lineTo(w, h); g.fill();
  if (D.site.lv >= 2) { g.save(); g.translate(w * .62, deep + 6); g.rotate(-.18); g.fillStyle = 'rgba(8,24,30,.95)'; g.beginPath(); g.moveTo(-34, 0); g.quadraticCurveTo(-30, -14, -10, -14); g.lineTo(24, -12); g.lineTo(30, 0); g.fill(); g.strokeStyle = 'rgba(8,24,30,.95)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -14); g.lineTo(6, -46); g.stroke(); g.restore(); }
  g.strokeStyle = 'rgba(30,80,60,.85)'; g.lineWidth = 2; for (let i = 0; i < 7; i++) { const x = (i * 37 % w) + 6, L = 22 + (i * 13 % 30); g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + Math.sin(t * 1.2 + i) * 6, h - L * .6, x + Math.sin(t * 1.2 + i + 1) * 8, h - L); g.stroke(); }
  g.fillStyle = 'rgba(230,240,230,.5)'; for (const m of DV.motes) { m.y -= m.v * (RM ? 0 : .3); m.x += Math.sin(t + m.y * 9) * .0006; if (m.y < 0) { m.y = 1; m.x = Math.random(); } g.fillRect(m.x * w, m.y * h, m.s, m.s); }
  const ty = D.depth ? depthY(D.depth) - 6 : surf + 10; DV.y += (ty - DV.y) * (RM ? 1 : .08); const dx = w * .45, dy = DV.y + Math.sin(t * 2) * 1.5;
  g.strokeStyle = 'rgba(239,235,223,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(w * .45, surf + 8); g.quadraticCurveTo(w * .45 + Math.sin(t) * 4, (surf + dy) / 2, dx, dy - 8); g.stroke();
  g.save(); g.translate(dx, dy); g.rotate(Math.sin(t * 1.5) * .08); g.fillStyle = '#10161a'; g.strokeStyle = '#10161a'; g.lineCap = 'round';
  g.beginPath(); g.arc(0, -9, 4.2, 0, 7); g.fill(); g.fillStyle = '#e8efe6'; g.fillRect(-3, -10.5, 6, 2.4); g.fillStyle = '#10161a';
  g.lineWidth = 5; g.beginPath(); g.moveTo(0, -5); g.lineTo(0, 8); g.stroke(); g.lineWidth = 2.2; const k = Math.sin(t * 6) * 3;
  g.beginPath(); g.moveTo(0, 7); g.lineTo(-3 + k * .4, 17); g.moveTo(0, 7); g.lineTo(3 - k * .4, 17); g.moveTo(0, -3); g.lineTo(-7, 3 + k * .5); g.moveTo(0, -3); g.lineTo(7, 3 - k * .5); g.stroke(); g.restore();
  if (!RM && Math.random() < .08) DV.bubbles.push({ x: dx + 3, y: dy - 12, r: 1 + Math.random() * 2 });
  g.strokeStyle = 'rgba(239,245,240,.75)'; g.lineWidth = .8; for (const b of DV.bubbles) { b.y -= .6 + b.r * .2; b.x += Math.sin(b.y * .2) * .3; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.stroke(); } DV.bubbles = DV.bubbles.filter(b => b.y > surf);
  const pct = D.breath / D.full; if (pct < .3) { const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .2, w / 2, h / 2, Math.max(w, h) * .7); v.addColorStop(0, 'rgba(120,10,0,0)'); v.addColorStop(1, `rgba(120,10,0,${.35 + (RM ? 0 : Math.sin(t * 6) * .12)})`); g.fillStyle = v; g.fillRect(0, 0, w, h); }
  if (DV.flash > 0) { g.fillStyle = DV.flashCol; g.globalAlpha = DV.flash; g.fillRect(0, 0, w, h); g.globalAlpha = 1; DV.flash = Math.max(0, DV.flash - .04); } }
function paintDive() { const s = S(), D = s.dive; if (!D) return; const pct = Math.max(0, D.breath / D.full * 100);
  $('dvBr').style.width = pct + '%'; $('dvBr').classList.toggle('low', pct < 30); $('dvBrN').textContent = Math.max(0, Math.round(D.breath));
  $('dvHaul').innerHTML = D.haul.length ? D.haul.map(h => `<span class="hchip ${h.relic ? 'relic' : ''}" title="${h.text}">${h.ch}</span>`).join('') : '<small class="fine">아직 건진 것이 없다</small>';
  if (D.over) return; const cost = C.diveCost(D), deep = D.depth >= D.max, gasp = D.breath - cost - 5 < C.GASP;
  $('dvRow').innerHTML = `<button class="btn" data-d="up">${D.depth ? '올라온다' : '그만둔다'}</button><button class="btn main ${!deep && gasp ? 'risky' : ''}" data-d="down" ${deep ? 'disabled' : ''}>${deep ? '바닥이다' : D.breath < cost ? `숨이 모자라다 — 그래도 간다 (-${cost}~${cost + 5})` : `더 깊이 · 숨 약 -${cost}~${cost + 5}${gasp ? ' · 숨이 가빠 위험' : ''}`}</button>`;
  $('dvRow').querySelectorAll('[data-d]').forEach(b => b.onclick = () => diveDo(b.dataset.d)); }
function diveDo(a) { const D = C.diveAct(a); if (!D) return; AU.init();
  if (a === 'down') { AU.noise(.5, { freq: 300, q: .8, gain: .14, type: 'lowpass' }); const r = D.last; if (r) { const el = $('dvFind'); el.className = 'dv-find ' + (r.relic ? 'relic' : r.good ? 'fgood' : r.bad ? 'fbad' : ''); el.innerHTML = `<span class="fch">${r.ch}</span><span>${D.depth}길 — ${r.text}</span>`; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
      if (!RM && (r.bad || r.relic)) { DV.flash = .5; DV.flashCol = r.bad ? 'rgba(176,58,38,1)' : 'rgba(230,200,120,1)'; }
      setTimeout(() => { if (r.relic) { AU.gong(); } else if (r.good) AU.coin(1.4); else if (r.bad) AU.bad(); }, 250); } }
  paintDive(); if (D.over) diveEnd(); }
function diveEnd() { const D = S().dive, R = D.result || { gold: 0, crates: [], relics: [] };
  const lines = [R.gold ? `<b class="num">+${fmt(R.gold)}냥</b>` : '', R.crates.length ? `상자 ${R.crates.map(id => C.G[id].name).join(', ')}` : '', R.sold ? `선창이 차서 ${R.sold}상자는 반값에 넘겼다` : '', ...R.relics.map(id => { const r = C.RELICS.find(x => x.id === id); return `<b style="color:var(--hwang)">유물 ${r.ch} ${r.name}</b> — ${r.text}`; })].filter(Boolean);
  const head = D.over === 'blackout' ? `<b>숨이 끊겼다</b> — 선원들이 줄을 당겨 끌어올렸다. ${D.lostHaul && D.lostHaul.length ? `건진 것 ${D.lostHaul.length}개를 모두 놓쳤다. ` : ''}잠수부가 ${D.faint}일을 앓아누웠고 선원들은 지쳤다.` : '<b>물 위로 올라왔다.</b>';
  $('dvRow').innerHTML = `<div class="result ${D.over === 'blackout' ? 'bad' : lines.length ? 'good' : ''}" style="flex:1">${head}${lines.length ? '<br>' + lines.join('<br>') : '<br>빈손이다.'}</div><button class="btn main" id="dvOk">계속</button>`;
  if (R.relics.length) setTimeout(() => banner('寶', `유물 — ${C.RELICS.find(x => x.id === R.relics[0]).name}`), 300); else if (D.over !== 'blackout' && R.gold) AU.pay();
  $('dvOk').focus({ preventScroll: true }); $('dvOk').onclick = () => { C.diveClose(); $('mDive').hidden = true; DV.open = false; paintHud(); if (S().mode === 'port') after(); }; }

/* ═══════════ 표적 (현상 수배 · 보물 지도) ═══════════ */
function targetsHtml(k) { const s = S(), o = s.bOffers[k], b = s.bounty; let h = '';
  if (b) h += `<div class="tgt bounty"><span class="tch pt">${PORTRAIT.svg(b.id, { size: 52, frame: 'seal' })}</span><span class="gr"><b>${b.name}</b> 수배 중 · <span class="${b.due - s.t <= 10 ? 'dn' : ''}">${Math.ceil(b.due - s.t)}일 남음</span><br><span class="up">현상금 ${fmt(b.reward)}냥</span></span><button class="btn" data-look="b">해도</button></div>`;
  if (o && !o.none) { const rec = C.bossRec(o.id); h += `<div class="tgt offer"><span class="tch pt">${PORTRAIT.svg(o.id, { size: 52, frame: 'seal', expr: PORTRAIT.exprs(o.id)[1] })}</span><span class="gr"><b>懸 ${o.name}</b> — ${o.line}<br><span class="up">현상금 ${fmt(o.reward)}냥</span> · ${o.days}일 · <small>${C.GIMMICK[o.g] || ''}</small>${rec ? `<br><small class="hint ${s.tier < rec.tier ? 'dn' : ''}">권장: ${rec.ship} 이상 · 내 활 ${rec.arrow}·백병 ${rec.board} vs 체력 ${rec.hp}</small>` : ''}</span><button class="btn blue" data-act="bounty" ${b ? 'disabled' : ''}>${b ? '한 건씩' : '맡는다'}</button></div>`; }
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
function openBook(tab) { if (tab) bookTab = tab; AU.init(); paintBook(); $('mBook').hidden = false; tabsFade($('bkTabs')); }
/* 탭 줄이 넘치면 가장자리를 흐리고(data-fade) 고른 탭이 보이게 밀어 둔다 */
function tabsFade(el) { if (!el) return; const f = () => { const max = el.scrollWidth - el.clientWidth; el.dataset.fade = max <= 2 ? '' : (el.scrollLeft > 2 ? 'l' : '') + (el.scrollLeft < max - 2 ? 'r' : ''); };
  if (!el.dataset.fadeWired) { el.dataset.fadeWired = '1'; el.addEventListener('scroll', f, { passive: true }); }
  const on = el.querySelector('.on'); if (on && on.scrollIntoView && el.scrollWidth > el.clientWidth + 2) on.scrollIntoView({ block: 'nearest', inline: 'nearest' }); f(); }
function paintBook() { const s = S(); if (!s) return;
  const tabs = [['market', '시세'], ['quest', `이야기${Object.values(s.quests || {}).filter(q => !q.done).length ? ' ·' + Object.values(s.quests).filter(q => !q.done).length : ''}`], ['dex', `도감 ${Object.keys(s.found).length}/${C.FINDS.length}`], ['log', '일지'], ['codex', `사전 ${CODEX.count(CX.st).n}/${CODEX.count(CX.st).m} →`]];
  $('bkTabs').innerHTML = tabs.map(([id, l]) => `<button class="${bookTab === id ? 'on' : ''} ${id === 'codex' ? 'go' : ''}" data-tab="${id}" role="tab" aria-selected="${bookTab === id}">${l}</button>`).join(''); tabsFade($('bkTabs'));
  $('bkBody').innerHTML = bookTab === 'market' ? bookMarket(s) : bookTab === 'quest' ? bookQuest(s) : bookTab === 'log' ? bookLog(s) : bookDex(s);
  $('bkTabs').querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { if (b.dataset.tab === 'codex') { openCodex(); return; } bookTab = b.dataset.tab; paintBook(); });
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
        const sp = C.SPECIALS[k], deal = sp && sp.kind === 'deal' ? `<small class="sp deal">${sp.name} — ${C.G[sp.good].name} ${fmt(C.dealPrice(sp, k))}냥 (${sp.n}상자까지)</small>` : ''; // 특별 거래 값: 어디서 싸게 사는지
        return `<button class="bk-row" data-go="${k}"><span class="seal">${P.ch}</span><span class="nm">${P.name}${s.at === k && s.mode === 'port' ? ' <small>여기</small>' : ''}${C.isClosed(k) ? ' <small class="dn">閉</small>' : ''}${L ? `<small>${C.ago(L.day)} 들름</small>` : '<small>안 가 봄</small>'}${deal || (sp ? `<small class="sp">${sp.name}</small>` : '')}</span><span class="gs">${sells}</span><span class="gs">${wants}</span></button>`; }).join(''); }).join(''); }
  const g = C.G[bookGood]; const rows = known.map(k => { const inf = C.infoFor(k, bookGood), L = s.ledger[k], prod = C.PORTS[k].prod.includes(bookGood), want = C.PORTS[k].want.includes(bookGood); return { k, inf, buy: L && L.b && L.b[bookGood], prod, want }; })
    .filter(r => r.inf || r.prod || r.want).sort((a, b) => (b.inf ? b.inf.price : b.want ? 1 : 0) - (a.inf ? a.inf.price : a.want ? 1 : 0));
  return chips + `<p class="fine bk-note">${gl(g)} <b>${g.name}</b> — 어디서 싸게 사서 어디에 팔까. 값은 내가 아는 마지막 소식이다.</p>` + (rows.length ? rows.map((r, i) => { const P = C.PORTS[r.k];
    const sp = C.SPECIALS[r.k], deal = sp && sp.kind === 'deal' && sp.good === bookGood ? `<span class="bk-g sell">특별 거래 <b>${fmt(C.dealPrice(sp, r.k))}</b></span>` : '';
    return `<button class="bk-row one ${i === 0 && r.inf ? 'best' : ''}" data-go="${r.k}"><span class="seal">${P.ch}</span><span class="nm">${P.name}<small>${P.nation}</small></span><span class="gs">${r.prod ? `<span class="bk-g sell">● 여기서 난다${r.buy ? ` · 사는 값 <b>${fmt(r.buy * C.LOT)}</b>` : ''}</span>` : ''}${deal}${r.want ? '<span class="bk-g want">▲ 비싸게 산다</span>' : ''}</span><span class="pr">${r.inf ? `<b class="${ageCls(r.inf.day)}">${fmt(r.inf.price * C.LOT)}</b><small>${r.inf.src} · ${C.ago(r.inf.day)}</small>` : '<small>값 모름</small>'}</span></button>`; }).join('') : '<p class="fine">아는 항구가 없다.</p>'); }
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
  if (n.main) { openStory({ who: 'main', act: n.ch, eyebrow: `본 이야기 · 第${n.ch}幕`, title: n.fin ? `${n.name} — 막이 내린다` : n.name, text: n.text, sub: n.got.join(' · '), opts: [{ label: '계속', apply: () => null }] }); return; }
  openStory({ who: 'quest', qch: n.ch, eyebrow: n.name, title: `${n.name} — ${n.fin ? '끝' : `${n.n}/${n.of}`}`, text: n.text, sub: `${n.got.join(' · ')}${n.next ? `<br>다음 → ${n.next}` : ''}`, opts: [{ label: n.fin ? '이야기를 닫는다' : '다음으로', apply: () => null }] }); }


/* ═══════════ v6: 항구 탭 · 본 이야기 · 선술집 · 일지 ═══════════ */
let panelTab = 'market';
function bestElsewhere(id) { const s = S(); let best = null; for (const k of C.PORT_IDS) { if (!s.known[k] || k === s.at) continue; const inf = C.infoFor(k, id); if (inf && (!best || inf.price > best.price)) best = { k, price: inf.price, day: inf.day }; } return best; }
function mainBox(k) { const s = S(), A = C.curAct(), arc = C.arcOf(); if (!A) return '';
  const n = C.NUM[s.main.act]; if (!s.main.started) return `<div class="mainbox wait"><span class="mch">${n}<small>幕</small></span><div class="gr"><b>第${n}幕 ${A.title}</b><small>${arc.name} — 다음 소식이 오면 막이 열린다. 그때까지 바다를 다닌다</small></div></div>`;
  const gs = C.mainGoals(); const pay = gs.find(g => g.pay && !g.done && g.pay.k === k);
  return `<div class="mainbox"><span class="mch">${n}<small>幕</small></span><div class="gr"><b>第${n}幕 ${A.title}</b><small>${arc.name}</small><ul>${gs.map(g => `<li class="${g.done ? 'done' : ''}">${g.done ? '✓' : '○'} ${g.text}${g.prog && !g.done && g.prog() ? ` <em>${g.prog()}</em>` : ''}</li>`).join('')}</ul>${A.final && gs.every(g => g.done) ? '<p class="fine" style="text-align:left;margin:4px 0 0">마지막 선택이 기다린다.</p>' : ''}${pay ? `<button class="btn main" data-act="mainpay" ${s.gold < pay.pay.n ? 'disabled' : ''}>${fmt(pay.pay.n)}냥을 낸다</button>` : ''}</div></div>`; }
function tavernHtml(k) { const s = S(), t = C.tavern(k), cap = C.mateCap();
  const offer = t.offer.length ? t.offer.map(id => { const m = C.MBY[id], mv = C.mateValue(id), locked = s.fame < (m.fame || 0); return `<div class="mate-card"><span class="mc pt">${PORTRAIT.svg(id, { size: 56 })}</span><div class="gr"><b>${m.name}</b> <small>${m.role} · ${m.from}</small><br>${m.text}<br><small>영입 ${fmt(m.hire)}냥 · 계절마다 급료 ${fmt(m.wage)}냥${mv != null ? ` · <b class="${mv >= m.wage ? 'up' : ''}">지난 계절 기준 +${fmt(mv)}냥</b>` : ''}${m.fame ? ` · 명성 ${m.fame} 필요` : ''}</small></div><button class="btn blue" data-hire="${id}" ${s.gold < m.hire || s.mates.length >= cap || locked ? 'disabled' : ''}>${s.mates.length >= cap ? '자리 없음' : locked ? '명성 모자람' : '데려간다'}</button></div>`; }).join('') : '<p class="fine" style="text-align:left;margin:0">오늘은 일거리를 찾는 뱃사람이 없다.</p>';
  const reroll = `<button class="btn reroll" data-act="reroll" ${s.gold < C.REROLL_COST ? 'disabled' : ''}>다른 사람 알아본다 · ${fmt(C.REROLL_COST)}냥</button>`;
  const mine = s.mates.length ? s.mates.map(id => { const m = C.MBY[id]; return `<div class="mate-card mine"><span class="mc pt">${PORTRAIT.svg(id, { size: 56, expr: PORTRAIT.exprs(id)[1] })}</span><div class="gr"><b>${m.name}</b> <small>${m.role}</small><br><small>${m.text} · 급료 ${fmt(m.wage)}</small></div><button class="btn" data-fire="${id}">내린다</button></div>`; }).join('') : '';
  const dl = 3 - t.dice;
  return `<div class="sec"><h3>소문<span>오늘 ${C.rumorsLeft()}번 남음</span></h3><div class="acts"><button class="act" data-act="rumor" ${s.gold < C.rumorCost() || !C.rumorsLeft() ? 'disabled' : ''}><b>소문 듣기</b><small>${C.rumorsLeft() ? `${fmt(C.rumorCost())}냥 · 다른 항구 값${s.boons.clerk || C.hasMate('seer') || s.cap === 'ara' ? ' · 정확' : ''}` : '오늘은 들을 만큼 들었다'}</small></button></div>${lastQuote ? `<div class="quote">${lastQuote}</div>` : ''}</div>
    <div class="sec"><h3>뱃사람 구함<span>내 선원 ${s.mates.length}/${cap}</span></h3><div class="hold">${offer}</div><div style="margin-top:6px">${reroll}</div>${mine ? `<div class="hold" style="margin-top:8px">${mine}</div>` : ''}</div>
    <div class="sec"><h3>홀짝<span>오늘 ${dl}판 남음</span></h3><div class="dice" id="dice"><div class="dcup" id="dcup">${die(1)}${die(1)}</div><div class="dbtns">${[500, 2000].map(b => `<div class="drow"><small>${fmt(b)}냥</small><button class="btn" data-dice="${b}:odd" ${dl <= 0 || s.gold < b ? 'disabled' : ''}>홀</button><button class="btn" data-dice="${b}:even" ${dl <= 0 || s.gold < b ? 'disabled' : ''}>짝</button></div>`).join('')}</div><p class="fine dres" id="dres">두 주사위의 합이 홀일까 짝일까. 맞히면 건 돈의 0.9배를 번다.</p></div></div>`; }
function journal(text, kind, ext) { const s = S(); if (!s || !s.log || s.ended) return; const t = String(text).replace(/<br\s*\/?>/g, ' — ').replace(/<[^>]+>/g, ''); const e = Object.assign({ t: Math.floor(s.t), x: t, k: kind || '' }, ext || {}); if (!ext) e.h = String(text).replace(/<br\s*\/?>/g, ' — '); const pv = s.log[s.log.length - 1]; if (pv && pv.x === e.x && pv.t === e.t) return; s.log.push(e); if (s.log.length > 200) s.log.splice(0, s.log.length - 200); if ($('sTitle').hidden) feedAdd(e); }
const feedVisible = () => !FEED.min && !$('feed').hidden && getComputedStyle($('feed')).display !== 'none';
function bookLog(s) { if (!s.log || !s.log.length) return '<p class="fine bk-note">아직 적은 것이 없다.</p>'; let day = null, h = '';
  for (const e of s.log.slice().reverse()) { if (e.t !== day) { day = e.t; h += `<h4 class="bk-nat">${C.dateStr(e.t)}</h4>`; } h += `<div class="logl ${e.k}">${e.x}</div>`; } return h; }
function paintTracker() { const s = S(), el = $('tracker'); if (!el) return; if (!s || s.ended || !$('sTitle').hidden) { el.hidden = true; return; }
  const A = C.curAct(); if (!A) { el.hidden = true; return; } const n = C.NUM[s.main.act];
  const qids = Object.keys(s.quests).filter(id => C.qStep(id));
  const key = s.main.act + ':' + s.main.started + ':' + (s.main.started ? C.mainGoals().map(g => g.done + (g.prog ? g.prog() : '')).join('|') : s.quotaN) + qids.map(id => id + s.quests[id].step + C.questProg(id)).join();
  if (last.trk === key) return; last.trk = key; el.hidden = false;
  const qa = qids.length;
  // 맡은 이야기의 지금 단계도 셋까지 — 본 이야기 밑에 書 표시로
  const ql = qids.slice(0, 3).map(id => { const st = C.qStep(id), p = C.questProg(id); return `<li class="tk-qs">書 ${st.text}${p ? ` <em>${p}</em>` : ''}</li>`; }).join('');
  el.innerHTML = `<div class="tk-h"><span class="mch">${n}<small>幕</small></span><b>${A.title}</b>${qa ? `<span class="tk-q">書 ${qa}</span>` : ''}</div>` + (s.main.started ? `<ul>${C.mainGoals().map(g => `<li class="${g.done ? 'done' : ''}">${g.done ? '✓' : '○'} ${g.text}${g.prog && !g.done && g.prog() ? ` <em>${g.prog()}</em>` : ''}</li>`).join('')}${ql}</ul>` : `<ul><li>○ ${A.at() ? '항구에 닿으면 막이 열린다' : '다음 소식이 오면 막이 열린다'}</li>${ql}</ul>`); }


/* ═══════════ 소식창: 대화창처럼 흘러가는 시세·사건 ═══════════ */
const FEED = { filter: 'all', min: META.feedMin != null ? !!META.feedMin : NARROW(), unread: 0, max: 60 };
const mdy = t => { const d = (90 + t) % 360; return `${Math.floor(d / 30) + 1}/${d % 30 + 1}`; };
const feedOk = e => FEED.filter === 'all' || (FEED.filter === 'mkt' ? (e.c === 'mkt' || e.c === 'news') : (e.c !== 'mkt'));
function feedHtml(e, fresh) { const s = S();
  if (e.c === 'mkt') { const P = C.PORTS[e.p], g = C.G[e.g], up = e.dir === 'up';
    return `<button class="fe mkt ${e.dir} ${e.mine ? 'mine' : ''} ${fresh ? 'new' : ''}" data-port="${e.p}"><span class="fd num">${mdy(e.t)}</span><span class="fseal">${P.ch}</span>${gl(g)}<span class="fx"><b>${P.name} ${g.name}</b> <em class="${up ? 'up' : 'dn'}">${up ? '▲' : '▼'}${e.pct != null ? ` ${e.pct > 0 ? '+' : ''}${e.pct}%` : ''}</em><span class="fw">${e.x2 || ''}</span>${e.mine ? '<span class="ftag">실은 짐</span>' : ''}<small class="fsrc">${e.src ? ' · ' + e.src : ''}</small></span></button>`; }
  const ico = e.c === 'news' ? '報' : e.k === 'good' ? '○' : e.k === 'bad' ? '!' : '·';
  return `<div class="fe ${e.c || 'ev'} ${e.k || ''} ${fresh ? 'new' : ''}"><span class="fd num">${mdy(e.t)}</span><span class="fic">${ico}</span><span class="fx">${e.h || e.x}</span></div>`; }
function feedRender() { const s = S(), el = $('feedList'); if (!el || !s || !s.log) return; const list = s.log.filter(feedOk).slice(-FEED.max);
  el.innerHTML = list.length ? list.map(e => feedHtml(e)).join('') : '<p class="fempty">아직 들어온 소식이 없다. 바다에 나가면 지나는 배들이 값 소식을 물어 온다.</p>';
  el.scrollTop = el.scrollHeight; paintFeedHead(); }
function paintFeedHead() { $('feed').classList.toggle('min', FEED.min); $('feedUnread').textContent = FEED.unread ? FEED.unread : ''; $('feedUnread').hidden = !FEED.unread; $('feedToggle').setAttribute('aria-expanded', FEED.min ? 'false' : 'true'); placeToasts();
  $('feedTabs').querySelectorAll('[data-ff]').forEach(b => b.classList.toggle('on', b.dataset.ff === FEED.filter));
  const s = S(), lastE = s && s.log && s.log.length ? s.log[s.log.length - 1] : null; $('feedPeek').innerHTML = lastE ? feedHtml(lastE) : ''; }
function feedAdd(e) { const el = $('feedList'); if (!el || !feedOk(e)) return; const near = el.scrollHeight - el.scrollTop - el.clientHeight < 40; const emp = el.querySelector('.fempty'); if (emp) emp.remove();
  el.insertAdjacentHTML('beforeend', feedHtml(e, !RM)); while (el.children.length > FEED.max) el.firstElementChild.remove(); if (near || e.c === 'mkt') el.scrollTop = el.scrollHeight;
  if (FEED.min) FEED.unread++; paintFeedHead(); const lv = $('feedLive'); if (lv && !RM) { lv.classList.remove('ping'); void lv.offsetWidth; lv.classList.add('ping'); } const pk = $('feedPeek').firstElementChild; if (pk && !RM) { pk.classList.add('new'); } }
function feedWire(w) { const P = C.PORTS[w.k], g = C.G[w.id]; const up = w.kind === 'up';
  const x2 = w.end ? (up ? '— 남아돌던 값이 돌아왔다' : '— 바람이 잦아들었다') : up ? `— 바람이 분다 · 약 ${fmt(w.price)}냥` : `— 남아돈다 · 약 ${fmt(w.price)}냥`;
  const e = { c: 'mkt', p: w.k, g: w.id, dir: w.kind, pct: w.end ? null : w.pct, x2, src: `${w.src} · 소문`, mine: w.hold || w.dest };
  journal(`${up ? '▲' : '▼'} ${P.name} ${g.name} ${x2.replace('— ', '')} (${w.src})`, up ? 'good' : 'bad', e); rumorPulse[w.k] = performance.now();
  if (e.mine && (FEED.min || NARROW())) toast(`${up ? '▲' : '▼'} <b>${P.name} ${g.name}</b> ${x2} <small>(${w.src})</small>`, up ? 'good' : 'bad', true); }
function feedMarket(k, id, dir, pct, x2, src) { journal(`${dir === 'up' ? '▲' : '▼'} ${C.PORTS[k].name} ${C.G[id].name} ${x2.replace('— ', '')}`, dir === 'up' ? 'good' : 'bad', { c: 'mkt', p: k, g: id, dir, pct, x2, src, mine: S().slots.some(x => x.id === id) }); }
$('feedTabs').addEventListener('click', e => { const b = e.target.closest('[data-ff]'); if (!b) return; e.stopPropagation(); FEED.filter = b.dataset.ff; feedRender(); });
$('feedToggle').onclick = e => { e.stopPropagation(); FEED.min = !FEED.min; META.feedMin = FEED.min; saveMeta(); if (!FEED.min) FEED.unread = 0; feedRender(); };
$('feedPeek').onclick = () => { if (FEED.min) { FEED.min = false; META.feedMin = false; saveMeta(); FEED.unread = 0; feedRender(); } };
$('feedList').addEventListener('click', e => { const b = e.target.closest('[data-port]'); if (!b) return; const s = S(), k = b.dataset.port; AU.init(); if (!s || anyModal()) return;
  if (s.mode === 'sail') { cam.wide = false; lookAt(C.PORTS[k].x, C.PORTS[k].y, Math.max(cam.z, cam.fit * 1.4)); rumorPulse[k] = performance.now(); return; }
  if (s.mode === 'port' && s.at === k) { openPanel(); return; } const p = C.plan(k); if (!p) return; if (p.closedPort) { toast(`${C.PORTS[k].name}은 포구를 닫았다.`, 'bad'); return; } showDest(p); });

/* ─────────── 흐름 ─────────── */
function handle(out) {
  const s = S(); CODEX.feedOut(CX.st, out);
  for (const o of out) {
    if (o.type === 'find') { findAppear[o.find.id] = performance.now(); AU.gong(); toast(`<b>${o.find.name}</b> — ${o.find.text}${o.find.gold ? ` +${fmt(o.find.gold)}냥` : ''}`, 'good'); const [x, y] = toS(o.find.x, o.find.y); pop('발견', x, y - 20, 'big'); }
    if (o.type === 'port') { portAppear[o.port] = performance.now(); AU.gong(); toast(`새 항구 — <b>${C.PORTS[o.port].name}</b>. 해도에 도장을 찍었다. 아무도 이곳 값을 모른다.`, 'good'); }
    if (o.type === 'season') { AU.season(); banner(...SEASON_BANNER[o.season]); setTimeout(cxFact, 3200); }
    if (o.type === 'wire') feedWire(o.w);
    if (o.type === 'rival') { if (o.guarded) { toast(`<b>${o.rival.name}</b>${JO(o.rival.name, '이', '가')} ${C.PORTS[o.k].name}에 늦게 닿았다. 경주에서 이긴 덕에 ${C.G[o.id].name} 값은 그대로다.`, 'good'); } else { rivalMark[o.k] = { t: s.t, ch: o.rival.ch, col: o.rival.col, id: o.id }; feedMarket(o.k, o.id, 'down', null, `— ${o.rival.ch} ${o.rival.name}${JO(o.rival.name, '이', '가')} 풀었다`, '경쟁 상단'); if (s.slots.some(x => x.id === o.id) || s.dest === o.k) toast(`<b>${o.rival.name}</b>${JO(o.rival.name, '이', '가')} ${C.PORTS[o.k].name}에 ${C.G[o.id].name}${JO(C.G[o.id].name,'을','를')} 풀었다. 값이 눌린다.`, 'bad'); } }
    if (o.type === 'orderLost') toast(`의뢰 기한이 지났다 — ${C.PORTS[o.order.to].name}의 ${C.G[o.order.good].name}. 명성 -20`, 'bad');
    if (o.type === 'event') openEvent(o.ev);
    if (o.type === 'arrive') openReveal(o.info);
    if (o.type === 'explored') { showSailbar(); toast('바다 한가운데 닻을 내렸다. 지도를 눌러 다음 행선지를 고르자.'); saveGame(); }
    if (o.type === 'quota') openQuota(o.res);
    if (o.type === 'news') { const n = o.news; AU.chime(); banner('報', n.title); journal(n.title + ' — ' + n.text, n.closed || n.zone || n.storm || n.tax ? 'bad' : 'good', { c: 'news', h: `<b>${n.title}</b> — ${n.text}` }); if (FEED.min || NARROW()) toast(`<b>${n.title}</b><br>${n.text}`, n.closed || n.zone || n.storm || n.tax ? 'bad' : 'good', true); if (n.k) rumorPulse[n.k] = performance.now(); if (n.closed) rumorPulse[n.closed] = performance.now(); if (s.mode === 'port') paintPanel(); }
    if (o.type === 'region') { AU.pay(); banner('圖', `${o.region}를 다 그렸다`); toast(`<b>${o.region}</b>의 발견을 모두 찾았다 — +${fmt(o.gold)}냥 · 명성 +100${o.map ? ` · 寶 ${o.map.name}` : ''}`, 'good'); if (o.map) mapAppear[o.map.id] = performance.now(); }
    if (o.type === 'battle') openBattle();
    if (o.type === 'dive') openDive();
    if (o.type === 'map') { mapAppear[o.map.id] = performance.now(); toast(`<b>${o.from}</b>에서 낡은 해도를 주웠다 — 寶 <b>${o.map.name}</b>`, 'good'); }
    if (o.type === 'bountyLost') toast(`현상 수배 기한이 지났다 — ${o.bounty.name}. 명성 -10`, 'bad');
    if (o.type === 'chase') { AU.drum(); toast('<b>흑기 해적선</b>이 쫓아온다! 노를 저어 따돌려라 <small>(Space)</small>', 'bad'); }
    if (o.type === 'escaped') { AU.good(); toast('흑기를 따돌렸다. 명성 +10', 'good'); }
    if (o.type === 'tired') { const ml = C.mateLine('tired'); toast(ml ? ml.line : '선원들이 지쳤다. 노를 거둔다.'); }
    if (o.type === 'bounced') { AU.bad(); toast(`<b>${C.PORTS[o.k].name}</b> 포구가 닫혀 있다${o.news ? ` — ${o.news.title}` : ''}. 뱃머리를 돌려야 한다.`, 'bad'); showSailbar(); }
    if (o.type === 'passengerLost') toast(`${o.passenger.who}가 기다리다 지쳐 다른 배로 옮겨 탔다. 명성 -15`, 'bad');
  }
  setTimeout(drainQuests, 60); if (out.length) cxCheck();
  if (s.mode === 'sail' && Math.floor(s.t * 2) !== Math.floor((trail.t || 0) * 2)) { trail.t = s.t; trail.push([s.x, s.y]); if (trail.length > 500) trail.shift(); }
}
function finish(retire) {
  const s = S(); if (!s || !$('sEnd').hidden) return; $('feed').hidden = true; ['mEvent', 'mReveal', 'mStory', 'mQuota', 'mRetire2', 'mBattle', 'mDive', 'mBook', 'mCodex', 'mNew', 'mHelp'].forEach(id => $(id).hidden = true); hideDest(); hideSailbar(); closePanel(); hideMenu(); showCoach(false);
  if (retire && !s.ended) s.ended = 'retire';
  const sc = C.score(), rank = C.rankOf(s.fame), why = s.ended; // 등급은 명성으로
  const wasAra = META.unlocked.ara, wasTomo = META.unlocked.tomo; META.runs++; META.best = Math.max(META.best, sc);
  META.bestBy = META.bestBy || {}; META.bestBy[s.diff] = Math.max(META.bestBy[s.diff] || 0, sc); // 난이도별 기록
  const E = why === 'ending' && C.ENDINGS[s.ending]; if (E) { META.endings = META.endings || {}; META.endings[s.ending] = 1; }
  if (s.quotaN >= 4) META.unlocked.ara = true; if (s.quotaN >= 6 || E) META.unlocked.tomo = true;
  { const rel = Object.keys(s.relics || {}).filter(id => id !== s.legacy); META.legacy = rel.length ? rel[0] : META.legacy || null; } // 유산: 이번 항해의 유물 하나가 다음 항해로 이어진다
  saveMeta(); dropSave();
  const unl = [!wasAra && META.unlocked.ara ? '새 선장 — <b>아라</b> (적산 신라방의 상인)' : '', !wasTomo && META.unlocked.tomo ? '새 선장 — <b>도모</b> (하카타의 밀무역상)' : '', META.legacy && C.RELICS.find(r => r.id === META.legacy) ? `유산 — 다음 항해에 <b>${C.RELICS.find(r => r.id === META.legacy).name}</b>을 가지고 시작한다` : ''].filter(Boolean);
  const cp = C.cap(), fail = E ? null : C.failEpilogue(why);
  const T = E ? [E.title, typeof E.text === 'function' ? E.text() : E.text] : { quota: ['곳간이 비었다', `${C.dateStr(s.t)}, ${cp.quotaTo}에 낼 ${cp.quotaName} ${fmt(C.quotaNow())}냥을 다시 채우지 못했다. 빚이 빚을 불렀다.`], assassin: ['칼이 온 밤', '너무 잘 나갔다. 어느 밤, 숙소 문이 소리 없이 열렸다.'], retire: ['돛을 내리다', `${C.dateStr(s.t)}, 스스로 항해를 접었다.`] }[why] || ['항해의 끝', ''];
  const epi = E ? (s.epilogue || C.endingEpilogue(s.ending)) : (fail && fail.line ? [fail.line] : []);
  const endTag = E ? `<div class="endtag ${E.kind}"><span>${E.ch}</span>${C.END_KIND[E.kind] || '결말'} · 모은 결말 ${Object.keys(META.endings || {}).length}/${Object.keys(C.ENDINGS).length}</div>` : '';
  const tree = C.endingTree(META.endings || {}).map(c => `<div class="etree ${c.cap === s.cap || (c.cap === 'any' && s.ending === 'three_years') ? 'mine' : ''}"><b>${c.name} — ${c.arc}</b>${c.endings.map(e => `<span class="${e.seen ? 'seen' : ''} ${e.id === s.ending ? 'now' : ''}"><i>${e.ch}</i><em>${e.seen ? e.title : '?'}</em><small>${e.how}</small></span>`).join('')}</div>`).join('');
  const hit = s.stats.hits + s.stats.misses ? Math.round(s.stats.hits / (s.stats.hits + s.stats.misses) * 100) : 0;
  const arc = C.arcOf(), storyDone = E && s.ending !== 'three_years', actLine = storyDone ? `${arc.name} — 끝까지` : `${arc.name} — ${(fail || C.failEpilogue(why)).upTo}`; // 세 해의 장부는 이야기를 못 끝낸 결말이라 몇 막까지 왔는지 적는다
  $('endScroll').innerHTML = `<div class="rank">${rank.replace('(大商)', '<br>大商')}</div>
    ${endTag}<h2>${T[0]}</h2><p class="lead">${T[1]}</p>${epi.length ? `<div class="epilogue">${epi.map(t => `<p>${t}</p>`).join('')}</div>` : ''}
    <dl class="ledger">${[['점수', fmt(sc), 'score'], ['이야기', actLine], ['버틴 상납', `${s.quotaN}번 · ${Math.floor(s.quotaN / 4)}년 ${s.quotaN % 4}계절`], [`바친 ${cp.quotaName}`, fmt(s.paid) + '냥'], ['남긴 재산', fmt(C.assets()) + '냥'], ['난이도', `${C.dif().name} (${C.dif().sub})`],
      ['항해', s.stats.voyages + '번'], ['소문 적중', hit + '%'], ['닻 내린 항구', `${Object.keys(s.docked).length} / ${C.PORT_IDS.length}`], ['발견', `${Object.keys(s.found).length} / ${C.FINDS.length}`],
      ['완수한 의뢰', s.stats.orders + '건'], ['해전 승리', `${s.stats.wins || 0}번 · 두목 ${s.stats.bounties || 0}`], ['유물', `${Object.keys(s.relics || {}).length} / ${C.RELICS.length}`], ['끝낸 이야기', `${s.stats.quests || 0} / ${C.QUESTS.length}`], ['가장 큰 거래', s.stats.bestTrade || '없음'], ['명성', `${fmt(s.fame)} (${rank})`], ['최고 기록', `${fmt(META.best)} · ${C.dif().name} ${fmt(META.bestBy[s.diff])}`]]
      .map(([k, v, c]) => `<div class="${c || ''}"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    ${reportHtml(C.seasonReport(s.stats.life), '항해 전체 장부')}
    <ul class="fates">${C.storyFates().map(f => `<li><b>${f.name}</b><span>${f.line}</span></li>`).join('')}</ul>
    ${unl.length ? `<div class="unlock">${unl.join('<br>')}</div>` : ''}
    <div class="etrees"><h3>결말 나무 <small>본 결말만 이름이 보인다</small></h3>${tree}</div>
    <div class="start-row" style="margin-top:20px;justify-content:flex-start"><button class="btn main" id="eAgain">다시 바다로</button><button class="btn" id="eTitle">선장 고르기</button></div>`;
  ART.endArt($('endScroll'), E ? s.ending : why); $('sEnd').hidden = false; AU[why === 'retire' ? 'gong' : 'drum']();
  $('eAgain').onclick = () => { $('sEnd').hidden = true; startGame(s.cap, s.diff); };
  $('eTitle').onclick = () => { $('sEnd').hidden = true; showTitle(); };
}

/* ═══════════ 사전 — 바다의 백과 (항목과 여는 규칙은 src/codex.js) ═══════════ */
/* 열린 항목은 메타(MKEY)에 남아 판이 바뀌어도 그대로다. 저장(KEY)은 건드리지 않는다 */
const CX = { st: CODEX.norm(META.codex), cat: 'all', q: '', id: null, back: [], sheet: false, queue: [], qt: 0, t: 0, re: null, reN: -1 };
META.codex = CX.st;
const cxOpen = () => !$('mCodex').hidden;
const cxEsc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function cxCheck() { const s = S(); if (!s || !$('sTitle').hidden) return;
  for (const c of ['ara', 'tomo']) if (META.unlocked[c]) CODEX.mark(CX.st, 'capopen:' + c);
  const fresh = CODEX.check(CX.st, s); if (!fresh.length) return; saveMeta(); paintCxBadge();
  CX.queue.push(...fresh); clearTimeout(CX.qt); CX.qt = setTimeout(cxToast, Math.max(900, (CX.hold || 0) - performance.now())); if (cxOpen()) paintCodex(true); }
function cxMark(t) { CODEX.mark(CX.st, t); cxCheck(); }
/* 새 항목은 한 번에 묶어 알린다. 누르면 사전이 열린다 */
function cxToast() { const ids = CX.queue.splice(0).filter(id => CODEX.BY[id]); if (!ids.length) return;
  toast(`<span class="cx-tch" aria-hidden="true">典</span><span><b>사전에 새 항목</b> — ${ids.slice(0, 3).map(id => CODEX.BY[id].title).join(' · ')}${ids.length > 3 ? ` 외 ${ids.length - 3}` : ''}</span>`, 'cx', false, { onclick: () => openCodex(ids.length === 1 ? { id: ids[0] } : {}) }); }
function cxFact() { const e = CODEX.fact(CX.st); if (!e) return; toast(`<span class="cx-tch" aria-hidden="true">知</span><span><b>알고 있었나요?</b> ${e.fact}</span>`, 'cx', false, { onclick: () => openCodex({ id: e.id, sheet: true }) }); }
function paintCxBadge() { const n = Object.keys(CX.st.n).length, c = CODEX.count(CX.st); $('bCodex').classList.toggle('new', n > 0); $('bMenu').classList.toggle('cxnew', n > 0);
  $('mDict').textContent = `사전 — 바다의 백과 ${c.n}/${c.m}${n ? ` · 새 ${n}` : ''}`; $('cxTN').textContent = `${c.n}/${c.m}`; }

/* 글 속 낱말을 사전으로 잇는다 — 열린 항목만, 한 글에 한 항목은 처음 한 번, 몇 개까지만 */
const CX_LOW = new Set(['silla', 'tang', 'wa', 'balhae']); // 나라 이름은 자리가 남을 때만 잇는다
function cxRe(T) { return { re: new RegExp(T.map(([t]) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g'), map: Object.fromEntries(T.slice().reverse()) }; }
function cxLink(root, opt = {}) { if (!root) return; const T = CODEX.terms(CX.st); if (!T.length) return;
  if (CX.reN !== T.length) { CX.reN = T.length; const hi = T.filter(([, id]) => !CX_LOW.has(id)), lo = T.filter(([, id]) => CX_LOW.has(id)); CX.res = [hi, lo].filter(x => x.length).map(cxRe); }
  const used = new Set(opt.self ? [opt.self] : []), max = opt.max || 3; let n = 0;
  const text = (tn, R) => { const s = tn.nodeValue; R.re.lastIndex = 0; let m, last = 0, frag = null;
    while (n < max && (m = R.re.exec(s))) { const id = R.map[m[0]]; if (!id || used.has(id)) continue; used.add(id); n++;
      frag = frag || document.createDocumentFragment(); frag.append(s.slice(last, m.index));
      const a = document.createElement('span'); a.className = 'cx-link'; a.dataset.cxl = id; a.tabIndex = 0; a.setAttribute('role', 'button'); a.setAttribute('aria-label', `${m[0]} — 사전 보기`); a.textContent = m[0]; frag.append(a); last = m.index + m[0].length; }
    if (frag) { frag.append(s.slice(last)); tn.replaceWith(frag); } };
  const walk = (el, R) => { for (const ch of [...el.childNodes]) { if (n >= max) return; if (ch.nodeType === 3) text(ch, R); else if (ch.nodeType === 1 && !ch.matches('button,a,input,svg,canvas,h2,h3,h4,.cx-link,.choice,.num')) walk(ch, R); } };
  const els = opt.sel ? [...root.querySelectorAll(opt.sel)] : [root];
  for (const R of CX.res) for (const el of els) { if (n >= max) break; walk(el, R); } }

function openCodex(o = {}) { AU.init(); CX.sheet = !!o.sheet; CX.back = []; CX.q = ''; $('cxQ').value = ''; if (o.cat) CX.cat = o.cat;
  CX.id = o.id && CODEX.isOpen(CX.st, o.id) ? o.id : null; if (CX.id) cxRead(CX.id);
  $('mCodex').classList.toggle('sheet', CX.sheet && !!CX.id); $('cxFull').hidden = !(CX.sheet && CX.id); $('mCodex').hidden = false; paintCodex(); $('cxCard').focus({ preventScroll: true }); }
function closeCodex() { $('mCodex').hidden = true; const s = S(); if (s && s.mode === 'port' && $('sTitle').hidden && !anyModal()) paintPanel(); }
function cxRead(id) { if (CX.st.n[id]) { delete CX.st.n[id]; saveMeta(); paintCxBadge(); } }
function cxGo(id, push) { if (!CODEX.isOpen(CX.st, id)) return; if (push && CX.id && CX.id !== id) CX.back.push(CX.id); CX.id = id; cxRead(id); paintCodex(); $('cxBody').scrollTop = 0; }

const cxGlyph = e => e.art.good ? gi(C.G[e.art.good]) : (e.art.seal || [...(e.hanja || '')].find(c => c.codePointAt(0) >= 0x3400 && c.codePointAt(0) <= 0x9fff) || CODEX.CATS.find(c => c.id === e.cat).ch);
function cxSeal(e, size) { const pt = e.art.pt || (e.art.pts && size < 60 && e.art.pts[0]); if (pt && PORTRAIT.has(pt)) return `<span class="cx-s pt">${PORTRAIT.svg(pt, { size, frame: size > 60 ? 'card' : 'round', expr: e.art.expr })}</span>`;
  return `<span class="cx-s cat-${e.cat}">${cxGlyph(e)}</span>`; }
function cxCard(e) { const st = CX.st;
  if (!st.u[e.id]) return `<div class="cx-card lock"><span class="cx-s" aria-hidden="true">?</span><span class="cx-t"><b>아직 모른다</b><small>${CODEX.hint(e)}</small></span></div>`;
  return `<button class="cx-card ${st.n[e.id] ? 'new' : ''}" data-cx="${e.id}">${cxSeal(e, 40)}<span class="cx-t"><b>${e.title}${e.hanja ? `<span class="hj">${e.hanja}</span>` : ''}${e.fic ? '<span class="cx-fictag">지어냄</span>' : ''}</b><small>${e.sum}</small></span></button>`; }
function cxList() { const cats = CX.cat === 'all' ? CODEX.CATS : CODEX.CATS.filter(c => c.id === CX.cat);
  return cats.map(c => { const k = CODEX.count(CX.st, c.id), es = CODEX.ENTRIES.filter(e => e.cat === c.id).sort((a, b) => (CX.st.u[b.id] ? 1 : 0) - (CX.st.u[a.id] ? 1 : 0));
    return `<h4 class="cx-cat"><i>${c.ch}</i>${c.name}<span class="num">${k.n} / ${k.m}</span><span class="cx-bar" aria-hidden="true"><s style="width:${Math.round(k.n / k.m * 100)}%"></s></span></h4><div class="cx-grid">${es.map(cxCard).join('')}</div>`; }).join('')
    + '<p class="cx-note">항목은 바다에서 그것을 만날 때 열린다. 한 번 연 항목은 새 항해에도 남는다. 「역사 기록」은 사료와 연구로 확인한 것, 「게임 속 각색」은 이 게임이 바꾸거나 지어낸 것이다.</p>'; }
function cxResults() { const r = CODEX.search(CX.st, CX.q), k = CODEX.count(CX.st);
  return `<h4 class="cx-cat"><i>尋</i>「${cxEsc(CX.q)}」<span class="num">${r.length}건</span></h4>` + (r.length ? `<div class="cx-grid">${r.map(cxCard).join('')}</div>` : `<p class="cx-none">열린 항목에서 찾지 못했다.${k.n < k.m ? ` 아직 모르는 항목 ${k.m - k.n}개는 찾지 않는다.` : ''}</p>`); }
function cxEntry(e) { const st = CX.st, cat = CODEX.CATS.find(c => c.id === e.cat), A = e.art;
  const ban = A.port || A.end || A.ev || A.ship ? `<canvas class="cx-ban" aria-hidden="true"></canvas>` : '';
  const side = A.pts ? '' : `<div class="cx-art">${cxSeal(e, 96)}</div>`;
  const pts = A.pts ? `<div class="cx-pts">${A.pts.map(id => `<figure>${PORTRAIT.svg(id, { size: 56 })}<figcaption>${cxWho(id)}</figcaption></figure>`).join('')}</div>` : '';
  const rel = e.rel.map(id => { const r = CODEX.BY[id]; if (!r) return ''; return st.u[id] ? `<button class="cx-chip" data-cx="${id}"><i>${r.art.good ? C.G[r.art.good].ch : cxGlyph(r)}</i>${r.title}</button>` : '<span class="cx-chip lock">? 아직 모른다</span>'; }).join('');
  return `<div class="cx-nav">${CX.back.length ? '<button class="btn" data-cxback="1">← 앞 항목</button>' : ''}${CX.sheet ? '' : '<button class="btn" data-cxlist="1">목록으로</button>'}</div>
    <article class="cx-e" aria-labelledby="cxEh">${ban}<header class="cx-eh"><div><div class="eyebrow">${cat.ch} ${cat.name}</div><h3 id="cxEh">${e.title}${e.hanja ? `<span class="hj">${e.hanja}</span>` : ''}</h3><p class="cx-sum">${e.sum}</p>${e.fic ? '<span class="cx-fic">게임이 지어낸 것</span>' : ''}</div>${side}</header>${pts}
    <h4>${e.fic ? '바탕이 된 역사' : '역사 기록'}</h4><div class="cx-hist">${e.hist.map(p => `<p>${p}</p>`).join('')}</div>
    ${e.debate ? `<div class="cx-debate"><b>학설이 갈린다</b> — ${e.debate}</div>` : ''}
    <h4>게임 속 각색</h4><div class="cx-game"><p>${e.game}</p></div>
    ${rel ? `<h4>함께 볼 항목</h4><div class="cx-rel">${rel}</div>` : ''}
    <h4>출전</h4><div class="cx-src"><ul>${e.src.map(s => `<li>${s}</li>`).join('')}</ul></div></article>`; }
const cxWho = id => { const m = C.MATES.find(x => x.id === id), b = C.BOSSES.find(x => x.id === id); return m ? `${m.name}<br><small>${m.role}</small>` : b ? b.name : ''; };
function cxArt() { const e = CODEX.BY[CX.id], cv = $('cxBody').querySelector('.cx-ban'); if (!e || !cv) return; const A = e.art, s = S();
  let n = 0; const go = () => { const w = cv.clientWidth, h = cv.clientHeight; if (!w && n++ < 10) { requestAnimationFrame(go); return; } if (!w) return; const g = ART.prep(cv, w, h);
    if (A.port) ART.portScene(g, w, h, A.port, ART.portMood(A.port, s && $('sTitle').hidden ? s.t : 40)); else if (A.end) ART.ending(g, w, h, A.end); else if (A.ev) ART.eventScene(g, w, h, A.ev, ''); else if (A.ship) ART.shipCard(g, w, h, A.ship, (C.BOSSES.find(b => b.id === A.ship) || {}).ch || '', 'boss'); };
  go(); }
function paintCodex(keep) { const st = CX.st, all = CODEX.count(st), sc = keep ? $('cxBody').scrollTop : 0;
  $('cxCount').textContent = `${all.n} / ${all.m}`;
  const tabs = [['all', '전체', all], ...CODEX.CATS.map(c => [c.id, c.name, CODEX.count(st, c.id)])];
  $('cxTabs').innerHTML = tabs.map(([id, l, k]) => { const on = CX.cat === id && !CX.id && !CX.q; return `<button class="${on ? 'on' : ''}" data-cxcat="${id}" role="tab" aria-selected="${on}">${l}<small class="num">${k.n}/${k.m}</small></button>`; }).join(''); tabsFade($('cxTabs'));
  $('cxBody').innerHTML = CX.id ? cxEntry(CODEX.BY[CX.id]) : CX.q ? cxResults() : cxList();
  if (CX.id) { cxLink($('cxBody').querySelector('.cx-e'), { sel: '.cx-hist p, .cx-debate, .cx-game p', max: 6, self: CX.id }); cxArt(); }
  $('cxBody').scrollTop = sc; }
$('mCodex').addEventListener('click', e => { const b = e.target.closest('[data-cx],[data-cxl],[data-cxcat],[data-cxback],[data-cxlist]'); if (!b) return;
  if (b.dataset.cx || b.dataset.cxl) { cxGo(b.dataset.cx || b.dataset.cxl, true); return; }
  if (b.dataset.cxcat) { CX.cat = b.dataset.cxcat; CX.id = null; CX.back = []; CX.q = ''; $('cxQ').value = ''; paintCodex(); return; }
  if (b.dataset.cxback) { CX.id = CX.back.pop() || null; paintCodex(); return; }
  if (b.dataset.cxlist) { CX.id = null; CX.back = []; paintCodex(); } });
$('cxQ').addEventListener('input', () => { CX.q = $('cxQ').value.trim(); CX.id = null; CX.back = []; paintCodex(); });
$('cxClose').onclick = closeCodex;
$('cxFull').onclick = () => { CX.sheet = false; $('mCodex').classList.remove('sheet'); $('cxFull').hidden = true; paintCodex(); };
/* 이야기·사건·항구 글의 낱말 — 지금 장면은 그대로 두고 사전 쪽지만 얹는다 */
document.addEventListener('click', e => { const a = e.target.closest('.cx-link'); if (!a || a.closest('#mCodex')) return; e.preventDefault(); e.stopPropagation(); openCodex({ id: a.dataset.cxl, sheet: true }); }, true);
document.addEventListener('keydown', e => { const a = e.target.closest && e.target.closest('.cx-link'); if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); a.click(); } }, true);
$('bCodex').onclick = e => { e.stopPropagation(); hideMenu(); if (cxOpen()) { closeCodex(); return; } if (anyModal() && $('mBook').hidden) return; openCodex(); };
$('mDict').onclick = () => { hideMenu(); openCodex(); };
$('bCodexT').onclick = () => openCodex();
function paintTitleCodex() { paintCxBadge(); const e = CODEX.fact(CX.st); $('cxFactT').innerHTML = e ? `<b>알고 있었나요?</b> ${e.fact}` : ''; }

/* ─────────── 메뉴 ─────────── */
function hideMenu() { $('menu').hidden = true; $('bMenu').setAttribute('aria-expanded', 'false'); }
$('tracker').onclick = () => { if (!anyModal()) openBook('quest'); };
$('tracker').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('tracker').click(); } };
$('bBook').onclick = e => { e.stopPropagation(); hideMenu(); if (anyModal() && $('mBook').hidden) return; if (!$('mBook').hidden) { $('mBook').hidden = true; return; } openBook(); };
$('bkClose').onclick = () => { $('mBook').hidden = true; };
$('bMenu').onclick = e => { e.stopPropagation(); AU.init(); $('mSound').textContent = AU.on ? '소리 끄기' : '소리 켜기'; const open = $('menu').hidden; $('menu').hidden = !open; $('bMenu').setAttribute('aria-expanded', open ? 'true' : 'false'); if (open) { const f = $('menu').querySelector('button'); if (f) f.focus({ preventScroll: true }); } };
$('mHowto').onclick = () => { hideMenu(); $('mHelp').hidden = false; };
$('mHelpOk').onclick = () => { $('mHelp').hidden = true; };
$('mCoach').onclick = () => { hideMenu(); META.tut = false; saveMeta(); coachStep = -1; coachGo(0); };
$('mMotion').onclick = () => { setRM(!RM); };
$('mWide').onclick = () => { const s = S(); cam.wide = !cam.wide; $('mWide').textContent = cam.wide ? '가까이 보기' : '해도 전체 보기'; lookAt(cam.wide ? C.WORLD.w / 2 : s.x, cam.wide ? C.WORLD.h / 2 : s.y, cam.wide ? cam.fit : defaultZoom()); hideMenu(); };
$('mShip').onclick = () => { const s = S(); cam.wide = false; $('mWide').textContent = '해도 전체 보기'; lookAt(s.x, s.y, defaultZoom()); hideMenu(); };
$('mSound').onclick = () => { AU.init(); AU.set(!AU.on); $('mSound').textContent = AU.on ? '소리 끄기' : '소리 켜기'; };
$('mRetire').onclick = () => { hideMenu(); if (!S() || S().ended) return; $('mRetire2').hidden = false; };
$('mRetireYes').onclick = () => { $('mRetire2').hidden = true; finish(true); };
$('mRetireNo').onclick = () => { $('mRetire2').hidden = true; };

/* ─────────── 첫 화면 ─────────── */
let capSel = 'gungbok', diffSel = C.DIFFS[META.diff] ? META.diff : C.DIFF_NEW;
function showTitle() { $('feed').hidden = true; const t = $('sTitle'); t.classList.remove('out'); t.hidden = false; taLayout();
  { const sv = hasSave(); $('bCont').hidden = !sv; $('bCont').className = 'btn' + (sv ? ' main big' : ''); $('bStart').className = 'btn' + (sv ? '' : ' main big'); }  // 저장이 있으면 '이어하기'가 주단추
  $('diffs').innerHTML = Object.entries(C.DIFFS).map(([id, d]) => `<button class="dif-b ${diffSel === id ? 'on' : ''}" data-diff="${id}" role="radio" aria-checked="${diffSel === id}"><span class="dch">${d.ch}</span><b>${d.name}</b><small>${d.sub}</small></button>`).join('');
  $('diffs').querySelectorAll('[data-diff]').forEach(b => b.onclick = () => { diffSel = b.dataset.diff; META.diff = diffSel; saveMeta(); showTitle(); $('diffs').querySelector(`[data-diff="${diffSel}"]`).focus({ preventScroll: true }); });
  $('diffLine').textContent = `${C.DIFFS[diffSel].name} — ${C.DIFFS[diffSel].text}`;
  $('caps').innerHTML = Object.entries(C.CAPTAINS).map(([id, c]) => { const open = !c.unlock || META.unlocked[id];
    return `<button class="cap ${capSel === id ? 'on' : ''}" data-cap="${id}" aria-pressed="${capSel === id}" ${open ? '' : 'disabled'}><span class="cs pt">${PORTRAIT.svg(id, { size: 60, expr: capSel === id && open ? 'determined' : 'neutral' })}</span><span class="nm">${c.name}</span><small>${c.title}</small><em class="hook">${c.hook}</em>${open ? `<p>${c.perk}</p>` : `<span class="lock">${c.unlock}</span>`}</button>`; }).join('');
  $('caps').querySelectorAll('.cap').forEach(b => b.onclick = () => { capSel = b.dataset.cap; showTitle(); $('caps').querySelector(`[data-cap="${capSel}"]`).focus({ preventScroll: true }); });
  paintTitleCodex(); const bb = META.bestBy || {}; $('bestLine').textContent = META.best ? `최고 기록 ${fmt(META.best)} (${Object.entries(C.DIFFS).filter(([id]) => bb[id]).map(([id, d]) => `${d.name} ${fmt(bb[id])}`).join(' · ') || C.DIFFS[diffSel].name}) · ${META.runs}번 항해 · 엔딩 ${Object.keys(META.endings || {}).length}/${Object.keys(C.ENDINGS).length}${META.legacy && C.RELICS.find(r => r.id === META.legacy) ? ` · 유산 ${C.RELICS.find(r => r.id === META.legacy).name}` : ''}` : ''; }
/* 첫 화면에서 바다로: 종이가 걷히듯 사라진다 */
function leaveTitle() { const t = $('sTitle'); if (RM) { t.hidden = true; return; } t.classList.add('out'); setTimeout(() => { t.hidden = true; t.classList.remove('out'); }, 480); }
function resetView() { FEED.unread = 0; $('feed').hidden = false; setTimeout(feedRender, 0); GT.v = null; spNote = null; mapAppear = {}; BT.open = false; DV.open = false; trail = []; portAppear = {}; findAppear = {}; rumorPulse = {}; rivalMark = {}; lastQuote = null; speedIdx = 0; for (const k of Object.keys(last)) delete last[k]; camGoal = null; }
function startGame(cap, diff) {
  AU.init(); C.newGame(cap, diff || diffSel, { relic: META.legacy || null }); fogReset(); resetView();
  leaveTitle(); cam.touched = 0; cam.wide = false; openPanel(); relayout(true); paintHud(); saveGame();
  coachStep = META.tut ? -2 : -1; coachPending = !META.tut; CX.hold = performance.now() + 60000;
  if (S().legacy) { const r = C.RELICS.find(x => x.id === S().legacy); if (r) setTimeout(() => toast(`유산 — 지난 항해의 <b>${r.name}</b>을 물려받았다. ${r.text}`, 'good'), 1200); }
  setTimeout(() => openPrologue(cap, () => { runStories(); }), 700);
}
/* 프롤로그: 선장마다 세 쪽. 장면 한 컷 → 왕·아버지·다자이후의 한마디 → 상납 칸을 가리킨다. 건너뛸 수 있다 */
function openPrologue(cap, done) { const pages = C.CAPTAINS[cap].prologue || []; let i = 0;
  const end = () => { $('mStory').hidden = true; $('hQuotaBox').classList.remove('point'); done(); };
  const show = () => { if (i >= pages.length) { end(); return; } const pg = pages[i], lastPage = i === pages.length - 1; AU[i ? 'chime' : 'gong']();
    $('hQuotaBox').classList.toggle('point', lastPage);
    $('stCard').innerHTML = `${PORTRAIT.has(pg.who) ? `<span class="who pt">${PORTRAIT.svg(pg.who, { size: 84, expr: PORTRAIT.exprs(pg.who)[0], frame: 'card' })}</span>` : '<span class="who">序</span>'}<div class="eyebrow">프롤로그 · ${i + 1}/${pages.length}</div><h2 style="padding-right:92px">${pg.title}</h2><p>${pg.text}</p>
      <div class="choices"><button class="choice" id="plNext"><b>${lastPage ? '알겠다' : '다음'}</b></button></div><div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="linkbtn" id="plSkip">건너뛰기</button></div>`;
    cxLink($('stCard'), { sel: ':scope > p', max: 2 }); $('stCard').classList.add('chapter'); ART.clearArt($('stCard')); $('mStory').hidden = false; $('plNext').focus({ preventScroll: true });
    $('plNext').onclick = () => { i++; show(); }; $('plSkip').onclick = end; };
  show(); }
$('bStart').onclick = () => { if (hasSave()) { $('mNew').hidden = false; return; } startGame(capSel); };  // 저장이 있으면 덮어쓰기 전에 묻는다
$('mNewYes').onclick = () => { $('mNew').hidden = true; startGame(capSel); };
$('mNewNo').onclick = () => { $('mNew').hidden = true; };
$('bCont').onclick = () => { AU.init(); if (!loadGame()) { toast('이어할 항해가 없다.'); return; } fogRebuild(); resetView(); leaveTitle(); coachStep = -2; cam.touched = 0; openPanel(); relayout(true); paintHud(); toast(continueLine()); setTimeout(runStories, 500); };
function continueLine() { const s = S(), A = C.curAct(); if (!A) return '항해를 이어간다.'; const n = C.NUM[s.main.act]; if (!s.main.started) return `第${n}幕 ${A.title} — 다음 소식을 기다린다. ${C.cap().quotaName} ${fmt(C.quotaNow())}냥, ${Math.ceil(C.daysToDue())}일 뒤.`; const left = C.mainGoals().filter(g => !g.done); return `第${n}幕 ${A.title} — ${left.length ? left.map(g => g.text + (g.prog && g.prog() ? ` (${g.prog()})` : '')).join(' · ') : '마지막 선택이 기다린다'}`; }

/* ─────────── 첫 화면 그림: 먹으로 그린 바다와 신라 상선 ─────────── */
/* 옆에서 본 배. y는 물금(흘수선), dir 1이면 오른쪽을 본다 */
function shipSide(g, x, y, s, o = {}) { const dir = o.dir || 1, hull = o.hull || '#3b2a1c', sail = o.sail || '#dcc28a', ink = '#1b2324';
  g.save(); g.translate(x, y); g.rotate((o.roll || 0) * dir); g.scale(s * dir, s); g.globalAlpha = o.alpha == null ? 1 : o.alpha;
  g.fillStyle = 'rgba(27,35,36,.16)'; g.beginPath(); g.ellipse(0, 5, 66, 6, 0, 0, 7); g.fill();
  g.strokeStyle = ink; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-52, -16); g.lineTo(-66, 9); g.stroke();
  g.fillStyle = hull; g.beginPath(); g.moveTo(-63, 2); g.lineTo(-71, 13); g.lineTo(-64, 16); g.lineTo(-59, 5); g.closePath(); g.fill();
  const hullPath = () => { g.beginPath(); g.moveTo(-60, -22); g.quadraticCurveTo(-59, -4, -46, 6); g.lineTo(40, 6); g.quadraticCurveTo(57, 2, 66, -24); g.lineTo(59, -22); g.quadraticCurveTo(50, -13, 40, -13); g.lineTo(-44, -13); g.quadraticCurveTo(-53, -15, -60, -22); g.closePath(); };
  hullPath(); const hg = g.createLinearGradient(0, -22, 0, 6); hg.addColorStop(0, hull); hg.addColorStop(1, '#1b1410'); g.fillStyle = hg; g.fill(); g.strokeStyle = ink; g.lineWidth = 1.3; g.stroke();
  g.strokeStyle = 'rgba(245,240,227,.16)'; g.lineWidth = .9; for (const yy of [-7, -1]) { g.beginPath(); g.moveTo(-52, yy); g.lineTo(52, yy); g.stroke(); }
  g.strokeStyle = o.trim || '#b03a26'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-56, -16.5); g.quadraticCurveTo(-49, -12, -40, -12); g.lineTo(42, -12); g.quadraticCurveTo(55, -13, 62, -21); g.stroke();
  g.fillStyle = 'rgba(245,240,227,.55)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-30 + i * 13, -5, 1.6, 0, 7); g.fill(); }
  g.fillStyle = hull; g.fillRect(-52, -26, 17, 13); g.strokeStyle = ink; g.lineWidth = 1; g.strokeRect(-52, -26, 17, 13);
  g.fillStyle = ink; g.beginPath(); g.moveTo(-56, -26); g.quadraticCurveTo(-44, -29, -43.5, -33); g.quadraticCurveTo(-43, -29, -31, -26); g.closePath(); g.fill();
  const masts = [[-8, 84, 1], [30, 60, .74]], sw = o.sway || 0;
  g.strokeStyle = 'rgba(27,35,36,.55)'; g.lineWidth = .7; g.beginPath(); g.moveTo(-8, -96); g.lineTo(64, -22); g.moveTo(-8, -96); g.lineTo(-58, -22); g.moveTo(30, -72); g.lineTo(65, -23); g.stroke();
  for (const [mx, h, k] of masts) { const top = -12 - h, bot = -20, wv = h * .5;
    g.strokeStyle = ink; g.lineWidth = 2.2; g.beginPath(); g.moveTo(mx, -12); g.lineTo(mx, top - 6); g.stroke();
    const lt = mx - wv * .78, lb = mx - wv, bulge = 6 * k + sw * 3;
    const sailPath = () => { g.beginPath(); g.moveTo(mx + 1, top + 2); g.lineTo(mx + 1, bot); g.lineTo(lb, bot + 1); g.quadraticCurveTo(lb - bulge, (top + bot) / 2, lt, top + 4); g.closePath(); };
    sailPath(); const sg = g.createLinearGradient(lb, top, mx, bot); sg.addColorStop(0, o.sail2 || '#e9d7aa'); sg.addColorStop(1, sail); g.fillStyle = sg; g.fill(); g.strokeStyle = ink; g.lineWidth = 1.1; g.stroke();
    g.save(); sailPath(); g.clip(); g.strokeStyle = 'rgba(27,35,36,.6)'; g.lineWidth = 1; const n = 6;
    for (let i = 1; i < n; i++) { const yy = top + (bot - top) * i / n; g.beginPath(); g.moveTo(mx + 1, yy); g.quadraticCurveTo((mx + lb) / 2, yy + 2.5, lb - bulge, yy + 1); g.stroke(); }
    if (o.tatter) { g.fillStyle = 'rgba(27,35,36,.35)'; g.beginPath(); g.moveTo(lb, bot); g.lineTo(lb + 8, bot - 10); g.lineTo(lb + 3, bot - 2); g.fill(); }
    g.restore(); }
  if (o.flag) { const t = o.t || 0; g.fillStyle = o.flag; g.beginPath(); g.moveTo(-8, -102); for (let i = 0; i <= 6; i++) g.lineTo(-8 - i * 4, -102 + Math.sin(t * 6 + i * .9) * 1.6 + i * .5); for (let i = 6; i >= 0; i--) g.lineTo(-8 - i * 4, -96 + Math.sin(t * 6 + i * .9) * 1.6 + i * .2); g.closePath(); g.fill(); }
  g.restore();
  if (o.ch) { const ex = x + dir * s * (-8 - 84 * .5 * .45), ey = y + s * (-12 - 84 * .55); g.save(); g.globalAlpha = o.alpha == null ? 1 : o.alpha; g.fillStyle = o.chBg || COL.ju; g.beginPath(); g.arc(ex, ey, 11 * s, 0, 7); g.fill(); g.fillStyle = COL.hanji2; g.font = `${Math.round(13 * s)}px ${css('--seal')}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.ch, ex, ey + .5); g.restore(); } }
/* 물결 한 줄: 사인 위에 먹선, 앞쪽 줄은 말린 물마루와 거품 */
function waveRow(g, y, w, amp, len, ph, alpha, lw, curls) { const Y = x => y + Math.sin(x / len + ph) * amp + Math.sin(x / (len * .43) + ph * 1.7) * amp * .35;
  g.beginPath(); for (let x = -20; x <= w + 20; x += 6) x === -20 ? g.moveTo(x, Y(x)) : g.lineTo(x, Y(x));
  g.strokeStyle = `rgba(27,46,52,${alpha})`; g.lineWidth = lw; g.stroke();
  if (curls) { const step = len * Math.PI * 2; for (let x0 = ((-ph * len) % step + step) % step - step; x0 < w + step; x0 += step) { const cx = x0 + len * Math.PI * .5, cy = Y(cx), r = amp * 1.1;
    g.strokeStyle = 'rgba(245,240,227,.85)'; g.lineWidth = lw * 1.3; g.beginPath(); g.moveTo(cx - r * 2.2, cy + r * .5); g.quadraticCurveTo(cx - r, cy - r * .2, cx, cy - r * .1); g.stroke();
    g.strokeStyle = `rgba(27,46,52,${Math.min(.8, alpha + .15)})`; g.lineWidth = lw; g.beginPath(); g.moveTo(cx - r * 1.6, cy + r * .2); g.quadraticCurveTo(cx - r * .2, cy - r * 1.3, cx + r * .7, cy - r * .3); g.quadraticCurveTo(cx + r * .9, cy + r * .3, cx + r * .3, cy + r * .2); g.stroke(); } } }
const TA = { w: 0, h: 0, bg: null, horizon: 0, artH: 0, last: 0, mobile: false };
function taLayout() { const c = $('tArt'); TA.w = innerWidth; TA.h = innerHeight; c.width = Math.round(TA.w * DPR); c.height = Math.round(TA.h * DPR); TA.mobile = TA.w <= 680;
  TA.artH = TA.mobile ? Math.max(220, Math.min(400, TA.h * .46)) + 40 : TA.h; TA.horizon = TA.artH * (TA.mobile ? .56 : .55); TA.bg = null; TA.last = 0; }
function taStatic() { const w = TA.w, h = TA.h, hz = TA.horizon, A = TA.artH, b = document.createElement('canvas'); b.width = Math.round(w * DPR); b.height = Math.round(h * DPR); const g = b.getContext('2d'), r = rng(9); g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#f1ead8'); sky.addColorStop(1, '#e1d6bb'); g.fillStyle = sky; g.fillRect(0, 0, w, hz + 2);
  const sx = TA.mobile ? w * .26 : w * .2, sy = A * (TA.mobile ? .27 : .25), sr = Math.min(w, A) * (TA.mobile ? .13 : .1);
  const sun = g.createRadialGradient(sx - sr * .2, sy - sr * .2, sr * .1, sx, sy, sr); sun.addColorStop(0, 'rgba(204,78,50,.95)'); sun.addColorStop(1, 'rgba(176,58,38,.82)'); g.fillStyle = sun; g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill();
  for (let i = 0; i < 5; i++) { const yy = sy - sr * .6 + i * sr * .35 + r() * 10, xx = sx - sr * 2 + r() * sr * 2, ww = sr * (2 + r() * 3); const cg = g.createLinearGradient(xx, 0, xx + ww, 0); cg.addColorStop(0, 'rgba(241,234,216,0)'); cg.addColorStop(.5, 'rgba(241,234,216,.75)'); cg.addColorStop(1, 'rgba(241,234,216,0)'); g.fillStyle = cg; g.fillRect(xx, yy, ww, 2 + r() * 4); }
  const layers = [{ base: hz + 2, amp: A * .16, col: [96, 116, 116], a: .32, seed: 1, edge: .35 }, { base: hz + 2, amp: A * .24, col: [58, 76, 76], a: .5, seed: 2, edge: .7 }, { base: hz + 4, amp: A * .34, col: [27, 35, 36], a: .82, seed: 3, edge: 1 }];
  for (const L of layers) { const ph = [r() * 9, r() * 9, r() * 9], hf = x => { const u = x / w, edge = TA.mobile ? Math.pow(Math.abs(u - .55) * 1.6, 1.6) : Math.max(Math.pow(1 - u * 2.4, 2), Math.pow(Math.max(0, u - .62) * 2.6, 2.2)) * L.edge + (L.seed === 1 ? .35 : 0);
      return Math.max(0, (Math.sin(x / 90 + ph[0]) * .45 + Math.sin(x / 37 + ph[1]) * .25 + Math.sin(x / 15 + ph[2]) * .08 + .55) * Math.min(1, edge)) * L.amp; };
    g.beginPath(); g.moveTo(-5, L.base); const pts = []; for (let x = -5; x <= w + 5; x += 4) { const y = L.base - hf(x); pts.push([x, y]); g.lineTo(x, y); } g.lineTo(w + 5, L.base + 2); g.lineTo(-5, L.base + 2); g.closePath();
    const top = L.base - L.amp, mg = g.createLinearGradient(0, top, 0, L.base); mg.addColorStop(0, `rgba(${L.col},${L.a})`); mg.addColorStop(.7, `rgba(${L.col},${L.a * .45})`); mg.addColorStop(1, `rgba(${L.col},0)`); g.fillStyle = mg; g.fill();
    g.strokeStyle = `rgba(27,35,36,${L.a * .5})`; g.lineWidth = .8; for (let i = 0; i < pts.length; i += 3) { const [x, y] = pts[i]; if (L.base - y < 6) continue; g.beginPath(); g.moveTo(x, y + 2); g.lineTo(x + (r() - .5) * 4, y + 6 + r() * (L.base - y) * .35); g.stroke(); }
    if (L.seed === 3) { for (const [x, y] of pts) if (L.base - y > L.amp * .55 && x > 40 && x < w - 40 && r() < .035) pine(g, x, y, A / 600, r); } }
  const sea = g.createLinearGradient(0, hz, 0, A); sea.addColorStop(0, '#c9d6c9'); sea.addColorStop(.35, '#93b3aa'); sea.addColorStop(1, '#3f6c71'); g.fillStyle = sea; g.fillRect(0, hz, w, h - hz);
  g.fillStyle = 'rgba(245,240,227,.55)'; g.fillRect(0, hz, w, 1.5);
  for (let i = 0; i < 9; i++) { const ww = sr * (1.4 - i * .12), yy = hz + 5 + i * 6; g.fillStyle = `rgba(176,58,38,${.35 - i * .035})`; g.fillRect(sx - ww / 2 + (r() - .5) * 10, yy, ww, 1.6); }
  for (const [fx, fs] of [[.62, .8], [.74, .55]]) { const x = w * fx, y = hz - 1, k = A / 900 * fs; g.fillStyle = 'rgba(27,35,36,.45)'; g.beginPath(); g.moveTo(x - 10 * k, y); g.lineTo(x + 10 * k, y); g.lineTo(x + 7 * k, y + 3 * k); g.lineTo(x - 8 * k, y + 3 * k); g.fill(); g.fillRect(x - 2 * k, y - 20 * k, 7 * k, 18 * k); }
  paperTexture(g, w, h, r, Math.round(w * h / 260)); TA.bg = b; }
function pine(g, x, y, k, r) { g.save(); g.translate(x, y); g.scale(k * 1.6, k * 1.6); g.strokeStyle = 'rgba(27,35,36,.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-4, -14, 3, -26); g.stroke();
  g.fillStyle = 'rgba(27,35,36,.85)'; for (let i = 0; i < 4; i++) { const yy = -10 - i * 6, ww = 14 - i * 2.6 + r() * 3; g.beginPath(); g.ellipse(2 + (r() - .5) * 4, yy, ww, 2.6, (r() - .5) * .3, 0, 7); g.fill(); } g.restore(); }
function titleFrame(now) { if (TA.last && now - TA.last < 33) return; TA.last = now; const c = $('tArt'), g = c.getContext('2d'); if (!TA.bg) taStatic(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(TA.bg, 0, 0);
  g.setTransform(DPR, 0, 0, DPR, 0, 0); const w = TA.w, hz = TA.horizon, A = TA.artH, t = RM ? 0 : clock;
  const sx = TA.mobile ? w * .44 : w * .3, sY = hz + (A - hz) * (TA.mobile ? .5 : .44), ss = TA.mobile ? A / 330 : Math.min(2.3, A / 400), bob = Math.sin(t * 1.3) * 3, roll = Math.sin(t * .9) * .025;
  const rows = 16, rowsY = []; for (let j = 0; j < rows; j++) { const q = (j + 1) / rows; rowsY.push(hz + (A - hz) * Math.pow(q, 1.55) + 4); }
  const row = j => { const q = (j + 1) / rows, y = rowsY[j]; waveRow(g, y, w, 1 + q * 7, 22 + q * 70, t * (.6 + q * .9) + j * 1.3, .1 + q * .28, .5 + q * 1.4, q > .72); };
  for (let j = 0; j < rows; j++) if (rowsY[j] <= sY + 4) row(j);
  for (const [bx, by, bs] of [[.52, .17, 1], [.56, .2, .8], [.49, .22, .7]]) { const x = w * bx + Math.sin(t * .3 + bx * 9) * 6, y = A * by + Math.cos(t * .4 + by * 9) * 3, k = bs * (TA.mobile ? .8 : 1.2), fl = Math.sin(t * 5 + bx * 20) * 2; g.strokeStyle = 'rgba(27,35,36,.7)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - 8 * k, y - 2 * k + fl); g.quadraticCurveTo(x - 3 * k, y - 4 * k, x, y); g.quadraticCurveTo(x + 3 * k, y - 4 * k, x + 8 * k, y - 2 * k + fl); g.stroke(); }
  g.strokeStyle = 'rgba(245,240,227,.7)'; g.lineWidth = 1.4; for (let i = 0; i < 4; i++) { const k = (t * .5 + i * .25) % 1; g.globalAlpha = 1 - k; g.beginPath(); g.ellipse(sx - (70 + k * 120) * ss * .9, sY + bob + 6, (10 + k * 30) * ss * .5, 2.4, 0, 0, 7); g.stroke(); } g.globalAlpha = 1;
  shipSide(g, sx, sY + bob, ss, { dir: 1, roll, flag: COL.ju, t, sway: Math.sin(t * .8), ch: '淸' });
  const hb = g.createLinearGradient(sx - 90 * ss, 0, sx + 90 * ss, 0); hb.addColorStop(0, 'rgba(110,150,148,0)'); hb.addColorStop(.25, 'rgba(110,150,148,.85)'); hb.addColorStop(.75, 'rgba(110,150,148,.85)'); hb.addColorStop(1, 'rgba(110,150,148,0)'); g.fillStyle = hb; g.beginPath(); g.moveTo(sx - 90 * ss, sY + 4 + bob); for (let x = -90; x <= 90; x += 6) g.lineTo(sx + x * ss, sY + bob + 2 + Math.sin(x / 9 + t * 2) * 1.5 * ss); g.lineTo(sx + 90 * ss, sY + bob + 9 * ss); g.lineTo(sx - 90 * ss, sY + bob + 9 * ss); g.fill();
  for (let j = 0; j < rows; j++) if (rowsY[j] > sY + 4) row(j); }

$('bSound').onclick = () => { AU.init(); AU.set(!AU.on); };
addEventListener('keydown', e => { const s = S();
  if (cxOpen()) { if (e.key === 'Escape') { e.preventDefault(); closeCodex(); } else if (e.target !== $('cxQ') && (e.key === 'd' || e.key === 'D')) closeCodex(); return; }
  if (s && $('sTitle').hidden && (e.key === 'd' || e.key === 'D') && (!anyModal() || !$('mBook').hidden)) { openCodex(); return; }
  if (s && !$('mBattle').hidden && s.battle && !s.battle.over && /^[1-5]$/.test(e.key)) { const o = C.battleOpts()[+e.key - 1]; if (o && o.ok) battleDo(o.id); return; }
  if (s && !$('mDive').hidden && s.dive && !s.dive.over) { if (e.key === 'ArrowDown') { e.preventDefault(); diveDo('down'); } if (e.key === 'ArrowUp') { e.preventDefault(); diveDo('up'); } return; }
  if (s && !$('mBook').hidden && e.key === 'Escape') { $('mBook').hidden = true; return; }
  if (s && $('sTitle').hidden && (e.key === 'b' || e.key === 'B') && (!anyModal() || !$('mBook').hidden)) { if ($('mBook').hidden) openBook(); else $('mBook').hidden = true; return; }
  if (!s || anyModal() || !$('sTitle').hidden) return; if (e.key === 'Escape') { hideDest(); hideMenu(); }
  if (s.mode === 'sail' && ['1', '2', '3'].includes(e.key)) { speedIdx = +e.key - 1; showSailbar(); }
  if (s.mode === 'sail' && (e.code === 'Space' || e.key === ' ')) { e.preventDefault(); toggleRow(); } });
addEventListener('resize', () => { relayout(false); if (BT.open) btLayout(); if (!$('sTitle').hidden) taLayout(); placeToasts(); });
document.addEventListener('click', e => { if (!$('menu').hidden && !e.target.closest('#menu') && !e.target.closest('#bMenu')) hideMenu(); });

/* ─────────── 루프 ─────────── */
let prev = performance.now();
function frame(now) { const dt = Math.min(.1, (now - prev) / 1000); prev = now; clock += dt; const s = S(), title = !$('sTitle').hidden, titleOnly = title && !$('sTitle').classList.contains('out');
  if (!titleOnly) for (const p of winds) { if (p.life > 0 && s) { const w = C.wind(s.t, p.x, p.y); p.x += Math.cos(w.dir) * w.str * 30 * dt; p.y += Math.sin(w.dir) * w.str * 30 * dt; p.life -= dt; } }
  if (s && !s.ended && s.mode === 'sail' && !anyModal() && !title) { handle(C.update(dt / SEC_PER_DAY * SPEEDS[speedIdx]));
    if (!cam.wide && performance.now() - cam.touched > 2500 && !camGoal) { cam.x += (s.x - cam.x) * .06; cam.y += (s.y - cam.y) * .06; clampCam(); } }
  if (camGoal) { const k = RM ? 1 : .12; cam.x += (camGoal.x - cam.x) * k; cam.y += (camGoal.y - cam.y) * k; cam.z += (camGoal.z - cam.z) * k; clampCam(); if (Math.abs(camGoal.x - cam.x) < 1 && Math.abs(camGoal.y - cam.y) < 1 && Math.abs(camGoal.z - cam.z) < .002) camGoal = null; }
  if (!title && s && now - CX.t > 1500) { CX.t = now; cxCheck(); }
  if (title) titleFrame(now); if (!titleOnly) draw(); if (s && !titleOnly) paintHud(); if (BT.open) drawBattle(); if (DV.open) drawDive(now); requestAnimationFrame(frame); }

/* ─────────── 시작 ─────────── */
paintSoundIcon();
/* 글꼴은 본문 맨 끝 <style id="fontcss">로 들어온다(배치 CSS·화면·스크립트가 먼저). 그 자리가 생길 때까지 '닻을 올리는 중' 덮개를 두고, 글꼴이 준비되면 해도 바탕을 그리고 덮개를 걷는다 */
const FONTS = [['40px "Chunghae Myeong"', '청해'], ['600 15px "Chunghae Sans"', '냥'], ['15px "Chunghae Sans"', '냥'], ['40px "Chunghae Seal"', '淸海'], ['40px "Chunghae Brush"', '淸海']];
const fontCss = new Promise(r => { if (window.__FONTCSS) r(); else { document.addEventListener('fontcss', r, { once: true }); setTimeout(r, 12000); } });  // build.js가 글꼴 <style> 바로 뒤에서 'fontcss' 를 쏜다 — 여는 태그만 왔을 때 속지 않는다
const fontsReady = fontCss.then(() => (document.fonts && document.fonts.load) ? Promise.race([Promise.all(FONTS.map(([f, t]) => document.fonts.load(f, t))), new Promise(r => setTimeout(r, 2500))]) : null).catch(() => null);
const repaintBase = () => { sealCache.clear(); TA.bg = null; paintBase(); };
fontsReady.then(repaintBase);
/* 덮개는 글꼴이 들어오면 걷는다. 느린 회선이면 1.5초만 더 기다렸다가 대체 글꼴로 먼저 열고, 글꼴이 오면 해도 바탕을 다시 그린다 */
Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(() => { if (!baseReady) repaintBase(); const b = $('boot'); if (b) b.remove(); });
C.newGame('gungbok'); fogReset(); relayout(true); cam.z = cam.fit; cam.x = C.WORLD.w / 2; cam.y = C.WORLD.h / 2; showTitle(); requestAnimationFrame(frame);
window.__CHUNGHAE = { C, CODEX, CX, openCodex, cxCheck, cxLink, startGame, toast, paintTracker, setTab: t => { panelTab = t; paintPanel(); }, openBook, drainQuests, runStories, openBattle, openDive, battleDo, diveDo, toggleRow, paintPanel, openPanel, finish, openReveal, openEvent, openQuota, showDest, cam, relayout, lookAt };
})();

