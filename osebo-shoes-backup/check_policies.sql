-- Check current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('products', 'categories')
ORDER BY tablename, policyname;

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('products', 'categories')
  AND schemaname = 'public';

-- Test a direct query as anon role
SET ROLE anon;
SELECT COUNT(*) as product_count FROM public.products;
SELECT COUNT(*) as category_count FROM public.categories;
RESET ROLE;
