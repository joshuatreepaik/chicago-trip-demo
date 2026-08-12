// Single source of truth for the stylized downtown layout.
// Coordinates: XZ ground plane, +x = east, -z = north.
// Origin = DuSable Bridge (Michigan Ave × Chicago River). ~1 unit : 12 m.

export const ROAD_WIDTH = 3;

// Vertical (north-south) streets: x position, z from..to
export const V_STREETS = [
  { name: 'Michigan', x: 0, from: -140, to: 40 },
  { name: 'Wabash', x: -15, from: -60, to: 40 },
  { name: 'State', x: -30, from: -140, to: 40 },
  { name: 'Dearborn', x: -45, from: -140, to: 40 },
  { name: 'Clark', x: -60, from: -100, to: 40 },
  { name: 'LaSalle', x: -75, from: -100, to: 40 },
  { name: 'Wells', x: -90, from: -78, to: 40 },
  { name: 'Franklin', x: -105, from: -78, to: 20 },
];

// Horizontal (east-west) streets: z position, x from..to
export const H_STREETS = [
  { name: 'WackerS', z: 7, from: -120, to: 45 },
  { name: 'WackerN', z: -7, from: -120, to: 45 },
  { name: 'Grand', z: -32, from: -110, to: 40 },
  { name: 'Ontario', z: -46, from: -110, to: 10 },
  { name: 'ChicagoAve', z: -78, from: -135, to: 12 },
  { name: 'Oak', z: -112, from: -60, to: 12 },
  { name: 'Division', z: -130, from: -60, to: 0 },
  { name: 'Lake', z: 18, from: -110, to: 40 },
  { name: 'Randolph', z: 34, from: -110, to: 40 },
];

// Chicago River: main branch band along z ∈ [-4, 4]
export const RIVER = { zMin: -4, zMax: 4, xMin: -122, xMax: 46 };
// North/south branch stubs at Wolf Point (decorative)
export const RIVER_BRANCHES = [
  { xMin: -122, xMax: -114, zMin: -70, zMax: -4 },
  { xMin: -122, xMax: -114, zMin: 4, zMax: 42 },
];
// Lake Michigan east of x = 46, oversized so the horizon is always water
export const LAKE = { xMin: 46, xMax: 280, zMin: -280, zMax: 200 };

// Millennium Park green patch (with a tiny Bean!)
export const PARK = { x: 14, z: 28, w: 22, d: 16 };

// Riverwalk promenade on the south bank
export const RIVERWALK = { xMin: -110, xMax: 40, zMin: 4, zMax: 6.2 };

// Landmark anchor points (decorative meshes)
export const LANDMARKS = {
  hancock: [14, -92],
  marinaA: [-33, -11],
  marinaB: [-25, -11],
  wrigley: [-5, -10],
  tribune: [14, -13],
  hotel: [-13, 14],
  bean: [14, 28],
  boatDock: [-18, 1],
  apple: [13, -6],
  artsClub: [-37, -125],
  lou: [6, -23],
  volare: [26, -25],
  starbucks: [-8, -62],
};

// Zones where generic buildings must NOT spawn: [x, z, radius]
export const EXCLUSIONS = [
  // landmark clearings
  [14, -92, 12],
  [-29, -11, 11],
  [-5, -10, 7],
  [14, -13, 7],
  [-13, 14, 8],
  [14, 28, 14],
  [13, -6, 7],
  [-37, -125, 9],
  [6, -23, 6],
  [26, -25, 6],
  [-8, -62, 8],
];

export const MAP_BOUNDS = { xMin: -135, xMax: 44, zMin: -138, zMax: 42 };

// Elevated "L" track: runs above Lake St then up an alley by Wells,
// rendered at TRACK_Y (the authentic Loop look, track over the street)
export const TRACK_Y = 6;
export const L_TRACK = [
  [22, 18],
  [5, 18],
  [-60, 18],
  [-84, 18],
  [-87, 14],
  [-87, -40],
  [-87, -74],
  [-87, -84],
];
export const L_STATIONS = [
  { name: 'Millennium', pos: [16, 18] },
  { name: 'ChicagoAve', pos: [-87, -78] },
];

// bascule drawbridges: every street crossing the river, the deck halves
// swing up when the tour boat approaches, Chicago style
export const BRIDGE_XS = [0, -15, -30, -45, -60, -75, -90, -105];

