-- Add sample images for the first 4 products
-- Simplified version without is_primary column

DO $$
DECLARE
  product_record RECORD;
  counter INTEGER := 0;
BEGIN
  FOR product_record IN (SELECT id FROM public.products ORDER BY position LIMIT 4)
  LOOP
    -- Add 3 additional images per product (position 2, 3, 4)
    INSERT INTO public.product_images (product_id, image_url, position) VALUES
      (product_record.id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 2),
      (product_record.id, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800', 3),
      (product_record.id, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800', 4);
    
    counter := counter + 1;
  END LOOP;
  
  RAISE NOTICE 'Added sample images for % products', counter;
END $$;

-- Verify the results
SELECT 
  p.name,
  pi.image_url,
  pi.position
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id
ORDER BY p.position, pi.position
LIMIT 20;
