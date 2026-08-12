// Single source of all human-facing copy. This is the public showcase build,
// so it ships the depersonalized DEMO profile. (The private build swaps in a
// personal profile via the same toggle, VITE_DEMO / ?demo.)

const isDemo =
  import.meta.env.VITE_DEMO !== 'false'; // demo by default in the public repo

const DEMO = {
  variant: 'demo',
  title: 'A Weekend in Chicago 💌',
  metaDescription:
    'An interactive low poly Chicago you can travel through, built with Three.js.',
  ogTitle: 'A Weekend in Chicago 💌',
  ogDescription: 'An interactive 3D trip. open the letter ✦',

  sealInitials: '★',
  sealHeart: '',
  toLine: '',
  envHint: 'click the envelope…',

  letter: {
    heading: 'Dear friend,',
    paragraphs: [
      'Some trips deserve to be more than ordinary.',
      'Come spend a weekend in <b>Chicago</b>: deep dish pizza, a boat ride under the skyline, the city lights from 1,000 feet up, and a surprise or two ✨',
      'So… what do you say?',
    ],
    signoff: 'See you there ✦',
    yes: 'Yes! ✨',
    no: 'No',
  },

  // no schedule shown; hides the info-card time and the date chip
  showSchedule: false,

  hud: {
    hint: 'the trip plays on its own, tap any bubble to jump around ✦',
    banner: '✨ the city lights up 🎆',
    finaleBanner: '✦ thank you for visiting ✦',
    closing: [
      'Thanks for exploring!',
      'A little interactive Chicago,<br/>built in the browser ✦',
    ],
    closingSign:
      'Built by <a href="https://github.com/joshuatreepaik" target="_blank" rel="noopener">Josh</a>',
    replay: '♥ Replay the trip',
    day2Chip: '',
  },

  boatHullName: 'CHICAGO',
  partyHat: false,

  // neutral notes (real Chicago place names stay in itinerary.js)
  stopCopy: {
    hotel: { name: 'The hotel', note: 'home base for the weekend 🗝️' },
    pizza: { note: 'the legendary Chicago deep dish 🍕' },
    apple: { note: 'the shiniest little stop on the river' },
    boat: { note: 'the skyline from the water 🚤' },
    '360': { note: 'up on the deck, the whole city glowing below' },
    riverwalk: { note: 'a slow walk under the city lights' },
    hotelNight: { name: 'Back at the hotel', note: 'lights out before day two 💤' },
    pancakes: { note: 'a stack to start the day 🥞' },
    navypier: { name: 'Navy Pier', note: 'up and around on the Ferris wheel 🎡' },
    cafe: { note: 'the prettiest café in the city ☕' },
    magmile: { name: 'Magnificent Mile', note: 'a little shopping spree 🛍️' },
    volare: { note: 'dinner, Italian style 🥂' },
  },
};

// The public build has no personal profile, both resolve to the demo copy.
const PERSONAL = DEMO;

export const C = isDemo ? DEMO : PERSONAL;
export const IS_DEMO = isDemo;
