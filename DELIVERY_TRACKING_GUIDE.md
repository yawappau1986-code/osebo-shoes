# 🚚 Delivery Tracking System - Complete Guide

## Overview

The Osebo-Shoes delivery tracking system allows customers to:
- Enter their delivery address
- See the route from store to their location
- View distance and estimated delivery time
- Track the dispatch rider in real-time
- Receive live updates as the rider approaches

## 📦 What's Included

### Components

1. **`components/DeliveryTracker.js`** - Main tracking component
2. **`create_delivery_tracking_table.sql`** - Database schema

### Features

✅ Address geocoding (converts address to coordinates)  
✅ Route calculation with distance and time  
✅ Real-time rider tracking on map  
✅ Estimated time of arrival  
✅ Distance remaining updates  
✅ Visual route display  
✅ Mobile-friendly fallback  

---

## 🚀 Quick Start

### Step 1: Set Up Database

Run the SQL file in your Supabase dashboard:

```bash
# Go to Supabase Dashboard > SQL Editor
# Copy and paste content from create_delivery_tracking_table.sql
# Click "Run"
```

This creates:
- `delivery_addresses` table
- `delivery_tracking` table
- `rider_location_history` table

### Step 2: Add to Your App

```javascript
import DeliveryTracker from './components/DeliveryTracker';
import { Modal, useState } from 'react';

// Add state
const [showTracking, setShowTracking] = useState(false);
const [currentOrderId, setCurrentOrderId] = useState(null);

// Add button (e.g., in order confirmation)
<Pressable onPress={() => {
  setCurrentOrderId(orderId);
  setShowTracking(true);
}}>
  <Text>🚚 Track Delivery</Text>
</Pressable>

// Add modal
<Modal visible={showTracking} animationType="slide">
  <DeliveryTracker
    orderId={currentOrderId}
    storeLat={5.6037}  // Your store latitude
    storeLng={-0.1870} // Your store longitude
    onClose={() => setShowTracking(false)}
  />
</Modal>
```

### Step 3: Test It

```bash
npx expo start --web
```

1. Click "Track Delivery" button
2. Enter an address (e.g., "Osu, Accra")
3. Click search
4. Click "Start Tracking"
5. Watch the rider move on the map! 🎉

---

## 🎯 How It Works

### 1. Address Geocoding

User enters address → System converts to coordinates using Nominatim (free OpenStreetMap geocoding):

```
Input: "Osu, Oxford Street, Accra"
Output: { lat: 5.5560, lng: -0.1969 }
```

### 2. Route Calculation

System calculates best route using OSRM (free routing service):

```
From: Store (5.6037, -0.1870)
To: Customer (5.5560, -0.1969)

Result:
- Distance: 5.2 km
- Duration: 18 minutes
- Full route coordinates
```

### 3. Real-Time Tracking

Rider location updates every 2 seconds (simulated, can be replaced with real GPS):

```
Rider moves along route → Location updates → Map updates → Distance/time recalculated
```

---

## 🗺️ Integration Examples

### Example 1: Track Button in Orders Page

```javascript
// In your Orders component
import DeliveryTracker from './components/DeliveryTracker';

function OrderItem({ order }) {
  const [showTracking, setShowTracking] = useState(false);

  return (
    <>
      <View style={styles.orderCard}>
        <Text>Order #{order.id}</Text>
        <Text>Status: {order.status}</Text>
        
        {order.status === 'shipped' && (
          <Pressable onPress={() => setShowTracking(true)}>
            <Text style={styles.trackButton}>🚚 Track Delivery</Text>
          </Pressable>
        )}
      </View>

      <Modal visible={showTracking}>
        <DeliveryTracker
          orderId={order.id}
          onClose={() => setShowTracking(false)}
        />
      </Modal>
    </>
  );
}
```

### Example 2: Checkout Page Integration

```javascript
// In Checkout component
import DeliveryTracker from './components/DeliveryTracker';

function CheckoutPage() {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showMap, setShowMap] = useState(false);

  return (
    <View>
      <Text>Delivery Address</Text>
      <TextInput
        value={deliveryAddress}
        onChangeText={setDeliveryAddress}
        placeholder="Enter your address"
      />
      
      <Pressable onPress={() => setShowMap(true)}>
        <Text>📍 View on Map</Text>
      </Pressable>

      <Modal visible={showMap}>
        <DeliveryTracker
          onClose={() => setShowMap(false)}
        />
      </Modal>
    </View>
  );
}
```

### Example 3: Email Notification with Tracking Link

```javascript
// When order is shipped, send email with tracking link
const sendShippingNotification = async (orderId, customerEmail) => {
  const trackingUrl = `https://osebo-shoes.com/track/${orderId}`;
  
  await sendEmail({
    to: customerEmail,
    subject: 'Your Osebo-Shoes Order is On The Way! 🚚',
    body: `
      Your order is being delivered!
      
      Track your delivery in real-time:
      ${trackingUrl}
      
      Expected delivery: 20-30 minutes
    `
  });
};
```

---

## 🔧 Configuration

### Change Store Location

Edit the component where you use DeliveryTracker:

```javascript
<DeliveryTracker
  storeLat={YOUR_STORE_LATITUDE}
  storeLng={YOUR_STORE_LONGITUDE}
/>
```

### Adjust Tracking Speed

Edit `DeliveryTracker.js` line 111:

```javascript
const interval = setInterval(() => {
  // Update code...
}, 2000); // Change 2000 to adjust speed (milliseconds)

// 1000 = 1 second (faster)
// 3000 = 3 seconds (slower)
```

### Customize Update Interval

For real GPS tracking, replace simulation with actual location updates:

```javascript
// Instead of simulation, fetch from your API
const fetchRiderLocation = async (riderId) => {
  const { data } = await supabase
    .from('delivery_tracking')
    .select('current_latitude, current_longitude')
    .eq('rider_id', riderId)
    .single();
  
  return {
    lat: data.current_latitude,
    lng: data.current_longitude
  };
};
```

---

## 📱 Mobile Support

### Web Platform
- ✅ Full interactive map
- ✅ Real-time tracking
- ✅ Route visualization
- ✅ Distance/time updates

### Mobile (iOS/Android)
- ℹ️ Shows tracking info screen
- ℹ️ SMS notifications
- ℹ️ Can be upgraded with react-native-maps

To add full mobile support:

```bash
npm install react-native-maps --legacy-peer-deps
```

Then modify `DeliveryTracker.js` to use react-native-maps on mobile.

---

## 🗄️ Database Integration

### Save Delivery Address

```javascript
const saveDeliveryAddress = async (orderId, address, coords) => {
  const { data, error } = await supabase
    .from('delivery_addresses')
    .insert({
      order_id: orderId,
      user_id: userId,
      full_address: address,
      latitude: coords.lat,
      longitude: coords.lng,
      phone_number: userPhone,
    });
  
  return data;
};
```

### Create Tracking Entry

```javascript
const createDeliveryTracking = async (orderId, addressId, distance, duration) => {
  const { data, error } = await supabase
    .from('delivery_tracking')
    .insert({
      order_id: orderId,
      delivery_address_id: addressId,
      status: 'pending',
      total_distance: distance,
      estimated_duration: duration,
    });
  
  return data;
};
```

### Update Rider Location (For Rider App)

```javascript
const updateRiderLocation = async (trackingId, lat, lng) => {
  // Update current location
  await supabase
    .from('delivery_tracking')
    .update({
      current_latitude: lat,
      current_longitude: lng,
      status: 'in_transit',
    })
    .eq('id', trackingId);
  
  // Save to history
  await supabase
    .from('rider_location_history')
    .insert({
      delivery_tracking_id: trackingId,
      latitude: lat,
      longitude: lng,
      recorded_at: new Date().toISOString(),
    });
};
```

### Real-Time Subscription

```javascript
// Subscribe to tracking updates
const subscribeToTracking = (orderId, callback) => {
  return supabase
    .channel(`tracking:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'delivery_tracking',
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
};

// Usage
const subscription = subscribeToTracking(orderId, (tracking) => {
  setRiderLocation({
    lat: tracking.current_latitude,
    lng: tracking.current_longitude,
  });
});

// Cleanup
return () => subscription.unsubscribe();
```

---

## 🎨 Customization

### Change Map Style

Edit `DeliveryTracker.js` TileLayer:

```javascript
// Dark theme
url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

// Satellite
url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
```

### Custom Markers

Create custom icons:

```javascript
// In DeliveryTracker.js
import L from 'leaflet';

const riderIcon = L.divIcon({
  className: 'custom-rider-icon',
  html: `
    <div style="
      background: #4A0404;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      border: 3px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    ">
      🚴
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Use with Marker
<Marker position={[lat, lng]} icon={riderIcon}>
```

### Add Estimated Arrival Time

```javascript
const calculateETA = (durationMinutes) => {
  const now = new Date();
  const eta = new Date(now.getTime() + durationMinutes * 60000);
  return eta.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Display
<Text>ETA: {calculateETA(routeInfo.remainingDuration || routeInfo.duration)}</Text>
```

---

## 🚀 Advanced Features

### 1. SMS Notifications

```javascript
const sendSMSUpdate = async (phone, status, eta) => {
  // Using Twilio or similar service
  await fetch('your-sms-api', {
    method: 'POST',
    body: JSON.stringify({
      to: phone,
      message: `🚚 Your Osebo-Shoes order is ${status}. ETA: ${eta}`
    })
  });
};
```

### 2. Push Notifications

```javascript
import * as Notifications from 'expo-notifications';

const sendPushNotification = async (status) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚚 Delivery Update',
      body: `Your order is ${status}`,
    },
    trigger: null, // Send immediately
  });
};
```

### 3. Geofencing (Notify when rider is nearby)

```javascript
const checkProximity = (riderLat, riderLng, customerLat, customerLng) => {
  const distance = calculateDistance(
    { lat: riderLat, lng: riderLng },
    { lat: customerLat, lng: customerLng }
  );
  
  if (distance < 0.5) { // Less than 500m
    Alert.alert('Rider Nearby!', 'Your delivery will arrive in ~5 minutes');
  }
};
```

### 4. Multiple Delivery Stops

```javascript
const calculateMultiStopRoute = async (stops) => {
  // stops = [store, customer1, customer2, ...]
  const coords = stops.map(s => `${s.lng},${s.lat}`).join(';');
  
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full`
  );
  
  return await response.json();
};
```

---

## 🐛 Troubleshooting

### Address Not Found

**Problem**: Geocoding returns no results

**Solution**:
- Make sure address includes "Accra" or "Ghana"
- Try different address format
- Use landmarks (e.g., "Near Accra Mall")

### Route Not Displaying

**Problem**: Polyline not showing on map

**Solution**:
- Check console for errors
- Verify coordinates are valid
- Ensure Polyline component is imported

### Rider Not Moving

**Problem**: Tracking started but rider marker stays still

**Solution**:
- Check `isTracking` state is true
- Verify `routeInfo.coordinates` exists
- Check browser console for errors

### Map Not Loading

**Problem**: Blank map or loading forever

**Solution**:
- Test on web platform first
- Check internet connection
- Verify react-leaflet is installed
- Try opening `test-map.html`

---

## 📊 Analytics & Metrics

Track important delivery metrics:

```javascript
// Average delivery time
SELECT AVG(EXTRACT(EPOCH FROM (delivered_at - picked_up_at))/60) as avg_minutes
FROM delivery_tracking
WHERE status = 'delivered';

// Total deliveries by status
SELECT status, COUNT(*) 
FROM delivery_tracking 
GROUP BY status;

// Longest deliveries
SELECT 
  order_id, 
  total_distance, 
  estimated_duration,
  EXTRACT(EPOCH FROM (delivered_at - picked_up_at))/60 as actual_minutes
FROM delivery_tracking
WHERE status = 'delivered'
ORDER BY actual_minutes DESC
LIMIT 10;
```

---

## 🔐 Security Considerations

1. **Rate Limiting**: Limit geocoding requests to prevent abuse
2. **Authentication**: Ensure only authenticated users can track
3. **RLS Policies**: Database policies prevent unauthorized access
4. **API Keys**: If using paid services, secure your API keys
5. **Data Privacy**: Don't expose exact rider locations to everyone

---

## 💡 Pro Tips

1. **Cache Geocoding**: Save address coordinates to avoid repeated lookups
2. **Optimize Updates**: Don't update too frequently (2-5 seconds is good)
3. **Battery Saving**: On mobile, reduce GPS accuracy when far from destination
4. **Error Handling**: Always have fallback for offline scenarios
5. **Testing**: Test with various addresses and route lengths

---

## 🎯 Roadmap

Future enhancements:

- [ ] Live GPS tracking with rider mobile app
- [ ] Multiple delivery stops optimization
- [ ] Delivery time slot selection
- [ ] Photo proof of delivery
- [ ] Customer signature capture
- [ ] Delivery ratings and feedback
- [ ] Heat map of delivery zones
- [ ] Predictive delivery times based on traffic

---

## 📞 Support

For issues or questions:
- Check the code comments in `DeliveryTracker.js`
- Test with `test-map.html` first
- Review console logs for errors
- Ensure database tables are created

---

## ✨ You're Ready!

Your delivery tracking system is ready to use! 🚚

**Quick Test:**
1. Run `npx expo start --web`
2. Add DeliveryTracker to your app
3. Enter "Osu, Accra" as test address
4. Click "Start Tracking"
5. Watch the magic! ✨

Happy tracking! 🗺️📦
