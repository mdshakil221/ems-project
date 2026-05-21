import { useState, useEffect } from "react";
import API from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import { MdAdd, MdEdit, MdDelete, MdBeachAccess } from "react-icons/md";
import toast from "react-hot-toast";

export default function HolidaysPage() {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "", date: "", type: "public", description: ""
  });

  useEffect(() => { fetchHolidays(); }, []);

  const fetchHolidays = async () => {
    try {
      const { data } = await API.get("/holidays");
      setHolidays(data);
    } catch (error) {
      toast.error("ছুটি লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (holiday = null) => {
    if (holiday) {
      setEditingId(holiday._id);
      setForm({
        title: holiday.title,
        date: holiday.date,
        type: holiday.type,
        description: holiday.description
      });
    } else {
      setEditingId(null);
      setForm({ title: "", date: "", type: "public", description: "" });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.date) {
      toast.error("শিরোনাম ও তারিখ আবশ্যক!");
      return;
    }
    try {
      if (editingId) {
        const { data } = await API.put(`/holidays/${editingId}`, form);
        setHolidays(holidays.map(h => h._id === editingId ? data : h));
        toast.success("ছুটি আপডেট হয়েছে!");
      } else {
        const { data } = await API.post("/holidays", form);
        setHolidays([...holidays, data].sort((a, b) => new Date(a.date) - new Date(b.date)));
        toast.success("ছুটি যোগ হয়েছে!");
      }
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "সমস্যা হয়েছে!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/holidays/${id}`);
      setHolidays(holidays.filter(h => h._id !== id));
      toast.success("ছুটি মুছে ফেলা হয়েছে!");
    } catch (error) {
      toast.error("মুছে ফেলা ব্যর্থ!");
    }
  };

  const typeColor = (t) => ({
    public: "#22c55e",
    optional: "#f59e0b",
    restricted: "#ef4444"
  }[t] || "#94a3b8");

  const typeLabel = (t) => ({
    public: "সরকারি ছুটি",
    optional: "ঐচ্ছিক ছুটি",
    restricted: "সীমিত ছুটি"
  }[t] || t);

  const today = new Date().toISOString().split("T")[0];
  const upcomingHolidays = holidays.filter(h => h.date >= today);
  const pastHolidays = holidays.filter(h => h.date < today);

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
          <h2 style={{ color: "#f1f5f9" }}>🗓️ Holiday Management</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>
            মোট {holidays.length} টি ছুটির দিন ({upcomingHolidays.length} টি আসছে)
          </p>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => handleOpen()} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", background: "#6366f1",
            border: "none", borderRadius: "8px",
            color: "white", cursor: "pointer", fontWeight: "600"
          }}>
            <MdAdd size={20} /> ছুটি যোগ করুন
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px", marginBottom: "24px"
      }}>
        {[
          { label: "সরকারি ছুটি", value: holidays.filter(h => h.type === "public").length, color: "#22c55e" },
          { label: "ঐচ্ছিক ছুটি", value: holidays.filter(h => h.type === "optional").length, color: "#f59e0b" },
          { label: "আসছে", value: upcomingHolidays.length, color: "#6366f1" },
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

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "16px", fontSize: "16px" }}>
            📅 আসন্ন ছুটি
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {upcomingHolidays.map(holiday => (
              <div key={holiday._id} style={{
                background: "#1e293b", borderRadius: "12px",
                padding: "20px", border: "1px solid #334155",
                borderLeft: `4px solid ${typeColor(holiday.type)}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div>
                    <h4 style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: "600" }}>
                      {holiday.title}
                    </h4>
                    <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
                      📅 {new Date(holiday.date).toLocaleDateString("bn-BD", {
                        weekday: "long", year: "numeric",
                        month: "long", day: "numeric"
                      })}
                    </p>
                  </div>
                  {user?.role === "admin" && (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => handleOpen(holiday)} style={{
                        padding: "4px", background: "#6366f122",
                        border: "none", borderRadius: "6px",
                        color: "#6366f1", cursor: "pointer"
                      }}><MdEdit size={14} /></button>
                      <button onClick={() => handleDelete(holiday._id)} style={{
                        padding: "4px", background: "#ef444422",
                        border: "none", borderRadius: "6px",
                        color: "#ef4444", cursor: "pointer"
                      }}><MdDelete size={14} /></button>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                    background: typeColor(holiday.type) + "22",
                    color: typeColor(holiday.type)
                  }}>{typeLabel(holiday.type)}</span>
                  {holiday.date === today && (
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                      background: "#22c55e22", color: "#22c55e"
                    }}>আজকের ছুটি! 🎉</span>
                  )}
                </div>
                {holiday.description && (
                  <p style={{ color: "#64748b", fontSize: "12px", marginTop: "8px" }}>
                    {holiday.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Holidays */}
      {pastHolidays.length > 0 && (
        <div>
          <h3 style={{ color: "#94a3b8", marginBottom: "16px", fontSize: "16px" }}>
            ⏰ গত ছুটি
          </h3>
          <div style={{
            background: "#1e293b", borderRadius: "12px",
            border: "1px solid #334155", overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  {["শিরোনাম", "তারিখ", "ধরন", "বিবরণ", user?.role === "admin" ? "কার্যক্রম" : ""].map(h => h && (
                    <th key={h} style={{
                      padding: "12px 16px", color: "#94a3b8",
                      fontSize: "13px", textAlign: "left", fontWeight: "600"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pastHolidays.map(holiday => (
                  <tr key={holiday._id} style={{ borderTop: "1px solid #334155", opacity: 0.7 }}>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "14px" }}>
                      {holiday.title}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "14px" }}>
                      {new Date(holiday.date).toLocaleDateString("bn-BD")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                        background: typeColor(holiday.type) + "22",
                        color: typeColor(holiday.type)
                      }}>{typeLabel(holiday.type)}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: "13px" }}>
                      {holiday.description || "—"}
                    </td>
                    {user?.role === "admin" && (
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => handleOpen(holiday)} style={{
                            padding: "4px", background: "#6366f122",
                            border: "none", borderRadius: "6px",
                            color: "#6366f1", cursor: "pointer"
                          }}><MdEdit size={14} /></button>
                          <button onClick={() => handleDelete(holiday._id)} style={{
                            padding: "4px", background: "#ef444422",
                            border: "none", borderRadius: "6px",
                            color: "#ef4444", cursor: "pointer"
                          }}><MdDelete size={14} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {holidays.length === 0 && (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "60px", border: "1px solid #334155", textAlign: "center"
        }}>
          <MdBeachAccess size={48} style={{ color: "#334155", marginBottom: "16px" }} />
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো ছুটির দিন নেই</p>
          {user?.role === "admin" && (
            <p style={{ color: "#64748b", fontSize: "13px", marginTop: "8px" }}>
              "ছুটি যোগ করুন" বাটনে ক্লিক করুন
            </p>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#00000088",
          display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "#1e293b", borderRadius: "12px", padding: "32px",
            width: "100%", maxWidth: "480px", border: "1px solid #334155"
          }}>
            <h3 style={{ color: "#f1f5f9", marginBottom: "24px" }}>
              {editingId ? "ছুটি সম্পাদনা" : "নতুন ছুটি যোগ"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  শিরোনাম
                </label>
                <input
                  placeholder="যেমন: ঈদুল ফিতর"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  তারিখ
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  ধরন
                </label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  style={inputStyle}
                >
                  <option value="public">সরকারি ছুটি</option>
                  <option value="optional">ঐচ্ছিক ছুটি</option>
                  <option value="restricted">সীমিত ছুটি</option>
                </select>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  বিবরণ (ঐচ্ছিক)
                </label>
                <textarea
                  placeholder="ছুটির বিবরণ লিখুন..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleSave} style={{
                flex: 1, padding: "12px", background: "#6366f1",
                border: "none", borderRadius: "8px",
                color: "white", cursor: "pointer", fontWeight: "600"
              }}>সেভ করুন</button>
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