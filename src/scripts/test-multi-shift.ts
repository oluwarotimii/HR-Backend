import { shiftSchedulingService } from '../services/shift-scheduling.service';
import { pool } from '../config/database';

async function testMultiShift() {
  console.log('--- Starting Multi-Shift Logic Verification ---');
  
  const testUserId = 9999;
  const monday = '2026-03-30'; // Monday
  const saturday = '2026-03-28'; // Saturday
  
  try {
    // 1. Clean up any existing test data
    await pool.execute('DELETE FROM employee_shift_assignments WHERE user_id = ?', [testUserId]);
    await pool.execute('DELETE FROM shift_timings WHERE user_id = ?', [testUserId]);
    console.log('Cleaned up test user data.');

    // 2. Setup standard Mon-Fri shift in employee_shift_assignments
    // Note: We need a template ID. Let's find one or create a dummy.
    const [templates]: any = await pool.execute('SELECT id FROM shift_templates LIMIT 1');
    if (templates.length === 0) throw new Error('No shift templates found in DB to run test.');
    const templateId = templates[0].id;

    await pool.execute(
      `INSERT INTO employee_shift_assignments (user_id, shift_template_id, effective_from, status) 
       VALUES (?, ?, '2026-01-01', 'active')`,
      [testUserId, templateId]
    );
    console.log('Created standard Mon-Fri assignment.');

    // 3. Setup Weekend Shift in shift_timings (The new Multi-Shift way)
    await pool.execute(
      `INSERT INTO shift_timings (user_id, shift_name, start_time, end_time, effective_from) 
       VALUES (?, 'Weekend Shift [saturday,sunday]', '10:00:00', '16:00:00', '2026-01-01')`,
      [testUserId]
    );
    console.log('Created Weekend Multi-Shift timing.');

    // 4. Test Monday Resolution (Should be the standard shift)
    console.log('\nTesting Monday (2026-03-30)...');
    const mondaySchedule = await shiftSchedulingService.getEffectiveScheduleForDate(testUserId, new Date(monday));
    console.log('Monday Result:', mondaySchedule);
    if (mondaySchedule && mondaySchedule.schedule_type !== 'multi_shift_timing') {
      console.log('✅ Monday: Correctly picked standard assignment.');
    } else {
      console.log('❌ Monday: Failed to prioritize standard/primary assignment or incorrectly picked multi-shift.');
    }

    // 5. Test Saturday Resolution (Should be the Weekend shift)
    console.log('\nTesting Saturday (2026-03-28)...');
    const saturdaySchedule = await shiftSchedulingService.getEffectiveScheduleForDate(testUserId, new Date(saturday));
    console.log('Saturday Result:', saturdaySchedule);
    if (saturdaySchedule && saturdaySchedule.schedule_type === 'multi_shift_timing' && saturdaySchedule.start_time === '10:00:00') {
      console.log('✅ Saturday: Correctly resolved to Multi-Shift Timing!');
    } else {
      console.log('❌ Saturday: Failed to resolve to Multi-Shift Timing.');
    }

    // 6. Test overlapping days prioritization
    // Create another shift timing for Monday that should override if it's "Specific"
    await pool.execute(
      `INSERT INTO shift_timings (user_id, shift_name, start_time, end_time, effective_from) 
       VALUES (?, 'Monday Special [monday]', '07:00:00', '11:00:00', '2026-01-01')`,
      [testUserId]
    );
    console.log('\nCreated Monday Special Multi-Shift.');
    const mondayOverlap = await shiftSchedulingService.getEffectiveScheduleForDate(testUserId, new Date(monday));
    console.log('Monday Overlap Result:', mondayOverlap);
    if (mondayOverlap && mondayOverlap.schedule_type === 'multi_shift_timing' && mondayOverlap.start_time === '07:00:00') {
      console.log('✅ Monday Overlap: Correctly prioritized the more specific Multi-Shift!');
    } else {
      console.log('❌ Monday Overlap: Failed to prioritize Multi-Shift over standard assignment when matched.');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Clean up
    await pool.execute('DELETE FROM employee_shift_assignments WHERE user_id = ?', [testUserId]);
    await pool.execute('DELETE FROM shift_timings WHERE user_id = ?', [testUserId]);
    console.log('\nCleaned up all test data.');
    process.exit(0);
  }
}

testMultiShift();
