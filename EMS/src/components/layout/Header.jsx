import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useNavigate, useLocation } from "react-router-dom";
import { MdLogout, MdPerson, MdNotifications, MdMenu } from "react-icons/md";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function Header({ onMenuClick, isMobile }) {
  const { user, logout } = useAuth();
  const { unreadCount, setUnreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUnreadCount();
  }, [location]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await API.get("/notifications");
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logout সফল!");
    navigate("/login");
  };

  return (
    <div style={{
      background: "#1e293b", borderBottom: "1px solid #334155",
      padding: isMobile ? "12px 16px" : "16px 24px",
      display: "flex", justifyContent: "space-between", alignItems: "center"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <button onClick={onMenuClick} style={{
            background: "none", border: "none",
            color: "#f1f5f9", cursor: "pointer",
            display: "flex", alignItems: "center"
          }}>
            <MdMenu size={24} />
          </button>
        )}
        <h3 style={{ color: "#f1f5f9", fontSize: isMobile ? "14px" : "18px" }}>
          {isMobile ? `👋 ${user?.name?.split(" ")[0]}` : `স্বাগতম, ${user?.name} 👋`}
        </h3>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "16px" }}>
        {/* Notification Bell */}
        <Link to="/notifications" style={{
          position: "relative", color: "#94a3b8",
          textDecoration: "none", display: "flex", alignItems: "center"
        }}>
          <MdNotifications size={24} />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: "-6px", right: "-6px",
              background: "#ef4444", color: "white",
              borderRadius: "50%", width: "18px", height: "18px",
              fontSize: "11px", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontWeight: "700"
            }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </Link>

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "14px" }}>
            <MdPerson size={18} />
            {user?.role?.toUpperCase()}
          </div>
        )}

        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: isMobile ? "6px 10px" : "8px 16px",
          background: "#ef4444", border: "none", borderRadius: "8px",
          color: "white", cursor: "pointer",
          fontSize: isMobile ? "12px" : "14px"
        }}>
          <MdLogout size={16} />
          {!isMobile && "Logout"}
        </button>
      </div>
    </div>
  );
}