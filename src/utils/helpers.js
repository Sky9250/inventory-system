import { format } from 'date-fns';

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch {
    return 'N/A';
  }
};

// Format date with time
export const formatDateTime = (date) => {
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'N/A';
  }
};

// Get stock status
export const getStockStatus = (quantity, minStock) => {
  if (quantity === 0) {
    return { status: 'Out of Stock', color: 'danger' };
  } else if (quantity <= minStock) {
    return { status: 'Low Stock', color: 'warning' };
  } else {
    return { status: 'In Stock', color: 'success' };
  }
};

// Export to CSV
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate inventory report data
export const generateInventoryReport = (products) => {
  return products.map((product) => ({
    SKU: product.sku,
    Name: product.name,
    Category: product.category,
    Quantity: product.quantity,
    'Min Stock': product.minStock,
    Price: product.price,
    'Total Value': (product.price * product.quantity).toFixed(2),
    Status: getStockStatus(product.quantity, product.minStock).status,
    Supplier: product.supplier,
    Location: product.location,
    'Last Updated': formatDateTime(product.lastUpdated),
  }));
};

// Calculate inventory statistics
export const calculateStats = (products) => {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= p.minStock).length;
  const outOfStock = products.filter((p) => p.quantity === 0).length;
  const inStock = products.filter((p) => p.quantity > p.minStock).length;

  return {
    totalProducts,
    totalValue,
    lowStock,
    outOfStock,
    inStock,
  };
};

// Validate product data
export const validateProduct = (product) => {
  const errors = {};

  if (!product.name || product.name.trim() === '') {
    errors.name = 'Product name is required';
  }

  if (!product.sku || product.sku.trim() === '') {
    errors.sku = 'SKU is required';
  }

  if (!product.category) {
    errors.category = 'Category is required';
  }

  if (product.quantity === undefined || product.quantity === null || product.quantity < 0) {
    errors.quantity = 'Valid quantity is required';
  }

  if (product.minStock === undefined || product.minStock === null || product.minStock < 0) {
    errors.minStock = 'Valid minimum stock is required';
  }

  if (product.price === undefined || product.price === null || product.price <= 0) {
    errors.price = 'Valid price is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Class name helper
export const clsx = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
