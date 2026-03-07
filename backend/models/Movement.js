const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movement = sequelize.define('Movement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.ENUM('entrada', 'salida', 'traslado'), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = Movement;