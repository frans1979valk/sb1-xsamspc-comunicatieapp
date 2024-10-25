import { Observable } from '@nativescript/core';
import { Utils } from '@nativescript/core';
import { VoIPSettings } from './models/voip-settings.model';
import { SMSSettings } from './models/sms-settings.model';
import { QuickMessage } from './models/quick-message.model';
import { ActivationService } from './services/activation.service';
import { AdminService } from './services/admin.service';
const BarcodeScanner = require('nativescript-barcodescanner').BarcodeScanner;

export class MainViewModel extends Observable {
    private _phoneNumber: string = '';
    private _customNumber: string = '';
    private _customMessage: string = '';
    private _voipSettings: VoIPSettings;
    private _smsSettings: SMSSettings;
    private _quickMessages: QuickMessage[] = [];
    private _appVersion: string = '1.0.0';
    private _licenseInfo: string = '';
    private activationService: ActivationService;
    private adminService: AdminService;
    private updateCheckInterval: number;

    constructor() {
        super();
        this.activationService = ActivationService.getInstance();
        this.adminService = AdminService.getInstance();
        this._voipSettings = this.activationService.presetVoipSettings;
        this.loadSettings();
        this.startUpdateCheck();
    }

    get appVersion(): string {
        return this._appVersion;
    }

    get licenseInfo(): string {
        return this._licenseInfo;
    }

    get phoneNumber(): string {
        return this._phoneNumber;
    }

    set phoneNumber(value: string) {
        if (this._phoneNumber !== value) {
            this._phoneNumber = value;
            this.notifyPropertyChange('phoneNumber', value);
        }
    }

    get customNumber(): string {
        return this._customNumber;
    }

    set customNumber(value: string) {
        if (this._customNumber !== value) {
            this._customNumber = value;
            this.notifyPropertyChange('customNumber', value);
        }
    }

    get customMessage(): string {
        return this._customMessage;
    }

    set customMessage(value: string) {
        if (this._customMessage !== value) {
            this._customMessage = value;
            this.notifyPropertyChange('customMessage', value);
        }
    }

    get quickMessages(): QuickMessage[] {
        return this._quickMessages;
    }

    async makeCall() {
        if (this._phoneNumber) {
            try {
                // Implementeer bellogica hier
                console.log('Bellen naar:', this._phoneNumber);
            } catch (error) {
                console.error('Fout tijdens bellen:', error);
            }
        }
    }

    async makeVoIPCall() {
        if (this._phoneNumber && this._voipSettings) {
            try {
                // Implementeer VoIP bellogica hier
                console.log('VoIP bellen naar:', this._phoneNumber);
            } catch (error) {
                console.error('Fout tijdens VoIP bellen:', error);
            }
        }
    }

    async sendQuickMessage(args: any) {
        const message = args.object.bindingContext;
        if (this._phoneNumber && message) {
            try {
                await this.sendSMS(this._phoneNumber, message.message);
            } catch (error) {
                console.error('Fout tijdens versturen quick message:', error);
            }
        }
    }

    async sendCustomMessage() {
        if (this._customNumber && this._customMessage) {
            try {
                await this.sendSMS(this._customNumber, this._customMessage);
            } catch (error) {
                console.error('Fout tijdens versturen custom message:', error);
            }
        }
    }

    private async sendSMS(number: string, message: string) {
        // Implementeer SMS verstuur logica hier
        console.log('SMS versturen naar:', number, 'Bericht:', message);
    }

    private startUpdateCheck() {
        // Check voor updates elke 5 minuten
        this.updateCheckInterval = setInterval(async () => {
            const updates = await this.adminService.checkForUpdates();
            if (updates.hasUpdates) {
                const success = await this.adminService.applyUpdates(updates);
                if (success) {
                    this.loadSettings();
                }
            }
        }, 5 * 60 * 1000);
    }

    private loadSettings() {
        const appSettings = require('@nativescript/core/application-settings');
        const quickMessagesStr = appSettings.getString('quickMessages', '');
        if (quickMessagesStr) {
            this._quickMessages = JSON.parse(quickMessagesStr);
        }
        this._licenseInfo = appSettings.getString('licenseInfo', 'Actief');
    }

    public onDestroy() {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
        }
    }
}