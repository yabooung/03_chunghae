// 해전 시뮬: 첫 해, 적마다 smart(예고를 읽는다) / random(아무 수나) 승률.
// 보통 적은 첫 배(어선), 두목은 수배가 나오기 시작하는 배(BOSS_TIER: 장씨·사부로 중선, 왕두·여적 대선, 오쿠마·이랑 누선)로 싸운다. 피해는 진 판이면 난파 뒤 남은 선체 기준.
// 사용: node test/sim/battle.js [판 수=300] [난이도: baram|pungrang|taepung|all=all]
const C = require('../../src/core.js');
const N = +process.argv[2] || 300, ARG = process.argv[3] || 'all';
const DIFFS = ARG === 'all' ? Object.keys(C.DIFFS) : [ARG];
function smart(B) { const I = B.intent, near = B.dist === 'near', S = C.S, mv = S.stamina >= 15;
  if (I.k === 'volley') return near || !mv ? 'guard' : 'move';
  if (I.k === 'aim') return near ? 'board' : (mv ? 'move' : 'shoot');
  if (near) { if (I.k === 'board') return (B.e.hp <= C.boardDmg() * 1.2 * B.mom) ? 'board' : (mv ? 'move' : 'guard');
    if (I.k === 'ram') return mv ? 'move' : 'guard'; return 'board'; }
  return 'shoot'; }
function rand() { const o = C.battleOpts().filter(o => o.ok && o.id !== 'flee'); return o[Math.floor(Math.random() * o.length)].id; }
const REG = [['해적', { kind: 'pirate', name: '해적', g: 'plain', hp: 42, atk: 10 }], ['백병 해적', { kind: 'pirate', name: '해적', g: 'boarder', hp: 42, atk: 10 }], ['궁수 해적', { kind: 'pirate', name: '해적', g: 'archer', hp: 42, atk: 10 }],
  ['흑기', { kind: 'black', name: '흑기', g: 'boarder', hp: 70, atk: 12 }], ['노예선', { kind: 'slaver', name: '노예선', g: 'archer', hp: 55, atk: 10 }]];
const BOSS = C.BOSSES.map(b => [b.name, { kind: 'boss', boss: b.id, name: b.name, g: b.g, hp: b.hp, atk: b.atk }]);
function fight(diff, sp, pol, tier) { let w = 0, loss = 0;
  for (let i = 0; i < N; i++) { const S = C.newGame('ara', diff); S.tier = tier; S.hullMax = S.hull = C.SHIPS[tier].hull; S.mode = 'sail'; S.voyage = { from: 'cheonghae', t0: 0 }; S.x = 500; S.y = 1000;
    C.makeBattle(sp); let g = 0; while (!S.battle.over && g++ < 40) C.battleAct(pol(S.battle)); if (S.battle.over === 'win') w++; loss += C.SHIPS[tier].hull - Math.max(0, S.hull); }
  return { w: w / N, loss: loss / N }; }
const pc = x => (x * 100).toFixed(0).padStart(3) + '%';
for (const diff of DIFFS) { console.log(`\n== ${C.DIFFS[diff].name} (${diff}) · 첫 해 · ${N}판씩`); const agg = { reg: [0, 0, 0], boss: [0, 0] };
  for (const [grp, list] of [['reg', REG], ['boss', BOSS]]) for (const [nm, sp] of list) { const t = grp === 'boss' ? (C.BOSS_TIER[sp.boss] || 1) : 0, a = fight(diff, sp, smart, t), b = fight(diff, sp, rand, t);
    agg[grp][0] += a.w / list.length; agg[grp][1] += b.w / list.length; if (grp === 'reg' && sp.kind === 'pirate') agg.reg[2] += b.w / 3;
    console.log(`  ${(nm + (t ? `(${C.SHIPS[t].name})` : '')).padEnd(12)} smart ${pc(a.w)} 피해 ${a.loss.toFixed(0).padStart(3)} · random ${pc(b.w)} 피해 ${b.loss.toFixed(0).padStart(3)}`); }
  console.log(`  ▶ 해적 3종 random ${pc(agg.reg[2])} · 보통 적 5종 smart ${pc(agg.reg[0])} random ${pc(agg.reg[1])} · 두목 smart ${pc(agg.boss[0])} random ${pc(agg.boss[1])}`); }
