import { useState, useEffect } from "react";
import API from "../../../api/axios";
import {
  MdNotifications, MdTask, MdPeople,
  MdEventNote, MdDoneAll, MdDelete,
  MdCheckCircle, MdLock, MdSearch, MdClose
} from "react-icons/md";
import toast from "react-hot-toast";
import SearchFilter from "../../../components/common/SearchFilter";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      setNotifications(data);
    } catch (error) {
      toast.error("নোটিফিকেশন লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const { data } = await API.put(`/notifications/${id}`);
      setNotifications(notifications.map(n => n._id === id ? data : n));
    } catch (error) {
      toast.error("আপডেট ব্যর্থ!");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success("সব নোটিফিকেশন পড়া হয়েছে!");
    } catch (error) {
      toast.error("আপডেট ব্যর্থ!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success("মুছে ফেলা হয়েছে!");
    } catch (error) {
      toast.error("মুছে ফেলা ব্যর্থ!");
    }
  };

  const handleClearAll = async () => {
    try {
      await API.delete("/notifications");
      setNotifications([]);
      toast.success("সব মুছে ফেলা হয়েছে!");
    } catch (error) {
      toast.error("মুছে ফেলা ব্যর্থ!");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "task_completed": return <MdCheckCircle size={20} />;
      case "task": return <MdTask size={20} />;
      case "employee": return <MdPeople size={20} />;
      case "leave": return <MdEventNote size={20} />;
      case "password_change": return <MdLock size={20} />;
      default: return <MdNotifications size={20} />;
    }
  };

  const getColor = (type) => ({
    task_completed: "#22c55e",
    task: "#f59e0b",
    employee: "#6366f1",
    leave: "#ef4444",
    password_change: "#a855f7",
    salary: "#06b6d4",
  }[type] || "#94a3b8");

  const getLabel = (type) => ({
    task_completed: "✅ Task সম্পন্ন",
    task: "📋 Task",
    employee: "👤 কর্মী",
    leave: "📅 ছুটি",
    password_change: "🔑 Password",
    salary: "💰 বেতন",
  }[type] || "অন্যান্য");

  const filterConfig = [
    {
      label: "ধরন", key: "type",
      options: [
        { label: "Task সম্পন্ন", value: "task_completed" },
        { label: "Task", value: "task" },
        { label: "কর্মী", value: "employee" },
        { label: "ছুটি", value: "leave" },
        { label: "Password", value: "password_change" },
        { label: "বেতন", value: "salary" },
      ]
    },
    {
      label: "অবস্থা", key: "read",
      options: [
        { label: "অপঠিত", value: "unread" },
        { label: "পঠিত", value: "read" },
      ]
    }
  ];

  const filteredNotifications = notifications.filter(n => {
    const matchSearch = search === "" ||
      n.message.toLowerCase().includes(search.toLowerCase());

    const matchType = !activeFilters.type ||
      activeFilters.type === "all" ||
      n.type === activeFilters.type;

    const matchRead = !activeFilters.read ||
      activeFilters.read === "all" ||
      (activeFilters.read === "unread" ? !n.read : n.read);

    return matchSearch && matchType && matchRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const completedCount = notifications.filter(n => n.type === "task_completed").length;
  const passwordChangeCount = notifications.filter(n => n.type === "password_change").length;

  if (loading) return <p style={{ color: "#94a3b8" }}>লোড হচ্ছে...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#f1f5f9" }}>নোটিফিকেশন</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>
            {unreadCount > 0 ? `${unreadCount}টি অপঠিত` : "সব পড়া হয়েছে"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "10px 16px", background: "#6366f122",
              border: "1px solid #6366f144", borderRadius: "8px",
              color: "#6366f1", cursor: "pointer", fontSize: "13px"
            }}>
              <MdDoneAll size={18} /> সব পড়া হয়েছে
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={handleClearAll} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "10px 16px", background: "#ef444422",
              border: "1px solid #ef444444", borderRadius: "8px",
              color: "#ef4444", cursor: "pointer", fontSize: "13px"
            }}>
              <MdDelete size={18} /> সব মুছুন
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
        gap: "12px", marginBottom: "24px"
      }}>
        {[
          { label: "মোট", value: notifications.length, color: "#6366f1" },
          { label: "অপঠিত", value: unreadCount, color: "#f59e0b" },
          { label: "পঠিত", value: notifications.length - unreadCount, color: "#94a3b8" },
          { label: "Task সম্পন্ন", value: completedCount, color: "#22c55e" },
          { label: "Password", value: passwordChangeCount, color: "#a855f7" },
        ].map(card => (
          <div key={card.label} style={{
            background: "#1e293b", borderRadius: "12px",
            padding: "16px", border: "1px solid #334155", textAlign: "center"
          }}>
            <h3 style={{ color: card.color, fontSize: "24px", fontWeight: "700" }}>{card.value}</h3>
            <p style={{ color: "#94a3b8", fontSize: "12px" }}>{card.label}</p>
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
        placeholder="নোটিফিকেশন খুঁজুন..."
      />

      {/* Notifications List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredNotifications.length === 0 ? (
          <div style={{
            background: "#1e293b", borderRadius: "12px",
            padding: "60px", border: "1px solid #334155", textAlign: "center"
          }}>
            <MdNotifications size={48} style={{ color: "#334155", marginBottom: "16px" }} />
            <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো নোটিফিকেশন নেই</p>
          </div>
        ) : filteredNotifications.map(n => (
          <div key={n._id} onClick={() => !n.read && handleMarkRead(n._id)} style={{
            background: "#1e293b", borderRadius: "12px", padding: "20px",
            border: `1px solid ${n.read ? "#334155" : getColor(n.type) + "44"}`,
            borderLeft: `4px solid ${n.read ? "#334155" : getColor(n.type)}`,
            display: "flex", alignItems: "flex-start", gap: "16px",
            cursor: n.read ? "default" : "pointer"
          }}>

            {/* Icon */}
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: getColor(n.type) + "22",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: getColor(n.type), flexShrink: 0
            }}>
              {getIcon(n.type)}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{
                  padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                  background: getColor(n.type) + "22", color: getColor(n.type)
                }}>{getLabel(n.type)}</span>
                {!n.read && (
                  <span style={{
                    padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                    background: "#6366f122", color: "#6366f1"
                  }}>নতুন</span>
                )}
              </div>
              <p style={{
                color: n.read ? "#94a3b8" : "#f1f5f9",
                fontSize: "14px", marginBottom: "4px",
                fontWeight: n.read ? "400" : "600"
              }}>{n.message}</p>
              <p style={{ color: "#64748b", fontSize: "12px", marginTop: "6px" }}>
                {new Date(n.createdAt).toLocaleString("bn-BD")}
              </p>
            </div>

            {/* Unread dot */}
            {!n.read && (
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: getColor(n.type), flexShrink: 0, marginTop: "4px"
              }} />
            )}

            {/* Delete */}
            <button onClick={e => { e.stopPropagation(); handleDelete(n._id); }} style={{
              padding: "6px", background: "#ef444422", border: "none",
              borderRadius: "6px", color: "#ef4444", cursor: "pointer", flexShrink: 0
            }}>
              <MdDelete size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}