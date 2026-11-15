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