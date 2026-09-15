/* Export PDF du carnet.
   Souche : remplacer par le pdf.js du projet. */

export function exporterPdf() {
  // TODO : génération PDF (impression navigateur ou bibliothèque dédiée).
  window.print();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#export-pdf")?.addEventListener("click", exporterPdf);
});
