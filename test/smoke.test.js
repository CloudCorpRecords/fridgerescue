// FridgeRescue smoke + logic tests — node:test, zero dependencies.
// Run: npm test
const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const path = require('path');
const fs = require('fs');

const data = require('../public/recipes.js');

test('recipe database is well-formed', () => {
  assert.ok(data.RECIPES.length >= 15, `expected >=15 recipes, got ${data.RECIPES.length}`);
  const ids = new Set();
  for (const r of data.RECIPES) {
    assert.ok(r.id && !ids.has(r.id), `duplicate or missing id: ${r.id}`);
    ids.add(r.id);
    assert.ok(r.name && r.minutes > 0 && r.ingredients.length >= 3, `bad recipe ${r.id}`);
    assert.ok(r.steps.length >= 3, `recipe ${r.id} needs real steps`);
  }
});

test('normalize handles plurals and synonyms', () => {
  assert.strictEqual(data.normalize('Eggs'), 'egg');
  assert.strictEqual(data.normalize('  Tomatoes '), 'tomato');
  assert.strictEqual(data.normalize('cheddar'), 'cheese');
});

test('a full fridge match scores highest and ranks first', () => {
  const pantry = [
    { name: 'spinach', daysLeft: 1 }, { name: 'egg', daysLeft: 2 },
    { name: 'garlic', daysLeft: 5 }, { name: 'cheese', daysLeft: 3 },
    { name: 'olive oil', daysLeft: 30 },
  ];
  const results = data.matchRecipes(pantry, {});
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].id, 'spinach-egg-skillet');
  assert.strictEqual(results[0].coverage, 1);
  assert.ok(results[0].usesUrgent.includes('spinach'), 'urgent spinach should be flagged');
});

test('urgency changes ranking: expiring food beats shelf-stable food', () => {
  const urgent = data.matchRecipes([{ name: 'banana', daysLeft: 0 }, { name: 'oats', daysLeft: 90 }, { name: 'egg', daysLeft: 9 }, { name: 'milk', daysLeft: 9 }, { name: 'baking powder', daysLeft: 90 }], {});
  const fresh = data.matchRecipes([{ name: 'banana', daysLeft: 30 }, { name: 'oats', daysLeft: 90 }, { name: 'egg', daysLeft: 30 }, { name: 'milk', daysLeft: 30 }, { name: 'baking powder', daysLeft: 90 }], {});
  const u = urgent.find((r) => r.id === 'banana-oat-pancakes');
  const f = fresh.find((r) => r.id === 'banana-oat-pancakes');
  assert.ok(u && f, 'pancakes should match in both cases');
  assert.ok(u.score > f.score, `urgent score ${u.score} should beat fresh score ${f.score}`);
});

test('diet and time filters are respected', () => {
  const pantry = data.RECIPES.flatMap((r) => r.ingredients).filter((v, i, a) => a.indexOf(v) === i)
    .map((name) => ({ name, daysLeft: 3 }));
  const vegan = data.matchRecipes(pantry, { diet: 'vegan' });
  assert.ok(vegan.length > 0);
  for (const r of vegan) assert.ok(r.tags.some((t) => t === 'vegan' || t === 'vegan-option'));
  const fast = data.matchRecipes(pantry, { maxMinutes: 15 });
  assert.ok(fast.length > 0);
  for (const r of fast) assert.ok(r.minutes <= 15);
});

test('empty pantry matches nothing (UI shows the empty state)', () => {
  assert.deepStrictEqual(data.matchRecipes([], {}), []);
});

test('server serves the app, health endpoint, and blocks traversal', async () => {
  process.env.PORT = '0';
  const server = require('../server.js');
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const get = (p) => new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path: p }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
  try {
    const home = await get('/');
    assert.strictEqual(home.status, 200);
    assert.match(home.body, /FridgeRescue/);
    const health = await get('/health');
    assert.strictEqual(JSON.parse(health.body).ok, true);
    const js = await get('/recipes.js');
    assert.strictEqual(js.status, 200);
    const traversal = await get('/../server.js');
    assert.ok([403, 404].includes(traversal.status), `traversal should be blocked, got ${traversal.status}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('required submission files exist', () => {
  const root = path.join(__dirname, '..');
  for (const f of ['README.md', 'LICENSE', 'DEMO.md', 'SUBMISSION.md']) {
    assert.ok(fs.existsSync(path.join(root, f)), `${f} missing`);
  }
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.match(readme, /Build Disclosure: AI-built/);
});
