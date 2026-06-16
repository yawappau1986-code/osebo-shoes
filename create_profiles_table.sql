-- ================================================
-- CREATE PROFILES TABLE WITH ADMIN ROLES
-- ================================================
-- This creates a profiles table to store user roles
-- ================================================

-- 1. CREATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE INDEX
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. DISABLE RLS (FOR EASY ACCESS)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- OR USE RLS POLICIES (RECOMMENDED FOR PRODUCTION)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can read own profile" 
-- ON public.profiles FOR SELECT 
-- TO authenticated
-- USING (auth.uid() = id);

-- CREATE POLICY "Users can update own profile" 
-- ON public.profiles FOR UPDATE 
-- TO authenticated
-- USING (auth.uid() = id);

-- CREATE POLICY "Allow insert on signup" 
-- ON public.profiles FOR INSERT 
-- TO authenticated
-- WITH CHECK (auth.uid() = id);

-- 4. CREATE TRIGGER TO AUTO-CREATE PROFILE ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE 
            WHEN NEW.email = 'osebo-shoe.shoesadmin@gmail.com' THEN 'admin'
            ELSE 'customer'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. CREATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. INSERT ADMIN PROFILE (IF USER ALREADY EXISTS)
-- Check if admin user exists and create profile
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'osebo-shoe.shoesadmin@gmail.com'
    LIMIT 1;
    
    -- If admin user exists, create/update profile
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (
            admin_user_id,
            'osebo-shoe.shoesadmin@gmail.com',
            'Osebo Shoes Admin',
            'admin'
        )
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            full_name = 'Osebo Shoes Admin',
            updated_at = NOW();
        
        RAISE NOTICE 'Admin profile created/updated for user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user not found. Please create user with email: osebo-shoe.shoesadmin@gmail.com';
    END IF;
END $$;

-- 7. VERIFICATION
SELECT 'Profiles table created' as status;

-- Check if admin profile exists
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles
WHERE email = 'osebo-shoe.shoesadmin@gmail.com';

-- List all profiles
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Count profiles by role
SELECT 
    role,
    COUNT(*) as count
FROM public.profiles
GROUP BY role;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Profiles table setup complete!';
    RAISE NOTICE '📝 Table: profiles with roles (customer, admin, staff)';
    RAISE NOTICE '🔄 Trigger: Auto-creates profile on user signup';
    RAISE NOTICE '👤 Admin email: osebo-shoe.shoesadmin@gmail.com will get admin role';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Next: Update App.js to check profile.role';
END $$;
