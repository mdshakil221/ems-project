import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import holidayRoutes from "./routes/holidayRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

connectDB();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// ✅ Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://emsprob.netlify.app"],
    methods: ["GET", "POST"]
  }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    onlineUsers.set(userId.toString(), socket.id);
    // ✅ সবাইকে online status জানান
    io.emit("online_users", Array.from(onlineUsers.keys()));
    console.log(`User ${userId} joined, online: ${onlineUsers.size}`);
  });

  // ✅ Private Message
  socket.on("private_message", (data) => {
    const { receiverId, message } = data;

    // ✅ String এ convert করে room এ পাঠাও
    const receiverRoom = receiverId.toString();
    console.log(`Sending to room: ${receiverRoom}`);
    console.log(`Online users:`, Array.from(onlineUsers.keys()));

    io.to(receiverRoom).emit("new_private_message", message);
    console.log(`Private message sent to ${receiverRoom}`);
  });

  // ✅ Team Message
  socket.on("team_message", (data) => {
    io.emit("new_team_message", data.message);
  });

  // ✅ Typing Indicator
  socket.on("typing", (data) => {
    io.to(data.receiverId).emit("user_typing", {
      senderId: data.senderId,
      senderName: data.senderName,
      isTyping: data.isTyping
    });
  });

  // ✅ Team Typing
  socket.on("team_typing", (data) => {
    socket.broadcast.emit("team_user_typing", data);
  });

  socket.on("disconnect", () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
      }
    });
    io.emit("online_users", Array.from(onlineUsers.keys()));
    console.log("Client disconnected:", socket.id);
  });
});

app.use(cors({
  origin: ["http://localhost:5173", "https://emsprob.netlify.app"],
  credentials: true
}));


app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({ message: "EMS Server চলছে! 🚀" });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server Running port ${PORT} এ`));