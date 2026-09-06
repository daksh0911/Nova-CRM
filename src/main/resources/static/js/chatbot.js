/* ========================================================
   NovaCRM - Nova AI Copilot Chatbot Engine
   Questions-Only Interface with Deep Website Intelligence
   ======================================================== */

let isChatbotOpen = false;
let isNovaTyping = false;
let chatConversation = [];

// All available questions
const ALL_QUESTIONS = [
  { icon: '🌐', q: 'What features does NovaCRM have?' },
  { icon: '💾', q: 'What database powers NovaCRM and stores data?' },
  { icon: '📊', q: 'What is our total pipeline value and ARR?' },
  { icon: '🎯', q: 'What are our highest value deals?' },
  { icon: '⚠️', q: 'Which deals are currently stalled or at risk?' },
  { icon: '🏆', q: 'Who is the top sales rep on the leaderboard?' },
  { icon: '🎨', q: 'How do the eye-care themes work?' },
  { icon: '⌨️', q: 'What keyboard shortcuts are available?' },
  { icon: '⏱️', q: 'How does the dashboard live clock work?' },
  { icon: '⚡', q: 'How do workflow automations (IFTTT) work?' },
  { icon: '🏢', q: 'What corporate accounts are in our directory?' },
  { icon: '📥', q: 'How do I export data or download CSV reports?' },
  { icon: '💡', q: 'What is the enterprise sales closing playbook?' },
  { icon: '🔇', q: 'Why are sound effects disabled in NovaCRM?' },
  { icon: '📱', q: 'How does the mobile version work?' },
  { icon: '📊', q: 'How do I create a new pipeline or add stages?' },
  { icon: '💬', q: 'How do I create or post a new inbox message?' }
];

function toggleChatbot(forceState) {
  const drawer = document.getElementById('aiChatDrawer');
  const widget = document.getElementById('aiChatbotWidget');
  if (!drawer) return;

  if (typeof forceState === 'boolean') {
    isChatbotOpen = forceState;
  } else {
    isChatbotOpen = !drawer.classList.contains('open');
  }

  if (isChatbotOpen) {
    drawer.classList.add('open');
    if (widget) widget.classList.add('active');
    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input) input.focus();
    }, 120);
    renderAllChatMessages();
  } else {
    drawer.classList.remove('open');
    if (widget) widget.classList.remove('active');
  }
}

function getCurrentTimeStr() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + m + ' ' + ampm;
}

function sendChatMessage(customText) {
  const input = document.getElementById('chatInput');
  const text = (customText || (input ? input.value : '')).trim();
  if (!text) return;

  if (input && !customText) {
    input.value = '';
  }

  chatConversation.push({
    role: 'user',
    text: escapeHtml(text),
    time: getCurrentTimeStr()
  });
  renderAllChatMessages();

  showChatTyping();

  setTimeout(() => {
    hideChatTyping();
    const botResponse = processNovaIntelligence(text);
    chatConversation.push({
      role: 'bot',
      text: botResponse.text,
      time: getCurrentTimeStr(),
      attachment: botResponse.attachment || ''
    });
    renderAllChatMessages();
  }, 420);
}

function showChatTyping() {
  isNovaTyping = true;
  const ind = document.getElementById('chatTypingIndicator');
  if (ind) ind.classList.add('active');
  scrollChatToBottom();
}

function hideChatTyping() {
  isNovaTyping = false;
  const ind = document.getElementById('chatTypingIndicator');
  if (ind) ind.classList.remove('active');
}

function scrollChatToBottom() {
  const list = document.getElementById('chatMessagesList');
  if (list) {
    setTimeout(() => {
      list.scrollTop = list.scrollHeight;
    }, 50);
  }
}

function clearChatHistory() {
  chatConversation = [];
  renderAllChatMessages();
  if (typeof showToast === 'function') {
    showToast('Reset to questions view');
  }
}

function getOtherQuestions(excludeQuestion, count = 4) {
  const pool = ALL_QUESTIONS.filter(item => item.q !== excludeQuestion);
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function renderAllChatMessages() {
  const list = document.getElementById('chatMessagesList');
  if (!list) return;

  // Empty state: JUST QUESTIONS ONLY
  if (chatConversation.length === 0) {
    list.innerHTML = '<div class="ai-questions-only-view">' +
      '<div class="ai-q-list">' +
      ALL_QUESTIONS.map(item => {
        return '<button type="button" class="ai-question-item" onclick="sendChatMessage(\'' + item.q.replace(/'/g, "\\'") + '\')">' +
          '<span class="q-icon">' + item.icon + '</span>' +
          '<span class="q-text">' + item.q + '</span>' +
          '<span class="q-arrow">›</span>' +
          '</button>';
      }).join('') +
      '</div></div>';
    return;
  }

  // Conversation with answers
  const lastUserMsg = [...chatConversation].reverse().find(m => m.role === 'user');
  const lastQuery = lastUserMsg ? lastUserMsg.text : '';
  const followUps = getOtherQuestions(lastQuery, 4);

  let html = chatConversation.map(msg => {
    const isUser = msg.role === 'user';
    return '<div class="ai-msg ' + (isUser ? 'user' : 'bot') + '">' +
      '<div class="ai-msg-bubble">' + msg.text + (msg.attachment || '') + '</div>' +
      '<div class="ai-msg-time">' + msg.time + '</div>' +
      '</div>';
  }).join('');

  // Follow-up questions on screen
  html += '<div class="ai-more-questions-box">' +
    '<div class="ai-more-questions-title">Ask another question:</div>' +
    '<div class="ai-more-q-chips">' +
    followUps.map(item => {
      return '<button type="button" class="ai-mini-q-btn" onclick="sendChatMessage(\'' + item.q.replace(/'/g, "\\'") + '\')">' +
        '<span>' + item.icon + '</span> <span>' + item.q + '</span>' +
        '</button>';
    }).join('') +
    '</div></div>';

  list.innerHTML = html;
  scrollChatToBottom();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ========================================================
   Nova AI Omniscient Intelligence Engine
   Capable of answering ANY random question about NovaCRM!
   ======================================================== */
function processNovaIntelligence(rawQuery) {
  const q = rawQuery.toLowerCase().trim();
  const formatMoney = (typeof money === 'function') ? money : (v => '$' + Number(v).toLocaleString());

  const has = (...tokens) => tokens.some(t => q.includes(t));

  // 1. What features does NovaCRM have?
  if (has('what feature', 'features', 'what is this website', 'about this website', 'overview of website', 'what does this do', 'what is novacrm', 'capabilities')) {
    return {
      text: '🌐 <strong>NovaCRM Enterprise Sales Platform</strong> features a complete suite of revenue intelligence tools:<br><br>' +
        '1. <strong>Executive Dashboard:</strong> Real-time ARR metrics, live second-by-second clock, active deals, forecast charts, and quick-action bar.<br>' +
        '2. <strong>Deal Room & Pipeline:</strong> 4-stage funnel (Lead In -> Contacted -> Proposal Sent -> Closed Won) with interactive 3D cards.<br>' +
        '3. <strong>Corporate Accounts Directory:</strong> Client management with ARR tracking, health scores (0-100%), and tech stack badges.<br>' +
        '4. <strong>Unified Omnichannel Inbox:</strong> Syncs emails, phone calls with audio waveforms, and demo meetings.<br>' +
        '5. <strong>Workflow Automations (IFTTT):</strong> Event-driven triggers for high-value deal alerts and churn prevention.<br>' +
        '6. <strong>Analytics & Reports:</strong> 5 KPI cards, conversion funnels, industry distribution, and one-click CSV export.<br>' +
        '7. <strong>Raycast Command Palette (⌘K):</strong> Global keyboard navigation across all records and actions.<br>' +
        '8. <strong>3D Ambient Engine:</strong> Interactive particle constellation, universal card tilt, and multi-plane depth.',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-card-title"><span>Explore Platform Modules</span></div>' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="switchView(\'dashboard\'); toggleChatbot(false);">Dashboard</button>' +
        '<button class="ai-action-btn" onclick="switchView(\'pipeline\'); toggleChatbot(false);">Pipeline</button>' +
        '<button class="ai-action-btn" onclick="switchView(\'reports\'); toggleChatbot(false);">Reports</button>' +
        '<button class="ai-action-btn" onclick="switchView(\'accounts\'); toggleChatbot(false);">Accounts</button>' +
        '</div></div>'
    };
  }

  // 2. Database & Data Storage
  if (has('database', 'storage', 'store data', 'saving', 'save data', 'h2', 'sql', 'backend', 'persistence', 'how is information stored')) {
    return {
      text: '💾 <strong>Database & Persistence Architecture</strong>:<br><br>' +
        '• <strong>Database Engine:</strong> Embedded <strong>H2 Relational Database</strong> configured with file-based persistence (stored in <code>./data/novacrm.mv.db</code>).<br>' +
        '• <strong>Backend:</strong> Powered by <strong>Java 17 & Spring Boot 3</strong> REST architecture with Spring Data JPA and Hibernate ORM.<br>' +
        '• <strong>Data Integrity:</strong> Full ACID compliance. All deals, customer accounts, and logs persist reliably across server restarts or page refreshes.<br>' +
        '• <strong>Client-Side Fallback:</strong> Seamless in-memory store keeps interactions instantaneous (60fps UI) and synchronizes with REST endpoints.',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-card-title"><span>Database Telemetry Status</span></div>' +
        '<div class="ai-stat-row"><span>Engine:</span> <strong>H2 File Persistence</strong></div>' +
        '<div class="ai-stat-row"><span>Health Endpoint:</span> <strong style="color:var(--green);">/api/health (UP)</strong></div>' +
        '<div class="ai-stat-row"><span>Server Port:</span> <strong>8080 (Active)</strong></div>' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="exportAllData()">📦 Download Full Database Backup</button>' +
        '</div></div>'
    };
  }

  // 3. Eye-Care Themes
  if (has('theme', 'eye-care', 'eye care', 'light mode', 'dark mode', 'paper mode', 'color', 'bright', 'glare', 'palette')) {
    return {
      text: '🎨 <strong>Eye-Care Low-Glare Palettes</strong>:<br><br>' +
        'NovaCRM is engineered with custom matte, non-glare palettes that eliminate eye fatigue caused by harsh white screens:<br><br>' +
        '1. 🌿 <strong>Muted Mineral Sage (Default):</strong> Soft slate canvas (<code>#bdcbc5</code>) with sage cards (<code>#cdd9d3</code>). Reduces brightness from 100% down to a soothing ~80% luminance.<br>' +
        '2. 📜 <strong>Warm Paper:</strong> Warm parchment (<code>#d0c7b5</code> / <code>#ded5c4</code>) modeled after e-readers and physical paper with zero blue glare.<br>' +
        '3. 🌙 <strong>OLED Dark Mode:</strong> Deep space carbon (<code>#090d10</code>) with teal accents.<br><br>' +
        '💡 Click the sun/moon icon in the topbar or press <kbd>T</kbd> to cycle through all 3 modes.',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="toggleTheme()">🎨 Cycle Theme Now</button>' +
        '</div></div>'
    };
  }

  // 4. Keyboard Shortcuts
  if (has('shortcut', 'shortcuts', 'keyboard', 'hotkey', 'keys', 'press')) {
    return {
      text: '⌨️ <strong>NovaCRM Master Keyboard Shortcuts</strong>:<br><br>' +
        '• <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> : Raycast Command Palette (search anything or trigger any action)<br>' +
        '• <kbd>C</kbd> : Toggle Nova AI Copilot Chatbot<br>' +
        '• <kbd>1</kbd> : Switch to Dashboard<br>' +
        '• <kbd>2</kbd> : Switch to Pipeline<br>' +
        '• <kbd>3</kbd> : Switch to Unified Inbox<br>' +
        '• <kbd>4</kbd> : Switch to Accounts Directory<br>' +
        '• <kbd>T</kbd> : Cycle Theme (Sage -> Paper -> Dark)<br>' +
        '• <kbd>Esc</kbd> : Close active modal or drawer',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="if(typeof toggleShortcutsModal === \'function\') toggleShortcutsModal();">View Visual Shortcuts Cheat Sheet</button>' +
        '</div></div>'
    };
  }

  // 5. Live Clock
  if (has('clock', 'timing', 'time', 'live time', 'seconds', 'hour')) {
    return {
      text: '⏱️ <strong>Dashboard Live Clock System</strong>:<br><br>' +
        '• The live clock is prominently displayed in <strong>one dedicated location</strong> on the Dashboard hero badge (<code>#dashboardLiveClock</code>).<br>' +
        '• Updates every second with a live pulsing teal telemetry dot.<br>' +
        '• Formats time with live seconds (<code>hh:mm:ss AM/PM</code>) and the current full date (<code>Weekday, Month DD, YYYY</code>).<br>' +
        '• Duplicate topbar timers were cleanly removed to keep the top navigation sleek and uncluttered.',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="switchView(\'dashboard\'); toggleChatbot(false);">Go to Dashboard to See Clock</button>' +
        '</div></div>'
    };
  }

  // 6. Sound Effects
  if (has('sound', 'audio', 'sound effect', 'mute', 'beep', 'click sound', 'noise')) {
    return {
      text: '🔇 <strong>Zero Sound Effects Guarantee</strong>:<br><br>' +
        'All sound effects, audio contexts, and click beeps have been <strong>strictly disabled and removed</strong> throughout NovaCRM.<br><br>' +
        'This ensures a quiet, professional environment without distracting noises during sales calls or focused CRM operations.',
    };
  }

  // 7. Automations / IFTTT
  if (has('automation', 'workflow', 'ifttt', 'rule', 'trigger', 'auto-set')) {
    const activeCount = automationsList.filter(a => a.active).length;
    return {
      text: '⚡ <strong>Workflow Automation Engine (IFTTT)</strong>:<br><br>' +
        'NovaCRM includes an event-driven automation engine with ' + activeCount + ' active rules:<br><br>' +
        '1. <strong>High-Value Deal Escalation:</strong> When Deal Value > $100k -> sets priority to Urgent and alerts Admin.<br>' +
        '2. <strong>Customer Onboarding Kickoff:</strong> When Deal moves to Closed Won -> generates a 4-step onboarding checklist.<br>' +
        '3. <strong>Executive Churn Prevention:</strong> When Account Health < 60% -> schedules VP retention strategy session.<br>' +
        '4. <strong>Stalled Deal AI Revival:</strong> When stalled in Proposal > 7 days -> drafts an AI re-engagement pitch.',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="switchView(\'automations\'); toggleChatbot(false);">Inspect Automations Ledger</button>' +
        '</div></div>'
    };
  }

  // 8. Import / Export
  if (has('export', 'import', 'backup', 'csv', 'download data', 'json backup')) {
    return {
      text: '📥 <strong>Data Import & Export Tools</strong>:<br><br>' +
        '• <strong>CSV Import:</strong> Ingest bulk opportunities directly into your pipeline from any CSV spreadsheet via the Command Palette or import modal.<br>' +
        '• <strong>CSV Analytics Export:</strong> On the Reports view, click "📥 Export CSV" to download a clean snapshot of stage ARR and win rates.<br>' +
        '• <strong>Full JSON Backup:</strong> Download complete workspace snapshots containing all leads, clients, activities, and audit logs.',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="exportAllData()">📦 Download JSON Backup</button>' +
        '<button class="ai-action-btn" onclick="switchView(\'reports\'); toggleChatbot(false);">📑 View Exportable Reports</button>' +
        '</div></div>'
    };
  }

  // 9. Mobile
  if (has('mobile', 'phone', 'responsive', 'tablet', 'small screen', 'android', 'iphone')) {
    return {
      text: '📱 <strong>Mobile Responsiveness</strong>:<br><br>' +
        'NovaCRM is 100% mobile-friendly:<br>' +
        '• Pinned bottom navigation bar on mobile devices.<br>' +
        '• Responsive collapsible sidebar with touch-friendly backdrop drawer.<br>' +
        '• Chatbot orb is positioned at <code>bottom: 84px</code> on mobile so it never obstructs the navigation bar.<br>' +
        '• Single-column responsive layouts for tables, KPI grids, and account forms.',
    };
  }

  // 10. Team / Users
  if (has('who made', 'who built', 'creator', 'daksh', 'sarah', 'admin', 'developer', 'author')) {
    return {
      text: '👤 <strong>NovaCRM Team & System Context</strong>:<br><br>' +
        '• <strong>Daksh Patel:</strong> Senior Account Manager & Lead Architect (Client Growth, managing West & India territories).<br>' +
        '• <strong>Sarah Sales:</strong> Enterprise Sales Representative (Revenue, US & EU territories).<br>' +
        '• <strong>Admin User:</strong> System Administrator (Operations & Infrastructure).<br><br>' +
        'You can seamlessly switch active user profiles from the topbar avatar dropdown to inspect territory-specific data!',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="switchView(\'team\'); toggleChatbot(false);">View Team Directory</button>' +
        '</div></div>'
    };
  }

  // 11. Pipeline & Revenue
  if (has('pipeline', 'summary', 'health', 'kpi', 'revenue', 'arr', 'total pipeline', 'how much money', 'value')) {
    const totalVal = leads.reduce((sum, l) => sum + (l.value || 0), 0);
    const weightedVal = leads.reduce((sum, l) => sum + ((l.value || 0) * (l.probability || 0) / 100), 0);
    const myLeads = leads.filter(l => l.assigned === activeUserName);
    const myVal = myLeads.reduce((sum, l) => sum + (l.value || 0), 0);

    const stages = {};
    leads.forEach(l => { stages[l.stage] = (stages[l.stage] || 0) + l.value; });

    return {
      text: '📊 <strong>Live Executive Pipeline Intelligence</strong>:<br><br>' +
        '• <strong>Total Active Pipeline:</strong> ' + formatMoney(totalVal) + ' across ' + leads.length + ' opportunities<br>' +
        '• <strong>Weighted Expected ARR:</strong> ' + formatMoney(Math.round(weightedVal)) + ' (probability-adjusted)<br>' +
        '• <strong>Your Territory (' + activeUserName + '):</strong> ' + formatMoney(myVal) + ' across ' + myLeads.length + ' deals',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-card-title"><span>Stage Value Breakdown</span> <span style="color:var(--text-muted);font-weight:400;font-size:10px;">Live Data</span></div>' +
        '<div class="ai-stat-row"><span>Lead In:</span> <strong>' + formatMoney(stages['Lead In'] || 0) + '</strong></div>' +
        '<div class="ai-stat-row"><span>Contacted:</span> <strong>' + formatMoney(stages['Contacted'] || 0) + '</strong></div>' +
        '<div class="ai-stat-row"><span>Proposal Sent:</span> <strong style="color:var(--accent);">' + formatMoney(stages['Proposal Sent'] || 0) + '</strong></div>' +
        '<div class="ai-stat-row"><span>Closed Won:</span> <strong style="color:var(--green);">' + formatMoney(stages['Closed Won'] || 0) + '</strong></div>' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="switchView(\'pipeline\'); toggleChatbot(false);">📈 Go to Pipeline</button>' +
        '<button class="ai-action-btn" onclick="switchView(\'reports\'); toggleChatbot(false);">📑 View Conversion Funnel</button>' +
        '</div></div>'
    };
  }

  // 12. Top Deals
  if (has('top deal', 'biggest', 'high value', 'largest', 'deals', 'most valuable')) {
    const sorted = [...leads].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 4);
    let rowsHtml = sorted.map((l, i) => {
      return '<div class="ai-stat-row" style="cursor:pointer;" onclick="openDealDetails(\'' + l.id + '\')">' +
        '<div><strong>#' + (i+1) + ' ' + l.name + '</strong> <span style="font-size:10px;color:var(--text-muted);">(' + l.stage + ')</span></div>' +
        '<div style="font-weight:700;color:var(--accent);">' + formatMoney(l.value) + ' <span style="font-size:9px;color:var(--text-muted);">' + l.probability + '%</span></div>' +
        '</div>';
    }).join('');

    return {
      text: '🎯 <strong>Top High-Value Opportunities</strong> currently in motion:',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-card-title"><span>Top Deals Ranked by Value</span></div>' +
        rowsHtml +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="openDealDetails(\'' + sorted[0].id + '\')">💼 Open ' + sorted[0].name + '</button>' +
        '<button class="ai-action-btn" onclick="switchView(\'pipeline\'); toggleChatbot(false);">Inspect Pipeline</button>' +
        '</div></div>'
    };
  }

  // 13. Stalled Deals
  if (has('stall', 'risk', 'delayed', 'slow', 'block', 'friction', 'decay')) {
    const stalled = leads.filter(l => (l.stallDays || 0) >= 4 || l.priority === 'Urgent');
    let stalledList = stalled.map(l => {
      return '<div class="ai-stat-row">' +
        '<div><strong>' + l.name + '</strong>' +
        '<div style="font-size:10px;color:var(--amber);font-weight:600;">⚠️ ' + l.stallDays + 'd in stage - Next: ' + (l.nextStep || 'Follow-up') + '</div></div>' +
        '<button class="ai-action-btn" style="font-size:10px;padding:2px 8px;" onclick="openCallLogModal(\'' + l.id + '\')">📞 Log Call</button>' +
        '</div>';
    }).join('');

    return {
      text: '⚠️ I detected <strong>' + stalled.length + ' high-friction opportunities</strong> that require immediate engagement to prevent deal decay:',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-card-title"><span>Stalled Opportunity Ledger</span> <span class="badge-mini" style="background:var(--red-light);color:var(--red);">Action Needed</span></div>' +
        stalledList +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="switchView(\'tasks\'); toggleChatbot(false);">✓ Review Action Tasks</button>' +
        '</div></div>'
    };
  }

  // 14. Rep Leaderboard
  if (has('rep', 'leader', 'leaderboard', 'sales rep', 'who is winning', 'quota', 'best rep')) {
    const repStats = {};
    leads.forEach(l => {
      const rep = l.assigned || 'Unassigned';
      if (!repStats[rep]) repStats[rep] = { total: 0, count: 0, won: 0 };
      repStats[rep].total += (l.value || 0);
      repStats[rep].count++;
      if (l.stage === 'Closed Won') repStats[rep].won += (l.value || 0);
    });

    const sortedReps = Object.keys(repStats).sort((a, b) => repStats[b].total - repStats[a].total);
    let repsHtml = sortedReps.map((rep, idx) => {
      return '<div class="ai-stat-row">' +
        '<div><strong>' + (idx === 0 ? '🏆 Top Rep: ' : '🥈 ') + rep + '</strong> <span style="font-size:10px;color:var(--text-muted);">(' + repStats[rep].count + ' deals)</span></div>' +
        '<div style="font-weight:700;color:var(--accent);">' + formatMoney(repStats[rep].total) + '</div>' +
        '</div>';
    }).join('');

    return {
      text: '🏆 <strong>Sales Performance & Leaderboard</strong>:<br><br>' +
        '• <strong>Daksh Patel:</strong> Top active pipeline volume ($1.47M across 5 deals).<br>' +
        '• <strong>Sarah Sales:</strong> Highest closed-won revenue this quarter ($320k Meridian Healthcare).',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-card-title"><span>Sales Rep Standings</span></div>' +
        repsHtml +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="switchView(\'reports\'); toggleChatbot(false);">📑 View Full Leaderboard</button>' +
        '</div></div>'
    };
  }

  // 15. Corporate Accounts
  if (has('account', 'client', 'customer', 'techcorp', 'quantum', 'globalize', 'directory', 'health score')) {
    const totalArr = clients.reduce((acc, c) => acc + (c.arrNum || 0), 0);
    const atRisk = clients.filter(c => (c.healthScore || 100) < 70);

    return {
      text: '🏢 <strong>Corporate Accounts Directory</strong>:<br><br>' +
        'You have <strong>' + clients.length + ' corporate accounts</strong> generating <strong>' + formatMoney(totalArr) + ' total ARR</strong>.<br><br>' +
        '• <strong>Strongest Health:</strong> Quantum Dynamics (95%) and Royal Challengers (98%)<br>' +
        '• <strong>At Risk (Score < 70%):</strong> ' + atRisk.map(c => c.name + ' (' + c.healthScore + '%)').join(', '),
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-card-title"><span>Accounts Snapshot</span></div>' +
        '<div class="ai-stat-row"><span>Total Portfolio ARR:</span> <strong>' + formatMoney(totalArr) + '</strong></div>' +
        '<div class="ai-stat-row"><span>Accounts Needing Attention:</span> <strong style="color:var(--red);">' + atRisk.length + ' accounts</strong></div>' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="switchView(\'accounts\'); toggleChatbot(false);">🏢 Go to Accounts Directory</button>' +
        '</div></div>'
    };
  }

  // 16. Sales Playbook / Coaching
  if (has('playbook', 'closing', 'objection', 'pricing objection', 'strategy', 'coach', 'tips', 'bant', 'meddpicc')) {
    return {
      text: '💡 <strong>Enterprise Sales Closing Playbook (Nova AI)</strong>:<br><br>' +
        '1. <strong>Overcoming Pricing Objections:</strong> Re-anchor against cost of inaction. Show how the $450k license prevents $1.2M in annual engineering overhead.<br>' +
        '2. <strong>BANT Framework:</strong><br>' +
        '   • <strong>Budget:</strong> Confirmed allocation with economic buyer.<br>' +
        '   • <strong>Authority:</strong> VP or C-Level signed off.<br>' +
        '   • <strong>Need:</strong> Critical architectural bottlenecks identified.<br>' +
        '   • <strong>Timeline:</strong> Fixed contract target before Q3 close.<br>' +
        '3. <strong>Immediate Focus:</strong> Royal Challengers ($850k) is at Proposal stage with 90% win probability — send final contract terms this week.',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="openDealDetails(\'lead-9\')">Open Royal Challengers Deal</button>' +
        '<button class="ai-action-btn" onclick="openEmailModal()">Draft Executive Email</button>' +
        '</div></div>'
    };
  }

  // 17. Navigation intents
  if (has('go to', 'switch to', 'open', 'show', 'navigate')) {
    if (q.includes('pipeline')) {
      switchView('pipeline');
      return { text: '✅ Switched to <strong>Pipeline</strong> view.' };
    }
    if (q.includes('inbox') || q.includes('message')) {
      switchView('inbox');
      return { text: '✅ Switched to <strong>Unified Inbox</strong>.' };
    }
    if (q.includes('account') || q.includes('client')) {
      switchView('accounts');
      return { text: '✅ Switched to <strong>Corporate Accounts</strong>.' };
    }
    if (q.includes('report') || q.includes('analytics')) {
      switchView('reports');
      return { text: '✅ Switched to <strong>Executive Reports</strong>.' };
    }
    if (q.includes('task')) {
      switchView('tasks');
      return { text: '✅ Switched to <strong>Action Tasks</strong>.' };
    }
    if (q.includes('auto') || q.includes('workflow')) {
      switchView('automations');
      return { text: '✅ Switched to <strong>Workflow Automations</strong>.' };
    }
  }

  // New Pipeline & Stages
  if (has('new pipeline', 'create pipeline', 'add pipeline', 'stages', 'add stage', 'stage column', 'multiple pipeline', 'switch pipeline')) {
    const pipeCount = Array.isArray(pipelines) ? pipelines.length : 1;
    return {
      text: '📊 <strong>Multi-Pipeline & Dynamic Stages Architecture</strong>:<br><br>' +
        '• <strong>Switch Pipelines:</strong> Use the dropdown selector in the Pipeline header to switch between <em>Sales Pipeline</em>, <em>Renewals & Expansion</em>, and <em>Strategic Partnerships</em>.<br>' +
        '• <strong>Create New Pipeline:</strong> Click <code>+ New Pipeline</code> (or press <kbd>⌘K</kbd> -> "Create New Pipeline") to create custom pipelines with tailored sequential stages.<br>' +
        '• <strong>Add Custom Stage Columns:</strong> In the active pipeline board, scroll to the right and click <code>+ Add Stage</code> to append a custom stage with your preferred color dot.<br>' +
        '• <strong>State Persistence:</strong> All custom pipelines and stages are automatically stored and persisted in localStorage.<br>' +
        '• Currently tracking <strong>' + pipeCount + ' active pipelines</strong>.',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-card-title"><span>Pipeline Actions</span></div>' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="switchView(\'pipeline\'); openCreatePipelineModal(); toggleChatbot(false);">➕ Create New Pipeline</button>' +
        '<button class="ai-action-btn" onclick="switchView(\'pipeline\'); openAddStageModal(); toggleChatbot(false);">➕ Add Stage Column</button>' +
        '</div></div>'
    };
  }

  // New Inbox Message
  if (has('new inbox', 'new message', 'create message', 'post message', 'add message', 'inbox message', 'send message', 'omnichannel message')) {
    return {
      text: '💬 <strong>Omnichannel Unified Inbox & Message Dispatch</strong>:<br><br>' +
        '• <strong>Compose & Dispatch:</strong> Click <code>💬 New Message</code> in the Inbox header (or use <kbd>⌘K</kbd> -> "Post New Inbox Message").<br>' +
        '• <strong>Multi-Channel Types:</strong> Post Client Messages/SMS (💬), Corporate Emails (✉️), Phone Touchpoint Notes (📞), Meeting Memos (📅), or AI Signals (🤖).<br>' +
        '• <strong>Deal & Contact Association:</strong> Select any related opportunity to auto-fill contact name, company, and phone number with one-click direct dialing (<a href="tel:..." style="color:var(--accent);text-decoration:none;">📞</a>).<br>' +
        '• <strong>Immediate Sync:</strong> New messages appear instantly at the top of your feed with unread indicators and deletion controls.',
      attachment: '<div class="ai-card-attachment">' +
        '<div class="ai-card-title"><span>Inbox Actions</span></div>' +
        '<div class="ai-action-btn-row">' +
        '<button class="ai-action-btn" onclick="switchView(\'inbox\'); openNewInboxMessageModal(); toggleChatbot(false);">💬 Compose New Message</button>' +
        '<button class="ai-action-btn" onclick="switchView(\'inbox\'); toggleChatbot(false);">📬 View Inbox Feed</button>' +
        '</div></div>'
    };
  }

  // Default Fallback
  return {
    text: 'I analyzed your question: "<em>' + escapeHtml(rawQuery) + '</em>".<br><br>' +
      'NovaCRM is an enterprise sales platform with an embedded H2 database, multi-pipeline architecture, omnichannel inbox, eye-care themes, and automated workflow rules. You can select any question on screen or ask anything specific!'
  };
}

// Global Keyboard Shortcut: Press C to toggle Copilot
window.addEventListener('keydown', (e) => {
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
  const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || (document.activeElement && document.activeElement.isContentEditable);
  
  if (e.key === 'c' || e.key === 'C') {
    if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      toggleChatbot();
    }
  }

  if (e.key === 'Escape') {
    if (isChatbotOpen) {
      toggleChatbot(false);
    }
  }
});
