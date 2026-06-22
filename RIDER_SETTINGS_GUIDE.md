# 📱 Rider WhatsApp Settings Guide

## Overview
Admin can now save the rider's WhatsApp number in Settings, and it will be used automatically when sending delivery details!

---

## 🚀 Setup Steps

### Step 1: Create Settings Table in Supabase
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the SQL file: `create_settings_table.sql`

Or copy/paste this:
```sql
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'text',
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.app_settings (setting_key, setting_value, setting_type, description)
VALUES 
    ('rider_phone_number', '+233241234567', 'text', 'Default delivery rider WhatsApp number'),
    ('store_latitude', '5.6037', 'number', 'Store location latitude'),
    ('store_longitude', '-0.1870', 'number', 'Store location longitude')
ON CONFLICT (setting_key) DO NOTHING;
```

### Step 2: Reload Your App
The app should hot-reload automatically.

### Step 3: Update Rider Number in Settings
1. Login to admin panel
2. Click **"Settings"** in sidebar
3. Enter rider's WhatsApp number (e.g., +233241234567)
4. Update store coordinates if needed
5. Click **"SAVE SETTINGS"**

---

## ✅ How It Works

### **Admin Updates Settings:**
```
Admin → Settings → Enter rider number → Save
```

### **When Sending to Rider:**
```
Admin clicks "Send to Rider"
    ↓
App uses saved rider number from settings
    ↓
WhatsApp opens with rider's number
    ↓
Message pre-filled with delivery details
```

### **Green WhatsApp Icon:**
```
Order status = "Sent to Rider"
    ↓
Green WhatsApp icon appears next to status
    ↓
Admin clicks icon to resend/follow-up
    ↓
Opens WhatsApp with saved rider number
```

---

## 📱 Settings Page Features

### 1. **Rider WhatsApp Number**
- Input field for rider's phone number
- Format: `+233 XX XXX XXXX` or `0XX XXX XXXX`
- Saved to database
- Used automatically for all deliveries

### 2. **Store Location (GPS)**
- Latitude and Longitude inputs
- Default: Madina, Accra (5.6037, -0.1870)
- "View on Google Maps" link to verify location
- Used for delivery routing

### 3. **Save Button**
- Saves all settings to Supabase
- Shows loading state while saving
- Success alert when saved

---

## 🎯 Benefits

✅ **No More Hardcoded Numbers** - Update rider number anytime  
✅ **Multiple Riders** - Can update number for different riders/shifts  
✅ **Centralized Settings** - All app config in one place  
✅ **Easy Updates** - No code changes needed  
✅ **Store Location** - Accurate coordinates for routing  

---

## 📊 Database Schema

```sql
app_settings table:
- id (UUID)
- setting_key (TEXT) - "rider_phone_number", "store_latitude", etc.
- setting_value (TEXT) - The actual value
- setting_type (TEXT) - "text", "number", "boolean"
- description (TEXT) - What the setting is for
- updated_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

---

## 🔧 Phone Number Format

The app accepts multiple formats:

| Format Entered | Converted To |
|----------------|--------------|
| +233241234567 | 233241234567 |
| 0241234567 | 233241234567 |
| 233241234567 | 233241234567 |

All formats work with WhatsApp!

---

## 🐛 Troubleshooting

### Issue: Settings not saving
**Solution:** 
1. Check if SQL migration ran successfully
2. Verify Supabase connection
3. Check browser console for errors

### Issue: Old number still being used
**Solution:**
1. Make sure you clicked "SAVE SETTINGS"
2. Reload the admin panel
3. Check settings loaded correctly in console

### Issue: WhatsApp opens browser instead of app
**Solution:**
1. This is normal - browser asks to open WhatsApp
2. Click "Open WhatsApp" button in popup
3. If WhatsApp not installed, install it first

---

## 💡 Future Enhancements

1. **Multiple Riders**
   - Add rider management system
   - Assign specific rider to each order
   - Track rider availability

2. **Rider Zones**
   - Different riders for different delivery areas
   - Auto-assign based on delivery location

3. **Rider App**
   - Separate app for riders
   - Real-time location tracking
   - Delivery confirmation

---

## ✅ Testing Checklist

- [ ] SQL migration executed successfully
- [ ] Settings page loads in admin panel
- [ ] Can update rider phone number
- [ ] Can save settings
- [ ] "Send to Rider" button uses saved number
- [ ] Green WhatsApp icon uses saved number
- [ ] WhatsApp opens with correct number
- [ ] Message includes delivery details

---

**All set! No more hardcoded rider numbers!** 🎉📱
