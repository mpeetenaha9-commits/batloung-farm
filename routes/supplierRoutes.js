const e = require('express'); const r = e.Router(); const c = require('../controllers/supplierController');
r.get('/', c.getAll); r.get('/:id', c.getOne); r.post('/', c.create); r.put('/:id', c.update); r.delete('/:id', c.remove);
module.exports = r;