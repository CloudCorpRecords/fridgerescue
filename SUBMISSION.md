# Devpost Submission — NextSpark Hacks (ready to paste)

**Project name:** FridgeRescue

**Elevator pitch / tagline:** Turn what's about to go bad into tonight's dinner — a leftover-to-meal planner that ranks recipes by how much soon-to-expire food they rescue.

**Demo video:** [PASTE LINK after recording per DEMO.md]
**GitHub repo:** [PASTE PUBLIC REPO LINK]
**Screenshot:** assets/screenshot.png (upload to the Devpost image gallery)

---

## Inspiration

Households throw away a startling share of the food they buy — not from carelessness, but because dinner planning starts from a craving ("what do I feel like?") instead of from the fridge ("what's about to expire?"). The spinach wilts behind the milk, the bananas blacken on the counter, and hand-checking recipe sites against a real fridge takes longer than ordering takeout. We wanted to flip the planning direction: fridge first, deadlines first, recipe second.

## What it does

FridgeRescue turns a fridge inventory into tonight's rescue plan:

- **Add your fridge** — ingredients plus days-left each. Expiry badges sort food by urgency; red means *use it today*. A one-tap demo fridge shows the whole flow instantly.
- **Get ranked recipes** — 18 built-in, real recipes are scored by a transparent **Rescue Score**: mostly how many of the recipe's ingredients you already have, boosted by how soon the ones it uses would expire, with a nudge for quick recipes. Each card shows what you have, what you're missing, and which expiring items it saves.
- **Filter** by vegetarian / vegan / gluten-free and by max cooking time.
- **Cook view** with steps and a have/need chip list (the "need" chips are your shopping list), plus an **"I cooked this"** action that clears used ingredients from your fridge.
- **Impact counters** track ingredients rescued and meals cooked, with a rough dollars-saved estimate. State persists in localStorage — no account, no tracking, no network calls, no API keys.

## How we built it

- A **zero-dependency Node.js server** (stdlib `http`/`fs` only, ~45 lines) serves the static app, exposes a `/health` endpoint, and blocks path traversal. It starts with a single command: `node server.js`.
- The front end is **vanilla HTML/CSS/JS** — no framework, no build step — with a responsive layout and a native `<dialog>` cook view.
- The heart is a **shared matching engine** (`recipes.js`) that runs identically in the browser and in Node: it normalizes ingredient names and synonyms ("eggs" → "egg", "cheddar" → "cheese"), weights urgency (food expiring today is worth ~6× more to use than shelf-stable food), applies diet/time filters, and emits the data behind every score so the ranking is always explainable.
- **Eight automated tests** (`node:test`, still zero dependencies) cover the recipe data, the urgency ranking, the filters, the HTTP server, and the submission files. Because the browser and the tests share one engine module, the logic judges see is the logic that is tested.

Deliberately, the app uses **no AI at runtime** and no external APIs: the matching is a deterministic local algorithm, so it works offline, never hallucinates a recipe, and its scores can be explained line by line.

## Challenges we ran into

- **Ranking that feels right:** pure ingredient coverage ranked a recipe using shelf-stable rice above one rescuing spinach on its last day. We had to design the urgency weighting so "saves food about to die" visibly beats "uses lots of pantry staples" — and verify it with a dedicated test that compares identical fridges at different expiry dates.
- **Messy human input:** people type "eggs", "Tomatoes", "cheddar". A normalization/synonym layer was needed so the fridge people actually describe matches the recipes as written.
- **Staying honest in the UI:** it's tempting to show only matches. We kept the missing-ingredient chips visible (struck through) on every card, because the missing list *is* the shopping list — and because a rescue tool that pretends you have everything isn't trustworthy.

## What we learned

- Planning *backwards from deadlines* is a genuinely different (and better) frame for weeknight cooking than recipe-first browsing — the urgency signal does most of the decision-making work for the user.
- A boring, explainable algorithm can beat a flashy AI call for trust-critical micro-decisions: judges and users can see exactly why recipe A outranks recipe B.
- Zero dependencies is a feature: the project installs nothing, starts in under a second, and will still run years from now.

## What's next

Barcode/receipt import for the fridge inventory, a "use it up this week" multi-day plan that optimizes across dinners instead of one night, and community-contributed recipe packs — all keeping the same local-first, explainable scoring.

## Built with

- nodejs
- javascript
- html5
- css3
- localstorage
- node-test
- claude (AI agent assistance — see below)

## AI assistance disclosure (per NextSpark Hacks rules)

**Human (Rene Turcios):** selected the problem (household food waste), chose the theme fit, set the constraints (zero-dependency, completable in the hackathon window, polished), and performed acceptance review.

**AI agents (Tree / Muse fleet, Anthropic's Muse):** designed the matching engine and scoring formula, wrote all application code, recipe content, tests, screenshot, and documentation during the hackathon submission period.

**The submitted app itself uses no AI at runtime** — matching is a deterministic local algorithm by design.

**Build Disclosure:** AI-built. This project was built by AI agents (Tree / Muse fleet) directed by Rene Turcios. Rene set the problem, theme fit, and acceptance review; agents designed, coded, tested, and documented the project during the hackathon period. AI tools used are credited in the Built With list.
