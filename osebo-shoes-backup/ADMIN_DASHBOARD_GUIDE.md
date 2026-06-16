# 🎛️ Admin Dashboard Guide

## Overview
The Osebo Shoes app includes a comprehensive admin dashboard for managing products, orders, and customers.

---

## 🔐 Accessing Admin Dashboard

### Method 1: Sign In as Admin
1. Click **"Sign In"** in the bottom navigation
2. Enter admin credentials:
   - **Email**: `jafancoadmin@gmail.com`
   - **Password**: (your admin password)
3. You'll be automatically redirected to the Admin Dashboard

### Method 2: Admin Login Page
- Navigate to the admin login page
- Uses the same admin email: `jafancoadmin@gmail.com`

---

## 📊 Dashboard Tabs

The admin dashboard has **5 main tabs**:

### 1. 🏠 Dashboard (Overview)
**Shows:**
- **Revenue Statistics** with growth percentage
- **Total Orders** count
- **Active Shipments** (items being delivered)
- **Recent Orders** (last 3 orders)
- **Top 5 Products** from inventory
- **Currency Toggle** (USD, EUR, GBP, NGN, GH₵)

**Features:**
- Revenue growth indicator (green for increase, red for decrease)
- Order growth percentage
- Active delivery tracking
- Quick view of most important metrics

---

### 2. 📦 Inventory (Product Management)
**Shows:**
- **All Products** in the catalog
- Product image, name, and description
- **Current Stock** levels
- **Stock Status** (In Stock / Low Stock)
- **Edit** and **Delete** actions

**Features:**
- **Add New Product** button
  - Product name
  - Price options (250g, 500g, 1kg)
  - Unit price (for non-weighted items)
  - Has weights toggle
  - Category/tag
  - Description
  - Image URL
  - Stock quantity

- **Edit Product** (click ✎ icon)
  - Modify all product details
  - Update prices
  - Change stock levels
  - Update images

- **Stock Status Indicators:**
  - 🟢 **Green Badge**: In Stock (≥15 units)
  - 🔴 **Red Badge**: Low Stock (<15 units)

---

### 3. 📋 Orders (Order Management)
**Shows:**
- **All Customer Orders**
- Order ID (e.g., #ORD-9645)
- Customer name and contact
- Order items count
- Total amount
- Order status with color coding

**Order Statuses:**
- 🟡 **Pending** (Yellow) - Just placed
- 🔵 **Processing** (Blue) - Being prepared
- 🟢 **Delivery** (Green) - Out for delivery
- 🟣 **Delivered** (Purple) - Completed

**Features:**
- **Click Status Badge** to cycle through statuses
- **WhatsApp Icon** - Message customer directly
- **Trash Icon** - Delete order
- **Automatic Status Flow**: Pending → Processing → Delivery → Delivered

---

### 4. 👥 Customers (CRM)
**Shows:**
- **Customer List** with contact info
- Customer name
- Phone number
- Email address
- **Total Orders** count
- **Total Spent** amount

**Features:**
- **WhatsApp Integration** - Click to message customers
- Customer spending analytics
- Order history per customer
- Sorted by total spent (highest first)

---

### 5. 📈 Analytics
**Shows:**
- **Revenue Statistics**
  - Week-over-week growth
  - Total revenue
  - Revenue trends

- **Order Analytics**
  - Order count growth
  - Order patterns
  - Status breakdown

- **Performance Metrics**
  - Best-selling products
  - Peak order times
  - Customer behavior

---

## 🎨 Admin UI Features

### Sidebar Navigation
- **JFAMCO** branding
- **Admin Avatar** (clickable to change)
- **Administrator** profile display
- **5 Main Tabs**: Dashboard, Inventory, Orders, Customers, Analytics
- **Bottom Actions**: Settings, Price Update
- **Logout** button at top right

### Currency Switching
Available in Dashboard and Analytics tabs:
- **USD** ($) - US Dollar
- **EUR** (€) - Euro
- **GBP** (£) - British Pound
- **NGN** (₦) - Nigerian Naira
- **GH₵** (GH₵) - Ghana Cedi

Prices automatically convert based on live exchange rates.

---

## 🛠️ Admin Actions

### Product Management
```
Add Product → Fill Form → Save
Edit Product → Click ✎ → Modify → Save
Delete Product → (Edit Modal) → Delete Button
```

### Order Management
```
View Order → Click Status → Cycles Through Statuses
Message Customer → Click WhatsApp Icon → Opens WhatsApp
Delete Order → Click Trash Icon → Confirms Delete
```

### Customer Management
```
View Customer → Shows Orders & Spending
Contact Customer → Click WhatsApp → Opens Chat
```

---

## 📱 Admin Dashboard Layout

```
┌─────────────┬──────────────────────────────────────┐
│  SIDEBAR    │         MAIN CONTENT AREA            │
│             │                                      │
│ JFAMCO      │  [Tab Title]           [LOGOUT]     │
│ [Avatar]    │                                      │
│ Admin       │  [Currency Toggle]                   │
│             │  USD  EUR  GBP  NGN  GH₵            │
│ Dashboard   │                                      │
│ Inventory   │  ┌─────────┐ ┌─────────┐           │
│ Orders      │  │ REVENUE │ │ ORDERS  │           │
│ Customers   │  │  GH₵X   │ │   XXX   │           │
│ Analytics   │  └─────────┘ └─────────┘           │
│             │                                      │
│             │  [Recent Orders / Inventory]         │
│ Settings    │  ┌────────────────────────┐         │
│ Price Upd.  │  │ Order #XXX    PENDING  │         │
│             │  │ Customer      GH₵XXX   │         │
│             │  └────────────────────────┘         │
└─────────────┴──────────────────────────────────────┘
```

---

## 🎯 Key Statistics Displayed

### Dashboard Stats Cards

**1. Revenue Card**
- Total revenue amount
- Growth percentage vs last week
- Visual indicator (↑ green / ↓ red)

**2. Total Orders Card**
- Lifetime order count
- Growth percentage
- "Lifetime orders" label

**3. Active Shipments Card (Dark)**
- Orders being processed/delivered
- "Delivering today" count
- 🚚 Truck icon
- Red accent color

---

## 🔢 Data Tables

### Inventory Table
| PRODUCT | CURRENT STOCK | STATUS | ACTION |
|---------|--------------|--------|--------|
| [Image] Product Name | XX kg | In Stock / Low Stock | ✎ |

### Orders Table
```
Order #ORD-XXXX          [STATUS BADGE]
Customer Name   📱 🗑️    GH₵XXX.XX
X Items • Pickup
```

### Customers Table
```
Customer Name            GH₵XXXX.XX
Phone: +233XXXXXXXXX     📱 WhatsApp
X Orders • Email
```

---

## 🎨 Color Coding

### Status Colors
- 🟡 **Yellow** (#FFF3CD) - Pending
- 🔵 **Blue** (#CCE5FF) - Processing
- 🟢 **Green** (#D4EDDA) - Delivery
- 🟣 **Purple** (#A855F7) - Delivered

### UI Colors
- **Oxblood Red** (#4A0404) - Primary brand color
- **Charcoal** (#1B1C1C) - Text
- **Background** (#FAF9F9) - Page background
- **Surface** (#FFFFFF) - Cards and panels

---

## 📊 Analytics Insights

### Revenue Analytics
- Week-over-week comparison
- Growth percentage calculation
- Total revenue display
- Currency conversion

### Order Analytics
- Order count tracking
- Status distribution
- Growth trends
- Peak ordering times

### Customer Analytics
- Top customers by spending
- Order frequency
- Customer lifetime value
- Contact information management

---

## 🚀 Quick Actions

### From Dashboard
1. **Add Product** → Opens product form
2. **View All Orders** → Switches to Orders tab
3. **Edit Product** → Click ✎ on any product
4. **Change Currency** → Click currency button
5. **Update Order Status** → Click status badge
6. **Message Customer** → Click WhatsApp icon
7. **Delete Order** → Click trash icon

---

## 💡 Pro Tips

### Efficient Product Management
- Use clear product names
- Add high-quality image URLs
- Set appropriate stock levels
- Use tags for categorization
- Keep descriptions concise

### Order Processing
- Process orders from top to bottom
- Use status badges to track progress
- Message customers via WhatsApp for updates
- Monitor "Active Shipments" for daily deliveries

### Customer Service
- Quick access to customer phone numbers
- One-click WhatsApp messaging
- View customer purchase history
- Track spending patterns

---

## 🔒 Admin Access Control

**Admin Email**: `jafancoadmin@gmail.com`

When logged in as admin:
- Full access to all dashboard features
- Can add, edit, delete products
- Can manage order statuses
- Can view customer information
- Can access analytics

When logged in as regular user:
- Can only see customer account
- Can view own order history
- Cannot access admin features

---

## 📱 Responsive Design

The admin dashboard adapts to different screen sizes:

### Desktop/Tablet (≥768px)
- Full sidebar visible
- Multi-column layout
- All table columns shown
- Hover effects enabled

### Mobile (<768px)
- Sidebar hidden (menu icon)
- Single column layout
- Simplified tables
- Touch-optimized buttons

---

## 🛡️ Security Features

1. **Authentication Required** - Must sign in as admin
2. **Admin Email Check** - Verifies admin credentials
3. **Session Management** - Auto-logout on session expiry
4. **Secure Operations** - All updates go through Supabase
5. **RLS Policies** - Database-level security

---

## 🔄 Real-Time Updates

The dashboard updates in real-time when:
- New orders are placed
- Products are added/edited
- Order statuses change
- Customer places orders
- Stock levels change

---

## 📞 Support & Help

For admin dashboard issues:
1. Check Supabase connection
2. Verify admin credentials
3. Ensure orders/products tables exist
4. Check browser console for errors
5. Hard refresh (Ctrl+Shift+R)

---

**Last Updated**: June 14, 2026  
**Version**: 1.0  
**Admin Access**: jafancoadmin@gmail.com
