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

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined`);
  });
  socket.on("disconnect", () => {
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

app.get("/", (req, res) => {
  res.json({ message: "EMS Server চলছে! 🚀" });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server Running port ${PORT} এ`));