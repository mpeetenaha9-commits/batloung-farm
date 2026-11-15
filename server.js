require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const db = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) =>
  res.json({ success: true, message: 'Batloung Farm API running' })
);

// 🚨 SECRET SEED ROUTE
app.get('/secret-seed', async (req, res) => {
  try {
    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    const seed = fs.readFileSync('./database/seed.sql', 'utf8');
    await db.query(schema);
    await db.query(seed);
    res.json({ success: true, message: 'Database seeded successfully via API!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/fruits',    require('./routes/fruitRoutes'));
app.use('/api/vendors',   require('./routes/vendorRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/sales',     require('./routes/salesRoutes'));
app.use('/api/reports',   require('./routes/reportRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));