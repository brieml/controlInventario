import React, { useState, useEffect } from 'react';
import { Package, HardDrive, DollarSign, TrendingUp, Clock, FileCheck, Truck } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/Dashboard/StatCard';
import InventoryChart from '../components/Dashboard/InventoryChart';
import { dashboardService } from '../services/api.js';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInventory: 0,
    fixedAssets: 0,
    totalValue: 0,
    movementsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getStats();
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  // Datos simulados para el gráfico (luego vendrán de la API)
  const chartData = [
    { name: 'Bodega Principal', value: stats.totalInventory * 0.6 },
    { name: 'Bodega Norte', value: stats.totalInventory * 0.25 },
    { name: 'Bodega Sur', value: stats.totalInventory * 0.15 },
  ];

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
          <h1 style={styles.title}>Sistema de Inventario y Activos</h1>
          <p style={styles.subtitle}>Dashboard</p>
        </div>
        <div style={styles.user}>
          <img 
            src="https://i.pravatar.cc/40" 
            alt="User" 
            style={styles.avatar}
          />
          <span>Juan Perez</span>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div style={styles.statsGrid}>
        <StatCard
          title="Total Inventario"
          value={stats.totalInventory.toLocaleString()}
          icon={<Package size={28} />}
          color="#3b82f6"
        />
        <StatCard
          title="Activos Fijos"
          value={stats.fixedAssets.toLocaleString()}
          icon={<HardDrive size={28} />}
          color="#10b981"
        />
        <StatCard
          title="Valor Total"
          value={`$${stats.totalValue.toLocaleString()}`}
          icon={<DollarSign size={28} />}
          color="#f59e0b"
        />
      </div>

      {/* Gráfico y Movimientos */}
      <div style={styles.bottomGrid}>
        <InventoryChart data={chartData} />
        
        {/* Tarjeta de Movimientos */}
        <div style={styles.movementsCard}>
          <h3 style={styles.title}>Movimientos</h3>
          <div style={styles.movementsGrid}>
            <div style={styles.movementItem}>
              <div style={styles.movementNumber}>56</div>
              <div style={styles.movementLabel}>
                <Clock size={16} />
                Movimientos Hoy
              </div>
            </div>
            <div style={styles.movementItem}>
              <div style={styles.movementNumber}>12</div>
              <div style={styles.movementLabel}>
                <FileCheck size={16} />
                Órdenes Pendientes
              </div>
            </div>
            <div style={styles.movementItem}>
              <div style={styles.movementNumber}>8</div>
              <div style={styles.movementLabel}>
                <Truck size={16} />
                Traslados
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
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
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
  },
  statsGrid: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  bottomGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  movementsCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    flex: '1',
    minWidth: '300px',
  },
  movementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginTop: '20px',
  },
  movementItem: {
    textAlign: 'center',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  movementNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: '8px',
  },
  movementLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#64748b',
  },
};

export default Dashboard;