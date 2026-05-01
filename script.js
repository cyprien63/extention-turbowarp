const extensionUrlInput = document.getElementById('extensionUrl');
const loadBtn = document.getElementById('loadBtn');
const presetList = document.getElementById('presetList');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

const presets = [
    { name: 'Exemple d\'extension', url: 'https://extensions.turbowarp.org/hello.js' },
    { name: 'Extension Canvas', url: 'https://extensions.turbowarp.org/canvas.js' },
    { name: 'Extension WebSocket', url: 'https://extensions.turbowarp.org/websocket.js' }
];

let history = JSON.parse(localStorage.getItem('extensionHistory') || '[]');

function renderPresets() {
    presetList.innerHTML = '';
    presets.forEach(preset => {
        const div = document.createElement('div');
        div.className = 'preset-item';
        div.textContent = preset.name;
        div.onclick = () => {
            extensionUrlInput.value = preset.url;
            loadExtension(preset.url);
        };
        presetList.appendChild(div);
    });
}

function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(url => {
        const li = document.createElement('li');
        li.textContent = url;
        li.onclick = () => {
            extensionUrlInput.value = url;
            loadExtension(url);
        };
        historyList.appendChild(li);
    });
}

function addToHistory(url) {
    if (!history.includes(url)) {
        history.unshift(url);
        if (history.length > 10) history.pop();
        localStorage.setItem('extensionHistory', JSON.stringify(history));
        renderHistory();
    }
}

function loadExtension(url) {
    if (!url) {
        alert('Veuillez entrer une URL d\'extension');
        return;
    }
    const turbowarpUrl = `https://turbowarp.org/editor?extension=${encodeURIComponent(url)}`;
    window.open(turbowarpUrl, '_blank');
    addToHistory(url);
}

loadBtn.onclick = () => loadExtension(extensionUrlInput.value);

extensionUrlInput.onkeypress = (e) => {
    if (e.key === 'Enter') loadExtension(extensionUrlInput.value);
};

clearHistoryBtn.onclick = () => {
    history = [];
    localStorage.removeItem('extensionHistory');
    renderHistory();
};

renderPresets();
renderHistory();
