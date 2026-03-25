import { Resend } from 'resend';
import { sendWelcomeEmail, sendStaffInvitationEmail, sendPayrollReady } from './email.service';
const resend = new Resend(process.env.RESEND_API_KEY);
export const sendGenericEmail = async ({ to, subject, html }) => {
    try {
        const { error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'noreply@tripa.com.ng',
            to: to,
            subject: subject,
            html: html
        });
        if (error) {
            console.error('Error sending email:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
        console.log(`Email sent successfully to ${to}`);
    }
    catch (error) {
        console.error('Unexpected error sending email:', error);
        throw error;
    }
};
export { sendWelcomeEmail, sendStaffInvitationEmail, sendPayrollReady };
//# sourceMappingURL=generic-email.service.js.map