import { Observable, Connectivity } from '@nativescript/core';

export class NetworkService extends Observable {
    private static instance: NetworkService;
    private _isConnected: boolean = false;
    private _connectionType: string = '';

    private constructor() {
        super();
        this.initializeNetworkMonitoring();
    }

    static getInstance(): NetworkService {
        if (!NetworkService.instance) {
            NetworkService.instance = new NetworkService();
        }
        return NetworkService.instance;
    }

    private initializeNetworkMonitoring() {
        // Monitor netwerk veranderingen
        Connectivity.startMonitoring((newConnectionType) => {
            this._isConnected = newConnectionType !== Connectivity.connectionType.none;
            this._connectionType = this.getConnectionTypeName(newConnectionType);
            
            this.notifyPropertyChange('isConnected', this._isConnected);
            this.notifyPropertyChange('connectionType', this._connectionType);
            
            if (this._isConnected) {
                console.log(`Verbonden via ${this._connectionType}`);
            } else {
                console.log('Geen netwerkverbinding');
                this.showNoConnectionAlert();
            }
        });
    }

    private getConnectionTypeName(connectionType: number): string {
        switch (connectionType) {
            case Connectivity.connectionType.wifi:
                return 'WiFi';
            case Connectivity.connectionType.mobile:
                return 'Mobiel netwerk';
            case Connectivity.connectionType.ethernet:
                return 'Ethernet';
            case Connectivity.connectionType.bluetooth:
                return 'Bluetooth';
            case Connectivity.connectionType.vpn:
                return 'VPN';
            default:
                return 'Onbekend';
        }
    }

    private showNoConnectionAlert() {
        // Toon een melding aan de gebruiker
        alert({
            title: "Geen verbinding",
            message: "Controleer je internet verbinding en probeer het opnieuw.",
            okButtonText: "OK"
        });
    }

    get isConnected(): boolean {
        return this._isConnected;
    }

    get connectionType(): string {
        return this._connectionType;
    }

    // Check huidige verbinding
    checkConnection(): boolean {
        const connectionType = Connectivity.getConnectionType();
        this._isConnected = connectionType !== Connectivity.connectionType.none;
        this._connectionType = this.getConnectionTypeName(connectionType);
        return this._isConnected;
    }

    // Forceer WiFi gebruik indien beschikbaar
    async preferWiFiConnection(): Promise<boolean> {
        if (Connectivity.getConnectionType() === Connectivity.connectionType.wifi) {
            return true;
        }

        try {
            // Probeer WiFi in te schakelen
            if (global.android) {
                const wifiManager = android.content.Context.getSystemService(
                    android.content.Context.WIFI_SERVICE
                );
                return wifiManager.setWifiEnabled(true);
            }
            return false;
        } catch (error) {
            console.error('Fout bij het activeren van WiFi:', error);
            return false;
        }
    }
}