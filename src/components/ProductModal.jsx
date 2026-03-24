import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';
import { validateProduct } from '../utils/helpers';

export default function ProductModal({ product, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    minStock: 0,
    price: 0,
    supplier: '',
    location: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const categories = useStore((state) => state.categories);
  const locations = useStore((state) => state.locations);
  const addProduct = useStore((state) => state.addProduct);
  const updateProduct = useStore((state) => state.updateProduct);

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'minStock' || name === 'price'
        ? parseFloat(value) || 0
        : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateProduct(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (product) {
      updateProduct(product.id, formData);
    } else {
      addProduct(formData);
    }
    
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="label">
                  Product Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="label">
                  SKU <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  className={`input ${errors.sku ? 'input-error' : ''}`}
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., PROD-001"
                />
                {errors.sku && <span className="error-text">{errors.sku}</span>}
              </div>

              <div className="form-group">
                <label className="label">
                  Category <span className="required">*</span>
                </label>
                <select
                  name="category"
                  className={`select ${errors.category ? 'input-error' : ''}`}
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label className="label">
                  Location
                </label>
                <select
                  name="location"
                  className="select"
                  value={formData.location}
                  onChange={handleChange}
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">
                  Quantity <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  className={`input ${errors.quantity ? 'input-error' : ''}`}
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
                {errors.quantity && <span className="error-text">{errors.quantity}</span>}
              </div>

              <div className="form-group">
                <label className="label">
                  Minimum Stock <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="minStock"
                  className={`input ${errors.minStock ? 'input-error' : ''}`}
                  value={formData.minStock}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
                {errors.minStock && <span className="error-text">{errors.minStock}</span>}
              </div>

              <div className="form-group">
                <label className="label">
                  Price <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  className={`input ${errors.price ? 'input-error' : ''}`}
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label className="label">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  className="input"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                />
              </div>

              <div className="form-group form-group-full">
                <label className="label">
                  Description
                </label>
                <textarea
                  name="description"
                  className="input"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter product description"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
