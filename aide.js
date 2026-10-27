/* aide.js — mode d'emploi de l'outil prof demi-fond (lu par eps-aide.js) */
window.EPS_AIDE={appli:'Demi-fond · Outil prof',bouton:false,pied:'Toutes les données restent sur cet appareil : pensez à la sauvegarde après chaque import.',publics:[
{id:'prof',titre:'Professeur',chapitres:[
{t:'Démarrer en 5 minutes',html:`<ol>
<li><b>Classes</b> : importez la liste Pronote (fichier xlsx/csv, ou liste collée « NOM Prénom »). Une colonne « Sexe » remplit fille/garçon.</li>
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
