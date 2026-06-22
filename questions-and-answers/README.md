# Questions and Answers

This folder contains documentation for common questions and solutions encountered during development of the Osebo Shoes app.

---

## 📚 Available Documentation

### [01 - Why Fallback Products Showing](./01-why-fallback-products-showing.md)
**Problem**: App shows 5 demo products instead of 4 real products from database  
**Root Cause**: Row Level Security (RLS) blocking anonymous access  
**Solution**: Disable RLS or create proper read policies

### [02 - How Supabase Connects](./02-how-supabase-connects.md)
**Topic**: Complete guide to Supabase connection setup  
**Includes**: Configuration files, usage examples, troubleshooting  
**Files**: `lib/supabase.js`, `.env`, usage in `App.js`

### [03 - RLS Blocking Products Fix](./03-rls-blocking-products-fix.md)
**Problem**: Supabase returns 0 products even though 4 exist in database  
**Root Cause**: Row Level Security (RLS) enabled without policies  
**Solutions**: 
- Quick Fix: Disable RLS entirely
- Recommended: Create proper read policies for anonymous users
- Advanced: User-specific and role-based policies  
**Includes**: Step-by-step SQL scripts, verification, troubleshooting

### [04 - Profile-Based Admin Setup](./04-profile-based-admin-setup.md)
**Problem**: "Invalid login credentials" error for admin user  
**Root Cause**: User doesn't exist or hardcoded email checks  
**Solution**: Profile-based role system with database-stored roles  
**Benefits**:
- Multiple admins supported
- Easy to add/remove admin access
- No code changes needed for role updates
- Scalable and secure
**Includes**: Complete setup guide, SQL scripts, code changes, troubleshooting

### [05 - File Management, GitHub & Deployment](./05-file-management-github-deployment.md) ⭐ **NEW**
**Questions Covered**:
- Which files make up the app code? (~90 files)
- Which files go to Supabase? (None - only SQL scripts run)
- Which files go to GitHub? (~90 source files, no secrets)
- Same files for Netlify? (Yes + env vars in UI)
- How to create backup folder? (Script provided)
**Includes**: Complete file breakdown, deployment guides, backup instructions

---

## 🏗️ Project Overview

**App Name**: Osebo Shoes  
**Tech Stack**: 
- React Native (Expo)
- Supabase (Backend)
- React Navigation (Bottom tabs)
- Animated API (Animations)

**Database Tables**:
- `products` - Shoe products
- `categories` - Product categories  
- `product_images` - Multiple images per product
- `orders` - Customer orders
- `order_items` - Order line items
- `profiles` - User profiles with roles (admin, customer, staff)
- `footer_sections` - Footer content
- `footer_items` - Footer navigation

---

## 🔗 Quick Links

- **Supabase Project**: https://hxkhlexajostqthptvaw.supabase.co
- **Local Dev Server**: http://localhost:8081
- **Admin Email**: jafancoadmin@gmail.com

---

## 📝 How to Add New Questions

When you encounter a new issue and find a solution:

1. Create a new file: `XX-descriptive-title.md`
2. Use the numbering format: `01`, `02`, `03`, etc.
3. Include these sections:
   - **Question/Problem Statement**
   - **Root Cause/Explanation**
   - **Solution(s)**
   - **Verification Steps**
   - **Related Files**
   - **Additional Notes**

---

## 🛠️ Common Commands

### Start Development Server
```bash
node node_modules\@expo\cli\build\bin\cli start --web
```

### Test Supabase Connection
```bash
node test-products-fetch.js
```

### Check for Updates
```bash
npx expo install --check
```

---

## 📞 Support

For issues not covered in this documentation, check:
- Expo Documentation: https://docs.expo.dev/
- Supabase Documentation: https://supabase.com/docs
- React Native Documentation: https://reactnative.dev/docs/getting-started

---

**Last Updated**: June 14, 2026
move the cart icon 