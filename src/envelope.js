import { C } from './content.js';

export function initEnvelope({ onOpen }) {
  const root = document.getElementById('envelope-scene');
  root.innerHTML = `
    <div class="env-wrap">
      <div class="envelope" id="envelope">
        <div class="env-back"></div>
        <div class="env-letter">
          <div class="env-emoji">💌</div>
          ${C.toLine ? `<div>${C.toLine}</div>` : ''}
        </div>
        <div class="env-pocket"></div>
        <div class="env-flap"></div>
        <div class="env-seal">${C.sealHeart ? '<span class="seal-heart"></span>' : ''}<span class="seal-initials">${C.sealInitials}</span></div>
      </div>
      <p class="env-hint">${C.envHint}</p>
    </div>
  `;

  const envelope = root.querySelector('#envelope');
  let opened = false;

  envelope.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    envelope.classList.add('open');
    root.querySelector('.env-hint').style.opacity = '0';
    setTimeout(onOpen, 1500);
  });
}
