# 작업 메모 (Claude Code용)

- 빌드: `npm run build` → `dist/index.html`. 점검: `npm test`. 둘 다 통과해야 커밋한다.
- `src/core.js`는 DOM을 쓰지 않는다. 규칙·수치는 여기에, 그리기·입력은 `src/ui.js`에.
- core.js / ui.js 안에 `</script` 문자열을 넣지 않는다(한 파일로 묶을 때 깨진다).
- 저장 형식을 바꾸면 `S.v`와 ui.js의 `KEY`(chunghae.vN.save)를 함께 올린다.
- 밸런스를 건드리면 `npm run sim:economy`로 생존 계절 수를 비교한다.
- 글꼴은 게임에 쓰는 글자만 담는다. 새 글자(특히 한자)를 쓰면 `python tools/fonts.py`로 다시 만든다 — 빠지면 `npm test`가 알려 준다.
- 색·글꼴·간격은 page.html 맨 위 `:root` 토큰으로만 쓴다. 움직임은 `RM`(움직임 줄이기)일 때 멈춘다.
- 화면을 건드리면 `npm run shots`로 PC(1440×900)·모바일(390×844)을 확인한다.
- 사용자에게 보이는 글은 한국어, 사극체가 아닌 담백한 평서체.
