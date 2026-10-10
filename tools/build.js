// src/page.html + src/core.js + src/art/*.js + src/ui.js + assets/fonts → dist/index.html (한 파일, 인터넷 없이도 열린다)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), src = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');
const page = src('page.html'), core = src('core.js'), ui = src('ui.js');
// 그림 모듈(인물 초상 등): src/art 안의 .js를 이름 순으로 core 다음, ui 앞에 넣는다
const ART = fs.readdirSync(path.join(root, 'src', 'art')).filter(f => f.endsWith('.js')).sort().map(f => ['art/' + f, src('art/' + f)]);
for (const [n, t] of [['core.js', core], ...ART, ['ui.js', ui]]) if (t.includes('</script')) throw new Error(n + ' 안에 </script 가 있다');

// 글꼴: tools/fonts.py 가 게임에 쓰는 글자만 남겨 둔 woff2를 base64로 넣는다
const FD = path.join(root, 'assets', 'fonts');
const FACES = [
  ['Chunghae Sans', 'ch-sans-400', '100 500'],
  ['Chunghae Sans', 'ch-sans-600', '600 900'],
  ['Chunghae Myeong', 'ch-myeong', '400'],
  ['Chunghae Seal', 'ch-seal', '400 900', 'U+3400-9FFF,U+F900-FAFF'],
  ['Chunghae Brush', 'ch-brush', '400', 'U+3400-9FFF,U+F900-FAFF']
];
const faces = FACES.map(([fam, file, w, range]) => {
  const b64 = fs.readFileSync(path.join(FD, file + '.woff2')).toString('base64');
  return `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${b64}) format("woff2");font-weight:${w};font-style:normal;font-display:block${range ? `;unicode-range:${range}` : ''}}`;
}).join('\n');
if (!page.includes('/*@FONTS@*/')) throw new Error('page.html 에 /*@FONTS@*/ 자리가 없다');
const license = fs.readFileSync(path.join(FD, 'LICENSE.txt'), 'utf8').replace(/--/g, '- -');

const out = `${page.replace('/*@FONTS@*/', () => faces)}\n<script>\n${core}\n</script>\n${ART.map(([, t]) => `<script>\n${t}\n</script>\n`).join('')}<script>\n${ui}\n</script>\n<!--\n글꼴 사용 허락 (SIL Open Font License 1.1)\n${license}-->\n`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'index.html'), out);
console.log(`dist/index.html — ${(Buffer.byteLength(out) / 1024).toFixed(0)} KB (글꼴 ${(Buffer.byteLength(faces) / 1024).toFixed(0)} KB)`);
