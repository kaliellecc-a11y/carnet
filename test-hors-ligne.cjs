const { chromium } = require('playwright');
(async () => {
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await nav.newContext();
const page = await ctx.newPage();
const ok = [], ko = [];
const v = (nom, attendu, obtenu) =>
  (String(attendu) === String(obtenu) ? ok : ko).push(`${nom} : ${obtenu}`);

// 1. premier passage, en ligne
await page.goto('http://localhost:8777/');
await page.waitForFunction(() => navigator.serviceWorker.controller !== null, { timeout: 15000 })
  .catch(() => {});
await page.waitForTimeout(2500);
v('service worker actif', true, await page.evaluate(() => !!navigator.serviceWorker.controller));
const caches1 = await page.evaluate(async () => {
  const noms = await caches.keys();
  const c = await caches.open(noms[0]);
  return { nom: noms[0], entrees: (await c.keys()).length };
});
console.log('cache :', caches1.nom, '—', caches1.entrees, 'entrées');
v('page mise en cache', true, caches1.entrees >= 2);

// 2. réseau coupé, rechargement
await ctx.setOffline(true);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1200);

const fiches = await page.evaluate(() => document.querySelectorAll('.fiche').length);
v('fiches affichées hors ligne', 73, fiches);
v('titre présent', true, (await page.title()).length > 0);
v('styles appliqués', true, await page.evaluate(() =>
  getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)'));
v('sommaire présent', true, await page.evaluate(() => !!document.querySelector('.toc')));

// 3. le recalcul doit fonctionner sans réseau
await page.evaluate(() => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  const c = a.querySelector('.ech-n'); c.value = '8'; c.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(200);
v('recalcul actif hors ligne', '125 g', await page.evaluate(() => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  return a.querySelector('.ing ul > li:nth-child(2) ul li:nth-child(1) .q').textContent.trim();
}));

// 4. bandeau d'état
v('bandeau hors ligne', true, await page.evaluate(() =>
  (document.querySelector('.sync-etat')?.textContent || '').toLowerCase().includes('hors ligne')));

// 5. une note écrite hors ligne doit être acceptée
const note = await page.evaluate(async () => {
  const t = document.querySelector('.notes-globales');
  if (!t) return 'pas de champ';
  t.value = 'essai hors ligne';
  t.dispatchEvent(new Event('input', { bubbles: true }));
  await new Promise(r => setTimeout(r, 1500));
  return document.querySelector('.etat-global')?.textContent || '(rien)';
});
console.log('note écrite hors ligne →', JSON.stringify(note));
v('note acceptée sans plantage', true, !/échec|error/i.test(note));

// 6. retour en ligne
await ctx.setOffline(false);
await page.waitForTimeout(800);
v('bandeau revenu en ligne', false, await page.evaluate(() =>
  (document.querySelector('.sync-etat')?.textContent || '').toLowerCase().includes('hors ligne')));

console.log('\n✓ ' + ok.length + ' contrôles passés');
ok.forEach(o => console.log('   ✓', o));
if (ko.length) { console.log('\n✗ ' + ko.length + ' ÉCHECS'); ko.forEach(k => console.log('   ✗', k)); }
await nav.close();
process.exit(ko.length ? 1 : 0);
})();
