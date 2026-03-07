import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { inventoryService, warehouseService } from '../services/api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: '',
    price: '',
    category: '',
    warehouseId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        inventoryService.getAll(),
        warehouseService.getAll(),
      ]);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ', error);
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        price: product.price,
        category: product.category,
        warehouseId: product.warehouseId,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        quantity: '',
        price: '',
        category: '',
        warehouseId: warehouses[0]?.id || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await inventoryService.update(editingProduct.id, formData);
      } else {
        await inventoryService.create(formData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await inventoryService.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = products.reduce((acc, p) => acc + (p.quantity * p.price), 0);

  if (loading) {
    return (
      <Layout>
        <div style={{textAlign: 'center', padding: '40px'}}>Cargando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Inventario</h1>
          <p style={styles.subtitle}>Gestión de productos y stock</p>
        </div>
        <button onClick={() => handleOpenModal()} style={styles.addButton}>
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Resumen rápido */}
      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <Package size={24} color="#3b82f6" />
          <div>
            <div style={styles.summaryValue}>{products.length}</div>
            <div style={styles.summaryLabel}>Total Productos</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <Package size={24} color="#10b981" />
          <div>
            <div style={styles.summaryValue}>
              {products.reduce((acc, p) => acc + p.quantity, 0)}
            </div>
            <div style={styles.summaryLabel}>Unidades en Stock</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <Package size={24} color="#f59e0b" />
          <div>
            <div style={styles.summaryValue}>${totalValue.toLocaleString()}</div>
            <div style={styles.summaryLabel}>Valor Total</div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div style={styles.searchBar}>
        <Search size={20} color="#64748b" />
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Tabla de productos */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Categoría</th>
              <th style={styles.th}>Bodega</th>
              <th style={styles.th}>Cantidad</th>
              <th style={styles.th}>Precio</th>
              <th style={styles.th}>Valor Total</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td style={styles.td}>{product.sku}</td>
                <td style={styles.td}>{product.name}</td>
                <td style={styles.td}>{product.category}</td>
                <td style={styles.td}>{product.Warehouse?.name || 'N/A'}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: product.quantity < 10 ? '#fee2e2' : '#d1fae5',
                    color: product.quantity < 10 ? '#dc2626' : '#059669',
                  }}>
                    {product.quantity}
                  </span>
                </td>
                <td style={styles.td}>${parseFloat(product.price).toFixed(2)}</td>
                <td style={styles.td}>${(product.quantity * product.price).toFixed(2)}</td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button 
                      onClick={() => handleOpenModal(product)}
                      style={styles.actionButton}
                      title="Editar"
                    >
                      <Edit2 size={16} color="#3b82f6" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      style={styles.actionButton}
                      title="Eliminar"
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div style={styles.emptyState}>
            No se encontraron productos
          </div>
        )}
      </div>

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Nombre del producto"
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Código SKU"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Categoría</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ej: Electrónica"
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Cantidad *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="0"
                min="0"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Precio *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Bodega *</label>
            <select
              name="warehouseId"
              value={formData.warehouseId}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Seleccione una bodega</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              onClick={handleCloseModal}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button type="submit" style={styles.submitButton}>
              {editingProduct ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#64748b',
    margin: 0,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  summary: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#64748b',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
    fontWeight: '600',
    color: '#475569',
    fontSize: '14px',
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#1e293b',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
  formGroup: {
    marginBottom: '16px',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#475569',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  cancelButton: {
    padding: '10px 20px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  submitButton: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default Inventory;