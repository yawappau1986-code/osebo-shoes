# 🚀 Quick Start - Admin Setup

## Your Admin User Already Exists! ✅

**Email**: `osebo-shoe.shoesadmin@gmail.com`  
**Status**: Already created in Supabase  
**UID**: `97f28b94-13d6-4590-b8f9-93f5352ed729`

---

## One Step to Enable Admin Access

### Run This SQL Script

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the entire content of: `create_profiles_table.sql`
3. Click **"Run"**
4. Wait for success message

**That's it!** The script will:
- ✅ Create profiles table
- ✅ Find your existing admin user
- ✅ Automatically create profile with role='admin'

---

## Test Login

1. Open your app
2. Click "Sign In" 
3. Enter:
   - Email: `osebo-shoe.shoesadmin@gmail.com`
   - Password: (your password)
4. Should redirect to **Admin Dashboard** ✅

---

## Verify It Worked

Run in Supabase SQL Editor:
```sql
SELECT email, role FROM profiles WHERE email = 'osebo-shoe.shoesadmin@gmail.com';
```

Should show:
```
email                           | role
--------------------------------|------
osebo-shoe.shoesadmin@gmail.com | admin
```

---

## Add More Admins (Future)

```sql
-- Promote any user to admin
UPDATE profiles SET role = 'admin' WHERE email = 'another@example.com';
```

---

## Key Point

✅ **No hardcoded emails in code anymore!**  
✅ **Everything is database-driven**  
✅ **Easy to add/remove admins with SQL**

---

**Ready?** Just run the SQL script and you're done! 🎉
