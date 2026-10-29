/* =====================================================================
   prof.js — Demi-fond · outil prof (Lycée G. Pompidou)
   Récupère les séances des élèves (QR codes scannés, fichiers JSON, dossier .zip du Nuage,
   copies de secours), suit chaque élève séance par séance, prépare la note (AFL1, AFL2, AFL3).
   Données gardées sur cet appareil uniquement (localStorage) : exporter des sauvegardes.
   ===================================================================== */
'use strict';
const APP_VERSION='v2 · 23/10/2026';
const CLEP='dfp-v1';
const $=s=>document.querySelector(s);
const nk=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dateFr=d=>{try{return d?new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}):''}catch(e){return ''}};
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),3000)}
function modal(html){$('#modal-body').innerHTML=icons(html);$('#modal').classList.add('on')}
function closeModal(){$('#modal').classList.remove('on');if(RQ.h){clearInterval(RQ.h);RQ.h=null}}
let AC=null;
function beep(f,ms){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f||880;g.gain.value=.25;o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+(ms||150)/1000)}catch(e){}}
/* les écrans du carnet (vues.js) attendent ces objets : ils servent ici aux courbes de la fiche élève */
const DB={binomes:[],opts:{}};let V={};

/* ---------- Base ----------
   P.eleves[k] = {classe,cy,full,prenom,nom,sexe,vmaManuelle,seances:{sid:d},recu:{sid:{ts,src}},groupe:{sid:[noms]},coach:{sid:{n,rep}},afl2,afl3}
   k = classe|nom normalisés (avec les fusions décidées par le prof : P.alias) */
let DEMO=false;
function vide(){return {v:1,eleves:{},alias:{},classesL:{},appel:{},stars:{},journal:[],vue:'classes',classe:'',seance:'',eleve:null,tri:'nom',saveAt:0}}
function charger(){try{const o=JSON.parse(localStorage.getItem(CLEP));if(o&&o.eleves)return Object.assign(vide(),o)}catch(e){}return vide()}
let P=charger();
function sauver(){if(DEMO)return;try{localStorage.setItem(CLEP,JSON.stringify(P))}catch(e){alert('Mémoire de l’appareil pleine : exporte une sauvegarde.')}}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
function cleEleve(classe,nom){let k=nk(classe)+'|'+nk(nom);const seen=new Set();while(P.alias[k]&&!seen.has(k)){seen.add(k);k=P.alias[k]}return k}
const nomAff=k=>{const e=P.eleves[k];return e?e.full:k.split('|')[1]};
const nomTri=k=>{const e=P.eleves[k];return e?(e.nom+' '+e.prenom):k};
const nm=e=>'<b>'+esc((e.nom||'').toUpperCase())+'</b> '+esc(e.prenom||'');
function eleveDe(classe,full,cy){const k=cleEleve(classe,full);let e=P.eleves[k];
  if(!e)e=P.eleves[k]={classe,cy:cy||clsCy(classe),full,prenom:prenomDe(full),nom:nomDe(full),sexe:'',vmaManuelle:'',seances:{},recu:{},groupe:{},coach:{}};
  return [k,e]}

/* ---------- Import ---------- */
/* r = {classe,cy,eleve,sexe,seance,date,ts,src,groupe,coach,coachRemplacant,vmaManuelle,d} */
function ajouterSeance(r){
  if(!r.eleve||!SBY[r.seance])throw new Error('séance incomplète');
  const [k,e]=eleveDe(r.classe,r.eleve,r.cy);const old=e.recu[r.seance];
  if(old&&(old.ts||0)>=(r.ts||0)&&r.ts)return [k,'déjà à jour'];
  e.cy=r.cy||e.cy;if(r.sexe)e.sexe=r.sexe;if(r.vmaManuelle)e.vmaManuelle=r.vmaManuelle;
  e.seances[r.seance]=r.d||{};e.recu[r.seance]={ts:r.ts||0,src:r.src,date:r.date||''};
  if(r.groupe&&r.groupe.length)e.groupe[r.seance]=r.groupe;if(r.coach)e.coach[r.seance]={n:r.coach,rep:!!r.coachRemplacant};
  if(!P.classesL[r.classe])P.classesL[r.classe]={eleves:[],lien:'',cy:r.cy||'S'};
  return [k,old?'mis à jour':'nouveau'];
}
function importerObjet(o){
  if(o&&o.carnetDF)throw new Error('C’est la sauvegarde d’une tablette (« Reprendre un carnet » côté élève), pas un fichier de séance.');
  if(!o||o.app!=='demi-fond-eleves')throw new Error('fichier non reconnu');
  const ts=Math.round((Date.parse(o.exportedAt)||0)/1000);
  const [k,res]=ajouterSeance({classe:o.classe||'',cy:o.cycle,eleve:o.eleve,sexe:o.sexe,seance:o.seance,date:o.date,ts,src:'fichier',groupe:o.groupe,coach:o.coach,coachRemplacant:o.coachRemplacant,vmaManuelle:o.vmaManuelle,d:o.donnees});
  return o.eleve+' · '+SBY[o.seance].n+' ('+res+')';
}
function importerQR(q){
  if(q.t==='C')throw new Error('C’est le QR de démarrage de la classe (pour les tablettes).');
  if(q.t==='T')throw new Error('C’est un QR de changement de groupe (pour une tablette d’élève).');
  if(q.t==='G'){/* QR d'un binôme : la séance de chaque élève */
    const L=(q.R||[]).map(r=>{const [k,res]=ajouterSeance({classe:q.c||'',cy:q.y,eleve:r.e,sexe:r.x,seance:q.s,date:q.d,ts:q.ts||0,src:'qr',groupe:q.gr,coach:r.co,coachRemplacant:!!r.cr,vmaManuelle:r.m,d:r.D});return prenomDe(r.e)+' ('+res+')'});
    return SBY[q.s].n+' · '+L.join(', ')}
  if(q.t!=='S')throw new Error('QR non reconnu.');
  const [k,res]=ajouterSeance({classe:q.c||'',cy:q.y,eleve:q.e,sexe:q.x,seance:q.s,date:q.d,ts:q.ts||0,src:'qr',groupe:q.gr,coach:q.co,coachRemplacant:!!q.cr,vmaManuelle:q.m,d:q.D});
  return q.e+' · '+SBY[q.s].n+' ('+res+')';
}
/* anciens QR du carnet numérique (DF2 = fin de séance, DF3 = rattrapage, DFP = morceaux) */
function importerAncien(raw){
  const run=(o,r,sid,d)=>{const full=(r.p||'')+' '+String(r.n||'').toUpperCase();const x=Object.assign({},d);delete x._m;
    return ajouterSeance({classe:o.c,cy:o.y||cyOfSid(sid),eleve:full.trim(),sexe:r.x,seance:sid,date:today(),ts:Math.round(Date.now()/1000),src:'qr',vmaManuelle:r.m||(d&&d._m)||'',d:x})};
  if(raw.startsWith('DF3')){const o=JSON.parse(raw.slice(3));let n=0;o.r.forEach(r=>Object.entries(r.se||{}).forEach(([sid,d])=>{run(o,r,sid,d);n++}));return 'ancien carnet · rattrapage : '+n+' séance(s)'}
  if(raw.startsWith('DF2R'))throw new Error('Ancien QR de restauration : rien à importer ici.');
  const o=JSON.parse(raw.slice(3));o.r.forEach(r=>run(o,r,o.s,r.d));return 'ancien carnet · '+SBY[o.s].n+' · '+o.r.map(r=>r.p).join(', ');
}
let PCH={tag:null,n:0,parts:{}};
async function lireTexteQR(t){t=String(t||'').trim();
  if(t.startsWith('DFEP|')||t.startsWith('DFP|')){const m=/^(DFEP|DFP)\|(\w+)\|(\d+)\/(\d+)\|([\s\S]*)$/.exec(t);if(!m)throw new Error('Morceau de QR illisible.');
    if(PCH.tag!==m[2])PCH={tag:m[2],n:+m[4],parts:{}};PCH.parts[+m[3]]=m[5];const got=Object.keys(PCH.parts).length;
    if(got<PCH.n)return '… '+got+' / '+PCH.n+' morceaux';let s='';for(let i=1;i<=PCH.n;i++)s+=PCH.parts[i];PCH={tag:null,n:0,parts:{}};t=s}
  if(/^DF[23]/.test(t))return importerAncien(/Ã|Â/.test(t)?decodeURIComponent(escape(t)):t);
  const q=await DFQR.decoder(t);if(q.t==='K')return deblocage(q);
  return importerQR(q);
}
/* code oublié côté élève : la tablette montre la clé du carnet chiffrée pour ma clé ; je la rends par un QR */
const b64s=u=>{let x='';new Uint8Array(u).forEach(c=>x+=String.fromCharCode(c));return btoa(x)};
async function deblocage(q){if(DEMO)throw new Error('Pas de déverrouillage en démo.');
  let raw;try{raw=await ouvrirBrut(q.p)}catch(e){throw new Error('Ce carnet a été chiffré pour un autre appareil prof (restaure ta sauvegarde).')}
  const txt=await DFQR.encoder({a:'DFE',v:1,t:'U',i:q.i,k:b64s(raw)});
  setTimeout(()=>qrPlein('Déverrouillage · '+(q.n||[]).map(esc).join(' · '),'Sur la tablette : « Scanner la réponse du prof », puis le groupe choisit un nouveau code.',[txt]),300);
  journal('Carnet déverrouillé : '+(q.n||[]).join(', ')+' ('+(q.c||'')+')');return 'QR de déverrouillage affiché · '+(q.n||[]).join(', ')}
async function importerFichiers(files){
  let ok=0;const err=[];
  async function un(nom,texte){try{const o=JSON.parse(texte);if(o&&o.app==='df-secours')await importerSecours(o);else importerObjet(o);ok++}catch(e){err.push(nom+' : '+(e.message||e))}}
  for(const f of files){
    if(/\.zip$/i.test(f.name)){try{const z=await JSZip.loadAsync(f);for(const x of Object.values(z.files).filter(x=>!x.dir&&/\.json$/i.test(x.name)))await un(x.name.split('/').pop(),await x.async('string'))}catch(e){err.push(f.name+' : zip illisible')}}
    else if(/\.json$/i.test(f.name)||f.type==='application/json')await un(f.name,await f.text());
    else if(/\.txt$/i.test(f.name)){try{await lireTexteQR(await f.text());ok++}catch(e){err.push(f.name+' : '+(e.message||e))}}
    else err.push(f.name+' : ni .json ni .zip');
  }
  journal(ok+' fichier'+(ok>1?'s':'')+' importé'+(ok>1?'s':'')+(err.length?' · '+err.length+' refusé'+(err.length>1?'s':''):''),err);
  classeParDefaut();sauver();rendre();if(ok)proposerSauvegarde();
}
function journal(t,err){P.journal.unshift({t,err:err||[],d:new Date().toISOString()});P.journal=P.journal.slice(0,20)}

/* ---------- Classes, élèves ---------- */
function classes(){const s=new Set(Object.keys(P.classesL));Object.values(P.eleves).forEach(e=>s.add(e.classe||''));return [...s].filter(Boolean).sort((a,b)=>a.localeCompare(b,'fr'))}
function classeParDefaut(){const C=classes();if(!C.includes(P.classe))P.classe=C[0]||''}
const clsCy=c=>{const L=P.classesL[c];if(L&&L.cy)return L.cy;const e=Object.values(P.eleves).find(x=>x.classe===c);return e&&e.cy==='T'?'T':'S'};
const liste=()=>(P.classesL[P.classe]||{eleves:[]}).eleves;
function eleves(c){c=c||P.classe;const s=new Set();(P.classesL[c]||{eleves:[]}).eleves.forEach(n=>{const [k]=eleveDe(c,n);s.add(k)});
  Object.entries(P.eleves).forEach(([k,e])=>{if(e.classe===c&&!P.alias[k])s.add(k)});
  return [...s].sort((a,b)=>nomTri(a).localeCompare(nomTri(b),'fr'))}
const runOf=e=>({sexe:e.sexe,seances:e.seances,vmaManuelle:e.vmaManuelle});
const starOf=(k,sid)=>(P.stars[k]&&P.stars[k][sid])||{};
function totaux(e){let T=0,N=0;sessOf(e.cy).forEach(s=>{const [t,n]=tenR(runOf(e),s.id);T+=t;N+=n});return [T,N]}
const fc=x=>x==null||x===''?'–':String(x).replace('.',',');
function ecTrend(e){const v=sessOf(e.cy).map(s=>ecartOf(s.id,e.seances[s.id])).filter(x=>x!=null);if(!v.length)return '–';const a=R(v[0]),b=R(v[v.length-1]);return v.length<2?a+' m':`${a} → <b class="${b<a?'ok':b>a?'ko':''}">${b} m</b>`}
/* AFL3 : ce que l'élève produit comme coach, mesuré chez les coureurs qu'il a coachés */
/* Contrôle du prof : il mesure lui-même une course par séance (distance ou temps de la course principale).
   L'écart avec la mesure du coach dit si le coach est fiable (AFL3) et si les données du carnet sont justes. */
function ctrlDe(k,sid){const v=P.ctrl&&P.ctrl[k]&&P.ctrl[k][sid];const e=P.eleves[k];const d=e&&e.seances[sid];if(v==null||v===''||!d)return null;
  const B=pronoTarget(SBY[sid]);if(!B)return null;const T=B[0]==='c500';const x=T?parseT(v):num(v);const r=pronoReal(B,d);if(x==null||!x||r==null)return {x,r:null};
  return {x,r,err:R(Math.abs(x-r)/x*1000)/10,T}}
const moy=a=>a.length?R(a.reduce((s,x)=>s+x,0)/a.length*10)/10:null;
function coachDe(k){const e=P.eleves[k];if(!e)return null;const me=nk(e.full),pr=nk(e.prenom);let yes=0,tot=0,n=0;const er=[],fi=[];
  Object.entries(P.eleves).forEach(([ko,o])=>{if(o===e||o.classe!==e.classe)return;sessOf(o.cy).forEach(s=>{const c=o.coach[s.id];const d=o.seances[s.id];if(!c||!d||d.st)return;
    const cn=nk(c.n);if(cn!==me&&!(c.rep&&cn.startsWith(pr)))return;n++;const bl=d.bl||{};if(bl.aide==='1'||bl.aide==='0'){tot++;if(bl.aide==='1')yes++}const x=pronoErr(s,d);if(x!=null)er.push(x);
    const ct=ctrlDe(ko,s.id);if(ct&&ct.err!=null)fi.push(ct.err)})});
  return {n,yes,tot,err:er.length?R(moy(er)):null,fiab:moy(fi),nf:fi.length}}
function coachTxt(k){const c=coachDe(k);if(!c||!c.n)return '–';return [c.nf?`contrôle ±${fc(c.fiab)} %`:'',c.err!=null?`pronostic ±${c.err} %`:'',c.tot?`aide ${c.yes}/${c.tot}`:''].filter(Boolean).join('<br><small>')+(c.nf||c.err!=null||c.tot?'':c.n+' séance'+(c.n>1?'s':''))}
/* statut d'un élève à une séance (appel) */
const STATUTS={present:'Présent',disp:'Dispensé / blessé',absent:'Absent',abj:'Absent justifié',oubli:'Oubli d’envoi',rien:'Rien reçu',retard:'En retard',tenue:'Oubli de tenue'};
/* retards et oublis de tenue d'un élève sur le cycle (appel manuel) */
function tenueRetard(k,c){const L=sessOf(clsCy(c||P.classe));let rt=0,tn=0;L.forEach(s=>{const o=P.appel[nk(c||P.classe)+'|'+s.id+'|'+k];if(o==='retard')rt++;if(o==='tenue')tn++});return [rt,tn]}
function statut(k,sid){const o=P.appel[nk(P.classe)+'|'+sid+'|'+k];if(o)return {c:o,manuel:true};const e=P.eleves[k];const d=e&&e.seances[sid];
  if(!d)return {c:'rien'};if(d.st==='abs')return {c:'absent'};if(d.st==='bl')return {c:'disp'};return {c:'present'}}
/* alertes pédagogiques de la classe */
function alertes(c){const cy=clsCy(c),L=sessOf(cy),K=eleves(c);const out=[];
  let last=-1;K.forEach(k=>L.forEach((s,i)=>{if(P.eleves[k]&&P.eleves[k].seances[s.id]&&i>last)last=i}));
  if(last>=0){const sid=L[last].id;const miss=K.filter(k=>!(P.eleves[k]&&P.eleves[k].seances[sid])&&!P.appel[nk(c)+'|'+sid+'|'+k]);if(miss.length)out.push(['qr',`Rien reçu en ${L[last].n} : ${miss.map(k=>esc(nomAff(k))).join(', ')}`])}
  K.forEach(k=>{const e=P.eleves[k];if(!e)return;const run=runOf(e);const done=L.filter(s=>hasData(e.seances[s.id])&&!e.seances[s.id].st);
    const l3=done.slice(-3);if(l3.length===3&&l3.every(s=>{const [t,n]=tenR(run,s.id);return n>0&&t===0}))out.push(['ko',`${nm(e)} : aucun projet tenu sur ses 3 dernières séances`]);
    const vj=L.filter(s=>e.seances[s.id]&&e.seances[s.id].vj);if(vj.length)out.push(['vma',`${nm(e)} : VMA modifiée par l’élève (${vj.map(s=>s.n).join(', ')})`]);
    const ab=L.filter(s=>e.seances[s.id]&&e.seances[s.id].st==='abs').length;if(ab>=2)out.push(['abs',`${nm(e)} : ${ab} absences`]);
    for(let i=1;i<done.length;i++){const a=done[i-1],b=done[i];const da=c3dist(e.seances[a.id].c3),db=c3dist(e.seances[b.id].c3);if(da&&db&&db>da*1.15){out.push(['vma',`${nm(e)} : 3’ passé de ${R(da)} à ${R(db)} m entre ${a.n} et ${b.n} (+${R((db/da-1)*100)} %) : vérifie la mesure`]);break}
      const ta=parseT((e.seances[a.id].e1||e.seances[a.id].r1||{}).t),tb=parseT((e.seances[b.id].e1||e.seances[b.id].r1||{}).t);if(ta&&tb&&tb<ta*0.9){out.push(['vma',`${nm(e)} : 500 m passé de ${fT(ta)} à ${fT(tb)} entre ${a.n} et ${b.n} : vérifie la mesure`]);break}}
    L.forEach(s=>{const ct=ctrlDe(k,s.id);if(ct&&ct.err!=null&&ct.err>8)out.push(['coach',`${s.n} : ton contrôle de ${nm(e)} diffère de ${fc(ct.err)} % de la mesure de son coach${e.coach[s.id]?' ('+esc(e.coach[s.id].n)+')':''}`])});
    const rp=done.map(s=>num((e.seances[s.id].bl||{}).rpe)).filter(x=>x!=null);if(rp.length>=3&&rp.slice(-3).every(x=>x>=9))out.push(['rpe',`${nm(e)} : effort ressenti 9-10 sur ses 3 dernières séances`]);
    if(done.length>=3&&!done.some(s=>(e.seances[s.id].bl||{}).reu))out.push(['coach',`${nm(e)} : son coach n’a jamais écrit « Ta réussite » (${done.length} séances)`]);
  });return out}
const ICA={qr:'📵',ko:'🎯',vma:'✎',abs:'🚫',coach:'⏱',rpe:'💡'};
function vmaDe(e){const L=sessOf(e.cy);return vmaOf(runOf(e),L[L.length-1].id)}
const heat=r=>r>=0.75?'h3':r>=0.5?'h2':r>=0.25?'h1':'h0';
/* signe en plus de la couleur (daltonisme : rouge et vert se confondent pour 8 % des garçons) */
const sig=r=>`<em class="sig">${r>=0.75?'✓✓':r>=0.5?'✓':r>=0.25?'!':'✗'}</em>`;
const grpVit=v=>v==null?null:v<10?'G1':v<12?'G2':v<14?'G3':'G4';

/* ---------- Protection des données ---------- */
const installee=()=>{try{return navigator.standalone===true||matchMedia('(display-mode: standalone)').matches}catch(e){return false}};
function telecharger(nom,texte,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([texte],{type:type||'text/csv;charset=utf-8'}));a.download=nom;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
function sauvegarder(nom){if(DEMO)return toast('Pas de sauvegarde en démo.');P.saveAt=Date.now();sauver();telecharger((nom||'DF_prof_sauvegarde_')+today()+'.json',JSON.stringify(Object.assign({dfProf:1},P)),'application/json')}
function proposerSauvegarde(){if(!DEMO&&Date.now()-(P.saveAt||0)>864e5&&confirm('Séances importées. Enregistrer une sauvegarde maintenant ? (La dernière date de plus d’un jour.)'))sauvegarder()}
function bandeauSauvegarde(){
  if(DEMO||!Object.keys(P.eleves).length)return '';
  const j=P.saveAt?Math.floor((Date.now()-P.saveAt)/864e5):null;
  const msg=j==null?'Aucune sauvegarde : si l’iPad efface les données, tout est perdu.':j>=2?`Dernière sauvegarde il y a ${j} jours.`:'';
  const inst=installee()?'':'Installe l’outil sur l’écran d’accueil (Safari → Partager → « Sur l’écran d’accueil ») : sinon Safari peut effacer ses données après 7 jours sans ouverture.';
  if(!msg&&!inst)return '';
  return `<div class="bandeau ${j==null||j>=7?'rouge':''}">${msg?`<span>${msg}</span><button class="btn sm" data-act="sauvegarde">Sauvegarder maintenant</button>`:''}${inst?`<span class="small">${inst}</span>`:''}</div>`;
}

/* ---------- Affichage ---------- */
/* onglets rangés par moment : avant le cycle, pendant la séance, après la séance */
/* épreuve officielle chronométrée par le prof : l'outil CCF (chrono, temps glissés sur l'élève, barèmes BO 2021) */
const LIEN_CCF='https://yannickdartois-hue.github.io/CCF-Demi-Fond-PROF/';
const carteCCF=t=>`<section class="card thin ccf"><p class="small"><b>${t}</b> Pour l’épreuve chronométrée par toi (départ commun, temps glissé sur chaque élève, barèmes officiels), utilise l’outil CCF.</p><a class="btn sm pri" href="${LIEN_CCF}" target="_blank" rel="noopener">Ouvrir CCF demi-fond — prof</a></section>`;
const ONGLETS=[['Avant'],['classes','Classes'],['Pendant'],['appel','Appel'],['import','Recevoir'],['chrono','Chrono'],['Après'],['seance','Séance'],['eleves','Élèves'],['note','Note'],['pilotage','Pilotage'],['export','Exporter']];
function rendre(){
  const C=classes();if(P.classe&&!C.includes(P.classe))classeParDefaut();
  document.body.dataset.cy=P.classe?clsCy(P.classe):'S';
  $('#classes').innerHTML=C.length?`<select id="selClasse" class="in sel" aria-label="Classe">${C.map(c=>`<option${c===P.classe?' selected':''}>${esc(c)}</option>`).join('')}</select>`:'';
  $('#onglets').innerHTML=ONGLETS.map(o=>o.length<2?`<span class="og">${o[0]}</span>`:`<button data-act="vue" data-v="${o[0]}" class="${P.vue===o[0]||(P.vue==='fiche'&&o[0]==='eleves')?'ici':''}">${o[1]}</button>`).join('');
  if(P.vue!=='chrono'&&CH.run)chStop();
  const Vs={classes:vClasses,import:vImport,appel:vAppel,seance:vSeance,eleves:vEleves,fiche:vFiche,note:vNote,pilotage:vPilotage,chrono:()=>carteCCF('Épreuve du CCF.')+chronoView(),export:vExport};
  $('#main').innerHTML=icons((DEMO?bandeauDemo():'')+bandeauSauvegarde()+(Vs[P.vue]||vClasses)());
}
const render=rendre;                                     /* nom attendu par vues.js et le chrono */
const pasDeClasse=t=>`<section class="card"><h2>${t}</h2><p class="muted">Importe d’abord la liste d’une classe (onglet Classes) ou des séances (onglet Importer).</p></section>`;
function stripSeances(cy,cur,act){return `<div class="seg">${sessOf(cy).map(s=>`<button class="chip ${cur===s.id?'on':''}" data-act="${act||'seance'}" data-v="${s.id}">${s.n}</button>`).join('')}</div>`}
function seanceCourante(cy){const L=sessOf(cy);if(P.seance&&L.some(s=>s.id===P.seance))return P.seance;
  let der=0;eleves().forEach(k=>{const e=P.eleves[k];if(e)L.forEach((s,i)=>{if(e.seances[s.id]&&i>der)der=i})});return P.seance=L[der].id}

/* ----- Classes ----- */
function decouperNom(t){t=String(t||'').replace(/\s+/g,' ').trim();if(!t)return null;const w=t.split(' '),maj=x=>x===x.toUpperCase()&&/[A-ZÀ-Ý]/.test(x);
  const nom=w.filter(maj),pre=w.filter(x=>!maj(x));if(nom.length&&pre.length)return pre.join(' ')+' '+nom.join(' ');return t}
function lireLignes(rows,classeDefaut){
  rows=rows.map(r=>(r||[]).map(c=>c==null?'':String(c).trim()));
  const hi=rows.findIndex(r=>r.some(c=>/^(é|e)l(è|e)ve|^nom\b|^nom$|pr(é|e)nom/i.test(c)));const H=hi>=0?rows[hi].map(c=>nk(c)):[];
  const col=re=>H.findIndex(h=>re.test(h));const iNom=col(/^nom( de famille)?$/),iPre=col(/^prenom/),iEl=col(/^eleve|^nom prenom|^nom et prenom|^identite/),iCl=col(/^classe/),iSx=col(/^sexe|^genre/);
  const out={};rows.slice(hi+1).forEach(r=>{let n='';
    if(iNom>=0&&iPre>=0&&r[iNom])n=r[iPre]+' '+r[iNom].toUpperCase();else if(iEl>=0)n=decouperNom(r[iEl]);else if(hi<0)n=decouperNom(r[0]);
    if(!n||/^(total|effectif)/i.test(n))return;const c=(iCl>=0&&r[iCl])||classeDefaut;if(!c)return;(out[c]=out[c]||new Map()).set(n.trim(),iSx>=0?r[iSx]:'')});
  return out}
async function importerListe(files,texte,classeDefaut,cy){
  const lots=[];for(const f of files||[]){const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});wb.SheetNames.forEach(sn=>lots.push(XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:false,defval:''})))}
  if(texte&&texte.trim())lots.push(texte.trim().split(/\r?\n/).map(l=>l.split(/\t|;/)));
  const tout={};lots.forEach(rows=>Object.entries(lireLignes(rows,classeDefaut)).forEach(([c,m])=>{tout[c]=tout[c]||new Map();m.forEach((sx,n)=>tout[c].set(n,sx))}));
  const C=Object.keys(tout);if(!C.length){alert(classeDefaut?'Aucun nom trouvé.':'Pas de colonne « Classe » dans le fichier : écris le nom de la classe avant d’importer.');return}
  C.forEach(c=>{const old=P.classesL[c]||{lien:'',cy:cy||(/^t/i.test(c)?'T':'S')};const L=[...tout[c].keys()].sort((a,b)=>nomDe(a).localeCompare(nomDe(b),'fr')||a.localeCompare(b,'fr'));
    P.classesL[c]={eleves:L,lien:old.lien||'',cy:cy||old.cy||'S'};
    tout[c].forEach((sx,n)=>{const s=String(sx||'').trim().toUpperCase();if(!s)return;const [k,e]=eleveDe(c,n,P.classesL[c].cy);if(!e.sexe)e.sexe=/^F/.test(s)?'F':/^(M|G|H)/.test(s)?'G':''})});
  journal('Listes importées : '+C.map(c=>c+' ('+tout[c].size+')').join(', '));P.classe=C[0];sauver();rendre();
}
const b64u=u=>{let x='';new Uint8Array(u).forEach(c=>x+=String.fromCharCode(c));return btoa(x).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const deb64=t=>Uint8Array.from(atob(String(t).replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
async function clePublique(){if(!crypto.subtle||DEMO)return '';
  if(!P.cle){const p=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveKey']);P.cle={pub:b64u(await crypto.subtle.exportKey('raw',p.publicKey)),priv:await crypto.subtle.exportKey('jwk',p.privateKey)};sauver()}
  return P.cle.pub}
let RQ={h:null};
function svgQR(t){try{return DFQR.svgQR(t)}catch(e){return '<p class="warn">Trop de données pour un seul QR.</p>'}}
function morceaux(txt,max){max=max||1400;if(txt.length<=max)return [txt];const tag=Math.random().toString(36).slice(2,6),n=Math.ceil(txt.length/max),o=[];for(let i=0;i<n;i++)o.push('DFEP|'+tag+'|'+(i+1)+'/'+n+'|'+txt.slice(i*max,(i+1)*max));return o}
function qrPlein(titre,sous,parts){const d=document.createElement('div');d.className='qr-plein';
  d.innerHTML=`<div><h2>${titre}</h2><p>${sous}</p><div class="qr" id="qpz"></div><p class="small center" id="qpn"></p><button class="btn pri big" type="button">Fermer</button></div>`;
  let i=0;const z=d.querySelector('#qpz'),n=d.querySelector('#qpn');z.innerHTML=svgQR(parts[0]);if(parts.length>1)n.textContent='1 / '+parts.length+' · la tablette vise jusqu’au bout';
  const h=parts.length>1?setInterval(()=>{i=(i+1)%parts.length;z.innerHTML=svgQR(parts[i]);n.textContent=(i+1)+' / '+parts.length+' · la tablette vise jusqu’au bout'},1100):null;
  d.querySelector('button').onclick=()=>{if(h)clearInterval(h);d.remove()};document.body.appendChild(d)}
async function qrDemarrage(c){const L=P.classesL[c],k=await clePublique();
  const txt=await DFQR.encoder({a:'DFE',v:1,t:'C',c,y:L.cy||'S',l:L.eleves,u:L.lien||'',k});
  qrPlein('Classe '+esc(c)+' · demi-fond '+CYC[L.cy||'S'].label,'Appli élève : « Scanner le QR de la classe » (accueil, ou Groupe → Nouvelle liste de classe)',[txt])}
/* rappel d'archivage : des séances reçues pendant une année scolaire précédente (l'année scolaire commence le 15 août) */
const anneeSco=ms=>{const d=new Date(ms);return d.getFullYear()-((d.getMonth()<7||(d.getMonth()===7&&d.getDate()<15))?1:0)};
function vieilleAnnee(){if(DEMO)return null;const now=anneeSco(Date.now());let old=null;
  Object.values(P.eleves).forEach(e=>Object.values(e.recu||{}).forEach(r=>{if(r&&r.ts){const y=anneeSco(r.ts*1000);if(y<now&&(old==null||y<old))old=y}}));return old}
function rappelArchive(){const y=vieilleAnnee();return y==null?'':`<section class="card rappel-archive"><h3>Nouvelle année scolaire</h3><p class="small">L’outil contient encore des séances de ${y}-${y+1}. Archive-les avant d’importer les classes de cette année : la sauvegarde est téléchargée, puis l’outil repart à zéro.</p><button class="btn sm pri" data-act="archiver">Archiver ${y}-${y+1} et repartir à zéro</button></section>`}
function vClasses(){
  const C=Object.keys(P.classesL).sort((a,b)=>a.localeCompare(b,'fr'));
  return `${rappelArchive()}${DEMO?'':`<section class="card demo-carte"><h3>👀 Découvrir l’outil (démo)</h3><p class="small muted">Deux classes fictives déjà remplies (Seconde et Terminale) : appel, suivi des séances, fiches élèves, note, pilotage. Rien n’est enregistré et tes vraies données ne sont pas touchées. Idéal pour montrer l’outil à un collègue.</p><div class="row wrap"><button class="btn pri" data-act="demo">Ouvrir la démo</button><a class="btn" href="../demi-fond-eleves/?demo">Démo de l’appli élève</a></div></section>`}
  <section class="card"><h2>Classes</h2><h3>Importer une liste Pronote</h3>
    <p class="small muted">Pronote : liste des élèves → Exporter (xlsx, xls ou csv). Avec une colonne « Classe », plusieurs classes s’importent d’un coup ; une colonne « Sexe » remplit fille/garçon. Tu peux aussi coller la liste (un élève par ligne, « NOM Prénom »).</p>
    <div class="row wrap"><label>Classe (si le fichier ne la donne pas)<input id="cl-nom" class="in" placeholder="2nde 3"></label>
     <label>Niveau<select id="cl-cy" class="in sel"><option value="">selon le nom (« T… » = Terminale)</option><option value="S">Seconde (S1-S8)</option><option value="T">Terminale (T1-T9)</option></select></label></div>
    <div class="row wrap"><label class="btn pri" for="cl-fic">Choisir le fichier Pronote</label><input id="cl-fic" type="file" accept=".xlsx,.xls,.csv,.ods,.txt" hidden multiple></div>
    <label>Ou coller la liste<textarea id="cl-txt" class="in" rows="4" placeholder="DUPONT Marie&#10;MARTIN Léo"></textarea></label><button class="btn sm" data-act="clcoller">Importer la liste collée</button></section>
  ${C.length?C.map(c=>{const L=P.classesL[c];return `<section class="card"><h3>${esc(c)} <span class="cls ${L.cy==='T'?'t':'s'}">${CYC[L.cy||'S'].label}</span> <span class="small muted">· ${L.eleves.length} élèves</span></h3>
    <div class="row wrap"><label>Niveau<select class="in sel cl-cy" data-cl="${esc(c)}"><option value="S"${L.cy!=='T'?' selected':''}>Seconde</option><option value="T"${L.cy==='T'?' selected':''}>Terminale</option></select></label>
     <label style="flex:1 1 320px">Lien d’envoi en ligne (Nuage, « Demande de fichier ») — jamais visible par les élèves<input type="url" class="in cl-lien" style="max-width:none" data-cl="${esc(c)}" value="${esc(L.lien)}" placeholder="https://nuage03.apps.education.fr/s/…"></label></div>
    <div class="row wrap"><button class="btn pri" data-act="qrdem" data-v="${esc(c)}">QR de démarrage</button><button class="btn sm ghost" data-act="clsuppr" data-v="${esc(c)}">Retirer la liste</button></div>
    <details><summary class="small">Voir la liste</summary><ol class="small">${L.eleves.map(n=>`<li>${esc(n)}</li>`).join('')}</ol></details>
    <p class="small muted">Le QR contient la liste, le niveau, le lien et ta clé de copie de secours. Si tu changes la liste ou le lien, les groupes rescannent le nouveau QR (Groupe → Nouvelle liste de classe).</p></section>`}).join(''):''}
  <section class="card"><h3>Fin d’année</h3><p class="small muted">Télécharge une sauvegarde complète, puis vide l’outil pour la rentrée suivante.</p><button class="btn sm ghost" data-act="archiver">Archiver l’année et repartir à zéro</button></section>
  <p class="ver">Demi-fond · outil prof ${APP_VERSION} · lien de démonstration pour un collègue : <b>${esc(location.origin+location.pathname)}?demo</b></p>`;
}
/* ----- Importer ----- */
function vImport(){const n=Object.values(P.eleves).reduce((s,e)=>s+Object.keys(e.seances).length,0);
  return `${rappelArchive()}<section class="card"><h2>Récupérer les séances</h2><div class="grid2">
    <div class="sub"><h3>QR codes</h3><p class="small muted">En fin de séance, chaque élève montre son QR : scanne-les à la suite, la caméra reste ouverte. Les anciens QR du carnet numérique sont aussi acceptés.</p><button class="btn pri big" data-act="scanner">Scanner les QR codes</button></div>
    <div class="sub"><h3>Fichiers</h3><p class="small muted">Les fichiers .json déposés par les élèves, ou le dossier du Nuage téléchargé en .zip. Sur ordinateur, tu peux aussi les glisser ici.</p><label class="btn pri big" for="fic">Choisir des fichiers</label><input id="fic" type="file" multiple accept=".json,.zip,.txt,application/json,application/zip" hidden></div></div>
    <p>${n} séance${n>1?'s':''} d’élèves dans l’outil. Réimporter les mêmes fichiers ne crée pas de doublon.</p>
    ${P.journal.length?`<ul class="small">${P.journal.slice(0,6).map(j=>`<li>${new Date(j.d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · ${esc(j.t)}${j.err.length?`<ul>${j.err.slice(0,8).map(e=>`<li class="ko">${esc(e)}</li>`).join('')}</ul>`:''}</li>`).join('')}</ul>`:''}</section>
  ${ancienProf()?`<section class="card todo"><h3>Ancien carnet numérique</h3><p class="small">Le mode prof de l’ancien carnet contient ${ancienProf()} élève${ancienProf()>1?'s':''} sur cet appareil. Importe-les ici (séances, ★, notes AFL2/AFL3) : rien n’est effacé dans l’ancien carnet.</p><button class="btn pri" data-act="migrer">Importer l’ancien carnet</button></section>`:''}
  ${vSecours()}
  <section class="card"><h3>Passer de l’iPad au PC</h3><p class="small muted">Les données restent sur cet appareil. Exporte une sauvegarde, range-la dans ton espace personnel, puis restaure-la sur l’autre appareil.</p>
    <div class="row wrap"><button class="btn sm" data-act="sauvegarde">Exporter une sauvegarde</button><label class="btn sm" for="resto">Restaurer une sauvegarde</label><input id="resto" type="file" accept=".json" hidden><button class="btn sm ghost" data-act="effacer">Tout effacer</button></div></section>`}
/* copies de secours des carnets (chiffrées pour la clé du prof) */
async function ouvrirBrut(o){if(!P.cle)throw new Error('clé du professeur absente (restaure ta sauvegarde).');
  const priv=await crypto.subtle.importKey('jwk',P.cle.priv,{name:'ECDH',namedCurve:'P-256'},false,['deriveKey']);
  const pub=await crypto.subtle.importKey('raw',deb64(o.epk),{name:'ECDH',namedCurve:'P-256'},false,[]);
  const cle=await crypto.subtle.deriveKey({name:'ECDH',public:pub},priv,{name:'AES-GCM',length:256},false,['decrypt']);
  return crypto.subtle.decrypt({name:'AES-GCM',iv:deb64(o.iv)},cle,deb64(o.data))}
async function ouvrirSecours(o){let b;try{b=await ouvrirBrut(o)}catch(e){throw new Error(P.cle?'copie de secours chiffrée avec une autre clé (autre appareil prof ?).':'copie de secours : clé du professeur absente (restaure ta sauvegarde).')}return new TextDecoder().decode(b)}
async function importerSecours(o){const c=JSON.parse(await ouvrirSecours(o));if(!c.carnetDF)throw new Error('copie de secours illisible');
  P.secours=P.secours||{};const id=nk(o.classe)+'|'+(o.noms||[]).map(nk).sort().join('#'),old=P.secours[id];
  if(old&&old.date>o.date)return;P.secours[id]={classe:o.classe,noms:o.noms,seance:o.seance,date:o.date,epk:o.epk,iv:o.iv,data:o.data}}
function vSecours(){const L=Object.entries(P.secours||{}).filter(([,x])=>!P.classe||x.classe===P.classe).sort((a,b)=>a[1].noms.join().localeCompare(b[1].noms.join(),'fr'));
  return `<section class="card"><h3>Copies de secours des carnets ${P.classe?'· '+esc(P.classe):''}</h3>
    <p class="small muted">À chaque envoi en ligne, le carnet complet du groupe arrive aussi, chiffré : seul cet outil (ta clé) peut l’ouvrir. Tablette perdue ou effacée ? Télécharge le carnet ici puis, sur la nouvelle tablette : Groupe → « Reprendre un carnet ». Le groupe choisit un nouveau code.</p>
    ${L.length?`<ul class="wl">${L.map(([id,x])=>`<li><span><b>${x.noms.map(esc).join(' · ')}</b> <span class="small muted">${esc(x.classe)} · ${esc(String(x.seance||'').toUpperCase())} · ${esc(x.date)}</span></span><button class="btn sm" data-act="secours" data-v="${esc(id)}">Télécharger le carnet</button></li>`).join('')}</ul>`:'<p class="muted small">Aucune copie reçue pour l’instant (elles arrivent avec l’envoi en ligne, après le QR de démarrage).</p>'}
    ${P.cle?'':'<p class="small warn">La clé est créée au premier « QR de démarrage » : garde une sauvegarde de l’outil, sans elle les copies ne s’ouvrent plus.</p>'}</section>`}
async function telechargerSecours(id){const x=P.secours&&P.secours[id];if(!x)return;
  try{telecharger('Carnet_DF_'+slug(x.classe)+'_'+x.noms.map(n=>slug(prenomDe(n))).join('-')+'.json',await ouvrirSecours(x),'application/json')}catch(e){alert(e.message||e)}}
/* ancien carnet numérique (mode prof, même site) */
function ancienPDB(){try{const o=JSON.parse(localStorage.getItem('df2_prof_v1'));return o&&o.students?o:null}catch(e){return null}}
function ancienProf(){if(DEMO||P.migre)return 0;const o=ancienPDB();return o?Object.keys(o.students).length:0}
function migrerProf(){const o=ancienPDB();if(!o)return;let n=0;
  Object.entries(o.students).forEach(([ok,st])=>{const full=((st.prenom||'')+' '+String(st.nom||'').toUpperCase()).trim();if(!full||!st.classe)return;
    Object.entries(st.seances||{}).forEach(([sid,d])=>{if(!SBY[sid])return;const ts=Math.round(((st.recu||{})[sid]||Date.now())/1000);
      try{ajouterSeance({classe:st.classe,cy:st.cy||cyOfSid(sid),eleve:full,sexe:st.sexe,seance:sid,date:new Date(ts*1000).toISOString().slice(0,10),ts,src:'qr',vmaManuelle:st.vmaManuelle,d});n++}catch(e){}});
    const [k,e]=eleveDe(st.classe,full,st.cy);if(st.afl2&&!e.afl2)e.afl2=st.afl2;if(st.afl3&&!e.afl3)e.afl3=st.afl3;if(st.sexe&&!e.sexe)e.sexe=st.sexe;
    if(o.stars&&o.stars[ok])P.stars[k]=Object.assign({},o.stars[ok],P.stars[k]||{})});
  P.migre=Date.now();journal('Ancien carnet importé : '+n+' séance(s)');classeParDefaut();sauver();rendre()}
/* ----- Appel ----- */
const cleGroupe=L=>L.map(n=>cleEleve(P.classe,n)).sort().join('#');
function groupesAppel(sid){
  const K=eleves(),recu=new Set(K.filter(k=>P.eleves[k]&&P.eleves[k].seances[sid]));const L=sessOf(clsCy(P.classe)),i=L.findIndex(s=>s.id===sid);
  const env={};K.forEach(k=>{const e=P.eleves[k];const g=e&&e.groupe[sid];if(!g)return;const c=cleGroupe(g);const r=e.recu[sid]||{};(env[c]=env[c]||{noms:g,src:new Set,ts:0}).src.add(r.src==='qr'?'QR':'en ligne');env[c].ts=Math.max(env[c].ts,r.ts||0)});
  const manq={};K.forEach(k=>{if(recu.has(k))return;const e=P.eleves[k];if(!e)return;let g=null,s0=null;for(let j=i-1;j>=0&&!g;j--){if(e.groupe[L[j].id]){g=e.groupe[L[j].id];s0=L[j].n}}
    if(!g)return;const c=cleGroupe(g);(manq[c]=manq[c]||{noms:g,s:s0,qui:[]}).qui.push(k)});
  const E=Object.values(env),M=Object.values(manq);if(!E.length&&!M.length)return '';
  const h=t=>t?new Date(t*1000).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):'';
  return `<section class="card"><h3>Groupes · ${SBY[sid].n}</h3>
    ${M.length?`<p class="ko">⚠ Rien reçu de :</p><ul>${M.map(g=>`<li><b>${g.qui.map(k=>esc(nomAff(k))).join(' · ')}</b> <span class="small muted">(groupe en ${g.s} : ${g.noms.map(esc).join(', ')})</span></li>`).join('')}</ul><p class="small muted">Absents, ou envoi oublié ? Le carnet reste sur leur tablette : il suffit d’ouvrir la séance et d’envoyer (le rappel s’affiche chez eux).</p>`:''}
    ${E.length?`<p class="ok">✓ Ont envoyé :</p><ul class="small">${E.map(g=>`<li>${g.noms.map(esc).join(' · ')} — ${[...g.src].join(' + ')} ${h(g.ts)}</li>`).join('')}</ul>`:''}</section>`}
function vAppel(){if(!P.classe)return pasDeClasse('Appel');const cy=clsCy(P.classe),sid=seanceCourante(cy),K=eleves();const inList=new Set(liste().map(n=>cleEleve(P.classe,n)));
  const st=K.map(k=>[k,statut(k,sid)]);const cpt={};st.forEach(([,x])=>cpt[x.c]=(cpt[x.c]||0)+1);
  return `<section class="card"><h2>Appel · ${SBY[sid].n}</h2>${stripSeances(cy,sid)}
    <p>${Object.entries(cpt).map(([c,n])=>`<span class="badge st-${c}">${STATUTS[c]} : ${n}</span>`).join(' ')}</p>
    <div class="tw"><table class="tt l"><tr><th>Élève</th><th>Statut</th><th>Reçu</th><th>Corriger</th></tr>
    ${st.map(([k,x])=>{const e=P.eleves[k],r=e&&e.recu[sid];return `<tr class="st-${x.c}"><td><button class="lnk" data-act="fiche" data-k="${esc(k)}">${esc(nomAff(k))}</button>${inList.has(k)||!inList.size?'':' <span class="badge">hors liste</span>'}</td><td>${STATUTS[x.c]}${x.manuel?' <span class="small muted">(corrigé)</span>':''}</td><td class="small">${r?(r.src==='qr'?'QR':'en ligne')+(r.date?' · '+esc(dateFr(r.date)):''):'–'}</td>
      <td><select class="in sel" data-appel="${esc(k)}"><option value="">auto</option>${['present','retard','tenue','disp','absent','abj','oubli'].map(c=>`<option value="${c}"${x.manuel&&x.c===c?' selected':''}>${STATUTS[c]}</option>`).join('')}</select></td></tr>`}).join('')}</table></div>
    <p class="small muted">Auto : séance reçue = présent ; « absent » ou « blessé / dispensé » coché par le groupe = absent ou dispensé ; rien = rien reçu. « Hors liste » : nom absent de la liste Pronote, à fusionner depuis sa fiche.</p></section>${groupesAppel(sid)}`}
/* ----- Séance (classe entière) ----- */
function vSeance(){if(!P.classe)return pasDeClasse('Séance');const cy=clsCy(P.classe),sid=seanceCourante(cy),s=SBY[sid];
  return `<section class="card"><h2>${s.n} · ${esc(s.t)}</h2>${stripSeances(cy,sid)}
  <div class="tw"><table class="tt pt"><tr><th>Élève</th><th>Tenus</th><th>Écart</th><th>Coach a vu</th><th>Effort · charge</th><th>Rôle</th><th>Prochaine fois</th><th>Contrôle prof<br><small>${(B=>!B?'–':B[0]==='c500'?'temps 500 m':'distance (m)')(pronoTarget(s))}</small></th><th>★ AFL2</th><th>★ AFL3</th></tr>${eleves().map(k=>{const e=P.eleves[k];const d=e&&e.seances[sid];const sr=starOf(k,sid);
    const n0=`<th class="l"><button class="lnk" data-act="fiche" data-k="${esc(k)}">${e?nm(e):esc(nomAff(k))}</button>`;
    if(!d)return `<tr class="no">${n0}</th><td colspan="9">rien reçu</td></tr>`;if(d.st==='abs')return `<tr class="no">${n0}</th><td colspan="9">absent(e)</td></tr>`;
    const ct=ctrlDe(k,sid),cv=(P.ctrl&&P.ctrl[k]&&P.ctrl[k][sid])||'';
    const [t,n]=tenR(runOf(e),sid);const bl=d.bl||{};const cr=(bl.cr||[]).filter(Boolean).length;const ec=ecartOf(sid,d),e5=ecartT(sid,d);
    return `<tr>${n0}${d.st==='bl'?'<br><small>ne court pas</small>':''}${d.cx?'<br><small>coach : '+esc(d.cx.n)+'</small>':''}${d.ad?'<br><small>adapté</small>':''}</th><td><button class="cell" data-act="det" data-k="${esc(k)}" data-v="${sid}">${n?t+'/'+n:'✓'}</button></td><td>${ec!=null?R(ec)+' m':e5!=null?R(e5)+' s':'–'}</td><td>${cr}/3</td><td>${bl.rpe!=null&&bl.rpe!==''?'RPE '+esc(bl.rpe)+' · '+chargeOf(d)+' UA':'–'}</td><td>${esc(bl.role||'–')}</td><td class="l small">${esc(bl.nx||'')}</td>
     <td>${pronoTarget(s)&&!d.st?`<input class="in w" data-ctrl="${esc(k)}|${sid}" inputmode="decimal" value="${esc(cv)}" placeholder="${(B=>B[0]==='c500'?'2’05':'650')(pronoTarget(s))}">${ct&&ct.err!=null?`<br><small class="${ct.err<=5?'ok':'ko'}">coach ${ct.T?fT(ct.r):R(ct.r)+' m'} · ±${fc(ct.err)} %</small>`:''}`:'–'}</td>
     <td><button class="star ${sr.a2?'on':''}" data-act="star" data-k="${esc(k)}" data-v="${sid}|a2">★</button></td><td><button class="star ${sr.a3?'on':''}" data-act="star" data-k="${esc(k)}" data-v="${sid}|a3">★</button></td></tr>`}).join('')}</table></div>
  <p class="small muted">Touche le nombre de projets tenus pour le détail de la séance. <b>Contrôle prof</b> : mesure toi-même une course par séance (un ou deux élèves suffisent) ; l’écart avec la mesure de son coach sert à l’AFL3 et à repérer les données fausses. ★ = observation du prof pour l’AFL2 / l’AFL3 (reprise dans l’onglet Note).</p></section>`}
/* ----- Élèves : tableau du cycle ----- */
/* Colonnes « coach, écart, blanche, AFL1 » : repliées par défaut (une ligne par élève), réglage gardé sur l'appareil */
let EL_PLUS=(()=>{try{return localStorage.getItem('dfp-eleves-plus')==='1'}catch(e){return false}})();
document.addEventListener('click',ev=>{if(!ev.target.closest('[data-elplus]'))return;EL_PLUS=!EL_PLUS;try{localStorage.setItem('dfp-eleves-plus',EL_PLUS?'1':'0')}catch(e){}const y=scrollY;render();scrollTo(0,y)});
function vEleves(){if(!P.classe)return pasDeClasse('Élèves');const cy=clsCy(P.classe),L=sessOf(cy),ev=cy==='T'?['t7','t9']:['s6','s8'];
  const al=alertes(P.classe),plus=EL_PLUS;
  return `<section class="card"><h2>Élèves · ${esc(P.classe)}</h2>${al.length?`<details class="alerts" open><summary>⚠ ${al.length} point${al.length>1?'s':''} d’attention</summary><ul>${al.map(a=>`<li><span>${ICA[a[0]]}</span>${a[1]}</li>`).join('')}</ul></details>`:''}
  <div class="row wrap noprint"><button class="btn sm" type="button" data-elplus="1" aria-pressed="${plus}">${plus?'Moins de colonnes':'Plus de colonnes : écart, coach, blanche, AFL1'}</button></div>
  <div class="tw"><table class="tt pt${plus?'':' compact'}"><tr><th>Élève</th><th>VMA</th>${L.map(s=>`<th>${s.n}</th>`).join('')}<th>Projets tenus</th>${plus?'<th>Écart<br><small>début → fin</small></th><th>Comme coach</th><th>Blanche</th><th>AFL1</th>':''}</tr>
  ${eleves().map(k=>{const e=P.eleves[k];if(!e)return `<tr class="no"><th class="l">${esc(nomAff(k))}</th><td colspan="${L.length+(plus?6:2)}">rien reçu</td></tr>`;const run=runOf(e);const [TT,N]=totaux(e);const dg=degreeOf(TT,N);
    const b6=aflOf(run,e.seances[ev[0]],cy),e8=aflOf(run,e.seances[ev[1]],cy);
    return `<tr><th class="l"><button class="lnk" data-act="fiche" data-k="${esc(k)}">${nm(e)}</button></th><td>${fV(vmaDe(e))}</td>${L.map(s=>{const d=e.seances[s.id];const st=statut(k,s.id).c;if(!d)return `<td class="no">${st==='abj'||st==='absent'?'abs':st==='oubli'?'oubli':'·'}</td>`;const [t,n]=tenR(run,s.id);const sr=starOf(k,s.id);
      if(d.st)return `<td class="abs"><button class="cell" data-act="det" data-k="${esc(k)}" data-v="${s.id}">${d.st==='abs'?'abs':'disp'}</button></td>`;
      return `<td class="yes ${n?heat(t/n):''}"><button class="cell" data-act="det" data-k="${esc(k)}" data-v="${s.id}">${n?sig(t/n)+t+'/'+n:'✓'}${d.ad?(plus?'<i>adapté</i>':'<i title="pratique adaptée">ad.</i>'):''}${d.cx?(plus?'<i>coach ↺</i>':'<i title="coach remplacé">↺</i>'):''}${d.vj?(plus?'<i>VMA ✎</i>':'<i title="VMA modifiée">✎</i>'):''}${sr.a2?'<i>★2</i>':''}${sr.a3?'<i>★3</i>':''}</button></td>`}).join('')}
     <td class="${N?heat(TT/N):''}">${N?(plus?sig(TT/N)+TT+'/'+N+' · '+R(100*TT/N)+' %<br><small>degré '+dg+'</small>':`<span title="${TT}/${N} · degré ${dg}">${sig(TT/N)}${R(100*TT/N)} %</span>`):'–'}</td>${plus?`<td>${ecTrend(e)}</td><td>${coachTxt(k)}</td><td>${fc(b6&&b6.tot)}</td><td>${fc(e8&&e8.tot)}</td>`:''}</tr>`}).join('')}</table></div>
  <p class="muted small">Case = projets tenus / tentés · ✓✓ ¾ et plus, ✓ ½, ! ¼, ✗ moins. ↺ coach remplacé, ad. pratique adaptée, ✎ VMA modifiée. Touche une case pour le détail, un nom pour la fiche (courbes, coach, écart).</p></section>`}
/* ----- Fiche élève ----- */
function vFiche(){const k=P.eleve,e=P.eleves[k];if(!e){P.vue='eleves';return vEleves()}
  const cy=e.cy,L=sessOf(cy),run=runOf(e);const [TT,N]=totaux(e);const dg=degreeOf(TT,N);const autres=eleves().filter(x=>x!==k);
  /* courbes : on réutilise l'écran « Ma progression » du carnet sur un groupe d'un seul élève */
  DB.binomes=[{id:'fiche',cy,runners:[Object.assign({prenom:e.prenom,nom:e.nom},run)]}];V={bin:'fiche',v:'prog'};
  const prog=progView().replace('<h2>Ma progression</h2>','').replace(/<h3>[^<]*<\/h3>/,'');
  return `<div class="row wrap"><button class="btn sm" data-act="vue" data-v="eleves">← Élèves</button><button class="btn sm" data-act="imprimer">Imprimer la fiche</button></div>
  <section class="card"><h2>${nm(e)} <span class="cls ${cy==="T"?"t":"s"}">${esc(e.classe)} · ${CYC[cy].label}</span></h2>
   <div class="outs">${out('VMA',fV(vmaDe(e))+' km/h')}${out('Projets tenus',N?TT+' / '+N+' ('+R(100*TT/N)+' %)':'–','hi')}${out('Degré AFL2',dg?DEG_TXT[dg]:'–')}${out('Comme coach',coachTxt(k))}${out('Écart début → fin',ecTrend(e))}${out('Sexe',e.sexe==='F'?'fille':e.sexe==='G'?'garçon':'?')}${(([rt,tn])=>rt||tn?out('Retards · tenue',rt+' · '+tn):'')(tenueRetard(k,e.classe))}</div>
   ${e.sexe?'':`<p class="warn small">Fille ou garçon ? (barèmes différents) <button class="btn sm" data-act="sexe" data-k="${esc(k)}" data-v="F">Fille</button> <button class="btn sm" data-act="sexe" data-k="${esc(k)}" data-v="G">Garçon</button></p>`}</section>
  <section class="card"><h3>Séances</h3><div class="tw"><table class="tt l"><tr><th>Séance</th><th>Statut</th><th>Tenus</th><th>Reçu</th><th>Groupe · coach</th><th>Ce que dit le coach</th></tr>${L.map(s=>{const d=e.seances[s.id],st=statut(k,s.id),r=e.recu[s.id];const [t,n]=d?tenR(run,s.id):[0,0];const bl=(d&&d.bl)||{};
    return `<tr><th>${s.n}</th><td>${STATUTS[st.c]}</td><td>${d&&!d.st?`<button class="cell" data-act="det" data-k="${esc(k)}" data-v="${s.id}">${n?t+'/'+n:'✓'}</button>`:'–'}</td><td class="small">${r?(r.src==='qr'?'QR':'en ligne')+' '+esc(dateFr(r.date)):'–'}</td><td class="small">${(e.groupe[s.id]||[]).map(x=>esc(prenomDe(x))).join(', ')}${e.coach[s.id]?' · coach '+esc(prenomDe(e.coach[s.id].n))+(e.coach[s.id].rep?' (remplaçant)':''):''}</td><td class="small">${esc(bl.reu||'')}${bl.con?' · '+esc(bl.con):''}</td></tr>`}).join('')}</table></div></section>
  <section class="card">${prog}</section>
  <section class="card"><h3>QR de reprise</h3><p class="small muted">Tablette perdue, code oublié, changement de groupe sans l’ancienne tablette : ce QR rend à l’élève toutes les séances que tu as reçues. Dans son groupe : Groupe → « Scanner le QR de l’élève ».</p><button class="btn pri" data-act="reprise" data-k="${esc(k)}">Afficher le QR de reprise</button></section>
  ${autres.length?`<section class="card"><h3>Même élève sous un autre nom ?</h3><p class="small muted">Si ${esc(e.full)} apparaît aussi avec une faute de frappe, fusionne les deux.</p>
    <div class="row wrap"><select id="fusion" class="in sel"><option value="">— Choisir —</option>${autres.map(a=>`<option value="${esc(a)}">${esc(nomAff(a))}</option>`).join('')}</select><button class="btn sm" data-act="fusionner">Fusionner dans ${esc(e.prenom)}</button></div></section>`:''}`}
async function qrReprise(k){const e=P.eleves[k];const se={};Object.entries(e.seances).forEach(([sid,d])=>{if(hasData(d))se[sid]=d});
  const txt=await DFQR.encoder({a:'DFE',v:1,t:'T',c:e.classe,y:e.cy,e:e.full,x:e.sexe||'',vm:e.vmaManuelle||'',se});
  qrPlein(esc(e.full)+' · reprise','Appli élève : Groupe → « Scanner le QR de l’élève »',morceaux(txt))}
function detail(k,sid){const e=P.eleves[k];const d=e.seances[sid];const s=SBY[sid];const run=runOf(e);const T=sid[0]==='t';
  const [t,n]=tenR(run,sid);const a=s.eval?aflOf(run,d,T?'T':'S'):null;const bl=d.bl||{};const L=[];const vma=vmaOf(run,sid);const f=x=>esc(x==null||x===''?'–':x);
  if(d.i36)L.push(['36"/36"',d.i36.map(x=>x||'·').join(' ')]);
  if(d.al)L.push(['4 allures (annonce/réalisé)',d.al.map(r=>r?(r.an||'·')+'/'+(r.re||'·'):'·').join(' · ')]);
  if(d.ct)L.push(['Contrat de tours',d.ct.map(r=>r?(r.c||'·')+'/'+(r.r||'·'):'·').join(' · ')]);
  if(d.ra)L.push(['Récup active',f(d.ra)+' grands plots']);if(d.ra2)L.push(['Récup active',f(d.ra2)+' m']);
  if(d.m130)L.push(['1’30 mesuré',fM(tp(d.m130.t,d.m130.p))]);
  ['c3','c3b'].forEach(c=>{if(d[c])L.push([c==='c3b'?'3’ n°2':'3’','visé '+f(d[c].v)+' · réalisé '+fM(c3dist(d[c]))+' · 2e−1re '+(c3reg(d[c])==null?'–':R(c3reg(d[c]))+' m')+(d[c].lt?' · tours '+d[c].lt.map(fT).join(' '):'')])});
  ['p','p2'].forEach(pk=>{if(d[pk]){const z=T?zoneT(num(d[pk].ec)):zoneS(num(d[pk].ec));L.push(['1’30 projet','projet '+f(d[pk].proj)+' m · réalisé '+fM(p130real(d[pk]))+' · '+(z?z[1]:'–')])}});
  if(d.rlv||d.rlt)L.push(['Relais 5 km','visé '+f(d.rlv)+' · réalisé '+f(d.rlt)]);
  ['r1','e1','e2'].forEach(c=>{if(d[c])L.push([c==='r1'?'500 m':'500 m '+c.toUpperCase().replace('E','C'),'visé '+f(d[c].tp)+' · passage 250 '+f(d[c].ps)+' · temps '+f(d[c].t)])});
  if(d.tr)L.push(['Allures au tour',d.tr.map((r,i)=>r?((i<4?[8,10,12,14][i]:r.v||'?')+' → '+(r.t||'·')):'·').join(' · ')]);
  if(d.ts)L.push(['Test 36"/24"',d.ts.map(x=>x||'·').join(' ')+' → VMA '+fV(testVma(d.ts))]);if(d.rt)L.push(['Re-test 36"/24"',d.rt.map(x=>x||'·').join(' ')+' → VMA '+fV(testVma(d.rt))]);
  if(d.s)L.push(['Série (réalisé)',d.s.map(r=>r&&r.tr||'·').join(' · ')]);if(d.c112)L.push(['1’12 : coupelles',d.c112.map(x=>x||'·').join(' · ')]);
  if(d.at)L.push(['Atelier '+f(d.at.ch),(d.at.r||[]).map(x=>x==='ok'?'✓':x==='ko'?'✗':'·').join(' ')]);
  if(d.pf)L.push(['Point faible',esc(d.pf.join(', '))+(d.pfw?' · '+esc(d.pfw):'')]);
  if(d.rep)L.push(['Répartition AFL2/AFL3',esc(d.rep)+(d.repw?' · '+esc(d.repw):'')]);
  if(d.mi)L.push(['Ma séance',f(d.mi.th)+' · '+f(d.mi.pb)+'<br>'+((d.mi.x||[]).filter(Boolean).map(x=>[x.e,x.dd,x.i&&x.i+' %',x.r,x.n&&'×'+x.n].filter(Boolean).map(esc).join(' ')).join('<br>'))]);
  if(d.r8)L.push(['Réalisation',d.r8.map(r=>r?(r.p||'·')+'/'+(r.r||'·'):'·').join(' · ')]);
  if(d.pfin)L.push(['Projet final','100 m '+f(d.pfin.c100)+' · C1 '+f(d.pfin.c1)+' · C2 '+f(d.pfin.c2)+' · 250 '+f(d.pfin.ps)+' · 1’30 '+f(d.pfin.p130)+' m']);
  if(d.situe)L.push(['Se situe','AFL2 degré '+f(d.situe.a2)+' · AFL3 degré '+f(d.situe.a3)]);
  {const EN={reg:{ok:'régulière',vite:'partie trop vite',lent:'trop prudente'},ress:{aise:'à l’aise',moyen:'ça allait',dur:'en difficulté'},rec:{vite:'récup rapide',lent:'récup lente'}};
   [['en','Entre deux courses'],['en2','Entre C2 et C3']].forEach(([k,t])=>{const e=d[k];if(e&&typeof e==='object'){const x=['reg','ress','rec'].map(q=>EN[q][e[q]]).filter(Boolean);if(x.length)L.push([t,esc(x.join(' · '))])}})}
  if(d.wc||d.warm)L.push(['Échauffement',(d.wc||[]).map(c=>esc(WARM_NAME[c]||c)).join(', ')+(d.wx?' · '+esc(d.wx):'')+(d.warm?' '+d.warm.filter(Boolean).map(esc).join(' / '):'')+(d.rc?'<br>Récup : '+esc(d.rc)+(d.rc2?' / '+esc(d.rc2):''):'')]);
  if(d.aj)L.push(['Ajustement',esc(d.aj)]);if(d.pe)L.push(['Projets évaluation','3’ '+f(d.pe.v3)+' m · 1’30 '+f(d.pe.p)+' m · '+esc(d.pe.why||'')]);
  if(d.ad)L.unshift(['Présence','pratique adaptée (tolérances élargies)']);if(d.st)L.unshift(['Présence',ST_TXT[d.st]+(d.mot?' · '+esc(d.mot):'')]);
  if(d.vj)L.unshift(['VMA du jour','⚠ modifiée par l’élève : '+esc(d.vj)+' km/h (mesurée : '+fV(vma)+')']);if(d.cx)L.unshift(['Coach remplaçant',esc(d.cx.n)+' · '+esc(WHY_TXT[d.cx.why]||'')]);
  modal(`<h2>${esc(e.full)} · ${s.n}</h2><p class="muted small">VMA ${fV(vma)} km/h · projets tenus ${n?t+'/'+n:'–'}${a&&a.tot!=null?' · AFL1 '+a.tot+'/12':''}</p>
   <table class="tt l">${L.map(l=>`<tr><th>${l[0]}</th><td>${l[1]}</td></tr>`).join('')}
   <tr><th>Coach a vu</th><td>${s.crit.map((c,i)=>(bl.cr&&bl.cr[i]?'☑ ':'☐ ')+esc(c)).join('<br>')}</td></tr>
   <tr><th>Réussite / conseil</th><td>${esc(bl.reu||'–')} / ${esc(bl.con||'–')}</td></tr><tr><th>Effort · charge</th><td>${bl.rpe!=null&&bl.rpe!==''?'RPE '+esc(bl.rpe)+' · '+chargeOf(d)+' UA':'–'}${bl.fc?' · '+esc(bl.fc)+' bpm':''}</td></tr>
   <tr><th>Coach</th><td>pronostic ${esc(bl.pr||'–')}${pronoErr(s,d)!=null?' (±'+R(pronoErr(s,d))+' %)':''} · conseil utile : ${bl.aide==='1'?'oui':bl.aide==='0'?'non':'–'}</td></tr>
   <tr><th>Rôle · prochaine fois</th><td>${esc(bl.role||'–')} · ${esc(bl.nx||'')}</td></tr></table><div class="row wrap"><button class="btn" data-act="closem">Fermer</button></div>`)}
/* ----- Note ----- */
const AFLMAX=(cy,e)=>{if(cy!=='T')return [4,4];const rep=(e.seances.t9&&e.seances.t9.rep)||(e.seances.t7&&e.seances.t7.rep)||'4/4';const m=String(rep).split('/').map(Number);return m.length===2&&m.every(x=>!isNaN(x))?m:[4,4]};
const arr=(x,p)=>Math.round(x/(p||0.5))*(p||0.5);
/* AFL2 « se préparer et s'entraîner » : 2 points sur les projets tenus (gestion de l'allure séance après séance),
   le reste sur la préparation : échauffement complet aux épreuves, projets ambitieux, régulation écrite
   (ajustement, point faible, projets finaux, « la prochaine fois »). ★ AFL2 du prof : +0,5 à partir de 2. */
const FR=[0.25,0.5,0.75,1];
function prepa(e){const run=runOf(e),L=sessOf(e.cy);const ech=[],amb=[],reg=[];
  L.forEach(s=>{const d=e.seances[s.id];if(!hasData(d)||d.st)return;const c=ctx(run,s.id,d);
    s.blocks.map(bk).forEach(([ty,a1])=>{
      if(ty==='warm'||ty==='warmT'){const wc=d.wc||[];ech.push(WARM_EX.filter(G=>G.some(x=>wc.includes(x[0]))).length/3)}
      if((ty==='p130'&&num(d[a1]&&d[a1].proj)!=null)||(ty==='c3'&&num(d[a1]&&d[a1].v)!=null)||(ty==='c500'&&parseT(d[a1]&&d[a1].tp)!=null))amb.push(ambition(ty,c,a1)?1:0);
      if(ty==='txt')reg.push(String(d[a1]||'').trim().length>=8?1:0);
      if(ty==='pf'||ty==='pfT')reg.push(d.pf&&d.pf.length?1:0);
      if(ty==='pe')reg.push(d.pe&&(d.pe.v3||d.pe.p)?(d.pe.why?1:0.5):0);
      if(ty==='mine')reg.push(d.mi&&d.mi.th&&(d.mi.x||[]).some(Boolean)?1:0);
      if(ty==='pfin')reg.push(d.pfin&&Object.values(d.pfin).some(Boolean)?1:0)});
    if(voit('nx',s))reg.push(String((d.bl||{}).nx||'').trim().length>=5?1:0)});
  const parts=[['échauffement',moy(ech)],['projets ambitieux',moy(amb)],['régulation écrite',moy(reg)]].filter(x=>x[1]!=null);
  return parts.length?{v:moy(parts.map(x=>x[1])),parts}:null}
function sugAFL2(e,cy){const [T,N]=totaux(e);const dg=degreeOf(T,N);const mx=AFLMAX(cy,e)[0],mt=Math.min(2,mx/2),mp=mx-mt;const pr=prepa(e);if(!dg&&!pr)return null;
  const st=Object.values(P.stars[cleEleve(e.classe,e.full)]||{}).filter(x=>x.a2).length;
  const a=dg?mt*FR[dg-1]:0,b=pr?mp*pr.v:0;
  return {v:Math.min(mx,arr(a+b+(st>=2?0.5:0))),d:`tenus ${fc(arr(a,0.25))}/${fc(mt)} · prépa ${fc(arr(b,0.25))}/${fc(mp)}${pr?' ('+pr.parts.map(x=>x[0]+' '+R(x[1]*100)+' %').join(', ')+')':''}${st>=2?' · ★ +0,5':''}`}}
/* AFL3 « coacher » : fiabilité mesurée par le contrôle du prof (poids 2), justesse du pronostic (poids 1),
   conseil jugé utile par le coureur (poids ½ : avis d'un camarade, souvent complaisant). ★ AFL3 : +0,5 à partir de 2. */
function sugAFL3(k,e,cy){const c=coachDe(k);const st=Object.values(P.stars[k]||{}).filter(x=>x.a3).length;if(!c||(!c.nf&&!c.tot&&c.err==null))return null;
  const sc=x=>x<=2?1:x<=5?0.75:x<=10?0.5:0.25;const W=[];if(c.nf)W.push([sc(c.fiab),2]);if(c.err!=null)W.push([sc(c.err/2),1]);if(c.tot)W.push([c.yes/c.tot,0.5]);
  const r=W.reduce((s,x)=>s+x[0]*x[1],0)/W.reduce((s,x)=>s+x[1],0);const dg=r>=0.85?4:r>=0.65?3:r>=0.4?2:1;const mx=AFLMAX(cy,e)[1];
  return {v:Math.min(mx,arr(mx*FR[dg-1]+(st>=2?0.5:0))),d:[c.nf?'contrôle ±'+fc(c.fiab)+' %':'pas de contrôle prof',c.err!=null?'pronostic ±'+c.err+' %':'',c.tot?'aide '+c.yes+'/'+c.tot:''].filter(Boolean).join(' · ')+(st>=2?' · ★ +0,5':'')}}
function vNote(){if(!P.classe)return pasDeClasse('Note');const cy=clsCy(P.classe),T=cy==='T',ev=T?['t7','t9']:['s6','s8'];
  return `${cy==='T'?carteCCF('Épreuve T9 (CCF).'):''}<section class="card"><h2>Note · ${esc(P.classe)} · ${CYC[cy].label}</h2>
  <p class="small muted">AFL1 /12 calculé depuis l’épreuve (${T?'T9 : 500 m, 500 m puis 1’30':'S8 : 3’ puis 1’30 avec projet'}) et les barèmes. <b>Suggestions</b> (c’est toi qui décides : « ← » reprend la suggestion) — AFL2 : 2 points sur les projets tenus, le reste sur la préparation (échauffement complet aux épreuves, projets ambitieux, régulation écrite). AFL3 : fiabilité du coach mesurée par tes contrôles (onglet Séance), justesse de ses pronostics, et un peu l’avis du coureur. ★ : +0,5 à partir de deux.${T?' En Terminale, AFL2 + AFL3 = 8 points répartis selon le choix de l’élève (6/2, 4/4 ou 2/6).':''}</p>
  <div class="tw"><table class="tt pt"><tr><th>Élève</th><th>Blanche ${ev[0].toUpperCase()}</th><th>AFL1 /12</th>${T?'<th>Répart.</th>':''}<th>AFL2</th><th>AFL3</th><th>/20</th></tr>
  ${eleves().map(k=>{const e=P.eleves[k];if(!e)return `<tr class="no"><th class="l">${esc(nomAff(k))}</th><td colspan="${T?6:5}">rien reçu</td></tr>`;const run=runOf(e);const b6=aflOf(run,e.seances[ev[0]],cy),e8=aflOf(run,e.seances[ev[1]],cy);
    const mx=AFLMAX(cy,e);const s2=sugAFL2(e,cy),s3=sugAFL3(k,e,cy);const a2=num(e.afl2),a3=num(e.afl3);const tot=e8&&e8.tot!=null&&a2!=null&&a3!=null?R((e8.tot+a2+a3)*10)/10:null;
    const cel=(f,v,sg,m)=>`<td class="l"><input class="in w" data-af="${esc(k)}|${f}" inputmode="decimal" value="${esc(v||'')}" placeholder="/${m}">${sg?`<button class="lnk small" data-act="sug" data-k="${esc(k)}" data-v="${f}|${sg.v}" title="Reprendre la suggestion">← ${fc(sg.v)}</button><br><small class="muted">${sg.d}</small>`:''}</td>`;
    return `<tr><th class="l"><button class="lnk" data-act="fiche" data-k="${esc(k)}">${nm(e)}</button>${e.sexe?'':'<br><small class="warn">sexe ?</small>'}</th><td>${fc(b6&&b6.tot)}</td><td><b>${fc(e8&&e8.tot)}</b>${e8&&e8.tot!=null?`<br><small>${T?'perf. '+fc(e8.perf)+' + zone '+fc(e8.z):'3’ '+fc(e8.n3)+' · 1’30 '+fc(e8.n1)+' · zone '+fc(e8.z)+' · régul. '+fc(e8.rg)}</small>`:''}</td>${T?`<td>${mx.join('/')}</td>`:''}${cel('afl2',e.afl2,s2,mx[0])}${cel('afl3',e.afl3,s3,mx[1])}<td><b>${fc(tot)}</b></td></tr>`}).join('')}</table></div></section>`}
/* ----- Pilotage ----- */
function vPilotage(){if(!P.classe)return pasDeClasse('Pilotage');const cy=clsCy(P.classe),L=sessOf(cy),K=eleves();const al=alertes(P.classe);
  const G={G1:[],G2:[],G3:[],G4:[],'?':[]};K.forEach(k=>{const e=P.eleves[k];const v=e?vmaDe(e):null;G[grpVit(v)||'?'].push([k,v])});
  const recus=L.map(s=>K.filter(k=>P.eleves[k]&&P.eleves[k].seances[s.id]).length);
  const moy=L.map(s=>{const v=K.map(k=>{const e=P.eleves[k];const d=e&&e.seances[s.id];if(!d||d.st)return null;const [t,n]=tenR(runOf(e),s.id);return n?t/n:null}).filter(x=>x!=null);return v.length?v.reduce((a,x)=>a+x,0)/v.length:null});
  const rpe=L.map(s=>{const v=K.map(k=>{const e=P.eleves[k];const d=e&&e.seances[s.id];return d&&!d.st?num((d.bl||{}).rpe):null}).filter(x=>x!=null);return v.length?R(v.reduce((a,x)=>a+x,0)/v.length*10)/10:null});
  return `<section class="card"><h2>Pilotage · ${esc(P.classe)}</h2>
   <div class="tw"><table class="tt"><tr><th></th>${L.map(s=>`<th>${s.n}</th>`).join('')}</tr><tr><th class="l">Séances reçues</th>${recus.map(n=>`<td>${n}/${K.length}</td>`).join('')}</tr>
   <tr><th class="l">Projets tenus (moyenne)</th>${moy.map(x=>`<td>${x==null?'–':R(x*100)+' %'}</td>`).join('')}</tr><tr><th class="l">Effort ressenti (moyenne)</th>${rpe.map(x=>`<td>${fc(x)}</td>`).join('')}</tr></table></div>
   ${barTenus(L.map(s=>s.n),moy)}</section>
  <section class="card"><h3>Groupes de vitesse (VMA la plus récente)</h3><p class="small muted">G1 moins de 10 km/h · G2 10 à 11,5 · G3 12 à 13,5 · G4 14 et plus. Les deux membres d’un binôme doivent être dans des groupes différents (S3).</p>
   <div class="grid2">${Object.entries(G).filter(([g,L])=>L.length).map(([g,L])=>`<div class="sub"><h3>${g==='?'?'VMA inconnue':g} <span class="small muted">· ${L.length}</span></h3><p class="small">${L.map(([k,v])=>esc(nomAff(k))+(v?' <span class="muted">'+fV(v)+'</span>':'')).join('<br>')}</p></div>`).join('')}</div></section>
  <section class="card"><h3>Points d’attention</h3>${al.length?`<ul class="alist">${al.map(a=>`<li><span>${ICA[a[0]]}</span>${a[1]}</li>`).join('')}</ul>`:'<p class="muted">Rien à signaler.</p>'}</section>`}
/* ----- Exporter ----- */
function csv(L){return '﻿'+L.map(l=>l.map(v=>{if(typeof v==='number')v=String(v).replace('.',',');v=v==null?'':String(v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(';')).join('\r\n')}
function vExport(){return `<section class="card"><h2>Exporter · ${esc(P.classe||'—')}</h2><p class="muted small">Fichiers .csv à ouvrir dans Excel ou LibreOffice (séparateur point-virgule).</p><div class="grid2">
  <div class="sub"><h3>Bilan et note</h3><p class="small muted">Une ligne par élève : VMA, projets tenus par séance, ★, AFL1 (blanche et épreuve), AFL2, AFL3, total /20.</p><button class="btn pri" data-act="csv" data-v="bilan">Télécharger</button></div>
  <div class="sub"><h3>Séances</h3><p class="small muted">Une ligne par élève et par séance : statut, projets tenus, écart, effort, charge, coach, réussite, conseil.</p><button class="btn pri" data-act="csv" data-v="seances">Télécharger</button></div></div></section>`}
function exporter(type){if(!P.classe)return toast('Choisis une classe.');const cy=clsCy(P.classe),L=sessOf(cy),T=cy==='T',ev=T?['t7','t9']:['s6','s8'];let rows;
  if(type==='bilan'){rows=[['Classe','Nom','Prénom','Sexe','VMA','Projets tenus','Tentés','%','Degré AFL2',...L.map(s=>s.n+' tenus'),...L.map(s=>s.n+' ★AFL2'),...L.map(s=>s.n+' ★AFL3'),'Blanche AFL1',...(T?['Éval C1 500 m','Éval C2 500 m','Éval 1’30 m','Répartition']:['Éval 3’ m','Éval 1’30 m']),'Éval AFL1','AFL2','AFL3','Total /20','Retards','Oublis de tenue']];
    eleves().forEach(k=>{const e=P.eleves[k];if(!e)return;const run=runOf(e);const [TT,N]=totaux(e);const b6=aflOf(run,e.seances[ev[0]],cy),e8=aflOf(run,e.seances[ev[1]],cy);const a2=num(e.afl2),a3=num(e.afl3);
      const ex=T?[e8&&e8.t1?fT(e8.t1):'',e8&&e8.t2?fT(e8.t2):'',e8&&e8.r130?R(e8.r130):'',AFLMAX(cy,e).join('/')]:[e8?R(e8.d3||0):'',e8?R(e8.r130||0):''];
      rows.push([e.classe,e.nom,e.prenom,e.sexe||'',fV(vmaDe(e)),TT,N,N?R(100*TT/N):'',degreeOf(TT,N)||'',...L.map(s=>{const x=tenR(run,s.id);return x[1]?x[0]+'/'+x[1]:(e.seances[s.id]&&e.seances[s.id].st)||''}),...L.map(s=>starOf(k,s.id).a2?1:''),...L.map(s=>starOf(k,s.id).a3?1:''),b6&&b6.tot!=null?b6.tot:'',...ex,e8&&e8.tot!=null?e8.tot:'',e.afl2||'',e.afl3||'',e8&&e8.tot!=null&&a2!=null&&a3!=null?R((e8.tot+a2+a3)*10)/10:'',...tenueRetard(k).map(x=>x||'')])})}
  else{rows=[['Classe','Élève','Séance','Date','Reçu par','Statut','Projets tenus','Tentés','Écart (m)','Écart 500 m (s)','VMA','Effort (RPE)','Charge (UA)','Coach','Coach remplaçant','Pratique adaptée','Réussite','Conseil','Prochaine fois']];
    eleves().forEach(k=>{const e=P.eleves[k];if(!e)return;L.forEach(s=>{const d=e.seances[s.id];if(!d)return;const r=e.recu[s.id]||{};const [t,n]=tenR(runOf(e),s.id);const bl=d.bl||{};const c=e.coach[s.id];
      const sm=statut(k,s.id);rows.push([e.classe,e.full,s.n,r.date||'',r.src==='qr'?'QR':'fichier',sm.manuel?STATUTS[sm.c]:d.st?ST_TXT[d.st]:'présent',n?t:'',n||'',(x=>x==null?'':R(x))(ecartOf(s.id,d)),(x=>x==null?'':R(x))(ecartT(s.id,d)),fV(vmaOf(runOf(e),s.id)),bl.rpe||'',chargeOf(d)||'',c?c.n:'',c&&c.rep?'oui':'',d.ad?'oui':'',bl.reu||'',bl.con||'',bl.nx||''])})})}
  telecharger('DF_'+slug(P.classe)+'_'+type+'.csv',csv(rows))}

/* ---------- Évènements ---------- */
document.addEventListener('click',async ev=>{
  const b=ev.target.closest('[data-act],[data-chp]');if(!b)return;const a=b.dataset.act,v=b.dataset.v,k=b.dataset.k;
  if(b.dataset.chp!==undefined){const p=CPRE[+b.dataset.chp];Object.assign(CH,{w:p[1],r:p[2],n:p[3],mid:p[4]});return rendre()}
  switch(a){
    case 'vue':P.vue=v;if(v!=='fiche')P.eleve=null;break;
    case 'seance':P.seance=v;break;
    case 'fiche':P.eleve=k;P.vue='fiche';window.scrollTo(0,0);break;
    case 'det':return detail(k,v);
    case 'closem':return closeModal();
    case 'reload':return location.reload();
    case 'star':{const [sid,w]=v.split('|');P.stars[k]=P.stars[k]||{};const s=P.stars[k][sid]=P.stars[k][sid]||{};s[w]=!s[w];sauver();const y=window.scrollY;rendre();window.scrollTo(0,y);return}
    case 'sug':{const [f,x]=v.split('|');P.eleves[k][f]=String(x).replace('.',',');sauver();const y=window.scrollY;rendre();window.scrollTo(0,y);return}
    case 'sexe':P.eleves[k].sexe=v;break;
    case 'scanner':{let n0=0;DFQR.scanner(async t=>{const r=await lireTexteQR(t);if(!String(r).startsWith('…')){n0++;sauver();beep()}return String(r).startsWith('…')?r:'✓ '+r},
      {continu:true,titre:'QR codes des élèves',aide:'Montre les QR un par un devant la caméra.',onClose:()=>{if(n0)journal(n0+' QR code'+(n0>1?'s':'')+' scanné'+(n0>1?'s':''));classeParDefaut();sauver();rendre();if(n0)proposerSauvegarde()}});return}
    case 'secours':return telechargerSecours(v);
    case 'migrer':return migrerProf();
    case 'sauvegarde':return sauvegarder();
    case 'effacer':if(DEMO)return toast('Pas disponible en démo.');if(!confirm('Effacer toutes les données de l’outil sur cet appareil ? (Exporte d’abord une sauvegarde.)'))return;P=vide();break;
    case 'csv':return exporter(v);
    case 'imprimer':return window.print();
    case 'qrdem':return qrDemarrage(v);
    case 'reprise':return qrReprise(k);
    case 'clcoller':return importerListe([],$('#cl-txt').value,$('#cl-nom').value.trim(),$('#cl-cy').value);
    case 'clsuppr':if(!confirm('Retirer la liste de la classe '+v+' ? (Les séances reçues sont gardées.)'))return;delete P.classesL[v];classeParDefaut();break;
    case 'archiver':{if(DEMO)return toast('Pas disponible en démo.');if(!confirm('Télécharger la sauvegarde de l’année puis tout effacer ?'))return;sauvegarder('DF_prof_archive_');
      setTimeout(()=>{if(confirm('La sauvegarde est-elle bien enregistrée ? Effacer maintenant ?')){const cle=P.cle;P=vide();P.cle=cle;sauver();rendre()}},800);return}
    case 'fusionner':{const src=$('#fusion').value,dst=P.eleve;if(!src)return;if(!confirm('Fusionner « '+nomAff(src)+' » dans « '+nomAff(dst)+' » ?'))return;
      const S=P.eleves[src],D=P.eleves[dst];if(S&&D){Object.keys(S.seances).forEach(sid=>{if(!D.seances[sid]||((S.recu[sid]||{}).ts||0)>((D.recu[sid]||{}).ts||0)){D.seances[sid]=S.seances[sid];D.recu[sid]=S.recu[sid];if(S.groupe[sid])D.groupe[sid]=S.groupe[sid];if(S.coach[sid])D.coach[sid]=S.coach[sid]}});
        if(!D.sexe)D.sexe=S.sexe;if(!D.vmaManuelle)D.vmaManuelle=S.vmaManuelle}
      if(P.ctrl&&P.ctrl[src]){P.ctrl[dst]=Object.assign({},P.ctrl[src],P.ctrl[dst]||{});delete P.ctrl[src]}
      if(P.stars[src]){P.stars[dst]=Object.assign({},P.stars[src],P.stars[dst]||{});delete P.stars[src]}
      /* le nom fusionné devient un alias : les prochains envois sous ce nom iront dans la bonne fiche */
      P.alias[src]=dst;delete P.eleves[src];break}
    case 'chgo':beep(700,60);return chStart();
    case 'chpause':{const r=CH.run;if(!r)return;if(r.paused){r.end=Date.now()+r.left*1000;r.paused=false}else r.paused=true;chSave();return rendre()}
    case 'chstop':chStop();return rendre();
    case 'demoQuitter':location.href=location.pathname;return;
    case 'demo':window.scrollTo(0,0);return ouvrirDemoProf();
    default:return;
  }
  sauver();rendre();
});
document.addEventListener('change',async ev=>{const t=ev.target;
  if(t.id==='selClasse'){P.classe=t.value;P.eleve=null;P.seance='';if(P.vue==='fiche')P.vue='eleves';sauver();return rendre()}
  if(t.id==='fic'&&t.files.length){await importerFichiers([...t.files]);t.value='';return}
  if(t.id==='cl-fic'&&t.files.length){try{await importerListe([...t.files],'',$('#cl-nom').value.trim(),$('#cl-cy').value)}catch(x){alert('Fichier illisible : '+(x.message||x))}t.value='';return}
  if(t.classList.contains('cl-lien')){const u=t.value.trim();if(u&&!/^https:\/\//.test(u)){alert('Le lien doit commencer par https://');return}P.classesL[t.dataset.cl].lien=u;sauver();return toast('Lien enregistré : refais afficher le QR de démarrage.')}
  if(t.classList.contains('cl-cy')){const c=t.dataset.cl;P.classesL[c].cy=t.value;Object.values(P.eleves).forEach(e=>{if(e.classe===c)e.cy=t.value});sauver();return rendre()}
  if(t.dataset.appel!=null){const id=nk(P.classe)+'|'+P.seance+'|'+t.dataset.appel;if(t.value)P.appel[id]=t.value;else delete P.appel[id];sauver();return rendre()}
  if(t.dataset.ctrl){const [k,sid]=t.dataset.ctrl.split('|');P.ctrl=P.ctrl||{};P.ctrl[k]=P.ctrl[k]||{};if(t.value.trim())P.ctrl[k][sid]=t.value.trim();else delete P.ctrl[k][sid];sauver();const y=window.scrollY;rendre();window.scrollTo(0,y);return}
  if(t.dataset.af){const [k,f]=t.dataset.af.split('|');P.eleves[k][f]=t.value.trim();sauver();const y=window.scrollY;rendre();window.scrollTo(0,y);return}
  if(['chw','chr','chn'].includes(t.id)){const v=Math.max(t.id==='chr'?0:1,R(num(t.value)||0));CH[{chw:'w',chr:'r',chn:'n'}[t.id]]=v;return rendre()}
  if(t.id==='chmid'){CH.mid=t.checked?1:0;return}if(t.id==='chvoice'){CH.voice=t.checked;return}
  if(t.id==='resto'&&t.files[0]){try{const o=JSON.parse(await t.files[0].text());if(!o.dfProf)throw 0;if(!confirm('Remplacer les données de cet appareil par cette sauvegarde ?'))return;delete o.dfProf;P=Object.assign(vide(),o);sauver();rendre()}catch(x){alert('Ce fichier n’est pas une sauvegarde de l’outil prof.')}}
});
['dragover','drop'].forEach(n=>document.addEventListener(n,e=>{e.preventDefault();if(n==='drop'&&e.dataTransfer.files.length){const F=[...e.dataTransfer.files];if(P.vue==='classes')importerListe(F,'',($('#cl-nom')||{}).value||'',($('#cl-cy')||{}).value||'');else{P.vue='import';importerFichiers(F)}}}));
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
if('serviceWorker' in navigator&&location.protocol==='https:'){let had=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had){const u=$('#upd');u.innerHTML='Nouvelle version de l’outil installée. <button class="btn sm" data-act="reload">Recharger</button>';u.classList.add('on')}had=true});
  navigator.serviceWorker.register('sw.js').then(r=>r.update().catch(()=>{})).catch(()=>{})}

/* chrono qui reprend après rechargement : on rouvre son écran */
function chOuvrir(){P.vue='chrono'}
