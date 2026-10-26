# FridgeRescue — Demo Video Script (target: ~2 minutes)

**Format:** screen recording of the live app at http://localhost:4173, 1080p, browser zoomed to 110%. Cursor movements slow and deliberate. Narration can be voiceover or captions — the script works either way. Total spoken length ≈ 260 words ≈ 2 minutes at a natural pace.

---

### Shot 1 — The problem (0:00–0:20)
**Visual:** App hero on screen. Slow scroll over the green header.
**Narration:** "Every week, good food goes bad in good fridges — not because people can't cook, but because dinner planning starts from a craving instead of from what's about to expire. This is FridgeRescue. It plans dinner backwards: from your fridge's deadlines, to a recipe that beats them."

### Shot 2 — Load a real fridge (0:20–0:45)
**Visual:** Click **"Load a real fridge (demo)"**. Pantry fills. Zoom slightly on the badges: spinach "1d left — use it!", banana "1d left — use it!", pasta "60d left".
**Narration:** "Tell it what's in your fridge and how many days each thing has left. Here's a real fridge: spinach and a banana with one day left, eggs and tomatoes with two. FridgeRescue sorts by urgency — red means use it today — and it remembers your fridge between visits, with no account and no sign-up."

### Shot 3 — The rescue plan (0:45–1:15)
**Visual:** Scroll the recipe list. Top cards: *Spinach & Egg Skillet* (Rescue 87), *Banana Oat Pancakes*, *Tomato Egg Drop Soup*. Hover the chips: green = have, red ⚠ = rescued just in time, struck-through = missing.
**Narration:** "Instantly, eighteen real recipes are ranked by Rescue Score — how much food each one saves, weighted by how soon it would expire. The skillet scores eighty-seven because it uses the spinach on its last day. Every card is honest: here's what you have, here's the one or two things you'd still need."

### Shot 4 — Cook it (1:15–1:40)
**Visual:** Click *Spinach & Egg Skillet*. Dialog opens: have/need chips, four steps. Click **"✓ I cooked this"**. Pantry updates — spinach, egg, cheese, garlic, olive oil gone — and the header counters tick up: ingredients rescued, meals cooked, dollars saved.
**Narration:** "Pick one and you get steps plus a built-in shopping list — just the missing chips. Cooked it? One click clears the used ingredients from your fridge and banks them in your rescued counter. Dinner happened, and nothing hit the trash."

### Shot 5 — Filters + close (1:40–2:00)
**Visual:** Set Diet → Vegetarian, Max time → ≤ 20 min. List re-ranks live. End on the hero with the counters visible.
**Narration:** "Filters for vegetarian, vegan, gluten-free, and weeknight-fast — all computed locally, no AI API, no tracking, fully explainable scoring. FridgeRescue: turn what's about to go bad, into tonight's dinner. Thank you."

---

**Recording checklist:**
- [ ] Fresh browser profile / cleared localStorage so counters start at 0
- [ ] Server running via `node server.js`, tab open at localhost:4173
- [ ] Window sized ~1280×800, no other tabs visible
- [ ] Record at 1080p; export MP4; keep under 3 minutes (NextSpark limit)
- [ ] Upload to YouTube/Vimeo as unlisted or public and paste the link into the Devpost submission (see SUBMISSION.md)
