"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const database_1 = require("../config/database");
const generic_email_service_1 = require("./generic-email.service");
const expo_server_sdk_1 = require("expo-server-sdk");
const expo = new expo_server_sdk_1.Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
const NOTIFICATION_DEEP_LINKS = {
    leave_request_confirmation: { screen: 'LeaveHistory' },
    leave_request_approved: { screen: 'LeaveHistory' },
    leave_request_rejected: { screen: 'LeaveHistory' },
    leave_request_cancelled: { screen: 'LeaveHistory' },
    leave_request_pending: { screen: 'LeaveRequestManagement' },
    clock_in_reminder: { screen: 'Tabs', params: { screen: 'Home' } },
    special_note: { screen: 'Notifications' },
    system_announcement: { screen: 'Notifications' },
};
class NotificationService {
    db;
    constructor(databasePool = database_1.pool) {
        this.db = databasePool;
    }
    async queueNotification(recipientUserId, templateName, payload, options = {}) {
        try {
            const template = await this.getTemplateByName(templateName);
            if (!template || !template.enabled) {
                throw new Error(`Template '${templateName}' not found or disabled`);
            }
            const userPreferences = await this.getUserPreferences(recipientUserId, template.name);
            let channelsToUse = [options.channel || template.channel];
            if (userPreferences && userPreferences.channels.length > 0) {
                channelsToUse = userPreferences.channels;
            }
            const hasExplicitPreference = Boolean(userPreferences && userPreferences.channels.length > 0);
            if (!channelsToUse.includes('push') && !hasExplicitPreference) {
                channelsToUse = [...channelsToUse, 'push'];
            }
            const deepLink = options.deepLink || NOTIFICATION_DEEP_LINKS[template.name];
            const payloadWithDeepLink = deepLink ? { ...payload, _deepLink: deepLink } : payload;
            for (const channel of channelsToUse) {
                if (userPreferences && !userPreferences.enabled) {
                    continue;
                }
                const { title, message, subject } = await this.prepareNotificationContent(template, payload);
                const recipientData = await this.getRecipientData(recipientUserId, channel);
                const [result] = await this.db.execute(`INSERT INTO notification_queue 
           (recipient_user_id, template_id, notification_type, title, message, subject, channel, 
            recipient_data, payload, priority, scheduled_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    recipientUserId,
                    template.id,
                    template.name,
                    title,
                    message,
                    subject,
                    channel,
                    JSON.stringify(recipientData),
                    JSON.stringify(payloadWithDeepLink),
                    options.priority || 'normal',
                    options.scheduledAt || new Date()
                ]);
                const notificationId = result.insertId;
                await this.db.execute(`INSERT INTO notification_logs 
           (recipient_user_id, notification_type, title, message, channel, 
            related_entity_type, related_entity_id, delivery_status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                    recipientUserId,
                    template.name,
                    title,
                    message,
                    channel,
                    payload.relatedEntityType || null,
                    payload.relatedEntityId || null,
                    'pending'
                ]);
            }
            return 1;
        }
        catch (error) {
            console.error('Error queuing notification:', error);
            throw error;
        }
    }
    async prepareNotificationContent(template, payload) {
        try {
            let title = template.title_template;
            for (const [key, value] of Object.entries(payload)) {
                const placeholder = new RegExp(`\\{${key}\\}`, 'g');
                title = title.replace(placeholder, String(value));
            }
            let message = template.body_template;
            for (const [key, value] of Object.entries(payload)) {
                const placeholder = new RegExp(`\\{${key}\\}`, 'g');
                message = message.replace(placeholder, String(value));
            }
            let subject;
            if (template.subject_template) {
                subject = template.subject_template;
                for (const [key, value] of Object.entries(payload)) {
                    const placeholder = new RegExp(`\\{${key}\\}`, 'g');
                    subject = subject.replace(placeholder, String(value));
                }
            }
            return { title, message, subject };
        }
        catch (error) {
            console.error('Error preparing notification content:', error);
            throw error;
        }
    }
    async getRecipientData(userId, channel) {
        try {
            switch (channel) {
                case 'email':
                    const [userRows] = await this.db.execute('SELECT email, full_name FROM users WHERE id = ?', [userId]);
                    if (userRows.length === 0) {
                        throw new Error(`User with ID ${userId} not found`);
                    }
                    return {
                        email: userRows[0].email,
                        fullName: userRows[0].full_name
                    };
                case 'push':
                    const [deviceRows] = await this.db.execute('SELECT device_token, platform FROM device_registrations WHERE user_id = ? AND is_active = TRUE', [userId]);
                    return {
                        deviceTokens: deviceRows.map((row) => row.device_token),
                        platforms: deviceRows.map((row) => row.platform)
                    };
                case 'in_app':
                    return { userId };
                case 'sms':
                    const [phoneRows] = await this.db.execute('SELECT phone FROM users WHERE id = ?', [userId]);
                    if (phoneRows.length === 0) {
                        throw new Error(`User with ID ${userId} not found`);
                    }
                    return {
                        phone: phoneRows[0].phone
                    };
                default:
                    throw new Error(`Unsupported channel: ${channel}`);
            }
        }
        catch (error) {
            console.error('Error getting recipient data:', error);
            throw error;
        }
    }
    async getTemplateByName(name) {
        try {
            const [rows] = await this.db.execute('SELECT * FROM notification_templates WHERE name = ? AND enabled = TRUE', [name]);
            return rows.length > 0 ? rows[0] : null;
        }
        catch (error) {
            console.error('Error getting template by name:', error);
            throw error;
        }
    }
    async getUserPreferences(userId, notificationType) {
        try {
            const [rows] = await this.db.execute('SELECT * FROM user_notification_preferences WHERE user_id = ? AND notification_type = ?', [userId, notificationType]);
            return rows.length > 0 ? rows[0] : null;
        }
        catch (error) {
            console.error('Error getting user preferences:', error);
            throw error;
        }
    }
    async processNotificationQueue(limit = 10) {
        try {
            const [rows] = await this.db.execute(`SELECT * FROM notification_queue 
         WHERE status = 'pending' AND scheduled_at <= NOW()
         ORDER BY priority DESC, scheduled_at ASC
         LIMIT ?`, [limit]);
            let processedCount = 0;
            for (const notification of rows) {
                try {
                    await this.db.execute('UPDATE notification_queue SET status = ?, processing_attempts = processing_attempts + 1, updated_at = NOW() WHERE id = ?', ['processing', notification.id]);
                    const success = await this.sendNotification(notification);
                    if (success) {
                        await this.db.execute('UPDATE notification_queue SET status = ?, processed_at = NOW(), updated_at = NOW() WHERE id = ?', ['sent', notification.id]);
                        await this.db.execute('UPDATE notification_logs SET delivery_status = ?, sent_at = NOW() WHERE recipient_user_id = ? AND notification_type = ? AND sent_at IS NULL', ['sent', notification.recipient_user_id, notification.notification_type]);
                    }
                    else {
                        if (notification.processing_attempts >= notification.max_attempts) {
                            await this.db.execute('UPDATE notification_queue SET status = ?, error_message = ?, updated_at = NOW() WHERE id = ?', ['failed', 'Max attempts reached', notification.id]);
                            await this.db.execute('UPDATE notification_logs SET delivery_status = ?, error_message = ? WHERE recipient_user_id = ? AND notification_type = ? AND sent_at IS NULL', ['failed', 'Max attempts reached', notification.recipient_user_id, notification.notification_type]);
                        }
                        else {
                            await this.db.execute('UPDATE notification_queue SET status = ?, updated_at = NOW() WHERE id = ?', ['pending', notification.id]);
                        }
                    }
                    processedCount++;
                }
                catch (error) {
                    console.error(`Error processing notification ${notification.id}:`, error);
                    await this.db.execute('UPDATE notification_queue SET status = ?, error_message = ?, updated_at = NOW() WHERE id = ?', ['failed', error.message, notification.id]);
                    await this.db.execute('UPDATE notification_logs SET delivery_status = ?, error_message = ? WHERE recipient_user_id = ? AND notification_type = ? AND sent_at IS NULL', ['failed', error.message, notification.recipient_user_id, notification.notification_type]);
                }
            }
            return processedCount;
        }
        catch (error) {
            console.error('Error processing notification queue:', error);
            throw error;
        }
    }
    async sendNotification(notification) {
        try {
            switch (notification.channel) {
                case 'email':
                    return await this.sendEmailNotification(notification);
                case 'push':
                    return await this.sendPushNotification(notification);
                case 'in_app':
                    return await this.sendInAppNotification(notification);
                case 'sms':
                    return await this.sendSmsNotification(notification);
                default:
                    console.error(`Unsupported notification channel: ${notification.channel}`);
                    return false;
            }
        }
        catch (error) {
            console.error(`Error sending notification via ${notification.channel}:`, error);
            return false;
        }
    }
    async sendEmailNotification(notification) {
        try {
            const recipientData = JSON.parse(notification.recipient_data);
            await (0, generic_email_service_1.sendGenericEmail)({
                to: recipientData.email,
                subject: notification.subject || notification.title,
                html: `<h2>${notification.title}</h2><p>${notification.message}</p>`
            });
            return true;
        }
        catch (error) {
            console.error('Error sending email notification:', error);
            return false;
        }
    }
    async sendPushNotification(notification) {
        try {
            const recipientData = JSON.parse(notification.recipient_data);
            const deviceTokens = recipientData.deviceTokens || [];
            const validTokens = deviceTokens.filter((token) => expo_server_sdk_1.Expo.isExpoPushToken(token));
            if (validTokens.length === 0) {
                console.warn(`No valid Expo push tokens for notification ${notification.id}`);
                return false;
            }
            let deepLink;
            try {
                const payload = typeof notification.payload === 'string' ? JSON.parse(notification.payload) : notification.payload;
                deepLink = payload?._deepLink;
            }
            catch {
            }
            const messages = validTokens.map((token) => ({
                to: token,
                sound: 'default',
                title: notification.title,
                body: notification.message,
                data: {
                    notificationType: notification.notification_type,
                    ...(deepLink ? { screen: deepLink.screen, params: deepLink.params } : {}),
                },
            }));
            const chunks = expo.chunkPushNotifications(messages);
            const tickets = [];
            for (const chunk of chunks) {
                tickets.push(...(await expo.sendPushNotificationsAsync(chunk)));
            }
            await Promise.all(tickets.map((ticket, i) => {
                if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
                    const deadToken = ticket.details?.expoPushToken || validTokens[i];
                    return this.db
                        .execute('UPDATE device_registrations SET is_active = FALSE WHERE device_token = ?', [deadToken])
                        .catch(() => { });
                }
                return Promise.resolve();
            }));
            return tickets.some((ticket) => ticket.status === 'ok');
        }
        catch (error) {
            console.error('Error sending push notification:', error);
            return false;
        }
    }
    async sendInAppNotification(notification) {
        try {
            const recipientData = JSON.parse(notification.recipient_data);
            await this.db.execute(`INSERT INTO in_app_notifications 
         (user_id, title, message, notification_type, payload, is_read) 
         VALUES (?, ?, ?, ?, ?, ?)`, [
                recipientData.userId,
                notification.title,
                notification.message,
                notification.notification_type,
                JSON.stringify(notification.payload),
                false
            ]);
            return true;
        }
        catch (error) {
            console.error('Error sending in-app notification:', error);
            return false;
        }
    }
    async sendSmsNotification(notification) {
        try {
            const recipientData = JSON.parse(notification.recipient_data);
            if (!recipientData.phone) {
                console.warn(`No phone number found for user in notification ${notification.id}`);
                return false;
            }
            console.log(`Sending SMS to: ${recipientData.phone}`);
            console.log(`Message: ${notification.message}`);
            return true;
        }
        catch (error) {
            console.error('Error sending SMS notification:', error);
            return false;
        }
    }
    async registerDevice(userId, deviceToken, deviceType, platform, appVersion, osVersion) {
        try {
            await this.db.execute(`INSERT INTO device_registrations 
         (user_id, device_token, device_type, platform, app_version, os_version) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         device_type = VALUES(device_type),
         platform = VALUES(platform),
         app_version = VALUES(app_version),
         os_version = VALUES(os_version),
         is_active = TRUE,
         last_used_at = NOW()`, [userId, deviceToken, deviceType, platform, appVersion, osVersion]);
            return true;
        }
        catch (error) {
            console.error('Error registering device:', error);
            return false;
        }
    }
    async unregisterDevice(deviceToken) {
        try {
            await this.db.execute('UPDATE device_registrations SET is_active = FALSE WHERE device_token = ?', [deviceToken]);
            return true;
        }
        catch (error) {
            console.error('Error unregistering device:', error);
            return false;
        }
    }
    async broadcastSpecialNote(title, message, recipientUserIds) {
        let targetIds = recipientUserIds;
        if (!targetIds || targetIds.length === 0) {
            const [rows] = await this.db.execute(`SELECT id FROM users WHERE status = 'active'`);
            targetIds = rows.map((r) => r.id);
        }
        let sent = 0;
        for (const userId of targetIds) {
            try {
                await this.queueNotification(userId, 'special_note', { title, message });
                sent++;
            }
            catch (error) {
                console.error(`Error queuing special note for user ${userId}:`, error);
            }
        }
        return sent;
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map