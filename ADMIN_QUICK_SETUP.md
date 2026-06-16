# ⚡ Quick Setup: Profile-Based Admin

## ✅ Code Changes Complete
All code in `App.js` has been updated to use profile-based admin authentication.

## 🚀 3 Steps to Enable Admin Access

### Step 1: Run SQL Script
```
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and run: create_profiles_table.sql
4. Wait for success message
```

### Step 2: Create Admin User
Choose ONE option:

**Option A - Via Supabase Dashboard:**
```
1. Go to Authentication → Users → Add User
2. Email: jafancoadmin@gmail.com
3. Password: (your secure password)
4. ✅ Check "Auto Confirm User"
5. Click "Create User"
```

**Option B - Via App:**
```
1. Open your app
2. Click "Sign In" in bottom navbar
3. Toggle to "Sign Up"
4. Email: jafancoadmin@gmail.com
5. Password: (your secure password)
6. Submit
```

### Step 3: Test Login
```
1. Open app
2. Click "Sign In" 
3. Enter: jafancoadmin@gmail.com
4. Enter password
5. Should redirect to Admin Dashboard ✅
```

## 🔍 Verify Setup (Optional)
Run in Supabase SQL Editor:
```sql
SELECT email, role FROM profiles WHERE email = 'jafancoadmin@gmail.com';
```

Expected: `role` should be `admin`

## ❌ Troubleshooting

**"Invalid login credentials"**
→ User not created. Go back to Step 2.

**"You do not have admin privileges"**
→ Run this SQL:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'jafancoadmin@gmail.com';
```

**Profile doesn't exist**
→ Run this SQL:
```sql
INSERT INTO profiles (id, email, role)
SELECT id, 'jafancoadmin@gmail.com', 'admin'
FROM auth.users WHERE email = 'jafancoadmin@gmail.com';
```

## 📝 What Changed

**Before:**
- Admin check: `if (email === 'jafancoadmin@gmail.com')`
- Hardcoded in code
- Only one admin possible

**After:**
- Admin check: `SELECT role FROM profiles WHERE id = user.id`
- Role stored in database
- Multiple admins possible
- Easy to add/remove admin access

## 🎯 Key Files

- ✅ `App.js` - Updated with profile checks
- 📄 `create_profiles_table.sql` - Run this in Supabase
- 📚 `PROFILE_BASED_ADMIN_SETUP.md` - Full documentation

---
**Ready to go!** Just run the SQL and create the admin user.
