import { useState, useEffect } from "react";
import ProfileSection from "../ProfileSection";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  present: { bg: "#22c55e22", border: "#22c55e", text: "#22c55e", label: "উপস্থিত" },
  absent: { bg: "#ef444422", border: "#ef4444", text: "#ef4444", label: "অনুপস্থিত" },
  late: { bg: "#f59e0b22", border: "#f59e0b", text: "#f59e0b", label: "দেরিতে" },
};

const WEEKDAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const MONTH_NAMES = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export default function MyProfilePage() {
  const { user } = useAuth();
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0 });

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth, currentYear]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/attendance/my?month=${currentMonth}&year=${currentYear}`);
      const map = {};
      let present = 0, absent = 0, late = 0;
      data.forEach(a => {
        map[a.date] = a.status;
        if (a.status === "present") present++;
        else if (a.status === "absent") absent++;
        else if (a.status === "late") late++;
      });
      setAttendanceMap(map);
      setSummary({ present, absent, late });
    } catch (error) {
      toast.error("Attendance লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Calendar days build করা
  const buildCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const cells = [];

    // আগের মাসের blank cells
    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }
    // এই মাসের দিনগুলো
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    return cells;
  };

  const getDateKey = (day) => {
    return `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() + 1 &&
      currentYear === today.getFullYear()
    );
  };

  const cells = buildCalendar();

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", marginBottom: "24px" }}>👤 আমার Profile</h2>

      <ProfileSection user={user} />

      {/* Attendance Calendar */}
      <div style={{ marginTop: "32px" }}>
        <h3 style={{ color: "#f1f5f9", marginBottom: "20px", fontSize: "18px" }}>
          📅 উপস্থিতির ক্যালেন্ডার
        </h3>

        {/* Summary Cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px", marginBottom: "16px", // ✅ ছোট করুন
          maxWidth: "380px", margin: "0 auto 16px" // ✅ center করুন
        }}>
          {[
            { label: "উপস্থিত", value: summary.present, color: "#22c55e" },
            { label: "অনুপস্থিত", value: summary.absent, color: "#ef4444" },
            { label: "দেরিতে", value: summary.late, color: "#f59e0b" },
          ].map(card => (
            <div key={card.label} style={{
              background: "#1e293b", borderRadius: "8px",
              padding: "10px", border: "1px solid #334155", // ✅ padding কমান
              textAlign: "center"
            }}>
              <h3 style={{ color: card.color, fontSize: "20px", fontWeight: "700" }}>{card.value}</h3>
              <p style={{ color: "#94a3b8", fontSize: "11px" }}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Calendar Box */}
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "16px", border: "1px solid #334155",
          maxWidth: "380px", // ✅ যোগ করুন — ছোট করবে
          margin: "0 auto"   // ✅ যোগ করুন — center এ রাখবে
        }}>
          {/* Month Navigator */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: "12px" // ✅ 20px থেকে 12px
          }}>
            <button onClick={prevMonth} style={{
              background: "#334155", border: "none", borderRadius: "6px",
              color: "#f1f5f9", padding: "6px 12px", // ✅ ছোট করুন
              cursor: "pointer", fontSize: "14px" // ✅ 16px থেকে 14px
            }}>‹</button>

            <h4 style={{ color: "#f1f5f9", fontSize: "14px", fontWeight: "600" }}>
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </h4>

            <button onClick={nextMonth} style={{
              background: "#334155", border: "none", borderRadius: "6px",
              color: "#f1f5f9", padding: "6px 12px",
              cursor: "pointer", fontSize: "14px"
            }}>›</button>
          </div>

          {/* Weekday Headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px", marginBottom: "6px"
          }}>
            {WEEKDAYS.map(day => (
              <div key={day} style={{
                textAlign: "center", color: "#94a3b8",
                fontSize: "10px", fontWeight: "600", padding: "2px"
              }}>{day}</div>
            ))}
          </div>
          
          {/* Calendar Days */}
          {loading ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>লোড হচ্ছে...</p>
          ) : (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px"
            }}>
              {cells.map((day, index) => {
                if (!day) return <div key={`blank-${index}`} />;

                const dateKey = getDateKey(day);
                const status = attendanceMap[dateKey];
                const colors = status ? STATUS_COLORS[status] : null;
                const todayStyle = isToday(day);

                return (
                  <div key={dateKey} style={{
                    aspectRatio: "1",
                    borderRadius: "6px", // ✅ 8px থেকে 6px
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: colors ? colors.bg : "transparent",
                    border: todayStyle
                      ? "2px solid #6366f1"
                      : colors
                        ? `1px solid ${colors.border}44`
                        : "1px solid #334155",
                    cursor: "default",
                    padding: "2px" // ✅ 4px থেকে 2px
                  }}>
                    <span style={{
                      fontSize: "11px", // ✅ 13px থেকে 11px
                      fontWeight: todayStyle ? "700" : "400",
                      color: colors ? colors.text : todayStyle ? "#6366f1" : "#94a3b8"
                    }}>{day}</span>
                    {status && (
                      <span style={{
                        fontSize: "7px", // ✅ 8px থেকে 7px
                        color: colors.text,
                        marginTop: "1px",
                        fontWeight: "600"
                      }}>
                        {status === "present" ? "✓" : status === "absent" ? "✗" : "~"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div style={{
            display: "flex", gap: "12px", marginTop: "12px", // ✅ কমান
            justifyContent: "center", flexWrap: "wrap"
          }}>
            {Object.entries(STATUS_COLORS).map(([key, val]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{
                  width: "10px", height: "10px", borderRadius: "3px", // ✅ 12px থেকে 10px
                  background: val.bg, border: `1px solid ${val.border}`
                }} />
                <span style={{ color: "#94a3b8", fontSize: "11px" }}>{val.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}