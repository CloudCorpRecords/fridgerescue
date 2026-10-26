# Smoke test log — 2026-10-26 (run by the building agent)

## Automated tests — `npm test` → 8 pass, 0 fail
- Recipe database well-formed (18 recipes, unique ids, real steps)
- Ingredient normalization/synonyms (Eggs→egg, cheddar→cheese)
- Full-fridge match ranks Spinach & Egg Skillet first, coverage 1.0, urgent items flagged
- Urgency test: identical fridge with banana at 0 days scores higher than at 30 days
- Diet (vegan) and time (≤15 min) filters respected
- Empty pantry → no matches (drives the UI empty state)
- HTTP server: serves app, /health returns ok, path traversal blocked
- Submission files present (README/LICENSE/DEMO/SUBMISSION), README carries the verbatim Build Disclosure

## Live server run — `node server.js` (PORT 4173)
- `GET /health` → `{"ok":true,"app":"fridgerescue","version":"1.0.0"}`
- `GET /` → 200, 4196 bytes · `/styles.css` 200 · `/recipes.js` 200 · `/app.js` 200
- `GET /../server.js` (traversal attempt) → 404, not served

## User-journey exercise (demo fridge → plan → cook → filters)
- Demo fridge (12 items) top 5: 1. Spinach & Egg Skillet — Rescue 87, 5/5 ingredients, urgent: spinach, egg · 2. Banana Oat Pancakes — 72 · 3. Pantry Tomato Pasta — 62 · 4. Clean-Out Veggie Fried Rice — 58 · 5. Herb Butter Pasta — 50
- Cook flow on the top recipe: used spinach, egg, garlic, cheese, olive oil → fridge left with 7 items; counters would read 5 rescued / 1 meal / $15 est. saved
- Filters vegetarian + ≤20 min → 8 recipes, top still Spinach & Egg Skillet (87)

## Screenshot
`assets/screenshot.png` (1280×1500 PNG, 478 KB) captured from the running app with
Chrome Headless Shell (`/opt/hatch/assets/artifacts/headless-shell/chrome-headless-shell`)
at `http://localhost:4173/?demo=1` and visually verified by the agent: hero, urgency
badges, ranked recipe cards with Rescue scores and have/missing chips all render correctly.
