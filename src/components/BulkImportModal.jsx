import { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Upload, AlertCircle, CheckCircle, Download } from 'lucide-react';

export default function BulkImportModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const addProduct = useStore((state) => state.addProduct);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResults(null);
    } else {
      alert('Please select a CSV file');
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const products = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        const product = {};
        headers.forEach((header, index) => {
          product[header.toLowerCase().replace(/\s+/g, '')] = values[index];
        });
        products.push(product);
      }
    }
    return products;
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsedProducts = parseCSV(text);
        
        let successful = 0;
        let failed = 0;
        const errors = [];

        parsedProducts.forEach((product, index) => {
          try {
            // Validate required fields
            if (!product.name || !product.sku || !product.category) {
              failed++;
              errors.push(`Row ${index + 2}: Missing required fields (name, sku, or category)`);
              return;
            }

            // Create product object
            const newProduct = {
              name: product.name,
              sku: product.sku,
              category: product.category,
              quantity: parseInt(product.quantity) || 0,
              minStock: parseInt(product.minstock || product.minstock) || 0,
              price: parseFloat(product.price) || 0,
              supplier: product.supplier || '',
              location: product.location || '',
              description: product.description || '',
            };

            addProduct(newProduct);
            successful++;
          } catch (error) {
            failed++;
            errors.push(`Row ${index + 2}: ${error.message}`);
          }
        });

        setResults({
          successful,
          failed,
          errors,
          total: parsedProducts.length,
        });
        setImporting(false);
      } catch (error) {
        alert('Error parsing CSV file: ' + error.message);
        setImporting(false);
      }
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `name,sku,category,quantity,minstock,price,supplier,location,description
Sample Product,PROD-001,Electronics,100,20,99.99,ABC Suppliers,Main Store,Product description here`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Bulk Import Products</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="import-instructions">
            <h4>Instructions:</h4>
            <ol>
              <li>Download the CSV template below</li>
              <li>Open it in Excel or Google Sheets</li>
              <li>Fill in your product data (one product per row)</li>
              <li>Save as CSV file</li>
              <li>Upload the file here</li>
            </ol>

            <button className="btn btn-secondary" onClick={downloadTemplate}>
              <Download size={16} />
              Download CSV Template
            </button>
          </div>

          <div className="import-upload" style={{ marginTop: '1.5rem' }}>
            <label className="label">Select CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="input"
              style={{ padding: '0.5rem' }}
            />
            {file && (
              <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                Selected: {file.name}
              </p>
            )}
          </div>

          {results && (
            <div className="import-results" style={{ marginTop: '1.5rem' }}>
              <div style={{ 
                padding: 'var(--spacing-md)', 
                background: 'var(--color-bg-tertiary)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <CheckCircle size={20} color="var(--color-success)" />
                  <strong>Import Complete</strong>
                </div>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Total:</strong> {results.total} products processed
                </p>
                <p style={{ marginBottom: '0.5rem', color: 'var(--color-success)' }}>
                  <strong>Successful:</strong> {results.successful} products added
                </p>
                {results.failed > 0 && (
                  <>
                    <p style={{ marginBottom: '0.5rem', color: 'var(--color-danger)' }}>
                      <strong>Failed:</strong> {results.failed} products
                    </p>
                    {results.errors.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <p style={{ marginBottom: '0.5rem' }}><strong>Errors:</strong></p>
                        <div style={{ 
                          maxHeight: '150px', 
                          overflow: 'auto', 
                          fontSize: '0.8125rem',
                          color: 'var(--color-text-secondary)'
                        }}>
                          {results.errors.map((error, index) => (
                            <div key={index} style={{ marginBottom: '0.25rem' }}>
                              • {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="import-note" style={{ 
            marginTop: '1.5rem',
            padding: 'var(--spacing-md)',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <strong>Required fields:</strong> name, sku, category<br />
                <strong>Optional fields:</strong> quantity, minstock, price, supplier, location, description
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleImport}
            disabled={!file || importing}
          >
            <Upload size={16} />
            {importing ? 'Importing...' : 'Import Products'}
          </button>
        </div>
      </div>
    </div>
  );
}
