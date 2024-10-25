// Voeg deze functies toe aan het bestaande admin.js bestand

function generateDownloadLink(type) {
    const resultBox = document.getElementById(`${type}Result`);
    const expiry = document.getElementById('linkExpiry').value;
    const autoUpdate = document.getElementById('autoUpdate').checked;
    
    const link = generateUniqueLink(type);
    const expiryDate = new Date(Date.now() + (expiry * 60 * 60 * 1000));
    
    const linkData = {
        url: link,
        type: type,
        expiry: expiryDate,
        autoUpdate: autoUpdate,
        created: new Date()
    };
    
    // Sla link data op
    saveDistributionLink(linkData);
    
    // Toon resultaat
    resultBox.innerHTML = `
        <div class="link-details">
            <p><strong>Download Link:</strong> <a href="${link}" target="_blank">${link}</a></p>
            <p><strong>Verloopt op:</strong> ${expiryDate.toLocaleString()}</p>
            <button onclick="copyToClipboard('${link}')" class="btn-secondary">Kopieer Link</button>
            <button onclick="sendLinkByEmail('${link}', '${type}')" class="btn-secondary">Verstuur per Email</button>
        </div>
    `;
}

function generateUniqueLink(type) {
    const baseUrl = window.location.origin;
    const uniqueId = Math.random().toString(36).substring(2, 15);
    
    if (type === 'apk') {
        return `${baseUrl}/download/app-${uniqueId}.apk`;
    } else {
        return `${baseUrl}/pwa/${uniqueId}`;
    }
}

function saveDistributionLink(linkData) {
    const links = JSON.parse(localStorage.getItem('distribution_links') || '[]');
    links.push(linkData);
    localStorage.setItem('distribution_links', JSON.stringify(links));
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link gekopieerd naar klembord!');
    });
}

function sendLinkByEmail(link, type) {
    const email = prompt('Voer het e-mailadres in:');
    if (email) {
        // Implementeer email verzending hier
        alert(`Link wordt verzonden naar ${email}`);
    }
}

// Event listeners
document.getElementById('distributionForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = {
        linkExpiry: document.getElementById('linkExpiry').value,
        autoUpdate: document.getElementById('autoUpdate').checked
    };
    localStorage.setItem('distribution_settings', JSON.stringify(settings));
    alert('Distributie instellingen opgeslagen!');
});