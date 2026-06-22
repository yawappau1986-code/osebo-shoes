# Separate Dark Modes Implementation Guide

## Overview
The app now has **TWO INDEPENDENT** dark mode toggles:
1. **User Dark Mode** (`isUserDarkMode`) - For customers/shoppers
2. **Admin Dark Mode** (`isAdminDarkMode`) - For admin panel

Each toggle only affects its respective section of the app.

---

## 1. User Dark Mode

### Toggle Location
- **Account Modal** (bottom sheet)
- Visible in the header next to account name
- Shows moon icon (light mode) / sun icon (dark mode)

### Affected Pages/Components
✅ **Implemented:**
- Main app background (SafeAreaView)
- Header (background, borders, currency button, cart icon)
- Account modal (background, cards, text, borders)
- Order history cards in account
- Product images in orders
- Status Bar (light/dark style)

🚧 **To Be Extended** (Future Work):
- Shopping page product cards
- Category chips
- Search bar
- Cart panel
- Checkout modal
- Product detail modal
- Bottom navigation
- Footer sections

### State Variable
```javascript
const [isUserDarkMode, setIsUserDarkMode] = useState(false);
```

### How It Works
```javascript
// Main container
<SafeAreaView style={[
  styles.safeArea,
  !isAdminPage && !isAdminLoginPage && { 
    backgroundColor: isUserDarkMode ? darkPalette.background : palette.background 
  }
]}>

// Header
<View style={[
  styles.header,
  !isAdminPage && !isAdminLoginPage && {
    backgroundColor: isUserDarkMode ? darkPalette.surface : palette.background,
    borderBottomColor: isUserDarkMode ? '#333' : 'rgba(27, 28, 28, 0.1)',
  }
]}>

// Account modal
<Pressable 
  style={{ 
    backgroundColor: isUserDarkMode ? darkPalette.background : '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  }}
>
```

### Toggle Button Code
```javascript
<Pressable
  onPress={() => setIsUserDarkMode(!isUserDarkMode)}
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isUserDarkMode ? darkPalette.surface : palette.surface,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isUserDarkMode ? '#333' : '#E0E0E0',
    gap: 6,
    marginRight: 12,
  }}
>
  <FontAwesome5 
    name={isUserDarkMode ? 'sun' : 'moon'} 
    size={14} 
    color={isUserDarkMode ? '#FDB813' : '#4A0404'} 
  />
  <Text style={{
    fontSize: 11,
    fontWeight: '600',
    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
  }}>
    {isUserDarkMode ? 'Light' : 'Dark'}
  </Text>
</Pressable>
```

---

## 2. Admin Dark Mode

### Toggle Location
- **Admin Panel Header** (top right)
- Next to LOGOUT button
- Shows moon icon (light mode) / sun icon (dark mode)

### Affected Pages/Components
🚧 **To Be Implemented:**
- Admin sidebar
- Admin main content background
- Admin dashboard cards
- Admin orders table
- Admin catalog view
- Admin settings page
- Admin riders management
- Admin stats cards

### State Variable
```javascript
const [isAdminDarkMode, setIsAdminDarkMode] = useState(false);
```

### Toggle Button Code
```javascript
<Pressable
  onPress={() => setIsAdminDarkMode(!isAdminDarkMode)}
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isAdminDarkMode ? darkPalette.surface : palette.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isAdminDarkMode ? '#333' : '#E0E0E0',
    gap: 6,
    marginRight: 12,
  }}
>
  <FontAwesome5 
    name={isAdminDarkMode ? 'sun' : 'moon'} 
    size={12} 
    color={isAdminDarkMode ? '#FDB813' : '#4A0404'} 
  />
  <Text style={{
    fontSize: 10,
    fontWeight: '600',
    color: isAdminDarkMode ? darkPalette.charcoal : palette.charcoal,
  }}>
    {isAdminDarkMode ? 'Light' : 'Dark'}
  </Text>
</Pressable>
```

---

## Color Palettes

### Light Mode (palette)
```javascript
const palette = {
  background: '#FAF9F9',  // Light gray
  surface: '#FFFFFF',      // White
  charcoal: '#1B1C1C',     // Almost black
  secondary: '#5F5E5F',    // Gray
  oxblood: '#4A0404',      // Dark red
  oxbloodSoft: '#D26A5F',  // Light red
  vault: '#202222',        // Black
};
```

### Dark Mode (darkPalette)
```javascript
const darkPalette = {
  background: '#121212',   // Very dark gray (Material Design dark)
  surface: '#1E1E1E',      // Dark surface
  charcoal: '#E8EAED',     // Light text
  secondary: '#B0B0B0',    // Gray text
  oxblood: '#D26A5F',      // Light red (softer for dark mode)
  oxbloodSoft: '#FF8A80',  // Bright red accent
  vault: '#000000',        // Pure black
};
```

---

## How to Apply Dark Mode to New Components

### Pattern 1: Inline Style with Ternary
```javascript
<View style={{
  backgroundColor: isUserDarkMode ? darkPalette.surface : palette.background,
  borderColor: isUserDarkMode ? '#333' : '#E0E0E0',
}}>
  <Text style={{
    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal
  }}>
    Hello
  </Text>
</View>
```

### Pattern 2: Array Style with Conditional
```javascript
<View style={[
  styles.container,
  isUserDarkMode && { backgroundColor: darkPalette.background }
]}>
```

### Pattern 3: Conditional Rendering
```javascript
<View style={{
  backgroundColor: isAdminPage 
    ? (isAdminDarkMode ? darkPalette.background : palette.background)
    : (isUserDarkMode ? darkPalette.background : palette.background)
}}>
```

---

## Key Implementation Rules

### ✅ DO:
- Use `isUserDarkMode` for **user-facing pages** (shop, cart, account, checkout)
- Use `isAdminDarkMode` for **admin pages** (dashboard, orders, settings, riders)
- Check `!isAdminPage && !isAdminLoginPage` when applying user dark mode
- Use dynamic colors from `palette` and `darkPalette`
- Update borders, backgrounds, text colors, and icon colors
- Consider readability (sufficient contrast ratios)

### ❌ DON'T:
- Mix `isUserDarkMode` and `isAdminDarkMode` in the same component
- Hard-code dark colors directly (use `darkPalette` instead)
- Forget to update border colors (they're often forgotten)
- Leave icons unchanged (they need color updates too)
- Apply dark mode to components that shouldn't have it (e.g., product images)

---

## Next Steps to Complete Implementation

### Phase 1: User Dark Mode (Priority)
1. ✅ Main container background
2. ✅ Header (currency, cart icon)
3. ✅ Account modal
4. 🚧 Product grid cards
5. 🚧 Category chips
6. 🚧 Search bar
7. 🚧 Cart panel
8. 🚧 Checkout modal
9. 🚧 Product detail modal
10. 🚧 Bottom navigation
11. 🚧 Footer

### Phase 2: Admin Dark Mode
1. ✅ Admin header toggle button
2. 🚧 Admin sidebar
3. 🚧 Admin main content
4. 🚧 Admin dashboard cards
5. 🚧 Admin orders table
6. 🚧 Admin catalog
7. 🚧 Admin settings
8. 🚧 Admin riders list

### Phase 3: Persistence (Optional)
- Save user preference to AsyncStorage or user profile
- Load preference on app start
- Sync across devices (if using user profiles)

---

## Testing Checklist

### User Dark Mode
- [ ] Toggle appears in account modal header
- [ ] Main background changes to dark gray (#121212)
- [ ] Header changes to dark surface (#1E1E1E)
- [ ] Currency button borders become gray (#555)
- [ ] Cart bag icon becomes light colored
- [ ] Account modal background is dark
- [ ] Order cards have dark backgrounds
- [ ] Text is readable (light on dark)
- [ ] Status bar switches to light style
- [ ] Toggle persists within session

### Admin Dark Mode
- [ ] Toggle appears in admin header (next to LOGOUT)
- [ ] Admin panel background changes when toggled
- [ ] Admin sidebar changes when toggled
- [ ] Admin cards/tables change when toggled
- [ ] Text is readable in admin dark mode
- [ ] Stats cards adapt to dark mode
- [ ] Orders table adapts to dark mode
- [ ] Toggle persists within admin session

---

## Files Modified
- `App.js` - Main application file
  - Lines 447-448: Dark mode state variables
  - Lines 1939-1946: SafeAreaView and StatusBar with user dark mode
  - Lines 1948-1988: Header with user dark mode styling
  - Lines 2393-2424: Admin header with admin dark mode toggle
  - Lines 4345-4560: Account modal with user dark mode

## Status
✅ **Separate dark modes created** - Two independent toggles working
✅ **User dark mode** - Partially implemented (account modal, header, main container)
✅ **Admin dark mode toggle** - Added to admin header
🚧 **Full implementation pending** - Need to apply to all pages

---

## Future Enhancements
1. **Smooth transitions**: Add animated color transitions
2. **Auto dark mode**: Match system preferences
3. **Scheduled dark mode**: Auto-enable at night
4. **Theme presets**: Multiple color schemes (blue, green, purple)
5. **Accessibility**: High contrast mode for visually impaired users
