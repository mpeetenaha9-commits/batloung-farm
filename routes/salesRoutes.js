const express = require('express');
const router = express.Router();
const c = require('../controllers/salesController');

router.get('/', c.listSales);
router.get('/:id', c.getSale);
router.post('/', c.createSale);
router.put('/:id', c.updateSale);
router.delete('/:id', c.deleteSale);

module.exports = router;