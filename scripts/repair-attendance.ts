import { pool } from '../src/config/database';

async function repairAttendance() {
  console.log('Starting Attendance Repair Script...');

  try {
    // 1. Identify and remove "Absent" records that conflict with "Present/Late/Half-day" records
    console.log('Step 1: Removing "Absent" records that conflict with active attendance...');
    const [conflictResults]: any = await pool.execute(`
      DELETE a1 FROM attendance a1
      INNER JOIN attendance a2 ON a1.user_id = a2.user_id AND a1.date = a2.date
      WHERE a1.status = 'absent' 
      AND a2.status IN ('present', 'late', 'half_day', 'holiday-working')
      AND a1.id != a2.id
    `);
    console.log(`Removed ${conflictResults.affectedRows} conflicting absent records.`);

    // 2. Identify and remove duplicate "Absent" records (keeping the earliest one)
    console.log('Step 2: Deduplicating multiple "Absent" records...');
    const [dedupeResults]: any = await pool.execute(`
      DELETE a1 FROM attendance a1
      INNER JOIN attendance a2 ON a1.user_id = a2.user_id AND a1.date = a2.date
      WHERE a1.status = 'absent' AND a2.status = 'absent'
      AND a1.created_at > a2.created_at
      AND a1.id != a2.id
    `);
    console.log(`Removed ${dedupeResults.affectedRows} duplicate absent records.`);

    // 3. Remove duplicate "Present" records (keeping the earliest check-in)
    console.log('Step 3: Deduplicating multiple "Present" records...');
    const [presentDedupeResults]: any = await pool.execute(`
      DELETE a1 FROM attendance a1
      INNER JOIN attendance a2 ON a1.user_id = a2.user_id AND a1.date = a2.date
      WHERE a1.status IN ('present', 'late', 'half_day') 
      AND a2.status IN ('present', 'late', 'half_day')
      AND (
        a1.check_in_time > a2.check_in_time 
        OR (a1.check_in_time IS NULL AND a2.check_in_time IS NOT NULL)
        OR (a1.check_in_time = a2.check_in_time AND a1.id > a2.id)
      )
      AND a1.id != a2.id
    `);
    console.log(`Removed ${presentDedupeResults.affectedRows} duplicate present records.`);

    console.log('Attendance repair completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error repairing attendance:', error);
    process.exit(1);
  }
}

repairAttendance();
