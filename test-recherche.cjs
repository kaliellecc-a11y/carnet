const { chromium } = require('playwright');
(async () => {
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await nav.newPage({ viewport: { width: 1200, height: 900 } });
const erreurs = []; page.on('pageerror', e => erreurs.push(String(e)));
await page.goto('file:///home/user/carnet/carnet-de-fournil.standalone.html');
await page.waitForTimeout(600);

const ok = [], ko = [];
const v = (nom, attendu, obtenu) =>
  (String(attendu) === String(obtenu) ? ok : ko).push(`${nom} : ${obtenu}`);

const chercher = async (q) => {
  await page.fill('.rech-champ', q);
  await page.waitForTimeout(220);
  return page.evaluate(() => ({
    fiches: [...document.querySelectorAll('article.fiche')].filter(a => !a.classList.contains('masque')).length,
    compteur: document.querySelector('.rech-compteur').textContent,
    toc: [...document.querySelectorAll('.toc li.rec')].filter(l => !l.classList.contains('masque')).length,
    titres: [...document.querySelectorAll('.content h2, .content h3')].filter(h => !h.classList.contains('masque')).length,
    index: [...document.querySelectorAll('.content section.index')].filter(s => !s.classList.contains('masque')).length,
  }));
};

v('champ présent', true, await page.evaluate(() => !!document.querySelector('.rech-champ')));
v('68 fiches au départ', 68, await page.evaluate(() =>
  [...document.querySelectorAll('article.fiche')].filter(a => !a.classList.contains('masque')).length));

let r = await chercher('potimarron');
console.log('« potimarron » →', r.compteur, '| sommaire :', r.toc, '| titres :', r.titres, '| index :', r.index);
v('potimarron trouve des fiches', true, r.fiches > 0 && r.fiches < 68);
v('sommaire filtré à l’identique', r.fiches, r.toc);
v('index masqués pendant la recherche', 0, r.index);
v('titres de section conservés', true, r.titres > 0);

const sansAccent = await chercher('kefir');
const avecAccent = await chercher('kéfir');
v('« kefir » = « kéfir »', avecAccent.fiches, sansAccent.fiches);
console.log('« kefir » →', sansAccent.compteur);

const majus = await chercher('POÊLE');
const minus = await chercher('poêle');
v('casse ignorée', minus.fiches, majus.fiches);

r = await chercher('bain-marie');
console.log('« bain-marie » →', r.compteur, '(terme de méthode, absent des index)');
v('cherche dans la méthode', true, r.fiches > 0);

r = await chercher('levain beignet');
console.log('« levain beignet » →', r.compteur, '(deux mots : les deux doivent être présents)');
v('deux mots = intersection', true, r.fiches >= 1 && r.fiches <= 4);

r = await chercher('zzzz');
v('aucun résultat annoncé', 'aucune fiche', r.compteur);
v('rien d’affiché', 0, r.fiches);

await page.fill('.rech-champ', '');
await page.waitForTimeout(220);
const remis = await page.evaluate(() => ({
  fiches: [...document.querySelectorAll('article.fiche')].filter(a => !a.classList.contains('masque')).length,
  index: [...document.querySelectorAll('.content section.index')].filter(s => !s.classList.contains('masque')).length,
  toc: [...document.querySelectorAll('.toc li.rec')].filter(l => !l.classList.contains('masque')).length,
}));
v('tout revient en vidant', 68, remis.fiches);
v('index revenus', 3, remis.index);
v('sommaire revenu', 68, remis.toc);

// une recette personnelle ajoutée après le chargement doit être trouvable
await page.evaluate(() => {
  const liste = document.querySelector('.mr-liste');
  const art = document.createElement('article');
  art.className = 'fiche mr-item';
  art.innerHTML = '<h4><span class="rname">Tarte aux myrtilles de mamie</span></h4>';
  liste.appendChild(art);
});
r = await chercher('myrtilles mamie');
console.log('recette perso ajoutée après coup →', r.compteur);
v('recette personnelle trouvée', true, await page.evaluate(() =>
  [...document.querySelectorAll('.mr-item')].some(x => !x.classList.contains('masque'))));
v('sa section est rouverte', true, await page.evaluate(() =>
  !document.querySelector('.mes-recettes').classList.contains('masque')));
await page.fill('.rech-champ', '');
await page.waitForTimeout(220);

// la touche « / » ne doit pas voler le focus pendant qu'on écrit une note
await page.evaluate(() => document.querySelector('.notes-globales').focus());
await page.keyboard.press('/');
v('« / » respecte une note en cours', true, await page.evaluate(() =>
  document.activeElement.classList.contains('notes-globales')));
await page.evaluate(() => document.activeElement.blur());
await page.keyboard.press('/');
v('« / » met le curseur dans la recherche', true, await page.evaluate(() =>
  document.activeElement.classList.contains('rech-champ')));

console.log('\n✓ ' + ok.length + ' contrôles passés');
ok.forEach(o => console.log('   ✓', o));
if (ko.length) { console.log('\n✗ ' + ko.length + ' ÉCHECS'); ko.forEach(k => console.log('   ✗', k)); }
if (erreurs.length) { console.log('\nerreurs JS :'); erreurs.forEach(e => console.log('   !', e)); }
await nav.close();
process.exit(ko.length || erreurs.length ? 1 : 0);
})();
