import { makeDodgeButton } from './dodge.js';
import { C } from './content.js';

export function initLetter({ onYes }) {
  const root = document.getElementById('letter-scene');
  root.innerHTML = `
    <div class="hearts-bg"></div>
    <div class="letter-card">
      <h1>${C.letter.heading}</h1>
      ${C.letter.paragraphs.map((p) => `<p>${p}</p>`).join('\n      ')}
      <div class="sign">${C.letter.signoff}</div>
      <div class="letter-buttons">
        <button class="btn-yes">${C.letter.yes}</button>
        <button class="btn-no">${C.letter.no}</button>
      </div>
    </div>
  `;

  // floating hearts drifting up behind the letter
  const heartsBg = root.querySelector('.hearts-bg');
  const symbols = ['💗', '💕', '🌸', '✨', '💖', '🤍'];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('span');
    s.textContent = symbols[i % symbols.length];
    s.style.left = `${Math.random() * 100}%`;
    s.style.fontSize = `${14 + Math.random() * 26}px`;
    s.style.animationDuration = `${7 + Math.random() * 8}s`;
    s.style.animationDelay = `${-Math.random() * 14}s`;
    s.style.setProperty('--sway', `${(Math.random() - 0.5) * 120}px`);
    heartsBg.appendChild(s);
  }

  const yesBtn = root.querySelector('.btn-yes');
  const noBtn = root.querySelector('.btn-no');

  makeDodgeButton(noBtn, {
    isActive: () => root.classList.contains('active'),
    onAttempt: (attempts) => {
      yesBtn.style.transform = `scale(${1 + Math.min(attempts, 6) * 0.08})`;
    },
  });

  let accepted = false;
  yesBtn.addEventListener('click', () => {
    if (accepted) return;
    accepted = true;
    noBtn.remove();
    heartBurst(yesBtn);
    setTimeout(onYes, 650);
  });
}

function heartBurst(fromEl) {
  const rect = fromEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const emojis = ['💗', '💖', '💘', '💝', '✨'];
  for (let i = 0; i < 22; i++) {
    const span = document.createElement('span');
    span.className = 'heart-bit';
    span.textContent = emojis[i % emojis.length];
    const ang = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 160;
    span.style.left = `${cx}px`;
    span.style.top = `${cy}px`;
    span.style.setProperty('--hx', `${Math.cos(ang) * dist}px`);
    span.style.setProperty('--hy', `${Math.sin(ang) * dist - 60}px`);
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 1100);
  }
}
