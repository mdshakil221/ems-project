import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: { type: String, required: true },
  userRole: { type: String, enum: ["admin", "employee"] },
  action: { type: String, required: true },
  category: {
    type: String,
    enum: ["auth", "employee", "task", "leave", "salary", "attendance", "document", "announcement", "holiday", "performance", "notification"],
    default: "auth"
  },
  details: { type: String, default: "" },
  ip: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("ActivityLog", activityLogSchema);