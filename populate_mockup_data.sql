-- Clear existing data
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.categories CASCADE;

-- Insert Categories
INSERT INTO public.categories (id, name, image_url, description, created_at) VALUES
  (1, 'Sneakers', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'Casual and athletic sneakers', NOW()),
  (2, 'Boots', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400', 'Rugged and stylish boots', NOW()),
  (3, 'Formal', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400', 'Dress shoes and oxfords', NOW()),
  (4, 'Sandals', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400', 'Comfortable sandals and slides', NOW());

-- Insert Products (20 mock shoes)
INSERT INTO public.products (id, name, price, has_weights, tag, category_id, description, image_url, stock_quantity, position, created_at) VALUES
  -- Sneakers
  (1, 'Air Max Classic', 129.99, false, null, 1, 'Iconic retro sneaker with visible air cushioning', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 45, 1, NOW()),
  (2, 'Urban Runner Pro', 149.99, false, 'BEST SELLER', 1, 'High-performance running shoe with breathable mesh', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', 32, 2, NOW()),
  (3, 'Street Style Low', 89.99, false, null, 1, 'Minimalist low-top sneaker for everyday wear', 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600', 60, 3, NOW()),
  (4, 'High Top Elite', 139.99, false, null, 1, 'Premium high-top sneaker with ankle support', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600', 28, 4, NOW()),
  (5, 'Canvas Classic', 64.99, false, null, 1, 'Timeless canvas sneaker in multiple colors', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600', 75, 5, NOW()),
  
  -- Boots
  (6, 'Desert Explorer', 189.99, false, 'BEST SELLER', 2, 'Durable suede desert boot for adventure', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600', 22, 6, NOW()),
  (7, 'Combat Tactical', 169.99, false, null, 2, 'Military-inspired combat boot with reinforced sole', 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600', 18, 7, NOW()),
  (8, 'Chelsea Premium', 219.99, false, null, 2, 'Elegant leather Chelsea boot with elastic sides', 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=600', 15, 8, NOW()),
  (9, 'Hiking Trail Pro', 159.99, false, null, 2, 'Waterproof hiking boot with grip sole', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600', 30, 9, NOW()),
  (10, 'Winter Warmth', 199.99, false, null, 2, 'Insulated winter boot for cold weather', 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600', 25, 10, NOW()),
  
  -- Formal
  (11, 'Oxford Classic', 179.99, false, 'BEST SELLER', 3, 'Traditional cap-toe oxford in polished leather', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600', 35, 11, NOW()),
  (12, 'Derby Elegance', 169.99, false, null, 3, 'Open-laced derby shoe for formal occasions', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600', 28, 12, NOW()),
  (13, 'Monk Strap', 199.99, false, null, 3, 'Double monk strap shoe with buckle detail', 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=600', 20, 13, NOW()),
  (14, 'Loafer Luxury', 149.99, false, null, 3, 'Premium leather penny loafer', 'https://images.unsplash.com/photo-1624351589804-e48d48f4b5b8?w=600', 40, 14, NOW()),
  (15, 'Brogue Wingtip', 189.99, false, null, 3, 'Full brogue wingtip with decorative perforations', 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600', 18, 15, NOW()),
  
  -- Sandals
  (16, 'Beach Slide', 39.99, false, null, 4, 'Comfortable rubber slide for casual wear', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600', 90, 16, NOW()),
  (17, 'Sport Sandal', 69.99, false, 'BEST SELLER', 4, 'Athletic sandal with adjustable straps', 'https://images.unsplash.com/photo-1621665422384-c0c7fe942c4e?w=600', 55, 17, NOW()),
  (18, 'Leather Flip', 49.99, false, null, 4, 'Premium leather flip-flop with arch support', 'https://images.unsplash.com/photo-1584827091240-554ac08916d3?w=600', 70, 18, NOW()),
  (19, 'Hiking Sandal', 79.99, false, null, 4, 'Durable outdoor sandal with toe protection', 'https://images.unsplash.com/photo-1631082262179-faee5ba59ec2?w=600', 42, 19, NOW()),
  (20, 'Slide Comfort', 44.99, false, null, 4, 'Cushioned slide with contoured footbed', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', 65, 20, NOW());

-- Verify insertion
SELECT 
  'Products' as table_name, 
  COUNT(*) as row_count 
FROM public.products
UNION ALL
SELECT 
  'Categories' as table_name, 
  COUNT(*) as row_count 
FROM public.categories;
