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
    
    const siteUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'turbowarp-extensions-local-dev' 
        : window.location.hostname;
    
    const badgeUrl = `https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2F${siteUrl}&count_bg=%234C97FF&title_bg=%231E293B&icon=&icon_color=%23E7E7E7&title=Visiteurs&edge_flat=false`;
    
    // 1. Incrémenter le compteur pour TOUS les visiteurs (invisible)
    const tracker = new Image();
    tracker.src = badgeUrl;

    // 2. Afficher le badge SEULEMENT si l'URL contient "?stats"
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('stats') && adminPanel) {
        adminPanel.style.display = 'block';
        adminPanel.innerHTML = `<img src="${badgeUrl}" alt="Stats">`;
    }
}
