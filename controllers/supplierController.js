const q = require('../models/queries');
exports.getAll = async (req, res, next) => {
  try { const [r] = await q.getAllSuppliers(); res.status(200).json({ success:true, data:r }); } catch (e) { next(e); }
};
exports.getOne = async (req, res, next) => {
  try {
    const [r] = await q.getSupplierById(req.params.id);
    if (!r.length) return res.status(404).json({ success:false, message:'Not found' });
    res.status(200).json({ success:true, data:r[0] });
  } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try {
    const b = req.body;
    if (!b.business_name || !b.contact_person || !b.phone || !b.province || !b.address)
      return res.status(400).json({ success:false, message:'All fields required' });
    const [r] = await q.createSupplier(b);
    res.status(201).json({ success:true, supplier_id: r.insertId });
  } catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
  try {
    const [r] = await q.updateSupplier(req.params.id, req.body);
    if (!r.affectedRows) return res.status(404).json({ success:false, message:'Not found' });
    res.status(200).json({ success:true });
  } catch (e) { next(e); }
};
exports.remove = async (req, res, next) => {
  try {
    const [r] = await q.deleteSupplier(req.params.id);
    if (!r.affectedRows) return res.status(404).json({ success:false, message:'Not found' });
    res.status(200).json({ success:true });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') return res.status(400).json({ success:false, message:'Cannot delete: supplier has purchases' });
    next(e);
  }
};