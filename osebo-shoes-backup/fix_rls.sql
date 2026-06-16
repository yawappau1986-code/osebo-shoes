-- AGGRESSIVE FIX: Drop ALL policies and disable RLS, then re-enable with open read access

-- Step 1: Drop all existing policies on products
DO $$ 
DECLARE 
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'products' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', policy_record.policyname);
  END LOOP;
END $$;

-- Step 2: Drop all existing policies on categories
DO $$ 
DECLARE 
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'categories' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.categories', policy_record.policyname);
  END LOOP;
END $$;

-- Step 3: Disable RLS temporarily
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Step 4: Re-enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple, permissive read policies
CREATE POLICY "allow_read_products"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "allow_read_categories"
  ON public.categories
  FOR SELECT
  TO public
  USING (true);

-- Verify policies were created
SELECT tablename, policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename IN ('products', 'categories')
ORDER BY tablename, policyname;
