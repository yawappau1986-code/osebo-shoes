-- Create delivery tracking table for Osebo-Shoes
-- This stores delivery addresses, rider locations, and tracking status

-- Delivery Addresses Table
CREATE TABLE IF NOT EXISTS delivery_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Address details
    full_address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Accra',
    postal_code VARCHAR(20),
    phone_number VARCHAR(20),
    delivery_instructions TEXT,
    
    -- Coordinates
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Tracking Table
CREATE TABLE IF NOT EXISTS delivery_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,
    
    -- Rider information
    rider_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rider_name VARCHAR(100),
    rider_phone VARCHAR(20),
    
    -- Current location
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    
    -- Route information
    total_distance DECIMAL(10, 2), -- in kilometers
    estimated_duration INTEGER, -- in minutes
    remaining_distance DECIMAL(10, 2),
    remaining_duration INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',
        'assigned',
        'picked_up',
        'in_transit',
        'nearby',
        'delivered',
        'cancelled',
        'failed'
    )),
    
    -- Timestamps
    assigned_at TIMESTAMP WITH TIME ZONE,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    in_transit_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rider Location History (for replay and analytics)
CREATE TABLE IF NOT EXISTS rider_location_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_tracking_id UUID NOT NULL REFERENCES delivery_tracking(id) ON DELETE CASCADE,
    
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    speed DECIMAL(5, 2), -- km/h
    bearing INTEGER, -- 0-360 degrees
    
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_order_id ON delivery_addresses(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_coords ON delivery_addresses(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order_id ON delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_status ON delivery_tracking(status);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_rider_id ON delivery_tracking(rider_id);

CREATE INDEX IF NOT EXISTS idx_rider_location_history_tracking_id ON rider_location_history(delivery_tracking_id);
CREATE INDEX IF NOT EXISTS idx_rider_location_history_recorded_at ON rider_location_history(recorded_at);

-- Enable Row Level Security
ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_location_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_addresses
-- Users can see their own delivery addresses
CREATE POLICY "Users can view own delivery addresses"
    ON delivery_addresses FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own delivery addresses
CREATE POLICY "Users can insert own delivery addresses"
    ON delivery_addresses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own delivery addresses
CREATE POLICY "Users can update own delivery addresses"
    ON delivery_addresses FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for delivery_tracking
-- Users can see tracking for their orders
CREATE POLICY "Users can view own delivery tracking"
    ON delivery_tracking FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM orders WHERE user_id = auth.uid()
        )
    );

-- Riders can see their assigned deliveries
CREATE POLICY "Riders can view assigned deliveries"
    ON delivery_tracking FOR SELECT
    USING (auth.uid() = rider_id);

-- Riders can update tracking info for their deliveries
CREATE POLICY "Riders can update assigned deliveries"
    ON delivery_tracking FOR UPDATE
    USING (auth.uid() = rider_id);

-- RLS Policies for rider_location_history
-- Users can see location history for their deliveries
CREATE POLICY "Users can view delivery location history"
    ON rider_location_history FOR SELECT
    USING (
        delivery_tracking_id IN (
            SELECT id FROM delivery_tracking 
            WHERE order_id IN (
                SELECT id FROM orders WHERE user_id = auth.uid()
            )
        )
    );

-- Riders can insert location updates
CREATE POLICY "Riders can insert location updates"
    ON rider_location_history FOR INSERT
    WITH CHECK (
        delivery_tracking_id IN (
            SELECT id FROM delivery_tracking WHERE rider_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_delivery_addresses_updated_at
    BEFORE UPDATE ON delivery_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_tracking_updated_at
    BEFORE UPDATE ON delivery_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL,
    lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    r DECIMAL := 6371; -- Earth radius in km
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dlat := RADIANS(lat2 - lat1);
    dlon := RADIANS(lon2 - lon1);
    
    a := SIN(dlat/2) * SIN(dlat/2) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         SIN(dlon/2) * SIN(dlon/2);
    
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Sample data (optional - for testing)
/*
-- Insert sample delivery address
INSERT INTO delivery_addresses (
    order_id,
    user_id,
    full_address,
    city,
    phone_number,
    latitude,
    longitude
) VALUES (
    'your-order-id-here',
    'your-user-id-here',
    'Oxford Street, Osu',
    'Accra',
    '+233 XX XXX XXXX',
    5.5560,
    -0.1969
);

-- Insert sample tracking
INSERT INTO delivery_tracking (
    order_id,
    status,
    total_distance,
    estimated_duration
) VALUES (
    'your-order-id-here',
    'pending',
    5.2,
    18
);
*/

COMMENT ON TABLE delivery_addresses IS 'Stores customer delivery addresses with coordinates';
COMMENT ON TABLE delivery_tracking IS 'Tracks delivery status and rider location in real-time';
COMMENT ON TABLE rider_location_history IS 'Historical record of rider positions during delivery';
