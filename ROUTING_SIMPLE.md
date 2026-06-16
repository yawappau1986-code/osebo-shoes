# 🔀 Routing - Simple Explanation

## How Your App Routes Users

Your app uses **one simple variable** to control everything:

```javascript
const [currentPage, setCurrentPage] = useState('shop');
```

---

## 🎯 The Routing Logic

### When User Logs In

```javascript
// 1. User enters email + password
// 2. Check Supabase database

const isAdmin = await checkAdmin(user);  // Query profiles table

// 3. Route based on role
if (isAdmin) {
  setCurrentPage('admin');  // → Admin Dashboard
} else {
  setCurrentPage('shop');   // → Shop Page
}
```

---

## 📊 Visual Flow

```
┌─────────────────────────────────────────────┐
│         User Opens App                      │
│         currentPage = 'shop'                │
└─────────────────┬───────────────────────────┘
                  ↓
        ┌─────────────────────┐
        │   Shop Page Shown   │
        │                     │
        │ [Home] [Cart] [👤]  │ ← Bottom Navigation
        └─────────────────────┘
                  ↓
         User Clicks [👤 Sign In]
                  ↓
        ┌─────────────────────┐
        │   Login Modal       │
        │ Email: _______      │
        │ Password: _____     │
        │      [Login]        │
        └─────────────────────┘
                  ↓
           Authenticate
                  ↓
      Check profiles.role from database
                  ↓
        ┌─────────┴──────────┐
        ↓                    ↓
   role='admin'        role='customer'
        ↓                    ↓
┌───────────────┐    ┌──────────────┐
│ Admin Page    │    │ Shop Page    │
│               │    │              │
│ • Dashboard   │    │ • Products   │
│ • Inventory   │    │ • Cart       │
│ • Orders      │    │ • Account    │
│ • Customers   │    │              │
│ • Analytics   │    │              │
│               │    │              │
│ [Sign Out]    │    │ [Shop]       │
│     ↓         │    │              │
│   Back to     │    │              │
│   Shop        │    │              │
└───────────────┘    └──────────────┘
```

---

## 🔑 Key Code Snippets

### 1. Check if User is Admin

```javascript
const checkAdmin = async (user) => {
  const { data: profile } = await supabase
    .from('profiles')           // ← Your profiles table
    .select('role')
    .eq('id', user.id)
    .single();
  
  return profile?.role === 'admin';  // true or false
};
```

### 2. Route User After Login

```javascript
const handleAuth = async () => {
  // Login user
  const { data: { user } } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: authPassword,
  });

  // Check role
  const isAdmin = await checkAdmin(user);
  
  // Route
  if (isAdmin) {
    setCurrentPage('admin');  // 👈 Admin Dashboard
  } else {
    setCurrentPage('shop');   // 👈 Shop
  }
};
```

### 3. Render Based on Route

```javascript
return (
  <SafeAreaView>
    {currentPage === 'admin' ? (
      <AdminDashboard />   // ← Shows when admin
    ) : (
      <ShopPage />         // ← Shows for everyone else
    )}
  </SafeAreaView>
);
```

### 4. Navigation Buttons

```javascript
// Shop bottom nav
<Pressable onPress={() => setCurrentPage('shop')}>
  <Text>Shop</Text>
</Pressable>

// Admin sidebar
<Pressable onPress={() => {
  setCurrentPage('shop');  // Go back to shop
  handleLogout();          // Sign out
}}>
  <Text>Sign Out</Text>
</Pressable>
```

---

## 🎪 Pages vs Modals

### Pages (Full Screen)
- `'shop'` → Shop page
- `'admin'` → Admin dashboard

Changes with `setCurrentPage()`

### Modals (Overlay)
- Cart modal
- Login modal  
- Checkout modal
- Order history modal

Changes with `setModalVisible(true/false)`

**Difference:** Pages replace the screen, modals appear on top

---

## 🔐 Who Sees What?

### Regular User (role = 'customer')
```
Login → Shop Page
├─ Browse products
├─ Add to cart
├─ View order history
└─ Bottom nav: [Home] [Cart] [Account]
```

### Admin User (role = 'admin')
```
Login → Admin Dashboard
├─ Dashboard tab (stats)
├─ Inventory tab (manage products)
├─ Orders tab (all orders)
├─ Customers tab (user list)
├─ Analytics tab (charts)
└─ [Sign Out] button
```

---

## 💡 Simple Summary

1. **One variable controls routing:** `currentPage`
2. **Two main routes:** `'shop'` and `'admin'`
3. **Route decision:** Database query (`profiles.role`)
4. **Admin check:** `SELECT role FROM profiles WHERE id = user.id`
5. **If admin:** Show admin dashboard
6. **If not admin:** Show shop

**That's it!** No complex routing library needed.

---

## 🛠️ How to Change Routing

### Make User Admin
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
```

### Remove Admin Access
```sql
UPDATE profiles SET role = 'customer' WHERE email = 'admin@example.com';
```

**Next login:** User will route to correct page automatically

---

## 📝 Quick Reference

| What | Value | Shows |
|------|-------|-------|
| `currentPage = 'shop'` | Default | Shop page with products |
| `currentPage = 'admin'` | After admin login | Admin dashboard |
| `profile.role = 'admin'` | Database | Admin access granted |
| `profile.role = 'customer'` | Database | Regular user access |

---

**See `ROUTING_EXPLAINED.md` for detailed documentation.**
