import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div style={styles.card}>
      <div style={styles.content}>
        <h3 style={styles.value}>{value}</h3>
        <p style={styles.title}>{title}</p>
      </div>
      <div style={{...styles.iconContainer, backgroundColor: color}}>
        {icon}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    flex: 1,
    minWidth: '200px',
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  title: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
};

export default StatCard;