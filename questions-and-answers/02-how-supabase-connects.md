# Question: Show me the code to connect Supabase

**Date**: June 14, 2026  
**Topic**: Supabase Connection Setup and Configuration

---

## Supabase Connection Architecture

```
┌─────────────┐
│   .env      │  ← Environment Variables
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│ lib/supabase.js │  ← Supabase Client Creation
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│    App.js       │  ← Import and Use
└─────────────────┘
```

---

## File 1: Environment Variables

**File**: `.env`

```env
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a2hsZXhham9zdHF0aHB0dmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMDk4NjgsImV4cCI6MjA5Njg4NTg2OH0.XxaTYL9DaIDhJnnHjfn5S_uPd7_oSU6EuaDd0KmOlC4
EXPO_PUBLIC_SUPABASE_URL=https://hxkhlexajostqthptvaw.supabase.co
```

**Your Project Details**:
- **URL**: `https://hxkhlexajostqthptvaw.supabase.co`
- **Project Ref**: `hxkhlexajostqthptvaw`
- **Region**: (Check your Supabase dashboard)

---

## File 2: Supabase Client

**File**: `lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Get credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Warning if credentials are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Check your .env file. The app will run in offline/fallback mode.'
  );
}

// Use AsyncStorage on native for session persistence
// Web uses localStorage automatically
const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

// Create and export Supabase client
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      storage,                    // Session storage
      autoRefreshToken: true,     // Auto-refresh JWT tokens
      persistSession: true,       // Persist session across app restarts
      detectSessionInUrl: false,  // Don't detect OAuth redirects (mobile)
    },
  }
);
```

---

## File 3: Import and Use

**File**: `App.js` (Line 18)

```javascript
import { supabase } from './lib/supabase';
```

---

## Usage Examples

### 1. Fetch Products

```javascript
const { data, error } = await supabase
  .from('products')
  .select('*');

if (error) {
  console.error('Error:', error);
} else {
  console.log('Products:', data);
}
```

### 2. Fetch with Join (Products + Images)

```javascript
const { data, error } = await supabase
  .from('products')
  .select(`
    *,
    product_images (
      id,
      image_url,
      position
    )
  `);
```

### 3. Fetch with Filter

```javascript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', 'some-uuid')
  .order('position', { ascending: true });
```

### 4. User Sign In

```javascript
const { data: { user }, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

if (error) {
  alert('Login failed: ' + error.message);
} else {
  console.log('Logged in user:', user);
}
```

### 5. User Sign Up

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe',
      interests: ['shoes', 'fashion'],
    }
  }
});
```

### 6. Sign Out

```javascript
await supabase.auth.signOut();
setUser(null);
```

### 7. Get Current Session

```javascript
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  console.log('User is logged in:', session.user);
} else {
  console.log('No active session');
}
```

### 8. Listen to Auth Changes

```javascript
useEffect(() => {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  // Cleanup
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 9. Insert Order

```javascript
const { data, error } = await supabase
  .from('orders')
  .insert([{
    user_id: user?.id || null,
    total: 150.00,
    status: 'Pending',
    metadata: {
      customer_name: 'John Doe',
      customer_phone: '+233123456789',
      delivery_address: '123 Main St',
    }
  }])
  .select();

if (error) {
  console.error('Error creating order:', error);
} else {
  console.log('Order created:', data[0]);
}
```

### 10. Update Order Status

```javascript
const { data, error } = await supabase
  .from('orders')
  .update({ status: 'Delivered' })
  .eq('id', orderId)
  .select();
```

### 11. Delete Product

```javascript
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);
```

---

## Database Tables

Your app uses these tables:

| Table | Purpose |
|-------|---------|
| `products` | Store shoe products |
| `categories` | Product categories |
| `product_images` | Multiple images per product |
| `orders` | Customer orders |
| `order_items` | Line items in orders |
| `footer_sections` | Footer content |
| `footer_items` | Footer links/items |

---

## Connection Status Check

Test if Supabase is connected:

```javascript
console.log('Supabase URL configured:', !!process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Supabase Key configured:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const { data, error } = await supabase.from('products').select('count');
if (error) {
  console.error('❌ Supabase connection failed:', error.message);
} else {
  console.log('✅ Supabase connected successfully');
}
```

---

## Required Dependencies

**File**: `package.json`

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x",
    "@react-native-async-storage/async-storage": "^1.x.x"
  }
}
```

Install with:
```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

---

## Security Notes

1. **Never commit `.env` to git** - Add it to `.gitignore`
2. **Use environment variables** - Never hardcode credentials
3. **Anon key is public** - It's safe to expose in client-side code
4. **Service role key is secret** - Never use it in client code
5. **Use RLS policies** - Control data access at database level

---

## Troubleshooting

### Issue: "Missing EXPO_PUBLIC_SUPABASE_URL"
**Solution**: Check that `.env` file exists and variables start with `EXPO_PUBLIC_`

### Issue: "JWT expired"
**Solution**: The `autoRefreshToken: true` setting handles this automatically

### Issue: "No rows returned"
**Solution**: Check RLS policies - see `01-why-fallback-products-showing.md`

### Issue: "Network request failed"
**Solution**: Check internet connection and Supabase project status

---

## Related Documentation

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
