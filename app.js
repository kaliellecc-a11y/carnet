(function () {
  "use strict";
  var store = null;        // {get(id), set(id, data)} — db or localStorage
  var mode = "local";
  var cache = {};          // id -> data

  function ls(key) { try { return JSON.parse(localStorage.getItem("carnet:" + key) || "null"); } catch (e) { return null; } }
  function lsSet(key, v) { try { localStorage.setItem("carnet:" + key, JSON.stringify(v)); return true; } catch (e) { return false; } }

  var localStore = {
    get: function (id) { return Promise.resolve(ls(id) || {}); },
    set: function (id, data) { lsSet(id, data); return Promise.resolve(); },
    watch: function (id, fn) { fn(ls(id) || {}); return function () {}; }
  };

  function dbStore(db) {
    return {
      get: function (id) { return db.doc("carnet/" + id).get().then(function (s) { return s.exists ? s.data() : {}; }); },
      set: function (id, data) { return db.doc("carnet/" + id).set(data); },
      watch: function (id, fn) {
        return db.doc("carnet/" + id).onSnapshot(function (s) { fn(s.exists ? (s.data() || {}) : {}); }, function () {});
      }
    };
  }

  function strip(html) { return String(html).replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, ""); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmtDate(iso) { if (!iso) return ""; var p = iso.split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso; }

  var debounce = {};
  function later(id, fn) { clearTimeout(debounce[id]); debounce[id] = setTimeout(fn, 700); }

  function setEtat(el, txt, ok) { el.textContent = txt; el.classList.toggle("ok", !!ok); if (txt) setTimeout(function () { if (el.textContent === txt) el.textContent = ""; }, 2500); }

  function save(id, patch, etatEl) {
    var data = Object.assign({}, cache[id] || {}, patch, { updatedAt: new Date().toISOString() });
    cache[id] = data;
    return store.set(id, data).then(function () { if (etatEl) setEtat(etatEl, mode === "db" ? "Enregistré" : "Enregistré sur cet appareil", true); })
      .catch(function (e) { if (etatEl) setEtat(etatEl, "Échec : " + (e && e.message ? e.message : e), false); });
  }

  function renderJournal(ul, entries) {
    ul.innerHTML = "";
    (entries || []).slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); }).forEach(function (e, i) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="jdate">' + esc(fmtDate(e.date)) + '</span><span class="jverdict v-' + esc((e.verdict || "").replace(/\W/g, "")) + '">' + esc(e.verdict || "") + '</span><span class="jnote">' + esc(e.note || "") + '</span><button type="button" class="jdel" aria-label="Supprimer">×</button>';
      li.querySelector(".jdel").addEventListener("click", function () {
        var id = ul.closest(".outils").dataset.rid;
        var list = (cache[id].journal || []).filter(function (x) { return x !== e; });
        save(id, { journal: list }, ul.closest(".outils").querySelector(".etat"));
        renderJournal(ul, list);
      });
      ul.appendChild(li);
    });
  }

  function wireFiche(outils) {
    var id = outils.dataset.rid;
    var body = document.querySelector('.fiche-body[data-rid="' + id + '"]');
    var original = body.innerHTML;
    var etat = outils.querySelector(".etat");
    var bEdit = outils.querySelector(".edit"), bSave = outils.querySelector(".save"), bCancel = outils.querySelector(".cancel"), bReset = outils.querySelector(".reset");
    var notes = outils.querySelector(".notes");
    var ul = outils.querySelector(".entries");
    var form = outils.querySelector(".entry-form");
    var before = "";

    function editing(on) {
      body.contentEditable = on ? "true" : "false";
      body.classList.toggle("editing", on);
      bEdit.hidden = on; bSave.hidden = !on; bCancel.hidden = !on;
      bReset.hidden = on || !(cache[id] && cache[id].html);
      if (on) body.focus();
    }
    bEdit.addEventListener("click", function () { before = body.innerHTML; editing(true); });
    bCancel.addEventListener("click", function () { body.innerHTML = before; editing(false); });
    bSave.addEventListener("click", function () {
      editing(false);
      save(id, { html: strip(body.innerHTML) }, etat).then(function () { bReset.hidden = false; });
    });
    bReset.addEventListener("click", function () {
      body.innerHTML = original;
      save(id, { html: null }, etat); bReset.hidden = true;
    });
    notes.addEventListener("input", function () { later(id + ":n", function () { save(id, { notes: notes.value }, etat); }); });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var fd = new FormData(form);
      var entry = { date: fd.get("date"), verdict: fd.get("verdict"), note: (fd.get("note") || "").trim() };
      var list = (cache[id] && cache[id].journal ? cache[id].journal : []).concat([entry]);
      save(id, { journal: list }, etat);
      renderJournal(ul, list);
      form.reset();
      form.querySelector('[name="date"]').value = new Date().toISOString().slice(0, 10);
    });
    form.querySelector('[name="date"]').value = new Date().toISOString().slice(0, 10);

    store.watch(id, function (data) {
      cache[id] = data || {};
      if (body.contentEditable !== "true") {
        if (data && data.html) { body.innerHTML = strip(data.html); body.classList.add("modifiee"); bReset.hidden = false; }
        else { if (body.classList.contains("modifiee")) body.innerHTML = original; body.classList.remove("modifiee"); bReset.hidden = true; }
      }
      if (document.activeElement !== notes) notes.value = (data && data.notes) || "";
      renderJournal(ul, data && data.journal);
    });
  }

  function wireGlobal() {
    var ta = document.querySelector(".notes-globales");
    var etat = document.querySelector(".etat-global");
    if (!ta) return;
    ta.addEventListener("input", function () { later("global", function () { save("global", { notes: ta.value }, etat); }); });
    store.watch("global", function (d) { cache.global = d || {}; if (document.activeElement !== ta) ta.value = (d && d.notes) || ""; });
  }

  function start() {
    document.querySelectorAll(".outils").forEach(wireFiche);
    wireGlobal();
    var banner = document.querySelector(".sync-etat");
    if (banner) banner.textContent = mode === "db" ? "Notes et modifications synchronisées : tu les retrouves sur ton téléphone, ta tablette et ton ordinateur." : "Notes gardées sur cet appareil seulement (synchronisation indisponible ici).";
  }

  function boot() {
    var claudeUse = (window.claude && typeof window.claude.use === "function") ? window.claude.use("db") : Promise.resolve(null);
    claudeUse.catch(function () { return null; }).then(function (db) {
      if (db) return db;
      // hors Artifact (fichier HTML ouvert depuis le disque ou un site) : base Firebase du carnet
      return (typeof window.carnetFirebase === "function") ? window.carnetFirebase() : null;
    }).then(function (db) {
      if (db) { store = dbStore(db); mode = "db"; } else { store = localStore; mode = "local"; }
    }).catch(function () { store = localStore; mode = "local"; }).then(function () {
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
    });
  }
  boot();
})();
/* Mes recettes (ajout libre) */
(function () {
  "use strict";
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function init() {
    var sec = document.querySelector(".mes-recettes"); if (!sec) return;
    var list = sec.querySelector(".mr-liste"), form = sec.querySelector(".mr-form"), etat = sec.querySelector(".etat-mr");
    var items = [], store = null, mode = "local";
    function ls() { try { return JSON.parse(localStorage.getItem("carnet:mes-recettes") || "null") || {}; } catch (e) { return {}; } }
    function persist() {
      var data = { items: items, updatedAt: new Date().toISOString() };
      var p = mode === "db" ? store.doc("carnet/mes-recettes").set(data) : Promise.resolve((function(){ try { localStorage.setItem("carnet:mes-recettes", JSON.stringify(data)); } catch (e) {} })());
      return p.then(function () { etat.textContent = mode === "db" ? "Enregistré" : "Enregistré sur cet appareil"; setTimeout(function () { etat.textContent = ""; }, 2500); })
        .catch(function (e) { etat.textContent = "Échec : " + (e && e.message ? e.message : e); });
    }
    function render() {
      list.innerHTML = "";
      items.forEach(function (it) {
        var art = document.createElement("article"); art.className = "fiche mr-item";
        art.innerHTML = '<h4><span class="rnum">Perso</span><span class="rname"></span></h4><div class="fiche-body"><textarea class="mr-text" rows="6"></textarea></div><div class="outils"><div class="barre"><button type="button" class="btn mr-save">Enregistrer</button><button type="button" class="btn mr-del">Supprimer</button></div></div>';
        art.querySelector(".rname").textContent = it.title;
        var ta = art.querySelector(".mr-text"); ta.value = it.text || "";
        art.querySelector(".mr-save").addEventListener("click", function () { it.text = ta.value; persist(); });
        art.querySelector(".mr-del").addEventListener("click", function () { items = items.filter(function (x) { return x !== it; }); render(); persist(); });
        list.appendChild(art);
      });
    }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var fd = new FormData(form);
      items.push({ id: String(Date.now()), title: String(fd.get("title") || "").trim(), text: String(fd.get("text") || "").trim(), createdAt: new Date().toISOString() });
      form.reset(); render(); persist();
    });
    var use = (window.claude && typeof window.claude.use === "function") ? window.claude.use("db") : Promise.resolve(null);
    use.catch(function () { return null; }).then(function (db) {
      if (db) return db;
      return (typeof window.carnetFirebase === "function") ? window.carnetFirebase() : null;
    }).then(function (db) {
      if (db) {
        store = db; mode = "db";
        db.doc("carnet/mes-recettes").onSnapshot(function (s) { var d = s.exists ? s.data() : null; if (d && d.items && document.activeElement && !document.activeElement.closest(".mr-item")) { items = d.items; render(); } else if (d && d.items && !items.length) { items = d.items; render(); } }, function () {});
      } else { items = ls().items || []; render(); }
    }).catch(function () { items = ls().items || []; render(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
