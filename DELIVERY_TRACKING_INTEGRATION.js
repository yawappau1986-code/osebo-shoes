/**
 * DELIVERY TRACKING INTEGRATION EXAMPLES
 * 
 * Copy these code snippets into your App.js to add delivery tracking
 */

// ============================================
// STEP 1: Import at the top of App.js
// ============================================

import DeliveryTracker from './components/DeliveryTracker';


// ============================================
// STEP 2: Add state (inside App function)
// ============================================

const [showDeliveryTracking, setShowDeliveryTracking] = useState(false);
const [trackingOrderId, setTrackingOrderId] = useState(null);


// ============================================
// STEP 3: Add "Track Delivery" button in your Orders/Cart
// ============================================

// Example 1: In Shopping Cart after order placed
<Pressable
  style={styles.trackDeliveryButton}
  onPress={() => {
    setTrackingOrderId(orderId);
    setShowDeliveryTracking(true);
  }}
>
  <FontAwesome5 name="truck" size={18} color="#FFFFFF" />
  <Text style={styles.trackDeliveryButtonText}>Track My Delivery</Text>
</Pressable>

// Example 2: In Order History list
{orders.map((order) => (
  <View key={order.id} style={styles.orderCard}>
    <Text>Order #{order.id}</Text>
    <Text>Status: {order.status}</Text>
    
    {order.status === 'shipped' && (
      <Pressable
        onPress={() => {
          setTrackingOrderId(order.id);
          setShowDeliveryTracking(true);
        }}
      >
        <Text style={styles.trackLink}>🚚 Track Delivery</Text>
      </Pressable>
    )}
  </View>
))}


// ============================================
// STEP 4: Add Delivery Tracking Modal
// ============================================

{/* Delivery Tracking Modal */}
<Modal
  visible={showDeliveryTracking}
  animationType="slide"
  onRequestClose={() => setShowDeliveryTracking(false)}
>
  <DeliveryTracker
    orderId={trackingOrderId}
    storeLat={5.6037}  // Your store's latitude
    storeLng={-0.1870} // Your store's longitude
    onClose={() => setShowDeliveryTracking(false)}
  />
</Modal>


// ============================================
// STEP 5: Add styles
// ============================================

const styles = StyleSheet.create({
  // ... your existing styles ...

  trackDeliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A0404',
    padding: 14,
    borderRadius: 8,
    margin: 16,
    gap: 10,
  },
  trackDeliveryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  trackLink: {
    color: '#4A0404',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});


// ============================================
// FULL EXAMPLE: Order Confirmation Screen
// ============================================

function OrderConfirmation({ orderId, totalAmount }) {
  const [showTracking, setShowTracking] = useState(false);

  return (
    <>
      <View style={styles.confirmationContainer}>
        <FontAwesome5 name="check-circle" size={64} color="#28A745" />
        <Text style={styles.confirmationTitle}>Order Confirmed! 🎉</Text>
        <Text style={styles.confirmationText}>
          Your order #{orderId} has been placed successfully.
        </Text>
        <Text style={styles.confirmationAmount}>
          Total: GH₵ {totalAmount.toFixed(2)}
        </Text>

        {/* Track Delivery Button */}
        <Pressable
          style={styles.primaryButton}
          onPress={() => setShowTracking(true)}
        >
          <FontAwesome5 name="truck" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Track My Delivery</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigateToHome()}
        >
          <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
        </Pressable>
      </View>

      {/* Tracking Modal */}
      <Modal visible={showTracking} animationType="slide">
        <DeliveryTracker
          orderId={orderId}
          storeLat={5.6037}
          storeLng={-0.1870}
          onClose={() => setShowTracking(false)}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  confirmationContainer: {
    padding: 24,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B1C1C',
    marginTop: 16,
    marginBottom: 8,
  },
  confirmationText: {
    fontSize: 16,
    color: '#5F5E5F',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmationAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A0404',
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A0404',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
    gap: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4A0404',
    fontSize: 16,
    fontWeight: '600',
  },
});


// ============================================
// DATABASE INTEGRATION EXAMPLE
// ============================================

// Save delivery address and create tracking
const setupDelivery = async (orderId, deliveryAddress, coordinates) => {
  const { data: user } = await supabase.auth.getUser();
  
  // 1. Save delivery address
  const { data: address, error: addressError } = await supabase
    .from('delivery_addresses')
    .insert({
      order_id: orderId,
      user_id: user.id,
      full_address: deliveryAddress,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      city: 'Accra',
      phone_number: user.phone,
    })
    .select()
    .single();

  if (addressError) {
    console.error('Error saving address:', addressError);
    return null;
  }

  // 2. Calculate route (simplified)
  const storeLocation = { lat: 5.6037, lng: -0.1870 };
  const distance = calculateDistance(storeLocation, coordinates);
  const estimatedTime = Math.ceil(distance * 3); // 3 min per km

  // 3. Create tracking entry
  const { data: tracking, error: trackingError } = await supabase
    .from('delivery_tracking')
    .insert({
      order_id: orderId,
      delivery_address_id: address.id,
      status: 'pending',
      total_distance: distance,
      estimated_duration: estimatedTime,
    })
    .select()
    .single();

  if (trackingError) {
    console.error('Error creating tracking:', trackingError);
    return null;
  }

  return { address, tracking };
};

// Helper: Calculate distance
const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


// ============================================
// REAL-TIME TRACKING WITH SUPABASE
// ============================================

// Subscribe to delivery updates
const useDeliveryTracking = (orderId) => {
  const [tracking, setTracking] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    // Initial fetch
    const fetchTracking = async () => {
      const { data } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', orderId)
        .single();
      
      setTracking(data);
    };

    fetchTracking();

    // Real-time subscription
    const subscription = supabase
      .channel(`delivery:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delivery_tracking',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setTracking(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  return tracking;
};

// Usage in component
function DeliveryStatus({ orderId }) {
  const tracking = useDeliveryTracking(orderId);

  if (!tracking) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.statusCard}>
      <Text style={styles.statusTitle}>Delivery Status</Text>
      <Text style={styles.statusValue}>{tracking.status}</Text>
      
      {tracking.current_latitude && (
        <>
          <Text>Distance: {tracking.remaining_distance || tracking.total_distance} km</Text>
          <Text>ETA: {tracking.remaining_duration || tracking.estimated_duration} min</Text>
        </>
      )}
      
      <Pressable onPress={() => openTracker(orderId)}>
        <Text style={styles.link}>View on Map →</Text>
      </Pressable>
    </View>
  );
}


// ============================================
// NOTIFICATION INTEGRATION
// ============================================

// Send notification when status changes
const sendDeliveryNotification = async (userId, status, eta) => {
  const messages = {
    assigned: '🚚 A rider has been assigned to your order!',
    picked_up: '📦 Your order has been picked up and is on the way!',
    in_transit: `🛣️ Your order is in transit. ETA: ${eta} minutes`,
    nearby: '📍 Rider is nearby! Your order will arrive soon.',
    delivered: '✅ Your order has been delivered. Enjoy your shoes! 👟',
  };

  // Could use Expo notifications, SMS, or email
  await sendPushNotification(userId, {
    title: 'Osebo-Shoes Delivery Update',
    body: messages[status] || 'Your delivery status has been updated.',
  });
};


// ============================================
// TIPS FOR CUSTOMIZATION
// ============================================

/**
 * 1. STORE LOCATION
 *    Change storeLat and storeLng to your actual store coordinates
 * 
 * 2. UPDATE FREQUENCY
 *    Adjust interval in DeliveryTracker.js (default 2 seconds)
 * 
 * 3. MAP STYLE
 *    Change TileLayer URL for different map appearance
 * 
 * 4. CUSTOM MARKERS
 *    Add custom icons for store, rider, and customer
 * 
 * 5. NOTIFICATIONS
 *    Add SMS/Push notifications for status updates
 * 
 * 6. MULTIPLE STORES
 *    Pass different store coordinates based on order
 * 
 * 7. RIDER APP
 *    Create separate app for riders to update location
 */


// ============================================
// TESTING
// ============================================

// Test with sample data
const testDelivery = () => {
  setTrackingOrderId('test-order-123');
  setShowDeliveryTracking(true);
  
  // Component will use default store location
  // Enter "Osu, Accra" as test address
};

// Add test button
<Pressable onPress={testDelivery}>
  <Text>🧪 Test Delivery Tracking</Text>
</Pressable>
