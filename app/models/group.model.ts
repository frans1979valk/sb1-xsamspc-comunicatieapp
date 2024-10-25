export interface Group {
    id: string;
    name: string;
    description: string;
    settings: {
        limits: {
            callLimit: number;
            smsLimit: number;
            warningThreshold: number;
        };
        voip: {
            server: string;
            port: string;
        };
        buttons: Array<{
            label: string;
            number: string;
            type: 'call' | 'sms';
        }>;
        templates: Array<{
            id: string;
            text: string;
        }>;
    };
}