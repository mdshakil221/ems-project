import { useState, useEffect, useRef } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { MdTask, MdSend } from "react-icons/md";
import toast from "react-hot-toast";
import AttachmentSection from "../../components/common/AttachmentSection";

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [note, setNote] = useState({});
  const [submitFiles, setSubmitFiles] = useState({});
  const submitFileRef = useRef();
  const [activeFileTaskId, setActiveFileTaskId] = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get("/tasks");
      setTasks(data.filter(t => t.assignedTo === user?.name));
    } catch {
      toast.error("কাজ লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      setSubmitting(taskId);
      const { data } = await API.put(`/tasks/${taskId}`, {
        status, note: note[taskId] || ""
      });
      setTasks(tasks.map(t => t._id === taskId ? data : t));
      toast.success(status === "completed" ? "কাজ সম্পন্ন হয়েছে!" : "কাজ শুরু হয়েছে!");
      setNote({ ...note, [taskId]: "" });
    } catch {
      toast.error("আপডেট ব্যর্থ!");
    } finally {
      setSubmitting(null);
    }
  };

  const handleFileSubmit = async (taskId) => {
    if (!submitFiles[taskId]?.length) return;
    try {
      const formData = new FormData();
      submitFiles[taskId].forEach(file => formData.append("files", file));
      const { data } = await API.post(`/tasks/${taskId}/submit`, formData);
      setTasks(tasks.map(t => t._id === taskId ? data : t));
      setSubmitFiles({ ...submitFiles, [taskId]: [] });
      toast.success("ফাইল submit হয়েছে!");
    } catch {
      toast.error("Submit ব্যর্থ!");
    }
  };

  const handleDownload = (att) => window.open(att.url, "_blank");

  const priorityColor = (p) => ({
    urgent: "#ef4444", high: "#f59e0b", medium: "#6366f1", low: "#22c55e"
  }[p] || "#94a3b8");

  const statusColor = (s) => ({
    "pending": "#f59e0b", "in-progress": "#6366f1", "completed": "#22c55e"
  }[s] || "#94a3b8");

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    background: "#0f172a", border: "1px solid #334155",
    borderRadius: "8px", color: "#f1f5f9", fontSize: "14px", outline: "none"
  };

  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;

  if (loading) return <p style={{ color: "#94a3b8" }}>লোড হচ্ছে...</p>;

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", marginBottom: "8px" }}>📋 আমার কাজ</h2>
      <p style={{ color: "#94a3b8", marginBottom: "24px" }}>মোট {tasks.length} টি কাজ</p>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "বাকি", value: pendingTasks, color: "#f59e0b" },
          { label: "চলমান", value: inProgressTasks, color: "#6366f1" },
          { label: "সম্পন্ন", value: completedTasks, color: "#22c55e" },
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

      {tasks.length === 0 ? (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "60px", border: "1px solid #334155", textAlign: "center"
        }}>
          <MdTask size={48} style={{ color: "#334155", marginBottom: "16px" }} />
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো কাজ নেই</p>
          <p style={{ color: "#64748b", fontSize: "13px", marginTop: "8px" }}>Admin কাজ দিলে এখানে দেখাবে</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {tasks.map(task => (
            <div key={task._id} style={{
              background: "#1e293b", borderRadius: "12px",
              padding: "24px", border: "1px solid #334155",
              borderLeft: `4px solid ${priorityColor(task.priority)}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ color: "#f1f5f9", fontSize: "16px" }}>{task.title}</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{
                    padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                    background: priorityColor(task.priority) + "22",
                    color: priorityColor(task.priority)
                  }}>{task.priority}</span>
                  <span style={{
                    padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                    background: statusColor(task.status) + "22",
                    color: statusColor(task.status)
                  }}>
                    {task.status === "completed" ? "সম্পন্ন" :
                      task.status === "in-progress" ? "চলমান" : "বাকি"}
                  </span>
                </div>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px" }}>
                📅 শেষ তারিখ: {task.dueDate}
              </p>
              {task.description && (
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "12px" }}>{task.description}</p>
              )}
              {task.status !== "completed" && (
                <div>
                  <textarea
                    placeholder="কাজের আপডেট বা নোট লিখুন..."
                    value={note[task._id] || ""}
                    onChange={e => setNote({ ...note, [task._id]: e.target.value })}
                    rows={2}
                    style={{ ...inputStyle, resize: "none", marginBottom: "12px" }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    {task.status === "pending" && (
                      <button
                        onClick={() => handleStatusUpdate(task._id, "in-progress")}
                        disabled={submitting === task._id}
                        style={{
                          padding: "10px 20px", background: "#6366f122",
                          border: "1px solid #6366f144", borderRadius: "8px",
                          color: "#6366f1", cursor: "pointer", fontSize: "13px", fontWeight: "600"
                        }}>🚀 শুরু করুন</button>
                    )}
                    <button
                      onClick={() => handleStatusUpdate(task._id, "completed")}
                      disabled={submitting === task._id}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "10px 20px", background: "#22c55e",
                        border: "none", borderRadius: "8px",
                        color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "600"
                      }}>
                      <MdSend size={16} />
                      {submitting === task._id ? "পাঠানো হচ্ছে..." : "সম্পন্ন করুন"}
                    </button>
                  </div>
                </div>
              )}

              {task.adminAttachments?.length > 0 && (
                <AttachmentSection
                  attachments={task.adminAttachments}
                  onDownload={handleDownload}
                  canDelete={false}
                  label="Admin এর দেওয়া ফাইল"
                />
              )}

              {task.status !== "completed" && (
                <div style={{ marginTop: "12px" }}>
                  <input
                    type="file" multiple style={{ display: "none" }}
                    ref={activeFileTaskId === task._id ? submitFileRef : null}
                    onChange={e => setSubmitFiles({
                      ...submitFiles,
                      [task._id]: Array.from(e.target.files)
                    })}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <button
                    onClick={() => {
                      setActiveFileTaskId(task._id);
                      setTimeout(() => submitFileRef.current?.click(), 100);
                    }}
                    style={{
                      padding: "8px 16px", background: "#f59e0b22",
                      border: "1px solid #f59e0b44", borderRadius: "8px",
                      color: "#f59e0b", cursor: "pointer", fontSize: "13px", marginBottom: "8px"
                    }}>📎 ফাইল যোগ করুন</button>
                  {submitFiles[task._id]?.length > 0 && (
                    <>
                      {submitFiles[task._id].map((f, i) => (
                        <p key={i} style={{ color: "#94a3b8", fontSize: "12px" }}>📎 {f.name}</p>
                      ))}
                      <button
                        onClick={() => handleFileSubmit(task._id)}
                        style={{
                          marginTop: "8px", padding: "8px 16px",
                          background: "#6366f1", border: "none",
                          borderRadius: "8px", color: "white",
                          cursor: "pointer", fontSize: "13px"
                        }}>📤 Submit করুন</button>
                    </>
                  )}
                </div>
              )}

              {task.employeeAttachments?.length > 0 && (
                <AttachmentSection
                  attachments={task.employeeAttachments}
                  onDownload={handleDownload}
                  canDelete={false}
                  label="আমার Submit করা ফাইল"
                />
              )}

              {task.status === "completed" && (
                <div style={{
                  padding: "12px", background: "#22c55e11",
                  borderRadius: "8px", border: "1px solid #22c55e22", marginTop: "12px"
                }}>
                  <p style={{ color: "#22c55e", fontSize: "13px" }}>✅ সম্পন্ন হয়েছে</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}