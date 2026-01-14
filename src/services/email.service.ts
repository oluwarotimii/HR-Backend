import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

class EmailService {
  static async sendEmail(options: EmailOptions): Promise<any> {
    try {
      const { to, subject, html, text, from } = options;
      
      const emailFrom = from || process.env.EMAIL_FROM || 'onboarding@resend.dev';
      
      const result = await resend.emails.send({
        from: emailFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text
      });

      if (result.error) {
        return {
          success: false,
          id: null,
          error: result.error.message || 'Unknown error'
        };
      }

      return {
        success: true,
        id: result.data?.id || null,
        error: null
      };
    } catch (error: any) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        id: null,
        error: error.message
      };
    }
  }

  // Predefined email templates
  static async sendLeaveExpiryWarning(to: string, leaveTypeName: string, remainingDays: number, expiryDate: string): Promise<any> {
    const subject = `⏰ ${leaveTypeName} Balance Expiring Soon`;
    const html = `
      <h2>Leave Balance Expiring</h2>
      <p>Your <strong>${leaveTypeName}</strong> balance has <strong>${remainingDays} days</strong> remaining.</p>
      <p>This balance will expire on <strong>${expiryDate}</strong>.</p>
      <p>Please plan accordingly to utilize your remaining leave days.</p>
    `;

    return this.sendEmail({ to, subject, html });
  }

  static async sendLeaveApproved(to: string, leaveTypeName: string, startDate: string, endDate: string): Promise<any> {
    const subject = `✅ Leave Approved: ${leaveTypeName}`;
    const html = `
      <h2>Leave Request Approved</h2>
      <p>Your leave request for <strong>${leaveTypeName}</strong> has been approved.</p>
      <p><strong>Leave Dates:</strong> ${startDate} to ${endDate}</p>
      <p>You will be marked as on leave during this period.</p>
    `;

    return this.sendEmail({ to, subject, html });
  }

  static async sendLeaveRejected(to: string, leaveTypeName: string, startDate: string, endDate: string, reason?: string): Promise<any> {
    const subject = `❌ Leave Rejected: ${leaveTypeName}`;
    const html = `
      <h2>Leave Request Rejected</h2>
      <p>Your leave request for <strong>${leaveTypeName}</strong> has been rejected.</p>
      <p><strong>Requested Dates:</strong> ${startDate} to ${endDate}</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you believe this is an error, please contact your HR representative.</p>
    `;

    return this.sendEmail({ to, subject, html });
  }

  static async sendPayrollReady(to: string, month: string, year: number): Promise<any> {
    const subject = `💰 Payroll Ready for ${month} ${year}`;
    const html = `
      <h2>Payroll Processed for ${month} ${year}</h2>
      <p>Your payslip for <strong>${month} ${year}</strong> is now available.</p>
      <p>Please log in to the HR portal to view and download your payslip.</p>
    `;

    return this.sendEmail({ to, subject, html });
  }
}

export default EmailService;