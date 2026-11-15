const db = require('../config/db');
const q = require('../models/queries');
exports.createPurchase = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { supplier_id, purchase_date, items } = req.body;
    if (!supplier_id || !Array.isArray(items) || !items.length) return res.status(400).json({ success:false, message:'supplier_id and items[] required' });
    for (const it of items) {
      if (!it.fruit_id || !it.quantity || it.quantity <= 0 || it.unit_cost == null || it.unit_cost < 0 || !it.packaging_size)
        return res.status(400).json({ success:false, message:'Invalid item' });
    }
    await conn.beginTransaction();
    const [p] = await q.createPurchase(conn, supplier_id, purchase_date || new Date());
    let total = 0;
    for (const it of items) {
      await q.createPurchaseDetail(conn, p.insertId, it);
      total += it.quantity * it.unit_cost;
      await q.upsertStockIncrease(conn, it.fruit_id, it.packaging_size, it.quantity);
    }
    await q.updatePurchaseTotal(conn, p.insertId, total);
    await conn.commit();
    res.status(201).json({ success:true, purchase_id: p.insertId, total_amount: total });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};