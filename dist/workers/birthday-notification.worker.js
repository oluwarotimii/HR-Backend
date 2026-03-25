import { pool } from '../config/database';
export class BirthdayNotificationWorker {
    static async processBirthdayNotifications() {
        console.log('Starting birthday notification processing...');
        try {
            try {
                await pool.execute('SELECT 1 FROM staff LIMIT 1');
                await pool.execute('SELECT 1 FROM users LIMIT 1');
                await pool.execute('SELECT 1 FROM branches LIMIT 1');
            }
            catch (tableError) {
                if (tableError.errno === 1146) {
                    console.warn('Required tables not found, skipping birthday notifications until database is initialized');
                    return;
                }
                throw tableError;
            }
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
            const day = String(tomorrow.getDate()).padStart(2, '0');
            const query = `
        SELECT
          s.id as staff_id,
          s.employee_id,
          u.full_name,
          u.email,
          s.designation,
          s.department as department_name,
          b.name as branch_name,
          u.date_of_birth
        FROM staff s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN branches b ON s.branch_id = b.id
        WHERE
          DATE_FORMAT(u.date_of_birth, '%m-%d') = ?
          AND s.status = 'active'
      `;
            const [birthdayEmployees] = await pool.execute(query, [`${month}-${day}`]);
            console.log(`Found ${birthdayEmployees.length} employees with birthdays tomorrow`);
            if (birthdayEmployees.length > 0) {
                const [hrPersonnel] = await pool.execute(`SELECT u.id, u.full_name, u.email
           FROM users u
           JOIN user_roles ur ON u.id = ur.user_id
           JOIN roles r ON ur.role_id = r.id
           WHERE r.name IN ('HR Manager', 'HR Administrator', 'Administrator', 'Super Admin')
             AND u.status = 'active'`);
                console.log(`Found ${hrPersonnel.length} HR personnel to notify`);
                for (const hr of hrPersonnel) {
                    for (const employee of birthdayEmployees) {
                        try {
                            const { NotificationService } = await import('../services/notification.service');
                            const notificationService = new NotificationService();
                            await notificationService.queueNotification(hr.id, 'birthday_reminder', {
                                employee_name: employee.full_name,
                                employee_id: employee.employee_id,
                                designation: employee.designation,
                                department: employee.department_name || 'N/A',
                                branch: employee.branch_name || 'N/A',
                                date_of_birth: employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A',
                                company_name: (process.env.COMPANY_NAME && process.env.COMPANY_NAME !== 'undefined') ? process.env.COMPANY_NAME : 'Our Company',
                                tomorrow_date: tomorrow.toLocaleDateString()
                            }, {
                                channel: 'email',
                                priority: 'normal'
                            });
                            console.log(`Birthday notification queued for HR: ${hr.full_name}, Employee: ${employee.full_name}`);
                        }
                        catch (notificationError) {
                            console.error(`Error queuing birthday notification for ${employee.full_name} to ${hr.full_name}:`, notificationError);
                        }
                    }
                }
                if (hrPersonnel.length > 0) {
                    const birthdayList = birthdayEmployees.map((emp) => ({
                        name: emp.full_name,
                        id: emp.employee_id,
                        designation: emp.designation,
                        department: emp.department_name || 'N/A'
                    }));
                    for (const hr of hrPersonnel) {
                        try {
                            const { NotificationService } = await import('../services/notification.service');
                            const notificationService = new NotificationService();
                            await notificationService.queueNotification(hr.id, 'birthday_summary', {
                                birthday_list: birthdayList,
                                date: tomorrow.toLocaleDateString(),
                                company_name: (process.env.COMPANY_NAME && process.env.COMPANY_NAME !== 'undefined') ? process.env.COMPANY_NAME : 'Our Company'
                            }, {
                                channel: 'email',
                                priority: 'normal'
                            });
                            console.log(`Birthday summary notification queued for HR: ${hr.full_name}`);
                        }
                        catch (summaryError) {
                            console.error(`Error queuing birthday summary notification for ${hr.full_name}:`, summaryError);
                        }
                    }
                }
            }
            else {
                console.log('No birthdays found for tomorrow');
            }
            console.log('Birthday notification processing completed successfully');
        }
        catch (error) {
            console.error('Error in birthday notification worker:', error);
            throw error;
        }
    }
    static startWorker() {
        console.log('Starting birthday notification worker...');
        this.processBirthdayNotifications().catch(error => {
            console.error('Error running birthday notification worker on startup:', error);
        });
        setInterval(() => {
            this.processBirthdayNotifications().catch(error => {
                console.error('Error running birthday notification worker:', error);
            });
        }, 24 * 60 * 60 * 1000);
    }
}
if (typeof require !== 'undefined' && require.main === module) {
    BirthdayNotificationWorker.startWorker();
}
//# sourceMappingURL=birthday-notification.worker.js.map