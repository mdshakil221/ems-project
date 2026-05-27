import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";
import {
  MdDashboard, MdLogout, MdPerson,
  MdCampaign, MdBeachAccess, MdDescription,
  MdMenu, MdClose, MdTask, MdEventNote,
  MdPayment, MdStar, MdChat
} from "react-icons/md";
import toast from "react-hot-toast";
import useWindowSize from "../../hooks/useWindowSize";
import path from "node:path";

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logout সফল!");
    navigate("/login");
  };

  const menuItems = [
    { path: "/employee/dashboard", label: "Dashboard", icon: <MdDashboard size={20} /> },
    { path: "/employee/tasks", label: "আমার কাজ", icon: <MdTask size={20} /> },
    { path: "/employee/leaves", label: "আমার ছুটি", icon: <MdEventNote size={20} /> },
    { path: "/employee/profile", label: "আমার Profile", icon: <MdPerson size={20} /> },
    { path: "/employee/salary", label: "আমার বেতন", icon: <MdPayment size={20} /> },
    { path: "/employee/performance", label: "আমার Performance", icon: <MdStar size={20} /> },
    { path: "/employee/announcements", label: "Announcements", icon: <MdCampaign size={20} /> },
    { path: "/employee/holidays", label: "Holidays", icon: <MdBeachAccess size={20} /> },
    { path: "/employee/documents", label: "Documents", icon: <MdDescription size={20} /> },
    { path: "/employee/chat", label: "Chat", icon: <MdChat size={20} />}
  ];

  const SidebarContent = () => (
    <div style={{
      width: "240px", height: "100vh", background: "#1e293b",
      borderRight: "1px solid #334155", padding: "24px 16px",
      display: "flex", flexDirection: "column", overflowY: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h2 style={{ color: "#6366f1", fontSize: "22px", fontWeight: "700" }}>EMS</h2>
          <p style={{ color: "#94a3b8", fontSize: "12px" }}>Employee Portal</p>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{
            background: "none", border: "none",
            color: "#94a3b8", cursor: "pointer"
          }}>
            <MdClose size={22} />
          </button>
        )}
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {menuItems.map(item => (
          <NavLink key={item.path} to={item.path}
            onClick={() => isMobile && setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderRadius: "8px",
              color: isActive ? "#6366f1" : "#94a3b8",
              background: isActive ? "#0f172a" : "transparent",
              textDecoration: "none", fontSize: "14px", fontWeight: "500"
            })}>
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div style={{
        padding: "16px", background: "#0f172a",
        borderRadius: "8px", marginTop: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "#6366f1", display: "flex",
            alignItems: "center", justifyContent: "center", color: "white"
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
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0,
          background: "#00000066", zIndex: 40
        }} />
      )}
      <div style={{
        position: isMobile ? "fixed" : "relative",
        left: isMobile ? (sidebarOpen ? "0" : "-240px") : "0",
        top: 0, bottom: 0, zIndex: 50,
        transition: "left 0.3s ease"
      }}>
        <SidebarContent />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{
          background: "#1e293b", borderBottom: "1px solid #334155",
          padding: isMobile ? "12px 16px" : "16px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{
                background: "none", border: "none",
                color: "#f1f5f9", cursor: "pointer"
              }}>
                <MdMenu size={24} />
              </button>
            )}
            <h3 style={{ color: "#f1f5f9", fontSize: isMobile ? "14px" : "18px" }}>
              {isMobile ? `👋 ${user?.name?.split(" ")[0]}` : `স্বাগতম, ${user?.name} 👋`}
            </h3>
          </div>
          <span style={{
            padding: "4px 12px", background: "#6366f122",
            border: "1px solid #6366f144", borderRadius: "20px",
            color: "#6366f1", fontSize: "12px"
          }}>Employee</span>
        </div>
        <main style={{ flex: 1, padding: isMobile ? "16px" : "24px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}