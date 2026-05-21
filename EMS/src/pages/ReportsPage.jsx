import { useState, useEffect } from "react";
import API from "../api/axios";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [empRes, taskRes, leaveRes, salRes, attRes] = await Promise.all([
        API.get("/employees"),
        API.get("/tasks"),
        API.get("/leave"),
        API.get("/salary"),
        API.get("/attendance"),
      ]);
      setEmployees(empRes.data);
      setTasks(taskRes.data);
      setLeaves(leaveRes.data);
      setSalaries(salRes.data);
      setAttendance(attRes.data);
    } catch (error) {
      toast.error("ডেটা লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  // Task Status Data
  const taskData = [
    { name: "বাকি", value: tasks.filter(t => t.status === "pending").length, color: "#f59e0b" },
    { name: "চলমান", value: tasks.filter(t => t.status === "in-progress").length, color: "#6366f1" },
    { name: "সম্পন্ন", value: tasks.filter(t => t.status === "completed").length, color: "#22c55e" },
  ];

  // Department Data
  const deptData = employees.reduce((acc, emp) => {
    const dept = emp.department || "অন্যান্য";
    const existing = acc.find(d => d.name === dept);
    if (existing) existing.value++;
    else acc.push({ name: dept, value: 1 });
    return acc;
  }, []);

  // Leave Status Data
  const leaveData = [
    { name: "অপেক্ষমান", value: leaves.filter(l => l.status === "pending").length, color: "#f59e0b" },
    { name: "অনুমোদিত", value: leaves.filter(l => l.status === "approved").length, color: "#22c55e" },
    { name: "প্রত্যাখ্যাত", value: leaves.filter(l => l.status === "rejected").length, color: "#ef4444" },
  ];

  // Salary Data
  const salaryData = salaries.reduce((acc, sal) => {
    const month = sal.month;
    const existing = acc.find(s => s.month === month);
    if (existing) {
      existing.paid += sal.status === "paid" ? sal.netSalary : 0;
      existing.unpaid += sal.status === "unpaid" ? sal.netSalary : 0;
    } else {
      acc.push({
        month,
        paid: sal.status === "paid" ? sal.netSalary : 0,
        unpaid: sal.status === "unpaid" ? sal.netSalary : 0,
      });
    }
    return acc;
  }, []);

  // ✅ Attendance Status Data
  const attendanceStatusData = [
    { name: "উপস্থিত", value: attendance.filter(a => a.status === "present").length, color: "#22c55e" },
    { name: "অনুপস্থিত", value: attendance.filter(a => a.status === "absent").length, color: "#ef4444" },
    { name: "দেরিতে", value: attendance.filter(a => a.status === "late").length, color: "#f59e0b" },
  ];

  // ✅ Daily Attendance Line Chart — শেষ ৭ দিন
  const dailyAttendance = attendance.reduce((acc, att) => {
    const date = att.date;
    const existing = acc.find(d => d.date === date);
    if (existing) {
      if (att.status === "present") existing.present++;
      if (att.status === "absent") existing.absent++;
      if (att.status === "late") existing.late++;
    } else {
      acc.push({
        date,
        present: att.status === "present" ? 1 : 0,
        absent: att.status === "absent" ? 1 : 0,
        late: att.status === "late" ? 1 : 0,
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);

  const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];

  const tooltipStyle = {
    contentStyle: {
      background: "#1e293b",
      border: "1px solid #334155",
      color: "#f1f5f9",
      borderRadius: "8px"
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <p style={{ color: "#94a3b8", fontSize: "16px" }}>লোড হচ্ছে...</p>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", marginBottom: "8px" }}>Reports & Analytics</h2>
      <p style={{ color: "#94a3b8", marginBottom: "24px" }}>প্রজেক্টের সার্বিক তথ্য ও বিশ্লেষণ</p>

      {/* Summary Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
        gap: "16px", marginBottom: "32px"
      }}>
        {[
          { label: "মোট কর্মী", value: employees.length, color: "#6366f1" },
          { label: "মোট Task", value: tasks.length, color: "#f59e0b" },
          { label: "মোট ছুটি", value: leaves.length, color: "#22c55e" },
          { label: "মোট উপস্থিতি", value: attendance.filter(a => a.status === "present").length, color: "#06b6d4" },
          {
            label: "মোট বেতন",
            value: `৳${salaries.reduce((s, sal) => s + sal.netSalary, 0).toLocaleString()}`,
            color: "#a855f7"
          },
        ].map(card => (
          <div key={card.label} style={{
            background: "#1e293b", borderRadius: "12px",
            padding: "20px", border: "1px solid #334155", textAlign: "center"
          }}>
            <h3 style={{ color: card.color, fontSize: "22px", fontWeight: "700" }}>{card.value}</h3>
            <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* Task Pie Chart */}
        <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "20px", fontSize: "16px" }}>📋 Task অবস্থা</h3>
          {tasks.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", paddingTop: "80px" }}>Task তথ্য নেই</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={taskData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {taskData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Department Bar Chart */}
        <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "20px", fontSize: "16px" }}>👥 বিভাগ অনুযায়ী কর্মী</h3>
          {deptData.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", paddingTop: "80px" }}>কর্মী তথ্য নেই</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="কর্মী">
                  {deptData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Leave Pie Chart */}
        <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "20px", fontSize: "16px" }}>📅 ছুটির অবস্থা</h3>
          {leaves.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", paddingTop: "80px" }}>ছুটি তথ্য নেই</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={leaveData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {leaveData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ✅ Attendance Pie Chart */}
        <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "20px", fontSize: "16px" }}>✅ উপস্থিতির অবস্থা</h3>
          {attendance.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", paddingTop: "80px" }}>
              উপস্থিতি তথ্য নেই — Attendance পেজে গিয়ে Data যোগ করুন
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={attendanceStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {attendanceStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Salary Bar Chart */}
        <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "20px", fontSize: "16px" }}>💰 মাসিক বেতন</h3>
          {salaryData.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", paddingTop: "80px" }}>বেতন তথ্য নেই</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="paid" name="পরিশোধিত" fill="#22c55e" />
                <Bar dataKey="unpaid" name="অপরিশোধিত" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ✅ Daily Attendance Line Chart */}
        <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "20px", fontSize: "16px" }}>📈 শেষ ৭ দিনের উপস্থিতি</h3>
          {dailyAttendance.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", paddingTop: "80px" }}>
              উপস্থিতি তথ্য নেই — Attendance পেজে গিয়ে Data যোগ করুন
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="present" name="উপস্থিত" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />
                <Line type="monotone" dataKey="absent" name="অনুপস্থিত" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
                <Line type="monotone" dataKey="late" name="দেরিতে" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}