const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
  console.log("Connecting to Railway DB...");
  const connection = await mysql.createConnection({
    host: 'roundhouse.proxy.rlwy.net', // Make sure this matches your Railway TCP Proxy host!
    user: 'root',
    password: 'haHAJhPsVzjCOkiEVVPDjzRhAnRub1Lu', 
    database: 'railway',
    port: 3306, // Make sure this matches your Railway TCP Proxy port!
    connectTimeout: 30000, // Wait 30 seconds before timing out
    multipleStatements: true
  });

  try {
    console.log('✅ Connected! Running schema.sql...');
    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    await connection.query(schema);
    
    console.log('✅ Schema created! Running seed.sql...');
    const seed = fs.readFileSync('./database/seed.sql', 'utf8');
    await connection.query(seed);
    
    console.log('🚀 Database seeded successfully! You are done.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await connection.end();
  }
}

run();