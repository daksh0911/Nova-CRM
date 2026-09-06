// ========================================================
// NovaCRM — Interactive Proposal & PDF Quote Generator
// Digital signature canvas, dynamic discount slider & print export
// ========================================================

let currentQuoteLead = null;
let signatureDrawing = false;

function openQuoteModal(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  currentQuoteLead = lead;

  const modal = document.getElementById('quoteModal');
  if (!modal) return;

  const titleEl = document.getElementById('quoteModalTitle');
  const clientEl = document.getElementById('quoteClientName');
  const contactEl = document.getElementById('quoteContactName');
  const quoteIdEl = document.getElementById('quoteDocId');

  if (titleEl) titleEl.textContent = 'Executive Proposal Quote — ' + lead.name;
  if (clientEl) clientEl.textContent = lead.name;
  if (contactEl) contactEl.textContent = lead.contact + ' (' + lead.email + (lead.phone ? ' · ' + lead.phone : '') + ')';
  if (quoteIdEl) quoteIdEl.textContent = 'PROPOSAL-QT-' + Math.floor(10000 + Math.random() * 90000);

  const discountSlider = document.getElementById('quoteDiscountSlider');
  if (discountSlider) discountSlider.value = 5;

  recalculateQuote(5);
  initSignaturePad();
  modal.classList.add('open');
}

function closeQuoteModal() {
  const modal = document.getElementById('quoteModal');
  if (modal) modal.classList.remove('open');
}

function recalculateQuote(discountPct = 5) {
  if (!currentQuoteLead) return;
  const rawBase = currentQuoteLead.value || 50000;
  const pct = parseInt(discountPct) || 0;

  const discountValEl = document.getElementById('quoteDiscountLabel');
  if (discountValEl) discountValEl.textContent = pct + '% Discount';

  const p1 = Math.round(rawBase * 0.65);
  const p2 = Math.round(rawBase * 0.25);
  const p3 = rawBase - p1 - p2;

  const subtotal = rawBase;
  const discountAmount = Math.round(subtotal * (pct / 100));
  const afterDiscount = subtotal - discountAmount;
  const tax = Math.round(afterDiscount * 0.0825);
  const total = afterDiscount + tax;

  const setHtml = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = money(val);
  };

  setHtml('quoteItem1Price', p1);
  setHtml('quoteItem2Price', p2);
  setHtml('quoteItem3Price', p3);
  setHtml('quoteSubtotal', subtotal);
  setHtml('quoteDiscountAmount', -discountAmount);
  setHtml('quoteTaxAmount', tax);
  setHtml('quoteGrandTotal', total);
}

function initSignaturePad() {
  const canvas = document.getElementById('signaturePadCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#0d9488';

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  canvas.onmousedown = (e) => {
    signatureDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  canvas.onmousemove = (e) => {
    if (!signatureDrawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  window.onmouseup = () => { signatureDrawing = false; };

  // Touch support
  canvas.ontouchstart = (e) => {
    e.preventDefault();
    signatureDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  canvas.ontouchmove = (e) => {
    e.preventDefault();
    if (!signatureDrawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  canvas.ontouchend = () => { signatureDrawing = false; };
}

function clearSignaturePad() {
  const canvas = document.getElementById('signaturePadCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function printProposalQuote() {
  window.print();
}

function saveProposalQuote() {
  if (!currentQuoteLead) return;
  if (typeof addAuditLog === 'function') {
    addAuditLog({
      category: 'PIPELINE',
      action: 'generated digital proposal quote for ' + currentQuoteLead.name + ' (' + money(currentQuoteLead.value) + ').',
      target: currentQuoteLead.id,
      icon: '📄'
    });
  }
  closeQuoteModal();
  showToast('Executive proposal quote saved and dispatched!', '📄', 'success');
}

