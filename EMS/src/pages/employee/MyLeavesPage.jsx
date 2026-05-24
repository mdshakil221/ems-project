import { useState, useEffect } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { MdEventNote, MdAdd } from "react-icons/md";
import toast from "react-hot-toast";

export default function MyLeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: "Sick Leave", from: "", to: "", reason: ""
  });

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await API.get("/leave");
      setLeaves(data.filter(l => l.employeeName === user?.name));
    } catch {
      toast.error("ছুটি লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async () => {
    if (!leaveForm.from || !leaveForm.to || !leaveForm.reason) {
      toast.error("সব তথ্য পূরণ করুন!"); return;
    }
    const days = Math.ceil(
      (new Date(leaveForm.to) - new Date(leaveForm.from)) / (1000 * 60 * 60 * 24)
    ) + 1;
    try {
      const { data } = await API.post("/leave", {
        ...leaveForm, employeeName: user?.name, days
      });
      setLeaves([data, ...leaves]);
      toast.success("ছুটির আবেদন জমা হয়েছে!");
      setShowModal(false);
      setLeaveForm({ type: "Sick Leave", from: "", to: "", reason: "" });
    } catch {
      toast.error("আবেদন জমা ব্যর্থ!");
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    background: "#0f172a", border: "1px solid #334155",
    borderRadius: "8px", color: "#f1f5f9", fontSize: "14px", outline: "none"
  };

  const pendingLeaves = leaves.filter(l => l.status === "pending").length;
  const approvedLeaves = leaves.filter(l => l.status === "approved").length;

  if (loading) return <p style={{ color: "#94a3b8" }}>লোড হচ্ছে...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#f1f5f9", marginBottom: "4px" }}>📅 আমার ছুটি</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>মোট {leaves.length} টি আবেদন</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", background: "#6366f1",
          border: "none", borderRadius: "8px",
          color: "white", cursor: "pointer", fontWeight: "600"
        }}>
          <MdAdd size={20} /> ছুটির আবেদন
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "মোট আবেদন", value: leaves.length, color: "#6366f1" },
          { label: "অপেক্ষমান", value: pendingLeaves, color: "#f59e0b" },
          { label: "অনুমোদিত", value: approvedLeaves, color: "#22c55e" },
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

      {leaves.length === 0 ? (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "60px", border: "1px solid #334155", textAlign: "center"
        }}>
          <MdEventNote size={48} style={{ color: "#334155", marginBottom: "16px" }} />
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো ছুটির আবেদন নেই</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {leaves.map(leave => (
            <div key={leave._id} style={{
              background: "#1e293b", borderRadius: "12px",
              padding: "20px", border: "1px solid #334155",
              borderLeft: `4px solid ${leave.status === "approved" ? "#22c55e" :
                leave.status === "rejected" ? "#ef4444" : "#f59e0b"}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <h4 style={{ color: "#f1f5f9", fontSize: "15px" }}>{leave.type}</h4>
                <span style={{
                  padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                  background: leave.status === "approved" ? "#22c55e22" :
                    leave.status === "rejected" ? "#ef444422" : "#f59e0b22",
                  color: leave.status === "approved" ? "#22c55e" :
                    leave.status === "rejected" ? "#ef4444" : "#f59e0b"
                }}>
                  {leave.status === "approved" ? "✅ অনুমোদিত" :
                    leave.status === "rejected" ? "❌ প্রত্যাখ্যাত" : "⏳ অপেক্ষমান"}
                </span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "4px" }}>
                📅 {leave.from} → {leave.to} ({leave.days} দিন)
              </p>
              <p style={{ color: "#64748b", fontSize: "13px" }}>কারণ: {leave.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Leave Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#00000088",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#1e293b", borderRadius: "12px",
            padding: "32px", width: "100%", maxWidth: "480px", border: "1px solid #334155"
          }}>
            <h3 style={{ color: "#f1f5f9", marginBottom: "24px" }}>ছুটির আবেদন</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>ছুটির ধরন</label>
                <select value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })} style={inputStyle}>
                  <option>Sick Leave</option>
                  <option>Annual Leave</option>
                  <option>Casual Leave</option>
                  <option>Maternity Leave</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>শুরুর তারিখ</label>
                  <input type="date" value={leaveForm.from} onChange={e => setLeaveForm({ ...leaveForm, from: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>শেষের তারিখ</label>
                  <input type="date" value={leaveForm.to} onChange={e => setLeaveForm({ ...leaveForm, to: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>কারণ</label>
                <textarea
                  value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="ছুটির কারণ লিখুন..." rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleLeaveSubmit} style={{
                flex: 1, padding: "12px", background: "#6366f1",
                border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "600"
              }}>জমা দিন</button>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "12px", background: "#334155",
                border: "none", borderRadius: "8px", color: "#f1f5f9", cursor: "pointer", fontWeight: "600"
              }}>বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}