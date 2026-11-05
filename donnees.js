/* =====================================================================
   donnees.js — Demi-fond (Lycée G. Pompidou) : séances de Seconde (S1-S8) et de Terminale (T1-T9), barèmes.
   COMMUN à l'appli élève (demi-fond-eleves) et à l'outil prof (demi-fond-prof) :
   garder la même version dans les deux dépôts (les formats de QR et de fichiers en dépendent).
   ===================================================================== */
'use strict';
/* Seconde — 1’30 recalé entre les référentiels Bac pro et CAP du lycée (moyenne par course) moins 10 m ; 3’ filles abaissé de 40 m, nov. 2026 */
const BAR2={notes:[0.5,1,1.5,2,2.5,3,3.5,4],F3:[400,440,470,510,550,590,620,660],G3:[540,590,630,680,720,760,810,850],F130:[225,250,270,290,315,335,355,375],G130:[330,355,380,395,415,430,460,490]};
/* Terminale : référentiel du lycée (V2026) */
const BAR={notes:[0.3,0.6,1,1.3,1.6,2,2.3,2.6,3,3.3,3.6,4,4.3,4.6,5,5.3,5.6,6,6.3,6.6,7,7.3,7.6,8],
 F500:['3’30','3’16','3’08','2’59','2’51','2’44','2’39','2’34','2’30','2’27','2’23','2’20','2’15','2’12','2’09','2’07','2’05','2’02','2’00','1’58','1’55','1’53','1’51','1’50'],
 G500:['2’40','2’36','2’32','2’28','2’24','2’20','2’16','2’12','2’08','2’02','1’58','1’52','1’48','1’44','1’41','1’38','1’36','1’34','1’32','1’30','1’28','1’26','1’25','1’23'],
 F130:[243,250,258,265,273,280,288,295,303,310,318,325,332,340,347,355,362,370,377,385,392,400,407,415],
 G130:[315,325,335,345,355,365,375,385,395,405,415,425,435,445,455,465,475,485,495,505,515,525,535,545]};
/* ---- Seconde : 8 séances ---- */
const SESS_S=[
 {id:'s1',n:'S1',t:'Challenges du binôme – ma VMA',goal:'j’annonce mes 4 allures à 1 plot près et notre binôme tient son contrat de tours.',
  crit:['Les 4 allures sont bien différentes','Même vitesse sur les 6 minutes','Parle encore pendant le footing'],blocks:['al4','ct','grp']},
 {id:'s2',n:'S2',t:'Le 36"/36" et le 1’30 mesuré',goal:'au moins 5 répétitions sur 8 sont « pile » au plot cible.',
  crit:['Part franchement au signal','Regarde son plot cible','Même foulée de la 1re à la 8e'],blocks:[['i36',100,8],'ra','m130']},
 {id:'s3',n:'S3',t:'Le 3’ au plot et le premier projet',goal:'mon 3’ est régulier et mon 1’30 arrive à moins de 15 m de mon projet.',
  crit:['1re moitié du 3’ pas trop rapide','Respecte le passage à 1’30','Accélère dans les 20 dernières secondes'],blocks:[['i36',100,6],['c3','c3','Le 3’ au plot'],['p130','p','1’30 avec projet']]},
 {id:'s4',n:'S4',t:'Tenir son projet fatigué',goal:'mon 1’30, fait 6 min après le 3’, arrive en zone 3 ou 4.',
  crit:['Fait sa récupération active','Ajuste son projet avec le coach','Garde sa foulée en fin de 1’30'],blocks:[['i36',100,6],['c3','c3','Le 3’ au plot'],['p130','p','1’30 avec projet, 6 min après le 3’'],['txt','aj','J’ai ajusté mon projet parce que…']]},
 {id:'s5',n:'S5',t:'Régularité sur 3’',goal:'mes deux 3’ ont moins de 20 m d’écart.',
  crit:['Même allure au 1er et au dernier tour','Écoute les temps de passage','2e moitié aussi longue que la 1re'],blocks:[['i36',105,6],['c3','c3','3’ n°1'],['c3','c3b','3’ n°2'],'ec2',['p130','p','1’30 avec projet']]},
 {id:'s6',n:'S6',t:'Épreuve blanche – 3’ / 10’ / 1’30',goal:'je m’échauffe seul et je repars avec ma note et mon point faible.',eval:true,
  crit:['Échauffement complet (3 parties)','Projet écrit avant de courir','Départ du 3’ maîtrisé'],blocks:['warm',['c3','c3','C1 · 3’ au plot'],['entre','en','Entre le 3’ et le 1’30'],['p130','p','C2 · 1’30 avec projet'],'afl1','pf','vup','situe']},
 {id:'s7',n:'S7',t:'Mon point faible – projet final',goal:'je réussis 3 répétitions sur 4 de mon atelier et je fixe mes projets.',
  crit:['Atelier choisi selon son point faible','Respecte les cibles de l’atelier','Projet final cohérent avec ses chiffres'],blocks:[['i36',110,6],'at',['p130','p','1’30 avec projet final'],'pe']},
 {id:'s8',n:'S8',t:'Évaluation – 3’ / 10’ / 1’30',goal:'mon 3’ est régulier et mon 1’30 arrive en zone 4.',eval:true,
  crit:['Échauffement seul et complet','Coach précis : tours, mi-course, plot','Allure gérée sur les deux courses'],blocks:['warm',['c3','c3','C1 · 3’ au plot'],['entre','en','Entre le 3’ et le 1’30'],['p130','p','C2 · 1’30 avec projet'],'afl1','situe']}
];
/* ---- Terminale : 9 séances (carnet de Terminale, référentiel du lycée) ---- */
const R5=n=>Array(n).fill([300,110,'5’']);
const SESS_T=[
 {id:'t1',n:'T1',t:'Parcourir 5 km à 2 et observer',goal:'notre binôme tient son temps visé à 30 s près et je connais mon temps sur 500 m.',
  crit:['Relais propres, dans la zone','Tours réguliers','500 m sans départ trop rapide'],blocks:['rel5',['c500','r1','500 m de référence']]},
 {id:'t2',n:'T2',t:'Alterner des allures et trouver sa VMA',goal:'je tiens chaque allure au tour à 2 s près et je vais au bout du test 36"/24".',
  crit:['Temps au tour respectés','Allures de plus en plus rapides','Va au bout du test'],blocks:['tours','t3624']},
 {id:'t3',n:'T3',t:'Travail du 1er 500 – intermittent 36"/36"',goal:'mes temps réalisés sont à 2 s près de mes temps prévus.',
  crit:['Passage au 250 m annoncé et tenu','Allure stable sur chaque distance','Plots respectés en 36"/36"'],blocks:[['ser','s','Varier les allures et coacher',[[500,90,'4’'],[400,95,'3’30'],[300,100,'3’'],[200,110,'2’'],[100,120,'2’'],[100,130,'']]],['ra2',70,180],['i36m',[[110,3],[120,3]]]]},
 {id:'t4',n:'T4',t:'Intermittent 1’12 et pyramide',goal:'j’atteins ma coupelle à chaque 1’12 et je tiens les temps de la pyramide.',
  crit:['Coupelle atteinte à chaque 1’12','Récupération respectée','Accélère sur la fin de la pyramide'],blocks:[['i112',80,4],['ra2',50,120],['ser','s','Travail en pyramide',[[250,95,'2’30'],[375,100,'3’'],[500,110,'5’'],[375,115,'4’'],[250,120,'3’30'],[125,130,'']]]]},
 {id:'t5',n:'T5',t:'Travail du 2e 500 m – 1’30',goal:'mes 6 × 300 m ont tous le même temps, à 2 s près.',
  crit:['Même temps sur les 6 × 300 m','Récupération active faite','2e 1’30 aussi juste que le 1er'],blocks:[['ser','s','Maintenir l’allure : 6 × 300 m',R5(5).concat([[300,110,'']])],['ra2',70,180],['p130','p','1’30 avec projet n°1'],['p130','p2','1’30 avec projet n°2']]},
 {id:'t6',n:'T6',t:'Travail du dernier 500 m – résister',goal:'je tiens l’intensité jusqu’au 400 m et mon 1’30 fatigué arrive en zone 3 ou 4.',
  crit:['Bras actifs en fin de course','Tient l’allure dans les 50 derniers m','Projet du 1’30 ajusté'],blocks:['rt',['ser','s','Résistance : 100 à 400 m',[[100,100,'2’'],[200,105,'2’30'],[250,110,'3’'],[300,120,'5’'],[400,125,'']]],['ra2',70,180],['p130','p','1’30 avec projet (fatigué, comme C3)']]},
 {id:'t7',n:'T7',t:'Épreuve blanche – 500 / 500 / 1’30',goal:'je connais ma note AFL1 et le point que je travaille en T8.',eval:true,
  crit:['Échauffement complet','Stratégie écrite avant chaque course','Faible écart prévu / réalisé'],blocks:['warmT',['c500','e1','C1 · 500 m'],['entre','en','Entre C1 et C2'],['c500','e2','C2 · 500 m'],['entre','en2','Entre C2 et C3'],['p130','p','C3 · 1’30 avec projet'],'afl1T','pfT','situe','rep']},
 {id:'t8',n:'T8',t:'Construire et réaliser ma séance',goal:'ma séance vise mon point faible et je réalise ce que j’ai prévu.',
  crit:['Séance en lien avec son point faible','Distances, % et récups respectés','Projet final réaliste'],blocks:['mine','real8','pfin']},
 {id:'t9',n:'T9',t:'Épreuve – 500 / 500 / 1’30',goal:'je tiens mes passages au 250 m et mon 1’30 arrive en zone 4.',eval:true,
  crit:['Échauffement seul et complet','Coach précis : passages, plot','Allure gérée sur les 3 courses'],blocks:['warmT',['c500','e1','C1 · 500 m'],['entre','en','Entre C1 et C2'],['c500','e2','C2 · 500 m'],['entre','en2','Entre C2 et C3'],['p130','p','C3 · 1’30 avec projet'],'afl1T','rep']}
];
const CYC={S:{id:'S',label:'Seconde',short:'2nde',sess:SESS_S},T:{id:'T',label:'Terminale',short:'Tle',sess:SESS_T}};
const SESS=SESS_S;                                      /* compatibilité */
const SBY=Object.fromEntries(SESS_S.concat(SESS_T).map(s=>[s.id,s]));
const cyOfSid=sid=>String(sid).charAt(0)==='t'?'T':'S';
const sessOf=cy=>CYC[cy||'S'].sess;
const bk=b=>Array.isArray(b)?b:[b];
const ST_TXT={abs:'absent',bl:'blessé / dispensé'};
const WHY_TXT={abs:'coach absent',bl:'coach blessé ou dispensé',autre:'autre raison'};
const DEG_TXT={1:'¼ · élève isolé',2:'⅓ · élève suiveur',3:'⅔ · élève acteur',4:'¾ · moteur / leader'};
const RPE_TXT=['0 · repos','1 · très, très facile','2 · facile','3 · modéré : je parle en phrases','4 · un peu dur','5 · dur : je parle par mots','6 · dur +','7 · très dur','8 · très dur +','9 · presque maximal','10 · maximal : je ne peux plus parler'];
const WARM_EX=[[['f','Footing 60-70 %'],['tf','Talons-fesses'],['mg','Montées de genoux'],['pc','Pas chassés'],['cr','Pas croisés']],
 [['ch','Chevilles'],['ge','Genoux'],['ha','Hanches'],['ep','Épaules'],['ga','Gainage'],['sq','Squats'],['fe','Fentes'],['po','Montées sur pointes']],
 [['sk','Skipping'],['gr','Foulées griffées'],['bo','Foulées bondissantes'],['ac','3 accélérations progressives'],['al','Accélération à l’allure de course']]];
const WARM_NAME=Object.fromEntries([].concat(...WARM_EX));

/* =====================================================================
   PARCOURS MARCHE — élèves asthmatiques (ou autre avis médical) : un élève
   du binôme peut suivre ce parcours (run.pc = 'm') pendant que l'autre court.
   Mêmes numéros de séance que la classe (S1-S8, T1-T9) : le code du cours,
   l'appel et l'envoi restent communs.
   Terminale : épreuve du lycée « marche fractionnée adaptée » 2 × 1000 m + 3’ (barème CCF 2021).
   Seconde : épreuve allégée 1 × 1000 m + 3’ (mêmes tables, un seul 1000 m).
   ===================================================================== */
const tMs=s=>{const m=/(\d+)\D+(\d+)/.exec(s);return +m[1]*60+ +m[2]};
const BARM={notes:[8,7.75,7.5,7.25,7,6.75,6.5,6.25,6,5.75,5.5,5.25,5,4.5,4,3.75,3.5,3.25,3,2.75,2.5,2.25,2,1.75,1.5,1.25,1,0.75,0.5],
 F1000:['6’35','6’45','6’55','7’05','7’15','7’25','7’35','7’45','7’55','8’05','8’15','8’25','8’35','8’45','8’55','9’05','9’15','9’25','9’35','9’55','10’15','10’35','10’55','11’15','11’35','11’55','12’15','12’55','13’15'].map(tMs),
 G1000:['5’55','6’05','6’15','6’25','6’35','6’45','6’55','7’05','7’15','7’25','7’35','7’45','7’55','8’05','8’15','8’25','8’35','8’45','8’55','9’05','9’15','9’25','9’35','9’55','10’15','10’45','11’15','11’55','12’15'].map(tMs),
 F2000:['13’10','13’30','13’50','14’10','14’30','14’50','15’10','15’30','15’50','16’10','16’30','16’50','17’10','17’30','17’50','18’10','18’30','18’50','19’10','19’50','20’30','21’10','21’50','22’30','23’10','23’50','24’30','25’50','26’30'].map(tMs),
 G2000:['11’50','12’10','12’30','12’50','13’10','13’30','13’50','14’10','14’30','14’50','15’10','15’30','15’50','16’10','16’30','16’50','17’10','17’30','17’50','18’10','18’30','18’50','19’10','19’50','20’30','21’30','22’30','23’50','24’30'].map(tMs),
 /* distance en 3’ : donnée tous les points ; entre deux lignes, répartition régulière (au quart de point le plus proche) */
 D3:{F:[[8,475],[7,430],[6,395],[5,370],[4,340],[3,315],[2,290],[1,265],[0.5,245]],G:[[8,530],[7,480],[6,440],[5,410],[4,380],[3,340],[2,315],[1,285],[0.5,275]]}};
const MCRIT=['Un pied toujours au sol','Bras actifs, coudes à 90°','Buste droit, regard loin'];
const SESS_SM=[
 {id:'s1',n:'S1',t:'Marche · technique et ma vitesse de marche',goal:'je marche sans jamais courir et je mesure ma vitesse de marche sur 3’.',crit:MCRIT,blocks:['mwarm','mtech',['m3','mx','3’ de marche à fond : ma vitesse de marche']]},
 {id:'s2',n:'S2',t:'Marche · mes trois allures',goal:'je tiens mes allures à 10 m près.',crit:['Allures bien différentes','Même vitesse du début à la fin','Respiration contrôlée'],blocks:['mwarm','mall',['m3','q','3’ avec projet de distance']]},
 {id:'s3',n:'S3',t:'Marche · le 1000 m',goal:'mon 1000 m arrive à 10 s près de mon temps visé.',crit:['Passage au 500 m respecté','Pas de course','Accélère dans le dernier tour'],blocks:['mwarm',['m1000','k1','1000 m avec temps visé'],['m3','q','3’ avec projet de distance']]},
 {id:'s4',n:'S4',t:'Marche · fractionné 3 × 3’',goal:'mes trois 3’ sont à 10 m près de ce que j’annonce.',crit:['Récupère en marchant lentement','Annonce réaliste','Technique propre quand c’est dur'],blocks:['mwarm','mfr',['m1000','k1','1000 m avec temps visé']]},
 {id:'s5',n:'S5',t:'Marche · régularité',goal:'mes deux 3’ ont moins de 15 m d’écart.',crit:['Même allure du début à la fin','Écoute les temps de passage','Projet ajusté entre les deux'],blocks:['mwarm',['m3','q','3’ n°1 avec projet'],['mpause','en','Récupérer entre les deux'],['m3','q2','3’ n°2 avec projet']]},
 {id:'s6',n:'S6',t:'Marche · épreuve blanche 1000 m / 3’',goal:'je m’échauffe seul et je repars avec ma note et mon point faible.',eval:true,crit:['Échauffement complet','Projet écrit avant de marcher','Départ du 1000 m maîtrisé'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m3','q','C2 · 3’ avec projet de distance'],'mnote','mpf']},
 {id:'s7',n:'S7',t:'Marche · mon point faible et mes projets',goal:'je règle mes projets pour l’épreuve.',crit:['Travail en lien avec son point faible','Annonces tenues','Projets cohérents avec ses chiffres'],blocks:['mwarm','mfr','mpe']},
 {id:'s8',n:'S8',t:'Marche · évaluation 1000 m / 3’',goal:'mon 1000 m est régulier et mon 3’ arrive à 5 m de mon projet.',eval:true,crit:['Échauffement seul et complet','Coach précis','Allure gérée sur les deux épreuves'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m3','q','C2 · 3’ avec projet de distance'],'mnote','situe']}
];
const SESS_TM=[
 {id:'t1',n:'T1',t:'Marche · technique et ma vitesse de marche',goal:'je marche sans jamais courir et je mesure ma vitesse de marche sur 3’.',crit:MCRIT,blocks:['mwarm','mtech',['m3','mx','3’ de marche à fond : ma vitesse de marche']]},
 {id:'t2',n:'T2',t:'Marche · mes trois allures',goal:'je tiens mes allures à 10 m près.',crit:['Allures bien différentes','Même vitesse du début à la fin','Respiration contrôlée'],blocks:['mwarm','mall',['m3','q','3’ avec projet de distance']]},
 {id:'t3',n:'T3',t:'Marche · le 1000 m',goal:'mon 1000 m arrive à 10 s près de mon temps visé.',crit:['Passage au 500 m respecté','Pas de course','Accélère dans le dernier tour'],blocks:['mwarm',['m1000','k1','1000 m avec temps visé'],['m3','q','3’ avec projet de distance']]},
 {id:'t4',n:'T4',t:'Marche · fractionné 3 × 3’',goal:'mes trois 3’ sont à 10 m près de ce que j’annonce.',crit:['Récupère en marchant lentement','Annonce réaliste','Technique propre quand c’est dur'],blocks:['mwarm','mfr',['m1000','k1','1000 m avec temps visé']]},
 {id:'t5',n:'T5',t:'Marche · 2 × 1000 m réguliers',goal:'mes deux 1000 m ont moins de 15 s d’écart.',crit:['Même allure sur les deux 1000 m','Récupération active','Passages au 500 m tenus'],blocks:['mwarm',['m1000','k1','1000 m n°1'],['mpause','en','Récupérer entre les deux'],['m1000','k2','1000 m n°2']]},
 {id:'t6',n:'T6',t:'Marche · nouvelle mesure et projet de 3’',goal:'mon 3’ arrive à 5 m de mon projet.',crit:['Mesure faite à fond','Projet ajusté à la nouvelle vitesse','Fin de 3’ maîtrisée'],blocks:['mwarm',['m3','mx','3’ à fond : nouvelle mesure'],['mpause','en','Récupérer'],['m3','q','3’ avec projet de distance']]},
 {id:'t7',n:'T7',t:'Marche · épreuve blanche 2 × 1000 m / 3’',goal:'je connais ma note et le point que je travaille en T8.',eval:true,crit:['Échauffement complet','Stratégie écrite avant chaque épreuve','Faible écart prévu / réalisé'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m1000','w2','C2 · 1000 m'],['mpause','en2','Entre C2 et C3'],['m3','q','C3 · 3’ avec projet de distance'],'mnote','mpf']},
 {id:'t8',n:'T8',t:'Marche · mon point faible et mes projets',goal:'je règle mes projets pour l’épreuve.',crit:['Travail en lien avec son point faible','Annonces tenues','Projets cohérents avec ses chiffres'],blocks:['mwarm','mfr','mpe']},
 {id:'t9',n:'T9',t:'Marche · épreuve 2 × 1000 m / 3’',goal:'mes 1000 m sont réguliers et mon 3’ arrive à 5 m de mon projet.',eval:true,crit:['Échauffement seul et complet','Coach précis','Allure gérée sur les trois épreuves'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m1000','w2','C2 · 1000 m'],['mpause','en2','Entre C2 et C3'],['m3','q','C3 · 3’ avec projet de distance'],'mnote','situe']}
];
const SBYM=Object.fromEntries(SESS_SM.concat(SESS_TM).map(s=>[s.id,s]));
