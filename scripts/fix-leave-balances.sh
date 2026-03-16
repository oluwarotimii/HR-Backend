#!/bin/bash

# ============================================
# Leave Balance Fix - Automated Script
# ============================================
# This script will fix the incorrect leave balances
# ============================================

echo "=============================================="
echo "  Leave Balance Fix"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_USER="root"
DB_NAME="hr_db"
MIGRATION_FILE="migrations/092_fix_leave_allocations_carryover.sql"

echo -e "${YELLOW}Database Configuration:${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Migration: $MIGRATION_FILE"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Error: Migration file not found!${NC}"
    echo "Expected location: $(pwd)/$MIGRATION_FILE"
    exit 1
fi

echo -e "${YELLOW}Step 1: Testing database connection...${NC}"
if mysql -u "$DB_USER" -e "USE $DB_NAME;" 2>/dev/null; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to database${NC}"
    echo "Please check:"
    echo "  1. MySQL is running"
    echo "  2. Database '$DB_NAME' exists"
    echo "  3. User '$DB_USER' has access"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Creating backup...${NC}"
BACKUP_FILE="backup_before_leave_fix_$(date +%Y%m%d_%H%M%S).sql"
if mysqldump -u "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    echo "Continuing anyway (not recommended)..."
fi

echo ""
echo -e "${YELLOW}Step 3: Running migration...${NC}"
if mysql -u "$DB_USER" "$DB_NAME" < "$MIGRATION_FILE"; then
    echo -e "${GREEN}✓ Migration completed successfully${NC}"
else
    echo -e "${RED}✗ Migration failed${NC}"
    echo "Check the error message above for details"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Verifying fix...${NC}"
echo ""

# Run verification query
mysql -u "$DB_USER" "$DB_NAME" << 'EOF'
SELECT 
    '=== VERIFICATION RESULTS ===' as '',
    COUNT(*) as total_allocations,
    SUM(CASE WHEN carried_over_days > 0 THEN 1 ELSE 0 END) as still_have_carryover,
    SUM(CASE WHEN carried_over_days = 0 THEN 1 ELSE 0 END) as fixed_allocations
FROM leave_allocations
WHERE cycle_end_date >= CURDATE();

SELECT 
    'Sample of fixed allocations:' as '',
    lt.name as leave_type,
    la.allocated_days as allocated,
    la.used_days as used,
    la.carried_over_days as carried_over,
    la.allocated_days - la.used_days as remaining
FROM leave_allocations la
LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.cycle_end_date >= CURDATE()
  AND la.carried_over_days = 0
LIMIT 5;
EOF

echo ""
echo "=============================================="
echo -e "${GREEN}  ✅ Fix Complete!${NC}"
echo "=============================================="
echo ""
echo "Next steps:"
echo "  1. Refresh your browser (Ctrl+Shift+R)"
echo "  2. Check the Leave page"
echo "  3. Balances should now show correctly"
echo ""
echo "Expected result:"
echo "  Annual Leave:    16 / 21  days remaining"
echo "  Sick Leave:      12 / 14  days remaining"
echo "  (values will vary based on actual usage)"
echo ""
echo "Backup saved to: $BACKUP_FILE"
echo ""
