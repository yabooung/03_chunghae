# 청해 — 바람의 장부

828년, 배 한 척과 오천 냥. 장보고의 시대, 신라·당·왜·발해의 바다를 누비는 캐주얼 교역·해전·탐험 게임.

- **장사** — 소문을 믿고 상자를 실어 나른다. 29개 항구, 11가지 물건, 계절풍과 세상 소식이 값을 흔든다.
- **해전** — 적의 다음 수를 읽고 맞받는 턴제 해전. 예고를 놓치면 크게 다친다. 현상 수배 두목 6명.
- **탐험** — 보물 지도를 따라 잠수(숨이 끊기면 건진 것을 다 잃는다), 발견지 27곳의 탐험 도감, 유물 8종.
- **난이도** — 바람(쉬움)·풍랑(보통)·태풍(어려움). 수치는 `src/core.js`의 `DIFFS` 표 하나에 있다.
- **이야기** — 선장(궁복·아라·도모)마다 막으로 나뉜 본 이야기와 결말 10개, 이야기 퀘스트 7줄기.

## 실행

```bash
npm run build      # dist/index.html 한 파일로 묶는다(글꼴까지) → 인터넷 없이도 브라우저로 열면 된다
npm test           # 빠른 점검 (물길·새 게임·난이도별 봇 진행·저장 왕복·결말)
npm run sim:battle   # 난이도별 해전 승률 (예고를 읽는 봇 / 아무 수나 누르는 봇)
npm run sim:economy  # 난이도별 상납 생존 · 상납 대비 재산 · 항해 사건 분포 (몇 분 걸린다)
npm run sim:dive     # 잠수 욕심별 기대값
```

의존성 없음. Node 18+만 있으면 된다. 스크린샷 점검은 `pip install playwright` 후 `npm run shots`.

## 구조

```
src/
  page.html   화면 뼈대와 스타일 (한지·먹·단청 — 색·글꼴·움직임 토큰이 맨 위 :root에 있다)
  core.js     규칙 엔진 — DOM 없음. node에서 require 해서 시뮬레이션할 수 있다
  ui.js       캔버스 해도, 모달, 소리, 입력, 흐름
  art/scenes.js 장면 그림 — 항구 29곳(원형 6 + 청해진), 사건 카드 30장, 두목·해적 배, 결말 13장 (캔버스)
assets/fonts/     게임 글자만 남긴 woff2 글꼴 4벌과 사용 허락(SIL OFL 1.1)
tools/build.js   네 파일과 글꼴을 dist/index.html 하나로
tools/fonts.py   글꼴 부분 집합 만들기 (pip install fonttools brotli)
test/
  smoke.js       CI에서 매번 도는 빠른 점검
  sim/           밸런스 시뮬레이션 (경제·해전·잠수)
  screenshots.py PC·모바일 화면 캡처 (Playwright)
docs/            설계 문서와 로드맵
```

## 문서

- [docs/DESIGN.md](docs/DESIGN.md) — 지금 들어 있는 시스템과 수치
- [docs/ROADMAP.md](docs/ROADMAP.md) — 상품화까지의 순서
