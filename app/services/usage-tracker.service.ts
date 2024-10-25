import { Observable } from '@nativescript/core';
import { Device } from '@nativescript/core';

export interface UsageStats {
    calls: number;
    sms: number;
    lastCall: string;
    lastSms: string;
    deviceInfo: DeviceInfo;
    warnings: number;
    blocked: boolean;
}

export interface DeviceInfo {
    model: string;
    os: string;
    osVersion: string;
    manufacturer: string;
    language: string;
    uuid: string;
}

export class UsageTrackerService extends Observable {
    private static instance: UsageTrackerService;
    private customerSettings: Map<string, any> = new Map();

    private constructor() {
        super();
        this.loadCustomerSettings();
        this.cleanupOldStats();
    }

    static getInstance(): UsageTrackerService {
        if (!UsageTrackerService.instance) {
            UsageTrackerService.instance = new UsageTrackerService();
        }
        return UsageTrackerService.instance;
    }

    private loadCustomerSettings() {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        customers.forEach(customer => {
            this.customerSettings.set(customer.id, customer.settings.limits);
        });
    }

    async trackCall(userId: string): Promise<boolean> {
        const stats = await this.getUserStats(userId);
        if (stats.blocked) {
            return false;
        }

        const limits = this.customerSettings.get(userId) || this.getDefaultLimits();
        const today = new Date().toISOString().split('T')[0];
        
        if (stats.lastCall?.startsWith(today)) {
            if (stats.calls >= limits.callLimit) {
                await this.addWarning(userId, stats, limits.warningThreshold);
                return false;
            }
            stats.calls++;
        } else {
            stats.calls = 1;
        }
        
        stats.lastCall = new Date().toISOString();
        await this.saveUserStats(userId, stats);
        return true;
    }

    async trackSMS(userId: string): Promise<boolean> {
        const stats = await this.getUserStats(userId);
        if (stats.blocked) {
            return false;
        }

        const limits = this.customerSettings.get(userId) || this.getDefaultLimits();
        const today = new Date().toISOString().split('T')[0];
        
        if (stats.lastSms?.startsWith(today)) {
            if (stats.sms >= limits.smsLimit) {
                await this.addWarning(userId, stats, limits.warningThreshold);
                return false;
            }
            stats.sms++;
        } else {
            stats.sms = 1;
        }
        
        stats.lastSms = new Date().toISOString();
        await this.saveUserStats(userId, stats);
        return true;
    }

    private getDefaultLimits() {
        const systemSettings = JSON.parse(localStorage.getItem('systemSettings') || '{}');
        return {
            callLimit: systemSettings.limits?.defaultCallLimit || 50,
            smsLimit: systemSettings.limits?.defaultSMSLimit || 100,
            warningThreshold: systemSettings.limits?.defaultWarningThreshold || 3
        };
    }

    private async addWarning(userId: string, stats: UsageStats, threshold: number): Promise<void> {
        stats.warnings = (stats.warnings || 0) + 1;
        if (stats.warnings >= threshold) {
            stats.blocked = true;
            await this.regenerateActivationCode(userId);
        }
        await this.saveUserStats(userId, stats);
    }

    private async regenerateActivationCode(userId: string): Promise<void> {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const customer = customers.find(c => c.id === userId);
        if (customer) {
            customer.activationCode = this.generateNewCode();
            customer.status = 'blocked';
            localStorage.setItem('customers', JSON.stringify(customers));
            
            await this.notifyBlockedUser(customer);
        }
    }

    private generateNewCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const group1 = Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        const group2 = Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return `vip-${group1}-${group2}`;
    }

    private async notifyBlockedUser(customer: any): Promise<void> {
        const message = `Uw account is geblokkeerd wegens overmatig gebruik. Een nieuwe activatiecode is aangemaakt.`;
        if (customer.email) {
            console.log(`Email naar ${customer.email}: ${message}`);
        }
        if (customer.phone) {
            console.log(`SMS naar ${customer.phone}: ${message}`);
        }
    }

    async getUserStats(userId: string): Promise<UsageStats> {
        const key = `usage_stats_${userId}`;
        const savedStats = localStorage.getItem(key);
        if (savedStats) {
            return JSON.parse(savedStats);
        }
        
        return {
            calls: 0,
            sms: 0,
            lastCall: '',
            lastSms: '',
            deviceInfo: this.getCurrentDeviceInfo(),
            warnings: 0,
            blocked: false
        };
    }

    private getCurrentDeviceInfo(): DeviceInfo {
        return {
            model: Device.model,
            os: Device.os,
            osVersion: Device.osVersion,
            manufacturer: Device.manufacturer,
            language: Device.language,
            uuid: Device.uuid
        };
    }

    private async saveUserStats(userId: string, stats: UsageStats): Promise<void> {
        const key = `usage_stats_${userId}`;
        localStorage.setItem(key, JSON.stringify(stats));
    }

    private cleanupOldStats(): void {
        const today = new Date().toISOString().split('T')[0];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('usage_stats_')) {
                const stats = JSON.parse(localStorage.getItem(key) || '{}');
                if (stats.lastCall && !stats.lastCall.startsWith(today)) {
                    stats.calls = 0;
                }
                if (stats.lastSms && !stats.lastSms.startsWith(today)) {
                    stats.sms = 0;
                }
                localStorage.setItem(key, JSON.stringify(stats));
            }
        }
    }

    updateCustomerSettings(userId: string, settings: any) {
        this.customerSettings.set(userId, settings.limits);
    }
}