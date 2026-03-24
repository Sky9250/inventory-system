import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { formatCurrency, formatDate, getStockStatus } from '../utils/helpers';
import ProductModal from '../components/ProductModal';
import BulkImportModal from '../components/BulkImportModal';
import '../styles/Products.css';

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories);
  const searchQuery = useStore((state) => state.searchQuery);
  const selectedCategory = useStore((state) => state.selectedCategory);
  const stockFilter = useStore((state) => state.stockFilter);
  const setSearchQuery = useStore((state) => state.setSearchQuery);
  const setSelectedCategory = useStore((state) => state.setSelectedCategory);
  const setStockFilter = useStore((state) => state.setStockFilter);
  const getFilteredProducts = useStore((state) => state.getFilteredProducts);
  const deleteProduct = useStore((state) => state.deleteProduct);

  const filteredProducts = useMemo(() => getFilteredProducts(), [getFilteredProducts]);

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    setDeleteConfirm(null);
  };

  const stockFilterOptions = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1 className="animate-fade-in">Products</h1>
          <p className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Manage your product inventory
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button
            className="btn btn-secondary animate-fade-in"
            style={{ animationDelay: '0.2s' }}
            onClick={() => setIsBulkImportOpen(true)}
          >
            <Upload size={20} />
            Bulk Import
          </button>
          <button
            className="btn btn-primary animate-fade-in"
            style={{ animationDelay: '0.2s' }}
            onClick={handleAddNew}
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="products-filters animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search products by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={20} />
          <select
            className="select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            {stockFilterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="products-count animate-fade-in" style={{ animationDelay: '0.4s' }}>
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="products-grid animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {filteredProducts.map((product) => {
            const status = getStockStatus(product.quantity, product.minStock);
            return (
              <div key={product.id} className="product-card">
                <div className="product-card-header">
                  <div className="product-icon">
                    <Package size={24} />
                  </div>
                  <span className={`badge badge-${status.color}`}>
                    {status.status}
                  </span>
                </div>

                <div className="product-card-body">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-sku">SKU: {product.sku}</p>
                  <p className="product-category">{product.category}</p>

                  <div className="product-details">
                    <div className="detail-row">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value">{product.quantity}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Min Stock:</span>
                      <span className="detail-value">{product.minStock}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Total Value:</span>
                      <span className="detail-value detail-value-highlight">
                        {formatCurrency(product.price * product.quantity)}
                      </span>
                    </div>
                  </div>

                  <div className="product-meta">
                    <div className="meta-item">
                      <span className="meta-label">Location:</span>
                      <span className="meta-value">{product.location}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Updated:</span>
                      <span className="meta-value">{formatDate(product.lastUpdated)}</span>
                    </div>
                  </div>
                </div>

                <div className="product-card-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteConfirm(product.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <AlertCircle size={48} />
          <h3>No products found</h3>
          <p>Try adjusting your filters or add a new product</p>
          <button className="btn btn-primary" onClick={handleAddNew}>
            <Plus size={20} />
            Add First Product
          </button>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Bulk Import Modal */}
      {isBulkImportOpen && (
        <BulkImportModal
          onClose={() => setIsBulkImportOpen(false)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
