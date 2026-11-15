const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/top-fruits', reportController.topFruits);
router.get('/revenue', reportController.revenue);
router.get('/top-vendor', reportController.topVendor);
router.get('/stock-levels', reportController.stockLevels);
router.get('/outstanding', reportController.outstanding);

module.exports = router;