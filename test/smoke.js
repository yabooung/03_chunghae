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
// 6. 한 파일 빌드에 넣는 글꼴이 게임 글자를 모두 덮는다 (글을 고치면 python tools/fonts.py)
{ const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
  const have = new Set([...fs.readFileSync(path.join(root, 'assets/fonts/charset.txt'), 'utf8')]), SYS = new Set([...'≈═✓']);
  const used = new Set([...['core.js', 'art/scenes.js', 'ui.js', 'page.html'].map(f => fs.readFileSync(path.join(root, 'src', f), 'utf8')).join('')]);
  const miss = [...used].filter(c => c.codePointAt(0) > 0x7f && !have.has(c) && !SYS.has(c));
  ok(!miss.length, `글꼴 글자표 ${have.size}자${miss.length ? ` — 빠진 글자 ${miss.join('')} (python tools/fonts.py)` : ''}`); }

process.exit(fail ? 1 : 0);
