const q = require('../models/queries');

exports.getAll = async (req, res, next) => {
  try { const [r] = await q.getAllFruits(); res.status(200).json({ success:true, data:r }); } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.body.fruit_name) return res.status(400).json({ success:false, message:'fruit_name required' });
    const [r] = await q.createFruit(req.body);
    res.status(201).json({ success:true, fruit_id: r.insertId });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const [r] = await q.updateFruit(req.params.id, req.body);
    if (!r.affectedRows) return res.status(404).json({ success:false, message:'Not found' });
    res.status(200).json({ success:true });
  } catch (e) { next(e); }
};

exports.getStock = async (req, res, next) => {
  try { const [r] = await q.getStockByFruit(req.params.id); res.status(200).json({ success:true, data:r }); } catch (e) { next(e); }
};

exports.getAllStock = async (req, res, next) => {
  try { const [r] = await q.getAllStock(); res.status(200).json({ success:true, data:r }); } catch (e) { next(e); }
};

exports.getLowStock = async (req, res, next) => {
  try {
    const t = parseInt(req.query.threshold) || 15;
    const [r] = await q.getLowStock(t);
    res.status(200).json({ success:true, data:r });
  } catch (e) { next(e); }
};