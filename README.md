# Demi-fond · outil prof (Lycée G. Pompidou)

Récupère les séances des élèves (QR codes, fichiers du Nuage, copies de secours) et suit chaque élève séance par séance, en Seconde (S1-S8) et en Terminale (T1-T9). Modèle : l'outil prof de tennis de table.

Adresse : https://yannickdartois-hue.github.io/demi-fond-prof/ · démo pour un collègue : `?demo` (deux classes fictives, rien n'est enregistré).

## Onglets (rangés par moment : Avant · Pendant · Après)
- **Classes** : import de la liste Pronote (xlsx, xls, csv ou liste collée ; colonnes Classe et Sexe reconnues), niveau Seconde / Terminale, **lien de dépôt du Nuage** (« Demande de fichier »), **QR de démarrage** à afficher au premier cours, archivage de fin d'année.
- **Recevoir** : scanner les QR à la suite (y compris les anciens QR du carnet numérique), fichiers `.json` ou dossier `.zip` du Nuage (glisser-déposer sur ordinateur), copies de secours, sauvegarde / restauration, import de l'ancien carnet (mode prof). Le scan reconnaît aussi le QR « code oublié » d'une tablette et affiche le QR de déverrouillage.
- **Appel** : statut de chaque élève par séance (auto, corrigeable) et groupes dont rien n'est arrivé.
- **Séance** : la classe sur une séance (projets tenus, écart, ce que le coach a vu, effort et charge, rôle), les ★ AFL2 / AFL3 et le **contrôle prof** : tu mesures toi-même une course (un ou deux élèves par séance) ; l'écart avec la mesure du coach alimente l'AFL3 et signale les données douteuses.
- **Élèves** : tableau du cycle en carte de chaleur (vert ¾ des projets tenus et plus, ambre ¼, rouge moins), points d'attention (dont progression invraisemblable et contrôle très différent du coach) ; une case = détail de la séance ; un nom = **fiche élève** (séances reçues, groupe et coach, courbes, **QR de reprise**, fusion de doublons).
- **Note** : AFL1 /12 calculé (épreuve S8 ou T9, barèmes du lycée) et suggestions détaillées. **AFL2** : 2 points sur les projets tenus, le reste sur la préparation (échauffement complet aux épreuves, projets ambitieux, régulation écrite : ajustement, point faible, projets finaux, « la prochaine fois »). **AFL3** : fiabilité du coach d'après tes contrôles (poids 2), justesse de ses pronostics (1), conseil jugé utile par le coureur (½). ★ : +0,5 à partir de deux. Total /20. En Terminale, la répartition 6/2, 4/4 ou 2/6 choisie par l'élève est appliquée.
- **Pilotage** : séances reçues, projets tenus et effort moyens par séance, groupes de vitesse G1-G4, alertes.
- **Chrono** : chrono de classe avec bips et voix (téléphone + enceinte).
- **Exporter** : CSV bilan et note, CSV séance par séance.

## Données
Tout reste sur cet appareil (localStorage) : **exporter une sauvegarde** après chaque import (un bandeau le rappelle) et installer l'outil sur l'écran d'accueil de l'iPad. La clé des copies de secours est créée au premier QR de démarrage et voyage avec la sauvegarde : sans elle, les copies ne s'ouvrent plus.

## Fichiers
`donnees.js`, `logique.js`, `scan.js`, `vues.js` sont **identiques à ceux de l'appli élève** (mêmes séances, mêmes calculs, même format de QR). `prof.js` (outil), `chrono.js`, `prof-demo.js`, `jszip.js` et `xlsx.js` (lecture des .zip et des fichiers Pronote). `sw.js` : **augmenter `VERSION`** à chaque modification.
