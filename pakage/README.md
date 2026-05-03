# Pakage 📦 (Version Simple)

Cette extension transforme une variable texte en une véritable liste de données. C'est l'outil parfait pour compacter vos variables (X, Y, Score, Pseudo) avant de les envoyer sur un serveur multijoueur.

## Les Blocs "Logiques"

1.  **Ajouter à** : Ajoute une donnée à la fin de votre texte. Si le texte est vide, il commence le paquet sans mettre de séparateur au début.
2.  **Remplacer n°** : Permet de modifier une valeur précise (ex: changer seulement le Score) sans toucher aux autres infos.
3.  **Élément n°** : Extrait la donnée dont vous avez besoin.
4.  **Longueur** : Compte combien d'éléments sont dans votre paquet.

## Exemple Multijoueur

Au lieu de faire des `regrouper` compliqués :
1.  Mettre `PAQUET` à `(X)`
2.  Mettre `PAQUET` à `ajouter (Y) à (PAQUET) (séparateur: |)`
3.  Mettre `PAQUET` à `ajouter (Score) à (PAQUET) (séparateur: |)`
=> Résultat : `10|20|100`

Pour lire : `élément n° 2 de (PAQUET)` donnera `20`.
