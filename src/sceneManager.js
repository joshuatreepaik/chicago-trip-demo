const els = {
  envelope: document.getElementById('envelope-scene'),
  letter: document.getElementById('letter-scene'),
  map: document.getElementById('map-scene'),
};

let current = null;

export function initSceneManager() {
  goTo('envelope');
  return { goTo, current: () => current };
}

export function goTo(name) {
  if (current === name) return;
  if (current) els[current].classList.remove('active');
  els[name].classList.add('active');
  current = name;
}
