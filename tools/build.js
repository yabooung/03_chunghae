// src/page.html + src/core.js + src/ui.js → dist/index.html (한 파일)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), src = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');
const page = src('page.html'), core = src('core.js'), ui = src('ui.js');
for (const [n, t] of [['core.js', core], ['ui.js', ui]]) if (t.includes('</script')) throw new Error(n + ' 안에 </script 가 있다');
const out = `${page}\n<script>\n${core}\n</script>\n<script>\n${ui}\n</script>\n`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'index.html'), out);
console.log(`dist/index.html — ${(Buffer.byteLength(out) / 1024).toFixed(0)} KB`);
