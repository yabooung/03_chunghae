// 이야기 완주 시뮬: 선장 × 난이도마다 "이야기를 끝까지 보려는" 봇이 막을 따라가 결말에 닿는 비율.
// 봇은 장사로 상납을 메우면서 막 목표(상납·방문·시주·납품·해전 스팟·해적 만남·홍려관)를 좇고, 장면·마지막 선택은 plan대로 고른다.
// 사용: node test/sim/story.js [판 수=6] [걸음 한도=2600] [선장 gungbok|ara|tomo|all=all] [난이도 baram|pungrang|taepung|all=all] [--assist]
//   --assist : 경제가 막히는지 이야기 논리가 막히는지 가르려고, 상납 직전 돈이 모자라면 채워 준다(이야기 논리만 검사)
const C = require('../../src/core.js'); const { PORTS, PORT_IDS } = C;
const argv = process.argv.slice(2), ASSIST = argv.includes('--assist'), A = argv.filter(a => !a.startsWith('--'));
const N = +A[0] || 6, GUARD = +A[1] || 2600, CAPS = (A[2] && A[2] !== 'all') ? [A[2]] : ['gungbok', 'ara', 'tomo'], DIFFS = (A[3] && A[3] !== 'all') ? [A[3]] : Object.keys(C.DIFFS);
const pick = a => a[Math.floor(Math.random() * a.length)];
function smartB(B) { const I = B.intent, near = B.dist === 'near', S = C.S, mv = S.stamina >= 15; if (S.hull < S.hullMax * .2 && !near && !B.e.boss && Math.random() < .5) return 'flee';
  if (I.k === 'volley') return near || !mv ? 'guard' : 'move'; if (I.k === 'aim') return near ? 'board' : (mv ? 'move' : 'shoot');
  if (near) { if (I.k === 'board') return (B.e.hp <= C.boardDmg() * 1.2 * B.mom) ? 'board' : (mv ? 'move' : 'guard'); if (I.k === 'ram') return mv ? 'move' : 'guard'; return 'board'; } return 'shoot'; }
function resolve(st) { const S = C.S; let g = 0; while (S.battle && g++ < 60) { if (S.battle.over) { const r = C.battleClose(); st.bt[r.over] = (st.bt[r.over] || 0) + 1; break; } C.battleAct(smartB(S.battle)); }
  g = 0; while (S.dive && g++ < 20) { const D = S.dive; if (D.over) { C.diveClose(); break; } C.diveAct(D.depth >= D.max || D.breath < C.diveCost(D) + 12 ? 'up' : 'down'); } }
/* 이야기 선택: plan에 적힌 것이 있으면 그걸, 없으면 고를 수 있는 것 중 첫째(마지막 선택은 plan.final) */
function drain(S, plan, st) { let s, g = 0; while ((s = C.nextStory()) && g++ < 30) { st.stories++;
    let o = null; if (s.title.includes('마지막 선택')) { const ok = s.opts.filter(x => !x.off); o = ok[Math.min(plan.final, ok.length - 1)]; st.finalSeen = s.opts.map(x => x.label + (x.off ? '×' : '')); }
    else if (s.who === 'main' && s.opts.length > 1) { o = s.opts.find(x => plan.pickMain && plan.pickMain.some(l => x.label.includes(l))) || s.opts.find(x => !x.off) || s.opts[0]; }
    else if (s.who === 'scene') { o = s.opts.find(x => plan.pickScene && plan.pickScene.some(l => x.label.includes(l)) && !x.off) || s.opts.find(x => !x.off) || s.opts[0]; }
    else o = s.opts.find(x => !x.off) || s.opts[0];
    if (!o) break; const r = o.apply(); if (typeof r === 'string') st.msgs.push(r); if (S.ended) break; } }
function play(cap, diff, plan) {
  const S = C.newGame(cap, diff), st = { stories: 0, msgs: [], bt: {}, quotaLog: [], assist: 0, maxAct: 0, finalSeen: null };
  const quotaSoon = () => C.daysToDue() < 25;
  const onQuota = res => st.quotaLog.push(!res.ok ? '×' : res.debt ? '債' : '○'); // 債 = 못 내고 빚으로 넘긴 계절
  const goalPort = () => { const gs = C.mainGoals().filter(g => !g.done); for (const g of gs) { if (g.k && S.known[g.k]) return g.k; if (g.pay && S.gold >= g.pay.n + C.quotaNow() * .5) return g.pay.k;
      if (g.text.includes('에 들른다') || g.text.includes('권선문')) { const ks = ['mizhou', 'chuzhou', 'deungju'].filter(k => !S.main.visits[k]); if (ks.length) return ks[0]; }
      if (g.deliver) { const have = S.slots.filter(x => x.id === g.deliver.good && x.from !== g.deliver.k).length; if (have >= g.deliver.n) return g.deliver.k; const src = PORT_IDS.find(k => S.known[k] && PORTS[k].prod.includes(g.deliver.good) && k !== g.deliver.k && k !== S.at); if (src) return src; }
      if (g.text.includes('홍려관') && S.at !== 'hakata' && S.slots.length >= 2) return 'hakata'; }
    return null; };
  for (let g = 0; g < GUARD && !S.ended; g++) {
    if (S.draft) { const d = S.draft; C.takeBoon(d.includes('hold') ? 'hold' : d.includes('haggle') ? 'haggle' : d[Math.floor(Math.random() * d.length)]); }
    if (S.mode === 'port') {
      if (ASSIST && S.t >= S.nextDue - 1 && S.gold < C.quotaNow()) { st.assist++; S.gold = C.quotaNow() + 2000; }
      for (const o of C.portTick()) if (o.type === 'quota') onQuota(o.res); if (S.ended) break; if (S.draft) continue;
      drain(S, plan, st); if (S.ended) break; st.maxAct = Math.max(st.maxAct, S.main.act);
      if (S.hull < S.hullMax * .6) C.repair();
      const n = C.nextShip(); if (n && S.gold > C.shipPrice(n) + C.quotaNow() * 1.1) C.upgrade();
      const calmGoal = C.mainGoals().some(gl => !gl.done && gl.text.includes('경계를'));
      if ((S.threat >= 50 || (calmGoal && S.threat >= 35)) && C.canTribute() && S.gold > C.tributeCost() + C.quotaNow() * .5) C.tribute();
      if (S.gold > 4000 && Math.random() < .5) C.buyRumor();
      const off = S.offers[S.at]; if (off && !off.none && S.orders.length < 2 && (S.markets[S.at].stock.includes(off.good) || Math.random() < .3)) C.acceptOffer(S.at);
      resolve(st);
      for (const gl of C.mainGoals()) { if (gl.pay && gl.pay.k === S.at && !gl.done && S.gold >= gl.pay.n + (quotaSoon() ? C.quotaNow() : 0)) C.mainPay(S.at); if (gl.deliver && gl.deliver.k === S.at) C.mainDeliver(S.at); }
      if (C.mainGoals().some(gl => !gl.done && gl.text.includes('홍려관')) && S.at === 'hakata' && S.slots.length) { const r = C.useSpecial('hakata'); if (!r.ok) st.msgs.push('bulk:' + r.text); }
      drain(S, plan, st); if (S.ended) break;
      if (S.mates.length < C.mateCap() && S.gold > 9000 + C.quotaNow()) { const t = C.tavern(S.at); if (t.offer[0]) C.hireMate(t.offer[0]); }
      const here = S.at; C.tickMarket(here); let best = null;
      for (const id of S.markets[here].stock) { const bp = C.buyPrice(here, id); for (const d of PORT_IDS) { if (d === here || !S.known[d]) continue; const inf = C.infoFor(d, id); if (!inf) continue; const p = C.plan(d); if (!p || p.closedPort) continue; const gg = (inf.price - bp) * C.LOT / Math.max(3, p.days); if (!best || gg > best.g) best = { id, d, g: gg, days: p.days }; } }
      // 의뢰 물건
      for (const o of S.orders) { const have = S.slots.filter(x => x.id === o.good).length; if (have < o.n && S.markets[here].stock.includes(o.good)) for (let i = have; i < o.n; i++) C.buy(o.good); }
      // 본 이야기 납품 물건(비단 3상자)
      for (const gl of C.mainGoals()) if (gl.deliver && !gl.done && S.markets[here].stock.includes(gl.deliver.good) && here !== gl.deliver.k) { const have = S.slots.filter(x => x.id === gl.deliver.good).length; for (let i = have; i < gl.deliver.n; i++) if (!C.buy(gl.deliver.good).ok) break; }
      // 해전 스팟(노예선 무리·관군 수군)
      const sp = C.mainSpots()[0]; if (sp && S.tier >= (S.cap === 'gungbok' ? 0 : 1) && S.hull > S.hullMax * .7 && !quotaSoon()) { const p = C.plan({ x: sp.x, y: sp.y }); if (p) { C.depart(p); continue; } }
      // 1막 해적 만남: 범이 장면(bumHunt)이 없으면 해적 해역을 지나는 길을 고른다
      const wantPirate = C.mainGoals().some(gl => !gl.done && gl.text.includes('해적을 한 번'));
      const court = S.cap !== 'tomo' && (S.threat >= 60 || (calmGoal && S.threat >= 40)) && !C.canTribute() ? ['cheonghae', 'ulsan'].filter(k => S.known[k] && k !== here).sort((a, b) => Math.hypot(PORTS[a].x - S.x, PORTS[a].y - S.y) - Math.hypot(PORTS[b].x - S.x, PORTS[b].y - S.y))[0] : null;
      const tk = court || goalPort(); const ready = S.orders.find(o => S.slots.filter(x => x.id === o.good).length >= o.n);
      let dest = tk && tk !== here ? tk : ready ? ready.to : (best && best.g > 0 ? best.d : null);
      if (!dest) { const fameNeed = C.mainGoals().some(gl => !gl.done && gl.text.startsWith('명성')); const und = PORT_IDS.filter(k => S.known[k] && !S.docked[k] && k !== here); dest = (fameNeed && und.length) ? und[0] : pick(PORT_IDS.filter(k => k !== here && S.known[k])); }
      if (best && best.g > 0 && best.d === dest) while (C.freeSlots() && S.gold >= C.cratePrice(here, best.id) + (quotaSoon() ? C.quotaNow() * .3 : 0)) if (!C.buy(best.id).ok) break;
      else if (best && best.g > 0 && S.slots.length < 2) while (C.freeSlots() && S.gold >= C.cratePrice(here, best.id) + C.quotaNow() * .5) if (!C.buy(best.id).ok) break;
      let p = C.plan(dest); if (!p || p.closedPort) { const alt = PORT_IDS.filter(k => k !== here && S.known[k] && !C.isClosed(k)); p = C.plan(pick(alt)); if (!p || p.closedPort) continue; }
      const sp2 = C.specialInfo(here); if (sp2 && sp2.can && !sp2.passive && ['escort', 'temple', 'inn', 'deal'].includes(sp2.kind) && S.gold > C.quotaNow()) { const r = C.useSpecial(here); if (r.ok) resolve(st); }
      const useAlt = !!p.alt && !wantPirate && S.slots.length >= 2; C.depart(p, useAlt);
    } else if (S.mode === 'sea') { const k = PORT_IDS.filter(k => S.known[k] && !C.isClosed(k)).sort((a, b) => Math.hypot(PORTS[a].x - S.x, PORTS[a].y - S.y) - Math.hypot(PORTS[b].x - S.x, PORTS[b].y - S.y))[0]; const pp = C.plan(k); if (pp && !pp.closedPort) C.depart(pp); else C.depart(C.plan(PORT_IDS.find(x => S.known[x] && !C.isClosed(x)))); }
    else { if (ASSIST && S.t >= S.nextDue - 1.5 && S.gold < C.quotaNow()) { st.assist++; S.gold = C.quotaNow() + 2000; }
      if (!S.rowing && S.stamina > 60 && Math.abs(S.windDeg || 0) > 100) C.setRow(true); const out = C.update(.5);
      for (const o of out) { if (o.type === 'event') { const ev = o.ev; const i = ev.id === 'pirate' ? (S.hull > S.hullMax * .5 ? 0 : 1) : ev.id === 'captives' ? 0 : ev.id === 'storm' ? 1 : 0; C.choose(Math.min(i, ev.opts.length - 1)); resolve(st); }
        if (o.type === 'quota') onQuota(o.res); if (o.type === 'battle' || o.type === 'dive') resolve(st);
        if (o.type === 'arrive') { const keep = o.info.items.filter(x => x.profit < 0 && x.cost > 0).map(x => x.i); for (const od of S.orders) { let n = 0; S.slots.forEach((s, i) => { if (s.id === od.good && n < od.n && !keep.includes(i)) { keep.push(i); n++; } }); }
          for (const gl of C.mainGoals()) if (gl.deliver && !gl.done) S.slots.forEach((s, i) => { if (s.id === gl.deliver.good && !keep.includes(i)) keep.push(i); });
          if (C.mainGoals().some(gl => !gl.done && gl.text.includes('홍려관')) && S.at === 'hakata') S.slots.forEach((s, i) => { if (!keep.includes(i)) keep.push(i); });
          C.sellAll(keep); } } }
  }
  return { cap, diff, ended: S.ended, ending: S.ending, act: S.main.act, maxAct: st.maxAct, quotaN: S.quotaN, t: Math.round(S.t), gold: Math.round(S.gold), fame: Math.round(S.fame), tier: S.tier, flags: Object.keys(S.main.flags).join(','), q: st.quotaLog.join(''), bt: st.bt, assist: st.assist, epilogue: S.ending ? C.endingEpilogue(S.ending).length : 0, finalSeen: st.finalSeen };
}
/* 계획: 궁복은 역사의 길·바다의 길·왕좌·바람 모두 닿는지, 아라·도모는 두 갈래 */
const PLANS = {
  gungbok: [{ name: '역사의 길(술상·범이 치움)', pickMain: ['김우징을 받아들인다'], pickScene: ['옛 동무다. 칼은 치워라', '네가 뱃머리를'], final: 0 }, { name: '바다의 길(범이 문 앞)', pickMain: ['김우징을 받아들인다'], pickScene: ['네가 문 앞에', '네가 뱃머리를'], final: 0 },
    { name: '바다의 길(문을 닫는다)', pickMain: ['정중히 돌려보낸다'], pickScene: ['네가 뱃머리를'], final: 1 }, { name: '왕좌의 바다', pickMain: ['김우징을 받아들인다'], pickScene: ['네가 뱃머리를'], final: 2 }, { name: '바람 따라', pickMain: ['정중히 돌려보낸다'], pickScene: ['네가 뱃머리를'], final: 3 }],
  ara: [{ name: '바다의 신라방', pickMain: ['유민을 받아들인다'], pickScene: ['아이들과'], final: 0 }, { name: '홀로 남은 객주', pickMain: ['문을 닫는다'], final: 0 }, { name: '당의 거상', pickMain: ['유민을 받아들인다'], final: 1 }],
  tomo: [{ name: '바다 건너 다리', pickMain: ['이충을 돕는다'], pickScene: ['내 이름으로'], final: 0 }, { name: '그림자 거상', pickMain: ['몰수품을'], final: 0 }, { name: '남쪽 섬', pickMain: ['이충을 돕는다'], final: 1 }]
};
const TOT = { runs: 0, end: 0 }; const byEnd = {};
for (const cap of CAPS) { for (const diff of DIFFS) { const R = []; for (let i = 0; i < N; i++) { const plan = PLANS[cap][i % PLANS[cap].length]; const r = play(cap, diff, plan); r.plan = plan.name; R.push(r); }
  const ok = R.filter(r => r.ended === 'ending').length; TOT.runs += N; TOT.end += ok;
  console.log(`\n══ ${cap} · ${C.DIFFS[diff].name}${ASSIST ? ' (assist)' : ''} — 결말 ${ok}/${N}`);
  for (const r of R) { if (r.ending) byEnd[r.ending] = (byEnd[r.ending] || 0) + 1; console.log(`  ${r.plan.padEnd(16)} ${r.ended === 'ending' ? '◎ ' + r.ending : '✗ ' + r.ended + ' (第' + C.NUM[Math.min(r.act, 4)] + '幕)'}  상납 ${r.q} · ${r.t}일 · 명성 ${r.fame} · 배 ${r.tier} · 해전 ${JSON.stringify(r.bt)}${r.assist ? ' · 도움 ' + r.assist : ''}${r.epilogue ? ' · 에필로그 ' + r.epilogue + '줄' : ''}`); } } }
console.log(`\n결말 도달 ${TOT.end}/${TOT.runs} (${Math.round(TOT.end / TOT.runs * 100)}%)`, byEnd);
