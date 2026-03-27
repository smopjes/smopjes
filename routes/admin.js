const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

const menuPath = path.join(__dirname, '..', 'data', 'menu.json');
const ordersPath = path.join(__dirname, '..', 'data', 'orders.json');
const menusLogPath = path.join(__dirname, '..', 'logs', 'menus.log');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function appendLog(filePath, entry) {
  fs.appendFileSync(filePath, JSON.stringify(entry) + '\n');
}

function getWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// Auth middleware
router.use((req, res, next) => {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD niet ingesteld.' });
  }
  const provided = req.headers['x-admin-password'] || '';
  let authorized = false;
  try {
    const a = Buffer.from(provided.padEnd(password.length));
    const b = Buffer.from(password);
    if (a.length === b.length) {
      authorized = crypto.timingSafeEqual(a, b) && provided === password;
    }
  } catch {
    authorized = false;
  }
  if (!authorized) {
    return res.status(401).json({ error: 'Ongeldig wachtwoord.' });
  }
  next();
});

// POST /api/admin/menu
router.post('/menu', (req, res) => {
  const { soup, vega, mains } = req.body;

  if (!soup || !soup.name || !soup.name.trim()) {
    return res.status(400).json({ error: 'Soepnaam is verplicht.' });
  }
  if (!vega || !vega.name || !vega.name.trim()) {
    return res.status(400).json({ error: 'Veganaam is verplicht.' });
  }
  if (!Array.isArray(mains) || mains.length === 0) {
    return res.status(400).json({ error: 'Minimaal één hoofdgerecht is verplicht.' });
  }

  const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const cleanMains = [];
  for (let i = 0; i < mains.length; i++) {
    const m = mains[i];
    if (!m.name || !m.name.trim()) {
      return res.status(400).json({ error: `Naam van gerecht ${i + 1} is verplicht.` });
    }
    if (!Array.isArray(m.days) || m.days.length === 0) {
      return res.status(400).json({ error: `Gerecht "${m.name}" moet aan minimaal één dag gekoppeld zijn.` });
    }
    for (const day of m.days) {
      if (!VALID_DAYS.includes(day)) {
        return res.status(400).json({ error: `Ongeldige dag "${day}" voor gerecht "${m.name}".` });
      }
    }
    cleanMains.push({ id: `main${i + 1}`, name: m.name.trim(), days: m.days });
  }

  const weekId = getWeekId();
  const now = new Date().toISOString();

  const menu = {
    weekId,
    createdAt: now,
    soup: { name: soup.name.trim() },
    vega: { name: vega.name.trim() },
    mains: cleanMains,
  };

  writeJSON(menuPath, menu);
  writeJSON(ordersPath, { weekId, orders: [] });
  appendLog(menusLogPath, { event: 'menu_set', weekId, timestamp: now, menu });

  res.json({ ok: true, weekId, message: `Menu voor ${weekId} opgeslagen.` });
});

// GET /api/admin/orders
router.get('/orders', (req, res) => {
  const orders = readJSON(ordersPath);
  res.json(orders);
});

module.exports = router;
