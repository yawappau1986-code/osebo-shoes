-- Check if RLS is enabled and blocking product access
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'categories', 'product_images');

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'categories', 'product_images');

-- Count products in database
SELECT COUNT(*) as total_products FROM products;

-- Sample products
SELECT id, name, price, image_url FROM products LIMIT 5;

-- Fix: Enable public read access for products
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for all users" 
ON products FOR SELECT 
TO public 
USING (true);

-- Fix: Enable public read access for categories
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable read access for all users" 
ON categories FOR SELECT 
TO public 
USING (true);

-- Fix: Enable public read access for product_images if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_images') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON product_images';
        EXECUTE 'CREATE POLICY "Enable read access for all users" ON product_images FOR SELECT TO public USING (true)';
    END IF;
END $$;

-- Verify fix
SELECT 'Products accessible:', COUNT(*) FROM products;
SELECT 'Categories accessible:', COUNT(*) FROM categories;
