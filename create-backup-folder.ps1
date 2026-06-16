# ========================================
# Create Backup Folder for Osebo Shoes App
# ========================================
# This script copies only the important source files
# (not node_modules, .expo, etc.) to a backup folder

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Backup Folder..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Source and destination paths
$sourceDir = Get-Location
$backupDir = Join-Path $sourceDir "osebo-shoes-backup"

# Create backup directory
Write-Host "Creating backup folder: $backupDir" -ForegroundColor Yellow
if (Test-Path $backupDir) {
    Write-Host "Backup folder already exists. Removing old backup..." -ForegroundColor Yellow
    Remove-Item -Path $backupDir -Recurse -Force
}
New-Item -Path $backupDir -ItemType Directory | Out-Null

# Files and folders to INCLUDE
$includeItems = @(
    # Core files
    "App.js",
    "index.js",
    "app.json",
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "LICENSE",
    "netlify.toml",
    ".gitignore",
    ".env.example",
    
    # Folders
    "components",
    "lib",
    "assets",
    "scripts",
    "questions-and-answers",
    
    # All SQL files
    "*.sql",
    
    # All Markdown documentation
    "*.md"
)

# Function to copy items
function Copy-BackupItem {
    param($item)
    
    if ($item -like "*`**") {
        # Wildcard pattern (e.g., *.sql, *.md)
        $files = Get-ChildItem -Path $sourceDir -Filter $item -File
        foreach ($file in $files) {
            Write-Host "  Copying: $($file.Name)" -ForegroundColor Green
            Copy-Item -Path $file.FullName -Destination $backupDir -Force
        }
    }
    elseif (Test-Path (Join-Path $sourceDir $item)) {
        $fullPath = Join-Path $sourceDir $item
        $destPath = Join-Path $backupDir $item
        
        if (Test-Path $fullPath -PathType Container) {
            # It's a folder
            Write-Host "  Copying folder: $item" -ForegroundColor Green
            Copy-Item -Path $fullPath -Destination $destPath -Recurse -Force
        }
        else {
            # It's a file
            Write-Host "  Copying: $item" -ForegroundColor Green
            Copy-Item -Path $fullPath -Destination $destPath -Force
        }
    }
}

# Copy all items
Write-Host ""
Write-Host "Copying files and folders..." -ForegroundColor Cyan
Write-Host ""

foreach ($item in $includeItems) {
    Copy-BackupItem -item $item
}

# Count files
$fileCount = (Get-ChildItem -Path $backupDir -Recurse -File | Measure-Object).Count

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backup location: $backupDir" -ForegroundColor Yellow
Write-Host "Total files copied: $fileCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now copy this folder to your drive!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to open the backup folder..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open backup folder in Explorer
Start-Process explorer.exe -ArgumentList $backupDir
