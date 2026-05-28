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
  const selectedUserRef = useRef(null);
  const activeTabRef = useRef("team");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

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

    // ✅ এটা করো
    socket.on("new_team_message", (message) => {
      if (activeTabRef.current === "team") {  // ← ref ব্যবহার করো
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on("new_private_message", (message) => {
      setMessages(prev => {
        if (activeTabRef.current === "private" && selectedUserRef.current) {
          const senderId = message.senderId?._id || message.senderId;
          const receiverId = message.receiverId?._id || message.receiverId;
          const currentUserId = user._id;
          const selectedUserId = selectedUserRef.current._id;

          const isMatch =
            (senderId?.toString() === selectedUserId?.toString() &&
              receiverId?.toString() === currentUserId?.toString()) ||
            (senderId?.toString() === currentUserId?.toString() &&
              receiverId?.toString() === selectedUserId?.toString());

          if (isMatch) {
            return [...prev, message];
          }
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

  // ✅ selectedUser change হলে ref update করো
  const handleSelectUser = (u) => {
    setSelectedUser(u);
    selectedUserRef.current = u;  // ← যোগ করো
    setActiveTab("private");
    activeTabRef.current = "private";  // ← যোগ করো
    setMessages([]);
    fetchPrivateMessages(u._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    try {
      setSending(true);

      // ✅ FormData ব্যবহার করুন
      const formData = new FormData();
      formData.append("type", activeTab === "team" ? "team" : "private");
      if (newMessage.trim()) formData.append("message", newMessage);
      if (activeTab === "private" && selectedUser) {
        formData.append("receiverId", selectedUser._id);
        formData.append("receiverName", selectedUser.name);
      }
      if (selectedFile) formData.append("file", selectedFile);

      const { data } = await API.post("/chat/send", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessages(prev => [...prev, data]);
      setNewMessage("");
      setSelectedFile(null);
      setFilePreview(null);

      if (activeTab === "team") {
        socket?.emit("team_message", { message: data });
      } else {
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

  // ✅ setActiveTab এর জায়গায় এটা করো
  const handleTeamChat = () => {
    setActiveTab("team");
    activeTabRef.current = "team";  // ← যোগ করো
    setSelectedUser(null);
    selectedUserRef.current = null;  // ← যোগ করো
    fetchTeamMessages();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ 10MB check
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ফাইল সর্বোচ্চ 10MB হতে পারবে!");
      return;
    }

    setSelectedFile(file);

    // ✅ Image preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {

      await API.put(`/chat/delete-for-me/${messageId}`);

      setMessages(prev =>
        prev.filter(msg => msg._id !== messageId)
      );

      toast.success("Message deleted");

    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {

      await API.put(`/chat/delete-for-everyone/${messageId}`);

      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? {
              ...msg,
              isDeletedForEveryone: true
            }
            : msg
        )
      );

      toast.success("Message deleted for everyone");

    } catch (error) {
      toast.error("Delete failed");
    }
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
          onClick={handleTeamChat}
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
                    border: isMe ? "none" : "1px solid #334155",
                    maxWidth: "300px"
                  }}>
                    {/* Delete Actions */}
                    {isMe && !msg.isDeletedForEveryone && (
                      <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                        marginBottom: "6px"
                      }}>

                        <button
                          onClick={() => handleDeleteForMe(msg._id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#94a3b8",
                            fontSize: "11px",
                            cursor: "pointer"
                          }}
                        >
                          Delete For Me
                        </button>

                        <button
                          onClick={() => handleDeleteForEveryone(msg._id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            fontSize: "11px",
                            cursor: "pointer"
                          }}
                        >
                          Delete For Everyone
                        </button>

                      </div>
                    )}

                    <div style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: "4px"
                    }}>
                    </div>

                    {/* ✅ Attachment */}
                    {msg.attachment && (
                      <div style={{ marginBottom: msg.message ? "8px" : "0" }}>
                        {msg.attachment.fileType === "image" ? (
                          // ✅ Image Preview
                          <img
                            src={msg.attachment.url}
                            alt={msg.attachment.originalName}
                            style={{
                              maxWidth: "100%", borderRadius: "8px",
                              cursor: "pointer", display: "block"
                            }}
                            onClick={() => window.open(msg.attachment.url, "_blank")}
                          />
                        ) : (
                          // ✅ File Download

                          <a href={msg.attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "flex", alignItems: "center", gap: "8px",
                              padding: "8px 12px",
                              background: isMe ? "#ffffff22" : "#0f172a",
                              borderRadius: "8px", textDecoration: "none",
                              border: `1px solid ${isMe ? "#ffffff33" : "#334155"}`
                            }}>
                            <span style={{ fontSize: "20px" }}>
                              {msg.attachment.fileType === "pdf" ? "📄" :
                                msg.attachment.fileType === "doc" ? "📝" : "📎"}
                            </span>
                            <div>
                              <p style={{
                                color: isMe ? "white" : "#f1f5f9",
                                fontSize: "12px", fontWeight: "600",
                                overflow: "hidden", textOverflow: "ellipsis",
                                whiteSpace: "nowrap", maxWidth: "180px"
                              }}>
                                {msg.attachment.originalName}
                              </p>
                              <p style={{ color: isMe ? "#ffffff88" : "#64748b", fontSize: "11px" }}>
                                {msg.attachment.size
                                  ? `${(msg.attachment.size / 1024).toFixed(1)} KB`
                                  : ""}
                              </p>
                            </div>
                            <span style={{ color: isMe ? "white" : "#6366f1", fontSize: "16px" }}>⬇️</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Message Text */}
                    {msg?.isDeletedForEveryone ? (

                      <p style={{
                        color: "#94a3b8",
                        fontStyle: "italic",
                        fontSize: "13px"
                      }}>
                        🚫 This message was deleted
                      </p>

                    ) : (
                      <>
                        {msg.message && (
                          <p style={{
                            color: isMe ? "white" : "#f1f5f9",
                            fontSize: "14px",
                            lineHeight: "1.5",
                            wordBreak: "break-word"
                          }}>
                            {msg.message}
                          </p>
                        )}
                      </>
                    )}
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
          <div style={{ padding: "16px", borderTop: "1px solid #334155" }}>

            {/* ✅ File Preview */}
            {selectedFile && (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", background: "#1e293b",
                borderRadius: "8px", marginBottom: "10px",
                border: "1px solid #334155"
              }}>
                {filePreview ? (
                  <img src={filePreview} alt="preview"
                    style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "24px" }}>
                    {selectedFile.name.endsWith(".pdf") ? "📄" :
                      selectedFile.name.endsWith(".doc") || selectedFile.name.endsWith(".docx") ? "📝" : "📎"}
                  </span>
                )}
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{
                    color: "#f1f5f9", fontSize: "13px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>{selectedFile.name}</p>
                  <p style={{ color: "#94a3b8", fontSize: "11px" }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                {/* ✅ Remove File */}
                <button
                  onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                  style={{
                    background: "#ef444422", border: "none", borderRadius: "6px",
                    color: "#ef4444", cursor: "pointer", padding: "4px 8px",
                    fontSize: "12px"
                  }}>✕</button>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
              {/* ✅ File Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.xlsx,.zip"
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "44px", height: "44px",
                  background: selectedFile ? "#6366f122" : "#1e293b",
                  border: `1px solid ${selectedFile ? "#6366f1" : "#334155"}`,
                  borderRadius: "12px", color: selectedFile ? "#6366f1" : "#94a3b8",
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: "20px"
                }}>
                📎
              </button>

              {/* Text Input */}
              <textarea
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={handleKeyPress}
                placeholder={activeTab === "team"
                  ? "Team কে Message লিখুন..."
                  : `${selectedUser?.name} কে Message লিখুন...`}
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

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={sending || (!newMessage.trim() && !selectedFile)}
                style={{
                  width: "44px", height: "44px",
                  background: (newMessage.trim() || selectedFile) ? "#6366f1" : "#334155",
                  border: "none", borderRadius: "12px",
                  color: "white",
                  cursor: (newMessage.trim() || selectedFile) ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                <MdSend size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}