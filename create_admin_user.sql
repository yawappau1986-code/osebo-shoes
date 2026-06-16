-- ================================================
-- CREATE ADMIN USER IN SUPABASE
-- ================================================
-- This creates the admin user for jafancoadmin@gmail.com
-- ================================================

-- Note: You cannot directly insert into auth.users via SQL
-- This is a reference for what you need to do in the Supabase Dashboard

-- Go to: Supabase Dashboard → Authentication → Users → Add User
-- Email: jafancoadmin@gmail.com
-- Password: [Your chosen password]
-- Auto Confirm User: ✅ (check this box)

-- After creating the user, you can update their metadata:
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
    'full_name', 'JFAMCO Admin',
    'role', 'admin'
)
WHERE email = 'jafancoadmin@gmail.com';

-- Verify the user was created
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users
WHERE email = 'jafancoadmin@gmail.com';

-- ================================================
-- ALTERNATIVE: Check existing users
-- ================================================
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data->>'full_name' as full_name
FROM auth.users
ORDER BY created_at DESC;
