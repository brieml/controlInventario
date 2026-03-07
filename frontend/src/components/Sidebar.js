import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  FileText, 
  Truck, 
  Users, 
  HardDrive, 
  ClipboardList, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Inventario', path: '/inventario' },
  { icon: Warehouse, label: 'Bodegas', path: '/bodegas' },
  { icon: FileText, label: 'Documentos', path: '/documentos' },
  { icon: Truck, label: 'Traslados', path: '/traslados' },
  { icon: Users, label: 'Funcionarios', path: '/funcionarios' },
  { icon: HardDrive, label: 'Activos Fijos', path: '/activos' },
  { icon: ClipboardList, label: 'Kardex', path: '/kardex' },
  { icon: BarChart3, label: 'Reportes', path: '/reportes' },
  { icon: Settings, label: 'Configuración', path: '/configuracion' },
];

const Sidebar = () => {
  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>📦</div>
        <span style={styles.logoText}>LOGO</span>
      </div>
      
      <nav style={styles.nav}>
        {menuItems.map((item, index) => (
          <a 
            key={index} 
            href={item.path}
            style={styles.menuItem}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      
      <div style={styles.logout}>
        <LogOut size={20} />
        <span>Cerrar Sesión</span>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    backgroundColor: '#1e40af',
    color: 'white',
    padding: '20px',
    position: 'fixed',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '40px',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  logoIcon: {
    fontSize: '32px',
  },
  nav: {
    flex: 1,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  logout: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    marginTop: 'auto',
    cursor: 'pointer',
  },
};

export default Sidebar;