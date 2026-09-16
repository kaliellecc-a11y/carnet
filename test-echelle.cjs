const { chromium } = require('playwright');
(async () => {

const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await nav.newPage();
const erreurs = [];
page.on('pageerror', e => erreurs.push(String(e)));
await page.goto('file:///home/user/carnet/carnet-de-fournil.standalone.html');
await page.waitForTimeout(600);

const ok = [], ko = [];
const v = (nom, attendu, obtenu) =>
  (String(attendu) === String(obtenu) ? ok : ko).push(`${nom} : attendu ${attendu}, obtenu ${obtenu}`);

// R7 : beignets, 16 beignets, levain-mère groupé
const rid = await page.evaluate(() => {
  const arts = [...document.querySelectorAll('.fiche')];
  const a = arts.find(x => x.textContent.includes('Beignets à la poêle'));
  return a?.querySelector('.echelle')?.dataset.rid;
});
console.log('fiche testée :', rid);

const lire = (sel) => page.evaluate(s => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  return a.querySelector(s)?.textContent.trim();
}, sel);

v('farine pâte d’origine', '250 g', await lire('.ing ul > li:nth-child(2) ul li:nth-child(1) .q'));

// régler à 8 beignets (moitié de 16)
await page.evaluate(() => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  const c = a.querySelector('.ech-n');
  c.value = '8'; c.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(150);

v('farine à ×0,5', '125 g', await lire('.ing ul > li:nth-child(2) ul li:nth-child(1) .q'));
v('facteur affiché', '×0,5', await lire('.ech-facteur'));

const methode = await page.evaluate(() => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  return a.querySelector('.mode').textContent;
});
v('méthode : levain-mère 200→100 g', true, methode.includes('levain-mère (100 g)'));
v('méthode : farine 250→125 g', true, methode.includes('farine (125 g)'));
v('température intacte', true, methode.includes('170-175 °C'));
v('œufs 2 → 1', '1', await lire('.ing ul > li:nth-child(2) ul li:nth-child(2) .q'));

const meta = await page.evaluate(() => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  return a.querySelector('.meta').textContent;
});
const listeTxt = await page.evaluate(() => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  return a.querySelector('.ing').textContent;
});
v('accord : « 1 œuf » au singulier', true, /1\s*œuf(?!s)/.test(listeTxt));
v('pas de « 1 œufs »', false, /1\s*œufs/.test(listeTxt));

v('rendement 16 → 8 beignets', true, /\b8 beignets/.test(meta));
v('travail 30 min intact', true, meta.includes('travail 30 min'));
v('kcal par pièce inchangées', true, /280 kcal/.test(meta));

// avertissement au-delà des bornes
await page.evaluate(() => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  const c = a.querySelector('.ech-n'); c.value = '64'; c.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(120);
v('garde-fou visible à ×4', false, await page.evaluate(() => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  return a.querySelector('.ech-garde').hidden;
}));

// retour à l'origine
await page.evaluate(() => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  a.querySelector('.ech-reset').click();
});
await page.waitForTimeout(120);
v('retour à l’origine', '250 g', await lire('.ing ul > li:nth-child(2) ul li:nth-child(1) .q'));

// le passage en édition doit rétablir l'origine
await page.evaluate(() => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  const c = a.querySelector('.ech-n'); c.value = '32'; c.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(120);
v('avant édition : ×2 appliqué', '500 g', await lire('.ing ul > li:nth-child(2) ul li:nth-child(1) .q'));
await page.evaluate(() => {
  const a = [...document.querySelectorAll('.fiche')].find(x => x.textContent.includes('Beignets à la poêle'));
  a.querySelector('.outils .edit').click();
});
await page.waitForTimeout(150);
v('édition : quantités rétablies', '250 g', await lire('.ing ul > li:nth-child(2) ul li:nth-child(1) .q'));

console.log('\n✓ ' + ok.length + ' contrôles passés');
ok.forEach(o => console.log('   ✓', o));
if (ko.length) { console.log('\n✗ ' + ko.length + ' ÉCHECS'); ko.forEach(k => console.log('   ✗', k)); }
if (erreurs.length) { console.log('\nerreurs JS :'); erreurs.forEach(e => console.log('   !', e)); }
await nav.close();
process.exit(ko.length || erreurs.length ? 1 : 0);

})();
