(function(Scratch) {
  'use strict';

  class PakageExtension {
    getInfo() {
      return {
        id: 'pakage',
        name: 'Pakage 📦',
        color1: '#FF661A',
        color2: '#FF5500',
        color3: '#E64D00',
        blocks: [
          {
            opcode: 'smartJoin',
            blockType: Scratch.BlockType.REPORTER,
            text: 'ajouter [ITEM] à [DATA] (séparateur [SEP])',
            arguments: {
              ITEM: { type: Scratch.ArgumentType.STRING, defaultValue: '100' },
              DATA: { type: Scratch.ArgumentType.STRING, defaultValue: '10|20' },
              SEP: { type: Scratch.ArgumentType.STRING, defaultValue: '|' }
            }
          },
          {
            opcode: 'replaceItem',
            blockType: Scratch.BlockType.REPORTER,
            text: 'dans [DATA], remplacer n° [INDEX] par [VALUE] (séparateur [SEP])',
            arguments: {
              DATA: { type: Scratch.ArgumentType.STRING, defaultValue: '10|20|100' },
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 },
              VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: '25' },
              SEP: { type: Scratch.ArgumentType.STRING, defaultValue: '|' }
            }
          },
          '---',
          {
            opcode: 'getItem',
            blockType: Scratch.BlockType.REPORTER,
            text: 'élément n° [INDEX] de [DATA] (séparateur [SEP])',
            arguments: {
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              DATA: { type: Scratch.ArgumentType.STRING, defaultValue: '10|20|100' },
              SEP: { type: Scratch.ArgumentType.STRING, defaultValue: '|' }
            }
          },
          {
            opcode: 'countItems',
            blockType: Scratch.BlockType.REPORTER,
            text: 'longueur de [DATA] (séparateur [SEP])',
            arguments: {
              DATA: { type: Scratch.ArgumentType.STRING, defaultValue: '10|20|100' },
              SEP: { type: Scratch.ArgumentType.STRING, defaultValue: '|' }
            }
          },
          '---',
          {
            opcode: 'simpleJoin',
            blockType: Scratch.BlockType.REPORTER,
            text: 'joindre [A] [B] avec [SEP]',
            arguments: {
              A: { type: Scratch.ArgumentType.STRING, defaultValue: 'x' },
              B: { type: Scratch.ArgumentType.STRING, defaultValue: 'y' },
              SEP: { type: Scratch.ArgumentType.STRING, defaultValue: ',' }
            }
          }
        ]
      };
    }

    smartJoin(args) {
      const item = String(args.ITEM);
      const data = String(args.DATA);
      const sep = String(args.SEP);
      if (data === '') return item;
      return data + sep + item;
    }

    replaceItem(args) {
      const data = String(args.DATA);
      const index = Math.max(1, Math.floor(Scratch.Cast.toNumber(args.INDEX))) - 1;
      const value = String(args.VALUE);
      const sep = String(args.SEP);
      
      if (data === '') return value;
      const items = data.split(sep);
      
      // Si l'index est au-delà de la taille actuelle, on remplit avec des vides
      while (items.length <= index) {
        items.push('');
      }
      
      items[index] = value;
      return items.join(sep);
    }

    getItem(args) {
      const index = Math.max(1, Math.floor(Scratch.Cast.toNumber(args.INDEX))) - 1;
      const data = String(args.DATA);
      const sep = String(args.SEP);
      if (data === '') return '';
      const items = data.split(sep);
      return items[index] || '';
    }

    countItems(args) {
      const data = String(args.DATA);
      const sep = String(args.SEP);
      if (data === '') return 0;
      return data.split(sep).length;
    }

    simpleJoin(args) {
      return String(args.A) + String(args.SEP) + String(args.B);
    }
  }

  Scratch.extensions.register(new PakageExtension());
})(Scratch);
