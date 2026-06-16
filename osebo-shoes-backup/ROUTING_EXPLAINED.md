# 🔀 Routing Explained - Admin vs User Routes

## Overview

Your app uses a **simple page-based routing system** with a single state variable `currentPage` that controls which view is displayed.

---

## 🎯 Main Routing State

```javascript
const [currentPage, setCurrentPage] = useState('shop');
```

**Possible Values:**
- `'shop'` - Main shopping page (default)
- `'admin'` - Admin dashboard
- `'adminLogin'` - Admin login page (legacy)
- `'account'` - User account (legacy, now uses modal)

---

## 🔐 Authentication & Routing Flow

### 1. User Signs In

```javascript
const handleAuth = async () => {
  // ... authentication code ...
  
  if (isLoginMode) {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPassword,
    });
    
    // ⭐ KEY ROUTING LOGIC ⭐
    const isAdmin = await checkAdmin(user);  // Check profiles table
    
    if (isAdmin) {
      setAdminUnlocked(true);
      setCurrentPage('admin');  // 👈 Route to Admin Dashboard
    } else {
      setCurrentPage('shop');   // 👈 Route to Shop
    }
    
    setAuthModalVisible(false);
  }
}
```

**Flow:**
1. User enters credentials
2. Authenticate with Supabase
3. Query `profiles` table for user's role
4. If `role === 'admin'` → Go to Admin Dashboard
5. If `role === 'customer'` → Go to Shop

---

## 📊 Route Decision Tree

```
User Logs In
    ↓
Check Profile Role
    ↓
    ├─→ role = 'admin' → setCurrentPage('admin') → Admin Dashboard
    │                     setAdminUnlocked(true)
    │
    └─→ role = 'customer' → setCurrentPage('shop') → Shop Page
```

---

## 🎨 Rendering Based on Route

### Main Render Logic (line ~1671)

```javascript
return (
  <SafeAreaView style={styles.container}>
    {isAdminLoginPage ? (
      // Admin Login Page (legacy)
      <ScrollView>
        {/* Login form */}
      </ScrollView>
      
    ) : isAdminPage ? (
      // ⭐ ADMIN DASHBOARD ⭐
      <View style={styles.adminDashboardLayout}>
        {/* Sidebar with tabs */}
        {/* Main content area */}
        {/* 5 tabs: Dashboard, Inventory, Orders, Customers, Analytics */}
      </View>
      
    ) : (
      // ⭐ REGULAR USER SHOP ⭐
      <ScrollView>
        {/* Header with search */}
        {/* Category chips */}
        {/* Product grid */}
        {/* Bottom navigation */}
      </ScrollView>
    )}
  </SafeAreaView>
);
```

### Page Flags (line ~1368)

```javascript
const isAdminPage = currentPage === 'admin';
const isAdminLoginPage = currentPage === 'adminLogin';
const isShopPage = currentPage === 'shop';
```

---

## 🧭 Navigation Components

### Bottom Navigation (Regular Users)

Located at the bottom of the shop page:

```javascript
<View style={styles.bottomNav}>
  {/* Home/Shop Button */}
  <Pressable onPress={() => setCurrentPage('shop')}>
    <FontAwesome name="home" size={20} />
    <Text>Shop</Text>
  </Pressable>

  {/* Cart Button */}
  <Pressable onPress={openCart}>
    <FontAwesome name="shopping-cart" size={20} />
    <Text>Cart</Text>
  </Pressable>

  {/* Account/Sign In Button */}
  <Pressable onPress={() => {
    if (user) {
      // Show account modal
      setUserAccountSheetVisible(true);
    } else {
      // Show login modal
      setAuthModalVisible(true);
    }
  }}>
    <FontAwesome name="user" size={20} />
    <Text>{user ? 'Account' : 'Sign In'}</Text>
  </Pressable>
</View>
```

### Admin Sidebar Navigation

Located on the left side of admin dashboard:

```javascript
<View style={styles.adminNavList}>
  {['Dashboard', 'Inventory', 'Orders', 'Customers', 'Analytics'].map((item) => (
    <Pressable
      onPress={() => setActiveAdminTab(item)}
      style={[
        styles.adminNavItem, 
        activeAdminTab === item && styles.adminNavItemActive
      ]}
    >
      <Text>{item}</Text>
    </Pressable>
  ))}
</View>

{/* Logout Button */}
<Pressable onPress={() => {
  setAdminUnlocked(false);
  setCurrentPage('shop');  // 👈 Route back to shop
  handleLogout();
}}>
  <Text>Sign Out</Text>
</Pressable>
```

---

## 🔄 Route Transitions

### From Shop to Admin
```javascript
// Triggered by login
if (isAdmin) {
  setAdminUnlocked(true);
  setCurrentPage('admin');
}
```

### From Admin to Shop
```javascript
// Logout button
setAdminUnlocked(false);
setCurrentPage('shop');
await supabase.auth.signOut();
```

### From Login Modal to Shop/Admin
```javascript
// After authentication
const isAdmin = await checkAdmin(user);
setCurrentPage(isAdmin ? 'admin' : 'shop');
setAuthModalVisible(false);
```

---

## 🎪 Modal System (Not Routes)

These are **overlays**, not separate pages:

### User Modals
- `authModalVisible` - Login/Signup form
- `cartModalVisible` - Shopping cart
- `userAccountSheetVisible` - Order history
- `checkoutModalVisible` - Checkout form
- `productDetailModalVisible` - Product details

### Admin Modals
- `adminProfileModalVisible` - Admin profile settings
- `inventoryModalVisible` - Add/edit products
- `orderDetailModalVisible` - Order details

**Key Difference:** Modals overlay the current page, routes replace the entire view.

---

## 🔑 Access Control

### Admin Access Check

```javascript
const checkAdmin = async (user) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  return profile?.role === 'admin';
};
```

### Admin State
```javascript
const [adminUnlocked, setAdminUnlocked] = useState(false);
```

**Protection:**
- Admin routes only render when `currentPage === 'admin'`
- Admin sidebar only shows when `adminUnlocked === true`
- Logout resets both `adminUnlocked` and `currentPage`

---

## 📋 Routing State Summary

| State Variable | Type | Purpose |
|---------------|------|---------|
| `currentPage` | string | Controls which page view renders |
| `adminUnlocked` | boolean | Grants access to admin features |
| `user` | object/null | Current authenticated user from Supabase |
| `activeAdminTab` | string | Controls which admin tab is active |

---

## 🛡️ Security Notes

### What Prevents Unauthorized Admin Access?

1. **Authentication Required**
   ```javascript
   const { data: { user }, error } = await supabase.auth.signInWithPassword({...});
   ```
   - Must have valid Supabase account

2. **Database Role Check**
   ```javascript
   const isAdmin = await checkAdmin(user);
   ```
   - Queries `profiles` table for role
   - Only users with `role = 'admin'` get access

3. **State Protection**
   ```javascript
   if (isAdmin) {
     setAdminUnlocked(true);  // Required for admin features
     setCurrentPage('admin'); // Routes to admin dashboard
   }
   ```

4. **UI Rendering**
   ```javascript
   {isAdminPage ? <AdminDashboard /> : <Shop />}
   ```
   - Admin UI only renders when conditions met

### What Could Be Improved?

⚠️ **Current limitations:**
- `adminUnlocked` state is client-side only
- User could theoretically manipulate state in dev tools
- No server-side API protection shown

✅ **Recommended additions:**
- Add role checks to all admin API calls
- Implement server-side middleware
- Add RLS policies to database tables
- Log all admin actions

---

## 🎯 Complete Routing Flow Diagram

```
App Startup
    ↓
currentPage = 'shop' (default)
    ↓
User Interface Renders
    ↓
    ├─→ Shop Page (Regular Users)
    │   - Browse products
    │   - Add to cart
    │   - Bottom nav: [Shop] [Cart] [Sign In]
    │
    └─→ User Clicks "Sign In"
        ↓
        authModalVisible = true
        ↓
        User Enters Credentials
        ↓
        Authenticate with Supabase
        ↓
        Query profiles table for role
        ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
    role = 'admin'            role = 'customer'
        ↓                           ↓
    adminUnlocked = true        Stay on shop
    currentPage = 'admin'           ↓
        ↓                       Bottom nav shows [Account]
    Admin Dashboard                 ↓
    - Sidebar with tabs         Can view order history
    - Dashboard                 Can place orders
    - Inventory                 Can manage profile
    - Orders
    - Customers
    - Analytics
    - [Sign Out] → shop
```

---

## 💡 Key Takeaways

1. **Simple State-Based Routing**
   - One state variable (`currentPage`) controls everything
   - No React Router or navigation library needed

2. **Role-Based Access**
   - Database-driven (`profiles.role`)
   - Checked on every login
   - No hardcoded emails

3. **Two Main Routes**
   - `shop` - Regular users
   - `admin` - Admin users

4. **Modal Overlays**
   - Cart, account, checkout are modals
   - Don't change `currentPage`
   - Can appear on any route

5. **Security Through Simplicity**
   - Clear separation of concerns
   - Easy to audit and maintain
   - Database is source of truth

---

## 📚 Related Code Locations

| Feature | File | Line |
|---------|------|------|
| Routing state | App.js | ~367 |
| Auth routing logic | App.js | ~900 |
| checkAdmin function | App.js | ~864 |
| Main render switch | App.js | ~1671 |
| Bottom navigation | App.js | ~2118 |
| Admin sidebar | App.js | ~1674 |
| Page flags | App.js | ~1368 |

---

**Last Updated**: June 14, 2026
