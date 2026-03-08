// backend/config/database.js
const { Sequelize } = require('sequelize');

// Detectar si estamos en producción (Render) o desarrollo (local)
const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction && process.env.DATABASE_URL) {
  // 🌐 PRODUCCIÓN (Render): Usa la URL completa con SSL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Requerido para Render Free Tier
      }
    },
    logging: false // Silencia logs SQL en producción
  });
} else {
  // 💻 DESARROLLO LOCAL: Usa variables individuales o valores por defecto
  sequelize = new Sequelize(
    process.env.DB_NAME || 'inventario_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'tu_contraseña_local',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      port: process.env.DB_PORT || 5432,
      logging: console.log // Muestra logs SQL en desarrollo para debug
    }
  );
}

// Prueba de conexión opcional (solo para debug en desarrollo)
if (!isProduction) {
  sequelize.authenticate()
    .then(() => console.log('✅ Conexión a BD local exitosa'))
    .catch(err => console.error('❌ Error conectando a BD local:', err));
}

module.exports = sequelize;