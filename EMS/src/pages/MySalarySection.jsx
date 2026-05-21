import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MySalarySection() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSalaries(); }, []);

  const fetchSalaries = async () => {
    try {
      const { data } = await API.get("/salary/my");
      setSalaries(data);
    } catch (error) {
      toast.error("বেতন লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (salary) => {
  const doc = new jsPDF();
  autoTable(doc, {
    startY: 65,
    head: [["বিবরণ", "পরিমাণ (৳)"]],
    body: [
      ["মূল বেতন", salary.basicSalary.toLocaleString()],
      ["বোনাস", `+${salary.bonus.toLocaleString()}`],
      ["কর্তন", `-${salary.deduction.toLocaleString()}`],
      ["নেট বেতন", salary.netSalary.toLocaleString()],
    ],
    styles: { fontSize: 12 },
    headStyles: { fillColor: [99, 102, 241] },
  });
  doc.save(`payslip-${salary.month}-${salary.year}.pdf`);
  toast.success("Payslip Download হয়েছে!");
};

  if (loading) return <p style={{ color: "#94a3b8" }}>লোড হচ্ছে...</p>;

  return (
    <div>
      <h3 style={{ color: "#f1f5f9", marginBottom: "20px" }}>আমার বেতন</h3>
      {salaries.length === 0 ? (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "60px", border: "1px solid #334155", textAlign: "center"
        }}>
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো বেতন তথ্য নেই</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {salaries.map(salary => (
            <div key={salary._id} style={{
              background: "#1e293b", borderRadius: "12px",
              padding: "20px", border: "1px solid #334155",
              borderLeft: `4px solid ${salary.status === "paid" ? "#22c55e" : "#f59e0b"}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <h4 style={{ color: "#f1f5f9" }}>{salary.month} {salary.year}</h4>
                <span style={{
                  padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                  background: salary.status === "paid" ? "#22c55e22" : "#f59e0b22",
                  color: salary.status === "paid" ? "#22c55e" : "#f59e0b"
                }}>
                  {salary.status === "paid" ? "✅ পরিশোধিত" : "⏳ অপরিশোধিত"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
                {[
                  { label: "মূল বেতন", value: `৳${salary.basicSalary.toLocaleString()}`, color: "#f1f5f9" },
                  { label: "বোনাস", value: `+৳${salary.bonus.toLocaleString()}`, color: "#22c55e" },
                  { label: "কর্তন", value: `-৳${salary.deduction.toLocaleString()}`, color: "#ef4444" },
                  { label: "নেট বেতন", value: `৳${salary.netSalary.toLocaleString()}`, color: "#6366f1" },
                ].map(item => (
                  <div key={item.label} style={{
                    background: "#0f172a", borderRadius: "8px",
                    padding: "12px", textAlign: "center"
                  }}>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>{item.label}</p>
                    <p style={{ color: item.color, fontSize: "16px", fontWeight: "700" }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {salary.status === "paid" && (
                <button onClick={() => handleDownload(salary)} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", background: "#6366f122",
                  border: "1px solid #6366f144", borderRadius: "8px",
                  color: "#6366f1", cursor: "pointer", fontSize: "13px"
                }}>
                  📄 Payslip Download করুন
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}