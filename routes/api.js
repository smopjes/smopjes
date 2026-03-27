const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const menuPath = path.join(__dirname, '..', 'data', 'menu.json');
const ordersPath = path.join(__dirname, '..', 'data', 'orders.json');
const ordersLogPath = path.join(__dirname, '..', 'logs', 'orders.log');

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function appendLog(filePath, entry) {
  fs.appendFileSync(filePath, JSON.stringify(entry) + '\n');
}

// GET /api/menu
router.get('/menu', (req, res) => {
  const menu = readJSON(menuPath);
  res.json({ menu });
});

// POST /api/orders
router.post('/orders', (req, res) => {
  const menu = readJSON(menuPath);
  if (!menu) {
    return res.status(400).json({ error: 'Er is nog geen menu voor deze week.' });
  }

  const { name, days } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Naam is verplicht.' });
  }

  if (!days || typeof days !== 'object') {
    return res.status(400).json({ error: 'Dagkeuzes ontbreken.' });
  }

  // Validate each day's choice
  const validMainIds = menu.mains.map(m => m.id);
  for (const day of DAYS) {
    if (!days[day]) {
      return res.status(400).json({ error: `Keuze voor ${day} ontbreekt.` });
    }
    const choice = days[day].choice;
    if (!choice) {
      return res.status(400).json({ error: `Keuze voor ${day} ontbreekt.` });
    }
    if (choice === 'none' || choice === 'soup' || choice === 'vega') continue;
    if (validMainIds.includes(choice)) {
      // Verify the main is actually offered on this day
      const main = menu.mains.find(m => m.id === choice);
      if (!main.days.includes(day)) {
        return res.status(400).json({ error: `${main.name} is niet beschikbaar op ${day}.` });
      }
      continue;
    }
    return res.status(400).json({ error: `Ongeldige keuze "${choice}" voor ${day}.` });
  }

  const ordersData = readJSON(ordersPath);
  const nameNorm = name.trim().toLowerCase();
  const now = new Date().toISOString();

  const order = {
    id: `ord_${Date.now()}`,
    name: name.trim(),
    submittedAt: now,
    days,
  };

  // Replace existing order by same name (case-insensitive), else append
  const existingIndex = ordersData.orders.findIndex(
    o => o.name.toLowerCase() === nameNorm
  );
  if (existingIndex >= 0) {
    order.id = ordersData.orders[existingIndex].id;
    ordersData.orders[existingIndex] = order;
  } else {
    ordersData.orders.push(order);
  }

  writeJSON(ordersPath, ordersData);
  appendLog(ordersLogPath, {
    event: 'order_submitted',
    weekId: menu.weekId,
    timestamp: now,
    order,
  });

  res.json({ ok: true, message: 'Bestelling opgeslagen!' });
});

module.exports = router;
