const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Warehouse = sequelize.define('Warehouse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }, // Ej: "Bodega Central", "Sucursal Norte"
  location: { type: DataTypes.STRING },
  capacity: { type: DataTypes.INTEGER }
});

module.exports = Warehouse;