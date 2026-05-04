async function loadExtensions() {
    const grid = document.getElementById('extension-grid');
    
    try {
        const response = await fetch('extensions.json');
        if (!response.ok) throw new Error('Impossible de charger le catalogue');
        
        const extensions = await response.json();
        grid.innerHTML = ''; // Effacer le loader
        
        extensions.forEach(ext => {
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
    } catch (error) {
        grid.innerHTML = `<div class="loader">Erreur : ${error.message}</div>`;
    }
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

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadExtensions();
    initVisitorCounter();
});

function initVisitorCounter() {
    const adminPanel = document.getElementById('admin-stats');
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.has('stats');

    // Identifiant unique : hostname + pathname (pour différencier les projets sur GitHub)
    const siteId = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'turbowarp-local-dev' 
        : (window.location.hostname + window.location.pathname).replace(/\/$/, "");

    // On utilise un service de "hits" simple
    // On ajoute un timestamp pour forcer le rafraîchissement si on est admin
    const cacheBuster = isAdmin ? `&t=${Date.now()}` : '';
    const badgeUrl = `https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2F${encodeURIComponent(siteId)}&count_bg=%234C97FF&title_bg=%231E293B&icon=&icon_color=%23E7E7E7&title=Visiteurs&edge_flat=false${cacheBuster}`;

    // 1. Incrémenter (toujours)
    const tracker = new Image();
    tracker.src = badgeUrl;

    // 2. Afficher si mode admin
    if (isAdmin && adminPanel) {
        console.log("Mode Admin activé. ID du site :", siteId);
        adminPanel.style.display = 'block';
        adminPanel.innerHTML = `
            <div style="font-size:10px; margin-bottom:5px; color:var(--text-muted)">Stats pour: ${siteId}</div>
            <img src="${badgeUrl}" alt="Chargement des stats..." onerror="this.alt='Erreur de chargement'">
        `;
    }
}
