/* =====================================================================
   donnees.js — Demi-fond (Lycée G. Pompidou) : séances de Seconde (S1-S8) et de Terminale (T1-T9), barèmes.
   COMMUN à l'appli élève (demi-fond-eleves) et à l'outil prof (demi-fond-prof) :
   garder la même version dans les deux dépôts (les formats de QR et de fichiers en dépendent).
   ===================================================================== */
'use strict';
/* Seconde */
const BAR2={notes:[0.5,1,1.5,2,2.5,3,3.5,4],F3:[440,480,510,550,590,630,660,700],G3:[540,590,630,680,720,760,810,850],F130:[258,280,303,325,347,370,392,415],G130:[335,365,395,425,455,485,515,545]};
/* Terminale : référentiel du lycée (V2026) */
const BAR={notes:[0.3,0.6,1,1.3,1.6,2,2.3,2.6,3,3.3,3.6,4,4.3,4.6,5,5.3,5.6,6,6.3,6.6,7,7.3,7.6,8],
 F500:['3’30','3’16','3’13','2’54','2’51','2’44','2’39','2’34','2’30','2’27','2’23','2’20','2’15','2’12','2’09','2’07','2’05','2’02','2’00','1’58','1’55','1’53','1’51','1’50'],
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
  crit:['Échauffement complet (3 parties)','Projet écrit avant de courir','Départ du 3’ maîtrisé'],blocks:['warm',['c3','c3','C1 · 3’ au plot'],['p130','p','C2 · 1’30 avec projet'],'afl1','pf','vup','situe']},
 {id:'s7',n:'S7',t:'Mon point faible – projet final',goal:'je réussis 3 répétitions sur 4 de mon atelier et je fixe mes projets.',
  crit:['Atelier choisi selon son point faible','Respecte les cibles de l’atelier','Projet final cohérent avec ses chiffres'],blocks:[['i36',110,6],'at',['p130','p','1’30 avec projet final'],'pe']},
 {id:'s8',n:'S8',t:'Évaluation – 3’ / 10’ / 1’30',goal:'mon 3’ est régulier et mon 1’30 arrive en zone 4.',eval:true,
  crit:['Échauffement seul et complet','Coach précis : tours, mi-course, plot','Allure gérée sur les deux courses'],blocks:['warm',['c3','c3','C1 · 3’ au plot'],['p130','p','C2 · 1’30 avec projet'],'afl1','situe']}
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
  crit:['Échauffement complet','Stratégie écrite avant chaque course','Faible écart prévu / réalisé'],blocks:['warmT',['c500','e1','C1 · 500 m'],['c500','e2','C2 · 500 m'],['p130','p','C3 · 1’30 avec projet'],'afl1T','pfT','situe','rep']},
 {id:'t8',n:'T8',t:'Construire et réaliser ma séance',goal:'ma séance vise mon point faible et je réalise ce que j’ai prévu.',
  crit:['Séance en lien avec son point faible','Distances, % et récups respectés','Projet final réaliste'],blocks:['mine','real8','pfin']},
 {id:'t9',n:'T9',t:'Épreuve – 500 / 500 / 1’30',goal:'je tiens mes passages au 250 m et mon 1’30 arrive en zone 4.',eval:true,
  crit:['Échauffement seul et complet','Coach précis : passages, plot','Allure gérée sur les 3 courses'],blocks:['warmT',['c500','e1','C1 · 500 m'],['c500','e2','C2 · 500 m'],['p130','p','C3 · 1’30 avec projet'],'afl1T','rep']}
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
