# 🟢 Documentation Serveur : Node.js

Node.js est le langage de choix pour ce projet car il utilise la même bibliothèque que l'extension Scratch (**PeerJS**).

## 🛠️ Installation et Dépendances

Vous avez besoin de trois bibliothèques clés :
1.  **peerjs** : Pour la logique P2P.
2.  **wrtc** : Pour permettre à Node.js de parler WebRTC (normalement réservé aux navigateurs).
3.  **ws** : Utilisé en interne par PeerJS pour le signalement.

\\\ash
npm install peerjs wrtc
\\\

---

## 💻 Implémentation Avancée

Voici un exemple de serveur capable de gérer plusieurs salles de jeu et de sauvegarder les scores dans un fichier JSON.

\\\javascript
const { Peer } = require('peerjs');
const wrtc = require('wrtc');
const fs = require('fs');

// --- CONFIGURATION ---
const SERVER_ID = 'mon-super-serveur-001';
const SCORES_FILE = './scores.json';

// Initialisation du serveur Peer
const peer = new Peer(SERVER_ID, {
    config: { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] },
    wrtc: wrtc
});

console.log('--- Initialisation du serveur ---');

peer.on('open', (id) => {
    console.log('✅ Serveur en ligne avec l'ID :', id);
});

// --- GESTION DES CONNEXIONS ---
peer.on('connection', (conn) => {
    console.log(🔌 Nouvelle connexion de : );

    // Étape 1 : Le Handshake
    // On attend que la connexion soit ouverte pour envoyer notre pseudo
    conn.on('open', () => {
        conn.send({ type: 'init', pseudo: 'SUPER_SERVEUR' });
    });

    // Étape 2 : Écoute des données
    conn.on('data', (data) => {
        // Logique de routage basée sur le type de message
        switch(data.type) {
            case 'msg':
                handleGameMessage(conn, data);
                break;
            case 'rename':
                console.log(👤  s'appelle maintenant );
                conn.pseudo = data.pseudo;
                break;
        }
    });

    conn.on('close', () => {
        console.log(❌ Déconnexion de : );
    });
});

// --- LOGIQUE DE JEU ---
function handleGameMessage(conn, data) {
    // Si c'est un message de score
    if (data.key === 'score') {
        saveScore(data.pseudo, data.value);
        conn.send({ type: 'msg', message: 'Score sauvegardé !', pseudo: 'SUPER_SERVEUR' });
    }

    // Réponse au ping
    if (data.message === '!ping') {
        conn.send({ type: 'msg', message: 'PONG 🏓', pseudo: 'SUPER_SERVEUR' });
    }
}

// --- PERSISTANCE ---
function saveScore(player, score) {
    let scores = {};
    if (fs.existsSync(SCORES_FILE)) {
        scores = JSON.parse(fs.readFileSync(SCORES_FILE));
    }
    scores[player] = score;
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
    console.log(📝 Score enregistré pour  : );
}

// Gestion des erreurs fatales
peer.on('error', (err) => {
    console.error('💥 Erreur PeerJS :', err.type);
});
\\\

---

## 🔍 Explications Techniques

### Pourquoi \wrtc\ ?
Dans un navigateur, \RTCPeerConnection\ est une fonction native. Node.js n'a pas de moteur de rendu web, donc il n'a pas cette fonction. Le paquet \wrtc\ est une version compilée (en C++) du moteur WebRTC de Google utilisable dans Node.js.

### Le flux de données
1.  **Scratch** envoie une "Offre" au serveur de signalement PeerJS.
2.  **Node.js** reçoit l'offre via WebSocket, crée une instance WebRTC locale, et renvoie une "Réponse".
3.  Un **Canal de Données (DataChannel)** est ouvert directement entre les deux.
4.  Le serveur doit impérativement envoyer \{type: "init", pseudo: "..."}\ pour que Scratch valide le joueur.
