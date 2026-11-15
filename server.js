require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const db = require('./config/db'); // We need this for the auto-seed
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
// AUTO-SEED LOGIC (Runs on Railway Boot)
// ==========================================
async function autoSeed() {
  try {
    console.log('Checking database tables...');
    // 1. Check if the 'suppliers' table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'suppliers'");
    
    if (tables.length === 0) {
      console.log('Tables not found. Auto-seeding database...');
      
      const schema = fs.readFileSync('./database/schema.sql', 'utf8');
      await db.query(schema);
      console.log('✅ Tables created.');

      const seed = fs.readFileSync('./database/seed.sql', 'utf8');
      await db.query(seed);
      console.log('✅ Sample data inserted.');
    } else {
      console.log('✅ Database already seeded. Skipping.');
    }
  } catch (err) {
    console.error('❌ Auto-seed failed:', err.message);
  } finally {
    // Start the server regardless of seed success
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  }
}

autoSeed();