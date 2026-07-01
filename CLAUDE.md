# Portfolio Site — "Walkable Map" Project

## Concept
A single-page portfolio where the user controls a minimal dot avatar that walks
around a real-world map. Two regions: Phnom Penh and Melbourne. Walking near a
project marker opens a callout then a detail panel. A Locations button lets you
jump to any marker or fly between regions.

This is the only page. No scroll sections, no nav bar — navigation IS the map.

## Owner
Sovithyea Prach (Vith) — AI student, Swinburne University, Melbourne.
Builds: FoodRaccoon (Next.js/Supabase/Mapbox/Tailwind v4/Zustand), ML projects
(XGBoost, PyTorch, scikit-learn). GitHub: https://github.com/sovithyea

## Stack
- Next.js 15 (App Router, TypeScript)
- **MapLibre GL JS** — direct/imperative, no react-map-gl wrapper. Open-source
  drop-in for Mapbox GL JS. No global accessToken needed.
- **Stadia Maps (Stamen tiles)** — `stamen_watercolor` for Phnom Penh,
  `stamen_toner` for Melbourne. Auth via style URL query param.
- Zustand — game state + input vector + persisted settings
- Tailwind v4 — UI chrome (panels, buttons, overlays)
- Framer Motion — project panel animations
- Fraunces (Google Fonts via `next/font`) — serif for titles, CSS var `--font-fraunces`

## Core Architecture Decisions (do not relitigate)

1. **Avatar never moves on the map.** CSS-fixed dot at viewport center. "Moving"
   = panning the MapLibre camera under it via `map.panBy()`. Avatar's real-world
   coordinate = `map.getCenter()`.

2. **Two regions, not one continuous world.** Each region has its own center /
   zoom / bounds / style. Switching = `map.setStyle()` + `map.jumpTo()` via
   `travelTo()` in `lib/travel.ts`. No airport portal — use LocationsButton.

3. **Input abstracted behind a single Zustand vector store** (`{ x: -1..1, y: -1..1 }`).
   WASD and future touch joystick both call `setVector()`. Game loop is input-source-agnostic.

4. **One rAF loop drives everything**: reads input vector → `panBy` →
   `checkProximity` against store markers → update activeProject.

5. **MapLibre native interactions disabled** (`dragPan: false`, `scrollZoom: false`,
   `boxZoom: false`, `dragRotate: false`, `keyboard: false`, `doubleClickZoom: false`,
   `touchZoomRotate: false`) — rAF loop is the only thing that moves the camera.

6. **Markers live in `data/markers.json`**, not hardcoded in components. The
   `useMarkers` hook fetches `/api/markers` on mount and populates `gameStore.markers`.
   All runtime marker reads go through the store. `lib/regions.ts` has seed data
   for initial hydration only.

7. **Map instance accessed imperatively** via `lib/mapInstance.ts` singleton
   (`getMapInstance()` / `setMapInstance()`). Lets non-React code (`travel.ts`,
   `DirectionArrows` DOM updates) reach the map without prop drilling.

## UI Token System (paper/sepia — matches Stamen Watercolor)

```
#FAF3E8  paper cream       — panel/callout background
#3A2E26  dark sepia ink    — primary text
#C97A4A  terracotta        — accent (reserved)
#7FA88F  muted sage        — secondary accent (reserved)
#E8DCC8  warm sand         — borders, dividers
#6B5D4F  mid sepia         — secondary text, muted UI
rgba(58,46,38,0.35)        — panel backdrop (sepia tint)
```

Per-region accent colors (used for marker dots + LocationsButton labels):
- Phnom Penh: `#f59e0b` (amber)
- Melbourne: `#14b8a6` (teal)

Font: Fraunces (`font-serif` Tailwind class) for titles/headings. System sans for body.

## Callout / Panel UX

Two-stage project interaction:
1. **Proximity → callout** (`ProjectCallout`) — walk near marker → small card appears
   anchored at avatar center with a dashed SVG connector line. Shows title + blurb + "Expand".
2. **Expand → panel** (`ProjectPanel`) — user clicks Expand → full overlay with
   description, images, links.

Rules:
- `activeProject` set by proximity check (walk near = show callout)
- `expandedProject` set by user clicking Expand
- Walking away (`activeProject → null`) clears `expandedProject` too
- Closing panel manually does NOT clear `activeProject` (callout stays)

Callout positioning: anchor div `position: fixed; top: 50%; left: 50%`.
Card at `position: absolute; top: -104px; left: 30px`. SVG connector (0,0)→(30,-72).

## Data Model

```ts
// lib/regions.ts — region config + seed marker data
export type ProjectMarker = {
  id: string; lng: number; lat: number; title: string;
  blurb: string;        // 1-2 lines for callout
  description: string;  // full text for panel
  images: string[];     // paths under /public
  links: { label: string; url: string }[];
};

export type Region = {
  id: 'phnom-penh' | 'melbourne';
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
  airport: { lng: number; lat: number; code: string };
  styleId: string;      // stamen_watercolor | stamen_toner
  accentColor: string;
  projects: ProjectMarker[];  // seed only — runtime uses store.markers
};
```

Bounds (covers full city areas):
- Phnom Penh: `[[104.79, 11.46], [104.99, 11.68]]` — all 14 khan
- Melbourne: `[[144.90, -37.98], [145.18, -37.74]]` — CBD + inner north + east to Springvale

`getStyleUrl(styleId)` in `lib/regions.ts`:
```ts
const base = `https://tiles.stadiamaps.com/styles/${styleId}.json`;
return key ? `${base}?api_key=${key}` : base;
```
Localhost works without a key. Production requires `NEXT_PUBLIC_STADIA_KEY`.

## Runtime Marker Architecture

```
data/markers.json          — persisted marker data (source of truth at runtime)
app/api/markers/route.ts   — GET reads JSON, POST writes (dev-only guard)
app/api/upload/route.ts    — POST multipart → public/uploads/, returns {path}
hooks/useMarkers.ts        — fetches /api/markers on mount → store.setMarkers
stores/gameStore.ts        — markers: Record<string, ProjectMarker[]>
```

Components always read `useGameStore(s => s.markers[region])`, never `REGIONS.projects` directly.

## File Structure (current)

```
app/
  page.tsx                  — mounts all components, single route
  layout.tsx                — Fraunces font via next/font, --font-fraunces CSS var
  globals.css               — @import tailwindcss, full-screen html/body reset
  api/
    markers/route.ts        — GET/POST data/markers.json
    upload/route.ts         — POST multipart → public/uploads/
components/
  MapCanvas.tsx             — MapLibre init, marker dots, edit click handler,
                              useMarkers + useKeyboardInput + useGameLoop wired here
  Avatar.tsx                — fixed white dot at 50%/50% viewport
  ProjectCallout.tsx        — proximity callout (blurb + Expand), anchored to avatar
  ProjectPanel.tsx          — full overlay panel (description/images/links)
  DirectionArrows.tsx       — DOM-direct arrows on map.on('move'), viewport-edge detection
  LocationsButton.tsx       — bottom-center: list current region markers + "✈ Fly to [city]"
  EditOverlay.tsx           — E key panel, marker list/form, image upload
  SettingsPanel.tsx         — ⚙ bottom-left, speed slider (2-24), zoom slider (12-17)
hooks/
  useGameLoop.ts            — rAF loop, reads speed from settingsStore each tick, no airport
  useKeyboardInput.ts       — WASD + arrow keys + E to toggle editMode
  useMarkers.ts             — fetches /api/markers → store.setMarkers for all regions
stores/
  inputStore.ts             — { x, y } vector
  gameStore.ts              — currentRegion, activeProject, expandedProject,
                              transitioning, facing, editMode, markers,
                              pendingCoords, editingMarkerId
  settingsStore.ts          — speed, zoom (persisted via Zustand persist middleware)
lib/
  regions.ts                — REGIONS config + ProjectMarker/Region types + getStyleUrl
  mapInstance.ts            — module-level Map singleton (get/setMapInstance)
  travel.ts                 — travelTo(regionId), panToMarker(lng, lat)
data/
  markers.json              — {"phnom-penh": [...], "melbourne": []}
public/
  uploads/                  — user-uploaded marker images (via /api/upload)
```

## Key Implementations

**gameStore — activeProject cascades to expandedProject:**
```ts
setActiveProject: (id) =>
  set((s) => ({
    activeProject: id,
    expandedProject: id === null ? null : s.expandedProject,
  })),
```

**useGameLoop — reads speed per tick (not stale closure):**
```ts
const speed = useSettingsStore.getState().speed;
map.panBy([x * speed, y * speed], { duration: 0 });
```

**checkProximity — reads store.markers, not REGIONS.projects:**
```ts
const { currentRegion, markers } = useGameStore.getState();
const regionMarkers = markers[currentRegion] ?? [];
```

**travelTo (`lib/travel.ts`) — switches style + bounds + region:**
```ts
map.setStyle(getStyleUrl(target.styleId));
map.jumpTo({ center: target.center, zoom });
map.setMaxBounds(target.bounds);
useGameStore.getState().setRegion(targetId);
```

**DirectionArrows — DOM-direct (no React re-renders per frame):**
- Fires on `map.on('move')`. Bearing from `map.getCenter()` to each off-screen marker.
- MARGIN=40px for off-screen threshold. RING=88px from center for arrow placement.
- Project markers only (no airport arrow).

**EditOverlay — in-map marker editor:**
- Toggle with E key (guarded: skips if `<input>`/`<textarea>` focused)
- Map cursor → crosshair in edit mode
- Click on map → `setPendingCoords` in gameStore
- Form: title, blurb, description, links[], image upload
- Images POST to `/api/upload` → `public/uploads/`
- Save POST to `/api/markers` → updates `data/markers.json`
- Both API routes are dev-only (NODE_ENV guard)

**settingsStore — persisted to localStorage:**
```ts
{ speed: 10, zoom: 15 }  // key: 'vithfolio-settings'
```
`MapCanvas` syncs zoom setting → map via `useEffect([map, zoom])`.

## Build Phases

- [x] 1. Static MapLibre map, Stadia watercolor style, native interactions disabled
- [x] 2. WASD movement via input store + rAF game loop
- [x] 3. Project markers + proximity detection + ProjectCallout + ProjectPanel
- [x] 4. Region switching via LocationsButton (`travelTo` — instant style+jumpTo)
- [x] 4b. Direction arrows for off-screen markers
- [x] 4c. In-map editor (E key, click-to-place, form, image upload, API routes)
- [x] 4d. Settings panel (speed + zoom sliders, persisted)
- [ ] 5. TransitionOverlay animation on region switch
- [ ] 6. TouchJoystick + mobile responsive layout (hand-rolled, ~40 lines)
- [ ] 7. Polish: avatar facing/animation, panel content, Stadia style refinement

## Explicit Non-Goals (current phase)
- No multi-page nav, no scroll sections
- No sprite/character art — white dot is intentional placeholder
- No CMS/backend — markers live in `data/markers.json`, edited via dev editor
- No react-map-gl or any Mapbox React wrapper
- No joystick library — hand-roll when phase 6 starts

## Open Decisions (flag, don't decide unilaterally)
- Final avatar sprite/art style
- Exact project list for Melbourne (currently empty — confirm before adding)
- FoodRaccoon GitHub link should point to specific repo, not profile page
- FoodRaccoon `images[]` is empty — add screenshots to `public/uploads/` and
  update `data/markers.json` (or use the E-key editor in the browser)

## Environment
```
.env.local:
  NEXT_PUBLIC_STADIA_KEY=<key>   — Stadia Maps API key (optional localhost, required prod)
  NEXT_PUBLIC_MAPBOX_TOKEN=<tok> — kept but unused (MapLibre needs no token)
```
