require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data and logs directories exist (best-effort: read-only filesystems,
// like Vercel's serverless functions, can't create these — don't crash on it)
try {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });

  // Initialize data files if missing
  const menuPath = path.join(__dirname, 'data', 'menu.json');
  const ordersPath = path.join(__dirname, 'data', 'orders.json');

  if (!fs.existsSync(menuPath)) {
    fs.writeFileSync(menuPath, JSON.stringify(null, null, 2));
  }
  if (!fs.existsSync(ordersPath)) {
    fs.writeFileSync(ordersPath, JSON.stringify({ weekId: null, orders: [] }, null, 2));
  }
} catch (err) {
  console.warn('Kon data/logs niet initialiseren (mogelijk read-only bestandssysteem):', err.message);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./routes/api'));
app.use('/api/admin', require('./routes/admin'));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Smopjes draait op http://localhost:${PORT}`);
  });
}

module.exports = app;
