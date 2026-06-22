# 🏍️ Multiple Riders System - Implementation Guide

## Overview
Your app now supports multiple delivery riders! Admin can manage riders and assign specific riders to each order.

---

## ✅ What Was Implemented

### 1. **Database Schema** (`create_riders_table.sql`)
- `riders` table with rider info (name, phone, active status)
- Added `rider_id`, `rider_name`, `rider_assigned_at` to orders table
- Sample riders pre-loaded

### 2. **Riders Management** (Settings Page - Riders Tab)
- View all riders
- Add new riders
- Activate/deactivate riders
- Delete riders

### 3. **Rider Assignment** (Orders Page)
- Dropdown to select rider for each order
- "Send to [Rider Name]" button
- Shows assigned rider name
- WhatsApp uses selected rider's number

---

## 🚀 Setup Steps

### Step 1: Run SQL Migration
In **Supabase SQL Editor**, run:
```sql
-- File: create_riders_table.sql
```

This creates:
- `riders` table
- Adds rider columns to `orders` table
- Inserts 3 sample riders

### Step 2: Add Riders Tab to Settings

The Settings page needs a tab switcher. Add this to Settings section in App.js around line 2350:

```javascript
{/* SETTINGS */}
{(activeAdminTab === 'Settings') && (
<View style={styles.adminDashboardSection}>
  {/* Settings Tab Switcher */}
  <View style={{flexDirection: 'row', gap: 12, marginBottom: 24}}>
    <Pressable
      onPress={() => setSettingsTab('general')}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: settingsTab === 'general' ? palette.oxblood : '#F5F5F5',
      }}
    >
      <Text style={{
        color: settingsTab === 'general' ? '#FFF' : palette.charcoal,
        fontWeight: '600',
      }}>General</Text>
    </Pressable>
    
    <Pressable
      onPress={() => setSettingsTab('riders')}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: settingsTab === 'riders' ? palette.oxblood : '#F5F5F5',
      }}
    >
      <Text style={{
        color: settingsTab === 'riders' ? '#FFF' : palette.charcoal,
        fontWeight: '600',
      }}>Riders</Text>
    </Pressable>
  </View>

  {/* General Settings Tab */}
  {settingsTab === 'general' && (
    <>
      {/* Existing Rider Phone and Store Location sections */}
    </>
  )}

  {/* Riders Management Tab */}
  {settingsTab === 'riders' && (
    <View>
      <Text style={styles.adminMainSubtitle}>Delivery Riders</Text>
      
      {/* Add Rider Button */}
      <Pressable
        onPress={() => setAddRiderModalVisible(true)}
        style={{
          backgroundColor: palette.oxblood,
          padding: 14,
          borderRadius: 8,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 20,
        }}
      >
        <FontAwesome5 name="plus" size={14} color="#FFFFFF" />
        <Text style={{color: '#FFFFFF', fontSize: 14, fontWeight: '700'}}>
          ADD NEW RIDER
        </Text>
      </Pressable>

      {/* Riders List */}
      {ridersLoading ? (
        <ActivityIndicator size="large" color={palette.oxblood} />
      ) : riders.length === 0 ? (
        <Text style={{color: '#888', textAlign: 'center', padding: 20}}>
          No riders added yet. Click "Add New Rider" to get started.
        </Text>
      ) : (
        <View style={{gap: 12}}>
          {riders.map(rider => (
            <View key={rider.id} style={{
              backgroundColor: '#FFFFFF',
              padding: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: rider.is_active ? 'rgba(27,28,28,0.08)' : '#FFE5E5',
            }}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <View style={{flex: 1}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4}}>
                    <Text style={{fontSize: 16, fontWeight: '700', color: palette.charcoal}}>
                      {rider.name}
                    </Text>
                    <View style={{
                      backgroundColor: rider.is_active ? '#D4EDDA' : '#FFE5E5',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}>
                      <Text style={{
                        fontSize: 10,
                        fontWeight: '600',
                        color: rider.is_active ? '#155724' : '#D32F2F',
                      }}>
                        {rider.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={{fontSize: 14, color: palette.secondary, marginBottom: 4}}>
                    📱 {rider.phone}
                  </Text>
                  
                  {rider.notes && (
                    <Text style={{fontSize: 12, color: '#888', fontStyle: 'italic'}}>
                      {rider.notes}
                    </Text>
                  )}
                </View>

                <View style={{flexDirection: 'row', gap: 8}}>
                  <Pressable
                    onPress={() => toggleRiderStatus(rider.id, rider.is_active)}
                    style={{
                      backgroundColor: rider.is_active ? '#FFF3CD' : '#D4EDDA',
                      padding: 8,
                      borderRadius: 6,
                    }}
                  >
                    <FontAwesome5
                      name={rider.is_active ? 'pause' : 'play'}
                      size={12}
                      color={rider.is_active ? '#856404' : '#155724'}
                    />
                  </Pressable>
                  
                  <Pressable
                    onPress={() => deleteRider(rider.id, rider.name)}
                    style={{
                      backgroundColor: '#FFE5E5',
                      padding: 8,
                      borderRadius: 6,
                    }}
                  >
                    <FontAwesome5 name="trash" size={12} color="#D32F2F" />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )}
</View>
)}
```

### Step 3: Add Rider Selection to Orders

In the Orders section, add rider dropdown before the "Send to Rider" button (around line 2180):

```javascript
{/* Rider Selection Dropdown */}
{(String(order.status).toLowerCase() === 'processing' || 
  String(order.status).toLowerCase() === 'sent to rider' || 
  String(order.status).toLowerCase() === 'shipped') && (
  <View style={{marginTop: 12, width: '100%'}}>
    <Text style={{fontSize: 11, fontWeight: '600', color: palette.secondary, marginBottom: 6}}>
      ASSIGN RIDER
    </Text>
    <View style={{
      backgroundColor: '#FAF9F9',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      marginBottom: 8,
    }}>
      <Picker
        selectedValue={order.rider_id || selectedRiderForOrder[order.id] || ''}
        onValueChange={(riderId) => {
          setSelectedRiderForOrder(prev => ({...prev, [order.id]: riderId}));
          if (riderId) {
            assignRiderToOrder(order.id, riderId);
          }
        }}
        style={{height: 50, color: palette.charcoal}}
      >
        <Picker.Item label="Select a rider..." value="" />
        {riders.filter(r => r.is_active).map(rider => (
          <Picker.Item 
            key={rider.id} 
            label={`${rider.name} (${rider.phone})`} 
            value={rider.id} 
          />
        ))}
      </Picker>
    </View>
    
    {order.rider_name && (
      <Text style={{fontSize: 11, color: '#25D366', marginBottom: 8}}>
        ✓ Assigned to: {order.rider_name}
      </Text>
    )}
  </View>
)}
```

### Step 4: Update Send to Rider Button

Update the SendToDriverButton to use selected rider's phone:

```javascript
<SendToDriverButton
  order={{...}}
  deliveryInfo={{...}}
  driverPhone={
    order.rider_id 
      ? riders.find(r => r.id === order.rider_id)?.phone 
      : riders[0]?.phone || riderPhoneNumber
  }
  onSent={(phone, link) => {
    console.log('WhatsApp message sent for order:', order.id);
    if (String(order.status).toLowerCase() === 'processing') {
      updateOrderStatus(order.id, 'Sent to Rider');
    }
  }}
/>
```

---

## 📊 Database Schema

### `riders` Table:
```
id               UUID (primary key)
name             TEXT
phone            TEXT (unique)
is_active        BOOLEAN
notes            TEXT
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```

### `orders` Table (new columns):
```
rider_id            UUID (references riders.id)
rider_name          TEXT (snapshot)
rider_assigned_at   TIMESTAMPTZ
```

---

## 🎯 User Flow

### Admin Manages Riders:
```
1. Admin → Settings → Riders tab
2. Click "Add New Rider"
3. Enter name, phone, notes
4. Rider appears in list
5. Can activate/deactivate or delete riders
```

### Admin Assigns Rider to Order:
```
1. Admin → Orders tab
2. See order with "Processing" status
3. Select rider from dropdown
4. Rider automatically assigned
5. Click "Send to [Rider Name]"
6. WhatsApp opens with that rider's number
7. Status updates to "Sent to Rider"
```

---

## 🔧 Additional Setup Needed

Add these state variables at the top of App.js (around line 460):

```javascript
const [settingsTab, setSettingsTab] = useState('general'); // 'general' or 'riders'
```

Import Picker component:
```javascript
import { Picker } from '@react-native-picker/picker';
```

Install picker if needed:
```bash
npm install @react-native-picker/picker
```

---

## ✅ Testing Checklist

- [ ] SQL migration executed successfully
- [ ] 3 sample riders appear in Settings → Riders tab
- [ ] Can add new rider
- [ ] Can activate/deactivate rider
- [ ] Can delete rider
- [ ] Rider dropdown appears in orders
- [ ] Can select rider for order
- [ ] "Send to Rider" uses selected rider's phone
- [ ] WhatsApp opens with correct rider number
- [ ] Assigned rider name shows on order

---

## 🚀 Future Enhancements

1. **Edit Rider**: Allow editing rider details
2. **Rider Stats**: Show number of deliveries per rider
3. **Auto-Assignment**: Auto-select available rider
4. **Zone-Based**: Assign rider based on delivery area
5. **Rider App**: Separate app for riders to manage deliveries

---

**Your multi-rider delivery system is ready!** 🎉🏍️
