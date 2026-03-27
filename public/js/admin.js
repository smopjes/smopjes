(function () {
  const DAYS = [
    { key: 'monday',    label: 'Ma' },
    { key: 'tuesday',   label: 'Di' },
    { key: 'wednesday', label: 'Wo' },
    { key: 'thursday',  label: 'Do' },
    { key: 'friday',    label: 'Vr' },
  ];
  const DAY_FULL = {
    monday: 'Maandag', tuesday: 'Dinsdag', wednesday: 'Woensdag',
    thursday: 'Donderdag', friday: 'Vrijdag',
  };

  // --- Week ID ---
  function getWeekId(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  document.getElementById('current-week-id').textContent = getWeekId(new Date());

  // --- Auth helpers ---
  function getPassword() {
    return document.getElementById('admin-password').value;
  }

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Admin-Password': getPassword(),
    };
  }

  // --- Feedback helpers ---
  function showFeedback(id, type, message) {
    const el = document.getElementById(id);
    el.className = `message ${type}`;
    el.textContent = message;
    el.classList.remove('hidden');
  }

  function hideFeedback(id) {
    document.getElementById(id).classList.add('hidden');
  }

  // --- Auth test ---
  window.testAuth = async function () {
    const statusEl = document.getElementById('auth-status');
    statusEl.className = 'auth-status';
    statusEl.textContent = 'Testen…';
    statusEl.classList.remove('hidden');
    try {
      const res = await fetch('/api/admin/orders', { headers: authHeaders() });
      if (res.ok) {
        statusEl.className = 'auth-status ok';
        statusEl.textContent = '✓ Verbinding geslaagd';
        sessionStorage.setItem('adminPassword', getPassword());
      } else {
        statusEl.className = 'auth-status fail';
        statusEl.textContent = '✗ Ongeldig wachtwoord';
      }
    } catch {
      statusEl.className = 'auth-status fail';
      statusEl.textContent = '✗ Verbindingsfout';
    }
  };

  // Restore password from session
  const savedPw = sessionStorage.getItem('adminPassword');
  if (savedPw) {
    document.getElementById('admin-password').value = savedPw;
  }

  // --- Main dish rows ---
  const NUM_MAINS = 3;

  function buildMainsForm() {
    const container = document.getElementById('mains-container');
    container.innerHTML = '';
    for (let i = 1; i <= NUM_MAINS; i++) {
      const row = document.createElement('div');
      row.className = 'main-dish-row';
      row.innerHTML = `
        <div class="dish-label">Gerecht ${i}</div>
        <input type="text" id="main${i}-name" placeholder="Naam van het gerecht" style="width:100%;padding:10px 12px;font-size:1rem;border:2px solid var(--border);border-radius:8px;outline:none;">
        <div class="day-checkboxes" id="main${i}-days">
          ${DAYS.map(d => `
            <label class="day-check">
              <input type="checkbox" name="main${i}-day" value="${d.key}">
              ${d.label}
            </label>`).join('')}
        </div>`;
      container.appendChild(row);
    }
  }

  buildMainsForm();

  // --- Load existing menu into form ---
  async function loadCurrentMenu() {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (!data.menu) return;
      const m = data.menu;
      document.getElementById('soup-name').value = m.soup.name;
      document.getElementById('vega-name').value = m.vega.name;
      m.mains.forEach((main, i) => {
        const idx = i + 1;
        const nameInput = document.getElementById(`main${idx}-name`);
        if (nameInput) nameInput.value = main.name;
        main.days.forEach(day => {
          const cb = document.querySelector(`#main${idx}-days input[value="${day}"]`);
          if (cb) cb.checked = true;
        });
      });
    } catch {
      // No menu yet, leave form empty
    }
  }

  loadCurrentMenu();

  // --- Save menu ---
  window.saveMenu = async function () {
    hideFeedback('menu-feedback');

    const soup = { name: document.getElementById('soup-name').value.trim() };
    const vega = { name: document.getElementById('vega-name').value.trim() };

    if (!soup.name) { showFeedback('menu-feedback', 'error', 'Vul een soepnaam in.'); return; }
    if (!vega.name) { showFeedback('menu-feedback', 'error', 'Vul een veganaam in.'); return; }

    const mains = [];
    for (let i = 1; i <= NUM_MAINS; i++) {
      const name = document.getElementById(`main${i}-name`).value.trim();
      const days = Array.from(document.querySelectorAll(`#main${i}-days input:checked`)).map(cb => cb.value);
      if (name || days.length > 0) {
        if (!name) { showFeedback('menu-feedback', 'error', `Vul een naam in voor gerecht ${i}.`); return; }
        if (days.length === 0) { showFeedback('menu-feedback', 'error', `Kies minimaal één dag voor "${name}".`); return; }
        mains.push({ name, days });
      }
    }

    if (mains.length === 0) { showFeedback('menu-feedback', 'error', 'Voeg minimaal één hoofdgerecht toe.'); return; }

    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Opslaan…';

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ soup, vega, mains }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('menu-feedback', 'success', `✓ ${data.message}`);
        document.getElementById('current-week-id').textContent = data.weekId;
      } else {
        showFeedback('menu-feedback', 'error', data.error || 'Er ging iets mis.');
      }
    } catch {
      showFeedback('menu-feedback', 'error', 'Verbindingsfout. Probeer opnieuw.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Menu opslaan';
    }
  };

  // --- Load orders ---
  window.loadOrders = async function () {
    hideFeedback('orders-feedback');
    const container = document.getElementById('orders-container');
    container.innerHTML = '<p class="text-muted">Laden…</p>';

    try {
      const [menuRes, ordersRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/admin/orders', { headers: authHeaders() }),
      ]);

      if (!ordersRes.ok) {
        const err = await ordersRes.json();
        showFeedback('orders-feedback', 'error', err.error || 'Fout bij laden bestellingen.');
        container.innerHTML = '';
        return;
      }

      const menuData = await menuRes.json();
      const ordersData = await ordersRes.json();
      const orders = ordersData.orders || [];
      const menu = menuData.menu;

      if (orders.length === 0) {
        container.innerHTML = '<p class="text-muted">Nog geen bestellingen deze week.</p>';
        return;
      }

      // Build choice label
      const choiceLabel = (choice) => {
        if (choice === 'none') return '—';
        if (choice === 'soup') return menu ? `Soep` : 'Soep';
        if (choice === 'vega') return menu ? `Vega` : 'Vega';
        if (menu) {
          const main = menu.mains.find(m => m.id === choice);
          if (main) return main.name.split(' ')[0]; // abbreviate
        }
        return choice;
      };

      // Build summary counts
      const summary = {};
      DAYS.forEach(d => { summary[d.key] = {}; });
      for (const order of orders) {
        for (const [day, val] of Object.entries(order.days || {})) {
          const c = val.choice;
          summary[day][c] = (summary[day][c] || 0) + 1;
        }
      }

      const formatSummary = (day) => {
        const counts = summary[day];
        return Object.entries(counts)
          .filter(([k]) => k !== 'none')
          .map(([k, v]) => `${choiceLabel(k)}:${v}`)
          .join(', ') || '—';
      };

      let html = `<table>
        <thead>
          <tr>
            <th>Naam</th>
            ${DAYS.map(d => `<th>${d.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>`;

      for (const order of orders) {
        html += `<tr>
          <td><strong>${escapeHtml(order.name)}</strong></td>
          ${DAYS.map(d => `<td>${escapeHtml(choiceLabel((order.days?.[d.key]?.choice) || 'none'))}</td>`).join('')}
        </tr>`;
      }

      html += `<tr class="summary-row">
        <td>Totaal</td>
        ${DAYS.map(d => `<td style="font-size:0.75rem;">${escapeHtml(formatSummary(d.key))}</td>`).join('')}
      </tr>`;

      html += '</tbody></table>';
      container.innerHTML = html;
    } catch {
      showFeedback('orders-feedback', 'error', 'Verbindingsfout. Probeer opnieuw.');
      container.innerHTML = '';
    }
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Save password on input
  document.getElementById('admin-password').addEventListener('input', function () {
    sessionStorage.setItem('adminPassword', this.value);
  });
})();
