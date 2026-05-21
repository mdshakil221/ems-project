import { useState, useEffect } from "react";
import API from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import { MdAdd, MdDelete, MdCampaign } from "react-icons/md";
import toast from "react-hot-toast";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "", message: "", priority: "medium", targetRole: "all"
  });

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await API.get("/announcements");
      setAnnouncements(data);
    } catch (error) {
      toast.error("Announcement লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.message) {
      toast.error("শিরোনাম ও বার্তা আবশ্যক!");
      return;
    }
    try {
      const { data } = await API.post("/announcements", form);
      setAnnouncements([data, ...announcements]);
      toast.success("Announcement পাঠানো হয়েছে!");
      setShowModal(false);
      setForm({ title: "", message: "", priority: "medium", targetRole: "all" });
    } catch (error) {
      toast.error("Announcement পাঠানো ব্যর্থ!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a._id !== id));
      toast.success("মুছে ফেলা হয়েছে!");
    } catch (error) {
      toast.error("মুছে ফেলা ব্যর্থ!");
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const { data } = await API.put(`/announcements/${id}/read`);
      setAnnouncements(announcements.map(a => a._id === id ? data : a));
    } catch (error) {
      console.error(error);
    }
  };

  const priorityColor = (p) => ({
    urgent: "#ef4444", high: "#f59e0b",
    medium: "#6366f1", low: "#22c55e"
  }[p] || "#94a3b8");

  const priorityLabel = (p) => ({
    urgent: "জরুরি", high: "গুরুত্বপূর্ণ",
    medium: "সাধারণ", low: "কম গুরুত্বপূর্ণ"
  }[p] || p);

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    background: "#0f172a", border: "1px solid #334155",
    borderRadius: "8px", color: "#f1f5f9",
    fontSize: "14px", outline: "none"
  };

  if (loading) return <p style={{ color: "#94a3b8" }}>লোড হচ্ছে...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#f1f5f9" }}>📢 Announcements</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>
            সব কর্মীকে গুরুত্বপূর্ণ বার্তা পাঠান
          </p>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => setShowModal(true)} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", background: "#6366f1",
            border: "none", borderRadius: "8px",
            color: "white", cursor: "pointer", fontWeight: "600"
          }}>
            <MdAdd size={20} /> নতুন Announcement
          </button>
        )}
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "60px", border: "1px solid #334155", textAlign: "center"
        }}>
          <MdCampaign size={48} style={{ color: "#334155", marginBottom: "16px" }} />
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো Announcement নেই</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {announcements.map(ann => {
            const isRead = ann.readBy?.includes(user?.email);
            return (
              <div key={ann._id} style={{
                background: "#1e293b", borderRadius: "12px",
                padding: "24px", border: `1px solid ${isRead ? "#334155" : priorityColor(ann.priority) + "44"}`,
                borderLeft: `4px solid ${priorityColor(ann.priority)}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>📢</span>
                    <div>
                      <h3 style={{ color: "#f1f5f9", fontSize: "16px", fontWeight: "700" }}>
                        {ann.title}
                      </h3>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                          background: priorityColor(ann.priority) + "22",
                          color: priorityColor(ann.priority)
                        }}>{priorityLabel(ann.priority)}</span>
                        <span style={{
                          padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                          background: "#334155", color: "#94a3b8"
                        }}>
                          {ann.targetRole === "all" ? "সবার জন্য" :
                            ann.targetRole === "employee" ? "শুধু Employee" : "শুধু Admin"}
                        </span>
                        {!isRead && (
                          <span style={{
                            padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                            background: "#6366f122", color: "#6366f1"
                          }}>নতুন</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    {!isRead && (
                      <button onClick={() => handleMarkRead(ann._id)} style={{
                        padding: "6px 12px", background: "#22c55e22",
                        border: "1px solid #22c55e44", borderRadius: "6px",
                        color: "#22c55e", cursor: "pointer", fontSize: "12px"
                      }}>✓ পড়েছি</button>
                    )}
                    {user?.role === "admin" && (
                      <button onClick={() => handleDelete(ann._id)} style={{
                        padding: "6px", background: "#ef444422",
                        border: "none", borderRadius: "6px",
                        color: "#ef4444", cursor: "pointer"
                      }}><MdDelete size={16} /></button>
                    )}
                  </div>
                </div>

                <p style={{
                  color: "#94a3b8", fontSize: "14px",
                  lineHeight: "1.6", marginBottom: "12px"
                }}>{ann.message}</p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ color: "#64748b", fontSize: "12px" }}>
                    📝 {ann.createdBy} — {new Date(ann.createdAt).toLocaleString("bn-BD")}
                  </p>
                  <p style={{ color: "#64748b", fontSize: "12px" }}>
                    👁️ {ann.readBy?.length || 0} জন পড়েছে
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#00000088",
          display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "#1e293b", borderRadius: "12px", padding: "32px",
            width: "100%", maxWidth: "500px", border: "1px solid #334155"
          }}>
            <h3 style={{ color: "#f1f5f9", marginBottom: "24px" }}>নতুন Announcement</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  শিরোনাম
                </label>
                <input
                  placeholder="Announcement এর শিরোনাম"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  বার্তা
                </label>
                <textarea
                  placeholder="বিস্তারিত বার্তা লিখুন..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                    অগ্রাধিকার
                  </label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="low">কম গুরুত্বপূর্ণ</option>
                    <option value="medium">সাধারণ</option>
                    <option value="high">গুরুত্বপূর্ণ</option>
                    <option value="urgent">জরুরি</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                    কার জন্য
                  </label>
                  <select
                    value={form.targetRole}
                    onChange={e => setForm({ ...form, targetRole: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="all">সবার জন্য</option>
                    <option value="employee">শুধু Employee</option>
                    <option value="admin">শুধু Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleCreate} style={{
                flex: 1, padding: "12px", background: "#6366f1",
                border: "none", borderRadius: "8px",
                color: "white", cursor: "pointer", fontWeight: "600"
              }}>📢 পাঠান</button>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "12px", background: "#334155",
                border: "none", borderRadius: "8px",
                color: "#f1f5f9", cursor: "pointer", fontWeight: "600"
              }}>বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}