// The trip itinerary. Each stop (after the first) declares its travel leg as
// ordered segments: walk / boat / train / car, each with street waypoints.

export const STOPS = [
  {
    id: 'hotel',
    name: 'The River Hotel',
    emoji: '🏨',
    time: '',
    day: 1,
    sky: 'goldenHour',
    note: 'home base for the weekend 🗝️',
    pos: [-10, 9],
  },
  {
    id: 'pizza',
    name: "Lou Malnati's Pizzeria",
    emoji: '🍕',
    time: '',
    day: 1,
    sky: 'goldenHour',
    note: 'the legendary Chicago deep dish 🍕',
    pos: [6, -18], // stand at the pizzeria's entrance
    markerPos: [6, -23], // icon hovers over the building
    cameraOffset: [5, 17, 26], // frame from the open river side (south)
    eat: true,
    leg: [
      {
        mode: 'walk',
        points: [
          [-10, 9],
          [-6, 7],
          [0, 7],
          [0, -7],
          [3, -13],
          [6, -18],
        ],
      },
    ],
  },
  {
    id: 'apple',
    name: 'Apple Michigan Avenue',
    emoji: '🍎',
    logo: 'apple',
    time: '',
    day: 1,
    sky: 'dusk',
    note: 'the shiniest little stop on the river',
    pos: [6, -8],
    leg: [
      {
        mode: 'walk',
        points: [
          [6, -18],
          [6, -13],
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
    time: '',
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
    time: '',
    day: 1,
    sky: 'night',
    note: 'up on the observation deck, the whole city glowing below',
    pos: [5, -84],
    // ride the elevator up: stand on the tower's observation deck
    deck: [18, 76, -92],
    cameraOffset: [30, 8, 34],
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
    name: 'Riverwalk stroll',
    emoji: '🌙',
    time: '',
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
    name: 'Back at the hotel',
    emoji: '😴',
    time: '',
    day: 1,
    sky: 'night',
    note: 'lights out before day two 💤',
    pos: [-10, 9],
    indoors: true, // asleep inside the hotel, they come back out next morning
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
    time: '',
    day: 2,
    sky: 'morning',
    note: 'a stack to start day two 🥞',
    pos: [7, 32],
    eat: true,
    leg: [
      {
        // a fresh celebration morning, stepping out of the hotel
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
    id: 'navypier',
    name: 'Navy Pier',
    emoji: '🎡',
    time: '',
    day: 2,
    sky: 'day',
    note: 'up and around on the Ferris wheel 🎡',
    pos: [76, -16], // the wheel, camera frames it while they ride
    ride: 'ferris',
    cameraOffset: [-34, 15, 33],
    leg: [
      {
        // stroll down Michigan, over the river, east along Wacker to the pier
        mode: 'walk',
        points: [
          [7, 32],
          [7, 8],
          [0, 7],
          [0, -7],
          [20, -7],
          [40, -7],
          [44, -11],
          [46, -14],
        ],
      },
    ],
  },
  {
    id: 'cafe',
    name: '3 Arts Club Café at RH',
    emoji: '🌸',
    time: '',
    day: 2,
    sky: 'day',
    note: 'an Uber across town ☕',
    pos: [-42, -120],
    eat: true,
    leg: [
      {
        // long Uber ride back west and up to the Gold Coast
        mode: 'car',
        points: [
          [46, -14],
          [30, -7],
          [0, -7],
          [-45, -7],
          [-45, -40],
          [-45, -78],
          [-45, -110],
          [-42, -120],
        ],
      },
    ],
  },
  {
    id: 'magmile',
    name: 'Magnificent Mile',
    emoji: '🛍️',
    time: '',
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
    time: '',
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

// Finale: after dinner, one last walk back to the Riverwalk at sunset ,
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

export const CELEBRATION_STOP_INDEX = 7; // fires when departing the hotel the next morning
