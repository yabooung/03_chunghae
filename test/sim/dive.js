const C=require('../../src/core.js');const S=C.newGame('gungbok');
for(const site of [{lv:1},{lv:2},{lv:3},{lv:1,pearl:true,max:4}]) for(const greed of [0,15]){let g=0,rel=0,bo=0,cr=0,N=3000,dep=0;
 for(let i=0;i<N;i++){S.relics={};S.slots=[];S.gold=0;C.makeDive(Object.assign({name:'x'},site));const D=S.dive;
  while(!D.over){ if(D.depth>=D.max||D.breath<C.diveCost(D)+greed) C.diveAct('up'); else C.diveAct('down'); }
  g+=D.result.gold;rel+=D.result.relics.length;cr+=D.result.crates.length;if(D.over==='blackout')bo++;dep+=D.depth;S.dive=null;}
 console.log(JSON.stringify(site),'greed',greed,'gold',Math.round(g/N),'crates',(cr/N).toFixed(2),'relic%',(rel/N*100).toFixed(1),'blackout%',(bo/N*100).toFixed(1),'depth',(dep/N).toFixed(1));}
