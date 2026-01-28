# ✅ Quick Setup - Admin Password for Localhost

## Step 1: Generate Password Hash

1. Go to https://bcrypt-generator.com/
2. Enter your password (e.g., `admin123`)
3. Set **Rounds to 10** (important!)
4. Click "Generate Hash"
5. Copy the hash (starts with `$2a$10$...`)

## Step 2: Set Password in Database

1. Open **Supabase Dashboard** → **SQL Editor**
2. Run this query (replace the hash):

```sql
-- Update or create admin account
INSERT INTO admin_settings (setting_key, password_hash, failed_attempts)
VALUES ('admin_account', '$2a$10$YOUR_HASH_HERE', 0)
ON CONFLICT (setting_key) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    failed_attempts = 0,
    locked_until = NULL;
```

**Example** (if your password hash is `$2a$10$abcd1234...`):
```sql
INSERT INTO admin_settings (setting_key, password_hash, failed_attempts)
VALUES ('admin_account', '$2a$10$abcd1234...', 0)
ON CONFLICT (setting_key) 
DO UPDATE SET password_hash = EXCLUDED.password_hash;
```

## Step 3: Test on Localhost

1. Make sure `npm run dev` is running
2. Go to http://localhost:5173/admin
3. Enter your password
4. Click "AUTHENTICATE"
5. ✅ Should log you in!

---

## Troubleshooting

### "Admin account not configured"
- Run the SQL query above to create the `admin_account` row

### Still showing network error
- Refresh the page (Ctrl+R)
- Check browser console for errors
- Make sure database migration ran (check if `admin_settings` table has `password_hash` column)

### Account locked
Run this to unlock:
```sql
UPDATE admin_settings 
SET failed_attempts = 0, locked_until = NULL 
WHERE setting_key = 'admin_account';
```

---

## How It Works Now

✅ **Localhost-friendly**: No Edge Functions needed  
✅ **Bcrypt hashing**: Passwords encrypted with bcryptjs  
✅ **Brute-force protection**: 5 failed attempts → 15-min lockout  
✅ **Session management**: 1-hour expiration  
⚠️ **Client-side verification**: Less secure than server-side, but fine for testing  

---

## Ready to Use!

Your admin panel authentication now works on `localhost:5173` without any deployment needed! 🎉
