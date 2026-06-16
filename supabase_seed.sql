-- =============================================================
-- JFAMCO / StepVault — Full Database Setup & Seed
-- HOW TO RUN:
--   1. Go to https://supabase.com/dashboard
--   2. Open your project → SQL Editor → New query
--   3. Paste this entire file and click "Run"
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. CATEGORIES TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null unique,
  description text,
  image_url   text,
  sort_order  int         not null default 0,
  created_at  timestamptz default now()
);

alter table public.categories enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
  on public.categories for select using (true);

drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories"
  on public.categories for all
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- 2. PRODUCTS TABLE  (price_250g = US 7, price_500g = US 8, price_1kg = US 9+)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.products (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null,
  description    text,
  category_id    uuid        references public.categories(id) on delete set null,
  price          numeric(10,2) not null default 0.00,
  price_250g     numeric(10,2) not null default 0.00,
  price_500g     numeric(10,2) not null default 0.00,
  price_1kg      numeric(10,2) not null default 0.00,
  has_weights    boolean     not null default true,
  tag            text,
  image_url      text,
  stock_quantity int         not null default 0,
  position       int         not null default 0,
  created_at     timestamptz default now()
);

-- Add columns that may be missing from an older schema
alter table public.products add column if not exists price_250g     numeric(10,2) not null default 0.00;
alter table public.products add column if not exists price_500g     numeric(10,2) not null default 0.00;
alter table public.products add column if not exists price_1kg      numeric(10,2) not null default 0.00;
alter table public.products add column if not exists has_weights    boolean       not null default true;
alter table public.products add column if not exists tag            text;
alter table public.products add column if not exists stock_quantity int           not null default 0;
alter table public.products add column if not exists position       int           not null default 0;
alter table public.categories add column if not exists sort_order   int           not null default 0;

alter table public.products enable row level security;

drop policy if exists "public read products" on public.products;
create policy "public read products"
  on public.products for select using (true);

drop policy if exists "admin manage products" on public.products;
create policy "admin manage products"
  on public.products for all
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- 3. ORDERS TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete set null,
  total      numeric(10,2) not null default 0.00,
  status     text        not null default 'Pending',
  metadata   jsonb,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders"
  on public.orders for select
  using (auth.uid() = user_id or auth.role() = 'authenticated');

drop policy if exists "users insert orders" on public.orders;
create policy "users insert orders"
  on public.orders for insert with check (true);

drop policy if exists "admin manage orders" on public.orders;
create policy "admin manage orders"
  on public.orders for all
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- 4. ORDER ITEMS TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id              uuid        primary key default gen_random_uuid(),
  order_id        uuid        references public.orders(id) on delete cascade,
  product_id      uuid        references public.products(id) on delete set null,
  selected_weight text,
  unit_price      numeric(10,2) not null default 0.00,
  quantity        int         not null default 1,
  line_total      numeric(10,2) not null default 0.00,
  created_at      timestamptz default now()
);

alter table public.order_items enable row level security;

drop policy if exists "public manage order items" on public.order_items;
create policy "public manage order items"
  on public.order_items for all using (true) with check (true);

-- ─────────────────────────────────────────────────────────────
-- 5. CAROUSEL ITEMS TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.carousel_items (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  description text,
  image_url   text        not null,
  link_url    text,
  is_active   boolean     not null default true,
  sort_order  int         not null default 0,
  created_at  timestamptz default now()
);

alter table public.carousel_items enable row level security;

drop policy if exists "public read carousel" on public.carousel_items;
create policy "public read carousel"
  on public.carousel_items for select using (true);

drop policy if exists "admin manage carousel" on public.carousel_items;
create policy "admin manage carousel"
  on public.carousel_items for all
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- 6. FOOTER SECTIONS TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.footer_sections (
  id          uuid        primary key default gen_random_uuid(),
  section_key text        not null unique,
  title       text        not null,
  sort_order  int         not null default 0,
  created_at  timestamptz default now()
);

alter table public.footer_sections enable row level security;

drop policy if exists "public read footer sections" on public.footer_sections;
create policy "public read footer sections"
  on public.footer_sections for select using (true);

-- ─────────────────────────────────────────────────────────────
-- 7. FOOTER ITEMS TABLE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.footer_items (
  id           uuid        primary key default gen_random_uuid(),
  section_id   uuid        references public.footer_sections(id) on delete cascade,
  label        text        not null,
  action_type  text        not null default 'text',
  action_value text,
  icon_library text,
  icon_name    text,
  sort_order   int         not null default 0,
  created_at   timestamptz default now()
);

alter table public.footer_items enable row level security;

drop policy if exists "public read footer items" on public.footer_items;
create policy "public read footer items"
  on public.footer_items for select using (true);

-- =============================================================
-- SEED DATA
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────────────────────────
insert into public.categories (name, description, image_url, sort_order) values
  ('Sneakers',  'Casual and athletic sneakers for everyday wear',           'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9ff?auto=format&fit=crop&w=900&q=80', 1),
  ('Boots',     'Rugged and stylish boots for all occasions',               'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80', 2),
  ('Sandals',   'Comfortable open-toe sandals for warm weather',            'https://images.unsplash.com/photo-1603487742131-41651ecf9d5f?auto=format&fit=crop&w=900&q=80', 3),
  ('Heels',     'Elegant heels for formal and semi-formal occasions',       'https://images.unsplash.com/photo-1543163521-1bf539e0cf6d?auto=format&fit=crop&w=900&q=80', 4),
  ('Loafers',   'Slip-on loafers blending comfort with sophistication',     'https://images.unsplash.com/photo-1533867617858-e611d85c33c9?auto=format&fit=crop&w=900&q=80', 5),
  ('Athletic',  'High-performance footwear for sports and training',        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 6),
  ('Formal',    'Classic formal shoes for the office and special events',   'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80', 7),
  ('Casual',    'Laid-back everyday casual shoes',                         'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80', 8),
  ('Slippers',  'Cosy indoor and outdoor slippers',                        'https://images.unsplash.com/photo-1603487742131-41651ecf9d5f?auto=format&fit=crop&w=900&q=80', 9),
  ('Running',   'Lightweight shoes built for speed and endurance',          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80', 10)
on conflict (name) do update set
  description = excluded.description,
  image_url   = excluded.image_url,
  sort_order  = excluded.sort_order;

-- ─────────────────────────────────────────────────────────────
-- Products
-- ─────────────────────────────────────────────────────────────
insert into public.products
  (name, description, category_id, price_250g, price_500g, price_1kg, price, has_weights, tag, image_url, stock_quantity, position)
select
  p.name, p.description,
  (select id from public.categories where name = p.cat limit 1),
  p.p7, p.p8, p.p9, p.p9, true, p.tag, p.img, p.stock, p.pos
from (values
  ('Nike Air Max 90',       'Classic sneaker with Max Air cushioning for all-day comfort.',            'Sneakers',  120.00, 130.00, 140.00, 'Best Seller',  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9ff?auto=format&fit=crop&w=900&q=80', 50, 1),
  ('Adidas Ultraboost 23',  'Responsive Boost midsole with a stretchy Primeknit upper.',              'Sneakers',  150.00, 160.00, 170.00, 'New Arrival',  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 35, 2),
  ('Puma RS-X',             'Retro-inspired chunky sole with multi-layer upper construction.',        'Sneakers',   90.00,  95.00, 100.00, 'Trending',     'https://images.unsplash.com/photo-1581093806997-124204d9fa9d?auto=format&fit=crop&w=900&q=80', 28, 3),
  ('Timberland Pro Boot',   'Industrial-grade work boot with steel toe protection.',                  'Boots',     160.00, 170.00, 185.00, 'Premium',      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80', 20, 4),
  ('Dr. Martens 1460',      'Iconic 8-eye leather boot with AirWair bouncing sole.',                  'Boots',     145.00, 155.00, 165.00, 'Classic',      'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=900&q=80', 18, 5),
  ('Birkenstock Arizona',   'Iconic two-strap sandal with contoured cork footbed.',                   'Sandals',    80.00,  85.00,  90.00, 'Comfort',      'https://images.unsplash.com/photo-1603487742131-41651ecf9d5f?auto=format&fit=crop&w=900&q=80', 45, 6),
  ('Teva Original',         'Durable water-ready sandal with adjustable hook-and-loop straps.',       'Sandals',    65.00,  70.00,  75.00, 'Outdoor',      'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=900&q=80', 30, 7),
  ('Jimmy Choo Pumps',      'Elegant stiletto heels with pointed toe, perfect for formal occasions.', 'Heels',     320.00, 340.00, 360.00, 'Designer',     'https://images.unsplash.com/photo-1543163521-1bf539e0cf6d?auto=format&fit=crop&w=900&q=80', 12, 8),
  ('Steve Madden Heels',    'Block heel mule with cushioned footbed for all-day wear.',               'Heels',      95.00, 100.00, 110.00, 'Popular',      'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=900&q=80', 22, 9),
  ('Gucci Horsebit Loafer', 'Luxury leather loafer with signature gold horsebit detail.',             'Loafers',   260.00, 275.00, 290.00, 'Luxury',       'https://images.unsplash.com/photo-1533867617858-e611d85c33c9?auto=format&fit=crop&w=900&q=80', 10, 10),
  ('Cole Haan Grand',       'Sleek penny loafer with Grand.OS cushioning technology.',               'Loafers',   110.00, 120.00, 130.00, 'Comfort',      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80', 25, 11),
  ('Nike Metcon 9',         'Elite cross-training shoe built for weightlifting and HIIT.',            'Athletic',  115.00, 125.00, 135.00, 'Performance',  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80', 40, 12),
  ('Under Armour HOVR',     'Zero-gravity feel with energy return for running and training.',         'Athletic',  100.00, 108.00, 120.00, 'New Arrival',  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80', 33, 13),
  ('Oxford Brogue',         'Hand-stitched full brogue Oxford in premium calf leather.',              'Formal',    135.00, 145.00, 160.00, 'Classic',      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80', 15, 14),
  ('Derby Black Leather',   'Clean-cut Derby shoe with a rubber-tipped leather sole.',               'Formal',    120.00, 130.00, 145.00, 'Essential',    'https://images.unsplash.com/photo-1533867617858-e611d85c33c9?auto=format&fit=crop&w=900&q=80', 20, 15),
  ('Vans Old Skool',        'Iconic side-stripe canvas and suede skate shoe.',                        'Casual',     65.00,  70.00,  75.00, 'Iconic',       'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80', 60, 16),
  ('Converse Chuck 70',     'Upgraded classic Chuck Taylor with better cushioning.',                  'Casual',     75.00,  80.00,  85.00, 'Timeless',     'https://images.unsplash.com/photo-1607522370275-f6fd4e08c4f7?auto=format&fit=crop&w=900&q=80', 55, 17),
  ('Nike Benassi Slides',   'Plush foam footbed slides for post-workout or everyday comfort.',        'Slippers',   30.00,  33.00,  35.00, 'Bestseller',   'https://images.unsplash.com/photo-1603487742131-41651ecf9d5f?auto=format&fit=crop&w=900&q=80', 70, 18),
  ('Nike Pegasus 41',       'Everyday road running shoe with responsive ReactX foam cushioning.',    'Running',   110.00, 120.00, 130.00, 'Top Pick',     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 45, 19),
  ('Asics Gel-Kayano 31',   'Stability running shoe with GEL technology and FF BLAST+ cushioning.',  'Running',   125.00, 135.00, 148.00, 'Stability',    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80', 30, 20)
) as p(name, description, cat, p7, p8, p9, tag, img, stock, pos)
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Carousel Items
-- ─────────────────────────────────────────────────────────────
insert into public.carousel_items (title, description, image_url, is_active, sort_order) values
  ('New Season Arrivals',           'Fresh drops from Nike, Adidas & more',             'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', true, 1),
  ('Premium Sneaker Sale',          'Up to 30% off selected styles this week',           'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9ff?auto=format&fit=crop&w=900&q=80', true, 2),
  ('Designer Heels & Loafers',      'Luxury footwear for every occasion',               'https://images.unsplash.com/photo-1543163521-1bf539e0cf6d?auto=format&fit=crop&w=900&q=80', true, 3),
  ('Built to Perform',              'Shop the latest in performance running footwear',   'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80', true, 4)
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Footer Sections & Items
-- ─────────────────────────────────────────────────────────────
insert into public.footer_sections (section_key, title, sort_order) values
  ('aboutUs',  'ABOUT JFAMCO', 1),
  ('mainMenu', 'MAIN MENU',    2),
  ('links',    'LINKS',        3),
  ('contact',  'CONTACT',      4)
on conflict (section_key) do update set title = excluded.title, sort_order = excluded.sort_order;

-- About Us items
insert into public.footer_items (section_id, label, action_type, sort_order) values
  ((select id from public.footer_sections where section_key = 'aboutUs'),
   'We specialize in the distribution of quality footwear products, proudly sourced for Ghana.', 'text', 10),
  ((select id from public.footer_sections where section_key = 'aboutUs'),
   'Whether you are a household shopper or a retailer, we offer professional support and a consistent supply of premium footwear.', 'text', 20)
on conflict do nothing;

-- Main Menu items
insert into public.footer_items (section_id, label, action_type, action_value, sort_order) values
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'Home',        'navigate', 'shop',                      10),
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'About Us',    'alert',    'About JFAMCO coming soon',  20),
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'JFAMCO Shop', 'navigate', 'shop',                      30),
  ((select id from public.footer_sections where section_key = 'mainMenu'), 'Contact Us',  'alert',    'Contact Us coming soon',    40)
on conflict do nothing;

-- Links items
insert into public.footer_items (section_id, label, action_type, action_value, sort_order) values
  ((select id from public.footer_sections where section_key = 'links'), 'Cart',                 'navigate', 'cart',                              10),
  ((select id from public.footer_sections where section_key = 'links'), 'Checkout',             'checkout', null,                                20),
  ((select id from public.footer_sections where section_key = 'links'), 'Wishlist',             'alert',    'Wishlist coming soon',              30),
  ((select id from public.footer_sections where section_key = 'links'), 'Terms And Conditions', 'alert',    'Terms & Conditions coming soon',    40)
on conflict do nothing;

-- Contact items
insert into public.footer_items (section_id, label, action_type, action_value, icon_library, icon_name, sort_order) values
  ((select id from public.footer_sections where section_key = 'contact'), 'Madina Estate Road to Social Welfare, Behind the Goil Filling Station, Madina, Ghana', 'text', null,                          null,           null,          10),
  ((select id from public.footer_sections where section_key = 'contact'), 'For Business, call: +233591008897',   'link', 'tel:+233591008897',           'FontAwesome',  'phone',       20),
  ((select id from public.footer_sections where section_key = 'contact'), 'Click here to order on WhatsApp',     'link', 'https://wa.me/233591008897',  'FontAwesome',  'whatsapp',    30),
  ((select id from public.footer_sections where section_key = 'contact'), 'Facebook',  'link', 'https://facebook.com',             'FontAwesome5', 'facebook-f',  40),
  ((select id from public.footer_sections where section_key = 'contact'), 'Instagram', 'link', 'https://instagram.com',            'FontAwesome5', 'instagram',   50),
  ((select id from public.footer_sections where section_key = 'contact'), 'WhatsApp',  'link', 'https://wa.me/233591008897',       'FontAwesome5', 'whatsapp',    60),
  ((select id from public.footer_sections where section_key = 'contact'), 'Twitter',   'link', 'https://twitter.com',              'FontAwesome5', 'twitter',     70),
  ((select id from public.footer_sections where section_key = 'contact'), 'TikTok',    'link', 'https://tiktok.com',               'FontAwesome5', 'tiktok',      80)
on conflict do nothing;
