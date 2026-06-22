# 🌙 Dark Mode - Quick Start Guide

## Where to Find the Toggle?

### Location: Account Modal Header

```
┌─────────────────────────────────────────┐
│  My Account              [🌙 Dark]  [✕] │  ← TOGGLE IS HERE!
│  user@email.com                          │
├─────────────────────────────────────────┤
│                                          │
│  Order History                           │
│  ┌────────────────────────────────────┐ │
│  │ Order #ABC123                      │ │
│  │ Jan 15, 2024                       │ │
│  └────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

---

## 3 Steps to Enable Dark Mode

### Step 1: Open Your Account
- Tap the **bag icon** in header → Sign in if needed
- After signing in, tap your **account name/email** in the header

### Step 2: Find the Toggle
- Account modal opens
- Look at the **top right** of the modal header
- You'll see a button with a **moon icon** (🌙) and text "Dark"

### Step 3: Tap the Toggle
- Tap the moon button
- **Instantly**, the entire app switches to dark mode
- The button now shows a **sun icon** (☀️) and text "Light"
- Tap again to switch back

---

## What Happens?

### Before (Light Mode)
```
┌─────────────────────────────────────────┐
│ 💼 BAG                        USD  🛒   │  ← White header
├─────────────────────────────────────────┤
│                                          │
│  [Sneakers] [Boots] [Sandals] [Heels]  │  ← White chips
│                                          │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  Product 1  │  │  Product 2  │      │  ← White cards
│  │  $150.00    │  │  $180.00    │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
```

### After (Dark Mode)
```
┌─────────────────────────────────────────┐
│ 💼 BAG                        USD  🛒   │  ← Dark header
├─────────────────────────────────────────┤
│                                          │
│  [Sneakers] [Boots] [Sandals] [Heels]  │  ← Dark chips
│                                          │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  Product 1  │  │  Product 2  │      │  ← Dark cards
│  │  $150.00    │  │  $180.00    │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
```

---

## What Changes Color?

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | Off-white | Soft black |
| Cards | Pure white | Dark gray |
| Text | Dark gray | Light gray |
| Prices | Dark red | Soft red |

---

## Works On

✅ Shopping page (all products)  
✅ Category chips  
✅ Search bar  
✅ Cart modal  
✅ Checkout page  
✅ Account page  
✅ Product details  

---

## Doesn't Affect

❌ Admin dashboard (separate dark mode coming later)  
❌ Hero carousel (already dark)  

---

## No Persistence Yet

⚠️ **Note**: Your dark mode choice **resets** when you close/restart the app.  
This is normal! We haven't added storage yet.

To make it permanent, we need to add AsyncStorage (optional future enhancement).

---

## Quick Test

1. **Run app**: `npx expo start`
2. **Sign in**: Use your account
3. **Open account**: Tap your name
4. **Toggle**: Tap moon/sun button
5. **Navigate**: Browse products, open cart, view details
6. **Toggle back**: Tap sun button to return to light mode

---

## Troubleshooting

### Can't find the toggle?
→ Make sure you're **signed in** and opened the **account modal**

### Toggle not working?
→ Try **reloading** the app (shake device → Reload)

### Some parts still light?
→ That's the **hero section** - it's meant to stay dark

### Want it on admin pages?
→ Admin dark mode is **separate** and not implemented yet

---

## That's It!

Enjoy your dark mode! 🌙

Toggle as many times as you want - it's instant and smooth.

---

**Files for reference:**
- Full details: `USER_DARK_MODE_COMPLETE.md`
- Testing guide: `DARK_MODE_TESTING_GUIDE.md`
- Summary: `DARK_MODE_IMPLEMENTATION_SUMMARY.md`
