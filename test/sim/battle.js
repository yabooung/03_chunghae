const C=require('../../src/core.js');
function smart(B){const I=B.intent,near=B.dist==='near',S=C.S;
  const mv=S.stamina>=15;if(I.k==='volley') return near||!mv?'guard':'move';
  if(I.k==='aim') return near?'board':(mv?'move':'shoot');
  if(near){ if(I.k==='board'){ return (B.e.hp<=C.boardDmg()*1.2*B.mom)?'board':(mv?'move':'guard'); }
    if(I.k==='ram') return mv?'move':'guard'; return 'board'; }
  if(I.k==='close') return 'shoot'; if(I.k==='shoot') return B.mom>1?'shoot':'shoot'; return 'shoot'; }
function rand(B){const o=C.battleOpts().filter(o=>o.ok&&o.id!=='flee');return o[Math.floor(Math.random()*o.length)].id;}
const specs=[['해적',{kind:'pirate',name:'해적',g:'plain',hp:42,atk:10}],['궁수',{kind:'pirate',name:'궁',g:'archer',hp:42,atk:10}],['흑기',{kind:'black',name:'흑기',g:'boarder',hp:70,atk:12}],['노예선',{kind:'slaver',name:'노',g:'archer',hp:55,atk:10}],
 ...C.BOSSES.map(b=>[b.name,{kind:'boss',boss:b.id,name:b.name,g:b.g,hp:b.hp,atk:b.atk}])];
for(const tier of [0]) for(const cap of ['ara']){ console.log(`\n== tier ${tier} ${cap}`);
 for(const [nm,sp] of specs){ for(const [pn,pol] of [['smart',smart],['random',rand]]){ let w=0,loss=0,turns=0,N=150;
  for(let i=0;i<N;i++){const S=C.newGame(cap);S.tier=tier;S.hullMax=S.hull=C.SHIPS[tier].hull;S.mode='sail';S.voyage={from:'cheonghae',t0:0};S.x=500;S.y=1000;
   C.makeBattle(sp);let g=0;while(!S.battle.over&&g++<40)C.battleAct(pol(S.battle));if(S.battle.over==='win')w++;loss+=C.SHIPS[tier].hull-Math.max(0,S.hull);turns+=S.battle.turn;}
  process.stdout.write(`${nm.padEnd(8)} ${pn.padEnd(6)} 승 ${(w/N*100).toFixed(0).padStart(3)}% 피해 ${(loss/N).toFixed(0).padStart(3)} 턴 ${(turns/N).toFixed(1)}   ${pn==='random'?'\n':''}`);}}}
