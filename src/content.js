// Single source of all human-facing copy. This is the public showcase build,
// so it ships the depersonalized DEMO profile. (The private build swaps in a
// personal profile via the same toggle — VITE_DEMO / ?demo.)

const isDemo =
  import.meta.env.VITE_DEMO !== 'false'; // demo by default in the public repo

const DEMO = {
  variant: 'demo',
  title: 'A Weekend in Chicago 💌',
  metaDescription:
    'An interactive low-poly Chicago you can travel through — built with Three.js.',
  ogTitle: 'A Weekend in Chicago 💌',
  ogDescription: 'An interactive 3D trip — open the letter ✦',

  sealInitials: '★',
  sealHeart: '',
  toLine: '',
  envHint: 'click the envelope…',

  letter: {
    heading: 'Dear friend,',
    paragraphs: [
      'Some trips deserve to be more than ordinary.',
      'Come spend <b>August 14–15</b> in <b>Chicago</b> — deep-dish pizza, a boat ride under the skyline, the city lights from 1,000 feet up, and a surprise or two ✨',
      'So… what do you say?',
    ],
    signoff: 'See you there ✦',
    yes: 'Yes! ✨',
    no: 'No',
  },

  hud: {
    hint: 'the trip plays on its own — tap any bubble to jump around ✦',
    banner: '🎉 Day 2 — let the fun begin! 🎆',
    closing: [
      "That's the trip!",
      'Two days, one city.<br/>Thanks for exploring ✦',
    ],
    closingSign: '— built with Three.js 🤍',
    replay: '♥ Replay the trip',
    day2Chip: '8/15',
  },

  boatHullName: 'CHICAGO',
  partyHat: false,

  // neutral notes (real Chicago place names stay in itinerary.js)
  stopCopy: {
    hotel: { note: 'home base for the weekend 🗝️' },
    pizza: { note: "Chicago's legendary deep dish 🍕" },
    apple: { note: 'the shiniest little stop on the river' },
    boat: { note: 'the skyline from the water 🚤' },
    '360': { note: 'the whole city glowing, 1,000 ft down' },
    riverwalk: { note: 'a slow walk under the city lights' },
    hotelNight: { name: 'Back at the hotel', note: 'lights out before day two 💤' },
    pancakes: { note: 'a stack to start day two 🥞' },
    haircut: { name: 'iO Studio — fresh cut', note: 'a fresh cut, then back out ✂️' },
    cafe: { note: 'the prettiest café in the city ☕' },
    magmile: { note: 'a little shopping spree 🛍️' },
    volare: { note: 'dinner, Italian style 🥂' },
  },
};

// The public build has no personal profile — both resolve to the demo copy.
const PERSONAL = DEMO;

export const C = isDemo ? DEMO : PERSONAL;
export const IS_DEMO = isDemo;
