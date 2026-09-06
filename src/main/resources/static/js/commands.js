// ========================================================
// NovaCRM - Command Center & Spotlight (⌘K / Ctrl+K)
// Modular Raycast-style command palette and global keyboard navigation
// ========================================================

let selectedCmdIndex = 0;
let currentCmdItems = [];

function openCommandPalette() {
  const modal = document.getElementById('commandPaletteModal');
  const input = document.getElementById('cmdInput');
  if (!modal) return;
  modal.classList.add('open');
  if (input) {
    input.value = '';
    input.focus();
    filterCommandPalette('');
  }
}

function closeCommandPalette() {
  const modal = document.getElementById('commandPaletteModal');
  if (modal) modal.classList.remove('open');
}

function getCommandRegistry() {
  return [
    { type: 'action', title: 'Open Nova AI Copilot', desc: 'Ask CRM intelligence, get deal insights, and automate tasks', icon: '🤖', action: () => { closeCommandPalette(); if (typeof toggleChatbot === 'function') toggleChatbot(true); } },
    { type: 'action', title: 'Create New Deal', desc: 'Add a new opportunity into the sales pipeline', icon: '⚡', action: () => { closeCommandPalette(); openCreateDealModal(); } },
    { type: 'action', title: 'Proposal Quote Studio', desc: 'Generate and sign interactive quote', icon: '📄', action: () => { closeCommandPalette(); if (leads[0]) openQuoteModal(leads[0].id); else openCreateDealModal(); } },
    { type: 'action', title: 'Import Data via CSV', desc: 'Bulk ingest opportunities from CSV or spreadsheet', icon: '📥', action: () => { closeCommandPalette(); openCsvImportModal(); } },
    { type: 'action', title: 'Log Client Call', desc: 'Record a phone call interaction with waveform', icon: '📞', action: () => { closeCommandPalette(); openCallLogModal(); } },
    { type: 'action', title: 'Compose Client Email', desc: 'Send tailored pitch, proposal or follow-up', icon: '✉️', action: () => { closeCommandPalette(); openEmailModal(); } },
    { type: 'action', title: 'Schedule Meeting', desc: 'Book a demo session or architecture call', icon: '📅', action: () => { closeCommandPalette(); openMeetingModal(); } },
    { type: 'action', title: 'Register New Account', desc: 'Add a new corporate client to directory', icon: '🏢', action: () => { closeCommandPalette(); switchView('accounts'); } },
    { type: 'action', title: 'Export Full CRM Backup', desc: 'Download JSON snapshot of workspace', icon: '📦', action: () => { closeCommandPalette(); exportAllData(); } },
    { type: 'action', title: 'Toggle Light / Dark Theme', desc: 'Switch visual palette mode', icon: '🎨', action: () => { closeCommandPalette(); toggleTheme(); } },

    { type: 'nav', title: 'Go to Dashboard', desc: 'Overview, KPIs, and forecasting', icon: '📊', action: () => { closeCommandPalette(); switchView('dashboard'); } },
    { type: 'nav', title: 'Go to Pipeline', desc: 'Deal stages and velocity overview', icon: '📈', action: () => { closeCommandPalette(); switchView('pipeline'); } },
    { type: 'nav', title: 'Go to Unified Inbox', desc: 'Omnichannel communications and activity stream', icon: '📬', action: () => { closeCommandPalette(); switchView('inbox'); } },
    { type: 'nav', title: 'Go to Workflow Automations', desc: 'IFTTT trigger rules and execution ledger', icon: '⚡', action: () => { closeCommandPalette(); switchView('automations'); } },
    { type: 'nav', title: 'Go to Client Accounts', desc: 'Corporate accounts & 2x2 health matrix', icon: '🏢', action: () => { closeCommandPalette(); switchView('accounts'); } },
    { type: 'nav', title: 'Go to Action Tasks', desc: 'Personal task list and scratchpad', icon: '✓', action: () => { closeCommandPalette(); switchView('tasks'); } },
    { type: 'nav', title: 'Go to Analytics Reports', desc: 'Stage conversion and industry distribution', icon: '📑', action: () => { closeCommandPalette(); switchView('reports'); } },
    { type: 'nav', title: 'Go to Audit Ledger', desc: 'System telemetry and event logs', icon: '🛡️', action: () => { closeCommandPalette(); switchView('logs'); } },

    { type: 'identity', title: 'Switch to Daksh Patel', desc: 'Senior Account Manager (West & India)', icon: '👤', action: () => { closeCommandPalette(); changeActiveUser('Daksh Patel'); } },
    { type: 'identity', title: 'Switch to Sarah Sales', desc: 'Enterprise Sales Rep (US & EU)', icon: '👤', action: () => { closeCommandPalette(); changeActiveUser('Sarah Sales'); } },
    { type: 'identity', title: 'Switch to Admin User', desc: 'Lead System Administrator', icon: '🛡️', action: () => { closeCommandPalette(); changeActiveUser('Admin User'); } },
  ];
}

function filterCommandPalette(query) {
  const listEl = document.getElementById('cmdResultsList');
  if (!listEl) return;
  const q = query.trim().toLowerCase();
  selectedCmdIndex = 0;

  const baseCommands = getCommandRegistry();
  let matched = [];

  if (!q) {
    matched = baseCommands;
  } else {
    matched = baseCommands.filter(c => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));

    leads.filter(l => l.name.toLowerCase().includes(q) || (l.tag && l.tag.toLowerCase().includes(q)) || (l.phone && l.phone.includes(q)) || (l.contact && l.contact.toLowerCase().includes(q))).slice(0, 3).forEach(l => {
      matched.push({
        type: 'deal',
        title: l.name + ' (' + money(l.value) + ')',
        desc: 'Deal · ' + l.stage + (l.phone ? ' · 📞 ' + l.phone : '') + ' · Assigned to ' + l.assigned,
        icon: '💼',
        action: () => { closeCommandPalette(); openDealDetails(l.id); }
      });
    });

    clients.filter(c => c.name.toLowerCase().includes(q) || (c.industry && c.industry.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q)) || (c.email && c.email.toLowerCase().includes(q))).slice(0, 3).forEach(c => {
      matched.push({
        type: 'client',
        title: c.name + ' (' + c.industry + ')',
        desc: 'Account · ' + c.arr + (c.phone ? ' · 📞 ' + c.phone : '') + ' · Owner: ' + c.owner,
        icon: '🏢',
        action: () => { closeCommandPalette(); openClientDetails(c.id); }
      });
    });
  }

  currentCmdItems = matched;

  if (matched.length === 0) {
    listEl.innerHTML = '<div style="padding:28px 16px;text-align:center;color:var(--text-muted);font-size:13px;">No commands or records matching "' + query + '".</div>';
    return;
  }

  listEl.innerHTML = matched.map((item, idx) => {
    return '<div class="cmd-item ' + (idx === 0 ? 'selected' : '') + '" data-cmd-idx="' + idx + '" onclick="executeCommand(' + idx + ')"><div class="cmd-item-icon">' + item.icon + '</div><div><strong>' + item.title + '</strong><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + item.desc + '</div></div><span class="cmd-item-tag">' + item.type + '</span></div>';
  }).join('');
}

function executeCommand(index) {
  if (currentCmdItems[index] && typeof currentCmdItems[index].action === 'function') {
    currentCmdItems[index].action();
  }
}

function updateSelectedCmd(newIndex) {
  const items = document.querySelectorAll('.cmd-item');
  if (!items.length) return;
  if (newIndex < 0) newIndex = items.length - 1;
  if (newIndex >= items.length) newIndex = 0;
  selectedCmdIndex = newIndex;

  items.forEach((el, idx) => {
    el.classList.toggle('selected', idx === selectedCmdIndex);
    if (idx === selectedCmdIndex) el.scrollIntoView({ block: 'nearest' });
  });
}

// Global Keyboard Listeners (⌘K / Ctrl+K for Command Center, Arrows, Enter, Escape)
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCommandPalette();
    return;
  }

  const cmdModal = document.getElementById('commandPaletteModal');
  if (cmdModal && cmdModal.classList.contains('open')) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      updateSelectedCmd(selectedCmdIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      updateSelectedCmd(selectedCmdIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(selectedCmdIndex);
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    }
    return;
  }

  if (e.key === 'Escape') {
    if (typeof closeDealDetails === 'function') closeDealDetails();
    if (typeof closeCallLogModal === 'function') closeCallLogModal();
    if (typeof closeEmailModal === 'function') closeEmailModal();
    if (typeof closeMeetingModal === 'function') closeMeetingModal();
    const notifPanel = document.getElementById('notifPanel');
    if (notifPanel) notifPanel.classList.remove('open');
    const searchResults = document.getElementById('globalSearchResults');
    if (searchResults) searchResults.style.display = 'none';
  }
});

