/* ══════════════════════════════════════════
   NovaCRM — Utilities & Storage Layer
   Currency exchange, animations, persistence & helpers
   ══════════════════════════════════════════ */
const API_BASE = (typeof window !== 'undefined' && window.location.port === '8080') ? '' : 'http://localhost:8080';
window.isJavaBackendActive = false;

function money(n) {
  const rate = (typeof EXCHANGE_RATES !== 'undefined' && EXCHANGE_RATES[currentCurrency]) || 1.0;
  const symbol = (typeof CURRENCY_SYMBOLS !== 'undefined' && CURRENCY_SYMBOLS[currentCurrency]) || '$';
  const converted = Math.round(Number(n || 0) * rate);
  return symbol + converted.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function compactMoney(n) {
  const rate = (typeof EXCHANGE_RATES !== 'undefined' && EXCHANGE_RATES[currentCurrency]) || 1.0;
  const symbol = (typeof CURRENCY_SYMBOLS !== 'undefined' && CURRENCY_SYMBOLS[currentCurrency]) || '$';
  const val = Math.round(Number(n || 0) * rate);
  if (val >= 1000000) return symbol + (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (val >= 1000) return symbol + (val / 1000).toFixed(0) + 'k';
  return symbol + val;
}

function setCurrency(curr) {
  if (typeof CURRENCY_SYMBOLS === 'undefined' || !CURRENCY_SYMBOLS[curr]) return;
  currentCurrency = curr;
  try { localStorage.setItem('nova_currency', curr); } catch (e) {}

  const select = document.getElementById('currencySelector');
  if (select) select.value = curr;

  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderPipeline === 'function') renderPipeline();
  if (typeof filterClients === 'function') filterClients();
  if (typeof refreshReport === 'function') refreshReport();
  showToast('Active currency set to ' + curr + ' (' + CURRENCY_SYMBOLS[curr] + ')', '💱', 'info');
}

function initials(name) {
  return (name || '').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function getDetailedTimestamp() {
  const d = new Date();
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) + ' · ' +
         d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function showToast(message, icon = '✦', type = 'info') {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.innerHTML = '<div class="toast-icon-wrap">' + icon + '</div><div class="toast-msg">' + message + '</div><button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close">✕</button>';
  stack.appendChild(el);
  
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

function animateValue(el, start, end, duration = 750, formatter) {
  if (!el) return;
  const range = end - start;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = start + range * eased;
    el.textContent = formatter ? formatter(current) : Math.round(current);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function isEmpty(text) {
  return !text || !text.trim();
}

function saveLocalState() {
  try {
    localStorage.setItem('nova_clients', JSON.stringify(clients));
    localStorage.setItem('nova_leads', JSON.stringify(leads));
    localStorage.setItem('nova_users', JSON.stringify(users));
    localStorage.setItem('nova_logs', JSON.stringify(logs));
    localStorage.setItem('nova_userdata', JSON.stringify(userSpecificData));
    localStorage.setItem('nova_currency', currentCurrency);
    if (typeof automationsList !== 'undefined') localStorage.setItem('nova_automations', JSON.stringify(automationsList));
    if (typeof inboxFeed !== 'undefined') localStorage.setItem('nova_inbox', JSON.stringify(inboxFeed));
  } catch (e) {}
}

function loadLocalState() {
  try {
    const c = localStorage.getItem('nova_clients');
    const l = localStorage.getItem('nova_leads');
    const u = localStorage.getItem('nova_users');
    const lg = localStorage.getItem('nova_logs');
    const ud = localStorage.getItem('nova_userdata');
    const curr = localStorage.getItem('nova_currency');
    const auto = localStorage.getItem('nova_automations');
    const inb = localStorage.getItem('nova_inbox');

    if (c) {
      const storedClients = JSON.parse(c);
      if (Array.isArray(storedClients)) clients = storedClients;
    }
    if (l) {
      const storedLeads = JSON.parse(l);
      if (Array.isArray(storedLeads)) leads = storedLeads;
    }
    if (u) {
      const storedUsers = JSON.parse(u);
      if (Array.isArray(storedUsers)) users = storedUsers;
    }
    if (lg) {
      const storedLogs = JSON.parse(lg);
      if (Array.isArray(storedLogs)) logs = storedLogs;
    }
    if (ud) {
      const storedUserData = JSON.parse(ud);
      if (storedUserData && typeof storedUserData === 'object' && !Array.isArray(storedUserData)) userSpecificData = storedUserData;
    }
    if (curr && typeof CURRENCY_SYMBOLS !== 'undefined' && CURRENCY_SYMBOLS[curr]) {
      currentCurrency = curr;
    }
    if (auto && typeof automationsList !== 'undefined') {
      const storedAuto = JSON.parse(auto);
      if (Array.isArray(storedAuto)) automationsList = storedAuto;
    }
    if (inb && typeof inboxFeed !== 'undefined') {
      const storedInb = JSON.parse(inb);
      if (Array.isArray(storedInb)) inboxFeed = storedInb;
    }
  } catch (e) {}
}

function updateDbStatus(isOnline, label) {
  const chip = document.getElementById('dbStatusChip');
  const txt = document.getElementById('dbStatusText');
  const dot = document.getElementById('dbStatusDot');
  if (txt) txt.textContent = label;
  if (dot) {
    dot.className = isOnline ? 'status-dot green pulse' : 'status-dot amber';
  }
  if (chip) {
    chip.title = isOnline
      ? 'Connected to live H2 Database on port 8080. Data permanently stored in ./data/vertexcrm'
      : 'Local Database active. All data permanently saved in browser storage.';
  }
}

async function connectJavaBackend() {
  try {
    const res = await fetch(API_BASE + '/api/health');
    if (res.ok) {
      window.isJavaBackendActive = true;
      updateDbStatus(true, 'H2 Database Live');

      const [cRes, lRes, uRes, lgRes, tRes] = await Promise.all([
        fetch(API_BASE + '/api/clients').then(r => r.json()).catch(() => null),
        fetch(API_BASE + '/api/leads').then(r => r.json()).catch(() => null),
        fetch(API_BASE + '/api/users').then(r => r.json()).catch(() => null),
        fetch(API_BASE + '/api/logs').then(r => r.json()).catch(() => null),
        fetch(API_BASE + '/api/tasks').then(r => r.json()).catch(() => null)
      ]);

      if (Array.isArray(cRes) && cRes.length > 0) {
        const backendIds = new Set(cRes.map(c => c.id));
        const localOnly = clients.filter(c => !backendIds.has(c.id));
        clients = [...localOnly, ...cRes];
        localOnly.forEach(c => {
          fetch(API_BASE + '/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(c)
          }).catch(() => {});
        });
      }

      if (Array.isArray(lRes) && lRes.length > 0) {
        const backendIds = new Set(lRes.map(l => l.id));
        const localOnly = leads.filter(l => !backendIds.has(l.id));
        leads = [...localOnly, ...lRes];
        localOnly.forEach(l => {
          fetch(API_BASE + '/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(l)
          }).catch(() => {});
        });
      }

      if (Array.isArray(uRes) && uRes.length > 0) users = uRes;
      if (Array.isArray(lgRes) && lgRes.length > 0) logs = lgRes;

      if (Array.isArray(tRes) && tRes.length > 0) {
        tRes.forEach(t => {
          const user = t.assignedTo || activeUserName;
          if (!userSpecificData[user]) userSpecificData[user] = { tasks: [] };
          userSpecificData[user].tasks = userSpecificData[user].tasks || [];
          if (!userSpecificData[user].tasks.includes(t.title)) {
            userSpecificData[user].tasks.push(t.title);
          }
        });
      }

      saveLocalState();
      changeActiveUser(activeUserName);
    } else {
      updateDbStatus(false, 'Local Database');
    }
  } catch (err) {
    updateDbStatus(false, 'Local Database');
  }
}

function seedInitialLogs() {
  if (logs && logs.length > 0) return;
  const seed = [
    { category: 'SYSTEM', actor: 'System', action: 'completed platform startup.', target: 'N/A', icon: '⚡' },
    { category: 'PIPELINE', actor: 'Sarah Sales', action: "moved 'Meridian Healthcare' to Closed Won.", target: 'lead-7', icon: '➡️' },
    { category: 'ACCOUNTS', actor: 'Daksh Patel', action: "registered client 'LJ Education Trust'.", target: 'ACC-1049', icon: '🏢' },
    { category: 'COMMUNICATIONS', actor: 'Daksh Patel', action: "logged scoping call with Royal Challengers.", target: 'Virat K.', icon: '📞' },
    { category: 'IDENTITY', actor: 'Admin User', action: 'granted access to Daksh Patel.', target: 'daksh@novacrm.com', icon: '🔑' },
  ];
  seed.reverse().forEach(entry => {
    logs.unshift({
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: getDetailedTimestamp(),
      ...entry,
    });
  });
}
