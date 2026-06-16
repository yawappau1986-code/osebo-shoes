# 📦 Create Backup Folder - Instructions

## What This Does

Creates a **separate backup folder** called `osebo-shoes-backup` containing only the important 90 source files (no node_modules, .expo, build files, etc.).

You can then copy this backup folder to a USB drive, external hard drive, or cloud storage.

---

## 🚀 How to Create Backup

### Method 1: Run PowerShell Script (Recommended)

1. **Right-click** on `create-backup-folder.ps1`
2. Select **"Run with PowerShell"**
3. Wait for the script to finish
4. Backup folder will open automatically!

**Backup location:**
```
C:\Users\HP\Desktop\shoe\jacole app\reactnativeexpo;osebo-shoes\osebo-shoes-backup\
```

---

### Method 2: Manual PowerShell

1. **Open PowerShell** in your project folder
   - Right-click in folder → "Open in Terminal"
   - Or: Press `Shift + Right-Click` → "Open PowerShell window here"

2. **Run the script:**
   ```powershell
   .\create-backup-folder.ps1
   ```

3. **If you get an error about execution policy:**
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\create-backup-folder.ps1
   ```

---

### Method 3: Manual Copy (Alternative)

If scripts don't work, copy these manually:

**Files to copy:**
```
📁 Create new folder: osebo-shoes-backup
├── Copy these files:
│   ├── App.js
│   ├── index.js
│   ├── app.json
│   ├── package.json
│   ├── package-lock.json
│   ├── yarn.lock
│   ├── .gitignore
│   ├── .env.example
│   ├── LICENSE
│   ├── netlify.toml
│   ├── All *.sql files
│   └── All *.md files
│
└── Copy these folders:
    ├── components/
    ├── lib/
    ├── assets/
    ├── scripts/
    └── questions-and-answers/
```

---

## 📊 What Gets Included

### ✅ Included in Backup (~90 files)

| Category | Files |
|----------|-------|
| **Core Code** | App.js, index.js |
| **Components** | components/*.js (2 files) |
| **Library** | lib/supabase.js |
| **Assets** | assets/*.png (9 files) |
| **SQL Files** | All *.sql files (~30 files) |
| **Documentation** | All *.md files (~40 files) |
| **Config** | package.json, app.json, etc. |
| **Total** | **~90 files** |

### ❌ Excluded from Backup

| Folder | Why Excluded | Size |
|--------|--------------|------|
| `node_modules/` | Can be reinstalled with `npm install` | ~500MB |
| `.expo/` | Build cache, regenerated | ~50MB |
| `dist/` | Build output, regenerated | ~20MB |
| `web-build/` | Build output | ~20MB |
| `.git/` | Git history (use GitHub instead) | ~10MB |
| `.env` | Contains secrets (don't backup!) | 1KB |

**Total space saved:** ~600MB+

---

## 📦 What You Get

After running the script:

```
osebo-shoes-backup/
├── App.js
├── index.js
├── app.json
├── package.json
├── package-lock.json
├── yarn.lock
├── .gitignore
├── .env.example
├── LICENSE
├── netlify.toml
│
├── components/
│   ├── CarouselComponent.js
│   └── ProductDetail.js
│
├── lib/
│   └── supabase.js
│
├── assets/
│   ├── icon.png
│   ├── favicon.png
│   └── (all other assets)
│
├── scripts/
│   └── fix_rls.js
│
├── questions-and-answers/
│   ├── README.md
│   └── (all Q&A docs)
│
├── (all .sql files)
└── (all .md files)
```

**Size:** ~50MB (instead of 600MB with node_modules!)

---

## 💾 How to Save to Drive

### After Creating Backup:

1. **Locate the backup folder:**
   ```
   osebo-shoes-backup/
   ```

2. **Copy entire folder** to your drive:
   - USB drive
   - External hard drive
   - Cloud storage (Google Drive, OneDrive, etc.)

3. **Cut and paste** if you want to move it:
   - Right-click folder
   - Cut (Ctrl+X)
   - Navigate to drive
   - Paste (Ctrl+V)

---

## 🔄 Restoring from Backup

To restore your project from the backup:

1. **Copy the backup folder** to your computer
2. **Open Terminal** in the folder
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create .env file** (from .env.example):
   ```bash
   copy .env.example .env
   ```
5. **Edit .env** with your Supabase credentials
6. **Run the app:**
   ```bash
   npm start
   ```

That's it! ✅

---

## ⚠️ Important Notes

### ✅ DO Include
- Source code files
- Assets (images, icons)
- SQL database scripts
- Documentation
- Configuration files

### ❌ DON'T Include
- **`.env` file** - Contains secrets! ⚠️
- `node_modules/` - Too large, reinstall instead
- Build folders - Regenerated when needed
- Cache folders - Not needed

### 🔒 Keep .env Separate and Secure!

Your `.env` file with Supabase credentials should be:
- Backed up separately (encrypted)
- Never in GitHub
- Not in the backup folder (script excludes it)
- Stored securely (password manager, encrypted drive)

---

## 🎯 Summary

### What the Script Does:
1. Creates `osebo-shoes-backup` folder
2. Copies ~90 important source files
3. Excludes large/generated files
4. Opens the backup folder automatically

### Result:
- ✅ Small backup (~50MB instead of 600MB)
- ✅ Contains everything needed to restore
- ✅ Easy to copy to USB/drive
- ✅ Can be uploaded to cloud storage
- ✅ Original project folder unchanged

---

## 📋 Checklist

Before copying to drive:
- [ ] Backup folder created successfully
- [ ] ~90 files copied
- [ ] `.env` NOT in backup (security!)
- [ ] Ready to copy to drive

After copying to drive:
- [ ] Backup folder on drive
- [ ] Test opening a few files to verify
- [ ] Original project folder still intact
- [ ] `.env` stored separately and securely

---

## 🔧 Troubleshooting

### Script Won't Run

**Error:** "Execution of scripts is disabled on this system"

**Fix:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then run script again.

---

### Backup Folder Already Exists

**Message:** "Backup folder already exists. Removing old backup..."

This is normal! The script removes the old backup and creates a new one.

---

### Missing Files in Backup

**Check:**
1. Make sure you ran script from project root folder
2. Verify source files exist in original folder
3. Check script output for errors

---

## 💡 Tips

1. **Regular Backups:** Run this script weekly or after major changes
2. **Multiple Copies:** Keep backups on different drives
3. **Cloud Backup:** Upload to Google Drive/OneDrive for extra safety
4. **Version Naming:** Rename backup folder with date:
   ```
   osebo-shoes-backup-2026-06-14
   ```
5. **Test Restore:** Occasionally test restoring from backup

---

## 🎉 Quick Reference

**Create backup:**
```powershell
.\create-backup-folder.ps1
```

**Result:**
```
osebo-shoes-backup/  (~50MB, ~90 files)
```

**Copy to drive:**
- Cut/paste to USB/external drive
- Or upload to cloud storage

**Restore:**
```bash
npm install
copy .env.example .env
# Edit .env
npm start
```

---

**Script file:** `create-backup-folder.ps1`  
**Backup location:** `osebo-shoes-backup/`  
**Files included:** ~90 source files  
**Size:** ~50MB  
**Excludes:** node_modules, .expo, dist, .git, .env
