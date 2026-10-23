/* =====================================================================
   prof-demo.js — mode démo de l'outil prof : deux classes fictives déjà remplies (Seconde et Terminale),
   en mémoire seulement : les vraies données de l'appareil ne sont ni lues ni modifiées.
   Ouverture : …/?demo  (lien à donner aux collègues).
   ===================================================================== */
'use strict';
function demoRnd(seed){let s=seed;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}}
function demoSplit(d){const t=Math.floor(d/200);return [String(t),String(Math.round((d-t*200)/10)*10)]}
function demoSeance(sid,v,rnd,sx){const d={},J=(a)=>a[Math.floor(rnd()*a.length)],E=(n)=>Math.round((rnd()*2-1)*n);
  const pile=n=>Array.from({length:n},()=>rnd()<.62?'P':(rnd()<.5?'T':'L'));
  const c3=(pct)=>{const vise=Math.round(dist(180,v)/10)*10,real=Math.round(dist(180,v*pct)/10)*10,half=Math.round((real/2+E(15))/10)*10;const [mt,mp]=demoSplit(half),[ft,fp]=demoSplit(real);
    const laps=[];let t=0;for(let k=0;k<Math.floor(real/200);k++){const l=Math.round(200*3.6/(v*pct)+E(3));laps.push(l);t+=l}return {v:String(vise),mt,mp,ft,fp,lt:laps}};
  const p130=(ref)=>{const proj=Math.round((ref||dist(90,v*1.04))/5)*5;const e=E(14);return {proj:String(proj),sd:e<0?'av':'ap',mg:String(Math.abs(e)),ec:e}};
  const ser=rows=>rows.map(r=>({tr:fT(tSec(r[0],v*r[1]/100)+E(3))}));
  const s=SBY[sid];
  s.blocks.forEach(b=>{const [ty,a1,a2,a3]=bk(b);
    if(ty==='al4')d.al=[5,8,10,Math.round(v*2)/2].map((x,i)=>({an:String(x),re:String(i===3?x:x+J([0,0,1,-1]))}));
    if(ty==='ct')d.ct=[{c:'12',r:'12'},{c:'13',r:String(12+J([0,1]))}];
    if(ty==='grp')d.grp=v<10?'G1':v<12?'G2':v<14?'G3':'G4';
    if(ty==='i36'||ty==='i36m')d.i36=pile(ty==='i36'?a2:6);
    if(ty==='ra')d.ra=String(Math.round(v*0.7*2)/2);
    if(ty==='m130'){const [t,p]=demoSplit(Math.round(dist(90,v*1.05)/10)*10);d.m130={t,p}}
    if(ty==='c3')d[a1]=c3(0.97+rnd()*0.06);
    if(ty==='p130')d[a1]=p130(null);
    if(ty==='ser')d[a1]=ser(a3);
    if(ty==='ra2')d.ra2=String(Math.round(dist(a2,v*a1/100)/10)*10);
    if(ty==='i112')d.c112=Array.from({length:a2},()=>String(Math.round((v*a1/100+E(1))*2)/2));
    if(ty==='rel5'){const vis=1380+Math.round(rnd()*240);d.rlv=fT(vis);d.rlt=fT(vis+E(40))}
    if(ty==='c500'){const tp=Math.round(tSec(500,v*(s.eval?1.08:1.02)));const t=tp+E(4);d[a1]={tp:fT(tp),ps:fT(Math.round(t/2-1+E(2))),t:fT(t)}}
    if(ty==='tours')d.tr=[8,10,12,14,15,16].map((x,i)=>Object.assign({t:fT(tSec(200,x)+E(3))},i>3?{v:String(x)}:{}));
    if(ty==='t3624')d.ts=Array.from({length:10},(_,i)=>String(Math.round((v+E(1)-(i>7?0.5:0))*2)/2));
    if(ty==='rt')d.rt=Array.from({length:10},()=>String(Math.round((v+0.5+E(1))*2)/2));
    if(ty==='warm'||ty==='warmT')d.wc=['f','tf','mg','ch','ge','ga','sq','sk','ac','al'];
    if(ty==='pf'||ty==='pfT')d.pf=[ty==='pf'?J(['dep','zone','chute']):J(['d1','d2','z'])];
    if(ty==='situe')d.situe={a2:String(J([2,3,3,4])),a3:String(J([2,3,3]))};
    if(ty==='rep')d.rep=J(['4/4','6/2','4/4']);
  });
  d.bl={cr:['1',rnd()<.6?'1':'','1'],reu:J(['Départ bien géré','Régulier sur les tours','Plot pile au sifflet','Bonne relance à la fin']),
    con:J(['Pars moins vite sur le 1er tour','Regarde ton plot cible','Garde tes bras actifs à la fin','Relance dans la dernière ligne droite']),
    nx:J(['Je pars à l’allure de la fin','Je vise 10 m de plus','Je respire plus calmement']),rpe:String(J([5,6,6,7,7,8])),du:'60',aide:rnd()<.8?'1':'0',role:'coach'};
  const tg=pronoTarget(s);if(tg){const r=pronoReal(tg,d);if(r)d.bl.pr=tg[0]==='c500'?fT(r+E(4)):String(Math.round((r+E(20))/5)*5)}
  return d}
function ouvrirDemoProf(){
  DEMO=true;P=vide();
  const mk=(classe,cy,groupes,nb,autres,seed)=>{const rnd=demoRnd(seed);const L=sessOf(cy);
    P.classesL[classe]={eleves:groupes.flat().map(x=>x[0]).concat(autres).sort((a,b)=>nomDe(a).localeCompare(nomDe(b),'fr')),lien:'',cy};
    autres.forEach(n=>eleveDe(classe,n,cy));
    groupes.forEach((g,gi)=>{L.slice(0,nb).forEach((s,si)=>{
      if(gi===groupes.length-1&&si===nb-1)return;                       /* un groupe a oublié d'envoyer la dernière séance */
      const date=new Date(Date.now()-(nb-si)*7*864e5).toISOString().slice(0,10);
      g.forEach(([full,sx,v],ri)=>{const d=(gi===1&&ri===2&&si===2)?{st:'abs'}:demoSeance(s.id,v,rnd,sx);
        let co=g[(ri+1)%g.length][0];if(gi===1&&si===2&&ri===1){co='Léa MARTIN';d.cx={n:'Léa M.',why:'abs'}}
        ajouterSeance({classe,cy,eleve:full,sexe:sx,seance:s.id,date,ts:Math.round(Date.parse(date)/1000),src:si%2?'qr':'fichier',groupe:g.map(x=>x[0]),coach:d.st?'':co,coachRemplacant:!!d.cx,d})})})});
  };
  mk('2nde Démo','S',[[['Léa MARTIN','F',11.5],['Hugo BERNARD','G',13.5]],[['Tom DURAND','G',12.5],['Zoé LEROY','F',10.5],['Yanis ROBERT','G',14.5]],[['Chloé MOREAU','F',12],['Max GIRARD','G',15]],[['Inès PETIT','F',10],['Adam FAURE','G',12]],[['Nina ROUX','F',9.5],['Théo SIMON','G',13]]],6,['Emma LAMBERT'],20261022);
  mk('Tle Démo','T',[[['Manon GARCIA','F',12],['Lucas ROUX','G',15]],[['Sarah FAURE','F',11],['Nathan BLANC','G',14]],[['Jade MERCIER','F',13],['Enzo LEFEBVRE','G',13.5]],[['Lina DUBOIS','F',10.5],['Noah MOREL','G',16]]],7,[],20261023);
  /* quelques observations du prof et notes déjà saisies */
  Object.keys(P.eleves).forEach((k,i)=>{P.stars[k]={s3:{a2:i%2===0},s4:{a3:i%3===0},t3:{a2:i%2===1},t5:{a3:i%2===0}};if(i%3===0)Object.assign(P.eleves[k],{afl2:'3',afl3:'3,5'})});
  /* contrôles du prof : une course mesurée par le prof en S4 / T5 (deux élèves y ont un coach peu fiable) */
  P.ctrl={};Object.entries(P.eleves).forEach(([k,e],i)=>{const sid=e.cy==='T'?'t5':'s4';const d=e.seances[sid];const B=pronoTarget(SBY[sid]);const r=d&&!d.st&&B?pronoReal(B,d):null;
    if(r)P.ctrl[k]={[sid]:String(Math.round(r*(i%5===2?1.12:1+((i%3)-1)*0.02)))}});
  P.vue='eleves';P.classe='2nde Démo';P.saveAt=Date.now();rendre();
}
function bandeauDemo(){return `<div class="demo-bandeau"><span>👀 <b>Mode démo</b><i> · classes fictives, rien n’est enregistré · vos vraies données ne sont pas touchées</i></span><a class="btn sm" href="../demi-fond-eleves/?demo">Voir l’appli élève</a><button class="btn sm" data-act="demoQuitter">Quitter la démo</button></div>`}
if(/[?&]demo\b/.test(location.search))ouvrirDemoProf();else{classeParDefaut();rendre()}
