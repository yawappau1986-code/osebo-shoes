-- First, completely disable RLS
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Grant full access
GRANT ALL ON public.products TO anon, authenticated, postgres;
GRANT ALL ON public.categories TO anon, authenticated, postgres;

-- Delete existing data
DELETE FROM public.products;
DELETE FROM public.categories;

-- Insert ONE category (simple test)
INSERT INTO public.categories (name, image_url, description) 
VALUES ('Test Sneakers', 'https://via.placeholder.com/400', 'Test category');

-- Insert ONE product (simple test)
INSERT INTO public.products (name, price, has_weights, category_id, description, image_url, stock_quantity, position) 
VALUES (
  'Test Shoe', 
  99.99, 
  false, 
  (SELECT id FROM public.categories WHERE name = 'Test Sneakers'), 
  'A test shoe product', 
  'https://via.placeholder.com/600', 
  50, 
  1
);

-- Show what was inserted
SELECT * FROM public.categories;
SELECT id, name, price, category_id FROM public.products;
