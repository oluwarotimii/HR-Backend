import { pool } from './config/database';

async function testFormCreationDetailed() {
  console.log('Testing form creation in detail...');

  try {
    // Test creating a form without fields first
    console.log('1. Testing form creation without fields...');
    
    // Check if the form creation works by directly inserting
    const [result] = await pool.execute(
      `INSERT INTO forms (name, description, form_type, branch_id, created_by, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Test Form', 'A test form for verification', 'general', 1, 1, 1]
    );
    
    console.log('Form created with ID:', result.insertId);
    
    // Now try to create a form field to see if that works
    console.log('2. Testing form field creation...');
    try {
      const [fieldResult] = await pool.execute(
        `INSERT INTO form_fields (form_id, field_name, field_label, field_type, is_required, field_order) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [result.insertId, 'test_field', 'Test Field', 'text', 0, 1]
      );
      
      console.log('Form field created with ID:', fieldResult.insertId);
    } catch (fieldError) {
      console.error('Error creating form field:', fieldError);
    }
    
    // Clean up test data
    await pool.execute('DELETE FROM form_fields WHERE form_id = ?', [result.insertId]);
    await pool.execute('DELETE FROM forms WHERE id = ?', [result.insertId]);
    
    console.log('3. ✅ Database operations test completed successfully');
  } catch (error) {
    console.error('❌ Database test error:', error);
  }
}

testFormCreationDetailed();