/**
 * HR App Database Seeder
 * 
 * Populates the database with realistic test data including:
 * - Branches (5 branches across Kenya)
 * - Users & Staff (50+ employees)
 * - Departments
 * - Shift Timings
 * - Holidays (Kenyan public holidays)
 * - Attendance Records (6+ months of daily data)
 * - Leave History
 * 
 * Usage: npm run seed
 */

import { pool } from '../src/config/database.js';
import bcrypt from 'bcryptjs';

// Configuration
const CONFIG = {
  startDate: '2024-07-01', // 6+ months ago
  endDate: '2025-02-16',   // Today
  numBranches: 5,
  numEmployees: 50,
  numDepartments: 6,
};

// Kenyan Cities/Regions for branches
const BRANCH_DATA = [
  { name: 'Nairobi HQ', code: 'NAI', city: 'Nairobi', coords: { lng: 36.817223, lat: -1.286389 } },
  { name: 'Mombasa Branch', code: 'MBA', city: 'Mombasa', coords: { lng: 39.6682, lat: -4.0435 } },
  { name: 'Kisumu Branch', code: 'KIS', city: 'Kisumu', coords: { lng: 34.7519, lat: -0.0917 } },
  { name: 'Nakuru Branch', code: 'NAK', city: 'Nakuru', coords: { lng: 36.0667, lat: -0.3031 } },
  { name: 'Eldoret Branch', code: 'ELD', city: 'Eldoret', coords: { lng: 35.2698, lat: 0.5143 } },
];

// Kenyan Public Holidays (2024-2025)
const KENYAN_HOLIDAYS = [
  { date: '2024-07-01', name: 'Madaraka Day' },
  { date: '2024-08-12', name: 'Huduma Day' },
  { date: '2024-10-10', name: 'Mashujaa Day' },
  { date: '2024-10-21', name: 'Diwali' },
  { date: '2024-12-12', name: 'Jamhuri Day' },
  { date: '2024-12-25', name: 'Christmas Day' },
  { date: '2024-12-26', name: 'Boxing Day' },
  { date: '2025-01-01', name: 'New Year\'s Day' },
  { date: '2025-03-03', name: 'Ramadan' },
  { date: '2025-04-18', name: 'Good Friday' },
  { date: '2025-04-21', name: 'Easter Monday' },
  { date: '2025-05-01', name: 'Labour Day' },
  { date: '2025-06-01', name: 'Madaraka Day' },
  { date: '2025-06-08', name: 'Eid al-Adha' },
  { date: '2025-08-11', name: 'Huduma Day' },
  { date: '2025-10-10', name: 'Mashujaa Day' },
  { date: '2025-12-12', name: 'Jamhuri Day' },
  { date: '2025-12-25', name: 'Christmas Day' },
  { date: '2025-12-26', name: 'Boxing Day' },
];

// Department names
const DEPARTMENTS = [
  'Human Resources',
  'Finance & Accounting',
  'Information Technology',
  'Operations',
  'Sales & Marketing',
  'Customer Service',
];

// First and last names for generating employees
const FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica',
  'Peter', 'Paul', 'Andrew', 'Thomas', 'Charles', 'Daniel', 'Matthew', 'Anthony',
  'Margaret', 'Dorothy', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen', 'Sandra',
  'Mark', 'Donald', 'Steven', 'George', 'Kenneth', 'Brian', 'Edward', 'Ronald',
  'Ashley', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Cynthia',
  'Kevin', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric',
  'Katherine', 'Christine', 'Debra', 'Carol', 'Rachel', 'Catherine', 'Amy', 'Angela',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Ochieng', 'Kamau', 'Kimani', 'Wanjiku', 'Mutua', 'Achieng', 'Njeri', 'Kipchoge',
];

// Helper functions
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEmployeeId(index) {
  return `EMP${String(index).padStart(4, '0')}`;
}

function generateEmail(firstName, lastName, index) {
  const domains = ['company.co.ke', 'company.com', 'gmail.com'];
  const domain = index < 45 ? 'company.co.ke' : randomElement(domains);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${domain}`;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function clearExistingData() {
  console.log('🗑️  Clearing existing data...');
  
  await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
  
  const tablesToClear = [
    'attendance',
    'leave_history',
    'leave_types',
    'shift_timings',
    'staff',
    'users',
    'departments',
    'holidays',
    'branches',
    'roles',
  ];
  
  for (const table of tablesToClear) {
    try {
      await pool.execute(`DELETE FROM ${table}`);
      console.log(`   ✓ Cleared ${table}`);
    } catch (error) {
      console.log(`   - Skipped ${table} (may not exist)`);
    }
  }
  
  for (const table of tablesToClear) {
    try {
      await pool.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
    } catch (error) {
      // Ignore errors
    }
  }
  
  await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
  console.log('✅ Data cleared\n');
}

async function seedRoles() {
  console.log('🔐 Seeding roles...');
  
  const roles = [
    { name: 'Admin', description: 'System Administrator' },
    { name: 'Manager', description: 'Department/Branch Manager' },
    { name: 'HR', description: 'Human Resources' },
    { name: 'Employee', description: 'Regular Employee' },
  ];
  
  for (const role of roles) {
    await pool.execute(
      `INSERT INTO roles (name, description) VALUES (?, ?)`,
      [role.name, role.description]
    );
    console.log(`   ✓ Created ${role.name}`);
  }
  
  console.log('✅ Roles seeded\n');
}

async function seedBranches() {
  console.log('🏢 Seeding branches...');

  for (const branch of BRANCH_DATA) {
    await pool.execute(
      `INSERT INTO branches (name, code, city, country, phone, email, location_coordinates, location_radius_meters, attendance_mode, status)
       VALUES (?, ?, ?, 'Kenya', ?, ?, ?, ?, 'branch_based', 'active')`,
      [
        branch.name,
        branch.code,
        branch.city,
        `+254-${Math.floor(Math.random() * 900) + 100}`,
        `${branch.code.toLowerCase()}@company.co.ke`,
        `${branch.coords.lat},${branch.coords.lng}`,
        100 + Math.floor(Math.random() * 100),
      ]
    );
    console.log(`   ✓ Created ${branch.name}`);
  }

  console.log('✅ Branches seeded\n');
}

async function seedUsersAndStaff() {
  console.log('👥 Seeding users and staff...');
  
  const passwordHash = await hashPassword('Password123!');
  
  await pool.execute(
    `INSERT INTO users (email, password_hash, full_name, role_id, status)
     VALUES (?, ?, ?, 1, 'active')`,
    ['admin@company.co.ke', passwordHash, 'System Administrator']
  );
  
  await pool.execute(
    `INSERT INTO staff (user_id, employee_id, designation, department, branch_id, joining_date, employment_type, status)
     VALUES (?, ?, ?, ?, ?, ?, 'full_time', 'active')`,
    [1, 'EMP0001', 'System Administrator', 'IT', 1, '2023-01-01']
  );
  
  console.log('   ✓ Created admin user');
  
  for (let i = 0; i < CONFIG.numEmployees; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const email = generateEmail(firstName, lastName, i + 2);
    const branchId = Math.floor(Math.random() * CONFIG.numBranches) + 1;
    const roleId = Math.random() < 0.1 ? 3 : 4;
    const department = randomElement(DEPARTMENTS);
    const joiningDate = randomDate(new Date('2023-01-01'), new Date('2024-12-31'));
    const employmentType = randomElement(['full_time', 'full_time', 'full_time', 'part_time', 'contract']);
    
    const [userResult] = await pool.execute(
      `INSERT INTO users (email, password_hash, full_name, role_id, branch_id, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [email, passwordHash, `${firstName} ${lastName}`, roleId, branchId]
    );
    
    const userId = userResult.insertId;
    
    const designations = ['Associate', 'Senior Associate', 'Officer', 'Senior Officer', 'Manager'];
    const designation = randomElement(designations);
    
    await pool.execute(
      `INSERT INTO staff (user_id, employee_id, designation, department, branch_id, joining_date, employment_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [userId, generateEmployeeId(i + 2), designation, department, branchId, joiningDate, employmentType]
    );
    
    if ((i + 1) % 10 === 0) {
      console.log(`   ✓ Created ${i + 1} employees...`);
    }
  }
  
  console.log(`✅ Users and staff seeded (${CONFIG.numEmployees + 1} records)\n`);
}

async function seedDepartments() {
  console.log('🏛️  Seeding departments...');
  
  for (const dept of DEPARTMENTS) {
    const branchId = Math.floor(Math.random() * CONFIG.numBranches) + 1;
    await pool.execute(
      `INSERT INTO departments (name, description, branch_id)
       VALUES (?, ?, ?)`,
      [dept, `${dept} department`, branchId]
    );
    console.log(`   ✓ Created ${dept}`);
  }
  
  console.log('✅ Departments seeded\n');
}

async function seedLeaveTypes() {
  console.log('📋 Seeding leave types...');
  
  const leaveTypes = [
    { name: 'Annual Leave', days: 21, paid: true },
    { name: 'Sick Leave', days: 14, paid: true },
    { name: 'Personal Leave', days: 5, paid: true },
    { name: 'Maternity Leave', days: 90, paid: true },
    { name: 'Paternity Leave', days: 14, paid: true },
    { name: 'Compassionate Leave', days: 5, paid: false },
    { name: 'Study Leave', days: 30, paid: false },
  ];
  
  for (const lt of leaveTypes) {
    await pool.execute(
      `INSERT INTO leave_types (name, days_per_year, is_paid, is_active)
       VALUES (?, ?, ?, TRUE)`,
      [lt.name, lt.days, lt.paid]
    );
    console.log(`   ✓ Created ${lt.name}`);
  }
  
  console.log('✅ Leave types seeded\n');
}

async function seedHolidays() {
  console.log('🎉 Seeding holidays...');
  
  for (const holiday of KENYAN_HOLIDAYS) {
    if (holiday.date >= CONFIG.startDate && holiday.date <= CONFIG.endDate) {
      await pool.execute(
        `INSERT INTO holidays (holiday_name, date, branch_id, is_mandatory, description)
         VALUES (?, ?, NULL, TRUE, ?)`,
        [holiday.name, holiday.date, `Public holiday - ${holiday.name}`]
      );
      console.log(`   ✓ Added ${holiday.name} (${holiday.date})`);
    }
  }
  
  console.log('✅ Holidays seeded\n');
}

async function seedShiftTimings() {
  console.log('⏰ Seeding shift timings...');
  
  const shifts = [
    { name: 'Morning Shift', start: '08:00:00', end: '17:00:00' },
    { name: 'Standard Shift', start: '09:00:00', end: '18:00:00' },
    { name: 'Late Shift', start: '10:00:00', end: '19:00:00' },
    { name: 'Half Day', start: '09:00:00', end: '13:00:00' },
  ];
  
  const [users] = await pool.execute('SELECT id FROM users');
  
  for (const user of users) {
    const shift = randomElement(shifts);
    const effectiveFrom = '2024-07-01';
    
    await pool.execute(
      `INSERT INTO shift_timings (user_id, shift_name, start_time, end_time, effective_from, effective_to)
       VALUES (?, ?, ?, ?, ?, NULL)`,
      [user.id, shift.name, shift.start, shift.end, effectiveFrom]
    );
  }
  
  console.log(`✅ Shift timings seeded (${users.length} records)\n`);
}

async function seedAttendance() {
  console.log('📊 Seeding attendance records (this may take a while)...');
  
  const start = new Date(CONFIG.startDate);
  const end = new Date(CONFIG.endDate);
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const [staff] = await pool.execute(`
    SELECT s.user_id, s.branch_id, st.start_time, st.end_time
    FROM staff s
    LEFT JOIN shift_timings st ON s.user_id = st.user_id
    WHERE s.status = 'active'
  `);
  
  const [holidays] = await pool.execute('SELECT date FROM holidays');
  const holidayDates = new Set(holidays.map(h => new Date(h.date).toDateString()));
  
  let recordCount = 0;
  const batchSize = 1000;
  let batch = [];
  
  for (let day = 0; day <= totalDays; day++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + day);
    
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }
    
    const dateStr = currentDate.toISOString().split('T')[0];
    const isHoliday = holidayDates.has(currentDate.toDateString());
    
    for (const employee of staff) {
      let status;
      let checkInTime = null;
      let checkOutTime = null;
      let locationVerified = false;
      let locationCoords = null;
      
      if (isHoliday) {
        status = 'holiday';
      } else {
        const rand = Math.random();
        
        if (rand < 0.03) {
          status = 'absent';
        } else if (rand < 0.05) {
          status = 'leave';
        } else if (rand < 0.15) {
          status = 'late';
          const shiftStart = employee.start_time || '09:00:00';
          const lateMinutes = 15 + Math.floor(Math.random() * 45);
          checkInTime = addMinutesToTime(shiftStart, lateMinutes);
          checkOutTime = employee.end_time || '18:00:00';
          locationVerified = Math.random() > 0.1;
        } else if (rand < 0.17) {
          status = 'half_day';
          checkInTime = employee.start_time || '09:00:00';
          checkOutTime = '13:00:00';
          locationVerified = true;
        } else {
          status = 'present';
          const shiftStart = employee.start_time || '09:00:00';
          const earlyMinutes = Math.floor(Math.random() * 10);
          checkInTime = addMinutesToTime(shiftStart, -earlyMinutes);
          checkOutTime = employee.end_time || '18:00:00';
          locationVerified = Math.random() > 0.05;
        }
      }
      
      if (locationVerified && status !== 'holiday' && status !== 'leave' && status !== 'absent') {
        const branchId = employee.branch_id || 1;
        const [branchData] = await pool.execute(
          'SELECT location_coordinates FROM branches WHERE id = ?',
          [branchId]
        );

        if (branchData.length > 0 && branchData[0].location_coordinates) {
          const coords = branchData[0].location_coordinates.split(',');
          const baseLat = parseFloat(coords[0]);
          const baseLng = parseFloat(coords[1]);
          const variation = 0.001;
          const lng = baseLng + (Math.random() - 0.5) * variation;
          const lat = baseLat + (Math.random() - 0.5) * variation;
          locationCoords = `${lat},${lng}`;
        }
      }
      
      batch.push([
        employee.user_id,
        dateStr,
        status,
        checkInTime,
        checkOutTime,
        locationCoords,
        locationVerified ? 1 : 0,
        null,
        null,
      ]);
      
      recordCount++;
      
      if (batch.length >= batchSize) {
        await insertAttendanceBatch(batch);
        console.log(`   ✓ Processed ${recordCount} attendance records...`);
        batch = [];
      }
    }
  }
  
  if (batch.length > 0) {
    await insertAttendanceBatch(batch);
  }
  
  console.log(`✅ Attendance seeded (${recordCount} records, ${totalDays} days)\n`);
}

async function insertAttendanceBatch(batch) {
  if (batch.length === 0) return;

  const placeholders = batch.map((_, i) => {
    const locIndex = i * 9 + 5;
    return `(?, ?, ?, ?, ?, ST_GeomFromText(CONCAT('POINT(', ?, ')')), ?, ?, ?)`;
  }).join(', ');
  
  const values = [];
  for (const row of batch) {
    const [userId, date, status, checkIn, checkOut, locCoords, locVerified, locAddress, notes] = row;
    values.push(
      userId, date, status, checkIn, checkOut,
      locCoords ? locCoords.replace(',', ' ') : null,
      locVerified, locAddress, notes
    );
  }

  await pool.execute(
    `INSERT INTO attendance (user_id, date, status, check_in_time, check_out_time, location_coordinates, location_verified, location_address, notes)
     VALUES ${placeholders}`,
    values
  );
}

function addMinutesToTime(timeStr, minutes) {
  const [hours, mins, secs] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins, secs);
  date.setMinutes(date.getMinutes() + minutes);
  
  const newHours = String(date.getHours()).padStart(2, '0');
  const newMins = String(date.getMinutes()).padStart(2, '0');
  const newSecs = String(date.getSeconds()).padStart(2, '0');
  
  return `${newHours}:${newMins}:${newSecs}`;
}

async function seedLeaveTypes$() {
  console.log('🏖️  Seeding leave history...');
  
  const [leaveTypes] = await pool.execute('SELECT id FROM leave_types');
  if (leaveTypes.length === 0) {
    console.log('   ⚠️  No leave types found, skipping leave history');
    return;
  }
  
  const [staff] = await pool.execute('SELECT user_id, joining_date FROM staff WHERE status = \'active\'');
  
  const leaveStatuses = ['approved', 'approved', 'approved', 'pending', 'rejected'];
  
  for (const employee of staff) {
    const numLeaves = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numLeaves; i++) {
      const joinDate = new Date(employee.joining_date);
      const startDate = randomDate(joinDate, new Date(CONFIG.endDate));
      const duration = Math.floor(Math.random() * 10) + 1;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration);
      
      if (endDate > new Date(CONFIG.endDate)) {
        continue;
      }
      
      const leaveType = randomElement(leaveTypes);
      const status = randomElement(leaveStatuses);
      
      await pool.execute(
        `INSERT INTO leave_history (user_id, leave_type_id, start_date, end_date, days_taken, status, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [employee.user_id, leaveType.id, startDate, endDate, duration, status, `Leave request`]
      );
    }
  }
  
  console.log('✅ Leave history seeded\n');
}

async function printSummary() {
  console.log('📈 Database Summary:\n');
  
  const tables = ['branches', 'users', 'staff', 'departments', 'holidays', 'shift_timings', 'attendance', 'leave_history'];
  
  for (const table of tables) {
    const [result] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
    console.log(`   ${table.padEnd(20)}: ${result[0].count.toLocaleString()} records`);
  }
  
  console.log('\n✅ Seeding complete!\n');
  console.log('📝 Test Credentials:');
  console.log('   Admin Email: admin@company.co.ke');
  console.log('   Password: Password123!');
  console.log('\n   All employees use the same password for testing.\n');
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  console.log(`Configuration:`);
  console.log(`   Date Range: ${CONFIG.startDate} to ${CONFIG.endDate}`);
  console.log(`   Branches: ${CONFIG.numBranches}`);
  console.log(`   Employees: ${CONFIG.numEmployees}`);
  console.log('');
  
  try {
    await clearExistingData();
    await seedRoles();
    await seedBranches();
    await seedUsersAndStaff();
    await seedDepartments();
    await seedLeaveTypes();
    await seedHolidays();
    await seedShiftTimings();
    await seedAttendance();
    await seedLeaveTypes$();
    await printSummary();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedDatabase()
  .then(() => {
    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
