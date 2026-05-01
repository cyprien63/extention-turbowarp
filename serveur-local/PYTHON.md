# 🔵 Documentation Serveur : Python

Python est idéal pour intégrer de l'intelligence artificielle (TensorFlow, PyTorch) ou faire du traitement de données complexe pour vos projets Scratch.

## 🛠️ Installation et Dépendances

Nous utilisons **aiortc**, la bibliothèque de référence pour le WebRTC en Python asynchrone.

```bash
pip install aiortc websockets aiohttp
```

---

## 💻 Implémentation : Signalement Manuel

Contrairement à Node.js, Python doit gérer manuellement le protocole de signalement de PeerJS (qui se passe par dessus WebSocket).

```python
import asyncio
import json
import uuid
import websockets
from aiortc import RTCPeerConnection, RTCSessionDescription

class ScratchServer:
    def __init__(self, server_id):
        self.id = server_id
        # URI pour se connecter au cloud PeerJS officiel
        self.uri = f"wss://0.peerjs.com/peerjs?key=peerjs&id={server_id}&token={uuid.uuid4()}"

    async def start(self):
        # 1. Connexion au serveur de signalement PeerJS
        async with websockets.connect(self.uri) as ws:
            print(f"🚀 Serveur Python en ligne : {self.id}")
            
            async for raw_msg in ws:
                data = json.loads(raw_msg)
                msg_type = data.get("type")

                # Quand un client Scratch tente de nous joindre
                if msg_type == "OFFER":
                    await self.handle_offer(data, ws)

    async def handle_offer(self, data, ws):
        pc = RTCPeerConnection()
        client_id = data["src"]

        @pc.on("datachannel")
        def on_datachannel(channel):
            print(f"🔗 Canal ouvert avec : {client_id}")

            @channel.on("open")
            def on_open():
                # HANDSHAKE : Obligatoire pour l'extension Scratch
                # Sans ce message, Scratch ne saura pas que vous êtes un joueur valide
                payload = {"type": "init", "pseudo": "Python_AI"}
                channel.send(json.dumps(payload))

            @channel.on("message")
            def on_message(message):
                msg = json.loads(message)
                self.process_logic(channel, msg)

        # Signalement WebRTC (SDP)
        # On accepte l'offre SDP du client Scratch
        offer = RTCSessionDescription(sdp=data["payload"]["sdp"], type="offer")
        await pc.setRemoteDescription(offer)
        
        # On génère notre propre réponse SDP
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        # Renvoyer la réponse SDP au client Scratch via le WebSocket de signalement
        await ws.send(json.dumps({
            "type": "ANSWER",
            "src": self.id,
            "dst": client_id,
            "payload": {"sdp": pc.localDescription.sdp, "type": "answer"}
        }))

    def process_logic(self, channel, msg):
        # Ici on traite les données envoyées par Scratch
        if msg.get("type") == "msg":
            print(f"💬 Scratch dit : {msg.get('message')}")
            
            # Exemple : Répondre si on reçoit un ping
            if msg.get("message") == "ping":
                reply = {"type": "msg", "message": "pong", "pseudo": "Python_AI"}
                channel.send(json.dumps(reply))

if __name__ == "__main__":
    server = ScratchServer("ai_bot_001")
    asyncio.run(server.start())
```

---

## 🔍 Explications Techniques

### Le rôle d'aiortc
WebRTC est un protocole très complexe qui gère :
1.  **La compression** vidéo/audio (pas utilisée ici).
2.  **Le cryptage** (DTLS/SRTP).
3.  **Le passage de pare-feu** (ICE/STUN/TURN).
`aiortc` permet de gérer tout cela de façon asynchrone (`async/await`), ce qui est nécessaire car le serveur de signalement et la connexion P2P tournent en même temps sans se bloquer.

### Pourquoi le signalement manuel ?
La bibliothèque PeerJS officielle n'existe pas en Python. Nous devons donc "imiter" le comportement d'un client PeerJS en envoyant des objets JSON spécifiques (`OFFER`, `ANSWER`, `CANDIDATE`) via une WebSocket au serveur `0.peerjs.com`.

### Performance et Usage
Python est idéal pour :
-   **Le Machine Learning** : Faire un serveur qui prédit les coups d'un joueur.
-   **Le Big Data** : Enregistrer des milliers de positions pour faire des statistiques.
-   **L'Automatisation** : Créer un bot qui gère une économie globale entre plusieurs serveurs Scratch.
