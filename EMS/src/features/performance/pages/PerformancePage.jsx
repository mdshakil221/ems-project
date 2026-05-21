import { useState, useEffect } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { MdAdd, MdStar, MdEdit, MdCheck } from "react-icons/md";

export default function PerformancePage() {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 3, comment: "" });
  const [filter, setFilter] = useState({
    month: new Date().toLocaleString("en-US", { month: "long" }),
    year: new Date().getFullYear().toString()
  });

  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const years = ["2024", "2025", "2026"];

  useEffect(() => { fetchPerformances(); }, [filter]);

  const fetchPerformances = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/performance?month=${filter.month}&year=${filter.year}`);
      setPerformances(data);
    } catch (error) {
      toast.error("Performance লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const { data } = await API.post("/performance/generate", filter);
      toast.success(data.message);
      fetchPerformances();
    } catch (error) {
      toast.error(error.response?.data?.message || "Performance তৈরি ব্যর্থ!");
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const { data } = await API.put(`/performance/${id}`, editForm);
      setPerformances(performances.map(p => p._id === id ? data : p));
      setEditingId(null);
      toast.success("Performance আপডেট হয়েছে!");
    } catch (error) {
      toast.error("আপডেট ব্যর্থ!");
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 5) return "#22c55e";
    if (rating >= 4) return "#6366f1";
    if (rating >= 3) return "#f59e0b";
    if (rating >= 2) return "#ef4444";
    return "#94a3b8";
  };

  const getRatingLabel = (rating) => {
    if (rating >= 5) return "অসাধারণ";
    if (rating >= 4) return "ভালো";
    if (rating >= 3) return "মোটামুটি";
    if (rating >= 2) return "দুর্বল";
    return "খুব দুর্বল";
  };

  const inputStyle = {
    padding: "8px 12px", background: "#0f172a",
    border: "1px solid #334155", borderRadius: "8px",
    color: "#f1f5f9", fontSize: "14px", outline: "none"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#f1f5f9" }}>Employee Performance</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>কর্মীর কাজের মূল্যায়ন করুন</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select value={filter.month} onChange={e => setFilter({ ...filter, month: e.target.value })} style={inputStyle}>
            {months.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={filter.year} onChange={e => setFilter({ ...filter, year: e.target.value })} style={inputStyle}>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={handleGenerate} disabled={generating} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", background: "#6366f1",
            border: "none", borderRadius: "8px",
            color: "white", cursor: "pointer", fontWeight: "600"
          }}>
            <MdAdd size={20} />
            {generating ? "তৈরি হচ্ছে..." : "Performance তৈরি"}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "মোট কর্মী", value: performances.length, color: "#6366f1" },
          { label: "অসাধারণ (5★)", value: performances.filter(p => p.rating === 5).length, color: "#22c55e" },
          { label: "ভালো (4★)", value: performances.filter(p => p.rating === 4).length, color: "#6366f1" },
          { label: "উন্নতি দরকার (≤3★)", value: performances.filter(p => p.rating <= 3).length, color: "#ef4444" },
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

      {/* Performance Cards */}
      {loading ? (
        <p style={{ color: "#94a3b8" }}>লোড হচ্ছে...</p>
      ) : performances.length === 0 ? (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "60px", border: "1px solid #334155", textAlign: "center"
        }}>
          <MdStar size={48} style={{ color: "#334155", marginBottom: "16px" }} />
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো Performance নেই</p>
          <p style={{ color: "#64748b", fontSize: "13px", marginTop: "8px" }}>
            "Performance তৈরি" বাটনে ক্লিক করুন
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {performances.map(perf => (
            <div key={perf._id} style={{
              background: "#1e293b", borderRadius: "12px",
              padding: "24px", border: "1px solid #334155",
              borderTop: `4px solid ${getRatingColor(perf.rating)}`
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <h4 style={{ color: "#f1f5f9", fontSize: "16px" }}>{perf.employeeName}</h4>
                  <p style={{ color: "#94a3b8", fontSize: "12px" }}>{perf.month} {perf.year}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <MdStar key={star} size={18}
                        style={{ color: star <= perf.rating ? getRatingColor(perf.rating) : "#334155" }}
                      />
                    ))}
                  </div>
                  <p style={{ color: getRatingColor(perf.rating), fontSize: "12px", marginTop: "4px" }}>
                    {getRatingLabel(perf.rating)}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  background: "#0f172a", borderRadius: "8px",
                  padding: "12px", textAlign: "center"
                }}>
                  <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Task সম্পন্ন</p>
                  <p style={{ color: "#22c55e", fontSize: "20px", fontWeight: "700" }}>
                    {perf.taskCompleted}/{perf.taskTotal}
                  </p>
                  <div style={{
                    height: "4px", background: "#334155",
                    borderRadius: "2px", marginTop: "8px"
                  }}>
                    <div style={{
                      height: "100%",
                      width: perf.taskTotal > 0 ? `${(perf.taskCompleted / perf.taskTotal) * 100}%` : "0%",
                      background: "#22c55e", borderRadius: "2px"
                    }} />
                  </div>
                </div>
                <div style={{
                  background: "#0f172a", borderRadius: "8px",
                  padding: "12px", textAlign: "center"
                }}>
                  <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>উপস্থিতি</p>
                  <p style={{ color: "#6366f1", fontSize: "20px", fontWeight: "700" }}>
                    {perf.attendancePresent}/{perf.attendanceTotal}
                  </p>
                  <div style={{
                    height: "4px", background: "#334155",
                    borderRadius: "2px", marginTop: "8px"
                  }}>
                    <div style={{
                      height: "100%",
                      width: perf.attendanceTotal > 0 ? `${(perf.attendancePresent / perf.attendanceTotal) * 100}%` : "0%",
                      background: "#6366f1", borderRadius: "2px"
                    }} />
                  </div>
                </div>
              </div>

              {/* Edit Rating */}
              {editingId === perf._id ? (
                <div>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                      Rating (1-5)
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setEditForm({ ...editForm, rating: star })}
                          style={{
                            width: "36px", height: "36px",
                            background: star <= editForm.rating ? getRatingColor(editForm.rating) + "33" : "#0f172a",
                            border: `1px solid ${star <= editForm.rating ? getRatingColor(editForm.rating) : "#334155"}`,
                            borderRadius: "8px", cursor: "pointer",
                            color: star <= editForm.rating ? getRatingColor(editForm.rating) : "#94a3b8",
                            fontWeight: "700"
                          }}>{star}</button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="মন্তব্য লিখুন..."
                    value={editForm.comment}
                    onChange={e => setEditForm({ ...editForm, comment: e.target.value })}
                    rows={2}
                    style={{
                      width: "100%", padding: "8px 12px",
                      background: "#0f172a", border: "1px solid #334155",
                      borderRadius: "8px", color: "#f1f5f9",
                      fontSize: "13px", outline: "none",
                      resize: "none", marginBottom: "12px"
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleUpdate(perf._id)} style={{
                      flex: 1, padding: "8px", background: "#22c55e",
                      border: "none", borderRadius: "8px",
                      color: "white", cursor: "pointer", fontWeight: "600"
                    }}>সেভ করুন</button>
                    <button onClick={() => setEditingId(null)} style={{
                      flex: 1, padding: "8px", background: "#334155",
                      border: "none", borderRadius: "8px",
                      color: "#f1f5f9", cursor: "pointer"
                    }}>বাতিল</button>
                  </div>
                </div>
              ) : (
                <div>
                  {perf.comment && (
                    <p style={{
                      color: "#94a3b8", fontSize: "13px",
                      marginBottom: "12px", fontStyle: "italic"
                    }}>"{perf.comment}"</p>
                  )}
                  <button onClick={() => {
                    setEditingId(perf._id);
                    setEditForm({ rating: perf.rating, comment: perf.comment });
                  }} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    width: "100%", padding: "8px", background: "#6366f122",
                    border: "1px solid #6366f144", borderRadius: "8px",
                    color: "#6366f1", cursor: "pointer",
                    fontSize: "13px", justifyContent: "center"
                  }}>
                    <MdEdit size={16} /> Rating দিন
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}