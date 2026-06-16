# Question: How to Fix "Invalid Login Credentials" for Admin User?

## The Problem
When trying to sign in with `jafancoadmin@gmail.com`, you get an error:
```
Invalid login credentials
```

This happens because the admin user doesn't exist in Supabase's authentication system, or the app is still using hardcoded email checks instead of a proper role-based system.

## The Solution: Profile-Based Admin Authentication

We've updated the app to use a **profiles table with roles** instead of hardcoded email checks.

### How It Works

**Old System (Hardcoded):**
```javascript
if (user.email === 'jafancoadmin@gmail.com') {
  // Grant admin access
}
```

**New System (Profile-Based):**
```javascript
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile?.role === 'admin') {
  // Grant admin access
}
```

### Benefits
- ✅ Multiple admins supported
- ✅ Easy to add/remove admin access
- ✅ No code changes needed to change roles
- ✅ Supports future roles (staff, manager, etc.)
- ✅ More secure and scalable

## Setup Instructions

### Step 1: Create Profiles Table

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the file: `create_profiles_table.sql`

This creates:
- `profiles` table with `id`, `email`, `full_name`, `role` fields
- Automatic trigger to create profile when user signs up
- Automatic admin role assignment for `jafancoadmin@gmail.com`

### Step 2: Create Admin User

**Option A - Supabase Dashboard:**
```
1. Authentication → Users → Add User
2. Email: jafancoadmin@gmail.com
3. Password: (secure password)
4. ✅ Auto Confirm User
5. Create User
```

**Option B - Sign Up via App:**
```
1. Open app → Sign In → Toggle to Sign Up
2. Email: jafancoadmin@gmail.com
3. Password: (secure password)
4. Submit (profile auto-created with admin role)
```

### Step 3: Verify Setup

Run this SQL to check:
```sql
SELECT email, role, created_at 
FROM profiles 
WHERE email = 'jafancoadmin@gmail.com';
```

Expected output:
```
email                    | role  | created_at
-------------------------|-------|------------------
jafancoadmin@gmail.com  | admin | 2026-06-14 10:30:00
```

### Step 4: Test Login

1. Open the app
2. Click "Sign In" in bottom navbar
3. Enter credentials:
   - Email: `admin@example.com`
   - Password: (your password)
4. Should redirect to **Admin Dashboard** ✅

## Code Changes Made

### 1. Added `checkAdmin` Function (App.js ~line 864)
```javascript
const checkAdmin = async (user) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.log('Error fetching profile:', error);
      return false;
    }
    
    return profile?.role === 'admin';
  } catch (err) {
    console.log('Error checking admin status:', err);
    return false;
  }
};
```

### 2. Updated `handleAuth` Function (App.js ~line 886)
```javascript
const handleAuth = async () => {
  // ... validation code ...
  
  if (isLoginMode) {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPassword,
    });
    if (error) throw error;

    // NEW: Check admin using profiles table
    const isAdmin = await checkAdmin(user);
    
    if (isAdmin) {
      setAdminUnlocked(true);
      setCurrentPage('admin');
    } else {
      setCurrentPage('shop');
    }
    setAuthModalVisible(false);
  }
};
```

### 3. Updated Other Login Functions
- `handleLogin` - Now uses profile check
- `submitAdminLogin` - Now uses profile check
- Removed all hardcoded email comparisons

## Troubleshooting

### Error: "Invalid login credentials"
**Cause:** User doesn't exist in `auth.users` table

**Fix:** Create user (see Step 2 above)

### Error: "You do not have admin privileges"
**Cause:** User exists but role is not 'admin'

**Fix:** Update role manually:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'jafancoadmin@gmail.com';
```

### Profile doesn't exist
**Cause:** User exists but profile wasn't created

**Fix:** Create profile manually:
```sql
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'JFAMCO Admin', 'admin'
FROM auth.users 
WHERE email = 'jafancoadmin@gmail.com';
```

### Still can't login
**Check if user exists:**
```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'jafancoadmin@gmail.com';
```

**Check if profile exists:**
```sql
SELECT id, email, role 
FROM profiles 
WHERE email = 'jafancoadmin@gmail.com';
```

## Managing Admin Access

### Add New Admin
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'newadmin@example.com';
```

### Remove Admin Access
```sql
UPDATE profiles 
SET role = 'customer' 
WHERE email = 'oldadmin@example.com';
```

### List All Admins
```sql
SELECT email, full_name, role, created_at
FROM profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;
```

## Summary

✅ **Problem:** Admin login fails with "Invalid credentials"  
✅ **Cause:** User doesn't exist or hardcoded email check  
✅ **Solution:** Profile-based role system with database-stored roles  
✅ **Setup:** Run SQL script + Create admin user  
✅ **Benefit:** Scalable, secure, multiple admins supported  

## Related Files
- `App.js` - Updated auth logic
- `create_profiles_table.sql` - Database setup
- `PROFILE_BASED_ADMIN_SETUP.md` - Full documentation
- `ADMIN_QUICK_SETUP.md` - Quick reference guide

---
**Date Added:** June 14, 2026  
**Status:** ✅ Implemented and documented
