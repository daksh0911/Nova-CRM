// ========================================================
// NovaCRM - Dynamic Sales Pipeline & Deal Room
// Multi-pipeline architecture, dynamic stages, drag & drop,
// deal stage progression, and custom stage builder
// ========================================================

function getActivePipeline() {
  if (!Array.isArray(pipelines) || pipelines.length === 0) {
    pipelines = [
      {
        id: 'pipe-sales',
        name: 'Sales Pipeline',
        description: 'Track and manage core enterprise deals across every stage.',
        stages: [
          { name: 'Lead In', color: 'purple' },
          { name: 'Contacted', color: 'blue' },
          { name: 'Proposal Sent', color: 'orange' },
          { name: 'Closed Won', color: 'green' }
        ]
      }
    ];
  }
  let p = pipelines.find(x => x.id === activePipelineId);
  if (!p) {
    activePipelineId = pipelines[0].id;
    p = pipelines[0];
  }
  return p;
}

function getActiveStages() {
  const p = getActivePipeline();
  if (p && Array.isArray(p.stages) && p.stages.length > 0) {
    return p.stages;
  }
  return [
    { name: 'Lead In', color: 'purple' },
    { name: 'Contacted', color: 'blue' },
    { name: 'Proposal Sent', color: 'orange' },
    { name: 'Closed Won', color: 'green' }
  ];
}

function getStageDomId(stageName) {
  return 'stage-col-' + String(stageName || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
}

function normalizePipelineStage(stage) {
  const stages = getActiveStages();
  const value = String(stage || '').trim().toLowerCase();
  const found = stages.find(s => s.name.toLowerCase() === value);
  return found ? found.name : stages[0].name;
}

function findLeadById(leadId) {
  return Array.isArray(leads) ? leads.find(lead => String(lead.id) === String(leadId)) : null;
}

function updatePipelineHeaderInfo() {
  const selector = document.getElementById('pipelineSelector');
  if (selector && Array.isArray(pipelines)) {
    selector.innerHTML = pipelines.map(p => `<option value="${p.id}" ${p.id === activePipelineId ? 'selected' : ''}>${p.name}</option>`).join('');
  }
  const descEl = document.getElementById('pipelineDescriptionText');
  const p = getActivePipeline();
  if (descEl && p) {
    descEl.textContent = p.description || 'Multi-stage revenue pipeline, deal velocity, and advancement tracking.';
  }
}

function switchPipeline(pipeId) {
  if (!pipeId || pipeId === activePipelineId) return;
  activePipelineId = pipeId;
  saveLocalState();
  renderPipeline();
  const p = getActivePipeline();
  showToast('Switched to ' + (p ? p.name : 'Pipeline'), '📊', 'info');
}

function togglePipelineFilter(mode) {
  pipelineFilterMode = mode;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('pipeline-filter-' + mode);
  if (btn) btn.classList.add('active');
  renderPipeline();
}

function sortPipeline(mode) {
  pipelineSortMode = mode;
  renderPipeline();
}

function renderPipeline() {
  if (!Array.isArray(leads)) leads = [];

  updatePipelineHeaderInfo();
  const activeStages = getActiveStages();

  // Filter deals by active pipeline
  let pipeLeads = leads.filter(l => (l.pipelineId || 'pipe-sales') === activePipelineId);

  // Normalize stages of deals in current pipeline
  pipeLeads.forEach(lead => {
    if (lead) {
      lead.id = String(lead.id || '');
      const matched = activeStages.find(s => s.name.toLowerCase() === String(lead.stage || '').toLowerCase());
      lead.stage = matched ? matched.name : activeStages[0].name;
    }
  });

  let visibleLeads = pipelineFilterMode === 'my' 
    ? pipeLeads.filter(l => l.assigned === activeUserName)
    : [...pipeLeads];

  if (pipelineSortMode === 'value-desc') {
    visibleLeads.sort((a, b) => b.value - a.value);
  } else if (pipelineSortMode === 'value-asc') {
    visibleLeads.sort((a, b) => a.value - b.value);
  } else if (pipelineSortMode === 'prob-desc') {
    visibleLeads.sort((a, b) => b.probability - a.probability);
  } else if (pipelineSortMode === 'name-asc') {
    visibleLeads.sort((a, b) => a.name.localeCompare(b.name));
  }

  const container = document.getElementById('pipelineBoardContainer');
  if (!container) return;

  container.innerHTML = '';

  activeStages.forEach(stageObj => {
    const stageName = stageObj.name;
    const stageColor = stageObj.color || 'purple';
    const stageId = getStageDomId(stageName);

    const stageLeads = visibleLeads.filter(l => l.stage.toLowerCase() === stageName.toLowerCase());
    const count = stageLeads.length;
    const total = stageLeads.reduce((a, b) => a + (Number(b.value) || 0), 0);

    const col = document.createElement('div');
    col.className = 'stage';
    col.id = stageId;
    col.dataset.stageName = stageName;
    col.ondragover = allowDrop;
    col.ondrop = drop;

    col.innerHTML = `
      <div class="stage-header">
        <div class="stage-title">
          <span class="stage-dot ${stageColor}"></span>
          <span class="stage-name-text">${escapeHtml(stageName)}</span>
          <span class="stage-count">${count}</span>
        </div>
        <button class="stage-add-btn" onclick="openCreateDealModal('${escapeHtml(stageName)}')" title="Add deal to ${escapeHtml(stageName)}">+</button>
      </div>
      <div class="stage-total">
        <div class="stage-metric-pill">
          <strong>${money(total)}</strong>
          <span>${count} deals</span>
        </div>
      </div>
    `;

    stageLeads.forEach(lead => {
      const isMine = lead.assigned === activeUserName;
      const priorityColor = lead.priority === 'Urgent' ? 'var(--red)' : lead.priority === 'High' ? 'var(--amber)' : 'var(--accent)';
      const isWon = lead.stage.toLowerCase().includes('won');
      const value = Number(lead.value) || 0;
      const probability = Math.max(0, Math.min(100, Number(lead.probability) || 0));

      const stall = parseInt(lead.stallDays) || 0;
      const stallBadge = isWon ? '<span class="lead-age">🏆 Won</span>' : (stall >= 7 ? '<span class="stagnant-badge">⚠️ Stalled ' + stall + 'd</span>' : (stall >= 3 ? '<span class="stall-warn-badge">' + stall + 'd in stage</span>' : '<span class="lead-age">' + (lead.stageAge || 'Active') + '</span>'));
      const viewers = (lead.liveViewers || [initials(lead.assigned)]).map(v => '<span class="live-viewer-chip" title="Active viewer">' + v + '</span>').join('');
      const livePresence = '<div class="live-presence-wrap">' + viewers + '<span class="live-dot-pulse"></span></div>';

      const el = document.createElement('div');
      el.className = 'lead tilt-card-3d ' + (isMine ? 'lead-assigned-mine' : '') + ' ' + (isWon ? 'lead-won-glow' : '');
      el.draggable = true;
      el.id = lead.id;
      el.ondragstart = drag;
      el.ondragend = () => {
        el.classList.remove('dragging');
        document.querySelectorAll('.stage.drag-over').forEach(s => s.classList.remove('drag-over'));
      };

      el.innerHTML = '<div class="lead-top-row"><span class="lead-tag ' + (lead.priority === 'Urgent' ? 'pulse-urgent' : '') + '" style="border-left:2px solid ' + priorityColor + ';">' + (lead.tag || 'Opportunity') + '</span>' + stallBadge + '</div>' +
        '<div class="lead-title" onclick="openDealDetails(\'' + lead.id + '\')"><strong>' + (escapeHtml(lead.name) || 'Untitled deal') + '</strong></div>' +
        '<div class="lead-meta"><div class="lead-contact-line"><span class="contact-avatar-mini">' + initials(lead.contact) + '</span><span class="contact-name-text">' + (escapeHtml(lead.contact) || 'Unassigned contact') + '</span>' + (lead.phone ? ' · <a href="tel:' + lead.phone + '" style="color:var(--accent);font-size:11px;text-decoration:none;font-weight:600;" onclick="event.stopPropagation();" title="Direct Call">📞 ' + lead.phone + '</a>' : '') + '</div>' + livePresence + '</div>' +
        '<div class="lead-next-step"><span class="next-step-badge">Next:</span><span class="next-step-text">' + (escapeHtml(lead.nextStep) || 'Follow up') + '</span></div>' +
        '<div class="lead-info"><div><span class="lead-value ' + (isWon ? 'value-won-shine' : '') + '">' + money(value) + '</span><span class="lead-close-date">' + (lead.date || 'No date') + '</span></div><div style="text-align:right;"><span class="prob-badge" style="color:' + priorityColor + ';font-weight:700;">' + probability + '% Prob</span></div></div>' +
        '<div class="prob-bar"><div class="prob-bar-fill" style="width:' + probability + '%;"></div></div>' +
        '<div class="lead-footer-row"><div class="lead-owner-chip"><span class="avatar-chip" style="width:20px;height:20px;font-size:9px;">' + initials(lead.assigned) + '</span><span>' + (escapeHtml(lead.assigned) || 'Unassigned') + '</span>' + (isMine ? '<span class="badge-mini">You</span>' : '') + '</div><button class="lead-details-btn" onclick="openDealDetails(\'' + lead.id + '\')">Deal Room ›</button></div>';

      col.appendChild(el);
    });

    container.appendChild(col);
  });

  // Append "+ Add Stage" column to board
  const addStageCol = document.createElement('div');
  addStageCol.className = 'add-stage-col';
  addStageCol.innerHTML = `
    <button class="add-stage-btn" onclick="openAddStageModal()" title="Add Stage Column to active pipeline">
      <span style="font-size:22px;line-height:1;">➕</span>
      <strong>Add Stage</strong>
      <span style="font-size:11px;opacity:0.8;">New stage column</span>
    </button>
  `;
  container.appendChild(addStageCol);

  if (typeof init3DTiltPhysics === 'function') {
    setTimeout(init3DTiltPhysics, 60);
  }
}

function drag(ev) {
  ev.dataTransfer.setData('text', ev.target.id);
  ev.target.classList.add('dragging');
}

function allowDrop(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.add('drag-over');
}

function drop(ev) {
  ev.preventDefault();
  const stageEl = ev.currentTarget.closest('.stage');
  if (stageEl) stageEl.classList.remove('drag-over');
  const id = ev.dataTransfer.getData('text');
  const lead = findLeadById(id);
  if (!lead || !stageEl) return;

  const newStageName = stageEl.dataset.stageName;
  if (!newStageName || lead.stage === newStageName) return;

  const stages = getActiveStages();
  const isLastStage = stages.length > 0 && stages[stages.length - 1].name.toLowerCase() === newStageName.toLowerCase();

  lead.stage = newStageName;
  lead.stallDays = 0;
  lead.stageAge = 'Moved Just Now';

  if (isLastStage || newStageName.toLowerCase().includes('won')) {
    lead.probability = 100;
    lead.stageAge = 'Won Today';
  } else if (newStageName.toLowerCase().includes('proposal') || newStageName.toLowerCase().includes('contract') || newStageName.toLowerCase().includes('agreement')) {
    lead.probability = Math.max(75, lead.probability || 0);
  }

  fetch(API_BASE + '/api/leads/' + lead.id + '/stage', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage: newStageName })
  }).catch(() => {});

  if (typeof addAuditLog === 'function') {
    addAuditLog({
      category: 'PIPELINE',
      action: "advanced '" + lead.name + "' to " + newStageName + '.',
      target: lead.id,
      icon: '⚡'
    });
  }

  if (isLastStage || newStageName.toLowerCase().includes('won')) {
    if (typeof evaluateAutomations === 'function') evaluateAutomations('DEAL_WON', lead);
    if (typeof fire3DConfetti === 'function') fire3DConfetti();
    showToast('🏆 Won: ' + lead.name + ' (' + money(lead.value) + ')!', '🎉', 'success');
  } else {
    showToast('⚡ ' + lead.name + ' moved to ' + newStageName + ' (' + money(lead.value) + ')', '➡️', 'success');
  }

  saveLocalState();
  renderPipeline();
  if (typeof renderDashboard === 'function') renderDashboard();
}

document.querySelectorAll('.stage').forEach(s => {
  s.addEventListener('dragleave', () => s.classList.remove('drag-over'));
});

// Interactive Deal Room Modal with Visual Stepper & Products
function openDealDetails(leadId) {
  const lead = findLeadById(leadId);
  if (!lead) return;

  const modalOverlay = document.getElementById('dealModalOverlay') || createDealModalElement();
  const modalBox = modalOverlay.querySelector('.deal-modal-content');

  const stages = getActiveStages().map(s => s.name);
  const curIdx = stages.findIndex(s => s.toLowerCase() === (lead.stage || '').toLowerCase());

  const stepperHtml = stages.map((st, idx) => {
    const isCompleted = curIdx >= 0 && idx < curIdx;
    const isCurrent = idx === curIdx;
    return '<div class="deal-stepper-step ' + (isCompleted ? 'completed' : isCurrent ? 'current' : '') + '" onclick="jumpDealStage(\'' + lead.id + '\', \'' + st.replace(/'/g, "\\'") + '\')"><div class="deal-stepper-node">' + (isCompleted ? '✓' : (idx + 1)) + '</div><span class="deal-stepper-label">' + st + '</span></div>';
  }).join('');

  const product1Val = Math.round(lead.value * 0.65);
  const product2Val = Math.round(lead.value * 0.25);
  const product3Val = lead.value - product1Val - product2Val;

  const aiDiag = (typeof analyzeDealHealth === 'function') ? analyzeDealHealth(lead) : { level: 'Low', badgeClass: 'risk-low', riskScore: 15, recommendation: 'Pacing steadily.' };

  modalBox.innerHTML = `
    <div class="deal-modal-header">
      <div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="tag">${lead.tag || 'Opportunity'}</span>
          <span class="ai-risk-badge ${aiDiag.badgeClass}">● ${aiDiag.level}</span>
        </div>
        <h2 style="margin:8px 0 2px;font-size:20px;color:var(--text);">${escapeHtml(lead.name)}</h2>
        <div style="font-size:12px;color:var(--text-muted);">Deal ID: ${lead.id} · Assigned: ${escapeHtml(lead.assigned)}</div>
      </div>
      <button class="toast-close" onclick="closeDealDetails()" style="font-size:20px;">✕</button>
    </div>
    <div class="deal-modal-body">
      <!-- AI Deal Copilot Banner -->
      <div class="ai-doctor-banner">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="ai-tag">🤖 AI Deal Doctor</span>
            <strong style="font-size:13px;color:var(--text);">${aiDiag.riskScore}% Velocity Risk</strong>
          </div>
          <button class="btn btn-outline btn-sm" onclick="generateAIRecoveryPitch('${lead.id}')">🤖 Generate AI Pitch</button>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:6px;">${aiDiag.recommendation}</div>
      </div>

      <div class="deal-stepper-wrap"><div class="deal-stepper-line"></div>${stepperHtml}</div>
      <div class="deal-modal-grid">
        <div class="deal-metric-card tilt-card-3d"><span>Total Value</span><strong style="color:var(--green);font-size:20px;">${money(lead.value)}</strong></div>
        <div class="deal-metric-card tilt-card-3d"><span>Win Probability</span><strong style="color:var(--accent);font-size:20px;">${lead.probability}%</strong></div>
        <div class="deal-metric-card tilt-card-3d"><span>Target Date</span><strong style="font-size:14px;">${lead.date}</strong></div>
        <div class="deal-metric-card tilt-card-3d"><span>Current Stage</span><strong style="color:var(--violet);font-size:14px;">${lead.stage}</strong></div>
      </div>
      <div style="margin:16px 0;padding:14px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Primary Contact</span>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="closeDealDetails(); openCallLogModal('${lead.id}');">📞 Call</button>
            <button class="btn btn-outline btn-sm" onclick="closeDealDetails(); openEmailModal('${lead.id}');">✉️ Email</button>
          </div>
        </div>
        <div style="font-weight:600;color:var(--text);">${escapeHtml(lead.contact)}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
          <a href="mailto:${lead.email}" style="color:var(--text-secondary);text-decoration:underline;">${lead.email}</a> · 
          <a href="tel:${lead.phone}" style="color:var(--accent);font-weight:600;text-decoration:none;">📞 ${lead.phone}</a>
        </div>
      </div>
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Configured Line Items & Licensing</span>
          <button class="btn btn-outline btn-sm" onclick="closeDealDetails(); openQuoteModal('${lead.id}');">📄 Proposal Quote Studio ›</button>
        </div>
        <table class="deal-products-table">
          <thead><tr><th>Product Item</th><th>Allocation</th><th>Subtotal</th></tr></thead>
          <tbody>
            <tr><td>Core Platform Enterprise License</td><td>65%</td><td><strong>${money(product1Val)}</strong></td></tr>
            <tr><td>Custom SLA & Cloud Operations</td><td>25%</td><td><strong>${money(product2Val)}</strong></td></tr>
            <tr><td>Architecture Kickoff & Setup</td><td>10%</td><td><strong>${money(product3Val)}</strong></td></tr>
          </tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;">
        <button class="btn btn-sm" style="background:var(--red);color:#ffffff;border:none;padding:7px 14px;border-radius:var(--radius-sm);" onclick="deleteLead('${lead.id}')">Delete Deal</button>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-outline btn-sm" onclick="closeDealDetails()">Close</button>
          <button class="btn-primary btn-sm" onclick="advanceDealStage('${lead.id}')">Advance Stage ›</button>
        </div>
      </div>
    </div>
  `;

  modalOverlay.classList.add('open');
  if (typeof init3DTiltPhysics === 'function') {
    setTimeout(init3DTiltPhysics, 60);
  }
}

function jumpDealStage(leadId, targetStage) {
  const lead = findLeadById(leadId);
  if (!lead || lead.stage === targetStage) return;

  const stages = getActiveStages().map(s => s.name);
  const isLast = stages.length > 0 && stages[stages.length - 1].toLowerCase() === targetStage.toLowerCase();

  lead.stage = targetStage;
  lead.stallDays = 0;
  lead.stageAge = 'Moved Just Now';

  if (isLast || targetStage.toLowerCase().includes('won')) {
    lead.probability = 100;
    lead.stageAge = 'Won Today';
    if (typeof fire3DConfetti === 'function') fire3DConfetti();
    showToast('🏆 Deal Won: ' + lead.name + ' (' + money(lead.value) + ')!', '🎉', 'success');
  } else {
    showToast('Deal updated to ' + targetStage, '⚡', 'success');
  }

  if (typeof addAuditLog === 'function') {
    addAuditLog({ category: 'PIPELINE', action: "moved '" + lead.name + "' to " + targetStage + '.', target: lead.id, icon: '➡️' });
  }
  saveLocalState();
  renderPipeline();
  if (typeof renderDashboard === 'function') renderDashboard();
  openDealDetails(leadId);
}

async function deleteLead(leadId) {
  const lead = findLeadById(leadId);
  if (!lead) return;
  if (!confirm("Delete deal '" + lead.name + "' permanently?")) return;
  leads = leads.filter(l => String(l.id) !== String(leadId));
  saveLocalState();
  if (typeof addAuditLog === 'function') {
    addAuditLog({ category: 'PIPELINE', action: "deleted deal '" + lead.name + "'.", target: leadId, icon: '🗑️' });
  }
  fetch(API_BASE + '/api/leads/' + leadId, { method: 'DELETE' }).catch(() => {});
  closeDealDetails();
  renderPipeline();
  if (typeof renderDashboard === 'function') renderDashboard();
  showToast('Deleted deal: ' + lead.name, '🗑️', 'warning');
}

function advanceDealStage(leadId) {
  const lead = findLeadById(leadId);
  if (!lead) return;
  const stages = getActiveStages().map(s => s.name);
  const curIdx = stages.findIndex(s => s.toLowerCase() === (lead.stage || '').toLowerCase());
  if (curIdx >= 0 && curIdx < stages.length - 1) {
    jumpDealStage(leadId, stages[curIdx + 1]);
  } else {
    showToast('Deal is already in the final stage (' + (stages[stages.length - 1] || lead.stage) + ')!', '🏆', 'info');
  }
}

function closeDealDetails() {
  const modalOverlay = document.getElementById('dealModalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('open');
}

function createDealModalElement() {
  let el = document.getElementById('dealModalOverlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'dealModalOverlay';
    el.className = 'modal-overlay';
    el.onclick = function(e) { if (e.target === el) closeDealDetails(); };
    el.innerHTML = '<div class="deal-modal-content"></div>';
    document.body.appendChild(el);
  }
  return el;
}

function openCreateDealModal(defaultStage) {
  const modalOverlay = document.getElementById('dealModalOverlay') || createDealModalElement();
  const modalBox = modalOverlay.querySelector('.deal-modal-content');

  const userOptions = users.map(u => '<option value="' + u.name + '" ' + (u.name === activeUserName ? 'selected' : '') + '>' + u.name + '</option>').join('');
  const activeStages = getActiveStages();
  const targetStage = defaultStage || (activeStages[0] ? activeStages[0].name : 'Lead In');

  const stageOptions = activeStages.map(s => {
    const isSel = s.name.toLowerCase() === targetStage.toLowerCase();
    return '<option value="' + escapeHtml(s.name) + '" ' + (isSel ? 'selected' : '') + '>' + escapeHtml(s.name) + '</option>';
  }).join('');

  modalBox.innerHTML = '<div class="deal-modal-header"><div><span class="tag">NEW OPPORTUNITY</span><h2 style="margin:8px 0 2px;font-size:18px;color:var(--text);">Create New Pipeline Deal</h2></div><button class="toast-close" onclick="closeDealDetails()" style="font-size:20px;">✕</button></div><div class="deal-modal-body"><form onsubmit="event.preventDefault(); submitCreateDealModal();" style="display:flex;flex-direction:column;gap:12px;"><div class="deal-modal-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;"><div class="form-field"><label class="form-label" for="modalDealName">Company / Deal Name *</label><input type="text" id="modalDealName" class="input-text" placeholder="e.g. Acme Corp" required autofocus></div><div class="form-field"><label class="form-label" for="modalDealValue">Deal Value (USD) *</label><input type="text" id="modalDealValue" class="input-text" placeholder="e.g. $75,000" required></div></div><div class="deal-modal-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;"><div class="form-field"><label class="form-label" for="modalDealStage">Pipeline Stage</label><select id="modalDealStage" class="input-text">' + stageOptions + '</select></div><div class="form-field"><label class="form-label" for="modalDealPriority">Priority</label><select id="modalDealPriority" class="input-text"><option value="Medium">Medium</option><option value="High" selected>High</option><option value="Urgent">Urgent</option><option value="Low">Low</option></select></div></div><div class="deal-modal-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;"><div class="form-field"><label class="form-label" for="modalDealContact">Contact Person</label><input type="text" id="modalDealContact" class="input-text" placeholder="e.g. John Doe"></div><div class="form-field"><label class="form-label" for="modalDealPhone">Contact Number / Phone</label><input type="tel" id="modalDealPhone" class="input-text" placeholder="e.g. +1 (555) 019-2831"></div></div><div class="deal-modal-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;"><div class="form-field"><label class="form-label" for="modalDealEmail">Contact Email</label><input type="email" id="modalDealEmail" class="input-text" placeholder="john@company.com"></div><div class="form-field"><label class="form-label" for="modalDealCategory">Industry</label><input type="text" id="modalDealCategory" class="input-text" placeholder="e.g. SaaS / Cloud"></div></div><div class="deal-modal-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;"><div class="form-field"><label class="form-label" for="modalDealAssigned">Assigned To</label><select id="modalDealAssigned" class="input-text">' + userOptions + '</select></div><div class="form-field"><label class="form-label" for="modalDealNextStep">Next Step</label><input type="text" id="modalDealNextStep" class="input-text" placeholder="e.g. Architectural review call"></div></div><div style="display:flex;justify-content:flex-end;gap:12px;margin-top:14px;"><button type="button" class="btn btn-outline btn-sm" onclick="closeDealDetails()">Cancel</button><button type="submit" class="btn-primary btn-sm">Create Deal</button></div></form></div>';

  modalOverlay.classList.add('open');
  setTimeout(() => {
    const input = document.getElementById('modalDealName');
    if (input) input.focus();
  }, 50);
}

async function submitCreateDealModal() {
  const name = (document.getElementById('modalDealName')?.value || '').trim();
  const rawVal = (document.getElementById('modalDealValue')?.value || '').replace(/[^0-9.]/g, '');
  const value = parseFloat(rawVal) || 50000;
  const stage = document.getElementById('modalDealStage')?.value || 'Lead In';
  const priority = document.getElementById('modalDealPriority')?.value || 'High';
  const contact = (document.getElementById('modalDealContact')?.value || '').trim() || 'Executive Contact';
  const email = (document.getElementById('modalDealEmail')?.value || '').trim() || 'contact@client.com';
  const phone = (document.getElementById('modalDealPhone')?.value || '').trim() || '+1 (555) 019-2831';
  const tag = (document.getElementById('modalDealCategory')?.value || '').trim() || 'Enterprise Tech';
  const assigned = document.getElementById('modalDealAssigned')?.value || activeUserName;
  const nextStep = (document.getElementById('modalDealNextStep')?.value || '').trim() || 'Follow up with lead';

  if (!name) {
    showToast('Please specify a Deal / Company name.', '⚠️', 'warning');
    return;
  }

  const payload = {
    pipelineId: activePipelineId,
    name,
    tag,
    contact,
    email,
    phone,
    assigned,
    value,
    stage,
    priority,
    nextStep
  };

  try {
    const res = await fetch(API_BASE + '/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const savedLead = await res.json();
      savedLead.pipelineId = activePipelineId;
      leads.push(savedLead);
    } else {
      leads.push({ id: 'lead-' + (nextLeadNumber++), pipelineId: activePipelineId, ...payload, date: 'Q3 2026', probability: stage.toLowerCase().includes('won') ? 100 : 35, stageAge: 'New' });
    }
  } catch (err) {
    leads.push({ id: 'lead-' + (nextLeadNumber++), pipelineId: activePipelineId, ...payload, date: 'Q3 2026', probability: stage.toLowerCase().includes('won') ? 100 : 35, stageAge: 'New' });
  }

  if (typeof addAuditLog === 'function') {
    addAuditLog({ category: 'PIPELINE', action: "created deal '" + name + "' (" + money(payload.value) + ').', target: name, icon: '➕' });
  }
  saveLocalState();
  renderPipeline();
  if (typeof renderDashboard === 'function') renderDashboard();
  closeDealDetails();
  showToast('Deal created: ' + name + ' (' + money(payload.value) + ')', '➕', 'success');
}

// --------------------------------------------------------
// PIPELINE MANAGEMENT MODALS & HANDLERS
// --------------------------------------------------------

function openCreatePipelineModal() {
  const modal = document.getElementById('createPipelineModal');
  if (modal) {
    modal.classList.add('open');
    const input = document.getElementById('pipelineName');
    if (input) { input.value = ''; input.focus(); }
    const desc = document.getElementById('pipelineDescription');
    if (desc) desc.value = '';
    const stagesInput = document.getElementById('pipelineStagesInput');
    if (stagesInput) stagesInput.value = 'Discovery, Scoping, Proposal Sent, Closed Won';
  }
}

function closeCreatePipelineModal() {
  const modal = document.getElementById('createPipelineModal');
  if (modal) modal.classList.remove('open');
}

function submitCreatePipeline() {
  const nameInput = document.getElementById('pipelineName');
  const descInput = document.getElementById('pipelineDescription');
  const stagesInput = document.getElementById('pipelineStagesInput');

  const name = (nameInput?.value || '').trim();
  const desc = (descInput?.value || '').trim() || 'Custom revenue pipeline';
  const rawStages = (stagesInput?.value || '').trim();

  if (!name) {
    showToast('Please enter a pipeline name.', '⚠️', 'warning');
    return;
  }

  const stageNames = rawStages.split(',').map(s => s.trim()).filter(s => s.length > 0);
  if (stageNames.length === 0) {
    showToast('Please specify at least one stage for the pipeline.', '⚠️', 'warning');
    return;
  }

  const palette = ['purple', 'blue', 'orange', 'green', 'amber', 'teal', 'red'];
  const stages = stageNames.map((st, idx) => ({
    name: st,
    color: palette[idx % palette.length]
  }));

  const newPipeId = 'pipe-' + Date.now();
  const newPipeline = {
    id: newPipeId,
    name,
    description: desc,
    stages
  };

  if (!Array.isArray(pipelines)) pipelines = [];
  pipelines.push(newPipeline);
  activePipelineId = newPipeId;
  saveLocalState();

  if (typeof addAuditLog === 'function') {
    addAuditLog({
      category: 'PIPELINE',
      action: "created new pipeline '" + name + "' with " + stages.length + " stages.",
      target: newPipeId,
      icon: '📊'
    });
  }

  closeCreatePipelineModal();
  renderPipeline();
  showToast("Pipeline '" + name + "' created and activated!", '📊', 'success');
}

function openAddStageModal() {
  const modal = document.getElementById('addStageModal');
  if (modal) {
    modal.classList.add('open');
    const input = document.getElementById('newStageName');
    if (input) { input.value = ''; input.focus(); }
  }
}

function closeAddStageModal() {
  const modal = document.getElementById('addStageModal');
  if (modal) modal.classList.remove('open');
}

function submitAddStage() {
  const nameInput = document.getElementById('newStageName');
  const colorInput = document.getElementById('newStageColor');
  const stageName = (nameInput?.value || '').trim();
  const stageColor = colorInput?.value || 'purple';

  if (!stageName) {
    showToast('Please enter a stage name.', '⚠️', 'warning');
    return;
  }

  const activePipe = getActivePipeline();
  if (!activePipe) return;

  if (!Array.isArray(activePipe.stages)) activePipe.stages = [];

  if (activePipe.stages.some(s => s.name.toLowerCase() === stageName.toLowerCase())) {
    showToast("Stage '" + stageName + "' already exists in this pipeline.", '⚠️', 'warning');
    return;
  }

  activePipe.stages.push({ name: stageName, color: stageColor });
  saveLocalState();

  if (typeof addAuditLog === 'function') {
    addAuditLog({
      category: 'PIPELINE',
      action: "added stage '" + stageName + "' to pipeline '" + activePipe.name + "'.",
      target: activePipe.id,
      icon: '⚡'
    });
  }

  closeAddStageModal();
  renderPipeline();
  showToast("Added stage '" + stageName + "' to " + activePipe.name, '➕', 'success');
}
