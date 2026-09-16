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

const synthese = () => page.evaluate(() =>
  document.querySelector('#journal-des-fournees .jr-corps').textContent.replace(/\s+/g, ' ').trim());

v('section présente', true, await page.evaluate(() => !!document.getElementById('journal-des-fournees')));
v('entrée de sommaire', true, await page.evaluate(() =>
  [...document.querySelectorAll('.toc a')].some(a => a.getAttribute('href') === '#journal-des-fournees')));
v('journal vide annoncé', true, (await synthese()).includes('Le journal est vide'));

// ajouter une fournée via le formulaire réel de la fiche
const fournee = (rid, date, verdict, note) => page.evaluate(([r, d, ve, n]) => {
  const f = document.querySelector(`.outils[data-rid="${r}"] .entry-form`);
  f.querySelector('[name="date"]').value = d;
  f.querySelector('[name="verdict"]').value = ve;
  f.querySelector('[name="note"]').value = n;
  f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}, [rid, date, verdict, note]);

await fournee('R7', '2026-09-10', 'raté', 'huile trop chaude');
await fournee('R7', '2026-09-14', 'validé', 'parfait cette fois');
await fournee('R8', '2026-09-12', 'à corriger', 'trop dense');
await fournee('R1', '2026-09-15', 'validé', '');
await fournee('R1', '2026-09-02', 'validé', '');
await page.waitForTimeout(600);

const s = await synthese();
console.log('\nsynthèse :\n  ' + s.replace(/ — /g, '\n  — ').slice(0, 700));

v('5 fournées comptées', true, /\b5 fournées\b/.test(s));
v('3 recettes comptées', true, /\b3 recettes\b/.test(s));
v('période affichée', true, /02\/09\/2026 à 15\/09\/2026/.test(s));
v('3 validées', true, /3 validées/.test(s));
v('1 à corriger', true, /1 à corriger/.test(s));
v('1 ratée', true, /1 ratée/.test(s));

const reprendre = await page.evaluate(() => {
  const b = [...document.querySelectorAll('.jr-bloc')].find(x => /À reprendre/.test(x.textContent));
  return b ? [...b.querySelectorAll('.jr-liste li')].map(li => li.textContent.replace(/\s+/g, ' ').trim()) : [];
});
console.log('\nà reprendre :'); reprendre.forEach(x => console.log('   ', x));
v('une seule fiche à reprendre', 1, reprendre.length);
v('R8 (à corriger) y figure', true, reprendre.some(x => /Brioche au fromage blanc/.test(x)));
v('R7 ratée PUIS validée n’y figure pas', false, reprendre.some(x => /Beignets/.test(x)));

const dernieres = await page.evaluate(() => {
  const b = [...document.querySelectorAll('.jr-bloc')].find(x => /Dernières fournées/.test(x.textContent));
  return [...b.querySelectorAll('.jr-liste li')].map(li => li.textContent.replace(/\s+/g, ' ').trim());
});
v('5 dernières fournées listées', 5, dernieres.length);
v('triées du plus récent', true, /^15\/09\/2026/.test(dernieres[0]));
v('la plus ancienne en dernier', true, /^02\/09\/2026/.test(dernieres[4]));
v('note affichée', true, dernieres.some(x => /huile trop chaude/.test(x)));

const souvent = await page.evaluate(() => {
  const b = [...document.querySelectorAll('.jr-bloc')].find(x => /plus refaites/.test(x.textContent));
  return b ? [...b.querySelectorAll('.jr-liste li')].map(li => li.textContent.replace(/\s+/g, ' ').trim()) : [];
});
console.log('\nles plus refaites :'); souvent.forEach(x => console.log('   ', x));
v('deux fiches faites 2 fois', 2, souvent.length);
v('comptage correct', true, souvent.every(x => /2 fois/.test(x)));

v('liens vers les fiches', true, await page.evaluate(() =>
  !!document.querySelector('#journal-des-fournees .jr-liste a[href^="#"]')));

// tout valider doit vider « à reprendre »
await fournee('R8', '2026-09-16', 'validé', 'mieux');
await page.waitForTimeout(600);
v('plus rien à reprendre', true, (await synthese()).includes('Rien à reprendre'));

console.log('\n✓ ' + ok.length + ' contrôles passés');
ok.forEach(o => console.log('   ✓', o));
if (ko.length) { console.log('\n✗ ' + ko.length + ' ÉCHECS'); ko.forEach(k => console.log('   ✗', k)); }
if (erreurs.length) { console.log('\nerreurs JS :'); erreurs.forEach(e => console.log('   !', e)); }
await nav.close();
process.exit(ko.length || erreurs.length ? 1 : 0);
})();
