declare class CpanelEmailService {
    private baseUrl;
    private username;
    private token;
    private domain;
    private quota;
    constructor();
    private makeRequest;
    createEmailAccount(emailPrefix: string, password: string): Promise<{
        success: boolean;
        email?: string;
        error?: string;
    }>;
    deleteEmailAccount(emailPrefix: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    listEmailAccounts(): Promise<{
        success: boolean;
        emails?: string[];
        error?: string;
    }>;
    changeEmailPassword(emailPrefix: string, newPassword: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export default CpanelEmailService;
//# sourceMappingURL=cpanel-email.service.d.ts.map