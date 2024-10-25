class ActivationManager {
    constructor() {
        this.initializeListeners();
    }

    initializeListeners() {
        document.getElementById('activationSettingsForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveActivationSettings();
        });
    }

    async saveActivationSettings() {
        const currentDistributionId = document.getElementById('distributionSelect').value;
        
        const settings = {
            codeValidityDays: parseInt(document.getElementById('codeValidityDays').value),
            allowCodeRenewal: document.getElementById('allowCodeRenewal').checked,
            maxRenewalsPerMonth: parseInt(document.getElementById('maxRenewalsPerMonth').value),
            renewalMethods: Array.from(document.getElementsByName('renewalMethods'))
                .filter(cb => cb.checked)
                .map(cb => cb.value),
            keepCustomerData: document.getElementById('keepCustomerData').checked,
            notifyAdmin: document.getElementById('notifyAdmin').checked
        };

        try {
            await this.updateDistributionActivationSettings(currentDistributionId, settings);
            this.showSuccess('Activatie instellingen opgeslagen!');
        } catch (error) {
            this.showError('Fout bij opslaan: ' + error.message);
        }
    }

    async generateNewCode(customerId) {
        const distribution = await this.getCurrentDistribution();
        const customer = await this.getCustomer(customerId);
        
        if (!this.canRequestNewCode(customer, distribution)) {
            throw new Error('Maximum aantal vernieuwingen bereikt voor deze maand');
        }

        const newCode = this.generateActivationCode();
        await this.updateCustomerCode(customerId, newCode, distribution.activationSettings);
        
        if (distribution.activationSettings.notifyAdmin) {
            await this.notifyAdmin(customer, newCode);
        }

        return newCode;
    }

    private canRequestNewCode(customer, distribution) {
        if (!distribution.activationSettings.allowCodeRenewal) {
            return false;
        }

        const renewalsThisMonth = customer.codeRenewals?.filter(renewal => {
            const renewalDate = new Date(renewal.date);
            const now = new Date();
            return renewalDate.getMonth() === now.getMonth() &&
                   renewalDate.getFullYear() === now.getFullYear();
        }).length || 0;

        return renewalsThisMonth < distribution.activationSettings.maxRenewalsPerMonth;
    }

    private async updateCustomerCode(customerId, newCode, settings) {
        const customer = await this.getCustomer(customerId);
        
        const codeRenewal = {
            date: new Date().toISOString(),
            oldCode: customer.activationCode,
            newCode: newCode
        };

        customer.activationCode = newCode;
        customer.codeRenewals = customer.codeRenewals || [];
        customer.codeRenewals.push(codeRenewal);
        
        if (settings.keepCustomerData) {
            // Behoud bestaande klantgegevens
            customer.codeValidUntil = this.calculateValidityDate(settings.codeValidityDays);
        }

        await this.saveCustomer(customer);
    }

    private calculateValidityDate(validityDays) {
        const date = new Date();
        date.setDate(date.getDate() + validityDays);
        return date.toISOString();
    }

    private generateActivationCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const group1 = Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        const group2 = Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return `vip-${group1}-${group2}`;
    }

    // Helper functies
    showSuccess(message) {
        alert(message);
    }

    showError(message) {
        alert(message);
    }
}

const activationManager = new ActivationManager();
module.exports = activationManager;