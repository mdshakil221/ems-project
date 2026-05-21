import { useState, useEffect } from "react";
import API from "../api/axios";
import { MdStar } from "react-icons/md";
import toast from "react-hot-toast";

export default function MyPerformanceSection() {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPerformance(); }, []);

  const fetchPerformance = async () => {
    try {
      const { data } = await API.get("/performance/my");
      setPerformances(data);
    } catch (error) {
      toast.error("Performance লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 5) return "#22c55e";
    if (rating >= 4) return "#6366f1";
    if (rating >= 3) return "#f59e0b";
    return "#ef4444";
  };

  const getRatingLabel = (rating) => {
    if (rating >= 5) return "অসাধারণ ⭐";
    if (rating >= 4) return "ভালো 👍";
    if (rating >= 3) return "মোটামুটি 😐";
    return "উন্নতি দরকার 📈";
  };

  if (loading) return <p style={{ color: "#94a3b8" }}>লোড হচ্ছে...</p>;

  return (
    <div>
      <h3 style={{ color: "#f1f5f9", marginBottom: "20px" }}>আমার Performance</h3>
      {performances.length === 0 ? (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "60px", border: "1px solid #334155", textAlign: "center"
        }}>
          <MdStar size={48} style={{ color: "#334155", marginBottom: "16px" }} />
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো Performance মূল্যায়ন নেই</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {performances.map(perf => (
            <div key={perf._id} style={{
              background: "#1e293b", borderRadius: "12px",
              padding: "24px", border: "1px solid #334155",
              borderLeft: `4px solid ${getRatingColor(perf.rating)}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <h4 style={{ color: "#f1f5f9" }}>{perf.month} {perf.year}</h4>
                  <p style={{ color: getRatingColor(perf.rating), fontSize: "14px", marginTop: "4px" }}>
                    {getRatingLabel(perf.rating)}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <MdStar key={star} size={22}
                      style={{ color: star <= perf.rating ? getRatingColor(perf.rating) : "#334155" }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: "#0f172a", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                  <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Task সম্পন্ন</p>
                  <p style={{ color: "#22c55e", fontSize: "20px", fontWeight: "700" }}>
                    {perf.taskCompleted}/{perf.taskTotal}
                  </p>
                  <div style={{ height: "4px", background: "#334155", borderRadius: "2px", marginTop: "8px" }}>
                    <div style={{
                      height: "100%",
                      width: perf.taskTotal > 0 ? `${(perf.taskCompleted / perf.taskTotal) * 100}%` : "0%",
                      background: "#22c55e", borderRadius: "2px"
                    }} />
                  </div>
                </div>
                <div style={{ background: "#0f172a", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                  <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>উপস্থিতি</p>
                  <p style={{ color: "#6366f1", fontSize: "20px", fontWeight: "700" }}>
                    {perf.attendancePresent}/{perf.attendanceTotal}
                  </p>
                  <div style={{ height: "4px", background: "#334155", borderRadius: "2px", marginTop: "8px" }}>
                    <div style={{
                      height: "100%",
                      width: perf.attendanceTotal > 0 ? `${(perf.attendancePresent / perf.attendanceTotal) * 100}%` : "0%",
                      background: "#6366f1", borderRadius: "2px"
                    }} />
                  </div>
                </div>
              </div>

              {perf.comment && (
                <div style={{
                  background: "#0f172a", borderRadius: "8px",
                  padding: "12px", border: "1px solid #334155"
                }}>
                  <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Admin এর মন্তব্য:</p>
                  <p style={{ color: "#f1f5f9", fontSize: "14px", fontStyle: "italic" }}>"{perf.comment}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}