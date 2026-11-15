require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
  // We will paste your railway credentials here
  const connection = await mysql.createConnection({
    host: 'YOUR_MYSQLHOST',
    user: 'YOUR_MYSQLUSER',
    password: 'YOUR_MYSQLPASSWORD',
    database: 'YOUR_MYSQLDATABASE',
    port: 'YOUR_MYSQLPORT',
    multipleStatements: true
  });

  try {
    console.log('Connected! Running schema.sql...');
    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    await connection.query(schema);
    
    console.log('Running seed.sql...');
    const seed = fs.readFileSync('./database/seed.sql', 'utf8');
    await connection.query(seed);
    
    console.log(' Database seeded successfully!');
  } catch (err) {
    console.error(' Error:', err.message);
  } finally {
    await connection.end();
  }
}

run();