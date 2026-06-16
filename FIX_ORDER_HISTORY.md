# 🔧 Fix: Orders Not Showing in Order History

## Problem
When you place an order, it doesn't appear in your order history.

## Most Likely Cause
The `orders` and `order_items` tables don't exist in your Supabase database yet.

---

## ✅ Solution: Create Orders Tables

### Step 1: Check if Tables Exist

1. Open **Supabase Dashboard** → **SQL Editor**
2. Run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'order_items');
```

**Expected Result:**
- If tables exist: Shows 2 rows (`orders` and `order_items`)
- If tables missing: Shows 0 rows or only 1 row

### Step 2: Create Orders Tables

If tables are missing, run this SQL:

```sql
-- ================================================
-- CREATE ORDERS TABLES
-- ================================================

-- 1. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    selected_weight TEXT,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    line_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- 4. DISABLE RLS (FOR EASY ACCESS)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- 5. CREATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_timestamp ON public.orders;
CREATE TRIGGER update_orders_timestamp
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- 6. VERIFICATION
SELECT 'Orders tables created successfully!' as status;

-- Show table structure
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('orders', 'order_items')
ORDER BY table_name, ordinal_position;
```

### Step 3: Test Order Creation

1. **Refresh your app** (Ctrl+Shift+R)
2. **Add items to cart**
3. **Go to checkout**
4. **Fill in delivery details**
5. **Submit order**
6. **Open Account** from bottom navbar
7. **Check Order History** - Order should appear! ✅

---

## 🔍 Debugging Steps

### Check if Order Was Created

Run in SQL Editor:
```sql
-- See all orders
SELECT 
    id,
    user_id,
    total,
    status,
    created_at,
    metadata->>'customer_name' as customer_name
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

### Check if Order Items Were Created

```sql
-- See all order items
SELECT 
    oi.id,
    oi.order_id,
    oi.product_id,
    oi.selected_weight,
    oi.quantity,
    oi.line_total,
    o.status as order_status
FROM order_items oi
LEFT JOIN orders o ON o.id = oi.order_id
ORDER BY oi.created_at DESC
LIMIT 20;
```

### Check User ID

```sql
-- Find your user ID
SELECT id, email, created_at
FROM auth.users
WHERE email = 'osebo-shoe.shoesadmin@gmail.com';

-- Check if you have orders
SELECT COUNT(*) as order_count
FROM orders
WHERE user_id = 'YOUR_USER_ID_HERE';
```

---

## 🐛 Common Issues

### Issue 1: Tables Don't Exist
**Symptom:** Error when placing order: "relation 'orders' does not exist"

**Fix:** Run the SQL script from Step 2 above

---

### Issue 2: Orders Created but Not Showing
**Symptom:** Orders exist in database but not in app

**Possible Causes:**

#### A. User Not Logged In
```javascript
// The fetchCustomerOrders function checks if user exists
if (!user) return;  // ← This stops the query
```

**Fix:** Make sure you're logged in when placing orders

#### B. Wrong User ID
Check if order's `user_id` matches your logged-in user:

```sql
-- Your logged-in user ID
SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@gmail.com';

-- Orders for this user
SELECT id, user_id, total FROM orders WHERE user_id = 'USER_ID_FROM_ABOVE';
```

**Fix:** If `user_id` is NULL or different, the order was placed as guest or different user

#### C. RLS Blocking Access
**Symptom:** Query returns 0 rows even though orders exist

**Fix:** Disable RLS:
```sql
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
```

---

### Issue 3: Order History Shows "Loading..." Forever
**Symptom:** Spinner shows forever, no orders display

**Debug:**
1. Open browser console (F12)
2. Look for errors when opening account
3. Check Network tab for failed requests

**Common Errors:**
- `406 Not Acceptable` → Tables don't exist
- `PGRST116` → Query returned 0 rows (might be expected if no orders)
- `PGRST204` → RLS blocking access

---

## 📝 Complete Diagnostic

Run this comprehensive check:

```sql
-- ================================================
-- COMPLETE ORDERS DIAGNOSTIC
-- ================================================

-- 1. Check if tables exist
SELECT 'Tables Check:' as step;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'order_items');

-- 2. Count orders
SELECT 'Order Count:' as step;
SELECT COUNT(*) as total_orders FROM orders;

-- 3. Count order items
SELECT 'Order Items Count:' as step;
SELECT COUNT(*) as total_items FROM order_items;

-- 4. Show recent orders with details
SELECT 'Recent Orders:' as step;
SELECT 
    o.id,
    o.user_id,
    o.total,
    o.status,
    o.created_at,
    o.metadata->>'customer_name' as customer,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.user_id, o.total, o.status, o.created_at, o.metadata
ORDER BY o.created_at DESC
LIMIT 5;

-- 5. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('orders', 'order_items');
```

---

## ✅ Expected Results After Fix

### After Creating Tables:
- ✅ Orders table exists with columns: id, user_id, total, status, metadata, created_at
- ✅ Order_items table exists with columns: id, order_id, product_id, quantity, etc.
- ✅ RLS is disabled for easy access
- ✅ Indexes created for fast queries

### After Placing Order:
- ✅ Order appears in `orders` table
- ✅ Order items appear in `order_items` table
- ✅ Order shows in Account → Order History
- ✅ Product images display correctly
- ✅ Order total and status are correct

---

## 🚀 Quick Test

1. **Create tables** (SQL from Step 2)
2. **Refresh app**
3. **Sign in** (important!)
4. **Add product to cart**
5. **Checkout with delivery details**
6. **Submit order**
7. **Click Account icon** (bottom navbar)
8. **See order in history** ✅

---

## 📞 Still Not Working?

If orders still don't show after following these steps:

1. **Check browser console** (F12) for JavaScript errors
2. **Check Supabase logs** in dashboard
3. **Verify you're logged in** - Check if user icon says "Account" not "Sign In"
4. **Run diagnostic SQL** above to see what's in database
5. **Check if order was actually created** in Supabase table editor

---

**Most Common Fix:** Just run the orders table creation SQL and refresh your app!
