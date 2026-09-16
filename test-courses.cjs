const { chromium } = require('playwright');
(async () => {
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await nav.newPage({ viewport: { width: 1200, height: 900 } });
const erreurs = []; page.on('pageerror', e => erreurs.push(String(e)));
await page.goto('file:///home/user/carnet/carnet-de-fournil.standalone.html');
await page.waitForTimeout(700);

const ok = [], ko = [];
const v = (nom, attendu, obtenu) =>
  (String(attendu) === String(obtenu) ? ok : ko).push(`${nom} : ${obtenu}`);

const cocher = (rid, etat = true) => page.evaluate(([r, e]) => {
  const c = document.querySelector(`.echelle[data-rid="${r}"] .co-case`);
  c.checked = e; c.dispatchEvent(new Event('change', { bubbles: true }));
}, [rid, etat]);

const liste = async () => {
  await page.evaluate(() => document.querySelector('.co-ouvre').click());
  await page.waitForTimeout(150);
  return page.evaluate(() => [...document.querySelectorAll('.co-liste li')]
    .map(li => li.textContent.replace(/\s+/g, ' ').trim()));
};

v('une case par fiche', 68, await page.evaluate(() => document.querySelectorAll('.co-case').length));
v('bouton caché au départ', true, await page.evaluate(() => document.querySelector('.co-ouvre').hidden));

// R8 : farine T65 deux fois (100 + 350), miel deux fois (10 + 40)
await cocher('R8');
let l = await liste();
console.log('\nR8 seule :'); l.forEach(x => console.log('   ', x));
v('bouton apparu', false, await page.evaluate(() => document.querySelector('.co-ouvre').hidden));
v('farine T65 additionnée dans la fiche', true, l.some(x => /^450 g\s*farine T65$/.test(x)));
v('miel additionné dans la fiche', true, l.some(x => /^50 g\s*miel$/.test(x)));
v('« de gruau » regroupé avec farine T65', 1, l.filter(x => /farine T65/.test(x)).length);
v('œufs comptés sans unité', true, l.some(x => /^2\s*œufs$/.test(x)));
v('pas de titre de groupe dans la liste', false, l.some(x => /Levain-mère|^Pâte$/.test(x)));

// R7 ajoute 350 g de farine T65 (100 levain + 250 pâte) et 40 g de miel
await cocher('R7');
l = await liste();
console.log('\nR8 + R7 :'); l.forEach(x => console.log('   ', x));
v('farine cumulée sur deux fiches', true, l.some(x => /^800 g\s*farine T65/.test(x)));
v('provenance signalée', true, l.some(x => /farine T65.*2 fiches/.test(x)));
v('miel cumulé', true, l.some(x => /^90 g\s*miel/.test(x)));

// le facteur est pris en compte, figé au moment où l'on coche
await cocher('R7', false);
await page.evaluate(() => {
  const c = document.querySelector('.echelle[data-rid="R7"] .ech-n');
  c.value = '32'; c.dispatchEvent(new Event('input', { bubbles: true }));   // ×2
});
await page.waitForTimeout(200);
await cocher('R7');
l = await liste();
// R8 = 450 g, R7 = 350 g doublée = 700 g, soit 1 150 g
v('facteur ×2 répercuté', true, l.some(x => /^1,15 kg\s*farine T65/.test(x)));
console.log('\nR8 + R7 doublée → farine :', l.find(x => /farine T65/.test(x)));

// ingrédients non pesés : présents, sans quantité
v('ingrédient sans poids conservé', true, l.some(x => /zeste/i.test(x)));

// le texte copié
const txt = await page.evaluate(() => {
  const m = [...document.querySelectorAll('script')];
  return null;
});
// persistance
await page.reload();
await page.waitForTimeout(800);
v('sélection retenue après rechargement', 2, await page.evaluate(() =>
  document.querySelectorAll('.co-case:checked').length));

// tout décocher
await page.evaluate(() => document.querySelector('.co-ouvre').click());
await page.waitForTimeout(120);
await page.evaluate(() => document.querySelector('.co-vider').click());
await page.waitForTimeout(150);
v('tout décocher vide la sélection', 0, await page.evaluate(() =>
  document.querySelectorAll('.co-case:checked').length));
v('bouton re-caché', true, await page.evaluate(() => document.querySelector('.co-ouvre').hidden));

console.log('\n✓ ' + ok.length + ' contrôles passés');
ok.forEach(o => console.log('   ✓', o));
if (ko.length) { console.log('\n✗ ' + ko.length + ' ÉCHECS'); ko.forEach(k => console.log('   ✗', k)); }
if (erreurs.length) { console.log('\nerreurs JS :'); erreurs.forEach(e => console.log('   !', e)); }
await nav.close();
process.exit(ko.length || erreurs.length ? 1 : 0);
})();
