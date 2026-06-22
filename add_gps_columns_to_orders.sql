-- ================================================
-- ADD GPS COORDINATES TO ORDERS TABLE
-- ================================================
-- Run this in your Supabase SQL Editor
-- This adds latitude and longitude columns for delivery location
-- ================================================

-- Add GPS columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- Add index for faster GPS queries
CREATE INDEX IF NOT EXISTS idx_orders_gps ON public.orders(delivery_latitude, delivery_longitude);

-- Add comment to columns
COMMENT ON COLUMN public.orders.delivery_latitude IS 'Delivery location latitude (geocoded from address)';
COMMENT ON COLUMN public.orders.delivery_longitude IS 'Delivery location longitude (geocoded from address)';
COMMENT ON COLUMN public.orders.delivery_address IS 'Customer delivery address text';

-- Verify columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name IN ('delivery_latitude', 'delivery_longitude', 'delivery_address')
ORDER BY column_name;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '✅ GPS columns added successfully!';
    RAISE NOTICE '📍 Columns added:';
    RAISE NOTICE '   - delivery_latitude (DECIMAL)';
    RAISE NOTICE '   - delivery_longitude (DECIMAL)';
    RAISE NOTICE '   - delivery_address (TEXT)';
    RAISE NOTICE '';
    RAISE NOTICE '🗺️ Orders can now store GPS coordinates!';
    RAISE NOTICE '🚀 Riders will receive accurate navigation links!';
END $$;
