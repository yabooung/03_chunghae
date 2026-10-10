const GUARD=+process.argv[3]||900;const C=require('../../src/core.js');const {PORTS,PORT_IDS}=C;
function smartB(B){const I=B.intent,near=B.dist==='near',S=C.S,mv=S.stamina>=15;if(S.hull<S.hullMax*.25&&!near&&Math.random()<.5)return 'flee';
  if(I.k==='volley')return near||!mv?'guard':'move';if(I.k==='aim')return near?'board':(mv?'move':'shoot');
  if(near){if(I.k==='board')return (B.e.hp<=C.boardDmg()*1.2*B.mom)?'board':(mv?'move':'guard');if(I.k==='ram')return mv?'move':'guard';return 'board';}return 'shoot';}
function resolve(){const S=C.S;let g=0;while(S.battle&&g++<60){if(S.battle.over){const r=C.battleClose();BT[r.over]=(BT[r.over]||0)+1;break;}C.battleAct(smartB(S.battle));}
  g=0;while(S.dive&&g++<20){const D=S.dive;if(D.over){const r=C.diveClose();DV.n++;DV.gold+=r.gold;DV.rel+=r.relics.length;break;}C.diveAct(D.depth>=D.max||D.breath<C.diveCost(D)+12?'up':'down');}}
function play(style){
  const S=C.newGame(CAP);let ev=0,quotaLog=[],end=null,ambush=0,rivalHits=0,orders=0,alts=0,zoneTrips=0;
  const drain=()=>{let st,g=0;while((st=C.nextStory())&&g++<20){const o=st.title&&st.title.includes('마지막')?st.opts[Math.floor(Math.random()*st.opts.length)]:st.opts[0];o.apply();if(S.ended)break;}};
  for(let g=0;g<GUARD&&!S.ended;g++){
    if(S.draft){C.takeBoon(S.draft[Math.floor(Math.random()*S.draft.length)]);}
    if(S.mode==='port'){
      for(const o of C.portTick()){if(o.type==='quota')quotaLog.push(o.res.ok?'○':'×');}
      if(S.ended)break; if(S.draft)continue;
      drain();if(S.ended)break;
      if(S.hull<S.hullMax*.6)C.repair();
      const n=C.nextShip(); if(n&&S.gold>n.price+C.quotaNow()*1.1)C.upgrade();
      if(S.threat>=70&&C.canTribute())C.tribute();
      if(style!=='lazy'&&S.gold>3000&&Math.random()<.6)C.buyRumor();
      const off=S.offers[S.at];if(style==='smart'&&off&&!off.none&&S.orders.length<2&&Math.random()<.5)C.acceptOffer(S.at);
      resolve();
      for(const g of C.mainGoals()){if(g.pay&&g.pay.k===S.at&&!g.done&&S.gold>g.pay.n+C.quotaNow()*.6)C.mainPay(S.at);if(g.deliver&&g.deliver.k===S.at)C.mainDeliver(S.at);}
      drain(); if(S.ended)break;
      if(S.mates.length<C.mateCap()&&S.gold>8000){const t=C.tavern(S.at);if(t.offer[0])C.hireMate(t.offer[0]);}
      const here=S.at;C.tickMarket(here);let best=null;
      if(style==='smart'&&!S.bounty&&S.bOffers[here]&&!S.bOffers[here].none&&S.tier>=1&&Math.random()<.5){C.acceptBounty(here);BO++;}

      for(const id of S.markets[here].stock){const bp=C.buyPrice(here,id);for(const d of PORT_IDS){if(d===here||!S.known[d])continue;const inf=C.infoFor(d,id);if(!inf)continue;const p=C.plan(d);if(!p||p.closedPort)continue;const gg=(inf.price-bp)/Math.max(3,p.days);if(!best||gg>best.g)best={id,d,g:gg};}}
      if(style!=='lazy'&&Math.random()<.12){const t=[{x:1250,y:1650},{x:1700,y:950},{x:350,y:1950},{x:1400,y:150}][Math.floor(Math.random()*4)];const p=C.plan(t);if(p){C.depart(p);continue;}}
      // 의뢰 물건 싣기
      for(const o of S.orders){if(o.from===here||true){const have=S.slots.filter(s=>s.id===o.good).length;if(have<o.n&&S.markets[here].stock.includes(o.good))for(let i=have;i<o.n;i++)C.buy(o.good);}}
      const dest=(S.orders.length&&Math.random()<.5)?S.orders[0].to:(best&&best.g>0?best.d:PORT_IDS.filter(k=>k!==here&&S.known[k])[Math.floor(Math.random()*5)]);
      if(best&&best.g>0)while(C.freeSlots()&&S.gold>=C.cratePrice(here,best.id)+ (style==='smart'?C.quotaNow()*0.0:0))if(!C.buy(best.id).ok)break;
      if(style!=='lazy'&&Math.random()<.35){const tg=S.bounty&&!(S.bounty.cool>S.t)?S.bounty:S.maps[0];if(tg){const p=C.plan({x:tg.x,y:tg.y});if(p&&!p.closedPort){HUNT++;C.depart(p);continue;}}}
      if(style!=='lazy'&&Math.random()<.4){const gs=C.mainGoals().filter(g=>!g.done);let tk=null;for(const g of gs){if(g.k)tk=g.k;if(g.pay&&S.gold>g.pay.n)tk=g.pay.k;if(g.text.includes('들른다')){const ks=['mizhou','chuzhou','deungju'].filter(k=>!S.main.visits[k]);if(ks.length)tk=ks[0];}if(g.spot){const sp=C.mainSpots()[0];if(sp){const pp=C.plan({x:sp.x,y:sp.y});if(pp){C.depart(pp);tk='__';break;}}}}
        if(tk==='__')continue; if(tk&&tk!==here){const pp=C.plan(tk);if(pp&&!pp.closedPort){C.depart(pp);continue;}}}
      let p=C.plan(dest);if(!p||p.closedPort){const alt=PORT_IDS.filter(k=>k!==here&&S.known[k]&&!C.isClosed(k));p=C.plan(alt[Math.floor(Math.random()*alt.length)]);if(!p||p.closedPort)continue;}
      if(style!=='lazy'){const sp=C.specialInfo(here);if(sp&&sp.can&&!sp.passive&&sp.kind!=='store'&&sp.kind!=='swap'){const r=C.useSpecial(here);if(r.ok)SPU[sp.kind]=(SPU[sp.kind]||0)+1;resolve();}}
      const useAlt=!!p.alt&&(style==='smart'?S.slots.length>=3:Math.random()<.3);if(useAlt)alts++;if(p.main.zones.length&&!useAlt)zoneTrips++;
      C.depart(p,useAlt);
    } else if(S.mode==='sea'){const k=PORT_IDS.filter(k=>S.known[k]).sort((a,b)=>Math.hypot(PORTS[a].x-S.x,PORTS[a].y-S.y)-Math.hypot(PORTS[b].x-S.x,PORTS[b].y-S.y))[0];const pp=C.plan(k);if(pp&&!pp.closedPort)C.depart(pp);else{const kk=PORT_IDS.filter(x=>S.known[x]&&!C.isClosed(x))[0];C.depart(C.plan(kk));}}
    else{if(style==='smart'&&!S.rowing&&S.stamina>60&&Math.abs(S.windDeg||0)>100)C.setRow(true);const out=C.update(.5);
      for(const o of out){if(o.type==='event'){ev++;if(o.ev.title==='흑기 해적선')ambush++;C.choose(0);resolve();}
        if(o.type==='rival')rivalHits++;if(['news','chase','escaped','tired','bounced','passengerLost'].includes(o.type))CNT[o.type]=(CNT[o.type]||0)+1;if(o.type==='event')EVC[o.ev.id]=(EVC[o.ev.id]||0)+1;
        if(o.type==='quota')quotaLog.push(o.res.ok?'○':'×');
        if(o.type==='battle'||o.type==='dive')resolve();
        if(o.type==='arrive'){orders+=o.info.delivered.length;C.sellAll(o.info.items.filter(x=>x.profit<0).map(x=>x.i));}}}
  }
  ENDS[S.ending||S.ended]=(ENDS[S.ending||S.ended]||0)+1;ACT[S.main.act]=(ACT[S.main.act]||0)+1;return {style,q:quotaLog.join(''),seasons:S.quotaN,end:S.ended,score:C.score(),gold:Math.round(S.gold),known:PORT_IDS.filter(k=>S.known[k]).length,voy:S.stats.voyages,ev,ambush,rivalHits,orders,alts,zoneTrips,boons:Object.entries(S.boons).map(([k,v])=>k+v).join(','),t:Math.round(S.t)};
}
const N=+process.argv[2]||8;const CAP=process.argv[4]||'gungbok';var ENDS={},ACT={},CNT={},SPU={},EVC={},BT={},DV={n:0,gold:0,rel:0},BO=0,HUNT=0;
for(const st of ['lazy','normal','smart']){const R=[];for(let i=0;i<N;i++)R.push(play(st));
  console.log(`\n■ ${st} ×${N}`);
  R.forEach(r=>console.log(`  상납 ${r.q.padEnd(10)} 계절 ${r.seasons} · 끝 ${r.end} · 점수 ${r.score.toLocaleString()} · 항해 ${r.voy} · 사건 ${r.ev}(흑기 ${r.ambush}) · 경쟁 판매 ${r.rivalHits} · 의뢰 ${r.orders} · 우회 ${r.alts}/해역통과 ${r.zoneTrips} · 항구 ${r.known}/${PORT_IDS.length} · ${r.boons}`));
  const s=R.map(r=>r.seasons);console.log(`  버틴 계절 평균 ${(s.reduce((a,b)=>a+b,0)/N).toFixed(1)} · 1년 넘김 ${s.filter(x=>x>=4).length}/${N}`);
}

console.log('\nCNT',CNT);console.log('SPECIAL',SPU);
{const tot=Object.values(EVC).reduce((a,b)=>a+b,0);console.log(`EVENTS ${tot}건 — `+Object.entries(EVC).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k} ${(v/tot*100).toFixed(1)}%`).join(' · '));}
console.log('BATTLE',BT,'DIVE',DV,'bounties taken',BO,'hunt trips',HUNT);
console.log('ENDINGS',ENDS,'ACT reached',ACT);
