/* =====================================================================
   chrono.js — chrono de classe (téléphone ou iPad du prof + enceinte) : bips, 3-2-1, voix en français.
   Repris du carnet numérique v12.
   v3.14 (chantier 12) : même chrono, fiabilisé.
   - Signaux planifiés dans l'horloge audio (Web Audio) : 3-2-1 et bip de départ / d'arrêt / de fin
     tombent à l'instant exact (et plus à ±100 ms du tic d'affichage).
   - Chaque signal a une clé « n° de phase : signal » mémorisée (et sauvegardée) : émis une seule fois par
     cycle, même après pause, reprise, retour au premier plan ou rechargement.
   - Pause : les signaux pas encore joués sont annulés, puis replanifiés à la reprise ; ceux déjà joués ne
     sont jamais rejoués.
   - Temps : fin de chaque phase fixée à l'heure réelle (aucune dérive en arrière-plan) ; au retour, les
     phases dépassées sont rattrapées sans bruit et aucun signal en retard n'est joué.
   - 1’30 : annonce « 45 secondes » ; bouton « Remise à zéro » (confirmé si le chrono tourne).
   v3.16 : récupération en vert (course en rouge, quel que soit le thème de couleurs) ; répétitions restantes affichées.
   ===================================================================== */
'use strict';
/* ---------- chrono de classe (téléphone du prof + enceinte) ---------- */
const CPRE=[['36"/36" × 8',36,36,8,0],['36"/36" × 6',36,36,6,0],['Test 36"/24" × 10',36,24,10,0],['1’12/1’12 × 4',72,72,4,0],['3’ (mi-course 1’30)',180,0,1,1],['1’30 (mi-course 45")',90,0,1,1],['2 × 6’ (récup 3’)',360,180,2,0],['Récup active 3’',180,0,1,0]];
let CH={w:36,r:36,n:8,mid:0,voice:true,run:null};
function chronoView(){const r=CH.run;
  return `<section class="card chrono"><h2>⏱ Chrono de classe</h2><p class="muted small">Pour ton téléphone branché sur une enceinte : bips à chaque départ et arrêt, 3-2-1 avant chaque changement, voix en français.</p>
  ${r?`<div class="chbig ${r.ph}"><span id="chph">${r.ph==='run'?'Course':r.ph==='rest'?'Récupération':r.ph==='pre'?'Prêts…':'Terminé'}</span><b id="cht">${fT(Math.ceil(r.left))}</b>${chRep(r)}</div>
     <div class="row wrap center"><button class="btn big" data-act="chpause">${r.paused?'▶ Reprendre':'Ⅱ Pause'}</button><button class="btn big ghost" data-act="chstop">↺ Remise à zéro</button></div>`
   :`<div class="seg">${CPRE.map((p,i)=>`<button class="chip ${CH.w===p[1]&&CH.r===p[2]&&CH.n===p[3]&&CH.mid===p[4]?'on':''}" data-chp="${i}">${p[0]}</button>`).join('')}</div>
     <div class="row wrap"><label>Course (s) <input class="in w" id="chw" inputmode="numeric" value="${CH.w}"></label><label>Récupération (s) <input class="in w" id="chr" inputmode="numeric" value="${CH.r}"></label><label>Répétitions <input class="in w" id="chn" inputmode="numeric" value="${CH.n}"></label></div>
     <label class="tog"><input type="checkbox" id="chmid" ${CH.mid?'checked':''}> Annoncer la mi-course</label><label class="tog"><input type="checkbox" id="chvoice" ${CH.voice?'checked':''}> Voix (« Partez », « Stop », « Mi-course », « 45 secondes » au 1’30)</label>
     <p class="small">Total : <b>${fT(CH.n*CH.w+(CH.n-1)*CH.r)}</b></p><button class="btn pri huge" data-act="chgo">▶ Lancer (départ dans 5 s)</button>`}</section>`}
/* v3.16 : nombre de répétitions restantes, bien visible (rien pour un effort unique : 1’30, 3’…) */
function chReste(r){return r&&r.ph!=='done'?CH.n-r.i:-1}   /* en course : après celle-ci ; en récupération : à faire */
function chRep(r){if(r.ph==='done'||CH.n<2)return '';const n=chReste(r);
  const txt=r.ph==='pre'?CH.n+' répétitions à faire':r.ph==='run'?(n===0?'Dernière répétition !':'Encore <em>'+n+'</em> après celle-ci'):(n===1?'Encore <em>1</em> répétition':'Encore <em>'+n+'</em> répétitions');
  return `<span id="chrep">${r.ph==='pre'?'':'Répétition '+r.i+' / '+CH.n}</span><span class="chreste">${txt}</span>`}
/* ---------- signaux planifiés (v3.14) ---------- */
function acOk(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}return AC}
let PLAN=[];   /* signaux planifiés pas encore joués : {k (clé), t (heure prévue, ms), o (oscillateur)} */
function planSon(k,t,f,d){const r=CH.run;if(!r||r.paused||(r.sons=r.sons||{})[k]||PLAN.some(x=>x.k===k))return;
  const dt=(t-Date.now())/1000;if(dt<-.25){r.sons[k]=1;return}   /* trop tard : on ne joue jamais un signal en retard */
  const a=acOk();if(!a)return;
  try{const o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.value=.25;o.connect(g);g.connect(a.destination);const w=a.currentTime+Math.max(0,dt);o.start(w);o.stop(w+d/1000);PLAN.push({k,t,o})}catch(e){}}
function planAnnuler(){const n=Date.now();PLAN.forEach(x=>{if(x.t>n)try{x.o.stop(0)}catch(e){}});PLAN=[]}   /* un oscillateur arrêté avant son départ ne sonne pas */
function planMarquer(){const r=CH.run;if(!r)return;const n=Date.now();let m=false;r.sons=r.sons||{};PLAN=PLAN.filter(x=>{if(x.t<=n){r.sons[x.k]=1;m=true;return false}return true});if(m)chSave()}
/* signal de fin de la phase en cours : départ (avant une course), arrêt (avant une récupération), fin (dernière course) */
function sonFin(r){if(r.ph==='pre'||r.ph==='rest')return [1000,600];if(r.i>=CH.n)return [2000,900];return [1600,450]}
function planPhase(){const r=CH.run,k=r.k||0;[3,2,1].forEach(x=>planSon(k+':'+x,r.end-x*1000,880,120));const [f,d]=sonFin(r);planSon(k+':fin',r.end,f,d)}
function voixMi(){return CH.w===90?'45 secondes':'Mi-course'}
function say(t){if(!CH.voice||!window.speechSynthesis)return;try{const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';u.rate=1.05;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
/* le chrono survit au rechargement et à la mise en veille : l'état (heures de fin réelles) est gardé sur l'appareil */
const CH_CLE='eps-df-chrono';
function chSave(){try{if(CH.run&&CH.run.ph!=='done')localStorage.setItem(CH_CLE,JSON.stringify({w:CH.w,r:CH.r,n:CH.n,mid:CH.mid,voice:CH.voice,run:CH.run}));else localStorage.removeItem(CH_CLE)}catch(e){}}
function chLock(){try{if(navigator.wakeLock&&document.visibilityState==='visible')navigator.wakeLock.request('screen').then(l=>CH.lock=l).catch(()=>{})}catch(e){}}
function chStart(){planAnnuler();acOk();CH.run={ph:'pre',i:0,k:0,left:5,end:Date.now()+5000,paused:false,sons:{}};say('Départ dans 5 secondes');chLock();
  clearInterval(CH.h);CH.h=setInterval(chTick,100);chSave();render()}
function chRestore(){let o=null;try{o=JSON.parse(localStorage.getItem(CH_CLE)||'null')}catch(e){}if(!o||!o.run)return;
  Object.assign(CH,{w:o.w,r:o.r,n:o.n,mid:o.mid,voice:o.voice,run:o.run});if(typeof chOuvrir==='function')chOuvrir();CH.quiet=true;chTick();CH.quiet=false;
  if(CH.run&&CH.run.ph!=='done'){clearInterval(CH.h);CH.h=setInterval(chTick,100);chLock()}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&CH.run&&CH.run.ph!=='done'){acOk();CH.quiet=true;chTick();CH.quiet=false;chLock()}});
/* chOuvrir (défini par l'appli) : rouvre l'écran Chrono quand un chrono reprend après rechargement */
setTimeout(()=>{try{chRestore();if(CH.run)render()}catch(e){}},0);
function chNext(){const r=CH.run;const T0=r.end;const Q=CH.quiet;const sy=t=>{if(!Q)say(t)};r.sons=r.sons||{};
  const kf=(r.k||0)+':fin';if(!r.sons[kf]&&!PLAN.some(x=>x.k===kf)){if(!Q&&Date.now()-T0<250){const [f,d]=sonFin(r);beep(f,d)}r.sons[kf]=1}
  r.k=(r.k||0)+1;if(r.ph==='pre'||r.ph==='rest'){r.i++;r.ph='run';r.left=CH.w;r.end=T0+CH.w*1000;r.midDone=false;sy('Partez')}
  else if(r.ph==='run'){if(r.i>=CH.n||!CH.r){if(r.i>=CH.n){r.ph='done';r.left=0;sy('Stop. Terminé');clearInterval(CH.h);try{CH.lock&&CH.lock.release()}catch(e){}chSave();render();return}}
    r.ph='rest';r.left=CH.r;r.end=T0+CH.r*1000;   /* v4.3 : fin d'effort aiguë (1600 Hz) */sy('Stop')}
  chSave();if(!Q)render()}
function chTick(){const r=CH.run;if(!r||r.paused||r.ph==='done')return;planMarquer();r.left=(r.end-Date.now())/1000;
  if(r.left<-1.5){planAnnuler();let g=0;const q=CH.quiet;CH.quiet=true;while(CH.run&&CH.run.ph!=='done'&&(CH.run.end-Date.now())/1000<=0&&g++<500)chNext();CH.quiet=q;
    if(CH.run&&CH.run.ph==='run'&&CH.mid&&(CH.run.end-Date.now())/1000<=CH.w/2)CH.run.midDone=true;render();return}   /* retour d'arrière-plan : rattrapage sans bruit */
  if(r.left<=3.6&&!CH.quiet)planPhase();else if(r.left<=3.6){[3,2,1].forEach(x=>{if(r.end-x*1000<Date.now())r.sons[(r.k||0)+':'+x]=1})}
  if(CH.mid&&r.ph==='run'&&!r.midDone){const tm=r.end-CH.w/2*1000;if(!CH.quiet&&tm-Date.now()<=600)planSon((r.k||0)+':mi',tm,1200,250);
    if(r.left<=CH.w/2){r.midDone=true;chSave();if(!CH.quiet&&Date.now()-tm<1500)say(voixMi())}}
  if(r.left<=0)return chNext();const t=$('#cht');if(t)t.textContent=fT(Math.ceil(r.left))}
/* pause / reprise (v3.14) : le temps restant est pris à l'heure réelle ; les signaux pas encore joués sont annulés puis replanifiés */
function chPause(){const r=CH.run;if(!r||r.ph==='done')return;
  if(r.paused){r.end=Date.now()+r.left*1000;r.paused=false;acOk();chLock()}
  else{planMarquer();r.left=Math.max(0,(r.end-Date.now())/1000);r.paused=true;planAnnuler();try{speechSynthesis.cancel()}catch(e){}}
  chSave()}
function chStop(){planAnnuler();clearInterval(CH.h);CH.run=null;chSave();try{CH.lock&&CH.lock.release()}catch(e){}try{speechSynthesis.cancel()}catch(e){}}
