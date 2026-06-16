-- Remove mock Unsplash images from product_images table
-- This will leave only the actual product images from Supabase storage

DELETE FROM public.product_images
WHERE image_url LIKE '%unsplash.com%';

-- Verify what's left
SELECT 
  p.name,
  COUNT(pi.id) as image_count,
  STRING_AGG(pi.image_url, ', ' ORDER BY pi.position) as images
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name
ORDER BY p.position;
