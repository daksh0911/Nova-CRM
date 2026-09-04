// ========================================================
// NovaCRM — Workflow Automation Engine (IFTTT)
// Trigger evaluations, automated task delegation & rule toggles
// ========================================================

function renderAutomations() {
  const container = document.getElementById('automationsListContainer');
  if (!container) return;

  container.innerHTML = automationsList.map(rule => {
    return `
      <div class="automation-card tilt-card-3d ${rule.active ? 'active' : 'disabled'}">
        <div class="automation-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="action-icon ${rule.active ? 'teal' : 'amber'}">${rule.icon}</div>
            <div>
              <strong style="font-size:15px;color:var(--text);">${rule.title}</strong>
              <div class="list-subtitle">${rule.runs} total executions</div>
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" ${rule.active ? 'checked' : ''} onchange="toggleAutomationRule('${rule.id}')">
            <span class="slider round"></span>
          </label>
        </div>
        <div class="automation-body">
          <div class="automation-pill condition">
            <span>IF</span> ${rule.trigger}
          </div>
          <div class="automation-arrow">↓</div>
          <div class="automation-pill action">
            <span>THEN</span> ${rule.action}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleAutomationRule(ruleId) {
  const rule = automationsList.find(r => r.id === ruleId);
  if (!rule) return;
  rule.active = !rule.active;
  saveLocalState();
  renderAutomations();
  showToast((rule.active ? 'Activated: ' : 'Paused: ') + rule.title, '⚡', 'info');
}

function evaluateAutomations(triggerType, payload) {
  if (!Array.isArray(automationsList)) return;

  automationsList.forEach(rule => {
    if (!rule.active) return;

    if (triggerType === 'DEAL_HIGH_VALUE' && rule.id === 'auto-1' && payload.value >= 100000) {
      rule.runs++;
      showToast('⚡ Automation Triggered: ' + rule.title, '🤖', 'success');
      if (typeof addAuditLog === 'function') {
        addAuditLog({ category: 'SYSTEM', action: 'executed automation: ' + rule.title + ' on ' + payload.name, target: payload.name, icon: '⚡' });
      }
    }

    if (triggerType === 'DEAL_WON' && rule.id === 'auto-2') {
      rule.runs++;
      if (userSpecificData[activeUserName]) {
        userSpecificData[activeUserName].tasks = userSpecificData[activeUserName].tasks || [];
        userSpecificData[activeUserName].tasks.unshift('🚀 Complete onboarding setup for ' + payload.name);
      }
      showToast('🚀 Automation Triggered: Generated onboarding task for ' + payload.name, '🤖', 'success');
    }

    if (triggerType === 'HEALTH_LOW' && rule.id === 'auto-3' && payload.healthScore < 60) {
      rule.runs++;
      if (userSpecificData[activeUserName]) {
        userSpecificData[activeUserName].tasks = userSpecificData[activeUserName].tasks || [];
        userSpecificData[activeUserName].tasks.unshift('🛡️ Urgent: Executive check-in with ' + payload.name);
      }
      showToast('🛡️ Automation Triggered: Executive retention alert for ' + payload.name, '⚠️', 'warning');
    }
  });

  saveLocalState();
}

function createNewRuleModal() {
  const title = prompt('Enter Automation Rule Name:', 'New Lead Auto-Assignment');
  if (!title) return;
  const trigger = prompt('Enter IF Trigger condition:', 'Lead Category equals Enterprise Tech');
  if (!trigger) return;
  const action = prompt('Enter THEN Action outcome:', 'Assign immediately to Senior Account Manager');
  if (!action) return;

  automationsList.push({
    id: 'auto-' + (automationsList.length + 1),
    title,
    trigger,
    action,
    active: true,
    runs: 0,
    icon: '✨'
  });

  saveLocalState();
  renderAutomations();
  showToast('Custom automation rule published', '✨', 'success');
}

