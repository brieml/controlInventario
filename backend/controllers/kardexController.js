const { Kardex, KardexItem, Product, Supplier, Warehouse, sequelize } = require('../models');
const { Op } = require('sequelize');

// === Función para generar número de movimiento ===
const generateMovementNumber = async (type) => {
  const year = new Date().getFullYear();
  const prefix = type === 'entrada' ? 'ENT' : 'SAL';
  
  // Buscar el último movimiento del año actual
  const lastMovement = await Kardex.findOne({
    where: {
      type: type,
      movementNumber: { [Op.like]: `${prefix}-${year}-%` }
    },
    order: [['id', 'DESC']],
    attributes: ['movementNumber']
  });
  
  let sequence = 1;
  if (lastMovement && lastMovement.movementNumber) {
    const parts = lastMovement.movementNumber.split('-');
    if (parts.length === 3) {
      const lastNum = parseInt(parts[2]);
      if (!isNaN(lastNum)) {
        sequence = lastNum + 1;
      }
    }
  }
  
  return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
};

// === Crear entrada ===
exports.createEntry = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { supplierId, contractNumber, date, responsible, observations, items } = req.body;
    
    console.log('📥 Datos recibidos:', { supplierId, contractNumber, items: items?.length });

    // 1. Generar número de movimiento
    const movementNumber = await generateMovementNumber('entrada');
    console.log('🔢 Número generado:', movementNumber);

    // 2. Crear registro Kardex
    const kardex = await Kardex.create({
      movementNumber: movementNumber,
      type: 'entrada',
      supplierId: supplierId ? parseInt(supplierId) : null,
      contractNumber: contractNumber || null,
      date: date ? new Date(date) : new Date(),
      responsible: responsible || 'Sistema',
      observations: observations || null,
      status: 'completado',
      warehouseChiefSignature: `firma_${Date.now()}`
    }, { transaction });

    console.log('✅ Kardex creado con ID:', kardex.id);

    // 3. Procesar items
    if (!items || items.length === 0) {
      throw new Error('Debe incluir al menos un producto');
    }

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
      }

      const qty = parseInt(item.quantity);
      const price = parseFloat(item.unitPrice);
      const previousStock = product.quantity || 0;
      const newStock = previousStock + qty;
      const totalPrice = qty * price;

      // Crear item del Kardex
      await KardexItem.create({
        kardexId: kardex.id,
        productId: item.productId,
        quantity: qty,
        unitPrice: price,
        totalPrice: totalPrice,
        previousStock: previousStock,
        newStock: newStock
      }, { transaction });

      // Actualizar producto
      await Product.update(
        { quantity: newStock },
        { where: { id: item.productId }, transaction }
      );

      console.log(`📦 ${product.name}: ${previousStock} → ${newStock}`);
    }

    await transaction.commit();
    console.log('✅ Transacción completada');

    // 4. Respuesta
    const fullKardex = await Kardex.findByPk(kardex.id, {
      include: [
        { model: Supplier, attributes: ['name', 'nit', 'email'], as: 'Supplier' },
        { 
          model: KardexItem, 
          as: 'KardexItems',
          include: [{ model: Product, attributes: ['name', 'sku'], as: 'Product' }] 
        }
      ]
    });

    res.status(201).json({
      message: 'Entrada registrada exitosamente',
      data: fullKardex
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error en createEntry:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// === Crear salida ===
exports.createExit = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { destination, date, responsible, observations, items } = req.body;

    const movementNumber = await generateMovementNumber('salida');

    const kardex = await Kardex.create({
      movementNumber: movementNumber,
      type: 'salida',
      destination: destination || null,
      date: date ? new Date(date) : new Date(),
      responsible: responsible || 'Sistema',
      observations: observations || null,
      status: 'completado'
    }, { transaction });

    if (!items || items.length === 0) {
      throw new Error('Debe incluir al menos un producto');
    }

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
      }

      const qty = parseInt(item.quantity);
      if (product.quantity < qty) {
        await transaction.rollback();
        return res.status(400).json({ error: `Stock insuficiente para ${product.name}` });
      }

      const price = parseFloat(item.unitPrice);
      const previousStock = product.quantity;
      const newStock = previousStock - qty;
      const totalPrice = qty * price;

      await KardexItem.create({
        kardexId: kardex.id,
        productId: item.productId,
        quantity: qty,
        unitPrice: price,
        totalPrice: totalPrice,
        previousStock: previousStock,
        newStock: newStock
      }, { transaction });

      await Product.update(
        { quantity: newStock },
        { where: { id: item.productId }, transaction }
      );
    }

    await transaction.commit();

    const fullKardex = await Kardex.findByPk(kardex.id, {
      include: [
        { 
          model: KardexItem, 
          as: 'KardexItems',
          include: [{ model: Product, attributes: ['name', 'sku'], as: 'Product' }] 
        }
      ]
    });

    res.status(201).json({
      message: 'Salida registrada exitosamente',
      data: fullKardex
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error en createExit:', error);
    res.status(500).json({ error: error.message });
  }
};

// === Obtener todos los movimientos ===
exports.getAllMovements = async (req, res) => {
  try {
    const { type, startDate, endDate, supplierId } = req.query;
    
    const where = {};
    if (type) where.type = type;
    if (supplierId) where.supplierId = supplierId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    const movements = await Kardex.findAll({
      where,
      include: [
        { model: Supplier, attributes: ['name', 'nit'], as: 'Supplier' },
        { 
          model: KardexItem, 
          as: 'KardexItems',
          include: [{ model: Product, attributes: ['name', 'sku', 'category'], as: 'Product' }] 
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(movements);
  } catch (error) {
    console.error('❌ Error en getAllMovements:', error);
    res.status(500).json({ error: error.message });
  }
};

// === Obtener movimiento por ID ===
exports.getMovementById = async (req, res) => {
  try {
    const movement = await Kardex.findByPk(req.params.id, {
      include: [
        { model: Supplier, attributes: ['name', 'nit', 'email', 'phone', 'address'], as: 'Supplier' },
        { 
          model: KardexItem, 
          as: 'KardexItems',
          include: [{ model: Product, attributes: ['name', 'sku', 'category'], as: 'Product' }] 
        }
      ]
    });

    if (!movement) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    res.json(movement);
  } catch (error) {
    console.error('❌ Error en getMovementById:', error);
    res.status(500).json({ error: error.message });
  }
};

// === Historial de un producto ===
exports.getProductHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const movements = await KardexItem.findAll({
      where: { productId },
      include: [{
        model: Kardex,
        as: 'Kardex',
        include: [{ model: Supplier, attributes: ['name'], as: 'Supplier' }],
        attributes: ['movementNumber', 'type', 'date', 'responsible']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(movements);
  } catch (error) {
    console.error('❌ Error en getProductHistory:', error);
    res.status(500).json({ error: error.message });
  }
};