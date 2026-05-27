import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
      newSocket.emit("join", user._id);

      // ✅ Notifications
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

      // ✅ Announcements
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
            </div>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>{announcement.message}</p>
          </div>
        ), { duration: 6000 });
      });

      // ✅ Online Users
      newSocket.on("online_users", (users) => {
        setOnlineUsers(users);
      });

      // ✅ Private Message
      newSocket.on("new_private_message", (message) => {
        toast.custom(() => (
          <div style={{
            background: "#1e293b", border: "1px solid #334155",
            borderLeft: "4px solid #22c55e", borderRadius: "8px",
            padding: "12px 16px", display: "flex",
            alignItems: "center", gap: "12px",
            color: "#f1f5f9", fontSize: "14px", maxWidth: "350px"
          }}>
            <span style={{ fontSize: "20px" }}>💬</span>
            <div>
              <p style={{ fontWeight: "600", fontSize: "13px" }}>{message.senderName}</p>
              <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                {message.message.length > 40
                  ? message.message.substring(0, 40) + "..."
                  : message.message}
              </p>
            </div>
          </div>
        ), { duration: 4000 });
      });

      // ✅ Typing
      newSocket.on("user_typing", (data) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.senderId]: data.isTyping ? data.senderName : null
        }));
      });

      newSocket.on("team_user_typing", (data) => {
        setTypingUsers(prev => ({
          ...prev,
          [`team_${data.senderId}`]: data.isTyping ? data.senderName : null
        }));
      });

      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{
      socket, unreadCount, setUnreadCount,
      onlineUsers, typingUsers
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);