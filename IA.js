// Extension Multi-IA avec modèles Groq mis à jour
(function(Scratch) {
  'use strict';

  class MultiIAExtension {
    constructor() {
      this.apiKeys = {
        chatgpt: '',
        deepseek: '',
        gemini: '',
        groq: '',
        claude: '',
        copilot: ''
      };
      this.currentAI = 'chatgpt';
      this.models = {
        groq: 'llama-3.1-8b-instant', // Nouveau modèle Groq
        chatgpt: 'gpt-3.5-turbo',
        deepseek: 'deepseek-chat',
        copilot: 'gpt-4'
      };
    }

    getInfo() {
      return {
        id: 'multiIA',
        name: '🤖 Multi-IA',
        color1: '#FF6B6B',
        color2: '#4ECDC4',
        blocks: [
          // Bloc UNIQUE pour définir les clés API (MODIFIÉ)
          {
            opcode: 'setAIKey',
            blockType: Scratch.BlockType.COMMAND,
            text: 'définir clé [AI] : [KEY]',
            arguments: {
              AI: {
                type: Scratch.ArgumentType.STRING,
                menu: 'aiMenu', // Utilise le menu des IA
                defaultValue: 'chatgpt'
              },
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              }
            }
          },

          // Séparateur
          {
            opcode: 'separatorConfig', // Renommé pour éviter un conflit avec 'separator'
            blockType: Scratch.BlockType.LABEL,
            text: 'Configuration IA'
          },

          // Bloc pour choisir le modèle Groq
          {
            opcode: 'setGroqModel',
            blockType: Scratch.BlockType.COMMAND,
            text: 'modèle Groq [MODEL]',
            arguments: {
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                menu: 'groqModelMenu'
              }
            }
          },

          // Bloc pour CHOISIR quelle IA utiliser
          {
            opcode: 'selectAI',
            blockType: Scratch.BlockType.COMMAND,
            text: 'utiliser IA [AI]',
            arguments: {
              AI: {
                type: Scratch.ArgumentType.STRING,
                menu: 'aiMenu'
              }
            }
          },

          // Bloc pour voir quelle IA est sélectionnée
          {
            opcode: 'getCurrentAI',
            blockType: Scratch.BlockType.REPORTER,
            text: 'IA sélectionnée'
          },

          // UN SEUL bloc pour poser des questions
          {
            opcode: 'askAI',
            blockType: Scratch.BlockType.REPORTER,
            text: 'demander [PROMPT]',
            arguments: {
              PROMPT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Bonjour, qui es-tu ?'
              }
            }
          },

          // Bloc pour voir le statut des clés
          {
            opcode: 'checkKeys',
            blockType: Scratch.BlockType.REPORTER,
            text: 'clés configurées'
          }
        ],
        menus: {
          aiMenu: {
            items: [
              { text: 'ChatGPT', value: 'chatgpt' },
              { text: 'DeepSeek', value: 'deepseek' },
              { text: 'Gemini', value: 'gemini' },
              { text: 'Groq', value: 'groq' },
              { text: 'Claude', value: 'claude' },
              { text: 'Copilot', value: 'copilot' }
            ]
          },
          groqModelMenu: {
            items: [
              'llama-3.1-8b-instant',
              'llama-3.2-1b-preview',
              'llama-3.2-3b-preview',
              'llama-3.2-11b-vision-preview',
              'llama-3.2-90b-vision-preview',
              'mixtral-8x7b-32768',
              'gemma2-9b-it'
            ]
          }
        }
      };
    }

    // Méthode UNIQUE pour définir n'importe quelle clé (MODIFIÉ)
    setAIKey(args) {
      const ai = args.AI;
      const key = args.KEY.trim();
      this.apiKeys[ai] = key;
      return `Clé ${ai} OK`;
    }

    // Anciennes méthodes de clés supprimées (setChatGPTKey, setDeepSeekKey, etc.)

    // Choisir le modèle Groq
    setGroqModel(args) {
      this.models.groq = args.MODEL;
      return `Modèle Groq: ${args.MODEL}`;
    }

    // Choisir l'IA à utiliser
    selectAI(args) {
      const selectedAI = args.AI;
      this.currentAI = selectedAI;
      console.log('IA sélectionnée:', this.currentAI);
      return `IA changée: ${selectedAI}`;
    }

    // Voir l'IA actuelle
    getCurrentAI() {
      return this.currentAI;
    }

    // UNE SEULE méthode pour demander à n'importe quelle IA
    async askAI(args) {
      const prompt = String(args.PROMPT);
      const ai = this.currentAI;

      console.log('Demande à:', ai, 'Clé présente:', !!this.apiKeys[ai]);

      if (!this.apiKeys[ai]) {
        return `❌ Clé ${ai} manquante. Utilise "définir clé ${ai}" d'abord.`;
      }

      try {
        let response, data;

        switch(ai) {
          case 'chatgpt':
            response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.apiKeys.chatgpt}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: this.models.chatgpt,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500
              })
            });
            break;

          case 'deepseek':
            response = await fetch('https://api.deepseek.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.apiKeys.deepseek}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: this.models.deepseek,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500
              })
            });
            break;

          case 'gemini':
            response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKeys.gemini}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: prompt }]
                }],
                generationConfig: {
                  maxOutputTokens: 500
                }
              })
            });
            break;

          case 'groq':
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.apiKeys.groq}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: this.models.groq, // Utilise le modèle configuré
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500
              })
            });
            break;

          case 'claude':
            response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'x-api-key': this.apiKeys.claude,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 500,
                messages: [{ role: 'user', content: prompt }]
              })
            });
            break;

          case 'copilot':
            response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.apiKeys.copilot}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: this.models.copilot,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500
              })
            });
            break;

          default:
            return '❌ IA non reconnue';
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        data = await response.json();

        // Extraire la réponse selon l'IA
        switch(ai) {
          case 'chatgpt':
          case 'deepseek':
          case 'groq':
          case 'copilot':
            return data.choices[0]?.message?.content || 'Pas de réponse';
          case 'gemini':
            return data.candidates[0]?.content?.parts[0]?.text || 'Pas de réponse';
          case 'claude':
            return data.content[0]?.text || 'Pas de réponse';
          default:
            return JSON.stringify(data);
        }

      } catch (error) {
        console.error('Erreur complète:', error);
        return `❌ Erreur ${ai}: ${error.message}`;
      }
    }

    // Vérifier quelles clés sont configurées
    checkKeys() {
      const configured = [];
      for (const [ai, key] of Object.entries(this.apiKeys)) {
        if (key) configured.push(ai);
      }
      return configured.length > 0 ? configured.join(', ') : 'Aucune clé';
    }

    // Méthode séparateur d'origine
    separator() {
      return '';
    }

    // Nouvelle méthode pour le nouveau séparateur (pour éviter un conflit)
    separatorConfig() {
        return '';
    }
  }

  Scratch.extensions.register(new MultiIAExtension());
})(Scratch);