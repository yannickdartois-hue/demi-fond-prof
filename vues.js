/* =====================================================================
   vues.js — Demi-fond · contenu du carnet (séances pas à pas, calculatrice, compteur en direct, cibles, progression).
   Repris du carnet numérique v12 : la séance se remplit pour le coureur choisi (V.ri) du groupe ouvert.
   ===================================================================== */
'use strict';
/* ---------- accès aux données ---------- */
const curBin=()=>DB.binomes.find(b=>b.id===V.bin);
const cyOf=b=>(b&&b.cy)||'S';
const curSessOf=b=>sessOf(cyOf(b));
const curSess=()=>sessOf(cyOf(curBin()));
function sd(run,sid){run.seances=run.seances||{};return run.seances[sid]=run.seances[sid]||{}}
const curD=()=>sd(curBin().runners[V.ri||0],V.sid);
function setPath(o,path,val){const ks=path.split('.');let x=o;for(let i=0;i<ks.length-1;i++){const k=ks[i];if(x[k]==null)x[k]=/^\d+$/.test(ks[i+1])?[]:{};x=x[k]}x[ks[ks.length-1]]=val}
function getPath(o,path){return path.split('.').reduce((x,k)=>x==null?undefined:x[k],o)}
const hasData=d=>!!d&&Object.keys(d).some(k=>k!=='_v');
function saveS(){const b=curBin();if(b&&V.sid){b.mod=b.mod||{};b.mod[V.sid]=Date.now();const r=b.runners[V.ri||0];if(r&&r.imp)delete r.imp[V.sid];b.dates=b.dates||{};if(!b.dates[V.sid])b.dates[V.sid]=today()}save()}
/* VMA effective d'une séance (VMA du jour modifiée, sinon mesurée) et projets tenus calculés avec elle */
function effV(run,sid){const d=run.seances&&run.seances[sid];return (d&&num(d.vj))||vmaOf(run,sid)}
function ctx(run,sid,d){return Object.assign({},d,{_v:effV(run,sid)||num(d&&d._v),_ref:lastReal(run,sid)})}
function tenR(run,sid){const d=run.seances&&run.seances[sid];if(!d)return [0,0];return tenus(sid,ctx(run,sid,d))}
function sessState(b,sid){const has=b.runners.some(r=>hasData(r.seances&&r.seances[sid])&&!(r.imp&&r.imp[sid]));const sent=b.sent&&b.sent[sid],mod=b.mod&&b.mod[sid];
  if(sent&&mod&&mod>sent+1500)return 'resend';if(sent)return 'sent';return has?'wip':''}

/* ---------- pictogrammes (remplacent les émojis, même trait que le carnet papier) ---------- */
const SV=(p)=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICONS={'🎯':SV('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>'),
 '🧮':SV('<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>'),
 '💡':SV('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'),
 '⏱':SV('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5M19 6l1.5-1.5"/>'),
 '✎':SV('<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>'),
 '📝':SV('<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>'),
 '📵':SV('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14l6 6M20 14l-6 6"/>'),
 '🚫':SV('<circle cx="12" cy="12" r="9"/><path d="M6 6l12 12"/>')};
function icons(html){return html.split(/(<textarea[\s\S]*?<\/textarea>)/).map((p,i)=>i%2?p:p.replace(/(🎯|🧮|💡|⏱\uFE0F?|✎|📝|📵|🚫)([^<]*)/g,(m,e,rest)=>'<span class="il">'+(ICONS[e.replace(/\uFE0F/g,'')]||e)+rest+'</span>')).join('')}
/* ---------- consignes repliables (bouton ⓘ) ---------- */
const WARM=['<b>Les 3 parties de la fiche GAREEPS</b> (15 min) :','1 · Cardio 5-6 min : footing 60-70 % puis talons-fesses, montées de genoux, pas chassés.','2 · Articulaire et renforcement 6-7 min : de bas en haut, puis 4 exercices au choix.','3 · Gammes et accélérations 5-6 min : la dernière accélération à l’allure de la course.','Écris ce que <b>tu</b> vas faire, avec les durées.'];
const HELP={
 al4:()=>['<b>Toute la classe en même temps, 3 min par allure.</b> Les grands plots jaunes sont tous les 50 m : le nombre de grands plots franchis en 3 min = ta vitesse en km/h.',
  '<b>Avant chaque allure</b>, annonce à ton coach combien de grands plots tu vas franchir. Le coach compte et note.',
  '<b>Les 4 allures</b> : marche rapide · footing (tu parles en phrases) · allure rythmée (tu parles par mots) · 3’ rapide (le plus vite possible en tenant les 3 min, sans marcher).',
  '<b>Points</b> : annonce juste = 3 pts, à 1 plot près = 1 pt. Les grands plots de ton 3’ rapide donnent ta VMA de travail.'],
 ct:()=>['<b>Le binôme est une équipe.</b> 2 manches de 6 min, 3 min de pause entre les deux. Chacun court 1 tour (200 m) à son tour et tape la main de son partenaire dans la zone de relais.',
  '<b>Avant chaque manche</b>, signez un contrat : combien de tours le binôme va faire en 6 min. La 2e manche se joue en connaissant le résultat de la 1re.',
  '<b>Points</b> : contrat tenu = 5 pts, à 1 tour près = 2 pts.'],
 grp:()=>['Ton groupe dépend de ta VMA de travail : G1 moins de 10 km/h · G2 10 à 11,5 · G3 12 à 13,5 · G4 14 et plus. Ton binôme doit être dans un autre groupe que toi.'],
 i36:(b)=>{const p=b[1];return [`<b>Plots plats tous les 10 m depuis la ligne.</b> Ton plot cible est écrit au-dessus (${p===100?'= ta VMA':p+' % de ta VMA'} : VMA 12 → ${p===100?'12e plot, 120 m':fP(12*p/100)+'e plot'}).`,
  '<b>36" de course, 36" de marche</b>, en aller-retour : toute la vague court dans le même sens.',
  '<b>Le coach</b> se place à ton plot cible et juge chaque aller au sifflet : <b>T</b> = trop tôt (déjà passé), <b>P</b> = pile au plot, <b>L</b> = trop tard (pas encore arrivé).',
  '<b>Conseil</b> : les 10 premiers mètres décident de tout, ne sprinte pas. Tôt deux fois → ralentis. Tard deux fois → accélère.']},
 ra:()=>['<b>3 min à 70 % de ta VMA</b> : tu cours tranquillement, tu dois pouvoir parler. Compte les grands plots jaunes franchis (cible écrite au-dessus), puis 1 min de marche.'],
 m130:()=>['<b>Départ de la ligne, 1’30 de course</b> à l’allure que tu pourrais tenir encore une fois.',
  '<b>Le coach</b> crie « mi-course » à 45", compte tes tours et relève le plot plat où tu es au coup de sifflet. Le bouton ⏱ « Compter en direct » l’aide.',
  '<b>Distance</b> = tours × 200 m + plot d’arrêt (en mètres depuis la ligne). Elle devient ton premier projet pour la S3.'],
 c3:(b,s)=>[`<b>Départ de la ligne, tous ensemble, 3 min de course.</b>${s.eval?' C’est la course C1 de l’épreuve.':''}`,
  '<b>Avant</b> : écris ta distance visée (à 100 % de ta VMA, la proposition est en gris dans la case).',
  '<b>Le coach</b> compte tes tours, note où tu es à 1’30 (mi-course : tours + plot) puis au sifflet de 3’ (tours + plot d’arrêt). Avec ⏱ « Compter en direct », il touche TOUR à chaque passage et la tablette bipe à 1’30 et à 3’.',
  '<b>Régulier</b> si la 2e moitié est au moins aussi longue que la 1re, à 10 m près. <b>Projet tenu</b> si ta distance est à 10 m de ta distance visée.',
  '<b>Conseil</b> : pars à l’allure de la fin, pas plus vite.'],
 p130:(b,s)=>{const T=s.id[0]==='t';return [`<b>Tu choisis ta distance projet</b> et tu places ton plot à cette distance <b>avant</b> la ligne d’arrivée (ex. 340 m → 140 m avant la ligne, puis un tour complet).${s.eval?(T?' C’est la course C3 de l’épreuve.':' C’est la course C2 de l’épreuve.'):''}`,
  '<b>Tous partent au même sifflet</b>, chacun de son plot, et visent la ligne à 1’30.',
  '<b>Le coach</b> se place aux zones autour de la ligne et note si tu étais avant ou après la ligne au sifflet, et à combien de mètres.',
  T?'<b>Zones (Terminale)</b> : ± 5 m = zone 4 (4 pts) · 5 à 15 m après = zone 3 (3 pts) · 5 à 15 m avant = zone 2 (2 pts) · au-delà : 1 pt après, 0,5 pt avant. Projet tenu en zone 3 ou 4.'
   :'<b>Zones</b> : ± 5 m = zone 4 (la meilleure) · 5 à 15 m après = zone 3 · 5 à 15 m avant = zone 2 · au-delà = zone 1. Projet tenu en zone 3 ou 4.',
  '<b>Conseil</b> : à 45" tu dois avoir fait la moitié de ton projet.']},
 ec2:()=>['Compare tes deux 3’ : moins de 20 m d’écart = tu sais reproduire ton allure.'],
 txt:()=>['Écris en une phrase pourquoi tu as changé (ou pas) ton projet : fatigue, sensations, résultat du 3’…'],
 warm:()=>WARM,
 warmT:()=>WARM.concat(['<b>Récupération entre les courses</b> (10 min) : quelques minutes actives, puis passive ; je bois, je me couvre, je relis mon projet.']),
 afl1:()=>['Calcul automatique : 3’ /4 + 1’30 /4 (barème selon fille ou garçon) + zone du 1’30 /3 + régularité du 3’ /1 = /12.'],
 afl1T:()=>['Calcul automatique avec le barème du lycée : chaque course est notée /8 (500 m au temps, 1’30 à la distance), la performance est la moyenne des 3 notes (/8), plus la zone du 1’30 /4 = /12.'],
 pf:()=>['Coche ce qui t’a coûté le plus de points : c’est ton atelier de la S7.'],
 pfT:()=>['Coche ce qui t’a fait perdre le plus : départ du 1er 500 m trop rapide, chute sur le 2e 500 m, ou 1’30 hors zone. C’est le thème de ta séance T8.'],
 vup:()=>['Les grands plots franchis pendant ton 3’ d’épreuve blanche donnent ta nouvelle VMA de travail. Tes cibles de S7 et S8 sont recalculées avec.'],
 situe:()=>['Lis chaque degré et choisis honnêtement celui qui te ressemble aujourd’hui. Le prof donne aussi son avis.','Ton total de projets tenus (page « Ma progression ») t’aide : ¼ → degré 1, ⅓ → 2, ⅔ → 3, ¾ → 4.'],
 at:()=>['<b>A · départ du 3’ trop rapide</b> : 2 × 1’30 à l’allure du 3’, 2 min entre les deux, mi-course annoncée.','<b>B · 1’30 hors zone</b> : 3 × 45" à l’allure du projet (la moitié du projet en 45"), 1’30 entre.','<b>C · chute de vitesse</b> : 4 × 300 m à l’allure du 1’30, 3 min entre.','Le coach mesure et te dit l’écart après chaque répétition : réussi ou raté.'],
 pe:()=>['Fixe tes projets pour l’évaluation à partir de tes chiffres (3’ des S3 à S6, zones du 1’30). Explique ton choix en une phrase.'],
 rel5:()=>['<b>Relais 5 km (25 tours) à deux.</b> Chacun court la distance prévue puis passe le relais dans la zone.','Écrivez votre <b>temps visé</b> avant de partir (repères : tableau des vitesses). Projet tenu si le temps du binôme est à 30 s du temps visé.','<b>Conseil</b> : des relais courts (200 à 400 m) permettent de courir plus vite.'],
 c500:(b,s)=>['<b>500 m = 2 tours et demi.</b> Écris ton temps visé : ton passage au 250 m doit en être la moitié.'+(s.eval?' Le 2e 500 m se court 10 min après le 1er.':''),'<b>Le coach</b> chronomètre ton passage au 250 m et ton arrivée (bouton ⏱ « Chronométrer en direct ») et t’annonce le passage.','Vitesse = 1 800 ÷ temps en secondes. <b>Projet tenu</b> si tu arrives à 2 s de ton temps visé.'],
 tours:()=>['<b>6 courses d’un tour (200 m)</b> à vitesse imposée : 8, 10, 12, 14 km/h puis 2 vitesses que tu choisis.','Le coach annonce et chronomètre chaque tour. <b>Tenu</b> si tu es à 2 s du temps au tour.','Temps au tour (s) = 720 ÷ vitesse.'],
 t3624:()=>['<b>Test 36"/24"</b> : plots plats tous les 10 m. 36" de course, 24" de récupération, 10 fois, à vitesse constante.','Le plot atteint en 36" = ta vitesse en km/h (plot n° 12 = 12 km/h). Le coach note le plot à chaque minute.','<b>VMA = somme des 10 plots ÷ 10.</b> Va au bout des 10 minutes.'],
 rt:()=>['<b>Re-test 36"/24"</b> en début de séance (même protocole qu’en T2).','Ta nouvelle VMA remplace celle de T2 pour calculer tes cibles de T6 à T9.'],
 ser:()=>['Chaque ligne : distance, % de VMA, récupération. Le <b>temps prévu</b> est calculé avec ta VMA (passage à mi-distance entre parenthèses).','L’un court, l’autre coache : il annonce le passage et chronomètre. <b>Tenu</b> à 2 s près du temps prévu.'],
 ra2:(b)=>[`<b>Récupération active ${fT(b[2])} à ${b[1]} % de ta VMA</b> : tu cours tranquillement, tu dois pouvoir parler. La distance à faire est écrite au-dessus.`],
 i36m:()=>['<b>36" de course, 36" de marche</b> : 3 répétitions à 110 % de ta VMA puis 3 à 120 %.','Le coach se place à ton plot cible et juge : <b>T</b> trop tôt, <b>P</b> pile, <b>L</b> trop tard.'],
 i112:(b)=>[`<b>1’12 de course à ${b[1]} %, 1’12 de récupération, ${b[2]} fois.</b> Coupelles tous les 20 m : en 1’12, 1 km/h = 1 coupelle.`,'Note la coupelle atteinte à chaque répétition. <b>Tenu</b> à 1 coupelle près.'],
 rep:()=>['Tu choisis la répartition des 8 points restants entre <b>AFL2</b> (s’entraîner : carnet, projets tenus, échauffement) et <b>AFL3</b> (coach ou juge-chronométreur).','6/2, 4/4 ou 2/6 : choisis selon ce que tu fais le mieux.'],
 mine:()=>['Construis ta séance contre ton point faible de T7. Exemples :','· <b>départ trop rapide</b> → 3 × 250 m à l’allure du C1, passage annoncé, 3’ de récup ;','· <b>chute sur le 2e 500</b> → 4 × 300 m à 110 %, récup 2’ ;','· <b>1’30 hors zone</b> → 3 × 45" à l’allure du projet (la moitié du projet), récup 1’30.','Donne distance ou durée, % de VMA, récupération et répétitions. La 🧮 calcule les temps.'],
 real8:()=>['Écris le temps prévu de chaque répétition (🧮 calculatrice) puis le temps réalisé. <b>Tenu</b> à 2 s près.'],
 pfin:()=>['Fixe tes projets pour l’épreuve : 100 m visé (prise d’allure 3 × 100 m), temps de C1 et C2, passage au 250 m, distance du 1’30. Pars de tes chiffres de T7.'],
 bilan:(b,s)=>['<b>Le coach a vu</b> : ton coach coche ce que tu as bien fait, puis écrit une réussite et un conseil. Des idées de conseils apparaissent selon tes résultats : touche-les pour les ajouter.','<b>Pronostic du coach</b> : avant le départ, le coach écrit ce qu’il pense que tu vas réaliser. Un bon coach se trompe de moins de 3 %.','<b>Le conseil m’a aidé</b> : c’est toi, le coureur, qui juges ton coach.','<b>Effort ressenti (0 à 10)</b> : 3 = je parle en phrases, 5 = par mots, 10 = je ne peux plus parler. <b>Charge</b> = effort × durée (en unités arbitraires, UA) : elle sert à doser l’entraînement.','<b>Projets tenus</b> : calculés tout seuls. Un projet trop prudent (moins de 95 % de ta dernière distance ou de ta VMA) ne compte pas.','<b>La prochaine fois</b> : une seule chose précise que tu changes.']
};
function helpBox(key,b,s){const f=HELP[key];if(!f)return '';const L=f(b,s);
  return `<details class="help"><summary>ⓘ consigne</summary><div>${L.map(x=>'<p>'+x+'</p>').join('')}</div></details>`}
function withHelp(html,key,b,s){const h=helpBox(key,b,s);if(!h)return html;const i=html.indexOf('</h3>');return i<0?html:html.slice(0,i+5)+h+html.slice(i+5)}

/* ---------- calculatrice d'allure (VMA × % → distance ou temps) ---------- */
let CALC={vma:null,pct:70,mode:'dur',sec:180,dist:300};
const f1=x=>(R(x*10)/10).toString().replace('.',',');
const DUR=[[36,'36"'],[72,'1’12'],[90,'1’30'],[180,'3’'],[360,'6’']];
const REP={36:['plot plat',10,'36" = 1/100 h : 1 km/h = 1 plot plat (10 m)'],72:['coupelle',20,'1’12 = 1/50 h : 1 km/h = 1 coupelle (20 m)'],90:[null,25,'1’30 = 1/40 h : 1 km/h = 25 m'],180:['grand plot jaune',50,'3’ = 1/20 h : 1 km/h = 1 grand plot jaune (50 m)']};
function piste(d){const t=Math.floor(d/200),r=R((d-t*200)/10)*10;return (t?t+' tour'+(t>1?'s':'')+' + ':'')+r+' m'}
function openCalc(preset){
  let vma=null;try{const b=curBin();if(V.v==='sess'){const r=b.runners[V.ri||0];vma=effV(r,V.sid)}else if(V.v==='cibles'){const L=curSessOf(b);vma=vmaOf(b.runners[preset&&preset.ri||0],L[L.length-1].id)}}catch(e){}
  CALC=Object.assign({},CALC,{vma:vma?R(vma*10)/10:CALC.vma},preset||{});calcRender()}
function calcRender(){
  modal(`<h2>🧮 Calculer mon allure</h2>
  <div class="row wrap"><label>Ma VMA (km/h)<input class="in w" id="cvma" inputmode="decimal" value="${CALC.vma==null?'':String(CALC.vma).replace('.',',')}"></label>
   <label>Pourcentage (%)<input class="in w" id="cpct" inputmode="decimal" value="${CALC.pct}"></label></div>
  <div class="seg">${[50,70,80,90,95,100,105,110,115,120,125,130].map(p=>`<button class="chip sm ${CALC.pct==p?'on':''}" data-cpct="${p}">${p} %</button>`).join('')}</div>
  <div class="seg big"><button class="chip ${CALC.mode==='dur'?'on':''}" data-cmode="dur">Je connais la durée → distance</button><button class="chip ${CALC.mode==='dist'?'on':''}" data-cmode="dist">Je connais la distance → temps</button></div>
  ${CALC.mode==='dur'?`<div class="seg">${DUR.map(d=>`<button class="chip ${CALC.sec==d[0]?'on':''}" data-cdur="${d[0]}">${d[1]}</button>`).join('')}</div><label>ou durée en secondes<input class="in w" id="csec" inputmode="numeric" value="${CALC.sec}"></label>`
   :`<div class="seg">${[100,125,200,250,300,375,400,500].map(d=>`<button class="chip ${CALC.dist==d?'on':''}" data-cdist="${d}">${d} m</button>`).join('')}</div><label>ou distance en mètres<input class="in w" id="cdist" inputmode="numeric" value="${CALC.dist}"></label>`}
  <div id="cres"></div><div class="row"><button class="btn" data-act="closem">Fermer</button></div>`);
  calcOut();
}
function calcOut(){
  const el=$('#cres');if(!el)return;const vma=CALC.vma,p=CALC.pct;
  if(!vma||!p){el.innerHTML='<p class="warn">Entre ta VMA (Seconde : grands plots du 3’ rapide de S1 · Terminale : test 36"/24" de T2).</p>';return}
  const v=vma*p/100;let res='',st=[`<b>① Ma vitesse</b> = VMA × pourcentage = ${f1(vma)} × ${String(p/100).replace('.',',')} = <b>${f1(v)} km/h</b>`];
  if(CALC.mode==='dur'){const s=CALC.sec;if(!s){el.innerHTML='';return}const d=v/3.6*s;const rp=REP[s];
    st.push(`<b>② Distance</b> = vitesse ÷ 3,6 × durée = ${f1(v)} ÷ 3,6 × ${s} s = <b>${R(d)} m</b>`);
    if(rp)st.push(`<b>Raccourci</b> : ${rp[2]} → ${f1(v)} × ${rp[1]} = ${R(v*rp[1])} m`);
    st.push(`<b>③ Sur la piste</b> : ${piste(d)} depuis la ligne${rp&&rp[0]?` · vise le <b>${rp[0]} n° ${fP(v)}</b>`:''}`);
    res=`<div class="outs">${out('Vitesse',f1(v)+' km/h')}${out('Distance en '+fT(s),R(d)+' m','hi')}${out('Sur la piste',piste(d))}${rp&&rp[0]?out('Repère',rp[0]+' n° '+fP(v)):''}${out('À mi-temps ('+fT(s/2)+')',R(d/2)+' m')}</div>`}
  else{const d=CALC.dist;if(!d){el.innerHTML='';return}const t=d*3.6/v;
    st.push(`<b>② Temps</b> = distance × 3,6 ÷ vitesse = ${d} × 3,6 ÷ ${f1(v)} = <b>${R(t)} s = ${fT(t)}</b>`);
    st.push(`<b>③ Passages</b> : mi-course (${d/2} m) en ${fT(t/2)} · un tour de 200 m en ${fT(200*3.6/v)}`);
    res=`<div class="outs">${out('Vitesse',f1(v)+' km/h')}${out('Temps sur '+d+' m',fT(t),'hi')}${out('Passage à '+(d/2)+' m',fT(t/2))}${out('Temps au tour',fT(200*3.6/v))}</div>`}
  el.innerHTML=res+`<div class="calcsteps">${st.map(x=>'<p>'+x+'</p>').join('')}</div>`;
}
const calcLink=(o)=>` <button class="lnk small" data-calc='${JSON.stringify(o)}'>comment ?</button>`;

/* ---------- carte « Mes objectifs du jour » ---------- */
const HIDE_FIRST=['s2','s3','t3','t4'];
function objectives(s,run,v){const L=[];if(!v)return L;
  s.blocks.forEach(b=>{const [ty,a1,a2,a3]=bk(b);
    if(ty==='i36')L.push([`36"/36" à ${a1} %`,`plot plat n° ${fP(v*a1/100)} (${R(v*a1/100*10)} m)`,{pct:a1,mode:'dur',sec:36}]);
    if(ty==='i36m')L.push(['36"/36" à 110 % puis 120 %',`plot plat n° ${fP(v*1.1)} puis n° ${fP(v*1.2)}`,{pct:110,mode:'dur',sec:36}]);
    if(ty==='ra')L.push(['Récupération 3’ à 70 %',`${fP(v*0.7)} grands plots (${R(dist(180,v*0.7))} m)`,{pct:70,mode:'dur',sec:180}]);
    if(ty==='ra2')L.push([`Récupération ${fT(a2)} à ${a1} %`,`${R(dist(a2,v*a1/100)/10)*10} m`,{pct:a1,mode:'dur',sec:a2}]);
    if(ty==='i112')L.push([`1’12 à ${a1} %`,`coupelle n° ${fP(v*a1/100)} (${R(v*a1/100*20)} m)`,{pct:a1,mode:'dur',sec:72}]);
    if(ty==='ser')L.push([esc(a2),a3.map(r=>`${r[0]} m → ${fT(tSec(r[0],v*r[1]/100))}`).join(' · '),{pct:a3[0][1],mode:'dist',dist:a3[0][0]}]);
    if(ty==='c500'&&s.eval){const t=tSec(500,v*1.1);L.push([esc(a2)+' à 110 %',`${fT(t)} · passage au 250 m en ${fT(t/2)}`,{pct:110,mode:'dist',dist:500}])}
    if(ty==='m130')L.push(['1’30 mesuré','tu mesures ta distance : environ '+R(dist(90,v*1.05)/5)*5+' m à 105 %',{pct:105,mode:'dur',sec:90}]);
    if(ty==='c3'&&a1==='c3'){const d3=R(dist(180,v)/10)*10;L.push([s.eval?'C1 · 3’ à 100 %':'3’ à 100 %',`${d3} m · mi-course ${R(d3/20)*10} m · ${fP(v)} grands plots`,{pct:100,mode:'dur',sec:180}])}
    if(ty==='p130'&&a1==='p'){const prev=lastReal(run,s.id);const sug=R(dist(90,v*1.05)/5)*5;L.push([esc(a2.replace(/ \(.*\)/,'')),(prev?`projet ≈ ${prev} m (ta dernière distance) · `:'')+`à 105 % : ${sug} m · à 45" : ${R(sug/2)} m`,{pct:105,mode:'dur',sec:90}])}
    if(ty==='at')L.push(['Atelier S7',`A : 1’30 à l’allure du 3’ = ${R(dist(90,v)/5)*5} m · C : 300 m à 105 % en ${fT(300*3.6/(v*1.05))}`,{pct:105,mode:'dist',dist:300}]);
  });return L}
const OBJ_INTRO={s1:'Aujourd’hui tu <b>mesures ta VMA de travail</b> : les grands plots jaunes franchis pendant ton 3’ rapide = ta vitesse en km/h. Elle servira à calculer tous tes objectifs.',
 t1:'Aujourd’hui tu prends tes <b>repères de vitesse</b> (relais 5 km) et ton <b>temps de référence sur 500 m</b>. Pas encore de VMA : elle se mesure en T2.',
 t2:'Aujourd’hui tu <b>mesures ta VMA</b> au test 36"/24" : la moyenne des plots atteints = ta VMA. Elle servira à calculer tous tes objectifs de T3 à T9.'};
function objCard(s,run,d,vMes,v){
  if(OBJ_INTRO[s.id])return `<section class="card obj"><h3>🎯 Mes objectifs du jour</h3><p>${OBJ_INTRO[s.id]}</p></section>`;
  const mod=num(d.vj)!=null&&vMes!=null&&Math.abs(num(d.vj)-vMes)>0.05;const L=objectives(s,run,v);
  const hide=HIDE_FIRST.includes(s.id)&&!d.vu&&v;const T=s.id[0]==='t';const idx=sessOf(T?'T':'S').findIndex(x=>x.id===s.id);
  const src=T?(idx>=5&&testVma(run.seances&&run.seances.t6&&run.seances.t6.rt)?'T6':'T2'):(idx>=6?'S6':'S1');
  return `<section class="card obj ${mod?'mod':''}"><h3>🎯 Mes objectifs du jour</h3>
   <div class="row wrap"><label>Ma VMA du jour (km/h) ${stp('vj',d,{step:0.5,min:6,max:24,start:vMes?R(vMes*2)/2:12,ph:vMes?fV(vMes):'',cls:mod?'modin':'',chk:x=>x!=null&&(x<7||x>22)?'VMA inhabituelle : vérifie.':''})}</label>
   <p class="small ${mod?'warn':'muted'}">${vMes?(mod?`⚠ VMA modifiée (mesurée : ${fV(vMes)} km/h). Le prof le verra.`:`VMA mesurée en ${src} : ${fV(vMes)} km/h.`):'Pas de VMA mesurée : entre celle que le prof t’a donnée.'}</p></div>
   ${!v?'':hide?`<p>📝 <b>Calcule d’abord tes objectifs</b> avec la 🧮 calculatrice (ou de tête : VMA × %), écris-les sur ta main ou dans ta tête, puis vérifie.</p>
     <ul class="objl">${L.map(o=>`<li><span>${o[0]}</span><b>?</b></li>`).join('')}</ul><div class="row wrap"><button class="btn" data-act="calc">🧮 Calculer</button><button class="btn pri" data-set="vu" data-v="1">Vérifier mes calculs</button></div>`
   :`<ul class="objl">${L.map(o=>`<li><span>${o[0]}</span><b>${o[1]}</b>${calcLink(o[2])}</li>`).join('')}</ul>`}</section>`;
}
/* coach habituel : le coureur suivant du groupe (binôme : l'autre ; trinôme : A→B→C→A), s'il est là */
function coachOf(b,ri,sid){const d=sd(b.runners[ri],sid);if(d.cx&&d.cx.n)return {n:d.cx.n,rep:true,why:d.cx.why};const n=b.runners.length;
  for(let k=1;k<n;k++){const p=b.runners[(ri+k)%n];const pd=p.seances&&p.seances[sid];if(!(pd&&pd.st==='abs'))return {n:p.prenom,full:p.full,rep:false,auto:k>1}}
  return {n:'',rep:false,need:true}}
const prenoms=b=>{const L=b.runners.map(r=>esc(r.prenom));return L.length<2?L.join(''):L.slice(0,-1).join(', ')+' et '+L[L.length-1]};
function presView(b,sid){
  const sts=b.runners.map(r=>(r.seances&&r.seances[sid]||{}).st||'');
  const ads=b.runners.filter(r=>(r.seances&&r.seances[sid]||{}).ad).map(r=>esc(r.prenom));
  if(!V.presOpen&&sts.every(x=>!x))return `<div class="presline"><span>✓ <b>${prenoms(b)}</b> ${b.runners.length>1?'présents':'présent(e)'}${ads.length?` · <b>${ads.join(' et ')}</b> en pratique adaptée`:''}</span><button class="lnk" data-act="presopen">Absent, blessé, adapté ?</button></div>`;
  return `<section class="card thin pres"><div class="prow">${b.runners.map((r,i)=>{const d=sd(r,sid);const st=d.st||'';
    return `<div class="pcol"><b>${esc(r.prenom)}</b><div class="seg">${[['','présent'],['abs','absent'],['bl','blessé / dispensé']].map(o=>`<button class="chip sm ${st===o[0]?'on':''}" data-st="${i}" data-v="${o[0]}">${o[1]}</button>`).join('')}${st?'':`<button class="chip sm ${d.ad?'on':''}" data-ad="${i}">pratique adaptée</button>`}</div></div>`}).join('')}</div>${b.runners.every(r=>!((r.seances&&r.seances[sid]||{}).st))?'<button class="lnk small" data-act="presclose">Replier</button>':''}</section>`;
}
function sessView(){
  const b=curBin(),s=SBY[V.sid],ri=V.ri||0,run=b.runners[ri],d=sd(run,s.id),vMes=vmaOf(run,s.id),vma=num(d.vj)||vMes;
  const [t,n]=tenus(s.id,Object.assign(ctx(run,s.id,d),{_v:vma}));const co=coachOf(b,ri,s.id);
  const head=`<section class="lanehead sess ${s.id[0]==='t'?'t':'s'}"><span class="ln">${s.n}</span><div><b>${esc(s.t)}</b><span><strong>Je réussis si</strong> ${esc(s.goal)}</span></div></section>${presView(b,s.id)}
  <div class="seg big">${b.runners.map((r,i)=>{const st=(r.seances&&r.seances[s.id]||{}).st;return `<button class="chip ${i===ri?'on':''}" data-ri="${i}">${esc(r.prenom)} ${st?'('+ST_TXT[st]+')':'court'}</button>`}).join('')}</div>`;
  const ph=V.ph==='fin'?'fin':'piste';
  const qrBtn='<button class="btn pri big full" data-act="finseance">Envoyer la séance au prof</button>';
  const phases=`<div class="seg big phase"><button class="chip ${ph==='piste'?'on':''}" data-ph="piste">Sur la piste</button><button class="chip ${ph==='fin'?'on':''}" data-ph="fin">Fin de séance · 5 min</button></div>`;
  if(d.st==='abs')return head+`<section class="card"><h3>${esc(run.prenom)} est absent(e) à cette séance</h3><p class="muted">Rien à remplir. La séance ne compte pas dans ses projets tenus. Le QR de fin de séance le signale au prof.</p></section>`+qrBtn;
  if(d.st==='bl')return head+`<section class="card"><h3>${esc(run.prenom)} ne court pas aujourd’hui</h3><p class="muted">Blessé ou dispensé : je tiens un rôle et je remplis mon bilan de rôle. La séance ne compte pas dans mes projets tenus.</p>
   <label>Ce qui m’empêche de courir ${txt('mot',d)}</label><p class="small"><b>✎ Mon rôle aujourd’hui</b></p>${segv('bl.role',d,[['coach','coach'],['juge','juge-chrono']])}
   <label>✎ Ce que j’ai observé / ce que j’ai bien fait dans mon rôle ${txt('bl.nx',d)}</label></section>`+qrBtn;
  const blocs=s.blocks.map(bk).filter(B=>phaseOf(B)===ph);
  const calcAvant=HIDE_FIRST.includes(s.id)&&!d.vu&&vma;          /* exercice : calculer ses objectifs avant de courir */
  if(ph==='fin')return head+phases+`<section class="card thin"><p class="small"><b>Après les étirements, 5 minutes :</b> chacun remplit son bilan, puis le binôme envoie la séance.</p></section>
  ${stepsBar(s,d)}${blocs.map(B=>stepWrap(withHelp(blockView(B,s,run,d,vma),B[0],B,s),B,s,d)).join('')}
  ${stepWrap(withHelp(bilanView(s,run,d,t,n,vma),'bilan',[],s),['bilan'],s,d)}`+qrBtn;
  const obj=objCard(s,run,d,vMes,vma);
  return head+phases+`<div class="coachline ${co.need?'warn':''}"><span>Coach : <b>${co.n?esc(co.n):'à choisir'}</b>${co.rep?` <span class="tag">remplaçant · ${esc(WHY_TXT[co.why]||'')}</span>`:''}</span>
   <button class="btn sm danger" data-act="chcoach">⚠ ${co.rep?'Modifier le coach':'Changer de coach (exceptionnel)'}</button></div>
  ${co.need?'<p class="warn small center">Ton coach habituel est absent : choisis un coach remplaçant avant de courir.</p>':''}
  ${d.ad?`<section class="card thin adapt"><p><b>Pratique adaptée</b> (avis médical, asthme, reprise…) : tu peux alterner course et marche, par exemple 1’ de course et 30" de marche. Ton but : la régularité, pas la distance. Tolérances élargies : 3’ à 20 m, 1’30 en zone 2, temps à 4 s.</p></section>`:''}
  ${calcAvant?obj:''}
  ${stepsBar(s,d)}
  ${blocs.map(B=>stepWrap(withHelp(blockView(B,s,run,d,vma),B[0],B,s),B,s,d)).join('')}
  <div class="vmaline"><span>VMA utilisée : <b>${vma?fV(vma)+' km/h':'à mesurer en '+(s.id[0]==='t'?'T2':'S1')}</b></span><button class="btn sm" data-act="calc">🧮 Calculer</button></div>
  ${calcAvant?'':obj}
  <button class="btn big full" data-ph="fin">Fin de séance : bilan et envoi →</button>`;
}
/* ---------- séance découpée en étapes ---------- */
const RESULT=['ec2','afl1','afl1T','vup'];
const STEP_KEY={al4:'al',ct:'ct',grp:'grp',i36:'i36',i36m:'i36',ra:'ra',ra2:'ra2',m130:'m130',warm:'wc',warmT:'wc',pf:'pf',pfT:'pf',situe:'situe',at:'at',pe:'pe',rel5:'rlt',tours:'tr',t3624:'ts',rt:'rt',i112:'c112',rep:'rep',mine:'mi',real8:'r8',pfin:'pfin'};
function filled(x){if(x==null||x==='')return false;if(Array.isArray(x))return x.some(filled);if(typeof x==='object')return Object.keys(x).some(k=>filled(x[k]));return true}
function stepDone(B,d){const [ty,a1]=B;
  if(ty==='bilan')return filled(getPath(d,'bl.rpe'))&&(filled(getPath(d,'bl.reu'))||filled(getPath(d,'bl.nx')));
  if(ty==='c3')return c3dist(d[a1])!=null;if(ty==='p130')return num(d[a1]&&d[a1].ec)!=null;if(ty==='c500')return parseT(d[a1]&&d[a1].t)!=null;
  if(ty==='txt'||ty==='ser')return filled(d[a1]);if(ty==='warm'||ty==='warmT')return filled(d.wc)||filled(d.warm);return filled(getPath(d,STEP_KEY[ty]||ty))}
/* deux temps : sur la piste (le coach note l'essentiel, quelques secondes par course) et en fin de séance (réflexion, bilan) */
const FIN=['txt','pf','pfT','situe','rep','pe','pfin','afl1','afl1T','ec2','vup'];
const phaseOf=B=>FIN.includes(B[0])?'fin':'piste';
function stepList(s,ph){ph=ph||(V.ph==='fin'?'fin':'piste');const L=s.blocks.map(bk).filter(B=>!RESULT.includes(B[0])&&phaseOf(B)===ph);return ph==='fin'?L.concat([['bilan']]):L}
const oneMode=()=>DB.opts.one!=null?DB.opts.one:window.innerWidth<600;
function stepsBar(s,d){const L=stepList(s);const n=L.filter(B=>stepDone(B,d)).length;const one=oneMode();if(V.cur==null||V.cur>=L.length)V.cur=0;
  return `<nav class="steps" aria-label="Étapes de la séance"><div class="sbar">${L.map((B,i)=>one?`<button class="${stepDone(B,d)?'ok':''} ${V.cur===i?'cur':''}" data-cur="${i}" aria-label="Étape ${i+1}">${i+1}</button>`:`<a href="#st-${i}" class="${stepDone(B,d)?'ok':''}" aria-label="Étape ${i+1}"><span>${i+1}</span></a>`).join('')}</div>
   <p><b>${n} / ${L.length}</b> étapes remplies${n===L.length&&L.length?(V.ph==='fin'?' : envoie la séance au prof':' : à la fin, passe au bilan'):''} <button class="lnk small" data-act="onetog">${one?'Tout afficher':'Une étape à la fois'}</button></p></nav>`}
function stepWrap(html,B,s,d){if(RESULT.includes(B[0]))return html;const L=stepList(s);const i=L.findIndex(x=>x===B||(x[0]===B[0]&&x[1]===B[1]));if(i<0)return html;const ok=stepDone(B,d);
  let h=html.replace('<section class="card','<section id="st-'+i+'" class="step '+(ok?'done ':'')+'card').replace('<h3>','<h3><span class="stepn">'+(ok?'✓':i+1)+'</span>');
  if(oneMode()){if(i!==V.cur)return h.replace('<section ','<section hidden ');const k=h.lastIndexOf('</section>');
    h=h.slice(0,k)+`<div class="stepnav">${i>0?`<button class="btn" data-cur="${i-1}">‹ Étape ${i}</button>`:'<span></span>'}${i<L.length-1?`<button class="btn pri" data-cur="${i+1}">Étape ${i+2} ›</button>`:''}</div>`+h.slice(k)}
  return h}
function coachModal(){
  const b=curBin(),ri=V.ri||0,run=b.runners[ri],d=sd(run,V.sid);const cx=d.cx||{};
  const mine=new Set(b.runners.map(r=>norm(r.full)));const known=((b.cfg&&b.cfg.eleves)||[]).filter(x=>!mine.has(norm(x))).map(x=>prenomDe(x)+' '+nomDe(x).charAt(0)+'.');
  modal(`<h2>Coach remplaçant pour ${esc(run.prenom)}</h2><p class="muted small">À utiliser seulement si ton coach habituel est absent, blessé ou dispensé. Le prof le verra dans ton envoi.</p>
   <label>Prénom et initiale du coach<input class="in" id="cxn" list="cxl" value="${esc(cx.n||'')}" autocomplete="off" style="max-width:none"></label>
   <datalist id="cxl">${known.map(k=>`<option value="${esc(k)}">`).join('')}</datalist>
   <p class="small"><b>Pourquoi ?</b></p><div class="seg" id="cxw">${[['abs','coach absent'],['bl','coach blessé ou dispensé'],['autre','autre raison']].map(o=>`<button class="chip ${(cx.why||'abs')===o[0]?'on':''}" data-cxw="${o[0]}">${o[1]}</button>`).join('')}</div>
   <div class="row wrap"><button class="btn pri" data-act="cxok">Valider</button>${cx.n?'<button class="btn ghost" data-act="cxdel">Revenir au coach habituel</button>':''}<button class="btn" data-act="closem">Annuler</button></div>`);
}

/* ---------- champs de saisie : pas à pas (+/−) plutôt que clavier ---------- */
const txt=(path,d,ph)=>`<textarea class="in" data-p="${path}" rows="2" placeholder="${esc(ph||'')}">${esc(getPath(d,path)||'')}</textarea>`;
const segv=(path,d,opts)=>{const v=getPath(d,path);return `<div class="seg">${opts.map(o=>`<button class="chip ${String(v)===String(o[0])?'on':''}" data-set="${path}" data-v="${o[0]}">${o[1]}</button>`).join('')}</div>`};
const out=(lab,val,cls)=>`<div class="out ${cls||''}"><span>${lab}</span><b>${val}</b></div>`;
const okb=ok=>ok==null?'':ok?'<span class="ok">✓ tenu</span>':'<span class="ko">✗</span>';
const who=w=>`<span class="who">${w==='C'?'⏱ coach pendant':w==='R'?'✎ coureur':'⏱ coach · ✎ coureur'}</span>`;
const sbOpt=o=>esc(JSON.stringify({mn:o.min,mx:o.max,s0:o.start}));
/* nombre : − [case] + ; la case reste modifiable au clavier */
function stp(path,d,o){o=o||{};const v=getPath(d,path),st=o.step||1;const w=o.chk?o.chk(num(v)):'';
  return `<span class="stp"><button type="button" class="sb" data-stp="${path}" data-dl="${-st}" data-o="${sbOpt(o)}" aria-label="moins">−</button><input class="in ${o.cls||''}" data-p="${path}" inputmode="decimal" value="${v==null?'':esc(v)}" placeholder="${esc(o.ph||'')}"><button type="button" class="sb" data-stp="${path}" data-dl="${st}" data-o="${sbOpt(o)}" aria-label="plus">+</button></span>${w?`<span class="vw">⚠ ${w}</span>`:''}`}
/* temps : −5 −1 [1’52] +1 +5 (on peut aussi taper 1'52, 1:52 ou 112) */
function tstp(path,d,o){o=o||{};const v=getPath(d,path);const w=o.chk?o.chk(parseT(v)):'';const b=(dl,l)=>`<button type="button" class="sb ${Math.abs(dl)>1?'s5':''}" data-stp="${path}" data-tm="1" data-dl="${dl}" data-o="${sbOpt(o)}">${l}</button>`;
  return `<span class="stp tm">${b(-5,'−5')}${b(-1,'−1')}<input class="in" data-p="${path}" inputmode="text" value="${v==null?'':esc(v)}" placeholder="${esc(o.ph||'')}">${b(1,'+1')}${b(5,'+5')}</span>${w?`<span class="vw">⚠ ${w}</span>`:''}`}
/* contrôles de vraisemblance */
const CHK={
 tours:x=>x!=null&&x>9?'plus de 9 tours en 3’ ? Vérifie.':'',
 plot:x=>x!=null&&(x<0||x>199)?'le plot se compte de 0 à 190 m depuis la ligne.':'',
 d3:x=>x!=null&&(x<300||x>1100)?'distance de 3’ inhabituelle (300 à 1 100 m).':'',
 proj:x=>x!=null&&(x<150||x>600)?'projet inhabituel (150 à 600 m).':'',
 mg:x=>x!=null&&x>60?'plus de 60 m de la ligne ? Vérifie ou revois ton projet.':'',
 fc:x=>x!=null&&(x<80||x>230)?'FC entre 80 et 230 /min : recompte (15" × 4).':'',
 t500:x=>x!=null&&(x<75||x>270)?'500 m entre 1’15 et 4’30 attendu : vérifie.':'',
 gp:x=>x!=null&&(x<2||x>24)?'nombre de grands plots inhabituel.':'',
 plt:x=>x!=null&&(x<5||x>25)?'plot atteint inhabituel (5 à 25).':''
};
const near=(p,pct)=>x=>x!=null&&p&&Math.abs(x-p)>p*pct?`plus de ${R(pct*100)} % d’écart avec le prévu (${fT(p)}) : vérifie.`:'';
function blockView(b,s,run,d,vma){
  const [ty,a1,a2,a3]=b;const T=s.id[0]==='t';
  if(ty==='al4'){const L=['Marche rapide','Footing','Allure rythmée','3’ rapide'],S0=[5,8,10,12];let pts=0;
    const rows=L.map((l,i)=>{const a=num(getPath(d,`al.${i}.an`)),e=num(getPath(d,`al.${i}.re`));let ok=null;if(a!=null&&e!=null){const df=Math.abs(a-e);ok=df<=1;pts+=df===0?3:df<=1?1:0}
      return `<div class="srow"><b class="sl">${l} ${okb(ok)}</b><label>Annonce ${stp(`al.${i}.an`,d,{step:0.5,min:0,max:30,start:S0[i]})}</label><label>Réalisés ${stp(`al.${i}.re`,d,{step:0.5,min:0,max:30,start:a!=null?a:S0[i],chk:CHK.gp})}</label><label>♥ /min ${stp(`al.${i}.fc`,d,{step:4,min:40,max:240,start:120,chk:CHK.fc})}</label></div>`}).join('');
    return `<section class="card"><h3>1 · Défi des 4 allures ${who('CR')}</h3><p class="muted small">3 min par allure. J’annonce mes grands plots jaunes, le coach compte. Grands plots en 3’ = ma vitesse en km/h. Annonce juste = 3 pts, à 1 plot = 1 pt.</p>
     ${rows}<div class="outs">${out('Points du défi',pts+' pts')}${out('Ma VMA de travail',vma?fV(vma)+' km/h':'–','hi')}</div></section>`}
  if(ty==='ct'){let pts=0;const rows=[0,1].map(i=>{const c=num(getPath(d,`ct.${i}.c`)),r=num(getPath(d,`ct.${i}.r`));let ok=null;if(c!=null&&r!=null){ok=c===r;pts+=ok?5:Math.abs(c-r)<=1?2:0}
      return `<div class="srow"><b class="sl">Manche ${i+1} ${okb(ok)}</b><label>Contrat (tours) ${stp(`ct.${i}.c`,d,{min:0,max:40,start:10})}</label><label>Réalisés ${stp(`ct.${i}.r`,d,{min:0,max:40,start:c!=null?c:10})}</label></div>`}).join('');
    return `<section class="card"><h3>2 · Contrat de tours : 2 × 6 min ${who('C')}</h3>${rows}${out('Points du contrat',pts+' pts')}</section>`}
  if(ty==='grp')return `<section class="card"><h3>3 · Mon groupe de vitesse ${who('R')}</h3>${segv('grp',d,[['G1','G1'],['G2','G2'],['G3','G3'],['G4','G4']])}<p class="muted small">Ouvre « Mes cibles » : elles sont calculées avec ta VMA de travail.</p></section>`;
  if(ty==='i36'||ty==='i36m'){const plan=ty==='i36'?Array(a2).fill(a1):[].concat(...a1.map(r=>Array(r[1]).fill(r[0])));const nrep=plan.length;const reps=(d.i36||[]);const np=reps.filter(x=>x==='P').length;
    const title=ty==='i36'?`36"/36" au plot cible à ${a1} %`:'Intermittent 36"/36" : 110 % puis 120 %';
    const cibles=[...new Set(plan)].map(p=>out('Plot plat à '+p+' %',vma?'n° '+fP(vma*p/100):'?','hi')).join('');
    return `<section class="card"><h3>${title} ${who('C')}</h3><div class="outs">${cibles}${out('« Pile »',np+' / '+nrep)}</div>${calcLink({pct:plan[0],mode:'dur',sec:36})}
     <p class="muted small">Touche chaque répétition : T = trop tôt, P = pile au plot, L = trop tard.</p>
     <div class="reps">${plan.map((p,i)=>`<div class="rep"><span>${i+1}</span>${ty==='i36m'?`<small>${p}%</small>`:''}${['T','P','L'].map(x=>`<button class="chip sm ${reps[i]===x?'on '+x:''}" data-set="i36.${i}" data-v="${x}">${x}</button>`).join('')}</div>`).join('')}</div></section>`}
  if(ty==='ra'){const c=vma?R(vma*0.7*2)/2:null;return `<section class="card"><h3>Récupération active 3’ à 70 % ${who('C')}</h3><div class="outs">${out('Grands plots à réaliser',c!=null?fP(c):'?','hi')}</div>${calcLink({pct:70,mode:'dur',sec:180})}
    <label>Grands plots réalisés ${stp('ra',d,{step:0.5,min:0,max:25,start:c||8,chk:x=>x!=null&&vma&&x>vma?'plus vite que ta VMA en récupération ? Vérifie.':''})}</label></section>`}
  if(ty==='m130'){const m=d.m130||{};const dd=tp(m.t,m.p),F=run.sexe==='F';
    return `<section class="card"><h3>Le 1’30 mesuré ${who('C')}</h3><p class="muted small">Le coach compte les tours et relève le plot plat d’arrêt (en mètres depuis la ligne).</p>
     <button class="btn live" data-live="dur|m130">⏱ Compter en direct</button>
     <div class="row wrap"><label>Tours ${stp('m130.t',d,{min:0,max:9,start:1})}</label><label>Plot d’arrêt (m) ${stp('m130.p',d,{step:10,min:0,max:190,start:100,chk:CHK.plot})}</label></div>
     <div class="outs">${out('Distance',fM(dd),'hi')}${out('Vitesse (distance ÷ 25)',dd?fV(dd/25)+' km/h':'–')}${out('Note /4',dd?noteS(F?'F130':'G130',dd):'–')}</div>
     <p class="small">Mon projet pour la S3 = cette distance, à 10 m près.</p></section>`}
  if(ty==='c3'){const c=d[a1]||{};const dd=c3dist(c),h=c3half(c),rg=c3reg(c),v=num(c.v);const sug=vma?R(dist(180,vma)/10)*10:null;
    return `<section class="card"><h3>${esc(a2)} ${who('CR')}</h3>
     <label>Distance visée (m) ${stp(a1+'.v',d,{step:10,min:200,max:1200,start:sug||600,ph:sug?String(sug):'',chk:CHK.d3})}</label>
     ${v!=null&&vma&&!ambition('c3',Object.assign({},d,{_v:vma}),a1)?`<p class="vw">⚠ Projet prudent : il ne comptera pas comme tenu. Vise au moins ${Math.ceil(AMB*dist(180,vma)/10)*10} m (95 % de ta VMA).</p>`:''}${pronoField(s,b,d)}${sug?`<p class="muted small">À 100 % de ta VMA : ${sug} m (mi-course ${R(sug/20)*10} m).${calcLink({pct:100,mode:'dur',sec:180})}</p>`:''}
     <button class="btn live" data-live="dur|${a1}">⏱ Compter en direct (tours, bip à 1’30 et 3’)</button>
     <div class="row wrap"><label>Mi-course 1’30 : tours ${stp(a1+'.mt',d,{min:0,max:9,start:1,chk:CHK.tours})}</label><label>+ plot (m) ${stp(a1+'.mp',d,{step:10,min:0,max:190,start:100,chk:CHK.plot})}</label></div>
     <div class="row wrap"><label>Arrivée 3’ : tours ${stp(a1+'.ft',d,{min:0,max:9,start:num(c.mt)!=null?num(c.mt)*2:2,chk:CHK.tours})}</label><label>+ plot (m) ${stp(a1+'.fp',d,{step:10,min:0,max:190,start:100,chk:CHK.plot})}</label></div>
     ${dd!=null&&CHK.d3(dd)?`<p class="vw">⚠ ${CHK.d3(dd)}</p>`:''}
     <div class="outs">${out('Distance réalisée',fM(dd),'hi')}${out('Mi-course',fM(h))}${out('2e moitié − 1re',rg==null?'–':(rg>=0?'+':'')+R(rg)+' m '+(rg>=-10?'✓ régulier':'✗'))}${out('Projet',v!=null&&dd!=null?(Math.abs(dd-v)<=10?(vma&&!ambition('c3',Object.assign({},d,{_v:vma}),a1)?'tenu, mais trop prudent : ne compte pas':'✓ tenu'):'✗ écart '+R(dd-v)+' m'):'–')}</div>
     ${lapChart(c.lt)}</section>`}
  if(ty==='ec2'){const a=c3dist(d.c3),c=c3dist(d.c3b);const e=a!=null&&c!=null?Math.abs(a-c):null;
    return `<section class="card thin">${out('Écart entre les deux 3’ (objectif : 20 m au plus)',e==null?'–':R(e)+' m '+(e<=20?'✓':'✗'),'hi')}</section>`}
  if(ty==='p130'){const p=d[a1]||{};const e=num(p.ec),z=T?zoneT(e):zoneS(e),real=p130real(p);
    const prev=lastReal(run,s.id);const sug=vma?R(dist(90,vma*1.05)/5)*5:null;const base=prev||(vma?dist(90,vma):null);const mini=base?Math.ceil(AMB*base/5)*5:null;
    const prud=num(p.proj)!=null&&!ambition('p130',Object.assign({},d,{_v:vma,_ref:prev}),a1);
    return `<section class="card"><h3>${esc(a2)} ${who('CR')}</h3>
     <label>Mon projet de distance (m) ${stp(a1+'.proj',d,{step:5,min:100,max:700,start:prev||sug||300,ph:prev?String(prev):(sug?String(sug):''),chk:CHK.proj})}</label>
     ${prud?`<p class="vw">⚠ Projet prudent : il ne comptera pas comme tenu. Vise au moins ${mini} m (95 % de ${prev?'ta dernière distance':'ta VMA'}).</p>`:''}${pronoField(s,b,d)}<p class="muted small">Je place mon plot à cette distance <b>avant</b> la ligne d’arrivée.${prev?' Dernière distance réalisée : '+prev+' m.':''}${calcLink({pct:105,mode:'dur',sec:90})}</p>
     <p class="small"><b>Au coup de sifflet, j’étais :</b></p>${segv(a1+'.sd',d,[['av','avant la ligne'],['ap','après la ligne']])}
     <label>à combien de mètres de la ligne ? ${stp(a1+'.mg',d,{min:0,max:200,start:0,chk:CHK.mg})}</label>
     <div class="outs">${out('Zone',z?z[1]+(T?' · '+String(z[0]).replace('.',',')+' pt':''):'–','hi')}${out('Distance réalisée',fM(real))}${out('Projet',z?((T?z[0]>=3:z[0]>=2)?(prud?'tenu, mais trop prudent : ne compte pas':'✓ tenu'):'✗'):'–')}</div>
     ${zstrip(T)}</section>`}
  if(ty==='txt')return `<section class="card"><h3>${esc(a2)} ${who('R')}</h3>${txt(a1,d)}</section>`;
  if(ty==='warm'||ty==='warmT'){const wc=d.wc||[];const n2=WARM_EX[1].filter(x=>wc.includes(x[0])).length;
    return `<section class="card"><h3>1 · Mon échauffement ${who('R')}</h3><p class="muted small">${s.id==='s8'||s.id==='t9'?'Seul, sans fiche : coche ce que tu fais.':'Coche avant de courir ce que tu vas faire.'}</p>
    ${WARM_EX.map((L,p)=>`<p class="small"><b>${['Partie 1 · cardio, 5-6 min','Partie 2 · articulaire et renforcement, 6-7 min','Partie 3 · gammes et accélérations, 5-6 min'][p]}</b>${p===1?` <span class="${n2>=4?'ok':'muted'}">${n2} / 4 exercices au moins</span>`:''}</p><div class="seg wc">${L.map(x=>`<button class="chip sm ${wc.includes(x[0])?'on':''}" data-tog="wc" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>`).join('')}
    <label class="small">Autre chose ${txt('wx',d)}</label>
    ${ty==='warmT'?`<label>Ma récup entre C1 et C2 ${txt('rc',d,'ex. 3 min footing lent, puis assis, je bois')}</label><label>Ma récup entre C2 et C3 ${txt('rc2',d)}</label>`:''}</section>`}
  if(ty==='afl1'){const a=afl1(run,d);
    return `<section class="card"><h3>Ma note de course (AFL1)</h3>${a?`<div class="outs">${out('3’ /4',a.n3)}${out('1’30 /4',a.n1)}${out('Zone /3',a.z+' ('+a.zl+')')}${out('Régularité /1',a.rg)}${out('AFL1 /12',a.tot,'hi')}</div>`:'<p class="muted">Remplis les deux courses.</p>'}</section>`}
  if(ty==='afl1T'){const a=afl1T(run,d);const f=x=>x==null?'–':String(x).replace('.',',');
    return `<section class="card"><h3>Ma note de course (AFL1)</h3>${a?`<div class="outs">${out('C1 · 500 m /8',f(a.n1))}${out('C2 · 500 m /8',f(a.n2))}${out('C3 · 1’30 /8',f(a.n3))}${out('Performance /8',f(a.perf))}${out('Zone du 1’30 /4',f(a.z)+' ('+a.zl+')')}${out('AFL1 /12',f(a.tot),'hi')}</div>`:'<p class="muted">Remplis les trois courses.</p>'}</section>`}
  if(ty==='pf'||ty==='pfT'){const v=d.pf||[];const O=ty==='pf'?[['dep','Départ du 3’ trop rapide'],['zone','1’30 hors zone'],['chute','Chute de vitesse']]:[['d1','1er 500 m : départ trop rapide'],['d2','2e 500 m : chute'],['z','1’30 hors zone']];
    return `<section class="card"><h3>Ce que je travaille en ${ty==='pf'?'S7':'T8'} ${who('R')}</h3><div class="seg">${O.map(o=>`<button class="chip ${v.includes(o[0])?'on':''}" data-tog="pf" data-v="${o[0]}">${o[1]}</button>`).join('')}</div>
     ${ty==='pfT'?`<label>Pourquoi ${txt('pfw',d)}</label>`:''}</section>`}
  if(ty==='vup'){const dd=c3dist(d.c3);return `<section class="card thin">${out('Grands plots de mon 3’ = ma nouvelle VMA de travail',dd?fV(dd/50)+' km/h':'–','hi')}<p class="muted small">Elle remplace la VMA de S1 pour calculer tes cibles de S7 et S8.</p></section>`}
  if(ty==='situe')return `<section class="card"><h3>Je me situe ${who('R')}</h3>
     <p class="small"><b>AFL2 · S’entraîner</b></p>${segv('situe.a2',d,[[1,'1 · isolé'],[2,'2 · suiveur'],[3,'3 · acteur'],[4,'4 · leader']])}
     <p class="muted small">Isolé : carnet incomplet, ¼ des projets tenus. Suiveur : ⅓. Acteur : carnet complet, ⅔. Leader : carnet exact, ¾, projet anticipé et réalisé.</p>
     <p class="small"><b>AFL3 · Coach ou juge-chrono</b></p>${segv('situe.a3',d,[[1,'1 · fantôme'],[2,'2 · théorique'],[3,'3 · complice'],[4,'4 · personnel']])}
     <p class="muted small">Fantôme : peu attentif. Théorique : conseils simples. Complice : conseils pertinents pour tenir l’allure. Personnel : conseils avisés au bon moment.</p></section>`;
  if(ty==='at'){const r=(d.at&&d.at.r)||[];
    return `<section class="card"><h3>2 · Mon point faible : atelier ${who('CR')}</h3>${segv('at.ch',d,[['A','A · départ du 3’'],['B','B · 1’30 en zone'],['C','C · chute de vitesse']])}
     <div class="reps">${[0,1,2,3].map(i=>`<div class="rep"><span>${i+1}</span><button class="chip sm ${r[i]==='ok'?'on P':''}" data-set="at.r.${i}" data-v="ok">réussi</button><button class="chip sm ${r[i]==='ko'?'on L':''}" data-set="at.r.${i}" data-v="ko">raté</button></div>`).join('')}</div></section>`}
  if(ty==='pe')return `<section class="card"><h3>Mes projets pour l’évaluation ${who('R')}</h3><div class="row wrap"><label>3’ visé (m) ${stp('pe.v3',d,{step:10,min:200,max:1200,start:600,chk:CHK.d3})}</label><label>1’30 : projet (m) ${stp('pe.p',d,{step:5,min:100,max:700,start:lastReal(run,s.id)||300,chk:CHK.proj})}</label></div><label>Pourquoi ${txt('pe.why',d)}</label></section>`;
  /* ----- Terminale ----- */
  if(ty==='rel5'){const vv=parseT(d.rlv),tt=parseT(d.rlt);const ok=vv!=null&&tt!=null?Math.abs(tt-vv)<=30:null;
    return `<section class="card"><h3>1 · Relais 5 km (25 tours) à deux ${who('CR')}</h3>
     <div class="row wrap"><label>Temps visé du binôme ${tstp('rlv',d,{min:600,max:3000,start:1500,ph:'25’00'})}</label><label>Temps du binôme ${tstp('rlt',d,{min:600,max:3000,start:parseT(d.rlv)||1500})}</label></div>
     <details class="help"><summary>Mes relais (facultatif)</summary><div>${[0,1,2,3,4,5,6].map(i=>`<div class="srow"><b class="sl">Relais ${i+1}</b><label>Distance (m) ${stp(`rl.${i}.d`,d,{step:100,min:100,max:2000,start:400})}</label><label>Temps ${tstp(`rl.${i}.t`,d,{min:10,max:900,start:90})}</label></div>`).join('')}</div></details>
     <div class="outs">${out('Écart au temps visé',vv!=null&&tt!=null?(tt-vv>=0?'+':'−')+fT(Math.abs(tt-vv)):'–','hi')}${out('Vitesse moyenne',tt?fV(5000*3.6/tt)+' km/h':'–')}${out('Projet (± 30 s)',okb(ok)||'–')}</div><p class="muted small">Record cadette du 5 km : 17’32.</p></section>`}
  if(ty==='c500'){const c=d[a1]||{};const tt=parseT(c.t),pj=parseT(c.tp),ps=parseT(c.ps);const sx=run.sexe==='F'?'F':'G';const sug=vma&&s.eval?R(tSec(500,vma*1.1)):null;
    return `<section class="card"><h3>${esc(a2)} ${who('CR')}</h3>
     <label>Mon temps visé ${tstp(a1+'.tp',d,{min:75,max:270,start:sug||(sx==='F'?165:130),ph:sug?fT(sug):'',chk:CHK.t500})}</label>
     ${pj!=null&&vma&&!ambition('c500',Object.assign({},d,{_v:vma}),a1)?`<p class="vw">⚠ Projet prudent : il ne comptera pas comme tenu. Vise ${fT(Math.floor(tSec(500,vma)/AMB))} ou plus vite.</p>`:''}${pronoField(s,b,d)}
     <p class="muted small">${pj?`Passage visé au 250 m : <b>${fT(pj/2)}</b> · vitesse ${fV(1800/pj)} km/h.`:'Repère : 2’00 au 500 m = 15 km/h.'}${calcLink({pct:110,mode:'dist',dist:500})}</p>
     <button class="btn live" data-live="c500|${a1}">⏱ Chronométrer en direct</button>
     <div class="row wrap"><label>Passage au 250 m ${tstp(a1+'.ps',d,{min:30,max:150,start:pj?R(pj/2):60,chk:x=>x!=null&&tt&&x>=tt?'le passage doit être plus court que le temps final.':''})}</label><label>Temps final ${tstp(a1+'.t',d,{min:75,max:270,start:pj||130,chk:CHK.t500})}</label></div>
     <div class="outs">${out('Temps',tt?fT(tt):'–','hi')}${out('Vitesse (1 800 ÷ temps)',tt?fV(1800/tt)+' km/h':'–')}${out('Note /8',tt?String(note500(sx,tt)).replace('.',','):'–')}${out('2e 250 − 1er',ps&&tt?((tt-ps-ps)>=0?'+':'−')+R(Math.abs(tt-ps-ps))+' s':'–')}${out('Projet (± 2 s)',tt!=null&&pj!=null?(Math.abs(tt-pj)<=2?'✓ tenu':'✗ écart '+(tt-pj>0?'+':'−')+R(Math.abs(tt-pj))+' s'):'–')}</div></section>`}
  if(ty==='tours'){const tr=d.tr||[];const V0=[8,10,12,14];
    const rows=[0,1,2,3,4,5].map(i=>{const v=i<4?V0[i]:num(tr[i]&&tr[i].v);const pv=v?tSec(200,v):null;const t=parseT(tr[i]&&tr[i].t);const ok=t!=null&&pv?Math.abs(t-pv)<=2:null;
      return `<div class="srow"><b class="sl">Course ${i+1} ${okb(ok)}</b>${i<4?`<span class="pill">${v} km/h · tour en <b>${fT(pv)}</b></span>`:`<label>Vitesse choisie (km/h) ${stp(`tr.${i}.v`,d,{step:0.5,min:8,max:24,start:i===4?15:16})}</label>${pv?`<span class="pill">tour en <b>${fT(pv)}</b></span>`:''}`}
       <label>Temps réalisé ${tstp(`tr.${i}.t`,d,{min:20,max:120,start:pv?R(pv):60,chk:pv?near(pv,0.2):null})}</label></div>`}).join('');
    return `<section class="card"><h3>1 · Varier les allures et coacher ${who('C')}</h3>${rows}</section>`}
  if(ty==='t3624'||ty==='rt'){const key=ty==='t3624'?'ts':'rt';const a=d[key]||[];const vt=testVma(a);
    return `<section class="card"><h3>${ty==='rt'?'Re-test VMA 36"/24" (début de séance)':'2 · Test VMA 36"/24"'} ${who('C')}</h3><p class="muted small">Plot plat atteint à chaque minute (plot n° 12 = 12 km/h).</p>
     <div class="reps">${[0,1,2,3,4,5,6,7,8,9].map(i=>`<div class="rep"><span>${i+1}’</span>${stp(`${key}.${i}`,d,{step:0.5,min:5,max:26,start:i?(num(a[i-1])||10):10,chk:CHK.plt})}</div>`).join('')}</div>
     <div class="outs">${out('Minutes remplies',a.filter(x=>num(x)!=null).length+' / 10')}${out(ty==='rt'?'Ma nouvelle VMA':'Ma VMA (somme ÷ 10)',vt?fV(vt)+' km/h':'–','hi')}</div>
     <p class="muted small">Ces données sont approximatives et évolutives : elles servent à planifier la charge de travail.</p></section>`}
  if(ty==='ser'){const rows=d[a1]||[];
    return `<section class="card"><h3>${esc(a2)} ${who('C')}</h3><p class="muted small">Complète en alternant les coureurs. Temps prévu calculé avec ta VMA.</p>
     ${a3.map((r,i)=>{const pv=prevu(r[0],r[1],vma);const t=parseT(rows[i]&&rows[i].tr);const ok=t!=null&&pv?Math.abs(t-pv)<=2:null;
      return `<div class="srow"><b class="sl">${r[0]} m à ${r[1]} % ${okb(ok)}</b><span class="pill">prévu <b>${pv?fT(pv):'?'}</b>${pv?' (mi-distance '+fT(pv/2)+')':''}${r[2]?' · récup '+r[2]:''}</span>
       <label>Réalisé ${tstp(`${a1}.${i}.tr`,d,{min:10,max:300,start:pv?R(pv):60,chk:pv?near(pv,0.2):null})}</label>${t!=null&&pv?`<span class="small ${ok?'ok':'ko'}">${t-pv>=0?'+':'−'}${R(Math.abs(t-pv))} s</span>`:''}</div>`}).join('')}</section>`}
  if(ty==='ra2'){const c=vma?R(dist(a2,vma*a1/100)/10)*10:null;
    return `<section class="card"><h3>Récupération active ${fT(a2)} à ${a1} % ${who('C')}</h3><div class="outs">${out('Distance à réaliser',c?c+' m · '+piste(c):'?','hi')}</div>${calcLink({pct:a1,mode:'dur',sec:a2})}
     <label>Distance réalisée (m) ${stp('ra2',d,{step:10,min:0,max:1200,start:c||400,chk:x=>x!=null&&c&&x>c*1.3?'bien plus vite que prévu : c’est une récupération.':''})}</label></section>`}
  if(ty==='i112'){const c=vma?vma*a1/100:null;const a=d.c112||[];const n=a.filter(x=>num(x)!=null&&c&&Math.abs(num(x)-c)<=1).length;
    return `<section class="card"><h3>Intermittent 1’12/1’12 à ${a1} % ${who('C')}</h3><div class="outs">${out('Coupelle cible',c?'n° '+fP(c)+' ('+R(c*20)+' m)':'?','hi')}${out('Coupelle atteinte (± 1)',n+' / '+a2)}</div>${calcLink({pct:a1,mode:'dur',sec:72})}
     <div class="reps">${Array.from({length:a2},(_,i)=>`<div class="rep"><span>${i+1}</span>${stp(`c112.${i}`,d,{step:0.5,min:3,max:25,start:c?R(c*2)/2:10})}</div>`).join('')}</div></section>`}
  if(ty==='rep')return `<section class="card"><h3>Ma répartition AFL2 / AFL3 ${who('R')}</h3>${segv('rep',d,[['6/2','6 / 2'],['4/4','4 / 4'],['2/6','2 / 6']])}<p class="muted small">AFL2 s’entraîner / AFL3 coach ou juge-chrono.</p><label>Pourquoi ce choix ${txt('repw',d)}</label></section>`;
  if(ty==='mine'){const x=(d.mi&&d.mi.x)||[];
    return `<section class="card"><h3>1 · Ma séance (paramètres de la charge) ${who('R')}</h3>
     <div class="row wrap"><label class="f1">Thème ${txt('mi.th',d,'ex. ne pas partir trop vite')}</label><label class="f1">Problème vu en T7 ${txt('mi.pb',d,'ex. passage au 250 m 4 s trop rapide')}</label></div>
     ${[0,1].map(i=>`<div class="srow"><b class="sl">Exercice ${i+1}</b><label class="f1">Exercice <input class="in" data-p="mi.x.${i}.e" value="${esc(x[i]&&x[i].e||'')}" placeholder="ex. 250 m"></label><label>Distance / durée <input class="in w" data-p="mi.x.${i}.dd" value="${esc(x[i]&&x[i].dd||'')}"></label><label>% VMA ${stp(`mi.x.${i}.i`,d,{step:5,min:50,max:140,start:100})}</label><label>Récup <input class="in w" data-p="mi.x.${i}.r" value="${esc(x[i]&&x[i].r||'')}" placeholder="2’"></label><label>Répétitions ${stp(`mi.x.${i}.n`,d,{min:1,max:12,start:3})}</label></div>`).join('')}</section>`}
  if(ty==='real8'){const r=d.r8||[];
    return `<section class="card"><h3>2 · Réalisation ${who('C')}</h3><div class="reps r8">${[0,1,2,3,4,5,6,7].map(i=>{const p=parseT(r[i]&&r[i].p),x=parseT(r[i]&&r[i].r);const ok=p!=null&&x!=null?Math.abs(p-x)<=2:null;
      return `<div class="rep col"><span>${i+1} ${okb(ok)}</span><label>Prévu ${tstp(`r8.${i}.p`,d,{min:10,max:300,start:i&&parseT(r[i-1]&&r[i-1].p)||60})}</label><label>Réalisé ${tstp(`r8.${i}.r`,d,{min:10,max:300,start:p||60,chk:p?near(p,0.2):null})}</label></div>`}).join('')}</div></section>`}
  if(ty==='pfin'){const f=d.pfin||{};
    return `<section class="card"><h3>3 · Prise d’allure 3 × 100 m et projet final ${who('R')}</h3>
     <div class="row wrap"><label>100 m visé ${tstp('pfin.c100',d,{min:12,max:40,start:parseT(f.c1)?R(parseT(f.c1)/5):24})}</label><label>C1 visé ${tstp('pfin.c1',d,{min:75,max:270,start:130,chk:CHK.t500})}</label><label>C2 visé ${tstp('pfin.c2',d,{min:75,max:270,start:parseT(f.c1)||130,chk:CHK.t500})}</label></div>
     <div class="row wrap"><label>Passage au 250 m ${tstp('pfin.ps',d,{min:30,max:150,start:parseT(f.c1)?R(parseT(f.c1)/2):65})}</label><label>1’30 : distance (m) ${stp('pfin.p130',d,{step:5,min:100,max:700,start:lastReal(run,s.id)||300,chk:CHK.proj})}</label></div></section>`}
  return '';
}
function lastReal(run,sid){const L=sessOf(cyOfSid(sid));const i=L.findIndex(s=>s.id===sid);for(let k=i-1;k>=0;k--){const d=run.seances&&run.seances[L[k].id];if(!d)continue;
  const r=p130real(d.p2)||p130real(d.p);if(r)return R(r);if(d.m130){const x=tp(d.m130.t,d.m130.p);if(x)return R(x)}}return null}
function zstrip(T){const p=T?['0,5','2','4','3','1']:['0','1','3','2','0'];return `<div class="zs"><div>&gt;15 m avant<b>${p[0]}</b></div><div>5-15 avant<b>${p[1]}</b></div><div class="z4">± 5 m<b>${p[2]}</b></div><div>5-15 après<b>${p[3]}</b></div><div>&gt;15 m après<b>${p[4]}</b></div></div>`}
/* graphique des tours (compteur en direct) */
function lapChart(lt){const a=(lt||[]).map(num).filter(x=>x!=null&&x>0);if(a.length<2)return '';const mx=Math.max(...a),mn=Math.min(...a),m=a.reduce((s,x)=>s+x,0)/a.length;const W=560,H=130,B=H-20,bw=Math.min(90,W/a.length);
  const y=x=>B-x/mx*(B-22);
  return `<div class="chart"><p class="small"><b>Temps de chaque tour</b> · écart ${R(mx-mn)} s ${mx-mn<=4?'✓ régulier':'✗ irrégulier'}</p><svg viewBox="0 0 ${W} ${H}" role="img">${a.map((x,i)=>`<rect x="${i*bw+6}" y="${y(x)}" width="${bw-12}" height="${B-y(x)}" rx="6" fill="${Math.abs(x-m)<=2?'var(--acc)':'var(--track)'}"/><text x="${i*bw+bw/2}" y="${y(x)-5}" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">${fT(x)}</text><text x="${i*bw+bw/2}" y="${H-4}" text-anchor="middle" font-size="12" fill="currentColor" opacity=".6">tour ${i+1}</text>`).join('')}<line x1="0" x2="${a.length*bw}" y1="${y(m)}" y2="${y(m)}" stroke="currentColor" stroke-dasharray="4 4" opacity=".45"/></svg></div>`}

/* ---------- pronostic du coach (AFL3 évaluable) ---------- */
function pronoField(s,b,d){const B=pronoTarget(s);if(!B||B[0]!==b[0]||B[1]!==b[1])return '';const T=B[0]==='c500';const p=T?parseT(getPath(d,'bl.pr')):num(getPath(d,'bl.pr'));const r=pronoReal(B,d);
  return `<div class="prono"><p class="small"><b>⏱ Pronostic du coach</b> <span class="muted">(avant le départ : ce que tu penses qu’il va réaliser)</span></p>
   ${T?tstp('bl.pr',d,{min:75,max:270,start:parseT(d[B[1]]&&d[B[1]].tp)||130}):stp('bl.pr',d,{step:B[0]==='c3'?10:5,min:100,max:1200,start:num(B[0]==='c3'?d[B[1]]&&d[B[1]].v:d[B[1]]&&d[B[1]].proj)||(B[0]==='c3'?600:300)})}
   ${p!=null&&r!=null?`<span class="small ${Math.abs(p-r)/r<=0.03?'ok':'muted'}">Écart du pronostic : ${T?R(Math.abs(p-r))+' s':R(Math.abs(p-r))+' m'} (${R(Math.abs(p-r)/r*100)} %)</span>`:''}</div>`}
/* ---------- conseils suggérés au coach ---------- */
function suggest(s,run,d,v){const L=[];
  s.blocks.forEach(b=>{const [ty,a1,a2,a3]=bk(b);
    if(ty==='i36'||ty==='i36m'){const r=d.i36||[];const nT=r.filter(x=>x==='T').length,nL=r.filter(x=>x==='L').length,nn=r.filter(Boolean).length;
      if(nT>=2&&nT>=nL)L.push('Tu arrives trop tôt au plot : pars plus doucement, les 10 premiers mètres décident tout.');
      else if(nL>=2)L.push('Tu arrives en retard au plot : démarre plus franchement dès le coup de sifflet.');
      else if(nn>=4)L.push('Allure très juste au plot : garde exactement ce départ.')}
    if(ty==='c3'){const c=d[a1];const rg=c3reg(c);
      if(rg!=null){if(rg<-10)L.push(`Ta 2e moitié du 3’ est plus courte de ${R(-rg)} m : pars à l’allure de la fin, pas plus vite.`);else L.push('3’ régulier : tu peux viser 10 à 20 m de plus la prochaine fois.')}
      const a=((c&&c.lt)||[]).map(num).filter(x=>x>0);if(a.length>=3&&Math.max(...a)-Math.min(...a)>6)L.push(`Tes tours varient de ${R(Math.max(...a)-Math.min(...a))} s : cale-toi sur un temps au tour.`)}
    if(ty==='p130'){const e=num(d[a1]&&d[a1].ec);if(e!=null){if(e<-5)L.push(`Tu étais ${R(-e)} m avant la ligne : fais la moitié du projet à 45", ou baisse ton projet d’environ ${Math.max(5,R(-e/5)*5)} m.`);else if(e>5)L.push(`Tu étais ${R(e)} m après la ligne : tu peux monter ton projet d’environ ${Math.max(5,R(e/5)*5)} m.`);else L.push('Pile en zone 4 : garde ce projet et cette allure.')}}
    if(ty==='ser'&&v){let sum=0,n=0;(d[a1]||[]).forEach((r,i)=>{const t=parseT(r&&r.tr),row=a3[i];if(t!=null&&row){sum+=t-prevu(row[0],row[1],v);n++}});
      if(n>=2){const m=sum/n;if(m>2)L.push(`Tu es en moyenne ${R(m)} s trop lent : écoute le passage à mi-distance et relance.`);else if(m<-2)L.push(`Tu es en moyenne ${R(-m)} s trop rapide : tu te mets dans le rouge, respecte l’allure prévue.`);else L.push('Allures tenues à 2 s près : bravo, essaie sans annonce de passage.')}}
    if(ty==='c500'){const c=d[a1]||{};const ps=parseT(c.ps),t=parseT(c.t);if(ps&&t&&t>ps){const df=(t-ps)-ps;
      if(df>4)L.push(`Ton 2e 250 m est plus lent de ${R(df)} s : passe au 250 m dans ton temps prévu, pas avant.`);else if(df<-3)L.push(`Ton 2e 250 m est plus rapide de ${R(-df)} s : tu as de la réserve, pars un peu plus vite.`);else L.push('500 m bien réparti entre les deux 250 m.')}}
    if(ty==='i112'&&v){const c=v*a1/100;const a=(d.c112||[]).map(num).filter(x=>x!=null);if(a.length>=2){const lo=a.filter(x=>x<c-1).length,hi=a.filter(x=>x>c+1).length;if(lo>=2)L.push('Coupelle pas atteinte : régularise ta foulée et relance à mi-parcours.');else if(hi>=2)L.push('Tu dépasses ta coupelle : c’est 80 %, reste en aisance respiratoire.')}}
    if(ty==='tours'){const tr=d.tr||[];let fast=0,slow=0;[8,10,12,14].forEach((v0,i)=>{const t=parseT(tr[i]&&tr[i].t);if(t!=null){const p=tSec(200,v0);if(t<p-2)fast++;if(t>p+2)slow++}});if(fast>=2)L.push('Tu cours trop vite aux petites allures : le coach annonce le passage au 100 m.');if(slow>=2)L.push('Tu es en retard au tour : relance dans la ligne droite.')}
  });return [...new Set(L)].slice(0,4)}
function bilanView(s,run,d,t,n,v){
  const cr=getPath(d,'bl.cr')||[];const sg=suggest(s,run,d,v);const con=getPath(d,'bl.con')||'';
  return `<section class="card bilan"><h3>Bilan</h3>
   <p class="small"><b>⏱ Le coach a vu</b></p><div class="checks">${s.crit.map((c,i)=>`<button class="chk ${cr[i]?'on':''}" data-set="bl.cr.${i}" data-v="${cr[i]?'':'1'}">${cr[i]?'☑':'☐'} ${esc(c)}</button>`).join('')}</div>
   <div class="row wrap"><label class="f1">⏱ Ta réussite ${txt('bl.reu',d)}</label><label class="f1">⏱ Ton conseil ${txt('bl.con',d)}</label></div>
   ${sg.length?`<p class="small"><b>💡 Idées de conseils</b> <span class="muted">(d’après les résultats · touche pour ajouter)</span></p><div class="sugg">${sg.map(x=>`<button class="chip sg ${con.includes(x)?'on':''}" data-sugg="${esc(x)}">＋ ${esc(x)}</button>`).join('')}</div>`:''}
   <p class="small"><b>✎ Le conseil de mon coach m’a aidé</b></p>${segv('bl.aide',d,[['1','oui'],['0','non']])}
   <p class="small"><b>✎ Effort ressenti sur la séance</b> <span class="muted">(0 repos … 10 maximal)</span></p>
   <div class="rpe">${[0,1,2,3,4,5,6,7,8,9,10].map(k=>`<button class="chip sm r${k} ${String(getPath(d,'bl.rpe'))===String(k)?'on':''}" data-set="bl.rpe" data-v="${k}">${k}</button>`).join('')}</div>
   <p class="small rpel">${getPath(d,'bl.rpe')!=null&&getPath(d,'bl.rpe')!==''?RPE_TXT[+getPath(d,'bl.rpe')]:'Touche le chiffre qui correspond à ton effort.'}</p>
   <div class="row wrap"><label>✎ Durée de pratique (min) ${stp('bl.du',d,{step:5,min:10,max:120,start:60})}</label>${out('Charge de la séance',chargeOf(d)!=null?chargeOf(d)+' UA':'–')}</div>
   <details class="help"><summary>FC (facultatif)</summary><div><label>FC en fin de série (/min), pouls 15" × 4 ${stp('bl.fc',d,{step:4,min:60,max:240,start:160,chk:CHK.fc})}</label></div></details>
   <div><p class="small"><b>✎ Mon rôle aujourd’hui</b></p>${segv('bl.role',d,[['coach','coach'],['juge','juge-chrono']])}</div>
   <div class="outs">${out('Projets tenus aujourd’hui',n?t+' / '+n:'–','hi')}</div>
   <label>✎ La prochaine fois, je… ${txt('bl.nx',d)}</label></section>`;
}

/* ---------- compteur et chrono en direct (coach) ---------- */
let LIVE=null;
function liveOpen(kind,key){liveStop();const dur=key==='m130'?90:180;LIVE={kind,key,dur,t0:null,laps:[],mid:null,end:null,stage:'ready',b1:false};
  try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(l=>{if(LIVE)LIVE.lock=l;else l.release()}).catch(()=>{})}catch(e){}
  liveRender()}
function liveStop(){if(!LIVE)return;clearInterval(LIVE.h);try{LIVE.lock&&LIVE.lock.release()}catch(e){}LIVE=null}
const lvEl=()=>LIVE&&LIVE.t0?(Date.now()-LIVE.t0)/1000:0;
const fTd=s=>{const m=Math.floor(s/60),r=s-m*60;return m+'’'+(r<10?'0':'')+r.toFixed(1).replace('.',',')};
function plotGrid(tag){return `<div class="pgrid">${Array.from({length:20},(_,i)=>i*10).map(x=>`<button class="chip" data-lvp="${tag}|${x}">${x}</button>`).join('')}</div>`}
function liveRender(){const L=LIVE;if(!L)return;const run=curBin().runners[V.ri||0];let body='';
  if(L.kind==='dur'){const c3=L.key!=='m130';const nl=L.laps.length;
    if(L.stage==='ready')body=`<p>Touche <b>Départ</b> au coup de sifflet, puis <b>TOUR</b> à chaque passage de ${esc(run.prenom)} sur la ligne. La tablette bipe à ${fT(L.dur/2)} et à ${fT(L.dur)}.</p><button class="btn pri huge" data-lv="go">▶ Départ</button>`;
    else if(L.stage==='run'){const needMid=c3&&L.b1&&L.mid==null;
      body=`<div class="lvt" id="lvt">${fTd(lvEl())}</div><div class="lvn">${nl} tour${nl>1?'s':''}</div>
       ${needMid?`<p class="warn center"><b>Mi-course !</b> Touche le plot où est ${esc(run.prenom)} (m depuis la ligne) :</p>${plotGrid('mid')}`:''}
       <button class="btn pri huge" data-lv="lap">TOUR +1</button><div class="row wrap center"><button class="btn sm" data-lv="undo">− annuler un tour</button><button class="btn sm ghost" data-lv="quit">Abandonner</button></div>`}
    else if(L.stage==='stop')body=`<div class="lvt">${fT(L.dur)}</div><div class="lvn">${L.laps.length} tour${L.laps.length>1?'s':''}</div><p class="warn center"><b>Sifflet !</b> Touche le plot d’arrêt (m depuis la ligne) :</p>${plotGrid('end')}<button class="btn sm" data-lv="undo">− annuler un tour</button>`;
    else{const dd=L.laps.length*200+L.end,h=c3&&L.mid!=null?L.laps.filter(x=>x<=L.dur/2).length*200+L.mid:null;const lt=L.laps.map((x,i)=>x-(i?L.laps[i-1]:0));
      body=`<div class="outs">${out('Distance',dd+' m','hi')}${h!=null?out('Mi-course',h+' m')+out('2e − 1re',(dd-2*h>=0?'+':'')+(dd-2*h)+' m'):''}</div>${lapChart(lt)}
       <div class="row wrap"><button class="btn pri big" data-lv="save">Enregistrer</button><button class="btn" data-lv="again">Recommencer</button></div>`}}
  else{ /* 500 m */
    if(L.stage==='ready')body=`<p>Touche <b>Départ</b> au signal, puis <b>Passage 250 m</b> et <b>Arrivée</b>.</p><button class="btn pri huge" data-lv="go">▶ Départ</button>`;
    else if(L.stage==='run')body=`<div class="lvt" id="lvt">${fTd(lvEl())}</div>${L.mid!=null?`<p class="center">Passage 250 m : <b>${fTd(L.mid)}</b></p><button class="btn pri huge" data-lv="fin">🏁 Arrivée</button>`:`<button class="btn pri huge" data-lv="p250">Passage 250 m</button>`}<div class="row center"><button class="btn sm ghost" data-lv="quit">Abandonner</button></div>`;
    else body=`<div class="outs">${out('Passage 250 m',fTd(L.mid))}${out('Temps final',fTd(L.end),'hi')}${out('2e 250 − 1er',((L.end-2*L.mid)>=0?'+':'−')+Math.abs(L.end-2*L.mid).toFixed(1).replace('.',',')+' s')}</div>
      <div class="row wrap"><button class="btn pri big" data-lv="save">Enregistrer</button><button class="btn" data-lv="again">Recommencer</button></div>`}
  modal(`<h2>⏱ ${L.kind==='dur'?(L.key==='m130'?'1’30 mesuré':'Compter le 3’'):'Chrono 500 m'} · ${esc(run.prenom)}</h2>${body}`);
}
function liveTick(){const L=LIVE;if(!L||L.stage!=='run')return;const e=lvEl();const el=$('#lvt');if(el)el.textContent=fTd(e);
  if(L.kind==='dur'){if(!L.b1&&e>=L.dur/2){L.b1=true;beep(1200,250);liveRender()}if(e>=L.dur){L.stage='stop';beep(700,700);liveRender()}}
  else if(e>600){liveStop();closeModal()}}
function liveAct(a,val){const L=LIVE;if(!L)return;const e=lvEl();
  if(a==='go'){L.t0=Date.now();L.stage='run';L.h=setInterval(liveTick,100);beep(900,120)}
  else if(a==='lap'){L.laps.push(e);if(navigator.vibrate)navigator.vibrate(40)}
  else if(a==='undo'){L.laps.pop()}
  else if(a==='p250'){L.mid=e}
  else if(a==='fin'){L.end=e;L.stage='done';clearInterval(L.h)}
  else if(a==='quit'||a==='again'){const k=L.kind,key=L.key;if(a==='quit'){closeModal();return}liveOpen(k,key);return}
  else if(a==='save'){const d=curD();
    if(L.kind==='dur'){if(L.key==='m130'){d.m130=Object.assign(d.m130||{},{t:String(L.laps.length),p:String(L.end)})}
      else{const c=d[L.key]=d[L.key]||{};c.ft=String(L.laps.length);c.fp=String(L.end);if(L.mid!=null){c.mt=String(L.laps.filter(x=>x<=L.dur/2).length);c.mp=String(L.mid)}c.lt=L.laps.map((x,i)=>R(x-(i?L.laps[i-1]:0)))}}
    else{const c=d[L.key]=d[L.key]||{};c.ps=fT(L.mid);c.t=fT(L.end)}
    saveS();closeModal();toast('Enregistré');return keepScroll(render)}
  liveRender()}
function liveTap(tag,x){const L=LIVE;if(!L)return;if(tag==='mid'){L.mid=x}else{L.end=x;L.stage='done';clearInterval(L.h)}liveRender()}

/* ---------- cibles & progression ---------- */
function ciblesView(){
  const b=curBin();const T=cyOf(b)==='T';const L=curSessOf(b);
  return `<section class="card"><h2>Mes cibles</h2><p class="muted small">Calculées avec ta VMA (${T?'test 36"/24" de T2, puis re-test en T6':'S1, puis mise à jour en S6'}). <button class="btn sm" data-act="calc">🧮 Calculer une autre allure</button></p>
  <div class="grid2">${b.runners.map((r,ri)=>{const v1=vmaOf(r,L[T?2:1].id),v2=vmaOf(r,L[L.length-1].id);const v=v2||v1;
   const rows=!v?`<tr><td>VMA à mesurer en ${T?'T2':'S1'}</td></tr>`:T?
     `<tr><th>Plot 36" à 110 % · 120 %</th><td>n° ${fP(v*1.1)} · ${fP(v*1.2)}</td></tr><tr><th>Coupelle 1’12 à 80 %</th><td>n° ${fP(v*0.8)}</td></tr><tr><th>Récupération 3’ à 70 %</th><td>${R(dist(180,v*0.7)/10)*10} m</td></tr><tr><th>300 m à 110 %</th><td>${fT(tSec(300,v*1.1))}</td></tr><tr><th>500 m à 110 % (passage 250)</th><td>${fT(tSec(500,v*1.1))} (${fT(tSec(250,v*1.1))})</td></tr><tr><th>1’30 à 105 % · 110 %</th><td>${R(dist(90,v*1.05)/5)*5} · ${R(dist(90,v*1.1)/5)*5} m</td></tr>`
     :`<tr><th>Plot 36" à 100 % · 105 % · 110 %</th><td>n° ${fP(v)} · ${fP(v*1.05)} · ${fP(v*1.1)}</td></tr><tr><th>Récupération 3’ à 70 %</th><td>${fP(v*0.7)} grands plots</td></tr><tr><th>3’ à 100 % (mi-course)</th><td>${R(dist(180,v)/10)*10} m (${R(dist(90,v)/10)*10} m)</td></tr><tr><th>1’30 à 105 % · 110 %</th><td>${R(dist(90,v*1.05)/5)*5} · ${R(dist(90,v*1.1)/5)*5} m</td></tr>`;
   return `<div class="sub"><h3>${esc(r.prenom)} · VMA ${fV(v1)}${v2&&v1&&Math.abs(v2-v1)>0.05?' → '+fV(v2):''} km/h</h3><table class="tt l">${rows}</table>
    <label class="small">VMA donnée par le prof (si pas de test) <input class="in w" data-vm="${ri}" inputmode="decimal" value="${esc(r.vmaManuelle||'')}"></label></div>`}).join('')}</div></section>`;
}
/* courbes SVG (aucune bibliothèque) */
function lineChart(labels,series,o){o=o||{};const W=560,H=200,P=34;const all=[].concat(...series.map(s=>s.v)).filter(x=>x!=null);if(all.length<2)return '';
  let mn=Math.min(...all),mx=Math.max(...all);if(mx-mn<1){mx+=1;mn-=1}const pad=(mx-mn)*0.15;mn-=pad;mx+=pad;
  const X=i=>P+i*(W-P-10)/Math.max(1,labels.length-1),Y=v=>{const k=(v-mn)/(mx-mn);return o.inv?20+k*(H-50):H-30-k*(H-50)};const fm=o.fmt||(x=>R(x));
  const path=s=>{let p='',pen=false;s.v.forEach((v,i)=>{if(v==null){return}p+=(pen?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)+' ';pen=true});return p};
  return `<div class="chart"><p class="small"><b>${o.title}</b>${o.inv?' <span class="muted">(plus haut = plus rapide)</span>':''}</p><svg viewBox="0 0 ${W} ${H}" role="img">
   ${labels.map((l,i)=>`<text x="${X(i)}" y="${H-8}" text-anchor="middle" font-size="12" fill="currentColor" opacity=".7">${l}</text>`).join('')}
   ${series.map(s=>`<path d="${path(s)}" fill="none" stroke="${s.c}" stroke-width="3" ${s.dash?'stroke-dasharray="6 5"':''} stroke-linejoin="round"/>${s.v.map((v,i)=>v==null?'':`<circle cx="${X(i)}" cy="${Y(v)}" r="5" fill="${s.c}"/><text x="${X(i)}" y="${Y(v)-9}" text-anchor="middle" font-size="11.5" font-weight="700" fill="currentColor">${fm(v)}</text>`).join('')}`).join('')}
  </svg><div class="leg">${series.map(s=>`<span><i style="background:${s.c}"></i>${s.n}</span>`).join('')}</div></div>`}
function barTenus(labels,vals){const W=560,H=150,P=10,bw=(W-2*P)/labels.length;const Y=p=>H-28-p*(H-50);
  if(!vals.some(x=>x!=null))return '';
  return `<div class="chart"><p class="small"><b>Projets tenus par séance</b> <span class="muted">(trait : ¾ = degré 4)</span></p><svg viewBox="0 0 ${W} ${H}" role="img">
   ${vals.map((p,i)=>`<text x="${P+i*bw+bw/2}" y="${H-8}" text-anchor="middle" font-size="12" fill="currentColor" opacity=".7">${labels[i]}</text>${p==null?'':`<rect x="${P+i*bw+6}" y="${Y(p)}" width="${bw-12}" height="${Math.max(2,H-28-Y(p))}" rx="5" fill="${p>=0.75?'var(--ok)':p>=1/3?'var(--acc)':'var(--track)'}"/><text x="${P+i*bw+bw/2}" y="${Y(p)-4}" text-anchor="middle" font-size="11.5" font-weight="700" fill="currentColor">${R(p*100)} %</text>`}`).join('')}
   <line x1="${P}" x2="${W-P}" y1="${Y(0.75)}" y2="${Y(0.75)}" stroke="var(--ok)" stroke-dasharray="6 5"/></svg></div>`}
function progView(){
  const b=curBin();const T=cyOf(b)==='T';const L=curSessOf(b);
  return `<section class="card"><h2>Ma progression</h2>${b.runners.map(r=>{let TT=0,NN=0;const pct=[],c3v=[],pj=[],pr=[],t5=[];
   const rows=L.map(s=>{const d=r.seances&&r.seances[s.id];const [t,n]=tenR(r,s.id);TT+=t;NN+=n;pct.push(n?t/n:null);const p=d&&(d.p);const z=p?(T?zoneT(num(p.ec)):zoneS(num(p.ec))):null;
     pj.push(p&&num(p.proj)!=null?num(p.proj):null);pr.push(p130real(p));
     if(T){const ts=d?[d.r1,d.e1,d.e2].map(c=>c&&parseT(c.t)).filter(x=>x!=null):[];const best=ts.length?Math.min(...ts):null;t5.push(best);
       return `<tr><th>${s.n}</th><td>${best?fT(best):'–'}</td><td>${p&&p.proj?esc(p.proj)+' m':'–'}</td><td>${fM(p130real(p))}</td><td>${z?z[1].replace(/ \(.*\)/,''):'–'}</td><td>${n?t+'/'+n:'–'}</td></tr>`}
     const c=d&&d.c3?c3dist(d.c3):null;c3v.push(c);
     return `<tr><th>${s.n}</th><td>${fM(c)}</td><td>${p&&p.proj?esc(p.proj)+' m':'–'}</td><td>${fM(p130real(p))}</td><td>${z?z[1]:'–'}</td><td>${n?t+'/'+n:'–'}</td></tr>`}).join('');
   const dg=degreeOf(TT,NN);const lab=L.map(s=>s.n);const ec=L.map(s=>{const x=ecartOf(s.id,r.seances&&r.seances[s.id]);return x==null?null:R(x)});const ch5=L.map(s=>{const x=ecartT(s.id,r.seances&&r.seances[s.id]);return x==null?null:R(x)});const chg=L.map(s=>chargeOf(r.seances&&r.seances[s.id]||{}));
   const ch=(T?lineChart(lab,[{n:'500 m (meilleur temps)',v:t5,c:'#6366f1'}],{title:'Mon temps sur 500 m',inv:true,fmt:fT}):lineChart(lab,[{n:'Distance du 3’',v:c3v,c:'#0d9488'}],{title:'Ma distance en 3’ (m)'}))
     +lineChart(lab,[{n:'Projet',v:pj,c:'#f04e23',dash:true},{n:'Réalisé',v:pr,c:T?'#6366f1':'#0d9488'}],{title:'1’30 : projet et distance réalisée (m)'})+lineChart(lab,[{n:'Écart au projet du 1’30 et du 3’ (m)',v:ec,c:'#c2412d'}].concat(T?[{n:'Écart au temps visé du 500 m (s)',v:ch5,c:'#4b44d8',dash:true}]:[]),{title:'Mon écart au projet : plus il baisse, mieux je gère mon allure'})+barTenus(lab,pct)+lineChart(lab,[{n:'Charge (effort × durée)',v:chg,c:'#64748b'}],{title:'Ma charge de séance (UA)'});
   return `<div class="sub"><h3>${esc(r.prenom)}</h3>${ch||'<p class="muted small">Les courbes apparaissent après deux séances remplies.</p>'}
    <details class="help"><summary>Tableau des séances</summary><div class="tw"><table class="tt"><tr><th></th><th>${T?'500 m':'3’'}</th><th>1’30 projet</th><th>1’30 réalisé</th><th>Zone</th><th>Tenus</th></tr>${rows}</table></div></details>
    <div class="outs">${out('Projets tenus sur le cycle',NN?TT+' / '+NN+' ('+R(100*TT/NN)+' %)':'–','hi')}${out('Indicateur AFL2',dg?DEG_TXT[dg]:'–')}</div></div>`}).join('')}</section>`;
}

