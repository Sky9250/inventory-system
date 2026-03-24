import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, Edit2, Check, X, Tag, MapPin, Package } from 'lucide-react';
import '../styles/Settings.css';

function ManageList({ title, icon: Icon, items, onAdd, onEdit, onDelete, color }) {
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) {
      setError('Please enter a name');
      return;
    }
    const success = onAdd(newItem);
    if (success) {
      setNewItem('');
      setError('');
    } else {
      setError('This item already exists!');
    }
  };

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setEditValue(item);
    setError('');
  };

  const handleSaveEdit = () => {
    if (!editValue.trim()) {
      setError('Name cannot be empty');
      return;
    }
    const success = onEdit(editingItem, editValue);
    if (success) {
      setEditingItem(null);
      setEditValue('');
      setError('');
    } else {
      setError('This name already exists!');
    }
  };

  const handleDelete = (item) => {
    if (window.confirm(`Delete "${item}"? Products using this will keep the old value.`)) {
      onDelete(item);
    }
  };

  return (
    <div className="manage-card">
      <div className="manage-card-header" style={{ borderLeftColor: color }}>
        <div className="manage-card-title">
          <Icon size={22} style={{ color }} />
          <h3>{title}</h3>
          <span className="manage-count">{items.length}</span>
        </div>
        <p className="manage-subtitle">
          These appear in the dropdown when adding or editing a product
        </p>
      </div>

      {/* Add New */}
      <div className="manage-add-row">
        <input
          type="text"
          className="input"
          placeholder={`Add new ${title.toLowerCase().replace(' management', '')}...`}
          value={newItem}
          onChange={(e) => { setNewItem(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={18} />
          Add
        </button>
      </div>
      {error && <p className="manage-error">{error}</p>}

      {/* List */}
      <div className="manage-list">
        {items.length === 0 && (
          <div className="manage-empty">No items yet. Add one above!</div>
        )}
        {items.map((item) => (
          <div key={item} className="manage-item">
            {editingItem === item ? (
              /* Edit Mode */
              <div className="manage-item-edit">
                <input
                  type="text"
                  className="input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') setEditingItem(null);
                  }}
                  autoFocus
                />
                <button className="btn-icon btn-icon-success" onClick={handleSaveEdit} title="Save">
                  <Check size={16} />
                </button>
                <button className="btn-icon btn-icon-cancel" onClick={() => setEditingItem(null)} title="Cancel">
                  <X size={16} />
                </button>
              </div>
            ) : (
              /* View Mode */
              <div className="manage-item-view">
                <div className="manage-item-dot" style={{ background: color }} />
                <span className="manage-item-name">{item}</span>
                <div className="manage-item-actions">
                  <button
                    className="btn-icon btn-icon-edit"
                    onClick={() => handleStartEdit(item)}
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    className="btn-icon btn-icon-delete"
                    onClick={() => handleDelete(item)}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const categories = useStore((state) => state.categories);
  const locations = useStore((state) => state.locations);
  const addCategory = useStore((state) => state.addCategory);
  const editCategory = useStore((state) => state.editCategory);
  const deleteCategory = useStore((state) => state.deleteCategory);
  const addLocation = useStore((state) => state.addLocation);
  const editLocation = useStore((state) => state.editLocation);
  const deleteLocation = useStore((state) => state.deleteLocation);
  const rmCategories = useStore((state) => state.rmCategories);
  const addRMCategory = useStore((state) => state.addRMCategory);
  const editRMCategory = useStore((state) => state.editRMCategory);
  const deleteRMCategory = useStore((state) => state.deleteRMCategory);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="animate-fade-in">Settings</h1>
        <p className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Manage your categories, locations, and raw material categories used across the system
        </p>
      </div>

      <div className="settings-tip animate-fade-in" style={{ animationDelay: '0.2s' }}>
        💡 <strong>Tip:</strong> Changes here instantly update the dropdowns when adding or editing products.
        Editing a name also updates all existing products automatically!
      </div>

      <div className="settings-grid animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <ManageList
          title="Category Management"
          icon={Tag}
          items={categories}
          onAdd={addCategory}
          onEdit={editCategory}
          onDelete={deleteCategory}
          color="var(--color-accent-primary)"
        />

        <ManageList
          title="Location Management"
          icon={MapPin}
          items={locations}
          onAdd={addLocation}
          onEdit={editLocation}
          onDelete={deleteLocation}
          color="var(--color-accent-tertiary)"
        />

        <ManageList
          title="Raw Material Category"
          icon={Package}
          items={rmCategories}
          onAdd={addRMCategory}
          onEdit={editRMCategory}
          onDelete={deleteRMCategory}
          color="var(--color-warning, #f59e0b)"
        />
      </div>
    </div>
  );
}
