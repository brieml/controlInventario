const sequelize = require('../config/database');
const User = require('./User');
const Warehouse = require('./Warehouse');
const Product = require('./Product');
const Movement = require('./Movement');


// Relaciones existentes
Warehouse.hasMany(Product, { foreignKey: 'warehouseId' });
Product.belongsTo(Warehouse, { foreignKey: 'warehouseId' });



module.exports = {
  sequelize,
  User,
  Warehouse,
  Product,
  Movement,
};