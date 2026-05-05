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
                    ${ext.onlyDownload ? '' : `<button class="btn btn-secondary" onclick="copyLink('${ext.path}')">Copier le lien</button>`}
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
document.addEventListener('DOMContentLoaded', loadExtensions);
