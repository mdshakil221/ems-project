import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5000");
      newSocket.emit("join", user._id);

      // ✅ Real-time notification
      newSocket.on("new_notification", (notification) => {
        setUnreadCount(prev => prev + 1);
        toast.custom(() => (
          <div style={{
            background: "#1e293b", border: "1px solid #334155",
            borderLeft: "4px solid #6366f1", borderRadius: "8px",
            padding: "12px 16px", display: "flex",
            alignItems: "center", gap: "12px",
            color: "#f1f5f9", fontSize: "14px", maxWidth: "350px"
          }}>
            <span style={{ fontSize: "20px" }}>🔔</span>
            <span>{notification.message}</span>
          </div>
        ), { duration: 4000 });
      });

      // ✅ Real-time Announcement
      newSocket.on("new_announcement", (announcement) => {
        const priorityColor = {
          urgent: "#ef4444", high: "#f59e0b",
          medium: "#6366f1", low: "#22c55e"
        }[announcement.priority] || "#6366f1";

        toast.custom(() => (
          <div style={{
            background: "#1e293b", border: "1px solid #334155",
            borderLeft: `4px solid ${priorityColor}`,
            borderRadius: "8px", padding: "16px",
            maxWidth: "380px", color: "#f1f5f9"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "18px" }}>📢</span>
              <span style={{ fontWeight: "700", fontSize: "14px" }}>{announcement.title}</span>
              <span style={{
                padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                background: priorityColor + "22", color: priorityColor
              }}>{announcement.priority}</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>{announcement.message}</p>
          </div>
        ), { duration: 6000 });
      });

      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);