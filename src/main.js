import './style.css';
import { initSceneManager } from './sceneManager.js';
import { initEnvelope } from './envelope.js';
import { initLetter } from './letter.js';
import { createAudio } from './audio.js';
import { MapScene } from './map/index.js';
import { C } from './content.js';

// in-page title + description follow the active variant (the static <head>
// og/twitter tags are set at build time via index.html env placeholders)
document.title = C.title;
document
  .querySelector('meta[name="description"]')
  ?.setAttribute('content', C.metaDescription);

const scenes = initSceneManager();
const audio = createAudio();
const map = new MapScene(
  document.getElementById('map-canvas'),
  document.getElementById('hud'),
  audio
);

initEnvelope({
  onOpen: () => {
    audio.ensure();
    audio.playLetterMusic();
    audio.showButton();
    scenes.goTo('letter');
    map.preload();
  },
});

initLetter({
  onYes: () => {
    scenes.goTo('map');
    audio.playMapMusic();
    map.start();
  },
});

// dev shortcut: jump straight to the map with #map
if (location.hash === '#map') {
  scenes.goTo('map');
  map.start();
}
