-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  has_weights BOOLEAN DEFAULT false,
  tag TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for public access
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Grant access to anon and authenticated users
GRANT ALL ON public.products TO anon, authenticated;
GRANT ALL ON public.categories TO anon, authenticated;

-- Insert sample categories
INSERT INTO public.categories (name, image_url, description) VALUES
  ('Sneakers', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'Casual and athletic sneakers'),
  ('Boots', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400', 'Rugged and stylish boots'),
  ('Formal', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400', 'Dress shoes and oxfords'),
  ('Sandals', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400', 'Comfortable sandals and slides');

-- Insert sample products
INSERT INTO public.products (name, price, has_weights, tag, category_id, description, image_url, stock_quantity, position) VALUES
  ('Air Max Classic', 129.99, false, 'BEST SELLER', (SELECT id FROM public.categories WHERE name = 'Sneakers'), 'Iconic retro sneaker with visible air cushioning', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 45, 1),
  ('Urban Runner Pro', 149.99, false, null, (SELECT id FROM public.categories WHERE name = 'Sneakers'), 'High-performance running shoe with breathable mesh', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', 32, 2),
  ('Street Style Low', 89.99, false, null, (SELECT id FROM public.categories WHERE name = 'Sneakers'), 'Minimalist low-top sneaker for everyday wear', 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600', 60, 3),
  ('High Top Elite', 139.99, false, null, (SELECT id FROM public.categories WHERE name = 'Sneakers'), 'Premium high-top sneaker with ankle support', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600', 28, 4),
  ('Canvas Classic', 64.99, false, null, (SELECT id FROM public.categories WHERE name = 'Sneakers'), 'Timeless canvas sneaker in multiple colors', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600', 75, 5),
  
  ('Desert Explorer', 189.99, false, 'BEST SELLER', (SELECT id FROM public.categories WHERE name = 'Boots'), 'Durable suede desert boot for adventure', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600', 22, 6),
  ('Combat Tactical', 169.99, false, null, (SELECT id FROM public.categories WHERE name = 'Boots'), 'Military-inspired combat boot with reinforced sole', 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600', 18, 7),
  ('Chelsea Premium', 219.99, false, null, (SELECT id FROM public.categories WHERE name = 'Boots'), 'Elegant leather Chelsea boot with elastic sides', 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=600', 15, 8),
  
  ('Oxford Classic', 179.99, false, 'BEST SELLER', (SELECT id FROM public.categories WHERE name = 'Formal'), 'Traditional cap-toe oxford in polished leather', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600', 35, 9),
  ('Derby Elegance', 169.99, false, null, (SELECT id FROM public.categories WHERE name = 'Formal'), 'Open-laced derby shoe for formal occasions', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600', 28, 10),
  ('Loafer Luxury', 149.99, false, null, (SELECT id FROM public.categories WHERE name = 'Formal'), 'Premium leather penny loafer', 'https://images.unsplash.com/photo-1624351589804-e48d48f4b5b8?w=600', 40, 11),
  
  ('Beach Slide', 39.99, false, null, (SELECT id FROM public.categories WHERE name = 'Sandals'), 'Comfortable rubber slide for casual wear', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600', 90, 12),
  ('Sport Sandal', 69.99, false, 'BEST SELLER', (SELECT id FROM public.categories WHERE name = 'Sandals'), 'Athletic sandal with adjustable straps', 'https://images.unsplash.com/photo-1621665422384-c0c7fe942c4e?w=600', 55, 13),
  ('Leather Flip', 49.99, false, null, (SELECT id FROM public.categories WHERE name = 'Sandals'), 'Premium leather flip-flop with arch support', 'https://images.unsplash.com/photo-1584827091240-554ac08916d3?w=600', 70, 14);

-- Verify data was inserted
SELECT 'Categories' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Products' as table_name, COUNT(*) as count FROM public.products;

-- Show first 3 products
SELECT name, price, stock_quantity FROM public.products ORDER BY position LIMIT 3;
