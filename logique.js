/* =====================================================================
   logique.js — Demi-fond : calculs (VMA, projets tenus, zones, AFL1), formats de fichiers et noms.
   COMMUN à l'appli élève et à l'outil prof : garder la même version dans les deux dépôts.
   ===================================================================== */
'use strict';
/* ---- calculs (identiques à l'outil de cycle) ---- */
const R=x=>Math.floor(x+0.5);
const tSec=(d,v)=>d*3.6/v, dist=(s,v)=>v/3.6*s;
const fP=n=>String(R(n*2)/2).replace('.',',');
const fV=v=>v==null||isNaN(v)?'–':(R(v*10)/10).toFixed(1).replace('.',',');
const fM=m=>m==null||isNaN(m)?'–':R(m)+' m';
const fT=s=>{if(s==null||isNaN(s))return '–';s=R(s);const m=Math.floor(s/60),r=s%60;return m?m+'’'+String(r).padStart(2,'0'):r+'"'};
const num=v=>{if(v===''||v==null)return null;const n=parseFloat(String(v).replace(',','.'));return isNaN(n)?null:n};
function parseT(v){if(v===''||v==null)return null;if(typeof v==='number')return v;const s=String(v).trim();
  const m=/^(\d+)\s*[’'′:h.,]\s*(\d{1,2})?\s*"?$/.exec(s);if(m)return (+m[1])*60+(+(m[2]||0));const n=parseFloat(s.replace(',','.'));return isNaN(n)?null:n}
function noteS(arr,m){let n=0;BAR2[arr].forEach((d,i)=>{if(m!=null&&m>=d)n=BAR2.notes[i]});return n}
function zoneS(e){if(e==null||isNaN(e))return null;if(Math.abs(e)<=5)return [3,'Zone 4'];if(e>5&&e<=15)return [2,'Zone 3'];if(e<-5&&e>=-15)return [1,'Zone 2'];return [0,'Zone 1']}
function note500(sx,sec){const L=BAR[sx+'500'].map(parseT);let n=0;L.forEach((t,i)=>{if(sec!=null&&sec<=t)n=BAR.notes[i]});return n}
function note130(sx,m){const L=BAR[sx+'130'];let n=0;L.forEach((d,i)=>{if(m!=null&&m>=d)n=BAR.notes[i]});return n}
function zoneT(e){if(e==null||isNaN(e))return null;if(Math.abs(e)<=5)return [4,'Zone 4'];if(e>5&&e<=15)return [3,'Zone 3'];if(e<-5&&e>=-15)return [2,'Zone 2'];if(e>15)return [1,'Zone 1 (trop loin)'];return [0.5,'Zone 1 (trop court)']}
const tp=(t,p)=>{const a=num(t),b=num(p);if(a==null&&b==null)return null;return (a||0)*200+(b||0)};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').trim().toLowerCase();

/* ---- VMA de travail d'un coureur à une séance ---- */
function vmaOf(run,sid){
  const cy=cyOfSid(sid),L=sessOf(cy),i=L.findIndex(s=>s.id===sid),se=run.seances||{};
  /* Seconde : « VMA de travail » = VITESSE DU 3’ (distance ÷ 50), référence des cibles d'épreuve.
     Pour les récupérations et les séries marquées 'E' : VMA estimée = vitesse du 3’ × 0,86 (VMA_3). */
  if(cy==='S'){const v6=se.s6&&c3dist(se.s6.c3);if(i>=6&&v6)return v6/50;
    const v2=se.s2&&c3dist(se.s2.t3m);if(i>=1&&v2)return v2/50;
    const al=se.s1&&se.s1.al;const v1=al&&al[3]?num(al[3].re):null;return v1||num(run.vmaManuelle)||null}
  /* Terminale : test 36"/24" en T2, re-test en T5 (anciens carnets : T6) */
  const vt=testVma(se.t2&&se.t2.ts),v5=testVma(se.t5&&se.t5.rt),v6=testVma(se.t6&&se.t6.rt);
  if(i>=4&&v5)return v5;if(i>=5&&v6)return v6;return vt||num(run.vmaManuelle)||null;
}
function testVma(a){if(!a)return null;const v=a.map(num).filter(x=>x!=null);return v.length>=6?v.reduce((s,x)=>s+x,0)/v.length:null}
function lastNum(a){if(!a)return null;const v=a.map(num).filter(x=>x!=null);return v.length?v[v.length-1]:null}
function c3dist(c){if(!c)return null;return tp(c.ft,c.fp)}
function c3half(c){if(!c)return null;return tp(c.mt,c.mp)}
function c3reg(c){const d=c3dist(c),h=c3half(c);if(d==null||h==null)return null;return (d-h)-h}
function p130real(p){if(!p)return null;const pr=num(p.proj),e=num(p.ec);if(pr==null||e==null)return null;return pr+e}
const prevu=(dist_,pct,v)=>v?tSec(dist_,v*pct/100):null;
const VMA_3=0.86;   /* VMA estimée ≈ vitesse moyenne d'un 3’ à fond × 0,86 (test de 3’, académie de Bordeaux) */
const pctRow=r=>r[3]==='E'?r[1]*VMA_3:r[1];   /* série en % de la VMA estimée (Seconde) */

/* ---- projets tenus d'une séance : [tenus, tentatives] ----
   Un projet ne compte que s'il est AMBITIEUX : sinon un élève prudent tiendrait tout sans progresser.
   _v = VMA effective, _ref = dernière distance réalisée au 1'30 (fournies par l'interface). */
const AMB=0.95;
function ambition(ty,d,a1){const v=num(d._v),ref=num(d._ref);
  if(ty==='p130'){const pr=num(d[a1]&&d[a1].proj);if(pr==null)return true;const base=ref||(v?dist(90,v):null);return base==null||pr>=AMB*base}
  if(ty==='c3'){const vv=num(d[a1]&&d[a1].v);if(vv==null||!v)return true;return vv>=AMB*dist(180,v)}
  if(ty==='c500'){const pj=parseT(d[a1]&&d[a1].tp);if(pj==null||!v)return true;return pj<=tSec(500,v)/AMB}
  return true}
function tenus(sid,d){
  if(!d||d.st)return [0,0];let t=0,n=0;const add=ok=>{n++;if(ok)t++};
  const s=(d._mar&&SBYM[sid])||SBY[sid],v=num(d._v),T=cyOfSid(sid)==='T',ad=!!d.ad;          /* ad = pratique adaptée : tolérances élargies */
  s.blocks.forEach(b=>{const [ty,a1,a2,a3]=bk(b);
    if(ty==='i36'||ty==='i36m')(d.i36||[]).forEach(x=>{if(x)add(x==='P')});
    if(ty==='al4')(d.al||[]).forEach(r=>{const a=num(r&&r.an),e=num(r&&r.re);if(a!=null&&e!=null)add(Math.abs(a-e)<=(ad?2:1))});
    if(ty==='ct')(d.ct||[]).forEach(r=>{const a=num(r&&r.c),e=num(r&&r.r);if(a!=null&&e!=null)add(Math.abs(a-e)<=(ad?1:0))});
    if(ty==='c3'){const c=d[a1];const vv=num(c&&c.v),dd=c3dist(c);if(vv!=null&&dd!=null)add(Math.abs(dd-vv)<=(ad?20:10)&&ambition(ty,d,a1))}
    if(ty==='p130'){const p=d[a1];const e=num(p&&p.ec);if(e!=null){const z=T?zoneT(e):zoneS(e);add((ad?z[0]>=(T?2:1):(T?z[0]>=3:z[0]>=2))&&ambition(ty,d,a1))}}
    if(ty==='at')((d.at&&d.at.r)||[]).forEach(x=>{if(x)add(x==='ok')});
    if(ty==='ser')(d[a1]||[]).forEach((r,i)=>{const tr=parseT(r&&r.tr),row=a3[i];if(tr!=null&&row&&v)add(Math.abs(tr-prevu(row[0],pctRow(row),v))<=(ad?4:2))});
    if(ty==='tours')(d.tr||[]).forEach((r,i)=>{const tt=parseT(r&&r.t),vv=num(r&&r.v)||[8,10,12,14][i];if(tt!=null&&vv)add(Math.abs(tt-tSec(200,vv))<=(ad?4:2))});
    if(ty==='i112')(d.c112||[]).forEach(x=>{const c=num(x);if(c!=null&&v)add(Math.abs(c-v*a1/100)<=(ad?2:1))});
    if(ty==='c500'){const c=d[a1]||{};const tt=parseT(c.t),pj=parseT(c.tp);if(tt!=null&&pj!=null)add(Math.abs(tt-pj)<=(ad?4:2)&&ambition(ty,d,a1))}
    if(ty==='rel5'){const vv=parseT(d.rlv),tt=parseT(d.rlt);if(vv!=null&&tt!=null)add(Math.abs(tt-vv)<=30)}
    if(ty==='m3'&&a1!=='mx'){const c=d[a1];const vv=num(c&&c.v),dd=m3dist(c);if(vv!=null&&dd!=null)add(Math.abs(dd-vv)<=10)}
    if(ty==='m1000'){const c=d[a1]||{};const tt=parseT(c.t),pj=parseT(c.tp);if(tt!=null&&pj!=null)add(Math.abs(tt-pj)<=10)}
    if(ty==='mall')(d.ma||[]).forEach((x,i)=>{const r=num(x);if(r!=null&&v)add(Math.abs(r-dist(120,v*[70,80,90][i]/100))<=10)});
    if(ty==='mfr')(d.mf||[]).forEach(r=>{const a=num(r&&r.v),e=num(r&&r.r);if(a!=null&&e!=null)add(Math.abs(a-e)<=10)});
    if(ty==='real8')(d.r8||[]).forEach(r=>{const p=parseT(r&&r.p),x=parseT(r&&r.r);if(p!=null&&x!=null)add(Math.abs(p-x)<=(ad?4:2))});
  });
  return [t,n];
}
/* écart moyen entre prévu et réalisé : le vrai indicateur de « gérer son allure » (plus bas = mieux) */
function ecartOf(sid,d){if(!d||d.st)return null;const s=SBY[sid];const m=[];
  s.blocks.forEach(b=>{const [ty,a1]=bk(b);
    if(ty==='p130'){const e=num(d[a1]&&d[a1].ec);if(e!=null)m.push(Math.abs(e))}
    if(ty==='c3'){const c=d[a1];const vv=num(c&&c.v),dd=c3dist(c);if(vv!=null&&dd!=null)m.push(Math.abs(dd-vv)/2)}   /* 3' ramené à l'échelle du 1'30 */
  });return m.length?m.reduce((a,x)=>a+x,0)/m.length:null}
function ecartT(sid,d){if(!d||d.st)return null;const s=SBY[sid];const m=[];
  s.blocks.forEach(b=>{const [ty,a1]=bk(b);if(ty==='c500'){const c=d[a1]||{};const t=parseT(c.t),p=parseT(c.tp);if(t!=null&&p!=null)m.push(Math.abs(t-p))}});return m.length?m.reduce((a,x)=>a+x,0)/m.length:null}
function degreeOf(t,n){if(!n)return null;const r=t/n;return r>=0.75?4:r>=2/3-0.001?3:r>=1/3-0.001?2:1}

/* ---- AFL1 ---- */
function afl1(run,d){                                   /* Seconde (/12) */
  if(!d)return null;const F=run.sexe==='F';
  const d3=c3dist(d.c3),r130=p130real(d.p),e=num(d.p&&d.p.ec),reg=c3reg(d.c3);
  if(d3==null&&r130==null)return null;
  const n3=noteS(F?'F3':'G3',d3),n1=noteS(F?'F130':'G130',r130),z=zoneS(e),rg=reg==null?0:(reg>=-5?1:0);
  return {n3,n1,z:z?z[0]:0,zl:z?z[1]:'–',rg,tot:n3+n1+(z?z[0]:0)+rg,d3,r130};
}
function afl1T(run,d){                                  /* Terminale (/12) : performance /8 + zone /4 */
  if(!d)return null;const sx=run.sexe==='F'?'F':'G';
  const t1=parseT(d.e1&&d.e1.t),t2=parseT(d.e2&&d.e2.t),r130=p130real(d.p),e=num(d.p&&d.p.ec);
  if(t1==null&&t2==null&&r130==null)return null;
  const n1=t1!=null?note500(sx,t1):null,n2=t2!=null?note500(sx,t2):null,n3=r130!=null?note130(sx,r130):null;
  const perf=[n1,n2,n3].every(x=>x!=null)?R((n1+n2+n3)/3*10)/10:null;const z=zoneT(e);
  return {n1,n2,n3,perf,z:z?z[0]:null,zl:z?z[1]:'–',tot:perf!=null&&z?R((perf+z[0])*10)/10:null,t1,t2,r130};
}
/* ---- PARCOURS MARCHE ---- */
const isM=run=>!!(run&&run.pc==='m');
const sessFor=(run,sid)=>(isM(run)&&SBYM[sid])||SBY[sid];
function m3dist(c){if(!c)return null;const t=num(c.t),p=num(c.pl);if(t==null&&p==null)return null;return (t||0)*200+(p||0)}
/* vitesse de marche (km/h) = distance du dernier 3’ « à fond » ÷ 50 */
function vmmOf(run,sid){const L=sessOf(cyOfSid(sid)),i=L.findIndex(s=>s.id===sid);for(let k=i;k>=0;k--){const x=run.seances&&run.seances[L[k].id];const dd=x&&m3dist(x.mx);if(dd)return dd/50}return null}
/* temps : note de la ligne atteinte (il faut être au moins aussi rapide) */
function noteMt(tab,t){if(t==null)return null;const L=BARM[tab];for(let i=0;i<L.length;i++)if(t<=L[i])return BARM.notes[i];return 0}
/* distance en 3’ : répartition régulière entre deux lignes, arrondie au quart de point le plus proche */
function noteMd(sx,dd){if(dd==null)return null;const A=BARM.D3[sx==='F'?'F':'G'];if(dd>=A[0][1])return 8;
  for(let i=0;i<A.length-1;i++){const [n1,d1]=A[i],[n2,d2]=A[i+1];if(dd>=d2)return Math.round((n2+(n1-n2)*(dd-d2)/(d1-d2))*4)/4}return 0}
/* projet de distance sur 3’ /4 : écart = réalisé − annoncé */
function projM(e){if(e==null)return null;const a=Math.abs(e);if(a<=5)return 4;if(e>0)return e<=15?3:2;return e>=-15?2:e>=-25?1:0}
function aflM(run,d,cy){if(!d)return null;const sx=run.sexe==='F'?'F':'G',T=cy==='T';
  const t1=parseT(d.w1&&d.w1.t),t2=parseT(d.w2&&d.w2.t),dd=m3dist(d.q),pr=num(d.q&&d.q.v);
  if(t1==null&&t2==null&&dd==null)return null;
  const nt=T?(t1!=null&&t2!=null?noteMt(sx+'2000',t1+t2):null):(t1!=null?noteMt(sx+'1000',t1):null),n3=noteMd(sx,dd);
  const perf=nt!=null&&n3!=null?R((nt+n3)/2*100)/100:null,pj=dd!=null&&pr!=null?projM(dd-pr):null;
  return {marche:true,nt,n3,perf,pj,d3:dd,e:dd!=null&&pr!=null?dd-pr:null,tot:perf!=null&&pj!=null?R((perf+pj)*100)/100:null,t1,t2,dd,pr};
}
const aflOf=(run,d,cy)=>isM(run)?aflM(run,d,cy):cy==='T'?afl1T(run,d):afl1(run,d);

/* ---- format compact pour le QR ---- */
const CUT=(s,n)=>String(s||'').slice(0,n);
function slimSeance(d){
  if(!d)return {};const o=JSON.parse(JSON.stringify(d));
  if(o.bl){['reu','con','nx'].forEach(k=>{if(o.bl[k])o.bl[k]=CUT(o.bl[k],40)})}
  ['aj','mot','rc','rc2','repw','pfw','wx'].forEach(k=>{if(o[k])o[k]=CUT(o[k],40)});if(o.cx&&o.cx.n)o.cx.n=CUT(o.cx.n,30);
  if(o.warm)o.warm=o.warm.map(x=>CUT(x,25));delete o._ref;
  if(o.pe&&o.pe.why)o.pe.why=CUT(o.pe.why,40);
  if(o.mi){if(o.mi.th)o.mi.th=CUT(o.mi.th,30);if(o.mi.pb)o.mi.pb=CUT(o.mi.pb,30);if(o.mi.x)o.mi.x=o.mi.x.map(r=>r?{e:CUT(r.e,20),dd:CUT(r.dd,8),i:CUT(r.i,6),r:CUT(r.r,8),n:CUT(r.n,4)}:r)}
  ['c3','c3b'].forEach(k=>{if(o[k]&&o[k].lt)o[k].lt=o[k].lt.map(x=>R(x))});
  (function clean(x){for(const k in x){if(x[k]===''||x[k]==null)delete x[k];else if(typeof x[k]==='object')clean(x[k])}})(o);
  return o;
}
/* ---- pronostic du coach : même course cible que dans l'appli ---- */
function pronoTarget(s){for(const b of s.blocks.map(bk)){if(b[0]==='c500')return b;if(b[0]==='c3'&&b[1]==='c3')return b;if(b[0]==='p130'&&b[1]==='p')return b}return null}
function pronoReal(B,d){if(!B||!d)return null;const [ty,a1]=B;if(ty==='c500')return parseT(d[a1]&&d[a1].t);if(ty==='c3')return c3dist(d[a1]);return p130real(d[a1])}
function pronoErr(s,d){const B=pronoTarget(s);if(!B||!d)return null;const r=pronoReal(B,d);const bl=d.bl||{};const p=B[0]==='c500'?parseT(bl.pr):num(bl.pr);if(r==null||p==null||!r)return null;return Math.abs(p-r)/r*100}
function chargeOf(d){const bl=d&&d.bl||{};const r=num(bl.rpe);if(r==null)return null;return R(r*(num(bl.du)||60))}
/* ---- noms ---- */
const prenomDe=n=>{const w=String(n||'').trim().split(/\s+/);const pre=w.filter(x=>!(x===x.toUpperCase()&&/[A-ZÀ-Ý]/.test(x)));return (pre.length?pre:w).join(' ')};
const nomDe=n=>{const w=String(n||'').trim().split(/\s+/);const up=w.filter(x=>x===x.toUpperCase()&&/[A-ZÀ-Ý]/.test(x));return up.length?up.join(' '):(w.length>1?w[w.length-1]:'')};
function slug(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'').slice(0,24)}
function nomFichier(classe,eleve,sid,suffixe){const nom=nomDe(eleve),pre=prenomDe(eleve);
  return (slug(classe)||'Classe')+'_'+(slug(nom)+(pre?'_'+slug(pre):'')||'Eleve') /* prénom complet : deux élèves de même nom ne doivent pas donner le même fichier */+'_'+String(sid).toUpperCase()+(suffixe?'_'+suffixe:'')+'.json'}
/* ---- fiche « séance d'un élève » (fichier JSON et QR) ----
   run = {nom complet, sexe, vmaManuelle, seances:{sid:{…}}} */
function ctxSeance(run,sid){const d=run.seances&&run.seances[sid];if(!d)return null;if(isM(run))return Object.assign({},d,{_v:vmmOf(run,sid),_mar:1});const v=(num(d.vj)||vmaOf(run,sid));
  const L=sessOf(cyOfSid(sid)),i=L.findIndex(s=>s.id===sid);let ref=null;
  for(let k=i-1;k>=0&&ref==null;k--){const x=run.seances[L[k].id];if(!x)continue;const r=p130real(x.p2)||p130real(x.p);if(r)ref=R(r);else if(x.m130){const m=tp(x.m130.t,x.m130.p);if(m)ref=R(m)}}
  return Object.assign({},d,{_v:v||num(d._v),_ref:ref})}
function resumeSeance(run,sid){const d=run.seances&&run.seances[sid];if(!d)return null;const c=ctxSeance(run,sid);const [t,n]=tenus(sid,c);const s=SBY[sid];
  const a=s.eval?aflOf(run,d,cyOfSid(sid)):null;
  return {tenus:t,tentes:n,ecart:(v=>v==null?null:R(v))(ecartOf(sid,d)),ecart500:(v=>v==null?null:R(v))(ecartT(sid,d)),afl1:a&&a.tot!=null?a.tot:null,
    effort:num((d.bl||{}).rpe),charge:chargeOf(d),distance:distSeance(run,sid)||null,vma:c&&c._v?R(c._v*10)/10:null,statut:d.st||(d.ad?'adapte':'present'),marche:isM(run)||undefined}}

/* ---- Distance parcourue pendant la séance (échauffement compris), pour l'élève et le prof ---- */
function distSeance(run,sid){const d=run.seances&&run.seances[sid];if(!d||d.st)return 0;const s=sessFor(run,sid),v=isM(run)?vmmOf(run,sid):vmaOf(run,sid);let m=0;
  const plus=x=>{x=num(x);if(x!=null&&x>0)m+=x};
  s.blocks.forEach(b=>{const [ty,a1,a2,a3]=bk(b);
    if(ty==='warm'||ty==='warmT')plus(d.wfoot);
    else if(ty==='al4')(d.al||[]).forEach(r=>plus(r&&num(r.re)!=null?num(r.re)*50:null));
    else if(ty==='ct')(d.ct||[]).forEach(r=>plus(r&&num(r.r)!=null?num(r.r)*100:null));   /* tours du binôme, partagés à deux */
    else if(ty==='ann')plus(num(d.ann)!=null?num(d.ann)*20:null);
    else if(ty==='t3m')plus(c3dist(d.t3m));
    else if(ty==='ra')plus(num(d.ra)!=null?num(d.ra)*50:null);
    else if(ty==='ra2')plus(d.ra2);
    else if(ty==='m130')plus(d.m130&&tp(d.m130.t,d.m130.p));
    else if(ty==='c3')plus(c3dist(d[a1]));
    else if(ty==='p130')plus(p130real(d[a1]));
    else if(ty==='ser')(d[a1]||[]).forEach((r,i)=>{if(r&&parseT(r.tr)!=null&&a3[i])m+=a3[i][0]});
    else if(ty==='i36'||ty==='i36m'){const pl=ty==='i36'?Array(a2).fill(a1):[].concat(...a1.map(r=>Array(r[1]).fill(r[0])));(d.i36||[]).forEach((x,i)=>{if(x&&v&&pl[i])m+=v*pl[i]/100*10})}
    else if(ty==='i112')(d.c112||[]).forEach(x=>plus(num(x)!=null?num(x)*20:null));
    else if(ty==='tours')(d.tr||[]).forEach(r=>{if(r&&parseT(r.t)!=null)m+=200});
    else if(ty==='t3624'||ty==='rt')(d[ty==='t3624'?'ts':'rt']||[]).forEach(x=>plus(num(x)!=null?num(x)*10:null));
    else if(ty==='rel5'){if(parseT(d.rlt)!=null)m+=2500}
    else if(ty==='c500'){if(parseT(d[a1]&&d[a1].t)!=null)m+=500}
    else if(ty==='e130')plus(d.e130&&d.e130.r90);
    else if(ty==='m3')plus(m3dist(d[a1]));
    else if(ty==='m1000'){if(parseT(d[a1]&&d[a1].t)!=null)m+=1000}
    else if(ty==='mall')(d.ma||[]).forEach(plus);
    else if(ty==='mfr')(d.mf||[]).forEach(r=>plus(r&&r.r));
  });
  return R(m)}
