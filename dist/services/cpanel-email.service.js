import axios from 'axios';
import * as https from 'https';
import dotenv from 'dotenv';
dotenv.config();
class CpanelEmailService {
    baseUrl;
    username;
    token;
    domain;
    quota;
    constructor() {
        this.baseUrl = `https://${process.env.CPANEL_HOST}:2083/execute/`;
        this.username = process.env.CPANEL_USERNAME || '';
        this.token = process.env.CPANEL_API_TOKEN || '';
        this.domain = process.env.CPANEL_DOMAIN || 'example.com';
        this.quota = parseInt(process.env.CPANEL_EMAIL_QUOTA || '500');
        if (!this.username || !this.token) {
            throw new Error('cPanel credentials are not properly configured in environment variables');
        }
    }
    async makeRequest(endpoint, params = {}) {
        try {
            const response = await axios.get(`${this.baseUrl}${endpoint}`, {
                params,
                headers: {
                    'Authorization': `cpanel ${this.username}:${this.token}`
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false
                })
            });
            return response.data;
        }
        catch (error) {
            console.error('cPanel API Error:', error.response?.data || error.message);
            return {
                status: 0,
                errors: [error.response?.data?.errors?.[0] || error.message || 'Unknown error']
            };
        }
    }
    async createEmailAccount(emailPrefix, password) {
        try {
            const params = {
                email: emailPrefix,
                domain: this.domain,
                password: password,
                quota: this.quota
            };
            const response = await this.makeRequest('Email/add_pop', params);
            if (response.status === 1) {
                return {
                    success: true,
                    email: `${emailPrefix}@${this.domain}`
                };
            }
            else {
                return {
                    success: false,
                    error: response.errors?.[0] || 'Failed to create email account'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Error creating email account'
            };
        }
    }
    async deleteEmailAccount(emailPrefix) {
        try {
            const params = {
                email: emailPrefix,
                domain: this.domain
            };
            const response = await this.makeRequest('Email/delete_pop', params);
            if (response.status === 1) {
                return { success: true };
            }
            else {
                return {
                    success: false,
                    error: response.errors?.[0] || 'Failed to delete email account'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Error deleting email account'
            };
        }
    }
    async listEmailAccounts() {
        try {
            const params = {
                domain: this.domain
            };
            const response = await this.makeRequest('Email/list_pops', params);
            if (response.status === 1 && response.data) {
                const emails = response.data.pops.map((pop) => pop.email);
                return {
                    success: true,
                    emails: emails
                };
            }
            else {
                return {
                    success: false,
                    error: response.errors?.[0] || 'Failed to list email accounts'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Error listing email accounts'
            };
        }
    }
    async changeEmailPassword(emailPrefix, newPassword) {
        try {
            const params = {
                email: emailPrefix,
                domain: this.domain,
                password: newPassword
            };
            const response = await this.makeRequest('Email/passwd_pop', params);
            if (response.status === 1) {
                return { success: true };
            }
            else {
                return {
                    success: false,
                    error: response.errors?.[0] || 'Failed to change password'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Error changing password'
            };
        }
    }
}
export default CpanelEmailService;
//# sourceMappingURL=cpanel-email.service.js.map