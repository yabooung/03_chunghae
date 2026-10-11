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

// 6. 한 파일 빌드에 넣는 글꼴이 게임 글자를 모두 덮는다 (글을 고치면 python tools/fonts.py)
{ const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
  const have = new Set([...fs.readFileSync(path.join(root, 'assets/fonts/charset.txt'), 'utf8')]), SYS = new Set([...'≈═✓']);
  const used = new Set([...['core.js', 'codex.js', 'art/scenes.js', 'ui.js', 'page.html'].map(f => fs.readFileSync(path.join(root, 'src', f), 'utf8')).join('')]);
  const miss = [...used].filter(c => c.codePointAt(0) > 0x7f && !have.has(c) && !SYS.has(c));
  ok(!miss.length, `글꼴 글자표 ${have.size}자${miss.length ? ` — 빠진 글자 ${miss.join('')} (python tools/fonts.py)` : ''}`); }

process.exit(fail ? 1 : 0);
