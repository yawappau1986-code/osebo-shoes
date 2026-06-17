# Leaflet Map Integration for Osebo-Shoes

This guide explains how to use the Leaflet map integration in your Osebo-Shoes app.

## 📦 Installation

The required packages have been installed:
- `react-leaflet` - React components for Leaflet
- `leaflet` - The core mapping library

## 🗺️ MapComponent Usage

### Basic Usage

```javascript
import MapComponent from './components/MapComponent';

// Simple map with default store locations
<MapComponent />
```

### Advanced Usage with Custom Markers

```javascript
import MapComponent from './components/MapComponent';

const customMarkers = [
  {
    lat: 5.6037,
    lng: -0.1870,
    title: 'Delivery Location',
    description: 'Customer delivery address'
  }
];

<MapComponent
  center={[5.6037, -0.1870]}  // Center map on Accra
  zoom={15}                    // Zoom level (1-18)
  markers={customMarkers}      // Array of custom markers
  showStoreLocations={true}    // Show default store locations
  height={500}                 // Map height in pixels
  onMarkerClick={(marker) => {
    console.log('Marker clicked:', marker);
  }}
/>
```

## 🎯 Integration Examples

### 1. Store Locator Page

Add a store locator section to your app:

```javascript
// In App.js or a new StoreLocator component
import MapComponent from './components/MapComponent';

function StoreLocatorSection() {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Find Our Stores</Text>
      <MapComponent
        showStoreLocations={true}
        height={400}
        onMarkerClick={(marker) => {
          alert(`${marker.title}\n${marker.description}`);
        }}
      />
    </View>
  );
}
```

### 2. Delivery Address Map

Show customer delivery location:

```javascript
import { useState } from 'react';
import MapComponent from './components/MapComponent';

function CheckoutWithMap() {
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const handleLocationSelect = (location) => {
    setDeliveryLocation(location);
    // Save to order details
  };

  return (
    <View>
      <Text>Select Delivery Location</Text>
      <MapComponent
        markers={deliveryLocation ? [deliveryLocation] : []}
        showStoreLocations={false}
        height={300}
      />
    </View>
  );
}
```

### 3. Contact Page with Map

```javascript
function ContactPage() {
  return (
    <ScrollView>
      <Text style={styles.title}>Visit Us</Text>
      <MapComponent
        center={[5.6037, -0.1870]}
        zoom={14}
        showStoreLocations={true}
        height={400}
      />
      <View style={styles.contactInfo}>
        <Text>📞 Phone: +233 XX XXX XXXX</Text>
        <Text>📧 Email: info@osebo-shoes.com</Text>
      </View>
    </ScrollView>
  );
}
```

## 🎨 Customization

### Adding More Store Locations

Edit `MapComponent.js` and update the `defaultStoreLocations` array:

```javascript
const defaultStoreLocations = [
  {
    lat: 5.6037,
    lng: -0.1870,
    title: 'Osebo-Shoes Main Store',
    description: 'Visit our flagship store in Accra',
  },
  {
    lat: 5.5560,
    lng: -0.1969,
    title: 'Osebo-Shoes Osu Branch',
    description: 'Find us in Osu for premium footwear',
  },
  // Add more stores here
  {
    lat: YOUR_LATITUDE,
    lng: YOUR_LONGITUDE,
    title: 'Your Store Name',
    description: 'Store description',
  },
];
```

### Custom Map Tiles

You can change the map appearance by modifying the TileLayer URL:

```javascript
// Dark mode map
url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

// Light mode map
url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

// Satellite view (requires API key from Mapbox)
url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
```

## 📱 Platform Support

- **Web**: Full interactive map with Leaflet
- **iOS/Android**: Shows store list with addresses (native map libraries can be added later)

## 🔧 Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | `[number, number]` | `[5.6037, -0.1870]` | Map center coordinates [lat, lng] |
| `zoom` | `number` | `13` | Initial zoom level (1-18) |
| `markers` | `array` | `[]` | Array of marker objects |
| `onMarkerClick` | `function` | `null` | Callback when marker is clicked |
| `height` | `number\|string` | `400` | Map container height |
| `showStoreLocations` | `boolean` | `true` | Show default store markers |

## 🌍 Finding Coordinates

To find coordinates for your stores:

1. Go to [Google Maps](https://maps.google.com)
2. Right-click on the location
3. Click on the coordinates to copy them
4. Format as `[latitude, longitude]`

Example: Accra Mall coordinates are `[5.6037, -0.1870]`

## 🚀 Quick Integration to App.js

Add a "Store Locator" section to your main app:

```javascript
// At the top of App.js
import MapComponent from './components/MapComponent';

// Inside your render/return, add this section:
<View style={styles.storeLocatorSection}>
  <Text style={styles.sectionHeader}>🗺️ Find Our Stores</Text>
  <MapComponent
    showStoreLocations={true}
    height={450}
    onMarkerClick={(marker) => {
      alert(`${marker.title}\n\n${marker.description}`);
    }}
  />
</View>

// Add styles:
const styles = StyleSheet.create({
  // ... your existing styles
  storeLocatorSection: {
    padding: 16,
    backgroundColor: '#FAF9F9',
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A0404',
    marginBottom: 16,
    textAlign: 'center',
  },
});
```

## 🎯 Next Steps

1. **Add to Footer**: Include map in footer with contact info
2. **Checkout Integration**: Let customers select delivery location
3. **Store Details**: Click marker to show store hours, phone, etc.
4. **Directions**: Add "Get Directions" button linking to Google Maps
5. **Track Order**: Show delivery route on map

## 📝 Notes

- Map only works on web platform out of the box
- For native apps, consider adding `react-native-maps` later
- Leaflet CSS is loaded automatically on web
- No API key required for OpenStreetMap tiles
- For production, consider upgrading to paid tile services for better performance

## 🐛 Troubleshooting

**Map not showing?**
- Check browser console for errors
- Ensure you're testing on web (expo start --web)
- Verify internet connection (tiles load from CDN)

**Markers not appearing?**
- Verify coordinates are in [lat, lng] format
- Check that marker array is properly formatted
- Use console.log to debug marker data

**Performance issues?**
- Reduce number of markers
- Increase zoom level to focus on smaller area
- Consider marker clustering for many markers
