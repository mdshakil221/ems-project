import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  type: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  days: { type: Number },
  reason: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Leave", leaveSchema);