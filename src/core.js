/* ═══════════════════════════════════════════════════════════
   청해 — 코어 v2 (화면과 무관한 규칙 전부)
   세계: 동경 115.5°~137° · 북위 24°~43.2°. 1단위 ≈ 1km
   시간: 일(day). 한 해 = 360일, 계절 끝마다 상납.
   ═══════════════════════════════════════════════════════════ */
const CORE = (() => {
'use strict';
const LON0 = 115.5, LAT0 = 43.2, KX = 90, KY = 110;
const P = (lon, lat) => [Math.round((lon - LON0) * KX), Math.round((LAT0 - lat) * KY)];
const WORLD = { w: 1940, h: 2120 }, CELL = 20, GW = 97, GH = 106;
const VIEW = { x: 0, y: 0, w: 1940, h: 2120 };
const YEAR = 360, START_DOY = 90, LOT = 10, BASE_KMD = 100, REVEAL = 80;

const ring = a => a.map(([lon, lat]) => P(lon, lat));
const LAND = {
  main: ring([[115.5,43.2],[133.2,43.2],[132.4,42.95],[131.9,43.05],[131.3,42.65],[130.75,42.35],[130.4,42.25],[129.9,41.6],[129.7,41.0],[129.0,40.6],[128.4,40.05],[127.6,39.75],[127.45,39.2],[128.1,38.85],[128.6,38.3],[129.05,37.7],[129.4,37.05],[129.45,36.45],[129.55,36.05],[129.45,35.65],[129.3,35.35],[129.05,35.1],[128.65,35.0],[128.35,34.85],[127.85,34.75],[127.5,34.6],[127.15,34.45],[126.85,34.4],[126.5,34.35],[126.35,34.6],[126.3,34.95],[126.45,35.4],[126.5,35.95],[126.3,36.4],[126.15,36.8],[126.55,37.05],[126.65,37.45],[126.25,37.75],[125.75,37.9],[125.2,37.85],[124.8,38.05],[125.15,38.6],[125.3,39.2],[124.95,39.6],[124.35,39.95],[123.6,39.8],[122.9,39.55],[122.2,39.15],[121.6,38.85],[121.2,38.75],[121.45,39.3],[121.85,39.8],[122.15,40.4],[121.6,40.85],[120.85,40.55],[120.1,40.1],[119.5,39.75],[118.9,39.2],[118.0,39.05],[117.65,38.6],[118.0,38.1],[118.8,37.55],[119.5,37.15],[120.1,37.4],[120.7,37.75],[121.3,37.6],[121.9,37.48],[122.55,37.4],[122.45,36.95],[121.9,36.85],[121.3,36.7],[120.7,36.35],[120.35,36.0],[119.75,35.55],[119.3,35.05],[119.25,34.6],[120.0,34.25],[120.4,33.6],[120.8,32.75],[121.35,32.25],[121.85,31.75],[121.95,31.2],[121.65,30.85],[121.0,30.55],[121.5,30.25],[121.95,30.0],[122.1,29.6],[121.8,29.1],[121.55,28.5],[121.0,27.9],[120.6,27.3],[120.1,26.75],[119.75,26.2],[119.5,25.65],[119.05,25.2],[118.65,24.9],[118.2,24.55],[117.9,24.0],[115.5,24.0]]),
  jeju: ring([[126.15,33.3],[126.45,33.2],[126.9,33.3],[126.95,33.5],[126.6,33.57],[126.25,33.47]]),
  tsushima: ring([[129.2,34.1],[129.35,34.15],[129.5,34.6],[129.42,34.72],[129.28,34.55]]),
  heuksan: ring([[125.36,34.64],[125.44,34.62],[125.5,34.68],[125.42,34.73]]),
  ulleung: ring([[130.8,37.47],[130.94,37.46],[130.96,37.55],[130.84,37.57]]),
  oki: ring([[133.0,36.15],[133.35,36.12],[133.4,36.3],[133.1,36.33]]),
  goto: ring([[128.6,32.6],[128.9,32.7],[129.1,33.05],[128.85,33.1],[128.65,32.9]]),
  kyushu: ring([[129.6,33.3],[129.95,33.55],[130.35,33.62],[130.85,33.88],[131.45,33.55],[131.9,33.05],[131.7,32.4],[131.45,31.5],[130.85,31.0],[130.25,31.25],[130.2,31.95],[130.35,32.6],[130.05,32.85],[129.8,32.75],[129.6,33.05]]),
  shikoku: ring([[132.35,33.05],[132.6,33.6],[133.3,33.85],[134.2,33.95],[134.55,33.85],[134.65,33.6],[134.1,33.35],[133.6,33.2],[133.1,32.8],[132.7,32.75]]),
  honshu: ring([[130.95,34.0],[131.3,34.45],[132.0,34.9],[132.8,35.45],[133.6,35.55],[134.5,35.65],[135.3,35.75],[136.0,35.95],[136.6,36.6],[137.1,37.0],[137.1,34.55],[136.85,34.35],[136.6,34.2],[136.0,33.55],[135.75,33.45],[135.4,33.7],[135.15,34.05],[135.2,34.35],[135.45,34.62],[135.3,34.74],[135.0,34.68],[134.6,34.78],[134.0,34.68],[133.4,34.5],[132.6,34.32],[132.0,34.05],[131.4,34.02]]),
  yaku: ring([[130.43,30.27],[130.65,30.3],[130.62,30.44],[130.45,30.42]]),
  amami: ring([[129.3,28.15],[129.55,28.2],[129.7,28.45],[129.45,28.5],[129.3,28.35]]),
  kikai: ring([[129.92,28.27],[130.03,28.28],[130.04,28.36],[129.94,28.37]]),
  okinawa: ring([[127.65,26.1],[127.85,26.15],[128.25,26.65],[128.35,26.85],[128.15,26.88],[127.8,26.5],[127.65,26.3]]),
  taiwan: ring([[120.75,24.0],[121.0,24.6],[121.45,25.28],[121.9,25.12],[121.85,24.6],[121.7,24.0]])
};
const LABELS = [ // 해도에 세로쓰기로 박히는 이름 [글, 경도, 위도, 크기, 'land'|'sea']
  ['新羅', 128.0, 37.9, 50, 'land'], ['渤海', 128.6, 42.6, 40, 'land'], ['唐', 117.4, 41.2, 56, 'land'], ['唐', 117.6, 30.0, 56, 'land'],
  ['倭', 131.0, 32.9, 44, 'land'], ['黃海', 123.6, 36.4, 40, 'sea'], ['東海', 131.6, 39.2, 40, 'sea'], ['南海', 127.2, 32.9, 32, 'sea'],
  ['大洋', 128.4, 30.6, 40, 'sea'], ['南島', 131.2, 28.0, 32, 'sea'], ['渤海灣', 119.3, 39.0, 24, 'sea']
];

const GOODS = [
  { id: 'ginseng', name: '인삼', ch: '蔘', base: 180, col: '#4d7a46' },
  { id: 'silk', name: '비단', ch: '緞', base: 320, col: '#7b4a82' },
  { id: 'porcelain', name: '도자기', ch: '瓷', base: 280, col: '#33688c' },
  { id: 'spice', name: '향료', ch: '香', base: 420, col: '#9a5528' },
  { id: 'gold', name: '사금', ch: '金', base: 500, col: '#a8821f' },
  { id: 'shell', name: '야광패', ch: '貝', base: 350, col: '#2a8580' },
  { id: 'fur', name: '담비가죽', ch: '貂', base: 440, col: '#6b4a32' },
  { id: 'sulfur', name: '유황', ch: '硫', base: 160, col: '#9a9a2a' }
];
const G = Object.fromEntries(GOODS.map(g => [g.id, g]));

const PORTS_LL = {
  cheonghae: ['청해진', '淸', '신라', 126.85, 34.25, ['ginseng'], ['spice', 'porcelain'], { court: true }],
  dangeun:   ['당은포', '恩', '신라', 126.45, 37.12, ['ginseng'], ['silk', 'fur']],
  ulsan:     ['울산', '蔚', '신라', 129.5, 35.45, ['gold'], ['silk', 'spice'], { court: true }],
  tamna:     ['탐라', '耽', '탐라', 126.55, 33.62, ['shell'], ['porcelain', 'silk']],
  jeoksan:   ['적산', '赤', '당', 122.35, 36.82, ['silk'], ['ginseng', 'gold']],
  deungju:   ['등주', '登', '당', 120.78, 37.92, ['silk'], ['fur', 'ginseng']],
  yangzhou:  ['양주', '揚', '당', 121.1, 32.25, ['porcelain', 'spice'], ['ginseng', 'shell']],
  mingzhou:  ['명주', '明', '당', 122.25, 29.95, ['porcelain'], ['sulfur', 'gold']],
  hakata:    ['하카타', '博', '왜', 130.3, 33.72, ['sulfur'], ['silk', 'spice']],
  naniwa:    ['나니와', '難', '왜', 135.3, 34.5, ['gold'], ['porcelain', 'silk', 'spice'], { hidden: true }],
  quanzhou:  ['천주', '泉', '당', 118.85, 24.75, ['spice'], ['gold', 'ginseng', 'fur'], { hidden: true }],
  amami:     ['아마미', '奄', '남도', 129.25, 28.3, ['shell'], ['ginseng', 'porcelain'], { hidden: true }],
  ryukyu:    ['유구', '流', '남도', 127.55, 26.35, ['shell', 'sulfur'], ['silk', 'gold'], { hidden: true }],
  yeomju:    ['염주', '鹽', '발해', 130.95, 42.45, ['fur'], ['silk', 'porcelain'], { hidden: true }]
};
const PORTS = {}; for (const [k, v] of Object.entries(PORTS_LL)) { const [x, y] = P(v[3], v[4]); PORTS[k] = Object.assign({ name: v[0], ch: v[1], nation: v[2], x, y, prod: v[5], want: v[6] }, v[7] || {}); }
const PORT_IDS = Object.keys(PORTS);

const FINDS_LL = [
  ['heuksan', '흑산도', 125.48, 34.55, 50, 400, '곧은 소나무와 맑은 샘. 배를 손봤다.', s => { s.hull = Math.min(s.hullMax, s.hull + 25); }],
  ['ieodo', '이어도', 125.18, 32.12, 120, 0, '물속에 잠긴 바위섬. 제주 뱃사람들은 돌아오지 못한 이들이 사는 섬이라 부른다.'],
  ['usan', '우산도', 130.88, 37.38, 100, 600, '동해 한가운데 외딴섬. 늙은 곽이 뱃전에 기대어 오래 바라본다.', s => { s.flags.usan = 1; }],
  ['oki', '오키 섬', 133.2, 36.02, 70, 500, '은어를 말리는 왜인 마을. 동쪽 큰 포구 이야기를 들었다.', s => { revealCircle(PORTS.naniwa.x, PORTS.naniwa.y, 90); }],
  ['goto', '고토 열도', 128.95, 32.5, 60, 400, '당으로 가는 왜의 배들이 마지막으로 물을 채우는 섬들.'],
  ['tsushima', '대마도', 129.12, 34.35, 50, 300, '왜인 어부들이 물을 나눠준다.'],
  ['yaku', '구름 숲 섬', 130.55, 30.12, 80, 500, '천 년 묵은 삼나무가 구름을 뚫고 섰다. 남쪽으로 섬들이 이어진다.', s => { revealCircle(PORTS.amami.x, PORTS.amami.y, 70); }],
  ['yizhou', '이주(夷州)', 121.6, 25.5, 110, 700, '큰 섬의 북쪽 끝. 서쪽 바다 건너 천주의 불빛이 보인다고 한다.', s => { revealCircle(PORTS.quanzhou.x, PORTS.quanzhou.y, 90); }],
  ['shoal', '거대 어군', 124.4, 35.4, 30, 900, '바다가 끓는다. 그물 가득 건져 소금에 절여 팔았다.']
];
const FINDS = FINDS_LL.map(([id, name, lon, lat, fame, gold, text, fx]) => { const [x, y] = P(lon, lat); return { id, name, x, y, fame, gold, text, fx }; });

/* 해적 해역 */
const ZONES = [
  { id: 'west', name: '서해 섬 해적', ...(([x, y]) => ({ x, y }))(P(124.3, 35.4)), r: 125 },
  { id: 'strait', name: '대마 해협 해적', ...(([x, y]) => ({ x, y }))(P(129.35, 34.42)), r: 72 },
  { id: 'zhoushan', name: '주산 군도 해적', ...(([x, y]) => ({ x, y }))(P(122.7, 30.5)), r: 70 }
];
const HARBOR = 42; /* 항구 바로 앞은 해적이 못 들어온다 */
const inZone = (x, y) => { const z = ZONES.find(z => Math.hypot(z.x - x, z.y - y) < z.r); if (!z) return null; for (const k in PORTS) if (Math.hypot(PORTS[k].x - x, PORTS[k].y - y) < HARBOR) return null; return z; };

const SHIPS = [
  { name: '어선', slots: 3, hull: 100, spd: 1.0, price: 0 },
  { name: '중선', slots: 5, hull: 140, spd: 1.06, price: 14000 },
  { name: '대선', slots: 7, hull: 200, spd: 1.12, price: 42000 },
  { name: '누선', slots: 10, hull: 280, spd: 1.16, price: 110000 }
];

const CAPTAINS = {
  gungbok: { name: '궁복', title: '청해진의 무장', start: 'cheonghae', gold: 5000, perk: '해적과 싸우면 조금 더 잘 이긴다', unlock: null, rumors: [['jeoksan', 'ginseng'], ['hakata', 'silk']] },
  ara: { name: '아라', title: '적산 신라방의 상인', start: 'jeoksan', gold: 5000, perk: '소문이 반값이고 헛소문을 걸러 듣는다', unlock: '상납을 네 번(한 해) 해내면 열린다', rumors: [['cheonghae', 'silk'], ['yangzhou', 'ginseng']] },
  tomo: { name: '도모', title: '하카타의 밀무역상', start: 'hakata', gold: 6000, perk: '경계가 절반만 오른다. 신라 조정에는 바칠 수 없다', unlock: '상납을 여덟 번(두 해) 해내면 열린다', rumors: [['ulsan', 'spice'], ['mingzhou', 'sulfur']], knows: ['naniwa'] }
};

const CREW = [
  { k: 'helm', name: '곽', role: '도사공', appear: 20, ask: '죽기 전에 동해 한가운데 우산도를 한 번 보고 싶소.', hint: '울산 북동쪽 바다, 우산도를 찾는다', flag: 'usan', perk: '폭풍을 먼저 읽는다. 피항이 반나절로 끝난다.',
    done: '곽이 우산도 쪽으로 오래 절을 했다. 아버지가 그 바다에서 돌아오지 않았다고 한다. 그날부터 곽은 폭풍을 먼저 읽는다.' },
  { k: 'deck', name: '범이', role: '갑판장', appear: 50, ask: '해적선 한 척, 내 손으로 잡게 해주쇼. 형님 원수요.', hint: '해적과 싸워 이긴다', flag: 'pirateWin', perk: '해적전에 더 강해진다. 그리고 당신 방문 앞에서 잔다.',
    done: '해적선 갑판에서 범이가 한참을 울었다. "이제 됐소." 그날부터 범이는 당신 방문 앞에서 잔다.' },
  { k: 'tongue', name: '아사', role: '통역', appear: 95, ask: '나니와에 동생이 있어요. 십 년을 못 봤어요.', hint: '왜의 동쪽 끝, 나니와에 입항한다', flag: 'naniwa', perk: '입항할 때마다 동생의 편지로 정확한 소식을 듣는다.',
    done: '아사가 포구로 달려 나갔다. 저녁에 돌아온 눈이 붉었다. "동생이 상인 일을 해요. 앞으로 소식은 걱정 마세요."' }
];

/* 상납: 계절 끝마다 청해진 군자금. 해가 바뀔수록 오른다 */
const QUOTA_BASE = [4000, 10000, 20000, 34000];
const quotaFor = n => Math.round(QUOTA_BASE[n % 4] * Math.pow(2.6, Math.floor(n / 4)) / 100) * 100;

/* 특권 카드 */
const BOONS = [
  { id: 'hold', name: '큰 선창', ch: '艙', text: '상자 칸이 하나 는다.', max: 3 },
  { id: 'haggle', name: '흥정꾼', ch: '價', text: '모든 항구에서 팔 때 8% 더 받는다.', max: 3 },
  { id: 'bargain', name: '값 깎기', ch: '減', text: '모든 항구에서 살 때 8% 덜 낸다.', max: 3 },
  { id: 'charm', name: '순풍 부적', ch: '風', text: '역풍과 옆바람에서 덜 느려진다.', max: 2 },
  { id: 'sails', name: '새 돛', ch: '帆', text: '항해가 12% 빨라진다.', max: 2 },
  { id: 'clerk', name: '장부꾼', ch: '簿', text: '소문이 반값이고 틀리지 않는다.', max: 1 },
  { id: 'hunter', name: '해적 사냥꾼', ch: '劍', text: '해적과 싸워 이길 확률이 크게 오르고 전리품이 두 배다.', max: 1 },
  { id: 'hull', name: '튼튼한 이물', ch: '堅', text: '선체 최대치 +40, 수리비 절반.', max: 2 },
  { id: 'tang', name: '신라방 연줄', ch: '唐', text: '당 항구에서 팔 때 15% 더 받는다.', max: 1 },
  { id: 'wa', name: '왜 상인 연줄', ch: '倭', text: '왜와 남도 항구에서 팔 때 15% 더 받는다.', max: 1 },
  { id: 'court', name: '조정의 눈감음', ch: '默', text: '경계가 40% 덜 오른다.', max: 1 },
  { id: 'chart', name: '옛 해도', ch: '圖', text: '아직 못 찾은 항구 하나의 위치가 해도에 드러난다.', max: 5 },
  { id: 'letters', name: '비둘기 편지', ch: '鴿', text: '입항할 때마다 정확한 소식 하나를 공짜로 듣는다.', max: 1 },
  { id: 'relief', name: '군자금 감면', ch: '赦', text: '다음 상납금이 25% 준다.', max: 9 }
];

const RANKS = [[0, '뱃사공'], [40000, '선주'], [120000, '상단주'], [300000, '대상(大商)'], [700000, '해상왕']];
const RIVALS = [
  { id: 'wang', name: '왕씨 상단', ch: '王', col: '#8a3a2a', home: 'yangzhou', kind: 'trade', known: ['jeoksan', 'deungju', 'yangzhou', 'mingzhou', 'cheonghae', 'dangeun', 'tamna'] },
  { id: 'otomo', name: '오토모 배', ch: '大', col: '#2f4f7a', home: 'hakata', kind: 'trade', known: ['hakata', 'ulsan', 'cheonghae', 'mingzhou', 'tamna', 'jeoksan'] },
  { id: 'black', name: '흑기 해적선', ch: '黑', col: '#1e2829', kind: 'pirate' }
];

/* ─────────── 유틸 ─────────── */
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
function pip(px, py, poly) { let inside = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside; } return inside; }
const LAND_LIST = Object.values(LAND);
const BB = LAND_LIST.map(p => { const xs = p.map(q => q[0]), ys = p.map(q => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; });
const onLand = (x, y) => { if (x < 0 || y < 0 || x >= WORLD.w || y >= WORLD.h) return true; for (let i = 0; i < LAND_LIST.length; i++) { const b = BB[i]; if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue; if (pip(x, y, LAND_LIST[i])) return true; } return false; };
function angDiff(a, b) { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

/* ─────────── 격자 · 길찾기 ─────────── */
const GRID = new Uint8Array(GW * GH);
for (let cy = 0; cy < GH; cy++) for (let cx = 0; cx < GW; cx++) {
  const x = cx * CELL + CELL / 2, y = cy * CELL + CELL / 2;
  GRID[cy * GW + cx] = (onLand(x, y) || onLand(x - 7, y - 7) || onLand(x + 7, y + 7) || onLand(x + 7, y - 7) || onLand(x - 7, y + 7)) ? 1 : 0;
}
const cellOf = (x, y) => [clamp(Math.floor(x / CELL), 0, GW - 1), clamp(Math.floor(y / CELL), 0, GH - 1)];
/* 좁은 물길은 격자보다 가늘어 강제로 연다: 세토 내해 */
function carve(ll) { for (let i = 0; i < ll.length - 1; i++) { const [x1, y1] = P(...ll[i]), [x2, y2] = P(...ll[i + 1]); const L = Math.hypot(x2 - x1, y2 - y1); for (let d = 0; d <= L; d += 5) { const x = x1 + (x2 - x1) * d / L, y = y1 + (y2 - y1) * d / L; if (onLand(x, y)) continue; const [cx, cy] = cellOf(x, y); GRID[cy * GW + cx] = 0; } } }
carve([[130.7, 34.0], [131.15, 34.0], [131.9, 33.98], [132.7, 34.08], [133.5, 34.2], [134.3, 34.32], [134.95, 34.42], [135.3, 34.5]]);
function nearestSea(x, y) { const [sx, sy] = cellOf(x, y); if (!GRID[sy * GW + sx]) return [x, y]; for (let r = 1; r < 6; r++) { let best = null, bd = 1e9; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const cx = sx + dx, cy = sy + dy; if (cx < 0 || cy < 0 || cx >= GW || cy >= GH || GRID[cy * GW + cx]) continue; const px = cx * CELL + CELL / 2, py = cy * CELL + CELL / 2, d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = [px, py]; } } if (best) return best; } return [x, y]; }
for (const k of PORT_IDS) { const [x, y] = nearestSea(PORTS[k].x, PORTS[k].y); if (onLand(PORTS[k].x, PORTS[k].y) || GRID[cellOf(PORTS[k].x, PORTS[k].y)[1] * GW + cellOf(PORTS[k].x, PORTS[k].y)[0]]) { PORTS[k].x = Math.round(x); PORTS[k].y = Math.round(y); } }
for (const f of FINDS) { const [x, y] = nearestSea(f.x, f.y); f.x = Math.round(x); f.y = Math.round(y); }
const seaAt = (x, y) => { const [cx, cy] = cellOf(x, y); return !GRID[cy * GW + cx]; };

function findPath(x0, y0, x1, y1, avoid) {
  const [sx, sy] = cellOf(x0, y0), [tx, ty] = cellOf(x1, y1); const s = sy * GW + sx, t = ty * GW + tx;
  if (GRID[t]) return null; if (s === t) return [[x0, y0], [x1, y1]];
  const blocked = c => { if (GRID[c] && c !== s) return true; if (!avoid) return false; const px = (c % GW) * CELL + CELL / 2, py = ((c / GW) | 0) * CELL + CELL / 2; return c !== t && c !== s && !!inZone(px, py); };
  const prev = new Int32Array(GW * GH).fill(-1), seen = new Uint8Array(GW * GH); const q = [s]; seen[s] = 1;
  const D = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for (let h = 0; h < q.length; h++) { const c = q[h]; if (c === t) break; const cx = c % GW, cy = (c / GW) | 0;
    for (const [dx, dy] of D) { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue; const n = ny * GW + nx;
      if (seen[n] || blocked(n)) continue; if (dx && dy && (GRID[cy * GW + nx] || GRID[ny * GW + cx])) continue; seen[n] = 1; prev[n] = c; q.push(n); } }
  if (!seen[t]) return null;
  const cells = []; let c = t; while (c !== s) { cells.push(c); c = prev[c]; } cells.reverse();
  const pts = [[x0, y0], ...cells.map(c => [(c % GW) * CELL + CELL / 2, ((c / GW) | 0) * CELL + CELL / 2])]; pts[pts.length - 1] = [x1, y1];
  const out = [pts[0]]; let i = 0;
  while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !clearLine(pts[i], pts[j], avoid)) j--; out.push(pts[j]); i = j; }
  return out;
}
function clearLine(a, b, avoid) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let d = 5; d < L; d += 5) { const x = a[0] + (b[0] - a[0]) * d / L, y = a[1] + (b[1] - a[1]) * d / L; if (!seaAt(x, y)) return false; if (avoid && inZone(x, y)) return false; } return true; }
const pathLen = p => { let L = 0; for (let i = 0; i < p.length - 1; i++) L += Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]); return L; };
function pathZones(p) { const hit = new Set(); for (let i = 0; i < p.length - 1; i++) { const L = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]); for (let d = 0; d <= L; d += 10) { const z = inZone(p[i][0] + (p[i + 1][0] - p[i][0]) * d / L, p[i][1] + (p[i + 1][1] - p[i][1]) * d / L); if (z) hit.add(z.id); } } return [...hit].map(id => ZONES.find(z => z.id === id)); }

/* ─────────── 달력 · 바람 ─────────── */
const doyOf = t => (START_DOY + Math.floor(t)) % 360;
function dateStr(t) { const d = START_DOY + Math.floor(t), y = 828 + Math.floor(d / 360), dd = d % 360; return `${y}년 ${Math.floor(dd / 30) + 1}월 ${dd % 30 + 1}일`; }
const SEASONS = ['겨울', '봄', '여름', '가을'];
const seasonOf = t => Math.floor(doyOf(t) / 90);
const KEYS = [[0,Math.PI/2,.9,'북풍'],[60,Math.PI/2,.75,'북풍 잦아듦'],[90,0,.6,'변덕'],[135,-Math.PI/2,.72,'남풍 시작'],[180,-Math.PI/2,.86,'남풍'],[225,-Math.PI/2,.8,'남풍 · 태풍철'],[270,Math.PI,.62,'변덕'],[300,Math.PI/2,.72,'북풍 시작'],[360,Math.PI/2,.9,'북풍']];
function lerpAng(a, b, k) { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; }
function monsoon(t) { const dd = (START_DOY + t) % 360; for (let i = 0; i < KEYS.length - 1; i++) if (dd >= KEYS[i][0] && dd < KEYS[i + 1][0]) { const k = (dd - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]); return { dir: lerpAng(KEYS[i][1], KEYS[i + 1][1], k), str: KEYS[i][2] + (KEYS[i + 1][2] - KEYS[i][2]) * k, name: KEYS[i][3] }; } return { dir: KEYS[0][1], str: KEYS[0][2], name: KEYS[0][3] }; }
function wind(t, x, y) { const m = monsoon(t), h = t; const n1 = Math.sin(h * .9 + x * .003) + Math.sin(h * .37 + y * .004) + Math.sin(h * .13), n2 = Math.sin(h * .7 + y * .004 + 1.3) + Math.sin(h * .21 + x * .002);
  return { dir: m.dir + n1 / 3 * (m.str < .65 ? 1.1 : .5), str: clamp(m.str + n2 / 2 * .26, .15, 1.3), name: m.name }; }
function windFactor(deg) { const a = Math.abs(deg); let f; if (a <= 45) f = 1; else if (a <= 90) f = 1 - (a - 45) / 45 * .2; else if (a <= 135) f = .8 - (a - 90) / 45 * .3; else f = .5 - (a - 135) / 45 * .15;
  if (S && S.boons) { const c = S.boons.charm || 0; f = f + (1 - f) * .3 * c; } return f; }
const windWord = deg => { const a = Math.abs(deg); return a <= 55 ? '순풍' : a <= 115 ? '옆바람' : '역풍'; };
const shipSpeed = () => ship().spd * (1 + .12 * ((S && S.boons.sails) || 0));
function estimateDays(path, t, spd) { let d = 0; for (let i = 0; i < path.length - 1; i++) { const [x1, y1] = path[i], [x2, y2] = path[i + 1]; const L = Math.hypot(x2 - x1, y2 - y1); if (!L) continue;
  const dir = Math.atan2(y2 - y1, x2 - x1), w = wind(t + d, (x1 + x2) / 2, (y1 + y2) / 2); d += L / (BASE_KMD * Math.min(1.05, w.str) * windFactor(angDiff(dir, w.dir) * 180 / Math.PI) * spd); } return d; }
function pathWind(path, t) { const [x1, y1] = path[0], [x2, y2] = path[path.length - 1]; const w = wind(t, (x1 + x2) / 2, (y1 + y2) / 2); return windWord(angDiff(Math.atan2(y2 - y1, x2 - x1), w.dir) * 180 / Math.PI); }

/* ─────────── 상태 ─────────── */
let S = null;
const FOGN = GW * GH;
function revealCircle(x, y, r) { if (!S) return; const [c0x, c0y] = cellOf(x, y), rc = Math.ceil(r / CELL);
  for (let dy = -rc; dy <= rc; dy++) for (let dx = -rc; dx <= rc; dx++) { const cx = c0x + dx, cy = c0y + dy; if (cx < 0 || cy < 0 || cx >= GW || cy >= GH) continue; if (dx * dx + dy * dy <= rc * rc) S.fog[cy * GW + cx] = 1; }
  S.reveals.push([x, y, r]); }
const revealed = (x, y) => { const [cx, cy] = cellOf(x, y); return !!S.fog[cy * GW + cx]; };
function revealPath(a, b, r) { const p = findPath(PORTS[a].x, PORTS[a].y, PORTS[b].x, PORTS[b].y); if (!p) return; for (let i = 0; i < p.length - 1; i++) { const L = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]); for (let d = 0; d <= L; d += 30) revealCircle(p[i][0] + (p[i + 1][0] - p[i][0]) * d / L, p[i][1] + (p[i + 1][1] - p[i][1]) * d / L, r); } }

function newGame(capId) {
  const cap = CAPTAINS[capId] || CAPTAINS.gungbok, home = PORTS[cap.start];
  S = { v: 2, cap: capId, t: 0, at: cap.start, x: home.x, y: home.y, mode: 'port', path: null, seg: 0, dest: null, heading: -Math.PI / 2,
    gold: cap.gold, slots: [], tier: 0, hull: 100, hullMax: 100, threat: 0, fame: 0, stage: 0,
    markets: {}, booms: [], nextBoom: 4, ledger: {}, rumors: [], found: {}, docked: { [cap.start]: 1 },
    known: Object.fromEntries(PORT_IDS.map(k => [k, !PORTS[k].hidden || (cap.knows || []).includes(k)])),
    fog: new Array(FOGN).fill(0), reveals: [], crew: CREW.map(c => ({ k: c.k, asked: false, done: false, alive: true })),
    flags: {}, pending: [], voyage: null, ev: null, lastEvDay: 0, boost: 0, combo: 0, season: seasonOf(0),
    quotaN: 0, nextDue: 90, paid: 0, boons: {}, draft: null, relief: 0, orders: [], offers: {}, rivals: [], spotted: {},
    stats: { trades: 0, bestMult: 0, bestTrade: null, profit: 0, voyages: 0, hits: 0, misses: 0, orders: 0, years: 0 }, ended: null };
  initMarkets(); initRivals();
  for (const k of PORT_IDS) if (S.known[k]) revealCircle(PORTS[k].x, PORTS[k].y, 140);
  for (const [a, b] of [['cheonghae', 'jeoksan'], ['cheonghae', 'hakata'], ['cheonghae', 'ulsan'], ['cheonghae', 'dangeun'], ['jeoksan', 'deungju'], ['jeoksan', 'yangzhou'], ['yangzhou', 'mingzhou'], ['cheonghae', 'tamna'], ['tamna', 'mingzhou']]) revealPath(a, b, 75);
  if (S.known.naniwa) { revealPath('hakata', 'naniwa', 60); revealCircle(PORTS.naniwa.x, PORTS.naniwa.y, 100); }
  for (const [k, id] of cap.rumors) { tickMarket(k); S.rumors.push({ k, id, price: sellPrice(k, id), day: -ri(4, 9), src: '소문' }); }
  observe(S.at, false); makeOffer(S.at);
  return S;
}

/* ─────────── 시장 ─────────── */
function initMarkets() {
  for (const k of PORT_IDS) { const p = PORTS[k], idx = {}, home = {}, fresh = !!p.hidden && !S.known[k];
    for (const g of GOODS) { let v = .85 + Math.random() * .3;
      if (p.prod.includes(g.id)) v = fresh ? .4 + Math.random() * .1 : .55 + Math.random() * .15;
      else if (p.want.includes(g.id)) v = fresh ? 2.1 + Math.random() * .4 : 1.3 + Math.random() * .3;
      idx[g.id] = v; home[g.id] = v; }
    const others = GOODS.map(g => g.id).filter(id => !p.prod.includes(id) && !p.want.includes(id)).sort(() => Math.random() - .5).slice(0, 2);
    S.markets[k] = { idx, home, press: {}, upd: 0, stock: [...p.prod, ...others] }; }
}
const boomMult = (k, id, d) => { let m = 1; for (const b of S.booms) if (b.k === k && b.id === id && d >= b.s && d < b.e) m *= b.m; return m; };
const activeBoom = (k, id, d) => S.booms.find(b => b.k === k && b.id === id && d >= b.s && d < b.e);
function spawnBooms(d) {
  while (S.nextBoom <= d) { const k = pick(PORT_IDS), id = pick(GOODS.filter(g => !PORTS[k].prod.includes(g.id))).id; const slump = Math.random() < .25;
    S.booms.push({ k, id, m: slump ? .5 + Math.random() * .15 : 1.6 + Math.random() * .7, s: S.nextBoom, e: S.nextBoom + ri(30, 70), slump }); S.nextBoom += ri(6, 14); }
  S.booms = S.booms.filter(b => b.e > d - 40);
}
function tickMarket(k) { const m = S.markets[k], today = Math.floor(S.t); if (today <= m.upd) return m; spawnBooms(today);
  for (let d = Math.max(m.upd, today - 90) + 1; d <= today; d++) for (const g of GOODS) { const id = g.id; m.press[id] = (m.press[id] || 0) * .965;
    const tgt = m.home[id] * boomMult(k, id, d) * (1 - clamp(m.press[id], -.4, .65)); m.idx[id] = clamp(m.idx[id] + (tgt - m.idx[id]) * .12 + (Math.random() - .5) * .03, .25, 3.2); }
  m.upd = today; return m; }
const natOf = k => PORTS[k].nation;
function sellBonus(k) { const b = S.boons; let m = 1 + .08 * (b.haggle || 0); if (b.tang && natOf(k) === '당') m += .15; if (b.wa && (natOf(k) === '왜' || natOf(k) === '남도')) m += .15; return m; }
const rawPrice = (k, id) => Math.max(1, Math.round(G[id].base * S.markets[k].idx[id]));
const buyPrice = (k, id) => Math.max(1, Math.round(rawPrice(k, id) * (1 - .08 * (S.boons.bargain || 0))));
const sellPrice = (k, id) => Math.max(1, Math.round(rawPrice(k, id) * .93 * sellBonus(k)));
const pctOf = (k, id) => Math.round(S.markets[k].idx[id] * 100);
function topDemand(k, n) { const m = S.markets[k]; return GOODS.map(g => g.id).filter(id => !m.stock.includes(id)).sort((a, b) => m.idx[b] - m.idx[a]).slice(0, n); }
function observe(k, all) { const m = tickMarket(k), p = {}; const ids = all ? GOODS.map(g => g.id) : [...m.stock, ...topDemand(k, 3), ...S.slots.map(s => s.id)];
  for (const id of new Set(ids)) p[id] = sellPrice(k, id); S.ledger[k] = { day: Math.floor(S.t), p, src: '본 값' }; }
function infoFor(k, id) { let best = null; const L = S.ledger[k]; if (L && L.p[id] != null) best = { price: L.p[id], day: L.day, src: L.src };
  for (const r of S.rumors) if (r.k === k && r.id === id && (!best || r.day > best.day)) best = { price: r.price, day: r.day, src: r.src, fake: r.fake }; return best; }
const ago = d => { const a = Math.floor(S.t) - d; return a <= 0 ? '오늘' : `${a}일 전`; };

/* ─────────── 매매 ─────────── */
const ship = () => SHIPS[S.tier];
const capacity = () => ship().slots + (S.boons.hold || 0);
const freeSlots = () => capacity() - S.slots.length;
const cratePrice = (k, id) => buyPrice(k, id) * LOT;
function buy(id) { const k = S.at; if (!k || S.mode !== 'port') return { ok: false, msg: '항구에서만 살 수 있다' }; tickMarket(k);
  if (!freeSlots()) return { ok: false, msg: '선창이 가득 찼다' }; const cost = cratePrice(k, id); if (S.gold < cost) return { ok: false, msg: '돈이 모자란다' };
  S.gold -= cost; S.slots.push({ id, cost }); const m = S.markets[k]; m.idx[id] = clamp(m.idx[id] * (1 + LOT / 300), .25, 3.2); m.press[id] = (m.press[id] || 0) - LOT / 600;
  return { ok: true, cost }; }
function sell(i) { const k = S.at, s = S.slots[i]; if (!s || !k) return null; tickMarket(k); const m = S.markets[k];
  const pct0 = pctOf(k, s.id), unit = sellPrice(k, s.id), rev = unit * LOT; const profit = rev - s.cost, mult = s.cost > 0 ? rev / s.cost : 3;
  m.idx[s.id] = clamp(m.idx[s.id] * (1 - LOT / 300), .25, 3.2); m.press[s.id] = (m.press[s.id] || 0) + LOT / 200;
  S.slots.splice(i, 1); S.gold += rev; S.stats.trades++; S.stats.profit += profit;
  if (mult > S.stats.bestMult) { S.stats.bestMult = mult; S.stats.bestTrade = `${PORTS[k].name}에서 ${G[s.id].name} ×${mult.toFixed(1)}`; }
  let th = 0; if (profit > 0) { S.combo++; th = Math.min(6, profit / 5000); addThreat(th); S.fame += Math.min(25, Math.round(profit / 600)); } else S.combo = 0;
  if (S.ledger[k]) S.ledger[k].p[s.id] = sellPrice(k, s.id);
  return { id: s.id, rev, profit, mult, pct0, pct1: pctOf(k, s.id), threat: th, combo: S.combo }; }

/* ─────────── 의뢰 ─────────── */
function makeOffer(k) { if (!k) return; const old = S.offers[k]; if (old && old.until > S.t) return;
  if (Math.random() < .35) { S.offers[k] = { none: true, until: S.t + 25 }; return; }
  const targets = PORT_IDS.filter(x => x !== k && S.known[x] && findPath(PORTS[k].x, PORTS[k].y, PORTS[x].x, PORTS[x].y)); if (!targets.length) return;
  const to = pick(targets); tickMarket(to); const id = pick(PORTS[to].want.concat(GOODS.map(g => g.id)).slice(0, 4)); const n = ri(1, 3);
  const dist = pathLen(findPath(PORTS[k].x, PORTS[k].y, PORTS[to].x, PORTS[to].y)); const days = Math.round(dist / 70 + ri(12, 26));
  const reward = Math.round(G[id].base * LOT * n * (1.7 + Math.random() * .5) / 100) * 100;
  S.offers[k] = { id: 'o' + Math.floor(S.t * 100) + k, from: k, to, good: id, n, days, reward, until: S.t + 20 }; }
function acceptOffer(k) { const o = S.offers[k]; if (!o || o.none || S.orders.length >= 2) return null; S.orders.push(Object.assign({}, o, { due: S.t + o.days })); S.offers[k] = { none: true, until: S.t + 20 }; return o; }
function deliverOrders(k) { const done = [];
  for (const o of S.orders.slice()) { if (o.to !== k) continue; const idx = []; S.slots.forEach((s, i) => { if (s.id === o.good && idx.length < o.n) idx.push(i); });
    if (idx.length < o.n) continue; for (const i of idx.reverse()) S.slots.splice(i, 1); S.gold += o.reward; S.fame += 40; S.stats.orders++; S.orders.splice(S.orders.indexOf(o), 1); done.push(o); }
  return done; }
function expireOrders() { const gone = []; for (const o of S.orders.slice()) if (S.t > o.due) { S.orders.splice(S.orders.indexOf(o), 1); S.fame = Math.max(0, S.fame - 20); gone.push(o); } return gone; }

/* ─────────── 소문 ─────────── */
const rumorCost = () => (S.cap === 'ara' || S.boons.clerk) ? 200 : 400;
function buyRumor() { const c = rumorCost(); if (S.gold < c) return { ok: false, msg: '돈이 모자란다' }; S.gold -= c; return { ok: true, text: makeRumor((S.cap === 'ara' || S.boons.clerk) ? 'true' : 'talk') }; }
function makeRumor(kind) {
  const today = Math.floor(S.t); spawnBooms(today); const known = PORT_IDS.filter(k => S.known[k] && k !== S.at); const roll = Math.random();
  const push = r => { S.rumors.push(r); if (S.rumors.length > 40) S.rumors.shift(); };
  if (kind === 'talk' && roll < .16) { const k = pick(known), id = pick(GOODS.filter(g => !PORTS[k].prod.includes(g.id))).id;
    push({ k, id, price: Math.round(G[id].base * (1.7 + Math.random() * .6) * .93), day: today - ri(3, 12), src: '소문', fake: true });
    return { k, id, line: `${PORTS[k].name}에서 ${G[id].name}이라면 부르는 게 값이라더군.` }; }
  const live = S.booms.filter(b => b.s <= today && b.e > today && b.k !== S.at);
  if (roll < .7 && live.length) { const b = pick(live);
    if (!S.known[b.k]) { revealCircle(PORTS[b.k].x, PORTS[b.k].y, 40); const P0 = PORTS[S.at] || PORTS.cheonghae; const dx = PORTS[b.k].x - P0.x, dy = PORTS[b.k].y - P0.y;
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? '동' : '서') : (dy > 0 ? '남' : '북');
      return { hint: b.k, line: `아무도 안 가본 ${dir}쪽 먼 포구에서 ${G[b.id].name}이라면 금을 내놓는다더라. — 해도 ${dir}쪽에 희미한 흔적을 그렸다.` }; }
    tickMarket(b.k); const age = ri(3, 14), noise = kind === 'talk' ? 1 + (Math.random() - .5) * .4 : 1, price = Math.round(sellPrice(b.k, b.id) * noise);
    push({ k: b.k, id: b.id, price, day: today - age, src: '소문' });
    return { k: b.k, id: b.id, line: b.slump ? `${PORTS[b.k].name}에 ${G[b.id].name}이 남아돈다더군. 똥값이래.` : `${PORTS[b.k].name}에 ${G[b.id].name} 바람이 분다! 부르는 게 값이래.` }; }
  const k = pick(known); tickMarket(k); const id = pick(topDemand(k, 3)), age = ri(4, 20), noise = kind === 'talk' ? 1 + (Math.random() - .5) * .3 : 1, price = Math.round(sellPrice(k, id) * noise);
  push({ k, id, price, day: today - age, src: '소문' });
  return { k, id, line: `${PORTS[k].name}에선 ${G[id].name}을 상자당 ${(price * LOT).toLocaleString('ko-KR')}냥쯤 쳐준다더군.` };
}

/* ─────────── 경쟁자 ─────────── */
function initRivals() { S.rivals = RIVALS.map(r => { if (r.kind === 'pirate') { const z = pick(ZONES); return { id: r.id, x: z.x, y: z.y, zone: z.id, tx: z.x, ty: z.y, heading: 0, cool: 0 }; }
  const h = PORTS[r.home]; return { id: r.id, at: r.home, x: h.x, y: h.y, path: null, seg: 0, dest: null, good: null, wait: ri(2, 8), heading: 0, last: null }; }); }
function rivalPlan(R, def) { tickMarket(R.at); let best = null;
  for (const id of S.markets[R.at].stock) { const bp = rawPrice(R.at, id); for (const d of def.known) { if (d === R.at) continue; tickMarket(d); const g = rawPrice(d, id) * .93 - bp; const score = g * (.8 + Math.random() * .4);
      if (!best || score > best.score) best = { id, d, score }; } }
  if (!best) best = { id: null, d: pick(def.known.filter(x => x !== R.at)) };
  const p = findPath(R.x, R.y, PORTS[best.d].x, PORTS[best.d].y); if (!p) { R.wait = 5; return; }
  if (best.id) { const m = S.markets[R.at]; m.press[best.id] = (m.press[best.id] || 0) - .12; m.idx[best.id] = clamp(m.idx[best.id] * 1.1, .25, 3.2); }
  R.path = p; R.seg = 0; R.dest = best.d; R.good = best.id; R.at = null; }
function updateRivals(dt) {
  const out = [];
  for (const R of S.rivals) { const def = RIVALS.find(r => r.id === R.id);
    if (def.kind === 'pirate') { const z = ZONES.find(z => z.id === R.zone); const near = S.mode === 'sail' && Math.hypot(S.x - z.x, S.y - z.y) < z.r + 60;
      if (near && R.cool <= 0) { R.tx = S.x; R.ty = S.y; } else if (Math.hypot(R.tx - R.x, R.ty - R.y) < 6) { const a = Math.random() * 7, rr = Math.random() * z.r * .85; R.tx = z.x + Math.cos(a) * rr; R.ty = z.y + Math.sin(a) * rr; if (Math.random() < .03) { const nz = pick(ZONES); R.zone = nz.id; } }
      const d = Math.hypot(R.tx - R.x, R.ty - R.y), sp = (near ? 115 : 55) * dt; if (d > .1) { const m = Math.min(1, sp / d); const nx = R.x + (R.tx - R.x) * m, ny = R.y + (R.ty - R.y) * m; if (seaAt(nx, ny)) { R.heading = Math.atan2(R.ty - R.y, R.tx - R.x); R.x = nx; R.y = ny; } else { R.tx = z.x; R.ty = z.y; } }
      R.cool -= dt; if (S.mode === 'sail' && R.cool <= 0 && Math.hypot(S.x - R.x, S.y - R.y) < 16) { R.cool = 25; out.push({ type: 'ambush' }); }
      continue; }
    if (R.at) { R.wait -= dt; if (R.wait <= 0) rivalPlan(R, def); continue; }
    let rem = dt; while (rem > 0 && R.path) { const [tx, ty] = R.path[R.seg + 1] || R.path[R.path.length - 1]; const dir = Math.atan2(ty - R.y, tx - R.x); R.heading = dir;
      const w = wind(S.t, R.x, R.y), spd = BASE_KMD * .95 * Math.min(1.05, w.str) * windFactor(angDiff(dir, w.dir) * 180 / Math.PI); let d = spd * Math.min(rem, .25); rem -= .25;
      const L = Math.hypot(tx - R.x, ty - R.y); if (d >= L) { R.x = tx; R.y = ty; R.seg++; if (R.seg >= R.path.length - 1) { // 도착: 판다
          const k = R.dest; R.at = k; R.path = null; R.wait = ri(2, 6); if (R.good) { tickMarket(k); const m = S.markets[k]; m.press[R.good] = (m.press[R.good] || 0) + .3; m.idx[R.good] = clamp(m.idx[R.good] * .78, .25, 3.2);
            R.last = { k, id: R.good, day: Math.floor(S.t) }; if (S.known[k]) out.push({ type: 'rival', rival: def, k, id: R.good }); } R.good = null; break; } }
      else { R.x += Math.cos(dir) * d; R.y += Math.sin(dir) * d; } }
  }
  return out;
}

/* ─────────── 경계 · 이야기 ─────────── */
function addThreat(v) { S.threat = Math.min(100, S.threat + v * (S.cap === 'tomo' ? .5 : 1) * (S.boons.court ? .6 : 1)); checkThreat(); }
const crewOf = k => S.crew.find(c => c.k === k);
const perk = k => { const c = crewOf(k); return c && c.alive && c.done; };
function checkThreat() {
  if (S.threat >= 100) { const bum = crewOf('deck');
    if (bum.alive && bum.done) { bum.alive = false; S.gold = Math.round(S.gold * .5); S.threat = 45; S.stage = 1; S.pending.push('assassinBlocked'); return; }
    S.ended = 'assassin'; return; }
  if (S.threat >= 85 && S.stage < 3) { S.stage = 3; S.pending.push('shadow'); }
  else if (S.threat >= 60 && S.stage < 2) { S.stage = 2; S.pending.push('bounty'); }
  else if (S.threat >= 30 && S.stage < 1) { S.stage = 1; S.pending.push('inspector'); }
}
const canTribute = () => S.mode === 'port' && PORTS[S.at].court && S.cap !== 'tomo';
const tributeCost = () => Math.max(800, Math.round(S.gold * .12));
function tribute() { if (!canTribute()) return null; const c = tributeCost(); if (S.gold < c) return null; S.gold -= c; S.threat = Math.max(0, S.threat - 30); S.fame += 10;
  S.stage = S.threat >= 85 ? 3 : S.threat >= 60 ? 2 : S.threat >= 30 ? 1 : 0; return c; }
const repairCost = () => Math.round((S.hullMax - S.hull) * 25 * (S.boons.hull ? .5 : 1));
function repair() { const c = repairCost(); if (!c || S.gold < c) return null; S.gold -= c; S.t += Math.ceil((S.hullMax - S.hull) / 40) * .5; S.hull = S.hullMax; return c; }
const nextShip = () => SHIPS[S.tier + 1] || null;
function upgrade() { const n = nextShip(); if (!n || S.gold < n.price) return null; S.gold -= n.price; S.tier++; S.hullMax = n.hull + 40 * (S.boons.hull || 0); S.hull = S.hullMax; S.fame += 30; S.t += 3; return n; }

function nextStory() {
  if (S.ended || S.mode !== 'port') return null;
  while (S.pending.length) { const id = S.pending.shift(); const st = STORIES[id] && STORIES[id](); if (st) return st; }
  for (const c of S.crew) { const d = CREW.find(x => x.k === c.k);
    if (c.alive && !c.asked && S.t >= d.appear) { c.asked = true; return { who: c.k, title: `${d.name}의 부탁`, text: `"${d.ask}"`, sub: `→ ${d.hint}`, opts: [{ label: '기억해 두겠다', apply: () => null }] }; }
    if (c.alive && c.asked && !c.done && S.flags[d.flag]) { c.done = true; return { who: c.k, title: `${d.name} — 부탁을 들어줬다`, text: d.done, sub: `→ ${d.perk}`, opts: [{ label: '고개를 끄덕인다', apply: () => null }] }; } }
  return null;
}
const STORIES = {
  inspector: () => { const bribe = Math.max(500, Math.round(S.gold * .08)); return { who: 'inspector', title: '감찰관', text: '관복 입은 자가 배에 오른다. "서라벌에서 왔소. 요즘 바다에서 이름이 들리던데." 선창을 들여다본다.',
    opts: [{ label: '뇌물을 쥐여준다', sub: `${bribe.toLocaleString('ko-KR')}냥 · 경계 -5`, apply: () => { S.gold = Math.max(0, S.gold - bribe); S.threat = Math.max(0, S.threat - 5); return '감찰관이 소매를 털고 내려갔다.'; } },
      { label: '검사를 받는다', sub: S.slots.length ? '상자 하나를 압수당한다' : '선창이 비어 잃을 것이 없다', apply: () => { if (S.slots.length) { const s = S.slots.splice(ri(0, S.slots.length - 1), 1)[0]; return `${G[s.id].name} 상자를 세금이라며 가져갔다.`; } return '빈 선창을 보고 혀를 차며 내려갔다.'; } }] }; },
  bounty: () => ({ who: 'inspector', title: '현상금', text: '포구 게시판에 당신 배의 생김새가 붙었다. 조정이 사략선을 풀었다. 이제 해적이 당신을 찾아온다.', opts: [{ label: '돛을 손본다', apply: () => null }] }),
  shadow: () => ({ who: 'deck', title: '그림자', text: `선술집 구석에서 같은 얼굴을 세 번 봤다.${crewOf('deck').alive ? ' 범이가 귓속말을 한다. "형님, 누가 따라붙었소."' : ''} 경계가 끝까지 차면 칼이 온다.`,
    opts: [{ label: '못 본 척한다', apply: () => null }, ...(canTribute() ? [{ label: '조정에 바친다', sub: `${tributeCost().toLocaleString('ko-KR')}냥 · 경계 -30`, apply: () => tribute() ? '조정에 바쳤다. 그림자가 사라졌다.' : '돈이 모자랐다.' }] : [])] }),
  assassinBlocked: () => ({ who: 'deck', title: '칼이 온 밤', text: '숙소 문이 소리 없이 열렸다. 범이가 먼저 일어났다. "이번엔 내 차례요, 형님." 새벽에 당신은 살아 있었다. 범이는 돌아오지 않았다.',
    sub: '자금 절반을 잃었다. 다음 칼은 막아줄 사람이 없다.', opts: [{ label: '범이를 묻는다', apply: () => '바다가 보이는 언덕에 범이를 묻었다.' }] })
};

/* ─────────── 상납 · 특권 ─────────── */
const quotaNow = () => Math.round(quotaFor(S.quotaN) * (1 - .25 * S.relief) / 100) * 100;
function collectQuota() { // 계절 끝. 반환: {ok, amount, short, seized}
  const due = quotaNow(); let seized = 0;
  if (S.gold < due) { // 짐을 7할 값에 넘겨 메운다
    while (S.gold < due && S.slots.length) { const s = S.slots.pop(); const v = Math.round(s.cost * .7); S.gold += v; seized += v; } }
  if (S.gold < due) { S.ended = 'quota'; return { ok: false, amount: due, short: due - S.gold, seized }; }
  S.gold -= due; S.paid += due; S.quotaN++; S.relief = 0; S.nextDue += 90; if (S.quotaN % 4 === 0) S.stats.years++;
  S.draft = drawBoons(); return { ok: true, amount: due, seized, next: quotaNow(), year: S.quotaN % 4 === 0 }; }
function drawBoons() { const pool = BOONS.filter(b => (S.boons[b.id] || 0) < b.max && !(b.id === 'chart' && !PORT_IDS.some(k => !S.known[k] && !S.spotted[k]))); const out = []; while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); return out.map(b => b.id); }
function takeBoon(id) { if (!S.draft || !S.draft.includes(id)) return null; S.draft = null; S.boons[id] = (S.boons[id] || 0) + 1; let note = '';
  if (id === 'hull') { S.hullMax += 40; S.hull += 40; }
  if (id === 'relief') S.relief++;
  if (id === 'chart') { const k = pick(PORT_IDS.filter(k => !S.known[k] && !S.spotted[k])); if (k) { S.spotted[k] = 1; revealCircle(PORTS[k].x, PORTS[k].y, 60); note = k; } }
  return { id, note }; }

/* ─────────── 항해 계획 · 출항 ─────────── */
function plan(target) {
  const from = [S.x, S.y]; let to, port = null;
  if (typeof target === 'string') { port = target; to = [PORTS[port].x, PORTS[port].y]; } else { to = [target.x, target.y]; if (!seaAt(to[0], to[1])) return null; }
  const path = findPath(from[0], from[1], to[0], to[1]); if (!path) return null;
  const mk = p => ({ path: p, days: estimateDays(p, S.t, shipSpeed()), wind: pathWind(p, S.t), zones: pathZones(p) });
  const a = mk(path); let alt = null;
  let main = a;
  if (a.zones.length) { const p2 = findPath(from[0], from[1], to[0], to[1], true); if (p2) { const b = mk(p2); if (!b.zones.length) { if (b.days <= a.days * 1.06) main = b; else if (b.days < a.days * 2.2) alt = b; } } }
  return { port, explore: !port, main, alt, ...main };
}
function depart(p, useAlt) { if (!p || S.ended) return false; const r = useAlt && p.alt ? p.alt : p.main; S.mode = 'sail'; S.path = r.path; S.seg = 0; S.dest = p.port; S.voyage = { from: S.at, t0: S.t, storms: 0, finds: [] }; S.at = null; S.lastEvDay = Math.floor(S.t); S.stats.voyages++; return true; }

/* ─────────── 사건 ─────────── */
const pirateOdds = () => clamp(.45 + (S.cap === 'gungbok' ? .1 : 0) + (perk('deck') ? .15 : 0) + (S.boons.hunter ? .25 : 0) + S.tier * .04 - (S.threat >= 60 ? .1 : 0), .1, .92);
function pirateEvent(head) { return { id: 'pirate', title: head || '해적선', text: `${S.threat >= 60 ? '현상금을 노리는 배다. ' : ''}검은 돛이 바람 위에서 내려온다.${crewOf('deck').alive ? ' 범이가 칼을 뽑는다.' : ''}`,
  opts: [{ label: '싸운다', sub: `이길 가망 ${Math.round(pirateOdds() * 10)}할`, apply: () => {
      if (Math.random() < pirateOdds()) { const loot = Math.round(ri(8, 22) * 100 * (1 + S.tier * .6) * (S.boons.hunter ? 2 : 1)); S.gold += loot; S.hull -= 8; S.fame += 30; S.flags.pirateWin = 1; S.threat = Math.min(100, S.threat + 2); return { text: `격퇴했다! 전리품 ${loot.toLocaleString('ko-KR')}냥`, good: true }; }
      S.hull -= 30; let lost = ''; if (S.slots.length) { const s = S.slots.splice(ri(0, S.slots.length - 1), 1)[0]; lost = ` ${G[s.id].name} 상자를 빼앗겼다.`; } return { text: `밀렸다. 선체 -30.${lost}`, bad: true }; } },
    S.slots.length ? { label: '상자 하나를 내준다', sub: '확실한 손해, 위험은 없다', apply: () => { const s = S.slots.splice(ri(0, S.slots.length - 1), 1)[0]; return { text: `${G[s.id].name} 상자를 던져주고 빠져나왔다.` }; } }
      : { label: '통행료를 낸다', sub: `${Math.min(S.gold, 1200).toLocaleString('ko-KR')}냥`, apply: () => { S.gold -= Math.min(S.gold, 1200); return { text: '통행료를 내고 지나갔다.' }; } }] }; }
const EVENTS = [
  { id: 'storm', w: () => 2, when: w => w.str > .74, title: '검은 구름', text: () => `서쪽 수평선이 검다. 너울이 길어진다.${perk('helm') ? ' 곽이 이미 섬 그늘을 가리키고 있다.' : ' 곽이 말한다. "반나절이면 오오."'}`,
    opts: () => [{ label: '뚫고 간다', sub: '시간은 안 잃고 배가 상한다', apply: () => { const d = ri(14, 30); S.hull -= d; S.voyage.storms++; if (S.slots.length && Math.random() < .25) { const s = S.slots.splice(ri(0, S.slots.length - 1), 1)[0]; return { text: `폭풍을 뚫었다. 선체 -${d}. ${G[s.id].name} 상자 하나가 파도에 쓸려갔다.`, bad: true }; } return { text: `폭풍을 뚫었다. 선체 -${d}`, bad: true }; } },
      { label: '피항한다', sub: perk('helm') ? '반나절 · 곽이 먼저 읽었다' : '이틀을 잃는다', apply: () => { S.t += perk('helm') ? .5 : 2; return { text: perk('helm') ? '곽이 반나절 먼저 섬 그늘에 배를 댔다.' : '섬 그늘에서 이틀을 버텼다.' }; } }] },
  { id: 'calm', w: () => 2, when: w => w.str < .46, title: '죽은 바다', text: () => '바람이 죽었다. 돛이 늘어지고 바다는 기름처럼 매끈하다.',
    opts: () => [{ label: '바람을 기다린다', sub: '이틀 반', apply: () => { S.t += 2.5; return { text: '이틀 반 만에 바람이 돌아왔다.' }; } },
      { label: '노를 젓는다', sub: '하루 · 선체 -6', apply: () => { S.t += 1; S.hull -= 6; return { text: '하루를 노로 밀었다. 손이 다 터졌다.' }; } }] },
  { id: 'wreck', w: () => 2, when: () => true, title: '떠도는 잔해', text: () => '부서진 배의 잔해가 떠온다. 널빤지 사이로 궤짝이 보인다.',
    opts: () => [{ label: '건진다', sub: '반나절', apply: () => { S.t += .5; const r = Math.random();
        if (r < .4) { const g = ri(3, 12) * 100; S.gold += g; return { text: `은자 주머니가 나왔다. +${g}냥`, good: true }; }
        if (r < .7 && freeSlots()) { const id = pick(GOODS).id; S.slots.push({ id, cost: 0 }); return { text: `${G[id].name} 한 상자가 멀쩡하다. 공짜다.`, good: true }; }
        return { text: '궤짝은 비어 있었다.' }; } }, { label: '지나친다', apply: () => ({ text: '뒤돌아보지 않았다.' }) }] },
  { id: 'sail', w: () => 2, when: () => true, title: '낯선 돛', text: () => '수평선에 돛 하나. 이쪽으로 온다. 깃발이 보이지 않는다.',
    opts: () => [{ label: '다가간다', sub: '상선일까', apply: () => { if (Math.random() < .6) { const r = makeRumor('true'); return { text: `당의 상선이다. 물과 소식을 나눴다. "${r.line}"`, good: true }; } S.hull -= 14; return { text: '해적이었다. 화살 세례를 받고 겨우 떨쳐냈다. 선체 -14', bad: true }; } },
      { label: '피한다', sub: '반나절', apply: () => { S.t += .5; return { text: '뱃머리를 돌려 거리를 벌렸다.' }; } }] },
  { id: 'castaway', w: () => 1, when: () => true, title: '표류자', text: () => '부서진 돛대에 사람이 매달려 있다. 손을 흔든다.',
    opts: () => [{ label: '건져 올린다', sub: '반나절 · 명성', apply: () => { S.t += .5; S.fame += 20; const r = makeRumor('true'); return { text: `살려준 뱃사람이 고맙다며 귓속말을 한다. "${r.line}"`, good: true }; } },
      { label: '지나친다', apply: () => ({ text: '못 본 척했다. 선원들이 말이 없다.' }) }] },
  { id: 'reef', w: () => 2, when: () => !S.dest, title: '물빛이 바뀐다', text: () => '물이 갑자기 옅어진다. 곽이 측심줄을 내린다. "여섯 길… 넷… 셋!"',
    opts: () => [{ label: '즉시 멈춘다', sub: '하루', apply: () => { S.t += 1; return { text: '암초 위에서 멈췄다. 하루를 들여 빠져나왔다.' }; } },
      { label: '밀고 나간다', sub: '반반', apply: () => { if (Math.random() < .5) { S.hull -= 25; return { text: '긁혔다. 선체 -25', bad: true }; } return { text: '운이 좋았다.', good: true }; } }] },
  { id: 'fairwind', w: () => 1, when: () => true, title: '등 뒤의 바람', text: () => '바람이 고물 쪽으로 돌았다. 돛이 팽팽하게 부푼다.',
    opts: () => [{ label: '돛을 다 편다', sub: '이틀 동안 빨라진다', apply: () => { S.boost = 2; return { text: '배가 물 위를 미끄러진다.', good: true }; } }] }
];
function rollEvent(w) { if (inZone(S.x, S.y) && Math.random() < .55 + S.threat / 300) { S.ev = Object.assign({}, pirateEvent(`${inZone(S.x, S.y).name}`)); return S.ev; }
  const pool = EVENTS.filter(e => e.when(w)); const bag = []; for (const e of pool) for (let i = 0; i < e.w(); i++) bag.push(e); if ((S.slots.length >= 3 || S.threat >= 30) && Math.random() < (S.threat >= 60 ? .3 : .1)) { S.ev = pirateEvent(); return S.ev; }
  const e = pick(bag); S.ev = { id: e.id, title: e.title, text: e.text(), opts: e.opts() }; return S.ev; }
function choose(i) { const ev = S.ev; if (!ev) return null; const r = ev.opts[i].apply() || { text: '' }; S.ev = null; S.hull = Math.min(S.hullMax, S.hull);
  if (S.hull <= 0) return { ...r, wreck: wreck() }; return r; }
function wreck() { const back = S.voyage && S.voyage.from ? S.voyage.from : 'cheonghae'; const lost = S.slots.length; S.slots = []; S.hull = Math.round(S.hullMax * .4); S.gold = Math.round(S.gold * .9); S.t += 5;
  S.mode = 'port'; S.at = back; S.x = PORTS[back].x; S.y = PORTS[back].y; S.path = null; S.dest = null; return { port: back, lost }; }

/* ─────────── 매 프레임 진행 ─────────── */
function update(dt) {
  const out = []; if (!S || S.ended || S.draft) return out;
  if (S.mode !== 'sail' || S.ev) return out;
  let rem = dt;
  while (rem > 1e-6 && S.mode === 'sail' && !S.ev && !S.ended && !S.draft) {
    if (!S.path[S.seg + 1]) S.seg = S.path.length - 1;
    if (S.seg >= S.path.length - 1) { if (S.dest) out.push({ type: 'arrive', info: arrive(S.dest) }); else { S.mode = 'sea'; S.path = null; out.push({ type: 'explored' }); } break; }
    const step = Math.min(rem, .2); rem -= step; const t0 = S.t; S.t += step;
    out.push(...updateRivals(step)); if (out.some(o => o.type === 'ambush')) { S.ev = pirateEvent('흑기 해적선'); out.push({ type: 'event', ev: S.ev }); break; }
    const [tx, ty] = S.path[S.seg + 1]; const dir = Math.atan2(ty - S.y, tx - S.x); S.heading = dir;
    const w = wind(S.t, S.x, S.y); S.windDeg = angDiff(dir, w.dir) * 180 / Math.PI;
    const spd = BASE_KMD * Math.min(1.05, w.str) * windFactor(S.windDeg) * shipSpeed() * (S.boost > 0 ? 1.45 : 1); S.spd = spd; if (S.boost > 0) S.boost -= step;
    const d = spd * step, L = Math.hypot(tx - S.x, ty - S.y);
    if (d >= L) { S.x = tx; S.y = ty; S.seg++; } else { S.x += Math.cos(dir) * d; S.y += Math.sin(dir) * d; }
    if (Math.floor(S.t * 4) !== Math.floor(t0 * 4)) revealCircle(S.x, S.y, REVEAL);
    for (const f of FINDS) if (!S.found[f.id] && Math.hypot(f.x - S.x, f.y - S.y) < 50) { S.found[f.id] = 1; S.fame += f.fame; S.gold += f.gold; if (f.fx) f.fx(S); S.voyage.finds.push(f.id); revealCircle(f.x, f.y, 80); out.push({ type: 'find', find: f }); }
    for (const k of PORT_IDS) if (!S.known[k] && Math.hypot(PORTS[k].x - S.x, PORTS[k].y - S.y) < 95) { S.known[k] = true; S.fame += 150; revealCircle(PORTS[k].x, PORTS[k].y, 90); out.push({ type: 'port', port: k }); }
    if (Math.floor(S.t) !== Math.floor(t0)) {
      const se = seasonOf(S.t); if (se !== S.season) { S.season = se; out.push({ type: 'season', season: se }); }
      for (const o of expireOrders()) out.push({ type: 'orderLost', order: o });
      if (S.t >= S.nextDue) { out.push({ type: 'quota', res: collectQuota() }); break; }
      const day = Math.floor(S.t);
      if (day - S.lastEvDay >= 2 && Math.random() < (inZone(S.x, S.y) ? .3 : .12)) { S.lastEvDay = day; out.push({ type: 'event', ev: rollEvent(w) }); break; }
    }
  }
  return out;
}
/* 항구에 머무는 동안 흐른 시간도 상납 기한에 걸린다 */
function portTick() { const out = []; if (S.mode === 'port' && !S.ended && !S.draft && S.t >= S.nextDue) out.push({ type: 'quota', res: collectQuota() }); out.push(...expireOrders().map(o => ({ type: 'orderLost', order: o }))); return out; }
function arrive(k) {
  const v = S.voyage; S.mode = 'port'; S.at = k; S.x = PORTS[k].x; S.y = PORTS[k].y; S.path = null; S.dest = null; tickMarket(k);
  const first = !S.docked[k]; S.docked[k] = 1; const fresh = first && !!PORTS[k].hidden; if (first) S.fame += 60;
  if (k === 'naniwa') S.flags.naniwa = 1;
  const delivered = deliverOrders(k);
  const items = S.slots.map((s, i) => { const inf = infoFor(k, s.id), act = sellPrice(k, s.id); let verdict;
    if (!inf) verdict = 'unknown'; else { const r = act / inf.price; verdict = inf.fake && r < .8 ? 'fake' : r > 1.15 ? 'better' : r < .85 ? 'worse' : 'right'; }
    if (verdict === 'better' || verdict === 'right') S.stats.hits++; else if (verdict !== 'unknown') S.stats.misses++;
    return { i, id: s.id, cost: s.cost, inf: inf && { price: inf.price * LOT, ago: ago(inf.day), src: inf.src }, act: act * LOT, profit: act * LOT - s.cost, verdict }; });
  const rivalHere = S.rivals.map(R => R.last).filter(l => l && l.k === k && Math.floor(S.t) - l.day < 12).map(l => ({ id: l.id, rival: RIVALS.find(r => S.rivals.find(x => x.last === l).id === r.id) }));
  observe(k, fresh); revealCircle(S.x, S.y, 110); makeOffer(k);
  let letter = null; if (perk('tongue') || S.boons.letters) letter = makeRumor('true');
  S.threat = Math.max(0, S.threat - (S.t - v.t0) * .05); addThreat(.5);
  return { k, days: S.t - v.t0, first, fresh, items, storms: v.storms, finds: v.finds, letter, delivered, rivalHere };
}
function sellAll(keep) { const res = []; for (let i = S.slots.length - 1; i >= 0; i--) if (!keep || !keep.includes(i)) { const r = sell(i); if (r) res.push(r); } return res.reverse(); }

/* ─────────── 결산 ─────────── */
const assets = () => S.gold + S.slots.reduce((a, s) => a + s.cost, 0) + Math.round(ship().price * .5);
const score = () => S.paid + assets();
const rankOf = v => { let r = RANKS[0][1]; for (const [n, name] of RANKS) if (v >= n) r = name; return r; };
const daysToDue = () => Math.max(0, S.nextDue - S.t);

return { WORLD, VIEW, CELL, GW, GH, YEAR, LOT, LAND, LABELS, GOODS, G, PORTS, PORT_IDS, FINDS, ZONES, SHIPS, CAPTAINS, CREW, RANKS, RIVALS, BOONS, SEASONS,
  P, get S() { return S; }, set S(v) { S = v; },
  newGame, update, portTick, plan, depart, buy, sell, sellAll, buyRumor, rumorCost, tribute, tributeCost, canTribute, repair, repairCost, upgrade, nextShip,
  choose, nextStory, infoFor, tickMarket, buyPrice, sellPrice, cratePrice, pctOf, topDemand, activeBoom, freeSlots, capacity, ship, crewOf, perk,
  acceptOffer, quotaNow, quotaFor, takeBoon, daysToDue, inZone, pirateOdds,
  wind, monsoon, windWord, dateStr, seasonOf, doyOf, ago, assets, score, rankOf, seaAt, onLand, revealed, findPath, estimateDays, angDiff, pathZones };
})();
if (typeof module !== 'undefined') module.exports = CORE;
