import { pool } from '../config/database';

/**
 * Migration: Add daily_leave_cap to global_attendance_settings
 *
 * Company-wide cap on how many staff can be on approved/pending leave on
 * any single calendar day. NULL/0 means no cap (disabled).
 *
 * Run: npx ts-node src/migrations/add-daily-leave-cap-setting.ts
 */

async function migrate() {
  console.log('Starting migration: Add daily_leave_cap to global_attendance_settings...');

  try {
    const [columns]: any = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'global_attendance_settings'
        AND COLUMN_NAME = 'daily_leave_cap'
    `);

    if (columns.length > 0) {
      console.log('Migration already applied. Skipping...');
      return;
    }

    await pool.execute(`
      ALTER TABLE global_attendance_settings
      ADD COLUMN daily_leave_cap INT NULL
    `);
    console.log('✓ Added daily_leave_cap column');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function rollback() {
  console.log('Rolling back migration...');

  try {
    await pool.execute(`
      ALTER TABLE global_attendance_settings
      DROP COLUMN daily_leave_cap
    `);
    console.log('✓ Dropped daily_leave_cap column');

    console.log('✅ Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === 'rollback') {
    rollback()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    migrate()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

export { migrate, rollback };
