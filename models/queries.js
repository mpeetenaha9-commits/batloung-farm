const db = require('../config/db');

module.exports = {
  // SUPPLIERS
  getAllSuppliers: () => db.query('SELECT * FROM suppliers'),
  getSupplierById: (id) => db.query('SELECT * FROM suppliers WHERE supplier_id = ?', [id]),
  createSupplier: (s) => db.query(
    'INSERT INTO suppliers (business_name, contact_person, phone, province, address) VALUES (?,?,?,?,?)',
    [s.business_name, s.contact_person, s.phone, s.province, s.address]
  ),
  updateSupplier: (id, s) => db.query(
    'UPDATE suppliers SET business_name=?, contact_person=?, phone=?, province=?, address=? WHERE supplier_id=?',
    [s.business_name, s.contact_person, s.phone, s.province, s.address, id]
  ),
  deleteSupplier: (id) => db.query('DELETE FROM suppliers WHERE supplier_id=?', [id]),

  // FRUITS & STOCK
  getAllFruits: () => db.query('SELECT * FROM fruits'),
  createFruit: (f) => db.query(
    'INSERT INTO fruits (fruit_name, description, status) VALUES (?,?,?)',
    [f.fruit_name, f.description, f.status || 'available']
  ),
  updateFruit: (id, f) => db.query(
    'UPDATE fruits SET fruit_name=?, description=?, status=? WHERE fruit_id=?',
    [f.fruit_name, f.description, f.status, id]
  ),
  getStockByFruit: (id) => db.query('SELECT packaging_size, available_quantity FROM stock WHERE fruit_id=?', [id]),
  getAllStock: () => db.query(
    `SELECT f.fruit_name, s.packaging_size, s.available_quantity
     FROM stock s JOIN fruits f ON f.fruit_id = s.fruit_id
     ORDER BY f.fruit_name, FIELD(s.packaging_size,'small','medium','large')`
  ),
  getLowStock: (t=15) => db.query(
    `SELECT f.fruit_name, s.packaging_size, s.available_quantity
     FROM stock s JOIN fruits f ON f.fruit_id = s.fruit_id
     WHERE s.available_quantity <= ? ORDER BY s.available_quantity ASC`, [t]
  ),

  // VENDORS
  getAllVendors: () => db.query('SELECT * FROM vendors'),
  searchVendors: (q) => db.query('SELECT * FROM vendors WHERE vendor_name LIKE ? OR phone_number LIKE ?', [`%${q}%`, `%${q}%`]),
  createVendor: (v) => db.query(
    'INSERT INTO vendors (vendor_name, phone_number, location, registration_date) VALUES (?,?,?,?)',
    [v.vendor_name, v.phone_number, v.location, v.registration_date || new Date()]
  ),
  updateVendor: (id, v) => db.query(
    'UPDATE vendors SET vendor_name=?, phone_number=?, location=? WHERE vendor_id=?',
    [v.vendor_name, v.phone_number, v.location, id]
  ),

  // PURCHASES
  createPurchase: (c, sid, d) => c.query('INSERT INTO purchases (supplier_id, purchase_date, total_amount) VALUES (?,?,0)', [sid, d]),
  createPurchaseDetail: (c, pid, i) => c.query(
    'INSERT INTO purchase_details (purchase_id, fruit_id, quantity, unit_cost, packaging_size) VALUES (?,?,?,?,?)',
    [pid, i.fruit_id, i.quantity, i.unit_cost, i.packaging_size]
  ),
  updatePurchaseTotal: (c, pid, t) => c.query('UPDATE purchases SET total_amount=? WHERE purchase_id=?', [t, pid]),
  upsertStockIncrease: (c, fid, size, qty) => c.query(
    `INSERT INTO stock (fruit_id, packaging_size, available_quantity) VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE available_quantity = available_quantity + VALUES(available_quantity)`,
    [fid, size, qty]
  ),

  // SALES
  createSale: (c, vid, d, method, status, paid) => c.query(
    'INSERT INTO sales (vendor_id, sale_date, payment_status, payment_method, amount_paid, total_amount) VALUES (?,?,?,?,?,0)',
    [vid, d, status, method, paid]
  ),
  createSaleDetail: (c, sid, i) => c.query(
    'INSERT INTO sales_details (sale_id, fruit_id, packaging_size, quantity, unit_price) VALUES (?,?,?,?,?)',
    [sid, i.fruit_id, i.packaging_size, i.quantity, i.unit_price]
  ),
  updateSaleTotal: (c, sid, t) => c.query('UPDATE sales SET total_amount=? WHERE sale_id=?', [t, sid]),
  getStockForUpdate: (c, fid, size) => c.query(
    'SELECT available_quantity FROM stock WHERE fruit_id=? AND packaging_size=? FOR UPDATE', [fid, size]
  ),
  decreaseStock: (c, fid, size, qty) => c.query(
    'UPDATE stock SET available_quantity = available_quantity - ? WHERE fruit_id=? AND packaging_size=?', [qty, fid, size]
  ),
  updatePayment: (c, sid, status, paid) => c.query('UPDATE sales SET payment_status=?, amount_paid=? WHERE sale_id=?', [status, paid, sid]),

  // REPORTS
  reportTopFruits: () => db.query(
    `SELECT f.fruit_name, SUM(sd.quantity) AS total_boxes
     FROM sales_details sd JOIN fruits f ON f.fruit_id = sd.fruit_id
     GROUP BY f.fruit_id ORDER BY total_boxes DESC LIMIT 5`
  ),
  reportRevenueRange: (s, e) => db.query('SELECT COALESCE(SUM(total_amount),0) AS revenue FROM sales WHERE sale_date BETWEEN ? AND ?', [s, e]),
  reportTopVendor: () => db.query(
    `SELECT v.vendor_name, SUM(sd.quantity) AS total_boxes
     FROM sales s JOIN sales_details sd ON sd.sale_id = s.sale_id
     JOIN vendors v ON v.vendor_id = s.vendor_id
     GROUP BY v.vendor_id ORDER BY total_boxes DESC LIMIT 1`
  ),
  reportStockLevels: () => db.query(
    `SELECT f.fruit_name, s.packaging_size, s.available_quantity
     FROM stock s JOIN fruits f ON f.fruit_id = s.fruit_id
     ORDER BY f.fruit_name, FIELD(s.packaging_size,'small','medium','large')`
  ),
  reportOutstanding: () => db.query(
    `SELECT v.vendor_id, v.vendor_name, COALESCE(SUM(s.total_amount - s.amount_paid),0) AS outstanding_balance
     FROM vendors v LEFT JOIN sales s ON s.vendor_id = v.vendor_id
     GROUP BY v.vendor_id HAVING outstanding_balance > 0 ORDER BY outstanding_balance DESC`
  )
};