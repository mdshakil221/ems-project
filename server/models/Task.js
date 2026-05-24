import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  assignedTo: { type: String, required: true },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  dueDate: { type: String },
  note: { type: String, default: "" },
  description: { type: String, default: "" },

  // ✅ Admin এর দেওয়া attachments
  adminAttachments: [{
    filename: { type: String },
    originalName: { type: String },
    size: { type: Number },
    url: { type: String }, // ✅ Cloudinary URL
    uploadedAt: { type: Date, default: Date.now }
  }],

  employeeAttachments: [{
    filename: { type: String },
    originalName: { type: String },
    size: { type: Number },
    url: { type: String }, // ✅ Cloudinary URL
    uploadedAt: { type: Date, default: Date.now }
  }],

}, { timestamps: true });

export default mongoose.model("Task", taskSchema);