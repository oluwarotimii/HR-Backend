import { sendWelcomeEmail, sendStaffInvitationEmail, sendPayrollReady } from './email.service';
interface GenericEmailProps {
    to: string;
    subject: string;
    html: string;
}
export declare const sendGenericEmail: ({ to, subject, html }: GenericEmailProps) => Promise<void>;
export { sendWelcomeEmail, sendStaffInvitationEmail, sendPayrollReady };
//# sourceMappingURL=generic-email.service.d.ts.map