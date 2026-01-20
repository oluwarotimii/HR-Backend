import { pool } from '../src/config/database';

async function updateFormsTable() {
  console.log('Updating forms table to add general form type...');

  try {
    // First, let's check the current enum values
    const [result] = await pool.execute(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'hr_management_system' 
      AND TABLE_NAME = 'forms' 
      AND COLUMN_NAME = 'form_type'
    `) as any;
    
    console.log('Current form_type enum values:', result[0].COLUMN_TYPE);

    // Update the column to add 'general' to the enum
    await pool.execute(`
      ALTER TABLE forms 
      MODIFY COLUMN form_type ENUM('leave_request', 'appraisal', 'application', 'feedback', 'custom', 'general') NOT NULL
    `);
    
    console.log('✅ Forms table updated successfully!');
    
    // Verify the update
    const [updatedResult] = await pool.execute(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'hr_management_system' 
      AND TABLE_NAME = 'forms' 
      AND COLUMN_NAME = 'form_type'
    `) as any;
    
    console.log('Updated form_type enum values:', updatedResult[0].COLUMN_TYPE);
  } catch (error) {
    console.error('Error updating forms table:', error);
  }
}

updateFormsTable();