# Food-decider

Starter code for a **Food Decider** pet project.

## Features included
- Food type filters (multi-select)
- Chance mode selector (wheel / dice / darts)
- Spin button with spin animation
- Re-spin flow
- "Find nearby restaurants" flow after a spin result
- Geolocation + mile radius input
- `/api/nearby` backend endpoint wired for **SerpApi** (`google_maps` engine)
- Mock fallback when `SERP_API_KEY` is not set

## Run locally
1. Install deps:
   ```bash
   npm install
   ```
2. (Optional) set SerpApi key:
   ```bash
   export SERP_API_KEY=your_key_here
   ```
3. Start app:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000`

## Notes
- This is intentionally a starter scaffold.
- You can later swap the random picker logic with a real wheel/dice/darts visual component.
