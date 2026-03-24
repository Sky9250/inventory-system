# 🗄️ Complete Database Structure - Inventory System

This document shows all tables, their relationships, and how they connect.

---

## 📊 Database Overview

```
┌─────────────────┐
│   CORE SYSTEM   │
├─────────────────┤
│ • users         │ ← Authentication
│ • categories    │ ← Product categories
│ • locations     │ ← Storage locations
│ • machines      │ ← Production machines
└─────────────────┘
         ↓
┌─────────────────┐
│   INVENTORY     │
├─────────────────┤
│ • products      │ ← Finished goods
│ • rm_items      │ ← Raw materials
└─────────────────┘
         ↓
┌─────────────────────────────────┐
│   TRANSACTIONS (Connected)      │
├─────────────────────────────────┤
│ • production_logs    → products │
│ • dispatch_logs      → products │
│ • rm_inward         → rm_items  │
│ • rm_outward        → rm_items  │
│ • electricity_logs  → machines  │
└─────────────────────────────────┘
```

---

## 🔗 Table Relationships

### **1. Core System Tables**

#### **users** (Authentication)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- Hashed
  name TEXT NOT NULL,
  role TEXT NOT NULL,      -- admin, manager, production, dispatch, staff
  created_at TIMESTAMP DEFAULT NOW()
);
```
**No foreign keys** - Base table for authentication

---

#### **categories** (Product Categories)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```
**Used by:** `products` table

---

#### **locations** (Storage Locations)
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```
**Used by:** `products` table

---

#### **machines** (Production Machines)
```sql
CREATE TABLE machines (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'Active',  -- Active, Maintenance, Inactive
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```
**Used by:** `production_logs`, `electricity_logs`

---

### **2. Inventory Tables**

#### **products** (Finished Goods Inventory)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,           -- FK → categories.name
  location TEXT,                    -- FK → locations.name
  quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  supplier TEXT,
  description TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```
**Foreign Keys:**
- `category` → references `categories.name`
- `location` → references `locations.name`

**Used by:** 
- `production_logs` (increases stock)
- `dispatch_logs` (decreases stock)

---

#### **rm_items** (Raw Materials Inventory)
```sql
CREATE TABLE rm_items (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  unit TEXT NOT NULL,               -- kg, ton, liter, meter, piece, box
  quantity DECIMAL(10,2) DEFAULT 0,
  min_stock DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```
**No foreign keys** - Base table for raw materials

**Used by:**
- `rm_inward` (increases stock)
- `rm_outward` (decreases stock)

---

### **3. Transaction Tables (Connected)**

#### **production_logs** (Production Tracking)
```sql
CREATE TABLE production_logs (
  id UUID PRIMARY KEY,
  
  -- Product Link
  product_id UUID NOT NULL,         -- FK → products.id
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  
  -- Machine Link (Optional)
  machine_id UUID,                  -- FK → machines.id
  machine_name TEXT,
  
  -- Production Data
  quantity_produced INTEGER NOT NULL,
  ok_weight DECIMAL(10,2),
  rejected_qty INTEGER DEFAULT 0,
  rejected_weight DECIMAL(10,2),
  
  -- Metadata
  date DATE NOT NULL,
  shift TEXT,                       -- Morning, Afternoon, Night
  operator TEXT,
  notes TEXT,
  source TEXT DEFAULT 'production', -- 'production' or 'machine'
  
  -- Stock Tracking
  stock_before INTEGER,
  stock_after INTEGER,
  
  -- Audit
  entered_by TEXT,
  entered_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL
);
```

**Relationships:**
- `product_id` → `products.id` (Which product was produced)
- `machine_id` → `machines.id` (Which machine produced it)
- **Automatically increases** `products.quantity` when created
- **Automatically decreases** `products.quantity` when deleted

---

#### **dispatch_logs** (Dispatch/Sales Tracking)
```sql
CREATE TABLE dispatch_logs (
  id UUID PRIMARY KEY,
  
  -- Product Link
  product_id UUID NOT NULL,         -- FK → products.id
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  
  -- Dispatch Data
  quantity_dispatched INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  order_number TEXT,
  delivery_address TEXT,
  vehicle_details TEXT,
  driver_name TEXT,
  date DATE NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'Dispatched',
  
  -- Stock Tracking
  stock_before INTEGER,
  stock_after INTEGER,
  
  -- Audit
  entered_by TEXT,
  entered_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

**Relationships:**
- `product_id` → `products.id` (Which product was dispatched)
- **Automatically decreases** `products.quantity` when created
- **Automatically increases** `products.quantity` when deleted
- **Validates** sufficient stock before allowing dispatch

---

#### **rm_inward** (Raw Material Purchases)
```sql
CREATE TABLE rm_inward (
  id UUID PRIMARY KEY,
  
  -- RM Link
  rm_id UUID NOT NULL,              -- FK → rm_items.id
  rm_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  
  -- Purchase Data
  quantity DECIMAL(10,2) NOT NULL,
  rate DECIMAL(10,2) DEFAULT 0,     -- Price per unit
  supplier TEXT,
  bill_no TEXT,
  date DATE NOT NULL,
  notes TEXT,
  
  -- Stock Tracking
  stock_before DECIMAL(10,2),
  stock_after DECIMAL(10,2),
  
  -- Audit
  entered_by TEXT,
  entered_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (rm_id) REFERENCES rm_items(id) ON DELETE CASCADE
);
```

**Relationships:**
- `rm_id` → `rm_items.id` (Which raw material was purchased)
- **Automatically increases** `rm_items.quantity` when created
- **Automatically decreases** `rm_items.quantity` when deleted

**Calculated Fields:**
- `amount` = `quantity` × `rate` (calculated in reports)

---

#### **rm_outward** (Raw Material Issues)
```sql
CREATE TABLE rm_outward (
  id UUID PRIMARY KEY,
  
  -- RM Link
  rm_id UUID NOT NULL,              -- FK → rm_items.id
  rm_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  
  -- Issue Data
  quantity DECIMAL(10,2) NOT NULL,
  purpose TEXT,                     -- Production, Maintenance, etc.
  issued_to TEXT,                   -- Person/Department
  date DATE NOT NULL,
  notes TEXT,
  
  -- Stock Tracking
  stock_before DECIMAL(10,2),
  stock_after DECIMAL(10,2),
  
  -- Audit
  entered_by TEXT,
  entered_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (rm_id) REFERENCES rm_items(id) ON DELETE CASCADE
);
```

**Relationships:**
- `rm_id` → `rm_items.id` (Which raw material was issued)
- **Automatically decreases** `rm_items.quantity` when created
- **Automatically increases** `rm_items.quantity` when deleted
- **Validates** sufficient stock before allowing issue

---

#### **electricity_logs** (Electricity Consumption)
```sql
CREATE TABLE electricity_logs (
  id UUID PRIMARY KEY,
  
  -- Source Link
  source_id UUID,                   -- FK → machines.id OR electricity_sources.id
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,        -- 'machine' or 'other'
  
  -- Consumption Data
  date DATE NOT NULL,
  units DECIMAL(10,2) NOT NULL,     -- kWh consumed
  notes TEXT,
  
  -- Audit
  entered_by TEXT,
  entered_at TIMESTAMP DEFAULT NOW()
);
```

**Relationships:**
- `source_id` → `machines.id` (if source_type = 'machine')
- `source_id` → `electricity_sources.id` (if source_type = 'other')
- **Does NOT affect stock** - tracking only

---

#### **electricity_sources** (Non-Machine Electricity Sources)
```sql
CREATE TABLE electricity_sources (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,        -- Office, Grinder, Shredder, etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```
**Used by:** `electricity_logs` (when source_type = 'other')

---

## 🔄 Complete Data Flow Examples

### **Example 1: Production Flow**

```
1. Machine Entry Page:
   User enters: Machine 1 produced 50 units of Panel Float
   
2. System creates production_log:
   - product_id = Panel Float ID
   - machine_id = Machine 1 ID
   - quantity_produced = 50
   - stock_before = 100
   - stock_after = 150
   
3. System updates products table:
   - Panel Float.quantity: 100 → 150
   
4. Data appears in:
   - Machine Entry history
   - Production Reports page
   - Dashboard (today's production)
```

---

### **Example 2: Dispatch Flow**

```
1. Dispatch Page:
   User enters: Dispatch 20 units of Panel Float to Customer A
   
2. System validates:
   - Check Panel Float.quantity >= 20 ✓
   
3. System creates dispatch_log:
   - product_id = Panel Float ID
   - quantity_dispatched = 20
   - customer_name = Customer A
   - stock_before = 150
   - stock_after = 130
   
4. System updates products table:
   - Panel Float.quantity: 150 → 130
   
5. Data appears in:
   - Dispatch history
   - Reports page
   - Dashboard
```

---

### **Example 3: Raw Material Flow**

```
1. RM Inward Page:
   User enters: Purchased 500 kg Steel Sheet @ ₹80/kg
   
2. System creates rm_inward:
   - rm_id = Steel Sheet ID
   - quantity = 500
   - rate = 80
   - stock_before = 0
   - stock_after = 500
   
3. System updates rm_items table:
   - Steel Sheet.quantity: 0 → 500
   
4. Later, RM Outward:
   User enters: Issued 100 kg Steel Sheet to Production
   
5. System creates rm_outward:
   - rm_id = Steel Sheet ID
   - quantity = 100
   - purpose = Production
   - stock_before = 500
   - stock_after = 400
   
6. System updates rm_items table:
   - Steel Sheet.quantity: 500 → 400
```

---

## 📈 Key Insights

### **Stock Updates are Automatic:**

| Action | Table Updated | Stock Change |
|--------|---------------|--------------|
| Production entry | `products.quantity` | ↑ Increases |
| Dispatch entry | `products.quantity` | ↓ Decreases |
| RM Inward | `rm_items.quantity` | ↑ Increases |
| RM Outward | `rm_items.quantity` | ↓ Decreases |
| Delete production | `products.quantity` | ↓ Reverses |
| Delete dispatch | `products.quantity` | ↑ Reverses |

### **Data Integrity Rules:**

1. **CASCADE DELETE**: If product deleted → all production/dispatch logs deleted
2. **SET NULL**: If machine deleted → production logs keep data but machine_id = null
3. **VALIDATION**: Dispatch/RM Outward blocked if insufficient stock
4. **AUDIT TRAIL**: Every transaction tracks who entered it and when

### **Reporting Capabilities:**

```sql
-- Production by machine
SELECT machine_name, SUM(quantity_produced)
FROM production_logs
WHERE date BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY machine_name;

-- Raw material consumption by purpose
SELECT purpose, SUM(quantity)
FROM rm_outward
WHERE date BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY purpose;

-- Electricity by source type
SELECT source_type, SUM(units)
FROM electricity_logs
WHERE date = '2026-02-20'
GROUP BY source_type;
```

---

## 🔐 Security Considerations

1. **Row Level Security**: Enable on all tables
2. **User Roles**: Control access via `users.role`
3. **Audit Logging**: All transactions have `entered_by` and `entered_at`
4. **Soft Deletes**: Consider adding `deleted_at` field instead of hard deletes

---

This structure is optimized for:
- ✅ Real-time stock tracking
- ✅ Complete audit trail
- ✅ Multi-user access
- ✅ Report generation
- ✅ Data integrity

Ready to implement in Supabase! 🚀
