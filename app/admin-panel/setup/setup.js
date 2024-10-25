// Setup manager voor eerste configuratie
class SetupManager {
    constructor() {
        this.currentStep = 1;
        this.verificationCode = '';
        this.adminData = null;
        this.initializeListeners();
    }

    initializeListeners() {
        // Super Admin Form
        document.getElementById('superAdminForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (await this.validateSuperAdminForm()) {
                await this.sendVerificationCode();
            }
        });

        // Verificatie Form
        document.getElementById('verificationForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (await this.validateVerificationCode()) {
                this.showStep(3);
            }
        });

        // Security Form
        document.getElementById('securityForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.completeSuperAdminSetup();
        });
    }

    async validateSuperAdminForm() {
        const password = document.getElementById('adminPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Wachtwoorden komen niet overeen');
            return false;
        }

        if (password.length < 12) {
            alert('Wachtwoord moet minimaal 12 karakters lang zijn');
            return false;
        }

        this.adminData = {
            name: document.getElementById('adminName').value,
            email: document.getElementById('adminEmail').value,
            phone: document.getElementById('adminPhone').value,
            password: password,
            verificationMethod: document.getElementById('verificationMethod').value
        };

        return true;
    }

    async sendVerificationCode() {
        try {
            this.verificationCode = this.generateVerificationCode();
            const method = this.adminData.verificationMethod;
            const target = method === 'email' ? this.adminData.email : this.adminData.phone;

            // In productie: verstuur via echte email/SMS service
            console.log(`Verificatiecode ${this.verificationCode} verstuurd naar ${target}`);
            
            document.getElementById('verificationTarget').textContent = 
                method === 'email' ? 'email' : 'mobiel nummer';
            
            this.showStep(2);
        } catch (error) {
            alert('Fout bij versturen verificatiecode: ' + error.message);
        }
    }

    async validateVerificationCode() {
        const inputCode = document.getElementById('verificationCode').value;
        if (inputCode === this.verificationCode) {
            return true;
        } else {
            alert('Ongeldige verificatiecode');
            return false;
        }
    }

    async completeSuperAdminSetup() {
        try {
            const securitySettings = {
                require2FA: document.getElementById('require2FA').checked,
                passwordResetDays: parseInt(document.getElementById('passwordResetDays').value),
                sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
                ipWhitelist: document.getElementById('ipWhitelist').value
                    .split('\n')
                    .filter(ip => ip.trim().length > 0)
            };

            // Sla super admin gegevens op
            const superAdmin = {
                ...this.adminData,
                role: 'super_admin',
                securitySettings,
                created: new Date().toISOString(),
                status: 'active'
            };

            // In productie: sla op in beveiligde database
            localStorage.setItem('super_admin', JSON.stringify(superAdmin));
            localStorage.setItem('setup_completed', 'true');

            this.showStep('success');
            setTimeout(() => {
                window.location.href = '../super-admin/index.html';
            }, 3000);
        } catch (error) {
            alert('Fout bij afronden setup: ' + error.message);
        }
    }

    showStep(step) {
        document.querySelectorAll('.setup-step').forEach(el => {
            el.classList.remove('active');
        });
        document.getElementById(step === 'success' ? 'success' : `step${step}`).classList.add('active');
        this.currentStep = step;
    }

    generateVerificationCode() {
        return Math.random().toString().substr(2, 6);
    }
}

// Controleer of setup al is voltooid
if (localStorage.getItem('setup_completed') === 'true') {
    window.location.href = '../super-admin/index.html';
} else {
    // Start setup proces
    const setupManager = new SetupManager();
}

// Helper functie voor opnieuw versturen code
function resendCode() {
    setupManager.sendVerificationCode();
}