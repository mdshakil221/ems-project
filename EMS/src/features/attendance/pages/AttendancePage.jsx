import { useState, useEffect } from "react";
import API from "../../../api/axios";
import { MdCheckCircle, MdCancel, MdAccessTime, MdTableChart, MdCalendarToday } from "react-icons/md";
import toast from "react-hot-toast";
import ExportButtons from "../../../components/common/ExportButtons";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("daily"); // daily | monthly

  // Monthly filter
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const months = [
    { label: "জানুয়ারি", value: 1 }, { label: "ফেব্রুয়ারি", value: 2 },
    { label: "মার্চ", value: 3 }, { label: "এপ্রিল", value: 4 },
    { label: "মে", value: 5 }, { label: "জুন", value: 6 },
    { label: "জুলাই", value: 7 }, { label: "আগস্ট", value: 8 },
    { label: "সেপ্টেম্বর", value: 9 }, { label: "অক্টোবর", value: 10 },
    { label: "নভেম্বর", value: 11 }, { label: "ডিসেম্বর", value: 12 },
  ];
  const years = [2024, 2025, 2026];

  useEffect(() => { fetchEmployees(); }, []);

  useEffect(() => { fetchAttendance(); }, [selectedDate]);

  useEffect(() => {
    if (activeTab === "monthly") fetchMonthlyData();
  }, [activeTab, selectedMonth, selectedYear, employees]);

  const fetchEmployees = async () => {
    try {
      const { data } = await API.get("/employees");
      setEmployees(data);
    } catch (error) {
      toast.error("কর্মী লোড ব্যর্থ!");
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/attendance?date=${selectedDate}`);
      setAttendance(data);
    } catch (error) {
      toast.error("উপস্থিতি লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    if (employees.length === 0) return;
    try {
      setMonthlyLoading(true);

      // সেই মাসের সব attendance fetch করো
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      // সব attendance একবারে নিয়ে আসি
      const allAttendance = [];
      for (let d = 1; d <= lastDay; d++) {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        try {
          const { data } = await API.get(`/attendance?date=${dateStr}`);
          allAttendance.push(...data);
        } catch (e) {}
      }

      // Employee wise summary বানাও
      const summary = employees.map(emp => {
        const empRecords = allAttendance.filter(a =>
          a.employeeId === emp._id || a.employeeName === emp.name
        );
        const present = empRecords.filter(a => a.status === "present").length;
        const absent = empRecords.filter(a => a.status === "absent").length;
        const late = empRecords.filter(a => a.status === "late").length;
        const total = present + absent + late;
        return {
          _id: emp._id,
          name: emp.name,
          department: emp.department || "—",
          present, absent, late, total
        };
      });

      setMonthlyData(summary);
    } catch (error) {
      toast.error("Monthly data লোড ব্যর্থ!");
    } finally {
      setMonthlyLoading(false);
    }
  };

  const handleMarkAttendance = async (employeeId, employeeName, status) => {
    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: false
    });
    try {
      const { data } = await API.post("/attendance", {
        employeeId, employeeName,
        date: selectedDate,
        checkIn: status === "present" || status === "late" ? now : null,
        status
      });
      setAttendance(prev => {
        const exists = prev.find(a => a.employeeId === employeeId);
        if (exists) return prev.map(a => a.employeeId === employeeId ? data : a);
        return [...prev, data];
      });
      toast.success(`${employeeName} — ${status === "present" ? "উপস্থিত" : status === "absent" ? "অনুপস্থিত" : "দেরিতে"} চিহ্নিত!`);
    } catch (error) {
      toast.error("উপস্থিতি চিহ্নিত ব্যর্থ!");
    }
  };

  const getStatus = (employeeId) => {
    const record = attendance.find(a => a.employeeId === employeeId);
    return record ? record.status : null;
  };

  const getCheckIn = (employeeId) => {
    const record = attendance.find(a => a.employeeId === employeeId);
    return record ? record.checkIn : null;
  };

  const getCheckOut = (employeeId) => {
    const record = attendance.find(a => a.employeeId === employeeId);
    return record ? record.checkOut : null;
  };

  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;
  const lateCount = attendance.filter(a => a.status === "late").length;

  const inputStyle = {
    padding: "10px 12px", background: "#0f172a",
    border: "1px solid #334155", borderRadius: "8px",
    color: "#f1f5f9", fontSize: "14px", outline: "none"
  };

  const selectedMonthLabel = months.find(m => m.value === selectedMonth)?.label;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#f1f5f9" }}>উপস্থিতি</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>প্রতিদিনের উপস্থিতি ট্র্যাক করুন</p>
        </div>

        {activeTab === "daily" && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <ExportButtons
              data={attendance.map(a => ({
                Employee: a.employeeName,
                Date: a.date,
                CheckIn: a.checkIn || "",
                CheckOut: a.checkOut || "",
                Status: a.status === "present" ? "Present" :
                  a.status === "absent" ? "Absent" : "Late"
              }))}
              filename={`attendance-${selectedDate}`}
              title={`Attendance Report - ${selectedDate}`}
              columns={["Employee", "Date", "Check In", "Check Out", "Status"]}
              pdfData={attendance.map(a => [
                a.employeeName, a.date,
                a.checkIn || "", a.checkOut || "",
                a.status === "present" ? "Present" :
                  a.status === "absent" ? "Absent" : "Late"
              ])}
            />
            <input type="date" value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}

        {activeTab === "monthly" && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <ExportButtons
              data={monthlyData.map(m => ({
                Employee: m.name,
                Department: m.department,
                Present: m.present,
                Absent: m.absent,
                Late: m.late,
                Total: m.total,
              }))}
              filename={`monthly-attendance-${selectedMonthLabel}-${selectedYear}`}
              title={`Monthly Attendance - ${selectedMonthLabel} ${selectedYear}`}
              columns={["Employee", "Department", "Present", "Absent", "Late", "Total"]}
              pdfData={monthlyData.map(m => [
                m.name, m.department, m.present, m.absent, m.late, m.total
              ])}
            />
            <select value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              style={inputStyle}>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              style={inputStyle}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[
          { key: "daily", label: "📅 দৈনিক উপস্থিতি", icon: <MdCalendarToday size={16} /> },
          { key: "monthly", label: "📊 মাসিক সারসংক্ষেপ", icon: <MdTableChart size={16} /> },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 20px",
            background: activeTab === tab.key ? "#6366f1" : "#1e293b",
            border: activeTab === tab.key ? "none" : "1px solid #334155",
            borderRadius: "8px",
            color: activeTab === tab.key ? "white" : "#94a3b8",
            cursor: "pointer", fontWeight: "600", fontSize: "14px"
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== DAILY TAB ===== */}
      {activeTab === "daily" && (
        <>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {[
              { label: "উপস্থিত", value: presentCount, color: "#22c55e", icon: <MdCheckCircle size={24} /> },
              { label: "অনুপস্থিত", value: absentCount, color: "#ef4444", icon: <MdCancel size={24} /> },
              { label: "দেরিতে", value: lateCount, color: "#f59e0b", icon: <MdAccessTime size={24} /> },
            ].map(card => (
              <div key={card.label} style={{
                background: "#1e293b", borderRadius: "12px",
                padding: "20px", border: "1px solid #334155",
                display: "flex", alignItems: "center", gap: "16px"
              }}>
                <div style={{ background: card.color + "22", borderRadius: "10px", padding: "12px", color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <p style={{ color: "#94a3b8", fontSize: "13px" }}>{card.label}</p>
                  <h3 style={{ color: "#f1f5f9", fontSize: "28px", fontWeight: "700" }}>{card.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Table */}
          <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  {["কর্মী", "বিভাগ", "চেক ইন", "চেক আউট", "অবস্থা", "চিহ্নিত করুন"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "13px", textAlign: "left", fontWeight: "600" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>লোড হচ্ছে...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>কোনো কর্মী নেই</td></tr>
                ) : employees.map(emp => {
                  const status = getStatus(emp._id);
                  const checkIn = getCheckIn(emp._id);
                  const checkOut = getCheckOut(emp._id);
                  return (
                    <tr key={emp._id} style={{ borderTop: "1px solid #334155" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            background: "#6366f1", display: "flex", alignItems: "center",
                            justifyContent: "center", color: "white", fontWeight: "700", fontSize: "12px"
                          }}>{emp.avatar}</div>
                          <div>
                            <p style={{ color: "#f1f5f9", fontSize: "14px" }}>{emp.name}</p>
                            <p style={{ color: "#94a3b8", fontSize: "12px" }}>{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>{emp.department || "—"}</td>
                      <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>{checkIn || "—"}</td>
                      <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>{checkOut || "—"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        {status ? (
                          <span style={{
                            padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                            background: status === "present" ? "#22c55e22" : status === "absent" ? "#ef444422" : "#f59e0b22",
                            color: status === "present" ? "#22c55e" : status === "absent" ? "#ef4444" : "#f59e0b"
                          }}>
                            {status === "present" ? "উপস্থিত" : status === "absent" ? "অনুপস্থিত" : "দেরিতে"}
                          </span>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: "13px" }}>চিহ্নিত নেই</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleMarkAttendance(emp._id, emp.name, "present")} style={{
                            padding: "6px 12px", background: "#22c55e22", border: "none",
                            borderRadius: "6px", color: "#22c55e", cursor: "pointer", fontSize: "12px"
                          }}>উপস্থিত</button>
                          <button onClick={() => handleMarkAttendance(emp._id, emp.name, "absent")} style={{
                            padding: "6px 12px", background: "#ef444422", border: "none",
                            borderRadius: "6px", color: "#ef4444", cursor: "pointer", fontSize: "12px"
                          }}>অনুপস্থিত</button>
                          <button onClick={() => handleMarkAttendance(emp._id, emp.name, "late")} style={{
                            padding: "6px 12px", background: "#f59e0b22", border: "none",
                            borderRadius: "6px", color: "#f59e0b", cursor: "pointer", fontSize: "12px"
                          }}>দেরিতে</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===== MONTHLY TAB ===== */}
      {activeTab === "monthly" && (
        <>
          {/* Monthly Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {[
              {
                label: "মোট উপস্থিত দিন",
                value: monthlyData.reduce((s, m) => s + m.present, 0),
                color: "#22c55e"
              },
              {
                label: "মোট অনুপস্থিত দিন",
                value: monthlyData.reduce((s, m) => s + m.absent, 0),
                color: "#ef4444"
              },
              {
                label: "মোট দেরিতে",
                value: monthlyData.reduce((s, m) => s + m.late, 0),
                color: "#f59e0b"
              },
              {
                label: "মোট কর্মী",
                value: monthlyData.length,
                color: "#6366f1"
              },
            ].map(card => (
              <div key={card.label} style={{
                background: "#1e293b", borderRadius: "12px",
                padding: "20px", border: "1px solid #334155", textAlign: "center"
              }}>
                <h3 style={{ color: card.color, fontSize: "28px", fontWeight: "700" }}>{card.value}</h3>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Monthly Table */}
          <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", gap: "8px" }}>
              <MdTableChart size={20} style={{ color: "#6366f1" }} />
              <h3 style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: "600" }}>
                {selectedMonthLabel} {selectedYear} — Employee উপস্থিতি সারসংক্ষেপ
              </h3>
            </div>

            {monthlyLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                লোড হচ্ছে...
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0f172a" }}>
                    {["কর্মী", "বিভাগ", "✅ উপস্থিত", "❌ অনুপস্থিত", "⏰ দেরিতে", "মোট দিন", "উপস্থিতির হার"].map(h => (
                      <th key={h} style={{
                        padding: "14px 16px", color: "#94a3b8",
                        fontSize: "13px", textAlign: "left", fontWeight: "600"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        এই মাসে কোনো Attendance data নেই
                      </td>
                    </tr>
                  ) : monthlyData.map((emp, index) => {
                    const rate = emp.total > 0
                      ? Math.round(((emp.present + emp.late) / emp.total) * 100)
                      : 0;
                    const rateColor = rate >= 80 ? "#22c55e" : rate >= 60 ? "#f59e0b" : "#ef4444";

                    return (
                      <tr key={emp._id} style={{
                        borderTop: "1px solid #334155",
                        background: index % 2 === 0 ? "transparent" : "#0f172a22"
                      }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "36px", height: "36px", borderRadius: "50%",
                              background: "#6366f1", display: "flex", alignItems: "center",
                              justifyContent: "center", color: "white", fontWeight: "700", fontSize: "12px"
                            }}>
                              {emp.name?.charAt(0).toUpperCase()}
                            </div>
                            <p style={{ color: "#f1f5f9", fontSize: "14px" }}>{emp.name}</p>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>
                          {emp.department}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            padding: "4px 14px", borderRadius: "20px", fontSize: "13px",
                            background: "#22c55e22", color: "#22c55e", fontWeight: "600"
                          }}>{emp.present}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            padding: "4px 14px", borderRadius: "20px", fontSize: "13px",
                            background: "#ef444422", color: "#ef4444", fontWeight: "600"
                          }}>{emp.absent}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            padding: "4px 14px", borderRadius: "20px", fontSize: "13px",
                            background: "#f59e0b22", color: "#f59e0b", fontWeight: "600"
                          }}>{emp.late}</span>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#f1f5f9", fontSize: "14px", fontWeight: "600" }}>
                          {emp.total} দিন
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {/* Progress bar */}
                            <div style={{
                              flex: 1, height: "6px", background: "#334155",
                              borderRadius: "3px", overflow: "hidden", minWidth: "80px"
                            }}>
                              <div style={{
                                height: "100%", width: `${rate}%`,
                                background: rateColor, borderRadius: "3px",
                                transition: "width 0.3s"
                              }} />
                            </div>
                            <span style={{ color: rateColor, fontSize: "13px", fontWeight: "600", minWidth: "36px" }}>
                              {rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Legend */}
          <div style={{
            marginTop: "16px", padding: "12px 20px",
            background: "#1e293b", borderRadius: "8px",
            border: "1px solid #334155",
            display: "flex", gap: "24px", alignItems: "center"
          }}>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>উপস্থিতির হার:</p>
            {[
              { label: "ভালো (৮০%+)", color: "#22c55e" },
              { label: "মাঝারি (৬০-৮০%)", color: "#f59e0b" },
              { label: "খারাপ (<৬০%)", color: "#ef4444" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }} />
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}