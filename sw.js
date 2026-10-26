/* Hors ligne : l'outil est gardé sur l'appareil après la 1re ouverture.
   Après une modification, augmenter VERSION (dfp-v1 → dfp-v8…). */
const VERSION='demi-fond-prof-v13';
// Toutes les applis partagent le même stockage (même adresse github.io) : on n'efface QUE les anciennes versions de CETTE appli.
const MES_CACHES=/^(?:demi\-fond\-prof\-v|dfp\-v)\d+$/;

const FICHIERS=['./','index.html','eps-charte-v1.css','polices/archivo.woff2','polices/atkinson-400.woff2','polices/atkinson-700.woff2','style.css','donnees.js','logique.js','qrcode.js','jsqr.js','scan.js','jszip.js','xlsx.js','vues.js','chrono.js','prof.js','prof-demo.js','manifest.webmanifest',
  'icon-32.png','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FICHIERS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>MES_CACHES.test(k)&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// Tablette d'abord : l'appli s'ouvre tout de suite depuis la tablette, même sans réseau sur la piste ;
// la version en ligne est récupérée en arrière-plan (nouvelle version : bandeau « Recharger » au prochain changement de sw.js).
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(caches.open(VERSION).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||Response.error()}));
});
