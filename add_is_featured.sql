-- =============================================================
-- Osebo-Shoes — Add is_featured to products table
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- 1. Add is_featured column
alter table public.products
  add column if not exists is_featured boolean not null default false;

-- 2. Mark your initial featured products (update names to match yours)
update public.products set is_featured = true
where name in ('SHOE1', 'SHOE2', 'SHOE3');

-- 3. Verify
select name, url, promo_label, tag, is_featured
from public.products
order by is_featured desc, position;
