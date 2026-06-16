# Question: How to Fix RLS Blocking Products?

**Date**: June 14, 2026  
**Issue**: Supabase query returns 0 products even though there are 4 products in the database  
**Root Cause**: Row Level Security (RLS) is enabled and blocking anonymous reads

---

## The Problem

Your Supabase database has **4 products**, but when the app queries them, it returns **0 products**. This happens because:

1. ✅ Products exist in database (verified via test script)
2. ❌ Row Level Security (RLS) is enabled on the `products` table
3. ❌ No RLS policy exists to allow anonymous (`anon`) users to read data
4. ⚠️ App falls back to showing 5 demo products instead

### Console Output Showing the Problem:
```
✅ Products fetched from Supabase: 0 products
✅ Backend connected successfully, but products table is empty (0 products)
🔄 Showing fallback demo products...
✅ Displaying 5 fallback products
```

But when we test directly:
```javascript
// Direct test shows products exist!
const { data } = await supabase.from('products').select('*');
console.log(data); // Returns 4 products when authenticated
```

---

## Understanding Row Level Security (RLS)

**What is RLS?**
- A security feature in PostgreSQL/Supabase
- Controls who can read/write data at the database level
- By default, blocks ALL access when enabled
- Requires explicit policies to allow operations

**Why Use RLS?**
- ✅ Protects sensitive data
- ✅ User-specific data access (e.g., users see only their orders)
- ✅ Prevents unauthorized modifications
- ✅ Works even if your API is compromised

**Why It's Blocking You:**
- RLS is enabled on `products` table
- No policy exists for `anon` role (anonymous/public users)
- App uses anonymous access for browsing products
- Result: 0 products returned

---

## Solution 1: Disable RLS (Quick Fix) ⚡

**Best for**: Development, testing, public catalog apps

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `hxkhlexajostqthptvaw`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run This SQL

```sql
-- Disable RLS on products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Disable RLS on categories table
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Disable RLS on product_images table (if exists)
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;

-- Verify: Check RLS status
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'categories', 'product_images');

-- Should show: rls_enabled = false for all tables
```

### Step 3: Refresh Your App
- Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- You should now see your 4 real products instead of 5 demo products

### ✅ Pros:
- Quick and simple
- Works immediately
- No policy management needed

### ⚠️ Cons:
- Less secure (anyone can read your data)
- Not recommended for production with sensitive data
- Cannot implement user-specific access control

---

## Solution 2: Create RLS Policies (Recommended) 🔒

**Best for**: Production apps, apps with user-specific data

### Step 1: Open Supabase SQL Editor
(Same as Solution 1)

### Step 2: Run This SQL

```sql
-- Enable RLS (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anonymous users to READ products
DROP POLICY IF EXISTS "Allow public read access" ON products;
CREATE POLICY "Allow public read access" 
ON products FOR SELECT 
TO anon, authenticated
USING (true);

-- Policy 2: Allow anonymous users to READ categories
DROP POLICY IF EXISTS "Allow public read access" ON categories;
CREATE POLICY "Allow public read access" 
ON categories FOR SELECT 
TO anon, authenticated
USING (true);

-- Policy 3: Allow anonymous users to READ product_images
DROP POLICY IF EXISTS "Allow public read access" ON product_images;
CREATE POLICY "Allow public read access" 
ON product_images FOR SELECT 
TO anon, authenticated
USING (true);

-- Verify: Check policies were created
SELECT 
  tablename, 
  policyname,
  roles,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'categories', 'product_images');

-- Should show: "Allow public read access" policy for each table
```

### Step 3: Refresh Your App
- Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- You should now see your 4 real products

### ✅ Pros:
- Secure approach
- RLS remains enabled for protection
- Can add more specific policies later (user-specific access)
- Recommended for production

### ⚠️ Cons:
- Slightly more complex
- Need to understand policy syntax
- Must create policies for each table

---

## Solution 3: Advanced RLS Policies (Optional) 🚀

For more complex scenarios:

### Example: Public READ, Admin WRITE
```sql
-- Anyone can read products
CREATE POLICY "Public read access" 
ON products FOR SELECT 
TO anon, authenticated
USING (true);

-- Only admins can insert products
CREATE POLICY "Admin insert access" 
ON products FOR INSERT 
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' = 'jafancoadmin@gmail.com'
);

-- Only admins can update products
CREATE POLICY "Admin update access" 
ON products FOR UPDATE 
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'jafancoadmin@gmail.com'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'jafancoadmin@gmail.com'
);

-- Only admins can delete products
CREATE POLICY "Admin delete access" 
ON products FOR DELETE 
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'jafancoadmin@gmail.com'
);
```

### Example: Users See Only Their Orders
```sql
CREATE POLICY "Users see own orders" 
ON orders FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);
```

---

## Verification Steps

### 1. Check Console Logs
After applying the fix, your console should show:

```
✅ Products fetched from Supabase: 4 products
✅ Successfully loaded 4 products from Supabase
✅ Displaying 4 products from Supabase
```

### 2. Check Browser
You should see your real products:
- SHOE3 - GH₵600
- (Your other 3 products)

Instead of demo products:
- Nike Air Max 90 - $150
- Timberland Pro - $180
- Jimmy Choo Pumps - $350
- Gucci Horsebit - $280
- Birkenstock Arizona - $99

### 3. Test with SQL
```sql
-- Count products
SELECT COUNT(*) as total FROM products;
-- Should return: 4

-- List all products
SELECT id, name, price FROM products;
-- Should show: SHOE3 and your other products
```

---

## Troubleshooting

### Problem: Still showing 0 products after fix
**Solution 1**: Hard refresh your browser
```
Windows: Ctrl + Shift + R or Ctrl + F5
Mac: Cmd + Shift + R
```

**Solution 2**: Clear browser cache
```
Chrome: Settings → Privacy → Clear browsing data
```

**Solution 3**: Restart the Expo dev server
```bash
# Stop the server (Ctrl+C)
# Start again
node node_modules\@expo\cli\build\bin\cli start --web
```

### Problem: Policy not working
**Check**: Make sure policy applies to correct role
```sql
-- Check which role your app uses
SELECT current_user;  -- Should return 'anon' for anonymous access

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'products';
```

### Problem: "permission denied for table products"
**Solution**: Policy doesn't exist or doesn't match your role
```sql
-- Re-run the policy creation SQL from Solution 2
```

---

## Related SQL Scripts

Located in project root:

- **`check_rls_and_fix.sql`** - Complete diagnostic and fix script
- **`fix_products_access.sql`** - Quick RLS fix script
- **`disable_rls.sql`** - Disable RLS on all tables

---

## Understanding the Database Structure

Your app's tables and their RLS needs:

| Table | Public Read? | Public Write? | Notes |
|-------|-------------|---------------|-------|
| `products` | ✅ Yes | ❌ No | Browse catalog |
| `categories` | ✅ Yes | ❌ No | Browse categories |
| `product_images` | ✅ Yes | ❌ No | Show product photos |
| `orders` | ❌ No | ✅ Yes (own) | Users create orders |
| `order_items` | ❌ No | ✅ Yes (own) | Order line items |
| `footer_sections` | ✅ Yes | ❌ No | Public footer |
| `footer_items` | ✅ Yes | ❌ No | Footer links |

---

## Best Practices

### ✅ Do:
- Enable RLS on all tables in production
- Create specific policies for each operation (SELECT, INSERT, UPDATE, DELETE)
- Test policies with both anonymous and authenticated users
- Document your RLS policies
- Use `anon` role for public access
- Use `authenticated` role for logged-in users

### ❌ Don't:
- Disable RLS on tables with sensitive data
- Use `USING (true)` for write operations (INSERT/UPDATE/DELETE)
- Grant excessive permissions
- Forget to test policies after changes
- Use service role key in client-side code

---

## Summary

**Problem**: RLS blocking product access  
**Quick Fix**: Disable RLS (Development only)  
**Production Fix**: Create proper read policies  
**Result**: App displays 4 real products from database  

**SQL to Run** (Choose one):

**Option A - Disable RLS**:
```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
```

**Option B - Create Policies (Recommended)**:
```sql
CREATE POLICY "Allow public read access" 
ON products FOR SELECT 
TO anon, authenticated
USING (true);
```

After running the SQL, **hard refresh your browser** to see your real products! 🎉

---

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Policy Examples](https://supabase.com/docs/guides/auth/row-level-security#policy-examples)

---

**Next Steps**: 
1. Apply one of the solutions above
2. Refresh your app
3. Verify your 4 products are now showing
4. Celebrate! 🎉
