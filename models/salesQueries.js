const db = require('../config/db');

module.exports = {
  listSales: () => db.query(
    `SELECT s.sale_id, s.vendor_id, v.vendor_name, v.location,
            DATE_FORMAT(s.sale_date, '%Y-%m-%d') AS sale_date,
            s.payment_status, s.payment_method, s.amount_paid, s.total_amount
     FROM sales s
     LEFT JOIN vendors v ON v.vendor_id = s.vendor_id
     ORDER BY s.sale_date DESC, s.sale_id DESC`
  ),
  getSale: (id) => db.query('SELECT * FROM sales WHERE sale_id=?', [id]),
  getItems: (id) => db.query(
    `SELECT sd.fruit_id, f.fruit_name, sd.packaging_size, sd.quantity, sd.unit_price
     FROM sales_details sd
     LEFT JOIN fruits f ON f.fruit_id = sd.fruit_id
     WHERE sd.sale_id=?`, [id]
  ),
  updateHeader: (id, vid, d, method, status, paid) => db.query(
    'UPDATE sales SET vendor_id=?, sale_date=?, payment_method=?, payment_status=?, amount_paid=? WHERE sale_id=?',
    [vid, d, method, status, paid, id]
  ),
  getItemsTx: (c, id) => c.query('SELECT fruit_id, packaging_size, quantity FROM sales_details WHERE sale_id=?', [id]),
  restoreStock: (c, fid, size, qty) => c.query(
    'UPDATE stock SET available_quantity = available_quantity + ? WHERE fruit_id=? AND packaging_size=?', [qty, fid, size]
  ),
  deleteItems: (c, id) => c.query('DELETE FROM sales_details WHERE sale_id=?', [id]),
  deleteSale: (c, id) => c.query('DELETE FROM sales WHERE sale_id=?', [id]),
};