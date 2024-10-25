// Distributie management
class DistributionManager {
    constructor() {
        this.distributions = [];
        this.loadDistributions();
        this.initializeEventListeners();
    }

    async loadDistributions() {
        try {
            // Laad bestaande distributies
            const savedDistributions = localStorage.getItem('distributions');
            this.distributions = savedDistributions ? JSON.parse(savedDistributions) : [];

            if (this.distributions.length === 0) {
                // Voeg standaard distributies toe als er geen zijn
                this.distributions = [
                    {
                        id: 'vip-installatie',
                        name: 'VIP Installatie',
                        domain: 'vip-installatie.nl',
                        color: '#B8860B',
                        logo: '/images/vip-logo.png',
                        active: true,
                        users: 247,
                        lastUpdate: '2024-03-24'
                    },
                    {
                        id: 'telecom-support',
                        name: 'Telecom Support',
                        domain: 'telecom-support.nl',
                        color: '#4B0082',
                        logo: '/images/telecom-logo.png',
                        active: true,
                        users: 124,
                        lastUpdate: '2024-03-23'
                    }
                ];
                await this.saveDistributions();
            }

            this.renderDistributions();
        } catch (error) {
            console.error('Fout bij laden distributies:', error);
            alert('Er is een fout opgetreden bij het laden van de distributies.');
        }
    }

    async saveDistributions() {
        try {
            localStorage.setItem('distributions', JSON.stringify(this.distributions));
        } catch (error) {
            console.error('Fout bij opslaan distributies:', error);
            throw error;
        }
    }

    renderDistributions() {
        const grid = document.getElementById('distributionsGrid');
        grid.innerHTML = this.distributions.map(dist => this.createDistributionCard(dist)).join('');
    }

    createDistributionCard(dist) {
        return `
            <div class="card" data-id="${dist.id}">
                <div class="card-header" style="border-left: 4px solid ${dist.color}">
                    <h3>${dist.name}</h3>
                    <span class="badge badge-${dist.active ? 'success' : 'warning'}">
                        ${dist.active ? 'Actief' : 'Inactief'}
                    </span>
                </div>
                <div class="card-body">
                    <div class="info-group">
                        <label>Domein:</label>
                        <span>${dist.domain}</span>
                    </div>
                    <div class="info-group">
                        <label>Actieve Gebruikers:</label>
                        <span>${dist.users}</span>
                    </div>
                    <div class="info-group">
                        <label>Laatste Update:</label>
                        <span>${dist.lastUpdate}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <button onclick="distributionManager.editDistribution('${dist.id}')" 
                            class="btn-secondary">Bewerken</button>
                    <button onclick="distributionManager.viewStatistics('${dist.id}')" 
                            class="btn-secondary">Statistieken</button>
                    <button onclick="distributionManager.toggleActive('${dist.id}')" 
                            class="btn-${dist.active ? 'warning' : 'success'}">
                        ${dist.active ? 'Deactiveren' : 'Activeren'}
                    </button>
                </div>
            </div>
        `;
    }

    initializeEventListeners() {
        // Nieuwe distributie form
        document.getElementById('newDistributionForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewDistribution();
        });

        // Edit distributie form
        document.getElementById('editDistributionForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedDistribution();
        });
    }

    async createNewDistribution() {
        try {
            const name = document.getElementById('distName').value;
            const domain = document.getElementById('distDomain').value;
            const color = document.getElementById('distColor').value;
            
            const newDist = {
                id: 'dist_' + Date.now(),
                name,
                domain,
                color,
                active: true,
                users: 0,
                lastUpdate: new Date().toISOString().split('T')[0]
            };

            this.distributions.push(newDist);
            await this.saveDistributions();
            this.renderDistributions();
            closeModal('newDistributionModal');
            
            alert('Nieuwe distributie succesvol aangemaakt!');
        } catch (error) {
            console.error('Fout bij aanmaken distributie:', error);
            alert('Er is een fout opgetreden bij het aanmaken van de distributie.');
        }
    }

    async editDistribution(id) {
        const dist = this.distributions.find(d => d.id === id);
        if (!dist) return;

        // Vul form met huidige waardes
        document.getElementById('editDistName').value = dist.name;
        document.getElementById('editDistDomain').value = dist.domain;
        document.getElementById('editDistColor').value = dist.color;

        // Toon modal
        const modal = document.getElementById('editDistributionModal');
        modal.dataset.editId = id;
        modal.style.display = 'block';
    }

    async saveEditedDistribution() {
        try {
            const modal = document.getElementById('editDistributionModal');
            const id = modal.dataset.editId;
            const index = this.distributions.findIndex(d => d.id === id);

            if (index === -1) return;

            this.distributions[index] = {
                ...this.distributions[index],
                name: document.getElementById('editDistName').value,
                domain: document.getElementById('editDistDomain').value,
                color: document.getElementById('editDistColor').value,
                lastUpdate: new Date().toISOString().split('T')[0]
            };

            await this.saveDistributions();
            this.renderDistributions();
            closeModal('editDistributionModal');
            
            alert('Distributie succesvol bijgewerkt!');
        } catch (error) {
            console.error('Fout bij bewerken distributie:', error);
            alert('Er is een fout opgetreden bij het bewerken van de distributie.');
        }
    }

    async toggleActive(id) {
        try {
            const index = this.distributions.findIndex(d => d.id === id);
            if (index === -1) return;

            this.distributions[index].active = !this.distributions[index].active;
            await this.saveDistributions();
            this.renderDistributions();
        } catch (error) {
            console.error('Fout bij togglen actief status:', error);
            alert('Er is een fout opgetreden bij het wijzigen van de status.');
        }
    }

    viewStatistics(id) {
        // Implementeer statistieken weergave
        alert('Statistieken functionaliteit komt binnenkort beschikbaar.');
    }
}

// Initialiseer distribution manager
const distributionManager = new DistributionManager();

// Helper functies
function showNewDistributionModal() {
    document.getElementById('newDistributionModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}