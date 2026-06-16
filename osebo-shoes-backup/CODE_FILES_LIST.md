# 📁 Complete Code Files List - Osebo Shoes App

## 🎯 Main Application Code Files

### Core Application Files
| File | Purpose | Lines | Importance |
|------|---------|-------|------------|
| `App.js` | Main application component - entire app UI and logic | ~4000+ | ⭐⭐⭐⭐⭐ |
| `index.js` | Entry point - registers the app | ~10 | ⭐⭐⭐⭐⭐ |
| `app.json` | Expo configuration - app metadata, icons, splash | ~50 | ⭐⭐⭐⭐⭐ |
| `package.json` | NPM dependencies and scripts | ~50 | ⭐⭐⭐⭐⭐ |
| `.env` | Environment variables (Supabase credentials) | ~5 | ⭐⭐⭐⭐⭐ |

---

## 📦 Component Files

### `/components` folder
| File | Purpose | Used By |
|------|---------|---------|
| `components/CarouselComponent.js` | Image carousel for product detail pages | ProductDetail.js |
| `components/ProductDetail.js` | Product detail modal with images, description | App.js |

---

## 🔧 Library/Utility Files

### `/lib` folder
| File | Purpose | Used By |
|------|---------|---------|
| `lib/supabase.js` | Supabase client initialization and configuration | App.js, test scripts |

---

## 🎨 Asset Files

### `/assets` folder
| File | Type | Purpose |
|------|------|---------|
| `assets/icon.png` | PNG | App icon |
| `assets/favicon.png` | PNG | Web favicon |
| `assets/splash-icon.png` | PNG | Splash screen icon |
| `assets/android-icon-background.png` | PNG | Android adaptive icon background |
| `assets/android-icon-foreground.png` | PNG | Android adaptive icon foreground |
| `assets/android-icon-monochrome.png` | PNG | Android monochrome icon |
| `assets/jfamco_logo.png` | PNG | JFAMCO brand logo (PNG) |
| `assets/jfamco_logo.jpg` | JPG | JFAMCO brand logo (JPG) |
| `assets/halal_certificate_seal.png` | PNG | Halal certification seal |

---

## 🗄️ Database Setup Files (SQL)

### Core Tables
| File | Purpose | Creates |
|------|---------|---------|
| `create_profiles_table.sql` | User profiles with admin roles | `profiles` table |
| `create_orders_simple.sql` | Orders and order items tables | `orders`, `order_items` tables |
| `add_product_images_table.sql` | Multiple images per product | `product_images` table |

### Complete Setup
| File | Purpose |
|------|---------|
| `supabase_init.sql` | Initial database setup |
| `complete_orders_setup.sql` | Complete orders system with samples |
| `setup_new_project.sql` | Full project initialization |

### Data Population
| File | Purpose |
|------|---------|
| `supabase_seed.sql` | Seed initial data |
| `populate_mockup_data.sql` | Add mock data for testing |
| `add_sample_product_images.sql` | Add sample product images |
| `add_sample_product_images_simple.sql` | Simplified version |

### Security & Access
| File | Purpose |
|------|---------|
| `fix_products_access.sql` | Fix product table access issues |
| `disable_rls.sql` | Disable Row Level Security |
| `fix_rls.sql` | Fix RLS policies |
| `check_rls_and_fix.sql` | Check and fix RLS |
| `grant_all_access.sql` | Grant full access permissions |

### Admin Setup
| File | Purpose |
|------|---------|
| `create_admin_user.sql` | Create admin user profile |
| `update_profile_role.sql` | Update user roles |

### Verification
| File | Purpose |
|------|---------|
| `check_schema.sql` | Verify database schema |
| `check_policies.sql` | Check RLS policies |
| `check_orders_tables.sql` | Verify orders tables exist |
| `verify_data.sql` | Verify data integrity |

### Maintenance
| File | Purpose |
|------|---------|
| `remove_mock_images.sql` | Clean up mock image data |
| `simple_test_insert.sql` | Test data insertion |

---

## 🧪 Test/Script Files

### `/scripts` folder
| File | Purpose |
|------|---------|
| `scripts/fix_rls.js` | JavaScript script to fix RLS via API |

### Root Test Files
| File | Purpose |
|------|---------|
| `test-products-fetch.js` | Test Supabase product fetching |

---

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | NPM dependencies, scripts, metadata |
| `package-lock.json` | Locked dependency versions |
| `yarn.lock` | Yarn dependency lock file |
| `app.json` | Expo configuration |
| `.env` | Environment variables (Supabase URL, keys) |
| `.gitignore` | Git ignore patterns |
| `netlify.toml` | Netlify deployment config |
| `LICENSE` | Project license |

---

## 📚 Documentation Files

### Setup & Installation
| File | Purpose |
|------|---------|
| `QUICK_START.md` | Fast setup guide |
| `FINAL_SETUP.md` | Complete setup instructions |
| `SETUP_CHECKLIST.md` | Step-by-step checklist |
| `ADMIN_QUICK_SETUP.md` | Admin setup guide |
| `PROFILE_BASED_ADMIN_SETUP.md` | Profile-based auth setup |
| `FIX_ERROR_NOW.md` | Quick error fixes |

### Features & Guides
| File | Purpose |
|------|---------|
| `ADMIN_DASHBOARD_GUIDE.md` | Admin dashboard usage |
| `PRODUCT_DETAIL_FEATURE.md` | Product detail feature docs |
| `PRODUCT_DETAIL_USER_GUIDE.md` | User guide for product pages |
| `BLUR_EFFECT_GUIDE.md` | Blur effect implementation |
| `BLURRED_BACKGROUND_FEATURE.md` | Blurred background feature |
| `DETAIL_PAGE_ENHANCEMENTS.md` | Detail page improvements |
| `BORDERLESS_GRID_UPDATE.md` | Grid layout updates |

### Architecture & Code
| File | Purpose |
|------|---------|
| `ROUTING_EXPLAINED.md` | Complete routing documentation |
| `ROUTING_SIMPLE.md` | Simple routing explanation |
| `CHANGES_SUMMARY.md` | Summary of code changes |
| `AGENTS.md` | AI agent instructions |
| `CLAUDE.md` | Claude AI context |

### Troubleshooting
| File | Purpose |
|------|---------|
| `FIX_ORDER_HISTORY.md` | Fix order history issues |
| `CONNECT_ORDERS_TO_HISTORY.md` | Connect Supabase orders |
| `ORDER_HISTORY_IMAGES_UPDATE.md` | Product images in history |
| `TEST_ORDERS_CONNECTION.md` | Test order connection |

### Questions & Answers
| Folder/File | Purpose |
|-------------|---------|
| `questions-and-answers/` | Common Q&A documentation |
| `questions-and-answers/README.md` | Q&A index |
| `questions-and-answers/01-why-fallback-products-showing.md` | Fallback products explanation |
| `questions-and-answers/02-how-supabase-connects.md` | Supabase connection guide |
| `questions-and-answers/03-rls-blocking-products-fix.md` | Fix RLS blocking |
| `questions-and-answers/04-profile-based-admin-setup.md` | Admin setup Q&A |

### Project Management
| File | Purpose |
|------|---------|
| `TODO.md` | Project todo list |
| `CODE_FILES_LIST.md` | This file - complete file listing |

---

## 📊 File Count Summary

| Category | File Count |
|----------|------------|
| **Core App Files** | 5 files |
| **Component Files** | 2 files |
| **Library Files** | 1 file |
| **Asset Files** | 9 files |
| **SQL Files** | ~30 files |
| **Test/Script Files** | 2 files |
| **Configuration Files** | 7 files |
| **Documentation Files** | ~35 files |
| **Total Code Files** | **~90 files** |

---

## 🎯 Critical Files for App to Run

These files are **REQUIRED** for the app to function:

### ⭐⭐⭐⭐⭐ Essential (Cannot run without)
1. `App.js` - Main application code
2. `index.js` - Entry point
3. `package.json` - Dependencies
4. `app.json` - Expo config
5. `.env` - Supabase credentials
6. `lib/supabase.js` - Database connection

### ⭐⭐⭐⭐ Very Important (Features won't work)
7. `components/ProductDetail.js` - Product details
8. `components/CarouselComponent.js` - Image carousel
9. `assets/icon.png` - App icon
10. `assets/splash-icon.png` - Splash screen

### ⭐⭐⭐ Important (Database features)
11. `create_profiles_table.sql` - User profiles & admin
12. `create_orders_simple.sql` - Order system
13. `fix_products_access.sql` - Product access

---

## 🗂️ File Dependencies

```
App.js
├── lib/supabase.js (Supabase connection)
├── components/ProductDetail.js (Product modal)
│   └── components/CarouselComponent.js (Image carousel)
├── .env (Environment variables)
└── assets/* (Images, icons)

index.js
└── App.js

package.json
└── node_modules/* (Dependencies)

app.json
└── assets/* (App icons, splash)
```

---

## 📦 Generated/Build Files (Not Source Code)

These are **auto-generated** and should not be edited:

### `/node_modules` folder
- All NPM packages (1000+ files)
- Auto-installed from package.json

### `/.expo` folder
- Expo build cache
- Development logs
- Device configs

### `/dist` folder
- Build output
- Compiled/bundled code

### `/.git` folder
- Git version control
- Commit history

### Lock Files
- `package-lock.json` - NPM lock
- `yarn.lock` - Yarn lock

---

## 🔍 How to Find Specific Code

### Find Feature Implementation
| Feature | Main File | Helper Files |
|---------|-----------|--------------|
| Product Grid | `App.js` (lines 1-500) | - |
| Shopping Cart | `App.js` (lines 500-800) | - |
| Checkout | `App.js` (lines 800-900) | `create_orders_simple.sql` |
| Order History | `App.js` (lines 740-790, 3040-3130) | - |
| Admin Dashboard | `App.js` (lines 1640-1950) | `create_profiles_table.sql` |
| Product Detail Modal | `components/ProductDetail.js` | `components/CarouselComponent.js` |
| Authentication | `App.js` (lines 864-940) | `create_profiles_table.sql` |
| Supabase Connection | `lib/supabase.js` | `.env` |

### Find Styling
All styles are in `App.js` at the bottom (~lines 3200-4000)

### Find Database Schema
Check SQL files in root folder, especially:
- `supabase_init.sql`
- `create_profiles_table.sql`
- `create_orders_simple.sql`

---

## 💡 Tips for Working with the Code

1. **Main app logic:** Everything is in `App.js`
2. **Database setup:** Run SQL files in Supabase
3. **Environment:** Update `.env` with your Supabase credentials
4. **Components:** Keep reusable UI in `/components` folder
5. **Documentation:** Check `/questions-and-answers` for common issues

---

## 🚀 Quick Reference

**Start app:**
```bash
npm start
# or
node node_modules/@expo/cli/build/bin/cli start --web
```

**Install dependencies:**
```bash
npm install
```

**Key imports in App.js:**
- React Native components
- Expo vector icons
- Supabase client
- Custom components

**Database connection:**
- Configured in `lib/supabase.js`
- Uses credentials from `.env`
- Called throughout `App.js`

---

**Last Updated:** June 14, 2026  
**Total Files:** ~90 files  
**Main Code Files:** 8 files  
**Lines of Code (App.js):** ~4000 lines
