interface WelcomeEmailProps {
    to: string;
    fullName: string;
}
export declare const sendWelcomeEmail: ({ to, fullName }: WelcomeEmailProps) => Promise<void>;
interface StaffInvitationEmailProps {
    to: string;
    fullName: string;
    loginEmail: string;
    temporaryPassword: string;
    invitationToken: string;
    fromAdmin: string;
}
export declare const sendStaffInvitationEmail: ({ to, fullName, loginEmail, temporaryPassword, invitationToken, fromAdmin }: StaffInvitationEmailProps) => Promise<void>;
interface PasswordResetEmailProps {
    to: string;
    fullName: string;
    loginEmail: string;
    temporaryPassword: string;
    requestedBy: string;
}
export declare const sendPasswordResetEmail: ({ to, fullName, loginEmail, temporaryPassword, requestedBy }: PasswordResetEmailProps) => Promise<void>;
interface PayrollReadyEmailProps {
    to: string;
    month: string;
    year: number;
}
export declare const sendPayrollReady: ({ to, month, year }: PayrollReadyEmailProps) => Promise<{
    success: boolean;
    error?: string;
}>;
export {};
//# sourceMappingURL=email.service.d.ts.map