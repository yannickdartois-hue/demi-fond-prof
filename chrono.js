/* =====================================================================
   chrono.js — chrono de classe (téléphone ou iPad du prof + enceinte) : bips, 3-2-1, voix en français.
   Repris du carnet numérique v12.
   ===================================================================== */
'use strict';
/* ---------- chrono de classe (téléphone du prof + enceinte) ---------- */
const CPRE=[['36"/36" × 8',36,36,8,0],['36"/36" × 6',36,36,6,0],['Test 36"/24" × 10',36,24,10,0],['1’12/1’12 × 4',72,72,4,0],['3’ (mi-course 1’30)',180,0,1,1],['1’30 (mi-course 45")',90,0,1,1],['2 × 6’ (récup 3’)',360,180,2,0],['Récup active 3’',180,0,1,0]];
let CH={w:36,r:36,n:8,mid:0,voice:true,run:null};
function chronoView(){const r=CH.run;
  return `<section class="card chrono"><h2>⏱ Chrono de classe</h2><p class="muted small">Pour ton téléphone branché sur une enceinte : bips à chaque départ et arrêt, 3-2-1 avant chaque changement, voix en français.</p>
  ${r?`<div class="chbig ${r.ph}"><span id="chph">${r.ph==='run'?'Course':r.ph==='rest'?'Récupération':r.ph==='pre'?'Prêts…':'Terminé'}</span><b id="cht">${fT(Math.ceil(r.left))}</b><span id="chrep">${r.ph==='done'?'':'Répétition '+r.i+' / '+CH.n}</span></div>
     <div class="row wrap center"><button class="btn big" data-act="chpause">${r.paused?'▶ Reprendre':'Ⅱ Pause'}</button><button class="btn big ghost" data-act="chstop">■ Arrêter</button></div>`
   :`<div class="seg">${CPRE.map((p,i)=>`<button class="chip ${CH.w===p[1]&&CH.r===p[2]&&CH.n===p[3]&&CH.mid===p[4]?'on':''}" data-chp="${i}">${p[0]}</button>`).join('')}</div>
     <div class="row wrap"><label>Course (s) <input class="in w" id="chw" inputmode="numeric" value="${CH.w}"></label><label>Récupération (s) <input class="in w" id="chr" inputmode="numeric" value="${CH.r}"></label><label>Répétitions <input class="in w" id="chn" inputmode="numeric" value="${CH.n}"></label></div>
     <label class="tog"><input type="checkbox" id="chmid" ${CH.mid?'checked':''}> Annoncer la mi-course</label><label class="tog"><input type="checkbox" id="chvoice" ${CH.voice?'checked':''}> Voix (« Partez », « Stop », « Mi-course »)</label>
     <p class="small">Total : <b>${fT(CH.n*CH.w+(CH.n-1)*CH.r)}</b></p><button class="btn pri huge" data-act="chgo">▶ Lancer (départ dans 5 s)</button>`}</section>`}
function say(t){if(!CH.voice||!window.speechSynthesis)return;try{const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';u.rate=1.05;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
/* le chrono survit au rechargement et à la mise en veille : l'état (heures de fin réelles) est gardé sur l'appareil */
const CH_CLE='eps-df-chrono';
function chSave(){try{if(CH.run&&CH.run.ph!=='done')localStorage.setItem(CH_CLE,JSON.stringify({w:CH.w,r:CH.r,n:CH.n,mid:CH.mid,voice:CH.voice,run:CH.run}));else localStorage.removeItem(CH_CLE)}catch(e){}}
function chLock(){try{if(navigator.wakeLock&&document.visibilityState==='visible')navigator.wakeLock.request('screen').then(l=>CH.lock=l).catch(()=>{})}catch(e){}}
function chStart(){CH.run={ph:'pre',i:0,left:5,end:Date.now()+5000,paused:false,beeped:{}};say('Départ dans 5 secondes');chLock();
  clearInterval(CH.h);CH.h=setInterval(chTick,100);chSave();render()}
function chRestore(){let o=null;try{o=JSON.parse(localStorage.getItem(CH_CLE)||'null')}catch(e){}if(!o||!o.run)return;
  Object.assign(CH,{w:o.w,r:o.r,n:o.n,mid:o.mid,voice:o.voice,run:o.run});if(typeof chOuvrir==='function')chOuvrir();CH.quiet=true;chTick();CH.quiet=false;
  if(CH.run&&CH.run.ph!=='done'){clearInterval(CH.h);CH.h=setInterval(chTick,100);chLock()}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&CH.run&&CH.run.ph!=='done'){CH.quiet=true;chTick();CH.quiet=false;chLock()}});
/* chOuvrir (défini par l'appli) : rouvre l'écran Chrono quand un chrono reprend après rechargement */
setTimeout(()=>{try{chRestore();if(CH.run)render()}catch(e){}},0);
function chNext(){const r=CH.run;const T0=r.end;const Q=CH.quiet;const bp=(f,d)=>{if(!Q)beep(f,d)},sy=t=>{if(!Q)say(t)};if(r.ph==='pre'||r.ph==='rest'){r.i++;r.ph='run';r.left=CH.w;r.end=T0+CH.w*1000;r.midDone=false;bp(1000,600);sy('Partez')}
  else if(r.ph==='run'){if(r.i>=CH.n||!CH.r){if(r.i>=CH.n){r.ph='done';r.left=0;bp(600,900);sy('Stop. Terminé');clearInterval(CH.h);try{CH.lock&&CH.lock.release()}catch(e){}chSave();render();return}}
    r.ph='rest';r.left=CH.r;r.end=T0+CH.r*1000;bp(600,700);sy('Stop')}
  r.beeped={};chSave();if(!Q)render()}
function chTick(){const r=CH.run;if(!r||r.paused||r.ph==='done')return;r.left=(r.end-Date.now())/1000;
  if(r.left<-1.5){let g=0;const q=CH.quiet;CH.quiet=true;while(CH.run&&CH.run.ph!=='done'&&(CH.run.end-Date.now())/1000<=0&&g++<500)chNext();CH.quiet=q;render();return}
  const s=Math.ceil(r.left);if(s<=3&&s>=1&&!r.beeped[s]&&!CH.quiet){r.beeped[s]=1;beep(880,120)}
  if(CH.mid&&r.ph==='run'&&!r.midDone&&r.left<=CH.w/2){r.midDone=true;if(!CH.quiet){beep(1200,250);say('Mi-course')}}
  if(r.left<=0)return chNext();const t=$('#cht');if(t)t.textContent=fT(Math.ceil(r.left))}
function chStop(){clearInterval(CH.h);CH.run=null;chSave();try{CH.lock&&CH.lock.release()}catch(e){}try{speechSynthesis.cancel()}catch(e){}}
