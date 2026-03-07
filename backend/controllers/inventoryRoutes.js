const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/dashboard-stats', inventoryController.getDashboardStats);
router.get('/products', inventoryController.getProducts);
router.get('/products/:id', inventoryController.getProductById);
router.post('/products', inventoryController.createProduct);
router.put('/products/:id', inventoryController.updateProduct);
router.delete('/products/:id', inventoryController.deleteProduct);

module.exports = router;