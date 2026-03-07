const { Product, Warehouse, Movement } = require('../models');
const { Op } = require('sequelize'); // Para hacer consultas avanzadas

// 1. Obtener estadísticas para el Dashboard (Los números grandes de la imagen)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalInventory = await Product.count();
    
    // Sumar valor total (cantidad * precio)
    const products = await Product.findAll();
    const totalValue = products.reduce((acc, prod) => acc + (prod.quantity * prod.price), 0);

    // Contar activos fijos (podríamos filtrar por categoría o tener una tabla aparte, aquí simulamos)
    const fixedAssets = await Product.count({ where: { category: 'Activo Fijo' } });

    // Movimientos de hoy
    const today = new Date();
    today.setHours(0,0,0,0);
    const movementsToday = await Movement.count({
      where: { date: { [Op.gte]: today } }
    });

    res.json({
      totalInventory,
      fixedAssets,
      totalValue,
      movementsToday
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Obtener todos los productos (Para la tabla de inventario)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Warehouse, attributes: ['name'] }] // Traer nombre de la bodega
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Crear un producto
exports.createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Actualizar producto
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Product.update(req.body, {
      where: { id }
    });
    
    if (updated) {
      const updatedProduct = await Product.findByPk(id);
      return res.json(updatedProduct);
    }
    throw new Error('Producto no encontrado');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar producto
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.destroy({
      where: { id }
    });
    
    if (deleted) {
      return res.json({ message: 'Producto eliminado' });
    }
    throw new Error('Producto no encontrado');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener producto por ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [{ model: Warehouse, attributes: ['name'] }]
    });
    
    if (product) {
      return res.json(product);
    }
    throw new Error('Producto no encontrado');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

