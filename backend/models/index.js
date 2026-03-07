const sequelize = require('../config/database');
const User = require('./User');
const Warehouse = require('./Warehouse');
const Product = require('./Product');
const Movement = require('./Movement');
const Supplier = require('./Supplier');
const Kardex = require('./Kardex');
const KardexItem = require('./KardexItem');

// Relaciones existentes
Warehouse.hasMany(Product, { foreignKey: 'warehouseId' });
Product.belongsTo(Warehouse, { foreignKey: 'warehouseId' });

// Nuevas relaciones - Kardex
Supplier.hasMany(Kardex, { 
  foreignKey: 'supplierId', 
  as: 'Supplier'  // ← Alias para usar en includes
});
Kardex.belongsTo(Supplier, { 
  foreignKey: 'supplierId', 
  as: 'Supplier' 
});

Kardex.hasMany(KardexItem, { 
  foreignKey: 'kardexId', 
  as: 'KardexItems', 
  onDelete: 'CASCADE' 
});
KardexItem.belongsTo(Kardex, { 
  foreignKey: 'kardexId', 
  as: 'Kardex' 
});

KardexItem.belongsTo(Product, { 
  foreignKey: 'productId', 
  as: 'Product' 
});
Product.hasMany(KardexItem, { 
  foreignKey: 'productId', 
  as: 'KardexItems' 
});

module.exports = {
  sequelize,
  User,
  Warehouse,
  Product,
  Movement,
  Supplier,
  Kardex,
  KardexItem
};