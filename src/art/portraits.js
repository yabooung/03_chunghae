/* ═══════════════════════════════════════════════════════════
   청해 — 인물 그림 (가슴 위 초상)
   한지 위 먹선, 평평한 안료 채색, 오른쪽 아래로 먹물 번진 그늘(빛은 왼쪽 위).
   모두 100×100 칸 SVG를 손으로 짠 부품(얼굴·눈썹·눈·입·수염·머리·관모·옷깃·소품)으로 조립한다.
   PORTRAIT.svg(id, { size, expr, frame, flip }) → SVG 문자열.  DOM·규칙과 무관하다.
   ═══════════════════════════════════════════════════════════ */
const PORTRAIT = (() => {
'use strict';
const INK = '#1b2324', PAPER = '#f5f0e3', HANJI = '#ece5d3';
const SKIN = { // [바탕, 그늘]
  fair: ['#efd3b2', '#d9b28c'], warm: ['#e7c49c', '#cc9f74'], tan: ['#d6a97b', '#b9875a'], deep: ['#b98a5f', '#966a43'], pale: ['#dcd6bd', '#bdb69a'] };
const HAIR = { ink: ['#1e2425', '#4a5653'], grey: ['#8d9187', '#b9bbb0'], white: ['#e9e4d6', '#a9a596'], red: ['#9a3a22', '#d0703e'], brown: ['#3b2a1c', '#6b4a32'] };
const r1 = n => Math.round(n * 10) / 10;
let uid = 0;

/* 그리기 도구 — d는 "M x y C …" 문자열, 숫자는 소수 한 자리 */
const num = s => s.replace(/-?\d+\.\d{2,}/g, m => r1(+m));
function P(d, fill, o = {}) { return `<path d="${num(d)}" fill="${fill || 'none'}"${o.s ? ` stroke="${o.s}" stroke-width="${o.w || 1.4}" stroke-linejoin="round" stroke-linecap="round"` : ''}${o.a != null ? ` opacity="${o.a}"` : ''}/>`; }
const E = (x, y, rx, ry, fill, o = {}) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${fill}"${o.s ? ` stroke="${o.s}" stroke-width="${o.w || 1.4}"` : ''}${o.a != null ? ` opacity="${o.a}"` : ''}/>`;
/* 먹 테두리 띠: 먹으로 굵게 한 번, 그 위에 색으로 한 번 — 끝이 맞물리는 옷깃·끈에 쓴다 */
const BAND = (d, col, w, ow) => P(d, null, { s: INK, w: w + ow }) + P(d, null, { s: col, w });

/* ─────────── 얼굴 틀 ─────────── */
function headGeo(c) { const f = Object.assign({ w: 13.5, jw: 10, chin: 64, cheek: 0 }, c.face); f.w += 1.1; f.jw += .9; f.chin -= 1.2; const turn = c.turn == null ? 1.2 : c.turn;
  return { w: f.w, jw: f.jw, ch: f.chin, L: 50 - f.w, R: 50 + f.w - turn * .5, cx: 50 + turn, chx: 50 + turn * .8, cheek: f.cheek, ey: f.ey || 45.5, my: f.my || (f.chin - 6.3) }; }
function facePath(g) { const { L, R, jw, ch, chx, cheek } = g, jl = 50 - jw, jr = 50 + jw - .4;
  return `M50 22C${50 + g.w * .82} 22 ${R} 30 ${R} 42C${R + cheek} 48.5 ${jr + 2.4} 53 ${jr + .6} 56.4C${jr - 1.6} 60.6 ${chx + 4.6} ${ch} ${chx} ${ch}C${chx - 5} ${ch} ${jl + 1.6} 60.6 ${jl - .6} 56.4C${jl - 2.4} 53 ${L - cheek} 48.5 ${L} 42C${L} 30 ${50 - g.w * .82} 22 50 22Z`; }
function faceShade(g) { const { R, ch, chx, jw } = g, jr = 50 + jw - .4;
  return `M${R - .2} 33C${R - 3.6} 40 ${R - 2.6} 50 ${jr - 2.5} 56.5C${jr - 4.8} 60.4 ${chx + 3} ${ch - .6} ${chx + .6} ${ch}C${chx + 4.2} ${ch} ${jr - 2.6} 60.5 ${jr} 56C${jr + 1.8} 52.5 ${R} 48 ${R} 41Z`; }
function ears(g, sk, sw) { return P(`M${g.L + 1.2} ${g.ey - 1.6}C${g.L - 2.6} ${g.ey - 3.4} ${g.L - 3.2} ${g.ey + 1.4} ${g.L - 1.4} ${g.ey + 3.6}C${g.L - .6} ${g.ey + 4.8} ${g.L + .6} ${g.ey + 5} ${g.L + 1.4} ${g.ey + 4.4}Z`, sk[0], { s: INK, w: sw * .75 })
  + P(`M${g.L - .2} ${g.ey - .6}q-1.2 1.6 .2 3.4`, null, { s: sk[1], w: .9 })
  + P(`M${g.R - 1.2} ${g.ey - 1.6}C${g.R + 2.4} ${g.ey - 3.2} ${g.R + 2.8} ${g.ey + 1.4} ${g.R + 1.2} ${g.ey + 3.6}C${g.R + .4} ${g.ey + 4.8} ${g.R - .6} ${g.ey + 5} ${g.R - 1.4} ${g.ey + 4.4}Z`, sk[1], { s: INK, w: sw * .75 }); }
function neck(g, sk, sw, low) { const y2 = low || 70, nw = g.nw || 6.8; return P(`M${50 - nw} 52L${50 - nw - .4} ${y2 - 2}Q50 ${y2 + 3} ${50 + nw + .4} ${y2 - 2}L${50 + nw} 52Z`, sk[1], { s: INK, w: sw })
  + P(`M${50 - 6.5} 57C${50 - 2} 61 ${50 + 3} 61.5 ${50 + 6.5} 58.5`, null, { s: INK, w: .6, a: .25 }); }

/* ─────────── 눈썹 · 눈 · 코 · 입 ─────────── */
const EXPR = {
  neutral: { tilt: 0, lift: 0, lid: .1, mouth: 'flat' },
  determined: { tilt: 2.3, lift: -.7, lid: .3, mouth: 'firm' },
  grim: { tilt: -1.7, lift: .4, lid: .45, mouth: 'down', furrow: 1 },
  smile: { tilt: -.3, lift: .5, lid: .3, mouth: 'smile', smileEye: 1 },
  smirk: { tilt: .6, lift: 0, lid: .35, mouth: 'smirk' },
  snarl: { tilt: 2, lift: -.8, lid: .3, mouth: 'grin', furrow: 1 },
  calm: { tilt: -.2, lift: .2, lid: 1, mouth: 'soft' },
  sly: { tilt: .9, lift: .1, lid: .45, mouth: 'smirk' }
};
function brows(g, c, x, sw) { const b = Object.assign({ w: 7, th: 1.8, arch: .9, y: 0, col: null }, c.brow), col = b.col || HAIR[c.hairCol || 'ink'][0];
  let out = ''; for (const side of [-1, 1]) { const far = side > 0, k = far ? .9 : 1, ex = g.cx + side * (far ? 6 : 6.4), by = g.ey - 5.2 + b.y - x.lift;
    const ix = ex - side * b.w * .48 * k, ox = ex + side * b.w * .55 * k, iy = by + x.tilt * .9, oy = by - x.tilt * .25 + .4, my = Math.min(iy, oy) - b.arch;
    out += P(`M${ix} ${iy + b.th * .5}C${ix} ${iy - b.th * .6} ${(ix + ox) / 2} ${my - b.th * .55} ${ox} ${oy - .2}C${(ix + ox) / 2} ${my + b.th * .4} ${ix + side * 1.2} ${iy + b.th * .2} ${ix} ${iy + b.th * .5}Z`, col, b.col ? { s: INK, w: .5 } : {}); }
  if (x.furrow) out += P(`M${g.cx - 1.2} ${g.ey - 6.2}l.4 2.2M${g.cx + 1.1} ${g.ey - 6.1}l-.3 2`, null, { s: INK, w: .7, a: .55 });
  return out; }
function eyes(g, c, x, sw, lod) { const e = Object.assign({ w: 5.6, h: 2.5, col: '#2a2522', slant: .3 }, c.eye); let out = '';
  for (const side of [-1, 1]) { const far = side > 0, k = far ? .9 : 1, ex = g.cx + side * (far ? 6 : 6.4), ey = g.ey, w = e.w * k, h = e.h;
    if (c.patch && side === (c.patch === 'L' ? -1 : 1)) { out += P(`M${ex - w * .75} ${ey - 2.8}C${ex - w * .6} ${ey + 3.6} ${ex + w * .6} ${ey + 3.6} ${ex + w * .75} ${ey - 2.8}C${ex + w * .3} ${ey - 3.8} ${ex - w * .3} ${ey - 3.8} ${ex - w * .75} ${ey - 2.8}Z`, INK)
      + P(`M${ex - w * .7} ${ey - 2.6}L${g.L - 1.5} ${ey - 9}M${ex + w * .7} ${ey - 2.6}L${g.R + 1.5} ${ey - 8}`, null, { s: INK, w: .9 }); continue; }
    const ox = ex + side * w / 2, ix = ex - side * w / 2, sl = e.slant * side;
    if (x.lid >= 1) { out += P(`M${ix} ${ey}Q${ex} ${ey + 1.6} ${ox} ${ey - .2 - sl * .3}`, null, { s: INK, w: sw * .95 }); continue; }
    if (x.smileEye) { out += P(`M${ix} ${ey + .4}Q${ex} ${ey - 1.9} ${ox} ${ey - sl * .4}`, null, { s: INK, w: sw * 1.05 }); continue; }
    const top = ey - h * (1 - x.lid * .55), low = ey + h * .55;
    if (lod) { out += P(`M${ix} ${ey}C${ix + side * w * .25} ${top} ${ox - side * w * .25} ${top - sl * .3} ${ox} ${ey - sl * .6}C${ox - side * w * .3} ${low} ${ix + side * w * .3} ${low} ${ix} ${ey}Z`, PAPER)
      + E(ex + side * .1, ey + .2, h * .62, h * .74, e.col) + E(ex - .5, ey - .3, .45, .45, PAPER); }
    else out += P(`M${ix} ${ey}C${ix + side * w * .25} ${top} ${ox - side * w * .25} ${top} ${ox} ${ey - sl * .6}C${ox - side * w * .3} ${low} ${ix + side * w * .3} ${low} ${ix} ${ey}Z`, INK);
    out += P(`M${ix - side * .3} ${ey + .3}C${ix + side * w * .22} ${top - .5} ${ox - side * w * .22} ${top - .6 - sl * .3} ${ox + side * .7} ${ey - sl * .7 + .3}`, null, { s: INK, w: sw * 1.15 });
    if (c.lash) out += P(`M${ox + side * .4} ${ey - sl * .7}l${side * 1.3} -.9`, null, { s: INK, w: .8 });
    if (c.old && lod) out += P(`M${ix + side * .5} ${low + .9}Q${ex} ${low + 1.9} ${ox - side * .3} ${low + .3}M${ox + side * 1.4} ${ey - .4}l${side * 1.4} -.7M${ox + side * 1.4} ${ey + .7}l${side * 1.3} .5`, null, { s: INK, w: .55, a: .5 }); }
  return out; }
function nose(g, c, sk, sw) { const n = Object.assign({ len: 0, w: 1 }, c.nose), x = g.cx, y = g.ey + 7.4 + n.len;
  return P(`M${x + 1} ${g.ey + 1}C${x + 2.2} ${y - 4} ${x + 3.2} ${y - 1.6} ${x + 2.8} ${y + .2}C${x + 2} ${y + .9} ${x + 1} ${y + .4} ${x + .6} ${y - 1}C${x + 1.4} ${y - 3} ${x + 1.4} ${y - 5} ${x + 1} ${g.ey + 1}Z`, sk[1], { a: .85 })
    + P(`M${x - 1.6 * n.w} ${y - .4}C${x - 1} ${y + .5} ${x + .6} ${y + .8} ${x + 2.6} ${y + .1}`, null, { s: INK, w: sw * .7 })
    + P(`M${x + 2.2} ${y - 2.4}c.8 .6 1 1.4 .5 2.2`, null, { s: INK, w: sw * .5, a: .6 }); }
function mouth(g, c, x, sw) { const m = Object.assign({ w: 6.2, lip: null }, c.mouth), cx = g.cx - .2, y = g.my, hw = m.w / 2; let d = '', fill = '';
  switch (x.mouth) {
    case 'firm': d = `M${cx - hw} ${y + .5}Q${cx} ${y - .3} ${cx + hw} ${y + .5}`; break;
    case 'down': d = `M${cx - hw} ${y + 1.1}Q${cx} ${y - .9} ${cx + hw} ${y + 1.1}`; break;
    case 'smile': d = `M${cx - hw} ${y - .7}Q${cx} ${y + 2.1} ${cx + hw} ${y - .7}`; break;
    case 'smirk': d = `M${cx - hw} ${y + .4}Q${cx + .5} ${y + .8} ${cx + hw + .4} ${y - .9}`; break;
    case 'soft': d = `M${cx - hw * .8} ${y}Q${cx} ${y + .9} ${cx + hw * .8} ${y}`; break;
    case 'grin': fill = P(`M${cx - hw - .4} ${y - .6}Q${cx} ${y + .4} ${cx + hw + .4} ${y - .9}Q${cx + hw * .3} ${y + 3.6} ${cx - hw - .4} ${y - .6}Z`, INK)
      + P(`M${cx - hw + .3} ${y - .2}Q${cx} ${y + .6} ${cx + hw - .1} ${y - .4}L${cx + hw - .8} ${y + .7}Q${cx} ${y + 1.2} ${cx - hw + 1} ${y + .6}Z`, PAPER) + (c.gap ? P(`M${cx + .6} ${y + .1}h1.3v.9h-1.3z`, INK) : ''); break;
    default: d = `M${cx - hw} ${y}Q${cx} ${y + .6} ${cx + hw} ${y}`; }
  let out = fill || P(d, null, { s: INK, w: sw * .8 });
  if (m.lip && x.mouth !== 'grin') out = P(`M${cx - hw * .7} ${y + .1}Q${cx} ${y + 2.3} ${cx + hw * .7} ${y + .1}Q${cx} ${y + .6} ${cx - hw * .7} ${y + .1}Z`, m.lip, { a: .85 }) + out;
  out += P(`M${cx - 1.4} ${y + 2.4}Q${cx} ${y + 3.1} ${cx + 1.5} ${y + 2.4}`, null, { s: INK, w: .55, a: .35 });
  return out; }
function cheeks(g, c) { if (!c.blush) return ''; return E(g.cx - 8.4, g.ey + 6.2, 3, 1.7, c.blush, { a: .22 }) + E(g.cx + 7.8, g.ey + 6.2, 2.6, 1.6, c.blush, { a: .2 }); }
function lines(g, c, x) { let out = ''; if (c.old) out += P(`M${g.cx - 4.6} ${g.ey + 7.4}Q${g.cx - 6.4} ${g.my - 1} ${g.cx - 4.8} ${g.my + 2}M${g.cx + 4.6} ${g.ey + 7.4}Q${g.cx + 6.3} ${g.my - 1} ${g.cx + 4.7} ${g.my + 2}`, null, { s: INK, w: .65, a: .45 });
  if (c.forehead) out += P(`M${g.cx - 6} 33.2q6 -1.4 12 0M${g.cx - 4.5} 35.4q4.5 -1 9 0`, null, { s: INK, w: .6, a: .4 });
  if (c.scar) { const s = c.scar; out += P(s, null, { s: '#8d2a1b', w: 1.1, a: .8 }) + P(s, null, { s: PAPER, w: .35, a: .6 }); }
  return out; }

/* ─────────── 수염 ─────────── */
function beard(g, c, sw, lod) { const b = c.beard; if (!b) return ''; const col = HAIR[b.col || c.hairCol || 'ink'], cx = g.cx, my = g.my, ch = g.ch, jl = 50 - g.jw, jr = 50 + g.jw; let out = '';
  const strands = (x0, x1, y0, y1, n) => { if (!lod) return ''; let d = ''; for (let i = 0; i < n; i++) { const t = (i + .5) / n, x = x0 + (x1 - x0) * t; d += `M${x} ${y0 + Math.sin(i * 2.1) * .8}q${(x - cx) * .08} ${(y1 - y0) * .5} ${(x - cx) * .12} ${y1 - y0}`; } return P(d, null, { s: col[1], w: .55, a: .55 }); };
  if (b.type === 'stubble') return P(`M${jl + .3} 52C${jl + 1} 60 ${cx - 4} ${ch - .3} ${cx} ${ch - .3}C${cx + 4} ${ch - .3} ${jr - 1} 60 ${jr - .3} 52C${jr - 3} 56 ${cx + 4} ${my - 1.5} ${cx} ${my - 2.4}C${cx - 4} ${my - 1.5} ${jl + 3} 56 ${jl + .3} 52Z`, col[0], { a: .13 });
  if (['full', 'red', 'long', 'goatee'].includes(b.type)) {
    const drop = b.type === 'long' ? (b.len || 16) : b.type === 'red' ? 11 : b.type === 'goatee' ? (b.len || 6) : (b.len || 5.5), wide = b.type === 'goatee' ? 0 : 1;
    if (wide) { const bot = ch + drop, red = b.type === 'red';
      const bottom = red ? `L${cx - 4.4} ${bot + 1.6}L${cx - 1.8} ${bot - 1.4}L${cx + .6} ${bot + 2.2}L${cx + 3} ${bot - 1}L${cx + 5.6} ${bot + 1.2}L${cx + 7} ${bot - 1.6}` : `C${cx - 1} ${bot + .5} ${cx + 1.4} ${bot + .5} ${cx + 3.4} ${bot - .6}`;
      const bl = red ? [cx - 7, bot - 1.4] : [cx - 3.2, bot - .6], br = red ? [cx + 7, bot - 1.6] : [cx + 3.4, bot - .6];
      out += P(`M${g.L + 1.3} 46.5C${jl - 1.8} 56 ${bl[0] - 5} ${bot - 2.4} ${bl[0]} ${bl[1]}${bottom}C${br[0] + 5} ${bot - 2.4} ${jr + 1.8} 56 ${g.R - 1} 46.5C${g.R - 1.4} 54 ${cx + 8} ${my + 1.6} ${cx + 4.2} ${my + 2.4}C${cx + 2} ${my + 3.4} ${cx - 2} ${my + 3.4} ${cx - 4.4} ${my + 2.4}C${cx - 8.4} ${my + 1.6} ${g.L + 1.6} 54 ${g.L + 1.3} 46.5Z`, col[0], { s: INK, w: sw * .8 })
        + strands(cx - 8, cx + 8, ch - 2, bot - 2, 7); }
    else out += P(`M${cx - 3.2} ${my + 2.6}C${cx - 3} ${ch + drop * .6} ${cx - .6} ${ch + drop} ${cx + .3} ${ch + drop}C${cx + 1} ${ch + drop} ${cx + 3} ${ch + drop * .6} ${cx + 3.2} ${my + 2.6}Q${cx} ${my + 3.8} ${cx - 3.2} ${my + 2.6}Z`, col[0], { s: INK, w: sw * .7 }) + strands(cx - 2, cx + 2, ch, ch + drop - 1, 3); }
  if (b.mus !== false) { const m = b.mus || 'droop', y = my - 2.1;
    if (m === 'long') out += P(`M${cx - .4} ${y - .4}C${cx - 4} ${y - 1} ${cx - 7} ${y + 1} ${cx - 8.4} ${y + 6}C${cx - 9.4} ${y + 10} ${cx - 10.5} ${y + 13} ${cx - 12} ${y + 15}C${cx - 9} ${y + 11} ${cx - 8} ${y + 4} ${cx - 4.6} ${y + 1.6}C${cx - 2.6} ${y + .8} ${cx - 1} ${y + .9} ${cx - .4} ${y + .9}ZM${cx + .2} ${y - .4}C${cx + 3.8} ${y - 1} ${cx + 6.6} ${y + 1} ${cx + 8} ${y + 6}C${cx + 9} ${y + 10} ${cx + 10.1} ${y + 13} ${cx + 11.4} ${y + 15}C${cx + 8.6} ${y + 11} ${cx + 7.6} ${y + 4} ${cx + 4.4} ${y + 1.6}C${cx + 2.4} ${y + .8} ${cx + .8} ${y + .9} ${cx + .2} ${y + .9}Z`, col[0], { s: INK, w: .5 });
    else if (m === 'thin') out += P(`M${cx - .3} ${y - .2}C${cx - 2.6} ${y - .6} ${cx - 4.6} ${y + .4} ${cx - 5.8} ${y + 2.2}C${cx - 4.4} ${y + 1.1} ${cx - 2.4} ${y + .7} ${cx - .3} ${y + .8}ZM${cx + .1} ${y - .2}C${cx + 2.4} ${y - .6} ${cx + 4.3} ${y + .4} ${cx + 5.4} ${y + 2.1}C${cx + 4.1} ${y + 1.1} ${cx + 2.2} ${y + .7} ${cx + .1} ${y + .8}Z`, col[0]);
    else out += P(`M${cx} ${y - .6}C${cx - 3} ${y - 1.4} ${cx - 6} ${y - .2} ${cx - 6.6} ${y + 2.6}C${cx - 5} ${y + 1.6} ${cx - 2.6} ${y + 1.4} ${cx} ${y + 1.2}C${cx + 2.6} ${y + 1.4} ${cx + 5} ${y + 1.6} ${cx + 6.4} ${y + 2.6}C${cx + 5.8} ${y - .2} ${cx + 3} ${y - 1.4} ${cx} ${y - .6}Z`, col[0], { s: INK, w: .5 }); }
  return out; }

/* ─────────── 머리카락 ─────────── */
function hairCap(g, c, sw) { const h = Object.assign({ line: 30.5, vol: 2.4, part: 0, fringe: 0, side: 49 }, c.hair), col = HAIR[c.hairCol || 'ink'], L = g.L, R = g.R, v = h.vol, hl = h.line;
  const mid = h.part ? `C${50 + 3} ${hl - .4} ${50 + 1.2} ${hl - 1.6} ${50 + .6} ${hl - 2}C${50} ${hl - 1.6} ${50 - 3} ${hl - .4} ${50 - 6} ${hl + .3}` : `C${50 + 5} ${hl - 1.6} ${50 - 5} ${hl - 1.6} ${50 - 6} ${hl + .3}`;
  let d = `M${L - .6} ${h.side}C${L - v - .6} 30 ${50 - g.w * .62} ${18.5 - v * .4} 50 ${18.5 - v * .4}C${50 + g.w * .62} ${18.5 - v * .4} ${R + v + .6} 30 ${R + .6} ${h.side}L${R - .8} ${h.side}C${R - .4} 41 ${R - 1.4} 36.5 ${R - 3} ${hl + 4}C${R - 5} ${hl + 1} ${50 + 7} ${hl} ${50 + 6} ${hl + .3}${mid}C${L + 6} ${hl + 1} ${L + 5} ${hl + 1.2} ${L + 3} ${hl + 4}C${L + 1.4} 36.5 ${L + .4} 41 ${L + .8} ${h.side}Z`;
  let out = P(d, col[0], { s: INK, w: sw });
  if (h.fringe) { let f = ''; for (let i = 0; i < h.fringe; i++) { const x = L + 5 + i * (g.w * 2 - 10) / (h.fringe - 1); f += `M${x - 2.6} ${hl - 1}Q${x - .8} ${hl + 3} ${x + .2} ${hl + 5 + (i % 2) * 1.6}Q${x + .6} ${hl + 2} ${x + 2.4} ${hl - 1}Z`; } out += P(f, col[0], { s: INK, w: sw * .55 }); }
  return out; }
function hairShine(g, c, lod) { if (!lod) return ''; const col = HAIR[c.hairCol || 'ink'][1]; return P(`M${g.L + 2} 33C${g.L + 3} 25 ${50 - 6} 21 ${50 - 1} 20.5M${g.L + 4.5} 32C${g.L + 5.6} 27 ${50 - 4} 24 50 23.6M${g.R - 2} 33C${g.R - 3} 26 ${50 + 6} 22 ${50 + 2} 21.4M${50 + 3} 29.4C${50 + 5} 25 ${50 + 4} 22.6 ${50 + 1} 21`, null, { s: col, w: .8, a: .7 }); }
/* 등 뒤로 늘어진 머리 · 뒤로 묶은 꽁지 · 흐트러진 머리 */
function hairBack(g, c, sw) { const h = c.hair || {}, col = HAIR[c.hairCol || 'ink'], L = g.L, R = g.R; let out = '';
  if (h.long) { const y = h.long; out += P(`M${L - 1} 34C${L - 4} 50 ${L - 6} ${y - 14} ${L - 7.5} ${y}L${R + 7} ${y}C${R + 5.6} ${y - 14} ${R + 4} 50 ${R + 1} 34Z`, col[0], { s: INK, w: sw }); }
  if (h.wild) { out += P(`M${L - 1} 30C${L - 6} 38 ${L - 5} 48 ${L - 9} 58L${L - 4.5} 55L${L - 6.5} 66L${L - 1.5} 59L${L - .5} 68L${L + 2} 56L${R - 2} 56L${R + .5} 68L${R + 1.5} 59L${R + 6.5} 66L${R + 4.5} 55L${R + 9} 58C${R + 5} 48 ${R + 6} 38 ${R + 1} 30Z`, col[0], { s: INK, w: sw }); }
  if (h.tail) { out += P(`M${50 + 5} 19C${50 + 13} 13 ${R + 13} 18 ${R + 12} 30C${R + 11.5} 40 ${R + 9} 47 ${R + 11} 56C${R + 6} 50 ${R + 4.5} 40 ${R + 5.5} 31C${R + 6} 25 ${R} 22 ${50 + 4} 22.5Z`, col[0], { s: INK, w: sw })
    + P(`M${50 + 4.5} 18.4c1.6 -.6 3.4 .3 3.8 2.1c-.4 1.4 -2.6 2 -4 1.3z`, c.tie || '#b03a26', { s: INK, w: sw * .6 }); }
  return out; }
function hairFront(g, c, sw, lod) { const h = c.hair || {}, col = HAIR[c.hairCol || 'ink'], L = g.L, R = g.R; let out = '';
  if (h.bun) { const [bx, by, br] = h.bun; out += E(bx, by, br, br * .8, col[0], { s: INK, w: sw }) + (lod ? P(`M${bx - br * .6} ${by - br * .2}Q${bx} ${by - br * .9} ${bx + br * .6} ${by - br * .2}`, null, { s: col[1], w: .7, a: .7 }) : ''); }
  if (h.knot) out += E(50, 15.6, 3.6, 3.9, col[0], { s: INK, w: sw }) + P(`M${50 - 3.4} 18.2h6.8`, null, { s: c.knotBand || INK, w: 1.6 });
  if (h.locks) out += P(`M${L + .2} 36C${L - 1.5} 44 ${L - .4} 52 ${L - 2} 60C${L + 1} 55 ${L + 1.2} 46 ${L + 2.6} 38ZM${R - .2} 36C${R + 1.5} 44 ${R + .4} 52 ${R + 2} 60C${R - 1} 55 ${R - 1.2} 46 ${R - 2.6} 38Z`, col[0], { s: INK, w: sw * .6 });
  if (h.pin) { const [x1, y1, x2, y2, gem] = h.pin; out += P(`M${x1} ${y1}L${x2} ${y2}`, null, { s: '#c19a3e', w: 1.3 }) + E(x2, y2, 1.8, 1.8, gem || '#b03a26', { s: INK, w: .6 }) + E(x1, y1, .9, .9, '#c19a3e'); }
  return out; }

/* ─────────── 관모 · 쓰개 ─────────── */
function hat(g, c, sw, lod, layer) { const t = c.hat; if (!t) return ''; const L = g.L, R = g.R, k = t.col || INK; let out = '';
  const band = (y, col, h) => P(`M${L - 1.6} ${y + h}C${L - 1.8} ${y - 2} ${R + 1.8} ${y - 2} ${R + 1.6} ${y + h}C${R - 4} ${y + h - 2} ${L + 4} ${y + h - 2} ${L - 1.6} ${y + h}Z`, col, { s: INK, w: sw });
  if (t.type === 'futou') { // 복두: 낮은 앞 띠 + 높은 뒷 덩이, 뒤로 드리운 끈(soft) 또는 옆으로 뻗은 날개(wing)
    if (layer === 'back') { if (t.tails === 'soft') out += P(`M${L + 4} 44C${L + 1} 52 ${L - 1} 58 ${L - 3.4} 66.6L${L - .4} 67.4C${L + 1.4} 60 ${L + 3.6} 53 ${L + 6} 46ZM${R - 4} 44C${R - 1} 52 ${R + 1} 58 ${R + 3.4} 66.6L${R + .4} 67.4C${R - 1.4} 60 ${R - 3.6} 53 ${R - 6} 46Z`, k, { s: INK, w: sw * .7 });
      if (t.tails === 'stiff') out += P(`M${L + 3} 27L${L - 9} 40L${L - 7.4} 42L${L + 5} 30ZM${R - 3} 27L${R + 9} 40L${R + 7.4} 42L${R - 5} 30Z`, k, { s: INK, w: sw * .7 });
      return out; }
    if (t.tails === 'wing') out += P(`M${L + 1} 25.6L${4} 23.4L${3.6} 26.4L${L + 1} 28.4ZM${R - 1} 25.6L${96} 23.4L${96.4} 26.4L${R - 1} 28.4Z`, k, { s: INK, w: sw * .7 });
    out += P(`M${50 - 9.4} 26L${50 - 9.8} 16.4C${50 - 9.6} 13.2 ${50 - 5.6} 12.4 ${50 - 3.4} 13.4C${50 - 1.8} 13.8 ${50 - .6} 14.2 50 14.2C${50 + .6} 14.2 ${50 + 1.8} 13.8 ${50 + 3.4} 13.4C${50 + 5.6} 12.4 ${50 + 9.6} 13.2 ${50 + 9.8} 16.4L${50 + 9.4} 26Z`, k, { s: INK, w: sw })
      + P(`M${L - 1.4} 34C${L - 1.8} 28 ${L - 1} 24.6 ${L + 2} 23.6C${50 - 4} 22.4 ${50 + 4} 22.4 ${R - 2} 23.6C${R + 1} 24.6 ${R + 1.8} 28 ${R + 1.4} 34C${R - 4} 31.8 ${L + 4} 31.8 ${L - 1.4} 34Z`, k, { s: INK, w: sw })
      + P(`M${50 - 7.8} 17C${50 - 7} 14.8 ${50 - 5} 14.4 ${50 - 3.6} 15`, null, { s: '#5b6763', w: .9, a: lod ? .8 : 0 })
      + P(`M${L + 1} 29.8C${L + 8} 27.6 ${R - 8} 27.6 ${R - 1} 29.8`, null, { s: '#5b6763', w: .8, a: lod ? .7 : 0 });
    if (t.orn) out += E(50, 27.6, 2.2, 1.7, t.orn, { s: INK, w: .6 });
    return out; }
  if (layer === 'back') { if (t.type === 'hood') return P(`M${L - 6} 70C${L - 9} 50 ${L - 7} 22 50 13C${R + 7} 22 ${R + 9} 50 ${R + 6} 70Z`, k, { s: INK, w: sw }); if (t.type === 'scarf' && t.tail) return P(`M${R - 1} 30C${R + 8} 34 ${R + 12} 44 ${R + 14} 58L${R + 8} 60C${R + 7} 48 ${R + 4} 40 ${R - 2} 36Z`, k, { s: INK, w: sw }); return ''; }
  if (t.type === 'band') { const y = t.y || 31; out += P(`M${L - 1} ${y + 1.5}C${L + 6} ${y - 1.5} ${R - 6} ${y - 1.5} ${R + 1} ${y + 1.5}L${R + 1} ${y + 4.3}C${R - 6} ${y + 1.4} ${L + 6} ${y + 1.4} ${L - 1} ${y + 4.3}Z`, k, { s: INK, w: sw * .8 });
    if (t.knot) out += P(`M${R} ${y + 2.4}l4.6 -3.4l.6 2.2l-3.4 2.4ZM${R} ${y + 3}l5 2.8l-1.2 1.8l-4 -2.4Z`, k, { s: INK, w: sw * .6 }); return out; }
  if (t.type === 'geon') { // 건: 머리를 감싸 정수리에서 묶은 천
    out += P(`M${L - 1.8} 36C${L - 3} 22 ${50 - 8} 15.6 50 15.6C${50 + 8} 15.6 ${R + 3} 22 ${R + 1.8} 36C${R - 4} 32 ${L + 4} 32 ${L - 1.8} 36Z`, k, { s: INK, w: sw })
      + P(`M${50 - 3} 16.6C${50 - 5} 11 ${50 - 1} 9.6 ${50 + .4} 13.6C${50 + 2} 9.4 ${50 + 6} 11 ${50 + 3.6} 16.8Z`, k, { s: INK, w: sw * .8 })
      + (lod ? P(`M${L + 1} 30C${50 - 4} 24 ${50 + 4} 24 ${R - 1} 30M${L + 3} 25C${50 - 3} 20 ${50 + 3} 20 ${R - 3} 25`, null, { s: t.line || '#5b6763', w: .7, a: .8 }) : ''); return out; }
  if (t.type === 'eboshi') { // 에보시: 위로 솟아 앞으로 꺾인 검은 갓
    out += P(`M${L - 1} 34C${L - 2} 26 ${50 - 10} 20 ${50 - 7.4} 12C${50 - 5.6} 6.4 ${50 + 5} 4.4 ${50 + 11.6} 7C${50 + 8.6} 9 ${50 + 8} 11.6 ${50 + 9} 15C${R + 2} 19 ${R + 2.4} 27 ${R + 1} 34C${R - 5} 31.6 ${L + 5} 31.6 ${L - 1} 34Z`, k, { s: INK, w: sw })
      + (lod ? P(`M${50 - 4} 14.6C${50 - 1} 17.6 ${50 + 4} 18.4 ${50 + 8} 17.6M${50 - 5} 22C${50} 25 ${50 + 6} 25 ${R - 1} 23`, null, { s: '#5b6763', w: .8, a: .9 }) : '')
      + P(`M${L - .6} 33.3C${L + 6} 31.6 ${R - 6} 31.6 ${R + .6} 33.3`, null, { s: '#5b6763', w: .8, a: lod ? .9 : 0 }); return out; }
  if (t.type === 'kanmuri') { // 간무리: 정수리의 작은 관 + 뒤로 곧게 선 꼬리(纓)
    out += P(`M${50 + 1.6} 19.6C${50 + 4} 11 ${50 + 9} 4 ${50 + 15} 1.4L${50 + 19.4} 4.6C${50 + 14} 7.6 ${50 + 10} 13 ${50 + 7.6} 21Z`, k, { s: INK, w: sw * .8 }) + (lod ? P(`M${50 + 5.6} 15C${50 + 8} 9.6 ${50 + 12} 5.6 ${50 + 16.4} 3.2`, null, { s: '#5b6763', w: .7, a: .8 }) : '')
      + P(`M${L - .6} 32C${L - 2} 22 ${50 - 8} 17.6 50 17.6C${50 + 8} 17.6 ${R + 2} 22 ${R + .6} 32C${R - 5} 29.6 ${L + 5} 29.6 ${L - .6} 32Z`, k, { s: INK, w: sw })
      + P(`M${50 - 4.6} 21C${50 - 5} 12 ${50 + 5} 12 ${50 + 4.6} 21Z`, k, { s: INK, w: sw }); return out; }
  if (t.type === 'turban') { const c2 = t.col2 || '#c19a3e';
    out += P(`M${L - 3.6} 36C${L - 6} 22 ${50 - 12} 12 50 11.6C${50 + 12} 12 ${R + 6} 22 ${R + 3.6} 36C${R - 4} 31 ${L + 4} 31 ${L - 3.6} 36Z`, k, { s: INK, w: sw })
      + P(`M${L - 2.6} 31C${50 - 6} 22 ${50 + 4} 18 ${R + 1} 15.6M${L - 1} 25C${50 - 4} 18 ${50 + 5} 15 ${R - 3} 13.2M${L + 1.4} 34C${50 - 2} 28 ${50 + 8} 25 ${R + 3.4} 25`, null, { s: INK, w: sw * .55, a: .55 })
      + E(50 + 1, 25.8, 2.4, 2.4, c2, { s: INK, w: .7 }); return out; }
  if (t.type === 'hood') return P(`M${L - 4} 52C${L - 5} 36 ${L - 4} 18 50 15C${R + 4} 18 ${R + 5} 36 ${R + 4} 52C${R + 1} 44 ${R + 1} 36 ${R - 3} 31C${50 + 4} 28 ${50 - 4} 28 ${L + 3} 31C${L - 1} 36 ${L - 1} 44 ${L - 4} 52Z`, k, { s: INK, w: sw })
    + P(`M${L + 2} 33C${50 - 4} 29.4 ${50 + 4} 29.4 ${R - 2} 33`, null, { s: '#5b6763', w: .8, a: lod ? .8 : 0 });
  if (t.type === 'scarf') { // 머릿수건 · 두건 (해녀 · 여해적)
    out += P(`M${L - 1.6} 39C${L - 3} 22 ${50 - 9} 16 50 16C${50 + 9} 16 ${R + 3} 22 ${R + 1.6} 39C${R - .6} 34 ${R - 3} 31.4 ${R - 6} 31C${50 + 4} 29.6 ${50 - 4} 29.6 ${L + 6} 31C${L + 3} 31.4 ${L + .6} 34 ${L - 1.6} 39Z`, k, { s: INK, w: sw })
      + P(`M${R - 1} 30l5 -2.4l1 3.4l-4.6 1ZM${R - 1} 31l3.6 4.4l-2.6 1.2l-2 -4.4Z`, k, { s: INK, w: sw * .7 })
      + (lod ? P(`M${L + 1} 27C${50 - 4} 21 ${50 + 4} 21 ${R - 1} 27`, null, { s: t.line || 'rgba(27,35,36,.35)', w: .7 }) : ''); return out; }
  if (t.type === 'helmet') { // 투구: 찰갑 볼가리개 + 둥근 몸 + 꼭지(술 또는 뿔)
    out += P(`M${L - 3.4} 52C${L - 4} 44 ${L - 3.4} 37 ${L - 1.6} 33.6L${L + 2.6} 34C${L + 1.6} 40 ${L + 1.4} 46 ${L + 1.2} 50ZM${R + 3.4} 52C${R + 4} 44 ${R + 3.4} 37 ${R + 1.6} 33.6L${R - 2.6} 34C${R - 1.6} 40 ${R - 1.4} 46 ${R - 1.2} 50Z`, t.col2 || '#3f4a48', { s: INK, w: sw * .8 })
      + (lod ? P(`M${L - 3.2} 40h4.4M${L - 3.4} 45h4.4M${R + 3.2} 40h-4.4M${R + 3.4} 45h-4.4`, null, { s: INK, w: .6, a: .6 }) : '')
      + P(`M${L - 2.6} 35C${L - 3} 22 ${50 - 9} 15 50 15C${50 + 9} 15 ${R + 3} 22 ${R + 2.6} 35C${R - 4} 32 ${L + 4} 32 ${L - 2.6} 35Z`, k, { s: INK, w: sw })
      + P(`M${L - 2.2} 33.4C${L + 5} 30 ${R - 5} 30 ${R + 2.2} 33.4`, null, { s: t.trim || '#c19a3e', w: 1.3 })
      + (lod ? P(`M${50 - 6} 18.6C${50 - 7} 24 ${50 - 7} 28 ${50 - 6.4} 31M${50 + .4} 15.4V31M${50 + 6.6} 18.6C${50 + 7.4} 24 ${50 + 7.4} 28 ${50 + 6.8} 31`, null, { s: '#5b6763', w: .7, a: .8 }) : '');
    if (t.crest === 'horn') out += P(`M${50 - 4} 17C${50 - 9} 12 ${50 - 13} 8 ${50 - 13} 2C${50 - 10} 6.6 ${50 - 6} 9.6 ${50 - 1.6} 14.6ZM${50 + 4} 17C${50 + 9} 12 ${50 + 13} 8 ${50 + 13} 2C${50 + 10} 6.6 ${50 + 6} 9.6 ${50 + 1.6} 14.6Z`, t.trim || '#c19a3e', { s: INK, w: sw * .7 });
    else out += P(`M${50 - 1.2} 15.4L${50 - .8} 10.6L${50 + .8} 10.6L${50 + 1.2} 15.4Z`, t.trim || '#c19a3e', { s: INK, w: .6 }) + P(`M50 11C${50 - 4} 8 ${50 - 3} 3 ${50 - 7} 1C${50 - 1} 1 ${50 + 4} 4 ${50 + 2} 10.6Z`, t.plume || '#b03a26', { s: INK, w: sw * .6 });
    return out; }
  if (t.type === 'fur') { // 발해 털모자
    out += P(`M${L - 1} 31C${L - 2} 18 ${50 - 9} 10 50 10C${50 + 9} 10 ${R + 2} 18 ${R + 1} 31Z`, t.col2 || '#2a4f86', { s: INK, w: sw })
      + P(`M${L - 3} 36C${L - 4.5} 30 ${L - 3} 27 ${L - .6} 26.5C${50 - 6} 24 ${50 + 6} 24 ${R + .6} 26.5C${R + 3} 27 ${R + 4.5} 30 ${R + 3} 36C${R - 4} 32 ${L + 4} 32 ${L - 3} 36Z`, k, { s: INK, w: sw })
      + (lod ? P(Array.from({ length: 9 }, (_, i) => { const x = L - 1.4 + i * (g.w * 2 + 2.6) / 8; return `M${x} ${33 - Math.abs(i - 4) * .3}l.7 -3.4`; }).join(''), null, { s: '#e9e4d6', w: .6, a: .55 }) : '')
      + E(50, 10.4, 1.8, 1.8, t.trim || '#b03a26', { s: INK, w: .6 }); return out; }
  if (t.type === 'satgat') { // 삿갓: 넓은 대삿갓, 얼굴 위에 그늘
    out += P(`M${L - 13} 34.5L50 10L${R + 13} 34.5C${R} 37 ${L} 37 ${L - 13} 34.5Z`, k, { s: INK, w: sw })
      + (lod ? P(`M50 10.6L${L - 5} 34.8M50 10.6L${50 - 6} 36M50 10.6L${50 + 5} 36M50 10.6L${R + 4} 35`, null, { s: INK, w: .6, a: .45 }) : '')
      + P(`M${L - 10} 36C${L} 38.6 ${R} 38.6 ${R + 10} 36`, INK, { a: .18 }); return out; }
  return out; }

/* ─────────── 몸 · 옷 ─────────── */
function body(g, c, sw, lod) { const o = Object.assign({ col: '#3f4a48', collar: 'round', trim: null, b: 1 }, c.robe), b = o.b, sx = 31 * b, ex = 45 * b, sk = SKIN[c.skin || 'warm'];
  const shape = `M${50 - 7} 63C${50 - 10} 69 ${50 - sx + 9} 70.6 ${50 - sx} 74C${50 - sx - 8} 77 ${50 - ex} 85 ${50 - ex - 1.4} 104L${50 + ex + 1.4} 104C${50 + ex} 85 ${50 + sx + 8} 77 ${50 + sx} 74C${50 + sx - 9} 70.6 ${50 + 10} 69 ${50 + 7} 63Z`;
  let out = '', fold = '';
  if (o.collar === 'vest' || o.collar === 'bare') { out += P(shape, sk[0], { s: INK, w: sw }) + P(`M${50 - sx + 4} 82C${50 - sx + 8} 86 ${50 - sx + 7} 94 ${50 - sx + 9} 101M${50 - 9} 86Q50 89 ${50 + 9} 86`, null, { s: INK, w: .7, a: .45 });
    if (o.collar === 'vest') out += P(`M${50 - sx - 2} 79.5C${50 - sx + 4} 77 ${50 - 13} 74 ${50 - 9} 72L${50 - 4} 102L${50 - ex - 1} 102C${50 - ex} 88 ${50 - sx - 6} 81 ${50 - sx - 2} 79.5ZM${50 + sx + 2} 79.5C${50 + sx - 4} 77 ${50 + 13} 74 ${50 + 9} 72L${50 + 5} 102L${50 + ex + 1} 102C${50 + ex} 88 ${50 + sx + 6} 81 ${50 + sx + 2} 79.5Z`, o.col, { s: INK, w: sw });
    return out + P(`M50 66C${50 + 10} 72 ${50 + sx} 76 ${50 + ex + 1} 102L${50 + 18} 102C${50 + 14} 88 ${50 + 8} 76 50 66Z`, INK, { a: .12 }); }
  out += P(shape, o.col, { s: INK, w: sw });
  if (lod) fold = P(`M${50 - sx + 3} 84C${50 - sx + 6} 90 ${50 - sx + 6} 96 ${50 - sx + 8} 102M${50 + sx - 3} 84C${50 + sx - 6} 90 ${50 + sx - 5} 96 ${50 + sx - 7} 102`, null, { s: INK, w: .8, a: .4 });
  out += fold + P(`M${50 + 4} 70C${50 + 14} 74 ${50 + sx + 4} 77 ${50 + ex + 1} 102L${50 + 12} 102C${50 + 13} 90 ${50 + 9} 78 ${50 + 4} 70Z`, INK, { a: .13 });
  return out; }
/* 목 앞 옷깃 — 목을 그린 다음 그 위에 얹는다 */
function collar(g, c, sw, lod) { const o = Object.assign({ col: '#3f4a48', collar: 'round', trim: null, inner: PAPER }, c.robe), t = o.trim || o.col; let out = '';
  if (o.collar === 'round') { // 단령 · 가리기누 · 당 둥근깃: 흰 속깃이 보이는 둥근 깃
    out += P(`M${50 - 8.2} 66C${50 - 6} 70.6 ${50 - 2} 73 ${50 + 1} 74.2C${50 + 4} 72 ${50 + 6.8} 69.6 ${50 + 8.2} 66L${50 + 7} 71L50 77L${50 - 7} 71Z`, o.inner, { s: INK, w: sw * .7 })
      + P(`M${50 - 6.4} 66.4L${50 + 2.4} 74.6`, null, { s: INK, w: .7, a: .6 })
      + BAND(`M${50 - 11.6} 64.6C${50 - 12.6} 78.4 ${50 + 12.6} 78.4 ${50 + 11.6} 64.6`, t, 3.2, sw * 1.1); }
  else if (o.collar === 'cross' || o.collar === 'layers') { // 교임: 오른 섶 위로 왼 섶이 덮인다(보는 쪽에서 오른쪽 위 → 왼쪽 아래)
    out += P(`M${50 - 7.6} 64L${50 + 7.6} 64L${50 + .4} 80Z`, o.inner, {});
    const lay = o.collar === 'layers' ? (o.layers || []) : []; lay.forEach((col, i) => { const off = (lay.length - i) * 2.1; out += BAND(`M${50 + 8 + off * .3} 63.4C${50 + 5} ${70 + off * .6} ${50 - 2 - off} ${86 + off} ${50 - 15 - off} 102`, col, 2, .7); });
    out += BAND(`M${50 - 8} 63.6C${50 - 6.4} 69 ${50 - 3} 75 ${50 + 2.4} 82`, t, 3.6, sw)
      + BAND(`M${50 + 8} 63.4C${50 + 5} 70 ${50 - 2} 86 ${50 - 15} 102`, t, 3.8, sw); }
  else if (o.collar === 'kaftan') out += BAND(`M${50 - 9.4} 65C${50 - 9} 75 ${50 + 9} 75 ${50 + 9.4} 65`, t, 3, sw) + BAND(`M50 73.4V102`, t, 2.4, sw * .9)
    + (lod ? P(`M${50 - 7.8} 69.4h.1M${50 - 4.4} 72.2h.1M${50 + 4.4} 72.2h.1M${50 + 7.8} 69.4h.1M50 80h.1M50 86h.1M50 92h.1`, null, { s: '#85631a', w: 1.4 }) : '');
  else if (o.collar === 'haenyeo') out += BAND(`M${50 - 9.6} 66C${50 - 8} 75 ${50 + 8} 75 ${50 + 9.6} 66`, t, 2.2, sw);
  else if (o.collar === 'monk') out += P(`M${50 - 7.6} 64L${50 + 7.6} 64L${50 + .4} 80Z`, o.inner, {})
    + BAND(`M${50 - 8} 63.6C${50 - 6.4} 69 ${50 - 3} 75 ${50 + 2.4} 82`, o.col, 3.4, sw) + BAND(`M${50 + 8} 63.4C${50 + 5} 70 ${50 - 2} 86 ${50 - 15} 102`, o.col, 3.6, sw);
  if (o.shawl) { const s = o.shawl; for (const d of [-1, 1]) out += P(`M${50 + d * 9.6} 64.6C${50 + d * 16} 66.6 ${50 + d * 24} 68.6 ${50 + d * 31} 72C${50 + d * 38} 76 ${50 + d * 41} 86 ${50 + d * 40} 104L${50 + d * 32} 104C${50 + d * 33} 90 ${50 + d * 31} 81 ${50 + d * 26} 77C${50 + d * 21} 74 ${50 + d * 15} 72 ${50 + d * 10.4} 70.4Z`, s, { s: INK, w: sw * .9 })
    + (lod ? P(`M${50 + d * 14} 68.6C${50 + d * 24} 71 ${50 + d * 33} 75 ${50 + d * 36} 86`, null, { s: PAPER, w: .7, a: .45 }) : ''); }
  return out; }
/* 갑옷 어깨(찰갑) · 털 망토 · 가사 */
function over(g, c, sw, lod) { let out = ''; const a = c.armor;
  if (a) { const col = a.col || '#3f4a48', lace = a.lace || '#b03a26';
    for (const s of [-1, 1]) { const x0 = 50 + s * 11, x1 = 50 + s * 40; out += P(`M${x0} 70.6C${50 + s * 22} 70 ${50 + s * 34} 72.6 ${x1} 80C${50 + s * 44} 85 ${50 + s * 45} 90 ${50 + s * 45} 94C${50 + s * 38} 92 ${50 + s * 30} 88 ${50 + s * 24} 87C${50 + s * 20} 82 ${50 + s * 15} 76 ${x0} 74Z`, col, { s: INK, w: sw });
      if (lod) { let d = ''; for (let r = 0; r < 3; r++) { const yy = 75 + r * 5; d += `M${50 + s * (14 + r * 2)} ${yy - 1.8}C${50 + s * 26} ${yy - 1} ${50 + s * 36} ${yy + 3} ${50 + s * (42 + r)} ${yy + 8}`; for (let i = 0; i < 6; i++) { const xx = 50 + s * (17 + r * 2 + i * 4.4); d += `M${xx} ${yy - 1.4 + i * .8 + (i > 3 ? (i - 3) * .9 : 0)}v3.2`; } } out += P(d, null, { s: INK, w: .55, a: .65 }) + P(`M${50 + s * 13} 74.4C${50 + s * 24} 74 ${50 + s * 34} 77 ${50 + s * 41} 84`, null, { s: lace, w: 1.2, a: .9 }); } } }
  if (c.fur) { const f = c.fur; let d = `M${50 - 46} 92`; for (let i = 0; i <= 22; i++) { const t = i / 22, x = 50 - 46 + 92 * t, y = 73 - Math.sin(t * Math.PI) * 6 + (i % 2 ? 4 : 0); d += `L${x} ${y}`; }
    out += P(d + `L${50 + 46} 92L${50 + 30} 86C${50 + 16} 82 ${50 - 16} 82 ${50 - 30} 86Z`, f, { s: INK, w: sw }) + (lod ? P(`M${50 - 30} 80l3 4M${50 - 22} 77l2 4M${50 + 22} 77l-2 4M${50 + 30} 80l-3 4M${50 - 38} 84l3 3M${50 + 38} 84l-3 3`, null, { s: '#e9e4d6', w: .6, a: .5 }) : ''); }
  if (c.kesa) { const k = c.kesa; out += P(`M${50 + 9} 66C${50 + 18} 70 ${50 + 30} 74 ${50 + 36} 78L${50 + 40} 102L${50 + 8} 102C${50 + 2} 94 ${50 - 6} 86 ${50 - 30} 102L${50 - 36} 102C${50 - 22} 90 ${50 - 2} 76 ${50 + 9} 66Z`, k, { s: INK, w: sw })
    + (lod ? P(`M${50 + 18} 72L${50 + 16} 102M${50 + 28} 76L${50 + 28} 102M${50 - 4} 80L${50 + 4} 96M${50 - 14} 88L${50 - 8} 100M${50 + 12} 82C${50 + 20} 84 ${50 + 30} 84 ${50 + 38} 86`, null, { s: INK, w: .6, a: .5 }) : '')
    + E(50 + 18, 78, 1.8, 1.8, '#c19a3e', { s: INK, w: .6 }); }
  return out; }

/* ─────────── 소품 ─────────── */
function propBack(g, c, sw, lod) { const p = c.prop; if (!p) return ''; let out = '';
  if (p === 'bow') out += P(`M${50 + 40} 100C${50 + 28} 60 ${50 + 20} 30 ${50 + 30} 4`, null, { s: INK, w: sw * 2.2 }) + P(`M${50 + 40} 100C${50 + 28} 60 ${50 + 20} 30 ${50 + 30} 4`, null, { s: '#6b4a32', w: sw * 1.1 }) + P(`M${50 + 40} 100L${50 + 30} 4`, null, { s: INK, w: .6, a: .6 });
  if (p === 'quiver') out += P(`M${50 - 30} 64l5 -1l9 22l-5 2z`, '#6b4a32', { s: INK, w: sw * .8 }) + P(`M${50 - 30} 64l-2 -9M${50 - 27} 63l-1 -10M${50 - 24} 63l1 -9`, null, { s: INK, w: .8 }) + P(`M${50 - 32.6} 55.6l-1 3.4l2.4 .4zM${50 - 29.4} 53.4l-.2 3.6l2.4 -.2zM${50 - 23.6} 54.4l.4 3.4l2.2 -.8z`, '#e9e4d6', { s: INK, w: .5 });
  if (p === 'axe') out += P(`M${50 - 36} 102L${50 - 22} 18`, null, { s: INK, w: 4.2 }) + P(`M${50 - 36} 102L${50 - 22} 18`, null, { s: '#8a6a44', w: 2.4 }) + P(`M${50 - 25} 16C${50 - 34} 13 ${50 - 38} 20 ${50 - 36} 29L${50 - 23.4} 24.6Z`, '#8d9187', { s: INK, w: sw }) + P(`M${50 - 34.4} 27.4C${50 - 35.6} 22 ${50 - 33} 17 ${50 - 28} 16.4`, null, { s: PAPER, w: .8, a: .7 });
  if (p === 'oar') out += P(`M${50 + 44} 104L${50 + 24} 6`, null, { s: INK, w: 4 }) + P(`M${50 + 44} 104L${50 + 24} 6`, null, { s: '#8a6a44', w: 2.2 }) + P(`M${50 + 22} 0L${50 + 29} -1L${50 + 31} 24L${50 + 26} 25Z`, '#8a6a44', { s: INK, w: sw });
  return out; }
function propFront(g, c, sw, lod) { const p = c.prop2 || c.prop; let out = '';
  if (p === 'hol') out += P(`M${50 - 3.6} 84L${50 - 2} 102L${50 + 3.2} 102L${50 + 3.4} 83.4C${50 + 1} 82.4 ${50 - 1.4} 82.6 ${50 - 3.6} 84Z`, '#efe6cf', { s: INK, w: sw * .8 });
  if (p === 'mirror') out += P(`M${50 - 7} 70Q50 78 ${50 + 7} 70`, null, { s: '#85631a', w: .9 }) + E(50, 84, 7, 7, '#a07a2e', { s: INK, w: sw }) + E(50, 84, 4.8, 4.8, '#c9a752', { s: '#85631a', w: .8 }) + (lod ? P(`M${50 - 2.4} 81.4q1.4 -1.6 3.6 -1.2`, null, { s: PAPER, w: .8, a: .8 }) : '') + E(50 - 9, 92, 1.6, 1.6, '#c19a3e', { s: INK, w: .5 }) + E(50 + 9, 92, 1.6, 1.6, '#c19a3e', { s: INK, w: .5 });
  if (p === 'coins') out += P(`M${50 + 4} 76C${50 + 9} 84 ${50 + 12} 92 ${50 + 12} 102`, null, { s: '#85631a', w: .8 }) + [80, 86, 92, 98].map((y, i) => E(50 + 6 + i * 1.9, y, 2.6, 2.6, '#c19a3e', { s: INK, w: .6 }) + P(`M${50 + 5.2 + i * 1.9} ${y - .8}h1.6v1.6h-1.6z`, INK)).join('');
  if (p === 'gourd') out += E(50 + 20, 81, 9.4, 8.2, '#d07a2c', { s: INK, w: sw }) + (lod ? P(`M${50 + 11} 79C${50 + 16} 75 ${50 + 24} 75 ${50 + 29.2} 79M${50 + 14} 74C${50 + 18} 82 ${50 + 19} 86 ${50 + 17} 89M${50 + 23} 73.4C${50 + 26} 81 ${50 + 26} 86 ${50 + 24} 89`, null, { s: INK, w: .6, a: .6 }) : '') + P(`M${50 + 15.4} 75.6q3 -2 6 -.6`, null, { s: PAPER, w: .9, a: .6 });
  if (p === 'astro') out += P(`M${50 - 4} 72Q50 80 ${50 + 4} 72`, null, { s: '#85631a', w: .8 }) + E(50, 84, 5, 5, '#c19a3e', { s: INK, w: sw * .8 }) + P(`M${50 - 3.4} 84h6.8M50 80.6v6.8`, null, { s: INK, w: .6 });
  if (p === 'book') out += P(`M${50 + 8} 86L${50 + 26} 82L${50 + 30} 102L${50 + 11} 102Z`, '#22324a', { s: INK, w: sw }) + P(`M${50 + 10.4} 88.4L${50 + 25} 85`, null, { s: '#d6a540', w: 1.2 });
  if (p === 'beads') out += Array.from({ length: 9 }, (_, i) => { const t = i / 8, x = 50 - 10 + 20 * t, y = 76 + Math.sin(t * Math.PI) * 9; return E(x, y, 1.3, 1.3, '#6b4a32', { s: INK, w: .4 }); }).join('');
  if (p === 'seaweed') out += P(`M${50 - 28} 76C${50 - 24} 84 ${50 - 30} 90 ${50 - 25} 100M${50 - 20} 74C${50 - 16} 80 ${50 - 21} 88 ${50 - 17} 96M${50 + 22} 74C${50 + 26} 82 ${50 + 21} 90 ${50 + 26} 100`, null, { s: '#3d6e50', w: 2.2 });
  if (p === 'towel') out += BAND(`M${50 - 12} 64C${50 - 12} 74 ${50 + 12} 74 ${50 + 12} 64`, '#e9e4d6', 3.6, sw) + BAND(`M${50 + 7.6} 70C${50 + 9} 78 ${50 + 9.6} 86 ${50 + 9} 94`, '#e9e4d6', 3.4, sw) + BAND(`M${50 + 3.6} 71.6C${50 + 4.4} 78 ${50 + 4.4} 84 ${50 + 3.8} 90`, '#e9e4d6', 3, sw);
  if (p === 'rope') out += BAND(`M${50 - 38} 86C${50 - 20} 76 ${50 + 4} 80 ${50 + 18} 102`, '#a68a5c', 2.6, 1) + (lod ? P(`M${50 - 30} 81.4l1.4 1.8M${50 - 22} 78.6l1.2 2M${50 - 13} 77.6l1 2M${50 - 4} 79l.6 2.2M${50 + 5} 83l.2 2.2M${50 + 12} 90l-.2 2.2`, null, { s: INK, w: .5, a: .6 }) : '');
  if (p === 'earring') out += E(g.L + .4, g.ey + 7.6, 1.2, 1.2, '#c19a3e', { s: INK, w: .5 }) + P(`M${g.L + .4} ${g.ey + 8.8}l-.8 3.2l.8 1.6l.8 -1.6z`, '#c19a3e', { s: INK, w: .4 }) + E(g.R, g.ey + 7.4, 1, 1, '#c19a3e', { s: INK, w: .5 });
  if (p === 'hoop') out += E(g.L + .2, g.ey + 9.4, 1.6, 2.2, 'none', { s: '#c19a3e', w: 1 }) + E(g.R, g.ey + 9.2, 1.4, 2, 'none', { s: '#c19a3e', w: .9 });
  if (c.mask) out += P(`M${g.L - 1.4} 48.6C${50 - 4} 47.4 ${50 + 4} 47.4 ${g.R + 1.4} 48.6C${g.R + 1} 56 ${50 + 8} 64.6 ${g.chx} 65.6C${50 - 8} 64.6 ${g.L - 1} 56 ${g.L - 1.4} 48.6Z`, c.mask, { s: INK, w: sw }) + (lod ? P(`M${g.L + 2} 52C${50 - 3} 53 ${50 + 3} 53 ${g.R - 2} 52`, null, { s: '#5b6763', w: .7, a: .8 }) : '');
  return out; }

/* ─────────── 등장인물 ───────────
   skin 피부 · face 얼굴 틀 · hair/hairCol 머리 · hat 쓰개 · eye/brow/nose/mouth 이목구비 · beard 수염
   robe 옷(col 바탕 · collar 깃 · trim 깃 색 · b 어깨 폭 · shawl 표) · armor/fur/kesa 겉 · prop 소품 · bg 배경 물빛 · y 아래로 내림 */
const C_ = {
  // 선장 셋
  gungbok: { skin: 'warm', face: { w: 13.8, jw: 10.8, chin: 64.5 }, brow: { th: 2.3, w: 7.6 }, eye: { w: 5.8, h: 2.4 }, hat: { type: 'futou', tails: 'soft' }, beard: { type: 'full', len: 3.4 },
    robe: { col: '#8d2a1b', collar: 'round', trim: '#6e1f14', b: 1.1 }, armor: { col: '#2c3534', lace: '#c19a3e' }, bg: '#b03a26', expr: ['neutral', 'determined', 'grim'] },
  ara: { skin: 'fair', face: { w: 12.6, jw: 8.6, chin: 62.6 }, hair: { line: 31, part: 1, vol: 2.8, bun: [50, 15.2, 7.4], pin: [40, 18.6, 63, 11.6, '#2f7a68'] }, brow: { th: 1.3, w: 6.8, arch: 1.2 }, eye: { w: 5.6, h: 2.6 }, lash: 1, mouth: { lip: '#b8442e', w: 5 }, blush: '#b8442e',
    robe: { col: '#e8dcc0', collar: 'cross', trim: '#2f7a68', b: .9, shawl: '#c7953f' }, prop2: 'earring', bg: '#2f7a68', expr: ['neutral', 'determined', 'grim'] },
  tomo: { skin: 'warm', face: { w: 12.8, jw: 9.2, chin: 64.6 }, hat: { type: 'eboshi' }, eye: { w: 5.6, h: 1.8, slant: .9 }, brow: { th: 1.6, w: 7.2, arch: .4 }, beard: { type: 'goatee', len: 3.6, mus: 'thin' }, scar: 'M62.5 47.8l-3.6 8.6',
    robe: { col: '#2f4559', collar: 'round', trim: '#b58a3c', inner: '#e9e4d6', b: 1 }, bg: '#2a4f86', y: 2, expr: ['neutral', 'determined', 'grim'] },
  // 처음부터 배에 탄 셋
  helm: { skin: 'tan', hairCol: 'white', face: { w: 13.2, jw: 10, chin: 64 }, hair: { line: 31.4, vol: 1.6, knot: 1 }, hat: { type: 'band', y: 30.6, col: '#3d6e50' }, old: 1, forehead: 0, brow: { th: 1.8, col: '#e9e4d6', w: 7.4 }, eye: { h: 2.1 },
    beard: { type: 'long', col: 'white', len: 15 }, robe: { col: '#7d6a4a', collar: 'cross', trim: '#5a4a32', b: 1 }, bg: '#3d6e50', expr: ['neutral', 'smile'] },
  deck: { skin: 'tan', face: { w: 14.6, jw: 12, chin: 65 }, hair: { line: 30, fringe: 5, vol: 2.6, knot: 1 }, hat: { type: 'band', y: 29.8, col: '#b03a26', knot: 1 }, brow: { th: 2.6, w: 7.6 }, eye: { h: 2.3 }, beard: { type: 'stubble' }, scar: 'M37.6 50.4l5.2 3.8',
    robe: { col: '#4a3a2c', collar: 'vest', b: 1.18 }, bg: '#b03a26', expr: ['determined', 'grim'] },
  tongue: { skin: 'fair', face: { w: 12.4, jw: 8.4, chin: 62.4 }, hair: { line: 31.2, part: 1, long: 92, vol: 2.2, locks: 1 }, brow: { th: 1.2, w: 6.4, arch: 1.2 }, eye: { w: 5.4, h: 2.6 }, lash: 1, mouth: { lip: '#b8442e', w: 4.6 }, blush: '#b8442e',
    robe: { col: '#4b6a8a', collar: 'layers', layers: ['#b8442e', '#d6a540'], trim: '#f3efe4', b: .88 }, bg: '#4b6a8a', expr: ['neutral', 'smile'] },
  // 선술집 뱃사람 열
  archer: { skin: 'tan', face: { w: 13, jw: 9.6, chin: 63.6 }, hat: { type: 'geon', col: '#5c8a6a', line: '#2f4a3a' }, brow: { th: 2, w: 7 }, eye: { h: 2.5 }, robe: { col: '#5c6e58', collar: 'cross', trim: '#3d4a3a', b: 1 }, prop: 'bow', prop2: 'quiver', bg: '#3d6e50', expr: ['determined', 'smile'] },
  rower: { skin: 'tan', face: { w: 15.2, jw: 13, chin: 65.4, cheek: .8 }, hair: { line: 29.8, vol: 2, knot: 1 }, brow: { th: 3, w: 8 }, eye: { w: 5, h: 2 }, nose: { w: 1.4 }, beard: { type: 'stubble' },
    robe: { col: '#6b5a40', collar: 'bare', b: 1.24 }, prop: 'oar', prop2: 'towel', bg: '#85631a', expr: ['smile', 'determined'] },
  doctor: { skin: 'warm', face: { w: 12.6, jw: 8.8, chin: 64 }, hat: { type: 'geon', col: '#3f4a48' }, old: 1, brow: { th: 1.4, w: 6.8, col: '#cfcabb' }, eye: { h: 1.9 }, beard: { type: 'goatee', col: 'grey', len: 11, mus: 'long' },
    robe: { col: '#4f6b5c', collar: 'round', trim: '#3d5548', b: .96 }, prop2: 'beads', bg: '#5c8a6a', expr: ['calm', 'smile'] },
  trader: { skin: 'warm', face: { w: 14.8, jw: 12.4, chin: 65, cheek: 1.4 }, hat: { type: 'futou', tails: 'soft' }, brow: { th: 1.8, w: 6.6, arch: 1.4 }, eye: { w: 5, h: 1.8 }, beard: { type: 'goatee', len: 2.4, mus: 'thin' }, blush: '#b8442e',
    robe: { col: '#b58a3c', collar: 'round', trim: '#85631a', b: 1.14 }, prop2: 'coins', bg: '#c19a3e', expr: ['smile', 'sly'] },
  diver: { skin: 'tan', face: { w: 12.8, jw: 9, chin: 62.8 }, hair: { line: 31, vol: 2 }, hat: { type: 'scarf', col: '#f3efe4' }, brow: { th: 1.5, w: 6.6, arch: 1 }, eye: { w: 5.6, h: 2.7 }, lash: 1, mouth: { lip: '#a33a26', w: 5 }, blush: '#b03a26',
    robe: { col: '#f3efe4', collar: 'haenyeo', trim: '#d3c7aa', b: .94 }, prop2: 'gourd', bg: '#3d7092', expr: ['smile', 'determined'] },
  seer: { skin: 'fair', face: { w: 12.4, jw: 8.4, chin: 63 }, hair: { line: 31.4, part: 1, long: 100, vol: 2.4, locks: 1 }, hat: { type: 'band', y: 30, col: '#b03a26' }, brow: { th: 1.2, w: 6.4, arch: 1.4 }, eye: { w: 5.6, h: 2.3, slant: .7 }, lash: 1, mouth: { lip: '#8d2a1b', w: 4.6 },
    robe: { col: '#f3efe4', collar: 'cross', trim: '#b03a26', b: .9, shawl: '#b03a26' }, prop2: 'mirror', bg: '#8d2a1b', expr: ['calm', 'sly'] },
  carpenter: { skin: 'tan', face: { w: 14.4, jw: 11.6, chin: 64.8 }, hair: { line: 30.4, vol: 1.8, knot: 1 }, hat: { type: 'band', y: 30.2, col: '#d3c7aa' }, brow: { th: 2.6, w: 7.6 }, eye: { h: 2.1 }, nose: { w: 1.3 }, beard: { type: 'full', len: 3.2, col: 'brown' },
    robe: { col: '#8a6a44', collar: 'cross', trim: '#5a4a32', b: 1.16 }, prop: 'axe', bg: '#85631a', expr: ['smile', 'determined'] },
  ken: { skin: 'warm', face: { w: 12.8, jw: 9.2, chin: 64.4 }, hair: { line: 30.6, vol: 2.2, tail: 1 }, hat: { type: 'band', y: 30.2, col: '#f3efe4' }, tie: '#f3efe4', brow: { th: 2.2, w: 7.6, arch: .3 }, eye: { w: 5.8, h: 2, slant: .9 }, scar: 'M42 37.6l3.2 11',
    robe: { col: '#2a3550', collar: 'cross', trim: '#1b2324', b: 1 }, bg: '#22324a', expr: ['determined', 'grim'] },
  hassan: { skin: 'deep', face: { w: 13.2, jw: 10, chin: 64.6 }, hat: { type: 'turban', col: '#ece5d3', col2: '#2f7a68' }, brow: { th: 2.2, w: 7.4 }, eye: { w: 5.8, h: 2.6 }, nose: { len: .8 }, beard: { type: 'full', len: 7 },
    robe: { col: '#2f7a68', collar: 'kaftan', trim: '#c19a3e', b: 1.02 }, prop2: 'astro', bg: '#2f7a68', expr: ['smile', 'determined'] },
  shadow: { skin: 'warm', face: { w: 12.8, jw: 9.4, chin: 64 }, hat: { type: 'hood', col: '#2c3534' }, mask: '#3f4a48', brow: { th: 2, w: 7.2, arch: .2 }, eye: { w: 5.6, h: 2, slant: .8 },
    robe: { col: '#2c3534', collar: 'cross', trim: '#1b2324', b: .98 }, bg: '#3f4a48', expr: ['sly', 'grim'] },
  // 현상 수배 두목 여섯
  jang: { skin: 'pale', face: { w: 12.8, jw: 9, chin: 65.2 }, hair: { line: 30, fringe: 6, vol: 3.4, wild: 1 }, hairCol: 'ink', brow: { th: 2, w: 7, arch: .2 }, eye: { w: 5.4, h: 2.2, col: '#3a5a50' }, old: 1, gap: 1,
    beard: { type: 'stubble' }, robe: { col: '#3a4a44', collar: 'cross', trim: '#26302c', b: .96 }, prop2: 'seaweed', bg: '#3d6e50', expr: ['snarl', 'sly'] },
  saburo: { skin: 'tan', face: { w: 13.4, jw: 10.4, chin: 64.6 }, hair: { line: 30.4, vol: 2.6, tail: 1 }, hat: { type: 'band', y: 30, col: '#22324a' }, tie: '#22324a', patch: 'R', brow: { th: 2.4, w: 7.4 }, eye: { w: 5.6, h: 2.2 }, beard: { type: 'stubble' },
    robe: { col: '#6b4a32', collar: 'cross', trim: '#3b2a1c', b: 1.04 }, prop: 'bow', prop2: 'quiver', bg: '#6b4a32', expr: ['sly', 'snarl'] },
  wangdu: { skin: 'tan', hairCol: 'red', face: { w: 14.6, jw: 12, chin: 64.6 }, hat: { type: 'band', y: 28.6, col: '#1b2324' }, hair: { line: 29, vol: 3, fringe: 0 }, brow: { th: 3, w: 8, col: '#9a3a22' }, eye: { w: 5.2, h: 2.2 }, nose: { w: 1.4 },
    beard: { type: 'red', col: 'red' }, robe: { col: '#4a3a2c', collar: 'vest', b: 1.2 }, prop2: 'hoop', bg: '#b03a26', expr: ['snarl', 'sly'] },
  hong: { skin: 'fair', face: { w: 12.6, jw: 8.6, chin: 63 }, hair: { line: 31, part: 1, long: 78, vol: 2.4 }, hat: { type: 'scarf', col: '#b03a26', tail: 1, line: '#8d2a1b' }, brow: { th: 1.5, w: 7, arch: .8 }, eye: { w: 5.8, h: 2.3, slant: 1 }, lash: 1, mouth: { lip: '#8d2a1b', w: 4.8 },
    robe: { col: '#b03a26', collar: 'cross', trim: '#1b2324', b: .92, shawl: '#8d2a1b' }, prop2: 'hoop', bg: '#8d2a1b', expr: ['sly', 'determined'] },
  okuma: { skin: 'tan', face: { w: 15, jw: 12.6, chin: 65.6 }, hair: { line: 29.4, vol: 4, wild: 1, fringe: 6 }, brow: { th: 3.2, w: 8.4 }, eye: { w: 5, h: 2.1 }, nose: { w: 1.5 }, beard: { type: 'full', len: 6.6 }, scar: 'M58.6 36.6l4.6 10.2',
    robe: { col: '#3b2a1c', collar: 'cross', trim: '#1b2324', b: 1.24 }, armor: { col: '#5a4030', lace: '#2a4f86' }, fur: '#8d9187', bg: '#6b4a32', expr: ['snarl', 'grim'] },
  ilang: { skin: 'warm', face: { w: 13.4, jw: 10, chin: 65 }, hat: { type: 'helmet', col: '#1b2324', col2: '#2c3534', trim: '#c19a3e', crest: 'horn' }, brow: { th: 2.2, w: 7.6, arch: .2 }, eye: { w: 5.8, h: 2, slant: 1 },
    beard: { type: 'goatee', len: 5, mus: 'long' }, robe: { col: '#1b2324', collar: 'round', trim: '#c19a3e', b: 1.14 }, armor: { col: '#1e2829', lace: '#b03a26' }, bg: '#1e2829', y: 3, expr: ['grim', 'sly'] },
  // 이야기에 말을 거는 사람들
  inspector: { skin: 'warm', face: { w: 12.8, jw: 9, chin: 64.6 }, hat: { type: 'futou', tails: 'wing' }, brow: { th: 1.6, w: 7, arch: .2 }, eye: { w: 5.4, h: 1.9, slant: .5 }, beard: { type: 'goatee', len: 3.4, mus: 'thin' },
    robe: { col: '#3d6e50', collar: 'round', trim: '#2f5a42', b: .98 }, prop2: 'hol', bg: '#3d6e50', expr: ['grim', 'sly'] },
  prince: { skin: 'fair', face: { w: 12.8, jw: 9.4, chin: 64 }, hat: { type: 'futou', tails: 'wing', orn: '#c19a3e' }, brow: { th: 1.5, w: 7, arch: 1 }, eye: { w: 5.6, h: 2.4 }, beard: { type: 'goatee', len: 1.8, mus: 'thin' },
    robe: { col: '#5b3d5e', collar: 'round', trim: '#c19a3e', b: 1 }, prop2: 'hol', bg: '#5b3d5e', expr: ['grim', 'determined'] },
  yeomjang: { skin: 'warm', face: { w: 13.2, jw: 10.2, chin: 64.6 }, hat: { type: 'futou', tails: 'stiff' }, brow: { th: 2, w: 7.4, arch: .2 }, eye: { w: 5.6, h: 2, slant: .8 }, beard: { type: 'goatee', len: 4, mus: 'droop' },
    robe: { col: '#3f4a48', collar: 'round', trim: '#2c3534', b: 1.06 }, armor: { col: '#6b4a32', lace: '#2a4f86' }, bg: '#3f4a48', expr: ['smile', 'sly'] },
  wangheir: { skin: 'fair', face: { w: 12.6, jw: 9, chin: 63.6 }, hat: { type: 'futou', tails: 'soft' }, brow: { th: 1.5, w: 7, arch: .6 }, eye: { w: 5.6, h: 2, slant: .7 }, beard: { type: 'goatee', len: 1.6, mus: 'thin' },
    robe: { col: '#8a3a2a', collar: 'round', trim: '#c19a3e', b: 1 }, bg: '#8a3a2a', expr: ['sly', 'smile'] },
  miyata: { skin: 'fair', face: { w: 13.6, jw: 11, chin: 64.6, cheek: 1 }, hat: { type: 'kanmuri' }, brow: { th: 1.4, w: 4.6, arch: 1.4, y: -1.4 }, eye: { w: 5, h: 1.7, slant: .5 }, beard: { type: 'goatee', len: 1.6, mus: 'thin' }, blush: '#b8442e',
    robe: { col: '#22324a', collar: 'round', trim: '#1b2324', b: 1.08 }, prop2: 'hol', bg: '#2a4f86', y: 3, expr: ['sly', 'smile'] },
  lichung: { skin: 'tan', face: { w: 13, jw: 9.8, chin: 64.2 }, hat: { type: 'geon', col: '#22324a' }, brow: { th: 1.8, w: 7, arch: .6 }, eye: { w: 5.4, h: 2.3 }, beard: { type: 'goatee', len: 2.4, mus: 'droop' },
    robe: { col: '#23506e', collar: 'round', trim: '#1b3a52', b: 1 }, bg: '#23506e', expr: ['grim', 'neutral'] },
  monk: { skin: 'warm', face: { w: 12.8, jw: 9.2, chin: 63.8 }, hair: { shaved: 1 }, brow: { th: 1.4, w: 6.8, arch: 1 }, eye: { w: 5.4, h: 2.2 }, robe: { col: '#6f6a5c', collar: 'monk', inner: '#e9e4d6', b: .96 }, kesa: '#9a6a34', prop2: 'beads', bg: '#85631a', expr: ['calm', 'smile'] },
  navy: { skin: 'tan', face: { w: 14, jw: 11.4, chin: 64.8 }, hat: { type: 'helmet', col: '#3f4a48', col2: '#2c3534', trim: '#c19a3e', plume: '#b03a26' }, brow: { th: 2.6, w: 7.8 }, eye: { w: 5.4, h: 2.1 }, beard: { type: 'full', len: 3, mus: 'droop' },
    robe: { col: '#23506e', collar: 'round', trim: '#1b3a52', b: 1.12 }, armor: { col: '#3f4a48', lace: '#c19a3e' }, bg: '#23506e', y: 2, expr: ['determined', 'smile'] },
  balhae: { skin: 'warm', face: { w: 13.4, jw: 10, chin: 64.6 }, hat: { type: 'fur', col: '#6b4a32', col2: '#2a4f86' }, brow: { th: 2, w: 7.2 }, eye: { w: 5.4, h: 2.2, slant: .5 }, beard: { type: 'goatee', len: 6, mus: 'droop' },
    robe: { col: '#2a4f86', collar: 'round', trim: '#6b4a32', b: 1.04 }, fur: '#6b4a32', bg: '#2a4f86', y: 2, expr: ['grim', 'neutral'] },
  elder: { skin: 'deep', face: { w: 13, jw: 9.6, chin: 64.6 }, hat: { type: 'turban', col: '#d3c7aa', col2: '#b03a26' }, old: 1, brow: { th: 2, w: 7.4, col: '#e9e4d6' }, eye: { h: 1.9 }, beard: { type: 'long', col: 'white', len: 13 },
    robe: { col: '#85631a', collar: 'kaftan', trim: '#3b2a1c', b: 1 }, bg: '#85631a', expr: ['smile', 'neutral'] },
  seol: { skin: 'warm', face: { w: 14, jw: 11.6, chin: 64.8, cheek: 1 }, hat: { type: 'futou', tails: 'soft' }, brow: { th: 1.8, w: 7, arch: .8 }, eye: { w: 5.2, h: 1.9 }, beard: { type: 'full', len: 2.6, mus: 'droop' },
    robe: { col: '#23506e', collar: 'round', trim: '#c19a3e', b: 1.12 }, prop2: 'book', bg: '#23506e', expr: ['smile', 'sly'] },
  fisher: { skin: 'tan', face: { w: 13, jw: 9.8, chin: 64 }, hairCol: 'grey', hair: { line: 31, vol: 1.4 }, hat: { type: 'satgat', col: '#c9a96a' }, old: 1, brow: { th: 1.8, col: '#cfcabb', w: 7 }, eye: { h: 1.8 }, beard: { type: 'goatee', col: 'grey', len: 6, mus: 'droop' },
    robe: { col: '#8a7e64', collar: 'cross', trim: '#5a4a32', b: 1 }, bg: '#3d7092', y: 2, expr: ['smile', 'calm'] }
};

/* ─────────── 틀 ─────────── */
function frameOf(kind, c, id, sw) { const bg = c.bg || '#8d9187';
  const wash = `<radialGradient id="${id}w" cx=".42" cy=".38" r=".66"><stop offset="0" stop-color="${bg}" stop-opacity=".30"/><stop offset=".7" stop-color="${bg}" stop-opacity=".12"/><stop offset="1" stop-color="${bg}" stop-opacity=".04"/></radialGradient>`;
  if (kind === 'round') return { defs: wash + `<clipPath id="${id}c"><circle cx="50" cy="50" r="48"/></clipPath>`, back: `<circle cx="50" cy="50" r="48" fill="${PAPER}"/><circle cx="50" cy="50" r="48" fill="url(#${id}w)"/>`,
    front: `<circle cx="50" cy="50" r="47.6" fill="none" stroke="${PAPER}" stroke-width="1" opacity=".7"/><circle cx="50" cy="50" r="48.6" fill="none" stroke="${INK}" stroke-width="${sw * 1.1}"/>`, clip: `url(#${id}c)` };
  if (kind === 'seal') return { defs: wash + `<clipPath id="${id}c"><rect x="3" y="3" width="94" height="94" rx="2"/></clipPath>`, back: `<rect x="3" y="3" width="94" height="94" rx="2" fill="${PAPER}"/><rect x="3" y="3" width="94" height="94" fill="url(#${id}w)"/>`,
    front: `<rect x="2.5" y="2.5" width="95" height="95" rx="2" fill="none" stroke="#b03a26" stroke-width="${sw * 2}"/><rect x="5.6" y="5.6" width="88.8" height="88.8" fill="none" stroke="#b03a26" stroke-width=".7" opacity=".8"/>`, clip: `url(#${id}c)` };
  if (kind === 'card') return { defs: wash + `<clipPath id="${id}c"><rect x="1" y="1" width="98" height="98"/></clipPath>`, back: `<rect x="1" y="1" width="98" height="98" fill="${PAPER}"/><rect x="1" y="1" width="98" height="98" fill="url(#${id}w)"/>`,
    front: `<rect x="1" y="1" width="98" height="3.2" fill="#22324a"/><rect x="1" y="4.2" width="98" height="1.2" fill="#2f7a68"/><rect x="1" y="5.4" width="98" height=".7" fill="#f3efe4"/><rect x="1" y="6.1" width="98" height="1.2" fill="#b8442e"/><rect x="1" y="1" width="98" height="98" fill="none" stroke="${INK}" stroke-width="${sw * .9}"/>`, clip: `url(#${id}c)` };
  return { defs: '', back: '', front: '', clip: null }; }

function svg(id, o = {}) { const c = C_[id]; if (!c) return ''; const size = o.size || 96, lod = size >= 72 ? 1 : 0, sw = lod ? 1.4 : 2.1, frame = o.frame || 'round';
  const ex = EXPR[o.expr] || EXPR[(c.expr || ['neutral'])[0]], g = headGeo(c), sk = SKIN[c.skin || 'warm'], key = 'pt' + (++uid), F = frameOf(frame, c, key, sw);
  const shaved = c.hair && c.hair.shaved, headless = !c.hair && !c.hat;
  const fig = [propBack(g, c, sw, lod), hat(g, c, sw, lod, 'back'), hairBack(g, c, sw), body(g, c, sw, lod),
    c.robe && c.robe.collar === 'round' ? P(`M${50 - 11.6} 66C${50 - 11.6} 59.6 ${50 + 11.6} 59.6 ${50 + 11.6} 66Z`, (c.robe.trim || c.robe.col), { s: INK, w: sw }) : '',
    (c.robe && ['vest', 'bare'].includes(c.robe.collar) ? P(`M${50 - 6.8} 52L${50 - 7.4} 66L${50 + 7.4} 66L${50 + 6.8} 52Z`, sk[1]) + P(`M${50 - 6.8} 52L${50 - 7.4} 64M${50 + 6.8} 52L${50 + 7.4} 64`, null, { s: INK, w: sw }) + P(`M${50 - 14} 72.4Q${50 - 7} 70.4 ${50 - 2} 73M${50 + 14} 72.4Q${50 + 7} 70.4 ${50 + 2} 73`, null, { s: INK, w: .8, a: .5 }) : neck(g, sk, sw, c.robe && ['cross', 'layers', 'monk'].includes(c.robe.collar) ? 78 : 70)), collar(g, c, sw, lod), over(g, c, sw, lod),
    ears(g, sk, sw), P(facePath(g), sk[0], { s: INK, w: sw }), P(faceShade(g), sk[1], { a: .75 }),
    shaved ? P(`M${g.L + 1} 36C${g.L} 26 ${50 - 7} 21.6 50 21.6C${50 + 7} 21.6 ${g.R} 26 ${g.R - 1} 36C${50 + 6} 30 ${50 - 6} 30 ${g.L + 1} 36Z`, '#5b6763', { a: .22 }) + (lod ? P(`M${g.L + 3} 28C${50 - 6} 23 ${50 - 2} 22.6 50 22.6`, null, { s: PAPER, w: 1, a: .55 }) : '') : '',
    cheeks(g, c), lines(g, c, ex), brows(g, c, ex, sw), eyes(g, c, ex, sw, lod), nose(g, c, sk, sw), mouth(g, c, ex, sw), beard(g, c, sw, lod),
    !shaved && !headless && c.hair ? hairCap(g, c, sw) + hairShine(g, c, lod) : '', hairFront(g, c, sw, lod), hat(g, c, sw, lod, 'front'), propFront(g, c, sw, lod)].join('');
  const tf = [o.flip ? 'translate(100 0) scale(-1 1)' : '', `translate(0 ${r1(3 + (c.y || 0))}) translate(50 56) scale(1.16) translate(-50 -56)`].filter(Boolean).join(' ');
  const body_ = `<g${tf ? ` transform="${tf}"` : ''}>${fig}</g>`;
  return `<svg class="portrait" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true" focusable="false"><defs>${F.defs}</defs>${F.back}${F.clip ? `<g clip-path="${F.clip}">${body_}</g>` : body_}${F.front}</svg>`; }

/* 이야기 장면에서 누가 말하는가 — 핵심 규칙의 'who'와 막 번호를 그림 하나로 */
const QUEST_WHO = { '圖': 'helm', '僧': 'monk', '軍': 'navy', '使': 'balhae', '南': 'elder', '簿': 'seol', '鯨': 'fisher' };
const ACT_WHO = { gungbok: [null, null, null, 'prince', 'yeomjang'], ara: [null, 'wangheir', null, null], tomo: [null, 'miyata', 'lichung', null] };
const ACT_MOOD = { gungbok: ['determined', 'grim', 'neutral', 'grim', 'grim'], ara: ['neutral', 'determined', 'grim', 'grim'], tomo: ['neutral', 'determined', 'grim', 'grim'] };
function speaker(st, cap, act) { if (!st) return null; const w = st.who;
  if (w === 'main') { const npc = st.fin ? null : (ACT_WHO[cap] || [])[act]; if (npc) return { id: npc, expr: (C_[npc].expr || [])[0] };
    return { id: cap, expr: st.fin ? 'determined' : (ACT_MOOD[cap] || [])[act] || 'neutral' }; }
  if (w === 'quest') { const id = QUEST_WHO[st.qch]; return id ? { id, expr: (C_[id].expr || [])[0] } : null; }
  if (w === 'inspector') return { id: 'inspector', expr: 'grim' };
  if (C_[w]) return { id: w, expr: (C_[w].expr || [])[0] };
  return null; }
const has = id => !!C_[id];
const exprs = id => (C_[id] && C_[id].expr) || ['neutral'];
return { svg, speaker, has, exprs, ids: Object.keys(C_) };
})();
if (typeof module !== 'undefined') module.exports = PORTRAIT;
