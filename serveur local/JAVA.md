# 🔴 Documentation Serveur : Java (Pont Node.js)

Java est extrêmement puissant pour les calculs mathématiques et la gestion de bases de données massives. Cependant, le WebRTC en Java pur est une épreuve de force. Nous utilisons donc le **"Bridge Pattern"** (Modèle de Pont).

## 🛠️ Architecture du Pont

Comme PeerJS n'a pas de SDK Java officiel, nous créons un petit script **Node.js** qui gère le réseau complexe et communique avec votre programme **Java** via un simple tuyau local (Socket TCP).

**Flux :**
`Scratch (P2P)` <--- PeerJS ---> `Node.js (Relais)` <--- TCP/Local ---> `Java (Logique)`

---

## 💻 Étape 1 : Le Pont (bridge.js)
Ce script doit rester léger. Son seul but est de traduire les objets JSON de Scratch en lignes de texte pour Java.

```javascript
const { Peer } = require('peerjs');
const wrtc = require('wrtc');
const net = require('net');

// 1. Initialisation PeerJS
const peer = new Peer('mon-relais-java', { wrtc: wrtc });

// 2. Connexion au serveur Java (qui doit être lancé en premier)
const javaClient = net.createConnection({ port: 9000 }, () => {
    console.log('✅ Connecté au moteur Java sur le port 9000');
});

peer.on('connection', (conn) => {
    conn.on('open', () => {
        conn.send({ type: 'init', pseudo: 'Java_Engine' });
    });

    // Envoyer à Java ce qui vient de Scratch
    conn.on('data', (data) => {
        javaClient.write(JSON.stringify(data) + '\n');
    });

    // Envoyer à Scratch ce qui vient de Java
    javaClient.on('data', (javaData) => {
        conn.send(JSON.parse(javaData.toString()));
    });
});
```

---

## 💻 Étape 2 : Le Serveur Java (Main.java)
Ici, vous recevez du JSON pur. Vous pouvez utiliser une librairie comme `org.json` ou `Gson` pour manipuler les données.

```java
import java.io.*;
import java.net.*;

public class Main {
    public static void main(String[] args) {
        try (ServerSocket serverSocket = new ServerSocket(9000)) {
            System.out.println("🚀 Moteur Java prêt sur le port 9000");
            
            while (true) {
                Socket socket = serverSocket.accept();
                handleBridge(socket);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void handleBridge(Socket socket) {
        try (
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true)
        ) {
            String line;
            while ((line = in.readLine()) != null) {
                System.out.println("Reçu de Scratch : " + line);
                
                // EXEMPLE : Si Java reçoit un message, il répond
                if (line.contains("!ping")) {
                    String response = "{\"type\":\"msg\", \"message\":\"PONG depuis Java\", \"pseudo\":\"Java_Engine\"}";
                    out.println(response);
                }
            }
        } catch (IOException e) {
            System.out.println("Connexion pont perdue.");
        }
    }
}
```

---

## 🔍 Pourquoi cette méthode ?

### Avantages
1.  **Simplicité** : Vous n'avez pas à gérer les certificats SSL, les offres SDP ou les candidats ICE en Java.
2.  **Performance** : Le passage par un socket local (TCP loopback) prend moins de 1 milliseconde. C'est invisible pour l'utilisateur.
3.  **Évolutivité** : Vous pouvez lancer 10 instances de votre programme Java pour traiter les données de 10 serveurs Scratch différents.

### Bibliothèques Java conseillées
Pour aller plus loin, utilisez :
-   **Gson (Google)** : Pour transformer le texte reçu en vrais objets Java.
-   **JDBC / Hibernate** : Si vous voulez sauvegarder les inventaires des joueurs Scratch dans une base SQL (MySQL, PostgreSQL).
