// ========================================================
// NovaCRM - Application Coordinator & Dashboard Controller
// Coordinates views, navigation, forecasting telemetry, search & bootstrap
// ========================================================

// --------------------------------------------------------
// 1. NAVIGATION & LAYOUT
// --------------------------------------------------------

function toggleSidebar() {
  const sidebar = document.getElementById('sidebarNav');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('active', sidebar.classList.contains('open'));
}

function switchView(viewName) {
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active-view'));
  const targetView = document.getElementById('view-' + viewName);
  if (targetView) {
    targetView.classList.add('active-view');
    const mainEl = document.getElementById('mainContent');
    if (mainEl) mainEl.scrollTop = 0;
  }

  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(b => b.classList.remove('active'));
  const targetNav = document.getElementById('nav-' + viewName);
  const targetMob = document.getElementById('mob-' + viewName);
  if (targetNav) targetNav.classList.add('active');
  if (targetMob) targetMob.classList.add('active');

  const sidebar = document.getElementById('sidebarNav');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  const handlers = {
    dashboard: renderDashboard,
    pipeline: renderPipeline,
    inbox: () => { if (typeof renderInboxFeed === 'function') renderInboxFeed('all'); },
    automations: () => { if (typeof renderAutomations === 'function') renderAutomations(); },
    accounts: () => filterClients(),
    reports: refreshReport,
    logs: filterLogs,
    tasks: renderUserTasks,
    team: renderTeam,
    admin: renderUsers,
  };
  if (handlers[viewName]) handlers[viewName]();

  if (typeof init3DTiltPhysics === 'function') {
    setTimeout(init3DTiltPhysics, 80);
  }
}

function toggleShortcutsModal() {
  const modal = document.getElementById('shortcutsModal');
  if (modal) modal.classList.toggle('open');
}

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    if (theme === 'dark') {
      themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    } else if (theme === 'paper') {
      themeIcon.innerHTML = '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>';
    } else {
      themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }
  }
  const metaTheme = document.getElementById('metaThemeColor');
  if (metaTheme) {
    const themeColors = { light: '#bdcbc5', paper: '#d0c7b5', dark: '#0f1614' };
    metaTheme.setAttribute('content', themeColors[theme] || '#bdcbc5');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  let newTheme = 'dark';
  if (currentTheme === 'light') newTheme = 'paper';
  else if (currentTheme === 'paper') newTheme = 'dark';
  else newTheme = 'light';

  document.documentElement.setAttribute('data-theme', newTheme);
  try {
    localStorage.setItem('nova_theme', newTheme);
  } catch(e) {}
  
  updateThemeIcon(newTheme);

  const themeLabels = {
    light: 'Muted Sage (Eye-Care)',
    paper: 'Warm Paper (Zero Glare)',
    dark: 'OLED Dark Mode'
  };
  const themeIcons = {
    light: '🌿',
    paper: '📜',
    dark: '🌙'
  };
  showToast('Theme: ' + themeLabels[newTheme], themeIcons[newTheme], 'success');
}

// --------------------------------------------------------
// 2. NOTIFICATIONS & SEARCH & BACKUP
// --------------------------------------------------------

function renderUserNotifications() {
  const listEl = document.getElementById('notifList');
  if (!listEl) return;
  const userData = userSpecificData[activeUserName] || {};
  const notifs = userData.notifications || [
    { type: 'deal', title: 'Pipeline Active', desc: 'All deals synced.', time: 'Just now' }
  ];

  const iconMap = { deal: '💼', client: '🏢', access: '🔑', system: '⚡' };

  listEl.innerHTML = notifs.map(n => {
    return '<div class="notif-item"><div class="notif-item-icon ' + n.type + '">' + (iconMap[n.type] || '💼') + '</div><div class="notif-item-body"><div class="notif-item-title">' + n.title + '</div><div class="notif-item-desc">' + n.desc + '</div><div class="notif-item-time">' + n.time + '</div></div></div>';
  }).join('');
}

function clearAllNotifications(event) {
  if (event) event.stopPropagation();
  const listEl = document.getElementById('notifList');
  if (listEl) {
    listEl.innerHTML = '<div style="padding:24px 16px;text-align:center;color:var(--text-muted);font-size:13px;">✓ All notifications marked as read.</div>';
  }
  const dot = document.querySelector('.icon-dot');
  if (dot) dot.style.display = 'none';
  showToast('Notifications marked read', '✓', 'info');
}

function toggleNotifications(event) {
  if (event) { event.stopPropagation(); event.preventDefault(); }
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  if (!isOpen) {
    renderUserNotifications();
    panel.classList.add('open');
  } else {
    panel.classList.remove('open');
  }
}

function globalSearch(query) {
  const q = query.trim().toLowerCase();
  const results = document.getElementById('globalSearchResults');
  if (!results) return;
  if (!q) { results.style.display = 'none'; results.innerHTML = ''; return; }

  const clientMatches = clients.filter(c => c.name.toLowerCase().includes(q) || (c.industry && c.industry.toLowerCase().includes(q))).slice(0, 4);
  const leadMatches = leads.filter(l => l.name.toLowerCase().includes(q) || (l.tag && l.tag.toLowerCase().includes(q))).slice(0, 4);

  if (clientMatches.length === 0 && leadMatches.length === 0) {
    results.innerHTML = '<div style="padding:14px;color:var(--text-muted);font-size:13px;">No matches found for "' + query + '". Press ⌘K for full commands.</div>';
  } else {
    results.innerHTML =
      clientMatches.map(c => '<div class="search-result-row" onclick="switchView(\'accounts\'); document.getElementById(\'globalSearchResults\').style.display=\'none\';"><span style="color:var(--accent);">🏢</span><span style="font-weight:600;">' + c.name + '</span><span style="font-size:12px;color:var(--text-muted);margin-left:4px;">(' + c.industry + ')</span><span style="margin-left:auto;color:var(--text-muted);font-size:11px;background:var(--bg-hover);padding:2px 6px;border-radius:4px;">Account</span></div>').join('') +
      leadMatches.map(l => '<div class="search-result-row" onclick="openDealDetails(\'' + l.id + '\'); document.getElementById(\'globalSearchResults\').style.display=\'none\';"><span style="color:var(--green);">💼</span><span style="font-weight:600;">' + l.name + '</span><span style="font-size:12px;color:var(--text-muted);margin-left:4px;">(' + money(l.value) + ')</span><span style="margin-left:auto;color:var(--text-muted);font-size:11px;background:var(--bg-hover);padding:2px 6px;border-radius:4px;">Deal</span></div>').join('');
  }
  results.style.display = 'block';
}

document.addEventListener('click', (e) => {
  const search = document.getElementById('globalSearchBox');
  const results = document.getElementById('globalSearchResults');
  if (search && results && !search.contains(e.target)) results.style.display = 'none';

  const notifBtn = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  if (notifPanel && notifPanel.classList.contains('open')) {
    if (notifBtn && !notifBtn.contains(e.target) && !notifPanel.contains(e.target)) {
      notifPanel.classList.remove('open');
    }
  }
});

function exportAllData() {
  const allData = {
    crm: 'NovaCRM',
    exportedAt: new Date().toISOString(),
    currentUser: activeUserName,
    clients,
    leads,
    users,
    logs,
    userSpecificData
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', 'NovaCRM_Complete_Backup_' + Date.now() + '.json');
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('Full CRM backup exported', '📦', 'success');
}

// --------------------------------------------------------
// 3. DASHBOARD & FORECASTING TELEMETRY
// --------------------------------------------------------

let chartObserver = null;

function renderDashboard() {
  const isAdmin = activeUserName === 'Admin User';
  const userClients = isAdmin ? clients : clients.filter(c => c.owner === activeUserName);
  const userLeads = isAdmin ? leads : leads.filter(l => l.assigned === activeUserName);

  const activeClientsCount = userClients.filter(c => c.status === 'Active').length;
  const totalPipeline = userLeads.reduce((a, b) => a + b.value, 0);
  const wonDeals = userLeads.filter(l => l.stage === 'Closed Won');
  const wonRevenue = wonDeals.reduce((a, b) => a + b.value, 0);

  animateValue(document.getElementById('kpiClients'), 0, activeClientsCount, 700, v => Math.round(v));
  animateValue(document.getElementById('kpiPipeline'), 0, totalPipeline, 850, v => money(v));
  animateValue(document.getElementById('kpiWon'), 0, wonRevenue, 850, v => money(v));
  animateValue(document.getElementById('kpiDeals'), 0, userLeads.length, 700, v => Math.round(v));

  const hcActiveClients = document.getElementById('hcActiveClients');
  const hcPipeline = document.getElementById('hcPipeline');
  const hcWonDeals = document.getElementById('hcWonDeals');
  if (hcActiveClients) hcActiveClients.textContent = activeClientsCount;
  if (hcPipeline) hcPipeline.textContent = money(totalPipeline);
  if (hcWonDeals) hcWonDeals.textContent = wonDeals.length;

  selectQuarter(selectedQuarter);
  renderRevenueChart(userLeads);
  renderTopDeals();
  renderRecentActivity();
  renderLeaderboard();
  renderIntelligenceCards(userLeads);
  if (typeof init3DTiltPhysics === 'function') {
    setTimeout(init3DTiltPhysics, 80);
  }
}

function selectQuarter(q) {
  selectedQuarter = q;
  document.querySelectorAll('.quarter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === q);
  });

  const data = QUARTER_TARGETS[q] || QUARTER_TARGETS['Q3'];
  const targetEl = document.getElementById('forecastTargetVal');
  const actualEl = document.getElementById('forecastActualVal');
  const gapEl = document.getElementById('forecastGapVal');
  const barEl = document.getElementById('forecastProgressBar');

  if (targetEl) animateValue(targetEl, 0, data.target, 700, v => money(v));
  if (actualEl) animateValue(actualEl, 0, data.actual, 700, v => money(v));
  if (gapEl) animateValue(gapEl, 0, data.gap, 700, v => money(v));
  if (barEl) barEl.style.width = data.pct + '%';

  // Radial Gauges
  const winRateCircle = document.getElementById('gaugeWinRate');
  const quotaCircle = document.getElementById('gaugeQuota');
  const healthCircle = document.getElementById('gaugeHealth');

  const winRateVal = document.getElementById('gaugeWinRateVal');
  const quotaVal = document.getElementById('gaugeQuotaVal');
  const healthVal = document.getElementById('gaugeHealthVal');

  const circumference = 251.2;
  if (winRateCircle) winRateCircle.style.strokeDashoffset = circumference - (circumference * data.winRate / 100);
  if (quotaCircle) quotaCircle.style.strokeDashoffset = circumference - (circumference * data.quota / 100);
  if (healthCircle) healthCircle.style.strokeDashoffset = circumference - (circumference * data.health / 100);

  if (winRateVal) animateValue(winRateVal, 0, data.winRate, 600, v => Math.round(v) + '%');
  if (quotaVal) animateValue(quotaVal, 0, data.quota, 600, v => Math.round(v) + '%');
  if (healthVal) animateValue(healthVal, 0, data.health, 600, v => Math.round(v) + '%');
}

function renderIntelligenceCards(userLeads = leads) {
  const currentLeads = userLeads.length ? userLeads : leads;
  const totalDeals = currentLeads.length || 1;
  const openDeals = currentLeads.filter(l => l.stage !== 'Closed Won');
  const highConfidence = openDeals.filter(l => l.probability >= 70);
  const forecast30d = highConfidence.reduce((sum, lead) => sum + lead.value, 0);
  const conversion = (currentLeads.filter(l => l.stage === 'Closed Won').length / totalDeals) * 100;
  const velocity = openDeals.length
    ? openDeals.reduce((sum, lead) => sum + lead.probability, 0) / openDeals.length
    : 0;

  const fEl = document.getElementById('intelForecast');
  const cEl = document.getElementById('intelConversion');
  const aEl = document.getElementById('intelAttention');
  const vEl = document.getElementById('intelVelocity');

  if (fEl) animateValue(fEl, 0, forecast30d, 700, v => money(v));
  if (cEl) animateValue(cEl, 0, conversion, 600, v => Math.round(v) + '%');
  if (aEl) aEl.textContent = highConfidence.length + (highConfidence.length === 1 ? ' Deal' : ' Deals');
  if (vEl) animateValue(vEl, 0, velocity, 600, v => Math.round(v) + '%');
}

function renderRevenueChart(userLeads = leads) {
  const container = document.getElementById('revenueChart');
  if (!container) return;

  const currentLeads = userLeads.length ? userLeads : leads;
  const stages = [
    { name: 'Lead In', gradClass: 'bar-grad-purple' },
    { name: 'Contacted', gradClass: 'bar-grad-blue' },
    { name: 'Proposal Sent', gradClass: 'bar-grad-orange' },
    { name: 'Closed Won', gradClass: 'bar-grad-green' }
  ];

  const stageData = stages.map(s => {
    const matched = currentLeads.filter(l => l.stage === s.name);
    const total = matched.reduce((sum, l) => sum + l.value, 0);
    return { ...s, total, count: matched.length };
  });

  const maxVal = Math.max(...stageData.map(s => s.total), 50000);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const formatFn = isMobile && typeof compactMoney === 'function' ? compactMoney : money;

  const yLabels = [1, 0.75, 0.5, 0.25, 0].map(ratio => {
    return '<div class="chart-y-tick"><span>' + formatFn(maxVal * ratio) + '</span></div>';
  }).join('');

  const colsHtml = stageData.map((s, idx) => {
    const heightPercent = Math.max(10, Math.round((s.total / maxVal) * 100));
    const delay = idx * 100;

    return '<div class="chart-column-3d"><div class="chart-bar-track"><div class="chart-rising-bar ' + s.gradClass + '" data-target-height="' + heightPercent + '%" data-target-value="' + s.total + '" data-delay="' + delay + '" style="height: 0%;"><div class="rising-value-badge"><span class="val-text">$0</span></div></div></div><div class="chart-column-footer"><strong class="chart-col-title">' + s.name + '</strong><span class="chart-col-count">' + s.count + (s.count === 1 ? ' deal' : ' deals') + '</span></div></div>';
  }).join('');

  container.innerHTML = '<div class="modern-3d-chart"><div class="chart-main-stage"><div class="chart-y-axis">' + yLabels + '</div><div class="chart-grid-backdrop"><div class="chart-grid-line"></div><div class="chart-grid-line"></div><div class="chart-grid-line"></div><div class="chart-grid-line"></div><div class="chart-grid-line"></div></div><div class="chart-columns-flex">' + colsHtml + '</div></div></div>';

  setupChartScrollTrigger(container);
}

let lastChartRisingTriggerTime = 0;

function triggerChartRising(container = document.getElementById('revenueChart'), force = false) {
  if (!container) return;
  const now = Date.now();
  // Throttle rapid re-triggers so animation doesn't jitter on rapid mouse moves
  if (!force && (now - lastChartRisingTriggerTime < 800)) return;
  lastChartRisingTriggerTime = now;

  const bars = container.querySelectorAll('.chart-rising-bar');
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const formatFn = isMobile && typeof compactMoney === 'function' ? compactMoney : money;

  bars.forEach((bar, idx) => {
    const targetHeight = bar.dataset.targetHeight || '25%';
    const targetVal = parseFloat(bar.dataset.targetValue) || 0;
    const delay = idx * 75;
    const valText = bar.querySelector('.val-text');

    bar.style.transition = 'none';
    bar.style.height = '0%';
    if (valText) valText.textContent = formatFn(0);

    void bar.offsetHeight;

    bar.style.transition = 'height 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(() => {
      bar.style.height = targetHeight;
      if (valText) animateValue(valText, 0, targetVal, 750, v => formatFn(v));
    }, delay);
  });
}

function setupChartScrollTrigger(container) {
  if (chartObserver) chartObserver.disconnect();

  // 1. Trigger when entering viewport (both mobile and PC)
  chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerChartRising(container, true);
      }
    });
  }, { threshold: 0.15 });

  chartObserver.observe(container);

  // 2. Interactive trigger while user is on it (hover on PC, touch/tap on Mobile)
  const chartCard = container.closest('.chart-card') || container;
  if (chartCard && !chartCard._hasHoverTrigger) {
    chartCard._hasHoverTrigger = true;

    // Mouse hover trigger (PC)
    chartCard.addEventListener('mouseenter', () => {
      triggerChartRising(container);
    });

    // Touch / tap trigger (Mobile)
    chartCard.addEventListener('pointerdown', () => {
      triggerChartRising(container);
    }, { passive: true });
  }

  // Initial rise on render
  triggerChartRising(container, true);
}

function replayChartAnimation() {
  triggerChartRising(document.getElementById('revenueChart'), true);
}

function renderTopDeals() {
  const list = document.getElementById('topDealsList');
  if (!list) return;
  const top = [...leads].sort((a, b) => b.value - a.value).slice(0, 5);
  list.innerHTML = top.map(l => {
    const isMine = l.assigned === activeUserName;
    return '<div class="list-item ' + (isMine ? 'item-highlighted' : '') + '" style="cursor:pointer;" onclick="openDealDetails(\'' + l.id + '\')"><div class="list-title"><span class="avatar-chip">' + initials(l.name) + '</span><div><strong style="color:var(--text);">' + l.name + '</strong><div class="list-subtitle">' + l.stage + ' · ' + l.assigned + (isMine ? ' <span class="badge-mini">Yours</span>' : '') + '</div></div></div><div style="text-align:right;"><div class="lead-value">' + money(l.value) + '</div><div class="list-subtitle">' + l.probability + '% prob</div></div></div>';
  }).join('');
}

function renderRecentActivity() {
  const list = document.getElementById('recentActivityList');
  if (!list) return;
  const recent = logs.slice(0, 6);
  list.innerHTML = recent.map(log => {
    const isMyAction = log.actor === activeUserName;
    return '<div class="list-item ' + (isMyAction ? 'item-highlighted' : '') + '"><div class="list-title"><span style="font-size:16px;">' + log.icon + '</span><div><strong>' + log.actor + '</strong>' + (isMyAction ? ' <span class="badge-mini">You</span>' : '') + '<div class="list-subtitle">' + log.action + '</div></div></div><div class="list-subtitle" style="text-align:right;font-size:11px;">' + log.timestamp + '</div></div>';
  }).join('') || '<div class="list-subtitle" style="padding:10px 0;">No recent activity yet.</div>';
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (!list) return;
  const totals = {};
  users.forEach(u => totals[u.name] = 0);
  leads.filter(l => l.stage === 'Closed Won').forEach(l => { totals[l.assigned] = (totals[l.assigned] || 0) + l.value; });
  const ranked = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const medals = ['🥇', '🥈', '🥉'];
  list.innerHTML = ranked.map(([name, val], i) => {
    const isCurrent = name === activeUserName;
    return '<div class="list-item ' + (isCurrent ? 'item-highlighted' : '') + '"><div class="list-title"><span class="avatar-chip" style="width:28px;height:28px;font-size:11px;">' + initials(name) + '</span><strong style="color:var(--text);">' + (medals[i] || '•') + ' ' + name + '</strong>' + (isCurrent ? ' <span class="badge-mini">You</span>' : '') + '</div><div class="lead-value">' + money(val) + '</div></div>';
  }).join('');
}

// --------------------------------------------------------
// 4. BOOTSTRAP & STARTUP
// --------------------------------------------------------

window.addEventListener('load', () => {
  try {
    localStorage.removeItem('vertex_theme');
    const savedTheme = localStorage.getItem('nova_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  } catch(e) {}

  if (typeof loadLocalState === 'function') loadLocalState();
  if (typeof seedInitialLogs === 'function') seedInitialLogs();
  if (typeof renderUsers === 'function') renderUsers();
  if (typeof changeActiveUser === 'function') changeActiveUser('Daksh Patel');
  if (typeof renderClients === 'function') renderClients(clients);
  if (typeof renderPipeline === 'function') renderPipeline();
  renderDashboard();
  if (typeof filterLogs === 'function') filterLogs();

  const clock = document.getElementById('clockWidget');
  const dashClock = document.getElementById('dashboardLiveClock');
  const dashDate = document.getElementById('dashboardLiveDate');

  const updateClock = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (clock) clock.textContent = timeStr;
    if (dashClock) dashClock.textContent = timeStr;
    if (dashDate) dashDate.textContent = dateStr;
  };

  updateClock();
  setInterval(updateClock, 1000);

  if (typeof connectJavaBackend === 'function') connectJavaBackend();
  if (typeof init3DTiltPhysics === 'function') {
    setTimeout(init3DTiltPhysics, 100);
  }

  // Currency initial control
  const currSel = document.getElementById('currencySelector');
  if (currSel && typeof currentCurrency !== 'undefined') {
    currSel.value = currentCurrency;
  }
});

// Global Shortcuts Key listener (Press ? for Cheatsheet)
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
  if (e.key === '?' || (e.shiftKey && e.key === '/')) {
    e.preventDefault();
    toggleShortcutsModal();
    return;
  }
  if (e.key === 't' || e.key === 'T') {
    if (typeof toggleTheme === 'function') toggleTheme();
    return;
  }
  const viewMap = {
    '1': 'dashboard',
    '2': 'pipeline',
    '3': 'inbox',
    '4': 'accounts',
    '5': 'tasks',
    '6': 'automations',
    '7': 'reports',
    '8': 'logs'
  };
  if (viewMap[e.key]) {
    switchView(viewMap[e.key]);
  }
});

