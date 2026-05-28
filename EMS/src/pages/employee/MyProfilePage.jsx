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

  // ✅ Check In/Out state
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchAttendance();
    fetchTodayAttendance();
    // ✅ Clock update every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [currentMonth, currentYear]);

  const fetchTodayAttendance = async () => {
    try {
      const { data } = await API.get("/attendance/today");
      setTodayAttendance(data);
    } catch (error) {
      console.error(error);
    }
  };

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

  // ✅ Check In handler
  const handleCheckIn = async () => {
    try {
      setCheckLoading(true);
      const { data } = await API.post("/attendance/checkin");
      setTodayAttendance(data);
      fetchAttendance();
      const msg = data.status === "late"
        ? `⏰ দেরিতে Check In হয়েছে! সময়: ${data.checkIn}`
        : `✅ Check In সফল! সময়: ${data.checkIn}`;
      toast.success(msg);
    } catch (error) {
      toast.error(error.response?.data?.message || "Check In ব্যর্থ!");
    } finally {
      setCheckLoading(false);
    }
  };

  // ✅ Check Out handler
  const handleCheckOut = async () => {
    try {
      setCheckLoading(true);
      const { data } = await API.post("/attendance/checkout");
      setTodayAttendance(data);
      toast.success(`✅ Check Out সফল! সময়: ${data.checkOut}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Check Out ব্যর্থ!");
    } finally {
      setCheckLoading(false);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const buildCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  };

  const getDateKey = (day) =>
    `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() + 1 &&
    currentYear === today.getFullYear();

  const cells = buildCalendar();

  // ✅ Late হবে কিনা বলে দেখাবে
  const nowHour = currentTime.getHours();
  const willBeLate = nowHour >= 9;

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", marginBottom: "24px" }}>👤 আমার Profile</h2>

      {/* ✅ Check In/Out Card — সবার উপরে */}
      <div style={{
        background: "#1e293b", borderRadius: "12px",
        padding: "20px", border: "1px solid #334155",
        marginBottom: "24px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>

          {/* Left — Status Info */}
          <div>
            <h3 style={{ color: "#f1f5f9", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
              🕐 আজকের উপস্থিতি
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>
              {today.toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
              বর্তমান সময়: {currentTime.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
            </p>

            {/* Status badges */}
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
              {todayAttendance ? (
                <>
                  <span style={{
                    padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                    background: todayAttendance.status === "present" ? "#22c55e22" :
                      todayAttendance.status === "late" ? "#f59e0b22" : "#ef444422",
                    color: todayAttendance.status === "present" ? "#22c55e" :
                      todayAttendance.status === "late" ? "#f59e0b" : "#ef4444"
                  }}>
                    {todayAttendance.status === "present" ? "✅ উপস্থিত" :
                      todayAttendance.status === "late" ? "⏰ দেরিতে" : "❌ অনুপস্থিত"}
                  </span>
                  {todayAttendance.checkIn && (
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                      background: "#6366f122", color: "#6366f1"
                    }}>
                      🟢 In: {todayAttendance.checkIn}
                    </span>
                  )}
                  {todayAttendance.checkOut && (
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                      background: "#94a3b822", color: "#94a3b8"
                    }}>
                      🔴 Out: {todayAttendance.checkOut}
                    </span>
                  )}
                </>
              ) : (
                <span style={{
                  padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                  background: "#334155", color: "#94a3b8"
                }}>
                  ⏳ এখনো Check In হয়নি
                </span>
              )}
            </div>

            {/* Late warning */}
            {!todayAttendance && willBeLate && (
              <p style={{
                color: "#f59e0b", fontSize: "12px", marginTop: "8px",
                background: "#f59e0b11", padding: "6px 10px", borderRadius: "6px",
                border: "1px solid #f59e0b22"
              }}>
                ⚠️ সকাল ৯টা পার হয়েছে — Check In করলে "দেরিতে" হিসেবে গণ্য হবে
              </p>
            )}
          </div>

          {/* Right — Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "160px" }}>
            {/* Check In button */}
            <button
              onClick={handleCheckIn}
              disabled={checkLoading || !!todayAttendance?.checkIn}
              style={{
                padding: "12px 24px",
                background: todayAttendance?.checkIn ? "#334155" : "#22c55e",
                border: "none", borderRadius: "8px",
                color: todayAttendance?.checkIn ? "#64748b" : "white",
                cursor: todayAttendance?.checkIn ? "not-allowed" : "pointer",
                fontWeight: "600", fontSize: "14px",
                opacity: checkLoading ? 0.7 : 1
              }}>
              {checkLoading ? "⏳..." : todayAttendance?.checkIn ? `✅ In: ${todayAttendance.checkIn}` : "🟢 Check In"}
            </button>

            {/* Check Out button */}
            <button
              onClick={handleCheckOut}
              disabled={checkLoading || !todayAttendance?.checkIn || !!todayAttendance?.checkOut}
              style={{
                padding: "12px 24px",
                background: !todayAttendance?.checkIn || todayAttendance?.checkOut ? "#334155" : "#ef4444",
                border: "none", borderRadius: "8px",
                color: !todayAttendance?.checkIn || todayAttendance?.checkOut ? "#64748b" : "white",
                cursor: (!todayAttendance?.checkIn || todayAttendance?.checkOut) ? "not-allowed" : "pointer",
                fontWeight: "600", fontSize: "14px",
                opacity: checkLoading ? 0.7 : 1
              }}>
              {todayAttendance?.checkOut ? `🔴 Out: ${todayAttendance.checkOut}` : "🔴 Check Out"}
            </button>
          </div>
        </div>
      </div>

      {/* Profile + Calendar পাশাপাশি */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        alignItems: "start"
      }}>
        {/* Left — Profile */}
        <ProfileSection user={user} />

        {/* Right — Calendar */}
        <div>
          <h3 style={{ color: "#f1f5f9", marginBottom: "16px", fontSize: "16px" }}>
            📅 উপস্থিতির ক্যালেন্ডার
          </h3>

          {/* Summary Cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px", marginBottom: "12px"
          }}>
            {[
              { label: "উপস্থিত", value: summary.present, color: "#22c55e" },
              { label: "অনুপস্থিত", value: summary.absent, color: "#ef4444" },
              { label: "দেরিতে", value: summary.late, color: "#f59e0b" },
            ].map(card => (
              <div key={card.label} style={{
                background: "#1e293b", borderRadius: "8px",
                padding: "8px", border: "1px solid #334155",
                textAlign: "center"
              }}>
                <h3 style={{ color: card.color, fontSize: "18px", fontWeight: "700" }}>{card.value}</h3>
                <p style={{ color: "#94a3b8", fontSize: "11px" }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Calendar Box */}
          <div style={{
            background: "#1e293b", borderRadius: "12px",
            padding: "12px", border: "1px solid #334155"
          }}>
            {/* Month Navigator */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "10px"
            }}>
              <button onClick={prevMonth} style={{
                background: "#334155", border: "none", borderRadius: "6px",
                color: "#f1f5f9", padding: "4px 10px", cursor: "pointer", fontSize: "13px"
              }}>‹</button>
              <h4 style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: "600" }}>
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </h4>
              <button onClick={nextMonth} style={{
                background: "#334155", border: "none", borderRadius: "6px",
                color: "#f1f5f9", padding: "4px 10px", cursor: "pointer", fontSize: "13px"
              }}>›</button>
            </div>

            {/* Weekday Headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              gap: "2px", marginBottom: "4px"
            }}>
              {WEEKDAYS.map(day => (
                <div key={day} style={{
                  textAlign: "center", color: "#64748b",
                  fontSize: "9px", fontWeight: "600", padding: "2px"
                }}>{day}</div>
              ))}
            </div>

            {/* Calendar Days */}
            {loading ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "16px", fontSize: "12px" }}>লোড হচ্ছে...</p>
            ) : (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                gap: "2px"
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
                      borderRadius: "4px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: colors ? colors.bg : "transparent",
                      border: todayStyle
                        ? "2px solid #6366f1"
                        : colors
                        ? `1px solid ${colors.border}44`
                        : "1px solid #33415544",
                      padding: "2px"
                    }}>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: todayStyle ? "700" : "400",
                        color: colors ? colors.text : todayStyle ? "#6366f1" : "#94a3b8"
                      }}>{day}</span>
                      {status && (
                        <span style={{
                          fontSize: "7px", color: colors.text,
                          marginTop: "1px", fontWeight: "600"
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
              display: "flex", gap: "10px", marginTop: "10px",
              justifyContent: "center", flexWrap: "wrap"
            }}>
              {Object.entries(STATUS_COLORS).map(([key, val]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "2px",
                    background: val.bg, border: `1px solid ${val.border}`
                  }} />
                  <span style={{ color: "#94a3b8", fontSize: "10px" }}>{val.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}