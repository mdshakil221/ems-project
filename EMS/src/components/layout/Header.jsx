import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useNavigate, useLocation } from "react-router-dom";
import { MdLogout, MdPerson, MdNotifications } from "react-icons/md";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function Header() {
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
      padding: "16px 24px", display: "flex",
      justifyContent: "space-between", alignItems: "center"
    }}>
      <h3 style={{ color: "#f1f5f9", fontSize: "18px" }}>
        স্বাগতম, {user?.name} 👋
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "14px" }}>
          <MdPerson size={18} />
          {user?.role?.toUpperCase()}
        </div>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "8px 16px", background: "#ef4444",
          border: "none", borderRadius: "8px",
          color: "white", cursor: "pointer", fontSize: "14px"
        }}>
          <MdLogout size={16} /> Logout
        </button>
      </div>
    </div>
  );
}