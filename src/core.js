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
  { id: 'sulfur', name: '유황', ch: '硫', base: 160, col: '#9a9a2a' },
  { id: 'tea', name: '차', ch: '茶', base: 240, col: '#6f7d2f' },
  { id: 'books', name: '서적', ch: '書', base: 380, col: '#4b4d6e' },
  { id: 'iron', name: '덩이쇠', ch: '鐵', base: 210, col: '#5a6266' }
];
const G = Object.fromEntries(GOODS.map(g => [g.id, g]));

const PORTS_LL = {
  cheonghae: ['청해진', '淸', '신라', 126.85, 34.25, ['ginseng'], ['spice', 'porcelain'], { court: true }],
  dangeun:   ['당은포', '恩', '신라', 126.45, 37.12, ['ginseng'], ['silk', 'fur']],
  ulsan:     ['울산', '蔚', '신라', 129.5, 35.45, ['gold'], ['silk', 'spice', 'sulfur'], { court: true }],
  tamna:     ['탐라', '耽', '탐라', 126.55, 33.62, ['shell'], ['porcelain', 'iron']],
  jeoksan:   ['적산', '赤', '당', 122.35, 36.82, ['silk'], ['ginseng', 'gold']],
  deungju:   ['등주', '登', '당', 120.78, 37.92, ['silk'], ['fur', 'ginseng']],
  yangzhou:  ['양주', '揚', '당', 121.1, 32.25, ['porcelain', 'spice'], ['ginseng', 'shell']],
  mingzhou:  ['명주', '明', '당', 122.25, 29.95, ['porcelain'], ['sulfur', 'gold']],
  hakata:    ['하카타', '博', '왜', 130.3, 33.72, ['sulfur', 'iron'], ['silk', 'spice', 'books']],
  naniwa:    ['나니와', '難', '왜', 135.3, 34.5, ['gold'], ['porcelain', 'silk', 'spice'], { hidden: true }],
  quanzhou:  ['천주', '泉', '당', 118.85, 24.75, ['spice'], ['gold', 'ginseng', 'fur'], { hidden: true }],
  amami:     ['아마미', '奄', '남도', 129.25, 28.3, ['shell'], ['ginseng', 'porcelain'], { hidden: true }],
  ryukyu:    ['유구', '流', '남도', 127.55, 26.35, ['shell', 'sulfur'], ['silk', 'iron'], { hidden: true }],
  yeomju:    ['염주', '鹽', '발해', 130.95, 42.45, ['fur'], ['silk', 'tea'], { hidden: true }],
  hyeolgu:   ['혈구진', '穴', '신라', 126.1, 37.65, ['iron'], ['tea', 'spice']],
  hoejin:    ['회진', '會', '신라', 126.35, 34.9, ['ginseng', 'silk'], ['books', 'porcelain']],
  gimhae:    ['김해', '伽', '신라', 128.88, 35.08, ['iron'], ['books', 'silk', 'sulfur']],
  samcheok:  ['실직', '悉', '신라', 129.2, 37.42, ['ginseng'], ['shell', 'tea']],
  namgyeong: ['남경', '南', '발해', 128.4, 40.05, ['fur', 'iron'], ['silk', 'tea', 'porcelain'], { hidden: true }],
  laizhou:   ['내주', '萊', '당', 119.95, 37.2, ['books', 'silk'], ['ginseng', 'fur']],
  mizhou:    ['밀주', '密', '당', 120.15, 35.95, ['tea', 'silk'], ['ginseng', 'iron']],
  chuzhou:   ['초주', '楚', '당', 119.45, 34.6, ['books', 'porcelain'], ['ginseng', 'gold']],
  hangzhou:  ['항주', '杭', '당', 120.85, 30.35, ['tea', 'silk'], ['shell', 'iron']],
  wenzhou:   ['온주', '溫', '당', 120.95, 28.0, ['tea', 'porcelain'], ['sulfur', 'fur']],
  fuzhou:    ['복주', '福', '당', 119.55, 26.05, ['tea', 'spice'], ['gold', 'ginseng'], { hidden: true }],
  izumo:     ['이즈모', '雲', '왜', 132.75, 35.5, ['iron'], ['books', 'porcelain']],
  tsuruga:   ['쓰루가', '敦', '왜', 136.05, 35.66, ['gold', 'silk'], ['fur', 'books'], { hidden: true }],
  satsuma:   ['사쓰마', '薩', '왜', 130.3, 31.55, ['sulfur'], ['tea', 'books'], { hidden: true }],
  jilong:    ['계롱', '鷄', '남도', 121.75, 25.15, ['sulfur', 'gold'], ['iron', 'porcelain'], { hidden: true }]
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
  ['shoal', '거대 어군', 124.4, 35.4, 30, 900, '바다가 끓는다. 그물 가득 건져 소금에 절여 팔았다.'],
  ['baengnyeong', '백령도', 124.7, 37.95, 60, 300, '물범이 바위 위에서 존다. 당으로 건너는 배들이 여기서 바람을 기다린다.'],
  ['gageo', '가거도', 125.12, 34.07, 60, 400, '신라의 마지막 섬. 여기서부터는 망망대해다.'],
  ['chuja', '추자도', 126.3, 33.95, 40, 300, '탐라와 뭍 사이 징검다리 섬들. 멸치 떼가 은빛으로 뒤집힌다.'],
  ['geomun', '거문도', 127.3, 34.03, 50, 400, '세 섬이 감싼 잔잔한 물. 폭풍을 피하기 좋은 천연 항구다.', s => { s.hull = Math.min(s.hullMax, s.hull + 20); }],
  ['jindo', '울돌목', 126.3, 34.57, 70, 0, '바다가 울며 소용돌이친다. 곽이 키를 꽉 잡았다. 물때를 알면 지름길이다.'],
  ['miaodao', '묘도 열도', 120.75, 38.2, 50, 400, '등주 앞바다에서 요동으로 이어지는 섬 사다리.'],
  ['laotie', '두 물빛 바다', 121.3, 38.55, 70, 300, '요동 끝. 황해와 발해만의 물이 만나 색이 둘로 갈린다.'],
  ['yangtze', '장강 하구', 122.1, 31.45, 60, 500, '장강의 흙탕물이 수십 리 바다를 누렇게 물들였다.'],
  ['putuo', '보타산', 122.4, 30.0, 90, 0, '관음보살의 섬. 뱃사람들과 함께 무사 항해를 빌었다. 경계 -15', s => { s.threat = Math.max(0, s.threat - 15); }],
  ['iki', '이키 섬', 129.7, 33.78, 40, 300, '하카타와 대마도 사이. 왜의 사신선이 쉬어 가는 섬.'],
  ['okinoshima', '오키노시마', 130.1, 34.24, 120, 0, '현해탄 한가운데 신의 섬. 바위틈마다 옛 제물이 놓여 있다. 손대지 않고 절만 했다.'],
  ['tokara', '도카라 열도', 129.7, 29.6, 60, 500, '연기를 뿜는 화산섬들이 남쪽으로 흩어져 있다.'],
  ['kuroshio', '검은 물길', 128.4, 29.0, 100, 0, '바다 속에 강이 흐른다. 이 물길을 타는 법을 익혔다. 항해 +4%', s => { s.flags.kuroshio = 1; }],
  ['miyako', '미야코 섬', 125.3, 24.8, 70, 600, '유구 남서쪽 끝 낮은 섬. 산호 바다가 끝없이 맑다.'],
  ['yonaguni', '바다 밑 돌계단', 123.0, 24.45, 150, 0, '맑은 물 아래 거대한 돌계단. 누가 만들었는지 아무도 모른다.'],
  ['tumen', '두만강 하구', 130.7, 42.25, 70, 500, '발해 땅의 큰 강이 바다로 든다. 강가에 사슴 떼.'],
  ['whaleroad', '고래 길', 130.2, 39.6, 70, 600, '동해 한복판, 고래 떼가 북으로 올라가는 길.'],
  ['noto', '노토 곶', 136.75, 37.45, 80, 500, '왜의 북쪽 바다 끝. 발해 사신선이 처음 닿는 곶이다.']
];
const FIND_META = { heuksan: ['서해', '청해진 서북쪽, 곧은 소나무가 자라는 섬'], shoal: ['서해', '서해 한가운데 물고기가 끓는 곳'], baengnyeong: ['서해', '서해 북쪽 끝, 당으로 건너는 길목의 섬'], gageo: ['서해', '흑산도 남서쪽 먼바다, 신라의 마지막 섬'], miaodao: ['서해', '등주 앞바다에서 요동으로 이어지는 섬들'], laotie: ['서해', '요동반도 남쪽 끝, 물빛이 갈리는 곳'],
  ieodo: ['남해', '탐라 남서쪽 먼바다, 물에 잠긴 바위섬'], chuja: ['남해', '탐라와 뭍 사이 징검다리 섬들'], geomun: ['남해', '청해진 동쪽, 세 섬이 감싼 항구'], jindo: ['남해', '청해진 서쪽, 바다가 우는 좁은 물목'], tsushima: ['남해', '신라와 왜 사이의 큰 섬'],
  usan: ['동해', '울산 북동쪽 동해 한가운데 외딴섬'], tumen: ['동해', '발해 염주 남쪽, 큰 강이 바다로 드는 곳'], whaleroad: ['동해', '동해 한복판, 고래가 지나는 길'],
  oki: ['왜의 바다', '이즈모 북쪽 바다의 섬'], goto: ['왜의 바다', '하카타 서남쪽, 당으로 떠나는 왜 배의 마지막 섬들'], iki: ['왜의 바다', '하카타와 대마도 사이의 섬'], okinoshima: ['왜의 바다', '현해탄 한가운데 신의 섬'], noto: ['왜의 바다', '왜의 북쪽 바다 끝 곶'],
  yangtze: ['당의 바다', '양주 동쪽, 바다가 누렇게 변하는 곳'], putuo: ['당의 바다', '명주 앞바다 관음보살의 섬'], yizhou: ['당의 바다', '복주 동쪽 큰 섬의 북쪽 끝'],
  yaku: ['남쪽 바다', '규슈 남쪽, 천 년 삼나무의 섬'], tokara: ['남쪽 바다', '구름 숲 섬과 아마미 사이 화산섬들'], kuroshio: ['남쪽 바다', '남쪽 바다 한복판, 물이 검고 빠른 곳'], miyako: ['남쪽 바다', '유구 남서쪽 끝 낮은 섬'], yonaguni: ['남쪽 바다', '이주 동쪽 바다 밑 돌계단'] };
const REGIONS = ['서해', '남해', '동해', '왜의 바다', '당의 바다', '남쪽 바다'];
const FINDS = FINDS_LL.map(([id, name, lon, lat, fame, gold, text, fx]) => { const [x, y] = P(lon, lat); return { id, name, x, y, fame, gold, text, fx, region: (FIND_META[id] || ['남해'])[0], hint: (FIND_META[id] || ['', ''])[1] }; });

/* 해적 해역 */
const ZONES = [
  { id: 'west', name: '서해 섬 해적', ...(([x, y]) => ({ x, y }))(P(124.3, 35.4)), r: 125 },
  { id: 'strait', name: '대마 해협 해적', ...(([x, y]) => ({ x, y }))(P(129.35, 34.42)), r: 72 },
  { id: 'zhoushan', name: '주산 군도 해적', ...(([x, y]) => ({ x, y }))(P(122.7, 30.5)), r: 70 }
];
const HARBOR = 42; /* 항구 바로 앞은 해적이 못 들어온다 */
const zoneR = z => z.r * (S && S.news && S.news.some(n => n.zone === z.id && n.e > S.t) ? 1.4 : 1);
const inZone = (x, y) => { const z = ZONES.find(z => Math.hypot(z.x - x, z.y - y) < zoneR(z)); if (!z) return null; for (const k in PORTS) if (Math.hypot(PORTS[k].x - x, PORTS[k].y - y) < HARBOR) return null; return z; };

const SHIPS = [
  { name: '어선', slots: 3, hull: 100, spd: 1.0, price: 0, tax: 0 },
  { name: '중선', slots: 5, hull: 140, spd: 1.06, price: 14000, tax: 150 },
  { name: '대선', slots: 7, hull: 200, spd: 1.12, price: 42000, tax: 300 },
  { name: '누선', slots: 10, hull: 280, spd: 1.16, price: 110000, tax: 450 }
];
/* 같은 급에 두 가지: 넓은 배(칸 그대로)·빠른 배(칸 하나 덜, 1할 빠름, 선체 조금 약함). tax = 입항할 때마다 내는 입항세(큰 배일수록). 큰 배는 해적 눈에도 더 띈다 */
const SHIP_VARS = { wide: { name: n => n, slots: 0, spd: 0, hull: 0 }, fast: { name: n => '빠른 ' + n, slots: -1, spd: .1, hull: -.1 } };
function shipOf(tier, v) { const b = SHIPS[tier]; if (!b) return null; const V = SHIP_VARS[v] || SHIP_VARS.wide; return { tier, v: V === SHIP_VARS.fast ? 'fast' : 'wide', name: V.name(b.name), slots: Math.max(2, b.slots + V.slots), hull: Math.round(b.hull * (1 + V.hull)), spd: b.spd + V.spd, price: b.price, tax: b.tax }; }

const CAPTAINS = {
  gungbok: { name: '궁복', title: '청해진의 무장', start: 'cheonghae', gold: 5000, perk: '백병전 피해 +25%', unlock: null, rumors: [['jeoksan', 'ginseng'], ['hakata', 'silk']] },
  ara: { name: '아라', title: '적산 신라방의 상인', start: 'jeoksan', gold: 5000, perk: '소문이 반값이고 헛소문을 걸러 듣는다', unlock: '상납을 네 번(한 해) 해내면 열린다', rumors: [['cheonghae', 'silk'], ['yangzhou', 'ginseng']] },
  tomo: { name: '도모', title: '하카타의 밀무역상', start: 'hakata', gold: 8000, perk: '경계가 절반만 오른다. 신라 조정에는 바칠 수 없고, 대신 다자이후 관리에게 뇌물을 쓴다', unlock: '결말을 하나 보거나 상납을 여섯 번 해내면 열린다', rumors: [['ulsan', 'sulfur'], ['gimhae', 'sulfur']], knows: ['naniwa'] }
};

const CREW = [
  { k: 'helm', name: '곽', role: '도사공', appear: 20, ask: '죽기 전에 동해 한가운데 우산도를 한 번 보고 싶소.', hint: '울산 북동쪽 바다, 우산도를 찾는다', flag: 'usan', perk: '폭풍을 먼저 읽는다. 피항이 반나절로 끝난다.',
    done: '곽이 우산도 쪽으로 오래 절을 했다. 아버지가 그 바다에서 돌아오지 않았다고 한다. 그날부터 곽은 폭풍을 먼저 읽는다.' },
  { k: 'deck', name: '범이', role: '갑판장', appear: 50, ask: '해적선 한 척, 내 손으로 잡게 해주쇼. 형님 원수요.', hint: '해적과 싸워 이긴다', flag: 'pirateWin', perk: '백병전 피해 +30%. 그리고 당신 방문 앞에서 잔다.',
    done: '해적선 갑판에서 범이가 한참을 울었다. "이제 됐소." 그날부터 범이는 당신 방문 앞에서 잔다.' },
  { k: 'tongue', name: '아사', role: '통역', appear: 95, ask: '나니와에 동생이 있어요. 십 년을 못 봤어요.', hint: '왜의 동쪽 끝, 나니와에 입항한다', flag: 'naniwa', perk: '입항할 때마다 동생의 편지로 정확한 소식을 듣는다.',
    done: '아사가 포구로 달려 나갔다. 저녁에 돌아온 눈이 붉었다. "동생이 상인 일을 해요. 앞으로 소식은 걱정 마세요."' }
];

/* 상납: 계절 끝마다 청해진 군자금. 둘째 해에 크게 오르고(grow), 셋째 해부터는 해마다 growLate만큼만 오른다.
   어떤 배로도 못 버는 액수는 내지 않는다: 지금 배의 상자 칸 × 1,800냥 × 6이 상한. 판은 열두 번째 상납(세 해)에서 끝난다(QUOTA_END). */
const QUOTA_BASE = [4000, 10000, 20000, 34000], QUOTA_END = 12;
const quotaCap = () => ship().slots * 1800 * 6;
function quotaFor(n) { const y = Math.floor(n / 4), D = dif(); const g = y === 0 ? 1 : D.grow * Math.pow(D.growLate, y - 1);
  return Math.min(S ? quotaCap() : 1e9, Math.round(QUOTA_BASE[n % 4] * D.quota * g / 100) * 100); }
const quotaCurve = () => Array.from({ length: 4 }, (_, i) => ({ n: S.quotaN + i, season: SEASONS[(S.quotaN + i + 1) % 4], amount: quotaFor(S.quotaN + i) })); // 다음 네 번의 상납(곡선 표)

/* 난이도 — 새 판을 열 때 고르고 저장에 남는다(S.diff). 난이도에 따른 숫자는 이 표에서만 고친다.
   hp·atk  적선 체력·공격 배수            boss   두목 체력에 한 번 더 곱한다
   punish  예고된 큰 수(일제 사격·갈고리·들이받기)를 받아내지 않고 그대로 맞을 때 피해 배수
   quota   상납 기본 곡선 배수            grow   둘째 해 상납 배수      growLate  셋째 해부터 해마다 곱하는 배수
   share   상납 하한 = 가진 돈과 짐(산 값)과 배 값 절반의 이 비율. 0이면 없음
   loot    해전 전리품 배수               debts  상납을 못 낸 채 빚으로 넘길 수 있는 횟수(연속)
   fake    선술집 소문이 헛소문일 확률     blacks 흑기 해적선 수        stormX 태풍철 폭풍 가중      hints 해전에서 받아내는 수를 늘 짚어 준다 */
const DIFFS = {
  baram:    { name: '바람', ch: '風', sub: '쉬움', text: '처음 바다에 나서는 사람에게. 상납을 두 번까지 빚으로 넘길 수 있고, 해전에서 받아내는 수를 늘 짚어 준다. 적의 예고를 놓쳐도 덜 아프다.', hp: 1.2, atk: 1.25, boss: 1, punish: 1.9, quota: 1, grow: 2.6, growLate: 1.4, share: 0, loot: 1, debts: 2, fake: .16, blacks: 1, stormX: 1, hints: true },
  pungrang: { name: '풍랑', ch: '浪', sub: '보통', text: '적의 다음 수를 읽어야 이긴다. 상납을 못 내면 한 번은 빚으로 넘어가지만, 두 번 연속이면 끝이다.', hp: 1.3, atk: 1.4, boss: 1, punish: 2.2, quota: 1.1, grow: 3, growLate: 1.5, share: 0, loot: 1, debts: 1, fake: .16, blacks: 1, stormX: 1, hints: false },
  taepung:  { name: '태풍', ch: '颱', sub: '어려움', text: '적이 단단하고 사납다. 흑기 해적선이 두 척이고, 태풍철엔 폭풍이 배로 잦고, 소문 셋 중 하나는 헛소문이다. 상납은 가진 재산의 3할보다 적지 않다.', hp: 1.4, atk: 1.55, boss: 1.05, punish: 2.6, quota: 1.25, grow: 3.1, growLate: 1.6, share: .3, loot: .9, debts: 1, fake: .3, blacks: 2, stormX: 2, hints: false }
};
const DIFF_NEW = 'pungrang', DIFF_OLD = 'baram'; // 새 판의 기본값 / 난이도가 없던 옛 저장은 바람으로 읽는다
const dif = () => DIFFS[S && S.diff] || DIFFS[DIFF_OLD];

/* 특권 카드 */
const BOONS = [
  { id: 'hold', name: '큰 선창', ch: '艙', text: '상자 칸이 하나 는다.', max: 2 },
  { id: 'haggle', name: '흥정꾼', ch: '價', text: '모든 항구에서 팔 때 8% 더 받는다.', max: 3 },
  { id: 'bargain', name: '값 깎기', ch: '減', text: '모든 항구에서 살 때 8% 덜 낸다.', max: 3 },
  { id: 'charm', name: '순풍 부적', ch: '風', text: '역풍과 옆바람에서 덜 느려진다.', max: 2 },
  { id: 'sails', name: '새 돛', ch: '帆', text: '항해가 12% 빨라진다.', max: 2 },
  { id: 'clerk', name: '장부꾼', ch: '簿', text: '소문이 반값이고 틀리지 않는다.', max: 1 },
  { id: 'hunter', name: '해적 사냥꾼', ch: '劍', text: '해전에서 활과 백병 피해 +30%, 전리품이 두 배다.', max: 1 },
  { id: 'hull', name: '튼튼한 이물', ch: '堅', text: '선체 최대치 +40, 수리비 절반.', max: 2 },
  { id: 'tang', name: '신라방 연줄', ch: '唐', text: '당 항구에서 팔 때 15% 더 받는다.', max: 1 },
  { id: 'wa', name: '왜 상인 연줄', ch: '倭', text: '왜와 남도 항구에서 팔 때 15% 더 받는다.', max: 1 },
  { id: 'court', name: '조정의 눈감음', ch: '默', text: '경계가 40% 덜 오른다.', max: 1 },
  { id: 'chart', name: '옛 해도', ch: '圖', text: '아직 못 찾은 항구 가운데 가장 가까운 곳의 위치가 해도에 드러난다.', max: 2 },
  { id: 'letters', name: '비둘기 편지', ch: '鴿', text: '입항할 때마다 정확한 소식 하나를 공짜로 듣는다.', max: 1 },
  { id: 'relief', name: '군자금 감면', ch: '赦', text: '다음 상납금이 25% 준다.', max: 9 }
];

const RANKS = [[0, '뱃사공'], [300, '선주'], [900, '상단주'], [1800, '대상(大商)'], [3000, '해상왕']]; // 명성 기준
const RIVALS = [
  { id: 'wang', name: '왕씨 상단', ch: '王', col: '#8a3a2a', home: 'yangzhou', kind: 'trade', known: ['jeoksan', 'deungju', 'yangzhou', 'mingzhou', 'cheonghae', 'dangeun', 'tamna', 'mizhou', 'chuzhou', 'laizhou', 'hangzhou', 'hoejin'] },
  { id: 'otomo', name: '오토모 배', ch: '大', col: '#2f4f7a', home: 'hakata', kind: 'trade', known: ['hakata', 'ulsan', 'cheonghae', 'mingzhou', 'tamna', 'jeoksan', 'gimhae', 'izumo', 'hangzhou'] },
  { id: 'black', name: '흑기 해적선', ch: '黑', col: '#1e2829', kind: 'pirate' },
  { id: 'black2', name: '흑기 해적선', ch: '黑', col: '#1e2829', kind: 'pirate', extra: true } // 태풍에서만 둘째 배가 뜬다(DIFFS.blacks)
];

/* ─────────── 유틸 ─────────── */
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const JO = (w, a, b) => { const c = String(w).charCodeAt(String(w).length - 1) - 0xAC00; if (c < 0 || c > 11171) return b; const j = c % 28; return !j || (a === '으로' && j === 8) ? b : a; };
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
const shipSpeed = () => ship().spd * (1 + .12 * ((S && S.boons.sails) || 0)) * (S && S.relics && S.relics.needle ? 1.08 : 1) * (S && S.flags.kuroshio ? 1.04 : 1) * (S && S.mates && S.mates.includes('hassan') ? 1.06 : 1);
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

function newGame(capId, diff, opt) { opt = opt || {};
  const cap = CAPTAINS[capId] || CAPTAINS.gungbok, home = PORTS[cap.start];
  S = { v: 7, cap: capId, diff: DIFFS[diff] ? diff : DIFF_NEW, t: 0, at: cap.start, x: home.x, y: home.y, mode: 'port', path: null, seg: 0, dest: null, heading: -Math.PI / 2,
    gold: cap.gold, slots: [], tier: 0, shipVar: 'wide', hull: 100, hullMax: 100, threat: 0, fame: 0, stage: 0, debt: 0, debtN: 0, office: {}, share: null, navyUntil: 0, redrew: false, rumorDay: { d: -1, n: 0 }, legacy: null,
    markets: {}, booms: [], nextBoom: 4, ledger: {}, rumors: [], found: {}, docked: { [cap.start]: 1 },
    known: Object.fromEntries(PORT_IDS.map(k => [k, !PORTS[k].hidden || (cap.knows || []).includes(k)])),
    fog: new Array(FOGN).fill(0), reveals: [], crew: CREW.map(c => ({ k: c.k, asked: false, done: false, alive: true })),
    flags: {}, pending: [], voyage: null, ev: null, lastEvDay: 0, boost: 0, combo: 0, season: seasonOf(0),
    quotaN: 0, nextDue: 90, paid: 0, boons: {}, draft: null, relief: 0, orders: [], offers: {}, rivals: [], spotted: {},
    stats: { trades: 0, bestMult: 0, bestTrade: null, profit: 0, voyages: 0, hits: 0, misses: 0, orders: 0, years: 0, season: newSeasonStats(cap.gold, 0), lastSeason: null, life: newSeasonStats(cap.gold, 0), hist: [[0, cap.gold]] }, ended: null,
    stamina: 100, rowing: false, news: [], nextNews: ri(12, 20), passenger: null, store: [], spCD: {}, slow: 0, escort: 0, blessed: 0, freed: 0, special: {},
    maps: [], relics: {}, bounty: null, bOffers: {}, beaten: {}, battle: null, dive: null, quests: {}, qDecl: {}, qNotes: [], regions: {},
    main: { act: 0, started: false, offered: false, flags: {}, visits: {}, paid: {}, vn: 0, base: null }, mates: [], taverns: {}, log: [], ending: null };
  initMarkets(); initRivals();
  for (const k of PORT_IDS) if (S.known[k]) revealCircle(PORTS[k].x, PORTS[k].y, 140);
  for (const [a, b] of [['cheonghae', 'jeoksan'], ['cheonghae', 'hakata'], ['cheonghae', 'ulsan'], ['cheonghae', 'dangeun'], ['jeoksan', 'deungju'], ['jeoksan', 'yangzhou'], ['yangzhou', 'mingzhou'], ['cheonghae', 'tamna'], ['tamna', 'mingzhou'], ['cheonghae', 'hoejin'], ['dangeun', 'hyeolgu'], ['jeoksan', 'laizhou'], ['jeoksan', 'mizhou'], ['mizhou', 'chuzhou'], ['yangzhou', 'hangzhou'], ['ulsan', 'gimhae'], ['mingzhou', 'wenzhou'], ['hakata', 'izumo'], ['ulsan', 'samcheok']]) revealPath(a, b, 75);
  if (S.known.naniwa) { revealPath('hakata', 'naniwa', 60); revealCircle(PORTS.naniwa.x, PORTS.naniwa.y, 100); }
  for (const [k, id] of cap.rumors) { tickMarket(k); S.rumors.push({ k, id, price: sellPrice(k, id), day: -ri(4, 9), src: '소문' }); }
  if (opt.relic && RELICS.some(r => r.id === opt.relic)) { gainRelic(opt.relic); S.legacy = opt.relic; } // 유산: 지난 항해의 유물 하나를 물려받는다
  observe(S.at, false); makeOffer(S.at); makeBounty(S.at, true);
  addMap(1, { near: [home.x, home.y], rmin: 130, rmax: 260, name: '폭풍에 진 신라 배' }); offerQuests(S.at); mainTick();
  return S;
}

/* ─────────── 시장 ─────────── */
function initMarkets() {
  /* 숨은 항구도 기본값은 보통 항구와 같다(want 1.5~1.7). 처음 닻을 내리는 날에만 값이 2.2까지 뛴다(arrive) — 한 번뿐인 횡재 */
  for (const k of PORT_IDS) { const p = PORTS[k], idx = {}, home = {}, fresh = !!p.hidden && !S.known[k];
    for (const g of GOODS) { let v = .85 + Math.random() * .3;
      if (p.prod.includes(g.id)) v = .55 + Math.random() * .15;
      else if (p.want.includes(g.id)) v = fresh ? 1.5 + Math.random() * .2 : 1.3 + Math.random() * .3;
      idx[g.id] = v; home[g.id] = v; }
    const others = GOODS.map(g => g.id).filter(id => !p.prod.includes(id) && !p.want.includes(id)).sort(() => Math.random() - .5).slice(0, 2);
    S.markets[k] = { idx, home, press: {}, plog: [], upd: 0, stock: [...p.prod, ...others] }; }
}
/* 값 압력을 눈에 보이게: 최근 60일 안에 이 항구에 풀린 상자 수(나/경쟁 상단)와 값이 돌아오는 데 걸릴 날 */
function pressInfo(k, id) { const m = S.markets[k]; if (!m) return null; const today = Math.floor(S.t), log = (m.plog || []).filter(e => e.id === id && today - e.d <= 60);
  const me = log.filter(e => e.who === 'me').reduce((a, e) => a + e.n, 0), rival = log.filter(e => e.who !== 'me').reduce((a, e) => a + e.n, 0), p = m.press[id] || 0;
  if (!me && !rival && Math.abs(p) < .03) return null; const days = p > .03 ? Math.ceil(Math.log(.03 / p) / Math.log(.965)) : 0;
  return { me, rival, days, press: p, who: log.filter(e => e.who !== 'me').map(e => e.who)[0] || null }; }
function pressLog(k, id, who, n) { const m = S.markets[k]; if (!m) return; m.plog = m.plog || []; m.plog.push({ d: Math.floor(S.t), id, who, n }); if (m.plog.length > 60) m.plog.splice(0, m.plog.length - 60); }
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
function sellBonus(k) { const b = S.boons; let m = 1 + .08 * (b.haggle || 0); if (b.tang && natOf(k) === '당') m += .15; if (S.main && S.main.flags.allyBonus && natOf(k) === '당') m += .08; if (b.wa && (natOf(k) === '왜' || natOf(k) === '남도')) m += .15; if (S.share === k) m += .1; // 항구 지분
  for (const n of liveNews()) { if (n.festival === k) m *= n.fmult; if (n.tax && natOf(k) === n.tax) m *= .9; } return m * (S._bonus || 1) * (hasMate('trader') ? 1.04 : 1); }
const rawPrice = (k, id) => Math.max(1, Math.round(G[id].base * S.markets[k].idx[id]));
const buyPrice = (k, id) => Math.max(1, Math.round(rawPrice(k, id) * (1 - .08 * (S.boons.bargain || 0))));
const sellPrice = (k, id) => Math.max(1, Math.round(rawPrice(k, id) * .93 * sellBonus(k)));
const pctOf = (k, id) => Math.round(S.markets[k].idx[id] * 100);
function topDemand(k, n) { const m = S.markets[k]; return GOODS.map(g => g.id).filter(id => !m.stock.includes(id)).sort((a, b) => m.idx[b] - m.idx[a]).slice(0, n); }
function observe(k, all) { const m = tickMarket(k), p = {}, b = {}; const ids = all ? GOODS.map(g => g.id) : [...m.stock, ...topDemand(k, 4), ...S.slots.map(s => s.id)];
  for (const id of new Set(ids)) p[id] = sellPrice(k, id); for (const id of m.stock) b[id] = buyPrice(k, id); S.ledger[k] = { day: Math.floor(S.t), p, b, src: '본 값' }; }
function infoFor(k, id) { let best = null; const L = S.ledger[k]; if (L && L.p[id] != null) best = { price: L.p[id], day: L.day, src: L.src };
  for (const r of S.rumors) if (r.k === k && r.id === id && (!best || r.day > best.day)) best = { price: r.price, day: r.day, src: r.src, fake: r.fake }; return best; }
const ago = d => { const a = Math.floor(S.t) - d; return a <= 0 ? '오늘' : `${a}일 전`; };

/* ─────────── 세상 소식 ─────────── */
const NEWS = [
  { id: 'plague', w: 2, when: () => true, make: () => { const k = pick(PORT_IDS.filter(k => S.known[k] && k !== S.at && k !== 'cheonghae' && k !== S.dest)); return k && { title: `${PORTS[k].name}에 역병`, text: `${PORTS[k].name} 포구가 문을 닫았다. 스무 날 동안 배를 받지 않는다.`, closed: k, k, days: 20 }; } },
  { id: 'envoy', w: 2, when: () => true, make: () => ({ title: '견당사가 돌아왔다', text: '왜의 사신단이 하카타에 닿았다. 비단과 향료라면 값을 따지지 않는다.', k: 'hakata', booms: [['hakata', 'silk', 2.3], ['hakata', 'spice', 2.0]], days: 35 }) },
  { id: 'harvest', w: 2, when: () => true, make: () => ({ title: '신라 인삼 대풍', text: '올해 인삼이 넘쳐난다. 청해진과 당은포 인삼 값이 반 토막 났다.', k: 'cheonghae', booms: [['cheonghae', 'ginseng', .5], ['dangeun', 'ginseng', .5]], days: 30 }) },
  { id: 'feast', w: 1, when: () => true, make: () => ({ title: '서라벌 팔관회', text: '울산 포구가 잔치판이다. 무엇을 가져가든 2할 5푼을 더 쳐준다.', k: 'ulsan', festival: 'ulsan', fmult: 1.25, days: 25 }) },
  { id: 'pirates', w: 2, when: () => true, make: () => { const z = pick(ZONES); return { title: `${z.name} 기승`, text: `${z.name}${JO(z.name,'이','가')} 세를 불렸다. 해적 해역이 넓어졌다.`, zone: z.id, days: 30 }; } },
  { id: 'typhoon', w: 3, when: () => seasonOf(S.t) === 2 || seasonOf(S.t) === 3, make: () => ({ title: '태풍이 올라온다', text: '남쪽에서 큰 바람이 올라온다. 보름 동안 바다 어디서든 폭풍을 만나기 쉽다.', storm: true, days: 15 }) },
  { id: 'persia', w: 2, when: () => S.known.quanzhou, make: () => ({ title: '파사 상선 입항', text: '천주에 페르시아 큰 배가 들어왔다. 향료는 남아돌고, 사금을 찾는다.', k: 'quanzhou', booms: [['quanzhou', 'spice', .5], ['quanzhou', 'gold', 1.8]], days: 40 }) },
  { id: 'wedding', w: 1, when: () => true, make: () => ({ title: '왕실 혼례', text: '신라 왕실에 혼례가 잡혔다. 울산이 비단과 야광패를 찾는다.', k: 'ulsan', booms: [['ulsan', 'silk', 2.2], ['ulsan', 'shell', 2.4]], days: 30 }) },
  { id: 'goldrush', w: 1, when: () => true, make: () => ({ title: '무쓰에서 금이 났다', text: '왜의 동북에서 사금이 쏟아진다. 하카타와 나니와 사금 값이 무너졌다.', k: 'hakata', booms: [['hakata', 'gold', .5], ['naniwa', 'gold', .5]], days: 35 }) },
  { id: 'luxury', w: 2, when: () => true, make: () => ({ title: '장안의 사치 바람', text: '당 귀족들이 향료와 담비가죽에 빠졌다. 양주와 등주가 값을 올린다.', k: 'yangzhou', booms: [['yangzhou', 'spice', 1.9], ['deungju', 'fur', 2.1]], days: 35 }) },
  { id: 'rfest', w: 1, when: () => S.known.ryukyu, make: () => ({ title: '유구 왕의 축제', text: '유구 섬에 축제가 열렸다. 무엇이든 3할을 더 쳐준다.', k: 'ryukyu', festival: 'ryukyu', fmult: 1.3, days: 25 }) },
  { id: 'cold', w: 3, when: () => seasonOf(S.t) === 0 || seasonOf(S.t) === 3, make: () => ({ title: '혹한', text: '북쪽 바다가 얼어붙는다. 신라와 당 북쪽 포구가 담비가죽을 찾는다.', k: 'dangeun', booms: [['dangeun', 'fur', 1.8], ['jeoksan', 'fur', 1.9], ['cheonghae', 'fur', 1.7]], days: 30 }) },
  { id: 'strife', w: 1, when: () => S.threat >= 20, make: () => ({ title: '조정의 왕위 다툼', text: '서라벌이 왕위 다툼으로 들끓는다. 아무도 바다를 보지 않는다. 경계 -20', threat: -20, days: 20 }) },
  { id: 'tax', w: 1, when: () => true, make: () => ({ title: '당의 상세 인상', text: '당이 외국 상인에게 세금을 올렸다. 당 항구에서 팔 때 1할을 덜 받는다.', tax: '당', days: 30 }) }
];
function liveNews() { return S && S.news ? S.news.filter(n => n.e > S.t) : []; }
const isClosed = k => liveNews().some(n => n.closed === k);
function restage() { S.stage = S.threat >= 85 ? 3 : S.threat >= 60 ? 2 : S.threat >= 30 ? 1 : 0; }
function spawnNews() {
  const live = new Set(liveNews().map(n => n.id)); const bag = []; for (const d of NEWS) if (!live.has(d.id) && d.when()) for (let i = 0; i < d.w; i++) bag.push(d);
  if (!bag.length) return null; const def = pick(bag), m = def.make(); if (!m) return null;
  const s = Math.floor(S.t), e = s + (m.days || 30); const n = { id: def.id, title: m.title, text: m.text, s, e, k: m.k || null };
  for (const f of ['closed', 'festival', 'fmult', 'tax', 'zone', 'storm']) if (m[f] != null) n[f] = m[f];
  for (const [k, id, mul] of (m.booms || [])) { tickMarket(k); S.booms.push({ k, id, m: mul, s, e, slump: mul < 1, news: def.id }); const mk = S.markets[k]; mk.idx[id] = clamp(mk.idx[id] * (1 + (mul - 1) * .6), .25, 3.2);
    if (S.known[k]) S.rumors.push({ k, id, price: sellPrice(k, id), day: s, src: '소식' }); }
  if (S.rumors.length > 40) S.rumors.splice(0, S.rumors.length - 40);
  if (m.threat) { S.threat = clamp(S.threat + m.threat, 0, 100); restage(); }
  S.news.push(n); S.news = S.news.filter(x => x.e > S.t - 3); return n; }
function newsTick() { const out = []; if (S.nextNews == null) S.nextNews = Math.floor(S.t) + ri(12, 20);
  while (S.t >= S.nextNews) { const n = spawnNews(); S.nextNews += ri(16, 28); if (n) out.push({ type: 'news', news: n }); }
  if (S.bounty && S.t > S.bounty.due) { const b = S.bounty; S.bounty = null; S.fame = Math.max(0, S.fame - 10); out.push({ type: 'bountyLost', bounty: b }); }
  if (S.passenger && S.t > S.passenger.due) { const p = S.passenger; S.passenger = null; S.fame = Math.max(0, S.fame - 15); out.push({ type: 'passengerLost', passenger: p }); }
  return out; }

/* ─────────── 매매 ─────────── */
const ship = () => shipOf(S.tier, S.shipVar);
const capacity = () => ship().slots + (S.boons.hold || 0);
const freeSlots = () => capacity() - S.slots.length;
const cratePrice = (k, id) => buyPrice(k, id) * LOT;
function buy(id) { const k = S.at; if (!k || S.mode !== 'port') return { ok: false, msg: '항구에서만 살 수 있다' }; tickMarket(k);
  if (!freeSlots()) return { ok: false, msg: '선창이 가득 찼다' }; const cost = cratePrice(k, id); if (S.gold < cost) return { ok: false, msg: '돈이 모자란다' };
  S.gold -= cost; S.slots.push({ id, cost, from: k }); const m = S.markets[k]; m.idx[id] = clamp(m.idx[id] * (1 + LOT / 300), .25, 3.2); m.press[id] = (m.press[id] || 0) - LOT / 600;
  return { ok: true, cost }; }
function sell(i) { const k = S.at, s = S.slots[i]; if (!s || !k) return null; tickMarket(k); const m = S.markets[k];
  const pct0 = pctOf(k, s.id), unit = sellPrice(k, s.id), rev = unit * LOT; const profit = rev - s.cost, mult = s.cost > 0 ? rev / s.cost : 3;
  m.idx[s.id] = clamp(m.idx[s.id] * (1 - LOT / 300), .25, 3.2); m.press[s.id] = (m.press[s.id] || 0) + LOT / 200; pressLog(k, s.id, 'me', 1);
  S.slots.splice(i, 1); S.gold += rev; S.stats.trades++; S.stats.profit += profit; acct('trade', profit);
  if (mult > S.stats.bestMult) { S.stats.bestMult = mult; S.stats.bestTrade = `${PORTS[k].name}에서 ${G[s.id].name} ×${mult.toFixed(1)}`; }
  let th = 0; if (profit > 0) { S.combo++; th = Math.min(6, profit / 5000); addThreat(th); S.fame += Math.min(25, Math.round(profit / 600)); } else S.combo = 0;
  if (S.ledger[k]) S.ledger[k].p[s.id] = sellPrice(k, s.id);
  return { id: s.id, rev, profit, mult, pct0, pct1: pctOf(k, s.id), threat: th, combo: S.combo }; }
/* 팔기 전에 미리 본다: sell()과 똑같이 상자마다 값이 3%씩 내려간다. sellAll은 뒤 칸부터 파니 그 순서로 센다. keep = 안 팔 칸 번호 */
function previewSale(k, keep) { keep = keep || []; const m = S.markets[k]; if (!m) return { items: [], total: 0, rev: 0 }; const idx = Object.assign({}, m.idx), items = new Array(S.slots.length).fill(null); let total = 0, rev = 0;
  for (let i = S.slots.length - 1; i >= 0; i--) { const s = S.slots[i]; if (keep.includes(i)) continue; const unit = Math.max(1, Math.round(Math.max(1, Math.round(G[s.id].base * idx[s.id])) * .93 * sellBonus(k))), r = unit * LOT;
    idx[s.id] = clamp(idx[s.id] * (1 - LOT / 300), .25, 3.2); items[i] = { i, act: r, profit: r - s.cost }; total += r - s.cost; rev += r; }
  return { items, total, rev }; }

/* ─────────── 의뢰 ─────────── */
function makeOffer(k) { if (!k) return; const old = S.offers[k]; if (old && old.until > S.t) return;
  if (Math.random() < .35) { S.offers[k] = { none: true, until: S.t + 25 }; return; }
  const targets = PORT_IDS.filter(x => x !== k && S.known[x] && findPath(PORTS[k].x, PORTS[k].y, PORTS[x].x, PORTS[x].y)); if (!targets.length) return;
  const to = pick(targets); tickMarket(to); const pool = PORTS[to].want.concat(GOODS.map(g => g.id).sort(() => Math.random() - .5).slice(0, 2)).filter(id => !PORTS[to].prod.includes(id)); const id = pick(pool); const n = ri(1, 3); // 목적지에서 나는 물건은 맡기지 않는다
  const dist = pathLen(findPath(PORTS[k].x, PORTS[k].y, PORTS[to].x, PORTS[to].y)); const days = Math.round(dist / 70 + ri(12, 26));
  const reward = Math.round(G[id].base * LOT * n * (1.7 + Math.random() * .5) / 100) * 100;
  S.offers[k] = { id: 'o' + Math.floor(S.t * 100) + k, from: k, to, good: id, n, days, reward, until: S.t + 20 }; }
function acceptOffer(k) { const o = S.offers[k]; if (!o || o.none || S.orders.length >= 2) return null; S.orders.push(Object.assign({}, o, { due: S.t + o.days })); S.offers[k] = { none: true, until: S.t + 20 }; return o; }
function deliverOrders(k) { const done = [];
  for (const o of S.orders.slice()) { if (o.to !== k) continue; const idx = []; S.slots.forEach((s, i) => { if (s.id === o.good && s.from !== o.to && idx.length < o.n) idx.push(i); }); // 그 항구에서 산 물건은 안 쳐준다
    if (idx.length < o.n) continue; const cost = idx.reduce((a, i) => a + S.slots[i].cost, 0); for (const i of idx.reverse()) S.slots.splice(i, 1); S.gold += o.reward; S.fame += 40; S.stats.orders++; acct('order', o.reward - cost); S.orders.splice(S.orders.indexOf(o), 1); done.push(o); }
  return done; }
function expireOrders() { const gone = []; for (const o of S.orders.slice()) if (S.t > o.due) { S.orders.splice(S.orders.indexOf(o), 1); S.fame = Math.max(0, S.fame - 20); gone.push(o); } return gone; }

/* ─────────── 소문 ─────────── */
const rumorCost = () => (S.cap === 'ara' || S.boons.clerk) ? 200 : 400;
const RUMORS_PER_DAY = 3;
const rumorsLeft = () => { const d = Math.floor(S.t); return S.rumorDay && S.rumorDay.d === d ? Math.max(0, RUMORS_PER_DAY - S.rumorDay.n) : RUMORS_PER_DAY; };
function buyRumor() { const c = rumorCost(); if (!rumorsLeft()) return { ok: false, msg: '오늘은 들을 만큼 들었다. 내일 다시.' }; if (S.gold < c) return { ok: false, msg: '돈이 모자란다' }; S.gold -= c; acct('rumor', c);
  { const d = Math.floor(S.t); if (!S.rumorDay || S.rumorDay.d !== d) S.rumorDay = { d, n: 0 }; S.rumorDay.n++; }
  if (Math.random() < .14) { const m = addMap(Math.random() < .3 ? 2 : 1); if (m) return { ok: true, map: m, text: { line: `술 취한 늙은 뱃사람이 낡은 해도를 내민다. "${m.name}… 내가 다시 갈 일은 없지."` } }; }
  return { ok: true, text: makeRumor((S.cap === 'ara' || S.boons.clerk || hasMate('seer')) ? 'true' : 'talk') }; }
function makeRumor(kind) {
  const today = Math.floor(S.t); spawnBooms(today); const known = PORT_IDS.filter(k => S.known[k] && k !== S.at); const roll = Math.random();
  const push = r => { S.rumors.push(r); if (S.rumors.length > 40) S.rumors.shift(); };
  if (kind === 'talk' && roll < dif().fake) { const k = pick(known), id = pick(GOODS.filter(g => !PORTS[k].prod.includes(g.id))).id;
    push({ k, id, price: Math.round(G[id].base * (1.7 + Math.random() * .6) * .93), day: today - ri(3, 12), src: '소문', fake: true });
    return { k, id, line: `${PORTS[k].name}에서 ${G[id].name}${JO(G[id].name,'이라면','라면')} 부르는 게 값이라더군.` }; }
  const live = S.booms.filter(b => b.s <= today && b.e > today && b.k !== S.at);
  if (roll < .7 && live.length) { const b = pick(live);
    if (!S.known[b.k]) { revealCircle(PORTS[b.k].x, PORTS[b.k].y, 40); const P0 = PORTS[S.at] || PORTS.cheonghae; const dx = PORTS[b.k].x - P0.x, dy = PORTS[b.k].y - P0.y;
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? '동' : '서') : (dy > 0 ? '남' : '북');
      return { hint: b.k, line: `아무도 안 가본 ${dir}쪽 먼 포구에서 ${G[b.id].name}${JO(G[b.id].name,'이라면','라면')} 금을 내놓는다더라. — 해도 ${dir}쪽에 희미한 흔적을 그렸다.` }; }
    tickMarket(b.k); const age = ri(3, 14), noise = kind === 'talk' ? 1 + (Math.random() - .5) * .4 : 1, price = Math.round(sellPrice(b.k, b.id) * noise);
    push({ k: b.k, id: b.id, price, day: today - age, src: '소문' });
    return { k: b.k, id: b.id, line: b.slump ? `${PORTS[b.k].name}에 ${G[b.id].name}${JO(G[b.id].name,'이','가')} 남아돈다더군. 똥값이래.` : `${PORTS[b.k].name}에 ${G[b.id].name} 바람이 분다! 부르는 게 값이래.` }; }
  const k = pick(known); tickMarket(k); const id = pick(topDemand(k, 3)), age = ri(4, 20), noise = kind === 'talk' ? 1 + (Math.random() - .5) * .3 : 1, price = Math.round(sellPrice(k, id) * noise);
  push({ k, id, price, day: today - age, src: '소문' });
  return { k, id, line: `${PORTS[k].name}에선 ${G[id].name}${JO(G[id].name,'을','를')} 상자당 ${(price * LOT).toLocaleString('ko-KR')}냥쯤 쳐준다더군.` };
}


/* ─────────── 시세 소식: 지나는 배·뱃사람이 물어 오는 값 움직임 ───────────
   유행이 시작되거나 끝나면 아는 항구 것은 며칠 늦게 소식으로 들어온다(일부는 못 듣고, 가끔은 뜬소문).
   들어온 소식은 소문 장부(S.rumors)에도 적혀 행선지 카드·시세표 값이 된다. */
const WIRE_SRC = ['지나는 배', '뱃사람', '상인 편지', '포구 소문', '객주'];
function wireTick() { const out = [], today = Math.floor(S.t); if (!S.wire) S.wire = { day: today, seen: {}, q: [] }; if (today <= S.wire.day) return out; S.wire.day = today; spawnBooms(today);
  for (const b of S.booms) { const key = b.k + ':' + b.id + ':' + b.s;
    if (b.s <= today && b.e > today && !S.wire.seen[key]) { S.wire.seen[key] = 1; if (S.known[b.k] && Math.random() < .7) S.wire.q.push({ at: b.s + ri(1, 4), kind: b.slump ? 'down' : 'up', k: b.k, id: b.id, pct: Math.round((b.m - 1) * 100), src: pick(WIRE_SRC) }); }
    else if (b.e <= today && S.wire.seen[key] === 1) { S.wire.seen[key] = 2; if (S.known[b.k] && Math.random() < .55) S.wire.q.push({ at: today + ri(0, 3), kind: b.slump ? 'up' : 'down', end: true, k: b.k, id: b.id, src: pick(WIRE_SRC) }); } }
  for (const key of Object.keys(S.wire.seen)) if (+key.split(':')[2] < today - 140) delete S.wire.seen[key];
  if (Math.random() < .035) { const ks = PORT_IDS.filter(k => S.known[k] && k !== S.at); if (ks.length) { const k = pick(ks), id = pick(GOODS.filter(g => !PORTS[k].prod.includes(g.id))).id, up = Math.random() < .75;
    S.wire.q.push({ at: today, kind: up ? 'up' : 'down', k, id, pct: up ? ri(50, 110) : -ri(30, 45), src: '뜬소문', fake: true }); } }
  const due = S.wire.q.filter(w => w.at <= today); S.wire.q = S.wire.q.filter(w => w.at > today);
  for (const w of due) { if (!S.known[w.k]) continue; tickMarket(w.k); const m = S.markets[w.k];
    const price = w.fake ? Math.round(G[w.id].base * (1 + w.pct / 100) * .93) : Math.round(G[w.id].base * m.home[w.id] * boomMult(w.k, w.id, today) * .93 * sellBonus(w.k));
    S.rumors.push({ k: w.k, id: w.id, price, day: today, src: w.src, fake: !!w.fake }); if (S.rumors.length > 60) S.rumors.splice(0, S.rumors.length - 60);
    out.push({ type: 'wire', w: Object.assign({}, w, { day: today, price: price * LOT, hold: S.slots.some(x => x.id === w.id), dest: S.dest === w.k }) }); }
  return out; }

/* ─────────── 경쟁자 ─────────── */
function initRivals() { S.rivals = RIVALS.filter(r => !r.extra || dif().blacks >= 2).map(r => { if (r.kind === 'pirate') { const z = pick(ZONES); return { id: r.id, x: z.x, y: z.y, zone: z.id, tx: z.x, ty: z.y, heading: 0, cool: 0 }; }
  const h = PORTS[r.home]; return { id: r.id, at: r.home, x: h.x, y: h.y, path: null, seg: 0, dest: null, good: null, wait: ri(2, 8), heading: 0, last: null }; }); }
function rivalPlan(R, def) { tickMarket(R.at); let best = null;
  for (const id of S.markets[R.at].stock) { const bp = rawPrice(R.at, id); for (const d of def.known) { if (d === R.at) continue; tickMarket(d); const g = rawPrice(d, id) * .93 - bp; const score = g * (.8 + Math.random() * .4) * (def.id === 'wang' && d === S.dest && S.main && S.main.flags.wangEnemy ? 1.6 : 1); // wangEnemy(빚 문서를 찢음): 왕씨는 내 행선지를 골라 값을 누른다
      if (!best || score > best.score) best = { id, d, score }; } }
  if (!best) best = { id: null, d: pick(def.known.filter(x => x !== R.at)) };
  const p = findPath(R.x, R.y, PORTS[best.d].x, PORTS[best.d].y); if (!p) { R.wait = 5; return; }
  if (best.id) { const m = S.markets[R.at]; m.press[best.id] = (m.press[best.id] || 0) - .12; m.idx[best.id] = clamp(m.idx[best.id] * 1.1, .25, 3.2); }
  R.path = p; R.seg = 0; R.dest = best.d; R.good = best.id; R.at = null; }
function updateRivals(dt) {
  const out = [];
  for (const R of S.rivals) { const def = RIVALS.find(r => r.id === R.id);
    if (def.kind === 'pirate') { const z = ZONES.find(z => z.id === R.zone); const dP = Math.hypot(S.x - R.x, S.y - R.y);
      const near = S.mode === 'sail' && S.tier >= 1 && R.cool <= 0 && !(S.voyage && S.voyage.escort) && Math.hypot(S.x - z.x, S.y - z.y) < zoneR(z) + 90 && dP < (R.chasing ? 210 : 150); // 어선은 쫓지 않는다
      if (near && !R.chasing) { R.chasing = true; out.push({ type: 'chase' }); }
      if (!near && R.chasing) { R.chasing = false; R.cool = Math.max(R.cool, 8); if (S.mode === 'sail') { S.fame += 10; out.push({ type: 'escaped' }); } }
      if (near) { R.tx = S.x; R.ty = S.y; } else if (Math.hypot(R.tx - R.x, R.ty - R.y) < 6) { const a = Math.random() * 7, rr = Math.random() * z.r * .85; R.tx = z.x + Math.cos(a) * rr; R.ty = z.y + Math.sin(a) * rr; if (Math.random() < .03) { const nz = pick(ZONES); R.zone = nz.id; } }
      const d = Math.hypot(R.tx - R.x, R.ty - R.y), sp = (near ? 112 : 55) * dt; if (d > .1) { const m = Math.min(1, sp / d); const nx = R.x + (R.tx - R.x) * m, ny = R.y + (R.ty - R.y) * m; if (seaAt(nx, ny)) { R.heading = Math.atan2(R.ty - R.y, R.tx - R.x); R.x = nx; R.y = ny; } else { R.tx = z.x; R.ty = z.y; } }
      R.cool -= dt; if (S.mode === 'sail' && R.chasing && R.cool <= 0 && Math.hypot(S.x - R.x, S.y - R.y) < 16 && !PORT_IDS.some(k => Math.hypot(PORTS[k].x - S.x, PORTS[k].y - S.y) < HARBOR)) { R.cool = 25; R.chasing = false; out.push({ type: 'ambush' }); }
      continue; }
    if (R.at) { R.wait -= dt; if (R.wait <= 0) rivalPlan(R, def); continue; }
    let rem = dt; while (rem > 0 && R.path) { const [tx, ty] = R.path[R.seg + 1] || R.path[R.path.length - 1]; const dir = Math.atan2(ty - R.y, tx - R.x); R.heading = dir;
      const w = wind(S.t, R.x, R.y), spd = BASE_KMD * .95 * Math.min(1.05, w.str) * windFactor(angDiff(dir, w.dir) * 180 / Math.PI); let d = spd * Math.min(rem, .25); rem -= .25;
      const L = Math.hypot(tx - R.x, ty - R.y); if (d >= L) { R.x = tx; R.y = ty; R.seg++; if (R.seg >= R.path.length - 1) { // 도착: 판다
          const k = R.dest; R.at = k; R.path = null; R.wait = ri(2, 6); if (R.good) { tickMarket(k); const m = S.markets[k]; const guarded = m.guard && m.guard.id === R.good && m.guard.until > S.t; // 경주에서 이겼으면 한 번은 값이 안 눌린다
            if (guarded) m.guard = null; else { m.press[R.good] = (m.press[R.good] || 0) + .3; m.idx[R.good] = clamp(m.idx[R.good] * .78, .25, 3.2); pressLog(k, R.good, def.id, 6); }
            R.last = { k, id: R.good, day: Math.floor(S.t), guarded }; if (S.known[k]) out.push({ type: 'rival', rival: def, k, id: R.good, guarded }); } R.good = null; break; } }
      else { R.x += Math.cos(dir) * d; R.y += Math.sin(dir) * d; } }
  }
  return out;
}

/* ─────────── 경계 · 이야기 ─────────── */
const threatMax = () => (S.office && S.office.letter) ? 70 : 100; // 사략 면허: 경계가 70을 넘지 않는다
function addThreat(v) { S.threat = Math.min(threatMax(), S.threat + v * (S.cap === 'tomo' ? .5 : 1) * (S.boons.court ? .6 : 1) * (S.relics && S.relics.kwanum ? .75 : 1) * (hasMate('shadow') ? .8 : 1)); checkThreat(); }
const crewOf = k => S.crew.find(c => c.k === k);
const perk = k => { const c = crewOf(k); return c && c.alive && c.done; };
function checkThreat() {
  if (S.threat >= 100) { const bum = crewOf('deck');
    if (bum.alive && bum.done) { bum.alive = false; S.gold = Math.round(S.gold * .5); S.threat = 45; S.stage = 1; S.pending.push('assassinBlocked'); return; }
    // 바로 죽지 않는다: 다음 항구에서 마지막 선택(재산 절반 · 사람 하나 · 배를 버리고 도주)이 기다린다
    S.threat = 99; S.stage = 3; if (!S.pending.includes('lastChoice')) S.pending.push('lastChoice'); return; }
  if (S.threat >= 85 && S.stage < 3) { S.stage = 3; S.pending.push('shadow'); }
  else if (S.threat >= 60 && S.stage < 2) { S.stage = 2; S.pending.push('bounty'); }
  else if (S.threat >= 30 && S.stage < 1) { S.stage = 1; S.pending.push('inspector'); }
}
const canTribute = () => S.mode === 'port' && PORTS[S.at].court && S.cap !== 'tomo';
const tributeCost = () => Math.max(800, Math.round(S.gold * .12));
function tribute() { if (!canTribute()) return null; const c = tributeCost(); if (S.gold < c) return null; S.gold -= c; acct('tribute', c); S.threat = Math.max(0, S.threat - 30); S.fame += 10;
  S.stage = S.threat >= 85 ? 3 : S.threat >= 60 ? 2 : S.threat >= 30 ? 1 : 0; return c; }
/* 도모만: 하카타·나니와에서 다자이후 관리에게 뇌물. 가진 돈의 1할, 경계 -25, 30일에 한 번 */
const canBribe = () => S.cap === 'tomo' && S.mode === 'port' && (S.at === 'hakata' || S.at === 'naniwa');
const bribeCost = () => Math.max(500, Math.round(S.gold * .1 / 100) * 100);
const bribeLeft = () => Math.max(0, Math.ceil((S.spCD.bribe || 0) - S.t));
function bribe() { if (!canBribe() || bribeLeft() || S.gold < bribeCost()) return null; const c = bribeCost(); S.gold -= c; acct('tribute', c); S.threat = Math.max(0, S.threat - 25); S.spCD.bribe = S.t + 30; restage(); return c; }
const repairCost = () => Math.round((S.hullMax - S.hull) * 25 * (S.boons.hull ? .5 : 1) * (S.at === 'mingzhou' && S.mode === 'port' ? .5 : 1) * (hasMate('carpenter') ? .6 : 1));
function repair() { const c = repairCost(); if (!c || S.gold < c) return null; S.gold -= c; acct('repair', c); S.t += Math.ceil((S.hullMax - S.hull) / 40) * .5; S.hull = S.hullMax; return c; }
const nextShip = v => shipOf(S.tier + 1, v || S.shipVar);
/* 배를 바꿀 때 넓은 배(wide, 칸 그대로)와 빠른 배(fast, 칸 하나 덜·1할 빠름) 중 고른다 */
function upgrade(variant) { const v = SHIP_VARS[variant] ? variant : 'wide', n = shipOf(S.tier + 1, v); const pr = shipPrice(n); if (!n || S.gold < pr) return null; S.gold -= pr; acct('ship', pr); S.tier++; S.shipVar = v; S.hullMax = n.hull + 40 * (S.boons.hull || 0) + (S.relics.anchor ? 30 : 0) + (hasMate('carpenter') ? 20 : 0); S.hull = S.hullMax; S.fame += 30; S.t += 3; return n; }

/* ─────────── 항구마다 고유한 곳 ─────────── */
const SPECIALS = {
  cheonghae: { name: '청해진 창고', ch: '庫', kind: 'store', desc: '상자를 맡겨 둔다. 해적도 상납 압류도 손대지 못한다. 최대 4상자.' },
  dangeun: { name: '당은포 수군', ch: '軍', kind: 'escort', cost: 1500, desc: '수군 배가 다음 항해를 호위한다. 해적이 붙지 않는다.' },
  ulsan: { name: '왕실 납품', ch: '王', kind: 'royal', cd: 30, desc: '비단 · 야광패 · 향료 · 사금 중 한 상자를 시세의 1.4배에 왕실로 넘긴다. 경계 +6' },
  tamna: { name: '해녀의 물질', ch: '海', kind: 'diver', cd: 25, desc: '해녀들을 따라 얕은 바다에 들어가 진주와 야광패를 건진다. 숨이 닿는 데까지.' },
  jeoksan: { name: '법화원', ch: '寺', kind: 'temple', cost: 300, cd: 20, desc: '시주하고 순항을 빈다. 다음 항해에 폭풍과 용오름이 비켜 가고, 스님이 소식 하나를 일러준다.' },
  deungju: { name: '신라 객주', ch: '客', kind: 'inn', cd: 20, desc: '등주 신라방 객주가 동포에게 정확한 소식 두 개를 공짜로 준다.' },
  yangzhou: { name: '파사 상인 거리', ch: '胡', kind: 'deal', good: 'gold', mult: .6, n: 2, cd: 30, desc: '페르시아 상인이 사금을 싸게 넘긴다. 두 상자까지.' },
  mingzhou: { name: '명주 조선소', ch: '船', kind: 'yard', desc: '여기서는 배를 2할 5푼 싸게 사고, 수리비가 절반이다.' },
  hakata: { name: '홍려관', ch: '館', kind: 'bulk', cd: 30, desc: '관청이 실은 짐을 한꺼번에 1.15배로 사들인다. 사흘 걸린다.' },
  naniwa: { name: '왕실 도자기 주문', ch: '皇', kind: 'royalOrder', cd: 60, desc: '도자기 두 상자를 60일 안에 가져오면 큰 사례를 한다.' },
  quanzhou: { name: '대식 상선', ch: '食', kind: 'deal', good: 'spice', mult: .35, n: 3, cd: 30, desc: '아랍 큰 배가 향료를 헐값에 푼다. 세 상자까지.' },
  amami: { name: '조개 바꾸기', ch: '換', kind: 'swap', cd: 30, desc: '아무 상자 하나를 야광패 두 상자와 바꿔준다.' },
  ryukyu: { name: '유구 왕의 연회', ch: '宴', kind: 'feast', cd: 30, desc: '하루 머물며 연회에 앉으면 왕이 유황 한 상자를 선물한다. 명성 +30' },
  gimhae: { name: '가야 대장간', ch: '冶', kind: 'deal', good: 'iron', mult: .45, n: 2, cd: 30, desc: '옛 가야의 대장장이들이 덩이쇠를 헐값에 넘긴다. 두 상자까지.' },
  laizhou: { name: '서적 거리', ch: '書', kind: 'deal', good: 'books', mult: .5, n: 2, cd: 30, desc: '과거 낙방생들이 내놓은 책 더미. 두 상자까지 싸게.' },
  chuzhou: { name: '초주 신라방', ch: '客', kind: 'inn', cd: 20, desc: '운하 끝 신라 사람들 마을. 동포에게 정확한 소식 두 개를 공짜로 준다.' },
  hangzhou: { name: '서호 찻집', ch: '茶', kind: 'deal', good: 'tea', mult: .35, n: 3, cd: 30, desc: '햇차를 상자째 헐값에. 세 상자까지.' },
  izumo: { name: '이즈모 대사', ch: '社', kind: 'temple', cost: 300, cd: 20, desc: '신들이 모이는 신사. 다음 항해에 폭풍과 용오름이 비켜 가고, 신관이 소식 하나를 일러준다.' },
  tsuruga: { name: '송원관', ch: '館', kind: 'deal', good: 'fur', mult: .5, n: 2, cd: 30, desc: '발해 사신을 맞는 객관. 사신단이 남긴 담비가죽을 넘긴다.' },
  yeomju: { name: '발해 모피 시장', ch: '貂', kind: 'deal', good: 'fur', mult: .45, n: 2, cd: 30, desc: '발해 사냥꾼이 담비가죽을 직접 판다. 두 상자까지.' }
};
const STORE_MAX = 4; const storeMax = () => STORE_MAX + (S.main && S.main.flags.cheonghaeTrust ? 1 : 0) + (S.office && S.office.store8 ? 4 : 0); // cheonghaeTrust(청해진 수군장에게 솔직히 답함): 창고 한 칸 더 · 관아 창고 확장 +4
const shipPrice = n => { n = n || nextShip(); return n ? Math.round(n.price * (S.at === 'mingzhou' && S.mode === 'port' ? .75 : 1)) : 0; };
const dealPrice = (sp, k) => Math.round(G[sp.good].base * LOT * sp.mult * (S.flags['deal_' + (k || S.at)] ? .5 : 1) / 10) * 10;
const escortCost = () => Math.round(1500 * (1 - Math.min(.5, S.fame / 4000)) / 100) * 100; // 명성이 높으면 수군이 값을 깎아 준다(최대 반값)
/* 청해진 관아 — 돈 쓸 곳. 창고 확장 · 수군 상시 호위 계약(한 계절) · 사략 면허(경계 상한 70). 항구 지분은 어느 항구에서든 그 항구 것을 산다 */
const OFFICE = [
  { id: 'store8', name: '창고 확장', ch: '庫', cost: 20000, desc: '청해진 창고가 네 칸 는다.', once: true },
  { id: 'navy', name: '수군 호위 계약', ch: '軍', cost: 10000, desc: '이번 계절이 끝날 때까지 모든 항해에 수군이 따라붙는다. 해적이 붙지 않는다.' },
  { id: 'letter', name: '사략 면허', ch: '許', cost: 15000, desc: '조정이 눈을 감는다. 경계가 70을 넘지 않고, 그림자도 자객도 오지 않는다.', once: true },
  { id: 'share', name: '항구 지분', ch: '株', cost: 30000, desc: '이 항구 상단의 지분을 산다. 여기서 팔 때 1할을 더 받고 입항세를 안 낸다. 한 곳만.', once: true, anywhere: true }
];
function officeInfo() { const at = S.at; return OFFICE.filter(o => o.anywhere ? at && at !== 'cheonghae' : at === 'cheonghae').map(o => { const have = o.id === 'navy' ? S.navyUntil > S.t : o.id === 'share' ? !!S.share : !!S.office[o.id];
  const r = { id: o.id, name: o.name, ch: o.ch, cost: o.cost, desc: o.desc, have, can: !have && S.gold >= o.cost, why: have ? (o.id === 'navy' ? `${Math.ceil(S.navyUntil - S.t)}일 남음` : o.id === 'share' ? `${PORTS[S.share].name} 지분을 이미 가졌다` : '이미 샀다') : S.gold < o.cost ? '돈이 모자란다' : '' };
  if (o.id === 'share' && !have) r.name = `${PORTS[at].name} 지분`; return r; }); }
function buyOffice(id) { const o = OFFICE.find(x => x.id === id), inf = officeInfo().find(x => x.id === id); if (!o || !inf || !inf.can || S.mode !== 'port') return { ok: false, text: inf ? inf.why : '' };
  S.gold -= o.cost; acct('office', o.cost);
  if (id === 'navy') { S.navyUntil = S.nextDue; return { ok: true, text: '수군장이 도장을 찍는다. 이번 계절 끝까지 수군 배가 따라붙는다.' }; }
  if (id === 'share') { S.share = S.at; return { ok: true, text: `${PORTS[S.at].name} 상단의 지분을 샀다. 이제 여기서는 값을 더 쳐주고 입항세도 없다.` }; }
  S.office[id] = 1; if (id === 'letter') S.threat = Math.min(S.threat, 70); return { ok: true, text: id === 'store8' ? '창고를 넓혔다. 여덟 상자까지 맡길 수 있다.' : '사략 면허를 받았다. 조정은 앞으로 눈을 감는다.' }; }
function specialInfo(k) { const sp = SPECIALS[k]; if (!sp) return null; const cdLeft = Math.max(0, Math.ceil((S.spCD[k] || 0) - S.t)); const st = S.special[k] || {};
  const r = { k, name: sp.name, ch: sp.kind === 'deal' ? G[sp.good].ch : sp.ch, kind: sp.kind, desc: sp.desc, cd: cdLeft, can: cdLeft === 0, why: cdLeft ? `${cdLeft}일 뒤 다시` : '' };
  const no = why => { r.can = false; r.why = r.why || why; };
  if (sp.kind === 'store') { r.store = S.store.slice(); r.max = storeMax(); r.can = true; r.why = ''; }
  if (sp.kind === 'escort') { r.cost = escortCost(); if (S.escort || S.navyUntil > S.t) no(S.navyUntil > S.t ? '호위 계약이 살아 있다' : '이미 호위가 붙었다'); else if (S.gold < r.cost) no('돈이 모자란다'); r.label = `호위를 산다 · ${r.cost.toLocaleString('ko-KR')}냥${r.cost < sp.cost ? ' (명성 할인)' : ''}`; }
  if (sp.kind === 'royal') { const c = royalPick(); if (!c) no('넘길 물건이 없다'); else r.label = `${G[c.id].name} 한 상자 → ${c.rev.toLocaleString('ko-KR')}냥`; }
  if (sp.kind === 'diver') r.label = '물질을 따라간다 · 하루';
  if (sp.kind === 'temple') { r.cost = sp.cost; if (S.blessed) no('이미 축복을 받았다'); else if (S.gold < sp.cost) no('돈이 모자란다'); r.label = `시주한다 · ${sp.cost}냥`; }
  if (sp.kind === 'inn') r.label = '객주를 찾는다';
  if (sp.kind === 'deal') { r.good = sp.good; r.price = dealPrice(sp); r.left = st.left != null && st.until > S.t ? st.left : sp.n; if (r.left <= 0) no(`${Math.ceil(st.until - S.t)}일 뒤 다시`); else { r.can = true; r.why = ''; if (!freeSlots()) no('선창이 가득 찼다'); else if (S.gold < r.price) no('돈이 모자란다'); }
    r.label = `${G[sp.good].name} 한 상자 · ${r.price.toLocaleString('ko-KR')}냥 (남은 ${r.left})`; }
  if (sp.kind === 'yard') { r.can = false; r.why = ''; r.passive = true; }
  if (sp.kind === 'bulk') { if (!S.slots.length) no('실은 짐이 없다'); else { const v = S.slots.reduce((a, s) => a + Math.round(sellPrice(k, s.id) * 1.15) * LOT, 0); r.label = `짐을 모두 넘긴다 · ${v.toLocaleString('ko-KR')}냥 · 사흘`; } }
  if (sp.kind === 'royalOrder') { r.reward = royalReward(); r.label = `주문을 받는다 · 사례 ${r.reward.toLocaleString('ko-KR')}냥`; if (S.orders.some(o => o.royal)) no('이미 받은 주문이 있다'); }
  if (sp.kind === 'swap') { if (!S.slots.length) no('바꿀 상자가 없다'); else if (!freeSlots()) no('칸이 하나 더 있어야 한다'); r.label = '상자 하나를 고른다'; }
  if (sp.kind === 'feast') r.label = '연회에 앉는다 · 하루';
  return r; }
function royalPick() { if (!S.at) return null; let best = null; S.slots.forEach((s, i) => { if (!['silk', 'shell', 'spice', 'gold'].includes(s.id)) return; const rev = Math.round(sellPrice(S.at, s.id) * 1.4) * LOT; if (!best || rev > best.rev) best = { i, id: s.id, rev }; }); return best; }
const royalReward = () => Math.round(G.porcelain.base * LOT * 2 * 3.2 / 100) * 100;
function sellWith(i, mult) { S._bonus = mult; const r = sell(i); S._bonus = 1; return r; }
function useSpecial(k, arg) { k = k || S.at; if (S.mode !== 'port' || S.at !== k) return { ok: false, text: '항구에 있어야 한다' };
  const sp = SPECIALS[k], inf = specialInfo(k); if (!sp) return { ok: false, text: '' };
  if (sp.kind === 'store') return arg && arg.take != null ? storeTake(arg.take) : storePut(arg && arg.put);
  if (!inf.can && !(sp.kind === 'swap' && arg == null)) return { ok: false, text: inf.why || '지금은 안 된다' };
  const cd = () => { if (sp.cd) S.spCD[k] = S.t + sp.cd; };
  switch (sp.kind) {
    case 'escort': { const c = escortCost(); S.gold -= c; acct('office', c); S.escort = 1; return { ok: true, text: '수군 배 두 척이 다음 항해에 따라붙는다. 해적이 감히 다가오지 못한다.', good: true }; }
    case 'royal': { const c = royalPick(); const r = sellWith(c.i, 1.4); addThreat(6); cd(); return { ok: true, text: `${G[c.id].name}${JO(G[c.id].name,'을','를')} 왕실에 넘겼다. +${r.rev.toLocaleString('ko-KR')}냥. 조정의 눈길이 따갑다.`, good: true, sale: r }; }
    case 'diver': { S.t += 1; cd(); makeDive({ name: '탐라 앞바다', lv: 1, max: 4, pearl: true }); return { ok: true, dive: true, text: '해녀들이 물질 길을 열어준다. 숨이 닿는 데까지 따라 들어가 본다.', good: true }; }
    case 'temple': { S.gold -= sp.cost; acct('office', sp.cost); S.blessed = 1; cd(); const r = makeRumor('true'); return { ok: true, text: `노승이 염주를 굴린다. "바다가 길을 열어줄 것이오." 그리고 덧붙인다. "${r.line}"`, good: true }; }
    case 'inn': { cd(); const a = makeRumor('true'), b = makeRumor('true'); return { ok: true, text: `객주가 술상을 내온다. "동포끼리 돈은 무슨." — "${a.line}" / "${b.line}"`, good: true }; }
    case 'deal': { const st = S.special[k] && S.special[k].until > S.t ? S.special[k] : (S.special[k] = { left: sp.n, until: S.t + sp.cd }); const price = dealPrice(sp); S.gold -= price; S.slots.push({ id: sp.good, cost: price }); st.left--; return { ok: true, text: `${G[sp.good].name} 한 상자를 ${price.toLocaleString('ko-KR')}냥에 실었다.`, good: true }; }
    case 'bulk': { const res = []; for (let i = S.slots.length - 1; i >= 0; i--) res.push(sellWith(i, 1.15)); S.t += 3; cd(); const sum = res.reduce((a, r) => a + r.rev, 0), pf = res.reduce((a, r) => a + r.profit, 0); return { ok: true, text: `홍려관 관리가 장부에 도장을 찍는다. ${res.length}상자, ${sum.toLocaleString('ko-KR')}냥 (이익 ${pf >= 0 ? '+' : ''}${pf.toLocaleString('ko-KR')}).`, good: pf >= 0, sales: res.reverse() }; }
    case 'royalOrder': { const o = { id: 'royal' + Math.floor(S.t), from: k, to: k, good: 'porcelain', n: 2, days: 60, reward: royalReward(), due: S.t + 60, royal: true }; S.orders.push(o); cd(); return { ok: true, text: `궁에서 온 관리가 말한다. "명주의 청자 두 상자. 예순 날 안에." 사례는 ${o.reward.toLocaleString('ko-KR')}냥.`, good: true, order: o }; }
    case 'swap': { if (arg == null || !S.slots[arg]) return { ok: false, text: '바꿀 상자를 고른다' }; if (!inf.can) return { ok: false, text: inf.why }; const s = S.slots.splice(arg, 1)[0]; const c = Math.round(s.cost / 2); S.slots.push({ id: 'shell', cost: c }, { id: 'shell', cost: s.cost - c }); cd(); return { ok: true, text: `${G[s.id].name} 한 상자가 야광패 두 상자가 되었다.`, good: true }; }
    case 'feast': { S.t += 1; S.fame += 30; cd(); let t = '왕이 술잔을 건넨다. 명성 +30.'; if (freeSlots()) { S.slots.push({ id: 'sulfur', cost: 0 }); t += ' 유황 한 상자를 선물로 받았다.'; } else t += ' 선창이 차서 선물은 사양했다.'; return { ok: true, text: t, good: true }; }
  }
  return { ok: false, text: '' }; }
function storePut(i) { if (S.at !== 'cheonghae') return { ok: false, text: '청해진에서만' }; if (S.store.length >= storeMax()) return { ok: false, text: '창고가 가득 찼다' }; const s = S.slots[i]; if (!s) return { ok: false, text: '' };
  S.slots.splice(i, 1); S.store.push(s); return { ok: true, text: `${G[s.id].name} 상자를 창고에 넣었다.` }; }
function storeTake(i) { if (S.at !== 'cheonghae') return { ok: false, text: '청해진에서만' }; const s = S.store[i]; if (!s) return { ok: false, text: '' }; if (!freeSlots()) return { ok: false, text: '선창이 가득 찼다' };
  S.store.splice(i, 1); S.slots.push(s); return { ok: true, text: `${G[s.id].name} 상자를 다시 실었다.` }; }
function racers(port) { if (!port) return []; return S.rivals.filter(R => { const d = RIVALS.find(r => r.id === R.id); return d.kind === 'trade' && !R.at && R.dest === port && R.path; }).map(R => { const d = RIVALS.find(r => r.id === R.id); let L = Math.hypot(R.path[R.seg + 1] ? R.path[R.seg + 1][0] - R.x : 0, R.path[R.seg + 1] ? R.path[R.seg + 1][1] - R.y : 0); for (let i = R.seg + 1; i < R.path.length - 1; i++) L += Math.hypot(R.path[i + 1][0] - R.path[i][0], R.path[i + 1][1] - R.path[i][1]); return { id: R.id, name: d.name, ch: d.ch, col: d.col, good: R.good, days: L / (BASE_KMD * .75) }; }); }
function setRow(on) { if (S.mode !== 'sail') return false; S.rowing = !!on && S.stamina > 3; return S.rowing; }

function nextStory() {
  if (S.ended || S.mode !== 'port') return null;
  while (S.pending.length) { const id = S.pending.shift();
    if (id === 'main:start' || id === 'main:final') { const st = mainStory(id.slice(5)); if (st) return st; continue; }
    if (id === 'port:ev') { const st = portEvent(); if (st) return st; continue; }
    if (id.startsWith('scene:')) { const st = sceneStory(id.slice(6)); if (st) return st; continue; }
    if (id.startsWith('quest:')) { const q = QBY[id.slice(6)]; if (!q || S.quests[q.id]) continue;
      return { who: q.who || 'quest', qch: q.ch, title: q.name, text: q.intro, sub: `${q.steps.length}단계 · 첫 목표 — ${q.steps[0].text}`, opts: [{ label: '맡는다', apply: () => { startQuest(q.id); return `이야기 「${q.name}」를 맡았다. 장부의 '이야기'에서 언제든 볼 수 있다.`; } }, { label: '나중에', apply: () => { S.qDecl[q.id] = S.t + 15; return null; } }] }; }
    const st = STORIES[id] && STORIES[id](); if (st) return st; }
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
    sub: '자금 절반을 잃었다. 다음 칼은 막아줄 사람이 없다.', opts: [{ label: '범이를 묻는다', apply: () => '바다가 보이는 언덕에 범이를 묻었다.' }] }),
  /* 경계가 끝까지 찼다. 바로 죽지 않고 셋 중 하나를 고른다 — 재산 절반 · 사람 하나 · 배를 버리고 도주 */
  lastChoice: () => { const people = [...S.mates.map(id => ({ mate: id, name: MBY[id].name })), ...S.crew.filter(c => c.alive).map(c => ({ crew: c.k, name: CREW.find(x => x.k === c.k).name }))]; const half = Math.round(S.gold * .5);
    return { who: 'inspector', title: '칼이 오기 전날', text: '포구에 들어서자 낯익은 얼굴이 기다리고 있다. "조정이 당신 목에 값을 걸었소. 오늘 밤 칼이 오오. 막을 길은 셋이오." 손가락 셋을 편다.',
      sub: '경계가 끝까지 찼다. 하나를 고르지 않으면 밤을 못 넘긴다.',
      opts: [{ label: '재산 절반을 내놓는다', sub: `${half.toLocaleString('ko-KR')}냥 · 경계 50으로`, off: S.gold < 2000, apply: () => { if (S.gold < 2000) return '내놓을 돈이 없다.'; S.gold -= half; acct('tribute', half); S.threat = 50; restage(); return `${half.toLocaleString('ko-KR')}냥을 내놓았다. 칼은 오지 않았다.`; } },
        { label: '사람 하나를 넘긴다', sub: people.length ? `${people[0].name}이 대신 끌려간다 · 경계 55로` : '넘길 사람이 없다', off: !people.length, apply: () => { if (!people.length) return '넘길 사람이 없다.'; const p = people[0]; if (p.mate) fireMate(p.mate); else crewOf(p.crew).alive = false; S.threat = 55; S.fame = Math.max(0, S.fame - 50); restage(); return `${p.name}이 대신 끌려갔다. 선원들이 당신을 보지 않는다. 명성 -50`; } },
        { label: '배를 버리고 도주한다', sub: '배와 짐을 잃고 어선으로 · 경계 20으로', apply: () => { const n = S.slots.length; S.slots = []; S.tier = 0; S.shipVar = 'wide'; S.hullMax = 100 + 40 * (S.boons.hull || 0) + (S.relics.anchor ? 30 : 0); S.hull = S.hullMax; S.threat = 20; restage(); return `밤에 배를 버리고 작은 어선으로 빠져나왔다. 상자 ${n}개를 두고 왔다.`; } }] }; }
};

/* ─────────── 상납 · 특권 ─────────── */
/* 재산 = 돈 + 짐(산 값) + 배 값의 절반. 창고는 빼준다(압류도 손대지 못한다). 태풍의 상납 하한은 이것의 3할, 다만 곡선의 두 배는 넘지 않는다 */
const cargoCost = () => S.slots.reduce((a, s) => a + s.cost, 0);
const wealth = () => S.gold + cargoCost() + Math.round(ship().price * .5);
const quotaFloor = () => Math.min(dif().share * wealth(), quotaFor(S.quotaN) * 2);
const quotaNow = () => Math.round((Math.max(quotaFor(S.quotaN), quotaFloor()) * (1 - .25 * S.relief) * (S.relics && S.relics.crown ? .9 : 1) * (S.main && S.main.flags.quotaUp ? 1.1 : 1) + (S.debt || 0) + ((S.main && S.main.flags.debt) || 0)) / 100) * 100;
const debtsAllowed = () => dif().debts;

/* ─────────── 계절 결산: 어디서 벌고 어디에 썼나 ───────────
   inc 장사(판 이익)·전리품·잠수·의뢰 / out 상납·수리·급료·조정·소문·배값·관아. 기타 = 재산 변화에서 위 항목을 뺀 나머지(사건·발견·이야기 보상·압류 손해…) */
const INC_CATS = [['trade', '장사 이익'], ['loot', '전리품·현상금'], ['dive', '잠수'], ['order', '의뢰·승객']], OUT_CATS = [['quota', '상납'], ['repair', '수리'], ['wage', '급료'], ['tribute', '조정·뇌물'], ['rumor', '소문'], ['ship', '배값'], ['office', '호위·시주·관아']];
function newSeasonStats(w0, t0) { return { w0, t0, inc: { trade: 0, loot: 0, dive: 0, order: 0 }, out: { quota: 0, repair: 0, wage: 0, tribute: 0, rumor: 0, ship: 0, office: 0 } }; }
const bookWealth = () => S.gold + cargoCost() + (S.store || []).reduce((a, s) => a + s.cost, 0); // 장부용 재산(배 값은 안 센다 — 배를 사면 '배값'으로 적힌다)
function acct(cat, v) { if (!S || !S.stats) return; v = Math.round(v); for (const st of [S.stats.season, S.stats.life]) { if (!st) continue; if (cat in st.inc) st.inc[cat] += v; else if (cat in st.out) st.out[cat] += v; } }
function seasonReport(st) { st = st || S.stats.season; if (!st) return null; const inc = INC_CATS.map(([id, name]) => [name, st.inc[id] || 0]), out = OUT_CATS.map(([id, name]) => [name, st.out[id] || 0]);
  const si = inc.reduce((a, x) => a + x[1], 0), so = out.reduce((a, x) => a + x[1], 0), w1 = st.w1 != null ? st.w1 : bookWealth(), other = (w1 - st.w0) - (si - so);
  return { days: Math.round((st.t1 != null ? st.t1 : S.t) - st.t0), inc, out, other, net: w1 - st.w0, sumInc: si, sumOut: so }; }
function closeSeason() { const st = S.stats.season; st.w1 = bookWealth(); st.t1 = S.t; S.stats.lastSeason = seasonReport(st); S.stats.season = newSeasonStats(bookWealth(), S.t); }
/* 지금 속도면 상납 날에 얼마나 있을까: 최근 30일 재산 변화로 하루 평균을 내어 남은 날만큼 더한다 */
function histTick() { const d = Math.floor(S.t), h = S.stats.hist; if (!h.length || h[h.length - 1][0] < d) { h.push([d, bookWealth()]); if (h.length > 45) h.splice(0, h.length - 45); } }
function quotaForecast() { const h = S.stats.hist || [], d = Math.floor(S.t); if (h.length < 2) return { value: S.gold, perDay: 0, days: 0, span: 0 };
  const from = h.find(e => e[0] >= d - 30) || h[0], span = Math.max(1, d - from[0]); if (span < 5) return { value: S.gold, perDay: 0, days: Math.ceil(daysToDue()), span };
  const perDay = (bookWealth() - from[1]) / span, left = Math.ceil(daysToDue()); return { value: Math.round(S.gold + perDay * left), perDay: Math.round(perDay), days: left, span }; }

function collectQuota() { // 계절 끝. 반환: {ok, amount, short, seized, debt, lostBoon, finale}
  const due = quotaNow(); let seized = 0; const hadDebt = S.debt || 0;
  if (S.gold < due) { // 짐을 7할 값에 넘겨 메운다
    while (S.gold < due && S.slots.length) { const s = S.slots.pop(); const v = Math.round(s.cost * .7); S.gold += v; seized += v; } }
  if (S.gold < due) { // 못 냈다. 빚으로 넘길 수 있으면 넘긴다: 모자란 돈의 1.3배가 다음 상납에 얹히고, 특권 하나를 잃고, 경계 +15. 연속으로 또 못 내면 끝
    const short = due - S.gold; S.debtN = (S.debtN || 0) + 1;
    if (S.debtN > debtsAllowed()) { S.ended = 'quota'; return { ok: false, amount: due, short, seized }; }
    S.paid += S.gold; acct('quota', S.gold); S.gold = 0; S.debt = Math.round(short * 1.3 / 100) * 100; let lostBoon = null; const w = wages(), left = payWages();
    const have = Object.keys(S.boons).filter(id => S.boons[id] > 0); if (have.length) { lostBoon = pick(have); S.boons[lostBoon]--; if (S.boons[lostBoon] <= 0) delete S.boons[lostBoon]; if (lostBoon === 'hull') { S.hullMax -= 40; S.hull = Math.min(S.hull, S.hullMax); } if (lostBoon === 'relief') S.relief = Math.max(0, S.relief - 1); }
    S.threat = Math.min(threatMax(), S.threat + 15); restage(); S.quotaN++; S.nextDue += 90; if (S.quotaN % 4 === 0) S.stats.years++; closeSeason(); S.redrew = false;
    return { ok: true, amount: due, short, seized, debt: S.debt, debtN: S.debtN, debtsLeft: debtsAllowed() - S.debtN, lostBoon, next: quotaNow(), year: S.quotaN % 4 === 0, wages: w, left: left.map(m => m.name), report: S.stats.lastSeason }; }
  S.gold -= due; S.paid += due; acct('quota', due); S.quotaN++; S.debt = 0; S.debtN = 0; if (S.main && S.main.flags.debt) S.main.flags.debt = 0; S.relief = 0; S.nextDue += 90; if (S.quotaN % 4 === 0) S.stats.years++;
  const w = wages(), left = payWages(); closeSeason(); S.redrew = false;
  if (S.quotaN >= QUOTA_END && !S.ended) { S.ending = 'three_years'; S.ended = 'ending'; S.draft = null; return { ok: true, amount: due, seized, finale: true, hadDebt, wages: w, left: left.map(m => m.name), report: S.stats.lastSeason }; } // 세 해를 채웠다 — 이야기 결말을 못 봤어도 여기서 장부를 덮는다
  S.draft = drawBoons(); return { ok: true, amount: due, seized, hadDebt, next: quotaNow(), year: S.quotaN % 4 === 0, wages: w, left: left.map(m => m.name), report: S.stats.lastSeason }; }
/* 특권 뽑기: 첫 해엔 선창·흥정·값 깎기·감면이 잘 나오고, 둘째 해부터는 연줄·눈감음·해적 사냥꾼이 잘 나온다 */
const BOON_W = { y1: { hold: 3, bargain: 3, haggle: 3, relief: 2, tang: .3, wa: .3, court: .3, hunter: .3 }, y2: { tang: 3, wa: 3, court: 3, hunter: 3, hold: 1, relief: 1 } };
function drawBoons() { const W = yearOf() === 0 ? BOON_W.y1 : BOON_W.y2; let pool = BOONS.filter(b => (S.boons[b.id] || 0) < b.max && !(b.id === 'chart' && !PORT_IDS.some(k => !S.known[k] && !S.spotted[k]))); const out = [];
  while (out.length < 3 && pool.length) { const tot = pool.reduce((a, b) => a + (W[b.id] || 1), 0); let r = Math.random() * tot, i = 0; for (; i < pool.length - 1; i++) { r -= W[pool[i].id] || 1; if (r <= 0) break; } out.push(pool.splice(i, 1)[0]); } return out.map(b => b.id); }
const REDRAW_COST = 1000;
function redrawBoons() { if (!S.draft || S.redrew || S.gold < REDRAW_COST) return null; S.gold -= REDRAW_COST; acct('office', REDRAW_COST); S.redrew = true; S.draft = drawBoons(); return S.draft; }
function takeBoon(id) { if (!S.draft || !S.draft.includes(id)) return null; S.draft = null; S.boons[id] = (S.boons[id] || 0) + 1; let note = '';
  if (id === 'hull') { S.hullMax += 40; S.hull += 40; }
  if (id === 'relief') S.relief++;
  if (id === 'chart') { const ks = PORT_IDS.filter(k => !S.known[k] && !S.spotted[k]).sort((a, b) => Math.hypot(PORTS[a].x - S.x, PORTS[a].y - S.y) - Math.hypot(PORTS[b].x - S.x, PORTS[b].y - S.y)); const k = ks[0]; if (k) { S.spotted[k] = 1; revealCircle(PORTS[k].x, PORTS[k].y, 60); note = k; } }
  return { id, note }; }

/* ─────────── 항해 계획 · 출항 ─────────── */
function plan(target) {
  const from = [S.x, S.y]; let to, port = null;
  if (typeof target === 'string') { port = target; if (isClosed(port)) return { closedPort: port, news: liveNews().find(n => n.closed === port) }; to = [PORTS[port].x, PORTS[port].y]; } else { to = [target.x, target.y]; if (!seaAt(to[0], to[1])) return null; }
  const path = findPath(from[0], from[1], to[0], to[1]); if (!path) return null;
  const mk = p => ({ path: p, days: estimateDays(p, S.t, shipSpeed()), wind: pathWind(p, S.t), zones: pathZones(p), waitFor: S.mode === 'port' ? waitFor(p, S.t) : null });
  const a = mk(path); let alt = null;
  let main = a;
  if (a.zones.length) { const p2 = findPath(from[0], from[1], to[0], to[1], true); if (p2) { const b = mk(p2); if (!b.zones.length) { if (b.days <= a.days * 1.06) main = b; else if (b.days < a.days * 2.2) alt = b; } } }
  return { port, explore: !port, main, alt, ...main };
}
function depart(p, useAlt) { if (!p || S.ended || S.battle || S.dive) return false; const r = useAlt && p.alt ? p.alt : p.main; S.mode = 'sail'; S.path = r.path; S.seg = 0; S.dest = p.port; S.voyage = { from: S.at, t0: S.t, storms: 0, finds: [], escort: S.escort || (S.navyUntil > S.t ? 1 : 0), blessed: S.blessed, race: racers(p.port).map(r => r.id) }; S.escort = 0; S.blessed = 0; S.rowing = false; S.at = null; S.lastEvDay = Math.floor(S.t); S.stats.voyages++; return true; }
/* 역풍이면 며칠 기다려 순풍을 탈 수 있는지: 1~6일 뒤 중 처음 순풍이 되는 날 */
function waitFor(path, t) { if (pathWind(path, t) !== '역풍') return null; for (let n = 1; n <= 6; n++) if (pathWind(path, t + n) === '순풍') return n; return null; }
function waitDays(n) { if (S.mode !== 'port' || S.ended || !(n > 0)) return false; S.t += Math.min(6, n); return true; }

/* ─────────── 사건 ─────────── */
const pirateOdds = () => clamp(.45 + (S.cap === 'gungbok' ? .1 : 0) + (perk('deck') ? .15 : 0) + (S.boons.hunter ? .25 : 0) + S.tier * .04 - (S.threat >= 60 ? .1 : 0), .1, .92);
function pirateEvent(head, spec) { spec = spec || { kind: 'pirate', name: head || '해적선', ch: '賊', g: pick(['plain', 'plain', 'boarder', 'archer']), hp: 42, atk: 10 };
  return { id: 'pirate', title: head || '해적선', text: `${spec.kind === 'black' ? '검은 깃발 — 흑기 해적선이다. 이 바다에서 가장 사나운 배. ' : ''}${S.threat >= 60 ? '현상금을 노리는 배다. ' : ''}검은 돛이 바람 위에서 내려온다.${crewOf('deck').alive ? ' 범이가 칼을 뽑는다.' : ''}`,
  opts: [{ label: '싸운다', sub: `해전 — ${GIMMICK[spec.g] || '평범한 해적'}`, apply: () => ({ battle: spec }) },
    S.slots.length ? { label: '상자 하나를 내준다', sub: '확실한 손해, 위험은 없다', apply: () => { const s = S.slots.splice(ri(0, S.slots.length - 1), 1)[0]; return { text: `${G[s.id].name} 상자를 던져주고 빠져나왔다.` }; } }
      : { label: '통행료를 낸다', sub: `${Math.min(S.gold, tollCap()).toLocaleString('ko-KR')}냥`, apply: () => { S.gold -= Math.min(S.gold, tollCap()); return { text: '통행료를 내고 지나갔다.' }; } }] }; }
const tollCap = () => S.tier === 0 ? 600 : 1200 + 400 * S.tier; // 어선은 통행료 상한 600
const EVENTS = [
  { id: 'storm', w: () => (liveNews().some(n => n.storm) ? 6 : 2) * (monsoon(S.t).name === '남풍 · 태풍철' ? dif().stormX : 1), when: w => w.str > .74 || liveNews().some(n => n.storm), title: '검은 구름', text: () => `서쪽 수평선이 검다. 너울이 길어진다.${perk('helm') ? ' 곽이 이미 섬 그늘을 가리키고 있다.' : ' 곽이 말한다. "반나절이면 오오."'}`,
    opts: () => [{ label: '뚫고 간다', sub: `시간은 안 잃고 배가 상한다 · 선체 -14~30${S.slots.some(s => s.id === 'porcelain') ? ' · 도자기는 45% 깨진다' : S.slots.length ? ' · 상자 하나가 쓸려갈 수도(20%)' : ''}`, apply: () => { const d = Math.round(ri(14, 30) * (S.relics.scale ? .5 : 1)); S.hull -= d; S.voyage.storms++; const pi = S.slots.findIndex(s => s.id === 'porcelain'); if (pi >= 0 && Math.random() < .45) { S.slots.splice(pi, 1); return { text: `폭풍을 뚫었다. 선체 -${d}. 도자기 상자가 굴러 산산이 깨졌다.`, bad: true }; } if (S.slots.length && Math.random() < .2) { const s = S.slots.splice(ri(0, S.slots.length - 1), 1)[0]; return { text: `폭풍을 뚫었다. 선체 -${d}. ${G[s.id].name} 상자 하나가 파도에 쓸려갔다.`, bad: true }; } return { text: `폭풍을 뚫었다. 선체 -${d}`, bad: true }; } },
      { label: '피항한다', sub: perk('helm') ? '반나절 · 곽이 먼저 읽었다' : '이틀을 잃는다', apply: () => { S.t += perk('helm') ? .5 : 2; return { text: perk('helm') ? '곽이 반나절 먼저 섬 그늘에 배를 댔다.' : '섬 그늘에서 이틀을 버텼다.' }; } }] },
  { id: 'calm', w: () => 4, when: w => w.str < .6, title: '죽은 바다', text: () => '바람이 죽었다. 돛이 늘어지고 바다는 기름처럼 매끈하다.',
    opts: () => [{ label: '바람을 기다린다', sub: '이틀 반', apply: () => { S.t += 2.5; return { text: '이틀 반 만에 바람이 돌아왔다.' }; } },
      { label: '노를 젓는다', sub: '하루 · 선체 -6', apply: () => { S.t += 1; S.hull -= 6; return { text: '하루를 노로 밀었다. 손이 다 터졌다.' }; } }] },
  { id: 'wreck', w: () => 2, when: () => true, title: '떠도는 잔해', text: () => '부서진 배의 잔해가 떠온다. 널빤지 사이로 궤짝이 보인다.',
    opts: () => [{ label: '건진다', sub: '반나절', apply: () => { S.t += .5; const r = Math.random();
        if (r < .4) { const g = ri(3, 12) * 100; S.gold += g; return { text: `은자 주머니가 나왔다. +${g}냥`, good: true }; }
        if (r < .7 && freeSlots()) { const id = pick(GOODS).id; S.slots.push({ id, cost: 0 }); return { text: `${G[id].name} 한 상자가 멀쩡하다. 공짜다.`, good: true }; }
        const m = addMap(Math.random() < .25 ? 2 : 1); if (m) return { text: `궤짝 안에 젖은 해도 한 장 — <b>${m.name}</b>의 자리가 그려져 있다.`, good: true, map: m }; return { text: '궤짝은 비어 있었다.' }; } }, { label: '지나친다', apply: () => ({ text: '뒤돌아보지 않았다.' }) }] },
  { id: 'sail', w: () => 2, when: () => true, title: '낯선 돛', text: () => '수평선에 돛 하나. 이쪽으로 온다. 깃발이 보이지 않는다.',
    opts: () => [{ label: '다가간다', sub: '상선일까', apply: () => { if (Math.random() < .6) { const r = makeRumor('true'); return { text: `당의 상선이다. 물과 소식을 나눴다. "${r.line}"`, good: true }; } return { battle: { kind: 'pirate', name: '위장한 해적선', ch: '賊', g: 'plain', hp: 40, atk: 10 } }; } },
      { label: '피한다', sub: '반나절', apply: () => { S.t += .5; return { text: '뱃머리를 돌려 거리를 벌렸다.' }; } }] },
  { id: 'castaway', w: () => 1, when: () => true, title: '표류자', text: () => '부서진 돛대에 사람이 매달려 있다. 손을 흔든다.',
    opts: () => [{ label: '건져 올린다', sub: '반나절 · 명성', apply: () => { S.t += .5; S.fame += 20; const r = makeRumor('true'); return { text: `살려준 뱃사람이 고맙다며 귓속말을 한다. "${r.line}"`, good: true }; } },
      { label: '지나친다', apply: () => ({ text: '못 본 척했다. 선원들이 말이 없다.' }) }] },
  { id: 'reef', w: () => 2, when: () => !S.dest, title: '물빛이 바뀐다', text: () => '물이 갑자기 옅어진다. 곽이 측심줄을 내린다. "여섯 길… 넷… 셋!"',
    opts: () => [{ label: '즉시 멈춘다', sub: '하루', apply: () => { S.t += 1; return { text: '암초 위에서 멈췄다. 하루를 들여 빠져나왔다.' }; } },
      { label: '밀고 나간다', sub: '반반', apply: () => { if (Math.random() < .5) { S.hull -= 25; return { text: '긁혔다. 선체 -25', bad: true }; } return { text: '운이 좋았다.', good: true }; } }] },
  { id: 'fairwind', w: () => 1, when: () => true, title: '등 뒤의 바람', text: () => '바람이 고물 쪽으로 돌았다. 돛이 팽팽하게 부푼다.',
    opts: () => [{ label: '돛을 다 편다', sub: '이틀 동안 빨라진다', apply: () => { S.boost = 2; return { text: '배가 물 위를 미끄러진다.', good: true }; } }] },
  { id: 'monk', w: () => 1, when: () => !S.passenger, title: '표류한 승려', text: () => { S._monkTo = passengerDest(); return `부서진 거룻배에 왜의 승려가 앉아 있다. ${PORTS[S._monkTo].name}${JO(PORTS[S._monkTo].name,'으로','로')} 가던 길이라 한다.`; },
    opts: () => { const to = S._monkTo || passengerDest(); return [{ label: '태워준다', sub: `${PORTS[to].name}까지 40일 안에 데려가면 사례한다`, apply: () => { S.passenger = { to, due: S.t + 40, who: '왜의 승려' }; S.t += .5; return { text: `승려가 합장한다. "${PORTS[to].name}에 닿으면 은혜를 갚겠습니다."`, good: true }; } },
      { label: '물만 주고 보낸다', apply: () => ({ text: '물통 하나를 던져주었다.' }) }]; } },
  { id: 'captives', w: () => S.main && S.main.flags.oath_people ? 3 : 1, when: () => S.voyage && S.t - S.voyage.t0 > 2 && !S.voyage.escort, title: '노예선', text: () => '당 해적의 배다. 갑판 아래서 신라 말이 들린다. 붙잡혀 팔려가는 사람들이다.',
    opts: () => [{ label: '습격해 구한다', sub: '해전 — 노예선은 활을 쏘며 버틴다', apply: () => ({ battle: { kind: 'slaver', name: '노예선', ch: '奴', g: 'archer', hp: 55, atk: 10, win: 'captives' } }) },
      { label: '못 본 척한다', sub: '명성 -30', apply: () => { S.fame = Math.max(0, S.fame - 30); return { text: '뱃머리를 돌렸다. 범이가 말없이 돛줄을 감는다.' }; } }] },
  { id: 'ghost', w: () => 1, when: () => true, title: '유령선', text: () => '안개 속에 돛이 찢긴 배가 떠 있다. 사람 그림자가 없다. 선원들이 웅성거린다.',
    opts: () => [{ label: '올라가 본다', sub: '반나절 · 상자나 돈이 남아 있을 수도, 셋 중 하나는 선원들이 겁에 질려 이틀을 잃는다', apply: () => { S.t += .5; const r = Math.random();
        if (r < .45 && freeSlots()) { const id = pick(['spice', 'gold', 'silk', 'fur']); S.slots.push({ id, cost: 0 }); return { text: `선창에 ${G[id].name} 한 상자가 고스란히 남아 있다.`, good: true }; }
        if (r < .75) { S.t += 1.5; S.stamina = 0; return { text: '아무것도 없었다. 겁에 질린 선원들이 이틀 동안 노를 잡지 않았다.', bad: true }; }
        const g = ri(6, 16) * 100; S.gold += g; const m = addMap(2); return { text: `선장실 궤짝에서 ${g}냥.${m ? ` 그리고 피로 얼룩진 해도 — <b>${m.name}</b>.` : ''}`, good: true, map: m }; } },
      { label: '멀리 돌아간다', sub: '반나절', apply: () => { S.t += .5; return { text: '아무도 뒤돌아보지 않았다.' }; } }] },
  { id: 'spout', w: () => 1, when: w => w.str > .6, title: '용오름', text: () => '바다에서 하늘로 물기둥이 솟는다. 선원들이 "용이다!" 외친다.',
    opts: () => [{ label: '크게 돌아간다', sub: '하루', apply: () => { S.t += 1; return { text: '멀찍이서 용이 승천하는 걸 보았다.' }; } },
      { label: '곁을 스친다', sub: '위험하다 · 명성', apply: () => { if (Math.random() < .35) { S.hull -= 35; return { text: '물기둥에 휘말렸다. 선체 -35.', bad: true }; } S.fame += 40; return { text: '용 곁을 지났다! 뱃사람들 사이에 이야기가 퍼진다. 명성 +40', good: true }; } }] },
  { id: 'whale', w: () => 1, when: () => true, title: '고래 떼', text: () => '고래 떼가 뱃전을 스친다. 물줄기가 무지개를 만든다.',
    opts: () => [{ label: '고래를 따라간다', sub: '이틀 동안 빨라진다', apply: () => { S.boost = 2; return { text: '고래가 물길을 안다. 배가 미끄러진다.', good: true }; } },
      { label: '그물을 던진다', sub: '반나절 · 돈', apply: () => { S.t += .5; const g = ri(3, 8) * 100; S.gold += g; return { text: `고래를 쫓는 물고기 떼를 건졌다. +${g}냥`, good: true }; } }] },
  { id: 'fog', w: () => 2, when: () => true, title: '짙은 안개', text: () => '한 길 앞도 보이지 않는다. 곽이 뱃머리에 서서 물소리를 듣는다.',
    opts: () => [{ label: '닻을 내리고 기다린다', sub: '하루 반', apply: () => { S.t += 1.5; return { text: '안개가 걷힐 때까지 기다렸다.' }; } },
      { label: '감으로 간다', sub: perk('helm') ? '곽을 믿는다' : '반반', apply: () => { if (!perk('helm') && Math.random() < .45) { S.hull -= 20; return { text: '바위를 긁었다. 선체 -20', bad: true }; } return { text: '곽이 물소리만으로 길을 찾았다.', good: true }; } }] },
  { id: 'fever', w: () => 1, when: () => S.voyage && S.t - S.voyage.t0 > 4 && !hasMate('doctor'), title: '열병', text: () => '선원 여럿이 열에 들떠 누웠다. 노를 저을 사람이 없다.',
    opts: () => [S.slots.some(s => s.id === 'ginseng') ? { label: '실은 인삼을 달여 먹인다', sub: '인삼 한 상자를 쓴다', apply: () => { const i = S.slots.findIndex(s => s.id === 'ginseng'); S.slots.splice(i, 1); S.stamina = 100; S.fame += 15; return { text: '인삼을 달였다. 이틀 만에 모두 일어났다. 선원들이 당신을 다시 본다.', good: true }; } }
        : { label: '쉬게 한다', sub: '이틀', apply: () => { S.t += 2; return { text: '이틀을 쉬었다.' }; } },
      { label: '버틴다', sub: '나흘 동안 느려진다', apply: () => { S.stamina = 0; S.slow = 4; return { text: '반쯤 비틀거리며 간다.', bad: true }; } }] },
  { id: 'grumble', w: () => 2, when: () => S.voyage && S.t - S.voyage.t0 > 5, title: '술렁이는 갑판', text: () => '항해가 길어지자 선원들이 수군거린다. "언제 뭍에 닿소?"',
    opts: () => [{ label: '술을 푼다', sub: '600냥 · 기력 회복', apply: () => { S.gold = Math.max(0, S.gold - 600); S.stamina = Math.min(100, S.stamina + 50); return { text: '술독을 열었다. 노래가 나온다.', good: true }; } },
      { label: '엄하게 다스린다', sub: '반반', apply: () => { if (Math.random() < .5) return { text: '조용해졌다.' }; if (S.slots.length) { const s = S.slots.splice(ri(0, S.slots.length - 1), 1)[0]; return { text: `밤사이 ${G[s.id].name} 한 상자가 사라졌다.`, bad: true }; } S.stamina = 0; return { text: '모두 노를 놓았다.', bad: true }; } }] },
  { id: 'smuggler', w: () => 1, when: () => freeSlots() > 0 || S.slots.length > 0, title: '밀수꾼', text: () => { const full = !freeSlots(), id = full ? pick(S.slots).id : pick(GOODS).id; S._smug = { id, full };
      return full ? `작은 배가 다가온다. "그 ${G[id].name} 상자, 값을 넉넉히 쳐주겠소. 어디서 났는지는 묻지 않겠소."` : `작은 배가 다가온다. "${G[id].name} 한 상자, 반값에 넘기겠소. 출처는 묻지 마시오."`; },
    opts: () => { const m = typeof S._smug === 'object' && S._smug ? S._smug : { id: S._smug || 'spice' }, id = m.id;
      if (m.full) { const price = Math.round(G[id].base * LOT * 1.25 / 100) * 100; return [{ label: '넘긴다', sub: `${price.toLocaleString('ko-KR')}냥 · 경계 +4`, apply: () => { const i = S.slots.findIndex(s => s.id === id); if (i < 0) return { text: '넘길 상자가 없어 그냥 보냈다.' }; S.slots.splice(i, 1); S.gold += price; addThreat(4); return { text: `${G[id].name} 상자를 넘기고 ${price.toLocaleString('ko-KR')}냥을 받았다.`, good: true }; } },
        { label: '쫓아 보낸다', apply: () => ({ text: '작은 배가 안개 속으로 사라졌다.' }) }]; }
      const price = Math.round(G[id].base * LOT * .5 / 100) * 100; return [{ label: '산다', sub: `${price.toLocaleString('ko-KR')}냥 · 경계 +4`, apply: () => { if (S.gold < price || !freeSlots()) return { text: '돈이 모자라 그냥 보냈다.' }; S.gold -= price; S.slots.push({ id, cost: price }); addThreat(4); return { text: `${G[id].name} 상자를 반값에 실었다.`, good: true }; } },
      { label: '쫓아 보낸다', apply: () => ({ text: '작은 배가 안개 속으로 사라졌다.' }) }]; } },
  { id: 'stars', w: () => 1, when: () => true, title: '맑은 밤', text: () => '구름 한 점 없는 밤. 별이 바다에 비친다.',
    opts: () => [{ label: '별을 읽는다', sub: perk('helm') ? '곽이 지름길을 안다' : '하루 반 빨라진다', apply: () => { S.boost = perk('helm') ? 3 : 1.5; return { text: '북극성을 잡고 침로를 바로 했다.', good: true }; } }] },
  { id: 'envoy', w: () => 1, when: () => true, title: '사신 배', text: () => '깃발을 단 관선이 손짓한다. "해적이 두렵소. 사흘만 곁을 지켜주시오."',
    opts: () => [{ label: '호위한다', sub: '사흘 · 보수와 명성 · 해적을 만날 수도', apply: () => { S.t += 3; if (Math.random() < .25 && Math.random() > pirateOdds()) { S.hull -= 25; S.gold += 1200; return { text: '해적이 덮쳤다. 사신 배는 지켰지만 선체 -25. 보수 1,200냥.', bad: true }; } S.gold += 2200; S.fame += 50; return { text: '무사히 호위했다. 보수 2,200냥, 명성 +50', good: true }; } },
      { label: '갈 길이 바쁘다', apply: () => ({ text: '관선이 실망한 듯 깃발을 내린다.' }) }] },
  { id: 'drift', w: () => 1, when: () => true, title: '떠다니는 술독', text: () => '봉인된 술독이 둥둥 떠온다. 당의 관인이 찍혀 있다.',
    opts: () => [{ label: '건진다', sub: '선원 기력이 차고 남는 술은 판다 · 경계 +3', apply: () => { S.stamina = 100; const g = ri(3, 6) * 100; S.gold += g; addThreat(3); return { text: `좋은 술이다. 선원들 눈빛이 살아났다. 남은 술독은 ${g}냥에 넘길 수 있겠다.`, good: true }; } },
      { label: '둔다', apply: () => ({ text: '관인 찍힌 물건은 탈이 난다.' }) }] },
];
function rivalNear() { return S.rivals.find(R => { const d = RIVALS.find(r => r.id === R.id); return d.kind === 'trade' && !R.at && R.dest && Math.hypot(R.x - S.x, R.y - S.y) < 45; }); }
function rivalEvent(R) { const def = RIVALS.find(r => r.id === R.id); const vl = rivalLine(def.id, 'meet'); return { id: 'rival', title: `${def.name}${JO(def.name,'과','와')} 나란히`, text: `${def.name}의 배가 뱃전 가까이 붙었다. 저쪽 선원들이 이쪽 짐을 흘끔거린다.${vl ? ' 뱃전에서 큰소리가 건너온다. ' + vl : ''}`,
  opts: [{ label: '저쪽 선원에게 술을 산다', sub: '300냥 · 저들의 행선지와 짐을 알아낸다', apply: () => { S.gold = Math.max(0, S.gold - 300); if (!R.dest) return { text: '저쪽도 갈 곳을 모른단다.' };
      tickMarket(R.dest); S.rumors.push({ k: R.dest, id: R.good || 'silk', price: Math.round(sellPrice(R.dest, R.good || 'silk') * .8), day: Math.floor(S.t), src: '엿들음' });
      return { text: `"우리는 ${PORTS[R.dest].name}${JO(PORTS[R.dest].name,'으로','로')} ${R.good ? G[R.good].name : '빈 배'}를 싣고 가오." — 저들이 먼저 닿으면 그 값은 꺾인다.`, good: true }; } },
    { label: '앞지른다', sub: '돛을 다 펴고 이틀 동안 빨라진다 · 선체 -5', apply: () => { S.boost = 2; S.hull -= 5; return { text: `${def.name}${JO(def.name,'을','를')} 뒤로 따돌렸다.`, good: true }; } },
    { label: '모른 척한다', apply: () => ({ text: '각자 갈 길을 간다.' }) }] }; }
/* 승객의 목적지: 아는 항구 가운데 지금 행선지 쪽에 있는 곳(행선지 자체는 빼고). 없으면 적산 */
function passengerDest() { const ref = S.dest ? PORTS[S.dest] : { x: S.x, y: S.y }; const ks = PORT_IDS.filter(k => S.known[k] && k !== S.dest && k !== S.at && Math.hypot(PORTS[k].x - S.x, PORTS[k].y - S.y) > 120).sort((a, b) => Math.hypot(PORTS[a].x - ref.x, PORTS[a].y - ref.y) - Math.hypot(PORTS[b].x - ref.x, PORTS[b].y - ref.y));
  return ks[0] || 'jeoksan'; }
const pirateLure = () => (1 + S.tier * .1) * (hasMate('archer') ? .8 : 1); // 큰 배는 해적 눈에 더 띄고, 활잡이가 타면 덜 덤빈다
function rollEvent(w) { const safe = S.voyage && S.voyage.escort;
  if (!safe && inZone(S.x, S.y) && Math.random() < (.3 + S.threat / 300) * pirateLure()) { S.ev = Object.assign({}, pirateEvent(`${inZone(S.x, S.y).name}`)); return S.ev; }
  const rn = rivalNear(); if (rn && Math.random() < .5) { S.ev = rivalEvent(rn); return S.ev; }
  const pool = EVENTS.filter(e => e.when(w) && !(safe && (e.id === 'captives')) && !(S.voyage && S.voyage.blessed && (e.id === 'storm' || e.id === 'spout'))); const bag = []; for (const e of pool) for (let i = 0; i < e.w(); i++) bag.push(e); if (!safe && (S.slots.length >= 3 || S.threat >= 30) && Math.random() < (S.threat >= 60 ? .2 : .05) * pirateLure()) { S.ev = pirateEvent(); return S.ev; }
  const e = pick(bag); S.ev = { id: e.id, title: e.title, text: e.text(), opts: e.opts() }; return S.ev; }
function choose(i) { const ev = S.ev; if (!ev) return null; const r = ev.opts[i].apply() || { text: '' }; S.ev = null; if (r.battle) { makeBattle(r.battle); return { battle: true }; } S.hull = Math.min(S.hullMax, S.hull);
  if (S.hull <= 0) return { ...r, wreck: wreck() }; return r; }
function wreck() { const back = S.voyage && S.voyage.from ? S.voyage.from : 'cheonghae'; const lost = S.slots.length; S.slots = []; S.hull = Math.round(S.hullMax * .4); S.gold = Math.round(S.gold * .9); S.t += 5;
  S.mode = 'port'; S.at = back; S.x = PORTS[back].x; S.y = PORTS[back].y; S.path = null; S.dest = null; return { port: back, lost }; }


/* ═══════════ 해전 ═══════════ */
const BOSSES = [
  { id: 'jang', name: '물귀신 장씨', ch: '水', ll: [124.55, 35.95], g: 'boarder', hp: 90, atk: 13, line: '서해 섬들을 주름잡는 두목. 배를 붙이고 뛰어드는 걸 즐긴다.' },
  { id: 'saburo', name: '외눈 사부로', ch: '眼', ll: [129.75, 33.85], g: 'archer', hp: 80, atk: 14, line: '대마 해협의 명궁. 멀찍이 떨어져 화살만 퍼붓는다.' },
  { id: 'wangdu', name: '붉은수염 왕두', ch: '髥', ll: [123.2, 30.15], g: 'fire', hp: 100, atk: 14, line: '주산 군도의 불화살 해적. 맞으면 짐이 탄다.' },
  { id: 'hong', name: '홍의 여적', ch: '紅', ll: [126.1, 32.55], g: 'archer', hp: 95, atk: 15, line: '붉은 옷을 입은 여해적. 탐라 남쪽 물길에 숨어 있다.' },
  { id: 'okuma', name: '바다늑대 오쿠마', ch: '狼', ll: [130.35, 31.0], g: 'boarder', hp: 110, atk: 16, line: '규슈 남쪽의 왜구 우두머리. 백병전에서 진 적이 없다.' },
  { id: 'ilang', name: '흑룡 이랑', ch: '龍', ll: [131.6, 38.6], g: 'tough', hp: 135, atk: 15, line: '동해 한복판을 떠도는 거대한 누선. 쉽게 가라앉지 않는다.' }
];
const GIMMICK = { plain: '', boarder: '배를 붙이려 든다', archer: '거리를 두고 활을 쏜다', fire: '불화살 — 맞으면 짐이 탈 수 있다', tough: '배가 크고 단단하다' };
const INTENT_W = {
  far: { plain: { shoot: 4, close: 4, aim: 2 }, archer: { shoot: 5, aim: 3, close: 1 }, boarder: { close: 6, shoot: 3, aim: 1 }, fire: { shoot: 3, aim: 4, close: 3 }, tough: { shoot: 4, close: 4, aim: 2 } },
  near: { plain: { board: 4, ram: 3, shoot: 1, retreat: 1 }, archer: { retreat: 5, shoot: 3, board: 1 }, boarder: { board: 6, ram: 3 }, fire: { board: 3, retreat: 3, ram: 2 }, tough: { ram: 5, board: 3, shoot: 1 } }
};
const yearOf = () => Math.floor(S.quotaN / 4);
const arrowDmg = () => Math.round((11 + 4 * S.tier) * (S.relics.bow ? 1.4 : 1) * (S.boons.hunter ? 1.3 : 1) * (hasMate('archer') ? 1.25 : 1));
const boardDmg = () => Math.round((24 + 6 * S.tier) * (S.cap === 'gungbok' ? 1.25 : 1) * (perk('deck') ? 1.3 : 1) * (S.boons.hunter ? 1.3 : 1) * (hasMate('ken') ? 1.25 : 1));
const fleeOdds = () => clamp(.35 + S.stamina / 250 + (S.boons.sails || 0) * .05, .1, .9);
/* 두목 체력: 배 크기(tk)와 난이도만 곱한다. 연차 배수(yk)는 두목에게 안 붙는다. 이야기가 억지로 붙이는 싸움(퀘스트·본 이야기)은 ×0.7 */
const bossHp = (b, forced) => Math.round(b.hp * (1 + .35 * S.tier) * dif().hp * dif().boss * (forced ? .7 : 1));
function makeBattle(spec) { // noted(노비 시장에서 이름을 적어 둠): 물귀신 장씨 배는 선원들이 더 거세게 쳐 hp ×0.9
  const tk = 1 + .35 * S.tier, yk = spec.boss ? 1 : 1 + .25 * yearOf(), D = dif(), forced = !!(spec.quest || spec.mainSpot);
  const e = { name: spec.name, ch: spec.ch || '賊', g: spec.g || 'plain', hp: Math.round(spec.hp * tk * yk * D.hp * (spec.boss ? D.boss : 1) * (forced ? .7 : 1) * (spec.boss === 'jang' && S.main && S.main.flags.noted ? .9 : 1)), atk: Math.round(spec.atk * (1 + .2 * S.tier) * (1 + .15 * yearOf()) * D.atk), boss: spec.boss || null, boss_nf: !!spec.boss, line: spec.line || GIMMICK[spec.g || 'plain'] };
  e.max = e.hp; S.battle = { e, dist: 'far', mom: 1, turn: 0, log: [], over: null, spec, charged: false, burned: 0 }; S.battle.intent = pickIntent(S.battle); S.stats.battles = (S.stats.battles || 0) + 1; return S.battle; }
function intentOf(B, k) { const a = B.e.atk, near = B.dist === 'near';
  const T = { hesitate: ['머뭇거린다', 0], shoot: [B.e.g === 'fire' ? '불화살을 쏜다' : '활을 쏜다', Math.round(a * (near ? .6 : .8))], aim: ['일제 사격을 준비한다 — 다음 수가 두 배', 0], volley: ['일제 사격!', Math.round(a * 2)],
    close: ['배를 붙여 온다', 0], retreat: ['거리를 벌린다', 0], ram: ['들이받는다', a], board: ['갈고리를 던진다 — 백병전', Math.round(a * 1.5)] };
  return { k, text: T[k][0], dmg: T[k][1] }; }
function pickIntent(B) { if (B.turn === 0 && S.relics.bell) return intentOf(B, 'hesitate'); if (B.charged) return intentOf(B, 'volley');
  const W = INTENT_W[B.dist][B.e.g] || INTENT_W[B.dist].plain; const bag = []; for (const [k, w] of Object.entries(W)) for (let i = 0; i < w; i++) bag.push(k); return intentOf(B, pick(bag)); }
function battleOpts() { const B = S.battle; if (!B || B.over) return []; const near = B.dist === 'near', I = B.intent;
  const ar = Math.round(arrowDmg() * (near ? .7 : 1) * B.mom * (I.k === 'close' ? 1.3 : 1));
  return [
    { id: 'shoot', ch: '弓', label: '활을 쏜다', sub: `피해 ${ar}${I.k === 'close' ? ' · 다가오는 놈 노리기 +30%' : ''}${B.mom > 1 ? ' · 기세' : ''}`, ok: true },
    { id: 'guard', ch: '盾', label: '방패를 세운다', sub: '받는 피해 -70% · 다음 공격 1.5배', ok: true },
    { id: 'move', ch: '帆', label: near ? '떨어진다' : '붙는다', sub: S.stamina < (hasMate('rower') ? 9 : 15) ? '기력이 없다' : `${near ? '갈고리·들이받기를 피한다' : '일제 사격을 반으로 줄인다 · 백병 가능'} · 기력 -${hasMate('rower') ? 9 : 15}`, ok: S.stamina >= (hasMate('rower') ? 9 : 15) },
    { id: 'board', ch: '劍', label: '뛰어든다', sub: near ? `백병 피해 ${Math.round(boardDmg() * B.mom * (I.k === 'board' ? 1.2 : 1))}${I.k === 'board' ? ' · 맞받아치기' : ''} · 반격을 조금 받는다` : '붙어 있어야 한다', ok: near },
    { id: 'flee', ch: '走', label: '달아난다', sub: near ? '떨어져 있어야 한다' : `가망 ${Math.round(fleeOdds() * 10)}할 · 기력 -35`, ok: !near && !B.e.boss_nf }
  ]; }
function battleAct(a) { const B = S.battle; if (!B || B.over) return null; const I = B.intent, e = B.e, L = []; let inc = 1, dealt = 0, self = 0;
  if (a === 'shoot') { dealt = Math.round(arrowDmg() * (B.dist === 'near' ? .7 : 1) * B.mom * (I.k === 'close' ? 1.3 : 1)); B.mom = 1; L.push(`화살을 퍼부었다. 적 -${dealt}`); }
  else if (a === 'guard') { inc = .3; B.mom = 1.5; L.push('방패를 세우고 숨을 고른다.'); }
  else if (a === 'move') { const mc = hasMate('rower') ? 9 : 15; if (S.stamina < mc) return null; S.stamina -= mc; B.dist = B.dist === 'near' ? 'far' : 'near'; L.push(B.dist === 'near' ? '뱃머리를 돌려 바짝 붙었다.' : '노를 저어 거리를 벌렸다.'); }
  else if (a === 'board') { if (B.dist !== 'near') return null; dealt = Math.round(boardDmg() * B.mom * (I.k === 'board' ? 1.2 : 1)); B.mom = 1; self = hasMate('ken') ? 0 : Math.round(e.atk * .35); L.push(`${I.k === 'board' ? '갈고리를 맞잡고 ' : ''}적선으로 뛰어들었다! 적 -${dealt}${hasMate('ken') ? ' · 겐이 반격을 막았다' : ''}`); }
  else if (a === 'flee') { if (B.dist !== 'far') return null; S.stamina = Math.max(0, S.stamina - 35); if (Math.random() < fleeOdds() + (S.stamina === 0 ? -.1 : 0)) { L.push('있는 힘껏 노를 저어 빠져나왔다.'); B.over = 'fled'; return endTurn(B, L); } L.push('달아나려 했지만 바람이 등을 돌렸다.'); }
  else if (a === 'surrender') { if (S.slots.length) { const s = S.slots.splice(ri(0, S.slots.length - 1), 1)[0]; L.push(`${G[s.id].name} 상자를 던져주고 빠져나왔다.`); } else { const c = Math.min(S.gold, tollCap()); S.gold -= c; L.push(`통행료 ${c.toLocaleString('ko-KR')}냥을 내고 빠져나왔다.`); } B.over = 'surrender'; return endTurn(B, L); }
  if (self) S.hull -= self;
  if (dealt) e.hp -= dealt; if (e.hp <= 0) { e.hp = 0; B.over = 'win'; L.push(`${e.name}${JO(e.name, '이', '가')} 기울어 가라앉는다!`); return endTurn(B, L); }
  // 적의 수. 예고된 큰 수를 받아내지 못하면(방패도, 파고들기도, 맞받아치기도 없이) 난이도만큼 더 아프다
  const near = B.dist === 'near', P = dif().punish;
  const missed = a !== 'guard' && (I.k === 'volley' ? !near : (I.k === 'board' || I.k === 'ram') && near && !(a === 'board' && I.k === 'board'));
  const pk = missed ? P : 1, pl = missed && P > 1 ? ' — 예고를 놓쳤다' : '';
  if (I.k === 'hesitate') L.push('적이 머뭇거린다. 바다신의 방울 소리 때문일까.');
  else if (I.k === 'aim') { B.charged = true; L.push('적이 활시위를 한껏 당긴다…'); }
  else if (I.k === 'close') { B.dist = 'near'; L.push('적이 배를 바짝 붙여 왔다.'); }
  else if (I.k === 'retreat') { B.dist = 'far'; L.push('적이 거리를 벌린다.'); }
  else if (I.k === 'shoot' || I.k === 'volley') { if (I.k === 'volley') B.charged = false; let d = I.k === 'volley' ? e.atk * 2 * (near ? .5 : 1) : e.atk * (near ? .6 : .8); d = Math.round(d * inc * pk); S.hull -= d;
    L.push(I.k === 'volley' ? `일제 사격이 쏟아졌다${near && a === 'move' ? ' — 파고들어 반은 피했다' : pl}. 선체 -${d}` : `${e.g === 'fire' ? '불화살' : '화살'}이 박힌다. 선체 -${d}`);
    if (e.g === 'fire' && inc > .5 && S.slots.length && Math.random() < .35) { const s = S.slots.splice(ri(0, S.slots.length - 1), 1)[0]; B.burned++; L.push(`${G[s.id].name} 상자에 불이 붙어 바다에 던졌다!`); } }
  else if (I.k === 'ram' || I.k === 'board') { if (!near) L.push(I.k === 'board' ? '갈고리가 허공을 쳤다!' : '적의 뱃머리가 헛돌았다!'); else { const d = Math.round(I.dmg * inc * pk); S.hull -= d; L.push(I.k === 'board' ? `적이 갑판으로 넘어왔다${pl}! 선체 -${d}` : `쾅! 들이받혔다${pl}. 선체 -${d}`); } }
  if (S.hull <= 0) { B.over = 'lose'; L.push('배가 무너진다…'); }
  return endTurn(B, L); }
function endTurn(B, L) { B.turn++; B.log = L; if (!B.over) B.intent = pickIntent(B); else B.result = battleFinish(B); return { log: L, over: B.over }; }
function battleFinish(B) { const e = B.e, spec = B.spec || {}, R = { over: B.over, gold: 0, fame: 0, notes: [] };
  if (B.over === 'win') { S.stats.wins = (S.stats.wins || 0) + 1; S.flags.pirateWin = 1; S.threat = Math.min(100, S.threat + 2);
    const loot = Math.round(ri(6, 14) * 100 * (1 + .6 * S.tier) * (1 + .3 * yearOf()) * (S.boons.hunter ? 2 : 1) * (e.boss ? 2 : spec.kind === 'black' ? 1.5 : 1) * dif().loot); S.gold += loot; R.gold += loot; acct('loot', loot);
    const fame = e.boss ? 150 : spec.kind === 'black' ? 60 : 30; S.fame += fame; R.fame += fame;
    if (spec.win === 'captives') { S.fame += 120; R.fame += 120; S.freed = (S.freed || 0) + 1; R.notes.push('갇혀 있던 서른 명을 풀어주었다. "청해진의 배다!"'); }
    if (e.boss) { const b = S.bounty && S.bounty.id === e.boss ? S.bounty : null; if (b) { S.gold += b.reward; R.gold += b.reward; R.bounty = b.reward; acct('loot', b.reward); S.bounty = null; S.stats.bounties = (S.stats.bounties || 0) + 1; } S.beaten[e.boss] = 1;
      const bd = BOSSES.find(x => x.id === e.boss); const m = addMap(3, { name: `${bd.name}의 숨긴 보물`, near: P(...bd.ll) }); if (m) R.map = m; }
    else if (Math.random() < (spec.kind === 'black' ? .6 : .3)) { const m = addMap(Math.random() < .3 ? 2 : 1); if (m) R.map = m; }
    if (spec.kind === 'black') { const R0 = S.rivals.find(r => r.id === 'black'); if (R0) { R0.cool = 40; R0.chasing = false; } } }
  if (B.over === 'win' && spec.quest && S.quests[spec.quest]) { S.quests[spec.quest].fought = true; }
  if (B.over !== 'win' && spec.quest && S.quests[spec.quest]) S.quests[spec.quest].cool = S.t + 4;
  if (B.over === 'win') { questEval(); mainTick(); }
  if (B.over !== 'win' && spec.mainSpot) S.main.cool = S.t + 4;
  if (B.over === 'lose') R.wreck = wreck();
  if (B.over === 'fled' && e.boss && S.bounty) S.bounty.cool = S.t + 4;
  if (B.over === 'surrender' && e.boss && S.bounty) S.bounty.cool = S.t + 4;
  if (B.burned) R.notes.push(`불에 탄 상자 ${B.burned}개`);
  S.hull = Math.min(S.hullMax, S.hull); return R; }
function battleClose() { const B = S.battle; S.battle = null; return B && B.result; }

/* ═══════════ 현상 수배 ═══════════ */
const BOUNTY_PORTS = ['cheonghae', 'dangeun', 'ulsan', 'jeoksan', 'deungju', 'yangzhou', 'mingzhou', 'hakata', 'naniwa', 'quanzhou', 'mizhou', 'chuzhou', 'laizhou', 'hangzhou', 'gimhae', 'izumo', 'hyeolgu'];
function bossSpot(b) { for (let i = 0; i < 30; i++) { const [cx, cy] = P(...b.ll); const a = Math.random() * 7, r = ri(0, 40); const [x, y] = nearestSea(cx + Math.cos(a) * r, cy + Math.sin(a) * r); if (seaAt(x, y) && findPath(PORTS.cheonghae.x, PORTS.cheonghae.y, x, y)) return [x, y]; } return nearestSea(...P(...b.ll)); }
const bountyReward = b => Math.round((2500 + quotaFor(S.quotaN) * .45 + b.hp * 30 * (1 + .35 * S.tier)) / 100) * 100;
/* 수배는 배 크기에 맞춰 나온다: 장씨·사부로는 중선부터, 왕두·여적은 대선부터, 오쿠마·이랑은 누선부터. 어선에는 수배가 안 붙는다 */
const BOSS_TIER = { jang: 1, saburo: 1, wangdu: 2, hong: 2, okuma: 3, ilang: 3 };
function makeBounty(k, force) { if (!BOUNTY_PORTS.includes(k)) return; const o = S.bOffers[k]; if (o && o.until > S.t) return;
  if (!force && Math.random() < .3) { S.bOffers[k] = { none: true, until: S.t + 20 }; return; }
  const fit = BOSSES.filter(b => (BOSS_TIER[b.id] || 1) <= S.tier); if (!fit.length) { S.bOffers[k] = { none: true, until: S.t + 10 }; return; }
  let pool = fit.filter(b => !S.beaten[b.id] && !(S.bounty && S.bounty.id === b.id)); if (!pool.length) { for (const b of fit) delete S.beaten[b.id]; pool = fit.filter(b => !(S.bounty && S.bounty.id === b.id)); } if (!pool.length) return;
  const b = pick(pool), [x, y] = bossSpot(b); S.bOffers[k] = { id: b.id, name: b.name, ch: b.ch, line: b.line, g: b.g, reward: bountyReward(b), days: 55, x, y, r: 45, until: S.t + 25, tier: BOSS_TIER[b.id] || 1, hp: bossHp(b) }; }
const bossRec = id => { const b = BOSSES.find(x => x.id === id); return b ? { tier: BOSS_TIER[id] || 1, ship: SHIPS[BOSS_TIER[id] || 1].name, hp: bossHp(b), arrow: arrowDmg(), board: boardDmg() } : null; }; // 수배 카드의 '권장' 줄
function acceptBounty(k) { const o = S.bOffers[k]; if (!o || o.none || S.bounty) return null; S.bounty = Object.assign({}, o, { due: S.t + o.days, from: k }); S.bOffers[k] = { none: true, until: S.t + 25 }; revealCircle(o.x, o.y, 50); return S.bounty; }
function bossBattle() { const bd = BOSSES.find(b => b.id === S.bounty.id); return makeBattle({ kind: 'boss', boss: bd.id, name: bd.name, ch: bd.ch, g: bd.g, hp: bd.hp, atk: bd.atk, line: bd.line }); }

/* ═══════════ 보물 지도 · 잠수 · 유물 ═══════════ */
const SITE_NAMES = ['침몰한 견당선', '가라앉은 절의 종', '발해 사신선 잔해', '왜구의 궤짝', '당 상선 잔해', '폭풍에 진 신라 배', '해적의 숨긴 배', '옛 왕의 공물선'];
const RELICS = [
  { id: 'scale', name: '용의 비늘', ch: '鱗', text: '폭풍에 받는 피해가 절반이 된다.' },
  { id: 'bell', name: '바다신의 방울', ch: '鈴', text: '해전 첫 수에 적이 머뭇거린다.' },
  { id: 'needle', name: '고래뼈 나침반', ch: '針', text: '항해가 8% 빨라진다.' },
  { id: 'bow', name: '옛 장군의 활', ch: '弓', text: '활 피해가 40% 오른다.' },
  { id: 'breath', name: '해녀의 숨비', ch: '息', text: '잠수할 때 숨이 40 더 길다.' },
  { id: 'kwanum', name: '바다 관음상', ch: '觀', text: '경계가 25% 덜 오른다.' },
  { id: 'anchor', name: '금빛 닻', ch: '錨', text: '선체 최대치가 30 오른다.' },
  { id: 'crown', name: '금관 조각', ch: '冠', text: '상납금이 1할 준다.' }
];
function addMap(lv, opt) { opt = opt || {}; if (S.maps.length >= 3) return null;
  for (let i = 0; i < 80; i++) { let x, y;
    if (opt.near) { const a = Math.random() * 7, r = ri(opt.rmin || 50, opt.rmax || 130); x = opt.near[0] + Math.cos(a) * r; y = opt.near[1] + Math.sin(a) * r; }
    else { x = ri(80, WORLD.w - 80); y = ri(80, WORLD.h - 80); }
    if (!seaAt(x, y) || !seaAt(x + 20, y) || !seaAt(x - 20, y) || !seaAt(x, y + 20) || !seaAt(x, y - 20)) continue;
    if (PORT_IDS.some(k => Math.hypot(PORTS[k].x - x, PORTS[k].y - y) < 110)) continue;
    if (S.maps.some(m => Math.hypot(m.x - x, m.y - y) < 160)) continue;
    if (!findPath(PORTS.cheonghae.x, PORTS.cheonghae.y, x, y)) continue;
    const m = { id: 'm' + Math.floor(S.t * 100) + i, x: Math.round(x), y: Math.round(y), r: 55, lv, name: opt.name || pick(SITE_NAMES) }; S.maps.push(m); revealCircle(x, y, 40); return m; }
  return null; }
function makeDive(site) { S.dive = { site, depth: 0, max: site.max || 5, breath: 100 + (S.relics.breath ? 40 : 0) + (hasMate('diver') ? 30 : 0), haul: [], last: null, over: null }; S.dive.full = S.dive.breath; S.stats.dives = (S.stats.dives || 0) + 1; return S.dive; }
const diveCost = D => 8 + (D.depth + 1) * 4;
const FAINT_DAYS = 2, GASP = 25, GASP_K = 3;
function rollDive(D) { const d = D.depth, lv = D.site.lv, pearl = D.site.pearl, gasp = D.breath < GASP ? GASP_K : 1; // 숨이 가쁘면 허우적대다 상어·해초에 더 걸린다
  const W = { silver: Math.max(8, 36 - d * 3), crate: pearl ? 6 : 16, relic: pearl ? 0 : lv >= 3 ? (d >= D.max ? 9999 : d >= 3 ? 30 : 0) : d >= 4 ? (lv === 2 ? 16 : 7) : 0, pearl: pearl ? 30 : 0, shark: (5 + d * 3) * gasp, weed: 9 * gasp, empty: 11, collapse: d >= 3 && !pearl ? 6 : 0 };
  const bag = []; for (const [k, w] of Object.entries(W)) for (let i = 0; i < w; i++) bag.push(k); const k = pick(bag);
  const mult = (1 + d * .6) * (lv === 3 ? 3 : lv === 2 ? 1.7 : 1) * (1 + .3 * yearOf());
  if (k === 'silver') { const g = Math.round(ri(5, 10) * 100 * mult / 10) * 10; return { k, ch: '銀', text: `은자 꾸러미 — ${g.toLocaleString('ko-KR')}냥`, gold: g, good: true }; }
  if (k === 'pearl') { const g = Math.round(ri(4, 9) * 100 * mult / 10) * 10; return { k, ch: '珠', text: `커다란 진주 — ${g.toLocaleString('ko-KR')}냥`, gold: g, good: true }; }
  if (k === 'crate') { const id = pick(pearl ? ['shell'] : ['silk', 'spice', 'gold', 'fur', 'porcelain']); return { k, ch: G[id].ch, text: `물이 안 든 ${G[id].name} 상자`, good: id, gold: 0 }; }
  if (k === 'relic') { const left = RELICS.filter(r => !S.relics[r.id] && !D.haul.some(h => h.relic === r.id)); if (!left.length) { const g = Math.round(5000 * lv * (1 + .3 * yearOf())); return { k: 'silver', ch: '寶', text: `금빛 보물함 — ${g.toLocaleString('ko-KR')}냥`, gold: g, good: true }; }
    const r = pick(left); return { k, ch: r.ch, text: `유물 — ${r.name}!`, relic: r.id, good: true }; }
  if (k === 'shark') { const b = ri(15, 25); return { k, ch: '鯊', text: `상어다! 피하느라 숨이 가빠진다. 숨 -${b}`, breath: b, bad: true }; }
  if (k === 'weed') { const b = ri(8, 14); return { k, ch: '藻', text: `해초에 발이 감겼다. 숨 -${b}`, breath: b, bad: true }; }
  if (k === 'collapse') return { k, ch: '崩', text: '썩은 갑판이 무너졌다! 방금 건진 것을 놓쳤다.', collapse: true, bad: true };
  return { k: 'empty', ch: '泥', text: '진흙뿐이다.' }; }
function diveAct(a) { const D = S.dive; if (!D || D.over) return null;
  if (a === 'up') { D.over = 'up'; D.result = diveFinish(D); return D; }
  if (D.depth >= D.max) return D;
  D.depth++; const cost = diveCost({ depth: D.depth - 1 }) + ri(0, 5); D.breath -= cost; const r = rollDive(D); D.last = r;
  if (r.breath) D.breath -= r.breath;
  if (r.collapse) { const lost = D.haul.pop(); r.lost = lost; if (!lost) r.text = '썩은 갑판이 무너졌다! 간신히 피했다.'; }
  if (r.gold || r.relic || (r.good && typeof r.good === 'string')) D.haul.push({ ch: r.ch, text: r.text, gold: r.gold || 0, crate: typeof r.good === 'string' ? r.good : null, relic: r.relic || null });
  if (D.breath <= 0) { // 숨이 끊기면 이번에 건진 것을 모두 놓치고, 잠수부가 앓아눕고, 선원들은 끌어올리느라 지친다
    D.breath = 0; D.over = 'blackout'; D.lostHaul = D.haul.splice(0); D.faint = FAINT_DAYS; S.t += FAINT_DAYS; S.stamina = 0; D.result = diveFinish(D); }
  return D; }
function gainRelic(id) { if (S.relics[id]) return; S.relics[id] = 1; if (id === 'anchor') { S.hullMax += 30; S.hull += 30; } }
function diveFinish(D) { const R = { gold: 0, crates: [], relics: [], sold: 0 };
  for (const h of D.haul) { if (h.gold) { S.gold += h.gold; R.gold += h.gold; } if (h.relic) { gainRelic(h.relic); R.relics.push(h.relic); }
    if (h.crate) { if (freeSlots()) { S.slots.push({ id: h.crate, cost: 0 }); R.crates.push(h.crate); } else { const g = Math.round(G[h.crate].base * LOT * .5); S.gold += g; R.gold += g; R.sold++; } } }
  acct('dive', R.gold); S.t += .4 + D.depth * .12; S.stats.relics = Object.keys(S.relics).length; return R; }
function diveClose() { const D = S.dive; S.dive = null; return D && D.result; }


/* ═══════════ 이야기 퀘스트 ═══════════ */
const QUESTS = [
  { id: 'chart', name: '할아버지의 해도', ch: '圖', giver: 'cheonghae', who: 'helm', intro: '청해진 창고 구석에서 곽이 좀먹은 해도를 꺼냈다. "우리 할아버지 해도요. 세 군데에 붉은 점이 찍혀 있소. 무엇이 있는지 평생 궁금했지."',
    steps: [{ text: '첫 번째 붉은 점 — 흑산도 남서쪽 먼바다의 가거도를 찾는다', goal: { type: 'find', id: 'gageo' }, done: '가거도 바위에 할아버지의 이름이 새겨져 있다. 곽이 손끝으로 쓸어본다.', reward: { gold: 1200, fame: 30 } },
      { text: '두 번째 붉은 점 — 탐라와 뭍 사이 추자도를 찾는다', goal: { type: 'find', id: 'chuja' }, done: '추자도 동굴 벽에 화살표가 그려져 있다. 남쪽, 물에 잠긴 섬을 가리킨다.', reward: { gold: 1500, fame: 30 } },
      { text: '세 번째 붉은 점 — 탐라 남서쪽, 물에 잠긴 이어도를 찾는다', goal: { type: 'find', id: 'ieodo' }, done: '이어도 물 밑에서 곽이 끝내 울었다. 할아버지가 남긴 마지막 해도가 바위틈 통 속에 있었다.', reward: { gold: 2000, fame: 100, map: 3, mapName: '할아버지의 보물' } }] },
  { id: 'monk', name: '적산의 승려', ch: '僧', giver: 'jeoksan', intro: '법화원 객사에 왜의 젊은 승려 원진이 묵고 있다. "장안에 가려면 공험(통행증)이 있어야 합니다. 그리고 언젠가는… 고향으로 돌아가야 하지요."',
    steps: [{ text: '원진을 태우고 등주 관청에 가서 공험을 받는다', goal: { type: 'port', k: 'deungju' }, done: '관리가 도장을 찍었다. 원진이 공험을 품에 안고 운다.', reward: { gold: 800, fame: 30 } },
      { text: '초주 신라방에 인삼 2상자를 바쳐 원진의 노잣돈을 마련한다', goal: { type: 'deliver', k: 'chuzhou', good: 'ginseng', n: 2 }, done: '신라방 사람들이 인삼을 받고 원진의 여비를 모아주었다.', reward: { gold: 4500, fame: 40 } },
      { text: '순례를 마친 원진을 하카타까지 태워 간다', goal: { type: 'port', k: 'hakata' }, done: '원진이 고향 땅에 엎드린다. "이 은혜, 바다신께 빌겠습니다." 그가 낡은 방울 하나를 건넨다.', reward: { gold: 4000, fame: 120, relic: 'bell' } }] },
  { id: 'navy', name: '해적의 뿌리', ch: '軍', giver: 'dangeun', intro: '당은포 수군장이 탁자를 내리친다. "신라 사람을 잡아다 당에 파는 놈들이 있소. 서해 해적의 뿌리를 뽑아주시오."',
    steps: [{ text: '해적과 싸워 두 번 이긴다', goal: { type: 'wins', n: 2 }, done: '해적 둘을 잡아 넘겼다. 놈들이 두목의 소굴을 불었다.', reward: { gold: 2000, fame: 40 } },
      { text: '서해 섬 사이 소굴에서 물귀신 장씨를 친다', goal: { type: 'fight', ll: [124.55, 35.95], boss: 'jang', name: '물귀신 장씨의 소굴' }, done: '장씨의 배가 가라앉았다. 소굴에 갇혀 있던 신라 사람들이 풀려났다.', reward: { fame: 80 } },
      { text: '당은포 수군장에게 돌아가 알린다', goal: { type: 'port', k: 'dangeun' }, done: '수군장이 옛 장군의 활을 내민다. "이건 당신이 가져야 하오."', reward: { gold: 6000, fame: 150, relic: 'bow' } }] },
  { id: 'balhae', name: '발해의 사신', ch: '使', giver: 'ulsan', intro: '울산 포구에서 발해 말씨의 사내가 다가온다. "왜로 가는 사신 배가 폭풍에 흩어졌소. 남경으로 가서 남은 일행을 찾아주시오."',
    steps: [{ text: '동해안을 따라 북쪽 발해 땅, 남경 포구를 찾는다', goal: { type: 'port', k: 'namgyeong' }, done: '남경 포구에 사신 일행이 발이 묶여 있었다. 담비가죽을 왜 조정에 바쳐야 한다고 한다.', reward: { gold: 2000, fame: 60 } },
      { text: '담비가죽 3상자를 왜의 북쪽 바다 쓰루가에 전한다', goal: { type: 'deliver', k: 'tsuruga', good: 'fur', n: 3 }, done: '송원관 관리가 사신의 물건을 받았다. 발해와 왜 사이에 다시 길이 열렸다.', reward: { gold: 9000, fame: 100 } },
      { text: '사신선이 처음 닿았다는 노토 곶을 찾는다', goal: { type: 'find', id: 'noto' }, done: '노토 곶 바위에 발해 사신들의 고래뼈 나침반이 걸려 있다. 오래된 약속이었다.', reward: { gold: 3000, fame: 80, relic: 'needle' } }] },
  { id: 'south', name: '남쪽 바다 끝', ch: '南', giver: 'mingzhou', intro: '명주 부두의 늙은 대식 뱃사람이 남쪽을 가리킨다. "큰 섬 너머에 천주라는 항구가 있지. 그 너머 바다 밑엔 계단이 있다더군."',
    steps: [{ text: '남쪽 큰 섬의 북쪽 끝, 이주를 찾는다', goal: { type: 'find', id: 'yizhou' }, done: '이주 언덕에서 서쪽 바다 건너 불빛이 보인다.', reward: { gold: 1500, fame: 40 } },
      { text: '천주 포구에 닻을 내린다', goal: { type: 'port', k: 'quanzhou' }, done: '천주에는 페르시아와 아랍 배가 가득하다. 늙은 뱃사람의 말이 맞았다.', reward: { gold: 2500, fame: 60 } },
      { text: '이주 동쪽 바다 밑 돌계단을 찾는다', goal: { type: 'find', id: 'yonaguni' }, done: '돌계단 맨 아래, 비늘 같은 것이 반짝인다. 용의 비늘이라 불리는 것이다.', reward: { gold: 4000, fame: 120, relic: 'scale' } }] },
  { id: 'books', name: '신라방 장부', ch: '簿', giver: 'mizhou', intro: '밀주 신라방의 큰손 설씨가 장부를 펼친다. "서라벌 귀족은 책에, 가야 대장장이는 차에, 당의 장인은 쇠에 목말라 하오. 세 길을 다 뚫으면 동업자로 모시겠소."',
    steps: [{ text: '서적 2상자를 울산에 가져간다 (내주·초주에서 난다)', goal: { type: 'deliver', k: 'ulsan', good: 'books', n: 2 }, done: '서라벌 귀족들이 책을 보자 눈이 뒤집혔다.', reward: { gold: 5000, fame: 40 } },
      { text: '차 2상자를 김해에 가져간다 (밀주·항주에서 난다)', goal: { type: 'deliver', k: 'gimhae', good: 'tea', n: 2 }, done: '가야 대장장이들이 찻잔을 돌린다.', reward: { gold: 4000, fame: 40 } },
      { text: '덩이쇠 3상자를 항주에 가져간다 (김해·이즈모에서 난다)', goal: { type: 'deliver', k: 'hangzhou', good: 'iron', n: 3 }, done: '설씨가 금관 조각을 내민다. "동업의 증표요. 서라벌 조정도 이걸 보면 세금을 깎아줄 거요."', reward: { gold: 7000, fame: 120, relic: 'crown' } }] },
  { id: 'whale', name: '고래의 노래', ch: '鯨', giver: 'samcheok', intro: '실직 바닷가의 늙은 어부가 노래를 부른다. "고래는 봄마다 북으로 간다네. 고래 길 끝에 큰 강, 그 강 끝에 발해가 있다네."',
    steps: [{ text: '동해 한복판 고래 길을 찾는다', goal: { type: 'find', id: 'whaleroad' }, done: '고래 떼가 배 밑을 지나간다. 어부의 노래가 맞았다.', reward: { gold: 1500, fame: 40 } },
      { text: '고래 길 끝, 두만강 하구를 찾는다', goal: { type: 'find', id: 'tumen' }, done: '강가에 사슴 떼. 발해 사냥꾼이 손을 흔든다.', reward: { gold: 2000, fame: 50 } },
      { text: '실직으로 돌아가 노래를 들려준다', goal: { type: 'port', k: 'samcheok' }, done: '어부가 숨비소리 같은 휘파람을 가르쳐 준다. 바다 밑에서 숨을 아끼는 법이다.', reward: { gold: 2500, fame: 80, relic: 'breath' } }] },
  { id: 'brothers', name: '바다로 간 형제', ch: '兄', giver: 'gimhae', intro: '김해 대장간의 늙은 대장장이가 쇠를 두드리다 말고 묻는다. "배가 있소? 아들 둘이 삼 년 전 왜로 갔는데 소식이 없소. 큰놈은 이즈모 대장간에, 작은놈은… 모르오."',
    steps: [{ text: '이즈모에 가서 큰아들을 찾는다', goal: { type: 'port', k: 'izumo' }, done: '이즈모 대장간에 큰아들이 있었다. "아버지가요? 동생은… 사쓰마로 갔다가 해적에게 잡혔습니다."', reward: { gold: 800, fame: 30 } },
      { text: '규슈 남쪽 바다에서 바다늑대 오쿠마를 쳐서 작은아들을 구한다', goal: { type: 'fight', ll: [130.35, 31.0], boss: 'okuma', name: '오쿠마의 노예선' }, done: '오쿠마의 선창 바닥에서 작은아들을 찾았다. 쇠를 다루던 손이 노를 젓느라 굳어 있었다.', reward: { fame: 80 } },
      { text: '두 아들을 김해로 데려간다', goal: { type: 'port', k: 'gimhae' }, done: '대장장이가 망치를 떨어뜨렸다. 세 사람이 한참을 안고 있었다. "대사. 쇠는 평생 반값이오."', reward: { gold: 3000, fame: 120, deal: 'gimhae' } }] },
  { id: 'widow', name: '등불을 든 여인', ch: '燈', giver: 'tamna', intro: '탐라 포구 끝 바위에 밤마다 등불을 든 여인이 선다. "남편이 당으로 갔어요. 명주 포구에서 배를 바꿔 탔다는 게 마지막이에요. 산 사람인지 죽은 사람인지, 그것만 알면 됩니다."',
    steps: [{ text: '명주에서 남편의 흔적을 묻는다', goal: { type: 'port', k: 'mingzhou' }, done: '명주 조선소 장부에 이름이 있었다. 천주로 가는 대식 배에 탔다. 일 년 전.', reward: { gold: 600, fame: 20 } },
      { text: '천주에서 대식 상인들에게 묻는다', goal: { type: 'port', k: 'quanzhou' }, done: '대식 상인이 기억했다. "그 신라 사람? 배가 뒤집혔소. 보타산 앞바다에서. 살아 돌아온 이는 셋이고 그는… 아니었소."', reward: { gold: 1000, fame: 40 } },
      { text: '보타산을 찾아 등불을 하나 띄운다', goal: { type: 'find', id: 'putuo' }, done: '보타산 앞바다에 등불을 띄웠다. 탐라로 돌아가면 그 여인에게 말해야 한다. 산 사람이 아니라는 걸.', reward: { fame: 60 } },
      { text: '탐라로 돌아가 여인에게 말한다', goal: { type: 'port', k: 'tamna' }, done: '여인이 등불을 껐다. 한참 뒤에 말했다. "고맙습니다. 이제 잘 수 있겠네요." 다음 날 그녀는 야광패 한 상자를 배에 두고 갔다.', reward: { gold: 2000, fame: 100, crate: 'shell' } }] },
  { id: 'letter', name: '당으로 가는 편지', ch: '信', giver: 'hyeolgu', intro: '혈구진 객사의 늙은 신라 관리가 봉인된 편지를 내민다. "장안의 신라 유학생에게 가는 편지요. 내 아들이오. 당 관리 손을 거치면 뜯어볼 거요. 적산 신라방 → 초주 신라방 → 그다음은 그들이 알아서 하오."',
    steps: [{ text: '편지를 적산 신라방에 전한다', goal: { type: 'port', k: 'jeoksan' }, done: '적산 신라방이 편지를 받아 봉인을 확인했다. "초주까지는 우리가 못 가오. 대사가 가 주시오."', reward: { gold: 500, fame: 20 } },
      { text: '초주 신라방에 전한다', goal: { type: 'port', k: 'chuzhou' }, done: '초주 신라방 큰어른이 편지를 품에 넣었다. "운하로 올려 보내겠소. 답장은 두 달 뒤 혈구진으로."', reward: { gold: 1500, fame: 40 } },
      { text: '두 달 뒤 혈구진에 돌아가 답장을 받는다', goal: { type: 'port', k: 'hyeolgu', wait: 60 }, done: '답장이 와 있었다. 늙은 관리가 소리 내어 읽다가 울었다. 아들이 과거에 붙었다. "이 편지를 나르는 배는 영원히 혈구진 세를 안 내오."', reward: { gold: 4000, fame: 100, relic: 'kwanum' } }] },
  { id: 'map2', name: '왕두의 유언', ch: '髥', giver: 'wenzhou', when: () => !!S.beaten.wangdu, intro: '온주 선술집의 외다리 사내가 당신을 알아본다. "붉은수염 왕두를 잡은 배지? 나는 그놈 키잡이였소. 놈이 죽기 전에 한 말이 있소. 세 섬에 나눠 묻었다고. 값은… 나를 배에 태워 주시오."',
    steps: [{ text: '도카라 열도를 찾는다', goal: { type: 'find', id: 'tokara' }, done: '도카라 화산섬 바위틈에서 첫 항아리를 찾았다. 은자다.', reward: { gold: 3000, fame: 40 } },
      { text: '아마미에 닻을 내린다', goal: { type: 'port', k: 'amami' }, done: '아마미 노인이 왕두를 기억했다. "그놈이 묻은 게 아니라 우리에게 맡겼소. 반은 우리가 썼고." 남은 반을 받았다.', reward: { gold: 4000, fame: 40 } },
      { text: '구름 숲 섬에서 마지막 항아리를 찾는다', goal: { type: 'find', id: 'yaku' }, done: '천 년 삼나무 밑에서 마지막 항아리. 안에는 금이 아니라 해도 한 장. 외다리 키잡이가 웃었다. "그놈다운 유언이오."', reward: { gold: 2000, fame: 80, map: 3, mapName: '왕두의 진짜 보물' } }] }
];
const QBY = Object.fromEntries(QUESTS.map(q => [q.id, q]));
const qStep = id => { const st = S.quests[id]; return st && !st.done ? QBY[id].steps[st.step] : null; };
function offerQuests(k) { for (const q of QUESTS) if (q.giver === k && !S.quests[q.id] && !(q.when && !q.when()) && !(S.qDecl[q.id] > S.t) && !S.pending.includes('quest:' + q.id)) S.pending.push('quest:' + q.id); }
function startQuest(id) { const q = QBY[id]; if (!q || S.quests[id]) return; S.quests[id] = { step: 0, base: S.stats.wins || 0, t0: S.t }; questEval(); }
function goalMet(id) { const st = S.quests[id], g = qStep(id).goal;
  if (g.type === 'port') { if (S.mode !== 'port' || S.at !== g.k) return false; if (g.wait) { const st0 = S.quests[id]; return S.t - (st0.tStep || st0.t0 || 0) >= g.wait; } return true; }
  if (g.type === 'find') return !!S.found[g.id];
  if (g.type === 'wins') return (S.stats.wins || 0) - st.base >= g.n;
  if (g.type === 'fight') return !!st.fought;
  if (g.type === 'deliver') { if (S.mode !== 'port' || S.at !== g.k) return false; return S.slots.filter(x => x.id === g.good && x.from !== g.k).length >= g.n; }
  return false; }
function questEval() { if (!S || !S.quests) return []; const out = [];
  for (const id of Object.keys(S.quests)) { let guard = 0; while (qStep(id) && goalMet(id) && guard++ < 5) { const q = QBY[id], st = S.quests[id], step = q.steps[st.step], g = step.goal;
      if (g.type === 'deliver') { let n = g.n; for (let i = S.slots.length - 1; i >= 0 && n; i--) if (S.slots[i].id === g.good && S.slots[i].from !== g.k) { S.slots.splice(i, 1); n--; } }
      const R = step.reward || {}, got = []; if (R.gold) { S.gold += R.gold; got.push(`+${R.gold.toLocaleString('ko-KR')}냥`); } if (R.fame) { S.fame += R.fame; got.push(`명성 +${R.fame}`); }
      if (R.relic) { if (!S.relics[R.relic]) { gainRelic(R.relic); const r = RELICS.find(x => x.id === R.relic); got.push(`유물 ${r.ch} ${r.name} — ${r.text}`); } else { S.gold += 3000; got.push('+3,000냥 (이미 가진 유물 대신)'); } }
      if (R.map) { const m = addMap(R.map, { name: R.mapName }); if (m) got.push(`寶 ${m.name}`); }
      if (R.crate) { if (freeSlots()) { S.slots.push({ id: R.crate, cost: 0 }); got.push(`${G[R.crate].name} 한 상자`); } else { S.gold += 2000; got.push('+2,000냥 (선창이 차서)'); } }
      if (R.deal) { S.flags['deal_' + R.deal] = 1; got.push(`${PORTS[R.deal].name}의 특별 거래가 영원히 반값`); }
      st.step++; st.tStep = S.t; const fin = st.step >= q.steps.length; if (fin) { st.done = true; S.stats.quests = (S.stats.quests || 0) + 1; }
      const note = { id, name: q.name, ch: q.ch, text: step.done, got, fin, next: fin ? null : q.steps[st.step].text, n: st.step, of: q.steps.length }; S.qNotes.push(note); out.push(note); } }
  return out; }
function questSpots() { const out = []; for (const id of Object.keys(S.quests)) { const step = qStep(id); if (!step) continue; const g = step.goal;
    if (g.type === 'fight' && !S.quests[id].fought) { const [x, y] = nearestSea(...P(...g.ll)); out.push({ id, kind: 'fight', x, y, r: 45, name: g.name, g }); } }
  return out; }
/* 도감: 해역을 다 찾으면 보상 */
function regionCheck() { const out = []; for (const r of REGIONS) { if (S.regions[r]) continue; const fs = FINDS.filter(f => f.region === r); if (fs.length && fs.every(f => S.found[f.id])) { S.regions[r] = 1; const g = 2500 + 500 * fs.length; S.gold += g; S.fame += 100; const m = addMap(2, { name: `${r}의 숨은 보물` }); out.push({ type: 'region', region: r, gold: g, map: m }); } } return out; }


/* ═══════════ 본 이야기 (선장마다 막 구성) ═══════════ */
const NUM = ['一', '二', '三', '四', '五'];
const B0 = () => S.main.base;
const G_ = {
  quota: n => ({ text: `상납을 ${n}번 바친다`, ok: () => S.quotaN - B0().quotaN >= n, prog: () => `${Math.min(n, S.quotaN - B0().quotaN)}/${n}` }),
  wins: n => ({ text: `해전에서 ${n}번 이긴다`, ok: () => (S.stats.wins || 0) - B0().wins >= n, prog: () => `${Math.min(n, (S.stats.wins || 0) - B0().wins)}/${n}` }),
  freed: n => ({ text: '노예선을 습격해 붙잡힌 사람들을 구한다', ok: () => (S.freed || 0) - B0().freed >= n, prog: () => `${Math.min(n, (S.freed || 0) - B0().freed)}/${n}`, spot: { ll: [123.75, 34.75], name: '노예선 무리', spec: { kind: 'slaver', name: '노예선 선단', ch: '奴', g: 'archer', hp: 60, atk: 11, win: 'captives' } } }),
  fame: n => ({ text: `명성 ${n.toLocaleString('ko-KR')}에 이른다`, ok: () => S.fame >= n, prog: () => `${Math.min(n, Math.round(S.fame)).toLocaleString('ko-KR')}/${n.toLocaleString('ko-KR')}` }),
  orders: n => ({ text: `의뢰를 ${n}건 해낸다`, ok: () => S.stats.orders - B0().orders >= n, prog: () => `${Math.min(n, S.stats.orders - B0().orders)}/${n}` }),
  profit: n => ({ text: `장사로 이익 ${n.toLocaleString('ko-KR')}냥을 더 낸다`, ok: () => S.stats.profit - B0().profit >= n, prog: () => `${Math.max(0, Math.round((S.stats.profit - B0().profit) / 1000))}천/${Math.round(n / 1000)}천` }),
  visit: (k, after) => ({ text: `${PORTS[k].name}에 닻을 내린다`, k, ok: () => !!S.main.visits[k] && (after == null || S.main.visits[k] > (S.main.visits[after] || 1e9)), prog: () => S.main.visits[k] ? '✓' : '' }),
  visits: ks => ({ text: `${ks.map(k => PORTS[k].name).join('·')}에 들른다`, ok: () => ks.every(k => S.main.visits[k]), prog: () => `${ks.filter(k => S.main.visits[k]).length}/${ks.length}` }),
  pay: (k, n, what) => ({ text: `${PORTS[k].name}에서 ${what} ${n.toLocaleString('ko-KR')}냥을 낸다`, pay: { k, n }, ok: () => !!S.main.paid[k + n], prog: () => S.main.paid[k + n] ? '✓' : '' }),
  deliver: (k, good, n) => ({ text: `${G[good].name} ${n}상자를 ${PORTS[k].name}로 가져간다`, deliver: { k, good, n }, ok: () => !!S.main.paid['d' + k + good] }),
  calm: n => ({ text: `경계를 ${n} 아래로 두고 버틴다`, ok: () => S.threat < n, prog: () => `${Math.round(S.threat)}` })
};
const ARCS = {
  gungbok: { name: '해상왕의 길', acts: [
    { title: '청해진', at: () => true, intro: '828년 봄. 당의 무령군에서 소장까지 지낸 궁복이 고향 완도로 돌아왔다. 신라 사람들이 해적에게 붙잡혀 당에 노비로 팔려 가는 꼴을 더는 볼 수 없었다. 흥덕왕은 군사 1만과 「청해진대사」라는 직함을 내렸다. 다만 — 군자금은 스스로 마련하라 했다.',
      goals: () => [G_.quota(2), G_.wins(1)], outro: '청해진 목책이 올라갔다. 바닷가 사람들이 궁복을 「대사」라 부르기 시작한다.', reward: { gold: 3000, fame: 100 } },
    { title: '노예 상인', at: () => S.quotaN >= 2, intro: '당의 해적들이 여전히 신라 사람을 사고판다. 등주와 초주의 노비 시장에서 신라 말이 들린다. 서해 섬 그늘에 노예선 선단이 숨어 있다는 소식이다. 바다 위에서 끊어야 한다.',
      goals: () => [G_.freed(1), G_.fame(900)], outro: '그해 이후 신라 사람이 노비로 팔려 가는 일이 끊겼다 — 훗날 사서는 그렇게 적는다. 서해의 뱃사람들이 청해진 깃발을 보면 노를 멈추고 절을 한다.', reward: { gold: 5000, fame: 150 } },
    { title: '적산 법화원', at: () => S.quotaN >= 4, intro: '당 산동의 적산촌. 신라 사람들이 모여 사는 그곳에 절을 세우면, 당 땅 어디서든 신라 상인이 기댈 곳이 생긴다. 해마다 쌀 오백 석이 드는 큰 절이다.',
      goals: () => [G_.pay('jeoksan', 12000, '법화원 시주'), G_.visits(['mizhou', 'chuzhou', 'deungju'])], outro: '법화원 종소리가 적산 앞바다에 퍼진다. 훗날 왜의 승려 엔닌이 이곳에 묵으며 일기에 대사의 이름을 적을 것이다. 신라방마다 대사의 사람들이 생겼다.', reward: { gold: 3000, fame: 200, boon: 'tang' } },
    { title: '왕자의 망명', at: () => S.quotaN >= 5, intro: '서라벌에서 왕위 다툼이 터졌다. 싸움에 진 왕족 김우징이 가족을 데리고 청해진으로 도망쳐 왔다. "대사, 나를 도와 원수를 갚게 해주시오. 그리하면 대사의 딸을 내 아들의 비로 삼겠소."',
      choice: [{ id: 'accept', label: '김우징을 받아들인다', sub: '군사를 일으킨다 · 조정의 눈이 따가워진다', flag: 'woojing' }, { id: 'refuse', label: '정중히 돌려보낸다', sub: '청해진은 바다의 일만 한다', flag: 'refused' }],
      goals: () => S.main.flags.woojing ? [G_.pay('cheonghae', 30000, '군자금'), G_.wins(3)] : [G_.quota(2), G_.calm(50)],
      outro: () => S.main.flags.woojing ? '청해진 군사 5천이 서라벌로 진격했다. 김우징이 왕위에 올랐다 — 신무왕. 대사는 감의군사가 되었다. 서라벌 귀족들이 이를 간다.' : '김우징은 다른 배를 타고 떠났다. 청해진은 조용하다. 바다 건너 사람들은 대사를 두고 "왕 따위엔 관심 없는 사람"이라 수군거린다.',
      reward: () => S.main.flags.woojing ? { gold: 8000, fame: 400, threat: 25 } : { gold: 4000, fame: 150, threat: -20 } },
    { title: '염장', at: () => S.quotaN >= 7, intro: () => S.main.flags.woojing ? '신무왕은 즉위 반년 만에 세상을 떠났다. 새 왕은 약속한 혼인을 미룬다. 귀족들은 "섬사람의 딸을 왕비로 들일 수 없다"고 한다. 그러던 어느 날, 무주의 장수 염장이 청해진에 투항하겠다며 찾아왔다.' : '서라벌의 새 왕은 바다 건너 청해진이 두렵다. 그러던 어느 날, 무주의 장수 염장이 청해진에 투항하겠다며 찾아왔다.',
      goals: () => [G_.fame(2200), G_.visit('cheonghae')], final: true,
      ending: [{ label: '술상을 차려 맞이한다', sub: '옛 동무를 믿는다', end: () => (perk('deck') && !S.main.flags.bum_away) || S.main.flags.bum_guard ? 'sea_king' : 'yeomjang' },
        { label: '의심하고 돌려보낸다', sub: '청해진의 문을 닫는다', end: () => S.main.flags.woojing ? 'throne' : 'sea_king' },
        { label: '청해진을 떠난다', sub: '배 한 척만 남기고 바다로', end: () => 'wander' }] }
  ] },
  ara: { name: '신라방의 딸', acts: [
    { title: '신라방', at: () => true, intro: '적산 신라방 객주의 딸 아라. 아버지가 남긴 것은 빚 문서 한 묶음과 낡은 배 한 척. 그 사이 왕씨 상단이 신라방 장사를 하나씩 집어삼키고 있다.', goals: () => [G_.quota(2), G_.orders(3)], outro: '신라방 사람들이 다시 아라의 객주에 짐을 맡긴다. "그 집 딸이 아비보다 낫다."', reward: { gold: 3000, fame: 100 } },
    { title: '왕씨와의 승부', at: () => S.quotaN >= 3, intro: '왕씨 상단 큰아들이 찾아왔다. "한 철 동안 누가 더 버는지 겨뤄 봅시다. 지는 쪽이 등주 뱃길에서 손을 떼는 거요." 사람들이 내기를 건다.', goals: () => [G_.profit(S.main.flags.allyBonus ? 15000 : 30000), G_.visit('yangzhou')], outro: '왕씨 상단이 등주 뱃길에서 물러났다. 왕씨 큰아들이 술잔을 내민다. "다음엔 안 지오."', reward: { gold: 6000, fame: 150 } },
    { title: '청해진의 몰락', at: () => S.quotaN >= 5, intro: '청해진에서 비보가 왔다. 장보고 대사가 자객의 칼에 쓰러졌다. 청해진 사람들이 배를 타고 흩어지고 있다. 신라방은 그들을 받아줄 것인가 — 당 관리들은 이미 눈치를 본다.',
      choice: [{ id: 'take', label: '유민을 받아들인다', sub: '청해진에서 사람들을 태워 온다', flag: 'refuge' }, { id: 'shut', label: '문을 닫는다', sub: '신라방부터 지킨다', flag: 'shut' }],
      goals: () => S.main.flags.refuge ? [G_.visit('cheonghae'), G_.visit('jeoksan', 'cheonghae')] : [G_.quota(2), G_.calm(45)],
      outro: () => S.main.flags.refuge ? '청해진 사람 삼백이 적산에 내렸다. 뱃사람, 목수, 활잡이. 아라의 배에 손이 넘친다.' : '신라방은 조용히 문을 닫았다. 바다 건너에서 원망 섞인 소문이 들려온다.', reward: () => S.main.flags.refuge ? { gold: 2000, fame: 300 } : { gold: 6000, fame: 0, threat: -20 } },
    { title: '회창의 바람', at: () => S.quotaN >= 7, intro: '당 황제가 불교를 금했다. 법화원이 헐리고 승려들이 쫓겨난다. 관리들이 신라방에도 들이닥쳐 장부를 뒤진다. 바다로 갈 것인가, 버틸 것인가.',
      goals: () => [G_.fame(1800), G_.visit('jeoksan')], final: true,
      ending: [{ label: '신라방 사람들을 이끌고 바다로', sub: '배가 집이 된다', end: () => S.main.flags.refuge ? 'ara_true' : 'ara_alone' },
        { label: '관리에게 2만 냥을 쥐여주고 버틴다', sub: '당의 상인으로 남는다', end: () => { S.gold = Math.max(0, S.gold - 20000); return 'ara_merchant'; } }] }
  ] },
  tomo: { name: '그림자 상인', acts: [
    { title: '다자이후의 눈', at: () => true, intro: '하카타의 밀무역상 도모. 왜 조정은 외국과의 사사로운 거래를 금한다. 그러나 다자이후 관리들도 당의 비단은 좋아한다. 눈을 감게 만드는 것은 결국 돈이다.', goals: () => [G_.quota(2), G_.visit('naniwa')], outro: '나니와 귀족들 사이에서 "하카타의 도모"라는 이름이 오르내린다.', reward: { gold: 3000, fame: 100 } },
    { title: '회역사', at: () => S.quotaN >= 3, intro: '왜 조정의 관리 훈야노 미야타마로가 은밀히 부른다. "청해진 장보고와 거래를 트고 싶소. 비단 값은 미리 치르겠소. 그대가 다리를 놓으시오."', goals: () => [G_.visit('cheonghae'), G_.deliver('hakata', 'silk', 3)], outro: '미야타마로가 흡족해한다. 청해진의 회역사가 하카타에 드나들기 시작했다. 도모의 이름이 조정 장부에 들어갔다.', reward: { gold: 7000, fame: 150 } },
    { title: '몰수', at: () => S.quotaN >= 5, intro: '청해진 대사가 죽었다는 소식. 미야타마로는 청해진 사람이 싣고 온 물건을 "빚 대신"이라며 몰수했다. 청해진의 회역사 이충이 도모를 찾아와 무릎을 꿇는다. "물건을 되찾게 도와주시오."',
      choice: [{ id: 'help', label: '이충을 돕는다', sub: '조정을 상대로 판을 벌인다', flag: 'help' }, { id: 'buy', label: '몰수품을 헐값에 사들인다', sub: '남의 불행도 장사다', flag: 'buy' }],
      goals: () => S.main.flags.help ? [G_.pay('hakata', 15000, '관리들 입막음값'), G_.visit('cheonghae')] : [G_.pay('hakata', 8000, '몰수품 값'), G_.profit(25000)],
      outro: () => S.main.flags.help ? '이충은 물건을 되찾아 신라로 돌아갔다. 청해진 유민들이 도모를 「바다 건너 다리」라 부른다.' : '몰수품은 비싸게 팔렸다. 하지만 하카타 부두에서 신라 뱃사람들이 도모를 보면 침을 뱉는다.',
      reward: () => S.main.flags.help ? { gold: 3000, fame: 300 } : { gold: 12000, fame: 0, threat: 15 } },
    { title: '바다의 그림자', at: () => S.quotaN >= 7, intro: '다자이후에 새 관리가 왔다. 밀무역을 뿌리 뽑겠다고 한다. 도모의 이름이 맨 위에 적혀 있다.',
      goals: () => [G_.fame(1500), G_.visit('hakata')], final: true,
      ending: [{ label: '신라·당·왜를 잇는 상단을 세운다', sub: '그림자에서 나온다', end: () => S.main.flags.help ? 'tomo_true' : 'tomo_shadow' },
        { label: '이름을 버리고 남쪽 섬으로', sub: '유구에서 새로 시작한다', end: () => 'tomo_exile' }] }
  ] }
};
const ENDINGS = {
  sea_king: { title: '해상왕', ch: '海', kind: 'true', text: '염장의 칼은 끝내 대사에게 닿지 못했다. 청해진은 왕도 귀족도 아닌 바다의 나라가 되었다. 신라·당·왜의 배들이 청해진 깃발 아래 오간다. 사람들은 그를 해상왕이라 불렀다.' },
  throne: { title: '왕좌의 바다', ch: '王', kind: 'fiction', text: '대사는 염장을 돌려보내고 군사를 이끌고 서라벌로 올라갔다. 약속은 지켜졌다. 섬사람의 딸이 왕비가 되던 날, 서라벌 귀족들은 바다를 처음으로 두려워했다. — 역사와 다른 길이다.' },
  yeomjang: { title: '역사의 칼', ch: '刀', kind: 'history', text: '술자리가 무르익었을 때 염장이 칼을 뽑았다. 841년, 청해진대사 장보고는 그렇게 쓰러졌다. 십 년 뒤 청해진은 폐쇄되었다. 사서는 그를 반역자로 적었고, 바다는 그를 잊지 않았다.' },
  wander: { title: '바람 따라', ch: '風', kind: 'neutral', text: '대사는 청해진을 동료들에게 맡기고 배 한 척으로 남쪽 바다로 사라졌다. 유구에서 보았다는 이도, 천주에서 보았다는 이도 있다. 염장의 칼은 빈 방을 찔렀다.' },
  ara_true: { title: '바다의 신라방', ch: '坊', kind: 'true', text: '아라의 배들이 황해를 오가는 떠다니는 신라방이 되었다. 청해진 유민과 쫓겨난 승려들이 그 배에 탔다. 땅이 없어도 사람들은 그곳을 고향이라 불렀다.' },
  ara_alone: { title: '홀로 남은 객주', ch: '孤', kind: 'neutral', text: '아라는 바다로 나갔지만 따르는 배는 많지 않았다. 문을 닫았던 날을 기억하는 사람들이 있었다. 그래도 아라의 배는 오늘도 황해를 건넌다.' },
  ara_merchant: { title: '당의 거상', ch: '商', kind: 'neutral', text: '돈은 관리의 눈을 감겼다. 아라는 당의 거상으로 남았다. 양주 시장에서 그녀의 이름을 모르는 이는 없다. 다만 신라 말은 점점 덜 쓰게 되었다.' },
  tomo_true: { title: '바다 건너 다리', ch: '橋', kind: 'true', text: '도모의 상단은 신라·당·왜를 잇는 다리가 되었다. 다자이후의 관리도 그의 배에 세금을 매기는 대신 인사를 한다. 그림자 상인은 이제 해가 뜬 곳을 걷는다.' },
  tomo_shadow: { title: '그림자 거상', ch: '影', kind: 'neutral', text: '도모의 상단은 커졌지만 늘 그림자 속에 있었다. 돈은 넘치고 친구는 없다. 하카타 부두의 신라 뱃사람들은 여전히 그를 보면 고개를 돌린다.' },
  tomo_exile: { title: '남쪽 섬의 이름 없는 상인', ch: '島', kind: 'neutral', text: '도모라는 이름은 사라졌다. 유구의 작은 포구에 말수 적은 왜인 상인이 산다. 그의 배는 작지만, 누구에게도 고개를 숙이지 않는다.' },
  three_years: { title: '세 해의 장부', ch: '簿', kind: 'neutral', text: '열두 번째 상납을 바치고 장부를 덮었다. 세 해 동안 바다는 당신을 삼키지 못했다. 이야기는 끝을 보지 못했지만, 장부에 적힌 숫자와 항구마다 남은 이름은 지워지지 않는다. 다음 배는 더 멀리 간다.' }
};
/* 결말 나무(메타 화면용): 선장마다 어떤 결말이 있고 어떻게 가는지. 본 결말만 제목이 보이고, 못 본 것은 가는 길만 보인다 */
const ENDING_TREE = {
  gungbok: [['sea_king', '범이가 곁을 지킬 때 염장을 맞이한다. 또는 김우징을 돌려보냈다면 의심한다'], ['yeomjang', '범이 없이 염장을 맞이한다'], ['throne', '김우징을 받아들이고 염장을 의심한다'], ['wander', '청해진을 떠난다']],
  ara: [['ara_true', '유민을 받아들이고 바다로 나간다'], ['ara_alone', '문을 닫았다가 바다로 나간다'], ['ara_merchant', '관리에게 2만 냥을 쥐여주고 버틴다']],
  tomo: [['tomo_true', '이충을 돕고 상단을 세운다'], ['tomo_shadow', '몰수품을 사들이고 상단을 세운다'], ['tomo_exile', '이름을 버리고 남쪽 섬으로']]
};
function endingTree(seen) { seen = seen || {}; return Object.entries(ENDING_TREE).map(([cap, list]) => ({ cap, name: CAPTAINS[cap].name, arc: ARCS[cap].name, endings: list.map(([id, how]) => ({ id, how, seen: !!seen[id], title: seen[id] ? ENDINGS[id].title : null, ch: seen[id] ? ENDINGS[id].ch : '?', kind: ENDINGS[id].kind })) })).concat([{ cap: 'any', name: '누구나', arc: '세 해', endings: [{ id: 'three_years', how: '이야기를 끝내지 못한 채 열두 번째 상납을 바친다', seen: !!seen.three_years, title: seen.three_years ? ENDINGS.three_years.title : null, ch: seen.three_years ? ENDINGS.three_years.ch : '?', kind: 'neutral' }] }]); }
const arcOf = () => ARCS[S.cap] || ARCS.gungbok;
const curAct = () => { const a = arcOf(); return S.main && S.main.act < a.acts.length ? a.acts[S.main.act] : null; };
const val = v => typeof v === 'function' ? v() : v;
function mainBase() { S.main.v0 = S.stats.voyages; return { quotaN: S.quotaN, wins: S.stats.wins || 0, freed: S.freed || 0, orders: S.stats.orders, profit: S.stats.profit }; }
function mainGoals() { const A = curAct(); if (!A || !S.main.started) return []; return A.goals().map(g => Object.assign({}, g, { done: g.ok() })); }
function mainTick() { if (!S || !S.main || S.ended) return; const A = curAct(); if (!A) return;
  if (!S.main.started) { if (A.at() && !S.main.offered) { S.main.offered = true; S.pending.unshift('main:start'); } return; }
  if (S.mode === 'port' && S.at) for (const g of A.goals()) if (g.deliver && !g.ok() && g.deliver.k === S.at) { const r = mainDeliver(S.at); if (r) S.qNotes.push({ main: true, ch: NUM[S.main.act], name: `第${NUM[S.main.act]}幕 ${A.title}`, text: `${G[g.deliver.good].name} ${g.deliver.n}상자를 넘겼다.`, got: [], fin: false, next: null }); }
  const gs = A.goals(); if (!gs.every(g => g.ok())) return;
  if (A.final) { if (!S.main.finalOffered) { S.main.finalOffered = true; S.pending.unshift('main:final'); } return; }
  const R = val(A.reward) || {}, got = []; if (R.gold) { S.gold += R.gold; got.push(`+${R.gold.toLocaleString('ko-KR')}냥`); } if (R.fame) { S.fame += R.fame; got.push(`명성 +${R.fame}`); }
  if (R.threat) { S.threat = clamp(S.threat + R.threat, 0, 99); restage(); got.push(`경계 ${R.threat > 0 ? '+' : ''}${R.threat}`); }
  if (R.boon && !S.boons[R.boon]) { S.boons[R.boon] = 1; const b = BOONS.find(x => x.id === R.boon); got.push(`특권 ${b.name}`); }
  S.qNotes.push({ main: true, ch: NUM[S.main.act], name: `第${NUM[S.main.act]}幕 ${A.title}`, text: val(A.outro), got, fin: true, next: null });
  S.main.act++; S.main.started = false; S.main.offered = false; S.main.visits = {}; S.main.paid = {}; mainTick(); }
function mainStart(choiceId) { const A = curAct(); if (!A) return; if (A.choice) { const c = A.choice.find(x => x.id === choiceId) || A.choice[0]; S.main.flags[c.flag] = true; }
  S.main.started = true; S.main.base = mainBase(); S.main.visits = {}; S.main.paid = {}; if (S.mode === 'port' && S.at) S.main.visits[S.at] = 0; mainTick(); }
function mainVisit(k) { if (S.main && S.main.started) { S.main.visits[k] = ++S.main.vn; } }
function mainPay(k) { const g = mainGoals().find(g => g.pay && g.pay.k === k && !g.done); if (!g || S.mode !== 'port' || S.at !== k || S.gold < g.pay.n) return null; S.gold -= g.pay.n; S.main.paid[k + g.pay.n] = 1; mainTick(); return g; }
function mainDeliver(k) { const g = mainGoals().find(g => g.deliver && g.deliver.k === k && !g.done); if (!g || S.at !== k) return null; const d = g.deliver; const idx = []; S.slots.forEach((s, i) => { if (s.id === d.good && s.from !== k && idx.length < d.n) idx.push(i); }); if (idx.length < d.n) return null; for (const i of idx.reverse()) S.slots.splice(i, 1); S.main.paid['d' + k + d.good] = 1; return g; }
function mainSpots() { return mainGoals().filter(g => g.spot && !g.done).map(g => { const [x, y] = nearestSea(...P(...g.spot.ll)); return { x, y, r: 48, name: g.spot.name, spec: g.spot.spec }; }); }
function mainEnd(endId) { S.ending = endId; S.ended = 'ending'; return ENDINGS[endId]; }
function mainStory(kind) { const A = curAct(); if (!A) return null; const n = NUM[S.main.act];
  if (kind === 'start') { const opts = A.choice ? A.choice.map(c => ({ label: c.label, sub: c.sub, apply: () => { mainStart(c.id); return null; } })) : [{ label: '닻을 올린다', apply: () => { mainStart(); return null; } }];
    return { who: 'main', act: n, title: `第${n}幕 ${A.title}`, text: val(A.intro), sub: A.choice ? '' : `목표 — ${A.goals ? (() => { const save = S.main.base; S.main.base = mainBase(); const t = A.goals().map(g => g.text).join(' · '); S.main.base = save; return t; })() : ''}`, opts }; }
  if (kind === 'final') return { who: 'main', act: n, title: `第${n}幕 ${A.title} — 마지막 선택`, text: '모든 것이 이 순간에 달렸다.', opts: A.ending.map(e => ({ label: e.label, sub: e.sub, apply: () => { const id = e.end(); mainEnd(id); return null; } })) };
  return null; }

/* ═══════════ 선술집: 선원 · 주사위 · 포구 사건 ═══════════ */
/* fame = 이 사람을 데려가려면 필요한 명성. 이름난 사람은 이름난 배에만 탄다 */
const MATES = [
  { id: 'archer', name: '돌쇠', role: '활잡이', ch: '弓', from: '신라', text: '활 피해 +25%, 해적이 덜 덤빈다(-20%)', hire: 2500, wage: 300, fame: 0 },
  { id: 'rower', name: '억쇠', role: '노꾼 우두머리', ch: '櫓', from: '신라', text: '노 젓기와 해전 기동의 기력 소모 -40%', hire: 2000, wage: 250, fame: 0 },
  { id: 'doctor', name: '허 의원', role: '배 의원', ch: '醫', from: '당', text: '열병을 막고, 입항할 때마다 선체 +12', hire: 3000, wage: 350, fame: 200 },
  { id: 'trader', name: '왕소이', role: '흥정꾼', ch: '算', from: '당', text: '팔 때 4% 더 받는다', hire: 4000, wage: 700, fame: 400 },
  { id: 'diver', name: '물개 순이', role: '해녀', ch: '潛', from: '탐라', text: '잠수할 때 숨 +30', hire: 2000, wage: 250, fame: 0 },
  { id: 'seer', name: '무녀 달래', role: '점쟁이', ch: '巫', from: '신라', text: '소문을 들으면 헛소문 없이 정확한 값만 듣는다', hire: 2500, wage: 300, fame: 150 },
  { id: 'carpenter', name: '곰배', role: '목수', ch: '斧', from: '신라', text: '수리비 -40%, 선체 최대 +20', hire: 3000, wage: 350, fame: 150 },
  { id: 'ken', name: '겐', role: '떠돌이 무사', ch: '刃', from: '왜', text: '백병 피해 +25%, 뛰어들 때 반격을 안 받는다', hire: 3500, wage: 400, fame: 300 },
  { id: 'hassan', name: '하산', role: '대식 항해사', ch: '星', from: '대식', text: '항해 6% 빨라진다', hire: 4500, wage: 550, fame: 600 },
  { id: 'shadow', name: '그림자 손', role: '첩자', ch: '影', from: '?', text: '경계가 20% 덜 오른다', hire: 3500, wage: 400, fame: 500 }
];
const MBY = Object.fromEntries(MATES.map(m => [m.id, m]));
const hasMate = id => !!(S && S.mates && S.mates.includes(id));
const mateCap = () => 2 + S.tier + (S.main && S.main.flags.extraMate ? 1 : 0);
const wages = () => (S.mates || []).reduce((a, id) => a + MBY[id].wage, 0);
function tavern(k) { const t = S.taverns[k]; if (t && t.until > S.t) return t; const pool = MATES.filter(m => !hasMate(m.id)).sort(() => Math.random() - .5); const nt = { until: S.t + 30, offer: pool.slice(0, Math.random() < .35 ? 2 : 1).map(m => m.id), dice: 0 }; S.taverns[k] = nt; return nt; }
const REROLL_COST = 300;
function tavernReroll() { const t = tavern(S.at); if (S.gold < REROLL_COST) return { ok: false, text: '돈이 모자란다' }; const pool = MATES.filter(m => !hasMate(m.id) && !t.offer.includes(m.id)).sort(() => Math.random() - .5); if (!pool.length) return { ok: false, text: '더 알아볼 사람이 없다' };
  S.gold -= REROLL_COST; acct('office', REROLL_COST); t.offer = pool.slice(0, Math.random() < .35 ? 2 : 1).map(m => m.id); return { ok: true, text: '주인이 구석 자리를 가리킨다. 다른 뱃사람이 앉아 있다.' }; }
/* 영입 카드의 '지난 계절 기준 +N냥': 지난 계절 장부로 이 사람이 있었으면 얼마나 더 남겼을지 */
function mateValue(id) { const L = S.stats.lastSeason; if (!L) return null; const inc = Object.fromEntries(L.inc), out = Object.fromEntries(L.out);
  if (id === 'trader') return Math.round(Math.max(0, inc['장사 이익']) * .04);
  if (id === 'carpenter') return Math.round(out['수리'] * .4); if (id === 'archer') return Math.round(inc['전리품·현상금'] * .2); if (id === 'ken') return Math.round(inc['전리품·현상금'] * .15);
  if (id === 'seer') return Math.round(out['소문'] * .5); if (id === 'diver') return Math.round(inc['잠수'] * .25); return null; }
function hireMate(id) { const k = S.at, t = tavern(k), m = MBY[id]; if (!m || !t.offer.includes(id) || hasMate(id)) return { ok: false, text: '' }; if (S.mates.length >= mateCap()) return { ok: false, text: `배가 작아 선원을 더 못 태운다 (최대 ${mateCap()})` }; if (S.fame < (m.fame || 0)) return { ok: false, text: `${m.name}은 이름난 배에만 탄다 (명성 ${m.fame} 필요)` }; if (S.gold < m.hire) return { ok: false, text: '돈이 모자란다' };
  S.gold -= m.hire; acct('wage', m.hire); S.mates.push(id); t.offer = t.offer.filter(x => x !== id); if (id === 'carpenter') { S.hullMax += 20; S.hull += 20; } return { ok: true, text: `${m.role} ${m.name}${JO(m.name,'이','가')} 배에 올랐다. ${m.text}.` }; }
function fireMate(id) { const i = S.mates.indexOf(id); if (i < 0) return null; S.mates.splice(i, 1); if (id === 'carpenter') { S.hullMax -= 20; S.hull = Math.min(S.hull, S.hullMax); } return MBY[id]; }
function payWages() { const out = []; for (const id of S.mates.slice()) { const m = MBY[id]; if (S.gold >= m.wage) { S.gold -= m.wage; acct('wage', m.wage); } else { fireMate(id); out.push(m); } } return out; }
function rollDice(bet, guess) { const t = tavern(S.at); if (t.dice >= 3) return { ok: false, text: '주인이 손을 젓는다. "오늘은 그만하시오."' }; if (S.gold < bet) return { ok: false, text: '돈이 모자란다' };
  t.dice++; const a = ri(1, 6), b = ri(1, 6), even = (a + b) % 2 === 0, win = (guess === 'even') === even; const pay = win ? Math.round(bet * .9) : -bet; S.gold += pay;
  return { ok: true, a, b, even, win, pay, left: 3 - t.dice }; }
const PORT_EVENTS = [
  { id: 'brawl', when: () => true, title: '선술집 싸움', text: '선술집에서 왜 뱃사람과 당 뱃사람이 멱살을 잡았다. 탁자가 날아다닌다.', opts: () => [{ label: '말린다', sub: '300냥 · 명성', apply: () => { S.gold = Math.max(0, S.gold - 300); S.fame += 25; return '술값을 대신 내고 둘을 떼어 놓았다. 양쪽이 다 고개를 숙인다.'; } }, { label: '구경한다', apply: () => { if (Math.random() < .5) { const r = makeRumor('true'); return `싸움판 너머로 귀가 열렸다. "${r.line}"`; } return '의자가 날아와 어깨를 스쳤다.'; } }] },
  { id: 'auction', when: () => freeSlots() > 0, title: '부두 경매', text: '주인 잃은 상자 하나가 경매에 붙었다. 봉인이 그대로다. 안에 무엇이 들었는지 아무도 모른다.', opts: () => [{ label: '1,500냥에 산다', sub: '무엇이 나올까', apply: () => { if (S.gold < 1500 || !freeSlots()) return '돈이 모자랐다.'; S.gold -= 1500; const id = pick(GOODS).id; S.slots.push({ id, cost: 1500 }); return `상자를 열었다 — ${G[id].name}! ${G[id].base * LOT > 2600 ? '횡재다.' : '본전은 하려나.'}`; } }, { label: '지켜본다', apply: () => '왕씨 상단 사람이 낙찰받았다.' }] },
  { id: 'orphan', when: () => true, title: '부두의 아이', text: '부두에서 맨발의 아이가 배를 쳐다본다. 해적에게 부모를 잃었다고 한다. "배 타고 싶어요."', opts: () => [{ label: '데려간다', sub: '200냥 · 명성', apply: () => { S.gold = Math.max(0, S.gold - 200); S.fame += 30; S.stamina = 100; return '아이가 갑판을 뛰어다닌다. 선원들 얼굴이 펴졌다.'; } }, { label: '쌀 한 섬을 쥐여 준다', apply: () => { S.gold = Math.max(0, S.gold - 100); S.fame += 10; return '아이가 꾸벅 절을 했다.'; } }] },
  { id: 'fire', when: () => true, title: '부두의 불', text: '창고에 불이 났다. 바람이 배 쪽으로 분다.', opts: () => [{ label: '물을 퍼 나른다', sub: '반나절 · 명성', apply: () => { S.t += .5; S.fame += 40; return '밤새 불을 껐다. 포구 사람들이 대사의 배 이름을 외운다.'; } }, { label: '배부터 뺀다', apply: () => { if (Math.random() < .3) { S.hull -= 10; return '불똥이 돛에 튀었다. 선체 -10'; } return '배는 무사하다.'; } }] },
  { id: 'taxman', when: () => S.gold > 3000, title: '세리', text: '관청 세리가 장부를 들고 배에 오른다. "입항세가 올랐소."', opts: () => { const c = Math.round(S.gold * .05 / 10) * 10; return [{ label: '낸다', sub: `${c.toLocaleString('ko-KR')}냥`, apply: () => { S.gold -= c; return '세리가 도장을 찍고 내려갔다.'; } }, { label: '버틴다', sub: '경계 +5', apply: () => { addThreat(5); return '세리가 이를 갈며 돌아갔다. 장부에 이름이 적혔다.'; } }]; } },
  { id: 'oldcap', when: () => S.maps.length < 3, title: '늙은 선장', text: '선술집 구석의 늙은 선장이 해도를 탁자에 편다. "다리가 이래서 이제 못 가오. 천 냥이면 넘기지."', opts: () => [{ label: '1,000냥에 산다', apply: () => { if (S.gold < 1000) return '돈이 모자랐다.'; S.gold -= 1000; const m = addMap(Math.random() < .4 ? 2 : 1); return m ? `해도를 받았다 — 寶 ${m.name}` : '해도는 이미 아는 곳이었다.'; } }, { label: '사양한다', apply: () => '늙은 선장이 해도를 다시 품에 넣는다.' }] },
  { id: 'dance', when: () => true, title: '포구 잔치', text: '포구에 잔치가 열렸다. 북과 피리 소리. 선원들이 들썩인다.', opts: () => [{ label: '선원들을 풀어 준다', sub: '하루 · 기력과 명성', apply: () => { S.t += 1; S.stamina = 100; S.fame += 20; return '하루를 놀았다. 선원들 눈빛이 달라졌다.'; } }, { label: '일정이 바쁘다', apply: () => '선원들이 아쉬운 눈으로 돛줄을 감는다.' }] },
  { id: 'swindle', when: () => freeSlots() > 0, title: '수상한 상인', text: () => { S._sw = pick(['spice', 'gold', 'fur', 'silk']); return `골목의 상인이 속삭인다. "${G[S._sw].name}, 시세 반값에 넘기겠소."`; }, opts: () => { const id = S._sw || 'spice', c = Math.round(G[id].base * LOT * .5 / 10) * 10; return [{ label: '산다', sub: `${c.toLocaleString('ko-KR')}냥 · 반은 진짜, 반은 밑에 유황을 깐 가짜`, apply: () => { if (S.gold < c || !freeSlots()) return '돈이 모자랐다.'; S.gold -= c; if (Math.random() < .5) { S.slots.push({ id, cost: c }); return `진짜였다! ${G[id].name} 한 상자.`; } S.slots.push({ id: 'sulfur', cost: c }); return '집에 와서 열어 보니 위에만 깔고 밑은 유황이다. 속았다.'; } }, { label: '돌려보낸다', apply: () => '상인이 혀를 차며 사라졌다.' }]; } }
];
function portEvent() { const pool = PORT_EVENTS.filter(e => e.when() && e.id !== S.lastPE); if (!pool.length) return null; const e = pick(pool); S.lastPE = e.id; return { who: 'port', title: e.title, text: typeof e.text === 'function' ? e.text() : e.text, opts: e.opts() }; }


/* ═══════════ 막 사이 장면: 목표를 반쯤 채웠을 때, 또는 특정 항구에서 끼어드는 이야기 ═══════════
   when: 조건 · once: 막당 한 번 · who: 초상 id · 선택이 S.main.flags에 남아 뒤 막·결말 문장을 바꾼다 */
const SCENES = {
  gungbok: [
    { id: 'g0_oath', act: 0, when: () => S.quotaN - B0().quotaN >= 1, who: 'navy', title: '목책 앞의 맹세', text: '첫 군자금이 서라벌로 떠난 날, 수군장이 목책 앞에 병졸 백을 세웠다. "대사, 이 사람들은 다 해적에게 가족을 잃었소. 뭐라 한마디 하시오."',
      opts: [{ label: '"바다에서 사람을 사고파는 일은 내 눈앞에서 끝난다."', flag: 'oath_people', sub: '명성 +60 · 노예선 사건이 더 자주 온다', fx: () => { S.fame += 60; } }, { label: '"군자금부터 채워라. 말은 그다음이다."', flag: 'oath_gold', sub: '+1,500냥 · 명성 -10', fx: () => { S.gold += 1500; S.fame = Math.max(0, S.fame - 10); } }] },
    { id: 'g1_market', act: 1, when: () => S.mode === 'port' && ['deungju', 'chuzhou', 'mizhou', 'laizhou'].includes(S.at), who: 'inspector', title: '노비 시장', text: () => `${PORTS[S.at].name} 뒷골목, 쇠사슬 소리. 열두어 명이 줄에 묶여 있다. 신라 말로 우는 아이가 있다. 당 관리가 곁에 서서 장부를 적는다. 여기는 당 땅이다.`,
      opts: [{ label: '그 자리에서 값을 치르고 모두 산다', flag: 'bought_free', sub: '4,000냥 · 명성 +150 · 경계 +8', ok: () => S.gold >= 4000, fx: () => { S.gold -= 4000; S.fame += 150; addThreat(8); } }, { label: '이름만 적어 두고 돌아선다', flag: 'noted', sub: '명성 +20 · 물귀신 장씨를 칠 때 선원들이 그 이름들을 기억한다', fx: () => { S.fame += 20; } }, { label: '관리에게 상인 이름을 캐묻는다', flag: 'asked_dealer', sub: '600냥 · 두목의 거처가 해도에 드러난다', ok: () => S.gold >= 600, fx: () => { S.gold -= 600; const b = BOSSES.find(x => x.id === 'jang'); revealCircle(...P(...b.ll), 90); } }] },
    { id: 'g2_ennin', act: 2, when: () => S.mode === 'port' && S.at === 'jeoksan' && !!S.main.paid['jeoksan12000'], who: 'monk', title: '일기를 쓰는 승려', text: '법화원 객사에서 왜의 승려가 붓을 멈추지 않는다. "저는 엔닌이라 합니다. 당에 온 지 삼 년, 신라 사람들이 아니었으면 벌써 죽었을 겁니다. 대사의 이름을 일기에 적어도 되겠습니까."',
      opts: [{ label: '"적어라. 다만 있는 그대로."', flag: 'ennin_true', sub: '명성 +80', fx: () => { S.fame += 80; } }, { label: '"내 이름은 빼라. 신라방 사람들 이름을 적어라."', flag: 'ennin_people', sub: '신라방 연줄 — 당 항구에서 소식 하나', fx: () => { S.fame += 30; makeRumor('true'); } }] },
    { id: 'g3_daughter', act: 3, when: () => S.main.flags.woojing && (S.stats.wins || 0) - B0().wins >= 1, who: 'prince', title: '딸의 이름', text: '김우징이 밤에 찾아왔다. "서라벌로 올라가기 전에 묻겠소. 대사의 딸 이름이 무엇이오. 왕비가 될 사람의 이름을 내가 알아야 하지 않겠소." 당신은 딸을 한 번도 바다에 데려온 적이 없다.',
      opts: [{ label: '이름을 말한다', flag: 'named', sub: '명성 +40', fx: () => { S.fame += 40; } }, { label: '"왕이 된 뒤에 들으시오."', flag: 'unnamed', sub: '경계 -5', fx: () => { S.threat = Math.max(0, S.threat - 5); } }] },
    { id: 'g3_refused', act: 3, when: () => !S.main.flags.woojing && S.quotaN - B0().quotaN >= 1, who: 'inspector', title: '서라벌의 편지', text: '조정에서 편지가 왔다. "대사가 역적 김우징을 돌려보냈다 들었소. 왕께서 기뻐하시오." 봉투 안에 비단 한 필과, 상납을 올리겠다는 통보가 함께 들어 있었다.',
      opts: [{ label: '비단을 받고 통보를 삼킨다', flag: 'swallowed', sub: '상자 하나(비단) · 다음 상납 +10%', fx: () => { if (freeSlots()) S.slots.push({ id: 'silk', cost: 0 }); S.main.flags.quotaUp = true; } }, { label: '비단을 돌려보낸다', flag: 'returned', sub: '명성 +50 · 경계 +10', fx: () => { S.fame += 50; addThreat(10); } }] },
    { id: 'g4_bum', act: 4, when: () => perk('deck') && S.fame >= 1500, who: 'deck', title: '범이의 밤', text: '범이가 당신 방문 앞에 앉아 칼을 간다. "형님. 염장이란 자, 나는 모르는 얼굴이오. 형님이 아는 얼굴이면 더 위험하오. 아는 얼굴은 문을 열어주니까."',
      opts: [{ label: '"그날 밤은 네가 문 앞에 있어라."', flag: 'bum_guard', sub: '결말이 달라질 수 있다', fx: () => null }, { label: '"옛 동무다. 칼은 치워라."', flag: 'bum_away', sub: '명성 +20', fx: () => { S.fame += 20; } }] }
  ],
  ara: [
    { id: 'a0_debt', act: 0, when: () => S.quotaN - B0().quotaN >= 1, who: 'wangheir', title: '빚 문서', text: '왕씨 상단 큰아들이 아버지의 빚 문서를 흔든다. "아가씨, 삼천 냥이오. 지금 갚든지, 배를 넘기든지."',
      opts: [{ label: '갚는다', flag: 'debt_paid', sub: '3,000냥', ok: () => S.gold >= 3000, fx: () => { S.gold -= 3000; S.fame += 40; } }, { label: '"한 철만 기다리시오. 이자는 쳐 드리지."', flag: 'debt_wait', sub: '다음 상납에 4,000냥이 얹힌다', fx: () => { S.main.flags.debt = 4000; } }, { label: '문서를 찢는다', flag: 'debt_torn', sub: '경계 +15 · 왕씨 상단이 당신 행선지를 노려 값을 누른다', fx: () => { addThreat(15); S.main.flags.wangEnemy = true; } }] },
    { id: 'a1_race', act: 1, when: () => S.stats.profit - B0().profit >= 15000, who: 'wangheir', title: '한밤의 제안', text: '왕씨 큰아들이 술에 취해 찾아왔다. "아가씨가 이기고 있소. 알고 있소. 그런데… 우리 둘이 손잡으면 등주 뱃길은 아무도 못 건드리오. 내기는 없던 걸로 하고."',
      opts: [{ label: '손을 잡는다', flag: 'wang_ally', sub: '내기 목표가 절반으로 준다 · 당 항구에서 팔 때 +8%', fx: () => { S.main.flags.allyBonus = true; } }, { label: '"내기는 내기요."', flag: 'wang_rival', sub: '명성 +60', fx: () => { S.fame += 60; } }] },
    { id: 'a2_boat', act: 2, when: () => S.main.flags.refuge && S.mode === 'port' && S.at === 'cheonghae', who: 'deck', title: '떠나는 배', text: '청해진 부두. 삼백 명이 짐을 들고 서 있다. 배는 한 척, 다 못 탄다. 늙은 뱃사람 하나가 말한다. "아이들과 젊은 사람부터 태우시오. 우리는 다음 배를 기다리겠소." 다음 배는 없다.',
      opts: [{ label: '아이들과 젊은 사람부터', flag: 'young_first', sub: '명성 +100', fx: () => { S.fame += 100; } }, { label: '뱃사람과 목수부터 — 신라방에 쓸모 있는 사람', flag: 'useful_first', sub: '선원 자리 +1', fx: () => { S.main.flags.extraMate = true; } }] },
    { id: 'a3_monks', act: 3, when: () => S.mode === 'port' && natOf(S.at) === '당', who: 'monk', title: '쫓겨난 승려들', text: '절이 헐린 자리에 승려 스물이 앉아 있다. 머리를 깎인 자국이 새파랗다. "배가 있으시다 들었습니다. 신라든 왜든, 바다 건너면 됩니다."',
      opts: [{ label: '태운다', flag: 'monks_aboard', sub: '경계 +12 · 명성 +120', fx: () => { addThreat(12); S.fame += 120; } }, { label: '뱃삯을 받고 태운다', flag: 'monks_paid', sub: '+2,500냥 · 명성 +30', fx: () => { S.gold += 2500; S.fame += 30; } }, { label: '못 본 척한다', flag: 'monks_left', sub: '경계 -5', fx: () => { S.threat = Math.max(0, S.threat - 5); } }] }
  ],
  tomo: [
    { id: 't0_official', act: 0, when: () => S.quotaN - B0().quotaN >= 1, who: 'miyata', title: '다자이후의 관리', text: '다자이후 관리가 창고 문을 열어 보더니 웃는다. "당의 비단이 참 많군. 조정은 금하지만… 나는 눈이 나쁘오." 손바닥을 편다.',
      opts: [{ label: '손바닥에 올려 준다', flag: 'bribed', sub: '1,200냥 · 경계 -15', ok: () => S.gold >= 1200, fx: () => { S.gold -= 1200; S.threat = Math.max(0, S.threat - 15); } }, { label: '비단 한 필을 쥐여 준다', flag: 'gifted', sub: '비단 상자 하나 · 왜 항구에 들 때마다 경계 -3', ok: () => S.slots.some(x => x.id === 'silk'), fx: () => { const i = S.slots.findIndex(x => x.id === 'silk'); S.slots.splice(i, 1); S.main.flags.official = true; } }, { label: '"눈이 나쁘면 안경을 사시오."', flag: 'defied', sub: '경계 +20 · 명성 +40', fx: () => { addThreat(20); S.fame += 40; } }] },
    { id: 't1_cheonghae', act: 1, when: () => S.mode === 'port' && S.at === 'cheonghae', who: 'navy', title: '청해진의 눈', text: '청해진 부두에서 수군장이 당신 배를 위아래로 훑는다. "왜 사람이 여기까지. 미야타마로의 심부름이오? 그 사람은 믿을 만하오?"',
      opts: [{ label: '"믿을 만하오. 돈 앞에서는."', flag: 'honest', sub: '명성 +40 · 청해진 창고에 상자 하나를 더 맡길 수 있다', fx: () => { S.fame += 40; S.main.flags.cheonghaeTrust = true; } }, { label: '"조정의 사람이오. 틀림없소."', flag: 'vouched', sub: '거래가 빨리 끝난다 · +1,000냥', fx: () => { S.gold += 1000; } }] },
    { id: 't2_lichung', act: 2, when: () => S.main.flags.help && S.stats.voyages - (S.main.v0 || 0) >= 2, who: 'lichung', title: '이충의 부탁', text: '이충이 하카타 뒷골목에서 당신 소매를 잡는다. "물건은 됐소. 사람이오. 청해진 뱃사람 넷이 다자이후 옥에 있소. 밀무역으로. 당신 이름으로 빼낼 수 있소?"',
      opts: [{ label: '내 이름으로 빼낸다', flag: 'freed_four', sub: '경계 +18 · 명성 +80 · 선원 자리 +1', fx: () => { addThreat(18); S.fame += 80; S.main.flags.extraMate = true; } }, { label: '"물건까지만이오."', flag: 'goods_only', sub: '경계 -5', fx: () => { S.threat = Math.max(0, S.threat - 5); } }] },
    { id: 't3_name', act: 3, when: () => S.quotaN - B0().quotaN >= 1, who: 'miyata', title: '이름을 지우는 값', text: '미야타마로가 마지막으로 찾아왔다. "새 관리의 명단에서 자네 이름을 지워 주겠네. 만 냥. 아니면… 내가 자네를 넘기고 내 이름을 지키든지."',
      opts: [{ label: '만 냥을 낸다', flag: 'erased', sub: '10,000냥 · 경계 -30', ok: () => S.gold >= 10000, fx: () => { S.gold -= 10000; S.threat = Math.max(0, S.threat - 30); } }, { label: '"넘기시오. 나는 바다에 있을 테니."', flag: 'defiant', sub: '경계 +15 · 명성 +100', fx: () => { addThreat(15); S.fame += 100; } }] }
  ]
};
function sceneTick() { if (!S || !S.main || !S.main.started || S.ended || S.mode !== 'port') return; const list = SCENES[S.cap] || []; S.main.seen = S.main.seen || {};
  for (const sc of list) if (sc.act === S.main.act && !S.main.seen[sc.id] && sc.when()) { S.main.seen[sc.id] = 1; S.pending.unshift('scene:' + sc.id); return; } }
function sceneStory(id) { const sc = (SCENES[S.cap] || []).find(x => x.id === id); if (!sc) return null;
  return { who: 'scene', spk: sc.who, act: NUM[S.main.act], title: sc.title, text: val(sc.text), opts: sc.opts.map(o => ({ label: o.label, sub: o.sub, off: o.ok && !o.ok(), apply: () => { if (o.ok && !o.ok()) return '지금은 할 수 없다.'; S.main.flags[o.flag] = true; o.fx && o.fx(); return null; } })) }; }

/* ═══════════ 사람의 목소리: 경쟁 상단·선원이 상황에 따라 한마디 ═══════════ */
const VOICES = {
  wang: { meet: ['"또 당신이오? 이 뱃길은 좁아서 둘은 못 다니오."', '"값이 떨어진 건 내 탓이 아니오. 바다 탓이지."', '"우리 아버지가 그러셨소. 신라 배는 믿지 말라고. 나는… 반만 믿소."'], beaten: ['"먼저 닿았다고 이긴 게 아니오. 두고 보시오."', '"다음엔 노꾼을 두 배로 싣겠소."'], won: ['"늦었소. 값은 내가 다 먹었소. 술이나 한잔 하시오."'], ally: ['"동업자. 등주 값이 좋다는 소식이오."'] },
  otomo: { meet: ['"신라 배가 하카타를 자주 드나드는군. 다자이후가 알면 좋아하지 않을 텐데."', '"이쪽 짐은 묻지 마시오. 묻지 않으면 나도 안 묻겠소."'], beaten: ['"…빠르군. 어느 조선소요?"'], won: ['"오토모 가문은 바다에서 진 적이 없소. 오늘도 그렇소."'] }
};
const MATE_LINES = {
  doctor: { fever: '허 의원이 약탕을 돌린다. "열병은 내가 막소. 노는 당신이 저으시오."', hurt: '허 의원: "선체가 이 꼴인데 사람이 멀쩡할 리가. 항구에 들면 내 먼저 손보겠소."' },
  ken: { board: '겐이 칼을 뽑으며 웃는다. "드디어 내 차례군."', win: '겐: "약했소. 다음엔 더 센 놈으로."' },
  archer: { shoot: '돌쇠: "바람 좋소. 다 맞힐 거요."' },
  rower: { row: '억쇠가 북을 친다. "둥 — 둥 — 젓는다, 젓는다!"', tired: '억쇠: "힘이 다했소. 잠깐만 쉬면 되오."' },
  diver: { dive: '순이: "숨은 아끼는 게 아니라 쓰는 거예요. 따라오세요."' },
  seer: { rumor: '달래가 쌀을 흩뿌린다. "이 소문은… 참이오."', storm: '달래: "서쪽 구름이 나쁘오. 오늘은 섬 그늘에 있는 게 좋겠소."' },
  carpenter: { repair: '곰배: "못 하나면 되는 걸 왜 돈을 쓰오. 내가 하겠소."' },
  hassan: { stars: '하산이 별을 올려다본다. "고향 바다와 같은 별이오. 길은 저기요."', calm: '하산: "바람이 없을 땐 기다리는 것도 항해요."' },
  shadow: { threat: '그림자 손이 속삭인다. "관청 장부에서 당신 이름 한 줄을 지웠소. 값은 나중에."' },
  trader: { sell: '왕소이가 주판을 튕긴다. "조금 더 받을 수 있었는데… 아니, 됐소. 이 정도면."' }
};
function mateLine(key) { for (const id of (S.mates || [])) { const L = MATE_LINES[id]; if (L && L[key] && Math.random() < .6) return { id, line: L[key] }; } return null; }
function rivalLine(id, kind) { const V = VOICES[id]; if (!V) return null; const pool = kind === 'meet' && S.main.flags.allyBonus && id === 'wang' ? V.ally : V[kind]; return pool && pool.length ? pick(pool) : null; }

/* ─────────── 매 프레임 진행 ─────────── */
function update(dt) {
  const out = []; if (!S || S.ended || S.draft) return out;
  if (S.mode !== 'sail' || S.ev || S.battle || S.dive) return out;
  if (!S.path) { S.mode = 'sea'; return out; }
  let rem = dt;
  while (rem > 1e-6 && S.mode === 'sail' && !S.ev && !S.battle && !S.dive && !S.ended && !S.draft) {
    if (!S.path[S.seg + 1]) S.seg = S.path.length - 1;
    if (S.seg >= S.path.length - 1) { if (S.dest && isClosed(S.dest)) { const k = S.dest; S.mode = 'sea'; S.path = null; S.dest = null; S.rowing = false; out.push({ type: 'bounced', k, news: liveNews().find(n => n.closed === k) }); break; } if (S.dest) out.push({ type: 'arrive', info: arrive(S.dest) }); else { S.mode = 'sea'; S.path = null; out.push({ type: 'explored' }); } break; }
    const step = Math.min(rem, .2); rem -= step; const t0 = S.t; S.t += step;
    out.push(...updateRivals(step)); if (out.some(o => o.type === 'ambush')) { S.ev = pirateEvent('흑기 해적선', { kind: 'black', name: '흑기 해적선', ch: '黑', g: 'boarder', hp: 70, atk: 12 }); out.push({ type: 'event', ev: S.ev }); break; }
    const [tx, ty] = S.path[S.seg + 1]; const dir = Math.atan2(ty - S.y, tx - S.x); S.heading = dir;
    const w = wind(S.t, S.x, S.y); S.windDeg = angDiff(dir, w.dir) * 180 / Math.PI;
    const row = S.rowing && S.stamina > 0;
    const spd = (BASE_KMD * Math.min(1.05, w.str) * windFactor(S.windDeg) * shipSpeed() * (S.boost > 0 ? 1.45 : 1) + (row ? BASE_KMD * .55 : 0)) * (S.slow > 0 ? .8 : 1); S.spd = spd; if (S.boost > 0) S.boost -= step; if (S.slow > 0) S.slow -= step;
    if (row) { S.stamina -= 13 * step * (hasMate('rower') ? .6 : 1); if (S.stamina <= 0) { S.stamina = 0; S.rowing = false; out.push({ type: 'tired' }); } } else S.stamina = Math.min(100, S.stamina + 3 * step);
    const d = spd * step, L = Math.hypot(tx - S.x, ty - S.y);
    if (d >= L) { S.x = tx; S.y = ty; S.seg++; } else { S.x += Math.cos(dir) * d; S.y += Math.sin(dir) * d; }
    if (Math.floor(S.t * 4) !== Math.floor(t0 * 4)) revealCircle(S.x, S.y, REVEAL);
    for (const f of FINDS) if (!S.found[f.id] && Math.hypot(f.x - S.x, f.y - S.y) < 50) { S.found[f.id] = 1; S.fame += f.fame; S.gold += f.gold; if (f.fx) f.fx(S); S.voyage.finds.push(f.id); revealCircle(f.x, f.y, 80); out.push({ type: 'find', find: f }); questEval(); out.push(...regionCheck()); if (Math.random() < .35) { const m = addMap(2); if (m) out.push({ type: 'map', map: m, from: f.name }); } }
    { const m = S.maps.find(m => Math.hypot(m.x - S.x, m.y - S.y) < m.r); if (m) { S.maps.splice(S.maps.indexOf(m), 1); makeDive(m); out.push({ type: 'dive', site: m }); break; } }
    if (S.bounty && !(S.bounty.cool > S.t) && Math.hypot(S.bounty.x - S.x, S.bounty.y - S.y) < S.bounty.r) { bossBattle(); out.push({ type: 'battle', boss: true }); break; }
    { const ms = mainSpots().find(q => Math.hypot(q.x - S.x, q.y - S.y) < q.r && !(S.main.cool > S.t)); if (ms) { makeBattle(Object.assign({}, ms.spec, { mainSpot: true })); out.push({ type: 'battle' }); break; } }
    { const sp = questSpots().find(q => Math.hypot(q.x - S.x, q.y - S.y) < q.r && !(S.quests[q.id].cool > S.t)); if (sp) { const bd = BOSSES.find(b => b.id === sp.g.boss); makeBattle({ kind: 'boss', boss: bd.id, name: bd.name, ch: bd.ch, g: bd.g, hp: bd.hp, atk: bd.atk, line: bd.line, quest: sp.id }); out.push({ type: 'battle', quest: true }); break; } }
    for (const k of PORT_IDS) if (!S.known[k] && Math.hypot(PORTS[k].x - S.x, PORTS[k].y - S.y) < 95) { S.known[k] = true; S.fame += 150; revealCircle(PORTS[k].x, PORTS[k].y, 90); out.push({ type: 'port', port: k }); }
    if (Math.floor(S.t) !== Math.floor(t0)) { histTick();
      const se = seasonOf(S.t); if (se !== S.season) { S.season = se; out.push({ type: 'season', season: se }); }
      for (const o of expireOrders()) out.push({ type: 'orderLost', order: o });
      out.push(...newsTick(), ...wireTick()); mainTick();
      if (S.t >= S.nextDue) { out.push({ type: 'quota', res: collectQuota() }); break; }
      const day = Math.floor(S.t);
      if (day - S.lastEvDay >= 2 && Math.random() < (inZone(S.x, S.y) ? .22 : .12)) { S.lastEvDay = day; out.push({ type: 'event', ev: rollEvent(w) }); break; }
    }
  }
  return out;
}
/* 항구에 머무는 동안 흐른 시간도 상납 기한에 걸린다 */
function portTick() { const out = []; if (!S.ended) histTick(); if (S.mode === 'port' && !S.ended && !S.draft && S.t >= S.nextDue) out.push({ type: 'quota', res: collectQuota() }); out.push(...expireOrders().map(o => ({ type: 'orderLost', order: o }))); if (!S.ended) out.push(...newsTick(), ...wireTick()); questEval(); mainTick(); sceneTick(); return out; }
function arrive(k) {
  const v = S.voyage; S.mode = 'port'; S.at = k; S.stamina = 100; S.rowing = false; S.slow = 0; S.x = PORTS[k].x; S.y = PORTS[k].y; S.path = null; S.dest = null; tickMarket(k);
  const first = !S.docked[k]; S.docked[k] = 1; const fresh = first && !!PORTS[k].hidden; if (first) S.fame += 60;
  if (fresh) { const m = S.markets[k]; for (const id of PORTS[k].want) m.idx[id] = Math.max(m.idx[id], 2.2); } // 숨은 항구에 처음 닿은 날: 찾는 물건 값이 2.2까지 뛴다. 팔면 눌리고 날이 가면 가라앉는 한 번뿐인 횡재
  const tax = S.share === k ? 0 : ship().tax; if (tax) { S.gold = Math.max(0, S.gold - tax); } // 입항세: 큰 배일수록
  if (k === 'naniwa') S.flags.naniwa = 1;
  const delivered = deliverOrders(k);
  let passenger = null; if (S.passenger && S.passenger.to === k) { const p = S.passenger; S.passenger = null; S.fame += 80; S.gold += 1500; acct('order', 1500); passenger = { who: p.who, gold: 1500, line: makeRumor('true').line }; }
  const race = (v.race || []).map(id => { const R = S.rivals.find(x => x.id === id), def = RIVALS.find(r => r.id === id); const lost = R.last && R.last.k === k && R.last.day >= Math.floor(v.t0); if (!lost) { S.fame += 25; if (R.good) S.markets[k].guard = { id: R.good, until: S.t + 12 }; } return { id, name: def.name, ch: def.ch, won: !lost, good: R.good }; }); // 경주에서 이기면 명성 +25, 그 물건 값은 한 번 지켜진다
  const pv = previewSale(k, []);
  const items = S.slots.map((s, i) => { const inf = infoFor(k, s.id), act = pv.items[i] ? pv.items[i].act / LOT : sellPrice(k, s.id); let verdict; // 상자마다 값이 3%씩 내려간다 — sell()과 같은 순서로 센다
    if (!inf) verdict = 'unknown'; else { const r = act / inf.price; verdict = inf.fake && r < .8 ? 'fake' : r > 1.15 ? 'better' : r < .85 ? 'worse' : 'right'; }
    if (verdict === 'better' || verdict === 'right') S.stats.hits++; else if (verdict !== 'unknown') S.stats.misses++;
    return { i, id: s.id, cost: s.cost, inf: inf && { price: inf.price * LOT, ago: ago(inf.day), src: inf.src }, act: act * LOT, profit: act * LOT - s.cost, verdict }; });
  const rivalHere = S.rivals.map(R => R.last).filter(l => l && l.k === k && Math.floor(S.t) - l.day < 12).map(l => ({ id: l.id, rival: RIVALS.find(r => S.rivals.find(x => x.last === l).id === r.id) }));
  const L0 = S.ledger[k]; observe(k, fresh); const moves = []; if (L0) for (const id of Object.keys(S.ledger[k].p)) { const a = L0.p[id], b = S.ledger[k].p[id]; if (a && b && Math.abs(b / a - 1) >= .15) moves.push({ id, pct: Math.round((b / a - 1) * 100), days: Math.floor(S.t) - L0.day }); } moves.sort((x, y) => Math.abs(y.pct) - Math.abs(x.pct));
  revealCircle(S.x, S.y, 110); makeOffer(k); makeBounty(k); offerQuests(k); mainVisit(k); questEval(); mainTick(); sceneTick(); tavern(k).dice = 0;
  if (hasMate('doctor')) S.hull = Math.min(S.hullMax, S.hull + 12);
  if (!first && Math.random() < .3) S.pending.push('port:ev');
  let letter = null; if (perk('tongue') || S.boons.letters) letter = makeRumor('true');
  S.threat = Math.max(0, S.threat - (S.t - v.t0) * .05); addThreat(.5); if (S.main && S.main.flags.official && natOf(k) === '왜') S.threat = Math.max(0, S.threat - 3); // official(다자이후 관리에게 비단을 쥐여 줌): 왜 항구에 들 때마다 경계 -3
  return { k, days: S.t - v.t0, first, fresh, items, storms: v.storms, finds: v.finds, letter, delivered, rivalHere, passenger, race, moves: moves.slice(0, 4), tax, total: pv.total, rev: pv.rev };
}
function sellAll(keep) { const res = []; for (let i = S.slots.length - 1; i >= 0; i--) if (!keep || !keep.includes(i)) { const r = sell(i); if (r) res.push(r); } return res.reverse(); }

/* ─────────── 저장 ─────────── */
function saveData() { const d = Object.assign({}, S); delete d.reveals; return JSON.stringify(d); }
function loadData(txt) { let d; try { d = JSON.parse(txt || 'null'); } catch (e) { return null; } if (!d || d.v !== 7) return null;
  d.battle = null; d.dive = null; d.reveals = []; d.ev = null; if (!DIFFS[d.diff]) d.diff = DIFF_OLD; S = d; return S; }

/* ─────────── 결산 ─────────── */
const assets = () => S.gold + S.slots.reduce((a, s) => a + s.cost, 0) + (S.store || []).reduce((a, s) => a + s.cost, 0) + Math.round(ship().price * .5);
const score = () => S.paid + assets();
const rankOf = v => { let r = RANKS[0][1]; for (const [n, name] of RANKS) if (v >= n) r = name; return r; };
const daysToDue = () => Math.max(0, S.nextDue - S.t);

return { WORLD, VIEW, CELL, GW, GH, YEAR, LOT, LAND, LABELS, GOODS, G, PORTS, PORT_IDS, FINDS, ZONES, SHIPS, SHIP_VARS, shipOf, CAPTAINS, CREW, RANKS, RIVALS, BOONS, SEASONS,
  P, JO, get S() { return S; }, set S(v) { S = v; }, DIFFS, DIFF_NEW, dif, saveData, loadData,
  newGame, update, portTick, plan, depart, buy, sell, sellAll, previewSale, buyRumor, rumorCost, rumorsLeft, tribute, tributeCost, canTribute, canBribe, bribe, bribeCost, bribeLeft, repair, repairCost, upgrade, nextShip, waitDays,
  choose, nextStory, infoFor, tickMarket, buyPrice, sellPrice, cratePrice, dealPrice, pctOf, topDemand, activeBoom, freeSlots, capacity, ship, crewOf, perk, pressInfo,
  acceptOffer, quotaNow, quotaFor, quotaCurve, quotaCap, quotaFloor, quotaForecast, seasonReport, debtsAllowed, takeBoon, redrawBoons, REDRAW_COST, daysToDue, inZone, pirateOdds, zoneR, NEWS, SPECIALS, STORE_MAX, storeMax, wealth,
  OFFICE, officeInfo, buyOffice, escortCost, QUOTA_END, endingTree, ENDING_TREE, bossRec, BOSS_TIER, tavernReroll, REROLL_COST, mateValue, threatMax,
  ARCS, ENDINGS, NUM, MATES, MBY, arcOf, curAct, mainGoals, mainTick, mainPay, mainDeliver, mainSpots, mainStory, hasMate, mateCap, wages, tavern, hireMate, fireMate, rollDice, portEvent,
  QUESTS, QBY, FIND_META, REGIONS, qStep, startQuest, questEval, questSpots, regionCheck,
  BOSSES, RELICS, GIMMICK, battleOpts, battleAct, battleClose, makeBattle, acceptBounty, makeBounty, addMap, diveAct, diveClose, diveCost, makeDive, GASP, arrowDmg, boardDmg,
  SCENES, VOICES, MATE_LINES, mateLine, rivalLine, sceneTick, sceneStory,
  wireTick, setRow, racers, specialInfo, useSpecial, storePut, storeTake, shipPrice, isClosed, liveNews,
  wind, monsoon, windWord, dateStr, seasonOf, doyOf, ago, assets, score, rankOf, seaAt, onLand, revealed, findPath, estimateDays, angDiff, pathZones };
})();
if (typeof module !== 'undefined') module.exports = CORE;
