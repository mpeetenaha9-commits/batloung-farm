const e = require('express'); const r = e.Router(); const c = require('../controllers/fruitController');
r.get('/', c.getAll); r.post('/', c.create); r.put('/:id', c.update);
r.get('/stock/all', c.getAllStock); r.get('/stock/low', c.getLowStock); r.get('/:id/stock', c.getStock);
module.exports = r;