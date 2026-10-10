/* ═══════════════════════════════════════════════════════════
   청해 — 장면 그림: 항구 · 사건 · 배 · 결말
   한지 위 먹선과 먹 번짐, 안료는 석청·석록·주사·석황을 조금. 모두 canvas로 그린다.
   규칙은 읽기만 한다(CORE). 글자는 그리지 않는다 — 도장 글자는 ui.js가 넘겨준다.
   ═══════════════════════════════════════════════════════════ */
const ART = (() => {
'use strict';
const TAU = Math.PI * 2;
const K = { ink: '#1b2324', ink2: '#3f4a48', paper: '#f5f0e3', hanji: '#ece5d3', ju: '#b03a26', ju2: '#8d2a1b', cheong: '#23506e', rok: '#3d6e50', rok2: '#5c8a6a', hwang: '#85631a', gold: '#c19a3e', jok: '#22324a', dg: '#2f7a68', db: '#2a4f86', dr: '#b8442e', dy: '#d6a540', pillar: '#8a3424', wall: '#ece4cf', tile: '#2b3333', bark: '#5b4331', straw: '#b19b6b', wood: '#5a4232' };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const ink = a => `rgba(27,35,36,${a})`, pap = a => `rgba(245,240,227,${a})`, rgb = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const ln = (g, x0, y0, x1, y1) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
const dot = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };

/* ─────────── 하늘 · 바다 · 종이 ─────────── */
const MOOD = {
  day:   { sky: ['#f2ebd9', '#e2d8bd'], sea: ['#cbd7c9', '#8fb0a7', '#4a787c'], far: [112, 132, 130], mid: [70, 88, 88], wave: .22 },
  dusk:  { sky: ['#f1e0c6', '#dfb08a'], sea: ['#d8c4a7', '#a19a86', '#4b6767'], far: [140, 118, 104], mid: [70, 70, 70], wave: .22, sun: ['rgba(196,73,46,.9)', .76, .5, .085] },
  dawn:  { sky: ['#eef0e6', '#e2e0cf'], sea: ['#d9dfd3', '#a9c0b7', '#5f8786'], far: [150, 164, 160], mid: [96, 112, 110], wave: .17, mist: 1, sun: ['rgba(206,96,64,.55)', .22, .62, .06] },
  night: { sky: ['#2c3739', '#56625d'], sea: ['#4d5d59', '#34433f', '#1d2828'], far: [84, 98, 96], mid: [30, 38, 38], wave: .3, night: 1 },
  storm: { sky: ['#6c7672', '#a1a499'], sea: ['#8a978f', '#5a706d', '#283f41'], far: [80, 92, 92], mid: [44, 54, 54], wave: .38 },
  fog:   { sky: ['#ecebe1', '#e2e1d5'], sea: ['#dfe1d7', '#ccd4cb', '#a8b9b2'], far: [176, 184, 178], mid: [130, 140, 136], wave: .1, mist: 2 }
};
function paper(g, w, h, r, n) { for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, a = r() * Math.PI, L = 3 + r() * 12; g.strokeStyle = `rgba(60,70,60,${.02 + r() * .035})`; g.lineWidth = .5 + r() * .5; ln(g, x, y, x + Math.cos(a) * L, y + Math.sin(a) * L); }
  for (let i = 0; i < n / 2; i++) { g.fillStyle = `rgba(90,80,60,${r() * .05})`; g.fillRect(r() * w, r() * h, 1 + r() * 1.4, 1 + r() * 1.4); } }
function vignette(g, w, h, a) { const v = g.createRadialGradient(w / 2, h * .55, Math.min(w, h) * .3, w / 2, h / 2, Math.hypot(w, h) * .62); v.addColorStop(0, 'rgba(60,48,26,0)'); v.addColorStop(1, `rgba(60,48,26,${a == null ? .18 : a})`); g.fillStyle = v; g.fillRect(0, 0, w, h); }
function sky(g, w, h, hz, m, r) { const s = g.createLinearGradient(0, 0, 0, hz); s.addColorStop(0, m.sky[0]); s.addColorStop(1, m.sky[1]); g.fillStyle = s; g.fillRect(0, 0, w, hz + 2);
  if (m.sun) { const [c, fx, fy, fr] = m.sun, R = Math.max(w, h * 3) * fr * .45, x = w * fx, y = hz * fy; g.fillStyle = c; dot(g, x, y, R); for (let i = 0; i < 3; i++) { const yy = y - R * .3 + i * R * .45 + r() * 4, xx = x - R * 2 + r() * R, ww = R * (2.4 + r() * 2); const cg = g.createLinearGradient(xx, 0, xx + ww, 0); cg.addColorStop(0, rgb([241, 228, 206], 0)); cg.addColorStop(.5, rgb([241, 228, 206], .8)); cg.addColorStop(1, rgb([241, 228, 206], 0)); g.fillStyle = cg; g.fillRect(xx, yy, ww, 1.5 + r() * 3); } }
  if (m.night) { for (let i = 0; i < w * hz / 260; i++) { g.fillStyle = pap(.25 + r() * .55); dot(g, r() * w, r() * hz * .95, .4 + r() * .8); } }
  for (let i = 0; i < 4; i++) { const yy = hz * (.2 + r() * .6), xx = r() * w - w * .2, ww = w * (.2 + r() * .35); const cg = g.createLinearGradient(xx, 0, xx + ww, 0), cc = m.night ? [90, 104, 102] : [246, 241, 228]; cg.addColorStop(0, rgb(cc, 0)); cg.addColorStop(.5, rgb(cc, m.night ? .3 : .6)); cg.addColorStop(1, rgb(cc, 0)); g.fillStyle = cg; g.fillRect(xx, yy, ww, 1.5 + r() * 3.5); } }
/* 물결 한 줄 — ui.js 첫 화면의 물결과 같은 붓질 */
function waveRow(g, y, w, amp, len, ph, alpha, lw, curls, night) { const Y = x => y + Math.sin(x / len + ph) * amp + Math.sin(x / (len * .43) + ph * 1.7) * amp * .35;
  g.beginPath(); for (let x = -20; x <= w + 20; x += 5) x === -20 ? g.moveTo(x, Y(x)) : g.lineTo(x, Y(x));
  g.strokeStyle = night ? `rgba(180,196,190,${alpha * .6})` : `rgba(27,46,52,${alpha})`; g.lineWidth = lw; g.stroke();
  if (curls) { const step = len * TAU; for (let x0 = ((-ph * len) % step + step) % step - step; x0 < w + step; x0 += step) { const cx = x0 + len * Math.PI * .5, cy = Y(cx), r = amp * 1.1;
    g.strokeStyle = pap(.85); g.lineWidth = lw * 1.3; g.beginPath(); g.moveTo(cx - r * 2.2, cy + r * .5); g.quadraticCurveTo(cx - r, cy - r * .2, cx, cy - r * .1); g.stroke();
    g.strokeStyle = `rgba(27,46,52,${Math.min(.8, alpha + .15)})`; g.lineWidth = lw; g.beginPath(); g.moveTo(cx - r * 1.6, cy + r * .2); g.quadraticCurveTo(cx - r * .2, cy - r * 1.3, cx + r * .7, cy - r * .3); g.quadraticCurveTo(cx + r * .9, cy + r * .3, cx + r * .3, cy + r * .2); g.stroke(); } } }
function sea(g, w, h, hz, m, r, o = {}) { const s = g.createLinearGradient(0, hz, 0, h); s.addColorStop(0, m.sea[0]); s.addColorStop(.4, m.sea[1]); s.addColorStop(1, m.sea[2]); g.fillStyle = s; g.fillRect(0, hz, w, h - hz);
  g.fillStyle = m.night ? 'rgba(200,210,200,.25)' : pap(.6); g.fillRect(0, hz, w, 1.2);
  const rows = o.rows || 11, rough = (o.rough || 1) * (m.wave / .22), ph = r() * 9;
  for (let j = 0; j < rows; j++) { const q = (j + 1) / rows, y = hz + (h - hz) * Math.pow(q, 1.5) + 2; waveRow(g, y, w, (.5 + q * 4) * rough, 12 + q * 46, ph + j * 1.7, (.06 + q * .2) * Math.min(1.6, rough), .45 + q * 1.1, o.curls && q > .7, m.night); } }
function mist(g, w, y, hgt, a, r) { for (let i = 0; i < 3; i++) { const yy = y + (r() - .5) * hgt, cg = g.createLinearGradient(0, yy - hgt / 2, 0, yy + hgt / 2); cg.addColorStop(0, pap(0)); cg.addColorStop(.5, pap(a)); cg.addColorStop(1, pap(0)); g.fillStyle = cg; g.fillRect(0, yy - hgt / 2, w, hgt); } }

/* ─────────── 산 — 먹 번짐 겹산 ─────────── */
/* peaks: [[x비율, 높이비, 폭비, 모양]] — 봉우리들의 가장 높은 값에 잔결을 더한다 */
function hfun(w, o, r) { const ph = [r() * 9, r() * 9, r() * 9], pk = o.peaks || [[.5, 1, .4]];
  return x => { let v = 0; for (const [px, hh, pw, p] of pk) { const d = Math.abs(x / w - px) / pw; v = Math.max(v, hh * Math.exp(-Math.pow(d, p || 1.6))); }
    const n = Math.sin(x / (w * .07) + ph[0]) * .5 + Math.sin(x / (w * .029) + ph[1]) * .3 + Math.sin(x / (w * .011) + ph[2]) * .14; return Math.max(0, v * (1 + (o.rough == null ? .14 : o.rough) * n)) * o.amp; }; }
function ridge(g, w, base, o, r) { const hf = hfun(w, o, r), col = o.col, a = o.a, pts = []; g.beginPath(); g.moveTo(-4, base + 1);
  for (let x = -4; x <= w + 4; x += 3) { const y = base - hf(x); pts.push([x, y]); g.lineTo(x, y); } g.lineTo(w + 4, base + 1); g.closePath();
  const top = base - o.amp, gr = g.createLinearGradient(0, top, 0, base); gr.addColorStop(0, rgb(col, a)); gr.addColorStop(.62, rgb(col, a * .5)); gr.addColorStop(1, rgb(col, o.solid ? a * .35 : 0)); g.fillStyle = gr; g.fill();
  if (o.tint) { g.save(); g.clip(); const tg = g.createLinearGradient(0, top, 0, top + o.amp * .7); tg.addColorStop(0, o.tint); tg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = tg; g.fillRect(0, top, w, o.amp); g.restore(); }
  if (o.line) { g.strokeStyle = ink(o.line); g.lineWidth = o.lw || .9; g.beginPath(); let on = false; for (const [x, y] of pts) { if (base - y > 2) { on ? g.lineTo(x, y) : g.moveTo(x, y); on = true; } else on = false; } g.stroke(); }
  if (o.dabs) { g.strokeStyle = ink(o.dabs); g.lineWidth = .7; for (let i = 0; i < pts.length; i += 2) { const [x, y] = pts[i], hh = base - y; if (hh < 5 || r() < .35) continue; g.beginPath(); g.moveTo(x, y + 1.5); g.quadraticCurveTo(x + (r() - .6) * 3, y + hh * .2, x + (r() - .5) * 5, y + 3 + r() * hh * .38); g.stroke(); } }
  if (o.snow) { const thr = o.amp * .55; g.beginPath(); for (const [x, y] of pts) g.lineTo(x, y); for (let i = pts.length - 1; i >= 0; i--) { const [x, y] = pts[i], d = Math.max(0, (base - y) - thr); g.lineTo(x, y + d * .42 + .6); } g.closePath(); g.fillStyle = pap(.82); g.fill(); }
  return { hf, pts }; }

/* ─────────── 나무 ─────────── */
function pine(g, x, y, k, r, col) { g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = ink(.85); g.lineWidth = 1.6; const lean = (r() - .5) * 6;
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-3 + lean * .3, -9, lean * .6, -18); g.stroke(); g.fillStyle = col || ink(.82);
  for (let i = 0; i < 4; i++) { const yy = -7 - i * 4.2, ww = 9 - i * 1.8 + r() * 2.5; g.beginPath(); g.ellipse(lean * (.2 + i * .12) + (r() - .5) * 3, yy, ww, 1.9, (r() - .5) * .3, 0, TAU); g.fill(); } g.restore(); }
function clump(g, x, y, k, r, col, n) { g.save(); g.fillStyle = col; for (let i = 0; i < (n || 14); i++) { const a = r() * TAU, d = r() * 5 * k; dot(g, x + Math.cos(a) * d * 1.3, y - 5 * k + Math.sin(a) * d * .8, (1 + r() * 1.3) * k); }
  g.strokeStyle = ink(.7); g.lineWidth = .8 * k; ln(g, x, y, x + (r() - .5) * k, y - 4 * k); g.restore(); }
function willow(g, x, y, k, r, col) { g.save(); g.strokeStyle = ink(.8); g.lineWidth = 1.3 * k; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 2 * k, y - 8 * k, x + k, y - 15 * k); g.stroke();
  g.strokeStyle = col || 'rgba(70,98,74,.75)'; g.lineWidth = .6 * k; for (let i = 0; i < 16; i++) { const sx = x + (r() - .5) * 12 * k, sy = y - 15 * k + (r() - .3) * 3 * k; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + 2 * k, sy + 4 * k, sx + (r() - .5) * 2 * k, sy + (6 + r() * 7) * k); g.stroke(); } g.restore(); }
function conifer(g, x, y, k, r, snow) { g.save(); g.fillStyle = 'rgba(30,42,40,.86)'; const hh = (13 + r() * 6) * k; g.beginPath(); g.moveTo(x, y - hh);
  for (let i = 1; i <= 4; i++) { const yy = y - hh + hh * i / 4.4, ww = (1.2 + i * 1.3) * k; g.lineTo(x + ww, yy); g.lineTo(x + ww * .45, yy - .5 * k); } for (let i = 4; i >= 1; i--) { const yy = y - hh + hh * i / 4.4, ww = (1.2 + i * 1.3) * k; g.lineTo(x - ww * .45, yy - .5 * k); g.lineTo(x - ww, yy); } g.closePath(); g.fill();
  g.strokeStyle = ink(.8); g.lineWidth = .8 * k; ln(g, x, y, x, y - 3 * k); if (snow) { g.strokeStyle = pap(.9); g.lineWidth = .9 * k; for (let i = 1; i <= 4; i++) { const yy = y - hh + hh * i / 4.4, ww = (1.2 + i * 1.3) * k; ln(g, x - ww * .7, yy - .6 * k, x + ww * .5, yy - .8 * k); } } g.restore(); }
function palm(g, x, y, k, r) { g.save(); g.strokeStyle = ink(.85); g.lineWidth = 1.4 * k; const bend = (r() - .5) * 8 * k, tx = x + bend, ty = y - 16 * k; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + bend * .2, y - 9 * k, tx, ty); g.stroke();
  g.strokeStyle = 'rgba(40,66,52,.85)'; g.lineWidth = 1.1 * k; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .48 + (r() - .5) * .2, L = (7 + r() * 3) * k; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * L * .6, ty + Math.sin(a) * L * .6 - 2 * k, tx + Math.cos(a) * L, ty + Math.sin(a) * L + 3 * k); g.stroke();
    g.lineWidth = .5 * k; for (let j = 2; j < 6; j++) { const q = j / 6, px = tx + Math.cos(a) * L * q, py = ty + Math.sin(a) * L * q - 1.5 * k * Math.sin(q * Math.PI); ln(g, px, py, px + Math.cos(a + 1.2) * 2 * k, py + 2 * k); } g.lineWidth = 1.1 * k; } g.restore(); }
function reeds(g, x0, x1, y, k, r) { g.save(); g.strokeStyle = 'rgba(70,72,50,.7)'; g.lineWidth = .6 * k; for (let x = x0; x < x1; x += (1.2 + r() * 2) * k) { const hh = (4 + r() * 7) * k, b = (r() - .4) * 3 * k; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + b * .3, y - hh * .6, x + b, y - hh); g.stroke(); if (r() < .3) { g.fillStyle = 'rgba(150,130,90,.7)'; g.beginPath(); g.ellipse(x + b, y - hh - k, .7 * k, 1.8 * k, b * .1, 0, TAU); g.fill(); } } g.restore(); }
/* 계절 나무 색 — 0 겨울 · 1 봄 · 2 여름 · 3 가을 */
const LEAF = [['rgba(48,58,56,.75)', 'rgba(90,100,96,.6)'], ['rgba(62,96,74,.7)', 'rgba(214,160,154,.85)'], ['rgba(46,86,62,.8)', 'rgba(70,110,80,.7)'], ['rgba(150,82,44,.8)', 'rgba(196,148,60,.75)']];
function trees(g, x0, x1, top, k, r, season, kind, dens) { for (let x = x0; x < x1; x += (6 + r() * 9) * k / (dens || 1)) { const y = top(x) + 1; if (!isFinite(y)) continue;
    if (kind === 'pine') pine(g, x, y, k * (.55 + r() * .3), r); else if (kind === 'conifer') conifer(g, x, y, k * (.5 + r() * .3), r, season === 0); else if (kind === 'palm') palm(g, x, y, k * (.6 + r() * .3), r);
    else clump(g, x, y, k * (.8 + r() * .5), r, LEAF[season][r() < .5 ? 0 : 1]); } }

/* ─────────── 집 ─────────── */
/* roof — tile(기와, 치미), bark(bark roof, 신전 장식), thatch(초가), rope(새끼줄 그물 초가) */
function roof(g, x, yE, W, Hr, st, o = {}) { const ov = W * (st === 'thatch' || st === 'rope' ? .06 : .16), L = x - W / 2 - ov, R = x + W / 2 + ov, lift = st === 'tile' ? Hr * .28 : st === 'bark' ? Hr * .06 : 0, rt = yE - Hr, rw = W * (st === 'bark' ? .5 : .3);
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (st === 'thatch' || st === 'rope') { g.beginPath(); g.moveTo(L, yE + Hr * .1); g.bezierCurveTo(L + W * .05, rt + Hr * .1, x - W * .25, rt, x, rt); g.bezierCurveTo(x + W * .25, rt, R - W * .05, rt + Hr * .1, R, yE + Hr * .1); g.closePath();
    const gr = g.createLinearGradient(0, rt, 0, yE); gr.addColorStop(0, o.snow ? '#efe9dc' : '#c2ad7c'); gr.addColorStop(1, o.snow ? '#cfc9bb' : '#8f7a52'); g.fillStyle = gr; g.fill(); g.strokeStyle = ink(.75); g.lineWidth = .8; g.stroke();
    g.save(); g.clip(); g.strokeStyle = ink(.25); g.lineWidth = .5; for (let i = 0; i < W / 2; i++) { const xx = L + (R - L) * i / (W / 2); ln(g, xx, yE + 2, xx + (xx - x) * .15, rt); }
    if (st === 'rope') { g.strokeStyle = ink(.45); g.lineWidth = .6; for (let i = 1; i < 4; i++) { const yy = rt + (yE - rt) * i / 4; ln(g, L, yy + Hr * .05, R, yy + Hr * .05); } for (let i = 1; i < 7; i++) { const xx = L + (R - L) * i / 7; g.beginPath(); g.moveTo(x + (xx - x) * .3, rt); g.quadraticCurveTo(xx, rt + Hr * .4, xx + (xx - x) * .1, yE + Hr * .1); g.stroke(); } }
    g.restore(); return; }
  const path = () => { g.beginPath(); g.moveTo(L, yE - lift); g.quadraticCurveTo(x - W * .3, yE + Hr * .04, x, yE + Hr * .04); g.quadraticCurveTo(x + W * .3, yE + Hr * .04, R, yE - lift);
    g.quadraticCurveTo(x + rw + (R - x - rw) * .35, yE - Hr * .45, x + rw, rt); g.lineTo(x - rw, rt); g.quadraticCurveTo(x - rw - (x - rw - L) * .35, yE - Hr * .45, L, yE - lift); g.closePath(); };
  path(); const gr = g.createLinearGradient(0, rt, 0, yE); if (st === 'bark') { gr.addColorStop(0, o.snow ? '#e8e2d4' : '#6d5139'); gr.addColorStop(1, o.snow ? '#b9b3a6' : '#3e2c20'); } else { gr.addColorStop(0, o.snow ? '#ebe6da' : '#3a4342'); gr.addColorStop(1, o.snow ? '#a9aaa2' : '#1d2526'); }
  g.fillStyle = gr; g.fill(); g.strokeStyle = ink(.9); g.lineWidth = .9; g.stroke();
  g.save(); path(); g.clip(); g.strokeStyle = st === 'bark' ? 'rgba(20,12,6,.3)' : (o.snow ? ink(.18) : pap(.16)); g.lineWidth = .55; const n = Math.max(6, Math.round(W / 2.2)); for (let i = 1; i < n; i++) { const xx = L + (R - L) * i / n; ln(g, x + (xx - x) * (rw / (W / 2 + ov)), rt, xx, yE + 2); } g.restore();
  if (st === 'bark' && o.thick !== false) { g.strokeStyle = ink(.85); g.lineWidth = 1.4; g.beginPath(); g.moveTo(L, yE - lift); g.quadraticCurveTo(x, yE + Hr * .1, R, yE - lift); g.stroke(); }
  g.strokeStyle = ink(.95); g.lineWidth = Math.max(1.2, Hr * .14); ln(g, x - rw - .5, rt, x + rw + .5, rt);
  if (o.chimi) { g.fillStyle = ink(.95); for (const s of [-1, 1]) { const cx = x + s * (rw + .4); g.beginPath(); g.moveTo(cx, rt + .5); g.quadraticCurveTo(cx - s * Hr * .05, rt - Hr * .45, cx + s * Hr * .22, rt - Hr * .5); g.quadraticCurveTo(cx - s * Hr * .02, rt - Hr * .2, cx - s * Hr * .22, rt + .5); g.fill(); } }
  if (o.chigi) { g.strokeStyle = ink(.9); g.lineWidth = Math.max(.9, Hr * .1); for (const s of [-1, 1]) { const cx = x + s * rw; ln(g, cx - s * Hr * .1, rt + Hr * .15, cx + s * Hr * .35, rt - Hr * .5); }
    g.fillStyle = K.bark; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(x + i * rw * .38, rt - Hr * .06, Hr * .07, Hr * .1, 0, 0, TAU); g.fill(); } } }
/* 전각 — 기단·기둥·벽·roof. o.tier 2면 두 겹, o.stilts면 높은 마루 */
function hall(g, x, y, k, o = {}) { const W = (o.w || 26) * k, Hw = (o.wall || 8) * k, Hr = (o.roof || 8) * k, st = o.style || 'tile'; g.save(); g.lineCap = 'round'; let base = y;
  if (o.stilts) { const sh = o.stilts * k; g.strokeStyle = ink(.85); g.lineWidth = Math.max(.8, .9 * k); for (let i = 0; i <= 4; i++) { const px = x - W * .4 + W * .8 * i / 4; ln(g, px, y, px, y - sh); } if (o.stair) { g.lineWidth = Math.max(.7, .6 * k); g.beginPath(); g.moveTo(x - W * .1, y - sh); g.lineTo(x - W * .1 - o.stair * k, y); g.moveTo(x + W * .05, y - sh); g.lineTo(x + W * .05 - o.stair * k, y); g.stroke(); for (let i = 1; i < 8; i++) { const q = i / 8; ln(g, x - W * .1 - o.stair * k * q, y - sh * (1 - q), x + W * .05 - o.stair * k * q, y - sh * (1 - q)); } }
    base = y - sh; g.fillStyle = K.wood; g.fillRect(x - W * .48, base - 1.4 * k, W * .96, 1.6 * k); base -= 1.4 * k; }
  else if (st === 'tile' || o.plinth) { const ph = 2.2 * k; g.fillStyle = '#cfc5aa'; g.fillRect(x - W * .48, y - ph, W * .96, ph); g.strokeStyle = ink(.6); g.lineWidth = .6; g.strokeRect(x - W * .48, y - ph, W * .96, ph); base = y - ph; }
  g.fillStyle = o.wallCol || K.wall; g.fillRect(x - W * .42, base - Hw, W * .84, Hw);
  const n = o.bays || Math.max(3, Math.round(W / (6.5 * k))); g.strokeStyle = st === 'tile' ? (o.pillar || K.pillar) : K.wood; g.lineWidth = Math.max(.8, .95 * k);
  for (let i = 0; i <= n; i++) { const px = x - W * .42 + W * .84 * i / n; ln(g, px, base, px, base - Hw); }
  g.fillStyle = 'rgba(30,26,22,.55)'; for (let i = 0; i < n; i++) { if (i !== Math.floor(n / 2) && !o.windows) continue; const px = x - W * .42 + W * .84 * i / n; g.fillRect(px + W * .84 / n * .22, base - Hw * .78, W * .84 / n * .56, Hw * .78); }
  if (st === 'tile') { g.fillStyle = K.dg; g.fillRect(x - W * .42, base - Hw - .2 * k, W * .84, 1.1 * k); g.fillStyle = K.dr; g.fillRect(x - W * .42, base - Hw + .9 * k, W * .84, .45 * k); }
  roof(g, x, base - Hw, W, Hr, st, o);
  if (o.tier === 2) { const W2 = W * .66, H2 = Hw * .62, b2 = base - Hw - Hr * .55; g.fillStyle = o.wallCol || K.wall; g.fillRect(x - W2 * .42, b2 - H2, W2 * .84, H2); g.strokeStyle = st === 'tile' ? K.pillar : K.wood; g.lineWidth = Math.max(.7, .8 * k); for (let i = 0; i <= 3; i++) { const px = x - W2 * .42 + W2 * .84 * i / 3; ln(g, px, b2, px, b2 - H2); } if (st === 'tile') { g.fillStyle = K.dg; g.fillRect(x - W2 * .42, b2 - H2 - .2 * k, W2 * .84, k); } roof(g, x, b2 - H2, W2, Hr * .85, st, o); }
  g.restore(); }
/* 불교 건축 — brick(당의 벽돌), wood(나무), stone(신라 돌) */
function pagoda(g, x, y, k, st, n) { g.save(); g.lineJoin = 'round';
  if (st === 'brick') { n = n || 11; const W0 = 9 * k, body = 9 * k; g.fillStyle = '#d9cfb6'; g.strokeStyle = ink(.8); g.lineWidth = .7; g.fillRect(x - W0 * .7, y - 2 * k, W0 * 1.4, 2 * k); g.fillRect(x - W0 * .5, y - 2 * k - body, W0, body); g.strokeRect(x - W0 * .5, y - 2 * k - body, W0, body); g.fillStyle = 'rgba(30,26,22,.6)'; g.fillRect(x - 1.2 * k, y - 2 * k - body * .62, 2.4 * k, body * .4);
    let yy = y - 2 * k - body; for (let i = 0; i < n; i++) { const q = i / n, ww = W0 * (1.15 - .55 * q * q), hh = (3.4 - 1.6 * q) * k; g.fillStyle = '#d4c9ae'; g.fillRect(x - ww * .42, yy - hh, ww * .84, hh); g.strokeStyle = ink(.5); g.lineWidth = .5; g.strokeRect(x - ww * .42, yy - hh, ww * .84, hh); g.fillStyle = ink(.88); g.beginPath(); g.moveTo(x - ww * .62, yy - hh + .4 * k); g.lineTo(x + ww * .62, yy - hh + .4 * k); g.lineTo(x + ww * .45, yy - hh - .9 * k); g.lineTo(x - ww * .45, yy - hh - .9 * k); g.closePath(); g.fill(); yy -= hh + .9 * k; }
    g.strokeStyle = ink(.9); g.lineWidth = 1.1 * k * .7; ln(g, x, yy, x, yy - 5 * k); g.fillStyle = ink(.9); dot(g, x, yy - 1.5 * k, 1.1 * k); }
  else if (st === 'wood') { n = n || 5; let yy = y; g.fillStyle = '#cfc5aa'; g.fillRect(x - 8 * k, y - 1.6 * k, 16 * k, 1.6 * k); yy -= 1.6 * k; for (let i = 0; i < n; i++) { const q = i / n, ww = (12 - 5 * q) * k, hh = (5.6 - 1.2 * q) * k; g.fillStyle = K.wall; g.fillRect(x - ww * .34, yy - hh, ww * .68, hh); g.strokeStyle = K.pillar; g.lineWidth = Math.max(.6, .6 * k); ln(g, x - ww * .34, yy, x - ww * .34, yy - hh); ln(g, x + ww * .34, yy, x + ww * .34, yy - hh); ln(g, x, yy, x, yy - hh);
      roof(g, x, yy - hh, ww * 1.05, 3.4 * k, 'tile', {}); yy -= hh + 2.4 * k; }
    g.strokeStyle = ink(.9); g.lineWidth = .9; ln(g, x, yy + 2 * k, x, yy - 9 * k); for (let i = 0; i < 6; i++) ln(g, x - 1.3 * k, yy - i * 1.3 * k, x + 1.3 * k, yy - i * 1.3 * k); }
  else { n = n || 3; let yy = y; g.fillStyle = '#d8d2c2'; g.strokeStyle = ink(.7); g.lineWidth = .6; g.fillRect(x - 6 * k, yy - 3 * k, 12 * k, 3 * k); g.strokeRect(x - 6 * k, yy - 3 * k, 12 * k, 3 * k); yy -= 3 * k;
    for (let i = 0; i < n; i++) { const ww = (8 - i * 1.4) * k, hh = (i === 0 ? 5 : 2.6) * k; g.fillStyle = '#e1dccd'; g.fillRect(x - ww / 2, yy - hh, ww, hh); g.strokeRect(x - ww / 2, yy - hh, ww, hh); yy -= hh; g.fillStyle = '#b9b3a3'; g.beginPath(); g.moveTo(x - ww * .78, yy); g.lineTo(x + ww * .78, yy); g.lineTo(x + ww * .58, yy - 1.4 * k); g.lineTo(x - ww * .58, yy - 1.4 * k); g.closePath(); g.fill(); g.stroke(); yy -= 1.4 * k; }
    g.strokeStyle = ink(.8); g.lineWidth = .9; ln(g, x, yy, x, yy - 4 * k); }
  g.restore(); }
function cityWall(g, x0, x1, y, hh, k, o = {}) { g.save(); const gr = g.createLinearGradient(0, y - hh, 0, y); gr.addColorStop(0, o.earth ? '#b8a684' : '#c9c1aa'); gr.addColorStop(1, o.earth ? '#94825f' : '#a49c86'); g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + hh * .12, y - hh); g.lineTo(x1 - hh * .12, y - hh); g.lineTo(x1, y); g.closePath(); g.fill(); g.strokeStyle = ink(.7); g.lineWidth = .8; g.stroke();
  g.strokeStyle = ink(.16); g.lineWidth = .5; for (let yy = y - hh + 2.2 * k; yy < y; yy += 2.2 * k) ln(g, x0 + 2, yy, x1 - 2, yy);
  if (!o.earth) { g.fillStyle = '#b4ab93'; for (let x = x0 + hh * .12; x < x1 - hh * .12 - 2 * k; x += 3.4 * k) { g.fillRect(x, y - hh - 1.8 * k, 2 * k, 1.8 * k); g.strokeStyle = ink(.5); g.strokeRect(x, y - hh - 1.8 * k, 2 * k, 1.8 * k); } }
  if (o.gate) { const gx = o.gate, gw = 5 * k; g.fillStyle = 'rgba(25,22,18,.8)'; g.beginPath(); g.moveTo(gx - gw / 2, y); g.lineTo(gx - gw / 2, y - hh * .55); g.quadraticCurveTo(gx, y - hh * .85, gx + gw / 2, y - hh * .55); g.lineTo(gx + gw / 2, y); g.fill(); hall(g, gx, y - hh, k * .9, { w: 22, wall: 5, roof: 6, tier: o.tier || 1, chimi: true, bays: 4 }); }
  g.restore(); }
function palisade(g, x0, x1, y, hh, k, r, a) { g.save(); g.strokeStyle = ink(a || .85); g.lineCap = 'butt'; for (let x = x0; x < x1; x += (1.5 + r() * .6) * k) { const t = hh * (.8 + r() * .35); g.lineWidth = Math.max(.7, k * .9); ln(g, x, y, x + (r() - .5) * .6, y - t); g.fillStyle = ink(a || .85); g.beginPath(); g.moveTo(x - k * .45, y - t); g.lineTo(x, y - t - k * 1.1); g.lineTo(x + k * .45, y - t); g.fill(); }
  g.lineWidth = .7; ln(g, x0, y - hh * .35, x1, y - hh * .38); ln(g, x0, y - hh * .72, x1, y - hh * .74); g.restore(); }
function tower(g, x, y, k, flag) { g.save(); g.strokeStyle = ink(.85); g.lineWidth = Math.max(.8, .8 * k); const hh = 20 * k; ln(g, x - 5 * k, y, x - 3 * k, y - hh); ln(g, x + 5 * k, y, x + 3 * k, y - hh); ln(g, x - 4.6 * k, y - hh * .3, x + 4.2 * k, y - hh * .65); ln(g, x + 4.6 * k, y - hh * .3, x - 4.2 * k, y - hh * .65);
  g.fillStyle = K.wood; g.fillRect(x - 5 * k, y - hh - 1.5 * k, 10 * k, 1.5 * k); g.strokeStyle = ink(.7); ln(g, x - 4 * k, y - hh - 1.5 * k, x - 4 * k, y - hh - 5 * k); ln(g, x + 4 * k, y - hh - 1.5 * k, x + 4 * k, y - hh - 5 * k); roof(g, x, y - hh - 5 * k, 9 * k, 3.5 * k, 'tile', {});
  if (flag) { g.strokeStyle = ink(.85); g.lineWidth = .8; ln(g, x, y - hh - 8 * k, x, y - hh - 16 * k); g.fillStyle = flag; g.beginPath(); g.moveTo(x, y - hh - 16 * k); g.quadraticCurveTo(x + 4 * k, y - hh - 15 * k, x + 8 * k, y - hh - 14.5 * k); g.lineTo(x + 7 * k, y - hh - 12.5 * k); g.quadraticCurveTo(x + 4 * k, y - hh - 13 * k, x, y - hh - 12 * k); g.fill(); } g.restore(); }
function banner(g, x, y, k, col, h) { g.save(); g.strokeStyle = ink(.85); g.lineWidth = Math.max(.6, .6 * k); const hh = (h || 14) * k; ln(g, x, y, x, y - hh); g.fillStyle = col; g.beginPath(); g.moveTo(x, y - hh); g.lineTo(x + 3.2 * k, y - hh); g.lineTo(x + 3.2 * k, y - hh + 8 * k); g.lineTo(x + 1.6 * k, y - hh + 6.8 * k); g.lineTo(x, y - hh + 8 * k); g.closePath(); g.fill(); g.restore(); }
function pier(g, x0, x1, y, k, r, night) { g.save(); g.fillStyle = night ? '#2d2a26' : '#6a5440'; g.fillRect(x0, y - 1.2 * k, x1 - x0, 1.6 * k); g.strokeStyle = ink(.8); g.lineWidth = Math.max(.7, .7 * k); for (let x = x0 + 1; x < x1; x += 5 * k) { ln(g, x, y - 1.2 * k, x, y + 4 * k); g.strokeStyle = ink(.2); ln(g, x, y + 5 * k, x, y + 7 * k); g.strokeStyle = ink(.8); } g.restore(); }
function smoke(g, x, y, k, r, a, h) { g.save(); for (let i = 0; i < 9; i++) { const q = i / 9, xx = x + Math.sin(q * 4 + r()) * 3 * k + q * q * 14 * k, yy = y - q * (h || 30) * k; g.fillStyle = `rgba(110,112,104,${(a || .22) * (1 - q)})`; g.beginPath(); g.ellipse(xx, yy, (2.5 + q * 6) * k, (2 + q * 3) * k, 0, 0, TAU); g.fill(); } g.restore(); }
function birds(g, x, y, k, n, r) { g.save(); g.strokeStyle = ink(.7); g.lineWidth = Math.max(.7, .8 * k); for (let i = 0; i < n; i++) { const bx = x + (r() - .5) * 40 * k, by = y + (r() - .5) * 12 * k, s = (.7 + r() * .5) * k; g.beginPath(); g.moveTo(bx - 5 * s, by - 1.5 * s); g.quadraticCurveTo(bx - 2 * s, by - 3 * s, bx, by); g.quadraticCurveTo(bx + 2 * s, by - 3 * s, bx + 5 * s, by - 1.5 * s); g.stroke(); } g.restore(); }

/* ─────────── 사람 — 먹 그림자 ─────────── */
/* pose: stand · wave · row · sit · fight · carry · lie. hat: top · kasa · bok · hood */
function person(g, x, y, k, o = {}) { const p = o.pose || 'stand', c = o.col || ink(.9); g.save(); g.translate(x, y); if (o.flip) g.scale(-1, 1); g.fillStyle = c; g.strokeStyle = c; g.lineCap = 'round'; g.lineWidth = 1.3 * k;
  const s = o.child ? .72 : 1, H = 14 * k * s;
  if (p === 'lie') { g.beginPath(); g.ellipse(0, -1.6 * k, 7 * k, 2 * k, 0, 0, TAU); g.fill(); dot(g, -8 * k, -2.4 * k, 1.9 * k); if (o.cloth) { g.fillStyle = o.cloth; g.beginPath(); g.ellipse(1 * k, -2.2 * k, 6 * k, 2 * k, 0, 0, TAU); g.fill(); } g.restore(); return; }
  const sit = p === 'sit' || p === 'row', hip = sit ? -3 * k : -H * .45, sh = sit ? -H * .62 : -H * .82, hx = 0;
  g.beginPath(); g.moveTo(-2.4 * k * s, hip + (sit ? 0 : 2 * k)); g.lineTo(-1.5 * k * s, sh); g.lineTo(1.5 * k * s, sh); g.lineTo(2.6 * k * s, hip + (sit ? 0 : 2 * k)); g.closePath(); g.fill();
  if (o.robe) { g.fillStyle = o.robe; g.beginPath(); g.moveTo(-2 * k * s, hip + (sit ? -.3 * k : 1.6 * k)); g.lineTo(-1.2 * k * s, sh + 1.2 * k); g.lineTo(1.2 * k * s, sh + 1.2 * k); g.lineTo(2.2 * k * s, hip + (sit ? -.3 * k : 1.6 * k)); g.closePath(); g.fill(); g.fillStyle = c; }
  if (sit) { ln(g, -1.5 * k, hip, 3 * k, hip + .5 * k); ln(g, 3 * k, hip + .5 * k, 3.4 * k, 0); } else { ln(g, -1 * k * s, hip + 1.5 * k, -1.6 * k * s, 0); ln(g, 1 * k * s, hip + 1.5 * k, 1.8 * k * s, 0); }
  const hy = sh - 2.2 * k * s; dot(g, hx, hy, 1.9 * k * s);
  const hat = o.hat || 'top'; if (hat === 'top') dot(g, hx - .3 * k, hy - 2 * k * s, .9 * k); else if (hat === 'kasa') { g.beginPath(); g.moveTo(hx - 4 * k, hy - .6 * k); g.lineTo(hx, hy - 3.6 * k); g.lineTo(hx + 4 * k, hy - .6 * k); g.closePath(); g.fill(); } else if (hat === 'bok') { g.fillRect(hx - 1.8 * k, hy - 3.6 * k, 3.6 * k, 2.4 * k); ln(g, hx - 1.8 * k, hy - 2.6 * k, hx - 4.6 * k, hy - 2.2 * k); ln(g, hx + 1.8 * k, hy - 2.6 * k, hx + 4.6 * k, hy - 2.2 * k); } else if (hat === 'hood') { g.beginPath(); g.ellipse(hx, hy - .3 * k, 2.5 * k, 2.6 * k, 0, Math.PI, TAU); g.fill(); ln(g, hx - 2.4 * k, hy, hx - 2 * k, sh + 3 * k); }
  const A = { stand: [[-2.2, 3.5], [2.2, 3.5]], wave: [[-2.2, 3.5], [3.5, -4.5]], row: [[4.5, 1], [4.8, .2]], sit: [[2.5, 2], [3, 1.6]], fight: [[4.5, -1.5], [-3.5, -3]], carry: [[2.5, -3], [-1.5, -3]], point: [[5, -1], [-1.8, 3]], beg: [[3.8, 0], [3.8, .8]] }[p] || [[-2.2, 3.5], [2.2, 3.5]];
  g.lineWidth = 1 * k; for (const [dx, dy] of A) ln(g, (dx > 0 ? 1.2 : -1.2) * k * s, sh + 1 * k, dx * k * s, sh + 1 * k + dy * k * s + 3 * k);
  if (o.oar) { g.lineWidth = .8 * k; g.strokeStyle = ink(.8); ln(g, 4.5 * k, sh + 4 * k, 12 * k, 4 * k); }
  if (o.blade) { g.lineWidth = .8 * k; g.strokeStyle = ink(.95); ln(g, 4.5 * k, sh + 2 * k, 9 * k, sh - 4 * k); }
  if (o.load) { g.fillStyle = o.load; g.fillRect(-3 * k, sh - 6.5 * k, 6 * k, 4 * k); g.strokeStyle = ink(.8); g.lineWidth = .6; g.strokeRect(-3 * k, sh - 6.5 * k, 6 * k, 4 * k); }
  g.restore(); }

/* ─────────── 배 — 먼 배(작게) ─────────── */
/* type: silla(대나무 살 돛) · junk(당 큰배, 높은 고물) · wa(거적 돛) · dhow(세모 돛) · skiff(노 젓는 거룻배) · raft(테우) */
function boat(g, x, y, k, type, dir, o = {}) { g.save(); g.translate(x, y); g.scale(dir || 1, 1); g.lineJoin = 'round'; g.lineCap = 'round'; const L = (type === 'junk' ? 30 : type === 'skiff' || type === 'raft' ? 14 : type === 'dhow' ? 24 : 24) * k, night = o.night;
  g.fillStyle = ink(.12); g.beginPath(); g.ellipse(0, 1.5 * k, L * .55, 1.4 * k, 0, 0, TAU); g.fill();
  const hullC = o.hull || (night ? '#1e2526' : '#3d2c1f');
  if (type === 'raft') { g.fillStyle = '#6a5440'; g.fillRect(-L / 2, -1.6 * k, L, 1.8 * k); g.strokeStyle = ink(.6); g.lineWidth = .5; for (let i = -L / 2; i < L / 2; i += 2 * k) ln(g, i, -1.6 * k, i, .2 * k); if (o.crew !== 0) person(g, -1 * k, -1.6 * k, k * .5, { pose: 'row', oar: true }); g.restore(); return; }
  g.beginPath(); if (type === 'junk') { g.moveTo(-L * .5, -6 * k); g.lineTo(-L * .42, 0); g.lineTo(L * .38, 0); g.quadraticCurveTo(L * .5, -1 * k, L * .52, -4 * k); g.lineTo(L * .4, -3 * k); g.lineTo(-L * .36, -3 * k); g.lineTo(-L * .38, -6 * k); }
  else if (type === 'wa') { g.moveTo(-L * .5, -3.6 * k); g.quadraticCurveTo(-L * .46, 0, -L * .3, 0); g.lineTo(L * .36, 0); g.quadraticCurveTo(L * .5, -.5 * k, L * .55, -4.2 * k); g.lineTo(L * .4, -2.4 * k); g.lineTo(-L * .4, -2.4 * k); }
  else { g.moveTo(-L * .5, -3.8 * k); g.quadraticCurveTo(-L * .48, -.2 * k, -L * .36, 0); g.lineTo(L * .34, 0); g.quadraticCurveTo(L * .48, -.4 * k, L * .54, -4.2 * k); g.lineTo(L * .44, -2.6 * k); g.lineTo(-L * .42, -2.6 * k); }
  g.closePath(); g.fillStyle = hullC; g.fill(); g.strokeStyle = ink(.9); g.lineWidth = .7; g.stroke();
  if (type !== 'skiff') { g.strokeStyle = o.trim || (type === 'junk' ? K.ju2 : type === 'wa' ? '#3a2a1c' : K.ju); g.lineWidth = Math.max(.6, .55 * k); ln(g, -L * .4, -2.6 * k, L * .42, -2.6 * k); }
  if (type === 'wa') { g.strokeStyle = ink(.8); g.lineWidth = .5; for (let i = -2; i <= 2; i++) ln(g, i * L * .14, -2.4 * k, i * L * .14 + 1 * k, -.2 * k); g.fillStyle = '#7a6448'; g.fillRect(-L * .3, -5.6 * k, L * .3, 3.2 * k); g.strokeRect(-L * .3, -5.6 * k, L * .3, 3.2 * k); }
  const sail = o.sail || (night ? '#5c625c' : type === 'junk' ? '#9a6a48' : type === 'wa' ? '#c9b48a' : '#d8c08a');
  if (type === 'skiff') { if (o.crew !== 0) { person(g, -2 * k, -2.4 * k, k * .45, { pose: 'row', oar: true, hat: o.hat || 'kasa' }); } }
  else if (o.furled) { g.strokeStyle = ink(.9); g.lineWidth = .8; ln(g, 0, -2.6 * k, 0, -18 * k); g.fillStyle = sail; g.fillRect(-1.2 * k, -17 * k, 2.4 * k, 6 * k); }
  else if (type === 'dhow') { g.strokeStyle = ink(.9); g.lineWidth = .8; ln(g, 0, -2.6 * k, -1 * k, -16 * k); g.beginPath(); g.moveTo(-10 * k, -3.6 * k); g.lineTo(9 * k, -20 * k); g.quadraticCurveTo(4 * k, -9 * k, 7 * k, -3.6 * k); g.closePath(); g.fillStyle = o.sail || '#e6dcc4'; g.fill(); g.stroke(); ln(g, -11 * k, -2.6 * k, 10 * k, -21 * k); }
  else { const masts = type === 'junk' ? [[-L * .1, 22], [L * .2, 15]] : [[0, type === 'wa' ? 14 : 16]];
    for (const [mx, mh] of masts) { const top = -2.6 * k - mh * k; g.strokeStyle = ink(.9); g.lineWidth = .8; ln(g, mx, -2.6 * k, mx, top - 1.4 * k);
      if (type === 'wa') { const sw = mh * .5 * k; g.fillStyle = sail; g.fillRect(mx - sw / 2, top + 1 * k, sw, mh * .7 * k); g.strokeStyle = ink(.55); g.lineWidth = .45; g.strokeRect(mx - sw / 2, top + 1 * k, sw, mh * .7 * k); for (let i = 1; i < 4; i++) ln(g, mx - sw / 2 + sw * i / 4, top + 1 * k, mx - sw / 2 + sw * i / 4, top + 1 * k + mh * .7 * k); for (let i = 1; i < 4; i++) ln(g, mx - sw / 2, top + 1 * k + mh * .7 * k * i / 4, mx + sw / 2, top + 1 * k + mh * .7 * k * i / 4); }
      else { const bot = -5 * k, lb = mx - mh * .42 * k, lt = mx - mh * .32 * k; g.beginPath(); g.moveTo(mx + .5, top + .6 * k); g.lineTo(mx + .5, bot); g.lineTo(lb, bot + .2 * k); g.quadraticCurveTo(lb - 1.8 * k, (top + bot) / 2, lt, top + 1.4 * k); g.closePath(); g.fillStyle = sail; g.fill(); g.strokeStyle = ink(.85); g.lineWidth = .6; g.stroke(); g.lineWidth = .45; g.strokeStyle = ink(.5); for (let i = 1; i < 5; i++) { const yy = top + (bot - top) * i / 5; ln(g, mx, yy, lb - .6 * k, yy + .3 * k); } } }
    if (o.flag) { g.fillStyle = o.flag; const mx = masts[0][0], top = -2.6 * k - masts[0][1] * k - 1.4 * k; g.beginPath(); g.moveTo(mx, top); g.lineTo(mx - 5 * k, top + .8 * k); g.lineTo(mx, top + 2.2 * k); g.fill(); } }
  if (o.lamp) { g.fillStyle = 'rgba(232,170,80,.9)'; dot(g, -L * .42, -6 * k, 1.1 * k); g.fillStyle = 'rgba(232,170,80,.18)'; dot(g, -L * .42, -6 * k, 4 * k); }
  g.restore();
  g.strokeStyle = night ? 'rgba(200,210,200,.18)' : pap(.5); g.lineWidth = .7; ln(g, x - L * .5, y + 2.2 * k, x + L * .45, y + 2.2 * k); }

/* ─────────── 땅 — 물가 언덕(먹 번짐) ─────────── */
/* 땅의 위 선 함수를 돌려준다: 건물·나무를 그 위에 세운다 */
function land(g, w, base, o, r, m) { const hf = hfun(w, o, r), flat = o.flat || [], top = x => { let v = hf(x); for (const [a, b, hh] of flat) { const f = Math.max(0, Math.min(1, Math.min(x - a, b - x) / (w * .04) + .5)); v = v * (1 - f) + hh * f; } return base - v; };
  const pts = []; g.beginPath(); g.moveTo(-4, base + 2); for (let x = -4; x <= w + 4; x += 2.5) { const y = top(x); pts.push([x, y]); g.lineTo(x, y); } g.lineTo(w + 4, base + 2); g.closePath();
  const night = m && m.night, col = o.col || (night ? [28, 34, 34] : [74, 92, 86]), amp = o.amp, gr = g.createLinearGradient(0, base - amp, 0, base); gr.addColorStop(0, rgb(col, night ? .95 : .62)); gr.addColorStop(.5, rgb(col, night ? .85 : .38)); gr.addColorStop(1, rgb(col, night ? .7 : .2));
  g.fillStyle = night ? '#2a3132' : '#e4dcc6'; g.fill(); g.fillStyle = gr; g.fill();
  if (o.tint && !night) { g.save(); g.clip(); const tg = g.createLinearGradient(0, base - amp, 0, base - amp * .2); tg.addColorStop(0, o.tint); tg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = tg; g.fillRect(0, base - amp, w, amp); g.restore(); }
  g.strokeStyle = ink(night ? .5 : .75); g.lineWidth = 1.1; g.beginPath(); let on = false; for (const [x, y] of pts) { if (base - y > 1.5) { on ? g.lineTo(x, y) : g.moveTo(x, y); on = true; } else on = false; } g.stroke();
  g.strokeStyle = ink(.28); g.lineWidth = .7; for (let i = 0; i < pts.length; i += 3) { const [x, y] = pts[i], hh = base - y; if (hh < 6 || r() < .4) continue; g.beginPath(); g.moveTo(x, y + 2); g.quadraticCurveTo(x + (r() - .6) * 3, y + hh * .2, x + (r() - .5) * 6, y + 4 + r() * hh * .4); g.stroke(); }
  /* 물가: 먹선 + 흰 거품 */
  g.strokeStyle = ink(.55); g.lineWidth = .9; g.beginPath(); on = false; for (const [x, y] of pts) { if (base - y > 1) { on ? g.lineTo(x, base + (r() - .5) * .8) : g.moveTo(x, base); on = true; } else on = false; } g.stroke();
  g.strokeStyle = pap(night ? .25 : .7); g.lineWidth = .9; g.beginPath(); on = false; for (const [x, y] of pts) { if (base - y > 1) { on ? g.lineTo(x, base + 2 + Math.sin(x * .3) * .5) : g.moveTo(x, base + 2); on = true; } else on = false; } g.stroke();
  return top; }

/* ═══════════ 항구 ═══════════ */
/* a: 원형(silla·tang·wa·balhae·isle·south). 나머지는 그 항구만의 것 */
const PA = {
  cheonghae: { a: 'hero' },
  dangeun:   { a: 'silla', side: 1, fort: 1, tower: 1, boats: 3 },
  ulsan:     { a: 'silla', side: -1, big: 1, rock: 1, boats: 4, dhow: 1 },
  hyeolgu:   { a: 'silla', side: 1, fort: 1, palisade: 1, tower: 1, flat: 1, boats: 2 },
  hoejin:    { a: 'silla', side: -1, reeds: 1, low: 1, boats: 2 },
  gimhae:    { a: 'silla', side: 1, mounds: 1, smithy: 1, boats: 2 },
  samcheok:  { a: 'silla', side: -1, cliff: 1, pines: 1, boats: 1 },
  jeoksan:   { a: 'tang', side: 1, temple: 1, red: 1, boats: 3, small: 1 },
  deungju:   { a: 'tang', side: -1, cliff: 1, boats: 3 },
  yangzhou:  { a: 'tang', side: 1, canal: 1, pagoda: 1, big: 1, boats: 5 },
  mingzhou:  { a: 'tang', side: -1, pagoda: 1, boats: 4 },
  quanzhou:  { a: 'tang', side: 1, dhow: 2, south: 1, boats: 3 },
  laizhou:   { a: 'tang', side: -1, hills: 1, boats: 2, small: 1 },
  mizhou:    { a: 'tang', side: 1, boats: 2, small: 1 },
  chuzhou:   { a: 'tang', side: -1, canal: 1, willows: 1, boats: 3 },
  hangzhou:  { a: 'tang', side: 1, lakehills: 1, pagoda: 1, tea: 1, boats: 3 },
  wenzhou:   { a: 'tang', side: -1, islet: 1, boats: 3 },
  fuzhou:    { a: 'tang', side: 1, tea: 1, hills: 1, south: 1, pagoda: 1, boats: 3 },
  hakata:    { a: 'wa', side: 1, korokan: 1, pinebeach: 1, boats: 3 },
  naniwa:    { a: 'wa', side: -1, wpagoda: 1, reeds: 1, boats: 3 },
  izumo:     { a: 'wa', side: 1, taisha: 1, boats: 2 },
  tsuruga:   { a: 'wa', side: -1, pinebeach: 1, korokan: 1, boats: 2 },
  satsuma:   { a: 'wa', side: 1, volcano: 1, boats: 2 },
  yeomju:    { a: 'balhae', side: 1, earth: 1, boats: 2 },
  namgyeong: { a: 'balhae', side: -1, big: 1, boats: 3 },
  tamna:     { a: 'isle', side: 1, halla: 1, boats: 2 },
  amami:     { a: 'south', side: -1, boats: 2 },
  ryukyu:    { a: 'south', side: 1, reef: 1, boats: 2 },
  jilong:    { a: 'south', side: -1, sulfur: 1, steep: 1, boats: 2 }
};
const ARCH_OF = { 신라: 'silla', 당: 'tang', 왜: 'wa', 발해: 'balhae', 탐라: 'isle', 남도: 'south' };
const TODS = ['day', 'day', 'dusk', 'dawn', 'day', 'dusk'];
/* 날씨·계절·시각을 고른다: 항구와 날짜로 정해서 같은 날 같은 그림 */
function portMood(id, t) { const C = typeof CORE !== 'undefined' ? CORE : null; const day = Math.floor(t || 0), season = C ? C.seasonOf(day) : 2;
  let tod = TODS[(hash(id) + day) % TODS.length]; try { if (C && C.S && C.liveNews && C.liveNews().some(n => n.storm)) tod = 'storm'; } catch (e) {} return { season, tod }; }

function portScene(g, w, h, id, o = {}) { const T = PA[id] || { a: 'silla' }, r = rng(hash(id) * 7 + (o.seed || 0)), season = o.season == null ? 2 : o.season, m = MOOD[o.tod || 'day'] || MOOD.day, k = Math.min(h / 120, w / 300);
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if (T.a === 'hero') { cheonghae(g, w, h, k, r, season, m); g.restore(); return; }
  const side = T.side || 1, hz = h * (T.a === 'isle' || T.a === 'south' ? .46 : .42), base = h * .76, snow = season === 0 && T.a !== 'south';
  sky(g, w, h, hz, m, r);
  if (side < 0) { g.translate(w, 0); g.scale(-1, 1); }
  /* 먼 산 */
  const farPk = T.a === 'tang' ? [[.15, 1, .1, 1.3], [.32, .7, .12, 1.3], [.55, .9, .09, 1.2], [.8, .6, .2, 1.6]] : T.a === 'wa' ? [[.2, .6, .25, 2.2], [.6, .8, .3, 2.2], [.95, .5, .2, 2]] : T.a === 'balhae' ? [[.2, 1, .14, 1.2], [.45, .85, .1, 1.1], [.75, 1, .16, 1.2]] : T.a === 'isle' ? [[.6, .5, .5, 2]] : [[.2, .8, .16, 1.5], [.5, .6, .2, 1.7], [.82, .9, .14, 1.4]];
  const farAmp = h * (T.a === 'balhae' ? .3 : T.a === 'tang' ? .28 : .2);
  ridge(g, w, hz + 1, { amp: farAmp, peaks: farPk, col: m.far, a: .42, rough: .1, snow: (snow && T.a !== 'south') || T.a === 'balhae', dabs: 0 }, r);
  if (T.volcano) { volcano(g, w * .2, hz + 1, h * .36, w * .34, m, r, true, k); }
  if (T.halla) { volcano(g, w * .55, hz + 1, h * .3, w * .9, m, r, false, k, snow); }
  if (m.mist) mist(g, w, hz - h * .04, h * .08, .55 * m.mist, r);
  sea(g, w, h, hz, m, r, { rows: 10 });
  if (T.a === 'south' || T.reef || T.south) { const sg = g.createRadialGradient(w * .7, base, 0, w * .7, base, w * .5); sg.addColorStop(0, 'rgba(120,196,180,.5)'); sg.addColorStop(1, 'rgba(120,196,180,0)'); g.save(); g.scale(1, .22); g.translate(0, base / .22 - base); g.fillStyle = sg; g.fillRect(0, base - w * .5, w, w); g.restore(); }
  /* 중경의 땅: 원형마다 모양이 다르다 */
  const A = T.a, landPk = A === 'tang' ? [[.78, 1, .26, 2.4], [.98, .8, .2, 2]] : A === 'wa' ? [[.8, 1, .3, 2.4]] : A === 'balhae' ? [[.82, 1, .28, 2]] : [[.8, 1, .26, 2], [1, .7, .2, 2]];
  const plateau = h * (T.low ? .08 : .12), amp = h * (T.cliff ? .5 : T.steep ? .56 : T.low ? .26 : .42);
  const hillPk = A === 'tang' ? [[.86, 1, .14, 1.3], [.66, .62, .1, 1.3], [1.02, .8, .1, 1.4]] : A === 'wa' ? [[.84, 1, .24, 2.2], [.62, .5, .14, 2]] : A === 'balhae' ? [[.84, 1, .16, 1.4], [.65, .7, .1, 1.4]] : [[.85, 1, .17, 1.6], [.64, .6, .12, 1.7], [1.02, .8, .1, 1.5]];
  const hill = ridge(g, w, base - plateau * .5, { amp, peaks: hillPk, col: m.mid, a: m.night ? .9 : .62, solid: 1, rough: .12, dabs: .26, line: .5, lw: 1, tint: season === 0 || m.night ? 0 : season === 3 ? 'rgba(160,96,50,.22)' : 'rgba(61,110,80,.26)', snow }, r);
  const x0 = w * (T.big ? .34 : .42), top = land(g, w, base, { amp: plateau * 1.3, rough: .3, peaks: [[.97, 1.1, .5, 2]], flat: [[x0, w * 1.02, plateau]], col: A === 'balhae' ? [70, 80, 82] : T.red ? [128, 82, 62] : null, tint: season === 2 ? 'rgba(61,110,80,.22)' : season === 3 ? 'rgba(150,100,50,.18)' : null }, r, m);
  const gy = base - plateau, kk = k * 1.25; /* 마을 바닥 */
  { const ht = x => base - plateau * .5 - hill.hf(x); trees(g, x0 + w * .1, w * 1.02, x => Math.max(ht(x), gy - plateau * 1.6), kk * .9, r, season, A === 'balhae' ? 'conifer' : A === 'south' ? 'palm' : A === 'wa' ? 'pine' : 'clump', A === 'wa' || A === 'south' ? .55 : 1.3); }
  (A === 'tang' ? townTang : A === 'wa' ? townWa : A === 'balhae' ? townBalhae : A === 'isle' ? townIsle : A === 'south' ? townSouth : townSilla)(g, w, h, gy, base, x0, kk, r, T, season, m, top);
  /* 앞바다 배 */
  const nb = T.boats || 2, bt = A === 'tang' ? 'junk' : A === 'wa' ? 'wa' : 'silla';
  for (let i = 0; i < nb; i++) { const bx = w * (.08 + .3 * i / Math.max(1, nb - 1) + r() * .05), by = base + h * (.06 + r() * .14), bk = k * (1 + (by - base) / h * 2.4); boat(g, bx, by, bk, T.dhow && i === nb - 1 ? 'dhow' : i === 0 && nb > 2 ? 'skiff' : bt, r() < .5 ? 1 : -1, { night: m.night, furled: m.night || r() < .25, lamp: m.night }); }
  if (T.dhow > 1) boat(g, w * .52, base + h * .2, k * 1.1, 'dhow', -1, {});
  if (!m.night && m !== MOOD.storm) birds(g, w * (.2 + r() * .3), hz * .45, k, 3, r);
  g.restore();
  if (m === MOOD.storm) rain(g, w, h, r, .18);
  paper(g, w, h, r, Math.round(w * h / 320)); }
function rain(g, w, h, r, a) { g.save(); g.strokeStyle = ink(a); g.lineWidth = .7; for (let i = 0; i < w * h / 260; i++) { const x = r() * w * 1.2 - w * .1, y = r() * h; ln(g, x, y, x - 4, y + 10); } g.restore(); }
function volcano(g, cx, base, hh, ww, m, r, smoke_, k, snow) { g.save(); const gr = g.createLinearGradient(0, base - hh, 0, base); gr.addColorStop(0, rgb(m.mid, .6)); gr.addColorStop(1, rgb(m.mid, .08)); g.fillStyle = gr;
  g.beginPath(); g.moveTo(cx - ww / 2, base); g.quadraticCurveTo(cx - ww * .22, base - hh * .55, cx - ww * .07, base - hh); g.lineTo(cx + ww * .07, base - hh * .98); g.quadraticCurveTo(cx + ww * .22, base - hh * .55, cx + ww / 2, base); g.closePath(); g.fill();
  g.strokeStyle = ink(.4); g.lineWidth = .9; g.beginPath(); g.moveTo(cx - ww * .4, base - hh * .12); g.quadraticCurveTo(cx - ww * .22, base - hh * .55, cx - ww * .07, base - hh); g.lineTo(cx + ww * .07, base - hh * .98); g.quadraticCurveTo(cx + ww * .22, base - hh * .55, cx + ww * .4, base - hh * .12); g.stroke();
  g.strokeStyle = ink(.2); g.lineWidth = .6; for (let i = 0; i < 14; i++) { const q = (i + .5) / 14, x = cx - ww * .07 + ww * .14 * q; ln(g, x, base - hh * .98, x + (x - cx) * 3, base - hh * (.5 + r() * .2)); }
  if (snow) { g.fillStyle = pap(.85); g.beginPath(); g.moveTo(cx - ww * .12, base - hh * .82); g.lineTo(cx - ww * .07, base - hh); g.lineTo(cx + ww * .07, base - hh * .98); g.lineTo(cx + ww * .12, base - hh * .8); g.lineTo(cx + ww * .04, base - hh * .86); g.lineTo(cx - ww * .02, base - hh * .8); g.closePath(); g.fill(); }
  if (smoke_) smoke(g, cx, base - hh, k * 1.8, r, .38, 40);
  g.restore(); }

/* 신라 포구: 기와 관아, 초가 마을, 목책·망루, 돌 불교 건축 */
function townSilla(g, w, h, gy, base, x0, k, r, T, season, m, top) { const snow = season === 0;
  if (T.mounds) { g.fillStyle = 'rgba(90,110,80,.55)'; for (const [fx, s] of [[.9, 1], [.97, .7]]) { g.beginPath(); g.ellipse(w * fx, gy + 1, 12 * k * s, 7 * k * s, 0, Math.PI, TAU); g.fill(); g.strokeStyle = ink(.5); g.lineWidth = .7; g.stroke(); } }
  trees(g, w * .8, w * 1.02, x => top(x) - 0, k, r, season, T.pines || r() < .5 ? 'pine' : 'clump', .8);
  if (T.fort) { cityWall(g, x0 + w * .16, w * .99, gy - 2 * k, 7 * k, k, { earth: 1, gate: x0 + w * .3 }); }
  if (T.tower) tower(g, x0 + w * .06, gy, k * .85, K.ju);
  const halls = T.big ? 3 : 2; for (let i = 0; i < halls; i++) { const hx = x0 + w * (.22 + i * .14) + r() * 6, hy = gy - (T.fort ? 8 * k : 0) - i * 2 * k; hall(g, hx, hy, k * (i === 0 ? 1.05 : .85), { w: 26, wall: 7.5, roof: 8, chimi: i === 0, tier: T.big && i === 0 ? 2 : 1, snow }); }
  for (let i = 0; i < 3; i++) { const hx = x0 + w * (.04 + i * .07) + r() * 4; hall(g, hx, gy + 1, k * .55, { w: 20, wall: 6, roof: 7, style: 'thatch', snow }); }
  if (r() < .6 || T.big) pagoda(g, x0 + w * .52, gy - 3 * k, k * .8, 'stone');
  if (T.palisade) palisade(g, x0 - w * .02, x0 + w * .2, base + 1, 8 * k, k, r);
  if (T.smithy) smoke(g, x0 + w * .1, gy - 6 * k, k, r, .25, 26);
  if (T.reeds) reeds(g, x0 - w * .08, x0 + w * .12, base + 2, k, r);
  if (T.rock) { g.fillStyle = 'rgba(40,50,50,.8)'; g.beginPath(); g.moveTo(w * .26, base + 8 * k); g.quadraticCurveTo(w * .27, base - 6 * k, w * .3, base - 4 * k); g.quadraticCurveTo(w * .32, base - 2 * k, w * .33, base + 8 * k); g.closePath(); g.fill(); pine(g, w * .29, base - 4.5 * k, k * .45, r); }
  pier(g, x0 - w * .06, x0 + w * .05, base + 1.5 * k, k, r, m.night);
  if (m.night) lamps(g, x0, w, gy, k, r); }
function lamps(g, x0, w, gy, k, r) { g.save(); for (let i = 0; i < 6; i++) { const x = x0 + r() * (w - x0), y = gy - r() * 8 * k; g.fillStyle = 'rgba(232,170,80,.85)'; dot(g, x, y, .9 * k); g.fillStyle = 'rgba(232,170,80,.14)'; dot(g, x, y, 3.5 * k); } g.restore(); }
/* 당 항구: 성벽과 문루, 벽돌 불교 건축, 운하와 무지개다리, 버드나무 */
function townTang(g, w, h, gy, base, x0, k, r, T, season, m, top) { const snow = season === 0;
  if (T.temple) { const tx = w * .9, ty = top(tx); hall(g, tx - 6 * k, ty + 3 * k, k * .8, { w: 24, wall: 7, roof: 7, chimi: true, snow }); pagoda(g, tx + 14 * k, ty + 4 * k, k * .7, 'stone'); trees(g, w * .78, w * .86, top, k, r, season, 'pine'); }
  if (T.lakehills || T.tea) { g.strokeStyle = 'rgba(61,110,80,.45)'; g.lineWidth = .8; for (let i = 0; i < 6; i++) { const yy = gy - 14 * k - i * 3.2 * k; g.beginPath(); for (let x = w * .7; x < w; x += 3) g.lineTo(x, Math.max(yy, top(x) + 2) + Math.sin(x * .1 + i) * .6); g.stroke(); } }
  /* 성 안 roof — 뒤에서 앞으로 */
  const n = T.big ? 6 : T.small ? 3 : 4; for (let row = 0; row < 2; row++) for (let i = 0; i < n; i++) { const hx = x0 + w * .1 + (w * .9 - x0) * i / n + r() * 8 + row * 9 * k, hy = gy - 9 * k + row * 5 * k; hall(g, hx, hy, k * (.6 + row * .15), { w: 24, wall: 5, roof: 7, chimi: i === 1, snow, bays: 3 }); }
  if (T.pagoda) pagoda(g, x0 + w * (T.big ? .42 : .34), gy - 4 * k, k * .9, 'brick', T.big ? 13 : 9);
  cityWall(g, x0, w * 1.01, gy + 2 * k, 9 * k, k, { gate: x0 + w * .18, tier: T.big ? 2 : 1 });
  if (T.canal) { g.fillStyle = 'rgba(120,150,145,.85)'; g.fillRect(x0 - w * .1, gy + 2 * k, w * .1, base - gy - 2 * k); bridge(g, x0 - w * .05, gy + 4 * k, w * .12, k); }
  for (let i = 0; i < (T.willows ? 5 : 2); i++) willow(g, x0 - w * .06 + i * 9 * k + r() * 4, gy + 3 * k, k * .7, r, season === 0 ? 'rgba(90,96,90,.6)' : season === 3 ? 'rgba(170,140,70,.7)' : null);
  if (T.islet) { const ix = w * .22, iy = base + h * .02; g.fillStyle = 'rgba(70,88,84,.6)'; g.beginPath(); g.ellipse(ix, iy, 26 * k, 4 * k, 0, Math.PI, TAU); g.fill(); pagoda(g, ix - 8 * k, iy - 2.5 * k, k * .55, 'brick', 7); hall(g, ix + 8 * k, iy - 2 * k, k * .55, { w: 22, wall: 6, roof: 7, chimi: true, snow }); trees(g, ix - 20 * k, ix - 12 * k, () => iy - 2 * k, k, r, season, 'clump'); }
  pier(g, x0 - w * .14, x0 - w * .01, base + 1.5 * k, k, r, m.night); if (m.night) lamps(g, x0, w, gy, k, r); }
function bridge(g, x, y, ww, k) { g.save(); g.strokeStyle = ink(.85); g.lineWidth = 1.2; g.fillStyle = '#d6ccb2'; g.beginPath(); g.moveTo(x - ww / 2, y + 3 * k); g.quadraticCurveTo(x, y - 7 * k, x + ww / 2, y + 3 * k); g.lineTo(x + ww / 2, y + 4.5 * k); g.quadraticCurveTo(x, y - 5 * k, x - ww / 2, y + 4.5 * k); g.closePath(); g.fill(); g.stroke(); g.lineWidth = .6; g.beginPath(); g.ellipse(x, y + 4.6 * k, ww * .22, 5 * k, 0, Math.PI, TAU); g.stroke(); g.restore(); }
/* 왜 항구: bark roof, 높은 마루 창고, 기와 객관, 높은 신전 */
function townWa(g, w, h, gy, base, x0, k, r, T, season, m, top) { const snow = season === 0;
  if (T.taisha) { hall(g, w * .7, gy, k * .9, { w: 18, wall: 7, roof: 10, style: 'bark', stilts: 22, stair: 18, chigi: true, snow }); }
  if (T.korokan) { hall(g, x0 + w * .3, gy - 1 * k, k * .95, { w: 30, wall: 7.5, roof: 8, chimi: true, snow }); hall(g, x0 + w * .44, gy - 2 * k, k * .7, { w: 26, wall: 6, roof: 7, snow }); }
  if (T.wpagoda) pagoda(g, x0 + w * .38, gy - 1 * k, k * .9, 'wood', 5);
  for (let i = 0; i < 3; i++) { const hx = x0 + w * (.06 + i * .09) + r() * 5; hall(g, hx, gy + 1, k * .62, { w: 20, wall: 5, roof: 8, style: 'bark', stilts: i === 1 ? 5 : 0, chigi: i === 2, snow, thick: false }); }
  if (T.volcano) {}
  if (T.pinebeach) { for (let i = 0; i < 6; i++) pine(g, x0 - w * .2 + i * 9 * k + r() * 4, base - .5 * k, k * (.55 + r() * .25), r); }
  if (T.reeds) reeds(g, x0 - w * .16, x0 + w * .02, base + 2, k, r);
  pier(g, x0 - w * .03, x0 + w * .07, base + 1.5 * k, k, r, m.night); if (m.night) lamps(g, x0, w, gy, k, r); }
/* 발해 항구: 흙성, 큰 치미 기와집, 전나무 숲, 가죽 말리는 시렁 */
function townBalhae(g, w, h, gy, base, x0, k, r, T, season, m, top) { const snow = season === 0 || season === 3 && r() < .5;
  trees(g, w * .66, w * 1.02, top, k, r, season, 'conifer', 1.4);
  cityWall(g, x0 + w * .04, w * 1.01, gy + 1 * k, 6.5 * k, k, { earth: 1, gate: x0 + w * .24 });
  const n = T.big ? 3 : 2; for (let i = 0; i < n; i++) hall(g, x0 + w * (.36 + i * .15), gy - 5.5 * k - (i % 2) * 2 * k, k * (i === 0 ? 1 : .8), { w: 28, wall: 7, roof: 8.5, chimi: true, snow, wallCol: '#e6e0d0' });
  g.strokeStyle = ink(.8); g.lineWidth = .8; for (let i = 0; i < 2; i++) { const fx = x0 - w * .02 + i * 14 * k; ln(g, fx, base, fx, base - 9 * k); ln(g, fx + 10 * k, base, fx + 10 * k, base - 9 * k); ln(g, fx - 1 * k, base - 8 * k, fx + 11 * k, base - 8 * k); g.fillStyle = 'rgba(110,78,50,.85)'; for (let j = 0; j < 3; j++) { g.beginPath(); g.ellipse(fx + 2 * k + j * 3.2 * k, base - 5.5 * k, 1.2 * k, 2.6 * k, 0, 0, TAU); g.fill(); } }
  pier(g, x0 - w * .1, x0, base + 1.5 * k, k, r, m.night); }
/* 탐라: 한라산, 돌담, 새끼줄 초가, 테우와 물질하는 해녀 */
function townIsle(g, w, h, gy, base, x0, k, r, T, season, m, top) { const snow = season === 0;
  trees(g, w * .74, w * 1.02, top, k, r, season, 'clump', 1);
  g.strokeStyle = ink(.7); g.lineWidth = 1.1; for (let j = 0; j < 2; j++) { g.beginPath(); for (let x = x0; x < w; x += 2.2 * k) { const y = gy + 1 * k - j * 5 * k + (r() - .5) * .8; g.moveTo(x, y); g.lineTo(x + 1.6 * k, y - .3); } g.stroke(); }
  for (let i = 0; i < 4; i++) hall(g, x0 + w * (.08 + i * .12) + r() * 5, gy - (i % 2) * 4 * k, k * .62, { w: 20, wall: 6, roof: 7, style: 'rope', snow, wallCol: '#8f8a7e' });
  boat(g, w * .26, base + h * .05, k * 1.1, 'raft', 1, {}); for (let i = 0; i < 3; i++) { const dx = w * (.34 + i * .05), dy = base + h * (.12 + r() * .06); g.fillStyle = '#d6d0bf'; dot(g, dx, dy, 1.6 * k); g.strokeStyle = ink(.6); g.lineWidth = .5; g.stroke(); g.fillStyle = ink(.85); dot(g, dx + 3 * k, dy + .2 * k, 1 * k); }
  pier(g, x0 - w * .04, x0 + w * .03, base + 1.5 * k, k, r, m.night); }
/* 남쪽 섬: 소철·야자, 높은 마루 초가, 산호초 물빛, 유황 연기 */
function townSouth(g, w, h, gy, base, x0, k, r, T, season, m, top) {
   if (T.sulfur) { smoke(g, w * .82, top(w * .82), k * 1.2, r, .3, 30); g.fillStyle = 'rgba(214,190,90,.5)'; g.beginPath(); g.ellipse(w * .82, top(w * .82) + 2 * k, 8 * k, 2 * k, 0, 0, TAU); g.fill(); }
  for (let i = 0; i < 3; i++) hall(g, x0 + w * (.1 + i * .13) + r() * 5, gy, k * .62, { w: 20, wall: 5, roof: 9, style: 'thatch', stilts: 5 });
  for (let i = 0; i < 3; i++) palm(g, x0 - w * .06 + i * 9 * k + r() * 4, base, k * (.55 + r() * .2), r);
  if (T.reef) { g.fillStyle = 'rgba(40,50,50,.55)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(w * (.2 + i * .06), base + h * .12 + r() * 4, (2 + r() * 3) * k, 1.2 * k, 0, Math.PI, TAU); g.fill(); } }
  pier(g, x0 - w * .02, x0 + w * .06, base + 1.5 * k, k, r, m.night); }
/* 청해진 — 장도 섬의 성, 바닷가를 두른 목책, 늘어선 상선 */
function cheonghae(g, w, h, k, r, season, m) { const hz = h * .46, base = h * .72, snow = season === 0;
  sky(g, w, h, hz, m, r);
  ridge(g, w, hz + 1, { amp: h * .2, peaks: [[.1, .7, .2, 1.6], [.38, .5, .2, 1.8], [.86, 1, .2, 1.5]], col: m.far, a: .42, rough: .1, snow }, r);
  ridge(g, w, hz + h * .06, { amp: h * .22, peaks: [[.86, 1, .16, 1.6], [1.02, .8, .12, 1.6]], col: m.mid, a: m.night ? .9 : .5, rough: .12, dabs: .2, line: .3, tint: snow || m.night ? 0 : 'rgba(61,110,80,.2)', snow }, r);
  if (m.mist) mist(g, w, hz, h * .07, .55, r);
  sea(g, w, h, hz, m, r, { rows: 10 });
  /* 장도 */
  const cx = w * .4, iw = w * .44, top = land(g, w, base, { amp: h * .26, peaks: [[.4, 1, .17, 2.2], [.3, .6, .12, 2]], flat: [[cx - iw * .18, cx + iw * .12, h * .2]], tint: season === 2 ? 'rgba(61,110,80,.25)' : null }, r, m);
  const gy = base - h * .2;
  trees(g, cx - iw * .48, cx - iw * .2, top, k, r, season, 'pine', 1.3); trees(g, cx + iw * .16, cx + iw * .45, top, k, r, season, 'pine', 1.2);
  cityWall(g, cx - iw * .2, cx + iw * .14, gy + 1.5 * k, 7.5 * k, k, { earth: 1, gate: cx - iw * .08, tier: 2 });
  hall(g, cx + iw * .05, gy - 7 * k, k * 1.05, { w: 28, wall: 7, roof: 8.5, chimi: true, snow });
  tower(g, cx - iw * .24, top(cx - iw * .24) + 1, k * .95, K.ju); tower(g, cx + iw * .2, top(cx + iw * .2) + 1, k * .8, K.db);
  smoke(g, cx + iw * .24, top(cx + iw * .26) - 6 * k, k, r, .22, 30);
  for (const [fx, c] of [[-.15, K.ju], [-.11, K.dy], [.0, K.db], [.08, K.ju], [.11, K.dg]]) banner(g, cx + iw * fx, gy - 6 * k, k, c, 13);
  /* 목책: 섬 둘레 물가에 박은 나무 기둥 */
  const pal = (a0, a1, rx, ry, al) => { g.save(); g.strokeStyle = ink(al); g.lineCap = 'butt'; for (let a = a0; a < a1; a += .045) { const px = cx + Math.cos(a) * rx, py = base + 3 * k + Math.sin(a) * ry, t = (4 + r() * 2) * k * (.8 + Math.sin(a) * .3); g.lineWidth = Math.max(.7, k * .8); ln(g, px, py, px, py - t); g.strokeStyle = ink(.15); ln(g, px, py + 1, px, py + t * .4); g.strokeStyle = ink(al); } g.restore(); };
  pal(Math.PI * .05, Math.PI * .95, iw * .62, h * .1, .85);
  /* 상선들 */
  for (let i = 0; i < 4; i++) boat(g, w * (.74 + i * .07), base + h * (.02 + (i % 2) * .05), k * (.85 + i * .08), 'silla', -1, { night: m.night, furled: i % 2 === 1, flag: i === 0 ? K.ju : null, lamp: m.night });
  boat(g, w * .9, base + h * .17, k * 1.25, 'silla', -1, { night: m.night, flag: K.ju });
  boat(g, w * .1, base + h * .15, k, 'skiff', 1, { night: m.night });
  if (!m.night) birds(g, w * .62, hz * .4, k, 4, r);
  if (m.night) lamps(g, cx - iw * .2, cx + iw * .2, gy, k, r);
  paper(g, w, h, r, Math.round(w * h / 320)); }

/* ─────────── DOM 붙이기 ─────────── */
const DPR = () => Math.min(2, Math.max(1, window.devicePixelRatio || 1));
function prep(cv, w, h) { const d = DPR(); cv.width = Math.round(w * d); cv.height = Math.round(h * d); const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); return g; }
let styled = false;
function style() { if (styled) return; styled = true; const s = document.createElement('style');
  s.textContent = `.p-head.has-art{padding-top:96px}.p-art{position:absolute;left:0;top:0;width:100%;height:124px;display:block;pointer-events:none;-webkit-mask-image:linear-gradient(180deg,#000 52%,transparent 96%);mask-image:linear-gradient(180deg,#000 52%,transparent 96%)}.p-head.has-art>:not(.p-art){position:relative}
.sc-art{display:block;width:calc(100% + 48px);height:150px;margin:-19px -24px 16px;border-bottom:1px solid var(--rule-3)}.sc-art.port{height:118px}.card.has-art .ev-ink,.card.has-art>.who{display:none}
.end-art{display:block;width:100%;height:170px;margin:0 0 18px;border:1px solid var(--rule-3);box-shadow:var(--frame)}
@media (max-width:860px){.p-head.has-art{padding-top:64px}.p-art{height:86px;-webkit-mask-image:linear-gradient(180deg,#000 40%,transparent 86%);mask-image:linear-gradient(180deg,#000 40%,transparent 86%)}.sc-art{width:calc(100% + 32px);height:118px;margin:-15px -16px 12px}.sc-art.port{height:92px}.end-art{height:130px}}`;
  document.head.appendChild(s); }
const pcache = { key: '' };
function portBanner(head, k, t) { if (!head) return; style(); let cv = head.querySelector('.p-art'); if (!cv) { cv = document.createElement('canvas'); cv.className = 'p-art'; cv.setAttribute('aria-hidden', 'true'); head.prepend(cv); head.classList.add('has-art'); }
  const w = head.clientWidth || 392, hh = cv.clientHeight || 124, md = portMood(k, t), key = [k, md.season, md.tod, w, hh].join('|'); if (pcache.key === key && cv.width) return; pcache.key = key;
  portScene(prep(cv, w, hh), w, hh, k, md); }
/* 카드 맨 위에 그림을 깐다. kind: ev(항해 사건) · port(입항) · pe(포구 사건) */
function cardArt(card, kind, key, t) { if (!card) return; style(); const cv = document.createElement('canvas'); cv.className = 'sc-art ' + (kind === 'port' ? 'port' : ''); cv.setAttribute('aria-hidden', 'true'); card.prepend(cv); card.classList.add('has-art');
  const ch = (card.querySelector('.ev-ink, .who') || {}).textContent || '';
  let n = 0; const go = () => { const w = cv.clientWidth, hh = cv.clientHeight; if (!w && n++ < 10) { requestAnimationFrame(go); return; } if (!w) return; const g = prep(cv, w, hh);
    if (kind === 'port') portScene(g, w, hh, key, portMood(key, t)); else eventScene(g, w, hh, key, ch); };
  go(); }
const clearArt = card => { if (card) card.classList.remove('has-art'); };

/* ═══════════ 큰 배 — 옆에서 본 배 (해전·사건) ═══════════ */
/* ui.js shipSide와 같은 좌표: 물선이 y=6, 길이 -66~66. type: silla · junk · wa · raider · tower */
const SHIP = {
  me:     { type: 'silla', flag: K.ju },
  pirate: { type: 'silla', hull: '#2e2a26', sail: '#77715f', sail2: '#8f8a76', trim: '#1b2324', sails: 'tatter', flag: K.ink },
  black:  { type: 'junk', hull: '#1a2224', sail: '#2c3334', sail2: '#454c4a', trim: '#1b2324', sails: 'tatter', flag: K.ink, bigFlag: 1, big: 1.08 },
  slaver: { type: 'junk', hull: '#4a3a2c', sail: '#8a6a44', sail2: '#a3845a', trim: '#6b4a32', cage: 1, flag: K.ink2 },
  jang:   { type: 'raider', hull: '#1f2e2c', sail: '#5e6e64', sail2: '#7d8c80', trim: '#2f5a50', sails: 'tatter', oars: 9, hooks: 1, streamers: ['#e9e4d6', '#cfd8d0'], flag: '#cfd8d0' },
  saburo: { type: 'wa', hull: '#3a2a1c', sail: '#c9b48a', sail2: '#d9c89e', trim: '#1b2324', sails: 'mat', shields: '#d8cfb8', eye: 1, flag: '#efe9da', masts: 2 },
  wangdu: { type: 'junk', hull: '#4a2418', sail: '#a5452c', sail2: '#c0623e', trim: '#d6a540', fire: 1, flag: K.ju, masts: 3, big: 1.04 },
  hong:   { type: 'silla', hull: '#3a1a16', sail: '#b03a26', sail2: '#cf5a3c', trim: '#d6a540', streamers: [K.ju, '#d6a540'], flag: K.ju, slim: 1, lanterns: K.ju },
  okuma:  { type: 'wa', hull: '#2c2018', sail: '#6a5236', sail2: '#85694a', trim: '#1b2324', sails: 'mat', oars: 8, spears: 1, pelt: 1, flag: '#8d9187' },
  ilang:  { type: 'tower', hull: '#141b1c', sail: '#252c2c', sail2: '#3a4241', trim: '#c19a3e', dragon: 1, flag: K.ju, masts: 3, big: 1.08 }
};
/* 적의 모습: 두목은 제 배, 나머지는 gimmick(궁수·백병·불화살·단단함)이 배에 보인다 */
function shipLook(spec, e) { const id = (e && e.boss) || (spec && spec.kind); const L = Object.assign({}, SHIP[id] || SHIP.pirate), gm = e && e.g;
  if (!(e && e.boss) && id !== 'slaver' && id !== 'black') { if (gm === 'archer') L.shields = '#8a7f66'; if (gm === 'boarder') L.hooks = 1; if (gm === 'fire') L.fire = 1; if (gm === 'tough') { L.type = 'junk'; L.big = 1.06; } } return L; }
function ship(g, x, y, s, o = {}) { const L = Object.assign({}, SHIP.me, o.look || {}, o), dir = L.dir || 1, ty = L.type || 'silla', hull = L.hull || '#3b2a1c', sail = L.sail || '#dcc28a', sail2 = L.sail2 || '#e9d7aa', t = L.t || 0, sz = L.big || 1;
  g.save(); g.translate(x, y); g.rotate((L.roll || 0) * dir); g.scale(s * dir * sz, s * sz); g.globalAlpha = L.alpha == null ? 1 : L.alpha; g.lineCap = 'round'; g.lineJoin = 'round';
  const H = { silla: [[-60, -22], [-46, 6], [40, 6], [66, -24], -13], junk: [[-62, -34], [-54, 6], [44, 6], [64, -22], -14], wa: [[-66, -20], [-50, 6], [46, 6], [68, -22], -12], raider: [[-70, -14], [-56, 6], [52, 6], [76, -18], -9], tower: [[-80, -30], [-66, 6], [58, 6], [82, -26], -16] }[ty];
  const [[sx, sy], [bx, by], [fx, fy], [px, py], deck] = H;
  g.fillStyle = 'rgba(27,35,36,.16)'; g.beginPath(); g.ellipse(0, 5, (px - sx) / 2 + 2, 6, 0, 0, TAU); g.fill();
  const hullPath = () => { g.beginPath(); g.moveTo(sx, sy); if (ty === 'junk' || ty === 'tower') g.lineTo(sx + 8, by - 2); else g.quadraticCurveTo(sx + 1, -4, bx, by); g.lineTo(fx, fy); g.quadraticCurveTo(px - 8, 2, px, py); g.lineTo(px - 7, py + 2); g.quadraticCurveTo(px - 14, deck, px - 24, deck); g.lineTo(sx + 16, deck); g.quadraticCurveTo(sx + 7, deck - 2, sx, sy); g.closePath(); };
  if (L.oars) { g.strokeStyle = 'rgba(27,35,36,.85)'; g.lineWidth = 1.4; for (let i = 0; i < L.oars; i++) { const ox = sx + 22 + i * (px - sx - 44) / (L.oars - 1), ph = Math.sin(t * 3 + i * .5) * 3; ln(g, ox, deck + 4, ox - 10 + ph, 14); } }
  /* 고물 키 */
  g.strokeStyle = K.ink; g.lineWidth = 2.4; ln(g, sx + 8, sy + 6, sx - 6, 9); g.fillStyle = hull; g.beginPath(); g.moveTo(sx - 3, 2); g.lineTo(sx - 11, 13); g.lineTo(sx - 4, 16); g.lineTo(sx + 1, 5); g.closePath(); g.fill();
  hullPath(); const hg = g.createLinearGradient(0, Math.min(sy, py), 0, 6); hg.addColorStop(0, hull); hg.addColorStop(1, '#140f0c'); g.fillStyle = hg; g.fill(); g.strokeStyle = K.ink; g.lineWidth = 1.3; g.stroke();
  g.strokeStyle = 'rgba(245,240,227,.16)'; g.lineWidth = .9; for (const yy of [deck + 6, deck + 12]) ln(g, sx + 10, yy, px - 12, yy);
  g.strokeStyle = L.trim || K.ju; g.lineWidth = 2.2; g.beginPath(); g.moveTo(sx + 4, sy + 5); g.quadraticCurveTo(sx + 10, deck + 1, sx + 18, deck + 1); g.lineTo(px - 22, deck + 1); g.quadraticCurveTo(px - 10, deck, px - 4, py + 3); g.stroke();
  if (ty === 'wa') { g.fillStyle = 'rgba(27,35,36,.85)'; for (let i = 0; i < 7; i++) { const xx = sx + 18 + i * (px - sx - 36) / 6; g.fillRect(xx - 1.4, deck + 3, 2.8, 2.8); } }
  else { g.fillStyle = 'rgba(245,240,227,.5)'; for (let i = 0; i < 6; i++) dot(g, sx + 30 + i * (px - sx - 60) / 5, deck + 8, 1.5); }
  if (L.eye) { g.fillStyle = '#efe9da'; g.beginPath(); g.ellipse(px - 18, deck + 8, 5, 3.4, 0, 0, TAU); g.fill(); g.fillStyle = K.ink; dot(g, px - 17, deck + 8, 2); }
  if (L.dragon) { g.fillStyle = '#1b2324'; g.strokeStyle = L.trim; g.lineWidth = 1; g.beginPath(); g.moveTo(px - 6, py + 3); g.quadraticCurveTo(px + 6, py - 8, px + 2, py - 18); g.quadraticCurveTo(px + 12, py - 21, px + 17, py - 14); g.lineTo(px + 9, py - 12); g.quadraticCurveTo(px + 7, py - 3, px + 2, py + 5); g.closePath(); g.fill(); g.stroke(); g.fillStyle = K.ju; dot(g, px + 8, py - 16, 1.5); ln(g, px + 3, py - 18, px - 3, py - 26); ln(g, px + 6, py - 19, px + 3, py - 27); }
  /* 돛대와 돛 */
  const nm = L.masts || (ty === 'raider' || ty === 'wa' ? 1 : 2), MS = { 1: [[-2, 88, 1]], 2: [[-8, 84, 1], [30, 60, .74]], 3: [[-24, 76, .9], [10, 90, 1], [42, 58, .68]] }[nm], sw = L.sway || 0;
  g.strokeStyle = 'rgba(27,35,36,.55)'; g.lineWidth = .7; for (const [mx, mh] of MS) { ln(g, mx, deck - mh, px - 2, py + 2); ln(g, mx, deck - mh, sx + 4, sy + 2); }
  let fmx = 0, ftop = 0, chx = 0, chy = 0;
  for (const [mx, mh, kk] of MS) { const top = deck - mh, bot = deck - (ty === 'tower' ? 30 : 8); g.strokeStyle = K.ink; g.lineWidth = 2.2; ln(g, mx, deck + 1, mx, top - 6); if (!ftop || top < ftop) { fmx = mx; ftop = top; }
    if (L.furled) { g.fillStyle = sail; g.strokeStyle = K.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(mx, bot - 5); for (let i = 0; i <= 5; i++) g.quadraticCurveTo(mx - mh * .09 * i - mh * .045, bot - 7 + (i % 2) * 2, mx - mh * .09 * (i + 1), bot - 4); g.lineTo(mx - mh * .54, bot + 1); g.lineTo(mx, bot + 1); g.closePath(); g.fill(); g.stroke(); if (kk === 1) { chx = mx - mh * .2; chy = top + mh * .45; } continue; }
    if (L.sails === 'mat') { const sw2 = mh * .62, sx2 = mx - sw2 / 2 - 2, bulge = 4 * kk + sw * 2; if (kk === 1) { chx = mx + 2; chy = (top + bot) / 2 + 8; }
      const sp = () => { g.beginPath(); g.moveTo(sx2, top + 4); g.lineTo(sx2 + sw2, top + 4); g.quadraticCurveTo(sx2 + sw2 + bulge, (top + bot) / 2, sx2 + sw2, bot); g.lineTo(sx2, bot); g.quadraticCurveTo(sx2 + bulge, (top + bot) / 2, sx2, top + 4); g.closePath(); };
      sp(); const sg = g.createLinearGradient(sx2, top, sx2 + sw2, bot); sg.addColorStop(0, sail2); sg.addColorStop(1, sail); g.fillStyle = sg; g.fill(); g.strokeStyle = K.ink; g.lineWidth = 1.1; g.stroke(); g.save(); sp(); g.clip(); g.strokeStyle = 'rgba(27,35,36,.38)'; g.lineWidth = .7; for (let i = 1; i < 6; i++) { const xx = sx2 + sw2 * i / 6; ln(g, xx + bulge * .5, top, xx + bulge * .5, bot); } for (let i = 1; i < 8; i++) { const yy = top + 4 + (bot - top - 4) * i / 8; ln(g, sx2, yy, sx2 + sw2 + bulge, yy); }
      if (L.eye && kk === 1) { g.fillStyle = '#efe9da'; g.beginPath(); g.ellipse(mx + 2, top + 16, 10, 5.5, 0, 0, TAU); g.fill(); g.strokeStyle = K.ink; g.lineWidth = 1.8; g.stroke(); g.fillStyle = K.ink; dot(g, mx + 2, top + 16, 3.2); }
      g.restore(); g.strokeStyle = K.ink; g.lineWidth = 1.8; ln(g, sx2 - 3, top + 4, sx2 + sw2 + 3, top + 4); ln(g, sx2 - 3, bot, sx2 + sw2 + 3, bot); continue; }
    const wv = mh * (L.slim ? .44 : .5), lt = mx - wv * .78, lb = mx - wv, bulge = 6 * kk + sw * 3; if (kk === 1) { chx = mx - wv * .45; chy = top + mh * .45; }
    const sailPath = () => { g.beginPath(); g.moveTo(mx + 1, top + 2); g.lineTo(mx + 1, bot); g.lineTo(lb, bot + 1); g.quadraticCurveTo(lb - bulge, (top + bot) / 2, lt, top + 4); g.closePath(); };
    g.save(); if (L.sails === 'tatter') { const R = rng(Math.round(mx * 13 + mh)); g.beginPath(); g.rect(-400, -400, 800, 800); for (let i = 0; i < 3; i++) { const yy = top + 10 + R() * (bot - top - 20); g.moveTo(lb - bulge - 3, yy); g.lineTo(lb - bulge - 3, yy + 7 + R() * 6); g.lineTo(lb + 4 + R() * 8, yy + 3); g.closePath(); } g.ellipse(mx - wv * .3, top + (bot - top) * (.25 + R() * .3), 2.2, 3, 0, 0, TAU); g.clip('evenodd'); }
    sailPath(); const sg = g.createLinearGradient(lb, top, mx, bot); sg.addColorStop(0, sail2); sg.addColorStop(1, sail); g.fillStyle = sg; g.fill(); g.strokeStyle = K.ink; g.lineWidth = 1.1; g.stroke();
    sailPath(); g.clip(); g.strokeStyle = 'rgba(27,35,36,.6)'; g.lineWidth = 1; const n = ty === 'junk' || ty === 'tower' ? 8 : 6;
    for (let i = 1; i < n; i++) { const yy = top + (bot - top) * i / n; g.beginPath(); g.moveTo(mx + 1, yy); g.quadraticCurveTo((mx + lb) / 2, yy + 2.5, lb - bulge, yy + 1); g.stroke(); }
    g.restore(); }
  /* 고물 집 · 누각 */
  if (ty === 'junk') { g.fillStyle = hull; g.fillRect(sx + 4, sy, 22, deck - sy); g.strokeStyle = K.ink; g.lineWidth = 1; g.strokeRect(sx + 4, sy, 22, deck - sy); g.fillStyle = 'rgba(245,240,227,.28)'; for (let i = 0; i < 3; i++) g.fillRect(sx + 7 + i * 6.5, sy + 5, 4, 5); g.fillStyle = K.ink; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy - 3, sx + 15, sy - 7); g.quadraticCurveTo(sx + 16, sy - 3, sx + 30, sy); g.closePath(); g.fill(); }
  else if (ty === 'wa') { g.fillStyle = '#6b5440'; g.fillRect(-30, deck - 11, 30, 11); g.strokeStyle = K.ink; g.lineWidth = 1; g.strokeRect(-30, deck - 11, 30, 11); g.fillStyle = '#4a3626'; g.beginPath(); g.moveTo(-35, deck - 10); g.lineTo(-15, deck - 18); g.lineTo(5, deck - 10); g.closePath(); g.fill(); g.stroke(); }
  else if (ty === 'tower') { let yy = deck; for (const [lx, lw2, lh] of [[-62, 38, 13], [-54, 28, 11], [-46, 19, 9]]) { g.fillStyle = '#283030'; g.fillRect(lx, yy - lh, lw2 * 2, lh); g.strokeStyle = L.trim; g.lineWidth = 1; g.strokeRect(lx, yy - lh, lw2 * 2, lh); g.fillStyle = 'rgba(232,170,80,.6)'; for (let i = 0; i < lw2 / 6; i++) g.fillRect(lx + 4 + i * 12, yy - lh + 3, 5, 4); g.fillStyle = K.ink; g.beginPath(); g.moveTo(lx - 7, yy - lh + 1); g.quadraticCurveTo(lx + lw2, yy - lh + 2, lx + lw2 * 2 + 7, yy - lh - 2); g.lineTo(lx + lw2 * 2 - 3, yy - lh - 6); g.lineTo(lx + 3, yy - lh - 6); g.closePath(); g.fill(); yy -= lh + 6; }
    for (let i = 0; i < 9; i++) { g.fillStyle = '#283030'; g.fillRect(-12 + i * 9, deck - 7, 6, 7); g.strokeStyle = L.trim; g.lineWidth = .6; g.strokeRect(-12 + i * 9, deck - 7, 6, 7); } }
  else { g.fillStyle = hull; g.fillRect(sx + 8, deck - 13, 17, 13); g.strokeStyle = K.ink; g.lineWidth = 1; g.strokeRect(sx + 8, deck - 13, 17, 13); g.fillStyle = K.ink; g.beginPath(); g.moveTo(sx + 4, deck - 13); g.quadraticCurveTo(sx + 16, deck - 16, sx + 16.5, deck - 20); g.quadraticCurveTo(sx + 17, deck - 16, sx + 29, deck - 13); g.closePath(); g.fill(); }
  if (L.cage) { const cx0 = 8, cw = 34, ch = 15; g.fillStyle = 'rgba(27,35,36,.3)'; g.fillRect(cx0, deck - ch, cw, ch); g.fillStyle = 'rgba(27,35,36,.75)'; for (let i = 0; i < 4; i++) { dot(g, cx0 + 5 + i * 7, deck - 8, 1.8); g.fillRect(cx0 + 3.6 + i * 7, deck - 6.4, 2.8, 6); } g.strokeStyle = K.ink; g.lineWidth = 1.2; g.strokeRect(cx0, deck - ch, cw, ch); g.lineWidth = .9; for (let i = 1; i < 8; i++) ln(g, cx0 + i * cw / 8, deck - ch, cx0 + i * cw / 8, deck); }
  if (L.shields) { for (let i = 0; i < 8; i++) { const xx = sx + 30 + i * (px - sx - 54) / 7; g.fillStyle = L.shields; g.beginPath(); g.moveTo(xx - 3.4, deck); g.lineTo(xx - 3.4, deck - 11); g.quadraticCurveTo(xx, deck - 14, xx + 3.4, deck - 11); g.lineTo(xx + 3.4, deck); g.closePath(); g.fill(); g.strokeStyle = K.ink; g.lineWidth = .9; g.stroke(); ln(g, xx, deck - 10, xx, deck - 1); } }
  if (L.hooks) { g.strokeStyle = K.ink; g.lineWidth = 1.2; for (let i = 0; i < 3; i++) { const hx = px - 14 - i * 9; ln(g, hx, deck - 2, hx + 1, deck - 20); g.beginPath(); g.arc(hx + 1, deck - 23, 3, Math.PI * .1, Math.PI * .95, true); g.stroke(); ln(g, hx + 1, deck - 20, hx - 2, deck - 24); } }
  if (L.spears) { g.lineWidth = .9; for (let i = 0; i < 9; i++) { const xx = sx + 36 + i * 7; g.strokeStyle = 'rgba(27,35,36,.9)'; ln(g, xx, deck, xx + 2, deck - 20); g.fillStyle = '#9aa29a'; g.beginPath(); g.moveTo(xx + 1.4, deck - 20); g.lineTo(xx + 3.4, deck - 25); g.lineTo(xx + 2.8, deck - 19.5); g.fill(); } }
  /* 깃발 · 띠 · 가죽 · 등 · 불 */
  if (L.flag) { const fy = ftop - 6, big = L.bigFlag ? 1.7 : 1; g.fillStyle = L.flag; g.beginPath(); g.moveTo(fmx, fy); for (let i = 0; i <= 6; i++) g.lineTo(fmx - i * 4 * big, fy + Math.sin(t * 6 + i * .9) * 1.6 + i * .5); for (let i = 6; i >= 0; i--) g.lineTo(fmx - i * 4 * big, fy + 6 * big + Math.sin(t * 6 + i * .9) * 1.6 + i * .2); g.closePath(); g.fill(); if (L.bigFlag) { g.fillStyle = 'rgba(245,240,227,.75)'; dot(g, fmx - 13, fy + 6, 2.8); } }
  if (L.streamers) L.streamers.forEach((c, j) => { const m = MS[Math.min(j, MS.length - 1)], x0 = m[0], y0 = deck - m[1] - 2 + j * 4; g.strokeStyle = c; g.lineWidth = 1.7; g.beginPath(); g.moveTo(x0, y0); for (let i = 1; i <= 12; i++) g.lineTo(x0 - i * 3.4, y0 + i * 1.2 + Math.sin(t * 5 + i * .8 + j) * 1.8); g.stroke(); });
  if (L.pelt) { const xx = fmx + 3, yy = ftop + 2; g.fillStyle = '#7a7466'; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + 11, yy); for (let i = 0; i <= 5; i++) g.lineTo(xx + 11 - i * 2.2, yy + 17 + (i % 2) * 3); g.closePath(); g.fill(); g.strokeStyle = K.ink; g.lineWidth = .8; g.stroke(); g.fillStyle = K.ink; dot(g, xx + 3.5, yy + 4, 1); dot(g, xx + 7.5, yy + 4, 1); }
  if (L.lanterns) { for (const xx of [sx + 16, px - 14]) { g.strokeStyle = K.ink; g.lineWidth = .7; ln(g, xx, deck - 17, xx, deck - 13); g.fillStyle = L.lanterns; g.beginPath(); g.ellipse(xx, deck - 10, 2.6, 3.4, 0, 0, TAU); g.fill(); } }
  if (L.fire) { for (const xx of [sx + 26, px - 22]) { g.fillStyle = '#3a2a20'; g.fillRect(xx - 3, deck - 5, 6, 5); const fl = Math.sin(t * 9 + xx) * 1.2; g.fillStyle = 'rgba(226,112,48,.95)'; g.beginPath(); g.moveTo(xx - 3, deck - 5); g.quadraticCurveTo(xx - 1 + fl, deck - 12, xx, deck - 15); g.quadraticCurveTo(xx + 1 + fl, deck - 10, xx + 3, deck - 5); g.fill(); g.fillStyle = 'rgba(214,165,64,.95)'; g.beginPath(); g.ellipse(xx, deck - 7.5, 1.4, 2.4, 0, 0, TAU); g.fill();
      for (let i = 0; i < 5; i++) { const q = (i + (t * .6 % 1)) / 5; g.fillStyle = `rgba(80,78,72,${.3 * (1 - q)})`; dot(g, xx - q * 22, deck - 18 - q * 40, 4 + q * 9); } } }
  g.restore();
  if (L.ch) { const ex = x + dir * s * sz * chx, ey = y + s * sz * chy; g.save(); g.globalAlpha = L.alpha == null ? 1 : L.alpha; g.fillStyle = L.chBg || K.ju; dot(g, ex, ey, 11 * s); g.fillStyle = '#f5f0e3'; g.font = `${Math.round(13 * s)}px "Chunghae Seal","Chunghae Myeong",serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L.ch, ex, ey + .5); g.restore(); } }
/* 해전 화면의 적 배 — ui.js drawBattle 이 shipSide 대신 부른다. 위치·흔들림·가라앉음은 ui가 정한 그대로 */
function foe(g, x, y, s, o, B) { const look = shipLook(B && B.spec, B && B.e); ship(g, x, y, s, { look, dir: o.dir, roll: o.roll, t: o.t, alpha: o.alpha, sway: o.sway, ch: o.ch, chBg: o.chBg }); }
/* ═══════════ 사건 그림 — 같은 틀: 하늘·바다 위에 한 가지 일 ═══════════ */
/* 장면마다 [분위기, 수평선 높이, 그리기] */
function cloudMass(g, x, y, ww, hh, a, r, col) { g.save(); for (let i = 0; i < 14; i++) { const cx = x + (r() - .5) * ww, cy = y + (r() - .5) * hh * .6, rr = (.25 + r() * .3) * hh; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rr * 1.6); gr.addColorStop(0, rgb(col || [40, 48, 48], a)); gr.addColorStop(1, rgb(col || [40, 48, 48], 0)); g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, rr * 1.6, rr, 0, 0, TAU); g.fill(); } g.restore(); }
function crate(g, x, y, k, rot, col) { g.save(); g.translate(x, y); g.rotate(rot || 0); g.fillStyle = col || '#8a6a44'; g.fillRect(-5 * k, -4 * k, 10 * k, 8 * k); g.strokeStyle = ink(.85); g.lineWidth = .9; g.strokeRect(-5 * k, -4 * k, 10 * k, 8 * k); ln(g, -5 * k, 0, 5 * k, 0); ln(g, 0, -4 * k, 0, 4 * k); g.restore(); }
function plank(g, x, y, L, k, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = '#5c4632'; g.fillRect(-L / 2, -1.2 * k, L, 2.4 * k); g.strokeStyle = ink(.8); g.lineWidth = .7; g.strokeRect(-L / 2, -1.2 * k, L, 2.4 * k); g.restore(); }
function ripple(g, x, y, ww, k, a) { g.save(); g.strokeStyle = pap(a || .6); g.lineWidth = .8; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(x, y + i * 1.6 * k, ww * (1 + i * .35), 1.3 * k * (1 + i * .3), 0, 0, Math.PI); g.stroke(); } g.restore(); }
function deckBand(g, w, h, y, night) { g.save(); const gr = g.createLinearGradient(0, y, 0, h); gr.addColorStop(0, night ? '#3a2e24' : '#7a5e44'); gr.addColorStop(1, night ? '#1e1712' : '#4a3828'); g.fillStyle = gr; g.fillRect(0, y, w, h - y); g.strokeStyle = ink(.5); g.lineWidth = .8; for (let yy = y + 6; yy < h; yy += 7) ln(g, 0, yy, w, yy); for (let x = 30; x < w; x += 60) ln(g, x, y, x - 8, h); g.fillStyle = night ? '#2a211a' : '#5a4432'; g.fillRect(0, y - 6, w, 6); g.strokeStyle = ink(.85); g.lineWidth = 1.2; ln(g, 0, y - 6, w, y - 6); g.restore(); }
function lantern(g, x, y, k, col, glow) { g.save(); if (glow) { const gr = g.createRadialGradient(x, y, 0, x, y, 18 * k); gr.addColorStop(0, 'rgba(240,180,90,.45)'); gr.addColorStop(1, 'rgba(240,180,90,0)'); g.fillStyle = gr; dot(g, x, y, 18 * k); } g.fillStyle = col || K.ju; g.beginPath(); g.ellipse(x, y, 3 * k, 4 * k, 0, 0, TAU); g.fill(); g.strokeStyle = ink(.8); g.lineWidth = .7; ln(g, x, y - 4 * k, x, y - 7 * k); ln(g, x - 2 * k, y + 4 * k, x + 2 * k, y + 4 * k); g.restore(); }
function flame(g, x, y, ww, hh, r) { g.save(); for (let i = 0; i < 3; i++) { const c = ['rgba(176,58,38,.85)', 'rgba(226,112,48,.9)', 'rgba(232,190,90,.95)'][i], s = 1 - i * .3; g.fillStyle = c; g.beginPath(); g.moveTo(x - ww * s, y); for (let j = 0; j <= 6; j++) { const q = j / 6, px = x - ww * s + ww * 2 * s * q, tall = hh * s * (.6 + .4 * Math.sin(q * Math.PI)) * (.7 + r() * .5); g.lineTo(px - ww * .08, y - tall * .6); g.lineTo(px, y - tall); } g.lineTo(x + ww * s, y); g.closePath(); g.fill(); } g.restore(); }

const fig = (g, x, y, k, o) => person(g, x, y, k * 1.7, o);
const EV = {
  storm: ['storm', .5, (g, w, h, hz, k, r) => { cloudMass(g, w * .5, hz * .35, w * 1.2, hz * .9, .55, r); g.save(); g.strokeStyle = pap(.85); g.lineWidth = 1.6; g.beginPath(); let x = w * .74, y = 0; g.moveTo(x, y); while (y < hz * .9) { x += (r() - .5) * 14; y += 8 + r() * 8; g.lineTo(x, y); } g.stroke(); g.restore();
    sea(g, w, h, hz, MOOD.storm, r, { rows: 12, rough: 2.2, curls: 1 }); ship(g, w * .38, h * .78, k * .62, { roll: -.16, sails: 'tatter', sway: 1, flag: K.ju }); waveRow(g, h * .86, w, 5 * k, 22 * k, 1, .5, 1.6, true); rain(g, w, h, r, .22); }],
  calm: ['dawn', .52, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.dawn, r, { rows: 5, rough: .25 }); g.save(); g.globalAlpha = .22; g.translate(0, h * .78 * 2 + 6 * k * .7); g.scale(1, -1); ship(g, w * .5, h * .78, k * .7, { furled: 1 }); g.restore(); ship(g, w * .5, h * .78, k * .7, { sway: -1.5 }); g.strokeStyle = pap(.6); g.lineWidth = .8; for (let i = 0; i < 6; i++) { const y = hz + (h - hz) * (.15 + i * .14); ln(g, w * (.1 + r() * .2), y, w * (.5 + r() * .4), y); } }],
  wreck: ['day', .46, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.day, r, { rows: 10 }); g.save(); g.translate(w * .55, h * .74); g.rotate(-.5); g.strokeStyle = K.ink; g.lineWidth = 2.6 * k; ln(g, 0, 0, 0, -48 * k); g.fillStyle = '#c9b48a'; g.beginPath(); g.moveTo(0, -46 * k); g.lineTo(-22 * k, -40 * k); g.lineTo(-14 * k, -28 * k); g.lineTo(-24 * k, -18 * k); g.lineTo(0, -14 * k); g.closePath(); g.fill(); g.strokeStyle = ink(.8); g.lineWidth = .9; g.stroke(); g.restore();
    for (let i = 0; i < 7; i++) plank(g, w * (.2 + r() * .65), h * (.66 + r() * .26), (12 + r() * 18) * k, k, (r() - .5) * .8); crate(g, w * .32, h * .8, k * 1.2, .3); crate(g, w * .72, h * .86, k, -.2, '#6e5236'); ripple(g, w * .32, h * .8 + 4 * k, 8 * k, k); birds(g, w * .4, hz * .4, k, 4, r); }],
  sail: ['dawn', .5, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.dawn, r, { rows: 9 }); mist(g, w, hz - 4 * k, 16 * k, .5, r); g.save(); g.globalAlpha = .7; boat(g, w * .72, hz + 3 * k, k * .9, 'junk', -1, { sail: '#3a3f3d', hull: '#2a2a28' }); g.restore();
    g.save(); g.translate(-w * .08, 0); ship(g, w * .08, h * 1.05, k * 1.3, { flag: K.ju }); g.restore(); }],
  castaway: ['day', .46, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.day, r, { rows: 10 }); const x = w * .5, y = h * .8; plank(g, x, y, 70 * k, k * 2.4, .05); plank(g, x + 4 * k, y + 3 * k, 56 * k, k * 2, -.04); fig(g, x - 6 * k, y - 2 * k, k * 1.15, { pose: 'wave', hat: 'top' }); ripple(g, x, y + 4 * k, 40 * k, k * 1.4); for (let i = 0; i < 4; i++) plank(g, w * (.12 + i * .24), h * (.9 - (i % 2) * .08), 14 * k, k * 1.4, r() - .5); birds(g, w * .65, hz * .4, k * 1.3, 2, r); }],
  reef: ['day', .44, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.day, r, { rows: 9 }); for (let i = 0; i < 5; i++) { const x = w * (.1 + i * .2 + r() * .08), y = h * (.62 + r() * .3); const gr = g.createRadialGradient(x, y, 0, x, y, 40 * k); gr.addColorStop(0, 'rgba(130,200,180,.55)'); gr.addColorStop(1, 'rgba(130,200,180,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 40 * k, 10 * k, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(40,52,50,.75)'; g.beginPath(); g.ellipse(x, y, (4 + r() * 6) * k, 2.2 * k, 0, Math.PI, TAU); g.fill(); ripple(g, x, y + 1, (6 + r() * 4) * k, k, .8); }
    ship(g, w * .62, h * .62, k * .45, { flag: K.ju }); }],
  fairwind: ['day', .55, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.day, r, { rows: 9, rough: 1.3 }); g.save(); g.strokeStyle = ink(.35); g.lineWidth = 1; for (let i = 0; i < 7; i++) { const y = h * (.1 + i * .1), x = w * (r() * .3); g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + w * .2, y - 6 * k, x + w * .3, y + 6 * k, x + w * (.45 + r() * .2), y - 2 * k); g.stroke(); } g.restore(); ship(g, w * .62, h * .84, k * .8, { sway: 2.2, roll: .05, flag: K.ju }); birds(g, w * .8, h * .18, k, 3, r); }],
  monk: ['dawn', .48, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.dawn, r, { rows: 8, rough: .7 }); const x = w * .5, y = h * .82; boat(g, x, y, k * 3.6, 'skiff', 1, { crew: 0 }); fig(g, x - 4 * k, y - 8 * k, k * 1.15, { pose: 'sit', hat: 'kasa', robe: '#6a6a60' }); g.strokeStyle = ink(.85); g.lineWidth = 1.4; ln(g, x + 12 * k, y - 8 * k, x + 16 * k, y - 46 * k); g.fillStyle = ink(.85); dot(g, x + 16 * k, y - 47 * k, 1.6 * k); ripple(g, x, y + 4 * k, 46 * k, k * 1.2, .5); }],
  captives: ['dusk', .5, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.dusk, r, { rows: 9 }); ship(g, w * .55, h * .8, k * .72, { look: SHIP.slaver, dir: -1 }); }],
  ghost: ['night', .5, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.night, r, { rows: 8 }); g.save(); g.globalAlpha = .55; ship(g, w * .55, h * .78, k * .7, { hull: '#9aa8a2', sail: '#c8d2cb', sail2: '#e0e6e0', trim: '#7d8c86', sails: 'tatter', flag: null, dir: -1 }); g.restore(); lantern(g, w * .55 - 30 * k, h * .78 - 26 * k, k, 'rgba(170,220,190,.9)', true); mist(g, w, h * .7, h * .16, .22, r); mist(g, w, h * .86, h * .12, .18, r); }],
  spout: ['storm', .55, (g, w, h, hz, k, r) => { cloudMass(g, w * .5, hz * .25, w, hz * .6, .55, r); sea(g, w, h, hz, MOOD.storm, r, { rows: 10, rough: 1.6 }); const cx = w * .6; g.save(); for (let i = 0; i < 40; i++) { const q = i / 40, y = hz * .35 + (hz + 10 * k - hz * .35) * q, ww = (14 - 10 * Math.sin(q * Math.PI * .9)) * k + q * 4 * k; g.strokeStyle = `rgba(60,72,72,${.25 + q * .2})`; g.lineWidth = 1.1; g.beginPath(); g.ellipse(cx + Math.sin(q * 6) * 4 * k, y, ww, 1.6 * k, 0, 0, TAU); g.stroke(); }
    g.fillStyle = pap(.6); for (let i = 0; i < 20; i++) dot(g, cx + (r() - .5) * 36 * k, hz + 6 * k - r() * 10 * k, (1 + r()) * k); g.restore(); ship(g, w * .24, h * .86, k * .45, { roll: -.08, flag: K.ju }); rain(g, w, h, r, .12); }],
  whale: ['day', .44, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.day, r, { rows: 10 }); g.save(); for (const [fx, fy, s] of [[.26, .74, 2], [.6, .64, 1.2], [.84, .78, 1.5]]) { const x = w * fx, y = h * fy; g.fillStyle = '#2e3a3c'; g.beginPath(); g.moveTo(x - 24 * k * s, y); g.quadraticCurveTo(x - 4 * k * s, y - 10 * k * s, x + 22 * k * s, y); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x + 6 * k * s, y - 5 * k * s); g.lineTo(x + 10 * k * s, y - 10 * k * s); g.lineTo(x + 12 * k * s, y - 3 * k * s); g.fill(); ripple(g, x, y + 1, 26 * k * s, k * s * .6, .7); g.strokeStyle = pap(.8); g.lineWidth = 1.2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x - 10 * k * s, y - 8 * k * s); g.quadraticCurveTo(x - 10 * k * s + i * 3 * k * s, y - 22 * k * s, x - 10 * k * s + i * 6 * k * s, y - 17 * k * s); g.stroke(); } }
    const tx = w * .44, ty = h * .9, s2 = 1.7; g.fillStyle = '#2e3a3c'; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + 2 * k * s2, ty - 10 * k * s2, tx, ty - 16 * k * s2); g.quadraticCurveTo(tx - 12 * k * s2, ty - 20 * k * s2, tx - 16 * k * s2, ty - 24 * k * s2); g.quadraticCurveTo(tx - 6 * k * s2, ty - 16 * k * s2, tx + 2 * k * s2, ty - 18 * k * s2); g.quadraticCurveTo(tx + 10 * k * s2, ty - 16 * k * s2, tx + 20 * k * s2, ty - 24 * k * s2); g.quadraticCurveTo(tx + 14 * k * s2, ty - 18 * k * s2, tx + 4 * k * s2, ty - 16 * k * s2); g.quadraticCurveTo(tx + 6 * k * s2, ty - 8 * k * s2, tx + 6 * k * s2, ty); g.fill(); g.fillStyle = pap(.7); for (let i = 0; i < 8; i++) dot(g, tx + (r() - .5) * 30 * k, ty - 30 * k - r() * 10 * k, (.8 + r()) * k); g.restore(); }],
  fog: ['fog', .5, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.fog, r, { rows: 6, rough: .6 }); g.save(); g.globalAlpha = .28; ship(g, w * .72, h * .7, k * .5, { flag: null }); g.globalAlpha = .55; ship(g, w * .32, h * .84, k * .7, { flag: K.ju }); g.restore(); for (let i = 0; i < 4; i++) mist(g, w, h * (.3 + i * .18), h * .2, .5, r); }],
  fever: ['dusk', .42, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.dusk, r, { rows: 6 }); deckBand(g, w, h, h * .66); fig(g, w * .32, h * .84, k * 1.4, { pose: 'lie', cloth: '#c9bfa6' }); const px = w * .66, py = h * .84; g.fillStyle = '#3a2a20'; g.fillRect(px - 9 * k, py - 4 * k, 18 * k, 4 * k); g.fillStyle = 'rgba(226,112,48,.85)'; g.fillRect(px - 7 * k, py - 5 * k, 14 * k, 1.4 * k); g.fillStyle = '#5a4434'; g.beginPath(); g.ellipse(px, py - 10 * k, 8 * k, 6 * k, 0, 0, TAU); g.fill(); g.strokeStyle = ink(.85); g.lineWidth = 1; g.stroke(); ln(g, px + 7 * k, py - 12 * k, px + 13 * k, py - 15 * k);
    for (let i = 0; i < 6; i++) { const q = i / 6; g.strokeStyle = pap(.55 * (1 - q)); g.lineWidth = 1.4; g.beginPath(); g.moveTo(px + Math.sin(q * 8) * 3 * k, py - 16 * k - q * 30 * k); g.quadraticCurveTo(px + 4 * k, py - 20 * k - q * 30 * k, px - Math.sin(q * 8) * 3 * k, py - 24 * k - q * 30 * k); g.stroke(); } lantern(g, w * .5, h * .3, k, '#c9a25a', true); }],
  grumble: ['dusk', .4, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.dusk, r, { rows: 5 }); deckBand(g, w, h, h * .7); const y = h * .9; fig(g, w * .3, y, k * 1.6, { pose: 'point', hat: 'top' }); fig(g, w * .42, y, k * 1.5, { pose: 'stand', hat: 'top', flip: 1 }); fig(g, w * .55, y, k * 1.55, { pose: 'carry', hat: 'kasa', flip: 1 }); fig(g, w * .68, y + 2 * k, k * 1.3, { pose: 'sit', hat: 'top', flip: 1 }); crate(g, w * .8, y - 4 * k, k * 1.6); g.strokeStyle = ink(.9); g.lineWidth = 2; ln(g, w * .12, y, w * .2, y - 26 * k); }],
  smuggler: ['night', .48, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.night, r, { rows: 8 }); ship(g, w * .3, h * .82, k * .75, { furled: 1, hull: '#1e1a16', sail: '#4a4a44', sail2: '#5a5a52', flag: null }); boat(g, w * .7, h * .86, k * 1.8, 'skiff', -1, { night: 1, hat: 'hood' }); crate(g, w * .66, h * .82, k * 1.2, .1, '#4a3a2a'); lantern(g, w * .76, h * .74, k, 'rgba(232,170,80,.95)', true); fig(g, w * .52, h * .74, k * 1.1, { pose: 'carry', hat: 'hood', load: '#4a3a2a' }); }],
  stars: ['night', .62, (g, w, h, hz, k, r) => { g.save(); g.strokeStyle = 'rgba(220,226,214,.12)'; g.lineWidth = 26 * k; g.beginPath(); g.moveTo(-10, hz * .9); g.quadraticCurveTo(w * .5, hz * .05, w + 10, hz * .4); g.stroke(); const D = [[.62, .18], [.68, .14], [.74, .16], [.79, .2], [.82, .32], [.9, .33], [.89, .2]]; g.strokeStyle = 'rgba(214,165,64,.45)'; g.lineWidth = .8; g.beginPath(); D.forEach(([x, y], i) => i ? g.lineTo(w * x, hz * y * 1.6) : g.moveTo(w * x, hz * y * 1.6)); g.stroke(); g.fillStyle = '#efe6c8'; for (const [x, y] of D) dot(g, w * x, hz * y * 1.6, 1.8); g.fillStyle = '#efe9d6'; dot(g, w * .18, hz * .28, 9 * k); g.fillStyle = MOOD.night.sky[0]; dot(g, w * .18 + 4 * k, hz * .28 - 2 * k, 8 * k); g.restore();
    sea(g, w, h, hz, MOOD.night, r, { rows: 6 }); ship(g, w * .5, h * .94, k * .5, { hull: '#141a1b', sail: '#2a3232', sail2: '#3a4444', flag: null }); }],
  envoy: ['day', .5, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.day, r, { rows: 9 }); boat(g, w * .2, h * .7, k * 1.1, 'junk', 1, {}); ship(g, w * .58, h * .84, k * .72, { type: 'junk', hull: '#5a2a1c', sail: '#d6c48c', sail2: '#e8d9a8', trim: K.dy, masts: 3, streamers: [K.db, K.dr, K.dg], flag: K.dy, lanterns: K.ju }); g.save(); const ux = w * .58 + 22 * k * .72, uy = h * .84 - 30 * k * .72; g.strokeStyle = K.ink; g.lineWidth = 1; ln(g, ux, uy + 10 * k, ux, uy - 4 * k); g.fillStyle = K.ju; g.beginPath(); g.ellipse(ux, uy - 4 * k, 8 * k, 3 * k, 0, Math.PI, TAU); g.fill(); g.fillStyle = K.dy; g.fillRect(ux - 8 * k, uy - 4 * k, 16 * k, 1.4 * k); g.restore(); }],
  drift: ['day', .42, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.day, r, { rows: 10 }); const x = w * .5, y = h * .72; g.save(); g.translate(x, y); g.rotate(-.22); g.scale(1.3, 1.3); const gr = g.createLinearGradient(-14 * k, 0, 14 * k, 0); gr.addColorStop(0, '#5a4030'); gr.addColorStop(.45, '#8a6448'); gr.addColorStop(1, '#3e2c20'); g.fillStyle = gr; g.beginPath(); g.moveTo(-6 * k, -22 * k); g.quadraticCurveTo(-18 * k, -16 * k, -15 * k, 0); g.quadraticCurveTo(-10 * k, 12 * k, 0, 12 * k); g.quadraticCurveTo(10 * k, 12 * k, 15 * k, 0); g.quadraticCurveTo(18 * k, -16 * k, 6 * k, -22 * k); g.closePath(); g.fill(); g.strokeStyle = ink(.85); g.lineWidth = 1.1; g.stroke();
    g.fillStyle = '#d8c9a2'; g.beginPath(); g.ellipse(0, -23 * k, 8 * k, 3 * k, 0, 0, TAU); g.fill(); g.stroke(); g.strokeStyle = '#8a3424'; g.lineWidth = 1.4; ln(g, -8 * k, -20 * k, 8 * k, -20 * k); g.strokeStyle = pap(.25); g.lineWidth = 3 * k; ln(g, -9 * k, -12 * k, -10 * k, 2 * k); g.restore(); waveRow(g, y + 10 * k, w, 2 * k, 14 * k, 1, .5, 1.2, true); ripple(g, x, y + 12 * k, 24 * k, k, .8); birds(g, w * .7, hz * .4, k, 3, r); }],
  pirate: ['storm', .5, (g, w, h, hz, k, r) => { cloudMass(g, w * .7, hz * .3, w * .8, hz * .6, .35, r); sea(g, w, h, hz, MOOD.storm, r, { rows: 10, rough: 1.3 }); ship(g, w * .62, h * .84, k * .8, { look: SHIP.pirate, dir: -1, sway: 1 }); }],
  rival: ['day', .5, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.day, r, { rows: 9, rough: 1.2 }); ship(g, w * .62, h * .7, k * .5, { type: 'junk', hull: '#3a3428', sail: '#8a8a7a', sail2: '#a8a896', flag: K.db, sway: 1.5 }); ship(g, w * .4, h * .9, k * .66, { flag: K.ju, sway: 1.5 }); g.strokeStyle = pap(.7); g.lineWidth = 1.2; for (let i = 0; i < 5; i++) { const y = h * (.72 + i * .05); ln(g, w * (.02 + r() * .1), y, w * (.2 + r() * .1), y); } }],
  black: ['storm', .5, (g, w, h, hz, k, r) => { cloudMass(g, w * .6, hz * .3, w, hz * .7, .45, r); sea(g, w, h, hz, MOOD.storm, r, { rows: 10, rough: 1.4 }); ship(g, w * .6, h * .84, k * .8, { look: SHIP.black, dir: -1 }); }],
  /* 포구 사건 */
  brawl: ['dusk', .5, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.dusk, r, { rows: 4 }); g.fillStyle = '#6a5644'; g.fillRect(0, h * .8, w, h * .2); g.strokeStyle = ink(.3); for (let x = 0; x < w; x += 12 * k) ln(g, x, h * .8, x - 6 * k, h); hall(g, w * .2, h * .82, k * 2.4, { w: 40, wall: 14, roof: 11, windows: 1, wallCol: '#e2d6bb' }); g.strokeStyle = ink(.85); g.lineWidth = 1.4; ln(g, w * .44, h * .2, w * .44, h * .82); g.fillStyle = '#efe7d2'; g.fillRect(w * .44, h * .22, 11 * k, 30 * k); g.strokeStyle = K.ju; g.lineWidth = 1.2; g.strokeRect(w * .44 + 2, h * .22 + 2, 11 * k - 4, 30 * k - 4); lantern(g, w * .36, h * .36, k * 1.3, K.ju, true);
    fig(g, w * .62, h * .97, k * 1.1, { pose: 'fight', hat: 'top' }); fig(g, w * .74, h * .97, k * 1.1, { pose: 'fight', hat: 'kasa', flip: 1 }); fig(g, w * .88, h * .97, k * .95, { pose: 'point', hat: 'top', flip: 1 }); g.save(); g.translate(w * .69, h * .3); g.rotate(.8); g.fillStyle = '#6a5038'; g.fillRect(-8 * k, -2 * k, 16 * k, 3.4 * k); g.strokeStyle = ink(.85); g.lineWidth = 1.4; ln(g, -6 * k, 1 * k, -7 * k, 9 * k); ln(g, 6 * k, 1 * k, 7 * k, 9 * k); g.restore(); g.strokeStyle = ink(.5); g.lineWidth = .9; for (let i = 0; i < 3; i++) ln(g, w * .64 + i * 5 * k, h * .42 - i * k, w * .66 + i * 5 * k, h * .38 - i * k); }],
  auction: ['day', .55, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.day, r, { rows: 5 }); boat(g, w * .8, hz + 12 * k, k * 1.4, 'silla', -1, {}); pier(g, 0, w, h * .7, k * 2, r); g.fillStyle = '#7a6048'; g.fillRect(0, h * .7, w, h * .3); g.strokeStyle = ink(.4); for (let x = 0; x < w; x += 9 * k) ln(g, x, h * .7, x, h); crate(g, w * .5, h * .76, k * 2.2, 0, '#8a6a44'); g.fillStyle = K.ju; g.fillRect(w * .5 - 3 * k, h * .76 - 3 * k, 6 * k, 6 * k);
    for (const [fx, p, hat, fl] of [[.24, 'stand', 'top', 0], [.32, 'point', 'kasa', 0], [.68, 'wave', 'bok', 1], [.78, 'stand', 'top', 1], [.86, 'stand', 'kasa', 1]]) fig(g, w * fx, h * .96, k * 1.5, { pose: p, hat, flip: fl }); }],
  orphan: ['dusk', .55, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.dusk, r, { rows: 7 }); ship(g, w * .7, h * .76, k * .6, { furled: 1, flag: K.ju }); g.fillStyle = '#5a4838'; g.fillRect(0, h * .8, w * .46, 4 * k); pier(g, 0, w * .46, h * .8 + 2 * k, k * 2, r); fig(g, w * .38, h * .8, k * 1.6, { child: 1, hat: 'top', pose: 'stand' }); ripple(g, w * .5, h * .9, 30 * k, k, .4); }],
  fire: ['night', .6, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.night, r, { rows: 4 }); g.fillStyle = '#2a2420'; g.fillRect(0, h * .8, w, h * .2); hall(g, w * .5, h * .82, k * 2.2, { w: 40, wall: 12, roof: 9, style: 'tile', wallCol: '#4a3a30' }); const gr = g.createRadialGradient(w * .5, h * .5, 0, w * .5, h * .5, w * .4); gr.addColorStop(0, 'rgba(226,112,48,.45)'); gr.addColorStop(1, 'rgba(226,112,48,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    flame(g, w * .5, h * .48, 30 * k, 34 * k, r); smoke(g, w * .54, h * .2, k * 2.4, r, .4, 20); for (const [fx, fl] of [[.18, 0], [.26, 0], [.8, 1]]) fig(g, w * fx, h * .95, k * 1.4, { pose: 'carry', hat: 'top', flip: fl, load: '#3e4e50' }); }],
  taxman: ['day', .5, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.day, r, { rows: 6 }); ship(g, w * .74, h * .86, k * .9, { furled: 1, flag: K.ju }); g.strokeStyle = '#6a5038'; g.lineWidth = 3 * k; ln(g, w * .3, h * .9, w * .52, h * .72); fig(g, w * .4, h * .84, k * 1.8, { pose: 'carry', hat: 'bok', robe: '#2a4f86' }); g.fillStyle = '#efe6cc'; g.fillRect(w * .4 - 4 * k, h * .84 - 33 * k, 8 * k, 6 * k); g.strokeStyle = ink(.8); g.lineWidth = .7; g.strokeRect(w * .4 - 4 * k, h * .84 - 33 * k, 8 * k, 6 * k); fig(g, w * .24, h * .95, k * 1.5, { pose: 'stand', hat: 'top' }); }],
  oldcap: ['night', .3, (g, w, h, hz, k, r) => { const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#2e2620'); bg.addColorStop(1, '#3e3026'); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; for (let x = 20; x < w; x += 34) ln(g, x, 0, x, h * .45); g.fillStyle = '#5a4434'; g.fillRect(0, h * .45, w, h * .55); g.strokeStyle = 'rgba(0,0,0,.25)'; for (let y = h * .5; y < h; y += 9) ln(g, 0, y, w, y);
    const cx = w * .48, cy = h * .72; g.save(); g.translate(cx, cy); g.rotate(-.06); g.fillStyle = '#e4d6b2'; g.fillRect(-60 * k, -22 * k, 120 * k, 44 * k); g.strokeStyle = ink(.6); g.lineWidth = .8; g.strokeRect(-60 * k, -22 * k, 120 * k, 44 * k); g.fillStyle = 'rgba(80,100,90,.45)'; g.beginPath(); g.ellipse(-30 * k, -4 * k, 20 * k, 9 * k, .4, 0, TAU); g.fill(); g.beginPath(); g.ellipse(26 * k, 6 * k, 14 * k, 7 * k, -.3, 0, TAU); g.fill(); g.strokeStyle = 'rgba(176,58,38,.8)'; g.setLineDash([3, 2]); g.beginPath(); g.moveTo(-14 * k, 2 * k); g.quadraticCurveTo(0, -14 * k, 18 * k, 2 * k); g.stroke(); g.setLineDash([]); g.strokeStyle = K.ju; g.lineWidth = 1.6; ln(g, 18 * k, -1 * k, 23 * k, 4 * k); ln(g, 23 * k, -1 * k, 18 * k, 4 * k); g.fillStyle = '#c9b78e'; g.fillRect(-64 * k, -24 * k, 6 * k, 48 * k); g.fillRect(58 * k, -24 * k, 6 * k, 48 * k); g.restore();
    const lx = w * .84, ly = h * .56; const gr = g.createRadialGradient(lx, ly, 0, lx, ly, 90 * k); gr.addColorStop(0, 'rgba(240,190,100,.42)'); gr.addColorStop(1, 'rgba(240,190,100,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#e9e1cc'; g.fillRect(lx - 2.4 * k, ly, 4.8 * k, 14 * k); g.fillStyle = 'rgba(240,180,80,.95)'; g.beginPath(); g.ellipse(lx, ly - 3.5 * k, 2 * k, 4 * k, 0, 0, TAU); g.fill(); g.fillStyle = '#7a6a56'; g.beginPath(); g.ellipse(w * .14, h * .66, 8 * k, 3 * k, 0, 0, TAU); g.fill(); g.fillRect(w * .14 - 7 * k, h * .66, 14 * k, 9 * k); g.strokeStyle = ink(.85); g.lineWidth = 1.4; ln(g, w * .2, h * .9, w * .3, h * .62); }],
  dance: ['night', .55, (g, w, h, hz, k, r) => { sea(g, w, h, hz, MOOD.night, r, { rows: 4 }); g.fillStyle = '#2e2620'; g.fillRect(0, h * .78, w, h * .22); g.strokeStyle = ink(.7); g.lineWidth = .8; g.beginPath(); g.moveTo(0, h * .14); g.quadraticCurveTo(w * .5, h * .38, w, h * .14); g.stroke(); for (let i = 1; i < 9; i++) { const q = i / 9, x = w * q, y = h * .14 + (h * .24) * 4 * q * (1 - q) * .5 + 4 * k; lantern(g, x, y, k * 1.1, i % 2 ? K.ju : K.dy, true); }
    const dx = w * .48, dy = h * .94; g.fillStyle = '#7a3a28'; g.beginPath(); g.ellipse(dx, dy - 14 * k, 10 * k, 12 * k, 0, 0, TAU); g.fill(); g.strokeStyle = ink(.9); g.stroke(); for (const [fx, fl, rb] of [[.24, 0, K.dr], [.34, 1, K.db], [.64, 0, K.dg], [.76, 1, K.dr]]) fig(g, w * fx, dy, k * 1.6, { pose: 'wave', hat: 'top', flip: fl, robe: rb, col: 'rgba(20,20,18,.95)' }); }],
  swindle: ['dusk', .55, (g, w, h, hz, k, r) => { const st = g.createLinearGradient(0, hz, 0, h * .78); st.addColorStop(0, '#9c8e74'); st.addColorStop(1, '#7a6a54'); g.fillStyle = st; g.fillRect(0, hz, w, h * .78 - hz); hall(g, w * .5, hz + 2, k * 1.1, { w: 40, wall: 8, roof: 8, wallCol: '#cdbf9f' }); g.fillStyle = '#6a5a48'; g.fillRect(0, h * .78, w, h * .22); g.fillStyle = '#c4b697'; g.fillRect(0, h * .2, w * .3, h * .6); g.fillRect(w * .7, h * .2, w * .3, h * .6); g.strokeStyle = ink(.22); g.lineWidth = .7; for (let y = h * .24; y < h * .78; y += 6 * k) { ln(g, 0, y, w * .3, y); ln(g, w * .7, y, w, y); } g.fillStyle = 'rgba(30,26,22,.6)'; g.fillRect(w * .1, h * .44, 12 * k, 30 * k); g.fillRect(w * .84, h * .5, 10 * k, 20 * k);
    roof(g, w * .15, h * .2, w * .36, 14 * k, 'tile', {}); roof(g, w * .85, h * .2, w * .36, 14 * k, 'tile', {}); const sh = g.createLinearGradient(w * .3, 0, w * .7, 0); sh.addColorStop(0, 'rgba(27,35,36,.35)'); sh.addColorStop(.5, 'rgba(27,35,36,0)'); sh.addColorStop(1, 'rgba(27,35,36,.35)'); g.fillStyle = sh; g.fillRect(w * .3, h * .55, w * .4, h * .45);
    fig(g, w * .47, h * .96, k * 1.15, { pose: 'beg', hat: 'hood', robe: '#3a3632' }); g.fillStyle = '#8a7656'; g.beginPath(); g.ellipse(w * .56, h * .92, 9 * k, 7 * k, 0, 0, TAU); g.fill(); g.strokeStyle = ink(.8); g.lineWidth = 1; g.stroke(); ln(g, w * .56 - 3 * k, h * .92 - 7 * k, w * .56 + 3 * k, h * .92 - 6 * k); lantern(g, w * .66, h * .34, k * 1.3, '#c9a25a', true); }],
};
/* 항해 사건 19 + 해적·흑기·경쟁 상단 + 포구 사건 8 */
const PE_BY_TITLE = { '선술집 싸움': 'brawl', '부두 경매': 'auction', '부두의 아이': 'orphan', '부두의 불': 'fire', '세리': 'taxman', '늙은 선장': 'oldcap', '포구 잔치': 'dance', '수상한 상인': 'swindle' };
function eventScene(g, w, h, id, ch) { const E = EV[id] || EV.fog, m = MOOD[E[0]], hz = h * E[1], k = Math.min(h / 120, w / 330), r = rng(hash(id) + 3);
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; sky(g, w, h, hz, m, r); E[2](g, w, h, hz, k, r); g.restore();
  vignette(g, w, h, m.night ? .3 : .16); paper(g, w, h, r, Math.round(w * h / 300));
  if (ch) seal(g, w - 26, h - 26, ch, 30); }
/* 낙관 — 오른쪽 아래 붉은 도장 */
function seal(g, x, y, ch, s) { g.save(); g.translate(x, y); g.rotate(-.06); g.globalAlpha = .9; g.fillStyle = K.ju; g.fillRect(-s / 2, -s / 2, s, s); g.strokeStyle = 'rgba(245,240,227,.8)'; g.lineWidth = 1.2; g.strokeRect(-s / 2 + 2.5, -s / 2 + 2.5, s - 5, s - 5); g.fillStyle = '#f5f0e3'; g.font = `${Math.round(s * .62)}px "Chunghae Seal","Chunghae Myeong",serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 0, 1); g.restore(); }

/* ═══════════ 결말 그림 ═══════════ */
const ENDS = {
  sea_king: (g, w, h, k, r) => { portScene(g, w, h, 'cheonghae', { season: 2, tod: 'dawn' }); for (let i = 0; i < 5; i++) boat(g, w * (.05 + i * .1), h * (.86 + (i % 2) * .06), k * 1.1, i % 2 ? 'junk' : 'silla', 1, { flag: K.ju }); },
  throne: (g, w, h, k, r) => { const m = MOOD.dusk, hz = h * .62; sky(g, w, h, hz, m, r); ridge(g, w, hz, { amp: h * .3, peaks: [[.2, .8, .2, 1.6], [.8, 1, .2, 1.5]], col: m.far, a: .5 }, r); g.fillStyle = '#d8ceb2'; g.fillRect(0, hz, w, h - hz); for (let i = 0; i < 3; i++) { g.fillStyle = '#cbbf9f'; g.fillRect(w * (.3 - i * .04), hz + 4 + i * 6 * k, w * (.4 + i * .08), 6 * k); g.strokeStyle = ink(.4); g.strokeRect(w * (.3 - i * .04), hz + 4 + i * 6 * k, w * (.4 + i * .08), 6 * k); }
    hall(g, w * .5, hz + 6, k * 1.9, { w: 40, wall: 10, roof: 11, chimi: true, tier: 2 }); for (const [fx, c] of [[.18, K.ju], [.26, K.dy], [.74, K.db], [.82, K.dg]]) banner(g, w * fx, h * .92, k * 1.6, c, 22); },
  yeomjang: (g, w, h, k, r) => { const m = MOOD.night, hz = h * .4; sky(g, w, h, hz, m, r); g.fillStyle = '#2a221c'; g.fillRect(0, hz, w, h); deckBand(g, w, h, h * .62, 1); const lx = w * .5, ly = h * .5; const gr = g.createRadialGradient(lx, ly, 0, lx, ly, 90 * k); gr.addColorStop(0, 'rgba(240,190,100,.35)'); gr.addColorStop(1, 'rgba(240,190,100,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); lantern(g, lx, ly, k * 1.3, '#c9a25a', false);
    g.save(); g.translate(w * .36, h * .82); g.rotate(-.2); g.fillStyle = '#c8ccc4'; g.fillRect(0, -1.2 * k, 60 * k, 2.4 * k); g.fillStyle = '#3a2a20'; g.fillRect(-14 * k, -2 * k, 14 * k, 4 * k); g.restore(); g.fillStyle = '#d8d0bc'; g.save(); g.translate(w * .66, h * .8); g.rotate(1.3); g.beginPath(); g.moveTo(-5 * k, -4 * k); g.lineTo(5 * k, -4 * k); g.lineTo(3 * k, 4 * k); g.lineTo(-3 * k, 4 * k); g.closePath(); g.fill(); g.restore(); g.fillStyle = 'rgba(141,42,27,.6)'; g.beginPath(); g.ellipse(w * .7, h * .86, 14 * k, 3 * k, 0, 0, TAU); g.fill(); },
  wander: (g, w, h, k, r) => { const m = MOOD.dusk, hz = h * .55; sky(g, w, h, hz, m, r); sea(g, w, h, hz, m, r, { rows: 10 }); ship(g, w * .62, h * .8, k * .5, { flag: K.ju, sway: 1.5 }); birds(g, w * .3, h * .25, k, 3, r); },
  ara_true: (g, w, h, k, r) => { const m = MOOD.night, hz = h * .5; sky(g, w, h, hz, m, r); sea(g, w, h, hz, m, r, { rows: 7 }); for (let i = 0; i < 7; i++) { const x = w * (.08 + i * .14), y = h * (.68 + (i % 3) * .1); boat(g, x, y, k * (1.7 + (i % 3) * .3), i % 2 ? 'junk' : 'silla', 1, { night: 1, lamp: 1, furled: 1 }); lantern(g, x - 8 * k, y - 26 * k, k * .8, K.ju, true); } },
  ara_alone: (g, w, h, k, r) => { const m = MOOD.fog, hz = h * .55; sky(g, w, h, hz, m, r); sea(g, w, h, hz, m, r, { rows: 6 }); pier(g, w * .1, w * .6, h * .72, k * 2, r); hall(g, w * .22, h * .72, k * 1.6, { w: 30, wall: 10, roof: 9, style: 'thatch' }); lantern(g, w * .4, h * .5, k * 1.3, K.ju, true); boat(g, w * .74, h * .8, k * 1.4, 'silla', -1, { furled: 1 }); mist(g, w, h * .7, h * .2, .4, r); },
  ara_merchant: (g, w, h, k, r) => { portScene(g, w, h, 'yangzhou', { season: 3, tod: 'dusk' }); },
  tomo_true: (g, w, h, k, r) => { const m = MOOD.dawn, hz = h * .55; sky(g, w, h, hz, m, r); sea(g, w, h, hz, m, r, { rows: 9 }); ship(g, w * .22, h * .86, k * .5, { flag: K.ju }); ship(g, w * .52, h * .8, k * .48, { type: 'junk', hull: '#4a3020', sail: '#a5745a', sail2: '#c08e70', flag: K.db }); ship(g, w * .8, h * .88, k * .5, { type: 'wa', sails: 'mat', hull: '#3a2a1c', sail: '#c9b48a', sail2: '#d9c89e', flag: '#efe9da', dir: -1 }); },
  tomo_shadow: (g, w, h, k, r) => { portScene(g, w, h, 'hakata', { season: 3, tod: 'night' }); },
  tomo_exile: (g, w, h, k, r) => { portScene(g, w, h, 'amami', { season: 2, tod: 'dusk' }); },
  quota: (g, w, h, k, r) => { portScene(g, w, h, 'cheonghae', { season: 0, tod: 'storm' }); },
  assassin: (g, w, h, k, r) => { ENDS.yeomjang(g, w, h, k, r); },
  retire: (g, w, h, k, r) => { const m = MOOD.dusk, hz = h * .52; sky(g, w, h, hz, m, r); sea(g, w, h, hz, m, r, { rows: 8, rough: .6 }); pier(g, w * .3, w, h * .72, k * 2, r); ship(g, w * .5, h * .9, k * .55, { furled: 1, flag: K.ju }); person(g, w * .8, h * .72, k * 1.5, { pose: 'sit', hat: 'kasa' }); }
};
function ending(g, w, h, id) { const r = rng(hash(id) + 11), k = Math.min(h / 120, w / 330); g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; (ENDS[id] || ENDS.wander)(g, w, h, k, r); g.restore(); vignette(g, w, h, .2); paper(g, w, h, r, Math.round(w * h / 300)); }
function endArt(scroll, id) { if (!scroll) return; style(); const cv = document.createElement('canvas'); cv.className = 'end-art'; cv.setAttribute('aria-hidden', 'true'); const lead = scroll.querySelector('.lead'); if (lead) lead.after(cv); else scroll.prepend(cv);
  let n = 0; const go = () => { const w = cv.clientWidth, hh = cv.clientHeight; if (!w && n++ < 10) { requestAnimationFrame(go); return; } if (w) ending(prep(cv, w, hh), w, hh, id); }; go(); }
/* 해전 화면 시트용: 바다 위에 배 하나 */
function shipCard(g, w, h, id, ch, kind) { const r = rng(5), m = MOOD.day, hz = h * .38, wl = h * .72, sc = Math.max(.5, Math.min(1.15, w / 560)) * 1.6; sky(g, w, h, hz, m, r); sea(g, w, h, hz, m, r, { rows: 8 }); const B = { spec: { kind }, e: { boss: kind === 'boss' ? id : null, g: SHIP_G[id] } }; foe(g, w * .5, wl, sc * (kind === 'boss' ? 1.18 : 1), { dir: -1, t: 0, ch, chBg: kind === 'boss' ? K.ju : K.ink }, B); }
const SHIP_G = { jang: 'boarder', saburo: 'archer', wangdu: 'fire', hong: 'archer', okuma: 'boarder', ilang: 'tough', 'p-archer': 'archer', 'p-boarder': 'boarder', 'p-fire': 'fire', 'p-tough': 'tough', 'p-plain': 'plain' };

const EVENTS = Object.keys(EV).map(id => [id, { storm: '風', calm: '靜', wreck: '破', sail: '帆', castaway: '漂', reef: '礁', fairwind: '順', monk: '僧', captives: '奴', ghost: '鬼', spout: '龍', whale: '鯨', fog: '霧', fever: '病', grumble: '怨', smuggler: '密', stars: '星', envoy: '使', drift: '流', pirate: '賊', rival: '商', black: '黑', brawl: '港', auction: '港', orphan: '港', fire: '港', taxman: '港', oldcap: '港', dance: '港', swindle: '港' }[id]]);
const SHIPS = [['jang', '水', 'boss'], ['saburo', '眼', 'boss'], ['wangdu', '髥', 'boss'], ['hong', '紅', 'boss'], ['okuma', '狼', 'boss'], ['ilang', '龍', 'boss'], ['p-plain', '賊', 'pirate'], ['p-archer', '賊', 'pirate'], ['p-boarder', '賊', 'pirate'], ['p-fire', '賊', 'pirate'], ['p-tough', '賊', 'pirate'], ['black', '黑', 'black'], ['slaver', '奴', 'slaver']];
return { rng, hash, MOOD, PA, ARCH_OF, EVENTS, SHIPS, ENDS: Object.keys(ENDS).map(k => [k]), PE_BY_TITLE, portScene, portMood, eventScene, ship, foe, shipLook, shipCard, ending, endArt, portBanner, cardArt, clearArt, prep, hall, pagoda, boat, person, _: { sky, sea, ridge, land, paper, vignette, pine, tower, cityWall, palisade, smoke, birds, waveRow, mist, rain, volcano, clump, willow, conifer, palm, reeds, banner, pier, lamps, bridge, dot, ln, ink, pap, rgb, K } };
})();
