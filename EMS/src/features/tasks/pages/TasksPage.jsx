import { useState, useEffect } from "react";
import API from "../../../api/axios";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import SearchFilter from "../../../components/common/SearchFilter";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [form, setForm] = useState({
    title: "", assignedTo: "", priority: "medium",
    status: "pending", dueDate: ""
  });

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get("/tasks");
      setTasks(data);
    } catch (error) {
      toast.error("কাজ লোড ব্যর্থ!");
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
        { label: "বাকি", value: "pending" },
        { label: "চলমান", value: "in-progress" },
        { label: "সম্পন্ন", value: "completed" },
      ]
    },
    {
      label: "অগ্রাধিকার", key: "priority",
      options: [
        { label: "জরুরি", value: "urgent" },
        { label: "বেশি", value: "high" },
        { label: "মাঝারি", value: "medium" },
        { label: "কম", value: "low" },
      ]
    }
  ];

  const filtered = tasks.filter(t => {
    const matchSearch = search === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(search.toLowerCase());

    const matchStatus = !activeFilters.status ||
      activeFilters.status === "all" ||
      t.status === activeFilters.status;

    const matchPriority = !activeFilters.priority ||
      activeFilters.priority === "all" ||
      t.priority === activeFilters.priority;

    return matchSearch && matchStatus && matchPriority;
  });

  const pendingCount = tasks.filter(t => t.status === "pending").length;
  const inProgressCount = tasks.filter(t => t.status === "in-progress").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;

  const handleOpen = (task = null) => {
    if (task) {
      setEditingTask(task);
      setForm(task);
    } else {
      setEditingTask(null);
      setForm({ title: "", assignedTo: "", priority: "medium", status: "pending", dueDate: "" });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.assignedTo || !form.dueDate) {
      toast.error("সব তথ্য পূরণ করুন!");
      return;
    }
    try {
      if (editingTask) {
        const { data } = await API.put(`/tasks/${editingTask._id}`, form);
        setTasks(tasks.map(t => t._id === editingTask._id ? data : t));
        toast.success("কাজ আপডেট হয়েছে!");
      } else {
        const { data } = await API.post("/tasks", form);
        setTasks([data, ...tasks]);
        toast.success("নতুন কাজ যোগ হয়েছে!");
      }
      setShowModal(false);
    } catch (error) {
      toast.error("সমস্যা হয়েছে!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success("কাজ মুছে ফেলা হয়েছে!");
    } catch (error) {
      toast.error("মুছে ফেলা ব্যর্থ!");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await API.put(`/tasks/${id}`, { status });
      setTasks(tasks.map(t => t._id === id ? data : t));
      toast.success("অবস্থা আপডেট হয়েছে!");
    } catch (error) {
      toast.error("আপডেট ব্যর্থ!");
    }
  };

  const priorityColor = (p) => ({
    urgent: "#ef4444", high: "#f59e0b",
    medium: "#6366f1", low: "#22c55e"
  }[p] || "#94a3b8");

  const statusColor = (s) => ({
    "pending": "#f59e0b",
    "in-progress": "#6366f1",
    "completed": "#22c55e"
  }[s] || "#94a3b8");

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
          <h2 style={{ color: "#f1f5f9" }}>কাজের তালিকা</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>
            মোট {tasks.length} টি কাজ ({filtered.length} দেখাচ্ছে)
          </p>
        </div>
        <button onClick={() => handleOpen()} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", background: "#6366f1",
          border: "none", borderRadius: "8px",
          color: "white", cursor: "pointer", fontWeight: "600"
        }}>
          <MdAdd size={20} /> নতুন কাজ
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "বাকি", value: pendingCount, color: "#f59e0b" },
          { label: "চলমান", value: inProgressCount, color: "#6366f1" },
          { label: "সম্পন্ন", value: completedCount, color: "#22c55e" },
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
        placeholder="কাজের নাম বা কর্মী দিয়ে খুঁজুন..."
      />

      {/* Tasks Grid */}
      {filtered.length === 0 ? (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "40px", border: "1px solid #334155", textAlign: "center"
        }}>
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো কাজ পাওয়া যায়নি</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {filtered.map(task => (
            <div key={task._id} style={{
              background: "#1e293b", borderRadius: "12px",
              padding: "20px", border: "1px solid #334155",
              borderLeft: `4px solid ${priorityColor(task.priority)}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{
                  padding: "3px 10px", borderRadius: "20px", fontSize: "11px",
                  background: priorityColor(task.priority) + "22",
                  color: priorityColor(task.priority)
                }}>{task.priority}</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => handleOpen(task)} style={{
                    padding: "4px", background: "#6366f122", border: "none",
                    borderRadius: "6px", color: "#6366f1", cursor: "pointer"
                  }}><MdEdit size={14} /></button>
                  <button onClick={() => handleDelete(task._id)} style={{
                    padding: "4px", background: "#ef444422", border: "none",
                    borderRadius: "6px", color: "#ef4444", cursor: "pointer"
                  }}><MdDelete size={14} /></button>
                </div>
              </div>
              <h4 style={{ color: "#f1f5f9", marginBottom: "8px", fontSize: "15px" }}>{task.title}</h4>
              <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>👤 {task.assignedTo}</p>
              <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "16px" }}>📅 {task.dueDate}</p>
              <select
                value={task.status}
                onChange={e => handleStatusChange(task._id, e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px",
                  background: statusColor(task.status) + "22",
                  border: `1px solid ${statusColor(task.status)}44`,
                  borderRadius: "8px", color: statusColor(task.status),
                  fontSize: "13px", outline: "none", cursor: "pointer"
                }}
              >
                <option value="pending">বাকি</option>
                <option value="in-progress">চলমান</option>
                <option value="completed">সম্পন্ন</option>
              </select>
            </div>
          ))}
        </div>
      )}

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
            <h3 style={{ color: "#f1f5f9", marginBottom: "24px" }}>
              {editingTask ? "কাজ সম্পাদনা" : "নতুন কাজ যোগ"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>কাজের শিরোনাম</label>
                <input placeholder="কাজের বিবরণ লিখুন" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>দায়িত্বপ্রাপ্ত কর্মী</label>
                <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} style={inputStyle}>
                  <option value="">কর্মী বেছে নিন</option>
                  {employees.map(emp => <option key={emp._id} value={emp.name}>{emp.name}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>অগ্রাধিকার</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
                    <option value="low">কম</option>
                    <option value="medium">মাঝারি</option>
                    <option value="high">বেশি</option>
                    <option value="urgent">জরুরি</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>অবস্থা</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                    <option value="pending">বাকি</option>
                    <option value="in-progress">চলমান</option>
                    <option value="completed">সম্পন্ন</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>শেষ তারিখ</label>
                <input type="date" value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleSave} style={{
                flex: 1, padding: "12px", background: "#6366f1",
                border: "none", borderRadius: "8px", color: "white",
                cursor: "pointer", fontWeight: "600"
              }}>সেভ করুন</button>
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