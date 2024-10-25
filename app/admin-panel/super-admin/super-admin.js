// Voeg deze email-gerelateerde functies toe aan het bestaande super-admin.js bestand

let emailSettings = new Map();
let currentDistribution = null;

function initializeEmailSettings() {
    loadDistributions();
    setupEmailForm();
}

function loadDistributions() {
    const select = document.getElementById('emailDistributionSelect');
    select.innerHTML = distributions.map(dist => 
        `<option value="${dist.id}">${dist.name}</option>`
    ).join('');
    
    if (select.options.length > 0) {
        currentDistribution = select.options[0].value;
        loadEmailSettings();
    }
}

function loadEmailSettings() {
    const distributionId = document.getElementById('emailDistributionSelect').value;
    currentDistribution = distributionId;
    
    let settings = emailSettings.get(distributionId);
    if (!settings) {
        settings = getDefaultEmailSettings();
        emailSettings.set(distributionId, settings);
    }
    
    // Vul formulier met instellingen
    document.getElementById('smtpServer').value = settings.smtp.server;
    document.getElementById('smtpPort').value = settings.smtp.port;
    document.getElementById('smtpUsername').value = settings.smtp.username;
    document.getElementById('smtpPassword').value = settings.smtp.password;
    document.getElementById('smtpSsl').checked = settings.smtp.ssl;
    
    // Templates
    document.getElementById('activationSubject').value = settings.templates.activation.subject;
    document.getElementById('activationTemplate').value = settings.templates.activation.body;
    document.getElementById('warningSubject').value = settings.templates.warning.subject;
    document.getElementById('warningTemplate').value = settings.templates.warning.body;
    document.getElementById('blockSubject').value = settings.templates.block.subject;
    document.getElementById('blockTemplate').value = settings.templates.block.body;
}

function setupEmailForm() {
    document.getElementById('emailSettingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
                }
            }
        };

        try {
            await saveEmailSettings(currentDistribution, settings);
            alert('Email instellingen opgeslagen!');
        } catch (error) {
            alert('Fout bij opslaan: ' + error.message);
        }
    });
}

function getDefaultEmailSettings() {
    return {
        smtp: {
            server: 'smtp.example.com',
            port: 587,
            username: '',
            password: '',
            ssl: true
        },
        templates: {
            activation: {
                subject: 'Activeer je VIP Installatie App',
                body: 'Beste {userName},\n\nBedankt voor het installeren van de {appName}. ' +
                      'Gebruik de volgende code om je app te activeren:\n\n{activationCode}\n\n' +
                      'Met vriendelijke groet,\nVIP Installatie Team'
            },
            warning: {
                subject: 'Waarschuwing: Limiet Bijna Bereikt',
                body: 'Beste {userName},\n\nDit is een waarschuwing dat je bijna je {reason} ' +
                      'limiet van {limit} hebt bereikt.\n\nMet vriendelijke groet,\nVIP Installatie Team'
            },
            block: {
                subject: 'Account Geblokkeerd',
                body: 'Beste {userName},\n\nJe account is geblokkeerd vanwege {reason}.\n\n' +
                      'Gebruik de volgende code om je app opnieuw te activeren:\n\n{newActivationCode}\n\n' +
                      'Met vriendelijke groet,\nVIP Installatie Team'
            }
        }
    };
}

async function saveEmailSettings(distributionId, settings) {
    emailSettings.set(distributionId, settings);
    localStorage.setItem('email_settings', JSON.stringify(Array.from(emailSettings.entries())));
    
    // Update distributie configuratie
    const distribution = distributions.find(d => d.id === distributionId);
    if (distribution) {
        distribution.emailSettings = settings;
        await updateDistribution(distribution);
    }
}

function testEmailSettings() {
    const modal = document.getElementById('testEmailModal');
    modal.style.display = 'block';
}

document.getElementById('testEmailForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const testEmail = document.getElementById('testEmail').value;
    const templateType = document.getElementById('testTemplateType').value;
    const settings = emailSettings.get(currentDistribution);

    try {
        showLoader('Test email wordt verstuurd...');
        const result = await sendTestEmail(testEmail, templateType, settings);
        hideLoader();
        
        if (result.success) {
            alert('Test email succesvol verstuurd!');
            closeModal('testEmailModal');
        } else {
            alert('Fout bij versturen: ' + result.error);
        }
    } catch (error) {
        hideLoader();
        alert('Er is een fout opgetreden: ' + error.message);
    }
});

async function sendTestEmail(email, templateType, settings) {
    // Simuleer email verzending (vervang dit door echte implementatie)
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1500);
    });
}

// Initialize email settings wanneer de pagina laadt
document.addEventListener('DOMContentLoaded', () => {
    initializeEmailSettings();
});