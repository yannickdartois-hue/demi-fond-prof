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
  if(cy==='S'){const v6=se.s6&&c3dist(se.s6.c3);if(i>=6&&v6)return v6/50;
    const al=se.s1&&se.s1.al;const v1=al&&al[3]?num(al[3].re):null;return v1||num(run.vmaManuelle)||null}
  const vt=testVma(se.t2&&se.t2.ts),vr=testVma(se.t6&&se.t6.rt);
  if(i>=5&&vr)return vr;return vt||num(run.vmaManuelle)||null;
}
function testVma(a){if(!a)return null;const v=a.map(num).filter(x=>x!=null);return v.length>=6?v.reduce((s,x)=>s+x,0)/v.length:null}
function lastNum(a){if(!a)return null;const v=a.map(num).filter(x=>x!=null);return v.length?v[v.length-1]:null}
function c3dist(c){if(!c)return null;return tp(c.ft,c.fp)}
function c3half(c){if(!c)return null;return tp(c.mt,c.mp)}
function c3reg(c){const d=c3dist(c),h=c3half(c);if(d==null||h==null)return null;return (d-h)-h}
function p130real(p){if(!p)return null;const pr=num(p.proj),e=num(p.ec);if(pr==null||e==null)return null;return pr+e}
const prevu=(dist_,pct,v)=>v?tSec(dist_,v*pct/100):null;

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
  const s=SBY[sid],v=num(d._v),T=cyOfSid(sid)==='T',ad=!!d.ad;          /* ad = pratique adaptée : tolérances élargies */
  s.blocks.forEach(b=>{const [ty,a1,a2,a3]=bk(b);
    if(ty==='i36'||ty==='i36m')(d.i36||[]).forEach(x=>{if(x)add(x==='P')});
    if(ty==='al4')(d.al||[]).forEach(r=>{const a=num(r&&r.an),e=num(r&&r.re);if(a!=null&&e!=null)add(Math.abs(a-e)<=(ad?2:1))});
    if(ty==='ct')(d.ct||[]).forEach(r=>{const a=num(r&&r.c),e=num(r&&r.r);if(a!=null&&e!=null)add(Math.abs(a-e)<=(ad?1:0))});
    if(ty==='c3'){const c=d[a1];const vv=num(c&&c.v),dd=c3dist(c);if(vv!=null&&dd!=null)add(Math.abs(dd-vv)<=(ad?20:10)&&ambition(ty,d,a1))}
    if(ty==='p130'){const p=d[a1];const e=num(p&&p.ec);if(e!=null){const z=T?zoneT(e):zoneS(e);add((ad?z[0]>=(T?2:1):(T?z[0]>=3:z[0]>=2))&&ambition(ty,d,a1))}}
    if(ty==='at')((d.at&&d.at.r)||[]).forEach(x=>{if(x)add(x==='ok')});
    if(ty==='ser')(d[a1]||[]).forEach((r,i)=>{const tr=parseT(r&&r.tr),row=a3[i];if(tr!=null&&row&&v)add(Math.abs(tr-prevu(row[0],row[1],v))<=(ad?4:2))});
    if(ty==='tours')(d.tr||[]).forEach((r,i)=>{const tt=parseT(r&&r.t),vv=num(r&&r.v)||[8,10,12,14][i];if(tt!=null&&vv)add(Math.abs(tt-tSec(200,vv))<=(ad?4:2))});
    if(ty==='i112')(d.c112||[]).forEach(x=>{const c=num(x);if(c!=null&&v)add(Math.abs(c-v*a1/100)<=(ad?2:1))});
    if(ty==='c500'){const c=d[a1]||{};const tt=parseT(c.t),pj=parseT(c.tp);if(tt!=null&&pj!=null)add(Math.abs(tt-pj)<=(ad?4:2)&&ambition(ty,d,a1))}
    if(ty==='rel5'){const vv=parseT(d.rlv),tt=parseT(d.rlt);if(vv!=null&&tt!=null)add(Math.abs(tt-vv)<=30)}
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
  const n3=noteS(F?'F3':'G3',d3),n1=noteS(F?'F130':'G130',r130),z=zoneS(e),rg=reg==null?0:(reg>=-10?1:0);
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
const aflOf=(run,d,cy)=>cy==='T'?afl1T(run,d):afl1(run,d);

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
  return (slug(classe)||'Classe')+'_'+(slug(nom)+slug(pre).slice(0,1).toUpperCase()||'Eleve')+'_'+String(sid).toUpperCase()+(suffixe?'_'+suffixe:'')+'.json'}
/* ---- fiche « séance d'un élève » (fichier JSON et QR) ----
   run = {nom complet, sexe, vmaManuelle, seances:{sid:{…}}} */
function ctxSeance(run,sid){const d=run.seances&&run.seances[sid];if(!d)return null;const v=(num(d.vj)||vmaOf(run,sid));
  const L=sessOf(cyOfSid(sid)),i=L.findIndex(s=>s.id===sid);let ref=null;
  for(let k=i-1;k>=0&&ref==null;k--){const x=run.seances[L[k].id];if(!x)continue;const r=p130real(x.p2)||p130real(x.p);if(r)ref=R(r);else if(x.m130){const m=tp(x.m130.t,x.m130.p);if(m)ref=R(m)}}
  return Object.assign({},d,{_v:v||num(d._v),_ref:ref})}
function resumeSeance(run,sid){const d=run.seances&&run.seances[sid];if(!d)return null;const c=ctxSeance(run,sid);const [t,n]=tenus(sid,c);const s=SBY[sid];
  const a=s.eval?aflOf(run,d,cyOfSid(sid)):null;
  return {tenus:t,tentes:n,ecart:(v=>v==null?null:R(v))(ecartOf(sid,d)),ecart500:(v=>v==null?null:R(v))(ecartT(sid,d)),afl1:a&&a.tot!=null?a.tot:null,
    effort:num((d.bl||{}).rpe),charge:chargeOf(d),vma:c&&c._v?R(c._v*10)/10:null,statut:d.st||(d.ad?'adapte':'present')}}
