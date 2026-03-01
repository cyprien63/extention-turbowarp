// Name: Audio Recorder PRO
// ID: cyprienAudioRecorder
// Description: Enregistre le microphone en Base64.
// By: Cyprien

(function (Scratch) {
    'use strict';

    class AudioRecorder {
        constructor() {
            this.mediaRecorder = null;
            this.audioChunks = [];
            this.lastRecording = '';
            this.isRecording = false;
            this.stream = null;
            this.selectedMicIndex = 0;
            this.audioElements = new Set();
            this.analyser = null;
            this.dataArray = null;
            this.audioContext = null;
            this.lastError = 'Aucune';
            this.status = 'Prêt';
        }

        getInfo() {
            return {
                id: 'cyprienAudioRecorder',
                name: 'Audio Recorder',
                color1: '#4a90e2',
                blocks: [
                    {
                        opcode: 'initPermission',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '1. Autoriser le micro'
                    },
                    '---',
                    {
                        opcode: 'setMicByIndex',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Utiliser le micro n° [INDEX]',
                        arguments: {
                            INDEX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'getMicCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Nombre de micros'
                    },
                    '---',
                    {
                        opcode: 'startRecording',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Démarrer l\'enregistrement'
                    },
                    {
                        opcode: 'stopRecording',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Arrêter l\'enregistrement'
                    },
                    {
                        opcode: 'getRecordedAudio',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Audio enregistré (TEXTE)'
                    },
                    '---',
                    {
                        opcode: 'getVolume',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Volume actuel du micro'
                    },
                    {
                        opcode: 'getStatus',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'État actuel'
                    },
                    {
                        opcode: 'getLastError',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Dernière erreur'
                    },
                    '---',
                    {
                        opcode: 'checkSecurity',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Diagnostic Sécurité'
                    },
                    {
                        opcode: 'checkApi',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'API Micro dispo ?'
                    },
                    '---',
                    {
                        opcode: 'playAudio',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Lire l\'audio [DATA]',
                        arguments: {
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    {
                        opcode: 'stopAllSounds',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Arrêter tous les sons'
                    }
                ]
            };
        }

        checkSecurity() {
            if (window.isSecureContext) return "SÉCURISÉ (OK)";
            return "NON-SÉCURISÉ (BLOQUÉ)";
        }

        checkApi() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) return "OUI (OK)";
            return "NON (BLOQUÉ)";
        }

        async initPermission() {
            this.status = 'Demande...';
            try {
                // Vérification de la présence de l'API
                if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                    throw new Error("L'API MediaDevices n'est pas disponible (vérifiez HTTPS ou Sandbox)");
                }

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                // On garde une trace pour prouver que ça marche, puis on ferme
                this.status = 'Accordé';
                stream.getTracks().forEach(t => t.stop());
                this.lastError = 'Aucune';
            } catch (e) {
                this.lastError = e.name + ': ' + e.message;
                this.status = 'Refusé / Bloqué';
                console.error("Erreur d'accès au micro:", e);
            }
        }

        setMicByIndex(args) {
            this.selectedMicIndex = Math.max(0, Math.round(args.INDEX));
            this.status = 'Micro n°' + this.selectedMicIndex;
        }

        async getMicCount() {
            try {
                if (!navigator.mediaDevices) return 0;
                const d = await navigator.mediaDevices.enumerateDevices();
                return d.filter(x => x.kind === 'audioinput').length;
            } catch (e) { return 0; }
        }

        getStatus() { return this.status; }
        getLastError() { return this.lastError; }

        getVolume() {
            if (!this.analyser) return 0;
            this.analyser.getByteFrequencyData(this.dataArray);
            let max = 0;
            for (let i = 0; i < this.dataArray.length; i++) {
                if (this.dataArray[i] > max) max = this.dataArray[i];
            }
            return Math.round(max / 2.55);
        }

        async _setupAnalyser(stream) {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            source.connect(this.analyser);
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        }

        async startRecording() {
            if (this.isRecording) return;

            // CRUCIAL : Sur Desktop, l'AudioContext doit souvent être repris ici
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.status = 'Démarrage...';
            try {
                if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                    throw new Error("Mode sécurisé requis ou case 'Unsandboxed' non cochée");
                }

                let constraints = { audio: true };
                if (this.selectedMicIndex > 0) {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const mics = devices.filter(d => d.kind === 'audioinput');
                    const target = mics[this.selectedMicIndex - 1];
                    if (target && target.deviceId) {
                        constraints = { audio: { deviceId: { exact: target.deviceId } } };
                    }
                }

                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                await this._setupAnalyser(this.stream);

                const types = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
                let mimeType = '';
                for (const t of types) {
                    if (MediaRecorder.isTypeSupported(t)) {
                        mimeType = t;
                        break;
                    }
                }

                this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : {});
                this.audioChunks = [];
                this.isRecording = true;

                this.mediaRecorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) this.audioChunks.push(e.data);
                };

                this.mediaRecorder.onstop = async () => {
                    this.status = 'Préparation...';
                    const blob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
                    if (blob.size > 0) {
                        this.lastRecording = await this._blobToBase64(blob);
                        this.status = 'Audio prêt (' + Math.round(blob.size / 1024) + ' KB)';
                    } else {
                        this.status = 'Erreur: Vide';
                    }
                    this.isRecording = false;
                    if (this.stream) {
                        this.stream.getTracks().forEach(t => t.stop());
                        this.stream = null;
                    }
                };

                this.mediaRecorder.start(100);
                this.status = 'Enregistrement...';
            } catch (e) {
                this.lastError = e.name + ': ' + e.message;
                this.status = 'Erreur Départ';
                this.isRecording = false;
            }
        }

        stopRecording() {
            if (this.mediaRecorder && this.isRecording) {
                this.mediaRecorder.stop();
                this.status = 'Arrêt...';
            }
        }

        getRecordedAudio() { return this.lastRecording; }

        playAudio(args) {
            if (!args.DATA || !args.DATA.startsWith('data:audio')) return;
            const audio = new Audio(args.DATA);
            this.audioElements.add(audio);
            audio.onended = () => this.audioElements.delete(audio);
            audio.play().catch(e => {
                this.lastError = 'Lecture: ' + e.message;
                this.audioElements.delete(audio);
            });
        }

        stopAllSounds() {
            this.audioElements.forEach(a => {
                a.pause();
                a.currentTime = 0;
            });
            this.audioElements.clear();
            this.status = 'Sons arrêtés';
        }

        _blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const r = new FileReader();
                r.onloadend = () => resolve(r.result);
                r.onerror = reject;
                r.readAsDataURL(blob);
            });
        }
    }

    Scratch.extensions.register(new AudioRecorder());
})(Scratch);
