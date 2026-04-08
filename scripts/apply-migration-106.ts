import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function applyMigration106() {
  console.log('🚀 Applying migration 106: Add branch_id to shift_templates...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hr_management_system',
    ssl: process.env.NODE_ENV === 'production' && process.env.DB_HOST?.includes('tidbcloud') 
      ? { rejectUnauthorized: true } 
      : false
  });

  try {
    // Step 1: Add branch_id column
    await connection.execute(`
      ALTER TABLE shift_templates
      ADD COLUMN branch_id INT NULL AFTER created_by
    `).catch(() => console.log('⏭️  branch_id column already exists'));

    // Step 2: Add foreign key
    await connection.execute(`
      ALTER TABLE shift_templates
      ADD CONSTRAINT fk_shift_template_branch
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
    `).catch(() => console.log('⏭️  Foreign key already exists'));

    // Step 3: Add indexes
    await connection.execute(`
      ALTER TABLE shift_templates
      ADD INDEX idx_branch (branch_id)
    `).catch(() => console.log('⏭️  Index idx_branch already exists'));

    await connection.execute(`
      ALTER TABLE shift_templates
      ADD INDEX idx_branch_active (branch_id, is_active)
    `).catch(() => console.log('⏭️  Index idx_branch_active already exists'));

    // Step 4: Update existing templates with creator's branch
    await connection.execute(`
      UPDATE shift_templates st
      INNER JOIN users u ON st.created_by = u.id
      INNER JOIN staff s ON u.id = s.user_id
      SET st.branch_id = s.branch_id
      WHERE st.branch_id IS NULL
        AND s.branch_id IS NOT NULL
    `);

    console.log('\n✅ Migration 106 applied successfully!');
    console.log('   - branch_id column added to shift_templates');
    console.log('   - Foreign key constraint added');
    console.log('   - Indexes added for performance');
    console.log('   - Existing templates updated with creator\'s branch');
  } catch (error: any) {
    console.error('\n💥 Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

applyMigration106();
