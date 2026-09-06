// ========================================================
// NovaCRM - Sales Pipeline & Deal Room
// Drag & drop pipeline, deal stage progression, and deals management
// ========================================================

const STAGE_MAP = {
  'Lead In': 'stage-prospect',
  'Contacted': 'stage-contacted',
  'Proposal Sent': 'stage-proposal',
  'Closed Won': 'stage-closed',
};
const PIPELINE_STAGES = Object.keys(STAGE_MAP);

function normalizePipelineStage(stage) {
  const value = String(stage || '').trim().toLowerCase();
  return PIPELINE_STAGES.find(name => name.toLowerCase() === value) || 'Lead In';
}

function findLeadById(leadId) {
  return Array.isArray(leads) ? leads.find(lead => String(lead.id) === String(leadId)) : null;
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
  leads.forEach(lead => {
    if (lead) {
      lead.id = String(lead.id || '');
      lead.stage = normalizePipelineStage(lead.stage);
    }
  });
  let visibleLeads = pipelineFilterMode === 'my' 
    ? leads.filter(l => l.assigned === activeUserName)
    : [...leads];

  if (pipelineSortMode === 'value-desc') {
    visibleLeads.sort((a, b) => b.value - a.value);
  } else if (pipelineSortMode === 'value-asc') {
    visibleLeads.sort((a, b) => a.value - b.value);
  } else if (pipelineSortMode === 'prob-desc') {
    visibleLeads.sort((a, b) => b.probability - a.probability);
  } else if (pipelineSortMode === 'name-asc') {
    visibleLeads.sort((a, b) => a.name.localeCompare(b.name));
  }

  Object.values(STAGE_MAP).forEach(id => {
    const stage = document.getElementById(id);
    if (!stage) return;
    const header = stage.querySelector('.stage-header');
    stage.innerHTML = '';
    if (header) stage.appendChild(header);
  });

  visibleLeads.forEach((lead) => {
    if (!lead || !lead.id) return;
    const stageId = STAGE_MAP[lead.stage] || 'stage-prospect';
    const stage = document.getElementById(stageId);
    if (!stage) return;

    const isMine = lead.assigned === activeUserName;
    const priorityColor = lead.priority === 'Urgent' ? 'var(--red)' : lead.priority === 'High' ? 'var(--amber)' : 'var(--accent)';
    const isWon = lead.stage === 'Closed Won';
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
    
    el.innerHTML = '<div class="lead-top-row"><span class="lead-tag ' + (lead.priority === 'Urgent' ? 'pulse-urgent' : '') + '" style="border-left:2px solid ' + priorityColor + ';">' + (lead.tag || 'Opportunity') + '</span>' + stallBadge + '</div><div class="lead-title" onclick="openDealDetails(\'' + lead.id + '\')"><strong>' + (lead.name || 'Untitled deal') + '</strong></div><div class="lead-meta"><div class="lead-contact-line"><span class="contact-avatar-mini">' + initials(lead.contact) + '</span><span class="contact-name-text">' + (lead.contact || 'Unassigned contact') + '</span>' + (lead.phone ? ' · <a href="tel:' + lead.phone + '" style="color:var(--accent);font-size:11px;text-decoration:none;font-weight:600;" onclick="event.stopPropagation();" title="Direct Call">📞 ' + lead.phone + '</a>' : '') + '</div>' + livePresence + '</div><div class="lead-next-step"><span class="next-step-badge">Next:</span><span class="next-step-text">' + (lead.nextStep || 'Follow up') + '</span></div><div class="lead-info"><div><span class="lead-value ' + (isWon ? 'value-won-shine' : '') + '">' + money(value) + '</span><span class="lead-close-date">' + (lead.date || 'No date') + '</span></div><div style="text-align:right;"><span class="prob-badge" style="color:' + priorityColor + ';font-weight:700;">' + probability + '% Prob</span></div></div><div class="prob-bar"><div class="prob-bar-fill" style="width:' + probability + '%;"></div></div><div class="lead-footer-row"><div class="lead-owner-chip"><span class="avatar-chip" style="width:20px;height:20px;font-size:9px;">' + initials(lead.assigned) + '</span><span>' + (lead.assigned || 'Unassigned') + '</span>' + (isMine ? '<span class="badge-mini">You</span>' : '') + '</div><button class="lead-details-btn" onclick="openDealDetails(\'' + lead.id + '\')">Deal Room ›</button></div>';
    stage.appendChild(el);
  });

  Object.entries(STAGE_MAP).forEach(([stageName, id]) => {
    const stage = document.getElementById(id);
    if (!stage) return;
    const stageLeads = visibleLeads.filter(l => l.stage === stageName);
    const count = stageLeads.length;
    const total = stageLeads.reduce((a, b) => a + (Number(b.value) || 0), 0);

    const countEl = stage.querySelector('.stage-count');
    if (countEl) countEl.textContent = count;

    let totalEl = stage.querySelector('.stage-total');
    if (!totalEl) {
      totalEl = document.createElement('div');
      totalEl.className = 'stage-total';
      const hdr = stage.querySelector('.stage-header');
      if (hdr) hdr.after(totalEl);
    }
    totalEl.innerHTML = '<div class="stage-metric-pill"><strong>' + money(total) + '</strong><span>' + count + ' deals</span></div>';
  });

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
  ev.currentTarget.classList.remove('drag-over');
  const id = ev.dataTransfer.getData('text');
  const leadEl = document.getElementById(id);
  if (!leadEl) return;

  const targetStageId = ev.currentTarget.id;
  const newStageName = Object.keys(STAGE_MAP).find(k => STAGE_MAP[k] === targetStageId);
  const lead = findLeadById(id);
  if (!lead || lead.stage === newStageName) return;

  lead.stage = newStageName;
  lead.stallDays = 0; // reset stall on movement
  if (newStageName === 'Closed Won') {
    lead.probability = 100;
    lead.stageAge = 'Won Today';
  } else if (newStageName === 'Proposal Sent') {
    lead.probability = Math.max(75, lead.probability);
    lead.stageAge = '1d in stage';
  }
  lead.stageAge = 'Moved Just Now';
  lead.stallDays = 0;
  if (newStageName === 'Closed Won') lead.probability = 100;
  else if (newStageName === 'Proposal Sent') lead.probability = Math.max(75, lead.probability);

  fetch(API_BASE + '/api/leads/' + lead.id + '/stage', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage: newStageName })
  }).catch(() => {});

  if (typeof addAuditLog === 'function') {
    addAuditLog({
      category: 'PIPELINE',
      action: 'advanced \'' + lead.name + '\' to ' + newStageName + '.',
      target: lead.id,
      icon: '⚡'
    });
  }

  if (typeof evaluateAutomations === 'function') {
    if (newStageName === 'Closed Won') evaluateAutomations('DEAL_WON', lead);
  }

  saveLocalState();
  renderPipeline();
  if (typeof renderDashboard === 'function') renderDashboard();

  if (newStageName === 'Closed Won') {
    if (typeof fire3DConfetti === 'function') fire3DConfetti();
    showToast('🏆 Deal Closed Won: ' + lead.name + ' (' + money(lead.value) + ')!', '🎉', 'success');
  } else {
    showToast('⚡ ' + lead.name + ' moved to ' + newStageName + ' (' + money(lead.value) + ')', '➡️', 'success');
  }
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
  
  const stages = ['Lead In', 'Contacted', 'Proposal Sent', 'Closed Won'];
  const curIdx = stages.indexOf(lead.stage);

  const stepperHtml = stages.map((st, idx) => {
    const isCompleted = idx < curIdx;
    const isCurrent = idx === curIdx;
    return '<div class="deal-stepper-step ' + (isCompleted ? 'completed' : isCurrent ? 'current' : '') + '" onclick="jumpDealStage(\'' + lead.id + '\', \'' + st + '\')"><div class="deal-stepper-node">' + (isCompleted ? '✓' : (idx + 1)) + '</div><span class="deal-stepper-label">' + st + '</span></div>';
  }).join('');

  const product1Val = Math.round(lead.value * 0.65);
  const product2Val = Math.round(lead.value * 0.25);
  const product3Val = lead.value - product1Val - product2Val;

  const aiDiag = (typeof analyzeDealHealth === 'function') ? analyzeDealHealth(lead) : { level: 'Low', badgeClass: 'risk-low', riskScore: 15, recommendation: 'Pacing steadily.' };

  modalBox.innerHTML = `
    <div class="deal-modal-header">
      <div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="tag">${lead.tag}</span>
          <span class="ai-risk-badge ${aiDiag.badgeClass}">● ${aiDiag.level}</span>
        </div>
        <h2 style="margin:8px 0 2px;font-size:20px;color:var(--text);">${lead.name}</h2>
        <div style="font-size:12px;color:var(--text-muted);">Deal ID: ${lead.id} · Assigned: ${lead.assigned}</div>
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
        <div style="font-weight:600;color:var(--text);">${lead.contact}</div>
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

  lead.stage = targetStage;
  if (targetStage === 'Closed Won') {
    lead.probability = 100;
    lead.stageAge = 'Won Today';
    if (typeof fire3DConfetti === 'function') fire3DConfetti();
    showToast('🏆 Deal Won: ' + lead.name + ' (' + money(lead.value) + ')!', '🎉', 'success');
  } else {
    showToast('Deal updated to ' + targetStage, '⚡', 'success');
  }

  if (typeof addAuditLog === 'function') {
    addAuditLog({ category: 'PIPELINE', action: 'moved \'' + lead.name + '\' to ' + targetStage + '.', target: lead.id, icon: '➡️' });
  }
  saveLocalState();
  renderPipeline();
  if (typeof renderDashboard === 'function') renderDashboard();
  openDealDetails(leadId);
}

async function deleteLead(leadId) {
  const lead = findLeadById(leadId);
  if (!lead) return;
  if (!confirm('Delete deal \'' + lead.name + '\' permanently?')) return;
  leads = leads.filter(l => String(l.id) !== String(leadId));
  saveLocalState();
  if (typeof addAuditLog === 'function') {
    addAuditLog({ category: 'PIPELINE', action: 'deleted deal \'' + lead.name + '\'.', target: leadId, icon: '🗑️' });
  }
  fetch(API_BASE + '/api/leads/' + leadId, { method: 'DELETE' }).catch(() => {});
  closeDealDetails();
  renderPipeline();
  if (typeof renderDashboard === 'function') renderDashboard();
  showToast('Deleted deal: ' + lead.name, '🗑️', 'warning');
}

function advanceDealStage(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  const stages = ['Lead In', 'Contacted', 'Proposal Sent', 'Closed Won'];
  const curIdx = stages.indexOf(lead.stage);
  if (curIdx < stages.length - 1) {
    jumpDealStage(leadId, stages[curIdx + 1]);
  } else {
    showToast('Deal is already Closed Won!', '🏆', 'info');
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

function openCreateDealModal(defaultStage = 'Lead In') {
  const modalOverlay = document.getElementById('dealModalOverlay') || createDealModalElement();
  const modalBox = modalOverlay.querySelector('.deal-modal-content');

  const userOptions = users.map(u => '<option value="' + u.name + '" ' + (u.name === activeUserName ? 'selected' : '') + '>' + u.name + '</option>').join('');

  modalBox.innerHTML = '<div class="deal-modal-header"><div><span class="tag">NEW OPPORTUNITY</span><h2 style="margin:8px 0 2px;font-size:18px;color:var(--text);">Create New Pipeline Deal</h2></div><button class="toast-close" onclick="closeDealDetails()" style="font-size:20px;">✕</button></div><div class="deal-modal-body"><form onsubmit="event.preventDefault(); submitCreateDealModal();" style="display:flex;flex-direction:column;gap:12px;"><div class="deal-modal-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;"><div class="form-field"><label class="form-label" for="modalDealName">Company / Deal Name *</label><input type="text" id="modalDealName" class="input-text" placeholder="e.g. Acme Corp" required autofocus></div><div class="form-field"><label class="form-label" for="modalDealValue">Deal Value (USD) *</label><input type="text" id="modalDealValue" class="input-text" placeholder="e.g. $75,000" required></div></div><div class="deal-modal-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;"><div class="form-field"><label class="form-label" for="modalDealStage">Pipeline Stage</label><select id="modalDealStage" class="input-text"><option value="Lead In" ' + (defaultStage === 'Lead In' ? 'selected' : '') + '>Lead In</option><option value="Contacted" ' + (defaultStage === 'Contacted' ? 'selected' : '') + '>Contacted</option><option value="Proposal Sent" ' + (defaultStage === 'Proposal Sent' ? 'selected' : '') + '>Proposal Sent</option><option value="Closed Won" ' + (defaultStage === 'Closed Won' ? 'selected' : '') + '>Closed Won</option></select></div><div class="form-field"><label class="form-label" for="modalDealPriority">Priority</label><select id="modalDealPriority" class="input-text"><option value="Medium">Medium</option><option value="High" selected>High</option><option value="Urgent">Urgent</option><option value="Low">Low</option></select></div></div><div class="deal-modal-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;"><div class="form-field"><label class="form-label" for="modalDealContact">Contact Person</label><input type="text" id="modalDealContact" class="input-text" placeholder="e.g. John Doe"></div><div class="form-field"><label class="form-label" for="modalDealPhone">Contact Number / Phone</label><input type="tel" id="modalDealPhone" class="input-text" placeholder="e.g. +1 (555) 019-2831"></div></div><div class="deal-modal-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;"><div class="form-field"><label class="form-label" for="modalDealEmail">Contact Email</label><input type="email" id="modalDealEmail" class="input-text" placeholder="john@company.com"></div><div class="form-field"><label class="form-label" for="modalDealCategory">Industry</label><input type="text" id="modalDealCategory" class="input-text" placeholder="e.g. SaaS / Cloud"></div></div><div class="deal-modal-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;"><div class="form-field"><label class="form-label" for="modalDealAssigned">Assigned To</label><select id="modalDealAssigned" class="input-text">' + userOptions + '</select></div><div class="form-field"><label class="form-label" for="modalDealNextStep">Next Step</label><input type="text" id="modalDealNextStep" class="input-text" placeholder="e.g. Architectural review call"></div></div><div style="display:flex;justify-content:flex-end;gap:12px;margin-top:14px;"><button type="button" class="btn btn-outline btn-sm" onclick="closeDealDetails()">Cancel</button><button type="submit" class="btn-primary btn-sm">Create Deal</button></div></form></div>';

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
      leads.push(savedLead);
    } else {
      leads.push({ id: 'lead-' + (nextLeadNumber++), ...payload, date: 'Q3 2026', probability: stage === 'Closed Won' ? 100 : 35, stageAge: 'New' });
    }
  } catch (err) {
    leads.push({ id: 'lead-' + (nextLeadNumber++), ...payload, date: 'Q3 2026', probability: stage === 'Closed Won' ? 100 : 35, stageAge: 'New' });
  }

  if (typeof addAuditLog === 'function') {
    addAuditLog({ category: 'PIPELINE', action: 'created deal \'' + name + '\' (' + money(payload.value) + ').', target: name, icon: '➕' });
  }
  saveLocalState();
  renderPipeline();
  if (typeof renderDashboard === 'function') renderDashboard();
  closeDealDetails();
  showToast('Deal created: ' + name + ' (' + money(payload.value) + ')', '➕', 'success');
}

