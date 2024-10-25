import { Observable } from '@nativescript/core';
import { VoIPSettings } from '../models/voip-settings.model';
import { SMSSettings } from '../models/sms-settings.model';
import { QuickMessage } from '../models/quick-message.model';

export class AdminService extends Observable {
    private static instance: AdminService;
    private readonly API_BASE_URL = 'https://your-admin-api.com/api';
    private _adminToken: string = '';

    private constructor() {
        super();
        this.loadAdminToken();
    }

    static getInstance(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }

    async checkForUpdates(): Promise<{
        hasUpdates: boolean;
        voipSettings?: VoIPSettings;
        smsSettings?: SMSSettings;
        quickMessages?: QuickMessage[];
    }> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/check-updates`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this._adminToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error checking for updates:', error);
            return { hasUpdates: false };
        }
    }

    async applyUpdates(updates: any): Promise<boolean> {
        try {
            const appSettings = require('@nativescript/core/application-settings');
            if (updates.voipSettings) {
                appSettings.setString('voipSettings', JSON.stringify(updates.voipSettings));
            }
            if (updates.smsSettings) {
                appSettings.setString('smsSettings', JSON.stringify(updates.smsSettings));
            }
            if (updates.quickMessages) {
                appSettings.setString('quickMessages', JSON.stringify(updates.quickMessages));
            }
            return true;
        } catch (error) {
            console.error('Error applying updates:', error);
            return false;
        }
    }

    private loadAdminToken() {
        const appSettings = require('@nativescript/core/application-settings');
        this._adminToken = appSettings.getString('adminToken', '');
    }
}