-- Create product_images table for multiple images per product
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for public access
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON public.product_images TO anon, authenticated;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- Insert sample images for existing products (using the first product as example)
-- You can add more images for each product
INSERT INTO public.product_images (product_id, image_url, position, is_primary)
SELECT 
  id,
  image_url,
  1,
  true
FROM public.products
WHERE image_url IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add additional sample images for the first 4 products
DO $$
DECLARE
  product_record RECORD;
  counter INTEGER := 0;
BEGIN
  FOR product_record IN (SELECT id FROM public.products ORDER BY position LIMIT 4)
  LOOP
    -- Add 3 additional images per product
    INSERT INTO public.product_images (product_id, image_url, position, is_primary) VALUES
      (product_record.id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 2, false),
      (product_record.id, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800', 3, false),
      (product_record.id, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800', 4, false);
    
    counter := counter + 1;
  END LOOP;
  
  RAISE NOTICE 'Added sample images for % products', counter;
END $$;

-- Verify
SELECT 
  p.name,
  COUNT(pi.id) as image_count
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name
ORDER BY p.position
LIMIT 10;
