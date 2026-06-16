-- =============================================================
-- RLS POLICIES + SEED DATA
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- RLS POLICIES — allow public read on all tables
-- ─────────────────────────────────────────────────────────────

-- carousel_items
alter table public.carousel_items enable row level security;
drop policy if exists "public read carousel_items" on public.carousel_items;
create policy "public read carousel_items"
  on public.carousel_items for select using (true);

-- categories
alter table public.categories enable row level security;
drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
  on public.categories for select using (true);

-- colors
alter table public.colors enable row level security;
drop policy if exists "public read colors" on public.colors;
create policy "public read colors"
  on public.colors for select using (true);

-- footer_items
alter table public.footer_items enable row level security;
drop policy if exists "public read footer_items" on public.footer_items;
create policy "public read footer_items"
  on public.footer_items for select using (true);

-- footer_sections
alter table public.footer_sections enable row level security;
drop policy if exists "public read footer_sections" on public.footer_sections;
create policy "public read footer_sections"
  on public.footer_sections for select using (true);

-- product_colors
alter table public.product_colors enable row level security;
drop policy if exists "public read product_colors" on public.product_colors;
create policy "public read product_colors"
  on public.product_colors for select using (true);

-- product_images
alter table public.product_images enable row level security;
drop policy if exists "public read product_images" on public.product_images;
create policy "public read product_images"
  on public.product_images for select using (true);

-- product_sizes
alter table public.product_sizes enable row level security;
drop policy if exists "public read product_sizes" on public.product_sizes;
create policy "public read product_sizes"
  on public.product_sizes for select using (true);

-- products
alter table public.products enable row level security;
drop policy if exists "public read products" on public.products;
create policy "public read products"
  on public.products for select using (true);
drop policy if exists "authenticated manage products" on public.products;
create policy "authenticated manage products"
  on public.products for all using (auth.role() = 'authenticated');

-- sizes
alter table public.sizes enable row level security;
drop policy if exists "public read sizes" on public.sizes;
create policy "public read sizes"
  on public.sizes for select using (true);

-- orders — anon can insert, users read their own, authenticated read all
alter table public.orders enable row level security;
drop policy if exists "users insert orders" on public.orders;
create policy "users insert orders"
  on public.orders for insert with check (true);
drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders"
  on public.orders for select
  using (auth.uid() = user_id or auth.role() = 'authenticated');
drop policy if exists "authenticated manage orders" on public.orders;
create policy "authenticated manage orders"
  on public.orders for all using (auth.role() = 'authenticated');

-- order_items
alter table public.order_items enable row level security;
drop policy if exists "public manage order_items" on public.order_items;
create policy "public manage order_items"
  on public.order_items for all using (true) with check (true);

-- =============================================================
-- SEED DATA
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- Sizes
-- ─────────────────────────────────────────────────────────────
insert into public.sizes (label) values
  ('US 6'), ('US 7'), ('US 8'), ('US 9'), ('US 10'), ('US 11'), ('US 12')
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Colors
-- ─────────────────────────────────────────────────────────────
insert into public.colors (name, hex_code) values
  ('Black',  '#1B1C1C'),
  ('White',  '#FFFFFF'),
  ('Red',    '#D32F2F'),
  ('Blue',   '#1976D2'),
  ('Brown',  '#795548'),
  ('Grey',   '#9E9E9E'),
  ('Green',  '#388E3C'),
  ('Beige',  '#D7CCC8')
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────────────────────────
insert into public.categories (name, image_url, description) values
  ('Sneakers',  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9ff?auto=format&fit=crop&w=900&q=80', 'Casual and athletic sneakers for everyday wear'),
  ('Boots',     'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80', 'Rugged and stylish boots for all occasions'),
  ('Sandals',   'https://images.unsplash.com/photo-1603487742131-41651ecf9d5f?auto=format&fit=crop&w=900&q=80', 'Comfortable open-toe sandals for warm weather'),
  ('Heels',     'https://images.unsplash.com/photo-1543163521-1bf539e0cf6d?auto=format&fit=crop&w=900&q=80', 'Elegant heels for formal and semi-formal occasions'),
  ('Loafers',   'https://images.unsplash.com/photo-1533867617858-e611d85c33c9?auto=format&fit=crop&w=900&q=80', 'Slip-on loafers blending comfort with sophistication'),
  ('Athletic',  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 'High-performance footwear for sports and training'),
  ('Formal',    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80', 'Classic formal shoes for the office and special events'),
  ('Casual',    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80', 'Laid-back everyday casual shoes'),
  ('Slippers',  'https://images.unsplash.com/photo-1603487742131-41651ecf9d5f?auto=format&fit=crop&w=900&q=80', 'Cosy indoor and outdoor slippers'),
  ('Running',   'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80', 'Lightweight shoes built for speed and endurance')
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Products
-- ─────────────────────────────────────────────────────────────
insert into public.products (name, price, has_weights, tag, category_id, description, image_url, stock_quantity, position)
select p.name, p.price, true, p.tag,
  (select id from public.categories where name = p.cat limit 1),
  p.description, p.img, p.stock, p.pos
from (values
  ('Nike Air Max 90',       140.00, 'Best Seller',  'Sneakers',  'Classic sneaker with Max Air cushioning for all-day comfort.',             'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9ff?auto=format&fit=crop&w=900&q=80', 50, 1),
  ('Adidas Ultraboost 23',  170.00, 'New Arrival',  'Sneakers',  'Responsive Boost midsole with a stretchy Primeknit upper.',               'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',  35, 2),
  ('Puma RS-X',             100.00, 'Trending',     'Sneakers',  'Retro-inspired chunky sole with multi-layer upper construction.',         'https://images.unsplash.com/photo-1581093806997-124204d9fa9d?auto=format&fit=crop&w=900&q=80', 28, 3),
  ('Timberland Pro Boot',   185.00, 'Premium',      'Boots',     'Industrial-grade work boot with steel toe protection.',                   'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80',  20, 4),
  ('Dr. Martens 1460',      165.00, 'Classic',      'Boots',     'Iconic 8-eye leather boot with AirWair bouncing sole.',                  'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=900&q=80',  18, 5),
  ('Birkenstock Arizona',    90.00, 'Comfort',      'Sandals',   'Iconic two-strap sandal with contoured cork footbed.',                   'https://images.unsplash.com/photo-1603487742131-41651ecf9d5f?auto=format&fit=crop&w=900&q=80',  45, 6),
  ('Teva Original',          75.00, 'Outdoor',      'Sandals',   'Durable water-ready sandal with adjustable hook-and-loop straps.',       'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=900&q=80',  30, 7),
  ('Jimmy Choo Pumps',      360.00, 'Designer',     'Heels',     'Elegant stiletto heels with pointed toe, perfect for formal occasions.', 'https://images.unsplash.com/photo-1543163521-1bf539e0cf6d?auto=format&fit=crop&w=900&q=80',    12, 8),
  ('Steve Madden Heels',    110.00, 'Popular',      'Heels',     'Block heel mule with cushioned footbed for all-day wear.',               'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=900&q=80',  22, 9),
  ('Gucci Horsebit Loafer', 290.00, 'Luxury',       'Loafers',   'Luxury leather loafer with signature gold horsebit detail.',             'https://images.unsplash.com/photo-1533867617858-e611d85c33c9?auto=format&fit=crop&w=900&q=80',  10, 10),
  ('Cole Haan Grand',       130.00, 'Comfort',      'Loafers',   'Sleek penny loafer with Grand.OS cushioning technology.',               'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80',  25, 11),
  ('Nike Metcon 9',         135.00, 'Performance',  'Athletic',  'Elite cross-training shoe built for weightlifting and HIIT.',            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80',  40, 12),
  ('Under Armour HOVR',     120.00, 'New Arrival',  'Athletic',  'Zero-gravity feel with energy return for running and training.',         'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80',  33, 13),
  ('Oxford Brogue',         160.00, 'Classic',      'Formal',    'Hand-stitched full brogue Oxford in premium calf leather.',              'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80',  15, 14),
  ('Derby Black Leather',   145.00, 'Essential',    'Formal',    'Clean-cut Derby shoe with a rubber-tipped leather sole.',               'https://images.unsplash.com/photo-1533867617858-e611d85c33c9?auto=format&fit=crop&w=900&q=80',  20, 15),
  ('Vans Old Skool',         75.00, 'Iconic',       'Casual',    'Iconic side-stripe canvas and suede skate shoe.',                       'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80',  60, 16),
  ('Converse Chuck 70',      85.00, 'Timeless',     'Casual',    'Upgraded classic Chuck Taylor with better cushioning.',                  'https://images.unsplash.com/photo-1607522370275-f6fd4e08c4f7?auto=format&fit=crop&w=900&q=80',  55, 17),
  ('Nike Benassi Slides',    35.00, 'Bestseller',   'Slippers',  'Plush foam footbed slides for post-workout or everyday comfort.',        'https://images.unsplash.com/photo-1603487742131-41651ecf9d5f?auto=format&fit=crop&w=900&q=80',  70, 18),
  ('Nike Pegasus 41',       130.00, 'Top Pick',     'Running',   'Everyday road running shoe with responsive ReactX foam cushioning.',    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',    45, 19),
  ('Asics Gel-Kayano 31',   148.00, 'Stability',    'Running',   'Stability running shoe with GEL technology and FF BLAST+ cushioning.',  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80',  30, 20)
) as p(name, price, tag, cat, description, img, stock, pos)
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Carousel Items
-- ─────────────────────────────────────────────────────────────
insert into public.carousel_items (title, subtitle, image_url, is_active, sort_order) values
  ('New Season Arrivals',        'Fresh drops from Nike, Adidas & more',           'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', true, 1),
  ('Premium Sneaker Sale',       'Up to 30% off selected styles this week',         'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9ff?auto=format&fit=crop&w=900&q=80', true, 2),
  ('Designer Heels & Loafers',   'Luxury footwear for every occasion',             'https://images.unsplash.com/photo-1543163521-1bf539e0cf6d?auto=format&fit=crop&w=900&q=80', true, 3),
  ('Built to Perform',           'Shop the latest in performance running footwear', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80', true, 4)
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Footer Sections
-- ─────────────────────────────────────────────────────────────
insert into public.footer_sections (section_key, title, sort_order) values
  ('aboutUs',  'ABOUT JFAMCO', 1),
  ('mainMenu', 'MAIN MENU',    2),
  ('links',    'LINKS',        3),
  ('contact',  'CONTACT',      4)
on conflict (section_key) do update set title = excluded.title, sort_order = excluded.sort_order;

-- ─────────────────────────────────────────────────────────────
-- Footer Items (uses footer_section_id)
-- ─────────────────────────────────────────────────────────────
insert into public.footer_items (footer_section_id, label, action_type, action_value, icon_library, icon_name, sort_order) values
  -- About Us
  ((select id from public.footer_sections where section_key = 'aboutUs'), 'We specialize in the distribution of quality footwear products, proudly sourced for Ghana.', 'text', null, null, null, 10),
  ((select id from public.footer_sections where section_key = 'aboutUs'), 'Whether you are a household shopper or a retailer, we offer professional support and a consistent supply of premium footwear.', 'text', null, null, null, 20),
  -- Main Menu
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'Home',        'navigate', 'shop',                     null, null, 10),
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'About Us',    'alert',    'About JFAMCO coming soon', null, null, 20),
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'JFAMCO Shop', 'navigate', 'shop',                     null, null, 30),
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'Contact Us',  'alert',    'Contact Us coming soon',   null, null, 40),
  -- Links
  ((select id from public.footer_sections where section_key = 'links'), 'Cart',                 'navigate', 'cart',                           null, null, 10),
  ((select id from public.footer_sections where section_key = 'links'), 'Checkout',             'checkout', null,                             null, null, 20),
  ((select id from public.footer_sections where section_key = 'links'), 'Wishlist',             'alert',    'Wishlist coming soon',           null, null, 30),
  ((select id from public.footer_sections where section_key = 'links'), 'Terms And Conditions', 'alert',    'Terms & Conditions coming soon', null, null, 40),
  -- Contact
  ((select id from public.footer_sections where section_key = 'contact'), 'Madina Estate Road to Social Welfare, Behind the Goil Filling Station, Madina, Ghana', 'text', null,                         null,           null,         10),
  ((select id from public.footer_sections where section_key = 'contact'), 'For Business, call: +233591008897', 'link', 'tel:+233591008897',          'FontAwesome',  'phone',      20),
  ((select id from public.footer_sections where section_key = 'contact'), 'Click here to order on WhatsApp',   'link', 'https://wa.me/233591008897', 'FontAwesome',  'whatsapp',   30),
  ((select id from public.footer_sections where section_key = 'contact'), 'Facebook',  'link', 'https://facebook.com',             'FontAwesome5', 'facebook-f', 40),
  ((select id from public.footer_sections where section_key = 'contact'), 'Instagram', 'link', 'https://instagram.com',            'FontAwesome5', 'instagram',  50),
  ((select id from public.footer_sections where section_key = 'contact'), 'WhatsApp',  'link', 'https://wa.me/233591008897',       'FontAwesome5', 'whatsapp',   60),
  ((select id from public.footer_sections where section_key = 'contact'), 'Twitter',   'link', 'https://twitter.com',              'FontAwesome5', 'twitter',    70),
  ((select id from public.footer_sections where section_key = 'contact'), 'TikTok',    'link', 'https://tiktok.com',               'FontAwesome5', 'tiktok',     80)
on conflict do nothing;
