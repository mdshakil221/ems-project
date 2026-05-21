import { useState, useEffect } from "react";
import API from "../../../api/axios";
import { MdPayment, MdAdd, MdEdit, MdCheck } from "react-icons/md";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExportButtons from "../../../components/common/ExportButtons";

export default function SalaryPage() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ bonus: 0, deduction: 0 });
  const [filter, setFilter] = useState({
    month: new Date().toLocaleString("en-US", { month: "long" }),
    year: new Date().getFullYear().toString()
  });

  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const years = ["2024", "2025", "2026"];

  useEffect(() => { fetchSalaries(); }, [filter]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/salary?month=${filter.month}&year=${filter.year}`);
      setSalaries(data);
    } catch (error) {
      toast.error("বেতন লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const { data } = await API.post("/salary/generate", filter);
      toast.success(data.message);
      fetchSalaries();
    } catch (error) {
      toast.error("বেতন তৈরি ব্যর্থ!");
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const { data } = await API.put(`/salary/${id}`, editForm);
      setSalaries(salaries.map(s => s._id === id ? data : s));
      setEditingId(null);
      toast.success("বেতন আপডেট হয়েছে!");
    } catch (error) {
      toast.error("আপডেট ব্যর্থ!");
    }
  };

  const handlePay = async (id) => {
    try {
      const { data } = await API.put(`/salary/${id}/pay`);
      setSalaries(salaries.map(s => s._id === id ? data : s));
      toast.success("বেতন পরিশোধ হয়েছে!");
    } catch (error) {
      toast.error("পরিশোধ ব্যর্থ!");
    }
  };

  const handleDownloadPDF = (salary) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("EMS — Payslip", 14, 20);
    doc.setFontSize(12);
    doc.text(`কর্মী: ${salary.employeeName}`, 14, 35);
    doc.text(`মাস: ${salary.month} ${salary.year}`, 14, 45);
    doc.text(`তারিখ: ${new Date().toLocaleDateString()}`, 14, 55);

    autoTable(doc, {
      startY: 65,
      head: [["বিবরণ", "পরিমাণ (৳)"]],
      body: [
        ["মূল বেতন", salary.basicSalary.toLocaleString()],
        ["বোনাস", salary.bonus.toLocaleString()],
        ["কর্তন", `-${salary.deduction.toLocaleString()}`],
        ["নেট বেতন", salary.netSalary.toLocaleString()],
      ],
      styles: { fontSize: 12 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.text(`অবস্থা: ${salary.status === "paid" ? "পরিশোধিত" : "অপরিশোধিত"}`,
      14, doc.lastAutoTable.finalY + 15);

    doc.save(`payslip-${salary.employeeName}-${salary.month}-${salary.year}.pdf`);
    toast.success("Payslip Download হয়েছে!");
  };

  const totalPaid = salaries.filter(s => s.status === "paid").reduce((sum, s) => sum + s.netSalary, 0);
  const totalUnpaid = salaries.filter(s => s.status === "unpaid").reduce((sum, s) => sum + s.netSalary, 0);

  const inputStyle = {
    padding: "8px 12px", background: "#0f172a",
    border: "1px solid #334155", borderRadius: "8px",
    color: "#f1f5f9", fontSize: "14px", outline: "none"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#f1f5f9" }}>বেতন ব্যবস্থাপনা</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>মাসিক বেতন পরিচালনা করুন</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select value={filter.month} onChange={e => setFilter({ ...filter, month: e.target.value })} style={inputStyle}>
            {months.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={filter.year} onChange={e => setFilter({ ...filter, year: e.target.value })} style={inputStyle}>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>

          <ExportButtons
            data={salaries.map(s => ({
              Employee: s.employeeName,
              Month: s.month,
              Year: s.year,
              BasicSalary: s.basicSalary,
              Bonus: s.bonus,
              Deduction: s.deduction,
              NetSalary: s.netSalary,
              Status: s.status === "paid" ? "Paid" : "Unpaid"
            }))}
            filename={`salary-${filter.month}-${filter.year}`}
            title={`Salary Report - ${filter.month} ${filter.year}`}
            columns={["Employee", "Month", "Year", "Basic", "Bonus", "Deduction", "Net", "Status"]}
            pdfData={salaries.map(s => [
              s.employeeName, s.month, s.year,
              s.basicSalary, s.bonus, s.deduction, s.netSalary,
              s.status === "paid" ? "Paid" : "Unpaid"
            ])}
          />
          <button onClick={handleGenerate} disabled={generating} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", background: "#6366f1",
            border: "none", borderRadius: "8px",
            color: "white", cursor: "pointer", fontWeight: "600"
          }}>
            <MdAdd size={20} />
            {generating ? "তৈরি হচ্ছে..." : "বেতন তৈরি করুন"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "মোট কর্মী", value: salaries.length, color: "#6366f1" },
          { label: `পরিশোধিত ৳${totalPaid.toLocaleString()}`, value: salaries.filter(s => s.status === "paid").length, color: "#22c55e" },
          { label: `অপরিশোধিত ৳${totalUnpaid.toLocaleString()}`, value: salaries.filter(s => s.status === "unpaid").length, color: "#ef4444" },
        ].map(card => (
          <div key={card.label} style={{
            background: "#1e293b", borderRadius: "12px",
            padding: "20px", border: "1px solid #334155", textAlign: "center"
          }}>
            <h3 style={{ color: card.color, fontSize: "28px", fontWeight: "700" }}>{card.value}</h3>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              {["কর্মী", "মূল বেতন", "বোনাস", "কর্তন", "নেট বেতন", "অবস্থা", "কার্যক্রম"].map(h => (
                <th key={h} style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "13px", textAlign: "left", fontWeight: "600" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>লোড হচ্ছে...</td></tr>
            ) : salaries.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                এই মাসে কোনো বেতন নেই। "বেতন তৈরি করুন" ক্লিক করুন।
              </td></tr>
            ) : salaries.map(salary => (
              <tr key={salary._id} style={{ borderTop: "1px solid #334155" }}>
                <td style={{ padding: "14px 16px", color: "#f1f5f9", fontSize: "14px" }}>{salary.employeeName}</td>
                <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>৳{salary.basicSalary.toLocaleString()}</td>

                {/* Bonus & Deduction Edit */}
                <td style={{ padding: "14px 16px" }}>
                  {editingId === salary._id ? (
                    <input
                      type="number"
                      value={editForm.bonus}
                      onChange={e => setEditForm({ ...editForm, bonus: Number(e.target.value) })}
                      style={{ ...inputStyle, width: "80px", padding: "4px 8px" }}
                    />
                  ) : (
                    <span style={{ color: "#22c55e", fontSize: "14px" }}>+৳{salary.bonus.toLocaleString()}</span>
                  )}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {editingId === salary._id ? (
                    <input
                      type="number"
                      value={editForm.deduction}
                      onChange={e => setEditForm({ ...editForm, deduction: Number(e.target.value) })}
                      style={{ ...inputStyle, width: "80px", padding: "4px 8px" }}
                    />
                  ) : (
                    <span style={{ color: "#ef4444", fontSize: "14px" }}>-৳{salary.deduction.toLocaleString()}</span>
                  )}
                </td>

                <td style={{ padding: "14px 16px", color: "#f1f5f9", fontSize: "14px", fontWeight: "600" }}>
                  ৳{salary.netSalary.toLocaleString()}
                </td>

                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                    background: salary.status === "paid" ? "#22c55e22" : "#ef444422",
                    color: salary.status === "paid" ? "#22c55e" : "#ef4444"
                  }}>
                    {salary.status === "paid" ? "✅ পরিশোধিত" : "⏳ অপরিশোধিত"}
                  </span>
                </td>

                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {salary.status === "unpaid" && (
                      <>
                        {editingId === salary._id ? (
                          <button onClick={() => handleUpdate(salary._id)} style={{
                            padding: "6px", background: "#22c55e22", border: "none",
                            borderRadius: "6px", color: "#22c55e", cursor: "pointer"
                          }}><MdCheck size={16} /></button>
                        ) : (
                          <button onClick={() => {
                            setEditingId(salary._id);
                            setEditForm({ bonus: salary.bonus, deduction: salary.deduction });
                          }} style={{
                            padding: "6px", background: "#6366f122", border: "none",
                            borderRadius: "6px", color: "#6366f1", cursor: "pointer"
                          }}><MdEdit size={16} /></button>
                        )}
                        <button onClick={() => handlePay(salary._id)} style={{
                          display: "flex", alignItems: "center", gap: "4px",
                          padding: "6px 12px", background: "#22c55e",
                          border: "none", borderRadius: "6px",
                          color: "white", cursor: "pointer", fontSize: "12px"
                        }}>
                          <MdPayment size={14} /> পরিশোধ
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDownloadPDF(salary)} style={{
                      padding: "6px 12px", background: "#6366f122",
                      border: "1px solid #6366f144", borderRadius: "6px",
                      color: "#6366f1", cursor: "pointer", fontSize: "12px"
                    }}>📄 Payslip</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}