import { useState, useEffect, useRef } from "react";
import API from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "../../../context/SocketContext";
import { MdSend, MdPeople, MdPerson, MdCircle } from "react-icons/md";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, onlineUsers, typingUsers } = useSocket();
  const [activeTab, setActiveTab] = useState("team"); // team | private
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    if (activeTab === "team") fetchTeamMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Socket Events
  useEffect(() => {
    if (!socket) return;

    socket.on("new_team_message", (message) => {
      if (activeTab === "team") {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on("new_private_message", (message) => {
      setMessages(prev => {
        if (
          activeTab === "private" &&
          selectedUser &&
          (message.senderId === selectedUser._id ||
            message.senderId?.toString() === selectedUser._id?.toString())
        ) {
          return [...prev, message];
        }
        return prev;
      });
    });

    return () => {
      socket.off("new_team_message");
      socket.off("new_private_message");
    };
  }, [socket, activeTab, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUsers = async () => {
    try {
      if (user?.role === "admin") {
        // ✅ Admin দেখবে সব Employee
        const { data } = await API.get("/auth/users");
        setUsers(data.filter(u => u._id !== user._id));
      } else {
        // ✅ Employee দেখবে Admin কে
        const { data } = await API.get("/auth/users");
        const admins = data.filter(u => u.role === "admin");
        setUsers(admins);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTeamMessages = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/chat/team");
      setMessages(data);
    } catch (error) {
      toast.error("Message লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivateMessages = async (userId) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/chat/private/${userId}`);
      setMessages(data);
      await API.put(`/chat/read/${userId}`);
    } catch (error) {
      toast.error("Message লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setActiveTab("private");
    setMessages([]); // ✅ আগের messages clear করুন
    fetchPrivateMessages(u._id);
  };

 const handleSendMessage = async () => {
  if (!newMessage.trim()) return;
  try {
    setSending(true);
    const payload = activeTab === "team"
      ? { message: newMessage, type: "team" }
      : {
        message: newMessage,
        type: "private",
        receiverId: selectedUser._id,
        receiverName: selectedUser.name
      };

    const { data } = await API.post("/chat/send", payload);

    // ✅ নিজের message তাৎক্ষণিক দেখান
    setMessages(prev => [...prev, data]);
    setNewMessage("");

    if (activeTab === "team") {
      socket?.emit("team_message", { message: data });
    } else {
      // ✅ Receiver এর _id String এ convert করুন
      socket?.emit("private_message", {
        receiverId: selectedUser._id.toString(),
        message: data
      });
    }
  } catch (error) {
    toast.error("Message পাঠানো ব্যর্থ!");
  } finally {
    setSending(false);
  }
};

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (activeTab === "private" && selectedUser) {
      socket?.emit("typing", {
        receiverId: selectedUser._id,
        senderId: user._id,
        senderName: user.name,
        isTyping: true
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit("typing", {
          receiverId: selectedUser._id,
          senderId: user._id,
          senderName: user.name,
          isTyping: false
        });
      }, 2000);
    } else if (activeTab === "team") {
      socket?.emit("team_typing", {
        senderId: user._id,
        senderName: user.name,
        isTyping: true
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit("team_typing", {
          senderId: user._id,
          senderName: user.name,
          isTyping: false
        });
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isOnline = (userId) => onlineUsers.includes(userId?.toString());

  const getTypingText = () => {
    if (activeTab === "private" && selectedUser) {
      const typing = typingUsers[selectedUser._id];
      if (typing) return `${typing} লিখছে...`;
    } else if (activeTab === "team") {
      const teamTyping = Object.entries(typingUsers)
        .filter(([key, val]) => key.startsWith("team_") && val && key !== `team_${user._id}`)
        .map(([, val]) => val);
      if (teamTyping.length > 0) return `${teamTyping[0]} লিখছে...`;
    }
    return null;
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 120px)", gap: "0" }}>

      {/* Left Sidebar — User List */}
      <div style={{
        width: "260px", background: "#1e293b",
        borderRadius: "12px 0 0 12px",
        border: "1px solid #334155",
        display: "flex", flexDirection: "column",
        flexShrink: 0
      }}>
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid #334155" }}>
          <h3 style={{ color: "#f1f5f9", fontSize: "16px", fontWeight: "600" }}>💬 Chat</h3>
        </div>

        {/* Team Chat Button */}
        <div
          onClick={() => { setActiveTab("team"); setSelectedUser(null); fetchTeamMessages(); }}
          style={{
            padding: "14px 16px", cursor: "pointer",
            background: activeTab === "team" ? "#0f172a" : "transparent",
            borderLeft: activeTab === "team" ? "3px solid #6366f1" : "3px solid transparent",
            display: "flex", alignItems: "center", gap: "10px"
          }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "50%",
            background: "#6366f122", display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>
            <MdPeople size={20} style={{ color: "#6366f1" }} />
          </div>
          <div>
            <p style={{ color: "#f1f5f9", fontSize: "14px", fontWeight: "500" }}>Team Chat</p>
            <p style={{ color: "#94a3b8", fontSize: "11px" }}>সবার জন্য</p>
          </div>
        </div>

        <div style={{ padding: "8px 16px" }}>
          <p style={{ color: "#64748b", fontSize: "11px", fontWeight: "600" }}>
            DIRECT MESSAGES
          </p>
        </div>

        {/* User List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {users.map(u => (
            <div
              key={u._id}
              onClick={() => handleSelectUser(u)}
              style={{
                padding: "12px 16px", cursor: "pointer",
                background: selectedUser?._id === u._id ? "#0f172a" : "transparent",
                borderLeft: selectedUser?._id === u._id ? "3px solid #22c55e" : "3px solid transparent",
                display: "flex", alignItems: "center", gap: "10px"
              }}>
              {/* Avatar */}
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  background: "#6366f1", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: "700", fontSize: "14px",
                  overflow: "hidden"
                }}>
                  {u.profileImage ? (
                    <img src={u.profileImage} alt={u.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (u.name?.charAt(0).toUpperCase())}
                </div>
                {/* Online Indicator */}
                <div style={{
                  position: "absolute", bottom: "1px", right: "1px",
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: isOnline(u._id) ? "#22c55e" : "#64748b",
                  border: "2px solid #1e293b"
                }} />
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p style={{
                  color: "#f1f5f9", fontSize: "13px", fontWeight: "500",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                }}>{u.name}</p>
                <p style={{ color: isOnline(u._id) ? "#22c55e" : "#64748b", fontSize: "11px" }}>
                  {isOnline(u._id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Chat Area */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: "#0f172a", borderRadius: "0 12px 12px 0",
        border: "1px solid #334155", borderLeft: "none"
      }}>
        {/* Chat Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #334155",
          display: "flex", alignItems: "center", gap: "12px"
        }}>
          {activeTab === "team" ? (
            <>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: "#6366f122", display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                <MdPeople size={22} style={{ color: "#6366f1" }} />
              </div>
              <div>
                <h4 style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: "600" }}>Team Chat</h4>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                  {onlineUsers.length} জন Online
                </p>
              </div>
            </>
          ) : selectedUser ? (
            <>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "#6366f1", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: "700", overflow: "hidden"
                }}>
                  {selectedUser.profileImage ? (
                    <img src={selectedUser.profileImage} alt={selectedUser.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{
                  position: "absolute", bottom: "1px", right: "1px",
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: isOnline(selectedUser._id) ? "#22c55e" : "#64748b",
                  border: "2px solid #0f172a"
                }} />
              </div>
              <div>
                <h4 style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: "600" }}>
                  {selectedUser.name}
                </h4>
                <p style={{ color: isOnline(selectedUser._id) ? "#22c55e" : "#64748b", fontSize: "12px" }}>
                  {isOnline(selectedUser._id) ? "Online" : "Offline"}
                </p>
              </div>
            </>
          ) : (
            <p style={{ color: "#94a3b8" }}>কোনো User বেছে নিন</p>
          )}
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "16px",
          display: "flex", flexDirection: "column", gap: "8px"
        }}>
          {loading ? (
            <p style={{ color: "#94a3b8", textAlign: "center" }}>লোড হচ্ছে...</p>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "60px" }}>
              <p style={{ fontSize: "40px" }}>💬</p>
              <p style={{ color: "#94a3b8", marginTop: "8px" }}>
                এখনো কোনো Message নেই
              </p>
              <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                প্রথম Message পাঠান!
              </p>
            </div>
          ) : messages.map((msg, index) => {
            const isMe = msg.senderId === user._id ||
              msg.senderId?._id === user._id ||
              msg.senderId?.toString() === user._id;

            return (
              <div key={msg._id || index} style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                gap: "8px", alignItems: "flex-end"
              }}>
                {/* Avatar — Other user */}
                {!isMe && (
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "50%",
                    background: "#6366f1", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "12px", fontWeight: "700",
                    flexShrink: 0
                  }}>
                    {msg.senderName?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div style={{ maxWidth: "65%" }}>
                  {/* Sender Name */}
                  {!isMe && activeTab === "team" && (
                    <p style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "2px" }}>
                      {msg.senderName}
                    </p>
                  )}

                  {/* Message Bubble */}
                  <div style={{
                    padding: "10px 14px",
                    background: isMe ? "#6366f1" : "#1e293b",
                    borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    border: isMe ? "none" : "1px solid #334155"
                  }}>
                    <p style={{
                      color: isMe ? "white" : "#f1f5f9",
                      fontSize: "14px", lineHeight: "1.5",
                      wordBreak: "break-word"
                    }}>{msg.message}</p>
                  </div>

                  {/* Time */}
                  <p style={{
                    color: "#64748b", fontSize: "10px",
                    marginTop: "3px",
                    textAlign: isMe ? "right" : "left"
                  }}>
                    {new Date(msg.createdAt).toLocaleTimeString("bn-BD", {
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {getTypingText() && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "50%",
                background: "#334155", display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                <MdPerson size={16} style={{ color: "#94a3b8" }} />
              </div>
              <div style={{
                padding: "8px 14px", background: "#1e293b",
                borderRadius: "16px", border: "1px solid #334155"
              }}>
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                  {getTypingText()}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {(activeTab === "team" || selectedUser) && (
          <div style={{
            padding: "16px", borderTop: "1px solid #334155",
            display: "flex", gap: "10px", alignItems: "flex-end"
          }}>
            <textarea
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder={activeTab === "team" ? "Team কে Message লিখুন..." : `${selectedUser?.name} কে Message লিখুন...`}
              rows={1}
              style={{
                flex: 1, padding: "12px 16px",
                background: "#1e293b", border: "1px solid #334155",
                borderRadius: "12px", color: "#f1f5f9",
                fontSize: "14px", outline: "none",
                resize: "none", lineHeight: "1.5",
                maxHeight: "120px", overflowY: "auto"
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              style={{
                width: "44px", height: "44px",
                background: newMessage.trim() ? "#6366f1" : "#334155",
                border: "none", borderRadius: "12px",
                color: "white", cursor: newMessage.trim() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "background 0.2s"
              }}>
              <MdSend size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}