import { Pool } from 'mysql2/promise';
interface NotificationTemplate {
    id: number;
    name: string;
    title_template: string;
    body_template: string;
    subject_template?: string;
    channel: string;
    variables: string[];
    enabled: boolean;
}
interface UserNotificationPreference {
    user_id: number;
    notification_type: string;
    channels: string[];
    enabled: boolean;
}
interface NotificationQueueItem {
    id: number;
    recipient_user_id: number;
    template_id: number;
    notification_type: string;
    title: string;
    message: string;
    subject?: string;
    channel: string;
    recipient_data: any;
    payload: any;
    priority: string;
    scheduled_at: Date;
    processed_at?: Date;
    processing_attempts: number;
    max_attempts: number;
    status: string;
    error_message?: string;
}
export declare class NotificationService {
    private db;
    constructor(databasePool?: Pool);
    queueNotification(recipientUserId: number, templateName: string, payload: Record<string, any>, options?: {
        channel?: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        scheduledAt?: Date;
    }): Promise<number>;
    prepareNotificationContent(template: NotificationTemplate, payload: Record<string, any>): Promise<{
        title: string;
        message: string;
        subject?: string;
    }>;
    getRecipientData(userId: number, channel: string): Promise<any>;
    getTemplateByName(name: string): Promise<NotificationTemplate | null>;
    getUserPreferences(userId: number, notificationType: string): Promise<UserNotificationPreference | null>;
    processNotificationQueue(limit?: number): Promise<number>;
    sendNotification(notification: NotificationQueueItem): Promise<boolean>;
    sendEmailNotification(notification: NotificationQueueItem): Promise<boolean>;
    sendPushNotification(notification: NotificationQueueItem): Promise<boolean>;
    sendInAppNotification(notification: NotificationQueueItem): Promise<boolean>;
    sendSmsNotification(notification: NotificationQueueItem): Promise<boolean>;
    registerDevice(userId: number, deviceToken: string, deviceType: string, platform: string, appVersion?: string, osVersion?: string): Promise<boolean>;
    unregisterDevice(deviceToken: string): Promise<boolean>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notification.service.d.ts.map