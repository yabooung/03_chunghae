import asyncio
from playwright.async_api import async_playwright
import pathlib, os
ROOT=pathlib.Path(__file__).resolve().parent.parent
URL=(ROOT/'dist'/'index.html').as_uri(); OUT=str(ROOT/'shots')+'/'; os.makedirs(OUT, exist_ok=True)
async def run(name, vw, vh):
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':vw,'height':vh})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)+' @ '+str(e.stack)[:300])); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text else None)
        await pg.goto(URL); await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{try{localStorage.setItem('chunghae.v2.meta',JSON.stringify({tut:true,runs:1,best:0,unlocked:{},sound:false}))}catch(e){}}")
        await pg.reload(); await pg.wait_for_timeout(2000)
        await pg.click('#bStart'); await pg.wait_for_timeout(2200)
        await pg.screenshot(path=OUT+name+'-1-act1.png')
        await pg.evaluate("()=>document.querySelector('#stCard .choice')?.click()"); await pg.wait_for_timeout(700)
        await pg.evaluate("()=>document.querySelector('#stCard .choice')?.click()"); await pg.wait_for_timeout(700)
        await pg.screenshot(path=OUT+name+'-2-port.png')
        await pg.evaluate("()=>{const H=window.__CHUNGHAE,S=H.C.S;S.gold=20000;H.setTab('tavern')}"); await pg.wait_for_timeout(300)
        el=await pg.query_selector('[data-hire]:not([disabled])')
        if el: await el.click(); await pg.wait_for_timeout(300)
        el=await pg.query_selector('[data-dice="500:even"]')
        if el: await el.click(); await pg.wait_for_timeout(1300)
        await pg.screenshot(path=OUT+name+'-3-tavern.png')
        await pg.evaluate("()=>window.__CHUNGHAE.setTab('work')"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=OUT+name+'-4-work.png')
        await pg.evaluate("()=>{const H=window.__CHUNGHAE;H.openBook('quest')}"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=OUT+name+'-5-bookq.png')
        await pg.evaluate("()=>{const H=window.__CHUNGHAE;H.openBook('log')}"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=OUT+name+'-6-log.png')
        # ending
        await pg.evaluate("()=>{document.getElementById('mBook').hidden=true;const H=window.__CHUNGHAE,C=H.C,S=C.S;S.quotaN=7;S.main.act=4;S.main.started=false;S.main.offered=false;S.main.flags.woojing=true;S.pending=[];C.mainTick();H.runStories()}"); await pg.wait_for_timeout(800)
        await pg.screenshot(path=OUT+name+'-7-act5.png')
        await pg.evaluate("()=>{document.querySelector('#stCard .choice')?.click()}"); await pg.wait_for_timeout(500)
        await pg.evaluate("()=>{const H=window.__CHUNGHAE,C=H.C,S=C.S;S.fame=3000;S.main.visits.cheonghae=99;C.mainTick();H.runStories()}"); await pg.wait_for_timeout(800)
        await pg.evaluate("()=>{document.querySelectorAll('#stCard .choice')[1]?.click()}"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=OUT+name+'-8-ending.png')
        print(name,'오류:',errs[:6] or '없음')
        await b.close()
asyncio.run(run('pc',1440,900)); asyncio.run(run('mo',390,844))
