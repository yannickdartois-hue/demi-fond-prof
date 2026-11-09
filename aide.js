/* aide.js — mode d'emploi de l'outil prof demi-fond (lu par eps-aide.js) */
window.EPS_AIDE={appli:'Demi-fond · Outil prof',bouton:false,pied:'Toutes les données restent sur cet appareil : pensez à la sauvegarde après chaque import.',publics:[
{id:'prof',titre:'Professeur',chapitres:[
{t:'Séances revues (novembre 2026)',html:`<ul>
<li><b>Seconde</b> : plus de 36"/36". S2 = test de 3’ à fond (vitesse sur 3’ = distance ÷ 50 pour les cibles d’épreuve ; VMA estimée = ÷ 58 pour les récupérations et les séries notées « % de ta VMA »). Séries tirées de la banque : 4 × 400 m (S2), 12 × 125 m (S3), 2 × (400 + 200 m) (S4), 6 × 300 m (S5), répétition générale 3’ / 10’ / 1’30 (S7).</li>
<li><b>Terminale</b> : T1 avec 1’30 estimé, T3 avec 4 × 250 m à l’allure du 500 m et 5 + 5 × 36"/36", T4 en version complète (6 × 1’12 à 95 %, pyramide 125 → 500 → 125 m), re-test en T5 avec 3 × (300 + 200 m), T6 avec 2 × 500 m et 10’ de récupération, T8 encadrée (≤ 110 % VMA, ≤ 1500 m rapides).</li>
<li><b>Échauffement</b> illustré à chaque séance et <b>distance de la séance</b> dans le détail et l’export « Séances ».</li>
</ul>`},
{t:'🚶 Parcours marche (asthme, avis médical)',html:`<ul>
<li>Pour un élève dont l’asthme ou un certificat d’inaptitude partielle justifie de marcher : dans son carnet, onglet Groupe → <b>Parcours marche</b>, sur son nom. Son camarade continue à courir et le coache.</li>
<li>Mêmes numéros de séance que la classe (code du cours, appel, envoi communs), mais des séances de marche : technique et mesure de la vitesse de marche (3’ à fond ÷ 50), allures, 1000 m, fractionné, projets.</li>
<li><b>Terminale</b> : épreuve 2 × 1000 m + 3’ (barème « marche fractionnée adaptée »). <b>Seconde</b> : épreuve allégée 1000 m + 3’, mêmes tables.</li>
<li>AFL1 /12 = performance /8 (moyenne : temps des 1000 m, distance en 3’) + projet de distance sur 3’ /4 (à 5 m près = 4).</li>
<li>Dans les tableaux, l’élève porte 🚶 ; le détail d’une séance signale s’il a été gêné pour respirer.</li>
</ul><p class="astuce">Ce n’est pas automatique pour tout asthmatique : un asthme suivi et traité permet souvent de courir. Le parcours se décide avec l’avis médical.</p>`},
{t:'🔑 Code du cours (chaque cours)',html:`<ol>
<li>Les élèves utilisent leur téléphone : sans verrou, ils pourraient remplir chez eux des séances à l’avance. Le code du cours l’empêche.</li>
<li>Début de cours : Classes → <span class="bouton">🔑 Code du cours</span>, vérifiez la séance, écrivez les 4 chiffres au tableau.</li>
<li>Chaque groupe tape le code : la séance du jour s’ouvre sur son téléphone pendant 2 heures. Sans code, l’appli se consulte mais on ne peut rien saisir.</li>
<li><b>Plus rapide : le QR du jour.</b> Ouvrez d’abord 🔑 Code du cours (bonne séance), puis affichez le QR de démarrage : scanné par un binôme, il ouvre la séance sans rien taper. Le code au tableau reste valable.</li>
<li>Le code ne vaut que pour cette séance et ce jour-là. Pour préparer un cours, changez la date : le code s’affiche à l’avance. Aucune connexion nécessaire.</li>
</ol><p class="astuce">Une seule fois après cette mise à jour : refaites scanner le <b>QR de démarrage</b> (il apporte la clé de la classe). Tant qu’un téléphone ne l’a pas rescanné, il n’est pas verrouillé.</p>`},

{t:'Démarrer en 5 minutes',html:`<ol>
<li><b>Classes</b> : importez la liste Pronote (fichier xlsx/csv, ou liste collée « NOM Prénom »). Une colonne « Sexe » remplit fille/garçon.</li><li><b>Toutes les classes d’un coup</b> : le fichier fait par la page « Mes classes » du portail mon-EPS. <b>Élève arrivé en cours d’année</b> : collez « NOM Prénom » avec le nom de la classe → « Ajouter ces élèves ». Classe déjà présente : l’appli demande toujours « Ajouter » ou « Remplacer la liste ». Ensuite, faites rescanner le QR de démarrage.</li>
<li>Choisissez le <b>niveau</b> (Seconde S1-S8 ou Terminale T1-T9).</li>
<li>Collez le <b>lien de dépôt du Nuage</b> de la classe (« Demande de fichier – téléversement seulement »). Il n’est jamais montré aux élèves.</li>
<li>Au premier cours, touchez <span class="bouton">QR de démarrage</span> et affichez-le : chaque binôme le scanne dans l’appli élève.</li>
<li>Installez l’outil sur l’écran d’accueil de l’iPad (Safari → Partager → « Sur l’écran d’accueil ») et faites une <b>sauvegarde</b> après chaque import.</li></ol>`},
{t:'Les onglets : avant, pendant, après la séance',html:`<ul>
<li><b>Avant</b> — Classes : listes, niveau, lien du Nuage, QR de démarrage, archivage de fin d’année.</li>
<li><b>Pendant</b> — Appel (statut auto, corrigeable), Recevoir (scanner les QR, importer les fichiers), Chrono (bips et voix sur enceinte).</li>
<li><b>Après</b> — Séance (la classe sur une séance, ★ et contrôle prof), Élèves (tableau du cycle, fiches), Note, Pilotage, Exporter.</li></ul>`},
{t:'Recevoir les séances',html:`<ul>
<li><b>QR</b> : <span class="bouton">Scanner les QR codes</span>, puis montrez les QR un par un (un par binôme). Un bip = séance rangée. Les anciens QR du carnet numérique sont acceptés.</li>
<li><b>Fichiers</b> : téléchargez le dossier du Nuage en .zip et choisissez-le (ou glissez-le sur ordinateur). Réimporter ne crée pas de doublon.</li>
<li><b>Copies de secours</b> : elles arrivent avec l’envoi en ligne ; « Télécharger le carnet » permet à un binôme de reprendre son carnet sur une autre tablette.</li>
<li><b>Code oublié</b> : le QR « code oublié » d’une tablette se scanne ici ; l’outil affiche le QR de déverrouillage.</li></ul>`},
{t:'Suivre les élèves',html:`<ul>
<li><b>Élèves</b> : chaque case = projets tenus / tentés. Couleur <i>et</i> signe : ✓✓ ¾ et plus, ✓ ½, ! ¼, ✗ moins. Touchez une case pour le détail, un nom pour la fiche (courbes, QR de reprise, fusion d’un doublon).</li>
<li><b>Points d’attention</b> : rien reçu, aucun projet tenu sur 3 séances, VMA modifiée, absences, effort 9-10 répété, progression invraisemblable, contrôle très différent du coach.</li>
<li><b>Contrôle prof</b> (onglet Séance) : mesurez vous-même une course pour un ou deux élèves ; l’écart avec la mesure du coach sert à l’AFL3 et repère les données fausses.</li>
<li><b>Pilotage</b> : séances reçues, projets tenus et effort moyens, groupes de vitesse G1 à G4.</li></ul>`},
{t:'La note',html:`<ul>
<li><b>AFL1 /12</b> : calculé depuis l’épreuve (S8 ou T9) et les barèmes du lycée.</li>
<li><b>AFL2</b> (suggestion) : 2 points sur les projets tenus, le reste sur la préparation (échauffement complet aux épreuves, projets ambitieux, régulation écrite).</li>
<li><b>AFL3</b> (suggestion) : fiabilité du coach d’après vos contrôles, justesse de ses pronostics, avis du coureur. ★ : +0,5 à partir de deux.</li>
<li>Touchez « ← » pour reprendre une suggestion, ou écrivez votre note. Export CSV dans Exporter.</li></ul>
<p class="astuce">Épreuve officielle chronométrée par vous (départ commun, temps glissés sur les élèves, barèmes BO 2021) : bouton <b>Ouvrir CCF demi-fond — prof</b> dans Chrono et dans Note (Terminale).</p>`},
{t:'Sauvegarder, changer d’appareil, fin d’année',html:`<ul><li>Recevoir → <span class="bouton">Exporter une sauvegarde</span> : rangez le fichier dans votre espace personnel. « Restaurer » sur l’autre appareil.</li>
<li>La clé des copies de secours voyage avec la sauvegarde : sans elle, les copies et le déverrouillage ne marchent plus.</li>
<li>Classes → <span class="bouton">Archiver l’année et repartir à zéro</span> à la fin de l’année.</li></ul>`},
{t:'Démo pour un collègue',html:`<p>Classes → <span class="bouton">Ouvrir la démo</span>, ou le lien <b>…/demi-fond-prof/?demo</b> : deux classes fictives, rien n’est enregistré, vos vraies données ne sont pas touchées.</p>`}]}
]};
