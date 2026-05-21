import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // ✅ role পাঠানো হচ্ছে
    const user = await login(email, password, role);
    if (user) {
      if (user.role === "admin") {
        navigate("/");
      } else {
        navigate("/employee/dashboard");
      }
    }
  };

  // Role Select Screen
  if (!role) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#0f172a"
      }}>
        <div style={{ width: "100%", maxWidth: "480px", padding: "24px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h1 style={{ color: "#6366f1", fontSize: "36px", fontWeight: "700" }}>EMS</h1>
            <p style={{ color: "#f1f5f9", fontSize: "20px", marginTop: "8px" }}>
              Employee Management System
            </p>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "8px" }}>
              আপনি কে? নিচে থেকে বেছে নিন
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div
              onClick={() => setRole("admin")}
              style={{
                background: "#1e293b", borderRadius: "16px",
                padding: "32px 24px", border: "1px solid #334155",
                cursor: "pointer", textAlign: "center"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = "1px solid #6366f1";
                e.currentTarget.style.background = "#6366f111";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = "1px solid #334155";
                e.currentTarget.style.background = "#1e293b";
              }}
            >
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: "#6366f122", display: "flex",
                alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", fontSize: "32px"
              }}>👨‍💼</div>
              <h3 style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
                Admin
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                সিস্টেম পরিচালনা করুন
              </p>
            </div>

            <div
              onClick={() => setRole("employee")}
              style={{
                background: "#1e293b", borderRadius: "16px",
                padding: "32px 24px", border: "1px solid #334155",
                cursor: "pointer", textAlign: "center"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = "1px solid #22c55e";
                e.currentTarget.style.background = "#22c55e11";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = "1px solid #334155";
                e.currentTarget.style.background = "#1e293b";
              }}
            >
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: "#22c55e22", display: "flex",
                alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", fontSize: "32px"
              }}>👨‍💻</div>
              <h3 style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
                Employee
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                আপনার কাজ দেখুন
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Form
  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#0f172a"
    }}>
      <div style={{
        background: "#1e293b", padding: "40px",
        borderRadius: "16px", width: "100%", maxWidth: "400px",
        border: `1px solid ${role === "admin" ? "#6366f144" : "#22c55e44"}`
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: role === "admin" ? "#6366f122" : "#22c55e22",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "32px"
          }}>
            {role === "admin" ? "👨‍💼" : "👨‍💻"}
          </div>
          <h2 style={{ color: "#f1f5f9", fontSize: "22px", fontWeight: "700" }}>
            {role === "admin" ? "Admin Login" : "Employee Login"}
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "6px" }}>
            {role === "admin"
              ? "শুধুমাত্র Admin প্রবেশ করতে পারবেন"
              : "শুধুমাত্র Employee প্রবেশ করতে পারবেন"}
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ color: "#94a3b8", display: "block", marginBottom: "8px", fontSize: "14px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={role === "admin" ? "admin@ems.com" : "employee@ems.com"}
              required
              style={{
                width: "100%", padding: "12px",
                background: "#0f172a", border: "1px solid #334155",
                borderRadius: "8px", color: "#f1f5f9",
                fontSize: "14px", outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ color: "#94a3b8", display: "block", marginBottom: "8px", fontSize: "14px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "12px",
                background: "#0f172a", border: "1px solid #334155",
                borderRadius: "8px", color: "#f1f5f9",
                fontSize: "14px", outline: "none"
              }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px",
            background: role === "admin" ? "#6366f1" : "#22c55e",
            border: "none", borderRadius: "8px",
            color: "white", fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600", marginBottom: "12px",
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? "লোড হচ্ছে..." : "Login করুন"}
          </button>

          <button
            type="button"
            onClick={() => { setRole(null); setEmail(""); setPassword(""); }}
            style={{
              width: "100%", padding: "12px",
              background: "transparent",
              border: "1px solid #334155", borderRadius: "8px",
              color: "#94a3b8", fontSize: "14px", cursor: "pointer"
            }}>
            ← পিছনে যান
          </button>
        </form>
      </div>
    </div>
  );
}