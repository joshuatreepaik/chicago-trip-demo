// DOM overlay: day chip, stop info card, playback controls, dot rail,
// celebration banner, and the closing letter card.
import { STOPS } from './itinerary.js';
import { appleLogoCanvas, tourBoatCanvas } from './sprites.js';
import { C } from '../content.js';

const CARD_LOGOS = {
  apple: appleLogoCanvas(80, '#3a3a3c').toDataURL(),
  boat: tourBoatCanvas(96).toDataURL(),
};

export function buildHud(root, { onPrev, onNext, onTogglePlay, onJump, onReplay }) {
  root.innerHTML = `
    <div class="day-chip"></div>
    <div class="info-card">
      <div class="ic-emoji"></div>
      <div>
        <div class="ic-time"></div>
        <div class="ic-title"></div>
        <div class="ic-note"></div>
      </div>
    </div>
    <div class="map-controls">
      <button class="mc-prev" title="previous stop">⏮</button>
      <button class="mc-play" title="pause">⏸</button>
      <button class="mc-next" title="next stop">⏭</button>
    </div>
    <div class="dot-rail"></div>
    <div class="map-hint">${C.hud.hint}</div>
    <div class="bday-banner">${C.hud.banner}</div>
    <div class="closing-card">
      ${C.hud.closing.map((p) => `<p>${p}</p>`).join('\n      ')}
      <div class="sign">${C.hud.closingSign}</div>
      <button class="btn-replay">${C.hud.replay}</button>
    </div>
  `;

  const hint = root.querySelector('.map-hint');

  const dayChip = root.querySelector('.day-chip');
  const card = root.querySelector('.info-card');
  const cardEmoji = root.querySelector('.ic-emoji');
  const cardTime = root.querySelector('.ic-time');
  const cardTitle = root.querySelector('.ic-title');
  const cardNote = root.querySelector('.ic-note');
  const playBtn = root.querySelector('.mc-play');
  const banner = root.querySelector('.bday-banner');
  const closing = root.querySelector('.closing-card');
  const rail = root.querySelector('.dot-rail');

  STOPS.forEach((s, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.title = C.stopCopy[s.id]?.name ?? s.name;
    dot.addEventListener('click', () => onJump(i));
    rail.appendChild(dot);
  });
  const dots = [...rail.children];

  root.querySelector('.mc-prev').addEventListener('click', onPrev);
  root.querySelector('.mc-next').addEventListener('click', onNext);
  playBtn.addEventListener('click', onTogglePlay);
  root.querySelector('.btn-replay').addEventListener('click', onReplay);

  let hintShown = false;
  return {
    showHint() {
      if (hintShown) return;
      hintShown = true;
      setTimeout(() => hint.classList.add('show'), 1200);
      setTimeout(() => hint.classList.remove('show'), 9500);
    },
    showStop(stop) {
      if (CARD_LOGOS[stop.logo]) {
        cardEmoji.innerHTML = `<img src="${CARD_LOGOS[stop.logo]}" alt="" style="width:44px;height:44px;display:block" />`;
      } else {
        cardEmoji.textContent = stop.emoji;
      }
      const copy = C.stopCopy[stop.id] || {};
      cardTime.textContent = C.showSchedule === false ? '' : stop.time;
      cardTitle.textContent = copy.name ?? stop.name;
      cardNote.textContent = copy.note ?? stop.note;
      card.classList.add('show');
    },
    hideCard() {
      card.classList.remove('show');
    },
    setDay(day) {
      if (C.showSchedule === false) {
        dayChip.style.display = 'none';
        return;
      }
      dayChip.textContent = day === 1 ? '' : C.hud.day2Chip;
    },
    setCurrentDot(i) {
      dots.forEach((d, j) => {
        d.classList.toggle('current', j === i);
        d.classList.toggle('done', j < i);
      });
    },
    setPlaying(playing) {
      playBtn.textContent = playing ? '⏸' : '▶';
      playBtn.title = playing ? 'pause' : 'play';
    },
    showBanner({ sticky = false, text } = {}) {
      banner.textContent = text ?? C.hud.banner;
      banner.classList.add('show');
      if (!sticky) setTimeout(() => banner.classList.remove('show'), 7000);
    },
    hideBanner() {
      banner.classList.remove('show');
    },
    showClosing() {
      closing.classList.add('show');
    },
    hideClosing() {
      closing.classList.remove('show');
    },
  };
}
