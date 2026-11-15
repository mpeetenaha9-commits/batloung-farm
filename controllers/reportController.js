const q = require('../models/queries');
exports.topFruits = async (req, res, next) => {
  try { const [r] = await q.reportTopFruits(); res.status(200).json({ success:true, data:r }); } catch (e) { next(e); }
};
exports.revenue = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ success:false, message:'start and end required' });
    const [r] = await q.reportRevenueRange(start, end);
    res.status(200).json({ success:true, data:r[0] });
  } catch (e) { next(e); }
};
exports.topVendor = async (req, res, next) => {
  try { const [r] = await q.reportTopVendor(); res.status(200).json({ success:true, data:r[0] || null }); } catch (e) { next(e); }
};
exports.stockLevels = async (req, res, next) => {
  try { const [r] = await q.reportStockLevels(); res.status(200).json({ success:true, data:r }); } catch (e) { next(e); }
};
exports.outstanding = async (req, res, next) => {
  try { const [r] = await q.reportOutstanding(); res.status(200).json({ success:true, data:r }); } catch (e) { next(e); }
};