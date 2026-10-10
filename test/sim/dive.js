// 잠수 욕심 비교: 여유 m = 다음 길 최대 비용(cost+5)보다 숨이 m 이상 남아야 내려간다. '끝'은 숨과 상관없이 바닥까지 민다.
// 값 = 은자 + 상자(반값으로 셈). 숨이 끊기면 건진 것을 모두 잃는다 — 끝까지 미는 쪽이 기대값에서 이기면 안 된다.
const C = require('../../src/core.js'); const N = +process.argv[2] || 3000, DIFF = process.argv[3] || 'pungrang'; // 잠수 규칙은 난이도와 상관없다 — 확인용
const S = C.newGame('gungbok', DIFF);
const GREEDS = [-999, -5, 0, 10, 20, 30, 40];
console.log(`잠수 ${N}번씩 · ${C.DIFFS[S.diff].name}`);
for (const site of [{ lv: 1 }, { lv: 2 }, { lv: 3 }, { lv: 1, pearl: true, max: 4 }]) { const row = [];
  for (const greed of GREEDS) { let val = 0, rel = 0, bo = 0, dep = 0;
    for (let i = 0; i < N; i++) { S.relics = {}; S.slots = []; S.gold = 0; C.makeDive(Object.assign({ name: 'x' }, site)); const D = S.dive;
      while (!D.over) C.diveAct(D.depth >= D.max || (greed > -999 && D.breath < C.diveCost(D) + 5 + greed) ? 'up' : 'down');
      val += D.result.gold + D.result.crates.reduce((a, id) => a + C.G[id].base * C.LOT * .5, 0); rel += D.result.relics.length; if (D.over === 'blackout') bo++; dep += D.depth; S.dive = null; }
    row.push({ greed, val: val / N, rel: rel / N, bo: bo / N, dep: dep / N }); }
  const best = row.reduce((a, b) => b.val > a.val ? b : a);
  console.log(`\n${JSON.stringify(site)}`);
  for (const r of row) console.log(`  여유 ${r.greed === -999 ? '끝' : String(r.greed).padStart(2)} · 값 ${Math.round(r.val).toString().padStart(5)} · 유물 ${(r.rel * 100).toFixed(1).padStart(4)}% · 숨 끊김 ${(r.bo * 100).toFixed(1).padStart(4)}% · 깊이 ${r.dep.toFixed(1)}${r === best ? '  ← 값 최선' : ''}`);
}
