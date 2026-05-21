import { useState, useEffect } from "react";
import API from "../../../api/axios";
import { MdCheckCircle, MdCancel, MdAccessTime } from "react-icons/md";
import toast from "react-hot-toast";
import ExportButtons from "../../../components/common/ExportButtons";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

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

  const handleMarkAttendance = async (employeeId, employeeName, status) => {
    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: false
    });
    try {
      const { data } = await API.post("/attendance", {
        employeeId,
        employeeName,
        date: selectedDate,
        checkIn: status === "present" || status === "late" ? now : null,
        status
      });
      setAttendance(prev => {
        const exists = prev.find(a => a.employeeId === employeeId);
        if (exists) {
          return prev.map(a => a.employeeId === employeeId ? data : a);
        }
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

  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;
  const lateCount = attendance.filter(a => a.status === "late").length;

  const inputStyle = {
    padding: "10px 12px", background: "#0f172a",
    border: "1px solid #334155", borderRadius: "8px",
    color: "#f1f5f9", fontSize: "14px", outline: "none"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#f1f5f9" }}>উপস্থিতি</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>প্রতিদিনের উপস্থিতি ট্র্যাক করুন</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <ExportButtons
            data={attendance.map(a => ({
              Employee: a.employeeName,
              Date: a.date,
              CheckIn: a.checkIn || "",
              Status: a.status === "present" ? "Present" :
                a.status === "absent" ? "Absent" : "Late"
            }))}
            filename={`attendance-${selectedDate}`}
            title={`Attendance Report - ${selectedDate}`}
            columns={["Employee", "Date", "Check In", "Status"]}
            pdfData={attendance.map(a => [
              a.employeeName, a.date, a.checkIn || "",
              a.status === "present" ? "Present" :
                a.status === "absent" ? "Absent" : "Late"
            ])}
          />
          <input type="date" value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

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

      {/* Table */}
      <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              {["কর্মী", "বিভাগ", "চেক ইন", "অবস্থা", "চিহ্নিত করুন"].map(h => (
                <th key={h} style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "13px", textAlign: "left", fontWeight: "600" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>লোড হচ্ছে...</td></tr>
            ) : employees.map(emp => {
              const status = getStatus(emp._id);
              const checkIn = getCheckIn(emp._id);
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
                  <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>{emp.department}</td>
                  <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>{checkIn || "—"}</td>
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
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>চিহ্নিত নেই</span>
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
    </div>
  );
}