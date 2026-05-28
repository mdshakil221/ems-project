import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ["admin", "employee"] },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverName: { type: String },
  message: { type: String, default: "" },
  type: { type: String, enum: ["private", "team"], default: "private" },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // ✅ File attachment
  attachment: {
    url: { type: String },
    publicId: { type: String },
    originalName: { type: String },
    fileType: { type: String }, // image | pdf | doc | other
    size: { type: Number }
  },
  // ✅ NEW
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  isDeletedForEveryone: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);