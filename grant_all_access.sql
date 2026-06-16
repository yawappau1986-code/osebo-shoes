-- Grant FULL table access to anon and authenticated roles
GRANT ALL ON public.products TO anon, authenticated;
GRANT ALL ON public.categories TO anon, authenticated;

-- Completely disable RLS
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Verify grants
SELECT 
  grantee, 
  table_name, 
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('products', 'categories')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;
