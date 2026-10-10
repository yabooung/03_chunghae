// 빠른 점검: 규칙 엔진이 깨지지 않았는지 (CI에서 매번 돈다)
const C = require('../src/core.js');
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.error('✗', m); } else console.log('✓', m); };

// 1. 모든 항구 쌍과 발견지에 물길이 있다
const ids = C.PORT_IDS; let bad = 0;
for (const a of ids) for (const b of ids) if (a < b && !C.findPath(C.PORTS[a].x, C.PORTS[a].y, C.PORTS[b].x, C.PORTS[b].y)) bad++;
ok(bad === 0, `항구 ${ids.length}곳 사이 물길 (끊긴 쌍 ${bad})`);
ok(C.FINDS.every(f => C.findPath(C.PORTS.cheonghae.x, C.PORTS.cheonghae.y, f.x, f.y)), `발견지 ${C.FINDS.length}곳 도달`);

// 2. 선장마다 새 게임 + 첫 이야기
for (const cap of Object.keys(C.CAPTAINS)) { const S = C.newGame(cap); const st = C.nextStory(); ok(st && st.title.startsWith('第'), `${cap}: 첫 막 「${st && st.title}」`); }

// 3. 봇이 한동안 굴러도 예외 없이 진행된다
function bot(cap, steps) { const S = C.newGame(cap); const drain = () => { let st, g = 0; while ((st = C.nextStory()) && g++ < 20) st.opts[0].apply(); };
  for (let i = 0; i < steps && !S.ended; i++) {
    if (S.draft) C.takeBoon(S.draft[0]);
    if (S.battle) { let g = 0; while (S.battle && !S.battle.over && g++ < 60) C.battleAct(S.battle.dist === 'near' ? 'board' : 'shoot'); C.battleClose(); }
    if (S.dive) { while (!S.dive.over) C.diveAct(S.dive.depth < 2 ? 'down' : 'up'); C.diveClose(); }
    if (S.mode === 'port') { C.portTick(); drain(); if (S.ended) break; const k = S.at; C.tickMarket(k); const id = S.markets[k].stock[0]; while (C.freeSlots() && C.buy(id).ok); const to = pick(ids.filter(x => x !== k && S.known[x] && !C.isClosed(x))); const p = C.plan(to); if (p && !p.closedPort) C.depart(p); }
    else if (S.mode === 'sea') { const p = C.plan(pick(ids.filter(x => S.known[x] && !C.isClosed(x)))); if (p && !p.closedPort) C.depart(p); }
    else { const out = C.update(.5); if (S.ev) C.choose(0); for (const o of out) if (o.type === 'arrive') C.sellAll(); } }
  return S; }
const pick = a => a[Math.floor(Math.random() * a.length)];
for (const cap of Object.keys(C.CAPTAINS)) { try { const S = bot(cap, 600); ok(S.t > 30, `${cap}: 봇 ${Math.round(S.t)}일 진행 · 상납 ${S.quotaN}번 · 끝 ${S.ended || '—'}`); } catch (e) { ok(false, `${cap}: 예외 ${e.stack}`); } }

// 4. 결말 데이터가 모두 연결돼 있다
const endIds = new Set(Object.keys(C.ENDINGS)); ok(endIds.size >= 10, `결말 ${endIds.size}개`);
process.exit(fail ? 1 : 0);
