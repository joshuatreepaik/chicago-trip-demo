// The trip itinerary. Each stop (after the first) declares its travel leg as
// ordered segments: walk / boat / train / car, each with street waypoints.

export const STOPS = [
  {
    id: 'hotel',
    name: 'The River Hotel — check-in',
    emoji: '🏨',
    time: '8/14 · 5:00 PM',
    day: 1,
    sky: 'goldenHour',
    note: 'home base for the weekend 🗝️',
    pos: [-10, 9],
  },
  {
    id: 'pizza',
    name: "Lou Malnati's Pizzeria",
    emoji: '🍕',
    time: '8/14 · 5:30 PM',
    day: 1,
    sky: 'goldenHour',
    note: 'the legendary Chicago deep dish 🍕',
    pos: [-3, -16],
    eat: true,
    leg: [
      {
        mode: 'walk',
        points: [
          [-10, 9],
          [-6, 7],
          [0, 7],
          [0, -10],
          [-3, -16],
        ],
      },
    ],
  },
  {
    id: 'apple',
    name: 'Apple Michigan Avenue',
    emoji: '🍎',
    logo: 'apple',
    time: '8/14 · 7:00 PM',
    day: 1,
    sky: 'dusk',
    note: 'the shiniest little stop on the river',
    pos: [6, -8],
    leg: [
      {
        mode: 'walk',
        points: [
          [-3, -16],
          [0, -13],
          [2, -9],
          [6, -8],
        ],
      },
    ],
  },
  {
    id: 'boat',
    name: 'Architecture Boat Tour',
    emoji: '🚤',
    logo: 'boat',
    time: '8/14 · 7:30 PM',
    day: 1,
    sky: 'dusk',
    note: 'the skyline from the water 🚤',
    pos: [-16, 5],
    leg: [
      {
        mode: 'walk',
        points: [
          [6, -8],
          [1, -7],
          [0, 0],
          [0, 5],
          [-10, 5],
          [-16, 5],
        ],
      },
    ],
  },
  {
    id: '360',
    name: '360 CHICAGO Observation Deck',
    emoji: '🌃',
    time: '8/14 · 9:45 PM',
    day: 1,
    sky: 'night',
    note: 'the whole city glowing, 1,000 ft down',
    pos: [5, -84],
    cameraOffset: [-28, 44, 30],
    leg: [
      {
        // cruise east out onto Lake Michigan, loop back, then all the way
        // west past Wolf Point before returning to the dock
        mode: 'boat',
        points: [
          [-18, 1],
          [-5, 1],
          [10, 0],
          [30, -1],
          [55, -2],
          [75, -4],
          [90, 0],
          [80, 5],
          [60, 3],
          [35, 1],
          [5, 0],
          [-30, 0],
          [-70, -1],
          [-105, 0],
          [-85, 1],
          [-50, 0],
          [-25, 1],
          [-18, 1],
        ],
      },
      {
        mode: 'walk',
        points: [
          [-16, 5],
          [0, 6],
          [0, -40],
          [0, -80],
          [5, -84],
        ],
      },
    ],
  },
  {
    id: 'riverwalk',
    name: 'Riverwalk — late night walk',
    emoji: '🌙',
    time: '8/14 · 11:00 PM',
    day: 1,
    sky: 'night',
    note: 'a slow walk under the city lights',
    pos: [-45, 4.9],
    // they actually take the walk: a slow stroll west along the promenade
    stroll: [
      [-45, 4.9],
      [-56, 5.2],
      [-68, 4.8],
      [-80, 5.2],
      [-92, 4.9],
      [-102, 5],
    ],
    leg: [
      {
        mode: 'walk',
        points: [
          [5, -84],
          [1, -78],
          [0, -40],
          [0, 5],
          [-20, 4.9],
          [-45, 4.9],
        ],
      },
    ],
  },
  {
    id: 'hotelNight',
    name: 'Back at the hotel — good night',
    emoji: '😴',
    time: '8/14 · 11:45 PM',
    day: 1,
    sky: 'night',
    note: 'lights out before day two 💤',
    pos: [-10, 9],
    leg: [
      {
        // back east along the promenade to the hotel
        mode: 'walk',
        points: [
          [-102, 5],
          [-80, 4.9],
          [-56, 5.2],
          [-30, 5],
          [-16, 6],
          [-10, 7],
          [-10, 9],
        ],
      },
    ],
  },
  {
    id: 'pancakes',
    name: 'Wildberry Pancakes & Café',
    emoji: '🥞',
    time: '8/15 · 8:00 AM',
    day: 2,
    sky: 'morning',
    note: 'a stack to start day two 🥞',
    pos: [7, 32],
    eat: true,
    leg: [
      {
        // a fresh celebration morning — stepping out of the hotel
        mode: 'walk',
        points: [
          [-10, 9],
          [-6, 7],
          [0, 7],
          [0, 20],
          [0, 32],
          [7, 32],
        ],
      },
    ],
  },
  {
    id: 'haircut',
    name: 'iO Studio — salon',
    emoji: '💇‍♀️',
    time: '8/15 · 11:00 AM',
    day: 2,
    sky: 'morning',
    note: 'riding the L across town ✂️',
    pos: [-128, -76],
    leg: [
      {
        mode: 'walk',
        points: [
          [7, 32],
          [10, 28],
          [14, 24],
          [15, 20],
        ],
      },
      {
        mode: 'train',
        points: [
          [16, 18],
          [-40, 18],
          [-84, 18],
          [-87, 14],
          [-87, -40],
          [-87, -78],
        ],
      },
      {
        mode: 'walk',
        points: [
          [-87, -78],
          [-100, -77],
          [-114, -77],
          [-128, -76],
        ],
      },
    ],
  },
  {
    id: 'cafe',
    name: '3 Arts Club Café at RH',
    emoji: '🌸',
    time: '8/15 · 1:00 PM',
    day: 2,
    sky: 'day',
    note: 'an Uber across town ☕',
    pos: [-42, -120],
    eat: true,
    leg: [
      {
        mode: 'car',
        points: [
          [-128, -76],
          [-110, -78],
          [-60, -78],
          [-45, -78],
          [-45, -100],
          [-45, -118],
          [-42, -120],
        ],
      },
    ],
  },
  {
    id: 'magmile',
    name: 'Magnificent Mile — Sephora & Starbucks Reserve',
    emoji: '🛍️',
    time: '8/15 · 2:30 PM',
    day: 2,
    sky: 'day',
    note: 'a little shopping spree 🛍️',
    pos: [3, -54],
    leg: [
      {
        mode: 'walk',
        points: [
          [-42, -120],
          [-45, -110],
          [-45, -78],
          [-20, -78],
          [0, -78],
          [0, -60],
          [3, -54],
        ],
      },
    ],
  },
  {
    id: 'volare',
    name: 'Volare Ristorante Italiano',
    emoji: '🍝',
    time: '8/15 · 4:45 PM',
    day: 2,
    sky: 'day',
    note: 'dinner, Italian style 🥂',
    pos: [24, -32],
    eat: true,
    leg: [
      {
        mode: 'walk',
        points: [
          [3, -54],
          [0, -50],
          [0, -36],
          [4, -32],
          [14, -32],
          [24, -32],
        ],
      },
    ],
  },
];

// Finale: after dinner, one last walk back to the Riverwalk at sunset —
// then the camera turns to the lake for fireworks in the sky.
export const FINALE_WAYPOINTS = [
  [24, -32],
  [10, -32],
  [0, -28],
  [0, -8],
  [0, 5],
  [-20, 5],
  [-38, 5],
];

export const CELEBRATION_STOP_INDEX = 7; // fires when departing the hotel on 8/15 morning
