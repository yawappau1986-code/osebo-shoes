-- Check if RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'categories', 'product_images');

-- Check existing policies
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'categories', 'product_images');

-- Count products (as authenticated user)
SELECT 'Total products in database:' as info, COUNT(*) FROM products;

-- SOLUTION: Disable RLS temporarily to test
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Or create a proper policy for public read access
-- DROP POLICY IF EXISTS "Allow public read access" ON products;
-- CREATE POLICY "Allow public read access" 
-- ON products FOR SELECT 
-- TO anon, authenticated
-- USING (true);

-- DROP POLICY IF EXISTS "Allow public read access" ON categories;
-- CREATE POLICY "Allow public read access" 
-- ON categories FOR SELECT 
-- TO anon, authenticated
-- USING (true);

-- Check if product_images table exists and fix it too
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'product_images'
    ) THEN
        EXECUTE 'ALTER TABLE product_images DISABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- Verify the fix
SELECT 'Products accessible:' as status, COUNT(*) as count FROM products;
SELECT 'Categories accessible:' as status, COUNT(*) as count FROM categories;
