// The runaway "No" button. It drifts away whenever the cursor gets close,
// so it can never actually be clicked.

const FLEE_RADIUS = 130;
const PAD = 24;

const LABELS = [
  'No',
  'Are you sure? 🥺',
  'Really really?',
  'Nope, try again 😌',
  'The other button is nicer 👉',
];

export function makeDodgeButton(btn, { isActive, onAttempt }) {
  const state = { x: 0, y: 0, tx: 0, ty: 0, fleeing: false };
  let attempts = 0;

  function beginFlee() {
    const rect = btn.getBoundingClientRect();
    state.x = state.tx = rect.left + rect.width / 2;
    state.y = state.ty = rect.top + rect.height / 2;
    // a transformed ancestor (the tilted letter card) would hijack
    // position:fixed, so the fleeing button must live on <body>
    document.body.appendChild(btn);
    btn.classList.add('fleeing');
    state.fleeing = true;
    render();
    tick();
  }

  function render() {
    const rect = { w: btn.offsetWidth, h: btn.offsetHeight };
    btn.style.transform = `translate(${state.x - rect.w / 2}px, ${state.y - rect.h / 2}px)`;
  }

  function tick() {
    state.x += (state.tx - state.x) * 0.16;
    state.y += (state.ty - state.y) * 0.16;
    render();
    requestAnimationFrame(tick);
  }

  function dodgeFrom(px, py) {
    const dx = state.tx - px;
    const dy = state.ty - py;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist >= FLEE_RADIUS) return;

    let fx = dx / dist;
    let fy = dy / dist;
    const strength = (FLEE_RADIUS - dist) / FLEE_RADIUS;
    const jump = 90 + 130 * strength;
    // tangential jitter so the path curves and feels alive
    const ang = (Math.random() - 0.5) * 1.2;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    [fx, fy] = [fx * cos - fy * sin, fx * sin + fy * cos];

    state.tx += fx * jump;
    state.ty += fy * jump;

    const w = btn.offsetWidth;
    const h = btn.offsetHeight;
    const minX = PAD + w / 2;
    const maxX = window.innerWidth - PAD - w / 2;
    const minY = PAD + h / 2;
    const maxY = window.innerHeight - PAD - h / 2;
    const clampedX = state.tx <= minX || state.tx >= maxX;
    const clampedY = state.ty <= minY || state.ty >= maxY;
    state.tx = Math.min(maxX, Math.max(minX, state.tx));
    state.ty = Math.min(maxY, Math.max(minY, state.ty));

    // cornered on both axes: teleport to the quadrant farthest from the cursor
    if (clampedX && clampedY) {
      state.tx =
        px < window.innerWidth / 2
          ? window.innerWidth * (0.65 + Math.random() * 0.15)
          : window.innerWidth * (0.2 + Math.random() * 0.15);
      state.ty =
        py < window.innerHeight / 2
          ? window.innerHeight * (0.65 + Math.random() * 0.15)
          : window.innerHeight * (0.2 + Math.random() * 0.15);
    }
  }

  window.addEventListener('mousemove', (e) => {
    if (!isActive()) return;
    if (!state.fleeing) {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (Math.hypot(cx - e.clientX, cy - e.clientY) > FLEE_RADIUS) return;
      beginFlee();
    }
    dodgeFrom(e.clientX, e.clientY);
  });

  window.addEventListener(
    'touchstart',
    (e) => {
      if (!isActive()) return;
      const t = e.touches[0];
      if (!t) return;
      if (!state.fleeing) {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        if (Math.hypot(cx - t.clientX, cy - t.clientY) > FLEE_RADIUS) return;
        beginFlee();
      }
      dodgeFrom(t.clientX, t.clientY);
      attempts++;
      if (attempts >= 3) {
        btn.style.opacity = '0.45';
        btn.style.scale = '0.8';
      }
    },
    { passive: true }
  );

  // belt-and-suspenders: a forced click never proceeds
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    attempts++;
    btn.textContent = LABELS[Math.min(attempts, LABELS.length - 1)];
    onAttempt?.(attempts);
  });

  // keyboard can't tab onto it either
  btn.addEventListener('focus', () => btn.blur());
}
