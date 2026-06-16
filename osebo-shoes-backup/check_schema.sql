-- Get the actual column structure of your tables
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('products', 'categories')
ORDER BY table_name, ordinal_position;
