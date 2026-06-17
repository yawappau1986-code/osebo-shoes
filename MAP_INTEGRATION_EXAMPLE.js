/**
 * MAP INTEGRATION EXAMPLE
 * 
 * Copy and paste these code snippets into your App.js to add map functionality
 */

// ============================================
// STEP 1: Add imports at the top of App.js
// ============================================

import MapComponent from './components/MapComponent';
import StoreLocator from './components/StoreLocator';


// ============================================
// STEP 2: Add state for map modal (inside App function)
// ============================================

const [showStoreLocator, setShowStoreLocator] = useState(false);


// ============================================
// STEP 3: Add a "Find Stores" button in your navigation or footer
// ============================================

// Option A: Simple button anywhere in your UI
<Pressable
  style={styles.findStoresButton}
  onPress={() => setShowStoreLocator(true)}
>
  <FontAwesome5 name="map-marker-alt" size={20} color="#FFFFFF" />
  <Text style={styles.findStoresButtonText}>Find Our Stores</Text>
</Pressable>


// ============================================
// STEP 4: Add Store Locator Modal (before closing View/ScrollView)
// ============================================

{/* Store Locator Modal */}
<Modal
  visible={showStoreLocator}
  animationType="slide"
  onRequestClose={() => setShowStoreLocator(false)}
>
  <StoreLocator onClose={() => setShowStoreLocator(false)} />
</Modal>


// ============================================
// STEP 5: Add button styles to your StyleSheet
// ============================================

const styles = StyleSheet.create({
  // ... your existing styles ...

  findStoresButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A0404',
    padding: 14,
    borderRadius: 8,
    margin: 16,
    gap: 10,
  },
  findStoresButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});


// ============================================
// ALTERNATIVE: Simple inline map in a section
// ============================================

// Just add this anywhere in your render:
<View style={styles.mapSection}>
  <Text style={styles.sectionTitle}>🗺️ Find Us</Text>
  <MapComponent
    showStoreLocations={true}
    height={400}
    onMarkerClick={(marker) => {
      alert(`${marker.title}\n${marker.description}`);
    }}
  />
</View>

// With these styles:
const styles = StyleSheet.create({
  // ... existing styles ...

  mapSection: {
    padding: 16,
    backgroundColor: '#FAF9F9',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A0404',
    marginBottom: 16,
    textAlign: 'center',
  },
});


// ============================================
// FULL INTEGRATION EXAMPLE
// ============================================

// Here's a complete example of how to add it to your footer section:

function Footer() {
  const [showStoreLocator, setShowStoreLocator] = useState(false);

  return (
    <>
      <View style={styles.footer}>
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>ABOUT OSEBO-SHOES</Text>
          <Text style={styles.footerLink}>Our Story</Text>
          <Text style={styles.footerLink}>Careers</Text>
          <Text style={styles.footerLink}>Press</Text>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>CUSTOMER SERVICE</Text>
          <Text style={styles.footerLink}>Contact Us</Text>
          <Text style={styles.footerLink}>Shipping Info</Text>
          <Text style={styles.footerLink}>Returns</Text>
          <Pressable onPress={() => setShowStoreLocator(true)}>
            <Text style={[styles.footerLink, styles.footerLinkHighlight]}>
              🗺️ Find Our Stores
            </Text>
          </Pressable>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>CONNECT WITH US</Text>
          <Text style={styles.footerLink}>Facebook</Text>
          <Text style={styles.footerLink}>Instagram</Text>
          <Text style={styles.footerLink}>Twitter</Text>
        </View>
      </View>

      {/* Store Locator Modal */}
      <Modal
        visible={showStoreLocator}
        animationType="slide"
        onRequestClose={() => setShowStoreLocator(false)}
      >
        <StoreLocator onClose={() => setShowStoreLocator(false)} />
      </Modal>
    </>
  );
}

// Styles for the above:
const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#202222',
    padding: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  footerSection: {
    marginBottom: 24,
    minWidth: 200,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  footerLink: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  footerLinkHighlight: {
    color: '#FFD700',
    fontWeight: '600',
  },
});


// ============================================
// CUSTOMIZATION EXAMPLES
// ============================================

// Example 1: Map with custom center and zoom
<MapComponent
  center={[5.6537, -0.1658]}  // Accra Mall
  zoom={15}
  height={350}
/>

// Example 2: Map with custom markers (e.g., delivery addresses)
const deliveryAddresses = [
  {
    lat: 5.6037,
    lng: -0.1870,
    title: 'Customer Location',
    description: '123 Main Street, Accra'
  }
];

<MapComponent
  markers={deliveryAddresses}
  showStoreLocations={false}  // Don't show default stores
  height={300}
/>

// Example 3: Map with click handler
<MapComponent
  onMarkerClick={(marker) => {
    console.log('Clicked:', marker);
    // Navigate to store detail page
    // Or show more info in a modal
  }}
/>


// ============================================
// TIPS
// ============================================

/**
 * 1. The map works best on web (expo start --web)
 * 2. On mobile, it shows a store list instead
 * 3. Customize store locations in components/MapComponent.js
 * 4. Find coordinates using Google Maps (right-click -> copy coordinates)
 * 5. Add more features like:
 *    - Store hours
 *    - Store photos
 *    - Call/email buttons
 *    - Directions integration
 *    - Favorite stores
 */
