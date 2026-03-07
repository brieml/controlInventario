const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kardex = sequelize.define('Kardex', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  movementNumber: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false,
    field: 'movement_number'  // ← Nombre en la BD (snake_case)
  },
  type: { 
    type: DataTypes.ENUM('entrada', 'salida'), 
    allowNull: false,
    field: 'type'
  },
  supplierId: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    field: 'supplier_id'
  },
  contractNumber: { 
    type: DataTypes.STRING,
    field: 'contract_number'
  },
  date: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW,
    field: 'date'
  },
  responsible: { 
    type: DataTypes.STRING,
    field: 'responsible'
  },
  destination: { 
    type: DataTypes.STRING,
    field: 'destination'
  },
  observations: { 
    type: DataTypes.TEXT,
    field: 'observations'
  },
  status: { 
    type: DataTypes.ENUM('pendiente', 'completado', 'cancelado'), 
    defaultValue: 'completado',
    field: 'status'
  },
  warehouseChiefSignature: { 
    type: DataTypes.STRING,
    field: 'warehouse_chief_signature'
  }
}, {
  tableName: 'Kardex',  // ← Nombre exacto de la tabla
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Kardex;