import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { MdDashboard, MdLogout, MdPerson, MdCampaign, MdBeachAccess, MdDescription } from "react-icons/md";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logout সফল!");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>
      {/* Sidebar */}
      <div style={{
        width: "240px", background: "#1e293b",
        borderRight: "1px solid #334155", padding: "24px 16px",
        display: "flex", flexDirection: "column"
      }}>
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h2 style={{ color: "#6366f1", fontSize: "22px", fontWeight: "700" }}>EMS</h2>
          <p style={{ color: "#94a3b8", fontSize: "12px" }}>Employee Portal</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {/* ✅ Dashboard */}
          <NavLink to="/employee/dashboard"
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderRadius: "8px",
              color: isActive ? "#6366f1" : "#94a3b8",
              background: isActive ? "#0f172a" : "transparent",
              textDecoration: "none", fontSize: "14px", fontWeight: "500"
            })}>
            <MdDashboard size={20} /> Dashboard
          </NavLink>

          {/* ✅ Announcements */}
          <NavLink to="/employee/announcements"
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderRadius: "8px",
              color: isActive ? "#6366f1" : "#94a3b8",
              background: isActive ? "#0f172a" : "transparent",
              textDecoration: "none", fontSize: "14px", fontWeight: "500"
            })}>
            <MdCampaign size={20} /> Announcements
          </NavLink>

          {/*NavLink*/}
          <NavLink to="/employee/holidays"
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderRadius: "8px",
              color: isActive ? "#6366f1" : "#94a3b8",
              background: isActive ? "#0f172a" : "transparent",
              textDecoration: "none", fontSize: "14px", fontWeight: "500"
            })}>
            <MdBeachAccess size={20} /> Holidays
          </NavLink>

          {/*NavLink Documents*/}
          <NavLink to="/employee/documents"
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderRadius: "8px",
              color: isActive ? "#6366f1" : "#94a3b8",
              background: isActive ? "#0f172a" : "transparent",
              textDecoration: "none", fontSize: "14px", fontWeight: "500"
            })}>
            <MdDescription size={20} /> Documents
          </NavLink>
        </nav>

        {/* User Info */}
        <div style={{
          padding: "16px", background: "#0f172a",
          borderRadius: "8px", marginTop: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "#6366f1", display: "flex", alignItems: "center",
              justifyContent: "center", color: "white"
            }}>
              <MdPerson size={20} />
            </div>
            <div>
              <p style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: "600" }}>{user?.name}</p>
              <p style={{ color: "#94a3b8", fontSize: "11px" }}>Employee</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "6px", padding: "8px",
            background: "#ef444422", border: "none", borderRadius: "6px",
            color: "#ef4444", cursor: "pointer", fontSize: "13px"
          }}>
            <MdLogout size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{
          background: "#1e293b", borderBottom: "1px solid #334155",
          padding: "16px 24px", display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <h3 style={{ color: "#f1f5f9" }}>স্বাগতম, {user?.name} 👋</h3>
          <span style={{
            padding: "4px 12px", background: "#6366f122",
            border: "1px solid #6366f144", borderRadius: "20px",
            color: "#6366f1", fontSize: "12px"
          }}>Employee</span>
        </div>
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}