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

app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/fruits',    require('./routes/fruitRoutes'));
app.use('/api/vendors',   require('./routes/vendorRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/sales',     require('./routes/salesRoutes'));
app.use('/api/reports',   require('./routes/reportRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// ==========================================
// HARD FORCE AUTO-SEED
// ==========================================
async function forceSeed() {
  try {
    console.log('Forcing database seed...');
    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    const seed = fs.readFileSync('./database/seed.sql', 'utf8');
    
    // Execute raw SQL
    await db.query(schema);
    await db.query(seed);
    console.log('✅ Forced Seed Successful!');
  } catch (err) {
    console.error('❌ Seed Error (likely already seeded):', err.message);
  } finally {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  }
}

forceSeed();