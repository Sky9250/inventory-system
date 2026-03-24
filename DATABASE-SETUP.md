# 🗄️ Connect Your System to Supabase Database

This guide will help you connect your inventory system to a **real database** so all your data is stored permanently and shared across your team.

---

## ✅ What You'll Get

- **Permanent storage** - Data never lost, even if browser cleared
- **Team sharing** - Everyone sees same data in real-time
- **Works everywhere** - Desktop, mobile, tablet
- **Automatic backups** - Supabase backs up your data
- **FREE forever** - For teams under 500MB (more than enough)

---

## 📋 Step-by-Step Setup (30 minutes)

### **Step 1: Create Supabase Account**

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub or email
4. Verify your email

### **Step 2: Create a New Project**

1. Click **"New Project"**
2. Fill in:
   - **Name:** Inventory System
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to you (e.g., Mumbai for India)
3. Click **"Create new project"**
4. Wait 2-3 minutes for database to be ready

### **Step 3: Create Database Tables**

1. In Supabase dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Copy-paste this SQL code:

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  supplier TEXT,
  location TEXT,
  description TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machines table
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'Active',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Production logs table
CREATE TABLE production_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  machine_name TEXT,
  quantity_produced INTEGER DEFAULT 0,
  ok_weight DECIMAL(10,2),
  rejected_qty INTEGER DEFAULT 0,
  rejected_weight DECIMAL(10,2),
  date DATE NOT NULL,
  shift TEXT,
  operator TEXT,
  notes TEXT,
  entered_by TEXT,
  stock_before INTEGER,
  stock_after INTEGER,
  entered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispatch logs table
CREATE TABLE dispatch_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  quantity_dispatched INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  order_number TEXT,
  delivery_address TEXT,
  vehicle_details TEXT,
  driver_name TEXT,
  date DATE NOT NULL,
  notes TEXT,
  entered_by TEXT,
  stock_before INTEGER,
  stock_after INTEGER,
  status TEXT DEFAULT 'Dispatched',
  entered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (for authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name) VALUES
  ('Electronics'),
  ('Building Materials'),
  ('Hardware'),
  ('Electrical'),
  ('Plumbing'),
  ('Tools'),
  ('Paint & Supplies'),
  ('Furniture'),
  ('Other');

-- Insert default locations
INSERT INTO locations (name) VALUES
  ('Main Store'),
  ('Warehouse 1'),
  ('Warehouse 2'),
  ('Storage Room'),
  ('Showroom');

-- Insert 20 machines
INSERT INTO machines (name, status) VALUES
  ('Machine 1', 'Active'),
  ('Machine 2', 'Active'),
  ('Machine 3', 'Active'),
  ('Machine 4', 'Active'),
  ('Machine 5', 'Active'),
  ('Machine 6', 'Active'),
  ('Machine 7', 'Active'),
  ('Machine 8', 'Active'),
  ('Machine 9', 'Active'),
  ('Machine 10', 'Active'),
  ('Machine 11', 'Active'),
  ('Machine 12', 'Active'),
  ('Machine 13', 'Active'),
  ('Machine 14', 'Active'),
  ('Machine 15', 'Active'),
  ('Machine 16', 'Active'),
  ('Machine 17', 'Active'),
  ('Machine 18', 'Active'),
  ('Machine 19', 'Active'),
  ('Machine 20', 'Active');

-- Enable Row Level Security (for security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on machines" ON machines FOR ALL USING (true);
CREATE POLICY "Allow all operations on production_logs" ON production_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on dispatch_logs" ON dispatch_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on locations" ON locations FOR ALL USING (true);
```

4. Click **"Run"** button
5. You should see "Success. No rows returned" - this is good!

### **Step 4: Get Your Connection Details**

1. In Supabase dashboard, click **"Settings"** (gear icon bottom left)
2. Click **"API"** in the settings menu
3. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **API Keys** - Copy the `anon` `public` key

**IMPORTANT:** Save these somewhere safe! You'll need them in the next step.

---

## 🔧 Step 5: Update Your Project Files

I've prepared updated files that connect to Supabase. Extract the new ZIP I'll provide and replace these files:

**Files that will change:**
- `src/lib/supabase.js` (NEW file - database connection)
- `src/hooks/useDatabase.js` (NEW file - database queries)
- `package.json` (adds Supabase library)

**Files that stay the same:**
- All your UI/CSS files
- All page designs
- Mobile responsiveness

---

## 🔐 Step 6: Add Your Supabase Credentials

Create a file called `.env` in your project root:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace with your actual values from Step 4.

**IMPORTANT:** Never share your `.env` file publicly!

---

## 🚀 Step 7: Test It

1. Stop your dev server (Ctrl+C)
2. Run: `npm install` (installs Supabase library)
3. Run: `npm run dev`
4. Open the app
5. Add a product → Check Supabase dashboard → You'll see it in the database!

---

## ✅ What Works After Connection

**Real-time sharing:**
- Person A adds product → Person B sees it instantly
- Production entry → Everyone's dashboard updates
- Dispatch recorded → Stock changes for everyone

**Permanent storage:**
- Close browser → Data stays
- Clear cache → Data stays
- Access from phone → Same data
- Server restart → Data stays

**Backup:**
- Supabase automatically backs up daily
- You can export anytime from dashboard

---

## 📊 View Your Data

Go to Supabase dashboard → **"Table Editor"** → Click any table:
- `products` - All your products
- `machines` - All 20 machines
- `production_logs` - All production entries
- `dispatch_logs` - All dispatch entries

You can edit data directly here if needed!

---

## 🔒 Security Notes

**Current setup:** Anyone with the URL can access (for testing)

**For production, you should:**
1. Enable Supabase Authentication
2. Add login with email/password
3. Restrict table access by user role
4. I can help you set this up once basic connection works

---

## ❓ Troubleshooting

**"Failed to fetch"**
→ Check your `.env` file has correct URL and key

**"Relation does not exist"**
→ Run the SQL from Step 3 again in Supabase SQL Editor

**"Insert violates foreign key constraint"**
→ Make sure products exist before adding production logs

**Data not showing**
→ Check Supabase dashboard → Table Editor → See if data is there

---

## 📞 Next Steps

1. I'll create the updated project files with Supabase integration
2. You follow steps 1-4 above to set up Supabase
3. Extract my new ZIP, add `.env` file with your credentials
4. Run `npm install` and `npm run dev`
5. Everything works with real database!

**Want me to create the Supabase-connected version now?** Just say "yes" and I'll build it! 🚀
