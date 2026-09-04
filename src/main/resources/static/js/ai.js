// ========================================================
// NovaCRM — AI Deal Copilot & Intelligence Engine
// Deal risk diagnostics, AI recovery drafter & audio telemetry
// ========================================================

function analyzeDealHealth(lead) {
  if (!lead) return { riskScore: 0, level: 'Low', badge: 'Optimal', recommendation: 'Deal pacing on track.' };

  const stall = parseInt(lead.stallDays) || 0;
  let riskScore = Math.min(100, Math.max(10, (stall * 7) + (100 - lead.probability) * 0.35));
  if (lead.stage === 'Closed Won') riskScore = 0;

  let level = 'Low';
  let badgeClass = 'risk-low';
  let recommendation = 'Pacing steadily toward target close date.';

  if (riskScore >= 65) {
    level = 'Critical Risk';
    badgeClass = 'risk-critical';
    recommendation = 'Stagnant for ' + stall + 'd without touchpoint. Recommended: Execute executive escalation or revival pitch.';
  } else if (riskScore >= 40) {
    level = 'Moderate Warning';
    badgeClass = 'risk-med';
    recommendation = 'Moderate stall (' + stall + 'd). Recommended: Schedule mid-cycle technical alignment demo.';
  }

  return {
    riskScore: Math.round(riskScore),
    level,
    badgeClass,
    recommendation
  };
}

function generateAIRecoveryPitch(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;

  const subject = 'Re: Strategic roadmap & SLA alignment — ' + lead.name;
  const body = 'Hi ' + (lead.contact.split(' ')[0] || 'there') + ',\n\nI was reviewing our technical scoping notes regarding ' + lead.name + '\'s roadmap for Q3. Based on our discussions around ' + lead.tag + ', our engineering team has reserved deployment capacity for your core roll-out.\n\nKey highlights from our proposed architecture:\n• Guaranteed 99.99% uptime with 24/7 dedicated enterprise response\n• Pre-configured integration modules tailored for your operational stack\n• Dedicated migration engineer assigned for day-one onboarding\n\nWould 15 minutes this Thursday or Friday work to review the updated terms?\n\nWarm regards,\n' + activeUserName + '\nSenior Account Manager · NovaCRM';

  if (typeof closeDealDetails === 'function') closeDealDetails();
  if (typeof openEmailModal === 'function') {
    openEmailModal(lead.id);
    const subjInput = document.getElementById('emailSubject');
    const bodyInput = document.getElementById('emailBody');
    const recipInput = document.getElementById('emailRecipientInput');

    if (subjInput) subjInput.value = subject;
    if (bodyInput) bodyInput.value = body;
    if (recipInput) recipInput.value = lead.email;
  }

  showToast('AI Recovery Pitch tailored for ' + lead.name, '🤖', 'success');
}

let waveformAnimId = null;

function renderCallWaveform(canvasId = 'callWaveformCanvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const numBars = 36;
  let phase = 0;

  if (waveformAnimId) cancelAnimationFrame(waveformAnimId);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / numBars) - 2;

    for (let i = 0; i < numBars; i++) {
      const heightMultiplier = Math.sin(phase + (i * 0.35)) * 0.45 + 0.55;
      const barHeight = Math.max(4, heightMultiplier * (canvas.height - 6));
      const x = i * (barWidth + 2);
      const y = (canvas.height - barHeight) / 2;

      // Color gradient
      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, 'var(--accent, #0d9488)');
      grad.addColorStop(1, 'var(--green, #10b981)');

      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 3);
      ctx.fill();
    }
    phase += 0.08;
    waveformAnimId = requestAnimationFrame(draw);
  }
  draw();
}

function stopCallWaveform() {
  if (waveformAnimId) {
    cancelAnimationFrame(waveformAnimId);
    waveformAnimId = null;
  }
}

