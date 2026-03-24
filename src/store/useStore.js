import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SAMPLE_PRODUCTS = [
  { id: '1', sku: 'LAPTOP-001', name: 'Dell XPS 15 Laptop', category: 'Electronics', quantity: 24, minStock: 10, price: 1299.99, supplier: 'Dell Inc.', lastUpdated: new Date().toISOString(), location: 'Warehouse A', description: 'High-performance laptop' },
  { id: '2', sku: 'CHAIR-045', name: 'Ergonomic Office Chair', category: 'Furniture', quantity: 7, minStock: 15, price: 349.99, supplier: 'Office Pro', lastUpdated: new Date().toISOString(), location: 'Warehouse B', description: 'Mesh chair with lumbar support' },
  { id: '3', sku: 'MON-234', name: 'LG 27" 4K Monitor', category: 'Electronics', quantity: 32, minStock: 12, price: 449.99, supplier: 'LG Electronics', lastUpdated: new Date().toISOString(), location: 'Warehouse A', description: 'Ultra HD display' },
  { id: '4', sku: 'KEY-089', name: 'Mechanical Keyboard', category: 'Electronics', quantity: 3, minStock: 20, price: 129.99, supplier: 'Logitech', lastUpdated: new Date().toISOString(), location: 'Warehouse A', description: 'RGB mechanical keyboard' },
];

const SAMPLE_USERS = [
  { id: '1', email: 'admin@company.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { id: '2', email: 'production@company.com', password: 'prod123', name: 'Production Manager', role: 'production' },
  { id: '3', email: 'dispatch@company.com', password: 'disp123', name: 'Dispatch Manager', role: 'dispatch' },
  { id: '4', email: 'manager@company.com', password: 'manager123', name: 'Manager', role: 'manager' },
];

export const useStore = create(
  persist(
    (set, get) => ({
      // ─── AUTH ───────────────────────────────────────────────
      user: null,
      isAuthenticated: false,
      users: SAMPLE_USERS,

      login: (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (user) {
          const { password: _, ...u } = user;
          set({ user: u, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),

      // ─── PRODUCTS ───────────────────────────────────────────
      products: SAMPLE_PRODUCTS,
      categories: ['Electronics', 'Building Materials', 'Hardware', 'Electrical', 'Plumbing', 'Tools', 'Paint & Supplies', 'Furniture', 'Other'],
      locations: ['Main Store', 'Warehouse 1', 'Warehouse 2', 'Storage Room', 'Showroom'],

      // ─── MACHINES ───────────────────────────────────────────
      machines: [
        { id: '1', name: 'Machine 1', status: 'Active', description: '' },
        { id: '2', name: 'Machine 2', status: 'Active', description: '' },
        { id: '3', name: 'Machine 3', status: 'Active', description: '' },
        { id: '4', name: 'Machine 4', status: 'Active', description: '' },
        { id: '5', name: 'Machine 5', status: 'Active', description: '' },
        { id: '6', name: 'Machine 6', status: 'Active', description: '' },
        { id: '7', name: 'Machine 7', status: 'Active', description: '' },
        { id: '8', name: 'Machine 8', status: 'Active', description: '' },
        { id: '9', name: 'Machine 9', status: 'Active', description: '' },
        { id: '10', name: 'Machine 10', status: 'Active', description: '' },
        { id: '11', name: 'Machine 11', status: 'Active', description: '' },
        { id: '12', name: 'Machine 12', status: 'Active', description: '' },
        { id: '13', name: 'Machine 13', status: 'Active', description: '' },
        { id: '14', name: 'Machine 14', status: 'Active', description: '' },
        { id: '15', name: 'Machine 15', status: 'Active', description: '' },
        { id: '16', name: 'Machine 16', status: 'Active', description: '' },
        { id: '17', name: 'Machine 17', status: 'Active', description: '' },
        { id: '18', name: 'Machine 18', status: 'Active', description: '' },
        { id: '19', name: 'Machine 19', status: 'Active', description: '' },
        { id: '20', name: 'Machine 20', status: 'Active', description: '' },
      ],

      addMachine: (machine) => {
        const trimmed = machine.name?.trim();
        if (!trimmed) return false;
        const exists = get().machines.some(m => m.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) return false;
        set(s => ({ machines: [...s.machines, { id: Date.now().toString(), name: trimmed, status: machine.status || 'Active', description: machine.description || '' }] }));
        return true;
      },
      updateMachine: (id, updates) => set(s => ({ machines: s.machines.map(m => m.id === id ? { ...m, ...updates } : m) })),
      deleteMachine: (id) => set(s => ({ machines: s.machines.filter(m => m.id !== id) })),
      searchQuery: '',
      selectedCategory: 'All',
      stockFilter: 'All',

      addProduct: (product) => set(state => ({ products: [...state.products, { ...product, id: Date.now().toString(), lastUpdated: new Date().toISOString() }] })),
      updateProduct: (id, updates) => set(state => ({ products: state.products.map(p => p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p) })),
      deleteProduct: (id) => set(state => ({ products: state.products.filter(p => p.id !== id) })),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedCategory: (c) => set({ selectedCategory: c }),
      setStockFilter: (f) => set({ stockFilter: f }),

      addCategory: (cat) => {
        const t = cat.trim();
        if (!t || get().categories.some(c => c.toLowerCase() === t.toLowerCase())) return false;
        set(s => ({ categories: [...s.categories, t] })); return true;
      },
      editCategory: (old, name) => {
        const t = name.trim();
        if (!t) return false;
        set(s => ({ categories: s.categories.map(c => c === old ? t : c), products: s.products.map(p => p.category === old ? { ...p, category: t } : p) })); return true;
      },
      deleteCategory: (cat) => set(s => ({ categories: s.categories.filter(c => c !== cat) })),

      addLocation: (loc) => {
        const t = loc.trim();
        if (!t || get().locations.some(l => l.toLowerCase() === t.toLowerCase())) return false;
        set(s => ({ locations: [...s.locations, t] })); return true;
      },
      editLocation: (old, name) => {
        const t = name.trim();
        if (!t) return false;
        set(s => ({ locations: s.locations.map(l => l === old ? t : l), products: s.products.map(p => p.location === old ? { ...p, location: t } : p) })); return true;
      },
      deleteLocation: (loc) => set(s => ({ locations: s.locations.filter(l => l !== loc) })),

      getFilteredProducts: () => {
        const { products, searchQuery, selectedCategory, stockFilter } = get();
        return products.filter(product => {
          const q = searchQuery.toLowerCase();
          const matchesSearch = !q ||
            (product.name || '').toLowerCase().includes(q) ||
            (product.sku || '').toLowerCase().includes(q) ||
            (product.category || '').toLowerCase().includes(q) ||
            (product.supplier || '').toLowerCase().includes(q) ||
            (product.location || '').toLowerCase().includes(q) ||
            (product.description || '').toLowerCase().includes(q) ||
            String(product.price || '').includes(q);
          const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
          let matchesStock = true;
          if (stockFilter === 'In Stock') matchesStock = product.quantity > product.minStock;
          else if (stockFilter === 'Low Stock') matchesStock = product.quantity > 0 && product.quantity <= product.minStock;
          else if (stockFilter === 'Out of Stock') matchesStock = product.quantity === 0;
          return matchesSearch && matchesCategory && matchesStock;
        });
      },
      getLowStockProducts: () => get().products.filter(p => p.quantity > 0 && p.quantity <= p.minStock),
      getOutOfStockProducts: () => get().products.filter(p => p.quantity === 0),
      getTotalInventoryValue: () => get().products.reduce((t, p) => t + p.price * p.quantity, 0),

      // ─── PRODUCTION ─────────────────────────────────────────
      productionLogs: [],

      addProductionEntry: (entry) => {
        const { products, machines } = get();
        const product = products.find(p => p.id === entry.productId);
        if (!product) return { success: false, message: 'Product not found' };
        const machine = machines.find(m => m.id === entry.machineId);

        const newQuantity = product.quantity + (entry.quantityProduced || 0);
        const log = {
          id: Date.now().toString(),
          productId: entry.productId,
          productName: product.name,
          productSku: product.sku,
          machineId: entry.machineId || '',
          machineName: machine?.name || '',
          quantityProduced: entry.quantityProduced || 0,
          okWeight: entry.okWeight || '',
          rejectedQty: entry.rejectedQty || 0,
          rejectedWeight: entry.rejectedWeight || '',
          date: entry.date || new Date().toISOString(),
          shift: entry.shift || 'Morning',
          operator: entry.operator || '',
          notes: entry.notes || '',
          enteredBy: get().user?.name || 'Unknown',
          enteredAt: new Date().toISOString(),
          stockBefore: product.quantity,
          stockAfter: newQuantity,
          source: entry.source || 'production', // 'production' or 'machine'
        };

        set(state => ({
          productionLogs: [log, ...state.productionLogs],
          products: state.products.map(p =>
            p.id === entry.productId
              ? { ...p, quantity: newQuantity, lastUpdated: new Date().toISOString() }
              : p
          ),
        }));
        return { success: true, message: `Stock updated: ${product.quantity} → ${newQuantity}`, log };
      },

      deleteProductionLog: (id) => {
        const log = get().productionLogs.find(l => l.id === id);
        if (!log) return;
        set(state => ({
          productionLogs: state.productionLogs.filter(l => l.id !== id),
          products: state.products.map(p =>
            p.id === log.productId
              ? { ...p, quantity: Math.max(0, p.quantity - log.quantityProduced), lastUpdated: new Date().toISOString() }
              : p
          ),
        }));
      },

      editProductionLog: (id, updates) => {
        const log = get().productionLogs.find(l => l.id === id);
        if (!log) return { success: false, message: 'Log not found' };
        const product = get().products.find(p => p.id === log.productId);
        if (!product) return { success: false, message: 'Product not found' };

        const oldQty = log.quantityProduced || 0;
        const newQty = parseInt(updates.quantityProduced) || 0;
        const qtyDiff = newQty - oldQty;
        const newProductQty = Math.max(0, product.quantity + qtyDiff);

        set(state => ({
          productionLogs: state.productionLogs.map(l =>
            l.id === id ? {
              ...l,
              quantityProduced: newQty,
              okWeight: updates.okWeight ?? l.okWeight,
              rejectedQty: parseInt(updates.rejectedQty) || 0,
              rejectedWeight: updates.rejectedWeight ?? l.rejectedWeight,
              shift: updates.shift || l.shift,
              date: updates.date || l.date,
              stockAfter: l.stockBefore + newQty,
              editedBy: get().user?.name || 'Unknown',
              editedAt: new Date().toISOString(),
            } : l
          ),
          products: state.products.map(p =>
            p.id === log.productId
              ? { ...p, quantity: newProductQty, lastUpdated: new Date().toISOString() }
              : p
          ),
        }));
        return { success: true, message: 'Entry updated successfully' };
      },

      // ─── DISPATCH ───────────────────────────────────────────
      dispatchLogs: [],

      addDispatchEntry: (entry) => {
        const { products } = get();
        const product = products.find(p => p.id === entry.productId);
        if (!product) return { success: false, message: 'Product not found' };
        if (product.quantity < entry.quantityDispatched) {
          return { success: false, message: `Not enough stock! Available: ${product.quantity}, Requested: ${entry.quantityDispatched}` };
        }

        const newQuantity = product.quantity - entry.quantityDispatched;
        const isLowStock = newQuantity > 0 && newQuantity <= product.minStock;
        const isOutOfStock = newQuantity === 0;

        const log = {
          id: Date.now().toString(),
          productId: entry.productId,
          productName: product.name,
          productSku: product.sku,
          quantityDispatched: entry.quantityDispatched,
          customerName: entry.customerName || '',
          orderNumber: entry.orderNumber || '',
          deliveryAddress: entry.deliveryAddress || '',
          vehicleType: entry.vehicleType || '',
          vehicleDetails: entry.vehicleDetails || '',
          driverName: entry.driverName || '',
          date: entry.date || new Date().toISOString(),
          notes: entry.notes || '',
          enteredBy: get().user?.name || 'Unknown',
          enteredAt: new Date().toISOString(),
          stockBefore: product.quantity,
          stockAfter: newQuantity,
          status: 'Dispatched',
        };

        set(state => ({
          dispatchLogs: [log, ...state.dispatchLogs],
          products: state.products.map(p =>
            p.id === entry.productId
              ? { ...p, quantity: newQuantity, lastUpdated: new Date().toISOString() }
              : p
          ),
        }));

        let alertMessage = null;
        if (isOutOfStock) alertMessage = `⚠️ OUT OF STOCK: ${product.name} is now out of stock!`;
        else if (isLowStock) alertMessage = `⚠️ LOW STOCK: ${product.name} only has ${newQuantity} units left (minimum: ${product.minStock})`;

        return { success: true, message: `Dispatched successfully. Stock: ${product.quantity} → ${newQuantity}`, alert: alertMessage, log };
      },

      deleteDispatchLog: (id) => {
        const log = get().dispatchLogs.find(l => l.id === id);
        if (!log) return;
        set(state => ({
          dispatchLogs: state.dispatchLogs.filter(l => l.id !== id),
          products: state.products.map(p =>
            p.id === log.productId
              ? { ...p, quantity: p.quantity + log.quantityDispatched, lastUpdated: new Date().toISOString() }
              : p
          ),
        }));
      },

      editDispatchLog: (id, updates) => {
        const log = get().dispatchLogs.find(l => l.id === id);
        if (!log) return { success: false, message: 'Entry not found' };
        const product = get().products.find(p => p.id === log.productId);
        if (!product) return { success: false, message: 'Product not found' };

        const oldQty = log.quantityDispatched || 0;
        const newQty = parseInt(updates.quantityDispatched) || 0;
        const qtyDiff = newQty - oldQty;
        const newProductQty = product.quantity - qtyDiff;

        if (newProductQty < 0) {
          return { success: false, message: `Not enough stock! Available: ${product.quantity}, Additional needed: ${qtyDiff}` };
        }

        set(state => ({
          dispatchLogs: state.dispatchLogs.map(l =>
            l.id === id ? {
              ...l,
              quantityDispatched: newQty,
              customerName: updates.customerName ?? l.customerName,
              orderNumber: updates.orderNumber ?? l.orderNumber,
              deliveryAddress: updates.deliveryAddress ?? l.deliveryAddress,
              vehicleType: updates.vehicleType ?? l.vehicleType,
              vehicleDetails: updates.vehicleDetails ?? l.vehicleDetails,
              driverName: updates.driverName ?? l.driverName,
              date: updates.date || l.date,
              notes: updates.notes ?? l.notes,
              stockAfter: l.stockBefore - newQty,
              editedBy: get().user?.name || 'Unknown',
              editedAt: new Date().toISOString(),
            } : l
          ),
          products: state.products.map(p =>
            p.id === log.productId
              ? { ...p, quantity: newProductQty, lastUpdated: new Date().toISOString() }
              : p
          ),
        }));
        return { success: true, message: 'Dispatch entry updated successfully' };
      },

      // ─── COMPUTED ───────────────────────────────────────────
      // ─── ELECTRICITY ────────────────────────────────────
      electricitySources: [
        { id: 'elec-1', name: 'Office' },
        { id: 'elec-2', name: 'Grinder' },
        { id: 'elec-3', name: 'Shredder' },
      ],
      electricityLogs: [],

      addElectricitySource: (source) => {
        const trimmed = source.name?.trim();
        if (!trimmed) return false;
        const exists = get().electricitySources.some(s => s.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) return false;
        set(s => ({ electricitySources: [...s.electricitySources, { id: Date.now().toString(), name: trimmed }] }));
        return true;
      },
      updateElectricitySource: (id, updates) => set(s => ({ electricitySources: s.electricitySources.map(x => x.id === id ? { ...x, ...updates } : x) })),
      deleteElectricitySource: (id) => set(s => ({ electricitySources: s.electricitySources.filter(x => x.id !== id) })),

      addElectricityEntry: (entry) => {
        const log = {
          id: Date.now().toString(),
          date: entry.date,
          sourceId: entry.sourceId,
          sourceName: entry.sourceName,
          sourceType: entry.sourceType, // 'machine' or 'other'
          units: entry.units || 0,
          notes: entry.notes || '',
          enteredBy: get().user?.name || 'Unknown',
          enteredAt: new Date().toISOString(),
        };
        set(state => ({ electricityLogs: [log, ...state.electricityLogs] }));
        return { success: true, message: 'Electricity entry recorded', log };
      },

      deleteElectricityLog: (id) => {
        set(state => ({ electricityLogs: state.electricityLogs.filter(l => l.id !== id) }));
      },

      editElectricityLog: (id, updates) => {
        set(state => ({
          electricityLogs: state.electricityLogs.map(l =>
            l.id === id ? {
              ...l,
              ...updates,
              editedBy: get().user?.name || 'Unknown',
              editedAt: new Date().toISOString(),
            } : l
          )
        }));
        return { success: true, message: 'Log updated successfully' };
      },

      // ─── RAW MATERIALS ──────────────────────────────────────
      rmCategories: ['Metals', 'Polymers', 'Chemicals', 'Packaging', 'Other'],
      rmItems: [
        { id: 'rm1', name: 'Steel Sheet', unit: 'kg', quantity: 0, minStock: 100, category: 'Metals' },
        { id: 'rm2', name: 'Aluminum Rod', unit: 'kg', quantity: 0, minStock: 50, category: 'Metals' },
        { id: 'rm3', name: 'Copper Wire', unit: 'meter', quantity: 0, minStock: 500, category: 'Metals' },
      ],
      rmInward: [],
      rmOutward: [],

      addRMCategory: (cat) => {
        const t = cat.trim();
        if (!t || get().rmCategories.some(c => c.toLowerCase() === t.toLowerCase())) return false;
        set(s => ({ rmCategories: [...s.rmCategories, t] })); return true;
      },
      editRMCategory: (old, name) => {
        const t = name.trim();
        if (!t) return false;
        set(s => ({ rmCategories: s.rmCategories.map(c => c === old ? t : c), rmItems: s.rmItems.map(i => i.category === old ? { ...i, category: t } : i) })); return true;
      },
      deleteRMCategory: (cat) => set(s => ({ rmCategories: s.rmCategories.filter(c => c !== cat) })),

      addRMItem: (item) => {
        const trimmed = item.name?.trim();
        if (!trimmed) return false;
        const exists = get().rmItems.some(i => i.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) return false;
        set(s => ({
          rmItems: [...s.rmItems, {
            id: Date.now().toString(),
            name: trimmed,
            unit: item.unit || 'kg',
            quantity: 0,
            minStock: item.minStock || 0,
            category: item.category || ''
          }]
        }));
        return true;
      },

      updateRMItem: (id, updates) => set(s => ({
        rmItems: s.rmItems.map(i => i.id === id ? { ...i, ...updates } : i)
      })),

      deleteRMItem: (id) => set(s => ({ rmItems: s.rmItems.filter(i => i.id !== id) })),

      addRMInward: (entry) => {
        const rmItem = get().rmItems.find(i => i.id === entry.rmId);
        if (!rmItem) return { success: false, message: 'Material not found' };

        const newQty = rmItem.quantity + entry.quantity;
        const log = {
          id: Date.now().toString(),
          rmId: entry.rmId,
          rmName: rmItem.name,
          unit: rmItem.unit,
          quantity: entry.quantity,
          rate: entry.rate || 0,
          supplier: entry.supplier || '',
          billNo: entry.billNo || '',
          date: entry.date,
          notes: entry.notes || '',
          stockBefore: rmItem.quantity,
          stockAfter: newQty,
          enteredBy: get().user?.name || 'Unknown',
          enteredAt: new Date().toISOString(),
        };

        set(state => ({
          rmInward: [log, ...state.rmInward],
          rmItems: state.rmItems.map(i =>
            i.id === entry.rmId ? { ...i, quantity: newQty } : i
          ),
        }));
        return { success: true, log };
      },

      addRMOutward: (entry) => {
        const rmItem = get().rmItems.find(i => i.id === entry.rmId);
        if (!rmItem) return { success: false, message: 'Material not found' };
        if (rmItem.quantity < entry.quantity)
          return { success: false, message: `Only ${rmItem.quantity} ${rmItem.unit} available!` };

        const newQty = rmItem.quantity - entry.quantity;
        const log = {
          id: Date.now().toString(),
          rmId: entry.rmId,
          rmName: rmItem.name,
          unit: rmItem.unit,
          quantity: entry.quantity,
          purpose: entry.purpose || '',
          issuedTo: entry.issuedTo || '',
          date: entry.date,
          notes: entry.notes || '',
          stockBefore: rmItem.quantity,
          stockAfter: newQty,
          enteredBy: get().user?.name || 'Unknown',
          enteredAt: new Date().toISOString(),
        };

        set(state => ({
          rmOutward: [log, ...state.rmOutward],
          rmItems: state.rmItems.map(i =>
            i.id === entry.rmId ? { ...i, quantity: newQty } : i
          ),
        }));
        return { success: true, log };
      },

      deleteRMInward: (id) => {
        const log = get().rmInward.find(l => l.id === id);
        if (!log) return;
        set(state => ({
          rmInward: state.rmInward.filter(l => l.id !== id),
          rmItems: state.rmItems.map(i =>
            i.id === log.rmId ? { ...i, quantity: i.quantity - log.quantity } : i
          ),
        }));
      },

      editRMInward: (id, updates) => {
        const log = get().rmInward.find(l => l.id === id);
        if (!log) return { success: false, message: 'Entry not found' };
        const rmItem = get().rmItems.find(i => i.id === log.rmId);
        if (!rmItem) return { success: false, message: 'Material not found' };

        const oldQty = log.quantity || 0;
        const newQty = parseFloat(updates.quantity) || 0;
        const qtyDiff = newQty - oldQty;
        const newItemQty = Math.max(0, rmItem.quantity + qtyDiff);

        set(state => ({
          rmInward: state.rmInward.map(l =>
            l.id === id ? {
              ...l,
              quantity: newQty,
              rate: parseFloat(updates.rate) || 0,
              supplier: updates.supplier ?? l.supplier,
              billNo: updates.billNo ?? l.billNo,
              date: updates.date || l.date,
              notes: updates.notes ?? l.notes,
              stockAfter: l.stockBefore + newQty,
              editedBy: get().user?.name || 'Unknown',
              editedAt: new Date().toISOString(),
            } : l
          ),
          rmItems: state.rmItems.map(i =>
            i.id === log.rmId ? { ...i, quantity: newItemQty } : i
          ),
        }));
        return { success: true, message: 'Inward entry updated successfully' };
      },

      deleteRMOutward: (id) => {
        const log = get().rmOutward.find(l => l.id === id);
        if (!log) return;
        set(state => ({
          rmOutward: state.rmOutward.filter(l => l.id !== id),
          rmItems: state.rmItems.map(i =>
            i.id === log.rmId ? { ...i, quantity: i.quantity + log.quantity } : i
          ),
        }));
      },

      getTodayProduction: () => {
        const today = new Date().toDateString();
        return get().productionLogs.filter(l => new Date(l.enteredAt).toDateString() === today);
      },
      getTodayDispatches: () => {
        const today = new Date().toDateString();
        return get().dispatchLogs.filter(l => new Date(l.enteredAt).toDateString() === today);
      },
    }),
    {
      name: 'inventory-storage-v2',
      version: 3,
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Ensure all 20 machines exist for users with old data
          const defaultMachines = Array.from({ length: 20 }, (_, i) => ({
            id: String(i + 1),
            name: `Machine ${i + 1}`,
            status: 'Active',
            description: '',
          }));
          const existingIds = new Set((persistedState.machines || []).map(m => m.id));
          const merged = [
            ...(persistedState.machines || []),
            ...defaultMachines.filter(m => !existingIds.has(m.id)),
          ];
          persistedState.machines = merged;
        }
        if (version < 3) {
          // Add raw material categories for existing users
          if (!persistedState.rmCategories) {
            persistedState.rmCategories = ['Metals', 'Polymers', 'Chemicals', 'Packaging', 'Other'];
          }
          // Ensure existing RM items have a category field
          if (persistedState.rmItems) {
            persistedState.rmItems = persistedState.rmItems.map(i => ({ ...i, category: i.category || '' }));
          }
        }
        return persistedState;
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        products: state.products,
        categories: state.categories,
        locations: state.locations,
        machines: state.machines,
        productionLogs: state.productionLogs,
        dispatchLogs: state.dispatchLogs,
        electricitySources: state.electricitySources,
        electricityLogs: state.electricityLogs,
        rmCategories: state.rmCategories,
        rmItems: state.rmItems,
        rmInward: state.rmInward,
        rmOutward: state.rmOutward,
      }),
    }
  )
);
