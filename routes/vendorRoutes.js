const e = require('express'); const r = e.Router(); const c = require('../controllers/vendorController');
r.get('/', c.getAll); r.get('/search', c.search); r.post('/', c.create); r.put('/:id', c.update);
module.exports = r;