import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { MdTask, MdCheckCircle, MdPending, MdSend, MdEventNote } from "react-icons/md";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        pendingLeaves: 0,
        approvedLeaves: 0,
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [taskRes, leaveRes] = await Promise.all([
                API.get("/tasks"),
                API.get("/leave"),
            ]);
            const myTasks = taskRes.data.filter(t => t.assignedTo === user?.name);
            const myLeaves = leaveRes.data.filter(l => l.employeeName === user?.name);
            setStats({
                pendingTasks: myTasks.filter(t => t.status === "pending").length,
                inProgressTasks: myTasks.filter(t => t.status === "in-progress").length,
                completedTasks: myTasks.filter(t => t.status === "completed").length,
                pendingLeaves: myLeaves.filter(l => l.status === "pending").length,
                approvedLeaves: myLeaves.filter(l => l.status === "approved").length,
            });
        } catch (error) {
            toast.error("ডেটা লোড ব্যর্থ!");
        } finally {
            setLoading(false);
        }
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

            {/* Summary Cards — এটা রাখো */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px", marginBottom: "32px"
            }}>
                {[
                    { label: "বাকি কাজ", value: stats.pendingTasks, color: "#f59e0b", icon: <MdPending size={22} /> },
                    { label: "চলমান", value: stats.inProgressTasks, color: "#6366f1", icon: <MdTask size={22} /> },
                    { label: "সম্পন্ন", value: stats.completedTasks, color: "#22c55e", icon: <MdCheckCircle size={22} /> },
                    { label: "ছুটির আবেদন", value: stats.pendingLeaves, color: "#ef4444", icon: <MdEventNote size={22} /> },
                    { label: "অনুমোদিত ছুটি", value: stats.approvedLeaves, color: "#22c55e", icon: <MdEventNote size={22} /> },
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
                            <h3 style={{ color: "#f1f5f9", fontSize: "24px", fontWeight: "700" }}>
                                {card.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Links — নতুন যোগ করো */}
            <h3 style={{ color: "#f1f5f9", fontSize: "16px", marginBottom: "16px" }}>
                দ্রুত যান
            </h3>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "12px"
            }}>
                {[
                    { label: "📋 আমার কাজ", path: "/employee/tasks", color: "#6366f1" },
                    { label: "📅 আমার ছুটি", path: "/employee/leaves", color: "#f59e0b" },
                    { label: "👤 আমার Profile", path: "/employee/profile", color: "#22c55e" },
                    { label: "💰 আমার বেতন", path: "/employee/salary", color: "#a855f7" },
                    { label: "⭐ Performance", path: "/employee/performance", color: "#06b6d4" },
                ].map(link => (
                    <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        style={{
                            padding: "20px 16px",
                            background: link.color + "11",
                            border: `1px solid ${link.color}33`,
                            borderRadius: "10px", color: link.color,
                            cursor: "pointer", fontSize: "14px",
                            fontWeight: "600", textAlign: "center"
                        }}
                    >
                        {link.label}
                    </button>
                ))}
            </div>
        </div>
    );
}