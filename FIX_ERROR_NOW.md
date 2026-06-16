# 🚨 Fix Error: Profiles Table Missing

## The Error You're Seeing

```
Error fetching profile: {code: 'PGRST116', details: 'The result contains 0 rows'}
GET https://...supabase.co/rest/v1/profiles?... 406 (Not Acceptable)
```

**Cause:** The `profiles` table doesn't exist in your Supabase database yet!

---

## ✅ Quick Fix (5 Minutes)

### Step 1: Open Supabase
1. Go to: https://your-project-id.supabase.co
2. Sign in if needed
3. Click **"SQL Editor"** in left sidebar

### Step 2: Run SQL Script
1. Click **"New Query"** button
2. Copy the ENTIRE content from: `create_profiles_table.sql`
3. Paste into the SQL Editor
4. Click **"RUN"** button (or press Ctrl+Enter)

### Step 3: Wait for Success
You should see:
```
✅ Profiles table setup complete!
📝 Table: profiles with roles (customer, admin, staff)
🔄 Trigger: Auto-creates profile on user signup
👤 Admin email: osebo-shoe.shoesadmin@gmail.com will get admin role
```

And below that, a table showing your admin profile:
```
email                           | role  | created_at
--------------------------------|-------|------------------
osebo-shoe.shoesadmin@gmail.com | admin | 2026-06-14 ...
```

### Step 4: Refresh Your App
1. Go back to your app (http://localhost:8081)
2. Hard refresh (Ctrl+Shift+R)
3. Try signing in again
4. Error should be gone! ✅

---

## 📋 What This Script Does

1. ✅ Creates `profiles` table with columns:
   - `id` (links to auth.users)
   - `email`
   - `full_name`
   - `role` (admin/customer/staff)
   - `phone`
   - `created_at`, `updated_at`

2. ✅ Creates trigger to auto-create profiles for new signups

3. ✅ Finds your existing admin user and creates profile with role='admin'

4. ✅ Sets up indexes for fast queries

5. ✅ Disables RLS for easy access

---

## 🔍 Verify It Worked

Run this in SQL Editor:
```sql
SELECT email, role FROM profiles WHERE email = 'osebo-shoe.shoesadmin@gmail.com';
```

Should return:
```
email                           | role
--------------------------------|------
osebo-shoe.shoesadmin@gmail.com | admin
```

---

## 🎯 After Running SQL

Your app will now:
- ✅ Create profiles automatically for new signups
- ✅ Check user roles on login
- ✅ Route admins to admin dashboard
- ✅ Route customers to shop
- ✅ No more 406 errors!

---

## 💡 Why This Happened

The code was updated to use profile-based authentication, but the database table wasn't created yet. It's like having a key (code) but no lock (database table) to use it with!

**Now you're creating the lock.** 🔐

---

**Ready?** Just copy `create_profiles_table.sql` into Supabase SQL Editor and run it!
