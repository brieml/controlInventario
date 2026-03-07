const { Warehouse } = require('../models');

exports.getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll();
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createWarehouse = async (req, res) => {
  try {
    const newWarehouse = await Warehouse.create(req.body);
    res.status(201).json(newWarehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Agrega estas funciones al archivo existente:

exports.updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Warehouse.update(req.body, {
      where: { id }
    });
    
    if (updated) {
      const updatedWarehouse = await Warehouse.findByPk(id);
      return res.json(updatedWarehouse);
    }
    throw new Error('Bodega no encontrada');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Warehouse.destroy({
      where: { id }
    });
    
    if (deleted) {
      return res.json({ message: 'Bodega eliminada' });
    }
    throw new Error('Bodega no encontrada');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};