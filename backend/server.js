const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // Importamos la instancia de BD y modelos
const inventoryRoutes = require('./controllers/inventoryRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const supplierRoutes = require('./routes/supplierRoutes'); 
const kardexRoutes = require('./routes/kardexRoutes'); 

const app = express();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// Usar las rutas
app.use('/api/inventory', inventoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/suppliers', supplierRoutes); 
app.use('/api/kardex', kardexRoutes); 

app.get('/ping', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  return res.json({ time: result.rows[0] });
});


// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Inventario funcionando 🚀');
});

const PORT = 5000;

// Sincronizar BD (Crea las tablas si no existen) y levantar servidor
sequelize.sync({ force: false }) // force: true borra las tablas al reiniciar, cuidado!
  .then(() => {
    console.log('✅ Base de datos sincronizada');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ Error al conectar BD:', err));