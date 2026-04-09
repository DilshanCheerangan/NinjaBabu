# Ninja Babu - Interactive Prank Arcade

Ninja Babu is a front-end interactive web game built for design/UX competitions focused on **experience + implementation**, not static visuals.

The project combines:
- fast arcade slicing gameplay
- cinematic motion effects
- responsive UI (desktop + mobile portrait)
- a one-time prank narrative flow

---

## Competition Intent

This project is designed to showcase:
- **Creativity & Concept** through playful subversion (prank sequence)
- **Deceptive/Surprise Element** with non-harmful staged fake-hack narrative
- **UI/UX Quality** via animated intro card, dynamic HUD, and polished overlays
- **Technical Implementation** through canvas gameplay, physics, effects, and responsive behavior

---

## Core Features

- **Intro Title Card**
  - Full-screen hero tab with animated split title: `Ninja Babu`
  - Arena background and animated call-to-action

- **Gameplay**
  - Mouse/touch slicing controls
  - Fruit and bomb spawn from bottom with trajectory and gravity
  - Score tracking, life system, combo callouts

- **Visual Effects**
  - Smooth blade trail
  - Fruit split effect on slice
  - Bomb cinematic sequence:
    - blast burst
    - screen shake
    - temporary slow-motion

- **Prank Flow (One-time per session)**
  - Triggers at 3rd or 5th fruit cut
  - Multi-step modal cards with manual "Next" progression
  - Includes playful runaway button gag
  - Returns player to normal game after completion

- **Responsive**
  - Mobile portrait-friendly layout
  - Scaled HUD and play-area sizing by viewport width + height

---

## Project Structure

- `index.html` - app structure, hero tab, game overlay UI
- `styles.css` - full visual system, animations, responsive rules
- `script.js` - gameplay loop, spawning, collisions, prank logic, effects
- `build-static.js` / `vercel.json` - production build layout for static hosts (e.g. Vercel)
- `public/background/back.png` - arena background image
- `public/babu/` - placeholder folder for optional Babu image asset

---

## Run Locally

From project root:

```bash
npx serve -l 5173 .
```

Open:

```text
http://localhost:5173
```

---

## Controls

- **Mouse / touch drag** to slash objects
- Slice fruits to gain points
- Avoid slicing bombs (bomb hit reduces life)

---

## Notes for Judges

- Prank sequence is intentionally **non-harmful** and clearly resolved.
- No real file operations or system actions are performed.
- The "hack" message is fictional and part of the narrative prank setup.

---

## Deploy (Vercel)

This repo keeps `index.html` at the **project root** (not inside `public/`). If the Vercel project **Output Directory** is set to `public`, only asset folders deploy and the site root has **no** `index.html`, which shows as **404**.

This project includes `vercel.json` plus `npm run build`, which copies root HTML/CSS/JS and `public/` into `dist/`. Vercel should use **Output Directory: `dist`** from that config after you redeploy.

If anything still fails, open **Project → Settings → General** and confirm **Root Directory** is the repo root, **Framework Preset** is Other (or auto with our `vercel.json`), and **Build Command / Output Directory** are not overriding `dist` incorrectly.

---

## Author Notes

Built as a front-end experience prototype for competition presentation.
Can be extended with:
- sound design
- custom sprite packs
- leaderboard persistence
- difficulty tiers
