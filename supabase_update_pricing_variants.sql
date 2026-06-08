-- SQL Reversion Script: Revert products table to the multiple-price-columns layout
-- Run this in your Supabase Dashboard SQL Editor

-- 1. Remove the single-variant columns if they exist
ALTER TABLE public.products
DROP COLUMN IF EXISTS weight_label,
DROP COLUMN IF EXISTS weight_grams,
DROP COLUMN IF EXISTS price;

-- 2. Add columns for the weight-based pricing variants back
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_250g numeric(10, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS price_500g numeric(10, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS price_1kg  numeric(10, 2) NOT NULL DEFAULT 0.00;
