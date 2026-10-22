import { pool } from '../config/database';

/**
 * Migration: Add bypasses_leave_cap to leave_types
 *
 * Lets HR mark certain leave types (sick leave, bereavement, etc.) as
 * exempt from the company-wide daily leave cap, since those aren't
 * something staff plan around in advance.
 *
 * Run: npx ts-node src/migrations/add-bypasses-leave-cap-to-leave-types.ts
 */

async function migrate() {
  console.log('Starting migration: Add bypasses_leave_cap to leave_types...');

  try {
    const [columns]: any = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'leave_types'
        AND COLUMN_NAME = 'bypasses_leave_cap'
    `);

    if (columns.length > 0) {
      console.log('Migration already applied. Skipping...');
      return;
    }

    await pool.execute(`
      ALTER TABLE leave_types
      ADD COLUMN bypasses_leave_cap BOOLEAN NOT NULL DEFAULT FALSE
    `);
    console.log('✓ Added bypasses_leave_cap column');

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
      ALTER TABLE leave_types
      DROP COLUMN bypasses_leave_cap
    `);
    console.log('✓ Dropped bypasses_leave_cap column');

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
