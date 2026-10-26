// FridgeRescue — recipe data + matching engine.
// Works in the browser (window.FridgeData) and in Node (module.exports) so the
// exact logic the judges see is the logic the tests exercise.
// No network calls, no AI API at runtime: matching is deterministic and explainable.

(function (exports) {
  'use strict';

  // Each recipe: name, minutes, difficulty, tags, ingredients (canonical names),
  // steps. Canonical ingredient names are lowercase single/plural-tolerant tokens.
  const RECIPES = [
    { id: 'veggie-fried-rice', name: 'Clean-Out Veggie Fried Rice', minutes: 20, difficulty: 'Easy',
      tags: ['vegetarian', 'gluten-free-option'],
      ingredients: ['rice', 'egg', 'carrot', 'peas', 'soy sauce', 'garlic'],
      steps: ['Scramble the eggs in a hot oiled pan; set aside.', 'Stir-fry carrot, peas and garlic 3-4 minutes.', 'Add cold rice, break up clumps, fry until edges crisp.', 'Splash in soy sauce, fold eggs back in, serve hot.'],
      blurb: 'The classic fridge clean-out: day-old rice plus whatever veg is left.' },
    { id: 'spinach-egg-skillet', name: 'Spinach & Egg Skillet', minutes: 15, difficulty: 'Easy',
      tags: ['vegetarian', 'gluten-free'],
      ingredients: ['spinach', 'egg', 'garlic', 'cheese', 'olive oil'],
      steps: ['Sizzle garlic in olive oil 30 seconds.', 'Wilt spinach in handfuls until just collapsed.', 'Crack eggs over the top, cover, cook to your liking.', 'Scatter cheese, rest 1 minute, eat from the pan.'],
      blurb: 'Wilting spinach becomes breakfast-for-dinner in one pan.' },
    { id: 'tomato-pasta', name: 'Pantry Tomato Pasta', minutes: 25, difficulty: 'Easy',
      tags: ['vegetarian', 'vegan-option'],
      ingredients: ['pasta', 'tomato', 'garlic', 'olive oil', 'basil'],
      steps: ['Boil pasta in well-salted water; save a mug of pasta water.', 'Soften garlic in olive oil, add chopped tomatoes, simmer 10 minutes.', 'Toss pasta through the sauce with splashes of pasta water.', 'Tear basil over the top and serve.'],
      blurb: 'Soft tomatoes turn into a real sauce instead of compost.' },
    { id: 'potato-soup', name: 'Cozy Potato Soup', minutes: 35, difficulty: 'Easy',
      tags: ['vegetarian', 'gluten-free'],
      ingredients: ['potato', 'onion', 'carrot', 'milk', 'butter'],
      steps: ['Sweat onion and carrot in butter 5 minutes.', 'Add cubed potato and water to cover; simmer until tender.', 'Mash half the potatoes in the pot for body.', 'Stir in milk, season boldly, warm through.'],
      blurb: 'Forgiving soup that rescues potatoes, carrots and that last onion.' },
    { id: 'chicken-stir-fry', name: 'Ginger Chicken Stir-Fry', minutes: 25, difficulty: 'Medium',
      tags: ['gluten-free-option'],
      ingredients: ['chicken', 'bell pepper', 'ginger', 'garlic', 'soy sauce', 'rice'],
      steps: ['Sear chicken strips until golden; set aside.', 'Stir-fry pepper, ginger and garlic 2-3 minutes.', 'Return chicken, add soy sauce, toss until glossy.', 'Serve over rice.'],
      blurb: 'One pepper plus chicken equals a takeout night at home.' },
    { id: 'bean-quesadillas', name: 'Crispy Bean Quesadillas', minutes: 15, difficulty: 'Easy',
      tags: ['vegetarian'],
      ingredients: ['tortilla', 'beans', 'cheese', 'onion', 'salsa'],
      steps: ['Mash beans with a fork and a pinch of salt and cumin if you have it.', 'Spread on tortillas, top with cheese and onion.', 'Crisp in a dry pan 2-3 minutes per side.', 'Slice and serve with salsa.'],
      blurb: 'Canned beans + tortillas + cheese: dinner in 15 flat.' },
    { id: 'mushroom-omelette', name: 'Mushroom & Herb Omelette', minutes: 12, difficulty: 'Easy',
      tags: ['vegetarian', 'gluten-free'],
      ingredients: ['egg', 'mushroom', 'cheese', 'butter', 'parsley'],
      steps: ['Brown mushrooms in butter until they give up their water.', 'Pour in beaten eggs, pull edges in as they set.', 'Add cheese and parsley, fold, slide onto a warm plate.'],
      blurb: 'Mushrooms on their last day shine in a 12-minute omelette.' },
    { id: 'lentil-curry', name: 'Red Lentil Rescue Curry', minutes: 30, difficulty: 'Medium',
      tags: ['vegan', 'gluten-free'],
      ingredients: ['lentils', 'onion', 'tomato', 'ginger', 'curry powder', 'rice'],
      steps: ['Soften onion and ginger; bloom curry powder 30 seconds.', 'Add lentils, tomato and water; simmer 20 minutes.', 'Salt at the end, rest 5 minutes to thicken.', 'Serve over rice with anything green on top.'],
      blurb: 'Pantry lentils plus tired tomatoes become a proper curry.' },
    { id: 'tuna-melt', name: 'Diner Tuna Melt', minutes: 15, difficulty: 'Easy',
      tags: [],
      ingredients: ['bread', 'tuna', 'cheese', 'mayonnaise', 'celery'],
      steps: ['Mix tuna, mayo and finely diced celery.', 'Pile onto bread, top with cheese.', 'Toast open-face until the cheese bubbles.', 'Eat immediately, diner-style.'],
      blurb: 'The can at the back of the cupboard finally gets its moment.' },
    { id: 'banana-oat-pancakes', name: 'Banana Oat Pancakes', minutes: 20, difficulty: 'Easy',
      tags: ['vegetarian'],
      ingredients: ['banana', 'oats', 'egg', 'milk', 'baking powder'],
      steps: ['Blend or mash banana with oats, egg, milk and baking powder.', 'Rest batter 5 minutes to thicken.', 'Fry small pancakes 2 minutes per side.', 'Serve warm — black bananas never tasted this good.'],
      blurb: 'Black-spotted bananas are pancake gold, not trash.' },
    { id: 'cabbage-slaw-tacos', name: 'Crunchy Slaw Tacos', minutes: 20, difficulty: 'Easy',
      tags: ['vegetarian-option', 'gluten-free-option'],
      ingredients: ['cabbage', 'tortilla', 'lime', 'carrot', 'mayonnaise'],
      steps: ['Shred cabbage and carrot finely.', 'Dress with lime juice, mayo and salt; rest 10 minutes.', 'Warm tortillas until pliable.', 'Load with slaw and any leftover protein you have.'],
      blurb: 'Half a cabbage becomes the crunchiest taco filling.' },
    { id: 'tomato-egg-drop-soup', name: 'Tomato Egg Drop Soup', minutes: 15, difficulty: 'Easy',
      tags: ['gluten-free-option'],
      ingredients: ['tomato', 'egg', 'ginger', 'soy sauce', 'cornstarch'],
      steps: ['Simmer tomatoes and ginger in water or stock 5 minutes.', 'Season with soy sauce; swirl in a cornstarch slurry.', 'Drizzle beaten egg in a thin stream, stir once gently.', 'Rest 1 minute so the ribbons set. Serve.'],
      blurb: 'Two soft tomatoes and an egg: soup in 15 minutes.' },
    { id: 'zucchini-fritters', name: 'Zucchini Fritters', minutes: 25, difficulty: 'Medium',
      tags: ['vegetarian'],
      ingredients: ['zucchini', 'flour', 'egg', 'garlic', 'yogurt'],
      steps: ['Grate zucchini, salt, squeeze very dry.', 'Mix with flour, egg and garlic into a thick batter.', 'Fry spoonfuls until deeply golden on both sides.', 'Serve with a dollop of yogurt.'],
      blurb: 'The zucchini avalanche, solved deliciously.' },
    { id: 'sausage-pepper-sheetpan', name: 'Sheet-Pan Sausage & Peppers', minutes: 40, difficulty: 'Easy',
      tags: ['gluten-free'],
      ingredients: ['sausage', 'bell pepper', 'onion', 'potato', 'olive oil'],
      steps: ['Heat oven to 220°C / 425°F.', 'Toss everything chunky with olive oil and salt on one tray.', 'Roast 30-35 minutes, turning once, until edges char.', 'Rest 5 minutes and serve straight from the tray.'],
      blurb: 'One tray, zero washing-up drama, uses the whole pepper drawer.' },
    { id: 'apple-oat-crumble', name: 'Last-Apples Oat Crumble', minutes: 45, difficulty: 'Easy',
      tags: ['vegetarian'],
      ingredients: ['apple', 'oats', 'flour', 'butter', 'sugar'],
      steps: ['Heat oven to 180°C / 350°F.', 'Slice apples into a baking dish with a spoon of sugar.', 'Rub butter into oats, flour and sugar; scatter over apples.', 'Bake 30-35 minutes until bubbling and golden.'],
      blurb: 'Mealy apples bake back to glory under a crumble lid.' },
    { id: 'greek-salad-wrap', name: 'Chopped Greek Salad Wrap', minutes: 15, difficulty: 'Easy',
      tags: ['vegetarian'],
      ingredients: ['tortilla', 'cucumber', 'tomato', 'feta', 'olives'],
      steps: ['Chop cucumber, tomato, feta and olives chunky.', 'Season with salt, a squeeze of lemon or vinegar, olive oil if you have it.', 'Wrap tightly in warm tortillas.', 'Slice diagonally like you mean it.'],
      blurb: 'Salad bits that are not quite a salad become lunch.' },
    { id: 'carrot-ginger-soup', name: 'Carrot Ginger Soup', minutes: 30, difficulty: 'Easy',
      tags: ['vegan', 'gluten-free'],
      ingredients: ['carrot', 'onion', 'ginger', 'coconut milk', 'olive oil'],
      steps: ['Soften onion and ginger in olive oil.', 'Add carrots and water to cover; simmer until soft.', 'Blend until silky with coconut milk.', 'Season, swirl, serve.'],
      blurb: 'A whole bag of carrots, one blender, zero waste.' },
    { id: 'herb-butter-pasta', name: 'Herb Butter Pasta', minutes: 18, difficulty: 'Easy',
      tags: ['vegetarian'],
      ingredients: ['pasta', 'butter', 'garlic', 'parsley', 'cheese'],
      steps: ['Boil pasta; save a mug of pasta water.', 'Melt butter with garlic until it smells amazing, not burnt.', 'Toss pasta through with parsley and pasta water.', 'Shower with cheese and serve.'],
      blurb: 'The herb bunch wilting in the door becomes the whole sauce.' },
  ];

  // Common synonyms so users can type what they call things.
  const SYNONYMS = {
    'eggs': 'egg', 'tomatoes': 'tomato', 'potatoes': 'potato', 'carrots': 'carrot',
    'onions': 'onion', 'peppers': 'bell pepper', 'bell peppers': 'bell pepper',
    'spring onion': 'green onion', 'scallion': 'green onion',
    'garbanzo beans': 'beans', 'black beans': 'beans', 'kidney beans': 'beans',
    'cheddar': 'cheese', 'parmesan': 'cheese', 'mozzarella': 'cheese',
    'bananas': 'banana', 'apples': 'apple', 'mushrooms': 'mushroom',
    'sausages': 'sausage', 'lemons': 'lemon', 'limes': 'lime',
  };

  function normalize(name) {
    const n = String(name || '').trim().toLowerCase();
    return SYNONYMS[n] || n;
  }

  // Urgency weight: food expiring sooner is worth more to use now.
  function urgencyWeight(daysLeft) {
    if (daysLeft === null || daysLeft === undefined || Number.isNaN(daysLeft)) return 0.2;
    if (daysLeft <= 0) return 1.0;
    if (daysLeft === 1) return 0.9;
    if (daysLeft === 2) return 0.75;
    if (daysLeft === 3) return 0.55;
    if (daysLeft <= 5) return 0.35;
    return 0.15;
  }

  /**
   * Match recipes against a pantry.
   * pantry: [{ name, daysLeft }]  (daysLeft may be null)
   * options: { diet: 'any'|'vegetarian'|'vegan'|'gluten-free', maxMinutes: number|null }
   * Returns recipes sorted by score desc, each annotated:
   *   have[], missing[], coverage (0..1), rescueScore, score (0..100), usesUrgent[]
   */
  function matchRecipes(pantry, options) {
    const opts = options || {};
    const byName = new Map();
    for (const item of pantry || []) {
      byName.set(normalize(item.name), item);
    }
    const results = [];
    for (const recipe of RECIPES) {
      if (opts.diet && opts.diet !== 'any') {
        const ok = recipe.tags.some((t) => t === opts.diet || t === opts.diet + '-option');
        if (!ok) continue;
      }
      if (opts.maxMinutes && recipe.minutes > opts.maxMinutes) continue;
      const have = [], missing = [], usesUrgent = [];
      let rescue = 0;
      for (const ing of recipe.ingredients) {
        if (byName.has(ing)) {
          have.push(ing);
          const w = urgencyWeight(byName.get(ing).daysLeft);
          rescue += w;
          if (w >= 0.75) usesUrgent.push(ing);
        } else {
          missing.push(ing);
        }
      }
      if (have.length === 0) continue;
      const coverage = have.length / recipe.ingredients.length;
      // Score: mostly coverage, meaningfully boosted by rescuing urgent food,
      // small nudge for shorter recipes.
      const score = Math.round(
        coverage * 70 + (rescue / recipe.ingredients.length) * 25 + (recipe.minutes <= 20 ? 5 : 0)
      );
      results.push(Object.assign({}, recipe, { have, missing, coverage, rescueScore: rescue, usesUrgent, score }));
    }
    results.sort((a, b) => b.score - a.score || b.coverage - a.coverage || a.minutes - b.minutes);
    return results;
  }

  exports.RECIPES = RECIPES;
  exports.SYNONYMS = SYNONYMS;
  exports.normalize = normalize;
  exports.urgencyWeight = urgencyWeight;
  exports.matchRecipes = matchRecipes;
})(typeof module !== 'undefined' && module.exports ? module.exports : (window.FridgeData = {}));
