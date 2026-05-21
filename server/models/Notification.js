import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "task", "task_completed", "employee",
      "leave", "password_change", "salary", "performance"
    ],
    default: "task"
  },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);