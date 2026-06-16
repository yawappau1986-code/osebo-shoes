-- Add sample images for the first 4 products
-- This will give each product 4 images total (1 existing + 3 new)

DO $$
DECLARE
  product_record RECORD;
  counter INTEGER := 0;
BEGIN
  FOR product_record IN (SELECT id FROM public.products ORDER BY position LIMIT 4)
  LOOP
    -- Check if additional images already exist for this product
    IF NOT EXISTS (
      SELECT 1 FROM public.product_images 
      WHERE product_id = product_record.id AND position > 1
    ) THEN
      -- Add 3 additional images per product (position 2, 3, 4)
      INSERT INTO public.product_images (product_id, image_url, position) VALUES
        (product_record.id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 2),
        (product_record.id, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800', 3),
        (product_record.id, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800', 4);
      
      counter := counter + 1;
    END IF;
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
