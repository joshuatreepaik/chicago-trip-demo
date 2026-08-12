# A Weekend in Chicago — interactive 3D trip

An interactive, hand-built low-poly Chicago you can travel through, right in the
browser. Open a wax-sealed envelope, read the invitation, and set off on a
two-day trip narrated across a stylized 3D downtown — no map APIs, no game
engine, just **Vite + vanilla JS + Three.js**.

**▶ Live demo:** https://joshuatreepaik.github.io/chicago-trip-demo/

> A playful UX + WebGL showcase. All audio is synthesized in-browser; every
> building, vehicle, and effect is procedural geometry.

## Highlights

- **Envelope → letter → map** scene flow with a CSS wax-seal open animation.
- A **"No" button that runs away** from the cursor (with corner-escape logic).
- A **hand-built low-poly downtown**: instanced pastel buildings with windows
  that glow at night, hero landmarks (Hancock, Marina City, Wrigley, Tribune,
  Apple Michigan Ave, the Starbucks Reserve Roastery), the turquoise Chicago
  River with **bascule drawbridges that open for the tour boat**, a landscaped
  Riverwalk, and a Navy Pier with a turning Ferris wheel out on Lake Michigan.
- A **tiny couple that travels the itinerary** — walking, riding an
  architecture **tour boat** out onto the lake, an elevated **"L" train**, and
  an **Uber** — with a follow-camera and auto-lift when a building blocks the view.
- A full **day → night → sunrise cycle** (keyframed sky, emissive windows,
  street-lamps) that tracks the itinerary, plus a **fireworks + confetti**
  celebration and a **sunset finale over the lake**.
- **Post-processing** (bloom + ACES tone mapping) and a synthesized soundtrack
  with per-activity sound effects (footsteps, boat, train, car, chimes, booms).

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Dev shortcut: append `#map` to jump straight to the 3D scene.

## Build & deploy

```bash
npm run build      # static output in dist/
```

Deploys to GitHub Pages via `.github/workflows/deploy.yml`. `vite.config.js`
uses `base: './'` so it works from any sub-path.

## Tech

Vite · vanilla JS (ES modules) · Three.js (InstancedMesh, post-processing,
CatmullRom path-following, canvas-texture signage) · WebAudio (synthesized
music + SFX) · zero runtime dependencies beyond Three.
