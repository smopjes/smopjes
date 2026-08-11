(function () {
  const DAYS = [
    { key: 'monday',    label: 'Maandag' },
    { key: 'tuesday',   label: 'Dinsdag' },
    { key: 'wednesday', label: 'Woensdag' },
    { key: 'thursday',  label: 'Donderdag' },
    { key: 'friday',    label: 'Vrijdag' },
  ];

  let currentMenu = null;

  function getWeekRange(weekId) {
    const [year, week] = weekId.split('-W').map(Number);
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const dayOfWeek = jan4.getUTCDay() || 7;
    const monday = new Date(jan4);
    monday.setUTCDate(jan4.getUTCDate() + (week - 1) * 7 - (dayOfWeek - 1));
    const friday = new Date(monday);
    friday.setUTCDate(monday.getUTCDate() + 4);
    const fmt = d => d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', timeZone: 'UTC' });
    return `${fmt(monday)} – ${fmt(friday)} ${year}`;
  }

  function renderMenuOverview(menu) {
    const container = document.getElementById('menu-overview');
    container.innerHTML = '';

    const addItem = (badgeClass, badgeText, name, subtitle) => {
      const div = document.createElement('div');
      div.className = 'menu-item';
      div.innerHTML = `
        <span class="badge ${badgeClass}">${badgeText}</span>
        <div>
          <div class="meal-name">${name}</div>
          ${subtitle ? `<div class="meal-days">${subtitle}</div>` : ''}
        </div>`;
      container.appendChild(div);
    };

    addItem('soup', 'Soep', menu.soup.name, 'Elke dag beschikbaar');
    addItem('vega', 'Vega', menu.vega.name, 'Elke dag beschikbaar');

    for (const main of menu.mains) {
      const dayLabels = main.days.map(d => DAYS.find(x => x.key === d)?.label || d).join(', ');
      addItem('', main.name.substring(0, 1).toUpperCase(), main.name, dayLabels);
    }
  }

  function renderDays(menu) {
    const container = document.getElementById('days-container');
    container.innerHTML = '';

    for (const day of DAYS) {
      const main = menu.mains.find(m => m.days.includes(day.key));

      const card = document.createElement('div');
      card.className = 'day-card';
      card.innerHTML = `<div class="day-header">${day.label}</div><div class="day-options" id="opts-${day.key}"></div>`;
      container.appendChild(card);

      const opts = document.getElementById(`opts-${day.key}`);
      const options = [];

      if (main) options.push({ value: main.id, name: main.name, type: 'Hoofdgerecht' });
      options.push({ value: 'soup', name: menu.soup.name, type: 'Soep' });
      options.push({ value: 'vega', name: menu.vega.name, type: 'Vega' });
      options.push({ value: 'none', name: 'Niets', type: 'Ik bestel deze dag niet' });

      for (const opt of options) {
        const label = document.createElement('label');
        label.className = 'radio-option';
        label.innerHTML = `
          <input type="radio" name="day-${day.key}" value="${opt.value}">
          <div class="option-label">
            <div class="option-name">${opt.name}</div>
            <div class="option-type">${opt.type}</div>
          </div>`;
        opts.appendChild(label);
      }
    }
  }

  function showFeedback(type, message) {
    const el = document.getElementById('feedback');
    el.className = `message ${type}`;
    el.textContent = message;
    el.classList.remove('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideFeedback() {
    document.getElementById('feedback').classList.add('hidden');
  }

  window.submitOrder = async function () {
    hideFeedback();

    const name = document.getElementById('order-name').value.trim();
    if (!name) {
      showFeedback('error', 'Vul je naam in.');
      document.getElementById('order-name').focus();
      return;
    }

    const days = {};
    for (const day of DAYS) {
      const selected = document.querySelector(`input[name="day-${day.key}"]:checked`);
      if (!selected) {
        showFeedback('error', `Maak een keuze voor ${day.label}.`);
        return;
      }
      days[day.key] = { choice: selected.value };
    }

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Opslaan…';

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, days }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', `✓ ${data.message}`);
        document.getElementById('order-form-wrap').classList.add('hidden');
      } else {
        showFeedback('error', data.error || 'Er ging iets mis.');
      }
    } catch {
      showFeedback('error', 'Verbindingsfout. Probeer opnieuw.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Bestelling opslaan';
    }
  };

  async function init() {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();

      if (!data.menu) {
        document.getElementById('no-menu').classList.remove('hidden');
        return;
      }

      currentMenu = data.menu;
      document.getElementById('menu-content').classList.remove('hidden');
      document.getElementById('week-label').textContent = `Week ${getWeekRange(currentMenu.weekId)}`;
      renderMenuOverview(currentMenu);
      renderDays(currentMenu);
    } catch {
      document.getElementById('no-menu').classList.remove('hidden');
    }
  }

  init();
})();
