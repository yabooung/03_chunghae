// src/page.html + src/core.js + src/codex.js + src/art/*.js + src/ui.js + assets/fonts → dist/index.html (한 파일, 인터넷 없이도 열린다)
// 순서: 배치 CSS·화면 뼈대 → 스크립트 → 글꼴(@font-face, 본문 끝 <style id="fontcss">). 느린 회선에서도 첫 그림이 바로 뜨고, 글꼴은 뒤따라온다(ui.js가 fontcss를 기다렸다 '닻을 올리는 중' 덮개를 걷는다)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), src = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');
const page = src('page.html'), core = src('core.js'), codex = src('codex.js'), ui = src('ui.js');
// 그림 모듈(인물 초상 등): src/art 안의 .js를 이름 순으로 core 다음, ui 앞에 넣는다
const ART = fs.readdirSync(path.join(root, 'src', 'art')).filter(f => f.endsWith('.js')).sort().map(f => ['art/' + f, src('art/' + f)]);
for (const [n, t] of [['core.js', core], ['codex.js', codex], ...ART, ['ui.js', ui]]) if (t.includes('</script')) throw new Error(n + ' 안에 </script 가 있다');
const pageOut = page.replace('/*@FONTS@*/', '');  // 옛 자리표가 남아 있어도 비우고 지나간다 — 글꼴은 본문 끝에 넣는다

// 글꼴: tools/fonts.py 가 게임에 쓰는 글자만 남겨 둔 woff2를 base64로 넣는다.
// 본문(Sans)은 block — 글자가 잠깐 비었다가 제 글꼴로 뜬다. 제목·도장·붓글씨는 swap — 대체 글꼴로 먼저 보이고 바뀐다.
// 도장(Seal)은 둘로 나눈다: 게임 화면 글자(ch-seal)와 사전에만 나오는 글자(ch-seal-x). unicode-range 는 fonts.py 가 faces.json 에 적는다
const FD = path.join(root, 'assets', 'fonts');
const RANGES = fs.existsSync(path.join(FD, 'faces.json')) ? JSON.parse(fs.readFileSync(path.join(FD, 'faces.json'), 'utf8')) : {};
const HANJA = 'U+3400-9FFF,U+F900-FAFF';
const FACES = [
  ['Chunghae Sans', 'ch-sans-400', '100 500', null, 'block'],
  ['Chunghae Sans', 'ch-sans-600', '600 900', null, 'block'],
  ['Chunghae Myeong', 'ch-myeong', '400', null, 'swap'],
  ['Chunghae Seal', 'ch-seal', '400 900', RANGES['ch-seal'] || HANJA, 'swap'],
  ['Chunghae Seal', 'ch-seal-x', '400 900', RANGES['ch-seal-x'] || null, 'swap'],
  ['Chunghae Brush', 'ch-brush', '400', RANGES['ch-brush'] || HANJA, 'swap']
].filter(([, file]) => fs.existsSync(path.join(FD, file + '.woff2')));
const faces = FACES.map(([fam, file, w, range, disp]) => {
  const b64 = fs.readFileSync(path.join(FD, file + '.woff2')).toString('base64');
  return `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${b64}) format("woff2");font-weight:${w};font-style:normal;font-display:${disp}${range ? `;unicode-range:${range}` : ''}}`;
}).join('\n');
const license = fs.readFileSync(path.join(FD, 'LICENSE.txt'), 'utf8').replace(/--/g, '- -');

const out = `${pageOut}\n<script>\n${core}\n</script>\n<script>\n${codex}\n</script>\n${ART.map(([, t]) => `<script>\n${t}\n</script>\n`).join('')}<script>\n${ui}\n</script>\n<style id="fontcss">\n${faces}\n</style>\n<script>window.__FONTCSS=1;document.dispatchEvent(new Event('fontcss'))</script>\n<!--\n글꼴 사용 허락 (SIL Open Font License 1.1)\n${license}-->\n`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'index.html'), out);
console.log(`dist/index.html — ${(Buffer.byteLength(out) / 1024).toFixed(0)} KB (글꼴 ${(Buffer.byteLength(faces) / 1024).toFixed(0)} KB · ${FACES.length}면)`);
