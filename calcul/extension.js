class CalculBrutExtension {
    // 1. Informations de l'extension
    getInfo() {
        return {
            id: 'calculbrut',
            name: 'Calcul Brut PRO 🎓',
            color1: '#4C97FF',
            color2: '#0066FF',
            color3: '#1E58AE',
            blocks: [
                // NOUVEAU BLOC 1 : Lien de soutien
                {
                    opcode: 'getSupportLink',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'Lien pour soutenir le créateur',
                    disableMonitor: true
                },
                // --- Les blocs de calculs précédents suivent ci-dessous ---
                
                // Bloc 2 : Évaluation de l'expression brute (V1)
                {
                    opcode: 'evaluer',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'résultat de l\'expression [EXPRESSION]',
                    arguments: {
                        EXPRESSION: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '4 + 4 * 2',
                        }
                    }
                },
                
                // Bloc 3 : Fonction mathématique spécifique (V2/V3)
                {
                    opcode: 'fonctionMath',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '[FONCTION] de [NOMBRE]',
                    arguments: {
                        FONCTION: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'mathFunctions', 
                            defaultValue: 'sin',
                        },
                        NOMBRE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 90,
                        }
                    }
                },
                
                // Bloc 4 : Constante Pi (π) (V2)
                {
                    opcode: 'constantePi',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'pi (π)',
                    disableMonitor: true
                },

                // Bloc 5 : Constante d'Euler (e) (V3)
                {
                    opcode: 'constanteE',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'e (constante d\'Euler)',
                    disableMonitor: true
                },

                // Bloc 6 : Modulo (Reste de la division) (V3)
                {
                    opcode: 'modulo',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'reste de la division [NOMBRE1] par [NOMBRE2]',
                    arguments: {
                        NOMBRE1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
                        NOMBRE2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
                    }
                },

                // Bloc 7 : Arrondi avec précision (V3)
                {
                    opcode: 'roundToPrecision',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'arrondir [NOMBRE] à [PRECISION] décimales',
                    arguments: {
                        NOMBRE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3.14159 },
                        PRECISION: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 }
                    }
                },

                // Bloc 8 : Conversion d'angle (V3)
                {
                    opcode: 'convertAngle',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'convertir [VALEUR] [TYPE_DE_DEPART] en [TYPE_D_ARRIVEE]',
                    arguments: {
                        VALEUR: { type: Scratch.ArgumentType.NUMBER, defaultValue: 180 },
                        TYPE_DE_DEPART: { type: Scratch.ArgumentType.STRING, menu: 'angleType', defaultValue: 'degrees' },
                        TYPE_D_ARRIVEE: { type: Scratch.ArgumentType.STRING, menu: 'angleType', defaultValue: 'radians' }
                    }
                }
            ],
            // Définition des menus déroulants (inchangés)
            menus: {
                mathFunctions: {
                    acceptReporters: true,
                    items: [
                        { text: 'sinus (sin)', value: 'sin' },
                        { text: 'cosinus (cos)', value: 'cos' },
                        { text: 'tangente (tan)', value: 'tan' },
                        { text: 'arc sinus (asin)', value: 'asin' },
                        { text: 'arc cosinus (acos)', value: 'acos' },
                        { text: 'arc tangente (atan)', value: 'atan' },
                        { text: 'racine carrée (sqrt)', value: 'sqrt' },
                        { text: 'logarithme naturel (ln)', value: 'log' },
                        { text: 'valeur absolue (abs)', value: 'abs' }
                    ]
                },
                angleType: {
                    items: [
                        { text: 'Degrés', value: 'degrees' },
                        { text: 'Radians', value: 'radians' }
                    ]
                }
            }
        };
    }

    // NOUVEAU : Logique du bloc 'getSupportLink'
    getSupportLink() {
        return "https://paypal.me/CyprienPisicchio";
    }

    // --- Les autres fonctions de calcul (evaluer, fonctionMath, constantePi, etc.) restent inchangées ---
    
    // 2. Logique d'exécution du bloc 'evaluer'
    evaluer(args) {
        const expression = String(args.EXPRESSION);
        try {
            // Sécurité : On ne garde que les chiffres, opérateurs, points, parenthèses et espaces
            const safeExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
            
            // Évaluation via un constructeur de fonction plus isolé que eval()
            // On limite l'accès au contexte global
            const result = Function('"use strict"; return (' + safeExpression + ')')();
            
            if (typeof result === 'number' && isFinite(result)) {
                return result;
            } else {
                return 0; 
            }
        } catch (e) {
            return 0; 
        }
    }

    // 3. Logique d'exécution du bloc 'fonctionMath'
    fonctionMath(args) {
        const func = args.FONCTION;
        const nombre = Scratch.Cast.toNumber(args.NOMBRE);
        const PI = Math.PI;

        switch (func) {
            case 'sin':
                return Math.sin(nombre * (PI / 180));
            case 'cos':
                return Math.cos(nombre * (PI / 180));
            case 'tan':
                return Math.tan(nombre * (PI / 180));
            case 'asin':
                return Math.asin(nombre) * (180 / PI);
            case 'acos':
                return Math.acos(nombre) * (180 / PI);
            case 'atan':
                return Math.atan(nombre) * (180 / PI);
            case 'sqrt':
                return Math.sqrt(nombre);
            case 'log':
                return Math.log(nombre); 
            case 'abs':
                return Math.abs(nombre);
            default:
                return 0;
        }
    }

    // 4. Constantes (Pi et e)
    constantePi() {
        return Math.PI;
    }
    
    constanteE() {
        return Math.E;
    }

    // 5. Logique du bloc 'modulo'
    modulo(args) {
        const num1 = Scratch.Cast.toNumber(args.NOMBRE1);
        const num2 = Scratch.Cast.toNumber(args.NOMBRE2);
        return num1 % num2; 
    }

    // 6. Logique du bloc 'roundToPrecision'
    roundToPrecision(args) {
        const nombre = Scratch.Cast.toNumber(args.NOMBRE);
        const precision = Math.abs(Scratch.Cast.toNumber(args.PRECISION));
        
        const facteur = Math.pow(10, precision);
        return Math.round(nombre * facteur) / facteur;
    }

    // 7. Logique du bloc 'convertAngle'
    convertAngle(args) {
        const valeur = Scratch.Cast.toNumber(args.VALEUR);
        const depart = args.TYPE_DE_DEPART;
        const arrivee = args.TYPE_D_ARRIVEE;
        const PI = Math.PI;

        if (depart === arrivee) {
            return valeur;
        }

        if (depart === 'degrees' && arrivee === 'radians') {
            return valeur * (PI / 180);
        } else if (depart === 'radians' && arrivee === 'degrees') {
            return valeur * (180 / PI);
        }
        
        return valeur;
    }
}

// 8. Enregistrement
Scratch.extensions.register(new CalculBrutExtension());