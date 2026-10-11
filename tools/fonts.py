# 글꼴을 게임에 쓰는 글자만 남겨 assets/fonts/*.woff2 로 만든다 (한 파일 빌드에 base64로 들어간다).
# 글을 새로 쓰거나 고쳐서 글꼴에 없는 글자가 생기면 다시 돌린다 — npm test 가 빠진 글자를 알려 준다.
#   pip install fonttools brotli
#   python tools/fonts.py
# 원본 TTF는 google/fonts 저장소에서 받아 .cache/fonts/ 에 둔다(저장소에는 올리지 않는다).
# 모두 SIL Open Font License 1.1. 고친 글꼴(부분 집합)이므로 예약 글꼴 이름을 피해 'Chunghae …'로 이름을 바꾼다.
import io, json, os, sys, urllib.request
from fontTools.ttLib import TTFont
from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.cache', 'fonts')
OUT = os.path.join(ROOT, 'assets', 'fonts')
GH = 'https://raw.githubusercontent.com/google/fonts/main/ofl/'

# (출력 이름, 원본 경로, 새 이름, 굵기 이름, 어떤 글자를 넣나)
#   text  — 한자가 아닌 글자(한글·숫자·기호)   hanja — 게임 화면과 사전의 한자
#   hanja-game — 게임 화면에만 나오는 한자      hanja-codex — 사전 글에만 나오는 한자(화면 글자에는 없는 것)
# 도장 글꼴은 둘로 나눈다: 첫 화면·해도·머리띠가 쓰는 글자(ch-seal)는 작게, 사전에서만 쓰는 수백 자(ch-seal-x)는 따로.
# 브라우저는 unicode-range(faces.json → build.js)를 보고 사전을 펴기 전까지 ch-seal-x 를 풀지 않는다.
FONTS = [
    ('ch-sans-400', 'ibmplexsanskr/IBMPlexSansKR-Regular.ttf', 'Chunghae Sans', 'Regular', 'text'),
    ('ch-sans-600', 'ibmplexsanskr/IBMPlexSansKR-SemiBold.ttf', 'Chunghae Sans', 'SemiBold', 'text'),
    ('ch-myeong', 'songmyung/SongMyung-Regular.ttf', 'Chunghae Myeong', 'Regular', 'text'),
    ('ch-seal', 'lxgwwenkaitc/LXGWWenKaiTC-Bold.ttf', 'Chunghae Seal', 'Bold', 'hanja-game'),
    ('ch-seal-x', 'lxgwwenkaitc/LXGWWenKaiTC-Bold.ttf', 'Chunghae Seal', 'Bold', 'hanja-codex'),
    ('ch-brush', 'yujiboku/YujiBoku-Regular.ttf', 'Chunghae Brush', 'Regular', 'hanja-game'),
]
LICENSES = ['ibmplexsanskr', 'songmyung', 'lxgwwenkaitc', 'yujiboku']

def is_hanja(c):
    o = ord(c)
    return 0x3400 <= o <= 0x9FFF or 0xF900 <= o <= 0xFAFF

GAME = ('core.js', 'art/scenes.js', 'ui.js', 'page.html')
CODEX = ('codex.js',)  # 사전 글 — 본문·제목·도장 글꼴에만 넣는다(큰 붓글씨는 게임 화면 글자만)

def source_chars(files=GAME + CODEX):
    txt = ''
    for f in files:
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

def ranges(codes):
    """정렬된 코드포인트 목록 → CSS unicode-range 문자열 (이어지는 것은 U+A-B 로 묶는다)"""
    out, cs = [], sorted(set(codes))
    i = 0
    while i < len(cs):
        j = i
        while j + 1 < len(cs) and cs[j + 1] == cs[j] + 1:
            j += 1
        out.append(f'U+{cs[i]:X}' if i == j else f'U+{cs[i]:X}-{cs[j]:X}')
        i = j + 1
    return ','.join(out)

def main():
    chars = source_chars()
    game = source_chars(GAME)
    os.makedirs(OUT, exist_ok=True)
    covered = set()
    faces = {}
    for out, rel, family, style, kind in FONTS:
        f = TTFont(fetch(rel))
        cmap = f.getBestCmap()
        if kind == 'text':
            want = [c for c in chars if not is_hanja(c)]
        elif kind == 'hanja-game':
            want = [c for c in game if is_hanja(c)]
        else:  # hanja-codex: 사전 글에만 있는 한자
            want = [c for c in chars if is_hanja(c) and c not in game]
        have = [ord(c) for c in want if ord(c) in cmap]
        if kind != 'text':
            faces[out] = ranges(have)
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
    with open(os.path.join(OUT, 'faces.json'), 'w', encoding='utf8') as fh:
        json.dump(faces, fh, indent=1)
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
