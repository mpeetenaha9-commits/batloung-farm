const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
  const connection = await mysql.createConnection({
    host: 'mysql.railway.internal',
    user: 'root',
    password: 'haHAJhPsVzjCOkiEVVPDjzRhAnRub1Lu', 
    database: 'railway',
    port: 3306,
    multipleStatements: true
  });

  try {
    console.log('Connected! Reading seed.sql...');
    const seed = fs.readFileSync('./database/seed.sql', 'utf8');
    await connection.query(seed);
    console.log(' Data inserted successfully!');
  } catch (err) {
    console.error(' Error:', err.message);
  } finally {
    await connection.end();
  }
}

run();