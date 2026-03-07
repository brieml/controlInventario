import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Download, 
  FileText, 
  Package, 
  Truck, 
  Search, 
  Filter,
  Eye,
  Printer
} from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { kardexService, supplierService, inventoryService } from '../services/api';
import { generateEntryPDF } from '../components/Kardex/EntryDocument';

const Kardex = () => {
  const [movements, setMovements] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('entrada'); // 'entrada' o 'salida'
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const [formData, setFormData] = useState({
    supplierId: '',
    contractNumber: '',
    date: new Date().toISOString().split('T')[0],
    responsible: '',
    observations: '',
    destination: '',
    items: []
  });

  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: '',
    unitPrice: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [movementsRes, suppliersRes, productsRes] = await Promise.all([
        kardexService.getAll(),
        supplierService.getAll(),
        inventoryService.getAll(),
      ]);

      console.log('📦 Proveedores recibidos:', suppliersRes.data);
    console.log('📦 Productos recibidos:', productsRes.data);

      setMovements(movementsRes.data);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ', error);
      setLoading(false);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setFormData({
      supplierId: type === 'entrada' ? (suppliers[0]?.id || '') : '',
      contractNumber: '',
      date: new Date().toISOString().split('T')[0],
      responsible: '',
      observations: '',
      destination: '',
      items: []
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewItem({ productId: '', quantity: '', unitPrice: '' });
  };

  const handleAddItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.unitPrice) {
      alert('Complete todos los campos del producto');
      return;
    }

    const product = products.find(p => p.id === parseInt(newItem.productId));
    
    setFormData({
      ...formData,
      items: [...formData.items, {
        productId: parseInt(newItem.productId),
        productName: product?.name,
        sku: product?.sku,
        quantity: parseInt(newItem.quantity),
        unitPrice: parseFloat(newItem.unitPrice),
        totalPrice: parseInt(newItem.quantity) * parseFloat(newItem.unitPrice)
      }]
    });

    setNewItem({ productId: '', quantity: '', unitPrice: '' });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      alert('Agregue al menos un producto');
      return;
    }

    try {
      const dataToSend = {
        date: formData.date,
        responsible: formData.responsible,
        observations: formData.observations,
        items: formData.items.map(({ productId, quantity, unitPrice }) => ({
          productId,
          quantity,
          unitPrice
        }))
      };

      if (modalType === 'entrada') {
        dataToSend.supplierId = parseInt(formData.supplierId);
        dataToSend.contractNumber = formData.contractNumber;
        await kardexService.createEntry(dataToSend);
      } else {
        dataToSend.destination = formData.destination;
        await kardexService.createExit(dataToSend);
      }

      handleCloseModal();
      fetchData();
      alert('Movimiento registrado exitosamente');
    } catch (error) {
      console.error('Error saving movement:', error);
      alert(error.response?.data?.error || 'Error al registrar el movimiento');
    }
  };

  const handleViewMovement = async (id) => {
    try {
      const response = await kardexService.getById(id);
      setSelectedMovement(response.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching movement:', error);
    }
  };

  const handleDownloadPDF = () => {
    if (selectedMovement) {
      generateEntryPDF(selectedMovement);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const filteredMovements = movements.filter(movement => {
    if (filters.type && movement.type !== filters.type) return false;
    if (filters.search && !movement.movementNumber.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const totalEntradas = movements.filter(m => m.type === 'entrada').length;
  const totalSalidas = movements.filter(m => m.type === 'salida').length;

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
          <h1 style={styles.title}>Kardex</h1>
          <p style={styles.subtitle}>Control detallado de entradas y salidas</p>
        </div>
        <div style={styles.buttons}>
          <button onClick={() => handleOpenModal('entrada')} style={styles.buttonEntry}>
            <Plus size={20} />
            Nueva Entrada
          </button>
          <button onClick={() => handleOpenModal('salida')} style={styles.buttonExit}>
            <Truck size={20} />
            Nueva Salida
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <FileText size={24} color="#10b981" />
          <div>
            <div style={styles.summaryValue}>{totalEntradas}</div>
            <div style={styles.summaryLabel}>Entradas</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <Truck size={24} color="#f59e0b" />
          <div>
            <div style={styles.summaryValue}>{totalSalidas}</div>
            <div style={styles.summaryLabel}>Salidas</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <Package size={24} color="#3b82f6" />
          <div>
            <div style={styles.summaryValue}>{movements.length}</div>
            <div style={styles.summaryLabel}>Total Movimientos</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <Search size={20} color="#64748b" />
          <input
            type="text"
            name="search"
            placeholder="Buscar por número..."
            value={filters.search}
            onChange={handleFilterChange}
            style={styles.filterInput}
          />
        </div>
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          style={styles.filterSelect}
        >
          <option value="">Todos los tipos</option>
          <option value="entrada">Entradas</option>
          <option value="salida">Salidas</option>
        </select>
      </div>

      {/* Tabla */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Número</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Proveedor/Destino</th>
              <th style={styles.th}>Responsable</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map((movement) => (
              <tr key={movement.id}>
                <td style={styles.td}>
                  <span style={styles.movementNumber}>{movement.movementNumber}</span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: movement.type === 'entrada' ? '#d1fae5' : '#fef3c7',
                    color: movement.type === 'entrada' ? '#059669' : '#d97706',
                  }}>
                    {movement.type.toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>{new Date(movement.date).toLocaleDateString()}</td>
                <td style={styles.td}>
                  {movement.type === 'entrada' 
                    ? movement.Supplier?.name || 'N/A'
                    : movement.destination || 'N/A'
                  }
                </td>
                <td style={styles.td}>{movement.responsible || 'N/A'}</td>
                <td style={styles.td}>{movement.KardexItems?.length || 0}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: movement.status === 'completado' ? '#d1fae5' : '#fef3c7',
                    color: movement.status === 'completado' ? '#059669' : '#d97706',
                  }}>
                    {movement.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <button 
                    onClick={() => handleViewMovement(movement.id)}
                    style={styles.actionButton}
                    title="Ver detalle"
                  >
                    <Eye size={16} color="#3b82f6" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMovements.length === 0 && (
          <div style={styles.emptyState}>
            No se encontraron movimientos
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalType === 'entrada' ? 'Nueva Entrada' : 'Nueva Salida'}
      >
        <form onSubmit={handleSubmit}>
          {modalType === 'entrada' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Proveedor *</label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                required
                style={styles.input}
              >
                <option value="">Seleccione proveedor</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {modalType === 'entrada' && (
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Número de Contrato</label>
                <input
                  type="text"
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({...formData, contractNumber: e.target.value})}
                  style={styles.input}
                  placeholder="CON-2026-001"
                />
              </div>
            </div>
          )}

          {modalType === 'salida' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Destino/Departamento *</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
                required
                style={styles.input}
                placeholder="Ej: Departamento de Ventas"
              />
            </div>
          )}

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Responsable *</label>
              <input
                type="text"
                value={formData.responsible}
                onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                required
                style={styles.input}
                placeholder="Nombre del responsable"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Observaciones</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              style={{...styles.input, minHeight: '80px'}}
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Agregar productos */}
          <div style={styles.itemsSection}>
            <h4 style={styles.itemsTitle}>Productos</h4>
            <div style={styles.addItemRow}>
              <select
                value={newItem.productId}
                onChange={(e) => setNewItem({...newItem, productId: e.target.value})}
                style={{...styles.input, flex: 2}}
              >
                <option value="">Seleccione producto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Cant."
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                style={{...styles.input, flex: 1}}
                min="1"
              />
              <input
                type="number"
                placeholder="Precio"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({...newItem, unitPrice: e.target.value})}
                style={{...styles.input, flex: 1}}
                min="0"
                step="0.01"
              />
              <button
                type="button"
                onClick={handleAddItem}
                style={styles.addIconButton}
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Lista de items agregados */}
            {formData.items.length > 0 && (
              <div style={styles.itemsList}>
                {formData.items.map((item, index) => (
                  <div key={index} style={styles.itemRow}>
                    <span style={styles.itemName}>{item.productName}</span>
                    <span style={styles.itemQty}>{item.quantity} un.</span>
                    <span style={styles.itemPrice}>${item.unitPrice}</span>
                    <span style={styles.itemTotal}>${item.totalPrice}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      style={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div style={styles.itemsTotal}>
                  <strong>Total: ${formData.items.reduce((acc, item) => acc + item.totalPrice, 0)}</strong>
                </div>
              </div>
            )}
          </div>

          <div style={styles.formActions}>
            <button type="button" onClick={handleCloseModal} style={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" style={styles.submitButton}>
              {modalType === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Detalle - ${selectedMovement?.movementNumber}`}
      >
        {selectedMovement && (
          <div>
            <div style={styles.detailHeader}>
              <div>
                <p><strong>Tipo:</strong> {selectedMovement.type.toUpperCase()}</p>
                <p><strong>Fecha:</strong> {new Date(selectedMovement.date).toLocaleDateString()}</p>
                <p><strong>Responsable:</strong> {selectedMovement.responsible}</p>
              </div>
              <div>
                {selectedMovement.type === 'entrada' && (
                  <>
                    <p><strong>Proveedor:</strong> {selectedMovement.Supplier?.name}</p>
                    <p><strong>Contrato:</strong> {selectedMovement.contractNumber}</p>
                  </>
                )}
                {selectedMovement.type === 'salida' && (
                  <p><strong>Destino:</strong> {selectedMovement.destination}</p>
                )}
              </div>
            </div>

            <table style={styles.detailTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>SKU</th>
                  <th style={styles.th}>Cantidad</th>
                  <th style={styles.th}>Precio Unit.</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {selectedMovement.KardexItems?.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.Product?.name}</td>
                    <td style={styles.td}>{item.Product?.sku}</td>
                    <td style={styles.td}>{item.quantity}</td>
                    <td style={styles.td}>${item.unitPrice}</td>
                    <td style={styles.td}>${item.totalPrice}</td>
                    <td style={styles.td}>{item.previousStock} → {item.newStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.signatureSection}>
              <div style={styles.signatureBox}>
                <div style={styles.signatureLine}></div>
                <p>Jefe de Almacén</p>
                <p style={styles.signatureStatus}>✓ Firma Digital Verificada</p>
              </div>
              <div style={styles.signatureBox}>
                <div style={styles.signatureLine}></div>
                <p>Responsable</p>
                <p>{selectedMovement.responsible}</p>
              </div>
            </div>

            <div style={styles.formActions}>
              <button 
                onClick={handleDownloadPDF} 
                style={styles.downloadButton}
              >
                <Download size={16} />
                Descargar PDF
              </button>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                style={styles.cancelButton}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

// ... (estilos similares a las otras páginas, los incluyo completos abajo)

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
  buttons: {
    display: 'flex',
    gap: '12px',
  },
  buttonEntry: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  buttonExit: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f59e0b',
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
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    flex: 1,
  },
  filterInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
  },
  filterSelect: {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
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
  movementNumber: {
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#3b82f6',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
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
  itemsSection: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
  },
  itemsTitle: {
    margin: '0 0 16px 0',
    color: '#1e293b',
    fontSize: '16px',
  },
  addItemRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  addIconButton: {
    width: '42px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsList: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '16px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  itemName: {
    flex: 2,
    fontSize: '14px',
  },
  itemQty: {
    flex: 1,
    textAlign: 'center',
    fontSize: '14px',
  },
  itemPrice: {
    flex: 1,
    textAlign: 'center',
    fontSize: '14px',
  },
  itemTotal: {
    flex: 1,
    textAlign: 'right',
    fontSize: '14px',
    fontWeight: '600',
  },
  removeButton: {
    width: '28px',
    height: '28px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    marginLeft: '8px',
  },
  itemsTotal: {
    textAlign: 'right',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '2px solid #e2e8f0',
    fontSize: '16px',
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
  detailHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e2e8f0',
  },
  detailTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '24px',
  },
  signatureSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    marginTop: '40px',
    paddingTop: '40px',
    borderTop: '1px solid #e2e8f0',
  },
  signatureBox: {
    textAlign: 'center',
  },
  signatureLine: {
    borderTop: '2px solid #1e293b',
    marginBottom: '8px',
  },
  signatureStatus: {
    color: '#10b981',
    fontSize: '12px',
    fontWeight: '600',
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    border: 'none',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default Kardex;