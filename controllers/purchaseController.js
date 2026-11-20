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

exports.getPurchases = async (req, res, next) => {
  try {
    const [rows] = await q.getPurchases();
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};

exports.getPurchaseById = async (req, res, next) => {
  try {
    const [head] = await q.getPurchaseById(req.params.id);
    if (!head.length) return res.status(404).json({ success: false, message: 'Purchase not found' });
    const [items] = await q.getPurchaseDetails(req.params.id);
    res.json({ success: true, data: { ...head[0], items } });
  } catch (e) { next(e); }
};

exports.deletePurchase = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [head] = await q.getPurchaseById(req.params.id);
    if (!head.length) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Purchase not found' }); }
    const [items] = await q.getPurchaseDetails(req.params.id);
    for (const it of items) {
      await q.upsertStockIncrease(conn, it.fruit_id, it.packaging_size, -it.quantity);
    }
    await q.deletePurchaseDetails(conn, req.params.id);
    await q.deletePurchase(conn, req.params.id);
    await conn.commit();
    res.json({ success: true, message: 'Purchase deleted and stock reversed' });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};

exports.updatePurchase = async (req, res, next) => {
  try {
    await db.query('UPDATE purchases SET purchase_date = ? WHERE purchase_id = ?', [req.body.purchase_date, req.params.id]);
    res.json({ success: true, message: 'Purchase date updated' });
  } catch (e) { next(e); }
};