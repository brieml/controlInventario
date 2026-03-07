const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  sku: { type: DataTypes.STRING, unique: true }, // Código único del producto
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  price: { type: DataTypes.DECIMAL(10, 2) },
  category: { type: DataTypes.STRING }, // Ej: "Electrónica", "Muebles"
  warehouseId: { type: DataTypes.INTEGER, references: { model: 'Warehouses', key: 'id' } } // Relación
});

module.exports = Product;