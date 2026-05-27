import { useState, useEffect } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { MdDelete, MdFilterList } from "react-icons/md";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: "", startDate: "", endDate: ""
  });

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.category) params.append("category", filter.category);
      if (filter.startDate) params.append("startDate", filter.startDate);
      if (filter.endDate) params.append("endDate", filter.endDate);
      params.append("limit", "200");

      const { data } = await API.get(`/activity-logs?${params}`);
      setLogs(data);
    } catch (error) {
      toast.error("Log লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("সব Log মুছে ফেলবেন?")) return;
    try {
      await API.delete("/activity-logs");
      setLogs([]);
      toast.success("সব Log মুছে ফেলা হয়েছে!");
    } catch (error) {
      toast.error("মুছে ফেলা ব্যর্থ!");
    }
  };

  const getCategoryColor = (category) => ({
    auth: "#6366f1",
    employee: "#22c55e",
    task: "#f59e0b",
    leave: "#06b6d4",
    salary: "#a855f7",
    attendance: "#f59e0b",
    document: "#ef4444",
    announcement: "#22c55e",
    holiday: "#06b6d4",
    performance: "#f59e0b",
    notification: "#94a3b8",
  }[category] || "#94a3b8");

  const getCategoryIcon = (category) => ({
    auth: "🔐",
    employee: "👤",
    task: "📋",
    leave: "📅",
    salary: "💰",
    attendance: "✅",
    document: "📄",
    announcement: "📢",
    holiday: "🗓️",
    performance: "⭐",
    notification: "🔔",
  }[category] || "📌");

  const inputStyle = {
    padding: "8px 12px", background: "#1e293b",
    border: "1px solid #334155", borderRadius: "8px",
    color: "#f1f5f9", fontSize: "14px", outline: "none"
  };

  const categories = [
    "auth", "employee", "task", "leave", "salary",
    "attendance", "document", "announcement", "holiday", "performance"
  ];

  // Summary count
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = logs.filter(l => l.category === cat).length;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#f1f5f9" }}>📊 Activity Log</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>
            মোট {logs.length} টি Activity
          </p>
        </div>
        <button onClick={handleClearLogs} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "10px 16px", background: "#ef444422",
          border: "1px solid #ef444444", borderRadius: "8px",
          color: "#ef4444", cursor: "pointer", fontSize: "13px"
        }}>
          <MdDelete size={16} /> সব মুছুন
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap: "12px", marginBottom: "24px"
      }}>
        {[
          { label: "Login", cat: "auth", icon: "🔐" },
          { label: "Employee", cat: "employee", icon: "👤" },
          { label: "Task", cat: "task", icon: "📋" },
          { label: "Leave", cat: "leave", icon: "📅" },
          { label: "Salary", cat: "salary", icon: "💰" },
          { label: "Attendance", cat: "attendance", icon: "✅" },
        ].map(item => (
          <div
            key={item.cat}
            onClick={() => setFilter({ ...filter, category: filter.category === item.cat ? "" : item.cat })}
            style={{
              background: filter.category === item.cat ? getCategoryColor(item.cat) + "22" : "#1e293b",
              borderRadius: "10px", padding: "14px",
              border: `1px solid ${filter.category === item.cat ? getCategoryColor(item.cat) : "#334155"}`,
              textAlign: "center", cursor: "pointer"
            }}>
            <p style={{ fontSize: "20px", marginBottom: "4px" }}>{item.icon}</p>
            <h3 style={{ color: getCategoryColor(item.cat), fontSize: "20px", fontWeight: "700" }}>
              {categoryCounts[item.cat] || 0}
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "11px" }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{
        display: "flex", gap: "12px", marginBottom: "20px",
        flexWrap: "wrap", alignItems: "center"
      }}>
        <MdFilterList size={20} style={{ color: "#94a3b8" }} />
        <select
          value={filter.category}
          onChange={e => setFilter({ ...filter, category: e.target.value })}
          style={inputStyle}
        >
          <option value="">সব Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
          ))}
        </select>

        <input
          type="date"
          value={filter.startDate}
          onChange={e => setFilter({ ...filter, startDate: e.target.value })}
          style={inputStyle}
        />
        <span style={{ color: "#94a3b8" }}>—</span>
        <input
          type="date"
          value={filter.endDate}
          onChange={e => setFilter({ ...filter, endDate: e.target.value })}
          style={inputStyle}
        />
        <button onClick={fetchLogs} style={{
          padding: "8px 16px", background: "#6366f1",
          border: "none", borderRadius: "8px",
          color: "white", cursor: "pointer", fontSize: "13px"
        }}>খুঁজুন</button>
        {(filter.category || filter.startDate || filter.endDate) && (
          <button
            onClick={() => { setFilter({ category: "", startDate: "", endDate: "" }); }}
            style={{
              padding: "8px 16px", background: "#ef444422",
              border: "1px solid #ef444444", borderRadius: "8px",
              color: "#ef4444", cursor: "pointer", fontSize: "13px"
            }}>রিসেট</button>
        )}
      </div>

      {/* Log List */}
      {loading ? (
        <p style={{ color: "#94a3b8" }}>লোড হচ্ছে...</p>
      ) : logs.length === 0 ? (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "60px", border: "1px solid #334155", textAlign: "center"
        }}>
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো Activity নেই</p>
        </div>
      ) : (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          border: "1px solid #334155", overflow: "hidden"
        }}>
          {logs.map((log, index) => (
            <div key={log._id} style={{
              display: "flex", alignItems: "flex-start", gap: "16px",
              padding: "16px 20px",
              borderBottom: index < logs.length - 1 ? "1px solid #334155" : "none",
              borderLeft: `3px solid ${getCategoryColor(log.category)}`
            }}>
              {/* Icon */}
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: getCategoryColor(log.category) + "22",
                display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
                fontSize: "18px"
              }}>
                {getCategoryIcon(log.category)}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span style={{
                    color: "#f1f5f9", fontSize: "14px", fontWeight: "600"
                  }}>{log.userName}</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                    background: log.userRole === "admin" ? "#6366f122" : "#22c55e22",
                    color: log.userRole === "admin" ? "#6366f1" : "#22c55e"
                  }}>{log.userRole}</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                    background: getCategoryColor(log.category) + "22",
                    color: getCategoryColor(log.category)
                  }}>{log.category}</span>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "4px" }}>
                  {log.action}
                </p>
                {log.details && (
                  <p style={{ color: "#64748b", fontSize: "12px" }}>
                    {log.details}
                  </p>
                )}
              </div>

              {/* Time */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                  {new Date(log.createdAt).toLocaleDateString("bn-BD")}
                </p>
                <p style={{ color: "#64748b", fontSize: "11px" }}>
                  {new Date(log.createdAt).toLocaleTimeString("bn-BD")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}