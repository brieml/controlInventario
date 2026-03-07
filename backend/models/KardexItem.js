const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KardexItem = sequelize.define('KardexItem', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  kardexId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'kardex_id'
  },
  productId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'product_id'
  },
  quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'quantity'
  },
  unitPrice: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
    field: 'unit_price'
  },
  totalPrice: { 
    type: DataTypes.DECIMAL(10, 2),
    field: 'total_price'
  },
  previousStock: { 
    type: DataTypes.INTEGER,
    field: 'previous_stock'
  },
  newStock: { 
    type: DataTypes.INTEGER,
    field: 'new_stock'
  }
}, {
  tableName: 'KardexItems',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = KardexItem;