# 🚀 Quick Start: Add Map to Your App in 5 Minutes

## Step 1: Test the Map (30 seconds)

Open `test-map.html` in your browser to see the map working:

```bash
# Just double-click test-map.html or open in browser
```

You should see an interactive map with 3 store locations! ✅

---

## Step 2: Add to Your App (2 minutes)

### Option A: Simple Map in Footer

Open `App.js` and add this at the **top** with other imports:

```javascript
import MapComponent from './components/MapComponent';
```

Then add this anywhere in your JSX (recommended: near footer):

```javascript
{/* Store Locator Section */}
<View style={styles.mapSection}>
  <Text style={styles.mapTitle}>🗺️ Find Our Stores</Text>
  <MapComponent
    showStoreLocations={true}
    height={400}
  />
</View>
```

And add these styles:

```javascript
const styles = StyleSheet.create({
  // ... your existing styles ...
  
  mapSection: {
    padding: 16,
    backgroundColor: '#FAF9F9',
    marginTop: 24,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A0404',
    marginBottom: 16,
    textAlign: 'center',
  },
});
```

### Option B: Full Store Locator Modal (Recommended)

**Step 1:** Add imports at top of App.js:

```javascript
import MapComponent from './components/MapComponent';
import StoreLocator from './components/StoreLocator';
```

**Step 2:** Add state inside your App function:

```javascript
const [showStoreLocator, setShowStoreLocator] = useState(false);
```

**Step 3:** Add a button in your footer or navigation:

```javascript
<Pressable
  style={styles.findStoresButton}
  onPress={() => setShowStoreLocator(true)}
>
  <FontAwesome5 name="map-marker-alt" size={18} color="#FFFFFF" />
  <Text style={styles.findStoresButtonText}>Find Our Stores</Text>
</Pressable>
```

**Step 4:** Add the modal (before the last closing tag):

```javascript
{/* Store Locator Modal */}
<Modal
  visible={showStoreLocator}
  animationType="slide"
  onRequestClose={() => setShowStoreLocator(false)}
>
  <StoreLocator onClose={() => setShowStoreLocator(false)} />
</Modal>
```

**Step 5:** Add button styles:

```javascript
const styles = StyleSheet.create({
  // ... existing styles ...
  
  findStoresButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A0404',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  findStoresButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## Step 3: Run and Test (1 minute)

```bash
npx expo start --web
```

Press `w` to open in browser, and you should see your map! 🎉

---

## Step 4: Customize Store Locations (1 minute)

Edit `components/MapComponent.js` around line 47:

```javascript
const defaultStoreLocations = [
  {
    lat: 5.6037,        // Your actual latitude
    lng: -0.1870,       // Your actual longitude
    title: 'Your Store Name',
    description: 'Your store description',
  },
  // Add more stores...
];
```

### How to Get Coordinates:

1. Go to https://maps.google.com
2. Right-click on your store location
3. Click the coordinates to copy (e.g., "5.6037, -0.1870")
4. Use: `lat: 5.6037, lng: -0.1870`

---

## 🎯 Where to Add the Map

### Recommended Locations:

1. **Footer Section** (most common)
   - Shows map on every page
   - Easy for customers to find stores

2. **Contact Page**
   - Dedicated store locator page
   - Include full store details

3. **Navigation Menu**
   - "Find Stores" button in menu
   - Opens modal with map

4. **Checkout Page**
   - Show nearby stores
   - "Pick up in store" option

---

## 📱 What You Get

- ✅ Interactive map on web
- ✅ Store list on mobile
- ✅ Click markers to see details
- ✅ Get directions to stores
- ✅ Zoom and pan controls
- ✅ Fully responsive

---

## 🎨 Customization Tips

### Change Map Colors

Edit `MapComponent.js` TileLayer URL:

```javascript
// Dark theme
url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

// Light theme
url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
```

### Adjust Map Height

```javascript
<MapComponent height={300} />  // Smaller
<MapComponent height={600} />  // Larger
```

### Hide Default Stores

```javascript
<MapComponent showStoreLocations={false} />
```

### Change Initial Center/Zoom

```javascript
<MapComponent
  center={[YOUR_LAT, YOUR_LNG]}
  zoom={15}  // Higher = more zoomed in
/>
```

---

## 🐛 Troubleshooting

### Map not showing?

✅ **Solution 1:** Make sure you're on web
```bash
npx expo start --web
```

✅ **Solution 2:** Check browser console (F12) for errors

✅ **Solution 3:** Verify imports are correct

### Blank white box?

✅ Check that MapComponent is imported
✅ Verify height prop is set
✅ Test with `test-map.html` first

### Can't see on phone?

✅ Map shows store list on mobile (by design)
✅ For native maps, need additional setup

---

## 📚 Full Documentation

- **Complete Guide**: `LEAFLET_MAP_INTEGRATION.md`
- **Code Examples**: `MAP_INTEGRATION_EXAMPLE.js`
- **Setup Status**: `MAP_SETUP_COMPLETE.md`
- **Test Page**: `test-map.html`

---

## 🎉 You're Done!

You now have a working map integration! Test it, customize it, and deploy it.

### Next Steps:

1. ✅ Test with `test-map.html`
2. ✅ Add MapComponent to App.js
3. ✅ Run `npx expo start --web`
4. ✅ Customize store locations
5. ✅ Push to GitHub
6. ✅ Deploy to Netlify

Happy mapping! 🗺️✨
