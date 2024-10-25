// Email configuratie management
class EmailSettingsManager {
    constructor() {
        this.currentDistribution = null;
        this.emailSettings = new Map();
        this.initializeListeners();
    }

    initializeListeners() {
        document.getElementById('emailSettingsForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCurrentSettings();
        });

        document.getElementById('emailDistributionSelect')?.addEventListener('change', () => {
            this.loadDistributionSettings();
        });

        document.getElementById('testEmailForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendTestEmail();
        });
    }

    async loadDistributionSettings() {
        const distributionId = document.getElementById('emailDistributionSelect').value;
        const distribution = await this.getDistribution(distributionId);
        
        if (distribution && distribution.emailSettings) {
            this.currentDistribution = distributionId;
            this.populateFormFields(distribution.emailSettings);
        }
    }

    populateFormFields(settings) {
        // SMTP instellingen
        document.getElementById('smtpServer').value = settings.smtp.server;
        document.getElementById('smtpPort').value = settings.smtp.port;
        document.getElementById('smtpUsername').value = settings.smtp.username;
        document.getElementById('smtpPassword').value = settings.smtp.password;
        document.getElementById('smtpSsl').checked = settings.smtp.ssl;

        // Templates
        Object.keys(settings.templates).forEach(type => {
            const template = settings.templates[type];
            document.getElementById(`${type}Subject`).value = template.subject;
            document.getElementById(`${type}Template`).value = template.body;
        });
    }

    async saveCurrentSettings() {
        if (!this.currentDistribution) return;

        const settings = {
            smtp: {
                server: document.getElementById('smtpServer').value,
                port: parseInt(document.getElementById('smtpPort').value),
                username: document.getElementById('smtpUsername').value,
                password: document.getElementById('smtpPassword').value,
                ssl: document.getElementById('smtpSsl').checked
            },
            templates: {
                activation: {
                    subject: document.getElementById('activationSubject').value,
                    body: document.getElementById('activationTemplate').value
                },
                warning: {
                    subject: document.getElementById('warningSubject').value,
                    body: document.getElementById('warningTemplate').value
                },
                block: {
                    subject: document.getElementById('blockSubject').value,
                    body: document.getElementById('blockTemplate').value
                },
                notification: {
                    subject: document.getElementById('notificationSubject').value,
                    body: document.getElementById('notificationTemplate').value
                }
            }
        };

        try {
            await this.updateDistributionEmailSettings(this.currentDistribution, settings);
            this.showSuccess('Email instellingen opgeslagen!');
        } catch (error) {
            this.showError('Fout bij opslaan: ' + error.message);
        }
    }

    async sendTestEmail() {
        const email = document.getElementById('testEmail').value;
        const templateType = document.getElementById('testTemplateType').value;
        
        try {
            this.showLoader('Test email wordt verstuurd...');
            const result = await this.sendEmail(email, templateType);
            this.hideLoader();
            
            if (result.success) {
                this.showSuccess('Test email succesvol verstuurd!');
                this.closeModal('testEmailModal');
            } else {
                this.showError('Fout bij versturen: ' + result.error);
            }
        } catch (error) {
            this.hideLoader();
            this.showError('Er is een fout opgetreden: ' + error.message);
        }
    }

    // Helper functies
    showLoader(message) {
        // Implementeer loader weergave
    }

    hideLoader() {
        // Verberg loader
    }

    showSuccess(message) {
        alert(message);
    }

    showError(message) {
        alert(message);
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // API calls
    async getDistribution(id) {
        // Implementeer API call om distributie op te halen
        return distributions.find(d => d.id === id);
    }

    async updateDistributionEmailSettings(id, settings) {
        // Implementeer API call om email instellingen op te slaan
        const distribution = distributions.find(d => d.id === id);
        if (distribution) {
            distribution.emailSettings = settings;
            await saveDistributions();
        }
    }

    async sendEmail(email, templateType) {
        // Implementeer echte email verzending hier
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, 1500);
        });
    }
}

// Initialiseer email settings manager
const emailManager = new EmailSettingsManager();

// Export voor gebruik in andere modules
module.exports = emailManager;