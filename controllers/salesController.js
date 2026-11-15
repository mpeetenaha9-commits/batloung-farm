const db = require('../config/db');
const q = require('../models/queries');
exports.createSale = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { vendor_id, sale_date, payment_method, amount_paid, items } = req.body;
    if (!vendor_id || !Array.isArray(items) || !items.length) return res.status(400).json({ success:false, message:'vendor_id and items[] required' });
    for (const it of items) {
      if (!it.fruit_id || !it.packaging_size || !it.quantity || it.quantity <= 0 || it.unit_price == null || it.unit_price < 0)
        return res.status(400).json({ success:false, message:'Invalid item' });
    }
    await conn.beginTransaction();
    for (const it of items) {
      const [rows] = await q.getStockForUpdate(conn, it.fruit_id, it.packaging_size);
      const avail = rows.length ? rows[0].available_quantity : 0;
      if (avail < it.quantity) {
        await conn.rollback();
        return res.status(400).json({ success:false, message:`Insufficient stock fruit ${it.fruit_id} (${it.packaging_size}): need ${it.quantity}, have ${avail}` });
      }
    }
    let total = 0;
    const paid = Number(amount_paid) || 0;
    const [s] = await q.createSale(conn, vendor_id, sale_date || new Date(), payment_method || 'cash', 'UNPAID', 0);
    for (const it of items) {
      await q.createSaleDetail(conn, s.insertId, it);
      total += it.quantity * it.unit_price;
      await q.decreaseStock(conn, it.fruit_id, it.packaging_size, it.quantity);
    }
    await q.updateSaleTotal(conn, s.insertId, total);
    let status = 'UNPAID';
    if (paid >= total) status = 'PAID';
    else if (paid > 0) status = 'PARTIALLY_PAID';
    await q.updatePayment(conn, s.insertId, status, paid);
    await conn.commit();
    res.status(201).json({ success:true, sale_id: s.insertId, total_amount: total, payment_status: status });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};