require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const db = require('./config/db'); // We use the pool from here
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
// FORCE AUTO-SEED VIA CMD
// ==========================================
async function seedDatabase() {
  try {
    console.log('Connecting to DB to seed...');
    
    // We use a direct connection, NOT the pool, just in case
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      multipleStatements: true
    });

    console.log('Connected! Reading schema.sql...');
    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    await conn.query(schema);
    console.log('✅ Schema created!');

    console.log('Reading seed.sql...');
    const seed = fs.readFileSync('./database/seed.sql', 'utf8');
    await conn.query(seed);
    console.log('✅ Data inserted!');
    
    await conn.end();
  } catch (err) {
    console.log('Seed Error:', err.message); 
    // We don't crash the app if it fails (e.g. tables already exist)
  } finally {
    // Start the app no matter what
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  }
}

seedDatabase();