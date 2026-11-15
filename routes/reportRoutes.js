const e = require('express'); const r = e.Router(); const c = require('../controllers/reportController');
r.get('/top-fruits', c.topFruits); r.get('/revenue', c.revenue); r.get('/top-vendor', c.topVendor);
r.get('/stock-levels', c.stockLevels); r.get('/outstanding', c.outstanding);
module.exports = r;