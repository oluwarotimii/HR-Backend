/**
 * Seed Script: Multi-Shift System Setup
 * 
 * This script creates sample shift templates and assignments
 * to demonstrate the multi-shift functionality.
 * 
 * Usage: npm run ts-node src/scripts/seed-multi-shift.ts
 */

import { pool } from '../config/database';

interface Branch {
  id: number;
  name: string;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  branch_id: number;
}

async function seedMultiShift() {
  console.log('=== Multi-Shift System Seed Script ===\n');

  try {
    // Step 1: Get all branches
    console.log('📋 Fetching branches...');
    const [branches]: any = await pool.execute('SELECT id, name FROM branches');
    console.log(`   Found ${branches.length} branches`);

    if (branches.length === 0) {
      console.log('❌ No branches found. Please create branches first.');
      return;
    }

    // Step 2: Get all users with branch assignments
    console.log('\n👥 Fetching users...');
    const [users]: any = await pool.execute(`
      SELECT u.id, u.full_name, u.email, s.branch_id
      FROM users u
      INNER JOIN staff s ON u.id = s.user_id
      WHERE u.is_active = TRUE
      ORDER BY s.branch_id, u.full_name
    `);
    console.log(`   Found ${users.length} active users`);

    // Step 3: Create shift templates for each branch
    console.log('\n📝 Creating shift templates...');
    
    const templates: any = {};
    
    for (const branch of branches) {
      console.log(`\n   Branch: ${branch.name} (ID: ${branch.id})`);
      
      // Template 1: Weekday Shift (Mon-Fri)
      const [weekdayResult]: any = await pool.execute(`
        INSERT INTO shift_templates (
          branch_id, name, description, start_time, end_time,
          break_duration_minutes, effective_from, recurrence_pattern,
          recurrence_days, is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = name
      `, [
        branch.id,
        'Weekday Shift',
        'Monday to Friday, 8:00 AM - 6:30 PM',
        '08:00:00',
        '18:30:00',
        60,
        '2026-01-01',
        'weekly',
        JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
        true,
        1 // admin user
      ]);
      
      templates[`weekday_${branch.id}`] = {
        id: weekdayResult.insertId || branch.id * 1000 + 1,
        name: 'Weekday Shift',
        branch_id: branch.id
      };
      console.log(`      ✅ Weekday Shift (Mon-Fri, 8 AM - 6:30 PM)`);

      // Template 2: Weekend Shift (Sat-Sun)
      const [weekendResult]: any = await pool.execute(`
        INSERT INTO shift_templates (
          branch_id, name, description, start_time, end_time,
          break_duration_minutes, effective_from, recurrence_pattern,
          recurrence_days, is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = name
      `, [
        branch.id,
        'Weekend Shift',
        'Saturday and Sunday, 9:00 AM - 5:00 PM',
        '09:00:00',
        '17:00:00',
        30,
        '2026-01-01',
        'weekly',
        JSON.stringify(['saturday', 'sunday']),
        true,
        1
      ]);
      
      templates[`weekend_${branch.id}`] = {
        id: weekendResult.insertId || branch.id * 1000 + 2,
        name: 'Weekend Shift',
        branch_id: branch.id
      };
      console.log(`      ✅ Weekend Shift (Sat-Sun, 9 AM - 5 PM)`);

      // Template 3: Sunday Only Shift
      const [sundayResult]: any = await pool.execute(`
        INSERT INTO shift_templates (
          branch_id, name, description, start_time, end_time,
          break_duration_minutes, effective_from, recurrence_pattern,
          recurrence_days, is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = name
      `, [
        branch.id,
        'Sunday Shift',
        'Sunday only, 9:00 AM - 6:00 PM',
        '09:00:00',
        '18:00:00',
        30,
        '2026-01-01',
        'weekly',
        JSON.stringify(['sunday']),
        true,
        1
      ]);
      
      templates[`sunday_${branch.id}`] = {
        id: sundayResult.insertId || branch.id * 1000 + 3,
        name: 'Sunday Shift',
        branch_id: branch.id
      };
      console.log(`      ✅ Sunday Shift (Sun only, 9 AM - 6 PM)`);
    }

    // Step 4: Assign shifts to users
    console.log('\n👔 Assigning shifts to employees...');
    
    const branchUsers = users.reduce((acc: any, user: User) => {
      if (!acc[user.branch_id]) acc[user.branch_id] = [];
      acc[user.branch_id].push(user);
      return acc;
    }, {});

    let totalAssignments = 0;

    for (const [branchId, branchUsersList] of Object.entries(branchUsers)) {
      const branchNum = parseInt(branchId);
      console.log(`\n   Branch: ${branches.find((b: Branch) => b.id === branchNum)?.name}`);
      
      // Assign weekday shift to ALL employees
      console.log(`      Assigning Weekday Shift to all ${branchUsersList.length} employees...`);
      
      for (const user of branchUsersList) {
        try {
          await pool.execute(`
            INSERT INTO employee_shift_assignments (
              user_id, shift_template_id, effective_from, status,
              recurrence_pattern, recurrence_days, assigned_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            user.id,
            templates[`weekday_${branchId}`].id,
            '2026-01-01',
            'active',
            'weekly',
            JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
            1
          ]);
          totalAssignments++;
        } catch (error: any) {
          // Skip if already exists
          if (!error.code || error.code !== 'ER_DUP_ENTRY') {
            console.error(`         ❌ Error for ${user.email}: ${error.message}`);
          }
        }
      }
      console.log(`         ✅ Done`);

      // Assign Sunday shift to FIRST 5 employees (simulating HQ staff with weekend shifts)
      const sundayShiftUsers = branchUsersList.slice(0, Math.min(5, branchUsersList.length));
      console.log(`      Assigning Sunday Shift to ${sundayShiftUsers.length} employees...`);
      
      for (const user of sundayShiftUsers) {
        try {
          await pool.execute(`
            INSERT INTO employee_shift_assignments (
              user_id, shift_template_id, effective_from, status,
              recurrence_pattern, recurrence_days, assigned_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            user.id,
            templates[`sunday_${branchId}`].id,
            '2026-01-01',
            'active',
            'weekly',
            JSON.stringify(['sunday']),
            1
          ]);
          totalAssignments++;
        } catch (error: any) {
          if (!error.code || error.code !== 'ER_DUP_ENTRY') {
            console.error(`         ❌ Error for ${user.email}: ${error.message}`);
          }
        }
      }
      console.log(`         ✅ Done`);
    }

    // Step 5: Summary
    console.log('\n✅ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Branches: ${branches.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Templates created: ${Object.keys(templates).length}`);
    console.log(`   Assignments created: ${totalAssignments}`);
    
    console.log('\n📋 Templates:');
    for (const [key, template] of Object.entries(templates)) {
      console.log(`   - ${template.name} (Branch ID: ${template.branch_id})`);
    }

    console.log('\n🎯 What was created:');
    console.log('   ✅ Weekday Shift (Mon-Fri) for ALL employees');
    console.log('   ✅ Sunday Shift for first 5 employees per branch');
    console.log('   ✅ Multiple active assignments per employee (no conflicts!)');
    
    console.log('\n🔍 Verify with:');
    console.log(`   SELECT u.email, u.full_name, st.name, esa.recurrence_days
           FROM employee_shift_assignments esa
           JOIN users u ON esa.user_id = u.id
           JOIN shift_templates st ON esa.shift_template_id = st.id
           WHERE esa.status = 'active'
           ORDER BY u.email, st.name;`);

  } catch (error: any) {
    console.error('\n❌ Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedMultiShift();
