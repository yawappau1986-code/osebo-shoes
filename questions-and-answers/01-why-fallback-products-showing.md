# Question: Why is there a fallback showing instead of real products?

**Date**: June 14, 2026  
**Issue**: App shows 5 demo/fallback products instead of the 4 real products in the Supabase database

---

## Problem Explanation

The app has a 3-tier loading strategy:

```javascript
// 1️⃣ TRY: Fetch from Supabase directly
const { data, error } = await supabase.from('products').select('*');

// 2️⃣ TRY: Fetch via proxy server (if Supabase failed)
const response = await fetch('http://localhost:3001/api/products');

// 3️⃣ FALLBACK: Use demo products (if both above failed)
setProductCards(fallbackCategoryCards); // Shows Nike, Timberland, etc.
```

**Root Cause**: Row Level Security (RLS) is enabled on your Supabase tables and blocking anonymous read access. The query returns `0 products` even though 4 products exist in the database.

---

## Diagnosis Commands

### Check if products exist in database:
```javascript
// Test script: test-products-fetch.js
const { data, error } = await supabase.from('products').select('*');
console.log('Products fetched:', data?.length || 0);
// Result: ✅ 4 products exist
```

### Check RLS status:
```sql
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'categories', 'product_images');
```

### Check existing policies:
```sql
SELECT 
  tablename, 
  policyname,
  roles,
  cmd as command
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'categories', 'product_images');
```

---

## Solution 1: Disable RLS (Quick Fix)

Run this in **Supabase SQL Editor**:

```sql
-- Disable RLS to allow public read access
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- If product_images table exists
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
```

**Pros**: 
- Quick and simple
- Works immediately

**Cons**: 
- Less secure (anyone can read your data)
- Not recommended for production

---

## Solution 2: Create Proper RLS Policies (Recommended)

Run this in **Supabase SQL Editor**:

```sql
-- Allow anonymous users to READ products
DROP POLICY IF EXISTS "Allow public read access" ON products;
CREATE POLICY "Allow public read access" 
ON products FOR SELECT 
TO anon, authenticated
USING (true);

-- Allow anonymous users to READ categories
DROP POLICY IF EXISTS "Allow public read access" ON categories;
CREATE POLICY "Allow public read access" 
ON categories FOR SELECT 
TO anon, authenticated
USING (true);

-- Allow anonymous users to READ product_images
DROP POLICY IF EXISTS "Allow public read access" ON product_images;
CREATE POLICY "Allow public read access" 
ON product_images FOR SELECT 
TO anon, authenticated
USING (true);
```

**Pros**: 
- Secure approach
- RLS remains enabled
- Specific policies for read access

**Cons**: 
- Slightly more complex

---

## Verification

After applying the solution, check the browser console:

### Before Fix:
```
✅ Products fetched from Supabase: 0 products
🔄 Showing fallback demo products...
✅ Displaying 5 fallback products
```

### After Fix:
```
✅ Products fetched from Supabase: 4 products
✅ Successfully loaded 4 products from Supabase
✅ Displaying 4 products from Supabase
```

---

## Why Fallback Products Exist

The fallback is a **resilience feature** that ensures the app always displays something, even if:
- Database is temporarily down
- Network connection fails
- RLS policies block access
- Database is genuinely empty

**Fallback Products** (5 demo items):
1. Nike Air Max 90 - $150
2. Timberland Pro - $180
3. Jimmy Choo Pumps - $350
4. Gucci Horsebit - $280
5. Birkenstock Arizona - $99

These are defined in `App.js` as `fallbackCategoryCards` constant.

---

## Related Files

- **Supabase Config**: `lib/supabase.js`
- **Environment Variables**: `.env`
- **Product Loading Logic**: `App.js` (lines 525-680)
- **Fallback Products**: `App.js` (lines 60-105)
- **Test Script**: `test-products-fetch.js`
- **RLS Fix Script**: `check_rls_and_fix.sql`

---

## Additional Notes

Your database contains:
- **4 products** (SHOE3, etc.)
- **4 categories**
- All products have `has_weights: false`
- All products have `price` field (e.g., 600)

After fixing RLS, your real products will display instead of the demo products.
