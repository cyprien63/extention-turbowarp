(function(Scratch) {
  'use strict';

  const PEERJS_URL = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.2/dist/peerjs.min.js';

  // Icône "Global Connection" très arrondie et moderne
  const menuIconURI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48bGluZSB4MT0iMiIgeTE9IjEyIiB4Mj0iMjIiIHkyPSIxMiIvPjxwYXRoIGQ9Ik0xMiAyYTE1LjMgMTUuMyAwIDAgMSA0IDEwIDE1LjMgMTUuMyAwIDAgMS00IDEwIDE1LjMgMTUuMyAwIDAgMS00LTEwIDE1LjMgMTUuMyAwIDAgMSA0LTEweiIvPjwvc3ZnPg==';

  const loadPeerJS = async () => {
    if (typeof Peer !== 'undefined') return true;
    try {
      if (typeof importScripts === 'function') {
        importScripts(PEERJS_URL);
        return true;
      } else if (typeof document !== 'undefined') {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = PEERJS_URL;
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error('PeerJS Error'));
          document.head.appendChild(script);
        });
      }
    } catch (e) { return false; }
    return false;
  };

  class LocalServerExtension {
    constructor() {
      this.peer = null;
      this.connections = [];
      this.lastMessage = '';
      this.lastSender = '';
      this.pseudo = 'Joueur' + Math.floor(Math.random() * 1000);
      this.isConnected = false;
      this.isServer = false;
      this.playerList = [];
      this.maxPlayers = 0; 
      this.lastError = 'Aucune';
      this.lastServerID = '';
      
      this._receivedThisTick = false;
      this._playerConnectedThisTick = false;
      this._playerDisconnectedThisTick = false;
      this.lastJoinedPlayer = '';
      this.lastLeftPlayer = '';
      this.receivedData = {};
    }

    getInfo() {
      return {
        id: 'localserverp2p',
        name: 'Serveur Local P2P',
        menuIconURI: menuIconURI,
        blockIconURI: menuIconURI,
        color1: '#4C97FF',
        color2: '#3373CC',
        blocks: [
          // --- SETUP ---
          { text: '--- Configuration ---', blockType: 'label' },
          {
            opcode: 'setPseudo',
            blockType: 'command',
            text: 'Choisir mon pseudo [PSEUDO]',
            arguments: { PSEUDO: { type: 'string', defaultValue: 'Joueur1' } }
          },
          {
            opcode: 'startServer',
            blockType: 'command',
            text: 'Héberger un serveur ID: [ID]',
            arguments: { ID: { type: 'string', defaultValue: 'mon-jeu-123' } }
          },
          {
            opcode: 'connectToServer',
            blockType: 'command',
            text: 'Rejoindre le serveur ID: [ID]',
            arguments: { ID: { type: 'string', defaultValue: 'mon-jeu-123' } }
          },
          {
            opcode: 'disconnect',
            blockType: 'command',
            text: 'Se déconnecter / Fermer',
          },

          // --- MODERATION ---
          { text: '--- Gestion (Hôte) ---', blockType: 'label' },
          {
            opcode: 'setMaxPlayers',
            blockType: 'command',
            text: 'Limiter à [MAX] joueurs (0=infini)',
            arguments: { MAX: { type: 'number', defaultValue: 5 } }
          },
          {
            opcode: 'kickPlayer',
            blockType: 'command',
            text: 'Exclure le joueur [PSEUDO]',
            arguments: { PSEUDO: { type: 'string', defaultValue: 'Joueur2' } }
          },

          // --- MESSAGING ---
          { text: '--- Communication ---', blockType: 'label' },
          {
            opcode: 'broadcast',
            blockType: 'command',
            text: 'Envoyer à tous [MESSAGE]',
            arguments: { MESSAGE: { type: 'string', defaultValue: 'Bonjour !' } }
          },
          {
            opcode: 'broadcastData',
            blockType: 'command',
            text: 'Envoyer donnée [KEY] = [VALUE] à tous',
            arguments: {
              KEY: { type: 'string', defaultValue: 'pos_x' },
              VALUE: { type: 'string', defaultValue: '100' }
            }
          },
          {
            opcode: 'sendTo',
            blockType: 'command',
            text: 'Envoyer à [PSEUDO] le message [MESSAGE]',
            arguments: {
              PSEUDO: { type: 'string', defaultValue: 'Joueur2' },
              MESSAGE: { type: 'string', defaultValue: 'Secret...' }
            }
          },
          {
            opcode: 'sendToData',
            blockType: 'command',
            text: 'Envoyer à [PSEUDO] la donnée [KEY] = [VALUE]',
            arguments: {
              PSEUDO: { type: 'string', defaultValue: 'Joueur2' },
              KEY: { type: 'string', defaultValue: 'hp' },
              VALUE: { type: 'string', defaultValue: '10' }
            }
          },

          // --- EVENTS ---
          { text: '--- Événements ---', blockType: 'label' },
          {
            opcode: 'whenMessageReceived',
            blockType: 'hat',
            text: 'Quand un message est reçu',
          },
          {
            opcode: 'whenPlayerConnects',
            blockType: 'hat',
            text: 'Quand un joueur rejoint',
          },
          {
            opcode: 'whenPlayerDisconnects',
            blockType: 'hat',
            text: 'Quand un joueur quitte',
          },

          // --- REPORTERS ---
          { text: '--- Données Reçues ---', blockType: 'label' },
          {
            opcode: 'getLastMessage',
            blockType: 'reporter',
            text: 'dernier message',
          },
          {
            opcode: 'getDataValue',
            blockType: 'reporter',
            text: 'valeur de [KEY]',
            arguments: { KEY: { type: 'string', defaultValue: 'pos_x' } }
          },
          {
            opcode: 'getLastSender',
            blockType: 'reporter',
            text: 'expéditeur',
          },
          {
            opcode: 'getLastJoinedPlayer',
            blockType: 'reporter',
            text: 'joueur qui rejoint',
          },
          {
            opcode: 'getLastLeftPlayer',
            blockType: 'reporter',
            text: 'joueur qui quitte',
          },

          // --- STATUS ---
          { text: '--- État Réseau ---', blockType: 'label' },
          {
            opcode: 'getMyPseudo',
            blockType: 'reporter',
            text: 'mon pseudo',
          },
          {
            opcode: 'getPlayerCount',
            blockType: 'reporter',
            text: 'nombre de joueurs',
          },
          {
            opcode: 'getAllPlayers',
            blockType: 'reporter',
            text: 'liste des joueurs',
          },
          {
            opcode: 'status',
            blockType: 'Boolean',
            text: 'connecté ?',
          },
          {
            opcode: 'getLastError',
            blockType: 'reporter',
            text: 'dernière erreur',
          },
          {
            opcode: 'getMyID',
            blockType: 'reporter',
            text: 'mon ID réseau',
          }
        ]
      };
    }

    setPseudo(args) {
      this.pseudo = String(args.PSEUDO).trim();
      if (this.isConnected) {
        this._sendRaw({ type: 'rename', pseudo: this.pseudo });
        if (this.isServer) this._syncPlayers();
      }
    }

    setMaxPlayers(args) {
      this.maxPlayers = Math.max(0, Number(args.MAX) || 0);
    }

    kickPlayer(args) {
      if (!this.isServer) return;
      const targetPseudo = String(args.PSEUDO).trim().toLowerCase();
      const conn = this.connections.find(c => String(c.pseudo).trim().toLowerCase() === targetPseudo);
      if (conn) {
        conn.send({ type: 'error', reason: 'Exclu par l\'hôte' });
        setTimeout(() => conn.close(), 200);
      }
    }

    disconnect() {
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
        this.connections = [];
        this.isConnected = false;
        this.isServer = false;
        this.playerList = [];
      }
    }

    async _initPeer(id) {
      if (this.peer) this.disconnect();
      await loadPeerJS();
      return new Promise((resolve, reject) => {
        try {
          this.peer = new Peer(id, {
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
              ]
            }
          });
          this.peer.on('open', (pid) => { 
            this.isConnected = true; 
            this.lastError = 'Aucune'; 
            resolve(pid); 
          });
          this.peer.on('connection', (conn) => this._setupConnection(conn));
          this.peer.on('error', (err) => { 
            this.isConnected = false; 
            this.isServer = false; 
            const errorMessages = {
              'unavailable-id': 'ID déjà pris',
              'invalid-id': 'ID invalide',
              'network': 'Erreur réseau',
              'server-error': 'Erreur serveur'
            };
            this.lastError = errorMessages[err.type] || err.type;
            reject(err); 
          });
          this.peer.on('disconnected', () => { this.isConnected = false; });
        } catch (e) { this.isServer = false; this.lastError = 'Crash'; reject(e); }
      });
    }

    _setupConnection(conn) {
      conn.on('open', () => {
        if (this.isServer && this.maxPlayers > 0 && (this.connections.length + 1) >= this.maxPlayers) {
          conn.send({ type: 'error', reason: 'Serveur plein' });
          setTimeout(() => conn.close(), 500);
          return;
        }
        this.connections.push(conn);
        conn.send({ type: 'init', pseudo: this.pseudo });
      });
      
      conn.on('data', (data) => {
        if (!data || typeof data !== 'object') return;

        // Protection contre la saturation mémoire (Data Bomb)
        for (const key in data) {
          if (typeof data[key] === 'string' && data[key].length > 10000) return;
        }

        if (data.type === 'error') { 
          this.lastError = data.reason; 
          if (!this.isServer && data.reason === 'Pseudo déjà pris') {
            if (typeof prompt !== 'undefined') {
              const newPseudo = prompt(`Le pseudo "${this.pseudo}" est déjà pris sur ce serveur.\nVeuillez en choisir un autre :`, this.pseudo);
              if (newPseudo && newPseudo.trim() && newPseudo.trim() !== this.pseudo) {
                this.pseudo = newPseudo.trim();
                this.disconnect();
                return this.connectToServer({ ID: this.lastServerID });
              }
            }
          }
          this.disconnect(); 
          return; 
        }
        if (data.type === 'init' || data.type === 'rename') {
          const incomingPseudo = String(data.pseudo).trim();
          if (this.isServer) {
            const isTaken = this.playerList.some(p => p && String(p).toLowerCase() === incomingPseudo.toLowerCase());
            if (isTaken && (data.type === 'init' || incomingPseudo.toLowerCase() !== String(conn.pseudo).toLowerCase())) {
              conn.send({ type: 'error', reason: 'Pseudo déjà pris' });
              setTimeout(() => conn.close(), 200);
              return;
            }
          }
          conn.pseudo = incomingPseudo;
          if (data.type === 'init') {
            this.lastJoinedPlayer = conn.pseudo;
            this._playerConnectedThisTick = true;
            Scratch.vm.runtime.startHats('localserverp2p_whenPlayerConnects');
            if (this.isServer) this._syncPlayers();
          } else if (this.isServer) this._syncPlayers();
          return;
        }
        if (data.type === 'playerList') { this.playerList = data.list; return; }
        if (data.type === 'msg') {
          const target = data.target ? String(data.target).trim().toLowerCase() : null;
          if (target && target !== this.pseudo.toLowerCase()) { if (this.isServer) this._relayToTarget(data); return; }
          this.lastMessage = data.message || '';
          this.lastSender = data.pseudo;
          if (data.key) this.receivedData[data.key] = data.value;
          this._receivedThisTick = true;
          Scratch.vm.runtime.startHats('localserverp2p_whenMessageReceived');
          if (this.isServer && !target) this._relay(data, conn.peer);
        }
      });
      conn.on('close', () => {
        this.lastLeftPlayer = conn.pseudo || conn.peer;
        this.connections = this.connections.filter(c => c !== conn);
        this._playerDisconnectedThisTick = true;
        Scratch.vm.runtime.startHats('localserverp2p_whenPlayerDisconnects');
        if (this.isServer) this._syncPlayers();
      });
    }

    _syncPlayers() {
      if (!this.isServer) return;
      const list = this.connections.map(c => c.pseudo || c.peer);
      list.push(this.pseudo);
      this.playerList = list;
      this._sendRaw({ type: 'playerList', list: list });
    }

    _relay(data, senderId) {
      this.connections.forEach(conn => {
        if (conn.peer !== senderId && conn.open) conn.send(data);
      });
    }

    _relayToTarget(data) {
      const targetPseudo = String(data.target).trim().toLowerCase();
      const targetConn = this.connections.find(c => String(c.pseudo).trim().toLowerCase() === targetPseudo);
      if (targetConn && targetConn.open) targetConn.send(data);
    }

    _sendRaw(data) {
      this.connections.forEach(conn => { if (conn.open) conn.send(data); });
    }

    async startServer(args) {
      this.isServer = true;
      try { 
        await this._initPeer(args.ID); 
        this.playerList = [this.pseudo]; 
      } catch (e) { 
        this.isServer = false;
        if (e.type === 'unavailable-id') {
          if (typeof prompt !== 'undefined') {
            const newID = prompt(`Le nom de serveur "${args.ID}" est déjà pris.\nVeuillez en choisir un autre :`, args.ID);
            if (newID && newID !== args.ID) {
              return await this.startServer({ ID: newID });
            }
          }
        }
      }
    }

    async connectToServer(args) {
      this.isServer = false;
      this.lastServerID = args.ID;
      try {
        await this._initPeer(null);
        const conn = this.peer.connect(args.ID, { reliable: true });
        this._setupConnection(conn);
      } catch (e) { this.isConnected = false; }
    }

    broadcast(args) {
      if (!this.isConnected) return;
      this._sendRaw({ type: 'msg', message: args.MESSAGE, pseudo: this.pseudo });
    }

    broadcastData(args) {
      if (!this.isConnected) return;
      this._sendRaw({ type: 'msg', key: String(args.KEY), value: String(args.VALUE), pseudo: this.pseudo });
    }

    sendTo(args) {
      if (!this.isConnected) return;
      const data = { type: 'msg', message: args.MESSAGE, target: String(args.PSEUDO).trim(), pseudo: this.pseudo };
      if (this.isServer) this._relayToTarget(data); else this._sendRaw(data);
    }

    sendToData(args) {
      if (!this.isConnected) return;
      const data = { type: 'msg', key: String(args.KEY), value: String(args.VALUE), target: String(args.PSEUDO).trim(), pseudo: this.pseudo };
      if (this.isServer) this._relayToTarget(data); else this._sendRaw(data);
    }

    getDataValue(args) { return this.receivedData[args.KEY] || ''; }
    getLastError() { return this.lastError; }
    whenMessageReceived() { if (this._receivedThisTick) { this._receivedThisTick = false; return true; } return false; }
    whenPlayerConnects() { if (this._playerConnectedThisTick) { this._playerConnectedThisTick = false; return true; } return false; }
    whenPlayerDisconnects() { if (this._playerDisconnectedThisTick) { this._playerDisconnectedThisTick = false; return true; } return false; }

    getLastMessage() { return this.lastMessage; }
    getLastSender() { return this.lastSender; }
    getMyPseudo() { return this.pseudo; }
    getLastJoinedPlayer() { return this.lastJoinedPlayer; }
    getLastLeftPlayer() { return this.lastLeftPlayer; }
    getPlayerCount() { return this.playerList.length; }
    getAllPlayers() { return this.playerList.join(', '); }
    getMyID() { return this.peer ? this.peer.id : ''; }
    status() { return this.isConnected; }
  }

  Scratch.extensions.register(new LocalServerExtension());
})(Scratch);
