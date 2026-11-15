const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
  const connection = await mysql.createConnection({
    host: 'roundhouse.proxy.rlwy.net', 
    user: 'root',
    password: 'haHAJhPsVzjCOkiEVVPDjzRhAnRub1Lu', 
    database: 'railway',
    port: 3306,
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