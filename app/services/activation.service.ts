import { Observable } from '@nativescript/core';
import { ActivationData } from '../models/activation.model';
const appSettings = require('@nativescript/core/application-settings');

export class ActivationService extends Observable {
    private static instance: ActivationService;
    private _activationData: ActivationData = {
        isActivated: false,
        activationCode: '',
    };

    private readonly _presetVoipSettings = {
        serverAddress: 'your.voip.server.com',
        username: 'preset_username',
        password: 'preset_password',
        port: '5060',
        domain: 'your.voip.domain.com',
        outboundProxy: 'proxy.voip.server.com'
    };

    private constructor() {
        super();
        this.loadActivationStatus();
    }

    static getInstance(): ActivationService {
        if (!ActivationService.instance) {
            ActivationService.instance = new ActivationService();
        }
        return ActivationService.instance;
    }

    get activationData(): ActivationData {
        return this._activationData;
    }

    get presetVoipSettings() {
        return this._presetVoipSettings;
    }

    async activateWithQRCode(qrData: string): Promise<boolean> {
        try {
            // Valideer de QR code tegen de API
            const response = await fetch('https://your-api.com/validate-activation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ activationCode: qrData })
            });

            if (!response.ok) throw new Error('Invalid activation code');
            
            const data = await response.json();
            if (data.valid) {
                this._activationData.isActivated = true;
                this._activationData.activationCode = qrData;
                this._activationData.licenseKey = data.licenseKey;
                this.saveActivationStatus();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Activation error:', error);
            return false;
        }
    }

    private saveActivationStatus() {
        appSettings.setString('activationData', JSON.stringify(this._activationData));
    }

    private loadActivationStatus() {
        const savedData = appSettings.getString('activationData');
        if (savedData) {
            this._activationData = JSON.parse(savedData);
        }
    }
}