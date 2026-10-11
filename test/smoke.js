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
function bot(cap, steps, diff) { return botRun(C.newGame(cap, diff), steps); }
function botRun(S, steps) { const drain = () => { let st, g = 0; while ((st = C.nextStory()) && g++ < 20) st.opts[0].apply(); };
  for (let i = 0; i < steps && !S.ended; i++) {
    if (S.draft) C.takeBoon(S.draft[0]);
    if (S.battle) { let g = 0; while (S.battle && !S.battle.over && g++ < 60) C.battleAct(S.battle.dist === 'near' ? 'board' : 'shoot'); C.battleClose(); }
    if (S.dive) { while (!S.dive.over) C.diveAct(S.dive.depth < 2 ? 'down' : 'up'); C.diveClose(); }
    if (S.mode === 'port') { C.portTick(); drain(); if (S.ended) break; const k = S.at; C.tickMarket(k); const id = S.markets[k].stock[0]; while (C.freeSlots() && C.buy(id).ok); const to = pick(ids.filter(x => x !== k && S.known[x] && !C.isClosed(x))); const p = C.plan(to); if (p && !p.closedPort) C.depart(p); }
    else if (S.mode === 'sea') { const p = C.plan(pick(ids.filter(x => S.known[x] && !C.isClosed(x)))); if (p && !p.closedPort) C.depart(p); }
    else { const out = C.update(.5); if (S.ev) C.choose(0); for (const o of out) if (o.type === 'arrive') C.sellAll(); } }
  return S; }
const pick = a => a[Math.floor(Math.random() * a.length)];
Object.keys(C.CAPTAINS).forEach((cap, i) => { const diff = Object.keys(C.DIFFS)[i % 3]; try { const S = bot(cap, 600, diff); ok(S.t > 30, `${cap}·${C.DIFFS[diff].name}: 봇 ${Math.round(S.t)}일 진행 · 상납 ${S.quotaN}번 · 끝 ${S.ended || '—'}`); } catch (e) { ok(false, `${cap}: 예외 ${e.stack}`); } });

// 4. 난이도: 표가 있고, 새 판에 들어가고, 저장했다 불러도 남는다. 옛 저장(난이도 없음)은 바람으로 읽는다
{ const D = C.DIFFS; ok(['baram', 'pungrang', 'taepung'].every(k => D[k]) && C.newGame('gungbok').diff === C.DIFF_NEW, `난이도 ${Object.values(D).map(d => d.name).join('·')} · 기본 ${D[C.DIFF_NEW].name}`);
  const q = Object.keys(D).map(k => { C.newGame('gungbok', k); return C.quotaFor(4); }); ok(q[0] < q[1] && q[1] < q[2], `둘째 해 첫 상납 ${q.join(' < ')}`);
  const S = bot('ara', 200, 'taepung'), snap = { t: S.t, gold: S.gold, quotaN: S.quotaN, slots: S.slots.length, quota: S.ended ? 0 : C.quotaNow() };
  const txt = C.saveData(); C.newGame('gungbok', 'baram'); const L = C.loadData(txt);
  ok(L && L.diff === 'taepung' && L.cap === 'ara' && L.t === snap.t && L.gold === snap.gold && L.quotaN === snap.quotaN && L.slots.length === snap.slots && (S.ended || C.quotaNow() === snap.quota) && !L.battle && !L.dive,
    `저장→불러오기 그대로 (태풍 · ${Math.round(snap.t)}일 · ${Math.round(snap.gold)}냥 · 상납 ${snap.quotaN}번)`);
  if (!L.ended) { try { botRun(L, 150); ok(true, `불러온 판을 이어서 ${Math.round(L.t)}일까지 진행`); } catch (e) { ok(false, `불러온 판 예외 ${e.stack}`); } }
  const old = JSON.parse(txt); delete old.diff; const O = C.loadData(JSON.stringify(old)); ok(O && O.diff === 'baram', '난이도 없는 옛 저장 → 바람');
  ok(C.loadData('{"v":5}') === null && C.loadData('깨진') === null, '다른 판형·깨진 저장은 거절'); }

// 5. 결말 데이터가 모두 연결돼 있다
const endIds = new Set(Object.keys(C.ENDINGS)); ok(endIds.size >= 10, `결말 ${endIds.size}개`);
// 7. 사전: 항목 형식 · 관련 항목 · 여는 조건 · 게임 속 모든 항구·물건·두목·선원·인물이 항목에 닿는다 · 봇 판에서 열린다 · 저장 왕복
{ const X = require('../src/codex.js'), fs = require('fs'), path = require('path'), vm = require('vm');
  const E = X.ENTRIES, cats = new Set(X.CATS.map(c => c.id)), bad = [];
  const sentences = t => (t.match(/[다요음함까][.」"]|[.!?](\s|$)/g) || []).length;
  for (const e of E) { const why = [];
    if (!/^[a-z0-9]+$/.test(e.id)) why.push('id'); if (!cats.has(e.cat)) why.push('cat'); if (!e.title || !e.sum || e.sum.length > 80) why.push('title/sum');
    if (!Array.isArray(e.hist) || !e.hist.length) why.push('hist'); else { const n = sentences(e.hist.join(' ')); if (n < 3 || n > 9) why.push(`hist ${n}문장`); }
    if (!e.game) why.push('game'); if (e.fic && !/^게임이 지어낸/.test(e.game)) why.push('fic 표시');
    if (!Array.isArray(e.src) || e.src.length < 1) why.push('src'); if (!Array.isArray(e.terms) || e.terms.some(t => t.length < 2)) why.push('terms');
    if (!Array.isArray(e.on) || !e.on.length || !e.art) why.push('on/art');
    if (why.length) bad.push(`${e.id}(${why.join(',')})`); }
  ok(!bad.length && new Set(E.map(e => e.id)).size === E.length, `사전 ${E.length}항목 형식 (${X.CATS.map(c => `${c.name} ${E.filter(e => e.cat === c.id).length}`).join(' · ')})${bad.length ? ' — ' + bad.join(' ') : ''}`);
  const dead = E.flatMap(e => e.rel.filter(r => !X.BY[r] || r === e.id).map(r => `${e.id}→${r}`)); ok(!dead.length, `관련 항목 링크 ${E.reduce((a, e) => a + e.rel.length, 0)}개가 모두 이어진다${dead.length ? ' — 끊김 ' + dead.join(' ') : ''}`);
  const EVIDS = new Set(['rival', 'pirate', 'black']), srcEv = fs.readFileSync(path.join(__dirname, '../src/core.js'), 'utf8'); for (const m of srcEv.matchAll(/\{ id: '(\w+)', w: \(\) =>/g)) EVIDS.add(m[1]);
  const valid = t => { const [k, a, b] = t.split(':'); switch (k) {
    case 'start': case 'voyage': case 'rival': return !a; case 'cap': case 'capopen': return !!C.CAPTAINS[a]; case 'port': return !!C.PORTS[a]; case 'good': return !!C.G[a];
    case 'find': return C.FINDS.some(f => f.id === a); case 'mate': return !!C.MBY[a]; case 'crew': case 'ask': return C.CREW.some(c => c.k === a); case 'boss': return C.BOSSES.some(x => x.id === a);
    case 'quest': return !!C.QBY[a]; case 'act': return !!C.ARCS[a] && +b >= 0 && +b < C.ARCS[a].acts.length; case 'flag': return ['woojing', 'refused', 'refuge', 'shut', 'help', 'buy'].includes(a);
    case 'relic': return C.RELICS.some(r => r.id === a); case 'news': return C.NEWS.some(n => n.id === a); case 'ev': return EVIDS.has(a); case 'story': return ['inspector', 'main', 'port', 'quest', 'helm', 'deck', 'tongue'].includes(a);
    case 'battle': return ['pirate', 'black', 'slaver', 'boss'].includes(a); case 'ending': return !!C.ENDINGS[a]; case 'ship': return +a >= 1 && +a < C.SHIPS.length; } return false; };
  const badOn = E.flatMap(e => e.on.filter(t => !valid(t)).map(t => `${e.id}:${t}`)); ok(!badOn.length, `여는 조건 ${E.reduce((a, e) => a + e.on.length, 0)}개가 모두 게임에 있는 것을 가리킨다${badOn.length ? ' — ' + badOn.join(' ') : ''}`);
  const hints = E.map(e => X.hint(e)); ok(hints.every(h => typeof h === 'string' && h.length > 3), '잠긴 항목마다 귀띔이 있다');
  const opens = t => E.some(e => e.on.includes(t)), miss = [];
  for (const k of C.PORT_IDS) if (!opens('port:' + k) || !X.BY[X.portEntry(k)]) miss.push('항구 ' + k);
  for (const g of C.GOODS) if (!opens('good:' + g.id) || !X.BY[X.goodEntry(g.id)]) miss.push('물건 ' + g.id);
  for (const b of C.BOSSES) if (!opens('boss:' + b.id) || !X.BY[X.WHO[b.id]]) miss.push('두목 ' + b.id);
  for (const m of C.MATES) if (!opens('mate:' + m.id) || !X.BY[X.WHO[m.id]]) miss.push('뱃사람 ' + m.id);
  for (const c of C.CREW) if (!opens('crew:' + c.k) || !X.BY[X.WHO[c.k]]) miss.push('선원 ' + c.k);
  for (const k of Object.keys(C.CAPTAINS)) if (!X.BY[X.WHO[k]]) miss.push('선장 ' + k);
  const ctx = {}; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/art/portraits.js'), 'utf8') + ';this.ids = PORTRAIT.ids;', ctx);
  for (const id of ctx.ids) if (!X.BY[X.WHO[id]]) miss.push('인물 ' + id);
  for (const q of C.QUESTS) if (!opens('quest:' + q.id) && !E.some(e => e.on.some(t => t === 'port:' + q.giver))) miss.push('이야기 ' + q.id);
  for (const [cap, arc] of Object.entries(C.ARCS)) arc.acts.forEach((a, i) => { if (!opens(`act:${cap}:${i}`) && i > 0) miss.push(`막 ${cap}${i}`); });
  ok(!miss.length, `게임 속 항구 ${C.PORT_IDS.length}·물건 ${C.GOODS.length}·두목 ${C.BOSSES.length}·뱃사람 ${C.MATES.length}·선원 ${C.CREW.length}·초상 ${ctx.ids.length}명이 모두 사전에 닿는다${miss.length ? ' — 빠짐 ' + miss.join(', ') : ''}`);
  // 봇 판: 항해 출력도 사전에 먹인다
  const st = X.blank(), base = X.check(X.blank(), null).length, S = C.newGame('gungbok', 'baram'), up = C.update;
  try { C.update = dt => { const o = up(dt); X.feedOut(st, o); return o; }; botRun(S, 500); } finally { C.update = up; }
  X.check(st, S); const got = Object.keys(st.u), kinds = ['person', 'place', 'good'].filter(c => E.some(e => e.cat === c && st.u[e.id]));
  ok(got.length > base + 10 && kinds.length === 3 && Object.keys(st.seen).some(t => t.startsWith('ev:')), `봇 판에서 사전이 열린다 — 처음 ${base}개 → ${got.length}개 (항해 사건 ${Object.keys(st.seen).filter(t => t.startsWith('ev:')).length}종)`);
  // 저장 왕복: 판을 저장했다 불러도 같은 항목이 열리고, 메타에 남긴 사전도 그대로다. 옛 메타·깨진 값은 빈 사전으로
  const before = [...X.scan(S)].sort().join(), txt = C.saveData(); C.newGame('ara'); const L = C.loadData(txt), after = [...X.scan(L)].sort().join();
  const st2 = X.norm(JSON.parse(JSON.stringify(st))), again = X.check(st2, L);
  ok(before === after && Object.keys(st2.u).length === got.length && !again.length && JSON.stringify(X.norm(undefined)) === JSON.stringify(X.blank()) && !Object.keys(X.norm({ u: { 없는항목: 1 } }).u).length,
    `저장→불러오기·메타 왕복에도 사전 ${got.length}항목 그대로 · 옛 메타는 빈 사전`);
  const one = E.find(e => st.u[e.id] && e.terms.length); ok(one && X.search(st, one.terms[0].slice(0, 2)).includes(one) && !X.search(st, '없는낱말qq').length, `찾기(한글 부분 일치) — 「${one && one.terms[0].slice(0, 2)}」`);
  const T = X.terms(st); ok(T.every(([t], i) => i === 0 || T[i - 1][0].length >= t.length), `글 속 낱말 ${T.length}개 (긴 것부터)`); }
// 8. 의뢰: 항구마다 "여기서 나는 물건 → 그것을 만들지 않는 다른 항구" · 맡긴 항구 밖에서 산 상자는 안 쳐준다 · 할인은 의뢰가 열린 동안 상자 수만큼 · 종류 글이 선장 셋 모두에게 풀린다
{ const K = C.ORDER_KINDS; let badOff = [], kinds = {};
  for (const cap of Object.keys(C.CAPTAINS)) { const S = C.newGame(cap); for (const k of C.PORT_IDS) S.known[k] = true;
    for (const k of C.PORT_IDS) { C.makeOffer(k, true); const o = S.offers[k]; if (!o || o.none) { badOff.push(`${k}:없음`); continue; } kinds[o.kind] = (kinds[o.kind] || 0) + 1;
      if (!C.PORTS[k].prod.includes(o.good) || !S.markets[k].stock.includes(o.good)) badOff.push(`${k}:${o.good} 여기서 안 난다`); if (o.to === k || C.PORTS[o.to].prod.includes(o.good)) badOff.push(`${k}→${o.to}:${o.good} 행선지가 만든다`);
      if (!K[o.kind] || !K[o.kind].ports.includes(k)) badOff.push(`${k}:종류 ${o.kind}`); if (o.n < 1 || o.days < 8 || o.reward < 100) badOff.push(`${k}:수치`); } }
  ok(!badOff.length && Object.keys(kinds).length === 6, `항구 ${C.PORT_IDS.length}곳 의뢰 — 여기서 나는 물건을 만들지 않는 항구로 (${Object.entries(kinds).map(([k, n]) => `${K[k].name} ${n}`).join(' · ')})${badOff.length ? ' — ' + badOff.join(', ') : ''}`);
  const badTxt = []; for (const cap of Object.keys(C.CAPTAINS)) { C.newGame(cap); for (const kind of Object.keys(K)) for (let v = 0; v < 3; v++) { const from = K[kind].ports[0] || 'cheonghae', good = K[kind].goods[0] || 'ginseng', to = C.PORT_IDS.find(x => x !== from && !C.PORTS[x].prod.includes(good));
    const T = C.orderText({ kind, v, from, to, good, n: 2, days: 20, reward: 5000 }); for (const f of ['eyebrow', 'intro', 'line', 'kind', 'ch']) if (typeof T[f] !== 'string' || !T[f] || /undefined|NaN|\[object/.test(T[f])) badTxt.push(`${cap}/${kind}/${v}/${f}`); if (typeof T.twist !== 'string' || /undefined|NaN/.test(T.twist)) badTxt.push(`${cap}/${kind}/${v}/twist`); if (!K[kind].desc) badTxt.push(kind + '/desc'); } }
  ok(!badTxt.length, `의뢰 종류 ${Object.keys(K).length}가지 × 소개 3 × 선장 3 글이 모두 풀린다${badTxt.length ? ' — ' + badTxt.join(' ') : ''}`);
  // 맡긴 항구에서 산 상자만 쳐준다 · 할인은 열린 동안 상자 수만큼
  const S = C.newGame('gungbok'); for (const k of C.PORT_IDS) S.known[k] = true; S.gold = 200000; C.makeOffer('cheonghae', true); const o = S.offers.cheonghae;
  const p0 = C.buyPrice('cheonghae', o.good); const r = C.acceptOffer('cheonghae', false); const p1 = C.buyPrice('cheonghae', o.good); // 맡은 뒤 할인가
  ok(r && r.order && S.orders.length === 1 && Math.abs(p1 - Math.round(p0 * C.ORDER_DISC)) <= 1, `맡으면 그 물건 값 ${p0} → ${p1} (×${C.ORDER_DISC})`);
  S.slots = []; for (let i = 0; i < o.n; i++) S.slots.push({ id: o.good, cost: 1000, from: 'jeoksan' }); // 다른 데서 산 상자
  const g0 = S.gold, d0 = C.deliverOrders(o.to);
  ok(d0 && d0.length === 0 && S.orders.length === 1 && S.gold === g0, '다른 항구에서 산 상자는 의뢰로 안 쳐준다');
  S.slots = []; for (let i = 0; i < o.n; i++) { const b = C.buy(o.good); if (!b.ok) break; } const bought = S.orders[0].bought, pAfter = C.buyPrice('cheonghae', o.good);
  ok(bought === o.n && S.slots.length === o.n && S.slots.every(s => s.from === 'cheonghae') && pAfter > p1 && Math.abs(pAfter - Math.round(p1 / C.ORDER_DISC * Math.pow(1 + C.LOT / 300, o.n))) <= 3, `상자 ${o.n}개를 사면 할인이 끝난다 (${p1} → ${pAfter}) · 산 상자 ${bought}/${o.n}`);
  const d1 = C.deliverOrders(o.to);
  ok(d1.length === 1 && d1[0].paid >= o.reward * .85 && S.orders.length === 0 && S.slots.length === 0 && S.gold > g0 - o.n * 3000, `맡긴 항구에서 산 상자를 ${C.PORTS[o.to].name}에 넘기면 보수 ${d1[0] && d1[0].paid}냥 · 명성 +${d1[0] && d1[0].fame}`);
  ok(C.buyPrice('cheonghae', o.good) === pAfter && !C.commission('cheonghae', o.good), '의뢰가 끝나면 할인도 끝난다');
  // 맡고 싣는다: 돈·자리가 닿으면 맡으면서 상자까지 산다
  C.makeOffer('cheonghae', true); const o2 = S.offers.cheonghae, q = C.orderQuote(o2), r2 = C.acceptOffer('cheonghae', true);
  ok(q.can && r2 && r2.bought === o2.n && r2.cost === q.cost && S.slots.filter(s => s.id === o2.good && s.from === 'cheonghae').length === o2.n, `맡고 싣는다 — ${o2.n}상자 ${q.cost}냥 (미리 센 값과 같다)`);
  const txt = C.saveData(); C.newGame('ara'); const L = C.loadData(txt); ok(L && L.orders.length === 1 && L.orders[0].kind === o2.kind && L.orders[0].bought === o2.n && L.v === 8, '의뢰(종류·산 상자 수)가 저장을 건너 그대로다 (v8)'); }
// 9. 이야기 퀘스트: 항구마다 하나, 목표·보상이 게임에 있는 것을 가리키고, 납품 물건은 그 항구에서 나지 않고, when이 선장마다 풀리고, 단계 글이 추적기에 들어가고(90자 미만),
//    결말 에필로그의 깃발이 어디선가 세워지고, 한꺼번에 맡는 이야기는 QUEST_OPEN_MAX까지, 사슬 이야기는 앞 이야기를 끝내면 열린다
{ const fs = require('fs'), path = require('path'), Q = C.QUESTS, bad = [], givers = {};
  const src = fs.readFileSync(path.join(__dirname, '../src/core.js'), 'utf8');
  const flagsSet = new Set([...src.matchAll(/flag: '(\w+)'/g)].map(m => m[1]).concat(['cheonghaeDock', 'naniwa', 'usan', 'kuroshio', 'pirateWin', 'quotaUp', 'allyBonus', 'extraMate', 'cheonghaeTrust', 'official', 'wangEnemy', 'debt']));
  for (const q of Q) { const why = [];
    if (!/^[a-z0-9]+$/.test(q.id) || !q.name || !q.ch || !q.intro) why.push('형식'); if (!C.PORTS[q.giver]) why.push('항구'); givers[q.giver] = (givers[q.giver] || 0) + 1;
    if (!Array.isArray(q.steps) || q.steps.length < 2 || q.steps.length > 4) why.push('단계 수');
    for (const [i, s] of (q.steps || []).entries()) { const g = s.goal || {}, R = s.reward || {};
      if (typeof s.text !== 'string' || s.text.length >= 90) why.push(`${i + 1}단계 글 ${s.text && s.text.length}자`); if (!s.done) why.push(`${i + 1}단계 done`);
      if (g.type === 'port' && !C.PORTS[g.k]) why.push(`${i + 1} port`); if (g.type === 'find' && !C.FINDS.some(f => f.id === g.id)) why.push(`${i + 1} find`);
      if (g.type === 'fight' && !C.BOSSES.some(b => b.id === g.boss)) why.push(`${i + 1} fight`); if (g.type === 'deal' && !(C.SPECIALS[g.k] && C.SPECIALS[g.k].kind === 'deal')) why.push(`${i + 1} deal`);
      if (g.type === 'deliver') { if (!C.PORTS[g.k] || !C.G[g.good] || !(g.n > 0)) why.push(`${i + 1} deliver`); else if (C.PORTS[g.k].prod.includes(g.good)) why.push(`${i + 1} ${g.good}는 ${g.k}에서 난다`); }
      if (!['port', 'find', 'wins', 'fight', 'deliver', 'dives', 'deal'].includes(g.type)) why.push(`${i + 1} goal ${g.type}`);
      if (R.deal && !(C.SPECIALS[R.deal] && C.SPECIALS[R.deal].kind === 'deal')) why.push(`${i + 1} reward.deal`); if (R.boon && !C.BOONS.some(b => b.id === R.boon)) why.push(`${i + 1} reward.boon`);
      if (R.relic && !C.RELICS.some(r => r.id === R.relic)) why.push(`${i + 1} reward.relic`); if (R.crate && !C.G[R.crate]) why.push(`${i + 1} reward.crate`); if (R.reveal && !(C.PORTS[R.reveal] && C.PORTS[R.reveal].hidden)) why.push(`${i + 1} reward.reveal`); }
    if (q.when) for (const cap of Object.keys(C.CAPTAINS)) { try { C.newGame(cap); if (typeof q.when() !== 'boolean') why.push(`when(${cap}) 불리언 아님`); } catch (e) { why.push(`when(${cap}) 예외`); } }
    if (why.length) bad.push(`${q.id}(${why.join(',')})`); }
  const dup = Object.entries(givers).filter(([, n]) => n > 1).map(([k]) => k); if (dup.length) bad.push('한 항구에 둘: ' + dup.join(','));
  if (new Set(Q.map(q => q.id)).size !== Q.length) bad.push('id 겹침');
  const nations = new Set(Q.map(q => C.PORTS[q.giver].nation)); for (const n of ['신라', '탐라', '남도', '당', '왜', '발해']) if (!nations.has(n)) bad.push('없는 나라 ' + n);
  ok(!bad.length, `이야기 ${Q.length}줄기 — 항구마다 하나, 목표·보상·납품·when·글 길이${bad.length ? ' — ' + bad.join(' ') : ''}`);
  const noFlag = []; for (const [id, E] of Object.entries(C.ENDINGS)) for (const [c] of E.epilogue || []) if (typeof c === 'string' && !flagsSet.has(c)) noFlag.push(`${id}:${c}`);
  ok(!noFlag.length, `결말 에필로그의 깃발 ${Object.values(C.ENDINGS).reduce((a, E) => a + E.epilogue.filter(([c]) => typeof c === 'string').length, 0)}개가 모두 어디선가 세워진다${noFlag.length ? ' — ' + noFlag.join(' ') : ''}`);
  const qFlags = Q.map(q => q.steps.map(s => s.reward && s.reward.flag).filter(Boolean)); const used = new Set(Object.values(C.ENDINGS).flatMap(E => E.epilogue.map(([c]) => c).filter(c => typeof c === 'string')));
  const noEp = Q.filter((q, i) => !qFlags[i].length || !qFlags[i].some(f => used.has(f))).map(q => q.id).filter(id => !['chart', 'monk', 'navy', 'balhae', 'south', 'books', 'whale', 'brothers', 'widow', 'letter', 'map2'].includes(id));
  ok(!noEp.length, `지역 이야기마다 깃발이 결말 에필로그에 닿는다${noEp.length ? ' — ' + noEp.join(',') : ''}`);
  // 한꺼번에 셋까지: 넷째는 꺼내지 않고, 사슬 이야기는 앞 이야기를 끝내면 when이 참이 된다
  { const S = C.newGame('gungbok'); S.pending = []; for (const id of ['shipwright', 'tatara', 'qiantang']) C.startQuest(id); C.offerQuests('yangzhou'); const held = S.pending.some(p => p.startsWith('quest:'));
    S.quests.shipwright.done = true; C.offerQuests('yangzhou'); const again = S.pending.includes('quest:daesik');
    const w0 = C.QBY.wangmungu.when(); S.quests.yeomju = { step: 3, done: true }; const w1 = C.QBY.wangmungu.when(); S.quests.wangmungu = { step: 3, done: true }; const w2 = C.QBY.court.when();
    ok(C.QUEST_OPEN_MAX === 3 && !held && again && !w0 && w1 && w2, `이야기는 ${C.QUEST_OPEN_MAX}개까지(넷째 ${held ? '꺼냄' : '안 꺼냄'}, 하나 끝내면 ${again ? '꺼냄' : '안 꺼냄'}) · 사슬 염주→쓰루가→나니와 ${!w0 && w1 && w2 ? '순서대로' : '어긋남'}`); }
  // 새 목표·보상이 실제로 돈다: 잠수 목표(dives) · 특별 거래 목표(deal) · 선체·경계·특권·깃발·숨은 항구 보상
  { const S = C.newGame('tomo', 'baram'); S.pending = []; S.gold = 60000; C.startQuest('amami'); S.stats.dives = 2; C.questEval(); const d1 = S.quests.amami.step === 1;
    S.mode = 'port'; S.at = 'yangzhou'; C.startQuest('daesik'); S.slots = [{ id: 'silk', cost: 0, from: 'jeoksan' }, { id: 'silk', cost: 0, from: 'deungju' }]; C.questEval(); const s1 = S.quests.daesik.step === 1 && !S.slots.length;
    C.useSpecial('yangzhou'); C.useSpecial('yangzhou'); const s2 = S.quests.daesik.step === 2;
    const h0 = S.hullMax, t0 = S.threat = 40; C.startQuest('shipwright'); S.quests.shipwright.step = 2; S.quests.shipwright.tStep = S.t - 30; S.at = 'hoejin'; C.questEval();
    const hull = S.hullMax === h0 + 25 && S.flags.hoejinShip === 1 && S.quests.shipwright.done;
    S.known.ryukyu = false; C.startQuest('ryukyu'); S.quests.amami.step = 2; S.at = 'amami'; C.questEval(); const rev = S.spotted.ryukyu === 1 && S.flags.amamiElder === 1;
    S.at = 'naniwa'; S.quests.yeomju = { step: 3, done: true }; S.quests.wangmungu = { step: 3, done: true }; C.startQuest('court'); S.quests.court.step = 2; C.questEval(); const ct = S.boons.court === 1 && S.threat === t0 - 15 && S.flags.courtAnswer === 1;
    ok(d1 && s1 && s2 && hull && rev && ct, `새 목표·보상 — 잠수 ${d1 ? '○' : '×'} 납품 ${s1 ? '○' : '×'} 특별 거래 ${s2 ? '○' : '×'} 선체·깃발 ${hull ? '○' : '×'} 숨은 항구 ${rev ? '○' : '×'} 특권·경계 ${ct ? '○' : '×'}`); } }

// 6. 한 파일 빌드에 넣는 글꼴이 게임 글자를 모두 덮는다 (글을 고치면 python tools/fonts.py)
{ const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
  const have = new Set([...fs.readFileSync(path.join(root, 'assets/fonts/charset.txt'), 'utf8')]), SYS = new Set([...'≈═✓']);
  const used = new Set([...['core.js', 'codex.js', 'art/scenes.js', 'ui.js', 'page.html'].map(f => fs.readFileSync(path.join(root, 'src', f), 'utf8')).join('')]);
  const miss = [...used].filter(c => c.codePointAt(0) > 0x7f && !have.has(c) && !SYS.has(c));
  ok(!miss.length, `글꼴 글자표 ${have.size}자${miss.length ? ` — 빠진 글자 ${miss.join('')} (python tools/fonts.py)` : ''}`); }

process.exit(fail ? 1 : 0);
