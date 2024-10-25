import { Observable } from '@nativescript/core';
import { Group } from '../models/group.model';

export class GroupService extends Observable {
    private static instance: GroupService;
    private readonly STORAGE_KEY = 'user_groups';

    private constructor() {
        super();
        this.initializeDefaultGroups();
    }

    static getInstance(): GroupService {
        if (!GroupService.instance) {
            GroupService.instance = new GroupService();
        }
        return GroupService.instance;
    }

    private initializeDefaultGroups() {
        const existingGroups = this.getAllGroups();
        if (existingGroups.length === 0) {
            const defaultGroups: Group[] = [
                {
                    id: 'vip1',
                    name: 'VIP Niveau 1',
                    description: 'Basis VIP diensten',
                    settings: {
                        limits: {
                            callLimit: 25,
                            smsLimit: 50,
                            warningThreshold: 3
                        },
                        voip: {
                            server: 'voip.vip1.example.com',
                            port: '5060'
                        },
                        buttons: [
                            {
                                label: 'Fiber Support',
                                number: '0800-1111',
                                type: 'call'
                            },
                            {
                                label: 'Internet Storing',
                                number: '0800-2222',
                                type: 'call'
                            }
                        ],
                        templates: [
                            {
                                id: '1',
                                text: 'Uw storing is in behandeling genomen. We nemen binnen 24 uur contact met u op.'
                            }
                        ]
                    }
                },
                {
                    id: 'vip2',
                    name: 'VIP Niveau 2',
                    description: 'Uitgebreide VIP diensten',
                    settings: {
                        limits: {
                            callLimit: 50,
                            smsLimit: 100,
                            warningThreshold: 5
                        },
                        voip: {
                            server: 'voip.vip2.example.com',
                            port: '5060'
                        },
                        buttons: [
                            {
                                label: 'Premium Support',
                                number: '0800-3333',
                                type: 'call'
                            },
                            {
                                label: 'Spoed Support',
                                number: '0800-4444',
                                type: 'call'
                            },
                            {
                                label: 'Internet Storing',
                                number: '0800-5555',
                                type: 'call'
                            }
                        ],
                        templates: [
                            {
                                id: '1',
                                text: 'Uw storing is in behandeling genomen. We nemen binnen 12 uur contact met u op.'
                            },
                            {
                                id: '2',
                                text: 'Bedankt voor uw melding. Een monteur is onderweg.'
                            }
                        ]
                    }
                },
                {
                    id: 'vip3',
                    name: 'VIP Niveau 3',
                    description: 'Premium VIP diensten met prioriteit',
                    settings: {
                        limits: {
                            callLimit: 100,
                            smsLimit: 200,
                            warningThreshold: 10
                        },
                        voip: {
                            server: 'voip.vip3.example.com',
                            port: '5060'
                        },
                        buttons: [
                            {
                                label: 'Directe Support',
                                number: '0800-6666',
                                type: 'call'
                            },
                            {
                                label: 'Spoed Monteur',
                                number: '0800-7777',
                                type: 'call'
                            },
                            {
                                label: 'Internet Storing',
                                number: '0800-8888',
                                type: 'call'
                            },
                            {
                                label: 'TV Storing',
                                number: '0800-9999',
                                type: 'call'
                            }
                        ],
                        templates: [
                            {
                                id: '1',
                                text: 'Uw storing is in behandeling genomen. We nemen binnen 4 uur contact met u op.'
                            },
                            {
                                id: '2',
                                text: 'Een monteur is met prioriteit onderweg naar uw locatie.'
                            },
                            {
                                id: '3',
                                text: 'Uw melding wordt met spoed behandeld.'
                            }
                        ]
                    }
                }
            ];

            this.saveGroups(defaultGroups);
        }
    }

    getAllGroups(): Group[] {
        const groupsJson = localStorage.getItem(this.STORAGE_KEY);
        return groupsJson ? JSON.parse(groupsJson) : [];
    }

    getGroupById(groupId: string): Group | null {
        const groups = this.getAllGroups();
        return groups.find(group => group.id === groupId) || null;
    }

    createGroup(group: Omit<Group, 'id'>): Group {
        const newGroup: Group = {
            ...group,
            id: this.generateGroupId()
        };

        const groups = this.getAllGroups();
        groups.push(newGroup);
        this.saveGroups(groups);

        return newGroup;
    }

    updateGroup(groupId: string, updates: Partial<Group>): boolean {
        const groups = this.getAllGroups();
        const index = groups.findIndex(group => group.id === groupId);
        
        if (index !== -1) {
            groups[index] = { ...groups[index], ...updates };
            this.saveGroups(groups);
            return true;
        }
        return false;
    }

    deleteGroup(groupId: string): boolean {
        const groups = this.getAllGroups();
        const filteredGroups = groups.filter(group => group.id !== groupId);
        
        if (filteredGroups.length !== groups.length) {
            this.saveGroups(filteredGroups);
            return true;
        }
        return false;
    }

    private saveGroups(groups: Group[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(groups));
    }

    private generateGroupId(): string {
        return 'group_' + Math.random().toString(36).substr(2, 9);
    }
}