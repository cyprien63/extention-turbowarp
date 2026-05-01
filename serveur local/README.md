# 🌐 Ecosystème Multi-Joueurs P2P pour TurboWarp

Cette documentation détaille le fonctionnement de l'extension **Serveur Local P2P** et comment créer des serveurs externes pour interagir avec vos projets Scratch.

## 🏗️ Architecture Globale

Le système repose sur **WebRTC**, une technologie de communication en temps réel de navigateur à navigateur. Contrairement à un serveur classique (client-serveur), ici les données voyagent directement entre les joueurs (Peer-to-Peer).

### Les Composants :
1.  **L'Extension Scratch** : Gère l'interface utilisateur et la communication WebRTC.
2.  **Le Serveur de Signalement (PeerJS Cloud)** : Utilisé uniquement pour *trouver* les autres joueurs. Une fois connectés, les données ne passent plus par lui.
3.  **Serveurs Externes (Optionnel)** : Des programmes en Python/Node/Java qui agissent comme des "Super-Joueurs" pour gérer la logique complexe ou les bases de données.

---

## 📡 Le Protocole de Communication (JSON)

Toutes les données échangées sont des objets JSON. Pour que votre propre serveur puisse parler à Scratch, il **doit** respecter cette structure.

### 1. Le Handshake (Connexion initiale)
Dès qu'une connexion est établie, le message suivant est envoyé automatiquement par les deux parties :
\\\json
{
  "type": "init",
  "pseudo": "NomDuJoueur"
}
\\\
*Note : Si vous créez un serveur externe, vous devez envoyer ce message immédiatement à l'ouverture de la connexion, sinon les blocs Scratch ne détecteront pas le joueur.*

### 2. Les Messages de Chat / Texte
Utilisés par le bloc "Envoyer à tous [MESSAGE]".
\\\json
{
  "type": "msg",
  "message": "Salut tout le monde !",
  "pseudo": "Expéditeur"
}
\\\

### 3. Les Données de Jeu (Variables)
Utilisées par le bloc "Envoyer donnée [CLÉ] = [VALEUR]".
\\\json
{
  "type": "msg",
  "key": "position_x",
  "value": "120",
  "pseudo": "Expéditeur"
}
\\\

### 4. Les Messages Privés
Si l'hôte reçoit un message avec un champ \	arget\, il ne doit le renvoyer qu'à la personne concernée.
\\\json
{
  "type": "msg",
  "message": "Secret",
  "target": "Alice",
  "pseudo": "Bob"
}
\\\

---

## 🛡️ Sécurité et Bonnes Pratiques

-   **IDs de Serveur** : Utilisez des IDs longs et complexes (ex: \monjeu_v1_83726\) pour éviter que deux personnes n'utilisent le même ID au même moment sur le réseau mondial.
-   **Validation** : Si vous faites un serveur de scores en Python, vérifiez toujours les données envoyées par Scratch pour éviter la triche (ex: vérifier que le score n'est pas impossible).
-   **Compatibilité** : L'extension est compatible avec le mode "Web Worker" de TurboWarp Online.

---

## 📚 Guides par Langage
-   [Node.js (Le plus simple)](NODEJS.md)
-   [Python (Pour l'IA / Data)](PYTHON.md)
-   [Java (Pour la performance)](JAVA.md)
