# 🚀 TiDB Cloud Setup Guide

## Connection String Configuration

### 1. Update `.env` File

Replace the `DATABASE_URL` with your TiDB Cloud connection string:

```bash
# Database Configuration - TiDB Cloud
DATABASE_URL=mysql://3Zt1gwWGJZReUTW.root:YOUR_PASSWORD@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test
```

**⚠️ Important:** Replace `PASSWORD` with your actual TiDB password.

---

## 2. Run Migrations

Connect to TiDB and run all migrations:

```bash
# Install dependencies (if not already done)
pnpm install

# Run all migrations
pnpm migrate
```

This will:
- ✅ Connect to your TiDB database
- ✅ Create `schema_migrations` table to track migrations
- ✅ Run all 82 migration files in order
- ✅ Create all tables, indexes, and constraints

---

## 3. Seed Database (Optional)

Add sample data for testing:

```bash
pnpm seed
```

---

## 4. Start the Application

```bash
# Development mode (with auto-reload)
pnpm dev

# Production mode
pnpm build
pnpm start
```

Server will start on `http://localhost:3000`

---

## Connection String Format

```
mysql://<username>:<password>@<host>:<port>/<database>
```

**Example from TiDB Cloud:**
```
mysql://3Zt1gwWGJZReUTW.root:MyP@ssw0rd@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test
```

**URL Encoded Password:**
If your password contains special characters, URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `=` → `%3D`

---

## Verify Connection

After starting the app, check the console output:

```
🚀 Starting system initialization...
Database connected successfully
Connected to Redis
✅ System initialization completed
```

If you see "Database connected successfully", you're all set! 🎉

---

## Troubleshooting

### Error: "Failed to parse connection string"

**Cause:** Special characters in password not encoded

**Fix:** URL-encode your password:
```javascript
// In Node.js
encodeURIComponent('your_password')
```

---

### Error: "ETIMEDOUT" or "Connection refused"

**Cause:** Firewall or network blocking connection to TiDB

**Fix:**
1. Check if TiDB cluster is active in TiDB Cloud console
2. Verify your IP is whitelisted in TiDB Cloud network settings
3. Test connection: `telnet gateway01.us-east-1.prod.aws.tidbcloud.com 4000`

---

### Error: "Access denied for user"

**Cause:** Wrong password or username

**Fix:**
1. Double-check credentials in TiDB Cloud console
2. Reset password if needed
3. Ensure connection string format is correct

---

### Error: "SSL connection required"

**Fix:** The code already includes SSL configuration. If issues persist, ensure:
```typescript
// In database.ts, SSL is configured:
ssl: {
  rejectUnauthorized: true
}
```

---

## Migration Status

Check which migrations have been run:

```sql
SELECT * FROM schema_migrations ORDER BY id;
```

---

## Rollback a Migration (If Needed)

If a migration fails and you need to rollback:

```sql
-- Remove from tracking table
DELETE FROM schema_migrations WHERE migration_name = '081_create_staff_invitations.sql';

-- Then manually rollback the changes
DROP TABLE IF EXISTS staff_invitations;
```

Then fix the issue and run `pnpm migrate` again.

---

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | **Full connection string** (preferred) | `mysql://user:pass@host:port/db` |
| `DB_HOST` | Database host (fallback) | `localhost` |
| `DB_PORT` | Database port (fallback) | `3306` |
| `DB_USER` | Database user (fallback) | `root` |
| `DB_PASSWORD` | Database password (fallback) | `secret` |
| `DB_NAME` | Database name (fallback) | `hr_management_system` |

**Note:** If `DATABASE_URL` is set, it takes precedence over individual `DB_*` variables.

---

## Next Steps

After successful setup:

1. ✅ Create initial admin user
2. ✅ Configure email settings (optional)
3. ✅ Start building frontend
4. ✅ Test leave module with file uploads

---

## Support

For TiDB-specific issues:
- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud/)
- [TiDB Community Forum](https://ask.pingcap.com/)

For application issues:
- Check `docs/` folder for module-specific guides
- Review error logs in console
