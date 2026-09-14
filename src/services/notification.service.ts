import { Pool } from 'mysql2/promise';
import { pool } from '../config/database';
import { sendGenericEmail } from './generic-email.service';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

/**
 * Where tapping a notification should take the user in the mobile app.
 * Screen names must match `AppStackParamList`/`MainTabParamList` in
 * mobile/src/navigation/types.ts. Keyed by notification_type, since that's
 * all `sendNotification` has to go on when no explicit deep link was passed
 * at `queueNotification()` call time.
 */
const NOTIFICATION_DEEP_LINKS: Record<string, { screen: string; params?: Record<string, any> }> = {
  leave_request_confirmation: { screen: 'LeaveHistory' },
  leave_request_approved: { screen: 'LeaveHistory' },
  leave_request_rejected: { screen: 'LeaveHistory' },
  leave_request_cancelled: { screen: 'LeaveHistory' },
  leave_request_pending: { screen: 'LeaveRequestManagement' },
  clock_in_reminder: { screen: 'Tabs', params: { screen: 'Home' } },
  special_note: { screen: 'Notifications' },
  system_announcement: { screen: 'Notifications' },
};

/**
 * Push + the in-app feed are the default for everything — email is opt-in,
 * reserved for cases where someone might not have app access at all yet
 * (a brand-new account, a forced password reset before they can log in).
 * Routine operational stuff (leave, attendance, time off, payroll, general
 * announcements) goes push + in-app only.
 */
const EMAIL_REQUIRED_TEMPLATES = new Set(['welcome_email', 'password_change_required']);

/**
 * Templates are authored as HTML for email (real <br> tags, etc). Push
 * notifications and the in-app feed render this as plain text, so anything
 * shown there needs the markup stripped first — otherwise a phone
 * notification literally reads "Dear John,<br><br>Your leave request...".
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Interface definitions
interface NotificationTemplate {
  id: number;
  name: string;
  title_template: string;
  body_template: string;
  subject_template?: string;
  channel: string;
  variables: string[]; // JSON array of variable names
  enabled: boolean;
}

interface UserNotificationPreference {
  user_id: number;
  notification_type: string;
  channels: string[]; // JSON array of preferred channels
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
  recipient_data: any; // JSON object containing recipient details
  payload: any; // JSON object containing template variables and other data
  priority: string;
  scheduled_at: Date;
  processed_at?: Date;
  processing_attempts: number;
  max_attempts: number;
  status: string;
  error_message?: string;
}

interface DeviceRegistration {
  id: number;
  user_id: number;
  device_token: string;
  device_type: string;
  platform: string;
  is_active: boolean;
}

// Notification Service Class
export class NotificationService {
  private db: Pool;

  constructor(databasePool: Pool = pool) {
    this.db = databasePool;
  }

  /**
   * Queue a notification for delivery
   */
  async queueNotification(
    recipientUserId: number,
    templateName: string,
    payload: Record<string, any>,
    options: {
      channel?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      scheduledAt?: Date;
      /** Overrides NOTIFICATION_DEEP_LINKS when a template is reused across
       * different audiences/screens (e.g. leave_request_pending is sent both
       * to approvers and, via floating-day requests, to employees). */
      deepLink?: { screen: string; params?: Record<string, any> };
    } = {}
  ): Promise<number> {
    try {
      // Get the template
      const template = await this.getTemplateByName(templateName);
      if (!template || !template.enabled) {
        throw new Error(`Template '${templateName}' not found or disabled`);
      }

      // Get user preferences
      const userPreferences = await this.getUserPreferences(recipientUserId, template.name);

      // Determine channels to use
      let channelsToUse = [options.channel || template.channel];
      const hasExplicitPreference = Boolean(userPreferences && userPreferences.channels.length > 0);
      if (hasExplicitPreference) {
        channelsToUse = userPreferences!.channels;
      } else if (!EMAIL_REQUIRED_TEMPLATES.has(template.name)) {
        // Push + the in-app feed are the standard for routine operational
        // notifications (leave, attendance, time off, ...) — email isn't
        // needed since the app already surfaces these, and it was flooding
        // a limited daily send quota. A short allowlist still gets email:
        // things that need to reach someone who may not have app access yet.
        channelsToUse = channelsToUse.filter((c) => c !== 'email');
      }

      // Every notification always gets a push alert (which also drives the
      // in-app feed via notification_logs below) — the one exception is a
      // user's explicit preference deliberately excluding it.
      if (!channelsToUse.includes('push') && !hasExplicitPreference) {
        channelsToUse = [...channelsToUse, 'push'];
      }
      if (channelsToUse.length === 0) {
        channelsToUse = ['push'];
      }

      const deepLink = options.deepLink || NOTIFICATION_DEEP_LINKS[template.name];
      const payloadWithDeepLink = deepLink ? { ...payload, _deepLink: deepLink } : payload;

      // Templates are authored as HTML for email (real <br> line breaks etc).
      // Push and the in-app feed render this as plain text, so a stripped
      // version is what they get — otherwise a phone notification or the
      // Notifications screen shows the literal tags.
      const { title, message, subject } = await this.prepareNotificationContent(template, payload);
      const plainTitle = stripHtml(title);
      const plainMessage = stripHtml(message);

      // Process each delivery channel (email, push, ...) — but the in-app
      // feed (notification_logs) gets exactly one row per event below, not
      // one per channel, or a push+email pair would show as two duplicate
      // entries in the Notifications screen.
      for (const channel of channelsToUse) {
        if (userPreferences && !userPreferences.enabled) {
          continue; // Skip if user has disabled this notification type
        }

        const isEmail = channel === 'email';
        const recipientData = await this.getRecipientData(recipientUserId, channel);

        await this.db.execute(
          `INSERT INTO notification_queue
           (recipient_user_id, template_id, notification_type, title, message, subject, channel,
            recipient_data, payload, priority, scheduled_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            recipientUserId,
            template.id,
            template.name,
            isEmail ? title : plainTitle,
            isEmail ? message : plainMessage,
            subject,
            channel,
            JSON.stringify(recipientData),
            JSON.stringify(payloadWithDeepLink),
            options.priority || 'normal',
            options.scheduledAt || new Date()
          ]
        );
      }

      if (channelsToUse.length > 0 && !(userPreferences && !userPreferences.enabled)) {
        const feedChannel = channelsToUse.includes('push') ? 'push' : channelsToUse[0];
        await this.db.execute(
          `INSERT INTO notification_logs
           (recipient_user_id, notification_type, title, message, channel,
            related_entity_type, related_entity_id, delivery_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            recipientUserId,
            template.name,
            plainTitle,
            plainMessage,
            feedChannel,
            payload.relatedEntityType || null,
            payload.relatedEntityId || null,
            'pending'
          ]
        );
      }

      return 1; // Return number of notifications queued
    } catch (error) {
      console.error('Error queuing notification:', error);
      throw error;
    }
  }

  /**
   * Prepare notification content by substituting variables in templates
   */
  async prepareNotificationContent(
    template: NotificationTemplate,
    payload: Record<string, any>
  ): Promise<{ title: string; message: string; subject?: string }> {
    try {
      // Replace variables in title template
      let title = template.title_template;
      for (const [key, value] of Object.entries(payload)) {
        const placeholder = new RegExp(`\\{${key}\\}`, 'g');
        title = title.replace(placeholder, String(value));
      }

      // Replace variables in message template
      let message = template.body_template;
      for (const [key, value] of Object.entries(payload)) {
        const placeholder = new RegExp(`\\{${key}\\}`, 'g');
        message = message.replace(placeholder, String(value));
      }

      // Replace variables in subject template if it exists
      let subject;
      if (template.subject_template) {
        subject = template.subject_template;
        for (const [key, value] of Object.entries(payload)) {
          const placeholder = new RegExp(`\\{${key}\\}`, 'g');
          subject = subject.replace(placeholder, String(value));
        }
      }

      return { title, message, subject };
    } catch (error) {
      console.error('Error preparing notification content:', error);
      throw error;
    }
  }

  /**
   * Get recipient data based on channel
   */
  async getRecipientData(userId: number, channel: string): Promise<any> {
    try {
      switch (channel) {
        case 'email':
          // Get user's email address
          const [userRows]: any = await this.db.execute(
            'SELECT email, full_name FROM users WHERE id = ?',
            [userId]
          );
          
          if (userRows.length === 0) {
            throw new Error(`User with ID ${userId} not found`);
          }
          
          return {
            email: userRows[0].email,
            fullName: userRows[0].full_name
          };

        case 'push':
          // Get user's device registrations
          const [deviceRows]: any = await this.db.execute(
            'SELECT device_token, platform FROM device_registrations WHERE user_id = ? AND is_active = TRUE',
            [userId]
          );
          
          return {
            deviceTokens: deviceRows.map((row: any) => row.device_token),
            platforms: deviceRows.map((row: any) => row.platform)
          };

        case 'in_app':
          // For in-app notifications, we just need the user ID
          return { userId };

        case 'sms':
          // Get user's phone number
          const [phoneRows]: any = await this.db.execute(
            'SELECT phone FROM users WHERE id = ?',
            [userId]
          );
          
          if (phoneRows.length === 0) {
            throw new Error(`User with ID ${userId} not found`);
          }
          
          return {
            phone: phoneRows[0].phone
          };

        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }
    } catch (error) {
      console.error('Error getting recipient data:', error);
      throw error;
    }
  }

  /**
   * Get notification template by name
   */
  async getTemplateByName(name: string): Promise<NotificationTemplate | null> {
    try {
      const [rows]: any = await this.db.execute(
        'SELECT * FROM notification_templates WHERE name = ? AND enabled = TRUE',
        [name]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting template by name:', error);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: number, notificationType: string): Promise<UserNotificationPreference | null> {
    try {
      const [rows]: any = await this.db.execute(
        'SELECT * FROM user_notification_preferences WHERE user_id = ? AND notification_type = ?',
        [userId, notificationType]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  /**
   * Process pending notifications in the queue
   */
  async processNotificationQueue(limit: number = 10): Promise<number> {
    try {
      // A notification more than 2 days old is stale — e.g. "your leave was
      // approved" is useless (or actively confusing) delivered three weeks
      // late. Cancel these outright rather than sending them or letting them
      // clog every future run; this matters a lot the first time this worker
      // starts after a period of not running at all, where the queue can
      // hold a long backlog that would otherwise all fire at once.
      await this.db.execute(
        `UPDATE notification_queue
         SET status = 'failed', error_message = 'Stale — skipped (queued more than 2 days ago)', updated_at = NOW()
         WHERE status = 'pending' AND scheduled_at <= NOW() AND created_at < (NOW() - INTERVAL 2 DAY)`
      );

      // Get pending notifications that are scheduled to be sent now
      const [rows]: any = await this.db.execute(
        `SELECT * FROM notification_queue
         WHERE status = 'pending' AND scheduled_at <= NOW()
         ORDER BY priority DESC, scheduled_at ASC
         LIMIT ?`,
        [limit]
      );

      let processedCount = 0;

      for (const notification of rows) {
        try {
          // Update status to processing
          await this.db.execute(
            'UPDATE notification_queue SET status = ?, processing_attempts = processing_attempts + 1, updated_at = NOW() WHERE id = ?',
            ['processing', notification.id]
          );

          // Attempt to send the notification
          const success = await this.sendNotification(notification);

          if (success) {
            // Update status to sent
            await this.db.execute(
              'UPDATE notification_queue SET status = ?, processed_at = NOW(), updated_at = NOW() WHERE id = ?',
              ['sent', notification.id]
            );

            // Update notification_logs
            await this.db.execute(
              'UPDATE notification_logs SET delivery_status = ?, sent_at = NOW() WHERE recipient_user_id = ? AND notification_type = ? AND sent_at IS NULL',
              ['sent', notification.recipient_user_id, notification.notification_type]
            );
          } else {
            // Update status to failed if max attempts reached
            if (notification.processing_attempts >= notification.max_attempts) {
              await this.db.execute(
                'UPDATE notification_queue SET status = ?, error_message = ?, updated_at = NOW() WHERE id = ?',
                ['failed', 'Max attempts reached', notification.id]
              );

              // Update notification_logs
              await this.db.execute(
                'UPDATE notification_logs SET delivery_status = ?, error_message = ? WHERE recipient_user_id = ? AND notification_type = ? AND sent_at IS NULL',
                ['failed', 'Max attempts reached', notification.recipient_user_id, notification.notification_type]
              );
            } else {
              // Reset to pending for retry
              await this.db.execute(
                'UPDATE notification_queue SET status = ?, updated_at = NOW() WHERE id = ?',
                ['pending', notification.id]
              );
            }
          }

          processedCount++;
        } catch (error: any) {
          console.error(`Error processing notification ${notification.id}:`, error);

          // Update status to failed
          await this.db.execute(
            'UPDATE notification_queue SET status = ?, error_message = ?, updated_at = NOW() WHERE id = ?',
            ['failed', error.message, notification.id]
          );

          // Update notification_logs
          await this.db.execute(
            'UPDATE notification_logs SET delivery_status = ?, error_message = ? WHERE recipient_user_id = ? AND notification_type = ? AND sent_at IS NULL',
            ['failed', error.message, notification.recipient_user_id, notification.notification_type]
          );
        }
      }

      return processedCount;
    } catch (error) {
      console.error('Error processing notification queue:', error);
      throw error;
    }
  }

  /**
   * Send a single notification based on its channel
   */
  async sendNotification(notification: NotificationQueueItem): Promise<boolean> {
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
    } catch (error) {
      console.error(`Error sending notification via ${notification.channel}:`, error);
      return false;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification: NotificationQueueItem): Promise<boolean> {
    try {
      const recipientData = JSON.parse(notification.recipient_data);

      // Send email using the generic email service
      await sendGenericEmail({
        to: recipientData.email,
        subject: notification.subject || notification.title,
        html: `<h2>${notification.title}</h2><p>${notification.message}</p>`
      });

      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  /**
   * Send push notification via Expo's push service. Expo push tokens work
   * across both iOS and Android — no separate FCM/APNs integration needed.
   */
  async sendPushNotification(notification: NotificationQueueItem): Promise<boolean> {
    try {
      const recipientData = JSON.parse(notification.recipient_data);
      const deviceTokens: string[] = recipientData.deviceTokens || [];

      const validTokens = deviceTokens.filter((token) => Expo.isExpoPushToken(token));
      if (validTokens.length === 0) {
        console.warn(`No valid Expo push tokens for notification ${notification.id}`);
        return false;
      }

      let deepLink: { screen: string; params?: Record<string, any> } | undefined;
      try {
        const payload = typeof notification.payload === 'string' ? JSON.parse(notification.payload) : notification.payload;
        deepLink = payload?._deepLink;
      } catch {
        // Malformed payload shouldn't block delivery — just skip the deep link.
      }

      const messages: ExpoPushMessage[] = validTokens.map((token) => ({
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

      // A token Expo reports as no-longer-registered (app uninstalled, etc.)
      // should stop being used — otherwise every future notification retries
      // against it forever.
      await Promise.all(
        tickets.map((ticket, i) => {
          if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
            const deadToken = ticket.details?.expoPushToken || validTokens[i];
            return this.db
              .execute('UPDATE device_registrations SET is_active = FALSE WHERE device_token = ?', [deadToken])
              .catch(() => {});
          }
          return Promise.resolve();
        })
      );

      return tickets.some((ticket) => ticket.status === 'ok');
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Send in-app notification
   */
  async sendInAppNotification(notification: NotificationQueueItem): Promise<boolean> {
    try {
      // For in-app notifications, we might store them in a separate table
      // or use WebSocket to push real-time updates
      const recipientData = JSON.parse(notification.recipient_data);
      
      // Store in-app notification in database
      await this.db.execute(
        `INSERT INTO in_app_notifications 
         (user_id, title, message, notification_type, payload, is_read) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          recipientData.userId,
          notification.title,
          notification.message,
          notification.notification_type,
          JSON.stringify(notification.payload),
          false
        ]
      );

      // TODO: Implement WebSocket broadcasting for real-time delivery
      // This would require setting up WebSocket connections with clients

      return true;
    } catch (error) {
      console.error('Error sending in-app notification:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  async sendSmsNotification(notification: NotificationQueueItem): Promise<boolean> {
    try {
      const recipientData = JSON.parse(notification.recipient_data);
      
      if (!recipientData.phone) {
        console.warn(`No phone number found for user in notification ${notification.id}`);
        return false;
      }

      // For now, we'll simulate sending SMS
      // In a real implementation, we would integrate with Twilio or similar
      console.log(`Sending SMS to: ${recipientData.phone}`);
      console.log(`Message: ${notification.message}`);

      // TODO: Implement actual SMS service (Twilio, AWS SNS, etc.)
      // This is a placeholder implementation

      return true;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return false;
    }
  }

  /**
   * Register a device for push notifications
   */
  async registerDevice(
    userId: number,
    deviceToken: string,
    deviceType: string,
    platform: string,
    appVersion?: string,
    osVersion?: string
  ): Promise<boolean> {
    try {
      await this.db.execute(
        `INSERT INTO device_registrations
         (user_id, device_token, device_type, platform, app_version, os_version)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         device_type = VALUES(device_type),
         platform = VALUES(platform),
         app_version = VALUES(app_version),
         os_version = VALUES(os_version),
         is_active = TRUE,
         last_used_at = NOW()`,
        [userId, deviceToken, deviceType, platform, appVersion, osVersion]
      );

      return true;
    } catch (error) {
      console.error('Error registering device:', error);
      return false;
    }
  }

  /**
   * Unregister a device for push notifications
   */
  async unregisterDevice(deviceToken: string): Promise<boolean> {
    try {
      await this.db.execute(
        'UPDATE device_registrations SET is_active = FALSE WHERE device_token = ?',
        [deviceToken]
      );

      return true;
    } catch (error) {
      console.error('Error unregistering device:', error);
      return false;
    }
  }

  /**
   * Send an ad-hoc "special note" — a one-off announcement from HR/Admin to
   * either specific staff or everyone. Unlike the lifecycle notifications
   * above (leave, floating-day), there's no DB row driving this; the
   * broadcast route passes the recipients directly.
   */
  async broadcastSpecialNote(
    title: string,
    message: string,
    recipientUserIds: number[] | null
  ): Promise<number> {
    let targetIds = recipientUserIds;
    if (!targetIds || targetIds.length === 0) {
      const [rows]: any = await this.db.execute(
        `SELECT id FROM users WHERE status = 'active'`
      );
      targetIds = rows.map((r: any) => r.id);
    }

    let sent = 0;
    for (const userId of targetIds!) {
      try {
        await this.queueNotification(userId, 'special_note', { title, message });
        sent++;
      } catch (error) {
        console.error(`Error queuing special note for user ${userId}:`, error);
      }
    }
    return sent;
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();