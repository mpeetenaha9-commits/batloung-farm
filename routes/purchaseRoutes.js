const e = require('express'); const r = e.Router(); const c = require('../controllers/purchaseController');
r.post('/', c.createPurchase);
module.exports = r;