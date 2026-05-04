const EXTENSIONS_DATA = [
  {
    "id": "pakage",
    "name": "Pakage",
    "icon": "📦",
    "description": "Assemblez et désassemblez vos données facilement. Idéal pour les jeux multijoueurs et la gestion de paquets d'informations.",
    "path": "pakage/extension.js"
  },
  {
    "id": "dossier",
    "name": "Dossier & Fichiers",
    "icon": "📁",
    "description": "Sauvegardes silencieuses et persistantes. Idéal pour les systèmes de 'Save Game' et la gestion de fichiers sur PC/Web sans fenêtres de téléchargement.",
    "path": "dossier/extension.js"
  },
  {
    "id": "IA",
    "name": "Multi-IA",
    "icon": "🤖",
    "description": "Intégrez ChatGPT, Gemini, Claude et plus. Supporte Groq avec les derniers modèles Llama 3.1 et 3.2.",
    "path": "IA/extension.js"
  },
  {
    "id": "calcul",
    "name": "Calcul Brut PRO",
    "icon": "🎓",
    "description": "Calculs mathématiques avancés, parsing d'expressions complexes et fonctions trigonométriques étendues avec sécurité renforcée.",
    "path": "calcul/extension.js"
  },
  {
    "id": "serveur-local",
    "name": "Serveur Local P2P",
    "icon": "🌐",
    "description": "Communiquez en Peer-to-Peer via WebRTC. Permet de créer des jeux multijoueurs sans serveur central lourd.",
    "path": "serveur-local/extension.js"
  },
  {
    "id": "voice-enregistreur",
    "name": "Voice Enregistreur",
    "icon": "🎙️",
    "description": "Enregistrez de l'audio et manipulez des fichiers vocaux directement dans l'interface Scratch.",
    "path": "voice-enregistreur/extension.js"
  }
];

function loadExtensions() {
    const grid = document.getElementById('extension-grid');
    if (!grid) return;
    
    grid.innerHTML = ''; // Effacer le loader
    
    EXTENSIONS_DATA.forEach(ext => {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <div class="card-icon">${ext.icon || '🧩'}</div>
            <h2>${ext.name}</h2>
            <p>${ext.description}</p>
            <div class="card-actions">
                <a href="${ext.path}" class="btn btn-primary" download>Télécharger</a>
                <button class="btn btn-secondary" onclick="copyLink('${ext.path}')">Copier le lien</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function copyLink(path) {
    const fullUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '') + '/' + path;
    navigator.clipboard.writeText(fullUrl).then(() => {
        const toast = document.getElementById('toast');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 2000);
    });
}

function initVisitorCounter() {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.has('stats');
    
    // On utilise une clé fixe et simple pour être sûr que ça marche partout
    const siteKey = "cyprien63-turbowarp-main";
    const badgeUrl = `https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2F${siteKey}&count_bg=%234C97FF&title_bg=%231E293B&icon=&icon_color=%23E7E7E7&title=Visiteurs&edge_flat=false`;

    // 1. On crée un élément img pour forcer le comptage
    const tracker = new Image();
    tracker.src = badgeUrl + "&t=" + Date.now();

    // 2. Si on a "?stats" dans l'URL, on affiche le badge en haut de la page
    if (isAdmin) {
        const statsDiv = document.createElement('div');
        statsDiv.innerHTML = `
            <div style="position:fixed; top:20px; right:20px; z-index:10000; background:#1e293b; padding:15px; border-radius:12px; border:2px solid #4c97ff; box-shadow:0 10px 25px rgba(0,0,0,0.5); text-align:center;">
                <div style="color:white; font-size:12px; margin-bottom:8px; font-weight:bold;">Statistiques Temps Réel</div>
                <img src="${badgeUrl}&admin=true&t=${Date.now()}" alt="Compteur" style="display:block; margin:0 auto;">
                <button onclick="location.reload()" style="margin-top:10px; background:#4c97ff; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:11px;">Rafraîchir</button>
            </div>
        `;
        document.body.appendChild(statsDiv);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadExtensions();
    initVisitorCounter();
});
