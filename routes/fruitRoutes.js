const express = require('express');
const router = express.Router();
const fruitController = require('../controllers/fruitController');

router.get('/', fruitController.getAll);
router.post('/', fruitController.create);
router.put('/:id', fruitController.update);

router.get('/stock/all', fruitController.getAllStock);
router.get('/stock/low', fruitController.getLowStock);
router.get('/:id/stock', fruitController.getStock);

module.exports = router;