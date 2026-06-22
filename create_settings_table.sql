-- ================================================
-- CREATE SETTINGS TABLE FOR APP CONFIGURATION
-- ================================================
-- Run this in your Supabase SQL Editor
-- Stores app-wide settings like rider phone number
-- ================================================

-- Create settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'text', -- text, number, boolean, json
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE public.app_settings IS 'Application-wide settings and configuration';

-- Insert default rider phone number
INSERT INTO public.app_settings (setting_key, setting_value, setting_type, description)
VALUES 
    ('rider_phone_number', '+233241234567', 'text', 'Default delivery rider WhatsApp number'),
    ('store_latitude', '5.6037', 'number', 'Store location latitude'),
    ('store_longitude', '-0.1870', 'number', 'Store location longitude'),
    ('store_address', 'Madina Estate Road to Social Welfare, Behind the Goil Filling Station, Madina, Ghana', 'text', 'Store physical address')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_settings_timestamp_trigger ON public.app_settings;
CREATE TRIGGER update_settings_timestamp_trigger
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_timestamp();

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
CREATE POLICY "Anyone can read settings"
ON public.app_settings FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated users can update settings (for admin)
CREATE POLICY "Authenticated users can update settings"
ON public.app_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.app_settings(setting_key);

-- Verify settings
SELECT * FROM public.app_settings ORDER BY setting_key;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Settings table created successfully!';
    RAISE NOTICE '⚙️ Default settings added:';
    RAISE NOTICE '   - rider_phone_number: +233241234567';
    RAISE NOTICE '   - store_latitude: 5.6037';
    RAISE NOTICE '   - store_longitude: -0.1870';
    RAISE NOTICE '   - store_address: Madina Estate...';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Admin can now update these in Settings page!';
END $$;
