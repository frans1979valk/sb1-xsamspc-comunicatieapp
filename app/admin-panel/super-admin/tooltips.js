// Tooltip management
class TooltipManager {
    constructor() {
        this.tooltipElement = document.getElementById('tooltip');
        this.tooltipsEnabled = true;
        this.tooltips = new Map();
        this.initializeTooltips();
        this.setupEventListeners();
    }

    initializeTooltips() {
        // Standaard tooltips voor knoppen
        this.tooltips.set('fiber-support', 'Belt direct met Fiber Support voor technische hulp');
        this.tooltips.set('internet-storing', 'Meldt een internet storing en krijgt directe assistentie');
        this.tooltips.set('tv-storing', 'Belt met TV Support voor hulp bij TV-gerelateerde problemen');
        this.tooltips.set('algemene-support', 'Voor algemene vragen en ondersteuning');
        this.tooltips.set('nood-knop', 'Verstuurt direct een noodmelding met uw locatie');
    }

    setupEventListeners() {
        document.addEventListener('mouseover', (e) => {
            if (!this.tooltipsEnabled) return;

            const button = e.target.closest('[data-tooltip]');
            if (button) {
                const tooltipText = this.tooltips.get(button.dataset.tooltip);
                if (tooltipText) {
                    this.showTooltip(tooltipText, button);
                }
            }
        });

        document.addEventListener('mouseout', () => {
            this.hideTooltip();
        });
    }

    showTooltip(text, element) {
        const rect = element.getBoundingClientRect();
        this.tooltipElement.textContent = text;
        this.tooltipElement.style.display = 'block';
        
        // Positie berekenen
        const tooltipRect = this.tooltipElement.getBoundingClientRect();
        const top = rect.top - tooltipRect.height - 10;
        const left = rect.left + (rect.width - tooltipRect.width) / 2;

        this.tooltipElement.style.top = `${top}px`;
        this.tooltipElement.style.left = `${left}px`;
    }

    hideTooltip() {
        this.tooltipElement.style.display = 'none';
    }

    enableTooltips() {
        this.tooltipsEnabled = true;
        localStorage.setItem('tooltipsEnabled', 'true');
    }

    disableTooltips() {
        this.tooltipsEnabled = false;
        localStorage.setItem('tooltipsEnabled', 'false');
    }

    toggleTooltips() {
        if (this.tooltipsEnabled) {
            this.disableTooltips();
        } else {
            this.enableTooltips();
        }
        return this.tooltipsEnabled;
    }

    addTooltip(id, text) {
        this.tooltips.set(id, text);
    }

    removeTooltip(id) {
        this.tooltips.delete(id);
    }

    loadTooltipPreference() {
        const enabled = localStorage.getItem('tooltipsEnabled');
        this.tooltipsEnabled = enabled === null ? true : enabled === 'true';
    }
}

// Initialiseer tooltip manager
const tooltipManager = new TooltipManager();

// Laad opgeslagen voorkeuren
tooltipManager.loadTooltipPreference();