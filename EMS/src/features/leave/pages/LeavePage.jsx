import { useState, useEffect } from "react";
import API from "../../../api/axios";
import { MdAdd, MdCheckCircle, MdCancel } from "react-icons/md";
import toast from "react-hot-toast";
import SearchFilter from "../../../components/common/SearchFilter";
import ExportButtons from "../../../components/common/ExportButtons";

export default function LeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [form, setForm] = useState({
    employeeName: "", type: "Sick Leave", from: "", to: "", reason: ""
  });

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await API.get("/leave");
      setLeaves(data);
    } catch (error) {
      toast.error("ছুটি লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await API.get("/employees");
      setEmployees(data);
    } catch (error) {
      toast.error("কর্মী লোড ব্যর্থ!");
    }
  };

  const filterConfig = [
    {
      label: "অবস্থা", key: "status",
      options: [
        { label: "অপেক্ষমান", value: "pending" },
        { label: "অনুমোদিত", value: "approved" },
        { label: "প্রত্যাখ্যাত", value: "rejected" },
      ]
    },
    {
      label: "ধরন", key: "type",
      options: [
        { label: "Sick Leave", value: "Sick Leave" },
        { label: "Annual Leave", value: "Annual Leave" },
        { label: "Casual Leave", value: "Casual Leave" },
        { label: "Maternity Leave", value: "Maternity Leave" },
      ]
    }
  ];

  const filteredLeaves = leaves.filter(l => {
    const matchSearch = search === "" ||
      l.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase());

    const matchStatus = !activeFilters.status ||
      activeFilters.status === "all" ||
      l.status === activeFilters.status;

    const matchType = !activeFilters.type ||
      activeFilters.type === "all" ||
      l.type === activeFilters.type;

    return matchSearch && matchStatus && matchType;
  });

  const handleSubmit = async () => {
    if (!form.employeeName || !form.from || !form.to || !form.reason) {
      toast.error("সব তথ্য পূরণ করুন!");
      return;
    }
    const days = Math.ceil((new Date(form.to) - new Date(form.from)) / (1000 * 60 * 60 * 24)) + 1;
    try {
      const { data } = await API.post("/leave", { ...form, days });
      setLeaves([data, ...leaves]);
      toast.success("ছুটির আবেদন জমা হয়েছে!");
      setShowModal(false);
      setForm({ employeeName: "", type: "Sick Leave", from: "", to: "", reason: "" });
    } catch (error) {
      toast.error("আবেদন জমা ব্যর্থ!");
    }
  };

  const handleApprove = async (id) => {
    try {
      const { data } = await API.put(`/leave/${id}`, { status: "approved" });
      setLeaves(leaves.map(l => l._id === id ? data : l));
      toast.success("ছুটি অনুমোদন হয়েছে!");
    } catch (error) {
      toast.error("অনুমোদন ব্যর্থ!");
    }
  };

  const handleReject = async (id) => {
    try {
      const { data } = await API.put(`/leave/${id}`, { status: "rejected" });
      setLeaves(leaves.map(l => l._id === id ? data : l));
      toast.error("ছুটি প্রত্যাখ্যান হয়েছে!");
    } catch (error) {
      toast.error("প্রত্যাখ্যান ব্যর্থ!");
    }
  };

  const pendingCount = leaves.filter(l => l.status === "pending").length;
  const approvedCount = leaves.filter(l => l.status === "approved").length;
  const rejectedCount = leaves.filter(l => l.status === "rejected").length;

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    background: "#0f172a", border: "1px solid #334155",
    borderRadius: "8px", color: "#f1f5f9", fontSize: "14px", outline: "none"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#f1f5f9" }}>ছুটি ব্যবস্থাপনা</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>
            মোট {leaves.length} টি আবেদন ({filteredLeaves.length} দেখাচ্ছে)
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <ExportButtons
            data={filteredLeaves.map(l => ({
              Employee: l.employeeName,
              Type: l.type,
              From: l.from,
              To: l.to,
              Days: l.days,
              Reason: l.reason,
              Status: l.status === "approved" ? "Approved" :
                l.status === "rejected" ? "Rejected" : "Pending"
            }))}
            filename="leave-applications"
            title="Leave Applications Report"
            columns={["Employee", "Type", "From", "To", "Days", "Reason", "Status"]}
            pdfData={filteredLeaves.map(l => [
              l.employeeName, l.type, l.from, l.to,
              l.days, l.reason,
              l.status === "approved" ? "Approved" :
                l.status === "rejected" ? "Rejected" : "Pending"
            ])}
          />
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", background: "#6366f1",
          border: "none", borderRadius: "8px", color: "white",
          cursor: "pointer", fontWeight: "600"
        }}>
          <MdAdd size={20} /> নতুন আবেদন
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "অপেক্ষমান", value: pendingCount, color: "#f59e0b" },
          { label: "অনুমোদিত", value: approvedCount, color: "#22c55e" },
          { label: "প্রত্যাখ্যাত", value: rejectedCount, color: "#ef4444" },
        ].map(card => (
          <div key={card.label} style={{
            background: "#1e293b", borderRadius: "12px",
            padding: "20px", border: "1px solid #334155", textAlign: "center"
          }}>
            <h3 style={{ color: card.color, fontSize: "32px", fontWeight: "700" }}>{card.value}</h3>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <SearchFilter
        search={search}
        setSearch={setSearch}
        filters={filterConfig}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        placeholder="কর্মীর নাম বা কারণ দিয়ে খুঁজুন..."
      />

      {/* Table */}
      <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              {["কর্মী", "ছুটির ধরন", "শুরু", "শেষ", "দিন", "কারণ", "অবস্থা", "কার্যক্রম"].map(h => (
                <th key={h} style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "13px", textAlign: "left", fontWeight: "600" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>লোড হচ্ছে...</td></tr>
            ) : filteredLeaves.length === 0 ? (
              <tr><td colSpan="8" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                কোনো ছুটির আবেদন পাওয়া যায়নি
              </td></tr>
            ) : filteredLeaves.map(leave => (
              <tr key={leave._id} style={{ borderTop: "1px solid #334155" }}>
                <td style={{ padding: "14px 16px", color: "#f1f5f9", fontSize: "14px" }}>{leave.employeeName}</td>
                <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>{leave.type}</td>
                <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>{leave.from}</td>
                <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>{leave.to}</td>
                <td style={{ padding: "14px 16px", color: "#f1f5f9", fontSize: "14px" }}>{leave.days} দিন</td>
                <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "13px", maxWidth: "150px" }}>{leave.reason}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                    background: leave.status === "approved" ? "#22c55e22" :
                      leave.status === "rejected" ? "#ef444422" : "#f59e0b22",
                    color: leave.status === "approved" ? "#22c55e" :
                      leave.status === "rejected" ? "#ef4444" : "#f59e0b"
                  }}>
                    {leave.status === "approved" ? "অনুমোদিত" :
                      leave.status === "rejected" ? "প্রত্যাখ্যাত" : "অপেক্ষমান"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {leave.status === "pending" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleApprove(leave._id)} style={{
                        padding: "6px", background: "#22c55e22", border: "none",
                        borderRadius: "6px", color: "#22c55e", cursor: "pointer"
                      }}><MdCheckCircle size={16} /></button>
                      <button onClick={() => handleReject(leave._id)} style={{
                        padding: "6px", background: "#ef444422", border: "none",
                        borderRadius: "6px", color: "#ef4444", cursor: "pointer"
                      }}><MdCancel size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#00000088",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#1e293b", borderRadius: "12px", padding: "32px",
            width: "100%", maxWidth: "480px", border: "1px solid #334155"
          }}>
            <h3 style={{ color: "#f1f5f9", marginBottom: "24px" }}>নতুন ছুটির আবেদন</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>কর্মীর নাম</label>
                <select value={form.employeeName} onChange={e => setForm({ ...form, employeeName: e.target.value })} style={inputStyle}>
                  <option value="">কর্মী বেছে নিন</option>
                  {employees.map(emp => <option key={emp._id} value={emp.name}>{emp.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>ছুটির ধরন</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                  <option>Sick Leave</option>
                  <option>Annual Leave</option>
                  <option>Casual Leave</option>
                  <option>Maternity Leave</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>শুরুর তারিখ</label>
                  <input type="date" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>শেষের তারিখ</label>
                  <input type="date" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>কারণ</label>
                <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="ছুটির কারণ লিখুন..." rows={3} style={{ ...inputStyle, resize: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleSubmit} style={{
                flex: 1, padding: "12px", background: "#6366f1",
                border: "none", borderRadius: "8px", color: "white",
                cursor: "pointer", fontWeight: "600"
              }}>জমা দিন</button>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "12px", background: "#334155",
                border: "none", borderRadius: "8px", color: "#f1f5f9",
                cursor: "pointer", fontWeight: "600"
              }}>বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}