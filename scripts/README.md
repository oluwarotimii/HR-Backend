# HR App Database Seeder

> Populate your database with realistic test data for development and testing.

## Quick Start

```bash
# Run the seeder (WARNING: Deletes all existing data!)
npm run seed
```

## What Gets Created

- **5 Branches** across Kenya (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret)
- **51 Users** (1 admin + 50 employees)
- **6 Departments** (HR, Finance, IT, Operations, Sales, Customer Service)
- **7 Leave Types** (Annual, Sick, Personal, Maternity, etc.)
- **~19 Holidays** (Kenyan public holidays 2024-2025)
- **~7,000+ Attendance Records** (6+ months of daily data)
- **~100+ Leave Requests**

## Test Credentials

**Admin:**
```
Email: admin@company.co.ke
Password: Password123!
```

**Any Employee:**
```
Email: firstname.lastname[number]@company.co.ke
Password: Password123!
```

## Features

✅ Realistic attendance patterns (78% present, 10% late, 3% absent, etc.)  
✅ GPS coordinates for branch-based location verification  
✅ Kenyan public holidays  
✅ Multiple shift patterns  
✅ Leave history per employee  
✅ 6+ months of daily attendance data (July 2024 - February 2025)  

## Documentation

See [docs/database-seeder.md](../docs/database-seeder.md) for detailed documentation.

## ⚠️ Warning

This script **deletes all existing data** before seeding. Do not run on production databases!
