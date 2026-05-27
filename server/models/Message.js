import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ["admin", "employee"] },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null = team chat
  receiverName: { type: String },
  message: { type: String, required: true },
  type: { type: String, enum: ["private", "team"], default: "private" },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);