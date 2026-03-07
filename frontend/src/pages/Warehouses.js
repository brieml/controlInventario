import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Warehouse as WarehouseIcon, Package } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { warehouseService, inventoryService } from '../services/api';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [warehousesRes, productsRes] = await Promise.all([
        warehouseService.getAll(),
        inventoryService.getAll(),
      ]);
      setWarehouses(warehousesRes.data);
      setProducts(productsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ', error);
      setLoading(false);
    }
  };

  const handleOpenModal = (warehouse = null) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({
        name: warehouse.name,
        location: warehouse.location || '',
        capacity: warehouse.capacity || '',
      });
    } else {
      setEditingWarehouse(null);
      setFormData({
        name: '',
        location: '',
        capacity: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWarehouse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await warehouseService.update(editingWarehouse.id, formData);
      } else {
        await warehouseService.create(formData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      alert('Error al guardar la bodega');
    }
  };

  const handleDelete = async (id) => {
    const warehouseProducts = products.filter(p => p.warehouseId === id);
    if (warehouseProducts.length > 0) {
      alert('No se puede eliminar la bodega porque tiene productos asociados');
      return;
    }
    
    if (window.confirm('¿Estás seguro de eliminar esta bodega?')) {
      try {
        // Nota: Necesitarás crear este endpoint en el backend
        // Por ahora, mostramos un mensaje
        alert('Función de eliminar en desarrollo');
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        alert('Error al eliminar la bodega');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getWarehouseProductCount = (warehouseId) => {
    return products.filter(p => p.warehouseId === warehouseId).length;
  };

  const getWarehouseTotalValue = (warehouseId) => {
    return products
      .filter(p => p.warehouseId === warehouseId)
      .reduce((acc, p) => acc + (p.quantity * p.price), 0);
  };

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
          <h1 style={styles.title}>Bodegas</h1>
          <p style={styles.subtitle}>Gestión de almacenes y ubicaciones</p>
        </div>
        <button onClick={() => handleOpenModal()} style={styles.addButton}>
          <Plus size={20} />
          Nueva Bodega
        </button>
      </div>

      {/* Grid de bodegas */}
      <div style={styles.grid}>
        {warehouses.map((warehouse) => {
          const productCount = getWarehouseProductCount(warehouse.id);
          const totalValue = getWarehouseTotalValue(warehouse.id);
          
          return (
            <div key={warehouse.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>
                  <WarehouseIcon size={32} color="#3b82f6" />
                </div>
                <div style={styles.cardActions}>
                  <button 
                    onClick={() => handleOpenModal(warehouse)}
                    style={styles.iconButton}
                  >
                    <Edit2 size={16} color="#64748b" />
                  </button>
                  <button 
                    onClick={() => handleDelete(warehouse.id)}
                    style={styles.iconButton}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </div>
              </div>
              
              <h3 style={styles.cardTitle}>{warehouse.name}</h3>
              
              <div style={styles.cardInfo}>
                <div style={styles.infoItem}>
                  <WarehouseIcon size={16} color="#64748b" />
                  <span>{warehouse.location || 'Sin ubicación'}</span>
                </div>
                <div style={styles.infoItem}>
                  <Package size={16} color="#64748b" />
                  <span>{productCount} productos</span>
                </div>
              </div>
              
              <div style={styles.cardFooter}>
                <div style={styles.footerItem}>
                  <span style={styles.footerLabel}>Capacidad</span>
                  <span style={styles.footerValue}>{warehouse.capacity || 'N/A'}</span>
                </div>
                <div style={styles.footerItem}>
                  <span style={styles.footerLabel}>Valor Total</span>
                  <span style={styles.footerValue}>${totalValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {warehouses.length === 0 && (
        <div style={styles.emptyState}>
          <WarehouseIcon size={48} color="#cbd5e1" />
          <h3>No hay bodegas registradas</h3>
          <p>Crea tu primera bodega para comenzar</p>
        </div>
      )}

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingWarehouse ? 'Editar Bodega' : 'Nueva Bodega'}
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
              placeholder="Nombre de la bodega"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Ubicación</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              style={styles.input}
              placeholder="Dirección o ubicación"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Capacidad</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              style={styles.input}
              placeholder="Capacidad máxima"
              min="0"
            />
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
              {editingWarehouse ? 'Actualizar' : 'Crear'} Bodega
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  cardIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
  },
  cardTitle: {
    fontSize: '20px',
    color: '#1e293b',
    margin: '0 0 16px 0',
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b',
    fontSize: '14px',
  },
  cardFooter: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0',
  },
  footerItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  footerLabel: {
    fontSize: '12px',
    color: '#64748b',
  },
  footerValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  formGroup: {
    marginBottom: '16px',
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

export default Warehouses;