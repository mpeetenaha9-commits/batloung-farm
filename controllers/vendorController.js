const q = require('../models/queries');
exports.getAll = async (req, res, next) => {
  try { const [r] = await q.getAllVendors(); res.status(200).json({ success:true, data:r }); } catch (e) { next(e); }
};
exports.search = async (req, res, next) => {
  try {
    if (!req.query.q) return res.status(400).json({ success:false, message:'q required' });
    const [r] = await q.searchVendors(req.query.q);
    res.status(200).json({ success:true, data:r });
  } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try {
    const b = req.body;
    if (!b.vendor_name || !b.phone_number || !b.location) return res.status(400).json({ success:false, message:'Required fields missing' });
    const [r] = await q.createVendor(b);
    res.status(201).json({ success:true, vendor_id: r.insertId });
  } catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
  try {
    const [r] = await q.updateVendor(req.params.id, req.body);
    if (!r.affectedRows) return res.status(404).json({ success:false, message:'Not found' });
    res.status(200).json({ success:true });
  } catch (e) { next(e); }
};