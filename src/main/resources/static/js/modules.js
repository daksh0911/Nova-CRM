// ========================================================
// NovaCRM - Operational Modules
// Communications Hub, Accounts Directory, Audit Logs, Team Identity, Tasks & Reports
// ========================================================

// --------------------------------------------------------
// 1. COMMUNICATIONS HUB (Calls, Emails, Meetings)
// --------------------------------------------------------

function populateDealDropdown(selectId, defaultLeadId = '') {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = leads.map(l => {
    return '<option value="' + l.id + '" ' + (l.id === defaultLeadId ? 'selected' : '') + '>' + l.name + ' (' + l.contact + ')</option>';
  }).join('');
}

// Call Logger
function openCallLogModal(leadId = '') {
  const modal = document.getElementById('callLogModal');
  if (!modal) return;
  populateDealDropdown('callTargetLead', leadId || (leads[0] ? leads[0].id : ''));
  modal.classList.add('open');
  if (typeof renderCallWaveform === 'function') {
    setTimeout(() => renderCallWaveform('callWaveformCanvas'), 50);
  }
}

function closeCallLogModal() {
  const modal = document.getElementById('callLogModal');
  if (modal) modal.classList.remove('open');
  if (typeof stopCallWaveform === 'function') {
    stopCallWaveform();
  }
}

function submitCallLog() {
  const targetId = document.getElementById('callTargetLead')?.value;
  const lead = leads.find(l => l.id === targetId) || { name: 'Client Account', contact: 'Lead' };
  const duration = document.getElementById('callDuration')?.value || '15 mins';
  const outcome = document.getElementById('callOutcome')?.value || 'Connected & Interested';
  const notes = (document.getElementById('callNotes')?.value || '').trim();

  addAuditLog({
    category: 'COMMUNICATIONS',
    action: 'logged call with ' + lead.name + ' (' + duration + ' · ' + outcome + ').',
    target: lead.contact,
    icon: '📞'
  });

  if (typeof inboxFeed !== 'undefined') {
    inboxFeed.unshift({
      id: 'msg-' + Date.now(),
      type: 'call',
      sender: activeUserName,
      company: lead.name,
      subject: 'Call Log: ' + outcome + ' (' + duration + ')',
      preview: notes || 'Call logged with ' + lead.contact,
      time: 'Just now',
      unread: false,
      leadId: lead.id
    });
  }

  saveLocalState();
  closeCallLogModal();
  if (typeof renderRecentActivity === 'function') renderRecentActivity();
  showToast('Call logged for ' + lead.name + ' (' + outcome + ')', '📞', 'success');
}

// Email Composer
function openEmailModal(leadId = '') {
  const modal = document.getElementById('emailComposerModal');
  if (!modal) return;
  populateDealDropdown('emailTargetDeal', leadId || (leads[0] ? leads[0].id : ''));
  syncEmailRecipient(leadId || (leads[0] ? leads[0].id : ''));
  applyEmailTemplate('demo-followup');
  modal.classList.add('open');
}

function closeEmailModal() {
  const modal = document.getElementById('emailComposerModal');
  if (modal) modal.classList.remove('open');
}

function syncEmailRecipient(leadId) {
  const lead = leads.find(l => l.id === leadId);
  const input = document.getElementById('emailRecipientInput');
  if (lead && input) {
    input.value = lead.email;
  }
}

function applyEmailTemplate(type) {
  document.querySelectorAll('.template-chip').forEach(b => b.classList.remove('active'));
  const btn = window.event?.target;
  if (btn && btn.classList) btn.classList.add('active');

  const tmpl = EMAIL_TEMPLATES[type] || EMAIL_TEMPLATES['demo-followup'];
  const subj = document.getElementById('emailSubject');
  const body = document.getElementById('emailBody');
  if (subj) subj.value = tmpl.subject;
  if (body) body.value = tmpl.body;
}

function submitSendEmail() {
  const recipient = document.getElementById('emailRecipientInput')?.value;
  const subject = document.getElementById('emailSubject')?.value;
  const body = document.getElementById('emailBody')?.value;

  addAuditLog({
    category: 'COMMUNICATIONS',
    action: 'sent email to ' + recipient + ' ("' + subject + '").',
    target: recipient,
    icon: '✉️'
  });

  if (typeof inboxFeed !== 'undefined') {
    inboxFeed.unshift({
      id: 'msg-' + Date.now(),
      type: 'email',
      sender: activeUserName,
      company: recipient,
      subject: subject || 'Outbound Client Email',
      preview: (body || '').slice(0, 80) + '...',
      time: 'Just now',
      unread: false
    });
  }

  saveLocalState();
  closeEmailModal();
  if (typeof renderRecentActivity === 'function') renderRecentActivity();
  showToast('Email sent to ' + recipient, '✉️', 'success');
}

// Meeting Scheduler
function openMeetingModal(leadId = '') {
  const modal = document.getElementById('meetingModal');
  if (!modal) return;
  populateDealDropdown('meetingTargetDeal', leadId || (leads[0] ? leads[0].id : ''));
  modal.classList.add('open');
}

function closeMeetingModal() {
  const modal = document.getElementById('meetingModal');
  if (modal) modal.classList.remove('open');
}

function submitMeetingSchedule() {
  const title = (document.getElementById('meetingTitle')?.value || '').trim();
  const date = document.getElementById('meetingDate')?.value;
  const targetId = document.getElementById('meetingTargetDeal')?.value;
  const lead = leads.find(l => l.id === targetId) || { name: 'Client' };

  if (!userSpecificData[activeUserName]) userSpecificData[activeUserName] = { tasks: [] };
  userSpecificData[activeUserName].tasks = userSpecificData[activeUserName].tasks || [];
  userSpecificData[activeUserName].tasks.unshift('📅 Meeting: ' + title + ' (' + lead.name + ' · ' + date + ')');

  addAuditLog({
    category: 'COMMUNICATIONS',
    action: 'scheduled meeting: ' + title + ' with ' + lead.name + '.',
    target: date,
    icon: '📅'
  });

  if (typeof inboxFeed !== 'undefined') {
    inboxFeed.unshift({
      id: 'msg-' + Date.now(),
      type: 'meeting',
      sender: activeUserName,
      company: lead.name,
      subject: 'Scheduled: ' + title,
      preview: 'Meeting set for ' + date + ' with ' + lead.contact,
      time: 'Just now',
      unread: false,
      leadId: lead.id
    });
  }

  saveLocalState();
  closeMeetingModal();
  renderUserTasks();
  if (typeof renderRecentActivity === 'function') renderRecentActivity();
  showToast('Meeting confirmed & synced to task ledger', '📅', 'success');
}

// --------------------------------------------------------
// 2. CLIENTS DIRECTORY & HEALTH SCORE
// --------------------------------------------------------

function statusBadgeClass(status) {
  if (status === 'Active') return 'badge-active';
  if (status === 'Onboarding') return 'badge-pending';
  if (status === 'Churned') return 'badge-danger';
  return 'badge-inactive';
}

function renderClients(list = clients) {
  const body = document.getElementById('clientTableBody');
  if (!body) return;

  if (list.length === 0) {
    body.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted);">No accounts match your search filters.</td></tr>';
    return;
  }

  body.innerHTML = list.map(c => {
    const isMine = c.owner === activeUserName;
    const score = c.healthScore || (c.status === 'Active' ? 92 : c.status === 'Onboarding' ? 75 : 30);
    const scoreClass = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
    const techPills = (c.techStack || []).slice(0, 2).map(t => '<span class="tag-tech">' + t + '</span>').join('');

    return '<tr class="' + (isMine ? 'tr-highlighted' : '') + '"><td><div style="display:flex;align-items:center;gap:10px;"><div class="avatar-chip" style="width:34px;height:34px;font-size:12px;border-radius:var(--radius-sm);">' + initials(c.name) + '</div><div><strong style="color:var(--text);">' + c.name + '</strong>' + (isMine ? '<span class="badge-mini">Yours</span>' : '') + '<div class="list-subtitle">' + c.id + ' · ' + c.industry + ' · <span style="color:var(--green);font-weight:600;">' + (c.arrNum ? money(c.arrNum) : (c.arr || '$100k')) + '</span></div><div style="display:flex;gap:4px;margin-top:4px;">' + techPills + '</div></div></div></td><td><span class="health-score-pill ' + scoreClass + '">● ' + score + '%</span></td><td><span style="font-weight:500;">' + c.email + '</span><div class="list-subtitle">' + c.phone + '</div></td><td>' + c.location + '</td><td><div style="display:flex;align-items:center;gap:6px;"><span class="avatar-chip" style="width:22px;height:22px;font-size:9px;">' + initials(c.owner) + '</span><span>' + c.owner + '</span></div></td><td style="font-size:12px;color:var(--text-muted);">' + c.lastContact + '</td><td><span class="badge ' + statusBadgeClass(c.status) + '">' + c.status + '</span></td><td><div style="display:flex;gap:6px;"><button class="lead-details-btn" onclick="openClientDetails(\'' + c.id + '\')">360° ›</button><button class="btn btn-outline btn-sm" onclick="openCreateDealModal(); document.getElementById(\'modalDealName\').value=\'' + c.name.replace(/'/g, "\\'") + '\'; document.getElementById(\'modalDealContact\').value=\'' + c.email + '\';" title="Create deal for account">+</button></div></td></tr>';
  }).join('');

  renderHealthMatrix();
}

function openClientDetails(clientId) {
  const client = clients.find(c => c.id === clientId);
  if (!client) return;

  const modalOverlay = document.getElementById('dealModalOverlay') || createDealModalElement();
  const modalBox = modalOverlay.querySelector('.deal-modal-content');
  const score = client.healthScore || (client.status === 'Active' ? 92 : 65);
  const techHtml = (client.techStack || ['AWS', 'Cloud', 'REST API']).map(t => '<span class="tag-tech">' + t + '</span>').join('');
  
  modalBox.innerHTML = '<div class="deal-modal-header"><div><span class="tag">' + client.industry + '</span><h2 style="margin:8px 0 2px;font-size:20px;color:var(--text);">' + client.name + '</h2><div style="font-size:12px;color:var(--text-muted);">Account ID: ' + client.id + ' · Status: ' + client.status + '</div></div><button class="toast-close" onclick="closeDealDetails()" style="font-size:20px;">✕</button></div><div class="deal-modal-body"><div class="deal-modal-grid"><div class="deal-metric-card tilt-card-3d"><span>Annual ARR</span><strong style="color:var(--green);font-size:18px;">' + (client.arrNum ? money(client.arrNum) : client.arr) + '</strong></div><div class="deal-metric-card tilt-card-3d"><span>Health Index</span><strong style="color:var(--accent);font-size:18px;">' + score + '% Healthy</strong></div><div class="deal-metric-card tilt-card-3d"><span>Headquarters</span><strong style="font-size:14px;">' + client.location + '</strong></div><div class="deal-metric-card tilt-card-3d"><span>Last Contact</span><strong style="color:var(--violet);font-size:14px;">' + client.lastContact + '</strong></div></div><div style="margin:16px 0;padding:14px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Firmographics & Intelligence</span><span style="font-size:11px;color:var(--accent);font-weight:600;">' + (client.funding || 'Growth') + ' · ' + (client.employees || '100+') + ' Employees</span></div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">' + techHtml + '</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;"><div><span style="color:var(--text-muted);">Active Seats:</span> <strong>' + (client.seats || 50) + ' seats</strong></div><div><span style="color:var(--text-muted);">API Telemetry:</span> <strong>' + (client.apiUsage || '500k/mo') + '</strong></div></div></div><div style="margin:16px 0;padding:14px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);"><div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">Contact Point</div><div style="font-weight:600;color:var(--text);">' + client.email + '</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px;">' + client.phone + '</div></div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;"><button class="btn btn-sm" style="background:var(--red);color:#ffffff;border:none;padding:7px 14px;border-radius:var(--radius-sm);" onclick="deleteClient(\'' + client.id + '\')">Delete Account</button><div style="display:flex;gap:10px;"><button class="btn btn-outline btn-sm" onclick="closeDealDetails()">Close</button><button class="btn-primary btn-sm" onclick="closeDealDetails(); openCallLogModal();">📞 Log Call</button></div></div></div>';

  modalOverlay.classList.add('open');
  if (typeof init3DTiltPhysics === 'function') {
    setTimeout(init3DTiltPhysics, 60);
  }
}

async function deleteClient(clientId) {
  const client = clients.find(c => c.id === clientId);
  if (!client) return;
  if (!confirm('Delete account \'' + client.name + '\' permanently?')) return;
  clients = clients.filter(c => c.id !== clientId);
  saveLocalState();
  addAuditLog({ category: 'ACCOUNTS', action: 'deleted account \'' + client.name + '\'.', target: clientId, icon: '🗑️' });
  fetch(API_BASE + '/api/clients/' + clientId, { method: 'DELETE' }).catch(() => {});
  closeDealDetails();
  filterClients();
  if (typeof renderDashboard === 'function') renderDashboard();
  showToast('Deleted account: ' + client.name, '🗑️', 'warning');
}

function filterClients() {
  const query = (document.getElementById('clientSearch') ? document.getElementById('clientSearch').value : '').toLowerCase();
  const status = document.getElementById('clientStatusFilter') ? document.getElementById('clientStatusFilter').value : 'All';
  
  const filtered = clients.filter(c => {
    const combined = (c.name + ' ' + c.email + ' ' + c.industry + ' ' + c.owner + ' ' + c.location).toLowerCase();
    const matchesQuery = combined.includes(query);
    const matchesStatus = (status === 'All' || c.status === status);
    const matchesOwner = clientFilterMode === 'my' ? c.owner === activeUserName : true;
    return matchesQuery && matchesStatus && matchesOwner;
  });
  renderClients(filtered);
}

async function addClient() {
  const name = document.getElementById('clientName').value.trim();
  const industry = document.getElementById('clientIndustry').value.trim();
  const email = document.getElementById('clientEmail').value.trim();
  const location = document.getElementById('clientLocation').value.trim();

  if (isEmpty(name) || isEmpty(email)) {
    showToast('Company name and email are required.', '⚠️', 'error');
    return;
  }

  const payload = {
    name,
    industry: isEmpty(industry) ? 'General' : industry,
    email,
    location: isEmpty(location) ? 'Remote' : location,
    owner: activeUserName,
    healthScore: 90
  };

  try {
    const res = await fetch(API_BASE + '/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const savedClient = await res.json();
      clients.unshift(savedClient);
    } else {
      clients.unshift({ id: 'ACC-' + Math.floor(1000 + Math.random() * 9000), ...payload, phone: '+1 (555) 234-5678', lastContact: 'Just Now', status: 'Active', arr: '$100k ARR' });
    }
  } catch (err) {
    clients.unshift({ id: 'ACC-' + Math.floor(1000 + Math.random() * 9000), ...payload, phone: '+1 (555) 234-5678', lastContact: 'Just Now', status: 'Active', arr: '$100k ARR' });
  }

  addAuditLog({ category: 'ACCOUNTS', action: 'registered corporate account \'' + name + '\'.', target: name, icon: '🏢' });

  ['clientName', 'clientIndustry', 'clientEmail', 'clientLocation'].forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = '';
  });
  saveLocalState();
  filterClients();
  if (typeof renderDashboard === 'function') renderDashboard();
  showToast('Account registered: ' + name, '🏢', 'success');
}

// --------------------------------------------------------
// 3. AUDIT LOGS
// --------------------------------------------------------

function addAuditLog(entry) {
  const newLog = {
    id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
    category: entry.category || 'SYSTEM',
    actor: entry.actor || activeUserName,
    action: entry.action || 'Performed operation',
    target: entry.target || 'N/A',
    icon: entry.icon || '📌',
    timestamp: getDetailedTimestamp(),
  };
  logs.unshift(newLog);
  filterLogs();
}

function renderDetailedLogs(listToRender) {
  const listContainer = document.getElementById('globalLogger');
  if (!listContainer) return;
  listContainer.innerHTML = '';

  const totalEl = document.getElementById('logStatTotal');
  const secEl = document.getElementById('logStatSecurity');
  const pipeEl = document.getElementById('logStatPipeline');
  if (totalEl) totalEl.textContent = logs.length;
  if (secEl) secEl.textContent = logs.filter(l => l.category === 'SECURITY').length;
  if (pipeEl) pipeEl.textContent = logs.filter(l => l.category === 'PIPELINE').length;

  if (listToRender.length === 0) {
    listContainer.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);">🔍 No telemetry events match your search criteria.</div>';
    return;
  }

  const catClassMap = { SECURITY: 'cat-security', PIPELINE: 'cat-pipeline', ACCOUNTS: 'cat-accounts', IDENTITY: 'cat-identity', COMMUNICATIONS: 'cat-identity', SYSTEM: 'cat-system' };

  listToRender.forEach(log => {
    const catClass = catClassMap[log.category] || 'cat-system';
    listContainer.innerHTML += '<li class="log-card"><div class="log-icon-container">' + log.icon + '</div><div class="log-content"><div class="log-header-row"><div style="display:flex;align-items:center;gap:8px;"><span class="log-category-tag ' + catClass + '">' + log.category + '</span><strong style="font-size:13px;color:var(--text);">' + log.actor + '</strong></div><span style="font-size:11px;color:var(--text-muted);">' + log.timestamp + '</span></div><div style="font-size:13px;color:var(--text);margin-top:4px;">' + log.action + '</div><div class="log-details-grid"><span class="log-chip">ID: ' + log.id + '</span><span class="log-chip">REF: ' + log.target + '</span></div></div></li>';
  });
}

function filterLogs() {
  const query = (document.getElementById('logSearchInput') ? document.getElementById('logSearchInput').value : '').toLowerCase();
  const category = document.getElementById('logCategoryFilter') ? document.getElementById('logCategoryFilter').value : 'All';

  const filtered = logs.filter(l => {
    const combined = (l.id + ' ' + l.actor + ' ' + l.action + ' ' + l.target + ' ' + l.category).toLowerCase();
    return combined.includes(query) && (category === 'All' || l.category === category);
  });
  renderDetailedLogs(filtered);
}

function clearAuditFilters() {
  const s = document.getElementById('logSearchInput');
  const c = document.getElementById('logCategoryFilter');
  if (s) s.value = '';
  if (c) c.value = 'All';
  filterLogs();
}

function exportAuditLogs() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', 'NovaCRM_Audit_Ledger_' + Date.now() + '.json');
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('Audit ledger exported.', '📤');
}

// --------------------------------------------------------
// 4. USERS & IDENTITY
// --------------------------------------------------------

function renderUsers() {
  const body = document.getElementById('userTableBody');
  if (!body) return;
  body.innerHTML = users.map(u => {
    return '<tr><td><div style="display:flex;align-items:center;gap:10px;"><div class="avatar-chip" style="width:32px;height:32px;font-size:11px;">' + initials(u.name) + '</div><div><strong style="color:var(--text);">' + u.name + '</strong><div class="list-subtitle">' + (u.dept || 'Workspace') + '</div></div></div></td><td>' + u.email + '</td><td><span class="badge badge-active">' + u.role + '</span></td><td><button class="btn-outline btn-sm" onclick="deleteUser(\'' + u.name + '\')">Revoke</button></td></tr>';
  }).join('');

  const switcher = document.getElementById('userSwitcherSelect');
  if (switcher) {
    switcher.innerHTML = users.map(u => '<option value="' + u.name + '" ' + (u.name === activeUserName ? 'selected' : '') + '>' + u.name + '</option>').join('');
  }
}

async function addUser() {
  const name = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const role = document.getElementById('userRole').value.trim();
  if (isEmpty(name) || isEmpty(email)) {
    showToast('Name and email are required.', '⚠️', 'error');
    return;
  }
  const userRole = isEmpty(role) ? 'Team Member' : role;
  const payload = { name, email, role: userRole, dept: 'Operations' };

  try {
    const res = await fetch(API_BASE + '/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const savedUser = await res.json();
      users.push(savedUser);
    } else {
      users.push(payload);
    }
  } catch (err) {
    users.push(payload);
  }

  userSpecificData[name] = {
    title: 'Welcome back, ' + name + ' 👋',
    roleTag: userRole + ' · Active',
    subtitle: 'Workspace session active for ' + name + '.',
    note: '',
    tasks: ['Complete initial workspace setup', 'Review assigned accounts'],
    notifications: [
      { type: 'access', title: 'Account Initialized', desc: 'Access granted as ' + userRole + '.', time: 'Just now' }
    ]
  };
  addAuditLog({ category: 'IDENTITY', action: 'granted workspace access to ' + name + '.', target: email, icon: '🔑' });
  ['userName', 'userEmail', 'userRole'].forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = '';
  });
  saveLocalState();
  renderUsers();
  renderTeam();
  showToast('Access granted: ' + name, '🔑', 'success');
}

async function deleteUser(name) {
  if (!confirm('Revoke access for ' + name + '?')) return;
  users = users.filter(u => u.name !== name);
  addAuditLog({ category: 'SECURITY', action: 'revoked access for ' + name + '.', target: name, icon: '🚫' });
  saveLocalState();
  renderUsers();
  renderTeam();
  showToast('Access revoked: ' + name, '🚫', 'warning');
}

function changeActiveUser(name) {
  activeUserName = name;
  const userObj = users.find(u => u.name === name) || { role: 'Team Member' };
  const userData = userSpecificData[name] || {
    title: 'Welcome back, ' + name + ' 👋',
    roleTag: userObj.role + ' · Active',
    subtitle: 'Workspace active for ' + name + '.',
    note: '',
    tasks: ['Review open opportunities'],
    notifications: []
  };

  const avatarEl = document.getElementById('sidebarUserAvatar');
  const nameEl = document.getElementById('activeUserName');
  const roleEl = document.getElementById('activeUserRole');
  if (avatarEl) avatarEl.textContent = initials(name);
  if (nameEl) nameEl.textContent = name;
  if (roleEl) roleEl.textContent = userObj.role;

  const welcomeHeading = document.getElementById('welcomeHeading');
  const heroBadge = document.getElementById('heroBadge');
  if (welcomeHeading) welcomeHeading.textContent = userData.title || ('Welcome back, ' + name + ' 👋');
  if (heroBadge) heroBadge.textContent = '● ' + (userData.roleTag || userObj.role);

  renderUserTasks();
  const noteEl = document.getElementById('quickNote');
  if (noteEl) noteEl.value = userData.note || '';

  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderPipeline === 'function') renderPipeline();
  filterClients();
  refreshReport();
  renderTeam();

  showToast('Active Identity: ' + name, '👤', 'info');
}

function renderTeam() {
  const grid = document.getElementById('teamPeopleGrid');
  if (!grid) return;
  grid.innerHTML = users.map(u => {
    return '<div class="people-card tilt-card-3d"><div class="avatar-chip" style="width:56px;height:56px;font-size:18px;margin:0 auto 12px;border-radius:50%;">' + initials(u.name) + '</div><div class="people-name">' + u.name + '</div><div class="people-role">' + u.role + '</div><span class="people-card-dept">' + (u.dept || 'Operations') + '</span></div>';
  }).join('');
  if (typeof init3DTiltPhysics === 'function') {
    setTimeout(init3DTiltPhysics, 60);
  }
}

// --------------------------------------------------------
// 5. TASKS & NOTES
// --------------------------------------------------------

function renderUserTasks() {
  const list = document.getElementById('taskList');
  if (!list) return;
  list.innerHTML = '';
  const data = userSpecificData[activeUserName] || {};
  const tasks = data.tasks || ['Review assigned open tickets'];

  if (tasks.length === 0) {
    list.innerHTML = '<div style="padding:20px 0;color:var(--text-muted);font-size:13px;">No pending tasks for ' + activeUserName + '.</div>';
    return;
  }

  tasks.forEach((t, i) => {
    list.innerHTML += '<div class="task-item" id="task-item-' + i + '"><div class="task-main"><input class="task-check" type="checkbox" id="task-chk-' + i + '" onchange="completeTask(this, ' + i + ')"><div><strong>' + t + '</strong><div class="list-subtitle">Priority High</div></div></div><div style="display:flex;align-items:center;gap:8px;"><span class="badge badge-pending">Pending</span><button class="btn-ghost" onclick="deleteTask(' + i + ')" title="Delete Task" style="padding:2px 6px;font-size:14px;color:var(--text-muted);">✕</button></div></div>';
  });
}

function completeTask(cb, index) {
  const item = cb.closest('.task-item');
  const badge = item ? item.querySelector('.badge') : null;
  const strong = item ? item.querySelector('strong') : null;
  if (cb.checked) {
    if (item) item.style.opacity = '0.5';
    if (strong) strong.style.textDecoration = 'line-through';
    if (badge) {
      badge.className = 'badge badge-active';
      badge.textContent = 'Done';
    }
    showToast('Task marked complete!', '✓', 'success');
  } else {
    if (item) item.style.opacity = '1';
    if (strong) strong.style.textDecoration = 'none';
    if (badge) {
      badge.className = 'badge badge-pending';
      badge.textContent = 'Pending';
    }
  }
}

function deleteTask(index) {
  if (!userSpecificData[activeUserName] || !userSpecificData[activeUserName].tasks) return;
  userSpecificData[activeUserName].tasks.splice(index, 1);
  saveLocalState();
  renderUserTasks();
  showToast('Task removed', '🗑️', 'info');
}

async function addNewTask() {
  const input = document.getElementById('newTaskInput');
  const title = input ? input.value.trim() : '';
  if (isEmpty(title)) {
    showToast('Please type a task title.', '⚠️', 'warning');
    if (input) input.focus();
    return;
  }

  if (!userSpecificData[activeUserName]) userSpecificData[activeUserName] = { tasks: [] };
  userSpecificData[activeUserName].tasks = userSpecificData[activeUserName].tasks || [];
  userSpecificData[activeUserName].tasks.unshift(title);

  try {
    fetch(API_BASE + '/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        assignedTo: activeUserName,
        priority: 'High'
      })
    }).catch(() => {});
  } catch (err) {}

  if (input) input.value = '';
  saveLocalState();
  renderUserTasks();
  showToast('Action item saved', '✓', 'success');
}

function saveNote() {
  const noteEl = document.getElementById('quickNote');
  const n = noteEl ? noteEl.value.trim() : '';
  if (!userSpecificData[activeUserName]) userSpecificData[activeUserName] = {};
  userSpecificData[activeUserName].note = n;
  saveLocalState();
  showToast('Note saved', '💾', 'success');
}

// --------------------------------------------------------
// 6. ANALYTICS REPORTS & REVENUE INTELLIGENCE
// --------------------------------------------------------

function refreshReport() {
  const scopeEl = document.getElementById('reportScopeFilter');
  const selectedScope = scopeEl ? scopeEl.value : 'All';

  let targetClients = clients;
  let targetLeads = leads;

  if (selectedScope !== 'All') {
    targetClients = clients.filter(c => c.owner === selectedScope);
    targetLeads = leads.filter(l => l.assigned === selectedScope);
  }

  const activeClientsCount = targetClients.filter(c => c.status === 'Active').length;
  const wonDeals = targetLeads.filter(l => l.stage === 'Closed Won');
  const wonRevenue = wonDeals.reduce((a, b) => a + (b.value || 0), 0);
  const totalPipeline = targetLeads.reduce((a, b) => a + (b.value || 0), 0);
  const winRate = targetLeads.length > 0 ? Math.round((wonDeals.length / targetLeads.length) * 100) : 0;

  animateValue(document.getElementById('reportActiveClients'), 0, activeClientsCount, 700, v => Math.round(v));
  animateValue(document.getElementById('reportTotalLeads'), 0, targetLeads.length, 700, v => Math.round(v));
  animateValue(document.getElementById('reportPipeline'), 0, totalPipeline, 850, v => money(v));
  animateValue(document.getElementById('reportWonRevenue'), 0, wonRevenue, 850, v => money(v));
  animateValue(document.getElementById('reportWinRate'), 0, winRate, 700, v => Math.round(v) + '%');

  // Backwards compatibility helper spans
  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setTxt('reportWonDeals', wonDeals.length);
  setTxt('hcActiveClients', activeClientsCount);
  setTxt('hcPipeline', totalPipeline);
  setTxt('hcWonDeals', wonDeals.length);

  // 1. Pipeline Conversion Funnel
  const stages = [
    { name: 'Lead In', color: 'lead-in', icon: '🎯' },
    { name: 'Contacted', color: 'contacted', icon: '💬' },
    { name: 'Proposal Sent', color: 'proposal', icon: '📝' },
    { name: 'Closed Won', color: 'closed', icon: '🏆' }
  ];

  const funnelContainer = document.getElementById('reportStageFunnelContainer');
  if (funnelContainer) {
    funnelContainer.innerHTML = stages.map(st => {
      const stageLeads = targetLeads.filter(l => l.stage === st.name);
      const stageVal = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
      const pct = totalPipeline > 0 ? Math.round((stageVal / totalPipeline) * 100) : 0;

      // Also set hidden compat elements
      if (st.name === 'Lead In') setTxt('reportLeadIn', stageLeads.length);
      if (st.name === 'Contacted') setTxt('reportContacted', stageLeads.length);
      if (st.name === 'Proposal Sent') setTxt('reportProposal', stageLeads.length);
      if (st.name === 'Closed Won') setTxt('reportClosed', stageLeads.length);

      return `
        <div class="report-stage-card tilt-card-3d">
          <div class="report-stage-header">
            <div class="report-stage-title">
              <span>${st.icon}</span>
              <span>${st.name}</span>
              <span class="report-stage-count">${stageLeads.length} deals</span>
            </div>
            <div class="report-stage-metrics">
              <span class="report-stage-val">${money(stageVal)}</span>
              <span style="font-weight:700;color:var(--text-muted);font-size:11px;">(${pct}%)</span>
            </div>
          </div>
          <div class="report-bar-track">
            <div class="report-bar-fill ${st.color}" style="width:${Math.max(4, pct)}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Industry Breakdown
  const industryTotals = {};
  const industryValues = {};
  targetClients.forEach(c => {
    industryTotals[c.industry] = (industryTotals[c.industry] || 0) + 1;
    industryValues[c.industry] = (industryValues[c.industry] || 0) + (c.arrNum || 0);
  });

  const industryList = document.getElementById('industryBreakdown');
  if (industryList) {
    const entries = Object.entries(industryTotals);
    if (entries.length === 0) {
      industryList.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px;">No account industry records in this scope.</div>';
    } else {
      const maxCount = Math.max(...Object.values(industryTotals), 1);
      industryList.innerHTML = entries.map(([name, count]) => {
        const targetPct = Math.round((count / targetClients.length) * 100);
        const totalArr = industryValues[name] || 0;
        return `
          <div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;">
              <span style="font-weight:700;color:var(--text);">${name}</span>
              <div style="display:flex;gap:8px;">
                <span style="font-weight:600;color:var(--accent);">${money(totalArr)}</span>
                <span style="color:var(--text-muted);">${count} accts (${targetPct}%)</span>
              </div>
            </div>
            <div style="height:7px;background:var(--border);border-radius:4px;overflow:hidden;">
              <div style="width:${targetPct}%;height:100%;background:var(--accent);border-radius:4px;transition:width 0.8s ease;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 3. Team Leaderboard Table
  const teamTableBody = document.getElementById('reportTeamTableBody');
  if (teamTableBody) {
    const reps = ['Daksh Patel', 'Sarah Sales', 'Admin User'];
    teamTableBody.innerHTML = reps.map(repName => {
      const repLeads = leads.filter(l => l.assigned === repName);
      const repClients = clients.filter(c => c.owner === repName);
      const repWon = repLeads.filter(l => l.stage === 'Closed Won');
      const repWonRevenue = repWon.reduce((s, l) => s + (l.value || 0), 0);
      const repPipeline = repLeads.reduce((s, l) => s + (l.value || 0), 0);
      const repWinRate = repLeads.length > 0 ? Math.round((repWon.length / repLeads.length) * 100) : 0;
      const isCurrent = repName === activeUserName;

      return `
        <tr class="${isCurrent ? 'tr-highlighted' : ''}">
          <td style="font-weight:600;display:flex;align-items:center;gap:10px;">
            <span class="avatar-chip" style="width:28px;height:28px;font-size:11px;">${initials(repName)}</span>
            <span>${repName} ${isCurrent ? '<span class="badge-mini">You</span>' : ''}</span>
          </td>
          <td><strong>${repClients.length}</strong> accounts</td>
          <td><strong>${repLeads.length}</strong> deals</td>
          <td style="font-weight:700;color:var(--text);">${money(repPipeline)}</td>
          <td style="font-weight:700;color:var(--green);">${money(repWonRevenue)}</td>
          <td>
            <span class="badge ${repWinRate >= 20 ? 'badge-active' : 'badge-pending'}">${repWinRate}%</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (typeof init3DTiltPhysics === 'function') {
    setTimeout(init3DTiltPhysics, 60);
  }
}

function exportReportData() {
  const scopeEl = document.getElementById('reportScopeFilter');
  const selectedScope = scopeEl ? scopeEl.value : 'All';
  const targetLeads = selectedScope === 'All' ? leads : leads.filter(l => l.assigned === selectedScope);

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Deal ID,Deal Name,Industry,Value (USD),Stage,Assigned Rep,Contact,Priority\n';

  targetLeads.forEach(l => {
    csvContent += `"${l.id}","${l.name}","${l.tag || ''}",${l.value},"${l.stage}","${l.assigned}","${l.contact}","${l.priority || 'Medium'}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `NovaCRM_Report_${selectedScope.replace(/\\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Executive Report CSV exported successfully', '📊', 'success');
}

// --------------------------------------------------------
// 7. CUSTOMER SUCCESS 2X2 HEALTH MATRIX
// --------------------------------------------------------

function renderHealthMatrix() {
  const container = document.getElementById('healthMatrixContainer');
  if (!container) return;

  const points = clients.map(c => {
    const score = c.healthScore || 80;
    const arrVal = c.arrNum || 100000;
    const leftPct = Math.max(6, Math.min(94, score));
    const topPct = Math.max(10, Math.min(90, 100 - (arrVal / 850000 * 80)));

    let quadrantColor = 'var(--accent)';
    if (arrVal >= 100000 && score >= 70) quadrantColor = 'var(--green)';
    else if (arrVal >= 100000 && score < 70) quadrantColor = 'var(--red)';
    else if (arrVal < 100000 && score >= 70) quadrantColor = 'var(--blue)';
    else quadrantColor = 'var(--amber)';

    return `<div class="matrix-dot" style="left:${leftPct}%;top:${topPct}%;background:${quadrantColor};" title="${c.name} (${money(arrVal)} ARR · ${score}% Health)" onclick="openClientDetails('${c.id}')"><span class="matrix-dot-tooltip">${c.name} (${score}%)</span></div>`;
  }).join('');

  container.innerHTML = `
    <div class="matrix-grid-stage">
      <div class="matrix-quadrant q-tl"><span class="quad-label">⚠️ Critical Churn Risk</span></div>
      <div class="matrix-quadrant q-tr"><span class="quad-label">🏆 Expansion Champions</span></div>
      <div class="matrix-quadrant q-bl"><span class="quad-label">📉 Low Engagement</span></div>
      <div class="matrix-quadrant q-br"><span class="quad-label">🚀 Growth Potential</span></div>
      ${points}
    </div>
  `;
}

// --------------------------------------------------------
// 8. OMNICHANNEL UNIFIED INBOX
// --------------------------------------------------------

function renderInboxFeed(filterType = 'all') {
  const container = document.getElementById('inboxFeedContainer');
  if (!container) return;

  document.querySelectorAll('.inbox-filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.type === filterType);
  });

  let list = inboxFeed || [];
  if (filterType !== 'all') {
    list = list.filter(m => m.type === filterType);
  }

  if (list.length === 0) {
    container.innerHTML = '<div style="padding:36px;text-align:center;color:var(--text-muted);font-size:13px;">Inbox zero! No messages match this filter.</div>';
    return;
  }

  const iconMap = { email: '✉️', call: '📞', meeting: '📅', system: '🤖' };

  container.innerHTML = list.map(item => {
    return `
      <div class="inbox-card tilt-card-3d ${item.unread ? 'unread' : ''}" onclick="toggleInboxRead('${item.id}')">
        <div class="inbox-icon-wrap ${item.type}">${iconMap[item.type] || '💬'}</div>
        <div class="inbox-content">
          <div class="inbox-header-row">
            <div>
              <strong style="color:var(--text);font-size:14px;">${item.sender}</strong>
              <span class="list-subtitle" style="margin-left:6px;">· ${item.company}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:11px;color:var(--text-muted);">${item.time}</span>
              ${item.unread ? '<span class="unread-dot"></span>' : ''}
            </div>
          </div>
          <div class="inbox-subject">${item.subject}</div>
          <div class="inbox-preview">${item.preview}</div>
        </div>
        <div class="inbox-actions" onclick="event.stopPropagation();">
          ${item.leadId ? `<button class="btn btn-outline btn-sm" onclick="openDealDetails('${item.leadId}')">Deal ›</button>` : ''}
          <button class="btn-ghost" onclick="toggleInboxRead('${item.id}')" title="Toggle read">${item.unread ? '✓ Mark Read' : 'Unread'}</button>
        </div>
      </div>
    `;
  }).join('');
  if (typeof init3DTiltPhysics === 'function') {
    setTimeout(init3DTiltPhysics, 60);
  }
}

function toggleInboxRead(id) {
  const msg = inboxFeed.find(m => m.id === id);
  if (!msg) return;
  msg.unread = !msg.unread;
  saveLocalState();
  renderInboxFeed();
}

// --------------------------------------------------------
// 9. CSV DATA IMPORTER
// --------------------------------------------------------

function openCsvImportModal() {
  const modal = document.getElementById('csvImportModal');
  if (modal) modal.classList.add('open');
  parseCsvInput();
}

function closeCsvImportModal() {
  const modal = document.getElementById('csvImportModal');
  if (modal) modal.classList.remove('open');
}

let parsedImportLeads = [];

function parseCsvInput() {
  const raw = (document.getElementById('csvTextInput')?.value || '').trim();
  const preview = document.getElementById('csvPreviewContainer');
  if (!preview) return;

  if (!raw) {
    preview.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;">Paste or type comma-separated data above to preview.</div>';
    parsedImportLeads = [];
    return;
  }

  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const rows = [];

  lines.forEach((line, idx) => {
    if (idx === 0 && line.toLowerCase().includes('name') && line.toLowerCase().includes('value')) return;
    const parts = line.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      const name = parts[0] || 'Imported Deal';
      const rawVal = (parts[1] || '50000').replace(/[^0-9.]/g, '');
      const value = parseFloat(rawVal) || 50000;
      const stage = parts[2] || 'Lead In';
      const contact = parts[3] || 'Executive Lead';
      const email = parts[4] || 'lead@company.com';
      const tag = parts[5] || 'Enterprise Tech';

      rows.push({
        id: 'lead-imp-' + Math.floor(1000 + Math.random() * 9000),
        name,
        value,
        stage: ['Lead In', 'Contacted', 'Proposal Sent', 'Closed Won'].includes(stage) ? stage : 'Lead In',
        contact,
        email,
        phone: '+1 (555) 019-2831',
        tag,
        assigned: activeUserName,
        probability: 30,
        date: 'Q3 2026',
        priority: 'Medium',
        stageAge: 'Imported',
        stallDays: 0,
        liveViewers: [initials(activeUserName)]
      });
    }
  });

  parsedImportLeads = rows;

  if (rows.length === 0) {
    preview.innerHTML = '<div style="padding:16px;text-align:center;color:var(--red);font-size:12px;">Could not parse rows. Format: Company, Value, Stage, Contact, Email</div>';
    return;
  }

  preview.innerHTML = `
    <div style="font-size:12px;color:var(--green);font-weight:600;margin-bottom:8px;">✓ ${rows.length} opportunities ready for ingestion</div>
    <div style="max-height:160px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm);">
      <table class="deal-products-table" style="font-size:12px;margin:0;">
        <thead><tr><th>Company</th><th>Value</th><th>Stage</th><th>Contact</th></tr></thead>
        <tbody>
          ${rows.map(r => `<tr><td><strong>${r.name}</strong></td><td>${money(r.value)}</td><td>${r.stage}</td><td>${r.contact}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function submitCsvImport() {
  if (parsedImportLeads.length === 0) {
    showToast('No valid deals to import. Please check CSV data.', '⚠️', 'warning');
    return;
  }

  parsedImportLeads.forEach(lead => leads.unshift(lead));
  const count = parsedImportLeads.length;

  if (typeof addAuditLog === 'function') {
    addAuditLog({ category: 'PIPELINE', action: 'bulk imported ' + count + ' deals from CSV.', target: 'CSV Import', icon: '📥' });
  }

  saveLocalState();
  if (typeof renderPipeline === 'function') renderPipeline();
  if (typeof renderDashboard === 'function') renderDashboard();
  closeCsvImportModal();
  showToast('Successfully imported ' + count + ' opportunities!', '📥', 'success');
  parsedImportLeads = [];
}

