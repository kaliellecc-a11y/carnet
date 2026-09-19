import re, sys, markdown, pathlib, html

import verifie
import quantites

VERSION = "v11.4"
DATE = "2026-09-16"

# Une fiche incohérente ne doit pas atteindre la page : le contrôle passe avant
# la construction, et une erreur arrête tout. Les avertissements laissent passer.
if verifie.main() != 0:
    sys.exit("\nbuild interrompu : corriger les erreurs ci-dessus")
print()

SRC = pathlib.Path("carnet-kefir-levain.md")
md = SRC.read_text(encoding="utf-8")

# Les valeurs qui composent chaque recette, relevées sur le markdown avant toute
# transformation : c'est elles qui disent quel rappel de poids suit le facteur.
QUANTITES = quantites.quantites_du_maitre(md)

# ---------------------------------------------------------------- liens croisés
# Toute référence R/G/B/K/T + numéro dans la prose devient un lien vers la fiche.
RIDS = set(re.findall(r"^#### ([A-Z]\d+) ·", md, re.M))

# v11 — les numéros restent les identifiants (ancres, notes, journal) mais ne s'affichent plus :
# un renvoi « R8 » s'affiche avec le nom court de la fiche (partie du titre avant la première virgule).
NOMS = {m.group(1): m.group(2).strip() for m in re.finditer(r"^#### ([A-Z]\d+) · (.*?)\s*<span class=\"niveau", md, re.M)}
COURT = {rid: nom.split(",")[0].strip() for rid, nom in NOMS.items()}
COURT.update({"K1": "F1 du kéfir d'eau", "K2": "F2 du kéfir d'eau", "W3": "Demi-potimarrons aux œufs",
              "T4": "Lentilles vertes aux œufs gratinés", "T3": "Pois chiches épicés à la tomate"})

def _xref_md(m):
    rid = m.group(1)
    return f'<a class="xref" href="#{rid.lower()}">{html.escape(COURT[rid])}</a>' if rid in RIDS else rid

def _xref_html(m):
    rid = m.group(1)
    return f'<a class="xref" href="#{rid.lower()}">{html.escape(COURT[rid])}</a>' if rid in RIDS else rid

XPAT = re.compile(r"(?<![\w#/-])([RGBKTW]\d{1,2})(?![\dA-Za-z])")
lines = []
for line in md.split("\n"):
    if line.startswith("####"):
        pass                                   # jamais dans les titres de fiche
    elif line.lstrip().startswith('<p class="meta">'):
        line = XPAT.sub(_xref_html, line)      # bloc HTML brut : lien HTML direct
    else:
        line = XPAT.sub(_xref_md, line)        # prose et tables markdown : lien markdown
    lines.append(line)
md = "\n".join(lines)

body = markdown.markdown(
    md,
    extensions=["md_in_html", "tables", "toc", "smarty"],
    extension_configs={"toc": {"slugify": lambda v, s: re.sub(r"[^a-z0-9]+", "-", v.lower().replace("é","e").replace("è","e").replace("ê","e").replace("à","a").replace("ô","o")).strip("-")}},
    output_format="html5",
)

# retirer le H1 (le gabarit porte le titre) ; plus de texte de version affiché
m = re.search(r"<h1[^>]*>.*?</h1>\s*", body, re.S)
body = body[m.end():]

# ancres stables des fiches : id = numéro en minuscules (r1, g14, b2, k3, t1)
body = re.sub(r'<h4 id="[^"]*">([A-Z]\d+) ·', lambda mm: f'<h4 id="{mm.group(1).lower()}">{mm.group(1)} ·', body)

# ------------------------------------------------------------------- sommaire
# 3 niveaux : sections (h2), sous-catégories (h3), fiches (h4)
toc = []
for mm in re.finditer(r'<h([234]) id="([^"]+)">(.*?)</h\1>', body, re.S):
    lvl, hid, txt = mm.groups()
    txt = re.sub(r"<span.*?</span>", "", txt).strip()
    txt = re.sub(r"<.*?>", "", txt)
    toc.append((lvl, hid, txt))

nav = ['<nav class="toc" id="sommaire" aria-label="Sommaire"><p class="toc-label">Sommaire</p><ol>']
for lvl, hid, txt in toc:
    cls = {"2": "sec", "3": "sub", "4": "rec"}[lvl]
    if lvl == "4":
        num, _, rest = txt.partition(" · ")
        nav.append(f'<li class="{cls}"><a href="#{hid}">{rest}</a></li>')
    else:
        nav.append(f'<li class="{cls}"><a href="#{hid}">{txt}</a></li>')
nav.append('<li class="sec"><a href="#index-types">Index par type de plat</a></li>')
nav.append('<li class="sec"><a href="#index-ingredients">Index des ingrédients</a></li>')
nav.append('<li class="sec"><a href="#index-techniques">Index des techniques</a></li>')
nav.append('<li class="sec"><a href="#journal-des-fournees">Journal des fournées</a></li>')
nav.append("</ol></nav>")
nav = "\n".join(nav)

# recipe title: split number from name
body = re.sub(
    r'<h4 id="([^"]+)">([A-Z]\d+) · (.*?)(<span class="niveau [ab]">[AB]</span>)</h4>',
    r'<h4 id="\1"><span class="rnum">\2</span><span class="rname">\3</span>\4</h4>',
    body,
)

# ---------------------------------------------------------------------- index
def _plain(h):
    h = re.sub(r'<a class="xref"[^>]*>.*?</a>', " ", h)   # un renvoi vers une autre fiche n'est pas un ingrédient
    t = re.sub(r"<[^>]+>", " ", h)
    return html.unescape(t).lower()

FICHES = []   # (rid, texte en clair)
for mm in re.finditer(r'<article class="fiche">(.*?)</article>', body, re.S):
    art = mm.group(1)
    hd = re.search(r'<span class="rnum">([A-Z]\d+)</span>', art)
    if hd:
        FICHES.append((hd.group(1), _plain(art)))

INGREDIENTS = [
    ("amande (poudre, pâte)", r"amande"),
    ("avoine", r"avoine"),
    ("banane", r"banane"),
    ("cacao · chocolat", r"cacao|chocolat"),
    ("café", r"(?<!à )\bcafés?\b"),
    ("cannelle", r"cannelle"),
    ("cardamome", r"cardamome"),
    ("citron", r"citron"),
    ("coco", r"\bcoco\b"),
    ("crème liquide", r"crème (?:15|30|liquide|fleurette)"),
    ("fleur d'oranger", r"fleur d['’]oranger"),
    ("fruits rouges", r"fruits rouges|fraise|framboise|myrtille|cassis|groseille"),
    ("graines", r"\bgraines\b"),
    ("huile d'olive", r"huile d['’]olive"),
    ("levain dur", r"levain dur"),
    ("levain-mère", r"levain-mère"),
    ("mangue", r"mangue"),
    ("miso · sauce soja", r"miso|sauce soja"),
    ("noisette", r"noisette"),
    ("parmesan", r"parmesan"),
    ("passion", r"passion"),
    ("pêche · abricot", r"\bpêches?\b|abricot"),
    ("petit-lait", r"petit-lait"),
    ("pistache", r"pistache"),
    ("pois chiche", r"pois chiche"),
    ("pomme", r"\bpommes?\b(?! de terre)"),
    ("pomme de terre", r"pommes? de terre"),
    ("poulet · dinde", r"poulet|dinde"),
    ("lentilles", r"lentilles?"),
    ("haricots rouges", r"haricots? rouges?"),
    ("poireau", r"poireau"),
    ("panais", r"panais"),
    ("poivron", r"poivron"),
    ("feta · cottage", r"\bfeta\b|cottage"),
    ("thon", r"\bthon\b"),
    ("lardons", r"lardons|allumettes fumées"),
    ("patate douce", r"patate douce"),
    ("potiron · potimarron · courge", r"potiron|potimarron|courge|butternut"),
    ("riz", r"\briz\b"),
    ("sarrasin", r"sarrasin"),
    ("seigle", r"seigle"),
    ("skyr · fromage blanc · yaourt", r"\bskyr\b|fromage blanc|\byaourts?\b"),
    ("vanille", r"vanille"),
    ("pois cassés", r"pois cassés"),
    ("chorizo", r"chorizo"),
    ("emmental", r"emmental"),
    ("oignons confits", r"oignons? confits?"),
    ("oignon", r"\boignons?\b"),
]
TECHNIQUES = [
    ("Air Fry · friture à l'air", r"air fry|air crisp"),
    ("autolyse", r"autolyse"),
    ("bain-marie", r"bain-marie"),
    ("blancs en neige", r"blancs montés|monter les (?:\d+ )?blancs|blancs en neige"),
    ("congélation 24 h à plat (Creami)", r"24 h à plat|max, 24 h"),
    ("dorure", r"dorure"),
    ("égouttage", r"\bégouttage\b"),
    ("F1 · F2 (kéfir d'eau)", r"\bf1\b|\bf2\b"),
    ("Freeze Fill · Pour-In", r"freeze fill|pour-in"),
    ("friture à la poêle", r"170-175|cm d['’]huile"),
    ("pâte de la veille, nuit de fermentation", r"base du soir|nuit de fermentation|\ble soir\b|nuit au réfrigérateur en boule|ou nuit au réfrigérateur|24 h au réfrigérateur en boîte"),
    ("Rissolé puis cuisson sous pression", r"rissolé"),
    ("trempage des légumineuses", r"trempage 8|trempage la veille"),
    ("couvercle Extra Crisp", r"extra crisp"),
    ("Déshydrater (Woodfire)", r"déshydrater"),
    ("granulés Woodfire, fumé", r"granulés woodfire"),
    ("pâte à congeler", r"sachet de congélation|sachet daté"),
    ("pochage", r"pocher"),
    ("pierre · plaque préchauffée", r"\bpierre\b|préchauffée"),
    ("poêle en fonte", r"en fonte"),
    ("rabats", r"rabats"),
    ("rafraîchi du levain", r"rafraîch"),
    ("Re-spin", r"re-spin"),
    ("dégorger et essorer", r"dégorg"),
]

def build_index(terms, hid, titre, note):
    rows = []
    for label, pat in terms:
        rx = re.compile(pat)
        hits = [rid for rid, txt in FICHES if rx.search(txt)]
        if hits:
            refs = " · ".join(f'<a class="xref" href="#{r.lower()}">{html.escape(COURT[r])}</a>' for r in hits)
            rows.append(f'<p class="ix"><span class="terme">{label}</span><span class="refs">{refs}</span></p>')
    return (f'<section class="index" id="{hid}"><h2>{titre}</h2>'
            f'<p class="index-note">{note}</p><div class="index-cols">' + "\n".join(rows) + "</div></section>")

# index par type de plat : sous-catégories « Salé · X » / « Sucré · X » / « Bases · X »
TYPES = {}
cur = None
for mm in re.finditer(r'<h3 id="[^"]+">(.*?)</h3>|<h4 id="([^"]+)">', body, re.S):
    if mm.group(1) is not None:
        t = re.sub(r"<.*?>", "", mm.group(1))
        if " · " in t:
            fam, typ = t.split(" · ", 1)
            cur = "Bases" if fam == "Bases" else typ
        else:
            cur = None
    elif cur:
        rid = mm.group(2).upper()
        if rid in COURT:
            TYPES.setdefault(cur, []).append(rid)
rows = [f'<p class="ix"><span class="terme">{html.escape(t)}</span><span class="refs">'
        + " · ".join(f'<a class="xref" href="#{r.lower()}">{html.escape(COURT[r])}</a>' for r in rids)
        + '</span></p>' for t, rids in TYPES.items()]
types_html = ('<section class="index" id="index-types"><h2>Index par type de plat</h2>'
              '<p class="index-note">Toutes les fiches d\'un même type, quel que soit l\'appareil.</p><div class="index-cols">'
              + "\n".join(rows) + "</div></section>")

index_html = types_html + (
    build_index(INGREDIENTS, "index-ingredients", "Index des ingrédients",
                "Fiches où l'ingrédient joue un rôle. Généré automatiquement à chaque build.")
    + build_index(TECHNIQUES, "index-techniques", "Index des techniques",
                  "Le geste, et toutes les fiches qui l'emploient.")
)

# -------------------------------------------------------------- outils de fiche
def wrap_fiche(m):
    art = m.group(0)
    head, sep, rest = art.partition('</p>')  # meta paragraph ends the head
    rest = rest.replace('</article>', '')
    rid = re.search(r'<span class="rnum">([A-Z]\d+)</span>', art).group(1)
    # colonne d'ingrédients : le bloc « Ingrédients. » + sa liste passent en aside,
    # le reste (méthode, variantes, pièges) en colonne de droite
    gm = None
    hm = re.search(r'<p><strong>(?:Ingrédients|Dosage)\.</strong></p>\s*<ul>', rest)
    if hm:
        # fin de la liste de premier niveau : on équilibre <ul>/</ul> (groupes imbriqués)
        depth, pos = 1, hm.end()
        for tm in re.finditer(r'<(/?)ul>', rest[pos:]):
            depth += -1 if tm.group(1) else 1
            if depth == 0:
                end = pos + tm.end()
                break
        gm = (rest[hm.start():end], rest[end:])
        connus = QUANTITES.get(rid, set())
        rest = (rest[:hm.start()] + '<div class="fgrid"><aside class="ing">'
                + quantites.balise_liste(gm[0])
                + '</aside><div class="mode">'
                + quantites.balise_methode(gm[1], connus) + '</div></div>')
    # encart F1 : injecté dans toute fiche R dont les ingrédients emploient le kéfir
    note = ""
    ing_txt = gm[0].lower() if gm else ""
    if rid.startswith("R") and "kéfir" in ing_txt:
        note = ('<p class="levant-note"><strong>Le kéfir de cette recette.</strong> F1 de 24-36 h : '
                '30 g de grains · 1 L d\'eau non chlorée · 60 g de sucre blanc, bocal couvert non hermétique, '
                'filtré, à température ambiante — test « pschitt » à l\'ouverture. '
                f'Détails et réglages : <a class="xref" href="#k1">{COURT["K1"]}</a>.</p>')
    # rendement balisé, et bandeau de réglage hors de la zone éditable
    reference = None
    mm = re.search(r'(<p class="meta">)(.*)$', head, re.S)
    if mm:
        meta_balisee, reference = quantites.balise_meta(mm.group(2))
        head = head[:mm.start()] + mm.group(1) + meta_balisee
    echelle = quantites.barre(rid, reference)

    ui = f"""
{echelle}
<div class="fiche-body" data-rid="{rid}">{note}{rest}</div>
<div class="outils" data-rid="{rid}">
  <div class="barre">
    <button type="button" class="btn edit">Modifier la recette</button>
    <button type="button" class="btn save" hidden>Enregistrer</button>
    <button type="button" class="btn cancel" hidden>Annuler</button>
    <button type="button" class="btn reset" hidden>Rétablir l'original</button>
    <span class="etat" aria-live="polite"></span>
    <a class="haut" href="#sommaire">Sommaire ↑</a>
  </div>
  <label class="notes-label">Mes notes<textarea class="notes" rows="2" placeholder="Ajustements, quantités qui marchent, idées…"></textarea></label>
  <div class="journal">
    <div class="journal-label">Journal des fournées</div>
    <ul class="entries"></ul>
    <form class="entry-form">
      <input type="date" name="date" required>
      <select name="verdict"><option value="validé">validé</option><option value="à corriger">à corriger</option><option value="raté">raté</option></select>
      <input type="text" name="note" placeholder="commentaire" maxlength="200">
      <button type="submit" class="btn">Ajouter</button>
    </form>
  </div>
</div>
</article>"""
    return head + sep + ui
body = re.sub(r'<article class="fiche">.*?</article>', wrap_fiche, body, flags=re.S)
body = body.replace("<table>", "<div class=\"table-wrap\"><table>").replace("</table>", "</table></div>")
css = pathlib.Path("style.css").read_text(encoding="utf-8")
js = pathlib.Path("app.js").read_text(encoding="utf-8")
fb = pathlib.Path("firebase-init.js").read_text(encoding="utf-8")
ech = pathlib.Path("echelle.js").read_text(encoding="utf-8")
hl = pathlib.Path("hors-ligne.js").read_text(encoding="utf-8")
rch = pathlib.Path("recherche.js").read_text(encoding="utf-8")
cou = pathlib.Path("courses.js").read_text(encoding="utf-8")
jrn = pathlib.Path("journal.js").read_text(encoding="utf-8")
js = fb + "\n" + js + "\n" + ech + "\n" + hl + "\n" + rch + "\n" + cou + "\n" + jrn

page = f"""<title>Carnet de recettes</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Literata:ital,opsz,wght@0,7..72,400..600;1,7..72,400..600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
{css}
</style>
<div class="page">
<header class="masthead">
  <p class="kicker">Carnet {VERSION} · {DATE} · Courmes</p>
  <h1>Carnet de recettes<br><span class="sub">pâtes levées, glaces &amp; fermentations — au kéfir de fruits</span></h1>
</header>
<div class="cols">
{nav}
<main class="content">
<p class="sync-etat" aria-live="polite"></p>
{body}
{index_html}
</main>
</div>
<section class="jr" id="journal-des-fournees">
  <h2>Journal des fournées</h2>
  <div class="jr-corps"></div>
</section>
<section class="carnet-libre" id="carnet-de-notes">
  <h2>Carnet de notes</h2>
  <p class="etat-global"></p>
  <textarea class="notes-globales" rows="6" placeholder="Idées, courses, ce qui a marché cette semaine…"></textarea>
</section>
<footer class="colophon">Carnet de recettes · {VERSION} · {DATE} · Fraunces, Literata, IBM Plex Mono</footer>
</div>
<script>
{js}
</script>
"""
pathlib.Path("carnet-de-fournil.html").write_text(page, encoding="utf-8")

# standalone (with doctype) : la page mise en ligne, et le fichier livrable
tete = ("<!doctype html><html lang=\"fr\"><head><meta charset=\"utf-8\">"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
        "<link rel=\"manifest\" href=\"./manifest.webmanifest\">"
        "<meta name=\"theme-color\" content=\"#7A3A15\">"
        "<link rel=\"apple-touch-icon\" href=\"./icones/icone-192.png\">"
        "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">"
        "<meta name=\"apple-mobile-web-app-title\" content=\"Carnet\">")
full = tete + page.split("<div class=\"page\">",1)[0] + "</head><body><div class=\"page\">" + page.split("<div class=\"page\">",1)[1] + "</body></html>"
pathlib.Path("carnet-de-fournil.standalone.html").write_text(full, encoding="utf-8")

# ---------------------------------------------------------------- dossier servi
# Tout ce que Netlify publie, assemblé ici plutôt qu'en commandes shell : le
# service worker et le manifeste doivent être à la racine du site pour couvrir
# l'ensemble des pages.
import shutil
DIST = pathlib.Path("dist")
if DIST.exists():
    shutil.rmtree(DIST)
(DIST / "icones").mkdir(parents=True)
(DIST / "index.html").write_text(full, encoding="utf-8")
(DIST / "sw.js").write_text(
    pathlib.Path("sw.js").read_text(encoding="utf-8").replace("__VERSION__", f"{VERSION}-{DATE}"),
    encoding="utf-8")
shutil.copy2("manifest.webmanifest", DIST / "manifest.webmanifest")
for ico in ("icone-192.png", "icone-512.png"):
    shutil.copy2(pathlib.Path("icones") / ico, DIST / "icones" / ico)
print("dist/ prêt :", ", ".join(sorted(p.name for p in DIST.rglob("*") if p.is_file())))
print("ok", len(page))
