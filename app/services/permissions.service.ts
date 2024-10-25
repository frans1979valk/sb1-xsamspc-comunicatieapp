import { Application, AndroidApplication, Utils } from '@nativescript/core';
import { request, requestPermissions } from '@nativescript/core/permissions';

export class PermissionsService {
    private static instance: PermissionsService;

    private constructor() {
        this.initializePermissions();
    }

    static getInstance(): PermissionsService {
        if (!PermissionsService.instance) {
            PermissionsService.instance = new PermissionsService();
        }
        return PermissionsService.instance;
    }

    private async initializePermissions() {
        if (Application.android) {
            try {
                const permissions = [
                    android.Manifest.permission.RECORD_AUDIO,
                    android.Manifest.permission.MODIFY_AUDIO_SETTINGS,
                    android.Manifest.permission.BLUETOOTH,
                    android.Manifest.permission.BLUETOOTH_ADMIN,
                    android.Manifest.permission.BLUETOOTH_CONNECT,
                    android.Manifest.permission.BLUETOOTH_SCAN
                ];

                await requestPermissions(permissions);
                
                // Audio instellingen optimaliseren
                const audioManager = Utils.android.getApplicationContext().getSystemService(
                    android.content.Context.AUDIO_SERVICE
                );
                audioManager.setMode(android.media.AudioManager.MODE_IN_COMMUNICATION);
                audioManager.setSpeakerphoneOn(true);
                
                // Bluetooth activeren indien beschikbaar
                const bluetoothAdapter = android.bluetooth.BluetoothAdapter.getDefaultAdapter();
                if (bluetoothAdapter && !bluetoothAdapter.isEnabled()) {
                    bluetoothAdapter.enable();
                }
            } catch (error) {
                console.error('Fout bij het instellen van permissies:', error);
            }
        }
    }

    async checkAndRequestPermissions(): Promise<boolean> {
        try {
            if (Application.android) {
                const audioPermission = await request('android.permission.RECORD_AUDIO');
                const bluetoothPermission = await request('android.permission.BLUETOOTH_CONNECT');
                
                return audioPermission === 'authorized' && bluetoothPermission === 'authorized';
            }
            return true;
        } catch (error) {
            console.error('Fout bij het controleren van permissies:', error);
            return false;
        }
    }
}