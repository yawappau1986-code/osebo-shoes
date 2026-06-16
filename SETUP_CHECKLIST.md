# ✅ Setup Checklist: Profile-Based Admin

## 📋 Pre-Setup

- [x] Code updated in App.js
- [x] Documentation created
- [x] SQL scripts ready
- [x] No code errors

## 🚀 Database Setup (DO THIS NOW)

### [ ] Task 1: Create Profiles Table
1. [ ] Open Supabase Dashboard: https://hxkhlexajostqthptvaw.supabase.co
2. [ ] Navigate to **SQL Editor**
3. [ ] Open file: `create_profiles_table.sql`
4. [ ] Copy all SQL content
5. [ ] Paste into SQL Editor
6. [ ] Click **"Run"**
7. [ ] Wait for success message
8. [ ] Verify: See "Profiles table created" message

**Expected Output:**
```
✅ Profiles table setup complete!
📝 Table: profiles with roles (customer, admin, staff)
🔄 Trigger: Auto-creates profile on user signup
👤 Admin email: jafancoadmin@gmail.com will get admin role
```

### [ ] Task 2: Create Admin User
Choose **ONE** method:

#### Option A - Supabase Dashboard (Recommended)
1. [ ] Go to **Authentication** → **Users**
2. [ ] Click **"Add User"** button
3. [ ] Enter:
   - Email: `jafancoadmin@gmail.com`
   - Password: (create secure password)
   - ✅ Check "Auto Confirm User"
4. [ ] Click **"Create User"**
5. [ ] User should appear in list

#### Option B - App Sign Up
1. [ ] Open your app
2. [ ] Click **"Sign In"** in bottom navbar
3. [ ] Toggle to **"Sign Up"**
4. [ ] Enter:
   - Email: `jafancoadmin@gmail.com`
   - Name: JFAMCO Admin
   - Password: (create secure password)
5. [ ] Click **"Sign Up"**
6. [ ] Check email for confirmation (if required)

### [ ] Task 3: Verify Profile Created
1. [ ] Go back to **Supabase SQL Editor**
2. [ ] Run this query:
```sql
SELECT email, role, created_at 
FROM profiles 
WHERE email = 'jafancoadmin@gmail.com';
```
3. [ ] Verify result shows:
   - Email: `jafancoadmin@gmail.com`
   - Role: `admin`
   - Created_at: (timestamp)

**If no results:**
```sql
-- Manually create profile
INSERT INTO profiles (id, email, full_name, role)
SELECT id, 'jafancoadmin@gmail.com', 'JFAMCO Admin', 'admin'
FROM auth.users 
WHERE email = 'jafancoadmin@gmail.com';
```

## 🧪 Testing (DO THIS AFTER SETUP)

### [ ] Task 4: Test Admin Login
1. [ ] Open your app
2. [ ] Click **"Sign In"** (bottom navbar, user icon)
3. [ ] Enter credentials:
   - Email: `jafancoadmin@gmail.com`
   - Password: (your password)
4. [ ] Click **"Sign In"**
5. [ ] **Expected**: Redirects to Admin Dashboard ✅
6. [ ] Verify you see admin features:
   - Dashboard tab
   - Inventory tab
   - Orders tab
   - Customers tab
   - Analytics tab

### [ ] Task 5: Test Regular User (Optional)
1. [ ] Sign out (if logged in as admin)
2. [ ] Click **"Sign In"** → Toggle to **"Sign Up"**
3. [ ] Create test user:
   - Email: `test@example.com`
   - Name: Test User
   - Password: test123
4. [ ] Sign in with test credentials
5. [ ] **Expected**: Redirects to Shop (not admin) ✅
6. [ ] Verify admin dashboard is NOT accessible

## 🐛 Troubleshooting

### [ ] Issue: "Invalid login credentials"
**Cause:** User doesn't exist in Supabase

**Fix:**
1. [ ] Go to Supabase Dashboard → Authentication → Users
2. [ ] Check if `jafancoadmin@gmail.com` is listed
3. [ ] If not, go back to Task 2 and create user
4. [ ] If yes, verify email is confirmed (check "Confirmed" column)

### [ ] Issue: "You do not have admin privileges"
**Cause:** Profile role is not 'admin'

**Fix:**
1. [ ] Run in SQL Editor:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'jafancoadmin@gmail.com';
```
2. [ ] Try logging in again

### [ ] Issue: Login successful but stays on shop page
**Cause:** Profile doesn't exist or checkAdmin function failing

**Fix:**
1. [ ] Check if profile exists:
```sql
SELECT * FROM profiles WHERE email = 'jafancoadmin@gmail.com';
```
2. [ ] If no results, create profile:
```sql
INSERT INTO profiles (id, email, full_name, role)
SELECT id, 'jafancoadmin@gmail.com', 'JFAMCO Admin', 'admin'
FROM auth.users 
WHERE email = 'jafancoadmin@gmail.com';
```
3. [ ] Try logging in again

### [ ] Issue: SQL script errors
**Common Errors:**

**"relation 'profiles' already exists"**
- Table already exists, skip creation
- Just verify profile exists with admin role

**"function handle_new_user already exists"**
- Function already exists, this is OK
- Script will recreate it

**"permission denied"**
- Check you're using correct Supabase project
- Verify you're logged in to dashboard

## 📊 Verification Commands

### Check Everything is Working
```sql
-- 1. Check profiles table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- 2. Check admin profile exists
SELECT email, role, created_at 
FROM profiles 
WHERE email = 'jafancoadmin@gmail.com';

-- 3. Check trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Check user exists
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'jafancoadmin@gmail.com';

-- 5. Count all profiles
SELECT role, COUNT(*) 
FROM profiles 
GROUP BY role;
```

## 📝 Notes

- [ ] Save admin password securely (use password manager)
- [ ] Document admin email for team: `jafancoadmin@gmail.com`
- [ ] Consider enabling 2FA for production
- [ ] Review RLS policies before production deployment

## ✅ Completion Checklist

- [ ] Profiles table created in Supabase
- [ ] Admin user created and confirmed
- [ ] Admin profile exists with role='admin'
- [ ] Successfully logged in as admin
- [ ] Admin dashboard accessible
- [ ] Test user login works (redirects to shop)
- [ ] Admin credentials documented securely

## 🎯 Success Criteria

When complete, you should:
1. ✅ Be able to login with `jafancoadmin@gmail.com`
2. ✅ See the Admin Dashboard with all 5 tabs
3. ✅ Have profile stored in database with role='admin'
4. ✅ Regular users redirect to shop (not admin)

## 📚 Help & Documentation

If stuck, check these files:
- `ADMIN_QUICK_SETUP.md` - Quick 3-step guide
- `PROFILE_BASED_ADMIN_SETUP.md` - Complete documentation
- `questions-and-answers/04-profile-based-admin-setup.md` - Q&A format
- `CHANGES_SUMMARY.md` - What changed and why

## 🆘 Still Having Issues?

1. Check browser console for errors (F12)
2. Check Supabase logs in dashboard
3. Verify .env file has correct Supabase credentials
4. Test Supabase connection: `node test-products-fetch.js`
5. Restart dev server if needed

---

**Start Here**: Task 1 - Create Profiles Table  
**Current Status**: Waiting for database setup  
**Estimated Time**: 5-10 minutes  

Good luck! 🚀
