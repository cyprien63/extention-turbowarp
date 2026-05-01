// Extension Dossier & Fichiers Silencieux pour TurboWarp
// Supporte : IndexedDB (Persistant), SessionStorage (Temporaire), et Système (Bureau/FS)

(function (Scratch) {
  'use strict';

  // --- Configuration ---
  const DB_NAME = 'TurboWarpFilesDB';
  const STORE_NAME = 'files';
  const DB_VERSION = 1;

  // Détection de l'environnement Desktop (Electron/NW.js)
  const isDesktop = typeof require !== 'undefined' && typeof process !== 'undefined';
  let fs = null;
  let path = null;
  let os = null;

  if (isDesktop) {
    try {
      fs = require('fs');
      path = require('path');
      os = require('os');
    } catch (e) {
      console.warn('Mode Bureau détecté mais impossible de charger les modules natifs:', e);
    }
  }

  class DossierExtension {
    constructor() {
      this._db = null;
      this._initDB();
    }

    /**
     * Initialise la base de données IndexedDB (pour le mode Persistant)
     */
    _initDB() {
      return new Promise((resolve, reject) => {
        if (this._db) return resolve(this._db);
        if (typeof indexedDB === 'undefined') return reject('IndexedDB non supporté');

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = (event) => {
          this._db = event.target.result;
          resolve(this._db);
        };

        request.onerror = (event) => {
          console.error('IndexedDB error:', event.target.error);
          reject(event.target.error);
        };
      });
    }

    async _getStore(mode) {
      const db = await this._initDB();
      const transaction = db.transaction(STORE_NAME, mode);
      return transaction.objectStore(STORE_NAME);
    }

    /**
     * Helper pour obtenir le chemin système réel
     */
    _getSystemPath(type, fileName) {
      if (!isDesktop || !fs) return null;
      
      let baseDir = '';
      if (type === 'temp') {
        baseDir = os.tmpdir();
      } else if (type === 'app') {
        // Dossier de l'application (ou dossier utilisateur local)
        baseDir = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
        baseDir = path.join(baseDir, 'TurboWarpProjects');
        if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
      } else {
        // Dossier actuel du projet (si défini)
        baseDir = process.cwd();
      }
      
      return path.join(baseDir, fileName);
    }

    getInfo() {
      return {
        id: 'dossierFiles',
        name: '📁 Dossier et Fichiers',
        color1: '#4a90e2',
        color2: '#357abd',
        blocks: [
          {
            opcode: 'saveFile',
            blockType: Scratch.BlockType.COMMAND,
            text: 'sauvegarder [CONTENT] dans [PATH] (Mode: [MODE])',
            arguments: {
              CONTENT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Données de sauvegarde'
              },
              PATH: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'sauvegarde1.txt'
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'storageMenu',
                defaultValue: 'persistent'
              }
            }
          },
          {
            opcode: 'readFile',
            blockType: Scratch.BlockType.REPORTER,
            text: 'lire le fichier [PATH] (Mode: [MODE])',
            arguments: {
              PATH: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'sauvegarde1.txt'
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'storageMenu',
                defaultValue: 'persistent'
              }
            }
          },
          {
            opcode: 'exists',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'le fichier [PATH] existe ? (Mode: [MODE])',
            arguments: {
              PATH: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'sauvegarde1.txt'
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'storageMenu',
                defaultValue: 'persistent'
              }
            }
          },
          {
            opcode: 'deleteFile',
            blockType: Scratch.BlockType.COMMAND,
            text: 'supprimer le fichier [PATH] (Mode: [MODE])',
            arguments: {
              PATH: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'sauvegarde1.txt'
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'storageMenu',
                defaultValue: 'persistent'
              }
            }
          },
          '---',
          {
            opcode: 'isDesktopMode',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'est sur application Bureau ?'
          },
          {
            opcode: 'getAppPath',
            blockType: Scratch.BlockType.REPORTER,
            text: 'chemin du dossier [TYPE]',
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'pathMenu',
                defaultValue: 'temp'
              }
            }
          }
        ],
        menus: {
          storageMenu: {
            acceptReporters: true,
            items: [
              { text: 'Persistant (Web/App)', value: 'persistent' },
              { text: 'Temporaire (Session)', value: 'temporary' },
              { text: 'Système Temp (Bureau)', value: 'system_temp' },
              { text: 'Système App (Bureau)', value: 'system_app' }
            ]
          },
          pathMenu: {
            acceptReporters: true,
            items: [
              { text: 'Temp (Système)', value: 'temp' },
              { text: 'App Data', value: 'app' },
              { text: 'Exécution', value: 'cwd' }
            ]
          }
        }
      };
    }

    isDesktopMode() {
      return isDesktop;
    }

    getAppPath(args) {
      if (!isDesktop) return 'Web Mode (N/A)';
      const type = args.TYPE;
      if (type === 'temp') return os.tmpdir();
      if (type === 'app') {
         return process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
      }
      return process.cwd();
    }

    async saveFile(args) {
      const pathStr = String(args.PATH);
      const content = String(args.CONTENT);
      const mode = args.MODE;

      try {
        if (mode === 'persistent') {
          const store = await this._getStore('readwrite');
          await new Promise((resolve, reject) => {
            const request = store.put(content, pathStr);
            request.onsuccess = resolve;
            request.onerror = reject;
          });
        } 
        else if (mode === 'temporary') {
          sessionStorage.setItem('tw_file_' + pathStr, content);
        } 
        else if (mode.startsWith('system_')) {
          if (!isDesktop) throw new Error('Mode système disponible uniquement sur Bureau');
          const fullPath = this._getSystemPath(mode === 'system_temp' ? 'temp' : 'app', pathStr);
          fs.writeFileSync(fullPath, content, 'utf8');
        }
      } catch (e) {
        console.error('Save failed:', e);
        throw e; // Affiche l'erreur dans Scratch si possible
      }
    }

    async readFile(args) {
      const pathStr = String(args.PATH);
      const mode = args.MODE;

      try {
        if (mode === 'persistent') {
          const store = await this._getStore('readonly');
          const content = await new Promise((resolve, reject) => {
            const request = store.get(pathStr);
            request.onsuccess = () => resolve(request.result);
            request.onerror = reject;
          });
          return content || '';
        } 
        else if (mode === 'temporary') {
          return sessionStorage.getItem('tw_file_' + pathStr) || '';
        } 
        else if (mode.startsWith('system_')) {
          if (!isDesktop) return 'Erreur: Mode Bureau requis';
          const fullPath = this._getSystemPath(mode === 'system_temp' ? 'temp' : 'app', pathStr);
          if (fs.existsSync(fullPath)) {
            return fs.readFileSync(fullPath, 'utf8');
          }
          return '';
        }
      } catch (e) {
        console.error('Read failed:', e);
        return '';
      }
    }

    async exists(args) {
      const pathStr = String(args.PATH);
      const mode = args.MODE;

      try {
        if (mode === 'persistent') {
          const store = await this._getStore('readonly');
          const result = await new Promise((resolve, reject) => {
            const request = store.getKey(pathStr);
            request.onsuccess = () => resolve(request.result !== undefined);
            request.onerror = reject;
          });
          return result;
        } 
        else if (mode === 'temporary') {
          return sessionStorage.getItem('tw_file_' + pathStr) !== null;
        } 
        else if (mode.startsWith('system_')) {
          if (!isDesktop) return false;
          const fullPath = this._getSystemPath(mode === 'system_temp' ? 'temp' : 'app', pathStr);
          return fs.existsSync(fullPath);
        }
      } catch (e) {
        return false;
      }
    }

    async deleteFile(args) {
      const pathStr = String(args.PATH);
      const mode = args.MODE;

      try {
        if (mode === 'persistent') {
          const store = await this._getStore('readwrite');
          await new Promise((resolve, reject) => {
            const request = store.delete(pathStr);
            request.onsuccess = resolve;
            request.onerror = reject;
          });
        } 
        else if (mode === 'temporary') {
          sessionStorage.removeItem('tw_file_' + pathStr);
        } 
        else if (mode.startsWith('system_')) {
          if (!isDesktop) return;
          const fullPath = this._getSystemPath(mode === 'system_temp' ? 'temp' : 'app', pathStr);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      } catch (e) {
        console.error('Delete failed:', e);
      }
    }
  }

  Scratch.extensions.register(new DossierExtension());
})(Scratch);

