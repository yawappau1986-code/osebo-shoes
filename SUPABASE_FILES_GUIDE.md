# 🗄️ Files Sent to Supabase

## Important Distinction

**Supabase is NOT a file hosting service** - it's a **database service**. You don't "send files" to Supabase like you would to a web server.

Instead, you:
1. **Run SQL scripts** to create database structure
2. **Send data** via API calls from your app

---

## 📊 What Goes to Supabase

### 1. SQL Scripts (Run Once in Supabase Dashboard)

These files are **copied and pasted** into Supabase SQL Editor to create database tables:

| File | Purpose | Priority |
|------|---------|----------|
| `create_profiles_table.sql` | Create user profiles with admin roles | ⭐⭐⭐⭐⭐ |
| `create_orders_simple.sql` | Create orders and order_items tables | ⭐⭐⭐⭐⭐ |
| `fix_products_access.sql` | Fix product table access (disable RLS) | ⭐⭐⭐⭐ |

**How to use:**
1. Open Supabase Dashboard → SQL Editor
2. Copy content from SQL file
3. Paste into SQL Editor
4. Click "Run"
5. Done! ✅

**You DON'T upload these files** - you just run the SQL code in them.

---

### 2. Data (Sent via API from Your App)

Your app sends this data to Supabase automatically:

| Data Type | Sent From | Supabase Table | When |
|-----------|-----------|----------------|------|
| Product data | Admin Dashboard | `products` | When admin adds/edits products |
| Order data | Checkout | `orders` | When user places order |
| Order items | Checkout | `order_items` | When user places order |
| User profiles | Sign Up | `profiles` | When user signs up (auto-trigger) |
| Categories | Admin Dashboard | `categories` | When admin adds categories |

**How it works:**
```javascript
// Example: App.js sends order to Supabase
await supabase.from('orders').insert([{
  user_id: user.id,
  total: 299.99,
  status: 'Pending'
}]);
```

The **App.js file** makes these API calls, but the file itself is NOT uploaded.

---

### 3. Image URLs (NOT the Images Themselves)

**Important:** Supabase stores **IMAGE URLS**, not image files.

```javascript
// In database:
{
  name: "Nike Air Max",
  image_url: "https://images.unsplash.com/photo-123..."  // ← URL only
}
```

**Where images are hosted:**
- Unsplash (current setup)
- Supabase Storage (if you want to upload images)
- Cloudinary, AWS S3, etc.

---

## ❌ What Does NOT Go to Supabase

### Files That Stay on Your Computer/Server

| File | Where It Runs |
|------|---------------|
| `App.js` | Your computer / web server |
| `index.js` | Your computer / web server |
| `lib/supabase.js` | Your computer / web server |
| `components/*.js` | Your computer / web server |
| `package.json` | Your computer / web server |
| `.env` | Your computer / web server |
| `assets/*` | Your computer / web server |
| All documentation `.md` files | Your computer |

**These files run in your app** - they connect TO Supabase, but don't live IN Supabase.

---

## 🔄 Complete Data Flow

```
Your Computer                          Supabase Cloud
─────────────                          ──────────────

📁 App.js                              🗄️ Database
├── Sends API requests ────────────>   ├── products table
├── Fetches data      <────────────    ├── orders table
└── Updates data      ────────────>    ├── order_items table
                                       ├── profiles table
📁 lib/supabase.js                     └── categories table
└── Connection config
    (uses .env credentials)

📁 .env
└── Supabase URL & Key
    (tells app WHERE Supabase is)

📁 SQL Files
└── Copied & run in
    Supabase SQL Editor
    (creates tables)
```

---

## 📝 Step-by-Step: What You Actually Do

### Step 1: Run SQL Scripts in Supabase Dashboard

**DO THIS:**
1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Open `create_profiles_table.sql` on your computer
4. Copy all the SQL code
5. Paste into Supabase SQL Editor
6. Click "Run"
7. Repeat for other SQL files

**YOU ARE NOT uploading files** - you're running SQL commands.

### Step 2: Configure Your App to Connect

**DO THIS:**
1. Open `.env` file on your computer
2. Add Supabase URL and API key:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-key-here
```
3. Save the file

**The `.env` file stays on your computer** - it's used by `lib/supabase.js`

### Step 3: Run Your App

**DO THIS:**
```bash
npm start
```

Your app runs on your computer and **connects** to Supabase.

---

## 🎯 Files You Need to Run in Supabase

### Required (Run These First)

1. **`create_profiles_table.sql`**
   - Creates profiles table
   - Sets up admin roles
   - Must run this for login to work

2. **`create_orders_simple.sql`**
   - Creates orders tables
   - Must run this for orders to work

3. **`fix_products_access.sql`**
   - Disables RLS on products table
   - Must run this for products to show

### Optional (Run if Needed)

4. **`add_product_images_table.sql`**
   - If you want multiple images per product

5. **`supabase_seed.sql`**
   - If you want sample data

6. **`check_schema.sql`**
   - To verify tables were created

---

## 🚫 Common Misconceptions

### ❌ WRONG: "Upload App.js to Supabase"
**✅ CORRECT:** App.js runs on your computer/server and connects to Supabase via API

### ❌ WRONG: "Upload images to Supabase"
**✅ CORRECT:** Store image URLs in Supabase. Images hosted elsewhere (Unsplash, Supabase Storage, etc.)

### ❌ WRONG: "Send .env file to Supabase"
**✅ CORRECT:** .env file stays secret on your computer. It contains credentials TO ACCESS Supabase.

### ❌ WRONG: "Upload SQL files to Supabase"
**✅ CORRECT:** Copy SQL content and run it in Supabase SQL Editor

---

## 📦 If You Want to Deploy Your App

### Where Your App Files Go

| Platform | Files Deployed |
|----------|----------------|
| **Vercel/Netlify** | App.js, components, lib, assets, package.json |
| **Expo** | All app files bundled into mobile app |
| **Your Server** | All app files |

### What Connects to Supabase

```
Deployed App (Vercel/Netlify/etc)
        ↓
    Internet
        ↓
Supabase Cloud (Database)
```

**Supabase only has:**
- Database tables
- Data in those tables
- Storage buckets (if you use Supabase Storage)

---

## 💾 If You Want to Store Images in Supabase

You CAN upload images to **Supabase Storage** (separate from database):

### Current Setup
```javascript
// Products have image URLs
image_url: "https://images.unsplash.com/..."  // External URL
```

### Supabase Storage Setup
```javascript
// 1. Upload image to Supabase Storage
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('shoe1.jpg', imageFile);

// 2. Get URL
const url = supabase.storage
  .from('product-images')
  .getPublicUrl('shoe1.jpg');

// 3. Save URL in database
await supabase.from('products').insert({
  name: 'Nike Air Max',
  image_url: url  // Supabase Storage URL
});
```

**But this is NOT required** - your current setup with external URLs works fine!

---

## ✅ Summary

### Files Sent to Supabase: **NONE** (technically)

### What You Do with Supabase:
1. ✅ Run SQL scripts in SQL Editor (copy & paste)
2. ✅ Send data via API calls from your app
3. ✅ Fetch data via API calls from your app

### Files That Stay on Your Computer:
- ✅ All `.js` files (App.js, components, lib)
- ✅ All `.json` files (package.json, app.json)
- ✅ All `.env` files (credentials)
- ✅ All `.md` files (documentation)
- ✅ All asset files (images, icons)

### What's IN Supabase:
- ✅ Database tables (created by SQL)
- ✅ Data rows (sent by your app)
- ✅ Image URLs (not the images)

---

## 🔑 Key Takeaway

**Supabase = Database Service**

You don't upload files to Supabase.  
You run SQL to create tables.  
Your app sends/receives data via API.  
Your app files stay on your computer/server.

Think of it like:
- **Google Sheets** = Supabase (stores data in tables)
- **Excel on your computer** = Your app (connects to Google Sheets via API)
- **You don't upload Excel to Google Sheets** - Excel connects TO Sheets

---

**Need to run SQL?** See `SETUP_CHECKLIST.md`  
**Need to deploy app?** That's separate from Supabase setup
