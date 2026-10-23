/* Hors ligne : l'outil est gardé sur l'appareil après la 1re ouverture.
   Après une modification, augmenter VERSION (dfp-v1 → dfp-v3…). */
const VERSION='dfp-v3';
const FICHIERS=['./','index.html','style.css','donnees.js','logique.js','qrcode.js','jsqr.js','scan.js','jszip.js','xlsx.js','vues.js','chrono.js','prof.js','prof-demo.js','manifest.webmanifest',
  'icon-32.png','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FICHIERS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// Réseau d'abord (pour recevoir les mises à jour), cache si pas de connexion.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
