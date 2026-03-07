const express = require('express');
const router = express.Router();
const kardexController = require('../controllers/kardexController');

router.get('/', kardexController.getAllMovements);
router.get('/:id', kardexController.getMovementById);
router.post('/entrada', kardexController.createEntry);
router.post('/salida', kardexController.createExit);
router.get('/producto/:productId/historial', kardexController.getProductHistory);

module.exports = router;