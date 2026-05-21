import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ✅ Excel Export — বাংলা সাপোর্ট করে
export const exportToExcel = (data, filename, sheetName = "Sheet1") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `${filename}.xlsx`);
};

// ✅ PDF Export — ইংরেজি data ব্যবহার করুন
export const exportToPDF = (columns, data, filename, title) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 20);

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Total Records: ${data.length}`, 14, 37);

  autoTable(doc, {
    startY: 44,
    head: [columns],
    body: data,
    styles: {
      fontSize: 9,
      font: "helvetica",
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles: {
      0: { cellWidth: "auto" }
    },
    margin: { top: 44, left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} — EMS Report`,
      doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  doc.save(`${filename}.pdf`);
};