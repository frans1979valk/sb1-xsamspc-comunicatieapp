import { Application } from '@nativescript/core';
import { PermissionsService } from './services/permissions.service';
import { NetworkService } from './services/network.service';

// Initialize services
PermissionsService.getInstance();
NetworkService.getInstance();

Application.run({ moduleName: 'pages/main/main-page' });