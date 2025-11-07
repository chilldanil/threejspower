# Scroll House Viewer

High-polish React + Three.js experience that turns a single GLB model into an immersive, scroll-driven presentation. The app focuses entirely on the cinematic view shown in `ScrollHouseViewer` — everything else has been removed so you only keep what matters for this page.

## Quick start

1. Place your model at `public/models/haus.glb` (or update `modelPath` in `ScrollHouseViewer.tsx`).
2. Install dependencies with `npm install`.
3. Start the dev server with `npm run dev` and open `http://localhost:5173`.

## Key files

- `src/App.tsx` – mounts the scroll experience.
- `src/components/scenes/ScrollHouseViewer.tsx` – the complete page: Three.js scene, scroll logic, lighting, UI overlays.
- `src/App.css` / `src/index.css` – minimal global styles.
- `public/models/haus.glb` – the house model that is loaded at runtime.

## Features

- Seamless scroll progression through curated camera keyframes.
- Physically-informed sun, moon, sky, and starfield driven by `suncalc` using Munich, DE coordinates.
- Adaptive lighting, clouds, fog, and exposure that react to the time of day.
- Model centering, Draco-compressed GLTF loading, and cinematic post-processing touches.
- Full-screen canvas with loading overlay and storytelling cards that react to scroll position.

## Customizing the experience

- Update `cameraKeyframes` inside `ScrollHouseViewer.tsx` to choreograph new shots.
- Adjust `latitude`, `longitude`, or `currentTime` to simulate different locations or dayparts.
- Swap out `haus.glb` for any other model — keep the file under `public/models/` and update `modelPath` if needed.
- Modify inline UI styles in each `<section>` block to change typography or layout.

## Scripts

- `npm run dev` – start Vite in development mode.
- `npm run build` – type-check and create a production build.
- `npm run lint` – run ESLint on the codebase.

That’s it — the repo is now dedicated to the Scroll House Viewer only. Drop in your model, tweak the keyframes, and ship.
