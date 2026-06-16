-- NUCLEAR OPTION: Completely disable RLS on products and categories
-- This allows ALL access without any policy checks

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Verify RLS is now disabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('products', 'categories')
  AND schemaname = 'public';