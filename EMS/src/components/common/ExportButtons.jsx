import { MdDownload, MdPictureAsPdf, MdGridOn } from "react-icons/md";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import toast from "react-hot-toast";

export default function ExportButtons({ data, filename, title, columns, pdfData }) {
  const handleExcelExport = () => {
    if (!data || data.length === 0) {
      toast.error("Export করার জন্য কোনো data নেই!");
      return;
    }
    exportToExcel(data, filename);
    toast.success("Excel Export হয়েছে!");
  };

  const handlePDFExport = () => {
    if (!pdfData || pdfData.length === 0) {
      toast.error("Export করার জন্য কোনো data নেই!");
      return;
    }
    exportToPDF(columns, pdfData, filename, title);
    toast.success("PDF Export হয়েছে!");
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button onClick={handleExcelExport} style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "8px 16px", background: "#22c55e22",
        border: "1px solid #22c55e44", borderRadius: "8px",
        color: "#22c55e", cursor: "pointer", fontSize: "13px",
        fontWeight: "500"
      }}>
        <MdGridOn size={16} /> Excel
      </button>
      <button onClick={handlePDFExport} style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "8px 16px", background: "#ef444422",
        border: "1px solid #ef444444", borderRadius: "8px",
        color: "#ef4444", cursor: "pointer", fontSize: "13px",
        fontWeight: "500"
      }}>
        <MdPictureAsPdf size={16} /> PDF
      </button>
    </div>
  );
}