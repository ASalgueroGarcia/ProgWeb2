const PDFDocument = require("pdfkit");

const generateDeliveryNotePdf = (note) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("ALBARAN / DELIVERY NOTE", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${note.workDate ? new Date(note.workDate).toLocaleDateString() : "-"}`);
    doc.text(`Descripcion: ${note.description || "-"}`);
    doc.moveDown();
    if (note.client) doc.text(`Cliente: ${note.client.name || note.client} — CIF: ${note.client.cif || "-"}`);
    if (note.project) doc.text(`Proyecto: ${note.project.name || note.project} (${note.project.projectCode || "-"})`);
    doc.moveDown();

    if (note.format === "hours") {
      doc.text(`Formato: Horas`);
      doc.text(`Horas totales: ${note.hours || "-"}`);
      if (note.workers && note.workers.length) {
        doc.text("Trabajadores:");
        note.workers.forEach(w => doc.text(`  - ${w.name}: ${w.hours}h`));
      }
    } else {
      doc.text(`Formato: Material`);
      doc.text(`Material: ${note.material || "-"}`);
      doc.text(`Cantidad: ${note.quantity || "-"} ${note.unit || ""}`);
    }

    if (note.signed) {
      doc.moveDown().text(`Firmado el ${note.signedAt ? new Date(note.signedAt).toLocaleDateString() : "-"}`);
    }

    doc.end();
  });
};

module.exports = { generateDeliveryNotePdf };
