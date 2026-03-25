// Run migrations for auto-checkout functionality
// Usage: node run-migrations.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const migrations = [
  {
    file: '097_create_attendance_auto_checkout_log.sql',
    name: 'Create attendance auto-checkout log table'
  },
  {
    file: '098_fix_attendance_location_column.sql',
    name: 'Fix attendance location column'
  },
  {
    file: '099_add_branch_auto_checkout_columns.sql',
    name: 'Add branch auto-checkout columns'
  }
];

async function runMigration(file, name) {
  const fs = require('fs');
  const path = require('path');
  
  console.log(`\n📝 Running migration: ${name}`);
  console.log(`📄 File: ${file}`);
  
  const sqlPath = path.join(__dirname, 'migrations', file);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hr_management_system'
  });
  
  try {
    // Split SQL into individual statements and execute each
    const statements = sql.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log(`✅ Migration completed successfully: ${name}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${name}`);
    console.error(`Error: ${error.message}`);
    throw error;
  } finally {
    await connection.end();
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting auto-checkout migrations...\n');
  
  for (const migration of migrations) {
    try {
      await runMigration(migration.file, migration.name);
    } catch (error) {
      console.error('\n💥 Migration process stopped due to error');
      process.exit(1);
    }
  }
  
  console.log('\n🎉 All migrations completed successfully!');
  console.log('\n✅ Next steps:');
  console.log('   1. Restart backend server');
  console.log('   2. Auto-checkout worker will now work correctly');
  console.log('   3. Test check-in/check-out functionality');
}

runAllMigrations();
