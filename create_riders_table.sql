-- ================================================
-- CREATE RIDERS TABLE FOR DELIVERY MANAGEMENT
-- ================================================
-- Run this in your Supabase SQL Editor
-- This creates the riders table and adds rider tracking to orders
-- ================================================

-- Create riders table
CREATE TABLE IF NOT EXISTS public.riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.riders IS 'Delivery riders for order fulfillment';
COMMENT ON COLUMN public.riders.name IS 'Rider full name';
COMMENT ON COLUMN public.riders.phone IS 'Rider WhatsApp number';
COMMENT ON COLUMN public.riders.is_active IS 'Whether rider is currently available for deliveries';
COMMENT ON COLUMN public.riders.notes IS 'Optional notes about the rider';

-- Add rider columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES public.riders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS rider_name TEXT,
ADD COLUMN IF NOT EXISTS rider_assigned_at TIMESTAMPTZ;

-- Add comments to orders columns
COMMENT ON COLUMN public.orders.rider_id IS 'ID of assigned rider';
COMMENT ON COLUMN public.orders.rider_name IS 'Snapshot of rider name at assignment';
COMMENT ON COLUMN public.orders.rider_assigned_at IS 'When rider was assigned to this order';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON public.orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_riders_active ON public.riders(is_active);
CREATE INDEX IF NOT EXISTS idx_riders_phone ON public.riders(phone);

-- Enable RLS on riders table
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active riders
CREATE POLICY "Anyone can read active riders"
ON public.riders FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Only authenticated users can manage riders (admin)
CREATE POLICY "Authenticated users can manage riders"
ON public.riders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create update trigger for riders
CREATE OR REPLACE FUNCTION update_riders_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_riders_timestamp_trigger ON public.riders;
CREATE TRIGGER update_riders_timestamp_trigger
    BEFORE UPDATE ON public.riders
    FOR EACH ROW
    EXECUTE FUNCTION update_riders_timestamp();

-- Insert sample riders
INSERT INTO public.riders (name, phone, is_active, notes) VALUES
    ('Kwame Mensah', '+233241234567', true, 'Experienced rider, covers Accra Central'),
    ('Kofi Asante', '+233209876543', true, 'Specialist in East Legon deliveries'),
    ('Ama Osei', '+233551234567', true, 'Fast delivery, covers Madina area')
ON CONFLICT (phone) DO NOTHING;

-- Verify riders table
SELECT 
    id,
    name,
    phone,
    is_active,
    created_at
FROM public.riders
ORDER BY created_at;

-- Verify orders columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name IN ('rider_id', 'rider_name', 'rider_assigned_at')
ORDER BY column_name;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Riders system created successfully!';
    RAISE NOTICE '🏍️ Riders table created with:';
    RAISE NOTICE '   - id, name, phone, is_active, notes';
    RAISE NOTICE '📦 Orders table updated with:';
    RAISE NOTICE '   - rider_id (references riders)';
    RAISE NOTICE '   - rider_name (snapshot)';
    RAISE NOTICE '   - rider_assigned_at (timestamp)';
    RAISE NOTICE '👥 Sample riders added:';
    RAISE NOTICE '   - Kwame Mensah (+233241234567)';
    RAISE NOTICE '   - Kofi Asante (+233209876543)';
    RAISE NOTICE '   - Ama Osei (+233551234567)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for multi-rider management!';
END $$;
