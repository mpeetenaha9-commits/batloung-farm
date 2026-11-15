const e = require('express'); const r = e.Router(); const c = require('../controllers/salesController');
r.post('/', c.createSale);
module.exports = r;