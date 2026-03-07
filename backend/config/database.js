const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'inventario_db',      // Nombre de la base de datos
  'postgres',           // Usuario
  'tu_contraseña',      // Tu contraseña de PostgreSQL
  {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
  }
);

module.exports = sequelize;