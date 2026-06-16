# 🚀 Netlify Deployment Guide

## ✅ Yes! Same Files as GitHub

Netlify will pull the same **~90 files** from your GitHub repository.

---

## 🔑 Key Difference: Environment Variables

### ❌ What's NOT in GitHub (Secrets)
- `.env` file - Contains Supabase credentials

### ✅ What You Add Directly in Netlify
- Environment variables (same content as `.env`)

---

## 📊 Complete Deployment Flow

```
Your Computer                GitHub                    Netlify
─────────────               ────────                  ───────

📁 90 source files    →    Push to GitHub      →    Pull from GitHub
📁 .env (secrets)     ✗    NOT pushed          →    Add in Netlify UI
                                                      ↓
                                                   Build & Deploy
                                                      ↓
                                                   Live Website!
```

---

## 🚀 Step-by-Step Netlify Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Files going to GitHub:** ~90 files (NO .env)

---

### Step 2: Connect Netlify to GitHub

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"GitHub"**
4. Authorize Netlify to access your repos
5. Select your repository: `osebo-shoes`
6. Click **"Deploy"**

**Netlify pulls:** Same ~90 files from GitHub

---

### Step 3: Add Environment Variables in Netlify

This is the **CRITICAL STEP** - Adding your secrets!

#### Option A: During Initial Setup

1. In the deploy configuration screen
2. Click **"Advanced build settings"**
3. Click **"Add environment variables"**
4. Add:
   ```
   Key: SUPABASE_URL
   Value: https://hxkhlexajostqthptvaw.supabase.co
   
   Key: SUPABASE_ANON_KEY
   Value: (your actual anon key)
   ```
5. Click **"Deploy site"**

#### Option B: After Deployment

1. Go to your site dashboard
2. Click **"Site settings"**
3. Click **"Environment variables"** (left sidebar)
4. Click **"Add a variable"**
5. Add each variable:
   - **Variable 1:**
     - Key: `SUPABASE_URL`
     - Value: `https://hxkhlexajostqthptvaw.supabase.co`
   - **Variable 2:**
     - Key: `SUPABASE_ANON_KEY`
     - Value: (your actual key from Supabase)
6. Click **"Save"**
7. Click **"Trigger deploy"** → **"Deploy site"**

---

### Step 4: Configure Build Settings

Netlify should auto-detect Expo, but verify:

**Build settings:**
- Build command: `npm run build` or `expo export:web`
- Publish directory: `dist` or `web-build`

**If it doesn't auto-detect:**
1. Site settings → Build & deploy → Build settings
2. Edit settings:
   ```
   Build command: npx expo export:web
   Publish directory: dist
   ```

---

## 📋 What Gets Deployed to Netlify

### ✅ From GitHub (~90 files)
- All source code (App.js, components, lib)
- All assets (images, icons)
- All documentation (*.md files)
- All SQL files (for reference)
- Configuration files (package.json, app.json)

### ✅ Added in Netlify UI
- Environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)

### ❌ NOT Deployed
- `.env` file (stays on your computer)
- `node_modules/` (Netlify installs fresh during build)
- `.expo/` cache
- `dist/` (rebuilt by Netlify)

---

## 🔄 Build Process on Netlify

```
1. Netlify pulls from GitHub
   ↓
2. Reads package.json
   ↓
3. Runs npm install (creates node_modules)
   ↓
4. Injects environment variables
   ↓
5. Runs build command (expo export:web)
   ↓
6. Creates dist/ folder
   ↓
7. Deploys dist/ to CDN
   ↓
8. Your site is live! 🎉
```

---

## 🔐 Environment Variables Explained

### On Your Computer
```env
# .env file (local development)
SUPABASE_URL=https://hxkhlexajostqthptvaw.supabase.co
SUPABASE_ANON_KEY=your-key-here
```

### On Netlify (Production)
```
Environment Variables in Netlify Dashboard:
┌─────────────────────┬────────────────────────────────┐
│ Key                 │ Value                          │
├─────────────────────┼────────────────────────────────┤
│ SUPABASE_URL        │ https://hxkhlexajostqthptvaw...│
│ SUPABASE_ANON_KEY   │ eyJhbGciOiJIUzI1NiIsInR5cCI... │
└─────────────────────┴────────────────────────────────┘
```

**Both serve the same purpose** - providing Supabase credentials securely!

---

## 📝 Complete Netlify Checklist

### Before Deployment
- [ ] All code pushed to GitHub
- [ ] `.env` is in `.gitignore` (NOT pushed to GitHub)
- [ ] `.env.example` created for reference
- [ ] `netlify.toml` exists (optional, for config)

### During Deployment
- [ ] Netlify connected to GitHub repo
- [ ] Build command set: `npx expo export:web`
- [ ] Publish directory set: `dist`
- [ ] Environment variables added:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`

### After Deployment
- [ ] Site builds successfully (check build log)
- [ ] Site is live (visit the Netlify URL)
- [ ] App loads without errors
- [ ] Products display correctly
- [ ] Can add to cart
- [ ] Can place orders
- [ ] Admin login works

---

## 🐛 Common Netlify Issues

### Issue 1: Build Fails - "Module not found"

**Error:**
```
Module not found: Error: Can't resolve '@expo/vector-icons'
```

**Fix:**
Make sure `package.json` includes all dependencies. Run locally:
```bash
npm install
```
Then push to GitHub.

---

### Issue 2: App Loads but No Data

**Symptoms:**
- App loads but shows fallback products
- Orders don't save
- Can't login

**Cause:** Environment variables not set

**Fix:**
1. Go to Netlify → Site settings → Environment variables
2. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
3. Click "Trigger deploy" → "Deploy site"

---

### Issue 3: 404 on Routes

**Error:**
```
Page Not Found
```

**Cause:** Netlify doesn't handle client-side routing

**Fix:** Create `_redirects` file in `public/` folder:
```
/*  /index.html  200
```

Or add to `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Issue 4: Build Succeeds but Site is Blank

**Check:**
1. Open browser console (F12)
2. Look for errors
3. Common issue: Wrong publish directory

**Fix:**
- Site settings → Build & deploy → Build settings
- Change publish directory to: `dist` or `web-build`

---

## 📊 Files Comparison

| Location | Files | Secrets |
|----------|-------|---------|
| **Your Computer** | ~90 source files | .env file |
| **GitHub** | ~90 source files | ❌ NO secrets |
| **Netlify** | ~90 source files (from GitHub) | ✅ Added in UI |

---

## 🔒 Security Best Practices

### ✅ Good (What You Should Do)
- Keep `.env` in `.gitignore`
- Add secrets in Netlify UI only
- Use `.env.example` for documentation
- Never commit API keys to GitHub

### ❌ Bad (Don't Do This)
- Commit `.env` to GitHub
- Hardcode secrets in code
- Share `.env` file publicly
- Store secrets in documentation

---

## 🎯 Deployment Summary

### Files Deployed: Same ~90 files as GitHub

**Source Code (~10 files):**
- App.js, index.js, components, lib

**Assets (~10 files):**
- Images, icons, logos

**Config (~10 files):**
- package.json, app.json, netlify.toml

**SQL Files (~30 files):**
- For reference/documentation

**Documentation (~40 files):**
- All .md files

### Secrets: Added Separately in Netlify UI

**Environment Variables (2):**
- SUPABASE_URL
- SUPABASE_ANON_KEY

### Generated During Build

**Auto-created by Netlify:**
- node_modules/ (from npm install)
- dist/ (from build command)

---

## 🚀 Quick Deployment Commands

### First Time Setup
```bash
# Push to GitHub
git push origin main

# Then in Netlify:
# 1. Import from GitHub
# 2. Add environment variables
# 3. Deploy
```

### Updates After First Deploy
```bash
# Just push to GitHub
git add .
git commit -m "Update feature"
git push

# Netlify auto-deploys! 🎉
```

---

## 📦 Netlify Auto-Deploy

Once connected:
- Push to GitHub → Netlify auto-builds ✅
- Update code → Push → Auto-deploy ✅
- No manual steps needed! ✅

---

## ✅ Final Checklist

**GitHub:**
- [x] ~90 source files pushed
- [x] .env NOT in repo
- [x] .env.example created

**Netlify:**
- [ ] Connected to GitHub repo
- [ ] Environment variables set
- [ ] Build settings configured
- [ ] Site deployed successfully
- [ ] App works on live URL

---

## 🌐 After Deployment

Your app will be live at:
```
https://your-site-name.netlify.app
```

You can:
- Share this URL with users
- Add custom domain
- Enable HTTPS (automatic)
- View analytics
- Check build logs

---

## 📝 Quick Reference

| Item | Your Computer | GitHub | Netlify |
|------|---------------|--------|---------|
| Source files | ✅ Yes | ✅ Yes | ✅ Yes (from GitHub) |
| .env file | ✅ Yes | ❌ No | ❌ No |
| Environment vars | In .env | - | ✅ In UI |
| node_modules | ✅ Yes | ❌ No | ✅ Auto-installed |
| Build output | ✅ Yes | ❌ No | ✅ Auto-generated |

---

**See `GITHUB_FILES_GUIDE.md` for GitHub details**  
**See `netlify.toml` for Netlify configuration**

🎉 **Same files, different secrets!**
