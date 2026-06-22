-- =============================================================
-- Osebo-Shoes — Promotional Banners Table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- 1. Create the table
create table if not exists public.promotional_banners (
  id                uuid        primary key default gen_random_uuid(),
  title             text        not null,
  subtitle          text,
  image_url         text        not null,
  promo_label       text,
  label_color       text        default '#4A0404',
  discount_percentage numeric(5,2) default 0,
  is_active         boolean     not null default true,
  display_position  int         not null default 0,
  created_at        timestamptz default now()
);

-- 2. Enable RLS
alter table public.promotional_banners enable row level security;

-- Anyone can read banners
drop policy if exists "public read promotional_banners" on public.promotional_banners;
create policy "public read promotional_banners"
  on public.promotional_banners for select using (true);

-- Only authenticated (admin) can manage
drop policy if exists "admin manage promotional_banners" on public.promotional_banners;
create policy "admin manage promotional_banners"
  on public.promotional_banners for all
  using (auth.role() = 'authenticated');

-- 3. Insert the 3 banner cards (matching your carousel inscription text)
insert into public.promotional_banners
  (title, subtitle, image_url, promo_label, label_color, discount_percentage, is_active, display_position)
values
  (
    'Luxury Autumn Collection',
    'Luxury footwear for every occasion',
    'https://images.unsplash.com/photo-1543163521-1bf539e0cf6d?auto=format&fit=crop&w=900&q=80',
    'HOT DEAL',
    '#F59E0B',
    0,
    true,
    1
  ),
  (
    'Premium Sneaker Sale',
    'Up to 30% off selected styles this week',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9ff?auto=format&fit=crop&w=900&q=80',
    'SALE 30%',
    '#EF4444',
    30,
    true,
    2
  ),
  (
    'New Season Arrivals',
    'Fresh designs from Nike, Adidas & more',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    'NEW',
    '#10B981',
    0,
    true,
    3
  )
on conflict do nothing;

-- Verify
select id, title, promo_label, is_active, display_position
from public.promotional_banners
order by display_position;
