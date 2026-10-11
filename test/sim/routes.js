// 항로 차익 상위 5: 어디서 사서 어디에 팔면 상자당 얼마가 남나(기본값 기준, 새 판 20개 평균). 숨은 항구 포함/제외 둘 다.
// 사용: node test/sim/routes.js [판 수=20]
const C = require('../../src/core.js'); const { PORTS, PORT_IDS, G, LOT } = C; const N = +process.argv[2] || 20;
const acc = {};
for (let n = 0; n < N; n++) { const S = C.newGame('gungbok', 'pungrang');
  for (const a of PORT_IDS) for (const id of PORTS[a].prod) { const buy = G[id].base * S.markets[a].home[id] * LOT;
    for (const b of PORT_IDS) { if (a === b) continue; const sell = G[id].base * S.markets[b].home[id] * .93 * LOT; const k = `${a}>${b}:${id}`; (acc[k] = acc[k] || { a, b, id, m: 0, d: 0 }).m += (sell - buy) / N; } } }
for (const r of Object.values(acc)) { const p = C.findPath(PORTS[r.a].x, PORTS[r.a].y, PORTS[r.b].x, PORTS[r.b].y); r.d = p ? C.estimateDays(p, 0, 1) : 99; r.pd = r.m / Math.max(3, r.d); }
const show = (title, list) => { console.log(`\n${title}`); list.slice(0, 5).forEach((r, i) => console.log(`  ${i + 1}. ${PORTS[r.a].name} → ${PORTS[r.b].name} ${G[r.id].name} · 상자당 ${Math.round(r.m).toLocaleString('ko-KR')}냥 · 약 ${Math.round(r.d)}일 · 하루 ${Math.round(r.pd)}냥`)); };
const all = Object.values(acc).sort((x, y) => y.m - x.m), open = all.filter(r => !PORTS[r.a].hidden && !PORTS[r.b].hidden);
show('상자당 차익 상위 5 (숨은 항구 포함)', all); show('상자당 차익 상위 5 (보통 항구만)', open);
show('하루당 차익 상위 5 (보통 항구만)', open.slice().sort((x, y) => y.pd - x.pd));
