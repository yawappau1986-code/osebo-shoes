-- ================================================
-- COMPLETE ORDERS SYSTEM FOR SUPABASE
-- ================================================
-- Run this in your Supabase SQL Editor
-- This creates all tables needed for order management
-- ================================================

-- 1. DROP existing tables if they exist (optional - comment out if you want to keep data)
-- DROP TABLE IF EXISTS public.order_items CASCADE;
-- DROP TABLE IF EXISTS public.orders CASCADE;

-- ================================================
-- 2. CREATE ORDERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to orders table
COMMENT ON TABLE public.orders IS 'Customer orders with metadata for customer info and delivery details';
COMMENT ON COLUMN public.orders.user_id IS 'Reference to auth.users, NULL for guest orders';
COMMENT ON COLUMN public.orders.total IS 'Total order amount in GH₵';
COMMENT ON COLUMN public.orders.status IS 'Order status: Pending, Processing, Shipped, Delivered, Cancelled';
COMMENT ON COLUMN public.orders.metadata IS 'JSON containing customer_name, customer_email, customer_phone, delivery_address';

-- ================================================
-- 3. CREATE ORDER_ITEMS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    selected_weight TEXT DEFAULT 'unit',
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    line_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to order_items table
COMMENT ON TABLE public.order_items IS 'Individual line items for each order';
COMMENT ON COLUMN public.order_items.order_id IS 'Reference to orders table';
COMMENT ON COLUMN public.order_items.product_id IS 'Reference to products, NULL if product deleted';
COMMENT ON COLUMN public.order_items.product_name IS 'Product name snapshot at time of order';
COMMENT ON COLUMN public.order_items.selected_weight IS 'Selected size: US 7, US 8, US 9, US 10, US 11, or unit';
COMMENT ON COLUMN public.order_items.line_total IS 'unit_price * quantity';

-- ================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ================================================
-- 5. CREATE UPDATED_AT TRIGGER FUNCTION
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 6. DISABLE RLS (FOR TESTING - ENABLE FOR PRODUCTION)
-- ================================================
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- ================================================
-- 7. OR CREATE RLS POLICIES (RECOMMENDED FOR PRODUCTION)
-- ================================================
-- Uncomment these and comment out the DISABLE commands above

-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- -- Allow anyone to insert orders (for guest checkout)
-- CREATE POLICY "Allow insert orders" 
-- ON public.orders FOR INSERT 
-- TO anon, authenticated
-- WITH CHECK (true);

-- -- Users can read their own orders
-- CREATE POLICY "Users read own orders" 
-- ON public.orders FOR SELECT 
-- TO authenticated
-- USING (auth.uid() = user_id);

-- -- Anonymous users can read orders they just created (for order confirmation)
-- CREATE POLICY "Allow read recent orders" 
-- ON public.orders FOR SELECT 
-- TO anon
-- USING (created_at > NOW() - INTERVAL '1 hour');

-- -- Allow anyone to insert order items (tied to orders)
-- CREATE POLICY "Allow insert order_items" 
-- ON public.order_items FOR INSERT 
-- TO anon, authenticated
-- WITH CHECK (true);

-- -- Allow users to read their order items
-- CREATE POLICY "Users read own order_items" 
-- ON public.order_items FOR SELECT 
-- TO authenticated
-- USING (
--     order_id IN (
--         SELECT id FROM public.orders WHERE user_id = auth.uid()
--     )
-- );

-- -- Allow anonymous users to read recent order items
-- CREATE POLICY "Allow read recent order_items" 
-- ON public.order_items FOR SELECT 
-- TO anon
-- USING (
--     order_id IN (
--         SELECT id FROM public.orders WHERE created_at > NOW() - INTERVAL '1 hour'
--     )
-- );

-- ================================================
-- 8. INSERT SAMPLE ORDERS (FOR TESTING)
-- ================================================
-- Sample order 1
DO $$
DECLARE
    v_order_id UUID;
    v_product_id UUID;
BEGIN
    -- Get first product ID
    SELECT id INTO v_product_id FROM public.products LIMIT 1;
    
    -- Create order
    INSERT INTO public.orders (total, status, metadata)
    VALUES (
        1100.00,
        'Pending',
        jsonb_build_object(
            'customer_name', 'John Doe',
            'customer_email', 'john@example.com',
            'customer_phone', '+233123456789',
            'delivery_address', '123 Main Street, Accra, Ghana'
        )
    )
    RETURNING id INTO v_order_id;
    
    -- Create order items
    INSERT INTO public.order_items (order_id, product_id, product_name, selected_weight, unit_price, quantity, line_total)
    VALUES 
        (v_order_id, v_product_id, 'SHOE1', 'US 9', 550.00, 2, 1100.00);
    
    RAISE NOTICE 'Sample order created with ID: %', v_order_id;
END $$;

-- Sample order 2
DO $$
DECLARE
    v_order_id UUID;
    v_product_id UUID;
BEGIN
    -- Get first product ID
    SELECT id INTO v_product_id FROM public.products LIMIT 1;
    
    -- Create order
    INSERT INTO public.orders (total, status, metadata)
    VALUES (
        400.00,
        'Delivered',
        jsonb_build_object(
            'customer_name', 'Jane Smith',
            'customer_email', 'jane@example.com',
            'customer_phone', '+233987654321',
            'delivery_address', '456 Oak Avenue, Kumasi, Ghana'
        )
    )
    RETURNING id INTO v_order_id;
    
    -- Create order items
    INSERT INTO public.order_items (order_id, product_id, product_name, selected_weight, unit_price, quantity, line_total)
    VALUES 
        (v_order_id, v_product_id, 'SHOE1', 'unit', 400.00, 1, 400.00);
    
    RAISE NOTICE 'Sample order created with ID: %', v_order_id;
END $$;

-- ================================================
-- 9. VERIFICATION QUERIES
-- ================================================
-- Check tables exist
SELECT 
    tablename, 
    schemaname,
    hasindexes,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('orders', 'order_items')
ORDER BY tablename;

-- Check table columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('orders', 'order_items')
ORDER BY table_name, ordinal_position;

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('orders', 'order_items')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

-- Count orders
SELECT 
    'Orders' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as delivered,
    SUM(total) as total_revenue
FROM public.orders;

-- Count order items
SELECT 
    'Order Items' as table_name,
    COUNT(*) as total_count,
    SUM(quantity) as total_quantity,
    SUM(line_total) as total_value
FROM public.order_items;

-- Sample orders with items
SELECT 
    o.id as order_id,
    o.status,
    o.total,
    o.metadata->>'customer_name' as customer_name,
    o.created_at,
    json_agg(
        json_build_object(
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'line_total', oi.line_total
        )
    ) as items
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.status, o.total, o.metadata, o.created_at
ORDER BY o.created_at DESC
LIMIT 10;

-- ================================================
-- 10. SUCCESS MESSAGE
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Orders system created successfully!';
    RAISE NOTICE '📦 Tables: orders, order_items';
    RAISE NOTICE '🔍 Indexes: Created for performance';
    RAISE NOTICE '🔒 RLS: Disabled (enable for production)';
    RAISE NOTICE '📝 Sample orders: 2 orders created for testing';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your app can now:';
    RAISE NOTICE '   - Create orders';
    RAISE NOTICE '   - Fetch order history';
    RAISE NOTICE '   - Display order items with product images';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Next step: Refresh your app!';
END $$;
