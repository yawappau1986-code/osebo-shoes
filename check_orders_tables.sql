-- ================================================
-- CHECK IF ORDERS TABLES EXIST
-- ================================================

-- Check if orders table exists
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'orders' THEN '✅ Orders table exists'
        ELSE '❌ Orders table missing'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'orders';

-- Check if order_items table exists
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'order_items' THEN '✅ Order items table exists'
        ELSE '❌ Order items table missing'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'order_items';

-- If tables exist, show structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('orders', 'order_items')
ORDER BY table_name, ordinal_position;

-- Count existing orders
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as orders_with_users,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as guest_orders
FROM orders;

-- Count order items
SELECT 
    COUNT(*) as total_order_items
FROM order_items;

-- Show recent orders
SELECT 
    id,
    user_id,
    total,
    status,
    created_at,
    metadata
FROM orders
ORDER BY created_at DESC
LIMIT 10;
