-- ================================================
-- ADD "Sent to Rider" STATUS TO ORDERS TABLE
-- ================================================
-- Run this in your Supabase SQL Editor
-- This updates the status constraint to include the new status
-- ================================================

-- Drop the existing constraint
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add the new constraint with "Sent to Rider" included
ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pending', 'Processing', 'Sent to Rider', 'Shipped', 'Delivered', 'Cancelled'));

-- Verify the constraint was added
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.orders'::regclass
    AND conname = 'orders_status_check';

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Status constraint updated successfully!';
    RAISE NOTICE '📋 Allowed statuses:';
    RAISE NOTICE '   - Pending';
    RAISE NOTICE '   - Processing';
    RAISE NOTICE '   - Sent to Rider (NEW)';
    RAISE NOTICE '   - Shipped';
    RAISE NOTICE '   - Delivered';
    RAISE NOTICE '   - Cancelled';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 You can now use "Sent to Rider" status in your app!';
END $$;
