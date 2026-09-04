/* NovaCRM - 3D Motion, Physics & Ambient Mesh Engine */

// Universal 3D Card Tilt with Specular Glare & Multi-layer Depth
function init3DTiltPhysics() {
  const tiltSelectors = '.tilt-card-3d, .kpi-card, .report-kpi-card, .lead, .lead-card, .inbox-card, .automation-card, .account-register-card, .action-strip-btn, .people-card, .deal-stage-card';
  const tiltElements = document.querySelectorAll(tiltSelectors);

  tiltElements.forEach(card => {
    if (card.dataset.tiltActive) return;
    card.dataset.tiltActive = 'true';

    let glare = card.querySelector('.glare-layer');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'glare-layer';
      card.appendChild(glare);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9;
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) scale3d(1.025, 1.025, 1.025)';
      glare.style.opacity = '0.55';
      glare.style.background = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 65%)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      glare.style.opacity = '0';
    });
  });
}

// Interactive 3D Ambient Mesh Constellation
let ambientMeshInitialized = false;
function initAmbient3DMesh() {
  if (ambientMeshInitialized) return;
  const canvas = document.getElementById('ambient3DCanvas');
  if (!canvas) return;
  ambientMeshInitialized = true;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const numPoints = 42;
  const points = [];
  const focalLength = 320;

  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: (Math.random() - 0.5) * width * 1.2,
      y: (Math.random() - 0.5) * height * 1.2,
      z: Math.random() * 400 + 80,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2.2 + 1.2
    });
  }

  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / width - 0.5) * 2;
    mouseY = (e.clientY / height - 0.5) * 2;
    targetRotY = mouseX * 0.25;
    targetRotX = -mouseY * 0.25;
  });

  function render() {
    if (document.hidden) {
      requestAnimationFrame(render);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    currentRotX += (targetRotX - currentRotX) * 0.05;
    currentRotY += (targetRotY - currentRotY) * 0.05;

    const cosX = Math.cos(currentRotX);
    const sinX = Math.sin(currentRotX);
    const cosY = Math.cos(currentRotY);
    const sinY = Math.sin(currentRotY);

    const projected = [];
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const pointColor = isDark ? 'rgba(20, 184, 166, 0.45)' : 'rgba(13, 148, 136, 0.25)';
    const lineColor = isDark ? 'rgba(20, 184, 166, ' : 'rgba(13, 148, 136, ';

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      const boundX = width * 0.65;
      const boundY = height * 0.65;
      if (p.x < -boundX || p.x > boundX) p.vx *= -1;
      if (p.y < -boundY || p.y > boundY) p.vy *= -1;
      if (p.z < 60 || p.z > 480) p.vz *= -1;

      let x1 = p.x * cosY + p.z * sinY;
      let z1 = -p.x * sinY + p.z * cosY;
      let y1 = p.y * cosX - z1 * sinX;
      let z2 = p.y * sinX + z1 * cosX;

      if (z2 + focalLength <= 0) continue;

      const scale = focalLength / (focalLength + z2);
      const projX = width / 2 + x1 * scale;
      const projY = height / 2 + y1 * scale;
      const projRadius = Math.max(0.6, p.radius * scale);

      projected.push({ x: projX, y: projY, z: z2, scale: scale, radius: projRadius });

      ctx.beginPath();
      ctx.arc(projX, projY, projRadius, 0, Math.PI * 2);
      ctx.fillStyle = pointColor;
      ctx.fill();
    }

    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = projected[i].x - projected[j].x;
        const dy = projected[i].y - projected[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.16 * projected[i].scale;
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
          ctx.strokeStyle = lineColor + alpha + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  render();
}

// 3D Confetti Particle Explosion
function fire3DConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const particles = [];
  const colors = ['#14b8a6', '#0d9488', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'];

  for (let i = 0; i < 110; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 260,
      y: canvas.height * 0.45 + (Math.random() - 0.5) * 120,
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -16 - 5,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 16,
      gravity: 0.44,
      drag: 0.98,
      opacity: 1
    });
  }

  let animationFrame;
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008;

      if (p.opacity > 0 && p.y < canvas.height + 50) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
    });

    if (active) {
      animationFrame = requestAnimationFrame(render);
    } else {
      canvas.style.display = 'none';
      cancelAnimationFrame(animationFrame);
    }
  }
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAmbient3DMesh();
    init3DTiltPhysics();
  });
} else {
  initAmbient3DMesh();
  init3DTiltPhysics();
}
