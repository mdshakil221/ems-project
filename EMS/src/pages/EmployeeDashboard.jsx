import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { MdTask, MdCheckCircle, MdPending, MdSend, MdEventNote, MdAdd, MdPerson, MdEdit, MdCamera } from "react-icons/md";
import toast from "react-hot-toast";
import ProfileSection from "./ProfileSection";
import MySalarySection from "./MySalarySection";
import MyPerformanceSection from "./MyPerformanceSection";


export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("tasks");
    const [tasks, setTasks] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(null);
    const [note, setNote] = useState({});
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveForm, setLeaveForm] = useState({
        type: "Sick Leave", from: "", to: "", reason: ""
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [taskRes, leaveRes] = await Promise.all([
                API.get("/tasks"),
                API.get("/leave"),
            ]);
            setTasks(taskRes.data.filter(t => t.assignedTo === user?.name));
            setLeaves(leaveRes.data.filter(l => l.employeeName === user?.name));
        } catch (error) {
            toast.error("ডেটা লোড ব্যর্থ!");
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
        } catch (error) {
            toast.error("আপডেট ব্যর্থ!");
        } finally {
            setSubmitting(null);
        }
    };

    const handleLeaveSubmit = async () => {
        if (!leaveForm.from || !leaveForm.to || !leaveForm.reason) {
            toast.error("সব তথ্য পূরণ করুন!");
            return;
        }
        const days = Math.ceil(
            (new Date(leaveForm.to) - new Date(leaveForm.from)) / (1000 * 60 * 60 * 24)
        ) + 1;
        try {
            const { data } = await API.post("/leave", {
                ...leaveForm,
                employeeName: user?.name,
                days
            });
            setLeaves([data, ...leaves]);
            toast.success("ছুটির আবেদন জমা হয়েছে!");
            setShowLeaveModal(false);
            setLeaveForm({ type: "Sick Leave", from: "", to: "", reason: "" });
        } catch (error) {
            toast.error("আবেদন জমা ব্যর্থ!");
        }
    };

    const pendingTasks = tasks.filter(t => t.status === "pending").length;
    const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const pendingLeaves = leaves.filter(l => l.status === "pending").length;
    const approvedLeaves = leaves.filter(l => l.status === "approved").length;

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
            <h2 style={{ color: "#f1f5f9", marginBottom: "8px" }}>আমার Dashboard</h2>
            <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
                {new Date().toLocaleDateString("bn-BD", {
                    weekday: "long", year: "numeric",
                    month: "long", day: "numeric"
                })}
            </p>

            {/* Summary Cards */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px", marginBottom: "32px"
            }}>
                {[
                    { label: "বাকি কাজ", value: pendingTasks, color: "#f59e0b", icon: <MdPending size={22} /> },
                    { label: "চলমান", value: inProgressTasks, color: "#6366f1", icon: <MdTask size={22} /> },
                    { label: "সম্পন্ন", value: completedTasks, color: "#22c55e", icon: <MdCheckCircle size={22} /> },
                    { label: "ছুটির আবেদন", value: pendingLeaves, color: "#ef4444", icon: <MdEventNote size={22} /> },
                    { label: "অনুমোদিত ছুটি", value: approvedLeaves, color: "#22c55e", icon: <MdEventNote size={22} /> },
                ].map(card => (
                    <div key={card.label} style={{
                        background: "#1e293b", borderRadius: "12px",
                        padding: "16px", border: "1px solid #334155",
                        display: "flex", alignItems: "center", gap: "12px"
                    }}>
                        <div style={{
                            background: card.color + "22", borderRadius: "8px",
                            padding: "10px", color: card.color
                        }}>{card.icon}</div>
                        <div>
                            <p style={{ color: "#94a3b8", fontSize: "12px" }}>{card.label}</p>
                            <h3 style={{ color: "#f1f5f9", fontSize: "24px", fontWeight: "700" }}>{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                {[
                    { key: "tasks", label: "📋 আমার কাজ" },
                    { key: "leaves", label: "📅 আমার ছুটি" },
                    { key: "profile", label: "👤 আমার Profile" },
                    { key: "salary", label: "💰 আমার বেতন" },
                    { key: "performance", label: "⭐ আমার Performance" },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                        padding: "10px 24px", border: "1px solid #334155",
                        borderRadius: "8px", cursor: "pointer",
                        fontWeight: "600", fontSize: "14px",
                        background: activeTab === tab.key ? "#6366f1" : "#1e293b",
                        color: activeTab === tab.key ? "white" : "#94a3b8",
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Tasks Tab */}
            {activeTab === "tasks" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {tasks.length === 0 ? (
                        <div style={{
                            background: "#1e293b", borderRadius: "12px",
                            padding: "60px", border: "1px solid #334155", textAlign: "center"
                        }}>
                            <MdTask size={48} style={{ color: "#334155", marginBottom: "16px" }} />
                            <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো কাজ নেই</p>
                            <p style={{ color: "#64748b", fontSize: "13px", marginTop: "8px" }}>
                                Admin কাজ দিলে এখানে দেখাবে
                            </p>
                        </div>
                    ) : tasks.map(task => (
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
                                                    color: "#6366f1", cursor: "pointer",
                                                    fontSize: "13px", fontWeight: "600"
                                                }}>🚀 শুরু করুন</button>
                                        )}
                                        <button
                                            onClick={() => handleStatusUpdate(task._id, "completed")}
                                            disabled={submitting === task._id}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "6px",
                                                padding: "10px 20px", background: "#22c55e",
                                                border: "none", borderRadius: "8px",
                                                color: "white", cursor: "pointer",
                                                fontSize: "13px", fontWeight: "600"
                                            }}>
                                            <MdSend size={16} />
                                            {submitting === task._id ? "পাঠানো হচ্ছে..." : "সম্পন্ন করুন"}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {task.status === "completed" && (
                                <div style={{
                                    padding: "12px", background: "#22c55e11",
                                    borderRadius: "8px", border: "1px solid #22c55e22"
                                }}>
                                    <p style={{ color: "#22c55e", fontSize: "13px" }}>✅ সম্পন্ন হয়েছে</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Leaves Tab */}
            {activeTab === "leaves" && (
                <div>
                    {/* Apply Leave Button */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                        <button onClick={() => setShowLeaveModal(true)} style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "10px 20px", background: "#6366f1",
                            border: "none", borderRadius: "8px",
                            color: "white", cursor: "pointer", fontWeight: "600"
                        }}>
                            <MdAdd size={20} /> ছুটির আবেদন
                        </button>
                    </div>

                    {/* Leave List */}
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
                                            leave.status === "rejected" ? "#ef4444" : "#f59e0b"
                                        }`
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
                                    <p style={{ color: "#64748b", fontSize: "13px" }}>
                                        কারণ: {leave.reason}
                                    </p>

                                    {/* Status Message */}
                                    {leave.status === "approved" && (
                                        <div style={{
                                            marginTop: "12px", padding: "10px",
                                            background: "#22c55e11", borderRadius: "8px",
                                            border: "1px solid #22c55e22"
                                        }}>
                                            <p style={{ color: "#22c55e", fontSize: "13px" }}>
                                                ✅ Admin আপনার ছুটি অনুমোদন করেছেন!
                                            </p>
                                        </div>
                                    )}
                                    {leave.status === "rejected" && (
                                        <div style={{
                                            marginTop: "12px", padding: "10px",
                                            background: "#ef444411", borderRadius: "8px",
                                            border: "1px solid #ef444422"
                                        }}>
                                            <p style={{ color: "#ef4444", fontSize: "13px" }}>
                                                ❌ Admin আপনার ছুটি প্রত্যাখ্যান করেছেন।
                                            </p>
                                        </div>
                                    )}
                                    {leave.status === "pending" && (
                                        <div style={{
                                            marginTop: "12px", padding: "10px",
                                            background: "#f59e0b11", borderRadius: "8px",
                                            border: "1px solid #f59e0b22"
                                        }}>
                                            <p style={{ color: "#f59e0b", fontSize: "13px" }}>
                                                ⏳ Admin এর অনুমোদনের অপেক্ষায় আছে।
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <ProfileSection user={user} />
            )}

            {/* Salary tab */}
            {activeTab === "salary" && <MySalarySection />}

            {/*Performance Tab*/}
            {activeTab === "performance" && <MyPerformanceSection />}


            {/* Leave Modal */}
            {showLeaveModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "#00000088",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{
                        background: "#1e293b", borderRadius: "12px",
                        padding: "32px", width: "100%", maxWidth: "480px",
                        border: "1px solid #334155"
                    }}>
                        <h3 style={{ color: "#f1f5f9", marginBottom: "24px" }}>ছুটির আবেদন</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                                    ছুটির ধরন
                                </label>
                                <select
                                    value={leaveForm.type}
                                    onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option>Sick Leave</option>
                                    <option>Annual Leave</option>
                                    <option>Casual Leave</option>
                                    <option>Maternity Leave</option>
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                                        শুরুর তারিখ
                                    </label>
                                    <input
                                        type="date"
                                        value={leaveForm.from}
                                        onChange={e => setLeaveForm({ ...leaveForm, from: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                                        শেষের তারিখ
                                    </label>
                                    <input
                                        type="date"
                                        value={leaveForm.to}
                                        onChange={e => setLeaveForm({ ...leaveForm, to: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                                    কারণ
                                </label>
                                <textarea
                                    value={leaveForm.reason}
                                    onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                    placeholder="ছুটির কারণ লিখুন..."
                                    rows={3}
                                    style={{ ...inputStyle, resize: "none" }}
                                />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                            <button onClick={handleLeaveSubmit} style={{
                                flex: 1, padding: "12px", background: "#6366f1",
                                border: "none", borderRadius: "8px",
                                color: "white", cursor: "pointer", fontWeight: "600"
                            }}>জমা দিন</button>
                            <button onClick={() => setShowLeaveModal(false)} style={{
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