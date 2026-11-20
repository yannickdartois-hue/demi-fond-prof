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
 {id:'s1',n:'S1',t:'Challenges du binôme – ma VMA',goal:'j’annonce mes 3 allures à 1 plot près, notre binôme tient son contrat de tours et je connais ma vitesse sur 3’ (provisoire).',
  crit:['Les 3 allures sont bien différentes','Même vitesse sur les 6 minutes','Parle encore pendant le footing'],blocks:['warm','al4','ct','ann','grp']},
 {id:'s2',n:'S2',t:'Ma VMA (test 36"/24"), mon 1’30 et des 400 m réguliers',goal:'je mesure ma VMA au test 36"/24" et mon 1’30, et mes 400 m sont à 2 s de mon temps prévu.',
  crit:['Court ses 10 × 36" à fond mais régulier','2e moitié du 1’30 aussi longue que la 1re','Mêmes temps sur les 3 × 400 m'],blocks:['warm','t3624','ra','m130',['ser','s','3 × 400 m à 85 % de ma VMA',[[400,85,'temps de course','E'],[400,85,'temps de course','E'],[400,85,'','E']]]]},
 {id:'s3',n:'S3',t:'Le 3’ au plot et le premier projet',goal:'mes 125 m sont à 2 s de mon temps annoncé, mon 3’ est régulier et mon 1’30 arrive à moins de 15 m de mon projet.',
  crit:['Annonce un temps réaliste sur 125 m','Respecte le passage à 1’30 du 3’','Accélère dans les 20 dernières secondes'],blocks:['warm',['ser','s','12 × 125 m à l’allure de ton 1’30, en alternance',Array.from({length:12},(_,i)=>[125,108,i<11?'alternance':''])],['c3','c3','Le 3’ au plot'],['p130','p','1’30 avec projet']]},
 {id:'s4',n:'S4',t:'Tenir son projet fatigué',goal:'mon 1’30, fait 6 min après le 3’, arrive en zone 3 ou 4, et je tiens mes 400 m et 200 m fatigué.',
  crit:['Fait sa récupération active','Ajuste son projet avec le coach','Tient les 200 m après les 400 m'],blocks:['warm',['c3','c3','Le 3’ au plot'],['p130','p','1’30 avec projet, 6 min après le 3’'],['ser','s','2 × (400 m + 200 m) : l’épreuve en miniature',[[400,100,'1’'],[200,108,'5’'],[400,100,'1’'],[200,108,'']]],['txt','aj','J’ai ajusté mon projet parce que…']]},
 {id:'s5',n:'S5',t:'Régularité sur 3’',goal:'mes 300 m sont à 2 s près et mes deux 3’ ont moins de 20 m d’écart.',
  crit:['Mêmes temps sur les 6 × 300 m','Écoute les temps de passage','2e 3’ à l’allure annoncée'],blocks:['warm',['ser','s','6 × 300 m réguliers, en alternance',[[300,95,'3’'],[300,95,'3’'],[300,95,'3’'],[300,95,'3’'],[300,95,'3’'],[300,95,'']]],['c3','c3','3’ n°1'],['c3','c3b','3’ n°2 à l’allure annoncée'],'ec2',['p130','p','1’30 avec projet']]},
 {id:'s6',n:'S6',t:'Épreuve blanche – 3’ / 10’ / 1’30',goal:'je m’échauffe seul et je repars avec ma note et mon point faible.',eval:true,
  crit:['Échauffement complet (3 parties)','Projet écrit avant de courir','Départ du 3’ maîtrisé'],blocks:['warm',['c3','c3','C1 · 3’ au plot'],['entre','en','Entre le 3’ et le 1’30'],['p130','p','C2 · 1’30 avec projet'],'afl1','pf','vup','situe']},
 {id:'s7',n:'S7',t:'Mon point faible – projet final',goal:'je travaille mon point faible et je vis la routine de l’épreuve : 3’, 10’ de récupération, 1’30.',
  crit:['Atelier choisi selon son point faible','Récupération de 10’ organisée','Projet final cohérent avec ses chiffres'],blocks:['warm','at',['c3','c3','Répétition générale : 3’ à 95 % (annoncé)'],['entre','en','10’ de récupération, comme à l’épreuve'],['p130','p','1’30 avec projet final'],'pe']},
 {id:'s8',n:'S8',t:'Évaluation – 3’ / 10’ / 1’30',goal:'mon 3’ est régulier et mon 1’30 arrive en zone 4.',eval:true,
  crit:['Échauffement seul et complet','Coach précis : tours, mi-course, plot','Allure gérée sur les deux courses'],blocks:['warm',['c3','c3','C1 · 3’ au plot'],['entre','en','Entre le 3’ et le 1’30'],['p130','p','C2 · 1’30 avec projet'],'afl1','situe']}
];
/* ---- Terminale : 9 séances (carnet de Terminale, référentiel du lycée) ---- */
const R5=n=>Array(n).fill([300,110,'5’']);
const SESS_T=[
 {id:'t1',n:'T1',t:'Parcourir 5 km à 2 et observer',goal:'notre binôme tient son temps visé à 30 s près, je connais mon temps sur 500 m et j’estime mon 1’30.',
  crit:['Relais propres, dans la zone','Tours réguliers','500 m sans départ trop rapide'],blocks:['warm','rel5',['c500','r1','500 m de référence'],'e130']},
 {id:'t2',n:'T2',t:'Alterner des allures et trouver sa VMA',goal:'je tiens chaque allure au tour à 2 s près et je vais au bout du test 36"/24".',
  crit:['Temps au tour respectés','Allures de plus en plus rapides','Va au bout du test'],blocks:['warm','tours','t3624']},
 {id:'t3',n:'T3',t:'Travail du 1er 500 – intermittent 36"/36"',goal:'mes temps réalisés sont à 2 s près de mes temps prévus et je tiens mon passage au 250 m.',
  crit:['Passage au 250 m annoncé et tenu','Allure stable sur chaque distance','Plots respectés en 36"/36"'],blocks:['warm',['ser','s','Varier les allures et coacher',[[500,90,'4’'],[400,95,'3’30'],[300,100,'3’'],[200,110,'2’'],[100,120,'2’'],[100,130,'']]],['ser','s2','4 × 250 m à l’allure visée du 500 m, en alternance',[[250,115,'2’'],[250,115,'2’'],[250,115,'2’'],[250,115,'']]],['ra2',70,180],['i36m',[[110,5],[120,5]]]]},
 {id:'t4',n:'T4',t:'Intermittent 1’12 et pyramide',goal:'j’atteins ma coupelle à chaque 1’12 et je tiens les temps de la pyramide.',
  crit:['Coupelle atteinte à chaque 1’12','Récupération respectée','Accélère sur la fin de la pyramide'],blocks:['warm',['i112',95,6],['ra2',70,180],['ser','s','Travail en pyramide',[[125,90,'2’'],[250,95,'2’30'],[375,100,'3’'],[500,110,'5’'],[375,115,'4’'],[250,120,'3’30'],[125,130,'']]]]},
 {id:'t5',n:'T5',t:'Re-test et travail du 2e 500 m',goal:'je mesure ma nouvelle VMA et je finis mes 200 m aussi vite que mes 300 m, fatigué.',
  crit:['Va au bout du re-test','Même allure sur le 300 et le 200 m','1’30 en zone 3 ou 4'],blocks:['warm','rt',['ser','s','3 × (300 m + 200 m) à l’allure du 500 m',[[300,115,'1’'],[200,115,'5’'],[300,115,'1’'],[200,115,'5’'],[300,115,'1’'],[200,115,'']]],['p130','p','1’30 avec projet']]},
 {id:'t6',n:'T6',t:'Travail du dernier 500 m – résister',goal:'je tiens l’intensité jusqu’au bout et mon 2e 500 m est à moins de 3 s du 1er.',
  crit:['Bras actifs en fin de course','Récupération de 10’ organisée','2e 500 m géré comme le 1er'],blocks:['warm',['ser','s','Résistance : 100 à 300 m',[[100,100,'2’'],[200,105,'2’30'],[250,110,'3’'],[300,120,'']]],['c500','k1','500 m n°1'],['entre','en','10’ de récupération, comme à l’épreuve'],['c500','k2','500 m n°2']]},
 {id:'t7',n:'T7',t:'Épreuve blanche – 500 / 500 / 1’30',goal:'je connais ma note AFL1 et le point que je travaille en T8.',eval:true,
  crit:['Échauffement complet','Stratégie écrite avant chaque course','Faible écart prévu / réalisé'],blocks:['warmT',['c500','e1','C1 · 500 m'],['entre','en','Entre C1 et C2'],['c500','e2','C2 · 500 m'],['entre','en2','Entre C2 et C3'],['p130','p','C3 · 1’30 avec projet'],'afl1T','pfT','situe','rep']},
 {id:'t8',n:'T8',t:'Construire et réaliser ma séance',goal:'ma séance vise mon point faible et je réalise ce que j’ai prévu.',
  crit:['Séance en lien avec son point faible','Distances, % et récups respectés','Projet final réaliste'],blocks:['warm','mine','real8','pfin']},
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
/* Foulée vue par le coach (d'après la fiche coach/juge AFL3 de l'équipe EPS) : critère observable, conseil si « à revoir » */
const FOULEE=[['Regard loin devant, tête droite','Regarde loin devant, à 20 m, pas tes pieds.'],
 ['Buste presque droit, gainé','Grandis-toi : buste droit, bassin sous toi, sans te pencher.'],
 ['Bras à 90°, ils balancent d’avant en arrière','Coudes à 90°, les bras balancent d’avant en arrière, pas devant toi.'],
 ['Pied posé sous le corps, sans bruit','Pose le pied sous toi, sans bruit : ta foulée doit être légère.'],
 ['Respiration régulière','Cale ta respiration sur tes pas : par exemple 2 pas pour inspirer, 2 pas pour expirer.'],
 ['Relâché : épaules basses, mains détendues','Relâche les épaules et les mains : la crispation te coupe le souffle.']];
const RPE_TXT=['0 · repos','1 · très, très facile','2 · facile','3 · modéré : je parle en phrases','4 · un peu dur','5 · dur : je parle par mots','6 · dur +','7 · très dur','8 · très dur +','9 · presque maximal','10 · maximal : je ne peux plus parler'];
/* Échauffement (fiche GAREEPS du lycée) : cardio avec les 3 signes, articulaire dans un ordre fixe,
   étirements actifs-dynamiques (C. Geoffroy), renforcement, gammes au choix, passage à l'allure du jour. */
const WARM_EX=[
 [['f','Footing de plus en plus vite (60 → 70 %)'],['tf','Talons-fesses'],['mg','Montées de genoux'],['pc','Pas chassés'],['sg1','✓ J’ai chaud, je transpire'],['sg2','✓ Je respire vite, je parle encore'],['sg3','✓ Pouls 150-160 (15" × 4)']],
 [['ch','1 · Chevilles'],['ge','2 · Genoux et hanches'],['tr','3 · Tronc'],['ep','4 · Épaules'],['pg','5 · Poignets'],['nu','6 · Nuque (demi-cercles)']],
 [['e1','Mollets'],['e2','Ischio-jambiers'],['e3','Quadriceps'],['e4','Fléchisseurs de hanche']],
 [['sq','Squats'],['fe','Fentes'],['po','Montées sur pointes'],['ga','Gainage face'],['gl','Gainage latéral'],['pm','Pompes (genoux au sol possible)']],
 [],
 [['ac','3 accélérations progressives (60-80 m)'],['al','1 passage à l’allure du jour, au plot']]];
/* 4 étirements actifs-dynamiques : allonger puis contracter sans bouger 4 s, freiner en contractant 4 s, relâcher, 8 s de mouvement. Chaque côté. */
const ETIR=[
 ['e1','Mollets','etir-mollets.jpg','Fente avant, jambe arrière tendue, talon au sol : pousse l’avant du pied arrière dans le sol.','Fléchis doucement le genou arrière, talon toujours au sol.','Petits sauts pieds joints sur l’avant du pied.'],
 ['e2','Ischio-jambiers','etir-ischios.jpg','Jambe avant tendue, talon au sol, pointe relevée : enfonce le talon dans le sol.','Penche le buste vers le genou en appuyant toujours.','Talons-fesses rapides.'],
 ['e3','Quadriceps','etir-quadriceps.jpg','Debout, tiens ta cheville, bassin basculé vers l’arrière : pousse le pied contre la main.','Rapproche le pied de la fesse en poussant toujours.','Fentes avant-arrière sautées.'],
 ['e4','Fléchisseurs de hanche','etir-hanche.jpg','Grande fente, genou arrière près du sol, bassin vers l’avant : tire le genou arrière vers l’avant sans le bouger.','Descends un peu le bassin en tirant toujours.','Montées de genoux.']];
/* Catalogue de gammes : l'élève en choisit 4 (20 à 30 m, retour en trottinant). */
const GAMMES=[
 ['g1','Talons-fesses','gamme-talons-fesses.jpg','Buste droit, talons ramenés sous les fesses.','Le talon touche presque la fesse, le genou reste vers le bas.'],
 ['g2','Montées de genoux','gamme-montees-genoux.jpg','Cuisse à l’horizontale, bras actifs.','Je reste grand, je ne me penche pas en arrière.'],
 ['g3','Skipping bas','gamme-skipping-bas.jpg','Petits pas très rapides sur l’avant du pied.','Fréquence élevée, talons jamais au sol.'],
 ['g4','Foulées griffées (« le cheval »)','gamme-griffe.jpg','Genou haut, la jambe se déplie puis griffe le sol vers l’arrière.','Le pied se pose sous le bassin, sur l’avant du pied.'],
 ['g5','Foulées bondissantes','gamme-bondissantes.jpg','Sauter loin d’un pied sur l’autre.','Cheville, genou et hanche tendus à chaque poussée.'],
 ['g6','Course sur la plante des pieds','gamme-plante-pieds.jpg','Courir en ressort sans poser le talon.','Rebond souple, pas de bruit au sol.'],
 ['g7','Mise en tension du pied','gamme-tension-pied.jpg','Jambes presque tendues, seule la cheville travaille, pointe relevée.','Pose active de l’avant du pied.'],
 ['g8','Enjamber le bâtonnet','gamme-batonnet.jpg','À chaque pas, le pied passe au-dessus de la cheville opposée.','Cycle de jambe complet et régulier.'],
 ['g9','Jambes tendues','gamme-jambes-tendues.jpg','Jambes raides lancées vers l’avant, pose sous le bassin.','Bassin haut, pas de recul du buste.'],
 ['g10','Pas chassés','gamme-pas-chasses.jpg','De côté, les pieds ne se croisent jamais.','Bassin de face, appuis légers.'],
 ['g11','Pas croisés','gamme-pas-croises.jpg','De côté, le pied passe devant puis derrière.','Les épaules restent de face, les hanches tournent.'],
 ['g12','Course arrière','gamme-course-arriere.jpg','Courir à reculons sur l’avant du pied.','Regard par-dessus l’épaule, trajectoire droite.'],
 ['g13','Skipping marché','gamme-skipping-marche.jpg','En marchant, monte le genou, pose le pied activement sous toi.','Jambe d’appui toujours tendue.'],
 ['g14','Montée de genou puis extension','gamme-genou-extension.jpg','Monte le genou, déplie la jambe, griffe le sol.','Enchaînement fluide, sans à-coups.'],
 ['g15','Rebonds pieds joints','gamme-rebonds.jpg','Petits sauts réactifs, chevilles toniques.','Temps de contact très court.'],
 ['g16','Pas sautillés','gamme-pas-sautilles.jpg','Sautille d’un pied sur l’autre, genou opposé qui monte, bras en opposition.','Rythme régulier, buste droit.'],
 ['g17','Montées de genoux latérales','gamme-genoux-lateral.jpg','De côté, monte le genou à chaque pas.','Bassin de face, pieds qui ne se croisent pas.'],
 ['g18','Cloche-pied alterné','gamme-cloche-pied.jpg','3 bonds sur un pied, 3 sur l’autre, en avançant.','Réception sur l’avant du pied, bassin stable.'],
 ['g19','Fentes marchées','gamme-fentes-marchees.jpg','Grand pas, genou arrière proche du sol, et on enchaîne.','Genou avant au-dessus de la cheville, buste droit.'],
 ['g20','Balancés de jambe en marchant','gamme-balances.jpg','Lance la jambe tendue devant, main opposée vers le pied.','Jambe d’appui tendue, mouvement contrôlé.'],
 ['g21','Course au ralenti','gamme-ralenti.jpg','Cours très lentement en décomposant chaque phase : genou qui monte, jambe qui se déplie, pied qui se pose sous le bassin.','Mouvement complet et contrôlé, buste droit.'],
 ['g22','Coordination bras-jambes','gamme-coordination.jpg','Cours en insistant sur les bras : bras opposé à la jambe qui monte, coudes à 90°, mains des hanches au menton.','Les bras rythment la foulée, les épaules restent basses.'],
 ['g23','Rythme de foulée (cibles au sol)','gamme-rythme-foulee.jpg','Cerceaux ou coupelles à espacement régulier : un appui dans chaque cible, sans changer de rythme.','Appuis dans les cibles, foulée régulière, regard devant.']];
WARM_EX[4]=GAMMES.map(g=>[g[0],g[1]]);
/* anciens codes (carnets déjà remplis) */
const WARM_OLD=[['ha','Hanches'],['cr','Pas croisés'],['sk','Skipping'],['gr','Foulées griffées'],['bo','Foulées bondissantes']];
/* coches globales par partie (échauffement commun au binôme) */
const WARM_PART=[['P1','Cardio fait'],['P2','Articulaire fait'],['P3','Étirements faits'],['P4','Renforcement fait'],['P5','Gammes faites'],['P6','Fin d’échauffement faite']];
const WARM_NAME=Object.fromEntries([].concat(...WARM_EX,WARM_OLD,WARM_PART));

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
/* v5.0 : anciennes séances marche, gardées pour les carnets déjà remplis (d.v5 absent) */
const SESS_SM_OLD=[
 {id:'s1',n:'S1',t:'Marche · technique et ma vitesse de marche',goal:'je marche sans jamais courir et je mesure ma vitesse de marche sur 3’.',crit:MCRIT,blocks:['mwarm','mtech',['m3','mx','3’ de marche à fond : ma vitesse de marche'],['mpause','en','Récupérer avant les allures'],'mall',['m3','q','3’ avec projet de distance (d’après ma vitesse)']]},
 {id:'s2',n:'S2',t:'Marche · mes trois allures',goal:'je tiens mes allures à 10 m près.',crit:['Allures bien différentes','Même vitesse du début à la fin','Respiration contrôlée'],blocks:['mwarm','mtech','mall',['m3','q','3’ avec projet de distance'],['m1000','k1','1000 m : je découvre mon temps']]},
 {id:'s3',n:'S3',t:'Marche · le 1000 m',goal:'mon 1000 m arrive à 10 s près de mon temps visé.',crit:['Passage au 500 m respecté','Pas de course','Accélère dans le dernier tour'],blocks:['mwarm',['m1000','k1','1000 m avec temps visé'],['m3','q','3’ avec projet de distance'],['mpause','en','Récupérer'],'mall']},
 {id:'s4',n:'S4',t:'Marche · fractionné 3 × 3’',goal:'mes trois 3’ sont à 10 m près de ce que j’annonce.',crit:['Récupère en marchant lentement','Annonce réaliste','Technique propre quand c’est dur'],blocks:['mwarm','mtech','mfr',['m1000','k1','1000 m avec temps visé'],['m3','q','3’ avec projet de distance']]},
 {id:'s5',n:'S5',t:'Marche · régularité',goal:'mes deux 3’ ont moins de 15 m d’écart.',crit:['Même allure du début à la fin','Écoute les temps de passage','Projet ajusté entre les deux'],blocks:['mwarm',['m3','q','3’ n°1 avec projet'],['mpause','en','Récupérer entre les deux'],['m3','q2','3’ n°2 avec projet'],['mpause','en2','Récupérer'],['m1000','k1','1000 m avec temps visé']]},
 {id:'s6',n:'S6',t:'Marche · épreuve blanche 1000 m / 3’',goal:'je m’échauffe seul et je repars avec ma note et mon point faible.',eval:true,crit:['Échauffement complet','Projet écrit avant de marcher','Départ du 1000 m maîtrisé'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m3','q','C2 · 3’ avec projet de distance'],'mnote','mpf']},
 {id:'s7',n:'S7',t:'Marche · mon point faible et mes projets',goal:'je règle mes projets pour l’épreuve.',crit:['Travail en lien avec son point faible','Annonces tenues','Projets cohérents avec ses chiffres'],blocks:['mwarm','mfr',['m1000','k1','1000 m avec temps visé'],['mpause','en','Récupérer'],['m3','q','3’ avec projet de distance'],'mpe']},
 {id:'s8',n:'S8',t:'Marche · évaluation 1000 m / 3’',goal:'mon 1000 m est régulier et mon 3’ arrive à 5 m de mon projet.',eval:true,crit:['Échauffement seul et complet','Coach précis','Allure gérée sur les deux épreuves'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m3','q','C2 · 3’ avec projet de distance'],'mnote','situe']}
];
const SESS_TM_OLD=[
 {id:'t1',n:'T1',t:'Marche · technique et ma vitesse de marche',goal:'je marche sans jamais courir et je mesure ma vitesse de marche sur 3’.',crit:MCRIT,blocks:['mwarm','mtech',['m3','mx','3’ de marche à fond : ma vitesse de marche'],['mpause','en','Récupérer avant les allures'],'mall',['m3','q','3’ avec projet de distance (d’après ma vitesse)']]},
 {id:'t2',n:'T2',t:'Marche · mes trois allures',goal:'je tiens mes allures à 10 m près.',crit:['Allures bien différentes','Même vitesse du début à la fin','Respiration contrôlée'],blocks:['mwarm','mtech','mall',['m3','q','3’ avec projet de distance'],['m1000','k1','1000 m : je découvre mon temps']]},
 {id:'t3',n:'T3',t:'Marche · le 1000 m',goal:'mon 1000 m arrive à 10 s près de mon temps visé.',crit:['Passage au 500 m respecté','Pas de course','Accélère dans le dernier tour'],blocks:['mwarm',['m1000','k1','1000 m avec temps visé'],['m3','q','3’ avec projet de distance'],['mpause','en','Récupérer'],'mall']},
 {id:'t4',n:'T4',t:'Marche · fractionné 3 × 3’',goal:'mes trois 3’ sont à 10 m près de ce que j’annonce.',crit:['Récupère en marchant lentement','Annonce réaliste','Technique propre quand c’est dur'],blocks:['mwarm','mtech','mfr',['m1000','k1','1000 m avec temps visé'],['m3','q','3’ avec projet de distance']]},
 {id:'t5',n:'T5',t:'Marche · 2 × 1000 m réguliers',goal:'mes deux 1000 m ont moins de 15 s d’écart.',crit:['Même allure sur les deux 1000 m','Récupération active','Passages au 500 m tenus'],blocks:['mwarm',['m1000','k1','1000 m n°1'],['mpause','en','Récupérer entre les deux'],['m1000','k2','1000 m n°2'],['mpause','en2','Récupérer'],['m3','q','3’ avec projet de distance']]},
 {id:'t6',n:'T6',t:'Marche · nouvelle mesure et projet de 3’',goal:'mon 3’ arrive à 5 m de mon projet.',crit:['Mesure faite à fond','Projet ajusté à la nouvelle vitesse','Fin de 3’ maîtrisée'],blocks:['mwarm',['m3','mx','3’ à fond : nouvelle mesure'],['mpause','en','Récupérer'],['m3','q','3’ avec projet de distance'],['mpause','en2','Récupérer'],['m1000','k1','1000 m avec temps visé']]},
 {id:'t7',n:'T7',t:'Marche · épreuve blanche 2 × 1000 m / 3’',goal:'je connais ma note et le point que je travaille en T8.',eval:true,crit:['Échauffement complet','Stratégie écrite avant chaque épreuve','Faible écart prévu / réalisé'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m1000','w2','C2 · 1000 m'],['mpause','en2','Entre C2 et C3'],['m3','q','C3 · 3’ avec projet de distance'],'mnote','mpf']},
 {id:'t8',n:'T8',t:'Marche · mon point faible et mes projets',goal:'je règle mes projets pour l’épreuve.',crit:['Travail en lien avec son point faible','Annonces tenues','Projets cohérents avec ses chiffres'],blocks:['mwarm','mfr',['m1000','k1','1000 m avec temps visé'],['mpause','en','Récupérer'],['m3','q','3’ avec projet de distance'],'mpe']},
 {id:'t9',n:'T9',t:'Marche · épreuve 2 × 1000 m / 3’',goal:'mes 1000 m sont réguliers et mon 3’ arrive à 5 m de mon projet.',eval:true,crit:['Échauffement seul et complet','Coach précis','Allure gérée sur les trois épreuves'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m1000','w2','C2 · 1000 m'],['mpause','en2','Entre C2 et C3'],['m3','q','C3 · 3’ avec projet de distance'],'mnote','situe']}
];
const SBYM_OLD=Object.fromEntries(SESS_SM_OLD.concat(SESS_TM_OLD).map(s=>[s.id,s]));
/* v5.0 : contenu marche renforcé — même durée d'effort que la course, plus de variété, du travail au-dessus
   de l'allure d'épreuve, des gammes de marche et le travail des passages. Séries calculées sur la vitesse de marche. */
const MR=(n,dist,pct,rec)=>Array.from({length:n},(_,i)=>[dist,pct,i<n-1?rec:'']);
const MG=['mwarm','mgam'];
const SESS_SM=[
 {id:'s1',n:'S1',t:'Marche · technique et ma vitesse de marche',goal:'je marche sans jamais courir, je mesure ma vitesse de marche sur 3’ et je tiens mes 3 allures à 10 m près.',crit:MCRIT,blocks:[...MG,['m3','mx','3’ de marche à fond : ma vitesse de marche'],['mpause','en','Récupérer avant les allures'],'mall2']},
 {id:'s2',n:'S2',t:'Marche · vite sur 200 m et mon 1000 m',goal:'mes 200 m sont à 2 s de mon temps prévu et je découvre mon temps sur 1000 m.',crit:['Démarre vite sans courir','Technique propre sur les derniers 200 m','Récupère en marchant lentement'],blocks:[...MG,['ser','s','6 × 200 m à 105 % de ma vitesse de marche',MR(6,200,105,'1’30')],['mpause','en','Récupérer avant le 1000 m'],['m1000','k1','1000 m : je découvre mon temps']]},
 {id:'s3',n:'S3',t:'Marche · le 1000 m et ses passages',goal:'mon 1000 m arrive à 10 s de mon temps visé et mes 250 m sont réguliers.',crit:['Passages au 250 m tenus','Même allure sur chaque 250 m','Accélère dans le dernier tour'],blocks:['mwarm',['m1000','k1','1000 m avec temps visé et passages au 250 m',1],['mpause','en','Récupérer'],['ser','s','4 × 250 m à l’allure de mon 1000 m',MR(4,250,97,'1’30')],['m3','q','3’ avec projet de distance']]},
 {id:'s4',n:'S4',t:'Marche · fractionné 3 × 3’ et 500 m',goal:'mes trois 3’ sont à 10 m de ce que j’annonce et mes 500 m sont réguliers.',crit:['Annonce réaliste','Technique propre quand c’est dur','Ne part pas plus vite que son annonce'],blocks:[...MG,'mfr',['ser','s','2 × 500 m à 100 % de ma vitesse de marche',MR(2,500,100,'3’')],['m3','q','3’ avec projet de distance']]},
 {id:'s5',n:'S5',t:'Marche · pyramide et régularité',goal:'ma pyramide est à 2 s de mes temps prévus et mes deux 3’ ont moins de 15 m d’écart.',crit:['Même allure du début à la fin','Écoute les temps de passage','Projet ajusté entre les deux 3’'],blocks:['mwarm',['ser','s','Pyramide 200 – 400 – 600 – 400 – 200 m',[[200,105,'1’30'],[400,100,'2’'],[600,95,'2’30'],[400,100,'2’'],[200,105,'']]],['m3','q','3’ n°1 avec projet'],['mpause','en','Récupérer entre les deux'],['m3','q2','3’ n°2 avec projet']]},
 SESS_SM_OLD[5],
 {id:'s7',n:'S7',t:'Marche · mon point faible et la répétition',goal:'je travaille mon point faible et je règle mes projets pour l’épreuve.',crit:['Travail en lien avec son point faible','Annonces tenues','Projets cohérents avec ses chiffres'],blocks:['mwarm','mat',['m1000','k1','Répétition : 1000 m avec temps visé',1],['mpause','en','Récupérer'],['m3','q','3’ avec projet de distance'],'mpe']},
 SESS_SM_OLD[7]];
const SESS_TM=[
 Object.assign({},SESS_SM[0],{id:'t1',n:'T1'}),
 Object.assign({},SESS_SM[1],{id:'t2',n:'T2',blocks:[...MG,['ser','s','8 × 200 m à 105 % de ma vitesse de marche',MR(8,200,105,'1’30')],['mpause','en','Récupérer avant le 1000 m'],['m1000','k1','1000 m : je découvre mon temps']]}),
 Object.assign({},SESS_SM[2],{id:'t3',n:'T3',blocks:['mwarm',['m1000','k1','1000 m avec temps visé et passages au 250 m',1],['mpause','en','Récupérer'],['ser','s','6 × 250 m à l’allure de mon 1000 m',MR(6,250,97,'1’30')],['m3','q','3’ avec projet de distance']]}),
 Object.assign({},SESS_SM[3],{id:'t4',n:'T4',blocks:[...MG,'mfr',['ser','s','3 × 500 m à 100 % de ma vitesse de marche',MR(3,500,100,'3’')],['m3','q','3’ avec projet de distance']]}),
 {id:'t5',n:'T5',t:'Marche · 2 × 1000 m réguliers',goal:'mes deux 1000 m ont moins de 15 s d’écart et mes 200 m sont à 2 s de mon temps prévu.',crit:['Même allure sur les deux 1000 m','Récupération active','Passages au 250 m tenus'],blocks:['mwarm',['m1000','k1','1000 m n°1',1],['mpause','en','Récupérer entre les deux'],['m1000','k2','1000 m n°2',1],['mpause','en2','Récupérer'],['ser','s','4 × 200 m à 105 % de ma vitesse de marche',MR(4,200,105,'1’30')]]},
 {id:'t6',n:'T6',t:'Marche · nouvelle mesure, 200 m et projet de 3’',goal:'je mesure ma nouvelle vitesse, mes 200 m sont à 2 s et mon 3’ arrive à 5 m de mon projet.',crit:['Mesure faite à fond','Projet ajusté à la nouvelle vitesse','Fin de 3’ maîtrisée'],blocks:['mwarm',['m3','mx','3’ à fond : nouvelle mesure'],['mpause','en','Récupérer'],['ser','s','8 × 200 m à 105 % de ma vitesse de marche',MR(8,200,105,'1’30')],['mpause','en2','Récupérer'],['m3','q','3’ avec projet de distance']]},
 SESS_TM_OLD[6],
 {id:'t8',n:'T8',t:'Marche · mon point faible et la répétition',goal:'je travaille mon point faible et je règle mes projets pour l’épreuve.',crit:['Travail en lien avec son point faible','Annonces tenues','Projets cohérents avec ses chiffres'],blocks:['mwarm','mat',['m1000','k1','Répétition : 1000 m avec temps visé',1],['mpause','en','Récupérer'],['m3','q','3’ avec projet de distance'],'mpe']},
 SESS_TM_OLD[8]];
const SBYM=Object.fromEntries(SESS_SM.concat(SESS_TM).map(s=>[s.id,s]));
/* gammes de marche (carte, 4 sur 6 au choix) */
const GAM_M=[['tp','Talon-pointe exagéré','Pose franche du talon, le pied se déroule jusqu’à la pointe.'],['br','Bras seuls','Coudes à 90°, mains des hanches à la poitrine, épaules basses.'],['li','Sur une ligne','Pieds posés sur la ligne : le bassin tourne.'],['jt','Jambe tendue','Genou tendu quand le pied passe sous le corps.'],['ac','Accélérations sur 20 m','Toujours un pied au sol : tu accélères sans courir.'],['sg','Lent puis vite au signal','Le coach frappe dans les mains : tu changes d’allure.']];

/* =====================================================================
   v5.0 · BILAN : ce que le coach observe (3 comportements par séance, après le prénom),
   conseils reliés aux chiffres, objectifs vérifiables à la séance suivante.
   ===================================================================== */
const OBS_C={
 s1:['change vraiment de vitesse entre les 3 allures','garde la même foulée du début à la fin du contrat','peut encore parler pendant le footing'],
 s2:['part fort sans sprinter à chaque 36"','garde des bras actifs dans les 20 dernières secondes du 1’30','relance quand je lui donne le passage au 200 m'],
 s3:['annonce son temps avant de partir','ajuste son allure quand je crie le passage à 1’30','accélère dans les 20 dernières secondes'],
 s4:['marche ou trottine pendant la récup, sans s’asseoir','discute de son projet avec moi avant le 1’30','garde des bras actifs sur le 200 m'],
 s5:['ne sprinte pas les 50 premiers mètres','ajuste son allure quand je donne le passage','garde la même foulée dans le dernier tour'],
 s6:['fait seul les 3 parties de l’échauffement','écrit son projet avant de courir','ne dépasse pas son allure annoncée au 1er tour du 3’'],
 s7:['choisit l’atelier de son point faible','reste actif pendant les 10’ de récup','garde son allure sans suivre les autres'],
 s8:['s’échauffe seul et complètement','part du 3’ à l’allure annoncée','finit le 1’30 en accélérant'],
 t1:['passe le relais dans la zone sans s’arrêter','garde la même foulée tour après tour','ne sprinte pas les 100 premiers mètres du 500 m'],
 t2:['écoute le temps au tour et corrige','accélère vraiment à chaque palier','va au bout du test sans s’arrêter avant le sifflet'],
 t3:['ne sprinte pas au départ de chaque distance','trottine pendant les récups','arrive au plot au sifflet, sans s’arrêter avant'],
 t4:['atteint la coupelle sans sprint final','récupère en marchant, pas assis','garde des bras actifs dans la fin du 500 m'],
 t5:['va au bout du re-test','garde sur le 200 m la foulée du 300 m','finit le 1’30 en accélérant'],
 t6:['garde des bras actifs dans les 100 derniers mètres','reste actif pendant les 10’ de récup','repart sur le 2e 500 m au même rythme que le 1er'],
 t7:['s’échauffe seul et complètement','écrit sa stratégie avant chaque course','ne part pas plus vite que l’allure annoncée'],
 t8:['respecte les distances et récups prévues','ne court pas plus vite que le % prévu','ajuste son projet final avec moi'],
 t9:['s’échauffe seul et complètement','écrit sa stratégie avant chaque course','ne part pas plus vite que l’allure annoncée']};
const OBS_M0={m1:['garde toujours un pied au sol, ne court jamais','a la jambe d’appui tendue sous le corps','balance les bras, coudes à 90°'],
 m2:['démarre vite sans se mettre à courir','garde une technique propre sur les derniers 200 m','récupère en marchant lentement'],
 m3:['écoute le passage au 250 m et ajuste','garde la même allure sur chaque 250 m','accélère dans le dernier tour'],
 m4:['fait une annonce réaliste','garde une technique propre quand c’est dur','ne part pas plus vite que son annonce'],
 ep:['s’échauffe seul et complètement','écrit son projet avant de marcher','ne part pas plus vite que prévu au 1er tour'],
 pf:['travaille sur son point faible','tient ses annonces','fait des projets qui collent à ses chiffres']};
const OBS_M={s1:OBS_M0.m1,s2:OBS_M0.m2,s3:OBS_M0.m3,s4:OBS_M0.m4,s5:['garde la même allure du début à la fin','écoute les temps de passage','ajuste son projet entre les deux 3’'],s6:OBS_M0.ep,s7:OBS_M0.pf,s8:OBS_M0.ep,
 t1:OBS_M0.m1,t2:OBS_M0.m2,t3:OBS_M0.m3,t4:OBS_M0.m4,t5:['garde la même allure sur les deux 1000 m','récupère en marchant sans s’arrêter','écoute les passages au 250 m'],t6:['marche à fond pendant la mesure','ajuste son projet à sa nouvelle vitesse','finit le 3’ en gardant sa technique'],t7:OBS_M0.ep,t8:OBS_M0.pf,t9:OBS_M0.ep};
/* signal (lu dans les chiffres) → conseils proposés au coach */
const CONSEILS={
 fin:['Pars à l’allure de la fin : au 1er passage, tu dois être légèrement en retard.','Dans les 100 derniers mètres, ce sont tes bras qui relancent : coudes à 90°, ils poussent vers l’arrière.'],
 prudent:['Tu as de la marge : pars un peu plus vite, ou monte ton projet de 10 m.'],
 projHaut:['Baisse ton projet de 5 à 10 m, ou vise le milieu du projet à mi-temps.'],
 projBas:['Monte ton projet de 5 à 10 m : tu es capable de plus.'],
 irreg:['À chaque passage, ajuste tout de suite : en avance, relâche ; en retard, relance.'],
 lent:['Pendant la récup, ne t’arrête pas : tu repartiras plus facilement.','Écoute le passage à mi-distance et relance.'],
 vite:['Ne regarde que ton passage : c’est ton allure, pas celle du groupe.'],
 plotTot:['Les 10 premiers mètres décident tout : démarre franchement mais sans sprinter.'],
 plotTard:['Démarre dès le coup de sifflet, ne regarde pas autour de toi.'],
 coupelle:['Récupère en trottinant et garde la même foulée jusqu’à la coupelle.'],
 tech:['Quand c’est dur, pense « jambe tendue, bras actifs » : c’est la technique qui fait la vitesse.'],
 ok:['C’est juste : garde exactement ce départ et cette allure.']};
const CONSEILS_GEN=['Pars moins vite','Sois plus régulier','Écoute les temps de passage','Accélère à la fin'];
/* niveau de coaching : 1 je constate · 2 je le prouve par un chiffre · 3 je fixe un objectif mesurable */
const NIV_COACH={s1:1,s2:1,s3:1,s4:2,s5:2,s6:2,s7:2,s8:2,t1:1,t2:1,t3:2,t4:2,t5:2,t6:3,t7:3,t8:3,t9:3};
const EP_BLANCHE=['s6','t7'],EP_FINALE=['s8','t9'];
/* objectifs du niveau 3 : réglés en T6, T7, T8, vérifiés à la séance suivante. u = unité, tol = tolérance, max = « au plus » */
const OBJ_T={
 p250:{t:'Passage au 250 m du C1',u:'s',tol:2,time:1},ec2:{t:'Écart entre le 2e et le 1er 500 m',u:'s',max:1},p130:{t:'Projet du 1’30',u:'m',tol:5},
 r8:{t:'Écart moyen sur les allures de sa séance',u:'s',max:1},
 mp500:{t:'Passage au 500 m du C1',u:'s',tol:5,time:1},mec2:{t:'Écart entre les deux 1000 m',u:'s',max:1},m3p:{t:'Projet du 3’',u:'m',tol:10},m1k:{t:'Temps du 1000 m',u:'s',tol:10,time:1}};
const OBJ_PAR={c:{t6:['p250','ec2','p130'],t7:['r8'],t8:['p250','ec2','p130']},m:{t6:['mp500','mec2','m3p'],t7:['m1k'],t8:['mp500','mec2','m3p']}};
