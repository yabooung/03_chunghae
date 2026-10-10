# 글꼴을 게임에 쓰는 글자만 남겨 assets/fonts/*.woff2 로 만든다 (한 파일 빌드에 base64로 들어간다).
# 글을 새로 쓰거나 고쳐서 글꼴에 없는 글자가 생기면 다시 돌린다 — npm test 가 빠진 글자를 알려 준다.
#   pip install fonttools brotli
#   python tools/fonts.py
# 원본 TTF는 google/fonts 저장소에서 받아 .cache/fonts/ 에 둔다(저장소에는 올리지 않는다).
# 모두 SIL Open Font License 1.1. 고친 글꼴(부분 집합)이므로 예약 글꼴 이름을 피해 'Chunghae …'로 이름을 바꾼다.
import io, os, sys, urllib.request
from fontTools.ttLib import TTFont
from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.cache', 'fonts')
OUT = os.path.join(ROOT, 'assets', 'fonts')
GH = 'https://github.com/google/fonts/raw/main/ofl/'

# (출력 이름, 원본 경로, 새 이름, 굵기 이름, 어떤 글자를 넣나)
FONTS = [
    ('ch-sans-400', 'ibmplexsanskr/IBMPlexSansKR-Regular.ttf', 'Chunghae Sans', 'Regular', 'text'),
    ('ch-sans-600', 'ibmplexsanskr/IBMPlexSansKR-SemiBold.ttf', 'Chunghae Sans', 'SemiBold', 'text'),
    ('ch-myeong', 'songmyung/SongMyung-Regular.ttf', 'Chunghae Myeong', 'Regular', 'text'),
    ('ch-seal', 'lxgwwenkaitc/LXGWWenKaiTC-Bold.ttf', 'Chunghae Seal', 'Bold', 'hanja'),
    ('ch-brush', 'yujiboku/YujiBoku-Regular.ttf', 'Chunghae Brush', 'Regular', 'hanja'),
]
LICENSES = ['ibmplexsanskr', 'songmyung', 'lxgwwenkaitc', 'yujiboku']

def is_hanja(c):
    o = ord(c)
    return 0x3400 <= o <= 0x9FFF or 0xF900 <= o <= 0xFAFF

def source_chars():
    txt = ''
    for f in ('core.js', 'art/scenes.js', 'ui.js', 'page.html'):
        with open(os.path.join(ROOT, 'src', f), encoding='utf8') as fh:
            txt += fh.read()
    chars = set(txt) | {chr(c) for c in range(0x20, 0x7F)} | set('0123456789+-−×·…—–%,.₩')
    return {c for c in chars if ord(c) >= 0x20}

def fetch(rel):
    os.makedirs(CACHE, exist_ok=True)
    dst = os.path.join(CACHE, rel.replace('/', '_'))
    if not os.path.exists(dst):
        print('받는 중', rel)
        urllib.request.urlretrieve(GH + rel, dst)
    return dst

def rename(font, family, style):
    name = font['name']
    full = family + ('' if style == 'Regular' else ' ' + style)
    ps = full.replace(' ', '')
    for rec in list(name.names):
        if rec.nameID in (1, 3, 4, 6, 16, 17, 21, 22):
            name.removeNames(nameID=rec.nameID)
    fam = family if style in ('Regular', 'Bold') else full
    sub = style if style in ('Regular', 'Bold') else 'Regular'
    for nid, val in ((1, fam), (2, sub), (3, ps + '-subset'), (4, full), (6, ps), (16, family), (17, style)):
        name.setName(val, nid, 3, 1, 0x409)

def main():
    chars = source_chars()
    os.makedirs(OUT, exist_ok=True)
    covered = set()
    for out, rel, family, style, kind in FONTS:
        f = TTFont(fetch(rel))
        cmap = f.getBestCmap()
        want = [c for c in chars if (is_hanja(c) if kind == 'hanja' else not is_hanja(c))]
        have = [ord(c) for c in want if ord(c) in cmap]
        covered |= {chr(u) for u in have}
        o = subset.Options()
        o.flavor = 'woff2'
        o.layout_features = ['kern', 'liga', 'calt', 'ccmp', 'locl', 'mark', 'mkmk', 'vert', 'vrt2']
        o.name_IDs = ['*']
        o.notdef_outline = True
        o.desubroutinize = True
        s = subset.Subsetter(o)
        s.populate(unicodes=have)
        s.subset(f)
        rename(f, family, style)
        f.flavor = 'woff2'
        buf = io.BytesIO()
        f.save(buf)
        with open(os.path.join(OUT, out + '.woff2'), 'wb') as fh:
            fh.write(buf.getvalue())
        print(f'{out}.woff2  {len(have)}자  {len(buf.getvalue()) / 1024:.0f} KB')
    with open(os.path.join(OUT, 'charset.txt'), 'w', encoding='utf8') as fh:
        fh.write(''.join(sorted(covered)))
    lic = ['이 폴더의 글꼴은 아래 원본을 게임에 쓰는 글자만 남겨 줄이고 이름을 바꾼 것이다(SIL OFL 1.1 §3).',
           'Chunghae Sans = IBM Plex Sans KR · Chunghae Myeong = Song Myung · Chunghae Seal = LXGW WenKai TC Bold · Chunghae Brush = Yuji Boku', '']
    for k in LICENSES:
        lic.append('=' * 72)
        with open(fetch(k + '/OFL.txt'), encoding='utf8') as fh:
            lic.append(fh.read().strip())
        lic.append('')
    with open(os.path.join(OUT, 'LICENSE.txt'), 'w', encoding='utf8') as fh:
        fh.write('\n'.join(lic) + '\n')
    miss = sorted(c for c in chars if c not in covered and ord(c) > 0x7F)
    if miss:
        print('어느 글꼴에도 없는 글자(시스템 글꼴로 보인다):', ''.join(miss))

if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    main()
