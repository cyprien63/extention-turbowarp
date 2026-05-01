# Extension Dossier (Fichiers & Sauvegardes Silencieuses)

Cette extension permet de sauvegarder et de récupérer des données (fichiers) sans que l'utilisateur n'ait besoin de valider une fenêtre de téléchargement à chaque fois. Elle fonctionne comme le système de sauvegarde d'un vrai jeu vidéo ou d'un logiciel professionnel.

## Caractéristiques
- **Sauvegarde Silencieuse** : Pas de fenêtre "Enregistrer sous...".
- **Persistance** : Les données restent même après avoir fermé l'onglet, le navigateur ou l'application bureau.
- **Multi-Plateforme** : Fonctionne sur Web (Navigateur), TurboWarp Desktop (Bureau) et les versions compilées (HTML/EXE).
- **Automatique** : Chargez vos données dès le démarrage du projet.

## Fonctionnement technique
L'extension utilise **IndexedDB**, une base de données intégrée aux navigateurs et à l'application TurboWarp. Cela permet de stocker des fichiers de manière persistante dans un espace réservé à votre projet, sans les restrictions de taille du `localStorage` (qui est limité à 5 Mo).

## Liste des Blocs

- **Sauvegarder [Donnée] dans [Chemin]** : Enregistre du texte ou des données JSON dans un fichier virtuel.
- **Récupérer le contenu de [Chemin]** : Lit un fichier sauvegardé précédemment.
- **Le fichier [Chemin] existe ?** : Vérifie si une sauvegarde existe à cet endroit.
- **Supprimer le fichier [Chemin]** : Efface une sauvegarde spécifique.
- **Lister tous les fichiers** : Renvoie la liste des noms de fichiers enregistrés.
- **Tout effacer** : Supprime toutes les données stockées par cette extension.

## Cas d'utilisation
- Système de **Sauvegarde de Partie** (Save Game).
- Stockage de **Paramètres/Options** (Volume, Touches, etc.).
- Gestion de **Inventaires complexes**.
- Cache pour des données récupérées via Internet.

---
*Créé pour TurboWarp - Compatible Desktop & Web.*
