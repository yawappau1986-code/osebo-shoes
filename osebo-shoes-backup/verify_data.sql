-- Check if data actually exists in the tables (as admin/service role)
SELECT 'products' as table_name, COUNT(*) as count FROM public.products;
SELECT 'categories' as table_name, COUNT(*) as count FROM public.categories;

-- Show first 3 products
SELECT id, name, price, category_id, image_url 
FROM public.products 
ORDER BY position 
LIMIT 3;

-- Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('products', 'categories')
  AND schemaname = 'public';

-- Check current policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'categories')
ORDER BY tablename, policyname;
