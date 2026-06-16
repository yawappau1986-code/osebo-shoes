# Profile-Based Admin Authentication Setup

## ✅ What Has Been Changed

The app now uses a **profile-based role system** instead of hardcoded email checks for admin authentication.

### Code Changes in `App.js`

1. **Added `checkAdmin` function** (line ~860)
   ```javascript
   const checkAdmin = async (user) => {
     const { data: profile } = await supabase
       .from('profiles')
       .select('role')
       .eq('id', user.id)
       .single();
     
     return profile?.role === 'admin';
   }
   ```

2. **Updated `handleAuth` function** (line ~880)
   - Removed hardcoded email check: `if (user.email === ADMIN_EMAIL)`
   - Now uses: `const isAdmin = await checkAdmin(user)`
   - Grants admin access based on profile role

3. **Updated `handleLogin` function** (line ~1425)
   - Removed local fallback admin credentials
   - Removed hardcoded email comparisons
   - Now uses profile-based role check

4. **Updated `submitAdminLogin` function** (line ~1469)
   - Changed from direct email check to profile-based authentication
   - Validates admin role from profiles table

## 📋 Database Setup Required

### Step 1: Run the Profiles Table SQL

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this file: `create_profiles_table.sql`

This will:
- ✅ Create `profiles` table with `role` field (customer, admin, staff)
- ✅ Create auto-trigger to add profile when user signs up
- ✅ Automatically assign `admin` role to `jafancoadmin@gmail.com`
- ✅ Create profile for existing admin user if found

### Step 2: Create Admin User (if not exists)

If the admin user doesn't exist yet:

**Option A: Via Supabase Dashboard**
1. Go to **Authentication** → **Users** → **Add User**
2. Email: `jafancoadmin@gmail.com`
3. Password: (your secure password)
4. Auto Confirm User: ✅ Check this

**Option B: Sign up through app**
1. Open the app
2. Click "Sign In" in bottom navbar
3. Toggle to "Sign Up"
4. Use email: `jafancoadmin@gmail.com`
5. Create a strong password
6. The trigger will automatically give you admin role

### Step 3: Verify Setup

Run this SQL in Supabase to verify:

```sql
-- Check if profile exists with admin role
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE email = 'jafancoadmin@gmail.com';
```

Expected result:
```
id                  | email                    | role  | full_name
--------------------|--------------------------|-------|------------
<uuid>              | jafancoadmin@gmail.com  | admin | JFAMCO Admin
```

## 🚀 How It Works Now

### User Flow
1. User signs in with email/password
2. App authenticates with Supabase
3. App queries `profiles` table for user's role
4. If `role === 'admin'` → Redirects to Admin Dashboard
5. If `role === 'customer'` → Redirects to Shop

### Admin Access
- **Old way**: Hardcoded check `if (email === 'jafancoadmin@gmail.com')`
- **New way**: Database query `SELECT role FROM profiles WHERE id = user.id`

### Benefits
- ✅ Multiple admins possible (just update role in database)
- ✅ Roles can be changed without code changes
- ✅ Supports staff role for future use
- ✅ More secure and scalable
- ✅ Centralized role management

## 🔧 Managing Admin Users

### Add New Admin
```sql
-- Update existing user to admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'newadmin@example.com';
```

### Remove Admin Access
```sql
-- Demote admin to customer
UPDATE public.profiles
SET role = 'customer'
WHERE email = 'oldadmin@example.com';
```

### View All Admins
```sql
SELECT email, full_name, role, created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at DESC;
```

## 🐛 Troubleshooting

### Error: "Invalid login credentials"
**Cause**: User doesn't exist in Supabase auth.users table

**Solution**: Create the user via Supabase Dashboard or sign up through the app

### Error: "You do not have admin privileges"
**Cause**: User exists but profile role is not 'admin'

**Solution**: 
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'jafancoadmin@gmail.com';
```

### Admin Not Redirecting to Dashboard
**Cause**: Profile doesn't exist or `checkAdmin` function returning false

**Solution**: Check if profile exists:
```sql
SELECT * FROM public.profiles WHERE email = 'jafancoadmin@gmail.com';
```

If missing, insert manually:
```sql
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'JFAMCO Admin', 'admin'
FROM auth.users
WHERE email = 'jafancoadmin@gmail.com';
```

## 📝 Next Steps

1. ✅ Run `create_profiles_table.sql` in Supabase SQL Editor
2. ✅ Create/verify admin user exists
3. ✅ Test login with admin credentials
4. ✅ Verify admin dashboard access
5. ✅ Document admin credentials securely

## 🔐 Security Notes

- The `profiles` table has RLS disabled for easy access (as per SQL script)
- For production, consider enabling RLS with proper policies
- Store admin credentials securely (use password manager)
- Consider adding 2FA for admin accounts in production
- The trigger automatically assigns admin role only to `jafancoadmin@gmail.com`

## 📚 Related Files

- `App.js` - Main app with updated auth logic
- `create_profiles_table.sql` - Profiles table setup
- `create_admin_user.sql` - Admin user creation (optional)
- `lib/supabase.js` - Supabase client configuration
- `.env` - Supabase credentials

---

**Status**: ✅ Code updated, ready for database setup
**Last Updated**: June 14, 2026
