const db = require('../config/db');
const q = require('../models/queries');
const sq = require('../models/salesQueries');

const statusFor = (paid, total) => (paid >= total && total > 0 ? 'PAID' : paid > 0 ? 'PARTIALLY_PAID' : 'UNPAID');

exports.listSales = async (req, res, next) => {
  try {
    const [rows] = await sq.listSales();
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};

exports.getSale = async (req, res, next) => {
  try {
    const [rows] = await sq.getSale(req.params.id);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Sale not found' });
    const [items] = await sq.getItems(req.params.id);
    res.json({ success: true, data: { ...rows[0], items } });
  } catch (e) { next(e); }
};

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

exports.updateSale = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [rows] = await sq.getSale(id);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Sale not found' });
    const cur = rows[0];
    const b = req.body || {};
    const vendor = b.vendor_id ?? cur.vendor_id;
    const date = b.sale_date ?? cur.sale_date;
    const method = b.payment_method ?? cur.payment_method;
    const paid = b.amount_paid != null ? Number(b.amount_paid) : Number(cur.amount_paid);
    if (!(paid >= 0)) return res.status(400).json({ success: false, message: 'amount_paid must be 0 or more' });
    const status = statusFor(paid, Number(cur.total_amount));
    await sq.updateHeader(id, vendor, date, method, status, paid);
    res.json({ success: true, sale_id: Number(id), payment_status: status, amount_paid: paid });
  } catch (e) { next(e); }
};

exports.deleteSale = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const id = req.params.id;
    await conn.beginTransaction();
    const [items] = await sq.getItemsTx(conn, id);
    for (const it of items) await sq.restoreStock(conn, it.fruit_id, it.packaging_size, it.quantity);
    await sq.deleteItems(conn, id);
    const [r] = await sq.deleteSale(conn, id);
    if (!r.affectedRows) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    await conn.commit();
    res.json({ success: true, message: 'Sale deleted and stock restored' });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};