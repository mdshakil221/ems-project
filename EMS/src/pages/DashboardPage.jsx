import { useState, useEffect } from "react";
import API from "../api/axios";
import { MdPeople, MdCheckCircle, MdTask, MdEventNote } from "react-icons/md";
import toast from "react-hot-toast";
import useWindowSize from "../hooks/useWindowSize";

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: "#1e293b", borderRadius: "12px",
    padding: "24px", border: "1px solid #334155",
    display: "flex", alignItems: "center", gap: "16px"
  }}>
    <div style={{
      background: color + "22", borderRadius: "10px",
      padding: "12px", color: color, fontSize: "28px"
    }}>{icon}</div>
    <div>
      <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "4px" }}>{label}</p>
      <h3 style={{ color: "#f1f5f9", fontSize: "28px", fontWeight: "700" }}>{value}</h3>
    </div>
  </div>
);

export default function DashboardPage() {
  const { isMobile } = useWindowSize();
  
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [empRes, attRes, taskRes, leaveRes] = await Promise.all([
        API.get("/employees"),
        API.get(`/attendance?date=${today}`),
        API.get("/tasks"),
        API.get("/leave"),
      ]);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
      setTasks(taskRes.data);
      setLeaves(leaveRes.data);
    } catch (error) {
      toast.error("ডেটা লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const presentToday = attendance.filter(a => a.status === "present").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const pendingLeaves = leaves.filter(l => l.status === "pending").length;

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <p style={{ color: "#94a3b8", fontSize: "16px" }}>লোড হচ্ছে...</p>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", marginBottom: "8px" }}>Dashboard</h2>
      <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
        {new Date().toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </p>

      {/* Stat Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(220px, 1fr))",
        gap: isMobile ? "12px" : "16px",
        marginBottom: "32px"
      }}>
        {/* ... */}
      </div>

      {/* Charts */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: "16px"
      }}>
        {/* ... */}
      </div>


      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

        {/* Recent Employees */}
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "24px", border: "1px solid #334155"
        }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "16px", fontSize: "16px" }}>
            সাম্প্রতিক কর্মী
          </h3>
          {employees.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>কোনো কর্মী নেই</p>
          ) : employees.slice(0, 5).map(emp => (
            <div key={emp._id} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 0", borderBottom: "1px solid #334155"
            }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: "#6366f1", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: "700", fontSize: "13px", flexShrink: 0
              }}>{emp.avatar}</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#f1f5f9", fontSize: "14px" }}>{emp.name}</p>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>{emp.position}</p>
              </div>
              <span style={{
                padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
                background: emp.status === "active" ? "#22c55e22" : "#ef444422",
                color: emp.status === "active" ? "#22c55e" : "#ef4444"
              }}>
                {emp.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Tasks */}
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "24px", border: "1px solid #334155"
        }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "16px", fontSize: "16px" }}>
            সাম্প্রতিক কাজ
          </h3>
          {tasks.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>কোনো কাজ নেই</p>
          ) : tasks.slice(0, 5).map(task => (
            <div key={task._id} style={{
              padding: "10px 0", borderBottom: "1px solid #334155"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <p style={{ color: "#f1f5f9", fontSize: "14px" }}>{task.title}</p>
                <span style={{
                  padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                  background: task.priority === "urgent" ? "#ef444422" :
                    task.priority === "high" ? "#f59e0b22" : "#6366f122",
                  color: task.priority === "urgent" ? "#ef4444" :
                    task.priority === "high" ? "#f59e0b" : "#6366f1"
                }}>{task.priority}</span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>
                👤 {task.assignedTo}
              </p>
              <span style={{
                padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                background: task.status === "completed" ? "#22c55e22" :
                  task.status === "in-progress" ? "#6366f122" : "#f59e0b22",
                color: task.status === "completed" ? "#22c55e" :
                  task.status === "in-progress" ? "#6366f1" : "#f59e0b"
              }}>
                {task.status === "completed" ? "সম্পন্ন" :
                  task.status === "in-progress" ? "চলমান" : "বাকি"}
              </span>
            </div>
          ))}
        </div>

        {/* Today Attendance */}
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "24px", border: "1px solid #334155"
        }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "16px", fontSize: "16px" }}>
            আজকের উপস্থিতি
          </h3>
          {attendance.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>আজ কোনো উপস্থিতি নেই</p>
          ) : attendance.slice(0, 5).map(a => (
            <div key={a._id} style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0", borderBottom: "1px solid #334155"
            }}>
              <p style={{ color: "#f1f5f9", fontSize: "14px" }}>{a.employeeName}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>{a.checkIn || "—"}</p>
                <span style={{
                  padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                  background: a.status === "present" ? "#22c55e22" :
                    a.status === "absent" ? "#ef444422" : "#f59e0b22",
                  color: a.status === "present" ? "#22c55e" :
                    a.status === "absent" ? "#ef4444" : "#f59e0b"
                }}>
                  {a.status === "present" ? "উপস্থিত" :
                    a.status === "absent" ? "অনুপস্থিত" : "দেরিতে"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Leaves */}
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "24px", border: "1px solid #334155"
        }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "16px", fontSize: "16px" }}>
            অপেক্ষমান ছুটি
          </h3>
          {leaves.filter(l => l.status === "pending").length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>কোনো অপেক্ষমান ছুটি নেই</p>
          ) : leaves.filter(l => l.status === "pending").slice(0, 5).map(leave => (
            <div key={leave._id} style={{
              padding: "10px 0", borderBottom: "1px solid #334155"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <p style={{ color: "#f1f5f9", fontSize: "14px" }}>{leave.employeeName}</p>
                <span style={{
                  padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                  background: "#f59e0b22", color: "#f59e0b"
                }}>{leave.days} দিন</span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "12px" }}>{leave.type}</p>
              <p style={{ color: "#64748b", fontSize: "12px" }}>
                {leave.from} → {leave.to}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}