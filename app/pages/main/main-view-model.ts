import { Observable, Utils } from '@nativescript/core';
import * as geolocation from '@nativescript/geolocation';
import { Dialogs } from '@nativescript/core';

export class MainViewModel extends Observable {
    private _emergencyEnabled: boolean = false;
    private _emergencyNumber: string = '';
    private _hasDashboardMessages: boolean = false;
    private _currentDashboardMessage: string = '';
    private _recentActivity: Array<{icon: string, message: string}> = [];

    constructor() {
        super();
        this.loadSettings();
        this.initializeDashboardMessages();
    }

    // Getters
    get emergencyEnabled(): boolean {
        return this._emergencyEnabled;
    }

    get hasDashboardMessages(): boolean {
        return this._hasDashboardMessages;
    }

    get currentDashboardMessage(): string {
        return this._currentDashboardMessage;
    }

    get recentActivity(): Array<{icon: string, message: string}> {
        return this._recentActivity;
    }

    // Actie handlers voor knoppen
    onFiberSupport() {
        this.makeCall('0800-1111');
        this.addActivity('📞', 'Contact opgenomen met Fiber Support');
    }

    onInternetStoring() {
        this.makeCall('0800-2222');
        this.addActivity('🌐', 'Internet storing gemeld');
    }

    onTVStoring() {
        this.makeCall('0800-3333');
        this.addActivity('📺', 'TV storing gemeld');
    }

    onGeneralSupport() {
        this.makeCall('0800-4444');
        this.addActivity('ℹ️', 'Contact opgenomen met Algemene Support');
    }

    async onEmergency() {
        try {
            const result = await Dialogs.confirm({
                title: "NOODMELDING",
                message: "Weet je zeker dat je een noodmelding wilt versturen?",
                okButtonText: "JA, VERSTUUR",
                cancelButtonText: "Annuleren"
            });

            if (result) {
                if (this._emergencyEnabled) {
                    await this.sendEmergencyWithLocation();
                    this.addActivity('🚨', 'Noodmelding verstuurd');
                }
            }
        } catch (error) {
            console.error('Fout bij noodmelding:', error);
            Dialogs.alert({
                title: "Fout",
                message: "Er is een fout opgetreden bij de noodmelding.",
                okButtonText: "OK"
            });
        }
    }

    // Private helper methods
    private makeCall(number: string) {
        try {
            Utils.openUrl(`tel:${number}`);
        } catch (error) {
            console.error('Fout bij bellen:', error);
            Dialogs.alert({
                title: "Fout",
                message: "Er is een fout opgetreden bij het bellen.",
                okButtonText: "OK"
            });
        }
    }

    private addActivity(icon: string, message: string) {
        this._recentActivity.unshift({ icon, message });
        if (this._recentActivity.length > 10) {
            this._recentActivity.pop();
        }
        this.notifyPropertyChange('recentActivity', this._recentActivity);
    }

    private async loadSettings() {
        // Laad instellingen van de huidige distributie
        const settings = JSON.parse(localStorage.getItem('emergency_settings') || '{}');
        this._emergencyEnabled = settings.enabled || false;
        this._emergencyNumber = settings.defaultNumber || '112';
        
        this.notifyPropertyChange('emergencyEnabled', this._emergencyEnabled);
    }

    private initializeDashboardMessages() {
        // Controleer op nieuwe berichten van de beheerder
        const messages = JSON.parse(localStorage.getItem('dashboard_messages') || '[]');
        if (messages.length > 0) {
            this._hasDashboardMessages = true;
            this._currentDashboardMessage = messages[0].message;
            
            this.notifyPropertyChange('hasDashboardMessages', this._hasDashboardMessages);
            this.notifyPropertyChange('currentDashboardMessage', this._currentDashboardMessage);
        }
    }

    private async sendEmergencyWithLocation() {
        try {
            const hasPermission = await geolocation.enableLocationRequest();
            if (!hasPermission) {
                throw new Error('Geen toegang tot locatie');
            }

            const location = await geolocation.getCurrentLocation({
                desiredAccuracy: 3,
                maximumAge: 5000,
                timeout: 10000
            });

            const message = `Noodmelding van gebruiker. Locatie: ${location.latitude},${location.longitude}`;
            Utils.openUrl(`sms:${this._emergencyNumber}?body=${encodeURIComponent(message)}`);
            
            // Start automatisch een gesprek na het versturen van de SMS
            setTimeout(() => {
                Utils.openUrl(`tel:${this._emergencyNumber}`);
            }, 1000);

        } catch (error) {
            console.error('Fout bij noodmelding:', error);
            // Fallback naar normale noodoproep
            Utils.openUrl(`tel:${this._emergencyNumber}`);
        }
    }
}